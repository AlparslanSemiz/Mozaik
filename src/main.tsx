import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';
import { applyDil, readDil } from './i18n';
import {
  applyAvailClock,
  applyDensity,
  applyMotion,
  applyRibbon,
  applyScale,
  applyTheme,
  applyUiDensity,
  readAvailClock,
  readDensity,
  readMotion,
  readRibbon,
  readScale,
  readTheme,
  readUiDensity,
} from './theme';
import './styles.css';

// Before the first paint, otherwise the page flashes light and then flips.
applyTheme(readTheme());
// Same reason and the same place: <html lang> is what a screen reader picks a
// voice from, and it was hard-coded to "tr" in index.html.
applyDil(readDil());
// Same reason, and it matters more here: --ui-scale drives the root font-size,
// so applying it after the first paint would reflow the whole shell.
applyScale(readScale());
// Same again: the density decides how wide a grid cell is, so applying it after
// the first paint would redraw 2100 cells.
applyDensity(readDensity());
// ...and its twin, which decides the padding of every list and panel: applied
// late it would move every row on the page once.
applyUiDensity(readUiDensity());
// Same again: a strip that draws and then folds away is a jump on every load.
applyRibbon(readRibbon());
// ...and the availability heading, for the same reason: a clock that appears
// after the first paint widens every column in the table under it.
applyAvailClock(readAvailClock());
// Motion LAST and before the first paint both: a reader who has asked for no
// animation must not watch the shell fade in once before the setting lands.
applyMotion(readMotion());

const root = document.getElementById('root');
if (root === null) throw new Error('#root bulunamadı');

// The providers wrap App rather than living inside it, because App itself asks
// questions (opening a file replaces the whole timetable) and a hook cannot
// reach a provider its own component renders. `Root` holds the composition so
// the smoke test renders the same tree this does.
createRoot(root).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
