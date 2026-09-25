// How the suggestion search ran on this machine, kept for the father's file
// (TODO B5.11). His Windows machine (WebView2) could not be measured from the
// development machine: whether the workers open there, and how long a search
// takes, is only known once he runs one. So every search leaves a line here,
// the last twenty are kept, Hakkında shows the newest, and every bundle file
// (the daily backup, "Tümünü dosyaya kaydet") carries them (bundle.ts).
//
// A machine preference, not the plan's data: it is about this computer.

import { preference } from '../leaf/preference';
import { RELAX_LOG_KEY } from '../leaf/preferenceKeys';
import { safely } from '../leaf/storage';
import { SURUM } from '../leaf/version';
import type { Relaxer } from '../pure/relax';
import { isDesktop } from './desktop';

export interface SearchRecord {
  /** When it ended, ISO. */
  at: string;
  version: string;
  /** exe · file · kurulum · site: which of the four delivery routes. */
  route: string;
  /** Workers that answered; 0 means the main thread did it all (the slow way). */
  workers: number;
  cores: number;
  /** From the start to the first way on screen; null when none came. */
  firstMs: number | null;
  doneMs: number;
  phase: 'done' | 'cancelled';
  /** Each way found, and how big its change is. */
  found: Array<{ family: string; size: number }>;
  userAgent: string;
}

const KEEP = 20;

const log = preference<SearchRecord[]>({
  key: RELAX_LOG_KEY,
  normalize: (raw) => {
    const value = typeof raw === 'string' ? safely(() => JSON.parse(raw) as unknown) : raw;
    return Array.isArray(value) ? (value as SearchRecord[]).slice(-KEEP) : [];
  },
  fallback: () => [],
  encode: (value) => JSON.stringify(value),
});

/** The searches recorded on this machine, oldest first. */
export function searchLog(): SearchRecord[] {
  return log.read();
}

function route(): string {
  if (isDesktop()) return 'exe';
  if (safely(() => location.protocol) === 'file:') return 'file';
  return safely(() => location.hostname)?.endsWith('.localhost') === true ? 'kurulum' : 'site';
}

/**
 * The same search, recorded when it ends. `workers` is read then: the pool
 * writes how many answered on `<html data-oneri-isci>`.
 */
export function recorded(inner: Relaxer): Relaxer {
  const t0 = performance.now();
  let first: number | null = null;
  let written = false;
  const write = (phase: SearchRecord['phase']) => {
    if (written) return;
    written = true;
    const found = inner.progress().suggestions;
    const workers = Number(safely(() => document.documentElement.dataset['oneriIsci']) ?? '0');
    log.write([
      ...log.read(),
      {
        at: new Date().toISOString(),
        version: SURUM.version,
        route: route(),
        workers: Number.isFinite(workers) ? workers : 0,
        cores: typeof navigator === 'undefined' ? 0 : (navigator.hardwareConcurrency ?? 0),
        firstMs: first === null ? null : Math.round(first),
        doneMs: Math.round(performance.now() - t0),
        phase,
        found: found.map((s) => ({ family: s.family, size: s.size })),
        userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
      },
    ]);
  };
  return {
    step(sliceMs) {
      const result = inner.step(sliceMs);
      if (first === null && inner.progress().suggestions.length > 0) first = performance.now() - t0;
      if (result !== null) write(result.phase);
      return result;
    },
    progress: () => inner.progress(),
    cancel() {
      const result = inner.cancel();
      write('cancelled');
      return result;
    },
  };
}
