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

/**
 * Who a teacher is, for the two questions the lists ask: sorting and grouping.
 *
 * '' is a real value, not a missing one: a staff list has blanks in it and a
 * blank is data. That is also why this is not a boolean — a boolean would have
 * to pick one of the two as the default and would quietly assign everybody.
 */
export type Gender = '' | 'k' | 'e';

/**
 * Subject belongs to the TEACHER, not to the lesson — and a teacher may have a
 * second one.
 *
 * The second is a real case in this school and not a guess: one person teaches
 * both "Matematik 1" and "Matematik 2", another both "Türkçe" and "Edebiyat".
 * A sub-branch tree under `settings.subjects` would express the first pair and
 * NOT the second — Türkçe is not a child of Edebiyat — so two flat subjects it
 * is. Which of them a given lesson is taught under lives on the lesson, as a
 * flag; see `Lesson.second`.
 */
export interface Teacher {
  id: Id;
  name: string;
  short: string; // "MÇ" — row header in the grid
  subject: string; // "Matematik" — free text, not a separate table
  /**
   * The teacher's OTHER subject, or '' for the usual case of only one.
   *
   * '' is a real value here exactly as it is in `Gender`: most of the staff
   * list has one subject and that is data, not a gap to be filled in later.
   */
  subject2: string;
  gender: Gender; // '' | 'k' | 'e' — never printed, only listed and grouped
  color: number; // index into PALETTE (palette.ts), not a hex value
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
  /**
   * Index into PALETTE, like Teacher.color and from the same 36. A cell is
   * always painted in its TEACHER's colour, so the two never compete for the
   * same square; the class colour marks the row head and the printed page.
   */
  color: number;
  /**
   * Max hours of ONE lesson on one day, for this class. null -> use
   * settings.limits.maxSameLessonPerDay.
   *
   * The middle of three layers, and the only one that could not be said before:
   * the school-wide number is one number for everybody and `Lesson.maxPerDay`
   * is one number per teacher-and-class pair, so "510 should never see the same
   * subject twice in a day" had to be typed into every one of that class's
   * lessons and typed again into each new one. A number here wins over the
   * school's; a lesson's own box wins over both.
   */
  maxSameLessonPerDay: number | null;
}

/** The weekly load one teacher gives to one class. */
export interface Lesson {
  id: Id;
  classId: Id;
  teacherId: Id;
  weeklyHours: number; // weekly total
  /**
   * The blocks longer than an hour, biggest first. Whatever the sum leaves over
   * is taught as single hours, so this list alone fixes the whole shape: 9
   * hours with blocks [3, 2] is 3+2+1+1+1+1.
   *
   * Every entry is 2 or 3 and the sum never exceeds `weeklyHours`;
   * `clampBlocks` in blocks.ts is the only place that decides it. NOT a second
   * truth next to `weeklyHours` — the total is still the total, this is only
   * its shape, and it cannot contradict it.
   *
   * It replaced a single `pairs` count, which could only ever mean "this many
   * TWO-hour blocks" and so could not say 3 or 4 at all; and that in turn had
   * replaced a single `blockSize` meaning "every block is this long", which
   * could not say 2+1. A list can say both supported long-block lengths.
   */
  blocks: number[];
  /**
   * Is this lesson taught under the teacher's SECOND subject?
   *
   * A flag and not the subject's NAME, on purpose. The name is already stored
   * once, on the teacher; storing it again here would be a second truth that
   * drifts the moment somebody corrects a typo in the teacher's branch — and
   * `Teacher.subject` is deliberately a string rather than an id precisely so
   * that renaming stays cheap. A flag cannot contradict the teacher: it points
   * at one of two fields the teacher already has.
   *
   * `false` for every lesson of a single-subject teacher, and `sanitize()`
   * forces it back to `false` when a teacher's `subject2` is cleared — an
   * orphan flag would make a lesson claim a subject nobody teaches.
   */
  second: boolean;
  /**
   * Max hours of THIS lesson on one day. null -> the CLASS's own number, and
   * failing that settings.limits.maxSameLessonPerDay. Three layers, narrowest
   * first — `lessonLimit()` in rules.ts is the only place that resolves them.
   */
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

/**
 * School-wide defaults. 0 means "no limit" everywhere — EXCEPT the two gap
 * fields below, where 0 is a real, commonly-wanted number ("no gaps at all")
 * and whether the rule bites at all is decided by the LEVEL alone
 * (rules.ts: gapRuleActive). Documented here because it is the one place in
 * this interface where "0" does not mean the same thing twice.
 */
export interface Limits {
  maxConsecutive: number;
  maxPerDay: number;
  minPerDay: number;
  maxSameLessonPerDay: number;
  /** Free hours a TEACHER may have between the first and last lesson of a day. */
  maxGapsTeacher: number;
  /** The same for a CLASS. */
  maxGapsClass: number;
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
   * The school's subject list — what the Branş dropdown offers. Stored in FULL,
   * unlike subjectShorts below, because it is a list the user edits: a list
   * derived from the built-in table could never express "we do not teach
   * Fransızca". A teacher still stores the subject NAME, not an id, so removing
   * a subject needs no cascade and a backup stays readable.
   */
  subjects: string[];
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
  /** Alternative grids that share every school entity above. */
  programs: ProgramVariant[];
  /** The grid shown, checked, printed and edited right now. */
  activeProgramId: Id;
}

/** One alternative timetable inside a plan. */
export interface ProgramVariant {
  id: Id;
  name: string;
  /** `${classId}|${day}|${hour}` -> lessonId. */
  placements: Record<string, Id>;
  /** `${classId}|${day}|${hour}` -> 1. Pins belong to this alternative only. */
  pinned: Record<string, 1>;
}

/**
 * Present from day one so old backups can be migrated.
 * v1: Turkish field names (durum/ayar/ogretmenler...). v2: English field names.
 * v3: Day objects, bell times, limits and rules.
 * v4: settings.subjectShorts.
 * v5: ClassGroup.color and settings.subjects.
 * v6: Teacher.gender.
 * v7: Lesson.pairs replaces Lesson.blockSize.
 * v8: Teacher.subject2 and Lesson.second — a teacher may hold two subjects.
 * v9: Lesson.blocks replaces Lesson.pairs — a block may be 2, 3 or 4 hours.
 * v10: State.pinned — cells the reader has locked in place.
 * v11: ClassGroup.maxSameLessonPerDay — the daily limit gained a middle layer.
 * v12: placements/pinned moved into named alternative programs.
 * v13: supported blocks are 2 or 3 hours; each old 4 becomes 3 plus an implied single.
 * v14: Limits.maxGapsTeacher / maxGapsClass — a window (boşluk) rule, "Kapalı /
 *      Uyar" only. Like minPerDay it cannot block a drop while placing (every
 *      hour of a day is a gap violation until the day is full), so it only
 *      ever shows up in findViolations().
 */
export const SCHEMA_VERSION = 14;
