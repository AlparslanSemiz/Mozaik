// The box, and the React wiring that drives it. No state library: a reducer
// and two effects are the whole of it.
//
// What used to be one file is now six, and this one owns the parts that only
// make sense inside a component: the reducer's box (`pure/undo.ts`), the
// debounced autosave and the timer behind it, and Ctrl+Z. The plan library
// operations are next door in `usePlans.ts` and are handed the two things they
// need from the timer's owner — see the comments around `park` below.
//
// Where the rest went: `pure/parseState.ts` reads a saved file,
// `platform/planStore.ts` is where a plan lives in this browser,
// `platform/download.ts` hands a file to the browser.
//
// Data loss is unacceptable (docs/PRINCIPLES.md: no data loss) and the three
// defences are still three, now spread across three files: the debounced
// auto-save is here, the session backup chain is `planStore.ts`, and "Yedek
// indir" — the ONE habit my father will be taught — is `download.ts`.

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { type Box, reduce } from '../pure/undo';
import { loadPlan, rotateBackups, savePlan } from './planStore';
import { usePlans } from './usePlans';
import { emptyState } from '../pure/entities';
import { LIBRARY_KEY, planKey } from '../pure/library';
import { readLibrary, writeLibrary } from './libraryStore';
import { watchOtherWindows, writesClosed } from './otherWindow';
import type { Id, State } from '../leaf/types';

const SAVE_DELAY = 400; // ms — do not write on every drag frame

/**
 * Why the last save did not land, for the strip at the top. `dolu`: the write
 * itself failed, which in practice is the storage quota (VK2). `baska`: another
 * window changed this data, and this one has stopped writing (VK1).
 */
export type SaveTrouble = 'dolu' | 'baska' | null;

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

export function useStore() {
  const [box, dispatch] = useReducer(reduce, undefined, initialBox);

  const change = useCallback((apply: (d: State) => State) => {
    dispatch({ type: 'change', apply });
  }, []);
  const manageProgram = useCallback((apply: (d: State) => State) => {
    dispatch({ type: 'program-change', apply });
  }, []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const loadState = useCallback((state: State) => dispatch({ type: 'load', state }), []);

  // Every save goes through here, so the answer reaches the screen. It used to
  // be dropped: with the storage full the autosave failed and the page said
  // "Örnek veri yüklendi." over it (VK2, measured by the test session).
  const [trouble, setTrouble] = useState<SaveTrouble>(null);
  const write = useCallback((id: Id, d: State) => {
    if (writesClosed()) return;
    const landed = savePlan(id, d);
    setTrouble(landed ? null : 'dolu');
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

  // Cancels the pending write WITHOUT performing it. The only caller is the
  // bundle import in `usePlans.ts`, and the two are opposites that look alike:
  // park writes then cancels (pitfall 28), this one only cancels (pitfall 27
  // mirrored). The comment at the head of `usePlans.ts` says the same thing
  // from the other side.
  //
  // Measured while splitting the file, because the old comment claimed more
  // than it could show: taking this call away does NOT resurrect the outgoing
  // plan, and neither does taking away the effect's cleanup. What actually
  // cancels the pending write is the FIRST LINE of the autosave effect below —
  // it clears the previous handle every time the box changes. This call is
  // what makes the intent survive a rewrite of that effect, not what enforces
  // it today.
  const discardPendingSave = useCallback(() => {
    window.clearTimeout(timer.current);
    pending.current = false;
  }, []);

  const openPlan = useCallback((id: Id, state: State) => {
    dispatch({ type: 'switch', id, state });
  }, []);

  const plans = usePlans({ planId: box.planId, park, discardPendingSave, openPlan });

  // Another window changed our data: this one stops writing, and says so.
  // What this window holds is read through a ref, so the listener is set once.
  const held = useRef({ box, library: plans.library });
  held.current = { box, library: plans.library };
  useEffect(
    () =>
      watchOtherWindows(
        (key) => {
          const now = held.current;
          if (key === planKey(now.box.planId)) return JSON.stringify(now.box.present);
          if (key === LIBRARY_KEY) return JSON.stringify(now.library);
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
    /** Null while saves land; otherwise why they do not (the strip at the top). */
    saveTrouble: trouble,
    canUndo: box.past.length > 0,
    canRedo: box.future.length > 0,
    plans,
  };
}
