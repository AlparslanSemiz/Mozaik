// The actions the command palette offers beside the destinations.
//
// Since Sadeleşme phase 1 (2026-11-16) the palette finds WORK, not only
// places: "yazdır", "kaydet", "aç", "kopya", "yedek", "okul adı", "tema",
// "yazı boyu", "programı yap". Each action carries the words somebody would
// type for it (`extra`), because he types what he wants done, not the name
// of the screen it is on. An action either does the thing (Kaydet, Programı
// yap) or opens the one place it is done (tema → Okul bilgileri → Görünüm:
// the theme is in exactly one place). The places are named the way the tabs
// and the strips name them, joined by an arrow.

import { useMemo } from 'react';
import type { State } from '../../leaf/model';
import type { Motion } from '../../platform/prefs';
import type { SolverRun } from '../../platform/search';
import { downloadBackup } from '../../platform/storage';
import { solverExclusions, type ProgramMask } from '../../pure/program';
import type { Place, useT } from '../common';

export interface PaletteAction {
  id: string;
  label: string;
  hint?: string;
  /** Other words this action is found by. */
  extra?: string;
  run: () => void;
}

interface PaletteInputs {
  state: State;
  ribbon: boolean;
  motion: Motion;
  solver: SolverRun;
  goTo: (place: Place) => void;
  notify: (text: string) => void;
  t: ReturnType<typeof useT>;
  programMask: ProgramMask;
  openShortcuts: () => void;
  openFile: () => void;
  copyForNewTerm: () => void;
  toggleRibbon: () => void;
  toggleMotion: () => void;
}

export function usePaletteActions({
  state,
  ribbon,
  motion,
  solver,
  goTo,
  notify,
  t,
  programMask,
  openShortcuts,
  openFile,
  copyForNewTerm,
  toggleRibbon,
  toggleMotion,
}: PaletteInputs): PaletteAction[] {
  return useMemo(() => {
    const school = t('Okul bilgileri');
    const look = `${school} → ${t('Görünüm')}`;
    return [
      {
        id: 'auto',
        label: t('Programı yap'),
        hint: t('Program'),
        extra: 'diz otomatik dağıt yerleştir',
        run: () => {
          goTo({ tab: 'program' });
          solver.start(state, {
            keepPlaced: true,
            exclusions: solverExclusions(programMask),
          });
        },
      },
      {
        id: 'print',
        label: t('Yazdır'),
        hint: t('Yazdır ve gönder'),
        extra: 'çıktı kâğıt baskı yazıcı pdf e-posta gönder',
        run: () => goTo({ tab: 'print' }),
      },
      {
        id: 'save',
        label: t('Kaydet'),
        hint: t('plan dosyası'),
        extra: 'dosyaya kaydet indir yedek',
        run: () => {
          downloadBackup(state);
          notify(t('Plan dosyaya yazıldı. İndirilenler klasörüne bakın.'));
        },
      },
      {
        id: 'open',
        label: t('Dosyadan aç'),
        hint: t('plan dosyası'),
        extra: 'aç yükle json dosya',
        run: openFile,
      },
      {
        id: 'copy',
        label: t('Yeni dönem için kopyala'),
        extra: 'kopya kopyala yeni dönem plan',
        run: copyForNewTerm,
      },
      {
        // The Kontrol tab's words too: that is what a reader of an older
        // version types for this (K3).
        id: 'problems',
        label: t('Programın durumu'),
        extra: 'kontrol sorun sorunlar ipuçları yerleşmedi neden yük',
        run: () => goTo({ tab: 'program', problems: true }),
      },
      {
        id: 'backup',
        label: t('Planlar ve yedek'),
        hint: school,
        extra: 'yedek klasör plan otomatik yedekler tümünü ayarlar',
        run: () => goTo({ tab: 'school', section: 'plans' }),
      },
      {
        id: 'school',
        label: t('Okul adını ve zili gir'),
        hint: school,
        extra: 'okul adı zil günler saat teneffüs öğle ayarlar',
        run: () => goTo({ tab: 'school', section: 'school' }),
      },
      {
        id: 'rules',
        label: t('Kurallar'),
        hint: school,
        extra: 'günde en fazla art arda boşluk sınır ayarlar',
        run: () => goTo({ tab: 'school', section: 'rules' }),
      },
      {
        // Müsaitlik is the person's page since K1: the list is one click
        // from it.
        id: 'closed',
        label: t('Kapalı saat işaretle'),
        hint: t('Öğretmenler'),
        extra: 'gelemediği saatler müsait değil kapalı izin müsaitlik',
        run: () => goTo({ tab: 'teachers', people: 'list' }),
      },
      {
        id: 'lessons',
        label: t('Ders gir'),
        hint: t('Sınıflar'),
        extra: 'dersler ders ekle haftalık saat dağılım',
        run: () => goTo({ tab: 'classes', people: 'lessons' }),
      },
      {
        id: 'theme',
        label: t('Tema'),
        hint: look,
        extra: 'koyu açık karanlık gece',
        run: () => goTo({ tab: 'school', section: 'appearance' }),
      },
      {
        id: 'scale',
        label: t('Yazı büyüklüğü'),
        hint: look,
        extra: 'yazı boyu büyüt küçült ölçek',
        run: () => goTo({ tab: 'school', section: 'appearance' }),
      },
      {
        id: 'ribbon',
        label: ribbon ? t('Araç şeridini gizle') : t('Araç şeridini göster'),
        run: toggleRibbon,
      },
      {
        id: 'motion',
        label: motion === 'kapali' ? t('Animasyonları aç') : t('Animasyonları kapat'),
        hint: look,
        run: toggleMotion,
      },
      {
        id: 'shortcuts',
        label: t('Klavye kısayolları'),
        hint: '?',
        run: openShortcuts,
      },
    ];
  }, [
    state,
    ribbon,
    motion,
    solver,
    goTo,
    notify,
    t,
    programMask,
    openShortcuts,
    openFile,
    copyForNewTerm,
    toggleRibbon,
    toggleMotion,
  ]);
}
