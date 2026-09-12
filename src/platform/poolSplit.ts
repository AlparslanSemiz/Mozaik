// The line between the grid and the pool, dragged to resize the drawer.
//
// Pure DOM, no React — the third time this file's pattern appears (drag.ts,
// gridChrome.ts). The reason is the same one, and it is measured: the grid is
// ~2100 memoised cells, and a `pointermove` that writes React state would
// re-render the table on every pixel of the drag. What moves instead is one
// custom property on one element; layout does the rest.
//
// The React side hears about it exactly once, on pointerup, so the preference
// can be written and the component can agree with the DOM.

import { DOCK_H_MAX, DOCK_H_MIN, DOCK_H_STEP } from './theme';

/** Room the grid must keep for itself: sticky head plus about ten rows. */
const GRID_FLOOR_REM = 26;

export interface SplitterOptions {
  /** The element carrying `--dock-h`; also the box the ceiling is measured in. */
  body: HTMLElement;
  /** Current height in rem, read at gesture start. */
  current: () => number;
  /** Called once, when the gesture ends. */
  commit: (rem: number) => void;
}

/** One rem in CSS pixels, as the document currently resolves it. */
function remPx(): number {
  const size = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(size) && size > 0 ? size : 16;
}

/**
 * The real ceiling, in rem.
 *
 * A fixed 22rem is wrong at 150%: the rows grew too, so the same drawer would
 * leave the grid six teachers instead of ten. CSS clamps the drawn height the
 * same way; this function exists so `aria-valuemax` does not lie about it.
 */
export function maxDockHeight(bodyPx: number): number {
  const available = bodyPx / remPx() - GRID_FLOOR_REM;
  return Math.max(DOCK_H_MIN, Math.min(DOCK_H_MAX, available));
}

/** What the drawer needs to know to size itself against the grid. */
export interface DockRoom {
  /** The preference as stored. The drawer never opens SMALLER than this. */
  storedRem: number;
  /**
   * Every pixel the grid does not need: the scroll box, minus the table's own
   * natural height, plus whatever the drawer is already holding. Written that
   * way on purpose -- it does not depend on the drawer's current height, so
   * measuring again after the drawer has grown gives the same answer.
   */
  roomPx: number;
  /** The drawer's height right now, in rem. */
  currentRem: number;
  /** What the tray still cannot show at that height. */
  overflowPx: number;
  /** The box the ceiling is measured in. */
  bodyPx: number;
}

/**
 * The height the drawer OPENS at, in rem, given the room the grid is not using.
 *
 * Measured on the real school (2026-09-12): eighteen teacher rows left the
 * grid's scroll box 75.6px taller than its own table with nothing drawn in that
 * strip, while the tray showed 19 of its 205 cards and the other 182 sat under
 * the fold. The strip is the grid's, but the grid is not using it, and it goes
 * straight back the moment the table needs it: `roomPx` is then small and the
 * stored height stands.
 *
 * Bounded four ways, and each bound is a case that was measured rather than
 * imagined. Never past the room (or the drawer takes rows off the grid). Never
 * past what the tray has to show, `currentRem + overflowPx` (or one waiting
 * card opens a tray for fifty). Never past the ceiling. And never BELOW the
 * stored preference, which is also why the caller must not write the result
 * back: a drawer that grew to fit today's school must not become the number the
 * user is stuck with tomorrow.
 *
 * Both bounds are invariant under the drawer's own height, so this can be
 * measured again whenever the grid changes shape and it will not walk.
 */
export function dockHeightForRoom(r: DockRoom): number {
  const rem = remPx();
  const wanted = Math.min(r.roomPx / rem, r.currentRem + Math.max(0, r.overflowPx) / rem);
  const opened = Math.max(r.storedRem, wanted);
  const bounded = Math.max(DOCK_H_MIN, Math.min(maxDockHeight(r.bodyPx), opened));
  // The same step the preference is stored at, so what is drawn and what a
  // later drag starts from are the same number.
  return Math.round(bounded / DOCK_H_STEP) * DOCK_H_STEP;
}

export function attachSplitter(handle: HTMLElement, opts: SplitterOptions): () => void {
  let startY = 0;
  let startRem = 0;
  let live = 0;
  let dragging = false;

  function ceiling(): number {
    return maxDockHeight(opts.body.getBoundingClientRect().height);
  }

  function apply(rem: number) {
    const bounded = Math.max(DOCK_H_MIN, Math.min(ceiling(), rem));
    // Rounded to the same step the preference is stored at, so what is on
    // screen and what comes back after a reload are the same number.
    live = Math.round(bounded / DOCK_H_STEP) * DOCK_H_STEP;
    // The ONE write of the whole gesture. React never hears about it.
    opts.body.style.setProperty('--dock-h', `${live}rem`);
    handle.setAttribute('aria-valuenow', String(Math.round(live * 100) / 100));
  }

  function down(e: PointerEvent) {
    if (e.button !== 0) return;
    startY = e.clientY;
    startRem = opts.current();
    live = startRem;
    dragging = true;
    handle.setPointerCapture(e.pointerId);
    // Kills the flex-basis transition for the duration: without it the drawer
    // lags a frame behind the finger and reads as rubber.
    opts.body.classList.add('splitting');
    e.preventDefault();
  }

  function move(e: PointerEvent) {
    if (!dragging) return;
    // Dragging UP makes the drawer taller: it grows from the bottom edge.
    apply(startRem + (startY - e.clientY) / remPx());
  }

  function up(e: PointerEvent) {
    // NOT gated on `hasPointerCapture`: the browser may have released it
    // already by the time `pointerup` fires, and then the gesture would end
    // without ever writing the preference — the drawer moves and forgets.
    if (!dragging) return;
    dragging = false;
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    opts.body.classList.remove('splitting');
    opts.commit(live);
  }

  function key(e: KeyboardEvent) {
    const step = e.shiftKey ? 2 : 0.5;
    let next: number | null = null;
    if (e.key === 'ArrowUp') next = opts.current() + step;
    else if (e.key === 'ArrowDown') next = opts.current() - step;
    else if (e.key === 'Home') next = DOCK_H_MIN;
    else if (e.key === 'End') next = ceiling();
    if (next === null) return;
    e.preventDefault();
    // A few events per second, so this one may go through React directly.
    apply(next);
    opts.commit(live);
  }

  handle.addEventListener('pointerdown', down);
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
  handle.addEventListener('pointercancel', up);
  handle.addEventListener('keydown', key);

  return () => {
    handle.removeEventListener('pointerdown', down);
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
    handle.removeEventListener('pointercancel', up);
    handle.removeEventListener('keydown', key);
  };
}
