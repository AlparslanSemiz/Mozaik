// Step: the classes. A class is a closed set of students, so two classes never
// clash with each other — only through a shared room.

import { useState } from 'react';
import { parseClasses } from '../../import';
import ColorPick from '../ColorPick';
import {
  addClass,
  addClassesFromRows,
  deleteClass,
  deletionSummary,
  updateClass,
  weeklyLoad,
} from '../../entities';
import Paste from './Paste';
import type { PanelProps } from '../props';

export default function Classes({ state, change }: PanelProps) {
  const [newClass, setNewClass] = useState({ name: '', roomId: '' });
  const dayCount = state.settings.days.length;
  const hourCount = state.settings.hours.length;

  return (
    <div className="panel step-panel">
      <h2>Sınıflar ({state.classes.length})</h2>
      <div className="form-row">
        <input
          type="text"
          placeholder="Sınıf adı, örn. 510"
          value={newClass.name}
          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
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
        <button
          className="btn"
          disabled={newClass.name.trim() === ''}
          onClick={() => {
            change((d) => addClass(d, newClass.name, newClass.roomId || null));
            setNewClass({ name: '', roomId: newClass.roomId });
          }}
        >
          Ekle
        </button>
        <Paste
          title="Sınıfları yapıştır"
          example="Sınıf adı · Derslik adı"
          parse={parseClasses}
          rowText={(x) => `${x.name}${x.roomName ? ` → ${x.roomName} dersliği` : ''}`}
          onAdd={(rows) => change((d) => addClassesFromRows(d, rows))}
        />
      </div>

      {state.classes.length > 0 && (
        <table className="list">
          <thead>
            <tr>
              <th>Renk</th>
              <th>Ad</th>
              <th className="w-col-xl">Derslik</th>
              <th className="w-col-md">Ders saati</th>
              <th className="w-col-md" />
            </tr>
          </thead>
          <tbody>
            {state.classes.map((c) => (
              <tr key={c.id}>
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
                  <button
                    className="btn danger"
                    onClick={() => {
                      if (!window.confirm(deletionSummary(state, 'class', c.id))) return;
                      change((d) => deleteClass(d, c.id));
                    }}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
