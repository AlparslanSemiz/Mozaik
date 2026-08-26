// Drag and drop: Pointer Events. HTML5 drag-and-drop is NOT used.
//
// Why (docs/PLAN.md pitfall 1): with HTML5 DnD a re-render during the drag
// cancels the operation. Pointer Events do not have that trap, the movement is
// smoother and touch support comes for free.
//
// The trick that keeps it smooth on a slow machine: valid cells are computed
// ONCE when the drag STARTS (84 checks), not on every frame. Per frame we only
// move the ghost, scroll if needed, and do a single elementFromPoint.
// React state does NOT change during the drag, the grid is not redrawn.
//
// Why scrolling is mandatory: 25 rows x 84 columns do not fit the screen at any
// size we target — at 1920x1080 the grid is 2616px wide against 1828px of box,
// and 6 of the 25 rows sit below the fold (measured). If the target row or the target day is off-screen the user cannot
// reach it. So (a) the target row is scrolled into view when the drag starts,
// (b) the grid scrolls by itself when the cursor nears an edge.

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { DropVerdict } from './constraints';
import { paletteColor } from './palette';
import type { Id } from './types';

export interface DragData {
  lessonId: Id;
  /** Id of the target row (teacherId or classId). Cannot be dropped on another row. */
  rowId: string;
  /** How many cells it will cover. */
  blockSize: number;
  /**
   * `${day}|${hour}` -> verdict. `blocked === null` means droppable.
   *
   * A verdict also says what the drop would PUSH OUT: a cell whose only
   * problem was the class's own other lesson is droppable, and `evicts` names
   * what goes back to the pool if you let go there.
   */
  map: Map<string, DropVerdict>;
  /**
   * The block being MOVED, or null when the card came from the pool.
   *
   * `day`/`hour` are the block's START, not the cell that was grabbed: a two
   * hour block picked up by its second cell still moves as one.
   */
  source: { classId: Id; day: number; hour: number } | null;
}

/** What the bar above the grid says, and how loudly. */
export interface Reason {
  text: string;
  level: 'ok' | 'warn' | 'blocked';
}

export interface GhostContent {
  top: string;
  bottom: string;
  color: number;
}

// TWO layers, and they need SEPARATE names rather than two strengths of one
// name. The strong one marks the block under the cursor; the weak one is the
// whole row's answer, painted once when the drag starts. Reusing `drop-ok` for
// both would have been the cheap way and it breaks a real assertion: the suite
// counts `td.drop-ok` to check that a two-hour block lights exactly two cells,
// and a 78-column preview would have made that 40 (pitfall 53).
const HL_OK = 'drop-ok';
const HL_WARN = 'drop-warn';
const HL_BLOCKED = 'drop-blocked';

const PV_OK = 'can-ok';
const PV_WARN = 'can-warn';
const PV_NO = 'can-no';

/** The grid scrolls while the cursor is this close to an edge. */
const EDGE = 56;
/** Scroll amount per frame (px). Kept low so the user stays in control. */
const STEP = 14;

export function useDrag(drop: (data: DragData, day: number, hour: number) => void) {
  // Only changes when the drag starts and ends -> two re-renders, that is all.
  const [dragging, setDragging] = useState<DragData | null>(null);
  // For the reason bar at the top. The grid is React.memo, so changing this
  // does not redraw the grid, only the bar.
  const [reason, setReason] = useState<Reason | null>(null);

  const data = useRef<DragData | null>(null);
  const ghost = useRef<HTMLDivElement | null>(null);
  const highlighted = useRef<HTMLElement[]>([]);
  const previewed = useRef<HTMLElement[]>([]);
  const lastTarget = useRef<string>('');
  const pos = useRef({ x: 0, y: 0 });
  const loop = useRef(0);

  const clearHighlight = useCallback(() => {
    for (const el of highlighted.current) el.classList.remove(HL_OK, HL_WARN, HL_BLOCKED);
    highlighted.current = [];
    lastTarget.current = '';
  }, []);

  // React will NOT undo these for us. The rows do re-render when the drag ends
  // (`dim` flips on every one of them), but the className PROP is unchanged, so
  // React never touches the attribute and the classes would simply stay.
  const clearPreview = useCallback(() => {
    for (const el of previewed.current) el.classList.remove(PV_OK, PV_WARN, PV_NO);
    previewed.current = [];
  }, []);

  const finish = useCallback(() => {
    cancelAnimationFrame(loop.current);
    loop.current = 0;
    clearHighlight();
    clearPreview();
    ghost.current?.remove();
    ghost.current = null;
    data.current = null;
    setDragging(null);
    setReason(null);
  }, [clearHighlight, clearPreview]);

  const start = useCallback((e: React.PointerEvent, d: DragData, content: GhostContent) => {
    if (e.button !== 0) return;
    e.preventDefault();

    data.current = d;
    pos.current = { x: e.clientX, y: e.clientY };
    setDragging(d);
    setReason(null);

    const el = document.createElement('div');
    el.className = 'ghost';
    el.style.background = paletteColor(content.color);
    const top = document.createElement('span');
    top.className = 'card-top';
    top.textContent = content.top;
    const bottom = document.createElement('span');
    bottom.className = 'card-bottom';
    bottom.textContent = content.bottom;
    el.append(top, bottom);
    el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    document.body.appendChild(el);
    ghost.current = el;
  }, []);

  useEffect(() => {
    if (dragging === null) return;

    const wrap = document.querySelector<HTMLElement>('.grid-wrap');

    // If the target row is off-screen the user can never reach it. React has
    // already painted the .target-row class by the time this effect runs.
    //
    // 'center', not 'nearest': centring the row shows the neighbouring rows and
    // keeps the cursor out of the auto-scroll band (otherwise the grid drifts
    // while trying to drop).
    //
    // NOT when a placed block is being moved: the cursor is already on that row,
    // so centring it would yank the grid half a screen out from under the hand
    // that just pressed it.
    if (dragging.source === null) {
      document
        .querySelector<HTMLElement>('tr.target-row')
        ?.scrollIntoView({ block: 'center', inline: 'nearest' });
    }

    // THE WHOLE ROW'S ANSWER, painted once.
    //
    // `dragging.map` already holds a verdict for all 84 cells — Program.tsx
    // computed them before the hand had moved a pixel. Until now only the cell
    // under the cursor was ever painted from it, so "which hours can this
    // lesson go to" was a question you answered by sweeping the mouse along a
    // 78-column week. Everything else on screen said only which ROW.
    //
    // One pass, plain classList, no React: this is the same discipline the rAF
    // loop below keeps (pitfall 1), and it costs nothing per frame because it
    // never runs again.
    //
    // What it marks is DROP POINTS, not covered cells — the map is keyed by the
    // block's START. For a two-hour block those genuinely differ, and the strong
    // highlight under the cursor is the one that shows the span.
    const targetRow = document.querySelector<HTMLElement>('tr.target-row');
    if (targetRow !== null) {
      for (const cell of targetRow.querySelectorAll<HTMLElement>('td[data-day]')) {
        const verdict = dragging.map.get(`${cell.dataset['day']}|${cell.dataset['hour']}`);
        const cls =
          verdict === undefined || verdict.blocked !== null
            ? PV_NO
            : verdict.warning !== null
              ? PV_WARN
              : PV_OK;
        cell.classList.add(cls);
        previewed.current.push(cell);
      }
    }

    /** The grid cell under the cursor. The ghost MUST be pointer-events: none. */
    const findTarget = (x: number, y: number): { day: number; hour: number } | null => {
      const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-day]');
      // We check the class instead of comparing the row id as text: ids can
      // start with a digit and escaping them in a CSS selector is a chore.
      if (el == null || el.closest('tr')?.classList.contains('target-row') !== true) return null;
      const day = Number(el.dataset['day']);
      const hour = Number(el.dataset['hour']);
      return Number.isInteger(day) && Number.isInteger(hour) ? { day, hour } : null;
    };

    /** Scrolls the grid if the cursor is near an edge. Returns true if it scrolled. */
    const scrollAtEdge = (x: number, y: number): boolean => {
      if (wrap === null) return false;
      const r = wrap.getBoundingClientRect();

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
    };

    const frame = () => {
      const { x, y } = pos.current;
      const d = data.current;
      if (d === null) return;

      if (ghost.current !== null) {
        ghost.current.style.transform = `translate(${x}px, ${y}px)`;
      }

      const scrolled = scrollAtEdge(x, y);

      const target = findTarget(x, y);
      const signature = target === null ? '' : `${target.day}|${target.hour}`;
      // If it scrolled, the cell under the cursor may have changed; look again.
      if (signature !== lastTarget.current || scrolled) {
        clearHighlight();
        lastTarget.current = signature;

        if (target === null) {
          setReason(null);
        } else {
          const verdict = d.map.get(signature);
          const blocked = verdict === undefined ? 'Bu hücreye bırakılamaz' : verdict.blocked;
          const warning = verdict?.warning ?? null;

          setReason(
            blocked !== null
              ? { text: blocked, level: 'blocked' }
              : warning !== null
                ? { text: warning, level: 'warn' }
                : null,
          );

          // Paint every cell the block will cover.
          const rowEl = document.querySelector<HTMLElement>('tr.target-row');
          const cls = blocked !== null ? HL_BLOCKED : warning !== null ? HL_WARN : HL_OK;
          for (let i = 0; i < d.blockSize; i++) {
            const el = rowEl?.querySelector<HTMLElement>(
              `td[data-day="${target.day}"][data-hour="${target.hour + i}"]`,
            );
            if (el == null) break;
            el.classList.add(cls);
            highlighted.current.push(el);
          }
        }
      }

      loop.current = requestAnimationFrame(frame);
    };
    loop.current = requestAnimationFrame(frame);

    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onUp = (e: PointerEvent) => {
      const d = data.current;
      const target = findTarget(e.clientX, e.clientY);
      // A warning does not stop the drop; only `blocked` does.
      if (
        d !== null &&
        target !== null &&
        d.map.get(`${target.day}|${target.hour}`)?.blocked === null
      ) {
        drop(d, target.day, target.hour);
      }
      finish();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', finish);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(loop.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', finish);
      window.removeEventListener('keydown', onKey);
      clearPreview();
    };
  }, [dragging, drop, finish, clearHighlight, clearPreview]);

  return { start, dragging, reason };
}
