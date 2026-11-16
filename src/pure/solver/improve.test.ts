// The improvement pass (improve.ts), judged by the independent oracle
// (oracle.ts) rather than by blocker(): no hard rule broken, no pinned or kept
// cell moved, the week never worse, the same week for the same seed. The
// heavy weeks (the father's course, the sample school, stability after an
// edit) are in solver.test.ts, which `npm run hizli` leaves to CI.

import { describe, expect, it } from 'vitest';
import { closedKey, pendingBlocks, placementKey, setBlockPinned } from '../constraints';
import { addNotSameDay } from '../entities';
import { activePlacements } from '../grid';
import { blocksOf, makeWorld, SMALL_WORLDS } from '../worlds';
import type { RuleLevel, State } from '../../leaf/model';
import { createSolver, solve } from './solver';
import { compareQuality, hardBreaches, pinsMoved, quality, runs } from './oracle';

function rng(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4_294_967_296;
  };
}

/**
 * A random small week: closed hours, every rule at a random level (the gap
 * and "en az" rules included, which blocker() cannot judge), a relation now
 * and then, and a block pinned.
 */
function world(seed: number): State {
  const r = rng(seed * 7_919 + 1);
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const level = (): RuleLevel => (['off', 'warn', 'block'] as const)[int(0, 2)]!;
  const days = int(3, 5);
  const hours = int(4, 6);
  const teachers = Array.from({ length: int(2, 4) }, (_, i) => ({ id: `t${i}`, short: `T${i}` }));
  const classes = Array.from({ length: int(2, 3) }, (_, i) => ({
    id: `c${i}`,
    name: `C${i}`,
    roomId: i < 2 && r() < 0.5 ? 'rA' : null,
  }));
  const lessons = Array.from({ length: int(4, 8) }, (_, i) => ({
    id: `l${i}`,
    classId: classes[int(0, classes.length - 1)]!.id,
    teacherId: teachers[int(0, teachers.length - 1)]!.id,
    weeklyHours: int(1, 4),
    blockSize: int(1, 2),
  }));
  const unavailable: Record<string, 1> = {};
  for (const t of teachers) {
    for (let g = 0; g < days; g++) {
      for (let h = 0; h < hours; h++) if (r() < 0.2) unavailable[closedKey(t.id, g, h)] = 1;
    }
  }
  let d = makeWorld({
    days,
    hours,
    rooms: [{ id: 'rA', name: 'A' }],
    teachers,
    classes,
    lessons,
    unavailable,
    limits: {
      maxPerDay: r() < 0.5 ? int(2, 4) : 0,
      maxConsecutive: r() < 0.4 ? int(2, 3) : 0,
      minPerDay: r() < 0.4 ? 2 : 0,
      maxSameLessonPerDay: r() < 0.5 ? int(1, 2) : 0,
      maxGapsTeacher: int(0, 1),
      maxGapsClass: int(0, 1),
    },
    rules: {
      maxPerDay: level(),
      maxConsecutive: level(),
      minPerDay: level(),
      maxSameLessonPerDay: level(),
      maxGapsTeacher: level(),
      maxGapsClass: level(),
    },
  });
  if (r() < 0.4) d = addNotSameDay(d, 'l0', 'l1');
  // Half the time, something already on the grid and one block of it pinned.
  if (r() < 0.5) {
    const laid = solve(d, { keepPlaced: false, improve: false }).state;
    const blocks = blocksOf(laid);
    if (blocks.length > 0) {
      const b = blocks[int(0, blocks.length - 1)]!;
      d = setBlockPinned(laid, b.classId, b.day, b.hour, true);
    }
  }
  return d;
}

/** What the run must not have changed, whatever it improved. */
function expectSound(input: State, before: State, after: State): void {
  // 1. No hard rule broken that the input did not already break. The rules
  //    the search itself cannot hold ("en az", the gap limits: a half-built
  //    day always breaks them) are counted instead: never more of them.
  const counted = (b: string) => /^(en az|öğretmen boşluğu|sınıf boşluğu) /.test(b);
  const had = new Set(hardBreaches(input));
  for (const b of hardBreaches(after).filter((x) => !counted(x))) expect(had, b).toContain(b);
  expect(hardBreaches(after).filter(counted).length).toBeLessThanOrEqual(
    hardBreaches(before).filter(counted).length,
  );
  // 2. The pinned cells stand.
  expect(pinsMoved(input, after)).toEqual([]);
  // 3. The same hours and the same cards owed: the pass moves blocks, it
  //    never adds, drops or reshapes one.
  for (const lesson of input.lessons) {
    const count = (s: State) =>
      Object.values(activePlacements(s)).filter((x) => x === lesson.id).length;
    expect(count(after), lesson.id).toBe(count(before));
    expect(pendingBlocks(after, lesson), lesson.id).toEqual(pendingBlocks(before, lesson));
  }
  //    And no new pair of the lesson's cards side by side: there the grid
  //    could read the same cells into differently drawn cards (pitfall 75).
  expect(blocksOf(after).length).toBe(blocksOf(before).length);
  expect(blocksOf(after).length - runs(after)).toBeLessThanOrEqual(
    blocksOf(before).length - runs(before),
  );
  // 4. The week is never worse: hard breaches first, then the rest in order.
  const hardBefore = hardBreaches(before).length;
  const hardAfter = hardBreaches(after).length;
  expect(hardAfter).toBeLessThanOrEqual(hardBefore);
  if (hardAfter === hardBefore) {
    expect(compareQuality(quality(after), quality(before))).toBeLessThanOrEqual(0);
  }
}

describe('iyileştirme — rastgele küçük haftalar', () => {
  for (let seed = 1; seed <= 40; seed++) {
    it(`tohum ${seed}: kural çiğnemiyor, sabiti oynatmıyor, haftayı kötüleştirmiyor`, () => {
      const d = world(seed);
      for (const keepPlaced of [false, true]) {
        const before = solve(d, { keepPlaced, improve: false }).state;
        const after = solve(d, { keepPlaced, improve: true }).state;
        expectSound(d, before, after);
        // Kept means kept: every cell the run was handed is where it was.
        if (keepPlaced) {
          for (const [key, id] of Object.entries(activePlacements(d))) {
            expect(activePlacements(after)[key], key).toBe(id);
          }
        }
      }
      // Four solves of a small week: well under a second, but a loaded machine
      // running the whole suite at once took 5,4 s (2026-11-16).
    }, 30_000);
  }
});

describe.each(SMALL_WORLDS)('iyileştirme — dünya: $name', (w) => {
  it('kural çiğnemiyor ve haftayı kötüleştirmiyor', () => {
    const before = solve(w.state, { budgetMs: 4_000, improve: false }).state;
    const after = solve(w.state, { budgetMs: 4_000 }).state;
    expectSound(w.state, before, after);
  });
});

describe('iyileştirme — tohum ve iptal', () => {
  const d = world(7);

  it('aynı tohum aynı haftayı veriyor', () => {
    for (const seed of [0, 1, 5]) {
      const a = solve(d, { keepPlaced: false, seed });
      const b = solve(d, { keepPlaced: false, seed });
      expect(activePlacements(a.state)).toEqual(activePlacements(b.state));
    }
  });

  it('Durdur, iyileştirmenin ortasında da yasal ve en az giriş kadar iyi bir hafta veriyor', () => {
    const before = solve(d, { keepPlaced: false, improve: false }).state;
    for (const slices of [1, 3, 10, 40]) {
      const solver = createSolver(d, { keepPlaced: false });
      // Slices of zero milliseconds: one unit of work each, the same on any
      // machine, so the cancel lands at a different point for each count.
      for (let i = 0; i < slices; i++) if (solver.step(0) !== null) break;
      const stopped = solver.cancel();
      const counted = (b: string) => /^(en az|öğretmen boşluğu|sınıf boşluğu) /.test(b);
      expect(
        hardBreaches(stopped.state).filter((b) => !counted(b) && !hardBreaches(d).includes(b)),
      ).toEqual([]);
      expect(pinsMoved(d, stopped.state)).toEqual([]);
      if (stopped.placedBlocks === solve(d, { keepPlaced: false }).placedBlocks) {
        // The search had finished: what Durdur hands back is the pass's best.
        expect(compareQuality(quality(stopped.state), quality(before))).toBeLessThanOrEqual(0);
      }
    }
  });

  it('kapalı saatte kalmış elle konmuş saati yerinden oynatmıyor', () => {
    // A lesson left on an hour closed AFTER it was placed is kept (no data
    // loss) and is the reader's to move, not the pass's.
    const base = makeWorld({
      days: 2,
      hours: 4,
      teachers: [
        { id: 'tA', short: 'A' },
        { id: 'tB', short: 'B' },
      ],
      classes: [{ id: 'c1', name: '1', roomId: null }],
      lessons: [
        { id: 'a', classId: 'c1', teacherId: 'tA', weeklyHours: 2 },
        { id: 'b', classId: 'c1', teacherId: 'tB', weeklyHours: 2 },
      ],
      placements: { [placementKey('c1', 0, 3)]: 'a' },
      unavailable: { [closedKey('tA', 0, 3)]: 1 },
    });
    const after = solve(base, { keepPlaced: false }).state;
    expect(activePlacements(after)[placementKey('c1', 0, 3)]).toBeUndefined();
    const kept = solve(base, { keepPlaced: true }).state;
    expect(activePlacements(kept)[placementKey('c1', 0, 3)]).toBe('a');
  });
});
