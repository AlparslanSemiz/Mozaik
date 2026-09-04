// The temporary "hide this row / dim this day" view of ONE plan.
//
// A view, not backup data: it follows the alternative programs because they
// share the same school entities, survives a tab switch, and disappears with
// the browser session. Kept per plan id, so switching plans does not carry one
// plan's hidden rows into another's.
//
// Lives in `App()`'s fiber like everything else here — a tab change unmounts
// Program, and a mask that died with it would be a setting nobody could keep
// (pitfall 18).

import { useCallback, useMemo, useState } from 'react';
import { cleanMask, EMPTY_PROGRAM_MASK, type ProgramMask } from './programMask';
import type { Id, State } from './types';

export interface ProgramMasks {
  /** The open plan's mask, already cleaned against the school it describes. */
  programMask: ProgramMask;
  setProgramMask: (apply: (mask: ProgramMask) => ProgramMask) => void;
}

export function useProgramMasks(planId: Id, state: State): ProgramMasks {
  const [masks, setMasks] = useState<Record<string, ProgramMask>>({});

  const programMask = useMemo(
    () => cleanMask(masks[planId] ?? EMPTY_PROGRAM_MASK, state),
    [masks, planId, state],
  );

  const setProgramMask = useCallback(
    (apply: (mask: ProgramMask) => ProgramMask) => {
      setMasks((all) => ({
        ...all,
        [planId]: apply(cleanMask(all[planId] ?? EMPTY_PROGRAM_MASK, state)),
      }));
    },
    [planId, state],
  );

  return { programMask, setProgramMask };
}
