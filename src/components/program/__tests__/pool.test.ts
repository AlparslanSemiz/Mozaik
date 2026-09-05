// The tray's cards, and the order they sit in.
//
// The headline here is the one pool.ts's own comment asks for and nothing has
// ever measured: EVERY ONE of the five orders ends with the same two keys, so
// a lesson's identical cards always arrive as neighbours. `stackCards()` in
// LessonPool.tsx reads consecutive runs and draws them as one deck; an order
// that lets a lesson's cards drift apart turns one deck into several and no
// existing test counts decks.

import { buildIndex } from '../../../constraints';
import { translate } from '../../../i18n';
import { placementKey } from '../../../keys';
import { makeWorld } from '../../../testing/worlds';
import type { State } from '../../../types';
import type { PoolSort } from '../../../view/toolState';
import { EMPTY_PROGRAM_MASK, setRowMask } from '../../../view/programMask';
import { buildPool, poolGroup, poolOrder } from '../pool';

const t = (key: string, vars?: Record<string, string | number>) =>
  translate('tr', key, vars);

const SORTS: PoolSort[] = ['row', 'name', 'subject', 'size', 'left'];

function pool(
  d: State,
  opts: {
    view?: 'teacher' | 'class';
    sort?: PoolSort;
    filter?: string;
    mask?: typeof EMPTY_PROGRAM_MASK;
  } = {},
) {
  return buildPool(
    d,
    buildIndex(d),
    opts.view ?? 'teacher',
    opts.mask ?? EMPTY_PROGRAM_MASK,
    opts.sort ?? 'row',
    opts.filter ?? '',
    'teacher',
    t,
  );
}

/**
 * Three teachers, three classes, three lessons of three different SHAPES:
 * 5h as 2+2+1, 3h as 2+1, and 4h of singles. Nine pending blocks in all.
 */
function school(placements: Record<string, string> = {}): State {
  return makeWorld({
    days: 2,
    hours: 6,
    rooms: [{ id: 'dA', name: 'A' }],
    teachers: [
      { id: 'oMC', short: 'MÇ', subject: 'Matematik' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
      { id: 'oMB', short: 'MB', subject: 'Matematik' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's433', name: '433', roomId: 'dA' },
      { id: 's511', name: '511', roomId: 'dA' },
    ],
    lessons: [
      { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 5, blockSize: 2 },
      { id: 'x2', classId: 's433', teacherId: 'oAV', weeklyHours: 3, blockSize: 2 },
      { id: 'x3', classId: 's511', teacherId: 'oMB', weeklyHours: 4 },
    ],
    placements,
  });
}

describe('bir kart bir BLOK, bir ders değil', () => {
  it('2+2+1 üç kart bırakır ve boyları yazar', () => {
    const cards = pool(school()).cards.filter((c) => c.lessonId === 'x1');
    expect(cards.map((c) => c.size)).toEqual([2, 2, 1]);
  });

  it('kart kimliği HANGİ kart olduğunu taşır', () => {
    // Aynı dersin iki özdeş kartı aynı React kimliğini alırsa bir düğüm
    // ikisi için yeniden kullanılır ve tepsi veriyle uyuşmaz olur.
    const cards = pool(school()).cards.filter((c) => c.lessonId === 'x1');
    expect(cards.map((c) => c.key)).toEqual(['x1#2#0', 'x1#2#1', 'x1#1#2']);
    expect(new Set(cards.map((c) => c.key)).size).toBe(3);
  });

  it('yerleşen blok tepsiden DÜŞER', () => {
    const laid = school({
      [placementKey('s510', 0, 0)]: 'x1',
      [placementKey('s510', 0, 1)]: 'x1',
    });
    const cards = pool(laid).cards.filter((c) => c.lessonId === 'x1');
    expect(cards.map((c) => c.size)).toEqual([2, 1]);
  });

  it('borcu biten ders kart üretmez, completed sayar', () => {
    const done = school({
      [placementKey('s433', 0, 0)]: 'x2',
      [placementKey('s433', 0, 1)]: 'x2',
      [placementKey('s433', 0, 2)]: 'x2',
    });
    const result = pool(done);
    expect(result.cards.some((c) => c.lessonId === 'x2')).toBe(false);
    expect(result.completed).toBe(1);
  });

  it('boş ızgarada toplam dokuz blok', () => {
    const result = pool(school());
    expect(result.total).toBe(9);
    expect(result.cards).toHaveLength(9);
    expect(result.completed).toBe(0);
  });
});

describe('süzgeç — total SÜZGEÇTEN ÖNCE sayılır', () => {
  // Tepsinin başlığı "3 / 9" diyebilsin diye böyle. Süzülen kartların yok
  // olmuş gibi davranmak, "hepsi yerleşti"yi bir tık ötede yalan yapardı.
  it('branşa süzülünce kart azalır ama total azalmaz', () => {
    const result = pool(school(), { filter: 'fizik' });
    expect(result.total).toBe(9);
    expect(result.cards).toHaveLength(2);
    expect(result.cards.every((c) => c.lessonId === 'x2')).toBe(true);
  });

  it('süzgeç anahtarı Türkçe küçük harf — büyük harfli branş adı da eşler', () => {
    expect(pool(school(), { filter: 'matematik' }).cards).toHaveLength(7);
  });

  it('hiçbir şeye uymayan süzgeç boş tepsi verir, total durur', () => {
    const result = pool(school(), { filter: 'kimya' });
    expect(result.cards).toHaveLength(0);
    expect(result.total).toBe(9);
  });
});

describe('BEŞ SIRALAMANIN ORTAK KUYRUĞU — LessonPool ardışık KOŞU okuyor', () => {
  // pool.ts'in kendi yorumu bunu adıyla istiyor ve bugüne kadar hiçbir şey
  // ölçmüyordu. LessonPool iki kez ardışık koşu okuyor ve ikisinin anahtarı
  // AYRI:
  //   stackCards()  bir deste = aynı ders VE aynı boy
  //   groupStacks() bir başlık = aynı `group` etiketi
  // İkisi de "buildPool onları zaten komşu verdi" varsayıyor. Bozulunca
  // ortaya bir hata çıkmaz: bir deste yerine aynı kartın dağılmış kopyaları,
  // ya da aynı başlığın iki kez yazılması — ve kırk test `.pool-card` sayıyor.
  //
  // Deste anahtarının ders DEĞİL (ders, boy) olduğu ölçülerek öğrenildi:
  // 'size' sıralaması 2+2+1'lik bir dersin tekli kartını bilerek ötekilerden
  // ayırıyor, çünkü sıralamanın birinci anahtarı boyun kendisi. Öteki dörtte
  // bir dersin BÜTÜN kartları bitişik kalmak zorunda, ve `tail`in
  // compareTr(lessonId) yarısını yük taşıyan tek şey o dört sıralama:
  // kuyruk düşürülünce 'name' iki dersi zz#2 aa#2 zz#1 aa#1 diye iç içe
  // geçiriyor (ölçüldü) — deste de başlık da bozulmadan.
  const runsAreContiguous = (keys: string[]): string | null => {
    const at = new Map<string, number[]>();
    keys.forEach((key, i) => at.set(key, [...(at.get(key) ?? []), i]));
    for (const [key, list] of at) {
      if (list[list.length - 1]! - list[0]! !== list.length - 1) return key;
    }
    return null;
  };

  /** Aynı öğretmenin aynı sınıftaki İKİ dersi: kuyruktan önceki her anahtar eşit. */
  function tiedSchool(): State {
    return makeWorld({
      days: 2,
      hours: 6,
      teachers: [{ id: 'oMC', short: 'MÇ', subject: 'Matematik' }],
      classes: [{ id: 's510', name: '510', roomId: 'dA' }],
      lessons: [
        { id: 'zz', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 2 },
        { id: 'aa', classId: 's510', teacherId: 'oMC', weeklyHours: 3, blockSize: 2 },
      ],
    });
  }

  for (const sort of SORTS) {
    it(`'${sort}': bir DESTE (ders + boy) tek koşu`, () => {
      for (const d of [school(), tiedSchool()]) {
        const cards = pool(d, { sort }).cards;
        expect(runsAreContiguous(cards.map((c) => `${c.lessonId}#${c.size}`))).toBeNull();
      }
    });

    it(`'${sort}': bir BAŞLIK tek koşu`, () => {
      for (const d of [school(), tiedSchool()]) {
        const cards = pool(d, { sort }).cards;
        expect(runsAreContiguous(cards.map((c) => c.group))).toBeNull();
      }
    });

    it(`'${sort}': bir dersin blokları BÜYÜKTEN KÜÇÜĞE`, () => {
      const cards = pool(school(), { sort }).cards;
      const sizes = cards.filter((c) => c.lessonId === 'x1').map((c) => c.size);
      expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
    });

    if (sort !== 'size') {
      it(`'${sort}': bir DERSİN kartları başkasınınkiyle iç içe geçmez`, () => {
        for (const d of [school(), tiedSchool()]) {
          const cards = pool(d, { sort }).cards;
          expect(runsAreContiguous(cards.map((c) => c.lessonId))).toBeNull();
        }
      });
    }
  }

  it("'size' bir dersi bilerek boyuna göre AYIRIR", () => {
    // Bu satır yukarıdaki istisnayı bir unutkanlık değil bir KARAR yapıyor.
    const cards = pool(school(), { sort: 'size' }).cards;
    const at = cards.flatMap((c, i) => (c.lessonId === 'x1' ? [i] : []));
    expect(at[at.length - 1]! - at[0]!).toBeGreaterThan(at.length - 1);
  });

  it('poolOrder beş sıralamanın beşi için de bir karşılaştırıcı verir', () => {
    for (const sort of SORTS) expect(typeof poolOrder(sort)).toBe('function');
  });
});

describe('sıralamalar gerçekten farklı sıralıyor', () => {
  it("'size' uzun blokları öne alır", () => {
    const cards = pool(school(), { sort: 'size' }).cards;
    expect(cards[0]!.size).toBe(2);
    expect(cards[cards.length - 1]!.size).toBe(1);
  });

  it("'row' tepsiyi ızgaranın sırasında akıtır", () => {
    // Elle sıralanmış bir ızgaranın altında alfabetik bir tepsi, baktığın
    // satırın kartlarını yukarı doğru aratır.
    const rows = pool(school(), { sort: 'row' }).cards.map((c) => c.row);
    expect(rows).toEqual([...rows].sort((a, b) => a - b));
  });

  it("'left' en çok kalanı öne alır", () => {
    const first = pool(school(), { sort: 'left' }).cards[0]!;
    expect(first.total - first.placed).toBe(5); // x1, beş saat
  });
});

describe('poolGroup — başlık SIRALAMADAN türer', () => {
  const card = pool(school()).cards.find((c) => c.lessonId === 'x1')!;

  it("'subject' branş adını yazar", () => {
    expect(poolGroup({ ...card, subject: 'Matematik' }, 'subject', t)).toBe('Matematik');
  });

  it("'size' blok boyunu yazar", () => {
    expect(poolGroup({ ...card, size: 2 }, 'size', t)).toBe('2 saatlik bloklar');
  });

  it("'left' kalan saati yazar", () => {
    expect(poolGroup({ ...card, total: 5, placed: 2 }, 'left', t)).toBe('3 saat kaldı');
  });

  it("'row' ve 'name' kartın gideceği satırı yazar", () => {
    expect(poolGroup({ ...card, bottom: 'MÇ' }, 'row', t)).toBe('MÇ');
    expect(poolGroup({ ...card, bottom: 'MÇ' }, 'name', t)).toBe('MÇ');
  });

  it('buildPool başlığı kartın ÜSTÜNE yazar, ve sıralamayla değişir', () => {
    // Ayarın karşılığı gözle görülür olsun diye: "branşa göre" seçip aynı
    // adsız dikdörtgen duvarını görmek hiçbir şey değiştirmeyen bir ayardır.
    const bySize = pool(school(), { sort: 'size' }).cards[0]!;
    const byRow = pool(school(), { sort: 'row' }).cards[0]!;
    expect(bySize.group).toBe('2 saatlik bloklar');
    expect(byRow.group).not.toBe(bySize.group);
  });
});

describe('eksen — top hücrenin okuyacağı şey, bottom kartın gideceği satır', () => {
  it('öğretmen ekseninde üstte sınıf, altta öğretmen', () => {
    const card = pool(school()).cards.find((c) => c.lessonId === 'x1')!;
    expect(card.top).toBe('510');
    expect(card.bottom).toBe('MÇ');
  });

  it('sınıf ekseninde ikisi YER DEĞİŞTİRİR', () => {
    const card = pool(school(), { view: 'class' }).cards.find((c) => c.lessonId === 'x1')!;
    expect(card.top).toBe('MÇ');
    expect(card.bottom).toBe('510');
  });

  it('row karşı eksenin listesindeki POZİSYON', () => {
    const teacherView = pool(school()).cards.find((c) => c.lessonId === 'x3')!;
    const classView = pool(school(), { view: 'class' }).cards.find((c) => c.lessonId === 'x3')!;
    expect(teacherView.row).toBe(2); // oMB, öğretmen listesinin üçüncüsü
    expect(classView.row).toBe(2); // s511, sınıf listesinin üçüncüsü
  });
});

describe('mask — gizli satırın kartı YOK, hayaletinki solgun', () => {
  it('hidden satırın kartları hiç üretilmez ve TOTAL de saymaz', () => {
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'teacher', 'oMC', 'hidden');
    const result = pool(school(), { mask });
    expect(result.cards.some((c) => c.lessonId === 'x1')).toBe(false);
    expect(result.total).toBe(6);
  });

  it('ghost satırın kartları kalır, masked işaretiyle', () => {
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'teacher', 'oMC', 'ghost');
    const cards = pool(school(), { mask }).cards;
    expect(cards.filter((c) => c.lessonId === 'x1')).toHaveLength(3);
    expect(cards.filter((c) => c.lessonId === 'x1').every((c) => c.masked)).toBe(true);
    expect(cards.find((c) => c.lessonId === 'x2')!.masked).toBe(false);
  });

  it('KARŞI eksende gizlenen sınıf da kartı düşürür', () => {
    const mask = setRowMask(EMPTY_PROGRAM_MASK, 'class', 's510', 'hidden');
    expect(pool(school(), { mask }).cards.some((c) => c.lessonId === 'x1')).toBe(false);
  });
});

describe('sayaçlar — placed ve total dersin kendisinden', () => {
  it('yerleşmiş saat sayısı kartta durur', () => {
    const laid = school({
      [placementKey('s510', 0, 0)]: 'x1',
      [placementKey('s510', 0, 1)]: 'x1',
    });
    const card = pool(laid).cards.find((c) => c.lessonId === 'x1')!;
    expect(card.placed).toBe(2);
    expect(card.total).toBe(5);
  });
});
