/**
 * Which subject something is taught under — and nothing else.
 *
 * A leaf module, like `keys.ts`, `blocks.ts` and `palette.ts`, and it is one
 * for the same reason those are: `entities.ts` already imports `constraints.ts`,
 * so anything BOTH of them need has to live below both or the two start
 * importing each other. `sanitize()` lives in constraints and has to know when
 * a teacher's second subject is real; every screen lives above entities and has
 * to know the same thing. One answer, one file.
 *
 * Imports the types only — no State logic, no React, no storage.
 */
import type { Lesson, State, Teacher } from '../types';

/** Comparison form: trimmed and lower-cased the Turkish way (İ→i, I→ı). */
export function subjectKey(subject: string): string {
  return subject.trim().toLocaleLowerCase('tr');
}

/**
 * The subjects one teacher holds: one, or two, never a blank between them.
 *
 * The second one is a real case in this school and not a guess: one person
 * teaches both "Matematik 1" and "Matematik 2", another both "Türkçe" and
 * "Edebiyat". A sub-branch TREE under `settings.subjects` would express the
 * first pair and not the second — Türkçe is not a child of Edebiyat — so two
 * flat subjects it is.
 */
export function teacherSubjects(t: Pick<Teacher, 'subject' | 'subject2'>): string[] {
  const list = [t.subject, t.subject2].map((s) => s.trim()).filter((s) => s !== '');
  // The same name typed into both boxes is ONE subject. Otherwise the lesson
  // form would offer the reader a choice between two identical options.
  return list.filter((s, i) => list.findIndex((o) => subjectKey(o) === subjectKey(s)) === i);
}

/** Does this teacher hold two subjects — i.e. does a lesson have a choice to make? */
export function hasTwoSubjects(t: Pick<Teacher, 'subject' | 'subject2'>): boolean {
  return teacherSubjects(t).length > 1;
}

/**
 * Which subject a lesson is taught under — the one place that resolves it.
 *
 * `Lesson.second` is a flag into the teacher's own two fields (see types.ts),
 * so everything that used to read `teacher.subject` asks this instead. A flag
 * pointing past the end — `second` on a teacher who has only one subject —
 * falls back to the first rather than returning '': `sanitize()` clears such
 * flags, but a hand-edited file reaches the screen before it does.
 */
export function lessonSubject(d: State, lesson: Pick<Lesson, 'teacherId' | 'second'>): string {
  const teacher = d.teachers.find((t) => t.id === lesson.teacherId);
  if (teacher === undefined) return '';
  const subjects = teacherSubjects(teacher);
  return (lesson.second ? subjects[1] : subjects[0]) ?? subjects[0] ?? '';
}
