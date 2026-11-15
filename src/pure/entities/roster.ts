// Rooms, teachers and classes: adding, updating and deleting them, the room
// lookups, and the manual order of every list.

import {
  type ClassGroup,
  type Gender,
  type Id,
  type State,
  type Teacher,
  firstFreeColor,
  cleanEmail,
} from '../../leaf/model';
import { sanitize } from '../constraints';
import { NO_TEACHER_LIMITS } from './defaults';
import { makeShort, newId } from './identity';

/** The lists the reader can put into an order of their own. */
export type ListKind = 'rooms' | 'teachers' | 'classes' | 'lessons' | 'subjects';

/**
 * Moves one row of one list to another position.
 *
 * There is NO order field and there will not be one: the array IS the order.
 * It survives `parseState` (asArray -> map -> spreadColors and asNames all
 * preserve it), `sanitize` never rebuilds `rooms` or `teachers` at all, and the
 * grid, the printer and every picker already read the list by mapping it — so
 * writing the array is the whole feature. A second `order: number` alongside it
 * would be a second truth to keep in step.
 *
 * `subjects` is the odd one and only in WHERE it lives — `settings.subjects`
 * rather than the top level — so it gets a branch here rather than its own
 * function. What it orders is the Branş dropdown on the Öğretmenler step.
 *
 * Returns `d` ITSELF when nothing moves. The reducer compares by identity to
 * decide whether a change is worth an undo step, so a drag that lands where it
 * started must be indistinguishable from no drag at all.
 */
export function reorderList(d: State, kind: ListKind, from: number, to: number): State {
  const list: readonly unknown[] = kind === 'subjects' ? d.settings.subjects : d[kind];
  if (from === to) return d;
  if (from < 0 || from >= list.length) return d;
  if (to < 0 || to >= list.length) return d;

  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return d;
  next.splice(to, 0, moved);
  // No sanitize(): an order change cannot orphan a placement or a closed hour.
  // Every key in those maps is built from ids, never from a position.
  return kind === 'subjects'
    ? { ...d, settings: { ...d.settings, subjects: next as string[] } }
    : { ...d, [kind]: next };
}
// --------------------------------------------------------------------- room

export function addRoom(d: State, name: string): State {
  return { ...d, rooms: [...d.rooms, { id: newId(), name: name.trim() }] };
}

export function updateRoom(d: State, id: Id, name: string): State {
  return {
    ...d,
    rooms: d.rooms.map((x) => (x.id === id ? { ...x, name: name.trim() } : x)),
  };
}

export function deleteRoom(d: State, id: Id): State {
  return sanitize({ ...d, rooms: d.rooms.filter((x) => x.id !== id) });
}

// ------------------------------------------------------------------ teacher

export function addTeacher(
  d: State,
  // `gender`, `subject2` and `email` are OPTIONAL rather than part of the
  // Omit: every caller that predates them — the add form, the paste rows, a
  // dozen tests — still hands over three fields, and each required newcomer
  // would have made a listing question into a compile error everywhere.
  fields: Omit<Teacher, 'id' | 'color' | 'limits' | 'gender' | 'subject2' | 'email'> & {
    gender?: Gender;
    subject2?: string;
    email?: string;
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
    email: cleanEmail(fields.email),
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

export function deleteTeacher(d: State, id: Id): State {
  return sanitize({ ...d, teachers: d.teachers.filter((x) => x.id !== id) });
}

// -------------------------------------------------------------------- class

export function addClass(d: State, name: string, roomId: Id | null): State {
  const created: ClassGroup = {
    id: newId(),
    name: name.trim(),
    roomId,
    color: firstFreeColor(d.classes.map((x) => x.color)),
    // Nothing is guessed: null means "use the school's number" (the former rule against guessed features).
    maxSameLessonPerDay: null,
  };
  return { ...d, classes: [...d.classes, created] };
}

export function updateClass(d: State, id: Id, fields: Partial<ClassGroup>): State {
  return { ...d, classes: d.classes.map((x) => (x.id === id ? { ...x, ...fields, id } : x)) };
}

export function deleteClass(d: State, id: Id): State {
  return sanitize({ ...d, classes: d.classes.filter((x) => x.id !== id) });
}

// ------------------------------------------------------------------ helpers

/** All classes bound to a room. For feasibility and room clash checks. */
export function roomClasses(d: State, roomId: Id): ClassGroup[] {
  return d.classes.filter((c) => c.roomId === roomId);
}

export function roomName(d: State, roomId: Id | null): string {
  if (roomId == null) return '';
  return d.rooms.find((x) => x.id === roomId)?.name ?? '';
}

export function allCells(d: State): Array<{ day: number; hour: number }> {
  const list: Array<{ day: number; hour: number }> = [];
  for (let g = 0; g < d.settings.days.length; g++) {
    for (let s = 0; s < d.settings.hours.length; s++) list.push({ day: g, hour: s });
  }
  return list;
}
