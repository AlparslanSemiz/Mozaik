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
// Why scrolling is mandatory: 25 rows x 84 columns do not fit a 1366x768
// screen. If the target row or the target day is off-screen the user cannot
// reach it. So (a) the target row is scrolled into view when the drag starts,
// (b) the grid scrolls by itself when the cursor nears an edge.

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { Verdict } from './constraints';
import type { Id } from './types';

export interface DragData {
  lessonId: Id;
  /** Id of the target row (teacherId or classId). Cannot be dropped on another row. */
  rowId: string;
  /** How many cells it will cover. */
  blockSize: number;
  /** `${day}|${hour}` -> verdict. `blocked === null` means droppable. */
  map: Map<string, Verdict>;
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

const HL_OK = 'drop-ok';
const HL_WARN = 'drop-warn';
const HL_BLOCKED = 'drop-blocked';

/** The grid scrolls while the cursor is this close to an edge. */
const EDGE = 56;
/** Scroll amount per frame (px). Kept low so the user stays in control. */
const STEP = 14;

export function useDrag(drop: (lessonId: Id, day: number, hour: number) => void) {
  // Only changes when the drag starts and ends -> two re-renders, that is all.
  const [dragging, setDragging] = useState<DragData | null>(null);
  // For the reason bar at the top. The grid is React.memo, so changing this
  // does not redraw the grid, only the bar.
  const [reason, setReason] = useState<Reason | null>(null);

  const data = useRef<DragData | null>(null);
  const ghost = useRef<HTMLDivElement | null>(null);
  const highlighted = useRef<HTMLElement[]>([]);
  const lastTarget = useRef<string>('');
  const pos = useRef({ x: 0, y: 0 });
  const loop = useRef(0);

  const clearHighlight = useCallback(() => {
    for (const el of highlighted.current) el.classList.remove(HL_OK, HL_WARN, HL_BLOCKED);
    highlighted.current = [];
    lastTarget.current = '';
  }, []);

  const finish = useCallback(() => {
    cancelAnimationFrame(loop.current);
    loop.current = 0;
    clearHighlight();
    ghost.current?.remove();
    ghost.current = null;
    data.current = null;
    setDragging(null);
    setReason(null);
  }, [clearHighlight]);

  const start = useCallback((e: React.PointerEvent, d: DragData, content: GhostContent) => {
    if (e.button !== 0) return;
    e.preventDefault();

    data.current = d;
    pos.current = { x: e.clientX, y: e.clientY };
    setDragging(d);
    setReason(null);

    const el = document.createElement('div');
    el.className = 'ghost';
    el.style.background = `var(--color-${content.color})`;
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
    document
      .querySelector<HTMLElement>('tr.target-row')
      ?.scrollIntoView({ block: 'center', inline: 'nearest' });

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
        drop(d.lessonId, target.day, target.hour);
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
    };
  }, [dragging, drop, finish, clearHighlight]);

  return { start, dragging, reason };
}
