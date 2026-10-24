/**
 * One teacher, class or room — on its own, over whatever you were looking at.
 *
 * The reader asked for this in one sentence: "her derslik, sınıf ya da
 * öğretmenin üzerine tıklandığında bilgileri ve programının gözükmesi". The
 * information was never missing; it was spread over four tabs. The Program
 * grid held one ROW of it, Müsaitlik held one row of it in the other axis,
 * the Kurulum list held one row of it, and Kontrol held one line — so
 * answering "is MÇ's week actually full?" meant three tab switches and
 * remembering what the first two said.
 *
 * A sheet rather than a tab: the question is always asked ABOUT something you
 * are already looking at, and a seventh destination would make you leave it.
 * Radix Dialog, so the focus trap, the Escape key and the `aria-modal`
 * bookkeeping are not written here for the third time.
 *
 * All of the counting is in `pure/entities/` (`entityFacts`, `entityWeek`). The
 * sheet draws — and, since 2026-08-30, EDITS: "öğretmeni düzenleme ve sınıfı
 * düzenlemede her şeyi düzenleyebilelim". Every box in the block below is the
 * control the Okul list draws, bound to the same mutator (`updateTeacher`,
 * `updateClass`, `updateRoom`, `setTeacherLimit`), so there is no second copy
 * of any rule. What is new is the ROAD: the grid's row head, a card's
 * right-click menu and the command palette all open this, and none of them
 * used to end anywhere you could change a name.
 *
 * This file is the road: the context, `useInspect()` and the provider that
 * draws the sheet. The sheet itself is `InspectorSheet.tsx` (2026-10-24).
 */
import type { State } from '../../leaf/model';
import type { InspectKind } from '../../pure/entities';
import { type ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { Inspector, type Target } from './InspectorSheet';

type Open = (kind: InspectKind, id: string) => void;

const InspectContext = createContext<Open | null>(null);

/**
 * Opens the sheet. Returns a no-op outside a provider on purpose: a name in a
 * list should be clickable everywhere, and a screen that happens to render
 * outside the shell must not throw for it.
 */
export function useInspect(): Open {
  return useContext(InspectContext) ?? (() => undefined);
}
export function InspectorProvider({
  state,
  change,
  children,
}: {
  state: State;
  // The panel used to be read-only, so this is new. It is here rather than in
  // the sheet because the provider is the only thing that knows the store, and
  // the sheet is drawn from it.
  change: (apply: (d: State) => State) => void;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<Target | null>(null);
  const open = useCallback<Open>((kind, id) => setTarget({ kind, id }), []);

  return (
    <InspectContext.Provider value={open}>
      {children}
      <Inspector state={state} change={change} target={target} onClose={() => setTarget(null)} />
    </InspectContext.Provider>
  );
}
