// Yapilabilirlik kontrolu (v0.5). SAF fonksiyonlar.
//
// aSc'nin yapmadigi ve kursta en cok aciyan sey: program dizilemedigi zaman
// SEBEBINI soylemek. Solver'dan once gelir cunku cok daha ucuz ve cok daha faydali.

import { engel, indeksle } from './kisit';
import type { Durum, Id } from './tip';

/** Yuk bu oranin uzerindeyse "zor olacak" uyarisi verilir. */
const SIKISIKLIK_ESIGI = 0.85;

export type Seviye = 'iyi' | 'sikisik' | 'imkansiz';

export interface Satir {
  id: Id;
  ad: string;
  kapasite: number; // kullanilabilir saat
  yuk: number; // yuklenen ders saati
  seviye: Seviye;
  mesaj: string;
}

export interface Yerlesemeyen {
  dersId: Id;
  ad: string;
  eksik: number;
  mesaj: string;
}

export interface Rapor {
  ogretmenler: Satir[];
  siniflar: Satir[];
  derslikler: Satir[];
  yerlesemeyenler: Yerlesemeyen[];
  sorunVar: boolean;
}

function seviyele(kapasite: number, yuk: number): Seviye {
  if (yuk > kapasite) return 'imkansiz';
  if (kapasite > 0 && yuk > kapasite * SIKISIKLIK_ESIGI) return 'sikisik';
  return 'iyi';
}

export function raporla(d: Durum): Rapor {
  const toplamSlot = d.ayar.gunler.length * d.ayar.saatler.length;
  const ix = indeksle(d);

  // Ogretmen basina kapali saat sayisi — musaitDegil sozlugunu tek gecisle say.
  const kapaliSayi = new Map<Id, number>();
  for (const anahtar in d.musaitDegil) {
    const ogretmenId = anahtar.slice(0, anahtar.indexOf('|'));
    kapaliSayi.set(ogretmenId, (kapaliSayi.get(ogretmenId) ?? 0) + 1);
  }

  const ogretmenler: Satir[] = d.ogretmenler.map((o) => {
    const kapasite = toplamSlot - (kapaliSayi.get(o.id) ?? 0);
    const yuk = d.dersler
      .filter((x) => x.ogretmenId === o.id)
      .reduce((t, x) => t + x.haftalikSaat, 0);
    const seviye = seviyele(kapasite, yuk);
    const mesaj =
      seviye === 'imkansiz'
        ? `${o.kisaltma} ${kapasite} saat müsait, ${yuk} saat ders yüklenmiş. ${yuk - kapasite} saat fazla.`
        : seviye === 'sikisik'
          ? `${o.kisaltma} ${kapasite} saat müsait, ${yuk} saat ders yüklenmiş. Zor olacak.`
          : `${o.kisaltma} ${kapasite} saat müsait, ${yuk} saat ders yüklenmiş.`;
    return { id: o.id, ad: `${o.kisaltma} — ${o.ad}`, kapasite, yuk, seviye, mesaj };
  });

  const siniflar: Satir[] = d.siniflar.map((s) => {
    const yuk = d.dersler.filter((x) => x.sinifId === s.id).reduce((t, x) => t + x.haftalikSaat, 0);
    const seviye = seviyele(toplamSlot, yuk);
    const mesaj =
      seviye === 'imkansiz'
        ? `${s.ad} sınıfına ${yuk} saat ders yüklenmiş ama haftada ${toplamSlot} saat var. ${yuk - toplamSlot} saat fazla.`
        : `${s.ad} sınıfı: ${toplamSlot} saatin ${yuk} saati dolu.`;
    return { id: s.id, ad: s.ad, kapasite: toplamSlot, yuk, seviye, mesaj };
  });

  // Dersligi paylasan siniflarin TOPLAM yuku o dersligin kapasitesini asamaz.
  // En cok gozden kacan darbogaz burasi: 4 sinif tek odayi paylasiyorsa gorunur.
  const derslikler: Satir[] = d.derslikler.map((k) => {
    const oSiniflar = d.siniflar.filter((s) => s.derslikId === k.id);
    const sinifIdleri = new Set(oSiniflar.map((s) => s.id));
    const yuk = d.dersler
      .filter((x) => sinifIdleri.has(x.sinifId))
      .reduce((t, x) => t + x.haftalikSaat, 0);
    const seviye = seviyele(toplamSlot, yuk);
    const adlar = oSiniflar.map((s) => s.ad).join(', ');
    const mesaj =
      seviye === 'imkansiz'
        ? `${k.ad} dersliğini ${oSiniflar.length} sınıf paylaşıyor (${adlar}) ve toplam ${yuk} saat ders var. Haftada ${toplamSlot} saat var, ${yuk - toplamSlot} saat fazla.`
        : `${k.ad} dersliği (${adlar || 'sınıf yok'}): ${toplamSlot} saatin ${yuk} saati dolu.`;
    return { id: k.id, ad: k.ad, kapasite: toplamSlot, yuk, seviye, mesaj };
  });

  // Eksik kalmis ve hicbir gecerli slotu olmayan dersler.
  const yerlesemeyenler: Yerlesemeyen[] = [];
  for (const ders of d.dersler) {
    const yerlesen = ix.yerlesenSaat.get(ders.id) ?? 0;
    const eksik = ders.haftalikSaat - yerlesen;
    if (eksik <= 0) continue;

    const sayac = new Map<string, number>();
    let gecerliVar = false;
    for (let g = 0; g < d.ayar.gunler.length && !gecerliVar; g++) {
      for (let s = 0; s < d.ayar.saatler.length; s++) {
        const sebep = engel(d, ix, ders.id, g, s);
        if (sebep === null) {
          gecerliVar = true;
          break;
        }
        sayac.set(sebep, (sayac.get(sebep) ?? 0) + 1);
      }
    }
    if (gecerliVar) continue;

    // En sik tekrarlanan sebep en aciklayici olani.
    let enSik = 'Boş yer kalmamış';
    let enCok = 0;
    for (const [sebep, adet] of sayac) {
      if (adet > enCok) {
        enCok = adet;
        enSik = sebep;
      }
    }

    const sinif = ix.sinifById.get(ders.sinifId);
    const ogretmen = ix.ogretmenById.get(ders.ogretmenId);
    yerlesemeyenler.push({
      dersId: ders.id,
      ad: `${sinif?.ad ?? '?'} — ${ogretmen?.kisaltma ?? '?'} ${ogretmen?.brans ?? ''}`.trim(),
      eksik,
      mesaj: `${eksik} saati yerleşmemiş ve koyacak yer yok. Örnek sebep: ${enSik}`,
    });
  }

  const sorunVar =
    yerlesemeyenler.length > 0 ||
    [...ogretmenler, ...siniflar, ...derslikler].some((x) => x.seviye !== 'iyi');

  return { ogretmenler, siniflar, derslikler, yerlesemeyenler, sorunVar };
}
