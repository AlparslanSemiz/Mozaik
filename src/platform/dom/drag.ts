// Drag and drop: Pointer Events. HTML5 drag-and-drop is NOT used.
//
// Why (docs/TRAPS.md pitfall 1): with HTML5 DnD a re-render during the drag
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

import { t } from '../../leaf/i18n';
import { useCallback, useEffect, useRef } from 'react';
import type React from 'react';
import type { DropVerdict, BlockRef } from '../../pure/constraints';
import { cellKey, paletteColor, type Id } from '../../leaf/model';

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
   * `cellKey(day, hour)` -> verdict. `blocked === null` means droppable.
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

/** What the bar above the grid says, and how loudly. */
interface Reason {
  text: string;
  level: 'ok' | 'warn' | 'blocked';
}

/**
 * A move made from the KEYBOARD (DENETIM KS8, the pool's "klavye yolu"). The
 * same drag, the same map and the same painting; only the hand differs: arrow
 * keys walk a target along the row instead of a pointer, Enter lets go, Esc
 * puts it back. Nothing here decides where a lesson may go — that is still
 * `dropMap`, computed once when the card is picked up (pitfall 2).
 */
export interface KeyMove {
  /** The block's own start when a placed block is moved; null = the first droppable hour. */
  at: { day: number; hour: number } | null;
  /** How a position is said: "Salı 3. saat". */
  place: (day: number, hour: number) => string;
  /** Said once, when the card is picked up: what is in the hand and which keys put it down. */
  intro: string;
  /** Enter on a refused cell: the reason, said again. */
  onRefuse: (why: string) => void;
  /** Ended without a drop: Esc, Tab, a click or another key. `byTab`: focus is already leaving. */
  onCancel: (byTab: boolean) => void;
  /** Let go on a droppable cell, after `drop()` has run. */
  onDrop: (day: number, hour: number) => void;
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

/**
 * THE REASON BAR IS REWRITTEN AT MOST THIS OFTEN (ms), AND THAT IS A FRAME
 * BUDGET DECISION, NOT A TASTE ONE.
 *
 * "bir kartı kırmızı sarı veya yeşil blokların üzerinden gezdirirken çok kasma
 * oluyor" — the complaint came twice. The first round (2026-09-01) measured the
 * START of a drag and made it three times faster, which was true and was not
 * the cause. Measured per POINTER MOVE instead (2026-09-12, sample school,
 * auto-filled grid, 4x CPU, full trace):
 *
 *   dropped frames ..... 9.6-15%        main thread ~100% busy
 *   Layout ............. 5.37 ms x 108   partialLayout: false, 6704 objects
 *   Paint .............. 5.24 ms x 387   full viewport
 *
 * Every one of those 108 layouts is THIS bar. Writing the sentence replaces a
 * text node inside a `nowrap` + `ellipsis` flex item, the box can then change
 * width, and Blink relays out from `#document` — a full document layout for one
 * short sentence, once per target cell. Removing the write took dropped frames
 * from 12% to 0%; the className write next to it costs nothing and was cleared
 * by the same experiment. Two cheap CSS answers were tried BEFORE this one and
 * both measured no better than baseline (`contain: layout` on the bar,
 * `flex: 1 1 0` on the span) — the layout root stayed at the document.
 *
 * So the fix is the rate, not the mechanism: 100 ms holds dropped frames at
 * 1.5-3.4% and Layout at 194 ms / 38 against 558 ms / 108. Nobody reads a
 * sentence sixty times a second — the CELL under the cursor answers instantly
 * (its outline is painted the same frame), and the bar is the slower, wordier
 * half of the same answer. Measurements in docs/TESTFINDINGS.md, 2026-09-12.
 */
const REASON_GAP = 100;

/** How long a refused drop's reason stays on the bar after the hand let go (ms). */
const REFUSAL_STAYS = 5500;

export function useDrag(
  drop: (data: DragData, day: number, hour: number) => void,
  /** The pointer let go on a cell that refuses: why. The keyboard says the same through `KeyMove.onRefuse`. */
  onRefuse?: (why: string) => void,
) {
  const data = useRef<DragData | null>(null);
  const ghost = useRef<HTMLDivElement | null>(null);
  const highlighted = useRef<HTMLElement[]>([]);
  const previewed = useRef<HTMLElement[]>([]);
  const lastTarget = useRef<string>('');
  const pos = useRef({ x: 0, y: 0 });
  const loop = useRef(0);
  const dragTable = useRef<HTMLTableElement | null>(null);
  const targetRow = useRef<HTMLTableRowElement | null>(null);
  const cellAt = useRef(new Map<string, HTMLElement>());
  const shades = useRef<HTMLElement[]>([]);
  const activate = useRef<(d: DragData, keys: KeyMove | null) => void>(() => undefined);
  const detach = useRef<() => void>(() => undefined);
  const savedBar = useRef<{
    element: HTMLElement;
    className: string;
    text: string;
  } | null>(null);
  /**
   * The throttle's whole state. `pending` is what the bar WOULD say if it were
   * free to say it, and it is kept as a pair: the colour and the sentence are
   * one answer, so letting the class through early would leave the bar green
   * while it still reads a red sentence.
   */
  /** A refused drop's reason, kept on the bar for a few seconds (`finish`). */
  const refusal = useRef<{
    why: string | null;
    timer: ReturnType<typeof setTimeout> | null;
    settle: (() => void) | null;
  }>({ why: null, timer: null, settle: null });
  const barPace = useRef<{
    last: number;
    timer: ReturnType<typeof setTimeout> | null;
    pending: { className: string; text: string } | null;
  }>({ last: 0, timer: null, pending: null });

  const clearHighlight = useCallback(() => {
    for (const el of highlighted.current) el.classList.remove(HL_OK, HL_WARN, HL_BLOCKED);
    highlighted.current = [];
    lastTarget.current = '';
  }, []);

  // React will NOT undo these for us: they are deliberately painted directly
  // so a drag does not redraw the memoised grid.
  const clearPreview = useCallback(() => {
    for (const el of previewed.current) el.classList.remove(PV_OK, PV_WARN, PV_NO);
    previewed.current = [];
  }, []);

  const finish = useCallback(() => {
    cancelAnimationFrame(loop.current);
    loop.current = 0;
    detach.current();
    detach.current = () => undefined;
    clearHighlight();
    clearPreview();
    targetRow.current?.classList.remove('target-row');
    dragTable.current?.classList.remove('dragging');
    targetRow.current = null;
    dragTable.current = null;
    cellAt.current.clear();
    for (const shade of shades.current) shade.remove();
    shades.current = [];
    ghost.current?.remove();
    ghost.current = null;
    data.current = null;
    // A pending sentence must not land on a bar that has already gone back to
    // what the screen owns. The timer outlives the drag otherwise, and what it
    // would write is a verdict about a card nobody is holding any more.
    if (barPace.current.timer !== null) clearTimeout(barPace.current.timer);
    barPace.current = { last: 0, timer: null, pending: null };
    if (savedBar.current !== null) {
      const saved = savedBar.current;
      savedBar.current = null;
      const text = saved.element.querySelector<HTMLElement>(':scope > span');
      const restore = () => {
        saved.element.className = saved.className;
        if (text !== null) text.textContent = saved.text;
      };
      const why = refusal.current.why;
      refusal.current.why = null;
      if (why === null || text === null) {
        restore();
      } else {
        // A refused drop keeps its reason on the bar: the sentence was red
        // under the hand the whole time and vanished the moment it let go.
        // Put back only if nothing else wrote the bar meanwhile (a run, a
        // result): React owns the text and has already said what it says.
        saved.element.className = 'reason-bar bad';
        text.textContent = why;
        const settle = () => {
          if (refusal.current.timer !== null) clearTimeout(refusal.current.timer);
          refusal.current.timer = null;
          refusal.current.settle = null;
          if (text.textContent === why) restore();
        };
        refusal.current.settle = settle;
        refusal.current.timer = setTimeout(settle, REFUSAL_STAYS);
      }
    }
  }, [clearHighlight, clearPreview]);

  const paintReason = (reason: Reason | null, where: string | null = null) => {
    const bar = savedBar.current?.element ?? null;
    const text = bar?.querySelector<HTMLElement>(':scope > span') ?? null;
    if (bar === null || text === null) return;

    const wanted = {
      className:
        reason === null
          ? 'reason-bar ok'
          : reason.level === 'warn'
            ? 'reason-bar warn'
            : 'reason-bar bad',
      text: (where === null ? '' : `${where}: `) + (reason?.text ?? t('Buraya bırakılabilir.')),
    };

    const write = (say: { className: string; text: string }) => {
      // Writing the same sentence again is not free — `textContent` replaces
      // the text node whatever it held — and a sweep across a row of the same
      // teacher's blocks asks for the same sentence many times over.
      if (bar.className !== say.className) bar.className = say.className;
      if (text.textContent !== say.text) text.textContent = say.text;
      barPace.current.last = performance.now();
      barPace.current.pending = null;
    };

    const since = performance.now() - barPace.current.last;
    if (since >= REASON_GAP) {
      if (barPace.current.timer !== null) {
        clearTimeout(barPace.current.timer);
        barPace.current.timer = null;
      }
      write(wanted);
      return;
    }

    // Too soon: remember the newest answer and make sure it lands. THE TRAILING
    // WRITE IS THE POINT — without it the hand stops on a cell whose sentence
    // was never written, and the bar quietly describes the cell BEFORE it.
    barPace.current.pending = wanted;
    if (barPace.current.timer === null) {
      barPace.current.timer = setTimeout(() => {
        barPace.current.timer = null;
        const say = barPace.current.pending;
        // `finish()` clears both the timer and the pending answer, so this only
        // ever runs while a drag is still holding the bar.
        if (say !== null && savedBar.current !== null) write(say);
      }, REASON_GAP - since);
    }
  };

  // Every answer is imperative. Red/yellow targets used to call setState
  // here and redraw Program while the pointer crossed the row.
  function holdBar(first: string) {
    // The last refusal's reason is still on the bar: put the real text back
    // first, or it would be saved as the text to return to.
    refusal.current.settle?.();
    const bar = document.querySelector<HTMLElement>('.reason-bar');
    const barText = bar?.querySelector<HTMLElement>(':scope > span') ?? null;
    if (bar !== null && barText !== null) {
      savedBar.current = {
        element: bar,
        className: bar.className,
        text: barText.textContent ?? '',
      };
      bar.className = 'reason-bar ok';
      barText.textContent = first;
    }
  }

  const start = useCallback((e: React.PointerEvent, d: DragData, content: GhostContent) => {
    if (e.button !== 0) return;
    e.preventDefault();

    data.current = d;
    pos.current = { x: e.clientX, y: e.clientY };

    const el = document.createElement('div');
    el.className = 'ghost';
    el.style.background = paletteColor(content.color);
    // AS WIDE AS WHAT IT WILL COVER. The ghost was one cell wide whatever the
    // block was, while the highlight below it ran `blockSize` cells to the
    // RIGHT — so on a double the card sat half a cell left of the pair it was
    // about to fill, and the card lifted off the tray (twice as wide there,
    // `[data-size='2']`) shrank in the hand. The offset does not change: the
    // ghost's LEFT edge stays half a cell left of the pointer, which is the
    // left edge of the target cell.
    el.style.setProperty('--ghost-span', String(Math.max(1, d.blockSize)));
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

    holdBar(t('Buraya bırakılabilir.'));
    activate.current(d, null);
  }, []);

  /** The same move, picked up from the keyboard. No ghost: the highlight is the hand. */
  const startKeys = useCallback((d: DragData, keys: KeyMove) => {
    if (data.current !== null) return;
    data.current = d;
    holdBar(keys.intro);
    activate.current(d, keys);
  }, []);

  activate.current = (dragging: DragData, keys: KeyMove | null) => {
    const wrap = document.querySelector<HTMLElement>('.grid-wrap');
    const table = wrap?.querySelector<HTMLTableElement>('table.grid') ?? null;
    const row =
      [...(table?.querySelectorAll<HTMLTableRowElement>('tbody tr') ?? [])].find(
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
        table?.querySelector('thead')?.getBoundingClientRect().bottom ?? wrapBox.top;
      const visibleTop = Math.max(wrapBox.top, headingBottom);
      if (rowBox.top < visibleTop || rowBox.bottom > wrapBox.bottom) {
        row.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    }

    table?.classList.add('dragging');
    row?.classList.add('target-row');

    // Two flat overlays dim the visible rows above and below the target. CSS
    // opacity on every non-target row made Chromium raster ~24 wide layers at
    // drag start; two viewport-sized rectangles paint the same guidance once.
    const positionShades = () => {
      if (wrap === null || row === null || shades.current.length !== 2) return;
      const wrapBox = wrap.getBoundingClientRect();
      const rowBox = row.getBoundingClientRect();
      const headingBottom =
        table?.querySelector('thead')?.getBoundingClientRect().bottom ?? wrapBox.top;
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
      shades.current = [document.createElement('div'), document.createElement('div')];
      for (const shade of shades.current) {
        shade.className = 'drag-shade';
        document.body.appendChild(shade);
      }
      positionShades();
    }

    // A merged block has one <td> for several hours. Build the containment
    // lookup once, so highlighting never scans/query-selects the row again.
    if (row !== null) {
      for (const cell of row.querySelectorAll<HTMLElement>('td[data-day][data-hour]')) {
        const day = Number(cell.dataset.day);
        const hour = Number(cell.dataset.hour);
        const span = Math.max(1, Number(cell.dataset.span) || 1);
        for (let i = 0; i < span; i++) cellAt.current.set(cellKey(day, hour + i), cell);
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
      for (const cell of row.querySelectorAll<HTMLElement>('td[data-day]')) {
        const rawHour = Number(cell.dataset['hour']);
        const hour = clampToDay(rawHour, dragging.blockSize, dragging.hourCount);
        const verdict = dragging.map.get(`${cell.dataset['day']}|${hour}`);
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
      // Compare the element, not the id as a selector: ids can start with a
      // digit and escaping them in CSS is a chore.
      if (el == null || el.closest('tr') !== row) return null;
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

    /**
     * Paint one target: the cells the block would cover and the bar's answer.
     * `where` is said in front of the answer when the hand is the keyboard,
     * because then nothing on screen is under a pointer to say which cell.
     */
    const show = (
      d: DragData,
      target: { day: number; hour: number } | null,
      where: string | null,
    ) => {
      if (target === null) {
        paintReason(null, where);
      } else {
        const verdict = d.map.get(cellKey(target.day, target.hour));
        const blocked = verdict === undefined ? t('Bu hücreye bırakılamaz') : verdict.blocked;
        const warning = verdict?.warning ?? null;

        paintReason(
          blocked !== null
            ? { text: blocked, level: 'blocked' }
            : warning !== null
              ? { text: warning, level: 'warn' }
              : null,
          where,
        );

        // Paint every cell the block will cover.
        const cls = blocked !== null ? HL_BLOCKED : warning !== null ? HL_WARN : HL_OK;
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
          const el = cellAt.current.get(cellKey(target.day, hour)) ?? null;
          if (el == null) break;
          // A merged cell can answer for both of its hours; painting it twice
          // would also push it onto the cleanup list twice.
          if (!highlighted.current.includes(el)) {
            el.classList.add(cls);
            highlighted.current.push(el);
          }
        }
      }
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
      const signature = target === null ? '' : cellKey(target.day, target.hour);
      // If it scrolled, the cell under the cursor may have changed; look again.
      if (signature !== lastTarget.current || scrolled) {
        clearHighlight();
        lastTarget.current = signature;

        show(d, target, null);
      }

      if (scrolled) scheduleFrame();
    };

    const scheduleFrame = () => {
      if (loop.current === 0) loop.current = requestAnimationFrame(frame);
    };
    // ANY scroll, not only the edge scroll above. The shades are `fixed` and
    // placed in viewport pixels, so a wheel turned with a card in the hand
    // moved the row and left the open strip where the screen had it. Capture
    // on the window hears the grid's own scroll as well as the page's; the cell
    // under the cursor changes with it, so the frame looks again.
    const onScroll = () => {
      positionShades();
      if (keys !== null) return;
      lastTarget.current = '';
      scheduleFrame();
    };

    if (keys !== null) {
      attachKeys(dragging, keys, row, show, positionShades, onScroll);
      return;
    }
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
      // A warning does not stop the drop; only `blocked` does. A refusal is
      // said, as the keyboard says it (`onRefuse`), and stays on the bar.
      const verdict =
        d !== null && target !== null ? d.map.get(cellKey(target.day, target.hour)) : undefined;
      if (d !== null && target !== null) {
        if (verdict?.blocked === null) {
          drop(d, target.day, target.hour);
        } else {
          const why = verdict?.blocked ?? t('Bu hücreye bırakılamaz');
          refusal.current.why = why;
          onRefuse?.(why);
        }
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
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll);
    detach.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', finish);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
    };
  };

  /**
   * The keyboard's hand. The stops are the block STARTS that keep the whole
   * block inside its day, in the order the row draws them, so ← → walk the
   * week hour by hour and never land on an hour `clampToDay` would rewrite.
   */
  function attachKeys(
    dragging: DragData,
    keys: KeyMove,
    row: HTMLTableRowElement | null,
    show: (d: DragData, target: { day: number; hour: number } | null, where: string | null) => void,
    positionShades: () => void,
    onScroll: () => void,
  ) {
    const stops: Array<{ day: number; hour: number }> = [];
    for (const cell of row?.querySelectorAll<HTMLElement>('td[data-day][data-hour]') ?? []) {
      const day = Number(cell.dataset.day);
      const first = Number(cell.dataset.hour);
      const span = Math.max(1, Number(cell.dataset.span) || 1);
      for (let i = 0; i < span; i++) {
        if (first + i + dragging.blockSize <= dragging.hourCount) {
          stops.push({ day, hour: first + i });
        }
      }
    }
    const end = (byTab = false) => {
      finish();
      keys.onCancel(byTab);
    };
    if (stops.length === 0) {
      // The row is hidden, or the week has no hour long enough. Nothing to aim at.
      finish();
      keys.onRefuse(t('Bu dersin satırı ekranda değil.'));
      return;
    }

    const droppable = (i: number) => {
      const stop = stops[i]!;
      return dragging.map.get(cellKey(stop.day, stop.hour))?.blocked === null;
    };
    const at = keys.at;
    let index = Math.max(
      0,
      at === null
        ? stops.findIndex((_, i) => droppable(i))
        : stops.findIndex((x) => x.day === at.day && x.hour === at.hour),
    );

    const go = (next: number) => {
      index = Math.max(0, Math.min(stops.length - 1, next));
      const stop = stops[index]!;
      clearHighlight();
      show(dragging, stop, keys.place(stop.day, stop.hour));
      cellAt.current
        .get(cellKey(stop.day, stop.hour))
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      positionShades();
    };
    /** The next stop in `step`'s direction that takes the drop, or where we are. */
    const nextDroppable = (step: number) => {
      for (let i = index + step; i >= 0 && i < stops.length; i += step) if (droppable(i)) return i;
      return index;
    };
    /** The same hour (or the nearest one) on the neighbouring day the row draws. */
    const otherDay = (step: number) => {
      const here = stops[index]!;
      let i = index;
      while (i >= 0 && i < stops.length && stops[i]!.day === here.day) i += step;
      if (i < 0 || i >= stops.length) return index;
      const day = stops[i]!.day;
      let best = i;
      for (let j = i; j >= 0 && j < stops.length && stops[j]!.day === day; j += step) {
        if (stops[j]!.hour === here.hour) return j;
        if (Math.abs(stops[j]!.hour - here.hour) < Math.abs(stops[best]!.hour - here.hour)) {
          best = j;
        }
      }
      return best;
    };
    const dayEdge = (step: number) => {
      const day = stops[index]!.day;
      let i = index;
      while (stops[i + step]?.day === day) i += step;
      return i;
    };

    const onKeys = (e: KeyboardEvent) => {
      const k = e.key;
      // A modifier on its own is half of a chord, not an answer: Ctrl is
      // pressed before the → of Ctrl+→.
      if (k === 'Control' || k === 'Shift' || k === 'Alt' || k === 'Meta') return;
      if (k === 'Tab') {
        end(true);
        return;
      }
      // The Enter that picked the card up, held down: it must not drop it too.
      if (e.repeat && (k === 'Enter' || k === ' ')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (k === 'Escape') end();
      else if (k === 'ArrowRight') go(e.ctrlKey ? nextDroppable(1) : index + 1);
      else if (k === 'ArrowLeft') go(e.ctrlKey ? nextDroppable(-1) : index - 1);
      else if (k === 'ArrowDown') go(otherDay(1));
      else if (k === 'ArrowUp') go(otherDay(-1));
      else if (k === 'Home') go(dayEdge(-1));
      else if (k === 'End') go(dayEdge(1));
      else if (k === 'Enter' || k === ' ') {
        const stop = stops[index]!;
        const verdict = dragging.map.get(cellKey(stop.day, stop.hour));
        if (verdict?.blocked === null) {
          drop(dragging, stop.day, stop.hour);
          finish();
          keys.onDrop(stop.day, stop.hour);
        } else {
          keys.onRefuse(verdict?.blocked ?? t('Bu hücreye bırakılamaz'));
        }
      } else if (e.ctrlKey || e.metaKey || e.altKey) {
        // Ctrl+Z, Alt+5 and the rest would change the plan or the screen under
        // a map computed for this one: the card goes back first.
        end();
        return;
      } else if (k.length > 1 && k !== 'Delete' && k !== 'Backspace') {
        return; // Shift, CapsLock and the like are not an answer
      }
      e.preventDefault();
      e.stopPropagation();
    };
    const onPointer = () => end();

    window.addEventListener('keydown', onKeys, { capture: true });
    window.addEventListener('pointerdown', onPointer, { capture: true });
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll);
    detach.current = () => {
      window.removeEventListener('keydown', onKeys, { capture: true });
      window.removeEventListener('pointerdown', onPointer, { capture: true });
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
    };

    // The first answer goes after the intro the bar already holds, in ONE
    // write, so a screen reader hears what was picked up and where it would go.
    go(index);
    const stop = stops[index]!;
    const verdict = dragging.map.get(cellKey(stop.day, stop.hour));
    const text = savedBar.current?.element.querySelector<HTMLElement>(':scope > span') ?? null;
    if (text !== null) {
      const answer =
        verdict === undefined
          ? t('Bu hücreye bırakılamaz')
          : (verdict.blocked ?? verdict.warning ?? t('Buraya bırakılabilir.'));
      text.textContent = `${keys.intro} ${keys.place(stop.day, stop.hour)}: ${answer}`;
    }
  }

  useEffect(
    () => () => {
      // Activity tears this tree down while Program is hidden. Treat that just
      // like Escape so no body-level ghost or painted cell survives the tab.
      finish();
    },
    [finish],
  );

  return { start, startKeys };
}
