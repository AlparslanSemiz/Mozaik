import { describe, expect, it } from 'vitest';
import { Sat, atMostOne, exactlyOne, neg, not, pos, totalizer } from './pure/sat';
import type { Lit } from './pure/sat';

/** A seeded generator, so a failing formula can be found again. */
function rng(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4_294_967_296;
  };
}

/** Is there an assignment of `vars` variables that satisfies every clause? */
function brute(vars: number, clauses: Lit[][], assumptions: Lit[] = []): boolean {
  const holds = (l: Lit, bits: number) => (((bits >> (l >> 1)) & 1) === 1) !== ((l & 1) === 1);
  for (let bits = 0; bits < 1 << vars; bits++) {
    if (!assumptions.every((l) => holds(l, bits))) continue;
    if (clauses.every((c) => c.some((l) => holds(l, bits)))) return true;
  }
  return false;
}

function randomClauses(random: () => number, vars: number, count: number): Lit[][] {
  const out: Lit[][] = [];
  for (let i = 0; i < count; i++) {
    const width = 1 + Math.floor(random() * 3.4);
    const c: Lit[] = [];
    for (let k = 0; k < width; k++) {
      const v = Math.floor(random() * vars);
      c.push(random() < 0.5 ? pos(v) : neg(v));
    }
    out.push(c);
  }
  return out;
}

describe('Sat', () => {
  it('bir model buluyor ve model bütün cümleleri tutuyor', () => {
    const sat = new Sat();
    const [a, b, c] = [sat.newVar(), sat.newVar(), sat.newVar()];
    sat.addClause([pos(a), pos(b)]);
    sat.addClause([neg(a), pos(c)]);
    sat.addClause([neg(b), neg(c)]);
    expect(sat.solve()).toBe('sat');
    const v = (x: number) => sat.value(pos(x));
    expect(v(a) || v(b)).toBe(true);
    expect(!v(a) || v(c)).toBe(true);
    expect(!v(b) || !v(c)).toBe(true);
  });

  it('güvercin yuvası: dört güvercin üç yuvaya sığmıyor', () => {
    const sat = new Sat();
    const x: number[][] = [];
    for (let p = 0; p < 4; p++) {
      x.push([sat.newVar(), sat.newVar(), sat.newVar()]);
      sat.addClause(x[p]!.map(pos));
    }
    for (let h = 0; h < 3; h++)
      atMostOne(
        sat,
        x.map((row) => pos(row[h]!)),
      );
    expect(sat.solve()).toBe('unsat');
  });

  // The solver is checked against every assignment, on a thousand small
  // formulas: units, binaries (their own propagation path) and longer clauses,
  // clauses added after a solve, and questions under assumptions.
  it('bin küçük formülde kaba kuvvetle aynı cevabı veriyor', () => {
    const random = rng(20260924);
    for (let round = 0; round < 1000; round++) {
      const vars = 2 + Math.floor(random() * 9);
      const sat = new Sat();
      for (let v = 0; v < vars; v++) sat.newVar();
      const clauses = randomClauses(random, vars, 1 + Math.floor(random() * vars * 4.5));
      for (const c of clauses) sat.addClause(c);
      const expected = brute(vars, clauses);
      expect(sat.solve(), `tur ${round}`).toBe(expected ? 'sat' : 'unsat');
      if (expected) {
        for (const c of clauses)
          expect(
            c.some((l) => sat.value(l)),
            `tur ${round}`,
          ).toBe(true);
      }

      const assumptions = randomClauses(random, vars, 2).map((c) => c[0]!);
      const underAssumptions = brute(vars, clauses, assumptions);
      expect(sat.solve(assumptions), `tur ${round}, varsayım`).toBe(
        underAssumptions ? 'sat' : 'unsat',
      );
      if (underAssumptions) for (const l of assumptions) expect(sat.value(l)).toBe(true);

      const more = randomClauses(random, vars, 3);
      for (const c of more) sat.addClause(c);
      const after = brute(vars, [...clauses, ...more]);
      expect(sat.solve(), `tur ${round}, sonradan eklenen`).toBe(after ? 'sat' : 'unsat');
    }
  });

  it('bir soru çözüldükten sonra dilimler hâlinde de sürüyor', () => {
    const sat = new Sat();
    const x: number[][] = [];
    for (let p = 0; p < 8; p++) {
      x.push(Array.from({ length: 7 }, () => sat.newVar()));
      sat.addClause(x[p]!.map(pos));
    }
    for (let h = 0; h < 7; h++)
      atMostOne(
        sat,
        x.map((row) => pos(row[h]!)),
      );
    sat.start();
    let status = sat.run(performance.now());
    let slices = 1;
    while (status === 'paused') {
      status = sat.run(performance.now() + 1);
      slices++;
    }
    expect(status).toBe('unsat');
    expect(slices).toBeGreaterThan(1);
  });
});

describe('kodlamalar', () => {
  function count(sat: Sat, lits: Lit[]): number {
    return lits.filter((l) => sat.value(l)).length;
  }

  it('exactlyOne tam bir tanesini seçtiriyor', () => {
    for (const n of [1, 2, 5, 6, 12]) {
      const sat = new Sat();
      const lits = Array.from({ length: n }, () => pos(sat.newVar()));
      exactlyOne(sat, lits);
      expect(sat.solve()).toBe('sat');
      expect(count(sat, lits)).toBe(1);
      // Forcing two true is impossible.
      if (n >= 2) expect(sat.solve([lits[0]!, lits[n - 1]!])).toBe('unsat');
    }
  });

  it('totalizer: çıkışı yasaklamak sayıyı sınırlıyor', () => {
    const random = rng(7);
    for (let round = 0; round < 200; round++) {
      const n = 1 + Math.floor(random() * 9);
      const cap = 1 + Math.floor(random() * (n + 1));
      const sat = new Sat();
      const lits = Array.from({ length: n }, () => pos(sat.newVar()));
      const out = totalizer(sat, lits, cap);
      const k = Math.floor(random() * out.length);
      // At least `want` true, at most k.
      const want = Math.floor(random() * (n + 1));
      const at = totalizer(sat, lits.map(not), n);
      const assumptions: Lit[] = [not(out[k]!)];
      if (n - want < at.length) assumptions.push(not(at[n - want]!));
      const expected = want <= k;
      expect(sat.solve(assumptions), `tur ${round}`).toBe(expected ? 'sat' : 'unsat');
      if (expected) {
        expect(count(sat, lits)).toBeLessThanOrEqual(k);
        expect(count(sat, lits)).toBeGreaterThanOrEqual(want);
      }
    }
  });

  it('totalizer tekrarlanan literali ağırlık sayıyor', () => {
    const sat = new Sat();
    const a = pos(sat.newVar());
    const b = pos(sat.newVar());
    // a weighs 2, b weighs 1; at most 2 in total.
    const out = totalizer(sat, [a, a, b], 3);
    expect(sat.solve([not(out[2]!), a, b])).toBe('unsat');
    expect(sat.solve([not(out[2]!), a])).toBe('sat');
    expect(sat.value(b)).toBe(false);
  });
});
