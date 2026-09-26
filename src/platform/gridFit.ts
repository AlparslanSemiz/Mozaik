// Sığdır: a card line that does not fit is drawn smaller, not cut.
//
// Sığdır derives the column from the box (styles.css), so a card is as wide as
// the week allows and no wider. The father's class names are "411A SAY" and
// his subject shorts "Mat1": at 1920 a one-hour card is 24.5px and holds three
// characters at 12px, and at Windows %125 (1536 CSS px) it is 19.2px and not
// even "310" (21px) goes in. Measured on 2026-09-26: 204 of 211 cards on his
// (anonymised) week and 315 of 374 on the sample school at %125 read "4…".
//
// The user chose (2026-09-26): only in Sığdır, only the line that does not
// fit, and never below 9px at the default scale. This writes a ratio, not a
// size — `--fit` — and styles.css multiplies the line's own size by it while
// holding the line HEIGHT at the unshrunk size, so a row never changes height
// because its cards got smaller.
//
// Pure DOM and attached once, like gridChrome.ts and for the same reason
// (pitfall 1): nothing here goes through React. It runs when what it measures
// can change — the table's text (a React commit), the box (a resize, the tab
// coming back into view), the density or the scale (attributes on <html>),
// and the embedded font arriving — and never during a drag, which changes
// classes only and is not observed.

/** The lines that may shrink: both card lines and the row head's second line. */
const LINES = 'tbody .card-top, tbody .card-bottom, tbody .row-head .secondary';

/**
 * 9px at the default scale; a reader at %80 has already chosen smaller type.
 * The user's choice (2026-09-26), measured against 10 and 9.5: the father's
 * "411A" is 25px at 10px in a 24.5px card, and at 10px 71 of his 211 cards
 * still read "41…" at 1920; at 9.5px 44, at 9px 2.
 */
const FLOOR_PX = 9;

/**
 * What each line was last fitted for: its width and its text. A line whose two
 * are unchanged is not touched, and that is the whole cost model. Every write
 * here restyles the table, and a restyle of this table is a 40–50ms layout at
 * x1 (measured on the father's full week): clearing and refitting every line
 * on each React commit cost 130ms a time, three layouts. Now an ordinary drop
 * re-reads the lines and writes only the few whose card changed.
 */
type Fitted = WeakMap<HTMLElement, string>;

function ratioOf(line: HTMLElement): number {
  const value = line.style.getPropertyValue('--fit');
  return value === '' ? 1 : Number(value);
}

function write(line: HTMLElement, ratio: number) {
  if (ratio >= 1) line.style.removeProperty('--fit');
  else line.style.setProperty('--fit', String(ratio));
}

/** Does the text run past its box? What the ellipsis itself answers. */
function overflows(line: HTMLElement, range: Range): boolean {
  range.selectNodeContents(line);
  return range.getBoundingClientRect().width > line.getBoundingClientRect().width;
}

function fit(table: HTMLElement, fitted: Fitted) {
  // A hidden tab has no widths, and measuring it would shrink every line to
  // the floor. The ResizeObserver brings it back here when it is shown.
  if (table.getClientRects().length === 0) return;

  const root = document.documentElement;
  if (root.dataset.density !== 'sigdir') {
    for (const line of table.querySelectorAll<HTMLElement>('[style*="--fit"]')) {
      line.style.removeProperty('--fit');
    }
    return;
  }

  const scale = Number.parseFloat(getComputedStyle(root).getPropertyValue('--ui-scale')) || 1;
  const floor = FLOOR_PX * Math.min(1, scale);
  const range = document.createRange();
  // A line, the ratio to draw it at, and the smallest ratio it may take.
  let pending: Array<[HTMLElement, number, number]> = [];
  // Every read first, every write after: one layout for the whole table, and
  // it is the one the browser was about to do anyway.
  for (const line of table.querySelectorAll<HTMLElement>(LINES)) {
    // The box's whole pixels, and from the box itself: glyph advances land
    // on whole pixels here, so text of 25px does not go in 24.53. Not
    // `clientWidth`, which ROUNDS (24.53 -> 25): aimed at that, 79 of the
    // father's 211 cards were shrunk to the floor and still drew "41…" while
    // every `scrollWidth` check said they fitted (TRAPS 140).
    const have = Math.floor(line.getBoundingClientRect().width);
    const key = `${have}|${line.textContent}`;
    if (have === 0 || fitted.get(line) === key) continue;
    fitted.set(line, key);
    const was = ratioOf(line);
    range.selectNodeContents(line);
    // Its width unshrunk, estimated from the size it is drawn at. Text does
    // not scale exactly with its size, and the check below corrects that.
    const whole = range.getBoundingClientRect().width / was;
    const least = Math.min(1, (floor * was) / Number.parseFloat(getComputedStyle(line).fontSize));
    // Rounded DOWN to the hundredth, so the first guess errs small.
    const want = whole <= have ? 1 : Math.max(least, Math.floor((have / whole) * 100) / 100);
    if (want !== was) pending.push([line, want, least]);
  }

  // Glyph advances land on whole pixels, so "derslik yok" is 59px at 12px, 58
  // at 11.28 and 52 at 10.8. The guess is written, the lines it touched are
  // measured again, and one still over steps down until it fits or reaches
  // the floor: 0.04 of the size a step, and few steps.
  for (let pass = 0; pass < 5 && pending.length > 0; pass++) {
    for (const [line, ratio] of pending) write(line, ratio);
    pending = pending
      .filter(([line, ratio, least]) => ratio > least && overflows(line, range))
      .map(([line, ratio, least]) => [line, Math.max(least, ratio - 0.04), least]);
  }
}

/** Attaches the fitting to a `.grid-wrap`. Returns the detach function. */
export function attachGridFit(wrap: HTMLElement): () => void {
  let fitted: Fitted = new WeakMap();
  let frame = 0;
  // `fresh`: the size every ratio multiplies has changed (density, scale, the
  // font), so no line's last fit says anything any more.
  const schedule = (fresh = false) => {
    if (fresh) fitted = new WeakMap();
    if (frame !== 0) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const table = wrap.querySelector<HTMLElement>('table.grid');
      if (table !== null) fit(table, fitted);
    });
  };

  const resize = new ResizeObserver(() => schedule());
  resize.observe(wrap);
  // Text and rows, not attributes: a drag toggles classes on every move, and
  // the `--fit` this writes is an attribute too.
  const content = new MutationObserver(() => schedule());
  content.observe(wrap, { childList: true, subtree: true, characterData: true });
  const prefs = new MutationObserver(() => schedule(true));
  prefs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-density', 'style'],
  });
  void document.fonts?.ready.then(() => schedule(true));
  schedule();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    content.disconnect();
    prefs.disconnect();
  };
}
