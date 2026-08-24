import {
  dersAyristir,
  derslikAyristir,
  izgaraAyir,
  kisaltmaUret,
  ogretmenAyristir,
  sinifAyristir,
} from './iceaktar';

describe('izgaraAyir', () => {
  it('Excel sekmeli yapıştırmayı ayırır ve boş satırları atar', () => {
    expect(izgaraAyir('a\tb\tc\n\nd\te\tf\n')).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]);
  });

  it('sekme yoksa noktalı virgül, o da yoksa virgül kullanır', () => {
    expect(izgaraAyir('a;b;c')).toEqual([['a', 'b', 'c']]);
    expect(izgaraAyir('a,b,c')).toEqual([['a', 'b', 'c']]);
  });

  it('hücrelerin başındaki ve sonundaki boşluğu temizler', () => {
    expect(izgaraAyir('  a  \t  b  ')).toEqual([['a', 'b']]);
  });
});

describe('ogretmenAyristir', () => {
  it('ad, kısaltma ve branşı okur, başlık satırını atlar', () => {
    const { kabul } = ogretmenAyristir('Ad\tKısaltma\tBranş\nMehmet Çelik\tMÇ\tMatematik');
    expect(kabul).toEqual([{ ad: 'Mehmet Çelik', kisaltma: 'MÇ', brans: 'Matematik' }]);
  });

  it('kısaltma boşsa addan üretir', () => {
    const { kabul } = ogretmenAyristir('Mehmet Çelik\t\tMatematik');
    expect(kabul[0]!.kisaltma).toBe('MÇ');
  });

  it('branş boşsa satırı alır ama uyarır', () => {
    const { kabul, hata } = ogretmenAyristir('Mehmet Çelik\tMÇ');
    expect(kabul).toHaveLength(1);
    expect(hata[0]).toContain('branş boş');
  });
});

describe('kisaltmaUret', () => {
  it('Türkçe harfleri doğru büyütür', () => {
    expect(kisaltmaUret('İsmail Şahin')).toBe('İŞ');
    expect(kisaltmaUret('ismail çelik')).toBe('İÇ');
    expect(kisaltmaUret('Ali')).toBe('A');
    expect(kisaltmaUret('')).toBe('??');
  });
});

describe('sinifAyristir', () => {
  it('sınıf ve dersliği okur', () => {
    const { kabul } = sinifAyristir('510\tA\n511\tA\n433\tB');
    expect(kabul).toEqual([
      { ad: '510', derslikAd: 'A' },
      { ad: '511', derslikAd: 'A' },
      { ad: '433', derslikAd: 'B' },
    ]);
  });

  it('tekrar eden sınıfı bir kez alır ve uyarır', () => {
    const { kabul, hata } = sinifAyristir('510\tA\n510\tB');
    expect(kabul).toHaveLength(1);
    expect(hata[0]).toContain('iki kez');
  });

  it('derslik sütunu yoksa boş bırakır', () => {
    expect(sinifAyristir('510')).toEqual({ kabul: [{ ad: '510', derslikAd: '' }], hata: [] });
  });
});

describe('dersAyristir', () => {
  it('sınıf, öğretmen, saat ve bloğu okur', () => {
    const { kabul } = dersAyristir('510\tMÇ\t6\t2');
    expect(kabul).toEqual([{ sinifAd: '510', ogretmen: 'MÇ', haftalikSaat: 6, blok: 2 }]);
  });

  it('blok boşsa 1 kabul eder', () => {
    expect(dersAyristir('510\tMÇ\t6').kabul[0]!.blok).toBe(1);
  });

  it('bloğu en fazla 3 ile sınırlar', () => {
    expect(dersAyristir('510\tMÇ\t6\t9').kabul[0]!.blok).toBe(3);
  });

  it('saat okunamayan satırı atlar ve sebebini yazar', () => {
    const { kabul, hata } = dersAyristir('510\tMÇ\tabc');
    expect(kabul).toHaveLength(0);
    expect(hata[0]).toContain('saat okunamadı');
  });

  it('eksik satırı atlar ve sebebini yazar', () => {
    const { kabul, hata } = dersAyristir('510\t\t4');
    expect(kabul).toHaveLength(0);
    expect(hata[0]).toContain('öğretmen boş');
  });

  it('virgüllü ondalık saati yuvarlar', () => {
    expect(dersAyristir('510;MÇ;2,4').kabul[0]!.haftalikSaat).toBe(2);
  });
});

describe('derslikAyristir', () => {
  it('satır başına bir derslik alır ve tekrarı eler', () => {
    const { kabul, hata } = derslikAyristir('A\nB\nA\nC');
    expect(kabul.map((x) => x.ad)).toEqual(['A', 'B', 'C']);
    expect(hata).toHaveLength(1);
  });
});
