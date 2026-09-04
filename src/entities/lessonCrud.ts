// Lessons: add, edit, delete.
//
// Moving one to another teacher or another class is NOT here — that re-judges
// every placed block and lives in `lessonMove.ts`.

import { clampBlocks } from '../schedule/blocks';
import { sanitize } from '../constraints';
import { newId } from './ids';
import { mapProgramGrids } from '../state/programs';
import type { Id, Lesson, State } from '../types';

export function addLesson(
  d: State,
  // `second` is optional for the same reason `gender` is on addTeacher: every
  // caller that predates it hands over four fields, and the usual answer — the
  // teacher's only subject — is the one a missing field should mean.
  fields: Omit<Lesson, 'id' | 'maxPerDay' | 'second'> & { second?: boolean },
): State {
  const weeklyHours = Math.max(1, Math.round(fields.weeklyHours));
  const created: Lesson = {
    id: newId(),
    classId: fields.classId,
    teacherId: fields.teacherId,
    weeklyHours,
    blocks: clampBlocks(weeklyHours, fields.blocks),
    second: fields.second === true,
    maxPerDay: null,
  };
  return { ...d, lessons: [...d.lessons, created] };
}

export function updateLesson(d: State, id: Id, fields: Partial<Lesson>): State {
  const before = d.lessons.find((x) => x.id === id);
  const lessons = d.lessons.map((x) => {
    if (x.id !== id) return x;
    const merged = { ...x, ...fields, id };
    // Raising the hours leaves the blocks alone; lowering them can force the
    // shape to shrink, and the clamp is the one place that says by how much.
    return { ...merged, blocks: clampBlocks(merged.weeklyHours, merged.blocks) };
  });

  // If the SPLIT changed, the placed blocks are the wrong lengths and the
  // convention that reads them off the grid would chop the same cells up
  // differently; safest is to drop them.
  const after = lessons.find((x) => x.id === id);
  if (!splitChanged(before, after)) return { ...d, lessons };

  return mapProgramGrids({ ...d, lessons }, (program) => ({
    ...program,
    placements: withoutLesson(program.placements, id),
  }));
}

/** Did the SHAPE of the week change — not merely its total? */
function splitChanged(before: Lesson | undefined, after: Lesson | undefined): boolean {
  if (before === undefined || after === undefined) return false;
  return (
    before.blocks.length !== after.blocks.length ||
    before.blocks.some((b, i) => b !== after.blocks[i])
  );
}

/** Every cell one lesson holds, removed from a grid's placements. */
function withoutLesson(placements: Record<string, Id>, id: Id): Record<string, Id> {
  const next = { ...placements };
  for (const key in next) {
    if (next[key] === id) delete next[key];
  }
  return next;
}

// sanitize(): the lesson's placements and pins go with it.
export function deleteLesson(d: State, id: Id): State {
  return sanitize({ ...d, lessons: d.lessons.filter((x) => x.id !== id) });
}
