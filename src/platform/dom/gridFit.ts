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

/** Air between one card's number and the next's: "412" "412" "320" ran into
 * "412412320" at 1366 and %150, where the column sits at its floor and the
 * digits touch the card's edge (3rd audit). Added to a card line only. */
const CARD_AIR = 3;

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
    // On the left that is everything before the text: the padding, and on the
    // name line the colour dot too, which a surname (2026-11-16) is long
    // enough to be pushed off by ("Duman" drew as "…").
    const style = getComputedStyle(cell);
    const around = cell.classList.contains('row-head')
      ? range.getBoundingClientRect().left -
        cell.getBoundingClientRect().left +
        ['paddingRight', 'borderRightWidth'].reduce(
          (sum, k) => sum + (Number.parseFloat(style[k as 'paddingRight']) || 0),
          0,
        )
      : cell === line
        ? HEAD_AIR
        : cell.getBoundingClientRect().width -
          line.getBoundingClientRect().width -
          rule +
          CARD_AIR;
    most = Math.max(most, (text + around) / Math.max(1, cell.colSpan));
  }
  return Math.ceil(most);
}

/** Attaches the floor and the box's width to a `.grid-wrap`. Returns the detach function. */
export function attachGridFit(wrap: HTMLElement): () => void {
  let frame = 0;
  // THE FIRST FLOOR IS WRITTEN AFTER THE FIRST PAINT, with the table hidden
  // until then (`data-fitting`, styles.css). Written in the first frame, the
  // same two properties cost a style pass over the whole grid and a table
  // layout of ~270 ms at 4x CPU on the father's week; in the frame after the first paint, 35 ms
  // (2026-11-16, measured both ways, pitfall 221). The table keeps its place
  // while hidden, so nothing around it moves, and it is never drawn without
  // its floor.
  wrap.dataset.fitting = '';
  let painted = false;
  let wait = 0;
  let first = requestAnimationFrame(() => {
    first = 0;
    wait = window.setTimeout(() => {
      painted = true;
      schedule();
      // Here and not at attach: asking `document.fonts` brings the page's
      // style and layout up to date, and at attach that was the first layout,
      // run before the drawer had written its height.
      void document.fonts?.ready.then(schedule);
    }, 0);
  });
  const run = () => {
    const table = wrap.querySelector<HTMLElement>('table.grid');
    // A hidden tab has no widths; the ResizeObserver brings it back here. The
    // table is not kept transparent for that: a tab shown later is drawn the
    // way it always was.
    if (table === null || table.getClientRects().length === 0) {
      delete wrap.dataset.fitting;
      return;
    }
    // Both are read before either is written. A write between the two reads
    // made the second one lay the whole table out again: on the father's week
    // at 4x CPU that was a style pass over 3348 elements and a table layout,
    // ~250 ms of the first frame (2026-11-16). Neither depends on the other:
    // the row head's text and padding do not move with --cell-min, nor a card
    // line's with --head-min.
    const floor = floorOf(table, LINES);
    // The row head the same way: "Mat1 · Mat2" and "derslik yok" whole.
    const head = floorOf(table, HEADS);
    if (floor > 0) table.style.setProperty('--cell-min', `${floor}px`);
    if (head > 0) table.style.setProperty('--head-min', `${head}px`);
    delete wrap.dataset.fitting;
  };
  const schedule = () => {
    if (!painted || frame !== 0) return;
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

  return () => {
    cancelAnimationFrame(first);
    clearTimeout(wait);
    cancelAnimationFrame(frame);
    delete wrap.dataset.fitting;
    resize.disconnect();
    content.disconnect();
    prefs.disconnect();
  };
}
