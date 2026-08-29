// The plan library, as a panel.
//
// A plan is a whole timetable: its own school, its own people, its own grid.
// The top bar only SWITCHES between them; everything that creates, renames or
// destroys one is here, next to "Her şeyi sil" — the two rarest and most
// dangerous buttons in the app live on the same screen on purpose.
//
// A DRAFT is not a second kind of object, only a plan with a flag: the same
// school with the grid emptied, kept so next term does not start by retyping
// twenty classes.

import { useMemo } from 'react';
import { useDialogs } from '../Dialogs';
import { emptyState } from '../../entities';
import { drafts as draftsOf } from '../../library';
import { loadPlan } from '../../store';
import type { State } from '../../types';
import type { PlanControls } from '../props';
import DraftStart from '../DraftStart';
import { T, useT } from '../T';

interface Props {
  state: State;
  plans: PlanControls;
}

/** What is inside a plan, for the table. Cheap enough: it is read on demand. */
function summary(state: State) {
  return {
    teachers: state.teachers.length,
    classes: state.classes.length,
    lessons: state.lessons.length,
    placed: Object.keys(state.placements).length,
  };
}

export default function Plans({ state, plans }: Props) {
  const t = useT();
  const { confirm } = useDialogs();
  const { library, planId } = plans;

  // Recomputed only when the directory or the open plan changes — this panel is
  // opened rarely, but parsing a 100 KB JSON per row per keystroke is not free.
  const rows = useMemo(
    () =>
      library.plans.map((plan) => {
        // The open plan is in memory; the others are parsed out of storage. A
        // plan whose key is gone must read as EMPTY, not borrow the open plan's
        // numbers — that would invite deleting the wrong row.
        const stored = plan.id === planId ? state : loadPlan(plan.id);
        return {
          plan,
          counts: summary(stored ?? emptyState()),
          missing: stored === null,
        };
      }),
    [library, planId, state],
  );

  const active = library.plans.find((p) => p.id === planId);
  const draftList = draftsOf(library).filter((p) => p.id !== planId);

  async function remove(id: string, name: string) {
    const found = rows.find((r) => r.plan.id === id);
    const c = found?.counts;
    const what =
      c === undefined
        ? t('Bu işlem geri alınamaz.')
        : t(
            '{ogretmen} öğretmen, {sinif} sınıf, {ders} ders ve yerleşmiş {saat} saat silinecek. Bu işlem geri alınamaz.',
            {
              ogretmen: c.teachers,
              sinif: c.classes,
              ders: c.lessons,
              saat: c.placed,
            },
          );
    if (
      !(await confirm({
        title: t('"{ad}" planı silinecek', { ad: name }),
        body: what,
        confirmLabel: t('Planı sil'),
        danger: true,
      }))
    ) {
      return;
    }
    plans.deletePlan(id);
  }

  return (
    <div className="panel">
      <h2>{t('Planlar ({n})', { n: library.plans.length })}</h2>
      <p className="hint">
        <T k="Her plan **ayrı bir programdır**: kendi öğretmenleri, sınıfları ve dizilmiş ızgarasıyla. Üst çubuktaki listeden aralarında geçilir. **Taslak** olarak işaretlenen bir plan, yeni bir plana başlarken hazır kurulum olarak sunulur." />
      </p>

      {/* The way to ADD one comes before the list of what there is — the rule
          every setup step already follows, and the only panel in the app that
          had it the other way round. */}
      <h3>{t('Yeni plan')}</h3>
      <p className="hint">
        <T k="Yeni plan açılınca ona geçilir; açık olan plan olduğu gibi saklanır. **Geri al** geçmişi her plan geçişinde sıfırlanır, çünkü bir planın hamlesi başka bir plana uygulanamaz." />
      </p>
      <div className="form-row">
        <button className="btn" onClick={() => plans.createPlan('Boş plan', emptyState())}>
          {t(
            'Boş plan',
          )}
        </button>
        <button
          className="btn"
          onClick={() => plans.createPlan(`${active?.name ?? 'Plan'} kopyası`, state)}
        >{t('Bu planın kopyası')}</button>
        <button
          className="btn"
          title={t('Öğretmenler, sınıflar ve dersler kalır; dizilmiş program boşalır')}
          onClick={() =>
            // The pins go with the placements they held: a pin over an empty
            // cell locks a square for a lesson that is not there.
            plans.createPlan(
              `${active?.name ?? 'Plan'} taslağı`,
              { ...state, placements: {}, pinned: {} },
              true,
            )
          }
        >{t('Taslak olarak kaydet')}</button>
      </div>

      <table className="list">
        <thead>
          <tr>
            <th>{t('Plan')}</th>
            <th className="w-col-xs">{t('Taslak')}</th>
            {/* One glanceable line instead of three number columns: the name
                column was collapsing to nothing and "1. plan" did not fit in
                its own box. */}
            <th>{t('İçerik')}</th>
            <th className="num">{t('Yerleşmiş saat')}</th>
            <th className="w-col-xl" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ plan, counts, missing }) => (
            <tr key={plan.id} aria-current={plan.id === planId}>
              <td>
                <input
                  type="text"
                  aria-label={t('{ad} adı', { ad: plan.name })}
                  // defaultValue + a key that follows the value: a re-render on
                  // every keystroke steals the caret (PLAN pitfall 3).
                  key={plan.name}
                  defaultValue={plan.name}
                  onBlur={(e) => plans.renamePlan(plan.id, e.target.value)}
                />
                {plan.id === planId && <span className="hint">{t('· açık olan')}</span>}
                {missing && (
                  <span className="hint" title={t('Bu planın verisi bulunamadı')}>
                    <T k="· verisi yok" />
                  </span>
                )}
              </td>
              <td>
                <input
                  type="checkbox"
                  aria-label={`${plan.name} taslak`}
                  checked={plan.draft}
                  onChange={(e) => plans.markDraft(plan.id, e.target.checked)}
                />
              </td>
              <td className="hint">
                {t('{ogretmen} öğretmen · {sinif} sınıf · {ders} ders', {
                  ogretmen: counts.teachers,
                  sinif: counts.classes,
                  ders: counts.lessons,
                })}
              </td>
              <td className="num">{counts.placed}</td>
              <td>
                <div className="form-row nowrap">
                  <button
                    className="btn"
                    disabled={plan.id === planId}
                    onClick={() => plans.switchPlan(plan.id)}
                  >{t('Bu plana geç')}</button>
                  <button
                    className="btn danger"
                    disabled={library.plans.length <= 1}
                    title={
                      library.plans.length <= 1
                        ? t('Tek plan silinemez')
                        : t('Bu planı tamamen siler')
                    }
                    onClick={() => remove(plan.id, plan.name)}
                  >{t('Sil')}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {draftList.length > 0 && (
        <>
          <h3>{t('Taslaktan başla')}</h3>
          <p className="hint">
            <T k="Taslağın kurulumu (derslikler, öğretmenler, sınıflar, dersler) kopyalanır; ** dizilmiş program boş gelir**. Taslağın kendisi değişmez." />
          </p>
          <DraftStart plans={plans} label={(name) => `${name} → yeni plan`} />
        </>
      )}
    </div>
  );
}
