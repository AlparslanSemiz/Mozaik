// Reading the grid, and writing to it. The index, how a run of cells is read
// as blocks, and the two ways a block goes down.
//
// occupy/vacate live HERE, beside place() and buildIndex(), and that is on
// purpose: they are the in-place twin of that pair for the solver's inner loop,
// and constraints.test.ts pins the two against each other with seven tests.
// Split into separate files they would still work — and the equivalence a
// reviewer has to see would be invisible.

import { blockPlan, clampBlocks } from '../blocks';
import { closedKey, placementKey, teacherKey } from '../keys';
import { activePlacements, replaceActiveGrid } from '../programs';
import type { ClassGroup, Id, Lesson, Room, State, Teacher } from '../types';

// ---------------------------------------------------------------- index

/**
 * `placements` is keyed by class; teacher and room occupancy are derived from
 * it in a SINGLE pass. Keeping the same data in two places means sync bugs.
 */
export interface Index {
  teacherBusy: Map<string, Id>; // `${teacherId}|${day}|${hour}` -> lessonId
  roomBusy: Map<string, Id>; // `${roomId}|${day}|${hour}` -> lessonId
  lessonById: Map<Id, Lesson>;
  classById: Map<Id, ClassGroup>;
  teacherById: Map<Id, Teacher>;
  roomById: Map<Id, Room>;
  /** lessonId -> hours already placed on the grid. Used by the counters. */
  placedHours: Map<Id, number>;
}

export function buildIndex(d: State): Index {
  const lessonById = new Map(d.lessons.map((x) => [x.id, x]));
  const classById = new Map(d.classes.map((x) => [x.id, x]));
  const teacherById = new Map(d.teachers.map((x) => [x.id, x]));
  const roomById = new Map(d.rooms.map((x) => [x.id, x]));

  const teacherBusy = new Map<string, Id>();
  const roomBusy = new Map<string, Id>();
  const placedHours = new Map<Id, number>();

  const placements = activePlacements(d);
  for (const key in placements) {
    const lessonId = placements[key];
    if (lessonId === undefined) continue;
    const lesson = lessonById.get(lessonId);
    if (lesson === undefined) continue; // orphan record — sanitize() deals with it

    const sep = key.lastIndexOf('|');
    const prevSep = key.lastIndexOf('|', sep - 1);
    const day = Number(key.slice(prevSep + 1, sep));
    const hour = Number(key.slice(sep + 1));

    placedHours.set(lessonId, (placedHours.get(lessonId) ?? 0) + 1);
    teacherBusy.set(teacherKey(lesson.teacherId, day, hour), lessonId);

    const roomId = classById.get(lesson.classId)?.roomId;
    if (roomId != null) roomBusy.set(`${roomId}|${day}|${hour}`, lessonId);
  }

  return {
    teacherBusy,
    roomBusy,
    lessonById,
    classById,
    teacherById,
    roomById,
    placedHours,
  };
}


// -------------------------------------------------- reading blocks off the grid
//
// THE CONTRACT. `placements` holds one lessonId per hour and NO block boundary
// — a block has never been an entity here. With one block length per lesson
// that was enough: a run of the same id split into equal chunks and the answer
// was unique. With 2+1 it is not. Three adjacent cells of one lesson can be
// read as [2,1] or as [1,2], and nothing on the grid can tell them apart.
//
// The way out is not a bigger schema, it is a rule — written once, obeyed
// everywhere:
//
//   A lesson's placed blocks are read in day/hour order. Inside each run the
//   BIGGEST block the lesson still owes is taken first, as long as it fits what
//   is left of the run; whatever no named block fits is a single.
//
// That is the same order `blockPlan` writes the split in, so a lesson placed
// straight out of the pool reads back exactly as it went down.
// Which reading is chosen cannot make a timetable wrong: every clash rule looks
// at hours and at runs, never at where a boundary was drawn, so all readings of
// the same cells are equally legal. What it decides is what a right-click takes
// away and which cards the pool still owes — and those have to be ONE answer,
// or the tray and the grid start disagreeing about the same lesson.

export interface PlacedBlock {
  day: number;
  hour: number;
  size: number;
}

/** Every placed block of one lesson, in day/hour order. See the contract above. */
export function placedBlocks(d: State, lesson: Lesson): PlacedBlock[] {
  const out: PlacedBlock[] = [];
  // What the lesson still owes, longest first — the countdown the contract
  // above spends. A plain counter worked while 2 was the only length worth
  // naming; with 2, 3 and 4 the run has to be offered each of them in turn.
  const left = clampBlocks(lesson.weeklyHours, lesson.blocks);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  for (let g = 0; g < dayCount; g++) {
    let h = 0;
    while (h < hourCount) {
      if (activePlacements(d)[placementKey(lesson.classId, g, h)] !== lesson.id) {
        h++;
        continue;
      }
      let end = h;
      while (
        end < hourCount &&
        activePlacements(d)[placementKey(lesson.classId, g, end)] === lesson.id
      ) {
        end++;
      }
      for (let cur = h; cur < end; ) {
        const room = end - cur;
        const at = left.findIndex((b) => b <= room);
        const size = at === -1 ? 1 : left[at]!;
        if (at !== -1) left.splice(at, 1);
        out.push({ day: g, hour: cur, size });
        cur += size;
      }
      h = end;
    }
  }
  return out;
}

/**
 * How many hours the block starting at each placed cell stands for.
 *
 * ONE map, keyed the way `placements` is, so every drawing of the week reads
 * the same boundaries: the grid, the two printed tables and the auditor. A cell
 * that is not the head of a block is absent — its hours belong to the head to
 * its left. Anything that recomputes this on its own drifts (pitfall 75).
 */
export function blockSpans(d: State): Map<string, number> {
  const spans = new Map<string, number>();
  for (const lesson of d.lessons) {
    for (const b of placedBlocks(d, lesson)) {
      spans.set(placementKey(lesson.classId, b.day, b.hour), b.size);
    }
  }
  return spans;
}

/**
 * The blocks a lesson still owes, biggest first.
 *
 * A multiset difference and not an hour count, because hours cannot answer it:
 * a 2+2+1+1 lesson with two hours down could have placed one two or two ones,
 * and the two cases owe different cards. The reading above is what makes the
 * question decidable at all.
 */
export function pendingBlocks(d: State, lesson: Lesson): number[] {
  const owed = blockPlan(lesson);
  for (const done of placedBlocks(d, lesson)) {
    const at = owed.indexOf(done.size);
    // Not found: the grid holds a shape the plan does not (an old backup, or
    // hours edited under a placed lesson). Take the biggest thing left rather
    // than pretend nothing was placed.
    owed.splice(at === -1 ? 0 : at, 1);
  }
  return owed;
}

/** The size a caller means when it does not say. See `blockerDetail`. */
export function blockSizeFor(d: State, lesson: Lesson, size?: number): number {
  if (size !== undefined) return Math.max(1, Math.round(size));
  return pendingBlocks(d, lesson)[0] ?? 1;
}

// ------------------------------------------------------------- placing

/** START hour of the block containing the clicked cell. null if nothing is placed. */
export function blockStart(d: State, classId: Id, day: number, hour: number): number | null {
  const found = blockAt(d, classId, day, hour);
  return found?.hour ?? null;
}

/** The whole block containing the clicked cell — where it starts and how long. */
export function blockAt(
  d: State,
  classId: Id,
  day: number,
  hour: number,
): PlacedBlock | null {
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
export function place(
  d: State,
  lessonId: Id,
  day: number,
  hour: number,
  size?: number,
): State {
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return d;

  const block = blockSizeFor(d, lesson, size);
  const placements = { ...activePlacements(d) };
  for (let i = 0; i < block; i++) {
    placements[placementKey(lesson.classId, day, hour + i)] = lessonId;
  }
  return replaceActiveGrid(d, { placements });
}

/** A block identity that remains unambiguous when one lesson has several blocks. */
export interface BlockRef extends PlacedBlock {
  lessonId: Id;
  classId: Id;
}

export function sameBlock(d: State, ref: BlockRef): boolean {
  if (activePlacements(d)[placementKey(ref.classId, ref.day, ref.hour)] !== ref.lessonId) {
    return false;
  }
  const found = blockAt(d, ref.classId, ref.day, ref.hour);
  return found !== null && found.hour === ref.hour && found.size === ref.size;
}

export function refAt(d: State, lessonId: Id, day: number, hour: number): BlockRef | null {
  const lesson = d.lessons.find((x) => x.id === lessonId);
  if (lesson === undefined) return null;
  const found = blockAt(d, lesson.classId, day, hour);
  return found === null
    ? null
    : { lessonId, classId: lesson.classId, day: found.day, hour: found.hour, size: found.size };
}

// ------------------------------------------------- in-place placing (solver)

/**
 * `place()` and `buildIndex()` in one, writing into the SAME objects instead of
 * producing new ones. Only the solver uses this pair.
 *
 * Why it exists: backtracking touches the grid tens of thousands of times, and
 * `place()` copies a ~430-key dictionary every call while `buildIndex()` walks
 * the whole thing. Both are the right shape for a single user action and the
 * wrong shape for a search.
 *
 * Why it is safe: `blocker()` and the rule functions only ever READ
 * `placements` and the index, so mutating them in place reuses the constraint
 * engine verbatim rather than re-implementing it. The one thing that could
 * drift is this function against `place()` itself, which is exactly what
 * `constraints.test.ts` pins down.
 */
export function occupy(
  placements: Record<string, Id>,
  ix: Index,
  lesson: Lesson,
  roomId: Id | null,
  day: number,
  hour: number,
  /** REQUIRED, unlike everywhere else: these two are the search's inner loop
      and a wrong length here corrupts the index silently rather than refusing
      a drop. The caller always knows which block it is moving. */
  size: number,
): void {
  const block = Math.max(1, Math.round(size));
  for (let i = 0; i < block; i++) {
    const h = hour + i;
    placements[placementKey(lesson.classId, day, h)] = lesson.id;
    ix.teacherBusy.set(teacherKey(lesson.teacherId, day, h), lesson.id);
    if (roomId != null) ix.roomBusy.set(closedKey(roomId, day, h), lesson.id);
  }
  ix.placedHours.set(lesson.id, (ix.placedHours.get(lesson.id) ?? 0) + block);
}

/** Undoes exactly one `occupy()`. */
export function vacate(
  placements: Record<string, Id>,
  ix: Index,
  lesson: Lesson,
  roomId: Id | null,
  day: number,
  hour: number,
  /** REQUIRED, unlike everywhere else: these two are the search's inner loop
      and a wrong length here corrupts the index silently rather than refusing
      a drop. The caller always knows which block it is moving. */
  size: number,
): void {
  const block = Math.max(1, Math.round(size));
  for (let i = 0; i < block; i++) {
    const h = hour + i;
    delete placements[placementKey(lesson.classId, day, h)];
    ix.teacherBusy.delete(teacherKey(lesson.teacherId, day, h));
    if (roomId != null) ix.roomBusy.delete(closedKey(roomId, day, h));
  }
  const left = (ix.placedHours.get(lesson.id) ?? 0) - block;
  if (left > 0) ix.placedHours.set(lesson.id, left);
  else ix.placedHours.delete(lesson.id);
}

/** Counter: how many hours of this lesson are on the grid. */
export function countPlacedHours(d: State, lessonId: Id): number {
  let n = 0;
  const placements = activePlacements(d);
  for (const key in placements) {
    if (placements[key] === lessonId) n++;
  }
  return n;
}
