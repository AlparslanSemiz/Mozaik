import type { Library } from '../library';
import type { Id, State } from '../types';

/**
 * Every setup step and every settings section gets the same two things and
 * nothing else: the state to draw and one way to change it.
 */
export interface PanelProps {
  state: State;
  change: (apply: (d: State) => State) => void;
}

/**
 * The plan library, as the UI sees it. One prop instead of seven, because it
 * travels App -> Ayarlar -> Veri -> Planlar and App -> Kurulum.
 *
 * It is NOT folded into `PanelProps`: the four setup steps and the three other
 * settings sections have no business touching which plan is open.
 */
export interface PlanControls {
  library: Library;
  planId: Id;
  switchPlan: (id: Id) => void;
  /** Writes `seed` as a new plan and opens it. Returns the new plan's id. */
  createPlan: (name: string, seed: State, draft?: boolean) => Id;
  deletePlan: (id: Id) => void;
  renamePlan: (id: Id, name: string) => void;
  markDraft: (id: Id, draft: boolean) => void;
}
