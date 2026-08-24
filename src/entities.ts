// Entity operations (add/update/delete). PURE functions, each returns a new State.
//
// Deletions ALWAYS end with sanitize(): deleting a teacher must delete their
// lessons, deleting a lesson must delete its placements. An orphan lessonId
// breaks the grid.

import { closedKey, sanitize } from './constraints';
import type {
  Bell,
  ClassGroup,
  Day,
  Id,
  Lesson,
  Limits,
  Rules,
  Settings,
  State,
  Teacher,
} from './types';
import { COLOR_COUNT, SCHEMA_VERSION } from './types';

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // no lookalikes: l, o, 0, 1

export function newId(): Id {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

/** The week in calendar order. The checkboxes in Setup are built from this. */
export const WEEK = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

/** Monday is NOT taught at this school; the week runs Tuesday to Sunday. */
export const DEFAULT_DAY_NAMES = WEEK.slice(1);

const WEEKEND = new Set(['Cumartesi', 'Pazar']);

/**
 * Column headers. NOT the first three letters: "Cuma" and "Cumartesi" both give
 * "Cum" and the availability grid becomes unreadable.
 */
const SHORT_DAY: Record<string, string> = {
  Pazartesi: 'Pzt',
  Salı: 'Sal',
  Çarşamba: 'Çar',
  Perşembe: 'Per',
  Cuma: 'Cum',
  Cumartesi: 'Cmt',
  Pazar: 'Paz',
};

export function shortDay(name: string): string {
  return SHORT_DAY[name] ?? name.slice(0, 3);
}

/** 40 min lesson, 10 min break, 09:00 start, 30 min lunch -> 12th ends 19:10. */
export const DEFAULT_BELL: Bell = {
  start: '09:00',
  lessonMinutes: 40,
  breakMinutes: 10,
  longBreakMinutes: 30,
};

/** On weekdays the long break falls after the 5th lesson, at the weekend after the 6th. */
export function defaultLongBreak(dayName: string): number {
  return WEEKEND.has(dayName) ? 6 : 5;
}

export function makeDay(name: string): Day {
  return { name, longBreakAfter: defaultLongBreak(name) };
}

export function defaultDays(): Day[] {
  return DEFAULT_DAY_NAMES.map(makeDay);
}

/** 0 = no limit. Nothing is guessed: my father fills these in himself (principle 5). */
export const DEFAULT_LIMITS: Limits = {
  maxConsecutive: 0,
  maxPerDay: 0,
  minPerDay: 0,
  maxSameLessonPerDay: 0,
};

export const DEFAULT_RULES: Rules = {
  maxConsecutive: 'block',
  maxPerDay: 'block',
  minPerDay: 'warn', // can never block: the first lesson of a day always breaches it
  maxSameLessonPerDay: 'block',
};

export const NO_TEACHER_LIMITS = {
  maxConsecutive: null,
  maxPerDay: null,
  minPerDay: null,
};

export function hourNames(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String(i + 1));
}

export function defaultSettings(): Settings {
  return {
    schoolName: '',
    days: defaultDays(),
    hours: hourNames(12),
    bell: { ...DEFAULT_BELL },
    limits: { ...DEFAULT_LIMITS },
    rules: { ...DEFAULT_RULES },
  };
}

export function emptyState(): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: defaultSettings(),
    rooms: [],
    teachers: [],
    classes: [],
    lessons: [],
    unavailable: {},
    placements: {},
  };
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
  fields: Omit<Teacher, 'id' | 'color' | 'limits'>,
): State {
  const created: Teacher = {
    id: newId(),
    name: fields.name.trim(),
    short: fields.short.trim(),
    subject: fields.subject.trim(),
    color: d.teachers.length % COLOR_COUNT,
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

export function deleteTeacher(d: State, id: Id): State {
  return sanitize({ ...d, teachers: d.teachers.filter((x) => x.id !== id) });
}

// -------------------------------------------------------------------- class

export function addClass(d: State, name: string, roomId: Id | null): State {
  const created: ClassGroup = { id: newId(), name: name.trim(), roomId };
  return { ...d, classes: [...d.classes, created] };
}

export function updateClass(d: State, id: Id, fields: Partial<ClassGroup>): State {
  return { ...d, classes: d.classes.map((x) => (x.id === id ? { ...x, ...fields, id } : x)) };
}

export function deleteClass(d: State, id: Id): State {
  return sanitize({ ...d, classes: d.classes.filter((x) => x.id !== id) });
}

// ------------------------------------------------------------------- lesson

export function addLesson(d: State, fields: Omit<Lesson, 'id' | 'maxPerDay'>): State {
  const created: Lesson = {
    id: newId(),
    classId: fields.classId,
    teacherId: fields.teacherId,
    weeklyHours: Math.max(1, Math.round(fields.weeklyHours)),
    blockSize: Math.min(3, Math.max(1, Math.round(fields.blockSize))),
    maxPerDay: null,
  };
  return { ...d, lessons: [...d.lessons, created] };
}

export function updateLesson(d: State, id: Id, fields: Partial<Lesson>): State {
  const lessons = d.lessons.map((x) => (x.id === id ? { ...x, ...fields, id } : x));
  // If the block size changed the old placements have the wrong length; safest is to drop them
  const blockChanged =
    fields.blockSize !== undefined &&
    d.lessons.find((x) => x.id === id)?.blockSize !== fields.blockSize;
  if (!blockChanged) return { ...d, lessons };

  const placements = { ...d.placements };
  for (const key in placements) {
    if (placements[key] === id) delete placements[key];
  }
  return { ...d, lessons, placements };
}

export function deleteLesson(d: State, id: Id): State {
  return sanitize({ ...d, lessons: d.lessons.filter((x) => x.id !== id) });
}

// ----------------------------------------------------------------- settings

/**
 * Rewrites placement/unavailable keys when the day LIST changes.
 *
 * Placement keys hold the day INDEX. Removing Monday from the front would shift
 * Tuesday from 1 to 0, silently moving the whole timetable one day earlier —
 * the old code never hit this because it only ever cut days off the END.
 * The mapping is therefore built from the day NAME (docs/PLAN.md pitfall 14).
 */
export function remapDays(d: State, nextDays: Day[]): State {
  const oldToNew = new Map<number, number>();
  const used = new Set<number>();

  for (const [newIndex, day] of nextDays.entries()) {
    const oldIndex = d.settings.days.findIndex(
      (old, i) => old.name === day.name && !used.has(i),
    );
    if (oldIndex === -1) continue; // a brand new day starts empty
    used.add(oldIndex);
    oldToNew.set(oldIndex, newIndex);
  }

  const move = <T,>(source: Record<string, T>): Record<string, T> => {
    const out: Record<string, T> = {};
    for (const key in source) {
      const value = source[key];
      if (value === undefined) continue;
      const parts = key.split('|');
      if (parts.length !== 3) continue;
      const target = oldToNew.get(Number(parts[1]));
      if (target === undefined) continue; // the day was removed
      out[`${parts[0]}|${target}|${parts[2]}`] = value;
    }
    return out;
  };

  // Nothing moved (a rename or a longBreakAfter change) -> keep the same object.
  const identity =
    nextDays.length === d.settings.days.length &&
    nextDays.every((_, i) => oldToNew.get(i) === i);
  if (identity) return d;

  return { ...d, placements: move(d.placements), unavailable: move(d.unavailable) };
}

/** Every settings write goes through here: remap first, then sanitize. */
export function updateSettings(d: State, next: Partial<Settings>): State {
  const withKeys = next.days === undefined ? d : remapDays(d, next.days);
  return sanitize({ ...withKeys, settings: { ...d.settings, ...next } });
}

export function updateBell(d: State, next: Partial<Bell>): State {
  return updateSettings(d, { bell: { ...d.settings.bell, ...next } });
}

export function updateLimits(d: State, next: Partial<Limits>): State {
  return updateSettings(d, { limits: { ...d.settings.limits, ...next } });
}

export function updateRules(d: State, next: Partial<Rules>): State {
  return updateSettings(d, { rules: { ...d.settings.rules, ...next } });
}

// ------------------------------------------------------------- availability

/** Works for a teacher, a class or a room — ids are unique across all three. */
export function setAvailability(
  d: State,
  entityId: Id,
  cells: Array<{ day: number; hour: number }>,
  makeUnavailable: boolean,
): State {
  const unavailable = { ...d.unavailable };
  for (const { day, hour } of cells) {
    const k = closedKey(entityId, day, hour);
    if (makeUnavailable) unavailable[k] = 1;
    else delete unavailable[k];
  }
  return { ...d, unavailable };
}

/** Marks the entity's WHOLE week as available / unavailable. */
export function setWholeWeek(d: State, entityId: Id, makeUnavailable: boolean): State {
  return setAvailability(d, entityId, allCells(d), makeUnavailable);
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
