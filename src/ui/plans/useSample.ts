// Loading the sample school — the question, in one place.
//
// It is offered from two screens now: Ayarlar → Veri is its home, and the
// Kurulum screen shows it once, on a first run, because that is where an empty
// project lands. Two screens asking the same irreversible question two
// different ways is how a program stops being one program — and one of the two
// asks it over a project that already holds a term's work, so the sentence has
// to count what would be lost rather than assume there is nothing.
//
// Not irreversible, and it never was: the sample goes in as an ordinary step
// of the history. The question used to say "Geri alınamaz" all the same; since
// 2026-11-15 it says what is true, and the notice offers "Geri al" (TODO SD1).

import { useCallback } from 'react';
import { useDialogs, useKeepBefore, useT, useToast, useUndoIf } from '../common';
import { markIntroSeen } from '../../platform/prefs';
import { sampleState } from '../../pure/io';
import type { State } from '../../leaf/model';

export type LoadSample = (
  state: State,
  change: (apply: (d: State) => State, label?: string) => void,
) => Promise<boolean>;

export function useLoadSample(): LoadSample {
  const { confirm } = useDialogs();
  const notify = useToast();
  const undoIf = useUndoIf();
  const keepBefore = useKeepBefore();
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
            ? t('Bu plandaki her şeyin yerine örnek okul geçecek')
            : t('Örnek okul verisi yüklenecek'),
          body: holds
            ? t(
                '{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 ders olan örnek bir okul gelir. Diğer planlara dokunulmaz. Hemen ardından "Geri al" ile geri gelir.',
                { kayip: cost },
              )
            : t(
                `25 öğretmen, 20 sınıf, 8 derslik ve 99 ders. Mozaik'in ne yaptığını görmek için; kendi verinizi girmeye başlamadan önce Ayarlar → Hakkında → "Her şeyi sil" ile temizleyin.`,
              ),
          confirmLabel: holds ? t('Yerine koy') : t('Yükle'),
          danger: holds,
        }))
      ) {
        return false;
      }
      const said = t('Örnek okul yüklendi.');
      const next = sampleState();
      // Over a plan that holds work: what a reload can still bring back.
      if (holds) keepBefore(state, said);
      change(() => next, said);
      // Whoever has seen the sample once does not need to be shown the line
      // again, wherever they saw it from.
      markIntroSeen();
      notify(said, 'info', { label: t('Geri al'), run: () => undoIf(next) });
      return true;
    },
    [confirm, notify, t, undoIf, keepBefore],
  );
}
