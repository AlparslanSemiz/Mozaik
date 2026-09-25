// The worker end of relaxPool.ts: the page's own script, started where there is
// no document, answers one search and reports as it goes (TODO B5.10).
//
// The search runs in long slices here, since there is no frame to keep: the
// page can terminate the worker at any moment, which is how it is stopped.

import { createRelaxer } from '../pure/relax';
import type { RelaxJob, RelaxMessage } from './relaxPool';

/** A worker's slice: long, because only a message queue waits on it. */
const SLICE_MS = 200;

/** True where this script runs as a worker (no document to draw into). */
export function inWorker(): boolean {
  return typeof document === 'undefined' && typeof self !== 'undefined';
}

export function serveRelax(): void {
  const scope = self as unknown as {
    postMessage: (m: RelaxMessage) => void;
    onmessage: ((e: MessageEvent<RelaxJob>) => void) | null;
  };
  scope.onmessage = (e) => {
    const { base, hint, options } = e.data;
    const relaxer = createRelaxer(base, hint, options);
    let found = 0;
    let finished = 0;
    for (;;) {
      const result = relaxer.step(SLICE_MS);
      if (result !== null) {
        scope.postMessage({ type: 'done', result });
        return;
      }
      const progress = relaxer.progress();
      // News only: a suggestion found or a way over.
      if (progress.suggestions.length !== found || progress.finished.length !== finished) {
        found = progress.suggestions.length;
        finished = progress.finished.length;
        scope.postMessage({ type: 'progress', progress });
      }
    }
  };
  scope.postMessage({ type: 'ready' });
}
