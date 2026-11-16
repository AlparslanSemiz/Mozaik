// Program: the view, "Programı yap", and everything rarer behind Daha fazla.

import type React from 'react';
import {
  Copy,
  Eraser,
  Eye,
  Maximize2,
  Minimize2,
  Palette as PaletteIcon,
  Pin,
  PinOff,
  Play,
  RotateCcw,
  Rows3,
  Shuffle,
  Square,
  Trash2,
} from 'lucide-react';
import { applyDensity, type Density, type ProgramColorMode, type View } from '../../platform/prefs';
import { setDayMask, setRowMask } from '../../pure/program';
import { activePlacements, activeProgram, keepPinnedOnly, removeProgram } from '../../pure/grid';
import { sanitize, togglePinScope } from '../../pure/constraints';
import { describeStrip } from '../../pure/program';
import { classIcon, teacherIcon } from '../program';
import { MoreItem, MoreLabel, MoreMenu, MoreRadio, MoreSep, MoreSub } from '../common';
import { Group, ICON, Sep, Spacer, type StripContext } from './parts';
import type { State } from '../../leaf/model';

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
    why: 'Hücre en büyük, dersin alt satırı tam boyda',
  },
  {
    id: 'rahat',
    label: 'Rahat',
    icon: <Rows3 {...ICON} />,
    why: 'Hücre geniş, başlangıç saatleri görünür',
  },
  {
    id: 'sigdir',
    label: 'Sığdır',
    icon: <Minimize2 {...ICON} />,
    why: 'Programın tamamı ekrana sığar, başlangıç saatleri gizlenir',
  },
];

/**
 * Which "Başka bir dizilim" this is: every press asks the search for the next
 * seed, so the same data gives a new week each time, and the same sequence of
 * weeks after a reload. Module-level and not a hook: `programStrip` is called
 * as a function, once per render of whichever strip is open.
 */
let anotherSeed = 0;
/** The week the last "Başka bir dizilim" put on the grid. */
let anotherMade: State | null = null;

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
  copyPlan,
  notify,
  undoIf,
  keepBefore,
  strip,
}: StripContext): React.ReactElement {
  const { exclusions, pending, placed, pinnedHours, gridEmpty, masked, allPinned } =
    strip ?? describeStrip(state, programMask);
  const currentProgram = activeProgram(state);
  /** "Yeniden yap" and "Başka bir dizilim" say the same thing when they land. */
  const relaidNotice = (next: State) => {
    const said =
      pinnedHours === 0
        ? t('Program yeniden yapıldı.')
        : t('Program yeniden yapıldı, sabitlenen {n} saat yerinde kaldı.', {
            n: pinnedHours,
          });
    notify(said, 'info', { label: t('Geri al'), run: () => undoIf(next) });
  };

  // A file from before K2 may hold several programs in one plan. They are
  // switched in the top bar's plan picker, and the open one can go: no
  // question (TODO SD1), "Geri al" brings it back with every hour in it.
  const deleteCurrent = () => {
    if (state.programs.length <= 1) return;
    const hours = Object.keys(currentProgram.placements).length;
    const said =
      hours === 0
        ? t('{ne} silindi.', { ne: currentProgram.name })
        : t('{ne} silindi, yerleşmiş {n} saati de kalktı.', {
            ne: currentProgram.name,
            n: hours,
          });
    const next = sanitize(removeProgram(state, currentProgram.id));
    keepBefore(state, said);
    manageProgram((d) => (d === state ? next : removeProgram(d, currentProgram.id)), said);
    notify(said, 'info', { label: t('Geri al'), run: () => undoIf(next) });
  };
  // The same condition that puts "Durdur" in Programı yap's place: a run, or
  // the suggestion search after it. Nothing that starts or changes a run is
  // offered meanwhile.
  const busy = solver.running || solver.advice?.searching === true;
  const rebuild = () => {
    // No question since 2026-11-15 (TODO SD1): the run's answer lands as ONE
    // step of the history (useSolver's `finish`), so its notice can offer
    // "Geri al" for the whole of it. Nothing on the grid moves until the run
    // ends, and "Durdur" stands in "Programı yap"'s place while it runs.
    keepBefore(state, t('Program yeniden yapıldı.'));
    solver.start(state, { keepPlaced: false, exclusions }, relaidNotice);
  };
  // "Başka bir dizilim" (2026-11-16, main): the same rules, another of the
  // many weeks they allow, a different one on every press. Behind Daha fazla
  // beside Yeniden yap: the screen's one primary is "Programı yap".
  const another = () => {
    anotherSeed++;
    // The week before the FIRST press is the one worth keeping: a second press
    // would push the hand-made week out of the one slot with a week this button
    // made (review, 2026-11-16).
    if (state !== anotherMade) keepBefore(state, t('Program yeniden yapıldı.'));
    solver.start(state, { keepPlaced: false, exclusions, seed: anotherSeed }, (next) => {
      anotherMade = next;
      relaidNotice(next);
    });
  };
  // `relay`: when the kept week leaves a lesson nowhere to go, the unpinned
  // week is laid out again close to itself. Whatever moved is said, with the
  // undo for it, and the week before is kept where a reload finds it.
  const make = () =>
    solver.start(state, { keepPlaced: true, exclusions, relay: true }, (next) => {
      const before = activePlacements(state);
      const after = activePlacements(next);
      let moved = 0;
      for (const key in before) if (after[key] !== before[key]) moved++;
      if (moved === 0) return;
      const said = t('Program yapıldı, {n} saat yer değiştirdi.', { n: moved });
      keepBefore(state, said);
      notify(said, 'info', { label: t('Geri al'), run: () => undoIf(next) });
    });
  const clearGrid = () => {
    // No question since SD1 (2026-11-15): it is undone with one click, so it
    // happens and the notice offers that click. The pinned cells stay, and so
    // do their pins: nothing takes a pinned block down but unpinning it.
    const next = keepPinnedOnly(state);
    keepBefore(state, t('Dizilmiş {n} saat havuza döndü.', { n: placed }));
    change((d) => (d === state ? next : keepPinnedOnly(d)));
    notify(
      pinnedHours === 0
        ? t('Dizilmiş {n} saat havuza döndü.', { n: placed })
        : t('Dizilmiş saatler havuza döndü, sabitlenen {n} saat yerinde.', {
            n: pinnedHours,
          }),
      'info',
      { label: t('Geri al'), run: () => undoIf(next) },
    );
  };
  const maskName = (mode: string) => (mode === 'ghost' ? t('soluk') : t('gizli'));

  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Program')}>
      {/* What am I looking at: the axis. FIRST, in its old place ("öğretmen
          ve sınıftan seçimleri en solda eski yerinde olmalı"). A segment,
          never a fill: the screen's one filled button is the next one. */}
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

      {/* THE screen's one primary (Sadeleşme, phase 1, 2026-11-16): it was
          the old "Otomatik diz (N kart)" beside an equally loud "Baştan diz". The
          count lives in the pool and in the status chip; "Yeniden yap" is
          behind Daha fazla, because emptying a laid-out week in one click is
          not the click that should be next to the everyday one. */}
      <Group label="Diz">
        {solver.running || solver.advice?.searching === true ? (
          <button className="btn danger" onClick={solver.stop}>
            <Square {...ICON} />
            {t('Durdur')}
          </button>
        ) : (
          <button
            className="btn primary"
            disabled={pending === 0}
            title={
              pending === 0
                ? t('Yerleşmeyi bekleyen ders yok')
                : t('Yerleşmeyen dersleri kurallara uyarak yerleştirir')
            }
            onClick={make}
          >
            <Play {...ICON} />
            {t('Programı yap')}
          </button>
        )}
      </Group>

      <Spacer />

      {/* EVERYTHING ELSE behind the one door every strip has, at the same
          right-hand end. The seçenek list, the colour, the density, the
          bulk pins, the session's set-aside rows and emptying the grid are
          all rare, and two of them are the kind of click that costs an
          afternoon. */}
      <MoreMenu>
        <MoreItem icon={<RotateCcw size={15} />} disabled={placed === 0 || busy} onSelect={rebuild}>
          {t('Yeniden yap')}
        </MoreItem>
        <MoreItem
          icon={<Shuffle size={15} />}
          disabled={(placed === 0 && pending === 0) || busy}
          onSelect={another}
        >
          {t('Başka bir dizilim')}
        </MoreItem>
        <MoreSep />
        {/* A second arrangement is a second PLAN (K2, 2026-11-16): one word
            for one thing, and the switcher in the top bar appears with it. */}
        <MoreItem icon={<Copy size={15} />} disabled={busy} onSelect={copyPlan}>
          {t('Bu programın kopyası')}
        </MoreItem>
        {state.programs.length > 1 && (
          <MoreItem icon={<Trash2 size={15} />} danger disabled={busy} onSelect={deleteCurrent}>
            {currentProgram.name} · {t('Sil')}
          </MoreItem>
        )}
        <MoreSub icon={<PaletteIcon size={15} />} label={t('Renk')}>
          <MoreRadio
            value={programColor}
            onChange={setProgramColor}
            options={PROGRAM_COLORS.map((o) => ({ id: o.id, label: t(o.label) }))}
          />
        </MoreSub>
        <MoreSub icon={<Rows3 size={15} />} label={t('Yoğunluk')}>
          <MoreRadio
            value={density}
            onChange={(next) => {
              applyDensity(next);
              setDensity(next);
            }}
            options={DENSITIES.map((d) => ({ id: d.id, label: t(d.label) }))}
          />
        </MoreSub>
        <MoreSep />
        <MoreItem
          icon={allPinned ? <PinOff size={15} /> : <Pin size={15} />}
          disabled={gridEmpty || busy}
          onSelect={() => change((d) => togglePinScope(d, { kind: 'all' }))}
        >
          {allPinned ? t('Tüm sabitlemeleri kaldır') : t('Tüm programı sabitle')}
        </MoreItem>
        {/* What is put aside for this session. Only when something is: an
            empty heading with "(0)" was a line saying nothing. */}
        {masked > 0 && (
          <>
            <MoreSep />
            <MoreLabel>{t('Geçici görünüm ({n})', { n: masked })}</MoreLabel>
            {Object.entries(programMask.teachers).map(([id, mode]) => (
              <MoreItem
                key={`t-${id}`}
                icon={<Eye size={15} />}
                disabled={busy}
                onSelect={() => setProgramMask((m) => setRowMask(m, 'teacher', id))}
              >
                {state.teachers.find((teacher) => teacher.id === id)?.name ?? id} · {maskName(mode)}
              </MoreItem>
            ))}
            {Object.entries(programMask.classes).map(([id, mode]) => (
              <MoreItem
                key={`c-${id}`}
                icon={<Eye size={15} />}
                disabled={busy}
                onSelect={() => setProgramMask((m) => setRowMask(m, 'class', id))}
              >
                {state.classes.find((group) => group.id === id)?.name ?? id} · {maskName(mode)}
              </MoreItem>
            ))}
            {Object.entries(programMask.days).map(([name, mode]) => (
              <MoreItem
                key={`d-${name}`}
                icon={<Eye size={15} />}
                disabled={busy}
                onSelect={() => setProgramMask((m) => setDayMask(m, name))}
              >
                {name} · {maskName(mode)}
              </MoreItem>
            ))}
            <MoreItem
              icon={<Eye size={15} />}
              disabled={busy}
              onSelect={() => setProgramMask(() => ({ teachers: {}, classes: {}, days: {} }))}
            >
              {t('Tümünü geri yükle')}
            </MoreItem>
          </>
        )}
        <MoreSep />
        <MoreItem
          icon={<Eraser size={15} />}
          danger
          disabled={placed === 0 || busy}
          onSelect={clearGrid}
        >
          {t('Programı boşalt')}
        </MoreItem>
      </MoreMenu>
    </div>
  );
}
