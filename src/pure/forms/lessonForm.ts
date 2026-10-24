// The add-lesson form's rules (Dersler): which subjects and teachers it
// offers, what picking one does to the other, and what is kept for the next
// lesson. Moved out of `ui/lessons/index.tsx` unchanged (2026-10-24); the
// screen still holds the draft in its own state.
//
// BRANŞ AND ÖĞRETMEN, EACH FILLING THE OTHER IN.
//
//   "branş seçilince öğretmen seçiminin azalması, derslerde branş seçimi de
//    olmalı. öğretmen seçince branş kendiliğinden gelsin ama branş seçip
//    öğretmen de seçebilelim."
//
// Before this the form asked for the subject only when the chosen teacher
// held two of them, so twenty-five teachers came down one list in entry
// order and the subject was never a way IN — which is how a person actually
// thinks about a timetable ("who does Matematik for 510").

import { subjectKey, teacherSubjects, type Id, type State, type Teacher } from '../../leaf/model';
import { subjectOptions, subjectTeachers } from '../entities';

/** Whose lessons the screen is filling in (the ribbon's Yöntem). */
type LessonMode = 'teacher' | 'class' | 'all';

/** What the form's boxes hold while they are being filled in. */
export interface LessonDraft {
  classId: Id;
  teacherId: Id;
  /**
   * The subject is kept as a NAME here and nowhere else: `Lesson.second` is
   * still a flag, and it still has to be, because a stored name would become
   * a second truth that drifts the moment a teacher's subject is corrected
   * (the note on `Lesson.second` in types.ts). This field lives exactly as
   * long as the form does — it is what the two boxes agree on while they are
   * being filled in, and adding turns it back into the flag.
   */
  subject: string;
  hours: string;
}

// Which of a teacher's subjects a name is: 0, 1, or -1 for neither. The
// comparison goes through `subjectKey` because a subject is free text and
// "matematik" and "Matematik" are one subject (subjects.ts).
const slotOf = (subs: string[], name: string) =>
  subs.findIndex((x) => subjectKey(x) === subjectKey(name));

export interface LessonChoices {
  /** The chosen teacher's own one or two subjects. */
  teacherSubs: string[];
  /** The subjects the branch box offers. */
  subjectPool: string[];
  /** The subject the boxes are actually showing. */
  subjectValue: string;
  /** `Lesson.second`, derived. */
  secondFlag: boolean;
  /** The teachers the teacher box offers. */
  teacherPool: Teacher[];
  /** Whether the branch box asks anything at all. */
  askSubject: boolean;
}

export function lessonChoices(
  state: State,
  mode: LessonMode,
  newLesson: LessonDraft,
  newTeacherObj: Teacher | undefined,
): LessonChoices {
  // In the teacher-focused mode the teacher is not a choice, so the only
  // subjects worth offering are that teacher's own one or two. Everywhere else
  // the whole school list is offered and it works as a filter.
  const teacherSubs = newTeacherObj === undefined ? [] : teacherSubjects(newTeacherObj);
  const subjectPool =
    mode === 'teacher' && newTeacherObj !== undefined ? teacherSubs : subjectOptions(state);

  // The subject the boxes are actually showing. Derived and not stored, because
  // in the teacher-focused mode the teacher arrives from the RIBBON: switching
  // to another teacher there changes nothing in this form's state, and a stored
  // subject would then name a subject the new teacher does not hold — a
  // controlled `<select>` whose value matches no option draws blank.
  const subjectValue =
    mode === 'teacher' && slotOf(subjectPool, newLesson.subject) < 0
      ? (subjectPool[0] ?? '')
      : newLesson.subject;

  // `Lesson.second` derived from that, in ONE place. It used to be a third
  // field in the form's state, which meant the subject box and the flag could
  // disagree — and they did, every time the ribbon changed the focused teacher
  // underneath them.
  const secondFlag = slotOf(teacherSubs, subjectValue) === 1;

  // The half the reader asked for by name: choosing a subject shortens this
  // list. `subjectTeachers` already existed for the delete guard and the setup
  // summary — it counts BOTH of a teacher's fields, so a second-subject
  // teacher is found by either of them.
  const teacherPool =
    newLesson.subject === '' ? state.teachers : subjectTeachers(state, newLesson.subject);

  // In Öğretmenden the branch box only asks something when the teacher HOLDS
  // two. `subjectPool` is already that person's own branches there, so its
  // length is the question.
  const askSubject = mode !== 'teacher' || subjectPool.length > 1;

  return { teacherSubs, subjectPool, subjectValue, secondFlag, teacherPool, askSubject };
}

/** Picking a teacher fills the subject in — and picks WHICH of two it is. */
export function chooseTeacher(state: State, newLesson: LessonDraft, id: Id): LessonDraft {
  const t = state.teachers.find((x) => x.id === id);
  const subs = t === undefined ? [] : teacherSubjects(t);
  // Keep the subject already in the box if this teacher holds it: coming in
  // through the filter should not throw the filter away.
  const kept = slotOf(subs, newLesson.subject);
  const slot = kept >= 0 ? kept : 0;
  return { ...newLesson, teacherId: id, subject: subs[slot] ?? '' };
}

/** Picking a subject narrows the teachers — and drops one that cannot hold it. */
export function chooseSubject(
  newLesson: LessonDraft,
  name: string,
  newTeacherObj: Teacher | undefined,
  mode: LessonMode,
): LessonDraft {
  const teacherSubs = newTeacherObj === undefined ? [] : teacherSubjects(newTeacherObj);
  // The focused mode cannot drop its teacher — the ribbon owns that axis —
  // and it is never offered a subject that teacher does not hold anyway.
  const drops =
    name !== '' &&
    newTeacherObj !== undefined &&
    slotOf(teacherSubs, name) < 0 &&
    mode !== 'teacher';
  return {
    ...newLesson,
    subject: name,
    ...(drops ? { teacherId: '' } : {}),
  };
}

/**
 * What the form keeps after a lesson is added. Keep the axis this screen is
 * walking, clear the one that changes from lesson to lesson. The old form did
 * the exact opposite — it cleared the class — so eight lessons for one class
 * meant choosing it eight times. Hours and split stay: the next lesson is more
 * often the same length than it is a different length.
 */
export function afterAdd(newLesson: LessonDraft, mode: LessonMode): LessonDraft {
  return mode === 'teacher'
    ? { ...newLesson, classId: '' }
    : // `second` names one of the teacher's two subjects, so it cannot
      // outlive the teacher it belonged to — and neither can the subject,
      // which was filled in FROM that teacher: left standing it would narrow
      // the teacher list to one branch for the next lesson.
      { ...newLesson, teacherId: '', subject: '' };
}
