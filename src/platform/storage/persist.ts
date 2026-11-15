// Asking the browser not to clear this site's storage on its own.
//
// Without it the site's storage is "best effort": the browser may drop it
// under disk pressure, and Safari drops it after seven days without a visit
// (web audit, 2026-11-16: the live site answered `persisted() === false`).
// `persist()` is the one request that changes that. Chromium answers it
// silently from how much the site is used, Firefox asks the reader once, and
// Safari grants it to a site added to the Home Screen.
//
// Asked ONCE per session and only after the first change that holds work
// (App.tsx): a question before there is anything to keep is a question about
// nothing, and Firefox would show it on an empty screen. Only on an http(s)
// route: the exe's WebView2 profile is its own and is not cleared this way,
// and the double-clicked file has no origin that a grant could stick to.

import { safely } from '../../leaf/preference';
import { storageKind } from './storageReport';

let asked = false;

export function askToKeep(): void {
  if (asked) return;
  asked = true;
  if (storageKind() !== 'site') return;
  const s = safely(() => navigator.storage);
  if (s === null || s === undefined || typeof s.persist !== 'function') return;
  void s
    .persisted()
    .then((already) => (already ? true : s.persist()))
    .catch(() => false);
}

/** Tests only: a new session. */
export function resetAskToKeep(): void {
  asked = false;
}
