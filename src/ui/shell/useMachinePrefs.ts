// The machine preferences App holds a copy of, and the three toggles the top
// bar and the palette share. Each copy is read once from its preference and
// written back by whoever changes it (platform/prefs); App hands them down to
// the strip and to Ayarlar.

import { useCallback, useState } from 'react';
import {
  applyAvailClock,
  applyMotion,
  applyRibbon,
  applyTheme,
  readAvailClock,
  readDensity,
  readMotion,
  readProgramColor,
  readRibbon,
  readRibbonAuto,
  readScale,
  readTheme,
  readUiDensity,
  writeProgramColor,
  type Density,
  type Motion,
  type ProgramColorMode,
  type Theme,
} from '../../platform/prefs';

export function useMachinePrefs() {
  // Whether the strip is allowed to slide away on its own while you read down.
  // A gesture rather than a preference, so it gets its own key (theme.ts); App
  // reads it before the effect that attaches the slide (useMainScroll).
  const [ribbonAuto, setRibbonAuto] = useState<boolean>(readRibbonAuto);
  const [theme, setTheme] = useState<Theme>(readTheme);
  // Already applied to the document by main.tsx before the first paint; this
  // copy exists only so Ayarlar → Görünüm can show which step is pressed.
  const [scale, setScale] = useState<number>(readScale);
  const [density, setDensity] = useState<Density>(readDensity);
  const [programColor, setProgramColorRaw] = useState<ProgramColorMode>(readProgramColor);
  const setProgramColor = useCallback((next: ProgramColorMode) => {
    writeProgramColor(next);
    setProgramColorRaw(next);
  }, []);
  // Its twin, and a separate one since 2026-08-27: the grid's step and the
  // interface's step are two decisions (see theme.ts). Only Ayarlar → Görünüm
  // sets this one — the Program strip still speaks for the grid alone.
  const [uiDensity, setUiDensity] = useState<Density>(readUiDensity);
  // Applied to the document by main.tsx before the first paint; this copy
  // exists so the button that flips it can show which way the switch is.
  const [availClock, setAvailClockRaw] = useState<boolean>(readAvailClock);
  // The <html> attribute goes with the state, wherever the control lives. It
  // used to be written by the one button in Ayarlar → Görünüm; that button is
  // in Müsaitlik's own strip now, and a second caller must not have to know to
  // do this (the toggle would flip and nothing on the table would change).
  const setAvailClock = useCallback((next: boolean) => {
    applyAvailClock(next);
    setAvailClockRaw(next);
  }, []);
  // Same again for how much the interface is allowed to move.
  const [motion, setMotion] = useState<Motion>(readMotion);
  // Whether the tool strip is drawn. It lives here and not in Ribbon because
  // the button that folds it is in the top bar — a folded strip has no row to
  // put its own chevron on, which is the whole point of folding it.
  const [ribbon, setRibbon] = useState<boolean>(readRibbon);

  // Callbacks rather than plain functions because the palette's command list
  // is memoized on them: a function redeclared on every render would rebuild
  // the list every render, and leaving them out of its dependencies needed a
  // lint suppression (RK12).
  const toggleRibbon = useCallback(() => {
    const next = !ribbon;
    applyRibbon(next);
    setRibbon(next);
  }, [ribbon]);

  /**
   * Two positions from the palette, three in Ayarlar. The middle step ('az') is
   * a considered choice and the palette is a place you pass through, so what
   * this offers is the switch: off, or back to whatever full means.
   */
  const toggleMotion = useCallback(() => {
    const next: Motion = motion === 'kapali' ? 'tam' : 'kapali';
    applyMotion(next);
    setMotion(next);
  }, [motion]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }, [theme]);

  return {
    ribbonAuto,
    setRibbonAuto,
    theme,
    setTheme,
    scale,
    setScale,
    density,
    setDensity,
    programColor,
    setProgramColor,
    uiDensity,
    setUiDensity,
    availClock,
    setAvailClock,
    motion,
    setMotion,
    ribbon,
    toggleRibbon,
    toggleMotion,
    toggleTheme,
  };
}
