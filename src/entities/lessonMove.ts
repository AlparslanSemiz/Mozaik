// Handing one lesson to a different TEACHER or a different CLASS.
//
// Not plain CRUD, and that is why these two are not in `lessonCrud.ts`: each
// one lifts every placed block and offers it its square back against a rebuilt
// index, so the same `blocker()` that judges a drag judges this too. A rule
// cannot mean one thing while dragging and another while editing.

import { blocker, buildIndex, place, placedBlocks, placementKey, sanitize } from '../constraints';
import { activePinned, activePlacements, replaceActiveGrid } from '../programs';
import { lessonSubject, subjectKey, teacherSubjects } from '../schedule/subjects';
import type { Id, Lesson, ProgramVariant, State } from '../types';

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
  let work: State = { ...d, lessons };

  // The teacher is shared, so every alternative grid has to be judged. Doing
  // only the open one would leave a quiet double-booking in the others.
  for (const program of d.programs) {
    const grid: State = { ...work, activeProgramId: program.id };
    const moved = grid.lessons.find((item) => item.id === id)!;
    const blocks = placedBlocks(grid, moved);
    const lifted = replaceActiveGrid(grid, { placements: withoutLesson(activePlacements(grid), id) });
    const settled = replaceBlocks(lifted, id, blocks);
    returned += settled.returned;
    work = settled.state;
  }
  return { state: sanitize({ ...work, activeProgramId: d.activeProgramId }), returned };
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
  let work: State = { ...d, lessons };

  // Every alternative grid, for the same reason `transferLesson` walks them:
  // the school data is shared and only the grids differ.
  for (const program of d.programs) {
    const grid: State = { ...work, activeProgramId: program.id };
    // Read off the OLD row, so the blocks have to be found before the lessons
    // list is swapped under them.
    const blocks = placedBlocks({ ...grid, lessons: d.lessons }, lesson);
    const pins = withoutPins(activePinned(grid), lesson, blocks);
    unpinned += pins.removed;

    const lifted = replaceActiveGrid(grid, {
      placements: withoutLesson(activePlacements(grid), id),
      pinned: pins.pinned,
    });
    const settled = replaceBlocks(lifted, id, blocks);
    returned += settled.returned;
    work = settled.state;
  }
  return {
    state: sanitize({ ...work, activeProgramId: d.activeProgramId }),
    returned,
    unpinned,
  };
}

/** Every cell one lesson holds, removed from a grid's placements. */
function withoutLesson(placements: Record<string, Id>, id: Id): Record<string, Id> {
  const next = { ...placements };
  for (const key in next) {
    if (next[key] === id) delete next[key];
  }
  return next;
}

/** The pins on the squares this lesson is about to leave, and how many went. */
function withoutPins(
  source: ProgramVariant['pinned'],
  lesson: Lesson,
  blocks: Array<{ day: number; hour: number; size: number }>,
): { pinned: ProgramVariant['pinned']; removed: number } {
  const pinned = { ...source };
  let removed = 0;
  for (const block of blocks) {
    for (let k = 0; k < block.size; k++) {
      const key = placementKey(lesson.classId, block.day, block.hour + k);
      if (pinned[key] !== undefined) {
        delete pinned[key];
        removed++;
      }
    }
  }
  return { pinned, removed };
}

/**
 * Offers each lifted block its own square back, one at a time against a freshly
 * built index. Whatever `blocker()` clears goes down again; whatever it refuses
 * is counted as returned to the tray.
 */
function replaceBlocks(
  grid: State,
  id: Id,
  blocks: Array<{ day: number; hour: number; size: number }>,
): { state: State; returned: number } {
  let work = grid;
  let returned = 0;
  for (const block of blocks) {
    const ix = buildIndex(work);
    if (blocker(work, ix, id, block.day, block.hour, block.size) === null) {
      work = place(work, id, block.day, block.hour, block.size);
    } else {
      returned++;
    }
  }
  return { state: work, returned };
}
