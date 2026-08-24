import {
  blockStart,
  blocker,
  check,
  buildIndex,
  countPlacedHours,
  place,
  placementKey,
  removeBlock,
  sanitize,
  teacherKey,
  validHours,
} from './constraints';
import { DEFAULT_BELL, DEFAULT_LIMITS, DEFAULT_RULES, NO_TEACHER_LIMITS } from './entities';
import type { RuleLevel, State } from './types';
import { SCHEMA_VERSION } from './types';

// A small, readable world: 2 days x 4 hours.
//   room A: class 510, class 511      (shared room)
//   room B: class 433
//   MÇ = Matematik, AV = Fizik, MB = Kimya
function build(): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: '',
      days: [
        { name: 'Pazartesi', longBreakAfter: 0 },
        { name: 'Salı', longBreakAfter: 0 },
      ],
      hours: ['1', '2', '3', '4'],
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS },
      rules: { ...DEFAULT_RULES },
      subjects: [],
      subjectShorts: {},
    },
    rooms: [
      { id: 'dA', name: 'A' },
      { id: 'dB', name: 'B' },
    ],
    teachers: [
      { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', color: 0, limits: { ...NO_TEACHER_LIMITS } },
      { id: 'oAV', name: 'Ayşe Var', short: 'AV', subject: 'Fizik', color: 1, limits: { ...NO_TEACHER_LIMITS } },
      { id: 'oMB', name: 'Murat Bey', short: 'MB', subject: 'Kimya', color: 2, limits: { ...NO_TEACHER_LIMITS } },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA', color: 0 },
      { id: 's511', name: '511', roomId: 'dA', color: 1 },
      { id: 's433', name: '433', roomId: 'dB', color: 2 },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blockSize: 1, maxPerDay: null },
      { id: 'x2', classId: 's511', teacherId: 'oMC', weeklyHours: 2, blockSize: 1, maxPerDay: null },
      { id: 'x3', classId: 's433', teacherId: 'oAV', weeklyHours: 4, blockSize: 2, maxPerDay: null },
      { id: 'x4', classId: 's510', teacherId: 'oAV', weeklyHours: 2, blockSize: 2, maxPerDay: null },
      { id: 'x5', classId: 's511', teacherId: 'oAV', weeklyHours: 2, blockSize: 1, maxPerDay: null },
      { id: 'x6', classId: 's433', teacherId: 'oMB', weeklyHours: 3, blockSize: 3, maxPerDay: null },
    ],
    unavailable: {},
    placements: {},
  };
}

/** Shortcut for blocker(): rebuilds the index every time. */
function why(d: State, lessonId: string, day: number, hour: number): string | null {
  return blocker(d, buildIndex(d), lessonId, day, hour);
}

/** Shortcut for check(): the blocking reason plus the "Uyar" level warning. */
function verdict(d: State, lessonId: string, day: number, hour: number) {
  return check(d, buildIndex(d), lessonId, day, hour);
}

/** Switches one rule on with a number behind it. */
function withRule(
  d: State,
  name: keyof State['settings']['limits'],
  limit: number,
  level: RuleLevel,
): State {
  return {
    ...d,
    settings: {
      ...d.settings,
      limits: { ...d.settings.limits, [name]: limit },
      rules: { ...d.settings.rules, [name]: level },
    },
  };
}

describe('blocker — sert kısıtlar', () => {
  it('boş ızgaraya yerleştirmeye izin verir', () => {
    expect(why(build(), 'x1', 0, 0)).toBeNull();
  });

  it('sınıfın dolu saatine yerleştirmeyi engeller ve dersin adını söyler', () => {
    // MÇ (Matematik) was placed in 510; AV (Fizik) cannot go into the same class.
    const d = place(build(), 'x1', 0, 0);
    const reason = why(d, 'x4', 0, 0);
    expect(reason).toContain('510');
    expect(reason).toContain('Matematik');
  });

  it('öğretmenin müsait olmadığı saate yerleştirmeyi engeller', () => {
    const d = build();
    d.unavailable[teacherKey('oMC', 0, 0)] = 1;
    const reason = why(d, 'x1', 0, 0);
    expect(reason).toContain('MÇ');
    expect(reason).toContain('müsait değil');
  });

  it('öğretmen başka sınıftayken engeller ve hangi sınıf olduğunu söyler', () => {
    // MÇ is in class 510; cannot be in 511 at the same hour.
    const d = place(build(), 'x1', 0, 0);
    const reason = why(d, 'x2', 0, 0);
    expect(reason).toContain('MÇ');
    expect(reason).toContain('510');
  });

  it('dersliği paylaşan sınıf o saatte doluyken engeller', () => {
    // 510 and 511 share room A. Different teachers, so the only block is the room.
    const d = place(build(), 'x1', 0, 0);
    const reason = why(d, 'x5', 0, 0);
    expect(reason).toContain('A dersliğinde');
    expect(reason).toContain('510');
  });

  it('roomId null ise derslik kontrolünü atlar', () => {
    const d = place(build(), 'x1', 0, 0);
    d.classes = d.classes.map((c) => (c.id === 's511' ? { ...c, roomId: null } : c));
    expect(why(d, 'x5', 0, 0)).toBeNull();
  });

  it('2 saatlik bloğu son saate koydurmaz', () => {
    // 4 hours (0..3). blockSize=2 can start at hour 2 at the latest.
    expect(why(build(), 'x4', 0, 2)).toBeNull();
    expect(why(build(), 'x4', 0, 3)).toContain('sığmıyor');
  });

  it('3 saatlik blok güne sığmıyorsa reddeder', () => {
    expect(why(build(), 'x6', 0, 1)).toBeNull(); // 1,2,3 -> fits
    expect(why(build(), 'x6', 0, 2)).toContain('sığmıyor'); // 2,3,4 -> does not
  });

  it('bloğun ikinci saatindeki çakışmayı da görür', () => {
    // x3 has blockSize=2; placed at hour 0 it fills 0 and 1. Then x6 (blockSize=3)
    // cannot start at hour 1.
    const d = place(build(), 'x3', 0, 0);
    expect(why(d, 'x6', 0, 1)).not.toBeNull();
  });

  it('aynı öğretmenin aynı sınıfta ardışık iki dersi çakışma vermez', () => {
    const d = place(build(), 'x1', 0, 0);
    expect(why(d, 'x1', 0, 1)).toBeNull();
  });

  it('gün veya saat aralık dışındaysa geçersiz der', () => {
    expect(why(build(), 'x1', 5, 0)).toBe('Geçersiz hücre');
    expect(why(build(), 'x1', 0, -1)).toBe('Geçersiz hücre');
  });

  it('bilinmeyen ders için anlaşılır mesaj döner', () => {
    expect(why(build(), 'yok', 0, 0)).toBe('Ders bulunamadı');
  });
});

describe('validHours', () => {
  it('sürükleme başında o günün geçerli saatlerini verir', () => {
    const d = build();
    d.unavailable[teacherKey('oMC', 0, 1)] = 1;
    const withPlacement = place(d, 'x2', 0, 3); // MÇ is in 511 -> hour 3 also closes
    expect(
      [...validHours(withPlacement, buildIndex(withPlacement), 'x1', 0)].sort(),
    ).toEqual([0, 2]);
  });

  it('bloklu ders için gün sonuna taşan saatleri dışarıda bırakır', () => {
    const d = build();
    expect([...validHours(d, buildIndex(d), 'x6', 0)]).toEqual([0, 1]);
  });
});

describe('blockStart ve removeBlock', () => {
  it('blok kaldırılınca tüm saatleri temizlenir', () => {
    const d = removeBlock(place(build(), 'x4', 0, 0), 's510', 0, 0);
    expect(Object.keys(d.placements)).toHaveLength(0);
  });

  it('ortadan tıklanan blok tamamen kalkar', () => {
    const d = removeBlock(place(build(), 'x6', 0, 0), 's433', 0, 2); // click the end of the 3-block
    expect(Object.keys(d.placements)).toHaveLength(0);
  });

  it('bitişik iki bloğu birbirine karıştırmaz', () => {
    // x4 has blockSize=2. First 0-1, then 2-3. Same lessonId, adjacent. Clicking
    // hour 2 must remove only the SECOND block; naive backwards walking would
    // delete all four.
    let d = place(build(), 'x4', 0, 0);
    d = place(d, 'x4', 0, 2);
    expect(blockStart(d, 's510', 0, 2)).toBe(2);
    expect(blockStart(d, 's510', 0, 1)).toBe(0);

    const after = removeBlock(d, 's510', 0, 3);
    expect(Object.keys(after.placements).sort()).toEqual([
      placementKey('s510', 0, 0),
      placementKey('s510', 0, 1),
    ]);
  });

  it('boş hücrede blockStart null döner ve removeBlock durumu değiştirmez', () => {
    const d = build();
    expect(blockStart(d, 's510', 0, 0)).toBeNull();
    expect(removeBlock(d, 's510', 0, 0)).toBe(d);
  });
});

describe('countPlacedHours — sayaç', () => {
  it('bloklu dersi saat sayısıyla sayar', () => {
    let d = place(build(), 'x4', 0, 0); // blockSize=2 -> 2 hours
    d = place(d, 'x1', 0, 2); // blockSize=1 -> 1 hour
    expect(countPlacedHours(d, 'x4')).toBe(2);
    expect(countPlacedHours(d, 'x1')).toBe(1);
    expect(countPlacedHours(d, 'x3')).toBe(0);
    expect(buildIndex(d).placedHours.get('x4')).toBe(2);
  });
});

describe('sanitize — cascade ve taşma', () => {
  it('öğretmen silinince dersleri ve yerleşimleri de silinir', () => {
    let d = place(build(), 'x1', 0, 0);
    d = place(d, 'x3', 0, 0);
    d = { ...d, teachers: d.teachers.filter((t) => t.id !== 'oMC') };

    const s = sanitize(d);
    expect(s.lessons.map((x) => x.id)).not.toContain('x1');
    expect(s.placements[placementKey('s510', 0, 0)]).toBeUndefined();
    expect(s.placements[placementKey('s433', 0, 0)]).toBe('x3'); // untouched
  });

  it('sınıf silinince dersleri ve yerleşimleri de silinir', () => {
    let d = place(build(), 'x1', 0, 0);
    d = { ...d, classes: d.classes.filter((c) => c.id !== 's510') };

    const s = sanitize(d);
    expect(s.lessons.map((x) => x.id)).not.toContain('x1');
    expect(s.lessons.map((x) => x.id)).not.toContain('x4');
    expect(Object.keys(s.placements)).toHaveLength(0);
  });

  it('derslik silinince sınıfın roomId alanı null olur', () => {
    const d = { ...build(), rooms: [{ id: 'dB', name: 'B' }] };
    const s = sanitize(d);
    expect(s.classes.find((c) => c.id === 's510')?.roomId).toBeNull();
    expect(s.classes.find((c) => c.id === 's433')?.roomId).toBe('dB');
  });

  it('saat sayısı azalınca taşan yerleşimler temizlenir', () => {
    let d = place(build(), 'x1', 0, 3);
    d = place(d, 'x1', 0, 0);
    d = { ...d, settings: { ...d.settings, hours: ['1', '2'] } };

    const s = sanitize(d);
    expect(s.placements[placementKey('s510', 0, 3)]).toBeUndefined();
    expect(s.placements[placementKey('s510', 0, 0)]).toBe('x1');
  });

  it('gün sayısı azalınca taşan müsaitlik kayıtları temizlenir', () => {
    const d = build();
    d.unavailable[teacherKey('oMC', 1, 0)] = 1;
    d.unavailable[teacherKey('oMC', 0, 0)] = 1;
    const narrow = {
      ...d,
      settings: { ...d.settings, days: [{ name: 'Pazartesi', longBreakAfter: 0 }] },
    };

    const s = sanitize(narrow);
    expect(s.unavailable[teacherKey('oMC', 1, 0)]).toBeUndefined();
    expect(s.unavailable[teacherKey('oMC', 0, 0)]).toBe(1);
  });

  it('yetim ve bozuk anahtarları atar', () => {
    const d = build();
    d.placements['s510|0|0'] = 'olmayanDers';
    d.placements['bozuk'] = 'x1';
    d.placements['s433|0|0'] = 'x1'; // the lesson belongs to 510 -> inconsistent
    expect(Object.keys(sanitize(d).placements)).toHaveLength(0);
  });

  it('değişiklik yoksa AYNI nesneyi döner', () => {
    const d = place(build(), 'x1', 0, 0);
    expect(sanitize(d)).toBe(d);
  });
});

// --------------------------------------------------------- closed hours

describe('blocker — sınıf ve derslik kapalı saatleri', () => {
  it('sınıf kapalıysa engeller ve sınıfın adını söyler', () => {
    const d = build();
    d.unavailable[teacherKey('s510', 0, 2)] = 1;
    expect(why(d, 'x1', 0, 2)).toBe('510 sınıfı Pazartesi 3 saatinde kapalı');
    expect(why(d, 'x1', 0, 1)).toBeNull();
  });

  it('sınıfın kapalı saati diğer sınıfları etkilemez', () => {
    const d = build();
    d.unavailable[teacherKey('s510', 0, 2)] = 1;
    expect(why(d, 'x2', 0, 2)).toBeNull(); // 511 is a different class
  });

  it('derslik kapalıysa o dersliği kullanan sınıf ders yapamaz', () => {
    const d = build();
    d.unavailable[teacherKey('dA', 1, 0)] = 1;
    expect(why(d, 'x1', 1, 0)).toBe('A dersliği Salı 1 saatinde kapalı');
    expect(why(d, 'x2', 1, 0)).toBe('A dersliği Salı 1 saatinde kapalı'); // shares room A
    expect(why(d, 'x3', 1, 0)).toBeNull(); // 433 is in room B
  });

  it('bloğun ORTASINA denk gelen kapalı saat de engeller', () => {
    const d = build();
    d.unavailable[teacherKey('s433', 0, 1)] = 1;
    expect(why(d, 'x3', 0, 0)).toBe('433 sınıfı Pazartesi 2 saatinde kapalı');
  });

  it('sınıf silinince onun kapalı saatleri de silinir', () => {
    const d = build();
    d.unavailable[teacherKey('s510', 0, 0)] = 1;
    const gone = sanitize({ ...d, classes: d.classes.filter((c) => c.id !== 's510') });
    expect(gone.unavailable[teacherKey('s510', 0, 0)]).toBeUndefined();
  });
});

// ---------------------------------------------------------------- limits

describe('blocker — art arda en fazla N saat', () => {
  it('sınır aşılmadıkça izin verir', () => {
    let d = withRule(build(), 'maxConsecutive', 2, 'block');
    d = place(d, 'x1', 0, 0);
    expect(why(d, 'x2', 0, 1)).toBeNull(); // MÇ would have 2 in a row
  });

  it('sınır aşılınca engeller ve kaç saat olacağını söyler', () => {
    let d = withRule(build(), 'maxConsecutive', 2, 'block');
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x2', 0, 1);
    expect(why(d, 'x1', 0, 2)).toBe('MÇ art arda 2 saatten fazla girmemeli — burada 3 saat olur');
  });

  it('BLOK, sağındaki dolu saatle birleşerek sınırı aşabilir', () => {
    // 2-hour block at 0-1 plus an existing hour at 2 makes a run of 3.
    let d = withRule(build(), 'maxConsecutive', 2, 'block');
    d = place(d, 'x5', 0, 2); // AV, class 511, one hour
    expect(why(d, 'x4', 0, 0)).toContain('burada 3 saat olur'); // AV 2-hour block at 0-1
  });

  it('öğretmenin kendi kutusu okul varsayılanını ezer', () => {
    let d = withRule(build(), 'maxConsecutive', 2, 'block');
    d = { ...d, teachers: d.teachers.map((t) => (t.id === 'oMC' ? { ...t, limits: { ...t.limits, maxConsecutive: 3 } } : t)) };
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x2', 0, 1);
    expect(why(d, 'x1', 0, 2)).toBeNull(); // MÇ may do 3, the school default says 2
  });

  it('kural Kapalı iken sınır hiç bakılmaz', () => {
    let d = withRule(build(), 'maxConsecutive', 2, 'off');
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x2', 0, 1);
    expect(why(d, 'x1', 0, 2)).toBeNull();
  });
});

describe('blocker — günde en fazla N saat', () => {
  it('gün dolduğunda engeller', () => {
    let d = withRule(build(), 'maxPerDay', 2, 'block');
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x2', 0, 2);
    expect(why(d, 'x1', 0, 3)).toBe('MÇ Pazartesi günü en fazla 2 saat girmeli — burada 3 saat olur');
    expect(why(d, 'x1', 1, 0)).toBeNull(); // the next day is a fresh budget
  });
});

describe('blocker — bir ders günde en fazla N saat', () => {
  it('aynı dersin günlük saatini sınırlar', () => {
    let d = withRule(build(), 'maxSameLessonPerDay', 2, 'block');
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 2);
    expect(why(d, 'x1', 0, 3)).toBe(
      '510 sınıfı Pazartesi günü MÇ dersinden en fazla 2 saat görmeli — burada 3 saat olur',
    );
  });

  it('dersin kendi kutusu okul varsayılanını ezer', () => {
    let d = withRule(build(), 'maxSameLessonPerDay', 1, 'block');
    d = { ...d, lessons: d.lessons.map((x) => (x.id === 'x1' ? { ...x, maxPerDay: 3 } : x)) };
    d = place(d, 'x1', 0, 0);
    expect(why(d, 'x1', 0, 1)).toBeNull();
  });
});

// --------------------------------------------------------------- check()

describe('check — Uyar seviyesi', () => {
  it('Uyar iken engellemez ama sebebi söyler', () => {
    let d = withRule(build(), 'maxConsecutive', 2, 'warn');
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x2', 0, 1);
    const v = verdict(d, 'x1', 0, 2);
    expect(v.blocked).toBeNull();
    expect(v.warning).toBe('MÇ art arda 2 saatten fazla girmemeli — burada 3 saat olur');
  });

  it('Engelle iken uyarı değil engel döner', () => {
    let d = withRule(build(), 'maxConsecutive', 2, 'block');
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x2', 0, 1);
    const v = verdict(d, 'x1', 0, 2);
    expect(v.blocked).toContain('art arda');
    expect(v.warning).toBeNull();
  });

  it('sorun yoksa ikisi de null', () => {
    const v = verdict(build(), 'x1', 0, 0);
    expect(v).toEqual({ blocked: null, warning: null });
  });

  it('sert kısıt varsa yumuşak kurala hiç bakılmaz', () => {
    let d = withRule(build(), 'maxConsecutive', 1, 'warn');
    d = place(d, 'x1', 0, 0);
    const v = verdict(d, 'x2', 0, 0); // MÇ is already teaching 510 at that hour
    expect(v.blocked).toContain('MÇ');
    expect(v.warning).toBeNull();
  });
});
