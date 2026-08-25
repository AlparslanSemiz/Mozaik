// Entity operations (add/update/delete). PURE functions, each returns a new State.
//
// Deletions ALWAYS end with sanitize(): deleting a teacher must delete their
// lessons, deleting a lesson must delete its placements. An orphan lessonId
// breaks the grid.

import { closedKey, countPlacedHours, sanitize } from './constraints';
// Type-only, erased at build time: import.ts knows nothing about State, so
// there is no runtime cycle (same arrangement as rules.ts <-> constraints.ts).
import type { ClassRow, LessonRow, TeacherRow } from './import';
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
  fields: Omit<Teacher, 'id' | 'color' | 'limits'>,
): State {
  // An empty short form would leave a nameless row in the grid: derive one.
  const short = fields.short.trim() === '' ? makeShort(fields.name) : fields.short;
  const created: Teacher = {
    id: newId(),
    name: fields.name.trim(),
    short: short.trim(),
    subject: fields.subject.trim(),
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
      blockSize: row.blockSize,
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
 */
export function deletionSummary(d: State, kind: EntityKind, id: Id): string {
  if (kind === 'room') {
    const room = d.rooms.find((x) => x.id === id);
    if (room === undefined) return 'Bu derslik silinecek. Devam edilsin mi?';
    const groups = roomClasses(d, id);
    if (groups.length === 0) {
      return `${room.name} dersliği silinecek. Devam edilsin mi?`;
    }
    return (
      `${room.name} dersliği silinecek. ` +
      `${plural(groups.length, 'sınıfın')} dersliği boşalacak ` +
      `(${groups.map((c) => c.name).join(', ')}) ve derslik çakışması artık ` +
      'kontrol edilmeyecek. Devam edilsin mi?'
    );
  }

  if (kind === 'lesson') {
    const lesson = d.lessons.find((x) => x.id === id);
    if (lesson === undefined) return 'Bu ders silinecek. Devam edilsin mi?';
    const group = d.classes.find((c) => c.id === lesson.classId);
    const teacher = d.teachers.find((t) => t.id === lesson.teacherId);
    const who = `${group?.name ?? '?'} sınıfının ${teacher?.short ?? '?'} dersi`;
    const placed = countPlacedHours(d, id);
    if (placed === 0) {
      return `${who} silinecek (${plural(lesson.weeklyHours, 'saat')}). Devam edilsin mi?`;
    }
    return (
      `${who} silinecek. Programa yerleşmiş ${plural(placed, 'saati')} de kalkacak. ` +
      'Devam edilsin mi?'
    );
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

  if (lessons.length === 0) return `${who} silinecek. Devam edilsin mi?`;
  if (placed === 0) {
    return `${who} silinecek. ${plural(lessons.length, 'dersi')} de gidecek. Devam edilsin mi?`;
  }
  return (
    `${who} silinecek. ${plural(lessons.length, 'dersi')} ve programa yerleşmiş ` +
    `${plural(placed, 'saati')} de gidecek. Devam edilsin mi?`
  );
}
