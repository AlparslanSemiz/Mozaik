// The shell's keyboard shortcuts. `setPaletteOpen` is a `useState` setter and
// never changes; it is listed because the linter cannot see that from here.

import { useEffect } from 'react';
import type { Tab } from '../../platform/prefs';
import { isTextInput } from '../../platform/storage';
import { TABS } from './tabs';

export function useShortcuts(
  setPaletteOpen: (update: (open: boolean) => boolean) => void,
  goTab: (tab: Tab) => void,
  openShortcuts: () => void,
): void {
  // Ctrl/⌘+K opens the palette; Alt+1..7 go to a section.
  //
  // Alt and not a bare digit: a bare "5" while a lesson card has focus would
  // jump to Yazdır, and every card on the grid is a focusable button. The
  // modifier is what keeps a shortcut from being a trap.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey && /^[1-7]$/.test(e.key)) {
        const next = TABS[Number(e.key) - 1];
        if (next !== undefined) {
          e.preventDefault();
          goTab(next.id);
        }
        return;
      }
      // '?' opens the shortcuts help. Guarded the same way Ctrl+Z is
      // (store.ts's isTextInput): it is a printable character, and without
      // the guard it would fire while typing a search or a name.
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTextInput(e.target)) {
        e.preventDefault();
        openShortcuts();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen, goTab, openShortcuts]);
}
