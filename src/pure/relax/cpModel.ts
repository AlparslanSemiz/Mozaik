// The week written for OR-Tools CP-SAT directly, for the teacher-hour ways and
// the rules. A PURE module, tested in cpModel.test.ts.
//
// WHY. `model.ts` writes the week for our own clause solver, and cpsat.ts hands
// that same formula to CP-SAT. Its shapes (totalizer counters as clauses,
// `orderAfter` prefix chains, an `opened` flag per closed hour tied to the
// starts by implications) give CP-SAT's linear relaxation little to work with:
// on the father's week "is there a week with 3 hours?" did not come back in
// 20 s. The same question on a model written for CP-SAT (scratch prototype
// cp.py, analiz/1-cpsat-model.md) came back INFEASIBLE in 2-13 s on 4 workers.
// This file is that model:
//   - blocks of one lesson and length are ONE group: a start variable per
//     legal cell and "the starts sum to the number of blocks", so there is no
//     symmetry to break and no ordering variable;
//   - a full class's open hour is "exactly one", any other cell "at most one";
//   - an opened teacher hour is the sum of the starts that cover it (the
//     teacher's "at most one" makes it 0 or 1), not a flag of its own;
//   - the daily limits are linear: hours times starts, at most the limit;
//   - a rule raised is three ordered step flags per owner (lesson or teacher),
//     the limit going up by their sum.
// It is the constraints' THIRD writing (model.ts, blocker()); cpModel.test.ts
// holds it to the other two on random worlds and broken weeks.
//
// Only the 'teacher' and 'rules' kinds (kindOf). The others stay on cpsat.ts's
// recorded formula.

import {
  type Id,
  type Lesson,
  type State,
  closedKey,
  parseKey,
  placementKey,
} from '../../leaf/model';
import { pendingBlocks } from '../constraints';
import { type Frame, kindOf, refusalsOf } from './model';
import type { RelaxFamily, RelaxOptions } from './options';
import { sameLimit, teacherLimit } from './reading';
import { type CpAnswer, Writer } from './cpsat';

// ---------------------------------------------------------------- the record

/** A CP-SAT literal: the variable, or -variable-1 for its negation. */
type Ref = number;

/** coefficient × variable. */
export interface Term {
  v: number;
  c: number;
}

/** The subset of CpModelProto's constraints this model writes. */
export type CpConstraint =
  { k: 'or' | 'amo' | 'eo'; lits: Ref[] } | { k: 'linear'; terms: Term[]; lo: number; hi: number };

/** A group of interchangeable blocks: one lesson, one length, `count` of them. */
export interface CpGroup {
  lesson: Lesson;
  size: number;
  count: number;
  /** Legal start cells (day × hours + hour) and their variables, in order. */
  starts: number[];
  vars: number[];
}

/** A variable whose value follows from others: how `valuesOf` works it out. */
type Derived =
  | { v: number; k: 'sum' | 'or'; of: number[] }
  | { v: number; k: 'apart'; o: number; beside: number[] }
  | { v: number; k: 'newDay'; any: number; y: number };

export interface CpWeek {
  which: RelaxFamily;
  /** Each variable's domain. */
  vars: Array<[number, number]>;
  cons: CpConstraint[];
  groups: CpGroup[];
  /** closedKey → the variable that is 1 when that closed teacher hour is taught. */
  opened: Map<string, number>;
  apart: number[];
  newDay: number[];
  touched: number[];
  /** Per owner of a limit (`L|lesson`, `D|teacher`, `R|teacher`): three ordered steps. */
  steps: Array<{ owner: string; s: [number, number, number]; cons: number[] }>;
  derived: Derived[];
  /** Where the next question starts: a value per variable, or null. */
  hint: number[] | null;
  /** The last answer's values. */
  values: number[];
}

/** Far below any sum this model writes, and still exact in a double. */
const LOW = -(2 ** 40);

/** The families this file writes a model for. */
export function cpNative(which: RelaxFamily): boolean {
  const kind = kindOf(which);
  return kind === 'teacher' || kind === 'rules';
}

// ----------------------------------------------------------------- the model

export function buildCpWeek(
  base: State,
  frame: Frame,
  which: RelaxFamily,
  opts: RelaxOptions,
  hint: Readonly<Record<string, Id>>,
): CpWeek {
  const kind = kindOf(which);
  if (kind !== 'teacher' && kind !== 'rules') throw new Error(`cpModel: ${which} yazılmadı`);
  const openTeacher = kind === 'teacher';
  const relaxRules = kind === 'rules';
  const { fixed, fixedIx } = frame;
  const days = base.settings.days.length;
  const hours = base.settings.hours.length;
  const excludedDays = new Set(opts.exclusions.dayNames);
  const classes = new Map(base.classes.map((x) => [x.id, x]));
  const { refusedDays, refusedHours, refusedTeachers, caps, refusedLimits } = refusalsOf(opts);
  const mayOpen = (teacherId: Id, day: number, hour: number) =>
    openTeacher &&
    !refusedTeachers.has(teacherId) &&
    !refusedDays.has(`${teacherId}|${day}`) &&
    caps.get(`${teacherId}|${day}`) !== 0 &&
    !refusedHours.has(closedKey(teacherId, day, hour));

  const w: CpWeek = {
    which,
    vars: [],
    cons: [],
    groups: [],
    opened: new Map(),
    apart: [],
    newDay: [],
    touched: [],
    steps: [],
    derived: [],
    hint: null,
    values: [],
  };
  const bool = (): number => w.vars.push([0, 1]) - 1;
  const not = (v: number): Ref => -v - 1;
  const add = (c: CpConstraint): number => w.cons.push(c) - 1;
  /** lo ≤ Σ terms ≤ hi; a sum with no terms is decided here. */
  const linear = (terms: Term[], lo: number, hi: number): number => {
    if (terms.length === 0) {
      if (lo <= 0 && 0 <= hi) return -1;
      // Never true: a variable fixed at 0 that must be 1.
      const z = w.vars.push([0, 0]) - 1;
      return add({ k: 'or', lits: [z] });
    }
    return add({ k: 'linear', terms, lo, hi });
  };
  const ones = (vs: readonly number[], c = 1): Term[] => vs.map((v) => ({ v, c }));
  /** A flag that is 1 exactly when one of `vs` is: the variable itself for one. */
  const anyOf = (vs: number[]): number => {
    if (vs.length === 1) return vs[0]!;
    const t = bool();
    for (const v of vs) add({ k: 'or', lits: [not(v), t] });
    add({ k: 'or', lits: [not(t), ...vs] });
    w.derived.push({ v: t, k: 'or', of: vs });
    return t;
  };
  const push = <T>(map: Map<string, T[]>, key: string, x: T) => {
    const list = map.get(key);
    if (list === undefined) map.set(key, [x]);
    else list.push(x);
  };

  /** Class, teacher and room cells → the starts covering them. */
  const cells = new Map<string, number[]>();
  /** `lesson|day` → hours × start. */
  const lessonDay = new Map<string, Term[]>();
  /** `lesson|day` → the hours some start could teach it. */
  const lessonReach = new Map<string, Set<number>>();
  /** `teacher|day|hour` → the starts covering it. */
  const teacherAt = new Map<string, number[]>();
  /** closedKey of a teacher hour that may open → the starts covering it. */
  const cover = new Map<string, number[]>();

  // ---- the blocks, one group per lesson and length
  for (const lesson of frame.lessons) {
    const owed = pendingBlocks(frame.fixedState, lesson);
    if (owed.length === 0) continue;
    const roomId = classes.get(lesson.classId)?.roomId ?? null;
    const teacherId = lesson.teacherId;
    const counts = new Map<number, number>();
    for (const size of owed) counts.set(size, (counts.get(size) ?? 0) + 1);
    for (const [size, count] of counts) {
      const g: CpGroup = { lesson, size, count, starts: [], vars: [] };
      for (let day = 0; day < days; day++) {
        if (excludedDays.has(base.settings.days[day]!.name)) continue;
        for (let hour = 0; hour + size <= hours; hour++) {
          let ok = true;
          const closedHere: string[] = [];
          for (let k = 0; k < size && ok; k++) {
            const h = hour + k;
            if (fixed[placementKey(lesson.classId, day, h)] !== undefined) ok = false;
            else if (base.unavailable[closedKey(lesson.classId, day, h)] !== undefined) ok = false;
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
          const x = bool();
          g.starts.push(day * hours + hour);
          g.vars.push(x);
          for (const key of closedHere) push(cover, key, x);
          for (let k = 0; k < size; k++) {
            const h = hour + k;
            push(cells, `c|${lesson.classId}|${day}|${h}`, x);
            push(cells, `t|${teacherId}|${day}|${h}`, x);
            if (roomId != null) push(cells, `r|${roomId}|${day}|${h}`, x);
            push(teacherAt, `${teacherId}|${day}|${h}`, x);
          }
          push(lessonDay, `${lesson.id}|${day}`, { v: x, c: size });
          const reach = lessonReach.get(`${lesson.id}|${day}`) ?? new Set<number>();
          for (let k = 0; k < size; k++) reach.add(hour + k);
          lessonReach.set(`${lesson.id}|${day}`, reach);
        }
      }
      if (count === 1) add({ k: 'eo', lits: g.vars });
      else linear(ones(g.vars), count, count);
      w.groups.push(g);
    }
  }

  // ---- one thing per class, teacher and room hour; a full class leaves none empty
  const full = new Set<string>();
  for (const group of base.classes) {
    const open: string[] = [];
    for (let day = 0; day < days; day++) {
      if (excludedDays.has(base.settings.days[day]!.name)) continue;
      for (let h = 0; h < hours; h++) {
        if (fixed[placementKey(group.id, day, h)] !== undefined) continue;
        if (base.unavailable[closedKey(group.id, day, h)] !== undefined) continue;
        if (group.roomId != null && base.unavailable[closedKey(group.roomId, day, h)] !== undefined)
          continue;
        open.push(`c|${group.id}|${day}|${h}`);
      }
    }
    const owed = w.groups
      .filter((g) => g.lesson.classId === group.id)
      .reduce((sum, g) => sum + g.size * g.count, 0);
    if (owed === 0 || owed !== open.length) continue;
    for (const key of open) {
      full.add(key);
      add({ k: 'eo', lits: cells.get(key) ?? [] });
    }
  }
  for (const [key, xs] of cells) if (!full.has(key) && xs.length > 1) add({ k: 'amo', lits: xs });

  // ---- an opened hour: the starts that cover it, at most one by the teacher's cell
  for (const [key, xs] of cover) {
    if (xs.length === 1) {
      w.opened.set(key, xs[0]!);
      continue;
    }
    const o = bool();
    linear([...ones(xs), { v: o, c: -1 }], 0, 0);
    w.derived.push({ v: o, k: 'sum', of: xs });
    w.opened.set(key, o);
  }

  // ---- "at most N hours that day" (Olmaz, en fazla N saat)
  for (const [key, max] of caps) {
    if (max <= 0) continue;
    const [teacherId, day] = key.split('|') as [Id, string];
    const os = [...w.opened]
      .filter(([k]) => {
        const parts = parseKey(k);
        return parts !== null && parts.id === teacherId && parts.day === Number(day);
      })
      .map(([, o]) => o);
    if (os.length > max) linear(ones(os), LOW, max);
  }

  // ---- the daily limits, raised by up to three steps under the rules way
  const stepsFor = (owner: string): CpWeek['steps'][number] | null => {
    if (!relaxRules || refusedLimits.has(owner)) return null;
    const s: [number, number, number] = [bool(), bool(), bool()];
    add({ k: 'or', lits: [not(s[1]), s[0]] });
    add({ k: 'or', lits: [not(s[2]), s[1]] });
    const step = { owner, s, cons: [] };
    w.steps.push(step);
    return step;
  };
  /** Σ terms ≤ max, plus the owner's steps `which` of them when it has any. */
  const limit = (
    terms: Term[],
    max: number,
    step: CpWeek['steps'][number] | null,
    use: readonly number[],
  ) => {
    const withSteps =
      step === null ? terms : [...terms, ...use.map((i) => ({ v: step.s[i]!, c: -1 }))];
    const at = linear(withSteps, LOW, max);
    if (step !== null && at >= 0) step.cons.push(at);
  };

  for (const lesson of frame.lessons) {
    const bound = sameLimit(base, lesson);
    if (bound <= 0) continue;
    const step = stepsFor(`L|${lesson.id}`);
    for (let day = 0; day < days; day++) {
      let kept = 0;
      for (let h = 0; h < hours; h++)
        if (fixed[placementKey(lesson.classId, day, h)] === lesson.id) kept++;
      const terms = lessonDay.get(`${lesson.id}|${day}`) ?? [];
      // As model.ts: no row when the day cannot reach the limit at all.
      if (kept + (lessonReach.get(`${lesson.id}|${day}`)?.size ?? 0) <= bound) continue;
      limit(terms, bound - kept, step, [0, 1, 2]);
    }
  }
  for (const teacher of base.teachers) {
    const perDay = teacherLimit(base, teacher.id, 'maxPerDay');
    const run = teacherLimit(base, teacher.id, 'maxConsecutive');
    if (perDay <= 0 && run <= 0) continue;
    const daySteps = perDay > 0 ? stepsFor(`D|${teacher.id}`) : null;
    const runSteps = run > 0 ? stepsFor(`R|${teacher.id}`) : null;
    for (let day = 0; day < days; day++) {
      /** Per hour: 'kept' (a fixed lesson), the starts covering it, or null (never taught). */
      const busy: Array<'kept' | number[] | null> = [];
      for (let h = 0; h < hours; h++) {
        if (fixedIx.teacherBusy.has(closedKey(teacher.id, day, h))) busy.push('kept');
        else busy.push(teacherAt.get(`${teacher.id}|${day}|${h}`) ?? null);
      }
      const sum = (list: typeof busy) => {
        let kept = 0;
        const terms: Term[] = [];
        for (const b of list) {
          if (b === 'kept') kept++;
          else if (b !== null) terms.push(...ones(b));
        }
        return { kept, terms };
      };
      if (perDay > 0 && busy.filter((b) => b !== null).length > perDay) {
        const { kept, terms } = sum(busy);
        limit(terms, perDay - kept, daySteps, [0, 1, 2]);
      }
      if (run > 0) {
        // No window of run+1 taught hours in a row (run+1+i once raised i steps).
        const top = runSteps === null ? 0 : 3;
        for (let extra = 0; extra <= top; extra++) {
          const width = run + 1 + extra;
          for (let h = 0; h + width <= hours; h++) {
            const window = busy.slice(h, h + width);
            if (window.some((b) => b === null)) continue;
            const { kept, terms } = sum(window);
            limit(terms, width - 1 - kept, runSteps, extra < top ? [extra] : []);
          }
        }
      }
    }
  }

  // ---- two lessons that may not share a day (State.relations): hard, as in model.ts
  const classOf = new Map(base.lessons.map((x) => [x.id, x.classId]));
  const onDay = (lessonId: Id, classId: Id, day: number) => {
    let kept = false;
    for (let h = 0; h < hours; h++)
      if (fixed[placementKey(classId, day, h)] === lessonId) kept = true;
    return { kept, xs: (lessonDay.get(`${lessonId}|${day}`) ?? []).map((t) => t.v) };
  };
  for (const r of base.relations) {
    if (r.kind !== 'notSameDay') continue;
    const [a, b] = r.lessonIds;
    const classA = classOf.get(a);
    const classB = classOf.get(b);
    if (classA === undefined || classB === undefined) continue;
    for (let day = 0; day < days; day++) {
      const one = onDay(a, classA, day);
      const two = onDay(b, classB, day);
      if (one.kept && two.kept) continue;
      if (one.kept || two.kept) {
        const xs = one.kept ? two.xs : one.xs;
        if (xs.length > 0) linear(ones(xs), LOW, 0);
        continue;
      }
      if (one.xs.length === 0 || two.xs.length === 0) continue;
      linear(
        [
          { v: anyOf(one.xs), c: 1 },
          { v: anyOf(two.xs), c: 1 },
        ],
        LOW,
        1,
      );
    }
  }

  // ---- what makes an opened hour cheap or dear (the teacher-hour ways' prices)
  if (openTeacher) {
    const isOpen = (teacherId: Id, day: number, h: number) =>
      h >= 0 && h < hours && base.unavailable[closedKey(teacherId, day, h)] === undefined;
    const byDay = new Map<string, number[]>();
    const byTeacher = new Map<Id, number[]>();
    for (const [key, o] of w.opened) {
      const parts = parseKey(key)!;
      push(byDay, `${parts.id}|${parts.day}`, o);
      push(byTeacher, parts.id, o);
      if (
        isOpen(parts.id, parts.day, parts.hour - 1) ||
        isOpen(parts.id, parts.day, parts.hour + 1)
      )
        continue;
      const beside = [parts.hour - 1, parts.hour + 1].flatMap((h) => {
        const n = w.opened.get(closedKey(parts.id, parts.day, h));
        return n === undefined ? [] : [n];
      });
      // apart = opened and no neighbour opened: ap ≤ o, ap ≤ 1 - n, ap ≥ o - Σn.
      const ap = bool();
      linear(
        [
          { v: ap, c: 1 },
          { v: o, c: -1 },
        ],
        LOW,
        0,
      );
      for (const n of beside)
        linear(
          [
            { v: ap, c: 1 },
            { v: n, c: 1 },
          ],
          LOW,
          1,
        );
      linear([{ v: o, c: 1 }, ...ones(beside, -1), { v: ap, c: -1 }], LOW, 0);
      w.derived.push({ v: ap, k: 'apart', o, beside });
      w.apart.push(ap);
    }
    if (which === 'teacherDays') {
      for (const [key, os] of byDay) {
        const [teacherId, dayText] = key.split('|') as [Id, string];
        const day = Number(dayText);
        let comes = false;
        const taught: number[] = [];
        for (let h = 0; h < hours; h++) {
          if (!isOpen(teacherId, day, h)) continue;
          if (fixedIx.teacherBusy.has(closedKey(teacherId, day, h))) comes = true;
          taught.push(...(teacherAt.get(`${teacherId}|${day}|${h}`) ?? []));
        }
        if (comes) continue;
        const any = anyOf(os);
        if (taught.length === 0) {
          w.newDay.push(any);
          continue;
        }
        // "Comes that day only for it": an hour opened and none of its open hours taught.
        const y = anyOf(taught);
        const nd = bool();
        linear(
          [
            { v: any, c: 1 },
            { v: y, c: -1 },
            { v: nd, c: -1 },
          ],
          LOW,
          0,
        );
        linear(
          [
            { v: nd, c: 1 },
            { v: any, c: -1 },
          ],
          LOW,
          0,
        );
        linear(
          [
            { v: nd, c: 1 },
            { v: y, c: 1 },
          ],
          LOW,
          1,
        );
        w.derived.push({ v: nd, k: 'newDay', any, y });
        w.newDay.push(nd);
      }
    }
    if (which === 'fewTeachers') for (const os of byTeacher.values()) w.touched.push(anyOf(os));
  }

  w.hint = hintValues(base, frame, w, hint);
  return w;
}

/** What each way counts, first and then among equals (costsOf's counterpart). */
export function cpCostsOf(w: CpWeek): [Term[], Term[]] {
  const opened = [...w.opened.values()];
  const first = w.steps.map((s) => ({ v: s.s[0], c: 1 }));
  const more = w.steps.flatMap((s) => [
    { v: s.s[1], c: 1 },
    { v: s.s[2], c: 1 },
  ]);
  switch (w.which) {
    case 'teacherDays':
      return [[...ones(opened), ...ones(w.newDay, 2)], ones(w.apart)];
    case 'teacherHours':
      return [ones(opened), ones(w.apart)];
    case 'fewTeachers':
      return [ones(w.touched), [...ones(opened), ...ones(w.apart)]];
    default:
      return [first, more];
  }
}

function ones(vs: readonly number[], c = 1): Term[] {
  return vs.map((v) => ({ v, c }));
}

/** The value of Σ terms under `values`. */
export function cpCount(terms: readonly Term[], values: readonly number[]): number {
  let n = 0;
  for (const t of terms) n += t.c * (values[t.v] ?? 0);
  return n;
}

// ------------------------------------------------------------- the question

export interface CpWeekQuestion {
  minimize?: readonly Term[];
  /** Bounds for this question only: Σ terms ≤ max. */
  atMost?: ReadonlyArray<{ terms: readonly Term[]; max: number }>;
}

/** Terms with one entry per variable, zero coefficients dropped. */
function merged(terms: readonly Term[]): { vars: number[]; coeffs: number[] } {
  const coef = new Map<number, number>();
  for (const t of terms) coef.set(t.v, (coef.get(t.v) ?? 0) + t.c);
  const vars: number[] = [];
  const coeffs: number[] = [];
  for (const [v, c] of coef) {
    if (c === 0) continue;
    vars.push(v);
    coeffs.push(c);
  }
  return { vars, coeffs };
}

function writeLinear(out: Writer, terms: readonly Term[], lo: number, hi: number): void {
  const { vars, coeffs } = merged(terms);
  const lin = new Writer();
  lin.packed(1, vars);
  lin.packed(2, coeffs);
  lin.packed(3, [lo, hi]);
  const c = new Writer();
  c.bytes(12, lin.done());
  out.bytes(3, c.done());
}

/** The week plus one question, as a serialized CpModelProto. */
export function cpWeekRequest(w: CpWeek, q: CpWeekQuestion): Uint8Array {
  const out = new Writer();
  for (const [lo, hi] of w.vars) {
    const v = new Writer();
    v.packed(2, [lo, hi]);
    out.bytes(2, v.done());
  }
  for (const c of w.cons) {
    if (c.k === 'linear') {
      writeLinear(out, c.terms, c.lo, c.hi);
      continue;
    }
    // BoolArgumentProto: bool_or (3), at_most_one (26), exactly_one (29).
    const arg = new Writer();
    arg.packed(1, c.lits);
    const con = new Writer();
    con.bytes(c.k === 'or' ? 3 : c.k === 'amo' ? 26 : 29, arg.done());
    out.bytes(3, con.done());
  }
  for (const b of q.atMost ?? []) writeLinear(out, b.terms, LOW, b.max);
  if (q.minimize !== undefined && q.minimize.length > 0) {
    const { vars, coeffs } = merged(q.minimize);
    const obj = new Writer();
    obj.packed(1, vars);
    obj.packed(4, coeffs);
    out.bytes(4, obj.done());
  }
  if (w.hint !== null) {
    const hint = new Writer();
    hint.packed(
      1,
      w.hint.map((_, i) => i),
    );
    hint.packed(2, w.hint);
    out.bytes(6, hint.done());
  }
  return out.done();
}

/** Takes an answer's values: `cpGridOf` reads them, and the next question starts from them. */
export function cpLoad(w: CpWeek, answer: CpAnswer): void {
  w.values = answer.solution;
  if (answer.solution.length === w.vars.length) w.hint = [...answer.solution];
}

// --------------------------------------------------------------- the reading

/** The week in a set of values: the fixed cells and every group's starts (gridOf's counterpart). */
export function cpGridOf(
  base: State,
  frame: Frame,
  w: CpWeek,
  values: readonly number[] = w.values,
): Record<string, Id> {
  const hours = base.settings.hours.length;
  const grid: Record<string, Id> = { ...frame.fixed };
  for (const g of w.groups) {
    g.vars.forEach((x, i) => {
      if (values[x] !== 1) return;
      const day = Math.floor(g.starts[i]! / hours);
      const hour = g.starts[i]! % hours;
      for (let k = 0; k < g.size; k++)
        grid[placementKey(g.lesson.classId, day, hour + k)] = g.lesson.id;
    });
  }
  return grid;
}

/**
 * Where each group's blocks start in `grid`: the lesson's cells outside the
 * fixed ones, cut into its owed lengths at legal starts. `exact` false: as
 * much as fits, for a hint (the stuck week is not whole). null when exact and
 * no cut covers the cells.
 */
function startsIn(
  base: State,
  frame: Frame,
  w: CpWeek,
  grid: Readonly<Record<string, Id>>,
  exact: boolean,
): Map<CpGroup, number[]> | null {
  const days = base.settings.days.length;
  const hours = base.settings.hours.length;
  const byLesson = new Map<Id, CpGroup[]>();
  for (const g of w.groups) {
    const list = byLesson.get(g.lesson.id);
    if (list === undefined) byLesson.set(g.lesson.id, [g]);
    else list.push(g);
  }
  const out = new Map<CpGroup, number[]>();
  const covered = new Set<string>();
  for (const groups of byLesson.values()) {
    const lesson = groups[0]!.lesson;
    const legal = new Map(groups.map((g) => [g.size, new Set(g.starts)]));
    const left = new Map(groups.map((g) => [g.size, g.count]));
    const sizes = groups.map((g) => g.size).sort((a, b) => b - a);
    const runs: Array<{ start: number; len: number }> = [];
    for (let day = 0; day < days; day++) {
      let h = 0;
      while (h < hours) {
        const at = (x: number) => {
          const key = placementKey(lesson.classId, day, x);
          return grid[key] === lesson.id && frame.fixed[key] === undefined;
        };
        if (!at(h)) {
          h++;
          continue;
        }
        let end = h;
        while (end < hours && at(end)) end++;
        runs.push({ start: day * hours + h, len: end - h });
        h = end;
      }
    }
    const chosen: Array<{ size: number; start: number }> = [];
    let tries = 0;
    /** Cuts runs[i] from offset `from` on; true once every run and every block is used. */
    const cut = (i: number, from: number): boolean => {
      if (++tries > 20_000) return false;
      if (i === runs.length) return [...left.values()].every((n) => n === 0);
      const run = runs[i]!;
      if (from === run.len) return cut(i + 1, 0);
      for (const size of sizes) {
        if ((left.get(size) ?? 0) === 0 || from + size > run.len) continue;
        if (!legal.get(size)!.has(run.start + from)) continue;
        left.set(size, left.get(size)! - 1);
        chosen.push({ size, start: run.start + from });
        if (cut(i, from + size)) return true;
        chosen.pop();
        left.set(size, left.get(size)! + 1);
      }
      return false;
    };
    if (!cut(0, 0)) {
      if (exact) return null;
      // As much as fits, longest first, run by run.
      chosen.length = 0;
      for (const g of groups) left.set(g.size, g.count);
      for (const run of runs) {
        let from = 0;
        while (from < run.len) {
          const size = sizes.find(
            (s) =>
              (left.get(s) ?? 0) > 0 && from + s <= run.len && legal.get(s)!.has(run.start + from),
          );
          if (size === undefined) {
            from++;
            continue;
          }
          left.set(size, left.get(size)! - 1);
          chosen.push({ size, start: run.start + from });
          from += size;
        }
      }
    }
    for (const g of groups)
      out.set(
        g,
        chosen.filter((c) => c.size === g.size).map((c) => c.start),
      );
    for (const run of runs)
      for (let k = 0; k < run.len; k++) {
        const cell = run.start + k;
        covered.add(placementKey(lesson.classId, Math.floor(cell / hours), cell % hours));
      }
  }
  if (exact) {
    // Nothing in the week the groups do not account for, and the fixed cells as they were.
    for (const [key, id] of Object.entries(grid))
      if (frame.fixed[key] !== id && !covered.has(key)) return null;
    for (const [key, id] of Object.entries(frame.fixed)) if (grid[key] !== id) return null;
  }
  return out;
}

/** Every variable worked out from the starts, the steps as few as the limits allow. */
function complete(w: CpWeek, starts: Map<CpGroup, number[]>): number[] {
  const values = Array<number>(w.vars.length).fill(0);
  for (const [g, list] of starts)
    for (const s of list) {
      const i = g.starts.indexOf(s);
      if (i >= 0) values[g.vars[i]!] = 1;
    }
  const get = (v: number) => values[v] ?? 0;
  for (const d of w.derived) {
    switch (d.k) {
      case 'sum':
        values[d.v] = d.of.reduce((n, v) => n + get(v), 0);
        break;
      case 'or':
        values[d.v] = d.of.some((v) => get(v) === 1) ? 1 : 0;
        break;
      case 'apart':
        values[d.v] = get(d.o) === 1 && d.beside.every((n) => get(n) === 0) ? 1 : 0;
        break;
      case 'newDay':
        values[d.v] = get(d.any) === 1 && get(d.y) === 0 ? 1 : 0;
        break;
    }
  }
  for (const step of w.steps) {
    for (let r = 0; r <= 3; r++) {
      step.s.forEach((v, i) => (values[v] = i < r ? 1 : 0));
      if (step.cons.every((c) => holdsOne(w.cons[c]!, values))) break;
    }
  }
  return values;
}

/**
 * The values of every variable for `grid`, or null when the week is not one
 * this model can say: a block where none may start, a fixed cell moved, a
 * cell no owed block covers. Then `cpEvaluate` says whether the rules hold.
 */
export function cpValuesOf(
  base: State,
  frame: Frame,
  w: CpWeek,
  grid: Readonly<Record<string, Id>>,
): number[] | null {
  const starts = startsIn(base, frame, w, grid, true);
  return starts === null ? null : complete(w, starts);
}

/** A hint for the first question: the hint week's blocks, as far as they go. */
function hintValues(
  base: State,
  frame: Frame,
  w: CpWeek,
  grid: Readonly<Record<string, Id>>,
): number[] {
  return complete(w, startsIn(base, frame, w, grid, false)!);
}

function holdsOne(c: CpConstraint, values: readonly number[]): boolean {
  const lit = (r: Ref) => (r >= 0 ? values[r] === 1 : values[-r - 1] === 0);
  switch (c.k) {
    case 'or':
      return c.lits.some(lit);
    case 'amo':
      return c.lits.filter(lit).length <= 1;
    case 'eo':
      return c.lits.filter(lit).length === 1;
    case 'linear': {
      const sum = cpCount(c.terms, values);
      return sum >= c.lo && sum <= c.hi;
    }
  }
}

/** Whether `values` satisfy the week, and which constraints they break. No solver needed. */
export function cpEvaluate(
  w: CpWeek,
  values: readonly number[],
): { ok: boolean; broken: number[] } {
  const broken: number[] = [];
  const inDomain = w.vars.every(([lo, hi], v) => (values[v] ?? 0) >= lo && (values[v] ?? 0) <= hi);
  w.cons.forEach((c, i) => {
    if (!holdsOne(c, values)) broken.push(i);
  });
  return { ok: inDomain && broken.length === 0, broken };
}
