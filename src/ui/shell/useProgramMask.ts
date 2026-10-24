// The Program screen's temporary mask, one per plan, held for the session.

import { useCallback, useMemo, useState } from 'react';
import type { State } from '../../leaf/model';
import { cleanMask, EMPTY_PROGRAM_MASK, type ProgramMask } from '../../pure/program';

export function useProgramMask(planId: string, state: State) {
  // Temporary row/day visibility is a view of one PLAN, not backup data. It
  // follows alternative programs because they share the same school entities,
  // survives tab switches, and disappears with the browser session.
  const [programMasks, setProgramMasks] = useState<Record<string, ProgramMask>>({});
  const programMask = useMemo(
    () => cleanMask(programMasks[planId] ?? EMPTY_PROGRAM_MASK, state),
    [programMasks, planId, state],
  );
  const setProgramMask = useCallback(
    (apply: (mask: ProgramMask) => ProgramMask) => {
      setProgramMasks((all) => ({
        ...all,
        [planId]: apply(cleanMask(all[planId] ?? EMPTY_PROGRAM_MASK, state)),
      }));
    },
    [planId, state],
  );
  return { programMask, setProgramMask };
}
