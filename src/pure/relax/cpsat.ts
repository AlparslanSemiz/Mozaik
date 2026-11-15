// The week for OR-Tools CP-SAT. A PURE module, tested in cpsat.test.ts.
//
// WHY. On the father's week CP-SAT proves the smallest change (4 teacher hours)
// in 7.9 s on 8 cores, where our own SAT search finds it in ~26 s and cannot
// prove it (DECISIONS 2026-11-15). The difference is linear reasoning: "at most
// one block per cell" and "at most k hours a day" are counts, and a clause
// solver can only see them as clauses.
//
// HOW. `model.ts` writes the week once into a `Formula` (sat.ts). This file is
// the second kind of formula: it records instead of solving, keeps "at most one"
// and the totalizer's counts as the constraints they are (`native`), and turns
// a question into a serialized `CpModelProto`. The exe hands those bytes to the
// CP-SAT library (src-tauri, `cpsat_coz`) and the answer comes back as a
// `CpSolverResponse`, which `load` reads so that `value()` -- the one thing
// `gridOf`, `costsOf` and the readers ask -- answers from it.
//
// NO DEPENDENCY. The handful of protobuf fields below are written and read by
// hand: a generated library would be the whole schema inside the single HTML
// file for six messages. Field numbers are from OR-Tools v9.15's
// cp_model.proto and sat_parameters.proto, the version the exe ships; a
// version bump re-reads them (they have not changed since v9.0).

import { type Formula, type Lit, type NativeForms, pos } from './sat';

// -------------------------------------------------------------- the writer

/** A protobuf message being written: tag, varint and length-delimited only. */
class Writer {
  private buf = new Uint8Array(256);
  private len = 0;

  private room(n: number): void {
    if (this.len + n <= this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < this.len + n) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buf.subarray(0, this.len));
    this.buf = next;
  }

  /** An unsigned or non-negative varint; a negative int is written as 64 bits, as protobuf does. */
  varint(value: number): void {
    this.room(10);
    if (value < 0) {
      let v = BigInt.asUintN(64, BigInt(value));
      while (v >= 0x80n) {
        this.buf[this.len++] = Number(v & 0x7fn) | 0x80;
        v >>= 7n;
      }
      this.buf[this.len++] = Number(v);
      return;
    }
    let v = value;
    while (v >= 0x80) {
      this.buf[this.len++] = (v % 0x80) | 0x80;
      v = Math.floor(v / 0x80);
    }
    this.buf[this.len++] = v;
  }

  tag(field: number, wire: 0 | 1 | 2): void {
    this.varint(field * 8 + wire);
  }

  bytes(field: number, data: Uint8Array): void {
    this.tag(field, 2);
    this.varint(data.length);
    this.room(data.length);
    this.buf.set(data, this.len);
    this.len += data.length;
  }

  /** A packed repeated varint field (int32 / int64 / enum). */
  packed(field: number, values: readonly number[]): void {
    if (values.length === 0) return;
    const inner = new Writer();
    for (const v of values) inner.varint(v);
    this.bytes(field, inner.done());
  }

  int(field: number, value: number): void {
    this.tag(field, 0);
    this.varint(value);
  }

  double(field: number, value: number): void {
    this.tag(field, 1);
    this.room(8);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.len, 8).setFloat64(0, value, true);
    this.len += 8;
  }

  done(): Uint8Array {
    return this.buf.slice(0, this.len);
  }
}

// ---------------------------------------------------------- the constraints

/** A literal as CP-SAT names it: the variable, or -variable-1 for its negation. */
const ref = (l: Lit): number => ((l & 1) === 1 ? -(l >> 1) - 1 : l >> 1);

/**
 * `sum of lits` as variables and coefficients over the positive variables, and
 * the constant the negated ones leave behind: not(x) is 1 - x. A literal listed
 * twice is a coefficient of two (the totalizer's weights).
 */
function linear(lits: readonly Lit[]): { vars: number[]; coeffs: number[]; constant: number } {
  const coef = new Map<number, number>();
  let constant = 0;
  for (const l of lits) {
    const v = l >> 1;
    if ((l & 1) === 1) {
      constant += 1;
      coef.set(v, (coef.get(v) ?? 0) - 1);
    } else {
      coef.set(v, (coef.get(v) ?? 0) + 1);
    }
  }
  const vars: number[] = [];
  const coeffs: number[] = [];
  for (const [v, c] of coef) {
    if (c === 0) continue;
    vars.push(v);
    coeffs.push(c);
  }
  return { vars, coeffs, constant };
}

/** Far below any sum this model writes, and still exact in a double. */
const LOW = -(2 ** 40);

/** `sum(lits) <= max`, when every literal in `when` holds. */
function atMostConstraint(
  lits: readonly Lit[],
  max: number,
  when: readonly Lit[] = [],
): Uint8Array {
  const { vars, coeffs, constant } = linear(lits);
  const lin = new Writer();
  lin.packed(1, vars);
  lin.packed(2, coeffs);
  lin.packed(3, [LOW, max - constant]);
  const c = new Writer();
  c.packed(2, when.map(ref));
  c.bytes(12, lin.done());
  return c.done();
}

/** A BoolArgumentProto constraint: bool_or (3), at_most_one (26), exactly_one (29). */
function boolConstraint(field: 3 | 26 | 29, lits: readonly Lit[]): Uint8Array {
  const arg = new Writer();
  arg.packed(1, lits.map(ref));
  const c = new Writer();
  c.bytes(field, arg.done());
  return c.done();
}

// ------------------------------------------------------------- the question

export interface CpQuestion {
  /** Minimise how many of these hold (a literal listed twice counts twice). */
  minimize?: readonly Lit[];
  /** Bounds that hold for this question only: at most `max` of `lits`. */
  atMost?: ReadonlyArray<{ lits: readonly Lit[]; max: number }>;
  /** Literals that must hold for this question only. */
  mustTrue?: readonly Lit[];
}

export interface CpParams {
  /** Search workers; CP-SAT's speed comes from several (8 on the measured machine). */
  workers: number;
  /** A ceiling, not a budget the answer depends on: optimal is optimal. */
  seconds: number;
  /**
   * How long CP-SAT may work on completing the hint into a whole week before
   * it searches on its own (`hint_conflict_limit`). Its default, 10, gives up
   * at once on this model, whose hint names only where blocks start.
   */
  hintConflicts?: number;
  /** Only these CP-SAT subsolvers (`subsolvers`); absent, its own portfolio. */
  subsolvers?: readonly string[];
}

/** CpSolverStatus, as the response carries it. */
export type CpStatus = 'unknown' | 'invalid' | 'feasible' | 'infeasible' | 'optimal';
const STATUS: readonly CpStatus[] = ['unknown', 'invalid', 'feasible', 'infeasible', 'optimal'];

export interface CpAnswer {
  status: CpStatus;
  /** One value per variable, when status is feasible or optimal. */
  solution: number[];
  objective: number;
}

type Recorded =
  | { kind: 'or' | 'amo' | 'eo'; lits: readonly Lit[] }
  | { kind: 'counter'; lits: readonly Lit[]; outs: readonly Lit[] };

/** A formula that records the week for CP-SAT instead of solving it. */
export class CpFormula implements Formula {
  private n = 0;
  private readonly recorded: Recorded[] = [];
  private readonly phase = new Map<number, number>();
  private solution: number[] = [];

  readonly native: NativeForms = {
    atMostOne: (lits) => {
      this.recorded.push({ kind: 'amo', lits: [...lits] });
    },
    exactlyOne: (lits) => {
      this.recorded.push({ kind: 'eo', lits: [...lits] });
    },
    counter: (lits, outs) => {
      this.recorded.push({ kind: 'counter', lits: [...lits], outs: [...outs] });
    },
  };

  get varCount(): number {
    return this.n;
  }

  newVar(): number {
    return this.n++;
  }

  addClause(input: readonly Lit[]): boolean {
    this.recorded.push({ kind: 'or', lits: [...input] });
    return true;
  }

  trueLit(): Lit {
    const v = this.newVar();
    this.addClause([pos(v)]);
    return pos(v);
  }

  /** Recorded as a solution hint: where the search should look first. */
  setPhase(v: number, value: boolean): void {
    this.phase.set(v, value ? 1 : 0);
  }

  value(l: Lit): boolean {
    const v = this.solution[l >> 1] ?? 0;
    return (l & 1) === 1 ? v === 0 : v === 1;
  }

  /** Takes an answer's values, so that `value()` reads that week. */
  load(answer: CpAnswer): void {
    this.solution = answer.solution;
    // The next question starts from this week, as `phaseFromModel` does for ours.
    answer.solution.forEach((x, v) => this.phase.set(v, x === 1 ? 1 : 0));
  }

  /**
   * The formula plus one question, as a serialized CpModelProto.
   *
   * The counters are written here rather than when they are made, because
   * only here is it known how each output is used, and two shapes are much
   * cheaper for CP-SAT than "not(out) => sum <= k - 1" for every k (MEASURED
   * 2026-11-15, the father's week). Both say exactly what the totalizer says:
   *   - an output the formula forces false IS the bound "sum <= k - 1", so it
   *     is written as that, unconditionally, and its unit clause is dropped;
   *   - an output nothing else mentions constrains nothing (it can always be
   *     true), so its row is not written at all.
   */
  request(q: CpQuestion): Uint8Array {
    const outs = new Set<number>();
    for (const r of this.recorded)
      if (r.kind === 'counter') for (const o of r.outs) outs.add(o >> 1);
    /** Counter outputs a unit clause forces false. */
    const forcedOff = new Set<Lit>();
    for (const r of this.recorded) {
      if (
        r.kind === 'or' &&
        r.lits.length === 1 &&
        (r.lits[0]! & 1) === 1 &&
        outs.has(r.lits[0]! >> 1)
      ) {
        forcedOff.add(r.lits[0]! ^ 1);
      }
    }
    const used = new Set<number>();
    const mark = (lits: readonly Lit[]) => {
      for (const l of lits) used.add(l >> 1);
    };
    for (const r of this.recorded) {
      if (r.kind === 'counter') mark(r.lits);
      else if (!(r.kind === 'or' && r.lits.length === 1 && forcedOff.has(r.lits[0]! ^ 1)))
        mark(r.lits);
    }
    mark(q.minimize ?? []);
    mark(q.mustTrue ?? []);
    for (const b of q.atMost ?? []) mark(b.lits);

    const w = new Writer();
    const variable = new Writer();
    variable.packed(2, [0, 1]);
    const boolVar = variable.done();
    for (let i = 0; i < this.n; i++) w.bytes(2, boolVar);
    for (const r of this.recorded) {
      switch (r.kind) {
        case 'or':
          if (r.lits.length === 1 && forcedOff.has(r.lits[0]! ^ 1)) break;
          w.bytes(3, boolConstraint(3, r.lits));
          break;
        case 'amo':
          w.bytes(3, boolConstraint(26, r.lits));
          break;
        case 'eo':
          w.bytes(3, boolConstraint(29, r.lits));
          break;
        case 'counter': {
          // outs[i] holds once i + 1 or more of lits do: not(out) => sum <= i.
          // A forced-off output makes every later one forced off too, so the
          // first such bound is the only one worth writing.
          let bounded = false;
          r.outs.forEach((out, i) => {
            if (bounded) return;
            if (forcedOff.has(out)) {
              w.bytes(3, atMostConstraint(r.lits, i));
              bounded = true;
            } else if (used.has(out >> 1)) {
              w.bytes(3, atMostConstraint(r.lits, i, [out ^ 1]));
            }
          });
          break;
        }
      }
    }
    for (const l of q.mustTrue ?? []) w.bytes(3, boolConstraint(3, [l]));
    for (const b of q.atMost ?? []) w.bytes(3, atMostConstraint(b.lits, b.max));
    if (q.minimize !== undefined && q.minimize.length > 0) {
      const { vars, coeffs, constant } = linear(q.minimize);
      const obj = new Writer();
      obj.packed(1, vars);
      if (constant !== 0) obj.double(2, constant);
      obj.packed(4, coeffs);
      w.bytes(4, obj.done());
    }
    if (this.phase.size > 0) {
      const hint = new Writer();
      hint.packed(1, [...this.phase.keys()]);
      hint.packed(2, [...this.phase.values()]);
      w.bytes(6, hint.done());
    }
    return w.done();
  }
}

/** SatParameters for a question. */
export function cpParams(p: CpParams): Uint8Array {
  const w = new Writer();
  w.double(36, p.seconds);
  w.int(206, Math.max(1, Math.round(p.workers)));
  if (p.hintConflicts !== undefined) w.int(153, p.hintConflicts);
  const utf8 = new TextEncoder();
  for (const name of p.subsolvers ?? []) w.bytes(207, utf8.encode(name));
  return w.done();
}

// --------------------------------------------------------------- the reader

/** Reads a serialized CpSolverResponse: status (1), solution (2), objective (3). */
export function readAnswer(bytes: Uint8Array): CpAnswer {
  let at = 0;
  const varint = (): number => {
    let result = 0n;
    let shift = 0n;
    for (;;) {
      const b = bytes[at++];
      if (b === undefined) throw new Error('CP-SAT cevabı yarım');
      result |= BigInt(b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7n;
    }
    return Number(BigInt.asIntN(64, result));
  };
  let status: CpStatus = 'unknown';
  const solution: number[] = [];
  let objective = 0;
  while (at < bytes.length) {
    const key = varint();
    const field = Math.floor(key / 8);
    const wire = key % 8;
    if (wire === 0) {
      const v = varint();
      if (field === 1) status = STATUS[v] ?? 'unknown';
      else if (field === 2) solution.push(v);
    } else if (wire === 1) {
      if (field === 3)
        objective = new DataView(bytes.buffer, bytes.byteOffset + at, 8).getFloat64(0, true);
      at += 8;
    } else if (wire === 2) {
      const len = varint();
      const end = at + len;
      if (field === 2) while (at < end) solution.push(varint());
      at = end;
    } else if (wire === 5) {
      at += 4;
    } else {
      throw new Error(`CP-SAT cevabında bilinmeyen alan türü ${wire}`);
    }
  }
  return { status, solution, objective };
}
