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
  applyAvailClock,
  applyDensity,
  applyMotion,
  applyScale,
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
} from '../../theme';
import type { Density, Motion } from '../../theme';
import { DILLER, DIL_ADI } from '../../i18n';
import { useLang } from '../T';
import type { State } from '../../types';
import { paletteColor } from '../../palette';

interface Props {
  /** The real school, so the preview shows the reader's own names. */
  state: State;
  scale: number;
  setScale: (next: number) => void;
  density: Density;
  setDensity: (next: Density) => void;
  availClock: boolean;
  setAvailClock: (next: boolean) => void;
  motion: Motion;
  setMotion: (next: Motion) => void;
}

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
  availClock,
  setAvailClock,
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

  function chooseMotion(next: Motion) {
    applyMotion(next);
    setMotion(next);
  }

  return (
    <div className="cols">
      <div>
        <div className="panel">
          <h2>Yazı büyüklüğü</h2>
          <p className="hint">
            Bütün ekranı birlikte büyütür: yazıyı, boşlukları, düğmeleri ve program
            ızgarasının hücrelerini. Ayrı ayrı ayar yok, çünkü biri büyüyüp öteki yerinde
            kalırsa ekran ferahlamaz, sıkışır.
          </p>

          <div className="form-row" role="group" aria-label="Yazı büyüklüğü">
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
            Bu ayar bu bilgisayara aittir; yedek dosyasına girmez ve başka bir
            bilgisayarda açılan programı etkilemez.
          </p>
        </div>

        <div className="panel">
          <h2>Arayüz yoğunluğu</h2>
          <p className="hint">
            Üç basamak, ve üçü de aynı şeyi takas ediyor: <b>bir satırın
            büyüklüğü</b> ile <b>ekranda aynı anda görünen satır sayısı</b>.
            Program ızgarasını da, Kurulum ve Ayarlar’daki listeleri de birlikte
            etkiler.
          </p>
          <ul className="hint choice-list">
            <li>
              <b>Ferah.</b> Hücre en büyük, kartın alt satırı tam boyda, liste
              satırları en açık. En kolay okunan, en çok kaydırılan.
            </li>
            <li>
              <b>Rahat.</b> Bugüne kadarki ızgara: hücre geniş, her ders
              numarasının altında başlangıç saati yazıyor, hafta ekrana sığmadığı
              için sağa kaydırıyorsunuz.
            </li>
            <li>
              <b>Sığdır.</b> Haftanın tamamı bir ekranda: hücre ekranın
              genişliğinden hesaplanır ve <b>saatler gizlenir</b>, çünkü sütunu
              dar olmaya bırakmayan tek şey oydu. Ders numarası, sınıf adı ve
              renkler yerinde kalır. Listelerde satır aralığı daralır;{' '}
              <b>yazı boyutu küçülmez</b>, kısılan şey yalnızca boşluk.
            </li>
          </ul>

          <div className="form-row" role="group" aria-label="Arayüz yoğunluğu">
            <button
              className="btn"
              aria-pressed={density === 'ferah'}
              onClick={() => chooseDensity('ferah')}
            >
              Ferah
            </button>
            <button
              className="btn"
              aria-pressed={density === 'rahat'}
              onClick={() => chooseDensity('rahat')}
            >
              Rahat
            </button>
            <button
              className="btn"
              aria-pressed={density === 'sigdir'}
              onClick={() => chooseDensity('sigdir')}
            >
              Sığdır
            </button>
          </div>

          <p className="hint">
            Saatleri görmek için <b>Ayarlar → Okul ve zil</b>'deki zil önizlemesine
            bakabilirsiniz; basılan sayfada saatler her üç durumda da yazar.
          </p>
        </div>

        <div className="panel">
          <h2>Müsaitlik çizelgesi</h2>
          <p className="hint">
            Müsaitlik ekranındaki ders numaralarının altında <b>başlangıç saati</b>
            yazsın mı? Varsayılan <b>kapalı</b>. Sebebi yer kazanmak değil: o tablo
            iki durumda da aynı boyda, ölçüldü. Sebep o ekranın işi. Orada
            yapılan tek şey saatleri açıp kapatmak, ve on iki saat orada
            okunmuyor. Saatler yukarıdaki <b>zil önizlemesinde</b> ve basılan her
            sayfada iki durumda da yazıyor.
          </p>
          <div className="form-row">
            <button
              className="btn"
              aria-pressed={availClock}
              onClick={() => {
                applyAvailClock(!availClock);
                setAvailClock(!availClock);
              }}
            >
              {availClock ? 'Saatler görünüyor' : 'Saatler gizli'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="panel">
          <h2>Örnek</h2>
          <p className="hint">
            Seçtiğiniz büyüklük bu sayfada da geçerli. Aşağıdaki satırlar{' '}
            <b>kendi öğretmenleriniz</b>, uydurma bir örnek değil. Bir ad
            kutusuna sığmıyorsa ölçek o makine için fazla büyük demektir.
          </p>
          {teachers.length === 0 ? (
            <p className="hint">
              Henüz öğretmen yok. <b>Kurulum → Öğretmenler</b> adımından ekleyin;
              burası o listeyi gösterir.
            </p>
          ) : (
            <table className="list">
              <thead>
                <tr>
                  <th>Öğretmen</th>
                  <th>Branş</th>
                  <th className="num">Saat</th>
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
          )}
          {state.teachers.length > teachers.length && (
            <p className="hint">
              {state.teachers.length} öğretmenin ilk {teachers.length} tanesi.
            </p>
          )}
        </div>

        <div className="panel">
          <h2>Hareket</h2>
          <p className="hint">
            Ekranda bir şey belirirken, bir kutu açılırken ya da bir düğmeye
            basarken görülen kısa hareketler. Rahatsız ediyorsa <b>azaltın</b>{' '}
            ya da <b>tamamen kapatın</b>; programın çalışmasında hiçbir şey
            değişmez.
          </p>
          <ul className="hint choice-list">
            <li>
              <b>Tam.</b> Tasarlandığı gibi.
            </li>
            <li>
              <b>Az.</b> Süreler yarıya iner ve <b>yer değiştiren</b> hareketler
              kapanır: paneller kayarak değil, duracakları yerde belirir. Renk
              geçişleri kalır, yani düğme imlece hâlâ cevap verir.
            </li>
            <li>
              <b>Kapalı.</b> Hiçbir şey kaymaz, hiçbir şey solmaz.
            </li>
          </ul>

          <div className="form-row" role="group" aria-label="Hareket">
            {MOTIONS.map((m) => (
              <button
                key={m.id}
                className="btn"
                aria-pressed={m.id === motion}
                onClick={() => chooseMotion(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <p className="hint">
            Bilgisayarınız <i>“azaltılmış hareket”</i> istiyorsa (Windows’ta{' '}
            <b>Ayarlar → Erişilebilirlik → Görsel efektler</b>), burada ne
            seçerseniz seçin hareket <b>kapalı</b> kalır. Bu ayar makinenin
            isteğinin <b>ötesine</b> geçebilir, gerisine değil.
          </p>
        </div>

        <div className="panel">
          <h2>{t('Dil')}</h2>
          <p className="hint">
            {t(
              'Arayüzün dili. Bu ayar bu bilgisayara aittir; yedek dosyasına girmez ve programın kendisini değiştirmez.',
            )}
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

        <div className="panel">
          <h2>Yazdırma bundan etkilenmez</h2>
          <p className="hint">
            Kâğıt sabit boyutta: A4 yatay. Basılan sayfanın yazı boyları ayrı bir
            ölçüde (punto) tutulur, o yüzden bu ayarı büyütmek bir programın sayfaya
            sığıp sığmadığını değiştirmez. Yazdır sekmesindeki önizleme de aynı
            sebeple olduğu gibi kalır. Önizleme kâğıda benzemezse hangi sayfanın
            basılacağını seçmek tahmine döner.
          </p>
        </div>
      </div>
    </div>
  );
}
