import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  applyRelaxations,
  applySuggestion,
  createRelaxer,
  sameChanges,
  suggest,
  suggestionLines,
  suggestionSentence,
  verifySuggestion,
} from './pure/relax';
import type { RelaxFamily, RelaxOptions, Suggestion } from './pure/relax';
import { solve } from './pure/solver';
import { parseState } from './pure/parseState';
import { activePlacements, replaceActiveGrid } from './pure/programs';
import { buildIndex } from './pure/constraints';
import { findViolations } from './pure/rules';
import { parseKey } from './leaf/keys';
import { WORLDS, closeHours, illegalBlocks, makeWorld } from './worlds';
import type { State } from './leaf/types';

// TODO B5.9: when a week cannot be built, what would have to change. The rules
// every suggestion keeps, whatever the data:
//   - it never opens a class's or a room's closed hour (there is no change for
//     either), and the data it hands back has every such key the input had;
//   - it comes with a week, and that week is legal and whole for the CHANGED
//     data, asked of two auditors that do not share code (blocker() through
//     illegalBlocks, and rules.ts).

function kurs(): State {
  const raw = readFileSync(join(import.meta.dirname, 'fixtures', 'tam-dolu-kurs.json'), 'utf8');
  const state = parseState(raw);
  if (state === null) throw new Error('tam-dolu-kurs.json okunamadı');
  return state;
}

function world(name: string): State {
  const found = WORLDS.find((w) => w.name === name);
  if (found === undefined) throw new Error(name);
  return found.state;
}

/** The stuck run, then the suggestions for it. */
function stuckAndSuggest(d: State, families?: RelaxFamily[]) {
  const stuck = solve(d, { keepPlaced: false });
  expect(stuck.phase).toBe('stuck');
  return suggest(d, activePlacements(stuck.state), {
    keepPlaced: false,
    budgetMs: 600_000,
    ...(families === undefined ? {} : { families }),
  }).suggestions;
}

/**
 * The same, for the father's week: the search there runs for tens of seconds,
 * and a test that never gives the event loop back leaves Vitest's worker unable
 * to answer its own runner ("Timeout calling onTaskUpdate", 2026-09-25, when
 * the whole suite ran at once). So it goes in slices, yielding between them.
 */
async function stuckAndSuggestSliced(d: State, families: RelaxFamily[]) {
  const stuck = solve(d, { keepPlaced: false });
  expect(stuck.phase).toBe('stuck');
  const relaxer = createRelaxer(d, activePlacements(stuck.state), {
    keepPlaced: false,
    budgetMs: 600_000,
    families,
  });
  for (;;) {
    const result = relaxer.step(200);
    if (result !== null) return result.suggestions;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/** Every rule above, for one suggestion. */
function expectHonest(base: State, s: Suggestion) {
  expect(verifySuggestion(base, s, { keepPlaced: false })).toEqual([]);
  const applied = applySuggestion(base, s);

  const teachers = new Set(base.teachers.map((x) => x.id));
  for (const key of Object.keys(base.unavailable)) {
    const id = parseKey(key)?.id;
    if (id !== undefined && !teachers.has(id)) expect(applied.unavailable[key], key).toBe(1);
  }
  expect(illegalBlocks(applied)).toEqual([]);
  expect(
    findViolations(applied, buildIndex(applied)).filter(
      (v) =>
        v.level === 'block' &&
        ['maxPerDay', 'maxConsecutive', 'maxSameLessonPerDay'].includes(v.rule),
    ),
  ).toEqual([]);
  const ix = buildIndex(applied);
  for (const lesson of applied.lessons) {
    expect(ix.placedHours.get(lesson.id) ?? 0, lesson.id).toBe(lesson.weeklyHours);
  }
}

function byFamily(list: Suggestion[]): Map<RelaxFamily, Suggestion> {
  return new Map(list.map((s) => [s.family, s]));
}

describe('öneri — küçük dünyalar', () => {
  it('bütün haftası kapalı öğretmen: iki saati açmak yetiyor, ve azı yok', () => {
    const d = world('ogretmen-hafta-kapali');
    const found = byFamily(stuckAndSuggest(d));
    const hours = found.get('teacherHours');
    expect(hours?.changes).toHaveLength(2);
    expect(hours?.changes.every((c) => c.kind === 'teacherHour' && c.teacherId === 'oAV')).toBe(
      true,
    );
    expect(hours?.proven).toBe(true);
    for (const s of found.values()) expectHonest(d, s);
  });

  it('derslik darboğazı: derslik hiçbir yolda açılmıyor, saat azaltmak kalıyor', () => {
    const d = world('derslik-darbogazi');
    const found = byFamily(stuckAndSuggest(d));
    expect(found.has('teacherHours')).toBe(false);
    expect(found.has('rules')).toBe(false);
    const fewer = found.get('weeklyHours');
    // A room of 8 hours for 12 hours of lessons: 4 have to go, no fewer. That
    // "no fewer" is a pigeonhole argument, the one kind a SAT solver proves in
    // exponential time, so the size is asserted and the proof is not.
    expect(fewer?.size).toBe(4);
    for (const s of found.values()) expectHonest(d, s);
  });

  it('haftaya sığmayan ders: sınırı bir yükseltmek ya da üç saat azaltmak', () => {
    const d = world('imkansiz-ders-yaninda');
    const found = byFamily(stuckAndSuggest(d));
    expect(found.has('teacherHours')).toBe(false);
    // `days` rides along for the sentence ("aynı gün 2 saat"); the question
    // here is which limit and to what.
    expect(found.get('rules')?.changes).toHaveLength(1);
    expect(found.get('rules')?.changes).toMatchObject([
      { kind: 'lessonDayLimit', lessonId: 'x1', limit: 2 },
    ]);
    expect(found.get('rules')?.proven).toBe(true);
    expect(found.get('weeklyHours')?.size).toBe(3);
    for (const s of found.values()) expectHonest(d, s);
  });

  it('kurala sığmayan blok: yalnız kural', () => {
    const d = world('blok-kurala-sigmiyor');
    const found = byFamily(stuckAndSuggest(d));
    expect([...found.keys()]).toEqual(['rules']);
    // `days` rides along for the sentence ("aynı gün 2 saat"); the question
    // here is which limit and to what.
    expect(found.get('rules')?.changes).toHaveLength(1);
    expect(found.get('rules')?.changes).toMatchObject([
      { kind: 'lessonDayLimit', lessonId: 'x1', limit: 2 },
    ]);
    for (const s of found.values()) expectHonest(d, s);
  });

  it('sınıfın kapalı saati en ucuz çare olsa da önerilmiyor', () => {
    // One day of five hours. The class is closed at 3 and 4, the teacher at 1
    // and 5, and the lesson wants 2: only hour 2 is open for both. Teaching in
    // one of the class's closed hours would cost nothing, the teacher's cost
    // one, and only the second is on offer. The class keeps a spare hour on
    // purpose: a full class would forbid the closed hours a second way (every
    // open hour taught) and hide a model that forgot the first.
    const d = closeHours(
      closeHours(
        makeWorld({
          days: 1,
          hours: 5,
          lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
        }),
        's510',
        [
          [0, 2],
          [0, 3],
        ],
      ),
      'oMC',
      [
        [0, 0],
        [0, 4],
      ],
    );
    const found = byFamily(stuckAndSuggest(d));
    const opened = found.get('teacherHours')?.changes ?? [];
    expect(opened).toHaveLength(1);
    expect(opened[0]).toMatchObject({ kind: 'teacherHour', teacherId: 'oMC', day: 0 });
    for (const s of found.values()) expectHonest(d, s);
  });

  it('dizili dersler yerinde kalırken yol yoksa, sabitlenenler dışında yeniden diziyor', () => {
    // The father's file in miniature: two single hours laid out at 2 and 4, so
    // the 2-hour block has no two empty hours side by side, and no change of
    // any family moves a placed lesson. The second pass keeps only the pin.
    const world = makeWorld({
      days: 1,
      hours: 4,
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
        { id: 'x2', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 2 },
        { id: 'x3', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
      ],
    });
    const d = replaceActiveGrid(world, {
      placements: { 's510|0|1': 'x1', 's510|0|3': 'x3' },
      pinned: { 's510|0|1': 1 },
    });
    const stuck = solve(d, { keepPlaced: true });
    expect(stuck.phase).toBe('stuck');

    const [s, ...rest] = suggest(d, activePlacements(stuck.state), {
      keepPlaced: true,
      families: ['teacherHours'],
    }).suggestions;
    expect(rest).toEqual([]);
    expect(s?.relaid).toBe(true);
    expect(s?.changes).toEqual([]);
    expect(s?.placements['s510|0|1']).toBe('x1');
    expect(verifySuggestion(d, s!, { keepPlaced: false })).toEqual([]);
    // Not against the kept grid: it moved x3.
    expect(verifySuggestion(d, s!, { keepPlaced: true })).not.toEqual([]);
  });

  it('aynı girdi aynı öneriyi veriyor', () => {
    const d = world('imkansiz-ders-yaninda');
    expect(stuckAndSuggest(d)).toEqual(stuckAndSuggest(d));
  });
});

// The father's week (anonymised). CP-SAT, outside the repository, gives the
// smallest changes as 4 closed teacher hours, or 6 limit overrides worth 9
// hours, or one teacher's 6 hours (WORKLOG 2026-09-24); those are floors
// nothing can go under. The search reaches the hours on both hour ways and the
// 9 hours over on the rules, without proving them. The rules way's COUNT of
// limits is one over CP-SAT's (7 for 6): measured, and the price of stopping
// at a neighbourhood's local best rather than spending the whole budget.
describe('öneri — tam dolu bir kurs', () => {
  it('dört öğretmen saati, bir öğretmenin altı saati ya da 9 saatlik sınır; sınıf saatine dokunmadan', async () => {
    const d = kurs();
    const found = byFamily(
      await stuckAndSuggestSliced(d, ['teacherHours', 'fewTeachers', 'rules']),
    );

    const hours = found.get('teacherHours');
    expect(hours?.size).toBe(4);
    const one = found.get('fewTeachers');
    expect(new Set(one?.changes.map((c) => ('teacherId' in c ? c.teacherId : '')))).toHaveProperty(
      'size',
      1,
    );
    expect(one?.size).toBe(6);
    const rules = found.get('rules');
    expect(rules?.size).toBe(9);
    expect(rules?.changes.length).toBeGreaterThanOrEqual(6);
    expect(rules?.changes.length).toBeLessThanOrEqual(7);
    for (const s of found.values()) expectHonest(d, s);

    console.log(
      `[ölçüm] öneriler: ${[...found.values()].map((s) => `${s.family} ${s.size}${s.proven ? ' kanıtlı' : ''}: ${suggestionLines(d, s).join(', ')}`).join(' | ')}`,
    );
  }, 240_000);

  it('kurulabilen ama çözücünün dizemediği hafta: değişiklik gerekmeden kuruluyor', async () => {
    // Those four hours open. The week exists (it is the suggestion above), and
    // the solver's own repair stops short of it; the second search finds it.
    const d0 = kurs();
    const id = (short: string) => d0.teachers.find((x) => x.short === short)!.id;
    const unavailable = { ...d0.unavailable };
    for (const [t, h] of [
      ['Ö10', 11],
      ['Ö6', 0],
      ['Ö6', 1],
      ['Ö3', 4],
    ] as const) {
      delete unavailable[`${id(t)}|4|${h}`];
    }
    const d = { ...d0, unavailable };
    const found = await stuckAndSuggestSliced(d, ['teacherHours']);
    expect(found).toHaveLength(1);
    expect(found[0]!.changes).toEqual([]);
    expect(found[0]!.proven).toBe(true);
    expectHonest(d, found[0]!);
  }, 120_000);
});

// The father's own file, anonymised the same way and with his 330 hours laid
// out (`tam-dolu-kurs-dizili.json`): the week a keeping run cannot finish, so
// every way lays it out again. The case "Olmaz" is said in.
function dizili(): State {
  const raw = readFileSync(
    join(import.meta.dirname, 'fixtures', 'tam-dolu-kurs-dizili.json'),
    'utf8',
  );
  const state = parseState(raw);
  if (state === null) throw new Error('tam-dolu-kurs-dizili.json okunamadı');
  return state;
}

/** One search in slices, as the app runs it (see stuckAndSuggestSliced). */
async function sliced(d: State, hint: Record<string, string>, options: Partial<RelaxOptions>) {
  const relaxer = createRelaxer(d, hint, { budgetMs: 600_000, ...options });
  for (;;) {
    const result = relaxer.step(200);
    if (result !== null) return result.suggestions;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

describe('öneri — babanın dizili haftası ve "Olmaz"', () => {
  it("KY Cumartesi gelemezse en az saat 5, CP-SAT'ın en iyisi", async () => {
    // MEASURED (2026-09-25): refusing Ö6's (KY's) Saturday, the fewest-hours
    // way found 8 when it started over from the stuck week, 5 from its own
    // earlier week with the wider neighbourhoods. CP-SAT's best is 5.
    const d = dizili();
    const hint = activePlacements(d);
    const first = await sliced(d, hint, { keepPlaced: true, families: ['teacherHours'] });
    expect(first).toHaveLength(1);
    expect(first[0]!.relaid).toBe(true);
    expect(first[0]!.size).toBe(4);

    const ky = d.teachers.find((x) => x.short === 'Ö6')!.id;
    const again = await sliced(d, hint, {
      keepPlaced: true,
      families: ['teacherHours'],
      refused: [{ kind: 'teacherDay', teacherId: ky, day: 4 }],
      previous: first,
      startRelaid: true,
    });
    expect(again).toHaveLength(1);
    const s = again[0]!;
    expect(s.relaid).toBe(true);
    expect(
      s.changes.some((c) => c.kind === 'teacherHour' && c.teacherId === ky && c.day === 4),
    ).toBe(false);
    expect(s.size).toBe(5);
    expect(verifySuggestion(d, s, { keepPlaced: false })).toEqual([]);
  }, 240_000);
});

describe('öneri — yollar, cümleler ve "bu olmaz"', () => {
  it('reddedilen gün hiçbir yolda yok; iki gün de reddedilince saat açan yol kalmıyor', () => {
    const d = world('ogretmen-hafta-kapali');
    const stuck = solve(d, { keepPlaced: false });
    const ask = (extra: Partial<RelaxOptions>) =>
      suggest(d, activePlacements(stuck.state), { keepPlaced: false, ...extra }).suggestions;

    const first = byFamily(ask({})).get('teacherHours');
    const day = first?.changes[0]?.kind === 'teacherHour' ? first.changes[0].day : -1;
    expect(day).toBeGreaterThanOrEqual(0);

    const without = ask({ refused: [{ kind: 'teacherDay', teacherId: 'oAV', day }] });
    for (const s of without) {
      expectHonest(d, s);
      for (const c of s.changes) {
        if (c.kind === 'teacherHour') expect(c.day).not.toBe(day);
      }
    }
    expect(byFamily(without).get('teacherHours')?.size).toBe(2);

    const neither = ask({
      refused: [
        { kind: 'teacherDay', teacherId: 'oAV', day: 0 },
        { kind: 'teacherDay', teacherId: 'oAV', day: 1 },
      ],
    });
    expect(neither.some((s) => s.changes.some((c) => c.kind === 'teacherHour'))).toBe(false);
  });

  it('ders başka öğretmene yalnız aynı branştan verilir', () => {
    // One hour, two classes, both taught by MÇ: he cannot be in both. AV
    // teaches the same subject and is free; FZ is free and teaches another.
    const d = makeWorld({
      days: 1,
      hours: 1,
      teachers: [
        { id: 'oMC', short: 'MÇ' },
        { id: 'oAV', short: 'AV' },
        { id: 'oFZ', short: 'FZ', subject: 'Fizik' },
      ],
      classes: [
        { id: 's510', name: '510', roomId: null },
        { id: 's511', name: '511', roomId: null },
      ],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
        { id: 'x2', classId: 's511', teacherId: 'oMC', weeklyHours: 1 },
      ],
    });
    const found = byFamily(stuckAndSuggest(d, ['reassign']));
    const handed = found.get('reassign');
    expect(handed?.changes).toHaveLength(1);
    expect(handed?.changes[0]).toMatchObject({ kind: 'lessonTeacher', teacherId: 'oAV' });
    expectHonest(d, handed!);
    // The denetçi says no to a lesson handed to someone who does not hold its subject.
    const wrong = {
      ...handed!,
      changes: [{ kind: 'lessonTeacher' as const, lessonId: 'x1', teacherId: 'oFZ' }],
    };
    expect(applyRelaxations(d, wrong.changes).lessons.find((x) => x.id === 'x1')?.teacherId).toBe(
      'oMC',
    );
  });

  it('en az öğretmen: tek öğretmenin saatleri', () => {
    const d = world('ogretmen-hafta-kapali');
    const one = byFamily(stuckAndSuggest(d, ['fewTeachers'])).get('fewTeachers');
    expect(one?.changes.every((c) => c.kind === 'teacherHour' && c.teacherId === 'oAV')).toBe(true);
    expect(one?.size).toBe(2);
    expectHonest(d, one!);
  });

  it('cümle babanın diliyle: saatler, gün ve "de gelebilirse"', () => {
    const d = world('ogretmen-hafta-kapali');
    const s: Suggestion = {
      family: 'teacherHours',
      changes: [
        { kind: 'teacherHour', teacherId: 'oAV', day: 0, hour: 2 },
        { kind: 'teacherHour', teacherId: 'oAV', day: 0, hour: 3 },
      ],
      placements: {},
      size: 2,
      proven: false,
      relaid: false,
    };
    expect(suggestionSentence(d, s)).toMatch(
      /^AV .+ 3–4\. saatlere de gelebilirse hafta kuruluyor\.$/,
    );
    const one = { ...s, changes: [s.changes[0]!] };
    expect(suggestionSentence(d, one)).toMatch(
      /^AV .+ 3\. saate de gelebilirse hafta kuruluyor\.$/,
    );
  });

  it('aynı öğretmenden aynı gün aynı sayıda saat isteyen iki yol aynı satırdır', () => {
    const at = (hour: number) => ({ kind: 'teacherHour' as const, teacherId: 'oAV', day: 0, hour });
    const base = { placements: {}, size: 2, proven: false, relaid: false };
    const a: Suggestion = { ...base, family: 'teacherHours', changes: [at(0), at(1)] };
    const b: Suggestion = { ...base, family: 'fewTeachers', changes: [at(2), at(3)] };
    const c: Suggestion = { ...base, family: 'teacherDays', changes: [at(0)] };
    expect(sameChanges(a, b)).toBe(true);
    expect(sameChanges(a, c)).toBe(false);
  });
});

describe('öneri — veri ve denetçi', () => {
  it('sınıf kimliğiyle gelen bir "öğretmen saati" hiçbir şey açmıyor', () => {
    const d = world('ogretmen-hafta-kapali');
    const forged = applyRelaxations(d, [
      { kind: 'teacherHour', teacherId: 's510', day: 0, hour: 0 },
      { kind: 'teacherHour', teacherId: 'dA', day: 0, hour: 0 },
    ]);
    expect(forged.unavailable).toEqual(d.unavailable);
  });

  it('denetçi eksik haftayı ve sınıfın kapalı saatini yakalıyor', () => {
    const d = world('ogretmen-hafta-kapali');
    const [s] = stuckAndSuggest(d, ['teacherHours']);
    expect(s).toBeDefined();

    // A week with a block taken off is not whole.
    const cut = { ...s!.placements };
    delete cut[Object.keys(cut)[0]!];
    expect(verifySuggestion(d, { ...s!, placements: cut }, { keepPlaced: false })).not.toEqual([]);

    // A week on a class's closed hour does not pass, whatever it claims to open.
    const taught = Object.keys(s!.placements).find((key) => key.startsWith('s510|'))!;
    const closed = { ...d, unavailable: { ...d.unavailable, [taught]: 1 as const } };
    const problems = verifySuggestion(closed, s!, { keepPlaced: false });
    expect(
      problems.some((p) => /510 sınıfı .* kapalı/.test(p)),
      problems.join(' | '),
    ).toBe(true);
  });

  it('saatler öğretmen ve gün başına birleşiyor', () => {
    const d = world('ogretmen-hafta-kapali');
    const lines = suggestionLines(d, {
      family: 'teacherHours',
      changes: [
        { kind: 'teacherHour', teacherId: 'oAV', day: 0, hour: 0 },
        { kind: 'teacherHour', teacherId: 'oAV', day: 0, hour: 1 },
        { kind: 'teacherHour', teacherId: 'oAV', day: 0, hour: 3 },
      ],
      placements: {},
      size: 3,
      proven: false,
      relaid: false,
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^AV .+ 1–2 ve 4\. saat$/);
  });
});
