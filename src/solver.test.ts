// The solver is the one place where the tool decides something by itself, so
// what is tested is not "did it produce output" but "is the output legal by the
// SAME engine the user's own dragging is judged by".

import { describe, expect, it } from 'vitest';
import { buildIndex, placementKey, place, setBlockPinned } from './constraints';
import { DEFAULT_BELL, DEFAULT_LIMITS, DEFAULT_RULES, NO_TEACHER_LIMITS } from './entities';
import { findViolations } from './rules';
import { sampleState } from './sample';
import { createSolver, solve } from './solver';
import type { RuleLevel, State } from './types';
import { SCHEMA_VERSION } from './types';
import { blocksOf, hoursOf, illegalBlocks, SMALL_WORLDS } from './testing/worlds';

// 2 days x 4 hours = 8 cells per class.
//   room A: 510, 511 (shared)   room B: 433
function build(): State {
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
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA', color: 0, maxSameLessonPerDay: null },
      { id: 's511', name: '511', roomId: 'dA', color: 1, maxSameLessonPerDay: null },
      { id: 's433', name: '433', roomId: 'dB', color: 2, maxSameLessonPerDay: null },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blocks: [], second: false, maxPerDay: null },
      { id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 2, blocks: [], second: false, maxPerDay: null },
      { id: 'x3', classId: 's433', teacherId: 'oMC', weeklyHours: 2, blocks: [2], second: false, maxPerDay: null },
    ],
    unavailable: {},
    programs: [blankProgram()],
    activeProgramId: 'program-1',
  };
}

function withRule(d: State, name: keyof State['settings']['limits'], limit: number, level: RuleLevel): State {
  return {
    ...d,
    settings: {
      ...d.settings,
      limits: { ...d.settings.limits, [name]: limit },
      rules: { ...d.settings.rules, [name]: level },
    },
  };
}

/**
 * The strongest single assertion in this file: lift each block back off the
 * grid and ask blocker() whether it could legally be dropped where it sits.
 * If the in-place index ever drifts from buildIndex(), it dies here.
 *
 * `illegalBlocks` lives in worlds.ts because the E2E suite audits the built
 * page's own output with the very same function; worlds.test.ts feeds it a
 * knowingly illegal grid, so an auditor that always said "all clear" would be
 * caught rather than making this file pass for free.
 */
function expectLegal(d: State) {
  expect(illegalBlocks(d)).toEqual([]);
}

function placedHours(d: State): number {
  return Object.keys(activeProgram(d).placements).length;
}

describe('solve — küçük dünya', () => {
  it('elde çözülebilir programı tamamen diziyor', () => {
    const result = solve(build());
    expect(result.phase).toBe('solved');
    expect(result.stuck).toEqual([]);
    expect(placedHours(result.state)).toBe(3 + 2 + 2);
    expectLegal(result.state);
  });

  it('aynı girdi aynı çıktıyı veriyor — rastgelelik yok', () => {
    const a = solve(build());
    const b = solve(build());
    expect(Object.keys(activeProgram(a.state).placements).sort()).toEqual(Object.keys(activeProgram(b.state).placements).sort());
    expect(activeProgram(a.state).placements).toEqual(activeProgram(b.state).placements);
  });

  it('kapalı saate hiç yerleştirmiyor', () => {
    let d = build();
    // MÇ cannot come on Monday at all.
    for (let h = 0; h < 4; h++) d = { ...d, unavailable: { ...d.unavailable, [`oMC|0|${h}`]: 1 } };

    const result = solve(d);
    expectLegal(result.state);
    for (const b of blocksOf(result.state)) {
      const teacherId = result.state.lessons.find((x) => x.id === b.lessonId)!.teacherId;
      if (teacherId === 'oMC') expect(b.day).not.toBe(0);
    }
  });

  it('blok bütün kalıyor ve gün sonunu taşmıyor', () => {
    const result = solve(build());
    const block = blocksOf(result.state).find((b) => b.lessonId === 'x3')!;
    expect(block.hour + 2).toBeLessThanOrEqual(4);
    expect(activeProgram(result.state).placements[placementKey('s433', block.day, block.hour)]).toBe('x3');
    expect(activeProgram(result.state).placements[placementKey('s433', block.day, block.hour + 1)]).toBe('x3');
  });

  it('dersi haftaya yayıyor, tek güne yığmıyor', () => {
    // A world with nothing to compete for: one teacher, one class, three days.
    // Three single hours could all sit on Monday and be perfectly legal; the
    // value ordering is what makes them land on three different days.
    const d: State = {
      ...build(),
      teachers: [build().teachers[0]!],
      classes: [build().classes[0]!],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blocks: [], second: false, maxPerDay: null },
      ],
      settings: {
        ...build().settings,
        days: [
          { name: 'Pazartesi', longBreakAfter: 0 },
          { name: 'Salı', longBreakAfter: 0 },
          { name: 'Çarşamba', longBreakAfter: 0 },
        ],
      },
    };

    const result = solve(d);
    expect(result.phase).toBe('solved');
    const days = new Set(
      Object.keys(activeProgram(result.state).placements).map((k) => k.split('|')[1]),
    );
    expect(days.size).toBe(3);
  });
});

describe('solve — yerleşmişleri koruma', () => {
  it('keepPlaced: yerleşmiş blok olduğu yerde kalıyor', () => {
    const d = place(build(), 'x1', 1, 3);
    const result = solve(d, { keepPlaced: true });
    expect(activeProgram(result.state).placements[placementKey('s510', 1, 3)]).toBe('x1');
    expectLegal(result.state);
  });

  it('keepPlaced: kalan saatler kadar ekliyor, fazlasını değil', () => {
    const d = place(build(), 'x1', 1, 3); // 1 of x1's 3 hours already down
    const result = solve(d, { keepPlaced: true });
    const x1 = Object.keys(activeProgram(result.state).placements).filter(
      (k) => activeProgram(result.state).placements[k] === 'x1',
    );
    expect(x1).toHaveLength(3);
  });

  it('keepPlaced: false eskisini silip baştan diziyor', () => {
    const d = place(build(), 'x1', 1, 3);
    const result = solve(d, { keepPlaced: false });
    expect(placedHours(result.state)).toBe(7);
    expectLegal(result.state);
  });

  // "Baştan diz" means "throw away the timetable you built", not "throw away
  // the decisions I made by hand". Without this the one thing a reader is sure
  // about — the block they placed and locked — would be the first casualty of
  // the button next to it.
  it('keepPlaced: false SABİTLENMİŞ bloğu yerinde bırakıyor', () => {
    let d = place(build(), 'x1', 1, 3);
    d = setBlockPinned(d, 's510', 1, 3, true);
    const result = solve(d, { keepPlaced: false });
    expect(activeProgram(result.state).placements[placementKey('s510', 1, 3)]).toBe('x1');
    // ...and the rest is still laid out from scratch around it.
    expect(placedHours(result.state)).toBe(7);
    expectLegal(result.state);
  });

  it('keepPlaced: false sabitlenmiş saati İKİ KEZ saymıyor', () => {
    let d = place(build(), 'x1', 1, 3);
    d = setBlockPinned(d, 's510', 1, 3, true);
    const result = solve(d, { keepPlaced: false });
    const x1 = Object.keys(activeProgram(result.state).placements).filter(
      (k) => activeProgram(result.state).placements[k] === 'x1',
    );
    // x1 wants 3 hours and one of them is already down and locked.
    expect(x1).toHaveLength(3);
  });

  it('sabitlenmemiş yerleşim keepPlaced: false ile GİDİYOR', () => {
    const d = place(build(), 'x1', 1, 3);
    const result = solve(d, { keepPlaced: false });
    // Not an assertion about where it lands, only that the pin is what saved
    // the cell in the test above and not some accident of the search order.
    expect(Object.keys(activeProgram(result.state).placements)).not.toEqual(Object.keys(activeProgram(d).placements));
  });

  it('kapalı saatte kalmış dersi silmiyor (ilke 6)', () => {
    let d = place(build(), 'x1', 0, 0);
    d = { ...d, unavailable: { ...d.unavailable, ['oMC|0|0']: 1 } };
    const result = solve(d, { keepPlaced: true });
    expect(activeProgram(result.state).placements[placementKey('s510', 0, 0)]).toBe('x1');
  });
});

describe('solve — tıkanma', () => {
  it('sığmayan yükte tıkanıyor ve sebebini blocker cümlesiyle söylüyor', () => {
    let d = build();
    // AV cannot come at all: x2 has nowhere to go.
    for (let g = 0; g < 2; g++) {
      for (let h = 0; h < 4; h++) d = { ...d, unavailable: { ...d.unavailable, [`oAV|${g}|${h}`]: 1 } };
    }

    const result = solve(d);
    expect(result.phase).toBe('stuck');
    const stuck = result.stuck.find((x) => x.lessonId === 'x2')!;
    expect(stuck.missing).toBe(2);
    expect(stuck.name).toContain('511');
    expect(stuck.reason).toBe('AV Pazartesi 1 saatinde müsait değil');

    // What DID fit is still there and still legal.
    expectLegal(result.state);
    expect(placedHours(result.state)).toBe(5);
  });

  // This used to be the "bölünmeyen haftalık saat" test: one block length meant
  // 3 hours in doubles was floor(3 / 2) = 1 block and the third hour could
  // never be placed. `pairs` asks the same thing as 2+1, so the hour comes back
  // — and the search has to place blocks of two different lengths for one
  // lesson to do it, which is the whole point of splitting the items.
  it('2+1 dersin ÜÇ saati de yerleşiyor — artık bölünmeyen saat yok', () => {
    const d = build();
    d.lessons[2] = { ...d.lessons[2]!, weeklyHours: 3, blocks: [2] };
    const result = solve(d);
    const x3 = Object.keys(activeProgram(result.state).placements).filter(
      (k) => activeProgram(result.state).placements[k] === 'x3',
    );
    expect(x3).toHaveLength(3);
    expect(result.stuck.find((x) => x.lessonId === 'x3')).toBeUndefined();
    expect(result.phase).toBe('solved');
    expectLegal(result.state);
  });
});

/**
 * The collapse of 2026-08-25, as a test.
 *
 * A lesson that wants more hours than the week can hold used to cost the whole
 * timetable: MRV chose it (smallest domain), it filled every day it was allowed,
 * forward checking found nothing for the blocks still owed, and the branch died
 * — over and over, for every cell of every lesson above it. Measured on the
 * sample school with three limits at Engelle: 3 blocks of 359 placed, 33 842
 * nodes, the entire 15-second budget gone.
 */
describe('solve — haftanın tutabileceğinden fazlasını isteyen ders', () => {
  const world = SMALL_WORLDS.find((w) => w.name === 'imkansiz-ders-yaninda')!.state;

  it('komşu dersleri tam yerleştiriyor', () => {
    const result = solve(world, { budgetMs: 4_000 });
    // x1 asks 6 hours of a week that can hold 3 of them; x2 and x3 are ordinary.
    expect(hoursOf(result.state, 'x2')).toBe(3);
    expect(hoursOf(result.state, 'x3')).toBe(3);
    expect(hoursOf(result.state, 'x1')).toBe(3);
  });

  it('aramayı boğmuyor: düğüm sayısı blok sayısı kadar', () => {
    const result = solve(world, { budgetMs: 4_000 });
    // One node per block is what a run with no backtracking costs. The bug's
    // signature was the opposite: thousands of nodes, almost no blocks.
    expect(result.nodes).toBeLessThanOrEqual(result.totalBlocks + 2);
    expect(result.elapsedMs).toBeLessThan(1_000);
  });

  it('sebep olarak tavanı söylüyor, "sınıf dolu" demiyor', () => {
    const result = solve(world, { budgetMs: 4_000 });
    const stuck = result.stuck.find((x) => x.lessonId === 'x1')!;
    expect(stuck.missing).toBe(3);
    expect(stuck.reason).toBe(
      'haftada 6 saat isteniyor, açık saatler ve kurallar en fazla 3 saat veriyor',
    );
  });
});

describe('solve — kurallar', () => {
  it('Engelle seviyesindeki kuralı hiç ihlal etmiyor', () => {
    const d = withRule(build(), 'maxConsecutive', 1, 'block');
    const result = solve(d);
    expectLegal(result.state);
    const broken = findViolations(result.state, buildIndex(result.state)).filter(
      (v) => v.level === 'block',
    );
    expect(broken).toEqual([]);
  });

  it('günlük en fazla sınırı da tutuyor', () => {
    const d = withRule(build(), 'maxPerDay', 2, 'block');
    const result = solve(d);
    expectLegal(result.state);
    expect(
      findViolations(result.state, buildIndex(result.state)).filter((v) => v.level === 'block'),
    ).toEqual([]);
  });

  it('Uyar seviyesi yerleştirmeyi durdurmuyor', () => {
    const d = withRule(build(), 'maxConsecutive', 1, 'warn');
    const result = solve(d);
    expect(result.phase).toBe('solved');
    expectLegal(result.state);
  });
});

describe('createSolver — dilimleme ve iptal', () => {
  it('iptal edilince o ana kadarki en iyi atamayı veriyor', () => {
    const solver = createSolver(sampleState());
    solver.step(30);
    const result = solver.cancel();
    expect(result.phase === 'cancelled' || result.phase === 'solved').toBe(true);
    expect(result.nodes).toBeGreaterThan(0);
    expectLegal(result.state);
  });

  it('iptalden sonra step aynı sonucu döndürüyor', () => {
    const solver = createSolver(sampleState());
    solver.step(20);
    const cancelled = solver.cancel();
    expect(solver.step(20)).toBe(cancelled);
  });

  it('sıfır bütçe hiçbir şey yerleştirmiyor ve AYNI state nesnesini döndürüyor', () => {
    const base = build();
    const result = solve(base, { budgetMs: 0 });
    // Reference equality on purpose: store.ts drops a change that returns the
    // same object, so a fruitless run must not push an undo step.
    expect(result.state).toBe(base);
    expect(result.placedBlocks).toBe(0);
  });

  it('ders yoksa anında çözülmüş sayılıyor', () => {
    const base: State = replaceActiveGrid({ ...build(), lessons: [] }, { placements: {} });
    const result = solve(base);
    expect(result.phase).toBe('solved');
    expect(result.state).toBe(base);
  });

  it('ilerleme sayacı artıyor', () => {
    const solver = createSolver(sampleState());
    solver.step(25);
    const p = solver.progress();
    expect(p.totalBlocks).toBeGreaterThan(0);
    expect(p.nodes).toBeGreaterThan(0);
    expect(p.elapsedMs).toBeGreaterThan(0);
  });
});

describe('solve — gerçek ölçek', () => {
  it('örnek veriyi makul sürede ve yasal biçimde diziyor', () => {
    const base = sampleState();
    const result = solve(base, { budgetMs: 4_000 });

    expectLegal(result.state);
    expect(result.placedBlocks).toBeGreaterThan(0);
    // Whatever it managed, it may never place MORE than was asked for.
    for (const lesson of base.lessons) {
      const placed = Object.keys(activeProgram(result.state).placements).filter(
        (k) => activeProgram(result.state).placements[k] === lesson.id,
      ).length;
      expect(placed).toBeLessThanOrEqual(lesson.weeklyHours);
    }

    // Not an assertion, a measurement: this number goes into docs/STATUS.md.
    console.log(
      `[ölçüm] solver: ${result.placedBlocks}/${result.totalBlocks} blok, ` +
        `${result.nodes} düğüm, ${Math.round(result.elapsedMs)} ms, faz=${result.phase}, ` +
        `yerleşmeyen ders=${result.stuck.length}`,
    );
  }, 30_000);
});


// ---------------------------------------------------------------------------
// The world matrix.
//
// Until this existed the solver was only ever asked two questions: the little
// world built above, and sample.ts. Both go through in a straight line — 359
// blocks in 359 nodes — so the backtracking half of solver.ts had never run.
// Each world here is a different SHAPE of load: a room bottleneck, nothing but
// blocks, a single day, a week full of holes, a greedy first choice that turns
// out to be wrong.

describe.each(SMALL_WORLDS)('dünya: $name', (world) => {
  const first = solve(world.state, { budgetMs: 4_000 });

  it(world.note, () => {
    // Not an assertion, a measurement — the same habit as the real-scale test.
    console.log(
      `[ölçüm] ${world.name}: ${first.placedBlocks}/${first.totalBlocks} blok, ` +
        `${first.nodes} düğüm, ${Math.round(first.elapsedMs)} ms, faz=${first.phase}, ` +
        `yerleşemeyen ders=${first.stuck.length}`,
    );

    // 1. Every block is legal by the same blocker() the dragging hand is judged
    //    by. The pre-existing grid is the baseline: a lesson left sitting in an
    //    hour that was closed AFTERWARDS is kept on purpose (principle 6), so
    //    what is forbidden is ADDING an illegal block, not inheriting one.
    const before = illegalBlocks(world.state).map((x) => `${x.classId}|${x.day}|${x.hour}`);
    for (const bad of illegalBlocks(first.state)) {
      expect(before, `${world.name}: ${bad.reason}`).toContain(
        `${bad.classId}|${bad.day}|${bad.hour}`,
      );
    }

    // 2. Never more hours than were asked for.
    for (const lesson of world.state.lessons) {
      expect(hoursOf(first.state, lesson.id)).toBeLessThanOrEqual(lesson.weeklyHours);
    }

    // 3. A rule at "Engelle" is a hard constraint; not one may survive.
    expect(
      findViolations(first.state, buildIndex(first.state)).filter((v) => v.level === 'block'),
    ).toEqual([]);

    // 4. Every hand-placed block is exactly where it was left.
    for (const [key, lessonId] of Object.entries(activeProgram(world.state).placements)) {
      expect(activeProgram(first.state).placements[key], `${world.name}: ${key} kaydı`).toBe(lessonId);
    }
  });

  it('aynı girdi aynı çıktıyı veriyor', () => {
    const second = solve(world.state, { budgetMs: 4_000 });
    expect(activeProgram(second.state).placements).toEqual(activeProgram(first.state).placements);
  });

  if (world.want.solved) {
    it('bütün yük yerleşiyor', () => {
      expect(first.stuck).toEqual([]);
      expect(first.phase).toBe('solved');
      for (const lesson of world.state.lessons) {
        expect(hoursOf(first.state, lesson.id)).toBe(lesson.weeklyHours);
      }
    });
  } else {
    it('yerleşemeyeni sayıyor ve sebebini somut bir cümleyle söylüyor', () => {
      expect(first.stuck.length).toBeGreaterThan(0);
      for (const stuck of first.stuck) {
        expect(stuck.missing).toBeGreaterThan(0);
        expect(stuck.reason.length).toBeGreaterThan(0);
        expect(stuck.name.length).toBeGreaterThan(0);
      }
      if (world.want.reasonLike !== undefined) {
        expect(first.stuck[0]!.reason).toMatch(world.want.reasonLike);
      }
      // What did fit is still a timetable somebody can use.
      expect(blocksOf(first.state).length).toBe(first.placedBlocks);
      // Nothing is 'solved' while something is missing.
      expect(first.phase).toBe('stuck');
    });
  }

  if (world.want.backtracks === true) {
    it('arama gerçekten geri sarıyor', () => {
      // A run that never backs up spends exactly one node per block — measured
      // on sample.ts: 359 blocks, 359 nodes. More nodes than blocks is the only
      // evidence there is that the backtracking code ran at all.
      expect(first.nodes).toBeGreaterThan(first.totalBlocks);
    });
  }
});
import { activeProgram, blankProgram, replaceActiveGrid } from './programs';
