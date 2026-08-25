// The tool strip: what the section you are in can DO, on a row of its own.
//
// The rule for what earns a place here: it answers "what am I looking at" or
// "what does one click do", and the eye looks for it on arriving. A list, a
// counter, a checkbox or a sentence of explanation stays in the panel below —
// a ribbon of everything is a ribbon of nothing.
//
// Kontrol has no strip at all and that is deliberate: it is a report you read,
// there is nothing to do to it, and a strip drawn empty would cost the screen
// 40px to say so.
//
// The state these controls show (`view`, `kind`, `step`, `section`, `scope`)
// lives in App — see src/toolState.ts for why that is a fix and not a side
// effect of drawing them up here.

import type React from 'react';
import { useMemo } from 'react';
import { buildIndex } from './../constraints';
import { pendingLessons } from './../entities';
import type { State } from '../types';
import type { SolverRun } from '../useSolver';
import type { Density } from '../theme';
import { applyDensity } from '../theme';
import type { Kind, SectionId, StepId, ToolState, View } from '../toolState';

interface Props {
  ui: ToolState;
  /** Whether the strip is drawn at all. Owned by App: the button is up there. */
  open: boolean;
  state: State;
  solver: SolverRun;
  density: Density;
  setDensity: (next: Density) => void;
}

/**
 * The two views. `aria-label` is not optional here: the buttons carry no text,
 * so it is the only name a screen reader — or a test — can find them by.
 */
export const VIEWS: Array<{ id: View; label: string; icon: React.ReactElement }> = [
  {
    // A mortarboard — the symbol aSc uses for Teachers, and the one thing on
    // screen that cannot be mistaken for a person. The two icons used to be one
    // head and three heads; at 17px that difference is invisible.
    id: 'teacher',
    label: 'Öğretmen görünümü',
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <path d="M10 2.4 19.2 6.6 10 10.8 0.8 6.6Z" fill="currentColor" />
        <path
          d="M5 8.5 10 10.8 15 8.5v3.4c0 1.5-2.2 2.5-5 2.5s-5-1-5-2.5Z"
          fill="currentColor"
        />
        <path d="M17.6 7.5h1.2v5.2h-1.2Z" fill="currentColor" />
        <circle cx="18.2" cy="13.6" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'class',
    // A group of students: three figures, the middle one nearer. A class is the
    // only thing in this tool that is a crowd.
    label: 'Sınıf görünümü',
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <circle cx="4.2" cy="6.4" r="2.2" fill="currentColor" />
        <circle cx="15.8" cy="6.4" r="2.2" fill="currentColor" />
        <path d="M0.4 15.4c0-2.5 1.7-4.2 3.8-4.2s3.8 1.7 3.8 4.2Z" fill="currentColor" />
        <path d="M12 15.4c0-2.5 1.7-4.2 3.8-4.2s3.8 1.7 3.8 4.2Z" fill="currentColor" />
        <circle cx="10" cy="8.2" r="3" fill="currentColor" />
        <path d="M4.9 18c0-3.1 2.3-5.2 5.1-5.2s5.1 2.1 5.1 5.2Z" fill="currentColor" />
      </svg>
    ),
  },
];


/** Kurulum's four lists, in the order they are filled in. */
const STEPS: Array<{ id: StepId; label: string; count: (d: State) => number }> = [
  { id: 'rooms', label: 'Derslikler', count: (d) => d.rooms.length },
  { id: 'teachers', label: 'Öğretmenler', count: (d) => d.teachers.length },
  { id: 'classes', label: 'Sınıflar', count: (d) => d.classes.length },
  { id: 'lessons', label: 'Dersler', count: (d) => d.lessons.length },
];

const KINDS: Array<{ id: Kind; label: string }> = [
  { id: 'teacher', label: 'Öğretmen' },
  { id: 'class', label: 'Sınıf' },
  { id: 'room', label: 'Derslik' },
];

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'school', label: 'Okul ve zil' },
  { id: 'rules', label: 'Kurallar' },
  { id: 'subjects', label: 'Branşlar' },
  { id: 'appearance', label: 'Görünüm' },
  { id: 'data', label: 'Veri' },
];

function Sep() {
  return <span className="ribbon-sep" aria-hidden="true" />;
}


export default function Ribbon({ ui, open, state, solver, density, setDensity }: Props) {
  const ix = useMemo(() => buildIndex(state), [state]);

  // Kontrol is a report. Nothing on this row would be true of it.
  if (ui.tab === 'check') return null;

  // Folded: the row is GONE, all of it. A folded strip that keeps 27px to hold
  // its own chevron gives back a third of what it costs, and the whole point of
  // folding is the row it buys at 150%. The way back is in the top bar.
  if (!open) return null;

  if (ui.tab === 'setup') {
    return (
      <div className="ribbon" role="toolbar" aria-label="Kurulum adımları">
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
              <span className="step-no">{i + 1}</span>
              {s.label}
              <span className="step-count">{count}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (ui.tab === 'availability') {
    const list =
      ui.kind === 'teacher' ? state.teachers : ui.kind === 'class' ? state.classes : state.rooms;
    const selected = list.find((x) => x.id === ui.chosen) ?? list[0];
    return (
      <div className="ribbon" role="toolbar" aria-label="Müsaitlik araçları">
        <span className="ribbon-label">Kimin saatleri</span>
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
            {k.label}
          </button>
        ))}
        <Sep />
        <span className="ribbon-label">
          {selected === undefined ? 'Liste boş' : selected.name}
        </span>
      </div>
    );
  }

  if (ui.tab === 'program') {
    const pending = pendingLessons(state, ix);
    const placed = Object.keys(state.placements).length;
    return (
      <div className="ribbon" role="toolbar" aria-label="Program araçları">
        {/* Two positions, not one toggle: a single button saying "switch to the
            class view" tells you what the next click does, never where you are. */}
        <div className="view-switch">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className="btn icon"
              aria-pressed={ui.view === v.id}
              aria-label={v.label}
              title={v.label}
              onClick={() => ui.setView(v.id)}
            >
              {v.icon}
            </button>
          ))}
        </div>

        <Sep />

        {/* Two buttons and no settings. What "spread over the week" or "prefer
            mornings" should mean is not knowable before a term has been laid
            out with this (principle 5). */}
        {solver.running ? (
          <button className="btn danger" onClick={solver.stop}>
            ■ Durdur
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
              Otomatik diz ({pending})
            </button>
            <button
              className="btn"
              disabled={placed === 0}
              title="Dizilmiş programı silip baştan dizer"
              onClick={() => {
                if (
                  window.confirm(
                    `Dizilmiş ${placed} saatin tamamı silinip program baştan dizilecek. ` +
                      'Devam edilsin mi? (Ctrl+Z ile geri alınabilir.)',
                  )
                ) {
                  solver.start(state, { keepPlaced: false });
                }
              }}
            >
              Baştan diz
            </button>
          </>
        )}

        <Sep />

        {/* Density is a decision about the grid, taken while looking at the
            grid — it spent a version three clicks away in Ayarlar → Görünüm,
            where you cannot see what it does. It is still there too. */}
        <span className="ribbon-label">Yoğunluk</span>
        <button
          className="btn"
          aria-pressed={density === 'rahat'}
          title="Hücre geniş, ders saatleri görünür"
          onClick={() => {
            applyDensity('rahat');
            setDensity('rahat');
          }}
        >
          Rahat
        </button>
        <button
          className="btn"
          aria-pressed={density === 'sigdir'}
          title="Haftanın tamamı ekrana sığar, ders saatleri gizlenir"
          onClick={() => {
            applyDensity('sigdir');
            setDensity('sigdir');
          }}
        >
          Sığdır
        </button>

      </div>
    );
  }

  if (ui.tab === 'print') {
    return (
      <div className="ribbon" role="toolbar" aria-label="Yazdırma araçları">
        <span className="ribbon-label">Ne basılsın</span>
        <button className="btn" aria-pressed={ui.scope === 'classes'} onClick={() => ui.setScope('classes')}>
          Sınıflar
        </button>
        <button className="btn" aria-pressed={ui.scope === 'teachers'} onClick={() => ui.setScope('teachers')}>
          Öğretmenler
        </button>
        <button className="btn" aria-pressed={ui.scope === 'both'} onClick={() => ui.setScope('both')}>
          İkisi de
        </button>
        <Sep />
        <button
          className="btn"
          aria-pressed={ui.colored}
          title="Öğretmen renkleri kâğıda basılır"
          onClick={() => ui.setColored(!ui.colored)}
        >
          Renkli bas
        </button>
        {/* "Yazdır (N sayfa)" is NOT here: the N comes from the tick lists in
            the panel, and a button that says how many pages belongs next to the
            list that decides it. The strip carries what you are looking at. */}
      </div>
    );
  }

  // settings
  return (
    <div className="ribbon" role="toolbar" aria-label="Ayar bölümleri">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          className="btn"
          aria-pressed={s.id === ui.section}
          onClick={() => ui.setSection(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
