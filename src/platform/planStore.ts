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

import { readStoredPlan, type StoredPlan } from '../pure/parseState';
import { BACKUP_COUNT, backupKey, BASE_KEY } from '../pure/library';
import {
  freezePlan,
  readPlanText,
  readPlanTextAtStart,
  type Unreadable,
  writePlanText,
} from './libraryStore';
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
 * A plan's state, or null when there is none to give. Null is two answers and
 * only one of them is safe to write over: a key with text this copy cannot
 * read is frozen here (libraryStore.ts), so the empty plan a caller puts in
 * its place is never saved over it (A1).
 */
export function loadPlan(id: Id): State | null {
  const read = opened(id, readPlanText(id));
  return 'state' in read ? read.state : null;
}

function opened(id: Id, text: string | null): StoredPlan {
  const read = readStoredPlan(text);
  if ('problem' in read && read.problem !== 'yok') freezePlan(id, read.problem);
  return read;
}

type StoredPlanProblem = Extract<StoredPlan, { problem: unknown }>['problem'];

/** How the open plan's opening read went, for the folder's first write. */
let start: 'okundu' | StoredPlanProblem = 'yok';

/** `loadPlan` for the one read at startup: an empty answer is remembered. */
export function loadPlanAtStart(id: Id): State | null {
  const read = opened(id, readPlanTextAtStart(id));
  start = 'state' in read ? 'okundu' : read.problem;
  return 'state' in read ? read.state : null;
}

/**
 * Whether the plan open at startup was READ from storage. Only then is the
 * exe's write to Belgelerim before the first change safe: a plan that was not
 * there, or not readable, is an empty stand-in, and it used to go over the
 * folder's live file and today's backup within a second (A2).
 */
export function openedReadable(): boolean {
  return start === 'okundu';
}

/**
 * Once at startup: pushes the previous session's state down the backup chain.
 * Rotating on every change is expensive on a slow machine; once per session is
 * enough, and the last 3 SESSIONS are worth more than the last 3 clicks.
 *
 * Not when nothing changed since the last rotation. A reload is a session too,
 * and three reloads after a bad session left three copies of the bad session
 * and none of the one before it (measured, the audit of 2026-10-24, item 7).
 * "Changed" is the plan, not the bytes: the first save after a load writes the
 * same plan stamped with today's schema, and comparing text rotated once more.
 *
 * The chain is per SESSION, not per plan: four copies of every plan would fill
 * a 5 MB quota with a handful of plans. It therefore holds whichever plan was
 * open when the window was opened, and the Ayarlar > Veri panel says so.
 */
export function rotateBackups(key: string): void {
  safely(() => {
    const current = localStorage.getItem(key);
    if (current === null || samePlan(current, localStorage.getItem(backupKey(0)))) return;
    for (let i = BACKUP_COUNT - 1; i > 0; i--) {
      const previous = localStorage.getItem(backupKey(i - 1));
      if (previous !== null) localStorage.setItem(backupKey(i), previous);
    }
    localStorage.setItem(backupKey(0), current);
  });
}

function samePlan(a: string, b: string | null): boolean {
  if (b === null) return false;
  if (a === b) return true;
  const x = readStoredPlan(a);
  const y = readStoredPlan(b);
  return 'state' in x && 'state' in y && JSON.stringify(x.state) === JSON.stringify(y.state);
}

/**
 * For recovery: the list of stored backups (newest first). One this copy
 * cannot read is listed with why, not skipped: after A1 the previous session's
 * real plan sat in `yedek-0` and Ayarlar said there was no backup at all.
 */
export type Backup = { index: number; state: State } | { index: number; problem: Unreadable };

export function listBackups(): Backup[] {
  const list: Backup[] = [];
  for (let i = 0; i < BACKUP_COUNT; i++) {
    const read = readStoredPlan(safely(() => localStorage.getItem(backupKey(i))) ?? null);
    if ('state' in read) list.push({ index: i, state: read.state });
    else if (read.problem !== 'yok') list.push({ index: i, problem: read.problem });
  }
  return list;
}
