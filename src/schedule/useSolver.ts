// Drives src/solver.ts from React. The solver itself is pure and knows nothing
// about frames or state; this is the twenty lines that turn it into something a
// user can watch and stop.
//
// It lives in App, NOT in Program (pitfall 18): a component is unmounted when
// the tab changes, and a run that dies because somebody glanced at Kontrol
// would throw away work with no explanation.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSolver } from "./solver";
import type {
  Solver,
  SolverOptions,
  SolverProgress,
  SolverResult,
} from "./solver";
import type { State } from "../types";

/**
 * One slice per animation frame. `requestAnimationFrame`, not `setTimeout(0)`:
 * nested timeouts are clamped to 4 ms after five levels and guarantee no
 * repaint, and a progress line nobody can see is worse than none.
 */
const SLICE_MS = 10;

export interface SolverRun {
  running: boolean;
  progress: SolverProgress | null;
  result: SolverResult | null;
  start: (base: State, options?: Partial<SolverOptions>) => void;
  stop: () => void;
  /** Dismisses the result line. */
  clear: () => void;
}

export function useSolver(
  change: (apply: (d: State) => State) => void,
): SolverRun {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<SolverProgress | null>(null);
  const [result, setResult] = useState<SolverResult | null>(null);

  const solver = useRef<Solver | null>(null);
  /** The state the run started from, so a concurrent edit is not overwritten. */
  const base = useRef<State | null>(null);

  const finish = useCallback(
    (done: SolverResult) => {
      const from = base.current;
      solver.current = null;
      base.current = null;
      setRunning(false);
      setProgress(null);
      setResult(done);
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

  const start = useCallback((from: State, options?: Partial<SolverOptions>) => {
    base.current = from;
    solver.current = createSolver(from, options);
    setResult(null);
    setProgress(solver.current.progress());
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    const active = solver.current;
    if (active === null) return;
    finish(active.cancel());
  }, [finish]);

  const clear = useCallback(() => setResult(null), []);

  // App re-renders for every tab change. A stable object lets the memoised
  // Program tree ignore those navigation-only renders.
  return useMemo(
    () => ({ running, progress, result, start, stop, clear }),
    [running, progress, result, start, stop, clear],
  );
}
