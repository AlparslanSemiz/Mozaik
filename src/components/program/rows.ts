// The grid's rows, built from the school rather than drawn.
//
// Pure: it takes State and the index and hands back the rows Grid renders, so
// a .tsx file never walks `placements` itself. Which axis the rows are — the
// teacher's week or the class's — is the ONLY thing that differs between the
// two branches; everything below it is one reading.

import {
  closedConflicts,
  closedKey,
  placedBlocks,
  placementKey,
} from '../../constraints';
import type { Index } from '../../constraints';
import { lessonSubject, subjectShort, teacherSubjects } from '../../entities';
import { activePinned, activePlacements } from '../../programs';
import { programColorIndex } from '../../programColor';
import type { ProgramColorMode } from '../../programColor';
import type { ProgramMask } from '../../programMask';
import type { View } from '../../toolState';
import type { Id, State } from '../../types';
import type { GridCell, GridRow } from './Grid';
import type { Translate } from '../T';

export function roomLetter(ix: Index, roomId: string | null | undefined): string {
  if (roomId == null) return "";
  return ix.roomById.get(roomId)?.name ?? "";
}

export function buildRows(
  d: State,
  ix: Index,
  view: View,
  mask: ProgramMask,
  colorMode: ProgramColorMode,
  t: Translate,
): GridRow[] {
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
  const placements = activePlacements(d);
  const pinned = activePinned(d);
  const continuesAt = (
    classId: Id,
    day: number,
    hour: number,
    lessonId: Id,
  ): boolean =>
    placements[placementKey(classId, day, hour + 1)] === lessonId &&
    !heads.has(placementKey(classId, day, hour + 1));

  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const n = dayCount * hourCount;

  if (view === "teacher") {
    return d.teachers
      .map((t) => {
        const cells: Array<GridCell | null> = new Array(n).fill(null);
        const closed: boolean[] = new Array(n).fill(false);

        for (let g = 0; g < dayCount; g++) {
          for (let s = 0; s < hourCount; s++) {
            const i = g * hourCount + s;
            closed[i] = d.unavailable[closedKey(t.id, g, s)] !== undefined;

            const lessonId = ix.teacherBusy.get(closedKey(t.id, g, s));
            if (lessonId === undefined) continue;
            const group = ix.classById.get(
              ix.lessonById.get(lessonId)?.classId ?? "",
            );
            cells[i] = {
              lessonId,
              top: group?.name ?? "?",
              bottom: roomLetter(ix, group?.roomId),
              color:
                ix.lessonById.get(lessonId) === undefined
                  ? t.color
                  : programColorIndex(d, ix.lessonById.get(lessonId)!, colorMode),
              conflict:
                conflicts.get(placementKey(group?.id ?? "", g, s)) ?? null,
              pinned: pinned[placementKey(group?.id ?? "", g, s)] !== undefined,
              mask: group === undefined ? undefined : mask.classes[group.id],
              continues:
                s + 1 < hourCount &&
                group !== undefined &&
                continuesAt(group.id, g, s, lessonId),
            };
          }
        }
        return {
          id: t.id,
          kind: "teacher" as const,
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
            .join(" · "),
          color: t.color,
          cells,
          closed,
          mask: mask.teachers[t.id],
        };
      })
      .filter((row) => row.mask !== "hidden");
  }

  return d.classes
    .map((group) => {
      const cells: Array<GridCell | null> = new Array(n).fill(null);
      const closed: boolean[] = new Array(n).fill(false);

      for (let g = 0; g < dayCount; g++) {
        for (let s = 0; s < hourCount; s++) {
          const i = g * hourCount + s;
          closed[i] =
            d.unavailable[closedKey(group.id, g, s)] !== undefined ||
            (group.roomId != null &&
              d.unavailable[closedKey(group.roomId, g, s)] !== undefined);

          const lessonId = placements[placementKey(group.id, g, s)];
          if (lessonId === undefined) continue;
          const lesson = ix.lessonById.get(lessonId);
          const teacher = ix.teacherById.get(lesson?.teacherId ?? "");
          cells[i] = {
            lessonId,
            top: teacher?.short ?? "?",
            // The LESSON's subject, not the teacher's first one: a teacher who
            // holds two is in this class for exactly one of them.
            bottom:
              lesson === undefined
                ? ""
                : subjectShort(d.settings, lessonSubject(d, lesson)),
            color:
              lesson === undefined
                ? (teacher?.color ?? 0)
                : programColorIndex(d, lesson, colorMode),
            conflict: conflicts.get(placementKey(group.id, g, s)) ?? null,
            pinned: pinned[placementKey(group.id, g, s)] !== undefined,
            mask: teacher === undefined ? undefined : mask.teachers[teacher.id],
            continues:
              s + 1 < hourCount && continuesAt(group.id, g, s, lessonId),
          };
        }
      }
      const letter = roomLetter(ix, group.roomId);
      return {
        id: group.id,
        kind: "class" as const,
        name: group.name,
        secondary:
          letter === "" ? t("derslik yok") : t("{ad} dersliği", { ad: letter }),
        color: group.color,
        cells,
        closed,
        mask: mask.classes[group.id],
      };
    })
    .filter((row) => row.mask !== "hidden");
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
