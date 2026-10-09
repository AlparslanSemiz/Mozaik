// Fuzz: the readers that take a file or a paste from outside (test programı TP4).
//
// Example tests ask "does this file open". These ask the other question: what
// happens to the files nobody wrote on purpose — a backup cut short, a field
// edited by hand, a column pasted from the wrong sheet. The rule they hold the
// readers to is the one DENETIM DK11 paid for: a file is either refused, or it
// opens as a plan that is whole. Never half a plan, and never a crash.
//
// Inputs are real files broken at random: the schema fixtures and the
// anonymised full course, with fields deleted or replaced by any JSON value,
// and cut at any byte. The paste side gets rows of cells joined the three ways
// Excel and a hand-written list join them.
//
// Two answers are pinned as BİLİNEN KUSUR (TODO §8l): `readPlanFile` THROWS on
// some broken files (TB1) and nobody catches it, and a lesson's weekly hours
// are taken at any size (TB6, TB9). The properties below step around exactly
// those two, and the pinned cases go red by name when the readers are fixed.
//
// FUZZ_RUNS raises the run count (the nightly run); the default keeps the file
// to a few seconds. The "Tümünü dosyadan aç" reader (`parseBundle` and the
// `parseState` behind it) is deliberately not here yet: what it does with a
// half plan is TB8, a data-loss finding waiting for a decision.

import { readFileSync } from 'node:fs';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { readPlanFile } from './pure/parseState';
import { parseClasses, parseLessons, parseRooms, parseTeachers, splitGrid } from './pure/import';

const RUNS = Number(process.env['FUZZ_RUNS'] ?? 300);
// Each run of the full course clones a large tree: measured 1.6–2.0 s per
// property at 300 runs here (2026-10-09, dirty conditions), so the ceiling
// grows with the count instead of sitting on Vitest's 5 s.
const TIMEOUT = Math.max(30_000, RUNS * 20);

type Json = unknown;
type Path = Array<string | number>;

/** File and its share of the runs. The full course is a fifth: it is the real
    shape, but every run clones its tree, and at the full count it alone took
    most of the file's time and doubled `npm run hizli` (measured 2026-10-09,
    dirty conditions). The nightly count still reaches it in thousands. */
const SOURCES: Array<[string, number]> = [
  ['src/fixtures/v16.json', RUNS],
  ['src/fixtures/v8.json', RUNS],
  ['src/fixtures/tam-dolu-kurs-dizili.json', Math.ceil(RUNS / 5)],
];
const LISTS = ['rooms', 'teachers', 'classes', 'lessons'];

function load(file: string): Json {
  return JSON.parse(readFileSync(file, 'utf8')) as Json;
}

/** Every path in the tree, the root included. */
function paths(x: Json, at: Path = [], out: Path[] = []): Path[] {
  out.push(at);
  if (Array.isArray(x)) x.forEach((v, i) => paths(v, [...at, i], out));
  else if (x !== null && typeof x === 'object')
    for (const k of Object.keys(x)) paths((x as Record<string, Json>)[k], [...at, k], out);
  return out;
}

/** Deletes (value undefined) or replaces the node at `path`; a path the
    earlier edits removed is skipped, not an error. */
function edit(root: Json, path: Path, value: Json, remove: boolean): Json {
  if (path.length === 0) return remove ? undefined : value;
  if (root === null || typeof root !== 'object') return root;
  const copy = structuredClone(root);
  let node = copy as Record<string | number, Json>;
  for (const key of path.slice(0, -1)) {
    const next = node?.[key];
    if (next === null || typeof next !== 'object') return copy;
    node = next as Record<string | number, Json>;
  }
  const last = path[path.length - 1]!;
  if (remove) {
    if (Array.isArray(node)) node.splice(last as number, 1);
    else delete node[last];
  } else node[last] = value;
  return copy;
}

const anyJson = fc.oneof(
  fc.constant(null),
  fc.boolean(),
  fc.integer(),
  fc.double({ noNaN: true }),
  fc.string(),
  fc.constant([]),
  fc.constant({}),
);

/** Up to three random edits, each a deletion or a replacement. */
function broken(root: Json) {
  // The root itself is left out: a file that is not JSON at all is the cut
  // file's case below, and replacing the whole tree says nothing new.
  const all = paths(root).slice(1);
  const step = fc.record({
    path: fc.constantFrom(...all),
    value: anyJson,
    remove: fc.boolean(),
  });
  return fc.array(step, { minLength: 1, maxLength: 3 }).map((steps) => {
    let x = root;
    for (const s of steps) x = edit(x, s.path, s.value, s.remove);
    return x;
  });
}

/** What "a plan that is whole" means, short of the hour count (TB6). */
function wholeness(state: {
  teachers: Array<{ id: string }>;
  classes: Array<{ id: string }>;
  lessons: Array<{ id: string; classId: string; teacherId: string }>;
  programs: Array<{ id: string; placements: Record<string, string> }>;
  activeProgramId: string;
  settings: { days: unknown[]; hours: unknown[] };
}): string | null {
  const classes = new Set(state.classes.map((c) => c.id));
  const teachers = new Set(state.teachers.map((t) => t.id));
  const lessons = new Set(state.lessons.map((l) => l.id));
  for (const l of state.lessons) {
    if (!classes.has(l.classId)) return `ders ${l.id}: olmayan sınıf ${l.classId}`;
    if (!teachers.has(l.teacherId)) return `ders ${l.id}: olmayan öğretmen ${l.teacherId}`;
  }
  if (!state.programs.some((p) => p.id === state.activeProgramId)) return 'etkin program yok';
  for (const p of state.programs)
    for (const [cell, id] of Object.entries(p.placements))
      if (!lessons.has(id)) return `program ${p.id}, ${cell}: olmayan ders ${id}`;
  if (state.settings.days.length === 0) return 'hiç gün yok';
  if (state.settings.hours.length === 0) return 'hiç saat yok';
  return null;
}

describe('fuzz · "Dosyadan aç" (readPlanFile)', () => {
  for (const [file, runs] of SOURCES) {
    const root = load(file);

    it(
      `${file}: bozulan dosya ya reddediliyor ya bütün bir plan olarak açılıyor`,
      { timeout: TIMEOUT },
      () => {
        let opened = 0;
        let threw = 0;
        fc.assert(
          fc.property(broken(root), (x) => {
            let read;
            try {
              read = readPlanFile(JSON.stringify(x));
            } catch {
              threw++; // TB1, pinned below
              return;
            }
            if (!('state' in read)) return;
            opened++;
            expect(wholeness(read.state)).toBeNull();
          }),
          { numRuns: runs, seed: 20261009 },
        );
        // Zero opened files would be a free green: every assertion above sits
        // behind "it opened".
        expect(opened, `${threw} istisna`).toBeGreaterThan(runs / 2);
      },
    );

    it(`${file}: dört listeden biri hiç yoksa açılmıyor (DK11)`, { timeout: TIMEOUT }, () => {
      const missing = fc.subarray(LISTS, { minLength: 1 }).chain((gone) =>
        broken(root).map((x) => {
          let y = x;
          for (const field of gone) y = edit(y, [field], undefined, true);
          return y;
        }),
      );
      fc.assert(
        fc.property(missing, (x) => {
          let read;
          try {
            read = readPlanFile(JSON.stringify(x));
          } catch {
            return; // TB1
          }
          expect('state' in read, 'liste alanı eksik bir dosya plan olarak açıldı').toBe(false);
        }),
        { numRuns: runs, seed: 20261009 },
      );
    });

    it(`${file}: kesik dosya açılmıyor`, { timeout: TIMEOUT }, () => {
      const text = JSON.stringify(root, null, 2);
      fc.assert(
        fc.property(fc.integer({ min: 0, max: text.length - 2 }), (cut) => {
          const read = readPlanFile(text.slice(0, cut));
          expect('state' in read).toBe(false);
        }),
        { numRuns: runs, seed: 20261009 },
      );
    });
  }

  it('BİLİNEN KUSUR (TB1): bozuk bir ders satırı readPlanFile’ı düşürüyor', () => {
    const x = load('src/fixtures/v16.json') as { lessons: unknown[] };
    x.lessons[0] = null;
    // Fixed, this should come back as `{ problem: ... }`, or as a plan without
    // that lesson. Until then the throw reaches App.tsx's `fileChosen`, which
    // does not catch it: the plan stays, the user is told nothing.
    expect(() => readPlanFile(JSON.stringify(x))).toThrow(TypeError);
  });

  it('BİLİNEN KUSUR (TB6): haftalık saati eksi olan ders olduğu gibi açılıyor', () => {
    const x = load('src/fixtures/v16.json') as { lessons: Array<{ weeklyHours: number }> };
    x.lessons[0]!.weeklyHours = -5;
    const read = readPlanFile(JSON.stringify(x));
    expect('state' in read && read.state.lessons[0]!.weeklyHours).toBe(-5);
  });
});

// ------------------------------------------------------------------- paste

const cell = fc.oneof(
  fc.string(),
  fc.constantFrom('411', 'MÇ', 'Mehmet Çelik', 'İSAY', 'Matematik', 'Kadın', 'E', 'A', '', ' '),
  fc.integer({ min: -5, max: 60 }).map(String),
  fc.double({ min: -100, max: 100, noNaN: true }).map((n) => String(n).replace('.', ',')),
);
const paste = fc
  .record({
    rows: fc.array(fc.array(cell, { maxLength: 6 }), { maxLength: 12 }),
    sep: fc.constantFrom('\t', ';', ','),
    eol: fc.constantFrom('\n', '\r\n', '\r'),
    bom: fc.boolean(),
  })
  .map(({ rows, sep, eol, bom }) => (bom ? '﻿' : '') + rows.map((r) => r.join(sep)).join(eol));

describe('fuzz · Excel’den yapıştırma (import.ts)', () => {
  it('hiçbir okuyucu düşmüyor, ve alınan her satırın adı dolu', { timeout: TIMEOUT }, () => {
    fc.assert(
      fc.property(paste, (text) => {
        for (const read of [parseRooms, parseClasses]) {
          for (const row of read(text).accepted) expect(row.name.trim()).not.toBe('');
        }
        for (const row of parseTeachers(text).accepted) {
          expect(row.name.trim()).not.toBe('');
          expect(row.short).not.toBe('');
        }
      }),
      { numRuns: RUNS, seed: 20261009 },
    );
  });

  it(
    'alınan her dersin saati pozitif tam sayı ve blokları saate sığıyor',
    { timeout: TIMEOUT },
    () => {
      let skipped = 0;
      fc.assert(
        fc.property(paste, (text) => {
          // A cell that reads as a huge number is TB9 (pinned below): the block
          // list is built from it and the run would spend minutes filling it.
          // The first fuzz run found it on its own this way (hex and exponent
          // spellings that `Number` accepts).
          if (splitGrid(text).some((cells) => Number((cells[2] ?? '').replace(',', '.')) > 1000)) {
            skipped++;
            return;
          }
          for (const row of parseLessons(text).accepted) {
            expect(Number.isInteger(row.weeklyHours) && row.weeklyHours > 0).toBe(true);
            for (const b of row.blocks) expect(b === 2 || b === 3).toBe(true);
            expect(row.blocks.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(row.weeklyHours);
          }
        }),
        { numRuns: RUNS, seed: 20261009 },
      );
      expect(skipped, 'üreteç neredeyse hep dev sayı üretiyor').toBeLessThan(RUNS / 10);
    },
  );

  it('BİLİNEN KUSUR (TB9): yapıştırılan haftalık saatin üst sınırı yok', () => {
    // A week has at most days × hours slots; a hundred thousand hours is a typo,
    // and the block list is built from it (`Array(hours / block)`). At ten
    // million it is five million entries. Fixed, this row lands in `errors`.
    const read = parseLessons('411\tMÇ\t100000\t2');
    expect(read.accepted[0]?.weeklyHours).toBe(100000);
    expect(read.accepted[0]?.blocks).toHaveLength(50000);
  });
});
