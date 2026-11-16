// A MEASUREMENT, not a test: how long "Otomatik diz" and the suggestion search
// take on the father's kind of machine (two cores), on the sample school and
// on the father's week. Skipped unless MOZAIK_OLCUM_DLL names an OR-Tools
// library; the workflow olcum-iki-cekirdek.yml runs it on Windows, once under
// a two-CPU affinity and once without, and scripts/olcum/tablo.mjs puts the
// two side by side. Nothing here is asserted beyond "it ran".
//
// The path is the app's own: `createSolver` sliced as useSolver slices it, then
// `startRelax` (relaxPool.ts) with the exe bridge replaced by one process per
// CP-SAT question (scripts/olcum/cpsat-soru.py, the same C API and DLL as
// cpsat.rs). With no document there are no workers, so our own search runs on
// one thread: on a two-core machine the pool gives it one worker (cores - 1),
// so that is the two-core case; the unrestricted run is slower here than the
// app would be on that runner.
//
//   MOZAIK_OLCUM_DLL     ortools.dll (or libortools.9.dylib)
//   MOZAIK_OLCUM_CIKTI   where the JSON goes
//   MOZAIK_OLCUM_CEKIRDEK  navigator.hardwareConcurrency to pretend (2); empty: the real one
//   MOZAIK_OLCUM_MASK    affinity the CP-SAT process sets on itself (Windows)
//   MOZAIK_OLCUM_PYTHON  python to run (default `python`)

import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { parseState, sampleState } from '../../pure/io';
import { createSolver, type SolverOptions } from '../../pure/solver';
import { activePlacements } from '../../pure/grid';
import { readAnswer, type RelaxProgress } from '../../pure/relax';
import type { State } from '../../leaf/model';
import { startRelax } from './relaxPool';

const DLL = process.env['MOZAIK_OLCUM_DLL'] ?? '';
const PYTHON = process.env['MOZAIK_OLCUM_PYTHON'] || 'python';
const CEKIRDEK = Number(process.env['MOZAIK_OLCUM_CEKIRDEK'] || 0);

interface Soru {
  /** When it was asked, from the search's start. */
  atMs: number;
  limitS: number;
  workers: number;
  wallS: number;
  /** From CP-SAT's log: the first "#1" line, and the last solution's objective. */
  firstS: number | null;
  firstObjective: number | null;
  bestObjective: number | null;
  status: string;
  objective: number;
  peakMb: number;
  loadedMb: number;
  affinity: unknown;
}

const hook = vi.hoisted(() => ({
  ask: null as null | ((params: Uint8Array, model: Uint8Array) => Promise<Uint8Array>),
}));

vi.mock('../exe', async (original) => ({
  ...(await original<typeof import('../exe')>()),
  isDesktop: () => true,
  desktopCpsatVar: () => Promise.resolve(true),
  desktopCpsatCoz: (params: Uint8Array, model: Uint8Array) => hook.ask!(params, model),
  desktopCpsatDurdur: () => Promise.resolve(),
}));

/** max_time_in_seconds (36, double) and num_workers (206) out of cpParams' bytes. */
function readParams(bytes: Uint8Array): { limitS: number; workers: number } {
  let at = 0;
  let limitS = 0;
  let workers = 0;
  const varint = () => {
    let v = 0;
    let shift = 1;
    for (;;) {
      const b = bytes[at++]!;
      v += (b & 0x7f) * shift;
      if ((b & 0x80) === 0) return v;
      shift *= 128;
    }
  };
  while (at < bytes.length) {
    const key = varint();
    const field = Math.floor(key / 8);
    const wire = key % 8;
    if (wire === 0) {
      const v = varint();
      if (field === 206) workers = v;
    } else if (wire === 1) {
      if (field === 36)
        limitS = new DataView(bytes.buffer, bytes.byteOffset + at, 8).getFloat64(0, true);
      at += 8;
    } else if (wire === 2) {
      at += varint();
    } else at += 4;
  }
  return { limitS, workers };
}

/** "#1   0.12s best:7 ..." / "#Done ..." lines of CP-SAT's log. */
function readLog(log: string): {
  firstS: number | null;
  first: number | null;
  best: number | null;
} {
  const unit: Record<string, number> = { ms: 0.001, s: 1, m: 60, h: 3600 };
  let firstS: number | null = null;
  let first: number | null = null;
  let best: number | null = null;
  for (const line of log.split(/\r?\n/)) {
    const m = /^#(\d+)\s+([\d.]+)(ms|s|m|h)\b(?:.*?\bbest:(-?[\d.e+]+))?/.exec(line.trim());
    if (m === null) continue;
    const objective = m[4] === undefined ? null : Number(m[4]);
    if (firstS === null) {
      firstS = Number(m[2]) * unit[m[3]!]!;
      first = objective;
    }
    best = objective;
  }
  return { firstS, first, best };
}

function kurs(): State {
  const raw = readFileSync(join(import.meta.dirname, '../../fixtures/tam-dolu-kurs.json'), 'utf8');
  const state = parseState(raw);
  if (state === null) throw new Error('tam-dolu-kurs.json okunamadı');
  return state;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const mb = (kb: number) => Math.round(kb / 102.4) / 10;

/** "Otomatik diz" from nothing, in useSolver's 10 ms slices. */
async function layout(d: State, options: Partial<SolverOptions>) {
  const t0 = performance.now();
  const solver = createSolver(d, options);
  for (;;) {
    const r = solver.step(10);
    if (r !== null) {
      return {
        wallMs: Math.round(performance.now() - t0),
        phase: r.phase,
        placed: r.placedBlocks,
        total: r.totalBlocks,
        stuck: r.stuck.length,
        state: r.state,
      };
    }
    await tick();
  }
}

/** The suggestion search after a stuck run, as useSolver starts it. */
async function suggest(from: State, stuck: State, sorular: Soru[], errors: string[]) {
  let cpStartMs: number | null = null;
  const t0 = performance.now();
  /** One process per question, not waited for: our search goes on beside it, as in the exe. */
  const run = (dir: string) =>
    new Promise<{ status: number | null; out: string; err: string }>((resolve) => {
      const child = spawn(PYTHON, [
        join(import.meta.dirname, '../../../scripts/olcum/cpsat-soru.py'),
        DLL,
        dir,
      ]);
      let out = '';
      let err = '';
      child.stdout.on('data', (b: Buffer) => (out += b.toString()));
      child.stderr.on('data', (b: Buffer) => (err += b.toString()));
      child.on('error', (e) => resolve({ status: -1, out, err: err + String(e) }));
      child.on('close', (status) => resolve({ status, out, err }));
    });
  hook.ask = async (params, model) => {
    const atMs = Math.round(performance.now() - t0);
    if (cpStartMs === null) cpStartMs = atMs;
    const dir = mkdtempSync(join(tmpdir(), 'olcum-'));
    writeFileSync(join(dir, 'params.bin'), params);
    writeFileSync(join(dir, 'model.bin'), model);
    const { status, out, err } = await run(dir);
    const line = out.split(/\r?\n/).find((l) => l.startsWith('OLCUM '));
    if (status !== 0 || line === undefined) {
      // relaxPool swallows a failed question, so the failure is written down here or nowhere.
      const why = `cpsat-soru.py: ${status} ${err} ${out.slice(-2000)}`;
      errors.push(why);
      throw new Error(why);
    }
    const own = JSON.parse(line.slice(6)) as {
      wallS: number;
      peakMb: number;
      loadedMb: number;
      affinity: unknown;
    };
    const answer = new Uint8Array(readFileSync(join(dir, 'answer.bin')));
    const read = readAnswer(answer);
    const logged = readLog(out);
    sorular.push({
      atMs,
      ...readParams(params),
      wallS: own.wallS,
      firstS: logged.firstS,
      firstObjective: logged.first,
      bestObjective: logged.best,
      status: read.status,
      objective: read.objective,
      peakMb: own.peakMb,
      loadedMb: own.loadedMb,
      affinity: own.affinity,
    });
    return answer;
  };

  const relaxer = startRelax(from, activePlacements(stuck), { keepPlaced: false });
  let firstSuggestionMs: number | null = null;
  /** Two clocks of silence: nothing new at all on screen (text or bar), and no new or smaller way. */
  const quiet = { seen: '', last: 0, longest: 0 };
  const news = { seen: '', last: 0, longest: 0 };
  const arrivals: Array<{ family: string; size: number; proven: boolean; atMs: number }> = [];
  const mark = (c: typeof quiet, sig: string, now: number) => {
    if (sig === c.seen) return;
    c.longest = Math.max(c.longest, now - c.last);
    c.last = now;
    c.seen = sig;
  };
  const look = (p: RelaxProgress) => {
    const now = performance.now() - t0;
    const ways = p.suggestions.map((s) => [s.family, s.size, s.proven]);
    const total = p.steps?.total ?? 10;
    const bar = Math.floor((100 * ((p.steps?.done ?? p.finished.length) + (p.share ?? 0))) / total);
    mark(quiet, JSON.stringify([p.family, p.steps, bar, ways]), now);
    mark(news, JSON.stringify(ways), now);
    for (const s of p.suggestions) {
      const was = [...arrivals].reverse().find((a) => a.family === s.family);
      if (was === undefined || was.size !== s.size || was.proven !== s.proven)
        arrivals.push({ family: s.family, size: s.size, proven: s.proven, atMs: Math.round(now) });
    }
    if (firstSuggestionMs === null && p.suggestions.length > 0) firstSuggestionMs = now;
  };
  for (;;) {
    const r = relaxer.step(10);
    look(relaxer.progress());
    if (r !== null) {
      const now = performance.now() - t0;
      quiet.longest = Math.max(quiet.longest, now - quiet.last);
      news.longest = Math.max(news.longest, now - news.last);
      return {
        wallMs: Math.round(now),
        firstSuggestionMs: firstSuggestionMs === null ? null : Math.round(firstSuggestionMs),
        cpStartMs: cpStartMs === null ? null : Math.round(cpStartMs),
        longestQuietMs: Math.round(quiet.longest),
        longestNoNewsMs: Math.round(news.longest),
        arrivals,
        suggestions: r.suggestions.map((s) => ({
          family: s.family,
          size: s.size,
          proven: s.proven,
        })),
      };
    }
    await tick();
  }
}

describe.skipIf(DLL === '')('ölçüm — iki çekirdek', () => {
  it('örnek okul ve babanın haftası: diz, iyileştir, öner', async () => {
    const realCores = typeof navigator === 'undefined' ? 0 : navigator.hardwareConcurrency;
    if (CEKIRDEK > 0)
      vi.stubGlobal('navigator', { hardwareConcurrency: CEKIRDEK, userAgent: 'olcum' });
    const startRssMb = mb(process.resourceUsage().maxRSS);
    const schools = [];
    for (const [name, d] of [
      ['örnek okul', sampleState()],
      ['babanın haftası', kurs()],
    ] as const) {
      const sorular: Soru[] = [];
      const errors: string[] = [];
      const plain = await layout(d, { keepPlaced: false, improve: false });
      const full = await layout(d, { keepPlaced: false });
      const search = full.phase === 'stuck' ? await suggest(d, full.state, sorular, errors) : null;
      const { state: _a, ...plainOut } = plain;
      const { state: _b, ...fullOut } = full;
      schools.push({ name, layoutNoImprove: plainOut, layout: fullOut, search, sorular, errors });
      console.log(`[ölçüm] ${name}: ${JSON.stringify(schools[schools.length - 1])}`);
    }
    vi.unstubAllGlobals();
    const out = {
      cores: {
        pretended: CEKIRDEK,
        navigator: realCores,
        availableParallelism: availableParallelism(),
        mask: process.env['MOZAIK_OLCUM_MASK'] ?? '',
      },
      node: { startRssMb, peakRssMb: mb(process.resourceUsage().maxRSS) },
      schools,
    };
    const file = process.env['MOZAIK_OLCUM_CIKTI'];
    if (file) writeFileSync(file, JSON.stringify(out, null, 2));
    expect(schools).toHaveLength(2);
  }, 1_800_000);
});
