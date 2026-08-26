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
//   1. all six tabs draw a `.ribbon`, and they are the same height;
//   2. every strip opens with a `<Group>` caption — what the buttons answer;
//   3. groups are divided by `<Sep/>`, and a right-hand group by `<Spacer/>`;
//   4. every button carries a SYMBOL and a WORD, never one alone;
//   5. all the buttons are the same height.
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
  Database,
  Eraser,
  Eye,
  Gauge,
  Layers,
  LayoutList,
  Maximize2,
  Minimize2,
  Palette as PaletteIcon,
  Play,
  RotateCcw,
  Rows3,
  Scale,
  Square,
  Tags,
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
import type { CheckView, Kind, SectionId, ToolState, View } from '../toolState';
import { KIND_ICON, STEPS, classIcon, teacherIcon } from './steps';

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
  { id: 'school', label: 'Okul ve zil', icon: <Bell {...ICON} /> },
  { id: 'rules', label: 'Kurallar', icon: <Scale {...ICON} /> },
  { id: 'subjects', label: 'Branşlar', icon: <Tags {...ICON} /> },
  { id: 'appearance', label: 'Görünüm', icon: <Eye {...ICON} /> },
  { id: 'data', label: 'Veri', icon: <Database {...ICON} /> },
];

/**
 * Which of Kontrol's panels are drawn. The three symbols are chosen to differ
 * in SILHOUETTE, the same rule the four Kurulum steps are drawn under: a list,
 * a triangle, a dial.
 */
const CHECK_VIEWS: Array<{ id: CheckView; label: string; icon: React.ReactElement; why: string }> = [
  { id: 'hepsi', label: 'Hepsi', icon: <LayoutList {...ICON} />, why: 'Bütün rapor' },
  {
    id: 'sorunlar',
    label: 'Sorunlar',
    icon: <TriangleAlert {...ICON} />,
    why: 'Yalnız çözülmesi gereken satırlar',
  },
  {
    id: 'kapasite',
    label: 'Kapasite',
    icon: <Gauge {...ICON} />,
    why: 'Öğretmen, sınıf ve derslik yükleri',
  },
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

function Sep() {
  return <span className="ribbon-sep" aria-hidden="true" />;
}

function Spacer() {
  return <span className="spacer" />;
}

/**
 * A caption and the controls it names — the strip's only structure.
 *
 * A fragment rather than a wrapping element on purpose: `.ribbon` is one flex
 * row and its `gap` is what spaces the buttons. Boxing each group would make
 * the gap apply between BOXES and the buttons inside would need their own,
 * which is two spacing systems saying the same thing.
 */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="ribbon-label">{label}</span>
      {children}
    </>
  );
}

export default function Ribbon({ ui, open, state, change, solver, density, setDensity }: Props) {
  const { confirm } = useDialogs();
  const ix = useMemo(() => buildIndex(state), [state]);
  const status = useMemo(() => health(state), [state]);

  // Folded: the row is GONE, all of it. A folded strip that keeps 27px to hold
  // its own chevron gives back a third of what it costs, and the whole point of
  // folding is the row it buys at 150%. The way back is in the top bar.
  if (!open) return null;

  if (ui.tab === 'setup') {
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Kurulum adımları">
        <Group label="Adımlar">
          {STEPS.map((s, i) => {
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
                <span className="step-no">{i + 1}</span>
                {s.label}
                <span className="step-count">{count}</span>
              </button>
            );
          })}
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
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Müsaitlik araçları">
        <Group label="Kimin saatleri">
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
              {k.label}
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
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Program araçları">
        {/* Two positions, not one toggle: a single button saying "switch to the
            class view" tells you what the next click does, never where you are. */}
        <Group label="Görünüm">
          <div className="view-switch">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                className="btn"
                aria-pressed={ui.view === v.id}
                aria-label={v.label}
                title={v.label}
                onClick={() => ui.setView(v.id)}
              >
                {v.icon}
                {v.short}
              </button>
            ))}
          </div>
        </Group>

        <Sep />

        {/* Two buttons and no settings. What "spread over the week" or "prefer
            mornings" should mean is not knowable before a term has been laid
            out with this (principle 5). */}
        <Group label="Diz">
          {solver.running ? (
            <button className="btn danger" onClick={solver.stop}>
              <Square {...ICON} />
              Durdur
            </button>
          ) : (
            <>
              <button
                className="btn primary"
                disabled={pending === 0}
                title={
                  pending === 0
                    ? 'Havuzda bekleyen ders yok'
                    : 'Havuzdaki dersleri kurallara uyarak yerleştirir'
                }
                onClick={() => solver.start(state, { keepPlaced: true })}
              >
                <Play {...ICON} />
                Otomatik diz ({pending})
              </button>
              <button
                className="btn"
                disabled={placed === 0}
                title="Dizilmiş programı silip baştan dizer"
                onClick={async () => {
                  if (
                    await confirm({
                      title: `Dizilmiş ${placed} saatin tamamı silinecek`,
                      body: 'Program sıfırdan dizilecek. Ctrl+Z ile geri alınabilir.',
                      confirmLabel: 'Baştan diz',
                      danger: true,
                    })
                  ) {
                    solver.start(state, { keepPlaced: false });
                  }
                }}
              >
                <RotateCcw {...ICON} />
                Baştan diz
              </button>
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
              title={d.why}
              onClick={() => {
                applyDensity(d.id);
                setDensity(d.id);
              }}
            >
              {d.icon}
              {d.label}
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
            title="Dizilmiş bütün dersleri havuza geri gönderir"
            onClick={async () => {
              if (
                await confirm({
                  title: `Dizilmiş ${placed} saatin tamamı havuza dönecek`,
                  body: 'Izgara boşalır; dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.',
                  confirmLabel: 'Programı boşalt',
                  danger: true,
                })
              ) {
                change((d) => ({ ...d, placements: {} }));
              }
            }}
          >
            <Eraser {...ICON} />
            Programı boşalt
          </button>
        </Group>
      </div>
    );
  }

  if (ui.tab === 'check') {
    // Kontrol used to have no strip at all, on the argument that it is a report
    // you read and there is nothing to do to it. That was true of its CONTENT
    // and false of the screen: the strip's height came and went with the tab,
    // so everything under it jumped every time this report was opened or left.
    // And the report does have a question of its own — a full one runs to seven
    // panels, three of which only exist when something is wrong.
    const shown = ui.checkView;
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Kontrol araçları">
        <Group label="Ne gösterilsin">
          {CHECK_VIEWS.map((v) => (
            <button
              key={v.id}
              className="btn"
              aria-pressed={shown === v.id}
              title={v.why}
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
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Yazdırma araçları">
        {/* The two kinds of sheet are drawn with the same two symbols they carry
            in Kurulum, Müsaitlik and the entity panel — one drawing per thing. */}
        <Group label="Ne basılsın">
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
            aria-pressed={ui.scope === 'teachers'}
            onClick={() => ui.setScope('teachers')}
          >
            {KIND_ICON.teacher}
            Öğretmenler
          </button>
          <button
            className="btn"
            aria-pressed={ui.scope === 'both'}
            onClick={() => ui.setScope('both')}
          >
            <Layers {...ICON} />
            İkisi de
          </button>
        </Group>
        <Sep />
        <Group label="Renk">
          <button
            className="btn"
            aria-pressed={ui.colored}
            title="Öğretmen renkleri kâğıda basılır"
            onClick={() => ui.setColored(!ui.colored)}
          >
            <PaletteIcon {...ICON} />
            Renkli bas
          </button>
        </Group>
        {/* "Yazdır (N sayfa)" is NOT here: the N comes from the tick lists in
            the panel, and a button that says how many pages belongs next to the
            list that decides it. The strip carries what you are looking at. */}
      </div>
    );
  }

  // settings
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Ayar bölümleri">
      <Group label="Bölüm">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className="btn"
            aria-pressed={s.id === ui.section}
            onClick={() => ui.setSection(s.id)}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </Group>
    </div>
  );
}
