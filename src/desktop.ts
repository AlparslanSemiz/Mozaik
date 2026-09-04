// The .exe, seen from the page (task 4h).
//
// The exe delivers the SAME dist/index.html the other three routes deliver;
// the only thing it adds is that "nereye kaydedilsin" already has an answer.
// So the job of this file is not to add a feature — it is to make the feature
// that already exists work without asking.
//
// THE SHAPE IS THE POINT. `folder.ts` owns the file names, the daily backup,
// the ten-day prune and the flush order, and it does that through a
// `FileSystemDirectoryHandle`. Writing a second copy of those rules in Rust
// would give the tool two answers to "which backups get deleted", and they
// would drift the first time one of them was edited. So instead of moving the
// rules, this dresses four Tauri commands up as the handle they already
// expect, and `saveInto()` runs in the exe UNCHANGED.
//
// It is pitfall 67's lesson pointed the other way: there the fix was to
// shrink a fake until only the unrunnable part was fake. Here the unrunnable
// part is the disk, and everything above it stays real.

import type { WriteResult } from './plans/folder';

/** What `withGlobalTauri` puts on the page. Nothing is imported from an
    `@tauri-apps/*` package: task 4g's rule, and pitfall 19's reason — a npm
    package here would become a second chunk that vite-plugin-singlefile does
    not inline, and "tek dosya" is the whole delivery. */
type Invoke = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

declare global {
  interface Window {
    __TAURI__?: { core?: { invoke?: Invoke } };
  }
}

/** Are we inside the exe? Feature detection, never a build flag: the exact
    same bundle is served from file://, from Pages, from the local server and
    from here (pitfall 65 — detect, do not assume from the delivery route). */
/**
 * The folder the exe writes into, under Belgelerim.
 *
 * The SAME string as `FOLDER` in `src-tauri/src/lib.rs`, and it does NOT move
 * when the program is renamed: a folder somebody's timetables already live in
 * is data, exactly like `ders-programi` and the backup file names. It is here
 * rather than typed into a sentence in Ayarlar so there is one place to read.
 */
export const EXE_FOLDER = 'Ders Programı';

export function isDesktop(): boolean {
  return typeof window !== 'undefined' && typeof window.__TAURI__?.core?.invoke === 'function';
}

/**
 * A directory handle backed by `src-tauri/src/lib.rs`.
 *
 * ONLY the four members `folder.ts` actually calls are implemented —
 * `name`, `getFileHandle`, `keys` and `removeEntry`. The cast is honest
 * about that rather than hiding it behind a hand-written interface that
 * claims more: `desktop.test.ts` runs the real `saveInto()` against this
 * object, so the day `folder.ts` starts calling a fifth member, that test
 * fails instead of my father's backup silently stopping.
 */
export function desktopFolder(invoke: Invoke, label: string): FileSystemDirectoryHandle {
  const handle = {
    kind: 'directory' as const,
    name: label,

    async getFileHandle(name: string) {
      return {
        kind: 'file' as const,
        name,
        async createWritable() {
          // Buffered rather than streamed: the Rust side writes through a
          // temp file and a rename so a crash cannot truncate the only copy
          // of a term's work, and a rename needs the whole text anyway.
          let text = '';
          return {
            async write(chunk: string) {
              text += chunk;
            },
            async close() {
              await invoke<void>('write_file', { name, text });
            },
          };
        },
      };
    },

    async *keys() {
      // Every name in the folder, my father's own files included. Filtering
      // belongs to `prunable()`, which only ever touches the pattern this
      // program writes — that IS the safety, and it cannot work on a
      // pre-filtered list.
      for (const name of await invoke<string[]>('list_files')) yield name;
    },

    async removeEntry(name: string) {
      await invoke<void>('remove_file', { name });
    },
  };

  return handle as unknown as FileSystemDirectoryHandle;
}

/**
 * The folder, ready to write to — or null when this is not the exe.
 *
 * No picker, no permission, no IndexedDB. That is the whole difference: in a
 * browser the handle costs a click, a prompt and a store that a cleared
 * profile forgets; here the answer is Belgelerim\Ders Programı and it is
 * known before the first paint.
 */
export async function openDesktopFolder(): Promise<FileSystemDirectoryHandle | null> {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return null;
  const label = await invoke<string>('data_dir_path');
  return desktopFolder(invoke, label);
}

// ------------------------------------------------------------ the update path
//
// Three more commands, and they are the only place in this program that
// touches the network. They live here rather than in `update.ts` for the same
// reason `desktopFolder` does: this file is the exe seen from the page, and
// `update.ts` should not have to know what an `invoke` is.
//
// None of them runs on its own. Each one is a button in Ayarlar, and with no
// internet the only thing that happens is that `check` rejects with a sentence
// (principle 1: nothing changes unless it is asked for; principle 3: the
// program itself still fetches nothing).

/** What `check_update` answers. Field names match src-tauri/src/update.rs. */
export interface UpdateCevap {
  /** Whether the published version is newer than the one that asked. */
  yeni_var: boolean;
  version: string;
  date: string;
  /** Where the new program is. Read from the manifest, never built here, so
      renaming the delivery file in a later version cannot break an older
      copy's updater. */
  exe: string;
  boyut: number;
}

function bridge(): Invoke {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) throw new Error('Bu kopya kendini güncelleyemez.');
  return invoke;
}

/** Asks the release manifest what the newest version is. */
export function desktopCheck(current: string): Promise<UpdateCevap> {
  return bridge()<UpdateCevap>('check_update', { current });
}

/** Downloads it NEXT TO the running program and stops there. */
export function desktopDownload(url: string, boyut: number): Promise<number> {
  return bridge()<number>('download_update', { url, boyut });
}

/** Puts the downloaded program in place and restarts onto it. */
export function desktopApply(): Promise<void> {
  return bridge()<void>('apply_update');
}

/** Re-exported so callers do not have to import both files to read a result. */
export type { WriteResult };
