// The main screen. Wires the grid, the lesson pool and the dragging together.
//
// Performance contract (for the slow machine):
//   - `rows` and `cards` are useMemo'd, recomputed only when the state changes.
//   - Grid is React.memo; changing the reason bar does not redraw the grid.
//   - No state changes at all during a drag (see drag.ts).

import { useCallback, useMemo, useState } from 'react';
import type React from 'react';
import {
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
import type { State, Id } from '../types';
import Grid from './Grid';
import type { GridCell, GridRow } from './Grid';
import LessonPool from './LessonPool';
import type { PoolCard } from './LessonPool';

type View = 'teacher' | 'class';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
}

function roomLetter(ix: Index, roomId: string | null | undefined): string {
  if (roomId == null) return '';
  return ix.roomById.get(roomId)?.name ?? '';
}

/**
 * The two views. `aria-label` is not optional here: the buttons carry no text,
 * so it is the only name a screen reader — or a test — can find them by.
 */
const VIEWS: Array<{ id: View; label: string; icon: React.ReactElement }> = [
  {
    // A mortarboard — the symbol aSc uses for Teachers, and the one thing on
    // screen that cannot be mistaken for a person. The two icons used to be one
    // head and three heads; at 17px that difference is invisible.
    id: 'teacher',
    label: 'Öğretmen görünümü',
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <path d="M10 2.4 19.2 6.6 10 10.8 0.8 6.6Z" fill="currentColor" />
        <path
          d="M5 8.5 10 10.8 15 8.5v3.4c0 1.5-2.2 2.5-5 2.5s-5-1-5-2.5Z"
          fill="currentColor"
        />
        <path d="M17.6 7.5h1.2v5.2h-1.2Z" fill="currentColor" />
        <circle cx="18.2" cy="13.6" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'class',
    // A group of students: three figures, the middle one nearer. A class is the
    // only thing in this tool that is a crowd.
    label: 'Sınıf görünümü',
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <circle cx="4.2" cy="6.4" r="2.2" fill="currentColor" />
        <circle cx="15.8" cy="6.4" r="2.2" fill="currentColor" />
        <path d="M0.4 15.4c0-2.5 1.7-4.2 3.8-4.2s3.8 1.7 3.8 4.2Z" fill="currentColor" />
        <path d="M12 15.4c0-2.5 1.7-4.2 3.8-4.2s3.8 1.7 3.8 4.2Z" fill="currentColor" />
        <circle cx="10" cy="8.2" r="3" fill="currentColor" />
        <path d="M4.9 18c0-3.1 2.3-5.2 5.1-5.2s5.1 2.1 5.1 5.2Z" fill="currentColor" />
      </svg>
    ),
  },
];

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
      return { id: t.id, name: t.short, secondary: t.subject, color: t.color, cells, closed };
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
 *   sorted by bottom, so one row's cards stand together
 *
 * In the teacher view that is exactly what it always did.
 */
function buildPool(d: State, ix: Index, view: View): { cards: PoolCard[]; completed: number } {
  const cards: PoolCard[] = [];
  let completed = 0;
  const teacherView = view === 'teacher';

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
    (a, b) => a.bottom.localeCompare(b.bottom, 'tr') || a.top.localeCompare(b.top, 'tr'),
  );
  return { cards, completed };
}

export default function Program({ state, change }: Props) {
  const [view, setView] = useState<View>('teacher');
  const ix = useMemo(() => buildIndex(state), [state]);

  const drop = useCallback(
    (lessonId: Id, day: number, hour: number) => {
      change((d) => place(d, lessonId, day, hour));
    },
    [change],
  );

  const { start, dragging, reason } = useDrag(drop);

  const rows = useMemo(() => buildRows(state, ix, view), [state, ix, view]);
  const { cards, completed } = useMemo(() => buildPool(state, ix, view), [state, ix, view]);

  const cellClick = useCallback(
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

  const cardStart = useCallback(
    (e: React.PointerEvent, lessonId: Id) => {
      const lesson = ix.lessonById.get(lessonId);
      if (lesson === undefined) return;

      // Valid cells are computed HERE, once — never again during the drag.
      const map = new Map<string, Verdict>();
      for (let g = 0; g < state.settings.days.length; g++) {
        for (let s = 0; s < state.settings.hours.length; s++) {
          map.set(`${g}|${s}`, check(state, ix, lessonId, g, s));
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
    [state, ix, view, start],
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
      <div className="topbar subbar">
        {/* Two positions, not one toggle: a single button saying "switch to the
            class view" tells you what the next click does, never where you are.
            Icons are inline SVG (no library, offline) and use currentColor, so
            they are right in both themes. */}
        <div className="view-switch">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className="btn icon"
              aria-pressed={view === v.id}
              aria-label={v.label}
              title={v.label}
              onClick={() => setView(v.id)}
            >
              {v.icon}
            </button>
          ))}
        </div>
        <span className="hint inline">
          {view === 'teacher'
            ? 'Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş derse tıklayınca kalkar.'
            : 'Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş derse tıklayınca kalkar.'}
        </span>
      </div>

      <div
        className={`reason-bar${reason === null ? ' empty' : ''}${
          reason?.level === 'warn' ? ' warn' : ''
        }`}
      >
        {reason?.text ?? (dragging !== null ? 'Buraya bırakılabilir.' : '')}
      </div>

      <Grid
        settings={state.settings}
        rows={rows}
        firstColumnTitle={view === 'teacher' ? 'Öğretmen' : 'Sınıf'}
        draggedRowId={dragging?.rowId ?? null}
        onCellClick={cellClick}
      />

      <LessonPool cards={cards} completed={completed} onStart={cardStart} />
    </>
  );
}
