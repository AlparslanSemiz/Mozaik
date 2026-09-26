// The worker end of relaxPool.ts: the page's own script, started where there is
// no document, answers one search and reports as it goes (TODO B5.10).
//
// The search runs in long slices here, since there is no frame to keep: the
// page can terminate the worker at any moment, which is how it is stopped.

import { createRelaxer } from '../pure/relax';
import type { Suggestion } from '../pure/relax';
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
    let sent: Suggestion[] = [];
    let finished = 0;
    for (;;) {
      const result = relaxer.step(SLICE_MS);
      if (result !== null) {
        scope.postMessage({ type: 'done', result });
        return;
      }
      const progress = relaxer.progress();
      // News only: a suggestion found, a better week for a way (it takes the
      // earlier one's place, so the count does not move), or a way over.
      // Counting alone left the page on a way's FIRST week, and a stopped
      // search offered that one (DENETIM DK5, P13).
      const news =
        progress.suggestions.length !== sent.length ||
        progress.suggestions.some((s, i) => s !== sent[i]);
      if (news || progress.finished.length !== finished) {
        sent = progress.suggestions;
        finished = progress.finished.length;
        scope.postMessage({ type: 'progress', progress });
      }
    }
  };
  scope.postMessage({ type: 'ready' });
}
