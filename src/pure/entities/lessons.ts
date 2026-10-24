// Lessons: adding, updating, moving to another teacher or class, deleting.

import {
  type Id,
  type Lesson,
  type State,
  clampBlocks,
  lessonSubject,
  subjectKey,
  teacherSubjects,
} from '../../leaf/model';
import { blocker, buildIndex, place, placedBlocks, placementKey, sanitize } from '../constraints';
import { activePinned, activePlacements, mapProgramGrids, replaceActiveGrid } from '../grid';
import { newId } from './identity';

// ------------------------------------------------------------------- lesson

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
  const splitChanged =
    before !== undefined &&
    after !== undefined &&
    (before.blocks.length !== after.blocks.length ||
      before.blocks.some((b, i) => b !== after.blocks[i]));
  if (!splitChanged) return { ...d, lessons };

  return mapProgramGrids({ ...d, lessons }, (program) => {
    const placements = { ...program.placements };
    for (const key in placements) {
      if (placements[key] === id) delete placements[key];
    }
    return { ...program, placements };
  });
}

/**
 * Hands one lesson to a different teacher, and JUDGES its placements.
 *
 * The naive version is one line — `updateLesson(d, id, { teacherId })` — and it
 * is wrong in a way nothing on screen would show. `placements` is keyed by
 * class, so every cell stays exactly where it was; but teacher occupancy is
 * DERIVED, and `buildIndex` writes it into a Map (`teacherBusy`). Two lessons
 * on one teacher at one hour therefore do not clash, they OVERWRITE — last one
 * in wins — and neither `sanitize()` nor `findViolations()` looks for it. The
 * receiving teacher would quietly stand in two rooms at once, on a printed
 * sheet, with every count still adding up.
 *
 * So each block is lifted and offered its own square back, against an index
 * rebuilt without it: whatever `blocker()` clears goes down again, whatever it
 * refuses returns to the pool. Same question the auditor asks of a laid-out
 * grid (`worlds.ts`), and the same one a drag asks — the rules cannot mean one
 * thing here and another there.
 *
 * `second` is re-read rather than carried: the flag points at one of the OLD
 * teacher's two fields, and the new teacher's fields are their own. Carried
 * over blindly, a lesson silently changes subject.
 *
 * Returns the lesson's blocks that could NOT be re-placed, so the caller can
 * say how many went back to the tray.
 */
export function transferLesson(
  d: State,
  id: Id,
  teacherId: Id,
): { state: State; returned: number } {
  const lesson = d.lessons.find((x) => x.id === id);
  const next = d.teachers.find((x) => x.id === teacherId);
  if (lesson === undefined || next === undefined || lesson.teacherId === teacherId) {
    return { state: d, returned: 0 };
  }

  // Which of the new teacher's fields teaches what this lesson was under. Not
  // found -> the first one, which is what a single-subject teacher means.
  const wanted = subjectKey(lessonSubject(d, lesson));
  const mine = teacherSubjects(next);
  const second = mine.length > 1 && subjectKey(mine[1] ?? '') === wanted;

  const lessons = d.lessons.map((x) => (x.id === id ? { ...x, teacherId, second } : x));
  let returned = 0;
  const originalActive = d.activeProgramId;
  let work: State = { ...d, lessons };

  // The teacher is shared, so every alternative grid has to be judged. Doing
  // only the open one would leave a quiet double-booking in the others.
  for (const program of d.programs) {
    let grid: State = { ...work, activeProgramId: program.id };
    const changedLesson = grid.lessons.find((item) => item.id === id)!;
    const blocks = placedBlocks(grid, changedLesson);
    const placements = { ...activePlacements(grid) };
    for (const key in placements) {
      if (placements[key] === id) delete placements[key];
    }
    grid = replaceActiveGrid(grid, { placements });

    for (const block of blocks) {
      const ix = buildIndex(grid);
      if (blocker(grid, ix, id, block.day, block.hour, block.size) === null) {
        grid = place(grid, id, block.day, block.hour, block.size);
      } else {
        returned++;
      }
    }
    work = grid;
  }
  return { state: sanitize({ ...work, activeProgramId: originalActive }), returned };
}

/**
 * Hands one lesson to a different CLASS, and judges its placements.
 *
 * The mirror of `transferLesson`, and wrong in the opposite way if written
 * naively. There the cells stayed put and the teacher's occupancy was derived;
 * here `placements` is keyed BY CLASS, so changing `classId` leaves every hour
 * of this lesson sitting in the old class's row — the timetable would show the
 * lesson under a class that no longer has it, and the new class would look
 * free. `sanitize()` would not notice: the keys are well formed and the lesson
 * exists.
 *
 * So each block is lifted off the old row and offered the SAME square on the
 * new one, against an index rebuilt without it. Whatever `blocker()` clears
 * goes down again; whatever it refuses goes back to the tray. Same question
 * the auditor asks and the same one a drag asks.
 *
 * PINS GO. A pin is `classId|day|hour`, so a pin left behind would point at a
 * square belonging to someone else and lock a stranger's hour. The count comes
 * back so the caller can say what it cost before it happens.
 *
 * `blocks` and `second` are carried untouched: the shape of the week and which
 * of the teacher's branches this is are facts about the lesson, and neither
 * end of it moved.
 */
export function moveLessonToClass(
  d: State,
  id: Id,
  classId: Id,
): { state: State; returned: number; unpinned: number } {
  const lesson = d.lessons.find((x) => x.id === id);
  const next = d.classes.find((x) => x.id === classId);
  if (lesson === undefined || next === undefined || lesson.classId === classId) {
    return { state: d, returned: 0, unpinned: 0 };
  }

  const lessons = d.lessons.map((x) => (x.id === id ? { ...x, classId } : x));
  let returned = 0;
  let unpinned = 0;
  const originalActive = d.activeProgramId;
  let work: State = { ...d, lessons };

  // Every alternative grid, for the same reason `transferLesson` walks them:
  // the school data is shared and only the grids differ.
  for (const program of d.programs) {
    let grid: State = { ...work, activeProgramId: program.id };
    // Read off the OLD row, so the blocks have to be found before the lessons
    // list is swapped under them.
    const old: State = { ...grid, lessons: d.lessons };
    const blocks = placedBlocks(old, lesson);

    const placements = { ...activePlacements(grid) };
    for (const key in placements) {
      if (placements[key] === id) delete placements[key];
    }
    const pinned = { ...activePinned(grid) };
    for (const block of blocks) {
      for (let k = 0; k < block.size; k++) {
        if (pinned[placementKey(lesson.classId, block.day, block.hour + k)] !== undefined) {
          delete pinned[placementKey(lesson.classId, block.day, block.hour + k)];
          unpinned++;
        }
      }
    }
    grid = replaceActiveGrid(grid, { placements, pinned });

    for (const block of blocks) {
      const ix = buildIndex(grid);
      if (blocker(grid, ix, id, block.day, block.hour, block.size) === null) {
        grid = place(grid, id, block.day, block.hour, block.size);
      } else {
        returned++;
      }
    }
    work = grid;
  }
  return { state: sanitize({ ...work, activeProgramId: originalActive }), returned, unpinned };
}

export function deleteLesson(d: State, id: Id): State {
  return sanitize({ ...d, lessons: d.lessons.filter((x) => x.id !== id) });
}
