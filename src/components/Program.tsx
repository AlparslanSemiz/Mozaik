// The main screen. Wires the grid, the lesson pool and the dragging together.
//
// Performance contract (for the slow machine):
//   - `rows` and `cards` are useMemo'd, recomputed only when the state changes.
//   - Grid is React.memo; changing the reason bar does not redraw the grid.
//   - No state changes at all during a drag (see drag.ts).

import { useCallback, useMemo, useState } from 'react';
import type React from 'react';
import { buildIndex, check, closedKey, removeBlock, placementKey, place } from '../constraints';
import type { Index, Verdict } from '../constraints';
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

function buildRows(d: State, ix: Index, view: View): GridRow[] {
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
            continues:
              s + 1 < hourCount && ix.teacherBusy.get(closedKey(t.id, g, s + 1)) === lessonId,
          };
        }
      }
      return { id: t.id, name: t.short, secondary: t.subject, cells, closed };
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
          bottom: teacher?.subject ?? '',
          color: teacher?.color ?? 0,
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
      cells,
      closed,
    };
  });
}

function buildPool(d: State, ix: Index): { cards: PoolCard[]; completed: number } {
  const cards: PoolCard[] = [];
  let completed = 0;

  for (const lesson of d.lessons) {
    const placed = ix.placedHours.get(lesson.id) ?? 0;
    if (placed >= lesson.weeklyHours) {
      completed++;
      continue;
    }
    const group = ix.classById.get(lesson.classId);
    const teacher = ix.teacherById.get(lesson.teacherId);
    cards.push({
      lessonId: lesson.id,
      top: group?.name ?? '?',
      bottom: teacher?.short ?? '?',
      subject: teacher?.subject ?? '',
      color: teacher?.color ?? 0,
      placed,
      total: lesson.weeklyHours,
    });
  }

  // Keep the same teacher's cards side by side — easier to find the matching row.
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
  const { cards, completed } = useMemo(() => buildPool(state, ix), [state, ix]);

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
          bottom: teacherView ? roomLetter(ix, group?.roomId) : (teacher?.subject ?? ''),
          color: teacher?.color ?? 0,
        },
      );
    },
    [state, ix, view, start],
  );

  if (state.lessons.length === 0) {
    return (
      <div className="main">
        <div className="empty-screen">
          <strong>Henüz dizilecek ders yok.</strong>
          Önce <b>Kurulum</b> sekmesinden derslikleri, öğretmenleri ve sınıfları girin,
          sonra her sınıfa haftalık ders saatlerini ekleyin. Ardından <b>Müsaitlik</b>{' '}
          sekmesinde öğretmenlerin gelemediği saatleri işaretleyin.
          <br />
          <br />
          Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.
        </div>
      </div>
    );
  }

  return (
    <div className="main no-overflow">
      <div className="topbar subbar">
        <button
          className="btn"
          onClick={() => setView(view === 'teacher' ? 'class' : 'teacher')}
        >
          {view === 'teacher' ? 'Sınıf görünümüne geç' : 'Öğretmen görünümüne geç'}
        </button>
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
    </div>
  );
}
