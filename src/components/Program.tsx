// The main screen. Wires the grid, the lesson pool and the dragging together.
//
// Performance contract (for the slow machine):
//   - `rows` and `cards` are useMemo'd, recomputed only when the state changes.
//   - Grid is React.memo; changing the reason bar does not redraw the grid.
//   - No state changes at all during a drag (see drag.ts).

import { useCallback, useMemo } from 'react';
import type React from 'react';
import {
  blockAt,
  buildIndex,
  closedConflicts,
  closedKey,
  dropMap,
  evict,
  evictionNotice,
  pendingBlocks,
  placedBlocks,
  removeBlock,
  placementKey,
  place,
} from '../constraints';
import type { Index } from '../constraints';
import { useToast } from './Toasts';
import { lessonSubject, subjectLabel, subjectShort, teacherSubjects } from '../entities';
import { useDrag } from '../drag';
import type { DragData, Reason } from '../drag';
import type { SolverRun } from '../useSolver';
import type { State, Id } from '../types';
import type { View } from '../toolState';
import Grid from './Grid';
import type { GridCell, GridRow } from './Grid';
import LessonPool from './LessonPool';
import type { PoolCard } from './LessonPool';
import { T, useT } from './T';
import type { Translate } from './T';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  /** The automatic run. Owned by App so it survives a tab change. */
  solver: SolverRun;
  /** Which axis the rows are. Owned by App: the tool strip above shows it. */
  view: View;
}

/** "3,4" — one decimal, Turkish comma. */
function seconds(ms: number): string {
  return (ms / 1000).toFixed(1).replace('.', ',');
}

/**
 * The single line under the toolbar. Returns the text and the class that
 * colours it: '' plain, 'warn' yellow, 'bad' red, 'ok' green.
 */
function describeBar(
  reason: Reason | null,
  dragging: boolean,
  solver: SolverRun,
  view: View,
  t: Translate,
): { text: string; level: string } {
  if (reason !== null) return { text: reason.text, level: reason.level === 'warn' ? 'warn' : 'bad' };
  if (dragging) return { text: t('Buraya bırakılabilir.'), level: 'ok' };

  const p = solver.progress;
  if (solver.running && p !== null) {
    return {
      text: t('Otomatik diziliyor… {yerlesen}/{toplam} blok · {sure} sn', {
        yerlesen: p.placedBlocks,
        toplam: p.totalBlocks,
        sure: seconds(p.elapsedMs),
      }),
      level: 'busy',
    };
  }

  const done = solver.result;
  // Idle, the bar says what the grid IS rather than sitting blank. It reserves
  // 26px whatever happens, and a sentence that explains the axis you are
  // looking at is worth more there than empty chrome. It used to live beside
  // the view switch, which is now a row further up.
  if (done === null) {
    return {
      text:
        view === 'teacher'
          ? t(
              'Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.',
            )
          : t(
              'Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.',
            ),
      level: '',
    };
  }

  if (done.stuck.length === 0) {
    return {
      text: t('Program dizildi. {n} blok yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.', {
        n: done.placedBlocks,
        sure: seconds(done.elapsedMs),
      }),
      level: 'ok',
    };
  }

  const worst = done.stuck[0]!;
  const others =
    done.stuck.length > 1 ? t(' (ve {n} ders daha)', { n: done.stuck.length - 1 }) : '';
  const head =
    done.phase === 'cancelled'
      ? t('Durduruldu. {yerlesen}/{toplam} blok yerleşti.', {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        })
      : t('{yerlesen}/{toplam} blok yerleşti.', {
          yerlesen: done.placedBlocks,
          toplam: done.totalBlocks,
        });
  return {
    text: t('{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.', {
      bas: head,
      ders: worst.name,
      saat: worst.missing,
      sebep: worst.reason,
      digerleri: others,
    }),
    level: done.phase === 'cancelled' ? 'warn' : 'bad',
  };
}

function roomLetter(ix: Index, roomId: string | null | undefined): string {
  if (roomId == null) return '';
  return ix.roomById.get(roomId)?.name ?? '';
}

function buildRows(d: State, ix: Index, view: View, t: Translate): GridRow[] {
  // Availability is edited after the timetable is laid out, and a cell whose
  // hour has since been closed used to look perfectly normal: the hatch is only
  // drawn on EMPTY cells, so the card simply covered it up.
  const conflicts = new Map<string, string>();
  for (const c of closedConflicts(d, ix)) {
    conflicts.set(placementKey(c.classId, c.day, c.hour), c.reason);
  }

  // Where every block BEGINS. `continues` used to be plain adjacency — "is the
  // next cell the same lesson" — which was the same thing while a lesson had
  // one block length. It is not any more: 2+1 sitting on one day is three
  // adjacent cells of one lesson and reads as a single three-hour block unless
  // the boundary is asked for. Same reading as everything else (see the
  // contract in constraints.ts), so the line the eye sees is the line a
  // right-click cuts along.
  const heads = new Set<string>();
  for (const lesson of d.lessons) {
    for (const b of placedBlocks(d, lesson)) {
      heads.add(placementKey(lesson.classId, b.day, b.hour));
    }
  }
  const continuesAt = (classId: Id, day: number, hour: number, lessonId: Id): boolean =>
    d.placements[placementKey(classId, day, hour + 1)] === lessonId &&
    !heads.has(placementKey(classId, day, hour + 1));

  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const n = dayCount * hourCount;

  if (view === 'teacher') {
    return d.teachers.map((t) => {
      const cells: Array<GridCell | null> = new Array(n).fill(null);
      const closed: boolean[] = new Array(n).fill(false);

      for (let g = 0; g < dayCount; g++) {
        for (let s = 0; s < hourCount; s++) {
          const i = g * hourCount + s;
          closed[i] = d.unavailable[closedKey(t.id, g, s)] !== undefined;

          const lessonId = ix.teacherBusy.get(closedKey(t.id, g, s));
          if (lessonId === undefined) continue;
          const group = ix.classById.get(ix.lessonById.get(lessonId)?.classId ?? '');
          cells[i] = {
            lessonId,
            top: group?.name ?? '?',
            bottom: roomLetter(ix, group?.roomId),
            color: t.color,
            conflict: conflicts.get(placementKey(group?.id ?? '', g, s)) ?? null,
            continues:
              s + 1 < hourCount &&
              group !== undefined &&
              continuesAt(group.id, g, s, lessonId),
          };
        }
      }
      return {
        id: t.id,
        kind: 'teacher' as const,
        name: t.short,
        // Both, because this line IS the teacher — the cells in the row each
        // name the one subject their own lesson is taught under.
        //
        // SHORT, not the full name. This line sits in a column narrow enough
        // that "Matematik" was being cut to "Matemat…" and a pair of subjects
        // never showed the second one at all; the cells of the grid have read
        // the short form all along, so the row head now says what its own row
        // says. `subjectShort` is the one place that resolves it.
        secondary: teacherSubjects(t)
          .map((name) => subjectShort(d.settings, name))
          .join(' · '),
        color: t.color,
        cells,
        closed,
      };
    });
  }

  return d.classes.map((group) => {
    const cells: Array<GridCell | null> = new Array(n).fill(null);
    const closed: boolean[] = new Array(n).fill(false);

    for (let g = 0; g < dayCount; g++) {
      for (let s = 0; s < hourCount; s++) {
        const i = g * hourCount + s;
        closed[i] =
          d.unavailable[closedKey(group.id, g, s)] !== undefined ||
          (group.roomId != null && d.unavailable[closedKey(group.roomId, g, s)] !== undefined);

        const lessonId = d.placements[placementKey(group.id, g, s)];
        if (lessonId === undefined) continue;
        const lesson = ix.lessonById.get(lessonId);
        const teacher = ix.teacherById.get(lesson?.teacherId ?? '');
        cells[i] = {
          lessonId,
          top: teacher?.short ?? '?',
          // The LESSON's subject, not the teacher's first one: a teacher who
          // holds two is in this class for exactly one of them.
          bottom: lesson === undefined ? '' : subjectShort(d.settings, lessonSubject(d, lesson)),
          color: teacher?.color ?? 0,
          conflict: conflicts.get(placementKey(group.id, g, s)) ?? null,
          continues: s + 1 < hourCount && continuesAt(group.id, g, s, lessonId),
        };
      }
    }
    const letter = roomLetter(ix, group.roomId);
    return {
      id: group.id,
      kind: 'class' as const,
      name: group.name,
      secondary: letter === '' ? t('derslik yok') : t('{ad} dersliği', { ad: letter }),
      color: group.color,
      cells,
      closed,
    };
  });
}

/**
 * The pool follows the VIEW, and used to not: in the class view the cards still
 * read class-on-top, teacher-below and were still sorted by teacher, so the
 * cards belonging to one visible row were scattered across the whole pool —
 * while the drag ghost lifting off them already said something else.
 *
 * One rule, no special cases:
 *   top    = whatever the CELL will read once it lands
 *   bottom = the ROW the card is aimed at
 *   sorted by the row's POSITION, so one row's cards stand together and the
 *     tray runs the same way down as the grid does
 *
 * That last part used to be alphabetical, which was the same thing back when
 * the only order was the one they were typed in. Now the rows can be dragged,
 * and an alphabetical tray under a hand-ordered grid means hunting upward for
 * the cards of the row you are looking at.
 */
function buildPool(d: State, ix: Index, view: View): { cards: PoolCard[]; completed: number } {
  const cards: PoolCard[] = [];
  let completed = 0;
  const teacherView = view === 'teacher';
  const rowAt = new Map<string, number>(
    (teacherView ? d.teachers : d.classes).map((x, i) => [x.id, i]),
  );

  for (const lesson of d.lessons) {
    // ONE CARD PER BLOCK, not per lesson. A 2+1 lesson is a two-hour card and a
    // one-hour card, and which of them is picked up decides how many cells the
    // drop covers — so the choice has to be a thing on the tray, not a hidden
    // "whichever is next". Asked for by name; it is also what aSc's tray does.
    const owed = pendingBlocks(d, lesson);
    if (owed.length === 0) {
      completed++;
      continue;
    }
    const placed = ix.placedHours.get(lesson.id) ?? 0;
    const group = ix.classById.get(lesson.classId);
    const teacher = ix.teacherById.get(lesson.teacherId);
    const className = group?.name ?? '?';
    const teacherShort = teacher?.short ?? '?';
    for (const [i, size] of owed.entries()) {
      cards.push({
        // Identity has to include WHICH of the lesson's cards this is, or React
        // reuses one node for two of them and the tray stops matching the data.
        key: `${lesson.id}#${size}#${i}`,
        lessonId: lesson.id,
        size,
        row: rowAt.get(teacherView ? lesson.teacherId : lesson.classId) ?? Number.MAX_SAFE_INTEGER,
        top: teacherView ? className : teacherShort,
        bottom: teacherView ? teacherShort : className,
        subject: subjectLabel(lessonSubject(d, lesson)),
        // The card keeps the TEACHER's colour in both views: a cell is always
        // painted by its teacher, so this is what the card will look like.
        color: teacher?.color ?? 0,
        placed,
        total: lesson.weeklyHours,
      });
    }
  }

  // Doubles before singles inside one lesson, the way the split is written.
  cards.sort(
    (a, b) => a.row - b.row || a.top.localeCompare(b.top, 'tr') || b.size - a.size,
  );
  return { cards, completed };
}

export default function Program({ state, change, solver, view }: Props) {
  const t = useT();
  const ix = useMemo(() => buildIndex(state), [state]);
  const notify = useToast();

  const drop = useCallback(
    (data: DragData, day: number, hour: number) => {
      // Read out of the map BEFORE change(): React runs a reducer callback
      // late, and reading a ref or a closure variable inside one is how the
      // solver's whole result once went missing (pitfall 20).
      const verdict = data.map.get(`${day}|${hour}`);
      const pushedOut = verdict?.evicts ?? [];
      const lesson = ix.lessonById.get(data.lessonId);
      const told =
        pushedOut.length === 0 || lesson === undefined
          ? ''
          : evictionNotice(
              ix,
              pushedOut.map((id) => ix.lessonById.get(id)).filter((x) => x !== undefined),
            ).replace(t('dönecek'), t('döndü'));

      change((d) => {
        // Lifting the old block and laying the new one down are ONE reducer
        // call, so a move costs one undo step and Ctrl+Z puts the lesson back
        // where it was — not into the pool. The eviction rides along in the
        // same call for the same reason: dropping onto an occupied cell is one
        // move, so it is one Ctrl+Z.
        let next = d;
        if (data.source !== null) {
          next = removeBlock(d, data.source.classId, data.source.day, data.source.hour);
          if (next === d) return d; // the block went away mid-drag; touch nothing
        }

        // The cells the new block will cover, cleared of whatever is in them.
        // Re-derived from the state React just handed us rather than trusted
        // from the drag's snapshot: between pointerdown and here, an autosave,
        // an undo or a solver run may have moved the grid underneath.
        if (pushedOut.length > 0 && lesson !== undefined) {
          const span = Math.max(1, data.blockSize);
          const hours: number[] = [];
          for (let i = 0; i < span; i++) hours.push(hour + i);
          next = evict(next, lesson.classId, day, hours);
        }

        return place(next, data.lessonId, day, hour, data.blockSize);
      });

      if (told !== '') notify(told);
    },
    [change, ix, notify],
  );

  const { start, dragging, reason } = useDrag(drop);

  // `t` is IN the deps and not an import, so a language switch rebuilds the
  // rows. A module-level translator would read the new language only the next
  // time `state` happened to change.
  const rows = useMemo(() => buildRows(state, ix, view, t), [state, ix, view, t]);
  const { cards, completed } = useMemo(() => buildPool(state, ix, view), [state, ix, view]);

  // What the bar under the toolbar says. Drag first: that answers a question
  // the hand is asking right now.
  const { text: barText, level: barLevel } = describeBar(
    reason,
    dragging !== null,
    solver,
    view,
    t,
  );

  const cellRemove = useCallback(
    (rowId: string, day: number, hour: number) => {
      change((d) => {
        // In the teacher view the row id is a teacher; removing needs the class.
        let classId: Id | null = rowId;
        if (view === 'teacher') {
          const fresh = buildIndex(d);
          const lessonId = fresh.teacherBusy.get(closedKey(rowId, day, hour));
          classId = lessonId === undefined ? null : (fresh.lessonById.get(lessonId)?.classId ?? null);
        }
        return classId === null ? d : removeBlock(d, classId, day, hour);
      });
    },
    [change, view],
  );

  /**
   * One drag, two sources: a card from the pool (`source === null`) or a block
   * already on the grid, which is being MOVED.
   *
   * The map is computed against a state with the source block ALREADY LIFTED.
   * Without that a placed lesson blocks itself — hard constraints 2 (the class
   * is busy) and 5 (the teacher is in another class) both see its own cells —
   * and it could not even be dropped back where it came from. Nothing is
   * removed for real here: the lift happens inside the drop's single change().
   */
  const beginDrag = useCallback(
    (
      e: React.PointerEvent,
      lessonId: Id,
      source: { classId: Id; day: number; hour: number } | null,
      size: number,
    ) => {
      // The grid is being rewritten under the cursor; a drop now would race it.
      if (solver.running) return;

      const lesson = ix.lessonById.get(lessonId);
      if (lesson === undefined) return;

      const base =
        source === null ? state : removeBlock(state, source.classId, source.day, source.hour);
      const baseIx = source === null ? ix : buildIndex(base);

      // Valid cells are computed HERE, once — never again during the drag.
      // The loop moved into `dropMap`: it is not a rendering decision, it is
      // the constraint engine answering 72 questions, and one of the answers
      // ("occupied by this class's own lesson") now costs an eviction to say.
      const map = dropMap(base, baseIx, lessonId, size);

      const group = ix.classById.get(lesson.classId);
      const teacher = ix.teacherById.get(lesson.teacherId);
      const teacherView = view === 'teacher';

      start(
        e,
        {
          lessonId,
          rowId: teacherView ? lesson.teacherId : lesson.classId,
          blockSize: Math.max(1, size),
          map,
          source,
        },
        {
          top: teacherView ? (group?.name ?? '?') : (teacher?.short ?? '?'),
          bottom: teacherView
            ? roomLetter(ix, group?.roomId)
            : subjectShort(state.settings, lessonSubject(state, lesson)),
          color: teacher?.color ?? 0,
        },
      );
    },
    [state, ix, view, start, solver.running],
  );

  const cardStart = useCallback(
    (e: React.PointerEvent, lessonId: Id, size: number) => beginDrag(e, lessonId, null, size),
    [beginDrag],
  );

  /** Left button on a placed block: pick it up and move it. */
  const cellMoveStart = useCallback(
    (e: React.PointerEvent, rowId: string, day: number, hour: number) => {
      const teacherView = view === 'teacher';
      const lessonId = teacherView
        ? ix.teacherBusy.get(closedKey(rowId, day, hour))
        : state.placements[placementKey(rowId, day, hour)];
      if (lessonId === undefined) return;

      const classId = teacherView
        ? (ix.lessonById.get(lessonId)?.classId ?? null)
        : rowId;
      if (classId === null) return;

      // The grabbed cell may be the middle of a block; the whole block moves —
      // and it carries its own length, which its lesson can no longer be asked
      // for now that one lesson can hold blocks of two different lengths.
      const found = blockAt(state, classId, day, hour);
      if (found === null) return;

      beginDrag(e, lessonId, { classId, day, hour: found.hour }, found.size);
    },
    [state, ix, view, beginDrag],
  );

  if (state.lessons.length === 0) {
    return (
      <>
        <div className="empty-screen">
          <strong>{t('Henüz dizilecek ders yok.')}</strong>
          <T k="Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, sonra her sınıfa haftalık ders saatlerini ekleyin. Ardından **Müsaitlik** sekmesinde öğretmenlerin gelemediği saatleri işaretleyin." />
          <br />
          <br />
          {t(
            'Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.',
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* One bar, three jobs: the drag reason, the solver's progress and the
          solver's verdict. It has a FIXED height so the grid never jumps down
          when something appears in it, and it is the line the eye is already
          trained on. The drag always wins — that one is answering a question
          the hand is asking right now.

          `aria-live="polite"` because two of the three jobs are announcements
          nobody is looking at this line for: the solver runs for seconds and
          then says what it managed, and a blocked drop says why. The
          accessibility contract has named this line since the round that
          removed the design constraints; until 2026-08-27 it was the one place
          that never got it. `polite` and not `assertive`: it must not cut into
          a dialog, and the DRAG reason updates several times a second while the
          pointer moves — the region is on the wrapper so those coalesce into
          one announcement per settled state rather than one per frame. */}
      <div
        className={`reason-bar${barLevel === '' ? '' : ` ${barLevel}`}`}
        role="status"
        aria-live="polite"
      >
        <span>{barText}</span>
        {solver.result !== null && !solver.running && (
          <span className="bar-actions">
            {solver.result.stuck.length > 0 && (
              <span className="hint inline">{t('Ayrıntı: Kontrol sekmesi.')}</span>
            )}
            <button className="btn" onClick={solver.clear}>{t('Tamam')}</button>
          </span>
        )}
      </div>

      {/* The instrument and the pool, side by side. The pool used to sit under
          the grid and cost it 215px of height; down the right it takes width
          from a table that was already scrolling. */}
      <div className="program-body">
        <Grid
          settings={state.settings}
          rows={rows}
          firstColumnTitle={view === 'teacher' ? t('Öğretmen') : t('Sınıf')}
          draggedRowId={dragging?.rowId ?? null}
          onCellRemove={cellRemove}
          onCellMoveStart={cellMoveStart}
        />

        <LessonPool cards={cards} completed={completed} onStart={cardStart} />
      </div>
    </>
  );
}
