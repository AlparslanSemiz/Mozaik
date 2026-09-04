/**
 * How one lesson's week is SPLIT — and nothing else.
 *
 * A lesson's weekly hours go down as blocks. `Lesson.blocks` lists the ones
 * longer than an hour, biggest first; whatever is left over is a single hour.
 * This module turns that list into the shapes the rest of the program needs: a
 * list to place, a sentence to read, and every combination the picker offers.
 *
 * It imports NOTHING but the type, on purpose — the same reason `palette.ts`
 * and `keys.ts` stand alone. `entities.ts` already imports `constraints.ts`, so
 * anything both of them need has to live below both of them or the two start
 * importing each other.
 *
 * 1 to 3. Schema v13 removes four-hour blocks. The selected distribution is a
 * compact button; opening it shows every 3/2/1 partition in a scrollable list.
 */
import type { Lesson } from '../types';

/** The longest block a week can be asked for. */
export const MAX_BLOCK = 3;

/** The block lengths a lesson may name, biggest first. Singles are implied. */
export const BLOCK_SIZES = [3, 2] as const;

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

export interface BlockPatternOption {
  /** The stored part of the split: only blocks longer than one hour. */
  blocks: number[];
  /** The whole week, including the implied singles. */
  plan: number[];
  /** The compact notation used everywhere else in the interface. */
  label: string;
}

/**
 * Every unique way to split N hours into blocks of 3, 2 and 1.
 *
 * The order is stable: more threes first, then more twos. The list therefore
 * scans from concentrated weeks toward single hours without a UI-only sort.
 */
export function patternOptions(weeklyHours: number): BlockPatternOption[] {
  const hours = Math.max(0, Math.round(weeklyHours));
  const options: BlockPatternOption[] = [];

  for (let threes = Math.floor(hours / 3); threes >= 0; threes--) {
    const afterThrees = hours - threes * 3;
    for (let twos = Math.floor(afterThrees / 2); twos >= 0; twos--) {
      const blocks = [
        ...Array<number>(threes).fill(3),
        ...Array<number>(twos).fill(2),
      ];
      const plan = blockPlan({ weeklyHours: hours, blocks });
      options.push({ blocks, plan, label: patternLabel(plan) });
    }
  }

  return options;
}
