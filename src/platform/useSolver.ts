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
import { applySuggestion } from '../pure/relax';
import type { Refusal, RelaxOptions, RelaxProgress, Relaxer, Suggestion } from '../pure/relax';
import { activePlacements } from '../pure/programs';
import { startRelax } from './relaxPool';
import type { Id, State } from '../leaf/types';

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
  /** What the reader said cannot be ("Bu olmaz"): every search since keeps clear of it. */
  refused: Refusal[];
}

/** The search a stuck run started, kept so a refusal can run it again. */
interface RelaxJob {
  from: State;
  hint: Record<string, Id>;
  options: Partial<RelaxOptions>;
}

/** Does `s` make the change `r` rules out? */
function uses(s: Suggestion, r: Refusal): boolean {
  return s.changes.some((c) => {
    switch (r.kind) {
      case 'teacherDay':
        return c.kind === 'teacherHour' && c.teacherId === r.teacherId && c.day === r.day;
      case 'teacherDayLimit':
      case 'teacherConsecutive':
        return c.kind === r.kind && c.teacherId === r.teacherId;
      case 'lessonTeacher':
        return c.kind === r.kind && c.lessonId === r.lessonId && c.teacherId === r.teacherId;
      default:
        return c.kind === r.kind && c.lessonId === r.lessonId;
    }
  });
}

/** Two refusals of the same thing. */
export function sameRefusal(a: Refusal, b: Refusal): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
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
  start: (base: State, options?: Partial<SolverOptions>) => void;
  /** Stops the run, or the suggestion search after it. */
  stop: () => void;
  apply: (s: Suggestion) => void;
  /** "Bu olmaz": rules a change out and looks again without it. */
  refuse: (r: Refusal) => void;
  /** Takes a refusal back and looks again. */
  unrefuse: (r: Refusal) => void;
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
  const job = useRef<RelaxJob | null>(null);
  /** The ways found before the search now running, still good under its refusals. */
  const kept = useRef<Suggestion[]>([]);

  /** Ends the suggestion search, and with it any worker it holds. */
  const dropSearch = () => {
    relaxer.current?.cancel();
    relaxer.current = null;
  };

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
        job.current = {
          from,
          hint: activePlacements(done.state),
          options: {
            keepPlaced: options.current.keepPlaced ?? true,
            ...(options.current.exclusions === undefined
              ? {}
              : { exclusions: options.current.exclusions }),
          },
        };
        kept.current = [];
        relaxer.current = startRelax(from, job.current.hint, job.current.options);
        setAdvice({
          forState: done.state,
          searching: true,
          progress: relaxer.current.progress(),
          suggestions: [],
          refused: [],
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
        const suggestions = merge(kept.current, done.suggestions);
        setAdvice((a) => a && { ...a, searching: false, progress: null, suggestions });
        return;
      }
      const progress = active.progress();
      // A new list only when a suggestion arrived, so the panel under the bar
      // re-renders for news and not for every frame of the clock.
      setAdvice((a) => {
        if (a === null) return a;
        const suggestions = merge(kept.current, progress.suggestions);
        return {
          ...a,
          progress,
          suggestions: suggestions.length === a.suggestions.length ? a.suggestions : suggestions,
        };
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [searching]);

  const start = useCallback((from: State, runOptions?: Partial<SolverOptions>) => {
    base.current = from;
    options.current = runOptions ?? {};
    dropSearch();
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
    const suggestions = merge(kept.current, done.suggestions);
    setAdvice((a) => a && { ...a, searching: false, progress: null, suggestions });
  }, [finish]);

  const apply = useCallback(
    (s: Suggestion) => {
      const forState = advice?.forState;
      if (forState === undefined) return;
      // The same guard as `finish`: a suggestion describes the timetable it was
      // made for, and pasting it over a different one would undo that edit.
      change((d) => (d === forState ? applySuggestion(d, s) : d));
      dropSearch();
      setAdvice(null);
      setResult(null);
      setApplied(s);
    },
    [advice, change],
  );

  /** Looks again under `refused`, keeping the ways that do not need any of it. */
  const research = useCallback(
    (refused: Refusal[]) => {
      const current = job.current;
      if (current === null || advice === null) return;
      dropSearch();
      kept.current = advice.suggestions.filter((s) => !refused.some((r) => uses(s, r)));
      // Each way starts again from the week it found, and a run that had to
      // lay the week out again does not first try once more with it kept.
      relaxer.current = startRelax(current.from, current.hint, {
        ...current.options,
        refused,
        previous: advice.suggestions,
        startRelaid: advice.suggestions.some((s) => s.relaid),
      });
      setAdvice({
        ...advice,
        searching: true,
        progress: relaxer.current.progress(),
        suggestions: kept.current,
        refused,
      });
    },
    [advice],
  );

  const refuse = useCallback(
    (r: Refusal) => {
      if (advice === null || advice.refused.some((x) => sameRefusal(x, r))) return;
      research([...advice.refused, r]);
    },
    [advice, research],
  );

  const unrefuse = useCallback(
    (r: Refusal) => {
      if (advice === null) return;
      research(advice.refused.filter((x) => !sameRefusal(x, r)));
    },
    [advice, research],
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
      refuse,
      unrefuse,
      clear,
    }),
    [running, progress, result, advice, applied, start, stop, apply, refuse, unrefuse, clear],
  );
}
