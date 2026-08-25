import { useRef, useState } from 'react';
import type React from 'react';
import { bundleVersionOf, BUNDLE_VERSION } from './bundle';
import { storageWorks, useStore, downloadBackup, readBackupFile } from './store';
import {
  applyRibbon,
  applyTheme,
  readDensity,
  readRibbon,
  readScale,
  readTheme,
  type Density,
  type Theme,
} from './theme';
import { useSolver } from './useSolver';
import { useToolState } from './toolState';
import type { Tab } from './toolState';
import Setup from './components/setup';
import Availability from './components/Availability';
import Program from './components/Program';
import Check from './components/Check';
import Ribbon from './components/Ribbon';
import Print, { NOTHING_EXCLUDED } from './components/Print';
import type { Excluded } from './components/Print';
import Settings from './components/settings';


/**
 * The six sections, along the TOP — on the same row as the document identity
 * and the file buttons.
 *
 * They spent two versions in a left rail, on the argument that a horizontal
 * band costs the timetable a row. That argument was written against a 768px
 * screen and it was measured wrong for this one: the rail cost 92px of WIDTH on
 * every tab, and the tabs that are not Program have no width to spare — that is
 * why the right-hand side of every screen sat empty.
 *
 * The band costs a row only if it is a band of its own. It is not: identity,
 * sections, history and file share one 44px row, and the tab's own tools get a
 * second one. Measured, the whole head is SHORTER than the rail layout's was
 * (139px -> 114px), because the rail's top bar was 59px of mostly air.
 *
 * Icons are inline SVG (no library, works offline) and drawn on currentColor so
 * they are right in both themes. They differ in SILHOUETTE, not in detail: at
 * 22px a difference of details is invisible (learned in v0.8).
 */
const TABS: Array<{ id: Tab; label: string; icon: React.ReactElement }> = [
  {
    id: 'setup',
    label: 'Kurulum',
    // A clipboard: the four lists you fill in at the start of a term.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path
          d="M8 4H6.5A1.5 1.5 0 0 0 5 5.5v14A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-14A1.5 1.5 0 0 0 17.5 4H16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect x="8.5" y="2.5" width="7" height="3.4" rx="1" fill="currentColor" />
        <path d="M8 10h8M8 13.5h8M8 17h5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'availability',
    label: 'Müsaitlik',
    // A calendar with a cross in it: the hours somebody cannot come.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 3v3.5M17 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M9.5 13l5 5M14.5 13l-5 5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'program',
    label: 'Program',
    // The grid itself, with one cell filled: a lesson sitting in its slot.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 9.5h18M3 15h18M9 4v16M15 4v16" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9.5" width="6" height="5.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'check',
    label: 'Kontrol',
    // A magnifier over a tick: the tab that says WHY it cannot be built.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <circle cx="10.5" cy="10.5" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M7.4 10.6l2.4 2.6 4.3-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.6 15.6L21 21"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'print',
    label: 'Yazdır',
    // A printer with paper coming out.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path d="M7 3.5h10v4H7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M4 8.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1h-2M6 16H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="6.5"
          y="13"
          width="11"
          height="7.5"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="17.6" cy="11" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  // Last, the way a settings menu sits at the end of a toolbar: it is opened
  // when the school changes, not while a timetable is being laid out.
  {
    id: 'settings',
    label: 'Ayarlar',
    // Three sliders. A cog reads as a blob at 22px; sliders keep a silhouette.
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path
          d="M3 7h18M3 12h18M3 17h18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="8" cy="7" r="2.6" fill="var(--paper)" stroke="currentColor" strokeWidth="1.8" />
        <circle
          cx="16"
          cy="12"
          r="2.6"
          fill="var(--paper)"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle
          cx="10.5"
          cy="17"
          r="2.6"
          fill="var(--paper)"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
];

/**
 * The four glyphs that used to sit in top-bar buttons as TEXT.
 *
 * They had to go for two reasons and either one alone would have been enough.
 * A subset embedded face carries the 225 glyphs this tool draws and no more, so
 * every one of these fell back to a different family — four buttons in four
 * typefaces, at four optical sizes, on one bar. And "Geri al" spelled out cost
 * the row about 120px, which is exactly why the bar wrapped its buttons onto a
 * second line on a 1920px screen.
 *
 * Drawn on currentColor, like the rail's, so both themes are right for free.
 */
const ICON = {
  undo: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M4 9h9.5a5 5 0 0 1 0 10H8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7.5 5 4 9l3.5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M20 9h-9.5a5 5 0 0 0 0 10H16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 5 20 9l-3.5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default function App() {
  const { state, change, undo, redo, loadState, canUndo, canRedo, plans } = useStore();

  // Where you are, in every tab at once. Up here because switching tabs
  // unmounts the components that used to own these, and because the tool strip
  // that shows them is drawn above <main>.
  // With no data, start on Setup — an empty Program screen tells him nothing.
  const ui = useToolState(state.lessons.length > 0 ? 'program' : 'setup');
  const { tab, setTab } = ui;
  const fileInput = useRef<HTMLInputElement>(null);
  // Probed once at startup; the answer does not change afterwards.
  const [canSave] = useState(storageWorks);
  const [theme, setTheme] = useState<Theme>(readTheme);
  // Already applied to the document by main.tsx before the first paint; this
  // copy exists only so Ayarlar → Görünüm can show which step is pressed.
  const [scale, setScale] = useState<number>(readScale);
  const [density, setDensity] = useState<Density>(readDensity);
  // Whether the tool strip is drawn. It lives here and not in Ribbon because
  // the button that folds it is in the top bar — a folded strip has no row to
  // put its own chevron on, which is the whole point of folding it.
  const [ribbon, setRibbon] = useState<boolean>(readRibbon);
  // Which pages the print tab will produce. Not in State: it is a decision
  // about one printout, not something a backup should carry.
  const [printExcluded, setPrintExcluded] = useState<Excluded>(NOTHING_EXCLUDED);
  // The run lives HERE, not in Program: switching tabs unmounts that component
  // and a search that dies because somebody glanced at Kontrol would throw away
  // work with nothing to show for it (pitfall 18).
  const solver = useSolver(change);

  function toggleRibbon() {
    const next = !ribbon;
    applyRibbon(next);
    setRibbon(next);
  }

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }


  async function fileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // so the same file can be picked again
    if (file === undefined) return;

    const loaded = await readBackupFile(file);
    if (loaded === null) {
      // Three different files can land here and each deserves its own sentence.
      // A BUNDLE is refused rather than opened: it holds every plan, so opening
      // one means replacing the whole library — and the top bar stays the place
      // where no click can lose an afternoon.
      const version = bundleVersionOf(await file.text());
      window.alert(
        version === BUNDLE_VERSION
          ? 'Bu dosya bütün planları içeriyor. Ayarlar → Veri bölümündeki ' +
              '"Tümünü dosyadan aç" düğmesini kullanın.'
          : version !== null
            ? 'Bu dosya programın daha yeni bir sürümüyle yazılmış. Programı güncelleyin.'
            : 'Bu dosya okunamadı. Program tarafından indirilmiş bir .json yedek dosyası seçin.',
      );
      return;
    }
    if (!window.confirm('Yedek yüklenecek ve şu anki program değiştirilecek. Devam edilsin mi?')) {
      return;
    }
    loadState(loaded);
  }

  return (
    <div className="app">
      {/* ONE row: which document, where you are, what you did, and the file.
          They share a row because none of them needs a row of its own, and
          three separate strips would have cost the grid a teacher. */}
      <header className="topbar">
        {/* Zone one: WHICH DOCUMENT is open. The school and the plan answer
            one question between them, so they are drawn as one object rather
            than as a heading that happens to be followed by a dropdown. */}
        <div className="topbar-doc">
          <h1 className="app-title">{state.settings.schoolName.trim() || 'Ders Programı'}</h1>

          {/* Which timetable is open. It is shown even when there is only one:
              "hangi planı düzenliyorum" is the question this answers, and a
              picker that appears only after you already have two plans cannot
              be how you find out that plans exist. Everything that CREATES,
              renames or deletes one is in Ayarlar > Veri — the top bar must
              stay a place where no click can lose an afternoon. */}
          <select
            className="plan-picker"
            aria-label="Plan"
            title="Planlar arasında geçiş yapar. Yeni plan, ad değiştirme ve silme: Ayarlar → Veri"
            value={plans.planId}
            onChange={(e) => plans.switchPlan(e.target.value)}
          >
            {plans.library.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.draft ? `${p.name} (taslak)` : p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Zone two: WHERE YOU ARE. Six destinations, one lit. */}
        <nav className="tabstrip" aria-label="Bölümler">
          {TABS.map((t) => (
            <button
              key={t.id}
              className="tab"
              aria-current={tab === t.id}
              aria-label={t.label}
              title={t.label}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </nav>

        <span className="spacer" />

        {/* Zone three: the HISTORY of this session — two icons, because their
            labels are the longest words on the bar and the shortcut in the
            tooltip is what anyone actually reaches for twice. */}
        <div className="btn-group">
          <button
            className="btn icon"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Geri al"
            title="Geri al (Ctrl+Z)"
          >
            {ICON.undo}
          </button>
          <button
            className="btn icon"
            onClick={redo}
            disabled={!canRedo}
            aria-label="İleri al"
            title="İleri al (Ctrl+Y)"
          >
            {ICON.redo}
          </button>
        </div>

        <span className="topbar-sep" />

        {/* Zone four: the FILE. The one habit, kept the loudest thing here.
            The sentence that used to explain it ("saklanıyor... kaydetmek
            taşımak için") moved to Ayarlar > Veri, next to the report that
            says where the data actually is: it was 400px of teaching on a row
            that now has six destinations to hold. */}
        <button
          className="btn primary"
          onClick={() => downloadBackup(state)}
          title="Programı bir .json dosyasına yazar. Program bu bilgisayarda kendiliğinden saklanıyor; dosya taşımak ve yedeklemek için."
        >
          Dosyaya kaydet
        </button>
        <button
          className="btn"
          onClick={() => fileInput.current?.click()}
          title="Daha önce kaydedilmiş bir .json dosyasını açar"
        >
          Dosyadan aç
        </button>
        {/* "Sıfırla" used to stand here, one careless click from "Dosyadan
            aç". It is now in Ayarlar > Veri: the rarest button in the app,
            and the only one that cannot be undone. */}
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={fileChosen}
        />

        <span className="topbar-sep" />

        {/* The theme is a MACHINE setting, not timetable data, and it is the
            only one that has to be reachable from anywhere: the room gets
            dark while you work. Scale and density live in Ayarlar. */}
        {/* Folds the tool strip away. Beside the theme because both are
            settings of the SCREEN, not of the timetable — and it has to be up
            here: once folded, the strip has no row to hold its own button. */}
        <button
          className="btn icon"
          aria-expanded={ribbon}
          aria-label="Araç şeridi"
          title={ribbon ? 'Araç şeridini gizle — ızgaraya bir satır daha' : 'Araç şeridini göster'}
          onClick={toggleRibbon}
          disabled={tab === 'check'}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path
              d={ribbon ? 'M5 15l7-7 7 7' : 'M5 9l7 7 7-7'}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="btn icon"
          aria-pressed={theme === 'dark'}
          aria-label="Koyu tema"
          title={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? ICON.sun : ICON.moon}
        </button>
      </header>

      {/* Row two: the tools of whichever section is open. */}
      <Ribbon
        ui={ui}
        open={ribbon}
        state={state}
        solver={solver}
        density={density}
        setDensity={setDensity}
      />

      <div className="workspace">
        {!canSave && (
          <div className="save-warning">
            ⚠ <b>Bu bilgisayarda otomatik kayıt çalışmıyor.</b> Program kapanınca yaptığınız
            her şey kaybolur. Çalışırken sık sık <b>Dosyaya kaydet</b> düğmesine basın ve
            bilgisayarı kapatmadan önce mutlaka bir yedek alın.
          </div>
        )}

        {/* The scroll container lives HERE, not in the six tab components: they
            all used to render their own `.main` and one of them had to opt out
            of scrolling (the grid scrolls inside itself).

            `lessons.length > 0` is not decoration: with no lessons the Program
            tab shows a paragraph of instructions instead of a grid, and
            `no-overflow` (overflow: hidden, padding: 0) would clip it. */}
        <main
          className={
            tab === 'program' && state.lessons.length > 0 ? 'main no-overflow' : 'main'
          }
        >
          {tab === 'setup' && (
            <Setup
              state={state}
              change={change}
              plans={plans}
              step={ui.step}
              setStep={ui.setStep}
            />
          )}
          {tab === 'availability' && (
            <Availability
              state={state}
              change={change}
              kind={ui.kind}
              chosen={ui.chosen}
              setChosen={ui.setChosen}
            />
          )}
          {tab === 'program' && (
            <Program
              state={state}
              change={change}
              solver={solver}
              view={ui.view}
            />
          )}
          {tab === 'check' && <Check state={state} />}
          {tab === 'print' && (
            <Print
              state={state}
              excluded={printExcluded}
              setExcluded={setPrintExcluded}
              scope={ui.scope}
              colored={ui.colored}
            />
          )}
          {tab === 'settings' && (
            <Settings
              state={state}
              change={change}
              loadState={loadState}
              plans={plans}
              scale={scale}
              setScale={setScale}
              density={density}
              setDensity={setDensity}
              section={ui.section}
            />
          )}
        </main>
      </div>
    </div>
  );
}
