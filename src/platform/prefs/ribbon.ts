// The tool strip: shown or folded, and whether it slides away while you read.

import { RIBBON_AUTO_KEY, RIBBON_KEY, preference } from '../../leaf/preference';
import { onOff } from './stored';

// -------------------------------------------------------- ribbon preference

/**
 * Whether the tool strip is open.
 *
 * The reader works at 100%, where the week already fits on Program, so the row
 * the strip costs is not what makes it foldable. What makes it foldable is that
 * it takes that row BY ITSELF: a thing that appears without being asked for has
 * to be dismissable, which is the same argument the auto-hide gesture below is
 * written around. It earns its keep in the two boxes that are genuinely short
 * of height — "Sığdır", whose whole job is getting the week inside the box, and
 * a window smaller than the one every measurement here was taken in.
 *
 * Applied before the first paint like the other layout preferences, or the
 * strip would draw itself and then vanish.
 */
const RIBBON_ATTRIBUTE = 'data-ribbon';

/** Anything that is not exactly 'kapali' means the strip is open. A boolean is taken as it is. */
export function normalizeRibbon(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw;
  return raw !== 'kapali';
}

export const ribbonPreference = preference<boolean>({
  key: RIBBON_KEY,
  normalize: normalizeRibbon,
  fallback: () => true,
  encode: onOff,
  paint: (open, root) => root.setAttribute(RIBBON_ATTRIBUTE, onOff(open)),
});

export const readRibbon = ribbonPreference.read;
export const applyRibbon = ribbonPreference.apply;

// ------------------------------------------- ribbon auto-hide preference

/*
 * Whether the tool strip GETS OUT OF THE WAY while you read down the page.
 *
 * A separate key from `ders-programi-serit`, and the split is the same one
 * `ribbonScroll.ts` is written around: that one is a PREFERENCE — "I do not
 * want the strip" — and this one is a GESTURE, "hide it while I am reading and
 * bring it back when I look up". Folding them together would mean a reader who
 * dislikes the movement could only stop it by giving up the strip.
 *
 * Asked for on 2026-08-28: "ikinci barın açılıp kapanması ayarlarda bir ayar
 * olsun." The thing that happens by itself is the thing that has to be able to
 * be turned off.
 *
 * Default ON, because that is what the program did before this key existed and
 * a preference nobody has set must not change what they already have.
 */
/**
 * Only the exact string 'kapali' turns it off.
 *
 * A boolean is accepted too, because this normalizer is called from two
 * directions — the store on read, and the settings button on write — and a
 * guard that only knows the string type silently rejects the other one.
 * "Absent" is not "off": `null` falls to the default here rather than through
 * `Number('')`'s door.
 */
export function normalizeRibbonAuto(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw;
  return raw !== 'kapali';
}

export const ribbonAutoPreference = preference<boolean>({
  key: RIBBON_AUTO_KEY,
  normalize: normalizeRibbonAuto,
  fallback: () => true,
  encode: onOff,
});

export const readRibbonAuto = ribbonAutoPreference.read;
// Stored, not painted: the attribute this gesture drives sits on `.app` and
// belongs to ribbonScroll.ts.
export const applyRibbonAuto = ribbonAutoPreference.write;
