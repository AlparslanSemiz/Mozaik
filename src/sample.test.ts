// Integration test at real scale: 25 teachers, 20 classes, 8 rooms, 84 slots.
//
// It answers two questions:
//   1. Is the constraint engine consistent at real scale, can a timetable be built?
//   2. Is the start-of-drag cost (84 blocker calls) small enough not to stutter
//      on my father's slow machine?

import { blocker, buildIndex, sanitize, place } from './constraints';
import { buildReport } from './feasibility';
import { blockPlan } from './blocks';
import { sampleState } from './sample';
import type { State } from './types';

/** Greedy fill: puts every lesson in the first valid slot. NOT a solver, just a test. */
function greedyFill(start: State): { state: State; placed: number; total: number } {
  let d = start;
  const total = d.lessons.reduce((sum, x) => sum + x.weeklyHours, 0);
  let placed = 0;

  // Bigger blocks first: the lessons with the least room go in first.
  const longest = (x: (typeof d.lessons)[number]) => x.blocks[0] ?? 1;
  const sorted = [...d.lessons].sort(
    (a, b) => longest(b) - longest(a) || b.weeklyHours - a.weeklyHours,
  );

  for (const lesson of sorted) {
    // The split says what to place and in which order, so this walks the plan
    // rather than dividing hours by a single block length.
    for (const size of blockPlan(lesson)) {
      const ix = buildIndex(d);
      let done = false;
      for (let g = 0; g < d.settings.days.length && !done; g++) {
        for (let s = 0; s < d.settings.hours.length; s++) {
          if (blocker(d, ix, lesson.id, g, s, size) === null) {
            d = place(d, lesson.id, g, s, size);
            placed += size;
            done = true;
            break;
          }
        }
      }
      if (!done) break; // no room left for this lesson
    }
  }
  return { state: d, placed, total };
}

describe('sampleState — gerçek ölçek', () => {
  const d = sampleState();

  it('beklenen büyüklükte ve tutarlı veri üretir', () => {
    expect(d.teachers).toHaveLength(25);
    expect(d.classes).toHaveLength(20);
    expect(d.rooms).toHaveLength(8);
    expect(d.settings.days).toHaveLength(6); // Salı..Pazar, Pazartesi ders yok
    expect(d.settings.hours).toHaveLength(12);
    expect(d.lessons.length).toBeGreaterThan(80);
  });

  it('sanitize() üretilen veriye dokunmaz — yani veri baştan tutarlı', () => {
    expect(sanitize(d)).toBe(d);
  });

  it('deterministiktir: iki çağrı aynı sonucu verir', () => {
    expect(JSON.stringify(sampleState())).toBe(JSON.stringify(d));
  });

  it('kapasite bakımından dizilebilir görünür (imkânsız satır yok)', () => {
    const report = buildReport(d);
    const impossible = [...report.teachers, ...report.classes, ...report.rooms].filter(
      (x) => x.level === 'impossible',
    );
    expect(impossible.map((x) => x.message)).toEqual([]);
  });
});

describe('gerçek ölçekte doldurma', () => {
  it('açgözlü doldurma ders saatlerinin çoğunu yerleştirir ve hiç çakışma üretmez', () => {
    const { state, placed, total } = greedyFill(sampleState());

    // The greedy strategy is not optimal; even 70% shows the engine is consistent.
    expect(placed / total).toBeGreaterThan(0.7);

    // Is every placed cell really clash-free? Independent verification: the same
    // teacher must not be in two places, the same room not in two classes.
    const seenTeacher = new Set<string>();
    const seenRoom = new Set<string>();
    const ix = buildIndex(state);

    for (const key in activeProgram(state).placements) {
      const lessonId = activeProgram(state).placements[key]!;
      const [classId, day, hour] = key.split('|') as [string, string, string];
      const lesson = ix.lessonById.get(lessonId)!;
      expect(lesson.classId).toBe(classId);

      const tKey = `${lesson.teacherId}|${day}|${hour}`;
      expect(seenTeacher.has(tKey)).toBe(false);
      seenTeacher.add(tKey);

      const roomId = ix.classById.get(classId)?.roomId;
      if (roomId != null) {
        const rKey = `${roomId}|${day}|${hour}`;
        expect(seenRoom.has(rKey)).toBe(false);
        seenRoom.add(rKey);
      }
    }

    // Availability must have been respected too
    for (const tKey of seenTeacher) {
      expect(state.unavailable[tKey]).toBeUndefined();
    }
  });

  it('sürükleme başlangıcı (84 blocker çağrısı) hızlı kalır', () => {
    const { state } = greedyFill(sampleState());
    const lessonId = state.lessons[0]!.id;

    const started = performance.now();
    for (let round = 0; round < 20; round++) {
      const ix = buildIndex(state);
      for (let g = 0; g < state.settings.days.length; g++) {
        for (let s = 0; s < state.settings.hours.length; s++) {
          blocker(state, ix, lessonId, g, s);
        }
      }
    }
    const oneDrag = (performance.now() - started) / 20;

    // ~1 ms on the dev machine. The threshold is deliberately loose: the point
    // is not a flaky test but catching a big regression (e.g. an O(n) scan
    // creeping into blocker).
    expect(oneDrag).toBeLessThan(50);
  });
});
import { activeProgram } from './programs';
