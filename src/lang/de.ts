/**
 * German. Same contract as `en.ts`, and the same three things to keep in mind:
 *
 *   - The keys are the Turkish sentences (see `src/i18n.ts`). A key that no
 *     longer appears anywhere in `src/` is DEAD and `i18n.test.ts` says so.
 *   - `{slot}` names have to match the Turkish exactly, their ORDER may not.
 *   - `**` marks emphasis and must stay balanced; `{n:one|other}` is a plural
 *     and its category comes from `Intl.PluralRules`, not from `n === 1`.
 */
import { registerSozluk } from '../i18n';
import type { Sozluk } from '../i18n';

const DE: Sozluk = {
  // ------------------------------------------------- the week and the subjects
  //
  // DATA drawn, never data stored: `settings.days[].name` and `settings.subjects`
  // stay Turkish in the file so a backup means the same thing on every machine
  // and `remapDays()` keeps building its mapping from them (pitfall 11). Only
  // the seven and the twenty-one this program itself put there are translated;
  // anything the reader typed is drawn as they typed it.
  'Pazartesi': 'Montag',
  'Salı': 'Dienstag',
  'Çarşamba': 'Mittwoch',
  'Perşembe': 'Donnerstag',
  'Cuma': 'Freitag',
  'Cumartesi': 'Samstag',
  'Pazar': 'Sonntag',

  'Pzt': 'Mo',
  'Sal': 'Di',
  'Çar': 'Mi',
  'Per': 'Do',
  'Cum': 'Fr',
  'Cmt': 'Sa',
  'Pzr': 'So',

  'Matematik': 'Mathematik',
  'Fizik': 'Physik',
  'Geometri': 'Geometrie',
  'Kimya': 'Chemie',
  'Biyoloji': 'Biologie',
  'Türkçe': 'Türkisch',
  'Edebiyat': 'Literatur',
  'Tarih': 'Geschichte',
  'Coğrafya': 'Erdkunde',
  'İngilizce': 'Englisch',
  'Felsefe': 'Philosophie',
  'Din Kültürü': 'Religion',
  'Almanca': 'Deutsch',
  'Fransızca': 'Französisch',
  'Müzik': 'Musik',
  'Resim': 'Kunst',
  'Beden Eğitimi': 'Sport',
  'Sosyal Bilgiler': 'Sozialkunde',
  'Fen Bilimleri': 'Naturwissenschaften',
  'Rehberlik': 'Beratung',
  'İnkılap Tarihi': 'Reformgeschichte',

  // Three characters, because a grid cell is 34 px and an A4 column is ~21 mm.
  'Mat': 'Mat',
  'Fzk': 'Phy',
  'Geo': 'Geo',
  'Kim': 'Che',
  'Biy': 'Bio',
  'Trk': 'Tür',
  'Edb': 'Lit',
  'Tar': 'Ges',
  'Coğ': 'Erd',
  'İng': 'Eng',
  'Fel': 'Phi',
  'Din': 'Rel',
  'Alm': 'Deu',
  'Fra': 'Fra',
  'Müz': 'Mus',
  'Res': 'Kun',
  'Bed': 'Spo',
  'Sos': 'Soz',
  'Fen': 'Nat',
  'Reh': 'Ber',
  'İnk': 'Ref',
};

registerSozluk('de', DE);

export default DE;
