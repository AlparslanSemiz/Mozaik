import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  applyDensity,
  applyRibbon,
  applyScale,
  applyTheme,
  readDensity,
  readRibbon,
  readScale,
  readTheme,
} from './theme';
import './styles.css';

// Before the first paint, otherwise the page flashes light and then flips.
applyTheme(readTheme());
// Same reason, and it matters more here: --ui-scale drives the root font-size,
// so applying it after the first paint would reflow the whole shell.
applyScale(readScale());
// Same again: the density decides how wide a grid cell is, so applying it after
// the first paint would redraw 2100 cells.
applyDensity(readDensity());
// Same again: a strip that draws and then folds away is a jump on every load.
applyRibbon(readRibbon());

const root = document.getElementById('root');
if (root === null) throw new Error('#root bulunamadı');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
