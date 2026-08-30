// Automatic timetabling. A PURE module: knows nothing about React, the DOM or
// localStorage, and every exported function has a test (solver.test.ts).
//
// NO WEB WORKER, on purpose (docs/PLAN.md pitfall 19). The build is one HTML
// file opened over file://: Vite emits a worker as a SEPARATE chunk, which
// breaks the single-file promise, and the blob fallback runs from an opaque
// origin where Chromium's behaviour is not something to bet a father's evening
// on. So the search runs on the main thread in SLICES: `step(sliceMs)` returns
// after a few milliseconds, the caller repaints, and "Durdur" always answers.
//
// The constraint engine is NOT re-implemented here. Every legality question
// goes to `blocker()` in constraints.ts — the same function the drag uses — so
// a rule can never mean one thing when dragged and another when generated.

import {
  blocker,
  buildIndex,
  check,
  occupy,
  pendingBlocks,
  // Aliased: `placedBlocks` is also this file's counter for how many blocks the
  // SEARCH has put down, and the two mean different things.
  placedBlocks as blocksOnGrid,
  vacate,
} from './constraints';
import { t } from './i18n';
import type { Index, PlacedBlock } from './constraints';
import { commonestBlock, lessonName } from './feasibility';
import { lessonLimit, limitFor, ruleActive, ruleLevel } from './rules';
import { activePinned, activePlacements, replaceActiveGrid } from './programs';
import type { Id, Lesson, State } from './types';
import { lessonExcluded } from './programMask';
import type { SolverExclusions } from './programMask';

export interface SolverOptions {
  /** Keep what is already on the grid and fill in around it (default true). */
  keepPlaced: boolean;
  /** How long the search may WORK, in milliseconds. Slices are summed. */
  budgetMs: number;
  /** Session-only rows/days that this run must leave untouched. */
  exclusions: SolverExclusions;
}

const DEFAULTS: SolverOptions = {
  keepPlaced: true,
  budgetMs: 15_000,
  exclusions: { teacherIds: [], classIds: [], dayNames: [] },
};

/**
 * How many nodes may pass without the grid getting any better before the search
 * gives up on one lesson (see `sinceGain`). A node count, not a stopwatch: the
 * same input has to produce the same timetable on any machine.
 */
const STALL_LIMIT = 20_000;

export type SolverPhase = 'solved' | 'stuck' | 'cancelled';

export interface StuckLesson {
  lessonId: Id;
  /** "412 — AV Fizik" */
  name: string;
  /** Hours still unplaced. */
  missing: number;
  /**
   * Why. Normally blocker()'s own commonest sentence; for a lesson that asks
   * for more hours than the week can hold, the ceiling itself — "the class is
   * busy" would send the reader hunting for something to move, and there is
   * nothing to move.
   */
  reason: string;
}

export interface SolverProgress {
  placedBlocks: number;
  totalBlocks: number;
  nodes: number;
  elapsedMs: number;
  excludedBlocks: number;
}

export interface SolverResult extends SolverProgress {
  phase: SolverPhase;
  /**
   * The state to hand to `change()`. When nothing at all was placed this is
   * `base` ITSELF, by reference — the store drops a change that returns the
   * same object, so a fruitless run does not push an undo step.
   */
  state: State;
  stuck: StuckLesson[];
}

export interface Solver {
  /** Works for at most `sliceMs`. Returns null while still searching. */
  step(sliceMs: number): SolverResult | null;
  progress(): SolverProgress;
  /** Stops now and returns the best assignment found so far. */
  cancel(): SolverResult;
}

// ------------------------------------------------------------------ internals

/**
 * One lesson's blocks OF ONE LENGTH that still need putting down.
 *
 * Not one item per lesson: a lesson can want 4+3+2+1, and the search's whole
 * shape — a domain of legal start cells, an MRV count, a forward-checking
 * bound — assumes every block it is holding is the same length. So a 2+2+1
 * lesson becomes two items, one asking for two 2s and one asking for a single,
 * and at most four items cover every split there is. They share a class, so
 * `neighbours` already makes each the other's neighbour and the grid keeps
 * them apart the same way it keeps any two lessons apart.
 */
interface Item {
  lesson: Lesson;
  roomId: Id | null;
  /** How long each of THIS item's blocks is: 1, 2, 3 or 4. */
  block: number;
  /** Blocks still to place — never more than the week can hold. */
  need: number;
  /** Blocks the lesson actually asked for, before that ceiling. */
  askedBlocks: number;
  /** Blocks placed by THIS run. */
  done: number;
  /** Blocks of this length the lesson already had on the starting grid. */
  doneAtStart: number;
  /** Hours this LESSON already had on the starting grid. */
  placedAtStart: number;
  /** cell -> 1 while the cell is still a candidate. */
  domain: Uint8Array;
  size: number;
  /** Item indices sharing this lesson's teacher, class or room. */
  neighbours: number[];
  /**
   * Given up on. One lesson with nowhere to go must not cost the other 98:
   * the whole point of the "stuck" report is that it is read off a grid that
   * IS otherwise laid out.
   */
  abandoned: boolean;
}

/** A domain entry taken away by an assignment, so it can be handed back. */
interface TrailEntry {
  item: number;
  cell: number;
}

interface Frame {
  item: number;
  candidates: number[];
  next: number;
  /** The cell currently applied, or -1 before the first candidate is tried. */
  applied: number;
  trailMark: number;
}

/**
 * Do any of the four limit rules actually bite?
 *
 * It decides how wide a window has to be re-checked after each assignment. With
 * the rules off — the school's default, since a wrong limit silently paints
 * cells red — a placement can only affect the hours its own block touches. With
 * them on it can affect the whole day, because the counters are per day.
 */
function rulesBite(d: State): boolean {
  if (
    d.teachers.some(
      (t) =>
        ruleActive(d, 'maxConsecutive', limitFor(d, t, 'maxConsecutive')) ||
        ruleActive(d, 'maxPerDay', limitFor(d, t, 'maxPerDay')),
    )
  ) {
    return true;
  }
  return d.lessons.some((x) => ruleActive(d, 'maxSameLessonPerDay', lessonLimit(d, x)));
}

/** Is any rule set to "Uyar"? Only then is it worth preferring warning-free cells. */
function warningsPossible(d: State): boolean {
  const warned = (['maxConsecutive', 'maxPerDay', 'maxSameLessonPerDay'] as const).some(
    (name) => ruleLevel(d, name) === 'warn',
  );
  return warned && rulesBite(d);
}

/** Just the cells the reader pinned, with the lessons that are in them. */
function preservedPlacements(base: State, exclusions: SolverExclusions): Record<string, Id> {
  const out: Record<string, Id> = {};
  const placements = activePlacements(base);
  for (const key in activePinned(base)) {
    const lessonId = placements[key];
    if (lessonId !== undefined) out[key] = lessonId;
  }
  const excludedDays = new Set(exclusions.dayNames);
  const lessons = new Map(base.lessons.map((lesson) => [lesson.id, lesson]));
  for (const [key, lessonId] of Object.entries(placements)) {
    const lesson = lessons.get(lessonId);
    const day = Number(key.split('|')[1]);
    const dayName = base.settings.days[day]?.name;
    if (
      lesson !== undefined &&
      (lessonExcluded(lesson, exclusions) || (dayName !== undefined && excludedDays.has(dayName)))
    ) {
      out[key] = lessonId;
    }
  }
  return out;
}

export function createSolver(base: State, options?: Partial<SolverOptions>): Solver {
  const opts: SolverOptions = { ...DEFAULTS, ...options };
  const excludedDays = new Set(opts.exclusions.dayNames);
  const isExcludedDay = (day: number) => {
    const name = base.settings.days[day]?.name;
    return name !== undefined && excludedDays.has(name);
  };

  const dayCount = base.settings.days.length;
  const hourCount = base.settings.hours.length;
  const cellCount = dayCount * hourCount;

  // ONE mutable dictionary and ONE index for the whole search. `work` shares
  // the dictionary object, so blocker() sees every assignment immediately.
  // A clean sheet still keeps the PINNED cells. "Baştan diz" means "throw away
  // the timetable you built", not "throw away the decisions I made by hand" —
  // and the rest of the search needs no telling: `work` shares this dictionary,
  // so `placedHours`, `placedBlocks` and `pendingBlocks` below all count the
  // pinned blocks as already down, and `retract()` only ever vacates a cell
  // this search itself filled.
  const placements: Record<string, Id> = opts.keepPlaced
    ? { ...activePlacements(base) }
    : preservedPlacements(base, opts.exclusions);
  const work: State = replaceActiveGrid(base, { placements });
  let ix: Index = buildIndex(work);

  const wideWindow = rulesBite(base);
  const preferNoWarning = warningsPossible(base);

  // ---- the items -----------------------------------------------------------
  const items: Item[] = [];
  for (const lesson of base.lessons) {
    if (lessonExcluded(lesson, opts.exclusions)) continue;
    const already = ix.placedHours.get(lesson.id) ?? 0;
    const down = blocksOnGrid(work, lesson);
    // The blocks still owed, read off the grid rather than divided out of the
    // hours. `Math.floor(hours / block)` was what threw away the odd hour of a
    // 5-hour lesson in 2-hour blocks; there is no remainder to throw away now
    // because the split says what the last block is.
    const owed = pendingBlocks(work, lesson);
    for (const block of [4, 3, 2, 1]) {
      const need = owed.filter((x) => x === block).length;
      if (need <= 0) continue;
      items.push({
        lesson,
        roomId: ix.classById.get(lesson.classId)?.roomId ?? null,
        block,
        need,
        askedBlocks: need,
        done: 0,
        doneAtStart: down.filter((x) => x.size === block).length,
        placedAtStart: already,
        domain: new Uint8Array(cellCount),
        size: 0,
        neighbours: [],
        abandoned: false,
      });
    }
  }

  const totalBlocks = items.reduce((sum, x) => sum + x.need, 0);
  const excludedBlocks = base.lessons.reduce((sum, lesson) => {
    if (lessonExcluded(lesson, opts.exclusions)) return sum + pendingBlocks(base, lesson).length;
    return sum + blocksOnGrid(base, lesson).filter((block) => isExcludedDay(block.day)).length;
  }, 0);

  // Neighbours: an assignment can only ever narrow a lesson that shares a
  // teacher, a class or a room with it. ~25 of 99 lessons, not all of them.
  for (let a = 0; a < items.length; a++) {
    const one = items[a]!;
    for (let b = 0; b < items.length; b++) {
      const two = items[b]!;
      if (
        one.lesson.teacherId === two.lesson.teacherId ||
        one.lesson.classId === two.lesson.classId ||
        (one.roomId != null && one.roomId === two.roomId)
      ) {
        one.neighbours.push(b);
      }
    }
  }

  const maxBlock = items.reduce((m, x) => Math.max(m, x.block), 1);

  /** (Re)computes one item's candidate cells against the grid as it stands. */
  function fillDomain(item: Item): void {
    item.domain.fill(0);
    item.size = 0;
    for (let cell = 0; cell < cellCount; cell++) {
      const day = Math.floor(cell / hourCount);
      const hour = cell % hourCount;
      if (isExcludedDay(day)) continue;
      if (blocker(work, ix, item.lesson.id, day, hour, item.block) === null) {
        item.domain[cell] = 1;
        item.size++;
      }
    }
  }

  /**
   * The most HOURS this lesson could EVER place with the week to itself.
   *
   * Its own cells, packed greedily day by day, and then capped by "aynı ders
   * günde en fazla N saat" where that rule blocks. Asking for more than this is
   * not a hard search, it is an impossible one: no assignment anywhere else can
   * raise the number.
   *
   * In HOURS and per LESSON rather than in blocks and per item, because a
   * 4+2+1 lesson is three items competing for the same cells and the same daily
   * limit: capping each of them on its own would let the others between them
   * claim a day twice over.
   */
  function ceilingHours(list: Item[]): number {
    const lesson = list[0]!.lesson;
    const limit = lessonLimit(base, lesson);
    const perDay =
      ruleLevel(base, 'maxSameLessonPerDay') === 'block' && limit > 0 ? limit : Infinity;

    // Longest first, and one counter per length rather than one for doubles:
    // a lesson can now be 4+3+2+1 and each of those is its own item competing
    // for the same cells and the same daily limit.
    const order = [...list].sort((a, b) => b.block - a.block);
    const left = new Map<Item, number>(order.map((x) => [x, x.need]));

    let total = 0;
    for (let day = 0; day < dayCount; day++) {
      let onDay = 0;
      // Earliest-start packing, biggest first — the same order the split itself
      // is written in, and the one that leaves the singles the easy job.
      for (let h = 0; h < hourCount; ) {
        const cell = day * hourCount + h;
        let took = 0;
        for (const item of order) {
          if ((left.get(item) ?? 0) <= 0) continue;
          if (item.domain[cell] !== 1) continue;
          if (onDay + item.block > perDay) continue;
          left.set(item, (left.get(item) ?? 0) - 1);
          total += item.block;
          onDay += item.block;
          took = item.block;
          break;
        }
        h += took > 0 ? took : 1;
      }
    }
    return total;
  }

  // ---- initial domains -----------------------------------------------------
  for (const item of items) fillDomain(item);

  const itemsByLesson = new Map<Id, Item[]>();
  for (const item of items) {
    const list = itemsByLesson.get(item.lesson.id);
    if (list === undefined) itemsByLesson.set(item.lesson.id, [item]);
    else list.push(item);
  }

  for (const list of itemsByLesson.values()) {
    // Ask for no more than the week can hold. Without this the search spends
    // its whole budget on a lesson it can never finish: MRV keeps choosing it
    // (its domain is the smallest), it fills every day it is allowed, forward
    // checking finds 0 cells for the blocks still owed, and the branch dies —
    // for every cell of every lesson above it. MEASURED in
    // `gercek-olcek-kurali`: 3 blocks of 359 placed, the rest of the budget
    // spent re-proving that one lesson wants 8 hours and can hold 4.
    //
    // The blocks it CAN hold are still placed. Giving up on the lesson whole
    // would trade a partly-taught class for a tidier number; `report()` reads
    // what is missing off the grid, so the count stays honest either way.
    //
    // The room is handed out biggest first, because that is the order the split
    // is written in: a week that can only hold four of a five-hour lesson keeps
    // 2+2 and drops the single, not the other way round.
    let room = ceilingHours(list);
    for (const item of [...list].sort((a, b) => b.block - a.block)) {
      item.need = Math.min(item.need, Math.floor(room / item.block));
      room -= item.need * item.block;
      if (item.need <= 0) item.abandoned = true;
    }
  }

  const trail: TrailEntry[] = [];
  const stack: Frame[] = [];

  let placedBlocks = 0;
  /**
   * Blocks still considered reachable: every block of a live lesson, and of a
   * lesson given up on only the ones already on the grid.
   */
  let placeableBlocks = 0;
  function countPlaceable(): void {
    placeableBlocks = items.reduce((sum, x) => sum + (x.abandoned ? x.done : x.need), 0);
  }
  countPlaceable();
  let nodes = 0;
  let elapsedMs = 0;
  let finished: SolverResult | null = null;

  // The deepest assignment reached. Chronological backtracking can end up
  // shallower than it once was, and "I gave up" must return the best it saw,
  // not wherever the clock happened to stop it.
  let bestBlocks = 0;
  let bestPlacements: Record<string, Id> = { ...placements };

  /**
   * The lesson that most recently ran out of room. When the search exhausts,
   * THIS is the one to give up on — not whichever lesson sits at the bottom of
   * the stack, which is merely the one MRV opened with.
   */
  let culprit = -1;

  /**
   * Nodes spent since the grid last got better.
   *
   * Chronological backtracking can spend any number of them re-proving the same
   * conflict two levels down, and on a school-sized grid "any number" means the
   * whole budget. MEASURED longest fruitless stretch: 17 nodes in
   * `kural-baskisi`, 171 in `erken-saat-tuzagi`, 8 059 in `derin-geri-sarma` —
   * all three still solve completely. The worlds that never finish spend
   * 91 551, 317 395 and 2 890 411. The limit below sits between the two groups
   * with room to spare; past it, one lesson is given up on and the search
   * carries on from the best grid instead of chasing the same wall.
   */
  let sinceGain = 0;

  function remember() {
    if (placedBlocks <= bestBlocks) return;
    sinceGain = 0;
    bestBlocks = placedBlocks;
    bestPlacements = { ...placements };
  }

  /** Removes cells that this assignment just made illegal. False = dead end. */
  function revise(day: number, hour: number, block: number, item: Item): boolean {
    const from = wideWindow ? 0 : Math.max(0, hour - maxBlock + 1);
    const to = wideWindow ? hourCount - 1 : Math.min(hourCount - 1, hour + block - 1);

    for (const n of item.neighbours) {
      const other = items[n]!;
      if (other.abandoned || other.done >= other.need) continue;

      for (let h = from; h <= to; h++) {
        const cell = day * hourCount + h;
        if (other.domain[cell] !== 1) continue;
        if (blocker(work, ix, other.lesson.id, day, h, other.block) === null) continue;
        other.domain[cell] = 0;
        other.size--;
        trail.push({ item: n, cell });
      }

      // Forward checking: each remaining block needs a start cell of its own.
      if (other.size < other.need - other.done) {
        culprit = n;
        return false;
      }
    }
    return true;
  }

  function undoTrail(mark: number) {
    while (trail.length > mark) {
      const entry = trail.pop()!;
      const other = items[entry.item]!;
      other.domain[entry.cell] = 1;
      other.size++;
    }
  }

  /** MRV: the lesson with the fewest places left to go. -1 = everything placed. */
  function pick(): number {
    let best = -1;
    let bestSize = Infinity;
    let bestLeft = -1;
    let bestBlock = -1;

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      if (item.abandoned) continue;
      const left = item.need - item.done;
      if (left <= 0) continue;
      const block = item.block;
      if (
        item.size < bestSize ||
        (item.size === bestSize && left > bestLeft) ||
        (item.size === bestSize && left === bestLeft && block > bestBlock)
      ) {
        best = i;
        bestSize = item.size;
        bestLeft = left;
        bestBlock = block;
      }
    }
    return best;
  }

  /**
   * The order to try cells in, best first:
   *   1. days where this CLASS has least of this lesson already — spread the
   *      week rather than stacking six hours of maths on Tuesday
   *   2. days where the TEACHER is least loaded
   *   3. cells that break no "Uyar" rule (only computed when one is set)
   *   4. earlier hours: the school day starts at 09:00 and fills downward
   */
  function order(item: Item): number[] {
    const classOnDay = new Array<number>(dayCount).fill(0);
    const teacherOnDay = new Array<number>(dayCount).fill(0);
    for (let g = 0; g < dayCount; g++) {
      for (let s = 0; s < hourCount; s++) {
        if (placements[`${item.lesson.classId}|${g}|${s}`] === item.lesson.id) classOnDay[g]!++;
        if (ix.teacherBusy.has(`${item.lesson.teacherId}|${g}|${s}`)) teacherOnDay[g]!++;
      }
    }

    const out: number[] = [];
    for (let cell = 0; cell < cellCount; cell++) {
      if (item.domain[cell] === 1) out.push(cell);
    }

    const warn = new Map<number, number>();
    if (preferNoWarning) {
      for (const cell of out) {
        const verdict = check(work, ix, item.lesson.id, Math.floor(cell / hourCount), cell % hourCount);
        warn.set(cell, verdict.warning === null ? 0 : 1);
      }
    }

    out.sort((a, b) => {
      const da = Math.floor(a / hourCount);
      const db = Math.floor(b / hourCount);
      return (
        classOnDay[da]! - classOnDay[db]! ||
        teacherOnDay[da]! - teacherOnDay[db]! ||
        (warn.get(a) ?? 0) - (warn.get(b) ?? 0) ||
        a - b
      );
    });
    return out;
  }

  function assign(frame: Frame, cell: number): boolean {
    const item = items[frame.item]!;
    const day = Math.floor(cell / hourCount);
    const hour = cell % hourCount;

    // The domain was computed before earlier assignments in this branch; a
    // stale cell is simply skipped rather than trusted.
    if (blocker(work, ix, item.lesson.id, day, hour, item.block) !== null) return false;

    occupy(placements, ix, item.lesson, item.roomId, day, hour, item.block);
    item.done++;
    placedBlocks++;
    frame.applied = cell;

    if (!revise(day, hour, item.block, item)) {
      retract(frame);
      return false;
    }
    remember();
    return true;
  }

  function retract(frame: Frame) {
    if (frame.applied < 0) return;
    const item = items[frame.item]!;
    const day = Math.floor(frame.applied / hourCount);
    const hour = frame.applied % hourCount;
    vacate(placements, ix, item.lesson, item.roomId, day, hour, item.block);
    item.done--;
    placedBlocks--;
    frame.applied = -1;
    undoTrail(frame.trailMark);
  }

  /**
   * Gives up on ONE lesson and carries on FROM THE BEST GRID FOUND SO FAR.
   *
   * Starting over from the base grid instead is what turned one impossible
   * lesson into an empty timetable: reaching an empty stack means every
   * assignment has just been rolled back, so the next attempt began at zero and
   * had to re-earn everything — 99 lessons, 99 full searches, and the budget
   * gone. Freezing the best grid makes progress monotone: what was placed stays
   * placed, and only the lessons still missing are searched for again.
   *
   * Completeness is traded away knowingly. This is a 15-second heuristic whose
   * product is "a grid that is laid out, plus an honest list of what would not
   * fit" — never a proof that no perfect timetable exists.
   *
   * Returns false when nothing reachable is left to search for.
   */
  function reseed(fallback: number): boolean {
    const live = (i: number): boolean => {
      const item = items[i];
      return item !== undefined && !item.abandoned && item.done < item.need;
    };
    const dead = live(culprit)
      ? culprit
      : live(fallback)
        ? fallback
        : items.findIndex((_, i) => live(i));
    if (dead < 0) return false;

    items[dead]!.abandoned = true;
    culprit = -1;
    sinceGain = 0;

    // The best grid becomes the new floor. `placements` is mutated in place
    // because `work` shares the object with blocker() and occupy()/vacate().
    for (const key of Object.keys(placements)) delete placements[key];
    Object.assign(placements, bestPlacements);
    ix = buildIndex(work);

    trail.length = 0;
    stack.length = 0;

    // `done` is COUNTED off the frozen grid, not divided out of the hours: two
    // items share one lesson's hour count, so the hours cannot say which of
    // them put a block down. `blocksOnGrid()` reads the same blocks the grid
    // and the pool read (see the contract in constraints.ts).
    const downNow = new Map<Id, PlacedBlock[]>();
    for (const item of items) {
      let down = downNow.get(item.lesson.id);
      if (down === undefined) {
        down = blocksOnGrid(work, item.lesson);
        downNow.set(item.lesson.id, down);
      }
      item.done = down.filter((x) => x.size === item.block).length - item.doneAtStart;
      if (!item.abandoned) fillDomain(item);
    }
    placedBlocks = items.reduce((sum, x) => sum + x.done, 0);
    countPlaceable();
    return placeableBlocks > placedBlocks;
  }

  function report(phase: SolverPhase): SolverResult {
    const best = bestPlacements;
    const basePlacements = activePlacements(base);
    const changed = Object.keys(best).length !== Object.keys(basePlacements).length ||
      Object.keys(best).some((k) => basePlacements[k] !== best[k]);
    const state: State = changed ? replaceActiveGrid(base, { placements: best }) : base;

    // The stuck report is read off the BEST assignment, not off wherever the
    // search stopped — that is the grid the user is about to look at.
    const finalIx = buildIndex(state);
    const stuck: StuckLesson[] = [];
    for (const lesson of base.lessons) {
      if (lessonExcluded(lesson, opts.exclusions)) continue;
      const missing = lesson.weeklyHours - (finalIx.placedHours.get(lesson.id) ?? 0);
      if (missing <= 0) continue;
      // Which sentence tells the reader what to DO about it?
      //
      // When nothing fits at all, blocker() names the wall itself — "AV Salı 1
      // saatinde müsait değil", "en fazla 1 saat görmeli — burada 2 saat olur" —
      // and that is as concrete as it gets. When SOME of the lesson fits, the
      // grid ends up full of its own blocks and blocker() then reports "the
      // class is busy", which reads like a clash somebody could shuffle away.
      // There is nothing to shuffle: the week cannot hold the rest.
      const list = itemsByLesson.get(lesson.id) ?? [];
      const fits =
        list.length === 0
          ? 0
          : list.reduce((sum, x) => sum + x.need * x.block, 0) + list[0]!.placedAtStart;
      const capped = list.some((x) => x.askedBlocks > x.need) && fits > 0;

      stuck.push({
        lessonId: lesson.id,
        name: lessonName(finalIx, lesson.id),
        missing,
        reason: capped
          ? t(
              'haftada {istenen} saat isteniyor, açık saatler ve kurallar en fazla {olabilen} saat veriyor',
              { istenen: lesson.weeklyHours, olabilen: fits },
            )
          : commonestBlock(state, finalIx, lesson.id).reason,
      });
    }
    stuck.sort((a, b) => b.missing - a.missing || a.name.localeCompare(b.name, 'tr'));

    // `phase` used to be handed straight back, so a run that placed every BLOCK
    // it counted said 'solved' while `stuck` listed the hours a block size could
    // not divide (5 hours in 2-hour blocks). Nothing is solved while something
    // is missing.
    const truth: SolverPhase =
      stuck.length === 0 ? 'solved' : phase === 'cancelled' ? 'cancelled' : 'stuck';

    return {
      phase: truth,
      state,
      placedBlocks: bestBlocks,
      totalBlocks,
      nodes,
      elapsedMs,
      excludedBlocks,
      stuck,
    };
  }

  return {
    step(sliceMs: number): SolverResult | null {
      if (finished !== null) return finished;
      const t0 = performance.now();
      const stop = (phase: SolverPhase | null): SolverResult | null => {
        elapsedMs += performance.now() - t0;
        if (phase === null) return null;
        finished = report(phase);
        return finished;
      };

      for (;;) {
        if (placedBlocks === placeableBlocks) {
          remember();
          return stop(placedBlocks === totalBlocks ? 'solved' : 'stuck');
        }

        if (performance.now() - t0 >= sliceMs) return stop(null);
        if (elapsedMs + (performance.now() - t0) >= opts.budgetMs) return stop('stuck');

        nodes++;
        sinceGain++;
        if (sinceGain > STALL_LIMIT) {
          if (!reseed(stack[stack.length - 1]?.item ?? -1)) return stop('stuck');
          continue;
        }

        // Advance the top frame, or open a new one.
        let frame = stack[stack.length - 1];
        if (frame === undefined || frame.applied >= 0) {
          const next = pick();
          // Cannot happen: the loop head already handled "everything placed".
          // Bailing out beats spinning if the counters ever disagree.
          if (next < 0) return stop('stuck');
          const item = items[next]!;
          frame = {
            item: next,
            candidates: order(item),
            next: 0,
            applied: -1,
            trailMark: trail.length,
          };
          stack.push(frame);
        }

        retract(frame);

        let moved = false;
        while (frame.next < frame.candidates.length) {
          const cell = frame.candidates[frame.next]!;
          frame.next++;
          frame.trailMark = trail.length;
          if (assign(frame, cell)) {
            moved = true;
            break;
          }
        }

        if (!moved) {
          // Out of candidates here: drop this frame and let the one below it
          // try its next cell.
          stack.pop();
          remember();
          if (stack.length === 0) {
            // Nothing left to back up into: the whole tree is exhausted. Give
            // up on ONE lesson, not on the timetable — the others still deserve
            // their places, and the report is only useful next to a grid that
            // is otherwise full.
            if (!reseed(frame.item)) return stop('stuck');
            continue;
          }
          // A frame that failed INSIDE a real context is a better suspect than
          // the root one; the root's own failure must not overwrite it, which
          // is why this sits after the empty-stack branch.
          culprit = frame.item;
          retract(stack[stack.length - 1]!);
        }
      }
    },

    progress(): SolverProgress {
      return { placedBlocks, totalBlocks, nodes, elapsedMs, excludedBlocks };
    },

    cancel(): SolverResult {
      if (finished === null) finished = report('cancelled');
      return finished;
    },
  };
}

/** Runs to completion in one go. For tests and for very small worlds. */
export function solve(base: State, options?: Partial<SolverOptions>): SolverResult {
  const solver = createSolver(base, options);
  for (;;) {
    const result = solver.step(50);
    if (result !== null) return result;
  }
}
