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

import { DOCK_H_MAX, DOCK_H_MIN, DOCK_H_STEP } from "./view/theme";

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
  const size = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
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

export function attachSplitter(
  handle: HTMLElement,
  opts: SplitterOptions,
): () => void {
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
    opts.body.style.setProperty("--dock-h", `${live}rem`);
    handle.setAttribute("aria-valuenow", String(Math.round(live * 100) / 100));
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
    opts.body.classList.add("splitting");
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
    if (handle.hasPointerCapture(e.pointerId))
      handle.releasePointerCapture(e.pointerId);
    opts.body.classList.remove("splitting");
    opts.commit(live);
  }

  function key(e: KeyboardEvent) {
    const step = e.shiftKey ? 2 : 0.5;
    let next: number | null = null;
    if (e.key === "ArrowUp") next = opts.current() + step;
    else if (e.key === "ArrowDown") next = opts.current() - step;
    else if (e.key === "Home") next = DOCK_H_MIN;
    else if (e.key === "End") next = ceiling();
    if (next === null) return;
    e.preventDefault();
    // A few events per second, so this one may go through React directly.
    apply(next);
    opts.commit(live);
  }

  handle.addEventListener("pointerdown", down);
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", up);
  handle.addEventListener("pointercancel", up);
  handle.addEventListener("keydown", key);

  return () => {
    handle.removeEventListener("pointerdown", down);
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", up);
    handle.removeEventListener("pointercancel", up);
    handle.removeEventListener("keydown", key);
  };
}
