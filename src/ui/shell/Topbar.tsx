// The top bar: which document, where you are, what you did, and the file.

import type React from 'react';
import { Keyboard, Search as SearchIcon } from 'lucide-react';
import { APP_NAME } from '../../leaf/app';
import type { State } from '../../leaf/model';
import type { Tab, Theme } from '../../platform/prefs';
import { downloadBackup } from '../../platform/storage';
import type { health } from '../../pure/feasibility';
import type { PlanControls } from '../common';
import { useT } from '../common';
import { BrandMark, ICON } from './icons';
import { TABS } from './tabs';

interface Props {
  tab: Tab;
  goTab: (tab: Tab) => void;
  changelogUnseen: boolean;
  status: ReturnType<typeof health>;
  state: State;
  plans: PlanControls;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  notify: (text: string) => void;
  fileInput: React.RefObject<HTMLInputElement | null>;
  fileChosen: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPaletteOpen: (open: boolean) => void;
  openShortcuts: () => void;
  ribbon: boolean;
  toggleRibbon: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export default function Topbar({
  tab,
  goTab,
  changelogUnseen,
  status,
  state,
  plans,
  undo,
  redo,
  canUndo,
  canRedo,
  notify,
  fileInput,
  fileChosen,
  setPaletteOpen,
  openShortcuts,
  ribbon,
  toggleRibbon,
  theme,
  toggleTheme,
}: Props) {
  const t = useT();
  return (
    <header className="topbar" data-section={tab}>
      {/* Zone zero: WHAT THIS IS. The simple mark, the same drawing as the
        tab's favicon: at 1.75rem the detailed one's hooks are a blur
        (measured, see BrandMark above).

        Inline rather than <img src>: dist/index.html is ONE file and
        fetches nothing (offline principle, pitfall 32), so an <img> would need
        a second data: URI of the same drawing and a third copy to keep in
        step. It is `aria-hidden` and NOT a button: the program's name is
        already the document title, and a control here would be a seventh
        thing in a row whose sacrifice order is written down (pitfall 48).
        It never shrinks and never goes — it is 1.75rem, and what gives way
        when the bar is tight is named below. */}
      <span className="brand" aria-hidden="true">
        <BrandMark />
      </span>

      {/* Zone one: WHERE YOU ARE. Seven destinations, one lit, and they come
        FIRST: they are the most-clicked thing on the row and the eye starts
        at the left edge. The document identity used to stand here, but the
        name of the school does not change and is not clicked — it was
        holding the corner the destinations wanted. */}
      {/* `dest` and not `t`: `t` is the translator now, and the map variable
        was shadowing it. */}
      <nav className="tabstrip" aria-label={t('Bölümler')}>
        {TABS.map((dest) => (
          <button
            key={dest.id}
            className="tab"
            /* Its OWN section, not the open one. `--sec` is written on the
             root (line above), so `.tab:hover` was painting whatever
             section you were ALREADY in — hovering Yazdır from Kurulum lit
             it blue. `[data-section]` in styles.css sets the variable on
             whatever carries the attribute, so this one line gives every
             tab its own colour to hover in. The lit tab is unaffected: for
             it the root and the button name the same section. */
            data-section={dest.id}
            aria-current={tab === dest.id}
            aria-label={t(dest.label)}
            title={t(dest.label)}
            onClick={() => goTab(dest.id)}
          >
            {dest.icon}
            <span className="tab-label">{t(dest.label)}</span>
            {/* An unread release note. Presence only, no count — "something
              changed" is the whole message, the panel says what. Clears
              the moment Ayarlar → Hakkında is actually opened
              (`Changelog`'s mount effect), not on a bare tab click. */}
            {dest.id === 'settings' && changelogUnseen && (
              <span className="tab-dot" aria-hidden="true" />
            )}
          </button>
        ))}
      </nav>

      {/* Zone one and a half: IS IT ALL RIGHT. Kontrol has always been able
        to answer this, and that was the problem — it is a destination, so
        asking cost two navigations and therefore got asked once, at the
        start. The sentence NAMES the trouble and counts it, because "sorun
        var" would only send somebody to Kontrol to find out which. */}
      <button
        className={`health ${status.level}`}
        onClick={() => goTab('check')}
        /* The label carries the sentence even when the bar is too narrow to
         draw it — and it is an aria-label rather than a title so the
         accessible name is this and not "Kontrol", which is also the name
         of a tab three pixels away. */
        aria-label={t('Programın durumu: {durum}. Ayrıntı için Kontrol.', {
          durum: status.message,
        })}
        title={t('{durum}. Kontrol sekmesini açar', {
          durum: status.message,
        })}
      >
        <span className="health-dot" aria-hidden="true" />
        <span className="health-text">{status.message}</span>
      </button>

      <span className="spacer" />

      {/* Zone two: WHICH DOCUMENT is open. The school and the plan answer
        one question between them, so they are drawn as one object rather
        than as a heading that happens to be followed by a dropdown. It
        sits at the head of the right-hand group — the things you reach for
        about this document rather than about where you are in it. */}
      <div className="topbar-doc">
        <h1 className="app-title">{state.settings.schoolName.trim() || APP_NAME}</h1>

        {/* Which timetable is open. It is shown even when there is only one:
          "hangi planı düzenliyorum" is the question this answers, and a
          picker that appears only after you already have two plans cannot
          be how you find out that plans exist. Everything that CREATES,
          renames or deletes one is in Ayarlar > Veri — the top bar must
          stay a place where no click can lose an afternoon. */}
        <select
          className="plan-picker"
          aria-label={t('Plan')}
          title={t(
            'Planlar arasında geçiş yapar. Yeni plan, ad değiştirme ve silme: Ayarlar → Planlar ve yedek',
          )}
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

      <span className="topbar-sep" />

      {/* Zone three: the HISTORY of this session — two icons, because their
        labels are the longest words on the bar and the shortcut in the
        tooltip is what anyone actually reaches for twice. */}
      <div className="btn-group">
        <button
          className="btn icon"
          onClick={undo}
          disabled={!canUndo}
          aria-label={t('Geri al')}
          title={t('Geri al (Ctrl+Z)')}
        >
          {ICON.undo}
        </button>
        <button
          className="btn icon"
          onClick={redo}
          disabled={!canRedo}
          aria-label={t('İleri al')}
          title={t('İleri al (Ctrl+Y)')}
        >
          {ICON.redo}
        </button>
      </div>

      <span className="topbar-sep" />

      {/* Zone four: the FILE. The one habit, kept the loudest thing here.
        The sentence that used to explain it ("saklanıyor... kaydetmek
        taşımak için") moved to Ayarlar > Veri, next to the report that
        says where the data actually is: it was 400px of teaching on a row
        that now has seven destinations to hold. */}
      <button
        className="btn primary"
        onClick={() => {
          downloadBackup(state);
          notify(t('Yedek dosyaya yazıldı. İndirilenler klasörüne bakın.'));
        }}
        title={t(
          'Programı bir .json dosyasına yazar. Program bu bilgisayarda kendiliğinden saklanıyor; dosya taşımak ve yedeklemek için.',
        )}
      >
        {t('Dosyaya kaydet')}
      </button>
      <button
        className="btn"
        onClick={() => fileInput.current?.click()}
        title={t('Daha önce kaydedilmiş bir .json dosyasını açar')}
      >
        {t('Dosyadan aç')}
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
        aria-label={t('Ara ve git')}
        title={t('Ara ve git (Ctrl+K)')}
        onClick={() => setPaletteOpen(true)}
      >
        <SearchIcon size={18} strokeWidth={2} />
      </button>

      <button
        className="btn icon"
        aria-label={t('Klavye kısayolları')}
        title={t('Klavye kısayolları (?)')}
        onClick={openShortcuts}
      >
        <Keyboard size={18} strokeWidth={2} />
      </button>

      <button
        className="btn icon"
        aria-expanded={ribbon}
        aria-label={t('Araç şeridi')}
        title={
          ribbon
            ? t('Araç şeridini gizle, ızgaraya bir satır daha kalsın')
            : t('Araç şeridini göster')
        }
        onClick={toggleRibbon}
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
        aria-label={t('Koyu tema')}
        title={theme === 'dark' ? t('Açık temaya geç') : t('Koyu temaya geç')}
        onClick={toggleTheme}
      >
        {theme === 'dark' ? ICON.sun : ICON.moon}
      </button>
    </header>
  );
}
