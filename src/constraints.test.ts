import {
  blockAt,
  blockSpans,
  blockStart,
  pendingBlocks,
  placedBlocks,
  blocker,
  blockerDetail,
  dropMap,
  evict,
  evictionNotice,
  occupy,
  vacate,
  check,
  buildIndex,
  closedConflicts,
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
      { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', subject2: '', gender: '', color: 0, limits: { ...NO_TEACHER_LIMITS } },
      { id: 'oAV', name: 'Ayşe Var', short: 'AV', subject: 'Fizik', subject2: '', gender: '', color: 1, limits: { ...NO_TEACHER_LIMITS } },
      { id: 'oMB', name: 'Murat Bey', short: 'MB', subject: 'Kimya', subject2: '', gender: '', color: 2, limits: { ...NO_TEACHER_LIMITS } },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA', color: 0 },
      { id: 's511', name: '511', roomId: 'dA', color: 1 },
      { id: 's433', name: '433', roomId: 'dB', color: 2 },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blocks: [], second: false, maxPerDay: null },
      { id: 'x2', classId: 's511', teacherId: 'oMC', weeklyHours: 2, blocks: [], second: false, maxPerDay: null },
      { id: 'x3', classId: 's433', teacherId: 'oAV', weeklyHours: 4, blocks: [2, 2], second: false, maxPerDay: null },
      { id: 'x4', classId: 's510', teacherId: 'oAV', weeklyHours: 2, blocks: [2], second: false, maxPerDay: null },
      { id: 'x5', classId: 's511', teacherId: 'oAV', weeklyHours: 2, blocks: [], second: false, maxPerDay: null },
      { id: 'x6', classId: 's433', teacherId: 'oMB', weeklyHours: 3, blocks: [2], second: false, maxPerDay: null },
    ],
    unavailable: {},
    placements: {},
  };
}

/**
 * A world holding ONE lesson of a given shape, already sitting on the listed
 * cells. Written straight into `placements` rather than through `place()`,
 * because the point is to ask how an arbitrary run of hours gets READ.
 */
function withLesson(
  spec: { id: string; weeklyHours: number; blocks: number[] },
  cells: Array<[number, number]>,
): State {
  const d = build();
  const placements: Record<string, string> = {};
  for (const [day, hour] of cells) placements[placementKey('s510', day, hour)] = spec.id;
  return {
    ...d,
    // Six hours a day rather than the four the shared fixture uses: a run has
    // to be long enough to hold a 3 and a 2 back to back, or the case cannot be
    // asked at all.
    settings: { ...d.settings, hours: ['1', '2', '3', '4', '5', '6'] },
    lessons: [
      {
        id: spec.id,
        classId: 's510',
        teacherId: 'oMC',
        weeklyHours: spec.weeklyHours,
        blocks: spec.blocks,
        second: false,
        maxPerDay: null,
      },
    ],
    placements,
  };
}

function lessonById(d: State, id: string) {
  return d.lessons.find((x) => x.id === id)!;
}

/** Shortcut for blocker(): rebuilds the index every time. */
function why(
  d: State,
  lessonId: string,
  day: number,
  hour: number,
  size?: number,
): string | null {
  return blocker(d, buildIndex(d), lessonId, day, hour, size);
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
    // 4 hours (0..3). A 2-hour block can start at hour 2 at the latest.
    expect(why(build(), 'x4', 0, 2)).toBeNull();
    expect(why(build(), 'x4', 0, 3)).toContain('sığmıyor');
  });

  // The size is the LAST parameter and it is optional. Left off it means
  // "whichever block this lesson still owes first" — x6 is 2+1, so a fresh grid
  // owes the double — and given, it is asked about exactly.
  it('boy verilmezse dersin SIRADAKİ bloğu sorulur', () => {
    // x6 = 3 saat, 2+1. Nothing placed, so the question is about the double.
    expect(why(build(), 'x6', 0, 3)).toContain('sığmıyor'); // 3,4 -> off the day
    // Same cell, asked about the single: it fits.
    expect(why(build(), 'x6', 0, 3, 1)).toBeNull();

    // With the double down, the next thing owed is the single.
    const half = place(build(), 'x6', 0, 0);
    expect(why(half, 'x6', 1, 3)).toBeNull();
  });

  it('bloğun ikinci saatindeki çakışmayı da görür', () => {
    // x3 is 2+2 and shares 433 with x6; placed at hour 1 it fills 1 and 2. A
    // double of x6 starting at hour 0 is refused for its SECOND hour — cell 0
    // itself is empty — and a single at that same cell is fine, which is what
    // makes the refusal about the block's LENGTH rather than about the cell.
    const d = place(build(), 'x3', 0, 1);
    expect(why(d, 'x6', 0, 0)).not.toBeNull();
    expect(why(d, 'x6', 0, 0, 1)).toBeNull();
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
    // x6 is 2+1 and owes its double first: 4 hours, so it can start at 0, 1
    // or 2 — never at 3.
    expect([...validHours(d, buildIndex(d), 'x6', 0)]).toEqual([0, 1, 2]);
    // Its single fits everywhere, and asking for it is how the pool asks.
    expect([...validHours(d, buildIndex(d), 'x6', 0, 1)]).toEqual([0, 1, 2, 3]);
  });
});

describe('blockStart ve removeBlock', () => {
  it('blok kaldırılınca tüm saatleri temizlenir', () => {
    const d = removeBlock(place(build(), 'x4', 0, 0), 's510', 0, 0);
    expect(Object.keys(d.placements)).toHaveLength(0);
  });

  it('ortadan tıklanan blok tamamen kalkar', () => {
    // x6 is 2+1, so a fresh grid places the double: hours 0 and 1.
    const d = removeBlock(place(build(), 'x6', 0, 0), 's433', 0, 1); // click its second hour
    expect(Object.keys(d.placements)).toHaveLength(0);
  });

  it('bitişik iki bloğu birbirine karıştırmaz', () => {
    // x3 is 2+2. First 0-1, then 2-3. Same lessonId, adjacent. Clicking hour 2
    // must remove only the SECOND block; naive backwards walking would delete
    // all four.
    let d = place(build(), 'x3', 0, 0);
    d = place(d, 'x3', 0, 2);
    expect(blockStart(d, 's433', 0, 2)).toBe(2);
    expect(blockStart(d, 's433', 0, 1)).toBe(0);

    const after = removeBlock(d, 's433', 0, 3);
    expect(Object.keys(after.placements).sort()).toEqual([
      placementKey('s433', 0, 0),
      placementKey('s433', 0, 1),
    ]);
  });

  // THE case v7 created. Three adjacent cells of one lesson used to be
  // unreadable — [2,1] or [1,2]? — so the split itself decides, doubles first
  // in day/hour order, and the whole program reads them the same way.
  it('2+1 aynı güne bitişik konsa da İKİ blok olarak okunuyor', () => {
    let d = place(build(), 'x6', 0, 0); // the double: hours 0 and 1
    d = place(d, 'x6', 0, 2, 1); // the single, right beside it: hour 2

    expect(blockAt(d, 's433', 0, 0)).toEqual({ day: 0, hour: 0, size: 2 });
    expect(blockAt(d, 's433', 0, 1)).toEqual({ day: 0, hour: 0, size: 2 });
    expect(blockAt(d, 's433', 0, 2)).toEqual({ day: 0, hour: 2, size: 1 });

    // Clicking the single takes one cell, not the run.
    const after = removeBlock(d, 's433', 0, 2);
    expect(Object.keys(after.placements).sort()).toEqual([
      placementKey('s433', 0, 0),
      placementKey('s433', 0, 1),
    ]);
  });

  it('boş hücrede blockStart null döner ve removeBlock durumu değiştirmez', () => {
    const d = build();
    expect(blockStart(d, 's510', 0, 0)).toBeNull();
    expect(removeBlock(d, 's510', 0, 0)).toBe(d);
  });
});

// THE contract v7 needed. `placements` holds one lessonId per hour and no block
// boundary, so a run of three cells of one lesson is readable as [2,1] or as
// [1,2] and nothing on the grid tells them apart. One rule decides — doubles
// first, in day/hour order, while the lesson still has doubles to account for —
// and the grid, the pool, the right-click and the auditor all obey it.
describe('placedBlocks ve pendingBlocks — ızgaradaki bloklar', () => {
  it('boş ızgarada yerleşmiş blok yok, bekleyen bloklar plânın kendisi', () => {
    const d = build();
    const x6 = d.lessons[5]!;
    expect(placedBlocks(d, x6)).toEqual([]);
    expect(pendingBlocks(d, x6)).toEqual([2, 1]);
  });

  it('bitişik üç hücre 2+1 okunuyor — 1+2 değil', () => {
    let d = place(build(), 'x6', 0, 0); // the double
    d = place(d, 'x6', 0, 2, 1); // the single, right after it
    expect(placedBlocks(d, d.lessons[5]!)).toEqual([
      { day: 0, hour: 0, size: 2 },
      { day: 0, hour: 2, size: 1 },
    ]);
    expect(pendingBlocks(d, d.lessons[5]!)).toEqual([]);
  });

  it('ikili bütçesi bitince kalan hücreler tek saat sayılıyor', () => {
    // x1 is 4 hours with NO doubles, so four adjacent cells are four blocks.
    let d = build();
    for (let h = 0; h < 4; h++) d = place(d, 'x1', 0, h, 1);
    expect(placedBlocks(d, d.lessons[0]!).map((b) => b.size)).toEqual([1, 1, 1, 1]);
  });

  it('gün ve saat sırasıyla okunuyor', () => {
    let d = place(build(), 'x3', 1, 2); // later day first
    d = place(d, 'x3', 0, 0);
    expect(placedBlocks(d, d.lessons[2]!)).toEqual([
      { day: 0, hour: 0, size: 2 },
      { day: 1, hour: 2, size: 2 },
    ]);
  });

  it('yarısı yerleşmiş ders kalanını doğru söylüyor', () => {
    const d = place(build(), 'x6', 0, 0); // the double is down
    expect(pendingBlocks(d, d.lessons[5]!)).toEqual([1]);
  });

  // A hand-edited backup, or hours lowered under a laid-out lesson, can leave
  // the grid holding a shape the split does not describe. It must not throw and
  // it must not report negative work.
  it('plânda olmayan şekil bekleyeni eksiye düşürmüyor', () => {
    let d = build();
    for (let h = 0; h < 4; h++) d = place(d, 'x4', 0, h, 1); // x4 only asks for 2 hours
    expect(pendingBlocks(d, d.lessons[3]!)).toEqual([]);
  });

  // The contract says BIGGEST FIRST, and with only 1 and 2 in the model there
  // was no way to tell that apart from "twos first". These are the cases that
  // can tell.
  it('koşu içinde EN BÜYÜK blok önce alınıyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 4, blocks: [3] }, [[0, 0], [0, 1], [0, 2], [0, 3]]);
    expect(placedBlocks(d, lessonById(d, 'y1')).map((b) => b.size)).toEqual([3, 1]);
  });

  it('3+2 tek koşuda 3 sonra 2 okunuyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 5, blocks: [3, 2] }, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    ]);
    expect(placedBlocks(d, lessonById(d, 'y1')).map((b) => b.size)).toEqual([3, 2]);
  });

  // A four cannot fit a run of three, so the run takes the biggest that DOES.
  it('koşuya sığmayan boy atlanıyor, sığan alınıyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 7, blocks: [4, 3] }, [
      [0, 0], [0, 1], [0, 2], // a run of 3
      [1, 0], [1, 1], [1, 2], [1, 3], // a run of 4
    ]);
    expect(placedBlocks(d, lessonById(d, 'y1'))).toEqual([
      { day: 0, hour: 0, size: 3 },
      { day: 1, hour: 0, size: 4 },
    ]);
  });

  it('bütçe bitince kalan hücreler tek saat', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 5, blocks: [3] }, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    ]);
    expect(placedBlocks(d, lessonById(d, 'y1')).map((b) => b.size)).toEqual([3, 1, 1]);
  });

  it('karışık boylu ders kalanını doğru söylüyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 7, blocks: [4, 3] }, [[1, 0], [1, 1], [1, 2], [1, 3]]);
    expect(pendingBlocks(d, lessonById(d, 'y1'))).toEqual([3]);
  });
});

describe('blockSpans — bir tek kaynak', () => {
  it('yalnız blok BAŞLARINI, boylarıyla veriyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 4, blocks: [3] }, [[0, 0], [0, 1], [0, 2], [0, 3]]);
    const spans = blockSpans(d);
    expect(spans.get(placementKey('s510', 0, 0))).toBe(3);
    expect(spans.get(placementKey('s510', 0, 1))).toBeUndefined();
    expect(spans.get(placementKey('s510', 0, 2))).toBeUndefined();
    expect(spans.get(placementKey('s510', 0, 3))).toBe(1);
  });

  // The whole point of the map: every drawing of the week cuts a run of hours
  // in the same places, so the grid, the two printed tables and the auditor can
  // never disagree about where one block ends (pitfall 75).
  it('placedBlocks ile birebir aynı sınırları veriyor', () => {
    const d = withLesson({ id: 'y1', weeklyHours: 5, blocks: [3, 2] }, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    ]);
    const spans = blockSpans(d);
    for (const b of placedBlocks(d, lessonById(d, 'y1'))) {
      expect(spans.get(placementKey('s510', b.day, b.hour))).toBe(b.size);
    }
    expect(spans.size).toBe(placedBlocks(d, lessonById(d, 'y1')).length);
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
    expect(why(d, 'x1', 0, 2)).toBe('MÇ art arda 2 saatten fazla girmemeli, burada 3 saat olur');
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
    expect(why(d, 'x1', 0, 3)).toBe('MÇ Pazartesi günü en fazla 2 saat girmeli, burada 3 saat olur');
    expect(why(d, 'x1', 1, 0)).toBeNull(); // the next day is a fresh budget
  });
});

describe('blocker — bir ders günde en fazla N saat', () => {
  it('aynı dersin günlük saatini sınırlar', () => {
    let d = withRule(build(), 'maxSameLessonPerDay', 2, 'block');
    d = place(d, 'x1', 0, 0);
    d = place(d, 'x1', 0, 2);
    expect(why(d, 'x1', 0, 3)).toBe(
      '510 sınıfı Pazartesi günü MÇ dersinden en fazla 2 saat görmeli, burada 3 saat olur',
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
    expect(v.warning).toBe('MÇ art arda 2 saatten fazla girmemeli, burada 3 saat olur');
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

describe('closedConflicts', () => {
  /** Puts x1 (MÇ, 510, room A) on Monday hour 0. */
  function laidOut(): State {
    const d = build();
    return place(d, 'x1', 0, 0);
  }

  it('çakışma yokken boş dizi döndürüyor', () => {
    expect(closedConflicts(laidOut(), buildIndex(laidOut()))).toEqual([]);
  });

  it('öğretmen sonradan kapatılınca yakalıyor ve dersi SİLMİYOR', () => {
    const d = laidOut();
    const closed: State = { ...d, unavailable: { ...d.unavailable, 'oMC|0|0': 1 } };

    const found = closedConflicts(closed, buildIndex(closed));
    expect(found).toHaveLength(1);
    expect(found[0]!.reason).toBe('MÇ Pazartesi 1 saatinde müsait değil');
    expect(found[0]!.lessonId).toBe('x1');
    // The whole point: nothing is removed.
    expect(closed.placements['s510|0|0']).toBe('x1');
  });

  it('sınıf kapatılınca yakalıyor', () => {
    const d = laidOut();
    const closed: State = { ...d, unavailable: { ...d.unavailable, 's510|0|0': 1 } };
    const found = closedConflicts(closed, buildIndex(closed));
    expect(found).toHaveLength(1);
    expect(found[0]!.reason).toBe('510 sınıfı Pazartesi 1 saatinde kapalı');
  });

  it('derslik kapatılınca yakalıyor', () => {
    const d = laidOut();
    const closed: State = { ...d, unavailable: { ...d.unavailable, 'dA|0|0': 1 } };
    const found = closedConflicts(closed, buildIndex(closed));
    expect(found).toHaveLength(1);
    expect(found[0]!.reason).toBe('A dersliği Pazartesi 1 saatinde kapalı');
  });

  it('bloğun yalnız ortası kapatılsa da o saat yakalanıyor', () => {
    // x3 is a 2-hour block; closing only its second hour must still show up.
    let d = build();
    d = place(d, 'x3', 0, 1);
    const closed: State = { ...d, unavailable: { 'oAV|0|2': 1 } };

    const found = closedConflicts(closed, buildIndex(closed));
    expect(found).toHaveLength(1);
    expect(found[0]!.hour).toBe(2);
  });

  it('sanitize kapalı saatteki dersi TEMİZLEMİYOR', () => {
    // Deleting here is exactly what must not happen: availability is edited
    // after the timetable is laid out and a wrong click would cost a lesson.
    const d = laidOut();
    const closed: State = { ...d, unavailable: { 'oMC|0|0': 1 } };
    expect(sanitize(closed).placements['s510|0|0']).toBe('x1');
  });

  it('kapalı ama boş saat çakışma değil', () => {
    const d = build();
    const closed: State = { ...d, unavailable: { 'oMC|0|0': 1 } };
    expect(closedConflicts(closed, buildIndex(closed))).toEqual([]);
  });

  it('birden çok çakışma gün ve saate göre sıralı geliyor', () => {
    let d = build();
    d = place(d, 'x1', 1, 2);
    d = place(d, 'x2', 0, 1);
    const closed: State = { ...d, unavailable: { 'oMC|1|2': 1, 'oMC|0|1': 1 } };

    const found = closedConflicts(closed, buildIndex(closed));
    expect(found.map((c) => [c.day, c.hour])).toEqual([
      [0, 1],
      [1, 2],
    ]);
  });
});

// Moving a placed lesson is `removeBlock` then `place`, in one step. The whole
// thing rests on one claim: with the source block LIFTED, the lesson no longer
// blocks itself. Without it, hard constraint 2 (the class is busy) and 5 (the
// teacher is in another class) both see the lesson's own cells and it could not
// even be dropped back where it came from.
describe('taşıma — kaynak blok kaldırılınca ders kendini engellemiyor', () => {
  it('yerinde duran ders KENDİ hücresini dolu görüyor', () => {
    const d = place(build(), 'x1', 0, 1);
    expect(why(d, 'x1', 0, 1)).toBe('510 sınıfının Pazartesi 2 saatinde Matematik var');
  });

  it('kaldırıldıktan sonra aynı hücre serbest', () => {
    const placed = place(build(), 'x1', 0, 1);
    const lifted = removeBlock(placed, 's510', 0, 1);
    expect(why(lifted, 'x1', 0, 1)).toBeNull();
  });

  it('blok ikinci hücresinden tutulsa da tamamı kalkıyor', () => {
    const placed = place(build(), 'x4', 0, 1); // blockSize 2 -> hours 1 and 2
    expect(blockStart(placed, 's510', 0, 2)).toBe(1);

    const lifted = removeBlock(placed, 's510', 0, blockStart(placed, 's510', 0, 2)!);
    expect(lifted.placements[placementKey('s510', 0, 1)]).toBeUndefined();
    expect(lifted.placements[placementKey('s510', 0, 2)]).toBeUndefined();
    expect(why(lifted, 'x4', 0, 1)).toBeNull();
  });

  it('kaldırma yalnız o dersi serbest bırakıyor, başkasını değil', () => {
    let d = place(build(), 'x1', 0, 1); // MÇ, 510
    d = place(d, 'x2', 0, 2); // MÇ, 511 — same teacher, next hour
    const lifted = removeBlock(d, 's510', 0, 1);

    expect(why(lifted, 'x1', 0, 1)).toBeNull();
    // MÇ is still teaching 511 at hour 2, so that hour stays blocked for x1.
    expect(why(lifted, 'x1', 0, 2)).toBe('MÇ Pazartesi 3 saatinde 511 sınıfında');
  });

  it('sınır kuralı da kaldırılmış hâle göre hesaplanıyor', () => {
    // "at most 1 in a row": a lesson sitting at hour 1 must not make hour 1
    // itself unreachable once it has been lifted.
    const base = withRule(build(), 'maxConsecutive', 1, 'block');
    const placed = place(base, 'x1', 0, 1);
    expect(why(placed, 'x1', 0, 2)).toContain('art arda 1 saatten fazla');

    const lifted = removeBlock(placed, 's510', 0, 1);
    expect(why(lifted, 'x1', 0, 2)).toBeNull();
  });
});

// occupy/vacate are place() + buildIndex() written for a search: same effect,
// no allocation. The one thing that can go wrong is that they drift apart from
// the functions they mirror, and then the solver would produce a timetable that
// the drag engine considers illegal. This is the only guard against that.
describe('occupy / vacate — yerinde yerleştirme', () => {
  /** Everything blocker() and the rules can read, as one comparable value. */
  function snapshot(d: State) {
    const ix = buildIndex(d);
    return {
      placements: { ...d.placements },
      teacherBusy: [...ix.teacherBusy.entries()].sort(),
      roomBusy: [...ix.roomBusy.entries()].sort(),
      placedHours: [...ix.placedHours.entries()].sort(),
    };
  }

  function mutable(d: State) {
    const placements = { ...d.placements };
    const work: State = { ...d, placements };
    return { work, placements, ix: buildIndex(work) };
  }

  function live(placements: Record<string, string>, ix: ReturnType<typeof buildIndex>) {
    return {
      placements: { ...placements },
      teacherBusy: [...ix.teacherBusy.entries()].sort(),
      roomBusy: [...ix.roomBusy.entries()].sort(),
      placedHours: [...ix.placedHours.entries()].sort(),
    };
  }

  it('tek blok: place + buildIndex ile birebir aynı', () => {
    const d = build();
    const { work, placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[0]!, 'dA', 0, 1, 1);
    expect(live(placements, ix)).toEqual(snapshot(place(d, 'x1', 0, 1)));
    expect(work.placements).toBe(placements); // the state really shares the object
  });

  it('çok saatlik blok da aynı', () => {
    const d = build();
    const { placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[5]!, 'dB', 1, 0, 2); // x6 is 2+1; the first block is the double
    expect(live(placements, ix)).toEqual(snapshot(place(d, 'x6', 1, 0)));
  });

  it('üst üste yerleştirmeler de aynı', () => {
    const d = build();
    const { placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[0]!, 'dA', 0, 0, 1);
    occupy(placements, ix, d.lessons[2]!, 'dB', 0, 1, 2); // x3 is 2+2
    occupy(placements, ix, d.lessons[1]!, 'dA', 1, 3, 1);

    let expected = place(d, 'x1', 0, 0);
    expected = place(expected, 'x3', 0, 1);
    expected = place(expected, 'x2', 1, 3);
    expect(live(placements, ix)).toEqual(snapshot(expected));
  });

  it('vacate her şeyi tam olarak geri alıyor', () => {
    const d = build();
    const before = snapshot(d);
    const { placements, ix } = mutable(d);

    occupy(placements, ix, d.lessons[2]!, 'dB', 0, 1, 2);
    occupy(placements, ix, d.lessons[5]!, 'dB', 1, 0, 2);
    vacate(placements, ix, d.lessons[5]!, 'dB', 1, 0, 2);
    vacate(placements, ix, d.lessons[2]!, 'dB', 0, 1, 2);

    expect(live(placements, ix)).toEqual(before);
  });

  it('yerleşmiş bir programın üstüne eklenip geri alınabiliyor', () => {
    const d = place(build(), 'x1', 0, 0);
    const before = snapshot(d);
    const { placements, ix } = mutable(d);

    occupy(placements, ix, d.lessons[1]!, 'dA', 0, 1, 1);
    expect(live(placements, ix)).toEqual(snapshot(place(d, 'x2', 0, 1)));

    vacate(placements, ix, d.lessons[1]!, 'dA', 0, 1, 1);
    expect(live(placements, ix)).toEqual(before);
  });

  it('dersliksiz sınıfta roomBusy hiç dokunulmuyor', () => {
    const d: State = {
      ...build(),
      classes: build().classes.map((c) => (c.id === 's510' ? { ...c, roomId: null } : c)),
    };
    const { placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[0]!, null, 0, 0, 1);
    expect(live(placements, ix)).toEqual(snapshot(place(d, 'x1', 0, 0)));
    expect(ix.roomBusy.size).toBe(0);
  });

  it('occupy sonrası blocker aynı cevabı veriyor', () => {
    const d = build();
    const { work, placements, ix } = mutable(d);
    occupy(placements, ix, d.lessons[0]!, 'dA', 0, 1, 1); // x1 -> 510, Monday, hour 2

    // The class is busy, and so is MÇ.
    expect(blocker(work, ix, 'x1', 0, 1)).toBe('510 sınıfının Pazartesi 2 saatinde Matematik var');
    expect(blocker(work, ix, 'x2', 0, 1)).toBe('MÇ Pazartesi 2 saatinde 510 sınıfında');
    // The room is shared, so 511 cannot use it either.
    expect(why(place(d, 'x1', 0, 1), 'x5', 0, 1)).toBe(blocker(work, ix, 'x5', 0, 1));
  });
});

// Every message names a day and an hour, so two cells blocked for the SAME
// underlying reason produce two different sentences. The code is what anything
// counting reasons has to count.
describe('blockerDetail — sebebin kodu', () => {
  const code = (d: State, lessonId: string, day: number, hour: number, size?: number) =>
    blockerDetail(d, buildIndex(d), lessonId, day, hour, size)?.code ?? null;

  it('geçebilen hücre için null', () => {
    expect(code(build(), 'x1', 0, 0)).toBeNull();
  });

  it('gün sonuna sığmayan blok', () => {
    expect(code(build(), 'x4', 0, 3)).toBe('dayEnd'); // a double at the last of 4 hours
  });

  it('sınıf dolu / sınıf kapalı', () => {
    const busy = place(build(), 'x1', 0, 1);
    expect(code(busy, 'x4', 0, 1)).toBe('classBusy');

    const shut = { ...build(), unavailable: { ['s510|0|1']: 1 as const } };
    expect(code(shut, 'x1', 0, 1)).toBe('classClosed');
  });

  it('öğretmen müsait değil / başka sınıfta', () => {
    const away = { ...build(), unavailable: { [teacherKey('oMC', 0, 1)]: 1 as const } };
    expect(code(away, 'x1', 0, 1)).toBe('teacherClosed');

    const elsewhere = place(build(), 'x2', 0, 1); // MÇ teaching 511
    expect(code(elsewhere, 'x1', 0, 1)).toBe('teacherBusy');
  });

  it('derslik dolu / derslik kapalı', () => {
    const shared = place(build(), 'x5', 0, 1); // 511 in room A
    expect(code(shared, 'x1', 0, 1)).toBe('roomBusy'); // 510 shares room A
    // ...but only after the class and the teacher are clear, so 510's own
    // lesson with a DIFFERENT teacher is the honest probe:
    expect(blockerDetail(shared, buildIndex(shared), 'x1', 0, 1)?.message).toContain('dersliğinde');

    const shut = { ...build(), unavailable: { ['dA|0|1']: 1 as const } };
    expect(code(shut, 'x1', 0, 1)).toBe('roomClosed');
  });

  it('kural ihlali', () => {
    const d = place(withRule(build(), 'maxConsecutive', 1, 'block'), 'x1', 0, 1);
    expect(code(d, 'x1', 0, 2)).toBe('rule');
  });

  it('blocker() aynı cümleyi veriyor', () => {
    const d = place(build(), 'x1', 0, 1);
    expect(blocker(d, buildIndex(d), 'x4', 0, 1)).toBe(
      blockerDetail(d, buildIndex(d), 'x4', 0, 1)?.message,
    );
  });
});


// THE DROP MAP, and the one refusal a drop may overrule.
//
// Asked for on 2026-08-26: "farklı bir kart başka bir kartın üzerine gelirse o
// üzerine gelinen aşağı düşsün ve koyduğum olsun". The line that matters is
// which refusals it does NOT overrule: everything except the class's own other
// lesson is about somebody else, and pushing the block in front of you into
// the pool does not make a busy teacher free.
describe('dropMap — üstüne bırakma', () => {
  const at = (d: State, lessonId: string, day: number, hour: number) =>
    dropMap(d, buildIndex(d), lessonId).get(`${day}|${hour}`)!;

  it('boş hücre: engel yok, kimse havuza dönmüyor', () => {
    const v = at(build(), 'x1', 0, 0);
    expect(v.blocked).toBeNull();
    expect(v.evicts).toEqual([]);
  });

  it('sınıfın KENDİ dersinin üstüne bırakılabilir ve o ders havuza döner', () => {
    // 510 has MÇ at Monday 1; dropping 510's AV lesson on top is allowed now.
    const d = place(build(), 'x1', 0, 0);
    const v = at(d, 'x4', 0, 0);
    expect(v.blocked).toBeNull();
    expect(v.evicts).toEqual(['x1']);
  });

  it('...ama YEŞİL değil SARI: bir şey kaybedeceğini söylüyor', () => {
    const d = place(build(), 'x1', 0, 0);
    const v = at(d, 'x4', 0, 0);
    expect(v.warning).toContain('havuza dönecek');
    expect(v.warning).toContain('510');
  });

  it('öğretmen başka sınıfta: tahliye BUNU çözmez, hücre kapalı kalır', () => {
    // MÇ teaches 511 at Monday 1. 510 also has its own lesson there, so the
    // first refusal is "class busy" — but evicting it leaves MÇ where he is.
    let d = place(build(), 'x2', 0, 0); // 511 - MÇ
    d = place(d, 'x4', 0, 0); // 510 - AV  (510 is now busy too)
    const v = at(d, 'x1', 0, 0); // try to drop 510 - MÇ on top
    expect(v.blocked).not.toBeNull();
    expect(v.evicts).toEqual([]);
    expect(v.blocked).toContain('MÇ');
  });

  it('kapalı saat tahliyeyle açılmaz', () => {
    const closed: State = { ...place(build(), 'x1', 0, 0), unavailable: { ['oAV|0|0']: 1 as const } };
    const v = at(closed, 'x4', 0, 0);
    expect(v.blocked).not.toBeNull();
    expect(v.evicts).toEqual([]);
  });

  it('iki saatlik blok, üstünde iki ayrı ders varsa İKİSİNİ de çıkarır', () => {
    let d = place(build(), 'x1', 0, 0); // 510 - MÇ, 1 hour, at 0
    d = place(d, 'x1', 0, 1); // ...and again at 1 — two separate 1-hour blocks
    const v = at(d, 'x4', 0, 0); // x4 is a 2-hour block
    expect(v.blocked).toBeNull();
    // Same lesson, two blocks: both heads are found, and the id appears once
    // per block rather than once per cell.
    expect(v.evicts).toEqual(['x1', 'x1']);
  });

  it('iki saatlik bloğun ikinci hücresine denk gelmek onu BİR kez sayar', () => {
    const d = place(build(), 'x3', 0, 0); // 433 - AV, blockSize 2, covers 0 and 1
    const v = dropMap(d, buildIndex(d), 'x6').get('0|0')!; // 433 - MB, blockSize 3
    expect(v.evicts).toEqual(['x3']);
  });

  it('ızgarayı ve dizini BOZMUYOR — simülasyon geri sarılıyor', () => {
    const d = place(build(), 'x1', 0, 0);
    const ix = buildIndex(d);
    const before = JSON.stringify(d.placements);
    const busyBefore = new Map(ix.teacherBusy);
    dropMap(d, ix, 'x4');
    expect(JSON.stringify(d.placements)).toBe(before);
    expect([...ix.teacherBusy.entries()]).toEqual([...busyBefore.entries()]);
  });

  it('evict() tam olarak hedef saatleri boşaltır', () => {
    let d = place(build(), 'x1', 0, 0);
    d = place(d, 'x1', 0, 2);
    const after = evict(d, 's510', 0, [0, 1]);
    expect(after.placements[placementKey('s510', 0, 0)]).toBeUndefined();
    // The one outside the target hours is untouched.
    expect(after.placements[placementKey('s510', 0, 2)]).toBe('x1');
  });

  it('evictionNotice tekil ve çoğul', () => {
    const d = build();
    const ix = buildIndex(d);
    const x1 = ix.lessonById.get('x1')!;
    const x2 = ix.lessonById.get('x2')!;
    expect(evictionNotice(ix, [x1])).toBe('510 · MÇ dersi havuza dönecek');
    expect(evictionNotice(ix, [x1, x2])).toContain('dersleri');
  });
});
