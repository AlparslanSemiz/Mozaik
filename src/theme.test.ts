// The theme is the only setting stored outside `State`. If a stored value is
// junk the page must still get a theme — an unthemed page shows unstyled
// colours, which for this tool means the drag feedback is unreadable.

import { describe, expect, it } from 'vitest';
import { normalizeSidebar, normalizeTheme } from './theme';

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
