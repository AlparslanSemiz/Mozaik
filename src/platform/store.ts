// State management: reducer + undo stack + localStorage + backup file.
// No library, useReducer is enough.
//
// Data loss is unacceptable (docs/PRINCIPLES.md: no data loss). Three layers of defence:
//   1. auto-save on every change (debounced)
//   2. on every start the previous session's state is pushed down a backup chain (last 3)
//   3. "Yedek indir" — the ONE habit my father will be taught

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { type Bundle, buildBundle } from '../pure/bundle';
import { type Box, reduce } from '../pure/undo';
import { parseState } from '../pure/parseState';
import { loadPlan, rotateBackups, savePlan } from './planStore';
import { sanitize } from '../pure/constraints';
import { emptyState, newId } from '../pure/entities';
import {
  addPlan,
  backupFileName,
  bundleFileName,
  findPlan,
  type Library,
  planKey,
  removePlan,
  renamePlan as renameInLibrary,
  setActive,
  setDraft,
  uniquePlanName,
} from '../pure/library';
import { dropPlanText, readLibrary, writeLibrary } from './libraryStore';
import type { Id, State } from '../leaf/types';

const SAVE_DELAY = 400; // ms — do not write on every drag frame

// ------------------------------------------------------------------- files

/** Hands the browser a file to save. Both file kinds go through here. */
function download(name: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadBackup(d: State): void {
  download(backupFileName(new Date()), JSON.stringify(d));
}

// ------------------------------------------------------------- the bundle
//
// One file holding EVERY plan. The single-plan file is unchanged and still
// what the top bar writes; this is the one that moves a whole setup between
// two computers — and, once the .exe and the site exist, between those two.

/**
 * The state of every plan in the library.
 *
 * The OPEN plan comes from memory, not from its key: the autosave is debounced
 * by 400 ms, so the key can be a few hundred milliseconds behind what is on
 * screen, and a backup that quietly drops the last edit is worse than none.
 * A plan whose key is gone is skipped rather than exported empty.
 */
export function collectStates(library: Library, planId: Id, present: State): Record<Id, State> {
  const out: Record<Id, State> = {};
  for (const plan of library.plans) {
    const state = plan.id === planId ? present : loadPlan(plan.id);
    if (state !== null) out[plan.id] = state;
  }
  return out;
}

export function downloadBundle(library: Library, planId: Id, present: State): number {
  const states = collectStates(library, planId, present);
  download(bundleFileName(new Date()), buildBundle(library, states));
  return Object.keys(states).length;
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
  const [library, setLibrary] = useState<Library>(readLibrary);

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
        dispatch({
          type: 'switch',
          id: next.activeId,
          state: loadPlan(next.activeId) ?? emptyState(),
        });
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

  /**
   * Replaces the WHOLE library with the contents of a bundle file.
   *
   * The order of the steps below is the safety argument, not housekeeping:
   *
   *  1. cancel the pending autosave. `park()` is deliberately NOT used here —
   *     park WRITES the outgoing plan, and its key is about to be overwritten.
   *     But leaving the timer alive is pitfall 27 in a mirror: 400 ms later the
   *     old state would land in the newly imported library's key.
   *  2. parse everything BEFORE touching storage. If not one plan can be read,
   *     nothing at all changes: a half-finished import is two truths.
   *  3. write the data, counting what did not fit (quota).
   *  4. drop the keys of plans the incoming library does not have.
   *  5. write the directory LAST, once its data is really in place — the same
   *     rule createPlan already follows.
   */
  const replaceLibrary = useCallback(
    (bundle: Bundle): { ok: number; failed: number } => {
      window.clearTimeout(timer.current);

      const parsed: Array<{ id: Id; state: State }> = [];
      for (const plan of bundle.library.plans) {
        const raw = bundle.states[plan.id];
        const state = raw === undefined ? null : parseState(JSON.stringify(raw));
        if (state !== null) parsed.push({ id: plan.id, state });
      }
      if (parsed.length === 0) return { ok: 0, failed: bundle.library.plans.length };

      const kept = new Set(parsed.map((x) => x.id));
      let failed = bundle.library.plans.length - parsed.length;
      let ok = 0;
      for (const { id, state } of parsed) {
        if (savePlan(id, state)) ok++;
        else failed++;
      }

      for (const plan of library.plans) {
        if (!kept.has(plan.id)) dropPlanText(plan.id);
      }

      const next: Library = {
        plans: bundle.library.plans.filter((p) => kept.has(p.id)),
        activeId: kept.has(bundle.library.activeId) ? bundle.library.activeId : parsed[0]!.id,
      };
      commit(next);
      dispatch({
        type: 'switch',
        id: next.activeId,
        state: parsed.find((x) => x.id === next.activeId)?.state ?? parsed[0]!.state,
      });
      return { ok, failed };
    },
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
    plans: {
      library,
      planId: box.planId,
      switchPlan,
      createPlan,
      deletePlan,
      renamePlan,
      markDraft,
      replaceLibrary,
    },
  };
}
