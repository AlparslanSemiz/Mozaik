// The frequent actions the command palette offers beside the destinations.

import { useMemo } from 'react';
import type { State } from '../../leaf/model';
import type { Motion, Tab, Theme } from '../../platform/prefs';
import type { SolverRun } from '../../platform/search';
import { downloadBackup } from '../../platform/storage';
import { solverExclusions, type ProgramMask } from '../../pure/program';
import type { useT } from '../common';

interface PaletteInputs {
  state: State;
  theme: Theme;
  ribbon: boolean;
  motion: Motion;
  solver: SolverRun;
  goTab: (tab: Tab) => void;
  notify: (text: string) => void;
  t: ReturnType<typeof useT>;
  programMask: ProgramMask;
  openShortcuts: () => void;
  toggleTheme: () => void;
  toggleRibbon: () => void;
  toggleMotion: () => void;
}

export function usePaletteActions({
  state,
  theme,
  ribbon,
  motion,
  solver,
  goTab,
  notify,
  t,
  programMask,
  openShortcuts,
  toggleTheme,
  toggleRibbon,
  toggleMotion,
}: PaletteInputs) {
  return useMemo(
    () => [
      {
        id: 'save',
        label: t('Dosyaya kaydet'),
        hint: t('yedek al'),
        run: () => {
          downloadBackup(state);
          notify(t('Yedek dosyaya yazıldı. İndirilenler klasörüne bakın.'));
        },
      },
      {
        id: 'auto',
        label: t('Otomatik diz'),
        hint: t('Program'),
        run: () => {
          goTab('program');
          solver.start(state, {
            keepPlaced: true,
            exclusions: solverExclusions(programMask),
          });
        },
      },
      {
        id: 'theme',
        label: theme === 'dark' ? t('Açık temaya geç') : t('Koyu temaya geç'),
        run: toggleTheme,
      },
      {
        id: 'ribbon',
        label: ribbon ? t('Araç şeridini gizle') : t('Araç şeridini göster'),
        run: toggleRibbon,
      },
      {
        id: 'motion',
        label: motion === 'kapali' ? t('Animasyonları aç') : t('Animasyonları kapat'),
        hint: t('Ayarlar → Görünüm'),
        run: toggleMotion,
      },
      {
        id: 'shortcuts',
        label: t('Klavye kısayolları'),
        hint: '?',
        run: openShortcuts,
      },
    ],
    [
      state,
      theme,
      ribbon,
      motion,
      solver,
      goTab,
      notify,
      t,
      programMask,
      openShortcuts,
      toggleTheme,
      toggleRibbon,
      toggleMotion,
    ],
  );
}
