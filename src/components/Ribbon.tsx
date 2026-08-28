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
import { useDialogs } from './Dialogs';
import { useMemo } from 'react';
import {
  Bell,
  Eraser,
  Eye,
  Layers,
  Info,
  Library,
  List,
  Maximize2,
  Minimize2,
  Palette as PaletteIcon,
  Play,
  RotateCcw,
  Rows3,
  Scale,
  Square,
  TriangleAlert,
} from 'lucide-react';
import { buildIndex } from './../constraints';
import { pendingLessons } from './../entities';
import { health } from '../feasibility';
import type { State } from '../types';
import type { SolverRun } from '../useSolver';
import type { Density } from '../theme';
import { applyDensity } from '../theme';
import { paletteColor } from '../palette';
import type { Kind, LessonMode, SectionId, ToolState, View } from '../toolState';
import { KIND_ICON, STEPS, classIcon, teacherIcon } from './steps';
import { useT } from './T';

interface Props {
  ui: ToolState;
  /** Whether the strip is drawn at all. Owned by App: the button is up there. */
  open: boolean;
  state: State;
  /** Only the strip's own destructive action needs it: "Programı boşalt". */
  change: (fn: (d: State) => State) => void;
  solver: SolverRun;
  density: Density;
  setDensity: (next: Density) => void;
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

export default function Ribbon({ ui, open, state, change, solver, density, setDensity }: Props) {
  const t = useT();
  const { confirm } = useDialogs();
  const ix = useMemo(() => buildIndex(state), [state]);
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
      </div>
    );
  }

  if (ui.tab === 'program') {
    const pending = pendingLessons(state, ix);
    const placed = Object.keys(state.placements).length;
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Program araçları')}>
        {/* Two positions, not one toggle: a single button saying "switch to the
            class view" tells you what the next click does, never where you are. */}
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
              {v.short}
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
                onClick={() => solver.start(state, { keepPlaced: true })}
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
                      body: t('Program sıfırdan dizilecek. Ctrl+Z ile geri alınabilir.'),
                      confirmLabel: t('Baştan diz'),
                      danger: true,
                    })
                  ) {
                    solver.start(state, { keepPlaced: false });
                  }
                }}
              >
                <RotateCcw {...ICON} />{t('Baştan diz')}</button>
            </>
          )}
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
        <Group label="Izgara">
          <button
            className="btn danger"
            disabled={placed === 0 || solver.running}
            title={t('Dizilmiş bütün dersleri havuza geri gönderir')}
            onClick={async () => {
              if (
                await confirm({
                  title: t('Dizilmiş {n} saatin tamamı havuza dönecek', { n: placed }),
                  body: t(
                    'Izgara boşalır; dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.',
                  ),
                  confirmLabel: t('Programı boşalt'),
                  danger: true,
                })
              ) {
                change((d) => ({ ...d, placements: {} }));
              }
            }}
          >
            <Eraser {...ICON} />{t('Programı boşalt')}</button>
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
    // For one round it held a three-way FILTER (Hepsi · Sorunlar · Kapasite),
    // and the reader's verdict was that the three read the same — which they
    // largely did, since the panel everyone comes for was in all three. The
    // report is one page now and the strip does what a strip on a long report
    // is actually for: it goes somewhere. Every button says how many.
    const sorunlar = status.problems;
    const jump = (sel: string) => () => {
      document.querySelector(sel)?.scrollIntoView({ block: 'start' });
    };
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Kontrol araçları')}>
        <Group label="Git">
          <button
            className="btn"
            disabled={sorunlar === 0}
            title={sorunlar === 0 ? t('Sorun yok') : t('Çözülmesi gereken satırlara gider')}
            onClick={jump('.kontrol-sorun')}
          >
            <TriangleAlert {...ICON} />
            {t('Sorunlar ({n})', { n: sorunlar })}
          </button>
          <button className="btn" title={t('Öğretmen yüklerine gider')} onClick={jump('#kontrol-ogretmenler')}>
            {KIND_ICON.teacher}
            Öğretmenler
          </button>
          <button className="btn" title={t('Sınıf yüklerine gider')} onClick={jump('#kontrol-siniflar')}>
            {KIND_ICON.class}
            Sınıflar
          </button>
          <button className="btn" title={t('Derslik yüklerine gider')} onClick={jump('#kontrol-derslikler')}>
            {KIND_ICON.room}
            Derslikler
          </button>
        </Group>

        <Spacer />

        {/* The numbers themselves, not the top bar's chip repeated: the chip
            says which of three states the week is in, and this says how many of
            what. It is a READING — no button, nothing to press. */}
        <Group label="Durum">
          <span className="ribbon-value">
            <span className={`badge ${status.blocked > 0 ? 'impossible' : 'ok'}`}>
              {status.blocked} engel
            </span>
            <span className={`badge ${status.warnings > 0 ? 'tight' : 'ok'}`}>
              {status.warnings} uyarı
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
            Öğretmenler
          </button>
          <button
            className="btn"
            aria-pressed={ui.scope === 'classes'}
            onClick={() => ui.setScope('classes')}
          >
            {KIND_ICON.class}
            Sınıflar
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
    </div>
  );
}
