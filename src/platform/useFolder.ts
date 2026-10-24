// Drives folder.ts from React (task B4).
//
// It lives in App and not in Ayarlar → Veri, for the same reason useSolver
// does (pitfall 18): a component is unmounted when the tab changes, and a
// pending write that dies because someone glanced at Program is exactly the
// kind of silent loss the no-data-loss principle is about.
//
// What it writes is a BUNDLE — every plan, the same bytes "Tümünü dosyaya
// kaydet" produces. Not the open plan: a folder that holds one of three plans
// is a backup that is wrong in the way nobody checks.

import { t } from '../leaf/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildBundle } from '../pure/bundle';
import { isDesktop, openDesktopFolder } from './desktop';
import {
  askPermission,
  dailyName,
  dropHandle,
  folderSupported,
  holdsWork,
  permissionOf,
  pickFolder,
  readHandle,
  rescueName,
  saveInto,
  writeHandle,
} from './folder';
import { writesClosed } from './otherWindow';
import { frozenPlan, mayWritePlan, readPlanText } from './libraryStore';
import type { Library } from '../pure/library';
import { collectStates } from './download';
import { openedReadable } from './planStore';
import { searchLog } from './search';
import type { Id, State } from '../leaf/types';

/**
 * Two seconds, not the store's 400 ms.
 *
 * localStorage takes one plan and the browser optimises the write; this takes
 * EVERY plan through a real file handle. At 400 ms a drag would write half a
 * megabyte to disk five times a second. Two seconds is still well inside "I
 * closed the lid and it was saved".
 */
const WRITE_DELAY = 2_000;

export type FolderStatus =
  | { kind: 'yok' } // the API is not here — file://, or a browser without it
  | { kind: 'secilmedi' }
  | { kind: 'izin-gerek'; name: string }
  | { kind: 'yazildi'; name: string; at: Date; files: string[] }
  | { kind: 'bekliyor'; name: string }
  | { kind: 'hata'; name: string; text: string };

export interface FolderRun {
  status: FolderStatus;
  /** Inside the .exe there is nothing to pick and nothing to forget: the
      folder is Belgelerim\\Ders Programı and it is already ours. The panel
      reads this to stop offering three buttons that cannot mean anything. */
  fixed: boolean;
  /** From a click: opens the picker, remembers the choice, writes at once. */
  choose: () => Promise<void>;
  /** From a click: re-asks for a permission the browser dropped on reload. */
  allow: () => Promise<void>;
  forget: () => Promise<void>;
}

/**
 * The states to bundle, with every plan this copy cannot read put back AS IT
 * IS STORED. Left to `collectStates`, such a plan is dropped (and the open
 * one is its empty stand-in), and the bundle that went over the live file was
 * missing a plan the folder had (A1, A2). A newer copy's plan is still JSON and
 * goes in verbatim, so that copy can open it again from here. Text that is not
 * even JSON cannot go anywhere, and then nothing is written: null.
 */
function withUnreadable(lib: Library, states: Record<Id, State>): Record<Id, unknown> | null {
  const out: Record<Id, unknown> = { ...states };
  for (const plan of lib.plans) {
    if (frozenPlan(plan.id) === null) continue;
    try {
      const raw: unknown = JSON.parse(readPlanText(plan.id) ?? '');
      if (typeof raw !== 'object' || raw === null) return null;
      out[plan.id] = raw;
    } catch {
      return null;
    }
  }
  return out;
}

/**
 * `rescue`: this browser's own storage refused the last save (useStore's
 * `saveTrouble === 'dolu'`). While it does, every flush also writes the
 * session's rescue copy (folder.ts, `rescueName`).
 */
export function useFolder(library: Library, planId: Id, present: State, rescue = false): FolderRun {
  // The exe has the folder before the first paint, so it never passes
  // through 'yok' — and it never passes through the picker either.
  const [status, setStatus] = useState<FolderStatus>(() =>
    folderSupported() || isDesktop() ? { kind: 'secilmedi' } : { kind: 'yok' },
  );

  // The handle never goes through React state: it is not a value to render,
  // and putting it there would redraw the app every time we touched it.
  const dir = useRef<FileSystemDirectoryHandle | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const lastDay = useRef<string>('');

  // What to write, kept in a ref so `flush` is stable and does not cancel its
  // own timer on every keystroke.
  const latest = useRef({ library, planId, present, rescue });
  latest.current = { library, planId, present, rescue };
  // One rescue file per session, named when it is first needed.
  const rescueFile = useRef<string | null>(null);

  const write = useCallback(async (handle: FileSystemDirectoryHandle) => {
    // Another window changed the data: its copy is the newer one, and this
    // window's would overwrite the folder with what it read before (VK1).
    // And an open plan that read empty at startup while its key is full now
    // would put an empty plan in today's file (libraryStore.ts, `mayWritePlan`).
    const { library: lib, planId: id, present: now, rescue: kurtar } = latest.current;
    if (writesClosed() || !mayWritePlan(id)) return;
    const states = withUnreadable(lib, collectStates(lib, id, now));
    if (states === null) return;
    const text = buildBundle(lib, states, searchLog());
    const when = new Date();
    // Listing the directory is real I/O; only do it when the day turned over,
    // which is also the only moment a prune can have anything to do. And only
    // after a write that holds work: saveInto prunes nothing after an empty
    // one, and the day is not over for the prune until a full one lands (A2).
    const today = dailyName(when);
    const prune = today !== lastDay.current && holdsWork(text) === true;

    try {
      if (kurtar && rescueFile.current === null) rescueFile.current = rescueName(when);
      const result = await saveInto(handle, text, when, prune, kurtar ? rescueFile.current : null);
      if (prune) lastDay.current = today;
      // An empty bundle that found work in both files wrote neither: nothing
      // was written, and the line does not say otherwise.
      if (result.written.length === 0) return;
      setStatus({ kind: 'yazildi', name: handle.name, at: when, files: result.written });
    } catch (err) {
      // The folder was deleted, the disk is full, or the permission was
      // revoked from the address bar. Whatever it is, it must be VISIBLE:
      // pitfall 7's rule is that a save that stopped working shows up.
      setStatus({
        kind: 'hata',
        name: handle.name,
        text:
          err instanceof Error && err.name === 'NotAllowedError'
            ? t('Klasöre yazma izni geri alınmış.')
            : t('Klasöre yazılamadı. Klasör silinmiş ya da taşınmış olabilir.'),
      });
    }
  }, []);

  // ------------------------------------------------------------- on load
  useEffect(() => {
    let alive = true;

    // The exe route, and it is SHORTER rather than parallel: no picker, no
    // permission, no IndexedDB. Those three exist in the browser because a
    // page has to be granted a folder; here the folder is the app's own.
    //
    // The first write waits for the first change unless the open plan was READ
    // from storage. Not there, or not readable, it is an empty stand-in, and
    // writing it before anybody touched anything is how a wiped profile used
    // to empty Belgelerim\Ders Programı within a second (A2). The browser's
    // granted folder below follows the same rule.
    if (isDesktop()) {
      void openDesktopFolder().then((handle) => {
        if (!alive || handle === null) return;
        dir.current = handle;
        setStatus({ kind: 'bekliyor', name: handle.name });
        if (openedReadable()) void write(handle);
      });
      return () => {
        alive = false;
      };
    }

    if (!folderSupported()) return;
    void readHandle().then(async (handle) => {
      if (!alive || handle === null) return;
      dir.current = handle;
      // We LOOK, we do not ask: a permission prompt nobody asked for spends
      // the one gesture a browser gives us, and it appears on a screen my
      // father did not open for this.
      const state = await permissionOf(handle);
      if (!alive) return;
      if (state === 'granted') {
        setStatus({ kind: 'bekliyor', name: handle.name });
        if (openedReadable()) void write(handle);
      } else {
        setStatus({ kind: 'izin-gerek', name: handle.name });
      }
    });
    return () => {
      alive = false;
    };
  }, [write]);

  // ------------------------------------------------------- the write loop
  useEffect(() => {
    if (dir.current === null) return;
    const handle = dir.current;
    if (status.kind !== 'yazildi' && status.kind !== 'bekliyor' && status.kind !== 'hata') return;

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void write(handle), WRITE_DELAY);
    return () => window.clearTimeout(timer.current);
    // `status` is deliberately not a dependency: it CHANGES on every write and
    // would re-arm the timer forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present, planId, library, rescue, write]);

  // Pitfall 28, in this file's shape: a pending write that is cancelled by the
  // page going away is the last edit of the session, gone.
  useEffect(() => {
    const flush = () => {
      if (dir.current === null) return;
      window.clearTimeout(timer.current);
      void write(dir.current);
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [write]);

  const choose = useCallback(async () => {
    if (isDesktop()) return; // nothing to choose — see `fixed`
    const handle = await pickFolder();
    if (handle === null) return; // dismissed
    if (!(await askPermission(handle))) {
      setStatus({ kind: 'izin-gerek', name: handle.name });
      return;
    }
    dir.current = handle;
    lastDay.current = '';
    await writeHandle(handle);
    setStatus({ kind: 'bekliyor', name: handle.name });
    await write(handle);
  }, [write]);

  const allow = useCallback(async () => {
    const handle = dir.current;
    if (handle === null) return;
    if (!(await askPermission(handle))) {
      setStatus({ kind: 'izin-gerek', name: handle.name });
      return;
    }
    lastDay.current = '';
    await write(handle);
  }, [write]);

  const forget = useCallback(async () => {
    if (isDesktop()) return;
    window.clearTimeout(timer.current);
    dir.current = null;
    await dropHandle();
    setStatus({ kind: 'secilmedi' });
  }, []);

  return { status, fixed: isDesktop(), choose, allow, forget };
}
