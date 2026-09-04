// The sentence above the grid while a block is in the hand.
//
// Its own module because it is its own island: nothing else in the drag reads
// the saved bar or the throttle clock, and everything it needs it takes at
// capture time. Plain DOM, no React — `gridChrome.ts`'s pattern.

import { t } from '../i18n';

/** What the bar says, and how loudly. */
export interface Reason {
  text: string;
  level: 'ok' | 'warn' | 'blocked';
}

export interface ReasonBar {
  /** Say something. Throttled to ten writes a second, leading edge. */
  paint(reason: Reason | null): void;
  /** Put back what the bar said before the drag started. */
  restore(): void;
}

const NOTHING: ReasonBar = { paint: () => undefined, restore: () => undefined };

const CLASS = {
  ok: 'reason-bar ok',
  warn: 'reason-bar warn',
  blocked: 'reason-bar bad',
} as const;

/**
 * Takes the bar over for the length of one drag: remembers what it said, primes
 * it with "droppable", and hands back the two verbs the drag needs. A page with
 * no bar (any screen but Program) yields a no-op rather than a null check at
 * every call site.
 */
export function captureReasonBar(): ReasonBar {
  const bar = document.querySelector<HTMLElement>('.reason-bar');
  const span = bar?.querySelector<HTMLElement>(':scope > span') ?? null;
  if (bar === null || span === null) return NOTHING;

  const before = { className: bar.className, text: span.textContent ?? '' };
  let live = true;

  // WRITTEN ONLY WHEN IT CHANGES, and that is a measured line rather than a
  // tidiness one. Assigning `textContent` replaces the text node even when the
  // string is identical, and that one write dirties layout AND the whole root
  // paint chunk — the bar shares it with the top bar, the ribbon and the pool.
  // Traced during a drag across the busiest row (4x CPU, sample school): the
  // bar was 105 of the ~200 full-viewport repaints, ~1.5 ms each on this
  // machine. The cells' own highlight repaints cost 0.2 ms, because they are
  // inside the grid's own scrolling layer.
  const write = (reason: Reason | null): void => {
    if (!live) return;
    const className = CLASS[reason?.level ?? 'ok'];
    const message = reason?.text ?? t('Buraya bırakılabilir.');
    if (bar.className !== className) bar.className = className;
    if (span.textContent !== message) span.textContent = message;
  };

  write(null);

  // NOT COALESCED FURTHER, AND THAT WAS MEASURED RATHER THAN ASSUMED. Dropping
  // to ten writes a second looks like the obvious next step — nobody reads
  // sixty sentences a second — and it bought nothing: the deferred write lands
  // between two frames instead of inside one, so the same repaint happens in a
  // frame of its own. Traced across the busiest row, paint + layerize + hit
  // test + script came to 7103 ms without the timer and 7200 ms with it.
  // What survives is only the equality gate in `write` above (pitfall 105).
  let at = 0;
  let timer = 0;
  let next: Reason | null = null;

  return {
    paint(reason) {
      const now = performance.now();
      const wait = 100 - (now - at);
      if (wait <= 0) {
        if (timer !== 0) {
          clearTimeout(timer);
          timer = 0;
        }
        at = now;
        write(reason);
        return;
      }
      next = reason;
      if (timer !== 0) return;
      timer = window.setTimeout(() => {
        timer = 0;
        at = performance.now();
        write(next);
      }, wait);
    },
    restore() {
      if (timer !== 0) {
        clearTimeout(timer);
        timer = 0;
      }
      // Before the restore, not after: a queued write that lands afterwards
      // would leave the drag's sentence on a page with no drag in it.
      live = false;
      bar.className = before.className;
      span.textContent = before.text;
    },
  };
}
