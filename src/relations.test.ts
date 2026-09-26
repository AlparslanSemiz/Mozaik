// Two lessons that may not share a day (State.relations, TODO B5.3), through
// every layer that has to keep it: the drop, Kontrol, the solver and the
// suggestion search.

import { describe, expect, it } from 'vitest';

import { blocker, buildIndex, dropMap, place } from './pure/constraints';
import { addNotSameDay } from './pure/entities';
import { activePlacements } from './pure/programs';
import { suggest, verifySuggestion } from './pure/relax';
import { findViolations } from './pure/rules';
import { solve } from './pure/solver';
import { closeHours, illegalBlocks, makeWorld } from './worlds';
import type { State } from './leaf/types';

/**
 * Two days of three hours, two classes in two rooms, two teachers: `a` (510,
 * MÇ) and `b` (511, AV) share nothing, so only the relation can keep them
 * apart.
 */
function world(): State {
  const d = makeWorld({
    days: 2,
    hours: 3,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: 'dB' },
    ],
    rooms: [
      { id: 'dA', name: 'A' },
      { id: 'dB', name: 'B' },
    ],
    lessons: [
      { id: 'a', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
      { id: 'b', classId: 's511', teacherId: 'oAV', weeklyHours: 1 },
    ],
  });
  return addNotSameDay(d, 'a', 'b');
}

/** The days a lesson is on, read off the grid. */
function daysOf(d: State, lessonId: string): number[] {
  const days = Object.entries(activePlacements(d))
    .filter(([, id]) => id === lessonId)
    .map(([key]) => Number(key.split('|')[1]));
  return [...new Set(days)].sort();
}

describe('ilişki · aynı gün olmasın', () => {
  it('ilişkili ders o gün varsa bırakma reddediliyor, öbür gün serbest', () => {
    const d = place(world(), 'a', 0, 0);
    const ix = buildIndex(d);
    expect(blocker(d, ix, 'b', 0, 2)).toBe(
      '510 · MÇ Matematik Salı günü var, bu dersle aynı güne konmamalı',
    );
    expect(blocker(d, ix, 'b', 1, 2)).toBeNull();
    // The drag map says the same: the whole of Salı is closed to b.
    const map = dropMap(d, ix, 'b');
    for (let h = 0; h < 3; h++) expect(map.get(`0|${h}`)?.blocked).not.toBeNull();
    expect(map.get('1|0')?.blocked).toBeNull();
  });

  it('ilişkisiz dünyada aynı iki ders aynı güne konabiliyor', () => {
    const d = place({ ...world(), relations: [] }, 'a', 0, 0);
    expect(blocker(d, buildIndex(d), 'b', 0, 2)).toBeNull();
  });

  it('dersler yerleştikten sonra eklenen ilişki Kontrol’de ihlal, dersler yerinde', () => {
    let d = place({ ...world(), relations: [] }, 'a', 0, 0);
    d = place(d, 'b', 0, 1);
    d = addNotSameDay(d, 'a', 'b');
    expect(daysOf(d, 'a')).toEqual([0]);
    expect(daysOf(d, 'b')).toEqual([0]);
    const found = findViolations(d, buildIndex(d)).filter((v) => v.rule === 'notSameDay');
    expect(found).toHaveLength(1);
    expect(found[0]!.level).toBe('block');
    expect(found[0]!.message).toBe(
      '510 · MÇ Matematik ile 511 · AV Fizik Salı günü ikisi de var, aynı gün olmamalı.',
    );
  });

  it('otomatik dizme ilişkiyi hiç çiğnemiyor', () => {
    const result = solve(world(), { keepPlaced: false });
    expect(result.phase).toBe('solved');
    expect(illegalBlocks(result.state)).toEqual([]);
    const [dayA] = daysOf(result.state, 'a');
    const [dayB] = daysOf(result.state, 'b');
    expect(dayA).not.toBe(dayB);
  });

  it('ilişki haftayı kurulamaz yapınca öneri onu çiğnemeden arıyor', () => {
    // Both teachers are closed all of Çarşamba, so both lessons can only go
    // on Salı, and the relation leaves no week. The way is a teacher hour
    // opened on Çarşamba, never both lessons on Salı.
    const d = closeHours(
      closeHours(world(), 'oMC', [
        [1, 0],
        [1, 1],
        [1, 2],
      ]),
      'oAV',
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
    );
    const stuck = solve(d, { keepPlaced: false });
    expect(stuck.phase).toBe('stuck');
    const { suggestions } = suggest(d, activePlacements(stuck.state), {
      keepPlaced: false,
      families: ['teacherHours'],
    });
    expect(suggestions).toHaveLength(1);
    const s = suggestions[0]!;
    expect(s.size).toBe(1);
    expect(verifySuggestion(d, s, { keepPlaced: false })).toEqual([]);
    const grid = { ...d, programs: [{ ...d.programs[0]!, placements: s.placements }] };
    expect(daysOf(grid, 'a')).not.toEqual(daysOf(grid, 'b'));
  });
});
