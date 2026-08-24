// Veri modeli. Sadece tipler ve degismezler; mantik yok.
//
// Bu dosyayi degistirmek pahali: yerlesim anahtarlari, yedek dosyalari ve
// localStorage icerigi bu sekle bagli. Degistirmeden once docs/PLAN.md bolum 2.

export type Id = string; // 8 karakter rastgele. ASLA isim veya dizi indeksi.

/** Fiziksel oda. Sinifin sabit alani; yerlestirirken secilmez. */
export interface Derslik {
  id: Id;
  ad: string; // "A" .. "H"
}

/** Her ogretmenin TEK bransi var; brans dersin degil ogretmenin alani. */
export interface Ogretmen {
  id: Id;
  ad: string;
  kisaltma: string; // "MC" — izgarada satir basligi
  brans: string; // "Matematik" — serbest metin, ayri tablo degil
  renk: number; // palet indeksi 0..RENK_SAYISI-1, hex degil
}

/** Kapali bir ogrenci kumesi. Iki sinif ayni saatte ders yapabilir. */
export interface Sinif {
  id: Id;
  ad: string; // "510"
  derslikId: Id | null; // null ise derslik cakismasi kontrol edilmez
}

/** Bir sinifa, bir ogretmen tarafindan verilen haftalik ders yuku. */
export interface Ders {
  id: Id;
  sinifId: Id;
  ogretmenId: Id;
  haftalikSaat: number; // haftalik toplam
  blok: number; // arka arkaya kac saat (1, 2 veya 3)
}

export interface Ayar {
  gunler: string[]; // ["Pazartesi", ... "Pazar"]
  saatler: string[]; // ["1", ... "12"] veya "09:00-09:45" — gorunen ad
}

export interface Durum {
  semaSurumu: typeof SEMA_SURUMU;
  ayar: Ayar;
  derslikler: Derslik[];
  ogretmenler: Ogretmen[];
  siniflar: Sinif[];
  dersler: Ders[];
  /** `${ogretmenId}|${gun}|${saat}` -> 1 . Anahtar varsa ogretmen gelemez. */
  musaitDegil: Record<string, 1>;
  /** `${sinifId}|${gun}|${saat}` -> dersId . Blok = ardisik ayni dersId. */
  yerlesim: Record<string, Id>;
}

/** Ilk gunden var. Model degisirse eski yedekler bununla goc ettirilir. */
export const SEMA_SURUMU = 1;

/** styles.css icindeki --renk-0 .. --renk-11 ile ayni sayida olmali. */
export const RENK_SAYISI = 12;
