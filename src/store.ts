// State management: reducer + undo stack + localStorage + backup file.
// No library, useReducer is enough.
//
// Data loss is unacceptable (docs/PLAN.md principle 6). Three layers of defence:
//   1. auto-save on every change (debounced)
//   2. on every start the previous session's state is pushed down a backup chain (last 3)
//   3. "Yedek indir" — the ONE habit my father will be taught

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { sanitize } from './constraints';
import { emptyState, makeDay, NO_TEACHER_LIMITS } from './entities';
import type {
  ClassGroup,
  Day,
  Lesson,
  Room,
  RuleLevel,
  State,
  Teacher,
} from './types';
import { SCHEMA_VERSION } from './types';

// The storage key and the backup file name are USER DATA, not identifiers:
// renaming them would orphan every saved timetable. They stay Turkish.
const KEY = 'ders-programi';
const BACKUP_COUNT = 3;
const HISTORY_LIMIT = 30;
const SAVE_DELAY = 400; // ms — do not write on every drag frame

// ------------------------------------------------------------------ reducer

interface Box {
  present: State;
  past: State[];
  future: State[];
}

type Action =
  | { type: 'change'; apply: (d: State) => State }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'load'; state: State };

function reduce(box: Box, action: Action): Box {
  switch (action.type) {
    case 'change': {
      const next = action.apply(box.present);
      if (next === box.present) return box; // no real change -> do not pollute history
      return {
        present: next,
        past: [...box.past, box.present].slice(-HISTORY_LIMIT),
        future: [],
      };
    }
    case 'undo': {
      const previous = box.past[box.past.length - 1];
      if (previous === undefined) return box;
      return { present: previous, past: box.past.slice(0, -1), future: [box.present, ...box.future] };
    }
    case 'redo': {
      const next = box.future[0];
      if (next === undefined) return box;
      return { present: next, past: [...box.past, box.present], future: box.future.slice(1) };
    }
    case 'load':
      return { present: sanitize(action.state), past: [], future: [] };
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
  } else if (version === SCHEMA_VERSION) {
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
      },
      rooms: asArray(g.rooms, blank.rooms),
      teachers: asArray<Teacher>(g.teachers, blank.teachers).map((t) => ({
        ...t,
        limits: {
          maxConsecutive: asBox(t.limits?.maxConsecutive),
          maxPerDay: asBox(t.limits?.maxPerDay),
          minPerDay: asBox(t.limits?.minPerDay),
        },
      })),
      classes: asArray(g.classes, blank.classes),
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

export function save(d: State): void {
  safely(() => localStorage.setItem(KEY, JSON.stringify(d)));
}

export function load(): State | null {
  const text = safely(() => localStorage.getItem(KEY));
  return text == null ? null : parseState(text);
}

/**
 * Once at startup: pushes the previous session's state down the backup chain.
 * Rotating on every change is expensive on a slow machine; once per session is
 * enough, and the last 3 SESSIONS are worth more than the last 3 clicks.
 */
function rotateBackups(): void {
  safely(() => {
    for (let i = BACKUP_COUNT - 1; i > 0; i--) {
      const previous = localStorage.getItem(`${KEY}-yedek-${i - 1}`);
      if (previous !== null) localStorage.setItem(`${KEY}-yedek-${i}`, previous);
    }
    const current = localStorage.getItem(KEY);
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
  rotateBackups();
  return { present: load() ?? emptyState(), past: [], future: [] };
}

/** While typing in a text box let the browser handle Ctrl+Z, do not grab it. */
function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

export function useStore() {
  const [box, dispatch] = useReducer(reduce, undefined, initialBox);

  const change = useCallback((apply: (d: State) => State) => {
    dispatch({ type: 'change', apply });
  }, []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const loadState = useCallback((state: State) => dispatch({ type: 'load', state }), []);

  // Auto-save — debounced, otherwise we write JSON on every drag frame.
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save(box.present), SAVE_DELAY);
    return () => window.clearTimeout(timer.current);
  }, [box.present]);

  // Flush the pending save when the tab closes.
  useEffect(() => {
    const flush = () => save(box.present);
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [box.present]);

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
  };
}
