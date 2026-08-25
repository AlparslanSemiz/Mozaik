import { useRef, useState } from 'react';
import type React from 'react';
import { storageWorks, useStore, downloadBackup, readBackupFile } from './store';
import { applyTheme, readSidebar, readTheme, writeSidebar, type Theme } from './theme';
import { useSolver } from './useSolver';
import Setup from './components/setup';
import Availability from './components/Availability';
import Program from './components/Program';
import Check from './components/Check';
import Print, { NOTHING_EXCLUDED } from './components/Print';
import type { Excluded } from './components/Print';
import Settings from './components/settings';

type Tab = 'setup' | 'availability' | 'program' | 'check' | 'print' | 'settings';

/**
 * The six sections, as a LEFT RAIL rather than a row of tabs on top.
 *
 * Why the move: on a 1366x768 screen the horizontal band cost the timetable a
 * whole row, and a row is 25 teachers' worth of information; horizontally the
 * grid already overflows and scrolls, so 92px there costs nothing that was not
 * already scrolled. The rail also gives every other tab back the full width —
 * the reason the right-hand side of every screen used to sit empty.
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

export default function App() {
  const { state, change, undo, redo, loadState, canUndo, canRedo } = useStore();

  // With no data, start on Setup — an empty Program screen tells him nothing.
  const [tab, setTab] = useState<Tab>(state.lessons.length > 0 ? 'program' : 'setup');
  const fileInput = useRef<HTMLInputElement>(null);
  // Probed once at startup; the answer does not change afterwards.
  const [canSave] = useState(storageWorks);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [railNarrow, setRailNarrow] = useState<boolean>(readSidebar);
  // Which pages the print tab will produce. Not in State: it is a decision
  // about one printout, not something a backup should carry.
  const [printExcluded, setPrintExcluded] = useState<Excluded>(NOTHING_EXCLUDED);
  // The run lives HERE, not in Program: switching tabs unmounts that component
  // and a search that dies because somebody glanced at Kontrol would throw away
  // work with nothing to show for it (pitfall 18).
  const solver = useSolver(change);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }

  function toggleRail() {
    const next = !railNarrow;
    writeSidebar(next);
    setRailNarrow(next);
  }

  async function fileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // so the same file can be picked again
    if (file === undefined) return;

    const loaded = await readBackupFile(file);
    if (loaded === null) {
      window.alert(
        'Bu dosya okunamadı. Program tarafından indirilmiş bir .json yedek dosyası seçin.',
      );
      return;
    }
    if (!window.confirm('Yedek yüklenecek ve şu anki program değiştirilecek. Devam edilsin mi?')) {
      return;
    }
    loadState(loaded);
  }

  return (
    <div className={`app${railNarrow ? ' rail-narrow' : ''}`}>
      <nav className="sidebar" aria-label="Bölümler">
        <div className="tabs">
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
        </div>

        <span className="spacer" />

        <button
          className="btn icon rail-toggle"
          aria-pressed={railNarrow}
          aria-label="Kenar çubuğunu daralt"
          title={railNarrow ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
          onClick={toggleRail}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path
              d={railNarrow ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </nav>

      <div className="workspace">
        <header className="topbar">
          <h1 className="app-title">{state.settings.schoolName.trim() || 'Ders Programı'}</h1>

          {/* One line, once: my father has exactly one habit to learn — save to
              a file. It sits INLINE now, so it no longer costs the timetable a
              row and no longer has to be hidden on the Program tab. */}
          <p className="topbar-note">
            Program bu bilgisayarda kendiliğinden saklanıyor. <b>Dosyaya kaydetmek</b>{' '}
            taşımak ve yedeklemek için.
          </p>

          <span className="spacer" />

          <button className="btn" onClick={undo} disabled={!canUndo} title="Ctrl+Z">
            ↶ Geri al
          </button>
          <button className="btn" onClick={redo} disabled={!canRedo} title="Ctrl+Y">
            ↷ İleri al
          </button>
          <button
            className="btn theme-toggle"
            aria-pressed={theme === 'dark'}
            aria-label="Koyu tema"
            title={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <span className="topbar-sep" />
          <button
            className="btn primary"
            onClick={() => downloadBackup(state)}
            title="Programı bir .json dosyasına yazar"
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
        </header>

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
          {tab === 'setup' && <Setup state={state} change={change} />}
          {tab === 'availability' && <Availability state={state} change={change} />}
          {tab === 'program' && <Program state={state} change={change} solver={solver} />}
          {tab === 'check' && <Check state={state} />}
          {tab === 'print' && (
            <Print state={state} excluded={printExcluded} setExcluded={setPrintExcluded} />
          )}
          {tab === 'settings' && (
            <Settings state={state} change={change} loadState={loadState} />
          )}
        </main>
      </div>
    </div>
  );
}
