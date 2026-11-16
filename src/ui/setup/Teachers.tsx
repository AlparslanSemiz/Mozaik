// Step: the teachers, as text. Since 2026-11-16 (Sadeleşme, K5) a row is read,
// not typed into: the name opens the teacher's page (`InspectorSheet.tsx`),
// and everything that used to be a box on the row — e-mail, gender, second
// subject, the three limits, the colour, Sil — is on that page. A row was
// twelve controls and the father could not find the one he wanted in them.

import { useDeferredValue, useMemo, useState } from 'react';
import { applyList, EMPTY_QUERY, type ListQuery } from '../../pure/listview';
import {
  addTeachersFromRows,
  duplicateShorts,
  genderLabel,
  subjectLabel,
  teacherSubjects,
  weeklyLoad,
} from '../../pure/entities';
import { type PanelProps, T, useT } from '../common';
import { ListTools, Paste, useRowOrder } from '../lists';
import { teacherListConfig } from '../../pure/lists';
import { parseTeachers } from '../../pure/io';
import { useInspect } from '../program';
import { PersonRow } from './PersonRow';

export default function Teachers({ state, change }: PanelProps) {
  const t = useT();
  const inspect = useInspect();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);
  const [pasteOpen, setPasteOpen] = useState(false);

  // Twenty-five rows is where reading a column stops working, and the reader
  // asked for both halves of this: "listeleri ... grupça filtreleyebilelim"
  // and "sıralama ... branşa göre, isme göre vesaire".
  const listCfg = useMemo(() => teacherListConfig(state, t), [state, t]);
  // The box answers each key at once, the rows follow a moment later.
  const listed = useDeferredValue(query);
  const shown = useMemo(
    () => applyList(state.teachers, listed, listCfg),
    [state.teachers, listed, listCfg],
  );
  const order = useRowOrder({
    kind: 'teachers',
    count: state.teachers.length,
    items: state.teachers,
    query: listed,
    change,
  });
  const clashes = duplicateShorts(state.teachers);

  // The same elements while only the box changed, so React skips the rows.
  const { grip } = order;
  const rows = useMemo(
    () =>
      shown.map((teacher, i) => (
        <PersonRow
          key={teacher.id}
          state={state}
          kind="teacher"
          id={teacher.id}
          name={teacher.name}
          color={teacher.color}
          grip={grip(i, teacher.name)}
          cells={[
            teacher.short,
            teacherSubjects(teacher).map(subjectLabel).join(' · '),
            weeklyLoad(state, 'teacher', teacher.id),
          ]}
        />
      )),
    [shown, state, grip],
  );

  return (
    <div className="panel step-panel">
      {/* No count: Okul's strip says it, once per screen (Sadeleşme). */}
      <div className="panel-head">
        <h2>{t('Öğretmenler')}</h2>
        <button className="btn" onClick={() => setPasteOpen(true)}>
          {t("Excel'den yapıştır")}
        </button>
      </div>

      <Paste
        open={pasteOpen}
        close={() => setPasteOpen(false)}
        title={t('Öğretmenleri yapıştır')}
        example={t('Ad Soyad · Kısa ad · Branş · Cinsiyet · İkinci branş · E-posta')}
        parse={parseTeachers}
        rowText={(x) =>
          `${x.name} (${x.short}) · ${subjectLabel(x.subject)}` +
          (x.subject2 === '' ? '' : ` + ${subjectLabel(x.subject2)}`) +
          (x.gender === '' ? '' : ` · ${genderLabel(x.gender)}`) +
          (x.email === '' ? '' : ` · ${x.email}`)
        }
        onAdd={(rows) => change((d) => addTeachersFromRows(d, rows))}
      />

      {/* About the ROWS: two teachers on the list wearing one short form. */}
      {clashes.length > 0 && (
        <div className="warn-box">
          <T k="**Aynı kısa ad birden çok öğretmende:** ızgarada iki satır ayırt edilemez." />
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

      {shown.length > 0 && (
        <div className="table-scroll">
          <table className="list person-list">
            <thead>
              <tr>
                {order.head}
                <th className="w-col-xl">{t('Ad')}</th>
                <th>{t('Kısa ad')}</th>
                <th>{t('Branş')}</th>
                <th className="num">{t('Ders saati')}</th>
                <th>{t('Durum')}</th>
              </tr>
            </thead>
            <tbody ref={order.bodyRef}>{rows}</tbody>
          </table>
        </div>
      )}

      {/* One row at the end of the list, where the next name goes. */}
      <button className="btn add-row" onClick={() => inspect('teacher', '')}>
        {t('+ Yeni öğretmen')}
      </button>
    </div>
  );
}
