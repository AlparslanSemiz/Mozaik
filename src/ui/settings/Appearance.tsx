// Settings section: how the interface is drawn — its size, and how much of the
// week the grid shows at once.
//
// Neither control is in `State`. The size of the type is a property of
// the machine and the eyes in front of it — a backup taken here must not
// resize my father's screen, and a comfort setting must not cost a schema
// migration. It lives in localStorage next to the theme and the rail
// (`platform/prefs/`), which is where every other machine preference already is.
//
// BUTTONS, NOT A SLIDER. The scale has FIFTEEN legal values (0.80 to 1.50 in
// steps of 0.05, `STEPS` below — it said six here while the ceiling was 1.25,
// and eleven while the floor was still 1.00), so a slider
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
  type Density,
  type Motion,
  type Theme,
} from '../../platform/prefs';
import { DILLER, DIL_ADI } from '../../leaf/i18n';
import { HelpHead, T, useLang } from '../common';
import { type State, paletteColor } from '../../leaf/model';

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
  ribbon: boolean;
  toggleRibbon: () => void;
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

const STEPS = Array.from({ length: Math.round((SCALE_MAX - SCALE_MIN) / SCALE_STEP) + 1 }, (_, i) =>
  Number((SCALE_MIN + i * SCALE_STEP).toFixed(2)),
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
  ribbon,
  toggleRibbon,
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

  // Sadeleşme, phase 1 (2026-11-16): the screen said 21 help sentences at
  // once. Each panel is now a heading, its buttons and a "?" that holds what
  // the sentences said; the one sentence left on view is the sample's.
  const segmented = (
    label: string,
    options: Array<{ id: string; label: string; lang?: string }>,
    current: string,
    pick: (id: string) => void,
  ) => (
    <div className="form-row" role="group" aria-label={t(label)}>
      {options.map((o) => (
        <button
          key={o.id}
          className="btn"
          {...(o.lang === undefined ? {} : { lang: o.lang })}
          aria-pressed={o.id === current}
          onClick={() => pick(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
  const densities = (['ferah', 'rahat', 'sigdir'] as const).map((id) => ({
    id,
    label: t(id === 'ferah' ? 'Ferah' : id === 'rahat' ? 'Rahat' : 'Sığdır'),
  }));

  return (
    <div className="cols">
      <div>
        {/* THE THEME, and since 2026-11-16 ONLY here: it stood in four places
            (the top bar, this strip, this panel and Ctrl+K) and is changed
            about once. Ctrl+K's "tema" opens this panel. */}
        <div className="panel">
          <HelpHead topic="Tema">
            <p>
              <T k="Burada ne seçerseniz o kalır; bilgisayarınızın tercihini **izlemez**." />
            </p>
          </HelpHead>
          {segmented(
            'Tema',
            THEMES.map((x) => ({ id: x.id, label: t(x.label) })),
            theme,
            (id) => chooseTheme(id as Theme),
          )}
        </div>

        <div className="panel">
          <HelpHead topic="Yazı büyüklüğü">
            <p>
              {t(
                'Bütün ekranı birlikte büyütür: yazıyı, boşlukları, düğmeleri ve ızgara hücrelerini.',
              )}
            </p>
            <p>
              <T k="Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Yazdır ve gönder** sekmesinde." />
            </p>
          </HelpHead>
          {segmented(
            'Yazı büyüklüğü',
            STEPS.map((value) => ({ id: String(value), label: `%${Math.round(value * 100)}` })),
            String(scale),
            (id) => choose(Number(id)),
          )}
        </div>

        {/* ONE panel, TWO questions — and they really are two: the grid's
            cells and the rest of the screen's spacing. Two `role="group"`s
            with their own names, which is how the test helper finds them.
            Phase 3 of Sadeleşme removes both (K6). */}
        <div className="panel">
          <HelpHead topic="Yoğunluk">
            <p>
              <T k="Yalnız **Program** ızgarasını etkiler: hücrenin büyüklüğü ve ekrana sığan gün sayısı." />
            </p>
            <ul>
              <li>
                <T k="**Ferah.** Hücre en büyük; en kolay okunan, en çok kaydırılan." />
              </li>
              <li>
                <T k="**Rahat.** Hücre geniş ve saatler yazılı; program sığmadığı için sağa kaydırırsınız." />
              </li>
              <li>
                <T k="**Sığdır.** Programın tamamı bir ekranda, ve bunun bedeli **saatlerin gizlenmesi**." />
              </li>
            </ul>
            <p>
              <T k="Basılan sayfada saatler her üç durumda da yazar." />
            </p>
            <p>
              <T k="Ekranın **geri kalanı**: listeler, paneller, kutular. Program ızgarasına dokunmaz." />
            </p>
          </HelpHead>
          <h3>{t('Izgara')}</h3>
          {segmented('Izgara yoğunluğu', densities, density, (id) => chooseDensity(id as Density))}
          <h3>{t('Arayüzün geri kalanı')}</h3>
          {segmented('Arayüz yoğunluğu', densities, uiDensity, (id) =>
            chooseUiDensity(id as Density),
          )}
        </div>

        {/* The strip: whether it is there at all (its button left the top bar
            on 2026-11-16 and lives here and in Ctrl+K), and whether it slips
            away while reading — off unless chosen, since the same day. */}
        <div className="panel">
          <HelpHead topic="Araç şeridi">
            <p>
              <T k="Sekmelerin altındaki araç şeridi, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**." />
            </p>
          </HelpHead>
          {segmented(
            'Araç şeridi',
            [
              { id: 'acik', label: t('Görünsün') },
              { id: 'kapali', label: t('Gizlensin') },
            ],
            ribbon ? 'acik' : 'kapali',
            (id) => {
              if ((id === 'acik') !== ribbon) toggleRibbon();
            },
          )}
          <div className="form-row">
            <button
              className="btn"
              aria-pressed={ribbonAuto}
              onClick={() => {
                applyRibbonAuto(!ribbonAuto);
                setRibbonAuto(!ribbonAuto);
              }}
            >
              {/* One label, and the state is `aria-pressed`: a label that
                  renamed itself read as a double negative when not pressed. */}
              {t('Kaydırınca gizlenir')}
            </button>
          </div>
        </div>

        <div className="panel">
          <HelpHead topic="Hareket">
            <p>
              <T k="Bir şey belirirken görülen kısa hareketler; kapatmak Mozaik'in işini değiştirmez." />
            </p>
            <ul>
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
            <p>
              <T k="Bilgisayarınız “azaltılmış hareket” istiyorsa hareket, ne seçerseniz seçin, **kapalı** kalır." />
            </p>
          </HelpHead>
          {segmented(
            'Hareket',
            MOTIONS.map((m) => ({ id: m.id, label: t(m.label) })),
            motion,
            (id) => chooseMotion(id as Motion),
          )}
        </div>

        <div className="panel">
          <HelpHead topic="Dil">
            <p>{t('Arayüzün dili. Bu bilgisayara aittir, plan dosyasına girmez.')}</p>
          </HelpHead>
          {/* Each language NAMES ITSELF: a language menu is read by somebody
              who does not yet speak the one the app is currently in. */}
          {segmented(
            'Dil',
            DILLER.map((d) => ({ id: d, label: DIL_ADI[d], lang: d })),
            dil,
            (id) => setDil(id as typeof dil),
          )}
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
              <T k="Henüz öğretmen yok. **Öğretmenler** sekmesinden ekleyin; burası o listeyi gösterir." />
            </p>
          ) : (
            /* IN A SCROLL BOX: this is the rail's ONLY panel, the shape
               `.cols > aside > .panel:only-child` is written for. */
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
                  {teachers.map((x) => (
                    <tr key={x.id}>
                      <td>
                        <span
                          className="color-dot"
                          style={{ background: paletteColor(x.color) }}
                          aria-hidden="true"
                        />
                        {x.name}
                      </td>
                      <td>{x.subject}</td>
                      <td className="num">{hoursOf(x.id)}</td>
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
