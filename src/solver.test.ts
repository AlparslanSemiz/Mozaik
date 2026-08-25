// The solver is the one place where the tool decides something by itself, so
// what is tested is not "did it produce output" but "is the output legal by the
// SAME engine the user's own dragging is judged by".

import { describe, expect, it } from 'vitest';
import {
  blockStart,
  blocker,
  buildIndex,
  placementKey,
  place,
  removeBlock,
} from './constraints';
import { DEFAULT_BELL, DEFAULT_LIMITS, DEFAULT_RULES, NO_TEACHER_LIMITS } from './entities';
import { findViolations } from './rules';
import { sampleState } from './sample';
import { createSolver, solve } from './solver';
import type { RuleLevel, State } from './types';
import { SCHEMA_VERSION } from './types';

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
      { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', color: 0, limits: { ...NO_TEACHER_LIMITS } },
      { id: 'oAV', name: 'Ayşe Var', short: 'AV', subject: 'Fizik', color: 1, limits: { ...NO_TEACHER_LIMITS } },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA', color: 0 },
      { id: 's511', name: '511', roomId: 'dA', color: 1 },
      { id: 's433', name: '433', roomId: 'dB', color: 2 },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 1, maxPerDay: null },
      { id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 2, blockSize: 1, maxPerDay: null },
      { id: 'x3', classId: 's433', teacherId: 'oMC', weeklyHours: 2, blockSize: 2, maxPerDay: null },
    ],
    unavailable: {},
    placements: {},
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

/** Every block on the grid, found the way the grid itself finds them. */
function blocksOf(d: State): Array<{ lessonId: string; classId: string; day: number; hour: number }> {
  const seen = new Set<string>();
  const out: Array<{ lessonId: string; classId: string; day: number; hour: number }> = [];
  for (const key of Object.keys(d.placements)) {
    const [classId, dayText, hourText] = key.split('|');
    const day = Number(dayText);
    const hour = Number(hourText);
    const start = blockStart(d, classId!, day, hour);
    if (start === null) continue;
    const mark = `${classId}|${day}|${start}`;
    if (seen.has(mark)) continue;
    seen.add(mark);
    out.push({ lessonId: d.placements[placementKey(classId!, day, start)]!, classId: classId!, day, hour: start });
  }
  return out;
}

/**
 * The strongest single assertion in this file: lift each block back off the
 * grid and ask blocker() whether it could legally be dropped where it sits.
 * If the in-place index ever drifts from buildIndex(), it dies here.
 */
function expectLegal(d: State) {
  for (const b of blocksOf(d)) {
    const lifted = removeBlock(d, b.classId, b.day, b.hour);
    const reason = blocker(lifted, buildIndex(lifted), b.lessonId, b.day, b.hour);
    expect(reason).toBeNull();
  }
}

function placedHours(d: State): number {
  return Object.keys(d.placements).length;
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
    expect(Object.keys(a.state.placements).sort()).toEqual(Object.keys(b.state.placements).sort());
    expect(a.state.placements).toEqual(b.state.placements);
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
    expect(result.state.placements[placementKey('s433', block.day, block.hour)]).toBe('x3');
    expect(result.state.placements[placementKey('s433', block.day, block.hour + 1)]).toBe('x3');
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
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 1, maxPerDay: null },
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
      Object.keys(result.state.placements).map((k) => k.split('|')[1]),
    );
    expect(days.size).toBe(3);
  });
});

describe('solve — yerleşmişleri koruma', () => {
  it('keepPlaced: yerleşmiş blok olduğu yerde kalıyor', () => {
    const d = place(build(), 'x1', 1, 3);
    const result = solve(d, { keepPlaced: true });
    expect(result.state.placements[placementKey('s510', 1, 3)]).toBe('x1');
    expectLegal(result.state);
  });

  it('keepPlaced: kalan saatler kadar ekliyor, fazlasını değil', () => {
    const d = place(build(), 'x1', 1, 3); // 1 of x1's 3 hours already down
    const result = solve(d, { keepPlaced: true });
    const x1 = Object.keys(result.state.placements).filter(
      (k) => result.state.placements[k] === 'x1',
    );
    expect(x1).toHaveLength(3);
  });

  it('keepPlaced: false eskisini silip baştan diziyor', () => {
    const d = place(build(), 'x1', 1, 3);
    const result = solve(d, { keepPlaced: false });
    expect(placedHours(result.state)).toBe(7);
    expectLegal(result.state);
  });

  it('kapalı saatte kalmış dersi silmiyor (ilke 6)', () => {
    let d = place(build(), 'x1', 0, 0);
    d = { ...d, unavailable: { ...d.unavailable, ['oMC|0|0']: 1 } };
    const result = solve(d, { keepPlaced: true });
    expect(result.state.placements[placementKey('s510', 0, 0)]).toBe('x1');
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

  it('bölünmeyen haftalık saat: blok kadarını koyup kalanını bırakıyor', () => {
    const d = build();
    d.lessons[2] = { ...d.lessons[2]!, weeklyHours: 3, blockSize: 2 }; // 3 hours, 2-hour blocks
    const result = solve(d);
    const x3 = Object.keys(result.state.placements).filter((k) => result.state.placements[k] === 'x3');
    expect(x3).toHaveLength(2);
    expect(result.stuck.find((x) => x.lessonId === 'x3')?.missing).toBe(1);
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
    const base: State = { ...build(), lessons: [], placements: {} };
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
      const placed = Object.keys(result.state.placements).filter(
        (k) => result.state.placements[k] === lesson.id,
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
