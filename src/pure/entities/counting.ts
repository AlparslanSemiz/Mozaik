// Counting: weekly loads, hour labels, the names a list carries beyond its
// own, duplicate short forms and a plan's summary.

import type { Id, State, Teacher } from '../../leaf/model';
import { hourNames } from './defaults';
import { roomClasses } from './roster';

// ----------------------------------------------------------------- counting

/** Weekly hours loaded onto one teacher, class or room. */
export function weeklyLoad(d: State, kind: 'teacher' | 'class' | 'room', id: Id): number {
  const lessons =
    kind === 'teacher'
      ? d.lessons.filter((x) => x.teacherId === id)
      : kind === 'class'
        ? d.lessons.filter((x) => x.classId === id)
        : (() => {
            const ids = new Set(roomClasses(d, id).map((c) => c.id));
            return d.lessons.filter((x) => ids.has(x.classId));
          })();
  return lessons.reduce((sum, x) => sum + x.weeklyHours, 0);
}

/**
 * Lesson labels: `count` of them, named by the comma separated list where one
 * was typed and numbered where it ran out. `count` is clamped to 1..16 — a
 * school day with 0 or 40 lessons is a typo.
 *
 * The count is the count box's alone. The list used to BE the count, so four
 * names made a four-lesson day and took every lesson after the fourth off the
 * grid without a word, while the count box still said 12 (DENETIM DK9). Names
 * past the count are not used; `extraNames` says how many that was.
 */
export function hourLabels(count: number, names?: string): string[] {
  const list = nameList(names);
  return hourNames(Math.min(16, Math.max(1, count))).map((n, i) => list[i] ?? n);
}

/** How many of the typed names do not fit in a day of `count` lessons. */
export function extraNames(count: number, names: string): number {
  return Math.max(0, nameList(names).length - count);
}

function nameList(names: string | undefined): string[] {
  if (names === undefined) return [];
  return names
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x !== '');
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
