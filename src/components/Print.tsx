// Printing: ONE ENTITY PER PAGE.
//
// WHAT DOES NOT GO ON PAPER: closed hours. The teacher sheet used to mark
// every unavailable hour with a x and a grey hatch. Asked for and removed
// (2026-08-26): a sheet that goes on a wall answers "where am I at 10:40",
// and a cross answers a question nobody is holding the paper to ask. It also
// cost the reader a column of ink per absent teacher. The information is not
// lost — Musaitlik is where it is edited and Kontrol is where it is counted.
//
// Row = day, column = lesson — the same way round as the availability grid, and
// the way a timetable is read on a wall. 12 lesson columns do not fit A4
// portrait (~15 mm each), so the page is LANDSCAPE: ~21 mm per column, which is
// exactly what the subject short forms were made for.
//
// Printing the 84-column main table is still impossible and still not attempted.

import { useMemo } from 'react';
import { periodGroups } from '../bell';
import { blockSpans, buildIndex, closedKey, placementKey } from '../constraints';
import { dayLabel, lessonSubject, shortDay, subjectShort, teacherSubjects } from '../entities';
import { paletteColor } from '../palette';
import type { State } from '../types';
import { activePlacements } from '../programs';
import type { Scope } from '../toolState';
import { PER_SHEET_LABELS, PRINT_OPTION_LABELS, PRINT_SIZE_LABELS } from '../printOptions';
import type { PrintOptions } from '../printOptions';
import { T, useT } from './T';

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
  /**
   * What each page carries. ONE prop rather than five, because they are one
   * decision; App owns it so it survives a trip to Kurulum, and printOptions.ts
   * remembers it so it survives the term.
   */
  options: PrintOptions;
  setOptions: (next: PrintOptions) => void;
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


/**
 * ONE SHEET OF A4 holds `per` timetables (asked for on 2026-08-26: "bir A4
 * kağıdına 4 tane program yazılabilir olsun").
 *
 * `.print-sheet` is the PAPER — 297x205 mm, and the thing `break-after: page`
 * lives on. `.print-page` is one timetable, and it stays one timetable at every
 * setting: the tick lists count them, "3 sınıf = 3 sayfa" counts them, and
 * renaming what a page IS would have quietly changed what all of that means.
 * At per = 1 the two boxes are the same size and nothing about the sheet moved.
 */
function sheets(plans: React.ReactElement[], per: number): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  for (let i = 0; i < plans.length; i += per) {
    const slice = plans.slice(i, i + per);
    out.push(
      <div className="print-sheet" key={`s${i}`}>
        {slice}
      </div>,
    );
  }
  return out;
}

export default function Print({
  state,
  excluded,
  setExcluded,
  scope,
  colored,
  options,
  setOptions,
}: Props) {
  const t = useT();
  const ix = useMemo(() => buildIndex(state), [state]);
  // Where each placed block BEGINS and how wide it is — the same map the
  // screen grid reads, so paper and screen cut a run of hours in the same
  // places. Computed once for the whole print job rather than per sheet.
  const spans = useMemo(() => blockSpans(state), [state]);

  // Read once per mount, on purpose: the sheet says when it was printed, and
  // the honest answer is "about now". Recomputing it per page would put five
  // different minutes on five sheets that came out of the same job.
  const stamped = useMemo(
    () =>
      new Date().toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  );

  // A column header used to carry ONE time and nothing where the days
  // disagreed — which with the default week meant the 6th column came out
  // blank, and that blank was read as a fault. There is no fault: the 6th
  // lesson starts at 13:30 on a weekday and 13:10 at the weekend, because the
  // long break sits after the 5th lesson on one and the 6th on the other.
  //
  // So the header prints BOTH, each with the days it belongs to. Where the
  // week agrees — eleven of the twelve columns — there is one group and no day
  // names, exactly as before.
  const clock = useMemo(
    () => periodGroups(state.settings.bell, state.settings.hours, state.settings.days),
    [state.settings],
  );

  /**
 * The small line under the title: whose sheet this is. Empty parts are dropped,
 * so a school with no name does not print a stray separator.
 */
/**
 * How many hours the ONE printed cell starting at this hour stands for.
 *
 * 0 means "do not draw it": a block to the left already covers this hour. 1 is
 * an ordinary cell. Anything more is a merged block, drawn on paper the way the
 * screen grid draws it, from the same `blockSpans()` map — so a run of hours is
 * never cut in one place on screen and another on paper.
 *
 * CUT AT THE LONG BREAK, for a reason of its own. On screen the break is a
 * column of its own and swallowing it inside a colSpan would make it a drop
 * target (pitfall 13); on paper it is a thick right edge on one cell, and a
 * colSpan straddling it would put that edge through the middle of a block. Both
 * drawings therefore end a cell at the break, which is also the honest reading:
 * there really is something between those hours.
 */
function cellSpan(
  spans: Map<string, number>,
  state: State,
  classId: string,
  day: number,
  hour: number,
  longBreakAfter: number,
): number {
  if (classId === '') return 1;
  const here = activePlacements(state)[placementKey(classId, day, hour)];
  if (here === undefined) return 1;

  const head = spans.get(placementKey(classId, day, hour));
  if (head === undefined) {
    // Not a block head. It is drawn on its own only if the break cut the block
    // just before it — otherwise the cell to its left is already covering it.
    return longBreakAfter === hour ? blockTail(spans, state, classId, day, hour, longBreakAfter) : 0;
  }
  return clampToBreak(head, hour, longBreakAfter, state.settings.hours.length);
}

/** The rest of a block after the long break cut it, as its own cell. */
function blockTail(
  spans: Map<string, number>,
  state: State,
  classId: string,
  day: number,
  hour: number,
  longBreakAfter: number,
): number {
  const id = activePlacements(state)[placementKey(classId, day, hour)];
  let start = hour;
  while (start > 0 && spans.get(placementKey(classId, day, start)) === undefined) start--;
  const size = spans.get(placementKey(classId, day, start)) ?? 1;
  const left = size - (hour - start);
  if (left <= 0 || id === undefined) return 1;
  return clampToBreak(left, hour, longBreakAfter, state.settings.hours.length);
}

/** A width that never reaches past the long break or past the last hour. */
function clampToBreak(
  size: number,
  hour: number,
  longBreakAfter: number,
  hourCount: number,
): number {
  const toBreak = longBreakAfter > hour ? longBreakAfter - hour : Infinity;
  return Math.max(1, Math.min(size, toBreak, hourCount - hour));
}

function credits(...parts: string[]): string {
  return parts.filter((p) => p !== '').join(' · ');
}

/**
 * [0,1,2,3] -> "Sal–Cum", [4,5] -> "Cmt–Pzr", [0,3] -> "Sal, Cum".
 *
 * Runs of consecutive days become a range, because that is what they are in
 * the rows below: the reader matches a label to a block of rows by looking
 * down the sheet rather than by reading six names.
 */
function dayRange(days: State['settings']['days'], indices: number[]): string {
  const short = (i: number) => shortDay(days[i]?.name ?? '');
  const parts: string[] = [];
  let run = 0;
  for (let i = 1; i <= indices.length; i++) {
    if (i < indices.length && indices[i] === indices[i - 1]! + 1) continue;
    const from = indices[run]!;
    const to = indices[i - 1]!;
    parts.push(from === to ? short(from) : `${short(from)}–${short(to)}`);
    run = i;
  }
  return parts.join(', ');
}

/** The lesson-number header row, shared by both kinds of page. */
  function head() {
    return (
      <thead>
        <tr>
          <th className="p-daycol">{t('Gün')}</th>
          {state.settings.hours.map((hour, s) => {
            const groups = clock[s] ?? [];
            return (
              <th key={s}>
                {hour}
                {options.clock &&
                  groups.map((g, i) => (
                    <span className="p-clock" key={i}>
                      {/* Day names appear ONLY when there is more than one
                          answer. Putting "Sal–Pzr" above all twelve columns
                          would say nothing eleven times to explain one. */}
                      {groups.length > 1 && (
                        <span className="p-clock-days">
                          {dayRange(state.settings.days, g.days)}{' '}
                        </span>
                      )}
                      {g.period.start}–{g.period.end}
                    </span>
                  ))}
              </th>
            );
          })}
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
          <strong>{t('Yazdırılacak program yok.')}</strong>
          <T k="Önce **Okul** sekmesinden dersleri girip **Program** sekmesinde dizin." />
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
  const placedHours = Object.keys(activePlacements(state)).length;
  const { busyClasses, busyTeachers } = useMemo(() => {
    const classes = new Set<string>();
    const teachers = new Set<string>();
    for (const [key, lessonId] of Object.entries(activePlacements(state))) {
      classes.add(key.slice(0, key.indexOf('|')));
      const lesson = ix.lessonById.get(lessonId);
      if (lesson !== undefined) teachers.add(lesson.teacherId);
    }
    return { busyClasses: classes, busyTeachers: teachers };
  }, [state, ix]);

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
          <b>{t('{ne} ({secili}/{toplam})', { ne: t(title), secili: chosen, toplam: items.length })}</b>
          <button className="btn" onClick={() => setAll(kind, true)}>{t('Tümü')}</button>
          <button className="btn" onClick={() => setAll(kind, false)}>{t('Hiçbiri')}</button>
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
    // `print-cols`: this screen's rail is wider than the other six, because
    // this screen is the one with room to spare beside a fixed-size sheet.
    <div className="cols print-cols">
      <div className="print-area" data-per={options.perSheet} data-size={options.size}>
        {sheets(
          [
        ...chosenClasses.map((group) => (
            <div className="print-page" key={group.id}>
              <h3>
                {/* Big line: what the sheet is. Small line: whose it is. The
                    two used to be one long left-aligned string, which on paper
                    read as a caption rather than a title. */}
                <span className="p-title-main">
                  {colored && (
                    <span className="p-dot" style={{ background: paletteColor(group.color) }} />
                  )}
                  {t('{ad} sınıfı · Haftalık ders programı', { ad: group.name })}
                </span>
                {(() => {
                  const room =
                    group.roomId == null ? '' : (ix.roomById.get(group.roomId)?.name ?? '');
                  const sub = credits(
                    options.school ? state.settings.schoolName : '',
                    !options.credits || room === '' ? '' : t('{ad} dersliği', { ad: room }),
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
                      <th className="p-daycol">{dayLabel(day.name)}</th>
                      {state.settings.hours.map((_, s) => {
                        const lessonId = activePlacements(state)[placementKey(group.id, g, s)];
                        // A block is ONE cell on paper too — "çıktıda da blok
                        // dersler birlikte gözükmeli programdaki gibi birleşik
                        // görünsünler". `cellSpan` returns 0 for the hours a
                        // block to the left already covers, and they are simply
                        // not drawn.
                        const span = cellSpan(spans, state, group.id, g, s, day.longBreakAfter);
                        if (span === 0) return null;
                        const lesson =
                          lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
                        const teacher =
                          lesson === undefined ? undefined : ix.teacherById.get(lesson.teacherId);
                        // The LESSON's subject, not the teacher's first one: a
                        // teacher who holds two is standing in this room for
                        // exactly one of them, and the sheet on the wall has to
                        // say which.
                        const subject =
                          lesson === undefined
                            ? ''
                            : subjectShort(state.settings, lessonSubject(state, lesson));
                        return (
                          <td
                            key={s}
                            colSpan={span > 1 ? span : undefined}
                            className={breakClass(day.longBreakAfter, s + span - 1)}
                            style={
                              colored && teacher !== undefined
                                ? { background: paletteColor(teacher.color) }
                                : undefined
                            }
                          >
                            {teacher !== undefined && (
                              <>
                                <span className="p-top">{subject}</span>
                                {options.cellBottom && (
                                  <span className="p-bottom">{teacher.short}</span>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Last child of the page box, so `justify-content: safe center`
                  centres the plan WITH it rather than around it. */}
              {options.stamp && (
                <div className="p-stamp">{stamped} tarihinde yazdırıldı</div>
              )}
            </div>
          )),

        ...chosenTeachers.map((teacher) => (
            <div className="print-page" key={teacher.id}>
              <h3>
                <span className="p-title-main">
                  {colored && (
                    <span className="p-dot" style={{ background: paletteColor(teacher.color) }} />
                  )}
                  {teacher.name} ({teacher.short}) · Haftalık ders programı
                </span>
                {(() => {
                  const sub = credits(
                    options.school ? state.settings.schoolName : '',
                    // Both subjects on the teacher's own sheet: the credit line
                    // says who this person is, and half of that is not who they
                    // are. The CELLS on the same page still each name the one
                    // subject that lesson is taught under.
                    options.credits ? teacherSubjects(teacher).join(' · ') : '',
                  );
                  return sub === '' ? null : <span className="p-title-sub">{sub}</span>;
                })()}
              </h3>
              <table className="print">
                {head()}
                <tbody>
                  {state.settings.days.map((day, g) => (
                    <tr key={g}>
                      <th className="p-daycol">{dayLabel(day.name)}</th>
                      {state.settings.hours.map((_, s) => {
                        const lessonId = ix.teacherBusy.get(closedKey(teacher.id, g, s));
                        const lesson =
                          lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
                        const group =
                          lesson === undefined ? undefined : ix.classById.get(lesson.classId);
                        // The boundary belongs to the CLASS's grid, exactly as
                        // it does in the screen grid's teacher view: the block
                        // was placed into a class's week, and this sheet is
                        // only another way of reading it.
                        const span = cellSpan(
                          spans,
                          state,
                          group?.id ?? '',
                          g,
                          s,
                          day.longBreakAfter,
                        );
                        if (span === 0) return null;
                        return (
                          <td
                            key={s}
                            colSpan={span > 1 ? span : undefined}
                            className={breakClass(day.longBreakAfter, s + span - 1)}
                            // The CLASS's colour, not the teacher's.
                            //
                            // On the screen grid a cell is painted by the
                            // teacher because that is what matches the pool
                            // card you dragged (CLAUDE.md). On a teacher's own
                            // SHEET every filled cell is that same teacher, so
                            // one colour over the whole week says nothing —
                            // twelve cells of identical pastel. The class is
                            // the thing that varies, and it is the thing the
                            // reader is looking for. The class sheet is
                            // unchanged: there the teacher is what varies.
                            style={
                              colored && group !== undefined
                                ? { background: paletteColor(group.color) }
                                : undefined
                            }
                          >
                            {group !== undefined && (
                              <>
                                <span className="p-top">{group.name}</span>
                                {options.cellBottom && (
                                  <span className="p-bottom">
                                    {group.roomId != null
                                      ? (ix.roomById.get(group.roomId)?.name ?? '')
                                      : ''}
                                  </span>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Last child of the page box, so `justify-content: safe center`
                  centres the plan WITH it rather than around it. */}
              {options.stamp && (
                <div className="p-stamp">{stamped} tarihinde yazdırıldı</div>
              )}
            </div>
          )),
          ],
          options.perSheet,
        )}
      </div>

      <aside>
        <div className="panel no-print">
          <h2>{t('Çıktı')}</h2>
          <p className="hint">
            <T k="Yazdırma penceresinde **arka plan grafikleri: açık** olsun, yoksa renkler çıkmaz." />
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
              {/* Sheets, not timetables: at 4-up, twenty classes are five
                  pieces of paper, and the number beside the button is the
                  number the printer will produce. */}
              {t('Yazdır ({n} kâğıt)', { n: Math.ceil(pageCount / options.perSheet) })}
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
            <div className="warn-box">{t('Hiçbir sayfa seçili değil, basılacak bir şey yok.')}</div>
          )}
        </div>

        {/* HOW THE SHEET IS LAID OUT — two questions, and they are not the
            same question as "what is on it", so they are not in the same
            panel. This one changes the geometry of the paper; the one below
            changes what is written on it.

            Two knobs and not one, on purpose (2026-08-26): the count picks a
            base scale so four timetables can fit an A4 at all, and the size is
            the reader's own adjustment on top of it. One knob would have had
            no room for "biraz daha büyük olsun". */}
        <div className="panel no-print">
          <h2>{t('Sayfa düzeni')}</h2>
          <p className="hint">
            {t('Bir A4 kâğıda kaç program bassın, ve kâğıttaki yazı ne kadar büyük olsun.')}
          </p>

          <h3>{t('Bir kâğıda kaç program')}</h3>
          <div className="form-row">
            {PER_SHEET_LABELS.map((x) => (
              <button
                key={x.value}
                className="btn"
                aria-pressed={options.perSheet === x.value}
                title={x.hint}
                onClick={() => setOptions({ ...options, perSheet: x.value })}
              >
                {x.label}
              </button>
            ))}
          </div>
          <p className="hint">
            {t(PER_SHEET_LABELS.find((x) => x.value === options.perSheet)?.hint ?? '')}
            {' · '}
            <T k="**{n}** kâğıt" vars={{ n: Math.ceil(pageCount / options.perSheet) }} />
          </p>

          <h3>{t('Kâğıttaki yazı')}</h3>
          <div className="form-row">
            {PRINT_SIZE_LABELS.map((x) => (
              <button
                key={x.value}
                className="btn"
                aria-pressed={options.size === x.value}
                onClick={() => setOptions({ ...options, size: x.value })}
              >
                {t(x.label)}
              </button>
            ))}
          </div>
        </div>

        {/* Which of the things on a sheet are wanted on THIS school's sheets.
            In the panel rather than the tool strip: five more icon+word
            buttons do not fit a strip that is already measured for spill at
            150%, and this is a term-long decision, not a per-glance one. */}
        <div className="panel no-print">
          <h2>{t('Sayfada ne olsun')}</h2>
          <p className="hint">
            {t('İşareti kaldırılan şey kâğıda basılmaz.')}
          </p>
          <div className="form-col">
            {PRINT_OPTION_LABELS.map((x) => (
              <label key={x.id} className="pick-item">
                <input
                  type="checkbox"
                  checked={options[x.id]}
                  onChange={() => setOptions({ ...options, [x.id]: !options[x.id] })}
                />
                <span>
                  {t(x.label)} <span className="muted-inline">· {t(x.hint)}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* What the printer is about to produce, in the numbers that matter at
            the printer: how many sheets, and whether any of them is going to
            come out with holes in it. An empty timetable printed for a parents'
            evening is the mistake this catches. */}
        <div className="panel no-print">
          <h2>{t('Çıktı özeti')}</h2>
          <table className="stat">
            <tbody>
              <tr>
                <td>{t('Program')}</td>
                <td className="num">{pageCount}</td>
              </tr>
              <tr>
                <td>{t('Kâğıt')}</td>
                <td className="num">{Math.ceil(pageCount / options.perSheet)}</td>
              </tr>
              <tr>
                <td>{t('Sayfa')}</td>
                <td className="num">{t('A4 yatay')}</td>
              </tr>
              <tr>
                <td>{t('Renk')}</td>
                <td className="num">{colored ? 'Renkli' : 'Siyah-beyaz'}</td>
              </tr>
              <tr>
                <td>{t('Yerleşmiş saat')}</td>
                <td className="num">{placedHours}</td>
              </tr>
            </tbody>
          </table>
          {emptyPages > 0 && (
            <div className="warn-box">
              {/* Two whole sentences: Turkish inflects the noun ("o
                  öğretmenlerin"), and a dictionary cannot add a case ending to
                  a word it has just translated. */}
              {scope === 'teachers' ? (
                <T
                  k="Seçilen sayfaların **{n}** tanesi tamamen boş. O öğretmenlerin programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz."
                  vars={{ n: emptyPages }}
                />
              ) : (
                <T
                  k="Seçilen sayfaların **{n}** tanesi tamamen boş. O sınıfların programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz."
                  vars={{ n: emptyPages }}
                />
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
