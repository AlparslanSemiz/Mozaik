// Printing: ONE ENTITY PER PAGE.
//
// 7 days x 12 hours = 7 columns x 12 rows, which fits A4 portrait exactly.
// Printing the 84-column main table is impossible (~3 mm per column), so it is
// not attempted.

import { useMemo, useState } from 'react';
import { dayPeriods } from '../bell';
import { buildIndex, closedKey, placementKey } from '../constraints';
import type { State } from '../types';

interface Props {
  state: State;
}

type Scope = 'classes' | 'teachers' | 'both';

export default function Print({ state }: Props) {
  const [scope, setScope] = useState<Scope>('classes');
  const [colored, setColored] = useState(true);
  const ix = useMemo(() => buildIndex(state), [state]);

  // One printed page shows ONE day pattern per column, so the hour column is
  // built from the first day. Days whose long break sits elsewhere still print
  // the right lesson numbers; only the clock in the left column is the first
  // day's. Shown as a range because that is what a wall timetable needs.
  const clock = useMemo(
    () =>
      dayPeriods(
        state.settings.bell,
        state.settings.hours,
        state.settings.days[0]?.longBreakAfter ?? 0,
      ),
    [state.settings],
  );

  if (state.lessons.length === 0) {
    return (
      <div className="main">
        <div className="empty-screen">
          <strong>Yazdırılacak program yok.</strong>
          Önce <b>Kurulum</b> sekmesinden dersleri girip <b>Program</b> sekmesinde
          dizin.
        </div>
      </div>
    );
  }

  const classPages = scope !== 'teachers';
  const teacherPages = scope !== 'classes';

  return (
    <div className="main">
      <div className="panel no-print">
        <h2>Yazdır</h2>
        <p className="hint">
          Her sınıf ve her öğretmen ayrı sayfaya basılır (A4 dikey). Yazdırma
          penceresinde <b>kenar boşlukları: varsayılan</b> ve <b>arka plan grafikleri:
          açık</b> olsun, yoksa renkler çıkmaz.
        </p>
        <div className="form-row">
          <label>
            Ne basılsın{' '}
            <select value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
              <option value="classes">Sınıf programları ({state.classes.length} sayfa)</option>
              <option value="teachers">
                Öğretmen programları ({state.teachers.length} sayfa)
              </option>
              <option value="both">
                İkisi de ({state.classes.length + state.teachers.length} sayfa)
              </option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={colored}
              onChange={(e) => setColored(e.target.checked)}
            />{' '}
            Renkli bas
          </label>
          <button className="btn primary" onClick={() => window.print()}>
            Yazdır
          </button>
        </div>
      </div>

      <div className="print-area">
        {classPages &&
          state.classes.map((group) => (
            <div className="print-page" key={group.id}>
              <h3>
                {state.settings.schoolName !== '' && `${state.settings.schoolName} — `}
                {group.name} sınıfı haftalık ders programı
                {group.roomId != null &&
                  ` — ${ix.roomById.get(group.roomId)?.name ?? ''} dersliği`}
              </h3>
              <table className="print">
                <thead>
                  <tr>
                    <th style={{ width: 92 }}>Saat</th>
                    {state.settings.days.map((day, i) => (
                      <th key={i}>{day.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.settings.hours.map((hour, s) => (
                    <tr key={s}>
                      <th>
                        {hour}
                        <span className="p-clock">
                          {clock[s]?.start ?? ''}–{clock[s]?.end ?? ''}
                        </span>
                      </th>
                      {state.settings.days.map((_, g) => {
                        const lessonId = state.placements[placementKey(group.id, g, s)];
                        const lesson =
                          lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
                        const teacher =
                          lesson === undefined ? undefined : ix.teacherById.get(lesson.teacherId);
                        return (
                          <td
                            key={g}
                            style={
                              colored && teacher !== undefined
                                ? { background: `var(--color-${teacher.color})` }
                                : undefined
                            }
                          >
                            {teacher !== undefined && (
                              <>
                                <span className="p-top">{teacher.subject}</span>
                                <span className="p-bottom">{teacher.short}</span>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {teacherPages &&
          state.teachers.map((teacher) => (
            <div className="print-page" key={teacher.id}>
              <h3>
                {state.settings.schoolName !== '' && `${state.settings.schoolName} — `}
                {teacher.name} ({teacher.short}) — {teacher.subject} — haftalık ders
                programı
              </h3>
              <table className="print">
                <thead>
                  <tr>
                    <th style={{ width: 92 }}>Saat</th>
                    {state.settings.days.map((day, i) => (
                      <th key={i}>{day.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.settings.hours.map((hour, s) => (
                    <tr key={s}>
                      <th>
                        {hour}
                        <span className="p-clock">
                          {clock[s]?.start ?? ''}–{clock[s]?.end ?? ''}
                        </span>
                      </th>
                      {state.settings.days.map((_, g) => {
                        const lessonId = ix.teacherBusy.get(closedKey(teacher.id, g, s));
                        const lesson =
                          lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
                        const group =
                          lesson === undefined ? undefined : ix.classById.get(lesson.classId);
                        const closed =
                          state.unavailable[closedKey(teacher.id, g, s)] !== undefined;
                        return (
                          <td
                            key={g}
                            style={
                              colored && group !== undefined
                                ? { background: `var(--color-${teacher.color})` }
                                : closed
                                  ? { background: '#e0e0e0' }
                                  : undefined
                            }
                          >
                            {group !== undefined ? (
                              <>
                                <span className="p-top">{group.name}</span>
                                <span className="p-bottom">
                                  {group.roomId != null
                                    ? (ix.roomById.get(group.roomId)?.name ?? '')
                                    : ''}
                                </span>
                              </>
                            ) : closed ? (
                              '×'
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}
