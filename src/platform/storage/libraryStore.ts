// Reading and writing the plan library, and nothing else.
//
// Split out of library.ts on 2026-09-12. The model next door decides WHAT a
// plan directory is; this file is the only place that knows the directory
// lives in localStorage, and it is the whole of that knowledge. Keeping them
// apart is what lets the model be reasoned about without a browser, and
// `library.test.ts` asserts that the model never reaches for `localStorage`
// again.
//
// RAW STRINGS ONLY, in both directions. This file does not know what a State
// is and never parses one: `store.ts` is the only place that does, and that is
// what keeps store.ts and the plan library free of a runtime cycle
// (ARCHITECTURE, the same arrangement keys.ts has between constraints and
// rules). Every call goes through the one `safely` guard in storage.ts.
//
// And every WRITE goes through `writesClosed()` first: once another window has
// changed our data, this one writes nothing more (otherWindow.ts, VK1).
//
// A plan read EMPTY at startup is not trusted either. Under file:// Chromium
// has started a reloaded page from an empty localStorage while the plan sat in
// its key (once in CI, 38085275289; TRAPS 108), and 400 ms later the autosave
// wrote the empty plan over it. So the opening read marks the plan, and while
// it is marked every write reads the key again first: still empty is a first
// use, the write goes ahead and the mark is dropped; full is a plan this window
// never saw, and nothing is written over it.

import { LIBRARY_KEY, parseLibrary, planKey, type Library } from '../../pure/io';
import { safely } from '../../leaf/storage';
import type { Id } from '../../leaf/model';
import { writesClosed } from './otherWindow';

export function readLibrary(): Library {
  return parseLibrary(safely(() => localStorage.getItem(LIBRARY_KEY)) ?? null);
}

export function writeLibrary(lib: Library): void {
  if (writesClosed()) return;
  safely(() => localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib)));
}

export function readPlanText(id: Id): string | null {
  return safely(() => localStorage.getItem(planKey(id))) ?? null;
}

let emptyAtStart: Id | null = null;
let refused = false;

/** The opening read of the open plan: an empty answer marks it (above). */
export function readPlanTextAtStart(id: Id): string | null {
  const text = readPlanText(id);
  emptyAtStart = text === null ? id : null;
  return text;
}

/**
 * May this window write plan `id`? Only a plan marked at startup is asked, and
 * it is asked again on every write: the key is read once more, and a key that
 * holds something now was not this window's to overwrite.
 */
export function mayWritePlan(id: Id): boolean {
  if (emptyAtStart !== id) return true;
  if (readPlanText(id) === null) {
    emptyAtStart = null;
    return true;
  }
  refused = true;
  return false;
}

/** True once a write was refused by `mayWritePlan`: the strip says so. */
export function writeRefused(): boolean {
  return refused;
}

/**
 * Returns whether the write actually happened.
 *
 * `safely` swallows the exception, and a swallowed quota error is a SILENT
 * loss — the one kind that matters (no-data-loss principle). One plan at a time nobody
 * could act on the answer, but importing a whole library writes plan after
 * plan, and there the panel has to be able to say which one did not fit.
 */
export function writePlanText(id: Id, text: string): boolean {
  if (writesClosed() || !mayWritePlan(id)) return false;
  return (
    safely(() => {
      localStorage.setItem(planKey(id), text);
      return true;
    }) === true
  );
}

export function dropPlanText(id: Id): void {
  if (writesClosed() || !mayWritePlan(id)) return;
  safely(() => localStorage.removeItem(planKey(id)));
}
