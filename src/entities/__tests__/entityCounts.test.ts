import { school } from '../../entityFixture';
import { addClass } from '../classCrud';
import { NO_TEACHER_LIMITS, emptyState } from '../defaults';
import { duplicateShorts, weeklyLoad } from '../entityCounts';
import { addLesson } from '../lessonCrud';
import { addTeacher, makeShort } from '../teacherCrud';

describe('weeklyLoad', () => {
  it('öğretmen, sınıf ve derslik yükünü sayar', () => {
    let d = school();
    d = addClass(d, '511', d.rooms[0]!.id); // shares room A with 510
    const [a, b] = d.classes;
    const teacher = d.teachers[0]!.id;
    d = addLesson(d, { classId: a!.id, teacherId: teacher, weeklyHours: 4, blocks: [] });
    d = addLesson(d, { classId: b!.id, teacherId: teacher, weeklyHours: 3, blocks: [] });

    expect(weeklyLoad(d, 'teacher', teacher)).toBe(7);
    expect(weeklyLoad(d, 'class', a!.id)).toBe(4);
    expect(weeklyLoad(d, 'class', b!.id)).toBe(3);
    // the room carries both classes
    expect(weeklyLoad(d, 'room', d.rooms[0]!.id)).toBe(7);
  });

  it('yükü olmayan varlık 0 döner', () => {
    const d = school();
    expect(weeklyLoad(d, 'teacher', d.teachers[0]!.id)).toBe(0);
  });
});


describe('makeShort ve duplicateShorts', () => {
  it('boş kısaltma addan üretilir, dolu olan olduğu gibi kalır', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: '', subject: 'Matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'İsmail Şahin', short: 'İSM', subject: 'Fizik', subject2: '', gender: '' });
    expect(d.teachers[0]!.short).toBe('MÇ');
    expect(d.teachers[1]!.short).toBe('İSM');
  });

  it('Türkçe büyük harf kuralı: i -> İ', () => {
    expect(makeShort('İsmail Şahin')).toBe('İŞ');
    expect(makeShort('irfan yılmaz')).toBe('İY');
  });

  it('çok boşluklu veya boş ad çökertmez', () => {
    expect(makeShort('Ali   Vural')).toBe('AV');
    expect(makeShort('   ')).toBe('??');
    expect(makeShort('')).toBe('??');
    expect(makeShort('Tek')).toBe('T');
  });

  // 25 kişilik gerçek listede bu KESİN çıkar ve ızgarada iki satır ayırt edilemez.
  it('çakışan kısaltmaları adlarıyla birlikte bildirir', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Ahmet Sarı', short: '', subject: 'Tarih', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'Ayşe Solmaz', short: '', subject: 'Kimya', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'Mehmet Çelik', short: '', subject: 'Matematik', subject2: '', gender: '' });
    expect(d.teachers.map((t) => t.short)).toEqual(['AS', 'AS', 'MÇ']);
    expect(duplicateShorts(d.teachers)).toEqual([
      { short: 'AS', names: ['Ahmet Sarı', 'Ayşe Solmaz'] },
    ]);
  });

  it('büyük/küçük harf farkı çakışmayı gizlemez, boş kısaltma sayılmaz', () => {
    expect(
      duplicateShorts([
        { id: '1', name: 'A', short: 'mç', subject: '', subject2: '', gender: '', color: 0, limits: NO_TEACHER_LIMITS },
        { id: '2', name: 'B', short: 'MÇ', subject: '', subject2: '', gender: '', color: 1, limits: NO_TEACHER_LIMITS },
        { id: '3', name: 'C', short: '', subject: '', subject2: '', gender: '', color: 2, limits: NO_TEACHER_LIMITS },
        { id: '4', name: 'D', short: '', subject: '', subject2: '', gender: '', color: 3, limits: NO_TEACHER_LIMITS },
      ]),
    ).toEqual([{ short: 'MÇ', names: ['A', 'B'] }]);
  });
});

// The sentence decides whether he presses Enter or Escape, so it must COUNT
// what is lost, not guess at it.
