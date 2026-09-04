// SADECE TEST: the small three-day school the entity unit tests share.
//
// Here rather than inside one `.test.ts` because the file that held it was
// split into one test file per module, and a fixture copied thirteen times is
// thirteen fixtures that can drift. Same arrangement as `worlds.ts`: the
// application never imports it, so Vite prunes it and it never reaches
// `dist/index.html`.

import { addClass } from './entities/classCrud';
import { placementKey, teacherKey } from './constraints';
import {
  DEFAULT_BELL,
  DEFAULT_LIMITS,
  DEFAULT_RULES,
  emptyState,
  makeDay,
  NO_TEACHER_LIMITS,
} from './entities/defaults';
import { blankProgram } from './programs';
import { addRoom } from './entities/roomCrud';
import { addTeacher } from './entities/teacherCrud';
import type { Day, State } from './types';
import { SCHEMA_VERSION } from './types';

/** One teacher, one class, one 4-hour lesson placed on three separate days. */
export function build(): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: '',
      days: [makeDay('Pazartesi'), makeDay('Salı'), makeDay('Çarşamba')],
      hours: ['1', '2', '3', '4'],
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS },
      rules: { ...DEFAULT_RULES },
      subjects: [],
      subjectShorts: {},
    },
    rooms: [],
    teachers: [
      {
        id: 'oMC',
        name: 'Mehmet Çelik',
        short: 'MÇ',
        subject: 'Matematik',
        subject2: '',
        gender: '',
        color: 0,
        limits: { ...NO_TEACHER_LIMITS },
      },
    ],
    classes: [{ id: 's510', name: '510', roomId: null, color: 0, maxSameLessonPerDay: null }],
    lessons: [
      {
        id: 'x1',
        classId: 's510',
        teacherId: 'oMC',
        weeklyHours: 4,
        blocks: [],
        second: false,
        maxPerDay: null,
      },
    ],
    unavailable: { [teacherKey('oMC', 2, 3)]: 1 },
    programs: [
      {
        ...blankProgram(),
        placements: {
          [placementKey('s510', 0, 0)]: 'x1', // Pazartesi
          [placementKey('s510', 1, 1)]: 'x1', // Salı
          [placementKey('s510', 2, 2)]: 'x1', // Çarşamba
        },
        pinned: { [placementKey('s510', 1, 1)]: 1 },
      },
    ],
    activeProgramId: 'program-1',
  };
}

/** The same week with one day taken out of the list. */
export const without = (days: Day[], name: string): Day[] =>
  days.filter((x) => x.name !== name);

/**
 * The other shared school: one room, one teacher, one class, built THROUGH the
 * CRUD functions rather than written out. A fixture that goes in the front door
 * is the one that notices when the front door changes.
 */
export function school(): State {
  let d = emptyState();
  d = addRoom(d, 'A');
  d = addTeacher(d, {
    name: 'Mehmet Çelik',
    short: 'MÇ',
    subject: 'Matematik',
    subject2: '',
    gender: '',
  });
  d = addClass(d, '510', d.rooms[0]!.id);
  return d;
}
