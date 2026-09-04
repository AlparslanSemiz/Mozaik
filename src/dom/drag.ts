// Drag and drop: Pointer Events. HTML5 drag-and-drop is NOT used.
//
// Why (pitfall 1): with HTML5 DnD a re-render during the drag cancels the
// operation. Pointer Events do not have that trap, the movement is smoother and
// touch support comes for free.
//
// The trick that keeps it smooth on a slow machine: valid cells are computed
// ONCE when the drag STARTS (84 checks), not on every frame. Per frame we only
// move the ghost and, when the pointer has actually left the cell it was in,
// look up the new one. Frames are requested only while the pointer moves or
// edge scrolling is active. React state does NOT change during the drag, the
// grid is not redrawn.
//
// WHAT IS LEFT IN THIS FILE IS THE LIFECYCLE. Everything a drag does to the
// page it does through a small module that owns that one thing, because those
// are the parts a ref does not have to be shared for:
//
//   dragGeometry.ts  where a block lands        pure
//   dragHitTest.ts   which cell, and scrolling  owns the cached boxes
//   dragPaint.ts     the classes on the cells   owns the painted lists
//   dragShades.ts    the two dimming overlays   owns its two <div>s
//   dragGhost.ts     the card in the hand       owns its <div>
//   reasonBar.ts     the sentence above         owns the bar it took over
//
// Why scrolling is mandatory: 25 rows x 84 columns do not fit the screen at any
// size we target — at 1920x1080 the grid is 2616px wide against 1828px of box,
// and 6 of the 25 rows sit below the fold (measured). If the target row or the
// target day is off-screen the user cannot reach it. So (a) the target row is
// scrolled into view when the drag starts, (b) the grid scrolls by itself when
// the cursor nears an edge.

import { useCallback, useEffect, useRef } from "react";
import type React from "react";
import type { BlockRef, DropVerdict } from "../constraints";
import { blockStart, type Cell, cellKey } from "./dragGeometry";
import { type Ghost, type GhostContent, mountGhost } from "./dragGhost";
import { createHitTest } from "./dragHitTest";
import { createPainter, type Level, type Painter } from "./dragPaint";
import { mountShades, type Shades } from "./dragShades";
import { t } from "../i18n";
import { captureReasonBar, type ReasonBar } from "./reasonBar";
import type { Id } from "../types";

export type { GhostContent } from "./dragGhost";

export interface DragData {
  lessonId: Id;
  /** Id of the target row (teacherId or classId). Cannot be dropped on another row. */
  rowId: string;
  /** How many cells it will cover. */
  blockSize: number;
  /** The day's hour count — the same for every day, needed to clamp a drop
   * near the end of the day (see `clampToDay`). */
  hourCount: number;
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
  source: BlockRef | null;
}

/** How loudly a verdict reads, and what colour it paints. */
function levelOf(verdict: DropVerdict | undefined): Level {
  if (verdict === undefined || verdict.blocked !== null) return "blocked";
  return verdict.warning !== null ? "warn" : "ok";
}

export function useDrag(
  drop: (data: DragData, day: number, hour: number) => void,
) {
  const data = useRef<DragData | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const loop = useRef(0);
  const ghost = useRef<Ghost | null>(null);
  const shades = useRef<Shades | null>(null);
  const bar = useRef<ReasonBar | null>(null);
  // Lazily, not `useRef(createPainter())`: that argument is evaluated on every
  // render and Program renders often, for an object only the first one keeps.
  const painterRef = useRef<Painter | null>(null);
  painterRef.current ??= createPainter();
  const dragTable = useRef<HTMLTableElement | null>(null);
  const targetRow = useRef<HTMLTableRowElement | null>(null);
  const activate = useRef<(d: DragData) => void>(() => undefined);
  const detach = useRef<() => void>(() => undefined);

  const finish = useCallback(() => {
    cancelAnimationFrame(loop.current);
    loop.current = 0;
    detach.current();
    detach.current = () => undefined;

    painterRef.current?.reset();
    targetRow.current?.classList.remove("target-row");
    dragTable.current?.classList.remove("dragging");
    targetRow.current = null;
    dragTable.current = null;

    shades.current?.remove();
    shades.current = null;
    ghost.current?.remove();
    ghost.current = null;
    bar.current?.restore();
    bar.current = null;
    data.current = null;
  }, []);

  const start = useCallback(
    (e: React.PointerEvent, d: DragData, content: GhostContent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      data.current = d;
      pos.current = { x: e.clientX, y: e.clientY };
      ghost.current = mountGhost(content, d.blockSize, e.clientX, e.clientY);
      // Every answer is imperative. Red/yellow targets used to call setState
      // here and redraw Program while the pointer crossed the row.
      bar.current = captureReasonBar();

      activate.current(d);
    },
    [],
  );

  // Assigned on every render rather than memoised: it closes over `drop`, and a
  // stale `drop` would place a block into a state that has moved on.
  activate.current = (dragging: DragData) => {
    const wrap = document.querySelector<HTMLElement>(".grid-wrap");
    const table = wrap?.querySelector<HTMLTableElement>("table.grid") ?? null;
    const row =
      [...(table?.querySelectorAll<HTMLTableRowElement>("tbody tr") ?? [])].find(
        (candidate) => candidate.dataset.rowId === dragging.rowId,
      ) ?? null;

    dragTable.current = table;
    targetRow.current = row;

    const hit = createHitTest(wrap, row);
    const paint = painterRef.current!;

    /** Used from `frame()` once the grid has actually scrolled — at that point
        a fresh read is unavoidable since the boxes really changed. */
    const positionShades = () => {
      if (wrap === null || row === null) return;
      const wrapBox = hit.readWrapBox();
      if (wrapBox === null) return;
      shades.current?.place(wrapBox, row.getBoundingClientRect(), headingBottom(table, wrapBox));
    };

    // ONE read, before any write below can dirty layout. `scrollIntoView`,
    // toggling `.dragging`/`.target-row`, and appending the two shade <div>s
    // each invalidate layout; a `getBoundingClientRect()` after any of them
    // forces Chromium to lay out the whole page — this table alone is 84
    // columns × 25 rows. Measured: an existing-card drag (which skips
    // `scrollIntoView` below and so had no earlier clean read to reuse) paid
    // ~24ms for this at 4× CPU, on top of `dropMap()`'s own cost — the
    // dominant part of the "kasma" felt at pickup, not the per-frame move.
    if (wrap !== null && row !== null) {
      const wrapBox = hit.readWrapBox()!;
      const rowBox = row.getBoundingClientRect();
      const heading = headingBottom(table, wrapBox);
      const scrolledIntoView = revealRow(row, wrapBox, rowBox, heading, dragging.source === null);

      table?.classList.add("dragging");
      row.classList.add("target-row");
      shades.current = mountShades();

      if (scrolledIntoView) {
        // The scroll above moved `rowBox`; the read at the top of this block is
        // stale, so this one fresh read is unavoidable.
        positionShades();
      } else {
        // Reuses the geometry read above — still clean at that point — instead
        // of forcing a second, now-dirty layout.
        shades.current.place(wrapBox, rowBox, heading);
      }
    } else {
      table?.classList.add("dragging");
      row?.classList.add("target-row");
    }

    paint.index(row);
    paint.preview(row, dragging.map, dragging.blockSize, dragging.hourCount);

    const frame = () => {
      // This callback is no longer pending. A pointer move or successful edge
      // scroll may request the next one below.
      loop.current = 0;
      const { x, y } = pos.current;
      const d = data.current;
      if (d === null) return;

      ghost.current?.moveTo(x, y);

      const scrolled = hit.scrollAtEdge(x, y);
      if (scrolled) {
        // Every cell has just moved under the pointer.
        hit.forgetCell();
        positionShades();
      }

      // The raw cell under the cursor, clamped so a block being placed near the
      // end of the day is read by the last start that still fits it whole
      // rather than by the literal hour the pointer sits over.
      const target = blockStart(hit.find(x, y), d.blockSize, d.hourCount);
      // If it scrolled, the cell under the cursor may have changed; look again.
      if (!paint.isOn(cellKey(target)) || scrolled) retarget(d, target);

      // A successful edge scroll keeps the loop alive on its own: the cursor
      // has not moved, but the grid under it has.
      if (scrolled) scheduleFrame();
    };

    /** Moves the strong highlight and the sentence to a new cell. */
    const retarget = (d: DragData, target: Cell | null) => {
      paint.retarget(cellKey(target));
      if (target === null) {
        bar.current?.paint(null);
        return;
      }
      const verdict = d.map.get(cellKey(target));
      const level = levelOf(verdict);
      bar.current?.paint(reasonFor(verdict, level));
      paint.highlight(target, level, d.blockSize);
    };

    const scheduleFrame = () => {
      if (loop.current === 0) loop.current = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      scheduleFrame();
    };

    const onUp = (e: PointerEvent) => {
      const d = data.current;
      const target =
        d === null ? null : blockStart(hit.find(e.clientX, e.clientY), d.blockSize, d.hourCount);
      // A warning does not stop the drop; only `blocked` does.
      if (d !== null && target !== null && d.map.get(cellKey(target))?.blocked === null) {
        drop(d, target.day, target.hour);
      }
      finish();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };

    scheduleFrame();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("keydown", onKey);
    // A wheel over the grid, a scrolled page, a resized window: the remembered
    // boxes are wrong from that moment on. Capture, because a scroll event does
    // not bubble from the element that scrolled.
    const forget = () => hit.forget();
    window.addEventListener("scroll", forget, { capture: true, passive: true });
    window.addEventListener("resize", forget);
    detach.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", forget, { capture: true });
      window.removeEventListener("resize", forget);
    };
  };

  useEffect(
    () => () => {
      // Activity tears this tree down while Program is hidden. Treat that just
      // like Escape so no body-level ghost or painted cell survives the tab.
      finish();
    },
    [finish],
  );

  return { start };
}

/** Where the sticky header ends: the shades must not cover it. */
function headingBottom(table: HTMLTableElement | null, wrapBox: DOMRect): number {
  return table?.querySelector("thead")?.getBoundingClientRect().bottom ?? wrapBox.top;
}

/**
 * If the target row is off-screen the user can never reach it.
 *
 * 'center', not 'nearest': centring the row shows the neighbouring rows and
 * keeps the cursor out of the auto-scroll band (otherwise the grid drifts while
 * trying to drop). NOT when a placed block is being moved — the cursor is
 * already on that row, so centring it would yank the grid half a screen out
 * from under the hand that just pressed it.
 */
function revealRow(
  row: HTMLTableRowElement,
  wrapBox: DOMRect,
  rowBox: DOMRect,
  heading: number,
  fromPool: boolean,
): boolean {
  if (!fromPool) return false;
  const visibleTop = Math.max(wrapBox.top, heading);
  if (rowBox.top >= visibleTop && rowBox.bottom <= wrapBox.bottom) return false;
  row.scrollIntoView({ block: "center", inline: "nearest" });
  return true;
}

/** The sentence a verdict deserves, or null when there is nothing to say. */
function reasonFor(verdict: DropVerdict | undefined, level: Level) {
  if (level === "blocked") {
    return {
      text: verdict === undefined ? t("Bu hücreye bırakılamaz") : (verdict.blocked ?? ""),
      level,
    };
  }
  if (level === "warn") return { text: verdict?.warning ?? "", level };
  return null;
}
