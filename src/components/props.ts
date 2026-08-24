import type { State } from '../types';

/**
 * Every setup step and every settings section gets the same two things and
 * nothing else: the state to draw and one way to change it.
 */
export interface PanelProps {
  state: State;
  change: (apply: (d: State) => State) => void;
}
