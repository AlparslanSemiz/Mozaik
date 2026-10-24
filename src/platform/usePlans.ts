// The plan library, as the interface drives it.
//
// Split out of `useStore` for one reason, and it is the reason encapsulation
// exists: every operation here must FLUSH the plan being left before it moves,
// and while this lived inside a two hundred line hook that rule was a habit.
// Now `park` arrives as an argument, so the rule is in the signature — a
// caller that does not have a way to flush cannot build these controls at all.
//
// `park()` writes the outgoing plan, then cancels the timer (pitfall 28).
// Every switch, create and delete needs it, or the last edit before the move
// is dropped silently. The bundle import needs it too. It used to CANCEL the
// timer without writing (`discardPendingSave`, pitfall 27 mirrored: a write
// landing 400 ms later inside the incoming library), but since TB8 a plan can
// stay through an import, and then its last edit was gone (TB1's review,
// 2026-10-24). Writing first and cancelling after covers both: the key is
// overwritten if the file replaces the plan, and kept if it stays.
//
// `useStore.ts` owns the timer and hands `park` down.

import { useCallback, useState } from 'react';

import type { Bundle } from '../pure/bundle';
import { readBundlePlans } from '../pure/parseState';
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
import { savePlan, setAside, storedPlan } from './planStore';
import type { Id, State } from '../leaf/types';

/** What the plan controls need from whoever owns the box and the autosave. */
export interface PlanSeam {
  /** The plan the box is currently on. */
  planId: Id;
  /** Writes the outgoing plan NOW and cancels the pending autosave (pitfall 28). */
  park: () => void;
  /** Puts a state in the box and makes that plan the open one. */
  openPlan: (id: Id, state: State) => void;
  /** Plans that were not opened because their text cannot be read (TB1). */
  onBroken: (names: string[]) => void;
}

export function usePlans({ planId, park, openPlan, onBroken }: PlanSeam) {
  const [library, setLibrary] = useState<Library>(readLibrary);

  const commit = useCallback((next: Library) => {
    writeLibrary(next);
    setLibrary(next);
  }, []);

  const switchPlan = useCallback(
    (id: Id) => {
      if (id === planId || findPlan(library, id) === undefined) return;
      const read = storedPlan(id);
      // Text that cannot be read is not opened: an empty plan in its place
      // would be written over it by the first edit (TODO TB1).
      if ('broken' in read) {
        onBroken([findPlan(library, id)?.name ?? id]);
        return;
      }
      park();
      openPlan(id, 'state' in read ? read.state : emptyState());
      commit(setActive(library, id));
    },
    [planId, park, commit, library, openPlan, onBroken],
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
        const read = storedPlan(next.activeId);
        if ('broken' in read) {
          const aside = setAside(next, next.activeId);
          commit(aside.lib);
          openPlan(aside.id, aside.state);
          onBroken(aside.broken);
        } else {
          openPlan(next.activeId, 'state' in read ? read.state : emptyState());
        }
      }
    },
    [library, commit, park, planId, openPlan, onBroken],
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
   *  1. park the outgoing plan: write it, and cancel the pending autosave.
   *     Leaving the timer alive is pitfall 27 in a mirror (400 ms later the old
   *     state would land in the imported library's key), and cancelling without
   *     writing lost the last edit of a plan that stays (head of this file).
   *  2. parse everything BEFORE touching storage, with the top bar's rule
   *     (`readBundlePlans`, TB8). If not one plan can be read, nothing at all
   *     changes: a half-finished import is two truths. A plan the file could
   *     not read does not take away the one here with its id: the file meant
   *     to replace it and has nothing to replace it with.
   *  3. write the data, counting what did not fit (quota). If not one plan
   *     was written, stop here: nothing has changed yet, and dropping the
   *     plans here would make the import a loss. A plan that did not fit is
   *     treated like an unreadable one: the plan here with its id stays, and
   *     with no plan here it gets no directory row.
   *  4. drop the keys of plans the incoming library does not have.
   *  5. write the directory LAST, once its data is really in place — the same
   *     rule createPlan already follows.
   */
  const replaceLibrary = useCallback(
    (bundle: Bundle): { ok: number; failed: number; unreadable: number } => {
      park();

      const { plans: parsed, unreadable } = readBundlePlans(bundle);
      if (parsed.length === 0) return { ok: 0, failed: 0, unreadable: unreadable.length };

      const written = new Set<Id>();
      let failed = 0;
      for (const { id, state } of parsed) {
        if (savePlan(id, state)) written.add(id);
        else failed++;
      }
      if (written.size === 0) return { ok: 0, failed, unreadable: unreadable.length };

      // Every plan the file names but could not deliver: unreadable or did not fit.
      const missed = new Set(
        [...unreadable, ...parsed.map((x) => x.id)].filter((id) => !written.has(id)),
      );
      const stays = new Map(library.plans.filter((p) => missed.has(p.id)).map((p) => [p.id, p]));
      for (const plan of library.plans) {
        if (!written.has(plan.id) && !stays.has(plan.id)) dropPlanText(plan.id);
      }

      const fromFile = bundle.library.plans.flatMap((p) => {
        if (written.has(p.id)) return [p];
        const here = stays.get(p.id);
        return here === undefined ? [] : [here];
      });
      const next: Library = {
        plans: [...fromFile, ...[...stays.values()].filter((p) => !fromFile.includes(p))],
        activeId: written.has(bundle.library.activeId)
          ? bundle.library.activeId
          : parsed.find((x) => written.has(x.id))!.id,
      };
      commit(next);
      openPlan(next.activeId, parsed.find((x) => x.id === next.activeId)!.state);
      return { ok: written.size, failed, unreadable: unreadable.length };
    },
    [library, commit, park, openPlan],
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
