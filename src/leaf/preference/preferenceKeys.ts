// Every localStorage key a machine preference is stored under, and what the
// "Veriler nerede" table calls it, in the order the table lists them.
//
// A leaf, so that library.ts can list them without importing the modules that
// own them: `changelog.ts` and `programColor.ts` sit above the plan library,
// and reaching up for a key string was the only reason it imported either.
// Turkish on purpose: like `ders-programi`, these keys are user data, not code.
// The labels go through `t()` where the table is drawn.

export const THEME_KEY = 'ders-programi-tema';
export const LANG_KEY = 'ders-programi-dil';
export const SCALE_KEY = 'ders-programi-olcek';
export const DENSITY_KEY = 'ders-programi-yogunluk';
export const PROGRAM_COLOR_KEY = 'ders-programi-program-rengi';
export const UI_DENSITY_KEY = 'ders-programi-arayuz-yogunluk';
export const DOCK_KEY = 'ders-programi-havuz';
export const DOCK_H_KEY = 'ders-programi-havuz-boy';
export const RIBBON_KEY = 'ders-programi-serit';
export const RIBBON_AUTO_KEY = 'ders-programi-serit-gizle';
export const AVAIL_CLOCK_KEY = 'ders-programi-musaitlik-saat';
export const MOTION_KEY = 'ders-programi-hareket';
export const INTRO_KEY = 'ders-programi-tanitim';
export const PRINT_OPTIONS_KEY = 'ders-programi-baski';
export const CHANGELOG_SEEN_KEY = 'ders-programi-yenilik-gorulen';
export const RELAX_LOG_KEY = 'ders-programi-oneri-olcum';

/**
 * The rail it belonged to is gone and nothing writes it any more, but an older
 * browser may still hold it, and a table that hides a key it once wrote would
 * stop being the answer to "is all of it in here?".
 */
const SIDEBAR_KEY = 'ders-programi-kenar';

export const PREFERENCE_ROWS: ReadonlyArray<{ key: string; label: string }> = [
  { key: THEME_KEY, label: 'tema tercihi' },
  { key: LANG_KEY, label: 'dil tercihi' },
  { key: SIDEBAR_KEY, label: 'kenar çubuğu tercihi' },
  { key: SCALE_KEY, label: 'yazı büyüklüğü tercihi' },
  { key: DENSITY_KEY, label: 'ızgara yoğunluğu tercihi' },
  { key: PROGRAM_COLOR_KEY, label: 'program kart rengi tercihi' },
  { key: UI_DENSITY_KEY, label: 'arayüz yoğunluğu tercihi' },
  { key: DOCK_KEY, label: 'havuz çekmecesi tercihi' },
  { key: DOCK_H_KEY, label: 'havuz çekmecesinin boyu' },
  { key: RIBBON_KEY, label: 'araç şeridi tercihi' },
  { key: RIBBON_AUTO_KEY, label: 'şerit kaydırınca gizlensin mi' },
  { key: AVAIL_CLOCK_KEY, label: 'müsaitlikte saat gösterimi' },
  { key: MOTION_KEY, label: 'hareket (animasyon) tercihi' },
  { key: INTRO_KEY, label: 'örnek veri satırı görüldü mü' },
  { key: PRINT_OPTIONS_KEY, label: 'kâğıt seçenekleri' },
  { key: CHANGELOG_SEEN_KEY, label: 'görülen sürüm notu' },
  { key: RELAX_LOG_KEY, label: 'öneri aramasının ölçümleri' },
];
