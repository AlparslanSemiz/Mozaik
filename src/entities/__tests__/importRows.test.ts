import { school } from '../../entityFixture';
import { emptyState } from '../defaults';
import { addClassesFromRows, addLessonsFromRows, addTeachersFromRows } from '../importRows';
import { deleteSubject } from '../subjectList';

describe('addClassesFromRows', () => {
  it('derslik adını büyük/küçük harf ve Türkçe fark etmeden eşler', () => {
    const next = addClassesFromRows(school(), [{ name: '511', roomName: 'a' }]);
    expect(next.rooms).toHaveLength(1); // no second "a" room
    expect(next.classes.find((c) => c.name === '511')!.roomId).toBe(next.rooms[0]!.id);
  });

  it('bilinmeyen dersliği YARATIR — yoksa çakışma kontrolü sessizce kapanırdı', () => {
    const next = addClassesFromRows(school(), [{ name: '610', roomName: 'B' }]);
    expect(next.rooms.map((r) => r.name)).toEqual(['A', 'B']);
    expect(next.classes.find((c) => c.name === '610')!.roomId).toBe(next.rooms[1]!.id);
  });

  it('derslik adı boşsa sınıf dersliksiz eklenir', () => {
    const next = addClassesFromRows(school(), [{ name: '710', roomName: '' }]);
    expect(next.rooms).toHaveLength(1);
    expect(next.classes.find((c) => c.name === '710')!.roomId).toBeNull();
  });
});

describe('addLessonsFromRows', () => {
  const row = (teacher: string) => ({
    className: '510',
    teacher,
    weeklyHours: 4, blocks: [2, 2],
  });

  it('öğretmeni kısaltmadan da tam addan da bulur', () => {
    for (const name of ['MÇ', 'mç', 'Mehmet Çelik']) {
      const { state, missing } = addLessonsFromRows(school(), [row(name)]);
      expect(missing).toEqual([]);
      expect(state.lessons).toHaveLength(1);
      expect(state.lessons[0]!.weeklyHours).toBe(4);
      expect(state.lessons[0]!.blocks).toEqual([2, 2]);
    }
  });

  it('bulunamayan satırı TAHMİN ETMEZ, geri bildirir', () => {
    const { state, missing } = addLessonsFromRows(school(), [
      row('MÇ'),
      { className: '999', teacher: 'MÇ', weeklyHours: 2, blocks: [] },
      { className: '510', teacher: 'ZZ', weeklyHours: 2, blocks: [] },
    ]);
    expect(state.lessons).toHaveLength(1); // only the good row landed
    expect(missing).toEqual(['999 / MÇ', '510 / ZZ']);
  });
});


describe('addTeachersFromRows', () => {
  it('yapıştırılan listedeki tanımadığı branşı okul listesine ekliyor', () => {
    let d = emptyState();
    d = deleteSubject(d, 'Matematik'); // the school does not teach it any more
    d = addTeachersFromRows(d, [
      { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' },
      { name: 'Ayşe Yıldız', short: 'AY', subject: 'Robotik', subject2: '', gender: '' },
    ]);

    expect(d.teachers.map((t) => t.subject)).toEqual(['Matematik', 'Robotik']);
    // Both are selectable afterwards; a pasted branch is not a dead end.
    expect(d.settings.subjects).toContain('Matematik');
    expect(d.settings.subjects).toContain('Robotik');
  });

  it('aynı branşı iki kez yazan liste branşı iki kez eklemiyor', () => {
    let d = emptyState();
    const before = d.settings.subjects.length;
    d = addTeachersFromRows(d, [
      { name: 'A A', short: '', subject: 'Robotik', subject2: '', gender: '' },
      { name: 'B B', short: '', subject: 'robotik', subject2: '', gender: '' },
    ]);
    expect(d.settings.subjects.length).toBe(before + 1);
  });
});

