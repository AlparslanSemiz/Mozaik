// The week as a SAT formula (sat.ts): a start variable per block and slot,
// "at most one" per class, teacher and room hour, counters for the daily
// limits, and one counted literal per change a family allows. This is the
// constraints' second writing; `verifySuggestion` is what keeps it honest
// (ARCHITECTURE, "Öneri araması kısıtları ikinci kez yazar").

import {
  type Id,
  type Lesson,
  type State,
  closedKey,
  lessonSubject,
  parseKey,
  placementKey,
} from '../../leaf/model';
import { type Index, buildIndex, pendingBlocks } from '../constraints';
import { lessonExcluded } from '../program';
import { fixedCells } from '../solver';
import { HAND_CAP, type RelaxFamily, type RelaxOptions } from './options';
import { sameLimit, teacherLimit, withGrid } from './reading';
import { type Lit, Sat, atMostOne, exactlyOne, not, pos, totalizer } from './sat';
import { holds } from './verify';

// ---------------------------------------------------------------- the model
//
// One SAT formula per kind of change. A variable per (block, start cell) the
// block may legally take; exactly one per block; at most one lesson per class,
// teacher and room hour; the daily limits as counters over "is taught at this
// hour" flags. The kind's changes are the only extra freedom, and each one it
// uses is a literal the costs count.

/** Which formula a family asks: the three teacher-hour ways share one. */
export type ModelKind =
  'teacher' | 'mixed' | 'rules' | 'reassign' | 'hand' | 'blockShape' | 'weeklyHours';

export function kindOf(which: RelaxFamily): ModelKind {
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

export interface Slot {
  lesson: Lesson;
  /** Who teaches it in this version: another teacher only for 'reassign'. */
  teacherId: Id;
  size: number;
  /** Which version of the lesson this block belongs to; 'as-is' is the data's own. */
  variant: string;
  starts: number[];
  vars: Lit[];
}

export interface Model {
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

export function frameOf(base: State, opts: RelaxOptions): Frame {
  const fixed = fixedCells(base, opts.keepPlaced, opts.exclusions);
  const fixedState = withGrid(base, fixed);
  return {
    fixed,
    fixedState,
    fixedIx: buildIndex(fixedState),
    lessons: base.lessons.filter((x) => !lessonExcluded(x, opts.exclusions)),
  };
}

export function buildModel(
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

  // ---- two lessons that may not share a day (State.relations, B5.3)
  //
  // Hard: no way relaxes it. A day both lessons already hold in the kept grid
  // is a breach Kontrol lists; asking the formula to undo it would make every
  // search unsatisfiable, so that day is left alone.
  const classOf = new Map(base.lessons.map((x) => [x.id, x.classId]));
  const onDay = (lessonId: Id, classId: Id, day: number) => {
    let kept = false;
    const lits = new Set<Lit>();
    for (let h = 0; h < hours; h++) {
      if (fixed[placementKey(classId, day, h)] === lessonId) kept = true;
      for (const x of lessonHours.get(`${lessonId}|${day}|${h}`) ?? []) lits.add(x);
    }
    return { kept, lits: [...lits] };
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
        for (const x of one.kept ? two.lits : one.lits) sat.addClause([not(x)]);
        continue;
      }
      if (one.lits.length === 0 || two.lits.length === 0) continue;
      sat.addClause([not(indicator(sat, one.lits)), not(indicator(sat, two.lits))]);
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
export function costsOf(which: RelaxFamily, model: Model): [Lit[], Lit[]] {
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
export function subsets(items: readonly number[], size: number): number[][] {
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
export function gridOf(base: State, frame: Frame, model: Model): Record<string, Id> {
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

export function countTrue(sat: Sat, lits: readonly Lit[]): number {
  let n = 0;
  for (const l of lits) if (sat.value(l)) n++;
  return n;
}
