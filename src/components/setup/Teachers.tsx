// Step: the teachers. Every teacher has exactly ONE subject (docs/STATUS.md);
// the three limit boxes are per-teacher exceptions to the school-wide rules.

import { useState } from 'react';
import { parseTeachers } from '../../import';
import { PALETTE_SIZE, paletteColor } from '../../palette';
import {
  addSubject,
  addTeacher,
  addTeachersFromRows,
  deleteTeacher,
  deletionSummary,
  duplicateShorts,
  makeShort,
  setTeacherLimit,
  subjectOptions,
  updateTeacher,
  weeklyLoad,
} from '../../entities';
import LimitBox from '../LimitBox';
import Paste from './Paste';
import type { PanelProps } from '../props';

/** Sentinel option value: picking it opens a box instead of setting a subject. */
const NEW = '\u0000yeni';

export default function Teachers({ state, change }: PanelProps) {
  const [newTeacher, setNewTeacher] = useState({ name: '', short: '', subject: '' });
  const [freshSubject, setFreshSubject] = useState<string | null>(null);
  const subjects = subjectOptions(state);

  // Left empty, the short form is derived — so show what it will be.
  const suggested = newTeacher.name.trim() === '' ? 'Kısaltma' : makeShort(newTeacher.name);
  const clashes = duplicateShorts(state.teachers);

  /** What the Ekle button will actually store as the branch. */
  function subjectOf(): string {
    return (freshSubject === null ? newTeacher.subject : freshSubject).trim();
  }

  return (
    <div className="panel">
      <h2>Öğretmenler ({state.teachers.length})</h2>
      <p className="hint">
        Her öğretmenin tek branşı vardır ve <b>listeden seçilir</b> — listede
        yoksa “+ Yeni branş…” ile eklenir. Kısaltma ızgarada satır başlığı olarak
        görünür, kısa tutun (örn. MÇ). Renk otomatik atanır, kimseyle çakışmaz. Sağdaki üç kutu bu
        öğretmene özel sınırdır; <b>boş bırakılırsa Ayarlar → Kurallar'daki sayı</b>{' '}
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
        {/* A dropdown, not free text: typed "Matemtik" used to become a second
            subject that still printed as "Mat" and could not be told from the
            first one on paper. New subjects are added on the spot. */}
        <select
          aria-label="Branş"
          value={freshSubject === null ? newTeacher.subject : NEW}
          onChange={(e) => {
            if (e.target.value === NEW) {
              setFreshSubject('');
              return;
            }
            setFreshSubject(null);
            setNewTeacher({ ...newTeacher, subject: e.target.value });
          }}
        >
          <option value="">Branş seçin</option>
          {subjects.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
          <option value={NEW}>+ Yeni branş…</option>
        </select>
        {freshSubject !== null && (
          <input
            type="text"
            autoFocus
            placeholder="Yeni branşın adı"
            aria-label="Yeni branşın adı"
            value={freshSubject}
            onChange={(e) => setFreshSubject(e.target.value)}
          />
        )}
        <button
          className="btn"
          disabled={newTeacher.name.trim() === '' || subjectOf() === ''}
          onClick={() => {
            const subject = subjectOf();
            change((d) => addTeacher(addSubject(d, subject), { ...newTeacher, subject }));
            setNewTeacher({ name: '', short: '', subject: '' });
            setFreshSubject(null);
          }}
        >
          Ekle
        </button>
        <Paste
          title="Öğretmenleri yapıştır"
          example="Ad Soyad · Kısaltma · Branş"
          parse={parseTeachers}
          rowText={(x) => `${x.name} (${x.short}) — ${x.subject}`}
          onAdd={(rows) => change((d) => addTeachersFromRows(d, rows))}
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
                    style={{ background: paletteColor(t.color), width: 44 }}
                    aria-label={`${t.short} rengi`}
                    title="Renk"
                  >
                    {Array.from({ length: PALETTE_SIZE }, (_, i) => (
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
                  <select
                    aria-label={`${t.short} branşı`}
                    value={t.subject}
                    onChange={(e) =>
                      change((d) => updateTeacher(d, t.id, { subject: e.target.value }))
                    }
                  >
                    {/* subjectOptions already contains this teacher's subject
                        even when the school list does not — otherwise the
                        dropdown would silently change it on first render. */}
                    {subjects.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
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
