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
import { recorded } from './relaxLog';

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

/** One worker's ways, and the way whose first week they wait for, if any. */
export interface Track {
  families: RelaxFamily[];
  /**
   * The hand-over ways start from the fewest-hours week (see `seed` in
   * relax.ts). On a line of their own they wait for it: the worker gets its
   * job when the line with that way sends its first week of it.
   */
  after?: RelaxFamily;
}

/**
 * Which ways go together on one worker, and with fewer cores the lines are
 * folded onto each other in this order. Each way finds as much alone as after
 * another (MEASURED 2026-09-24 on the father's data: 6, 4 and 8, the same as
 * in one line), so the three teacher-hour ways get a worker each; the ones that
 * rarely find anything share one.
 */
const TRACKS: Track[] = [
  { families: ['fewTeachers'] },
  { families: ['teacherHours'] },
  // The hand-over ways start from the fewest-hours week: from the stuck week
  // their first week opened some 300 hours and the search ended at one lesson
  // and 7 hours, from the fewest-hours week at one lesson and 3, CP-SAT's best
  // (MEASURED 2026-09-25 on the father's file). They used to follow it on its
  // line and made that line the slowest; now they wait for its first week.
  { families: ['handFew', 'handHours'], after: 'teacherHours' },
  { families: ['teacherDays'] },
  { families: ['mixed'] },
  { families: ['rules', 'blockShape', 'weeklyHours'] },
  { families: ['reassign'] },
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

/**
 * The tracks for `families`, folded onto `workers` lines, in search order.
 *
 * A waiting track whose way is not searched starts at once. With fewer workers
 * than tracks, a waiting track first goes back behind the line it waits for,
 * where it starts from that way's week as the next way on the line, and only
 * then are the lines folded.
 */
export function lines(families: readonly RelaxFamily[], workers: number): Track[] {
  const wanted = new Set(families);
  let tracks: Track[] = TRACKS.map((t) => ({
    families: t.families.filter((f) => wanted.has(f)),
    ...(t.after !== undefined && wanted.has(t.after) ? { after: t.after } : {}),
  })).filter((t) => t.families.length > 0);
  // A way the table does not name still gets searched, on a line of its own.
  const named = new Set(TRACKS.flatMap((t) => t.families));
  for (const f of families) if (!named.has(f)) tracks.push({ families: [f] });
  if (tracks.length > workers) {
    const waiting = tracks.filter((t) => t.after !== undefined);
    tracks = tracks.filter((t) => t.after === undefined);
    for (const w of waiting) {
      const source = tracks.find((t) => t.families.includes(w.after!))!;
      source.families.push(...w.families);
    }
  }
  const out: Track[] = Array.from({ length: Math.min(workers, tracks.length) }, () => ({
    families: [],
  }));
  tracks.forEach((t, i) => {
    const line = out[i % out.length]!;
    line.families.push(...t.families);
    if (t.after !== undefined) line.after = t.after;
  });
  return out;
}

const DEFAULT_FAMILIES: RelaxFamily[] = TRACKS.flatMap((t) => t.families);

/**
 * Starts the search and hands back a Relaxer, so the caller drives it the same
 * way whichever thread it runs on: `step` every frame until it returns a result.
 */
export function startRelax(
  base: State,
  hint: Readonly<Record<string, Id>>,
  options: Partial<RelaxOptions>,
): Relaxer {
  // Every search leaves a line in this machine's log (relaxLog.ts).
  return recorded(startOn(base, hint, options));
}

function startOn(
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
  /** Which workers have said they are alive, and which have their job. */
  const alive = plan.map(() => false);
  const sent = plan.map(() => false);
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
        alive[i] = true;
      } else if (m.type === 'progress') {
        progress[i] = m.progress;
      } else {
        results[i] = m.result;
        progress[i] = null;
      }
      release();
    };
    w.onerror = () => {
      // A worker that fails before it has started anything: the main thread
      // does it all. One that fails midway: its line is given up, the others go on.
      if (ready < workers.length && fallback === null) toMain();
      else {
        results[i] ??= { phase: 'done', suggestions: [], elapsedMs: 0 };
        release();
      }
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
    plan.flatMap((line, i) =>
      results[i] !== null ? line.families : (progress[i]?.finished ?? []),
    );

  const send = (i: number, seed: Suggestion[]) => {
    sent[i] = true;
    const job: RelaxJob = {
      base,
      hint: { ...hint },
      options: { ...options, families: plan[i]!.families, seed },
    };
    workers[i]!.postMessage(job);
  };
  /**
   * Gives every live worker without a job its job, once it can have it: a
   * waiting line when a week of the way it waits for has come from any line,
   * or when every line searching that way is over without one. After an
   * answer a waiting line starts at once if its first way has a week of its
   * own from the search before, since that week comes first (relax.ts).
   */
  const release = () => {
    plan.forEach((line, i) => {
      if (sent[i] || !alive[i]) return;
      const after = line.after;
      if (after === undefined || options.previous?.some((x) => x.family === line.families[0])) {
        send(i, []);
        return;
      }
      const week = found().find((x) => x.family === after);
      if (week !== undefined) send(i, [week]);
      else if (plan.every((l, j) => !l.families.includes(after) || results[j] !== null))
        send(i, []);
    });
  };
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
