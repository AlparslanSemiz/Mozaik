import { describe, expect, it } from 'vitest';
import { place } from '../../constraints';
import { activeProgram } from '../../state/programs';
import { setDayMask, setRowMask, solverExclusions } from '../programMask';
import { EMPTY_PROGRAM_MASK } from '../programMask';
import { solve } from '../../schedule/solver';
import { makeWorld } from '../../testing/worlds';

function world() {
  return makeWorld({
    days: 2,
    hours: 3,
    teachers: [
      { id: 'o1', short: 'A' },
      { id: 'o2', short: 'B' },
    ],
    classes: [
      { id: 's1', name: '1', roomId: null },
      { id: 's2', name: '2', roomId: null },
    ],
    lessons: [
      { id: 'x1', classId: 's1', teacherId: 'o1', weeklyHours: 2 },
      { id: 'x2', classId: 's2', teacherId: 'o2', weeklyHours: 2 },
    ],
  });
}

describe('geçici program kapsamı', () => {
  it('aynı satırda ghost ve gizli durumlarından yalnız sonuncusunu tutar', () => {
    let mask = setRowMask(EMPTY_PROGRAM_MASK, 'teacher', 'o1', 'ghost');
    mask = setRowMask(mask, 'teacher', 'o1', 'hidden');
    expect(mask.teachers).toEqual({ o1: 'hidden' });
    expect(setRowMask(mask, 'teacher', 'o1').teachers).toEqual({});
  });

  it('Baştan diz sırasında kapsam dışı satır ve gündeki blokları yerinde korur', () => {
    let d = place(world(), 'x1', 0, 0, 1);
    d = place(d, 'x2', 1, 2, 1);
    let mask = setRowMask(EMPTY_PROGRAM_MASK, 'teacher', 'o1', 'ghost');
    mask = setDayMask(mask, d.settings.days[1]!.name, 'hidden');

    const result = solve(d, {
      keepPlaced: false,
      exclusions: solverExclusions(mask),
    });
    const placements = activeProgram(result.state).placements;
    expect(placements['s1|0|0']).toBe('x1');
    expect(placements['s2|1|2']).toBe('x2');
    expect(Object.keys(placements).some((key) => key.startsWith('s1|') && key !== 's1|0|0')).toBe(false);
    expect(result.stuck.some((item) => item.lessonId === 'x1')).toBe(false);
    expect(result.excludedBlocks).toBeGreaterThan(0);
  });

  it('kapsam dışı güne yeni blok koymaz', () => {
    const d = world();
    const mask = setDayMask(EMPTY_PROGRAM_MASK, d.settings.days[0]!.name, 'ghost');
    const result = solve(d, { exclusions: solverExclusions(mask) });
    expect(Object.keys(activeProgram(result.state).placements).every((key) => key.split('|')[1] !== '0')).toBe(true);
  });
});
