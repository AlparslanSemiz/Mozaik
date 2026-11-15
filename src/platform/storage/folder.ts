// The folder my father picks (task B4, the old 4l).
//
// The no-data-loss principle says data loss is unacceptable, and until now the whole answer
// was one habit: "değişiklik yaptın, yedek indir". A habit is a real answer
// but it is the weakest kind — it fails exactly on the day someone is tired.
// This module is the answer that does not need him: pick a folder once, and
// every change from then on lands in it as a file, plus one backup per day.
//
// WHERE IT WORKS, measured rather than assumed. I first wrote that this could
// only exist on the local-server route because file:// is not a secure
// context. That is FALSE in Chromium: file:// is a secure context there and
// `showDirectoryPicker` is defined. What file:// really lacks is a real
// origin — OPFS is refused with SecurityError, a service worker cannot
// register, and every local .html on the machine shares the one `file://`
// origin and therefore the same IndexedDB namespace. So the feature is
// offered on BOTH routes by plain feature detection, and the local server is
// the better home for it rather than the only one.
//
// ARRANGEMENT. Same contract as library.ts and bundle.ts: this file does not
// know what a State is. It takes raw text and hands back raw text, and
// useFolder.ts is the one that knows a bundle goes in it. Two of its four
// interesting functions are PURE and are the ones with unit tests; the rest
// is browser plumbing an E2E has to judge.
//
// WHY INDEXEDDB. Everything else the machine remembers lives in localStorage
// (platform/prefs, nine keys). A directory handle cannot: it is not a string and it
// does not survive JSON. IndexedDB stores it by structured clone, which is
// the only place in the browser that can hold one. It is still a MACHINE
// preference and it is still not in `State` — a backup taken here must not
// carry a path from this computer to my father's.

import { dayStamp } from '../../leaf/app';

/**
 * Three things TypeScript's DOM lib does not have yet. Declared narrowly —
 * only the members actually called below — so that the day the lib grows them
 * the overlap is small and obvious.
 */
declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
      startIn?: 'documents' | 'desktop' | 'downloads';
      id?: string;
    }) => Promise<FileSystemDirectoryHandle>;
  }
  interface FileSystemHandle {
    queryPermission?: (d?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>;
    requestPermission?: (d?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>;
  }
  interface FileSystemDirectoryHandle {
    keys(): AsyncIterableIterator<string>;
  }
}

// ------------------------------------------------------------- the names
//
// Pure, and tested. A file name is the one part of this a person reads.

/** The live file. One name, overwritten — a folder with 400 files in it is
    not a backup, it is a mess someone has to clean up. */
export const MAIN_NAME = 'ders-programi-tumu.json';

/** How many daily backups are kept. Ten is two school weeks. */
export const KEEP_DAILY = 10;

const DAILY = /^ders-programi-(\d{4})-(\d{2})-(\d{2})\.json$/;

/**
 * The backup for a given day: `ders-programi-2026-08-26.json`. The date is the
 * local one (dateStamp.ts), and `DAILY` above has to keep matching it, because
 * the prune deletes by that pattern.
 */
export function dailyName(now: Date): string {
  return `ders-programi-${dayStamp(now)}.json`;
}

/**
 * The rescue copy of one session: `ders-programi-kurtarma-2026-10-09-201455.json`.
 *
 * Written only while this browser's own storage refuses the save (VK2), and
 * the reason it has a name of its own: the live file and today's backup are
 * rewritten by the NEXT session from what the storage still holds, which is
 * the state from before the refusal. Measured in the exe by the test session:
 * the new work was in both files and the next start wrote the old state over
 * both within two seconds. This name is never reused and `DAILY` does not
 * match it, so neither the next session nor the prune can touch it.
 */
export function rescueName(now: Date): string {
  const iki = (n: number) => String(n).padStart(2, '0');
  const saat = `${iki(now.getHours())}${iki(now.getMinutes())}${iki(now.getSeconds())}`;
  return `ders-programi-kurtarma-${dayStamp(now)}-${saat}.json`;
}

/**
 * Where a write that would shrink the plan sharply goes instead of over the
 * live file: `ders-programi-kurtarma-2026-11-16.json` (`saveInto`, `SHRINK`).
 * One per day, rewritten through the day: the state it holds is the newest,
 * and the live file it stands beside keeps the larger one. `DAILY` does not
 * match it, so the prune never touches it.
 */
export function shrinkName(now: Date): string {
  return `ders-programi-kurtarma-${dayStamp(now)}.json`;
}

/**
 * The open plan as it was before the day's last deletion, as a plan file
 * (`ders-programi-silmeden-once-2026-11-16.json`): "Dosyadan aç" opens it.
 * Written before every deletion that asks no question (TODO SD1). One a day
 * and rewritten through it, because the exe removes nothing but a daily
 * backup (`remove_in`, src-tauri/src/lib.rs), so a new name per deletion would
 * pile up in Belgelerim for good.
 */
export function beforeDeleteName(now: Date): string {
  return `ders-programi-silmeden-once-${dayStamp(now)}.json`;
}

/**
 * Which daily backups to delete, oldest first.
 *
 * Only names this program wrote are ever considered. The folder my father
 * picks is going to be Belgelerim, with his own files in it — a prune that
 * deletes by "everything except the newest ten" would delete his work, and it
 * would do it silently. The name pattern IS the safety.
 *
 * And only FULL backups are counted (`full`): the newest `keep` of those stay,
 * with every daily newer than the last of them, and only what is older goes.
 * It used to count every daily, and an empty start put an empty backup among
 * the ten, so a full one went on each new day and none was left after ten
 * (A2, the audit of 2026-10-24).
 */
export function prunable(
  names: string[],
  keep: number = KEEP_DAILY,
  full: (name: string) => boolean = () => true,
  spare: string | null = null,
): string[] {
  const ours = names.filter((name) => DAILY.test(name)).sort(); // ISO-shaped: sorts by date
  const old: string[] = [];
  let kept = 0;
  for (let i = ours.length - 1; i >= 0; i--) {
    const name = ours[i]!;
    if (kept >= keep) {
      if (name !== spare) old.unshift(name);
    } else if (full(name)) kept++;
  }
  return old;
}

/**
 * The daily the prune never deletes: the one with the most work in it
 * (`workOf`: every list's rows and every placed hour), the newest of equals.
 * Counting only "holds work" was not enough: a wiped profile and one teacher
 * made each new day's backup "full", and ten small days pushed out every real
 * backup (the audit of 2026-11-16, measured: 0 of 10 left).
 */
export function largest(sizes: ReadonlyMap<string, number>): string | null {
  let best: string | null = null;
  let most = 0;
  for (const [name, size] of [...sizes].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (size > 0 && size >= most) {
      best = name;
      most = size;
    }
  }
  return best;
}

/** Every list a plan's work is in, today's names and v1's Turkish ones. */
const WORK = [
  'rooms',
  'teachers',
  'classes',
  'lessons',
  'derslikler',
  'ogretmenler',
  'siniflar',
  'dersler',
];

/** How much work a bundle holds, summed over its plans. */
export interface Work {
  /** Rows in the four lists: rooms, teachers, classes, lessons. */
  lists: number;
  teachers: number;
  lessons: number;
  /** Placed hours, in every seçenek. */
  placed: number;
}

const count = (value: unknown): number =>
  Array.isArray(value)
    ? value.length
    : typeof value === 'object' && value !== null
      ? Object.keys(value).length
      : 0;

/**
 * How much work this bundle's text holds. Null when it is not a bundle this
 * can read. Raw, like everything in this file: the four lists (today's names
 * and v1's), and the placements of every seçenek (`programs`) or of the one
 * grid an older plan had (`placements`, v1's `yerlesim`).
 */
export function workOf(text: string): Work | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  const plans = (raw as { plans?: unknown } | null)?.plans;
  if (!Array.isArray(plans)) return null;
  const work: Work = { lists: 0, teachers: 0, lessons: 0, placed: 0 };
  for (const plan of plans as unknown[]) {
    const state = (plan as { state?: Record<string, unknown> } | null)?.state;
    if (typeof state !== 'object' || state === null) continue;
    for (const list of WORK) work.lists += Array.isArray(state[list]) ? count(state[list]) : 0;
    work.teachers += count(state.teachers) + count(state.ogretmenler);
    work.lessons += count(state.lessons) + count(state.dersler);
    if (Array.isArray(state.programs)) {
      for (const program of state.programs as unknown[]) {
        work.placed += count((program as { placements?: unknown } | null)?.placements);
      }
    } else {
      work.placed += count(state.placements) + count(state.yerlesim);
    }
  }
  return work;
}

/**
 * Does this bundle's text hold any work: a room, a teacher, a class or a
 * lesson in any plan? Null when it is not a bundle this can read.
 *
 * The folder's one notion of "empty", for the two rules it guards: an empty
 * bundle is never written over a file that holds work, and the prune counts
 * only files that do. It looks at the four lists and nothing else, so it can
 * stay in a file that does not know what a State is.
 */
export function holdsWork(text: string): boolean | null {
  const work = workOf(text);
  return work === null ? null : work.lists > 0;
}

/**
 * Would writing `now` over a file holding `before` shrink the work sharply?
 * Under half the rows of the four lists. Placed hours do not count: "Programı
 * boşalt" and "Baştan diz" take every one of them away on purpose, and a
 * guard they set off would keep the live file stale for good.
 */
export function shrinks(before: Work | null, now: Work | null): boolean {
  return before !== null && now !== null && now.lists * 2 < before.lists;
}

// ------------------------------------------------------- is it even here
//
// Two conditions, and the second one is why this whole round happened: under
// file:// the API is not defined, and telling someone to "allow" something
// that does not exist is worse than saying nothing.

export function folderSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

// ------------------------------------------------------- remembering it

export const DB_NAME = 'ders-programi-klasor';
const STORE = 'tutamak';
const KEY = 'secili';

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((done) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, 1);
    } catch {
      done(null); // private mode, storage disabled
      return;
    }
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => done(req.result);
    req.onerror = () => done(null);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((done) => {
        if (db === null) {
          done(null);
          return;
        }
        try {
          const req = run(db.transaction(STORE, mode).objectStore(STORE));
          req.onsuccess = () => done(req.result);
          req.onerror = () => done(null);
        } catch {
          done(null);
        }
      }),
  );
}

/** The folder chosen on this machine, or null. NEVER throws. */
export function readHandle(): Promise<FileSystemDirectoryHandle | null> {
  return withStore<unknown>('readonly', (s) => s.get(KEY) as IDBRequest<unknown>).then((raw) =>
    raw !== null && typeof raw === 'object' && 'getFileHandle' in raw
      ? (raw as FileSystemDirectoryHandle)
      : null,
  );
}

export function writeHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  return withStore('readwrite', (s) => s.put(handle, KEY) as IDBRequest<unknown>).then(
    () => undefined,
  );
}

export function dropHandle(): Promise<void> {
  return withStore('readwrite', (s) => s.delete(KEY)).then(() => undefined);
}

// ------------------------------------------------------------ permission
//
// A handle survives a reload; the PERMISSION does not, and Chrome will only
// hand it back inside a user gesture. So the two are asked separately: on
// load we look (query), and only a click asks (request). Anything else spends
// my father's one gesture on a prompt he did not ask for.

export async function permissionOf(handle: FileSystemDirectoryHandle): Promise<PermissionState> {
  if (typeof handle.queryPermission !== 'function') return 'granted'; // no gate in this browser
  try {
    return await handle.queryPermission({ mode: 'readwrite' });
  } catch {
    return 'denied';
  }
}

/** Asks. Must be called from a click — see above. */
export async function askPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  if (typeof handle.requestPermission !== 'function') return true;
  try {
    return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted';
  } catch {
    return false;
  }
}

export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!folderSupported()) return null;
  try {
    // `id` makes the browser reopen where it was last time; `startIn` only
    // decides the FIRST time, and Belgelerim is where this belongs.
    return await window.showDirectoryPicker!({
      mode: 'readwrite',
      startIn: 'documents',
      id: 'ders-programi',
    });
  } catch {
    return null; // the picker was dismissed — not an error, an answer
  }
}

// ---------------------------------------------------------------- writing

/**
 * A file's text, or null when it is not there. Any other failure THROWS: a
 * folder that cannot be read cannot be written either, and the caller's red
 * line is how that is said (pitfall 7), not a write that quietly did nothing.
 */
async function readText(dir: FileSystemDirectoryHandle, name: string): Promise<string | null> {
  try {
    return await (await (await dir.getFileHandle(name)).getFile()).text();
  } catch (err) {
    if ((err as { name?: unknown } | null)?.name === 'NotFoundError') return null;
    throw err;
  }
}

/** May an empty bundle go into `name`? Only where nothing would be lost. */
async function emptyMayGo(dir: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  const text = await readText(dir, name);
  return text === null || holdsWork(text) === false;
}

async function writeText(
  dir: FileSystemDirectoryHandle,
  name: string,
  text: string,
): Promise<void> {
  const file = await dir.getFileHandle(name, { create: true });
  const out = await file.createWritable();
  await out.write(text);
  await out.close();
}

export interface WriteResult {
  /** Names actually written, in the order they were written. */
  written: string[];
  /** Daily backups deleted this time. */
  pruned: string[];
  /** Set when the write would have shrunk the work sharply (`shrinks`): the
      live file and today's backup were kept, and the bundle went to `file`. */
  shrunk?: { file: string; before: Work; now: Work };
}

/**
 * One flush: the live file, today's backup, and a prune.
 *
 * Today's backup is rewritten on every flush rather than only created once.
 * That makes it the state at the END of the day, which is the one a person
 * asking "where was I on Tuesday" actually wants — and it costs one more
 * write of a file that is already in the page's memory.
 *
 * `prune` is passed in rather than decided here: listing a directory on every
 * keystroke is real I/O, and the caller knows when the day turned over.
 *
 * A bundle that holds no work (`holdsWork`) is written only where it loses
 * nothing: a file that is not there, or one as empty. It never prunes, and it
 * writes no rescue copy. An empty start in the exe used to put an empty bundle
 * over a full live file and a full backup of today (A2).
 *
 * A bundle that holds under half the rows of the live file or of today's
 * backup (`shrinks`) goes over neither: it is written to the day's rescue
 * file (`shrinkName`) and the caller says so on screen, until the user says
 * the smaller plan is the one to keep (`allowShrink`). One teacher typed into
 * a wiped profile used to go over the whole school in the live file (the
 * audit of 2026-11-16).
 *
 * The prune never deletes the daily with the most work in it (`largest`).
 */
export async function saveInto(
  dir: FileSystemDirectoryHandle,
  text: string,
  now: Date,
  prune: boolean,
  rescue: string | null = null,
  allowShrink = false,
): Promise<WriteResult> {
  const daily = dailyName(now);
  const result: WriteResult = { written: [], pruned: [] };
  const mine = workOf(text);
  const work = mine !== null && mine.lists > 0;
  if (work && !allowShrink) {
    let before: Work | null = null;
    for (const name of [MAIN_NAME, daily]) {
      const held = await readText(dir, name);
      const there = held === null ? null : workOf(held);
      if (there !== null && (before === null || there.lists > before.lists)) before = there;
    }
    if (shrinks(before, mine)) {
      const file = shrinkName(now);
      for (const name of rescue === null ? [file] : [file, rescue]) {
        await writeText(dir, name, text);
        result.written.push(name);
      }
      result.shrunk = { file, before: before!, now: mine };
      return result;
    }
  }
  for (const name of rescue === null || !work ? [MAIN_NAME, daily] : [MAIN_NAME, daily, rescue]) {
    if (!work && !(await emptyMayGo(dir, name))) continue;
    await writeText(dir, name, text);
    result.written.push(name);
  }
  if (!prune || !work) return result;

  const names: string[] = [];
  for await (const name of dir.keys()) names.push(name);
  const full = new Set<string>();
  const sizes = new Map<string, number>();
  for (const name of names.filter((n) => DAILY.test(n))) {
    // A backup that cannot be read now (open in another program) is not
    // counted as full; it is kept unless ten full ones are newer.
    const held = await readText(dir, name).catch(() => null);
    const there = held === null ? null : workOf(held);
    if (there !== null && there.lists > 0) full.add(name);
    sizes.set(name, there === null ? 0 : there.lists + there.placed);
  }
  for (const old of prunable(names, KEEP_DAILY, (name) => full.has(name), largest(sizes))) {
    try {
      await dir.removeEntry(old);
      result.pruned.push(old);
    } catch {
      // A file someone has open in another program cannot be removed. Not
      // worth a word to the user: it is a backup, and it goes next time.
    }
  }
  return result;
}

/** Writes the open plan as it was before a deletion (`beforeDeleteName`). */
export async function saveBefore(
  dir: FileSystemDirectoryHandle,
  planText: string,
  now: Date,
): Promise<string> {
  const name = beforeDeleteName(now);
  await writeText(dir, name, planText);
  return name;
}

/** A bundle in the folder, for the empty start's offer (`newestInFolder`). */
export interface FolderCopy {
  name: string;
  text: string;
  work: Work;
}

/**
 * The copy in the folder an empty start offers to open: the live file, unless
 * it holds under half the rows of the fullest daily backup (then that daily,
 * the newest of equals). Null when no file there holds work. Throws when the
 * folder cannot be read, like `readText`.
 */
export async function newestInFolder(dir: FileSystemDirectoryHandle): Promise<FolderCopy | null> {
  const read = async (name: string): Promise<FolderCopy | null> => {
    const text = await readText(dir, name).catch(() => null);
    const work = text === null ? null : workOf(text);
    return text !== null && work !== null && work.lists > 0 ? { name, text, work } : null;
  };
  const main = await read(MAIN_NAME);
  const names: string[] = [];
  for await (const name of dir.keys()) if (DAILY.test(name)) names.push(name);
  let daily: FolderCopy | null = null;
  for (const name of names.sort()) {
    const copy = await read(name);
    if (copy !== null && (daily === null || copy.work.lists >= daily.work.lists)) daily = copy;
  }
  if (main !== null && !shrinks(daily?.work ?? null, main.work)) return main;
  return daily ?? main;
}
