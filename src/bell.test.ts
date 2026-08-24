import { describe, expect, it } from 'vitest';
import { dayEnd, dayPeriods, formatClock, parseClock } from './bell';
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
