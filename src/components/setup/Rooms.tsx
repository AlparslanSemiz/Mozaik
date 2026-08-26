// Step: the rooms. A room is a fixed property of a class, never picked while
// placing a lesson — but two classes sharing one room may not clash.

import { useMemo, useState } from 'react';
import ListTools from '../ListTools';
import { useRowOrder } from '../useRowOrder';
import { applyList, byNumberThen, compareTr, EMPTY_QUERY } from '../../listview';
import type { ListConfig, ListQuery } from '../../listview';
import { roomClasses, weeklyLoad } from '../../entities';
import type { Room } from '../../types';
import { PanelRight } from 'lucide-react';
import { useInspect } from '../Inspector';
import { useDialogs } from '../Dialogs';
import { parseRooms } from '../../import';
import { addRoom, deletionQuestion, deleteRoom, updateRoom } from '../../entities';
import Paste from './Paste';
import type { PanelProps } from '../props';

export default function Rooms({ state, change }: PanelProps) {
  const { confirm } = useDialogs();
  const inspect = useInspect();
  const [query, setQuery] = useState<ListQuery>(EMPTY_QUERY);

  const listCfg = useMemo<ListConfig<Room>>(
    () => ({
      haystack: (r) => `${r.name} ${roomClasses(state, r.id).map((c) => c.name).join(' ')}`,
      sorts: [
        { id: 'ad', label: 'Ada göre', cmp: (a, b) => compareTr(a.name, b.name) },
        { id: 'yuk', label: 'Ders yüküne göre (çok → az)', cmp:
            byNumberThen((r) => weeklyLoad(state, 'room', r.id), (r) => r.name) },
        { id: 'sinif', label: 'Sınıf sayısına göre (çok → az)', cmp:
            byNumberThen((r) => roomClasses(state, r.id).length, (r) => r.name) },
      ],
    }),
    [state],
  );
  const shown = applyList(state.rooms, query, listCfg);
  const order = useRowOrder({
    kind: 'rooms',
    count: state.rooms.length,
    query,
    change,
  });
  const [newRoom, setNewRoom] = useState('');

  return (
    <div className="panel step-panel">
      <h2>Derslikler ({state.rooms.length})</h2>
      <p className="hint">
        Her sınıfın sabit odası. İki sınıf aynı dersliği paylaşıyorsa aynı saate
        konamazlar. Dersliği olmayan sınıflar için bu kontrol yapılmaz.
      </p>
      <div className="form-row">
        <input
          type="text"
          value={newRoom}
          placeholder="Derslik adı, örn. A"
          onChange={(e) => setNewRoom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newRoom.trim() !== '') {
              change((d) => addRoom(d, newRoom));
              setNewRoom('');
            }
          }}
        />
        <button
          className="btn"
          disabled={newRoom.trim() === ''}
          onClick={() => {
            change((d) => addRoom(d, newRoom));
            setNewRoom('');
          }}
        >
          Ekle
        </button>
        <Paste
          title="Derslikleri yapıştır"
          example="Derslik adı (her satırda bir tane)"
          parse={parseRooms}
          rowText={(x) => x.name}
          onAdd={(rows) => change((d) => rows.reduce((acc, x) => addRoom(acc, x.name), d))}
        />
      </div>

      {state.rooms.length > 0 && (
        <ListTools
          items={state.rooms}
          query={query}
          setQuery={setQuery}
          config={listCfg}
          shown={shown.length}
          noun="derslik"
          notice={order.notice}
        />
      )}

      {state.rooms.length > 0 && shown.length === 0 && (
        <p className="hint">Bu aramaya uyan derslik yok.</p>
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
              {/* The handle gets a column of its own: squeezed in beside
                  something else, half of it belongs to the neighbour. */}
              <th className="grip-col" />
              <th>Ad</th>
              <th className="w-col-lg">Sınıf sayısı</th>
              <th className="w-col-md" />
            </tr>
          </thead>
          <tbody ref={order.bodyRef}>
            {shown.map((r, i) => (
              <tr key={r.id} data-row-name={r.name}>
                {order.grip(i, r.name)}
                <td>
                  <input
                    type="text"
                    defaultValue={r.name}
                    onBlur={(e) => change((d) => updateRoom(d, r.id, e.target.value))}
                  />
                </td>
                <td>{state.classes.filter((c) => c.roomId === r.id).length}</td>
                <td>
                  <div className="form-row nowrap">
                  {/* Its whole week, its load and what it is tied to, without
                      leaving the list. The information was always there; it
                      was spread over four tabs. */}
                  <button
                    className="btn icon"
                    aria-label={`${r.name} bilgileri`}
                    title="Bilgileri ve haftalık programı"
                    onClick={() => inspect('room', r.id)}
                  >
                    <PanelRight size={16} strokeWidth={2} />
                  </button>
                  <button
                    className="btn danger"
                    onClick={async () => {
                      const q = deletionQuestion(state, 'room', r.id);
                      if (!(await confirm({ title: q.title, body: q.cost, confirmLabel: 'Sil', danger: true })))
                        return;
                      change((d) => deleteRoom(d, r.id));
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
