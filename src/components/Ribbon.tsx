// The tool strip: what the section you are in can DO, on a row of its own.
//
// The rule for what earns a place here: it answers "what am I looking at" or
// "what does one click do", and the eye looks for it on arriving. A list, a
// counter, a checkbox or a sentence of explanation stays in the panel below —
// a ribbon of everything is a ribbon of nothing.
//
// THIS FILE IS THE DISPATCH. It used to be 1134 lines and one function with
// seven branches; the shape they share lives in `./ribbon/parts.tsx` and each
// tab's own question is its own file beside it. What did NOT change is the
// contract `e2e/serit.spec.ts` measures line by line — it is written where the
// shape is, because every line of it is about the shape.
//
// And one thing that is an ORDER rather than a shape, so it belongs here where
// the tabs are listed: wherever a strip offers the two kinds side by side,
// teacher comes first and class second. It was teacher-first in Müsaitlik and
// Program and class-first in Dersler and Çıktı — the same two icons, the same
// row, two orders. Okul's three lists are not this: a class refers to a room,
// so rooms have to be typed in first.
//
// The state these controls show (`view`, `kind`, `step`, `section`, `scope`,
// `checkView`) lives in App — see src/toolState.ts for why that is a fix and
// not a side effect of drawing them up here.

import AvailabilityRibbon from './ribbon/AvailabilityRibbon';
import CheckRibbon from './ribbon/CheckRibbon';
import LessonsRibbon from './ribbon/LessonsRibbon';
import PrintRibbon from './ribbon/PrintRibbon';
import ProgramRibbon from './ribbon/ProgramRibbon';
import SettingsRibbon from './ribbon/SettingsRibbon';
import SetupRibbon from './ribbon/SetupRibbon';
import type { RibbonProps } from './ribbon/props';

export { VIEWS } from './ribbon/parts';

export default function Ribbon(props: RibbonProps) {
  const { ui, open } = props;

  // Folded: the row is GONE, all of it. A folded strip that keeps 27px to hold
  // its own chevron gives back a third of what it costs, and the whole point of
  // folding is the row it buys at 150%. The way back is in the top bar.
  if (!open) return null;

  switch (ui.tab) {
    case 'setup':
      return <SetupRibbon ui={ui} state={props.state} />;
    case 'lessons':
      return <LessonsRibbon ui={ui} state={props.state} />;
    case 'availability':
      return (
        <AvailabilityRibbon
          ui={ui}
          state={props.state}
          availClock={props.availClock}
          setAvailClock={props.setAvailClock}
        />
      );
    case 'program':
      return <ProgramRibbon {...props} />;
    case 'check':
      return <CheckRibbon ui={ui} state={props.state} />;
    case 'print':
      return <PrintRibbon ui={ui} />;
    // Ayarlar, and the default: a tab with no strip of its own would move
    // everything under it by the strip's whole height on arriving (rule 1).
    default:
      return (
        <SettingsRibbon
          ui={ui}
          state={props.state}
          theme={props.theme}
          setTheme={props.setTheme}
          changelogUnseen={props.changelogUnseen}
          planName={props.planName}
        />
      );
  }
}
