// Counting, not changing: the two numbers several screens ask for about a list.

import { roomClasses } from './roomCrud';
import type { Id, State, Teacher } from './types';

/** Weekly hours loaded onto one teacher, class or room. */
export function weeklyLoad(d: State, kind: 'teacher' | 'class' | 'room', id: Id): number {
  const lessons = loadedLessons(d, kind, id);
  return lessons.reduce((sum, x) => sum + x.weeklyHours, 0);
}

/** A room carries no lessons of its own; it carries the classes that sit in it. */
function loadedLessons(d: State, kind: 'teacher' | 'class' | 'room', id: Id) {
  if (kind === 'teacher') return d.lessons.filter((x) => x.teacherId === id);
  if (kind === 'class') return d.lessons.filter((x) => x.classId === id);
  const ids = new Set(roomClasses(d, id).map((c) => c.id));
  return d.lessons.filter((x) => ids.has(x.classId));
}

/**
 * Teachers whose short form is not unique.
 *
 * "Ahmet Sarı" and "Ayşe Solmaz" both derive "AS" — in a real 25-person list
 * this is not a corner case, it happens. Two identical row headings in the grid
 * are indistinguishable, and the timetable is dragged by those headings.
 */
export function duplicateShorts(teachers: Teacher[]): Array<{ short: string; names: string[] }> {
  const byShort = new Map<string, string[]>();
  for (const t of teachers) {
    const key = t.short.trim().toLocaleUpperCase('tr');
    if (key === '') continue;
    byShort.set(key, [...(byShort.get(key) ?? []), t.name]);
  }
  return [...byShort.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([short, names]) => ({ short, names }));
}
