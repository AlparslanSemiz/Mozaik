import { describe, expect, it } from 'vitest';
import type { State, Teacher } from '../../leaf/model';
import { sanitize } from '../constraints';
import { emptyState, makeDay } from '../entities';
import {
  addAway,
  addDays,
  clearWeek,
  coverCount,
  coverRows,
  dayName,
  dayOf,
  isAway,
  moveAway,
  setAwayEnd,
  setCover,
  weekChanges,
  weekLabel,
  weekOf,
} from './dated';

// 2026-11-17 is a Tuesday; the school below teaches Tuesday and Wednesday.
const SALI = '2026-11-17';

function teacher(id: string, subject: string, subject2 = ''): Teacher {
  return {
    id,
    name: `Hoca ${id}`,
    short: id,
    subject,
    subject2,
    gender: '',
    color: 0,
    limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
    email: '',
    phone: '',
  };
}

/**
 * AY (Matematik) teaches 510 at the first two hours on Tuesday, BK
 * (Matematik) teaches 511 at the first hour, CD (Fizik, second subject
 * Matematik) and EF (Tarih) teach nothing on Tuesday, GH (Matematik) is closed
 * at the first hour.
 */
function school(): State {
  const d = emptyState();
  d.settings.days = ['Salı', 'Çarşamba'].map(makeDay);
  d.settings.hours = ['1', '2', '3'];
  d.teachers = [
    teacher('AY', 'Matematik'),
    teacher('BK', 'Matematik'),
    teacher('CD', 'Fizik', 'Matematik'),
    teacher('EF', 'Tarih'),
    teacher('GH', 'Matematik'),
  ];
  d.classes = [
    { id: 'c510', name: '510', roomId: null, color: 1, maxSameLessonPerDay: null },
    { id: 'c511', name: '511', roomId: null, color: 2, maxSameLessonPerDay: null },
  ];
  const lesson = (id: string, classId: string, teacherId: string) => ({
    id,
    classId,
    teacherId,
    weeklyHours: 2,
    blocks: [],
    second: false,
    maxPerDay: null,
  });
  d.lessons = [lesson('l1', 'c510', 'AY'), lesson('l2', 'c511', 'BK'), lesson('l3', 'c511', 'EF')];
  d.programs[0]!.placements = {
    'c510|0|0': 'l1',
    'c510|0|1': 'l1',
    'c511|0|0': 'l2',
    'c511|1|2': 'l3',
  };
  d.unavailable = { 'GH|0|0': 1 };
  return d;
}

describe('tarihler', () => {
  it('haftanın günü kayıtlı gün adından okunuyor', () => {
    const d = school();
    expect(dayOf(d, SALI)).toBe(0);
    expect(dayOf(d, '2026-11-18')).toBe(1);
    // Monday is not taught here.
    expect(dayOf(d, '2026-11-16')).toBe(-1);
    expect(dayName(SALI)).toBe('Salı 17 Kasım');
  });

  it('hafta pazartesiden pazara, ay ve yıl sınırını aşıyor', () => {
    expect(weekOf(SALI)).toEqual(['2026-11-16', '2026-11-22']);
    expect(weekOf('2026-12-31')).toEqual(['2026-12-28', '2027-01-03']);
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('haftanın adı okulun ilk ve son günü', () => {
    const d = school();
    expect(weekLabel(d, SALI)).toBe('17–18 Kasım');
    d.settings.days = [makeDay('Salı')];
    expect(weekLabel(d, SALI)).toBe('17 Kasım');
    d.settings.days = ['Pazar', 'Pazartesi'].map(makeDay);
    expect(weekLabel(d, '2026-11-30')).toBe('30 Kasım–6 Aralık');
  });
});

describe('gelmeyenler', () => {
  it('bir kez eklenir, son günü uzatılır, geri alınır', () => {
    let d = addAway(school(), 'AY', SALI);
    expect(addAway(d, 'AY', SALI)).toBe(d);
    d = setAwayEnd(d, 0, '2026-11-19');
    expect(isAway(d, 'AY', '2026-11-19')).toBe(true);
    expect(isAway(d, 'AY', '2026-11-20')).toBe(false);
    // A last day before the first is the first.
    expect(setAwayEnd(d, 0, '2026-11-01').dated.absent[0]!.to).toBe(SALI);
    expect(setAwayEnd(d, 0, null).dated.absent).toEqual([]);
  });

  it('kişi sayfasından açılan tek günlük yokluk tarihle birlikte taşınıyor', () => {
    const d = moveAway(addAway(school(), 'AY', SALI), 'AY', SALI, '2026-11-18');
    expect(d.dated.absent).toEqual([{ id: 'AY', from: '2026-11-18', to: '2026-11-18' }]);
  });

  it('haftanın değişiklikleri sayılıyor ve silinince dışarı taşan günler kalıyor', () => {
    let d = addAway(school(), 'AY', '2026-11-12');
    d = setAwayEnd(d, 0, '2026-11-24');
    d = addAway(d, 'BK', SALI);
    d = setCover(d, SALI, 'c510', 0, 'CD');
    d = setCover(d, '2026-11-24', 'c510', 0, 'CD');
    expect(weekChanges(d, SALI)).toBe(2);
    const out = clearWeek(d, SALI);
    expect(out.dated.absent).toEqual([
      { id: 'AY', from: '2026-11-12', to: '2026-11-15' },
      { id: 'AY', from: '2026-11-23', to: '2026-11-24' },
    ]);
    expect(out.dated.covers.map((c) => c.date)).toEqual(['2026-11-24']);
    expect(weekChanges(out, SALI)).toBe(0);
  });
});

describe('ikame önerisi', () => {
  it('gelmeyenin o günkü saatleri, boş olan hocalar önce aynı branş', () => {
    const rows = coverRows(addAway(school(), 'AY', SALI), SALI);
    expect(rows.map((r) => [r.hour, r.classId, r.teacherId, r.cover])).toEqual([
      [0, 'c510', 'AY', undefined],
      [1, 'c510', 'AY', undefined],
    ]);
    // Hour 1: BK teaches 511, GH is closed. CD has Matematik as a second
    // subject; EF is Tarih.
    expect(rows[0]!.options.map((o) => [o.id, o.subject])).toEqual([
      ['CD', 'Matematik'],
      ['EF', 'Tarih'],
    ]);
    // Hour 2: BK is free and at school that day, so before GH and CD, who
    // are not; EF last, another subject.
    expect(rows[1]!.options.map((o) => o.id)).toEqual(['BK', 'CD', 'GH', 'EF']);
  });

  it('bu hafta az ikame girmiş olan önce geliyor', () => {
    let d = addAway(school(), 'AY', SALI);
    d = setCover(d, '2026-11-18', 'c511', 2, 'BK');
    d = setCover(d, '2026-11-19', 'c511', 2, 'BK');
    const second = coverRows(d, SALI)[1]!;
    expect(second.options.map((o) => [o.id, o.week])).toEqual([
      ['CD', 0],
      ['GH', 0],
      ['BK', 2],
      ['EF', 0],
    ]);
    expect(coverCount(d, 'BK', SALI)).toEqual([2, 2]);
    expect(coverCount(d, 'BK', '2026-11-30')).toEqual([2, 0]);
  });

  it('bir saate seçilen hoca aynı saatte başka sınıfa önerilmiyor, kendi satırında kalıyor', () => {
    let d = addAway(addAway(school(), 'AY', SALI), 'BK', SALI);
    d = setCover(d, SALI, 'c510', 0, 'CD');
    const rows = coverRows(d, SALI);
    const first510 = rows.find((r) => r.classId === 'c510' && r.hour === 0)!;
    const first511 = rows.find((r) => r.classId === 'c511' && r.hour === 0)!;
    expect(first510.cover).toBe('CD');
    // Its own choice is not counted as "already this week".
    expect(first510.options.find((o) => o.id === 'CD')!.week).toBe(0);
    expect(first511.options.map((o) => o.id)).not.toContain('CD');
    // Choosing again replaces; undefined takes it back; null is "boş geçsin".
    expect(setCover(d, SALI, 'c510', 0, null).dated.covers).toEqual([
      { date: SALI, classId: 'c510', hour: 0, teacherId: null },
    ]);
    expect(setCover(d, SALI, 'c510', 0, undefined).dated.covers).toEqual([]);
  });

  it('yokluk silinince, kısalınca ya da taşınınca o günlerin ikamesi de gidiyor', () => {
    let d = addAway(school(), 'AY', SALI);
    d = setAwayEnd(d, 0, '2026-11-18');
    d = setCover(d, SALI, 'c510', 0, 'CD');
    d = setCover(d, SALI, 'c511', 0, 'EF'); // BK's hour: not AY's, stays
    expect(setAwayEnd(d, 0, null).dated.covers.map((c) => c.teacherId)).toEqual(['EF']);
    expect(setAwayEnd(d, 0, SALI).dated.covers).toHaveLength(2);
    const one = setCover(addAway(school(), 'AY', SALI), SALI, 'c510', 0, 'CD');
    expect(moveAway(one, 'AY', SALI, '2026-11-18').dated.covers).toEqual([]);
  });

  it('seçilen hoca sonradan dolsa da seçicide kalıyor', () => {
    let d = setCover(addAway(school(), 'AY', SALI), SALI, 'c510', 0, 'CD');
    d = { ...d, unavailable: { ...d.unavailable, 'CD|0|0': 1 } };
    const first = coverRows(d, SALI)[0]!;
    expect(first.cover).toBe('CD');
    expect(first.options.map((o) => o.id)).toEqual(['EF', 'CD']);
  });

  it('gezideki sınıfın saatleri ikame istemiyor ve öğretmeni boş sayılıyor', () => {
    let d = addAway(school(), 'BK', SALI);
    expect(coverRows(d, SALI)).toHaveLength(1);
    d = addAway(d, 'c511', SALI);
    expect(coverRows(d, SALI)).toEqual([]);
    const rows = coverRows(addAway(school(), 'AY', SALI), SALI);
    const withTrip = coverRows(addAway(addAway(school(), 'AY', SALI), 'c511', SALI), SALI);
    expect(rows[0]!.options.map((o) => o.id)).not.toContain('BK');
    expect(withTrip[0]!.options.map((o) => o.id)).toContain('BK');
  });

  it('derssiz bir günde ve tabanda hiçbir şey değişmiyor', () => {
    const d = addAway(school(), 'AY', '2026-11-16');
    expect(coverRows(d, '2026-11-16')).toEqual([]);
    expect(d.programs[0]!.placements).toEqual(school().programs[0]!.placements);
  });

  it('silinen kişinin yokluğu ve ikamesi sanitize ile düşüyor', () => {
    let d = addAway(addAway(school(), 'AY', SALI), 'c511', SALI);
    d = setCover(d, SALI, 'c510', 0, 'CD');
    d = setCover(d, SALI, 'c510', 1, 'EF');
    d = {
      ...d,
      teachers: d.teachers.filter((t) => t.id !== 'EF' && t.id !== 'AY'),
      classes: d.classes.filter((c) => c.id !== 'c511'),
    };
    const out = sanitize(d);
    expect(out.dated.absent).toEqual([]);
    expect(out.dated.covers.map((c) => c.teacherId)).toEqual(['CD']);
    expect(sanitize(out)).toBe(out);
  });
});
