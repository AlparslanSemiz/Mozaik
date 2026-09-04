import { addClass } from '../classCrud';
import { buildIndex, place, placementKey, setBlockPinned } from '../../constraints';
import { emptyState } from '../defaults';
import { addLesson } from '../lessonCrud';
import { moveLessonToClass, transferLesson } from '../lessonMove';
import { activeProgram } from '../../state/programs';
import { addRoom } from '../roomCrud';
import { lessonSubject } from '../../schedule/subjects';
import { addTeacher } from '../teacherCrud';
import type { State } from '../../types';

describe('transferLesson', () => {
  function twoClasses(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    d = addRoom(d, 'B');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'Ayşe Var', short: 'AV', subject: 'Matematik', subject2: 'Fizik', gender: '' });
    d = addClass(d, '510', d.rooms[0]!.id);
    d = addClass(d, '511', d.rooms[1]!.id);
    return d;
  }

  const lessonOf = (d: State, i: number) => d.lessons[i]!;

  it('dersi yeni hocaya veriyor', () => {
    let d = twoClasses();
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 2,
      blocks: [],
    });
    const { state } = transferLesson(d, d.lessons[0]!.id, d.teachers[1]!.id);
    expect(lessonOf(state, 0).teacherId).toBe(d.teachers[1]!.id);
  });

  // THE reason this is not `updateLesson(d, id, { teacherId })`. Placements are
  // keyed by CLASS, so a plain write leaves every cell where it is; teacher
  // occupancy is derived into a Map, so two lessons on one teacher at one hour
  // silently overwrite instead of clashing — and nothing in sanitize() or
  // findViolations() looks for it. The receiving teacher would stand in two
  // rooms at once with every count still adding up.
  it('yeni hocayı ÇİFT REZERVE ETMİYOR — çakışan blok havuza dönüyor', () => {
    let d = twoClasses();
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 2,
      blocks: [],
    });
    d = addLesson(d, {
      classId: d.classes[1]!.id,
      teacherId: d.teachers[1]!.id,
      weeklyHours: 2,
      blocks: [],
    });
    // Both lessons sit on Tuesday hours 0 and 1, in their own classes.
    for (let h = 0; h < 2; h++) {
      d = place(d, d.lessons[0]!.id, 0, h, 1);
      d = place(d, d.lessons[1]!.id, 0, h, 1);
    }

    const { state, returned } = transferLesson(d, d.lessons[0]!.id, d.teachers[1]!.id);
    expect(returned).toBe(2);

    // Not one hour of the moved lesson is left on the grid...
    const moved = d.lessons[0]!.id;
    expect(Object.values(activeProgram(state).placements).filter((x) => x === moved)).toHaveLength(0);
    // ...and the receiving teacher is in exactly one place at a time.
    const ix = buildIndex(state);
    for (let h = 0; h < 2; h++) {
      const at = Object.entries(activeProgram(state).placements).filter(([key]) => key.endsWith(`|0|${h}`));
      const holders = at.map(([, id]) => state.lessons.find((x) => x.id === id)!.teacherId);
      expect(new Set(holders).size).toBe(holders.length);
    }
    expect(ix.teacherBusy.size).toBe(2);
  });

  it('çakışmayan blok YERİNDE kalıyor', () => {
    let d = twoClasses();
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 2,
      blocks: [],
    });
    d = place(d, d.lessons[0]!.id, 0, 0, 1);
    d = place(d, d.lessons[0]!.id, 1, 0, 1);

    const { state, returned } = transferLesson(d, d.lessons[0]!.id, d.teachers[1]!.id);
    expect(returned).toBe(0);
    expect(activeProgram(state).placements[placementKey(d.classes[0]!.id, 0, 0)]).toBe(d.lessons[0]!.id);
    expect(activeProgram(state).placements[placementKey(d.classes[0]!.id, 1, 0)]).toBe(d.lessons[0]!.id);
  });

  // `second` points at one of the OLD teacher's two fields. Carried over
  // blindly it would make the lesson claim whatever happens to sit in the new
  // teacher's second slot — a silent change of subject.
  it('BRANŞI koruyor: second bayrağı yeni hocada yeniden eşleniyor', () => {
    let d = twoClasses();
    // A teacher whose SECOND subject is what the lesson is taught under.
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[1]!.id,
      weeklyHours: 2,
      blocks: [],
      second: true,
    });
    expect(lessonSubject(d, d.lessons[0]!)).toBe('Fizik');

    // Moving it to a teacher who only holds Matematik cannot keep Fizik, and
    // the flag has to say so rather than point past the end.
    const { state } = transferLesson(d, d.lessons[0]!.id, d.teachers[0]!.id);
    expect(lessonOf(state, 0).second).toBe(false);
    expect(lessonSubject(state, lessonOf(state, 0))).toBe('Matematik');
  });

  it('aynı branş yeni hocanın İKİNCİ alanındaysa bayrak açılıyor', () => {
    let d = twoClasses();
    d = addTeacher(d, { name: 'Can Er', short: 'CE', subject: 'Fizik', subject2: '', gender: '' });
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[2]!.id,
      weeklyHours: 2,
      blocks: [],
    });
    expect(lessonSubject(d, d.lessons[0]!)).toBe('Fizik');

    // AV holds Matematik first and Fizik second.
    const { state } = transferLesson(d, d.lessons[0]!.id, d.teachers[1]!.id);
    expect(lessonOf(state, 0).second).toBe(true);
    expect(lessonSubject(state, lessonOf(state, 0))).toBe('Fizik');
  });

  it('bilinmeyen ders ya da hoca hiçbir şeyi değiştirmiyor', () => {
    const d = twoClasses();
    expect(transferLesson(d, 'yok', d.teachers[0]!.id).state).toBe(d);
  });
});

// The mirror of the block above, and it fails the other way round if written
// naively: placements are keyed BY CLASS, so a plain `updateLesson(d, id,
// { classId })` leaves every hour of the lesson in the OLD class's row.
describe('moveLessonToClass', () => {
  function school(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    d = addRoom(d, 'B');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addClass(d, '510', d.rooms[0]!.id);
    d = addClass(d, '511', d.rooms[1]!.id);
    return d;
  }

  function withLesson(hours = 2): State {
    let d = school();
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: hours,
      blocks: [],
    });
    return d;
  }

  it('dersi yeni sınıfa veriyor', () => {
    const d = withLesson();
    const { state } = moveLessonToClass(d, d.lessons[0]!.id, d.classes[1]!.id);
    expect(state.lessons[0]!.classId).toBe(d.classes[1]!.id);
  });

  // THE reason this is not a plain field write. Every assertion here passes
  // against `updateLesson(d, id, { classId })` except the last one, and the
  // last one is the whole bug: the hours stay under a class that no longer has
  // the lesson, and the class that does looks free.
  it('SAATLER de taşınıyor — eski satırda tek hücre kalmıyor', () => {
    let d = withLesson();
    const id = d.lessons[0]!.id;
    const from = d.classes[0]!.id;
    const to = d.classes[1]!.id;
    d = place(d, id, 0, 0, 1);
    d = place(d, id, 0, 1, 1);

    const { state, returned } = moveLessonToClass(d, id, to);
    expect(returned).toBe(0);

    const cells = activeProgram(state).placements;
    expect(Object.keys(cells).filter((k) => k.startsWith(`${from}|`))).toEqual([]);
    expect(cells[placementKey(to, 0, 0)]).toBe(id);
    expect(cells[placementKey(to, 0, 1)]).toBe(id);
  });

  it('yeni sınıfın DOLU saati havuza dönüyor', () => {
    let d = school();
    d = addTeacher(d, { name: 'Ayşe Var', short: 'AV', subject: 'Fizik', subject2: '', gender: '' });
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 2,
      blocks: [],
    });
    d = addLesson(d, {
      classId: d.classes[1]!.id,
      teacherId: d.teachers[1]!.id,
      weeklyHours: 2,
      blocks: [],
    });
    const moving = d.lessons[0]!.id;
    // Both sit on Tuesday hours 0 and 1, each in its own class.
    for (let h = 0; h < 2; h++) {
      d = place(d, moving, 0, h, 1);
      d = place(d, d.lessons[1]!.id, 0, h, 1);
    }

    const { state, returned } = moveLessonToClass(d, moving, d.classes[1]!.id);
    // 511 is busy at both hours, so both blocks go back to the tray rather
    // than overwriting somebody else's lesson.
    expect(returned).toBe(2);
    expect(Object.values(activeProgram(state).placements).filter((x) => x === moving)).toHaveLength(0);
  });

  // A pin is `classId|day|hour`. Left behind it would point at a square that
  // now belongs to another class and lock a stranger's hour — and nothing on
  // screen would say why that hour cannot be used.
  it('SABİTLEMELER düşüyor ve sayılıyor', () => {
    let d = withLesson();
    const id = d.lessons[0]!.id;
    d = place(d, id, 0, 0, 1);
    d = setBlockPinned(d, d.classes[0]!.id, 0, 0, true);
    expect(Object.keys(activeProgram(d).pinned)).toHaveLength(1);

    const { state, unpinned } = moveLessonToClass(d, id, d.classes[1]!.id);
    expect(unpinned).toBe(1);
    expect(activeProgram(state).pinned).toEqual({});
  });

  it('bilinmeyen ders ya da sınıf hiçbir şeyi değiştirmiyor', () => {
    const d = withLesson();
    expect(moveLessonToClass(d, 'yok', d.classes[1]!.id).state).toBe(d);
    expect(moveLessonToClass(d, d.lessons[0]!.id, 'yok').state).toBe(d);
    // ...and neither does moving it where it already is.
    expect(moveLessonToClass(d, d.lessons[0]!.id, d.classes[0]!.id).state).toBe(d);
  });
});

