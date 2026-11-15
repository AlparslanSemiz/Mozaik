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

import { t } from '../../leaf/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildBundle, type Library } from '../../pure/io';
import { isDesktop, openDesktopFolder } from '../exe';
import {
  askPermission,
  dailyName,
  dropHandle,
  folderSupported,
  holdsWork,
  newestInFolder,
  permissionOf,
  pickFolder,
  readHandle,
  rescueName,
  saveBefore,
  saveInto,
  workOf,
  writeHandle,
  type FolderCopy,
  type Work,
} from './folder';
import { writesClosed } from './otherWindow';
import { findPlan } from '../../pure/io';
import { frozenPlan, mayWritePlan, readPlanText } from './libraryStore';
import { collectStates } from './download';
import { openedReadable } from './planStore';
import { searchLog } from '../search';
import type { Id, State } from '../../leaf/model';

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
  | { kind: 'hata'; name: string; text: string }
  // The start found this browser's storage empty or unreadable, and the folder
  // holds more work (`newestInFolder`): nothing is written to the folder until
  // the user opens that copy or says to start empty (`release`).
  | { kind: 'bulundu'; name: string; copy: FolderCopy };

/** The last write would have shrunk the work sharply and went to `file`. */
export interface Shrunk {
  file: string;
  before: Work;
  now: Work;
}

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
  /** Writes now instead of in two seconds, and resolves when it has: for the
      exe's window, which waits for it before it closes (TB7). */
  flush: () => Promise<void>;
  /** After 'bulundu': the user chose (opened the copy, or "Boş başla"). */
  release: () => void;
  /** Set while the plan is kept out of the live file for shrinking (`saveInto`). */
  shrunk: Shrunk | null;
  /** From a click: the smaller plan is the one to keep; writes it at once. */
  acceptShrink: () => Promise<void>;
  /** Before a deletion: the open plan as it is, into the folder (TODO SD1). */
  keepBefore: (state: State) => void;
}

/**
 * The states to bundle, with every plan this copy cannot read put back AS IT
 * IS STORED. Left to `collectStates`, such a plan is dropped (and the open
 * one is its empty stand-in), and the bundle that went over the live file was
 * missing a plan the folder had (A1, A2). A newer copy's plan is still JSON and
 * goes in verbatim, so that copy can open it again from here. Text that is not
 * even JSON cannot go anywhere, and then nothing is written: `broken` names
 * the plan, and the folder's line says so (it used to stop silently, B7.37).
 */
function withUnreadable(
  lib: Library,
  states: Record<Id, State>,
): { states: Record<Id, unknown> } | { broken: Id } {
  const out: Record<Id, unknown> = { ...states };
  for (const plan of lib.plans) {
    if (frozenPlan(plan.id) === null) continue;
    try {
      const raw: unknown = JSON.parse(readPlanText(plan.id) ?? '');
      if (typeof raw !== 'object' || raw === null) return { broken: plan.id };
      out[plan.id] = raw;
    } catch {
      return { broken: plan.id };
    }
  }
  return { states: out };
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

  // 'bulundu' (above): nothing goes to the folder until the user chose.
  const held = useRef(false);
  // The user said the smaller plan is the one to keep (`acceptShrink`).
  const shrinkOk = useRef(false);
  const [shrunk, setShrunk] = useState<Shrunk | null>(null);

  /** The bundle this window would write now, or why there is none. */
  const bundleNow = useCallback((): { text: string } | { broken: string } | null => {
    // Another window changed the data: its copy is the newer one, and this
    // window's would overwrite the folder with what it read before (VK1).
    // And an open plan that read empty at startup while its key is full now
    // would put an empty plan in today's file (libraryStore.ts, `mayWritePlan`).
    const { library: lib, planId: id, present: now } = latest.current;
    if (writesClosed() || !mayWritePlan(id)) return null;
    const read = withUnreadable(lib, collectStates(lib, id, now));
    if ('broken' in read) return { broken: findPlan(lib, read.broken)?.name ?? read.broken };
    return { text: buildBundle(lib, read.states, searchLog()) };
  }, []);

  const write = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      if (held.current) return;
      const { rescue: kurtar } = latest.current;
      const bundle = bundleNow();
      if (bundle === null) return;
      if ('broken' in bundle) {
        // A plan whose text is not even JSON: no bundle can carry it, so the
        // folder is not written at all, and that has to be on screen (B7.37).
        setStatus({
          kind: 'hata',
          name: handle.name,
          text: t('"{plan}" planı okunamıyor, bu yüzden hiçbir plan klasöre yazılmıyor.', {
            plan: bundle.broken,
          }),
        });
        return;
      }
      const { text } = bundle;
      const when = new Date();
      // Listing the directory is real I/O; only do it when the day turned over,
      // which is also the only moment a prune can have anything to do. And only
      // after a write that holds work: saveInto prunes nothing after an empty
      // one, and the day is not over for the prune until a full one lands (A2).
      const today = dailyName(when);
      const prune = today !== lastDay.current && holdsWork(text) === true;

      try {
        if (kurtar && rescueFile.current === null) rescueFile.current = rescueName(when);
        const result = await saveInto(
          handle,
          text,
          when,
          prune,
          kurtar ? rescueFile.current : null,
          shrinkOk.current,
        );
        setShrunk(result.shrunk ?? null);
        // A shrunk write pruned nothing: the day is not over for the prune yet.
        if (prune && result.shrunk === undefined) lastDay.current = today;
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
    },
    [bundleNow],
  );

  /**
   * A folder is in hand at startup (or was just granted, or picked). A plan
   * READ from storage, with work in it, writes at once; an empty or unreadable
   * start first asks the folder: when it holds more work than this window would write, the
   * window holds its writes and the strip offers that copy (`bulundu`). A wiped
   * WebView2 profile used to open empty, and the first teacher typed in went
   * over the whole school in the live file (the audit of 2026-11-16).
   */
  const arrive = useCallback(
    async (handle: FileSystemDirectoryHandle, alive: () => boolean = () => true) => {
      const bundle = bundleNow();
      const mine = bundle !== null && 'text' in bundle ? workOf(bundle.text) : null;
      if (openedReadable() && mine !== null && mine.lists > 0) {
        setStatus({ kind: 'bekliyor', name: handle.name });
        await write(handle);
        return;
      }
      // Empty, or not read: what does the folder hold?
      let copy: FolderCopy | null = null;
      try {
        copy = await newestInFolder(handle);
      } catch {
        // A folder that cannot be read: the write below says so in red.
      }
      if (!alive()) return;
      const here = mine === null ? 0 : mine.lists + mine.placed;
      if (copy !== null && copy.work.lists + copy.work.placed > here) {
        held.current = true;
        setStatus({ kind: 'bulundu', name: handle.name, copy });
        return;
      }
      setStatus({ kind: 'bekliyor', name: handle.name });
      if (openedReadable()) await write(handle);
    },
    [write, bundleNow],
  );

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
        void arrive(handle, () => alive);
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
        void arrive(handle, () => alive);
      } else {
        setStatus({ kind: 'izin-gerek', name: handle.name });
      }
    });
    return () => {
      alive = false;
    };
  }, [arrive]);

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

  const flush = useCallback(async () => {
    if (dir.current === null) return;
    window.clearTimeout(timer.current);
    await write(dir.current);
  }, [write]);

  // Pitfall 28, in this file's shape: a pending write that is cancelled by the
  // page going away is the last edit of the session, gone. In a browser tab
  // this only STARTS the write, and a closing tab does not wait for it (TB7,
  // measured: nor does Chromium's "leave this page?" question, which stops the
  // page while it is open). The exe's window waits for `flush` instead.
  useEffect(() => {
    const onUnload = () => void flush();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [flush]);

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
    await arrive(handle);
  }, [arrive]);

  const allow = useCallback(async () => {
    const handle = dir.current;
    if (handle === null) return;
    if (!(await askPermission(handle))) {
      setStatus({ kind: 'izin-gerek', name: handle.name });
      return;
    }
    lastDay.current = '';
    await arrive(handle);
  }, [arrive]);

  const forget = useCallback(async () => {
    if (isDesktop()) return;
    window.clearTimeout(timer.current);
    dir.current = null;
    held.current = false;
    await dropHandle();
    setStatus({ kind: 'secilmedi' });
  }, []);

  const release = useCallback(() => {
    const handle = dir.current;
    if (handle === null || !held.current) return;
    held.current = false;
    setStatus({ kind: 'bekliyor', name: handle.name });
  }, []);

  const acceptShrink = useCallback(async () => {
    shrinkOk.current = true;
    setShrunk(null);
    if (dir.current === null) return;
    window.clearTimeout(timer.current);
    await write(dir.current);
  }, [write]);

  const keepBefore = useCallback((state: State) => {
    const handle = dir.current;
    // Not while the folder is held, nor from a window that stopped writing,
    // nor an empty stand-in: the file would be a plan with nothing in it.
    if (handle === null || held.current || writesClosed()) return;
    if (
      state.teachers.length + state.classes.length + state.lessons.length + state.rooms.length ===
      0
    )
      return;
    void saveBefore(handle, JSON.stringify(state), new Date()).catch(() => undefined);
  }, []);

  return {
    status,
    fixed: isDesktop(),
    choose,
    allow,
    forget,
    flush,
    release,
    shrunk,
    acceptShrink,
    keepBefore,
  };
}
