// "Şunu değiştirirsen kurulur": what to change so a week that cannot be built
// can be. A PURE module, tested in relax.test.ts (TODO B5.9).
//
// The father's data has no timetable as it stands — an exact solver (OR-Tools
// CP-SAT) proves it in 0.1 s — and all the program could say about it was which
// lesson did not fit. Here the same week is asked again of a SAT formula (sat.ts)
// with one family of changes allowed, each change a literal that is counted:
// closed teacher hours, the daily limits, the block shape, and as a last resort
// the weekly hours. The CLASS's own closed hours are never among them, and rooms
// stay as they are: there is no Relaxation for either, so no suggestion can name
// one.
//
// The count is then pushed down until the formula says "no fewer", so a
// suggestion marked `proven` is the smallest change of its family there is, not
// the smallest a search stumbled on. The local repair search was tried first and
// found 12 teacher hours where 4 are enough (DECISIONS.md, 2026-09-24).
//
// A suggestion is not a guess either. It carries the week it was found with,
// and `verifySuggestion` checks that week against the CHANGED data through the
// same blocker() the drag uses, and through rules.ts, before anything is shown.

import { blocker, buildIndex, liftBlock, pendingBlocks, placedBlocks } from './constraints';
import type { Index } from './constraints';
import { setAvailability, setTeacherLimit, updateLesson } from './entities';
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
import { Sat, atMostOne, not, pos, totalizer } from './sat';
import type { Lit } from './sat';
import { blockPlan } from '../leaf/blocks';
import { t } from '../leaf/i18n';
import { closedKey, parseKey, placementKey } from '../leaf/keys';
import { dayLabel } from '../leaf/names';
import type { Id, Lesson, State } from '../leaf/types';

export type RelaxFamily = 'teacherHours' | 'rules' | 'blockShape' | 'weeklyHours';

/** One change to the data. There is no class or room variant, on purpose. */
export type Relaxation =
  | { kind: 'teacherHour'; teacherId: Id; day: number; hour: number }
  | { kind: 'lessonDayLimit'; lessonId: Id; limit: number }
  | { kind: 'teacherDayLimit'; teacherId: Id; limit: number }
  | { kind: 'teacherConsecutive'; teacherId: Id; limit: number }
  | { kind: 'blockShape'; lessonId: Id; blocks: number[] }
  /** The hours dropped, and the named blocks what is left keeps. */
  | { kind: 'weeklyHours'; lessonId: Id; hours: number; blocks: number[] };

export interface Suggestion {
  family: RelaxFamily;
  changes: Relaxation[];
  /** The whole week found under `changes`: fixed cells included. */
  placements: Record<string, Id>;
  /**
   * How big the change is, in the family's own unit: teacher hours opened,
   * hours over the old limits, lessons reshaped, hours dropped.
   */
  size: number;
  /** No smaller change of this family exists (the formula said so). */
  proven: boolean;
  /**
   * The run kept what was on the grid, no way was found that way, and this one
   * lays the unpinned lessons out again: applying it replaces them.
   */
  relaid: boolean;
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
  families: RelaxFamily[];
}

const DEFAULTS: RelaxOptions = {
  keepPlaced: true,
  exclusions: { teacherIds: [], classIds: [], dayNames: [] },
  budgetMs: 90_000,
  families: ['teacherHours', 'rules', 'blockShape', 'weeklyHours'],
};

/**
 * How far the cost counter counts at first. It is doubled whenever the answer
 * lies above it, so a small first guess costs one extra question at most.
 */
const FIRST_CAP = 8;

/**
 * How much each family may search, in SAT conflicts: a count and not a clock,
 * so the same data gets the same suggestion on any machine (the solver counts
 * nodes for the same reason). The first family is the likeliest real fix, and
 * the one that also finds a week the solver missed; the last two are rarely
 * the answer and their "no" is the kind this solver proves slowest. MEASURED on
 * the father's data (2026-09-24): 4 teacher hours after about 150 000 conflicts,
 * 6 limit changes after about 57 000; neither was proven smallest within a
 * minute. The clock (`budgetMs`) is only a cap over all of it.
 */
const FAMILY_CONFLICTS: Record<RelaxFamily, number> = {
  teacherHours: 200_000,
  rules: 80_000,
  blockShape: 30_000,
  weeklyHours: 30_000,
};

export type RelaxStage = 'building' | 'solving' | 'proving' | 'checking';

export interface RelaxProgress {
  family: RelaxFamily;
  stage: RelaxStage;
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
  return replaceActiveGrid(applyRelaxations(d, s.changes), { placements: { ...s.placements } });
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
  const named = new Set(
    s.changes.flatMap((c) =>
      c.kind === 'teacherHour' ? [closedKey(c.teacherId, c.day, c.hour)] : [],
    ),
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
    if (base.unavailable[closedKey(lesson.teacherId, parts.day, parts.hour)] === undefined)
      continue;
    out.push({
      kind: 'teacherHour',
      teacherId: lesson.teacherId,
      day: parts.day,
      hour: parts.hour,
    });
  }
  return sortChanges(out);
}

/** The limit overrides `grid` needs on top of `base`'s rules. */
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
    for (let day = 0; day < days; day++)
      most = Math.max(most, lessonDayCount(d, lesson, day, hourCount));
    if (most > limit) out.push({ kind: 'lessonDayLimit', lessonId: lesson.id, limit: most });
  }
  for (const teacher of d.teachers) {
    const perDay = teacherLimit(base, teacher.id, 'maxPerDay');
    const run = teacherLimit(base, teacher.id, 'maxConsecutive');
    let most = 0;
    let longest = 0;
    for (let day = 0; day < days; day++) {
      most = Math.max(most, teacherDayCount(ix, teacher.id, day, hourCount));
      longest = Math.max(longest, longestRun(ix, teacher.id, day, hourCount));
    }
    if (perDay > 0 && most > perDay)
      out.push({ kind: 'teacherDayLimit', teacherId: teacher.id, limit: most });
    if (run > 0 && longest > run) {
      out.push({ kind: 'teacherConsecutive', teacherId: teacher.id, limit: longest });
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

// ---------------------------------------------------------------- the model
//
// One SAT formula per family. A variable per (block, start cell) the block may
// legally take; exactly one per block; at most one lesson per class, teacher and
// room hour; the daily limits as counters over "is taught at this hour" flags.
// The family's changes are the only extra freedom, and each one it uses is a
// literal counted into the cost.

interface Slot {
  lesson: Lesson;
  size: number;
  /** blockShape: which version of the lesson this block belongs to. */
  variant: 'as-is' | 'singles';
  /** weeklyHours: this block may be dropped, at the cost of its hours. */
  drop?: Lit;
  starts: number[];
  vars: Lit[];
}

interface Model {
  sat: Sat;
  slots: Slot[];
  /** The literals the cost counts, one entry per unit of cost. */
  cost: Lit[];
  /** rules only: the second cost, raises past the first step, counted after the first is fixed. */
  cost2: Lit[];
  /** blockShape: lesson → "reshaped". */
  reshape: Map<Id, Lit>;
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
  which: RelaxFamily,
  opts: RelaxOptions,
  hint: Readonly<Record<string, Id>>,
): Model {
  const sat = new Sat();
  const { fixed, fixedState, fixedIx } = frame;
  const days = base.settings.days.length;
  const hours = base.settings.hours.length;
  const excludedDays = new Set(opts.exclusions.dayNames);
  const classes = new Map(base.classes.map((x) => [x.id, x]));
  const openTeacher = which === 'teacherHours';
  const cost: Lit[] = [];
  const cost2: Lit[] = [];
  const opened = new Map<string, Lit>();
  const reshape = new Map<Id, Lit>();

  const cells = new Map<string, Lit[]>();
  const lessonHours = new Map<string, Lit[]>();
  const teacherHours = new Map<string, Lit[]>();
  const push = (map: Map<string, Lit[]>, key: string, l: Lit) => {
    const list = map.get(key);
    if (list === undefined) map.set(key, [l]);
    else list.push(l);
  };

  // ---- the blocks
  const slots: Slot[] = [];
  for (const lesson of frame.lessons) {
    const owed = pendingBlocks(fixedState, lesson);
    if (owed.length === 0) continue;
    const group = classes.get(lesson.classId);
    const roomId = group?.roomId ?? null;
    const reshapeable =
      which === 'blockShape' &&
      lesson.blocks.length > 0 &&
      (fixedIx.placedHours.get(lesson.id) ?? 0) === 0;
    const variants: Array<{ variant: Slot['variant']; sizes: number[] }> = [
      { variant: 'as-is', sizes: owed },
    ];
    if (reshapeable) {
      const r = pos(sat.newVar());
      reshape.set(lesson.id, r);
      cost.push(r);
      // Nothing of it is fixed, so what it owes is the whole lesson.
      variants.push({ variant: 'singles', sizes: Array<number>(lesson.weeklyHours).fill(1) });
    }
    for (const { variant, sizes } of variants) {
      const same: Slot[] = [];
      for (const size of sizes) {
        const slot: Slot = { lesson, size, variant, starts: [], vars: [] };
        if (which === 'weeklyHours') {
          slot.drop = pos(sat.newVar());
          for (let i = 0; i < size; i++) cost.push(slot.drop);
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
              else if (fixedIx.teacherBusy.has(closedKey(lesson.teacherId, day, h))) ok = false;
              else if (
                roomId != null &&
                (base.unavailable[closedKey(roomId, day, h)] !== undefined ||
                  fixedIx.roomBusy.has(closedKey(roomId, day, h)))
              ) {
                ok = false;
              } else if (base.unavailable[closedKey(lesson.teacherId, day, h)] !== undefined) {
                if (openTeacher) closedHere.push(closedKey(lesson.teacherId, day, h));
                else ok = false;
              }
            }
            if (!ok) continue;
            const x = pos(sat.newVar());
            slot.starts.push(day * hours + hour);
            slot.vars.push(x);
            for (const key of closedHere) {
              let r = opened.get(key);
              if (r === undefined) {
                r = pos(sat.newVar());
                opened.set(key, r);
                cost.push(r);
              }
              sat.addClause([not(x), r]);
            }
            for (let k = 0; k < size; k++) {
              const h = hour + k;
              push(cells, `c|${lesson.classId}|${day}|${h}`, x);
              push(cells, `t|${lesson.teacherId}|${day}|${h}`, x);
              if (roomId != null) push(cells, `r|${roomId}|${day}|${h}`, x);
              push(lessonHours, `${lesson.id}|${day}|${h}`, x);
              push(teacherHours, `${lesson.teacherId}|${day}|${h}`, x);
            }
            // Start the search from the stuck week: it is most of an answer.
            if (hint[placementKey(lesson.classId, day, hour)] === lesson.id)
              sat.setPhase(x >> 1, true);
          }
        }
        // Exactly one start, unless the block's version is not the one in use or it is dropped.
        const guard: Lit[] = [];
        const r = reshape.get(lesson.id);
        if (r !== undefined) guard.push(variant === 'as-is' ? r : not(r));
        if (slot.drop !== undefined) guard.push(slot.drop);
        sat.addClause([...guard, ...slot.vars]);
        atMostOne(sat, slot.vars);
        if (r !== undefined) {
          for (const x of slot.vars) sat.addClause([not(x), variant === 'as-is' ? not(r) : r]);
        }
        if (slot.drop !== undefined)
          for (const x of slot.vars) sat.addClause([not(x), not(slot.drop)]);
        // Two blocks of the same lesson and length are interchangeable: the
        // second may not start before the first, or the search would prove
        // every impossibility once per ordering.
        const twin =
          slot.drop === undefined
            ? same.find((s) => s.size === size && s.variant === variant)
            : undefined;
        if (twin !== undefined) orderAfter(sat, twin, slot);
        same.push(slot);
        slots.push(slot);
      }
    }
    // weeklyHours: a lesson keeps at least one block (the program asks for at least one hour).
    if (which === 'weeklyHours') {
      const mine = slots.filter((s) => s.lesson.id === lesson.id && s.drop !== undefined);
      if (mine.length > 0 && (fixedIx.placedHours.get(lesson.id) ?? 0) === 0) {
        sat.addClause(mine.map((s) => not(s.drop!)));
      }
    }
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
  if (which !== 'weeklyHours') {
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
      const owed = slots
        .filter((x) => x.lesson.classId === group.id && x.variant === 'as-is')
        .reduce((sum, x) => sum + x.size, 0);
      if (owed === 0 || owed !== open.length) continue;
      for (const key of open) sat.addClause(cells.get(key) ?? []);
    }
  }

  // ---- the daily limits
  let one: Lit | null = null;
  const constant = () => (one ??= sat.trueLit());
  const rules = which === 'rules';
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
  const stepsFor = (): Lit[] => {
    const steps = [pos(sat.newVar()), pos(sat.newVar()), pos(sat.newVar())];
    sat.addClause([not(steps[1]!), steps[0]!]);
    sat.addClause([not(steps[2]!), steps[1]!]);
    cost.push(steps[0]!);
    cost2.push(steps[1]!, steps[2]!);
    return steps;
  };

  for (const lesson of frame.lessons) {
    const bound = sameLimit(base, lesson);
    if (bound <= 0) continue;
    const steps = rules ? stepsFor() : null;
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
    const daySteps = rules && perDay > 0 ? stepsFor() : null;
    const runSteps = rules && run > 0 ? stepsFor() : null;
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

  return { sat, slots, cost, cost2, reshape };
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
  base: State,
  hint: Readonly<Record<string, Id>>,
  options?: Partial<RelaxOptions>,
): Relaxer {
  const opts: RelaxOptions = { ...DEFAULTS, ...options };
  let frame = frameOf(base, opts);
  let relaid = false;
  const lessonsById = new Map(base.lessons.map((x) => [x.id, x]));

  let elapsedMs = 0;
  let family: RelaxFamily = opts.families[0] ?? 'teacherHours';
  let stage: RelaxStage = 'building';
  const suggestions: Suggestion[] = [];
  let finished: RelaxResult | null = null;
  let deadline = 0;

  /** The running family's conflict count at which it has to stop. */
  let familyUntil = 0;
  const budgetLeft = () => opts.budgetMs - elapsedMs;

  /** Asks the formula one question, a slice at a time. null = out of budget. */
  function* ask(sat: Sat, assumptions: Lit[]): Generator<void, 'sat' | 'unsat' | 'budget'> {
    sat.start(assumptions);
    for (;;) {
      if (budgetLeft() <= 0 || sat.conflicts >= familyUntil) return 'budget';
      const status = sat.run(deadline, familyUntil);
      if (status !== 'paused') return status;
      yield;
    }
  }

  /** The changes a family's week needs, read off the week itself. */
  function changesOf(which: RelaxFamily, model: Model, grid: Record<string, Id>): Relaxation[] {
    switch (which) {
      case 'teacherHours':
        return openedHours(base, grid);
      case 'rules':
        return raisedLimits(base, grid);
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
        for (const slot of model.slots) {
          if (slot.drop === undefined || !model.sat.value(slot.drop)) continue;
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
    if (which === 'rules') return hoursOver(base, grid);
    if (which === 'weeklyHours') {
      return changes.reduce((sum, c) => {
        if (c.kind !== 'weeklyHours') return sum;
        return sum + (lessonsById.get(c.lessonId)?.weeklyHours ?? c.hours) - c.hours;
      }, 0);
    }
    return changes.length;
  }

  function* familySearch(which: RelaxFamily): Generator<void, void> {
    family = which;
    stage = 'building';
    const model = buildModel(base, frame, which, opts, hint);
    yield;
    const { sat } = model;
    familyUntil = sat.conflicts + FAMILY_CONFLICTS[which];

    // Any week at all under this family's changes.
    stage = 'solving';
    const answer = yield* ask(sat, []);
    if (answer !== 'sat') return;

    // Then fewer and fewer changes, until "no fewer" is proven. The bound is an
    // assumption, not a clause, so the proof does not poison the formula for
    // the second question (rules: how far each limit has to go up).
    let best = gridOf(base, frame, model);
    const tighten = function* (
      lits: Lit[],
      keep: Lit[],
    ): Generator<void, { keep: Lit[]; done: boolean }> {
      if (lits.length === 0) return { keep, done: true };
      let ub = countTrue(sat, lits);
      let lb = 0;
      // The counter is built small and grown: one that counts to the first
      // week's cost (175 teacher hours on the father's data) is a formula many
      // times the size of the timetable, and every question after it pays.
      let cap = Math.min(ub + 1, FIRST_CAP);
      let out = totalizer(sat, lits, cap);
      stage = 'proving';
      while (ub > lb) {
        const k = Math.min(ub - 1, cap - 1);
        const status = yield* ask(sat, [...keep, not(out[k]!)]);
        if (status === 'budget') return { keep, done: false };
        if (status === 'unsat') {
          lb = k + 1;
          if (lb >= ub) break;
          cap = Math.min(ub + 1, cap * 2);
          out = totalizer(sat, lits, cap);
          continue;
        }
        best = gridOf(base, frame, model);
        ub = countTrue(sat, lits);
      }
      return { keep: out.length > ub ? [...keep, not(out[ub]!)] : keep, done: true };
    };
    const first = yield* tighten(model.cost, []);
    let proven = first.done;
    if (proven && model.cost2.length > 0) {
      // The limits are fewest; now the steps they go up by. Solved again under
      // the first bound, so the model read below is one that respects it.
      const again = yield* ask(sat, first.keep);
      if (again === 'sat') {
        best = gridOf(base, frame, model);
        proven = (yield* tighten(model.cost2, first.keep)).done;
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
    };
    const checked = { ...opts, keepPlaced: opts.keepPlaced && !relaid };
    if (verifySuggestion(base, s, checked).length === 0) suggestions.push(s);
  }

  function* pass(): Generator<void, void> {
    for (const which of opts.families) {
      yield* familySearch(which);
      // A week that needs no change at all is the answer to every family.
      if (suggestions.some((s) => s.changes.length === 0)) return;
    }
  }

  function* all(): Generator<void, void> {
    yield* pass();
    // The run kept what was already laid out, and on the father's own file
    // that is exactly what left no way: 330 hours in place, the empty ones in
    // pieces a 2-hour block cannot use, and no change of any family moves a
    // placed block. So the search goes on with only the pins kept, and says so
    // (the user's decision, 2026-09-24).
    if (suggestions.length === 0 && opts.keepPlaced) {
      relaid = true;
      frame = frameOf(base, { ...opts, keepPlaced: false });
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
      return { family, stage, suggestions: [...suggestions], elapsedMs };
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

/**
 * One line per change, the way the father would say it: a teacher's hours on
 * one day together ("Ö6 Cumartesi 11–12. saat"), a limit with its old and new
 * number.
 */
export function suggestionLines(d: State, s: Suggestion): string[] {
  const ix = buildIndex(d);
  const lines: string[] = [];
  const byDay = new Map<string, { teacherId: Id; day: number; hours: number[] }>();
  for (const c of s.changes) {
    if (c.kind !== 'teacherHour') continue;
    const key = `${c.teacherId}|${String(c.day).padStart(2, '0')}`;
    const entry = byDay.get(key) ?? { teacherId: c.teacherId, day: c.day, hours: [] };
    entry.hours.push(c.hour);
    byDay.set(key, entry);
  }
  for (const key of [...byDay.keys()].sort()) {
    const entry = byDay.get(key)!;
    lines.push(
      t('{kim} {gun} {saatler}. saat', {
        kim: ix.teacherById.get(entry.teacherId)?.short ?? '?',
        gun: dayLabel(d.settings.days[entry.day]?.name ?? t('{n}. gün', { n: entry.day + 1 })),
        saatler: hourList(d, entry.hours),
      }),
    );
  }
  for (const c of s.changes) {
    switch (c.kind) {
      case 'teacherHour':
        break;
      case 'lessonDayLimit': {
        const lesson = ix.lessonById.get(c.lessonId);
        lines.push(
          t('{ders}: aynı gün en fazla {eski} yerine {yeni} saat', {
            ders: lessonName(ix, c.lessonId),
            eski: lesson === undefined ? '?' : sameLimit(d, lesson),
            yeni: c.limit,
          }),
        );
        break;
      }
      case 'teacherDayLimit':
        lines.push(
          t('{kim}: günde en fazla {eski} yerine {yeni} saat', {
            kim: ix.teacherById.get(c.teacherId)?.short ?? '?',
            eski: teacherLimit(d, c.teacherId, 'maxPerDay'),
            yeni: c.limit,
          }),
        );
        break;
      case 'teacherConsecutive':
        lines.push(
          t('{kim}: art arda en fazla {eski} yerine {yeni} saat', {
            kim: ix.teacherById.get(c.teacherId)?.short ?? '?',
            eski: teacherLimit(d, c.teacherId, 'maxConsecutive'),
            yeni: c.limit,
          }),
        );
        break;
      case 'blockShape': {
        const lesson = ix.lessonById.get(c.lessonId);
        lines.push(
          t('{ders}: {eski} yerine {yeni}', {
            ders: lessonName(ix, c.lessonId),
            eski: lesson === undefined ? '?' : shape(lesson.blocks, lesson.weeklyHours),
            yeni: lesson === undefined ? '?' : shape(c.blocks, lesson.weeklyHours),
          }),
        );
        break;
      }
      case 'weeklyHours': {
        const lesson = ix.lessonById.get(c.lessonId);
        lines.push(
          t('{ders}: haftada {eski} yerine {yeni} saat', {
            ders: lessonName(ix, c.lessonId),
            eski: lesson?.weeklyHours ?? '?',
            yeni: c.hours,
          }),
        );
        break;
      }
    }
  }
  return lines;
}
