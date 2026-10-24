// How a person or a thing is named: a fresh id (`newId`, the one place
// `Math.random` is drawn from), the two-initial short form, and gender as a
// chip, a cell and a pasted word.

import { t } from '../../leaf/i18n';
import type { Gender, Id } from '../../leaf/model';

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // no lookalikes: l, o, 0, 1

export function newId(): Id {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

/**
 * "Mehmet Çelik" -> "MÇ". Two initials, Turkish uppercase (i -> İ).
 *
 * ONE home: it was written twice (import.ts and sample.ts) and the second copy
 * split on a single space, so a double space produced "" instead of "??".
 */
export function makeShort(name: string): string {
  const parts = name.split(/\s+/).filter((x) => x.length > 0);
  if (parts.length === 0) return '??';
  return parts
    .slice(0, 2)
    .map((p) => (p[0] ?? '').toLocaleUpperCase('tr'))
    .join('');
}

/**
 * What a gender reads as in PROSE: a chip, a count, a paste preview. ONE home,
 * because a chip saying "k" would be a chip nobody clicks.
 */
// The KEYS stay Turkish (they are what a paste is matched against and what a
// chip is grouped by); `genderLabel` translates on the way out.
const GENDER_LABEL: Record<Gender, string> = {
  '': 'Belirtilmemiş',
  k: 'Kadın',
  e: 'Erkek',
};

/**
 * And what it reads as in a TABLE CELL — the same split this file already
 * makes between `Teacher.name` and `Teacher.short`, and that `shortDay()`
 * makes for a weekday.
 *
 * Measured, not guessed: "Belirtilmemiş" wants 106 px at 100 % and 144 px at
 * 150 %, in a box whose inside is 71 px. Widening the column instead squeezed
 * the NAME column from 232 px to 26 px at 150 %, because eleven columns in a
 * `width: 100%` table are already over-subscribed there. A dash under a
 * heading that says "Cinsiyet" says the same thing in one character.
 */
const GENDER_CELL: Record<Gender, string> = {
  '': '–',
  k: 'Kadın',
  e: 'Erkek',
};

export function genderLabel(gender: Gender): string {
  return t(GENDER_LABEL[gender]);
}

export function genderCell(gender: Gender): string {
  // The dash is not a word; translating it would only invite a dictionary
  // entry that changes it.
  return gender === '' ? GENDER_CELL[gender] : t(GENDER_CELL[gender]);
}

/**
 * A pasted cell -> a stored letter. Deliberately generous: a column copied out
 * of Excel says "K", "Kadın", "kadin" or "KADIN" depending on who typed it, and
 * refusing four of those would send the reader back to retype 25 rows.
 *
 * Anything unrecognised — including an absent column — is "not stated" rather
 * than an error: a paste that half-fills this field is still a good paste.
 */
export function parseGender(raw: string): Gender {
  // Not listview's `fold`: this file already has a narrower `fold` of its own
  // for name matching, and one file with two folds is worse than one line of
  // lowercasing. The dotless ı is spelled out below instead of flattened.
  const text = raw.trim().toLocaleLowerCase('tr');
  if (text === 'k' || text === 'kadın' || text === 'kadin' || text === 'bayan') return 'k';
  if (text === 'e' || text === 'erkek' || text === 'bay') return 'e';
  return '';
}
