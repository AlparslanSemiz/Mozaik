// Drives src/solver.ts from React. The solver itself is pure and knows nothing
// about frames or state; this is the twenty lines that turn it into something a
// user can watch and stop.
//
// When a run ends stuck, the same hook goes on to the second search
// (pure/relax.ts, TODO B5.9): what would have to change for the week to be
// built. Its suggestions arrive one family at a time, "Durdur" stops it and
// keeps what it has, and applying one is a single undo step.
//
// It lives in App, NOT in Program (pitfall 18): a component is unmounted when
// the tab changes, and a run that dies because somebody glanced at Kontrol
// would throw away work with no explanation.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createSolver } from '../pure/solver';
import type { Solver, SolverOptions, SolverProgress, SolverResult } from '../pure/solver';
import { applySuggestion, createRelaxer } from '../pure/relax';
import type { RelaxProgress, Relaxer, Suggestion } from '../pure/relax';
import { activePlacements } from '../pure/programs';
import type { State } from '../leaf/types';

/**
 * One slice per animation frame. `requestAnimationFrame`, not `setTimeout(0)`:
 * nested timeouts are clamped to 4 ms after five levels and guarantee no
 * repaint, and a progress line nobody can see is worse than none.
 */
const SLICE_MS = 10;

/** The second search, after a stuck run: what to change so the week can be built. */
export interface Advice {
  /**
   * The state the suggestions were made for: the stuck run's own result. One
   * is applied only while the timetable is still exactly this.
   */
  forState: State;
  searching: boolean;
  progress: RelaxProgress | null;
  suggestions: Suggestion[];
}

export interface SolverRun {
  running: boolean;
  progress: SolverProgress | null;
  result: SolverResult | null;
  advice: Advice | null;
  /** A suggestion was just applied: the bar says so until the next run. */
  applied: Suggestion | null;
  start: (base: State, options?: Partial<SolverOptions>) => void;
  /** Stops the run, or the suggestion search after it. */
  stop: () => void;
  apply: (s: Suggestion) => void;
  /** Dismisses the result line and the suggestions. */
  clear: () => void;
}

export function useSolver(change: (apply: (d: State) => State) => void): SolverRun {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<SolverProgress | null>(null);
  const [result, setResult] = useState<SolverResult | null>(null);

  const [advice, setAdvice] = useState<Advice | null>(null);
  const [applied, setApplied] = useState<Suggestion | null>(null);

  const solver = useRef<Solver | null>(null);
  /** The state the run started from, so a concurrent edit is not overwritten. */
  const base = useRef<State | null>(null);
  const options = useRef<Partial<SolverOptions>>({});
  const relaxer = useRef<Relaxer | null>(null);

  const finish = useCallback(
    (done: SolverResult) => {
      const from = base.current;
      solver.current = null;
      base.current = null;
      setRunning(false);
      setProgress(null);
      setResult(done);

      // Stuck, not stopped: ask what would have to change. It starts from the
      // data the run started from, with the stuck week as its first guess.
      if (done.phase === 'stuck' && from !== null) {
        relaxer.current = createRelaxer(from, activePlacements(done.state), {
          keepPlaced: options.current.keepPlaced ?? true,
          ...(options.current.exclusions === undefined
            ? {}
            : { exclusions: options.current.exclusions }),
        });
        setAdvice({
          forState: done.state,
          searching: true,
          progress: relaxer.current.progress(),
          suggestions: [],
        });
      }
      if (done.state === from) return; // nothing was placed

      // `from` is read into a local FIRST: React runs the reducer's callback
      // after this function has returned, so reading `base.current` in there
      // would find the null we just wrote and quietly discard the whole run.
      //
      // What it guards: if the timetable moved while we were searching (an
      // undo, a drop, a loaded backup), the answer describes a world that no
      // longer exists and must not be pasted over the new one.
      change((d) => (d === from ? done.state : d));
    },
    [change],
  );

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
      setProgress(active.progress());
      frame = requestAnimationFrame(tick);
    };

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
        setAdvice(
          (a) => a && { ...a, searching: false, progress: null, suggestions: done.suggestions },
        );
        return;
      }
      const progress = active.progress();
      // A new list only when a suggestion arrived, so the panel under the bar
      // re-renders for news and not for every frame of the clock.
      setAdvice(
        (a) =>
          a && {
            ...a,
            progress,
            suggestions:
              progress.suggestions.length === a.suggestions.length
                ? a.suggestions
                : progress.suggestions,
          },
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [searching]);

  const start = useCallback((from: State, runOptions?: Partial<SolverOptions>) => {
    base.current = from;
    options.current = runOptions ?? {};
    relaxer.current = null;
    solver.current = createSolver(from, runOptions);
    setAdvice(null);
    setApplied(null);
    setResult(null);
    setProgress(solver.current.progress());
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    const active = solver.current;
    if (active !== null) {
      finish(active.cancel());
      return;
    }
    const search = relaxer.current;
    if (search === null) return;
    relaxer.current = null;
    const done = search.cancel();
    setAdvice(
      (a) => a && { ...a, searching: false, progress: null, suggestions: done.suggestions },
    );
  }, [finish]);

  const apply = useCallback(
    (s: Suggestion) => {
      const forState = advice?.forState;
      if (forState === undefined) return;
      // The same guard as `finish`: a suggestion describes the timetable it was
      // made for, and pasting it over a different one would undo that edit.
      change((d) => (d === forState ? applySuggestion(d, s) : d));
      relaxer.current = null;
      setAdvice(null);
      setResult(null);
      setApplied(s);
    },
    [advice, change],
  );

  const clear = useCallback(() => {
    relaxer.current = null;
    setResult(null);
    setAdvice(null);
    setApplied(null);
  }, []);

  // App re-renders for every tab change. A stable object lets the memoised
  // Program tree ignore those navigation-only renders.
  return useMemo(
    () => ({ running, progress, result, advice, applied, start, stop, apply, clear }),
    [running, progress, result, advice, applied, start, stop, apply, clear],
  );
}
