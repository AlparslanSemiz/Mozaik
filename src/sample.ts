// Sample data: a world close to my father's real scale (25 teachers, 20 classes,
// 8 rooms, 7 days x 12 hours). It has two jobs:
//   1. He can see how the tool works before entering his own data.
//   2. Speed is measured at real scale — not with 5 rows of toy data.
//
// Generation is DETERMINISTIC: the same input always yields the same output,
// so a bug found here can be reproduced.

import { teacherKey } from './constraints';
import type { Lesson, Room, State, Teacher, ClassGroup } from './types';
import { COLOR_COUNT, SCHEMA_VERSION } from './types';
import {
  DEFAULT_BELL,
  DEFAULT_RULES,
  defaultDays,
  hourNames,
  makeShort,
  NO_TEACHER_LIMITS,
} from './entities';

/** The sample school runs the rules: 6 hours a day, 2 hours of one lesson. */
const DEFAULT_LIMITS_SAMPLE = {
  maxConsecutive: 4,
  maxPerDay: 8,
  minPerDay: 2,
  maxSameLessonPerDay: 2,
};

/** A tiny linear generator — Math.random is not deterministic. */
function rng(seed: number): () => number {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

const SUBJECTS = [
  'Matematik',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Türkçe',
  'Edebiyat',
  'Tarih',
  'Coğrafya',
  'İngilizce',
  'Geometri',
  'Felsefe',
  'Din Kültürü',
];

const NAMES = [
  'Mehmet Çelik', 'Ayşe Varol', 'Murat Bilge', 'Yasemin Mutlu', 'Kemal Yıldız',
  'Yeliz Güneş', 'Ahmet Sarı', 'İlknur Aydın', 'Yusuf Kara', 'Hatice Ergin',
  'Emre Doğan', 'Deniz Erdem', 'Sibel Duman', 'Rıza Yalçın', 'Gökhan Çetin',
  'Nurten Uçar', 'Ali Öztürk', 'Aylin Gür', 'Serkan Tunç', 'Melek Şahin',
  'Barış Koç', 'Zeynep Ak', 'Onur Polat', 'Fatma Kurt', 'Cem Aslan',
];

/** As in the photo: class code -> fixed room letter. */
const CLASS_ROOM: Array<[string, string]> = [
  ['310', 'G'], ['311', 'G'],
  ['320', 'H'], ['452', 'H'], ['453', 'H'],
  ['410', 'A'], ['411', 'A'], ['510', 'A'], ['511', 'A'],
  ['412', 'B'], ['413', 'B'],
  ['450', 'C'], ['451', 'C'],
  ['414', 'D'], ['415', 'D'], ['530', 'D'], ['531', 'D'],
  ['430', 'E'], ['431', 'E'],
  ['432', 'F'],
];

export function sampleState(): State {
  const rnd = rng(20260824);
  const days = defaultDays();
  const hours = hourNames(12);
  const totalSlots = days.length * hours.length; // 72

  const letters = [...new Set(CLASS_ROOM.map(([, letter]) => letter))].sort();
  const rooms: Room[] = letters.map((letter, i) => ({ id: `k${i}`, name: letter }));
  const roomIdByLetter = new Map(rooms.map((r) => [r.name, r.id]));

  const classes: ClassGroup[] = CLASS_ROOM.map(([name, letter], i) => ({
    id: `s${i}`,
    name,
    roomId: roomIdByLetter.get(letter) ?? null,
  }));

  const teachers: Teacher[] = NAMES.map((name, i) => ({
    id: `o${i}`,
    name,
    short: makeShort(name),
    subject: SUBJECTS[i % SUBJECTS.length] ?? 'Matematik',
    color: i % COLOR_COUNT,
    // Every third teacher gets a personal limit so the rule engine is actually
    // exercised by the sample data, not only by the tests.
    limits: i % 3 === 0 ? { ...NO_TEACHER_LIMITS, maxConsecutive: 3 } : { ...NO_TEACHER_LIMITS },
  }));

  // The more classes share a room, the smaller each class's budget must be,
  // otherwise the sample data is unsolvable from the start (room bottleneck).
  const sharing = new Map<string, number>();
  for (const c of classes) {
    if (c.roomId != null) sharing.set(c.roomId, (sharing.get(c.roomId) ?? 0) + 1);
  }

  const lessons: Lesson[] = [];
  let counter = 0;
  for (const [i, group] of classes.entries()) {
    const siblings = group.roomId != null ? (sharing.get(group.roomId) ?? 1) : 1;
    // Two upper bounds: (a) 82% of the room's hours divided among the classes
    // sharing it — above that a room bottleneck appears; (b) no class gets more
    // than 32 hours a week, otherwise a single-class room ends up with 79 hours.
    let budget = Math.min(32, Math.floor((totalSlots * 0.82) / siblings));

    // Spread over 4-6 teachers. Teachers are picked with a per-class shift so
    // the same teacher is not in every class.
    const lessonCount = 4 + Math.floor(rnd() * 3);
    for (let j = 0; j < lessonCount && budget > 0; j++) {
      const teacher = teachers[(i * 3 + j * 7) % teachers.length];
      if (teacher === undefined) continue;

      const remainingLessons = lessonCount - j;
      const share = Math.max(
        2,
        Math.min(budget - (remainingLessons - 1) * 2, Math.ceil(budget / remainingLessons)),
      );
      const blockSize = rnd() < 0.35 ? 2 : 1;
      const weeklyHours = Math.max(blockSize, Math.floor(share / blockSize) * blockSize);
      if (weeklyHours <= 0) continue;

      lessons.push({
        id: `d${counter++}`,
        classId: group.id,
        teacherId: teacher.id,
        weeklyHours,
        blockSize,
        maxPerDay: null,
      });
      budget -= weeklyHours;
    }
  }

  // 1-2 closed days per teacher: in real life nobody comes every day, and
  // without any unavailability the constraint engine is never exercised.
  const unavailable: Record<string, 1> = {};
  for (const [i, t] of teachers.entries()) {
    const closedDay = i % days.length;
    for (let s = 0; s < hours.length; s++) unavailable[teacherKey(t.id, closedDay, s)] = 1;
    if (rnd() < 0.5) {
      const second = (closedDay + 3) % days.length;
      for (let s = 0; s < hours.length; s++) unavailable[teacherKey(t.id, second, s)] = 1;
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: 'Örnek Kurs',
      days,
      hours,
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS_SAMPLE },
      rules: { ...DEFAULT_RULES },
      subjectShorts: {},
    },
    rooms,
    teachers,
    classes,
    lessons,
    unavailable,
    placements: {},
  };
}
