// The tool strip gets out of the way while you read, and comes back the moment
// you look up.
//
//   "ikinci barın açılıp kapanması olması lazım aşağı inmeye başlayınca ve
//    yukarı çıkmaya başlayınca kendi kendine."
//
// The fifth module here that touches the DOM without going through React, and
// for the reason the other four give (pitfall 1): this runs on every scrolled
// pixel, and React state on that path would redraw whatever is in the box —
// on Kurulum that is twenty-five rows of controls, on Dersler ninety-nine.
// It writes ONE attribute on `.app` and lets CSS do the rest.
//
// WHICH BOX. `.main` and nothing else. Only six of the seven tabs scroll it:
// Program hands its overflow to `.grid-wrap` (`main no-overflow`), and the
// answer there is deliberately "the strip never hides" — that strip carries
// "Otomatik diz" and the density switch, which are the two things a hand
// reaches for WHILE looking at the grid.
//
// WHAT IT IS NOT. It is not the fold. `ders-programi-serit` is a preference
// the reader sets and the program remembers; this is a gesture that lasts as
// long as the scroll position does. Nothing here is written to localStorage,
// nothing here reaches `State`, and folding the strip by hand makes this moot
// because there is no strip to hide.

/** Below this the strip stays: the first screenful is not "reading down". */
const ARM = 48;

/**
 * How far the pointer has to travel one way before the strip answers.
 *
 * Not zero, and this is the whole difficulty of an auto-hiding bar: a trackpad
 * delivers scroll in both directions within one gesture, so a strip that turns
 * on the sign of a single event flickers. Sixteen pixels is about one wheel
 * notch — enough that a direction has to be meant.
 */
const TRAVEL = 16;

/**
 * How long after a toggle the direction is not read.
 *
 * Folding the strip makes `.main` about 40px taller, and a taller box near the
 * end of a list makes the browser CLAMP `scrollTop` down — which arrives as a
 * scroll event moving UP, which shows the strip, which shrinks the box, which
 * lets `scrollTop` grow again. Measured as a 30-second hang: Playwright's own
 * scroll-into-view drove the strip in and out until it gave up, and a hand on
 * a wheel near the same threshold gets the same flicker.
 *
 * So a toggle opens a window in which the position is only RE-ANCHORED, never
 * judged. Comfortably longer than the transition it is covering.
 */
const SETTLE_MS = 320;

const ATTRIBUTE = 'data-ribbon';
const HIDDEN = 'gizli';

/**
 * Attaches the auto-hide to a scroll container. Returns the detach function.
 *
 * `app` is what carries the attribute rather than the strip itself: the strip
 * is a sibling of the box being scrolled, and a rule that reaches sideways is
 * a rule nobody finds. `.app[data-ribbon="gizli"] .ribbon` reads top-down.
 */
export function attachRibbonScroll(box: HTMLElement, app: HTMLElement): () => void {
  // The last position a DECISION was taken at, not the last position seen:
  // measuring travel against the previous event would make every slow scroll
  // an infinite series of sub-threshold moves that never add up.
  let anchor = box.scrollTop;
  let hidden = false;
  let settleUntil = 0;

  function show() {
    if (!hidden) return;
    hidden = false;
    settleUntil = performance.now() + SETTLE_MS;
    app.removeAttribute(ATTRIBUTE);
  }

  function onScroll() {
    const y = box.scrollTop;

    // AT THE TOP THE STRIP IS ALWAYS BACK, and this has to be asked FIRST —
    // before the settle window below, not after. It was after for one run, and
    // that is a strip that never comes back: a jump to the top lands inside the
    // window opened by the fold that preceded it, the window only re-anchors,
    // and no further scroll event ever arrives to reconsider. The top is not a
    // direction, it is a position, and there is nothing ambiguous about it.
    if (y <= ARM) {
      anchor = y;
      show();
      return;
    }

    // The box is still changing size from the last toggle: follow the position,
    // do not read anything into it.
    if (performance.now() < settleUntil) {
      anchor = y;
      return;
    }

    const moved = y - anchor;
    if (Math.abs(moved) < TRAVEL) return;
    anchor = y;

    if (moved > 0) {
      if (hidden) return;
      // Only fold into room that exists. On a list barely taller than its box,
      // giving back the strip's height makes the whole thing fit — and then
      // there is nothing left to scroll and no way to ask for the strip back.
      const room = box.scrollHeight - box.clientHeight;
      if (room < app.offsetHeight / 8) return;
      hidden = true;
      settleUntil = performance.now() + SETTLE_MS;
      app.setAttribute(ATTRIBUTE, HIDDEN);
    } else {
      show();
    }
  }

  box.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    box.removeEventListener('scroll', onScroll);
    show();
  };
}
