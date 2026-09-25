// A small CDCL SAT solver. A PURE module, tested in sat.test.ts.
//
// Why the program carries its own: the suggestion search (relax.ts) has to say
// what the SMALLEST change is that makes a week buildable, and a local search
// cannot. MEASURED on the father's data (2026-09-24): the repair-based search
// found 12 closed teacher hours to open, an exact solver 4, and the week with
// only those 4 open is one the repair cannot even lay out in 30 seconds. A SAT
// encoding of the same question answered "no week with 0" in 0.44 s with
// MiniSat compiled to JavaScript. A dependency would be another file inside the
// single HTML and brought its own 64 MB memory ceiling; this is the same
// algorithm family, written against plain arrays.
//
// It runs in slices like the timetable solver: `run(deadline)` returns 'paused'
// and the next call carries on where it was. The suggestion search runs it in
// workers (platform/relaxPool.ts, TRAPS 136), and on the main thread when those
// cannot start.
//
// What it is: MiniSat's shape. Two watched literals, first-UIP learning with
// local minimisation, VSIDS with phase saving, Luby restarts, learnt clauses
// thinned by LBD, and assumptions for asking "and with the cost below k?"
// without committing to the answer.

/** A literal: variable × 2, plus 1 when negated. */
export type Lit = number;

export const pos = (v: number): Lit => v << 1;
export const neg = (v: number): Lit => (v << 1) | 1;
export const not = (l: Lit): Lit => l ^ 1;

export type SatStatus = 'sat' | 'unsat' | 'paused';

const VAR_DECAY = 0.95;
const CLAUSE_DECAY = 0.999;
const RESTART_BASE = 100;

function luby(i: number): number {
  // The Luby sequence 1 1 2 1 1 2 4 …, as MiniSat computes it.
  let size = 1;
  let seq = 0;
  while (size < i + 1) {
    seq++;
    size = 2 * size + 1;
  }
  let x = i;
  while (size - 1 !== x) {
    size = (size - 1) >> 1;
    seq--;
    x = x % size;
  }
  return 2 ** seq;
}

export class Sat {
  // ---- per variable, in typed arrays that double when full
  private cap = 0;
  private n = 0;
  /** Per LITERAL: 1 true, -1 false, 0 free. Reading a literal is one load. */
  private vals = new Int8Array(0);
  private levels = new Int32Array(0);
  private reasons = new Int32Array(0);
  private activity = new Float64Array(0);
  private phase = new Int8Array(0);
  private seen = new Uint8Array(0);
  private heapIndex = new Int32Array(0);
  private stamp = new Int32Array(0);
  private stampNow = 0;
  private heap: number[] = [];

  // ---- clauses
  private lits: Int32Array[] = [];
  private learnt: boolean[] = [];
  private cActivity: number[] = [];
  private lbd: number[] = [];
  private dead: boolean[] = [];
  /**
   * Two-literal clauses, which are most of an encoding like relax.ts's: per
   * literal, (the other literal, clause) pairs to imply when it turns false.
   * No clause memory is touched to propagate them.
   */
  private binary: number[][] = [];
  /** Longer clauses: per literal, (clause, blocker) pairs; a true blocker skips the clause. */
  private watches: number[][] = [];
  private learntCount = 0;
  private maxLearnt = 4000;

  // ---- search state
  private trail: number[] = [];
  private trailLim: number[] = [];
  private qhead = 0;
  private varInc = 1;
  private clauseInc = 1;
  private ok = true;
  private assumptions: Lit[] = [];
  private model = new Int8Array(0);
  private restarts = 0;
  private sinceRestart = 0;

  conflicts = 0;
  decisions = 0;

  get varCount(): number {
    return this.n;
  }

  private grow(): void {
    const cap = Math.max(1024, this.cap * 2);
    const copy = <T extends Int8Array | Int32Array | Float64Array | Uint8Array>(
      old: T,
      make: (size: number) => T,
      size: number,
    ): T => {
      const next = make(size);
      next.set(old);
      return next;
    };
    this.vals = copy(this.vals, (k) => new Int8Array(k), 2 * cap);
    this.levels = copy(this.levels, (k) => new Int32Array(k), cap);
    this.reasons = copy(this.reasons, (k) => new Int32Array(k), cap);
    this.activity = copy(this.activity, (k) => new Float64Array(k), cap);
    this.phase = copy(this.phase, (k) => new Int8Array(k), cap);
    this.seen = copy(this.seen, (k) => new Uint8Array(k), cap);
    this.heapIndex = copy(this.heapIndex, (k) => new Int32Array(k), cap);
    this.stamp = copy(this.stamp, (k) => new Int32Array(k), cap + 1);
    this.cap = cap;
  }

  newVar(): number {
    if (this.n === this.cap) this.grow();
    const v = this.n++;
    this.reasons[v] = -1;
    this.phase[v] = -1;
    this.heapIndex[v] = -1;
    this.binary.push([], []);
    this.watches.push([], []);
    this.heapInsert(v);
    return v;
  }

  /** A variable fixed to true, for inputs that are constants. */
  trueLit(): Lit {
    const v = this.newVar();
    this.addClause([pos(v)]);
    return pos(v);
  }

  /** Which way the search tries a variable first. */
  setPhase(v: number, value: boolean): void {
    this.phase[v] = value ? 1 : -1;
  }

  /**
   * Every variable of the last model found tries its value there first: the
   * next question starts from that answer, not from wherever the last failed
   * one left off. Variables made since keep their own phase.
   */
  phaseFromModel(): void {
    // Back to level 0 first: going back saves the trail's values as phases,
    // and would write over these at the next start().
    if (this.ok) this.cancelUntil(0);
    for (let v = 0; v < this.model.length; v++) this.phase[v] = this.model[v] === 1 ? 1 : -1;
  }

  /** The value in the last model found. */
  value(l: Lit): boolean {
    const v = this.model[l >> 1] ?? -1;
    return (l & 1) === 1 ? v === -1 : v === 1;
  }

  private level(): number {
    return this.trailLim.length;
  }

  /** Adds a clause, at level 0. False once the whole formula is unsatisfiable. */
  addClause(input: readonly Lit[]): boolean {
    if (!this.ok) return false;
    if (this.level() > 0) this.cancelUntil(0);
    const out: Lit[] = [];
    const sorted = [...input].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      const l = sorted[i]!;
      const value = this.vals[l]!;
      if (value === 1 || (i > 0 && l === not(sorted[i - 1]!))) return true;
      if (value === -1 || (i > 0 && l === sorted[i - 1])) continue;
      out.push(l);
    }
    if (out.length === 0) {
      this.ok = false;
      return false;
    }
    if (out.length === 1) {
      this.enqueue(out[0]!, -1);
      if (this.propagate() >= 0) this.ok = false;
      return this.ok;
    }
    this.attach(Int32Array.from(out), false);
    return true;
  }

  private attach(c: Int32Array, learnt: boolean): number {
    const id = this.lits.length;
    this.lits.push(c);
    this.learnt.push(learnt);
    this.cActivity.push(0);
    this.lbd.push(0);
    this.dead.push(false);
    const a = c[0]!;
    const b = c[1]!;
    if (c.length === 2) {
      this.binary[a]!.push(b, id);
      this.binary[b]!.push(a, id);
    } else {
      this.watches[a]!.push(id, b);
      this.watches[b]!.push(id, a);
      if (learnt) this.learntCount++;
    }
    return id;
  }

  private enqueue(l: Lit, reason: number): void {
    const v = l >> 1;
    this.vals[l] = 1;
    this.vals[l ^ 1] = -1;
    this.levels[v] = this.trailLim.length;
    this.reasons[v] = reason;
    this.trail.push(l);
  }

  /** Unit propagation. The conflicting clause, or -1. */
  private propagate(): number {
    const vals = this.vals;
    while (this.qhead < this.trail.length) {
      const falseLit = this.trail[this.qhead++]! ^ 1;

      const bs = this.binary[falseLit]!;
      for (let i = 0; i < bs.length; i += 2) {
        const other = bs[i]!;
        const value = vals[other];
        if (value === 1) continue;
        const id = bs[i + 1]!;
        if (value === -1) {
          this.qhead = this.trail.length;
          return id;
        }
        // The implied literal goes first: analyze() reads a reason that way.
        const c = this.lits[id]!;
        if (c[0] !== other) {
          c[1] = c[0]!;
          c[0] = other;
        }
        this.enqueue(other, id);
      }

      const ws = this.watches[falseLit]!;
      const n = ws.length;
      let i = 0;
      let j = 0;
      next: while (i < n) {
        const id = ws[i]!;
        const blocker = ws[i + 1]!;
        i += 2;
        if (vals[blocker] === 1) {
          ws[j++] = id;
          ws[j++] = blocker;
          continue;
        }
        if (this.dead[id] === true) continue;
        const c = this.lits[id]!;
        if (c[0] === falseLit) {
          c[0] = c[1]!;
          c[1] = falseLit;
        }
        const first = c[0]!;
        if (first !== blocker && vals[first] === 1) {
          ws[j++] = id;
          ws[j++] = first;
          continue;
        }
        for (let k = 2; k < c.length; k++) {
          const l = c[k]!;
          if (vals[l] !== -1) {
            c[1] = l;
            c[k] = falseLit;
            this.watches[l]!.push(id, first);
            continue next;
          }
        }
        ws[j++] = id;
        ws[j++] = first;
        if (vals[first] === -1) {
          while (i < n) ws[j++] = ws[i++]!;
          ws.length = j;
          this.qhead = this.trail.length;
          return id;
        }
        this.enqueue(first, id);
      }
      ws.length = j;
    }
    return -1;
  }

  private cancelUntil(target: number): void {
    if (this.level() <= target) return;
    const stop = this.trailLim[target]!;
    for (let i = this.trail.length - 1; i >= stop; i--) {
      const l = this.trail[i]!;
      const v = l >> 1;
      this.phase[v] = (l & 1) === 1 ? -1 : 1;
      this.vals[l] = 0;
      this.vals[l ^ 1] = 0;
      this.reasons[v] = -1;
      if (this.heapIndex[v] === -1) this.heapInsert(v);
    }
    this.trail.length = stop;
    this.trailLim.length = target;
    this.qhead = stop;
  }

  /** First-UIP learning: the learnt clause, asserting literal first. */
  private analyze(conflict: number): { clause: Lit[]; back: number } {
    const out: Lit[] = [0];
    let pathCount = 0;
    let p = -1;
    let index = this.trail.length - 1;
    let reason = conflict;
    const current = this.level();
    do {
      if (this.learnt[reason] === true) this.bumpClause(reason);
      const c = this.lits[reason]!;
      for (let k = p === -1 ? 0 : 1; k < c.length; k++) {
        const q = c[k]!;
        const v = q >> 1;
        if (this.seen[v] === 1 || this.levels[v] === 0) continue;
        this.bumpVar(v);
        this.seen[v] = 1;
        if (this.levels[v]! >= current) pathCount++;
        else out.push(q);
      }
      while (this.seen[this.trail[index]! >> 1] !== 1) index--;
      p = this.trail[index]!;
      reason = this.reasons[p >> 1]!;
      this.seen[p >> 1] = 0;
      pathCount--;
      index--;
    } while (pathCount > 0);
    out[0] = not(p);

    // Local minimisation: a literal implied by others already in the clause goes.
    const kept: Lit[] = [out[0]];
    for (let i = 1; i < out.length; i++) {
      const v = out[i]! >> 1;
      const r = this.reasons[v]!;
      let redundant = r >= 0;
      if (redundant) {
        const c = this.lits[r]!;
        for (let k = 1; k < c.length; k++) {
          const w = c[k]! >> 1;
          if (this.seen[w] !== 1 && this.levels[w] !== 0) {
            redundant = false;
            break;
          }
        }
      }
      if (!redundant) kept.push(out[i]!);
    }
    for (let i = 1; i < out.length; i++) this.seen[out[i]! >> 1] = 0;

    let back = 0;
    if (kept.length > 1) {
      let at = 1;
      for (let i = 2; i < kept.length; i++) {
        if (this.levels[kept[i]! >> 1]! > this.levels[kept[at]! >> 1]!) at = i;
      }
      const swap = kept[1]!;
      kept[1] = kept[at]!;
      kept[at] = swap;
      back = this.levels[kept[1] >> 1]!;
    }
    return { clause: kept, back };
  }

  /** How many decision levels a clause spans (its LBD). */
  private span(clause: readonly Lit[]): number {
    this.stampNow++;
    let n = 0;
    for (const l of clause) {
      const level = this.levels[l >> 1]!;
      if (this.stamp[level] !== this.stampNow) {
        this.stamp[level] = this.stampNow;
        n++;
      }
    }
    return n;
  }

  private bumpVar(v: number): void {
    this.activity[v]! += this.varInc;
    if (this.activity[v]! > 1e100) {
      for (let i = 0; i < this.n; i++) this.activity[i]! *= 1e-100;
      this.varInc *= 1e-100;
    }
    if (this.heapIndex[v]! >= 0) this.heapUp(this.heapIndex[v]!);
  }

  private bumpClause(id: number): void {
    this.cActivity[id]! += this.clauseInc;
    if (this.cActivity[id]! > 1e20) {
      for (let i = 0; i < this.cActivity.length; i++) this.cActivity[i]! *= 1e-20;
      this.clauseInc *= 1e-20;
    }
  }

  /** Drops the worse half of the long learnt clauses that no assignment rests on. */
  private reduce(): void {
    const candidates: number[] = [];
    for (let id = 0; id < this.lits.length; id++) {
      const c = this.lits[id]!;
      if (!this.learnt[id] || this.dead[id] === true || c.length <= 2 || this.lbd[id]! <= 2)
        continue;
      const v = c[0]! >> 1;
      if (this.reasons[v] === id && this.vals[c[0]!] !== 0) continue;
      candidates.push(id);
    }
    candidates.sort(
      (a, b) => this.lbd[b]! - this.lbd[a]! || this.cActivity[a]! - this.cActivity[b]!,
    );
    for (let i = 0; i < candidates.length / 2; i++) {
      const id = candidates[i]!;
      this.dead[id] = true;
      this.lits[id] = new Int32Array(0);
      this.learntCount--;
    }
    this.maxLearnt = Math.floor(this.maxLearnt * 1.1);
  }

  // ---- the activity heap
  private heapInsert(v: number): void {
    this.heapIndex[v] = this.heap.length;
    this.heap.push(v);
    this.heapUp(this.heap.length - 1);
  }
  private heapUp(i: number): void {
    const heap = this.heap;
    const v = heap[i]!;
    const act = this.activity[v]!;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      const p = heap[parent]!;
      if (act <= this.activity[p]!) break;
      heap[i] = p;
      this.heapIndex[p] = i;
      i = parent;
    }
    heap[i] = v;
    this.heapIndex[v] = i;
  }
  private heapPop(): number {
    const heap = this.heap;
    const top = heap[0]!;
    const last = heap.pop()!;
    this.heapIndex[top] = -1;
    if (heap.length > 0) {
      const act = this.activity[last]!;
      let i = 0;
      const n = heap.length;
      for (;;) {
        const l = 2 * i + 1;
        if (l >= n) break;
        const r = l + 1;
        const child = r < n && this.activity[heap[r]!]! > this.activity[heap[l]!]! ? r : l;
        if (this.activity[heap[child]!]! <= act) break;
        heap[i] = heap[child]!;
        this.heapIndex[heap[i]!] = i;
        i = child;
      }
      heap[i] = last;
      this.heapIndex[last] = i;
    }
    return top;
  }

  /**
   * Starts a new question under `assumptions`, literals that must hold for this
   * answer only. Learnt clauses stay: they follow from the clauses alone.
   */
  start(assumptions: readonly Lit[] = []): void {
    this.assumptions = [...assumptions];
    if (this.ok) this.cancelUntil(0);
    this.sinceRestart = 0;
  }

  /**
   * Searches until `deadline` (performance.now()), or until the conflict count
   * reaches `maxConflicts`. The second is how a caller keeps its answer the
   * same on every machine: a clock cuts a slow one short, a count does not.
   */
  run(deadline: number, maxConflicts = Infinity): SatStatus {
    if (!this.ok) return 'unsat';
    for (let step = 1; ; step++) {
      const conflict = this.propagate();
      if (conflict >= 0) {
        this.conflicts++;
        this.sinceRestart++;
        if (this.level() === 0) {
          this.ok = false;
          return 'unsat';
        }
        const { clause, back } = this.analyze(conflict);
        this.cancelUntil(back);
        if (clause.length === 1) {
          this.enqueue(clause[0]!, -1);
        } else {
          const lbd = this.span(clause);
          const id = this.attach(Int32Array.from(clause), true);
          this.lbd[id] = lbd;
          this.bumpClause(id);
          this.enqueue(clause[0]!, id);
        }
        this.varInc /= VAR_DECAY;
        this.clauseInc /= CLAUSE_DECAY;
        if (this.conflicts >= maxConflicts) return 'paused';
      } else {
        if (this.sinceRestart >= RESTART_BASE * luby(this.restarts)) {
          this.restarts++;
          this.sinceRestart = 0;
          this.cancelUntil(0);
          continue;
        }
        if (this.learntCount - this.trail.length >= this.maxLearnt) this.reduce();

        let next = -1;
        while (this.level() < this.assumptions.length) {
          const a = this.assumptions[this.level()]!;
          const value = this.vals[a];
          if (value === 1) {
            this.trailLim.push(this.trail.length);
          } else if (value === -1) {
            // An assumption is false given the others: no model under these.
            this.cancelUntil(0);
            return 'unsat';
          } else {
            next = a;
            break;
          }
        }
        if (next === -1) {
          while (this.heap.length > 0) {
            const v = this.heapPop();
            if (this.vals[pos(v)] === 0) {
              next = this.phase[v] === 1 ? pos(v) : neg(v);
              break;
            }
          }
          if (next === -1) {
            this.model = new Int8Array(this.n);
            for (let v = 0; v < this.n; v++) this.model[v] = this.vals[pos(v)]!;
            this.cancelUntil(0);
            return 'sat';
          }
        }
        this.decisions++;
        this.trailLim.push(this.trail.length);
        this.enqueue(next, -1);
      }
      if ((step & 255) === 0 && performance.now() >= deadline) return 'paused';
    }
  }

  /** Runs to the end. For tests. */
  solve(assumptions: readonly Lit[] = []): 'sat' | 'unsat' {
    this.start(assumptions);
    for (;;) {
      const status = this.run(Infinity);
      if (status !== 'paused') return status;
    }
  }
}

// --------------------------------------------------------------- encodings

/** At most one of `lits`: pairwise when few, the sequential counter otherwise. */
export function atMostOne(sat: Sat, lits: readonly Lit[]): void {
  if (lits.length <= 1) return;
  if (lits.length <= 5) {
    for (let i = 0; i < lits.length; i++) {
      for (let j = i + 1; j < lits.length; j++) sat.addClause([not(lits[i]!), not(lits[j]!)]);
    }
    return;
  }
  let prev = pos(sat.newVar());
  sat.addClause([not(lits[0]!), prev]);
  for (let i = 1; i < lits.length - 1; i++) {
    const s = pos(sat.newVar());
    sat.addClause([not(lits[i]!), s]);
    sat.addClause([not(prev), s]);
    sat.addClause([not(lits[i]!), not(prev)]);
    prev = s;
  }
  sat.addClause([not(lits[lits.length - 1]!), not(prev)]);
}

export function exactlyOne(sat: Sat, lits: readonly Lit[]): void {
  sat.addClause(lits);
  atMostOne(sat, lits);
}

/**
 * A totalizer: out[k] (k from 1) is forced true once at least k of `lits` are.
 * Only that direction, which is all an upper bound needs: forbidding out[k]
 * forbids k or more. Counts past `cap` all land on out[cap]. A literal may be
 * listed more than once, which is how a weight is written.
 */
export function totalizer(sat: Sat, lits: readonly Lit[], cap: number): Lit[] {
  if (lits.length === 0 || cap <= 0) return [];
  const build = (from: number, to: number): Lit[] => {
    if (to - from === 1) return [lits[from]!];
    const mid = (from + to) >> 1;
    const a = build(from, mid);
    const b = build(mid, to);
    const size = Math.min(a.length + b.length, cap);
    const out: Lit[] = [];
    for (let i = 0; i < size; i++) out.push(pos(sat.newVar()));
    for (let i = 0; i <= a.length; i++) {
      for (let j = 0; j <= b.length; j++) {
        if (i + j === 0) continue;
        const clause: Lit[] = [out[Math.min(i + j, size) - 1]!];
        if (i > 0) clause.push(not(a[i - 1]!));
        if (j > 0) clause.push(not(b[j - 1]!));
        sat.addClause(clause);
      }
    }
    return out;
  };
  return build(0, lits.length);
}
