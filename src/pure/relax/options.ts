// What a suggestion search is asked and what it answers: the families of
// change and what each calls cheap, the options, the search's budgets, and the
// shapes of a suggestion, a progress report and a result.

import type { Id, Refusal, Relaxation } from '../../leaf/model';
import type { SolverExclusions } from '../program';

/**
 * One way of changing the data, and what it calls cheap. The first three open
 * closed teacher hours and differ only in the price of an hour:
 *   - teacherDays: an hour on a day the teacher already teaches costs 1, a
 *     day the teacher did not come at all costs 2 more;
 *   - teacherHours: every hour costs 1, and of the fewest, hours side by side
 *     with the teacher's own are preferred;
 *   - fewTeachers: every teacher asked costs more than any number of hours.
 */
export type RelaxFamily =
  | 'teacherDays'
  | 'teacherHours'
  | 'fewTeachers'
  | 'mixed'
  | 'rules'
  | 'reassign'
  | 'handFew'
  | 'handHours'
  | 'blockShape'
  | 'weeklyHours';

/** The order the ways are SHOWN in: the user's own list first (2026-09-24). */
export const FAMILY_ORDER: readonly RelaxFamily[] = [
  'teacherDays',
  'teacherHours',
  'fewTeachers',
  'mixed',
  'rules',
  'reassign',
  'handFew',
  'handHours',
  'blockShape',
  'weeklyHours',
];

/**
 * The hand-over ways ("karma", 2026-09-25): a lesson given to another teacher
 * of its subject is a smaller thing to ask than a teacher's closed hour, the
 * user said, so two ways trade the one for the other and the father sees both:
 *   - handFew: as few lessons handed over as can be (at least one), then as
 *     few hours as that leaves;
 *   - handHours: as few hours as can be with at most HAND_CAP lessons handed
 *     over, then as few of those.
 * CP-SAT on the father's data (WORKLOG 2026-09-25): one lesson and 3 hours,
 * three lessons and 2 hours, against 4 hours with none.
 */
export const HAND_CAP = 3;

export interface Suggestion {
  family: RelaxFamily;
  changes: Relaxation[];
  /** The whole week found under `changes`: fixed cells included. */
  placements: Record<string, Id>;
  /**
   * How big the change is, in the family's own unit: teacher hours opened,
   * hours over the old limits, hours plus limit steps, lessons given to another
   * teacher, lessons reshaped, hours dropped.
   */
  size: number;
  /** No smaller change of this family exists (the formula said so). */
  proven: boolean;
  /**
   * The run kept what was on the grid, no way was found that way, and this one
   * lays the unpinned lessons out again: applying it replaces them.
   */
  relaid: boolean;
  /**
   * What the reader already said yes to ("Olur"): made before `changes`, at no
   * cost to the search, and applied with them. `changes` is what is still to
   * ask; empty means the answers so far are enough.
   */
  accepted: Relaxation[];
}

export interface RelaxOptions {
  /** The same as the stuck run's: what it kept is kept here too. */
  keepPlaced: boolean;
  exclusions: SolverExclusions;
  /**
   * A cap on the whole search, in time. The search itself stops by conflict
   * counts; this is for a machine so slow that those would take too long. Past
   * it the best week found so far is offered with `proven: false`.
   */
  budgetMs: number;
  /** Which ways to look for, in the order they are looked for. */
  families: RelaxFamily[];
  refused: Refusal[];
  /**
   * What the search before this one found, when this one runs again after an
   * answer ("Olmaz"). Each way starts from its own earlier week, the refused
   * hours falling out of it on their own (they are no longer a start any
   * block may take), and the neighbourhoods grow to five and six days. MEASURED
   * on the father's file (2026-09-25): refusing KY's Saturday, the fewest-hours
   * way found 8 hours in 61 s starting from the stuck week; from its own
   * earlier week 6, with the wider neighbourhoods too 5 in 18 s, which is
   * CP-SAT's best. Either alone stayed at 6.
   */
  previous: Suggestion[];
  /** The changes the reader said yes to: the search runs on the data with them made. */
  accepted: Relaxation[];
  /**
   * Weeks another line of the search found, for a way on this line that has
   * no week of its own and none before it on the line to start from. The
   * hand-over ways start from the fewest-hours week, and on a line of their
   * own that week arrives from the line that found it (relaxPool.ts).
   */
  seed: Suggestion[];
  /**
   * Skip the pass that keeps the laid-out lessons where they are and go
   * straight to laying them out again: the search before this one found no way
   * with them kept, and a refusal cannot make one appear.
   */
  startRelaid: boolean;
}

/**
 * The order the ways are LOOKED for, which is not the order they are shown in:
 * the first one found is the first thing the reader sees, so the quickest go
 * first. MEASURED on the father's data (2026-09-24, WORKLOG).
 */
const SEARCH_ORDER: RelaxFamily[] = [
  'fewTeachers',
  'teacherHours',
  // Straight after the fewest-hours way, whose week they start from (relaxPool.ts).
  'handFew',
  'handHours',
  'teacherDays',
  'mixed',
  'rules',
  'reassign',
  'blockShape',
  'weeklyHours',
];

export const DEFAULTS: RelaxOptions = {
  keepPlaced: true,
  exclusions: { teacherIds: [], classIds: [], dayNames: [] },
  budgetMs: 120_000,
  families: SEARCH_ORDER,
  refused: [],
  previous: [],
  startRelaid: false,
  accepted: [],
  seed: [],
};

/**
 * How far the cost counter counts at first. It is doubled whenever the answer
 * lies above it, so a small first guess costs one extra question at most.
 */
export const FIRST_CAP = 32;

/**
 * How much each way may search at most, in SAT conflicts: a count and not a
 * clock, so the same data gets the same suggestion on any machine (the solver
 * counts nodes for the same reason). The clock (`budgetMs`) is only a cap over
 * all of it. Most ways stop well before this: see NEIGHBOURHOOD_CONFLICTS.
 */
export const FAMILY_CONFLICTS: Record<RelaxFamily, number> = {
  teacherDays: 150_000,
  teacherHours: 150_000,
  fewTeachers: 150_000,
  mixed: 150_000,
  rules: 150_000,
  reassign: 100_000,
  // Less than the teacher-hour ways: they came after the fewest-hours way on
  // its line and made it the slowest one (63 s against 45). MEASURED on the
  // father's file (2026-09-25): the same sizes at 60 000 as at 150 000, 8 to
  // 10 s sooner. With eight cores or more they have a line of their own now
  // and start from that way's first week (`seed`, relaxPool.ts).
  handFew: 60_000,
  handHours: 60_000,
  blockShape: 30_000,
  weeklyHours: 30_000,
};

/**
 * A cheaper week is looked for first near the best one: all of it kept but two
 * days (then three), and those days laid out again. Each such question is
 * small and mostly answered in tens of conflicts; this is its cap. MEASURED on
 * the father's data (2026-09-24): "4 hours, no fewer" is a pigeonhole proof no
 * budget reaches, and the whole-week question spent 150 000 conflicts getting
 * from 6 hours to 4 and then the rest of its budget failing to go under; near
 * the best week, 4 came in about 20 000 and a round of refusals says when to
 * stop.
 */
export const NEIGHBOURHOOD_CONFLICTS = 1_000;

/** How many days a neighbourhood frees, tried in this order. */
export const NEIGHBOURHOOD_SIZES = [2, 3, 4];

/** The same after an answer, when the search starts from its own earlier week (see `previous`). */
export const WIDE_NEIGHBOURHOOD_SIZES = [2, 3, 4, 5, 6];

/** Once no neighbourhood helps, how long the whole week is asked before giving up. */
export const WHOLE_WEEK_CONFLICTS = 60_000;

/**
 * How long a new formula tries the hint week as it stands. In practice the
 * question is refused at once, every time: see `hinted` in buildModel.
 */
export const HINT_CONFLICTS = 2_000;

export type RelaxStage = 'building' | 'solving' | 'proving' | 'checking';

export interface RelaxProgress {
  family: RelaxFamily;
  stage: RelaxStage;
  /** The ways whose search is over in this pass, found or not. */
  finished: RelaxFamily[];
  /** Suggestions found and checked so far, so they can be shown as they come. */
  suggestions: Suggestion[];
  elapsedMs: number;
}

export interface RelaxResult {
  /** 'done' also when the budget ran out: `suggestions` is what was found. */
  phase: 'done' | 'cancelled';
  suggestions: Suggestion[];
  elapsedMs: number;
  /**
   * Weeks the search built that `verifySuggestion` then turned down. The
   * formula and the checker state the same rules twice, so this is 0 when they
   * agree; a rule the formula forgets is filtered here and would leave every
   * suggestion legal, so only this count shows it (`invariants.test.ts`).
   */
  rejected: number;
}

export interface Relaxer {
  step(sliceMs: number): RelaxResult | null;
  progress(): RelaxProgress;
  cancel(): RelaxResult;
}
