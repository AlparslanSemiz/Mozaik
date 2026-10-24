/**
 * The one way into this folder from outside it: everything that changes the
 * school's data, and the bell. Split by question since RF5 (TODO §8k):
 * naming (`identity.ts`), a new school's defaults (`defaults.ts`), subjects,
 * rooms, teachers and classes (`roster.ts`), lessons, settings, closed hours
 * (`availability.ts`), pasted rows (`rows.ts`), counting, deleting, one entity
 * on its own (`inspect.ts`), the answers to a suggestion and the not-same-day
 * relations. What this file opens is exactly what `entities.ts` exported
 * before the split; helpers the files share stay in.
 *
 * Entity operations are PURE functions, each returns a new State. Deletions
 * ALWAYS end with sanitize(): deleting a teacher must delete their lessons,
 * deleting a lesson must delete its placements. An orphan lessonId breaks the
 * grid.
 */

/** Lookup key: the user types "matematik" as readily as "Matematik". */
// Re-exported so call sites keep saying `from '../entities'` — the same shape
// the constraint engine uses for the key builders that live in `keys.ts`.
export { hasTwoSubjects, lessonSubject, subjectKey, teacherSubjects } from '../../leaf/model';
// The week and the subject vocabulary moved DOWN to `names.ts`, so that the
// constraint engine — which sits below this package — can draw a day name in
// the interface language. Re-exported so no call site had to learn a second path.
export {
  DEFAULT_SUBJECT_SHORTS,
  WEEK,
  builtInShort,
  dayLabel,
  shortDay,
  subjectLabel,
} from '../../leaf/lang';

export { newId, makeShort, genderLabel, genderCell, parseGender } from './identity';
export {
  DEFAULT_BELL,
  makeDay,
  defaultDays,
  DEFAULT_LIMITS,
  DEFAULT_RULES,
  NO_TEACHER_LIMITS,
  hourNames,
  emptyState,
} from './defaults';
export {
  subjectShort,
  subjectOption,
  defaultSubjectShort,
  setSubjectShort,
  usedSubjects,
  defaultSubjects,
  subjectOptions,
  subjectRank,
  teacherRank,
  subjectTeachers,
  addSubject,
  renameSubject,
  deleteSubject,
  respreadColors,
} from './subjects';
export {
  reorderList,
  addRoom,
  updateRoom,
  deleteRoom,
  addTeacher,
  setTeacherLimit,
  updateTeacher,
  deleteTeacher,
  addClass,
  updateClass,
  deleteClass,
  roomClasses,
  roomName,
  type ListKind,
} from './roster';
export {
  addLesson,
  updateLesson,
  transferLesson,
  moveLessonToClass,
  deleteLesson,
} from './lessons';
export {
  remapDays,
  updateSettings,
  settingsLoss,
  updateBell,
  updateLimits,
  updateRules,
  type SettingsLoss,
} from './settings';
export { setAvailability, openHours, setWholeWeek } from './availability';
export { addTeachersFromRows, addClassesFromRows, addLessonsFromRows } from './rows';
export { weeklyLoad, hourLabels, extraNames, duplicateShorts } from './counting';
export { planSummary, deletionQuestion, type EntityKind, type DeletionQuestion } from './deleting';
export {
  entityWeek,
  entityFacts,
  type InspectKind,
  type WeekCell,
  type EntityFacts,
} from './inspect';
export { forbids, answerYes, answerNo, dropAnswer } from './answers';
export { notSameDayOf, addNotSameDay, removeRelation } from './relations';
export * from './bell';
