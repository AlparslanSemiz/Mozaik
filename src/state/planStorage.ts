// Where a plan LIVES between two sessions: localStorage. Knows nothing about
// React or JSX — which key a plan owns is library.ts's job, and turning text
// into a State is parseState.ts's.
//
// This is defence layer 2 of the three the data-loss principle asks for: the
// previous session's state is pushed down a backup chain at startup. Layer 1 is
// the debounced autosave in useStore.ts, layer 3 the file in backupFile.ts.

import { BASE_KEY, readPlanText, writePlanText } from '../plans/library';
import type { Library } from '../plans/library';
import { parseState } from './parseState';
import type { Id, State } from '../types';

const BACKUP_COUNT = 3;

function safely<T>(job: () => T): T | null {
  try {
    return job();
  } catch {
    return null; // localStorage disabled, quota full, private tab...
  }
}

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
      const probe = `${BASE_KEY}-deneme`;
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

export function loadPlan(id: Id): State | null {
  const text = readPlanText(id);
  return text === null ? null : parseState(text);
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

const backupKey = (index: number): string => `${BASE_KEY}-yedek-${index}`;

/** For recovery: the list of stored backups (newest first). */
export function listBackups(): Array<{ index: number; state: State }> {
  const list: Array<{ index: number; state: State }> = [];
  for (let i = 0; i < BACKUP_COUNT; i++) {
    const text = safely(() => localStorage.getItem(backupKey(i)));
    if (text == null) continue;
    const state = parseState(text);
    if (state !== null) list.push({ index: i, state });
  }
  return list;
}

/**
 * The state of every plan in the library.
 *
 * The OPEN plan comes from memory, not from its key: the autosave is debounced
 * by 400 ms, so the key can be a few hundred milliseconds behind what is on
 * screen, and a backup that quietly drops the last edit is worse than none.
 * A plan whose key is gone is skipped rather than exported empty.
 */
export function collectStates(library: Library, planId: Id, present: State): Record<Id, State> {
  const out: Record<Id, State> = {};
  for (const plan of library.plans) {
    const state = plan.id === planId ? present : loadPlan(plan.id);
    if (state !== null) out[plan.id] = state;
  }
  return out;
}
