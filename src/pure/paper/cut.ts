// Where a printed row of hours is cut into cells.
//
// Moved out of `ui/Print.tsx` without a change (TODO §8k, RF9). The screen grid
// cuts the same rows with an algorithm of its own (`ui/program/Grid.tsx`, a
// walk over `continues`); the two draw the same cells everywhere but one case,
// a teacher written into two classes at one hour, and that difference is kept
// on purpose until it is decided (TODO §8k, RK15). So this is the PAPER's cut,
// not a shared one.

import { placementKey } from '../constraints';
import { activePlacements } from '../program';
import type { State } from '../../leaf/types';

/**
 * How many hours the ONE printed cell starting at this hour stands for.
 *
 * 0 means "do not draw it": a block to the left already covers this hour. 1 is
 * an ordinary cell. Anything more is a merged block, drawn on paper the way the
 * screen grid draws it, from the same `blockSpans()` map — so a run of hours is
 * never cut in one place on screen and another on paper.
 *
 * CUT AT THE LONG BREAK, for a reason of its own. On screen the break is a
 * column of its own and swallowing it inside a colSpan would make it a drop
 * target (pitfall 13); on paper it is a thick right edge on one cell, and a
 * colSpan straddling it would put that edge through the middle of a block. Both
 * drawings therefore end a cell at the break, which is also the honest reading:
 * there really is something between those hours.
 */
export function cellSpan(
  spans: Map<string, number>,
  state: State,
  classId: string,
  day: number,
  hour: number,
  longBreakAfter: number,
): number {
  if (classId === '') return 1;
  const here = activePlacements(state)[placementKey(classId, day, hour)];
  if (here === undefined) return 1;

  const head = spans.get(placementKey(classId, day, hour));
  if (head === undefined) {
    // Not a block head. It is drawn on its own only if the break cut the block
    // just before it — otherwise the cell to its left is already covering it.
    return longBreakAfter === hour
      ? blockTail(spans, state, classId, day, hour, longBreakAfter)
      : 0;
  }
  return clampToBreak(head, hour, longBreakAfter, state.settings.hours.length);
}

/** The rest of a block after the long break cut it, as its own cell. */
function blockTail(
  spans: Map<string, number>,
  state: State,
  classId: string,
  day: number,
  hour: number,
  longBreakAfter: number,
): number {
  const id = activePlacements(state)[placementKey(classId, day, hour)];
  let start = hour;
  while (start > 0 && spans.get(placementKey(classId, day, start)) === undefined) start--;
  const size = spans.get(placementKey(classId, day, start)) ?? 1;
  const left = size - (hour - start);
  if (left <= 0 || id === undefined) return 1;
  return clampToBreak(left, hour, longBreakAfter, state.settings.hours.length);
}

/** A width that never reaches past the long break or past the last hour. */
function clampToBreak(
  size: number,
  hour: number,
  longBreakAfter: number,
  hourCount: number,
): number {
  const toBreak = longBreakAfter > hour ? longBreakAfter - hour : Infinity;
  return Math.max(1, Math.min(size, toBreak, hourCount - hour));
}
