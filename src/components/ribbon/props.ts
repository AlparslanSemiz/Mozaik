// What the strip is handed. One interface, and each tab `Pick`s the part it
// actually uses — so a file's import line says which of the app's controls that
// tab is allowed to touch.

import type { ProgramColorMode } from '../../programColor';
import type { ProgramMask } from '../../programMask';
import type { Density, Theme } from '../../theme';
import type { ToolState } from '../../toolState';
import type { State } from '../../types';
import type { SolverRun } from '../../useSolver';

export interface RibbonProps {
  ui: ToolState;
  /** Whether the strip is drawn at all. Owned by App: the button is up there. */
  open: boolean;
  state: State;
  /** Only the strip's own destructive action needs it: "Programı boşalt". */
  change: (fn: (d: State) => State) => void;
  /** Program boundaries deliberately clear undo/redo history. */
  manageProgram: (fn: (d: State) => State) => void;
  solver: SolverRun;
  programMask: ProgramMask;
  setProgramMask: (apply: (mask: ProgramMask) => ProgramMask) => void;
  density: Density;
  setDensity: (next: Density) => void;
  /** Müsaitlik's hour labels. A MACHINE preference, so App still owns it —
      only the control moved here, out of Ayarlar → Görünüm. */
  availClock: boolean;
  setAvailClock: (next: boolean) => void;
  /** Ayarlar → Görünüm's strip carries the theme; the top bar's button stays.
      Same state, two doors — that one is the shortcut, this is the section. */
  theme: Theme;
  setTheme: (next: Theme) => void;
  programColor: ProgramColorMode;
  setProgramColor: (next: ProgramColorMode) => void;
  changelogUnseen: boolean;
  /** Ayarlar → Planlar's strip STATES which plan is open. A name, not the
      library: everything that creates, renames and deletes stays in the panel. */
  planName: string;
}
