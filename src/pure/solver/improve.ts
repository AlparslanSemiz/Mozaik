// The pass after the search: the week the search found, made better without
// breaking anything. A PURE module, driven by solver.ts and tested in
// improve.test.ts.
//
// WHY. The search stops at the first legal week. Gaps were only ever a tie
// break between cells it already called equal, and the "Uyar" rules, the gap
// limits and "en az N saat" were never read by it at all, only reported.
// MEASURED (audit 2026-11-16): the sample school laid out with 271 teacher
// gaps; a naive walk of 6 000 legal moves within a class took it to 159.
//
// WHAT. A local search over whole blocks: move one to free hours, swap two of
// the same length in one class, or swap two of the same length of one teacher.
// A step is taken only when the week gets better on the objective below, or
// stays exactly as good (a sideways step, so the walk can cross a plateau).
// It can therefore never hand back a worse week than it was given.
//
// THE HARD RULES ARE NOT RE-IMPLEMENTED. Every step is put down through
// `occupy`, and every block it puts down is first asked of `blocker()`, the
// same question the drag and the search ask, against the grid as it stands
// with the other moved block already in place. The typed arrays below only
// rank candidates; a candidate they misjudge is refused by `blocker()`.
// Rules `blocker()` cannot judge while placing (en az N saat, the gap limits)
// are the objective's first tier, and the objective never goes up.
//
// THE OBJECTIVE, compared tier by tier (the owner's order, 2026-11-16):
//   0. breaches of the gap and "en az" rules set to Engelle
//   1. breaches of every rule set to Uyar
//   2. one lesson stacked on a day: hours past its longest card that day
//   3. teacher gaps
//   4. teacher days
//   5. class gaps
//   6. how late the week runs (the sum of the hour indices taught)
//   7. cells that differ from the hint week, when there is one; then it is
//      compared third, right after the rules (`HINTED`)
//
// Only the blocks the run itself put down move: a pinned cell, a kept one and
// anything on an excluded row or day stays where it is (`fixed`).
//
// A step must also leave every touched lesson's blocks READING the same off
// the grid (`placedBlocks`, pitfall 75): the grid keeps no block boundaries,
// so two cards of one lesson put side by side could otherwise be read back as
// one longer card and the pool would start owing the wrong ones.

import {
  blocker,
  gapRuleActive,
  lessonLimit,
  limitFor,
  occupy,
  placedBlocks,
  ruleActive,
  ruleLevel,
  vacate,
  type Index,
} from '../constraints';
import { blockPlan, closedKey, type Id, type State } from '../../leaf/model';

export interface ImproveInput {
  /** The state the search works on; it SHARES `placements`. */
  work: State;
  placements: Record<string, Id>;
  /** The index `occupy` and `vacate` keep in step with `placements`. */
  ix: Index;
  /** Cells that may not move: kept, pinned, excluded. */
  fixed: ReadonlySet<string>;
  /** The lessons whose blocks may move at all (the run's own lessons). */
  lessonIds: readonly Id[];
  isExcludedDay: (day: number) => boolean;
  seed: number;
  /** A week to stay close to (the last tier of the objective). */
  hint?: Record<string, Id> | undefined;
}

export interface Improver {
  /** Works for at most `sliceMs`. True once the pass is over. */
  step(sliceMs: number): boolean;
}

/**
 * The pass's budget, in candidates scored: a count, not a stopwatch, so a seed
 * gives the same week on any machine. MEASURED (WORKLOG 2026-11-16): about
 * 2.5 µs a candidate on the development machine. The father's week stalls
 * long before it (its full classes leave few steps), the sample school uses all
 * of it in ~0.6 s.
 */
const MAX_EVALUATIONS = 300_000;
/** How many steps per movable block at most. */
const STEPS_PER_BLOCK = 400;
/** How many steps in a row may pass without the week getting better. */
const STALL_PER_BLOCK = 8;
/** How often a step that only keeps the week as good is taken, out of one. */
const SIDEWAYS = 0.35;

const TIERS = 8;

/** A block the pass may move. */
interface Unit {
  li: number;
  day: number;
  hour: number;
  size: number;
}

/** One step: the units that move and where each of them goes. */
interface Step {
  units: Unit[];
  to: Array<{ day: number; hour: number }>;
  delta: Float64Array;
}

/** A small seeded generator: the same input has to give the same timetable. */
export function rng(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4_294_967_296;
  };
}

/** Negative when `a` is better than `b`. */
function compareIn(order: readonly number[], a: Float64Array, b: Float64Array): number {
  for (const i of order) {
    const d = a[i]! - b[i]!;
    if (d !== 0) return d;
  }
  return 0;
}

/** The tiers in the order they are compared. */
const PLAIN = [0, 1, 2, 3, 4, 5, 6, 7];
/**
 * With a hint the week laid out again after an edit is to look like the week
 * before it: staying close comes straight after the rules, and the gaps only
 * then. The week before was already through this pass, so little is lost.
 */
const HINTED = [0, 1, 7, 2, 3, 4, 5, 6];

function isZero(a: Float64Array): boolean {
  for (let i = 0; i < TIERS; i++) if (a[i] !== 0) return false;
  return true;
}

export function createImprover(input: ImproveInput): Improver {
  const { work, placements, ix, fixed, isExcludedDay } = input;
  const d = work;
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const cellCount = dayCount * hourCount;
  const random = rng(input.seed * 2_654_435_761 + 97);

  // ---- integer names --------------------------------------------------------
  const lessons = d.lessons;
  const lessonIndex = new Map<Id, number>();
  lessons.forEach((l, i) => lessonIndex.set(l.id, i));
  const classIndex = new Map<Id, number>();
  d.classes.forEach((c, i) => classIndex.set(c.id, i));
  const teacherIndex = new Map<Id, number>();
  d.teachers.forEach((t, i) => teacherIndex.set(t.id, i));

  const lessonClass = new Int32Array(lessons.length).fill(-1);
  const lessonTeacher = new Int32Array(lessons.length).fill(-1);
  lessons.forEach((l, i) => {
    lessonClass[i] = classIndex.get(l.classId) ?? -1;
    lessonTeacher[i] = teacherIndex.get(l.teacherId) ?? -1;
  });

  /** A cell nobody is on, and one held by something that is not a lesson here. */
  const EMPTY = -1;
  const OTHER = -2;
  const classCell = new Int32Array(d.classes.length * cellCount).fill(EMPTY);
  const teacherCell = new Int32Array(d.teachers.length * cellCount).fill(EMPTY);
  const hintCell = new Int32Array(d.classes.length * cellCount).fill(EMPTY);
  const fixedCell = new Uint8Array(d.classes.length * cellCount);

  const cut = (key: string): { classAt: number | undefined; cell: number } => {
    const sep = key.lastIndexOf('|');
    const prevSep = key.lastIndexOf('|', sep - 1);
    return {
      classAt: classIndex.get(key.slice(0, prevSep)),
      cell: Number(key.slice(prevSep + 1, sep)) * hourCount + Number(key.slice(sep + 1)),
    };
  };
  for (const key in placements) {
    const lessonId = placements[key];
    if (lessonId === undefined) continue;
    const { classAt, cell } = cut(key);
    if (classAt === undefined || !(cell >= 0 && cell < cellCount)) continue;
    const li = lessonIndex.get(lessonId);
    classCell[classAt * cellCount + cell] = li ?? OTHER;
    if (li === undefined) continue;
    const t = lessonTeacher[li]!;
    if (t >= 0) teacherCell[t * cellCount + cell] = li;
  }
  for (const key of fixed) {
    const { classAt, cell } = cut(key);
    if (classAt !== undefined && cell >= 0 && cell < cellCount) {
      fixedCell[classAt * cellCount + cell] = 1;
    }
  }
  if (input.hint !== undefined) {
    for (const key in input.hint) {
      const li = lessonIndex.get(input.hint[key]!);
      const { classAt, cell } = cut(key);
      if (li !== undefined && classAt !== undefined && cell >= 0 && cell < cellCount) {
        hintCell[classAt * cellCount + cell] = li;
      }
    }
  }
  const hinted = input.hint !== undefined;
  const order = hinted ? HINTED : PLAIN;
  const compare = (a: Float64Array, b: Float64Array): number => compareIn(order, a, b);

  // ---- the rules, resolved once -------------------------------------------
  type Level = 0 | 1 | 2; // off, warn (tier 1), block (tier 0)
  const level = (name: Parameters<typeof ruleLevel>[1]): Level => {
    const l = ruleLevel(d, name);
    return l === 'block' ? 2 : l === 'warn' ? 1 : 0;
  };
  const teacherRules = d.teachers.map((t) => ({
    maxDay: ruleActive(d, 'maxPerDay', limitFor(d, t, 'maxPerDay'))
      ? limitFor(d, t, 'maxPerDay')
      : 0,
    minDay: ruleActive(d, 'minPerDay', limitFor(d, t, 'minPerDay'))
      ? limitFor(d, t, 'minPerDay')
      : 0,
    maxRun: ruleActive(d, 'maxConsecutive', limitFor(d, t, 'maxConsecutive'))
      ? limitFor(d, t, 'maxConsecutive')
      : 0,
  }));
  const maxDayLevel = level('maxPerDay');
  const minDayLevel = level('minPerDay');
  const maxRunLevel = level('maxConsecutive');
  const sameLevel = level('maxSameLessonPerDay');
  const teacherGapLimit = gapRuleActive(d, 'maxGapsTeacher')
    ? d.settings.limits.maxGapsTeacher
    : -1;
  const teacherGapLevel = level('maxGapsTeacher');
  const classGapLimit = gapRuleActive(d, 'maxGapsClass') ? d.settings.limits.maxGapsClass : -1;
  const classGapLevel = level('maxGapsClass');
  const sameLimit = lessons.map((l) => {
    const limit = lessonLimit(d, l);
    return ruleActive(d, 'maxSameLessonPerDay', limit) ? limit : 0;
  });
  /** The longest card of each lesson: more of it than that on one day is stacking. */
  const longest = lessons.map((l) => Math.max(1, ...blockPlan(l)));

  const breach = (out: Float64Array, lvl: Level, sign: number) => {
    if (lvl === 2) out[0] = out[0]! + sign;
    else if (lvl === 1) out[1] = out[1]! + sign;
  };

  /** One teacher's day, added into `out` times `sign`. */
  function teacherDay(out: Float64Array, t: number, day: number, sign: number): void {
    const row = t * cellCount + day * hourCount;
    let n = 0;
    let first = -1;
    let last = -1;
    let run = 0;
    let best = 0;
    for (let h = 0; h < hourCount; h++) {
      if (teacherCell[row + h] !== EMPTY) {
        n++;
        if (first < 0) first = h;
        last = h;
        run++;
        if (run > best) best = run;
      } else run = 0;
    }
    if (n === 0) return;
    const gaps = last - first + 1 - n;
    const r = teacherRules[t]!;
    if (r.maxDay > 0 && n > r.maxDay) breach(out, maxDayLevel, sign);
    if (r.minDay > 0 && n < r.minDay) breach(out, minDayLevel, sign);
    if (r.maxRun > 0 && best > r.maxRun) breach(out, maxRunLevel, sign);
    if (teacherGapLimit >= 0 && gaps > teacherGapLimit) breach(out, teacherGapLevel, sign);
    out[3] = out[3]! + sign * gaps;
    out[4] = out[4]! + sign;
  }

  /** One class's day. */
  function classDay(out: Float64Array, c: number, day: number, sign: number): void {
    const row = c * cellCount + day * hourCount;
    let n = 0;
    let first = -1;
    let last = -1;
    let late = 0;
    let off = 0;
    for (let h = 0; h < hourCount; h++) {
      const at = classCell[row + h]!;
      if (at !== EMPTY) {
        n++;
        if (first < 0) first = h;
        last = h;
        late += h;
      }
      if (hinted && at !== hintCell[row + h]) off++;
    }
    out[7] = out[7]! + sign * off;
    if (n === 0) return;
    const gaps = last - first + 1 - n;
    if (classGapLimit >= 0 && gaps > classGapLimit) breach(out, classGapLevel, sign);
    out[5] = out[5]! + sign * gaps;
    out[6] = out[6]! + sign * late;
  }

  /** One lesson's day: the same-lesson rule and stacking. */
  function lessonDay(out: Float64Array, li: number, day: number, sign: number): void {
    const c = lessonClass[li]!;
    const row = c * cellCount + day * hourCount;
    let n = 0;
    for (let h = 0; h < hourCount; h++) if (classCell[row + h] === li) n++;
    if (n === 0) return;
    const limit = sameLimit[li]!;
    if (limit > 0 && n > limit) breach(out, sameLevel, sign);
    const over = n - longest[li]!;
    if (over > 0) out[2] = out[2]! + sign * over;
  }

  // ---- the movable blocks --------------------------------------------------
  const movable = input.lessonIds
    .map((id) => lessonIndex.get(id))
    .filter(
      (li): li is number => li !== undefined && lessonClass[li]! >= 0 && lessonTeacher[li]! >= 0,
    );
  const unitsOf = new Map<number, Unit[]>();
  /** Class cell -> the movable unit on it. */
  const unitAt: Array<Unit | null> = new Array<Unit | null>(d.classes.length * cellCount).fill(
    null,
  );

  /** Reads one lesson's blocks off the grid, the way everybody else does. */
  function readUnits(li: number): void {
    const c = lessonClass[li]!;
    for (const old of unitsOf.get(li) ?? []) {
      for (let i = 0; i < old.size; i++) {
        const at = c * cellCount + old.day * hourCount + old.hour + i;
        if (unitAt[at] === old) unitAt[at] = null;
      }
    }
    const list: Unit[] = [];
    for (const b of placedBlocks(work, lessons[li]!)) {
      if (isExcludedDay(b.day)) continue;
      let pinned = false;
      for (let i = 0; i < b.size; i++) {
        if (fixedCell[c * cellCount + b.day * hourCount + b.hour + i] === 1) pinned = true;
      }
      if (pinned) continue;
      const unit: Unit = { li, day: b.day, hour: b.hour, size: b.size };
      list.push(unit);
      for (let i = 0; i < b.size; i++)
        unitAt[c * cellCount + b.day * hourCount + b.hour + i] = unit;
    }
    unitsOf.set(li, list);
  }
  for (const li of movable) readUnits(li);
  const withUnits = () => movable.filter((li) => (unitsOf.get(li)?.length ?? 0) > 0);
  let pool = withUnits();
  const totalUnits = pool.reduce((s, li) => s + unitsOf.get(li)!.length, 0);

  /** The size-signature of a lesson's reading, to see that a step kept it. */
  const signature = (li: number): string =>
    placedBlocks(work, lessons[li]!)
      .map((b) => b.size)
      .sort((a, b) => a - b)
      .join(',');

  /**
   * lesson -> cell -> 1 where none of its hours can ever be: closed for the
   * class, the teacher or the room, or an excluded day. Built on demand.
   */
  const closedFor = new Map<number, Uint8Array>();
  function closed(li: number): Uint8Array {
    let out = closedFor.get(li);
    if (out !== undefined) return out;
    out = new Uint8Array(cellCount);
    const l = lessons[li]!;
    const roomId = ix.classById.get(l.classId)?.roomId ?? null;
    for (let cell = 0; cell < cellCount; cell++) {
      const day = Math.floor(cell / hourCount);
      const hour = cell % hourCount;
      if (
        isExcludedDay(day) ||
        d.unavailable[closedKey(l.classId, day, hour)] !== undefined ||
        d.unavailable[closedKey(l.teacherId, day, hour)] !== undefined ||
        (roomId != null && d.unavailable[closedKey(roomId, day, hour)] !== undefined)
      ) {
        out[cell] = 1;
      }
    }
    closedFor.set(li, out);
    return out;
  }

  // ---- trying a step on the arrays -------------------------------------------
  /** Candidates scored so far: the pass's clock, the same on every machine. */
  let evaluations = 0;
  const scratch = new Float64Array(TIERS);
  const affectedT: number[] = [];
  const affectedC: number[] = [];
  const affectedL: number[] = [];
  const affectedD: number[] = [];
  const addOnce = (list: number[], x: number) => {
    if (!list.includes(x)) list.push(x);
  };

  function local(out: Float64Array, sign: number): void {
    for (const day of affectedD) {
      for (const t of affectedT) teacherDay(out, t, day, sign);
      for (const c of affectedC) classDay(out, c, day, sign);
      for (const li of affectedL) lessonDay(out, li, day, sign);
    }
  }

  function write(unit: Unit, day: number, hour: number, value: number): void {
    const c = lessonClass[unit.li]!;
    const t = lessonTeacher[unit.li]!;
    for (let i = 0; i < unit.size; i++) {
      const cell = day * hourCount + hour + i;
      classCell[c * cellCount + cell] = value;
      teacherCell[t * cellCount + cell] = value;
    }
  }

  /** The objective's change if `units` went to `to`, or null if they cannot all fit. */
  function evaluate(units: Unit[], to: Array<{ day: number; hour: number }>): Float64Array | null {
    evaluations++;
    affectedT.length = 0;
    affectedC.length = 0;
    affectedL.length = 0;
    affectedD.length = 0;
    for (let k = 0; k < units.length; k++) {
      const u = units[k]!;
      addOnce(affectedT, lessonTeacher[u.li]!);
      addOnce(affectedC, lessonClass[u.li]!);
      addOnce(affectedL, u.li);
      addOnce(affectedD, u.day);
      addOnce(affectedD, to[k]!.day);
    }
    scratch.fill(0);
    local(scratch, -1);
    for (const u of units) write(u, u.day, u.hour, EMPTY);
    let fits = true;
    let written = 0;
    for (; written < units.length; written++) {
      const u = units[written]!;
      const { day, hour } = to[written]!;
      const c = lessonClass[u.li]!;
      const t = lessonTeacher[u.li]!;
      for (let i = 0; i < u.size && fits; i++) {
        const cell = day * hourCount + hour + i;
        if (classCell[c * cellCount + cell] !== EMPTY) fits = false;
        if (teacherCell[t * cellCount + cell] !== EMPTY) fits = false;
      }
      if (!fits) break;
      write(u, day, hour, u.li);
    }
    if (fits) local(scratch, +1);
    // Back as it was, whatever happened: the new places emptied, then the old
    // ones written again (a swap's new place is the other block's old one).
    for (let j = written - 1; j >= 0; j--) write(units[j]!, to[j]!.day, to[j]!.hour, EMPTY);
    for (const u of units) write(u, u.day, u.hour, u.li);
    return fits ? Float64Array.from(scratch) : null;
  }

  // ---- making a step real ---------------------------------------------------
  function roomOf(li: number): Id | null {
    return ix.classById.get(lessons[li]!.classId)?.roomId ?? null;
  }

  /** Puts the step down through blocker() and occupy(). False = refused, nothing changed. */
  function commit(s: Step): boolean {
    const before = s.units.map((u) => signature(u.li));
    for (const u of s.units) {
      vacate(placements, ix, lessons[u.li]!, roomOf(u.li), u.day, u.hour, u.size);
    }
    let k = 0;
    let ok = true;
    for (; k < s.units.length; k++) {
      const u = s.units[k]!;
      const { day, hour } = s.to[k]!;
      if (blocker(work, ix, lessons[u.li]!.id, day, hour, u.size) !== null) {
        ok = false;
        break;
      }
      occupy(placements, ix, lessons[u.li]!, roomOf(u.li), day, hour, u.size);
    }
    if (ok) ok = s.units.every((u, i) => signature(u.li) === before[i]);
    if (!ok) {
      const done = Math.min(k, s.units.length);
      for (let j = done - 1; j >= 0; j--) {
        const u = s.units[j]!;
        vacate(placements, ix, lessons[u.li]!, roomOf(u.li), s.to[j]!.day, s.to[j]!.hour, u.size);
      }
      for (const u of s.units) {
        occupy(placements, ix, lessons[u.li]!, roomOf(u.li), u.day, u.hour, u.size);
      }
      return false;
    }
    for (const u of s.units) write(u, u.day, u.hour, EMPTY);
    s.units.forEach((u, i) => write(u, s.to[i]!.day, s.to[i]!.hour, u.li));
    const touched = new Set(s.units.map((u) => u.li));
    for (const li of touched) readUnits(li);
    return true;
  }

  // ---- one step ----------------------------------------------------------------
  function candidates(u: Unit): Step[] {
    const out: Step[] = [];
    const c = lessonClass[u.li]!;
    const t = lessonTeacher[u.li]!;
    const shut = closed(u.li);
    const self = (cell: number, li: number, row: Int32Array, base: number) => {
      const at = row[base + cell]!;
      if (at === EMPTY) return true;
      if (at !== li) return false;
      // Its own hours: free only where THIS block is.
      const day = Math.floor(cell / hourCount);
      const hour = cell % hourCount;
      return day === u.day && hour >= u.hour && hour < u.hour + u.size;
    };

    // 1. Into another window of the same length in the class: a move when the
    // window is empty, a swap when it holds blocks that lie wholly inside it
    // (one of the same length, two singles for a double, a single and a free
    // hour). Whatever is in the window takes the block's old place, in the
    // same order.
    const classRow = c * cellCount;
    for (let day = 0; day < dayCount; day++) {
      for (let hour = 0; hour + u.size <= hourCount; hour++) {
        if (day === u.day && hour === u.hour) continue;
        const overlaps = day === u.day && Math.abs(hour - u.hour) < u.size;
        let ok = true;
        const inside: Unit[] = [];
        for (let i = 0; i < u.size && ok; i++) {
          const cell = day * hourCount + hour + i;
          const busy = teacherCell[t * cellCount + cell]!;
          if (shut[cell] === 1) ok = false;
          // The teacher is free there, or busy only with what leaves the window.
          else if (
            !self(cell, u.li, teacherCell, t * cellCount) &&
            !(busy !== EMPTY && busy === classCell[classRow + cell])
          ) {
            ok = false;
          } else if (overlaps) ok = self(cell, u.li, classCell, classRow);
          else if (classCell[classRow + cell] !== EMPTY) {
            const v = unitAt[classRow + cell];
            if (v === null || v === undefined || v.li === u.li || v.day !== day) ok = false;
            else if (v.hour < hour || v.hour + v.size > hour + u.size) ok = false;
            else if (!inside.includes(v)) inside.push(v);
          }
        }
        if (!ok) continue;
        const units = [u, ...inside];
        const to = [{ day, hour }];
        for (const v of inside) {
          const at = { day: u.day, hour: u.hour + (v.hour - hour) };
          const shutV = closed(v.li);
          for (let i = 0; i < v.size && ok; i++) {
            if (shutV[at.day * hourCount + at.hour + i] === 1) ok = false;
          }
          to.push(at);
        }
        if (!ok) continue;
        const delta = evaluate(units, to);
        if (delta !== null) out.push({ units, to, delta });
      }
    }

    // 2. Swap with a block of the same length the same teacher gives another
    // class: the teacher's week stays, the two classes' weeks change.
    const others: Unit[] = [];
    for (const li of pool) {
      if (li === u.li) continue;
      if (lessonTeacher[li] !== t || lessonClass[li] === c) continue;
      for (const v of unitsOf.get(li) ?? []) if (v.size === u.size) others.push(v);
    }
    for (const v of others) {
      if (v.day === u.day && Math.abs(v.hour - u.hour) < u.size) continue;
      const toU = { day: v.day, hour: v.hour };
      const toV = { day: u.day, hour: u.hour };
      const shutV = closed(v.li);
      let open = true;
      for (let i = 0; i < u.size && open; i++) {
        if (shut[toU.day * hourCount + toU.hour + i] === 1) open = false;
        if (shutV[toV.day * hourCount + toV.hour + i] === 1) open = false;
      }
      if (!open) continue;
      const delta = evaluate([u, v], [toU, toV]);
      if (delta !== null) out.push({ units: [u, v], to: [toU, toV], delta });
    }
    return out;
  }

  let steps = 0;
  let sinceGain = 0;
  const maxSteps = Math.max(1, totalUnits) * STEPS_PER_BLOCK;
  const stall = Math.max(1, totalUnits) * STALL_PER_BLOCK;
  const ZERO = new Float64Array(TIERS);

  function once(): void {
    steps++;
    sinceGain++;
    const li = pool[Math.floor(random() * pool.length)]!;
    const list = unitsOf.get(li)!;
    const u = list[Math.floor(random() * list.length)]!;
    const all = candidates(u);
    const better = all.filter((s) => compare(s.delta, ZERO) < 0);
    better.sort((a, b) => compare(a.delta, b.delta));
    for (const s of better) {
      if (commit(s)) {
        sinceGain = 0;
        return;
      }
    }
    if (random() >= SIDEWAYS) return;
    const level = all.filter((s) => isZero(s.delta));
    // Two tries are enough: a refused sideways step costs a blocker() call and
    // gains nothing.
    for (let n = 0; n < 2 && level.length > 0; n++) {
      const at = Math.floor(random() * level.length);
      if (commit(level[at]!)) {
        return;
      }
      level.splice(at, 1);
    }
  }

  return {
    step(sliceMs: number): boolean {
      if (pool.length === 0) return true;
      const t0 = performance.now();
      while (steps < maxSteps && sinceGain < stall && evaluations < MAX_EVALUATIONS) {
        once();
        pool = withUnits();
        if (pool.length === 0) return true;
        if (performance.now() - t0 >= sliceMs) return false;
      }
      return true;
    },
  };
}
