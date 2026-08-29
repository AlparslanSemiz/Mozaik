// remapDays is the guard against the worst kind of bug this tool can have:
// silently moving a finished timetable one day earlier.
//
// Placement keys hold the day INDEX. When Monday is unticked, Tuesday moves
// from index 1 to index 0 — without remapping, every lesson would appear to
// have been taught a day earlier and nobody would notice (docs/PLAN.md 14).

import { buildIndex, place, placementKey, teacherKey } from './constraints';
import { lessonSubject } from './subjects';
import {
  addClass,
  addSubject,
  addTeachersFromRows,
  addClassesFromRows,
  addLesson,
  addLessonsFromRows,
  addRoom,
  addTeacher,
  DEFAULT_SUBJECT_SHORTS,
  defaultSubjectShort,
  deleteSubject,
  deleteTeacher,
  deletionQuestion,
  entityFacts,
  entityWeek,
  genderLabel,
  parseGender,
  reorderList,
  deletionSummary,
  duplicateShorts,
  setSubjectShort,
  respreadColors,
  renameSubject,
  subjectKey,
  transferLesson,
  subjectOptions,
  subjectRank,
  teacherRank,
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
  defaultSubjects,
  emptyState,
  makeDay,
  openHours,
  remapDays,
  setAvailability,
  setWholeWeek,
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
        subject2: '',
        gender: '',
        color: 0,
        limits: { ...NO_TEACHER_LIMITS },
      },
    ],
    classes: [{ id: 's510', name: '510', roomId: null, color: 0 }],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blocks: [], second: false, maxPerDay: null },
    ],
    unavailable: { [teacherKey('oMC', 2, 3)]: 1 },
    placements: {
      [placementKey('s510', 0, 0)]: 'x1', // Pazartesi
      [placementKey('s510', 1, 1)]: 'x1', // Salı
      [placementKey('s510', 2, 2)]: 'x1', // Çarşamba
    },
    // One of the three is PINNED, so `remapDays` has something to carry: pins
    // are keyed by day index exactly like placements, and a pin left behind
    // would lock a cell the lesson had moved out of.
    pinned: { [placementKey('s510', 1, 1)]: 1 },
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
  d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
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
describe('deletionSummary', () => {
  function loaded(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    const room = d.rooms[0]!.id;
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addClass(d, '510', room);
    d = addClass(d, '511', room);
    const teacher = d.teachers[0]!.id;
    const [a, b] = d.classes;
    d = addLesson(d, { classId: a!.id, teacherId: teacher, weeklyHours: 4, blocks: [2, 2] });
    d = addLesson(d, { classId: b!.id, teacherId: teacher, weeklyHours: 2, blocks: [] });
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

  // The dialog wants the two halves separately: a heading and a cost line.
  // Splitting the sentence back apart by looking for a full stop would be
  // pitfall 22 again, so the split is made where the halves are written — and
  // the one-string form has to stay EXACTLY what it was, or every existing
  // assertion above is lying about what the user reads.
  it('iki parça, birleştirilince eski cümlenin TA KENDİSİ', () => {
    const d = loaded();
    for (const [kind, id] of [
      ['teacher', d.teachers[0]!.id],
      ['class', d.classes[0]!.id],
      ['class', d.classes[1]!.id],
      ['room', d.rooms[0]!.id],
      ['lesson', d.lessons[0]!.id],
      ['lesson', d.lessons[1]!.id],
      ['room', 'yok'],
    ] as const) {
      const q = deletionQuestion(d, kind, id);
      const joined = `${q.title}. ${q.cost === '' ? '' : `${q.cost} `}Devam edilsin mi?`;
      expect(joined).toBe(deletionSummary(d, kind, id));
      // A heading is a heading: no trailing stop, no question.
      expect(q.title.endsWith('.')).toBe(false);
      expect(q.title).not.toContain('Devam edilsin mi');
      // ...and a cost line, when there is one, is a whole sentence.
      if (q.cost !== '') expect(q.cost.endsWith('.')).toBe(true);
    }
  });

  it('bedeli olmayan silmede cost BOŞ, uydurulmuş bir cümle değil', () => {
    let d = emptyState();
    d = addRoom(d, 'B');
    expect(deletionQuestion(d, 'room', d.rooms[0]!.id)).toEqual({
      title: 'B dersliği silinecek',
      cost: '',
    });
  });
});

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
    expect(Object.values(state.placements).filter((x) => x === moved)).toHaveLength(0);
    // ...and the receiving teacher is in exactly one place at a time.
    const ix = buildIndex(state);
    for (let h = 0; h < 2; h++) {
      const at = Object.entries(state.placements).filter(([key]) => key.endsWith(`|0|${h}`));
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
    expect(state.placements[placementKey(d.classes[0]!.id, 0, 0)]).toBe(d.lessons[0]!.id);
    expect(state.placements[placementKey(d.classes[0]!.id, 1, 0)]).toBe(d.lessons[0]!.id);
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

describe('renameSubject', () => {
  function withSubjects(): State {
    let d = emptyState();
    d = addSubject(d, 'Matematik');
    d = addSubject(d, 'Fizik');
    d = addSubject(d, 'Edebiyat');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: 'Fizik', gender: '' });
    d = addTeacher(d, { name: 'Ayşe Var', short: 'AV', subject: 'Fizik', subject2: '', gender: '' });
    return d;
  }

  it('listede YERİNDE değişiyor — sıra bozulmuyor', () => {
    const d = renameSubject(withSubjects(), 'Fizik', 'Fizik ve Astronomi');
    expect(d.settings.subjects).toEqual(['Matematik', 'Fizik ve Astronomi', 'Edebiyat']);
  });

  // The cascade `deleteSubject` deliberately refuses to do. `Teacher.subject`
  // is a NAME, so a rename that stopped at the list would leave every teacher
  // holding a branch that is no longer on it.
  it('öğretmenlerin İKİ alanını da takip ediyor', () => {
    const d = renameSubject(withSubjects(), 'Fizik', 'Fizik ve Astronomi');
    expect(d.teachers[0]!.subject).toBe('Matematik');
    expect(d.teachers[0]!.subject2).toBe('Fizik ve Astronomi');
    expect(d.teachers[1]!.subject).toBe('Fizik ve Astronomi');
  });

  it('kısaltma OVERRIDE’ı yeni ada taşınıyor', () => {
    let d = setSubjectShort(withSubjects(), 'Fizik', 'Fz');
    expect(d.settings.subjectShorts[subjectKey('Fizik')]).toBe('Fz');

    d = renameSubject(d, 'Fizik', 'Fizik ve Astronomi');
    expect(d.settings.subjectShorts[subjectKey('Fizik')]).toBeUndefined();
    expect(subjectShort(d.settings, 'Fizik ve Astronomi')).toBe('Fz');
  });

  // The stored value is re-judged against the NEW name's default. "Fzk" is a
  // real override on "Uzay" (whose default is "Uza") and is exactly what the
  // built-in table already says for "Fizik", so the record has to disappear —
  // while the short form ON SCREEN does not move. Left unjudged the backup
  // would carry a row that says nothing, which is the whole reason
  // `subjectShorts` stores only what was changed.
  it('yeni adın varsayılanına eşit KALAN override siliniyor', () => {
    let d = emptyState();
    d = addSubject(d, 'Uzay');
    d = setSubjectShort(d, 'Uzay', 'Fzk');
    expect(d.settings.subjectShorts[subjectKey('Uzay')]).toBe('Fzk');

    d = renameSubject(d, 'Uzay', 'Fizik');
    expect(d.settings.subjectShorts[subjectKey('Fizik')]).toBeUndefined();
    expect(subjectShort(d.settings, 'Fizik')).toBe('Fzk');
  });

  // …and the mirror: a value that was redundant before the rename becomes a
  // real override after it, so the record has to APPEAR.
  it('yeni adın varsayılanından AYRILAN kısaltma override oluyor', () => {
    let d = emptyState();
    d = addSubject(d, 'Fizik');
    d = setSubjectShort(d, 'Fizik', 'Fzk'); // the default: nothing is stored
    expect(d.settings.subjectShorts[subjectKey('Fizik')]).toBeUndefined();

    d = renameSubject(d, 'Fizik', 'Uzay');
    // Nothing was carried, so the short form now follows the NEW name.
    expect(subjectShort(d.settings, 'Uzay')).toBe('Uza');
  });

  it('boş ada ve BAŞKA bir branşın adına çevirmiyor', () => {
    const before = withSubjects();
    expect(renameSubject(before, 'Fizik', '   ')).toBe(before);
    expect(renameSubject(before, 'Fizik', 'Edebiyat')).toBe(before);
    expect(renameSubject(before, 'Fizik', 'edebiyat')).toBe(before);
  });

  it('yalnız büyük/küçük harfi değiştirmek SERBEST', () => {
    const d = renameSubject(withSubjects(), 'Fizik', 'FİZİK');
    expect(d.settings.subjects).toContain('FİZİK');
    expect(d.teachers[1]!.subject).toBe('FİZİK');
  });

  // Renaming one of a teacher's two branches ONTO the other would collapse
  // them: `teacherSubjects()` dedupes, `hasTwoSubjects` goes false, and every
  // `Lesson.second` on that teacher becomes an orphan. It is refused instead —
  // and refused by the ordinary collision check, because `subjectOptions()`
  // covers what teachers hold as well as what the list says.
  it('bir hocanın ÖTEKİ branşının adına çevirmiyor — ders sessizce branş değiştirmez', () => {
    let d = withSubjects();
    d = addRoom(d, 'A');
    d = addClass(d, '510', d.rooms[0]!.id);
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 4,
      blocks: [],
      second: true,
    });

    const before = d;
    expect(renameSubject(d, 'Fizik', 'Matematik')).toBe(before);
    expect(before.lessons[0]!.second).toBe(true);
  });

  // Even a name nobody put on the list: a teacher carrying a stray branch is
  // still carrying it, and a rename onto it would merge two real things.
  it('yalnız bir öğretmende duran "listede olmayan" ada da çevirmiyor', () => {
    let d = emptyState();
    d = addSubject(d, 'Uzay');
    d = addTeacher(d, { name: 'A B', short: 'AB', subject: 'Kayıp Branş', subject2: '', gender: '' });
    expect(renameSubject(d, 'Uzay', 'Kayıp Branş')).toBe(d);
  });

  it('listede olmayan bir adı yeniden adlandırmak hiçbir şeyi bozmuyor', () => {
    const before = withSubjects();
    const after = renameSubject(before, 'Yokoluş', 'Bir şey');
    expect(after.settings.subjects).toEqual(before.settings.subjects);
    expect(after.teachers).toEqual(before.teachers);
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


  // Two different facts that used to be one. `defaultSubjects()` is the
  // BUILT-IN table — what a pre-v5 backup falls back to, and what the Branşlar
  // step offers on the side. `emptyState()` is what a NEW project starts with,
  // and it starts with nothing, so that offer is not empty on the one screen
  // it matters. Asserting both here so neither can quietly become the other.
  it('yeni proje BOŞ branş listesiyle doğuyor, gömülü tablo ise duruyor', () => {
    expect(emptyState().settings.subjects).toEqual([]);
    expect(defaultSubjects()).toHaveLength(21);
    expect(defaultSubjects()).toContain('Matematik');
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
    d = addTeacher(d, { name: 'A A', short: '', subject: 'Matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'B B', short: '', subject: 'Fizik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'C C', short: '', subject: 'matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'D D', short: '', subject: '  ', subject2: '', gender: '' });
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

describe('branş listesi', () => {
  // Was "varsayılan listeyle geliyor" and asserted the opposite. A new project
  // starts EMPTY on purpose now; the built-in table is what the Branşlar step
  // offers beside the list, and a project that already held all 21 made that
  // offer read "Hazır branşlar (0)" on the one screen it is for.
  it('yeni proje BOŞ geliyor — gömülü tablo bir TEKLİF, varsayılan değil', () => {
    expect(emptyState().settings.subjects).toEqual([]);
    expect(defaultSubjects()).toContain('Matematik');
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
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = deleteSubject(d, 'Matematik');
    expect(d.settings.subjects).not.toContain('Matematik');
    expect(d.teachers[0]!.subject).toBe('Matematik'); // NEVER a side effect
  });

  it('subjectTeachers kimin kullandığını söylüyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'Ayşe Yıldız', short: 'AY', subject: 'matematik', subject2: '', gender: '' });
    d = addTeacher(d, { name: 'Sema Kaya', short: 'SK', subject: 'Fizik', subject2: '', gender: '' });
    expect(subjectTeachers(d, 'Matematik').map((t) => t.short)).toEqual(['MÇ', 'AY']);
    expect(subjectTeachers(d, 'Kimya')).toEqual([]);
  });

  it('listede olmayan bir branşı taşıyan öğretmen açılır listede yine görünüyor', () => {
    let d = emptyState();
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Robotik', subject2: '', gender: '' });
    expect(d.settings.subjects).not.toContain('Robotik');
    // otherwise the dropdown could not show his current subject and would
    // silently change it on the first render
    expect(subjectOptions(d)).toContain('Robotik');
  });
});

describe('subjectRank ve teacherRank', () => {
  const teacher = (subject: string, subject2 = '') => ({
    id: 't', name: 'Ad Soyad', short: 'AS', subject, subject2,
    gender: '' as const, color: 0,
    limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
  });

  it('sıra AYARLARDAKİ listeden geliyor, alfabeden değil', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Zooloji', 'Almanca', 'Matematik'] } };
    const rank = subjectRank(d);
    expect(rank.get('zooloji')).toBe(0);
    expect(rank.get('almanca')).toBe(1);
    expect(rank.get('matematik')).toBe(2);
  });

  it('büyük/küçük harf aynı branştır', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Matematik'] } };
    expect(subjectRank(d).get(subjectKey('MATEMATİK'))).toBe(0);
  });

  it('listede olmayan branş listenin ARDINDAN geliyor', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Matematik'] } };
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Robotik', subject2: '', gender: '' });
    const rank = subjectRank(d);
    expect(rank.get('matematik')).toBe(0);
    expect(rank.get('robotik')).toBe(1);
  });

  it('çift branşlı hoca İKİ branşının ÖNDE olanına göre sıralanıyor', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Edebiyat', 'Matematik', 'Türkçe'] } };
    const rank = subjectRank(d);
    // Türkçe is last in the list, Edebiyat first: the pair ranks with Edebiyat.
    expect(teacherRank(rank, teacher('Türkçe', 'Edebiyat'))).toBe(0);
    expect(teacherRank(rank, teacher('Türkçe'))).toBe(2);
  });

  it('branşsız öğretmen SONA düşüyor', () => {
    let d = emptyState();
    d = { ...d, settings: { ...d.settings, subjects: ['Matematik'] } };
    const rank = subjectRank(d);
    expect(teacherRank(rank, teacher(''))).toBeGreaterThan(teacherRank(rank, teacher('Matematik')));
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

describe('openHours', () => {
  // 3 days x 4 hours = 12 cells; build() already closes one for MÇ.
  it('kapalı saat sayısı düşülmüş hâlde döner', () => {
    const d = build();
    expect(openHours(d, 'oMC')).toBe(11);
  });

  it('her kapatılan saat bir düşürür ve yalnız o varlığı etkiler', () => {
    const d = setAvailability(build(), 'oMC', [{ day: 0, hour: 0 }, { day: 1, hour: 3 }], true);
    expect(openHours(d, 'oMC')).toBe(9);
    expect(openHours(d, 's510')).toBe(12); // the class was never touched
  });

  it('sınıf ve derslik de aynı sözlüğü paylaşıyor', () => {
    const d = setWholeWeek(build(), 's510', true);
    expect(openHours(d, 's510')).toBe(0);
    expect(openHours(d, 'oMC')).toBe(11);
  });

  it('tanınmayan id için haftanın tamamı açık görünür', () => {
    expect(openHours(build(), 'yok')).toBe(12);
  });
});

// ---------------------------------------------------------------------------
// One entity, on its own. The reader asked for it in one sentence: "her
// derslik, sınıf ya da öğretmenin üzerine tıklandığında bilgileri ve
// programının gözükmesi". The information already existed and was spread over
// four tabs; these two functions are what put it together.

describe('entityWeek', () => {
  function school(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    const room = d.rooms[0]!.id;
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addClass(d, '510', room);
    const teacher = d.teachers[0]!.id;
    const group = d.classes[0]!.id;
    d = addLesson(d, { classId: group, teacherId: teacher, weeklyHours: 4, blocks: [2, 2] });
    d = place(d, d.lessons[0]!.id, 0, 0); // Salı, 1-2. ders
    return d;
  }

  it('satır = GÜN, sütun = ders — müsaitlik ve kâğıtla aynı eksende', () => {
    const d = school();
    const week = entityWeek(d, 'teacher', d.teachers[0]!.id);
    expect(week).toHaveLength(d.settings.days.length);
    expect(week[0]).toHaveLength(d.settings.hours.length);
  });

  it('öğretmenin haftası HANGİ SINIF olduğunu yazar, altında dersliği', () => {
    const d = school();
    const week = entityWeek(d, 'teacher', d.teachers[0]!.id);
    expect(week[0]![0]).toEqual({
      top: '510',
      bottom: 'A',
      color: 0,
      closed: false,
      conflict: false,
    });
    // The block is two hours long and both of them are drawn.
    expect(week[0]![1]!.top).toBe('510');
    // ...and the third hour is free, not "empty-looking".
    expect(week[0]![2]).toEqual({
      top: '',
      bottom: '',
      color: null,
      closed: false,
      conflict: false,
    });
  });

  it('sınıfın haftası HANGİ ÖĞRETMEN olduğunu yazar, altında branşı', () => {
    const d = school();
    const week = entityWeek(d, 'class', d.classes[0]!.id);
    expect(week[0]![0]!.top).toBe('MÇ');
    expect(week[0]![0]!.bottom).toBe('Mat');
    // Colour is the TEACHER's, in every view — the same rule the grid follows.
    expect(week[0]![0]!.color).toBe(0);
  });

  it('dersliğin haftası onu KULLANAN sınıfı yazar', () => {
    const d = school();
    const week = entityWeek(d, 'room', d.rooms[0]!.id);
    expect(week[0]![0]!.top).toBe('510');
    expect(week[0]![0]!.bottom).toBe('MÇ');
  });

  it('sonradan kapatılan saatteki ders SİLİNMİYOR, çakışma olarak işaretleniyor', () => {
    // Pitfall 16, seen from the panel: the lesson stays (principle 6) and the
    // panel has to be the second place that says so.
    let d = school();
    d = setAvailability(d, d.teachers[0]!.id, [{ day: 0, hour: 0 }], true);
    const cell = entityWeek(d, 'teacher', d.teachers[0]!.id)[0]![0]!;
    expect(cell.top).toBe('510');
    expect(cell.closed).toBe(true);
    expect(cell.conflict).toBe(true);
  });

  it('boş bir okulda çökmez', () => {
    const d = emptyState();
    expect(entityWeek(d, 'teacher', 'yok')).toHaveLength(d.settings.days.length);
  });
});

describe('entityFacts', () => {
  function school(): State {
    let d = emptyState();
    d = addRoom(d, 'A');
    const room = d.rooms[0]!.id;
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '' });
    d = addClass(d, '510', room);
    d = addClass(d, '511', room);
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 4, blocks: [2, 2],
    });
    return place(d, d.lessons[0]!.id, 0, 0);
  }

  it('öğretmen: branşı, dersleri ve yerleşmiş saati SAYAR', () => {
    const d = school();
    const facts = entityFacts(d, 'teacher', d.teachers[0]!.id)!;
    expect(facts.short).toBe('MÇ');
    expect(facts.name).toBe('Mehmet Çelik');
    expect(facts.color).toBe(0);
    expect(facts.links[0]).toBe('Branşı: Matematik');
    expect(facts.links[1]).toContain('1 dersi var');
    expect(facts.links[1]).toContain('510');
    const placed = facts.rows.find((r) => r.label === 'Programa yerleşmiş')!;
    expect(placed.value).toBe('2 / 4 saat');
    // Half the lesson is still in the pool, and that is worth flagging where
    // the number is read rather than only in Kontrol.
    expect(placed.tight).toBe(true);
  });

  it('yük açık saatten fazlaysa DAR işaretleniyor', () => {
    let d = school();
    // Close the whole week for the teacher: 0 open hours against 4 of load.
    d = setWholeWeek(d, d.teachers[0]!.id, true);
    const facts = entityFacts(d, 'teacher', d.teachers[0]!.id)!;
    expect(facts.rows.find((r) => r.label === 'Haftalık ders yükü')!.tight).toBe(true);
    expect(facts.rows.find((r) => r.label === 'Açık saat')!.value).toBe(
      `0 / ${d.settings.days.length * d.settings.hours.length}`,
    );
  });

  it('derslik: kaç sınıfın paylaştığını ADLARIYLA söyler ve rengi YOK', () => {
    const d = school();
    const facts = entityFacts(d, 'room', d.rooms[0]!.id)!;
    expect(facts.color).toBeNull();
    expect(facts.links[0]).toBe('2 sınıf paylaşıyor: 510, 511');
  });

  it('dersi olmayan sınıf bunu açıkça söyler', () => {
    const d = school();
    const facts = entityFacts(d, 'class', d.classes[1]!.id)!;
    expect(facts.name).toBe('511 sınıfı');
    expect(facts.links[1]).toBe('Henüz dersi yok');
  });

  it('olmayan kimlikte null döner, çökmez', () => {
    const d = school();
    for (const kind of ['teacher', 'class', 'room'] as const) {
      expect(entityFacts(d, kind, 'yok')).toBeNull();
    }
  });
});

describe('parseGender', () => {
  it('kadını dört yazımdan da tanıyor', () => {
    for (const raw of ['K', 'k', 'Kadın', 'kadın', 'KADIN', 'kadin', ' Kadın ', 'Bayan']) {
      expect(parseGender(raw), raw).toBe('k');
    }
  });

  it('erkeği de', () => {
    for (const raw of ['E', 'e', 'Erkek', 'ERKEK', ' erkek', 'Bay']) {
      expect(parseGender(raw), raw).toBe('e');
    }
  });

  // Anything unrecognised is "not stated" rather than an error: a paste that
  // half-fills the column is still a good paste, and the reader can finish it
  // in the list. An error here would reject 25 rows over one typo.
  it('tanımadığı her şey BELİRTİLMEMİŞ, hata değil', () => {
    for (const raw of ['', '   ', 'x', 'kadn', 'male', '1', 'Kadın Erkek']) {
      expect(parseGender(raw), raw).toBe('');
    }
  });

  it('her değerin okunacak bir adı var', () => {
    expect(genderLabel('')).toBe('Belirtilmemiş');
    expect(genderLabel('k')).toBe('Kadın');
    expect(genderLabel('e')).toBe('Erkek');
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
    expect(moved.placements).toEqual(d.placements);
    expect(moved.unavailable).toEqual(d.unavailable);
    expect(moved.lessons).toEqual(d.lessons);
    expect(moved.classes).toEqual(d.classes);
    expect(moved.settings).toEqual(d.settings);
    // The teachers themselves are untouched objects, only re-ordered.
    expect(moved.teachers).toEqual([d.teachers[1], d.teachers[0]]);
  });
});
