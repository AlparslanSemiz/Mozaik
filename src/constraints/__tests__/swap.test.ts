// Two placed blocks changing places: the five exports of swap.ts, and the one
// sentence they all have to agree on.
//
// Written because the barrel's own comment says every exported function here
// has a test and this module had NONE. `swapBlocks` and `swapWarning` were
// reachable through dropMapping.test.ts; `blockName` and `swapDoneNotice`
// were reachable only from Program.tsx, which no unit test opens. A promise
// with nothing measuring it is an intention (pitfall 77).

import { placementKey, teacherKey } from '../../keys';
import { activePlacements } from '../../state/programs';
import { build, withRule } from '../../testing/constraintFixture';
import type { State } from '../../types';
import { buildIndex, place } from '../placement';
import type { BlockRef } from '../placement';
import { setBlockPinned } from '../pinning';
import {
  blockName,
  swapBlocks,
  swapDoneNotice,
  swapWarning,
  swapWillNotice,
} from '../swap';

const ref = (
  lessonId: string,
  classId: string,
  day: number,
  hour: number,
  size: number,
): BlockRef => ({ lessonId, classId, day, hour, size });

/** x1 (MÇ · 510) on Monday hour 0, x2 (MÇ · 511) on Monday hour 1. */
function twoBlocks(): State {
  return place(place(build(), 'x1', 0, 0, 1), 'x2', 0, 1, 1);
}

const X1 = ref('x1', 's510', 0, 0, 1);
const X2 = ref('x2', 's511', 0, 1, 1);

describe('blockName — bir bloğun adı sınıfı ve öğretmeni', () => {
  it('sınıf adı · öğretmen kısaltması', () => {
    expect(blockName(buildIndex(twoBlocks()), X1)).toBe('510 · MÇ');
    expect(blockName(buildIndex(twoBlocks()), X2)).toBe('511 · MÇ');
  });

  it('ders bilinmiyorsa öğretmen tarafı soru işareti olur', () => {
    expect(blockName(buildIndex(build()), ref('yok', 's510', 0, 0, 1))).toBe('510 · ?');
  });

  it('sınıf bilinmiyorsa sınıf tarafı soru işareti olur', () => {
    expect(blockName(buildIndex(build()), ref('x1', 'yok', 0, 0, 1))).toBe('? · MÇ');
  });
});

describe('takasın İKİ cümlesi — biri elde, biri olup bittikten sonra', () => {
  // dropMap() hover ederken birini, swapBlocks() tıklandığında ötekini
  // yazıyor. Aynı hamlenin iki ANI, o yüzden aynı adları taşımak ve yalnız
  // zamanda ayrışmak zorundalar.
  it('gelecek zaman: yer değiştirecek', () => {
    expect(swapWillNotice(buildIndex(twoBlocks()), X1, X2)).toBe(
      '510 · MÇ ile 511 · MÇ yer değiştirecek',
    );
  });

  it('geçmiş zaman: yer değiştirdi', () => {
    expect(swapDoneNotice(buildIndex(twoBlocks()), X1, X2)).toBe(
      '510 · MÇ ile 511 · MÇ yer değiştirdi',
    );
  });

  it('ikisi aynı cümle DEĞİL', () => {
    const ix = buildIndex(twoBlocks());
    expect(swapWillNotice(ix, X1, X2)).not.toBe(swapDoneNotice(ix, X1, X2));
  });
});

describe('swapWarning — cümle artı, varsa, sarı gerekçe', () => {
  it('kural uyarısı yokken swapWillNotice ile BİREBİR aynı', () => {
    const ix = buildIndex(twoBlocks());
    expect(swapWarning(ix, X1, X2, null)).toBe(swapWillNotice(ix, X1, X2));
  });

  it('kural uyarısı varsa araya ORTA NOKTA girer', () => {
    const ix = buildIndex(twoBlocks());
    // Uzun çizgi değil orta nokta: eşit ağırlıkta iki şey arasındaki ayraç
    // (CLAUDE.md'nin metin kuralı; ekranda e2e/gorme/metin.spec.ts ölçüyor).
    expect(swapWarning(ix, X1, X2, 'günde en fazla 1 saat')).toBe(
      '510 · MÇ ile 511 · MÇ yer değiştirecek · günde en fazla 1 saat',
    );
    expect(swapWarning(ix, X1, X2, 'bir şey')).not.toContain('—');
  });
});

describe('swapBlocks — reddettikleri', () => {
  it('kaynak blok orada değilse null', () => {
    expect(swapBlocks(build(), X1, X2)).toBeNull();
  });

  it('hedef blok orada değilse null', () => {
    const d = place(build(), 'x1', 0, 0, 1);
    expect(swapBlocks(d, X1, X2)).toBeNull();
  });

  it('kaynak SABİTLENMİŞSE null', () => {
    // "Bir bloğu sabitlemeyi kaldırmaktan başka hiçbir şey indirmez" — takas
    // da o cümlenin kapsamında, ve bu onun tek testi.
    const d = setBlockPinned(twoBlocks(), 's510', 0, 0, true);
    expect(swapBlocks(d, X1, X2)).toBeNull();
  });

  it('hedef SABİTLENMİŞSE null', () => {
    const d = setBlockPinned(twoBlocks(), 's511', 0, 1, true);
    expect(swapBlocks(d, X1, X2)).toBeNull();
  });

  it('dersi silinmiş bir blok null', () => {
    // blockAt() dersi olmayan bir hücreyi tek saatlik blok sayıyor, yani
    // sameBlock() bu durumu GEÇİRİYOR; reddi yapan şey lessons.find.
    const laid = twoBlocks();
    const d: State = { ...laid, lessons: laid.lessons.filter((x) => x.id !== 'x1') };
    expect(swapBlocks(d, X1, X2)).toBeNull();
  });

  it('kaynak karşı saate GİDEMİYORSA null', () => {
    const laid = twoBlocks();
    const d: State = {
      ...laid,
      unavailable: { ...laid.unavailable, [teacherKey('oMC', 0, 1)]: 1 },
    };
    expect(swapBlocks(d, X1, X2)).toBeNull();
  });

  it('hedef karşı saate gidemiyorsa null, ve ızgara YARIM KALMAZ', () => {
    // İkinci check düşerse ilk place() çoktan yapılmıştır. Bu satır o yarım
    // hâlin dışarı sızmadığını ölçüyor: swapBlocks yerel bir kopya üstünde
    // çalışıyor. Aynı klasörde occupy/vacate duruyor ve onlar YERİNDE
    // yazıyor — biri swapBlocks'u onlarla hızlandırırsa kırılacak yer burası.
    let laid = place(build(), 'x1', 0, 0, 1);
    laid = place(laid, 'x3', 0, 2, 1);
    const d: State = {
      ...laid,
      unavailable: { ...laid.unavailable, [teacherKey('oAV', 0, 0)]: 1 },
    };
    const source = ref('x1', 's510', 0, 0, 1);
    const target = ref('x3', 's433', 0, 2, 1);

    expect(swapBlocks(d, source, target)).toBeNull();
    expect(activePlacements(d)[placementKey('s510', 0, 0)]).toBe('x1');
    expect(activePlacements(d)[placementKey('s433', 0, 2)]).toBe('x3');
    expect(activePlacements(d)[placementKey('s510', 0, 2)]).toBeUndefined();
  });
});

describe('swapBlocks — yaptıkları', () => {
  it('iki bloğu karşılıklı değiştirir ve GİRDİYİ bozmaz', () => {
    const d = twoBlocks();
    const result = swapBlocks(d, X1, X2);

    expect(result).not.toBeNull();
    expect(activePlacements(result!.state)[placementKey('s510', 0, 1)]).toBe('x1');
    expect(activePlacements(result!.state)[placementKey('s511', 0, 0)]).toBe('x2');
    expect(activePlacements(result!.state)[placementKey('s510', 0, 0)]).toBeUndefined();
    expect(activePlacements(result!.state)[placementKey('s511', 0, 1)]).toBeUndefined();

    expect(activePlacements(d)[placementKey('s510', 0, 0)]).toBe('x1');
    expect(activePlacements(d)[placementKey('s511', 0, 1)]).toBe('x2');
  });

  it('farklı BOYLARI koruyarak değiştirir', () => {
    let d = place(build(), 'x3', 0, 0, 2);
    d = place(d, 'x6', 0, 2, 1);
    const result = swapBlocks(d, ref('x3', 's433', 0, 0, 2), ref('x6', 's433', 0, 2, 1));

    expect(result).not.toBeNull();
    expect(activePlacements(result!.state)[placementKey('s433', 0, 2)]).toBe('x3');
    expect(activePlacements(result!.state)[placementKey('s433', 0, 3)]).toBe('x3');
    expect(activePlacements(result!.state)[placementKey('s433', 0, 0)]).toBe('x6');
    expect(activePlacements(result!.state)[placementKey('s433', 0, 1)]).toBeUndefined();
  });

  it('uyarısız takasın warning alanı sadece cümledir', () => {
    const result = swapBlocks(twoBlocks(), X1, X2);
    expect(result!.warning).toBe('510 · MÇ ile 511 · MÇ yer değiştirecek');
  });

  it('Uyar seviyesindeki bir kural warning alanına eklenir', () => {
    let d = place(build(), 'x1', 0, 0, 1);
    d = place(d, 'x4', 1, 0, 2);
    d = place(d, 'x1', 1, 2, 1);
    d = withRule(d, 'maxSameLessonPerDay', 1, 'warn');
    const result = swapBlocks(d, ref('x1', 's510', 0, 0, 1), ref('x4', 's510', 1, 0, 2));

    expect(result).not.toBeNull();
    expect(result!.warning).toContain('yer değiştirecek');
    expect(result!.warning).toContain('en fazla 1 saat');
    expect(activePlacements(result!.state)[placementKey('s510', 1, 0)]).toBe('x1');
    expect(activePlacements(result!.state)[placementKey('s510', 0, 0)]).toBe('x4');
    expect(activePlacements(result!.state)[placementKey('s510', 0, 1)]).toBe('x4');
  });
});
