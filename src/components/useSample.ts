// Loading the sample school — the question, in one place.
//
// It is offered from two screens now: Ayarlar → Veri is its home, and the
// Kurulum screen shows it once, on a first run, because that is where an empty
// project lands. Two screens asking the same irreversible question two
// different ways is how a program stops being one program — and one of the two
// asks it over a project that already holds a term's work, so the sentence has
// to count what would be lost rather than assume there is nothing.

import { useCallback } from 'react';
import { useDialogs } from './Dialogs';
import { useT } from './T';
import { useToast } from './Toasts';
import { markIntroSeen } from '../theme';
import { sampleState } from '../sample';
import type { State } from '../types';

export type LoadSample = (
  state: State,
  change: (apply: (d: State) => State) => void,
) => Promise<boolean>;

export function useLoadSample(): LoadSample {
  const { confirm } = useDialogs();
  const notify = useToast();
  const t = useT();

  return useCallback(
    async (state, change) => {
      const holds = state.teachers.length + state.classes.length + state.lessons.length > 0;
      const cost = t('{ogretmen} öğretmen, {sinif} sınıf ve {ders} ders silinecek.', {
        ogretmen: state.teachers.length,
        sinif: state.classes.length,
        ders: state.lessons.length,
      });
      if (
        !(await confirm({
          title: holds
            ? t('Bu plandaki her şeyin yerine örnek veri geçecek')
            : t('Örnek okul verisi yüklenecek'),
          body: holds
            ? t(
                '{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 derslik örnek bir okul gelir. Diğer planlara dokunulmaz. Geri alınamaz, önce "Dosyaya kaydet" deyin.',
                { kayip: cost },
              )
            : t(
                '25 öğretmen, 20 sınıf, 8 derslik ve 99 ders. Aracın ne yaptığını görmek için; kendi verinizi girmeye başlamadan önce Ayarlar → Hakkında → "Her şeyi sil" ile temizleyin.',
              ),
          confirmLabel: holds ? t('Yerine koy') : t('Yükle'),
          danger: holds,
        }))
      ) {
        return false;
      }
      change(() => sampleState());
      // Whoever has seen the sample once does not need to be shown the line
      // again, wherever they saw it from.
      markIntroSeen();
      notify('Örnek veri yüklendi.');
      return true;
    },
    [confirm, notify],
  );
}
