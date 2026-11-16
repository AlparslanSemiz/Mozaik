// Drives src/solver.ts from React. The solver itself is pure and knows nothing
// about frames or state; this is the twenty lines that turn it into something a
// user can watch and stop.
//
// When a run ends stuck, the same hook goes on to the second search
// (pure/relax/, TODO B5.9): what would have to change for the week to be
// built. Its suggestions arrive one family at a time, "Durdur" stops it and
// keeps what it has, and applying one is a single undo step.
//
// It lives in App, NOT in Program (pitfall 18): a component is unmounted when
// the tab changes, and a run that dies because somebody glanced at Kontrol
// would throw away work with no explanation.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createSolver,
  type Solver,
  type SolverOptions,
  type SolverProgress,
  type SolverResult,
} from '../../pure/solver';
import {
  applySuggestion,
  suggestionUses,
  type RelaxOptions,
  type RelaxProgress,
  type Relaxer,
  type Suggestion,
} from '../../pure/relax';
import { activePlacements } from '../../pure/grid';
import { buildIndex, pinnedRelationBreaches } from '../../pure/constraints';
import { startRelax } from './relaxPool';
import type { Answers, Id, State } from '../../leaf/model';

/**
 * One slice per animation frame. `requestAnimationFrame`, not `setTimeout(0)`:
 * nested timeouts are clamped to 4 ms after five levels and guarantee no
 * repaint, and a progress line nobody can see is worse than none.
 */
const SLICE_MS = 10;

/**
 * How often a running search's numbers reach React: about four times a
 * second. Every frame meant a render of App and the bar per frame, on a
 * machine whose two cores the search already wants.
 */
const PROGRESS_MS = 250;

/** The second search, after a stuck run: what to change so the week can be built. */
export interface Advice {
  /**
   * The state the suggestions were made for: the stuck run's own result. One
   * is applied only while the timetable is still exactly this.
   */
  forState: State;
  searching: boolean;
  /**
   * The reader pressed Durdur before the search was over. What was found
   * stands, but it is not the search's answer: the panel says so and offers
   * to go on (DENETIM DK5), rather than read like a search that ended.
   */
  stopped: boolean;
  progress: RelaxProgress | null;
  suggestions: Suggestion[];
  /**
   * The answers the search ran with (the plan's own, State.answers): when the
   * plan's change, by a click or an undo, the search runs again.
   */
  answers: Answers;
}

/**
 * The same timetable and data, whatever the answers: an answer is a note for
 * the next search, not a change to the week a suggestion was made for.
 */
export function samePlan(a: State, b: State): boolean {
  if (a === b) return true;
  return (
    a.settings === b.settings &&
    a.rooms === b.rooms &&
    a.teachers === b.teachers &&
    a.classes === b.classes &&
    a.lessons === b.lessons &&
    a.unavailable === b.unavailable &&
    a.programs === b.programs &&
    a.activeProgramId === b.activeProgramId &&
    // A relation changes which weeks are legal, like a closed hour does.
    a.relations === b.relations
  );
}

function sameAnswers(a: Answers, b: Answers): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The search a stuck run started, kept so a refusal can run it again. */
interface RelaxJob {
  from: State;
  hint: Record<string, Id>;
  options: Partial<RelaxOptions>;
}

/** The ways found so far, a new find replacing the old one of its way. */
function merge(kept: Suggestion[], fresh: Suggestion[]): Suggestion[] {
  const ways = new Set(fresh.map((s) => s.family));
  return [...kept.filter((s) => !ways.has(s.family)), ...fresh];
}

export interface SolverRun {
  running: boolean;
  progress: SolverProgress | null;
  result: SolverResult | null;
  advice: Advice | null;
  /** A suggestion was just applied: the bar says so until the next run. */
  applied: Suggestion | null;
  /**
   * `placed` hears the state the run put in place, once it is in place: the
   * notice that offers "Geri al" for "Yeniden yap" needs it (TODO SD1).
   */
  start: (base: State, options?: Partial<SolverOptions>, placed?: (next: State) => void) => void;
  /** Stops the run, or the suggestion search after it. */
  stop: () => void;
  apply: (s: Suggestion) => void;
  /** The plan's answers changed (an answer, or an undo): looks again under them. */
  reconsider: (answers: Answers) => void;
  /** Starts a stopped suggestion search again, keeping what it had found. */
  resume: () => void;
  /** Dismisses the result line and the suggestions. */
  clear: () => void;
}

/** `peek` reads the present as of the last render (useStore), for `start`'s `placed`. */
export function useSolver(
  change: (apply: (d: State) => State) => void,
  peek?: () => State,
): SolverRun {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<SolverProgress | null>(null);
  const [result, setResult] = useState<SolverResult | null>(null);

  const [advice, setAdvice] = useState<Advice | null>(null);
  const [applied, setApplied] = useState<Suggestion | null>(null);

  const solver = useRef<Solver | null>(null);
  /** The state the run started from, so a concurrent edit is not overwritten. */
  const base = useRef<State | null>(null);
  const options = useRef<Partial<SolverOptions>>({});
  const onPlaced = useRef<((next: State) => void) | undefined>(undefined);
  const relaxer = useRef<Relaxer | null>(null);
  const job = useRef<RelaxJob | null>(null);
  /** The ways found before the search now running, still good under its refusals. */
  const kept = useRef<Suggestion[]>([]);

  /**
   * Work promised for the next frame: a stuck run's search, or a stopped
   * run's result. Anything that starts, applies or clears moves this on, and
   * the promised work then finds it changed and does nothing.
   */
  const turn = useRef(0);
  /** A stuck run waiting for its result to be on screen before it searches. */
  const queued = useRef<{ done: SolverResult; from: State } | null>(null);

  /** Ends the suggestion search, and with it any worker it holds. */
  const dropSearch = () => {
    turn.current++;
    queued.current = null;
    relaxer.current?.cancel();
    relaxer.current = null;
  };

  /**
   * A stuck run's second search: what would have to change. Started a frame
   * after the run's result, because starting the workers and the first
   * render of the panel in the same task as the week itself froze the
   * screen for a quarter of a second at the end of every stuck run.
   */
  const advise = useCallback((done: SolverResult, from: State) => {
    // Stuck, but two pinned lessons break a relation: every way the search
    // could build keeps them, so it would only come back empty, a minute
    // later (TODO RK2). It is not started; the panel says why at once.
    if (pinnedRelationBreaches(from, buildIndex(from)).length > 0) {
      job.current = null;
      kept.current = [];
      setAdvice({
        forState: done.state,
        searching: false,
        stopped: false,
        progress: null,
        suggestions: [],
        answers: from.answers,
      });
    }
    // Stuck, not stopped: ask what would have to change. It starts from the
    // data the run started from, with the stuck week as its first guess.
    else {
      job.current = {
        from,
        hint: activePlacements(done.state),
        options: { keepPlaced: options.current.keepPlaced ?? true },
      };
      kept.current = [];
      relaxer.current = startRelax(from, job.current.hint, {
        ...job.current.options,
        accepted: from.answers.accepted,
        refused: from.answers.refused,
      });
      setAdvice({
        forState: done.state,
        searching: true,
        stopped: false,
        progress: relaxer.current.progress(),
        suggestions: [],
        answers: from.answers,
      });
    }
  }, []);

  const finish = useCallback(
    (done: SolverResult, from: State | null = base.current) => {
      solver.current = null;
      base.current = null;
      setRunning(false);
      setProgress(null);
      setResult(done);
      if (done.phase === 'stuck' && from !== null) queued.current = { done, from };
      if (done.state === from) return; // nothing was placed

      // `from` is read into a local FIRST: React runs the reducer's callback
      // after this function has returned, so reading `base.current` in there
      // would find the null we just wrote and quietly discard the whole run.
      //
      // What it guards: if the timetable moved while we were searching (an
      // undo, a drop, a loaded backup), the answer describes a world that no
      // longer exists and must not be pasted over the new one.
      // Whether the answer will land, asked BEFORE the change: if the
      // timetable moved meanwhile the change is a no-op, and a notice saying
      // it was laid out again would be false (review, 2026-11-15). A stopped
      // run's half week is not announced either; its own bar says it stopped.
      const lands = peek === undefined || peek() === from;
      change((d) => (d === from ? done.state : d));
      const placed = onPlaced.current;
      onPlaced.current = undefined;
      if (lands && done.phase !== 'cancelled') placed?.(done.state);
    },
    [change, peek],
  );

  // After the result is committed, and a frame later: the search.
  useEffect(() => {
    const next = queued.current;
    if (next === null) return;
    queued.current = null;
    const mine = turn.current;
    requestAnimationFrame(() => {
      if (turn.current === mine) advise(next.done, next.from);
    });
  }, [result, advise]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;

    const tick = () => {
      const active = solver.current;
      if (active === null) return;

      const done = active.step(SLICE_MS);
      if (done !== null) {
        finish(done);
        return;
      }
      const now = performance.now();
      if (now - shown >= PROGRESS_MS) {
        shown = now;
        setProgress(active.progress());
      }
      frame = requestAnimationFrame(tick);
    };

    let shown = performance.now();
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, finish]);

  const searching = advice?.searching === true;
  useEffect(() => {
    if (!searching) return;
    let frame = 0;
    const tick = () => {
      const active = relaxer.current;
      if (active === null) return;
      const done = active.step(SLICE_MS);
      if (done !== null) {
        relaxer.current = null;
        const suggestions = merge(kept.current, done.suggestions);
        setAdvice((a) => a && { ...a, searching: false, progress: null, suggestions });
        return;
      }
      const progress = active.progress();
      // A new list only when a suggestion arrived or a way found a better week
      // (it takes the earlier one's place), so the panel under the bar
      // re-renders for news and not for every frame of the clock. The clock
      // itself (the seconds, the bar) moves about four times a second.
      const now = performance.now();
      const news =
        progress.suggestions.length !== said.suggestions.length ||
        progress.suggestions.some((s, i) => s !== said.suggestions[i]) ||
        progress.finished.length !== said.finished.length;
      if (news || now - shown >= PROGRESS_MS) {
        shown = now;
        said = progress;
        setAdvice((a) => {
          if (a === null) return a;
          const suggestions = merge(kept.current, progress.suggestions);
          const same =
            suggestions.length === a.suggestions.length &&
            suggestions.every((s, i) => s === a.suggestions[i]);
          return { ...a, progress, suggestions: same ? a.suggestions : suggestions };
        });
      }
      frame = requestAnimationFrame(tick);
    };
    let shown = performance.now();
    let said: { suggestions: Suggestion[]; finished: unknown[] } = {
      suggestions: [],
      finished: [],
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [searching]);

  const start = useCallback(
    (from: State, runOptions?: Partial<SolverOptions>, placed?: (next: State) => void) => {
      base.current = from;
      options.current = runOptions ?? {};
      onPlaced.current = placed;
      dropSearch();
      solver.current = createSolver(from, runOptions);
      setAdvice(null);
      setApplied(null);
      setResult(null);
      setProgress(solver.current.progress());
      setRunning(true);
    },
    [],
  );

  const stop = useCallback(() => {
    const active = solver.current;
    if (active !== null) {
      // Stopped on screen first, explained a frame later: `cancel` names why
      // every lesson left over is stuck, and on the weak machine that was a
      // third of a second between the click and Durdur going away.
      const from = base.current;
      solver.current = null;
      setRunning(false);
      setProgress(null);
      const mine = ++turn.current;
      requestAnimationFrame(() => {
        if (turn.current === mine) finish(active.cancel(), from);
      });
      return;
    }
    const search = relaxer.current;
    if (search === null) return;
    relaxer.current = null;
    const done = search.cancel();
    const suggestions = merge(kept.current, done.suggestions);
    // The progress stays: which ways were over before the stop is what tells
    // a finished way's week from one that was still being made smaller.
    setAdvice((a) => a && { ...a, searching: false, stopped: true, suggestions });
  }, [finish]);

  /**
   * Goes on after a stop: the same search under the same answers, started
   * again with the weeks it had found as its first guesses, which it keeps
   * until it finds better. Not from where it stood — a search cannot be
   * paused mid-question, and the worker holding it is gone.
   */
  const resume = useCallback(() => {
    const current = job.current;
    if (current === null || advice === null || !advice.stopped) return;
    dropSearch();
    kept.current = advice.suggestions;
    relaxer.current = startRelax(current.from, current.hint, {
      ...current.options,
      accepted: advice.answers.accepted,
      refused: advice.answers.refused,
      previous: advice.suggestions,
      startRelaid: advice.suggestions.some((s) => s.relaid),
    });
    setAdvice({
      ...advice,
      searching: true,
      stopped: false,
      progress: relaxer.current.progress(),
    });
  }, [advice]);

  const apply = useCallback(
    (s: Suggestion) => {
      const forState = advice?.forState;
      if (forState === undefined) return;
      // The same guard as `finish`: a suggestion describes the timetable it was
      // made for, and pasting it over a different one would undo that edit.
      // What was said yes to is now the data itself; the noes stay for the
      // next stuck run.
      change((d) =>
        samePlan(d, forState)
          ? { ...applySuggestion(d, s), answers: { accepted: [], refused: d.answers.refused } }
          : d,
      );
      dropSearch();
      setAdvice(null);
      setResult(null);
      setApplied(s);
    },
    [advice, change],
  );

  /**
   * Looks again under the plan's answers, keeping the ways found before that
   * need nothing refused. Each way starts again from the week it found, and a
   * run that had to lay the week out again does not first try once more with
   * it kept.
   */
  const reconsider = useCallback(
    (answers: Answers) => {
      const current = job.current;
      if (current === null || advice === null || sameAnswers(answers, advice.answers)) return;
      dropSearch();
      const accepting = !sameAnswers(
        { accepted: answers.accepted, refused: [] },
        { accepted: advice.answers.accepted, refused: [] },
      );
      // A new yes changes what every way costs, so nothing found before stands.
      kept.current = accepting
        ? []
        : advice.suggestions.filter(
            (s) => !answers.refused.some((r) => suggestionUses(current.from, s, r)),
          );
      relaxer.current = startRelax(current.from, current.hint, {
        ...current.options,
        accepted: answers.accepted,
        refused: answers.refused,
        previous: advice.suggestions,
        startRelaid: advice.suggestions.some((s) => s.relaid),
      });
      setAdvice({
        ...advice,
        searching: true,
        stopped: false,
        progress: relaxer.current.progress(),
        suggestions: kept.current,
        answers,
      });
    },
    [advice],
  );

  const clear = useCallback(() => {
    dropSearch();
    setResult(null);
    setAdvice(null);
    setApplied(null);
  }, []);

  // App re-renders for every tab change. A stable object lets the memoised
  // Program tree ignore those navigation-only renders.
  return useMemo(
    () => ({
      running,
      progress,
      result,
      advice,
      applied,
      start,
      stop,
      apply,
      reconsider,
      resume,
      clear,
    }),
    [running, progress, result, advice, applied, start, stop, apply, reconsider, resume, clear],
  );
}
