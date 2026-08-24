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
