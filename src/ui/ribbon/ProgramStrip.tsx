// Program: the view, "Kalanı diz", and everything rarer behind Daha fazla.

import type React from 'react';
import { useEffect, useRef } from 'react';
import {
  Check,
  Eraser,
  Palette as PaletteIcon,
  Pin,
  PinOff,
  Play,
  RotateCcw,
  Square,
  Trash2,
} from 'lucide-react';
import type { ProgramColorMode, View } from '../../platform/prefs';
import { activeProgram, keepPinnedOnly, removeProgram } from '../../pure/grid';
import { sanitize, togglePinAll } from '../../pure/constraints';
import { describeStrip, movedNotice } from '../../pure/program';
import { classIcon, teacherIcon } from '../program';
import { DateChip } from '../dated';
import { MoreItem, MoreMenu, MoreRadio, MoreSep, MoreSub } from '../common';
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

type MainKind = 'stop' | 'fix' | 'done' | 'make' | 'none';

/**
 * The strip's one main control. Each state is its own keyed element, so a
 * button never turns into another one under the same DOM node (a second Enter
 * on "Kalanı diz" used to land on the "Yeniden yap" that took its place), and
 * when the control the keyboard was on goes away, focus follows to what
 * replaced it instead of falling to the page (audit, 2026-11-17).
 */
function MainAction({
  kind,
  onStop,
  onRebuild,
  onMake,
  t,
}: {
  kind: MainKind;
  onStop: () => void;
  onRebuild: () => void;
  onMake: () => void;
  t: StripContext['t'];
}) {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  /**
   * Until when focus follows the control: set by a press that came from the
   * focused main control, open-ended while the run shows "Durdur", and a moment
   * after it (the strip's counts settle a render later, so the control may change
   * once more before it is final). 0: not following.
   */
  const following = useRef(0);
  /** A rebuild or stop press this soon after focus arrived is a held or repeated Enter. */
  const guardUntil = useRef(0);
  useEffect(() => {
    if (following.current === 0) return;
    const now = performance.now();
    if (kind === 'stop') following.current = Number.POSITIVE_INFINITY;
    else if (following.current === Number.POSITIVE_INFINITY) following.current = now + 1500;
    if (now > following.current) {
      following.current = 0;
      return;
    }
    const active = document.activeElement;
    // Only when focus really fell off: never steal it from somewhere else.
    if (active === null || active === document.body) {
      refs.current[kind]?.focus();
      if (kind === 'fix' || kind === 'stop') guardUntil.current = now + 700;
    } else if (!Object.values(refs.current).includes(active as HTMLElement)) {
      following.current = 0;
    }
    if (kind === 'done') following.current = 0;
  }, [kind]);
  const press = (e: React.MouseEvent<HTMLElement>, run: () => void) => {
    following.current = document.activeElement === e.currentTarget ? performance.now() + 1500 : 0;
    run();
  };
  const set = (k: MainKind) => (el: HTMLElement | null) => {
    refs.current[k] = el;
  };
  if (kind === 'stop')
    return (
      <button
        key="stop"
        ref={set('stop')}
        className="btn danger"
        onClick={(e) => {
          // The Enter that pressed "Kalanı diz", still held, repeats on the
          // button the focus has just moved to: it must not stop the run.
          // A pointer press (detail > 0) is never held.
          if (e.detail === 0 && performance.now() < guardUntil.current) return;
          onStop();
        }}
      >
        <Square {...ICON} />
        {t('Durdur')}
      </button>
    );
  if (kind === 'fix')
    // Nothing waits, yet the week is broken (a lesson on an hour closed
    // since, a hard rule broken): "Kalanı diz" had nothing to do and the way
    // out was behind Daha fazla. Not for a "Tercih" warning: a rebuild need not
    // mend that, and it would take every unpinned hand placement with it.
    return (
      <button
        key="fix"
        ref={set('fix')}
        className="btn primary"
        onClick={(e) => {
          if (performance.now() < guardUntil.current) return;
          press(e, onRebuild);
        }}
      >
        <RotateCcw {...ICON} />
        {t('Yeniden yap')}
      </button>
    );
  if (kind === 'done')
    // Nothing waits and the week is sound: a READING and not a dimmed button.
    // Focusable, so focus can land on it when the button it replaced goes.
    return (
      <span key="done" ref={set('done')} className="strip-done" tabIndex={-1}>
        <Check {...ICON} />
        {t('Hepsi yerleşti')}
      </span>
    );
  if (kind === 'none') return null;
  return (
    <button
      key="make"
      ref={set('make')}
      className="btn primary"
      title={t(
        'Bekleyen dersleri kurallara uyarak yerleştirir; sabitlenenlere dokunmaz (elle koyduklarınız sabitlenir)',
      )}
      onClick={(e) => press(e, onMake)}
    >
      <Play {...ICON} />
      {t('Kalanı diz')}
    </button>
  );
}

/**
 * Which "Yeniden yap" this is: every press asks the search for the next seed,
 * so the same data gives a new week each time, and the same sequence of weeks
 * after a reload (denetim, 2026-11-16: it was a second button, "Başka bir
 * dizilim"). Module-level and not a hook: `programStrip` is called as a
 * function, once per render of whichever strip is open.
 */
let rebuildSeed = 0;
/** The week the last "Yeniden yap" put on the grid. */
let rebuilt: State | null = null;

export function programStrip({
  ui,
  state,
  change,
  manageProgram,
  solver,
  programColor,
  setProgramColor,
  t,
  notify,
  undoIf,
  keepBefore,
  strip,
  status,
}: StripContext): React.ReactElement {
  const { pending, placed, pinnedHours, gridEmpty, allPinned } = strip ?? describeStrip(state);
  const currentProgram = activeProgram(state);
  /** What "Yeniden yap" says when it lands. */
  const relaidNotice = (next: State) => {
    const said =
      pinnedHours === 0
        ? t('Program yeniden yapıldı.')
        : t('Program yeniden yapıldı, sabitlenen {n} saat yerinde kaldı.', {
            n: pinnedHours,
          });
    notify(said, 'info', {
      label: t('Önceki programa dön'),
      run: () => undoIf(next),
      expected: next,
    });
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
    notify(said, 'info', { label: t('Geri al'), run: () => undoIf(next), expected: next });
  };
  // The same condition that puts "Durdur" in Kalanı diz's place: a run, or
  // the suggestion search after it. Nothing that starts or changes a run is
  // offered meanwhile.
  const busy = solver.running || solver.advice?.searching === true;
  const rebuild = () => {
    // No question since 2026-11-15 (TODO SD1): the run's answer lands as ONE
    // step of the history (useSolver's `finish`), so its notice can offer
    // "Geri al" for the whole of it. Nothing on the grid moves until the run
    // ends, and "Durdur" stands in the main button's place while it runs.
    // Kept QUIETLY: a relaid week is no deletion, and the next start's strip
    // offering "Son silmeyi geri al" for it was alarming (walkthrough, 2026-11-16).
    //
    // Another of the many weeks the rules allow on EVERY press (the seed), so
    // one button is both "mend it" and "give me another": "Başka bir dizilim"
    // went on 2026-11-16. The week before the FIRST press is the one worth
    // keeping: a second press would push the hand-made week out of the one
    // slot with a week this button made (review, 2026-11-16).
    rebuildSeed++;
    if (state !== rebuilt) keepBefore(state, t('Program yeniden yapıldı.'), true);
    solver.start(state, { keepPlaced: false, seed: rebuildSeed }, (next) => {
      rebuilt = next;
      relaidNotice(next);
    });
  };
  // "Kalanı diz": whatever stands on the grid stays (a hand placement is
  // pinned, A1) and the rest is laid out around it. `relay`: when the kept
  // week leaves a lesson nowhere to go, the UNPINNED week is laid out again
  // close to itself; a pinned block never moves (`preservedPlacements`).
  // Whatever moved is said by name, with the undo for it, and the week before
  // is kept where a reload finds it.
  const make = () =>
    solver.start(state, { keepPlaced: true, relay: true }, (next) => {
      const said = movedNotice(state, next);
      if (said === '') return;
      keepBefore(state, said, true);
      notify(said, 'info', {
        label: t('Önceki programa dön'),
        run: () => undoIf(next),
        expected: next,
      });
    });
  const clearGrid = () => {
    // No question since SD1 (2026-11-15): it is undone with one click, so it
    // happens and the notice offers that click. The pinned cells stay, and so
    // do their pins: nothing takes a pinned block down but unpinning it.
    const next = keepPinnedOnly(state);
    keepBefore(state, t('Yerleşmiş {n} saat havuza döndü.', { n: placed }));
    change((d) => (d === state ? next : keepPinnedOnly(d)));
    notify(
      pinnedHours === 0
        ? t('Yerleşmiş {n} saat havuza döndü.', { n: placed })
        : t('Yerleşmiş saatler havuza döndü, sabitlenen {n} saat yerinde.', {
            n: pinnedHours,
          }),
      'info',
      { label: t('Geri al'), run: () => undoIf(next), expected: next },
    );
  };

  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Program')}>
      {/* What am I looking at: the axis. FIRST, in its old place ("öğretmen
          ve sınıftan seçimleri en solda eski yerinde olmalı"). A segment,
          never a fill: the screen's one filled button is the next one. */}
      <Group label="Göster">
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
          not the click that should be next to the everyday one, unless the
          week is broken in a way a rebuild mends (below). */}
      <Group>
        <MainAction
          kind={
            busy
              ? 'stop'
              : pending === 0 && placed > 0 && status.stranded + status.blocked > 0
                ? 'fix'
                : state.lessons.length === 0
                  ? 'none'
                  : pending === 0
                    ? 'done'
                    : 'make'
          }
          onStop={solver.stop}
          onRebuild={rebuild}
          onMake={make}
          t={t}
        />
      </Group>

      {/* The dated layer's one door (v18): today, who is away, and this
          week's changes once there are any. Not a part of the base week. */}
      <Sep />
      <DateChip state={state} change={change} />

      <Spacer />

      {/* EVERYTHING ELSE behind the one door every strip has, at the same
          right-hand end. The copy of this timetable, the colour, pinning the whole
          week and emptying the grid are all rare, and two of them are the
          kind of click that costs an afternoon. */}
      <MoreMenu>
        <MoreItem icon={<RotateCcw size={15} />} disabled={placed === 0 || busy} onSelect={rebuild}>
          {t('Yeniden yap')}
        </MoreItem>
        <MoreSep />
        {state.programs.length > 1 && (
          <MoreItem icon={<Trash2 size={15} />} danger disabled={busy} onSelect={deleteCurrent}>
            {currentProgram.name} · {t('Sil')}
          </MoreItem>
        )}
        <MoreSub icon={<PaletteIcon size={15} />} label={t('Renkler neye göre')}>
          <MoreRadio
            value={programColor}
            onChange={setProgramColor}
            options={PROGRAM_COLORS.map((o) => ({ id: o.id, label: t(o.label) }))}
          />
        </MoreSub>
        <MoreSep />
        <MoreItem
          icon={allPinned ? <PinOff size={15} /> : <Pin size={15} />}
          disabled={gridEmpty || busy}
          onSelect={() => change(togglePinAll)}
        >
          {allPinned ? t('Bütün sabitlemeleri kaldır') : t('Bütün dersleri sabitle')}
        </MoreItem>
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
