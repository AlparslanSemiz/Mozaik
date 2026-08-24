import { describe, expect, it } from 'vitest';
import {
  clockParts,
  dayEnd,
  dayPeriods,
  formatClock,
  minuteOptions,
  parseClock,
  sharedPeriods,
} from './bell';
import { DEFAULT_BELL } from './entities';
import { hourNames } from './entities';

const LABELS = hourNames(12);

describe('parseClock / formatClock', () => {
  it('reads and writes a clock', () => {
    expect(parseClock('09:00')).toBe(540);
    expect(parseClock('9:5')).toBe(545);
    expect(parseClock('19.10')).toBe(1150);
    expect(formatClock(1150)).toBe('19:10');
  });

  it('never returns NaN for garbage', () => {
    expect(parseClock('abc')).toBe(0);
    expect(parseClock('')).toBe(0);
  });

  it('does not wrap past midnight, so a broken setup looks broken', () => {
    expect(formatClock(1510)).toBe('25:10');
  });
});

// The exact draft the tool was specified with: 40 min lesson, 10 min break,
// starting 09:00, 12 periods, ending 19:10.
describe('dayPeriods — the default school day', () => {
  it('weekday: long break after the 5th lesson', () => {
    const p = dayPeriods(DEFAULT_BELL, LABELS, 5);
    expect(p).toHaveLength(12);
    expect(p[0]).toEqual({ label: '1', start: '09:00', end: '09:40' });
    expect(p[4]).toEqual({ label: '5', start: '12:20', end: '13:00' });
    // 30 minutes instead of 10 -> the 6th lesson starts at 13:30, not 13:10
    expect(p[5]).toEqual({ label: '6', start: '13:30', end: '14:10' });
    expect(p[11]).toEqual({ label: '12', start: '18:30', end: '19:10' });
  });

  it('weekend: long break after the 6th lesson', () => {
    const p = dayPeriods(DEFAULT_BELL, LABELS, 6);
    expect(p[5]).toEqual({ label: '6', start: '13:10', end: '13:50' });
    expect(p[6]).toEqual({ label: '7', start: '14:20', end: '15:00' });
    expect(p[11]).toEqual({ label: '12', start: '18:30', end: '19:10' });
  });

  it('both patterns end at the same time — there is exactly one long break', () => {
    expect(dayEnd(DEFAULT_BELL, LABELS, 5)).toBe('19:10');
    expect(dayEnd(DEFAULT_BELL, LABELS, 6)).toBe('19:10');
  });

  it('without a long break the day ends 20 minutes earlier', () => {
    const p = dayPeriods(DEFAULT_BELL, LABELS, 0);
    expect(p[11]).toEqual({ label: '12', start: '18:10', end: '18:50' });
  });

  it('carries minutes over the hour correctly', () => {
    const p = dayPeriods({ start: '08:35', lessonMinutes: 45, breakMinutes: 15, longBreakMinutes: 45 }, hourNames(3), 0);
    expect(p.map((x) => `${x.start}-${x.end}`)).toEqual([
      '08:35-09:20',
      '09:35-10:20',
      '10:35-11:20',
    ]);
  });

  it('uses the labels it is given', () => {
    const p = dayPeriods(DEFAULT_BELL, ['A', 'B'], 0);
    expect(p.map((x) => x.label)).toEqual(['A', 'B']);
  });
});

// A column header carries ONE time, but the 6th lesson starts at 13:30 on a
// weekday and 13:10 at the weekend. Printing one next to both would be a lie.
describe('sharedPeriods', () => {
  const labels = LABELS;

  it('tek desende bütün saatler ortak', () => {
    const days = ['Salı', 'Çarşamba'].map((n) => ({ name: n, longBreakAfter: 5 }));
    const shared = sharedPeriods(DEFAULT_BELL, labels, days);
    expect(shared.every((x) => x !== null)).toBe(true);
    expect(shared[0]!.start).toBe('09:00');
    expect(shared[5]!.start).toBe('13:30');
  });

  it('hafta içi + hafta sonu karışınca YALNIZCA 6. ders ayrışır', () => {
    const days = [
      { name: 'Salı', longBreakAfter: 5 },
      { name: 'Cumartesi', longBreakAfter: 6 },
    ];
    const shared = sharedPeriods(DEFAULT_BELL, labels, days);
    const missing = shared.flatMap((x, i) => (x === null ? [i + 1] : []));
    // 1-5 identical, 7-12 line up again — which is why both end at 19:10
    expect(missing).toEqual([6]);
    expect(shared[4]!.start).toBe('12:20');
    expect(shared[6]!.start).toBe('14:20');
    expect(shared[11]!.end).toBe('19:10');
  });

  it('gün yoksa hiçbir saat ortak değildir', () => {
    expect(sharedPeriods(DEFAULT_BELL, labels, [])).toEqual(labels.map(() => null));
  });
});

describe('clockParts / minuteOptions', () => {
  it('saati ve dakikayı ayırıyor', () => {
    expect(clockParts('09:00')).toEqual({ hour: 9, minute: 0 });
    expect(clockParts('19:35')).toEqual({ hour: 19, minute: 35 });
    expect(clockParts('9.05')).toEqual({ hour: 9, minute: 5 });
  });

  it('okunamayan değer gece yarısına düşüyor, NaN üretmiyor', () => {
    expect(clockParts('')).toEqual({ hour: 0, minute: 0 });
    expect(clockParts('abc')).toEqual({ hour: 0, minute: 0 });
  });

  it('dakika listesi yalnızca beşin katları', () => {
    const list = minuteOptions(0);
    expect(list).toHaveLength(12);
    expect(list[0]).toBe(0);
    expect(list[list.length - 1]).toBe(55);
    expect(list.every((m) => m % 5 === 0)).toBe(true);
  });

  it('eski dosyadaki 09:03 sessizce kaydırılmıyor, listeye ekleniyor', () => {
    const list = minuteOptions(3);
    expect(list).toContain(3);
    expect(list).toHaveLength(13);
    // still sorted, so the dropdown reads like a clock
    expect([...list].sort((a, b) => a - b)).toEqual(list);
  });
});
