// Where a dragged block actually LANDS. Pure arithmetic: no refs, no DOM, no
// React — the same shape `rowDrag.ts`'s `clampIndex` and `poolSplit.ts`'s
// `maxDockHeight` have, and testable without a browser.

export interface Cell {
  day: number;
  hour: number;
}

/**
 * A block keeps its full length. "2 derslik bir blok kesinlikle 1 ders değil
 * 2 derstir" — the cell under the cursor used to be read as the block's
 * START no matter what, so hovering the day's LAST hour with a two-hour
 * block always failed (it would need an hour past the end of the day) even
 * though the block plainly fits in the day's last two hours. This reads a
 * cell too close to the end as the last start that still lets the whole
 * block land inside the day, instead of refusing on that boundary technicality.
 */
export function clampToDay(hour: number, blockSize: number, hourCount: number): number {
  return hour + blockSize > hourCount ? Math.max(0, hourCount - blockSize) : hour;
}

/**
 * The cell under the cursor read as a block START.
 *
 * Both the frame loop and the pointer-up path need exactly this, and they used
 * to spell it out separately — two copies of one rule, forty lines apart.
 */
export function blockStart(raw: Cell | null, blockSize: number, hourCount: number): Cell | null {
  if (raw === null) return null;
  return { day: raw.day, hour: clampToDay(raw.hour, blockSize, hourCount) };
}

/** How a cell is named in the verdict map and in the "did the target change" test. */
export function cellKey(cell: Cell | null): string {
  return cell === null ? '' : `${cell.day}|${cell.hour}`;
}
