// Who is busy where: the index `placements` is turned into (teacher, room and
// lesson lookups, placed hours, the not-same-day pairs), and the solver's
// in-place `occupy` and `vacate`, the pair `place()` and `buildIndex()` would
// cost a dictionary copy for. Part of the constraint engine (`index.ts`).

import {
  type ClassGroup,
  type Id,
  type Lesson,
  type Room,
  type State,
  type Teacher,
  closedKey,
  placementKey,
} from '../../leaf/model';
import { activePlacements } from '../grid';

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
  /** lessonId -> the lessons it may not share a day with (State.relations, both ends). */
  notSameDay: Map<Id, Id[]>;
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

    // Cut in place rather than through `parseKey`: this loop needs the day and
    // the hour and never the class, and building the id and an object per
    // placement made `buildIndex` 1.10x slower in an A/B run (WORKLOG
    // 2026-09-11). The keys here went through `sanitize` or `placementKey`, so
    // both cuts read them the same.
    const sep = key.lastIndexOf('|');
    const prevSep = key.lastIndexOf('|', sep - 1);
    const day = Number(key.slice(prevSep + 1, sep));
    const hour = Number(key.slice(sep + 1));

    placedHours.set(lessonId, (placedHours.get(lessonId) ?? 0) + 1);
    teacherBusy.set(closedKey(lesson.teacherId, day, hour), lessonId);

    const roomId = classById.get(lesson.classId)?.roomId;
    if (roomId != null) roomBusy.set(closedKey(roomId, day, hour), lessonId);
  }

  const notSameDay = new Map<Id, Id[]>();
  for (const r of d.relations) {
    if (r.kind !== 'notSameDay') continue;
    const [a, b] = r.lessonIds;
    notSameDay.set(a, [...(notSameDay.get(a) ?? []), b]);
    notSameDay.set(b, [...(notSameDay.get(b) ?? []), a]);
  }

  return {
    teacherBusy,
    roomBusy,
    lessonById,
    classById,
    teacherById,
    roomById,
    placedHours,
    notSameDay,
  };
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
    ix.teacherBusy.set(closedKey(lesson.teacherId, day, h), lesson.id);
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
    ix.teacherBusy.delete(closedKey(lesson.teacherId, day, h));
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
