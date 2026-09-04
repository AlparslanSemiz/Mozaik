// The three global keys: Ctrl/⌘+K opens the palette, Alt+1..7 go to a section,
// '?' opens the shortcut list.
//
// ALT AND NOT A BARE DIGIT. A bare "5" while a lesson card has focus would jump
// to Çıktı, and every card on the grid is a focusable button. The modifier is
// what keeps a shortcut from being a trap — and '?' is guarded the same way
// Ctrl+Z is (`textInput.ts`), because it is a printable character and without
// the guard it would fire while typing a name.

import { useEffect } from 'react';
import { isTextInput } from './state/textInput';
import type { Tab } from './toolState';

export interface ShortcutActions {
  /** The tabs in the order Alt+1..7 addresses them. */
  tabs: readonly Tab[];
  goTab: (tab: Tab) => void;
  togglePalette: () => void;
  openShortcuts: () => void;
}

export function useAppShortcuts({
  tabs,
  goTab,
  togglePalette,
  openShortcuts,
}: ShortcutActions): void {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePalette();
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey && /^[1-7]$/.test(e.key)) {
        const next = tabs[Number(e.key) - 1];
        if (next !== undefined) {
          e.preventDefault();
          goTab(next);
        }
        return;
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTextInput(e.target)) {
        e.preventDefault();
        openShortcuts();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tabs, goTab, togglePalette, openShortcuts]);
}
