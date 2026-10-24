// The interface's scale.

import { SCALE_KEY, preference } from '../../leaf/preference';

// ---------------------------------------------------------- scale preference

/*
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
/* The floor was 1 and is 0.80, and the reason is a SECOND scale nobody here
   controls: Windows has its own display scaling and my father's is set large,
   so what he sees is the product of two numbers. Shrinking the root (13px)
   moves one of them; this moves the other, and it is the only knob he has on
   the machine he is actually on.

   Below 1 the type comes down with everything else, and that is not an
   oversight: the 12px screen floor is a promise about the DEFAULT screen, and
   a reader who reaches for %80 is answering it himself. Which is exactly why
   SCALE_DEFAULT stays at 1 (see below) — the floor may be crossed on purpose,
   never by arriving. */
export const SCALE_MIN = 0.8;
/* The ceiling was 1.25 and is 1.50. The reason is the reader, not the design:
   my father has trouble seeing, and a ceiling is only worth having if it is
   above what somebody actually reaches for. He works at 100% — the ceiling is
   headroom, not a description of where he sits. */
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
 * ON 2026-08-30 THEY CAME APART AGAIN, and this is the case the split was
 * written for: the floor went to 0.80 and the default did NOT follow. Nobody's
 * screen changes by itself; my father reaches for %80 on the machine whose
 * Windows scaling is already large, and every other machine opens where it
 * always did.
 */
export const SCALE_DEFAULT = 1;

/**
 * Anything out of range or off-step becomes the nearest legal value; anything
 * unreadable becomes the DEFAULT, not the floor.
 *
 * The two used to be one branch and that hid a bug in plain sight: "no
 * preference stored" and "somebody typed nonsense into localStorage" are
 * different answers, and collapsing them is only invisible while the default
 * happens to equal the floor.
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

export const scalePreference = preference<number>({
  key: SCALE_KEY,
  normalize: normalizeScale,
  fallback: () => SCALE_DEFAULT,
  paint: (scale, root) => root.style.setProperty('--ui-scale', String(scale)),
});

export const readScale = scalePreference.read;
export const applyScale = scalePreference.apply;
