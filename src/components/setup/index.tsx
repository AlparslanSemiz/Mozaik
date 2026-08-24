// Setup, in numbered steps.
//
// It used to be one 1132-line scroll: everything was on screen at once and
// nothing said in which order to fill it in. The strip below is NOT a locked
// wizard — every step is reachable at any time — it only shows where you are
// and, through the counters, where something is still missing.

import { useState } from 'react';
import type { State } from '../../types';
import School from './School';
import Rooms from './Rooms';
import Teachers from './Teachers';
import Classes from './Classes';
import Lessons from './Lessons';
import Rules from './Rules';
import type { SetupProps } from './props';

type StepId = 'school' | 'rooms' | 'teachers' | 'classes' | 'lessons' | 'rules';

interface Step {
  id: StepId;
  label: string;
  /** null = nothing to count (the step is a settings page, not a list). */
  count: (d: State) => number | null;
  render: (p: SetupProps) => React.ReactElement;
}

const STEPS: Step[] = [
  { id: 'school', label: 'Okul', count: () => null, render: (p) => <School {...p} /> },
  {
    id: 'rooms',
    label: 'Derslikler',
    count: (d) => d.rooms.length,
    render: (p) => <Rooms {...p} />,
  },
  {
    id: 'teachers',
    label: 'Öğretmenler',
    count: (d) => d.teachers.length,
    render: (p) => <Teachers {...p} />,
  },
  {
    id: 'classes',
    label: 'Sınıflar',
    count: (d) => d.classes.length,
    render: (p) => <Classes {...p} />,
  },
  {
    id: 'lessons',
    label: 'Dersler',
    count: (d) => d.lessons.length,
    render: (p) => <Lessons {...p} />,
  },
  { id: 'rules', label: 'Kurallar', count: () => null, render: (p) => <Rules {...p} /> },
];

export default function Setup({ state, change }: SetupProps) {
  const [step, setStep] = useState<StepId>('school');

  const index = Math.max(
    0,
    STEPS.findIndex((s) => s.id === step),
  );
  const current = STEPS[index] ?? STEPS[0]!;
  const next = STEPS[index + 1];

  return (
    <div className="main">
      <nav className="steps" aria-label="Kurulum adımları">
        {STEPS.map((s, i) => {
          const count = s.count(state);
          return (
            <button
              key={s.id}
              className="step"
              aria-current={s.id === current.id}
              data-empty={count === 0}
              onClick={() => setStep(s.id)}
            >
              <span className="step-no">{i + 1}</span>
              {s.label}
              {count !== null && <span className="step-count">{count}</span>}
            </button>
          );
        })}
      </nav>

      {current.render({ state, change })}

      {next !== undefined && (
        <div className="form-row step-next">
          <button className="btn" onClick={() => setStep(next.id)}>
            Sonraki adım: {next.label} →
          </button>
        </div>
      )}
    </div>
  );
}
