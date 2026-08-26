// Scroll fade: content that runs past the top or the bottom edge says so.
//
// The fourth module in this codebase that touches the DOM without going
// through React, and for the same reason as the other three (pitfall 1):
// a scroll handler that set React state would redraw whatever is inside the
// box on every scrolled pixel. `gridChrome.ts` already does exactly this for
// the grid's sticky shadow; this is that idea generalised, because every long
// list in the app has the same problem and none of them had an answer.
//
// WHY it is not applied to `.grid-wrap`, which is the longest scroller of all:
// the fade is a `mask-image`, and a mask on a scroll container clips its own
// `position: sticky` children. The hour heading and the teacher column would
// dissolve at exactly the edges they exist to hold. The grid keeps the shadow
// it already had (`.scrolled-y` / `.scrolled-x`), which says the same thing
// without cutting into anything (pitfall 54).

/** One pixel of slack: fractional scroll positions never land exactly. */
const EPS = 1;

/**
 * Attaches the fade to a scroll container. Returns the detach function.
 *
 * The element must carry `.scroll-fade` in the stylesheet's sense; this only
 * decides WHEN each edge is on, never how wide it is.
 */
export function attachScrollFade(box: HTMLElement): () => void {
  function measure() {
    // `scrollHeight - clientHeight` is 0 when nothing overflows, and then both
    // edges have to be off — a box with a fade at the bottom and nothing under
    // it is a box lying about having more to show.
    const max = box.scrollHeight - box.clientHeight;
    box.classList.toggle('faded-top', box.scrollTop > EPS);
    box.classList.toggle('faded-bot', max > EPS && box.scrollTop < max - EPS);
  }

  // Scrolling is not the only thing that changes the answer: a list that grows
  // by one row can cross the threshold while the scroll position stands still.
  // The box is watched for its own size, the content for its height.
  //
  // The content node is read ONCE, here — which is why the caller re-attaches
  // when the tab changes. React swaps the whole child of `.main` on a tab
  // switch, and an observer still pointing at the detached old one would never
  // fire again. Re-attaching costs one call per tab change and removes the
  // stale-node case rather than working around it.
  const observer = new ResizeObserver(measure);
  observer.observe(box);
  const inner = box.firstElementChild;
  if (inner !== null) observer.observe(inner);

  box.addEventListener('scroll', measure, { passive: true });
  measure();

  return () => {
    observer.disconnect();
    box.removeEventListener('scroll', measure);
    box.classList.remove('faded-top', 'faded-bot');
  };
}
