import { describe, expect, it } from 'vitest';
import {
  applyList,
  byNumberThen,
  compareTr,
  EMPTY_QUERY,
  facetCounts,
  fold,
} from './listview';
import type { ListConfig } from './listview';

interface Row {
  name: string;
  subject: string;
  load: number;
}

const ROWS: Row[] = [
  { name: 'Şükrü Öz', subject: 'Matematik', load: 20 },
  { name: 'Ilgaz Ay', subject: 'Fizik', load: 12 },
  { name: 'İlknur Aydın', subject: 'Matematik', load: 12 },
  { name: 'Çetin Gül', subject: '', load: 30 },
];

const CFG: ListConfig<Row> = {
  haystack: (x) => `${x.name} ${x.subject}`,
  sorts: [
    { id: 'ad', label: 'Ada göre', cmp: (a, b) => compareTr(a.name, b.name) },
    { id: 'yuk', label: 'Yüke göre', cmp: byNumberThen((x) => x.load, (x) => x.name) },
  ],
  facet: { label: 'Branş', of: (x) => x.subject },
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
    const found = applyList(ROWS, { ...EMPTY_QUERY, facet: 'Matematik' }, CFG);
    expect(found).toHaveLength(2);
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
    expect(facetCounts(ROWS, EMPTY_QUERY, CFG)).toEqual([
      { value: 'Fizik', count: 1 },
      { value: 'Matematik', count: 2 },
    ]);
    expect(facetCounts(ROWS, { ...EMPTY_QUERY, text: 'ilknur' }, CFG)).toEqual([
      { value: 'Matematik', count: 1 },
    ]);
  });

  // The one that would be wrong if the counts were taken after the facet:
  // choosing "Matematik" would leave every other chip reading 0 and the row
  // of chips would stop being a way back.
  it('bir grup seçiliyken ÖTEKİ grupların sayısı durmaya devam ediyor', () => {
    expect(facetCounts(ROWS, { ...EMPTY_QUERY, facet: 'Matematik' }, CFG)).toEqual([
      { value: 'Fizik', count: 1 },
      { value: 'Matematik', count: 2 },
    ]);
  });

  it('grubu olmayan satır hiçbir çipe düşmüyor', () => {
    const all = facetCounts(ROWS, EMPTY_QUERY, CFG).reduce((n, f) => n + f.count, 0);
    expect(all).toBe(ROWS.length - 1); // Çetin Gül'ün branşı yok
  });
});
