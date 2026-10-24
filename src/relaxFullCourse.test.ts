// The father's own week (anonymised), on the suggestion search: what has to
// change for it to be built, and the week the solver alone cannot finish. Moved
// out of relax.test.ts on 2026-10-09 so that it runs beside the rest of the
// suite instead of after it: Vitest runs files in parallel and the tests inside
// one file one after another, and these two are among the slowest in the suite.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applySuggestion, createRelaxer, suggestionLines, verifySuggestion } from './pure/relax';
import type { RelaxFamily, Suggestion } from './pure/relax';
import { solve } from './pure/solver';
import { parseState } from './pure/parseState';
import { activePlacements } from './pure/program/programs';
import { buildIndex } from './pure/constraints';
import { findViolations } from './pure/rules';
import { parseKey } from './leaf/keys';
import { illegalBlocks } from './worlds';
import type { State } from './leaf/types';

function kurs(): State {
  const raw = readFileSync(join(import.meta.dirname, 'fixtures', 'tam-dolu-kurs.json'), 'utf8');
  const state = parseState(raw);
  if (state === null) throw new Error('tam-dolu-kurs.json okunamadı');
  return state;
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

// The same as relax.test.ts's expectHonest and byFamily, a second copy so that this
// file runs on its own (CONVENTIONS: a third one goes to a shared module).
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

// The father's week (anonymised). CP-SAT, outside the repository, gives the
// smallest changes as 4 closed teacher hours, or 6 limit overrides worth 9
// hours, or one teacher's 6 hours (WORKLOG 2026-09-24); those are floors
// nothing can go under. The search reaches the hours on both hour ways and the
// 9 hours over on the rules, without proving them. The rules way's COUNT of
// limits was one over CP-SAT's (7 for 6) on 2026-09-25 morning; the same day,
// after the search learned to start from other weeks, it came back 6 here and
// in the real exe. The range below still allows 7: it depends on the week the
// way starts from, and a local search promises no more.
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
