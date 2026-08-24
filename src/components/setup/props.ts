import type { State } from '../../types';

/** Every setup step gets the same two things and nothing else. */
export interface SetupProps {
  state: State;
  change: (apply: (d: State) => State) => void;
}
