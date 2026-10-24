// Pinning a whole scope at once: every block a column, a row or the whole
// timetable cuts, and the toggle that pins or unpins them together.

import { type Id, type State, type View, placementKey } from '../../leaf/model';
import { activePinned, replaceActiveGrid } from '../grid';
import { placedBlocks } from './blocks';

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
