/**
 * The one way into this folder from outside it: the constraint engine
 * (`constraints.ts`: the index, `blocker`, placing, dropping, `sanitize`) and
 * the adjustable rules it consults (`rules.ts`: the layered limits, gaps,
 * `findViolations`).
 */
export * from './constraints';
export * from './rules';
