// The limit boxes. Every export of rules.ts is covered here (CLAUDE.md rule:
// no feature lands in a pure module without a test).

import { buildIndex, place } from './constraints';
import { DEFAULT_BELL, DEFAULT_LIMITS, DEFAULT_RULES, NO_TEACHER_LIMITS } from './entities';
import {
  findViolations,
  lessonDayCount,
  lessonLimit,
  limitFor,
  longestRun,
  ruleActive,
  ruleLevel,
  runLength,
  teacherDayCount,
} from './rules';
import type { State } from './types';
import { SCHEMA_VERSION } from './types';

// 2 days x 6 hours. MÇ teaches both 510 and 511, so a long run is easy to build.
function build(): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: '',
      days: [
        { name: 'Salı', longBreakAfter: 3 },
        { name: 'Çarşamba', longBreakAfter: 3 },
      ],
      hours: ['1', '2', '3', '4', '5', '6'],
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS },
      rules: { ...DEFAULT_RULES },
      subjects: [],
      subjectShorts: {},
    },
    rooms: [{ id: 'dA', name: 'A' }],
    teachers: [
      {
        id: 'oMC',
        name: 'Mehmet Çelik',
        short: 'MÇ',
        subject: 'Matematik',
        gender: '',
        color: 0,
        limits: { ...NO_TEACHER_LIMITS },
      },
    ],
    classes: [
      { id: 's510', name: '510', roomId: null, color: 0 },
      { id: 's511', name: '511', roomId: null, color: 1 },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6, pairs: 0, maxPerDay: null },
      { id: 'x2', classId: 's511', teacherId: 'oMC', weeklyHours: 6, pairs: 0, maxPerDay: null },
    ],
    unavailable: {},
    placements: {},
  };
}

const teacher = (d: State) => d.teachers[0]!;
const lesson = (d: State) => d.lessons[0]!;

describe('limitFor — varsayılan ve istisna', () => {
  it('öğretmenin kutusu boşsa okul varsayılanını kullanır', () => {
    const d = build();
    d.settings.limits.maxConsecutive = 3;
    expect(limitFor(d, teacher(d), 'maxConsecutive')).toBe(3);
  });

  it('öğretmenin kutusu doluysa varsayılanı ezer', () => {
    const d = build();
    d.settings.limits.maxConsecutive = 3;
    teacher(d).limits.maxConsecutive = 5;
    expect(limitFor(d, teacher(d), 'maxConsecutive')).toBe(5);
  });

  it('0 ve tanımsız "sınır yok" demektir', () => {
    const d = build();
    expect(limitFor(d, teacher(d), 'maxPerDay')).toBe(0);
    expect(limitFor(d, undefined, 'maxPerDay')).toBe(0);
  });
});

describe('lessonLimit', () => {
  it('dersin kendi kutusu varsayılanı ezer', () => {
    const d = build();
    d.settings.limits.maxSameLessonPerDay = 2;
    expect(lessonLimit(d, lesson(d))).toBe(2);
    lesson(d).maxPerDay = 4;
    expect(lessonLimit(d, lesson(d))).toBe(4);
  });
});

describe('ruleLevel / ruleActive', () => {
  it('kural kapalıysa sayı ne olursa olsun etkin değildir', () => {
    const d = build();
    d.settings.rules.maxPerDay = 'off';
    expect(ruleLevel(d, 'maxPerDay')).toBe('off');
    expect(ruleActive(d, 'maxPerDay', 4)).toBe(false);
  });

  it('kural açık ama sayı 0 ise yine etkin değildir', () => {
    const d = build();
    expect(ruleLevel(d, 'maxPerDay')).toBe('block');
    expect(ruleActive(d, 'maxPerDay', 0)).toBe(false);
    expect(ruleActive(d, 'maxPerDay', 2)).toBe(true);
  });
});

describe('runLength — komşularla birleşme', () => {
  it('boş günde blok uzunluğunun kendisidir', () => {
    const d = build();
    expect(runLength(buildIndex(d), 'oMC', 0, 2, 2, 6)).toBe(2);
  });

  it('SOLDAKİ dolu saatlerle birleşir', () => {
    let d = build();
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x2', 0, 1);
    expect(runLength(buildIndex(d), 'oMC', 0, 2, 1, 6)).toBe(3);
  });

  it('SAĞDAKİ dolu saatlerle birleşir — blok bir saatin yanına konunca', () => {
    let d = build();
    d = place(d, 'x2', 0, 2); // one hour at index 2
    // a 2-hour block at 0-1 touches it: 1 + 1 + 1 = 3 in a row
    expect(runLength(buildIndex(d), 'oMC', 0, 0, 2, 6)).toBe(3);
  });

  it('araya bir boşluk girerse birleşmez', () => {
    let d = build();
    d = place(d, 'x1', 0, 0);
    expect(runLength(buildIndex(d), 'oMC', 0, 2, 1, 6)).toBe(1);
  });

  it('gün sınırının dışına taşmaz', () => {
    let d = build();
    d = place(d, 'x1', 0, 5);
    expect(runLength(buildIndex(d), 'oMC', 0, 4, 1, 6)).toBe(2);
  });
});

describe('longestRun / teacherDayCount / lessonDayCount', () => {
  it('günün en uzun kesintisiz dizisini bulur', () => {
    let d = build();
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 2);
    d = place(d, 'x2', 0, 3);
    d = place(d, 'x2', 0, 4);
    expect(longestRun(buildIndex(d), 'oMC', 0, 6)).toBe(3);
    expect(teacherDayCount(buildIndex(d), 'oMC', 0, 6)).toBe(4);
    expect(teacherDayCount(buildIndex(d), 'oMC', 1, 6)).toBe(0);
  });

  it('bir dersin o günkü saatini sayar', () => {
    let d = build();
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 3);
    d = place(d, 'x2', 0, 1);
    expect(lessonDayCount(d, lesson(d), 0, 6)).toBe(2);
    expect(lessonDayCount(d, lesson(d), 1, 6)).toBe(0);
  });
});

describe('findViolations — dizilmiş programdaki ihlaller', () => {
  it('temiz programda hiçbir şey bulmaz', () => {
    const d = build();
    expect(findViolations(d, buildIndex(d))).toEqual([]);
  });

  it('günde en fazla sınırı aşılınca somut cümle döner', () => {
    let d = build();
    d.settings.limits.maxPerDay = 2;
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 1);
    d = place(d, 'x2', 0, 3);
    const found = findViolations(d, buildIndex(d));
    expect(found).toHaveLength(1);
    expect(found[0]!.message).toBe(
      'MÇ Salı günü 3 saat ders veriyor, en fazla 2 saat isteniyor.',
    );
    expect(found[0]!.level).toBe('block');
  });

  it('günde en az kuralı SADECE burada yakalanır', () => {
    let d = build();
    d.settings.limits.minPerDay = 2;
    d = place(d, 'x1', 0, 0);
    const found = findViolations(d, buildIndex(d));
    expect(found[0]!.message).toBe(
      'MÇ Salı günü sadece 1 saat ders veriyor, en az 2 saat isteniyor.',
    );
    expect(found[0]!.level).toBe('warn');
  });

  it('hiç ders verilmeyen gün ihlal sayılmaz', () => {
    let d = build();
    d.settings.limits.minPerDay = 2;
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 1);
    expect(findViolations(d, buildIndex(d))).toEqual([]); // Çarşamba boş, sorun değil
  });

  it('art arda sınırı aşılınca yakalanır', () => {
    let d = build();
    d.settings.limits.maxConsecutive = 2;
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 1);
    d = place(d, 'x2', 0, 2);
    const found = findViolations(d, buildIndex(d));
    expect(found[0]!.message).toBe(
      'MÇ Salı günü art arda 3 saat ders veriyor, en fazla 2 saat isteniyor.',
    );
  });

  it('aynı dersin günlük sınırı aşılınca yakalanır', () => {
    let d = build();
    d.settings.limits.maxSameLessonPerDay = 1;
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 2);
    const found = findViolations(d, buildIndex(d));
    expect(found.map((x) => x.message)).toContain(
      '510 sınıfı Salı günü MÇ dersinden 2 saat görüyor, en fazla 1 saat isteniyor.',
    );
  });

  it('kural Kapalı iken hiçbir ihlal raporlanmaz', () => {
    let d = build();
    d.settings.limits.maxPerDay = 1;
    d.settings.rules.maxPerDay = 'off';
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 1);
    expect(findViolations(d, buildIndex(d))).toEqual([]);
  });
});
