// Moving every plan from the old address to the new one (DECISIONS 2026-11-16).
//
// localStorage belongs to an ORIGIN. The site is moving from
// alparslansemiz.github.io/Mozaik/ to mozaik.alparslansemiz.com, and the new
// origin starts empty: without a move, everything somebody kept on the site is
// still there but in a store the new address can never read. Nothing here
// deletes anything at the old address; the move is a copy.
//
// THE HANDSHAKE, three messages and nothing else:
//
//   old page                                   new page (opened by the old)
//   window.open(new + '?tasima=1') ───────────▶ mounts, sees ?tasima=1 and an opener
//                                  ◀─────────── { adim: 'hazir' }        to ESKI_KOKEN only
//   { adim: 'paket', paket } ─────────────────▶ to YENI_KOKEN only
//                                               asks (its own confirm, nothing written before)
//                                  ◀─────────── { adim: 'sonuc', durum }
//
// Every message is checked three ways before it is believed: the ORIGIN is the
// one expected (never a wildcard, on either side, sending or receiving), the
// SOURCE is the very window this side opened or was opened by, and the DATA has
// exactly the shape below. The payload is the same text "Tümünü dosyaya kaydet"
// writes, so the receiver reads it with the same reader as a file a stranger
// handed over (`parseBundle`, `readBundlePlans`): a message is never trusted
// further than a file would be.
//
// What the origin check cannot tell apart: alparslansemiz.github.io is shared
// by every Pages project of that account (TODO B7.28, the reason for the move).
// A page of one of them could also open the new address and offer a bundle.
// It would still be one of Alp's own pages, and it would still meet the
// receiver's question, which counts the plans before anything is replaced.

import { ESKI_KOKEN, YENI_KOKEN, YENI_SITE } from '../../leaf/app';

const TAG = 'mozaik-tasima';
const V = 1;
/** A bundle is a few hundred KB; this only stops a message nobody wrote. */
export const MAX_PAKET = 20 * 1024 * 1024;
/** How long the old page waits for the new one to say it is there. */
export const HAZIR_BEKLE = 60_000;

export type MoveMessage =
  | { tur: typeof TAG; v: typeof V; adim: 'hazir' }
  | { tur: typeof TAG; v: typeof V; adim: 'paket'; paket: string }
  | { tur: typeof TAG; v: typeof V; adim: 'sonuc'; durum: MoveOutcome; acilan: number };

/** What the receiving page did with the plans. */
export type MoveOutcome = 'acildi' | 'vazgecildi' | 'okunamadi';

interface Incoming {
  origin: string;
  source: unknown;
  data: unknown;
}

/**
 * The message, if it came from `origin` AND from `source` AND has the shape
 * of one of the three steps. Anything else is null and is ignored.
 */
export function readMoveMessage(e: Incoming, origin: string, source: unknown): MoveMessage | null {
  if (e.origin !== origin) return null;
  if (source === null || source === undefined || e.source !== source) return null;
  const d = e.data as Record<string, unknown> | null;
  if (typeof d !== 'object' || d === null || d.tur !== TAG || d.v !== V) return null;
  if (d.adim === 'hazir') return { tur: TAG, v: V, adim: 'hazir' };
  if (d.adim === 'paket') {
    if (typeof d.paket !== 'string' || d.paket.length === 0 || d.paket.length > MAX_PAKET) {
      return null;
    }
    return { tur: TAG, v: V, adim: 'paket', paket: d.paket };
  }
  if (d.adim === 'sonuc') {
    const durum = d.durum;
    if (durum !== 'acildi' && durum !== 'vazgecildi' && durum !== 'okunamadi') return null;
    const acilan = typeof d.acilan === 'number' && Number.isInteger(d.acilan) ? d.acilan : 0;
    return { tur: TAG, v: V, adim: 'sonuc', durum, acilan: Math.max(0, acilan) };
  }
  return null;
}

// ------------------------------------------------------------ the old page

/** Where the old page is in the move, for the strip to draw. */
export type SendState =
  | { ad: 'bekliyor' }
  | { ad: 'soruldu' }
  | { ad: 'bitti'; durum: MoveOutcome; acilan: number }
  /** The window was closed before it answered. Nothing moved. */
  | { ad: 'kapandi' }
  /** No window (blocked), or it never answered: the caller falls back to a file. */
  | { ad: 'acilamadi' };

export interface SendOptions {
  /** The bundle text, built at the click. */
  paket: string;
  onState: (s: SendState) => void;
  /** Injected by the tests; the real ones below. */
  target?: string;
  targetOrigin?: string;
  win?: Pick<Window, 'addEventListener' | 'removeEventListener' | 'open'>;
  wait?: number;
}

/** Opens the new address and hands it the plans. Returns a stop function. */
export function sendPlans(o: SendOptions): () => void {
  const win = o.win ?? window;
  const targetOrigin = o.targetOrigin ?? YENI_KOKEN;
  const url = new URL(o.target ?? YENI_SITE);
  url.searchParams.set('tasima', '1');

  let done = false;
  let sent = false;
  let other: Window | null = null;
  const timers: ReturnType<typeof setTimeout>[] = [];

  const stop = () => {
    done = true;
    win.removeEventListener('message', onMessage);
    for (const id of timers) {
      clearTimeout(id);
      clearInterval(id);
    }
  };
  const finish = (s: SendState) => {
    if (done) return;
    stop();
    o.onState(s);
  };

  function onMessage(e: MessageEvent) {
    if (done) return;
    const m = readMoveMessage(e, targetOrigin, other);
    if (m === null) return;
    if (m.adim === 'hazir' && !sent && other !== null) {
      sent = true;
      // The origin is spelled out, never '*': if that window has gone
      // somewhere else in the meantime, the plans go nowhere.
      other.postMessage({ tur: TAG, v: V, adim: 'paket', paket: o.paket }, targetOrigin);
      o.onState({ ad: 'soruldu' });
    } else if (m.adim === 'sonuc' && sent) {
      finish({ ad: 'bitti', durum: m.durum, acilan: m.acilan });
    }
  }

  // Listening BEFORE opening, so the first 'hazir' cannot be missed.
  win.addEventListener('message', onMessage);
  other = win.open(url.toString(), '_blank');
  if (other === null) {
    finish({ ad: 'acilamadi' });
    return stop;
  }
  o.onState({ ad: 'bekliyor' });
  timers.push(
    setTimeout(() => {
      if (!sent) finish({ ad: 'acilamadi' });
    }, o.wait ?? HAZIR_BEKLE),
  );
  // A window closed before it answered: nothing moved, and a file nobody
  // asked for would be a surprise, so this is said rather than downloaded.
  const watch = setInterval(() => {
    if (other?.closed === true) finish({ ad: 'kapandi' });
  }, 1000);
  timers.push(watch);
  return stop;
}

// ------------------------------------------------------------ the new page

/** Was this page opened to receive a move? */
export function moveRequested(search: string): boolean {
  return new URLSearchParams(search).get('tasima') === '1';
}

export interface ReceiveOptions {
  /** Asks, and opens the plans if the reader says yes. Never writes before asking. */
  onPaket: (paket: string) => Promise<{ durum: MoveOutcome; acilan: number }>;
  win?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  opener?: { postMessage: (message: unknown, targetOrigin: string) => void } | null;
  expectedOrigin?: string;
}

/**
 * Says 'hazir' to the page that opened this one, if that page is the old
 * address, and takes ONE bundle from it. Returns a stop function.
 */
export function receivePlans(o: ReceiveOptions): () => void {
  const win = o.win ?? window;
  const opener = o.opener === undefined ? (window.opener as Window | null) : o.opener;
  const origin = o.expectedOrigin ?? ESKI_KOKEN;
  if (opener === null) return () => undefined;

  let taken = false;
  const stop = () => win.removeEventListener('message', onMessage);
  function onMessage(e: MessageEvent) {
    if (taken) return;
    const m = readMoveMessage(e, origin, opener);
    if (m === null || m.adim !== 'paket') return;
    taken = true;
    stop();
    void o.onPaket(m.paket).then(
      (r) => opener?.postMessage({ tur: TAG, v: V, adim: 'sonuc', ...r }, origin),
      () =>
        opener?.postMessage(
          { tur: TAG, v: V, adim: 'sonuc', durum: 'okunamadi', acilan: 0 },
          origin,
        ),
    );
  }
  win.addEventListener('message', onMessage);
  // To the old origin only: an opener that is anything else hears nothing.
  opener.postMessage({ tur: TAG, v: V, adim: 'hazir' }, origin);
  return stop;
}

// ------------------------------------------------- does the new address answer

/**
 * Set by the site-only probe in `vite.site.config.ts` when this page runs at
 * the OLD address and the new one serves Mozaik's manifest. The probe lives
 * there, not here, so the double-clicked file stays without a single fetch
 * (site.spec.ts reads it for one).
 */
declare global {
  interface Window {
    __mozaikYeniAdres?: boolean;
  }
}
export const NEW_ADDRESS_EVENT = 'mozaik-yeni-adres';

export function newAddressLive(): boolean {
  try {
    return window.__mozaikYeniAdres === true && location.origin === ESKI_KOKEN;
  } catch {
    return false;
  }
}
