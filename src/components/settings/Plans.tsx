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
        ? 'Bu işlem geri alınamaz.'
        : `${c.teachers} öğretmen, ${c.classes} sınıf, ${c.lessons} ders ve ` +
          `yerleşmiş ${c.placed} saat silinecek. Bu işlem geri alınamaz.`;
    if (
      !(await confirm({
        title: `"${name}" planı silinecek`,
        body: what,
        confirmLabel: 'Planı sil',
        danger: true,
      }))
    ) {
      return;
    }
    plans.deletePlan(id);
  }

  return (
    <div className="panel">
      <h2>Planlar ({library.plans.length})</h2>
      <p className="hint">
        Her plan <b>ayrı bir programdır</b>: kendi öğretmenleri, sınıfları ve dizilmiş
        ızgarasıyla. Üst çubuktaki listeden aralarında geçilir. <b>Taslak</b> olarak
        işaretlenen bir plan, yeni bir plana başlarken hazır kurulum olarak sunulur.
      </p>

      {/* The way to ADD one comes before the list of what there is — the rule
          every setup step already follows, and the only panel in the app that
          had it the other way round. */}
      <h3>Yeni plan</h3>
      <p className="hint">
        Yeni plan açılınca ona geçilir; açık olan plan olduğu gibi saklanır.{' '}
        <b>Geri al</b> geçmişi her plan geçişinde sıfırlanır, çünkü bir planın hamlesi
        başka bir plana uygulanamaz.
      </p>
      <div className="form-row">
        <button className="btn" onClick={() => plans.createPlan('Boş plan', emptyState())}>
          Boş plan
        </button>
        <button
          className="btn"
          onClick={() => plans.createPlan(`${active?.name ?? 'Plan'} kopyası`, state)}
        >
          Bu planın kopyası
        </button>
        <button
          className="btn"
          title="Öğretmenler, sınıflar ve dersler kalır; dizilmiş program boşalır"
          onClick={() =>
            plans.createPlan(`${active?.name ?? 'Plan'} taslağı`, { ...state, placements: {} }, true)
          }
        >
          Taslak olarak kaydet
        </button>
      </div>

      <table className="list">
        <thead>
          <tr>
            <th>Plan</th>
            <th className="w-col-xs">Taslak</th>
            {/* One glanceable line instead of three number columns: the name
                column was collapsing to nothing and "1. plan" did not fit in
                its own box. */}
            <th>İçerik</th>
            <th className="num">
              Yerleşmiş saat
            </th>
            <th className="w-col-xl" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ plan, counts, missing }) => (
            <tr key={plan.id} aria-current={plan.id === planId}>
              <td>
                <input
                  type="text"
                  aria-label={`${plan.name} adı`}
                  // defaultValue + a key that follows the value: a re-render on
                  // every keystroke steals the caret (PLAN pitfall 3).
                  key={plan.name}
                  defaultValue={plan.name}
                  onBlur={(e) => plans.renamePlan(plan.id, e.target.value)}
                />
                {plan.id === planId && <span className="hint"> · açık olan</span>}
                {missing && (
                  <span className="hint" title="Bu planın verisi bulunamadı">
                    {' '}
                    · verisi yok
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
                {counts.teachers} öğretmen · {counts.classes} sınıf · {counts.lessons} ders
              </td>
              <td className="num">{counts.placed}</td>
              <td>
                <div className="form-row nowrap">
                  <button
                    className="btn"
                    disabled={plan.id === planId}
                    onClick={() => plans.switchPlan(plan.id)}
                  >
                    Bu plana geç
                  </button>
                  <button
                    className="btn danger"
                    disabled={library.plans.length <= 1}
                    title={
                      library.plans.length <= 1
                        ? 'Tek plan silinemez'
                        : 'Bu planı tamamen siler'
                    }
                    onClick={() => remove(plan.id, plan.name)}
                  >
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {draftList.length > 0 && (
        <>
          <h3>Taslaktan başla</h3>
          <p className="hint">
            Taslağın kurulumu (derslikler, öğretmenler, sınıflar, dersler) kopyalanır;
            <b> dizilmiş program boş gelir</b>. Taslağın kendisi değişmez.
          </p>
          <DraftStart plans={plans} label={(name) => `${name} → yeni plan`} />
        </>
      )}
    </div>
  );
}
