// The school's entities, as ONE import path.
//
// This file used to be 1454 lines and ~65 exports: ids, defaults, the subject
// list, four kinds of CRUD, the settings writes, availability, the paste bridge,
// the deletion questions and the inspector projections, all in one place. Each
// of those is now its own module with its own job; what stays here is the path
// that forty files already say.
//
// Deletions ALWAYS end with sanitize(): deleting a teacher must delete their
// lessons, deleting a lesson must delete its placements. An orphan lessonId
// breaks the grid. That rule now lives in the four *Crud.ts files.

export * from './availability';
export * from './classCrud';
export * from './defaults';
export * from './deletion';
export * from './entityCounts';
export * from './entityInspect';
export * from './gender';
export * from './ids';
export * from './importRows';
export * from './lessonCrud';
export * from './lessonMove';
export * from './listOrder';
export * from './periods';
export * from './roomCrud';
export * from './settingsEdit';
export * from './subjectList';
export * from './subjectShorts';
export * from './teacherCrud';

// The two that were already elsewhere and were already re-exported here. The
// week and the subject vocabulary live DOWN in `names.ts`, so that
// `constraints.ts` — which sits below all of this — can draw a day name in the
// interface language; `subjects.ts` holds the question "which subject is this".
export { hasTwoSubjects, lessonSubject, subjectKey, teacherSubjects } from './subjects';
export {
  DEFAULT_DAY_NAMES,
  DEFAULT_SUBJECT_SHORTS,
  WEEK,
  builtInShort,
  dayLabel,
  shortDay,
  subjectLabel,
} from './names';
