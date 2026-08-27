// Entity operations (add/update/delete). PURE functions, each returns a new State.
//
// Deletions ALWAYS end with sanitize(): deleting a teacher must delete their
// lessons, deleting a lesson must delete its placements. An orphan lessonId
// breaks the grid.

import { clampPairs } from './blocks';
import { buildIndex, closedKey, countPlacedHours, sanitize, teacherKey } from './constraints';
import type { Index } from './constraints';
// Type-only, erased at build time: import.ts knows nothing about State, so
// there is no runtime cycle (same arrangement as rules.ts <-> constraints.ts).
import type { ClassRow, LessonRow, TeacherRow } from './import';
import type {
  Bell,
  ClassGroup,
  Day,
  Gender,
  Id,
  Lesson,
  Limits,
  Rules,
  Settings,
  State,
  Teacher,
} from './types';
import { firstFreeColor, PALETTE_SIZE } from './palette';
import { SCHEMA_VERSION } from './types';

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
  Pazar: 'Pzr',
};

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

/**
 * What a gender reads as in PROSE: a chip, a count, a paste preview. ONE home,
 * because a chip saying "k" would be a chip nobody clicks.
 */
export const GENDER_LABEL: Record<Gender, string> = {
  '': 'Belirtilmemiş',
  k: 'Kadın',
  e: 'Erkek',
};

/**
 * And what it reads as in a TABLE CELL — the same split this file already
 * makes between `Teacher.name` and `Teacher.short`, and that `shortDay()`
 * makes for a weekday.
 *
 * Measured, not guessed: "Belirtilmemiş" wants 106 px at 100 % and 144 px at
 * 150 %, in a box whose inside is 71 px. Widening the column instead squeezed
 * the NAME column from 232 px to 26 px at 150 %, because eleven columns in a
 * `width: 100%` table are already over-subscribed there. A dash under a
 * heading that says "Cinsiyet" says the same thing in one character.
 */
export const GENDER_CELL: Record<Gender, string> = {
  '': '–',
  k: 'Kadın',
  e: 'Erkek',
};

export function genderLabel(gender: Gender): string {
  return GENDER_LABEL[gender];
}

export function genderCell(gender: Gender): string {
  return GENDER_CELL[gender];
}

/**
 * A pasted cell -> a stored letter. Deliberately generous: a column copied out
 * of Excel says "K", "Kadın", "kadin" or "KADIN" depending on who typed it, and
 * refusing four of those would send the reader back to retype 25 rows.
 *
 * Anything unrecognised — including an absent column — is "not stated" rather
 * than an error: a paste that half-fills this field is still a good paste.
 */
export function parseGender(raw: string): Gender {
  // Not listview's `fold`: this file already has a narrower `fold` of its own
  // for name matching, and one file with two folds is worse than one line of
  // lowercasing. The dotless ı is spelled out below instead of flattened.
  const text = raw.trim().toLocaleLowerCase('tr');
  if (text === 'k' || text === 'kadın' || text === 'kadin' || text === 'bayan') return 'k';
  if (text === 'e' || text === 'erkek' || text === 'bay') return 'e';
  return '';
}

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

// ----------------------------------------------------------------- subjects
//
// "Matematik" does not fit a 34px cell, and on A4 landscape a column is ~21mm.
// "Mat" fits. The full name is kept where there is room (row headings, the
// Kurulum tables, the printed page title).

/** Built in, so an empty project already reads well. Overridable, one by one. */
export const DEFAULT_SUBJECT_SHORTS: Record<string, string> = {
  Matematik: 'Mat',
  Fizik: 'Fzk',
  Geometri: 'Geo',
  Kimya: 'Kim',
  Biyoloji: 'Biy',
  Türkçe: 'Trk',
  Edebiyat: 'Edb',
  Tarih: 'Tar',
  Coğrafya: 'Coğ',
  İngilizce: 'İng',
  Felsefe: 'Fel',
  'Din Kültürü': 'Din',
  Almanca: 'Alm',
  Fransızca: 'Fra',
  Müzik: 'Müz',
  Resim: 'Res',
  'Beden Eğitimi': 'Bed',
  'Sosyal Bilgiler': 'Sos',
  'Fen Bilimleri': 'Fen',
  Rehberlik: 'Reh',
  'İnkılap Tarihi': 'İnk',
};

/** Lookup key: the user types "matematik" as readily as "Matematik". */
export function subjectKey(subject: string): string {
  return subject.trim().toLocaleLowerCase('tr');
}

const DEFAULT_BY_KEY = new Map(
  Object.entries(DEFAULT_SUBJECT_SHORTS).map(([name, short]) => [subjectKey(name), short]),
);

/** Override -> built-in table -> first three letters. */
export function subjectShort(settings: Settings, subject: string): string {
  const key = subjectKey(subject);
  if (key === '') return '';

  const override = settings.subjectShorts[key];
  if (override !== undefined && override.trim() !== '') return override.trim();

  const known = DEFAULT_BY_KEY.get(key);
  if (known !== undefined) return known;

  const head = subject.trim().slice(0, 3);
  return head.charAt(0).toLocaleUpperCase('tr') + head.slice(1);
}

/** What subjectShort() would say with no override at all. */
export function defaultSubjectShort(subject: string): string {
  return subjectShort({ subjectShorts: {} } as Settings, subject);
}

/**
 * Stores an override ONLY when it differs from the default; writing the default
 * back removes it. That keeps the backup small and lets a later, better
 * built-in table reach an old project by itself.
 */
export function setSubjectShort(d: State, subject: string, value: string): State {
  const key = subjectKey(subject);
  if (key === '') return d;

  const next = { ...d.settings.subjectShorts };
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === defaultSubjectShort(subject)) delete next[key];
  else next[key] = trimmed;

  return { ...d, settings: { ...d.settings, subjectShorts: next } };
}

/** The distinct subjects actually taught, in the order the teachers were added. */
export function usedSubjects(d: State): string[] {
  const seen = new Map<string, string>();
  for (const t of d.teachers) {
    const key = subjectKey(t.subject);
    if (key !== '' && !seen.has(key)) seen.set(key, t.subject.trim());
  }
  return [...seen.values()];
}

/** The built-in list, in the order it is written above. */
export function defaultSubjects(): string[] {
  return Object.keys(DEFAULT_SUBJECT_SHORTS);
}

/**
 * The subjects offered by the Branş dropdown: the school's own list plus
 * anything a teacher already carries. The second half matters — an old backup,
 * or a pasted list, can hold a subject nobody put in the list, and a dropdown
 * that cannot show a teacher's current subject would silently change it.
 */
export function subjectOptions(d: State): string[] {
  const seen = new Map<string, string>();
  for (const name of [...d.settings.subjects, ...usedSubjects(d)]) {
    const key = subjectKey(name);
    if (key !== '' && !seen.has(key)) seen.set(key, name.trim());
  }
  return [...seen.values()];
}

/** How many teachers carry this subject. Deleting one is refused while > 0. */
export function subjectTeachers(d: State, subject: string): Teacher[] {
  const key = subjectKey(subject);
  return d.teachers.filter((t) => subjectKey(t.subject) === key);
}

/** No duplicates, no blanks — the same name twice would be two dropdown rows. */
export function addSubject(d: State, name: string): State {
  const clean = name.trim();
  const key = subjectKey(clean);
  if (key === '') return d;
  if (d.settings.subjects.some((x) => subjectKey(x) === key)) return d;
  return { ...d, settings: { ...d.settings, subjects: [...d.settings.subjects, clean] } };
}

/**
 * Removes a subject from the list. The teachers' `subject` strings are NOT
 * touched: nothing may delete a teacher's branch as a side effect. A subject
 * still in use simply cannot be removed — the caller checks subjectTeachers()
 * first and says who is using it.
 */
export function deleteSubject(d: State, name: string): State {
  const key = subjectKey(name);
  const subjects = d.settings.subjects.filter((x) => subjectKey(x) !== key);
  if (subjects.length === d.settings.subjects.length) return d;
  return { ...d, settings: { ...d.settings, subjects } };
}

/**
 * Hands out a fresh colour to every teacher (or class) in list order. Only ever
 * called from the button in Ayarlar: after a few deletions the used indexes are
 * full of holes and two neighbouring rows can end up looking alike.
 */
export function respreadColors(d: State, kind: 'teacher' | 'class'): State {
  if (kind === 'teacher') {
    return { ...d, teachers: d.teachers.map((t, i) => ({ ...t, color: i % PALETTE_SIZE })) };
  }
  return { ...d, classes: d.classes.map((c, i) => ({ ...c, color: i % PALETTE_SIZE })) };
}

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
    : ({ ...d, [kind]: next } as State);
}

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
    subjects: defaultSubjects(),
    subjectShorts: {},
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
  // `gender` is OPTIONAL rather than part of the Omit: every caller that
  // predates it — the add form, the paste rows, a dozen tests — still hands
  // over three fields, and a required fourth would have made a listing
  // question into a compile error everywhere.
  fields: Omit<Teacher, 'id' | 'color' | 'limits' | 'gender'> & { gender?: Gender },
): State {
  // An empty short form would leave a nameless row in the grid: derive one.
  const short = fields.short.trim() === '' ? makeShort(fields.name) : fields.short;
  const created: Teacher = {
    id: newId(),
    name: fields.name.trim(),
    short: short.trim(),
    subject: fields.subject.trim(),
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
  };
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
  const weeklyHours = Math.max(1, Math.round(fields.weeklyHours));
  const created: Lesson = {
    id: newId(),
    classId: fields.classId,
    teacherId: fields.teacherId,
    weeklyHours,
    pairs: clampPairs(weeklyHours, fields.pairs),
    maxPerDay: null,
  };
  return { ...d, lessons: [...d.lessons, created] };
}

export function updateLesson(d: State, id: Id, fields: Partial<Lesson>): State {
  const before = d.lessons.find((x) => x.id === id);
  const lessons = d.lessons.map((x) => {
    if (x.id !== id) return x;
    const merged = { ...x, ...fields, id };
    // Raising the hours leaves the twos alone; lowering them can force the
    // shape to shrink, and the clamp is the one place that says by how much.
    return { ...merged, pairs: clampPairs(merged.weeklyHours, merged.pairs) };
  });

  // If the SPLIT changed, the placed blocks are the wrong lengths and the
  // convention that reads them off the grid would chop the same cells up
  // differently; safest is to drop them.
  const after = lessons.find((x) => x.id === id);
  const splitChanged =
    before !== undefined && after !== undefined && before.pairs !== after.pairs;
  if (!splitChanged) return { ...d, lessons };

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

/**
 * How many of the week's cells are still OPEN for one teacher, class or room.
 *
 * Lived inside Availability.tsx as a nested double loop; it is a count over the
 * data, not a rendering concern, and the availability panel now shows it for
 * every entity at once rather than only for the selected one.
 */
export function openHours(d: State, entityId: Id): number {
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  let closed = 0;
  for (let g = 0; g < dayCount; g++) {
    for (let s = 0; s < hourCount; s++) {
      if (d.unavailable[closedKey(entityId, g, s)] !== undefined) closed++;
    }
  }
  return dayCount * hourCount - closed;
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

// ------------------------------------------------------- pasted rows -> state
//
// These used to live inside Setup.tsx, untested. Matching a room or a teacher
// by name is a decision about the data, not about the screen — and getting it
// wrong silently drops rows my father pasted.

const fold = (x: string): string => x.trim().toLocaleLowerCase('tr');

/**
 * Adds pasted teachers, REGISTERING any subject the school's list does not have
 * yet. A pasted list is the one way a subject can still arrive as free text —
 * the form only offers the list — and dropping it silently would leave a
 * teacher whose branch the dropdown cannot show.
 */
export function addTeachersFromRows(d: State, rows: TeacherRow[]): State {
  return rows.reduce((acc, row) => addTeacher(addSubject(acc, row.subject), row), d);
}

/**
 * Adds pasted classes, resolving the room by name. An unknown room name is
 * CREATED: leaving the class roomless would silently disable the room clash
 * check, and my father would never learn why two classes may share an hour.
 */
export function addClassesFromRows(d: State, rows: ClassRow[]): State {
  return rows.reduce((acc, row) => {
    if (row.roomName === '') return addClass(acc, row.name, null);

    const room = acc.rooms.find((r) => fold(r.name) === fold(row.roomName));
    if (room !== undefined) return addClass(acc, row.name, room.id);

    const withRoom = addRoom(acc, row.roomName);
    const created = withRoom.rooms[withRoom.rooms.length - 1];
    return addClass(withRoom, row.name, created?.id ?? null);
  }, d);
}

/**
 * Adds pasted lessons. A teacher matches on the short form OR the full name,
 * because a pasted list may hold either. Rows whose class or teacher is unknown
 * are NOT guessed at — they come back in `missing` so the user is told.
 */
export function addLessonsFromRows(
  d: State,
  rows: LessonRow[],
): { state: State; missing: string[] } {
  let state = d;
  const missing: string[] = [];

  for (const row of rows) {
    const group = state.classes.find((c) => fold(c.name) === fold(row.className));
    const teacher = state.teachers.find(
      (t) => fold(t.short) === fold(row.teacher) || fold(t.name) === fold(row.teacher),
    );
    if (group === undefined || teacher === undefined) {
      missing.push(`${row.className} / ${row.teacher}`);
      continue;
    }
    state = addLesson(state, {
      classId: group.id,
      teacherId: teacher.id,
      weeklyHours: row.weeklyHours,
      pairs: row.pairs,
    });
  }
  return { state, missing };
}

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
 * Lesson labels: a comma separated list if one was typed, otherwise 1..n.
 * `count` is clamped to 1..16 — a school day with 0 or 40 lessons is a typo.
 */
export function hourLabels(count: number, names?: string): string[] {
  if (names !== undefined && names.trim() !== '') {
    const list = names
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x !== '');
    if (list.length > 0) return list;
  }
  return hourNames(Math.min(16, Math.max(1, count)));
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

// --------------------------------------------------------------- deleting
//
// All four deletions cascade, and until now two of them (room, lesson) asked
// nothing at all while the other two only asked when a lesson hung off them —
// a teacher with 0 lessons vanished in silence. Ctrl+Z is the second net; this
// is the first one.

export type EntityKind = 'room' | 'teacher' | 'class' | 'lesson';

const plural = (n: number, word: string): string => `${n} ${word}`;

/**
 * What exactly is about to be lost, COUNTED — never guessed. The sentence is
 * what decides whether my father presses Enter or Escape, so it names the
 * classes that lose their room instead of saying "some classes".
 *
 * TWO PARTS, because the dialog that shows it has two: a heading that says
 * what is about to happen, and a line under it that says what it costs. It
 * used to be one string ending in "Devam edilsin mi?" — correct for
 * `window.confirm`, which has one text field and answers with its own two
 * buttons. Splitting it by looking for a full stop would have been pitfall 22
 * all over again (counting sentences in a string that is built from data), so
 * the split is made HERE, where the two halves are written.
 *
 * `deletionSummary` below rebuilds the old string from these two, unchanged,
 * so nothing that reads it has to care.
 */
export interface DeletionQuestion {
  /** "MÇ (Mehmet Çelik) silinecek" — no full stop, no question mark. */
  title: string;
  /** "2 dersi ve programa yerleşmiş 2 saati de gidecek." — may be empty. */
  cost: string;
}

export function deletionQuestion(d: State, kind: EntityKind, id: Id): DeletionQuestion {
  if (kind === 'room') {
    const room = d.rooms.find((x) => x.id === id);
    if (room === undefined) return { title: 'Bu derslik silinecek', cost: '' };
    const groups = roomClasses(d, id);
    if (groups.length === 0) return { title: `${room.name} dersliği silinecek`, cost: '' };
    return {
      title: `${room.name} dersliği silinecek`,
      cost:
        `${plural(groups.length, 'sınıfın')} dersliği boşalacak ` +
        `(${groups.map((c) => c.name).join(', ')}) ve derslik çakışması artık ` +
        'kontrol edilmeyecek.',
    };
  }

  if (kind === 'lesson') {
    const lesson = d.lessons.find((x) => x.id === id);
    if (lesson === undefined) return { title: 'Bu ders silinecek', cost: '' };
    const group = d.classes.find((c) => c.id === lesson.classId);
    const teacher = d.teachers.find((t) => t.id === lesson.teacherId);
    const who = `${group?.name ?? '?'} sınıfının ${teacher?.short ?? '?'} dersi`;
    const placed = countPlacedHours(d, id);
    if (placed === 0) {
      return { title: `${who} silinecek (${plural(lesson.weeklyHours, 'saat')})`, cost: '' };
    }
    return {
      title: `${who} silinecek`,
      cost: `Programa yerleşmiş ${plural(placed, 'saati')} de kalkacak.`,
    };
  }

  const lessons =
    kind === 'teacher'
      ? d.lessons.filter((x) => x.teacherId === id)
      : d.lessons.filter((x) => x.classId === id);
  const placed = lessons.reduce((sum, x) => sum + countPlacedHours(d, x.id), 0);

  const who =
    kind === 'teacher'
      ? (() => {
          const t = d.teachers.find((x) => x.id === id);
          return t === undefined ? 'Bu öğretmen' : `${t.short} (${t.name})`;
        })()
      : (() => {
          const c = d.classes.find((x) => x.id === id);
          return c === undefined ? 'Bu sınıf' : `${c.name} sınıfı`;
        })();

  if (lessons.length === 0) return { title: `${who} silinecek`, cost: '' };
  if (placed === 0) {
    return { title: `${who} silinecek`, cost: `${plural(lessons.length, 'dersi')} de gidecek.` };
  }
  return {
    title: `${who} silinecek`,
    cost:
      `${plural(lessons.length, 'dersi')} ve programa yerleşmiş ` +
      `${plural(placed, 'saati')} de gidecek.`,
  };
}

/**
 * The same thing as ONE sentence, ending in the question `window.confirm` had
 * to ask for itself. Kept because it is what the tests hold and because a
 * caller that only has one text field still exists in principle.
 */
export function deletionSummary(d: State, kind: EntityKind, id: Id): string {
  const { title, cost } = deletionQuestion(d, kind, id);
  return `${title}. ${cost === '' ? '' : `${cost} `}Devam edilsin mi?`;
}

/**
 * How many lessons still have hours waiting in the pool.
 *
 * The tool strip needs this number for "Otomatik diz (N)" but must not build
 * the pool to get it: `buildPool` in Program.tsx is memoised beside the grid's
 * rows and lifting it into App would put 99 cards' worth of work in the render
 * that owns the 2100-cell table. This counts and stops.
 */
export function pendingLessons(d: State, ix: Index): number {
  let n = 0;
  for (const lesson of d.lessons) {
    if ((ix.placedHours.get(lesson.id) ?? 0) < lesson.weeklyHours) n++;
  }
  return n;
}

// -------------------------------------------------- one entity, on its own
//
// "Her derslik, sınıf ya da öğretmenin üzerine tıklandığında bilgileri ve
// programının gözükmesi" — the reader's own words, and the one thing the tool
// could not do at all. The information existed: it was spread across the
// Program grid (one row of it), the Müsaitlik grid (one row of it), the
// Kurulum list (one row of it) and Kontrol (one line of it), and putting them
// together meant four tabs and remembering.
//
// Pure, and here rather than in the panel that shows it: a `.tsx` file that
// walks `placements` is a `.tsx` file doing timetable logic.

export type InspectKind = 'teacher' | 'class' | 'room';

export interface WeekCell {
  /** What the cell says. Two lines, like a grid card. Empty when free. */
  top: string;
  bottom: string;
  /** Palette index that paints it, or null when nothing is placed. */
  color: number | null;
  /** This entity cannot be used at this hour. */
  closed: boolean;
  /** A lesson is sitting on an hour that was closed AFTERWARDS (pitfall 16). */
  conflict: boolean;
}

/**
 * One entity's week: rows are DAYS and columns are lessons.
 *
 * The same way round as Müsaitlik and the printed sheet, and deliberately not
 * the same way round as the Program grid — this is a "read one day" screen,
 * and that is the axis those are set on.
 */
export function entityWeek(d: State, kind: InspectKind, id: Id): WeekCell[][] {
  const ix = buildIndex(d);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const week: WeekCell[][] = [];

  for (let day = 0; day < dayCount; day++) {
    const row: WeekCell[] = [];
    for (let hour = 0; hour < hourCount; hour++) {
      const closed = d.unavailable[`${id}|${day}|${hour}`] === 1;
      const lessonId =
        kind === 'class'
          ? d.placements[`${id}|${day}|${hour}`]
          : kind === 'teacher'
            ? ix.teacherBusy.get(teacherKey(id, day, hour))
            : ix.roomBusy.get(`${id}|${day}|${hour}`);

      const lesson = lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
      if (lesson === undefined) {
        row.push({ top: '', bottom: '', color: null, closed, conflict: false });
        continue;
      }

      const group = ix.classById.get(lesson.classId);
      const teacher = ix.teacherById.get(lesson.teacherId);
      // A class's own week reads "who is teaching me"; everyone else's reads
      // "which class am I with". The colour follows the same rule the grid
      // does: the TEACHER paints, the class is a mark.
      row.push(
        kind === 'class'
          ? {
              top: teacher?.short ?? '?',
              bottom: teacher === undefined ? '' : subjectShort(d.settings, teacher.subject),
              color: teacher?.color ?? null,
              closed,
              conflict: closed,
            }
          : {
              top: group?.name ?? '?',
              bottom: kind === 'teacher' ? roomName(d, group?.roomId ?? null) : (teacher?.short ?? ''),
              color: teacher?.color ?? null,
              closed,
              conflict: closed,
            },
      );
    }
    week.push(row);
  }
  return week;
}

export interface EntityFacts {
  /** "MÇ" / "510" / "A" — what the grid calls it. */
  short: string;
  /** "Mehmet Çelik" / "510 sınıfı" / "A dersliği". */
  name: string;
  /** Its own palette colour, or null: a room has none. */
  color: number | null;
  /** Counted lines for the panel. Never estimated. */
  rows: Array<{ label: string; value: string; tight: boolean }>;
  /** Sentences that name the other entities it is tied to. */
  links: string[];
}

/**
 * The counted facts. Every number here is one somebody could otherwise only
 * get by cross-reading two tabs, and the `tight` flag is what turns a number
 * into a warning: a load that does not fit the open hours cannot be laid out,
 * and that is worth saying WHERE the load is shown rather than only in Kontrol.
 */
export function entityFacts(d: State, kind: InspectKind, id: Id): EntityFacts | null {
  const load = weeklyLoad(d, kind, id);
  const open = openHours(d, id);
  const week = d.settings.days.length * d.settings.hours.length;
  const ix = buildIndex(d);

  let placed = 0;
  for (const row of entityWeek(d, kind, id)) {
    for (const cell of row) if (cell.color !== null) placed++;
  }

  const common = (short: string, name: string, color: number | null, links: string[]) => ({
    short,
    name,
    color,
    links,
    rows: [
      { label: 'Haftalık ders yükü', value: `${load} saat`, tight: load > open },
      { label: 'Açık saat', value: `${open} / ${week}`, tight: open < load },
      { label: 'Programa yerleşmiş', value: `${placed} / ${load} saat`, tight: placed < load },
      { label: 'Kapalı saat', value: `${week - open} saat`, tight: false },
    ],
  });

  if (kind === 'teacher') {
    const t = ix.teacherById.get(id);
    if (t === undefined) return null;
    const lessons = d.lessons.filter((x) => x.teacherId === id);
    const classes = [...new Set(lessons.map((x) => ix.classById.get(x.classId)?.name ?? '?'))];
    return {
      ...common(t.short, t.name, t.color, [
        `Branşı: ${t.subject}`,
        lessons.length === 0
          ? 'Henüz dersi yok'
          : `${lessons.length} dersi var: ${classes.join(', ')}`,
      ]),
    };
  }

  if (kind === 'class') {
    const c = ix.classById.get(id);
    if (c === undefined) return null;
    const lessons = d.lessons.filter((x) => x.classId === id);
    const teachers = [...new Set(lessons.map((x) => ix.teacherById.get(x.teacherId)?.short ?? '?'))];
    return {
      ...common(c.name, `${c.name} sınıfı`, c.color, [
        `Dersliği: ${roomName(d, c.roomId)}`,
        lessons.length === 0
          ? 'Henüz dersi yok'
          : `${lessons.length} dersi var: ${teachers.join(', ')}`,
      ]),
    };
  }

  const r = ix.roomById.get(id);
  if (r === undefined) return null;
  const groups = roomClasses(d, id);
  return {
    ...common(r.name, `${r.name} dersliği`, null, [
      groups.length === 0
        ? 'Hiçbir sınıf bu dersliği kullanmıyor'
        : `${groups.length} sınıf paylaşıyor: ${groups.map((c) => c.name).join(', ')}`,
    ]),
  };
}
