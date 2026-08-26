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
import { paletteColor } from '../palette';
import type { Kind, SectionId, ToolState, View } from '../toolState';
import { STEPS, classIcon, teacherIcon } from './steps';

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
  { id: 'teacher', label: 'Öğretmen görünümü', icon: teacherIcon },
  { id: 'class', label: 'Sınıf görünümü', icon: classIcon },
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
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Kurulum adımları">
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
        {/* Whose hours are open. The colour is the same mark the list on the
            right and the grid row carry: the identity of a teacher or a class
            is its colour everywhere it is named, not only where it is edited.
            A room has none — `Room` carries no colour — so nothing is drawn. */}
        <span className="ribbon-label">
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
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Yazdırma araçları">
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
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label="Ayar bölümleri">
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
