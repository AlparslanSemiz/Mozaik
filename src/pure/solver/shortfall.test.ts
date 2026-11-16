// The stuck sentence names the shortfall, not one closed hour of it (audit
// 2026-11-16, cases K1, K3 and K4 of the probe `zz-kirik`).

import { describe, expect, it } from 'vitest';
import { buildIndex } from '../constraints';
import { closeHours, makeWorld } from '../worlds';
import type { State } from '../../leaf/model';
import { solve } from './solver';
import { bindingPair, shortfalls } from './shortfall';

/** K1: MÇ teaches three classes 6 hours each, 18, and is open 3 days × 5 = 15. */
function k1(): State {
  const d = makeWorld({
    days: 5,
    hours: 6,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV' },
    ],
    classes: [
      { id: 'a', name: '9A', roomId: null },
      { id: 'b', name: '9B', roomId: null },
      { id: 'c', name: '9C', roomId: null },
    ],
    lessons: [
      { id: 'm1', classId: 'a', teacherId: 'oMC', weeklyHours: 6, blockSize: 2 },
      { id: 'm2', classId: 'b', teacherId: 'oMC', weeklyHours: 6, blockSize: 2 },
      { id: 'm3', classId: 'c', teacherId: 'oMC', weeklyHours: 6, blockSize: 2 },
      { id: 'f1', classId: 'a', teacherId: 'oAV', weeklyHours: 4 },
      { id: 'f2', classId: 'b', teacherId: 'oAV', weeklyHours: 4 },
    ],
  });
  const closed: Array<[number, number]> = [];
  for (const g of [3, 4]) for (let h = 0; h < 6; h++) closed.push([g, h]);
  for (let g = 0; g < 3; g++) closed.push([g, 5]);
  return closeHours(d, 'oMC', closed);
}

/** K3: 9A and 9B share room A, 12 + 12 hours in 5 × 4 = 20 cells. */
function k3(): State {
  return makeWorld({
    days: 5,
    hours: 4,
    rooms: [
      { id: 'dA', name: 'A' },
      { id: 'dB', name: 'B' },
    ],
    teachers: [
      { id: 't1', short: 'T1' },
      { id: 't2', short: 'T2' },
      { id: 't3', short: 'T3' },
      { id: 't4', short: 'T4' },
    ],
    classes: [
      { id: 'a', name: '9A', roomId: 'dA' },
      { id: 'b', name: '9B', roomId: 'dA' },
      { id: 'c', name: '9C', roomId: 'dB' },
    ],
    lessons: [
      { id: 'a1', classId: 'a', teacherId: 't1', weeklyHours: 6 },
      { id: 'a2', classId: 'a', teacherId: 't2', weeklyHours: 6 },
      { id: 'b1', classId: 'b', teacherId: 't3', weeklyHours: 6 },
      { id: 'b2', classId: 'b', teacherId: 't4', weeklyHours: 6 },
      { id: 'c1', classId: 'c', teacherId: 't1', weeklyHours: 4 },
    ],
  });
}

/** K4: x and y once a day each, three days each, never the same day, in a 4-day week. */
function k4(): State {
  const d = makeWorld({
    days: 4,
    hours: 4,
    teachers: [
      { id: 't1', short: 'T1' },
      { id: 't2', short: 'T2' },
    ],
    classes: [{ id: 'a', name: '9A', roomId: null }],
    lessons: [
      { id: 'x', classId: 'a', teacherId: 't1', weeklyHours: 3, maxPerDay: 1 },
      { id: 'y', classId: 'a', teacherId: 't2', weeklyHours: 3, maxPerDay: 1 },
    ],
    limits: { maxSameLessonPerDay: 1 },
  });
  return { ...d, relations: [{ id: 'r1', kind: 'notSameDay', lessonIds: ['x', 'y'] }] };
}

describe('tıkanınca açık söyleniyor', () => {
  it('öğretmenin açığı: kaç saat ders, kaç müsait saat, kaç saat açılmalı', () => {
    const d = k1();
    expect(shortfalls(d).get('oMC')).toBe('MÇ: 18 saat ders, 15 müsait saat; 3 saat açılmalı');
    const r = solve(d, { keepPlaced: false });
    expect(r.phase).toBe('stuck');
    // Every lesson MÇ holds up says it, and they come first.
    for (const s of r.stuck.filter((x) => x.name.includes('MÇ'))) {
      expect(s.reason).toBe('MÇ: 18 saat ders, 15 müsait saat; 3 saat açılmalı');
    }
    expect(r.stuck[0]!.reason).toContain('MÇ: 18 saat ders');
  }, 30_000);

  it('günlük sınır bağlıyorsa açık değil dersin tavanı söyleniyor', () => {
    const d = makeWorld({
      days: 2,
      hours: 6,
      teachers: [
        { id: 'oMC', short: 'MÇ', limits: { maxConsecutive: null, maxPerDay: 3, minPerDay: null } },
      ],
      classes: [{ id: 'a', name: '9A', roomId: null }],
      lessons: [{ id: 'm', classId: 'a', teacherId: 'oMC', weeklyHours: 8 }],
      rules: { maxPerDay: 'block' },
    });
    // 12 open hours hold the 8; the rule (3 a day) is what binds, and
    // blocker()'s own sentence already names it.
    expect(shortfalls(d).size).toBe(0);
    const r = solve(d, { keepPlaced: false });
    expect(r.stuck[0]!.reason).toContain('en fazla 3 saat');
  });

  it('paylaşılan dersliğin açığı ve çaresi', () => {
    const d = k3();
    expect(shortfalls(d).get('dA')).toBe(
      'A dersliği: 24 saat ders, 20 açık saat; 4 saat açılmalı ya da bir sınıf başka dersliğe geçmeli',
    );
    const r = solve(d, { keepPlaced: false });
    expect(r.stuck.length).toBeGreaterThan(0);
    for (const s of r.stuck) expect(s.reason).toContain('A dersliği: 24 saat ders');
  }, 30_000);

  it('bağlayan "aynı gün olmasın" ilişkisini adıyla söylüyor', () => {
    const d = k4();
    expect(shortfalls(d).size).toBe(0);
    const pair = bindingPair(d, buildIndex(d), 'x');
    expect(pair).toContain('aynı güne konmamalı: 3 + 3 gün gerekiyor, 4 gün var');
    const r = solve(d, { keepPlaced: false });
    expect(r.phase).toBe('stuck');
    expect(r.stuck[0]!.reason).toContain('aynı güne konmamalı');
  });

  it('sığan haftada açık yok', () => {
    const d = makeWorld({
      days: 2,
      hours: 4,
      teachers: [{ id: 't1', short: 'T1' }],
      classes: [{ id: 'a', name: '9A', roomId: null }],
      lessons: [{ id: 'x', classId: 'a', teacherId: 't1', weeklyHours: 4 }],
    });
    expect(shortfalls(d).size).toBe(0);
    expect(bindingPair(d, buildIndex(d), 'x')).toBeNull();
  });
});
