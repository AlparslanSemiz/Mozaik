// Durum yonetimi: reducer + geri al yigini + localStorage + yedek dosyasi.
// Kutuphane yok, useReducer yeterli.
//
// Veri kaybi kabul edilemez (docs/PLAN.md ilke 6). Uc katmanli koruma:
//   1. her degisiklikte otomatik kayit (geciktirmeli)
//   2. her acilista onceki oturumun durumu yedek zincirine kaydirilir (son 3)
//   3. "Yedek indir" — babama ogretilecek TEK aliskanlik

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { temizle } from './kisit';
import { bosDurum } from './veri';
import type { Durum } from './tip';
import { SEMA_SURUMU } from './tip';

const ANAHTAR = 'ders-programi';
const YEDEK_SAYISI = 3;
const GECMIS_SINIRI = 30;
const KAYIT_GECIKMESI = 400; // ms — surukleme sirasinda her karede yazmasin

// ------------------------------------------------------------------ reducer

interface Kutu {
  simdi: Durum;
  gecmis: Durum[];
  ileri: Durum[];
}

type Eylem =
  | { tip: 'degistir'; uygula: (d: Durum) => Durum }
  | { tip: 'geriAl' }
  | { tip: 'ileriAl' }
  | { tip: 'yukle'; durum: Durum };

function indirge(k: Kutu, e: Eylem): Kutu {
  switch (e.tip) {
    case 'degistir': {
      const yeni = e.uygula(k.simdi);
      if (yeni === k.simdi) return k; // gercek degisiklik yoksa gecmisi kirletme
      return {
        simdi: yeni,
        gecmis: [...k.gecmis, k.simdi].slice(-GECMIS_SINIRI),
        ileri: [],
      };
    }
    case 'geriAl': {
      const onceki = k.gecmis[k.gecmis.length - 1];
      if (onceki === undefined) return k;
      return { simdi: onceki, gecmis: k.gecmis.slice(0, -1), ileri: [k.simdi, ...k.ileri] };
    }
    case 'ileriAl': {
      const sonraki = k.ileri[0];
      if (sonraki === undefined) return k;
      return { simdi: sonraki, gecmis: [...k.gecmis, k.simdi], ileri: k.ileri.slice(1) };
    }
    case 'yukle':
      return { simdi: temizle(e.durum), gecmis: [], ileri: [] };
  }
}

// --------------------------------------------------------------- ayristirma

/**
 * Disaridan gelen metni Durum'a cevirir. Bozuk/eksik alanlari tolere eder;
 * cevrilemezse null doner. Sonunda HER ZAMAN temizle() gecer.
 */
export function ayikla(metin: string): Durum | null {
  let ham: unknown;
  try {
    ham = JSON.parse(metin);
  } catch {
    return null;
  }
  if (typeof ham !== 'object' || ham === null) return null;

  const g = ham as Partial<Durum>;
  if (g.semaSurumu !== SEMA_SURUMU) return null; // ileride goc kodu buraya

  const bos = bosDurum();
  const dizi = <T,>(x: unknown, y: T[]): T[] => (Array.isArray(x) ? (x as T[]) : y);
  const sozluk = <T,>(x: unknown): Record<string, T> =>
    typeof x === 'object' && x !== null ? (x as Record<string, T>) : {};

  const gunler = dizi<string>(g.ayar?.gunler, bos.ayar.gunler).filter(
    (x) => typeof x === 'string',
  );
  const saatler = dizi<string>(g.ayar?.saatler, bos.ayar.saatler).filter(
    (x) => typeof x === 'string',
  );

  return temizle({
    semaSurumu: SEMA_SURUMU,
    ayar: {
      gunler: gunler.length > 0 ? gunler : bos.ayar.gunler,
      saatler: saatler.length > 0 ? saatler : bos.ayar.saatler,
    },
    derslikler: dizi(g.derslikler, bos.derslikler),
    ogretmenler: dizi(g.ogretmenler, bos.ogretmenler),
    siniflar: dizi(g.siniflar, bos.siniflar),
    dersler: dizi(g.dersler, bos.dersler),
    musaitDegil: sozluk<1>(g.musaitDegil),
    yerlesim: sozluk<string>(g.yerlesim),
  });
}

// ------------------------------------------------------------ kalici kayit

function guvenli<T>(is: () => T): T | null {
  try {
    return is();
  } catch {
    return null; // localStorage kapali, kota dolu, gizli sekme...
  }
}

/**
 * localStorage gercekten yazilabiliyor mu?
 *
 * Dosya cift tiklanip file:// olarak acildiginda, gizli sekmede veya tarayici
 * site verisini engelliyorsa yazma sessizce basarisiz olur. Sessiz basarisizlik
 * en kotu senaryo: baban butun gun program dizer, kapatir, hersey gider.
 * Bu yuzden acilista bir kez sinanir ve calismıyorsa ekranda kalici uyari cikar.
 */
export function kayitCalisiyorMu(): boolean {
  return (
    guvenli(() => {
      const deneme = `${ANAHTAR}-deneme`;
      localStorage.setItem(deneme, '1');
      const okundu = localStorage.getItem(deneme);
      localStorage.removeItem(deneme);
      return okundu === '1';
    }) === true
  );
}

export function kaydet(d: Durum): void {
  guvenli(() => localStorage.setItem(ANAHTAR, JSON.stringify(d)));
}

export function oku(): Durum | null {
  const metin = guvenli(() => localStorage.getItem(ANAHTAR));
  return metin == null ? null : ayikla(metin);
}

/**
 * Acilista bir kez: onceki oturumun durumunu yedek zincirine kaydirir.
 * Her degisiklikte kaydirmak yavas makinede pahali; oturum basi yeterli ve
 * son 3 OTURUMun durumunu saklamak, son 3 tiklamayi saklamaktan daha degerli.
 */
function yedekleriKaydir(): void {
  guvenli(() => {
    for (let i = YEDEK_SAYISI - 1; i > 0; i--) {
      const onceki = localStorage.getItem(`${ANAHTAR}-yedek-${i - 1}`);
      if (onceki !== null) localStorage.setItem(`${ANAHTAR}-yedek-${i}`, onceki);
    }
    const mevcut = localStorage.getItem(ANAHTAR);
    if (mevcut !== null) localStorage.setItem(`${ANAHTAR}-yedek-0`, mevcut);
  });
}

/** Kurtarma icin: saklanan yedeklerin listesi (en yenisi once). */
export function yedekleriListele(): Array<{ sira: number; durum: Durum }> {
  const liste: Array<{ sira: number; durum: Durum }> = [];
  for (let i = 0; i < YEDEK_SAYISI; i++) {
    const metin = guvenli(() => localStorage.getItem(`${ANAHTAR}-yedek-${i}`));
    if (metin == null) continue;
    const durum = ayikla(metin);
    if (durum !== null) liste.push({ sira: i, durum });
  }
  return liste;
}

// --------------------------------------------------------------- dosya alis

function ikiHane(n: number): string {
  return String(n).padStart(2, '0');
}

export function yedekIndir(d: Durum): void {
  const t = new Date();
  const ad =
    `ders-programi-${t.getFullYear()}-${ikiHane(t.getMonth() + 1)}-${ikiHane(t.getDate())}` +
    `-${ikiHane(t.getHours())}${ikiHane(t.getMinutes())}.json`;

  const blob = new Blob([JSON.stringify(d)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ad;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function yedekYukle(dosya: File): Promise<Durum | null> {
  return dosya.text().then(ayikla);
}

// --------------------------------------------------------------------- hook

function ilkKutu(): Kutu {
  yedekleriKaydir();
  return { simdi: oku() ?? bosDurum(), gecmis: [], ileri: [] };
}

/** Metin kutusunda yazarken Ctrl+Z'yi kapmayalim — tarayici geri alsin. */
function metinGirisiMi(hedef: EventTarget | null): boolean {
  if (!(hedef instanceof HTMLElement)) return false;
  const etiket = hedef.tagName;
  return etiket === 'INPUT' || etiket === 'TEXTAREA' || hedef.isContentEditable;
}

export function useDurum() {
  const [kutu, gonder] = useReducer(indirge, undefined, ilkKutu);

  const degistir = useCallback((uygula: (d: Durum) => Durum) => {
    gonder({ tip: 'degistir', uygula });
  }, []);
  const geriAl = useCallback(() => gonder({ tip: 'geriAl' }), []);
  const ileriAl = useCallback(() => gonder({ tip: 'ileriAl' }), []);
  const yukleDurum = useCallback((durum: Durum) => gonder({ tip: 'yukle', durum }), []);

  // Otomatik kayit — geciktirmeli, yoksa her surukleme karesinde JSON yazariz.
  const zamanlayici = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(zamanlayici.current);
    zamanlayici.current = window.setTimeout(() => kaydet(kutu.simdi), KAYIT_GECIKMESI);
    return () => window.clearTimeout(zamanlayici.current);
  }, [kutu.simdi]);

  // Sekme kapanirken bekleyen kaydi hemen yaz.
  useEffect(() => {
    const kapanis = () => kaydet(kutu.simdi);
    window.addEventListener('beforeunload', kapanis);
    return () => window.removeEventListener('beforeunload', kapanis);
  }, [kutu.simdi]);

  // Ctrl+Z / Ctrl+Y — surukle-birakta yanlis birakma surekli olur, bu temel islev.
  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (metinGirisiMi(e.target)) return;
      const harf = e.key.toLowerCase();
      if (harf === 'z' && !e.shiftKey) {
        e.preventDefault();
        geriAl();
      } else if (harf === 'y' || (harf === 'z' && e.shiftKey)) {
        e.preventDefault();
        ileriAl();
      }
    };
    window.addEventListener('keydown', tus);
    return () => window.removeEventListener('keydown', tus);
  }, [geriAl, ileriAl]);

  return {
    durum: kutu.simdi,
    degistir,
    geriAl,
    ileriAl,
    yukleDurum,
    geriAlinabilir: kutu.gecmis.length > 0,
    ileriAlinabilir: kutu.ileri.length > 0,
  };
}
