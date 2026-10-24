// The grid's density and the interface's, two separate decisions.

import { DENSITY_KEY, UI_DENSITY_KEY, preference } from '../../leaf/preference';

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

export const densityPreference = preference<Density>({
  key: DENSITY_KEY,
  normalize: normalizeDensity,
  fallback: () => 'rahat',
  paint: (density, root) => root.setAttribute(DENSITY_ATTRIBUTE, density),
});

export const readDensity = densityPreference.read;
export const applyDensity = densityPreference.apply;

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

const UI_DENSITY_ATTRIBUTE = 'data-ui-density';

/** The same three words and the same fallback: two axes, one vocabulary. */
export function normalizeUiDensity(raw: unknown): Density {
  return normalizeDensity(raw);
}

export const uiDensityPreference = preference<Density>({
  key: UI_DENSITY_KEY,
  normalize: normalizeUiDensity,
  fallback: () => 'rahat',
  paint: (density, root) => root.setAttribute(UI_DENSITY_ATTRIBUTE, density),
});

export const readUiDensity = uiDensityPreference.read;
export const applyUiDensity = uiDensityPreference.apply;
