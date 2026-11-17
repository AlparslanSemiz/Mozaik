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

import { useCallback, useRef } from 'react';
import { useDialogs, useKeepBefore, useT, useToast, useUndoIf } from '../common';
import { markIntroSeen } from '../../platform/prefs';
import { sampleState } from '../../pure/io';
import type { PlanControls } from '../common/props';
import type { State } from '../../leaf/model';

export type LoadSample = (
  state: State,
  change: (apply: (d: State) => State, label?: string) => void,
) => Promise<boolean>;

/** The name `createPlan` and a first run give a plan nobody has named ("Plan 1", "Plan 2"…). */
export function isUnnamedPlan(name: string): boolean {
  return /^Plan \d+$/.test(name);
}

export function useLoadSample(plans: PlanControls): LoadSample {
  const { confirm } = useDialogs();
  const notify = useToast();
  const undoIf = useUndoIf();
  const keepBefore = useKeepBefore();
  const t = useT();
  // The notice outlives the render it was made in: its Geri al renames from
  // the library as it is THEN, never from the one it was made with (a stale
  // library would write the plans made in between out of the list).
  const plansNow = useRef(plans);
  plansNow.current = plans;

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
          // An empty plan loses nothing: the title is the whole question.
          body: holds
            ? t(
                '{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 ders olan örnek bir okul gelir. Diğer planlara dokunulmaz. Hemen ardından “Geri al” ile geri gelir.',
                { kayip: cost },
              )
            : undefined,
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
      // The plan picker would say "Plan 1" for a school that is the sample:
      // an unnamed plan takes the sample's name, and gives it back with Geri al.
      // A plan the user named keeps its name.
      const planId = plansNow.current.planId;
      const was = plansNow.current.library.plans.find((p) => p.id === planId)?.name ?? null;
      const sampleName = t('Örnek okul');
      const renamed = was !== null && isUnnamedPlan(was);
      if (renamed) plansNow.current.renamePlan(planId, sampleName);
      // Whoever has seen the sample once does not need to be shown the line
      // again, wherever they saw it from.
      markIntroSeen();
      notify(said, 'info', {
        label: t('Geri al'),
        run: () => {
          const done = undoIf(next);
          if (done !== false && renamed && was !== null) plansNow.current.renamePlan(planId, was);
          return done;
        },
        expected: next,
      });
      return true;
    },
    [confirm, notify, t, undoIf, keepBefore],
  );
}
