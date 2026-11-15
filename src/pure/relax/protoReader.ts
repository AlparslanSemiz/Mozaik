// A small CpModelProto reader, for the tests only (cpsat.test.ts,
// cpModel.test.ts): the CP-SAT library is not on the test machines, so what
// the tests can hold the writers to is that the bytes they write read back as
// the constraints they mean. Nothing in the app imports this.

interface Field {
  field: number;
  value: number | Uint8Array;
}

export function fields(bytes: Uint8Array): Field[] {
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

export function packed(data: Uint8Array): number[] {
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

type Check = (x: ArrayLike<number>) => boolean;

/**
 * The model's variables (their domains) and constraints as predicates over a
 * full assignment: bool_or (3), at_most_one (26), exactly_one (29) and linear
 * (12), each under its enforcement literals (2).
 */
export function constraintsOf(model: Uint8Array): {
  vars: number;
  domains: Array<[number, number]>;
  checks: Check[];
} {
  const lit = (ref: number, x: ArrayLike<number>) => (ref >= 0 ? x[ref] === 1 : x[-ref - 1] === 0);
  const domains: Array<[number, number]> = [];
  const checks: Check[] = [];
  for (const f of fields(model)) {
    if (f.field === 2) {
      const d = fields(f.value as Uint8Array).find((g) => g.field === 2);
      const [lo, hi] = d === undefined ? [0, 0] : packed(d.value as Uint8Array);
      domains.push([lo!, hi!]);
    }
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
  return { vars: domains.length, domains, checks };
}
