// A suggestion applied to the data, and checked: `verifySuggestion` asks the
// changed data's own blocker() and rules.ts about the suggestion's week before
// anything is shown, so a wrong formula yields no suggestion rather than a
// wrong one.

import {
  type Id,
  type Relaxation,
  type State,
  closedKey,
  lessonSubject,
  parseKey,
  subjectKey,
  teacherSubjects,
} from '../../leaf/model';
import {
  blocker,
  buildIndex,
  findViolations,
  liftBlock,
  pendingBlocks,
  placedBlocks,
} from '../constraints';
import { setAvailability, setTeacherLimit, updateLesson } from '../entities';
import { activePinned, activePlacements, replaceActiveGrid } from '../grid';
import { lessonExcluded } from '../program';
import { fixedCells } from '../solver';
import { DEFAULTS, type RelaxOptions, type Suggestion } from './options';

// ------------------------------------------------------------------ the data

/** The lesson's subject, as another teacher would have to hold it. */
export function holds(d: State, teacherId: Id, subject: string): number {
  const teacher = d.teachers.find((x) => x.id === teacherId);
  if (teacher === undefined || subject.trim() === '') return -1;
  return teacherSubjects(teacher).findIndex((s) => subjectKey(s) === subjectKey(subject));
}

/** The data with the changes made, through the same functions the screens use. */
export function applyRelaxations(d: State, changes: readonly Relaxation[]): State {
  const teachers = new Set(d.teachers.map((x) => x.id));
  const hours = new Map<Id, Array<{ day: number; hour: number }>>();
  let out = d;
  for (const c of changes) {
    switch (c.kind) {
      case 'teacherHour': {
        // A teacher's hour and nothing else, even when handed something else.
        if (!teachers.has(c.teacherId)) break;
        const list = hours.get(c.teacherId) ?? [];
        list.push({ day: c.day, hour: c.hour });
        hours.set(c.teacherId, list);
        break;
      }
      case 'lessonDayLimit':
        out = updateLesson(out, c.lessonId, { maxPerDay: c.limit });
        break;
      case 'teacherDayLimit':
        if (teachers.has(c.teacherId))
          out = setTeacherLimit(out, c.teacherId, 'maxPerDay', c.limit);
        break;
      case 'teacherConsecutive':
        if (teachers.has(c.teacherId)) {
          out = setTeacherLimit(out, c.teacherId, 'maxConsecutive', c.limit);
        }
        break;
      case 'lessonTeacher': {
        // Only to a teacher who holds the lesson's subject, under that subject.
        const lesson = out.lessons.find((x) => x.id === c.lessonId);
        if (lesson === undefined || !teachers.has(c.teacherId)) break;
        const which = holds(out, c.teacherId, lessonSubject(out, lesson));
        if (which < 0) break;
        out = updateLesson(out, c.lessonId, { teacherId: c.teacherId, second: which === 1 });
        break;
      }
      case 'blockShape':
        out = updateLesson(out, c.lessonId, { blocks: c.blocks });
        break;
      case 'weeklyHours':
        out = updateLesson(out, c.lessonId, { weeklyHours: c.hours, blocks: c.blocks });
        break;
    }
  }
  for (const [teacherId, cells] of hours) out = setAvailability(out, teacherId, cells, false);
  return out;
}

/**
 * The changes, then the week. In that order: `updateLesson` drops a lesson's
 * placements when its block shape changes, so the grid has to go in last.
 */
export function applySuggestion(d: State, s: Suggestion): State {
  return replaceActiveGrid(applyRelaxations(d, [...s.accepted, ...s.changes]), {
    placements: { ...s.placements },
  });
}

/**
 * The rules a drop can break: the three limits, and two lessons that may not
 * share a day. The gap rules and "en az" never block one.
 */
const LIMIT_RULES = new Set(['maxPerDay', 'maxConsecutive', 'maxSameLessonPerDay', 'notSameDay']);

/**
 * Everything wrong with a suggestion, as sentences for a test to print. [] means
 * the week it carries is a real timetable for the changed data.
 */
export function verifySuggestion(
  base: State,
  s: Suggestion,
  options?: Partial<Pick<RelaxOptions, 'keepPlaced' | 'exclusions'>>,
): string[] {
  const opts = { ...DEFAULTS, ...options };
  const problems: string[] = [];
  const applied = applySuggestion(base, s);

  // 1. No class or room hour was opened, and nothing but a named teacher hour.
  const all = [...s.accepted, ...s.changes];
  const named = new Set(
    all.flatMap((c) => (c.kind === 'teacherHour' ? [closedKey(c.teacherId, c.day, c.hour)] : [])),
  );
  const teachers = new Set(base.teachers.map((x) => x.id));
  for (const key of Object.keys(base.unavailable)) {
    if (applied.unavailable[key] !== undefined) continue;
    const id = parseKey(key)?.id;
    if (id === undefined || !teachers.has(id))
      problems.push(`sınıf ya da derslik saati açıldı: ${key}`);
    else if (!named.has(key)) problems.push(`adı geçmeyen öğretmen saati açıldı: ${key}`);
  }
  for (const key of Object.keys(applied.unavailable)) {
    if (base.unavailable[key] === undefined) problems.push(`yeni kapalı saat: ${key}`);
  }

  // 1b. A lesson changed hands only where a change says so, and only within its subject.
  const handed = new Map(
    all.flatMap((c) => (c.kind === 'lessonTeacher' ? [[c.lessonId, c.teacherId]] : [])),
  );
  for (const lesson of applied.lessons) {
    const before = base.lessons.find((x) => x.id === lesson.id);
    if (before === undefined || before.teacherId === lesson.teacherId) continue;
    if (handed.get(lesson.id) !== lesson.teacherId)
      problems.push(`adı geçmeyen öğretmen değişikliği: ${lesson.id}`);
    else if (subjectKey(lessonSubject(applied, lesson)) !== subjectKey(lessonSubject(base, before)))
      problems.push(`branş değişti: ${lesson.id}`);
  }

  // 2. Every block could be dropped where it sits (the drag's own question).
  for (const lesson of applied.lessons) {
    for (const b of placedBlocks(applied, lesson)) {
      const lifted = liftBlock(applied, lesson.classId, b.day, b.hour);
      const why = blocker(lifted, buildIndex(lifted), lesson.id, b.day, b.hour, b.size);
      if (why !== null) problems.push(`${lesson.id} ${b.day}/${b.hour}: ${why}`);
    }
  }

  // 3. The rules, through rules.ts rather than blocker(): a second path.
  const ix = buildIndex(applied);
  for (const v of findViolations(applied, ix)) {
    if (v.level === 'block' && LIMIT_RULES.has(v.rule)) problems.push(v.message);
  }

  // 4. No teacher in two rooms: buildIndex would let the second one overwrite.
  const seen = new Map<string, Id>();
  for (const [key, lessonId] of Object.entries(activePlacements(applied))) {
    const parts = parseKey(key);
    const lesson = ix.lessonById.get(lessonId);
    if (parts === null || lesson === undefined) continue;
    const at = closedKey(lesson.teacherId, parts.day, parts.hour);
    const other = seen.get(at);
    if (other !== undefined && other !== lessonId) problems.push(`öğretmen iki yerde: ${at}`);
    seen.set(at, lessonId);
  }

  // 5. The week is whole.
  for (const lesson of applied.lessons) {
    if (lessonExcluded(lesson, opts.exclusions)) continue;
    if (pendingBlocks(applied, lesson).length > 0) problems.push(`eksik kaldı: ${lesson.id}`);
  }

  // 6. What the run could not move did not move.
  const fixed = fixedCells(base, opts.keepPlaced, opts.exclusions);
  for (const [key, lessonId] of Object.entries(fixed)) {
    if (s.placements[key] !== lessonId) problems.push(`yerinden oynadı: ${key}`);
  }
  for (const key of Object.keys(activePinned(base))) {
    if (activePinned(applied)[key] === undefined) problems.push(`sabit düştü: ${key}`);
  }
  return problems;
}
