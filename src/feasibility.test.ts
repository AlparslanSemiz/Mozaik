import { buildReport } from './feasibility';
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
      subjectShorts: {},
    },
    rooms: [{ id: 'dA', name: 'A' }],
    teachers: [{ id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', color: 0, limits: { ...NO_TEACHER_LIMITS } }],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: 'dA' },
    ],
    lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 1, maxPerDay: null }],
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
    d.teachers.push({ id: 'oAV', name: 'Ayşe Var', short: 'AV', subject: 'Fizik', color: 1, limits: { ...NO_TEACHER_LIMITS } });
    d.lessons.push({ id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 3, blockSize: 1, maxPerDay: null });

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
    d.lessons = [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6, blockSize: 1, maxPerDay: null }];
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
