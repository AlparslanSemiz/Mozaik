/**
 * Where the keyboard goes when a dialog closes: back to what opened it.
 *
 * Radix's modal dialog returns focus to its `Dialog.Trigger`. None of the
 * program's dialogs has one: they open from state (a shortcut, a palette
 * command, a menu item, a promise in `Dialogs.tsx`), so Radix focused a
 * trigger that was `null`, and every close dropped the keyboard on `<body>`.
 * The next Tab then started from the top of the page, twenty-odd stops away
 * from where the reader was (DENETIM KS27).
 *
 * The right-click card menu never had this problem because it HAS a trigger,
 * the table, and the focused card inside it is what Radix gives focus back
 * to. This does the same by hand: remember what had focus when the dialog
 * opened, and give focus back to it on close.
 *
 * Three cases make "what had focus" less obvious than `activeElement`:
 *
 *   - Opened from a menu item ("Dersi düzenle" on a card). The item is gone a
 *     moment later, so the opener is the last thing focused OUTSIDE a menu —
 *     the card the menu was opened on.
 *   - Opened while focus was on `<body>` (Ctrl+K after a click on nothing).
 *     The same last-focused element stands in.
 *   - The opener is gone by the time the dialog closes (the row that was just
 *     deleted). Then the content area, `<main>`, takes focus, so the next Tab
 *     lands in the content and not at the top of the page.
 *
 * And one thing this must NOT do: if the action that closed the dialog put
 * focus somewhere on purpose (a command that went to a screen and focused a
 * field there), that focus stays.
 */
import { useCallback, useLayoutEffect, useRef } from 'react';

let lastFocused: HTMLElement | null = null;
let listening = false;

function insideMenu(element: Element): boolean {
  return element.closest('[role="menu"]') !== null;
}

/** One document listener for the whole program, attached on first use. */
function listen() {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener(
    'focusin',
    (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && !insideMenu(target)) lastFocused = target;
    },
    true,
  );
}

function usable(element: HTMLElement | null): element is HTMLElement {
  if (element === null || !element.isConnected) return false;
  if (element.closest('[inert]') !== null) return false;
  // Not in jsdom, and an element inside a hidden <Activity> is still connected.
  return element.checkVisibility?.() ?? true;
}

/** The content area, which App gives `tabIndex={-1}` for exactly this. */
function fallback(): HTMLElement | null {
  return document.querySelector<HTMLElement>('main');
}

/**
 * Returns the handler for `Dialog.Content`'s `onCloseAutoFocus`.
 * `open` is the same value the dialog's `Dialog.Root` is given.
 */
export function useReturnFocus(open: boolean): (event: Event) => void {
  const opener = useRef<HTMLElement | null>(null);

  // A LAYOUT effect: it runs before Radix's focus scope (a passive effect)
  // moves focus into the dialog, so `activeElement` is still the opener.
  useLayoutEffect(() => {
    listen();
    if (!open) return;
    const active = document.activeElement;
    opener.current =
      active instanceof HTMLElement && active !== document.body && !insideMenu(active)
        ? active
        : lastFocused;
  }, [open]);

  return useCallback((event: Event) => {
    event.preventDefault();
    const target = opener.current;
    opener.current = null;
    const now = document.activeElement;
    // Something already took focus on purpose: leave it there.
    if (now instanceof HTMLElement && now !== document.body && now.isConnected) return;
    const next = usable(target) ? target : fallback();
    // The fallback is a scroll box the size of the screen: scrolling it into
    // view would only jump the page.
    next?.focus({ preventScroll: next !== target });
  }, []);
}
