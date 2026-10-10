// @vitest-environment jsdom

// useSolver, the hook that drives the solver and the suggestion search from
// React. Until 2026-10-09 it had no unit test: its guards were only measured
// through the whole page (otomatik.spec.ts). These pin what the hook itself
// decides, with the solver and the search replaced by fakes:
//
//   - a run writes its week only over the plan it started from,
//   - a stuck run starts the search from that plan, with the stuck week as
//     its first guess and the plan's answers,
//   - Durdur keeps what was found and says it stopped, and "go on" hands the
//     found weeks back as first guesses,
//   - a suggestion is applied only to the plan it was made for, its yeses
//     become data and its noes stay,
//   - a new no drops the ways that used it, a new yes drops them all.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Answers, State } from './leaf/types';
import type { RelaxProgress, RelaxResult, Relaxer, Suggestion } from './pure/relax';
import type { Solver, SolverProgress, SolverResult } from './pure/solver';
import { activePlacements } from './pure/programs';
import { sampleState } from './pure/sample';
import { startRelax } from './platform/search/relaxPool';
import { createSolver } from './pure/solver';
import { samePlan, useSolver, type SolverRun } from './platform/search/useSolver';

vi.mock('./platform/search/relaxPool', () => ({ startRelax: vi.fn() }));
vi.mock('./pure/solver', () => ({ createSolver: vi.fn() }));
vi.mock('./pure/relax', () => ({
  applySuggestion: (d: State) => ({ ...d, settings: { ...d.settings } }),
  suggestionUses: (_d: State, s: Suggestion, r: unknown) =>
    (s as unknown as { uses: unknown }).uses === r,
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// ------------------------------------------------------------------ fakes

/** A suggestion is only ever passed through here; its family is what merges. */
function way(family: string, uses?: string): Suggestion {
  return { family, relaid: false, uses } as unknown as Suggestion;
}

const SOLVER_PROGRESS = { placed: 0, total: 0 } as unknown as SolverProgress;

/** A solver whose next step answers with `outcome`. */
function fakeSolver(outcome: SolverResult): Solver {
  return { step: () => outcome, progress: () => SOLVER_PROGRESS, cancel: () => outcome };
}

/** A search that reports `found` while it runs and `onCancel` when stopped. */
function fakeRelaxer(found: Suggestion[], onCancel: Suggestion[]) {
  const cancel = vi.fn((): RelaxResult => ({
    phase: 'cancelled',
    suggestions: onCancel,
    elapsedMs: 0,
    rejected: 0,
  }));
  const relaxer: Relaxer = {
    step: () => null,
    progress: () => ({ suggestions: found }) as unknown as RelaxProgress,
    cancel,
  };
  return { relaxer, cancel };
}

// ------------------------------------------------------------------ harness

let frames: FrameRequestCallback[] = [];
let run: SolverRun;
let root: Root;
let changes: Array<(d: State) => State>;

function Harness() {
  run = useSolver((apply) => changes.push(apply));
  return null;
}

/** Runs every animation frame asked for so far. */
function frame() {
  act(() => {
    const now = frames;
    frames = [];
    now.forEach((f) => f(0));
  });
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  frames = [];
  changes = [];
  vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => frames.push(f));
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  const host = document.createElement('div');
  root = createRoot(host);
  act(() => root.render(<Harness />));
});

afterEach(() => {
  act(() => root.unmount());
  vi.unstubAllGlobals();
  vi.mocked(startRelax).mockReset();
  vi.mocked(createSolver).mockReset();
});

/** A plan with answers, and the week a stuck run left of it. */
function stuckRun(answers: Answers = { accepted: [], refused: [] }) {
  const base: State = { ...sampleState(), answers };
  // The stuck week holds one block the plan did not: the search's first guess
  // has to be this week, not the plan's.
  const left: State = {
    ...base,
    programs: base.programs.map((p) => ({ ...p, placements: { ...p.placements, kalan: 'x' } })),
  };
  const outcome = { phase: 'stuck', state: left, stuck: [] } as unknown as SolverResult;
  vi.mocked(createSolver).mockReturnValue(fakeSolver(outcome));
  return { base, left };
}

// ------------------------------------------------------------------ tests

describe('samePlan', () => {
  it('cevaplar dışında her şey aynıysa aynı plan, bir ilişki değişince değil', () => {
    const plan = sampleState();
    expect(samePlan(plan, plan)).toBe(true);
    expect(samePlan(plan, { ...plan, answers: { accepted: [], refused: [] } })).toBe(true);
    expect(samePlan(plan, { ...plan, relations: [...plan.relations] })).toBe(false);
    expect(samePlan(plan, { ...plan, lessons: [...plan.lessons] })).toBe(false);
    expect(samePlan(plan, { ...plan, activeProgramId: 'baska' })).toBe(false);
  });
});

describe('useSolver', () => {
  it('biten koşu haftasını yalnız başladığı plan hâlâ yerindeyse yazar', () => {
    const base = sampleState();
    const built: State = { ...base, programs: base.programs.map((p) => ({ ...p })) };
    vi.mocked(createSolver).mockReturnValue(
      fakeSolver({ phase: 'solved', state: built, stuck: [] } as unknown as SolverResult),
    );

    act(() => run.start(base));
    expect(run.running).toBe(true);
    frame();

    expect(run.running).toBe(false);
    expect(run.result?.state).toBe(built);
    expect(changes).toHaveLength(1);
    const write = changes[0]!;
    expect(write(base)).toBe(built);
    // Somebody moved a lesson while it searched: their edit stands.
    const edited = { ...base };
    expect(write(edited)).toBe(edited);
    expect(startRelax).not.toHaveBeenCalled();
  });

  it('takılan koşu öneri aramasını başladığı plandan, takıldığı haftayla ve cevaplarla başlatır', () => {
    const answers = { accepted: [], refused: [{ kind: 'x' }] } as unknown as Answers;
    const { base, left } = stuckRun(answers);
    vi.mocked(startRelax).mockReturnValue(fakeRelaxer([], []).relaxer);

    act(() => run.start(base, { keepPlaced: false }));
    frame();

    expect(startRelax).toHaveBeenCalledTimes(1);
    expect(vi.mocked(startRelax).mock.calls[0]).toEqual([
      base,
      activePlacements(left),
      { keepPlaced: false, accepted: answers.accepted, refused: answers.refused },
    ]);
    expect(activePlacements(left)).not.toEqual(activePlacements(base));
    expect(run.advice?.forState).toBe(left);
    expect(run.advice?.searching).toBe(true);
    expect(run.advice?.answers).toBe(answers);
  });

  it('Durdur aramayı keser, bulduğunu tutar ve durduğunu söyler; sürdür bulunanı ilk tahmin yapar', () => {
    const { base } = stuckRun();
    const a = way('saat');
    const b = way('sinir');
    const first = fakeRelaxer([a], [a, b]);
    vi.mocked(startRelax).mockReturnValue(first.relaxer);

    act(() => run.start(base));
    frame(); // the run ends stuck, the search starts
    // Without a word from the reader, the search keeps what is placed.
    expect(vi.mocked(startRelax).mock.calls[0]![2].keepPlaced).toBe(true);
    frame(); // the search reports what it has so far
    expect(run.advice?.suggestions).toEqual([a]);

    act(() => run.stop());
    expect(first.cancel).toHaveBeenCalledTimes(1);
    expect(run.advice?.searching).toBe(false);
    expect(run.advice?.stopped).toBe(true);
    expect(run.advice?.suggestions).toEqual([a, b]);

    vi.mocked(startRelax).mockReturnValue(fakeRelaxer([], []).relaxer);
    act(() => run.resume());
    expect(startRelax).toHaveBeenCalledTimes(2);
    const options = vi.mocked(startRelax).mock.calls[1]![2];
    expect(options?.previous).toEqual([a, b]);
    expect(options?.startRelaid).toBe(false);
    expect(run.advice?.searching).toBe(true);
    expect(run.advice?.stopped).toBe(false);
  });

  it('öneri yalnız yapıldığı plana uygulanır: evetler veriye geçer, hayırlar kalır', () => {
    const { base, left } = stuckRun();
    const search = fakeRelaxer([], []);
    vi.mocked(startRelax).mockReturnValue(search.relaxer);
    act(() => run.start(base));
    frame();
    changes = [];

    const s = way('saat');
    act(() => run.apply(s));

    expect(search.cancel).toHaveBeenCalledTimes(1);
    expect(run.applied).toBe(s);
    expect(run.advice).toBeNull();
    expect(changes).toHaveLength(1);
    const write = changes[0]!;
    const answered = {
      ...left,
      answers: { accepted: [{ yes: 1 }], refused: [{ no: 1 }] },
    } as unknown as State;
    const after = write(answered);
    expect(after).not.toBe(answered);
    expect(after.answers).toEqual({ accepted: [], refused: [{ no: 1 }] });
    // A different timetable: the suggestion does not describe it.
    const other = { ...left, lessons: [...left.lessons] };
    expect(write(other)).toBe(other);
  });

  it('yeni bir hayır onu kullanan yolları düşürür, yeni bir evet hepsini', () => {
    const { base } = stuckRun();
    const a = way('saat', 'r1');
    const b = way('sinir', 'r2');
    vi.mocked(startRelax).mockReturnValue(fakeRelaxer([], [a, b]).relaxer);
    act(() => run.start(base));
    frame();
    act(() => run.stop());
    expect(run.advice?.suggestions).toEqual([a, b]);

    vi.mocked(startRelax).mockReturnValue(fakeRelaxer([], []).relaxer);
    const refusing = { accepted: [], refused: ['r1'] } as unknown as Answers;
    act(() => run.reconsider(refusing));
    expect(run.advice?.suggestions).toEqual([b]);
    expect(run.advice?.answers).toBe(refusing);
    const relaxCalls = vi.mocked(startRelax).mock.calls;
    const options = relaxCalls[relaxCalls.length - 1]![2];
    expect(options?.refused).toEqual(['r1']);
    expect(options?.previous).toEqual([a, b]);

    const accepting = { accepted: ['y1'], refused: ['r1'] } as unknown as Answers;
    act(() => run.reconsider(accepting));
    expect(run.advice?.suggestions).toEqual([]);

    const calls = vi.mocked(startRelax).mock.calls.length;
    act(() => run.reconsider(accepting));
    expect(vi.mocked(startRelax).mock.calls.length).toBe(calls);
  });
});
