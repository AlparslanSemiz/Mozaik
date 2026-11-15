// One Tab stop for a whole table, and arrow keys inside it (the ARIA grid
// pattern, DENETIM KS8 and KS19).
//
// The BOX is the stop, not a cell. A roving `tabindex="0"` on one cell would
// have to be moved by React — a render per arrow key on a 2100-cell grid — or
// written to the DOM and then lost the moment React redraws that row and the
// cell it was on is replaced. Here every cell renders `tabIndex={-1}` and never
// changes; the box keeps `tabIndex=0` and, when Tab lands on it, hands focus to
// the cell that had it last (or the first one). Nothing is re-rendered when
// focus moves, and the listeners are bound once (pitfall 1's discipline).
//
// Leaving: Tab from a cell goes to whatever follows the box, because nothing
// inside it is in the tab order. Shift+Tab would land on the box itself, which
// would hand focus straight back; so for that one key press the box steps out
// of the order and is put back on the next task.

export interface RovingOptions {
  /** The item an element inside the box belongs to, or null. */
  item: (from: Element) => HTMLElement | null;
  /** Where focus goes the first time Tab lands on the box. */
  first: () => HTMLElement | null;
  /** The item a navigation key leads to, or null to let the key through. */
  move: (from: HTMLElement, e: KeyboardEvent) => HTMLElement | null;
  /** Called right before an item takes focus, e.g. to give it a name. */
  prepare?: (item: HTMLElement) => void;
}

/** Focus an item and keep it on screen; the box's scroll-padding clears the sticky heads. */
export function focusItem(item: HTMLElement): void {
  item.focus({ preventScroll: true });
  item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

export function attachRoving(box: HTMLElement, opts: RovingOptions): () => void {
  let last: HTMLElement | null = null;
  box.tabIndex = 0;

  const go = (item: HTMLElement) => {
    opts.prepare?.(item);
    focusItem(item);
  };

  function focusin(e: FocusEvent) {
    const target = e.target as Element;
    if (target === box) {
      const to = last !== null && last.isConnected && box.contains(last) ? last : opts.first();
      if (to !== null) go(to);
      return;
    }
    const item = opts.item(target);
    if (item !== null) last = item;
  }

  function keydown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey && e.target !== box) {
        box.tabIndex = -1;
        setTimeout(() => {
          box.tabIndex = 0;
        }, 0);
      }
      return;
    }
    if (e.altKey || e.metaKey) return;
    const from = opts.item(e.target as Element);
    if (from === null) return;
    const to = opts.move(from, e);
    if (to === null) return;
    e.preventDefault();
    if (to !== from) go(to);
  }

  box.addEventListener('focusin', focusin);
  box.addEventListener('keydown', keydown);
  return () => {
    box.removeEventListener('focusin', focusin);
    box.removeEventListener('keydown', keydown);
  };
}
