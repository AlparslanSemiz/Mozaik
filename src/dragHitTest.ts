// Which cell is under the cursor, and when the grid should scroll itself.
//
// GEOMETRY IS READ ONCE AND KEPT, because a read is never just a read here: by
// the time a frame asks, that frame has already written the ghost's transform
// and last frame's cell classes, so `getBoundingClientRect()` forces style and
// layout again — on a table of 84 columns × 25 rows. Measured inside the rAF
// callback (4x CPU, sample school, busiest row): UpdateLayoutTree + PrePaint
// were 0.14 ms of its 0.52 ms.
//
// Neither box moves while the grid scrolls under the cursor: `.grid-wrap` stays
// where it is, and a cell rect is only kept while the scroll offsets are the
// ones it was read at. A page scroll or a resize invalidates both.

import type { Cell } from './dragGeometry';

/** The grid scrolls while the cursor is this close to an edge. */
const EDGE = 56;
/** Scroll amount per frame (px). Kept low so the user stays in control. */
const STEP = 14;

export interface HitTest {
  /** The wrap's box, read once and remembered. */
  wrapBox(): DOMRect | null;
  /** A fresh read: for after something really moved. */
  readWrapBox(): DOMRect | null;
  find(x: number, y: number): Cell | null;
  /** Scrolls the grid if the cursor is near an edge. True if it scrolled. */
  scrollAtEdge(x: number, y: number): boolean;
  /** Every cell has just moved under the pointer. */
  forgetCell(): void;
  /** A wheel, a scrolled page, a resized window: both boxes are wrong now. */
  forget(): void;
}

export function createHitTest(
  wrap: HTMLElement | null,
  row: HTMLTableRowElement | null,
): HitTest {
  let wrapCache: DOMRect | null = null;
  let cellCache: { rect: DOMRect; day: number; hour: number } | null = null;

  const readWrapBox = (): DOMRect | null => {
    if (wrap === null) return null;
    wrapCache = wrap.getBoundingClientRect();
    return wrapCache;
  };

  return {
    readWrapBox,
    wrapBox: () => wrapCache ?? readWrapBox(),
    forgetCell: () => {
      cellCache = null;
    },
    forget: () => {
      wrapCache = null;
      cellCache = null;
    },

    /**
     * The grid cell under the cursor. The ghost MUST be pointer-events: none.
     *
     * STILL IN THE SAME CELL IS ANSWERED WITHOUT A HIT TEST. A cell is 34px
     * wide (18px at Sığdır) and a hand placing a block spends many frames
     * inside one of them, but `elementFromPoint` was asked on every single
     * frame — traced, it was 0.31 ms of the 0.52 ms this drag spends per frame
     * on this machine, the single most expensive thing in the loop. The rect is
     * only trusted while nothing has scrolled or resized under it: the sticky
     * teacher column slides over these cells when the week scrolls sideways,
     * and a remembered rect would then answer for a cell the pointer can no
     * longer reach.
     */
    find(x, y) {
      const seen = cellCache;
      if (
        seen !== null &&
        x >= seen.rect.left &&
        x < seen.rect.right &&
        y >= seen.rect.top &&
        y < seen.rect.bottom
      ) {
        return { day: seen.day, hour: seen.hour };
      }

      const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-day]');
      // Compare the element, not the id as a selector: ids can start with a
      // digit and escaping them in CSS is a chore.
      if (el == null || el.closest('tr') !== row) {
        cellCache = null;
        return null;
      }
      const day = Number(el.dataset['day']);
      const hour = Number(el.dataset['hour']);
      if (!Number.isInteger(day) || !Number.isInteger(hour)) {
        cellCache = null;
        return null;
      }
      cellCache = { rect: el.getBoundingClientRect(), day, hour };
      return { day, hour };
    },

    scrollAtEdge(x, y) {
      if (wrap === null) return false;
      const r = wrapCache ?? readWrapBox();
      if (r === null) return false;

      // No scrolling while the cursor is OUTSIDE the grid. The lesson pool sits
      // right below the grid: without this check the grid starts scrolling down
      // the instant the user presses a pool card, before moving at all.
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;

      const beforeX = wrap.scrollLeft;
      const beforeY = wrap.scrollTop;

      if (x < r.left + EDGE) wrap.scrollLeft -= STEP;
      else if (x > r.right - EDGE) wrap.scrollLeft += STEP;
      if (y < r.top + EDGE) wrap.scrollTop -= STEP;
      else if (y > r.bottom - EDGE) wrap.scrollTop += STEP;

      return wrap.scrollLeft !== beforeX || wrap.scrollTop !== beforeY;
    },
  };
}
