// Teachers: add, edit, delete — plus the abbreviation rule, which lives here
// because `addTeacher` is what derives one when the reader leaves it blank.

import { sanitize } from '../constraints';
import { NO_TEACHER_LIMITS } from './defaults';
import { newId } from './ids';
import { firstFreeColor } from '../palette';
import type { Gender, Id, State, Teacher } from '../types';

/**
 * "Mehmet Çelik" -> "MÇ". Two initials, Turkish uppercase (i -> İ).
 *
 * ONE home: it was written twice (import.ts and sample.ts) and the second copy
 * split on a single space, so a double space produced "" instead of "??".
 */
export function makeShort(name: string): string {
  const parts = name.split(/\s+/).filter((x) => x.length > 0);
  if (parts.length === 0) return '??';
  return parts
    .slice(0, 2)
    .map((p) => (p[0] ?? '').toLocaleUpperCase('tr'))
    .join('');
}

export function addTeacher(
  d: State,
  // `gender` and `subject2` are OPTIONAL rather than part of the Omit: every
  // caller that predates them — the add form, the paste rows, a dozen tests —
  // still hands over three fields, and a required fourth would have made a
  // listing question into a compile error everywhere.
  fields: Omit<Teacher, 'id' | 'color' | 'limits' | 'gender' | 'subject2'> & {
    gender?: Gender;
    subject2?: string;
  },
): State {
  // An empty short form would leave a nameless row in the grid: derive one.
  const short = fields.short.trim() === '' ? makeShort(fields.name) : fields.short;
  const created: Teacher = {
    id: newId(),
    name: fields.name.trim(),
    short: short.trim(),
    subject: fields.subject.trim(),
    subject2: (fields.subject2 ?? '').trim(),
    gender: fields.gender ?? '',
    color: firstFreeColor(d.teachers.map((x) => x.color)),
    limits: { ...NO_TEACHER_LIMITS },
  };
  return { ...d, teachers: [...d.teachers, created] };
}

/** One limit box on one teacher. null -> fall back to the school-wide default. */
export function setTeacherLimit(
  d: State,
  id: Id,
  key: keyof Teacher['limits'],
  value: number | null,
): State {
  return {
    ...d,
    teachers: d.teachers.map((t) =>
      t.id === id ? { ...t, limits: { ...t.limits, [key]: value } } : t,
    ),
  };
}

export function updateTeacher(d: State, id: Id, fields: Partial<Teacher>): State {
  return {
    ...d,
    teachers: d.teachers.map((x) => (x.id === id ? { ...x, ...fields, id } : x)),
  };
}

// sanitize(): deleting a teacher deletes their lessons, and deleting a lesson
// deletes its placements. An orphan lessonId breaks the grid.
export function deleteTeacher(d: State, id: Id): State {
  return sanitize({ ...d, teachers: d.teachers.filter((x) => x.id !== id) });
}
