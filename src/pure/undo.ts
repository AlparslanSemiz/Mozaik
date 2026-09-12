// The undo stack: a box, an action, the next box.
//
// Pure, and split out of `store.ts` for that reason — it takes a value and
// returns a value, so it can be reasoned about and tested without a browser,
// a document or React. The hook that drives it lives in `platform/useStore.ts`
// and is the only caller.
//
// The word "box" rather than "state": what moves through here is the present
// timetable PLUS the two stacks and the id of the plan they belong to, and
// keeping the plan id in the same value is a safety rule rather than tidiness
// (the comment on the field says why).

import { sanitize } from './constraints';
import type { Id, State } from '../leaf/types';

const HISTORY_LIMIT = 30;

export interface Box {
  present: State;
  past: State[];
  future: State[];
  /** Which plan `present` belongs to. Kept HERE so that a switch changes the
      timetable and its key in one step: an auto-save that saw them disagree for
      even one render would write one plan's work into another plan's key. */
  planId: Id;
}

export type Action =
  | { type: 'change'; apply: (d: State) => State }
  | { type: 'program-change'; apply: (d: State) => State }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'load'; state: State }
  | { type: 'switch'; id: Id; state: State };

/** Exported so the undo/redo rules can be tested without mounting React. */
export function reduce(box: Box, action: Action): Box {
  switch (action.type) {
    case 'change': {
      const next = action.apply(box.present);
      if (next === box.present) return box; // no real change -> do not pollute history
      return {
        ...box,
        present: next,
        past: [...box.past, box.present].slice(-HISTORY_LIMIT),
        future: [],
      };
    }
    // A program boundary is also an undo boundary: an action created while
    // looking at one alternative must never be replayed into another.
    case 'program-change': {
      const next = sanitize(action.apply(box.present));
      if (next === box.present) return box;
      return { ...box, present: next, past: [], future: [] };
    }
    case 'undo': {
      const previous = box.past[box.past.length - 1];
      if (previous === undefined) return box;
      return {
        ...box,
        present: previous,
        past: box.past.slice(0, -1),
        future: [box.present, ...box.future],
      };
    }
    case 'redo': {
      const next = box.future[0];
      if (next === undefined) return box;
      return {
        ...box,
        present: next,
        past: [...box.past, box.present],
        future: box.future.slice(1),
      };
    }
    case 'load':
      return { ...box, present: sanitize(action.state), past: [], future: [] };
    // Switching plans clears the history on purpose: "undo" across a plan
    // boundary would put one plan's grid into another plan's file.
    case 'switch':
      return { present: sanitize(action.state), past: [], future: [], planId: action.id };
  }
}
