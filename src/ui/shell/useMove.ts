// The two ends of moving the plans to the new address (platform/storage/move.ts).
//
// `useMoveOut` runs at the OLD address and draws nothing until the new one
// answers; `useMoveIn` runs at the new address when the old one opened it,
// and writes nothing before its own question is answered.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { State } from '../../leaf/model';
import {
  bundleText,
  downloadBundle,
  moveRequested,
  newAddressLive,
  NEW_ADDRESS_EVENT,
  receivePlans,
  sendPlans,
  type SendState,
} from '../../platform/storage';
import { type PlanControls, useDialogs, useOpenBundle, useT } from '../common';

export interface MoveOut {
  /** The new address answers, and this page is at the old one. */
  live: boolean;
  /** Where the move is; null before the button. */
  state: SendState | null;
  /** True when the plans went into a file instead (the window never answered). */
  toFile: boolean;
  start: () => void;
}

export function useMoveOut(plans: PlanControls, peek: () => State): MoveOut {
  const [live, setLive] = useState(newAddressLive);
  const [state, setState] = useState<SendState | null>(null);
  const [toFile, setToFile] = useState(false);
  const stop = useRef<() => void>(() => undefined);
  const held = useRef({ plans, peek });
  held.current = { plans, peek };

  useEffect(() => {
    const on = () => setLive(newAddressLive());
    window.addEventListener(NEW_ADDRESS_EVENT, on);
    return () => {
      window.removeEventListener(NEW_ADDRESS_EVENT, on);
      stop.current();
    };
  }, []);

  const start = useCallback(() => {
    const { plans: p, peek: now } = held.current;
    stop.current();
    setToFile(false);
    stop.current = sendPlans({
      paket: bundleText(p.library, p.planId, now()),
      onState: (s) => {
        setState(s);
        // The window never answered, or it could not read what it got: the
        // plans go into the same file "Tümünü dosyaya kaydet" writes, and the
        // strip says where to open it. Not when the reader closed the window
        // or said no there: a download nobody asked for is a surprise.
        const failed = s.ad === 'acilamadi' || (s.ad === 'bitti' && s.durum === 'okunamadi');
        if (failed) {
          const q = held.current;
          downloadBundle(q.plans.library, q.plans.planId, q.peek());
          setToFile(true);
        }
      },
    });
  }, []);

  return { live, state, toFile, start };
}

/** At the new address: takes the plans the old one sends, behind a question. */
export function useMoveIn(plans: PlanControls): void {
  const t = useT();
  const { alert } = useDialogs();
  const openBundle = useOpenBundle(plans);
  const held = useRef({ openBundle, alert, t });
  held.current = { openBundle, alert, t };
  // Read once: the parameter is taken out of the address below, and a second
  // run of the effect (StrictMode) must still know it was there.
  const [asked] = useState(() => moveRequested(window.location.search));

  useEffect(() => {
    if (!asked) return;
    // A reload of this window must not ask again.
    const url = new URL(window.location.href);
    url.searchParams.delete('tasima');
    window.history.replaceState(window.history.state, '', url.toString());
    return receivePlans({
      onPaket: async (paket) => {
        const h = held.current;
        const r = await h.openBundle(paket, h.t('Eski adresteki planlar buraya gelsin mi?'));
        if (r.note !== null) {
          void h.alert({ title: r.note.text, tone: r.note.bad ? 'warn' : 'info' });
        }
        return { durum: r.outcome, acilan: r.opened };
      },
    });
  }, [asked]);
}
