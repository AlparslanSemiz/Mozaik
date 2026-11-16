import { Activity, useCallback, useEffect, useRef, useState } from 'react';
import { useDeferredValue, useMemo } from 'react';
import Commands from './Commands';
import { health } from '../../pure/feasibility';
import { Check, InspectorProvider, LessonEditProvider, Program } from '../program';
import {
  GoToProvider,
  UndoIfProvider,
  useAnnounce,
  useDialogs,
  useToast,
  useLang,
  useT,
  type Place,
} from '../common';
import { useStore, storageWorks, useFolder } from '../../platform/storage';
import {
  useToolState,
  readPrintOptions,
  writePrintOptions,
  type PrintOptions,
} from '../../platform/prefs';
import { useSolver } from '../../platform/search';
import { onDesktopClose } from '../../platform/exe';
import { useUpdate } from '../../platform/update';
import Setup from '../setup';
import Lessons from '../lessons';
import { Availability } from '../availability';
import Ribbon from '../ribbon';
import { NOTHING_EXCLUDED, Print, type Excluded } from '../print';
import Settings from '../settings';
import { useShortcutsHelp } from './ShortcutsHelp';
import { hasUnseenChangelog } from '../../platform/changelog';
import { TABS } from './tabs';
import Topbar from './Topbar';
import Notices from './Notices';
import { useMachinePrefs } from './useMachinePrefs';
import { useMainScroll } from './useMainScroll';
import { useProgramMask } from './useProgramMask';
import { useShortcuts } from './useShortcuts';
import { usePaletteActions } from './usePaletteActions';
import { openPlanFile } from './openPlanFile';
import { blankProgram, DEFAULT_PROGRAM_ID } from '../../pure/grid';
import { openChecklist } from '../../platform/prefs';

// The shell: the tabs, the top bar, the long-lived state and the keyboard.
// What each of those is made of lives beside this file (ARCHITECTURE, "React
// köprüleri ve kabuk"); this one decides what is alive for how long, because
// switching tabs unmounts the screens (pitfall 18).

export default function App() {
  const t = useT();
  const announce = useAnnounce();
  const {
    state,
    change,
    manageProgram,
    viewProgram,
    peek,
    undo,
    undoIf,
    redo,
    loadState,
    replaceState,
    canUndo,
    canRedo,
    plans,
    park,
    saveTrouble,
    unreadable,
    setAside,
  } = useStore(announce);

  // Where you are, in every tab at once. Up here because switching tabs
  // unmounts the components that used to own these, and because the tool strip
  // that shows them is drawn above <main>.
  // With no data, start on Setup — an empty Program screen tells him nothing.
  const ui = useToolState(state.lessons.length > 0 ? 'program' : 'setup');
  const { tab, setTab } = ui;
  const fileInput = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  // The shell, because that is what the auto-hiding strip's attribute goes on:
  // the strip is a SIBLING of the scrolled box, and a rule that reaches
  // sideways is a rule nobody finds (see ribbonScroll.ts).
  const appRef = useRef<HTMLDivElement>(null);

  const {
    ribbonAuto,
    setRibbonAuto,
    theme,
    setTheme,
    scale,
    setScale,
    density,
    setDensity,
    programColor,
    setProgramColor,
    uiDensity,
    setUiDensity,
    availClock,
    setAvailClock,
    motion,
    setMotion,
    ribbon,
    toggleRibbon,
    toggleMotion,
  } = useMachinePrefs();

  /**
   * Every navigation goes through here — the seven tab buttons, Alt+1..7, the
   * command palette and the status chip.
   *
   * It used to wrap the change in `document.startViewTransition`, and it was
   * MEASURED and taken back out. A view transition replaces the captured
   * element with a snapshot for the length of the animation, and a snapshot is
   * not hit-testable: for **553 ms** after every tab change,
   * `document.elementFromPoint` over the grid answered `<html>` instead of a
   * cell. Nothing looked wrong — but `drag.ts` finds its drop target with
   * exactly that call, so a card grabbed in that window landed nowhere, with
   * no error and no feedback. The E2E suite is what caught it.
   *
   * Panels still use the CSS entrance treatment; Program itself now stays in a
   * React Activity so tab navigation does not rebuild its large grid. The one
   * thing `startViewTransition` uniquely offers is
   * a shared-element morph, and there was never one here — this is a
   * cross-fade, and the browser will do that without freezing the page. Same
   * reasoning that left `motion` (127 KB) on the shelf: pay for what you use.
   */
  const goTab = setTab;
  // Where an empty screen's button or a Başlarken step sends the reader: the
  // tab, and inside it Okul's list or Ayarlar's section (common/GoTo.tsx).
  const { setStep, setSection } = ui;
  const goTo = useCallback(
    (place: Place) => {
      if (place.step !== undefined) setStep(place.step);
      if (place.section !== undefined) setSection(place.section);
      setTab(place.tab);
    },
    [setStep, setSection, setTab],
  );

  useMainScroll(mainRef, appRef, tab, ribbonAuto);

  // Probed once at startup; the answer does not change afterwards.
  const [canSave] = useState(storageWorks);
  // Which pages the print tab will produce. Not in State: it is a decision
  // about one printout, not something a backup should carry.
  const [printExcluded, setPrintExcluded] = useState<Excluded>(NOTHING_EXCLUDED);
  // What each of those pages carries. Up here for the same reason as the tick
  // lists — Print unmounts on every tab change — but unlike them it is
  // remembered between sessions: it is set once a term, not once a printout.
  const [printOptions, setPrintOptions] = useState<PrintOptions>(readPrintOptions);
  const { programMask, setProgramMask } = useProgramMask(plans.planId, state);

  // The run lives HERE, not in Program: switching tabs unmounts that component
  // and a search that dies because somebody glanced at Kontrol would throw away
  // work with nothing to show for it (pitfall 18).
  const solver = useSolver(change, peek);
  // The folder my father picked, if he picked one (task B4). Here for the
  // same reason as the solver: a pending write must not die because a tab
  // changed. It works on EVERY route in Chromium — file:// included, where
  // showDirectoryPicker is defined and the context is secure (pitfall 65);
  // what file:// lacks is a real origin, so the permission is asked again on
  // each launch. The browsers it is missing in are Firefox and Safari.
  const folder = useFolder(plans.library, plans.planId, state, saveTrouble === 'dolu');
  // How this copy can be updated, if it can. Two routes and two mechanisms:
  // a service worker on the site and the local install, three buttons in the
  // exe. The double-clicked .html has neither and says so; it cannot replace
  // itself, and it is the build the offline principle is checked on (temel.spec.ts).
  //
  // `park` goes in because the exe route ENDS with `app.exit(0)`, which the
  // close hold below never sees: the pending autosave has to be on disk
  // before it (pitfall 28). The folder's pending write is not waited for
  // there; the next launch writes the folder again.
  const update = useUpdate(park);
  // The exe's window waits for this before it closes (TB7): the pending
  // autosave and the folder's two-second write land first. A ref, so the
  // listener is registered once and still calls today's `park` and `flush`.
  const beforeClose = useRef<() => Promise<void>>(() => Promise.resolve());
  beforeClose.current = async () => {
    park();
    await folder.flush();
  };
  useEffect(() => onDesktopClose(() => beforeClose.current()), []);
  // Dismissed for THIS session only, and in sessionStorage rather than
  // localStorage on purpose: a new ders-programi-* key would owe the
  // "Veriler nerede" table a row (planlar.spec.ts checks every one of them),
  // and "do not ask again today" is exactly what a session is.
  const [updateHidden, setUpdateHidden] = useState(false);
  const { confirm, alert } = useDialogs();
  const notify = useToast();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openShortcuts = useShortcutsHelp();
  // Read once at mount (a fresh profile has never seen any version, so this
  // is `true` on first run — that's correct, there IS an unread entry). A
  // plain read rather than a subscription: `Data.tsx`'s `Changelog` panel
  // clears it through `onChangelogSeen` below, which is the only writer.
  const [changelogUnseen, setChangelogUnseen] = useState(hasUnseenChangelog);

  // One line that says whether the timetable is in trouble, on screen in every
  // tab. Kontrol could always answer this and that was the problem: it is a
  // destination, so asking "am I still all right?" meant leaving the grid.
  // `dil` although `health` does not take it: its sentences are translated
  // inside, so after a live language switch the memo would keep the old words
  // until the next edit (e2e/dil.spec.ts).
  //
  // Deferred: the chip (and the Kontrol strip and the palette, which read the
  // same status) is a summary, and on the weak machine its report was the
  // larger half of the freeze after every drop and undo. The grid paints the
  // move first and the status follows in a render React may interrupt.
  const { dil } = useLang();
  const settled = useDeferredValue(state);
  const status = useMemo(() => {
    void dil;
    return health(settled);
  }, [settled, dil]);

  useShortcuts(setPaletteOpen, goTab, openShortcuts);

  // Dosya ▾ → Yeni dönem için kopyala, and Ctrl+K's "kopya". A new plan with
  // everything in it but the laid-out week; the old plan stays as it was, so
  // nothing can be lost by it (it is not a step of the undo history: the old
  // plan is the way back).
  const copyForNewTerm = useCallback(() => {
    const name = plans.library.plans.find((p) => p.id === plans.planId)?.name ?? 'Plan';
    plans.createPlan(`${name} (yeni dönem)`, {
      ...state,
      programs: [blankProgram()],
      activeProgramId: DEFAULT_PROGRAM_ID,
    });
    notify(
      t(
        'Yeni dönem için bir kopya açıldı: dersler duruyor, program boş. Eski plan Dosya → Planlar ve yedek’te.',
      ),
    );
  }, [plans, state, notify, t]);

  const paletteActions = usePaletteActions({
    state,
    ribbon,
    motion,
    solver,
    goTo,
    notify,
    t,
    programMask,
    openShortcuts,
    openFile: () => fileInput.current?.click(),
    copyForNewTerm,
    toggleRibbon,
    toggleMotion,
  });

  const fileChosen = openPlanFile({
    state,
    loadState,
    t,
    confirm,
    alert,
    notify,
    goUpdate: () => goTo({ tab: 'settings', section: 'about' }),
    canUndo,
  });

  return (
    /* `data-section` belongs on the ROOT, not only on the chrome that first
       needed it. The stylesheet resolves --sec from this attribute, and two
       rules outside the top bar read it: the section rule on a panel heading
       (`.panel > h2::before`) and a pressed filter chip. Both lived under
       `.main`, which the header is not an ancestor of, so both had been
       falling through to `--accent` since the day they were written — while
       the comment above the first one said it carried the section's colour.
       A custom property's SCOPE is part of its contract (pitfall 52). */
    <GoToProvider value={goTo}>
      <UndoIfProvider value={undoIf}>
        <div className="app" ref={appRef} data-section={tab}>
          {/* The first Tab stop: from here to the first thing in the content
            was 23 to 28 Tabs through the top bar and the strip (DENETIM
            KS27). Not a hash link: the address is the file's, and the
            content box is what has to take focus, not a scroll position. */}
          <a
            className="skip-link"
            href="#icerik"
            onClick={(event) => {
              event.preventDefault();
              mainRef.current?.focus();
            }}
          >
            {t('İçeriğe geç')}
          </a>
          {/* ONE row: which document, where you are, what you did, and the file.
          They share a row because none of them needs a row of its own, and
          three separate strips would have cost the grid a teacher. */}
          <Topbar
            tab={tab}
            goTab={goTab}
            changelogUnseen={changelogUnseen}
            status={status}
            state={state}
            plans={plans}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            notify={notify}
            fileInput={fileInput}
            fileChosen={fileChosen}
            setPaletteOpen={setPaletteOpen}
            openShortcuts={openShortcuts}
            openPlans={() => goTo({ tab: 'settings', section: 'plans' })}
            openAbout={() => goTo({ tab: 'settings', section: 'about' })}
            openChecklist={() => {
              openChecklist();
              goTo({ tab: 'setup' });
            }}
            copyForNewTerm={copyForNewTerm}
          />

          {/* Row two: the tools of whichever section is open. A named region
            around it, because a toolbar is not a landmark: outside `<header>`
            and `<main>` the strip had no place in a screen reader's list of
            regions (axe `region`, on every screen). `display: contents`, so
            the box changes nothing on screen. */}
          <section className="ribbon-band" aria-label={t('Araç şeridi')}>
            <Ribbon
              ui={ui}
              /* Ayarlar chooses its sections in the strip, and the way to
                 unfold it is in Ayarlar → Görünüm: folded there, the strip
                 would hide its own way back. */
              open={ribbon || tab === 'settings'}
              state={state}
              change={change}
              manageProgram={manageProgram}
              viewProgram={viewProgram}
              solver={solver}
              programMask={programMask}
              setProgramMask={setProgramMask}
              density={density}
              setDensity={setDensity}
              availClock={availClock}
              setAvailClock={setAvailClock}
              theme={theme}
              setTheme={setTheme}
              programColor={programColor}
              setProgramColor={setProgramColor}
              changelogUnseen={changelogUnseen}
              planName={plans.library.plans.find((p) => p.id === plans.planId)?.name ?? ''}
              status={status}
            />
          </section>

          <InspectorProvider state={state} change={change}>
            <LessonEditProvider state={state} change={change}>
              <Commands
                open={paletteOpen}
                setOpen={setPaletteOpen}
                state={state}
                ui={ui}
                go={goTab}
                sections={TABS}
                actions={paletteActions}
              />
              <div className="workspace">
                <Notices
                  canSave={canSave}
                  saveTrouble={saveTrouble}
                  unreadable={unreadable}
                  setAside={setAside}
                  update={update}
                  updateHidden={updateHidden}
                  setUpdateHidden={setUpdateHidden}
                  folder={folder}
                  goTab={goTab}
                  ui={ui}
                />

                {/* The scroll container lives HERE, not in the seven tab components: they
            all used to render their own `.main` and one of them had to opt out
            of scrolling (the grid scrolls inside itself).

            `lessons.length > 0` is not decoration: with no lessons the Program
            tab shows a paragraph of instructions instead of a grid, and
            `no-overflow` (overflow: hidden, padding: 0) would clip it. */}
                {/* Program is the expensive exception to the ordinary conditional
            tabs: Activity hides it, tears down its effects and prepares hidden
            updates at low priority without throwing away the ızgara DOM or
            its scroll position. Keeping `<main>` itself stable is essential;
            a key here would remount the Activity boundary too. */}
                {/* `tabIndex={-1}`: focusable by code, not a Tab stop. The skip
                  link lands here, and so does a closing dialog whose opener
                  is gone (`returnFocus.ts`). */}
                <main
                  ref={mainRef}
                  id="icerik"
                  tabIndex={-1}
                  className={
                    tab === 'program' && state.lessons.length > 0
                      ? 'main no-overflow'
                      : 'main scroll-fade'
                  }
                >
                  {tab === 'setup' && (
                    <Setup state={state} change={change} plans={plans} step={ui.step} />
                  )}
                  {tab === 'availability' && (
                    <Availability
                      state={state}
                      change={change}
                      kind={ui.kind}
                      chosen={ui.chosen}
                      setChosen={ui.setChosen}
                      showHeat={ui.showHeat}
                    />
                  )}
                  {tab === 'lessons' && (
                    <Lessons
                      state={state}
                      change={change}
                      mode={ui.lessonMode}
                      focus={ui.lessonFocus}
                      setFocus={ui.setLessonFocus}
                    />
                  )}
                  <Activity mode={tab === 'program' ? 'visible' : 'hidden'} name="Program grid">
                    <Program
                      active={tab === 'program'}
                      state={state}
                      change={change}
                      solver={solver}
                      view={ui.view}
                      mask={programMask}
                      setMask={setProgramMask}
                      poolSort={ui.poolSort}
                      setPoolSort={ui.setPoolSort}
                      poolFilter={ui.poolFilter}
                      setPoolFilter={ui.setPoolFilter}
                      colorMode={programColor}
                    />
                  </Activity>
                  {tab === 'check' && <Check state={state} view={ui.checkView} ui={ui} />}
                  {tab === 'print' && (
                    <Print
                      state={state}
                      excluded={printExcluded}
                      setExcluded={setPrintExcluded}
                      scope={ui.scope}
                      colored={ui.colored}
                      options={printOptions}
                      setOptions={(next) => {
                        setPrintOptions(next);
                        writePrintOptions(next);
                      }}
                    />
                  )}
                  {tab === 'settings' && (
                    <Settings
                      state={state}
                      change={change}
                      replaceState={replaceState}
                      plans={plans}
                      folder={folder}
                      update={update}
                      scale={scale}
                      setScale={setScale}
                      density={density}
                      setDensity={setDensity}
                      uiDensity={uiDensity}
                      setUiDensity={setUiDensity}
                      ribbonAuto={ribbonAuto}
                      setRibbonAuto={setRibbonAuto}
                      ribbon={ribbon}
                      toggleRibbon={toggleRibbon}
                      theme={theme}
                      setTheme={setTheme}
                      motion={motion}
                      setMotion={setMotion}
                      section={ui.section}
                      onChangelogSeen={() => setChangelogUnseen(false)}
                    />
                  )}
                </main>
              </div>
            </LessonEditProvider>
          </InspectorProvider>
        </div>
      </UndoIfProvider>
    </GoToProvider>
  );
}
