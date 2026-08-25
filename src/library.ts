// The plan library: several timetables kept side by side, and which one is open.
//
// Deliberately NOT part of `State` (decision of 2026-08-25): which plan is open
// is a property of THIS machine's storage, exactly like the theme and the rail
// width. So `State` and `schemaVersion` do not move and no migration is needed
// — a backup file is still one plan, and every old backup still opens.
//
// This module knows about KEYS and plan metadata. It does NOT know what a State
// is: it hands out and takes back raw strings, and `store.ts` is the only place
// that parses them. That is what keeps store.ts <-> library.ts free of a runtime
// cycle, the same arrangement `keys.ts` has for constraints <-> rules.

import type { Id } from './types';

/**
 * The storage key and the backup file name are USER DATA, not identifiers:
 * renaming them would orphan every saved timetable. They stay Turkish.
 */
export const BASE_KEY = 'ders-programi';
export const LIBRARY_KEY = `${BASE_KEY}-planlar`;

/**
 * The first plan keeps the HISTORICAL key, and that is the whole point.
 *
 * Adopting the single timetable that already exists then costs zero writes:
 * the directory is created and `ders-programi` is not touched by a single byte.
 * No copy means no half-finished copy (principle 6). It also means an older
 * dist/index.html still finds the timetable, and everything that reads
 * `ders-programi` — the backup chain, the E2E helpers — keeps working.
 *
 * A generated id can never collide with it: `newId()` draws from an alphabet
 * with no `1` in it (entities.ts). `library.test.ts` pins that down.
 */
export const FIRST_PLAN_ID = '1';
export const FIRST_PLAN_NAME = '1. plan';

/** A draft is not a separate kind of thing — it is a plan with a flag. */
export interface PlanInfo {
  id: Id;
  name: string;
  draft: boolean;
}

export interface Library {
  activeId: Id;
  plans: PlanInfo[];
}

export function planKey(id: Id): string {
  return id === FIRST_PLAN_ID ? BASE_KEY : `${BASE_KEY}-plan-${id}`;
}

export function defaultLibrary(): Library {
  return {
    activeId: FIRST_PLAN_ID,
    plans: [{ id: FIRST_PLAN_ID, name: FIRST_PLAN_NAME, draft: false }],
  };
}

/**
 * Turns whatever is in storage into a usable library. NEVER returns null and
 * never throws: a broken directory must not hide a timetable that is still
 * sitting in its own key.
 *
 * An entry with an unusable NAME is kept and renamed, not dropped — the name is
 * decoration, the id is the pointer to the data. Only an entry with no usable
 * id is dropped, because that one points nowhere.
 */
export function normalizeLibrary(raw: unknown): Library {
  if (typeof raw !== 'object' || raw === null) return defaultLibrary();
  const g = raw as { activeId?: unknown; plans?: unknown };

  const seen = new Set<Id>();
  const plans: PlanInfo[] = [];
  for (const item of Array.isArray(g.plans) ? g.plans : []) {
    if (typeof item !== 'object' || item === null) continue;
    const p = item as { id?: unknown; name?: unknown; draft?: unknown };
    if (typeof p.id !== 'string' || p.id === '' || seen.has(p.id)) continue;
    const name = typeof p.name === 'string' ? p.name.trim() : '';
    seen.add(p.id);
    plans.push({ id: p.id, name: name === '' ? 'Adsız plan' : name, draft: p.draft === true });
  }
  if (plans.length === 0) return defaultLibrary();

  const activeId =
    typeof g.activeId === 'string' && seen.has(g.activeId) ? g.activeId : plans[0]!.id;
  return { activeId, plans };
}

export function parseLibrary(text: string | null): Library {
  if (text === null) return defaultLibrary();
  try {
    return normalizeLibrary(JSON.parse(text));
  } catch {
    return defaultLibrary();
  }
}

export function findPlan(lib: Library, id: Id): PlanInfo | undefined {
  return lib.plans.find((p) => p.id === id);
}

export function activePlan(lib: Library): PlanInfo {
  return findPlan(lib, lib.activeId) ?? lib.plans[0]!;
}

export function drafts(lib: Library): PlanInfo[] {
  return lib.plans.filter((p) => p.draft);
}

export function addPlan(lib: Library, plan: PlanInfo): Library {
  if (findPlan(lib, plan.id) !== undefined) return lib;
  return { ...lib, plans: [...lib.plans, plan] };
}

export function renamePlan(lib: Library, id: Id, name: string): Library {
  const clean = name.trim();
  if (clean === '') return lib; // an empty box keeps the old name, never blanks it
  return { ...lib, plans: lib.plans.map((p) => (p.id === id ? { ...p, name: clean } : p)) };
}

export function setDraft(lib: Library, id: Id, draft: boolean): Library {
  return { ...lib, plans: lib.plans.map((p) => (p.id === id ? { ...p, draft } : p)) };
}

export function setActive(lib: Library, id: Id): Library {
  return findPlan(lib, id) === undefined ? lib : { ...lib, activeId: id };
}

/** The last plan cannot be removed: there is always exactly one open timetable. */
export function removePlan(lib: Library, id: Id): Library {
  if (lib.plans.length <= 1) return lib;
  const plans = lib.plans.filter((p) => p.id !== id);
  if (plans.length === lib.plans.length) return lib;
  return { activeId: lib.activeId === id ? plans[0]!.id : lib.activeId, plans };
}

/**
 * A name nobody else has. Two plans called "1. plan" in the top bar's picker
 * would be two identical options, and picking the wrong one loses an afternoon.
 */
export function uniquePlanName(lib: Library, base: string): string {
  const taken = new Set(lib.plans.map((p) => p.name.toLocaleLowerCase('tr')));
  const wanted = base.trim() === '' ? 'Plan' : base.trim();
  if (!taken.has(wanted.toLocaleLowerCase('tr'))) return wanted;
  for (let n = 2; ; n++) {
    const candidate = `${wanted} ${n}`;
    if (!taken.has(candidate.toLocaleLowerCase('tr'))) return candidate;
  }
}

/** The name a brand new plan gets offered: "2. plan", "3. plan"... */
export function nextPlanName(lib: Library): string {
  return uniquePlanName(lib, `${lib.plans.length + 1}. plan`);
}

// ------------------------------------------------------------- storage layer
//
// Raw strings only. Same `safely` guard as store.ts: localStorage can be
// disabled, full, or absent under file:// in a locked-down browser.

function safely<T>(job: () => T): T | null {
  try {
    return job();
  } catch {
    return null;
  }
}

export function readLibrary(): Library {
  return parseLibrary(safely(() => localStorage.getItem(LIBRARY_KEY)) ?? null);
}

export function writeLibrary(lib: Library): void {
  safely(() => localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib)));
}

export function readPlanText(id: Id): string | null {
  return safely(() => localStorage.getItem(planKey(id))) ?? null;
}

export function writePlanText(id: Id, text: string): void {
  safely(() => localStorage.setItem(planKey(id), text));
}

export function dropPlanText(id: Id): void {
  safely(() => localStorage.removeItem(planKey(id)));
}
