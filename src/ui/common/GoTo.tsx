// One way for any screen to send the reader somewhere: a tab, and inside it
// the view of Öğretmenler or Sınıflar, the section of Okul bilgileri, or the
// status chip's problem list.
//
// The empty screens used to NAME the previous step in bold and stop there
// ("Önce **Dersler** sekmesinden…"), and the reader then had to find that tab
// himself. A button does the walking. It is a context rather than a prop
// because the places that need it sit three or four components below App, and
// none of them has any other business with the tab state.

import { createContext, useContext } from 'react';
import type { Id } from '../../leaf/model';
import type { PeopleView, SectionId, Tab } from '../../platform/prefs';

export interface Place {
  tab: Tab;
  /** Öğretmenler's or Sınıflar's view, when the tab is one of them. */
  people?: PeopleView;
  /** Whose lessons the form opens on, with `people: 'lessons'`. */
  focus?: Id;
  /** Okul bilgileri's section, when the tab is Okul bilgileri. */
  section?: SectionId;
  /** The problem list over the tab, on one lesson's row when it has one (K3). */
  problems?: true | Id;
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
