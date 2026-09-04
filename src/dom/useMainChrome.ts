// What the scrolled box does to the chrome around it: the fade on its edges,
// and the tool strip getting out of the way while you read down.
//
// Both are re-attached PER TAB, and that is not tidiness: React swaps the whole
// child of `.main` on a tab change, and both helpers read that child once.
//
// Plus the one that has nothing to do with scrolling and everything to do with
// the first frame after a Program click: the pool's cards are held back for two
// frames so the grid is what the click answers first.

import { useEffect, useLayoutEffect, type RefObject } from 'react';
import { attachRibbonScroll } from './ribbonScroll';
import { attachScrollFade } from './scrollFade';
import type { Tab } from '../view/toolState';

/** The fade on the scrolled content. */
export function useScrollFade(main: RefObject<HTMLElement | null>, tab: Tab): void {
  useEffect(() => {
    const box = main.current;
    return box === null ? undefined : attachScrollFade(box);
  }, [main, tab]);
}

/**
 * The strip gets out of the way while you read down and comes back when you
 * look up — and only if the reader wants it to.
 *
 * `ribbonAuto` is a preference of its own and not a widening of
 * `ders-programi-serit`: that one says "I do not want the strip", this one says
 * "do not move it while I read". Off, the effect is never attached and the
 * attribute the CSS reads is cleared, so there is no path left that can hide
 * the strip behind the reader's back.
 *
 * Program is left out on purpose: there `.main` does not scroll at all, so
 * attaching would simply do nothing — but saying so is cheaper than finding out
 * (see ribbonScroll.ts).
 */
export function useRibbonAutoHide(
  main: RefObject<HTMLElement | null>,
  shell: RefObject<HTMLElement | null>,
  tab: Tab,
  enabled: boolean,
): void {
  useEffect(() => {
    const box = main.current;
    const app = shell.current;
    if (app !== null && !enabled) app.removeAttribute('data-ribbon');
    if (box === null || app === null || tab === 'program' || !enabled) return undefined;
    return attachRibbonScroll(box, app);
  }, [main, shell, tab, enabled]);
}

/**
 * The grid is what a Program-tab click must answer first.
 *
 * The pool keeps its fixed drawer height but skips layout and paint for two
 * frames; then its stacks appear without moving either pane. Measured on the
 * sample school at 4× CPU: the warm tab switch went from a 169 ms median to
 * 123 ms.
 *
 * A very quick grab must not lose its first pointerdown while the paint is
 * deferred, so moving into the reserved drawer reveals it early; ordinary tab
 * changes still get both cheap opening frames.
 *
 * This lives OUTSIDE the Activity boundary because hidden Activity effects are
 * deliberately torn down and cannot schedule the reveal themselves.
 */
export function usePoolReveal(
  main: RefObject<HTMLElement | null>,
  tab: Tab,
  lessonCount: number,
): void {
  useLayoutEffect(() => {
    const list = main.current?.querySelector<HTMLElement>('.pool-list') ?? null;
    if (list === null) return undefined;
    list.style.contentVisibility = 'hidden';
    if (tab !== 'program') return undefined;

    let second = 0;
    const reveal = () => {
      list.style.contentVisibility = '';
      document.removeEventListener('pointermove', revealAtPool, true);
    };
    const revealAtPool = (event: PointerEvent) => {
      const bounds = list.getBoundingClientRect();
      if (
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      ) {
        reveal();
      }
    };

    document.addEventListener('pointermove', revealAtPool, true);
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(reveal);
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      document.removeEventListener('pointermove', revealAtPool, true);
    };
  }, [main, tab, lessonCount]);
}
