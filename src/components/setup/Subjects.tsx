// Okul step two: the school's subject list, and each subject's short form.
//
// It was an Ayarlar section until this round, which put it one TAB away from
// the dropdown that reads it — so adding a subject meant leaving the teacher
// half-typed. It is a list the school builds, exactly like the other three,
// and it now sits where they sit, before the step that names it.
//
// Two jobs in one table on purpose — they are the same row.
//
// The LIST is what the Branş dropdown offers on the Öğretmenler step. It used
// to be free text, which meant "Matemtik" quietly became a second subject that
// still printed as "Mat" and could not be told from the first one on paper.
//
// The SHORT FORM exists because "Matematik" overflows a 34px grid cell and a
// ~21mm printed column; "Mat" does not. The boxes come FILLED with the default
// rather than showing it as a faint placeholder — a value you can read is a
// value you can correct — and only what is actually changed is stored.
//
// The ORDER is the only thing this array's order is FOR: it is the order the
// Branş dropdown offers on the Öğretmenler step.
//
// The panel is the LEFT column only. What used to be its own `<aside>` — the
// built-in subjects still on offer — is now a branch of `setup/Summary.tsx`,
// because this file is rendered INSIDE `setup/index.tsx`'s `.cols` and a
// second one nested in it would give the screen two asides and two "the list
// on this screen" answers (`e2e/helpers.ts` mainList()).

import { useState } from 'react';
import { useDialogs } from '../Dialogs';
import { useRowOrder } from '../useRowOrder';
import { EMPTY_QUERY } from '../../listview';
import {
  addSubject,
  deleteSubject,
  subjectKey,
  subjectLabel,
  subjectOptions,
  setSubjectShort,
  subjectShort,
  subjectTeachers,
} from '../../entities';
import type { ReactElement } from 'react';
import type { PanelProps } from '../props';
import type { Settings } from '../../types';
import { T, useT } from '../T';

interface RowProps extends PanelProps {
  subject: string;
  /** Is it on the school's own list, or only carried by some teacher? */
  inList: boolean;
  /** The handle cell, or an empty one to keep the columns lined up. */
  grip: ReactElement;
  onRemove: () => void;
}

/** "No overrides at all", for asking what a subject's short would be. */
const BLANK_SHORTS = { subjectShorts: {} } as Settings;

function SubjectRow({ subject, state, change, inList, grip, onRemove }: RowProps) {
  const t = useT();
  const current = subjectShort(state.settings, subject);
  // The default AS DRAWN, not the one an override is compared against.
  // `defaultSubjectShort` is deliberately Turkish (see `setSubjectShort`: a
  // comparison that moved with the language would write different things into
  // `subjectShorts` in two sessions of one project). The hint is a reading, so
  // it takes the drawn one — it used to take the other, and an English screen
  // read "default: İng".
  const shown = subjectShort(BLANK_SHORTS, subject);
  const users = subjectTeachers(state, subject);
  return (
    <tr data-row-name={subject}>
      {grip}
      <td>
        {subjectLabel(subject)}
        {!inList && (
          <span className="hint" title={t('Bir öğretmende var ama listede yok')}>
            {' '}
            {t('· listede değil')}
          </span>
        )}
      </td>
      <td>
        <input
          type="text"
          className="text-sm"
          aria-label={t('{ad} kısaltması', { ad: subjectLabel(subject) })}
          // defaultValue + a key that changes with the value: typing
          // must not re-render on every keystroke (PLAN pitfall 3).
          key={current}
          defaultValue={current}
          onBlur={(e) => change((d) => setSubjectShort(d, subject, e.target.value))}
        />
      </td>
      <td className="num" title={users.map((x) => x.name).join(', ')}>
        {users.length}
      </td>
      <td className="hint">
        {current === shown ? t('varsayılan') : t('varsayılanı: {kisa}', { kisa: shown })}
      </td>
      <td>
        {/* The same action cell as the other three lists. `.form-row` is what
            puts `Sil` on the right edge (`table.list td > .form-row` justifies
            to flex-end); without it this one list ended its row wherever the
            word happened to stop. */}
        <div className="form-row nowrap">
          <button
            className="btn danger"
            disabled={!inList}
            title={inList ? t('Listeden çıkar') : t('Bu branş zaten listede değil')}
            onClick={onRemove}
          >{t('Sil')}</button>
        </div>
      </td>
    </tr>
  );
}

export default function Subjects({ state, change }: PanelProps) {
  const t = useT();
  const { confirm, alert } = useDialogs();
  const [fresh, setFresh] = useState('');

  const options = subjectOptions(state);
  const listed = new Set(state.settings.subjects.map(subjectKey));
  const clash = options.some((x) => subjectKey(x) === subjectKey(fresh)) && fresh.trim() !== '';

  // Two groups, and the split is not cosmetic: only the school's OWN list has
  // an order to change. `subjectOptions` appends whatever a teacher carries but
  // the list does not hold, so a row's position on screen is not its position
  // in `settings.subjects` — dragging by the visible index would move the wrong
  // name. The strays get their own <tbody> for the same reason: `rowDrag` finds
  // its target by index among the tbody's children.
  const strays = options.filter((x) => !listed.has(subjectKey(x)));
  const order = useRowOrder({
    kind: 'subjects',
    count: state.settings.subjects.length,
    // No ListTools here: twelve to twenty rows is not a list you search, and a
    // sort would only ever lock the handles. With nothing narrowing, the visible
    // rows ARE the array — which is the whole condition `canReorder` checks.
    query: EMPTY_QUERY,
    change,
  });

  function add() {
    const name = fresh.trim();
    if (name === '' || clash) return;
    change((d) => addSubject(d, name));
    setFresh('');
  }

  async function remove(subject: string) {
    const users = subjectTeachers(state, subject);
    if (users.length > 0) {
      await alert({
        title: t('"{ad}" branşı kullanılıyor', { ad: subjectLabel(subject) }),
        tone: 'warn',
        body: t(
          '{n} öğretmen bu branşta ({kimler}). Önce onların branşını değiştirin, sonra bu branşı silin.',
          { n: users.length, kimler: users.map((x) => x.short).join(', ') },
        ),
      });
      return;
    }
    if (
      !(await confirm({
        title: t('"{ad}" branşı listeden çıkarılacak', { ad: subjectLabel(subject) }),
        body: t('Hiçbir öğretmen bu branşta değil, yani başka bir şey etkilenmiyor.'),
        confirmLabel: t('Çıkar'),
        danger: true,
      }))
    ) {
      return;
    }
    change((d) => deleteSubject(d, subject));
  }

  return (
    <div className="panel step-panel">
      <div className="panel-head">
        <h2>{t('Branşlar ({n})', { n: options.length })}</h2>
      </div>
      <p className="hint">
        <T k="Öğretmen eklerken branş **bu listeden** seçilir, elle yazılmaz. Böylece aynı branş iki farklı yazımla iki branşa dönüşmez. Kısaltma ızgarada ve yazdırılan sayfada görünür; yalnızca **değiştirdikleriniz** saklanır. Satırları tutamağından sürükleyerek (ya da tutamak seçiliyken ok tuşlarıyla) sıralayabilirsiniz. Öğretmen eklerken açılan liste bu sırada gelir." />
      </p>

      <div className="form-row">
        <input
          type="text"
          placeholder={t('Yeni branş (örn. Robotik)')}
          aria-label={t('Yeni branş')}
          value={fresh}
          onChange={(e) => setFresh(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
          }}
        />
        <button className="btn" disabled={fresh.trim() === '' || clash} onClick={add}>{t('Ekle')}</button>
        {clash && <span className="hint">{t('Bu branş listede zaten var.')}</span>}
      </div>

      {/* Said out loud, because a keyboard move happens somewhere the eye
          is not necessarily following. Same markup ListTools uses. */}
      <span className="list-said" role="status" aria-live="polite">
        {order.notice}
      </span>

      <div className="table-scroll">
      <table className="list">
        <thead>
          <tr>
            {order.head}
            <th className="w-col-xl">{t('Branş')}</th>
            {/* --w-col-sm, the number Teachers measured for the same box:
                the heading asks for 78 px and the box holds "Mat". */}
            <th className="w-col-sm">{t('Kısaltma')}</th>
            <th className="num">{t('Öğretmen')}</th>
            {/* The "varsayılan" note. --w-col-lg and not xl: it holds
                "varsayılanı: Mat", and at xl it was as wide as the name
                column beside it and read like a second one. */}
            <th className="w-col-lg" />
            <th className="w-col-md" />
          </tr>
        </thead>
        <tbody ref={order.bodyRef}>
          {state.settings.subjects.map((subject, i) => (
            <SubjectRow
              key={subjectKey(subject)}
              subject={subject}
              state={state}
              change={change}
              inList
              grip={order.grip(i, subject)}
              onRemove={() => remove(subject)}
            />
          ))}
        </tbody>
        {strays.length > 0 && (
          <tbody>
            {strays.map((subject) => (
              <SubjectRow
                key={subjectKey(subject)}
                subject={subject}
                state={state}
                change={change}
                inList={false}
                // No number and no handle: these rows are not IN the
                // ordered list, so numbering them would count a sequence
                // they are not part of. Two empty cells keep the columns
                // lined up with the table above.
                grip={
                  <>
                    <td className="row-no" />
                    <td className="grip-col" />
                  </>
                }
                onRemove={() => remove(subject)}
              />
            ))}
          </tbody>
        )}
      </table>
      </div>
    </div>
  );
}
