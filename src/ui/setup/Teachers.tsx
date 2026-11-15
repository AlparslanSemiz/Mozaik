// Step: the teachers. Every teacher has exactly ONE subject (docs/WORKLOG.md);
// the three limit boxes are per-teacher exceptions to the school-wide rules.

import { useMemo, useState } from 'react';
import { applyList, EMPTY_QUERY, type ListQuery } from '../../pure/listview';
import { duplicateShorts, subjectOptions } from '../../pure/entities';
import type { Id } from '../../leaf/model';
import { type PanelProps, T, useT } from '../common';
import { ListTools, useRowOrder } from '../lists';
import { teacherListConfig } from '../../pure/lists';
import { TeacherForm } from './TeacherForm';
import { TeacherRow } from './TeacherRow';

export default function Teachers({ state, change }: PanelProps) {
  const t = useT();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);

  // Twenty-five rows is where reading a column stops working, and the reader
  // asked for both halves of this: "listeleri ... grupça filtreleyebilelim"
  // and "sıralama ... branşa göre, isme göre vesaire".
  const listCfg = useMemo(() => teacherListConfig(state, t), [state, t]);
  const shown = applyList(state.teachers, query, listCfg);
  const order = useRowOrder({
    kind: 'teachers',
    count: state.teachers.length,
    items: state.teachers,
    query,
    change,
  });
  // Which rows have been ASKED the second-subject question and answered "yes"
  // but not yet picked one. Nothing is written to `State` until a subject is
  // chosen, so a mis-click costs a click back and not a data change.
  const [opening, setOpening] = useState<ReadonlySet<Id>>(new Set());
  const subjects = subjectOptions(state);

  const clashes = duplicateShorts(state.teachers);

  return (
    <>
      <TeacherForm state={state} change={change} />

      <div className="panel step-panel">
        <h2>{t('Öğretmenler ({n})', { n: state.teachers.length })}</h2>

        {/* About the ROWS, not about adding: two teachers already on the list
            wearing one short form. It belongs over the list it is describing. */}
        {clashes.length > 0 && (
          <div className="warn-box">
            <T k="**Aynı kısaltma birden çok öğretmende:** ızgarada iki satır ayırt edilemez." />
            {clashes.map((c) => (
              <div key={c.short}>
                <b>{c.short}</b> · {c.names.join(', ')}
              </div>
            ))}
          </div>
        )}

        {state.teachers.length > 0 && (
          <ListTools
            items={state.teachers}
            query={query}
            setQuery={setQuery}
            config={listCfg}
            shown={shown.length}
            noun="öğretmen"
            countKey="{n} öğretmen"
            notice={order.notice}
          />
        )}

        {state.teachers.length > 0 && shown.length === 0 && (
          <p className="hint">{t('Bu aramaya uyan öğretmen yok.')}</p>
        )}

        {/* Eleven columns do not fit a 100 %-wide table at --ui-scale
            1.5: the browser answers by crushing whichever column can
            still shrink, and at 150 % that was the NAME — 232 px down
            to 26 px, measured. Wide content scrolls in its own box
            rather than squeezing the reader's own words out. */}
        {shown.length > 0 && (
          <div className="table-scroll">
            <table className="list">
              <thead>
                <tr>
                  {order.head}
                  <th className="w-col-xs">{t('Renk')}</th>
                  <th className="w-col-xl">{t('Ad')}</th>
                  {/* --w-col-lg was 16ch — 144 px at 125 %, for a heading that
                    asks for 78 and a box that holds "MÇ". This column alone was
                    the last 54 px of the sideways scroll. */}
                  <th className="w-col-sm">{t('Kısaltma')}</th>
                  <th>{t('Branş')}</th>
                  {/* Most of the staff hold one subject, so this column is usually
                    a row of small buttons rather than a row of dropdowns — see
                    the cell. It still gets a heading: a column of controls with
                    no name is a column nobody reads. */}
                  <th title={t('İkinci branş')}>{t('2. branş')}</th>
                  {/* No width class: the <select>'s own longest option
                    ("Belirtilmemiş") is wider than any ladder step this column
                    deserves, so the box decides and the column follows it
                    (pitfall 34). --w-col-md was 12 px more than that. */}
                  <th>{t('Cinsiyet')}</th>
                  {/* Where Çıktı sends the teacher's week (schema v17). Last of
                    the person's own fields, before the rule boxes. */}
                  {/* --w-col-xs, and the box's floor 6ch (styles.css): the
                    table is `max-content`, so a column is as wide as its
                    floors, and one more 10ch column was the 14 px the table
                    spilled past its panel at 125 % (kurulum.spec.ts 65, CI).
                    A long address scrolls inside its box. */}
                  <th className="w-col-xs">{t('E-posta')}</th>
                  <th className="num" title={t('Art arda en fazla kaç saat')}>
                    {t('Art arda')}
                  </th>
                  <th className="num" title={t('Bir günde en fazla kaç saat')}>
                    {t('Günde ↑')}
                  </th>
                  <th className="num" title={t('Geldiği gün en az kaç saat')}>
                    {t('Günde ↓')}
                  </th>
                  <th className="w-col-sm">{t('Ders saati')}</th>
                  <th className="w-col-md" />
                </tr>
              </thead>
              <tbody ref={order.bodyRef}>
                {shown.map((teacher, i) => (
                  <TeacherRow
                    key={teacher.id}
                    state={state}
                    change={change}
                    teacher={teacher}
                    grip={order.grip(i, teacher.name)}
                    subjects={subjects}
                    opening={opening}
                    setOpening={setOpening}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
