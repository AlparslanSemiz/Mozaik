// The week sized to the box, and never a lesson cut (Sadeleşme K6, 2026-11-16).
//
// The stylesheet derives the column from the box (`--wrap-w`, written here)
// and holds it at no less than `--cell-min`: what the widest lesson needs to be
// read whole at its size, 12px at the default scale and never under 11px. When
// 72 such columns do not go into the box (Windows %125 or %150, a 1366 screen),
// the table is wider than the box and the grid scrolls sideways with its heads
// sticky, rather than drawing "4…". Until 2026-11-16 a line that did not fit
// was drawn smaller, down to 9px (the user's choice of 2026-09-26), and in
// those boxes 317 of 376 cards still read "4…".
//
// The floor is MEASURED from the text, not written down: the father's class
// names are "411A" (first word only, styles.css), the sample school's "310",
// and an hour heading reads "12". Each card line's text is read against the
// room its cell gives it (the cell's width minus the line's box, i.e. the
// card's padding and border), a block's over the columns it spans. Text in a
// `nowrap` line does not depend on the column's width, so writing the floor
// cannot change what it measured.
//
// Pure DOM and attached once, like gridChrome.ts and for the same reason
// (pitfall 1): nothing here goes through React. It runs when the text can
// change (a React commit), the size it is drawn at (the scale on <html>, the
// embedded font arriving), and never during a drag, which changes classes only
// and is not observed.

/** The card lines, and the hour numbers in the heading. */
const LINES = 'tbody .card-top, tbody .card-bottom, thead th[data-col]';

/** A row head's two lines: the name and what it teaches or where it sits. */
const HEADS = 'tbody .row-head .inspect, tbody .row-head .secondary';

/** Air around an hour number: a heading has no card padding to give it. */
const HEAD_AIR = 4;

function floorOf(table: HTMLElement, lines: string): number {
  const range = document.createRange();
  let most = 0;
  for (const line of table.querySelectorAll<HTMLElement>(lines)) {
    const cell = line.closest<HTMLTableCellElement>('td, th');
    if (cell === null) continue;
    range.selectNodeContents(line);
    const text = range.getBoundingClientRect().width;
    if (text === 0) continue;
    // The heading cell IS the line; a card line sits inside the card's padding.
    // A day's first column is given the day rule's width on top of --cell-w
    // (styles.css), so the rule is not the lesson's to pay for.
    const rule = cell.classList.contains('day-first')
      ? Number.parseFloat(getComputedStyle(cell).borderLeftWidth) || 0
      : 0;
    // A row head's line may be narrower than its cell (an inline button), so
    // what is around it is the head's own padding and border, read as such;
    // asking the boxes would hand back the slack and grow the head each run.
    const style = getComputedStyle(cell);
    const around = cell.classList.contains('row-head')
      ? ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce(
          (sum, k) => sum + (Number.parseFloat(style[k as 'paddingLeft']) || 0),
          0,
        )
      : cell === line
        ? HEAD_AIR
        : cell.getBoundingClientRect().width - line.getBoundingClientRect().width - rule;
    most = Math.max(most, (text + around) / Math.max(1, cell.colSpan));
  }
  return Math.ceil(most);
}

/** Attaches the floor and the box's width to a `.grid-wrap`. Returns the detach function. */
export function attachGridFit(wrap: HTMLElement): () => void {
  let frame = 0;
  const run = () => {
    const table = wrap.querySelector<HTMLElement>('table.grid');
    // A hidden tab has no widths; the ResizeObserver brings it back here.
    if (table === null || table.getClientRects().length === 0) return;
    const floor = floorOf(table, LINES);
    if (floor > 0) table.style.setProperty('--cell-min', `${floor}px`);
    // The row head the same way: "Mat1 · Mat2" and "derslik yok" whole.
    const head = floorOf(table, HEADS);
    if (head > 0) table.style.setProperty('--head-min', `${head}px`);
  };
  const schedule = () => {
    if (frame !== 0) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      run();
    });
  };

  // The box's own width, as a number the stylesheet can use (--cell-w). It
  // used to be `100cqw`, and a size resolved against the container is redone
  // for every cell whenever the container is laid out: a drag writes the
  // reason bar and so lays out the page, 53ms a time on the father's week.
  // The same value as a px number: 2554ms of layout in a sweep down to 185
  // (2026-09-26, pitfall 141).
  const resize = new ResizeObserver(([entry]) => {
    const width = entry?.contentBoxSize[0]?.inlineSize;
    if (width !== undefined) wrap.style.setProperty('--wrap-w', `${width}px`);
    schedule();
  });
  resize.observe(wrap);
  // Text and rows, not attributes: a drag toggles classes on every move, and
  // the `--cell-min` this writes is an attribute too.
  const content = new MutationObserver(schedule);
  content.observe(wrap, { childList: true, subtree: true, characterData: true });
  const prefs = new MutationObserver(schedule);
  prefs.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
  void document.fonts?.ready.then(schedule);
  schedule();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    content.disconnect();
    prefs.disconnect();
  };
}
