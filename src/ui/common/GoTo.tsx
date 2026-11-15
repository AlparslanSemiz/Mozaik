// One way for any screen to send the reader somewhere: a tab, and inside it
// the step of Okul or the section of Ayarlar.
//
// The empty screens used to NAME the previous step in bold and stop there
// ("Önce **Dersler** sekmesinden…"), and the reader then had to find that tab
// himself. A button does the walking. It is a context rather than a prop
// because the places that need it sit three or four components below App, and
// none of them has any other business with the tab state.

import { createContext, useContext } from 'react';
import type { SectionId, StepId, Tab } from '../../platform/prefs';

export interface Place {
  tab: Tab;
  /** Okul's list, when the tab is Okul. */
  step?: StepId;
  /** Ayarlar's section, when the tab is Ayarlar. */
  section?: SectionId;
}

const GoToContext = createContext<(place: Place) => void>(() => undefined);

export const GoToProvider = GoToContext.Provider;

export function useGoTo(): (place: Place) => void {
  return useContext(GoToContext);
}

/**
 * A button that goes to a place. Its words say what is done there, never the
 * bare tab name: a button that wears a tab's name answers that tab's queries
 * (pitfall 49).
 */
export function GoButton({
  to,
  children,
  primary = false,
}: {
  to: Place;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const go = useGoTo();
  return (
    <button type="button" className={primary ? 'btn primary' : 'btn'} onClick={() => go(to)}>
      {children}
    </button>
  );
}
