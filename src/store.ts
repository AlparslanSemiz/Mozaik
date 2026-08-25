// State management: reducer + undo stack + localStorage + backup file.
// No library, useReducer is enough.
//
// Data loss is unacceptable (docs/PLAN.md principle 6). Three layers of defence:
//   1. auto-save on every change (debounced)
//   2. on every start the previous session's state is pushed down a backup chain (last 3)
//   3. "Yedek indir" — the ONE habit my father will be taught

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { sanitize } from './constraints';
import { defaultSubjects, emptyState, makeDay, newId, NO_TEACHER_LIMITS } from './entities';
import {
  addPlan,
  BASE_KEY,
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
import type {
  ClassGroup,
  Day,
  Id,
  Lesson,
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
    })),
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
      // A v2 file has no bell times at all; the school day drafted for v3 is
      // the most reasonable guess and it is visible on the Kurulum screen.
      days: names.length > 0 ? names.map(makeDay) : blank.settings.days,
      hours: asArray<unknown>(raw.settings?.hours, blank.settings.hours).filter(
        (x): x is string => typeof x === 'string',
      ),
    },
    rooms: asArray<Room>(raw.rooms, []),
    teachers: asArray<Omit<Teacher, 'limits'>>(raw.teachers, []).map((x) => ({
      ...x,
      limits: { ...NO_TEACHER_LIMITS },
    })),
    classes: asArray<ClassGroup>(raw.classes, []),
    lessons: asArray<Omit<Lesson, 'maxPerDay'>>(raw.lessons, []).map((x) => ({
      ...x,
      maxPerDay: null,
    })),
    unavailable: asMap<1>(raw.unavailable),
    placements: asMap<string>(raw.placements),
  };
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
  } else if (version === 3 || version === 4 || version === SCHEMA_VERSION) {
    // v3, v4 and v5 only ADD fields, so one reader does all three: a v3 file
    // arrives with no subject overrides, a v4 file with no class colours and no
    // subject list, and both get filled in below. Ids, day indexes and
    // therefore `unavailable` / `placements` carry over untouched.
    const g = raw as Partial<State>;
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
          limits: {
            maxConsecutive: asBox(t.limits?.maxConsecutive),
            maxPerDay: asBox(t.limits?.maxPerDay),
            minPerDay: asBox(t.limits?.minPerDay),
          },
        })),
      ),
      classes: spreadColors(asArray<ClassGroup>(g.classes, blank.classes)),
      lessons: asArray<Lesson>(g.lessons, blank.lessons).map((x) => ({
        ...x,
        maxPerDay: asBox(x.maxPerDay),
      })),
      unavailable: asMap<1>(g.unavailable),
      placements: asMap<string>(g.placements),
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

/** Writes ONE plan. The key is derived from the id, never from "the current". */
export function savePlan(id: Id, d: State): void {
  writePlanText(id, JSON.stringify(d));
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

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function downloadBackup(d: State): void {
  const t = new Date();
  const name =
    `ders-programi-${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}` +
    `-${pad2(t.getHours())}${pad2(t.getMinutes())}.json`;

  const blob = new Blob([JSON.stringify(d)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function readBackupFile(file: File): Promise<State | null> {
  return file.text().then(parseState);
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
    undo,
    redo,
    loadState,
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
    },
  };
}
