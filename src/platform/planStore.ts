// Where a plan lives in this browser, and what the backup chain holds.
//
// The layer above `libraryStore.ts` and the difference between them is the
// rule that keeps the runtime graph acyclic: `libraryStore` moves RAW STRINGS
// and does not know what a State is, this file knows, because writing a plan
// is `JSON.stringify` and reading one is `parseState`. Anything here that
// learned to hold a State inside `libraryStore` would put the two modules in
// each other's arms (ARCHITECTURE, "Import döngüleri nasıl önleniyor").
//
// Data loss is unacceptable (PRINCIPLES), and two of the three defences live
// here: the per-plan key that is written on every change, and the chain of
// session backups. The third is the file the user downloads (`download.ts`).

import { parseState } from '../pure/parseState';
import { emptyState, newId } from '../pure/entities';
import {
  addPlan,
  BACKUP_COUNT,
  backupKey,
  BASE_KEY,
  findPlan,
  type Library,
  setActive,
  uniquePlanName,
} from '../pure/library';
import { readPlanText, readPlanTextAtStart, writeLibrary, writePlanText } from './libraryStore';
import { safely } from '../leaf/storage';
import type { Id, State } from '../leaf/types';

// The storage key lives in library.ts now: it is the key of plan "1", and which
// key belongs to which plan is that module's job. It is still USER DATA and
// still Turkish — renaming it would orphan every saved timetable.
const KEY = BASE_KEY;

/**
 * Can localStorage really be written to?
 *
 * When the file is double-clicked and opened as file://, in a private tab, or
 * when the browser blocks site data, writing fails silently. Silent failure is
 * the worst case: he builds a timetable all day, closes the window, all gone.
 * So it is probed once at startup and a permanent warning is shown if broken.
 */
export function storageWorks(): boolean {
  return (
    safely(() => {
      const probe = `${KEY}-deneme`;
      localStorage.setItem(probe, '1');
      const read = localStorage.getItem(probe);
      localStorage.removeItem(probe);
      return read === '1';
    }) === true
  );
}

/**
 * Writes ONE plan; the key is derived from the id, never from "the current".
 *
 * Returns whether it landed. Every caller but the bundle importer ignores the
 * answer — there is nothing useful to do about a single failed autosave beyond
 * the permanent warning the top bar already shows. Importing a library writes
 * plan after plan, and there the panel must be able to name what did not fit.
 */
export function savePlan(id: Id, d: State): boolean {
  return writePlanText(id, JSON.stringify(d));
}

/**
 * A stored plan as read: its state, no key at all, or text that cannot be read
 * (TODO TB1). `parseState` returns null on text that is not a plan and THROWS
 * on a row it cannot take (a null lesson); both are `broken` here, and nothing
 * that reads storage throws because of what it found there.
 */
export type StoredPlan = { state: State } | { missing: true } | { broken: true };

function readStored(text: string | null): StoredPlan {
  if (text === null) return { missing: true };
  try {
    const state = parseState(text);
    return state === null ? { broken: true } : { state };
  } catch {
    return { broken: true };
  }
}

export function storedPlan(id: Id): StoredPlan {
  return readStored(readPlanText(id));
}

/** The state to open for a plan that is not broken: its own, or an empty one. */
export function openable(read: { state: State } | { missing: true }): State {
  return 'state' in read ? read.state : emptyState();
}

/** The plan's state, or null when there is none to open (missing or broken). */
export function loadPlan(id: Id): State | null {
  const read = storedPlan(id);
  return 'state' in read ? read.state : null;
}

/** `storedPlan` for the one read at startup: an empty answer is remembered. */
export function loadPlanAtStart(id: Id): StoredPlan {
  return readStored(readPlanTextAtStart(id));
}

/**
 * Plan `brokenId` cannot be read: open another one instead and leave it where
 * it is (TODO TB1). Not opened, so nothing is ever written over its text; not
 * dropped, so it stays in the directory and in its key, for a later fix or a
 * delete the user chooses. The first plan that reads is opened; with none, a
 * new empty plan is made, its data written before its directory row (the rule
 * `createPlan` follows). Every unreadable plan met on the way is named.
 */
export function setAside(
  lib: Library,
  brokenId: Id,
): { lib: Library; id: Id; state: State; broken: string[] } {
  const broken = [findPlan(lib, brokenId)?.name ?? brokenId];
  for (const plan of lib.plans) {
    if (plan.id === brokenId) continue;
    const read = storedPlan(plan.id);
    if ('state' in read) {
      const next = setActive(lib, plan.id);
      writeLibrary(next);
      return { lib: next, id: plan.id, state: read.state, broken };
    }
    if ('broken' in read) broken.push(plan.name);
  }
  const id = newId();
  const state = emptyState();
  savePlan(id, state);
  const next = setActive(
    addPlan(lib, { id, name: uniquePlanName(lib, 'Boş plan'), draft: false }),
    id,
  );
  writeLibrary(next);
  return { lib: next, id, state, broken };
}

/**
 * Once at startup: pushes the previous session's state down the backup chain.
 * Rotating on every change is expensive on a slow machine; once per session is
 * enough, and the last 3 SESSIONS are worth more than the last 3 clicks.
 *
 * The chain is per SESSION, not per plan: four copies of every plan would fill
 * a 5 MB quota with a handful of plans. It therefore holds whichever plan was
 * open when the window was opened, and the Ayarlar > Veri panel says so.
 */
export function rotateBackups(key: string): void {
  safely(() => {
    for (let i = BACKUP_COUNT - 1; i > 0; i--) {
      const previous = localStorage.getItem(backupKey(i - 1));
      if (previous !== null) localStorage.setItem(backupKey(i), previous);
    }
    const current = localStorage.getItem(key);
    if (current !== null) localStorage.setItem(backupKey(0), current);
  });
}

/** For recovery: the list of stored backups (newest first). */
export function listBackups(): Array<{ index: number; state: State }> {
  const list: Array<{ index: number; state: State }> = [];
  for (let i = 0; i < BACKUP_COUNT; i++) {
    const text = safely(() => localStorage.getItem(backupKey(i)));
    if (text == null) continue;
    // Through the same guard as a plan: a backup of text that cannot be read
    // is skipped, never thrown out of the panel that lists them (TB1).
    const read = readStored(text);
    if ('state' in read) list.push({ index: i, state: read.state });
  }
  return list;
}
