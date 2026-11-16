// Automatic timetabling. A PURE module: knows nothing about React, the DOM or
// localStorage, and every exported function has a test (solver.test.ts).
//
// NO WEB WORKER, on purpose (docs/TRAPS.md pitfall 19). The build is one HTML
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
  pendingBlocks, // Aliased: `placedBlocks` is also this file's counter for how many blocks the
  // SEARCH has put down, and the two mean different things.
  placedBlocks as blocksOnGrid,
  vacate,
  type Index,
  lessonLimit,
  limitFor,
  ruleActive,
  ruleLevel,
} from '../constraints';
import { t } from '../../leaf/i18n';
import { closedKey, placementKey, type Id, type Lesson, type State } from '../../leaf/model';
import { commonestBlock, holeReason, lessonName } from '../feasibility';
import { activePinned, activePlacements, replaceActiveGrid } from '../grid';
import { createImprover, rng, type Improver } from './improve';
import { bindingPair, shortfalls } from './shortfall';

export interface SolverOptions {
  /** Keep what is already on the grid and fill in around it (default true). */
  keepPlaced: boolean;
  /** How long the search may WORK, in milliseconds. Slices are summed. */
  budgetMs: number;
  /**
   * Which of the many legal weeks to look for. 0 is the week this data has
   * always given; "Başka bir program yap" asks for another number on every press.
   */
  seed: number;
  /**
   * A week to stay close to: each block tries its cell in it first, and the
   * improvement pass keeps to it when nothing else is at stake. The week on
   * the grid, when "Otomatik diz" has to lay it out again (`relay`).
   */
  hint: Record<string, Id> | undefined;
  /** Run the improvement pass after the search (improve.ts). */
  improve: boolean;
  /**
   * With `keepPlaced`: when the kept week leaves cards with nowhere to go, lay
   * the unpinned week out again with it as the hint, and take that week if it
   * places every card. "Otomatik diz" asks for this; tests mostly do not.
   */
  relay: boolean;
}

const DEFAULTS: SolverOptions = {
  keepPlaced: true,
  budgetMs: 15_000,
  seed: 0,
  hint: undefined,
  improve: true,
  relay: false,
};

/**
 * The improvement pass's own wall-clock cap, on top of the search's budget.
 * Its real limit is a step count (improve.ts), so a seed gives the same week
 * on any machine; this only keeps a very slow machine from waiting long. A
 * quarter of the run's own budget when that is longer, so a caller that gives
 * the search minutes (the tests, on a loaded machine) gives the pass room too.
 */
const IMPROVE_CAP_MS = 4_000;

/** The second run's budget when "Otomatik diz" lays the week out again. */
const RELAY_BUDGET_MS = 15_000;

/**
 * The second run's repair gives up sooner than a first run's: it is there to
 * find a week NEAR the old one, which it does early or not at all, and the
 * father's own week, which no order of the cards can build, waits for the
 * suggestions behind it. MEASURED (WORKLOG 2026-11-16).
 */
const RELAY_STALL_PER_BLOCK = 50;

/**
 * How many nodes may pass without the grid getting any better before the search
 * stops building and starts repairing (see `sinceGain`). A node count, not a
 * stopwatch: the same input has to produce the same timetable on any machine.
 */
const STALL_LIMIT = 2_000;

/**
 * How many repair moves a block stays where it was just put before it may be
 * pushed out again for free, and how many moves a block may not go back to the
 * cell it was just pushed out of. Without both the repair walks in a circle:
 * A pushes B out, B pushes A out, and the grid never gets better.
 */
const TABU_TENURE = 12;

/**
 * How many repair moves PER BLOCK may pass without the grid getting better
 * before the repair gives up. It cannot prove a week impossible, so without a
 * limit an impossible week spends the whole budget. MEASURED on the school's
 * data with the hours Roboders had open, 16 seeds: all solved, the longest
 * fruitless stretch 17 983 moves for 211 blocks, i.e. 85 per block. Per block
 * because a small impossible world must give up in milliseconds, not in the
 * seconds a whole school is allowed.
 */
const REPAIR_STALL_PER_BLOCK = 500;

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
}

export interface SolverResult extends SolverProgress {
  phase: SolverPhase;
  /**
   * How many hours that were on the grid before the run sit somewhere else
   * now. Absent or 0 unless "Otomatik diz" had to lay the week out again (`relay`).
   */
  relaid?: number;
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
 * Not one item per lesson: a lesson can want 3+2+1, and the search's whole
 * shape — a domain of legal start cells, an MRV count, a forward-checking
 * bound — assumes every block it is holding is the same length. So a 2+2+1
 * lesson becomes two items, one asking for two 2s and one asking for a single,
 * and since blocks are 3, 2 or 1 hours long (v13) at most three items cover
 * every split there is. They share a class, so
 * `neighbours` already makes each the other's neighbour and the grid keeps
 * them apart the same way it keeps any two lessons apart.
 */
interface Item {
  lesson: Lesson;
  roomId: Id | null;
  /** How long each of THIS item's blocks is: 1, 2 or 3. */
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
   * Nothing left to search for: the week cannot hold even one of its blocks
   * (see the ceiling below). The search leaves it alone.
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
function preservedPlacements(base: State): Record<string, Id> {
  const out: Record<string, Id> = {};
  const placements = activePlacements(base);
  for (const key in activePinned(base)) {
    const lessonId = placements[key];
    if (lessonId !== undefined) out[key] = lessonId;
  }
  return out;
}

/**
 * The cells a run may not move: with `keepPlaced` everything already on the
 * grid, otherwise only the pinned cells.
 */
export function fixedCells(base: State, keepPlaced: boolean): Record<string, Id> {
  return keepPlaced ? { ...activePlacements(base) } : preservedPlacements(base);
}

function createSearch(
  base: State,
  opts: SolverOptions,
  /** The repair's patience; the second run of `relay` is given less (`RELAY_STALL_PER_BLOCK`). */
  repairStallPerBlock = REPAIR_STALL_PER_BLOCK,
): Solver {
  const dayCount = base.settings.days.length;
  const hourCount = base.settings.hours.length;
  const cellCount = dayCount * hourCount;

  // ONE mutable dictionary and ONE index for the whole search. `work` shares
  // the dictionary object, so blocker() sees every assignment immediately.
  // A clean sheet still keeps the PINNED cells. "Yeniden yap" means "throw away
  // the timetable you built", not "throw away the decisions I made by hand" —
  // and the rest of the search needs no telling: `work` shares this dictionary,
  // so `placedHours`, `placedBlocks` and `pendingBlocks` below all count the
  // pinned blocks as already down, and `retract()` only ever vacates a cell
  // this search itself filled.
  const placements: Record<string, Id> = fixedCells(base, opts.keepPlaced);
  const work: State = replaceActiveGrid(base, { placements });
  let ix: Index = buildIndex(work);
  // What this run was handed and must not move: kept blocks and pinned cells.
  // The repair below may push out only
  // what the search itself put down.
  const fixedAtStart = new Set(Object.keys(placements));

  // A relation between two lessons (B5.3) also reaches the whole day: placing
  // one closes that day to the other at every hour.
  const wideWindow = rulesBite(base) || base.relations.length > 0;
  const preferNoWarning = warningsPossible(base);

  // Another seed, another week: the order of the lessons the search looks at
  // first among equals, and the order of the days it tries among equals. Seed
  // 0 shuffles nothing and gives the week this data has always given.
  const seeded = opts.seed !== 0;
  const shuffler = rng(opts.seed * 7_919 + 13);
  const shuffle = <T>(list: T[]): void => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(shuffler() * (i + 1));
      [list[i], list[j]] = [list[j]!, list[i]!];
    }
  };
  const dayRank = Array.from({ length: dayCount }, (_, i) => i);
  if (seeded) shuffle(dayRank);

  // ---- the items -----------------------------------------------------------
  const items: Item[] = [];
  for (const lesson of base.lessons) {
    const already = ix.placedHours.get(lesson.id) ?? 0;
    const down = blocksOnGrid(work, lesson);
    // The blocks still owed, read off the grid rather than divided out of the
    // hours. `Math.floor(hours / block)` was what threw away the odd hour of a
    // 5-hour lesson in 2-hour blocks; there is no remainder to throw away now
    // because the split says what the last block is.
    const owed = pendingBlocks(work, lesson);
    for (const block of [3, 2, 1]) {
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

  if (seeded) shuffle(items);

  const totalBlocks = items.reduce((sum, x) => sum + x.need, 0);

  // Neighbours: an assignment can only ever narrow a lesson that shares a
  // teacher, a class or a room with it. ~25 of 99 lessons, not all of them.
  for (let a = 0; a < items.length; a++) {
    const one = items[a]!;
    for (let b = 0; b < items.length; b++) {
      const two = items[b]!;
      if (
        one.lesson.teacherId === two.lesson.teacherId ||
        one.lesson.classId === two.lesson.classId ||
        (one.roomId != null && one.roomId === two.roomId) ||
        (ix.notSameDay.get(one.lesson.id)?.includes(two.lesson.id) ?? false)
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
   * 3+2+1 lesson is three items competing for the same cells and the same daily
   * limit: capping each of them on its own would let the others between them
   * claim a day twice over.
   */
  function ceilingHours(list: Item[]): number {
    const lesson = list[0]!.lesson;
    const limit = lessonLimit(base, lesson);
    const perDay =
      ruleLevel(base, 'maxSameLessonPerDay') === 'block' && limit > 0 ? limit : Infinity;

    // Longest first, and one counter per length rather than one for doubles:
    // a lesson can now be 3+2+1 and each of those is its own item competing
    // for the same cells and the same daily limit.
    const order = [...list].sort((a, b) => b.block - a.block);
    const left = new Map<Item, number>(order.map((x) => [x, x.need]));

    let total = 0;
    for (let day = 0; day < dayCount; day++) {
      let onDay = 0;
      // Earliest-start packing, biggest first — the same order the split itself
      // is written in, and the one that leaves the singles the easy job.
      for (let h = 0; h < hourCount;) {
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
  /** Blocks the week can hold at all: every item's `need`, after the ceiling. */
  const placeableBlocks = items.reduce((sum, x) => sum + x.need, 0);
  let nodes = 0;
  let elapsedMs = 0;
  let finished: SolverResult | null = null;

  // The deepest assignment reached. Chronological backtracking can end up
  // shallower than it once was, and "I gave up" must return the best it saw,
  // not wherever the clock happened to stop it.
  let bestBlocks = 0;
  let bestPlacements: Record<string, Id> = { ...placements };

  /**
   * Nodes spent since the grid last got better.
   *
   * Chronological backtracking can spend any number of them re-proving the same
   * conflict two levels down, and on a school-sized grid "any number" means the
   * whole budget. MEASURED longest fruitless stretch: 17 nodes in
   * `kural-baskisi`, 171 in `erken-saat-tuzagi`, 8 059 in `derin-geri-sarma` —
   * all three still solve completely. The worlds that never finish spend
   * 91 551, 317 395 and 2 890 411. Past STALL_LIMIT the search hands the best
   * grid to the repair below instead of chasing the same wall. It used to give
   * up on one lesson and search again at 20 000; the repair finishes what the
   * backtracking cannot, so there is no reason to let it chase the wall for
   * long (the school's data: first stall at 0.3 s instead of 4.5 s).
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
      if (other.size < other.need - other.done) return false;
      touched.add(other.lesson.classId);
    }
    touched.add(item.lesson.classId);
    for (const classId of touched) {
      if (!coverable(classId)) {
        touched.clear();
        return false;
      }
    }
    touched.clear();
    return true;
  }

  // ---- slack ----------------------------------------------------------------
  //
  // A class whose open hours equal its lesson hours has no free hour to spare:
  // every open cell MUST end up taught. Forward checking above only asks "does
  // each block still have somewhere to start", and on such a class that is far
  // too weak — the search can leave a cell nobody can reach any more and only
  // find out a hundred assignments later. MEASURED on the school's own data,
  // where all twenty classes are exactly full.
  //
  // So after each assignment the classes it touched are asked the stronger
  // question: how many empty open cells can no live block cover any more? More
  // of them than the class has hours to spare is a dead end, now.

  const touched = new Set<Id>();
  const classItems = new Map<Id, number[]>();
  items.forEach((item, i) => {
    const list = classItems.get(item.lesson.classId);
    if (list === undefined) classItems.set(item.lesson.classId, [i]);
    else list.push(i);
  });
  const classOpen = new Map<Id, number[]>();
  for (const group of base.classes) {
    const open: number[] = [];
    for (let cell = 0; cell < cellCount; cell++) {
      const day = Math.floor(cell / hourCount);
      const hour = cell % hourCount;
      if (base.unavailable[closedKey(group.id, day, hour)] !== undefined) continue;
      if (
        group.roomId != null &&
        base.unavailable[closedKey(group.roomId, day, hour)] !== undefined
      ) {
        continue;
      }
      open.push(cell);
    }
    classOpen.set(group.id, open);
  }

  function coverable(classId: Id): boolean {
    const list = classItems.get(classId);
    const open = classOpen.get(classId);
    if (list === undefined || open === undefined) return true;
    let owed = 0;
    for (const i of list) {
      const item = items[i]!;
      if (!item.abandoned) owed += (item.need - item.done) * item.block;
    }
    let empty = 0;
    for (const cell of open) {
      if (
        placements[placementKey(classId, Math.floor(cell / hourCount), cell % hourCount)] ===
        undefined
      ) {
        empty++;
      }
    }
    const slack = empty - owed;
    // More owed than open: the class was over-full before the search began, and
    // the ceiling and the repair are what deal with that.
    if (slack < 0) return true;

    let lost = 0;
    for (const cell of open) {
      const day = Math.floor(cell / hourCount);
      const hour = cell % hourCount;
      if (placements[placementKey(classId, day, hour)] !== undefined) continue;
      let reached = false;
      for (const i of list) {
        const item = items[i]!;
        if (item.abandoned || item.done >= item.need) continue;
        for (let s = Math.max(0, hour - item.block + 1); s <= hour && !reached; s++) {
          if (item.domain[day * hourCount + s] === 1) reached = true;
        }
        if (reached) break;
      }
      if (!reached && ++lost > slack) return false;
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

  /** Does the hint week hold this lesson on every hour of this block? */
  function hintedAt(item: Item, cell: number): boolean {
    const hint = opts.hint;
    if (hint === undefined) return false;
    const day = Math.floor(cell / hourCount);
    const hour = cell % hourCount;
    for (let i = 0; i < item.block; i++) {
      if (hint[placementKey(item.lesson.classId, day, hour + i)] !== item.lesson.id) return false;
    }
    return true;
  }

  /**
   * The order to try cells in, best first:
   *   0. the cell the hint week has this lesson in (only with a hint)
   *   1. days where this CLASS has least of this lesson already — spread the
   *      week rather than stacking six hours of maths on Tuesday
   *   2. days where the TEACHER is least loaded
   *   3. cells that ABUT an hour the class already has filled — Deney B
   *      (WORKLOG 2026-08-29): the spreading rules above are what make the
   *      week look taught-on-every-day, and they are also what guarantees a
   *      gap once the week is 30% full. This key does not touch them — it
   *      only breaks a tie BETWEEN days the first two keys already called
   *      equal, and a cell that leans on a neighbour cannot leave a hole
   *      next to itself. MEASURED (WORKLOG): sınıf deliği 268 → 251, delikli
   *      gün 85 → 72, blocks/nodes/time unchanged on the sample school.
   *   4. cells that break no "Uyar" rule (only computed when one is set)
   *   5. earlier hours: the school day starts at 09:00 and fills downward
   */
  function order(item: Item): number[] {
    const classOnDay = new Array<number>(dayCount).fill(0);
    const teacherOnDay = new Array<number>(dayCount).fill(0);
    for (let g = 0; g < dayCount; g++) {
      for (let s = 0; s < hourCount; s++) {
        if (placements[placementKey(item.lesson.classId, g, s)] === item.lesson.id)
          classOnDay[g] = classOnDay[g]! + 1;
        if (ix.teacherBusy.has(closedKey(item.lesson.teacherId, g, s)))
          teacherOnDay[g] = teacherOnDay[g]! + 1;
      }
    }

    const out: number[] = [];
    for (let cell = 0; cell < cellCount; cell++) {
      if (item.domain[cell] === 1) out.push(cell);
    }

    // 0. The hint week's own cell for this lesson, before anything else: a
    //    week laid out again after one edit should look like the week before.
    const away = new Uint8Array(cellCount);
    if (opts.hint !== undefined) {
      for (const cell of out) away[cell] = hintedAt(item, cell) ? 0 : 1;
    }

    const warn = new Map<number, number>();
    if (preferNoWarning) {
      for (const cell of out) {
        const verdict = check(
          work,
          ix,
          item.lesson.id,
          Math.floor(cell / hourCount),
          cell % hourCount,
        );
        warn.set(cell, verdict.warning === null ? 0 : 1);
      }
    }

    // Deney B: does this start cell sit right against an hour the class is
    // already IN, on either side? 0 = it abuts one, 1 = it would open a new
    // island. Read straight off `placements`, the same dictionary blocker()
    // itself reads — no index rebuild, one lookup on each side.
    const abuts = (cell: number): number => {
      const day = Math.floor(cell / hourCount);
      const hour = cell % hourCount;
      const classId = item.lesson.classId;
      const before = hour > 0 && placements[`${classId}|${day}|${hour - 1}`] !== undefined;
      const after =
        hour + item.block < hourCount &&
        placements[`${classId}|${day}|${hour + item.block}`] !== undefined;
      return before || after ? 0 : 1;
    };

    out.sort((a, b) => {
      const da = Math.floor(a / hourCount);
      const db = Math.floor(b / hourCount);
      return (
        away[a]! - away[b]! ||
        classOnDay[da]! - classOnDay[db]! ||
        teacherOnDay[da]! - teacherOnDay[db]! ||
        abuts(a) - abuts(b) ||
        (warn.get(a) ?? 0) - (warn.get(b) ?? 0) ||
        (seeded ? dayRank[da]! - dayRank[db]! : 0) ||
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

  // ---- repair ----------------------------------------------------------------
  //
  // The backtracking above is complete only in theory. On a week where every
  // class is exactly full — open hours equal to lesson hours, which is how the
  // school's own data is shaped — it used to give up on a dozen lessons and stop
  // with most of the budget unspent. MEASURED on that data with the hours
  // Roboders had open (2026-09-24): 206 of 211 blocks before this section, 211
  // with it.
  //
  // So when the search is stuck and time is left, it stops building and starts
  // REPAIRING (iterative forward search): take a block that has no place, put it
  // in the cell where it pushes out the fewest blocks, and queue those blocks in
  // its stead. The walk is guided by two short memories (TABU_TENURE) so it does
  // not undo itself, and the best grid seen is what gets returned — so the
  // repair can never hand back less than the search found.

  /** One block the repair may move: which item, and where it starts. */
  interface Rec {
    item: number;
    day: number;
    hour: number;
    /** The repair move that put it here. */
    since: number;
  }

  let repairing = false;
  let moves = 0;
  const random = rng(base.lessons.length * 7919 + cellCount + opts.seed * 104_729);
  /** One entry per block still without a place: the item it belongs to. */
  const queue: number[] = [];

  // ---- the repair's integer mirror of the grid ------------------------------
  //
  // The repair asks "who is on this class / teacher / room cell, and may it
  // move" a few hundred million times on a school-sized week, and every one of
  // those questions used to build a `${id}|${day}|${hour}` string and hash it.
  // MEASURED (2026-11-15, tam-dolu-kurs, keepPlaced false): 9.1 s, ~70% of it in
  // `evictions`, `movableAt` and `trim`. So the repair reads typed arrays
  // indexed by entity * cellCount + cell instead. They mirror `placements` and
  // `ix` exactly: built from them in `startRepair`, and changed only by `claim`
  // and `release`, the repair's only two writers. `blocker()` still has the
  // last word on every move, through the dictionary, so a drift here can only
  // make the repair try a cell blocker() then refuses, never place a wrong one.

  /** A cell nobody is on. */
  const EMPTY = -1;
  /** A cell holding a lesson id that is not in `base.lessons` (sanitize's job). */
  const ORPHAN = -2;

  const lessonIndex = new Map<Id, number>();
  base.lessons.forEach((lesson, i) => lessonIndex.set(lesson.id, i));
  const indexer = () => {
    const map = new Map<Id, number>();
    return {
      map,
      of(id: Id): number {
        let at = map.get(id);
        if (at === undefined) {
          at = map.size;
          map.set(id, at);
        }
        return at;
      },
    };
  };
  const classes = indexer();
  const teachers = indexer();
  const rooms = indexer();
  for (const group of base.classes) {
    classes.of(group.id);
    if (group.roomId != null) rooms.of(group.roomId);
  }
  const lessonClass = new Int32Array(base.lessons.length);
  const lessonTeacher = new Int32Array(base.lessons.length);
  const lessonRoom = new Int32Array(base.lessons.length);
  base.lessons.forEach((lesson, i) => {
    lessonClass[i] = classes.of(lesson.classId);
    lessonTeacher[i] = teachers.of(lesson.teacherId);
    const roomId = ix.classById.get(lesson.classId)?.roomId;
    lessonRoom[i] = roomId == null ? -1 : rooms.of(roomId);
  });
  const classCell = new Int32Array(classes.map.size * cellCount).fill(EMPTY);
  const teacherCell = new Int32Array(teachers.map.size * cellCount).fill(EMPTY);
  const roomCell = new Int32Array(rooms.map.size * cellCount).fill(EMPTY);
  /** Class cell -> the movable block that covers it. Fixed cells hold null. */
  const owner: Array<Rec | null> = new Array<Rec | null>(classes.map.size * cellCount).fill(null);

  /** `placements` and the index, read into the arrays above. */
  function mirrorGrid(): void {
    classCell.fill(EMPTY);
    teacherCell.fill(EMPTY);
    roomCell.fill(EMPTY);
    owner.fill(null);
    for (const key in placements) {
      const lessonId = placements[key];
      if (lessonId === undefined) continue;
      // Cut the same way buildIndex() does: the class id is everything before
      // the last two separators.
      const sep = key.lastIndexOf('|');
      const prevSep = key.lastIndexOf('|', sep - 1);
      const cell = Number(key.slice(prevSep + 1, sep)) * hourCount + Number(key.slice(sep + 1));
      const classAt = classes.map.get(key.slice(0, prevSep));
      const li = lessonIndex.get(lessonId);
      if (classAt !== undefined) classCell[classAt * cellCount + cell] = li ?? ORPHAN;
      if (li === undefined) continue; // buildIndex() skips it too
      teacherCell[lessonTeacher[li]! * cellCount + cell] = li;
      const room = lessonRoom[li]!;
      if (room >= 0) roomCell[room * cellCount + cell] = li;
    }
  }

  /** item -> its lesson's index in `base.lessons`. */
  const itemLesson = items.map((item) => lessonIndex.get(item.lesson.id)!);

  /**
   * item -> cell -> 1 when a block of this item can never start there, whatever
   * moves: past the end of the day, or over an hour the
   * class, the teacher or the room has closed. None of that changes during a
   * run, so it is read once instead of on every move.
   */
  const neverStarts = items.map((item) => {
    const out = new Uint8Array(cellCount);
    const { lesson, block, roomId } = item;
    for (let cell = 0; cell < cellCount; cell++) {
      const day = Math.floor(cell / hourCount);
      const hour = cell % hourCount;
      if (hour + block > hourCount) {
        out[cell] = 1;
        continue;
      }
      for (let i = 0; i < block; i++) {
        const h = hour + i;
        if (
          base.unavailable[closedKey(lesson.classId, day, h)] !== undefined ||
          base.unavailable[closedKey(lesson.teacherId, day, h)] !== undefined ||
          (roomId != null && base.unavailable[closedKey(roomId, day, h)] !== undefined)
        ) {
          out[cell] = 1;
          break;
        }
      }
    }
    return out;
  });

  /** lesson index -> the lessons (by index) it may not share a day with (B5.3). */
  const apart = base.lessons.map((lesson) =>
    (ix.notSameDay.get(lesson.id) ?? [])
      .map((id) => lessonIndex.get(id))
      .filter((at): at is number => at !== undefined),
  );

  /** `${item}|${cell}` as item * cellCount + cell -> the move until which that block may not return there. */
  const tabu = new Float64Array(items.length * cellCount);
  /** item -> how often it has been the homeless block picked for a move. */
  const weight = items.map(() => 1);

  function claim(rec: Rec): void {
    const item = items[rec.item]!;
    const li = itemLesson[rec.item]!;
    occupy(placements, ix, item.lesson, item.roomId, rec.day, rec.hour, item.block);
    const start = rec.day * hourCount + rec.hour;
    const room = lessonRoom[li]!;
    for (let i = 0; i < item.block; i++) {
      const cell = start + i;
      classCell[lessonClass[li]! * cellCount + cell] = li;
      teacherCell[lessonTeacher[li]! * cellCount + cell] = li;
      if (room >= 0) roomCell[room * cellCount + cell] = li;
      owner[lessonClass[li]! * cellCount + cell] = rec;
    }
    item.done++;
    placedBlocks++;
  }

  function release(rec: Rec): void {
    const item = items[rec.item]!;
    const li = itemLesson[rec.item]!;
    vacate(placements, ix, item.lesson, item.roomId, rec.day, rec.hour, item.block);
    const start = rec.day * hourCount + rec.hour;
    const room = lessonRoom[li]!;
    for (let i = 0; i < item.block; i++) {
      const cell = start + i;
      classCell[lessonClass[li]! * cellCount + cell] = EMPTY;
      teacherCell[lessonTeacher[li]! * cellCount + cell] = EMPTY;
      if (room >= 0) roomCell[room * cellCount + cell] = EMPTY;
      owner[lessonClass[li]! * cellCount + cell] = null;
    }
    item.done--;
    placedBlocks--;
  }

  /**
   * The movable block on the class cell a lesson (by index) occupies, or null
   * if it is fixed or not a lesson of this plan.
   */
  function movableAt(li: number, cell: number): Rec | null {
    if (li < 0) return null;
    return owner[lessonClass[li]! * cellCount + cell] ?? null;
  }

  /**
   * Switches from building to repairing, starting from the best grid.
   * False when nothing reachable is missing, i.e. there is nothing to repair.
   */
  function startRepair(): boolean {
    for (const key of Object.keys(placements)) delete placements[key];
    Object.assign(placements, bestPlacements);
    ix = buildIndex(work);
    mirrorGrid();
    trail.length = 0;
    stack.length = 0;
    queue.length = 0;
    sinceGain = 0;

    // Which blocks on the grid did this run put down? Read with the same
    // contract as everywhere else, and a block that touches a cell the run was
    // handed stays where it is.
    for (const [lessonId, list] of itemsByLesson) {
      const lesson = ix.lessonById.get(lessonId);
      if (lesson === undefined) continue;
      for (const item of list) item.done = 0;
      for (const b of blocksOnGrid(work, lesson)) {
        let fixed = false;
        for (let i = 0; i < b.size; i++) {
          if (fixedAtStart.has(placementKey(lesson.classId, b.day, b.hour + i))) fixed = true;
        }
        const at = items.findIndex((x) => x.lesson.id === lessonId && x.block === b.size);
        if (fixed || at < 0) continue;
        const rec: Rec = { item: at, day: b.day, hour: b.hour, since: 0 };
        items[at]!.done++;
        const classAt = lessonClass[itemLesson[at]!]!;
        for (let i = 0; i < b.size; i++) {
          owner[classAt * cellCount + b.day * hourCount + b.hour + i] = rec;
        }
      }
    }
    placedBlocks = items.reduce((sum, x) => sum + x.done, 0);

    // What is queued is what the lesson still OWES, read off the grid by the
    // same contract, and never past the ceiling. Counting the movable blocks
    // alone is not enough: a new block beside a kept one of the same lesson can
    // be read as one longer block, which is then "fixed", and its hours would
    // be queued a second time. A guard, not a fix: 5 000 random worlds never
    // produced that reading (invariants.test.ts, 2026-09-24).
    for (const [lessonId, list] of itemsByLesson) {
      const lesson = ix.lessonById.get(lessonId);
      if (lesson === undefined) continue;
      const owed = pendingBlocks(work, lesson);
      for (const item of list) {
        const missing = owed.filter((x) => x === item.block).length;
        const index = items.indexOf(item);
        for (let n = 0; n < Math.min(missing, item.need - item.done); n++) queue.push(index);
      }
    }
    if (queue.length === 0) return false;
    repairing = true;
    return true;
  }

  /** Per-lesson and per-teacher daily limits that BLOCK, resolved once per item. 0 = none. */
  const sameLimit = items.map((item) => {
    const limit = lessonLimit(base, item.lesson);
    const bites = ruleLevel(base, 'maxSameLessonPerDay') === 'block';
    return bites && ruleActive(base, 'maxSameLessonPerDay', limit) ? limit : 0;
  });
  const dayLimit = items.map((item) => {
    const teacher = ix.teacherById.get(item.lesson.teacherId);
    if (teacher === undefined) return 0;
    const limit = limitFor(base, teacher, 'maxPerDay');
    const bites = ruleLevel(base, 'maxPerDay') === 'block';
    return bites && ruleActive(base, 'maxPerDay', limit) ? limit : 0;
  });

  /**
   * Hours on `day` that a limit counts and that are not already moving, and
   * the movable blocks to push out until `block` more hours fit under `limit`.
   * `row` is the start of the class's or the teacher's day in its array;
   * `only` keeps just one lesson's hours (the same-lesson limit), -1 keeps all.
   * False when even pushing every movable block out leaves no room.
   */
  function trim(
    out: Set<Rec>,
    limit: number,
    block: number,
    cells: Int32Array,
    row: number,
    day: number,
    only: number,
    /** The same count with nothing moving, read once per move (`dayCounts`). */
    whole: number,
  ): boolean {
    if (limit <= 0) return true;
    // Count first: on most cells the limit is nowhere near, and then nothing
    // has to be listed, sorted or pushed out. The day's count does not depend
    // on the cell, so it comes in whole and only the hours of the blocks
    // already moving are taken off: each counted hour has exactly one owner,
    // so walking the owners' own hours finds every hour to drop, once.
    let count = whole;
    for (const rec of out) {
      if (rec.day !== day) continue;
      const size = items[rec.item]!.block;
      for (let h = rec.hour; h < rec.hour + size; h++) {
        const id = cells[row + h]!;
        if (id === EMPTY || (only >= 0 && id !== only)) continue;
        if (movableAt(id, day * hourCount + h) === rec) count--;
      }
    }
    if (count + block <= limit) return true;
    const movable: Rec[] = [];
    for (let h = 0; h < hourCount; h++) {
      const id = cells[row + h]!;
      if (id === EMPTY || (only >= 0 && id !== only)) continue;
      const rec = movableAt(id, day * hourCount + h);
      if (rec !== null && !out.has(rec) && rec.hour === h) movable.push(rec);
    }
    movable.sort((a, b) => items[b.item]!.block - items[a.item]!.block);
    for (const rec of movable) {
      if (count + block <= limit) break;
      out.add(rec);
      count -= items[rec.item]!.block;
    }
    return count + block <= limit;
  }

  /** Per day, this move's lesson hours on its class row and its teacher's busy hours. */
  const sameOnDay = new Int32Array(dayCount);
  const teacherOnDay = new Int32Array(dayCount);
  function dayCounts(index: number): void {
    const li = itemLesson[index]!;
    const classRow = lessonClass[li]! * cellCount;
    const teacherRow = lessonTeacher[li]! * cellCount;
    for (let day = 0; day < dayCount; day++) {
      let same = 0;
      let busy = 0;
      for (let h = 0; h < hourCount; h++) {
        const cell = day * hourCount + h;
        if (classCell[classRow + cell] === li) same++;
        if (teacherCell[teacherRow + cell] !== EMPTY) busy++;
      }
      sameOnDay[day] = same;
      teacherOnDay[day] = busy;
    }
  }

  /**
   * What has to move out of the way for `item` to start at `cell`, or null
   * when something fixed is in the way.
   *
   * Not only the blocks sitting on the same hours. A daily limit is filled by
   * blocks elsewhere in the day — the lesson's own other block, the teacher's
   * other classes — and on a week this tight skipping every cell a limit
   * touches leaves the walk nowhere to go. So those blocks are candidates to
   * move too, the biggest first because one move is cheaper than two.
   */
  function evictions(index: number, cell: number): Set<Rec> | null {
    if (neverStarts[index]![cell] === 1) return null;
    const { block } = items[index]!;
    const li = itemLesson[index]!;
    const day = Math.floor(cell / hourCount);
    const classRow = lessonClass[li]! * cellCount;
    const teacherRow = lessonTeacher[li]! * cellCount;
    const room = lessonRoom[li]!;

    const out = new Set<Rec>();
    for (let i = 0; i < block; i++) {
      const at = cell + i;
      // Class, then teacher, then room: the order the blocks join `out` in is
      // the order they are released and queued, and the walk is seeded.
      const onClass = classCell[classRow + at]!;
      if (onClass !== EMPTY) {
        const rec = movableAt(onClass, at);
        if (rec === null) return null;
        out.add(rec);
      }
      const onTeacher = teacherCell[teacherRow + at]!;
      if (onTeacher !== EMPTY) {
        const rec = movableAt(onTeacher, at);
        if (rec === null) return null;
        out.add(rec);
      }
      if (room >= 0) {
        const onRoom = roomCell[room * cellCount + at]!;
        if (onRoom !== EMPTY) {
          const rec = movableAt(onRoom, at);
          if (rec === null) return null;
          out.add(rec);
        }
      }
    }

    const dayStart = day * hourCount;
    const ok =
      trim(
        out,
        sameLimit[index]!,
        block,
        classCell,
        classRow + dayStart,
        day,
        li,
        sameOnDay[day]!,
      ) &&
      trim(
        out,
        dayLimit[index]!,
        block,
        teacherCell,
        teacherRow + dayStart,
        day,
        -1,
        teacherOnDay[day]!,
      );
    if (!ok) return null;
    // A lesson this one may not share a day with (B5.3): all of its blocks on
    // this day go too, or the cell is closed if one of them may not move.
    for (const other of apart[li]!) {
      const otherRow = lessonClass[other]! * cellCount + dayStart;
      for (let h = 0; h < hourCount; h++) {
        if (classCell[otherRow + h] !== other) continue;
        const rec = movableAt(other, dayStart + h);
        if (rec === null) return null;
        out.add(rec);
      }
    }
    return out;
  }

  /** One repair move: one homeless block finds a place, and whatever it displaces queues up. */
  function repairMove(): void {
    moves++;
    const at = Math.floor(random() * queue.length);
    const index = queue[at]!;
    const item = items[index]!;
    // Breakout: a block that keeps coming back homeless gets heavier, so the
    // walk learns to push something else out of its way instead.
    weight[index] = weight[index]! + 1;

    let best: Set<Rec> | null = null;
    let bestCell = -1;
    let bestCost = Infinity;
    let ties = 0;
    let anyRoom = false;
    const tabuRow = index * cellCount;
    dayCounts(index);

    for (let cell = 0; cell < cellCount; cell++) {
      const out = evictions(index, cell);
      if (out === null) continue;
      anyRoom = true;
      if (out.size > 0 && tabu[tabuRow + cell]! > moves) continue;
      let cost = 0;
      for (const rec of out) {
        cost += weight[rec.item]! * (moves - rec.since < TABU_TENURE ? 4 : 1);
      }
      // Among cells that push out as much, the hint week's own (costs are
      // whole numbers, so a half only ever breaks a tie).
      if (opts.hint !== undefined && !hintedAt(item, cell)) cost += 0.5;
      if (cost < bestCost) {
        bestCost = cost;
        best = out;
        bestCell = cell;
        ties = 1;
      } else if (cost === bestCost && random() * ++ties < 1) {
        best = out;
        bestCell = cell;
      }
    }

    if (best === null) {
      // Nowhere at all, even with every movable block out of the way: this
      // block cannot be placed and the report will say why. If it was only
      // tabu, another block gets the next move.
      if (!anyRoom) {
        queue[at] = queue[queue.length - 1]!;
        queue.pop();
      }
      return;
    }

    const day = Math.floor(bestCell / hourCount);
    const hour = bestCell % hourCount;
    for (const rec of best) release(rec);
    // The same blocker() the drag uses has the last word. A limit this file does
    // not count for itself (art arda) can still say no, and then nothing moves.
    if (blocker(work, ix, item.lesson.id, day, hour, item.block) !== null) {
      for (const rec of best) claim(rec);
      return;
    }

    queue[at] = queue[queue.length - 1]!;
    queue.pop();
    for (const rec of best) {
      tabu[rec.item * cellCount + rec.day * hourCount + rec.hour] = moves + TABU_TENURE;
      queue.push(rec.item);
    }
    claim({ item: index, day, hour, since: moves });
    remember();
  }

  /** Is any lesson of this run short of hours on the best week? */
  function stuckAny(): boolean {
    const counts = new Map<Id, number>();
    for (const key in bestPlacements) {
      const id = bestPlacements[key]!;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return base.lessons.some((l) => (counts.get(l.id) ?? 0) < l.weeklyHours);
  }

  function report(phase: SolverPhase): SolverResult {
    const best = bestPlacements;
    const basePlacements = activePlacements(base);
    const changed =
      Object.keys(best).length !== Object.keys(basePlacements).length ||
      Object.keys(best).some((k) => basePlacements[k] !== best[k]);
    const state: State = changed ? replaceActiveGrid(base, { placements: best }) : base;

    // The stuck report is read off the BEST assignment, not off wherever the
    // search stopped — that is the grid the user is about to look at.
    const finalIx = buildIndex(state);
    const stuck: StuckLesson[] = [];
    // The causes no order of the cards can get round come first, and are the
    // sentence of every lesson they hold up: somebody's lessons outnumber
    // their open hours, or a pair of lessons that may not share a day needs
    // more days than the week has.
    const short = stuckAny() ? shortfalls(base) : new Map<Id, string>();
    const binding = new Set<Id>();
    for (const lesson of base.lessons) {
      const missing = lesson.weeklyHours - (finalIx.placedHours.get(lesson.id) ?? 0);
      if (missing <= 0) continue;
      // Which sentence tells the reader what to DO about it?
      //
      // When nothing fits at all, blocker() names the wall itself — "AV Salı 1
      // saatinde kapalı", "en fazla 1 saat görmeli — burada 2 saat olur" —
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
      const roomId = finalIx.classById.get(lesson.classId)?.roomId ?? null;
      const cause =
        short.get(lesson.teacherId) ??
        short.get(lesson.classId) ??
        (roomId === null ? undefined : short.get(roomId));
      const pair = cause === undefined ? bindingPair(base, finalIx, lesson.id) : null;
      if (cause !== undefined || pair !== null) binding.add(lesson.id);

      stuck.push({
        lessonId: lesson.id,
        name: lessonName(finalIx, lesson.id),
        missing,
        reason:
          cause !== undefined
            ? cause
            : pair !== null
              ? pair
              : capped
                ? t(
                    'haftada {istenen} saat isteniyor, açık saatler ve kurallar en fazla {olabilen} saat veriyor',
                    { istenen: lesson.weeklyHours, olabilen: fits },
                  )
                : (holeReason(state, finalIx, lesson.id) ??
                  commonestBlock(state, finalIx, lesson.id).reason),
      });
    }
    stuck.sort(
      (a, b) =>
        Number(binding.has(b.lessonId)) - Number(binding.has(a.lessonId)) ||
        b.missing - a.missing ||
        a.name.localeCompare(b.name, 'tr'),
    );

    // `phase` used to be handed straight back, so a run that placed every BLOCK
    // it counted said 'solved' while `stuck` listed the hours a block size could
    // not divide (5 hours in 2-hour blocks). Nothing is solved while something
    // is missing.
    const truth: SolverPhase =
      stuck.length === 0 ? 'solved' : phase === 'cancelled' ? 'cancelled' : 'stuck';

    return {
      phase: truth,
      relaid: 0,
      state,
      placedBlocks: bestBlocks,
      totalBlocks,
      nodes,
      elapsedMs,
      stuck,
    };
  }

  // ---- improvement -----------------------------------------------------------
  //
  // Once the search has placed every card, the week is handed to the
  // improvement pass (improve.ts) before it is reported: same blocks, same
  // rules, fewer gaps. Only the blocks this run put down move.

  let improver: Improver | null = null;
  let improvePhase: SolverPhase = 'solved';
  let improveMs = 0;

  /**
   * True when the pass has taken over and the run goes on in the next slice.
   *
   * Only for a week the search FINISHED. A stuck week is the suggestion
   * search's first guess (useSolver), and a week tidied for gaps is a worse
   * one: on the father's file the fewest-hours way came back 5 hours instead
   * of CP-SAT's 4 (relaxFullCourse.test.ts, 2026-11-16).
   */
  function startImprove(phase: SolverPhase): boolean {
    if (!opts.improve || improver !== null || phase !== 'solved') return false;
    for (const key of Object.keys(placements)) delete placements[key];
    Object.assign(placements, bestPlacements);
    ix = buildIndex(work);
    placedBlocks = bestBlocks;
    repairing = false;
    improvePhase = phase;
    improver = createImprover({
      work,
      placements,
      ix,
      fixed: fixedAtStart,
      lessonIds: [...itemsByLesson.keys()],
      seed: opts.seed,
      hint: opts.hint,
    });
    return true;
  }

  /** The pass's week is the week: it is never worse than the one it was given. */
  function endImprove(): void {
    bestPlacements = { ...placements };
    improver = null;
  }

  return {
    step(sliceMs: number): SolverResult | null {
      if (finished !== null) return finished;
      const t0 = performance.now();
      if (improver !== null) {
        const cap = Math.max(IMPROVE_CAP_MS, opts.budgetMs / 4);
        const left = Math.max(1, Math.min(sliceMs, cap - improveMs));
        const over = improver.step(left);
        const spent = performance.now() - t0;
        elapsedMs += spent;
        improveMs += spent;
        if (!over && improveMs < cap) return null;
        endImprove();
        finished = report(improvePhase);
        return finished;
      }
      const stop = (phase: SolverPhase | null): SolverResult | null => {
        elapsedMs += performance.now() - t0;
        if (phase === null) return null;
        if (startImprove(phase)) return null;
        finished = report(phase);
        return finished;
      };

      for (;;) {
        if (repairing) {
          if (queue.length === 0) return stop('solved');
          if (performance.now() - t0 >= sliceMs) return stop(null);
          if (elapsedMs + (performance.now() - t0) >= opts.budgetMs) return stop('stuck');
          nodes++;
          if (++sinceGain > repairStallPerBlock * totalBlocks) return stop('stuck');
          repairMove();
          continue;
        }

        if (placedBlocks === placeableBlocks) {
          remember();
          return stop(placedBlocks === totalBlocks ? 'solved' : 'stuck');
        }

        if (performance.now() - t0 >= sliceMs) return stop(null);
        if (elapsedMs + (performance.now() - t0) >= opts.budgetMs) return stop('stuck');

        nodes++;
        sinceGain++;
        if (sinceGain > STALL_LIMIT) {
          if (!startRepair()) return stop('stuck');
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
            // Nothing left to back up into: the whole tree is exhausted, and
            // the repair takes over from the best grid it reached.
            if (!startRepair()) return stop('stuck');
            continue;
          }
          retract(stack[stack.length - 1]!);
        }
      }
    },

    progress(): SolverProgress {
      return { placedBlocks, totalBlocks, nodes, elapsedMs };
    },

    cancel(): SolverResult {
      if (finished === null) {
        if (improver !== null) endImprove();
        finished = report('cancelled');
      }
      return finished;
    },
  };
}

/**
 * The search, and for "Otomatik diz" (`relay`) a second one after it: when
 * the kept week leaves cards with nowhere to go, the unpinned week is laid out
 * again with itself as the hint, so one edited lesson moves a few hours and
 * not the whole week. The second week is taken only when it places every
 * card; otherwise the first run's answer stands, suggestions and all.
 */
export function createSolver(base: State, options?: Partial<SolverOptions>): Solver {
  const opts: SolverOptions = { ...DEFAULTS, ...options };
  let active = createSearch(base, opts);
  let first: SolverResult | null = null;
  let finished: SolverResult | null = null;

  const relayable = () => {
    if (!opts.relay || !opts.keepPlaced) return false;
    const kept = Object.keys(fixedCells(base, false)).length;
    if (kept >= Object.keys(activePlacements(base)).length) return false;
    // A week whose loads do not fit its open hours cannot be laid out by any
    // order of the cards; the second run would only spend the time.
    return shortfalls(base).size === 0;
  };

  const settle = (second: SolverResult): SolverResult => {
    const kept = first!;
    const elapsedMs = kept.elapsedMs + second.elapsedMs;
    if (second.stuck.length > 0) return { ...kept, elapsedMs };
    const before = activePlacements(base);
    const after = activePlacements(second.state);
    let relaid = 0;
    for (const key in before) if (after[key] !== before[key]) relaid++;
    return { ...second, elapsedMs, relaid };
  };

  return {
    step(sliceMs: number): SolverResult | null {
      if (finished !== null) return finished;
      const done = active.step(sliceMs);
      if (done === null) return null;
      if (first === null && done.phase === 'stuck' && relayable()) {
        first = done;
        active = createSearch(
          base,
          {
            ...opts,
            keepPlaced: false,
            hint: activePlacements(base),
            budgetMs: Math.max(0, Math.min(RELAY_BUDGET_MS, opts.budgetMs - done.elapsedMs)),
          },
          RELAY_STALL_PER_BLOCK,
        );
        return null;
      }
      finished = first === null ? done : settle(done);
      return finished;
    },
    progress(): SolverProgress {
      const p = active.progress();
      return first === null ? p : { ...p, elapsedMs: p.elapsedMs + first.elapsedMs };
    },
    cancel(): SolverResult {
      if (finished !== null) return finished;
      // Stopped while laying the week out again: the kept week stands, as
      // stopped, and nothing on the grid it did not place has moved.
      const done = active.cancel();
      finished = first === null ? done : { ...first, phase: 'cancelled' };
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
