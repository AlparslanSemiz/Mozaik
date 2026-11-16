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
  History,
  Info,
  Keyboard,
  Library,
  ListChecks,
  Save,
  Search as SearchIcon,
  Type,
} from 'lucide-react';
import { APP_NAME, tarihYazisi } from '../../leaf/app';
import type { State } from '../../leaf/model';
import { nearestStep, SCALE_STEPS, type Tab } from '../../platform/prefs';
import { downloadBackup } from '../../platform/storage';
import type { health } from '../../pure/feasibility';
import type { PlanControls } from '../common';
import { MoreItem, MoreMenu, MoreRadio, MoreSep, MoreSub, useT } from '../common';
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
  /** The status chip: the problem list. */
  openProblems: () => void;
  /** The open plan's own programs, when an old file holds more than one. */
  switchProgram: (id: string) => void;
  /** Dosya ▾ → Eski hâline dön (K8). */
  openOldCopies: () => void;
  /** The last plan file's day, YYYY-MM-DD; null when this browser never wrote one. */
  lastFileDay: string | null;
  /** "?" → Yazı büyüklüğü: the same four steps as Görünüm. */
  scale: number;
  chooseScale: (next: number) => void;
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
  openProblems,
  switchProgram,
  openOldCopies,
  lastFileDay,
  scale,
  chooseScale,
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
        {/* Two ways back, told apart where they are chosen (walkthrough,
            2026-11-16): this plan's own days, or every plan and its files. */}
        <MoreItem icon={<History size={15} />} hint={t('son 7 gün')} onSelect={openOldCopies}>
          {t('Eski hâline dön')}
        </MoreItem>
        <MoreItem icon={<Library size={15} />} hint={t('bütün planlar')} onSelect={openPlans}>
          {t('Planlar ve yedek')}
        </MoreItem>
        <MoreSep />
        <MoreItem icon={ICON.redo} hint="Ctrl+Y" disabled={!canRedo} onSelect={redo}>
          {t('İleri al')}
        </MoreItem>
      </MoreMenu>

      {/* Zone one: WHERE YOU ARE. Five tasks, one lit, and they come
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
            // Said after the name, not inside it: the name stays what the tab
            // is called, and the dot is no longer silent.
            aria-describedby={dest.id === 'school' && changelogUnseen ? 'tab-news' : undefined}
            title={t(dest.label)}
            onClick={() => goTab(dest.id)}
          >
            {dest.icon}
            <span className="tab-label">{t(dest.label)}</span>
            {/* An unread release note. Presence only, no count — "something
              changed" is the whole message, the panel says what. Clears
              the moment the folded notes in Okul bilgileri → Hakkında are opened
              (`Changelog`'s onToggle), not on a bare tab click. */}
            {dest.id === 'school' && changelogUnseen && (
              <>
                <span className="tab-dot" aria-hidden="true" />
                <span id="tab-news" hidden>
                  {t('Yeni sürüm notu var')}
                </span>
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Zone one and a half: IS IT ALL RIGHT. The sentence NAMES the trouble
        and counts it, because "sorun var" would only send somebody looking
        for which; a click opens the list (ProblemList.tsx). */}
      <button
        className={`health ${status.level}`}
        /* The problem list itself since K3 (2026-11-16): the Kontrol tab
           it used to lead to is gone, and the answer to "what is wrong"
           opens over the screen it was asked from. */
        onClick={openProblems}
        aria-haspopup="dialog"
        /* The label carries the sentence even when the bar is too narrow to
         draw it. */
        aria-label={`${t('Programın durumu')}: ${status.message}`}
        title={`${t('Programın durumu')}: ${status.message}`}
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
        {/* ONE switcher for every arrangement (K2, 2026-11-16): "Bu
            programın kopyası" makes a plan, so a plan is the only thing
            there is to switch between. A file from before K2 may still hold
            several "seçenek" inside one plan; each of them is a row here
            under its plan's name, so none of them became unreachable. */}
        {(plans.library.plans.length > 1 || state.programs.length > 1) && (
          <select
            className="plan-picker"
            aria-label={t('Plan')}
            title={t('Planlar arasında geçiş yapar')}
            value={
              state.programs.length > 1 ? `${plans.planId} ${state.activeProgramId}` : plans.planId
            }
            onChange={(e) => {
              const [plan = '', program] = e.target.value.split(' ');
              if (plan === plans.planId && program !== undefined) switchProgram(program);
              else plans.switchPlan(plan);
            }}
          >
            {plans.library.plans.map((p) =>
              p.id === plans.planId && state.programs.length > 1 ? (
                state.programs.map((program) => (
                  <option key={program.id} value={`${p.id} ${program.id}`}>
                    {p.name} · {program.name}
                  </option>
                ))
              ) : (
                <option key={p.id} value={p.id}>
                  {p.draft ? `${p.name} (taslak)` : p.name}
                </option>
              ),
            )}
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
        title={[
          t('Mozaik kendiliğinden saklıyor; dosya taşımak ve saklamak için.'),
          // When the last one left this browser (fileSaved.ts): the one fact
          // that says how much a cleared browser would take with it.
          lastFileDay === null
            ? ''
            : t('Son plan dosyası: {tarih}.', { tarih: tarihYazisi(lastFileDay) }),
        ]
          .filter((x) => x !== '')
          .join(' ')}
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
      <MoreMenu label="?" ariaLabel="Yardım ?" className="topbar-help" icon={null}>
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
        {/* Where somebody who cannot read the screen looks for help: the
            text size was only in Okul bilgileri → Görünüm (walkthrough, 2026-11-16). */}
        <MoreSub icon={<Type size={15} />} label={t('Yazı büyüklüğü')}>
          <MoreRadio
            value={String(nearestStep(scale))}
            onChange={(id) => chooseScale(Number(id))}
            options={SCALE_STEPS.map(([v, name]) => ({ id: String(v), label: t(name) }))}
          />
        </MoreSub>
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
