import { Activity, useCallback, useRef, useState } from "react";
import { Keyboard, Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import Commands from "./components/Commands";
import { health } from "./feasibility";
import { InspectorProvider } from "./components/Inspector";
import { LessonEditProvider } from "./components/LessonEdit";
import { useDialogs } from "./components/Dialogs";
import { useToast } from "./components/Toasts";
import type React from "react";
import { bundleVersionOf, BUNDLE_VERSION } from "./bundle";
import { storageWorks, useStore, downloadBackup, parseState, isTextInput } from "./store";
import {
  applyMotion,
  applyRibbon,
  applyTheme,
  readDensity,
  readMotion,
  readRibbon,
  readRibbonAuto,
  applyAvailClock,
  readAvailClock,
  readScale,
  readTheme,
  readUiDensity,
  type Density,
  type Motion,
  type Theme,
} from "./theme";
import { attachScrollFade } from "./scrollFade";
import { attachRibbonScroll } from "./ribbonScroll";
import { useSolver } from "./useSolver";
import { useFolder } from "./useFolder";
import { useUpdate } from "./update";
import { APP_NAME, surumEtiketi } from "./version";
import { useToolState } from "./toolState";
import type { Tab } from "./toolState";
import Setup from "./components/setup";
import Lessons from "./components/lessons";
import { lessonIcon } from "./components/steps";
import Availability from "./components/Availability";
import Program from "./components/Program";
import { T, useT } from "./components/T";
import Check from "./components/Check";
import Ribbon from "./components/Ribbon";
import Print, { NOTHING_EXCLUDED } from "./components/Print";
import { readPrintOptions, writePrintOptions } from "./printOptions";
import type { PrintOptions } from "./printOptions";
import type { Excluded } from "./components/Print";
import { cleanMask, EMPTY_PROGRAM_MASK, solverExclusions } from "./programMask";
import type { ProgramMask } from "./programMask";
import Settings from "./components/settings";
import { useShortcutsHelp } from "./components/ShortcutsHelp";
import { hasUnseenChangelog } from "./changelog";

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
    id: "setup",
    label: "Okul",
    // A clipboard: the four lists you fill in at the start of a term.
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M8 4H6.5A1.5 1.5 0 0 0 5 5.5v14A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-14A1.5 1.5 0 0 0 17.5 4H16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="8.5"
          y="2.5"
          width="7"
          height="3.4"
          rx="1"
          fill="currentColor"
        />
        <path
          d="M8 10h8M8 13.5h8M8 17h5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    id: "availability",
    label: "Müsaitlik",
    // A calendar with a cross in it: the hours somebody cannot come.
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        focusable="false"
      >
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
        <path
          d="M7 3v3.5M17 3v3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
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
    id: "lessons",
    label: "Dersler",
    // The open book, and the ONE copy of it: `steps.tsx` owns the drawing
    // because the three kinds beside it are owned there too, and a symbol that
    // means the same thing in two rooms has to be one drawing (pitfall 56's
    // family — two answers to "what does this look like" is two answers).
    icon: lessonIcon,
  },
  {
    id: "program",
    label: "Program",
    // The grid itself, with one cell filled: a lesson sitting in its slot.
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        focusable="false"
      >
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
        <path
          d="M3 9.5h18M3 15h18M9 4v16M15 4v16"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect x="9" y="9.5" width="6" height="5.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "check",
    label: "Kontrol",
    // A magnifier over a tick: the tab that says WHY it cannot be built.
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="10.5"
          cy="10.5"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
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
    id: "print",
    label: "Çıktı",
    // A printer with paper coming out.
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M7 3.5h10v4H7z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
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
    id: "settings",
    label: "Ayarlar",
    // Three sliders. A cog reads as a blob at 22px; sliders keep a silhouette.
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M3 7h18M3 12h18M3 17h18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle
          cx="8"
          cy="7"
          r="2.6"
          fill="var(--paper)"
          stroke="currentColor"
          strokeWidth="1.8"
        />
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
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
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
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
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
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  moon: (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
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

/**
 * The mark, drawn out. Kept beside App rather than in components/ because it
 * is not a component anybody reuses — there is exactly one place in the
 * program that draws it, and that is three lines below.
 *
 * THE SIMPLE VARIANT, since 2026-08-28 ("sol üstteki logonun küçüğü
 * kullanılsın"). It used to be the detailed one, and the reason it changed is
 * the reason the two drawings exist at all: the mark is `1.75rem` here, which
 * is 24.5 px at 100 % — and the icon comparison this project already ran
 * (`scripts/ikon-karsilastir.mjs`) put 20-32 px in the band where the six
 * columns are "blurry but still separable", i.e. the band where it is a
 * judgement call. The reader made the call.
 *
 * The SOURCE of truth is site/icon-small.svg; e2e/kabuk.spec.ts checks this
 * draws the same rectangles, the way temel.spec.ts already does for the
 * favicon — which reads from the same file, so the tab and the top bar now
 * carry one drawing instead of two.
 */
function BrandMark() {
  return (
    <svg viewBox="0 0 512 512" className="brand-mark">
      <rect width="512" height="512" rx="112" fill="#2e3ba8" />
      <rect x="96" y="112" width="96" height="192" rx="32" fill="#65b6ec" />
      <rect x="208" y="208" width="96" height="192" rx="32" fill="#9ff292" />
      <rect x="320" y="128" width="96" height="160" rx="32" fill="#f3de9b" />
    </svg>
  );
}

export default function App() {
  const t = useT();
  const {
    state,
    change,
    manageProgram,
    undo,
    redo,
    loadState,
    canUndo,
    canRedo,
    plans,
    park,
  } = useStore();

  // Where you are, in every tab at once. Up here because switching tabs
  // unmounts the components that used to own these, and because the tool strip
  // that shows them is drawn above <main>.
  // With no data, start on Setup — an empty Program screen tells him nothing.
  const ui = useToolState(state.lessons.length > 0 ? "program" : "setup");
  const { tab, setTab } = ui;
  const fileInput = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  // The shell, because that is what the auto-hiding strip's attribute goes on:
  // the strip is a SIBLING of the scrolled box, and a rule that reaches
  // sideways is a rule nobody finds (see ribbonScroll.ts).
  const appRef = useRef<HTMLDivElement>(null);

  // Whether the strip is allowed to slide away on its own while you read down.
  // Up here with the refs rather than beside the other preferences because the
  // effect that reads it is a few lines below — a gesture rather than a
  // preference, so it gets its own key (theme.ts).
  const [ribbonAuto, setRibbonAuto] = useState<boolean>(readRibbonAuto);

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

  // The fade on the scrolled content, re-attached per tab: React swaps the
  // whole child of `.main` on a tab change, and scrollFade reads that child
  // once (see the note there).
  useEffect(() => {
    const box = mainRef.current;
    return box === null ? undefined : attachScrollFade(box);
  }, [tab]);
  // The strip gets out of the way while you read down and comes back when you
  // look up. Same box, same re-attach on tab change, same reason: React swaps
  // the whole child of `.main`. Program is left out on purpose — see the note
  // in ribbonScroll.ts; there `.main` does not scroll at all, so attaching
  // would simply do nothing, but saying so here is cheaper than finding out.
  //
  // ...and only if the reader wants it to. `ribbonAuto` is a preference of its
  // own and not a widening of `ders-programi-serit`: that one says "I do not
  // want the strip", this one says "do not move it while I read". Off, the
  // effect is never attached and the attribute the CSS reads is cleared, so
  // there is no path left that can hide the strip behind the reader's back.
  useEffect(() => {
    const box = mainRef.current;
    const shell = appRef.current;
    if (shell !== null && !ribbonAuto) shell.removeAttribute("data-ribbon");
    if (box === null || shell === null || tab === "program" || !ribbonAuto)
      return undefined;
    return attachRibbonScroll(box, shell);
  }, [tab, ribbonAuto]);
  // Probed once at startup; the answer does not change afterwards.
  const [canSave] = useState(storageWorks);
  const [theme, setTheme] = useState<Theme>(readTheme);
  // Already applied to the document by main.tsx before the first paint; this
  // copy exists only so Ayarlar → Görünüm can show which step is pressed.
  const [scale, setScale] = useState<number>(readScale);
  const [density, setDensity] = useState<Density>(readDensity);
  // Its twin, and a separate one since 2026-08-27: the grid's step and the
  // interface's step are two decisions (see theme.ts). Only Ayarlar → Görünüm
  // sets this one — the Program strip still speaks for the grid alone.
  const [uiDensity, setUiDensity] = useState<Density>(readUiDensity);
  // Applied to the document by main.tsx before the first paint; this copy
  // exists so the button that flips it can show which way the switch is.
  const [availClock, setAvailClockRaw] = useState<boolean>(readAvailClock);
  // The <html> attribute goes with the state, wherever the control lives. It
  // used to be written by the one button in Ayarlar → Görünüm; that button is
  // in Müsaitlik's own strip now, and a second caller must not have to know to
  // do this (the toggle would flip and nothing on the table would change).
  const setAvailClock = useCallback((next: boolean) => {
    applyAvailClock(next);
    setAvailClockRaw(next);
  }, []);
  // Same again for how much the interface is allowed to move.
  const [motion, setMotion] = useState<Motion>(readMotion);
  // Whether the tool strip is drawn. It lives here and not in Ribbon because
  // the button that folds it is in the top bar — a folded strip has no row to
  // put its own chevron on, which is the whole point of folding it.
  const [ribbon, setRibbon] = useState<boolean>(readRibbon);
  // Which pages the print tab will produce. Not in State: it is a decision
  // about one printout, not something a backup should carry.
  const [printExcluded, setPrintExcluded] =
    useState<Excluded>(NOTHING_EXCLUDED);
  // What each of those pages carries. Up here for the same reason as the tick
  // lists — Print unmounts on every tab change — but unlike them it is
  // remembered between sessions: it is set once a term, not once a printout.
  const [printOptions, setPrintOptions] =
    useState<PrintOptions>(readPrintOptions);
  // Temporary row/day visibility is a view of one PLAN, not backup data. It
  // follows alternative programs because they share the same school entities,
  // survives tab switches, and disappears with the browser session.
  const [programMasks, setProgramMasks] = useState<Record<string, ProgramMask>>(
    {},
  );
  const programMask = useMemo(
    () => cleanMask(programMasks[plans.planId] ?? EMPTY_PROGRAM_MASK, state),
    [programMasks, plans.planId, state],
  );
  const setProgramMask = useCallback(
    (apply: (mask: ProgramMask) => ProgramMask) => {
      setProgramMasks((all) => ({
        ...all,
        [plans.planId]: apply(
          cleanMask(all[plans.planId] ?? EMPTY_PROGRAM_MASK, state),
        ),
      }));
    },
    [plans.planId, state],
  );
  // The run lives HERE, not in Program: switching tabs unmounts that component
  // and a search that dies because somebody glanced at Kontrol would throw away
  // work with nothing to show for it (pitfall 18).
  const solver = useSolver(change);
  // The folder my father picked, if he picked one (task B4). Here for the
  // same reason as the solver: a pending write must not die because a tab
  // changed. It works on EVERY route in Chromium — file:// included, where
  // showDirectoryPicker is defined and the context is secure (pitfall 65);
  // what file:// lacks is a real origin, so the permission is asked again on
  // each launch. The browsers it is missing in are Firefox and Safari.
  const folder = useFolder(plans.library, plans.planId, state);
  // How this copy can be updated, if it can. Two routes and two mechanisms:
  // a service worker on the site and the local install, three buttons in the
  // exe. The double-clicked .html has neither and says so; it cannot replace
  // itself, and it is the build principle 3 is checked on (temel.spec.ts).
  //
  // `park` goes in because the exe route ENDS by closing this window: the
  // pending autosave has to be on disk before it does (pitfall 28).
  const update = useUpdate(park);
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
  const status = useMemo(() => health(state), [state]);

  // Ctrl/⌘+K opens the palette; Alt+1..7 go to a section.
  //
  // Alt and not a bare digit: a bare "5" while a lesson card has focus would
  // jump to Yazdır, and every card on the grid is a focusable button. The
  // modifier is what keeps a shortcut from being a trap.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey && /^[1-7]$/.test(e.key)) {
        const next = TABS[Number(e.key) - 1];
        if (next !== undefined) {
          e.preventDefault();
          goTab(next.id);
        }
        return;
      }
      // '?' opens the shortcuts help. Guarded the same way Ctrl+Z is
      // (store.ts's isTextInput): it is a printable character, and without
      // the guard it would fire while typing a search or a name.
      if (
        e.key === "?" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !isTextInput(e.target)
      ) {
        e.preventDefault();
        openShortcuts();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTab, openShortcuts]);

  const paletteActions = useMemo(
    () => [
      {
        id: "save",
        label: t("Dosyaya kaydet"),
        hint: t("yedek al"),
        run: () => {
          downloadBackup(state);
          notify(t("Yedek dosyaya yazıldı. İndirilenler klasörüne bakın."));
        },
      },
      {
        id: "auto",
        label: t("Otomatik diz"),
        hint: t("Program"),
        run: () => {
          goTab("program");
          solver.start(state, {
            keepPlaced: true,
            exclusions: solverExclusions(programMask),
          });
        },
      },
      {
        id: "theme",
        label: theme === "dark" ? t("Açık temaya geç") : t("Koyu temaya geç"),
        run: toggleTheme,
      },
      {
        id: "ribbon",
        label: ribbon ? t("Araç şeridini gizle") : t("Araç şeridini göster"),
        run: toggleRibbon,
      },
      {
        id: "motion",
        label:
          motion === "kapali"
            ? t("Animasyonları aç")
            : t("Animasyonları kapat"),
        hint: t("Ayarlar → Görünüm"),
        run: toggleMotion,
      },
      {
        id: "shortcuts",
        label: t("Klavye kısayolları"),
        hint: "?",
        run: openShortcuts,
      },
    ],
    [state, theme, ribbon, motion, solver, goTab, notify, t, programMask, openShortcuts],
  );

  function toggleRibbon() {
    const next = !ribbon;
    applyRibbon(next);
    setRibbon(next);
  }

  /**
   * Two positions from the palette, three in Ayarlar. The middle step ('az') is
   * a considered choice and the palette is a place you pass through, so what
   * this offers is the switch: off, or back to whatever full means.
   */
  function toggleMotion() {
    const next: Motion = motion === "kapali" ? "tam" : "kapali";
    applyMotion(next);
    setMotion(next);
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  async function fileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so the same file can be picked again
    if (file === undefined) return;

    // Read ONCE. The failure path used to call `file.text()` a second time and
    // parse the whole thing again, which made a wrong file the slowest case
    // rather than the fastest. (Both parses are cheap — MEASURED at 0.65 ms for
    // a full 426-placement week — so this is about the shape of the code, not
    // about speed. The thing that actually costs a reader time on this path is
    // the confirmation dialog, and that one is deliberate.)
    const text = await file.text();
    const loaded = parseState(text);
    if (loaded === null) {
      // Three different files can land here and each deserves its own sentence.
      // A BUNDLE is refused rather than opened: it holds every plan, so opening
      // one means replacing the whole library — and the top bar stays the place
      // where no click can lose an afternoon.
      const version = bundleVersionOf(text);
      await alert({
        title:
          version === BUNDLE_VERSION
            ? t("Bu dosya bütün planları içeriyor")
            : version !== null
              ? t("Bu dosya daha yeni bir sürümle yazılmış")
              : t("Bu dosya okunamadı"),
        tone: "warn",
        body:
          version === BUNDLE_VERSION
            ? t(
                'Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Ayarlar → Planlar ve yedek bölümündeki "Tümünü dosyadan aç" düğmesini kullanın.',
              )
            : version !== null
              ? t("Programı güncelleyin, sonra tekrar deneyin.")
              : t(
                  "Program tarafından indirilmiş bir .json yedek dosyası seçin.",
                ),
      });
      return;
    }
    if (
      !(await confirm({
        title: t("Şu anki programın yerine geçecek"),
        body: t(
          'Ekrandaki plan dosyadakiyle değiştirilecek ve geri alma geçmişi sıfırlanacak. Vazgeçme ihtimaliniz varsa önce "Dosyaya kaydet" deyin.',
        ),
        confirmLabel: t("Yedeği yükle"),
        danger: true,
      }))
    ) {
      return;
    }
    loadState(loaded);
    notify(t("Yedek yüklendi."));
  }

  return (
    /* `data-section` belongs on the ROOT, not only on the chrome that first
       needed it. The stylesheet resolves --sec from this attribute, and two
       rules outside the top bar read it: the section rule on a panel heading
       (`.panel > h2::before`) and a pressed filter chip. Both lived under
       `.main`, which the header is not an ancestor of, so both had been
       falling through to `--accent` since the day they were written — while
       the comment above the first one said it carried the section's colour.
       A custom property's SCOPE is part of its contract (pitfall 52). */
    <div className="app" ref={appRef} data-section={tab}>
      {/* ONE row: which document, where you are, what you did, and the file.
          They share a row because none of them needs a row of its own, and
          three separate strips would have cost the grid a teacher. */}
      <header className="topbar" data-section={tab}>
        {/* Zone zero: WHAT THIS IS. The detailed mark, at the one place on
            screen with room for it — the tab's favicon is the simplified
            variant, because six columns at 16 px are a smear (measured).

            Inline rather than <img src>: dist/index.html is ONE file and
            fetches nothing (principle 3, pitfall 32), so an <img> would need
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
        <nav className="tabstrip" aria-label={t("Bölümler")}>
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
              {dest.id === "settings" && changelogUnseen && (
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
          onClick={() => goTab("check")}
          /* The label carries the sentence even when the bar is too narrow to
             draw it — and it is an aria-label rather than a title so the
             accessible name is this and not "Kontrol", which is also the name
             of a tab three pixels away. */
          aria-label={t("Programın durumu: {durum}. Ayrıntı için Kontrol.", {
            durum: status.message,
          })}
          title={t("{durum}. Kontrol sekmesini açar", {
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
          <h1 className="app-title">
            {state.settings.schoolName.trim() || APP_NAME}
          </h1>

          {/* Which timetable is open. It is shown even when there is only one:
              "hangi planı düzenliyorum" is the question this answers, and a
              picker that appears only after you already have two plans cannot
              be how you find out that plans exist. Everything that CREATES,
              renames or deletes one is in Ayarlar > Veri — the top bar must
              stay a place where no click can lose an afternoon. */}
          <select
            className="plan-picker"
            aria-label={t("Plan")}
            title={t(
              "Planlar arasında geçiş yapar. Yeni plan, ad değiştirme ve silme: Ayarlar → Planlar ve yedek",
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
            aria-label={t("Geri al")}
            title={t("Geri al (Ctrl+Z)")}
          >
            {ICON.undo}
          </button>
          <button
            className="btn icon"
            onClick={redo}
            disabled={!canRedo}
            aria-label={t("İleri al")}
            title={t("İleri al (Ctrl+Y)")}
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
          onClick={() => {
            downloadBackup(state);
            notify(t("Yedek dosyaya yazıldı. İndirilenler klasörüne bakın."));
          }}
          title={t(
            "Programı bir .json dosyasına yazar. Program bu bilgisayarda kendiliğinden saklanıyor; dosya taşımak ve yedeklemek için.",
          )}
        >
          {t("Dosyaya kaydet")}
        </button>
        <button
          className="btn"
          onClick={() => fileInput.current?.click()}
          title={t("Daha önce kaydedilmiş bir .json dosyasını açar")}
        >
          {t("Dosyadan aç")}
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
          aria-label={t("Ara ve git")}
          title={t("Ara ve git (Ctrl+K)")}
          onClick={() => setPaletteOpen(true)}
        >
          <SearchIcon size={18} strokeWidth={2} />
        </button>

        <button
          className="btn icon"
          aria-label={t("Klavye kısayolları")}
          title={t("Klavye kısayolları (?)")}
          onClick={openShortcuts}
        >
          <Keyboard size={18} strokeWidth={2} />
        </button>

        <button
          className="btn icon"
          aria-expanded={ribbon}
          aria-label={t("Araç şeridi")}
          title={
            ribbon
              ? t("Araç şeridini gizle, ızgaraya bir satır daha kalsın")
              : t("Araç şeridini göster")
          }
          onClick={toggleRibbon}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d={ribbon ? "M5 15l7-7 7 7" : "M5 9l7 7 7-7"}
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
          aria-pressed={theme === "dark"}
          aria-label={t("Koyu tema")}
          title={theme === "dark" ? t("Açık temaya geç") : t("Koyu temaya geç")}
          onClick={toggleTheme}
        >
          {theme === "dark" ? ICON.sun : ICON.moon}
        </button>
      </header>

      {/* Row two: the tools of whichever section is open. */}
      <Ribbon
        ui={ui}
        open={ribbon}
        state={state}
        change={change}
        manageProgram={manageProgram}
        solver={solver}
        programMask={programMask}
        setProgramMask={setProgramMask}
        density={density}
        setDensity={setDensity}
        availClock={availClock}
        setAvailClock={setAvailClock}
        theme={theme}
        setTheme={setTheme}
        planName={
          plans.library.plans.find((p) => p.id === plans.planId)?.name ?? ""
        }
      />

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
            {!canSave && (
              <div className="save-warning">
                ⚠{" "}
                <T k="**Bu bilgisayarda otomatik kayıt çalışmıyor.** Program kapanınca yaptığınız her şey kaybolur. Çalışırken sık sık **Dosyaya kaydet** düğmesine basın ve bilgisayarı kapatmadan önce mutlaka bir yedek alın." />
              </div>
            )}

            {/* A NEW BUILD IS RUNNING THE SERVICE WORKER, this page is still the
            old one. Announced rather than applied: principle 1's promise is
            that nothing updates itself out from under him, and a timetable
            half-dragged is exactly the moment a silent reload would land.

            It is a strip and not a toast because it carries an ACTION, and
            toasts in this program deliberately do not (see Toasts.tsx). */}
            {update.ready && !updateHidden && (
              <div className="update-bar" role="status">
                <span>
                  <T
                    k="**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz."
                    vars={{ surum: surumEtiketi() }}
                  />
                </span>
                <span className="update-acts">
                  <button className="btn primary" onClick={update.reload}>
                    {t("Yenile")}
                  </button>
                  <button className="btn" onClick={() => setUpdateHidden(true)}>
                    {t("Sonra")}
                  </button>
                </span>
              </div>
            )}

            {/* A SAVE THAT STOPPED WORKING HAS TO BE VISIBLE (pitfall 7). These
            two states mean my father once picked a folder and it is no longer
            being written to — the folder moved, the disk filled, or the
            browser dropped the permission on reload. Silence here is a term's
            work quietly stopping to be backed up.

            'secilmedi' is deliberately NOT here: never having picked a folder
            is not a fault, it is the starting state, and a strip that is up on
            every screen from the first minute is a strip nobody reads. It is
            said instead in Ayarlar → Veri, in red, on the routes where the
            offer is a good one. */}
            {(folder.status.kind === "izin-gerek" ||
              folder.status.kind === "hata") && (
              <div className="save-warning">
                ⚠{" "}
                {folder.status.kind === "izin-gerek" ? (
                  <>
                    <T
                      k="**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor."
                      vars={{ klasor: folder.status.name }}
                    />
                  </>
                ) : (
                  <>
                    <T
                      k="**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor."
                      vars={{
                        klasor: folder.status.name,
                        sebep: folder.status.text,
                      }}
                    />
                  </>
                )}{" "}
                {/* NOT "Ayarlar → Veri" (pitfall 49). getByRole name matching is
                substring AND case-insensitive, so that label answered to the
                Ayarlar TAB's own query and broke the folder suite's helper —
                a button three pixels from a tab must not wear its name, in
                any case. This one says what it does instead. */}
                <button
                  className="btn"
                  onClick={() => {
                    goTab("settings");
                    ui.setSection("plans");
                  }}
                >
                  {t("Klasörü düzelt")}
                </button>
              </div>
            )}

            {/* The scroll container lives HERE, not in the six tab components: they
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
            <main
              ref={mainRef}
              className={
                tab === "program" && state.lessons.length > 0
                  ? "main no-overflow"
                  : "main scroll-fade"
              }
            >
              {tab === "setup" && (
                <Setup
                  state={state}
                  change={change}
                  plans={plans}
                  step={ui.step}
                />
              )}
              {tab === "availability" && (
                <Availability
                  state={state}
                  change={change}
                  kind={ui.kind}
                  chosen={ui.chosen}
                  setChosen={ui.setChosen}
                  showHeat={ui.showHeat}
                />
              )}
              {tab === "lessons" && (
                <Lessons
                  state={state}
                  change={change}
                  mode={ui.lessonMode}
                  focus={ui.lessonFocus}
                  setFocus={ui.setLessonFocus}
                />
              )}
              <Activity
                mode={tab === "program" ? "visible" : "hidden"}
                name="Program grid"
              >
                <Program
                  active={tab === "program"}
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
                />
              </Activity>
              {tab === "check" && <Check state={state} view={ui.checkView} />}
              {tab === "print" && (
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
              {tab === "settings" && (
                <Settings
                  state={state}
                  change={change}
                  loadState={loadState}
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
  );
}
