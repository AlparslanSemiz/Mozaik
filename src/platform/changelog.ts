/**
 * Every release's own line — TODO.md §2 B2.9, "babam her güncelleme
 * alındığında neyin değiştiğini soruyor ben de pek hatırlamıyorum."
 *
 * `.github/surum-notu.md` is NOT this: the release workflow overwrites it
 * with the same static install/download text on every tag, it holds no
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
    version: '2.1.1',
    date: '2026-09-01',
    items: [
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
