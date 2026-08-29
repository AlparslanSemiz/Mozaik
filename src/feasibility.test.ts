import { describe, expect, it } from 'vitest';
import { buildCapacity, buildReport, commonestBlock, health } from './feasibility';
import { place } from './constraints';
import {
  addClass,
  addLesson,
  addRoom,
  addTeacher,
  emptyState,
  setAvailability,
  setWholeWeek,
} from './entities';
import { buildIndex } from './constraints';
import { teacherKey } from './constraints';
import { DEFAULT_BELL, DEFAULT_LIMITS, DEFAULT_RULES, NO_TEACHER_LIMITS } from './entities';
import type { State } from './types';
import { SCHEMA_VERSION } from './types';

// 1 day x 4 hours = 4 slots. Small numbers keep the arithmetic verifiable by hand.
function build(): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: '',
      days: [{ name: 'Pazartesi', longBreakAfter: 0 }],
      hours: ['1', '2', '3', '4'],
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS },
      rules: { ...DEFAULT_RULES },
      subjects: [],
      subjectShorts: {},
    },
    rooms: [{ id: 'dA', name: 'A' }],
    teachers: [{ id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '', color: 0, limits: { ...NO_TEACHER_LIMITS } }],
    classes: [
      { id: 's510', name: '510', roomId: 'dA', color: 0 },
      { id: 's511', name: '511', roomId: 'dA', color: 1 },
    ],
    lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blocks: [], second: false, maxPerDay: null }],
    unavailable: {},
    placements: {},
  };
}

describe('buildReport — öğretmen yükü', () => {
  it('yük müsaitliği aşarsa kaç saat fazla olduğunu söyler', () => {
    const d = build();
    d.unavailable[teacherKey('oMC', 0, 0)] = 1;
    d.unavailable[teacherKey('oMC', 0, 1)] = 1;
    d.unavailable[teacherKey('oMC', 0, 2)] = 1; // 4 - 3 = 1 hour free, 2 hours of load

    const row = buildReport(d).teachers[0]!;
    expect(row.level).toBe('impossible');
    expect(row.capacity).toBe(1);
    expect(row.load).toBe(2);
    expect(row.message).toContain('1 saat fazla');
  });

  it('yük müsaitliğin %85 üstündeyse sıkışık der', () => {
    const d = build();
    d.unavailable[teacherKey('oMC', 0, 0)] = 1;
    d.unavailable[teacherKey('oMC', 0, 1)] = 1; // 2 hours free, 2 hours load -> exactly full
    expect(buildReport(d).teachers[0]!.level).toBe('tight');
  });

  it('bol müsaitlikte sorun görmez', () => {
    expect(buildReport(build()).teachers[0]!.level).toBe('ok');
    expect(buildReport(build()).hasProblem).toBe(false);
  });
});

describe('buildReport — derslik darboğazı', () => {
  it('dersliği paylaşan sınıfların toplam yükünü kapasiteyle karşılaştırır', () => {
    const d = build();
    // Room A is shared by 510 and 511. Total 3 + 2 = 5 hours, capacity 4.
    d.teachers.push({ id: 'oAV', name: 'Ayşe Var', short: 'AV', subject: 'Fizik', subject2: '', gender: '', color: 1, limits: { ...NO_TEACHER_LIMITS } });
    d.lessons.push({ id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 3, blocks: [], second: false, maxPerDay: null });

    const room = buildReport(d).rooms[0]!;
    expect(room.load).toBe(5);
    expect(room.level).toBe('impossible');
    expect(room.message).toContain('2 sınıf paylaşıyor');
    expect(room.message).toContain('1 saat fazla');
  });
});

describe('buildReport — sınıf yükü', () => {
  it('sınıfa haftalık slottan fazla ders yüklenmişse söyler', () => {
    const d = build();
    d.lessons = [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6, blocks: [], second: false, maxPerDay: null }];
    const group = buildReport(d).classes.find((c) => c.id === 's510')!;
    expect(group.level).toBe('impossible');
    expect(group.message).toContain('2 saat fazla');
  });
});

describe('buildReport — yerleşemeyenler', () => {
  it('geçerli slotu kalmamış dersi en sık sebeple bildirir', () => {
    const d = build();
    // MÇ is closed all week -> x1 cannot go anywhere.
    for (let s = 0; s < 4; s++) d.unavailable[teacherKey('oMC', 0, s)] = 1;

    const report = buildReport(d);
    expect(report.unplaceable).toHaveLength(1);
    expect(report.unplaceable[0]!.missing).toBe(2);
    expect(report.unplaceable[0]!.message).toContain('müsait değil');
    expect(report.hasProblem).toBe(true);
  });

  it('yeri olan dersi yerleşemeyen saymaz', () => {
    expect(buildReport(build()).unplaceable).toHaveLength(0);
  });

  it('tamamı yerleşmiş dersi yerleşemeyen saymaz', () => {
    const d = build();
    d.placements['s510|0|0'] = 'x1';
    d.placements['s510|0|1'] = 'x1';
    expect(buildReport(d).unplaceable).toHaveLength(0);
  });
});

// buildCapacity is the half of the report that the setup screens show next to
// the list you are typing into: it must give the SAME rows as buildReport, and
// it must not do buildReport's expensive half.
describe('buildCapacity', () => {
  it('buildReport ile birebir aynı satırları veriyor', () => {
    const d = build();
    const cheap = buildCapacity(d);
    const full = buildReport(d);
    expect(cheap.teachers).toEqual(full.teachers);
    expect(cheap.classes).toEqual(full.classes);
    expect(cheap.rooms).toEqual(full.rooms);
  });

  it('yerleşmeyen ders hesabını YAPMIYOR — pahalı yarısı burada yok', () => {
    const cheap = buildCapacity(build());
    expect(Object.keys(cheap).sort()).toEqual(['classes', 'rooms', 'teachers']);
  });

  it('kapalı saatler kapasiteden düşülüyor', () => {
    const d = build();
    d.unavailable[teacherKey('oMC', 0, 0)] = 1;
    const row = buildCapacity(d).teachers.find((x) => x.id === 'oMC')!;
    expect(row.capacity).toBe(3);
  });
});

// The reason has to be the one that EXPLAINS, not the one that happens to be
// most repeated as a sentence. Grouping by code is what makes that true: a full
// class produces a different sentence per cell, an absent teacher one per cell
// too — counting sentences would score both at 1 and let a rarer cause win.
describe('commonestBlock', () => {
  it('yeri olan ders için anyValid', () => {
    const d = build();
    expect(commonestBlock(d, buildIndex(d), 'x1').anyValid).toBe(true);
  });

  it('hafta boyu kapalı öğretmen tek cümleyle anlatılıyor', () => {
    const d = build();
    for (let h = 0; h < 4; h++) d.unavailable[`oMC|0|${h}`] = 1;

    const found = commonestBlock(d, buildIndex(d), 'x1');
    expect(found.anyValid).toBe(false);
    expect(found.reason).toContain('müsait değil');
  });

  it('stopAtFirstValid erken çıkıyor ama cevabı değiştirmiyor', () => {
    const d = build();
    const ix = buildIndex(d);
    expect(commonestBlock(d, ix, 'x1', true).anyValid).toBe(
      commonestBlock(d, ix, 'x1', false).anyValid,
    );
  });
});

// ---------------------------------------------------------------------------
// The health chip's one line. It is on screen in every tab, so it has to be
// right in every tab — and it has to name the problem rather than announce
// that there is one.

describe('health', () => {
  it('boş proje "sorun yok" DEMİYOR — başlanmadı diyor', () => {
    // "Sorun yok" on a project somebody has just opened for the first time is
    // the chip saying nothing on the one screen where it could say something.
    const h = health(emptyState());
    expect(h.level).toBe('ok');
    expect(h.message).toBe('Henüz ders girilmedi');
    expect(h).toMatchObject({ blocked: 0, warnings: 0, pending: 0, stranded: 0 });
  });

  it('dizilmemiş ders "havuzda" olarak SAYILIYOR ama sorun değil', () => {
    let d = emptyState();
    d = addRoom(d, 'A');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
    d = addClass(d, '510', d.rooms[0]!.id);
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 4, blocks: [],
    });

    const h = health(d);
    expect(h.pending).toBe(4);
    expect(h.message).toContain('4 saat havuzda');
    // Nothing is WRONG with a timetable that has not been laid out yet.
    expect(h.level).toBe('ok');
  });

  it('kapalı saatte kalmış ders sorunu KIRMIZI yapıyor ve sayıyor', () => {
    let d = emptyState();
    d = addRoom(d, 'A');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
    d = addClass(d, '510', d.rooms[0]!.id);
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 2, blocks: [],
    });
    d = place(d, d.lessons[0]!.id, 0, 0);
    // The hour is closed AFTERWARDS — principle 6 says the lesson stays.
    d = setAvailability(d, d.teachers[0]!.id, [{ day: 0, hour: 0 }], true);

    const h = health(d);
    expect(h.stranded).toBe(1);
    expect(h.level).toBe('impossible');
    expect(h.message).toContain('1 ders kapalı saatte');
    // ...and the strip's own number counts the ROW, once.
    expect(h.problems).toBe(1);
  });

  // What Kontrol's "Sorunlar (N)" button counts: rows in the three problem
  // panels. Not `blocked + warnings` — those split the same violations by
  // level and then add capacity rows on top, so on a healthy-but-tight school
  // they are non-zero while there is not one line to go and read.
  it('problems SATIR sayıyor, blocked/warnings ile aynı şey değil', () => {
    expect(health(emptyState()).problems).toBe(0);

    let d = emptyState();
    d = addRoom(d, 'A');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
    d = addClass(d, '510', d.rooms[0]!.id);
    // More hours than the week can hold: a capacity row goes 'impossible', so
    // `warnings` rises — but no problem PANEL gains a row.
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 4, blocks: [],
    });
    const h = health(d);
    expect(h.problems).toBe(0);
  });

  it('cümle SAYIYOR, "sorun var" demiyor', () => {
    // The whole point: a chip that says "there is a problem" sends somebody to
    // Kontrol to find out which one. This says which one before they go.
    let d = emptyState();
    d = addRoom(d, 'A');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
    d = addClass(d, '510', d.rooms[0]!.id);
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 3, blocks: [],
    });
    expect(health(d).message).toMatch(/^\d+ saat havuzda$/);
  });

  // Pitfall 22, in its third home: one teacher away all week produces sixty
  // messages and is still one closed teacher. The counts here are of KINDS.
  it('bir öğretmenin bütün haftası kapalıysa bu ONE problem gibi sayılıyor', () => {
    let d = emptyState();
    d = addRoom(d, 'A');
    d = addTeacher(d, { name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik' });
    d = addClass(d, '510', d.rooms[0]!.id);
    d = addLesson(d, {
      classId: d.classes[0]!.id,
      teacherId: d.teachers[0]!.id,
      weeklyHours: 4, blocks: [],
    });
    d = setWholeWeek(d, d.teachers[0]!.id, true);

    const h = health(d);
    expect(h.level).toBe('impossible');
    expect(h.message).toContain('ders sığmıyor');
    // ...and NOT sixty of anything.
    expect(h.warnings).toBeLessThan(10);
  });
});
