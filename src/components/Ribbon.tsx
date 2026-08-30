// The tool strip: what the section you are in can DO, on a row of its own.
//
// The rule for what earns a place here: it answers "what am I looking at" or
// "what does one click do", and the eye looks for it on arriving. A list, a
// counter, a checkbox or a sentence of explanation stays in the panel below —
// a ribbon of everything is a ribbon of nothing.
//
// ONE SHAPE, SIX TABS (2026-08-27). Before this the five strips were five
// different objects: Kurulum had symbols but no captions, Müsaitlik had both,
// Program had captions on two groups out of four, and Yazdır and Ayarlar were
// bare rows of words. Kontrol had no strip at all, so arriving there moved
// everything under it up by the strip's whole height and arriving anywhere else
// moved it back down. The contract now, and `e2e/serit.spec.ts` measures every
// line of it:
//
//   1. all seven tabs draw a `.ribbon`, and they are the same height;
//   2. every strip opens with a `<Group>` caption — what the buttons answer;
//   3. groups are divided by `<Sep/>`, and a right-hand group by `<Spacer/>`;
//   4. every button carries a SYMBOL and a WORD, never one alone;
//   5. all the buttons are the same height;
//   6. the first button starts at the same x on all seven, because the opening
//      caption is a FIXED box with the word centred in it and the rule pinned
//      to its right edge (2026-08-27, "İlk baştaki yazı sonrası hepsi aynı
//      hizadan başlasın ... arada bir çizgi olur"; corrected 2026-08-28,
//      "çizgi her sectionda aynı yerde olsun ve yazı ortalansın" — the box was
//      padded but the rule was drawn from its STATIC position, i.e. from the
//      end of the TEXT, so it moved with every caption). The seven captions
//      are one word each for the same reason: a box that has to hold "NE
//      GÖSTERİLSİN" is a box with an inch of air in front of six other tabs;
//   7. buttons in one group are the same WIDTH — `.ribbon-group` is a grid of
//      equal columns ("Blokların simetrisi ... sadece şekilleriyle").
//
// And one more thing that is an ORDER rather than a shape: wherever a strip
// offers the two kinds side by side, teacher comes first and class second. It
// was teacher-first in Müsaitlik and Program and class-first in Dersler and
// Yazdır — the same two icons, the same row, two orders. Kurulum's three lists
// are not this: a class refers to a room, so rooms have to be typed in first.
//
// Rule 4 is the accessibility half: the word is the accessible name in both
// test layers (pitfall 56) and the symbol is what the eye finds first at 150%,
// which is the scale this tool is built for.
//
// The three THINGS this program schedules — teacher, class, room — are drawn
// from `KIND_ICON` wherever they are named, Yazdır included. Everything else is
// lucide (tree-shaken, ~0.3 KB a symbol).
//
// The state these controls show (`view`, `kind`, `step`, `section`, `scope`,
// `checkView`) lives in App — see src/toolState.ts for why that is a fix and
// not a side effect of drawing them up here.

import type React from 'react';
import type { ReactNode } from 'react';
import { useDialogs } from './Dialogs';
import { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Bell,
  Check,
  Clock,
  Copy,
  Eraser,
  Eye,
  Flame,
  Layers,
  Info,
  Library,
  List,
  Maximize2,
  Minimize2,
  Moon,
  Palette as PaletteIcon,
  Pencil,
  Play,
  Plus,
  Pin,
  PinOff,
  RotateCcw,
  Rows3,
  Scale,
  Sun,
  Square,
  TriangleAlert,
  Trash2,
} from 'lucide-react';
import { health } from '../feasibility';
import type { State } from '../types';
import type { SolverRun } from '../useSolver';
import type { Density, Theme } from '../theme';
import { applyDensity, applyTheme } from '../theme';
import { surumEtiketi } from '../version';
import { paletteColor } from '../palette';
import {
  activePinned,
  activePlacements,
  activeProgram,
  addProgram,
  blankProgram,
  nextProgramName,
  removeProgram,
  renameProgram,
  replaceActiveGrid,
  switchProgram,
  validProgramName,
} from '../programs';
import { newId } from '../entities';
import { maskCount, setDayMask, setRowMask, solverExclusions } from '../programMask';
import type { ProgramMask } from '../programMask';
import { pendingBlocks, pinScopeCells, togglePinScope } from '../constraints';
import type { Kind, LessonMode, SectionId, ToolState, View, CheckView } from '../toolState';
import { KIND_ICON, STEPS, classIcon, teacherIcon } from './steps';
import { useT } from './T';

interface Props {
  ui: ToolState;
  /** Whether the strip is drawn at all. Owned by App: the button is up there. */
  open: boolean;
  state: State;
  /** Only the strip's own destructive action needs it: "Programı boşalt". */
  change: (fn: (d: State) => State) => void;
  /** Program boundaries deliberately clear undo/redo history. */
  manageProgram: (fn: (d: State) => State) => void;
  solver: SolverRun;
  programMask: ProgramMask;
  setProgramMask: (apply: (mask: ProgramMask) => ProgramMask) => void;
  density: Density;
  setDensity: (next: Density) => void;
  /** Müsaitlik's hour labels. A MACHINE preference, so App still owns it —
      only the control moved here, out of Ayarlar → Görünüm. */
  availClock: boolean;
  setAvailClock: (next: boolean) => void;
  /** Ayarlar → Görünüm's strip carries the theme; the top bar's button stays.
      Same state, two doors — that one is the shortcut, this is the section. */
  theme: Theme;
  setTheme: (next: Theme) => void;
  /** Ayarlar → Planlar's strip STATES which plan is open. A name, not the
      library: everything that creates, renames and deletes stays in the panel. */
  planName: string;
}

/** Every lucide symbol in the strip is drawn at the size the hand-drawn four are. */
const ICON = { size: 18, 'aria-hidden': true, focusable: false } as const;

/**
 * The two views. `short` is what the button shows, `label` what it is called.
 *
 * They used to be icons alone, on the grounds that the sentence under the strip
 * explains the axis anyway. It does — once you have read it. `aria-label` stays
 * the full phrase because it is the name the suite and a screen reader find
 * them by, and WCAG's Label in Name is satisfied by the visible word being
 * contained in it ("Öğretmen" inside "Öğretmen görünümü").
 */
export const VIEWS: Array<{ id: View; label: string; short: string; icon: React.ReactElement }> = [
  { id: 'teacher', label: 'Öğretmen görünümü', short: 'Öğretmen', icon: teacherIcon },
  { id: 'class', label: 'Sınıf görünümü', short: 'Sınıf', icon: classIcon },
];


const KINDS: Array<{ id: Kind; label: string }> = [
  { id: 'teacher', label: 'Öğretmen' },
  { id: 'class', label: 'Sınıf' },
  { id: 'room', label: 'Derslik' },
];

const SECTIONS: Array<{ id: SectionId; label: string; icon: React.ReactElement }> = [
  { id: 'school', label: 'Zil ve günler', icon: <Bell {...ICON} /> },
  { id: 'rules', label: 'Kurallar', icon: <Scale {...ICON} /> },
  { id: 'appearance', label: 'Görünüm', icon: <Eye {...ICON} /> },
  { id: 'plans', label: 'Planlar ve yedek', icon: <Library {...ICON} /> },
  { id: 'about', label: 'Hakkında', icon: <Info {...ICON} /> },
];


/** The two grounds, named rather than toggled — the same list Ayarlar →
    Görünüm draws, because a strip and a panel showing the same two buttons may
    not disagree about what they are called. */
const THEMES: Array<{ id: Theme; label: string; icon: React.ReactElement }> = [
  { id: 'light', label: 'Açık', icon: <Sun {...ICON} /> },
  { id: 'dark', label: 'Koyu', icon: <Moon {...ICON} /> },
];

/** Three densities, and the symbols say which way each one goes. */
const DENSITIES: Array<{ id: Density; label: string; icon: React.ReactElement; why: string }> = [
  {
    id: 'ferah',
    label: 'Ferah',
    icon: <Maximize2 {...ICON} />,
    why: 'Hücre en büyük, kartın alt satırı tam boyda',
  },
  { id: 'rahat', label: 'Rahat', icon: <Rows3 {...ICON} />, why: 'Hücre geniş, ders saatleri görünür' },
  {
    id: 'sigdir',
    label: 'Sığdır',
    icon: <Minimize2 {...ICON} />,
    why: 'Haftanın tamamı ekrana sığar, ders saatleri gizlenir',
  },
];

/**
 * The three ways to walk the lesson list.
 *
 * The two entity icons come from `KIND_ICON` — a class is the same crowd here
 * as it is in Müsaitlik and in the entity sheet — and only the third needs one
 * of its own, because "the whole list" is not one of the three kinds.
 */
const LESSON_MODES: Array<{ id: LessonMode; label: string; icon: React.ReactElement; why: string }> = [
  {
    id: 'teacher',
    label: 'Öğretmenden',
    icon: KIND_ICON.teacher,
    why: 'Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin',
  },
  {
    id: 'class',
    label: 'Sınıftan',
    icon: KIND_ICON.class,
    why: 'Bir sınıf seçin, o sınıfın derslerini arka arkaya girin',
  },
  {
    id: 'all',
    label: 'Genel',
    icon: <List {...ICON} />,
    why: 'Bütün dersler tek listede',
  },
];

function Sep() {
  return <span className="ribbon-sep" aria-hidden="true" />;
}

function Spacer() {
  return <span className="spacer" />;
}

/**
 * A caption and the controls it names — the strip's only structure.
 *
 * The caption is a DIRECT child of `.ribbon` and the controls are boxed. Both
 * halves of that are load-bearing:
 *
 *   * direct, because `e2e/serit.spec.ts` reads `bar.firstElementChild` to
 *     check that every strip opens with a caption, and because the first
 *     caption on each of the seven strips is padded to one width so the first
 *     BUTTON lands at the same x wherever you are;
 *   * boxed, because buttons that belong to one question should be the same
 *     width, and CSS has no way to say that without a box (`.ribbon-group` is
 *     a one-row grid of equal columns).
 *
 * It was a fragment until 2026-08-27, on the argument that boxing would make
 * `.ribbon`'s gap apply between boxes and force a second gap inside them. That
 * is exactly what happens and it turns out to be the point: with one gap the
 * caption sat as far from the buttons it names as the buttons sat from each
 * other, so the only thing grouping them was the hairline. Now the inside gap
 * is smaller than the outside one and the group reads as a group.
 */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <>
      <span className="ribbon-label">{t(label)}</span>
      <span className="ribbon-group">{children}</span>
    </>
  );
}

export default function Ribbon({
  ui,
  open,
  state,
  change,
  manageProgram,
  solver,
  programMask,
  setProgramMask,
  density,
  setDensity,
  availClock,
  setAvailClock,
  theme,
  setTheme,
  planName,
}: Props) {
  const t = useT();
  const { confirm, prompt, alert } = useDialogs();
  const status = useMemo(() => health(state), [state]);

  // Folded: the row is GONE, all of it. A folded strip that keeps 27px to hold
  // its own chevron gives back a third of what it costs, and the whole point of
  // folding is the row it buys at 150%. The way back is in the top bar.
  if (!open) return null;

  if (ui.tab === 'setup') {
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Okul listeleri')}>
        <Group label="Liste">
          {STEPS.map((s) => {
            const count = s.count(state);
            return (
              <button
                key={s.id}
                className="btn step"
                aria-pressed={s.id === ui.step}
                data-empty={count === 0}
                onClick={() => ui.setStep(s.id)}
              >
                <span className="step-icon" aria-hidden="true">
                  {s.icon}
                </span>

                {t(s.label)}
                <span className="step-count">{count}</span>
              </button>
            );
          })}
        </Group>
      </div>
    );
  }

  if (ui.tab === 'lessons') {
    // "artık sınıftan mı eklemek istiyorsun? öğretmenden mi eklemek istiyorsun
    // genel bakmak mı istiyorsun gibi olabilir."
    //
    // Deliberately the SAME shape as the Müsaitlik strip below: a group that
    // asks whose list this is, and a group that states which one is open. Both
    // tabs answer the same two questions, and answering them with two different
    // strips would have been two things to learn instead of one.
    const list: Array<{ id: string; name: string; color: number }> =
      ui.lessonMode === 'teacher' ? state.teachers : state.classes;
    const selected = list.find((x) => x.id === ui.lessonFocus) ?? list[0];
    // "Ders girişi araçları" and not "Ders araçları", which is what it was
    // called for about an hour: `getByLabel` matches on SUBSTRING and ignores
    // case, so "Ders araçları" also answered to `getByLabel('ders ara')` — the
    // search box on this very screen — and the list test died of a strict-mode
    // violation. Pitfall 74 from the other side: it is not only buttons that
    // collide, and a name does not have to look like a name to be one.
    return (
      <div
        className="ribbon"
        data-section={ui.tab}
        role="toolbar"
        aria-label={t('Ders girişi araçları')}
      >
        <Group label="Yöntem">
          {LESSON_MODES.map((m) => (
            <button
              key={m.id}
              className="btn"
              aria-pressed={ui.lessonMode === m.id}
              title={t(m.why)}
              onClick={() => {
                ui.setLessonMode(m.id);
                // The focus is an id from the OTHER list once the axis turns,
                // and an id that matches nothing would read as "Liste boş".
                ui.setLessonFocus('');
              }}
            >
              {m.icon}
              {t(m.label)}
            </button>
          ))}
        </Group>

        {ui.lessonMode !== 'all' && (
          <>
            <Sep />
            {/* A READING, not a control — the picker is the list in the right
                column, exactly as it is in Müsaitlik. */}
            <Group label="Açık olan">
              <span className="ribbon-value">
                {selected === undefined ? (
                  t('Liste boş')
                ) : (
                  <>
                    <span
                      className="row-dot"
                      style={{ background: paletteColor(selected.color) }}
                    />
                    {selected.name}
                  </>
                )}
              </span>
            </Group>
          </>
        )}

        <Spacer />

        <Group label="Toplam">
          <span className="ribbon-value">
            {state.lessons.length} ders · {state.lessons.reduce((n, l) => n + l.weeklyHours, 0)} saat
          </span>
        </Group>
      </div>
    );
  }

  if (ui.tab === 'availability') {
    // Name and colour separately: a Room has no colour of its own, so the mark
    // beside the name is drawn only for the two kinds that carry one.
    const list: Array<{ id: string; name: string; color?: number }> =
      ui.kind === 'teacher' ? state.teachers : ui.kind === 'class' ? state.classes : state.rooms;
    const selected = list.find((x) => x.id === ui.chosen) ?? list[0];
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Müsaitlik araçları')}>
        <Group label="Kim">
          {KINDS.map((k) => (
            <button
              key={k.id}
              className="btn"
              aria-pressed={ui.kind === k.id}
              onClick={() => {
                ui.setKind(k.id);
                ui.setChosen('');
              }}
            >
              {KIND_ICON[k.id]}
              {t(k.label)}
            </button>
          ))}
        </Group>

        <Sep />

        {/* Whose hours are open. The colour is the same mark the list on the
            right and the grid row carry: the identity of a teacher or a class
            is its colour everywhere it is named, not only where it is edited.
            A room has none — `Room` carries no colour — so nothing is drawn.
            This group is a READING, not a control, so it has no button: it is
            the one place the strip states rather than asks. */}
        <Group label="Açık olan">
          <span className="ribbon-value">
            {selected === undefined ? (
              'Liste boş'
            ) : (
              <>
                {selected.color !== undefined && (
                  <span
                    className="row-dot"
                    style={{ background: paletteColor(selected.color) }}
                  />
                )}
                {selected.name}
              </>
            )}
          </span>
        </Group>

        <Spacer />

        {/* What is ON THIS SCREEN, top right — "sağ üstte haftanın darlığı
            açılsın mı kapalı mı kalsın özelliği olsun. Saatleri de oraya
            koyalım. ikinci şeritte olsun."

            The two are not the same kind of thing and it does not matter here:
            one is a position (`toolState`) and one a machine preference
            (`ders-programi-musaitlik-saat`), but both answer "what am I
            looking at", and that is the question a strip is for. The hour
            toggle used to live three clicks away in Ayarlar → Görünüm. */}
        <Group label={t('Göster')}>
          <button
            className="btn"
            aria-pressed={ui.showHeat}
            title={t('Haftanın darlığı tablosunu göster ya da gizle')}
            onClick={() => ui.setShowHeat(!ui.showHeat)}
          >
            <Flame {...ICON} />
            {t('Haftanın darlığı')}
          </button>
          <button
            className="btn"
            aria-pressed={availClock}
            title={t('Ders numaralarının altına başlangıç saatlerini yaz')}
            onClick={() => setAvailClock(!availClock)}
          >
            <Clock {...ICON} />
            {t('Saatler')}
          </button>
        </Group>
      </div>
    );
  }

  if (ui.tab === 'program') {
    const exclusions = solverExclusions(programMask);
    const excludedTeachers = new Set(exclusions.teacherIds);
    const excludedClasses = new Set(exclusions.classIds);
    const pending = state.lessons
      .filter((lesson) => !excludedTeachers.has(lesson.teacherId) && !excludedClasses.has(lesson.classId))
      .reduce((sum, lesson) => sum + pendingBlocks(state, lesson).length, 0);
    // What the two destructive buttons are ABOUT: the hours that would go.
    // Pinned hours are not among them — nothing takes a pinned block down but
    // unpinning it — so counting them would make both questions overstate what
    // they ask for, and the count is the whole reason they are asked.
    const placements = activePlacements(state);
    const pinned = activePinned(state);
    const pinnedHours = Object.keys(pinned).length;
    const placed = Object.keys(placements).length - pinnedHours;
    const currentProgram = activeProgram(state);
    const masked = maskCount(programMask);
    const allPinCells = pinScopeCells(state, { kind: 'all' });
    const allPinned = allPinCells.length > 0 && allPinCells.every((key) => pinned[key] !== undefined);

    const askProgramName = async (initial: string, exceptId?: string) => {
      const name = await prompt({
        title: t('Program adı'),
        body: t('Aynı okul verilerini kullanan alternatif program için bir ad yazın.'),
        defaultValue: initial,
        inputLabel: t('Program adı'),
        confirmLabel: t('Kaydet'),
      });
      if (name === null) return null;
      const clean = validProgramName(state.programs, name, exceptId);
      if (clean !== null) return clean;
      await alert({
        title: name.trim() === '' ? t('Program adı boş olamaz') : t('Bu program adı zaten kullanılıyor'),
        tone: 'warn',
      });
      return null;
    };

    const copyCurrent = async () => {
      const name = await askProgramName(nextProgramName(state.programs));
      if (name === null) return;
      const source = activeProgram(state);
      manageProgram((d) => addProgram(d, {
        id: newId(),
        name,
        placements: { ...source.placements },
        pinned: { ...source.pinned },
      }));
    };

    const createBlank = async () => {
      const name = await askProgramName(nextProgramName(state.programs));
      if (name === null) return;
      manageProgram((d) => addProgram(d, blankProgram(newId(), name)));
    };

    const renameCurrent = async () => {
      const name = await askProgramName(currentProgram.name, currentProgram.id);
      if (name !== null) manageProgram((d) => renameProgram(d, currentProgram.id, name));
    };

    const deleteCurrent = async () => {
      if (state.programs.length <= 1) return;
      if (!(await confirm({
        title: t('{ad} programı silinecek', { ad: currentProgram.name }),
        body: t('{n} yerleşmiş saat ve {s} sabitleme silinecek. Ortak okul verileri kalır.', {
          n: Object.keys(currentProgram.placements).length,
          s: Object.keys(currentProgram.pinned).length,
        }),
        confirmLabel: t('Programı sil'),
        danger: true,
      }))) return;
      manageProgram((d) => removeProgram(d, currentProgram.id));
    };
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Program araçları')}>
        {/* Two positions, not one toggle: a single button saying "switch to the
            class view" tells you what the next click does, never where you are.

            FIRST, and back where it stood before the program library arrived
            and pushed it a group to the right: "öğretmen ve sınıftan seçimleri
            en solda eski yerinde olmalı". It earns the place on its own terms
            too — the leftmost group on the other six strips answers "what am I
            looking at", and on this screen that is the axis. */}
        <Group label="Görünüm">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className="btn"
              aria-pressed={ui.view === v.id}
              aria-label={t(v.label)}
              title={t(v.label)}
              onClick={() => ui.setView(v.id)}
            >
              {v.icon}
              {t(v.short)}
            </button>
          ))}
        </Group>

        <Sep />

        {/* Two buttons and no settings. What "spread over the week" or "prefer
            mornings" should mean is not knowable before a term has been laid
            out with this (principle 5). */}
        <Group label="Diz">
          {solver.running ? (
            <button className="btn danger" onClick={solver.stop}>
              <Square {...ICON} />{t('Durdur')}</button>
          ) : (
            <>
              <button
                className="btn primary"
                disabled={pending === 0}
                title={
                  pending === 0
                    ? t('Havuzda bekleyen ders yok')
                    : t('Havuzdaki dersleri kurallara uyarak yerleştirir')
                }
                onClick={() => solver.start(state, { keepPlaced: true, exclusions })}
              >
                <Play {...ICON} />
                {t('Otomatik diz ({n})', { n: pending })}
              </button>
              <button
                className="btn"
                disabled={placed === 0}
                title={t('Dizilmiş programı silip baştan dizer')}
                onClick={async () => {
                  if (
                    await confirm({
                      title: t('Dizilmiş {n} saatin tamamı silinecek', { n: placed }),
                      body:
                        pinnedHours === 0
                          ? t('Program sıfırdan dizilecek. Ctrl+Z ile geri alınabilir.')
                          : t(
                              'Sabitlenen {n} saat yerinde kalır, gerisi sıfırdan dizilir. Ctrl+Z ile geri alınabilir.',
                              { n: pinnedHours },
                            ),
                      confirmLabel: t('Baştan diz'),
                      danger: true,
                    })
                  ) {
                    solver.start(state, { keepPlaced: false, exclusions });
                  }
                }}
              >
                <RotateCcw {...ICON} />{t('Baştan diz')}</button>
            </>
          )}
        </Group>

        <Sep />

        {/* WHICH TIMETABLE — and everything that can be done to one — behind a
            SINGLE button.

            It arrived as three controls (a `<select>`, "Kopyasını kaydet" and a
            "Yönet" menu) sitting at the head of the strip, and that was two
            problems in one. It displaced the view switch, and it put a second
            library selector three rows under the plan selector in the top bar —
            two dropdowns, two different meanings of "which one am I editing",
            and no way to tell from either which was which.

            One button, showing the name of the timetable you are in. The list
            of them is a RadioGroup rather than a row of items, because picking
            one is a choice with a current answer, and Radix says so out loud
            (`aria-checked`) instead of leaving it to the tick. */}
        <Group label="Program">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="btn"
                disabled={solver.running}
                title={t('Program seç ve yönet')}
              >
                <Library {...ICON} />
                <span className="ribbon-ellipsis">{currentProgram.name}</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="menu" sideOffset={5} collisionPadding={8}>
                <DropdownMenu.RadioGroup
                  value={state.activeProgramId}
                  onValueChange={(id) => manageProgram((d) => switchProgram(d, id))}
                >
                  {state.programs.map((program) => (
                    <DropdownMenu.RadioItem
                      key={program.id}
                      className="menu-item"
                      value={program.id}
                    >
                      {/* A fixed slot, so the names line up whether or not the
                          tick is in it. */}
                      <span className="menu-mark" aria-hidden="true">
                        <DropdownMenu.ItemIndicator>
                          <Check size={15} strokeWidth={2.4} />
                        </DropdownMenu.ItemIndicator>
                      </span>
                      {program.name}
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
                <DropdownMenu.Separator className="menu-sep" />
                <DropdownMenu.Item className="menu-item" onSelect={() => void copyCurrent()}>
                  <Copy size={15} aria-hidden="true" />{t('Kopyasını kaydet')}
                </DropdownMenu.Item>
                <DropdownMenu.Item className="menu-item" onSelect={() => void createBlank()}>
                  <Plus size={15} aria-hidden="true" />{t('Boş program oluştur')}
                </DropdownMenu.Item>
                <DropdownMenu.Item className="menu-item" onSelect={() => void renameCurrent()}>
                  <Pencil size={15} aria-hidden="true" />{t('Yeniden adlandır')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="menu-sep" />
                <DropdownMenu.Item
                  className="menu-item danger"
                  disabled={state.programs.length <= 1}
                  onSelect={() => void deleteCurrent()}
                >
                  <Trash2 size={15} aria-hidden="true" />{t('Programı sil')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Group>

        {/* THE RIGHT-HAND END: what you are looking at, and the way back.
            The left of the strip builds the timetable (diz, baştan diz); this
            end changes how it is drawn and undoes it. A spacer rather than a
            separator, because what divides them is a job, not a hairline. */}
        <Spacer />

        {/* Density is a decision about the grid, taken while looking at the
            grid — it spent a version three clicks away in Ayarlar → Görünüm,
            where you cannot see what it does. It is still there too. */}
        <Group label="Yoğunluk">
          {DENSITIES.map((d) => (
            <button
              key={d.id}
              className="btn"
              aria-pressed={density === d.id}
              title={t(d.why)}
              onClick={() => {
                applyDensity(d.id);
                setDensity(d.id);
              }}
            >
              {d.icon}
              {t(d.label)}
            </button>
          ))}
        </Group>

        <Sep />

        {/* "Programı sıfırla" — asked for by name. It is NOT the same button as
            "Baştan diz": that one empties the grid and then fills it again, and
            there was no way to simply CLEAR it and start placing by hand.
            Undoable, and the question says so.

            It stands at the far end, past the spacer, and not beside the two
            buttons that fill the grid: the only two ways to lose a placement
            by accident are clicking it and clicking "Baştan diz", and they no
            longer sit next to each other. It is NOT renamed to "Sıfırla" —
            temel.spec.ts asserts no button anywhere is called that, because
            the one thing in this program that cannot be undone is. */}
        {/* THE WHOLE RIGHT-HAND END BEHIND ONE DOOR, and the reason is a
            MEASUREMENT. Three buttons in an equal-column group are as wide as
            the widest of them times three: at 150% — the scale this tool's
            reader actually uses — the group asked for 639 px of a strip that
            had 1920 px for 2061 px of content, and two of the three came out
            past the right edge. Not hidden: UNCLICKABLE (pitfall 48).

            One button now. What is behind it is also what belongs behind a
            door: locking a whole timetable, listing what has been put aside,
            and emptying the grid are all rare, and two of them are the kind of
            click that costs an afternoon. */}
        <Group label="Izgara">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="btn" disabled={solver.running} title={t('Izgara işlemleri')}>
                <Layers {...ICON} />{t('İşlemler')}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="menu" sideOffset={5} collisionPadding={8}>
                <DropdownMenu.Item
                  className="menu-item"
                  disabled={Object.keys(placements).length === 0}
                  onSelect={() => change((d) => togglePinScope(d, { kind: 'all' }))}
                >
                  {allPinned
                    ? <PinOff size={15} aria-hidden="true" />
                    : <Pin size={15} aria-hidden="true" />}
                  {allPinned
                    ? t('Tüm sabitlemeleri kaldır')
                    : t('Tüm programı sabitle')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="menu-sep" />
                {/* WHAT IS PUT ASIDE, and the count is the reason the label is
                    here rather than on a button of its own: with nothing set
                    aside there is nothing to list, and a disabled button that
                    says "(0)" spends a fifth of the strip saying so. */}
                <DropdownMenu.Label className="menu-label">
                  {t('Geçici görünüm ({n})', { n: masked })}
                </DropdownMenu.Label>
                {Object.entries(programMask.teachers).map(([id, mode]) => (
                  <DropdownMenu.Item key={`t-${id}`} className="menu-item" onSelect={() => setProgramMask((m) => setRowMask(m, 'teacher', id))}>
                    <Eye size={15} aria-hidden="true" />
                    {state.teachers.find((teacher) => teacher.id === id)?.name ?? id} · {mode === 'ghost' ? t('soluk') : t('gizli')}
                  </DropdownMenu.Item>
                ))}
                {Object.entries(programMask.classes).map(([id, mode]) => (
                  <DropdownMenu.Item key={`c-${id}`} className="menu-item" onSelect={() => setProgramMask((m) => setRowMask(m, 'class', id))}>
                    <Eye size={15} aria-hidden="true" />
                    {state.classes.find((group) => group.id === id)?.name ?? id} · {mode === 'ghost' ? t('soluk') : t('gizli')}
                  </DropdownMenu.Item>
                ))}
                {Object.entries(programMask.days).map(([name, mode]) => (
                  <DropdownMenu.Item key={`d-${name}`} className="menu-item" onSelect={() => setProgramMask((m) => setDayMask(m, name))}>
                    <Eye size={15} aria-hidden="true" />{name} · {mode === 'ghost' ? t('soluk') : t('gizli')}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Item
                  className="menu-item"
                  disabled={masked === 0}
                  onSelect={() => setProgramMask(() => ({ teachers: {}, classes: {}, days: {} }))}
                >
                  <Eye size={15} aria-hidden="true" />{t('Tümünü geri yükle')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="menu-sep" />
                <DropdownMenu.Item
                  className="menu-item danger"
                  disabled={placed === 0}
                  onSelect={async () => {
                    if (
                      await confirm({
                        title: t('Dizilmiş {n} saatin tamamı havuza dönecek', { n: placed }),
                        body:
                          pinnedHours === 0
                            ? t(
                                'Izgara boşalır; dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.',
                              )
                            : t(
                                'Sabitlenen {n} saat yerinde kalır. Dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.',
                                { n: pinnedHours },
                              ),
                        confirmLabel: t('Programı boşalt'),
                        danger: true,
                      })
                    ) {
                      // The pinned cells stay, and so do their pins. One rule
                      // with no exceptions: nothing takes a pinned block down
                      // but unpinning it.
                      change((d) => {
                        const currentPlacements = activePlacements(d);
                        return replaceActiveGrid(d, {
                          placements: Object.fromEntries(
                            Object.keys(activePinned(d))
                              .filter((k) => currentPlacements[k] !== undefined)
                              .map((k) => [k, currentPlacements[k]!]),
                          ),
                        });
                      });
                    }
                  }}
                >
                  <Eraser size={15} aria-hidden="true" />{t('Programı boşalt')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Group>
      </div>
    );
  }

  if (ui.tab === 'check') {
    // Kontrol used to have no strip at all, on the argument that it is a report
    // you read and there is nothing to do to it. That was true of its CONTENT
    // and false of the screen: the strip's height came and went with the tab,
    // so everything under it jumped every time this report was opened or left.
    //
    // Then it held a three-way FILTER, and the reader's verdict was that the
    // three read the same — the panel everyone comes for was in all three. Then
    // it held four `scrollIntoView` buttons, and those were worse: three of the
    // four aimed into the sticky right rail, which is pinned to the top of the
    // scrollport and scrolls inside itself, so the page could not move. No
    // pressed state, no movement, no message. "Alt sekmede bir şeyler seçiyoruz
    // ama değişmiyor" is exactly that.
    //
    // Now they CHOOSE THE PAGE. A click always changes the screen, the choice
    // stays visible in `aria-pressed`, and the report stopped being something
    // you scroll.
    const sorunlar = status.problems;
    const views: Array<{ id: CheckView; label: string; icon: ReactNode; title: string }> = [
      {
        id: 'problems',
        label: t('Sorunlar ({n})', { n: sorunlar }),
        icon: <TriangleAlert {...ICON} />,
        title: sorunlar === 0 ? t('Sorun yok') : t('Çözülmesi gereken satırlar'),
      },
      {
        id: 'teachers',
        label: t('Öğretmenler'),
        icon: KIND_ICON.teacher,
        title: t('Öğretmen yükleri'),
      },
      {
        id: 'classes',
        label: t('Sınıflar'),
        icon: KIND_ICON.class,
        title: t('Sınıf yükleri'),
      },
      {
        id: 'rooms',
        label: t('Derslikler'),
        icon: KIND_ICON.room,
        title: t('Derslik yükleri'),
      },
    ];
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Kontrol araçları')}>
        <Group label={t('Göster')}>
          {views.map((v) => (
            <button
              key={v.id}
              className="btn"
              aria-pressed={v.id === ui.checkView}
              title={v.title}
              onClick={() => ui.setCheckView(v.id)}
            >
              {v.icon}
              {v.label}
            </button>
          ))}
        </Group>

        <Spacer />

        {/* The numbers themselves, not the top bar's chip repeated: the chip
            says which of three states the week is in, and this says how many of
            what. It is a READING — no button, nothing to press. */}
        <Group label="Durum">
          <span className="ribbon-value">
            <span className={`badge ${status.blocked > 0 ? 'impossible' : 'ok'}`}>
              {t('{n} engel', { n: status.blocked })}
            </span>
            <span className={`badge ${status.warnings > 0 ? 'tight' : 'ok'}`}>
              {t('{n} uyarı', { n: status.warnings })}
            </span>
          </span>
        </Group>
      </div>
    );
  }

  if (ui.tab === 'print') {
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Yazdırma araçları')}>
        {/* The two kinds of sheet are drawn with the same two symbols they carry
            in Kurulum, Müsaitlik and the entity panel — one drawing per thing. */}
        <Group label="İçerik">
          <button
            className="btn"
            aria-pressed={ui.scope === 'teachers'}
            onClick={() => ui.setScope('teachers')}
          >
            {KIND_ICON.teacher}
            {t('Öğretmenler')}
          </button>
          <button
            className="btn"
            aria-pressed={ui.scope === 'classes'}
            onClick={() => ui.setScope('classes')}
          >
            {KIND_ICON.class}
            {t('Sınıflar')}
          </button>
          <button
            className="btn"
            aria-pressed={ui.scope === 'both'}
            onClick={() => ui.setScope('both')}
          >
            <Layers {...ICON} />{t('İkisi de')}</button>
        </Group>
        <Sep />
        <Group label="Renk">
          <button
            className="btn"
            aria-pressed={ui.colored}
            title={t('Öğretmen renkleri kâğıda basılır')}
            onClick={() => ui.setColored(!ui.colored)}
          >
            <PaletteIcon {...ICON} />{t('Renkli bas')}</button>
        </Group>
        {/* "Yazdır (N sayfa)" is NOT here: the N comes from the tick lists in
            the panel, and a button that says how many pages belongs next to the
            list that decides it. The strip carries what you are looking at. */}
      </div>
    );
  }

  // settings
  const rules = Object.values(state.settings.rules);
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Ayar bölümleri')}>
      <Group label="Bölüm">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className="btn"
            aria-pressed={s.id === ui.section}
            onClick={() => ui.setSection(s.id)}
          >
            {s.icon}
            {t(s.label)}
          </button>
        ))}
      </Group>

      <Spacer />

      {/* WHAT THIS SECTION IS ABOUT, at the right-hand end — the one place on
          the six strips that was empty. ("Ayarlardaki özel sectionlara özgü
          ayarlar o sectionun alt şeridinde sağ üstte gözüksün.")

          Four of the five STATE and one ASKS, and the split is not a mood: a
          strip that repeats a control standing four inches under it is the
          "ribbon of everything" this file's header warns about. Ayarlar keeps
          every control in its panels, so what the strip can add is the reading
          — how many days, how strict, which plan, which build.

          Görünüm is the exception and the reason is measurable: it is the one
          section long enough to SCROLL, and the theme is the first panel on it.
          By the time you are at Hareket or Dil the two buttons are off the top
          of the screen, and the strip does not move. */}
      {ui.section === 'appearance' ? (
        <Group label="Tema">
          {THEMES.map((x) => (
            <button
              key={x.id}
              className="btn"
              aria-pressed={x.id === theme}
              title={t('{ad} temaya geç', { ad: t(x.label) })}
              onClick={() => {
                applyTheme(x.id);
                setTheme(x.id);
              }}
            >
              {x.icon}
              {t(x.label)}
            </button>
          ))}
        </Group>
      ) : ui.section === 'school' ? (
        <Group label="Hafta">
          <span className="ribbon-value">
            {t('{n} gün', { n: state.settings.days.length })}
            {' · '}
            {t('{n} ders', { n: state.settings.hours.length })}
          </span>
        </Group>
      ) : ui.section === 'rules' ? (
        <Group label="Seviye">
          <span className="ribbon-value">
            <span className={`badge ${rules.filter((r) => r === 'block').length > 0 ? 'impossible' : 'ok'}`}>
              {t('{n} engelle', { n: rules.filter((r) => r === 'block').length })}
            </span>
            <span className={`badge ${rules.filter((r) => r === 'warn').length > 0 ? 'tight' : 'ok'}`}>
              {t('{n} uyar', { n: rules.filter((r) => r === 'warn').length })}
            </span>
            <span className="badge ok">
              {t('{n} kapalı', { n: rules.filter((r) => r === 'off').length })}
            </span>
          </span>
        </Group>
      ) : ui.section === 'plans' ? (
        <Group label="Açık plan">
          <span className="ribbon-value">{planName}</span>
        </Group>
      ) : (
        <Group label="Sürüm">
          <span className="ribbon-value">{surumEtiketi()}</span>
        </Group>
      )}
    </div>
  );
}
