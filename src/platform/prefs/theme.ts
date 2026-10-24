// The theme, light or dark. A property of the machine, not of the timetable:
// putting it in the saved project would mean a backup taken on a dark machine
// flips the theme on my father's, and it would force a schema migration for a
// cosmetic setting.
//
// The reason a dark theme exists at all is not taste: Brave and Chrome darken a
// light page by themselves, with their own algorithm, and that muddies
// green = droppable / yellow = warning / red = blocked. Taking control is less
// mess than leaving it to the browser.

import { THEME_KEY, preference } from '../../leaf/preference';

export type Theme = 'light' | 'dark';

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

export const themePreference = preference<Theme>({
  key: THEME_KEY,
  normalize: normalizeTheme,
  fallback: () => 'light',
  paint: (theme, root) => root.setAttribute(ATTRIBUTE, theme),
});

export const readTheme = themePreference.read;
export const applyTheme = themePreference.apply;
