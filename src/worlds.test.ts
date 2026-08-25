// Tests for the test scaffolding — which sounds circular until you notice that
// `illegalBlocks` returning [] unconditionally would make every solver test in
// this project pass. The auditor is checked against a grid that is KNOWN to be
// illegal before it is trusted to judge one that should not be.

import { describe, expect, it } from 'vitest';
import { placementKey } from './constraints';
import { parseState } from './store';
import { closeHours, closeWeek, hoursOf, illegalBlocks, makeWorld, WORLDS } from './worlds';
import type { State } from './types';

/** Two classes, one teacher, four hours. */
function pair(): State {
  return makeWorld({
    days: 2,
    hours: 4,
    teachers: [{ id: 'oMC', short: 'MÇ' }],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: null },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 },
      { id: 'x2', classId: 's511', teacherId: 'oMC', weeklyHours: 2 },
    ],
  });
}

describe('illegalBlocks — denetçinin kendisi', () => {
  it('temiz ızgarada hiçbir şey bulmuyor', () => {
    const d = pair();
    d.placements[placementKey('s510', 0, 0)] = 'x1';
    d.placements[placementKey('s511', 0, 1)] = 'x2';
    expect(illegalBlocks(d)).toEqual([]);
  });

  it('aynı öğretmeni aynı saatte iki sınıfa koyunca YAKALIYOR', () => {
    const d = pair();
    d.placements[placementKey('s510', 0, 0)] = 'x1';
    d.placements[placementKey('s511', 0, 0)] = 'x2'; // MÇ iki yerde birden
    // BOTH are illegal, and that is the right answer: lift either one and the
    // other is still sitting in the teacher's hour.
    const bad = illegalBlocks(d);
    expect(bad).toHaveLength(2);
    expect(bad.every((x) => x.reason.includes('MÇ'))).toBe(true);
  });

  it('kapalı saatte duran dersi yakalıyor', () => {
    let d = pair();
    d.placements[placementKey('s510', 1, 2)] = 'x1';
    d = closeHours(d, 'oMC', [[1, 2]]);
    expect(illegalBlocks(d)).toHaveLength(1);
    expect(illegalBlocks(d)[0]?.reason).toContain('müsait değil');
  });

  it('gün sonunu taşan bloğu yakalıyor', () => {
    const d = makeWorld({
      days: 1,
      hours: 4,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 2 }],
    });
    d.placements[placementKey('s510', 0, 3)] = 'x1'; // 2 saatlik blok, 3'ten başlıyor
    expect(illegalBlocks(d)).toHaveLength(1);
  });

  it('çok saatlik bloğu TEK blok sayıyor, saat saat değil', () => {
    const d = makeWorld({
      days: 1,
      hours: 4,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 3 }],
    });
    d.placements[placementKey('s510', 0, 0)] = 'x1';
    d.placements[placementKey('s510', 0, 1)] = 'x1';
    d.placements[placementKey('s510', 0, 2)] = 'x1';
    expect(illegalBlocks(d)).toEqual([]);
    expect(hoursOf(d, 'x1')).toBe(3);
  });
});

describe('makeWorld', () => {
  it('yedek dosyası turundan sağ çıkıyor — E2E tam bu yoldan geçiyor', () => {
    for (const w of WORLDS) {
      const back = parseState(JSON.stringify(w.state));
      expect(back, `${w.name} okunamadı`).not.toBeNull();
      expect(back!.lessons).toHaveLength(w.state.lessons.length);
      expect(back!.teachers).toHaveLength(w.state.teachers.length);
      expect(back!.classes).toHaveLength(w.state.classes.length);
      expect(Object.keys(back!.placements)).toHaveLength(
        Object.keys(w.state.placements).length,
      );
    }
  });

  it('sanitize hiçbir dünyanın dersini ya da kapalı saatini atmıyor', () => {
    for (const w of WORLDS) {
      const back = parseState(JSON.stringify(w.state))!;
      expect(Object.keys(back.unavailable).length, `${w.name} kapalı saat kaybetti`).toBe(
        Object.keys(w.state.unavailable).length,
      );
    }
  });

  it('dünya adları benzersiz — testler ada göre bulunuyor', () => {
    const names = WORLDS.map((w) => w.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('closeWeek / closeHours', () => {
  it('closeWeek bütün haftayı kapatıyor', () => {
    const d = closeWeek(pair(), 'oMC');
    expect(Object.keys(d.unavailable)).toHaveLength(2 * 4);
  });

  it('closeHours yalnız verilen hücreleri kapatıyor ve öncekini korur', () => {
    let d = closeHours(pair(), 'oMC', [[0, 0]]);
    d = closeHours(d, 's510', [[1, 1]]);
    expect(d.unavailable['oMC|0|0']).toBe(1);
    expect(d.unavailable['s510|1|1']).toBe(1);
    expect(Object.keys(d.unavailable)).toHaveLength(2);
  });
});
