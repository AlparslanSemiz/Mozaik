// Printing: ONE ENTITY PER PAGE.
//
// Row = day, column = lesson — the same way round as the availability grid, and
// the way a timetable is read on a wall. 12 lesson columns do not fit A4
// portrait (~15 mm each), so the page is LANDSCAPE: ~21 mm per column, which is
// exactly what the subject short forms were made for.
//
// Printing the 84-column main table is still impossible and still not attempted.

import { useMemo, useState } from 'react';
import { sharedPeriods } from '../bell';
import { buildIndex, closedKey, placementKey } from '../constraints';
import { subjectShort } from '../entities';
import type { State } from '../types';

interface Props {
  state: State;
}

type Scope = 'classes' | 'teachers' | 'both';

export default function Print({ state }: Props) {
  const [scope, setScope] = useState<Scope>('classes');
  const [colored, setColored] = useState(true);
  const ix = useMemo(() => buildIndex(state), [state]);

  // A column header carries ONE time, but the 6th lesson starts at 13:30 on a
  // weekday and 13:10 at the weekend. Printing one of them above both would be
  // a lie on paper, so where the days disagree the column shows no clock; each
  // row still marks its own long break.
  const clock = useMemo(
    () => sharedPeriods(state.settings.bell, state.settings.hours, state.settings.days),
    [state.settings],
  );

  /** The lesson-number header row, shared by both kinds of page. */
  function head() {
    return (
      <thead>
        <tr>
          <th className="p-daycol">Gün</th>
          {state.settings.hours.map((hour, s) => (
            <th key={s}>
              {hour}
              <span className="p-clock">
                {clock[s] === null ? '' : `${clock[s]?.start ?? ''}–${clock[s]?.end ?? ''}`}
              </span>
            </th>
          ))}
        </tr>
      </thead>
    );
  }

  /** The long break falls at a different lesson on each row: a thick edge. */
  const breakClass = (longBreakAfter: number, s: number): string =>
    longBreakAfter === s + 1 ? 'p-break' : '';

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
          Her sınıf ve her öğretmen ayrı sayfaya basılır (<b>A4 yatay</b>). Yazdırma
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
                {head()}
                <tbody>
                  {state.settings.days.map((day, g) => (
                    <tr key={g}>
                      {/* The FULL day name: a printout on a wall is read from a
                          distance, and abbreviations belong to narrow screens. */}
                      <th className="p-daycol">{day.name}</th>
                      {state.settings.hours.map((_, s) => {
                        const lessonId = state.placements[placementKey(group.id, g, s)];
                        const lesson =
                          lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
                        const teacher =
                          lesson === undefined ? undefined : ix.teacherById.get(lesson.teacherId);
                        return (
                          <td
                            key={s}
                            className={breakClass(day.longBreakAfter, s)}
                            style={
                              colored && teacher !== undefined
                                ? { background: `var(--color-${teacher.color})` }
                                : undefined
                            }
                          >
                            {teacher !== undefined && (
                              <>
                                <span className="p-top">
                                  {subjectShort(state.settings, teacher.subject)}
                                </span>
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
                {head()}
                <tbody>
                  {state.settings.days.map((day, g) => (
                    <tr key={g}>
                      <th className="p-daycol">{day.name}</th>
                      {state.settings.hours.map((_, s) => {
                        const lessonId = ix.teacherBusy.get(closedKey(teacher.id, g, s));
                        const lesson =
                          lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
                        const group =
                          lesson === undefined ? undefined : ix.classById.get(lesson.classId);
                        const closed =
                          state.unavailable[closedKey(teacher.id, g, s)] !== undefined;
                        return (
                          <td
                            key={s}
                            className={[
                              closed && group === undefined ? 'p-closed' : '',
                              breakClass(day.longBreakAfter, s),
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={
                              colored && group !== undefined
                                ? { background: `var(--color-${teacher.color})` }
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
