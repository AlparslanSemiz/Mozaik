// A teacher's gender: how it is read, and how a pasted column is understood.
//
// It never reaches the paper — nobody asked for a form of address on a
// timetable, and a printed sheet is the last place to guess at one.

import { t } from './i18n';
import type { Gender } from './types';

/**
 * What a gender reads as in PROSE: a chip, a count, a paste preview. ONE home,
 * because a chip saying "k" would be a chip nobody clicks.
 */
// The KEYS stay Turkish (they are what a paste is matched against and what a
// chip is grouped by); `genderLabel` translates on the way out.
export const GENDER_LABEL: Record<Gender, string> = {
  '': 'Belirtilmemiş',
  k: 'Kadın',
  e: 'Erkek',
};

/**
 * And what it reads as in a TABLE CELL — the same split this project already
 * makes between `Teacher.name` and `Teacher.short`, and that `shortDay()`
 * makes for a weekday.
 *
 * Measured, not guessed: "Belirtilmemiş" wants 106 px at 100 % and 144 px at
 * 150 %, in a box whose inside is 71 px. Widening the column instead squeezed
 * the NAME column from 232 px to 26 px at 150 %, because eleven columns in a
 * `width: 100%` table are already over-subscribed there. A dash under a
 * heading that says "Cinsiyet" says the same thing in one character.
 */
export const GENDER_CELL: Record<Gender, string> = {
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
  // Not listview's `fold`, and not importRows.ts's either: this is one line of
  // lowercasing, and the dotless ı is spelled out below instead of flattened.
  const text = raw.trim().toLocaleLowerCase('tr');
  if (text === 'k' || text === 'kadın' || text === 'kadin' || text === 'bayan') return 'k';
  if (text === 'e' || text === 'erkek' || text === 'bay') return 'e';
  return '';
}
