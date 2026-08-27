/**
 * How one lesson's week is SPLIT — and nothing else.
 *
 * A lesson's weekly hours go down as some 2-hour blocks and some 1-hour blocks,
 * and `Lesson.pairs` says how many of the first kind. This module turns that
 * one number into the shapes the rest of the program needs: a list to place, a
 * sentence to read, and the choices to offer.
 *
 * It imports NOTHING but the type, on purpose — the same reason `palette.ts`
 * and `keys.ts` stand alone. `entities.ts` already imports `constraints.ts`, so
 * anything both of them need has to live below both of them or the two start
 * importing each other.
 *
 * Only 1 and 2. Three-hour blocks were dropped with schema v7, and the reason
 * is the reader's: a school week is planned in single and double periods, and
 * every extra part multiplies the choices on a dropdown somebody has to read
 * (12 hours would go from 7 options to 19).
 */
import type { Lesson } from './types';

/** The blocks a lesson asks for, biggest first: `pairs` twos, then the singles. */
export function blockPlan(lesson: Pick<Lesson, 'weeklyHours' | 'pairs'>): number[] {
  const hours = Math.max(0, Math.round(lesson.weeklyHours));
  const pairs = clampPairs(hours, lesson.pairs);
  return [...Array<number>(pairs).fill(2), ...Array<number>(hours - pairs * 2).fill(1)];
}

/** Past this many terms the sum is folded — see `patternLabel`. */
const FOLD_AT = 4;

/**
 * "2+2+1" — how a split is written wherever one is shown.
 *
 * Long ones are FOLDED: "adamın 10 saat dersi varsa 1+1+1+1+1… diye gözükmesi
 * biraz kötü". Ten singles spelled out is nineteen characters that say one
 * thing, and it is the same nineteen characters for eleven and for twelve — the
 * shape stops being readable exactly where the number starts to matter. Folded
 * it is "10×1", and a mixed week is "3×2 + 4×1".
 *
 * Short ones are NOT folded, and the threshold is about reading rather than
 * width: "2+2+1" is a picture of the week — three blocks, one of them short —
 * and "2×2 + 1×1" is arithmetic about it. Up to four terms the picture wins.
 */
export function patternLabel(blocks: number[]): string {
  if (blocks.length === 0) return '–';
  if (blocks.length <= FOLD_AT) return blocks.join('+');
  const pairs = blocks.filter((b) => b === 2).length;
  const singles = blocks.length - pairs;
  const parts: string[] = [];
  if (pairs > 0) parts.push(`${pairs}×2`);
  if (singles > 0) parts.push(`${singles}×1`);
  return parts.join(' + ');
}

/** Every way N hours can be split into 1s and 2s: fewest twos first. */
export function patternOptions(weeklyHours: number): Array<{ pairs: number; label: string }> {
  const hours = Math.max(0, Math.round(weeklyHours));
  const options: Array<{ pairs: number; label: string }> = [];
  for (let pairs = 0; pairs <= Math.floor(hours / 2); pairs++) {
    options.push({ pairs, label: patternLabel(blockPlan({ weeklyHours: hours, pairs })) });
  }
  return options;
}

/**
 * The only place that decides how many twos a week can hold.
 *
 * `Number('')` and `Number(null)` are both 0 and 0 is a legal answer here
 * (pitfall 43), so a caller reading storage has to tell "missing" from "none"
 * before it gets this far — this one only clamps a number it is given.
 */
export function clampPairs(weeklyHours: number, pairs: number): number {
  const ceiling = Math.floor(Math.max(0, Math.round(weeklyHours)) / 2);
  if (!Number.isFinite(pairs)) return 0;
  return Math.max(0, Math.min(ceiling, Math.round(pairs)));
}
