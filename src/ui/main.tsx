import { StrictMode, startTransition } from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './shell';
import { applyDil, readDil } from '../leaf/i18n';
import {
  applyMotion,
  applyRibbon,
  applyScale,
  applyTheme,
  readMotion,
  readRibbon,
  readScale,
  readTheme,
} from '../platform/prefs';
import { inWorker, serveRelax } from '../platform/search';
import '../styles.css';

// The same script also runs as the suggestion search's worker (platform/search/
// relaxPool.ts). There it has no document: it answers messages and draws nothing.
if (inWorker()) serveRelax();
else boot();

function boot(): void {
  // The embedded face is decoded only when text first asks for it, and that was
  // the grid's first layout: at 4x CPU the decode finished ~700 ms later, so the
  // whole page was laid out against the fallback's metrics, measured by
  // gridFit, and laid out and measured again when Plex arrived. Asked for here,
  // the decode runs while the timetable is read and rendered (pitfall 220).
  void document.fonts?.load('1em "IBM Plex Sans"').catch(() => undefined);
  // Before the first paint, otherwise the page flashes light and then flips.
  applyTheme(readTheme());
  // Same reason and the same place: <html lang> is what a screen reader picks a
  // voice from, and it was hard-coded to "tr" in index.html.
  applyDil(readDil());
  // Same reason, and it matters more here: --ui-scale drives the root font-size,
  // so applying it after the first paint would reflow the whole shell.
  applyScale(readScale());
  // Same again: a strip that draws and then folds away is a jump on every load.
  applyRibbon(readRibbon());
  // ...and the availability heading, for the same reason: a clock that appears
  // after the first paint widens every column in the table under it.
  // Motion LAST and before the first paint both: a reader who has asked for no
  // animation must not watch the shell fade in once before the setting lands.
  applyMotion(readMotion());

  const root = document.getElementById('root');
  if (root === null) throw new Error('#root bulunamadı');

  // The providers wrap App rather than living inside it, because App itself asks
  // questions (opening a file replaces the whole timetable) and a hook cannot
  // reach a provider its own component renders. `Root` holds the composition so
  // the smoke test renders the same tree this does.
  //
  // A transition so the first render is cut into slices the main thread can
  // breathe between: on the father's week at 4x CPU it was ~140 ms of script
  // in the same task as the first layout. Nothing is on screen before the
  // commit either way, and the commit itself is one piece as before.
  const app = createRoot(root);
  startTransition(() => {
    app.render(
      <StrictMode>
        <Root />
      </StrictMode>,
    );
  });
}
