// Program: the view, the automatic run, which timetable, and how the grid is drawn.

import type React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Check,
  Copy,
  Eraser,
  Eye,
  Layers,
  Library,
  Maximize2,
  Minimize2,
  Palette as PaletteIcon,
  Pencil,
  Pin,
  PinOff,
  Play,
  Plus,
  RotateCcw,
  Rows3,
  Square,
  Trash2,
} from 'lucide-react';
import { applyDensity, type Density, type ProgramColorMode, type View } from '../../platform/prefs';
import { setDayMask, setRowMask } from '../../pure/program';
import {
  activeProgram,
  addProgram,
  blankProgram,
  keepPinnedOnly,
  nextProgramName,
  removeProgram,
  renameProgram,
  switchProgram,
  validProgramName,
} from '../../pure/grid';
import { togglePinScope } from '../../pure/constraints';
import { describeStrip } from '../../pure/program';
import { newId } from '../../pure/entities';
import { classIcon, teacherIcon } from '../program';
import { Group, ICON, Sep, Spacer, type StripContext } from './parts';

/**
 * The two views. `short` is what the button shows, `label` what it is called.
 *
 * They used to be icons alone, on the grounds that the sentence under the strip
 * explains the axis anyway. It does — once you have read it. `aria-label` stays
 * the full phrase because it is the name the suite and a screen reader find
 * them by, and WCAG's Label in Name is satisfied by the visible word being
 * contained in it ("Öğretmen" inside "Öğretmen görünümü").
 */
const VIEWS: Array<{ id: View; label: string; short: string; icon: React.ReactElement }> = [
  { id: 'teacher', label: 'Öğretmen görünümü', short: 'Öğretmen', icon: teacherIcon },
  { id: 'class', label: 'Sınıf görünümü', short: 'Sınıf', icon: classIcon },
];

const PROGRAM_COLORS: Array<{ id: ProgramColorMode; label: string }> = [
  { id: 'teacher', label: 'Öğretmene göre' },
  { id: 'class', label: 'Sınıfa göre' },
  { id: 'room', label: 'Dersliğe göre' },
  { id: 'subject', label: 'Branşa göre' },
];

/** Three densities, and the symbols say which way each one goes. */
const DENSITIES: Array<{ id: Density; label: string; icon: React.ReactElement; why: string }> = [
  {
    id: 'ferah',
    label: 'Ferah',
    icon: <Maximize2 {...ICON} />,
    why: 'Hücre en büyük, kartın alt satırı tam boyda',
  },
  {
    id: 'rahat',
    label: 'Rahat',
    icon: <Rows3 {...ICON} />,
    why: 'Hücre geniş, ders saatleri görünür',
  },
  {
    id: 'sigdir',
    label: 'Sığdır',
    icon: <Minimize2 {...ICON} />,
    why: 'Haftanın tamamı ekrana sığar, ders saatleri gizlenir',
  },
];

export function programStrip({
  ui,
  state,
  change,
  manageProgram,
  solver,
  programMask,
  setProgramMask,
  density,
  setDensity,
  programColor,
  setProgramColor,
  t,
  dialogs: { confirm, prompt, alert },
}: StripContext): React.ReactElement {
  const { exclusions, pending, placed, pinnedHours, gridEmpty, masked, allPinned } = describeStrip(
    state,
    programMask,
  );
  const currentProgram = activeProgram(state);

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
      title:
        name.trim() === '' ? t('Program adı boş olamaz') : t('Bu program adı zaten kullanılıyor'),
      tone: 'warn',
    });
    return null;
  };

  const copyCurrent = async () => {
    const name = await askProgramName(nextProgramName(state.programs));
    if (name === null) return;
    const source = activeProgram(state);
    manageProgram((d) =>
      addProgram(d, {
        id: newId(),
        name,
        placements: { ...source.placements },
        pinned: { ...source.pinned },
      }),
    );
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
    if (
      !(await confirm({
        title: t('{ad} programı silinecek', { ad: currentProgram.name }),
        body: t('{n} yerleşmiş saat ve {s} sabitleme silinecek. Ortak okul verileri kalır.', {
          n: Object.keys(currentProgram.placements).length,
          s: Object.keys(currentProgram.pinned).length,
        }),
        confirmLabel: t('Programı sil'),
        danger: true,
      }))
    )
      return;
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
          out with this (the former rule against guessed features). */}
      <Group label="Diz">
        {solver.running || solver.advice?.searching === true ? (
          <button className="btn danger" onClick={solver.stop}>
            <Square {...ICON} />
            {t('Durdur')}
          </button>
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
              <RotateCcw {...ICON} />
              {t('Baştan diz')}
            </button>
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
            <button className="btn" disabled={solver.running} title={t('Program seç ve yönet')}>
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
                  <DropdownMenu.RadioItem key={program.id} className="menu-item" value={program.id}>
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
                <Copy size={15} aria-hidden="true" />
                {t('Kopyasını kaydet')}
              </DropdownMenu.Item>
              <DropdownMenu.Item className="menu-item" onSelect={() => void createBlank()}>
                <Plus size={15} aria-hidden="true" />
                {t('Boş program oluştur')}
              </DropdownMenu.Item>
              <DropdownMenu.Item className="menu-item" onSelect={() => void renameCurrent()}>
                <Pencil size={15} aria-hidden="true" />
                {t('Yeniden adlandır')}
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="menu-sep" />
              <DropdownMenu.Item
                className="menu-item danger"
                disabled={state.programs.length <= 1}
                onSelect={() => void deleteCurrent()}
              >
                <Trash2 size={15} aria-hidden="true" />
                {t('Programı sil')}
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

      <Group label="Renk">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="btn" title={t('Kartların renk ölçütü')}>
              <PaletteIcon {...ICON} />
              {t(PROGRAM_COLORS.find((x) => x.id === programColor)?.label ?? 'Öğretmene göre')}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="menu" sideOffset={5} collisionPadding={8}>
              <DropdownMenu.RadioGroup
                value={programColor}
                onValueChange={(value) => setProgramColor(value as ProgramColorMode)}
              >
                {PROGRAM_COLORS.map((option) => (
                  <DropdownMenu.RadioItem key={option.id} className="menu-item" value={option.id}>
                    <span className="menu-mark" aria-hidden="true">
                      <DropdownMenu.ItemIndicator>
                        <Check size={15} strokeWidth={2.4} />
                      </DropdownMenu.ItemIndicator>
                    </span>
                    {t(option.label)}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </Group>

      <Sep />

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
          the widest of them times three: at 150%, the scale where the strip
          is under the most pressure, the group asked for 639 px of a strip
          that had 1920 px for 2061 px of content, and two of the three came
          out past the right edge. Not hidden: UNCLICKABLE (pitfall 48).
          The strip has a declared order for what it gives up since then
          (LAYOUT.md, strip rule 6), but a group this rare belongs behind a
          door on its own terms.

          One button now. What is behind it is also what belongs behind a
          door: locking a whole timetable, listing what has been put aside,
          and emptying the grid are all rare, and two of them are the kind of
          click that costs an afternoon. */}
      <Group label="Izgara">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="btn" disabled={solver.running} title={t('Izgara işlemleri')}>
              <Layers {...ICON} />
              {t('İşlemler')}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="menu" sideOffset={5} collisionPadding={8}>
              <DropdownMenu.Item
                className="menu-item"
                disabled={gridEmpty}
                onSelect={() => change((d) => togglePinScope(d, { kind: 'all' }))}
              >
                {allPinned ? (
                  <PinOff size={15} aria-hidden="true" />
                ) : (
                  <Pin size={15} aria-hidden="true" />
                )}
                {allPinned ? t('Tüm sabitlemeleri kaldır') : t('Tüm programı sabitle')}
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
                <DropdownMenu.Item
                  key={`t-${id}`}
                  className="menu-item"
                  onSelect={() => setProgramMask((m) => setRowMask(m, 'teacher', id))}
                >
                  <Eye size={15} aria-hidden="true" />
                  {state.teachers.find((teacher) => teacher.id === id)?.name ?? id} ·{' '}
                  {mode === 'ghost' ? t('soluk') : t('gizli')}
                </DropdownMenu.Item>
              ))}
              {Object.entries(programMask.classes).map(([id, mode]) => (
                <DropdownMenu.Item
                  key={`c-${id}`}
                  className="menu-item"
                  onSelect={() => setProgramMask((m) => setRowMask(m, 'class', id))}
                >
                  <Eye size={15} aria-hidden="true" />
                  {state.classes.find((group) => group.id === id)?.name ?? id} ·{' '}
                  {mode === 'ghost' ? t('soluk') : t('gizli')}
                </DropdownMenu.Item>
              ))}
              {Object.entries(programMask.days).map(([name, mode]) => (
                <DropdownMenu.Item
                  key={`d-${name}`}
                  className="menu-item"
                  onSelect={() => setProgramMask((m) => setDayMask(m, name))}
                >
                  <Eye size={15} aria-hidden="true" />
                  {name} · {mode === 'ghost' ? t('soluk') : t('gizli')}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Item
                className="menu-item"
                disabled={masked === 0}
                onSelect={() => setProgramMask(() => ({ teachers: {}, classes: {}, days: {} }))}
              >
                <Eye size={15} aria-hidden="true" />
                {t('Tümünü geri yükle')}
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
                    change(keepPinnedOnly);
                  }
                }}
              >
                <Eraser size={15} aria-hidden="true" />
                {t('Programı boşalt')}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </Group>
    </div>
  );
}
