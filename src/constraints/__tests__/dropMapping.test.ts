// Dropping onto an occupied cell: what goes back to the pool, what swaps, and
// what stays refused because the obstacle is somebody else's.

import {
  blockStart,
  dropMap,
  place,
  placementKey,
  removeBlock,
  setBlockPinned,
  buildIndex,
  teacherKey,
  closedKey,
  applyDrop,
  evict,
  evictionNotice,
} from '../index';
import type { BlockRef } from '../index';
import { activeProgram } from '../../programs';
import type { State } from '../../types';
import { build, why, withRule } from '../../testing/constraintFixture';

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
    expect(activeProgram(lifted).placements[placementKey('s510', 0, 1)]).toBeUndefined();
    expect(activeProgram(lifted).placements[placementKey('s510', 0, 2)]).toBeUndefined();
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
    const before = JSON.stringify(activeProgram(d).placements);
    const busyBefore = new Map(ix.teacherBusy);
    dropMap(d, ix, 'x4');
    expect(JSON.stringify(activeProgram(d).placements)).toBe(before);
    expect([...ix.teacherBusy.entries()]).toEqual([...busyBefore.entries()]);
  });

  it('evict() tam olarak hedef saatleri boşaltır', () => {
    let d = place(build(), 'x1', 0, 0);
    d = place(d, 'x1', 0, 2);
    const after = evict(d, 's510', 0, [0, 1]);
    expect(activeProgram(after).placements[placementKey('s510', 0, 0)]).toBeUndefined();
    // The one outside the target hours is untouched.
    expect(activeProgram(after).placements[placementKey('s510', 0, 2)]).toBe('x1');
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


describe('yerleşmiş blokların atomik takası', () => {
  const ref = (
    lessonId: string,
    classId: string,
    day: number,
    hour: number,
    size: number,
  ): BlockRef => ({ lessonId, classId, day, hour, size });

  function swapAt(d: State, source: BlockRef, day: number, hour: number) {
    const verdict = dropMap(d, buildIndex(d), source.lessonId, source.size, source)
      .get(`${day}|${hour}`)!;
    return {
      verdict,
      state: applyDrop(d, {
        lessonId: source.lessonId,
        size: source.size,
        source,
        day,
        hour,
        action: verdict.action,
      }),
    };
  }

  it('öğretmenin iki sınıftaki dersini karşılıklı değiştirir', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x2', 0, 1, 1);
    const source = ref('x1', 's510', 0, 0, 1);
    const result = swapAt(d, source, 0, 1);

    expect(result.verdict.action.kind).toBe('swap');
    expect(result.verdict.warning).toContain('yer değiştirecek');
    expect(activeProgram(result.state).placements[placementKey('s510', 0, 1)]).toBe('x1');
    expect(activeProgram(result.state).placements[placementKey('s511', 0, 0)]).toBe('x2');
  });

  it('aynı sınıftaki farklı uzunlukları, uzunluklarını koruyarak değiştirir', () => {
    let d = place(build(), 'x3', 0, 0, 2);
    d = place(d, 'x6', 0, 2, 1);
    const source = ref('x3', 's433', 0, 0, 2);
    const result = swapAt(d, source, 0, 2);

    expect(result.verdict.action.kind).toBe('swap');
    expect(activeProgram(result.state).placements[placementKey('s433', 0, 2)]).toBe('x3');
    expect(activeProgram(result.state).placements[placementKey('s433', 0, 3)]).toBe('x3');
    expect(activeProgram(result.state).placements[placementKey('s433', 0, 0)]).toBe('x6');
    expect(activeProgram(result.state).placements[placementKey('s433', 0, 1)]).toBeUndefined();
  });

  it('sabit hedefi değiştirmez', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x2', 0, 1, 1);
    d = setBlockPinned(d, 's511', 0, 1, true);
    const before = activeProgram(d).placements;
    const result = swapAt(d, ref('x1', 's510', 0, 0, 1), 0, 1);

    expect(result.verdict.action.kind).not.toBe('swap');
    expect(activeProgram(result.state).placements).toEqual(before);
  });

  it('karşı konum sonradan kapanmışsa takası reddeder', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x2', 0, 1, 1);
    d = { ...d, unavailable: { [closedKey('s511', 0, 0)]: 1 } };
    const result = swapAt(d, ref('x1', 's510', 0, 0, 1), 0, 1);

    expect(result.verdict.action.kind).not.toBe('swap');
    expect(result.state).toBe(d);
  });

  it('öğretmen karşı saatte kapalıysa takası reddeder', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x2', 0, 1, 1);
    d = { ...d, unavailable: { [teacherKey('oMC', 0, 1)]: 1 } };
    const result = swapAt(d, ref('x1', 's510', 0, 0, 1), 0, 1);

    expect(result.verdict.action.kind).not.toBe('swap');
    expect(result.state).toBe(d);
  });

  it('kaynak sınıfın dersliği karşı saatte kapalıysa takası reddeder', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x2', 0, 1, 1);
    d = { ...d, unavailable: { [teacherKey('dA', 0, 1)]: 1 } };
    const result = swapAt(d, ref('x1', 's510', 0, 0, 1), 0, 1);

    expect(result.verdict.action.kind).not.toBe('swap');
    expect(result.state).toBe(d);
  });

  it('karşı günde aynı dersin sert günlük sınırı aşılacaksa takası reddeder', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x4', 1, 0, 2);
    d = place(d, 'x1', 1, 2, 1);
    d = withRule(d, 'maxSameLessonPerDay', 1, 'block');
    const result = swapAt(d, ref('x1', 's510', 0, 0, 1), 1, 0);

    expect(result.verdict.action.kind).not.toBe('swap');
    expect(result.state).toBe(d);
  });

  it('aynı günlük sınır Uyar ise takası yapar ve sarı gerekçeyi taşır', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x4', 1, 0, 2);
    d = place(d, 'x1', 1, 2, 1);
    d = withRule(d, 'maxSameLessonPerDay', 1, 'warn');
    const result = swapAt(d, ref('x1', 's510', 0, 0, 1), 1, 0);

    expect(result.verdict.action.kind).toBe('swap');
    expect(result.verdict.warning).toContain('en fazla 1 saat');
    expect(activeProgram(result.state).placements[placementKey('s510', 1, 0)]).toBe('x1');
    expect(activeProgram(result.state).placements[placementKey('s510', 0, 0)]).toBe('x4');
    expect(activeProgram(result.state).placements[placementKey('s510', 0, 1)]).toBe('x4');
  });

  it('bir öğretmenin satırında birden çok takas adayı birbirini bozmaz', () => {
    // dropMap() taşıdığı kartı bırakırken oAV'nin bütün satırını tek geçişte
    // tarar; x5 ve x3 iki AYRI aday hücre. Biri işlenirken kullanılan
    // work/workIx çalışma kopyası bir sonraki adaya bozuk kalırsa (pitfall
    // 76 ailesi), ya yanlış bir hüküm ya da iki adayın birbirinin yerine
    // geçen bir sonuç çıkar — üçü de burada tek dropMap() çağrısıyla sınanır.
    let d = place(build(), 'x4', 0, 0, 1); // oAV · 510
    d = place(d, 'x5', 0, 2, 1); // oAV · 511, aralarında boş bir saat var
    d = place(d, 'x3', 1, 0, 1); // oAV · 433, başka bir gün
    const source = ref('x4', 's510', 0, 0, 1);
    const map = dropMap(d, buildIndex(d), 'x4', 1, source);

    const withX5 = map.get('0|2')!;
    const withX3 = map.get('1|0')!;
    expect(withX5.action.kind).toBe('swap');
    expect(withX3.action.kind).toBe('swap');

    const afterX5 = applyDrop(d, {
      lessonId: 'x4', size: 1, source, day: 0, hour: 2, action: withX5.action,
    });
    expect(activeProgram(afterX5).placements[placementKey('s510', 0, 2)]).toBe('x4');
    expect(activeProgram(afterX5).placements[placementKey('s511', 0, 0)]).toBe('x5');
    // x3, hiç dokunulmayan üçüncü ders — öteki adayın hesabından etkilenmemeli.
    expect(activeProgram(afterX5).placements[placementKey('s433', 1, 0)]).toBe('x3');

    const afterX3 = applyDrop(d, {
      lessonId: 'x4', size: 1, source, day: 1, hour: 0, action: withX3.action,
    });
    expect(activeProgram(afterX3).placements[placementKey('s510', 1, 0)]).toBe('x4');
    expect(activeProgram(afterX3).placements[placementKey('s433', 0, 0)]).toBe('x3');
    // x5, dropMap'in TARADIĞI ama seçilmeyen aday — d'deki hâliyle kalmalı.
    expect(activeProgram(afterX3).placements[placementKey('s511', 0, 2)]).toBe('x5');
  });

  it('harita çıkarıldıktan sonra hedef değişmişse güncel veriye dokunmaz', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x2', 0, 1, 1);
    const source = ref('x1', 's510', 0, 0, 1);
    const verdict = dropMap(d, buildIndex(d), 'x1', 1, source).get('0|1')!;
    expect(verdict.action.kind).toBe('swap');

    const changed = removeBlock(d, 's511', 0, 1);
    const after = applyDrop(changed, {
      lessonId: 'x1',
      size: 1,
      source,
      day: 0,
      hour: 1,
      action: verdict.action,
    });
    expect(after).toBe(changed);
  });
});

