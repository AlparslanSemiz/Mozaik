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

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { type Box, reduce } from '../pure/undo';
import { loadPlan, rotateBackups, savePlan } from './planStore';
import { usePlans } from './usePlans';
import { emptyState } from '../pure/entities';
import { planKey } from '../pure/library';
import { readLibrary, writeLibrary } from './libraryStore';
import type { Id, State } from '../leaf/types';

const SAVE_DELAY = 400; // ms — do not write on every drag frame

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

/** While typing in a text box let the browser handle Ctrl+Z, do not grab it.
    Exported: App.tsx's own global shortcuts (the '?' help key) need the same
    guard, and a second copy of a four-line rule is still a second copy. */
export function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
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
  }, []);

  const openPlan = useCallback((id: Id, state: State) => {
    dispatch({ type: 'switch', id, state });
  }, []);

  const plans = usePlans({ planId: box.planId, park, discardPendingSave, openPlan });

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
    plans,
  };
}
