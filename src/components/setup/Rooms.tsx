// Step: the rooms. A room is a fixed property of a class, never picked while
// placing a lesson — but two classes sharing one room may not clash.

import { useState } from 'react';
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
        <table className="list">
          <thead>
            <tr>
              <th>Ad</th>
              <th className="w-col-lg">Sınıf sayısı</th>
              <th className="w-col-md" />
            </tr>
          </thead>
          <tbody>
            {state.rooms.map((r) => (
              <tr key={r.id}>
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
      )}
    </div>
  );
}
