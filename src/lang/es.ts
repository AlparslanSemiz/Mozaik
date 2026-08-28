/**
 * Spanish. Same contract as `en.ts`, and the same three things to keep in mind:
 *
 *   - The keys are the Turkish sentences (see `src/i18n.ts`). A key that no
 *     longer appears anywhere in `src/` is DEAD and `i18n.test.ts` says so.
 *   - `{slot}` names have to match the Turkish exactly, their ORDER may not.
 *   - `**` marks emphasis and must stay balanced; `{n:one|other}` is a plural
 *     and its category comes from `Intl.PluralRules`, not from `n === 1`.
 */
import { registerSozluk } from '../i18n';
import type { Sozluk } from '../i18n';

const ES: Sozluk = {
  // ------------------------------------------------- the week and the subjects
  //
  // DATA drawn, never data stored: `settings.days[].name` and `settings.subjects`
  // stay Turkish in the file so a backup means the same thing on every machine
  // and `remapDays()` keeps building its mapping from them (pitfall 11). Only
  // the seven and the twenty-one this program itself put there are translated;
  // anything the reader typed is drawn as they typed it.
  'Pazartesi': 'Lunes',
  'Salı': 'Martes',
  'Çarşamba': 'Miércoles',
  'Perşembe': 'Jueves',
  'Cuma': 'Viernes',
  'Cumartesi': 'Sábado',
  'Pazar': 'Domingo',

  'Pzt': 'Lun',
  'Sal': 'Mar',
  'Çar': 'Mié',
  'Per': 'Jue',
  'Cum': 'Vie',
  'Cmt': 'Sáb',
  'Pzr': 'Dom',

  'Matematik': 'Matemáticas',
  'Fizik': 'Física',
  'Geometri': 'Geometría',
  'Kimya': 'Química',
  'Biyoloji': 'Biología',
  'Türkçe': 'Turco',
  'Edebiyat': 'Literatura',
  'Tarih': 'Historia',
  'Coğrafya': 'Geografía',
  'İngilizce': 'Inglés',
  'Felsefe': 'Filosofía',
  'Din Kültürü': 'Religión',
  'Almanca': 'Alemán',
  'Fransızca': 'Francés',
  'Müzik': 'Música',
  'Resim': 'Dibujo',
  'Beden Eğitimi': 'Educación Física',
  'Sosyal Bilgiler': 'Ciencias Sociales',
  'Fen Bilimleri': 'Ciencias Naturales',
  'Rehberlik': 'Orientación',
  'İnkılap Tarihi': 'Historia de las Reformas',

  // Three characters, because a grid cell is 34 px and an A4 column is ~21 mm.
  'Mat': 'Mat',
  'Fzk': 'Fís',
  'Geo': 'Geo',
  'Kim': 'Quí',
  'Biy': 'Bio',
  'Trk': 'Tur',
  'Edb': 'Lit',
  'Tar': 'His',
  'Coğ': 'Gfa',
  'İng': 'Ing',
  'Fel': 'Fil',
  'Din': 'Rel',
  'Alm': 'Ale',
  'Fra': 'Fra',
  'Müz': 'Mús',
  'Res': 'Dib',
  'Bed': 'EF',
  'Sos': 'CSo',
  'Fen': 'CNa',
  'Reh': 'Ori',
  'İnk': 'Ref',
};

registerSozluk('es', ES);

export default ES;
