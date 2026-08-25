// The theme is the only setting stored outside `State`. If a stored value is
// junk the page must still get a theme — an unthemed page shows unstyled
// colours, which for this tool means the drag feedback is unreadable.

import { describe, expect, it } from 'vitest';
import {
  normalizeDensity,
  normalizeScale,
  normalizeSidebar,
  normalizeTheme,
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
} from './theme';

describe('normalizeTheme', () => {
  it('kayıtlı geçerli tercih olduğu gibi kullanılır', () => {
    expect(normalizeTheme('dark', false)).toBe('dark');
    expect(normalizeTheme('light', true)).toBe('light');
  });

  it('kayıt yoksa sistem tercihine düşer', () => {
    expect(normalizeTheme(null, true)).toBe('dark');
    expect(normalizeTheme(null, false)).toBe('light');
  });

  it('bozuk değer sistem tercihine düşer, çökmez', () => {
    for (const junk of ['', 'DARK', 'koyu', '{}', 0, undefined, {}, []]) {
      expect(normalizeTheme(junk, true)).toBe('dark');
      expect(normalizeTheme(junk, false)).toBe('light');
    }
  });
});

// The rail width is stored like the theme: a property of the machine, never of
// the timetable. Anything unrecognised must leave the rail OPEN — a collapsed
// rail on a first run would hide the names of all six sections.
describe('normalizeSidebar', () => {
  it("yalnız 'dar' daraltıyor", () => {
    expect(normalizeSidebar('dar')).toBe(true);
    expect(normalizeSidebar('genis')).toBe(false);
  });

  it('bozuk veya eksik değer geniş bırakıyor', () => {
    for (const junk of [null, '', 'DAR', 'true', 1, undefined, {}, []]) {
      expect(normalizeSidebar(junk)).toBe(false);
    }
  });
});

describe('normalizeScale', () => {
  it('yasal değerleri aynen geçirir', () => {
    for (const value of [1, 1.05, 1.1, 1.15, 1.2, 1.25]) {
      expect(normalizeScale(String(value))).toBe(value);
    }
  });

  it('aralık dışını sınıra çeker', () => {
    expect(normalizeScale('0.2')).toBe(SCALE_MIN);
    expect(normalizeScale('3')).toBe(SCALE_MAX);
    expect(normalizeScale('-4')).toBe(SCALE_MIN);
  });

  it('basamak dışı bir değeri en yakın basamağa oturtur', () => {
    expect(normalizeScale('1.07')).toBe(1.05);
    expect(normalizeScale('1.13')).toBe(1.15);
  });

  it('okunamayan her şey 1 olur', () => {
    for (const junk of [null, undefined, '', 'büyük', {}, NaN, [], true]) {
      expect(normalizeScale(junk)).toBe(SCALE_MIN);
    }
  });

  // Binary floating point: 1 + 0.05 * 3 is 1.1500000000000001, and a value that
  // does not survive String() -> normalizeScale() would be written back to
  // localStorage differently on every reload.
  it('gidiş dönüşte kaymaz', () => {
    let value = SCALE_MIN;
    for (let i = 0; i < 6; i += 1) {
      expect(normalizeScale(String(value))).toBe(value);
      value = normalizeScale(String(value + SCALE_STEP));
    }
    expect(value).toBe(SCALE_MAX);
  });
});

describe('normalizeDensity', () => {
  it('yalnız "sigdir" sığdırma demektir', () => {
    expect(normalizeDensity('sigdir')).toBe('sigdir');
  });

  // The default has to be the grid my father already knows. A junk value that
  // fell through to "sigdir" would hide the bell times on his screen with no
  // visible cause and no obvious way back.
  it('okunamayan her şey rahat ızgaradır', () => {
    for (const junk of [null, undefined, '', 'rahat', 'Sığdır', 'SIGDIR', {}, 1, [], true]) {
      expect(normalizeDensity(junk)).toBe('rahat');
    }
  });
});
