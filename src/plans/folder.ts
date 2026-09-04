// The folder my father picks (task B4, the old 4l).
//
// Principle 6 says data loss is unacceptable, and until now the whole answer
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
// (theme.ts, nine keys). A directory handle cannot: it is not a string and it
// does not survive JSON. IndexedDB stores it by structured clone, which is
// the only place in the browser that can hold one. It is still a MACHINE
// preference and it is still not in `State` — a backup taken here must not
// carry a path from this computer to my father's.

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

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * The backup for a given day: `ders-programi-2026-08-26.json`.
 *
 * Local date parts, not toISOString(): at 01:00 in Turkey the ISO date is
 * still yesterday, and a backup filed under the wrong day is a backup nobody
 * finds.
 */
export function dailyName(now: Date): string {
  return `ders-programi-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

/**
 * Which daily backups to delete, oldest first.
 *
 * Only names this program wrote are ever considered. The folder my father
 * picks is going to be Belgelerim, with his own files in it — a prune that
 * deletes by "everything except the newest ten" would delete his work, and it
 * would do it silently. The name pattern IS the safety.
 */
export function prunable(names: string[], keep: number = KEEP_DAILY): string[] {
  const ours = names.filter((name) => DAILY.test(name)).sort(); // ISO-shaped: sorts by date
  return ours.slice(0, Math.max(0, ours.length - keep));
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

const DB_NAME = 'ders-programi-klasor';
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
    raw !== null && typeof raw === 'object' && 'getFileHandle' in (raw as object)
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
  return withStore('readwrite', (s) => s.delete(KEY) as IDBRequest<undefined>).then(() => undefined);
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
    return (await window.showDirectoryPicker!({
      mode: 'readwrite',
      startIn: 'documents',
      id: 'ders-programi',
    })) as FileSystemDirectoryHandle;
  } catch {
    return null; // the picker was dismissed — not an error, an answer
  }
}

// ---------------------------------------------------------------- writing

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
 */
export async function saveInto(
  dir: FileSystemDirectoryHandle,
  text: string,
  now: Date,
  prune: boolean,
): Promise<WriteResult> {
  const daily = dailyName(now);
  await writeText(dir, MAIN_NAME, text);
  await writeText(dir, daily, text);

  const result: WriteResult = { written: [MAIN_NAME, daily], pruned: [] };
  if (!prune) return result;

  const names: string[] = [];
  for await (const name of dir.keys()) names.push(name);
  for (const old of prunable(names)) {
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
