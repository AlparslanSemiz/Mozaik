// "Yeni sürüm hazır" — and nothing more than that.
//
// Principle 1 says no update wizard, no account, no forced update. What it did
// NOT say, and what my father needs, is that a version he already has should
// be visible: he gives feedback, I deploy, and until today nothing on his
// screen changed to say the fix had arrived. So this tells him, and he decides.
//
// THERE ARE TWO ROUTES THAT CAN UPDATE, and they update differently:
//
//   site / localhost   a service worker. The page is already served over http,
//                      so asking its own origin whether it has changed costs
//                      nothing new, and a new worker taking over IS the event.
//   .exe               three commands in Rust, each behind its own button:
//                      look, download, restart. The page still fetches nothing
//                      itself; the network is on the far side of `invoke`.
//   file://            nothing, and that is not an oversight. A .html file
//                      cannot replace itself, and principle 3 is verified
//                      mechanically on that build (temel.spec.ts) — a fetch
//                      there would break the one claim this program can prove
//                      with grep.
//
// The exe route NEVER runs on its own: no timer, no check at startup, no
// background thread. With no internet the whole feature is one sentence on
// screen and nothing else changes (principle 1, and the sentence kur.ps1
// already wrote down: the program does not connect, an update does).
//
// The signal is `controllerchange`, not `updatefound`. sw.js calls
// skipWaiting() + clients.claim(), so a new worker takes over immediately
// while this page still runs the OLD code — which is exactly the moment to
// say so. The guard matters: controllerchange also fires on the FIRST
// registration, when there was no controller, and announcing "new version" to
// somebody who just opened the site for the first time is a lie.

import { t } from './i18n';
import { useCallback, useEffect, useRef, useState } from 'react';

import { desktopApply, desktopCheck, desktopDownload, isDesktop } from './desktop';
import { SURUM, tarihYazisi } from './version';

/**
 * Where the newest build always is. Written down ONCE, because it appears on
 * screen in the two routes that cannot fetch it (file:// and the .exe) and in
 * the README, and three copies of an address is two chances to be wrong.
 *
 * It is a STRING, never a fetch: principle 3 is verified mechanically on the
 * file:// build (temel.spec.ts), and a link is not a request.
 *
 * GitHub Pages serves a repository under its NAME, so renaming the repository
 * `ders-programi` -> `Mozaik` moved this page and left the old address a 404
 * (measured 2026-08-31). Unlike the release URLs there is no redirect here:
 * the sentence in Ayarlar -> Hakkında was pointing my father at nothing.
 */
export const SITE_ADRESI = 'https://alparslansemiz.github.io/Mozaik/';

/**
 * How often a tab that stays open asks. Half an hour, because the answer only
 * changes when I deploy and a tab left open all day is the normal case here.
 */
const SORMA_ARASI = 30 * 60 * 1000;

/**
 * How this copy can be updated, if it can.
 *
 * A route, not a capability flag: the two that can update do it by completely
 * different mechanisms, and the panel in Ayarlar draws different things for
 * them. Collapsing both into a boolean is what made the exe look identical to
 * the double-clicked .html for two versions.
 */
export type UpdateKind = 'sw' | 'exe' | 'yok';

/** Where the .exe route is in its three steps. */
export type ExeDurum =
  | { ad: 'bos' }
  | { ad: 'bakiliyor' }
  | { ad: 'guncel' }
  | { ad: 'var'; surum: string; tarih: string; adres: string; boyut: number }
  | { ad: 'indiriliyor' }
  | { ad: 'hazir'; surum: string }
  | { ad: 'hata'; mesaj: string };

export interface UpdateRun {
  /** Which of the three routes this copy is on. */
  kind: UpdateKind;
  /** Whether asking is possible at all. False only on the double-clicked file. */
  supported: boolean;
  /** SW route: a newer build has taken over; this page is still the old one. */
  ready: boolean;
  /** From a click: reload onto the new build. */
  reload: () => void;
  /** From a click: ask now. On the SW route this is also called on an interval;
      in the exe it is ONLY ever a click. */
  check: () => void;
  /** Exe route: what to draw. Always `bos` on the other two. */
  durum: ExeDurum;
  /** Exe route, second button: fetch the new program next to this one. */
  indir: () => void;
  /** Exe route, third button: put it in place and restart onto it. */
  uygula: () => void;
}

/** One sentence, whatever went wrong. Rust already writes Turkish for the
    cases it can name; this is the floor under everything else. */
function hataMetni(e: unknown): string {
  const ham = typeof e === 'string' ? e : e instanceof Error ? e.message : '';
  return ham.trim() === '' ? t('Güncelleme denetlenemedi.') : ham;
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

/**
 * Which route this copy is on.
 *
 * The exe is asked FIRST. It is a feature test either way, but a Tauri window
 * is still a browser window, and the day one of these builds ends up behind a
 * worker as well, the answer that matters is the one that can actually replace
 * the program.
 */
export function updateKind(): UpdateKind {
  if (isDesktop()) return 'exe';
  return updateSupported() ? 'sw' : 'yok';
}

/**
 * @param flush Called right before the exe restarts, to write the pending
 *   autosave synchronously. `beforeunload` covers a closing tab; a WebView2
 *   window torn down by `app.exit(0)` is not one, and the 400 ms debounce is
 *   long enough to eat the edit made just before the button was pressed
 *   (pitfall 28). Only localStorage is flushed: the chosen folder is a backup
 *   that the next launch rewrites anyway.
 */
export function useUpdate(flush: () => void = () => undefined): UpdateRun {
  const [ready, setReady] = useState(false);
  const kind = updateKind();
  const supported = kind !== 'yok';

  const [durum, setDurum] = useState<ExeDurum>({ ad: 'bos' });
  // Read inside the callbacks rather than closed over, so `indir` does not
  // need `durum` in its dependency list and go stale between renders.
  const sonuc = useRef<ExeDurum>({ ad: 'bos' });
  sonuc.current = durum;

  const exeCheck = useCallback(() => {
    setDurum({ ad: 'bakiliyor' });
    desktopCheck(SURUM.version).then(
      (c) => {
        setDurum(
          c.yeni_var
            ? {
                ad: 'var',
                surum: c.version,
                tarih: tarihYazisi(c.date),
                adres: c.exe,
                boyut: c.boyut,
              }
            : { ad: 'guncel' },
        );
      },
      (e: unknown) => setDurum({ ad: 'hata', mesaj: hataMetni(e) }),
    );
  }, []);

  const indir = useCallback(() => {
    const su = sonuc.current;
    if (su.ad !== 'var') return;
    setDurum({ ad: 'indiriliyor' });
    desktopDownload(su.adres, su.boyut).then(
      () => setDurum({ ad: 'hazir', surum: su.surum }),
      (e: unknown) => setDurum({ ad: 'hata', mesaj: hataMetni(e) }),
    );
  }, []);

  const uygula = useCallback(() => {
    if (sonuc.current.ad !== 'hazir') return;
    // Before the window goes, not after: the swap is a rename and the restart
    // is immediate, so anything still sitting in the debounce is gone.
    flush();
    desktopApply().catch((e: unknown) => setDurum({ ad: 'hata', mesaj: hataMetni(e) }));
  }, [flush]);

  const swCheck = useCallback(() => {
    void registration().then((reg) => reg?.update().catch(() => undefined));
  }, []);

  const check = kind === 'exe' ? exeCheck : swCheck;

  useEffect(() => {
    // ONLY the service worker route polls. In the exe every request to the
    // network is a button press, which is the whole contract of this feature.
    if (kind !== 'sw') return;

    // Remembered rather than read at fire time: by the time controllerchange
    // arrives the controller is the NEW worker, so asking then always says
    // yes and the first-ever registration would announce itself.
    const vardi = navigator.serviceWorker.controller !== null;
    const onChange = () => {
      if (vardi) setReady(true);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);

    swCheck();
    let sonSoru = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - sonSoru < SORMA_ARASI) return;
      sonSoru = Date.now();
      swCheck();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [kind, swCheck]);

  const reload = useCallback(() => {
    location.reload();
  }, []);

  return { kind, supported, ready, reload, check, durum, indir, uygula };
}
