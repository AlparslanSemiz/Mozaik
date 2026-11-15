// The box, and the React wiring that drives it. No state library: a reducer
// and two effects are the whole of it.
//
// What used to be one file is now six, and this one owns the parts that only
// make sense inside a component: the reducer's box (`pure/undo/undo.ts`), the
// debounced autosave and the timer behind it, and Ctrl+Z. The plan library
// operations are next door in `usePlans.ts` and are handed the two things they
// need from the timer's owner — see the comments around `park` below.
//
// Where the rest went: `pure/io/parseState.ts` reads a saved file,
// `platform/planStore.ts` is where a plan lives in this browser,
// `platform/download.ts` hands a file to the browser.
//
// Data loss is unacceptable (docs/PRINCIPLES.md: no data loss) and the three
// defences are still three, now spread across three files: the debounced
// auto-save is here, the session backup chain is `planStore.ts`, and "Yedek
// indir" — the ONE habit my father will be taught — is `download.ts`.

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { type Box, reduce, undoLabel } from '../../pure/undo';
import { loadFallbackAtStart, loadPlanAtStart, rotateBackups, savePlan } from './planStore';
import { usePlans } from './usePlans';
import { emptyState } from '../../pure/entities';
import { findPlan, LIBRARY_KEY, parseLibrary, planKey, parseState } from '../../pure/io';
import {
  explicitly,
  frozenPlan,
  readLibraryAtStart,
  thawPlan,
  writeLibrary,
  writeRefused,
} from './libraryStore';
import { watchOtherWindows, writesClosed } from './otherWindow';
import type { Id, State } from '../../leaf/model';
import { t } from '../../leaf/i18n';

const SAVE_DELAY = 400; // ms — do not write on every drag frame

/**
 * Why the last save did not land, for the strip at the top. `dolu`: the write
 * itself failed, which in practice is the storage quota (VK2). `baska`: another
 * window changed this data, and this one has stopped writing (VK1). `okunamadi`:
 * the plan read empty at startup and its key holds a plan now, so nothing is
 * written over it (libraryStore.ts, `mayWritePlan`).
 */
export type SaveTrouble = 'dolu' | 'baska' | 'okunamadi' | null;

// -------------------------------------------------------------------- hook

/**
 * The plans the opening read found unreadable and did not open, by name, for
 * the session's one line (TB1). Set once, by `initialBox`.
 */
let setAsideAtStart: string[] = [];

function initialBox(): Box {
  // First run: the directory does not exist yet, so `readLibrary()` hands back
  // the one-plan default whose id is "1" — and plan "1"'s key IS the key the
  // timetable is already sitting in. Adoption therefore copies NOTHING.
  const library = readLibraryAtStart();
  writeLibrary(library);
  let planId = library.activeId;
  let present = loadPlanAtStart(planId);
  setAsideAtStart = [];
  // The plan open last time cannot be read (frozen, A1): the first plan that
  // can opens instead of an empty stand-in, and the unreadable one stays
  // frozen in its key and in the directory (TB1, the user's decision,
  // 2026-10-24). With none readable, A1's stand-in and its strip.
  //
  // The switch is NOT saved, and the session chain is not rotated: the
  // directory keeps pointing at the unreadable plan, so every start falls
  // back again and says so again, and its last good copy in the chain is not
  // pushed out by the plan opened in its place (review, 2026-10-24: saved,
  // that copy was gone by the third start, without a word after the first).
  if (present === null && frozenPlan(planId) !== null) {
    const unreadable = [findPlan(library, planId)?.name ?? planId];
    for (const plan of library.plans) {
      if (plan.id === library.activeId) continue;
      const other = loadFallbackAtStart(plan.id);
      if (other !== null) {
        planId = plan.id;
        present = other;
        setAsideAtStart = unreadable;
        break;
      }
      if (frozenPlan(plan.id) !== null) unreadable.push(plan.name);
    }
  }
  if (planId === library.activeId) rotateBackups(planKey(planId));
  return {
    present: present ?? emptyState(),
    past: [],
    future: [],
    planId,
  };
}

/** Input types that hold no typed text, so they have no undo of their own. */
const NOT_TEXT = new Set([
  'checkbox',
  'radio',
  'range',
  'color',
  'file',
  'button',
  'submit',
  'reset',
  'image',
]);

/** While typing in a text box let the browser handle Ctrl+Z, do not grab it.
    Only a box that takes typing counts: a checkbox keeps the focus after it is
    clicked, and when every INPUT counted, Ctrl+Z right after unticking a day
    did nothing at all (DENETIM DK8).
    Exported: App.tsx's own global shortcuts (the '?' help key) need the same
    guard, and a second copy of a four-line rule is still a second copy. */
export function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement) return !NOT_TEXT.has(target.type);
  return target.tagName === 'TEXTAREA' || target.isContentEditable === true;
}

/** What a screen reader hears after an undo: what was taken back, if it is known. */
function undoneSentence(from: Box): string {
  const label = undoLabel(from);
  return label === undefined ? t('Geri alındı.') : t('Geri alındı: {ne}', { ne: label });
}

/**
 * `announce` says a sentence to a screen reader (Toasts.tsx, `useAnnounce`):
 * after an undo, what was taken back. Optional so a test can mount the store
 * without the provider.
 */
export function useStore(announce: (text: string) => void = () => undefined) {
  const [box, dispatch] = useReducer(reduce, undefined, initialBox);
  // The box as of the last render, for the two callbacks below that have to
  // know BEFORE dispatching whether there is anything to undo and what it was.
  const current = useRef(box);
  current.current = box;
  const say = useRef(announce);
  say.current = announce;

  /** `label` names the change for the "Geri alındı: …" after its undo. */
  const change = useCallback((apply: (d: State) => State, label?: string) => {
    dispatch(label === undefined ? { type: 'change', apply } : { type: 'change', apply, label });
  }, []);
  const manageProgram = useCallback((apply: (d: State) => State, label?: string) => {
    dispatch(
      label === undefined
        ? { type: 'program-change', apply }
        : { type: 'program-change', apply, label },
    );
  }, []);
  /** Another seçenek on screen, without a step of the history (undo.ts, `view`). */
  const viewProgram = useCallback((apply: (d: State) => State) => {
    dispatch({ type: 'view', apply });
  }, []);
  const undo = useCallback(() => {
    if (current.current.past.length === 0) return;
    say.current(undoneSentence(current.current));
    dispatch({ type: 'undo' });
  }, []);
  /**
   * Undo only while `expected` is the present: a notice's "Geri al" (undo.ts,
   * SD1). Says whether it did, so the notice can say so when it did not.
   */
  const undoIf = useCallback((expected: State): boolean => {
    if (current.current.present !== expected || current.current.past.length === 0) return false;
    say.current(undoneSentence(current.current));
    dispatch({ type: 'undo-if', expected });
    return true;
  }, []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  /** The present as of the last render, for a callback that must not act on a stale one. */
  const peek = useCallback(() => current.current.present, []);
  // A load is "Dosyadan aç" or "Her şeyi sil", each behind its own question:
  // the user has put something in this plan's place, so a plan this copy
  // could not read may be written over now (libraryStore.ts, A1). A plain
  // change, the sample school included, does not count.
  const openNow = useRef(box.planId);
  openNow.current = box.planId;
  const loadState = useCallback((state: State) => {
    thawPlan(openNow.current);
    dispatch({ type: 'load', state });
  }, []);
  /**
   * "Her şeyi sil" since 2026-11-15: an ordinary step of the history, so its
   * notice can offer "Geri al". Returns the state it put in place, for that
   * notice's `undoIf`, or null when it had to be a load (below).
   */
  const replaceState = useCallback((state: State, label?: string): State | null => {
    // A plan this copy could not read stays a load: an undo would bring back
    // the empty stand-in with the thaw still in force, and the next autosave
    // would write it over the unreadable text (review, 2026-11-15). Null says
    // there is nothing to undo.
    if (frozenPlan(openNow.current) !== null) {
      thawPlan(openNow.current);
      dispatch({ type: 'load', state });
      return null;
    }
    dispatch(
      label === undefined
        ? { type: 'change', apply: () => state }
        : { type: 'change', apply: () => state, label },
    );
    return state;
  }, []);

  // Every save goes through here, so the answer reaches the screen. It used to
  // be dropped: with the storage full the autosave failed and the page said
  // "Örnek okul yüklendi." over it (VK2, measured by the test session).
  const [trouble, setTrouble] = useState<SaveTrouble>(null);
  const write = useCallback((id: Id, d: State) => {
    // A plan this copy could not read is on screen as an empty stand-in, and
    // the stand-in is never saved: the strip says so instead (A1).
    if (writesClosed() || frozenPlan(id) !== null) return;
    const landed = savePlan(id, d);
    setTrouble(landed ? null : writeRefused() ? 'okunamadi' : 'dolu');
  }, []);

  // Auto-save — debounced, otherwise we write JSON on every drag frame. The
  // state and the key it goes to come from the SAME box, so a pending write can
  // never land in the wrong plan.
  const timer = useRef<number | undefined>(undefined);
  // Whether a write is still waiting for the timer: the only thing a closing
  // tab has to flush.
  const pending = useRef(false);
  useEffect(() => {
    window.clearTimeout(timer.current);
    pending.current = true;
    timer.current = window.setTimeout(() => {
      pending.current = false;
      write(box.planId, box.present);
    }, SAVE_DELAY);
    return () => window.clearTimeout(timer.current);
  }, [box.present, box.planId, write]);

  // Flush the pending save when the tab closes, and ONLY a pending one. It
  // used to write unconditionally, so a tab left open in the background wrote
  // the plan it had read an hour ago over everything another tab did since
  // (VK1). Nothing waiting means nothing of this tab's is unsaved.
  useEffect(() => {
    const flush = () => {
      if (pending.current) write(box.planId, box.present);
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [box.present, box.planId, write]);

  // --------------------------------------------------------- the plan library
  //
  // Every one of these first FLUSHES the plan being left. The debounce is 400 ms
  // and the effect's cleanup cancels a pending write whenever the box changes,
  // so without this the last edit before a switch is simply dropped — silently,
  // which is the only kind of data loss that matters.
  const park = useCallback(() => {
    window.clearTimeout(timer.current);
    pending.current = false;
    write(box.planId, box.present);
  }, [box.planId, box.present, write]);

  const openPlan = useCallback((id: Id, state: State) => {
    dispatch({ type: 'switch', id, state });
  }, []);

  const plans = usePlans({ planId: box.planId, park, openPlan });

  // Another window changed our data: this one stops writing, and says so.
  // What this window holds is read through a ref, so the listener is set once.
  // Both sides go through the same reader before they are compared
  // (otherWindow.ts says why the text alone gave false alarms).
  const held = useRef({ box, library: plans.library });
  held.current = { box, library: plans.library };
  useEffect(
    () =>
      watchOtherWindows(
        (key, value) => {
          const now = held.current;
          if (key === planKey(now.box.planId)) {
            const read = (text: string | null) =>
              JSON.stringify(text === null ? null : parseState(text));
            return read(value) === read(JSON.stringify(now.box.present));
          }
          if (key === LIBRARY_KEY) {
            return (
              JSON.stringify(parseLibrary(value)) ===
              JSON.stringify(parseLibrary(JSON.stringify(now.library)))
            );
          }
          return undefined;
        },
        () => {
          window.clearTimeout(timer.current);
          pending.current = false;
          setTrouble('baska');
        },
      ),
    [],
  );

  // Ctrl+Z / Ctrl+Y — dropping a card in the wrong place happens constantly,
  // so this is a basic function, not a nicety.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      // An EMPTY add box has no text of its own to take back. It is where
      // the focus goes when a deletion empties a list (deleteFocus.ts), and
      // that deletion's notice says "Geri almak için Ctrl+Z" (2026-11-15).
      // Only there: a rename or search box keeps the browser's own undo.
      const empty =
        e.target instanceof HTMLInputElement &&
        e.target.type === 'text' &&
        e.target.value === '' &&
        e.target.closest('.add-panel-body') !== null;
      if (isTextInput(e.target) && !empty) return;
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

  // Deleting a plan and opening a whole library over this one are the other
  // two decisions that may go over a plan this copy could not read. The empty
  // stand-in itself is still never written: `write` above refuses it first.
  const decided = {
    ...plans,
    deletePlan: (id: Id) => explicitly(() => plans.deletePlan(id)),
    replaceLibrary: (bundle: Parameters<typeof plans.replaceLibrary>[0]) =>
      explicitly(() => plans.replaceLibrary(bundle)),
  };

  return {
    /** The open plan's key holds text this copy cannot read, and why: the strip. */
    unreadable: frozenPlan(box.planId),
    /** The plans the opening read could not read and did not open, by name (TB1). */
    setAside: setAsideAtStart,
    state: box.present,
    change,
    manageProgram,
    viewProgram,
    undo,
    undoIf,
    redo,
    loadState,
    replaceState,
    peek,
    // Exposed for the two callers that leave the page without unloading it:
    // the exe restarting onto a new version, and the exe's window closing
    // (App.tsx, TB7). `beforeunload` covers a closing
    // tab, but a WebView2 window torn down by `app.exit(0)` is not a closing
    // tab, and the 400 ms debounce is exactly long enough to eat the edit
    // somebody made right before pressing the button (pitfall 28).
    park,
    /** Null while saves land; otherwise why they do not (the strip at the top). */
    saveTrouble: trouble,
    canUndo: box.past.length > 0,
    canRedo: box.future.length > 0,
    plans: decided,
  };
}
