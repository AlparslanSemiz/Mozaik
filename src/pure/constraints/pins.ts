// Pinning the whole week at once: every cell of every placed block, and the
// toggle that pins or unpins them together ("Tüm programı sabitle"). Pinning a
// row, a day or a column at once went on 2026-11-16 (Sadeleşme K7); one block
// is still pinned on its own card.

import { type State, placementKey } from '../../leaf/model';
import { activePinned, replaceActiveGrid } from '../grid';
import { placedBlocks } from './blocks';

/** Every CELL of every placed block. */
export function allPinCells(d: State): string[] {
  const cells = new Set<string>();
  for (const lesson of d.lessons) {
    for (const block of placedBlocks(d, lesson)) {
      for (let offset = 0; offset < block.size; offset++) {
        cells.add(placementKey(lesson.classId, block.day, block.hour + offset));
      }
    }
  }
  return [...cells];
}

/** Toggle policy: all pinned -> clear all; otherwise pin all. One state change. */
export function togglePinAll(d: State): State {
  const cells = allPinCells(d);
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
