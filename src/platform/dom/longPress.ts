// A held finger opens the card's menu (iPad). iOS fires no `contextmenu` on a
// long press, so the right click and its menu were out of a touch screen's
// reach, and with them "Kaldır".
//
// No new control: the same `contextmenu` the right click and Shift+F10 send
// is dispatched at the place the finger went down, and the table's one
// trigger reads it as it reads those (Grid.tsx, LessonPool.tsx `openMenu`).
// Before that, a `pointercancel` from the same place: it ends the drag the
// press started (drag.ts listens for it on window) and clears Radix's own
// 700 ms long press where it runs (a pinned card, an empty cell; a draggable
// card's `preventDefault` never lets it start), which opens the menu WITHOUT
// `openMenu` and so on whatever card was last asked for (pitfall 176). A
// mouse is left alone.

import type { PointerEvent as ReactPointerEvent } from 'react';

const HOLD_MS = 500;
/** A finger is never perfectly still; past this it is a drag, not a press. */
const SLOP_PX = 8;

export function startLongPress(e: ReactPointerEvent): void {
  if (e.pointerType === 'mouse' || !(e.target instanceof Element)) return;
  const target = e.target;
  const { pointerId, pointerType, clientX: x, clientY: y } = e;
  const stop = (): void => {
    window.clearTimeout(timer);
    window.removeEventListener('pointermove', move, true);
    window.removeEventListener('pointerup', stop, true);
    window.removeEventListener('pointercancel', stop, true);
  };
  const move = (m: PointerEvent): void => {
    if (m.pointerId === pointerId && Math.hypot(m.clientX - x, m.clientY - y) > SLOP_PX) stop();
  };
  const timer = window.setTimeout(() => {
    stop();
    if (!target.isConnected) return;
    const at = { bubbles: true, cancelable: true, clientX: x, clientY: y };
    target.dispatchEvent(new PointerEvent('pointercancel', { ...at, pointerId, pointerType }));
    target.dispatchEvent(new MouseEvent('contextmenu', { ...at, button: 2 }));
  }, HOLD_MS);
  window.addEventListener('pointermove', move, true);
  window.addEventListener('pointerup', stop, true);
  window.addEventListener('pointercancel', stop, true);
}
