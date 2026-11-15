import { describe, expect, it, vi } from 'vitest';
import {
  type Id,
  type Refusal,
  type State,
  blockPlan,
  closedKey,
  placementKey,
} from '../../leaf/model';
import { addNotSameDay } from '../entities';
import { activePlacements, replaceActiveGrid } from '../grid';
import { solve } from '../solver';
import { makeWorld } from '../worlds';
import {
  type CpWeek,
  buildCpWeek,
  cpCostsOf,
  cpCount,
  cpEvaluate,
  cpGridOf,
  cpValuesOf,
  cpWeekRequest,
} from './cpModel';
import { buildModel, costsOf, countTrue, frameOf, gridOf, kindOf, refusalsOf } from './model';
import { DEFAULTS, type RelaxFamily, type RelaxOptions, type Suggestion } from './options';
import { constraintsOf } from './protoReader';
import { openedHours, raisedLimits, sameLimit, teacherLimit } from './reading';
import { type Lit, type Sat, not, totalizer } from './sat';
import { suggest } from './search';
import { verifySuggestion } from './verify';

// cpModel.ts is the constraints' third writing, next to model.ts and
// blocker(). CP-SAT is not on the test machines, so what is held here is the
// meaning, without a solver: on small random worlds, for weeks that are legal
// (our own search's), broken (moved, swapped, dropped hours) and random, the
// CP model accepts a week exactly when
//   - model.ts's formula, the week's starts assumed, is satisfiable, and
//   - verifySuggestion (blocker() and rules.ts) passes it with the family's
//     changes named, within what the family may change;
// and when it accepts, its two counts are model.ts's smallest counts for that
// week, and what the readers (openedHours, raisedLimits) say.

vi.setConfig({ testTimeout: 120_000 });

const FAMILIES: RelaxFamily[] = ['teacherHours', 'teacherDays', 'fewTeachers', 'rules'];

function rng(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4_294_967_296;
  };
}

interface Case {
  d: State;
  opts: RelaxOptions;
}

/** A small world with closed teacher hours, sometimes limits, a relation, a refusal, kept cells. */
function world(seed: number): Case {
  const r = rng(seed);
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const days = int(2, 3);
  const hours = int(3, 4);
  const teachers = Array.from({ length: int(2, 3) }, (_, i) => ({ id: `t${i}`, short: `T${i}` }));
  const classes = Array.from({ length: int(1, 2) }, (_, i) => ({
    id: `c${i}`,
    name: `C${i}`,
    roomId: i === 0 || r() < 0.5 ? 'rA' : null,
  }));
  const lessons = Array.from({ length: int(2, 5) }, (_, i) => ({
    id: `l${i}`,
    classId: classes[int(0, classes.length - 1)]!.id,
    teacherId: teachers[int(0, teachers.length - 1)]!.id,
    weeklyHours: int(1, 3),
    blockSize: int(1, 2),
  }));
  const unavailable: Record<string, 1> = {};
  for (const t of teachers)
    for (let g = 0; g < days; g++)
      for (let h = 0; h < hours; h++) if (r() < 0.3) unavailable[closedKey(t.id, g, h)] = 1;
  if (r() < 0.2) unavailable[closedKey(classes[0]!.id, int(0, days - 1), int(0, hours - 1))] = 1;
  let d = makeWorld({
    days,
    hours,
    rooms: [{ id: 'rA', name: 'A' }],
    teachers,
    classes,
    lessons,
    unavailable,
    limits: {
      maxPerDay: r() < 0.4 ? int(1, 3) : 0,
      maxConsecutive: r() < 0.3 ? int(1, 2) : 0,
      maxSameLessonPerDay: r() < 0.4 ? int(1, 2) : 0,
    },
  });
  if (r() < 0.3 && d.lessons.length > 1) d = addNotSameDay(d, d.lessons[0]!.id, d.lessons[1]!.id);
  const refused: Refusal[] = [];
  const t0 = teachers[0]!.id;
  const pick = r();
  if (pick < 0.1) refused.push({ kind: 'teacherDay', teacherId: t0, day: 0 });
  else if (pick < 0.2) refused.push({ kind: 'teacherHours', teacherId: t0, day: 0, hours: [0, 1] });
  else if (pick < 0.3)
    refused.push({ kind: 'teacherCap', teacherId: t0, day: int(0, days - 1), max: 1 });
  else if (pick < 0.35) refused.push({ kind: 'teacher', teacherId: t0 });
  else if (pick < 0.45) refused.push({ kind: 'lessonDayLimit', lessonId: 'l0' });
  else if (pick < 0.5) refused.push({ kind: 'teacherDayLimit', teacherId: t0 });
  // Now and then a laid-out part that stays where it is.
  const keepPlaced = r() < 0.3;
  if (keepPlaced) {
    const laid = { ...activePlacements(solve(d, { keepPlaced: false }).state) };
    for (const key of Object.keys(laid)) if (r() < 0.6) delete laid[key];
    d = replaceActiveGrid(d, { placements: laid });
  }
  return { d, opts: { ...DEFAULTS, keepPlaced, refused } };
}

/** Every block of every lesson somewhere in its class's row, nothing else checked. */
function randomWeek(
  c: Case,
  frame: ReturnType<typeof frameOf>,
  r: () => number,
): Record<string, Id> {
  const days = c.d.settings.days.length;
  const hours = c.d.settings.hours.length;
  const grid: Record<string, Id> = { ...frame.fixed };
  for (const lesson of frame.lessons) {
    const placed = Object.values(frame.fixed).filter((x) => x === lesson.id).length;
    if (placed > 0) continue;
    for (const size of blockPlan(lesson)) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const day = Math.floor(r() * days);
        const hour = Math.floor(r() * (hours - size + 1));
        const keys = Array.from({ length: size }, (_, k) =>
          placementKey(lesson.classId, day, hour + k),
        );
        if (keys.some((k) => grid[k] !== undefined)) continue;
        for (const k of keys) grid[k] = lesson.id;
        break;
      }
    }
  }
  return grid;
}

/** Broken versions of a week: a block moved, two cells swapped, an hour dropped. */
function broken(week: Record<string, Id>, c: Case, r: () => number): Array<Record<string, Id>> {
  const days = c.d.settings.days.length;
  const hours = c.d.settings.hours.length;
  const keys = Object.keys(week);
  if (keys.length === 0) return [];
  const pickKey = () => keys[Math.floor(r() * keys.length)]!;
  const out: Array<Record<string, Id>> = [];
  // An hour moved to an empty cell of its class.
  {
    const w = { ...week };
    const k = pickKey();
    const [classId] = k.split('|') as [Id];
    const id = w[k]!;
    delete w[k];
    const to = placementKey(classId, Math.floor(r() * days), Math.floor(r() * hours));
    if (w[to] === undefined) w[to] = id;
    out.push(w);
  }
  // Two cells of one class swapped.
  {
    const w = { ...week };
    const a = pickKey();
    const [classId] = a.split('|') as [Id];
    const b = placementKey(classId, Math.floor(r() * days), Math.floor(r() * hours));
    const x = w[a];
    const y = w[b];
    if (y === undefined) delete w[a];
    else w[a] = y;
    if (x === undefined) delete w[b];
    else w[b] = x;
    out.push(w);
  }
  // An hour dropped.
  {
    const w = { ...week };
    delete w[pickKey()];
    out.push(w);
  }
  return out;
}

/** The fewest of `lits` true under `assume`, and the bound that keeps it. */
function fewest(sat: Sat, assume: Lit[], lits: Lit[]): { n: number; keep: Lit[] } {
  if (sat.solve(assume) !== 'sat') throw new Error('unsat');
  if (lits.length === 0) return { n: 0, keep: assume };
  const out = totalizer(sat, lits, lits.length);
  let n = countTrue(sat, lits);
  while (n > 0 && sat.solve([...assume, not(out[n - 1]!)]) === 'sat') n = countTrue(sat, lits);
  return { n, keep: n < lits.length ? [...assume, not(out[n]!)] : assume };
}

/** model.ts's answer for a week: whether its starts are a model, and its two smallest counts. */
function modelTs(c: Case, which: RelaxFamily, w: CpWeek, values: number[] | null) {
  const frame = frameOf(c.d, c.opts);
  const m = buildModel(c.d, frame, kindOf(which), c.opts, {});
  if (values === null) return { ok: false as const };
  // The CP model's starts, handed to model.ts's slots of the same lesson and
  // length in order (orderAfter: the later slot starts later).
  const assume: Lit[] = [];
  for (const g of w.groups) {
    const starts = g.starts.filter((_, i) => values[g.vars[i]!] === 1).sort((a, b) => a - b);
    const slots = m.slots.filter((s) => s.lesson.id === g.lesson.id && s.size === g.size);
    if (slots.length !== starts.length) return { ok: false as const };
    slots.forEach((s, i) => {
      const at = s.starts.indexOf(starts[i]!);
      if (at < 0) assume.push(not(s.vars[0] ?? 0), s.vars[0] ?? 0);
      else assume.push(s.vars[at]!);
    });
  }
  if (m.sat.solve(assume) !== 'sat') return { ok: false as const };
  const [cost, cost2] = costsOf(which, m);
  const first = fewest(m.sat, assume, cost);
  const second = fewest(m.sat, first.keep, cost2);
  return { ok: true as const, cost: first.n, cost2: second.n, grid: gridOf(c.d, frame, m) };
}

/** verifySuggestion with the family's changes, and what the family may not change. */
function legal(c: Case, which: RelaxFamily, week: Record<string, Id>): boolean {
  const changes = which === 'rules' ? raisedLimits(c.d, week) : openedHours(c.d, week);
  const s: Suggestion = {
    family: which,
    changes,
    placements: week,
    size: 0,
    proven: false,
    relaid: false,
    accepted: [],
  };
  if (verifySuggestion(c.d, s, c.opts).length > 0) return false;
  const { refusedDays, refusedHours, refusedTeachers, caps, refusedLimits } = refusalsOf(c.opts);
  const perDay = new Map<string, number>();
  for (const ch of changes) {
    switch (ch.kind) {
      case 'teacherHour': {
        const day = `${ch.teacherId}|${ch.day}`;
        if (refusedTeachers.has(ch.teacherId) || refusedDays.has(day)) return false;
        if (refusedHours.has(closedKey(ch.teacherId, ch.day, ch.hour))) return false;
        perDay.set(day, (perDay.get(day) ?? 0) + 1);
        break;
      }
      case 'lessonDayLimit': {
        const lesson = c.d.lessons.find((x) => x.id === ch.lessonId)!;
        if (refusedLimits.has(`L|${ch.lessonId}`) || ch.limit - sameLimit(c.d, lesson) > 3)
          return false;
        break;
      }
      case 'teacherDayLimit':
        if (
          refusedLimits.has(`D|${ch.teacherId}`) ||
          ch.limit - teacherLimit(c.d, ch.teacherId, 'maxPerDay') > 3
        )
          return false;
        break;
      case 'teacherConsecutive':
        if (
          refusedLimits.has(`R|${ch.teacherId}`) ||
          ch.limit - teacherLimit(c.d, ch.teacherId, 'maxConsecutive') > 3
        )
          return false;
        break;
      default:
        return false;
    }
  }
  for (const [day, n] of perDay) if (n > (caps.get(day) ?? Infinity)) return false;
  return true;
}

/** The readers' counts for a legal week, as the panel would say them. */
function readersCount(c: Case, which: RelaxFamily, week: Record<string, Id>): number | null {
  if (which === 'teacherHours') return openedHours(c.d, week).length;
  if (which === 'rules') return raisedLimits(c.d, week).length;
  if (which === 'fewTeachers') {
    const ids = new Set(
      openedHours(c.d, week).flatMap((x) => (x.kind === 'teacherHour' ? [x.teacherId] : [])),
    );
    return ids.size;
  }
  return null;
}

/** Opened hours with neither neighbour the teacher's own open hour or another opened one. */
function apartIn(c: Case, week: Record<string, Id>): number {
  const hours = c.d.settings.hours.length;
  const opened = new Set(
    openedHours(c.d, week).flatMap((x) =>
      x.kind === 'teacherHour' ? [closedKey(x.teacherId, x.day, x.hour)] : [],
    ),
  );
  let n = 0;
  for (const ch of openedHours(c.d, week)) {
    if (ch.kind !== 'teacherHour') continue;
    const near = [ch.hour - 1, ch.hour + 1].filter((h) => h >= 0 && h < hours);
    const openNear = near.some(
      (h) => c.d.unavailable[closedKey(ch.teacherId, ch.day, h)] === undefined,
    );
    if (openNear) continue;
    if (near.some((h) => opened.has(closedKey(ch.teacherId, ch.day, h)))) continue;
    n++;
  }
  return n;
}

function stepsOver(c: Case, week: Record<string, Id>): number {
  let n = 0;
  for (const ch of raisedLimits(c.d, week)) {
    if (ch.kind === 'lessonDayLimit')
      n +=
        ch.limit -
        sameLimit(
          c.d,
          c.d.lessons.find((x) => x.id === ch.lessonId)!,
        );
    else if (ch.kind === 'teacherDayLimit')
      n += ch.limit - teacherLimit(c.d, ch.teacherId, 'maxPerDay');
    else if (ch.kind === 'teacherConsecutive')
      n += ch.limit - teacherLimit(c.d, ch.teacherId, 'maxConsecutive');
  }
  return n;
}

describe('CP-SAT modeli (cpModel.ts)', () => {
  it('rastgele dünyalarda ve bozulmuş haftalarda model.ts ve denetimle aynı haftayı kabul ediyor, maliyetleri aynı', () => {
    let accepted = 0;
    let refused = 0;
    let weeks = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const c = world(seed);
      const r = rng(seed * 7919);
      const frame = frameOf(c.d, c.opts);
      const stuck = solve(c.d, { keepPlaced: c.opts.keepPlaced });
      const pool: Array<Record<string, Id>> = [activePlacements(stuck.state)];
      for (const which of FAMILIES) {
        const found = suggest(c.d, activePlacements(stuck.state), {
          ...c.opts,
          families: [which],
          budgetMs: 20_000,
        });
        for (const s of found.suggestions) if (!s.relaid) pool.push(s.placements);
      }
      for (let i = 0; i < 3; i++) pool.push(randomWeek(c, frame, r));
      for (const w of [...pool]) pool.push(...broken(w, c, r));

      for (const which of FAMILIES) {
        const cw = buildCpWeek(c.d, frame, which, c.opts, pool[0]!);
        const [cost, cost2] = cpCostsOf(cw);
        for (const week of pool) {
          weeks++;
          const values = cpValuesOf(c.d, frame, cw, week);
          const cp = values !== null && cpEvaluate(cw, values).ok;
          const where = `tohum ${seed}, ${which}, hafta ${JSON.stringify(week)}`;
          const ts = modelTs(c, which, cw, values);
          expect(cp, `model.ts ile: ${where}`).toBe(ts.ok);
          expect(cp, `denetimle: ${where}`).toBe(legal(c, which, week));
          if (!cp || !ts.ok) {
            refused++;
            continue;
          }
          accepted++;
          expect(cpGridOf(c.d, frame, cw, values)).toEqual(week);
          expect(cpCount(cost, values), `1. maliyet: ${where}`).toBe(ts.cost);
          if (which === 'rules') {
            expect(cpCount(cost2, values), `2. maliyet: ${where}`).toBe(ts.cost2);
          } else {
            // model.ts ties an opened hour to the starts one way only (x → o),
            // so its smallest "side by side" count may open an hour the week
            // does not teach, between two lone ones: one opened, two fewer
            // apart. The week's own count is the readers'; model.ts's is never
            // above it.
            const opened = openedHours(c.d, week).length;
            const own = (which === 'fewTeachers' ? opened : 0) + apartIn(c, week);
            expect(cpCount(cost2, values), `2. maliyet: ${where}`).toBe(own);
            expect(ts.cost2).toBeLessThanOrEqual(own);
          }
          const read = readersCount(c, which, week);
          if (read !== null) expect(cpCount(cost, values), `okuyucu: ${where}`).toBe(read);
          if (which === 'rules')
            expect(cpCount(cost, values) + cpCount(cost2, values)).toBe(stepsOver(c, week));
          // The bytes say the same: the reader's predicates over the same values.
          const { domains, checks } = constraintsOf(cpWeekRequest(cw, {}));
          expect(domains).toEqual(cw.vars);
          expect(checks.every((ch) => ch(values))).toBe(true);
        }
      }
    }
    console.log(`[ölçüm] ${weeks} hafta-aile: ${accepted} kabul, ${refused} ret`);
    // Not a free green: both answers have to come up often.
    expect(accepted).toBeGreaterThan(100);
    expect(refused).toBeGreaterThan(100);
  });

  it('yazılan baytlar, reddedilen haftada da kaydın kendisiyle aynı cevabı veriyor', () => {
    let seen = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const c = world(seed);
      const r = rng(seed * 104_729);
      const frame = frameOf(c.d, c.opts);
      for (const which of FAMILIES) {
        const cw = buildCpWeek(c.d, frame, which, c.opts, {});
        const [cost] = cpCostsOf(cw);
        const { checks } = constraintsOf(
          cpWeekRequest(cw, { atMost: [{ terms: cost, max: 1 }], minimize: cost }),
        );
        for (let i = 0; i < 5; i++) {
          const values = cpValuesOf(c.d, frame, cw, randomWeek(c, frame, r));
          if (values === null) continue;
          seen++;
          const own = cpEvaluate(cw, values).ok && cpCount(cost, values) <= 1;
          expect(checks.every((ch) => ch(values))).toBe(own);
        }
      }
    }
    expect(seen).toBeGreaterThan(50);
  });

  it('hiçbir aile dışı kayıt yazmıyor: blok şekli için hata veriyor', () => {
    const c = world(3);
    expect(() => buildCpWeek(c.d, frameOf(c.d, c.opts), 'blockShape', c.opts, {})).toThrow();
  });
});
