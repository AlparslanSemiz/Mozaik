// Settings, in sections.
//
// Everything here describes the SCHOOL, not its people: the name on the printed
// page, which days are taught, the bell, the four rules, the subject list, and
// the data itself. None of it is a list you build up while entering a term, so
// none of it belongs in Kurulum's counted steps — it is opened when something
// about the school changes, and that is rare.
//
// Görünüm is the one section that describes the MACHINE rather than the school
// (`theme.ts`). It is here and not in the top bar for the same reason Sıfırla
// is: the top bar is the row where no single click can cost an afternoon.

import { useState } from 'react';
import type { State } from '../../types';
import School from './School';
import Rules from './Rules';
import Subjects from './Subjects';
import Appearance from './Appearance';
import Data from './Data';
import type { PanelProps, PlanControls } from '../props';
import type { Density } from '../../theme';

type SectionId = 'school' | 'rules' | 'subjects' | 'appearance' | 'data';

interface Props extends PanelProps {
  loadState: (next: State) => void;
  plans: PlanControls;
  /** A machine preference, so it comes down from App, not out of `State`. */
  scale: number;
  setScale: (next: number) => void;
  density: Density;
  setDensity: (next: Density) => void;
}

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'school', label: 'Okul ve zil' },
  { id: 'rules', label: 'Kurallar' },
  { id: 'subjects', label: 'Branşlar' },
  { id: 'appearance', label: 'Görünüm' },
  { id: 'data', label: 'Veri' },
];

export default function Settings({
  state,
  change,
  loadState,
  plans,
  scale,
  setScale,
  density,
  setDensity,
}: Props) {
  const [section, setSection] = useState<SectionId>('school');

  return (
    <>
      <nav className="steps" aria-label="Ayar bölümleri">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className="step"
            aria-current={s.id === section}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {section === 'school' && <School state={state} change={change} />}
      {section === 'rules' && <Rules state={state} change={change} />}
      {section === 'subjects' && <Subjects state={state} change={change} />}
      {section === 'appearance' && (
        <Appearance scale={scale} setScale={setScale} density={density} setDensity={setDensity} />
      )}
      {section === 'data' && (
        <Data state={state} change={change} loadState={loadState} plans={plans} />
      )}
    </>
  );
}
