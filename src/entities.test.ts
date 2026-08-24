// remapDays is the guard against the worst kind of bug this tool can have:
// silently moving a finished timetable one day earlier.
//
// Placement keys hold the day INDEX. When Monday is unticked, Tuesday moves
// from index 1 to index 0 — without remapping, every lesson would appear to
// have been taught a day earlier and nobody would notice (docs/PLAN.md 14).

import { place, placementKey, teacherKey } from './constraints';
import {
  addClass,
  addSubject,
  addClassesFromRows,
  addLesson,
  addLessonsFromRows,
  addRoom,
  addTeacher,
  DEFAULT_SUBJECT_SHORTS,
  defaultSubjectShort,
  deleteSubject,
  deleteTeacher,
  deletionSummary,
  duplicateShorts,
  setSubjectShort,
  respreadColors,
  subjectOptions,
  subjectShort,
  subjectTeachers,
  usedSubjects,
  hourLabels,
  makeShort,
  shortDay,
  weeklyLoad,
  WEEK,
  DEFAULT_BELL,
  DEFAULT_LIMITS,
  DEFAULT_RULES,
  NO_TEACHER_LIMITS,
  defaultDays,
  emptyState,
  makeDay,
  remapDays,
  updateSettings,
} from './entities';
import type { Day, State } from './types';
import { SCHEMA_VERSION } from './types';

function build(): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: '',
      days: [makeDay('Pazartesi'), makeDay('Salı'), makeDay('Çarşamba')],
      hours: ['1', '2', '3', '4'],
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS },
      rules: { ...DEFAULT_RULES },
      subjects: [],
      subjectShorts: {},
    },
    rooms: [],
    teachers: [
      {
        id: 'oMC',
        name: 'Mehmet Çelik',
        short: 'MÇ',
        subject: 'Matematik',
        color: 0,
        limits: { ...NO_TEACHER_LIMITS },
      },
    ],
    classes: [{ id: 's510', name: '510', roomId: null, color: 0 }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blockSize: 1, maxPerDay: null },
    ],
    unavailable: { [teacherKey('oMC', 2, 3)]: 1 },
    placements: {
      [placementKey('s510', 0, 0)]: 'x1', // Pazartesi
      [placementKey('s510', 1, 1)]: 'x1', // Salı
      [placementKey('s510', 2, 2)]: 'x1', // Çarşamba
    },
  };
}

const without = (days: Day[], name: string) => days.filter((x) => x.name !== name);

describe('remapDays', () => {
  it('BAŞTAN gün silinince kalan günlerin dersleri KAYMAZ', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Pazartesi'));

    // Salı was index 1, is now index 0 — and its lesson moved with it.
    expect(next.placements[placementKey('s510', 0, 1)]).toBe('x1'); // Salı
    expect(next.placements[placementKey('s510', 1, 2)]).toBe('x1'); // Çarşamba
    expect(Object.keys(next.placements)).toHaveLength(2);
  });

  it('silinen günün dersleri gider', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Salı'));
    expect(Object.keys(next.placements)).toHaveLength(2);
    expect(next.placements[placementKey('s510', 0, 0)]).toBe('x1'); // Pazartesi stays put
    expect(next.placements[placementKey('s510', 1, 2)]).toBe('x1'); // Çarşamba moved 2 -> 1
  });

  it('müsaitlik kayıtları da aynı şekilde taşınır', () => {
    const d = build();
    const next = remapDays(d, without(d.settings.days, 'Pazartesi'));
    expect(next.unavailable[teacherKey('oMC', 1, 3)]).toBe(1); // was day 2
    expect(next.unavailable[teacherKey('oMC', 2, 3)]).toBeUndefined();
  });

  it('gün eklenince mevcut günler yerinde kalır, yeni gün boş gelir', () => {
    const d = build();
    const next = remapDays(d, [...d.settings.days, makeDay('Perşembe')]);
    expect(next.placements).toEqual(d.placements);
  });

  it('gün BAŞA eklenince her şey bir sağa kayar', () => {
    const d = build();
    const next = remapDays(d, [makeDay('Pazar'), ...d.settings.days]);
    expect(next.placements[placementKey('s510', 1, 0)]).toBe('x1');
    expect(next.placements[placementKey('s510', 3, 2)]).toBe('x1');
  });

  it('sıra değişmediyse AYNI nesneyi döner (gereksiz çizim yok)', () => {
    const d = build();
    expect(remapDays(d, [...d.settings.days])).toBe(d);
    // Renaming the long break is not a move either.
    const sameOrder = d.settings.days.map((x) => ({ ...x, longBreakAfter: 6 }));
    expect(remapDays(d, sameOrder)).toBe(d);
  });
});

describe('updateSettings', () => {
  it('gün listesini değiştirirken anahtarları da taşır', () => {
    const d = build();
    const next = updateSettings(d, { days: without(d.settings.days, 'Pazartesi') });
    expect(next.settings.days.map((x) => x.name)).toEqual(['Salı', 'Çarşamba']);
    expect(next.placements[placementKey('s510', 0, 1)]).toBe('x1');
  });

  it('saat sayısı düşünce taşan yerleşimler temizlenir', () => {
    const d = build();
    const next = updateSettings(d, { hours: ['1', '2'] });
    expect(next.placements[placementKey('s510', 2, 2)]).toBeUndefined();
    expect(next.placements[placementKey('s510', 1, 1)]).toBe('x1');
  });

  it('dokunulmayan alanlar korunur', () => {
    const d = build();
    const next = updateSettings(d, { schoolName: 'Semiz Kurs' });
    expect(next.settings.schoolName).toBe('Semiz Kurs');
    expect(next.settings.hours).toEqual(['1', '2', '3', '4']);
    expect(next.settings.days).toEqual(d.settings.days);
  });
});

describe('varsayılan hafta', () => {
  it('Pazartesi hariç 6 gün, hafta sonu öğle arası 6. dersten sonra', () => {
    const days = defaultDays();
    expect(days.map((x) => x.name)).toEqual([
      'Salı',
      'Çarşamba',
      'Perşembe',
      'Cuma',
      'Cumartesi',
      'Pazar',
    ]);
    expect(days.find((x) => x.name === 'Cuma')!.longBreakAfter).toBe(5);
    expect(days.find((x) => x.name === 'Pazar')!.longBreakAfter).toBe(6);
  });

  it('boş durum 6 gün x 12 saat ile başlar', () => {
    const d = emptyState();
    expect(d.settings.days).toHaveLength(6);
    expect(d.settings.hours).toHaveLength(12);
    expect(d.settings.bell.start).toBe('09:00');
  });
});

// The four below used to live inside Setup.tsx with no test at all. Matching a
// room or a teacher by name decides whether a pasted row lands or is silently
// dropped — that is data, not screen.

function school(): State {
  let d = emptyState();
  d = addRoom(d, 'A');
  d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
  d = addClass(d, '510', d.rooms[0]!.id);
  return d;
}

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
    weeklyHours: 4,
    blockSize: 2,
  });

  it('öğretmeni kısaltmadan da tam addan da bulur', () => {
    for (const name of ['MÇ', 'mç', 'Mehmet Çelik']) {
      const { state, missing } = addLessonsFromRows(school(), [row(name)]);
      expect(missing).toEqual([]);
      expect(state.lessons).toHaveLength(1);
      expect(state.lessons[0]!.weeklyHours).toBe(4);
      expect(state.lessons[0]!.blockSize).toBe(2);
    }
  });

  it('bulunamayan satırı TAHMİN ETMEZ, geri bildirir', () => {
    const { state, missing } = addLessonsFromRows(school(), [
      row('MÇ'),
      { className: '999', teacher: 'MÇ', weeklyHours: 2, blockSize: 1 },
      { className: '510', teacher: 'ZZ', weeklyHours: 2, blockSize: 1 },
    ]);
    expect(state.lessons).toHaveLength(1); // only the good row landed
    expect(missing).toEqual(['999 / MÇ', '510 / ZZ']);
  });
});

describe('weeklyLoad', () => {
  it('öğretmen, sınıf ve derslik yükünü sayar', () => {
    let d = school();
    d = addClass(d, '511', d.rooms[0]!.id); // shares room A with 510
    const [a, b] = d.classes;
    const teacher = d.teachers[0]!.id;
    d = addLesson(d, { classId: a!.id, teacherId: teacher, weeklyHours: 4, blockSize: 1 });
    d = addLesson(d, { classId: b!.id, teacherId: teacher, weeklyHours: 3, blockSize: 1 });

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

describe('hourLabels', () => {
  it('liste verilmezse 1..n üretir ve 1-16 aralığına sıkıştırır', () => {
    expect(hourLabels(3)).toEqual(['1', '2', '3']);
    expect(hourLabels(0)).toEqual(['1']);
    expect(hourLabels(40)).toHaveLength(16);
  });

  it('virgüllü liste verilirse onu kullanır, boşlukları temizler', () => {
    expect(hourLabels(2, ' Sabah , Öğle ,, Akşam ')).toEqual(['Sabah', 'Öğle', 'Akşam']);
  });

  it('liste tamamen boşsa sayıya düşer', () => {
    expect(hourLabels(2, '   ')).toEqual(['1', '2']);
    expect(hourLabels(2, ' , , ')).toEqual(['1', '2']);
  });
});

// docs/PLAN.md pitfall 15: slice(0,3) turns both "Cuma" and "Cumartesi" into
// "Cum" and the day rows become indistinguishable. There was no test for this.
describe('shortDay', () => {
  it('yedi günün kısaltması benzersiz', () => {
    const shorts = WEEK.map(shortDay);
    expect(shorts).toEqual(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pzr']);
    expect(new Set(shorts).size).toBe(7);
  });

  it('Cuma ile Cumartesi ayrışır, Pazartesi ile Pazar ayrışır', () => {
    expect(shortDay('Cuma')).not.toBe(shortDay('Cumartesi'));
    expect(shortDay('Pazartesi')).not.toBe(shortDay('Pazar'));
  });

  it('bilinmeyen gün adı ilk üç harfe düşer, çökmez', () => {
    expect(shortDay('Bayram')).toBe('Bay');
    expect(shortDay('')).toBe('');
  });
});

describe('makeShort ve duplicateShorts', () => {
  it('boş kısaltma addan üretilir, dolu olan olduğu gibi kalır', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: '', subject: 'Matematik' });
    d = addTeacher(d, { name: 'İsmail Şahin', short: 'İSM', subject: 'Fizik' });
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
    d = addTeacher(d, { name: 'Ahmet Sarı', short: '', subject: 'Tarih' });
    d = addTeacher(d, { name: 'Ayşe Solmaz', short: '', subject: 'Kimya' });
    d = addTeacher(d, { name: 'Mehmet Çelik', short: '', subject: 'Matematik' });
    expect(d.teachers.map((t) => t.short)).toEqual(['AS', 'AS', 'MÇ']);
    expect(duplicateShorts(d.teachers)).toEqual([
      { short: 'AS', names: ['Ahmet Sarı', 'Ayşe Solmaz'] },
    ]);
  });

  it('büyük/küçük harf farkı çakışmayı gizlemez, boş kısaltma sayılmaz', () => {
    expect(
      duplicateShorts([
        { id: '1', name: 'A', short: 'mç', subject: '', color: 0, limits: NO_TEACHER_LIMITS },
        { id: '2', name: 'B', short: 'MÇ', subject: '', color: 1, limits: NO_TEACHER_LIMITS },
        { id: '3', name: 'C', short: '', subject: '', color: 2, limits: NO_TEACHER_LIMITS },
        { id: '4', name: 'D', short: '', subject: '', color: 3, limits: NO_TEACHER_LIMITS },
      ]),
    ).toEqual([{ short: 'MÇ', names: ['A', 'B'] }]);
  });
});

// The sentence decides whether he presses Enter or Escape, so it must COUNT
// what is lost, not guess at it.
describe('deletionSummary', () => {
  function loaded(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    const room = d.rooms[0]!.id;
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
    d = addClass(d, '510', room);
    d = addClass(d, '511', room);
    const teacher = d.teachers[0]!.id;
    const [a, b] = d.classes;
    d = addLesson(d, { classId: a!.id, teacherId: teacher, weeklyHours: 4, blockSize: 2 });
    d = addLesson(d, { classId: b!.id, teacherId: teacher, weeklyHours: 2, blockSize: 1 });
    // put the 2-hour block of the first lesson on the grid
    d = place(d, d.lessons[0]!.id, 0, 0);
    return d;
  }

  it('öğretmen: ders sayısını ve yerleşmiş saati sayar', () => {
    const d = loaded();
    expect(deletionSummary(d, 'teacher', d.teachers[0]!.id)).toBe(
      'MÇ (Mehmet Çelik) silinecek. 2 dersi ve programa yerleşmiş 2 saati de gidecek. ' +
        'Devam edilsin mi?',
    );
  });

  it('bağlısı yoksa kısa sorar — ama YİNE sorar', () => {
    let d = emptyState();
    d = addClass(d, '430', null);
    expect(deletionSummary(d, 'class', d.classes[0]!.id)).toBe(
      '430 sınıfı silinecek. Devam edilsin mi?',
    );
  });

  it('dersi var ama hiçbiri yerleşmemişse yerleşmiş saatten söz etmez', () => {
    const d = loaded();
    expect(deletionSummary(d, 'class', d.classes[1]!.id)).toBe(
      '511 sınıfı silinecek. 1 dersi de gidecek. Devam edilsin mi?',
    );
  });

  it('derslik: hangi sınıfların dersliğinin boşalacağını ADLARIYLA söyler', () => {
    const d = loaded();
    expect(deletionSummary(d, 'room', d.rooms[0]!.id)).toBe(
      'A dersliği silinecek. 2 sınıfın dersliği boşalacak (510, 511) ve derslik ' +
        'çakışması artık kontrol edilmeyecek. Devam edilsin mi?',
    );
  });

  it('derslik boşsa çakışma cümlesini kurmaz', () => {
    let d = emptyState();
    d = addRoom(d, 'B');
    expect(deletionSummary(d, 'room', d.rooms[0]!.id)).toBe(
      'B dersliği silinecek. Devam edilsin mi?',
    );
  });

  it('ders: yerleşmiş saat varsa onu, yoksa haftalık saati söyler', () => {
    const d = loaded();
    expect(deletionSummary(d, 'lesson', d.lessons[0]!.id)).toBe(
      '510 sınıfının MÇ dersi silinecek. Programa yerleşmiş 2 saati de kalkacak. ' +
        'Devam edilsin mi?',
    );
    expect(deletionSummary(d, 'lesson', d.lessons[1]!.id)).toBe(
      '511 sınıfının MÇ dersi silinecek (2 saat). Devam edilsin mi?',
    );
  });

  it('olmayan kimlikte çökmez', () => {
    const d = loaded();
    for (const kind of ['room', 'teacher', 'class', 'lesson'] as const) {
      expect(deletionSummary(d, kind, 'yok')).toContain('Devam edilsin mi?');
    }
  });
});

describe('subjectShort', () => {
  const blank = emptyState();

  it('gömülü tablodan gelir', () => {
    expect(subjectShort(blank.settings, 'Matematik')).toBe('Mat');
    expect(subjectShort(blank.settings, 'İngilizce')).toBe('İng');
    expect(subjectShort(blank.settings, 'Beden Eğitimi')).toBe('Bed');
  });

  it('büyük/küçük harf ve boşluk fark etmez', () => {
    expect(subjectShort(blank.settings, '  matematik ')).toBe('Mat');
    expect(subjectShort(blank.settings, 'MATEMATİK')).toBe('Mat');
  });

  it('bilinmeyen branş ilk üç harfe düşer, Türkçe büyük harfle', () => {
    expect(subjectShort(blank.settings, 'Astronomi')).toBe('Ast');
    expect(subjectShort(blank.settings, 'ispanyolca')).toBe('İsp');
    expect(subjectShort(blank.settings, 'Şu')).toBe('Şu');
    expect(subjectShort(blank.settings, '')).toBe('');
  });

  it('override gömülü tabloyu ezer', () => {
    const d = setSubjectShort(blank, 'Matematik', 'Mtk');
    expect(subjectShort(d.settings, 'Matematik')).toBe('Mtk');
    expect(subjectShort(d.settings, 'matematik')).toBe('Mtk');
  });
});

describe('setSubjectShort', () => {
  it('YALNIZCA değiştirileni saklar — yedek dosyası şişmesin', () => {
    let d = emptyState();
    d = setSubjectShort(d, 'Matematik', 'Mat'); // the default: nothing to store
    expect(d.settings.subjectShorts).toEqual({});

    d = setSubjectShort(d, 'Matematik', 'Mtk');
    expect(d.settings.subjectShorts).toEqual({ matematik: 'Mtk' });
  });

  it('varsayılana geri yazılınca override silinir', () => {
    let d = setSubjectShort(emptyState(), 'Fizik', 'Fiz');
    expect(d.settings.subjectShorts).toEqual({ fizik: 'Fiz' });
    d = setSubjectShort(d, 'Fizik', 'Fzk');
    expect(d.settings.subjectShorts).toEqual({});
  });

  it('boş bırakmak override siler, varsayılana döner', () => {
    let d = setSubjectShort(emptyState(), 'Kimya', 'KMY');
    d = setSubjectShort(d, 'Kimya', '   ');
    expect(d.settings.subjectShorts).toEqual({});
    expect(subjectShort(d.settings, 'Kimya')).toBe('Kim');
  });

  it('gömülü tablodaki her kısaltma kendi varsayılanıdır', () => {
    for (const [subject, short] of Object.entries(DEFAULT_SUBJECT_SHORTS)) {
      expect(defaultSubjectShort(subject)).toBe(short);
    }
  });
});

describe('usedSubjects', () => {
  it('öğretmenlerde geçen benzersiz branşları sırasıyla verir', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'A A', short: '', subject: 'Matematik' });
    d = addTeacher(d, { name: 'B B', short: '', subject: 'Fizik' });
    d = addTeacher(d, { name: 'C C', short: '', subject: 'matematik' });
    d = addTeacher(d, { name: 'D D', short: '', subject: '  ' });
    expect(usedSubjects(d)).toEqual(['Matematik', 'Fizik']);
  });
});

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
    d = addTeacher(d, { name: 'A A', short: '', subject: 'Matematik' });
    d = addTeacher(d, { name: 'B B', short: '', subject: 'Fizik' });
    d = addTeacher(d, { name: 'C C', short: '', subject: 'Kimya' });
    const middle = d.teachers[1]!;
    expect(middle.color).toBe(1);

    d = deleteTeacher(d, middle.id);
    d = addTeacher(d, { name: 'D D', short: '', subject: 'Tarih' });
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
    d = addTeacher(d, { name: 'A A', short: '', subject: 'Matematik' });
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

describe('branş listesi', () => {
  it('varsayılan listeyle geliyor', () => {
    expect(emptyState().settings.subjects).toContain('Matematik');
    expect(emptyState().settings.subjects.length).toBeGreaterThan(15);
  });

  it('yeni branş ekleniyor, aynısı iki kez eklenmiyor', () => {
    let d = emptyState();
    const before = d.settings.subjects.length;
    d = addSubject(d, ' Robotik ');
    expect(d.settings.subjects).toContain('Robotik');
    expect(d.settings.subjects.length).toBe(before + 1);

    // case-folded duplicate and blank are both refused
    d = addSubject(d, 'robotik');
    d = addSubject(d, '   ');
    expect(d.settings.subjects.length).toBe(before + 1);
  });

  it('silinen branş listeden çıkıyor ama öğretmenin branşına dokunulmuyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
    d = deleteSubject(d, 'Matematik');
    expect(d.settings.subjects).not.toContain('Matematik');
    expect(d.teachers[0]!.subject).toBe('Matematik'); // NEVER a side effect
  });

  it('subjectTeachers kimin kullandığını söylüyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
    d = addTeacher(d, { name: 'Ayşe Yıldız', short: 'AY', subject: 'matematik' });
    d = addTeacher(d, { name: 'Sema Kaya', short: 'SK', subject: 'Fizik' });
    expect(subjectTeachers(d, 'Matematik').map((t) => t.short)).toEqual(['MÇ', 'AY']);
    expect(subjectTeachers(d, 'Kimya')).toEqual([]);
  });

  it('listede olmayan bir branşı taşıyan öğretmen açılır listede yine görünüyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Robotik' });
    expect(d.settings.subjects).not.toContain('Robotik');
    // otherwise the dropdown could not show his current subject and would
    // silently change it on the first render
    expect(subjectOptions(d)).toContain('Robotik');
  });
});
