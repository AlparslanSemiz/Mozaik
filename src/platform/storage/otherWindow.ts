// "Bu plan başka bir pencerede değiştirildi": the browser's half of VK1.
//
// Two tabs of the program share one localStorage, and each holds its own copy
// of the plan in memory. Until 2026-10-09 the one that closed last wrote its
// copy over the other's work on the way out, unconditionally (measured by the
// test session: a sample loaded in A, A closed, the stale B closed, and the
// sample was in no `ders-programi-*` key at all). The exe has the other half:
// a second launch only brings the first window forward (single-instance).
//
// The path is the `storage` event, chosen by measurement under file://
// (Chromium, two pages of one profile): the event, a BroadcastChannel and Web
// Locks all reached the second page. The event is the one tied to the data
// itself: it fires only when ANOTHER window really changes a key of ours, so a
// second tab that nobody uses costs nothing and says nothing. A lock would
// have shut the second tab out from the start, a question my father would
// have to answer for a window he may not even know is open.
//
// What it does is close this window's writes, never the other's: the first
// window to save keeps the data, and this one stops and says so. The gate is
// read by `libraryStore.ts`, the only place a plan, the plan list or a plan's
// removal reaches localStorage, so no path round it is left to remember.

let closed = false;

/** True once another window has written our data: this one writes no more. */
export function writesClosed(): boolean {
  return closed;
}

/**
 * Calls `onClosed` once, the first time another window writes data this
 * window does not hold.
 *
 * `same(key, value)` answers for the keys that matter, the open plan's key and
 * the plan list: does `value` say what this window holds? Any other key
 * (`undefined`) does not count. A backup rotation is nobody's work, a
 * preference is not a plan, and a plan that is not open here is read fresh
 * from storage when it is opened.
 *
 * The MEANING is compared, not the key and not the text. A second tab writes
 * what it read as soon as it opens, and that is not a change. Two measured
 * false alarms: comparing keys alone, the first tab's opening write locked the
 * second; comparing text, the second tab's opening write locked the first in
 * CI, because reading a saved plan fills an empty subject list with the
 * built-in one (`parseState`) and the text grew from 957 to 1198 characters.
 */
export function watchOtherWindows(
  same: (key: string, value: string | null) => boolean | undefined,
  onClosed: () => void,
): () => void {
  const listen = (e: StorageEvent) => {
    if (closed) return;
    // No `storageArea` check: this program keeps nothing in sessionStorage,
    // so every `storage` event it can receive is about localStorage.
    // `key === null` is `localStorage.clear()` in the other window.
    if (e.key !== null && same(e.key, e.newValue) !== false) return;
    closed = true;
    onClosed();
  };
  window.addEventListener('storage', listen);
  return () => window.removeEventListener('storage', listen);
}
