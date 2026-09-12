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

import { LIBRARY_KEY, parseLibrary, planKey, type Library } from '../pure/library';
import { safely } from '../leaf/storage';
import { type Id } from '../leaf/types';

export function readLibrary(): Library {
  return parseLibrary(safely(() => localStorage.getItem(LIBRARY_KEY)) ?? null);
}

export function writeLibrary(lib: Library): void {
  safely(() => localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib)));
}

export function readPlanText(id: Id): string | null {
  return safely(() => localStorage.getItem(planKey(id))) ?? null;
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
  return (
    safely(() => {
      localStorage.setItem(planKey(id), text);
      return true;
    }) === true
  );
}

export function dropPlanText(id: Id): void {
  safely(() => localStorage.removeItem(planKey(id)));
}
