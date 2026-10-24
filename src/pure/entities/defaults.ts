// What a new school starts with: the bell, the days, the limits and rules,
// the hour names, and `emptyState`. Nothing is guessed (the former rule
// against guessed features).

import { DEFAULT_DAY_NAMES } from '../../leaf/lang';
import {
  type Bell,
  type Day,
  type Limits,
  type Rules,
  SCHEMA_VERSION,
  type Settings,
  type State,
} from '../../leaf/model';
import { DEFAULT_PROGRAM_ID, blankProgram } from '../grid';

/** 40 min lesson, 10 min break, 09:00 start, 30 min lunch -> 12th ends 19:10. */
export const DEFAULT_BELL: Bell = {
  start: '09:00',
  lessonMinutes: 40,
  breakMinutes: 10,
  longBreakMinutes: 30,
};

const WEEKEND = new Set(['Cumartesi', 'Pazar']);

/** On weekdays the long break falls after the 5th lesson, at the weekend after the 6th. */
function defaultLongBreak(dayName: string): number {
  return WEEKEND.has(dayName) ? 6 : 5;
}

export function makeDay(name: string): Day {
  return { name, longBreakAfter: defaultLongBreak(name) };
}

export function defaultDays(): Day[] {
  return DEFAULT_DAY_NAMES.map(makeDay);
}

/** 0 = no limit. Nothing is guessed: my father fills these in himself (the former rule against guessed features). */
export const DEFAULT_LIMITS: Limits = {
  maxConsecutive: 0,
  maxPerDay: 0,
  minPerDay: 0,
  maxSameLessonPerDay: 0,
  maxGapsTeacher: 0,
  maxGapsClass: 0,
};

export const DEFAULT_RULES: Rules = {
  maxConsecutive: 'block',
  maxPerDay: 'block',
  minPerDay: 'warn', // can never block: the first lesson of a day always breaches it
  maxSameLessonPerDay: 'block',
  // 'off' and not 'warn': a school that never asked for this must not wake up
  // to a wall of new warnings. maxGapsTeacher/maxGapsClass also can never
  // block, for the same reason minPerDay cannot (types.ts, v14).
  maxGapsTeacher: 'off',
  maxGapsClass: 'off',
};

export const NO_TEACHER_LIMITS = {
  maxConsecutive: null,
  maxPerDay: null,
  minPerDay: null,
};

export function hourNames(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String(i + 1));
}

function defaultSettings(): Settings {
  return {
    schoolName: '',
    days: defaultDays(),
    hours: hourNames(12),
    bell: { ...DEFAULT_BELL },
    limits: { ...DEFAULT_LIMITS },
    rules: { ...DEFAULT_RULES },
    // EMPTY, not the built-in 21. The list is a step in Okul now, with the
    // built-in table offered beside it — seeding it meant that panel read
    // "Hazır branşlar (0)" on every new project, i.e. the one screen where it
    // is useful was the one screen it was empty on. `defaultSubjects()` is
    // still what a pre-v5 backup falls back to (`store.ts`): a file that
    // predates the list must not lose the subjects its teachers carry.
    subjects: [],
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
    programs: [blankProgram()],
    activeProgramId: DEFAULT_PROGRAM_ID,
    answers: { accepted: [], refused: [] },
    relations: [],
  };
}
