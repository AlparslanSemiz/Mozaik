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
  vacate,
} from './constraints';
import type { Index } from './constraints';
import { commonestBlock, lessonName } from './feasibility';
import { lessonLimit, limitFor, ruleActive, ruleLevel } from './rules';
import type { Id, Lesson, State } from './types';

export interface SolverOptions {
  /** Keep what is already on the grid and fill in around it (default true). */
  keepPlaced: boolean;
  /** How long the search may WORK, in milliseconds. Slices are summed. */
  budgetMs: number;
}

const DEFAULTS: SolverOptions = { keepPlaced: true, budgetMs: 15_000 };

export type SolverPhase = 'solved' | 'stuck' | 'cancelled';

export interface StuckLesson {
  lessonId: Id;
  /** "412 — AV Fizik" */
  name: string;
  /** Hours still unplaced. */
  missing: number;
  /** blocker()'s own sentence, the commonest one. */
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

/** One lesson that still needs blocks put down. */
interface Item {
  lesson: Lesson;
  roomId: Id | null;
  /** Blocks still to place. */
  need: number;
  /** Blocks placed by THIS run. */
  done: number;
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

export function createSolver(base: State, options?: Partial<SolverOptions>): Solver {
  const opts: SolverOptions = { ...DEFAULTS, ...options };

  const dayCount = base.settings.days.length;
  const hourCount = base.settings.hours.length;
  const cellCount = dayCount * hourCount;

  // ONE mutable dictionary and ONE index for the whole search. `work` shares
  // the dictionary object, so blocker() sees every assignment immediately.
  const placements: Record<string, Id> = opts.keepPlaced ? { ...base.placements } : {};
  const work: State = { ...base, placements };
  const ix: Index = buildIndex(work);

  const wideWindow = rulesBite(base);
  const preferNoWarning = warningsPossible(base);

  // ---- the items -----------------------------------------------------------
  const items: Item[] = [];
  for (const lesson of base.lessons) {
    const block = Math.max(1, lesson.blockSize);
    const already = ix.placedHours.get(lesson.id) ?? 0;
    const need = Math.floor((lesson.weeklyHours - already) / block);
    if (need <= 0) continue;
    items.push({
      lesson,
      roomId: ix.classById.get(lesson.classId)?.roomId ?? null,
      need,
      done: 0,
      domain: new Uint8Array(cellCount),
      size: 0,
      neighbours: [],
      abandoned: false,
    });
  }

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
        (one.roomId != null && one.roomId === two.roomId)
      ) {
        one.neighbours.push(b);
      }
    }
  }

  const maxBlock = items.reduce((m, x) => Math.max(m, Math.max(1, x.lesson.blockSize)), 1);

  // ---- initial domains -----------------------------------------------------
  for (const item of items) {
    for (let cell = 0; cell < cellCount; cell++) {
      const day = Math.floor(cell / hourCount);
      const hour = cell % hourCount;
      if (blocker(work, ix, item.lesson.id, day, hour) === null) {
        item.domain[cell] = 1;
        item.size++;
      }
    }
  }

  const trail: TrailEntry[] = [];
  const stack: Frame[] = [];

  let placedBlocks = 0;
  /** Blocks still considered reachable: totalBlocks minus what was given up on. */
  let placeableBlocks = totalBlocks;
  let nodes = 0;
  let elapsedMs = 0;
  let finished: SolverResult | null = null;

  // The deepest assignment reached. Chronological backtracking can end up
  // shallower than it once was, and "I gave up" must return the best it saw,
  // not wherever the clock happened to stop it.
  let bestBlocks = 0;
  let bestPlacements: Record<string, Id> = { ...placements };

  function remember() {
    if (placedBlocks <= bestBlocks) return;
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
        if (blocker(work, ix, other.lesson.id, day, h) === null) continue;
        other.domain[cell] = 0;
        other.size--;
        trail.push({ item: n, cell });
      }

      // Forward checking: each remaining block needs a start cell of its own.
      if (other.size < other.need - other.done) return false;
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
      const block = Math.max(1, item.lesson.blockSize);
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
    if (blocker(work, ix, item.lesson.id, day, hour) !== null) return false;

    occupy(placements, ix, item.lesson, item.roomId, day, hour);
    item.done++;
    placedBlocks++;
    frame.applied = cell;

    if (!revise(day, hour, Math.max(1, item.lesson.blockSize), item)) {
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
    vacate(placements, ix, item.lesson, item.roomId, day, hour);
    item.done--;
    placedBlocks--;
    frame.applied = -1;
    undoTrail(frame.trailMark);
  }

  function report(phase: SolverPhase): SolverResult {
    const best = bestPlacements;
    const changed = Object.keys(best).length !== Object.keys(base.placements).length ||
      Object.keys(best).some((k) => base.placements[k] !== best[k]);
    const state: State = changed ? { ...base, placements: best } : base;

    // The stuck report is read off the BEST assignment, not off wherever the
    // search stopped — that is the grid the user is about to look at.
    const finalIx = buildIndex(state);
    const stuck: StuckLesson[] = [];
    for (const lesson of base.lessons) {
      const missing = lesson.weeklyHours - (finalIx.placedHours.get(lesson.id) ?? 0);
      if (missing <= 0) continue;
      stuck.push({
        lessonId: lesson.id,
        name: lessonName(finalIx, lesson.id),
        missing,
        reason: commonestBlock(state, finalIx, lesson.id).reason,
      });
    }
    stuck.sort((a, b) => b.missing - a.missing || a.name.localeCompare(b.name, 'tr'));

    return {
      phase: stuck.length === 0 ? 'solved' : phase,
      state,
      placedBlocks: bestBlocks,
      totalBlocks,
      nodes,
      elapsedMs,
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
          if (stack.length === 0) {
            // Nothing left to back up into: this lesson cannot be placed at
            // all in this world. Give up on IT, not on the timetable — the
            // other lessons still deserve their places, and the report is only
            // useful next to a grid that is otherwise full.
            const dead = items[frame.item]!;
            dead.abandoned = true;
            placeableBlocks -= dead.need - dead.done;
            remember();
            if (placeableBlocks <= placedBlocks) return stop('stuck');
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
