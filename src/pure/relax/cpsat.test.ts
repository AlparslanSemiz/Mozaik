import { describe, expect, it } from 'vitest';
import { CpFormula, cpParams, readAnswer } from './cpsat';
import { type Formula, type Lit, Sat, atMostOne, exactlyOne, not, pos, totalizer } from './sat';

// The CP-SAT library is not on the test machines, so the claim tested here is
// the one this file can fail on its own: that the bytes it writes MEAN the
// same formula our solver gets as clauses. The test reads its own
// CpModelProto back with the small reader below and enumerates assignments.

function rng(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4_294_967_296;
  };
}

// ------------------------------------------------------- a protobuf reader

interface Field {
  field: number;
  value: number | Uint8Array;
}

function fields(bytes: Uint8Array): Field[] {
  let at = 0;
  const varint = (): number => {
    let result = 0n;
    let shift = 0n;
    for (;;) {
      const b = bytes[at++]!;
      result |= BigInt(b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7n;
    }
    return Number(BigInt.asIntN(64, result));
  };
  const out: Field[] = [];
  while (at < bytes.length) {
    const key = varint();
    const wire = key % 8;
    const field = Math.floor(key / 8);
    if (wire === 0) out.push({ field, value: varint() });
    else if (wire === 1) {
      out.push({ field, value: bytes.subarray(at, at + 8) });
      at += 8;
    } else if (wire === 2) {
      const len = varint();
      out.push({ field, value: bytes.subarray(at, at + len) });
      at += len;
    } else throw new Error(`wire ${wire}`);
  }
  return out;
}

function packed(data: Uint8Array): number[] {
  const vals: number[] = [];
  let at = 0;
  while (at < data.length) {
    let result = 0n;
    let shift = 0n;
    for (;;) {
      const b = data[at++]!;
      result |= BigInt(b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7n;
    }
    vals.push(Number(BigInt.asIntN(64, result)));
  }
  return vals;
}

type Check = (x: Int8Array) => boolean;

/** The model's constraints as predicates over a full assignment. */
function constraintsOf(model: Uint8Array): { vars: number; checks: Check[] } {
  const lit = (ref: number, x: Int8Array) => (ref >= 0 ? x[ref] === 1 : x[-ref - 1] === 0);
  let vars = 0;
  const checks: Check[] = [];
  for (const f of fields(model)) {
    if (f.field === 2) vars++;
    if (f.field !== 3) continue;
    let when: number[] = [];
    let check: Check | null = null;
    for (const g of fields(f.value as Uint8Array)) {
      if (g.field === 2) when = packed(g.value as Uint8Array);
      const args = () => {
        const inner = fields(g.value as Uint8Array).find((h) => h.field === 1);
        return inner === undefined ? [] : packed(inner.value as Uint8Array);
      };
      if (g.field === 3) {
        const ls = args();
        check = (x) => ls.some((r) => lit(r, x));
      } else if (g.field === 26) {
        const ls = args();
        check = (x) => ls.filter((r) => lit(r, x)).length <= 1;
      } else if (g.field === 29) {
        const ls = args();
        check = (x) => ls.filter((r) => lit(r, x)).length === 1;
      } else if (g.field === 12) {
        const parts = fields(g.value as Uint8Array);
        const get = (n: number) => {
          const p = parts.find((h) => h.field === n);
          return p === undefined ? [] : packed(p.value as Uint8Array);
        };
        const vs = get(1);
        const cs = get(2);
        const [lo, hi] = get(3);
        check = (x) => {
          let sum = 0;
          vs.forEach((v, i) => (sum += cs[i]! * x[v]!));
          return sum >= lo! && sum <= hi!;
        };
      }
    }
    const c = check!;
    const w = when;
    checks.push((x) => !w.every((r) => lit(r, x)) || c(x));
  }
  return { vars, checks };
}

// ----------------------------------------------------------- the property

/** Builds the same random formula into any Formula; returns the base variables. */
function build(f: Formula, seed: number, base: number): void {
  const random = rng(seed);
  for (let v = 0; v < base; v++) f.newVar();
  const lit = (): Lit => {
    const v = Math.floor(random() * base);
    return random() < 0.5 ? pos(v) : not(pos(v));
  };
  const some = (n: number) => Array.from({ length: n }, lit);
  for (let i = 0; i < 3; i++) f.addClause(some(1 + Math.floor(random() * 3)));
  atMostOne(f, some(2 + Math.floor(random() * 5)));
  if (random() < 0.5) exactlyOne(f, some(2 + Math.floor(random() * 3)));
  const counted = some(2 + Math.floor(random() * 4));
  const outs = totalizer(f, counted, 1 + Math.floor(random() * 3));
  if (outs.length > 0) {
    const k = Math.floor(random() * outs.length);
    // The two ways model.ts uses a counter: an output forbidden, or tied to a literal.
    if (random() < 0.5) f.addClause([not(outs[k]!)]);
    else f.addClause([not(outs[k]!), lit()]);
  }
}

describe('CP-SAT kaydı', () => {
  it('her rastgele formülde temel değişkenlerin her ataması iki yolda da aynı cevabı alıyor', () => {
    const base = 5;
    for (let seed = 1; seed <= 300; seed++) {
      const sat = new Sat();
      build(sat, seed, base);
      const cp = new CpFormula();
      build(cp, seed, base);
      const { vars, checks } = constraintsOf(cp.request({}));
      expect(vars).toBe(cp.varCount);

      for (let bits = 0; bits < 1 << base; bits++) {
        const fixed = Array.from({ length: base }, (_, v) =>
          ((bits >> v) & 1) === 1 ? pos(v) : not(pos(v)),
        );
        sat.start(fixed);
        const ours = sat.run(Infinity) === 'sat';
        // CP side: the base fixed, every auxiliary variable tried.
        const aux = vars - base;
        let theirs = false;
        const x = new Int8Array(vars);
        for (let v = 0; v < base; v++) x[v] = (bits >> v) & 1;
        for (let a = 0; a < 1 << aux && !theirs; a++) {
          for (let i = 0; i < aux; i++) x[base + i] = (a >> i) & 1;
          theirs = checks.every((c) => c(x));
        }
        expect(theirs, `tohum ${seed}, atama ${bits}`).toBe(ours);
      }
    }
  });

  it('en aza indirilecek sayı ve tek soruluk sınırlar modele giriyor', () => {
    const cp = new CpFormula();
    const a = pos(cp.newVar());
    const b = pos(cp.newVar());
    const bytes = cp.request({
      minimize: [a, not(b), a],
      atMost: [{ lits: [a, b], max: 1 }],
      mustTrue: [b],
    });
    const top = fields(bytes);
    const obj = top.find((f) => f.field === 4)!;
    const parts = fields(obj.value as Uint8Array);
    // 2a + (1 - b): variables a, b with coefficients 2, -1 and offset 1.
    expect(packed(parts.find((p) => p.field === 1)!.value as Uint8Array)).toEqual([0, 1]);
    expect(packed(parts.find((p) => p.field === 4)!.value as Uint8Array)).toEqual([2, -1]);
    const offset = parts.find((p) => p.field === 2)!.value as Uint8Array;
    expect(new DataView(offset.buffer, offset.byteOffset, 8).getFloat64(0, true)).toBe(1);
    const { checks } = constraintsOf(bytes);
    const ok = (av: number, bv: number) => checks.every((c) => c(Int8Array.from([av, bv])));
    expect([ok(0, 0), ok(0, 1), ok(1, 0), ok(1, 1)]).toEqual([false, true, false, false]);
  });

  it('cevabı okuyor ve formül o haftayı söylüyor', () => {
    // status OPTIMAL (4), solution [1, 0, 1] packed, objective 2.0
    const bytes = Uint8Array.from([
      0x08, 0x04, 0x12, 0x03, 0x01, 0x00, 0x01, 0x19, 0, 0, 0, 0, 0, 0, 0, 0x40,
    ]);
    const answer = readAnswer(bytes);
    expect(answer).toEqual({ status: 'optimal', solution: [1, 0, 1], objective: 2 });
    const cp = new CpFormula();
    for (let i = 0; i < 3; i++) cp.newVar();
    cp.load(answer);
    expect([cp.value(pos(0)), cp.value(not(pos(1))), cp.value(pos(1))]).toEqual([
      true,
      true,
      false,
    ]);
  });

  it('parametreler: işçi sayısı ve süre tavanı', () => {
    const top = fields(cpParams({ workers: 8, seconds: 30 }));
    expect(top.find((f) => f.field === 206)!.value).toBe(8);
    const t = top.find((f) => f.field === 36)!.value as Uint8Array;
    expect(new DataView(t.buffer, t.byteOffset, 8).getFloat64(0, true)).toBe(30);
  });
});
