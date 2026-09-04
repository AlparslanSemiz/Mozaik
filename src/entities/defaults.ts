// What a NEW school looks like: the bell, the week, the limits, and the empty
// state every project starts from.
//
// Nothing here is a guess about this school. The numbers are the ones a reader
// can see and change on the Ayarlar screen, and the limits are all 0 — "no
// limit" — because my father fills those in himself.

import { blankProgram } from '../programs';
import { DEFAULT_DAY_NAMES } from '../names';
import { hourNames } from './periods';
import type { Bell, Day, Limits, Rules, Settings, State } from '../types';
import { SCHEMA_VERSION } from '../types';

/** 40 min lesson, 10 min break, 09:00 start, 30 min lunch -> 12th ends 19:10. */
export const DEFAULT_BELL: Bell = {
  start: '09:00',
  lessonMinutes: 40,
  breakMinutes: 10,
  longBreakMinutes: 30,
};

const WEEKEND = new Set(['Cumartesi', 'Pazar']);

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

/** 0 = no limit. Nothing is guessed: my father fills these in himself. */
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

export function defaultSettings(): Settings {
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
    // still what a pre-v5 backup falls back to (`parseState.ts`): a file that
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
    activeProgramId: 'program-1',
  };
}
