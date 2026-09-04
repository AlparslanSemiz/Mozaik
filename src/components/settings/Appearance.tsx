// Settings section: how the interface is drawn — its size, and how much of the
// week the grid shows at once.
//
// Neither control is in `State`. The size of the type is a property of
// the machine and the eyes in front of it — a backup taken here must not
// resize my father's screen, and a comfort setting must not cost a schema
// migration. It lives in localStorage next to the theme and the rail
// (`theme.ts`), which is where every other machine preference already is.
//
// BUTTONS, NOT A SLIDER. The scale has ELEVEN legal values (1.00 to 1.50 in
// steps of 0.05 — it said six here while the ceiling was 1.25), so a slider
// would invent a continuum that does not exist and then hide which rung it
// landed on. The buttons reuse the `aria-pressed` state the tool already has
// four of (`.btn[aria-pressed="true"]`), so there is no new control to learn
// and no new CSS. The same applies to the density, the availability clock and
// the motion setting below: four questions, one control shape.
//
// PRINTING IS NOT AFFECTED, and the panel says so out loud. Paper is a fixed
// physical size: everything on the sheet is sized from `--fs-p-*` in pt and in
// mm, and `@media print` pins `--ui-scale` back to 1. Otherwise a slider on
// this screen would decide whether a timetable still fits on A4 — a thing my
// father would discover at the printer.

import {
  applyRibbonAuto,
  applyTheme,
  applyDensity,
  applyMotion,
  applyScale,
  applyUiDensity,
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
} from '../../view/theme';
import type { Density, Motion, Theme } from '../../view/theme';
import { DILLER, DIL_ADI } from '../../i18n';
import { T, useLang } from '../T';
import type { State } from '../../types';
import { paletteColor } from '../../palette';

interface Props {
  /** The real school, so the preview shows the reader's own names. */
  state: State;
  scale: number;
  setScale: (next: number) => void;
  density: Density;
  setDensity: (next: Density) => void;
  uiDensity: Density;
  setUiDensity: (next: Density) => void;
  /** Whether the tool strip slides away while you read down the page. */
  ribbonAuto: boolean;
  setRibbonAuto: (next: boolean) => void;
  theme: Theme;
  setTheme: (next: Theme) => void;
  motion: Motion;
  setMotion: (next: Motion) => void;
}

/** The two grounds. Named, not toggled: a button that says "Koyu tema" and is
    pressed cannot also be the one that says which theme you are IN. */
const THEMES: Array<{ id: Theme; label: string }> = [
  { id: 'light', label: 'Açık' },
  { id: 'dark', label: 'Koyu' },
];

/** The three steps, in the order they reduce. */
const MOTIONS: Array<{ id: Motion; label: string }> = [
  { id: 'tam', label: 'Tam' },
  { id: 'az', label: 'Az' },
  { id: 'kapali', label: 'Kapalı' },
];

const STEPS = Array.from(
  { length: Math.round((SCALE_MAX - SCALE_MIN) / SCALE_STEP) + 1 },
  (_, i) => Number((SCALE_MIN + i * SCALE_STEP).toFixed(2)),
);

export default function Appearance({
  state,
  scale,
  setScale,
  density,
  setDensity,
  uiDensity,
  setUiDensity,
  ribbonAuto,
  setRibbonAuto,
  theme,
  setTheme,
  motion,
  setMotion,
}: Props) {
  const { dil, setDil, t } = useLang();

  function choose(next: number) {
    applyScale(next);
    setScale(next);
  }

  // The first eight, because the point is to SEE the size, not to scroll a
  // list of twenty-five inside a settings panel.
  const teachers = state.teachers.slice(0, 8);
  const hoursOf = (id: string) =>
    state.lessons.filter((l) => l.teacherId === id).reduce((n, l) => n + l.weeklyHours, 0);

  function chooseDensity(next: Density) {
    applyDensity(next);
    setDensity(next);
  }

  function chooseUiDensity(next: Density) {
    applyUiDensity(next);
    setUiDensity(next);
  }

  function chooseTheme(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  function chooseMotion(next: Motion) {
    applyMotion(next);
    setMotion(next);
  }

  return (
    <div className="cols">
      <div>
        {/* THE THEME, WHERE THE OTHER MACHINE PREFERENCES ARE. Its button is
            still in the top bar and stays there — it is reached a dozen times
            a day. But it was the ONLY appearance preference with no line on
            the screen that lists appearance preferences, so somebody looking
            for it here found eight panels and no theme. Same state, two doors;
            the one in the top bar is the shortcut, this is the inventory. */}
        <div className="panel">
          <h2>{t('Tema')}</h2>
          <p className="hint">
            <T k="Burada ne seçerseniz o kalır; bilgisayarınızın tercihini **izlemez**." />
          </p>
          <div className="form-row" role="group" aria-label={t('Tema')}>
            {THEMES.map((x) => (
              <button
                key={x.id}
                className="btn"
                aria-pressed={x.id === theme}
                onClick={() => chooseTheme(x.id)}
              >
                {t(x.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>{t('Yazı büyüklüğü')}</h2>
          <p className="hint">
            {t('Bütün ekranı birlikte büyütür: yazıyı, boşlukları, düğmeleri ve ızgara hücrelerini.')}
          </p>

          <div className="form-row" role="group" aria-label={t('Yazı büyüklüğü')}>
            {STEPS.map((value) => (
              <button
                key={value}
                className="btn"
                aria-pressed={value === scale}
                onClick={() => choose(value)}
              >
                %{Math.round(value * 100)}
              </button>
            ))}
          </div>

          <p className="hint">
            <T k="Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Çıktı** sekmesinde." />
          </p>
        </div>

        {/* ONE panel, TWO questions — and they really are two. "Program
            ferahlığı rahatı sığdırı genel arayüz ferahlığı sığdırı rahatından
            farklı olsun." The steps trade different things (days on screen
            against cell size, versus rows in a list against how far apart the
            controls sit), so a reader who wants the whole week in the box has
            not thereby asked for a cramped Ayarlar.

            They were two panels for a day and that was one border, one shadow
            and one set of margins too many for a screen that already had
            eight. What holds them apart is what always held them apart: two
            `role="group"`s with their own names, which is also how the test
            helper finds them. */}
        <div className="panel">
          <h2>{t('Yoğunluk')}</h2>
          <h3>{t('Izgara')}</h3>
          <p className="hint">
            <T k="Yalnız **Program** ızgarasını etkiler: hücrenin büyüklüğü ve ekrana sığan gün sayısı." />
          </p>
          <ul className="hint choice-list">
            <li>
              <T k="**Ferah.** Hücre en büyük; en kolay okunan, en çok kaydırılan." />
            </li>
            <li>
              <T k="**Rahat.** Hücre geniş ve saatler yazılı; hafta sığmadığı için sağa kaydırırsınız." />
            </li>
            <li>
              <T k="**Sığdır.** Haftanın tamamı bir ekranda, ve bunun bedeli **saatlerin gizlenmesi**." />
            </li>
          </ul>

          <div className="form-row" role="group" aria-label={t('Izgara yoğunluğu')}>
            <button
              className="btn"
              aria-pressed={density === 'ferah'}
              onClick={() => chooseDensity('ferah')}
            >{t('Ferah')}</button>
            <button
              className="btn"
              aria-pressed={density === 'rahat'}
              onClick={() => chooseDensity('rahat')}
            >{t('Rahat')}</button>
            <button
              className="btn"
              aria-pressed={density === 'sigdir'}
              onClick={() => chooseDensity('sigdir')}
            >{t('Sığdır')}</button>
          </div>

          <p className="hint">
            <T k="Basılan sayfada saatler her üç durumda da yazar." />
          </p>

          <h3>{t('Arayüzün geri kalanı')}</h3>
          <p className="hint">
            <T k="Ekranın **geri kalanı**: listeler, paneller, kutular. Program ızgarasına dokunmaz." />
          </p>
          <ul className="hint choice-list">
            <li>
              <T k="**Ferah.** Satırlar en açık, paneller en geniş." />
            </li>
            <li>
              <T k="**Rahat.** Bugüne kadarki aralık." />
            </li>
            <li>
              <T k="**Sığdır.** Satır aralığı daralır; kısılan şey boşluk, **yazı boyutu değil**." />
            </li>
          </ul>

          <div className="form-row" role="group" aria-label={t('Arayüz yoğunluğu')}>
            <button
              className="btn"
              aria-pressed={uiDensity === 'ferah'}
              onClick={() => chooseUiDensity('ferah')}
            >{t('Ferah')}</button>
            <button
              className="btn"
              aria-pressed={uiDensity === 'rahat'}
              onClick={() => chooseUiDensity('rahat')}
            >{t('Rahat')}</button>
            <button
              className="btn"
              aria-pressed={uiDensity === 'sigdir'}
              onClick={() => chooseUiDensity('sigdir')}
            >{t('Sığdır')}</button>
          </div>
        </div>

        {/* The strip's own movement, and it is the movement rather than the
            strip: folding it is a button in the top bar and a preference of
            its own. What is answered here is "does it get out of the way by
            itself", which is the only thing on this screen that happens
            without being asked for. */}
        <div className="panel">
          <h2>{t('Araç şeridi')}</h2>
          <p className="hint">
            <T k="Sekmelerin altındaki bar, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**." />
          </p>
          <div className="form-row">
            <button
              className="btn"
              aria-pressed={ribbonAuto}
              onClick={() => {
                applyRibbonAuto(!ribbonAuto);
                setRibbonAuto(!ribbonAuto);
              }}
            >
              {ribbonAuto ? t('Kaydırınca gizlenir') : t('Her zaman durur')}
            </button>
          </div>
        </div>

        <div className="panel">
          <h2>{t('Hareket')}</h2>
          <p className="hint">
            <T k="Bir şey belirirken görülen kısa hareketler; kapatmak programın işini değiştirmez." />
          </p>
          <ul className="hint choice-list">
            <li>
              <T k="**Tam.** Tasarlandığı gibi." />
            </li>
            <li>
              <T k="**Az.** Süreler yarıya iner ve **yer değiştiren** hareketler kapanır." />
            </li>
            <li>
              <T k="**Kapalı.** Hiçbir şey kaymaz, hiçbir şey solmaz." />
            </li>
          </ul>

          <div className="form-row" role="group" aria-label={t('Hareket')}>
            {MOTIONS.map((m) => (
              <button
                key={m.id}
                className="btn"
                aria-pressed={m.id === motion}
                onClick={() => chooseMotion(m.id)}
              >
                {t(m.label)}
              </button>
            ))}
          </div>

          <p className="hint">
            <T k="Bilgisayarınız “azaltılmış hareket” istiyorsa hareket, ne seçerseniz seçin, **kapalı** kalır." />
          </p>
        </div>

        <div className="panel">
          <h2>{t('Dil')}</h2>
          <p className="hint">
            {t('Arayüzün dili. Bu bilgisayara aittir, yedek dosyasına girmez.')}
          </p>
          {/* The same button shape as the four questions above it, and each
              language NAMES ITSELF: a language menu is read by somebody who
              does not yet speak the one the app is currently in. */}
          <div className="form-row" role="group" aria-label={t('Dil')}>
            {DILLER.map((d) => (
              <button
                key={d}
                className="btn"
                lang={d}
                aria-pressed={d === dil}
                onClick={() => setDil(d)}
              >
                {DIL_ADI[d]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside>
        <div className="panel">
          <h2>{t('Örnek')}</h2>
          <p className="hint">
            <T k="Aşağıdakiler **kendi öğretmenleriniz**: bir ad sığmıyorsa ölçek fazla büyük demektir." />
          </p>
          {teachers.length === 0 ? (
            <p className="hint">
              <T k="Henüz öğretmen yok. **Okul → Öğretmenler** adımından ekleyin; burası o listeyi gösterir." />
            </p>
          ) : (
            /* IN A SCROLL BOX, because Hareket and Dil moved to the left column on
               2026-08-30 and this is now the rail's ONLY panel — which is the
               shape `.cols > aside > .panel:only-child` is written for: the box
               that gives ground is the list, never the panel around it. The
               heading and the two sentences under it stay put. */
            <div className="stat-scroll">
            <table className="list">
              <thead>
                <tr>
                  <th>{t('Öğretmen')}</th>
                  <th>{t('Branş')}</th>
                  <th className="num">{t('Saat')}</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span
                        className="color-dot"
                        style={{ background: paletteColor(t.color) }}
                        aria-hidden="true"
                      />
                      {t.name}
                    </td>
                    <td>{t.subject}</td>
                    <td className="num">{hoursOf(t.id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          {state.teachers.length > teachers.length && (
            <p className="hint">
              {t('{toplam} öğretmenin ilk {kac} tanesi.', {
                toplam: state.teachers.length,
                kac: teachers.length,
              })}
            </p>
          )}
        </div>

      </aside>
    </div>
  );
}
