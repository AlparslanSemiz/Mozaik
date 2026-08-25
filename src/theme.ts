// Machine preferences: the theme and the width of the left rail. Deliberately
// NOT part of `State`:
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

// ------------------------------------------------------- sidebar preference

/**
 * Whether the left rail is collapsed to icons. Same reasoning as the theme: a
 * property of the machine and its screen, never of the timetable, so it stays
 * out of `State` and out of the backup file.
 */
export const SIDEBAR_KEY = 'ders-programi-kenar';

/** Anything that is not exactly 'dar' means the rail is open. */
export function normalizeSidebar(raw: unknown): boolean {
  return raw === 'dar';
}

export function readSidebar(): boolean {
  try {
    return normalizeSidebar(localStorage.getItem(SIDEBAR_KEY));
  } catch {
    return false;
  }
}

export function writeSidebar(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? 'dar' : 'genis');
  } catch {
    // A rail width that cannot be remembered is not worth an error
  }
}

// ---------------------------------------------------------- scale preference

/**
 * How big the interface is drawn: 1.0 to 1.25 in steps of 0.05. Same reasoning
 * as the theme and the rail — a property of the machine and the eyes in front
 * of it, never of the timetable, so it stays out of `State` and out of the
 * backup file. A backup taken on a 27" monitor must not resize my father's
 * screen, and a comfort setting must not cost a schema migration.
 *
 * It drives one declaration, `:root { font-size: calc(16px * var(--ui-scale)) }`,
 * and everything on screen is sized in rem from there — type, spacing, the
 * grid cell, the rail. PRINTING is deliberately outside it: the paper is a
 * fixed physical size, so `--fs-p-*` is in pt and `@media print` pins the
 * scale back to 1.
 */
export const SCALE_KEY = 'ders-programi-olcek';

export const SCALE_MIN = 1;
export const SCALE_MAX = 1.25;
export const SCALE_STEP = 0.05;

/**
 * Anything unreadable, out of range or off-step becomes the nearest legal
 * value. A hand-edited "3" would otherwise draw the shell at 48px and leave no
 * way back to the setting that caused it.
 */
export function normalizeScale(raw: unknown): number {
  const value = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : NaN;
  if (!Number.isFinite(value)) return SCALE_MIN;
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
  const steps = Math.round((clamped - SCALE_MIN) / SCALE_STEP);
  // Two decimals: 1.05 * 3 lands on 1.1500000000000001 in binary floating point
  // and would come back out of the round trip as a different string every time.
  return Number((SCALE_MIN + steps * SCALE_STEP).toFixed(2));
}

export function readScale(): number {
  try {
    return normalizeScale(localStorage.getItem(SCALE_KEY));
  } catch {
    return SCALE_MIN;
  }
}

export function applyScale(scale: number): void {
  document.documentElement.style.setProperty('--ui-scale', String(scale));
  try {
    localStorage.setItem(SCALE_KEY, String(scale));
  } catch {
    // A scale that cannot be remembered is still better than no scale
  }
}

// -------------------------------------------------------- density preference

/**
 * How much of the week the grid shows at once.
 *
 * 'rahat' is the grid as it has always been: a 34px cell, the bell time under
 * every lesson number, and horizontal scrolling — 2616px of table against
 * 1828px of box at 1920x1080.
 *
 * 'sigdir' is A5, semantic zoom, and it drops exactly ONE thing: the start
 * time under the hour number. That is not a guess, it is what the measurement
 * said. `--cell-w` was set to 28, 23 and 18px in turn and the cell was drawn
 * at 33.69px every time — the number in the CSS had stopped mattering, because
 * "10:40" in the heading was setting the column's min-content. Hiding the card's
 * second line changed nothing at all. Hiding the clock took the table from
 * 2461px to 1728px, i.e. the whole week fits in the box with room to spare
 * (pitfall 37).
 *
 * Same reasoning as the theme, the rail and the scale for where it lives: a
 * property of the machine and the screen, never of the timetable, so it stays
 * out of `State` and out of the backup file.
 */
export type Density = 'rahat' | 'sigdir';

export const DENSITY_KEY = 'ders-programi-yogunluk';

const DENSITY_ATTRIBUTE = 'data-density';

/** Anything that is not exactly 'sigdir' means the roomy grid. */
export function normalizeDensity(raw: unknown): Density {
  return raw === 'sigdir' ? 'sigdir' : 'rahat';
}

export function readDensity(): Density {
  try {
    return normalizeDensity(localStorage.getItem(DENSITY_KEY));
  } catch {
    return 'rahat';
  }
}

export function applyDensity(density: Density): void {
  document.documentElement.setAttribute(DENSITY_ATTRIBUTE, density);
  try {
    localStorage.setItem(DENSITY_KEY, density);
  } catch {
    // A density that cannot be remembered is still better than no density
  }
}
