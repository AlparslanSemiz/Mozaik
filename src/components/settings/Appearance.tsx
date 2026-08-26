// Settings section: how the interface is drawn — its size, and how much of the
// week the grid shows at once.
//
// Neither control is in `State`. The size of the type is a property of
// the machine and the eyes in front of it — a backup taken here must not
// resize my father's screen, and a comfort setting must not cost a schema
// migration. It lives in localStorage next to the theme and the rail
// (`theme.ts`), which is where every other machine preference already is.
//
// SIX BUTTONS, NOT A SLIDER. The scale has six legal values, so a slider would
// invent a continuum that does not exist and then hide which of the six it
// landed on. The buttons reuse the `aria-pressed` state the tool already has
// four of (`.btn[aria-pressed="true"]`), so there is no new control to learn
// and no new CSS.
//
// PRINTING IS NOT AFFECTED, and the panel says so out loud. Paper is a fixed
// physical size: everything on the sheet is sized from `--fs-p-*` in pt and in
// mm, and `@media print` pins `--ui-scale` back to 1. Otherwise a slider on
// this screen would decide whether a timetable still fits on A4 — a thing my
// father would discover at the printer.

import { applyAvailClock, applyDensity, applyScale, SCALE_MAX, SCALE_MIN, SCALE_STEP } from '../../theme';
import type { Density } from '../../theme';
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
}

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
}: Props) {
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

  return (
    <div className="cols">
      <div>
        <div className="panel">
          <h2>Yazı büyüklüğü</h2>
          <p className="hint">
            Bütün ekranı birlikte büyütür: yazıyı, boşlukları, düğmeleri ve program
            ızgarasının hücrelerini. Ayrı ayrı ayar yok — biri büyüyüp öteki yerinde
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
          <h2>Izgara yoğunluğu</h2>
          <p className="hint">
            Üç basamak, ve üçü de aynı şeyi takas ediyor: <b>bir hücrenin
            büyüklüğü</b> ile <b>ekranda görünen gün sayısı</b>.
          </p>
          <ul className="hint choice-list">
            <li>
              <b>Ferah</b> — hücre en büyük, kartın alt satırı tam boyda. En kolay
              okunan, en çok kaydırılan.
            </li>
            <li>
              <b>Rahat</b> — bugüne kadarki ızgara: hücre geniş, her ders
              numarasının altında başlangıç saati yazıyor, hafta ekrana sığmadığı
              için sağa kaydırıyorsunuz.
            </li>
            <li>
              <b>Sığdır</b> — haftanın tamamı bir ekranda: hücre ekranın
              genişliğinden hesaplanır ve <b>saatler gizlenir</b>, çünkü sütunu
              dar olmaya bırakmayan tek şey oydu. Ders numarası, sınıf adı ve
              renkler yerinde kalır.
            </li>
          </ul>

          <div className="form-row" role="group" aria-label="Izgara yoğunluğu">
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
            yazsın mı? Varsayılan <b>kapalı</b>. Yer kazandırdığı için değil —
            ölçüldü, o tablo iki durumda da aynı boyda — sadece o ekranın işi
            açık/kapalı bir ızgara ve on iki saat orada okunmuyor. Saatler
            yukarıdaki <b>zil önizlemesinde</b> ve basılan her sayfada, iki
            durumda da yazıyor.
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
            Seçtiğiniz büyüklük bu sayfada da geçerli — aşağıdaki satırlar{' '}
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
          <h2>Yazdırma bundan etkilenmez</h2>
          <p className="hint">
            Kâğıt sabit boyutta: A4 yatay. Basılan sayfanın yazı boyları ayrı bir
            ölçüde (punto) tutulur, o yüzden bu ayarı büyütmek bir programın sayfaya
            sığıp sığmadığını değiştirmez. Yazdır sekmesindeki önizleme de aynı
            sebeple olduğu gibi kalır — önizleme kâğıda benzemezse hangi sayfanın
            basılacağını seçmek tahmine döner.
          </p>
        </div>
      </div>
    </div>
  );
}
