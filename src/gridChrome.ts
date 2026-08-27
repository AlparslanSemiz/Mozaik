// Grid chrome: the crosshair beam and the sticky-head shadow.
//
// Both are pure DOM, driven by listeners attached once — the same discipline
// drag.ts follows and for the same reason (pitfall 1): the grid is ~2100 cells
// behind React.memo, and a pointermove that sets React state would redraw the
// table on every mouse pixel. Nothing here calls into React at all.
//
// WHY a crosshair exists in a tool that bans decoration: the week is 78 columns
// wide, the sticky heading is at the top and the teacher is at the far left, so
// finding "which hour is this cell" means tracing a finger up a column of 25
// rows. That is the movement people make on the PRINTED timetable this replaces.
// It is also the one thing that helps most with the eyesight this is built for.
//
// The column is lit by putting a class on its cells, not by sliding a highlight
// element under them. The overlay was tried first and does not work here: every
// body cell paints an opaque background (--paper, or --band on alternate days),
// so anything behind them is invisible, and anything in FRONT of them would
// tint the colour blocks and eat the pointerdown that starts a drag. Writing a
// class on ~25 cells costs one style recalc and only when the column CHANGES,
// not on every mouse pixel.
//
// Two things are deliberately left alone: a closed hour keeps its hatch (the
// crosshair must not hide why a cell cannot be used), and during a drag the
// crosshair switches off entirely.

/** Attaches the chrome to a `.grid-wrap`. Returns the detach function. */
export function attachGridChrome(wrap: HTMLElement): () => void {
  let lit: Element[] = [];
  let litColumn = -1;

  function clear() {
    for (const el of lit) el.classList.remove('col-hot');
    lit = [];
    litColumn = -1;
  }

  function move(e: PointerEvent) {
    const table = wrap.querySelector('table.grid');
    // While a block is being dragged the grid has its own highlighting — a
    // target row, and green/yellow/red cells. A second one competing with it
    // would say less, not more.
    if (table === null || table.classList.contains('dragging')) {
      clear();
      return;
    }

    const target = e.target as Element | null;
    const cell = target?.closest?.('td[data-day]') as HTMLTableCellElement | null;
    if (cell === null || cell === undefined || !wrap.contains(cell)) {
      clear();
      return;
    }

    // WHICH COLUMN, asked of the cell rather than counted off the row.
    //
    // This used to be `cell.cellIndex` plus two `:nth-child()` selectors, and it
    // was right for as long as every row had one <td> per hour. It stopped being
    // right the day a two-hour block became ONE <td> with colSpan 2: a row with
    // a double to the left of the pointer holds fewer cells than the week has
    // hours, so `cellIndex` came out short, `:nth-child` lit a column LEFT of
    // the pointer in every row that had no double there, and the hour heading
    // lit the wrong hour. Nothing threw, nothing changed a count, and the whole
    // suite stayed green — "önizleme artısı kaymış" (pitfall 85).
    //
    // `data-col` is written by Grid.tsx on both the body cells and the hour
    // headings, so the answer no longer depends on how the row is CUT UP.
    const raw = cell.dataset.col;
    if (raw === undefined) {
      clear();
      return;
    }
    const column = Number(raw);
    if (column === litColumn) return;
    clear();

    // A merged block is lit by the column it COVERS, not by the one it starts
    // at — the same "which cell is the pointer inside" question rowDrag.ts had
    // to answer with containment rather than with an index (pitfall 60).
    lit = [
      ...table.querySelectorAll(`tbody td[data-col="${column}"]`),
      ...table.querySelectorAll(`tbody td[data-col="${column - 1}"][data-span="2"]`),
      ...table.querySelectorAll(`thead th[data-col="${column}"]`),
    ];
    for (const el of lit) el.classList.add('col-hot');
    litColumn = column;
  }

  // The sticky heading and the sticky teacher column are only "on top of"
  // something once there is something under them. Drawing their shadow before
  // that is the "an element that looks like it is floating is wrong" mistake
  // the old rule was written against.
  function scrolled() {
    wrap.classList.toggle('scrolled-y', wrap.scrollTop > 0);
    wrap.classList.toggle('scrolled-x', wrap.scrollLeft > 0);
  }

  wrap.addEventListener('pointermove', move);
  wrap.addEventListener('pointerleave', clear);
  wrap.addEventListener('pointerdown', clear);
  wrap.addEventListener('scroll', scrolled, { passive: true });
  scrolled();

  return () => {
    wrap.removeEventListener('pointermove', move);
    wrap.removeEventListener('pointerleave', clear);
    wrap.removeEventListener('pointerdown', clear);
    wrap.removeEventListener('scroll', scrolled);
    clear();
  };
}
