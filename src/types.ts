// Data model. Types and constants only; no logic.
//
// Changing this file is expensive: placement keys, backup files and
// localStorage content all depend on this shape. Read docs/PLAN.md section 2
// before touching it.

export type Id = string; // 8 random chars. NEVER a name or an array index.

/** A physical room. Fixed property of a class; not chosen when placing. */
export interface Room {
  id: Id;
  name: string; // "A" .. "H"
}

/** How hard a soft rule bites. `minPerDay` can never be 'block' — see rules.ts. */
export type RuleLevel = 'off' | 'warn' | 'block';

/** Every teacher has exactly ONE subject; subject belongs to the teacher, not the lesson. */
export interface Teacher {
  id: Id;
  name: string;
  short: string; // "MÇ" — row header in the grid
  subject: string; // "Matematik" — free text, not a separate table
  color: number; // palette index 0..COLOR_COUNT-1, not a hex value
  /** null -> use settings.limits. A number wins over the school-wide default. */
  limits: TeacherLimits;
}

export interface TeacherLimits {
  maxConsecutive: number | null;
  maxPerDay: number | null;
  minPerDay: number | null;
}

/** A closed set of students. Two classes may have lessons at the same hour. */
export interface ClassGroup {
  id: Id;
  name: string; // "510"
  roomId: Id | null; // null -> room clash is not checked
}

/** The weekly load one teacher gives to one class. */
export interface Lesson {
  id: Id;
  classId: Id;
  teacherId: Id;
  weeklyHours: number; // weekly total
  blockSize: number; // consecutive hours per placement (1, 2 or 3)
  /** Max hours of THIS lesson on one day. null -> settings.limits.maxSameLessonPerDay. */
  maxPerDay: number | null;
}

/**
 * One weekday. The INDEX of a day in settings.days is what placement keys refer
 * to, so removing a day from the middle of the list shifts every later day —
 * see remapDays() in entities.ts (docs/PLAN.md pitfall 14).
 */
export interface Day {
  name: string; // "Salı"
  /** 0 = no long break. 5 = the long break falls after the 5th period. */
  longBreakAfter: number;
}

/**
 * Bell times are GENERATED from a start time and three durations, not stored
 * per period. One long break per day is enough for this school; where it falls
 * is the only thing that differs between weekdays and the weekend.
 */
export interface Bell {
  start: string; // "09:00"
  lessonMinutes: number; // 40
  breakMinutes: number; // 10
  longBreakMinutes: number; // 30
}

/** School-wide defaults. 0 means "no limit" everywhere. */
export interface Limits {
  maxConsecutive: number;
  maxPerDay: number;
  minPerDay: number;
  maxSameLessonPerDay: number;
}

export type RuleName = keyof Limits;

export type Rules = Record<RuleName, RuleLevel>;

export interface Settings {
  schoolName: string; // printed in the page header; may be ""
  days: Day[];
  hours: string[]; // ["1", ... "12"] — the period LABEL. Length = periods per day.
  bell: Bell;
  limits: Limits;
  rules: Rules;
  /**
   * Subject -> short form, but ONLY where the user changed it. Everything else
   * comes from the built-in table, so a backup does not swell with 21 defaults
   * and an improved table later reaches an old project on its own.
   */
  subjectShorts: Record<string, string>;
}

export interface State {
  schemaVersion: typeof SCHEMA_VERSION;
  settings: Settings;
  rooms: Room[];
  teachers: Teacher[];
  classes: ClassGroup[];
  lessons: Lesson[];
  /**
   * `${entityId}|${day}|${hour}` -> 1 . If the key exists that teacher, class or
   * room is closed at that hour. One map for all three: ids are unique across
   * the three lists, so no second dictionary is needed.
   */
  unavailable: Record<string, 1>;
  /** `${classId}|${day}|${hour}` -> lessonId . A block = consecutive equal lessonIds. */
  placements: Record<string, Id>;
}

/**
 * Present from day one so old backups can be migrated.
 * v1: Turkish field names (durum/ayar/ogretmenler...). v2: English field names.
 * v3: Day objects, bell times, limits and rules.
 * v4: settings.subjectShorts.
 */
export const SCHEMA_VERSION = 4;

/** Must match the number of --color-0 .. --color-11 variables in styles.css. */
export const COLOR_COUNT = 12;
