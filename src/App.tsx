import { useRef, useState } from 'react';
import { storageWorks, useStore, downloadBackup, readBackupFile } from './store';
import { emptyState } from './entities';
import Setup from './components/Setup';
import Availability from './components/Availability';
import Program from './components/Program';
import Check from './components/Check';
import Print from './components/Print';

type Tab = 'setup' | 'availability' | 'program' | 'check' | 'print';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'setup', label: 'Kurulum' },
  { id: 'availability', label: 'Müsaitlik' },
  { id: 'program', label: 'Program' },
  { id: 'check', label: 'Kontrol' },
  { id: 'print', label: 'Yazdır' },
];

export default function App() {
  const { state, change, undo, redo, loadState, canUndo, canRedo } = useStore();

  // With no data, start on Setup — an empty Program screen tells him nothing.
  const [tab, setTab] = useState<Tab>(state.lessons.length > 0 ? 'program' : 'setup');
  const fileInput = useRef<HTMLInputElement>(null);
  // Probed once at startup; the answer does not change afterwards.
  const [canSave] = useState(storageWorks);

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

  function reset() {
    if (
      !window.confirm(
        'Her şey silinecek: öğretmenler, sınıflar, dersler ve program. Emin misiniz?',
      )
    ) {
      return;
    }
    if (!window.confirm('Son kez soruyorum — bu işlem geri alınamaz. Silinsin mi?')) return;
    loadState(emptyState());
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
        <button className="btn primary" onClick={() => downloadBackup(state)}>
          Yedek indir
        </button>
        <button className="btn" onClick={() => fileInput.current?.click()}>
          Yedek yükle
        </button>
        <button className="btn danger" onClick={reset} title="Her şeyi siler">
          Sıfırla
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={fileChosen}
        />
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
      {tab === 'print' && <Print state={state} />}
    </div>
  );
}
