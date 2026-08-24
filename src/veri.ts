// Varlik islemleri (ekle/guncelle/sil). SAF fonksiyonlar, yeni Durum donerler.
//
// Silme islemleri HER ZAMAN temizle() ile biter: ogretmen silinince dersleri,
// ders silinince yerlesimleri de gitmeli. Yetim dersId kalirsa izgara coker.

import { musaitKey, temizle } from './kisit';
import type { Ders, Durum, Id, Ogretmen, Sinif } from './tip';
import { RENK_SAYISI, SEMA_SURUMU } from './tip';

const ALFABE = 'abcdefghijkmnpqrstuvwxyz23456789'; // karisan harfler yok: l, o, 0, 1

export function yeniId(): Id {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += ALFABE[Math.floor(Math.random() * ALFABE.length)];
  }
  return s;
}

export const VARSAYILAN_GUNLER = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

export function saatAdlari(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String(i + 1));
}

export function bosDurum(): Durum {
  return {
    semaSurumu: SEMA_SURUMU,
    ayar: { gunler: [...VARSAYILAN_GUNLER], saatler: saatAdlari(12) },
    derslikler: [],
    ogretmenler: [],
    siniflar: [],
    dersler: [],
    musaitDegil: {},
    yerlesim: {},
  };
}

// ------------------------------------------------------------------ derslik

export function derslikEkle(d: Durum, ad: string): Durum {
  return { ...d, derslikler: [...d.derslikler, { id: yeniId(), ad: ad.trim() }] };
}

export function derslikGuncelle(d: Durum, id: Id, ad: string): Durum {
  return {
    ...d,
    derslikler: d.derslikler.map((x) => (x.id === id ? { ...x, ad: ad.trim() } : x)),
  };
}

export function derslikSil(d: Durum, id: Id): Durum {
  return temizle({ ...d, derslikler: d.derslikler.filter((x) => x.id !== id) });
}

// ----------------------------------------------------------------- ogretmen

export function ogretmenEkle(d: Durum, alan: Omit<Ogretmen, 'id' | 'renk'>): Durum {
  const yeni: Ogretmen = {
    id: yeniId(),
    ad: alan.ad.trim(),
    kisaltma: alan.kisaltma.trim(),
    brans: alan.brans.trim(),
    renk: d.ogretmenler.length % RENK_SAYISI,
  };
  return { ...d, ogretmenler: [...d.ogretmenler, yeni] };
}

export function ogretmenGuncelle(d: Durum, id: Id, alan: Partial<Ogretmen>): Durum {
  return {
    ...d,
    ogretmenler: d.ogretmenler.map((x) => (x.id === id ? { ...x, ...alan, id } : x)),
  };
}

export function ogretmenSil(d: Durum, id: Id): Durum {
  return temizle({ ...d, ogretmenler: d.ogretmenler.filter((x) => x.id !== id) });
}

// -------------------------------------------------------------------- sinif

export function sinifEkle(d: Durum, ad: string, derslikId: Id | null): Durum {
  const yeni: Sinif = { id: yeniId(), ad: ad.trim(), derslikId };
  return { ...d, siniflar: [...d.siniflar, yeni] };
}

export function sinifGuncelle(d: Durum, id: Id, alan: Partial<Sinif>): Durum {
  return { ...d, siniflar: d.siniflar.map((x) => (x.id === id ? { ...x, ...alan, id } : x)) };
}

export function sinifSil(d: Durum, id: Id): Durum {
  return temizle({ ...d, siniflar: d.siniflar.filter((x) => x.id !== id) });
}

// --------------------------------------------------------------------- ders

export function dersEkle(d: Durum, alan: Omit<Ders, 'id'>): Durum {
  const yeni: Ders = {
    id: yeniId(),
    sinifId: alan.sinifId,
    ogretmenId: alan.ogretmenId,
    haftalikSaat: Math.max(1, Math.round(alan.haftalikSaat)),
    blok: Math.min(3, Math.max(1, Math.round(alan.blok))),
  };
  return { ...d, dersler: [...d.dersler, yeni] };
}

export function dersGuncelle(d: Durum, id: Id, alan: Partial<Ders>): Durum {
  const dersler = d.dersler.map((x) => (x.id === id ? { ...x, ...alan, id } : x));
  // blok degistiyse eski yerlesimler yanlis uzunlukta kalir; guvenlisi hepsini kaldirmak
  const blokDegisti = alan.blok !== undefined && d.dersler.find((x) => x.id === id)?.blok !== alan.blok;
  if (!blokDegisti) return { ...d, dersler };

  const yerlesim = { ...d.yerlesim };
  for (const anahtar in yerlesim) {
    if (yerlesim[anahtar] === id) delete yerlesim[anahtar];
  }
  return { ...d, dersler, yerlesim };
}

export function dersSil(d: Durum, id: Id): Durum {
  return temizle({ ...d, dersler: d.dersler.filter((x) => x.id !== id) });
}

// --------------------------------------------------------------------- ayar

export function ayarGuncelle(d: Durum, gunler: string[], saatler: string[]): Durum {
  return temizle({ ...d, ayar: { gunler, saatler } });
}

// --------------------------------------------------------------- musaitlik

export function musaitlikAyarla(
  d: Durum,
  ogretmenId: Id,
  hucreler: Array<{ gun: number; saat: number }>,
  musaitDegilMi: boolean,
): Durum {
  const musaitDegil = { ...d.musaitDegil };
  for (const { gun, saat } of hucreler) {
    const k = musaitKey(ogretmenId, gun, saat);
    if (musaitDegilMi) musaitDegil[k] = 1;
    else delete musaitDegil[k];
  }
  return { ...d, musaitDegil };
}

/** Ogretmenin TUM haftasini musait / musait degil yapar. */
export function musaitlikHepsi(d: Durum, ogretmenId: Id, musaitDegilMi: boolean): Durum {
  const hucreler: Array<{ gun: number; saat: number }> = [];
  for (let g = 0; g < d.ayar.gunler.length; g++) {
    for (let s = 0; s < d.ayar.saatler.length; s++) hucreler.push({ gun: g, saat: s });
  }
  return musaitlikAyarla(d, ogretmenId, hucreler, musaitDegilMi);
}

// ------------------------------------------------------------------ yardimci

/** Bir derslige bagli tum siniflar. Fizibilite ve derslik cakismasi icin. */
export function derslikSiniflari(d: Durum, derslikId: Id): Sinif[] {
  return d.siniflar.filter((s) => s.derslikId === derslikId);
}

export function derslikAdi(d: Durum, derslikId: Id | null): string {
  if (derslikId == null) return '';
  return d.derslikler.find((x) => x.id === derslikId)?.ad ?? '';
}

export function tumHucreler(d: Durum): Array<{ gun: number; saat: number }> {
  const liste: Array<{ gun: number; saat: number }> = [];
  for (let g = 0; g < d.ayar.gunler.length; g++) {
    for (let s = 0; s < d.ayar.saatler.length; s++) liste.push({ gun: g, saat: s });
  }
  return liste;
}
