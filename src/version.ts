// Which build this is — the same answer on all four delivery routes.
//
// `__SURUM__` is pressed in at build time by both vite configs (see
// scripts/surum.mjs). It is NOT a build flag that makes one target behave
// differently: dist/index.html, dist-site/, the installed copy and the .exe
// all carry the same record, exactly like `isDesktop()` is a feature test
// rather than a flag.
//
// The fallback matters more than it looks. `tsc --noEmit` never sees a define,
// and neither does a bare `node` import in a unit test — a missing fallback is
// a ReferenceError at module load, which would take the whole app down on the
// one screen that is supposed to explain what is going on.

export interface Surum {
  /** package.json's version, e.g. "1.1.0". */
  version: string;
  /** Short git commit, or '' where git was not available. */
  commit: string;
  /** Build date, YYYY-MM-DD. */
  date: string;
}

declare const __SURUM__: Surum | undefined;

export const GELISTIRME: Surum = { version: '0.0.0-dev', commit: '', date: '' };

/**
 * Read once, at module load. It cannot change while the page is open — and a
 * function call here would invite somebody to think it can.
 */
export const SURUM: Surum =
  typeof __SURUM__ === 'undefined' || __SURUM__ === undefined ? GELISTIRME : __SURUM__;

const AYLAR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

/**
 * "27 Ağustos 2026" from "2026-08-27". Hand-written rather than
 * toLocaleDateString: the date is a fixed ISO string, not a Date, and parsing
 * it into one only to format it back invites a timezone to move it a day.
 */
export function tarihYazisi(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m === null) return '';
  const ay = AYLAR[Number(m[2]) - 1];
  if (ay === undefined) return '';
  return `${Number(m[3])} ${ay} ${m[1]}`;
}

/** "v1.1.0 · 27 Ağustos 2026", or just "v1.1.0" when there is no date. */
export function surumEtiketi(s: Surum = SURUM): string {
  const tarih = tarihYazisi(s.date);
  return tarih === '' ? `v${s.version}` : `v${s.version} · ${tarih}`;
}
