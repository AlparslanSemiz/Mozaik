/**
 * Every release's own line — TODO.md §2 B2.9, "babam her güncelleme
 * alındığında neyin değiştiğini soruyor ben de pek hatırlamıyorum."
 *
 * `.github/surum-notu.md` is NOT this: the release workflow reads it as the
 * same static install/download text for every tag's page, it holds no
 * per-version history, and it never ships into `dist/` — so it cannot be
 * read at runtime either (offline principle, nothing is fetched). This file is
 * the single source: bundled at build time exactly like `lang/*.ts`,
 * hand-edited once per release, read by Ayarlar → Hakkında.
 *
 * `scripts/yayinla.mjs` refuses to publish unless the top entry's version
 * matches the one being released — the entry for a release is written
 * BEFORE `npm run yayinla` is run, not after.
 */

import { preference } from '../leaf/preference';
import { CHANGELOG_SEEN_KEY } from '../leaf/preferenceKeys';

export interface SurumNotu {
  /** package.json's version at release, e.g. "2.1.0" — no leading "v". */
  version: string;
  /** ISO date, the same shape as `Surum.date` in version.ts. */
  date: string;
  /** Short lines, Turkish — they go through `t()` where they are drawn. */
  items: string[];
}

/** Newest release first — every other history list in this app reads that way. */
export const SURUM_NOTLARI: SurumNotu[] = [
  {
    version: '2.2.0',
    date: '2026-09-26',
    items: [
      'Hafta kurulamayınca program neyin değişmesi gerektiğini yol yol söylüyor, her yol tek tıkla uygulanıyor ve Ctrl+Z ile geri alınıyor.',
      'Öneri panelinde öğretmenlere sorulacak sorular var, her birinde Olur ve Olmaz; cevaplar planla birlikte saklanıyor.',
      'Izgarada göster, önerilen haftayı uygulamadan önce ızgarada işaretli gösteriyor.',
      'Otomatik diz takılınca vazgeçmiyor, bulduğu en iyi haftayı onararak devam ediyor.',
      'Dersin sayfasında "Aynı gün olmasın" satırı: iki ders aynı güne konmuyor.',
      'Bir blok, bırakıldığı saatleri dolduran derslerle yer değiştirebiliyor.',
      'Ayarlar → Hakkında, öneri aramasının bu bilgisayarda ne kadar sürdüğünü gösteriyor.',
      'Kontrol, program tamamken sıkışık satırlar için artık "Dikkat" demiyor.',
      'Dil değişince bildirimler yeni dilde; boş ekranlar dersler için Dersler sekmesini gösteriyor.',
    ],
  },
  {
    version: '2.1.1',
    date: '2026-09-01',
    items: [
      'Program şeridinde Renk menüsü: kartlar öğretmene, sınıfa, dersliğe ya da branşa göre boyanıyor.',
      'Bir kart başka bir kartın üstüne bırakılınca, iki hamle de uygunsa ikisi yer değiştiriyor.',
      'Okunmamış sürüm notu varken Ayarlar şeridindeki Hakkında düğmesinde bir nokta çıkıyor.',
      'Program penceresi artık ekranı kaplayarak açılıyor, küçük bir kutuda değil.',
      'Sığdır yoğunluğunda kart yazıları kırpılmıyor: sınıf numarası "4…" değil "411" okunuyor.',
      'Sığdır, satır başından ve gün ayraçlarından kazandığı yeri ders sütunlarına veriyor.',
      "Yazı büyüklüğü yüzde 100'ün altındayken kart yazısı da onunla birlikte küçülüyor.",
    ],
  },
  {
    version: '2.1.0',
    date: '2026-09-01',
    items: [
      'Sınıf ve öğretmen boşluk kuralları, planlama analizi ve Danışman uyarıları eklendi.',
      'Klavye kısayolları için bir yardım ekranı eklendi (üst çubuk, Ctrl+K veya "?" tuşu).',
      'Ayarlar → Hakkında bölümüne bu "Yenilikler" paneli eklendi.',
      'Program kartlarını sürükleme, yoğun programlarda yaklaşık yüzde 63 hızlandırıldı.',
      'Windows görev çubuğu simgesi 20 piksel ve üzerinde ayrıntılı logoyu kullanıyor.',
      'Dersler → Sınıftan görünümündeki gereksiz Branş başlığı kaldırıldı.',
    ],
  },
];

// Which release's notes this browser has seen. The key sits in
// preferenceKeys.ts with the others, so `storageReport` lists it without
// importing this file.
export const changelogSeenPreference = preference<string>({
  key: CHANGELOG_SEEN_KEY,
  normalize: (raw) => (typeof raw === 'string' ? raw : ''),
  // Unreadable or unwritable storage: the badge simply comes back next time.
  fallback: () => '',
});

export const markChangelogSeen = changelogSeenPreference.write;

export function hasUnseenChangelog(): boolean {
  const latest = SURUM_NOTLARI[0]?.version ?? '';
  return latest !== '' && changelogSeenPreference.read() !== latest;
}
