/**
 * The one way into this folder from outside it: the constraint engine and the
 * adjustable rules it consults. The engine is split by question since RF6
 * (TODO §8k): who is busy where (`occupancy.ts`), may a block go here
 * (`engine.ts`), reading blocks off the grid (`blocks.ts`), putting one down
 * and taking it back (`placing.ts`), what a drop does (`drop.ts`), hours closed
 * after placing (`closed.ts`), `sanitize` (`sanitize.ts`) and pinning a scope
 * (`pins.ts`). The rules are `rules.ts`. What this file opens is exactly what
 * `constraints.ts` exported before the split; helpers the files share stay in.
 */

// Re-exported so call sites keep importing keys from here.
export { closedKey, placementKey } from '../../leaf/model';
export { buildIndex, occupy, vacate, countPlacedHours, type Index } from './occupancy';
export { blockerDetail, blocker, check, type BlockCode, type Block, type Verdict } from './engine';
export { placedBlocks, blockSpans, pendingBlocks, type PlacedBlock } from './blocks';
export {
  blockAt,
  place,
  blockPinned,
  blockCells,
  setBlockPinned,
  liftBlock,
  removeBlock,
} from './placing';
export {
  swapDoneNotice,
  dropMap,
  evictionNotice,
  applyDrop,
  type DropVerdict,
  type BlockRef,
  type DropAction,
  type SwapResult,
  type DropRequest,
} from './drop';
export { closedConflicts, type ClosedConflict } from './closed';
export { sanitize } from './sanitize';
export { pinScopeCells, togglePinScope, type PinScope } from './pins';
export * from './rules';
