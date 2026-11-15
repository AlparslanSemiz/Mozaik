// Reading a found week back into changes: which closed hours it opened, which
// limits it raised, how many hours it added, and when two suggestions are the
// same or one outdoes the other.

import {
  type Id,
  type Lesson,
  type Relaxation,
  type State,
  closedKey,
  parseKey,
} from '../../leaf/model';
import {
  buildIndex,
  lessonDayCount,
  lessonLimit,
  limitFor,
  longestRun,
  ruleActive,
  ruleLevel,
  teacherDayCount,
} from '../constraints';
import { replaceActiveGrid } from '../grid';
import type { Model } from './model';
import type { Suggestion } from './options';

// --------------------------------------------------------------- the reading

export function withGrid(base: State, grid: Readonly<Record<string, Id>>): State {
  return replaceActiveGrid(base, { placements: { ...grid } });
}

/** The rule limits in force on `d` that BLOCK, resolved: 0 = none. */
export function sameLimit(d: State, lesson: Lesson): number {
  const limit = lessonLimit(d, lesson);
  return ruleLevel(d, 'maxSameLessonPerDay') === 'block' &&
    ruleActive(d, 'maxSameLessonPerDay', limit)
    ? limit
    : 0;
}

export function teacherLimit(d: State, teacherId: Id, key: 'maxPerDay' | 'maxConsecutive'): number {
  const teacher = d.teachers.find((x) => x.id === teacherId);
  if (teacher === undefined) return 0;
  const limit = limitFor(d, teacher, key);
  return ruleLevel(d, key) === 'block' && ruleActive(d, key, limit) ? limit : 0;
}

/** The teacher hours `grid` teaches that `base` has closed. */
export function openedHours(base: State, grid: Readonly<Record<string, Id>>): Relaxation[] {
  const lessons = new Map(base.lessons.map((x) => [x.id, x]));
  const out: Relaxation[] = [];
  for (const [key, lessonId] of Object.entries(grid)) {
    const parts = parseKey(key);
    const lesson = lessons.get(lessonId);
    if (parts === null || lesson === undefined) continue;
    const teacherId = lesson.teacherId;
    if (base.unavailable[closedKey(teacherId, parts.day, parts.hour)] === undefined) continue;
    out.push({ kind: 'teacherHour', teacherId, day: parts.day, hour: parts.hour });
  }
  return sortChanges(out);
}

/** The closed teacher hours a model teaches, read off its literals. */
export function openedOf(model: Model): Relaxation[] {
  const out: Relaxation[] = [];
  for (const [key, o] of model.opened) {
    if (!model.sat.value(o)) continue;
    const parts = parseKey(key)!;
    out.push({ kind: 'teacherHour', teacherId: parts.id, day: parts.day, hour: parts.hour });
  }
  return sortChanges(out);
}

/** The limit overrides `grid` needs on top of `base`'s rules, with the days that need them. */
export function raisedLimits(base: State, grid: Readonly<Record<string, Id>>): Relaxation[] {
  const d = withGrid(base, grid);
  const ix = buildIndex(d);
  const hourCount = d.settings.hours.length;
  const days = d.settings.days.length;
  const out: Relaxation[] = [];
  for (const lesson of d.lessons) {
    const limit = sameLimit(base, lesson);
    if (limit <= 0) continue;
    let most = 0;
    const over: number[] = [];
    for (let day = 0; day < days; day++) {
      const n = lessonDayCount(d, lesson, day, hourCount);
      most = Math.max(most, n);
      if (n > limit) over.push(day);
    }
    if (most > limit)
      out.push({ kind: 'lessonDayLimit', lessonId: lesson.id, limit: most, days: over });
  }
  for (const teacher of d.teachers) {
    const perDay = teacherLimit(base, teacher.id, 'maxPerDay');
    const run = teacherLimit(base, teacher.id, 'maxConsecutive');
    let most = 0;
    let longest = 0;
    const overDay: number[] = [];
    const overRun: number[] = [];
    for (let day = 0; day < days; day++) {
      const n = teacherDayCount(ix, teacher.id, day, hourCount);
      const r = longestRun(ix, teacher.id, day, hourCount);
      most = Math.max(most, n);
      longest = Math.max(longest, r);
      if (perDay > 0 && n > perDay) overDay.push(day);
      if (run > 0 && r > run) overRun.push(day);
    }
    if (perDay > 0 && most > perDay)
      out.push({ kind: 'teacherDayLimit', teacherId: teacher.id, limit: most, days: overDay });
    if (run > 0 && longest > run) {
      out.push({
        kind: 'teacherConsecutive',
        teacherId: teacher.id,
        limit: longest,
        days: overRun,
      });
    }
  }
  return sortChanges(out);
}

/** Hours taught over `base`'s limits: the rules family's size, comparable with CP-SAT's. */
export function hoursOver(base: State, grid: Readonly<Record<string, Id>>): number {
  const d = withGrid(base, grid);
  const ix = buildIndex(d);
  const hourCount = d.settings.hours.length;
  let over = 0;
  for (let day = 0; day < d.settings.days.length; day++) {
    for (const lesson of d.lessons) {
      const limit = sameLimit(base, lesson);
      if (limit > 0) over += Math.max(0, lessonDayCount(d, lesson, day, hourCount) - limit);
    }
    for (const teacher of d.teachers) {
      const limit = teacherLimit(base, teacher.id, 'maxPerDay');
      if (limit > 0) over += Math.max(0, teacherDayCount(ix, teacher.id, day, hourCount) - limit);
    }
  }
  return over;
}

function changeKey(c: Relaxation): string {
  switch (c.kind) {
    case 'teacherHour':
      return `${c.kind}|${c.teacherId}|${String(c.day).padStart(2, '0')}|${String(c.hour).padStart(2, '0')}`;
    case 'teacherDayLimit':
    case 'teacherConsecutive':
      return `${c.kind}|${c.teacherId}`;
    default:
      return `${c.kind}|${c.lessonId}`;
  }
}

export function sortChanges(list: Relaxation[]): Relaxation[] {
  return [...list].sort((a, b) =>
    changeKey(a) < changeKey(b) ? -1 : changeKey(a) > changeKey(b) ? 1 : 0,
  );
}

/**
 * Two suggestions that ask the same of the same people, whatever way found
 * them: the same teachers on the same days for as many hours, the same limits
 * to the same numbers. Which hours those are is the week's business, not the
 * question the father puts to a teacher ("can KY come on Saturday for six
 * hours?"), so two ways that differ only there are one row.
 */
export function sameChanges(a: Suggestion, b: Suggestion): boolean {
  const ask = (s: Suggestion) => {
    const hours = new Map<string, number>();
    const rest: string[] = [];
    for (const c of s.changes) {
      if (c.kind === 'teacherHour') {
        const key = `${c.teacherId}|${c.day}`;
        hours.set(key, (hours.get(key) ?? 0) + 1);
      } else {
        rest.push(`${changeKey(c)}|${'limit' in c ? c.limit : ''}`);
      }
    }
    return [...[...hours].map(([k, n]) => `${k}|${n}`).sort(), ...rest].join(',');
  };
  return ask(a) === ask(b);
}

/**
 * A hand-over way no better than another on both counts, lessons handed over
 * and hours opened: its row says nothing the other does not (the search of
 * each is local, and "fewest lessons" can come back with more hours than
 * "fewest hours" found with as few lessons).
 */
export function outdone(a: Suggestion, b: Suggestion): boolean {
  const hand = (s: Suggestion) => s.family === 'handFew' || s.family === 'handHours';
  if (!hand(a) || !hand(b)) return false;
  const count = (s: Suggestion, kind: Relaxation['kind']) =>
    s.changes.filter((c) => c.kind === kind).length;
  const [ah, ao] = [count(a, 'lessonTeacher'), count(a, 'teacherHour')];
  const [bh, bo] = [count(b, 'lessonTeacher'), count(b, 'teacherHour')];
  return (
    a.changes.length === ah + ao &&
    b.changes.length === bh + bo &&
    bh <= ah &&
    bo <= ao &&
    (bh < ah || bo < ao)
  );
}
