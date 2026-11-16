// Step: the classes, as text. A class is a closed set of students, so two
// classes never clash with each other — only through a shared room. Since
// 2026-11-16 (Sadeleşme, K5) the name opens the class's page, where its room,
// colour, closed hours, lessons, limit and Sil are.

import { useMemo, useState } from 'react';
import { applyList, EMPTY_QUERY, type ListQuery } from '../../pure/listview';
import { addClassesFromRows, roomName, weeklyLoad } from '../../pure/entities';
import { type PanelProps, useT } from '../common';
import { parseClasses } from '../../pure/io';
import { ListTools, Paste, useRowOrder } from '../lists';
import { classListConfig } from '../../pure/lists';
import { useInspect } from '../program';
import { PersonRow } from './PersonRow';

export default function Classes({ state, change }: PanelProps) {
  const t = useT();
  const inspect = useInspect();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);
  const [pasteOpen, setPasteOpen] = useState(false);

  const listCfg = useMemo(() => classListConfig(state, t), [state, t]);
  const shown = applyList(state.classes, query, listCfg);
  const order = useRowOrder({
    kind: 'classes',
    count: state.classes.length,
    items: state.classes,
    query,
    change,
  });
  const week = state.settings.days.length * state.settings.hours.length;

  return (
    <div className="panel step-panel">
      {/* No count: Okul's strip says it, once per screen (Sadeleşme). */}
      <div className="panel-head">
        <h2>{t('Sınıflar')}</h2>
        <button className="btn" onClick={() => setPasteOpen(true)}>
          {t("Excel'den yapıştır")}
        </button>
      </div>

      <Paste
        open={pasteOpen}
        close={() => setPasteOpen(false)}
        title={t('Sınıfları yapıştır')}
        example={t('Sınıf adı · Derslik adı')}
        parse={parseClasses}
        rowText={(x) =>
          x.roomName ? t('{ad} → {derslik} dersliği', { ad: x.name, derslik: x.roomName }) : x.name
        }
        onAdd={(rows) => change((d) => addClassesFromRows(d, rows))}
      />

      {state.classes.length > 0 && (
        <ListTools
          items={state.classes}
          query={query}
          setQuery={setQuery}
          config={listCfg}
          shown={shown.length}
          noun="sınıf"
          countKey="{n} sınıf"
          notice={order.notice}
        />
      )}

      {state.classes.length > 0 && shown.length === 0 && (
        <p className="hint">{t('Bu aramaya uyan sınıf yok.')}</p>
      )}

      {shown.length > 0 && (
        <div className="table-scroll">
          <table className="list person-list">
            <thead>
              <tr>
                {order.head}
                <th className="w-col-xl">{t('Ad')}</th>
                <th>{t('Derslik')}</th>
                <th>{t('Ders saati')}</th>
                <th>{t('Kapalı gün')}</th>
              </tr>
            </thead>
            <tbody ref={order.bodyRef}>
              {shown.map((c, i) => (
                <PersonRow
                  key={c.id}
                  state={state}
                  kind="class"
                  id={c.id}
                  name={c.name}
                  color={c.color}
                  grip={order.grip(i, c.name)}
                  cells={[
                    roomName(state, c.roomId) || '—',
                    `${weeklyLoad(state, 'class', c.id)} / ${week}`,
                  ]}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* One row at the end of the list, where the next class goes. */}
      <button className="btn add-row" onClick={() => inspect('class', '')}>
        {t('+ Yeni sınıf')}
      </button>
    </div>
  );
}
