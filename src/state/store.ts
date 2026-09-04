// The undo/redo reducer, and nothing else.
//
// PURE: no React, no localStorage, no DOM. That is what lets the rule which
// matters most — undo must never carry one plan's move into another plan's
// file — be pinned in a unit test without mounting anything.
//
// Around it: useStore.ts wires it to React and to the autosave, planStorage.ts
// owns the keys, parseState.ts turns a file into a State.

import { sanitize } from '../constraints';
import type { Id, State } from '../types';

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

export function reduce(box: Box, action: Action): Box {
  switch (action.type) {
    case 'change':
      return recorded(box, action.apply(box.present));
    // A program boundary is also an undo boundary: an action created while
    // looking at one alternative must never be replayed into another.
    case 'program-change': {
      const next = sanitize(action.apply(box.present));
      return next === box.present ? box : { ...box, present: next, past: [], future: [] };
    }
    case 'undo':
      return stepBack(box);
    case 'redo':
      return stepForward(box);
    case 'load':
      return { ...box, present: sanitize(action.state), past: [], future: [] };
    // Switching plans clears the history on purpose: "undo" across a plan
    // boundary would put one plan's grid into another plan's file.
    case 'switch':
      return { present: sanitize(action.state), past: [], future: [], planId: action.id };
  }
}

/** An edit worth an undo step. An apply that changed nothing does not get one. */
function recorded(box: Box, next: State): Box {
  if (next === box.present) return box; // no real change -> do not pollute history
  return {
    ...box,
    present: next,
    past: [...box.past, box.present].slice(-HISTORY_LIMIT),
    future: [],
  };
}

function stepBack(box: Box): Box {
  const previous = box.past[box.past.length - 1];
  if (previous === undefined) return box;
  return {
    ...box,
    present: previous,
    past: box.past.slice(0, -1),
    future: [box.present, ...box.future],
  };
}

function stepForward(box: Box): Box {
  const next = box.future[0];
  if (next === undefined) return box;
  return {
    ...box,
    present: next,
    past: [...box.past, box.present],
    future: box.future.slice(1),
  };
}
