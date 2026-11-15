/**
 * The one way into this folder from outside it: the add forms' rules that are
 * not drawing. Today the add-lesson form's (`lessonForm.ts`): which subjects
 * and teachers it offers, what picking one does to the other, and what stays
 * for the next lesson.
 */
export {
  afterAdd,
  DEFAULT_LESSON_HOURS,
  chooseSubject,
  chooseTeacher,
  lessonChoices,
  type LessonChoices,
  type LessonDraft,
} from './lessonForm';
