// How much the interface is allowed to move.

import { MOTION_KEY, preference } from '../../leaf/preference';

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
// 'tam' override it would break the one motion rule in docs/DESIGN.md. What the
// setting can do is go further than the machine asked.
//
// It follows the system on FIRST read, exactly like the theme: a button reading
// "Tam" on a machine where nothing moves would be a lie.
//
// A machine preference like all the others: its own key, never in `State`.

export type Motion = 'tam' | 'az' | 'kapali';

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

export const motionPreference = preference<Motion>({
  key: MOTION_KEY,
  normalize: (raw) => normalizeMotion(raw, systemPrefersReducedMotion()),
  // No record, or no storage at all: the machine answers, and it is asked on
  // every read rather than once, because what it states is a need.
  fallback: () => normalizeMotion(null, systemPrefersReducedMotion()),
  paint: (motion, root) => root.setAttribute(MOTION_ATTRIBUTE, motion),
});

export const readMotion = motionPreference.read;
export const applyMotion = motionPreference.apply;
