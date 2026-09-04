// Dragging a table row into a new position.
//
// The fourth time this file's pattern appears (drag.ts, gridChrome.ts,
// poolSplit.ts) and for the same reason: nothing is told to React until the
// gesture ends. Here the argument is not 2100 cells, it is uncontrolled
// inputs — every list row carries `defaultValue` text boxes (pitfall 3), and
// re-rendering the tbody under a moving finger is how a half-typed name
// disappears.
//
// `drag.ts` is not reused. That module answers "which of 84 cells is under the
// pointer, and is the drop legal" and carries a lesson id, a block size and a
// map of verdicts to do it. This one needs a single number: an index.

/** How far the pointer must travel before a press becomes a drag. */
const SLOP = 4;

export interface RowDragOptions {
  /** The <tbody> whose direct <tr> children are draggable. */
  body: HTMLElement;
  /** Called ONCE when the gesture ends somewhere new. Never with from === to. */
  commit: (from: number, to: number) => void;
}

export function attachRowDrag(opts: RowDragOptions): () => void {
  let source: HTMLTableRowElement | null = null;
  let ghost: HTMLElement | null = null;
  let bottoms: number[] = [];
  let from = -1;
  let to = -1;
  let startY = 0;
  let pointerY = 0;
  let frame = 0;
  let moving = false;
  let armed = false;

  const rows = (): HTMLTableRowElement[] =>
    [...opts.body.children].filter(
      (el): el is HTMLTableRowElement => el.tagName === 'TR',
    );

  function clearMarks() {
    for (const tr of rows()) tr.classList.remove('drop-above', 'drop-below', 'row-lifted');
  }

  /**
   * Where the dragged row would land: the index of the row the pointer is
   * OVER. Measured once at the start of the gesture and never re-read while
   * the pointer moves (pitfall 2) — which is safe because the source row
   * stays in the table, so nothing below it shifts.
   *
   * Deliberately containment and not "which midpoint have we passed". The
   * midpoint version is ambiguous at exactly the midpoint, and that is not a
   * rare coordinate: dropping a row squarely onto another one is the normal
   * way to do this, and it landed one row short. Under the parallel E2E run
   * sub-pixel layout differences put it on either side of the boundary, so it
   * failed as a FLAKE rather than as a bug — twice as expensive to find.
   */
  function targetFor(y: number): number {
    for (const [i, bottom] of bottoms.entries()) {
      if (y < bottom) return i;
    }
    return bottoms.length - 1;
  }

  function paint() {
    frame = 0;
    if (!moving || ghost === null) return;

    ghost.style.transform = `translateY(${pointerY - startY}px)`;

    const next = targetFor(pointerY);
    if (next !== to) {
      to = next;
      clearMarks();
      source?.classList.add('row-lifted');
      const list = rows();
      const mark = list[to];
      // Below its old place the row settles UNDER the target, above it OVER —
      // which is the same thing the final splice does.
      if (mark !== undefined && mark !== source) {
        mark.classList.add(to > from ? 'drop-below' : 'drop-above');
      }
    }
  }

  function schedule() {
    if (frame === 0) frame = requestAnimationFrame(paint);
  }

  function begin() {
    if (source === null) return;
    moving = true;

    const rect = source.getBoundingClientRect();
    bottoms = rows().map((tr) => tr.getBoundingClientRect().bottom);

    // A clone rather than the row itself: the row has to stay in the table so
    // the other rows keep their positions, and so the measurements above stay
    // true for the whole gesture.
    const clone = source.cloneNode(true) as HTMLElement;
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.className = 'list row-ghost';
    table.style.width = `${rect.width}px`;
    table.style.top = `${rect.top}px`;
    table.style.left = `${rect.left}px`;
    tbody.appendChild(clone);
    table.appendChild(tbody);
    document.body.appendChild(table);
    ghost = table;

    source.classList.add('row-lifted');
    document.body.classList.add('row-dragging');
  }

  function finish(commit: boolean) {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
    ghost?.remove();
    ghost = null;
    clearMarks();
    document.body.classList.remove('row-dragging');

    const wasMoving = moving;
    const a = from;
    const b = to;
    moving = false;
    armed = false;
    source = null;
    from = -1;
    to = -1;
    bottoms = [];

    // `a !== b` is the whole no-op guard: a row dropped where it started must
    // cost nothing, because the reducer turns every real change into an undo
    // step and a nudge that moved nothing is not a change.
    if (commit && wasMoving && a >= 0 && b >= 0 && a !== b) opts.commit(a, b);
  }

  function down(e: PointerEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    const grip = target?.closest('.row-grip');
    if (grip === null || grip === undefined) return;
    if (grip.hasAttribute('disabled')) return;

    const tr = grip.closest('tr');
    if (tr === null || tr.parentElement !== opts.body) return;

    source = tr as HTMLTableRowElement;
    from = rows().indexOf(source);
    to = from;
    startY = e.clientY;
    pointerY = e.clientY;
    armed = true;
    // Kept on the handle so the gesture survives the pointer leaving the row.
    (grip as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function move(e: PointerEvent) {
    if (!armed) return;
    pointerY = e.clientY;
    // A press is not a drag until it travels: without this, clicking the handle
    // to focus it for the keyboard would flicker a ghost.
    if (!moving) {
      if (Math.abs(pointerY - startY) < SLOP) return;
      begin();
    }
    e.preventDefault();
    schedule();
  }

  function up() {
    // NOT gated on `hasPointerCapture` — the browser may have released it
    // already, and then the drop would be silently thrown away (pitfall 46).
    if (!armed) return;
    finish(true);
  }

  function cancel() {
    if (!armed) return;
    finish(false);
  }

  function key(e: KeyboardEvent) {
    if (e.key === 'Escape' && armed) finish(false);
  }

  opts.body.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
  window.addEventListener('keydown', key);

  return () => {
    finish(false);
    opts.body.removeEventListener('pointerdown', down);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    window.removeEventListener('keydown', key);
  };
}

/** Ghost aside, one place decides where a keyboard move lands too. */
export function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index));
}
