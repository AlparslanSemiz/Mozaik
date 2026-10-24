// The two effects that ride on the scrolled box under the strip. The two refs
// are in the dependency lists because the linter cannot see they are App's
// own `useRef`s; a ref object never changes, so the effects run exactly when
// `tab` and `ribbonAuto` change, as they did inside App.

import { useEffect, type RefObject } from 'react';
import { attachRibbonScroll, attachScrollFade } from '../../platform/dom';
import type { Tab } from '../../platform/prefs';

export function useMainScroll(
  mainRef: RefObject<HTMLElement | null>,
  appRef: RefObject<HTMLDivElement | null>,
  tab: Tab,
  ribbonAuto: boolean,
): void {
  // The fade on the scrolled content, re-attached per tab: React swaps the
  // whole child of `.main` on a tab change, and scrollFade reads that child
  // once (see the note there).
  useEffect(() => {
    const box = mainRef.current;
    return box === null ? undefined : attachScrollFade(box);
  }, [mainRef, tab]);
  // The strip gets out of the way while you read down and comes back when you
  // look up. Same box, same re-attach on tab change, same reason: React swaps
  // the whole child of `.main`. Program is left out on purpose — see the note
  // in ribbonScroll.ts; there `.main` does not scroll at all, so attaching
  // would simply do nothing, but saying so here is cheaper than finding out.
  //
  // ...and only if the reader wants it to. `ribbonAuto` is a preference of its
  // own and not a widening of `ders-programi-serit`: that one says "I do not
  // want the strip", this one says "do not move it while I read". Off, the
  // effect is never attached and the attribute the CSS reads is cleared, so
  // there is no path left that can hide the strip behind the reader's back.
  useEffect(() => {
    const box = mainRef.current;
    const shell = appRef.current;
    if (shell !== null && !ribbonAuto) shell.removeAttribute('data-ribbon');
    if (box === null || shell === null || tab === 'program' || !ribbonAuto) return undefined;
    return attachRibbonScroll(box, shell);
  }, [mainRef, appRef, tab, ribbonAuto]);
}
