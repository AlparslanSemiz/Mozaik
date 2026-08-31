// Drag and drop: Pointer Events. HTML5 drag-and-drop is NOT used.
//
// Why (docs/PLAN.md pitfall 1): with HTML5 DnD a re-render during the drag
// cancels the operation. Pointer Events do not have that trap, the movement is
// smoother and touch support comes for free.
//
// The trick that keeps it smooth on a slow machine: valid cells are computed
// ONCE when the drag STARTS (84 checks), not on every frame. Per frame we only
// move the ghost, scroll if needed, and do a single elementFromPoint. Frames
// are requested only while the pointer moves or edge scrolling is active.
// React state does NOT change during the drag, the grid is not redrawn.
//
// Why scrolling is mandatory: 25 rows x 84 columns do not fit the screen at any
// size we target — at 1920x1080 the grid is 2616px wide against 1828px of box,
// and 6 of the 25 rows sit below the fold (measured). If the target row or the target day is off-screen the user cannot
// reach it. So (a) the target row is scrolled into view when the drag starts,
// (b) the grid scrolls by itself when the cursor nears an edge.

import { t } from "./i18n";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import type { DropVerdict } from "./constraints";
import { paletteColor } from "./palette";
import type { Id } from "./types";

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
  source: { classId: Id; day: number; hour: number } | null;
}

/** What the bar above the grid says, and how loudly. */
export interface Reason {
  text: string;
  level: "ok" | "warn" | "blocked";
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
const HL_OK = "drop-ok";
const HL_WARN = "drop-warn";
const HL_BLOCKED = "drop-blocked";

const PV_OK = "can-ok";
const PV_WARN = "can-warn";
const PV_NO = "can-no";

/**
 * A block keeps its full length. "2 derslik bir blok kesinlikle 1 ders değil
 * 2 derstir" — the cell under the cursor used to be read as the block's
 * START no matter what, so hovering the day's LAST hour with a two-hour
 * block always failed (it would need an hour past the end of the day) even
 * though the block plainly fits in the day's last two hours. This reads a
 * cell too close to the end as the last start that still lets the whole
 * block land inside the day, instead of refusing on that boundary technicality.
 */
function clampToDay(hour: number, blockSize: number, hourCount: number): number {
  return hour + blockSize > hourCount ? Math.max(0, hourCount - blockSize) : hour;
}

/** The grid scrolls while the cursor is this close to an edge. */
const EDGE = 56;
/** Scroll amount per frame (px). Kept low so the user stays in control. */
const STEP = 14;

export function useDrag(
  drop: (data: DragData, day: number, hour: number) => void,
) {
  // Only the reason text uses React state. Starting/ending a drag is entirely
  // imperative so the Program tree is not rendered just to toggle DOM classes.
  const [reason, setReason] = useState<Reason | null>(null);

  const data = useRef<DragData | null>(null);
  const ghost = useRef<HTMLDivElement | null>(null);
  const highlighted = useRef<HTMLElement[]>([]);
  const previewed = useRef<HTMLElement[]>([]);
  const lastTarget = useRef<string>("");
  const pos = useRef({ x: 0, y: 0 });
  const loop = useRef(0);
  const dragTable = useRef<HTMLTableElement | null>(null);
  const targetRow = useRef<HTMLTableRowElement | null>(null);
  const cellAt = useRef(new Map<string, HTMLElement>());
  const shades = useRef<HTMLElement[]>([]);
  const activate = useRef<(d: DragData) => void>(() => undefined);
  const detach = useRef<() => void>(() => undefined);
  const savedBar = useRef<{
    element: HTMLElement;
    className: string;
    text: string;
  } | null>(null);

  const clearHighlight = useCallback(() => {
    for (const el of highlighted.current)
      el.classList.remove(HL_OK, HL_WARN, HL_BLOCKED);
    highlighted.current = [];
    lastTarget.current = "";
  }, []);

  // React will NOT undo these for us: they are deliberately painted directly
  // so a drag does not redraw the memoised grid.
  const clearPreview = useCallback(() => {
    for (const el of previewed.current)
      el.classList.remove(PV_OK, PV_WARN, PV_NO);
    previewed.current = [];
  }, []);

  const finish = useCallback(() => {
    cancelAnimationFrame(loop.current);
    loop.current = 0;
    detach.current();
    detach.current = () => undefined;
    clearHighlight();
    clearPreview();
    targetRow.current?.classList.remove("target-row");
    dragTable.current?.classList.remove("dragging");
    targetRow.current = null;
    dragTable.current = null;
    cellAt.current.clear();
    for (const shade of shades.current) shade.remove();
    shades.current = [];
    ghost.current?.remove();
    ghost.current = null;
    data.current = null;
    if (savedBar.current !== null) {
      savedBar.current.element.className = savedBar.current.className;
      const text = savedBar.current.element.querySelector<HTMLElement>(":scope > span");
      if (text !== null) text.textContent = savedBar.current.text;
      savedBar.current = null;
    }
    setReason(null);
  }, [clearHighlight, clearPreview]);

  const start = useCallback(
    (e: React.PointerEvent, d: DragData, content: GhostContent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      data.current = d;
      pos.current = { x: e.clientX, y: e.clientY };
      setReason(null);

      const el = document.createElement("div");
      el.className = "ghost";
      el.style.background = paletteColor(content.color);
      // AS WIDE AS WHAT IT WILL COVER. The ghost was one cell wide whatever the
      // block was, while the highlight below it ran `blockSize` cells to the
      // RIGHT — so on a double the card sat half a cell left of the pair it was
      // about to fill, and the card lifted off the tray (twice as wide there,
      // `[data-size='2']`) shrank in the hand. The offset does not change: the
      // ghost's LEFT edge stays half a cell left of the pointer, which is the
      // left edge of the target cell.
      el.style.setProperty("--ghost-span", String(Math.max(1, d.blockSize)));
      const top = document.createElement("span");
      top.className = "card-top";
      top.textContent = content.top;
      const bottom = document.createElement("span");
      bottom.className = "card-bottom";
      bottom.textContent = content.bottom;
      el.append(top, bottom);
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      document.body.appendChild(el);
      ghost.current = el;

      // The generic answer is immediate but does not need a Program render.
      // A concrete blocker/warning later uses normal React state.
      const bar = document.querySelector<HTMLElement>(".reason-bar");
      const barText = bar?.querySelector<HTMLElement>(":scope > span") ?? null;
      if (bar !== null && barText !== null) {
        savedBar.current = {
          element: bar,
          className: bar.className,
          text: barText.textContent ?? "",
        };
        bar.className = "reason-bar ok";
        barText.textContent = t("Buraya bırakılabilir.");
      }

      activate.current(d);
    },
    [],
  );

  // Returning from a concrete warning/block to a valid or outside position
  // sets `reason` back to null. React then restores Program's idle sentence;
  // put the active drag sentence back before that commit is painted. Starting
  // a drag still causes no state update — start() writes the same text itself.
  useLayoutEffect(() => {
    if (data.current === null || reason !== null) return;
    const bar = document.querySelector<HTMLElement>(".reason-bar");
    const barText = bar?.querySelector<HTMLElement>(":scope > span") ?? null;
    if (bar !== null && barText !== null) {
      bar.className = "reason-bar ok";
      barText.textContent = t("Buraya bırakılabilir.");
    }
  }, [reason]);

  activate.current = (dragging: DragData) => {
    const wrap = document.querySelector<HTMLElement>(".grid-wrap");
    const table = wrap?.querySelector<HTMLTableElement>("table.grid") ?? null;
    const row =
      [...(table?.querySelectorAll<HTMLTableRowElement>("tbody tr") ?? [])].find(
        (candidate) => candidate.dataset.rowId === dragging.rowId,
      ) ?? null;

    dragTable.current = table;
    targetRow.current = row;

    // If the target row is off-screen the user can never reach it. React has
    // painted the table by the time this effect runs. Measure BEFORE adding
    // drag classes or the preview, while layout is still clean.
    //
    // 'center', not 'nearest': centring the row shows the neighbouring rows and
    // keeps the cursor out of the auto-scroll band (otherwise the grid drifts
    // while trying to drop).
    //
    // NOT when a placed block is being moved: the cursor is already on that row,
    // so centring it would yank the grid half a screen out from under the hand
    // that just pressed it.
    if (dragging.source === null && wrap !== null && row !== null) {
      const wrapBox = wrap.getBoundingClientRect();
      const rowBox = row.getBoundingClientRect();
      const headingBottom =
        table?.querySelector("thead")?.getBoundingClientRect().bottom ?? wrapBox.top;
      const visibleTop = Math.max(wrapBox.top, headingBottom);
      if (rowBox.top < visibleTop || rowBox.bottom > wrapBox.bottom) {
        row.scrollIntoView({ block: "center", inline: "nearest" });
      }
    }

    table?.classList.add("dragging");
    row?.classList.add("target-row");

    // Two flat overlays dim the visible rows above and below the target. CSS
    // opacity on every non-target row made Chromium raster ~24 wide layers at
    // drag start; two viewport-sized rectangles paint the same guidance once.
    const positionShades = () => {
      if (wrap === null || row === null || shades.current.length !== 2) return;
      const wrapBox = wrap.getBoundingClientRect();
      const rowBox = row.getBoundingClientRect();
      const headingBottom =
        table?.querySelector("thead")?.getBoundingClientRect().bottom ?? wrapBox.top;
      const top = Math.max(wrapBox.top, headingBottom);
      const splitTop = Math.max(top, Math.min(rowBox.top, wrapBox.bottom));
      const splitBottom = Math.max(top, Math.min(rowBox.bottom, wrapBox.bottom));
      const [above, below] = shades.current;
      for (const shade of shades.current) {
        shade.style.left = `${wrapBox.left}px`;
        shade.style.width = `${wrapBox.width}px`;
      }
      above!.style.top = `${top}px`;
      above!.style.height = `${Math.max(0, splitTop - top)}px`;
      below!.style.top = `${splitBottom}px`;
      below!.style.height = `${Math.max(0, wrapBox.bottom - splitBottom)}px`;
    };
    if (wrap !== null && row !== null) {
      shades.current = [document.createElement("div"), document.createElement("div")];
      for (const shade of shades.current) {
        shade.className = "drag-shade";
        document.body.appendChild(shade);
      }
      positionShades();
    }

    // A merged block has one <td> for several hours. Build the containment
    // lookup once, so highlighting never scans/query-selects the row again.
    if (row !== null) {
      for (const cell of row.querySelectorAll<HTMLElement>("td[data-day][data-hour]")) {
        const day = Number(cell.dataset.day);
        const hour = Number(cell.dataset.hour);
        const span = Math.max(1, Number(cell.dataset.span) || 1);
        for (let i = 0; i < span; i++) cellAt.current.set(`${day}|${hour + i}`, cell);
      }
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
    //
    // The day's own last (blockSize - 1) cells are looked up through
    // `clampToDay` rather than by their own raw hour: read literally, the
    // day's last empty hour is always a "dayEnd" rejection for anything wider
    // than one hour, which painted it red even where dropping there actually
    // succeeds (the block lands a bit earlier and still covers that hour).
    if (row !== null) {
      for (const cell of row.querySelectorAll<HTMLElement>(
        "td[data-day]",
      )) {
        const rawHour = Number(cell.dataset["hour"]);
        const hour = clampToDay(rawHour, dragging.blockSize, dragging.hourCount);
        const verdict = dragging.map.get(`${cell.dataset["day"]}|${hour}`);
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
    const findTarget = (
      x: number,
      y: number,
    ): { day: number; hour: number } | null => {
      const el = document
        .elementFromPoint(x, y)
        ?.closest<HTMLElement>("[data-day]");
      // Compare the element, not the id as a selector: ids can start with a
      // digit and escaping them in CSS is a chore.
      if (el == null || el.closest("tr") !== row) return null;
      const day = Number(el.dataset["day"]);
      const hour = Number(el.dataset["hour"]);
      return Number.isInteger(day) && Number.isInteger(hour)
        ? { day, hour }
        : null;
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
      // This callback is no longer pending. A pointer move or successful edge
      // scroll may request the next one below.
      loop.current = 0;
      const { x, y } = pos.current;
      const d = data.current;
      if (d === null) return;

      if (ghost.current !== null) {
        ghost.current.style.transform = `translate(${x}px, ${y}px)`;
      }

      const scrolled = scrollAtEdge(x, y);
      if (scrolled) positionShades();

      // The raw cell under the cursor, clamped so a block being placed near
      // the end of the day is read by the last start that still fits it
      // whole rather than by the literal hour the pointer sits over.
      const raw = findTarget(x, y);
      const target =
        raw === null
          ? null
          : { day: raw.day, hour: clampToDay(raw.hour, d.blockSize, d.hourCount) };
      const signature = target === null ? "" : `${target.day}|${target.hour}`;
      // If it scrolled, the cell under the cursor may have changed; look again.
      if (signature !== lastTarget.current || scrolled) {
        clearHighlight();
        lastTarget.current = signature;

        if (target === null) {
          setReason(null);
        } else {
          const verdict = d.map.get(signature);
          const blocked =
            verdict === undefined
              ? t("Bu hücreye bırakılamaz")
              : verdict.blocked;
          const warning = verdict?.warning ?? null;

          setReason(
            blocked !== null
              ? { text: blocked, level: "blocked" }
              : warning !== null
                ? { text: warning, level: "warn" }
                : null,
          );

          // Paint every cell the block will cover.
          const cls =
            blocked !== null ? HL_BLOCKED : warning !== null ? HL_WARN : HL_OK;
          for (let i = 0; i < d.blockSize; i++) {
            const hour = target.hour + i;
            // Two ways an hour can be on screen: as its own cell, or swallowed
            // by a cell to its left when a multi-hour block is drawn as one
            // (see Grid.tsx). Asking only the first way made the later hours of
            // such a block resolve to null — and the `break` below then stopped
            // painting the REST of the block too, with nothing to show for it.
            //
            // The swallowing cell is found by CONTAINMENT and not by a fixed
            // offset: a block is 1 to 3 hours wide, so "the cell one to the
            // left with span 2" only ever answered for the old pair (pitfalls
            // 60 and 85 — a position is found by what covers it, not by a
            // count).
            const el = cellAt.current.get(`${target.day}|${hour}`) ?? null;
            if (el == null) break;
            // A merged cell can answer for both of its hours; painting it twice
            // would also push it onto the cleanup list twice.
            if (!highlighted.current.includes(el)) {
              el.classList.add(cls);
              highlighted.current.push(el);
            }
          }
        }
      }

      if (scrolled) scheduleFrame();
    };

    const scheduleFrame = () => {
      if (loop.current === 0) loop.current = requestAnimationFrame(frame);
    };
    scheduleFrame();

    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      scheduleFrame();
    };

    const onUp = (e: PointerEvent) => {
      const d = data.current;
      const raw = findTarget(e.clientX, e.clientY);
      const target =
        raw === null || d === null
          ? null
          : { day: raw.day, hour: clampToDay(raw.hour, d.blockSize, d.hourCount) };
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
      if (e.key === "Escape") finish();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("keydown", onKey);
    detach.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("keydown", onKey);
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

  return { start, reason };
}
