// "Yeni sürüm hazır" — and nothing more than that.
//
// Principle 1 says no update wizard, no account, no forced update. What it did
// NOT say, and what my father needs, is that a version he already has should
// be visible: he gives feedback, I deploy, and until today nothing on his
// screen changed to say the fix had arrived. So this tells him, and he decides.
//
// It is a NO-OP everywhere except the site route, on purpose:
//
//   file:// and .exe   no service worker at all — and principle 3 is verified
//                      mechanically there (temel.spec.ts), so a version check
//                      that reached the network would break the one claim this
//                      program can prove with grep.
//   site / localhost   a page that is already served over http asking its own
//                      origin whether it has changed costs nothing new.
//
// The signal is `controllerchange`, not `updatefound`. sw.js calls
// skipWaiting() + clients.claim(), so a new worker takes over immediately
// while this page still runs the OLD code — which is exactly the moment to
// say so. The guard matters: controllerchange also fires on the FIRST
// registration, when there was no controller, and announcing "new version" to
// somebody who just opened the site for the first time is a lie.

import { useCallback, useEffect, useState } from 'react';

/**
 * Where the newest build always is. Written down ONCE, because it appears on
 * screen in the two routes that cannot fetch it (file:// and the .exe) and in
 * the README, and three copies of an address is two chances to be wrong.
 *
 * It is a STRING, never a fetch: principle 3 is verified mechanically on the
 * file:// build (temel.spec.ts), and a link is not a request.
 */
export const SITE_ADRESI = 'https://alparslansemiz.github.io/ders-programi/';

/**
 * How often a tab that stays open asks. Half an hour, because the answer only
 * changes when I deploy and a tab left open all day is the normal case here.
 */
const SORMA_ARASI = 30 * 60 * 1000;

export interface UpdateRun {
  /** A newer build has taken over; this page is still running the old one. */
  ready: boolean;
  /** From a click: reload onto the new build. */
  reload: () => void;
  /** From a click: ask now, rather than waiting for the next interval. */
  check: () => void;
  /** Whether asking is possible at all — false on file:// and in the .exe. */
  supported: boolean;
}

function registration(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(undefined);
  }
  return navigator.serviceWorker.getRegistration().catch(() => undefined);
}

/**
 * A page under a service worker's control is a page that can be updated.
 *
 * `controller`, not `'serviceWorker' in navigator`: Chromium exposes the API
 * under file:// too (it is `register` that throws there — pitfall 65), so the
 * presence of the object answers the wrong question. What decides this is
 * whether a worker is actually in charge of this page, which is true on the
 * site and the local install and false everywhere else.
 *
 * try/catch because some browsers make the getter itself throw outside a
 * secure context, and this runs during the first render.
 */
export function updateSupported(): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      navigator.serviceWorker.controller !== null
    );
  } catch {
    return false;
  }
}

export function useUpdate(): UpdateRun {
  const [ready, setReady] = useState(false);
  const supported = updateSupported();

  const check = useCallback(() => {
    void registration().then((reg) => reg?.update().catch(() => undefined));
  }, []);

  useEffect(() => {
    if (!supported) return;

    // Remembered rather than read at fire time: by the time controllerchange
    // arrives the controller is the NEW worker, so asking then always says
    // yes and the first-ever registration would announce itself.
    const vardi = navigator.serviceWorker.controller !== null;
    const onChange = () => {
      if (vardi) setReady(true);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);

    check();
    let sonSoru = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - sonSoru < SORMA_ARASI) return;
      sonSoru = Date.now();
      check();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [supported, check]);

  const reload = useCallback(() => {
    location.reload();
  }, []);

  return { ready, reload, check, supported };
}
