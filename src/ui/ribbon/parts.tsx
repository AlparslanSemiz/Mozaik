// What every strip is made of, and what the strip functions are handed.
//
// The strips are FUNCTIONS of a `StripContext`, called by `index.tsx`, and not
// components: `index.tsx` keeps returning one `<div className="ribbon">` from
// one component, so React reuses that element and its buttons when the tab
// changes, exactly as it did when the seven strips were seven `if` branches of
// one function. A component per strip would remount the row on every tab
// change. The strips call no hooks for the same reason; `index.tsx` calls them
// and hands the results down.

import type React from 'react';
import type { State } from '../../leaf/model';
import type { SolverRun } from '../../platform/search';
import type { Density, ProgramColorMode, Theme, ToolState } from '../../platform/prefs';
import type { ProgramMask } from '../../pure/program';
import type { health } from '../../pure/feasibility';
import type { useDialogs } from '../Dialogs';
import { useT } from '../T';

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

/** Everything a strip draws from: the ribbon's props and what `index.tsx` computed. */
export interface StripContext extends RibbonProps {
  t: ReturnType<typeof useT>;
  dialogs: ReturnType<typeof useDialogs>;
  status: ReturnType<typeof health>;
}

/** Every lucide symbol in the strip is drawn at the size the hand-drawn four are. */
export const ICON = { size: 18, 'aria-hidden': true, focusable: false } as const;

export function Sep() {
  return <span className="ribbon-sep" aria-hidden="true" />;
}

export function Spacer() {
  return <span className="spacer" />;
}

/**
 * A caption and the controls it names — the strip's only structure.
 *
 * The caption is a DIRECT child of `.ribbon` and the controls are boxed. Both
 * halves of that are load-bearing:
 *
 *   * direct, because `e2e/serit.spec.ts` reads `bar.firstElementChild` to
 *     check that every strip opens with a caption, and because the first
 *     caption on each of the seven strips is padded to one width so the first
 *     BUTTON lands at the same x wherever you are;
 *   * boxed, because buttons that belong to one question should be the same
 *     width, and CSS has no way to say that without a box (`.ribbon-group` is
 *     a one-row grid of equal columns).
 *
 * It was a fragment until 2026-08-27, on the argument that boxing would make
 * `.ribbon`'s gap apply between boxes and force a second gap inside them. That
 * is exactly what happens and it turns out to be the point: with one gap the
 * caption sat as far from the buttons it names as the buttons sat from each
 * other, so the only thing grouping them was the hairline. Now the inside gap
 * is smaller than the outside one and the group reads as a group.
 */
export function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <>
      <span className="ribbon-label">{t(label)}</span>
      <span className="ribbon-group">{children}</span>
    </>
  );
}
