// The theme is the only setting stored outside `State`. If a stored value is
// junk the page must still get a theme — an unthemed page shows unstyled
// colours, which for this tool means the drag feedback is unreadable.

import { describe, expect, it } from 'vitest';
import { normalizeTheme } from './theme';

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
