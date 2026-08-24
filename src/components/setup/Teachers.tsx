// Step: the teachers. Every teacher has exactly ONE subject (docs/STATUS.md);
// the three limit boxes are per-teacher exceptions to the school-wide rules.

import { useState } from 'react';
import { parseTeachers } from '../../import';
import { COLOR_COUNT } from '../../types';
import {
  addTeacher,
  deleteTeacher,
  deletionSummary,
  duplicateShorts,
  makeShort,
  setTeacherLimit,
  updateTeacher,
  weeklyLoad,
} from '../../entities';
import LimitBox from './LimitBox';
import Paste from './Paste';
import type { SetupProps } from './props';

export default function Teachers({ state, change }: SetupProps) {
  const [newTeacher, setNewTeacher] = useState({ name: '', short: '', subject: '' });

  // Left empty, the short form is derived — so show what it will be.
  const suggested = newTeacher.name.trim() === '' ? 'Kısaltma' : makeShort(newTeacher.name);
  const clashes = duplicateShorts(state.teachers);

  return (
    <div className="panel">
      <h2>Öğretmenler ({state.teachers.length})</h2>
      <p className="hint">
        Her öğretmenin tek branşı vardır. Kısaltma ızgarada satır başlığı olarak
        görünür, kısa tutun (örn. MÇ). Renk otomatik atanır. Sağdaki üç kutu bu
        öğretmene özel sınırdır; <b>boş bırakılırsa Kurallar bölümündeki sayı</b>{' '}
        geçerli olur.
      </p>
      <div className="form-row">
        <input
          type="text"
          placeholder="Ad Soyad"
          value={newTeacher.name}
          onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
        />
        <input
          type="text"
          aria-label="Kısaltma"
          placeholder={suggested}
          title="Boş bırakırsanız addan üretilir"
          className="text-sm"
          value={newTeacher.short}
          onChange={(e) => setNewTeacher({ ...newTeacher, short: e.target.value })}
        />
        <input
          type="text"
          placeholder="Branş"
          value={newTeacher.subject}
          onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
        />
        <button
          className="btn"
          disabled={newTeacher.name.trim() === ''}
          onClick={() => {
            change((d) => addTeacher(d, newTeacher));
            setNewTeacher({ name: '', short: '', subject: '' });
          }}
        >
          Ekle
        </button>
        <Paste
          title="Öğretmenleri yapıştır"
          example="Ad Soyad · Kısaltma · Branş"
          parse={parseTeachers}
          rowText={(x) => `${x.name} (${x.short}) — ${x.subject}`}
          onAdd={(rows) => change((d) => rows.reduce((acc, x) => addTeacher(acc, x), d))}
        />
      </div>

      {clashes.length > 0 && (
        <div className="warn-box">
          <b>Aynı kısaltma birden çok öğretmende:</b> ızgarada iki satır ayırt edilemez.
          {clashes.map((c) => (
            <div key={c.short}>
              <b>{c.short}</b> — {c.names.join(', ')}
            </div>
          ))}
        </div>
      )}

      {state.teachers.length > 0 && (
        <table className="list">
          <thead>
            <tr>
              <th style={{ width: 44 }}>Renk</th>
              <th>Ad</th>
              <th style={{ width: 110 }}>Kısaltma</th>
              <th>Branş</th>
              <th className="num" title="Art arda en fazla kaç saat">
                Art arda
              </th>
              <th className="num" title="Bir günde en fazla kaç saat">
                Günde ↑
              </th>
              <th className="num" title="Geldiği gün en az kaç saat">
                Günde ↓
              </th>
              <th style={{ width: 90 }}>Ders saati</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {state.teachers.map((t) => (
              <tr key={t.id}>
                <td>
                  <select
                    value={t.color}
                    onChange={(e) =>
                      change((d) => updateTeacher(d, t.id, { color: Number(e.target.value) }))
                    }
                    style={{ background: `var(--color-${t.color})`, width: 44 }}
                    title="Renk"
                  >
                    {Array.from({ length: COLOR_COUNT }, (_, i) => (
                      <option key={i} value={i}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    defaultValue={t.name}
                    onBlur={(e) =>
                      change((d) => updateTeacher(d, t.id, { name: e.target.value.trim() }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="text-sm"
                    defaultValue={t.short}
                    onBlur={(e) =>
                      change((d) => updateTeacher(d, t.id, { short: e.target.value.trim() }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    defaultValue={t.subject}
                    onBlur={(e) =>
                      change((d) => updateTeacher(d, t.id, { subject: e.target.value.trim() }))
                    }
                  />
                </td>
                <td>
                  <LimitBox
                    value={t.limits.maxConsecutive}
                    fallback={state.settings.limits.maxConsecutive}
                    title={`${t.short} art arda en fazla kaç saat`}
                    onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'maxConsecutive', v))}
                  />
                </td>
                <td>
                  <LimitBox
                    value={t.limits.maxPerDay}
                    fallback={state.settings.limits.maxPerDay}
                    title={`${t.short} günde en fazla kaç saat`}
                    onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'maxPerDay', v))}
                  />
                </td>
                <td>
                  <LimitBox
                    value={t.limits.minPerDay}
                    fallback={state.settings.limits.minPerDay}
                    title={`${t.short} geldiği gün en az kaç saat`}
                    onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'minPerDay', v))}
                  />
                </td>
                <td>{weeklyLoad(state, 'teacher', t.id)}</td>
                <td>
                  <button
                    className="btn danger"
                    onClick={() => {
                      if (!window.confirm(deletionSummary(state, 'teacher', t.id))) return;
                      change((d) => deleteTeacher(d, t.id));
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
