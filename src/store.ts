// State management: reducer + undo stack + localStorage + backup file.
// No library, useReducer is enough.
//
// Data loss is unacceptable (docs/PLAN.md principle 6). Three layers of defence:
//   1. auto-save on every change (debounced)
//   2. on every start the previous session's state is pushed down a backup chain (last 3)
//   3. "Yedek indir" — the ONE habit my father will be taught

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { MAX_BLOCK, clampBlocks } from './blocks';
import { type Bundle, buildBundle } from './bundle';
import { sanitize } from './constraints';
import { defaultSubjects, emptyState, makeDay, newId, NO_TEACHER_LIMITS } from './entities';
import {
  addPlan,
  backupFileName,
  BASE_KEY,
  bundleFileName,
  dropPlanText,
  findPlan,
  type Library,
  planKey,
  readLibrary,
  readPlanText,
  removePlan,
  renamePlan as renameInLibrary,
  setActive,
  setDraft,
  uniquePlanName,
  writeLibrary,
  writePlanText,
} from './library';
import { firstFreeColor, PALETTE_SIZE } from './palette';
import { blankProgram } from './programs';
import type {
  ClassGroup,
  Day,
  Gender,
  Id,
  Lesson,
  ProgramVariant,
  Room,
  RuleLevel,
  State,
  Teacher,
} from './types';
import { SCHEMA_VERSION } from './types';

// The storage key lives in library.ts now: it is the key of plan "1", and which
// key belongs to which plan is that module's job. It is still USER DATA and
// still Turkish — renaming it would orphan every saved timetable.
const KEY = BASE_KEY;
const BACKUP_COUNT = 3;
const HISTORY_LIMIT = 30;
const SAVE_DELAY = 400; // ms — do not write on every drag frame

// ------------------------------------------------------------------ reducer

interface Box {
  present: State;
  past: State[];
  future: State[];
  /** Which plan `present` belongs to. Kept HERE so that a switch changes the
      timetable and its key in one step: an auto-save that saw them disagree for
      even one render would write one plan's work into another plan's key. */
  planId: Id;
}

type Action =
  | { type: 'change'; apply: (d: State) => State }
  | { type: 'program-change'; apply: (d: State) => State }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'load'; state: State }
  | { type: 'switch'; id: Id; state: State };

/** Exported so the undo/redo rules can be tested without mounting React. */
export function reduce(box: Box, action: Action): Box {
  switch (action.type) {
    case 'change': {
      const next = action.apply(box.present);
      if (next === box.present) return box; // no real change -> do not pollute history
      return {
        ...box,
        present: next,
        past: [...box.past, box.present].slice(-HISTORY_LIMIT),
        future: [],
      };
    }
    // A program boundary is also an undo boundary: an action created while
    // looking at one alternative must never be replayed into another.
    case 'program-change': {
      const next = sanitize(action.apply(box.present));
      if (next === box.present) return box;
      return { ...box, present: next, past: [], future: [] };
    }
    case 'undo': {
      const previous = box.past[box.past.length - 1];
      if (previous === undefined) return box;
      return {
        ...box,
        present: previous,
        past: box.past.slice(0, -1),
        future: [box.present, ...box.future],
      };
    }
    case 'redo': {
      const next = box.future[0];
      if (next === undefined) return box;
      return {
        ...box,
        present: next,
        past: [...box.past, box.present],
        future: box.future.slice(1),
      };
    }
    case 'load':
      return { ...box, present: sanitize(action.state), past: [], future: [] };
    // Switching plans clears the history on purpose: "undo" across a plan
    // boundary would put one plan's grid into another plan's file.
    case 'switch':
      return { present: sanitize(action.state), past: [], future: [], planId: action.id };
  }
}

// ------------------------------------------------------------------ parsing

/** v1 shape: Turkish field names. Kept only so old backups can still be opened. */
interface LegacyV1 {
  ayar?: { gunler?: unknown; saatler?: unknown };
  derslikler?: Array<{ id: string; ad: string }>;
  ogretmenler?: Array<{ id: string; ad: string; kisaltma: string; brans: string; renk: number }>;
  siniflar?: Array<{ id: string; ad: string; derslikId: string | null }>;
  dersler?: Array<{
    id: string;
    sinifId: string;
    ogretmenId: string;
    haftalikSaat: number;
    blok: number;
  }>;
  musaitDegil?: unknown;
  yerlesim?: unknown;
}

/** v2 shape: English names, but days were plain strings and there were no rules. */
interface LegacyV2 {
  settings?: { days?: unknown; hours?: unknown };
  rooms?: unknown;
  teachers?: unknown;
  classes?: unknown;
  lessons?: unknown;
  unavailable?: unknown;
  placements?: unknown;
}

const asArray = <T,>(x: unknown, fallback: T[]): T[] => (Array.isArray(x) ? (x as T[]) : fallback);
const asMap = <T,>(x: unknown): Record<string, T> =>
  typeof x === 'object' && x !== null ? (x as Record<string, T>) : {};
const asText = (x: unknown, fallback: string): string =>
  typeof x === 'string' ? x : fallback;
const asCount = (x: unknown, fallback: number): number =>
  typeof x === 'number' && Number.isFinite(x) ? Math.round(x) : fallback;
/** A limit box: a positive number, or null meaning "use the default". */
const asBox = (x: unknown): number | null =>
  typeof x === 'number' && Number.isFinite(x) && x > 0 ? Math.round(x) : null;

function asLevel(x: unknown, fallback: RuleLevel): RuleLevel {
  return x === 'off' || x === 'warn' || x === 'block' ? x : fallback;
}

/** Anything that is not one of the two letters means "not stated". */
function asGender(x: unknown): Gender {
  return x === 'k' || x === 'e' ? x : '';
}

/** subjectShorts: string -> non-empty string, anything else dropped. */
function asShorts(x: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(asMap<unknown>(x))) {
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

/** A stored list of names: strings only, trimmed, no blanks, no duplicates. */
function asNames(x: unknown, fallback: string[]): string[] {
  if (!Array.isArray(x)) return fallback;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of x) {
    if (typeof value !== 'string') continue;
    const name = value.trim();
    const key = name.toLocaleLowerCase('tr');
    if (name === '' || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out.length > 0 ? out : fallback;
}

/**
 * Gives everyone in a list a colour nobody else has.
 *
 * Needed on EVERY load, not only on migration: a v4 file was written when the
 * palette had 12 entries, so with more than twelve teachers colours repeat, and
 * a repeated colour is exactly what makes a pool card stop pointing at one row.
 * A file whose colours are already distinct comes back untouched, so opening a
 * backup twice cannot shuffle it.
 */
function spreadColors<T extends { color?: unknown }>(list: T[]): T[] {
  const taken = new Set<number>();
  let changed = false;

  const out = list.map((item) => {
    const raw = item.color;
    const current =
      typeof raw === 'number' && Number.isFinite(raw)
        ? Math.abs(Math.round(raw)) % PALETTE_SIZE
        : -1;
    if (current >= 0 && !taken.has(current)) {
      taken.add(current);
      return current === raw ? item : { ...item, color: current };
    }
    const fresh = firstFreeColor(taken);
    taken.add(fresh);
    changed = true;
    return { ...item, color: fresh };
  });

  return changed || out.some((x, i) => x !== list[i]) ? out : list;
}

/**
 * Migrates a v1 backup (Turkish field names) to the v2 shape.
 *
 * The ids never changed, so `musaitDegil` / `yerlesim` keys carry over as they
 * are. Without this every backup downloaded before the rename would be
 * unopenable — and my father has no other copy.
 */
function migrateV1(raw: LegacyV1): LegacyV2 {
  return {
    settings: { days: raw.ayar?.gunler, hours: raw.ayar?.saatler },
    rooms: asArray<NonNullable<LegacyV1['derslikler']>[number]>(raw.derslikler, []).map((x) => ({
      id: x.id,
      name: x.ad,
    })),
    teachers: asArray<NonNullable<LegacyV1['ogretmenler']>[number]>(raw.ogretmenler, []).map(
      (x) => ({ id: x.id, name: x.ad, short: x.kisaltma, subject: x.brans, color: x.renk }),
    ),
    classes: asArray<NonNullable<LegacyV1['siniflar']>[number]>(raw.siniflar, []).map((x) => ({
      id: x.id,
      name: x.ad,
      roomId: x.derslikId ?? null,
    })),
    lessons: asArray<NonNullable<LegacyV1['dersler']>[number]>(raw.dersler, []).map((x) => ({
      id: x.id,
      classId: x.sinifId,
      teacherId: x.ogretmenId,
      weeklyHours: x.haftalikSaat,
      blockSize: x.blok,
    })) as LegacyV2['lessons'],
    unavailable: raw.musaitDegil,
    placements: raw.yerlesim,
  };
}

/**
 * v2 -> v3: days become objects, bell times / limits / rules appear.
 *
 * `unavailable` and `placements` are carried over UNTOUCHED: ids did not
 * change and neither did the day indexes, so a timetable that was already laid
 * out survives exactly as it was.
 */
function migrateV2toV3(raw: LegacyV2): State {
  const blank = emptyState();
  const names = asArray<unknown>(raw.settings?.days, []).filter(
    (x): x is string => typeof x === 'string',
  );

  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      ...blank.settings,
      // Written out because `blank` is `emptyState()`, whose subject list is
      // now EMPTY by design. A v1/v2 file predates `settings.subjects`
      // entirely, so inheriting that emptiness would turn every subject its
      // teachers carry into a "listede değil" stray — silently, on open.
      subjects: defaultSubjects(),
      // A v2 file has no bell times at all; the school day drafted for v3 is
      // the most reasonable guess and it is visible on the Kurulum screen.
      days: names.length > 0 ? names.map(makeDay) : blank.settings.days,
      hours: asArray<unknown>(raw.settings?.hours, blank.settings.hours).filter(
        (x): x is string => typeof x === 'string',
      ),
    },
    rooms: asArray<Room>(raw.rooms, []),
    teachers: asArray<Omit<Teacher, 'limits' | 'gender' | 'subject2'>>(raw.teachers, []).map(
      (x) => ({
        ...x,
        // Neither of these can be in a v1/v2 file, and neither is guessed: a
        // gender is not read off a name, and a second subject nobody wrote down
        // is a subject nobody teaches.
        gender: '' as Gender,
        subject2: '',
        limits: { ...NO_TEACHER_LIMITS },
      }),
    ),
    classes: asArray<ClassGroup>(raw.classes, []),
    lessons: readLessons(asArray<unknown>(raw.lessons, []), 2),
    unavailable: asMap<1>(raw.unavailable),
    programs: [{
      ...blankProgram(),
      placements: asMap<string>(raw.placements),
    }],
    activeProgramId: 'program-1',
  };
}

/**
 * The lessons out of a file of ANY version.
 *
 * The shape of a week has been written three ways. v1..v6 stored `blockSize`
 * ("every block is this long"), v7 replaced it with `pairs` ("this many of the
 * hours are doubles"), and v9 replaces that with `blocks` (the list itself).
 * Each older form is read as the list it was always describing:
 *
 *   v9+     blocks, clamped
 *   v7 v8   `pairs` doubles, then singles
 *   v1..v6  floor(hours / blockSize) blocks that long, then singles
 *
 * THE THREE-HOUR BLOCK COMES BACK. v7's migration had to fold `blockSize: 3`
 * into doubles because 3 had stopped being expressible; it is expressible
 * again, so an old file gets to mean what it said. This is safe for exactly the
 * reason the fold was safe: the timetable itself never moved. A 3-hour run on
 * the grid is three hours of the same lesson in the same class either way,
 * every placement key is untouched, and no clash rule looks at a boundary (see
 * the contract in constraints.ts). Only the READING of that run changes — and
 * it now matches the drawing the file's author had in front of them.
 *
 * Nothing validated the old fields on the way in, so the list is clamped here
 * as well as in `sanitize()`: a hand-edited file can say anything.
 */
function readLessons(raw: unknown[], version: number): Lesson[] {
  return raw.map((item) => {
    const x = item as Partial<Lesson> & { blockSize?: unknown; pairs?: unknown };
    const weeklyHours = asCount(x.weeklyHours, 1);

    let blocks: number[];
    if (version >= 9) {
      blocks = clampBlocks(weeklyHours, asArray<unknown>(x.blocks, []).map((b) => asCount(b, 0)));
    } else if (version >= 7) {
      const pairs = Math.min(Math.floor(weeklyHours / 2), asCount(x.pairs, 0));
      blocks = Array<number>(Math.max(0, pairs)).fill(2);
    } else {
      const size = asCount(x.blockSize, 1);
      blocks =
        size >= 2
          ? Array<number>(Math.floor(weeklyHours / Math.min(size, MAX_BLOCK))).fill(
              Math.min(size, MAX_BLOCK),
            )
          : [];
    }

    return {
      id: x.id ?? '',
      classId: x.classId ?? '',
      teacherId: x.teacherId ?? '',
      weeklyHours,
      blocks: clampBlocks(weeklyHours, blocks),
      // A file below v8 cannot carry this and it is not guessed: every lesson
      // in it was taught under the teacher's only subject.
      second: x.second === true,
      maxPerDay: asBox(x.maxPerDay),
    };
  });
}

function readDays(x: unknown, fallback: Day[]): Day[] {
  const list = asArray<unknown>(x, []).flatMap((item): Day[] => {
    if (typeof item === 'string') return [makeDay(item)];
    if (typeof item !== 'object' || item === null) return [];
    const day = item as Partial<Day>;
    if (typeof day.name !== 'string') return [];
    return [{ name: day.name, longBreakAfter: asCount(day.longBreakAfter, 0) }];
  });
  return list.length > 0 ? list : fallback;
}

/**
 * Turns outside text into a State. Tolerates broken/missing fields; returns
 * null if it cannot be converted. ALWAYS ends with sanitize().
 */
export function parseState(text: string): State | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;

  const version = (raw as { schemaVersion?: unknown; semaSurumu?: unknown }).schemaVersion ??
    (raw as { semaSurumu?: unknown }).semaSurumu;

  const blank = emptyState();
  let candidate: State;

  if (version === 1) {
    candidate = migrateV2toV3(migrateV1(raw as LegacyV1));
  } else if (version === 2) {
    candidate = migrateV2toV3(raw as LegacyV2);
  } else if (
    version === 3 ||
    version === 4 ||
    version === 5 ||
    version === 6 ||
    version === 7 ||
    version === 8 ||
    version === 9 ||
    version === 10 ||
    version === 11 ||
    version === SCHEMA_VERSION
  ) {
    // v3..v11 go through ONE reader: most of them only ADD fields — a v3 file
    // arrives with no subject overrides, a v4 with no class colours and no
    // subject list, a v5 with no gender, a v7 with no second subject, a v10
    // with no daily limit on the class — and v7 is the only one that CHANGES
    // one, which `readLessons` below handles on its own. Ids, day indexes and therefore `unavailable` / `placements`
    // carry over untouched in every case.
    //
    // Every version below the current one is spelled out ON PURPOSE. Bumping
    // SCHEMA_VERSION without adding the number it used to be makes every backup
    // the previous release wrote fall through to `return null` below — which is
    // the one failure this whole function exists to prevent.
    //
    // IT HAPPENED. v9 shipped with `8` missing from this list, so every file the
    // RELEASED v2.0.0 wrote — the copy the reader actually has — parsed to null.
    // Nothing on screen could say why: `null` here is "unreadable file". The
    // comment above was already here and was not enough, because a sentence
    // cannot fail a test run. `store.test.ts` now reads one file per version.
    const g = raw as Partial<State> & {
      placements?: unknown;
      pinned?: unknown;
      programs?: unknown;
      activeProgramId?: unknown;
    };
    const limits = g.settings?.limits;
    const rules = g.settings?.rules;
    candidate = {
      schemaVersion: SCHEMA_VERSION,
      settings: {
        schoolName: asText(g.settings?.schoolName, ''),
        days: readDays(g.settings?.days, blank.settings.days),
        hours: asArray<string>(g.settings?.hours, blank.settings.hours),
        bell: {
          start: asText(g.settings?.bell?.start, blank.settings.bell.start),
          lessonMinutes: asCount(g.settings?.bell?.lessonMinutes, blank.settings.bell.lessonMinutes),
          breakMinutes: asCount(g.settings?.bell?.breakMinutes, blank.settings.bell.breakMinutes),
          longBreakMinutes: asCount(
            g.settings?.bell?.longBreakMinutes,
            blank.settings.bell.longBreakMinutes,
          ),
        },
        limits: {
          maxConsecutive: asCount(limits?.maxConsecutive, 0),
          maxPerDay: asCount(limits?.maxPerDay, 0),
          minPerDay: asCount(limits?.minPerDay, 0),
          maxSameLessonPerDay: asCount(limits?.maxSameLessonPerDay, 0),
        },
        rules: {
          maxConsecutive: asLevel(rules?.maxConsecutive, blank.settings.rules.maxConsecutive),
          maxPerDay: asLevel(rules?.maxPerDay, blank.settings.rules.maxPerDay),
          minPerDay: asLevel(rules?.minPerDay, blank.settings.rules.minPerDay),
          maxSameLessonPerDay: asLevel(
            rules?.maxSameLessonPerDay,
            blank.settings.rules.maxSameLessonPerDay,
          ),
        },
        subjects: asNames(g.settings?.subjects, defaultSubjects()),
        subjectShorts: asShorts(g.settings?.subjectShorts),
      },
      rooms: asArray(g.rooms, blank.rooms),
      teachers: spreadColors(
        asArray<Teacher>(g.teachers, blank.teachers).map((t) => ({
          ...t,
          gender: asGender(t.gender),
          subject2: asText(t.subject2, ''),
          limits: {
            maxConsecutive: asBox(t.limits?.maxConsecutive),
            maxPerDay: asBox(t.limits?.maxPerDay),
            minPerDay: asBox(t.limits?.minPerDay),
          },
        })),
      ),
      // A v10 file and below arrives with no daily limit on the class, and
      // `null` is exactly what that means: use the school's number. `asBox` is
      // the same reader the three teacher boxes go through.
      classes: spreadColors(
        asArray<ClassGroup>(g.classes, blank.classes).map((c) => ({
          ...c,
          maxSameLessonPerDay: asBox(c.maxSameLessonPerDay),
        })),
      ),
      lessons: readLessons(asArray<unknown>(g.lessons, blank.lessons), Number(version)),
      unavailable: asMap<1>(g.unavailable),
      programs:
        Number(version) >= 12
          ? asArray<Partial<ProgramVariant>>(g.programs, []).map((program) => ({
              id: asText(program.id, ''),
              name: asText(program.name, ''),
              placements: asMap<Id>(program.placements),
              pinned: asMap<1>(program.pinned),
            }))
          : [{
              ...blankProgram(),
              placements: asMap<Id>(g.placements),
              // v9 and below arrive with none, which is the right answer.
              pinned: asMap<1>(g.pinned),
            }],
      activeProgramId:
        Number(version) >= 12 ? asText(g.activeProgramId, '') : 'program-1',
    };
  } else {
    return null; // an unknown (newer) version is not guessed at
  }

  const hours = candidate.settings.hours.filter((x) => typeof x === 'string');

  return sanitize({
    ...candidate,
    settings: {
      ...candidate.settings,
      days: candidate.settings.days.length > 0 ? candidate.settings.days : blank.settings.days,
      hours: hours.length > 0 ? hours : blank.settings.hours,
    },
  });
}

// ------------------------------------------------------------ persistence

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
function rotateBackups(key: string): void {
  safely(() => {
    for (let i = BACKUP_COUNT - 1; i > 0; i--) {
      const previous = localStorage.getItem(`${KEY}-yedek-${i - 1}`);
      if (previous !== null) localStorage.setItem(`${KEY}-yedek-${i}`, previous);
    }
    const current = localStorage.getItem(key);
    if (current !== null) localStorage.setItem(`${KEY}-yedek-0`, current);
  });
}

/** For recovery: the list of stored backups (newest first). */
export function listBackups(): Array<{ index: number; state: State }> {
  const list: Array<{ index: number; state: State }> = [];
  for (let i = 0; i < BACKUP_COUNT; i++) {
    const text = safely(() => localStorage.getItem(`${KEY}-yedek-${i}`));
    if (text == null) continue;
    const state = parseState(text);
    if (state !== null) list.push({ index: i, state });
  }
  return list;
}

// ------------------------------------------------------------------- files

/** Hands the browser a file to save. Both file kinds go through here. */
function download(name: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadBackup(d: State): void {
  download(backupFileName(new Date()), JSON.stringify(d));
}

// ------------------------------------------------------------- the bundle
//
// One file holding EVERY plan. The single-plan file is unchanged and still
// what the top bar writes; this is the one that moves a whole setup between
// two computers — and, once the .exe and the site exist, between those two.

/**
 * The state of every plan in the library.
 *
 * The OPEN plan comes from memory, not from its key: the autosave is debounced
 * by 400 ms, so the key can be a few hundred milliseconds behind what is on
 * screen, and a backup that quietly drops the last edit is worse than none.
 * A plan whose key is gone is skipped rather than exported empty.
 */
export function collectStates(
  library: Library,
  planId: Id,
  present: State,
): Record<Id, State> {
  const out: Record<Id, State> = {};
  for (const plan of library.plans) {
    const state = plan.id === planId ? present : loadPlan(plan.id);
    if (state !== null) out[plan.id] = state;
  }
  return out;
}

export function downloadBundle(library: Library, planId: Id, present: State): number {
  const states = collectStates(library, planId, present);
  download(bundleFileName(new Date()), buildBundle(library, states));
  return Object.keys(states).length;
}


// -------------------------------------------------------------------- hook

function initialBox(): Box {
  // First run: the directory does not exist yet, so `readLibrary()` hands back
  // the one-plan default whose id is "1" — and plan "1"'s key IS the key the
  // timetable is already sitting in. Adoption therefore copies NOTHING.
  const library = readLibrary();
  writeLibrary(library);
  rotateBackups(planKey(library.activeId));
  return {
    present: loadPlan(library.activeId) ?? emptyState(),
    past: [],
    future: [],
    planId: library.activeId,
  };
}

/** While typing in a text box let the browser handle Ctrl+Z, do not grab it. */
function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

export function useStore() {
  const [box, dispatch] = useReducer(reduce, undefined, initialBox);
  const [library, setLibrary] = useState<Library>(readLibrary);

  const change = useCallback((apply: (d: State) => State) => {
    dispatch({ type: 'change', apply });
  }, []);
  const manageProgram = useCallback((apply: (d: State) => State) => {
    dispatch({ type: 'program-change', apply });
  }, []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const loadState = useCallback((state: State) => dispatch({ type: 'load', state }), []);

  // Auto-save — debounced, otherwise we write JSON on every drag frame. The
  // state and the key it goes to come from the SAME box, so a pending write can
  // never land in the wrong plan.
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => savePlan(box.planId, box.present), SAVE_DELAY);
    return () => window.clearTimeout(timer.current);
  }, [box.present, box.planId]);

  // Flush the pending save when the tab closes.
  useEffect(() => {
    const flush = () => savePlan(box.planId, box.present);
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [box.present, box.planId]);

  // --------------------------------------------------------- the plan library
  //
  // Every one of these first FLUSHES the plan being left. The debounce is 400 ms
  // and the effect's cleanup cancels a pending write whenever the box changes,
  // so without this the last edit before a switch is simply dropped — silently,
  // which is the only kind of data loss that matters.
  const park = useCallback(() => {
    window.clearTimeout(timer.current);
    savePlan(box.planId, box.present);
  }, [box.planId, box.present]);

  const commit = useCallback((next: Library) => {
    writeLibrary(next);
    setLibrary(next);
  }, []);

  const switchPlan = useCallback(
    (id: Id) => {
      if (id === box.planId || findPlan(library, id) === undefined) return;
      park();
      dispatch({ type: 'switch', id, state: loadPlan(id) ?? emptyState() });
      commit(setActive(library, id));
    },
    [box.planId, park, commit, library],
  );

  /**
   * Creates a plan from `seed` and opens it.
   *
   * One primitive, four buttons: an empty school, a copy of this plan, a copy
   * with the grid emptied (a draft), or a copy of a draft. The plan's DATA is
   * written before the directory entry, so a failed write can never leave the
   * directory pointing at a key with nothing in it.
   */
  const createPlan = useCallback(
    (name: string, seed: State, draft = false): Id => {
      park();
      const id = newId();
      const clean = sanitize(seed);
      savePlan(id, clean);
      commit(setActive(addPlan(library, { id, name: uniquePlanName(library, name), draft }), id));
      dispatch({ type: 'switch', id, state: clean });
      return id;
    },
    [park, commit, library],
  );

  const deletePlan = useCallback(
    (id: Id) => {
      const next = removePlan(library, id);
      if (next === library) return; // the last plan, or an id nobody knows
      // Flush FIRST even when the victim is the open plan: park() also cancels
      // the pending write, which is what stops a timer from resurrecting the
      // key one beat after it was dropped.
      park();
      commit(next);
      dropPlanText(id);
      if (id === box.planId) {
        dispatch({ type: 'switch', id: next.activeId, state: loadPlan(next.activeId) ?? emptyState() });
      }
    },
    [library, commit, park, box.planId],
  );

  const renamePlan = useCallback(
    (id: Id, name: string) => commit(renameInLibrary(library, id, name)),
    [library, commit],
  );

  const markDraft = useCallback(
    (id: Id, draft: boolean) => commit(setDraft(library, id, draft)),
    [library, commit],
  );

  /**
   * Replaces the WHOLE library with the contents of a bundle file.
   *
   * The order of the steps below is the safety argument, not housekeeping:
   *
   *  1. cancel the pending autosave. `park()` is deliberately NOT used here —
   *     park WRITES the outgoing plan, and its key is about to be overwritten.
   *     But leaving the timer alive is pitfall 27 in a mirror: 400 ms later the
   *     old state would land in the newly imported library's key.
   *  2. parse everything BEFORE touching storage. If not one plan can be read,
   *     nothing at all changes: a half-finished import is two truths.
   *  3. write the data, counting what did not fit (quota).
   *  4. drop the keys of plans the incoming library does not have.
   *  5. write the directory LAST, once its data is really in place — the same
   *     rule createPlan already follows.
   */
  const replaceLibrary = useCallback(
    (bundle: Bundle): { ok: number; failed: number } => {
      window.clearTimeout(timer.current);

      const parsed: Array<{ id: Id; state: State }> = [];
      for (const plan of bundle.library.plans) {
        const raw = bundle.states[plan.id];
        const state = raw === undefined ? null : parseState(JSON.stringify(raw));
        if (state !== null) parsed.push({ id: plan.id, state });
      }
      if (parsed.length === 0) return { ok: 0, failed: bundle.library.plans.length };

      const kept = new Set(parsed.map((x) => x.id));
      let failed = bundle.library.plans.length - parsed.length;
      let ok = 0;
      for (const { id, state } of parsed) {
        if (savePlan(id, state)) ok++;
        else failed++;
      }

      for (const plan of library.plans) {
        if (!kept.has(plan.id)) dropPlanText(plan.id);
      }

      const next: Library = {
        plans: bundle.library.plans.filter((p) => kept.has(p.id)),
        activeId: kept.has(bundle.library.activeId)
          ? bundle.library.activeId
          : parsed[0]!.id,
      };
      commit(next);
      dispatch({
        type: 'switch',
        id: next.activeId,
        state: parsed.find((x) => x.id === next.activeId)?.state ?? parsed[0]!.state,
      });
      return { ok, failed };
    },
    [library, commit],
  );

  // Ctrl+Z / Ctrl+Y — dropping a card in the wrong place happens constantly,
  // so this is a basic function, not a nicety.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (isTextInput(e.target)) return;
      const letter = e.key.toLowerCase();
      if (letter === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (letter === 'y' || (letter === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return {
    state: box.present,
    change,
    manageProgram,
    undo,
    redo,
    loadState,
    // Exposed for the one caller that leaves the page without unloading it:
    // the exe restarting onto a new version. `beforeunload` covers a closing
    // tab, but a WebView2 window torn down by `app.exit(0)` is not a closing
    // tab, and the 400 ms debounce is exactly long enough to eat the edit
    // somebody made right before pressing the button (pitfall 28).
    park,
    canUndo: box.past.length > 0,
    canRedo: box.future.length > 0,
    plans: {
      library,
      planId: box.planId,
      switchPlan,
      createPlan,
      deletePlan,
      renamePlan,
      markDraft,
      replaceLibrary,
    },
  };
}
