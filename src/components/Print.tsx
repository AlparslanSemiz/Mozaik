// Printing: ONE ENTITY PER PAGE.
//
// Row = day, column = lesson — the same way round as the availability grid, and
// the way a timetable is read on a wall. 12 lesson columns do not fit A4
// portrait (~15 mm each), so the page is LANDSCAPE: ~21 mm per column, which is
// exactly what the subject short forms were made for.
//
// Printing the 84-column main table is still impossible and still not attempted.

import { useMemo } from 'react';
import { sharedPeriods } from '../bell';
import { buildIndex, closedKey, placementKey } from '../constraints';
import { subjectShort } from '../entities';
import { paletteColor } from '../palette';
import type { State } from '../types';
import type { Scope } from '../toolState';

interface Props {
  state: State;
  /**
   * Held by App, not here: switching to Kurulum to fix one thing and coming
   * back would otherwise wipe the tick lists, because this component unmounts.
   */
  excluded: Excluded;
  setExcluded: (next: (prev: Excluded) => Excluded) => void;
  /** Which pages the preview builds. Owned by App; the tool strip CHANGES it. */
  scope: Scope;
  colored: boolean;
}

/**
 * Which pages to print, stored as what is LEFT OUT rather than what is chosen.
 *
 * A class added after the last printout must come out of the printer next time
 * without anyone remembering to tick it; with a "selected" set it would silently
 * be missing. This lives in component state, not in State: it is a decision
 * about one printout, not something to carry in a backup — the same reason the
 * theme does not live there either.
 */
export type Excluded = { classes: Set<string>; teachers: Set<string> };

export const NOTHING_EXCLUDED: Excluded = { classes: new Set(), teachers: new Set() };

export default function Print({
  state,
  excluded,
  setExcluded,
  scope,
  colored,
}: Props) {
  const ix = useMemo(() => buildIndex(state), [state]);

  // A column header carries ONE time, but the 6th lesson starts at 13:30 on a
  // weekday and 13:10 at the weekend. Printing one of them above both would be
  // a lie on paper, so where the days disagree the column shows no clock; each
  // row still marks its own long break.
  const clock = useMemo(
    () => sharedPeriods(state.settings.bell, state.settings.hours, state.settings.days),
    [state.settings],
  );

  /**
 * The small line under the title: whose sheet this is. Empty parts are dropped,
 * so a school with no name does not print a stray separator.
 */
function credits(...parts: string[]): string {
  return parts.filter((p) => p !== '').join(' · ');
}

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
      <>
        <div className="empty-screen">
          <strong>Yazdırılacak program yok.</strong>
          Önce <b>Kurulum</b> sekmesinden dersleri girip <b>Program</b> sekmesinde
          dizin.
        </div>
      </>
    );
  }

  const classPages = scope !== 'teachers';
  const teacherPages = scope !== 'classes';

  const chosenClasses = classPages
    ? state.classes.filter((x) => !excluded.classes.has(x.id))
    : [];
  const chosenTeachers = teacherPages
    ? state.teachers.filter((x) => !excluded.teachers.has(x.id))
    : [];
  const pageCount = chosenClasses.length + chosenTeachers.length;

  // How much of the timetable the chosen pages actually carry. A page with
  // nothing on it prints just as willingly as a full one.
  //
  // Both sets are built in ONE pass over the placements: asking "does this
  // teacher have anything" per teacher would walk 1800 placements 25 times.
  const placedHours = Object.keys(state.placements).length;
  const { busyClasses, busyTeachers } = useMemo(() => {
    const classes = new Set<string>();
    const teachers = new Set<string>();
    for (const [key, lessonId] of Object.entries(state.placements)) {
      classes.add(key.slice(0, key.indexOf('|')));
      const lesson = ix.lessonById.get(lessonId);
      if (lesson !== undefined) teachers.add(lesson.teacherId);
    }
    return { busyClasses: classes, busyTeachers: teachers };
  }, [state.placements, ix]);

  const emptyPages =
    chosenClasses.filter((c) => !busyClasses.has(c.id)).length +
    chosenTeachers.filter((t) => !busyTeachers.has(t.id)).length;

  function toggle(kind: keyof Excluded, id: string) {
    setExcluded((prev) => {
      const next = new Set(prev[kind]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [kind]: next };
    });
  }

  function setAll(kind: keyof Excluded, on: boolean) {
    const ids = kind === 'classes' ? state.classes : state.teachers;
    setExcluded((prev) => ({ ...prev, [kind]: on ? new Set() : new Set(ids.map((x) => x.id)) }));
  }

  /** One tick-list: which classes, or which teachers, go to the printer. */
  function picker(kind: keyof Excluded, title: string) {
    const items =
      kind === 'classes'
        ? state.classes.map((x) => ({ id: x.id, label: x.name, color: x.color }))
        : state.teachers.map((x) => ({ id: x.id, label: x.short, color: x.color }));
    const chosen = items.filter((x) => !excluded[kind].has(x.id)).length;

    return (
      <div className="pick-list">
        <div className="pick-head">
          <b>
            {title} ({chosen}/{items.length})
          </b>
          <button className="btn" onClick={() => setAll(kind, true)}>
            Tümü
          </button>
          <button className="btn" onClick={() => setAll(kind, false)}>
            Hiçbiri
          </button>
        </div>
        <div className="pick-items">
          {items.map((x) => (
            <label key={x.id} className="pick-item">
              <input
                type="checkbox"
                checked={!excluded[kind].has(x.id)}
                onChange={() => toggle(kind, x.id)}
              />
              <span className="row-dot" style={{ background: paletteColor(x.color) }} />
              {x.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    // The preview takes the room it needs; the choices stand BESIDE it instead
    // of pushing twenty pages of preview a screen down. When printing, `.cols`
    // collapses to a block and the whole control panel is `.no-print` anyway.
    <div className="cols narrow-right">
      <div className="print-area">
        {chosenClasses.map((group) => (
            <div className="print-page" key={group.id}>
              <h3>
                {/* Big line: what the sheet is. Small line: whose it is. The
                    two used to be one long left-aligned string, which on paper
                    read as a caption rather than a title. */}
                <span className="p-title-main">
                  {colored && (
                    <span className="p-dot" style={{ background: paletteColor(group.color) }} />
                  )}
                  {group.name} sınıfı — Haftalık ders programı
                </span>
                {(() => {
                  const room =
                    group.roomId == null ? '' : (ix.roomById.get(group.roomId)?.name ?? '');
                  const sub = credits(
                    state.settings.schoolName,
                    room === '' ? '' : `${room} dersliği`,
                  );
                  return sub === '' ? null : <span className="p-title-sub">{sub}</span>;
                })()}
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
                                ? { background: paletteColor(teacher.color) }
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

        {chosenTeachers.map((teacher) => (
            <div className="print-page" key={teacher.id}>
              <h3>
                <span className="p-title-main">
                  {colored && (
                    <span className="p-dot" style={{ background: paletteColor(teacher.color) }} />
                  )}
                  {teacher.name} ({teacher.short}) — Haftalık ders programı
                </span>
                {(() => {
                  const sub = credits(state.settings.schoolName, teacher.subject);
                  return sub === '' ? null : <span className="p-title-sub">{sub}</span>;
                })()}
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
                                ? { background: paletteColor(teacher.color) }
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

      <aside>
        <div className="panel no-print">
          <h2>Yazdır</h2>
          <p className="hint">
            Her sınıf ve her öğretmen ayrı sayfaya basılır (<b>A4 yatay</b>). Yazdırma
            penceresinde <b>kenar boşlukları: varsayılan</b> ve <b>arka plan grafikleri:
            açık</b> olsun, yoksa renkler çıkmaz. Tarih ve dosya adı kâğıda çıkmaz;
            yine de görürseniz <b>üstbilgi ve altbilgi</b> kutusunun işaretini kaldırın.
          </p>
          {/* "Ne basılsın" and "Renkli bas" moved to the tool strip; the
              button stayed, because the page COUNT comes from the tick lists
              right below it. */}
          <div className="form-row">
            <button
              className="btn primary"
              disabled={pageCount === 0}
              onClick={() => window.print()}
            >
              Yazdır ({pageCount} sayfa)
            </button>
          </div>

          {/* Tick lists, not a second dropdown: "print 510 and 511 only" is a
              normal request and used to mean printing all 45 pages and throwing
              43 away. */}
          <div className="form-row pickers">
            {classPages && picker('classes', 'Sınıflar')}
            {teacherPages && picker('teachers', 'Öğretmenler')}
          </div>

          {pageCount === 0 && (
            <div className="warn-box">Hiçbir sayfa seçili değil — basılacak bir şey yok.</div>
          )}
        </div>

        {/* What the printer is about to produce, in the numbers that matter at
            the printer: how many sheets, and whether any of them is going to
            come out with holes in it. An empty timetable printed for a parents'
            evening is the mistake this catches. */}
        <div className="panel no-print">
          <h2>Çıktı özeti</h2>
          <table className="stat">
            <tbody>
              <tr>
                <td>Sayfa</td>
                <td className="num">{pageCount}</td>
              </tr>
              <tr>
                <td>Kâğıt</td>
                <td className="num">A4 yatay</td>
              </tr>
              <tr>
                <td>Renk</td>
                <td className="num">{colored ? 'Renkli' : 'Siyah-beyaz'}</td>
              </tr>
              <tr>
                <td>Yerleşmiş saat</td>
                <td className="num">{placedHours}</td>
              </tr>
            </tbody>
          </table>
          {emptyPages > 0 && (
            <div className="warn-box">
              Seçilen sayfaların <b>{emptyPages}</b> tanesi tamamen boş — o
              {' '}{scope === 'teachers' ? 'öğretmenlerin' : 'sınıfların'} programı
              henüz dizilmemiş. <b>Program</b> sekmesinden dizebilirsiniz.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
