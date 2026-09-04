// What THIS MACHINE likes: theme, sizes, density, motion, whether the strip is
// drawn and whether it may hide itself.
//
// None of it enters `State` and none of it enters a backup (theme.ts): a dark
// machine's backup must not flip my father's theme, and a cosmetic setting must
// not cost a schema migration.
//
// Called from `App()` and NOT lifted into a child component: the state has to
// live in App's own fiber, because a tab change unmounts everything under it
// (pitfall 18). Only the code moved out of App.tsx, not the state.

import { useCallback, useState } from 'react';
import {
  applyAvailClock,
  applyMotion,
  applyRibbon,
  applyTheme,
  type Density,
  type Motion,
  readAvailClock,
  readDensity,
  readMotion,
  readRibbon,
  readRibbonAuto,
  readScale,
  readTheme,
  readUiDensity,
  type Theme,
} from './theme';
import { type ProgramColorMode, readProgramColor, writeProgramColor } from './programColor';

export interface MachinePrefs {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
  /** Already applied to the document by main.tsx before the first paint; these
      copies exist so Ayarlar → Görünüm can show which step is pressed. */
  scale: number;
  setScale: (next: number) => void;
  density: Density;
  setDensity: (next: Density) => void;
  /** The grid's step and the interface's step are two decisions (theme.ts). */
  uiDensity: Density;
  setUiDensity: (next: Density) => void;
  availClock: boolean;
  setAvailClock: (next: boolean) => void;
  motion: Motion;
  setMotion: (next: Motion) => void;
  toggleMotion: () => void;
  ribbon: boolean;
  setRibbon: (next: boolean) => void;
  toggleRibbon: () => void;
  /** Whether the strip may slide away on its own while you read down. A gesture
      rather than a preference, so it has its own key (theme.ts). */
  ribbonAuto: boolean;
  setRibbonAuto: (next: boolean) => void;
  programColor: ProgramColorMode;
  setProgramColor: (next: ProgramColorMode) => void;
}

export function useMachinePrefs(): MachinePrefs {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [scale, setScale] = useState<number>(readScale);
  const [density, setDensity] = useState<Density>(readDensity);
  const [uiDensity, setUiDensity] = useState<Density>(readUiDensity);
  const [availClock, setAvailClockRaw] = useState<boolean>(readAvailClock);
  const [motion, setMotion] = useState<Motion>(readMotion);
  const [ribbon, setRibbon] = useState<boolean>(readRibbon);
  const [ribbonAuto, setRibbonAuto] = useState<boolean>(readRibbonAuto);
  const [programColor, setProgramColorRaw] = useState<ProgramColorMode>(readProgramColor);

  // The <html> attribute goes with the state, wherever the control lives. This
  // one used to be written by the single button in Ayarlar → Görünüm; that
  // button is in Müsaitlik's own strip now, and a second caller must not have
  // to know to do it (the toggle would flip and nothing on the table would
  // change).
  const setAvailClock = useCallback((next: boolean) => {
    applyAvailClock(next);
    setAvailClockRaw(next);
  }, []);

  const setProgramColor = useCallback((next: ProgramColorMode) => {
    writeProgramColor(next);
    setProgramColorRaw(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  const toggleRibbon = useCallback(() => {
    setRibbon((current) => {
      applyRibbon(!current);
      return !current;
    });
  }, []);

  /**
   * Two positions from the palette, three in Ayarlar. The middle step ('az') is
   * a considered choice and the palette is a place you pass through, so what
   * this offers is the switch: off, or back to whatever full means.
   */
  const toggleMotion = useCallback(() => {
    setMotion((current) => {
      const next: Motion = current === 'kapali' ? 'tam' : 'kapali';
      applyMotion(next);
      return next;
    });
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    scale,
    setScale,
    density,
    setDensity,
    uiDensity,
    setUiDensity,
    availClock,
    setAvailClock,
    motion,
    setMotion,
    toggleMotion,
    ribbon,
    setRibbon,
    toggleRibbon,
    ribbonAuto,
    setRibbonAuto,
    programColor,
    setProgramColor,
  };
}
