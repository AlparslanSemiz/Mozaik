// Putting a block down and taking it back: `place`, the block under a cell,
// pinning, `liftBlock` and the pin-respecting `removeBlock`.

import { type Id, type State, placementKey } from '../../leaf/model';
import { activePinned, activePlacements, replaceActiveGrid } from '../grid';
import { type PlacedBlock, blockSizeFor, placedBlocks } from './blocks';

// ------------------------------------------------------------- placing

/** The whole block containing the clicked cell — where it starts and how long. */
export function blockAt(d: State, classId: Id, day: number, hour: number): PlacedBlock | null {
  const lessonId = activePlacements(d)[placementKey(classId, day, hour)];
  if (lessonId === undefined) return null;
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return { day, hour, size: 1 };

  for (const block of placedBlocks(d, lesson)) {
    if (block.day === day && hour >= block.hour && hour < block.hour + block.size) return block;
  }
  return null;
}

/**
 * Writes the lesson onto the grid. Returns a new State, no mutation.
 * PRECONDITION: the caller called `blocker()` first and got null.
 */
export function place(d: State, lessonId: Id, day: number, hour: number, size?: number): State {
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return d;

  const block = blockSizeFor(d, lesson, size);
  const placements = { ...activePlacements(d) };
  for (let i = 0; i < block; i++) {
    placements[placementKey(lesson.classId, day, hour + i)] = lessonId;
  }
  return replaceActiveGrid(d, { placements });
}

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
