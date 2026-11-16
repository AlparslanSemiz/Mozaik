// The actions the command palette offers beside the destinations.
//
// Since Sadeleşme phase 1 (2026-11-16) the palette finds WORK, not only
// places: "yazdır", "kaydet", "aç", "kopya", "yedek", "okul adı", "tema",
// "yazı boyu", "programı yap". Each action carries the words somebody would
// type for it (`extra`), because he types what he wants done, not the name
// of the screen it is on. An action either does the thing (Kaydet, Programı
// yap) or opens the one place it is done (tema → Ayarlar → Görünüm: the theme
// is in exactly one place).

import { useMemo } from 'react';
import type { State } from '../../leaf/model';
import type { Motion } from '../../platform/prefs';
import type { SolverRun } from '../../platform/search';
import { downloadBackup } from '../../platform/storage';
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
  openShortcuts: () => void;
  openFile: () => void;
  copyForNewTerm: () => void;
  openOldCopies: () => void;
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
  openShortcuts,
  openFile,
  copyForNewTerm,
  openOldCopies,
  toggleRibbon,
  toggleMotion,
}: PaletteInputs): PaletteAction[] {
  return useMemo(
    () => [
      {
        id: 'auto',
        label: t('Programı yap'),
        hint: t('Program'),
        extra: 'diz otomatik dağıt yerleştir',
        run: () => {
          goTo({ tab: 'program' });
          solver.start(state, { keepPlaced: true });
        },
      },
      {
        id: 'print',
        label: t('Yazdır'),
        hint: t('Çıktı'),
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
        id: 'old',
        label: t('Eski hâline dön'),
        hint: t('Dosya'),
        extra: 'dün dünkü geri eski kopya yedek önceki gün',
        run: openOldCopies,
      },
      {
        id: 'backup',
        label: t('Planlar ve yedek'),
        hint: t('Ayarlar'),
        extra: 'yedek klasör plan otomatik yedekler tümünü',
        run: () => goTo({ tab: 'settings', section: 'plans' }),
      },
      {
        id: 'school',
        label: t('Okul adını ve zili gir'),
        hint: t('Ayarlar'),
        extra: 'okul adı zil günler saat teneffüs öğle',
        run: () => goTo({ tab: 'settings', section: 'school' }),
      },
      {
        id: 'rules',
        label: t('Kurallar'),
        hint: t('Ayarlar'),
        extra: 'günde en fazla art arda boşluk sınır',
        run: () => goTo({ tab: 'settings', section: 'rules' }),
      },
      {
        id: 'closed',
        label: t('Kapalı saat işaretle'),
        hint: t('Müsaitlik'),
        extra: 'gelemediği saatler müsait değil kapalı izin',
        run: () => goTo({ tab: 'availability' }),
      },
      {
        id: 'theme',
        label: t('Tema'),
        hint: t('Ayarlar → Görünüm'),
        extra: 'koyu açık karanlık gece',
        run: () => goTo({ tab: 'settings', section: 'appearance' }),
      },
      {
        id: 'scale',
        label: t('Yazı büyüklüğü'),
        hint: t('Ayarlar → Görünüm'),
        extra: 'yazı boyu büyüt küçült ölçek',
        run: () => goTo({ tab: 'settings', section: 'appearance' }),
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
      ribbon,
      motion,
      solver,
      goTo,
      notify,
      t,
      openShortcuts,
      openFile,
      copyForNewTerm,
      openOldCopies,
      toggleRibbon,
      toggleMotion,
    ],
  );
}
