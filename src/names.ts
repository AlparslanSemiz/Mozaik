/**
 * The vocabulary this program itself put on the screen: seven weekday names and
 * twenty-one subjects, and what each of them reads as.
 *
 * A LEAF, below `constraints.ts` — and that is the whole reason it exists as
 * its own file rather than staying in `entities.ts`. `blocker()` writes "MÇ
 * Salı 3 saatinde müsait değil" and has to be able to draw that day name in the
 * interface language; `entities.ts` already imports `constraints.ts`, so
 * anything BOTH of them need has to live below both. The same shape as
 * `keys.ts`, `subjects.ts` and `blocks.ts`.
 *
 * What these functions do NOT do is change what is STORED. `settings.days[].name`
 * and `settings.subjects` stay Turkish in the file: `remapDays()` builds its
 * mapping from the stored name (pitfall 11), `subjectShorts` is keyed by it, and
 * a backup has to mean the same thing on every machine. So only the names this
 * program itself wrote are translated, and anything the reader typed is handed
 * back untouched — translating that would be a guess about somebody else's word.
 */
import { t } from './i18n';
import { subjectKey } from './subjects';

/** The week in calendar order. The checkboxes in Setup are built from this. */
export const WEEK = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

/** Monday is NOT taught at this school; the week runs Tuesday to Sunday. */
export const DEFAULT_DAY_NAMES = WEEK.slice(1);

/**
 * Column headers. NOT the first three letters: "Cuma" and "Cumartesi" both give
 * "Cum" and the availability grid becomes unreadable.
 */
const SHORT_DAY: Record<string, string> = {
  Pazartesi: 'Pzt',
  Salı: 'Sal',
  Çarşamba: 'Çar',
  Perşembe: 'Per',
  Cuma: 'Cum',
  Cumartesi: 'Cmt',
  Pazar: 'Pzr',
};

// ----------------------------------------------------------------- subjects
//
// "Matematik" does not fit a 34px cell, and on A4 landscape a column is ~21mm.
// "Mat" fits. The full name is kept where there is room (row headings, the
// Kurulum tables, the printed page title).

/** Built in, so an empty project already reads well. Overridable, one by one. */
export const DEFAULT_SUBJECT_SHORTS: Record<string, string> = {
  Matematik: 'Mat',
  Fizik: 'Fzk',
  Geometri: 'Geo',
  Kimya: 'Kim',
  Biyoloji: 'Biy',
  Türkçe: 'Trk',
  Edebiyat: 'Edb',
  Tarih: 'Tar',
  Coğrafya: 'Coğ',
  İngilizce: 'İng',
  Felsefe: 'Fel',
  'Din Kültürü': 'Din',
  Almanca: 'Alm',
  Fransızca: 'Fra',
  Müzik: 'Müz',
  Resim: 'Res',
  'Beden Eğitimi': 'Bed',
  'Sosyal Bilgiler': 'Sos',
  'Fen Bilimleri': 'Fen',
  Rehberlik: 'Reh',
  'İnkılap Tarihi': 'İnk',
};

const BUILT_IN_SUBJECT = new Set(Object.keys(DEFAULT_SUBJECT_SHORTS).map(subjectKey));

/**
 * A subject's name ON SCREEN — the same split `dayLabel()` makes, for the same
 * reason. `settings.subjects` is a list the reader edits and the backup carries;
 * translating what is stored would mean a plan taken here arrives on my
 * father's machine speaking English. So the built-in twenty-one are drawn in
 * the interface language and everything he typed himself is drawn as he typed
 * it.
 */
export function subjectLabel(subject: string): string {
  const key = subjectKey(subject);
  return BUILT_IN_SUBJECT.has(key) ? t(subject.trim()) : subject;
}

/**
 * A day's name ON SCREEN — which is not the same thing as a day's name.
 */
export function dayLabel(name: string): string {
  return name in SHORT_DAY ? t(name) : name;
}

export function shortDay(name: string): string {
  const known = SHORT_DAY[name];
  return known === undefined ? name.slice(0, 3) : t(known);
}

const DEFAULT_BY_KEY = new Map(
  Object.entries(DEFAULT_SUBJECT_SHORTS).map(([name, short]) => [subjectKey(name), short]),
);

/** The built-in short for a subject, translated. '' when there is none. */
export function builtInShort(subject: string): string | undefined {
  const known = DEFAULT_BY_KEY.get(subjectKey(subject));
  return known === undefined ? undefined : t(known);
}

/** The same one UNTRANSLATED — what an override is compared against. */
export function builtInShortRaw(subject: string): string | undefined {
  return DEFAULT_BY_KEY.get(subjectKey(subject));
}
