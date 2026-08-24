// Light/dark preference. Deliberately NOT part of `State`:
//
// The theme is a property of the machine, not of the timetable. Putting it in
// the saved project would mean a backup taken on a dark machine flips the theme
// on my father's, and it would force a schema migration for a cosmetic setting.
//
// The reason a dark theme exists at all is not taste: Brave and Chrome darken a
// light page by themselves, with their own algorithm, and that muddies
// green = droppable / yellow = warning / red = blocked. Taking control is less
// mess than leaving it to the browser.

export type Theme = 'light' | 'dark';

/** Turkish on purpose: like `ders-programi`, this key is user data, not code. */
export const THEME_KEY = 'ders-programi-tema';

const ATTRIBUTE = 'data-theme';

/**
 * Anything that is not exactly 'light' or 'dark' falls back to the system
 * preference. A half-written or hand-edited value must never leave the page
 * without a theme.
 */
export function normalizeTheme(raw: unknown, prefersDark: boolean): Theme {
  if (raw === 'light' || raw === 'dark') return raw;
  return prefersDark ? 'dark' : 'light';
}

export function systemPrefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function readTheme(): Theme {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch {
    // localStorage can be unavailable; the system preference still works
  }
  return normalizeTheme(stored, systemPrefersDark());
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute(ATTRIBUTE, theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // A theme that cannot be remembered is still better than no theme
  }
}
