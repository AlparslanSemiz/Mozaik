// Dictionary keys. Their own module so `constraints.ts` and `rules.ts` can both
// use them without importing each other at runtime.
//
// The FORMAT is stored data: it lives in every backup file and in localStorage.
// Changing it silently orphans my father's timetable.

import type { Id } from './types';

export function placementKey(classId: Id, day: number, hour: number): string {
  return `${classId}|${day}|${hour}`;
}

/**
 * Closed-hours key. Teachers, classes and rooms share ONE dictionary because
 * ids are unique across the three lists.
 */
export function closedKey(entityId: Id, day: number, hour: number): string {
  return `${entityId}|${day}|${hour}`;
}

/** Older name for closedKey, kept because most call sites are about teachers. */
export const teacherKey = closedKey;

/** A placement or closed-hours key read back. `id` is a class, teacher or room. */
export interface KeyParts {
  id: Id;
  day: number;
  hour: number;
}

/**
 * Reads a placement or closed-hours key. Anything that is not exactly three
 * `|`-separated parts is null: that is the rule `sanitize` drops a key by and
 * `remapDays` skips one by, and every other reader only ever sees keys that
 * went through one of them.
 *
 * It only cuts. Whether the day is inside the week or the hour is a number at
 * all stays with the caller, as it was before this function existed.
 */
export function parseKey(key: string): KeyParts | null {
  // Cut at the first and last separator rather than `split`: `buildIndex` reads
  // every placement through here on each drag, and the array `split` builds
  // made it 1.49x slower (measured, WORKLOG 2026-09-11).
  const first = key.indexOf('|');
  const last = key.lastIndexOf('|');
  if (first === -1 || first === last || key.indexOf('|', first + 1) !== last) return null;
  return {
    id: key.slice(0, first),
    day: Number(key.slice(first + 1, last)),
    hour: Number(key.slice(last + 1)),
  };
}

/**
 * The same key on another day, its other two parts copied exactly as stored.
 *
 * `remapDays` needs this rather than `placementKey(parts.id, day, parts.hour)`:
 * `sanitize` keeps a key as it found it once its numbers are integers, so an
 * hour written "07" is still "07" here, and printing it again from a number
 * would quietly rename a stored key. Null for anything `parseKey` rejects.
 */
export function keyOnDay(key: string, day: number): string | null {
  const first = key.indexOf('|');
  const last = key.lastIndexOf('|');
  if (first === -1 || first === last || key.indexOf('|', first + 1) !== last) return null;
  return `${key.slice(0, first)}|${day}|${key.slice(last + 1)}`;
}

/**
 * One cell of a map that is already about one row: `dropMap`'s verdicts and the
 * drag's own lookups, where the lesson in the air names the class. Never
 * stored, so unlike the keys above its format is free to change.
 */
export function cellKey(day: number, hour: number): string {
  return `${day}|${hour}`;
}

export function parseCellKey(key: string): { day: number; hour: number } {
  const cut = key.indexOf('|');
  return { day: Number(key.slice(0, cut)), hour: Number(key.slice(cut + 1)) };
}
