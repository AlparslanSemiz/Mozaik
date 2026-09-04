// The reader's own lock. A pin is not a rule — it is a person saying "leave
// this one alone" — and that difference is why liftBlock (mechanical) and
// removeBlock (asks first) are two functions rather than one with a flag.

import { placementKey } from '../keys';
import { blockAt, placedBlocks } from './placement';
import { activePinned, activePlacements, replaceActiveGrid } from '../programs';
import type { View } from '../toolState';
import type { Id, State } from '../types';

/**
 * Is any hour of the block containing this cell pinned?
 *
 * Asked of the BLOCK and not of the cell, because a block is what moves and
 * what is removed: pinning the first hour of a double has to hold the second
 * one too, or half of it could be dragged out from under the pin.
 */
export function blockPinned(d: State, classId: Id, day: number, hour: number): boolean {
  const found = blockAt(d, classId, day, hour);
  if (found === null) return false;
  for (let i = 0; i < found.size; i++) {
    if (activePinned(d)[placementKey(classId, day, found.hour + i)] !== undefined) return true;
  }
  return false;
}

/** Every cell of the block containing this one, or [] if there is no block. */
export function blockCells(d: State, classId: Id, day: number, hour: number): string[] {
  const found = blockAt(d, classId, day, hour);
  if (found === null) return [];
  const out: string[] = [];
  for (let i = 0; i < found.size; i++) out.push(placementKey(classId, day, found.hour + i));
  return out;
}

/** Pins the whole block containing this cell, or unpins it. One undo step. */
export function setBlockPinned(
  d: State,
  classId: Id,
  day: number,
  hour: number,
  on: boolean,
): State {
  const cells = blockCells(d, classId, day, hour);
  if (cells.length === 0) return d;
  const pinned = { ...activePinned(d) };
  for (const key of cells) {
    if (on) pinned[key] = 1;
    else delete pinned[key];
  }
  return replaceActiveGrid(d, { pinned });
}

/**
 * Takes the WHOLE block containing this cell off the grid. MECHANICAL: it does
 * not ask whether the reader is allowed to.
 *
 * Separate from `removeBlock` because two different things want to lift a
 * block and only one of them is a person. `illegalBlocks()` in worlds.ts lifts
 * every block on a finished timetable and asks `blocker()` whether it could go
 * back — that is a question about the RULES, and a pin is not a rule. Routing
 * the auditor through the refusal made it unable to lift a pinned block, so it
 * reported the block as colliding with itself.
 */
export function liftBlock(d: State, classId: Id, day: number, hour: number): State {
  const found = blockAt(d, classId, day, hour);
  if (found === null) return d;

  const lessonId = activePlacements(d)[placementKey(classId, day, found.hour)];
  if (lessonId === undefined) return d;

  const placements = { ...activePlacements(d) };
  for (let i = 0; i < found.size; i++) {
    const k = placementKey(classId, day, found.hour + i);
    if (placements[k] === lessonId) delete placements[k];
  }
  return replaceActiveGrid(d, { placements });
}

/**
 * Removes the WHOLE block containing the clicked cell, IF the reader may.
 *
 * A pinned block is not removed. The refusal lives here rather than in the
 * button that calls it because there are four ways in — right-click, the
 * menu's own item, Delete on a focused card, and a drop that would evict —
 * and a lock that only three of them respect is not a lock.
 */
export function removeBlock(d: State, classId: Id, day: number, hour: number): State {
  if (blockPinned(d, classId, day, hour)) return d;
  return liftBlock(d, classId, day, hour);
}

export type PinScope =
  | { kind: 'all' }
  | { kind: 'row'; view: View; rowId: Id }
  | { kind: 'day'; day: number }
  | { kind: 'column'; day: number; hour: number };

/** Every CELL of every whole block touched by a bulk pin scope. */
export function pinScopeCells(d: State, scope: PinScope): string[] {
  const cells = new Set<string>();
  for (const lesson of d.lessons) {
    for (const block of placedBlocks(d, lesson)) {
      const matches =
        scope.kind === 'all' ||
        (scope.kind === 'day' && scope.day === block.day) ||
        (scope.kind === 'column' &&
          scope.day === block.day &&
          scope.hour >= block.hour &&
          scope.hour < block.hour + block.size) ||
        (scope.kind === 'row' &&
          (scope.view === 'class'
            ? scope.rowId === lesson.classId
            : scope.rowId === lesson.teacherId));
      if (!matches) continue;
      for (let offset = 0; offset < block.size; offset++) {
        const key = placementKey(lesson.classId, block.day, block.hour + offset);
        cells.add(key);
      }
    }
  }
  return [...cells];
}

/** Toggle policy: all pinned -> clear all; otherwise pin all. One state change. */
export function togglePinScope(d: State, scope: PinScope): State {
  const cells = pinScopeCells(d, scope);
  if (cells.length === 0) return d;
  const current = activePinned(d);
  const on = !cells.every((key) => current[key] !== undefined);
  const pinned = { ...current };
  for (const key of cells) {
    if (on) pinned[key] = 1;
    else delete pinned[key];
  }
  return replaceActiveGrid(d, { pinned });
}
