// "Eski hâline dön" (Sadeleşme K8, 2026-11-16): a plan as it was at the end
// of each of the last days it was worked on, kept by itself, no setup.
//
// How a day's copy comes to be: the first save of a new day finds the plan's
// key still holding what the LAST day it was saved left there, so that text
// is copied, as it is, under that day (`DAILY_MARK_KEY` remembers which day
// it was). One write a day per plan, and no parse but the one that asks
// whether the text holds any work. A restore writes the plan as it stood
// before it under today first (`keepToday`); the day's end, written the next
// day, takes that place, and the before-delete slot still holds it.
//
// BOUNDED, and the plan comes first. `DAILY_COUNT` days per plan are kept.
// When the storage is full a copy gives way, oldest first: the plan's own
// refused autosave drops copies until it fits (`writePlanText`), and a copy
// that does not fit drops older copies, never anything else.
//
// The same raw strings as `libraryStore.ts`, below it, so the plan's own write
// can call `dropOldestCopy` without a cycle. Works the same in the exe: its
// window has a localStorage too, and the folder's daily files are a second,
// separate copy (`folder.ts`).

import {
  DAILY_COUNT,
  DAILY_MARK_KEY,
  DAILY_PREFIX,
  dailyKey,
  planKey,
  readStoredPlan,
} from '../../pure/io';
import { safely } from '../../leaf/preference';
import type { Id, State } from '../../leaf/model';
import { isoDay } from './fileSaved';
import { writesClosed } from './otherWindow';

const DAY = /^(\d{4}-\d{2}-\d{2})-(.+)$/;

interface CopyKey {
  key: string;
  day: string;
  planId: Id;
}

/** Every copy this storage holds, oldest first. */
export function copyKeys(): CopyKey[] {
  const out: CopyKey[] = [];
  safely(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null || !key.startsWith(DAILY_PREFIX)) continue;
      const m = DAY.exec(key.slice(DAILY_PREFIX.length));
      if (m !== null) out.push({ key, day: m[1]!, planId: m[2]! });
    }
  });
  return out.sort((a, b) => a.day.localeCompare(b.day));
}

/** Frees room for something that comes first. False when there is no copy left. */
export function dropOldestCopy(except?: string): boolean {
  const oldest = copyKeys().find((c) => c.key !== except);
  if (oldest === undefined) return false;
  safely(() => localStorage.removeItem(oldest.key));
  return true;
}

/** Writes a copy, giving it older copies' room if it must. Never over another key. */
function put(key: string, text: string): boolean {
  for (;;) {
    const landed =
      safely(() => {
        localStorage.setItem(key, text);
        return true;
      }) === true;
    if (landed) return true;
    if (!dropOldestCopy(key)) return false;
  }
}

/** Keeps `planId`'s last `DAILY_COUNT` days. */
function prune(planId: Id): void {
  const mine = copyKeys().filter((c) => c.planId === planId);
  for (const c of mine.slice(0, Math.max(0, mine.length - DAILY_COUNT))) {
    safely(() => localStorage.removeItem(c.key));
  }
}

function holdsWork(text: string): boolean {
  const read = readStoredPlan(text);
  if (!('state' in read)) return false;
  const s = read.state;
  return s.teachers.length + s.classes.length + s.lessons.length + s.rooms.length > 0;
}

function readMarks(): Record<Id, string> {
  try {
    const raw = JSON.parse(safely(() => localStorage.getItem(DAILY_MARK_KEY)) ?? '{}') as unknown;
    return typeof raw === 'object' && raw !== null ? (raw as Record<Id, string>) : {};
  } catch {
    return {};
  }
}

/** What this window already marked, so an ordinary save reads nothing. */
const marked = new Map<Id, string>();

/**
 * Before a save of plan `planId`: on the first save of a new day, the plan as
 * the last day left it becomes that day's copy. The caller has already decided
 * that this window may write the plan (`useStore`'s `write`).
 */
export function keepDay(planId: Id, now = Date.now()): void {
  const day = isoDay(now);
  if (marked.get(planId) === day) return;
  marked.set(planId, day);
  const marks = readMarks();
  const last = marks[planId];
  if (last === day) return;
  if (last !== undefined && last < day) {
    const text = safely(() => localStorage.getItem(planKey(planId))) ?? null;
    const key = dailyKey(last, planId);
    // The day's end wins over a copy a restore wrote that day (`keepToday`).
    if (text !== null && holdsWork(text)) put(key, text);
    prune(planId);
  }
  marks[planId] = day;
  // Given room like a copy: a mark that cannot be written would leave every
  // later day finding the same old day.
  put(DAILY_MARK_KEY, JSON.stringify(marks));
}

/**
 * Before a restore: the plan as it stands now becomes today's copy, over an
 * earlier one of today. Nothing for an empty plan or once another window took
 * over (VK1); the caller does not ask for a plan this copy could not read.
 * Returns whether it landed.
 */
export function keepToday(planId: Id, state: State, now = Date.now()): boolean {
  if (writesClosed()) return false;
  if (
    state.teachers.length + state.classes.length + state.lessons.length + state.rooms.length ===
    0
  )
    return false;
  const landed = put(dailyKey(isoDay(now), planId), JSON.stringify(state));
  prune(planId);
  return landed;
}

/**
 * Once at startup: the copies of plans the library no longer has go, with
 * their day marks. Not when the plan is deleted: within the session the delete
 * has its "Geri al", and an undone delete must find its copies where they were.
 */
export function pruneOrphans(planIds: readonly Id[]): void {
  if (writesClosed()) return;
  const keep = new Set(planIds);
  for (const c of copyKeys()) {
    if (!keep.has(c.planId)) safely(() => localStorage.removeItem(c.key));
  }
  const marks = readMarks();
  const stale = Object.keys(marks).filter((id) => !keep.has(id));
  if (stale.length === 0) return;
  for (const id of stale) delete marks[id];
  safely(() => localStorage.setItem(DAILY_MARK_KEY, JSON.stringify(marks)));
}

export interface DailyCopy {
  day: string;
  state: State;
}

/** `planId`'s copies this copy of Mozaik can read, newest first. */
export function dailyCopies(planId: Id): DailyCopy[] {
  const out: DailyCopy[] = [];
  for (const c of copyKeys().reverse()) {
    if (c.planId !== planId) continue;
    const read = readStoredPlan(safely(() => localStorage.getItem(c.key)) ?? null);
    if ('state' in read) out.push({ day: c.day, state: read.state });
  }
  return out;
}
