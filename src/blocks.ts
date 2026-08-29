/**
 * How one lesson's week is SPLIT — and nothing else.
 *
 * A lesson's weekly hours go down as blocks. `Lesson.blocks` lists the ones
 * longer than an hour, biggest first; whatever is left over is a single hour.
 * This module turns that list into the shapes the rest of the program needs: a
 * list to place, a sentence to read, and the counts a stepper edits.
 *
 * It imports NOTHING but the type, on purpose — the same reason `palette.ts`
 * and `keys.ts` stand alone. `entities.ts` already imports `constraints.ts`, so
 * anything both of them need has to live below both of them or the two start
 * importing each other.
 *
 * 1 to 4. Schema v7 had dropped everything but 1 and 2, and the reason given
 * was the dropdown: every extra part multiplies the choices somebody has to
 * read, and twelve hours went from 7 options to 19. That reason died with the
 * dropdown. The split is now edited as three counts — how many fours, how many
 * threes, how many twos — so the number of controls is three whatever the
 * hours are, and 34 ways to divide twelve hours never become 34 rows.
 */
import type { Lesson } from './types';

/** The longest block a week can be asked for. */
export const MAX_BLOCK = 4;

/** The block lengths a lesson may name, biggest first. Singles are implied. */
export const BLOCK_SIZES = [4, 3, 2] as const;

export type BlockSize = (typeof BLOCK_SIZES)[number];

/**
 * The only place that decides which blocks a week can hold.
 *
 * Out-of-range lengths are dropped, the rest are sorted biggest first, and the
 * tail is cut while the sum would outrun the hours. Cutting from the TAIL keeps
 * the big blocks a reader asked for: dropping an hour from 4+2 leaves 4, not 2.
 *
 * `Number('')` and `Number(null)` are both 0 and 0 is a legal count elsewhere
 * (pitfall 43), so a caller reading storage has to tell "missing" from "none"
 * before it gets this far — this one only cleans a list it is given.
 */
export function clampBlocks(weeklyHours: number, blocks: readonly number[]): number[] {
  const hours = Math.max(0, Math.round(weeklyHours));
  if (!Array.isArray(blocks)) return [];
  const sized = blocks
    .map((b) => Math.round(Number(b)))
    .filter((b) => Number.isFinite(b) && b >= 2 && b <= MAX_BLOCK)
    .sort((a, b) => b - a);

  const kept: number[] = [];
  let used = 0;
  for (const b of sized) {
    if (used + b > hours) continue;
    kept.push(b);
    used += b;
  }
  return kept;
}

/** The blocks a lesson asks for, biggest first: its named blocks, then singles. */
export function blockPlan(lesson: Pick<Lesson, 'weeklyHours' | 'blocks'>): number[] {
  const hours = Math.max(0, Math.round(lesson.weeklyHours));
  const named = clampBlocks(hours, lesson.blocks);
  const singles = hours - named.reduce((sum, b) => sum + b, 0);
  return [...named, ...Array<number>(Math.max(0, singles)).fill(1)];
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
 *
 * The fold counts EVERY length separately. It used to count twos and call
 * everything else a single, which was the same thing while a block could only
 * be 1 or 2 — and would have printed `[3,3,3,1,1]` as "5×1".
 */
export function patternLabel(blocks: number[]): string {
  if (blocks.length === 0) return '–';
  if (blocks.length <= FOLD_AT) return blocks.join('+');

  const counts = new Map<number, number>();
  for (const b of blocks) counts.set(b, (counts.get(b) ?? 0) + 1);

  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([size, n]) => `${n}×${size}`)
    .join(' + ');
}

/** How many blocks of each length a split names. Singles are not counted. */
export function blockCounts(blocks: readonly number[]): Record<BlockSize, number> {
  const counts = { 4: 0, 3: 0, 2: 0 } as Record<BlockSize, number>;
  for (const b of blocks) {
    if (b === 4 || b === 3 || b === 2) counts[b]++;
  }
  return counts;
}

/**
 * The most blocks of one length a week could still hold, the OTHER counts kept.
 *
 * This is the ceiling a stepper stops at, so it has to answer with the rest of
 * the split standing: asking "how many threes fit in 9 hours" is the wrong
 * question when two of those hours are already spoken for by a pair.
 */
export function maxCount(weeklyHours: number, blocks: readonly number[], size: BlockSize): number {
  const hours = Math.max(0, Math.round(weeklyHours));
  const others = clampBlocks(hours, blocks)
    .filter((b) => b !== size)
    .reduce((sum, b) => sum + b, 0);
  return Math.max(0, Math.floor((hours - others) / size));
}

/** The same split with a different number of `size`-hour blocks in it. */
export function withCount(
  weeklyHours: number,
  blocks: readonly number[],
  size: BlockSize,
  count: number,
): number[] {
  const hours = Math.max(0, Math.round(weeklyHours));
  const wanted = Math.max(0, Math.min(maxCount(hours, blocks, size), Math.round(count) || 0));
  const others = clampBlocks(hours, blocks).filter((b) => b !== size);
  return clampBlocks(hours, [...others, ...Array<number>(wanted).fill(size)]);
}
