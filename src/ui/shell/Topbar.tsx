// The top bar: which document, where you are, what you did, and the file.
//
// Since Sadeleşme phase 1 (2026-11-16) only these: Dosya ▾, the tabs, the
// status chip, the document's name, Geri al, Kaydet and "?". The theme lives
// in Ayarlar → Görünüm alone; the strip's fold is in Ayarlar → Görünüm and
// Ctrl+K; shortcuts and search are behind "?".

import type React from 'react';
import {
  CopyPlus,
  FileText,
  FolderOpen,
  Info,
  Keyboard,
  Library,
  ListChecks,
  Save,
  Search as SearchIcon,
} from 'lucide-react';
import { APP_NAME } from '../../leaf/app';
import type { State } from '../../leaf/model';
import type { Tab } from '../../platform/prefs';
import { downloadBackup } from '../../platform/storage';
import type { health } from '../../pure/feasibility';
import type { PlanControls } from '../common';
import { MoreItem, MoreMenu, MoreSep, useT } from '../common';
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
  /** Dosya ▾ → Planlar ve yedek, ? → Hakkında and ? → Başlarken. */
  openPlans: () => void;
  openAbout: () => void;
  openChecklist: () => void;
  /** Dosya ▾ → Yeni dönem için kopyala. */
  copyForNewTerm: () => void;
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
  openPlans,
  openAbout,
  openChecklist,
  copyForNewTerm,
}: Props) {
  const t = useT();
  const save = () => {
    downloadBackup(state);
    notify(t('Plan dosyaya yazıldı. İndirilenler klasörüne bakın.'));
  };
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

      {/* Dosya ▾: everything about the FILE that is not today's save. Kaydet
        is here too, so the menu is the whole list and not "the rest". */}
      <MoreMenu
        label="Dosya"
        className="topbar-file"
        icon={<FileText size={18} aria-hidden="true" />}
        align="start"
      >
        <MoreItem icon={<Save size={15} />} onSelect={save}>
          {t('Kaydet')}
        </MoreItem>
        <MoreItem icon={<FolderOpen size={15} />} onSelect={() => fileInput.current?.click()}>
          {t('Dosyadan aç')}
        </MoreItem>
        <MoreItem icon={<CopyPlus size={15} />} onSelect={copyForNewTerm}>
          {t('Yeni dönem için kopyala')}
        </MoreItem>
        {/* TODO(Sadeleşme aşama 3, K8): "Eski hâline dön", the dated daily
            copies, goes here. */}
        <MoreItem icon={<Library size={15} />} onSelect={openPlans}>
          {t('Planlar ve yedek')}
        </MoreItem>
        <MoreSep />
        <MoreItem icon={ICON.redo} hint="Ctrl+Y" disabled={!canRedo} onSelect={redo}>
          {t('İleri al')}
        </MoreItem>
      </MoreMenu>

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
        {/* The narrow bar's words. Never only the dot: a coloured pill with a
          dot in it read as an on/off switch (usability review, 2026-11-15). */}
        <span className="health-short" aria-hidden="true">
          {status.short}
        </span>
      </button>

      <span className="spacer" />

      {/* Zone two: WHICH DOCUMENT is open. The school's name always; the plan
        picker only once there is a second plan to pick (Sadeleşme, phase 1,
        2026-11-16). With one plan "Plan 1" answered a question nobody was
        asking, and the plans themselves are one click away in Dosya ▾. */}
      <div className="topbar-doc">
        <h1 className="app-title">{state.settings.schoolName.trim() || APP_NAME}</h1>
        {plans.library.plans.length > 1 && (
          <select
            className="plan-picker"
            aria-label={t('Plan')}
            title={t('Planlar arasında geçiş yapar')}
            value={plans.planId}
            onChange={(e) => plans.switchPlan(e.target.value)}
          >
            {plans.library.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.draft ? `${p.name} (taslak)` : p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <span className="topbar-sep" />

      {/* Zone three: undo, with its word. "İleri al" is Ctrl+Y and an item in
        Dosya ▾; on the bar it was a second unlabelled arrow. */}
      <button
        className="btn topbar-text"
        onClick={undo}
        disabled={!canUndo}
        title={t('Geri al (Ctrl+Z)')}
      >
        {ICON.undo}
        {t('Geri al')}
      </button>

      {/* Zone four: the FILE, quiet. It was the one solid button on every
        screen, so each screen's own primary stood in its shadow. */}
      <button
        className="btn topbar-text"
        onClick={save}
        title={t(
          'Açık planı bir .json plan dosyasına yazar. Mozaik bu bilgisayarda kendiliğinden saklıyor; dosya taşımak ve saklamak için.',
        )}
      >
        {t('Kaydet')}
      </button>
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={fileChosen}
      />

      {/* "?": search, shortcuts and the first-run list behind one door. */}
      <MoreMenu label="?" className="topbar-help" icon={null}>
        <MoreItem
          icon={<SearchIcon size={15} />}
          hint="Ctrl+K"
          onSelect={() => setPaletteOpen(true)}
        >
          {t('Ara ve yap')}
        </MoreItem>
        <MoreItem icon={<Keyboard size={15} />} hint="?" onSelect={openShortcuts}>
          {t('Klavye kısayolları')}
        </MoreItem>
        <MoreItem icon={<ListChecks size={15} />} onSelect={openChecklist}>
          {t('Başlarken')}
        </MoreItem>
        <MoreItem icon={<Info size={15} />} onSelect={openAbout}>
          {t('Hakkında')}
        </MoreItem>
      </MoreMenu>
    </header>
  );
}
