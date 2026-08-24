// Excel'den yapistirma ayristiricisi. SAF fonksiyonlar.
//
// Ilk kurulumda 300+ satir veriyi tek tek girdirmek babamin pes edecegi yer.
// Excel'den kopyala-yapistir bunu saatlerden dakikalara indiriyor.
//
// Ayristirici ASLA dogrudan veri eklemez: {kabul, hata} doner, kullaniciya
// onizleme gosterilir, o onaylayinca eklenir.

export interface Sonuc<T> {
  kabul: T[];
  hata: string[];
}

/**
 * Yapistirilan metni hucre izgarasina cevirir.
 * Excel sekme ile ayirir; elle yazilmis listeler icin noktali virgul ve virgul
 * de kabul edilir. Bos satirlar atilir.
 */
export function izgaraAyir(metin: string): string[][] {
  return metin
    .split(/\r\n|\n|\r/)
    .map((satir) => satir.trim())
    .filter((satir) => satir.length > 0)
    .map((satir) => {
      const ayrac = satir.includes('\t') ? '\t' : satir.includes(';') ? ';' : ',';
      return satir.split(ayrac).map((h) => h.trim());
    });
}

function sayi(metin: string | undefined, varsayilan: number): number {
  const n = Number(String(metin ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : varsayilan;
}

/** Baslik satirini atlar (ilk hucre bilinen bir baslik kelimesiyse). */
function baslikMi(hucreler: string[], anahtarlar: string[]): boolean {
  const ilk = (hucreler[0] ?? '').toLocaleLowerCase('tr');
  return anahtarlar.some((a) => ilk === a);
}

// ------------------------------------------------------------------ derslik

/** Bir satir = bir derslik adi. */
export function derslikAyristir(metin: string): Sonuc<{ ad: string }> {
  const kabul: Array<{ ad: string }> = [];
  const hata: string[] = [];
  const gorulen = new Set<string>();

  for (const [i, hucreler] of izgaraAyir(metin).entries()) {
    if (i === 0 && baslikMi(hucreler, ['derslik', 'oda', 'ad'])) continue;
    const ad = hucreler[0] ?? '';
    if (ad === '') continue;
    if (gorulen.has(ad)) {
      hata.push(`${i + 1}. satır: "${ad}" iki kez geçiyor, biri alındı.`);
      continue;
    }
    gorulen.add(ad);
    kabul.push({ ad });
  }
  return { kabul, hata };
}

// ----------------------------------------------------------------- ogretmen

export interface OgretmenSatir {
  ad: string;
  kisaltma: string;
  brans: string;
}

/** Sutunlar: Ad · Kısaltma · Branş */
export function ogretmenAyristir(metin: string): Sonuc<OgretmenSatir> {
  const kabul: OgretmenSatir[] = [];
  const hata: string[] = [];

  for (const [i, hucreler] of izgaraAyir(metin).entries()) {
    if (i === 0 && baslikMi(hucreler, ['ad', 'isim', 'öğretmen', 'ogretmen'])) continue;
    const ad = hucreler[0] ?? '';
    if (ad === '') continue;

    const brans = hucreler[2] ?? '';
    if (brans === '') hata.push(`${i + 1}. satır: "${ad}" için branş boş.`);

    kabul.push({
      ad,
      // Kisaltma bos birakilmissa addan uret: "Mehmet Çelik" -> "MÇ"
      kisaltma: (hucreler[1] ?? '') || kisaltmaUret(ad),
      brans,
    });
  }
  return { kabul, hata };
}

export function kisaltmaUret(ad: string): string {
  const parcalar = ad.split(/\s+/).filter((x) => x.length > 0);
  if (parcalar.length === 0) return '??';
  return parcalar
    .slice(0, 2)
    .map((p) => (p[0] ?? '').toLocaleUpperCase('tr'))
    .join('');
}

// -------------------------------------------------------------------- sinif

export interface SinifSatir {
  ad: string;
  derslikAd: string;
}

/** Sutunlar: Sınıf · Derslik (derslik bos olabilir) */
export function sinifAyristir(metin: string): Sonuc<SinifSatir> {
  const kabul: SinifSatir[] = [];
  const hata: string[] = [];
  const gorulen = new Set<string>();

  for (const [i, hucreler] of izgaraAyir(metin).entries()) {
    if (i === 0 && baslikMi(hucreler, ['sınıf', 'sinif', 'grup', 'ad'])) continue;
    const ad = hucreler[0] ?? '';
    if (ad === '') continue;
    if (gorulen.has(ad)) {
      hata.push(`${i + 1}. satır: "${ad}" sınıfı iki kez geçiyor, biri alındı.`);
      continue;
    }
    gorulen.add(ad);
    kabul.push({ ad, derslikAd: hucreler[1] ?? '' });
  }
  return { kabul, hata };
}

// --------------------------------------------------------------------- ders

export interface DersSatir {
  sinifAd: string;
  ogretmen: string; // ad veya kisaltma
  haftalikSaat: number;
  blok: number;
}

/** Sutunlar: Sınıf · Öğretmen · Haftalık saat · Blok (blok bossa 1) */
export function dersAyristir(metin: string): Sonuc<DersSatir> {
  const kabul: DersSatir[] = [];
  const hata: string[] = [];

  for (const [i, hucreler] of izgaraAyir(metin).entries()) {
    if (i === 0 && baslikMi(hucreler, ['sınıf', 'sinif', 'grup'])) continue;
    const sinifAd = hucreler[0] ?? '';
    const ogretmen = hucreler[1] ?? '';
    if (sinifAd === '' && ogretmen === '') continue;

    if (sinifAd === '' || ogretmen === '') {
      hata.push(`${i + 1}. satır: sınıf veya öğretmen boş, atlandı.`);
      continue;
    }
    const haftalikSaat = sayi(hucreler[2], 0);
    if (haftalikSaat === 0) {
      hata.push(`${i + 1}. satır: "${sinifAd} / ${ogretmen}" için saat okunamadı, atlandı.`);
      continue;
    }
    const blok = Math.min(3, sayi(hucreler[3], 1));
    kabul.push({ sinifAd, ogretmen, haftalikSaat, blok });
  }
  return { kabul, hata };
}
