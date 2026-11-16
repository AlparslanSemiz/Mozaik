// The suggestion search (pure/relax/) on as many cores as the machine has,
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

import {
  CP_HINT_CONFLICTS,
  CP_PROOF_SUBSOLVERS,
  type CpAnswer,
  type CpRelaxer,
  cpNative,
  cpParams,
  createCpRelaxer,
  createRelaxer,
  readAnswer,
  type RelaxFamily,
  type RelaxOptions,
  type RelaxProgress,
  type RelaxResult,
  type Relaxer,
  type Suggestion,
} from '../../pure/relax';
import type { Id, State } from '../../leaf/model';
import { desktopCpsatCoz, desktopCpsatDurdur, desktopCpsatVar, isDesktop } from '../exe';
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
   * pure/relax/search.ts). On a line of their own they wait for it: the worker gets its
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
  if (CP_SECOND_LOOK && isDesktop())
    return cpsatOr(base, hint, options, (o) => onWorkers(base, hint, o));
  return onWorkers(base, hint, options);
}

/**
 * ON since CP-SAT has a model of its own (pure/relax/cpModel.ts, TODO B7.38).
 * MEASURED on the father's week (2026-11-15, this Mac, kirli: other sessions
 * running): after our search's 4 / 6 / 9, the second look proved all three in
 * every run, 3 seeds on 4 workers in 10-16 s and on 8 in 13-25 s. On model.ts's
 * formula it had proved one of them in 20 s at best (DECISIONS).
 */
const CP_SECOND_LOOK = true;

/**
 * CP-SAT's ceiling for one question on a machine with two cores or fewer, in
 * seconds. MEASURED 2026-11-16 (olcum-iki-cekirdek.yml, two CPUs, the father's
 * week): every proof came in under 8 s, and the three questions that ran out
 * their 20 s ended where they began (6, 8 and 6). The C API gives no word of a
 * new solution while it searches, so "stop when nothing better came for a
 * while" is this ceiling.
 */
const CP_FEW_CORES_SECONDS = 6;

/**
 * The exe with OR-Tools CP-SAT next to it (src-tauri/src/cpsat.rs).
 *
 * Until 2026-11-16 our search ran first, all ten ways, and CP-SAT then looked
 * again at the four it models (cpModel.ts: the three teacher-hour ways and the
 * rules). MEASURED on two CPUs (olcum-iki-cekirdek.yml, the father's week): the
 * whole search took 232 s, 154 of them ours before CP-SAT began, one way ran
 * 77 s with nothing new on screen, and CP-SAT then ended where our search had
 * (6, 4, 4, 9), proving only the 4.
 *
 * So now, with the library, in two steps, and in each of them CP-SAT and our
 * search side by side (`handOff`: each of our ways stays near its first week
 * and leaves the proof to CP-SAT):
 *   1. Ours, the three teacher-hour ways, on one formula: the fewest-hours way
 *      finds its 4 hours on the formula the few-teachers way leaves behind.
 *      CP-SAT meanwhile, the fewest hours from the stuck week: on cpModel.ts it
 *      found the 4 in 1-6 s on two workers, the first way on screen.
 *   2. CP-SAT the four ways it models, each from our week of it; ours, on its
 *      worker, the ways CP-SAT does not model, starting from the fewest-hours
 *      week (`seed`).
 * A way both looked for shows the smaller week, or as small and proven
 * ("Bundan küçük bir değişiklik yetmiyor"). Without the library the panel gets
 * today's search exactly; when it fails midway, our search looks for the ways
 * it had not answered.
 */
function cpsatOr(
  base: State,
  hint: Readonly<Record<string, Id>>,
  options: Partial<RelaxOptions>,
  run: (o: Partial<RelaxOptions>) => Relaxer,
): Relaxer {
  const t0 = performance.now();
  const all = options.families ?? DEFAULT_FAMILIES;
  const cpWays = all.filter(cpNative);
  const firstWays = all.filter(
    (f) => f === 'fewTeachers' || f === 'teacherHours' || f === 'teacherDays',
  );
  const firstCp = all.filter((f) => f === 'teacherHours');
  const restWays = all.filter((f) => !cpNative(f));
  // At least two: on one worker CP-SAT ignores `subsolvers` and runs its
  // single-thread default, which never gave the proof. On Windows the exe
  // lowers its own priority while it solves (cpsat.rs), so the window stays
  // usable on a weak machine whose every core this occupies.
  const workers = Math.max(
    2,
    typeof navigator === 'undefined' ? 4 : (navigator.hardwareConcurrency ?? 4),
  );

  let cancelled = false;
  /** Today's search, when there is no library. */
  let plain: Relaxer | null = null;
  /** Our searches, in order: step 1, step 2, and the ways CP-SAT failed to answer. */
  const ours: Array<{ relaxer: Relaxer; ways: RelaxFamily[]; done: RelaxResult | null }> = [];
  /** The CP-SAT relaxer asking now, what the finished ones found, and where it is. */
  let cp: CpRelaxer | null = null;
  const cpFound: Suggestion[] = [];
  const cpSettled = new Set<RelaxFamily>();
  let cpRejected = 0;
  /** Step 1's CP-SAT part is over; step 2 has started; step 2's CP-SAT part is over. */
  let firstCpDone = false;
  let secondStarted = false;
  let cpDone = false;
  let cpBroken = false;
  /** The question CP-SAT is answering: when it was asked and its limit, for the bar. */
  let asking: { at: number; seconds: number } | null = null;
  let finished: RelaxResult | null = null;

  const start = (o: Partial<RelaxOptions>, ways: RelaxFamily[]) => {
    if (ways.length === 0) return null;
    const line = { relaxer: run({ ...o, handOff: true, families: ways }), ways, done: null };
    ours.push(line);
    return line;
  };
  /** Step 1's own search: null when it has no ways. */
  let firstOurs: ReturnType<typeof start> = null;

  /** One CP-SAT relaxer's questions, to the end; what it found goes to `cpFound`. */
  const chain = async (families: RelaxFamily[], from: Partial<RelaxOptions>) => {
    if (families.length === 0 || cpBroken) return;
    const me = createCpRelaxer(base, hint, { ...options, ...from, families });
    cp = me;
    let reply: CpAnswer | undefined;
    try {
      for (;;) {
        const step = me.next(reply);
        if ('done' in step) {
          cpFound.push(...step.done.suggestions);
          cpRejected += step.done.rejected;
          return;
        }
        // Two workers or fewer: a shorter look (CP_FEW_CORES_SECONDS), and
        // the whole one only when the short one came back with no week at all.
        const ask = async (seconds: number) => {
          asking = { at: performance.now(), seconds };
          return readAnswer(
            await desktopCpsatCoz(
              cpParams({
                workers,
                seconds,
                hintConflicts: CP_HINT_CONFLICTS,
                subsolvers: CP_PROOF_SUBSOLVERS,
              }),
              step.ask.bytes,
            ),
          );
        };
        const short = workers <= 2 && step.ask.seconds > CP_FEW_CORES_SECONDS;
        reply = await ask(short ? CP_FEW_CORES_SECONDS : step.ask.seconds);
        if (short && reply.status === 'unknown' && !cancelled) reply = await ask(step.ask.seconds);
        // Cancelled while the library answered: `cancel` already returned what was found.
        if (cancelled) return;
      }
    } catch {
      // The library failed: what this relaxer found is kept, CP-SAT is not asked again.
      cpFound.push(...me.progress().suggestions);
      cpBroken = true;
    } finally {
      for (const f of families) cpSettled.add(f);
      cp = null;
    }
  };

  void desktopCpsatVar().then(
    (ok) => {
      if (cancelled) return;
      if (!ok) {
        plain = run(options);
        return;
      }
      if (typeof document !== 'undefined') document.documentElement.dataset['oneriMotor'] = 'cpsat';
      firstOurs = start(options, firstWays);
      void chain(firstCp, {}).then(() => {
        firstCpDone = true;
      });
    },
    () => {
      if (!cancelled) plain = run(options);
    },
  );

  /** A way found twice (ours and CP-SAT's): the smaller, or as small and proven. */
  const better = (a: Suggestion, b: Suggestion) =>
    b.size < a.size || (b.size === a.size && b.proven && !a.proven) ? b : a;
  const found = (): Suggestion[] => {
    const out: Suggestion[] = [];
    const add = (s: Suggestion) => {
      const at = out.findIndex((x) => x.family === s.family && x.relaid === s.relaid);
      if (at < 0) out.push(s);
      else out[at] = better(out[at]!, s);
    };
    for (const o of ours) (o.done ?? o.relaxer.progress()).suggestions.forEach(add);
    cpFound.forEach(add);
    cp?.progress().suggestions.forEach(add);
    return out;
  };
  const result = (phase: RelaxResult['phase']): RelaxResult => ({
    phase,
    suggestions: found(),
    elapsedMs: performance.now() - t0,
    rejected: cpRejected + ours.reduce((n, o) => n + (o.done?.rejected ?? 0), 0),
  });

  /** Both halves of step 1 are over: step 2, unless a week needs no change at all. */
  const second = () => {
    secondStarted = true;
    const so = found();
    if (so.some((s) => s.changes.length === 0)) {
      cpDone = true;
      return;
    }
    const fewest = so.filter((s) => s.family === 'teacherHours');
    const from: Partial<RelaxOptions> = {
      seed: fewest,
      startRelaid: so.some((s) => s.relaid),
    };
    // Not `previous` for ours: that is the search after a refusal, with wider
    // neighbourhoods. CP-SAT starts each way from our week of it, and does not
    // ask again for a fewest-hours week it has proven.
    start({ ...options, ...from }, restWays);
    const proven = new Set(cpFound.filter((s) => s.proven).map((s) => s.family));
    void chain(
      cpWays.filter((f) => !proven.has(f)),
      { ...from, previous: so },
    ).then(() => {
      // The library failed: our search looks for the ways it had not answered.
      const missing = cpWays.filter((f) => !found().some((s) => s.family === f));
      if (cpBroken && !cancelled) start({ ...options, ...from }, missing);
      cpDone = true;
    });
  };

  return {
    step(sliceMs: number): RelaxResult | null {
      if (finished !== null) return finished;
      if (plain !== null) {
        finished = plain.step(sliceMs);
        return finished;
      }
      const live = ours.find((o) => o.done === null);
      if (live !== undefined) live.done = live.relaxer.step(sliceMs);
      if (!secondStarted && firstCpDone && (firstOurs === null || firstOurs.done !== null))
        second();
      if (cpDone && ours.every((o) => o.done !== null)) finished = result('done');
      return finished;
    },
    progress(): RelaxProgress {
      const elapsedMs = performance.now() - t0;
      if (plain !== null) return { ...plain.progress(), elapsedMs };
      const live = ours.find((o) => o.done === null);
      const mine = live?.relaxer.progress() ?? null;
      const theirs = cp?.progress() ?? null;
      // A way CP-SAT looks at is settled when it is done with it; the others
      // when our search is.
      const settled = new Set<RelaxFamily>();
      for (const o of ours)
        for (const f of o.done !== null ? o.ways : (mine?.finished ?? []))
          if (!cpNative(f) || cpBroken) settled.add(f);
      for (const f of cpSettled) if (secondStarted) settled.add(f);
      for (const f of theirs?.finished ?? []) if (secondStarted) settled.add(f);
      const share =
        mine?.share ??
        (asking === null
          ? 0
          : Math.min(1, (performance.now() - asking.at) / (asking.seconds * 1000)));
      return {
        family: mine?.family ?? theirs?.family ?? all[0] ?? 'teacherHours',
        stage: mine?.stage ?? theirs?.stage ?? 'building',
        finished: all.filter((f) => settled.has(f)),
        suggestions: found(),
        elapsedMs,
        share,
        steps: { done: settled.size, total: all.length },
      };
    },
    cancel(): RelaxResult {
      if (finished !== null) return finished;
      cancelled = true;
      if (plain !== null) {
        finished = plain.cancel();
        return finished;
      }
      void desktopCpsatDurdur();
      for (const o of ours) o.done ??= o.relaxer.cancel();
      finished = result('cancelled');
      return finished;
    },
  };
}

function onWorkers(
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
        results[i] ??= { phase: 'done', suggestions: [], elapsedMs: 0, rejected: 0 };
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
      options: {
        ...options,
        families: plan[i]!.families,
        seed: [...(options.seed ?? []), ...seed],
      },
    };
    workers[i]!.postMessage(job);
  };
  /**
   * Gives every live worker without a job its job, once it can have it: a
   * waiting line when a week of the way it waits for has come from any line,
   * or when every line searching that way is over without one. After an
   * answer a waiting line starts at once if its first way has a week of its
   * own from the search before, since that week comes first (pure/relax/search.ts).
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
    // A line stopped before its answer has not said how many it turned down.
    const rejected = results.reduce((n, r) => n + (r?.rejected ?? 0), 0);
    finished = { phase, suggestions: found(), elapsedMs: elapsed(), rejected };
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
        ...(live?.share === undefined ? {} : { share: live.share }),
        steps: { done: finishedFamilies().length, total: families.length },
      };
    },
    cancel(): RelaxResult {
      if (finished !== null) return finished;
      if (fallback !== null) return fallback.cancel();
      return settle('cancelled');
    },
  };
}
