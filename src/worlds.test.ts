// Tests for the test scaffolding — which sounds circular until you notice that
// `illegalBlocks` returning [] unconditionally would make every solver test in
// this project pass. The auditor is checked against a grid that is KNOWN to be
// illegal before it is trusted to judge one that should not be.

import { describe, expect, it } from 'vitest';
import { placementKey } from './constraints';
import { parseState } from './store';
import {
  closeHours,
  closeWeek,
  gridQuality,
  hoursOf,
  illegalBlocks,
  makeWorld,
  WORLDS,
} from './worlds';
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
    activeProgram(d).placements[placementKey('s510', 0, 0)] = 'x1';
    activeProgram(d).placements[placementKey('s511', 0, 1)] = 'x2';
    expect(illegalBlocks(d)).toEqual([]);
  });

  it('aynı öğretmeni aynı saatte iki sınıfa koyunca YAKALIYOR', () => {
    const d = pair();
    activeProgram(d).placements[placementKey('s510', 0, 0)] = 'x1';
    activeProgram(d).placements[placementKey('s511', 0, 0)] = 'x2'; // MÇ iki yerde birden
    // BOTH are illegal, and that is the right answer: lift either one and the
    // other is still sitting in the teacher's hour.
    const bad = illegalBlocks(d);
    expect(bad).toHaveLength(2);
    expect(bad.every((x) => x.reason.includes('MÇ'))).toBe(true);
  });

  it('kapalı saatte duran dersi yakalıyor', () => {
    let d = pair();
    activeProgram(d).placements[placementKey('s510', 1, 2)] = 'x1';
    d = closeHours(d, 'oMC', [[1, 2]]);
    expect(illegalBlocks(d)).toHaveLength(1);
    expect(illegalBlocks(d)[0]?.reason).toContain('müsait değil');
  });

  // The auditor re-asks about each block with the block's OWN length. Since v7
  // one lesson can hold blocks of two lengths, so "which block is this" is a
  // real question and getting it wrong hides exactly this: a double whose
  // SECOND hour is closed looks perfectly legal cell by cell.
  it('ikinci saati kapalı olan 2’lik bloğu yakalıyor', () => {
    let d = makeWorld({
      days: 2,
      hours: 4,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 2 }],
    });
    activeProgram(d).placements[placementKey('s510', 0, 0)] = 'x1';
    activeProgram(d).placements[placementKey('s510', 0, 1)] = 'x1';
    d = closeHours(d, 'oMC', [[0, 1]]);
    const bad = illegalBlocks(d);
    expect(bad).toHaveLength(1);
    expect(bad[0]?.reason).toContain('müsait değil');
  });

  // …and the mirror image: a 2+1 lesson whose SINGLE sits on a closed hour. If
  // the auditor read the run as one three-hour block it would ask about the
  // wrong cells.
  it('2+1 dersin tek saatlik bloğu kapalı saatteyse yakalıyor', () => {
    let d = makeWorld({
      days: 2,
      hours: 4,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 2 }],
    });
    activeProgram(d).placements[placementKey('s510', 0, 0)] = 'x1'; // the double: 0 and 1
    activeProgram(d).placements[placementKey('s510', 0, 1)] = 'x1';
    activeProgram(d).placements[placementKey('s510', 1, 2)] = 'x1'; // the single, another day
    expect(illegalBlocks(d)).toEqual([]);

    d = closeHours(d, 'oMC', [[1, 2]]);
    const bad = illegalBlocks(d);
    expect(bad).toHaveLength(1);
    expect(bad[0]?.hour).toBe(2);
  });

  // The auditor asks about the block it FOUND, at the length it found it. With
  // only 1 and 2 in the model an off-by-one here still landed inside the block;
  // a 3 has a middle hour, and a middle hour is the one a wrong length skips.
  it('ÜÇLÜ bloğun ORTA saati kapalıysa yakalıyor', () => {
    let d = makeWorld({
      days: 2,
      hours: 4,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 3 }],
    });
    for (let h = 0; h < 3; h++) activeProgram(d).placements[placementKey('s510', 0, h)] = 'x1';
    expect(illegalBlocks(d)).toEqual([]);

    d = closeHours(d, 'oMC', [[0, 1]]);
    const bad = illegalBlocks(d);
    expect(bad).toHaveLength(1);
    expect(bad[0]?.size).toBe(3);
    expect(bad[0]?.reason).toContain('müsait değil');
  });

  // The LAST hour of a triple. An auditor that walked two hours per block — the
  // number that was hard-coded everywhere before v9 — would clear this grid.
  it('ÜÇLÜ bloğun SON saati kapalıysa yakalıyor', () => {
    let d = makeWorld({
      days: 2,
      hours: 4,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 3 }],
    });
    for (let h = 0; h < 3; h++) activeProgram(d).placements[placementKey('s510', 0, h)] = 'x1';
    expect(illegalBlocks(d)).toEqual([]);

    d = closeHours(d, 'oMC', [[0, 2]]);
    const bad = illegalBlocks(d);
    expect(bad).toHaveLength(1);
    expect(bad[0]?.size).toBe(3);
  });

  it('çok saatlik bloğu TEK blok sayıyor, saat saat değil', () => {
    const d = makeWorld({
      days: 1,
      hours: 4,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 2 }],
    });
    activeProgram(d).placements[placementKey('s510', 0, 0)] = 'x1';
    activeProgram(d).placements[placementKey('s510', 0, 1)] = 'x1';
    activeProgram(d).placements[placementKey('s510', 0, 2)] = 'x1';
    expect(illegalBlocks(d)).toEqual([]);
    expect(hoursOf(d, 'x1')).toBe(3);
  });
});

// The same argument one floor up: `gridQuality` returning zeroes would make the
// Deney B measurement — and every solver-quality number written into STATUS —
// agree with whatever was hoped for. So it is shown a grid whose gaps can be
// counted on paper before it is trusted to count a school's.
describe('gridQuality — kalite ölçerin kendisi', () => {
  /** One class, one teacher, one day of 6 hours; fills the given hours. */
  function day(hours: number[]): State {
    const d = makeWorld({
      days: 1,
      hours: 6,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6 }],
    });
    for (const h of hours) activeProgram(d).placements[placementKey('s510', 0, h)] = 'x1';
    return d;
  }

  it('bitişik saatlerde delik YOK', () => {
    const q = gridQuality(day([0, 1, 2]));
    expect(q.classGaps).toBe(0);
    expect(q.teacherGaps).toBe(0);
    expect(q.gappyClassDays).toBe(0);
  });

  it('iki dersin ARASINDAKİ boş saati sayıyor', () => {
    const q = gridQuality(day([0, 2]));
    expect(q.classGaps).toBe(1);
    expect(q.teacherGaps).toBe(1);
    expect(q.gappyClassDays).toBe(1);
    expect(q.gappyTeacherDays).toBe(1);
  });

  it('iki delik iki sayılıyor, ama GÜN bir', () => {
    const q = gridQuality(day([0, 2, 4]));
    expect(q.classGaps).toBe(2);
    expect(q.gappyClassDays).toBe(1);
  });

  // The half that makes this a definition rather than a count of empty cells:
  // coming in at the second period is a late start, not a gap.
  it('UÇLARDAKİ boşluk delik değil — geç başlangıç ve erken bitiş', () => {
    const q = gridQuality(day([2, 3]));
    expect(q.classGaps).toBe(0);
    expect(q.teacherGaps).toBe(0);
  });

  it('tek dolu saatli gün deliksiz', () => {
    expect(gridQuality(day([3])).classGaps).toBe(0);
  });

  it('boş gün hiç sayılmıyor — öğretmen-günü de artmıyor', () => {
    const q = gridQuality(day([]));
    expect(q.classGaps).toBe(0);
    expect(q.teacherDays).toBe(0);
  });

  it('öğretmen-günü okula GELDİĞİ günleri sayıyor', () => {
    expect(gridQuality(day([1, 4])).teacherDays).toBe(1);
  });

  // A teacher's gaps are their own: two classes back to back leave the teacher
  // whole while each class waits. Counting one and calling it the other is the
  // mistake this separates.
  it('sınıfın deliği ile öğretmenin deliği AYRI şeyler', () => {
    const d = makeWorld({
      days: 1,
      hours: 4,
      teachers: [{ id: 'oMC', short: 'MÇ' }],
      classes: [
        { id: 's510', name: '510', roomId: null },
        { id: 's511', name: '511', roomId: null },
      ],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 },
        { id: 'x2', classId: 's511', teacherId: 'oMC', weeklyHours: 2 },
      ],
    });
    // MÇ: 0,1,2,3 kesintisiz. 510: 0 ve 2 → bir delik. 511: 1 ve 3 → bir delik.
    activeProgram(d).placements[placementKey('s510', 0, 0)] = 'x1';
    activeProgram(d).placements[placementKey('s511', 0, 1)] = 'x2';
    activeProgram(d).placements[placementKey('s510', 0, 2)] = 'x1';
    activeProgram(d).placements[placementKey('s511', 0, 3)] = 'x2';

    const q = gridQuality(d);
    expect(q.teacherGaps).toBe(0);
    expect(q.classGaps).toBe(2);
    expect(q.gappyClassDays).toBe(2);
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
      expect(Object.keys(activeProgram(back!).placements)).toHaveLength(
        Object.keys(activeProgram(w.state).placements).length,
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
import { activeProgram } from './programs';
