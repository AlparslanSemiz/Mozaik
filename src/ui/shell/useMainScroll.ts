// The effects that ride on the scrolled box under the strip. The refs
// are in the dependency lists because the linter cannot see they are App's
// own `useRef`s; a ref object never changes, so the effects run exactly when
// `tab` and `ribbonAuto` change, as they did inside App.

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
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

/**
 * Program's two scrollers keep their place across a tab change in every
 * engine. Program stays mounted in a hidden `<Activity>`, i.e. `display:
 * none`; Chromium and Firefox keep a hidden box's scroll offset, WebKit
 * (Safari, iPad) drops it to 0 (pitfall 174). So each scroll of `.grid-wrap`
 * or `.pool-list` is noted while the box is laid out (a hidden box has no
 * client rects and answers 0, which must not overwrite the note), and when
 * Program shows again the notes are written back before paint. A remounted
 * box is a new element with no note. Re-attached per tab like the effects
 * above, so a `<main>` that mounts later is still heard.
 */
const KEPT = '.grid-wrap, .pool-list';

export function useProgramScrollKeep(mainRef: RefObject<HTMLElement | null>, tab: Tab): void {
  const notes = useRef(new Map<Element, readonly [number, number]>());
  useEffect(() => {
    const box = mainRef.current;
    if (box === null) return undefined;
    const note = (e: Event): void => {
      const el = e.target;
      if (!(el instanceof Element) || !el.matches(KEPT) || el.getClientRects().length === 0) return;
      notes.current.set(el, [el.scrollLeft, el.scrollTop]);
    };
    box.addEventListener('scroll', note, { capture: true, passive: true });
    return () => box.removeEventListener('scroll', note, { capture: true });
  }, [mainRef, tab]);
  useLayoutEffect(() => {
    if (tab !== 'program') return;
    for (const [el, [left, top]] of notes.current) {
      if (!el.isConnected) {
        notes.current.delete(el);
        continue;
      }
      if (el.scrollLeft !== left) el.scrollLeft = left;
      if (el.scrollTop !== top) el.scrollTop = top;
    }
  }, [tab]);
}
