/**
 * The "Geri al" of a deletion's notice (TODO SD1): undo, but only while the
 * state the deletion produced is still the present (`undo-if`, pure/undo). App
 * provides the store's `undoIf`; the rows that delete read it here, so a prop
 * does not have to travel through every list on the way.
 */
import { createContext, useContext } from 'react';
import type { State } from '../../leaf/model';

/** Answers whether it undid: `false` when another change came in between. */
const UndoIfContext = createContext<(expected: State) => boolean>(() => false);

export const UndoIfProvider = UndoIfContext.Provider;

export function useUndoIf(): (expected: State) => boolean {
  return useContext(UndoIfContext);
}
