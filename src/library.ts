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

import { isDesktop } from './desktop';
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

// ------------------------------------------------------------- file names
//
// Both downloaded file names live here for the same reason the keys do: they
// are the IDENTITY of my father's data, not identifiers in the code. They are
// built from one stamp so the two kinds can never drift apart in format.

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function stamp(now: Date): string {
  return (
    `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}` +
    `-${pad2(now.getHours())}${pad2(now.getMinutes())}`
  );
}

/** One plan: `ders-programi-2026-08-25-1830.json`. */
export function backupFileName(now: Date): string {
  return `${BASE_KEY}-${stamp(now)}.json`;
}

/**
 * Every plan: `ders-programi-tumu-2026-08-25-1830.json`.
 *
 * The `-tumu-` marker is not decoration: in Explorer it is the only thing that
 * tells my father which of two .json files holds the whole library.
 */
export function bundleFileName(now: Date): string {
  return `${BASE_KEY}-tumu-${stamp(now)}.json`;
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

/**
 * Returns whether the write actually happened.
 *
 * `safely` swallows the exception, and a swallowed quota error is a SILENT
 * loss — the one kind that matters (principle 6). One plan at a time nobody
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

// ------------------------------------------------------- where the data is
//
// Ayarlar > Veri has to be able to say exactly where my father's work sits,
// with the real key names and the real sizes. Anything vaguer than that is the
// same as saying nothing: "it is saved in the browser" does not tell him that
// clearing browsing data destroys it.

export type StorageKind = 'file' | 'site' | 'exe';

/**
 * THREE answers now. The third arrived with the exe (task 4g/4h) and not
 * before: an earlier version of this comment said it would be written "then",
 * because a branch for code that does not exist is a guess (principle 5).
 *
 * The exe is asked about FIRST. It is served over a normal origin, so the
 * `file:`/site question would answer "site" about it and be true and useless:
 * what a person reading this panel needs to know is not the protocol, it is
 * whether "tarama verilerini temizle" can take their work away.
 */
export function storageKind(): StorageKind {
  if (isDesktop()) return 'exe';
  return safely(() => location.protocol) === 'file:' ? 'file' : 'site';
}

/**
 * WHICH copy of the program this is, in the words the four delivery routes are
 * described in (README). Separate from `StorageKind` on purpose: that type
 * answers "can 'tarama verilerini temizle' take this away", and three of these
 * four routes answer it the same way. This one answers "which one am I
 * looking at", which is the question somebody asks before they tell me what
 * went wrong.
 *
 * The Windows install is a `site` as far as storage goes — it IS an http
 * origin — but calling it "Site" on my father's own machine would send him to
 * look for an internet address that does not exist.
 */
export function routeName(): string {
  if (isDesktop()) return 'Uygulama (.exe)';
  if (safely(() => location.protocol) === 'file:') return 'Dosya (çift tıklanan .html)';
  return safely(() => location.hostname)?.endsWith('.localhost') === true
    ? 'Windows kurulumu'
    : 'Site';
}

/**
 * The address this copy's storage belongs to, verbatim, because "the browser's
 * store for this site" leaves out the one word that matters. Every route has
 * its OWN store, and two of them look identical on screen.
 *
 * '' in the exe: there is an origin there too, but it is an implementation
 * detail of the window rather than somewhere anybody can go.
 */
export function storageAddress(): string {
  if (isDesktop()) return '';
  const origin = safely(() => location.origin) ?? '';
  if (origin === 'file://' || origin === 'null' || origin === '') return 'file://';
  return origin + (safely(() => location.pathname) ?? '');
}

export interface StorageRow {
  key: string;
  what: string;
  /** UTF-16 code units. Doubled for the byte figure: that is what the browser
      charges against its ~5 MB quota, not the UTF-8 length. */
  chars: number;
}

export interface StorageReport {
  rows: StorageRow[];
  totalChars: number;
}

function charsAt(key: string): number {
  return (safely(() => localStorage.getItem(key)) ?? '').length;
}

/** Every key this program owns, in the order they matter. Missing keys are
    listed too, with 0 — an absent backup chain is information as well. */
export function storageReport(lib: Library): StorageReport {
  const rows: StorageRow[] = lib.plans.map((plan) => ({
    key: planKey(plan.id),
    what: plan.draft ? `${plan.name} (taslak)` : plan.name,
    chars: charsAt(planKey(plan.id)),
  }));

  rows.push({ key: LIBRARY_KEY, what: 'plan listesi', chars: charsAt(LIBRARY_KEY) });
  for (let i = 0; i < 3; i++) {
    rows.push({
      key: `${BASE_KEY}-yedek-${i}`,
      what: i === 0 ? 'bir önceki oturum' : `${i + 1} oturum önce`,
      chars: charsAt(`${BASE_KEY}-yedek-${i}`),
    });
  }
  rows.push({ key: `${BASE_KEY}-tema`, what: 'tema tercihi', chars: charsAt(`${BASE_KEY}-tema`) });
  rows.push({ key: `${BASE_KEY}-dil`, what: 'dil tercihi', chars: charsAt(`${BASE_KEY}-dil`) });
  rows.push({
    key: `${BASE_KEY}-kenar`,
    what: 'kenar çubuğu tercihi',
    chars: charsAt(`${BASE_KEY}-kenar`),
  });
  rows.push({
    key: `${BASE_KEY}-olcek`,
    what: 'yazı büyüklüğü tercihi',
    chars: charsAt(`${BASE_KEY}-olcek`),
  });
  rows.push({
    key: `${BASE_KEY}-yogunluk`,
    what: 'arayüz yoğunluğu tercihi',
    chars: charsAt(`${BASE_KEY}-yogunluk`),
  });
  rows.push({
    key: `${BASE_KEY}-havuz`,
    what: 'havuz çekmecesi tercihi',
    chars: charsAt(`${BASE_KEY}-havuz`),
  });
  // These two arrived with the C round and the panel was never told. A report
  // that leaves a key out is worse than no report: the one thing it is for is
  // being trusted when somebody asks "is all of it in here?".
  rows.push({
    key: `${BASE_KEY}-havuz-boy`,
    what: 'havuz çekmecesinin boyu',
    chars: charsAt(`${BASE_KEY}-havuz-boy`),
  });
  rows.push({
    key: `${BASE_KEY}-serit`,
    what: 'araç şeridi tercihi',
    chars: charsAt(`${BASE_KEY}-serit`),
  });
  rows.push({
    key: `${BASE_KEY}-musaitlik-saat`,
    what: 'müsaitlikte saat gösterimi',
    chars: charsAt(`${BASE_KEY}-musaitlik-saat`),
  });
  rows.push({
    key: `${BASE_KEY}-hareket`,
    what: 'hareket (animasyon) tercihi',
    chars: charsAt(`${BASE_KEY}-hareket`),
  });
  rows.push({
    key: `${BASE_KEY}-tanitim`,
    what: 'örnek veri satırı görüldü mü',
    chars: charsAt(`${BASE_KEY}-tanitim`),
  });
  // The print options were the F round's key and this report was never told.
  // It hid because the key is only WRITTEN when somebody changes a print
  // option, so a fresh profile has nothing to leave out — the panel would
  // have started lying on the first day my father touched "Sayfada ne olsun",
  // and the one thing this table is for is being trusted.
  rows.push({
    key: `${BASE_KEY}-baski`,
    what: 'kâğıt seçenekleri',
    chars: charsAt(`${BASE_KEY}-baski`),
  });

  return { rows, totalChars: rows.reduce((sum, r) => sum + r.chars, 0) };
}
