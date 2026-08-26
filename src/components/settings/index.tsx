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

import type { State } from '../../types';
import School from './School';
import Rules from './Rules';
import Subjects from './Subjects';
import Appearance from './Appearance';
import Data from './Data';
import type { PanelProps, PlanControls } from '../props';
import type { Density } from '../../theme';
import type { SectionId } from '../../toolState';

interface Props extends PanelProps {
  loadState: (next: State) => void;
  plans: PlanControls;
  /** A machine preference, so it comes down from App, not out of `State`. */
  scale: number;
  setScale: (next: number) => void;
  density: Density;
  setDensity: (next: Density) => void;
  availClock: boolean;
  setAvailClock: (next: boolean) => void;
  /** Which section. Owned by App: the tool strip above shows it. */
  section: SectionId;
}

export default function Settings({
  state,
  change,
  loadState,
  plans,
  scale,
  setScale,
  density,
  setDensity,
  availClock,
  setAvailClock,
  section,
}: Props) {

  return (
    <>
      {section === 'school' && <School state={state} change={change} />}
      {section === 'rules' && <Rules state={state} change={change} />}
      {section === 'subjects' && <Subjects state={state} change={change} />}
      {section === 'appearance' && (
        <Appearance
          state={state}
          scale={scale}
          setScale={setScale}
          density={density}
          setDensity={setDensity}
          availClock={availClock}
          setAvailClock={setAvailClock}
        />
      )}
      {section === 'data' && (
        <Data state={state} change={change} loadState={loadState} plans={plans} />
      )}
    </>
  );
}
