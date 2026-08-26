// The main screen. Wires the grid, the lesson pool and the dragging together.
//
// Performance contract (for the slow machine):
//   - `rows` and `cards` are useMemo'd, recomputed only when the state changes.
//   - Grid is React.memo; changing the reason bar does not redraw the grid.
//   - No state changes at all during a drag (see drag.ts).

import { useCallback, useMemo } from 'react';
import type React from 'react';
import {
  blockStart,
  buildIndex,
  check,
  closedConflicts,
  closedKey,
  removeBlock,
  placementKey,
  place,
} from '../constraints';
import type { Index, Verdict } from '../constraints';
import { subjectShort } from '../entities';
import { useDrag } from '../drag';
import type { DragData, Reason } from '../drag';
import type { SolverRun } from '../useSolver';
import type { State, Id } from '../types';
import type { View } from '../toolState';
import Grid from './Grid';
import type { GridCell, GridRow } from './Grid';
import LessonPool from './LessonPool';
import type { PoolCard } from './LessonPool';

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
): { text: string; level: string } {
  if (reason !== null) return { text: reason.text, level: reason.level === 'warn' ? 'warn' : 'bad' };
  if (dragging) return { text: 'Buraya bırakılabilir.', level: 'ok' };

  const p = solver.progress;
  if (solver.running && p !== null) {
    return {
      text: `Otomatik diziliyor… ${p.placedBlocks}/${p.totalBlocks} blok · ${seconds(p.elapsedMs)} sn`,
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
          ? 'Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.'
          : 'Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.',
      level: '',
    };
  }

  if (done.stuck.length === 0) {
    return {
      text: `Program dizildi. ${done.placedBlocks} blok yerleşti (${seconds(done.elapsedMs)} sn). Ctrl+Z ile geri alabilirsiniz.`,
      level: 'ok',
    };
  }

  const worst = done.stuck[0]!;
  const others =
    done.stuck.length > 1 ? ` (ve ${done.stuck.length - 1} ders daha)` : '';
  const head =
    done.phase === 'cancelled'
      ? `Durduruldu. ${done.placedBlocks}/${done.totalBlocks} blok yerleşti.`
      : `${done.placedBlocks}/${done.totalBlocks} blok yerleşti.`;
  return {
    text: `${head} ${worst.name}: ${worst.missing} saat yerleşemedi — ${worst.reason}${others}.`,
    level: done.phase === 'cancelled' ? 'warn' : 'bad',
  };
}

function roomLetter(ix: Index, roomId: string | null | undefined): string {
  if (roomId == null) return '';
  return ix.roomById.get(roomId)?.name ?? '';
}

function buildRows(d: State, ix: Index, view: View): GridRow[] {
  // Availability is edited after the timetable is laid out, and a cell whose
  // hour has since been closed used to look perfectly normal: the hatch is only
  // drawn on EMPTY cells, so the card simply covered it up.
  const conflicts = new Map<string, string>();
  for (const c of closedConflicts(d, ix)) {
    conflicts.set(placementKey(c.classId, c.day, c.hour), c.reason);
  }

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
              s + 1 < hourCount && ix.teacherBusy.get(closedKey(t.id, g, s + 1)) === lessonId,
          };
        }
      }
      return {
        id: t.id,
        kind: 'teacher' as const,
        name: t.short,
        secondary: t.subject,
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
        const teacher = ix.teacherById.get(ix.lessonById.get(lessonId)?.teacherId ?? '');
        cells[i] = {
          lessonId,
          top: teacher?.short ?? '?',
          bottom: teacher === undefined ? '' : subjectShort(d.settings, teacher.subject),
          color: teacher?.color ?? 0,
          conflict: conflicts.get(placementKey(group.id, g, s)) ?? null,
          continues:
            s + 1 < hourCount && d.placements[placementKey(group.id, g, s + 1)] === lessonId,
        };
      }
    }
    const letter = roomLetter(ix, group.roomId);
    return {
      id: group.id,
      kind: 'class' as const,
      name: group.name,
      secondary: letter === '' ? 'derslik yok' : `${letter} dersliği`,
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
    const placed = ix.placedHours.get(lesson.id) ?? 0;
    if (placed >= lesson.weeklyHours) {
      completed++;
      continue;
    }
    const group = ix.classById.get(lesson.classId);
    const teacher = ix.teacherById.get(lesson.teacherId);
    const className = group?.name ?? '?';
    const teacherShort = teacher?.short ?? '?';
    cards.push({
      lessonId: lesson.id,
      row: rowAt.get(teacherView ? lesson.teacherId : lesson.classId) ?? Number.MAX_SAFE_INTEGER,
      top: teacherView ? className : teacherShort,
      bottom: teacherView ? teacherShort : className,
      subject: teacher?.subject ?? '',
      // The card keeps the TEACHER's colour in both views: a cell is always
      // painted by its teacher, so this is what the card will look like.
      color: teacher?.color ?? 0,
      placed,
      total: lesson.weeklyHours,
    });
  }

  cards.sort(
    (a, b) => a.row - b.row || a.top.localeCompare(b.top, 'tr'),
  );
  return { cards, completed };
}

export default function Program({ state, change, solver, view }: Props) {
  const ix = useMemo(() => buildIndex(state), [state]);

  const drop = useCallback(
    (data: DragData, day: number, hour: number) => {
      change((d) => {
        // Lifting the old block and laying the new one down are ONE reducer
        // call, so a move costs one undo step and Ctrl+Z puts the lesson back
        // where it was — not into the pool.
        if (data.source === null) return place(d, data.lessonId, day, hour);
        const lifted = removeBlock(d, data.source.classId, data.source.day, data.source.hour);
        if (lifted === d) return d; // the block went away mid-drag; touch nothing
        return place(lifted, data.lessonId, day, hour);
      });
    },
    [change],
  );

  const { start, dragging, reason } = useDrag(drop);

  const rows = useMemo(() => buildRows(state, ix, view), [state, ix, view]);
  const { cards, completed } = useMemo(() => buildPool(state, ix, view), [state, ix, view]);

  // What the bar under the toolbar says. Drag first: that answers a question
  // the hand is asking right now.
  const { text: barText, level: barLevel } = describeBar(reason, dragging !== null, solver, view);

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
    ) => {
      // The grid is being rewritten under the cursor; a drop now would race it.
      if (solver.running) return;

      const lesson = ix.lessonById.get(lessonId);
      if (lesson === undefined) return;

      const base =
        source === null ? state : removeBlock(state, source.classId, source.day, source.hour);
      const baseIx = source === null ? ix : buildIndex(base);

      // Valid cells are computed HERE, once — never again during the drag.
      const map = new Map<string, Verdict>();
      for (let g = 0; g < base.settings.days.length; g++) {
        for (let s = 0; s < base.settings.hours.length; s++) {
          map.set(`${g}|${s}`, check(base, baseIx, lessonId, g, s));
        }
      }

      const group = ix.classById.get(lesson.classId);
      const teacher = ix.teacherById.get(lesson.teacherId);
      const teacherView = view === 'teacher';

      start(
        e,
        {
          lessonId,
          rowId: teacherView ? lesson.teacherId : lesson.classId,
          blockSize: Math.max(1, lesson.blockSize),
          map,
          source,
        },
        {
          top: teacherView ? (group?.name ?? '?') : (teacher?.short ?? '?'),
          bottom: teacherView
            ? roomLetter(ix, group?.roomId)
            : teacher === undefined
              ? ''
              : subjectShort(state.settings, teacher.subject),
          color: teacher?.color ?? 0,
        },
      );
    },
    [state, ix, view, start, solver.running],
  );

  const cardStart = useCallback(
    (e: React.PointerEvent, lessonId: Id) => beginDrag(e, lessonId, null),
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

      // The grabbed cell may be the middle of a block; the whole block moves.
      const from = blockStart(state, classId, day, hour);
      if (from === null) return;

      beginDrag(e, lessonId, { classId, day, hour: from });
    },
    [state, ix, view, beginDrag],
  );

  if (state.lessons.length === 0) {
    return (
      <>
        <div className="empty-screen">
          <strong>Henüz dizilecek ders yok.</strong>
          Önce <b>Kurulum</b> sekmesinden derslikleri, öğretmenleri ve sınıfları girin,
          sonra her sınıfa haftalık ders saatlerini ekleyin. Ardından <b>Müsaitlik</b>{' '}
          sekmesinde öğretmenlerin gelemediği saatleri işaretleyin.
          <br />
          <br />
          Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.
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
              <span className="hint inline">Ayrıntı: Kontrol sekmesi.</span>
            )}
            <button className="btn" onClick={solver.clear}>
              Tamam
            </button>
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
          firstColumnTitle={view === 'teacher' ? 'Öğretmen' : 'Sınıf'}
          draggedRowId={dragging?.rowId ?? null}
          onCellRemove={cellRemove}
          onCellMoveStart={cellMoveStart}
        />

        <LessonPool cards={cards} completed={completed} onStart={cardStart} />
      </div>
    </>
  );
}
