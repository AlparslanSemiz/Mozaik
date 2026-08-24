// Step: the lessons. One lesson = one class taking N weekly hours from one
// teacher. A block is not a separate entity: it is `blockSize` here.

import { useState } from 'react';
import { parseLessons } from '../../import';
import { paletteColor } from '../../palette';
import {
  addLesson,
  addLessonsFromRows,
  deleteLesson,
  deletionSummary,
  updateLesson,
} from '../../entities';
import LimitBox from '../LimitBox';
import Paste from './Paste';
import Field from '../Field';
import type { PanelProps } from '../props';

export default function Lessons({ state, change }: PanelProps) {
  const [newLesson, setNewLesson] = useState({
    classId: '',
    teacherId: '',
    hours: '4',
    blockSize: '1',
  });

  return (
    <div className="panel">
      <h2>Dersler ({state.lessons.length})</h2>
      <p className="hint">
        Bir ders = bir sınıfın, bir öğretmenden aldığı haftalık saat. <b>Blok</b>,
        o dersin arka arkaya kaç saat işleneceğidir (1, 2 veya 3). <b>Günde ↑</b> bu
        dersin bir günde en fazla kaç saat olabileceğidir; boşsa Ayarlar → Kurallar'daki
        sayı geçerli olur.
      </p>

      {(state.classes.length === 0 || state.teachers.length === 0) && (
        <div className="warn-box">
          Ders eklemek için önce en az bir öğretmen ve bir sınıf girin.
        </div>
      )}

      <div className="form-row">
        <select
          value={newLesson.classId}
          onChange={(e) => setNewLesson({ ...newLesson, classId: e.target.value })}
        >
          <option value="">Sınıf seçin</option>
          {state.classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={newLesson.teacherId}
          onChange={(e) => setNewLesson({ ...newLesson, teacherId: e.target.value })}
        >
          <option value="">Öğretmen seçin</option>
          {state.teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.short} — {t.subject}
            </option>
          ))}
        </select>
        <Field label="Haftalık saat">
          <input
            type="number"
            min={1}
            max={40}
            className="num"
            value={newLesson.hours}
            onChange={(e) => setNewLesson({ ...newLesson, hours: e.target.value })}
          />
        </Field>
        <Field label="Blok">
          <select
            value={newLesson.blockSize}
            onChange={(e) => setNewLesson({ ...newLesson, blockSize: e.target.value })}
          >
            <option value="1">1 saat</option>
            <option value="2">2 saat</option>
            <option value="3">3 saat</option>
          </select>
        </Field>
        <button
          className="btn"
          disabled={newLesson.classId === '' || newLesson.teacherId === ''}
          onClick={() => {
            change((d) =>
              addLesson(d, {
                classId: newLesson.classId,
                teacherId: newLesson.teacherId,
                weeklyHours: Number(newLesson.hours) || 1,
                blockSize: Number(newLesson.blockSize) || 1,
              }),
            );
            setNewLesson({ ...newLesson, classId: '' });
          }}
        >
          Ekle
        </button>
        <Paste
          title="Dersleri yapıştır"
          example="Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok"
          parse={parseLessons}
          rowText={(x) =>
            `${x.className} — ${x.teacher}: ${x.weeklyHours} saat, ${x.blockSize}'li blok`
          }
          onAdd={(rows) =>
            change((d) => {
              const { state: next, missing } = addLessonsFromRows(d, rows);
              if (missing.length > 0) {
                window.alert(
                  `Şu satırlar eklenemedi çünkü sınıf veya öğretmen bulunamadı:\n\n${missing.join('\n')}\n\nÖnce onları ekleyip tekrar deneyin.`,
                );
              }
              return next;
            })
          }
        />
      </div>

      {state.lessons.length > 0 && (
        <table className="list">
          <thead>
            <tr>
              <th>Sınıf</th>
              <th>Öğretmen</th>
              <th style={{ width: 110 }}>Haftalık saat</th>
              <th style={{ width: 110 }}>Blok</th>
              <th style={{ width: 90 }} title="Bu ders bir günde en fazla kaç saat">
                Günde ↑
              </th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {state.lessons.map((x) => {
              const group = state.classes.find((c) => c.id === x.classId);
              const teacher = state.teachers.find((t) => t.id === x.teacherId);
              return (
                <tr key={x.id}>
                  <td>{group?.name ?? '?'}</td>
                  <td>
                    <span
                      className="color-dot"
                      style={{ background: paletteColor(teacher?.color ?? 0) }}
                    />{' '}
                    {teacher?.short ?? '?'} — {teacher?.subject ?? ''}
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      className="num"
                      defaultValue={x.weeklyHours}
                      onBlur={(e) =>
                        change((d) =>
                          updateLesson(d, x.id, {
                            weeklyHours: Math.max(1, Number(e.target.value) || 1),
                          }),
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={x.blockSize}
                      onChange={(e) =>
                        change((d) =>
                          updateLesson(d, x.id, { blockSize: Number(e.target.value) }),
                        )
                      }
                      title="Blok değiştirilirse bu dersin programdaki yerleşimleri kalkar"
                    >
                      <option value={1}>1 saat</option>
                      <option value={2}>2 saat</option>
                      <option value={3}>3 saat</option>
                    </select>
                  </td>
                  <td>
                    <LimitBox
                      value={x.maxPerDay}
                      fallback={state.settings.limits.maxSameLessonPerDay}
                      title="Bu ders bir günde en fazla kaç saat"
                      onSet={(v) => change((d) => updateLesson(d, x.id, { maxPerDay: v }))}
                    />
                  </td>
                  <td>
                    <button
                      className="btn danger"
                      onClick={() => {
                        if (!window.confirm(deletionSummary(state, 'lesson', x.id))) return;
                        change((d) => deleteLesson(d, x.id));
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
