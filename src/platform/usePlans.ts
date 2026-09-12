// The plan library, as the interface drives it.
//
// Split out of `useStore` for one reason, and it is the reason encapsulation
// exists: every operation here must FLUSH the plan being left before it moves,
// and while this lived inside a two hundred line hook that rule was a habit.
// Now `park` arrives as an argument, so the rule is in the signature — a
// caller that does not have a way to flush cannot build these controls at all.
//
// The seam is pitfall 28 on one side and pitfall 27 on the other, and the two
// are opposites that look alike:
//
//   `park()`               writes the outgoing plan, then cancels the timer.
//                          Every switch, create and delete needs it, or the
//                          last edit before the move is dropped silently.
//   `discardPendingSave()` cancels the timer WITHOUT writing. Only the bundle
//                          import wants this: the key it would write to is
//                          about to be overwritten, and a pending write landing
//                          400 ms later would put the outgoing plan inside the
//                          incoming library. Measured during the split: today
//                          the autosave effect already clears its own handle
//                          whenever the box changes, so removing this call
//                          changes no observable behaviour. It is kept as the
//                          statement of intent, and `useStore.ts` says so at
//                          the point where the timer is owned.
//
// `useStore.ts` owns the timer and hands both of these down; the comment there
// points back here.

import { useCallback, useState } from 'react';

import type { Bundle } from '../pure/bundle';
import { parseState } from '../pure/parseState';
import {
  addPlan,
  findPlan,
  type Library,
  removePlan,
  renamePlan as renameInLibrary,
  setActive,
  setDraft,
  uniquePlanName,
} from '../pure/library';
import { sanitize } from '../pure/constraints';
import { emptyState, newId } from '../pure/entities';
import { dropPlanText, readLibrary, writeLibrary } from './libraryStore';
import { loadPlan, savePlan } from './planStore';
import type { Id, State } from '../leaf/types';

/** What the plan controls need from whoever owns the box and the autosave. */
export interface PlanSeam {
  /** The plan the box is currently on. */
  planId: Id;
  /** Writes the outgoing plan NOW and cancels the pending autosave (pitfall 28). */
  park: () => void;
  /** Cancels the pending autosave without writing it (pitfall 27, mirrored). */
  discardPendingSave: () => void;
  /** Puts a state in the box and makes that plan the open one. */
  openPlan: (id: Id, state: State) => void;
}

export function usePlans({ planId, park, discardPendingSave, openPlan }: PlanSeam) {
  const [library, setLibrary] = useState<Library>(readLibrary);

  const commit = useCallback((next: Library) => {
    writeLibrary(next);
    setLibrary(next);
  }, []);

  const switchPlan = useCallback(
    (id: Id) => {
      if (id === planId || findPlan(library, id) === undefined) return;
      park();
      openPlan(id, loadPlan(id) ?? emptyState());
      commit(setActive(library, id));
    },
    [planId, park, commit, library, openPlan],
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
      openPlan(id, clean);
      return id;
    },
    [park, commit, library, openPlan],
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
      if (id === planId) {
        openPlan(next.activeId, loadPlan(next.activeId) ?? emptyState());
      }
    },
    [library, commit, park, planId, openPlan],
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
      discardPendingSave();

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
      openPlan(
        next.activeId,
        parsed.find((x) => x.id === next.activeId)?.state ?? parsed[0]!.state,
      );
      return { ok, failed };
    },
    [library, commit, discardPendingSave, openPlan],
  );

  return {
    library,
    planId,
    switchPlan,
    createPlan,
    deletePlan,
    renamePlan,
    markDraft,
    replaceLibrary,
  };
}
