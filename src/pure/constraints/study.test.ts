// A teacher's question-solving hours (schema v20, plan B): the two refusals
// (a lesson cannot go on one, one cannot go on a lesson), what the solver does
// with them, and that nothing that counts lessons sees them.

import { describe, expect, it } from 'vitest';
import { activePlacements, activeStudy } from '../grid';
import { solve } from '../solver';
import { closeHours, makeWorld } from '../worlds';
import { findViolations } from './rules';
import { blocker, blockerDetail } from './engine';
import { buildIndex, countPlacedHours } from './occupancy';
import { addStudy, removeStudy, studyBlocker } from './study';
import { placementKey } from '../../leaf/model';

// One teacher, two classes, one day of four hours. MÇ teaches 510 two hours
// and 511 one; AV teaches 511 one hour.
const world = () =>
  makeWorld({
    days: 2,
    hours: 4,
    teachers: [
      { id: 'tMC', short: 'Ali Bey' },
      { id: 'tAV', short: 'AV' },
    ],
    classes: [
      { id: 'c510', name: '510', roomId: null },
      { id: 'c511', name: '511', roomId: null },
    ],
    lessons: [
      { id: 'l1', classId: 'c510', teacherId: 'tMC', weeklyHours: 2 },
      { id: 'l2', classId: 'c511', teacherId: 'tMC', weeklyHours: 1 },
      { id: 'l3', classId: 'c511', teacherId: 'tAV', weeklyHours: 1 },
    ],
  });

describe('B1: soru çözümüne ders bırakılamaz', () => {
  it('ret cümlesi öğretmenin adıyla "o saatte soru çözümünde" der', () => {
    const d = addStudy(world(), 'tMC', 0, 1);
    expect(activeStudy(d)).toEqual({ 'tMC|0|1': 1 });
    const why = blockerDetail(d, buildIndex(d), 'l1', 0, 1);
    expect(why).toEqual({ code: 'teacherStudy', message: 'Ali Bey o saatte soru çözümünde' });
    // The same teacher's other hours, and other teachers' hour, are free.
    expect(blocker(d, buildIndex(d), 'l1', 0, 0)).toBeNull();
    expect(blocker(d, buildIndex(d), 'l3', 0, 1)).toBeNull();
  });

  it('Kalanı diz o saati öğretmenin kapalı saati gibi okur, sonuç kapalı saat taşımaz', () => {
    // MÇ has 3 hours to place and the day has 4 hours x 2 days; closing every
    // hour but two with study hours leaves exactly those two for him.
    let d = world();
    for (const [g, s] of [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ] as const) {
      d = addStudy(d, 'tMC', g, s);
    }
    d = { ...d, lessons: d.lessons.filter((l) => l.id !== 'l2') };
    const done = solve(d);
    expect(done.phase).toBe('solved');
    const study = activeStudy(done.state);
    expect(Object.keys(study)).toHaveLength(6);
    for (const key of Object.keys(activePlacements(done.state))) {
      const lesson = done.state.lessons.find((l) => l.id === activePlacements(done.state)[key])!;
      const [, g, s] = key.split('|');
      expect(study[`${lesson.teacherId}|${g}|${s}`], key).toBeUndefined();
    }
    // Nothing closed was written into the plan to make it so.
    expect(done.state.unavailable).toEqual(d.unavailable);
  });

  it('boş yer yetmiyorsa dersi soru çözümüne koymak yerine takılıyor', () => {
    let d = world();
    for (const g of [0, 1]) for (const s of [0, 1, 2, 3]) d = addStudy(d, 'tMC', g, s);
    const done = solve(d);
    expect(done.phase).toBe('stuck');
    expect(Object.keys(activePlacements(done.state)).filter((k) => !k.startsWith('c511'))).toEqual(
      [],
    );
  });
});

describe('B4: dersi olan hücreye soru çözümü konamaz', () => {
  it('öğretmen o saatte derste ise ret, sınıf adıyla', () => {
    const d = {
      ...world(),
      programs: [{ ...world().programs[0]!, placements: { [placementKey('c510', 0, 2)]: 'l1' } }],
    };
    expect(studyBlocker(d, 'tMC', 0, 2)).toBe('Ali Bey Salı 3. saatte 510 sınıfında');
    expect(addStudy(d, 'tMC', 0, 2)).toBe(d);
    // Another teacher's hour in the same cell column is free.
    expect(studyBlocker(d, 'tAV', 0, 2)).toBeNull();
  });

  it('öğretmenin kapalı saatine ve haftanın dışına konamaz', () => {
    const d = closeHours(world(), 'tMC', [[0, 3]]);
    expect(studyBlocker(d, 'tMC', 0, 3)).toBe('Ali Bey, Salı 4. saatte kapalı');
    expect(studyBlocker(d, 'tMC', 5, 0)).not.toBeNull();
    expect(studyBlocker(d, 'tMC', 0, 4)).not.toBeNull();
    expect(studyBlocker(d, 'yok', 0, 0)).not.toBeNull();
  });
});

describe('B2/B3: sınıfı meşgul etmez, hiçbir sayıma girmez', () => {
  it('ekleyip kaldırmak durumu aynen geri getiriyor', () => {
    const d = world();
    const on = addStudy(d, 'tMC', 1, 1);
    expect(on).not.toBe(d);
    expect(addStudy(on, 'tMC', 1, 1)).toBe(on); // already one
    expect(removeStudy(on, 'tMC', 1, 1)).toEqual(d);
    expect(removeStudy(d, 'tMC', 1, 1)).toBe(d);
  });

  it('sınıf o saatte boş: aynı saatte sınıfa başka öğretmenin dersi konabiliyor', () => {
    const d = addStudy(world(), 'tMC', 0, 0);
    // 511 has no lesson at that hour, and AV may teach it there.
    expect(blocker(d, buildIndex(d), 'l3', 0, 0)).toBeNull();
    expect(buildIndex(d).teacherBusy.size).toBe(0);
    expect(buildIndex(d).roomBusy.size).toBe(0);
  });

  it('ders sayısına ve kurallara girmiyor', () => {
    const d = addStudy(addStudy(world(), 'tMC', 0, 0), 'tMC', 0, 2);
    expect(countPlacedHours(d, 'l1')).toBe(0);
    expect(buildIndex(d).placedHours.size).toBe(0);
    expect(findViolations(d, buildIndex(d))).toEqual([]);
  });
});
