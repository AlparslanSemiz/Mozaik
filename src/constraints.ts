// The constraint engine, as ONE import path.
//
// PURE: knows nothing about React, DOM or localStorage. Business logic lives
// here, never inside components — and every exported function has a test.
//
// This file used to be 1443 lines and ~28 exports. It is now the path everyone
// already says, over one module per verb family:
//
//   placement.ts        the index, reading blocks off the grid, putting one down
//   blockerRules.ts     WHY a cell refuses, in a sentence, plus the soft rules
//   pinning.ts          the reader's own lock, and the bulk scopes
//   swap.ts             two placed blocks changing places
//   dropMapping.ts      what every cell would do: place · swap · evict
//   closedConflicts.ts  lessons sitting on an hour that was closed afterwards
//   sanitize.ts         the one home of every cascade
//
// The order above is the dependency order: each may import the ones above it
// and none of them imports this file back. `sanitize.ts` depends on none of
// them, which is why deleting things can never be circular.

export * from './blockerRules';
export * from './closedConflicts';
export * from './dropMapping';
export * from './pinning';
export * from './placement';
export * from './sanitize';
export * from './swap';

// Re-exported so call sites keep importing keys from here.
export { closedKey, placementKey, teacherKey } from './keys';
