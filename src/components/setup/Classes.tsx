// Step: the classes. A class is a closed set of students, so two classes never
// clash with each other — only through a shared room.

import { useMemo, useState } from 'react';
import ListTools from '../ListTools';
import { useRowOrder } from '../useRowOrder';
import { applyList, byNumberThen, compareTr, EMPTY_QUERY } from '../../listview';
import type { ListConfig, ListQuery } from '../../listview';
import { roomName } from '../../entities';
import type { ClassGroup } from '../../types';
import { PanelRight } from 'lucide-react';
import { useInspect } from '../Inspector';
import { useDialogs } from '../Dialogs';
import { parseClasses } from '../../import';
import ColorPick from '../ColorPick';
import {
  addClass,
  addClassesFromRows,
  deleteClass,
  deletionQuestion,
  updateClass,
  weeklyLoad,
} from '../../entities';
import Paste from './Paste';
import type { PanelProps } from '../props';

export default function Classes({ state, change }: PanelProps) {
  const { confirm } = useDialogs();
  const inspect = useInspect();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);

  const listCfg = useMemo<ListConfig<ClassGroup>>(
    () => ({
      haystack: (c) => `${c.name} ${roomName(state, c.roomId)}`,
      // Grouping classes by the room they share is the one grouping this
      // screen can offer that Kontrol cannot: it is what makes a room's load
      // legible before it becomes a clash.
      facets: [{ id: 'derslik', label: 'Derslik', of: (c) => (c.roomId === null ? '' : roomName(state, c.roomId)) }],
      sorts: [
        { id: 'ad', label: 'Ada göre', cmp: (a, b) => compareTr(a.name, b.name) },
        { id: 'derslik', label: 'Dersliğe göre', cmp: (a, b) =>
            compareTr(roomName(state, a.roomId), roomName(state, b.roomId)) ||
            compareTr(a.name, b.name) },
        { id: 'yuk', label: 'Ders yüküne göre (çok → az)', cmp:
            byNumberThen((c) => weeklyLoad(state, 'class', c.id), (c) => c.name) },
      ],
    }),
    [state],
  );
  const shown = applyList(state.classes, query, listCfg);
  const order = useRowOrder({
    kind: 'classes',
    count: state.classes.length,
    query,
    change,
  });
  const [newClass, setNewClass] = useState({ name: '', roomId: '' });
  const [pasteOpen, setPasteOpen] = useState(false);
  const dayCount = state.settings.days.length;
  const hourCount = state.settings.hours.length;

  // Enter adds, the way it does in Derslikler and Branşlar. Entering twenty
  // classes is twenty trips to a button otherwise, and the room stays picked
  // because it is usually the same one twice in a row.
  function addNew() {
    if (newClass.name.trim() === '') return;
    change((d) => addClass(d, newClass.name, newClass.roomId || null));
    setNewClass({ name: '', roomId: newClass.roomId });
  }

  return (
    <div className="panel step-panel">
      {/* The paste button rides the HEADING, not the form row: "Excel'den
          yapıştır o bloğun en sağında hatta en sağ üstünde bile olabilir."
          All four panels put it in the same corner, so the shape of a panel
          stays one shape. */}
      <div className="panel-head">
        <h2>Sınıflar ({state.classes.length})</h2>
        <button className="btn" onClick={() => setPasteOpen(true)}>
          Excel'den yapıştır
        </button>
      </div>
      <p className="hint">
        Bir sınıf, aynı programı paylaşan öğrenci grubudur. <b>Derslik</b> sınıfın
        sabit odasıdır ve yerleştirirken seçilmez. Aynı dersliği paylaşan iki
        sınıf aynı saate konamaz. Renk otomatik atanır, kimseyle çakışmaz ve
        satır başındaki nokta ile basılan sayfanın başlığında görünür.
      </p>
      <div className="form-row">
        <input
          type="text"
          placeholder="Sınıf adı, örn. 510"
          value={newClass.name}
          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addNew();
          }}
        />
        <select
          value={newClass.roomId}
          onChange={(e) => setNewClass({ ...newClass, roomId: e.target.value })}
        >
          <option value="">Derslik yok</option>
          {state.rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button className="btn" disabled={newClass.name.trim() === ''} onClick={addNew}>
          Ekle
        </button>
      </div>

      <Paste
        open={pasteOpen}
        close={() => setPasteOpen(false)}
        title="Sınıfları yapıştır"
        example="Sınıf adı · Derslik adı"
        parse={parseClasses}
        rowText={(x) => `${x.name}${x.roomName ? ` → ${x.roomName} dersliği` : ''}`}
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
          notice={order.notice}
        />
      )}

      {state.classes.length > 0 && shown.length === 0 && (
        <p className="hint">Bu aramaya uyan sınıf yok.</p>
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
              <th className="w-col-xs">Renk</th>
              <th className="w-col-xl">Ad</th>
              {/* Narrower than the name beside it, and that is the point: a
                  room is a letter, not a name. The box still has to hold its
                  longest OPTION ("Derslik yok"), which is what --w-col-lg
                  clears — the width is on the <th> because a <select> at
                  `width: 100%` contributes nothing to max-content (pitfall
                  34). */}
              <th className="w-col-lg">Derslik</th>
              <th className="w-col-sm">Ders saati</th>
              <th className="w-col-md" />
            </tr>
          </thead>
          <tbody ref={order.bodyRef}>
            {shown.map((c, i) => (
              <tr key={c.id} data-row-name={c.name}>
                {order.grip(i, c.name)}
                <td>
                  <ColorPick
                    value={c.color}
                    owner={c.name}
                    onChange={(next) =>
                      change((d) => updateClass(d, c.id, { color: next }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    defaultValue={c.name}
                    onBlur={(e) =>
                      change((d) => updateClass(d, c.id, { name: e.target.value.trim() }))
                    }
                  />
                </td>
                <td>
                  <select
                    value={c.roomId ?? ''}
                    aria-label={`${c.name} dersliği`}
                    onChange={(e) =>
                      change((d) => updateClass(d, c.id, { roomId: e.target.value || null }))
                    }
                  >
                    <option value="">Derslik yok</option>
                    {state.rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {weeklyLoad(state, 'class', c.id)}
                  {' / '}
                  {dayCount * hourCount}
                </td>
                <td>
                  <div className="form-row nowrap">
                  {/* Its whole week, its load and what it is tied to, without
                      leaving the list. The information was always there; it
                      was spread over four tabs. */}
                  <button
                    className="btn icon"
                    aria-label={`${c.name} bilgileri`}
                    title="Bilgileri ve haftalık programı"
                    onClick={() => inspect('class', c.id)}
                  >
                    <PanelRight size={16} strokeWidth={2} />
                  </button>
                  <button
                    className="btn danger"
                    onClick={async () => {
                      const q = deletionQuestion(state, 'class', c.id);
                      if (!(await confirm({ title: q.title, body: q.cost, confirmLabel: 'Sil', danger: true })))
                        return;
                      change((d) => deleteClass(d, c.id));
                    }}
                  >
                    Sil
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
