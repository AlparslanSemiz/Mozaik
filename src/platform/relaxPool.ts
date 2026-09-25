// The suggestion search (pure/relax.ts) on as many cores as the machine has,
// and on the main thread when it cannot (TODO B5.10).
//
// Why workers after all: the search is several independent ways, each tens of
// seconds of SAT on the father's data, and on the main thread they ran one
// after another in 10 ms slices, one frame in two. MEASURED (2026-09-24): a
// `blob:` worker made from the page's own script runs from `file://` in
// Chromium (5 of 5) and in the Linux exe's WebKitGTK, four of them truly in
// parallel. The 2026-08-25 note that ruled workers out (TRAPS 19) was about a
// worker as a SEPARATE chunk, which the single-file build cannot carry; this
// one is the same script, so nothing is added to the file.
//
// How: the built page has one inline module script, and it has no import or
// export in it (measured), so its text runs as a classic worker too. Its entry
// (ui/main.tsx) sees no `document` and answers messages instead of drawing.
// Every module above the entry was measured to load without a document.
//
// The fallback is the old path, unchanged: no inline script (the dev server),
// no Worker, or no answer from one within READY_MS, and the same relaxer runs
// here in slices. WebView2 on Windows could not be measured from this machine.

import { createRelaxer } from '../pure/relax';
import type {
  RelaxFamily,
  RelaxOptions,
  RelaxProgress,
  RelaxResult,
  Relaxer,
  Suggestion,
} from '../pure/relax';
import type { Id, State } from '../leaf/types';

/** What the page sends a worker: one search. */
export interface RelaxJob {
  base: State;
  hint: Record<string, Id>;
  options: Partial<RelaxOptions>;
}

/** What a worker sends back. */
export type RelaxMessage =
  | { type: 'ready' }
  | { type: 'progress'; progress: RelaxProgress }
  | { type: 'done'; result: RelaxResult };

/**
 * Which ways go together on one worker, and with fewer cores the lines are
 * folded onto each other in this order. Each way finds as much alone as after
 * another (MEASURED 2026-09-24 on the father's data: 6, 4 and 8, the same as
 * in one line), so the three teacher-hour ways get a worker each; the ones that
 * rarely find anything share one.
 */
const TRACKS: RelaxFamily[][] = [
  ['fewTeachers'],
  // The hand-over ways start from the fewest-hours week: from the stuck week
  // their first week opened some 300 hours and the search ended at one lesson
  // and 7 hours, from the fewest-hours week at one lesson and 3, CP-SAT's best
  // (MEASURED 2026-09-25 on the father's file).
  ['teacherHours', 'handFew', 'handHours'],
  ['teacherDays'],
  ['mixed'],
  ['rules', 'blockShape', 'weeklyHours'],
  ['reassign'],
];

/** How long a new worker has to say it is alive before the main thread takes over. */
const READY_MS = 5_000;

/**
 * How many workers answered, on `<html data-oneri-isci>`: 0 when the search
 * ran on the main thread. What the real-exe suite reads to tell the two paths
 * apart, since both give the same answers.
 */
function mark(workers: number): void {
  if (typeof document !== 'undefined')
    document.documentElement.dataset['oneriIsci'] = String(workers);
}

/** The page's own script, as text: present only in the built single file. */
function ownScript(): string | null {
  if (typeof document === 'undefined' || typeof Worker === 'undefined') return null;
  const script = document.querySelector('script[type="module"]:not([src])');
  const text = script?.textContent ?? '';
  return text.length > 0 ? text : null;
}

/** The tracks for `families`, folded onto `workers` lines, in search order. */
function lines(families: readonly RelaxFamily[], workers: number): RelaxFamily[][] {
  const wanted = new Set(families);
  const tracks = TRACKS.map((t) => t.filter((f) => wanted.has(f))).filter((t) => t.length > 0);
  // A way the table does not name still gets searched, on a line of its own.
  const named = new Set(TRACKS.flat());
  for (const f of families) if (!named.has(f)) tracks.push([f]);
  const out: RelaxFamily[][] = Array.from({ length: Math.min(workers, tracks.length) }, () => []);
  tracks.forEach((t, i) => out[i % out.length]!.push(...t));
  return out;
}

const DEFAULT_FAMILIES: RelaxFamily[] = TRACKS.flat();

/**
 * Starts the search and hands back a Relaxer, so the caller drives it the same
 * way whichever thread it runs on: `step` every frame until it returns a result.
 */
export function startRelax(
  base: State,
  hint: Readonly<Record<string, Id>>,
  options: Partial<RelaxOptions>,
): Relaxer {
  const onMain = () => {
    mark(0);
    return createRelaxer(base, hint, options);
  };
  const script = ownScript();
  if (script === null) return onMain();

  const families = options.families ?? DEFAULT_FAMILIES;
  const cores = typeof navigator === 'undefined' ? 2 : (navigator.hardwareConcurrency ?? 2);
  const plan = lines(families, Math.max(1, cores - 1));

  let url: string;
  const workers: Worker[] = [];
  try {
    url = URL.createObjectURL(new Blob([script], { type: 'text/javascript' }));
    for (let i = 0; i < plan.length; i++) workers.push(new Worker(url));
  } catch {
    for (const w of workers) w.terminate();
    return onMain();
  }

  const t0 = performance.now();
  const progress: Array<RelaxProgress | null> = plan.map(() => null);
  const results: Array<RelaxResult | null> = plan.map(() => null);
  let ready = 0;
  let fallback: Relaxer | null = null;
  let finished: RelaxResult | null = null;

  const stopAll = () => {
    for (const w of workers) w.terminate();
    URL.revokeObjectURL(url);
  };
  const toMain = () => {
    stopAll();
    fallback = onMain();
  };
  const timer = setTimeout(() => {
    if (ready < workers.length && fallback === null && finished === null) toMain();
  }, READY_MS);

  workers.forEach((w, i) => {
    w.onmessage = (e: MessageEvent<RelaxMessage>) => {
      const m = e.data;
      if (m.type === 'ready') {
        ready++;
        if (ready === workers.length) mark(ready);
        const job: RelaxJob = {
          base,
          hint: { ...hint },
          options: { ...options, families: plan[i]! },
        };
        w.postMessage(job);
      } else if (m.type === 'progress') {
        progress[i] = m.progress;
      } else {
        results[i] = m.result;
        progress[i] = null;
      }
    };
    w.onerror = () => {
      // A worker that fails before it has started anything: the main thread
      // does it all. One that fails midway: its line is given up, the others go on.
      if (ready < workers.length && fallback === null) toMain();
      else results[i] ??= { phase: 'done', suggestions: [], elapsedMs: 0 };
    };
  });

  const found = (): Suggestion[] => {
    const all: Suggestion[] = [];
    plan.forEach((_, i) =>
      all.push(...(results[i]?.suggestions ?? progress[i]?.suggestions ?? [])),
    );
    return all;
  };
  const finishedFamilies = (): RelaxFamily[] =>
    plan.flatMap((line, i) => (results[i] !== null ? line : (progress[i]?.finished ?? [])));
  const elapsed = () => performance.now() - t0;
  const settle = (phase: RelaxResult['phase']): RelaxResult => {
    clearTimeout(timer);
    stopAll();
    finished = { phase, suggestions: found(), elapsedMs: elapsed() };
    return finished;
  };

  return {
    step(sliceMs: number): RelaxResult | null {
      if (finished !== null) return finished;
      if (fallback !== null) return fallback.step(sliceMs);
      const all = found();
      // A week that needs no change is the answer to every way.
      if (all.some((s) => s.changes.length === 0)) return settle('done');
      if (results.every((r) => r !== null)) return settle('done');
      return null;
    },
    progress(): RelaxProgress {
      if (fallback !== null) return fallback.progress();
      const live = progress.find((p) => p !== null);
      return {
        family: live?.family ?? families[0] ?? 'teacherHours',
        stage: live?.stage ?? 'building',
        finished: finishedFamilies(),
        suggestions: found(),
        elapsedMs: elapsed(),
      };
    },
    cancel(): RelaxResult {
      if (finished !== null) return finished;
      if (fallback !== null) return fallback.cancel();
      return settle('cancelled');
    },
  };
}
