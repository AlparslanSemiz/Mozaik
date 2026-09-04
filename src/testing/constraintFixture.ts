// SADECE TEST: the school the constraint tests share, and the four helpers
// that ask it questions. Here rather than inside one .test.ts because the file
// that held them was split into one test file per module, and a fixture copied
// six times is six fixtures that can drift. worlds.ts's arrangement: the
// application never imports it, so Vite prunes it.

import { blocker, buildIndex, check, placementKey } from '../constraints';
import { DEFAULT_BELL, DEFAULT_LIMITS, DEFAULT_RULES, NO_TEACHER_LIMITS } from '../entities';
import { blankProgram, replaceActiveGrid } from '../state/programs';
import type { RuleLevel, State } from '../types';
import { SCHEMA_VERSION } from '../types';

export function build(): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: '',
      days: [
        { name: 'Pazartesi', longBreakAfter: 0 },
        { name: 'Salı', longBreakAfter: 0 },
      ],
      hours: ['1', '2', '3', '4'],
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS },
      rules: { ...DEFAULT_RULES },
      subjects: [],
      subjectShorts: {},
    },
    rooms: [
      { id: 'dA', name: 'A' },
      { id: 'dB', name: 'B' },
    ],
    teachers: [
      { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '', color: 0, limits: { ...NO_TEACHER_LIMITS } },
      { id: 'oAV', name: 'Ayşe Var', short: 'AV', subject: 'Fizik', subject2: '', gender: '', color: 1, limits: { ...NO_TEACHER_LIMITS } },
      { id: 'oMB', name: 'Murat Bey', short: 'MB', subject: 'Kimya', subject2: '', gender: '', color: 2, limits: { ...NO_TEACHER_LIMITS } },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA', color: 0, maxSameLessonPerDay: null },
      { id: 's511', name: '511', roomId: 'dA', color: 1, maxSameLessonPerDay: null },
      { id: 's433', name: '433', roomId: 'dB', color: 2, maxSameLessonPerDay: null },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blocks: [], second: false, maxPerDay: null },
      { id: 'x2', classId: 's511', teacherId: 'oMC', weeklyHours: 2, blocks: [], second: false, maxPerDay: null },
      { id: 'x3', classId: 's433', teacherId: 'oAV', weeklyHours: 4, blocks: [2, 2], second: false, maxPerDay: null },
      { id: 'x4', classId: 's510', teacherId: 'oAV', weeklyHours: 2, blocks: [2], second: false, maxPerDay: null },
      { id: 'x5', classId: 's511', teacherId: 'oAV', weeklyHours: 2, blocks: [], second: false, maxPerDay: null },
      { id: 'x6', classId: 's433', teacherId: 'oMB', weeklyHours: 3, blocks: [2], second: false, maxPerDay: null },
    ],
    unavailable: {},
    programs: [blankProgram()],
    activeProgramId: 'program-1',
  };
}

/**
 * A world holding ONE lesson of a given shape, already sitting on the listed
 * cells. Written straight into `placements` rather than through `place()`,
 * because the point is to ask how an arbitrary run of hours gets READ.
 */
export function withLesson(
  spec: { id: string; weeklyHours: number; blocks: number[] },
  cells: Array<[number, number]>,
): State {
  const d = build();
  const placements: Record<string, string> = {};
  for (const [day, hour] of cells) placements[placementKey('s510', day, hour)] = spec.id;
  return replaceActiveGrid({
    ...d,
    // Six hours a day rather than the four the shared fixture uses: a run has
    // to be long enough to hold a 3 and a 2 back to back, or the case cannot be
    // asked at all.
    settings: { ...d.settings, hours: ['1', '2', '3', '4', '5', '6'] },
    lessons: [
      {
        id: spec.id,
        classId: 's510',
        teacherId: 'oMC',
        weeklyHours: spec.weeklyHours,
        blocks: spec.blocks,
        second: false,
        maxPerDay: null,
      },
    ],
  }, { placements });
}

export function lessonById(d: State, id: string) {
  return d.lessons.find((x) => x.id === id)!;
}

/** Shortcut for blocker(): rebuilds the index every time. */
export function why(
  d: State,
  lessonId: string,
  day: number,
  hour: number,
  size?: number,
): string | null {
  return blocker(d, buildIndex(d), lessonId, day, hour, size);
}

/** Shortcut for check(): the blocking reason plus the "Uyar" level warning. */
export function verdict(d: State, lessonId: string, day: number, hour: number) {
  return check(d, buildIndex(d), lessonId, day, hour);
}

/** Switches one rule on with a number behind it. */
export function withRule(
  d: State,
  name: keyof State['settings']['limits'],
  limit: number,
  level: RuleLevel,
): State {
  return {
    ...d,
    settings: {
      ...d.settings,
      limits: { ...d.settings.limits, [name]: limit },
      rules: { ...d.settings.rules, [name]: level },
    },
  };
}

