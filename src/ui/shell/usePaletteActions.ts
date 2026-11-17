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
import { type Motion, SCALE_STEPS } from '../../platform/prefs';
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
  goTo: (place: Place) => void;
  notify: (text: string) => void;
  t: ReturnType<typeof useT>;
  openShortcuts: () => void;
  openFile: () => void;
  copyForNewTerm: () => void;
  openOldCopies: () => void;
  toggleRibbon: () => void;
  toggleMotion: () => void;
  scale: number;
  chooseScale: (next: number) => void;
  /** The strip's "Kalanı diz": relay, moved lessons named, week before kept. */
  makeRest: () => void;
}

export function usePaletteActions({
  state,
  ribbon,
  motion,
  goTo,
  notify,
  t,
  openShortcuts,
  openFile,
  copyForNewTerm,
  openOldCopies,
  toggleRibbon,
  toggleMotion,
  scale,
  chooseScale,
  makeRest,
}: PaletteInputs): PaletteAction[] {
  return useMemo(() => {
    const school = t('Okul bilgileri');
    const look = `${school} → ${t('Görünüm')}`;
    return [
      {
        id: 'auto',
        label: t('Kalanı diz'),
        hint: t('Program'),
        extra: 'program yap diz otomatik dağıt yerleştir kalan',
        run: () => {
          goTo({ tab: 'program' });
          makeRest();
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
        id: 'old',
        label: t('Eski hâline dön'),
        hint: t('Dosya'),
        extra: 'dün dünkü geri eski kopya yedek önceki gün',
        run: openOldCopies,
      },
      {
        // Hakkında is behind a Daha fazla; "güncelleme" is what an older
        // reader types for it.
        id: 'update',
        label: t('Güncellemeleri denetle'),
        hint: `${school} → ${t('Hakkında')}`,
        extra: 'güncelleme güncelle yeni sürüm indir hakkında versiyon',
        run: () => goTo({ tab: 'school', section: 'about' }),
      },
      {
        id: 'backup',
        label: t('Planlar ve yedek'),
        hint: `${school} → ${t('Planlar ve yedek')}`,
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
        label: t('Kapalı saatleri işaretle'),
        hint: t('Öğretmenler'),
        extra: 'gelemediği saatler müsait değil kapalı izin müsaitlik',
        run: () => goTo({ tab: 'teachers', people: 'list' }),
      },
      {
        id: 'lessons',
        label: t('Ders gir'),
        hint: t('Sınıflar'),
        extra: 'dersler ders ekle haftalık saat dağılım dağılış',
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
        // Does it, a step at a time: "yazı büyüt" is a wish, not a place.
        id: 'bigger',
        label: t('Yazıyı büyüt'),
        extra: 'yazı büyüt büyük',
        run: () => chooseScale(SCALE_STEPS.find(([v]) => v > scale)?.[0] ?? scale),
      },
      {
        id: 'ribbon',
        label: ribbon ? t('Düğme satırını gizle') : t('Düğme satırını göster'),
        run: toggleRibbon,
      },
      {
        id: 'motion',
        label: motion === 'kapali' ? t('Ekran hareketlerini aç') : t('Ekran hareketlerini kapat'),
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
    goTo,
    notify,
    t,
    openShortcuts,
    openFile,
    copyForNewTerm,
    openOldCopies,
    toggleRibbon,
    toggleMotion,
    scale,
    chooseScale,
    makeRest,
  ]);
}
