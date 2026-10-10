/**
 * The one way into this folder from outside it: the solver and the suggestion
 * search as React drives them, the worker's entry, and the search's log.
 *
 * The pool that spreads a search over workers (`relaxPool.ts`) is not here:
 * only `useSolver` starts one, and nothing outside this folder hands it a job.
 */
export { samePlan, useSolver, type Advice, type SolverRun } from './useSolver';
export { inWorker, serveRelax } from './relaxWorker';
export { searchLog } from './relaxLog';
