// Gercek olcekte butunlesik test: 25 ogretmen, 20 sinif, 8 derslik, 84 slot.
//
// Iki soruyu cevaplar:
//   1. Kisit motoru gercek olcekte tutarli mi, program dizilebiliyor mu?
//   2. Suruklemenin baslangic maliyeti (84 engel cagrisi) babanin yavas
//      makinesinde takilmayacak kadar kucuk mu?

import { engel, indeksle, temizle, yerlestir } from './kisit';
import { raporla } from './fizibilite';
import { ornekDurum } from './ornek';
import type { Durum } from './tip';

/** Acgozlu doldurma: her dersi ilk gecerli slota koyar. Solver DEGIL, sadece test. */
function acgozluDoldur(baslangic: Durum): { durum: Durum; yerlesen: number; toplam: number } {
  let d = baslangic;
  const toplam = d.dersler.reduce((t, x) => t + x.haftalikSaat, 0);
  let yerlesen = 0;

  // Blogu buyuk olan dersler once: yeri en dar olan once yerlessin.
  const sirali = [...d.dersler].sort((a, b) => b.blok - a.blok || b.haftalikSaat - a.haftalikSaat);

  for (const ders of sirali) {
    let kalan = ders.haftalikSaat;
    while (kalan >= ders.blok) {
      const ix = indeksle(d);
      let kondu = false;
      for (let g = 0; g < d.ayar.gunler.length && !kondu; g++) {
        for (let s = 0; s < d.ayar.saatler.length; s++) {
          if (engel(d, ix, ders.id, g, s) === null) {
            d = yerlestir(d, ders.id, g, s);
            kalan -= ders.blok;
            yerlesen += ders.blok;
            kondu = true;
            break;
          }
        }
      }
      if (!kondu) break; // bu derse yer kalmadi
    }
  }
  return { durum: d, yerlesen, toplam };
}

describe('ornekDurum — gerçek ölçek', () => {
  const d = ornekDurum();

  it('beklenen büyüklükte ve tutarlı veri üretir', () => {
    expect(d.ogretmenler).toHaveLength(25);
    expect(d.siniflar).toHaveLength(20);
    expect(d.derslikler).toHaveLength(8);
    expect(d.ayar.gunler).toHaveLength(7);
    expect(d.ayar.saatler).toHaveLength(12);
    expect(d.dersler.length).toBeGreaterThan(80);
  });

  it('temizle() üretilen veriye dokunmaz — yani veri baştan tutarlı', () => {
    expect(temizle(d)).toBe(d);
  });

  it('deterministiktir: iki çağrı aynı sonucu verir', () => {
    expect(JSON.stringify(ornekDurum())).toBe(JSON.stringify(d));
  });

  it('kapasite bakımından dizilebilir görünür (imkânsız satır yok)', () => {
    const rapor = raporla(d);
    const imkansiz = [...rapor.ogretmenler, ...rapor.siniflar, ...rapor.derslikler].filter(
      (x) => x.seviye === 'imkansiz',
    );
    expect(imkansiz.map((x) => x.mesaj)).toEqual([]);
  });
});

describe('gerçek ölçekte doldurma', () => {
  it('açgözlü doldurma ders saatlerinin çoğunu yerleştirir ve hiç çakışma üretmez', () => {
    const { durum, yerlesen, toplam } = acgozluDoldur(ornekDurum());

    // Acgozlu strateji optimal degil; %70 bile motorun tutarli oldugunu gosterir.
    expect(yerlesen / toplam).toBeGreaterThan(0.7);

    // Yerlesen her hucre gercekten cakismasiz mi? Bagimsiz dogrulama:
    // ayni ogretmen ayni anda iki yerde, ayni derslik iki sinifta olmamali.
    const ogretmenGorulen = new Set<string>();
    const derslikGorulen = new Set<string>();
    const ix = indeksle(durum);

    for (const anahtar in durum.yerlesim) {
      const dersId = durum.yerlesim[anahtar]!;
      const [sinifId, gun, saat] = anahtar.split('|') as [string, string, string];
      const ders = ix.dersById.get(dersId)!;
      expect(ders.sinifId).toBe(sinifId);

      const oAnahtar = `${ders.ogretmenId}|${gun}|${saat}`;
      expect(ogretmenGorulen.has(oAnahtar)).toBe(false);
      ogretmenGorulen.add(oAnahtar);

      const derslikId = ix.sinifById.get(sinifId)?.derslikId;
      if (derslikId != null) {
        const kAnahtar = `${derslikId}|${gun}|${saat}`;
        expect(derslikGorulen.has(kAnahtar)).toBe(false);
        derslikGorulen.add(kAnahtar);
      }
    }

    // Musaitlige de uyulmus olmali
    for (const oAnahtar of ogretmenGorulen) {
      expect(durum.musaitDegil[oAnahtar]).toBeUndefined();
    }
  });

  it('sürükleme başlangıcı (84 engel çağrısı) hızlı kalır', () => {
    const { durum } = acgozluDoldur(ornekDurum());
    const dersId = durum.dersler[0]!.id;

    const basla = performance.now();
    for (let tekrar = 0; tekrar < 20; tekrar++) {
      const ix = indeksle(durum);
      for (let g = 0; g < durum.ayar.gunler.length; g++) {
        for (let s = 0; s < durum.ayar.saatler.length; s++) {
          engel(durum, ix, dersId, g, s);
        }
      }
    }
    const birSurukleme = (performance.now() - basla) / 20;

    // Gelistirme makinesinde ~1 ms. Esik cok gevsek tutuldu: amaci flaky test
    // degil, buyuk bir gerileme (ornegin engel icine O(n) arama girmesi) yakalamak.
    expect(birSurukleme).toBeLessThan(50);
  });
});
