// The father's own file with his week laid out, and "Olmaz" said in it. Moved
// out of relax.test.ts on 2026-10-09 for the same reason as
// relaxFullCourse.test.ts: Vitest runs files in parallel and the tests inside one
// file one after another.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRelaxer, verifySuggestion } from './pure/relax';
import type { RelaxOptions } from './pure/relax';
import { parseState } from './pure/parseState';
import { activePlacements } from './pure/programs';
import type { State } from './leaf/types';

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

  it('karma yollar kendi hatlarında en az saatin haftasıyla başlayınca 1 ders ve 3 saat', async () => {
    // On a worker of their own the hand-over ways get the fewest-hours week
    // as `seed` (relaxPool.ts). MEASURED (2026-09-25): from it one lesson and
    // 3 hours, CP-SAT's best; from the stuck week alone 7 hours on the
    // father's file.
    const d = dizili();
    const hint = activePlacements(d);
    const first = await sliced(d, hint, { keepPlaced: true, families: ['teacherHours'] });
    const hand = await sliced(d, hint, {
      keepPlaced: true,
      families: ['handFew', 'handHours'],
      seed: first,
    });
    const hours = hand.find((x) => x.family === 'handHours');
    expect(hours?.changes.filter((c) => c.kind === 'lessonTeacher')).toHaveLength(1);
    expect(hours?.changes.filter((c) => c.kind === 'teacherHour')).toHaveLength(3);
    expect(verifySuggestion(d, hours!, { keepPlaced: false })).toEqual([]);
  }, 240_000);
});
