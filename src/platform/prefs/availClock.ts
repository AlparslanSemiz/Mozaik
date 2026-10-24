// Whether Müsaitlik writes the start time under each lesson number.

import { AVAIL_CLOCK_KEY, preference } from '../../leaf/preference';
import { onOff } from './stored';

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
// Ayarlar → Zil ve günler's bell preview and on every printed sheet, in both states.
//
// A machine preference like all the others: its own key, never in `State`,
// never in a backup.

const AVAIL_CLOCK_ATTRIBUTE = 'data-avail-clock';

/**
 * Only the exact string 'acik' turns it on. Absent means OFF, as asked. A
 * boolean is the switch's own answer and is taken as it is.
 */
export function normalizeAvailClock(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw;
  return raw === 'acik';
}

export const availClockPreference = preference<boolean>({
  key: AVAIL_CLOCK_KEY,
  normalize: normalizeAvailClock,
  fallback: () => false,
  encode: onOff,
  paint: (on, root) => root.setAttribute(AVAIL_CLOCK_ATTRIBUTE, onOff(on)),
});

export const readAvailClock = availClockPreference.read;
export const applyAvailClock = availClockPreference.apply;
