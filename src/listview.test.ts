import { describe, expect, it } from 'vitest';
import {
  applyList,
  byNumberThen,
  compareTr,
  canReorder,
  EMPTY_QUERY,
  facetCounts,
  fold,
  isFiltering,
} from './listview';
import type { ListConfig } from './listview';

interface Row {
  name: string;
  subject: string;
  load: number;
  gender: string;
}

const ROWS: Row[] = [
  { name: 'Şükrü Öz', subject: 'Matematik', load: 20, gender: 'Erkek' },
  { name: 'Ilgaz Ay', subject: 'Fizik', load: 12, gender: 'Kadın' },
  { name: 'İlknur Aydın', subject: 'Matematik', load: 12, gender: 'Kadın' },
  { name: 'Çetin Gül', subject: '', load: 30, gender: 'Erkek' },
];

const CFG: ListConfig<Row> = {
  haystack: (x) => `${x.name} ${x.subject}`,
  sorts: [
    { id: 'ad', label: 'Ada göre', cmp: (a, b) => compareTr(a.name, b.name) },
    { id: 'yuk', label: 'Yüke göre', cmp: byNumberThen((x) => x.load, (x) => x.name) },
  ],
  facets: [
    { id: 'brans', label: 'Branş', of: (x) => x.subject },
    { id: 'cinsiyet', label: 'Cinsiyet', of: (x) => x.gender },
  ],
};

describe('fold', () => {
  // The one that makes this file exist: the default locale turns "İ" into an
  // `i` plus a COMBINING DOT ABOVE, so `'İlknur'.toLowerCase().includes('il')`
  // is false and a search for "ilknur" finds nothing.
  it('Türkçe İ ve I doğru küçülüyor', () => {
    expect(fold('İlknur')).toBe('ilknur');
    expect(fold('ILGAZ')).toBe('ilgaz');
    expect('İlknur'.toLowerCase().includes('il')).toBe(false); // the bug itself
    expect(fold('İlknur').includes('il')).toBe(true);
  });

  it('aksanlı harfler düzleniyor — hızlı yazan biri onları atlar', () => {
    expect(fold('Öğretmen')).toBe('ogretmen');
    expect(fold('ŞÜKRÜ')).toBe('sukru');
    expect(fold('Çetin Gül')).toBe('cetin gul');
  });
});

describe('compareTr', () => {
  it('Türk alfabesi sırası: ı i, c ç, g ğ, s ş', () => {
    const sorted = ['şule', 'çınar', 'ırmak', 'inci', 'gül', 'ğ'].sort(compareTr);
    expect(sorted.indexOf('ırmak')).toBeLessThan(sorted.indexOf('inci'));
    expect(sorted.indexOf('çınar')).toBeLessThan(sorted.indexOf('gül'));
    expect(sorted.indexOf('gül')).toBeLessThan(sorted.indexOf('şule'));
  });
});

describe('applyList', () => {
  it('sorgu yokken listeyi OLDUĞU GİBİ verir', () => {
    expect(applyList(ROWS, EMPTY_QUERY, CFG)).toEqual(ROWS);
  });

  it('arama aksansız yazılsa da buluyor', () => {
    const found = applyList(ROWS, { ...EMPTY_QUERY, text: 'sukru' }, CFG);
    expect(found.map((x) => x.name)).toEqual(['Şükrü Öz']);
  });

  it('İ ile başlayan adı küçük harfle arayınca buluyor', () => {
    const found = applyList(ROWS, { ...EMPTY_QUERY, text: 'ilknur' }, CFG);
    expect(found.map((x) => x.name)).toEqual(['İlknur Aydın']);
  });

  it('kelimeler AYRI sütunlarda olabilir ve sıraları önemsiz', () => {
    const found = applyList(ROWS, { ...EMPTY_QUERY, text: 'matematik ilknur' }, CFG);
    expect(found.map((x) => x.name)).toEqual(['İlknur Aydın']);
  });

  it('süzgeç grubu daraltıyor', () => {
    const found = applyList(ROWS, { ...EMPTY_QUERY, facets: { brans: 'Matematik' } }, CFG);
    expect(found).toHaveLength(2);
  });

  // The whole reason facets became plural: two chip rows narrow TOGETHER.
  // If they replaced each other, this would return two rows, not one.
  it('iki süzgeç birlikte daraltıyor, biri ötekini EZMİYOR', () => {
    const found = applyList(
      ROWS,
      { ...EMPTY_QUERY, facets: { brans: 'Matematik', cinsiyet: 'Kadın' } },
      CFG,
    );
    expect(found.map((x) => x.name)).toEqual(['İlknur Aydın']);
  });

  it('boş bırakılan süzgeç hiçbir şey daraltmıyor', () => {
    const found = applyList(ROWS, { ...EMPTY_QUERY, facets: { brans: '', cinsiyet: '' } }, CFG);
    expect(found).toEqual(ROWS);
  });

  it('sıralama listeyi KOPYALIYOR — girdi dizisi bozulmuyor', () => {
    const before = [...ROWS];
    applyList(ROWS, { ...EMPTY_QUERY, sortId: 'ad' }, CFG);
    expect(ROWS).toEqual(before);
  });

  it('yüke göre sıralama azalan, eşitlikte Türkçe ada göre', () => {
    const names = applyList(ROWS, { ...EMPTY_QUERY, sortId: 'yuk' }, CFG).map((x) => x.name);
    expect(names[0]).toBe('Çetin Gül'); // 30
    expect(names[1]).toBe('Şükrü Öz'); // 20
    // Two rows at 12: ı sorts before i in Turkish, so Ilgaz comes first.
    expect(names.slice(2)).toEqual(['Ilgaz Ay', 'İlknur Aydın']);
  });

  it('bilinmeyen sıralama kimliği listeyi bozmuyor', () => {
    expect(applyList(ROWS, { ...EMPTY_QUERY, sortId: 'yok' }, CFG)).toEqual(ROWS);
  });
});

describe('facetCounts', () => {
  it('gruplar Türkçe sırada ve sayılar ARAMADAN sonra', () => {
    expect(facetCounts(ROWS, EMPTY_QUERY, CFG, 'brans')).toEqual([
      { value: 'Fizik', count: 1 },
      { value: 'Matematik', count: 2 },
    ]);
    expect(facetCounts(ROWS, { ...EMPTY_QUERY, text: 'ilknur' }, CFG, 'brans')).toEqual([
      { value: 'Matematik', count: 1 },
    ]);
  });

  it('bilinmeyen süzgeç kimliği boş liste veriyor', () => {
    expect(facetCounts(ROWS, EMPTY_QUERY, CFG, 'yok')).toEqual([]);
  });

  // The one that would be wrong if the counts were taken after the facet:
  // choosing "Matematik" would leave every other chip reading 0 and the row
  // of chips would stop being a way back.
  it('bir grup seçiliyken ÖTEKİ grupların sayısı durmaya devam ediyor', () => {
    expect(facetCounts(ROWS, { ...EMPTY_QUERY, facets: { brans: 'Matematik' } }, CFG, 'brans'))
      .toEqual([
        { value: 'Fizik', count: 1 },
        { value: 'Matematik', count: 2 },
      ]);
  });

  // The other half of the same rule, and the one plurality introduced: a chip
  // row is counted with its OWN choice cleared but every other one applied.
  // Without that, "Cinsiyet" would offer "Erkek 2" over a list already
  // narrowed to maths — and pressing it would show one row, not two.
  it('bir süzgecin sayıları ÖTEKİ süzgeç uygulanmışken alınıyor', () => {
    expect(
      facetCounts(ROWS, { ...EMPTY_QUERY, facets: { brans: 'Matematik' } }, CFG, 'cinsiyet'),
    ).toEqual([
      { value: 'Erkek', count: 1 },
      { value: 'Kadın', count: 1 },
    ]);
  });

  it('grubu olmayan satır hiçbir çipe düşmüyor', () => {
    const all = facetCounts(ROWS, EMPTY_QUERY, CFG, 'brans').reduce((n, f) => n + f.count, 0);
    expect(all).toBe(ROWS.length - 1); // Çetin Gül'ün branşı yok
  });

  // A facet may carry an order of its own — subjects do, because Ayarlar >
  // Branşlar is a hand-sorted list and the chip row has to read the same way.
  it('kendi sırası olan bir süzgeç ALFABEYİ değil o sırayı kullanıyor', () => {
    const ordered = {
      ...CFG,
      facets: [
        { ...CFG.facets![0]!, order: (v: string) => (v === 'Matematik' ? 0 : 1) },
        CFG.facets![1]!,
      ],
    };
    expect(facetCounts(ROWS, EMPTY_QUERY, ordered, 'brans').map((f) => f.value)).toEqual([
      'Matematik',
      'Fizik',
    ]);
    // ...and the alphabet is still what decides between equals, which is what
    // the row did before it took a rank at all.
    expect(facetCounts(ROWS, EMPTY_QUERY, CFG, 'brans').map((f) => f.value)).toEqual([
      'Fizik',
      'Matematik',
    ]);
  });
});

describe('isFiltering ve canReorder', () => {
  it('boş sorguda hiçbir şey süzülmüyor, elle sıralama açık', () => {
    expect(isFiltering(EMPTY_QUERY)).toBe(false);
    expect(canReorder(EMPTY_QUERY)).toBe(true);
  });

  it('sadece BOŞLUK içeren arama süzgeç sayılmıyor', () => {
    expect(isFiltering({ ...EMPTY_QUERY, text: '   ' })).toBe(false);
    expect(canReorder({ ...EMPTY_QUERY, text: '   ' })).toBe(true);
  });

  it("boş bırakılmış bir süzgeç anahtarı 'süzülüyor' demek değil", () => {
    expect(isFiltering({ ...EMPTY_QUERY, facets: { brans: '' } })).toBe(false);
    expect(canReorder({ ...EMPTY_QUERY, facets: { brans: '' } })).toBe(true);
  });

  // The three ways the visible rows stop BEING the underlying list. Under any
  // of them the row in position 3 on screen is not item 3 of the array, so a
  // drag would write an index nobody asked for.
  it('arama, süzgeç ve sıralamanın her biri elle sıralamayı kapatıyor', () => {
    expect(canReorder({ ...EMPTY_QUERY, text: 'mat' })).toBe(false);
    expect(canReorder({ ...EMPTY_QUERY, facets: { brans: 'Matematik' } })).toBe(false);
    expect(canReorder({ ...EMPTY_QUERY, sortId: 'ad' })).toBe(false);
  });

  it('sıralama süzgeç DEĞİL — sayı satırı yine tam listeyi söylüyor', () => {
    expect(isFiltering({ ...EMPTY_QUERY, sortId: 'ad' })).toBe(false);
  });
});
