// The worker end of the suggestion search, with the search itself replaced.
//
// DENETIM DK5 and P13: a stopped search offered its FIRST, unrefined week for a
// way, although a better one had been found. A way's week is replaced in place
// when a better one comes (relax.ts), the list keeps its length, and the worker
// only posted when the length or the finished ways changed. The page's copy
// stayed on the first week, and stopping returned that copy.

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RelaxProgress, RelaxResult, Suggestion } from './pure/relax';
import type { RelaxMessage } from './platform/relaxPool';

const script: Array<RelaxProgress | RelaxResult> = [];

vi.mock('./pure/relax', () => ({
  createRelaxer: () => {
    let at = 0;
    let now: RelaxProgress | null = null;
    return {
      step: () => {
        const next = script[at++]!;
        if ('phase' in next) return next;
        now = next;
        return null;
      },
      progress: () => now!,
      cancel: () => ({
        phase: 'cancelled',
        suggestions: now?.suggestions ?? [],
        elapsedMs: 0,
        rejected: 0,
      }),
    };
  },
}));

const week = (size: number) => ({ family: 'teacherHours', size }) as unknown as Suggestion;
const progress = (suggestions: Suggestion[]): RelaxProgress => ({
  family: 'teacherHours',
  stage: 'building',
  finished: [],
  suggestions,
  elapsedMs: 0,
});

afterEach(() => {
  vi.unstubAllGlobals();
  script.length = 0;
});

describe('relaxWorker', () => {
  it('bir yolun yerinde incelen haftası da sayfaya gidiyor', async () => {
    const first = week(8);
    const better = week(5);
    script.push(progress([first]), progress([better]), {
      phase: 'done',
      suggestions: [better],
      elapsedMs: 0,
      rejected: 0,
    });

    const posted: RelaxMessage[] = [];
    const scope: {
      postMessage: (m: RelaxMessage) => void;
      onmessage: ((e: unknown) => void) | null;
    } = { postMessage: (m) => posted.push(m), onmessage: null };
    vi.stubGlobal('self', scope);
    const { serveRelax } = await import('./platform/relaxWorker');
    serveRelax();
    scope.onmessage!({ data: { base: {}, hint: {}, options: {} } });

    const weeks = posted.flatMap((m) => (m.type === 'progress' ? m.progress.suggestions : []));
    // The page is the only one who can stop the search, and what it holds
    // when it does is the last week that was posted.
    expect(weeks[weeks.length - 1]).toBe(better);
  });
});
