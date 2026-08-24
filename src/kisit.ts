// Kisit motoru. SAF fonksiyonlar: React, DOM, localStorage bilmez.
// Bu dosyadaki her disa aktarilan fonksiyonun testi var (kisit.test.ts).
//
// Kural: is mantigi buraya yazilir, bilesenlere degil.

import type { Ders, Derslik, Durum, Id, Ogretmen, Sinif } from './tip';

// ---------------------------------------------------------------- anahtarlar

export function yerKey(sinifId: Id, gun: number, saat: number): string {
  return `${sinifId}|${gun}|${saat}`;
}

export function musaitKey(ogretmenId: Id, gun: number, saat: number): string {
  return `${ogretmenId}|${gun}|${saat}`;
}

// ------------------------------------------------------------------- indeks

/**
 * `yerlesim` sinif anahtarli tutulur; ogretmen ve derslik doluluklari buradan
 * TEK gecisle turetilir. Ayni veriyi iki yerde tutmak senkronizasyon hatasi demek.
 */
export interface Indeks {
  ogretmenDolu: Map<string, Id>; // `${ogretmenId}|${gun}|${saat}` -> dersId
  derslikDolu: Map<string, Id>; // `${derslikId}|${gun}|${saat}` -> dersId
  dersById: Map<Id, Ders>;
  sinifById: Map<Id, Sinif>;
  ogretmenById: Map<Id, Ogretmen>;
  derslikById: Map<Id, Derslik>;
  /** dersId -> izgaraya yerlesmis saat sayisi. Sayaclar icin. */
  yerlesenSaat: Map<Id, number>;
}

export function indeksle(d: Durum): Indeks {
  const dersById = new Map(d.dersler.map((x) => [x.id, x]));
  const sinifById = new Map(d.siniflar.map((x) => [x.id, x]));
  const ogretmenById = new Map(d.ogretmenler.map((x) => [x.id, x]));
  const derslikById = new Map(d.derslikler.map((x) => [x.id, x]));

  const ogretmenDolu = new Map<string, Id>();
  const derslikDolu = new Map<string, Id>();
  const yerlesenSaat = new Map<Id, number>();

  for (const anahtar in d.yerlesim) {
    const dersId = d.yerlesim[anahtar];
    if (dersId === undefined) continue;
    const ders = dersById.get(dersId);
    if (ders === undefined) continue; // yetim kayit — temizle() halleder

    const ayrac = anahtar.lastIndexOf('|');
    const oncekiAyrac = anahtar.lastIndexOf('|', ayrac - 1);
    const gun = Number(anahtar.slice(oncekiAyrac + 1, ayrac));
    const saat = Number(anahtar.slice(ayrac + 1));

    yerlesenSaat.set(dersId, (yerlesenSaat.get(dersId) ?? 0) + 1);
    ogretmenDolu.set(musaitKey(ders.ogretmenId, gun, saat), dersId);

    const derslikId = sinifById.get(ders.sinifId)?.derslikId;
    if (derslikId != null) derslikDolu.set(`${derslikId}|${gun}|${saat}`, dersId);
  }

  return {
    ogretmenDolu,
    derslikDolu,
    dersById,
    sinifById,
    ogretmenById,
    derslikById,
    yerlesenSaat,
  };
}

// -------------------------------------------------------------------- engel

/**
 * null -> yerlestirilebilir. string -> engelin insan diliyle sebebi.
 *
 * Mesaj ASLA "cakisma var" olmaz. Programi dizen kisinin bir sonraki hamlesini
 * belirleyen sey bu cumle, o yuzden her zaman somut: "MC o saatte 433 sinifinda".
 */
export function engel(
  d: Durum,
  ix: Indeks,
  dersId: Id,
  gun: number,
  saat: number,
): string | null {
  const ders = ix.dersById.get(dersId);
  if (ders === undefined) return 'Ders bulunamadı';

  const sinif = ix.sinifById.get(ders.sinifId);
  const ogretmen = ix.ogretmenById.get(ders.ogretmenId);
  if (sinif === undefined || ogretmen === undefined) return 'Ders eksik tanımlı';

  const gunSayisi = d.ayar.gunler.length;
  const saatSayisi = d.ayar.saatler.length;
  if (gun < 0 || gun >= gunSayisi || saat < 0) return 'Geçersiz hücre';

  // 1. Blok gun sonuna sigiyor mu
  const blok = Math.max(1, ders.blok);
  if (saat + blok > saatSayisi) {
    return blok === 1 ? 'Bu saat günün dışında' : `${blok} saatlik blok güne sığmıyor`;
  }

  const gunAd = d.ayar.gunler[gun] ?? `${gun + 1}. gün`;

  for (let i = 0; i < blok; i++) {
    const s = saat + i;
    const saatAd = d.ayar.saatler[s] ?? `${s + 1}`;

    // 2. Sinifin o saati bos mu
    const doluDersId = d.yerlesim[yerKey(sinif.id, gun, s)];
    if (doluDersId !== undefined) {
      const oDers = ix.dersById.get(doluDersId);
      const oBrans = oDers && ix.ogretmenById.get(oDers.ogretmenId)?.brans;
      return `${sinif.ad} sınıfının ${gunAd} ${saatAd} saatinde ${oBrans ?? 'başka ders'} var`;
    }

    // 3. Ogretmen o saatte gelebiliyor mu
    if (d.musaitDegil[musaitKey(ogretmen.id, gun, s)] !== undefined) {
      return `${ogretmen.kisaltma} ${gunAd} ${saatAd} saatinde müsait değil`;
    }

    // 4. Ogretmen o saatte baska bir sinifta mi
    const ogrDersId = ix.ogretmenDolu.get(musaitKey(ogretmen.id, gun, s));
    if (ogrDersId !== undefined) {
      const oDers = ix.dersById.get(ogrDersId);
      const oSinif = oDers && ix.sinifById.get(oDers.sinifId);
      return `${ogretmen.kisaltma} ${gunAd} ${saatAd} saatinde ${oSinif?.ad ?? 'başka'} sınıfında`;
    }

    // 5. Dersligi paylasan baska bir sinif o saatte ders yapiyor mu
    if (sinif.derslikId != null) {
      const derslikDersId = ix.derslikDolu.get(`${sinif.derslikId}|${gun}|${s}`);
      if (derslikDersId !== undefined) {
        const oDers = ix.dersById.get(derslikDersId);
        const oSinif = oDers && ix.sinifById.get(oDers.sinifId);
        const derslikAd = ix.derslikById.get(sinif.derslikId)?.ad ?? '?';
        return `${derslikAd} dersliğinde ${gunAd} ${saatAd} saatinde ${oSinif?.ad ?? 'başka sınıf'} var`;
      }
    }
  }

  return null;
}

/** Bir dersin bir gunde yerlestirilebilecegi tum saatler. Surukleme basinda BIR KEZ. */
export function gecerliSaatler(d: Durum, ix: Indeks, dersId: Id, gun: number): Set<number> {
  const kume = new Set<number>();
  for (let s = 0; s < d.ayar.saatler.length; s++) {
    if (engel(d, ix, dersId, gun, s) === null) kume.add(s);
  }
  return kume;
}

// -------------------------------------------------------------- yerlestirme

/**
 * Tiklanan hucreyi iceren blogun BASLANGIC saati. Yerlesim yoksa null.
 *
 * Dikkat: ayni ders gunde birden fazla blok tutabilir ve bu bloklar bitisik
 * olabilir (or. blok=2, saatler 0-1 ve 2-3). Sadece geriye yuruyup ayni dersId
 * aramak ikisini tek blok sanir. Bu yuzden once ardisik dizinin basi bulunur,
 * sonra dizi `blok` boyunda parcalara ayrilip tiklanan parca secilir.
 */
export function blokBasi(d: Durum, sinifId: Id, gun: number, saat: number): number | null {
  const dersId = d.yerlesim[yerKey(sinifId, gun, saat)];
  if (dersId === undefined) return null;

  const blok = Math.max(1, d.dersler.find((x) => x.id === dersId)?.blok ?? 1);

  let dizinBasi = saat;
  while (dizinBasi > 0 && d.yerlesim[yerKey(sinifId, gun, dizinBasi - 1)] === dersId) {
    dizinBasi--;
  }

  const parcaNo = Math.floor((saat - dizinBasi) / blok);
  return dizinBasi + parcaNo * blok;
}

/**
 * Dersi izgaraya yazar. Yeni Durum doner, mutasyon yok.
 * ONKOSUL: cagiran once `engel()` cagirmis ve null almis olmali.
 */
export function yerlestir(d: Durum, dersId: Id, gun: number, saat: number): Durum {
  const ders = d.dersler.find((x) => x.id === dersId);
  if (ders === undefined) return d;

  const blok = Math.max(1, ders.blok);
  const yerlesim = { ...d.yerlesim };
  for (let i = 0; i < blok; i++) {
    yerlesim[yerKey(ders.sinifId, gun, saat + i)] = dersId;
  }
  return { ...d, yerlesim };
}

/** Tiklanan hucreyi iceren blogu TAMAMEN kaldirir. */
export function kaldir(d: Durum, sinifId: Id, gun: number, saat: number): Durum {
  const bas = blokBasi(d, sinifId, gun, saat);
  if (bas === null) return d;

  const dersId = d.yerlesim[yerKey(sinifId, gun, bas)];
  if (dersId === undefined) return d;

  const blok = Math.max(1, d.dersler.find((x) => x.id === dersId)?.blok ?? 1);
  const yerlesim = { ...d.yerlesim };
  for (let i = 0; i < blok; i++) {
    const k = yerKey(sinifId, gun, bas + i);
    if (yerlesim[k] === dersId) delete yerlesim[k];
  }
  return { ...d, yerlesim };
}

/** Sayac: bu dersin izgaraya yerlesmis saat sayisi. */
export function yerlesenSaat(d: Durum, dersId: Id): number {
  let n = 0;
  for (const anahtar in d.yerlesim) {
    if (d.yerlesim[anahtar] === dersId) n++;
  }
  return n;
}

// ------------------------------------------------------------------ temizle

/**
 * Tasan ve yetim kayitlari siler. HER yuklemede ve HER ayar degisikliginde
 * cagrilir — silme mantigi bilesenlere dagitilmaz.
 *
 * Hicbir sey degismediyse AYNI nesneyi doner (gereksiz re-render olmasin).
 */
export function temizle(d: Durum): Durum {
  const derslikIdleri = new Set(d.derslikler.map((x) => x.id));
  const ogretmenIdleri = new Set(d.ogretmenler.map((x) => x.id));
  const gunSayisi = d.ayar.gunler.length;
  const saatSayisi = d.ayar.saatler.length;

  let degisti = false;

  // Silinmis dersligi gosteren siniflar -> derslikId null
  let siniflar = d.siniflar;
  if (siniflar.some((s) => s.derslikId != null && !derslikIdleri.has(s.derslikId))) {
    siniflar = siniflar.map((s) =>
      s.derslikId != null && !derslikIdleri.has(s.derslikId) ? { ...s, derslikId: null } : s,
    );
    degisti = true;
  }
  const sinifIdleri = new Set(siniflar.map((x) => x.id));

  // Sinifi veya ogretmeni silinmis dersler
  const dersler = d.dersler.filter(
    (x) => sinifIdleri.has(x.sinifId) && ogretmenIdleri.has(x.ogretmenId),
  );
  if (dersler.length !== d.dersler.length) degisti = true;
  const dersById = new Map(dersler.map((x) => [x.id, x]));

  // Yerlesimler: tasan, yetim veya sinifi tutmayan kayitlar
  const yerlesim: Record<string, Id> = {};
  for (const anahtar in d.yerlesim) {
    const dersId = d.yerlesim[anahtar];
    if (dersId === undefined) continue;

    const parca = anahtar.split('|');
    const sinifId = parca[0];
    if (parca.length !== 3 || sinifId === undefined) {
      degisti = true;
      continue;
    }
    const gun = Number(parca[1]);
    const saat = Number(parca[2]);
    const ders = dersById.get(dersId);

    if (
      ders === undefined ||
      ders.sinifId !== sinifId ||
      !Number.isInteger(gun) ||
      gun < 0 ||
      gun >= gunSayisi ||
      !Number.isInteger(saat) ||
      saat < 0 ||
      saat >= saatSayisi
    ) {
      degisti = true;
      continue;
    }
    yerlesim[anahtar] = dersId;
  }

  // Musaitlik: silinmis ogretmen veya tasan gun/saat
  const musaitDegil: Record<string, 1> = {};
  for (const anahtar in d.musaitDegil) {
    const parca = anahtar.split('|');
    const ogretmenId = parca[0];
    if (parca.length !== 3 || ogretmenId === undefined) {
      degisti = true;
      continue;
    }
    const gun = Number(parca[1]);
    const saat = Number(parca[2]);

    if (
      !ogretmenIdleri.has(ogretmenId) ||
      !Number.isInteger(gun) ||
      gun < 0 ||
      gun >= gunSayisi ||
      !Number.isInteger(saat) ||
      saat < 0 ||
      saat >= saatSayisi
    ) {
      degisti = true;
      continue;
    }
    musaitDegil[anahtar] = 1;
  }

  if (!degisti) return d;
  return { ...d, siniflar, dersler, yerlesim, musaitDegil };
}
