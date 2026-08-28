/**
 * French. Same contract as `en.ts`, and the same three things to keep in mind:
 *
 *   - The keys are the Turkish sentences (see `src/i18n.ts`). A key that no
 *     longer appears anywhere in `src/` is DEAD and `i18n.test.ts` says so.
 *   - `{slot}` names have to match the Turkish exactly, their ORDER may not.
 *   - `**` marks emphasis and must stay balanced; `{n:one|other}` is a plural
 *     and its category comes from `Intl.PluralRules`, not from `n === 1`.
 */
import { registerSozluk } from '../i18n';
import type { Sozluk } from '../i18n';

const FR: Sozluk = {
  // ------------------------------------------------- the week and the subjects
  //
  // DATA drawn, never data stored: `settings.days[].name` and `settings.subjects`
  // stay Turkish in the file so a backup means the same thing on every machine
  // and `remapDays()` keeps building its mapping from them (pitfall 11). Only
  // the seven and the twenty-one this program itself put there are translated;
  // anything the reader typed is drawn as they typed it.
  'Pazartesi': 'Lundi',
  'Salı': 'Mardi',
  'Çarşamba': 'Mercredi',
  'Perşembe': 'Jeudi',
  'Cuma': 'Vendredi',
  'Cumartesi': 'Samedi',
  'Pazar': 'Dimanche',

  'Pzt': 'Lun',
  'Sal': 'Mar',
  'Çar': 'Mer',
  'Per': 'Jeu',
  'Cum': 'Ven',
  'Cmt': 'Sam',
  'Pzr': 'Dim',

  'Matematik': 'Mathématiques',
  'Fizik': 'Physique',
  'Geometri': 'Géométrie',
  'Kimya': 'Chimie',
  'Biyoloji': 'Biologie',
  'Türkçe': 'Turc',
  'Edebiyat': 'Littérature',
  'Tarih': 'Histoire',
  'Coğrafya': 'Géographie',
  'İngilizce': 'Anglais',
  'Felsefe': 'Philosophie',
  'Din Kültürü': 'Religion',
  'Almanca': 'Allemand',
  'Fransızca': 'Français',
  'Müzik': 'Musique',
  'Resim': 'Dessin',
  'Beden Eğitimi': 'Éducation physique',
  'Sosyal Bilgiler': 'Sciences sociales',
  'Fen Bilimleri': 'Sciences',
  'Rehberlik': 'Orientation',
  'İnkılap Tarihi': 'Histoire des réformes',

  // Three characters, because a grid cell is 34 px and an A4 column is ~21 mm.
  'Mat': 'Mat',
  'Fzk': 'Phy',
  'Geo': 'Géo',
  'Kim': 'Chi',
  'Biy': 'Bio',
  'Trk': 'Tur',
  'Edb': 'Lit',
  'Tar': 'His',
  'Coğ': 'Gph',
  'İng': 'Ang',
  'Fel': 'Phi',
  'Din': 'Rel',
  'Alm': 'All',
  'Fra': 'Fra',
  'Müz': 'Mus',
  'Res': 'Des',
  'Bed': 'EPS',
  'Sos': 'SSo',
  'Fen': 'Sci',
  'Reh': 'Ori',
  'İnk': 'Réf',
};

registerSozluk('fr', FR);

export default FR;
