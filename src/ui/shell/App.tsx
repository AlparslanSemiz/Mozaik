import { Activity, useCallback, useEffect, useRef, useState } from 'react';
import { useDeferredValue, useMemo } from 'react';
import Commands from './Commands';
import { health } from '../../pure/feasibility';
import { InspectorProvider, LessonEditProvider, Program, ProblemList } from '../program';
import {
  GoToProvider,
  KeepBeforeProvider,
  UndoIfProvider,
  useToastFollow,
  useAnnounce,
  useDialogs,
  useToast,
  useLang,
  useT,
  type Place,
} from '../common';
import {
  askToKeep,
  downloadBackup,
  isoDay,
  keepToday,
  markChanged,
  reminderDue,
  storageKind,
  loadPlan,
  storageWorks,
  useFileRecord,
  useFolder,
  useStore,
} from '../../platform/storage';
import {
  lessonModeOf,
  tabOf,
  type Tab,
  useToolState,
  readPrintOptions,
  writePrintOptions,
  type PrintOptions,
} from '../../platform/prefs';
import { useSolver } from '../../platform/search';
import { onDesktopClose } from '../../platform/exe';
import { useUpdate } from '../../platform/update';
import Setup, { Start } from '../setup';
import Lessons from '../lessons';
import Ribbon from '../ribbon';
import { NOTHING_EXCLUDED, Print, type Excluded } from '../print';
import Settings from '../settings';
import { useShortcutsHelp } from './ShortcutsHelp';
import { hasUnseenChangelog } from '../../platform/changelog';
import { TABS } from './tabs';
import Topbar from './Topbar';
import OldCopies from './OldCopies';
import Notices from './Notices';
import { useMachinePrefs } from './useMachinePrefs';
import { useMainScroll, useProgramScrollKeep } from './useMainScroll';
import { useShortcuts } from './useShortcuts';
import { usePaletteActions } from './usePaletteActions';
import { openPlanFile } from './openPlanFile';
import { emptyState } from '../../pure/entities';
import { activeProgram, blankProgram, DEFAULT_PROGRAM_ID, switchProgram } from '../../pure/grid';
import { openChecklist } from '../../platform/prefs';
import { useMoveIn, useMoveOut } from './useMove';
import { parseBundle } from '../../pure/io';
import type { Id, State } from '../../leaf/model';

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
    lastDelete,
    keepBefore: keepInStore,
    openFolderCopy,
  } = useStore(announce);
  // A notice's "Geri al" goes when another state than its own is open.
  useToastFollow(state);

  // Where you are, in every tab at once. Up here because switching tabs
  // unmounts the components that used to own these, and because the tool strip
  // that shows them is drawn above <main>.
  // With no data, start on Okul bilgileri, where Başlarken is — an empty
  // Program screen tells him nothing.
  const ui = useToolState(state.lessons.length > 0 ? 'program' : 'school');
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
    chooseScale,
    programColor,
    setProgramColor,
    motion,
    setMotion,
    ribbon,
    toggleRibbon,
    toggleMotion,
  } = useMachinePrefs();

  /**
   * Every navigation goes through here — the five tab buttons, Alt+1..5 and
   * the command palette.
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
  // The status chip's problem list (K3): open, and on which lesson's row.
  const [problems, setProblems] = useState<{ lesson: Id | null } | null>(null);
  // A tab button or Alt+1..5: going to a tab closes the list over it.
  const goTab = useCallback(
    (next: Tab) => {
      setProblems(null);
      setTab(next);
    },
    [setTab],
  );
  // Where an empty screen's button or a Başlarken step sends the reader: the
  // tab, and inside it the view, the section or the problem list
  // (common/GoTo.tsx).
  const { setSection, setPeople, setLessonFocus } = ui;
  const goTo = useCallback(
    (place: Place) => {
      // An old tab id still lands somewhere (`OLD_TAB`).
      const tab = tabOf(place.tab);
      if (place.section !== undefined) setSection(place.section);
      if (place.people !== undefined && (tab === 'teachers' || tab === 'classes'))
        setPeople(tab, place.people);
      if (place.focus !== undefined) setLessonFocus(place.focus);
      setTab(tab);
      // Going anywhere else closes the list: its own buttons (an empty plan's
      // "Öğretmen ekle") lead out of it.
      setProblems(
        place.problems === undefined
          ? null
          : { lesson: place.problems === true ? null : place.problems },
      );
    },
    [setSection, setPeople, setLessonFocus, setTab],
  );

  useMainScroll(mainRef, appRef, tab, ribbonAuto);
  useProgramScrollKeep(mainRef, tab);

  // Probed once at startup; the answer does not change afterwards.
  const [canSave] = useState(storageWorks);
  // Which pages the print tab will produce. Not in State: it is a decision
  // about one printout, not something a backup should carry.
  const [printExcluded, setPrintExcluded] = useState<Excluded>(NOTHING_EXCLUDED);
  // What each of those pages carries. Up here for the same reason as the tick
  // lists — Print unmounts on every tab change — but unlike them it is
  // remembered between sessions: it is set once a term, not once a printout.
  const [printOptions, setPrintOptions] = useState<PrintOptions>(readPrintOptions);

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

  // WHAT NO PLAN FILE HOLDS (web audit, 2026-11-16). The first change after
  // a plan file is remembered (fileSaved.ts), and the first change that holds
  // work asks the browser to keep this site's storage (persist.ts). A plan
  // switch is not a change, and neither is the first render.
  const seen = useRef({ planId: plans.planId, state });
  useEffect(() => {
    const was = seen.current;
    seen.current = { planId: plans.planId, state };
    if (was.planId !== plans.planId || was.state === state) return;
    markChanged();
    if (state.teachers.length + state.classes.length + state.lessons.length > 0) askToKeep();
  }, [plans.planId, state]);
  const fileRecord = useFileRecord();
  const [reminderHidden, setReminderHidden] = useState(false);
  // Only where nothing else keeps a second copy: not the exe (its folder is
  // always written), and not while a chosen folder is being written.
  const noSecondCopy =
    storageKind() !== 'exe' && (folder.status.kind === 'yok' || folder.status.kind === 'secilmedi');
  const reminder = {
    due: !reminderHidden && noSecondCopy && reminderDue(fileRecord),
    savedDay: fileRecord.saved === null ? null : isoDay(fileRecord.saved),
    save: () => {
      downloadBackup(state);
      notify(t('Plan dosyaya yazıldı. İndirilenler klasörüne bakın.'));
    },
    hide: () => setReminderHidden(true),
  };
  // Moving the plans to the new address: the old end and the new end
  // (useMove.ts). Each does nothing on any other page.
  const move = useMoveOut(plans, peek);
  useMoveIn(plans);
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

  // "Kendi okulumla başla", over the sample school: a NEW empty plan opens and
  // the sample stays where it was, as a plan of its own. Nothing is deleted.
  // "Geri al" goes back to the sample plan and drops the empty plan again,
  // unless something has been typed in it meanwhile (then it stays, as a
  // plan). The plans come from a ref: this notice outlives the render it was
  // made in, and a switch made from a stale library would write it back.
  const plansNow = useRef(plans);
  plansNow.current = plans;
  const startOwnSchool = useCallback(() => {
    const was = plans.planId;
    const id = plans.createPlan(t('Kendi okulum'), emptyState());
    notify(t('Boş bir plan açıldı. Örnek okul, plan seçicide duruyor.'), 'info', {
      label: t('Geri al'),
      run: () => {
        plansNow.current.switchPlan(was);
        window.setTimeout(() => {
          const left = loadPlan(id);
          if (
            left !== null &&
            left.teachers.length + left.classes.length + left.lessons.length + left.rooms.length ===
              0
          ) {
            plansNow.current.deletePlan(id);
          }
        }, 0);
      },
    });
  }, [plans, notify, t]);

  // Dosya ▾ → "Bu planın kopyası" (K2; Program's Daha fazla until 2026-11-16): a second arrangement
  // is a second plan, holding this one's data and week; the plan picker in
  // the top bar appears with it.
  const copyPlan = useCallback(() => {
    const name = plans.library.plans.find((p) => p.id === plans.planId)?.name ?? 'Plan';
    const program = activeProgram(state);
    // In an old file with several programs this is how one of them becomes a
    // plan of its own, named after it, and is renamed from then on like any
    // plan (Planlar ve yedek). A copy and not a move: the old one goes with
    // its own "· Sil", which Geri al brings back.
    const own = state.programs.length > 1 ? `${name} · ${program.name}` : null;
    plans.createPlan(own ?? t('{ad} kopyası', { ad: name }), {
      ...state,
      programs: [program],
      activeProgramId: program.id,
    });
    notify(t('Kopya açıldı. Eski plana üst çubuktaki plan seçiciyle dönülür.'));
  }, [plans, state, notify, t]);

  const paletteActions = usePaletteActions({
    state,
    ribbon,
    motion,
    solver,
    goTo,
    notify,
    t,
    openShortcuts,
    openFile: () => fileInput.current?.click(),
    copyForNewTerm,
    openOldCopies: () => setOldCopiesOpen(true),
    toggleRibbon,
    toggleMotion,
    scale,
    chooseScale,
  });

  // Before a deletion: the open plan goes to the storage's one slot and, with
  // a folder, to the day's `silmeden-once` file (TODO SD1). Both, because the
  // undo itself lives in memory and a wiped profile takes the slot with it.
  const keepInFolder = folder.keepBefore;
  const keepBefore = useCallback(
    (before: State, label: string, quiet?: boolean) => {
      keepInStore(before, label, quiet);
      keepInFolder(before);
    },
    [keepInStore, keepInFolder],
  );

  // The state from before the last deletion of an earlier session, offered
  // once, on a strip: a reader who has trouble seeing would miss a toast.
  const [lastDeleteOpen, setLastDeleteOpen] = useState(lastDelete !== null);
  const restoreLastDelete = () => {
    if (lastDelete === null) return;
    setLastDeleteOpen(false);
    const said = t('Son silme geri alındı.');
    // What the restore replaces is kept too, but not offered at the next
    // start: that offer would be "undo the undo".
    keepInStore(state, said, true);
    keepInFolder(state);
    const next = replaceState(lastDelete.state, said);
    if (next === null) notify(said, 'info');
    else notify(said, 'info', { label: t('Geri al'), run: () => undoIf(next), expected: next });
  };

  // Dosya ▾ → Eski hâline dön (K8). The plan as it is now becomes today's
  // copy first, then the slot a reload reaches, then a step of the history.
  const [oldCopiesOpen, setOldCopiesOpen] = useState(false);
  const restoreCopy = (copy: State, day: string) => {
    if (unreadable === null) keepToday(plans.planId, state);
    const said = t('Plan eski hâline döndü: {gun}.', { gun: day });
    keepInStore(state, said, true);
    keepInFolder(state);
    const next = replaceState(copy, said);
    if (next === null) notify(said, 'info');
    else notify(said, 'info', { label: t('Geri al'), run: () => undoIf(next), expected: next });
  };

  // The folder's fuller copy after an empty start (useFolder's `bulundu`).
  // Also from the shrink strip: there the plan here is the small one, and it
  // stays in the day's rescue file the guard wrote it to.
  const openFolderCopyNow = async () => {
    const copy = folder.status.kind === 'bulundu' ? folder.status.copy : await folder.folderCopy();
    const bundle = copy === null ? null : parseBundle(copy.text);
    if (bundle !== null) keepBefore(state, t('Plan dosyası açıldı.'));
    const opened = bundle === null ? null : openFolderCopy(bundle);
    if (opened === null || opened.ok === 0) {
      notify(t('Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.'), 'info');
      return;
    }
    folder.release();
    notify(t('{acilan} plan açıldı.', { acilan: opened.ok }), 'info');
  };

  // The shrink strip's "keep the small one" goes over the live file: asked,
  // because the only button on a strip is the one an older reader presses.
  const acceptShrink = async () => {
    if (
      await confirm({
        title: t('Yeni hâlini asıl dosya yap'),
        body: t(
          'Klasördeki son plan dosyasının yerine bu küçük plan yazılır. Eski hâli günlük yedeklerde kalır.',
        ),
        confirmLabel: t('Yeni hâlini asıl dosya yap'),
        danger: true,
      })
    ) {
      await folder.acceptShrink();
    }
  };

  const fileChosen = openPlanFile({
    state,
    loadState: (next: State) => {
      keepBefore(state, t('Plan dosyası açıldı.'));
      loadState(next);
    },
    t,
    confirm,
    alert,
    notify,
    goUpdate: () => goTo({ tab: 'school', section: 'about' }),
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
        <KeepBeforeProvider value={keepBefore}>
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
              openPlans={() => goTo({ tab: 'school', section: 'plans' })}
              openAbout={() => goTo({ tab: 'school', section: 'about' })}
              openChecklist={() => {
                openChecklist();
                goTo({ tab: 'school', section: 'school' });
              }}
              copyForNewTerm={copyForNewTerm}
              copyPlan={copyPlan}
              copyBusy={solver.running || solver.advice?.searching === true}
              openProblems={() => setProblems({ lesson: null })}
              switchProgram={(id) => viewProgram((d) => switchProgram(d, id))}
              openOldCopies={() => setOldCopiesOpen(true)}
              lastFileDay={reminder.savedDay}
              scale={scale}
              chooseScale={chooseScale}
            />
            <OldCopies
              open={oldCopiesOpen}
              onClose={() => setOldCopiesOpen(false)}
              planId={plans.planId}
              state={state}
              restore={restoreCopy}
            />

            {/* Row two: the tools of whichever section is open. A named region
            around it, because a toolbar is not a landmark: outside `<header>`
            and `<main>` the strip had no place in a screen reader's list of
            regions (axe `region`, on every screen). `display: contents`, so
            the box changes nothing on screen. */}
            <section className="ribbon-band" aria-label={t('Düğme satırı')}>
              <Ribbon
                ui={ui}
                /* Okul bilgileri chooses its sections in the strip, and the
                   way to unfold it is in its Görünüm: folded there, the strip
                   would hide its own way back. */
                open={ribbon || tab === 'school'}
                state={state}
                change={change}
                manageProgram={manageProgram}
                solver={solver}
                programColor={programColor}
                setProgramColor={setProgramColor}
                changelogUnseen={changelogUnseen}
                planName={plans.library.plans.find((p) => p.id === plans.planId)?.name ?? ''}
                status={status}
              />
            </section>

            <InspectorProvider state={state} change={change} colored={ui.colored}>
              <LessonEditProvider state={state} change={change}>
                <ProblemList
                  state={state}
                  status={status}
                  open={problems}
                  onClose={() => setProblems(null)}
                  ui={ui}
                />
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
                    openFolderCopy={() => void openFolderCopyNow()}
                    acceptShrink={() => void acceptShrink()}
                    lastDelete={lastDeleteOpen ? lastDelete : null}
                    restoreLastDelete={restoreLastDelete}
                    closeLastDelete={() => setLastDeleteOpen(false)}
                    goTab={goTab}
                    ui={ui}
                    move={move}
                    reminder={reminder}
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
                    {/* Öğretmenler and Sınıflar: the list, or the lessons
                        entered from that side (K1). */}
                    {(tab === 'teachers' || tab === 'classes') &&
                      (ui.people[tab] === 'list' ? (
                        <Setup state={state} change={change} step={tab} />
                      ) : (
                        <Lessons
                          state={state}
                          change={change}
                          mode={lessonModeOf(tab, ui.people)}
                          focus={ui.lessonFocus}
                          setFocus={ui.setLessonFocus}
                          side={tab === 'teachers' ? 'teacher' : 'class'}
                          setAll={(all) => ui.setPeople(tab, all ? 'all' : 'lessons')}
                        />
                      ))}
                    <Activity mode={tab === 'program' ? 'visible' : 'hidden'} name="Program grid">
                      <Program
                        active={tab === 'program'}
                        state={state}
                        change={change}
                        solver={solver}
                        view={ui.view}
                        poolSort={ui.poolSort}
                        setPoolSort={ui.setPoolSort}
                        poolFilter={ui.poolFilter}
                        setPoolFilter={ui.setPoolFilter}
                        colorMode={programColor}
                        problems={status.problems}
                      />
                    </Activity>
                    {tab === 'print' && (
                      <Print
                        state={state}
                        excluded={printExcluded}
                        setExcluded={setPrintExcluded}
                        scope={ui.scope}
                        colored={ui.colored}
                        setColored={ui.setColored}
                        options={printOptions}
                        setOptions={(next) => {
                          setPrintOptions(next);
                          writePrintOptions(next);
                        }}
                      />
                    )}
                    {/* Başlarken stands over the school's own data, where an
                        empty project lands. */}
                    {tab === 'school' &&
                      (ui.section === 'school' ||
                        ui.section === 'rooms' ||
                        ui.section === 'subjects') && (
                        <Start state={state} change={change} plans={plans} onOwn={startOwnSchool} />
                      )}
                    {tab === 'school' && (ui.section === 'rooms' || ui.section === 'subjects') && (
                      <Setup state={state} change={change} step={ui.section} />
                    )}
                    {tab === 'school' && ui.section !== 'rooms' && ui.section !== 'subjects' && (
                      <Settings
                        state={state}
                        change={change}
                        replaceState={replaceState}
                        plans={plans}
                        folder={folder}
                        update={update}
                        scale={scale}
                        setScale={setScale}
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
        </KeepBeforeProvider>
      </UndoIfProvider>
    </GoToProvider>
  );
}
