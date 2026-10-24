/**
 * The one way into this folder from outside it: the machine preferences'
 * plumbing. The factory that reads, normalises, stores and writes a preference
 * onto <html> (`preference.ts`), every preference's localStorage key and its
 * name in the "Veriler nerede" table (`preferenceKeys.ts`), and the one guard
 * around localStorage (`storage.ts`).
 */
export * from './preference';
export * from './preferenceKeys';
export * from './storage';
