import {
  blokBasi,
  engel,
  gecerliSaatler,
  indeksle,
  kaldir,
  musaitKey,
  temizle,
  yerKey,
  yerlesenSaat,
  yerlestir,
} from './kisit';
import type { Durum } from './tip';

// Kucuk ve okunabilir bir dunya: 2 gun x 4 saat.
//   derslik A: sinif 510, sinif 511      (paylasilan oda)
//   derslik B: sinif 433
//   MC = Matematik, AV = Fizik, MB = Kimya
function kur(): Durum {
  return {
    semaSurumu: 1,
    ayar: { gunler: ['Pazartesi', 'Salı'], saatler: ['1', '2', '3', '4'] },
    derslikler: [
      { id: 'dA', ad: 'A' },
      { id: 'dB', ad: 'B' },
    ],
    ogretmenler: [
      { id: 'oMC', ad: 'Mehmet Çelik', kisaltma: 'MÇ', brans: 'Matematik', renk: 0 },
      { id: 'oAV', ad: 'Ayşe Var', kisaltma: 'AV', brans: 'Fizik', renk: 1 },
      { id: 'oMB', ad: 'Murat Bey', kisaltma: 'MB', brans: 'Kimya', renk: 2 },
    ],
    siniflar: [
      { id: 's510', ad: '510', derslikId: 'dA' },
      { id: 's511', ad: '511', derslikId: 'dA' },
      { id: 's433', ad: '433', derslikId: 'dB' },
    ],
    dersler: [
      { id: 'x1', sinifId: 's510', ogretmenId: 'oMC', haftalikSaat: 4, blok: 1 },
      { id: 'x2', sinifId: 's511', ogretmenId: 'oMC', haftalikSaat: 2, blok: 1 },
      { id: 'x3', sinifId: 's433', ogretmenId: 'oAV', haftalikSaat: 4, blok: 2 },
      { id: 'x4', sinifId: 's510', ogretmenId: 'oAV', haftalikSaat: 2, blok: 2 },
      { id: 'x5', sinifId: 's511', ogretmenId: 'oAV', haftalikSaat: 2, blok: 1 },
      { id: 'x6', sinifId: 's433', ogretmenId: 'oMB', haftalikSaat: 3, blok: 3 },
    ],
    musaitDegil: {},
    yerlesim: {},
  };
}

/** engel() cagrisini kisaltir: indeksi her seferinde tazeler. */
function bak(d: Durum, dersId: string, gun: number, saat: number): string | null {
  return engel(d, indeksle(d), dersId, gun, saat);
}

describe('engel — sert kısıtlar', () => {
  it('boş ızgaraya yerleştirmeye izin verir', () => {
    expect(bak(kur(), 'x1', 0, 0)).toBeNull();
  });

  it('sınıfın dolu saatine yerleştirmeyi engeller ve dersin adını söyler', () => {
    // 510 sinifina MC (Matematik) kondu; ayni sinifa AV (Fizik) konamaz.
    const d = yerlestir(kur(), 'x1', 0, 0);
    const sebep = bak(d, 'x4', 0, 0);
    expect(sebep).toContain('510');
    expect(sebep).toContain('Matematik');
  });

  it('öğretmenin müsait olmadığı saate yerleştirmeyi engeller', () => {
    const d = kur();
    d.musaitDegil[musaitKey('oMC', 0, 0)] = 1;
    const sebep = bak(d, 'x1', 0, 0);
    expect(sebep).toContain('MÇ');
    expect(sebep).toContain('müsait değil');
  });

  it('öğretmen başka sınıftayken engeller ve hangi sınıf olduğunu söyler', () => {
    // MC 510 sinifinda; ayni saatte 511 sinifina konamaz.
    const d = yerlestir(kur(), 'x1', 0, 0);
    const sebep = bak(d, 'x2', 0, 0);
    expect(sebep).toContain('MÇ');
    expect(sebep).toContain('510');
  });

  it('dersliği paylaşan sınıf o saatte doluyken engeller', () => {
    // 510 ve 511 ayni derslikte (A). Ogretmenler farkli, tek engel derslik olmali.
    const d = yerlestir(kur(), 'x1', 0, 0);
    const sebep = bak(d, 'x5', 0, 0);
    expect(sebep).toContain('A dersliğinde');
    expect(sebep).toContain('510');
  });

  it('derslikId null ise derslik kontrolünü atlar', () => {
    const d = yerlestir(kur(), 'x1', 0, 0);
    d.siniflar = d.siniflar.map((s) => (s.id === 's511' ? { ...s, derslikId: null } : s));
    expect(bak(d, 'x5', 0, 0)).toBeNull();
  });

  it('2 saatlik bloğu son saate koydurmaz', () => {
    // 4 saat var (0..3). blok=2 en gec 2. saatten baslayabilir.
    expect(bak(kur(), 'x4', 0, 2)).toBeNull();
    expect(bak(kur(), 'x4', 0, 3)).toContain('sığmıyor');
  });

  it('3 saatlik blok güne sığmıyorsa reddeder', () => {
    expect(bak(kur(), 'x6', 0, 1)).toBeNull(); // 1,2,3 -> sigar
    expect(bak(kur(), 'x6', 0, 2)).toContain('sığmıyor'); // 2,3,4 -> sigmaz
  });

  it('bloğun ikinci saatindeki çakışmayı da görür', () => {
    // 433 sinifina 1. saate tek saatlik bir sey koyalim: x3 blok=2, 0. saate konarsa
    // 0 ve 1 dolar. Sonra x6 (blok=3) 0. saatten baslayamaz.
    const d = yerlestir(kur(), 'x3', 0, 0);
    expect(bak(d, 'x6', 0, 1)).not.toBeNull();
  });

  it('aynı öğretmenin aynı sınıfta ardışık iki dersi çakışma vermez', () => {
    const d = yerlestir(kur(), 'x1', 0, 0);
    expect(bak(d, 'x1', 0, 1)).toBeNull();
  });

  it('gün veya saat aralık dışındaysa geçersiz der', () => {
    expect(bak(kur(), 'x1', 5, 0)).toBe('Geçersiz hücre');
    expect(bak(kur(), 'x1', 0, -1)).toBe('Geçersiz hücre');
  });

  it('bilinmeyen ders için anlaşılır mesaj döner', () => {
    expect(bak(kur(), 'yok', 0, 0)).toBe('Ders bulunamadı');
  });
});

describe('gecerliSaatler', () => {
  it('sürükleme başında o günün geçerli saatlerini verir', () => {
    const d = kur();
    d.musaitDegil[musaitKey('oMC', 0, 1)] = 1;
    const temiz = yerlestir(d, 'x2', 0, 3); // MC 511 sinifinda -> 3. saat de kapanir
    expect([...gecerliSaatler(temiz, indeksle(temiz), 'x1', 0)].sort()).toEqual([0, 2]);
  });

  it('bloklu ders için gün sonuna taşan saatleri dışarıda bırakır', () => {
    const d = kur();
    expect([...gecerliSaatler(d, indeksle(d), 'x6', 0)]).toEqual([0, 1]);
  });
});

describe('blokBasi ve kaldir', () => {
  it('blok kaldırılınca tüm saatleri temizlenir', () => {
    const d = kaldir(yerlestir(kur(), 'x4', 0, 0), 's510', 0, 0);
    expect(Object.keys(d.yerlesim)).toHaveLength(0);
  });

  it('ortadan tıklanan blok tamamen kalkar', () => {
    const d = kaldir(yerlestir(kur(), 'x6', 0, 0), 's433', 0, 2); // 3'lunun sonuna tikla
    expect(Object.keys(d.yerlesim)).toHaveLength(0);
  });

  it('bitişik iki bloğu birbirine karıştırmaz', () => {
    // x4 blok=2. Once 0-1, sonra 2-3. Ayni dersId, bitisik. 2. saate tiklayinca
    // sadece IKINCI blok kalkmali; naif "geriye yuru" mantigi dorduncu de siler.
    let d = yerlestir(kur(), 'x4', 0, 0);
    d = yerlestir(d, 'x4', 0, 2);
    expect(blokBasi(d, 's510', 0, 2)).toBe(2);
    expect(blokBasi(d, 's510', 0, 1)).toBe(0);

    const sonra = kaldir(d, 's510', 0, 3);
    expect(Object.keys(sonra.yerlesim).sort()).toEqual([
      yerKey('s510', 0, 0),
      yerKey('s510', 0, 1),
    ]);
  });

  it('boş hücrede blokBasi null döner ve kaldir durumu değiştirmez', () => {
    const d = kur();
    expect(blokBasi(d, 's510', 0, 0)).toBeNull();
    expect(kaldir(d, 's510', 0, 0)).toBe(d);
  });
});

describe('yerlesenSaat — sayaç', () => {
  it('bloklu dersi saat sayısıyla sayar', () => {
    let d = yerlestir(kur(), 'x4', 0, 0); // blok=2 -> 2 saat
    d = yerlestir(d, 'x1', 0, 2); // blok=1 -> 1 saat
    expect(yerlesenSaat(d, 'x4')).toBe(2);
    expect(yerlesenSaat(d, 'x1')).toBe(1);
    expect(yerlesenSaat(d, 'x3')).toBe(0);
    expect(indeksle(d).yerlesenSaat.get('x4')).toBe(2);
  });
});

describe('temizle — cascade ve taşma', () => {
  it('öğretmen silinince dersleri ve yerleşimleri de silinir', () => {
    let d = yerlestir(kur(), 'x1', 0, 0);
    d = yerlestir(d, 'x3', 0, 0);
    d = { ...d, ogretmenler: d.ogretmenler.filter((o) => o.id !== 'oMC') };

    const t = temizle(d);
    expect(t.dersler.map((x) => x.id)).not.toContain('x1');
    expect(t.yerlesim[yerKey('s510', 0, 0)]).toBeUndefined();
    expect(t.yerlesim[yerKey('s433', 0, 0)]).toBe('x3'); // digerine dokunmaz
  });

  it('sınıf silinince dersleri ve yerleşimleri de silinir', () => {
    let d = yerlestir(kur(), 'x1', 0, 0);
    d = { ...d, siniflar: d.siniflar.filter((s) => s.id !== 's510') };

    const t = temizle(d);
    expect(t.dersler.map((x) => x.id)).not.toContain('x1');
    expect(t.dersler.map((x) => x.id)).not.toContain('x4');
    expect(Object.keys(t.yerlesim)).toHaveLength(0);
  });

  it('derslik silinince sınıfın derslikId alanı null olur', () => {
    const d = { ...kur(), derslikler: [{ id: 'dB', ad: 'B' }] };
    const t = temizle(d);
    expect(t.siniflar.find((s) => s.id === 's510')?.derslikId).toBeNull();
    expect(t.siniflar.find((s) => s.id === 's433')?.derslikId).toBe('dB');
  });

  it('saat sayısı azalınca taşan yerleşimler temizlenir', () => {
    let d = yerlestir(kur(), 'x1', 0, 3);
    d = yerlestir(d, 'x1', 0, 0);
    d = { ...d, ayar: { ...d.ayar, saatler: ['1', '2'] } };

    const t = temizle(d);
    expect(t.yerlesim[yerKey('s510', 0, 3)]).toBeUndefined();
    expect(t.yerlesim[yerKey('s510', 0, 0)]).toBe('x1');
  });

  it('gün sayısı azalınca taşan müsaitlik kayıtları temizlenir', () => {
    const d = kur();
    d.musaitDegil[musaitKey('oMC', 1, 0)] = 1;
    d.musaitDegil[musaitKey('oMC', 0, 0)] = 1;
    const dar = { ...d, ayar: { ...d.ayar, gunler: ['Pazartesi'] } };

    const t = temizle(dar);
    expect(t.musaitDegil[musaitKey('oMC', 1, 0)]).toBeUndefined();
    expect(t.musaitDegil[musaitKey('oMC', 0, 0)]).toBe(1);
  });

  it('yetim ve bozuk anahtarları atar', () => {
    const d = kur();
    d.yerlesim['s510|0|0'] = 'olmayanDers';
    d.yerlesim['bozuk'] = 'x1';
    d.yerlesim['s433|0|0'] = 'x1'; // dersin sinifi 510, anahtar 433 -> tutarsiz
    expect(Object.keys(temizle(d).yerlesim)).toHaveLength(0);
  });

  it('değişiklik yoksa AYNI nesneyi döner', () => {
    const d = yerlestir(kur(), 'x1', 0, 0);
    expect(temizle(d)).toBe(d);
  });
});
