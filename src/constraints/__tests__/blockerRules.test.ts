// The hard constraints and the three configurable limits, plus what a refusal
// SAYS: the sentence decides the reader's next move, so it is asserted whole.

import {
  blocker,
  blockerDetail,
  place,
  sanitize,
  validHours,
  buildIndex,
  teacherKey,
} from '../index';
import type { State } from '../../types';
import { build, verdict, why, withRule } from '../../testing/constraintFixture';

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

  // The middle layer, through the same funnel every drop goes through: one
  // number on the class, and every lesson that class has obeys it.
  it('sınıfın kutusu okul varsayılanını ezer', () => {
    let d = withRule(build(), 'maxSameLessonPerDay', 4, 'block');
    d = { ...d, classes: d.classes.map((c) => (c.id === 's510' ? { ...c, maxSameLessonPerDay: 1 } : c)) };
    d = place(d, 'x1', 0, 0);
    expect(why(d, 'x1', 0, 2)).toBe(
      '510 sınıfı Pazartesi günü MÇ dersinden en fazla 1 saat görmeli, burada 2 saat olur',
    );
  });

  it('dersin kutusu SINIFIN kutusunu da ezer', () => {
    let d = withRule(build(), 'maxSameLessonPerDay', 4, 'block');
    d = { ...d, classes: d.classes.map((c) => (c.id === 's510' ? { ...c, maxSameLessonPerDay: 1 } : c)) };
    d = { ...d, lessons: d.lessons.map((x) => (x.id === 'x1' ? { ...x, maxPerDay: 3 } : x)) };
    d = place(d, 'x1', 0, 0);
    expect(why(d, 'x1', 0, 2)).toBeNull();
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
