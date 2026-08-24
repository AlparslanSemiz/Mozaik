import { raporla } from './fizibilite';
import { musaitKey } from './kisit';
import type { Durum } from './tip';

// 1 gun x 4 saat = 4 slot. Kucuk sayilar hesaplari elle dogrulanabilir yapar.
function kur(): Durum {
  return {
    semaSurumu: 1,
    ayar: { gunler: ['Pazartesi'], saatler: ['1', '2', '3', '4'] },
    derslikler: [{ id: 'dA', ad: 'A' }],
    ogretmenler: [
      { id: 'oMC', ad: 'Mehmet Çelik', kisaltma: 'MÇ', brans: 'Matematik', renk: 0 },
    ],
    siniflar: [
      { id: 's510', ad: '510', derslikId: 'dA' },
      { id: 's511', ad: '511', derslikId: 'dA' },
    ],
    dersler: [{ id: 'x1', sinifId: 's510', ogretmenId: 'oMC', haftalikSaat: 2, blok: 1 }],
    musaitDegil: {},
    yerlesim: {},
  };
}

describe('raporla — öğretmen yükü', () => {
  it('yük müsaitliği aşarsa kaç saat fazla olduğunu söyler', () => {
    const d = kur();
    d.musaitDegil[musaitKey('oMC', 0, 0)] = 1;
    d.musaitDegil[musaitKey('oMC', 0, 1)] = 1;
    d.musaitDegil[musaitKey('oMC', 0, 2)] = 1; // 4 - 3 = 1 saat musait, 2 saat yuk

    const satir = raporla(d).ogretmenler[0]!;
    expect(satir.seviye).toBe('imkansiz');
    expect(satir.kapasite).toBe(1);
    expect(satir.yuk).toBe(2);
    expect(satir.mesaj).toContain('1 saat fazla');
  });

  it('yük müsaitliğin %85 üstündeyse sıkışık der', () => {
    const d = kur();
    d.musaitDegil[musaitKey('oMC', 0, 0)] = 1;
    d.musaitDegil[musaitKey('oMC', 0, 1)] = 1; // 2 saat musait, 2 saat yuk -> tam dolu
    expect(raporla(d).ogretmenler[0]!.seviye).toBe('sikisik');
  });

  it('bol müsaitlikte sorun görmez', () => {
    expect(raporla(kur()).ogretmenler[0]!.seviye).toBe('iyi');
    expect(raporla(kur()).sorunVar).toBe(false);
  });
});

describe('raporla — derslik darboğazı', () => {
  it('dersliği paylaşan sınıfların toplam yükünü kapasiteyle karşılaştırır', () => {
    const d = kur();
    // A dersligini 510 ve 511 paylasiyor. Toplam 3 + 2 = 5 saat, kapasite 4.
    d.ogretmenler.push({ id: 'oAV', ad: 'Ayşe Var', kisaltma: 'AV', brans: 'Fizik', renk: 1 });
    d.dersler.push({ id: 'x2', sinifId: 's511', ogretmenId: 'oAV', haftalikSaat: 3, blok: 1 });

    const derslik = raporla(d).derslikler[0]!;
    expect(derslik.yuk).toBe(5);
    expect(derslik.seviye).toBe('imkansiz');
    expect(derslik.mesaj).toContain('2 sınıf paylaşıyor');
    expect(derslik.mesaj).toContain('1 saat fazla');
  });
});

describe('raporla — sınıf yükü', () => {
  it('sınıfa haftalık slottan fazla ders yüklenmişse söyler', () => {
    const d = kur();
    d.dersler = [{ id: 'x1', sinifId: 's510', ogretmenId: 'oMC', haftalikSaat: 6, blok: 1 }];
    const sinif = raporla(d).siniflar.find((s) => s.id === 's510')!;
    expect(sinif.seviye).toBe('imkansiz');
    expect(sinif.mesaj).toContain('2 saat fazla');
  });
});

describe('raporla — yerleşemeyenler', () => {
  it('geçerli slotu kalmamış dersi en sık sebeple bildirir', () => {
    const d = kur();
    // MC tum hafta kapali -> x1 hicbir yere konamaz.
    for (let s = 0; s < 4; s++) d.musaitDegil[musaitKey('oMC', 0, s)] = 1;

    const rapor = raporla(d);
    expect(rapor.yerlesemeyenler).toHaveLength(1);
    expect(rapor.yerlesemeyenler[0]!.eksik).toBe(2);
    expect(rapor.yerlesemeyenler[0]!.mesaj).toContain('müsait değil');
    expect(rapor.sorunVar).toBe(true);
  });

  it('yeri olan dersi yerleşemeyen saymaz', () => {
    expect(raporla(kur()).yerlesemeyenler).toHaveLength(0);
  });

  it('tamamı yerleşmiş dersi yerleşemeyen saymaz', () => {
    const d = kur();
    d.yerlesim['s510|0|0'] = 'x1';
    d.yerlesim['s510|0|1'] = 'x1';
    expect(raporla(d).yerlesemeyenler).toHaveLength(0);
  });
});
