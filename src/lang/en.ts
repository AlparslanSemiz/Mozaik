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
