/**
 * Every release's own line — TASKS.md §2 B2.9, "babam her güncelleme
 * alındığında neyin değiştiğini soruyor ben de pek hatırlamıyorum."
 *
 * `.github/surum-notu.md` is NOT this: the release workflow overwrites it
 * with the same static install/download text on every tag, it holds no
 * per-version history, and it never ships into `dist/` — so it cannot be
 * read at runtime either (principle 3, nothing is fetched). This file is
 * the single source: bundled at build time exactly like `lang/*.ts`,
 * hand-edited once per release, read by Ayarlar → Hakkında.
 *
 * `scripts/yayinla.mjs` refuses to publish unless the top entry's version
 * matches the one being released — the entry for a release is written
 * BEFORE `npm run yayinla` is run, not after.
 */

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
    version: '2.1.0',
    date: '2026-08-31',
    items: [
      'Klavye kısayolları için bir yardım ekranı eklendi (üst çubuk, Ctrl+K veya "?" tuşu).',
      'Ayarlar → Hakkında bölümüne bu "Yenilikler" paneli eklendi.',
    ],
  },
];

// A raw literal rather than `${BASE_KEY}-yenilik-gorulen`: `library.ts` needs
// this key too (for `storageReport`'s table row), and importing `BASE_KEY`
// from there would give `library.ts` <-> `changelog.ts` a runtime cycle. The
// same reason `theme.ts`'s `INTRO_KEY` is a literal rather than a template.
export const CHANGELOG_SEEN_KEY = 'ders-programi-yenilik-gorulen';

export function readChangelogSeenVersion(): string {
  try {
    return localStorage.getItem(CHANGELOG_SEEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function markChangelogSeen(version: string): void {
  try {
    localStorage.setItem(CHANGELOG_SEEN_KEY, version);
  } catch {
    // Nothing to do: the badge simply comes back next time.
  }
}

export function hasUnseenChangelog(): boolean {
  const latest = SURUM_NOTLARI[0]?.version ?? '';
  return latest !== '' && readChangelogSeenVersion() !== latest;
}
