/**
 * English. The second language, and the first translation of any kind.
 *
 * The keys are the Turkish sentences — see the long note at the top of
 * `src/i18n.ts` for why. Two consequences to keep in mind while editing:
 *
 *   - A key that no longer appears anywhere in `src/` is DEAD, and
 *     `i18n.test.ts` says so. Editing the Turkish copy orphans its
 *     translation, which is the price of using sentences as keys.
 *   - `{slot}` names have to match the Turkish exactly, and their ORDER may
 *     not: "{n} teachers" and "{n} öğretmen" agree, "in room {room}" and
 *     "{room} dersliğinde" do not, and that freedom is the point.
 *   - `**` marks emphasis. It must stay balanced; `<T>` splits on it.
 */
import { registerSozluk } from '../i18n';
import type { Sozluk } from '../i18n';

const EN: Sozluk = {
  // ------------------------------------------------- the week and the subjects
  //
  // DATA drawn, never data stored: `settings.days[].name` and `settings.subjects`
  // stay Turkish in the file so a backup means the same thing on every machine
  // and `remapDays()` keeps building its mapping from them (pitfall 11). Only
  // the seven and the twenty-one this program itself put there are translated;
  // anything the reader typed is drawn as they typed it.
  'Pazartesi': 'Monday',
  'Salı': 'Tuesday',
  'Çarşamba': 'Wednesday',
  'Perşembe': 'Thursday',
  'Cuma': 'Friday',
  'Cumartesi': 'Saturday',
  'Pazar': 'Sunday',

  'Pzt': 'Mon',
  'Sal': 'Tue',
  'Çar': 'Wed',
  'Per': 'Thu',
  'Cum': 'Fri',
  'Cmt': 'Sat',
  'Pzr': 'Sun',

  'Matematik': 'Mathematics',
  'Fizik': 'Physics',
  'Geometri': 'Geometry',
  'Kimya': 'Chemistry',
  'Biyoloji': 'Biology',
  'Türkçe': 'Turkish',
  'Edebiyat': 'Literature',
  'Tarih': 'History',
  'Coğrafya': 'Geography',
  'İngilizce': 'English',
  'Felsefe': 'Philosophy',
  'Din Kültürü': 'Religious Studies',
  'Almanca': 'German',
  'Fransızca': 'French',
  'Müzik': 'Music',
  'Resim': 'Art',
  'Beden Eğitimi': 'Physical Education',
  'Sosyal Bilgiler': 'Social Studies',
  'Fen Bilimleri': 'Science',
  'Rehberlik': 'Guidance',
  'İnkılap Tarihi': 'History of Reforms',

  // Three characters, because a grid cell is 34 px and an A4 column is ~21 mm.
  'Mat': 'Mth',
  'Fzk': 'Phy',
  'Geo': 'Geo',
  'Kim': 'Chm',
  'Biy': 'Bio',
  'Trk': 'Tur',
  'Edb': 'Lit',
  'Tar': 'His',
  'Coğ': 'Gph',
  'İng': 'Eng',
  'Fel': 'Phi',
  'Din': 'Rel',
  'Alm': 'Ger',
  'Fra': 'Fre',
  'Müz': 'Mus',
  'Res': 'Art',
  'Bed': 'PE',
  'Sos': 'Soc',
  'Fen': 'Sci',
  'Reh': 'Gui',
  'İnk': 'Ref',
  // ------------------------------------------------------------ the shell
  'Okul': 'School',
  'Müsaitlik': 'Availability',
  'Program': 'Timetable',
  'Kontrol': 'Check',
  'Çıktı': 'Print',
  'Ayarlar': 'Settings',

  'Bölümler': 'Sections',

  // --------------------------------------------------------- the language
  'Dil': 'Language',
  'Arayüzün dili. Bu ayar bu bilgisayara aittir; yedek dosyasına girmez ve programın kendisini değiştirmez.':
    'The language of the interface. This setting belongs to this computer; it does not go into the backup file and it does not change the timetable itself.',
};

registerSozluk('en', EN);

export default EN;
