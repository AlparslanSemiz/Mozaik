import { setAvailability } from '../availability';
import { addClass } from '../classCrud';
import { place } from '../../constraints';
import { emptyState } from '../defaults';
import { addLesson } from '../lessonCrud';
import { reorderList, respreadColors } from '../listOrder';
import { activeProgram } from '../../programs';
import { addRoom } from '../roomCrud';
import { addTeacher, deleteTeacher } from '../teacherCrud';
import type { State } from '../../types';

describe('öğretmen renkleri', () => {
  it('art arda eklenen öğretmenlerin hiçbiri aynı rengi almıyor', () => {
    let d = emptyState();
    // A real school's worth, past the twelve the old palette had.
    for (let i = 0; i < 30; i++) {
      d = addTeacher(d, { name: `Ad ${i} Soyad`, short: '', subject: 'Matematik' });
    }
    const colors = d.teachers.map((t) => t.color);
    expect(new Set(colors).size).toBe(30);
  });

  it('silinen öğretmenin rengi yeniden kullanılıyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'A A', short: '', subject: 'Matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'B B', short: '', subject: 'Fizik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'C C', short: '', subject: 'Kimya', subject2: '', gender: '' });
    const middle = d.teachers[1]!;
    expect(middle.color).toBe(1);

    d = deleteTeacher(d, middle.id);
    d = addTeacher(d, { name: 'D D', short: '', subject: 'Tarih', subject2: '', gender: '' });
    // The hole is filled rather than a fourth colour handed out.
    expect(d.teachers.map((t) => t.color).sort()).toEqual([0, 1, 2]);
  });
});

describe('sınıf renkleri', () => {
  it('her sınıf kendine ait bir renk alıyor', () => {
    let d = emptyState();
    for (let i = 0; i < 20; i++) d = addClass(d, `${500 + i}`, null);
    expect(new Set(d.classes.map((c) => c.color)).size).toBe(20);
  });

  it('sınıf ve öğretmen renkleri birbirinden bağımsız sayılıyor', () => {
    // A cell is painted in its teacher's colour and a class colour only marks
    // the row head, so the two lists may reuse the same index.
    let d = emptyState();
    d = addTeacher(d, { name: 'A A', short: '', subject: 'Matematik', subject2: '', gender: '' });
    d = addClass(d, '510', null);
    expect(d.teachers[0]!.color).toBe(0);
    expect(d.classes[0]!.color).toBe(0);
  });
});

describe('respreadColors', () => {
  it('silmelerden sonra renkleri baştan sıraya diziyor', () => {
    let d = emptyState();
    for (let i = 0; i < 4; i++) {
      d = addTeacher(d, { name: `Ad${i} Soyad`, short: '', subject: 'Matematik' });
    }
    d = deleteTeacher(d, d.teachers[1]!.id);
    d = deleteTeacher(d, d.teachers[1]!.id); // was index 2
    expect(d.teachers.map((t) => t.color)).toEqual([0, 3]);

    d = respreadColors(d, 'teacher');
    expect(d.teachers.map((t) => t.color)).toEqual([0, 1]);
  });
});


describe('reorderList', () => {
  const named = (): State => {
    let d = emptyState();
    for (const name of ['A', 'B', 'C', 'D']) d = addRoom(d, name);
    return d;
  };
  const names = (d: State) => d.rooms.map((r) => r.name);

  it('bir satırı aşağı taşıyor', () => {
    expect(names(reorderList(named(), 'rooms', 0, 2))).toEqual(['B', 'C', 'A', 'D']);
  });

  it('bir satırı yukarı taşıyor', () => {
    expect(names(reorderList(named(), 'rooms', 3, 1))).toEqual(['A', 'D', 'B', 'C']);
  });

  it('uçlara taşıyor', () => {
    expect(names(reorderList(named(), 'rooms', 2, 0))).toEqual(['C', 'A', 'B', 'D']);
    expect(names(reorderList(named(), 'rooms', 0, 3))).toEqual(['B', 'C', 'D', 'A']);
  });

  // The reducer decides whether a change is worth an undo step by comparing
  // identity. A drag that lands where it started must be indistinguishable
  // from no drag at all, or every nudge costs a Ctrl+Z.
  it('yerinde bırakılan satır AYNI nesneyi döndürüyor — geri-al harcanmıyor', () => {
    const d = named();
    expect(reorderList(d, 'rooms', 2, 2)).toBe(d);
  });

  it('sınır dışı indis hiçbir şey yapmıyor, çökmüyor', () => {
    const d = named();
    for (const [from, to] of [[-1, 1], [9, 1], [1, -1], [1, 9], [0, 4]] as const) {
      expect(reorderList(d, 'rooms', from, to), `${from}->${to}`).toBe(d);
    }
  });

  it('dört listenin dördü de taşınıyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Ali Vural', short: 'AV', subject: 'Matematik' });
    d = addTeacher(d, { name: 'Deniz Ak', short: 'DA', subject: 'Fizik' });
    d = addClass(d, '510', null);
    d = addClass(d, '511', null);
    expect(reorderList(d, 'teachers', 0, 1).teachers.map((t) => t.short)).toEqual(['DA', 'AV']);
    expect(reorderList(d, 'classes', 0, 1).classes.map((c) => c.name)).toEqual(['511', '510']);
  });

  // The fifth list lives one level deeper, in `settings.subjects`, and what it
  // orders is the Branş dropdown on the Öğretmenler step.
  it('branşlar da taşınıyor — settings.subjects', () => {
    const d = emptyState();
    const first = d.settings.subjects[0]!;
    const third = d.settings.subjects[2]!;
    const moved = reorderList(d, 'subjects', 2, 0);
    expect(moved.settings.subjects[0]).toBe(third);
    expect(moved.settings.subjects[1]).toBe(first);
    expect(moved.settings.subjects).toHaveLength(d.settings.subjects.length);
    // Only the order: the rest of settings is the same object graph.
    expect(moved.settings.subjectShorts).toBe(d.settings.subjectShorts);
    expect(moved.rooms).toBe(d.rooms);
  });

  it('branşlarda da yerinde bırakma ve sınır dışı indis AYNI nesneyi döndürüyor', () => {
    const d = emptyState();
    const last = d.settings.subjects.length;
    expect(reorderList(d, 'subjects', 1, 1)).toBe(d);
    expect(reorderList(d, 'subjects', 0, last)).toBe(d);
    expect(reorderList(d, 'subjects', -1, 0)).toBe(d);
  });

  // The array IS the order, so nothing else may move. In particular the
  // placement and closed-hour keys are built from ids, never from a position.
  it('SIRADAN başka hiçbir şey değişmiyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Ali Vural', short: 'AV', subject: 'Matematik' });
    d = addTeacher(d, { name: 'Deniz Ak', short: 'DA', subject: 'Fizik' });
    d = addClass(d, '510', null);
    const cls = d.classes[0]!.id;
    d = addLesson(d, { classId: cls, teacherId: d.teachers[0]!.id, weeklyHours: 2, blocks: [] });
    d = setAvailability(d, d.teachers[1]!.id, [{ day: 0, hour: 0 }], true);
    d = place(d, d.lessons[0]!.id, 0, 0);

    const moved = reorderList(d, 'teachers', 0, 1);
    expect(moved.teachers.map((t) => t.short)).toEqual(['DA', 'AV']);
    expect(activeProgram(moved).placements).toEqual(activeProgram(d).placements);
    expect(moved.unavailable).toEqual(d.unavailable);
    expect(moved.lessons).toEqual(d.lessons);
    expect(moved.classes).toEqual(d.classes);
    expect(moved.settings).toEqual(d.settings);
    // The teachers themselves are untouched objects, only re-ordered.
    expect(moved.teachers).toEqual([d.teachers[1], d.teachers[0]]);
  });
});
