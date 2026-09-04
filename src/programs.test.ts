import { describe, expect, it } from 'vitest';
import { deleteLesson, remapDays } from './entities';
import { place, setBlockPinned, togglePinScope } from './constraints';
import { parseState } from './parseState';
import {
  activeProgram,
  addProgram,
  blankProgram,
  nextProgramName,
  removeProgram,
  renameProgram,
  switchProgram,
} from './programs';
import { makeWorld } from './testing/worlds';

function world() {
  return makeWorld({
    days: 2,
    hours: 4,
    teachers: [
      { id: 'o1', short: 'A' },
      { id: 'o2', short: 'B' },
    ],
    classes: [
      { id: 's1', name: '1', roomId: null },
      { id: 's2', name: '2', roomId: null },
    ],
    lessons: [
      { id: 'x1', classId: 's1', teacherId: 'o1', weeklyHours: 2, blockSize: 2 },
      { id: 'x2', classId: 's2', teacherId: 'o2', weeklyHours: 1 },
    ],
  });
}

describe('alternatif programlar', () => {
  it('v11 yerleşim ve sabitlemelerini kayıpsız tek Program 1 içine taşır', () => {
    const modern = setBlockPinned(place(world(), 'x1', 0, 0, 2), 's1', 0, 0, true);
    const program = activeProgram(modern);
    const { programs: _programs, activeProgramId: _activeProgramId, ...shared } = modern;
    const legacy = {
      ...shared,
      schemaVersion: 11,
      placements: program.placements,
      pinned: program.pinned,
    };
    const migrated = parseState(JSON.stringify(legacy))!;
    expect(migrated.programs).toHaveLength(1);
    expect(activeProgram(migrated)).toMatchObject({
      name: 'Program 1',
      placements: program.placements,
      pinned: program.pinned,
    });
  });

  it('aynı okul verisini paylaşır, ızgaraları birbirinden yalıtır', () => {
    let d = place(world(), 'x1', 0, 0, 2);
    const first = d.activeProgramId;
    d = addProgram(d, blankProgram('p2', 'Program 2'));
    expect(activeProgram(d).placements).toEqual({});
    expect(d.lessons).toHaveLength(2);

    d = place(d, 'x2', 1, 3);
    d = switchProgram(d, first);
    expect(Object.values(activeProgram(d).placements)).toEqual(['x1', 'x1']);
  });

  it('adları benzersiz tutar; aktif silinince komşusuna geçer ve sonuncuyu silmez', () => {
    let d = world();
    d = addProgram(d, blankProgram('p2', 'Program 2'));
    expect(addProgram(d, blankProgram('p3', 'program 2'))).toBe(d);
    expect(renameProgram(d, 'p2', ' Program 2 ').programs[1]?.name).toBe('Program 2');
    expect(nextProgramName(d.programs)).toBe('Program 3');

    d = removeProgram(d, 'p2');
    expect(d.programs).toHaveLength(1);
    expect(d.activeProgramId).toBe(d.programs[0]?.id);
    expect(removeProgram(d, d.activeProgramId)).toBe(d);
  });

  it('ortak ders silme ve gün eşleme işlemlerini bütün ızgaralara uygular', () => {
    let d = place(world(), 'x1', 0, 0, 2);
    d = addProgram(d, {
      ...blankProgram('p2', 'Program 2'),
      placements: { 's1|1|1': 'x1', 's1|1|2': 'x1' },
    });
    d = remapDays(d, [d.settings.days[1]!, d.settings.days[0]!]);
    expect(d.programs[0]?.placements['s1|1|0']).toBe('x1');
    expect(d.programs[1]?.placements['s1|0|1']).toBe('x1');

    d = deleteLesson(d, 'x1');
    expect(d.programs.every((program) => Object.keys(program.placements).length === 0)).toBe(true);
  });
});

describe('toplu sabitleme kapsamları', () => {
  it('tıklanan sütunun kestiği uzun bloğun tamamını tek seferde sabitler ve kaldırır', () => {
    let d = place(world(), 'x1', 0, 0, 2);
    d = togglePinScope(d, { kind: 'column', day: 0, hour: 1 });
    expect(Object.keys(activeProgram(d).pinned).sort()).toEqual(['s1|0|0', 's1|0|1']);
    d = togglePinScope(d, { kind: 'column', day: 0, hour: 1 });
    expect(activeProgram(d).pinned).toEqual({});
  });

  it('satır ve tüm program kapsamları yalnız dolu blokları sabitler', () => {
    let d = place(world(), 'x1', 0, 0, 2);
    d = place(d, 'x2', 1, 3, 1);
    d = togglePinScope(d, { kind: 'row', view: 'teacher', rowId: 'o1' });
    expect(Object.keys(activeProgram(d).pinned)).toHaveLength(2);
    d = togglePinScope(d, { kind: 'all' });
    expect(Object.keys(activeProgram(d).pinned)).toHaveLength(3);
  });
});
