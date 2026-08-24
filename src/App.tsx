import { useRef, useState } from 'react';
import { storageWorks, useStore, downloadBackup, readBackupFile } from './store';
import { applyTheme, readTheme, type Theme } from './theme';
import Setup from './components/setup';
import Availability from './components/Availability';
import Program from './components/Program';
import Check from './components/Check';
import Print, { NOTHING_EXCLUDED } from './components/Print';
import type { Excluded } from './components/Print';
import Settings from './components/settings';

type Tab = 'setup' | 'availability' | 'program' | 'check' | 'print' | 'settings';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'setup', label: 'Kurulum' },
  { id: 'availability', label: 'Müsaitlik' },
  { id: 'program', label: 'Program' },
  { id: 'check', label: 'Kontrol' },
  { id: 'print', label: 'Yazdır' },
  // Last, the way a settings menu sits at the end of a toolbar: it is opened
  // when the school changes, not while a timetable is being laid out.
  { id: 'settings', label: 'Ayarlar' },
];

export default function App() {
  const { state, change, undo, redo, loadState, canUndo, canRedo } = useStore();

  // With no data, start on Setup — an empty Program screen tells him nothing.
  const [tab, setTab] = useState<Tab>(state.lessons.length > 0 ? 'program' : 'setup');
  const fileInput = useRef<HTMLInputElement>(null);
  // Probed once at startup; the answer does not change afterwards.
  const [canSave] = useState(storageWorks);
  const [theme, setTheme] = useState<Theme>(readTheme);
  // Which pages the print tab will produce. Not in State: it is a decision
  // about one printout, not something a backup should carry.
  const [printExcluded, setPrintExcluded] = useState<Excluded>(NOTHING_EXCLUDED);

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
    <div className="app">
      <div className="topbar">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className="tab"
              aria-current={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

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
        {/* "Sıfırla" used to stand here, one careless click from "Dosyadan aç".
            It is now in Ayarlar > Veri: the rarest button in the app, and the
            only one that cannot be undone. */}
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={fileChosen}
        />

        {/* Everywhere but the grid: on a 1366x768 screen this line costs the
            timetable a whole row, and there it is the row that matters. */}
        {tab !== 'program' && (
          <p className="topbar-note">
            Program bu bilgisayarda kendiliğinden saklanıyor. <b>Dosyaya kaydetmek</b>{' '}
            taşımak ve yedeklemek için.
          </p>
        )}
      </div>

      {!canSave && (
        <div className="save-warning">
          ⚠ <b>Bu bilgisayarda otomatik kayıt çalışmıyor.</b> Program kapanınca yaptığınız
          her şey kaybolur. Çalışırken sık sık <b>Yedek indir</b> düğmesine basın ve
          bilgisayarı kapatmadan önce mutlaka bir yedek alın.
        </div>
      )}

      {tab === 'setup' && <Setup state={state} change={change} />}
      {tab === 'availability' && <Availability state={state} change={change} />}
      {tab === 'program' && <Program state={state} change={change} />}
      {tab === 'check' && <Check state={state} />}
      {tab === 'print' && (
        <Print state={state} excluded={printExcluded} setExcluded={setPrintExcluded} />
      )}
      {tab === 'settings' && (
        <Settings state={state} change={change} loadState={loadState} />
      )}
    </div>
  );
}
