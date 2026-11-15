// Kontrol's "Göster": bring one kart on the Program grid, or one card in the
// pool, into view and mark it for a moment.
//
// DOM, not React, on purpose. The grid and the pool already say what each
// element is (`data-row`/`data-day`/`data-hour` on a cell, `data-lesson` on a
// pool card, the same attributes drag.ts reads), and Program stays mounted in
// an Activity while Kontrol is open, so the element exists before the tab
// switch and only becomes VISIBLE after it. Threading a "focus this" prop
// through Program, Grid and GridRow would touch three components for one
// moment of highlight.

/** How long the mark stays. Long enough to find with the eye, short enough to not linger. */
const MARK_MS = 2400;
/** How long to wait for Program to become visible after the tab switch. */
const WAIT_MS = 1500;

/** Waits for `find` to return an element that is laid out, frame by frame. */
function whenVisible(find: () => HTMLElement | null, then: (el: HTMLElement | null) => void) {
  const start = performance.now();
  const step = () => {
    const el = find();
    if (el !== null && el.getClientRects().length > 0) return then(el);
    if (performance.now() - start > WAIT_MS) return then(null);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** The pending removal of the current mark. */
let unmark = 0;

/**
 * `data-reveal`, not a class: React owns `className` and rewrites it on the
 * next render of the row; an attribute it never set is left alone.
 */
function mark(el: HTMLElement) {
  // One mark at a time: a second "Göster" within the 2.4 s moves it.
  for (const old of document.querySelectorAll('[data-reveal]')) old.removeAttribute('data-reveal');
  el.scrollIntoView({ block: 'center', inline: 'center' });
  el.setAttribute('data-reveal', '');
  window.clearTimeout(unmark);
  unmark = window.setTimeout(() => el.removeAttribute('data-reveal'), MARK_MS);
}

/**
 * The cell holding `hour` of that day in the row of `rowIds` that is drawn —
 * the class in the class view, the teacher in the teacher view. A merged block
 * is ONE <td> carrying its first hour and a `data-span`, so the hour is looked
 * up inside the span.
 */
function cellAt(rowIds: readonly string[], day: number, hour: number): HTMLElement | null {
  for (const id of rowIds) {
    const cells = document.querySelectorAll<HTMLElement>(
      `td[data-row="${CSS.escape(id)}"][data-day="${day}"]`,
    );
    for (const td of cells) {
      const from = Number(td.dataset.hour);
      const span = Number(td.dataset.span ?? 1);
      if (hour >= from && hour < from + span) return td;
    }
  }
  return null;
}

/**
 * Brings the kart at (row, day, hour) into view, focuses it and marks its cell.
 * `done(false)` when it is not on the grid: its row is hidden, or the grid is
 * not drawn.
 */
export function revealCell(
  rowIds: readonly string[],
  day: number,
  hour: number,
  done: (found: boolean) => void = () => {},
) {
  whenVisible(
    () => cellAt(rowIds, day, hour),
    (td) => {
      if (td === null) return done(false);
      mark(td);
      td.querySelector<HTMLElement>('button.card')?.focus({ preventScroll: true });
      done(true);
    },
  );
}

/** Brings a lesson's card in the pool into view and marks it. */
export function revealPoolCard(lessonId: string, done: (found: boolean) => void = () => {}) {
  whenVisible(
    () => document.querySelector<HTMLElement>(`.pool-card[data-lesson="${CSS.escape(lessonId)}"]`),
    (card) => {
      if (card === null) return done(false);
      mark(card);
      done(true);
    },
  );
}
