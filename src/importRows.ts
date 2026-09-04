// Pasted rows -> state.
//
// These used to live inside the setup screen, untested. Matching a room or a
// teacher BY NAME is a decision about the data, not about the screen — and
// getting it wrong silently drops rows my father pasted.
//
// `import.ts` parses the text into rows; this turns rows into a school. The row
// types come across as `import type`, so there is no runtime cycle.

import { addClass } from './classCrud';
import type { ClassRow, LessonRow, TeacherRow } from './import';
import { addLesson } from './lessonCrud';
import { addRoom } from './roomCrud';
import { addSubject } from './subjectList';
import { addTeacher } from './teacherCrud';
import type { State } from './types';

const fold = (x: string): string => x.trim().toLocaleLowerCase('tr');

/**
 * Adds pasted teachers, REGISTERING any subject the school's list does not have
 * yet. A pasted list is the one way a subject can still arrive as free text —
 * the form only offers the list — and dropping it silently would leave a
 * teacher whose branch the dropdown cannot show.
 */
export function addTeachersFromRows(d: State, rows: TeacherRow[]): State {
  // BOTH subjects are registered. Missing the second one would leave a teacher
  // whose other branch the dropdown cannot show — the exact failure this
  // function exists to prevent, one column further to the right.
  return rows.reduce(
    (acc, row) => addTeacher(addSubject(addSubject(acc, row.subject), row.subject2), row),
    d,
  );
}

/**
 * Adds pasted classes, resolving the room by name. An unknown room name is
 * CREATED: leaving the class roomless would silently disable the room clash
 * check, and my father would never learn why two classes may share an hour.
 */
export function addClassesFromRows(d: State, rows: ClassRow[]): State {
  return rows.reduce((acc, row) => {
    if (row.roomName === '') return addClass(acc, row.name, null);

    const room = acc.rooms.find((r) => fold(r.name) === fold(row.roomName));
    if (room !== undefined) return addClass(acc, row.name, room.id);

    const withRoom = addRoom(acc, row.roomName);
    const created = withRoom.rooms[withRoom.rooms.length - 1];
    return addClass(withRoom, row.name, created?.id ?? null);
  }, d);
}

/**
 * Adds pasted lessons. A teacher matches on the short form OR the full name,
 * because a pasted list may hold either. Rows whose class or teacher is unknown
 * are NOT guessed at — they come back in `missing` so the user is told.
 */
export function addLessonsFromRows(
  d: State,
  rows: LessonRow[],
): { state: State; missing: string[] } {
  let state = d;
  const missing: string[] = [];

  for (const row of rows) {
    const group = state.classes.find((c) => fold(c.name) === fold(row.className));
    const teacher = state.teachers.find(
      (t) => fold(t.short) === fold(row.teacher) || fold(t.name) === fold(row.teacher),
    );
    if (group === undefined || teacher === undefined) {
      missing.push(`${row.className} / ${row.teacher}`);
      continue;
    }
    state = addLesson(state, {
      classId: group.id,
      teacherId: teacher.id,
      weeklyHours: row.weeklyHours,
      blocks: row.blocks,
    });
  }
  return { state, missing };
}
