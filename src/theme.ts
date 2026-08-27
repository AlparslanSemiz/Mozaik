// Machine preferences: the theme, the rail, the dock, the tool strip, the
// scale, the density, the availability clock, how much the interface is allowed
// to MOVE, and whether the first-run line has been seen. Ten independent
// scalars in ten keys. Deliberately NOT part of `State`:
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
 * Anything that is not exactly 'dark' is light — including nothing at all.
 *
 * This deliberately does NOT follow the system, and it is the one preference
 * here that does not. The tool's functional colours were chosen and MEASURED
 * on the light surface (green = droppable, yellow = warning, red = blocked),
 * so light is where the thing is known to work and dark is a choice somebody
 * makes on purpose. Compare `normalizeMotion` below, which does follow the
 * machine: a machine asking for less motion is stating a NEED, a machine set
 * to dark is stating a taste, and only the first one is ours to obey.
 */
export function normalizeTheme(raw: unknown): Theme {
  return raw === 'dark' ? 'dark' : 'light';
}

export function readTheme(): Theme {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch {
    // localStorage can be unavailable; light is still the right answer
  }
  return normalizeTheme(stored);
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

// ----------------------------------------------------------- dock preference

/**
 * Whether the pool of unplaced lessons is open beside the grid.
 *
 * The pool moved from a band across the bottom to a column down the right, and
 * the argument is the one that put the rail on the left: horizontally the grid
 * OVERFLOWS anyway (2616px of table against 1828px of box), so 240px there
 * costs nothing that was not already scrolled — while at the bottom it cost
 * 215px of a 1080px screen, which is six teachers out of twenty-five.
 *
 * It closes, because the argument stops holding in "Sığdır": that mode exists
 * to get the week inside the box, and a dock takes the room it needs. Closed,
 * the grid gets the full width back.
 *
 * Same reasoning as the theme, the rail, the scale and the density for where it
 * lives: a property of the screen, never of the timetable.
 */
export const DOCK_KEY = 'ders-programi-havuz';

/** Anything that is not exactly 'kapali' means the dock is open. */
export function normalizeDock(raw: unknown): boolean {
  return raw !== 'kapali';
}

export function readDock(): boolean {
  try {
    return normalizeDock(localStorage.getItem(DOCK_KEY));
  } catch {
    return true;
  }
}

export function writeDock(open: boolean): void {
  try {
    localStorage.setItem(DOCK_KEY, open ? 'acik' : 'kapali');
  } catch {
    // A dock that cannot be remembered is not worth an error
  }
}

// -------------------------------------------------------- ribbon preference

/**
 * Whether the tool strip is open.
 *
 * At 100% it buys nothing on Program — the week already fits — and that is
 * fine: its customer is the 125% and 150% reader, where 40px is one whole
 * teacher row. Applied before the first paint like the other five, or the
 * strip would draw itself and then vanish.
 */
export const RIBBON_KEY = 'ders-programi-serit';
const RIBBON_ATTRIBUTE = 'data-ribbon';

/** Anything that is not exactly 'kapali' means the strip is open. */
export function normalizeRibbon(raw: unknown): boolean {
  return raw !== 'kapali';
}

export function readRibbon(): boolean {
  try {
    return normalizeRibbon(localStorage.getItem(RIBBON_KEY));
  } catch {
    return true;
  }
}

export function applyRibbon(open: boolean): void {
  document.documentElement.setAttribute(RIBBON_ATTRIBUTE, open ? 'acik' : 'kapali');
  try {
    localStorage.setItem(RIBBON_KEY, open ? 'acik' : 'kapali');
  } catch {
    // A strip that cannot be remembered is not worth an error
  }
}

// ------------------------------------------------------ dock height preference

/**
 * How tall the pool drawer is, in REM.
 *
 * Rem and not px because `--ui-scale` goes to 1.50: a dock fixed at 176px is
 * a comfortable two rows of cards at 100% and a cramped one at 150%, while the
 * cards inside it grew. Every other geometry token in this file is rem for the
 * same reason.
 *
 * A SEPARATE key from `ders-programi-havuz`, not a widening of it. That key
 * means open/closed and its contract is "anything that is not 'kapali'";
 * folding a number into it would need a second normalizer inside one parser and
 * would break every reader of the current value. theme.ts is a set of
 * INDEPENDENT scalars in independent keys — nine of them now — and this is one.
 */
export const DOCK_H_KEY = 'ders-programi-havuz-boy';

/** Head plus one row of cards. Below this the drawer shows nothing. */
export const DOCK_H_MIN = 6;
/** A ceiling in rem; the REAL ceiling is the grid's, and CSS clamps it. */
export const DOCK_H_MAX = 22;
export const DOCK_H_DEFAULT = 11;
export const DOCK_H_STEP = 0.25;

export function normalizeDockHeight(raw: unknown): number {
  // A number arrives from the splitter, a string from localStorage, and null
  // from a machine that has never touched it. The empty cases have to be ruled
  // out BY HAND: `Number('')` and `Number(null)` are both 0, which is finite
  // and would clamp to the MINIMUM — a drawer squashed shut on first run.
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return DOCK_H_DEFAULT;
    return round(raw);
  }
  if (typeof raw !== 'string' || raw.trim() === '') return DOCK_H_DEFAULT;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return DOCK_H_DEFAULT;
  return round(n);
}

function round(n: number): number {
  const clamped = Math.min(DOCK_H_MAX, Math.max(DOCK_H_MIN, n));
  // Rounded to the step and fixed to two decimals for the same reason the scale
  // is: a float round-trip through localStorage must not drift.
  return Number((Math.round(clamped / DOCK_H_STEP) * DOCK_H_STEP).toFixed(2));
}

export function readDockHeight(): number {
  try {
    return normalizeDockHeight(localStorage.getItem(DOCK_H_KEY));
  } catch {
    return DOCK_H_DEFAULT;
  }
}

export function writeDockHeight(rem: number): void {
  try {
    localStorage.setItem(DOCK_H_KEY, String(normalizeDockHeight(rem)));
  } catch {
    // A drawer height that cannot be remembered is not worth an error
  }
}

// ---------------------------------------------------------- scale preference

/**
 * How big the interface is drawn: 1.0 to 1.50 in steps of 0.05. Same reasoning
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
/* The ceiling was 1.25 and is 1.50. The reason is the reader, not the design:
   my father has trouble seeing, and a ceiling is only worth having if it is
   above what somebody actually needs. */
export const SCALE_MAX = 1.5;
export const SCALE_STEP = 0.05;

/**
 * What NO preference means — which is a different question from what the
 * floor of the range is, and they were the same number for the wrong reason.
 *
 * It was 1.1 for a version, on the argument that the reader has trouble seeing
 * so the first screen should already be larger than a browser default. That
 * argument was answered by the reader himself on 2026-08-27: the screen was
 * too big, and what he wanted was a smaller 100% AND 100% as the default. So
 * the anchor moved instead — `:root` is 14px now, not 16 — and the default
 * came back to the floor.
 *
 * The two are still not the same question, and `normalizeScale` still tells
 * them apart (the note below): they merely agree again for the moment.
 */
export const SCALE_DEFAULT = 1;

/**
 * Anything out of range or off-step becomes the nearest legal value; anything
 * unreadable becomes the DEFAULT, not the floor.
 *
 * The two used to be one branch and that hid a bug in plain sight (the same
 * shape as pitfall 43): "no preference stored" and "somebody typed nonsense
 * into localStorage" are different answers, and collapsing them is only
 * invisible while the default happens to equal the floor.
 */
export function normalizeScale(raw: unknown): number {
  const value = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : NaN;
  // `Number('')` and `Number(null)` are 0, and 0 is a finite number that would
  // clamp politely to the floor — so "absent" is tested before "out of range".
  if (raw === null || raw === undefined || raw === '' || !Number.isFinite(value)) {
    return SCALE_DEFAULT;
  }
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
    return SCALE_DEFAULT;
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
export type Density = 'ferah' | 'rahat' | 'sigdir';

export const DENSITY_KEY = 'ders-programi-yogunluk';

const DENSITY_ATTRIBUTE = 'data-density';

/**
 * Three steps since 2026-08-26, and the third one is for the reader:
 *
 *   'ferah'   a taller, wider cell and both card lines at full size. Fewer
 *             days on screen at once, and that is the trade being offered.
 *   'rahat'   the grid as it has always been: 34px, bell times, horizontal
 *             scrolling.
 *   'sigdir'  A5, semantic zoom, the whole week in the box.
 *
 * Anything unreadable is still 'rahat': the default has to be the grid my
 * father already knows, and a junk value that fell through to 'sigdir' would
 * hide the bell times on his screen with no visible cause and no way back.
 */
export function normalizeDensity(raw: unknown): Density {
  return raw === 'sigdir' ? 'sigdir' : raw === 'ferah' ? 'ferah' : 'rahat';
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

// ----------------------------------------------------- interface density
//
// "Program ferahlığı rahatı sığdırı genel arayüz ferahlığı sığdırı rahatından
// farklı olsun." — the reader's own words, 2026-08-27.
//
// One attribute used to drive both: `data-density` sized the grid AND the
// padding of every list, panel and control under `.main`. That was itself a
// request ("babam tek seferde tüm listeleri görmek istiyor") and it worked,
// but it welded two decisions together. They are not the same decision: the
// grid's step trades DAYS ON SCREEN against cell size and hides the bell
// times at the tight end, while the interface's step trades ROWS IN A LIST
// against how far apart the controls sit. Wanting the whole week in the box
// says nothing about wanting a cramped Ayarlar.
//
// Same shape as the grid axis in every other way: three steps, 'rahat' when
// unreadable, out of `State`, out of the backup, and counted in Ayarlar >
// Veri (library.ts) — a preference that is written and not listed there is a
// preference nobody can find (the note above `storageReport`).

export const UI_DENSITY_KEY = 'ders-programi-arayuz-yogunluk';

const UI_DENSITY_ATTRIBUTE = 'data-ui-density';

/** The same three words and the same fallback: two axes, one vocabulary. */
export function normalizeUiDensity(raw: unknown): Density {
  return normalizeDensity(raw);
}

export function readUiDensity(): Density {
  try {
    return normalizeUiDensity(localStorage.getItem(UI_DENSITY_KEY));
  } catch {
    return 'rahat';
  }
}

export function applyUiDensity(density: Density): void {
  document.documentElement.setAttribute(UI_DENSITY_ATTRIBUTE, density);
  try {
    localStorage.setItem(UI_DENSITY_KEY, density);
  } catch {
    // Same as above: an unremembered density still beats no density
  }
}

// --------------------------------------------- availability clock preference
//
// "Ayarlarda müsaitlikteki programda derslerin altında saatleri olsun olmasın
// diye ayar olsun ve default olarak kapalı olsun." — the reader's own words,
// and the default they asked for.
//
// Why it is worth an option at all — and the first answer I wrote was WRONG,
// so it is worth writing down which one is true. I claimed the clock sets the
// column's floor the way it does on the Program grid (pitfall 37). Measured on
// the real screen: it does not. `table.availability` is `table-layout: fixed`
// at `width: 100%`, so the columns are equal whatever is in them, and the
// heading's 2.125rem already holds two lines of --fs-xs — the table came out
// 1341.7px wide and 354.2px tall with the clock and WITHOUT it, to the pixel.
//
// So the reason is the one the reader actually gave: they do not want to look
// at it. Twelve times across a heading is twelve numbers nobody is reading on
// a screen whose whole job is a grid of open and closed. The times are in
// Ayarlar → Okul's bell preview and on every printed sheet, in both states.
//
// A machine preference like all the others: its own key, never in `State`,
// never in a backup.

export const AVAIL_CLOCK_KEY = 'ders-programi-musaitlik-saat';

const AVAIL_CLOCK_ATTRIBUTE = 'data-avail-clock';

/** Only the exact string 'acik' turns it on. Absent means OFF, as asked. */
export function normalizeAvailClock(raw: unknown): boolean {
  return raw === 'acik';
}

export function readAvailClock(): boolean {
  try {
    return normalizeAvailClock(localStorage.getItem(AVAIL_CLOCK_KEY));
  } catch {
    return false;
  }
}

export function applyAvailClock(on: boolean): void {
  document.documentElement.setAttribute(AVAIL_CLOCK_ATTRIBUTE, on ? 'acik' : 'kapali');
  try {
    localStorage.setItem(AVAIL_CLOCK_KEY, on ? 'acik' : 'kapali');
  } catch {
    // A preference that cannot be remembered is still better than no preference
  }
}

// --------------------------------------------------------- motion preference
//
// "Animasyonları kapatma ya da azaltma seçeneği olsun ayarlarda."
//
// Until now the only switch was the MACHINE's: `prefers-reduced-motion: reduce`
// zeroes the three duration tokens from one @media block. That covers a reader
// who has set the preference system-wide and nobody else — and turning it on in
// Windows changes far more than this program.
//
// Three steps, not two, because "kapat ya da azalt" is two different asks:
//   'tam'     the app as designed
//   'az'      durations roughly halved, and every motion that MOVES something
//             switched off — a panel fades in where it will sit rather than
//             sliding there. Colour transitions stay, so a button still answers
//             the pointer.
//   'kapali'  nothing moves and nothing fades.
//
// THE SYSTEM PREFERENCE IS A FLOOR, NOT A DEFAULT. `@media (prefers-reduced-
// motion: reduce)` is written AFTER the [data-motion] rules in styles.css, so a
// machine asking for less motion gets none whatever this setting says. Letting
// 'tam' override it would break the one motion contract in CLAUDE.md. What the
// setting can do is go further than the machine asked.
//
// It follows the system on FIRST read, exactly like the theme: a button reading
// "Tam" on a machine where nothing moves would be a lie.
//
// A machine preference like all the others: its own key, never in `State`.

export type Motion = 'tam' | 'az' | 'kapali';

export const MOTION_KEY = 'ders-programi-hareket';

const MOTION_ATTRIBUTE = 'data-motion';

export function systemPrefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Anything that is not one of the three falls back to the system preference.
 *
 * This is where motion and the THEME part company, and on purpose: a machine
 * asking for less motion is stating a need, so it is obeyed on the first read
 * and it stays a floor the setting cannot go under (pitfall 58). A machine set
 * to a dark colour scheme is stating a taste, so `normalizeTheme` above ignores
 * it and opens light.
 */
export function normalizeMotion(raw: unknown, prefersReduced: boolean): Motion {
  if (raw === 'tam' || raw === 'az' || raw === 'kapali') return raw;
  return prefersReduced ? 'kapali' : 'tam';
}

export function readMotion(): Motion {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(MOTION_KEY);
  } catch {
    // localStorage can be unavailable; the system preference still works
  }
  return normalizeMotion(stored, systemPrefersReducedMotion());
}

export function applyMotion(motion: Motion): void {
  document.documentElement.setAttribute(MOTION_ATTRIBUTE, motion);
  try {
    localStorage.setItem(MOTION_KEY, motion);
  } catch {
    // A preference that cannot be remembered is still better than no preference
  }
}

// -------------------------------------------------- the first-run line
//
// Whether the reader has already been offered the sample school on the Kurulum
// screen. A machine fact, not a project fact: it belongs to this browser on this
// computer, exactly like the theme, and putting it in `State` would mean a
// backup carries somebody else's "I have seen this" — and would cost a schema
// migration for a hint.
//
// It is written when the reader ACTS (loads the sample, dismisses the line, or
// types in a first teacher or class), never on the first paint. Marking it as
// soon as the screen is drawn would make the line unreachable to anyone who
// reloaded before reading it, and it would also break every test that sets a
// preference and reloads before touching anything.

export const INTRO_KEY = 'ders-programi-tanitim';

export function readIntroSeen(): boolean {
  try {
    return localStorage.getItem(INTRO_KEY) === 'gorundu';
  } catch {
    // A hint that cannot be remembered is shown again; the harm is one line.
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_KEY, 'gorundu');
  } catch {
    // Nothing to do: the line simply comes back next time.
  }
}
