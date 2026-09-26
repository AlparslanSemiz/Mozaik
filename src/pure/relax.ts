// "Şunu değiştirirsen kurulur": what to change so a week that cannot be built
// can be. A PURE module, tested in relax.test.ts (TODO B5.9, B5.10).
//
// The father's data has no timetable as it stands — an exact solver (OR-Tools
// CP-SAT) proves it in 0.1 s — and all the program could say about it was which
// lesson did not fit. Here the same week is asked again of a SAT formula (sat.ts)
// with one kind of change allowed, each change a literal that is counted:
// closed teacher hours, the daily limits, both of those together, who teaches a
// lesson, the block shape, and as a last resort the weekly hours. The CLASS's
// own closed hours are never among them, and rooms stay as they are: there is
// no Relaxation for either, so no suggestion can name one.
//
// Several ways are offered, not one, and the father picks (the user's decision,
// 2026-09-24): the smallest change is rarely unique — ten different sets of 4
// teacher hours were seen on his data — and "smallest" is not what makes one
// easy to ask of a teacher. So the teacher-hour ways differ in what they call
// cheap: an hour on a day the teacher comes anyway, few hours side by side, or
// as few teachers as possible. Each is measured against CP-SAT in WORKLOG
// 2026-09-24.
//
// The count is then pushed down until the formula says "no fewer", so a
// suggestion marked `proven` is the smallest change of its kind there is, not
// the smallest a search stumbled on. The local repair search was tried first and
// found 12 teacher hours where 4 are enough (DECISIONS.md, 2026-09-24).
//
// A suggestion is not a guess either. It carries the week it was found with,
// and `verifySuggestion` checks that week against the CHANGED data through the
// same blocker() the drag uses, and through rules.ts, before anything is shown.

import { blocker, buildIndex, liftBlock, pendingBlocks, placedBlocks } from './constraints';
import type { Index } from './constraints';
import { forbids, setAvailability, setTeacherLimit, updateLesson } from './entities';
import { lessonName } from './feasibility';
import { activePinned, activePlacements, replaceActiveGrid } from './programs';
import { lessonExcluded } from './programMask';
import type { SolverExclusions } from './programMask';
import {
  findViolations,
  lessonDayCount,
  lessonLimit,
  limitFor,
  longestRun,
  ruleActive,
  ruleLevel,
  teacherDayCount,
} from './rules';
import { fixedCells } from './solver';
import { Sat, atMostOne, exactlyOne, not, pos, totalizer } from './sat';
import type { Lit } from './sat';
import { blockPlan } from '../leaf/blocks';
import { t } from '../leaf/i18n';
import { closedKey, parseKey, placementKey } from '../leaf/keys';
import { dayLabel } from '../leaf/names';
import { lessonSubject, subjectKey, teacherSubjects } from '../leaf/subjects';
import type { Answers, Id, Lesson, Refusal, Relaxation, State } from '../leaf/types';

/**
 * One way of changing the data, and what it calls cheap. The first three open
 * closed teacher hours and differ only in the price of an hour:
 *   - teacherDays: an hour on a day the teacher already teaches costs 1, a
 *     day the teacher did not come at all costs 2 more;
 *   - teacherHours: every hour costs 1, and of the fewest, hours side by side
 *     with the teacher's own are preferred;
 *   - fewTeachers: every teacher asked costs more than any number of hours.
 */
export type RelaxFamily =
  | 'teacherDays'
  | 'teacherHours'
  | 'fewTeachers'
  | 'mixed'
  | 'rules'
  | 'reassign'
  | 'handFew'
  | 'handHours'
  | 'blockShape'
  | 'weeklyHours';

/** The order the ways are SHOWN in: the user's own list first (2026-09-24). */
export const FAMILY_ORDER: readonly RelaxFamily[] = [
  'teacherDays',
  'teacherHours',
  'fewTeachers',
  'mixed',
  'rules',
  'reassign',
  'handFew',
  'handHours',
  'blockShape',
  'weeklyHours',
];

/**
 * The hand-over ways ("karma", 2026-09-25): a lesson given to another teacher
 * of its subject is a smaller thing to ask than a teacher's closed hour, the
 * user said, so two ways trade the one for the other and the father sees both:
 *   - handFew: as few lessons handed over as can be (at least one), then as
 *     few hours as that leaves;
 *   - handHours: as few hours as can be with at most HAND_CAP lessons handed
 *     over, then as few of those.
 * CP-SAT on the father's data (WORKLOG 2026-09-25): one lesson and 3 hours,
 * three lessons and 2 hours, against 4 hours with none.
 */
const HAND_CAP = 3;

// The changes and the refusals are the plan's data too (State.answers, schema
// v15), so their types live in leaf/types.ts; they are named here as before.
export type { Refusal, Relaxation } from '../leaf/types';

export interface Suggestion {
  family: RelaxFamily;
  changes: Relaxation[];
  /** The whole week found under `changes`: fixed cells included. */
  placements: Record<string, Id>;
  /**
   * How big the change is, in the family's own unit: teacher hours opened,
   * hours over the old limits, hours plus limit steps, lessons given to another
   * teacher, lessons reshaped, hours dropped.
   */
  size: number;
  /** No smaller change of this family exists (the formula said so). */
  proven: boolean;
  /**
   * The run kept what was on the grid, no way was found that way, and this one
   * lays the unpinned lessons out again: applying it replaces them.
   */
  relaid: boolean;
  /**
   * What the reader already said yes to ("Olur"): made before `changes`, at no
   * cost to the search, and applied with them. `changes` is what is still to
   * ask; empty means the answers so far are enough.
   */
  accepted: Relaxation[];
}

export interface RelaxOptions {
  /** The same as the stuck run's: what it kept is kept here too. */
  keepPlaced: boolean;
  exclusions: SolverExclusions;
  /**
   * A cap on the whole search, in time. The search itself stops by conflict
   * counts; this is for a machine so slow that those would take too long. Past
   * it the best week found so far is offered with `proven: false`.
   */
  budgetMs: number;
  /** Which ways to look for, in the order they are looked for. */
  families: RelaxFamily[];
  refused: Refusal[];
  /**
   * What the search before this one found, when this one runs again after an
   * answer ("Olmaz"). Each way starts from its own earlier week, the refused
   * hours falling out of it on their own (they are no longer a start any
   * block may take), and the neighbourhoods grow to five and six days. MEASURED
   * on the father's file (2026-09-25): refusing KY's Saturday, the fewest-hours
   * way found 8 hours in 61 s starting from the stuck week; from its own
   * earlier week 6, with the wider neighbourhoods too 5 in 18 s, which is
   * CP-SAT's best. Either alone stayed at 6.
   */
  previous: Suggestion[];
  /** The changes the reader said yes to: the search runs on the data with them made. */
  accepted: Relaxation[];
  /**
   * Weeks another line of the search found, for a way on this line that has
   * no week of its own and none before it on the line to start from. The
   * hand-over ways start from the fewest-hours week, and on a line of their
   * own that week arrives from the line that found it (relaxPool.ts).
   */
  seed: Suggestion[];
  /**
   * Skip the pass that keeps the laid-out lessons where they are and go
   * straight to laying them out again: the search before this one found no way
   * with them kept, and a refusal cannot make one appear.
   */
  startRelaid: boolean;
}

/**
 * The order the ways are LOOKED for, which is not the order they are shown in:
 * the first one found is the first thing the reader sees, so the quickest go
 * first. MEASURED on the father's data (2026-09-24, WORKLOG).
 */
const SEARCH_ORDER: RelaxFamily[] = [
  'fewTeachers',
  'teacherHours',
  // Straight after the fewest-hours way, whose week they start from (relaxPool.ts).
  'handFew',
  'handHours',
  'teacherDays',
  'mixed',
  'rules',
  'reassign',
  'blockShape',
  'weeklyHours',
];

const DEFAULTS: RelaxOptions = {
  keepPlaced: true,
  exclusions: { teacherIds: [], classIds: [], dayNames: [] },
  budgetMs: 120_000,
  families: SEARCH_ORDER,
  refused: [],
  previous: [],
  startRelaid: false,
  accepted: [],
  seed: [],
};

/**
 * How far the cost counter counts at first. It is doubled whenever the answer
 * lies above it, so a small first guess costs one extra question at most.
 */
const FIRST_CAP = 32;

/**
 * How much each way may search at most, in SAT conflicts: a count and not a
 * clock, so the same data gets the same suggestion on any machine (the solver
 * counts nodes for the same reason). The clock (`budgetMs`) is only a cap over
 * all of it. Most ways stop well before this: see NEIGHBOURHOOD_CONFLICTS.
 */
const FAMILY_CONFLICTS: Record<RelaxFamily, number> = {
  teacherDays: 150_000,
  teacherHours: 150_000,
  fewTeachers: 150_000,
  mixed: 150_000,
  rules: 150_000,
  reassign: 100_000,
  // Less than the teacher-hour ways: they came after the fewest-hours way on
  // its line and made it the slowest one (63 s against 45). MEASURED on the
  // father's file (2026-09-25): the same sizes at 60 000 as at 150 000, 8 to
  // 10 s sooner. With eight cores or more they have a line of their own now
  // and start from that way's first week (`seed`, relaxPool.ts).
  handFew: 60_000,
  handHours: 60_000,
  blockShape: 30_000,
  weeklyHours: 30_000,
};

/**
 * A cheaper week is looked for first near the best one: all of it kept but two
 * days (then three), and those days laid out again. Each such question is
 * small and mostly answered in tens of conflicts; this is its cap. MEASURED on
 * the father's data (2026-09-24): "4 hours, no fewer" is a pigeonhole proof no
 * budget reaches, and the whole-week question spent 150 000 conflicts getting
 * from 6 hours to 4 and then the rest of its budget failing to go under; near
 * the best week, 4 came in about 20 000 and a round of refusals says when to
 * stop.
 */
const NEIGHBOURHOOD_CONFLICTS = 1_000;

/** How many days a neighbourhood frees, tried in this order. */
const NEIGHBOURHOOD_SIZES = [2, 3, 4];

/** The same after an answer, when the search starts from its own earlier week (see `previous`). */
const WIDE_NEIGHBOURHOOD_SIZES = [2, 3, 4, 5, 6];

/** Once no neighbourhood helps, how long the whole week is asked before giving up. */
const WHOLE_WEEK_CONFLICTS = 60_000;

/**
 * How long a new formula tries the hint week as it stands. In practice the
 * question is refused at once, every time: see `hinted` in buildModel.
 */
const HINT_CONFLICTS = 2_000;

export type RelaxStage = 'building' | 'solving' | 'proving' | 'checking';

export interface RelaxProgress {
  family: RelaxFamily;
  stage: RelaxStage;
  /** The ways whose search is over in this pass, found or not. */
  finished: RelaxFamily[];
  /** Suggestions found and checked so far, so they can be shown as they come. */
  suggestions: Suggestion[];
  elapsedMs: number;
}

export interface RelaxResult {
  /** 'done' also when the budget ran out: `suggestions` is what was found. */
  phase: 'done' | 'cancelled';
  suggestions: Suggestion[];
  elapsedMs: number;
}

export interface Relaxer {
  step(sliceMs: number): RelaxResult | null;
  progress(): RelaxProgress;
  cancel(): RelaxResult;
}

// ------------------------------------------------------------------ the data

/** The lesson's subject, as another teacher would have to hold it. */
function holds(d: State, teacherId: Id, subject: string): number {
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

/** The three limit rules a drop can break; the gap rules and "en az" never block one. */
const LIMIT_RULES = new Set(['maxPerDay', 'maxConsecutive', 'maxSameLessonPerDay']);

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

// --------------------------------------------------------------- the reading

function withGrid(base: State, grid: Readonly<Record<string, Id>>): State {
  return replaceActiveGrid(base, { placements: { ...grid } });
}

/** The rule limits in force on `d` that BLOCK, resolved: 0 = none. */
function sameLimit(d: State, lesson: Lesson): number {
  const limit = lessonLimit(d, lesson);
  return ruleLevel(d, 'maxSameLessonPerDay') === 'block' &&
    ruleActive(d, 'maxSameLessonPerDay', limit)
    ? limit
    : 0;
}

function teacherLimit(d: State, teacherId: Id, key: 'maxPerDay' | 'maxConsecutive'): number {
  const teacher = d.teachers.find((x) => x.id === teacherId);
  if (teacher === undefined) return 0;
  const limit = limitFor(d, teacher, key);
  return ruleLevel(d, key) === 'block' && ruleActive(d, key, limit) ? limit : 0;
}

/** The teacher hours `grid` teaches that `base` has closed. */
function openedHours(base: State, grid: Readonly<Record<string, Id>>): Relaxation[] {
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
function openedOf(model: Model): Relaxation[] {
  const out: Relaxation[] = [];
  for (const [key, o] of model.opened) {
    if (!model.sat.value(o)) continue;
    const parts = parseKey(key)!;
    out.push({ kind: 'teacherHour', teacherId: parts.id, day: parts.day, hour: parts.hour });
  }
  return sortChanges(out);
}

/** The limit overrides `grid` needs on top of `base`'s rules, with the days that need them. */
function raisedLimits(base: State, grid: Readonly<Record<string, Id>>): Relaxation[] {
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
function hoursOver(base: State, grid: Readonly<Record<string, Id>>): number {
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

function sortChanges(list: Relaxation[]): Relaxation[] {
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

// ---------------------------------------------------------------- the model
//
// One SAT formula per kind of change. A variable per (block, start cell) the
// block may legally take; exactly one per block; at most one lesson per class,
// teacher and room hour; the daily limits as counters over "is taught at this
// hour" flags. The kind's changes are the only extra freedom, and each one it
// uses is a literal the costs count.

/** Which formula a family asks: the three teacher-hour ways share one. */
type ModelKind = 'teacher' | 'mixed' | 'rules' | 'reassign' | 'hand' | 'blockShape' | 'weeklyHours';

function kindOf(which: RelaxFamily): ModelKind {
  switch (which) {
    case 'teacherDays':
    case 'teacherHours':
    case 'fewTeachers':
      return 'teacher';
    case 'handFew':
    case 'handHours':
      return 'hand';
    default:
      return which;
  }
}

interface Slot {
  lesson: Lesson;
  /** Who teaches it in this version: another teacher only for 'reassign'. */
  teacherId: Id;
  size: number;
  /** Which version of the lesson this block belongs to; 'as-is' is the data's own. */
  variant: string;
  starts: number[];
  vars: Lit[];
}

interface Model {
  sat: Sat;
  slots: Slot[];
  /** Closed teacher hours by closedKey → "taught anyway". */
  opened: Map<string, Lit>;
  /** Per (teacher, day) with an opened hour: "the teacher comes that day only for it". */
  newDay: Lit[];
  /** Per opened hour with no open or opened hour of the teacher's beside it. */
  apart: Lit[];
  /** Per teacher with a closed hour that may open: "asked to come". */
  touched: Lit[];
  /** rules and mixed: first raise of each limit, then the next two. */
  raise: Lit[];
  raiseMore: Lit[];
  /** reassign: per (lesson, other teacher) → "given to that teacher". */
  handedTo: Map<Lit, { lessonId: Id; teacherId: Id }>;
  /** blockShape: lesson → "reshaped". */
  reshape: Map<Id, Lit>;
  /** weeklyHours: one entry per hour a dropped block costs. */
  drop: Lit[];
  /** weeklyHours: the block each drop literal belongs to. */
  dropOf: Map<Lit, Slot>;
  /** The starts the hint week takes, to be asked for outright at first. */
  hinted: Lit[];
  /**
   * The hand-over ways: "at least one lesson handed over", as an assumption
   * rather than a clause, so the hint week (none handed) can still be found
   * first and the search moves from it. As a clause, the hint was refused
   * outright and the first week opened 312 hours (MEASURED 2026-09-25).
   */
  needHand: Lit | null;
  /** handHours: "at most HAND_CAP lessons handed over", an assumption for the same reason. */
  handCap: Lit | null;
}

/** The cells no run may move, the lessons to place, and the data they sit in. */
interface Frame {
  fixed: Record<string, Id>;
  fixedState: State;
  fixedIx: Index;
  lessons: Lesson[];
}

function frameOf(base: State, opts: RelaxOptions): Frame {
  const fixed = fixedCells(base, opts.keepPlaced, opts.exclusions);
  const fixedState = withGrid(base, fixed);
  return {
    fixed,
    fixedState,
    fixedIx: buildIndex(fixedState),
    lessons: base.lessons.filter((x) => !lessonExcluded(x, opts.exclusions)),
  };
}

function buildModel(
  base: State,
  frame: Frame,
  kind: ModelKind,
  opts: RelaxOptions,
  hint: Readonly<Record<string, Id>>,
): Model {
  const sat = new Sat();
  const { fixed, fixedState, fixedIx } = frame;
  const days = base.settings.days.length;
  const hours = base.settings.hours.length;
  const excludedDays = new Set(opts.exclusions.dayNames);
  const classes = new Map(base.classes.map((x) => [x.id, x]));
  // reassign opens teacher hours too, as a way in: its search starts from a
  // week with hours opened and trades them for lessons handed over, and only a
  // week with none left is offered (see costsOf).
  const hands = kind === 'reassign' || kind === 'hand';
  const openTeacher = kind === 'teacher' || kind === 'mixed' || hands;
  const relaxRules = kind === 'rules' || kind === 'mixed';
  const model: Model = {
    sat,
    slots: [],
    opened: new Map(),
    newDay: [],
    apart: [],
    touched: [],
    raise: [],
    raiseMore: [],
    handedTo: new Map(),
    reshape: new Map(),
    drop: [],
    dropOf: new Map(),
    hinted: [],
    needHand: null,
    handCap: null,
  };

  // What the reader ruled out.
  const refusedDays = new Set<string>();
  const refusedHours = new Set<string>();
  const refusedTeachers = new Set<Id>();
  const caps = new Map<string, number>();
  const refusedLimits = new Set<string>();
  const refusedHands = new Set<string>();
  const refusedLessons = new Set<string>();
  for (const r of opts.refused) {
    switch (r.kind) {
      case 'teacherDay':
        refusedDays.add(`${r.teacherId}|${r.day}`);
        break;
      case 'teacherHours':
        for (const h of r.hours) refusedHours.add(closedKey(r.teacherId, r.day, h));
        break;
      case 'teacherCap': {
        const key = `${r.teacherId}|${r.day}`;
        caps.set(key, Math.min(caps.get(key) ?? r.max, r.max));
        break;
      }
      case 'teacher':
        refusedTeachers.add(r.teacherId);
        break;
      case 'lessonDayLimit':
        refusedLimits.add(`L|${r.lessonId}`);
        break;
      case 'teacherDayLimit':
        refusedLimits.add(`D|${r.teacherId}`);
        break;
      case 'teacherConsecutive':
        refusedLimits.add(`R|${r.teacherId}`);
        break;
      case 'lessonTeacher':
        refusedHands.add(`${r.lessonId}|${r.teacherId}`);
        break;
      default:
        refusedLessons.add(`${r.kind}|${r.lessonId}`);
    }
  }
  for (const id of refusedTeachers) {
    refusedLimits.add(`D|${id}`);
    refusedLimits.add(`R|${id}`);
  }
  const mayOpen = (teacherId: Id, day: number, hour: number) =>
    openTeacher &&
    !refusedTeachers.has(teacherId) &&
    !refusedDays.has(`${teacherId}|${day}`) &&
    caps.get(`${teacherId}|${day}`) !== 0 &&
    !refusedHours.has(closedKey(teacherId, day, hour));

  const cells = new Map<string, Lit[]>();
  const lessonHours = new Map<string, Lit[]>();
  const teacherHours = new Map<string, Lit[]>();
  const push = (map: Map<string, Lit[]>, key: string, l: Lit) => {
    const list = map.get(key);
    if (list === undefined) map.set(key, [l]);
    else list.push(l);
  };

  // ---- the blocks
  for (const lesson of frame.lessons) {
    const owed = pendingBlocks(fixedState, lesson);
    if (owed.length === 0) continue;
    const group = classes.get(lesson.classId);
    const roomId = group?.roomId ?? null;
    const untouched = (fixedIx.placedHours.get(lesson.id) ?? 0) === 0;

    // The versions of the lesson and the literal that switches each one on
    // (none: always on). The data's own version is on unless another is.
    const variants: Array<{ variant: string; teacherId: Id; sizes: number[]; on: Lit | null }> = [];
    if (
      kind === 'blockShape' &&
      untouched &&
      lesson.blocks.length > 0 &&
      !refusedLessons.has(`blockShape|${lesson.id}`)
    ) {
      const r = pos(sat.newVar());
      model.reshape.set(lesson.id, r);
      variants.push({ variant: 'as-is', teacherId: lesson.teacherId, sizes: owed, on: not(r) });
      // Nothing of it is fixed, so what it owes is the whole lesson.
      const singles = Array<number>(lesson.weeklyHours).fill(1);
      variants.push({ variant: 'singles', teacherId: lesson.teacherId, sizes: singles, on: r });
    } else if (hands && untouched && !refusedTeachers.has(lesson.teacherId)) {
      const subject = lessonSubject(base, lesson);
      const others = base.teachers.filter(
        (x) =>
          x.id !== lesson.teacherId &&
          !refusedTeachers.has(x.id) &&
          holds(base, x.id, subject) >= 0 &&
          !refusedHands.has(`${lesson.id}|${x.id}`),
      );
      if (others.length > 0) {
        const keep = pos(sat.newVar());
        const hands = others.map(() => pos(sat.newVar()));
        exactlyOne(sat, [keep, ...hands]);
        // Every other change starts out "not made" by the default phase; this
        // one is the one whose "not made" is true.
        sat.setPhase(keep >> 1, true);
        variants.push({ variant: 'as-is', teacherId: lesson.teacherId, sizes: owed, on: keep });
        others.forEach((x, i) => {
          model.handedTo.set(hands[i]!, { lessonId: lesson.id, teacherId: x.id });
          variants.push({ variant: `to:${x.id}`, teacherId: x.id, sizes: owed, on: hands[i]! });
        });
      }
    }
    if (variants.length === 0)
      variants.push({ variant: 'as-is', teacherId: lesson.teacherId, sizes: owed, on: null });

    // weeklyHours: every block may be dropped at the cost of its hours, but a
    // lesson keeps at least one (the program asks for at least one hour).
    const droppable = kind === 'weeklyHours' && !refusedLessons.has(`weeklyHours|${lesson.id}`);
    const drops: Lit[] = [];

    for (const { variant, teacherId, sizes, on } of variants) {
      const same: Slot[] = [];
      for (const size of sizes) {
        const slot: Slot = { lesson, teacherId, size, variant, starts: [], vars: [] };
        const when: Lit[] = on === null ? [] : [on];
        if (droppable) {
          const d = pos(sat.newVar());
          drops.push(d);
          model.dropOf.set(d, slot);
          for (let i = 0; i < size; i++) model.drop.push(d);
          when.push(not(d));
        }
        for (let day = 0; day < days; day++) {
          if (excludedDays.has(base.settings.days[day]!.name)) continue;
          for (let hour = 0; hour + size <= hours; hour++) {
            let ok = true;
            const closedHere: string[] = [];
            for (let k = 0; k < size && ok; k++) {
              const h = hour + k;
              const classKey = placementKey(lesson.classId, day, h);
              if (fixed[classKey] !== undefined) ok = false;
              else if (base.unavailable[closedKey(lesson.classId, day, h)] !== undefined)
                ok = false;
              else if (fixedIx.teacherBusy.has(closedKey(teacherId, day, h))) ok = false;
              else if (
                roomId != null &&
                (base.unavailable[closedKey(roomId, day, h)] !== undefined ||
                  fixedIx.roomBusy.has(closedKey(roomId, day, h)))
              ) {
                ok = false;
              } else if (base.unavailable[closedKey(teacherId, day, h)] !== undefined) {
                if (mayOpen(teacherId, day, h)) closedHere.push(closedKey(teacherId, day, h));
                else ok = false;
              }
            }
            if (!ok) continue;
            const x = pos(sat.newVar());
            slot.starts.push(day * hours + hour);
            slot.vars.push(x);
            for (const key of closedHere) {
              let r = model.opened.get(key);
              if (r === undefined) {
                r = pos(sat.newVar());
                model.opened.set(key, r);
              }
              sat.addClause([not(x), r]);
            }
            for (let k = 0; k < size; k++) {
              const h = hour + k;
              push(cells, `c|${lesson.classId}|${day}|${h}`, x);
              push(cells, `t|${teacherId}|${day}|${h}`, x);
              if (roomId != null) push(cells, `r|${roomId}|${day}|${h}`, x);
              push(lessonHours, `${lesson.id}|${day}|${h}`, x);
              push(teacherHours, `${teacherId}|${day}|${h}`, x);
            }
            // Start the search from the stuck week: it is most of an answer.
            //
            // Every hour the week gives the lesson is hinted as a START, so a
            // 2-hour block is hinted at both its hours and a 1+1 lesson's
            // singles at both singles: more than one start per block (455 for
            // 211 blocks on the father's file), and the question that asks
            // them all is refused at once. What starts the search is the
            // phase alone. MEASURED 2026-09-26: hinting one start per block,
            // the question was answered and the search stayed near the hint
            // week, and that was worse: after refusing KY's Saturday the
            // fewest-hours way found 7 instead of 5 (CP-SAT's best), the
            // hand-over ways one lesson and 5 hours instead of 4 and 3, in
            // about the same time (DECISIONS). So this stays as it is, and the
            // sentence says what it does.
            if (
              variant === 'as-is' &&
              hint[placementKey(lesson.classId, day, hour)] === lesson.id
            ) {
              sat.setPhase(x >> 1, true);
              model.hinted.push(x);
            }
          }
        }
        // Exactly one start while the block's version is on and it is not dropped.
        sat.addClause([...when.map(not), ...slot.vars]);
        atMostOne(sat, slot.vars);
        for (const w of when) for (const x of slot.vars) sat.addClause([not(x), w]);
        // Two blocks of the same lesson, version and length are interchangeable:
        // the second may not start before the first, or the search would prove
        // every impossibility once per ordering.
        const twin = droppable ? undefined : same.find((s) => s.size === size);
        if (twin !== undefined) orderAfter(sat, twin, slot);
        same.push(slot);
        model.slots.push(slot);
      }
    }
    if (droppable && drops.length > 0 && untouched) sat.addClause(drops.map(not));
  }

  // ---- one thing per class, teacher and room hour
  for (const list of cells.values()) atMostOne(sat, list);

  // ---- a full class leaves no hour empty
  //
  // The father's twenty classes all have exactly as many open hours as lesson
  // hours. Then every open hour MUST be taught, which the clauses above only
  // imply after the whole week is laid out; said outright, it cuts the search
  // down to what the solver's own `coverable` check sees (TRAPS 122). Not with
  // hours droppable: a dropped hour is an empty one.
  if (kind !== 'weeklyHours') {
    for (const group of base.classes) {
      const open: string[] = [];
      for (let day = 0; day < days; day++) {
        if (excludedDays.has(base.settings.days[day]!.name)) continue;
        for (let h = 0; h < hours; h++) {
          if (fixed[placementKey(group.id, day, h)] !== undefined) continue;
          if (base.unavailable[closedKey(group.id, day, h)] !== undefined) continue;
          if (
            group.roomId != null &&
            base.unavailable[closedKey(group.roomId, day, h)] !== undefined
          ) {
            continue;
          }
          open.push(`c|${group.id}|${day}|${h}`);
        }
      }
      const owed = model.slots
        .filter((x) => x.lesson.classId === group.id && x.variant === 'as-is')
        .reduce((sum, x) => sum + x.size, 0);
      if (owed === 0 || owed !== open.length) continue;
      for (const key of open) sat.addClause(cells.get(key) ?? []);
    }
  }

  // ---- the daily limits
  let one: Lit | null = null;
  const constant = () => (one ??= sat.trueLit());
  /** count(inputs) ≤ limit, or with rules relaxed ≤ limit + up to three steps. */
  const limit = (inputs: Lit[], bound: number, steps: Lit[] | null) => {
    const cap = bound + (steps === null ? 1 : steps.length + 1);
    if (inputs.length <= bound) return;
    const out = totalizer(sat, inputs, cap);
    if (steps === null) {
      if (out.length > bound) sat.addClause([not(out[bound]!)]);
      return;
    }
    for (let i = 0; i < steps.length; i++) {
      if (out.length > bound + i) sat.addClause([not(out[bound + i]!), steps[i]!]);
    }
    if (out.length > bound + steps.length) sat.addClause([not(out[bound + steps.length]!)]);
  };
  const stepsFor = (owner: string): Lit[] | null => {
    if (!relaxRules || refusedLimits.has(owner)) return null;
    const steps = [pos(sat.newVar()), pos(sat.newVar()), pos(sat.newVar())];
    sat.addClause([not(steps[1]!), steps[0]!]);
    sat.addClause([not(steps[2]!), steps[1]!]);
    model.raise.push(steps[0]!);
    model.raiseMore.push(steps[1]!, steps[2]!);
    return steps;
  };

  for (const lesson of frame.lessons) {
    const bound = sameLimit(base, lesson);
    if (bound <= 0) continue;
    const steps = stepsFor(`L|${lesson.id}`);
    for (let day = 0; day < days; day++) {
      const inputs: Lit[] = [];
      for (let h = 0; h < hours; h++) {
        const xs = lessonHours.get(`${lesson.id}|${day}|${h}`);
        if (fixed[placementKey(lesson.classId, day, h)] === lesson.id) inputs.push(constant());
        else if (xs !== undefined) inputs.push(indicator(sat, xs));
      }
      limit(inputs, bound, steps);
    }
  }
  for (const teacher of base.teachers) {
    const perDay = teacherLimit(base, teacher.id, 'maxPerDay');
    const run = teacherLimit(base, teacher.id, 'maxConsecutive');
    if (perDay <= 0 && run <= 0) continue;
    const daySteps = perDay > 0 ? stepsFor(`D|${teacher.id}`) : null;
    const runSteps = run > 0 ? stepsFor(`R|${teacher.id}`) : null;
    for (let day = 0; day < days; day++) {
      const busy: Array<Lit | null> = [];
      for (let h = 0; h < hours; h++) {
        const xs = teacherHours.get(`${teacher.id}|${day}|${h}`);
        if (fixedIx.teacherBusy.has(closedKey(teacher.id, day, h))) busy.push(constant());
        else busy.push(xs === undefined ? null : indicator(sat, xs));
      }
      if (perDay > 0)
        limit(
          busy.filter((x): x is Lit => x !== null),
          perDay,
          daySteps,
        );
      if (run > 0) {
        // No window of run+1 taught hours in a row (run+1+i once raised i steps).
        const top = runSteps === null ? 0 : runSteps.length;
        for (let extra = 0; extra <= top; extra++) {
          const width = run + 1 + extra;
          for (let h = 0; h + width <= hours; h++) {
            const window = busy.slice(h, h + width);
            if (window.some((x) => x === null)) continue;
            const clause = window.map((x) => not(x!));
            if (runSteps !== null && extra < top) clause.push(runSteps[extra]!);
            sat.addClause(clause);
          }
        }
      }
    }
  }

  // ---- what makes an opened hour cheap or dear (the teacher-hour ways' prices)
  if (openTeacher) {
    const isOpen = (teacherId: Id, day: number, h: number) =>
      h >= 0 && h < hours && base.unavailable[closedKey(teacherId, day, h)] === undefined;
    const byDay = new Map<string, Lit[]>();
    const byTeacher = new Map<Id, Lit[]>();
    for (const [key, o] of model.opened) {
      const parts = parseKey(key)!;
      push(byDay, `${parts.id}|${parts.day}`, o);
      push(byTeacher, parts.id, o);
      // Beside the teacher's own open hour, or beside another opened one.
      if (
        isOpen(parts.id, parts.day, parts.hour - 1) ||
        isOpen(parts.id, parts.day, parts.hour + 1)
      )
        continue;
      const beside = [parts.hour - 1, parts.hour + 1].flatMap((h) => {
        const n = model.opened.get(closedKey(parts.id, parts.day, h));
        return n === undefined ? [] : [n];
      });
      // Both ways, so a model's count is the true one: "apart" exactly when
      // the hour is opened and neither neighbour is.
      const apart = pos(sat.newVar());
      sat.addClause([not(o), ...beside, apart]);
      sat.addClause([not(apart), o]);
      for (const n of beside) sat.addClause([not(apart), not(n)]);
      model.apart.push(apart);
    }
    for (const [key, list] of byDay) {
      const [teacherId, dayText] = key.split('|') as [Id, string];
      const day = Number(dayText);
      let comes = false;
      const taught: Lit[] = [];
      for (let h = 0; h < hours; h++) {
        if (!isOpen(teacherId, day, h)) continue;
        if (fixedIx.teacherBusy.has(closedKey(teacherId, day, h))) comes = true;
        taught.push(...(teacherHours.get(`${teacherId}|${day}|${h}`) ?? []));
      }
      if (comes) continue;
      // "Teaches one of that day's open hours": true only if one of them is taught.
      const extra = pos(sat.newVar());
      let y: Lit | null = null;
      if (taught.length > 0) {
        y = pos(sat.newVar());
        sat.addClause([not(y), ...taught]);
      }
      for (const o of list) sat.addClause(y === null ? [not(o), extra] : [not(o), y, extra]);
      sat.addClause([not(extra), ...list]);
      if (y !== null) sat.addClause([not(extra), not(y)]);
      model.newDay.push(extra);
    }
    for (const list of byTeacher.values()) {
      const asked = pos(sat.newVar());
      for (const o of list) sat.addClause([not(o), asked]);
      sat.addClause([not(asked), ...list]);
      model.touched.push(asked);
    }
  }

  // ---- mixed: at least one of each, or it is one of the other two ways
  if (kind === 'mixed') {
    sat.addClause([...model.opened.values()]);
    sat.addClause(model.raise);
  }

  // ---- the hand-over ways: at least one lesson handed over, or it is the
  // teacher-hour way; and for handHours at most HAND_CAP of them.
  if (kind === 'hand') {
    const handed = [...model.handedTo.keys()];
    model.needHand = pos(sat.newVar());
    sat.addClause([not(model.needHand), ...handed]);
    if (handed.length > HAND_CAP) {
      const out = totalizer(sat, handed, HAND_CAP + 1);
      if (out.length > HAND_CAP) model.handCap = not(out[HAND_CAP]!);
    }
  }

  // ---- "at most N hours that day" (Olmaz, en fazla N saat)
  for (const [key, max] of caps) {
    if (max <= 0) continue;
    const [teacherId, day] = key.split('|') as [Id, string];
    const lits = [...model.opened]
      .filter(([k]) => {
        const parts = parseKey(k);
        return parts !== null && parts.id === teacherId && parts.day === Number(day);
      })
      .map(([, o]) => o);
    if (lits.length <= max) continue;
    const out = totalizer(sat, lits, max + 1);
    if (out.length > max) sat.addClause([not(out[max]!)]);
  }

  return model;
}

/** What each way counts, first and then among equals. */
function costsOf(which: RelaxFamily, model: Model): [Lit[], Lit[]] {
  const opened = [...model.opened.values()];
  switch (which) {
    case 'teacherDays':
      // A day the teacher did not come costs 3 hours: the w that CP-SAT's
      // runs set apart from "fewest hours" (WORKLOG 2026-09-24).
      return [[...opened, ...model.newDay, ...model.newDay], model.apart];
    case 'teacherHours':
      return [opened, model.apart];
    case 'fewTeachers':
      return [model.touched, [...opened, ...model.apart]];
    case 'mixed':
      // An hour opened and a limit raised by one count the same.
      return [[...opened, ...model.raise, ...model.raiseMore], model.apart];
    case 'rules':
      return [model.raise, model.raiseMore];
    case 'reassign':
      // First no hour opened at all, then as few lessons handed over as can be.
      return [opened, [...model.handedTo.keys()]];
    case 'handFew':
      return [[...model.handedTo.keys()], opened];
    case 'handHours':
      return [opened, [...model.handedTo.keys()]];
    case 'blockShape':
      return [[...model.reshape.values()], []];
    case 'weeklyHours':
      return [model.drop, []];
  }
}

/** Every `size`-element subset of `items`, in order. */
function subsets(items: readonly number[], size: number): number[][] {
  if (size === 0) return [[]];
  const out: number[][] = [];
  items.forEach((x, i) => {
    for (const rest of subsets(items.slice(i + 1), size - 1)) out.push([x, ...rest]);
  });
  return out;
}

/** A flag that is true whenever one of `xs` is. */
function indicator(sat: Sat, xs: Lit[]): Lit {
  if (xs.length === 1) return xs[0]!;
  const y = pos(sat.newVar());
  for (const x of xs) sat.addClause([not(x), y]);
  return y;
}

/** `later` may not start before `earlier` does (same lesson, same length). */
function orderAfter(sat: Sat, earlier: Slot, later: Slot): void {
  // prefix[i]: `earlier` starts at one of its first i+1 cells.
  const prefix: Lit[] = [];
  earlier.vars.forEach((x, i) => {
    const p = pos(sat.newVar());
    sat.addClause([not(x), p]);
    if (i > 0) sat.addClause([not(prefix[i - 1]!), p]);
    prefix.push(p);
  });
  later.vars.forEach((x, i) => {
    const cell = later.starts[i]!;
    // The last of earlier's starts that comes strictly before this cell.
    let at = -1;
    for (let k = 0; k < earlier.starts.length; k++) if (earlier.starts[k]! < cell) at = k;
    if (at < 0) sat.addClause([not(x)]);
    else sat.addClause([not(x), prefix[at]!]);
  });
}

/** The week in a model: the fixed cells and every block's start. */
function gridOf(base: State, frame: Frame, model: Model): Record<string, Id> {
  const hours = base.settings.hours.length;
  const grid: Record<string, Id> = { ...frame.fixed };
  for (const slot of model.slots) {
    const i = slot.vars.findIndex((x) => model.sat.value(x));
    if (i < 0) continue;
    const day = Math.floor(slot.starts[i]! / hours);
    const hour = slot.starts[i]! % hours;
    for (let k = 0; k < slot.size; k++)
      grid[placementKey(slot.lesson.classId, day, hour + k)] = slot.lesson.id;
  }
  return grid;
}

function countTrue(sat: Sat, lits: readonly Lit[]): number {
  let n = 0;
  for (const l of lits) if (sat.value(l)) n++;
  return n;
}

// ---------------------------------------------------------------- the search

export function createRelaxer(
  given: State,
  hint: Readonly<Record<string, Id>>,
  options?: Partial<RelaxOptions>,
): Relaxer {
  const opts: RelaxOptions = { ...DEFAULTS, ...options };
  // What the reader said yes to is made first and costs nothing: the search
  // runs on that data, and every week it offers is checked against the data
  // as it was, with the answers named among its changes.
  const base = opts.accepted.length > 0 ? applyRelaxations(given, opts.accepted) : given;
  let frame = frameOf(base, opts);
  let relaid = false;
  const lessonsById = new Map(base.lessons.map((x) => [x.id, x]));
  /** The formulas built so far in this pass, one per kind. */
  let models = new Map<ModelKind, Model>();

  let elapsedMs = 0;
  let family: RelaxFamily = opts.families[0] ?? 'teacherHours';
  let stage: RelaxStage = 'building';
  let doneFamilies: RelaxFamily[] = [];
  const suggestions: Suggestion[] = [];
  let finished: RelaxResult | null = null;
  let deadline = 0;

  /** The running family's conflict count at which it has to stop. */
  let familyUntil = 0;
  const budgetLeft = () => opts.budgetMs - elapsedMs;

  /** Asks the formula one question, a slice at a time, until `until` conflicts at most. */
  function* ask(
    sat: Sat,
    assumptions: Lit[],
    until: number,
  ): Generator<void, 'sat' | 'unsat' | 'budget'> {
    sat.start(assumptions);
    const stop = Math.min(until, familyUntil);
    for (;;) {
      if (budgetLeft() <= 0 || sat.conflicts >= stop) return 'budget';
      const status = sat.run(deadline, stop);
      if (status !== 'paused') return status;
      yield;
    }
  }

  /**
   * The changes a family's week needs, read off the week itself, and for the
   * kinds whose change is not in the grid (who teaches, which shape, what is
   * dropped) off the formula's last model, which is always the week's: `best`
   * is copied every time a model is found.
   */
  function changesOf(which: RelaxFamily, model: Model, grid: Record<string, Id>): Relaxation[] {
    switch (which) {
      case 'teacherDays':
      case 'teacherHours':
      case 'fewTeachers':
        return openedHours(base, grid);
      case 'mixed':
        return sortChanges([...openedHours(base, grid), ...raisedLimits(base, grid)]);
      case 'rules':
        return raisedLimits(base, grid);
      case 'reassign':
      case 'handFew':
      case 'handHours':
        // The hours off the formula, not the grid: the grid names a lesson's
        // old teacher, and a lesson handed over is taught by the new one.
        return sortChanges([
          ...openedOf(model),
          ...[...model.handedTo]
            .filter(([l]) => model.sat.value(l))
            .map(([, h]) => ({ kind: 'lessonTeacher' as const, ...h })),
        ]);
      case 'blockShape':
        return sortChanges(
          [...model.reshape]
            .filter(([, r]) => model.sat.value(r))
            .map(([lessonId]) => ({
              kind: 'blockShape' as const,
              lessonId,
              blocks: [],
            })),
        );
      case 'weeklyHours': {
        const dropped = new Map<Id, number[]>();
        for (const [d, slot] of model.dropOf) {
          if (!model.sat.value(d)) continue;
          dropped.set(slot.lesson.id, [...(dropped.get(slot.lesson.id) ?? []), slot.size]);
        }
        const out: Relaxation[] = [];
        for (const [lessonId, sizes] of dropped) {
          const lesson = lessonsById.get(lessonId)!;
          // What is left of the plan names the new shape: drop a 2 from 2+1
          // and the lesson is one hour, drop the 1 and it is one 2-hour block.
          const left = blockPlan(lesson);
          for (const size of sizes) left.splice(left.indexOf(size), 1);
          out.push({
            kind: 'weeklyHours',
            lessonId,
            hours: left.reduce((sum, b) => sum + b, 0),
            blocks: left.filter((b) => b > 1),
          });
        }
        return sortChanges(out);
      }
    }
  }

  function sizeOf(which: RelaxFamily, changes: Relaxation[], grid: Record<string, Id>): number {
    switch (which) {
      case 'rules':
        return hoursOver(base, grid);
      case 'mixed':
        return changes.filter((c) => c.kind === 'teacherHour').length + hoursOver(base, grid);
      case 'weeklyHours':
        return changes.reduce((sum, c) => {
          if (c.kind !== 'weeklyHours') return sum;
          return sum + (lessonsById.get(c.lessonId)?.weeklyHours ?? c.hours) - c.hours;
        }, 0);
      default:
        return changes.length;
    }
  }

  function* familySearch(which: RelaxFamily): Generator<void, void> {
    family = which;
    stage = 'building';
    const kind = kindOf(which);
    let model = models.get(kind);
    const fresh = model === undefined;
    if (model === undefined) {
      // A new formula starts from the best week any way has found so far:
      // most of it stands under this way's changes too.
      const latest = suggestions[suggestions.length - 1];
      const own = opts.previous.find((x) => x.family === which && x.relaid === relaid);
      const seeded = opts.seed.find((x) => x.relaid === relaid);
      model = buildModel(
        base,
        frame,
        kind,
        opts,
        own?.placements ?? latest?.placements ?? seeded?.placements ?? hint,
      );
      models.set(kind, model);
      yield;
    } else {
      // A formula shared with the way before: start from that way's week.
      model.sat.phaseFromModel();
    }
    const { sat } = model;
    const [cost, cost2] = costsOf(which, model);
    const openDays = base.settings.days.flatMap((d, i) =>
      opts.exclusions.dayNames.includes(d.name) ? [] : [i],
    );
    familyUntil = sat.conflicts + FAMILY_CONFLICTS[which];

    // Any week at all under this family's changes. A new formula first asks
    // for the hint week outright, briefly. It was written so because a phase
    // alone was thought not enough (TRAPS 134), but the question is refused at
    // once on every formula, since `hinted` names more than one start per
    // block (buildModel), and a version that answered it searched worse
    // (MEASURED 2026-09-26, DECISIONS). The refused question is kept:
    // the week the search finds today is found after it.
    stage = 'solving';
    if (fresh && model.hinted.length > 0) {
      if ((yield* ask(sat, model.hinted, sat.conflicts + HINT_CONFLICTS)) === 'sat')
        sat.phaseFromModel();
    }
    const must: Lit[] = [];
    if (model.needHand !== null) must.push(model.needHand);
    if (which === 'handHours' && model.handCap !== null) must.push(model.handCap);
    const answer = yield* ask(sat, must, Infinity);
    if (answer !== 'sat') return;

    // Then fewer and fewer changes, until "no fewer" is proven or the search
    // stops getting anywhere. Every bound is an assumption, not a clause, so a
    // proof does not poison the formula for the next question.
    let best = gridOf(base, frame, model);
    const hours = base.settings.hours.length;
    /** Where each block of the best week starts: an index into its `vars`, or -1. */
    let starts: number[] = [];
    const readBest = () => {
      best = gridOf(base, frame, model);
      starts = model.slots.map((slot) => slot.vars.findIndex((x) => sat.value(x)));
    };
    readBest();
    /** The best week's starts, except the blocks `free` names: those are laid out again. */
    const keepOutside = (free: (slot: Slot, day: number) => boolean): Lit[] => {
      const kept: Lit[] = [];
      model.slots.forEach((slot, i) => {
        const at = starts[i]!;
        if (at >= 0 && !free(slot, Math.floor(slot.starts[at]! / hours))) kept.push(slot.vars[at]!);
      });
      return kept;
    };
    /**
     * The days a cheaper week has to change: where an opened hour or a limit
     * over its old number sits. Freeing two other days cannot touch the cost.
     * null when the change is not tied to a day.
     */
    const hotDays = (): Set<number> | null => {
      if (kind !== 'teacher' && kind !== 'mixed' && kind !== 'rules') return null;
      const hot = new Set<number>();
      for (const c of openedHours(base, best)) if (c.kind === 'teacherHour') hot.add(c.day);
      if (kind !== 'teacher') {
        for (const c of raisedLimits(base, best))
          if ('days' in c) for (const d of c.days ?? []) hot.add(d);
      }
      // Nothing opened and no limit over, yet a cost left: a step raised for
      // nothing. No day holds it, so every day may.
      return hot.size > 0 ? hot : null;
    };
    /**
     * The classes a cheaper week has to change: the ones taught in an opened
     * hour or over a limit. A chain that frees an hour runs through a class's
     * whole week (its lessons trade places), which no set of days covers.
     */
    const hotClasses = (): Id[] => {
      if (kind !== 'teacher' && kind !== 'mixed' && kind !== 'rules') return [];
      const hot = new Set<Id>();
      const d = withGrid(base, best);
      const ix = buildIndex(d);
      for (const c of openedHours(base, best)) {
        if (c.kind !== 'teacherHour') continue;
        const lessonId = ix.teacherBusy.get(closedKey(c.teacherId, c.day, c.hour));
        const lesson = lessonId === undefined ? undefined : lessonsById.get(lessonId);
        if (lesson !== undefined) hot.add(lesson.classId);
      }
      if (kind !== 'teacher') {
        for (const c of raisedLimits(base, best)) {
          if (c.kind === 'lessonDayLimit') {
            const lesson = lessonsById.get(c.lessonId);
            if (lesson !== undefined) hot.add(lesson.classId);
          } else if (c.kind === 'teacherDayLimit' || c.kind === 'teacherConsecutive') {
            for (const day of c.days ?? [])
              for (let h = 0; h < hours; h++) {
                const lessonId = ix.teacherBusy.get(closedKey(c.teacherId, day, h));
                const lesson = lessonId === undefined ? undefined : lessonsById.get(lessonId);
                if (lesson !== undefined) hot.add(lesson.classId);
              }
          }
        }
      }
      return [...hot];
    };

    /**
     * Pushes the count of `lits` down under `keep`. `wide`: the two-class
     * neighbourhoods too and the whole-week question once no neighbourhood
     * helps, which is what finds a week far away and proves "no fewer".
     * `early` is called once, when the first round of neighbourhoods is over.
     */
    const tighten = function* (
      lits: Lit[],
      keep: Lit[],
      wide: boolean,
      early?: () => void,
    ): Generator<void, { keep: Lit[]; done: boolean; ub: number }> {
      if (lits.length === 0) return { keep, done: true, ub: 0 };
      let ub = countTrue(sat, lits);
      // The counter is built small and grown: one that counts to the first
      // week's cost (175 teacher hours on the father's data) is a formula many
      // times the size of the timetable, and every question after it pays.
      let cap = Math.min(ub + 1, FIRST_CAP);
      let out = totalizer(sat, lits, cap);
      stage = 'proving';
      let done = false;
      const better = () => {
        readBest();
        ub = countTrue(sat, lits);
        sat.phaseFromModel();
      };
      /** The neighbourhoods of one kind, each a test of which blocks go free. */
      const rounds: Array<() => Array<(slot: Slot, day: number) => boolean>> = [
        ...(opts.previous.length > 0 ? WIDE_NEIGHBOURHOOD_SIZES : NEIGHBOURHOOD_SIZES).map(
          (size) => () => {
            const hot = hotDays();
            return subsets(openDays, size)
              .filter((days) => hot === null || days.some((d) => hot.has(d)))
              .map((days) => (_slot: Slot, day: number) => days.includes(day));
          },
        ),
        () => {
          if (!wide) return [];
          const hot = hotClasses();
          return hot.flatMap((a) =>
            base.classes
              .filter((b) => b.id !== a)
              .map(
                (b) => (slot: Slot) => slot.lesson.classId === a || slot.lesson.classId === b.id,
              ),
          );
        },
      ];
      let early_ = early;
      search: while (ub > 0) {
        // Near the best week: two days free, then three and four, then two
        // classes' whole weeks, each kind until a whole round finds nothing
        // cheaper.
        for (const round of rounds) {
          let found = true;
          while (found && ub > 0) {
            found = false;
            for (const free of round()) {
              const k = Math.min(ub - 1, cap - 1);
              const question = [...keep, not(out[k]!), ...keepOutside(free)];
              const status = yield* ask(sat, question, sat.conflicts + NEIGHBOURHOOD_CONFLICTS);
              if (status === 'sat') {
                better();
                found = true;
                if (ub === 0) break;
              } else {
                sat.phaseFromModel();
              }
              if (budgetLeft() <= 0 || sat.conflicts >= familyUntil) break search;
            }
          }
        }
        if (ub === 0) break;
        // Then the whole week, for a while: either a cheaper week far from
        // this one, or the proof that there is none. Not wide: only for a jump
        // the counter cannot yet say one below (the first week of a way can be
        // 200 hours, and no two days take that to 31).
        const k = Math.min(ub - 1, cap - 1);
        if (k === ub - 1) {
          early_?.();
          early_ = undefined;
          if (!wide) break;
        }
        const status = yield* ask(
          sat,
          [...keep, not(out[k]!)],
          sat.conflicts + WHOLE_WEEK_CONFLICTS,
        );
        if (status === 'budget') break;
        if (status === 'sat') {
          better();
          continue;
        }
        if (k === ub - 1) {
          done = true;
          break;
        }
        // "Not under k" with k below ub - 1: count further and ask again.
        cap = Math.min(ub + 1, cap * 2);
        out = totalizer(sat, lits, cap);
        sat.phaseFromModel();
      }
      if (ub === 0) done = true;
      // The bound the next question keeps: no worse than the best found.
      if (out.length <= ub) out = totalizer(sat, lits, ub + 1);
      return { keep: out.length > ub ? [...keep, not(out[ub]!)] : keep, done, ub };
    };
    // What the neighbourhoods have found is offered at once, while the search
    // goes on: on the father's data it is mostly the answer already, and the
    // row is updated in place when it is not (WORKLOG 2026-09-24). Not for the
    // few-teachers way: its first count is teachers, and its hours, the part
    // the reader asks of them, are only settled by the second.
    const early = which === 'fewTeachers' ? undefined : () => offer(which, model, best, false);
    const first = yield* tighten(cost, must, true, early);
    // The hand-over way's week must open no hour at all, and `offer` drops one
    // that does. Searching fewer lessons handed over under a week that is
    // dropped anyway was the whole second half of its line: on the father's
    // file 15 of its 30 s, alone on a core (MEASURED 2026-09-25).
    if (which === 'reassign' && first.ub > 0) return;
    let proven = first.done;
    if (cost2.length > 0) {
      // Among the weeks as good as the best one, the one the second cost likes
      // best. Solved again under the first bound, so the model read below is
      // one that respects it.
      familyUntil = Math.max(familyUntil, sat.conflicts + WHOLE_WEEK_CONFLICTS);
      sat.phaseFromModel();
      const again = yield* ask(sat, first.keep, Infinity);
      if (again === 'sat') {
        readBest();
        // For the few-teachers way the second cost is the hours asked, and for
        // the rules the steps each limit goes up by: both are the answer. For
        // the others it is "side by side", a preference among equals, looked
        // for only near the best week.
        const wide = which === 'fewTeachers' || which === 'rules';
        proven = (yield* tighten(cost2, first.keep, wide)).done && proven;
      } else {
        proven = false;
      }
    }
    offer(which, model, best, proven);
  }

  function offer(
    which: RelaxFamily,
    model: Model,
    grid: Record<string, Id>,
    proven: boolean,
  ): void {
    stage = 'checking';
    const changes = changesOf(which, model, grid);
    const s: Suggestion = {
      family: which,
      changes,
      placements: grid,
      size: sizeOf(which, changes, grid),
      proven,
      relaid,
      accepted: opts.accepted,
    };
    // A handed-over week that still needs an hour opened is not this way, and
    // a hand-over way that hands nothing over is the teacher-hour way.
    if (which === 'reassign' && changes.some((c) => c.kind === 'teacherHour')) return;
    // Nor is one that hands over more lessons than the father would ask about:
    // the same cap as the hand-over ways (the user's decision, 2026-09-25,
    // after it came back with 9 and 15 lessons handed over).
    if (changes.filter((c) => c.kind === 'lessonTeacher').length > HAND_CAP) return;
    if (
      (which === 'handFew' || which === 'handHours') &&
      !changes.some((c) => c.kind === 'lessonTeacher')
    )
      return;
    const checked = { ...opts, keepPlaced: opts.keepPlaced && !relaid };
    if (verifySuggestion(given, s, checked).length !== 0) return;
    // A later, better week of the same way takes the earlier one's place.
    const at = suggestions.findIndex((x) => x.family === which && x.relaid === relaid);
    if (at >= 0) suggestions[at] = s;
    else suggestions.push(s);
  }

  function* pass(): Generator<void, void> {
    doneFamilies = [];
    for (const which of opts.families) {
      yield* familySearch(which);
      doneFamilies.push(which);
      // A week that needs no change at all is the answer to every family.
      if (suggestions.some((s) => s.changes.length === 0)) return;
    }
  }

  function* all(): Generator<void, void> {
    if (opts.startRelaid && opts.keepPlaced) {
      relaid = true;
      frame = frameOf(base, { ...opts, keepPlaced: false });
      yield* pass();
      return;
    }
    yield* pass();
    // The run kept what was already laid out, and on the father's own file
    // that is exactly what left no way: 330 hours in place, the empty ones in
    // pieces a 2-hour block cannot use, and no change of any family moves a
    // placed block. So the search goes on with only the pins kept, and says so
    // (the user's decision, 2026-09-24).
    if (suggestions.length === 0 && opts.keepPlaced) {
      relaid = true;
      frame = frameOf(base, { ...opts, keepPlaced: false });
      models = new Map();
      yield* pass();
    }
  }

  const body = all();
  const result = (phase: RelaxResult['phase']): RelaxResult => ({
    phase,
    suggestions: [...suggestions],
    elapsedMs,
  });

  return {
    step(sliceMs: number): RelaxResult | null {
      if (finished !== null) return finished;
      const t0 = performance.now();
      deadline = t0 + sliceMs;
      const next = body.next();
      elapsedMs += performance.now() - t0;
      if (next.done === true) finished = result('done');
      return finished;
    },
    progress(): RelaxProgress {
      return {
        family,
        stage,
        finished: [...doneFamilies],
        suggestions: [...suggestions],
        elapsedMs,
      };
    },
    cancel(): RelaxResult {
      if (finished === null) finished = result('cancelled');
      return finished;
    },
  };
}

/** Runs to completion in one go. For tests. */
export function suggest(
  base: State,
  hint: Readonly<Record<string, Id>>,
  options?: Partial<RelaxOptions>,
): RelaxResult {
  const relaxer = createRelaxer(base, hint, options);
  for (;;) {
    const result = relaxer.step(50);
    if (result !== null) return result;
  }
}

// ------------------------------------------------------------- the sentences

/** "11–12", "3, 5 ve 7" — the hour names, runs joined. */
function hourList(d: State, hours: number[]): string {
  const sorted = [...new Set(hours)].sort((a, b) => a - b);
  const name = (h: number) => d.settings.hours[h] ?? `${h + 1}`;
  const runs: string[] = [];
  for (let i = 0; i < sorted.length;) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j]! + 1) j++;
    runs.push(j === i ? name(sorted[i]!) : `${name(sorted[i]!)}–${name(sorted[j]!)}`);
    i = j + 1;
  }
  if (runs.length === 1) return runs[0]!;
  return t('{liste} ve {son}', {
    liste: runs.slice(0, -1).join(', '),
    son: runs[runs.length - 1]!,
  });
}

function shape(blocks: number[], hours: number): string {
  const named = blocks.reduce((sum, b) => sum + b, 0);
  return [...blocks, ...Array<number>(Math.max(0, hours - named)).fill(1)].join('+');
}

/** One change as the reader sees it, and what "Bu olmaz" on it rules out. */
export interface SuggestionPart {
  text: string;
  refusal: Refusal;
}

/** "411A SAY · KY Geometri" for a lesson, "?" when it is gone. */
function lessonTitle(ix: Index, lessonId: Id): string {
  return ix.lessonById.has(lessonId) ? lessonName(ix, lessonId) : '?';
}

/** A teacher's closed hours on one day, grouped the way a teacher is asked. */
function teacherDays(s: Suggestion): Array<{ teacherId: Id; day: number; hours: number[] }> {
  const byDay = new Map<string, { teacherId: Id; day: number; hours: number[] }>();
  for (const c of s.changes) {
    if (c.kind !== 'teacherHour') continue;
    const key = `${c.teacherId}|${String(c.day).padStart(2, '0')}`;
    const entry = byDay.get(key) ?? { teacherId: c.teacherId, day: c.day, hours: [] };
    entry.hours.push(c.hour);
    byDay.set(key, entry);
  }
  return [...byDay.keys()].sort().map((key) => byDay.get(key)!);
}

function dayName(d: State, day: number): string {
  return dayLabel(d.settings.days[day]?.name ?? t('{n}. gün', { n: day + 1 }));
}

/**
 * One part per change, the way the father would say it: a teacher's hours on
 * one day together ("KY Cumartesi 11–12. saat"), a limit with its old and new
 * number. Each carries the refusal its "Bu olmaz" makes.
 */
export function suggestionParts(d: State, s: Suggestion): SuggestionPart[] {
  const ix = buildIndex(d);
  const parts: SuggestionPart[] = [];
  for (const entry of teacherDays(s)) {
    parts.push({
      text: t('{kim} {gun} {saatler}. saat', {
        kim: ix.teacherById.get(entry.teacherId)?.short ?? '?',
        gun: dayName(d, entry.day),
        saatler: hourList(d, entry.hours),
      }),
      refusal: { kind: 'teacherDay', teacherId: entry.teacherId, day: entry.day },
    });
  }
  for (const c of s.changes) {
    switch (c.kind) {
      case 'teacherHour':
        break;
      case 'lessonDayLimit': {
        const lesson = ix.lessonById.get(c.lessonId);
        parts.push({
          text: t('{ders}: aynı gün en fazla {eski} yerine {yeni} saat', {
            ders: lessonTitle(ix, c.lessonId),
            eski: lesson === undefined ? '?' : sameLimit(d, lesson),
            yeni: c.limit,
          }),
          refusal: { kind: 'lessonDayLimit', lessonId: c.lessonId },
        });
        break;
      }
      case 'teacherDayLimit':
        parts.push({
          text: t('{kim}: günde en fazla {eski} yerine {yeni} saat', {
            kim: ix.teacherById.get(c.teacherId)?.short ?? '?',
            eski: teacherLimit(d, c.teacherId, 'maxPerDay'),
            yeni: c.limit,
          }),
          refusal: { kind: 'teacherDayLimit', teacherId: c.teacherId },
        });
        break;
      case 'teacherConsecutive':
        parts.push({
          text: t('{kim}: art arda en fazla {eski} yerine {yeni} saat', {
            kim: ix.teacherById.get(c.teacherId)?.short ?? '?',
            eski: teacherLimit(d, c.teacherId, 'maxConsecutive'),
            yeni: c.limit,
          }),
          refusal: { kind: 'teacherConsecutive', teacherId: c.teacherId },
        });
        break;
      case 'lessonTeacher':
        parts.push({
          text: t('{ders}: {yeni} versin', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: ix.teacherById.get(c.teacherId)?.short ?? '?',
          }),
          refusal: { kind: 'lessonTeacher', lessonId: c.lessonId, teacherId: c.teacherId },
        });
        break;
      case 'blockShape': {
        const lesson = ix.lessonById.get(c.lessonId);
        parts.push({
          text: t('{ders}: {eski} yerine {yeni}', {
            ders: lessonTitle(ix, c.lessonId),
            eski: lesson === undefined ? '?' : shape(lesson.blocks, lesson.weeklyHours),
            yeni: lesson === undefined ? '?' : shape(c.blocks, lesson.weeklyHours),
          }),
          refusal: { kind: 'blockShape', lessonId: c.lessonId },
        });
        break;
      }
      case 'weeklyHours': {
        const lesson = ix.lessonById.get(c.lessonId);
        parts.push({
          text: t('{ders}: haftada {eski} yerine {yeni} saat', {
            ders: lessonTitle(ix, c.lessonId),
            eski: lesson?.weeklyHours ?? '?',
            yeni: c.hours,
          }),
          refusal: { kind: 'weeklyHours', lessonId: c.lessonId },
        });
        break;
      }
    }
  }
  return parts;
}

/** The parts as plain lines. */
export function suggestionLines(d: State, s: Suggestion): string[] {
  return suggestionParts(d, s).map((p) => p.text);
}

/** "a", "a ve b", "a, b ve c". */
function joined(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return t('{liste} ve {son}', {
    liste: items.slice(0, -1).join(', '),
    son: items[items.length - 1]!,
  });
}

/**
 * The whole way as one sentence the father could say to his teachers: "KY
 * Cumartesi 11–12. saatlere de gelebilirse hafta kuruluyor." (the user's own
 * wording, 2026-09-24).
 */
export function suggestionSentence(d: State, s: Suggestion): string {
  const ix = buildIndex(d);
  const clauses: string[] = [];
  const hours = teacherDays(s).map((entry) =>
    t(
      entry.hours.length === 1 ? '{kim} {gun} {saatler}. saate' : '{kim} {gun} {saatler}. saatlere',
      {
        kim: ix.teacherById.get(entry.teacherId)?.short ?? '?',
        gun: dayName(d, entry.day),
        saatler: hourList(d, entry.hours),
      },
    ),
  );
  if (hours.length > 0) clauses.push(t('{saatler} de gelebilirse', { saatler: joined(hours) }));
  for (const c of s.changes) {
    switch (c.kind) {
      case 'teacherHour':
        break;
      case 'lessonDayLimit':
        clauses.push(
          t('{ders} aynı gün {yeni} saat olabilirse', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: c.limit,
          }),
        );
        break;
      case 'teacherDayLimit': {
        const kim = ix.teacherById.get(c.teacherId)?.short ?? '?';
        const days = c.days ?? [];
        clauses.push(
          days.length === 1
            ? t('{kim} {gun} {yeni} saat girebilirse', {
                kim,
                gun: dayName(d, days[0]!),
                yeni: c.limit,
              })
            : t('{kim} bir günde {yeni} saat girebilirse', { kim, yeni: c.limit }),
        );
        break;
      }
      case 'teacherConsecutive':
        clauses.push(
          t('{kim} art arda {yeni} saat girebilirse', {
            kim: ix.teacherById.get(c.teacherId)?.short ?? '?',
            yeni: c.limit,
          }),
        );
        break;
      case 'lessonTeacher':
        clauses.push(
          t('{ders} dersini {yeni} verebilirse', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: ix.teacherById.get(c.teacherId)?.short ?? '?',
          }),
        );
        break;
      case 'blockShape': {
        const lesson = ix.lessonById.get(c.lessonId);
        clauses.push(
          t('{ders} {yeni} olabilirse', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: lesson === undefined ? '?' : shape(c.blocks, lesson.weeklyHours),
          }),
        );
        break;
      }
      case 'weeklyHours':
        clauses.push(
          t('{ders} haftada {yeni} saat olabilirse', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: c.hours,
          }),
        );
        break;
    }
  }
  if (s.accepted.length > 0) {
    return t('Olur dediklerinize ek olarak {kosullar} hafta kuruluyor.', {
      kosullar: joined(clauses),
    });
  }
  return t('{kosullar} hafta kuruluyor.', { kosullar: joined(clauses) });
}

/** A refusal as the reader sees it in the "Olmaz dediğiniz" line. */
export function refusalText(d: State, r: Refusal): string {
  const ix = buildIndex(d);
  const who = (id: Id) => ix.teacherById.get(id)?.short ?? '?';
  switch (r.kind) {
    case 'teacherDay':
      return t('{kim} {gun}', { kim: who(r.teacherId), gun: dayName(d, r.day) });
    case 'teacherHours':
      return t('{kim} {gun} {saatler}. saat', {
        kim: who(r.teacherId),
        gun: dayName(d, r.day),
        saatler: hourList(d, r.hours),
      });
    case 'teacherCap':
      return t('{kim} {gun} en fazla {n} saat', {
        kim: who(r.teacherId),
        gun: dayName(d, r.day),
        n: r.max,
      });
    case 'teacher':
      return t('{kim}: hiçbir değişiklik', { kim: who(r.teacherId) });
    case 'teacherDayLimit':
      return t('{kim}: günlük sınır', { kim: who(r.teacherId) });
    case 'teacherConsecutive':
      return t('{kim}: art arda sınırı', { kim: who(r.teacherId) });
    case 'lessonDayLimit':
      return t('{ders}: aynı gün sınırı', { ders: lessonTitle(ix, r.lessonId) });
    case 'lessonTeacher':
      return t('{ders}: {yeni} versin', {
        ders: lessonTitle(ix, r.lessonId),
        yeni: who(r.teacherId),
      });
    case 'blockShape':
      return t('{ders}: blok şekli', { ders: lessonTitle(ix, r.lessonId) });
    case 'weeklyHours':
      return t('{ders}: haftalık saat', { ders: lessonTitle(ix, r.lessonId) });
  }
}

// ------------------------------------------------------ the answer book
//
// "Cevap defteri" (2026-09-25): a way read as the questions the father puts to
// each teacher, every one answered "Olur" (the change is made, at no cost to
// the next search) or "Olmaz" in one of four strengths. The answers are the
// plan's data (State.answers); this part only says what each question is.

/** One way "Olmaz" can be meant, as the menu offers it. */
export interface RefusalChoice {
  label: string;
  refusal: Refusal;
}

/** One question, to one teacher or to the father himself (`teacherId` null). */
export interface Question {
  teacherId: Id | null;
  text: string;
  /** What "Olur" makes. */
  changes: Relaxation[];
  choices: RefusalChoice[];
}

/** The class and the subject, the way a teacher is asked about a lesson: "411A SAY Geometri". */
function lessonAsked(d: State, ix: Index, lessonId: Id): string {
  const lesson = ix.lessonById.get(lessonId);
  if (lesson === undefined) return '?';
  const group = ix.classById.get(lesson.classId);
  return `${group?.name ?? '?'} ${lessonSubject(d, lesson)}`.trim();
}

/** The questions a way puts, the teachers' first and in the order of their names. */
export function suggestionQuestions(d: State, s: Suggestion): Question[] {
  const ix = buildIndex(d);
  const who = (id: Id) => ix.teacherById.get(id)?.short ?? '?';
  const none = (id: Id): RefusalChoice => ({
    label: t('{kim} için hiçbir değişiklik olmasın', { kim: who(id) }),
    refusal: { kind: 'teacher', teacherId: id },
  });
  const out: Question[] = [];
  for (const entry of teacherDays(s)) {
    const gun = dayName(d, entry.day);
    const changes: Relaxation[] = entry.hours.map((hour) => ({
      kind: 'teacherHour',
      teacherId: entry.teacherId,
      day: entry.day,
      hour,
    }));
    const choices: RefusalChoice[] = [
      {
        label: t('Yalnız bu saatler olmaz ({gun} {saatler}. saat)', {
          gun,
          saatler: hourList(d, entry.hours),
        }),
        refusal: { kind: 'teacherHours', ...entry, hours: [...entry.hours] },
      },
      {
        label: t('{gun} hiç gelemez', { gun }),
        refusal: { kind: 'teacherDay', teacherId: entry.teacherId, day: entry.day },
      },
    ];
    // "At most N hours": every N under what was asked, so the menu is one click.
    for (let max = 1; max < entry.hours.length; max++) {
      choices.push({
        label: t('{gun} en fazla {n} saat gelebilir', { gun, n: max }),
        refusal: { kind: 'teacherCap', teacherId: entry.teacherId, day: entry.day, max },
      });
    }
    choices.push(none(entry.teacherId));
    out.push({
      teacherId: entry.teacherId,
      text: t(
        entry.hours.length === 1
          ? '{gun} {saatler}. saate gelebilir misiniz?'
          : '{gun} {saatler}. saatlere gelebilir misiniz?',
        { gun, saatler: hourList(d, entry.hours) },
      ),
      changes,
      choices,
    });
  }
  const mine: Question[] = [];
  for (const c of s.changes) {
    switch (c.kind) {
      case 'teacherHour':
        break;
      case 'teacherDayLimit':
        out.push({
          teacherId: c.teacherId,
          text: t('Bir günde {eski} yerine {yeni} saat girebilir misiniz?', {
            eski: teacherLimit(d, c.teacherId, 'maxPerDay'),
            yeni: c.limit,
          }),
          changes: [c],
          choices: [
            {
              label: t('Olmaz'),
              refusal: { kind: 'teacherDayLimit', teacherId: c.teacherId },
            },
            none(c.teacherId),
          ],
        });
        break;
      case 'teacherConsecutive':
        out.push({
          teacherId: c.teacherId,
          text: t('Art arda {eski} yerine {yeni} saat girebilir misiniz?', {
            eski: teacherLimit(d, c.teacherId, 'maxConsecutive'),
            yeni: c.limit,
          }),
          changes: [c],
          choices: [
            {
              label: t('Olmaz'),
              refusal: { kind: 'teacherConsecutive', teacherId: c.teacherId },
            },
            none(c.teacherId),
          ],
        });
        break;
      case 'lessonTeacher':
        out.push({
          teacherId: c.teacherId,
          text: t('{ders} dersini verebilir misiniz?', { ders: lessonAsked(d, ix, c.lessonId) }),
          changes: [c],
          choices: [
            {
              label: t('Olmaz'),
              refusal: { kind: 'lessonTeacher', lessonId: c.lessonId, teacherId: c.teacherId },
            },
            none(c.teacherId),
          ],
        });
        break;
      default: {
        // A lesson's own shape and limits: nobody to ask but the father.
        const part = suggestionParts(d, { ...s, changes: [c] })[0];
        if (part === undefined) break;
        mine.push({
          teacherId: null,
          text: part.text,
          changes: [c],
          choices: [{ label: t('Olmaz'), refusal: part.refusal }],
        });
      }
    }
  }
  const name = (q: Question) => (q.teacherId === null ? '' : who(q.teacherId));
  return [...out.sort((a, b) => (name(a) < name(b) ? -1 : name(a) > name(b) ? 1 : 0)), ...mine];
}

/**
 * The plan's answers as the chips under the panel's title: a teacher's hours
 * on one day together, each chip carrying every answer it stands for, so one
 * click takes them all back.
 */
export function answerParts(
  d: State,
  answers: Answers,
): Array<{ text: string; yes: boolean; items: Array<Relaxation | Refusal> }> {
  const out: Array<{ text: string; yes: boolean; items: Array<Relaxation | Refusal> }> = [];
  const asked: Suggestion = {
    family: 'teacherHours',
    changes: answers.accepted,
    placements: {},
    size: 0,
    proven: false,
    relaid: false,
    accepted: [],
  };
  for (const entry of teacherDays(asked)) {
    out.push({
      text: suggestionParts(d, {
        ...asked,
        changes: entry.hours.map((hour) => ({
          kind: 'teacherHour' as const,
          teacherId: entry.teacherId,
          day: entry.day,
          hour,
        })),
      })[0]!.text,
      yes: true,
      items: answers.accepted.filter(
        (c) => c.kind === 'teacherHour' && c.teacherId === entry.teacherId && c.day === entry.day,
      ),
    });
  }
  for (const c of answers.accepted) {
    if (c.kind === 'teacherHour') continue;
    const part = suggestionParts(d, { ...asked, changes: [c] })[0];
    if (part !== undefined) out.push({ text: part.text, yes: true, items: [c] });
  }
  for (const r of answers.refused) out.push({ text: refusalText(d, r), yes: false, items: [r] });
  return out;
}

/** The questions as plain text, to copy or print: one line per question. */
export function questionsText(d: State, s: Suggestion): string {
  const ix = buildIndex(d);
  const lines = suggestionQuestions(d, s).map((q) =>
    q.teacherId === null
      ? `${t('Sizin kararınız')}: ${q.text}`
      : `${ix.teacherById.get(q.teacherId)?.short ?? '?'}: ${q.text}`,
  );
  return [suggestionSentence(d, s), '', ...lines].join('\n');
}

/** Does `s` make the change `r` rules out? `d` names who teaches a lesson now. */
export function suggestionUses(d: State, s: Suggestion, r: Refusal): boolean {
  return forbids(d, r, s.changes);
}

// ------------------------------------------------------------ the preview

/**
 * What a way changes on the grid, for the preview: the teacher hours it opens
 * (closedKey) and the cells whose lesson is new there (placementKey), with how
 * many laid-out blocks leave their place. Moving lessons costs the search
 * nothing (the user's rule, 2026-09-25: "en az" is about the teachers' hours),
 * but the father sees how much of his week it is.
 */
export interface SuggestionDiff {
  opened: Set<string>;
  moved: Set<string>;
  movedBlocks: number;
}

export function suggestionDiff(before: State, s: Suggestion): SuggestionDiff {
  const after = applySuggestion(before, s);
  const opened = new Set<string>();
  for (const key of Object.keys(before.unavailable)) {
    if (after.unavailable[key] === undefined) opened.add(key);
  }
  const was = activePlacements(before);
  const now = activePlacements(after);
  const moved = new Set<string>();
  for (const [key, lessonId] of Object.entries(now)) if (was[key] !== lessonId) moved.add(key);
  let movedBlocks = 0;
  for (const lesson of before.lessons) {
    for (const b of placedBlocks(before, lesson)) {
      for (let k = 0; k < b.size; k++) {
        if (now[placementKey(lesson.classId, b.day, b.hour + k)] !== lesson.id) {
          movedBlocks++;
          break;
        }
      }
    }
  }
  return { opened, moved, movedBlocks };
}
