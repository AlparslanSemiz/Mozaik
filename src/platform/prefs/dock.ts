// The tray's drawer: open or closed, and its height.

import { DOCK_H_KEY, DOCK_KEY, preference } from '../../leaf/preference';
import { onOff } from './stored';

// ----------------------------------------------------------- dock preference

/*
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
/**
 * Anything that is not exactly 'kapali' means the dock is open. A boolean is
 * the toggle's own answer and is taken as it is.
 */
export function normalizeDock(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw;
  return raw !== 'kapali';
}

export const dockPreference = preference<boolean>({
  key: DOCK_KEY,
  normalize: normalizeDock,
  fallback: () => true,
  encode: onOff,
});

export const readDock = dockPreference.read;
export const writeDock = dockPreference.write;
// ------------------------------------------------------ dock height preference

/*
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
 * would break every reader of the current value. platform/prefs is a set of
 * INDEPENDENT scalars in independent keys, and this is one.
 */
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

export const dockHeightPreference = preference<number>({
  key: DOCK_H_KEY,
  normalize: normalizeDockHeight,
  fallback: () => DOCK_H_DEFAULT,
});

export const readDockHeight = dockHeightPreference.read;
export const writeDockHeight = dockHeightPreference.write;
