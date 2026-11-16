// The page's title while the print window is open, and only then.
//
// Chromium's (and Edge's, and WebView2's) "PDF olarak kaydet" offers the
// document title as the file name. The tab's own title is "Mozaik", so every
// saved timetable used to be "Mozaik.pdf", and the second one asked to
// overwrite the first. `beforeprint` covers the Yazdır button and Ctrl+P
// alike; `afterprint` puts the tab's name back.

import { useEffect } from 'react';

/**
 * The tab's own title while a print is open. One for the page, not one per
 * hook: Çıktı and a person's Yazdır can both be mounted, and the second to
 * restore would otherwise put back the first one's file name.
 */
let kept: string | null = null;

export function usePrintTitle(title: string): void {
  useEffect(() => {
    const before = () => {
      kept ??= document.title;
      document.title = title;
    };
    const after = () => {
      if (kept !== null) document.title = kept;
      kept = null;
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      after();
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, [title]);
}
