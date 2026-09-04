// Painting the grid during a drag, straight onto the DOM.
//
// React will NOT undo any of this: the classes are added directly so that a
// drag never redraws the memoised grid (pitfall 1), which means every class
// added here is one this module has to take off again.
//
// TWO layers, and they need SEPARATE names rather than two strengths of one
// name. The strong one marks the block under the cursor; the weak one is the
// whole row's answer, painted once when the drag starts. Reusing `drop-ok` for
// both would have been the cheap way and it breaks a real assertion: the suite
// counts `td.drop-ok` to check that a two-hour block lights exactly two cells,
// and a 78-column preview would have made that 40 (pitfall 53).

import type { DropVerdict } from '../constraints';
import { type Cell, clampToDay } from './dragGeometry';

const HL = { ok: 'drop-ok', warn: 'drop-warn', blocked: 'drop-blocked' } as const;
const PV = { ok: 'can-ok', warn: 'can-warn', blocked: 'can-no' } as const;

export type Level = keyof typeof HL;

export interface Painter {
  /** Builds the hour -> cell lookup once, so highlighting never scans again. */
  index(row: HTMLTableRowElement | null): void;
  /** The whole row's answer, painted once at drag start. */
  preview(
    row: HTMLTableRowElement | null,
    map: Map<string, DropVerdict>,
    blockSize: number,
    hourCount: number,
  ): void;
  /** Is this still the cell the strong highlight is on? */
  isOn(signature: string): boolean;
  /** Move the strong highlight to a new cell: clears, then remembers. */
  retarget(signature: string): void;
  /** Paints every cell the block would cover, from its start. */
  highlight(target: Cell, level: Level, blockSize: number): void;
  /** Takes every class back off and forgets the row. */
  reset(): void;
}

export function createPainter(): Painter {
  let highlighted: HTMLElement[] = [];
  let previewed: HTMLElement[] = [];
  let cellAt = new Map<string, HTMLElement>();
  let on = '';

  const clearHighlight = (): void => {
    for (const el of highlighted) el.classList.remove(HL.ok, HL.warn, HL.blocked);
    highlighted = [];
    on = '';
  };

  return {
    index(row) {
      cellAt = new Map<string, HTMLElement>();
      if (row === null) return;
      // A merged block has one <td> for several hours, so each hour it covers
      // points at the same cell.
      for (const cell of row.querySelectorAll<HTMLElement>('td[data-day][data-hour]')) {
        const day = Number(cell.dataset['day']);
        const hour = Number(cell.dataset['hour']);
        const span = Math.max(1, Number(cell.dataset['span']) || 1);
        for (let i = 0; i < span; i++) cellAt.set(`${day}|${hour + i}`, cell);
      }
    },

    /**
     * `map` already holds a verdict for all 84 cells — Program.tsx computed
     * them before the hand had moved a pixel. Until this existed only the cell
     * under the cursor was ever painted from it, so "which hours can this
     * lesson go to" was a question you answered by sweeping the mouse along a
     * 78-column week. Everything else on screen said only which ROW.
     *
     * One pass, plain classList, no React: the same discipline the rAF loop
     * keeps, and it costs nothing per frame because it never runs again.
     *
     * What it marks is DROP POINTS, not covered cells — the map is keyed by the
     * block's START. The day's own last (blockSize - 1) cells are looked up
     * through `clampToDay` rather than by their raw hour: read literally, the
     * day's last empty hour is always a "dayEnd" rejection for anything wider
     * than one hour, which painted it red even where dropping there actually
     * succeeds.
     */
    preview(row, map, blockSize, hourCount) {
      if (row === null) return;
      for (const cell of row.querySelectorAll<HTMLElement>('td[data-day]')) {
        const hour = clampToDay(Number(cell.dataset['hour']), blockSize, hourCount);
        const verdict = map.get(`${cell.dataset['day']}|${hour}`);
        const level: Level =
          verdict === undefined || verdict.blocked !== null
            ? 'blocked'
            : verdict.warning !== null
              ? 'warn'
              : 'ok';
        cell.classList.add(PV[level]);
        previewed.push(cell);
      }
    },

    isOn: (signature) => signature === on,

    retarget(signature) {
      clearHighlight();
      on = signature;
    },

    highlight(target, level, blockSize) {
      for (let i = 0; i < blockSize; i++) {
        // Two ways an hour can be on screen: as its own cell, or swallowed by a
        // cell to its left when a multi-hour block is drawn as one (Grid.tsx).
        // Asking only the first way made the later hours of such a block
        // resolve to null — and the `break` then stopped painting the REST of
        // the block too, with nothing to show for it.
        //
        // The swallowing cell is found by CONTAINMENT and not by a fixed
        // offset: a block is 1 to 3 hours wide, so "the cell one to the left
        // with span 2" only ever answered for the old pair (pitfalls 60 and 85
        // — a position is found by what covers it, not by a count).
        const el = cellAt.get(`${target.day}|${target.hour + i}`) ?? null;
        if (el == null) break;
        // A merged cell can answer for both of its hours; painting it twice
        // would also push it onto the cleanup list twice.
        if (!highlighted.includes(el)) {
          el.classList.add(HL[level]);
          highlighted.push(el);
        }
      }
    },

    reset() {
      clearHighlight();
      for (const el of previewed) el.classList.remove(PV.ok, PV.warn, PV.blocked);
      previewed = [];
      cellAt.clear();
    },
  };
}
