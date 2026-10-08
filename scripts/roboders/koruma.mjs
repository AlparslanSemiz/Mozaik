// The one gate between this repository and my father's Roboders account.
//
// WHAT IS ON THE OTHER SIDE. Roboders is a cloud program, and the account it
// opens holds my father's real timetable. There is no undo and no backup we
// can reach: a request that writes is a change to his data, for good. The
// contract is in docs/ROBODERS.md ("R6 GÜVENLİK SÖZLEŞMESİ"): look, never
// touch. This file is that contract as code, so a tour does not depend on
// nobody ever making a mistake.
//
// THREE LAYERS, because each one has a hole the next one covers:
//
//   1. The network. Inside the browser context only GET and HEAD leave the
//      machine. POST, PUT, PATCH, DELETE, OPTIONS and every other method is
//      aborted before it is sent, and so is every WebSocket. A service worker
//      could send requests the context's router never sees, so service workers
//      are blocked outright (`serviceWorkers: 'block'`).
//   2. A GET that writes. Nothing stops a server from deleting on a GET, so a
//      GET whose address carries a writing word (sil, kaydet, delete, ...) is
//      aborted too. It will also stop some harmless pages; that is the price.
//   3. The click. A button that sends, saves or deletes is never pressed, even
//      if the network would have stopped it: `tiklanabilir()` refuses by name,
//      and refuses table cells, form fields and draggable things outright.
//
// Every refusal is written to a log in scratch/roboders/, which is outside git:
// method, address without its query string, and why. Never a request body,
// because a body may carry a person's name.
//
// Proven before any tour, against a local server, by e2e/roboders-koruma.spec.ts.

import { appendFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const KOK = resolve(import.meta.dirname, '..', '..');

/** Where a tour starts. The only Roboders fact in this repository. */
export const BASLANGIC = 'https://roboders.com/';

/** Hosts a tour may navigate to. */
export const IZINLI_SITE = /(^|\.)roboders\.com$/;

/** Everything a tour writes, outside git: session, logs, screenshots, notes. */
export const KLASOR = join(KOK, 'scratch', 'roboders');
export const OTURUM = join(KLASOR, 'oturum.json');

/** The only methods that leave the machine. */
const IZINLI_YONTEM = new Set(['GET', 'HEAD']);

/**
 * Lower case, Turkish letters folded to their plain twins, accents dropped:
 * `KAYDET`, `Kaydet` and `kaydet` are one word, and so are `Gönder` and
 * `gonder`. The Turkish locale first, because `I` lowers to `ı` there.
 */
export function katla(metin) {
  return String(metin)
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/**
 * Words that write, as a button name or inside an address. A short word must
 * start a word (`sil`, but not the `sil` inside `basili`); a long one may sit
 * anywhere (`delete` inside `teacherdelete`).
 */
const YAZAN = [
  'kaydet',
  'sil',
  'ekle',
  'yeni',
  'olustur',
  'dagit',
  'gonder',
  'yayinla',
  'aktar',
  'onayla',
  'tamam',
  'evet',
  'uygula',
  'kopyala',
  'tasi',
  'temizle',
  'kaldir',
  'sifirla',
  'guncelle',
  'duzenle',
  'degistir',
  'kilit',
  'yukle',
  'eposta',
  'e-posta',
  'mail',
  'eyotek',
  'save',
  'delete',
  'remove',
  'send',
  'publish',
  'submit',
  'create',
  'insert',
  'update',
  'edit',
  'add',
  'new',
  'apply',
  'copy',
  'move',
  'clear',
  'reset',
  'lock',
  'import',
  'export',
  'upload',
  'ok',
  'yes',
  'confirm',
  'approve',
];

// The words are letters and one dash, and a dash outside a class is a plain
// character, so nothing needs escaping (and `\-` is an error under `u`).
function kelimeKalibi(kelime) {
  return kelime.length >= 6 ? kelime : `(?:^|[^\\p{L}\\p{N}])${kelime}`;
}
const YAZAN_KALIP = new RegExp(`(?:${YAZAN.map(kelimeKalibi).join('|')})`, 'u');

/** Whether a folded text carries a writing word, and which one. */
export function yazanKelime(metin) {
  const m = YAZAN_KALIP.exec(katla(metin));
  return m === null ? null : m[0].replace(/^[^\p{L}\p{N}]/u, '');
}

/** The part of an address a log may keep: origin and path, no query. */
export function kisalt(adres) {
  try {
    const u = new URL(adres);
    return u.origin + u.pathname;
  } catch {
    return String(adres).split('?')[0];
  }
}

/** May this request leave the machine? `{ izin, sebep }`, sebep in Turkish. */
export function izinVerilir(yontem, adres) {
  const y = String(yontem).toUpperCase();
  if (!IZINLI_YONTEM.has(y)) return { izin: false, sebep: `${y} gönderilmez` };
  let yol = String(adres);
  try {
    const u = new URL(adres);
    yol = decodeURIComponent(u.pathname + u.search);
  } catch {
    // An address that does not parse is judged as the text it is.
  }
  const kelime = yazanKelime(yol);
  if (kelime !== null) return { izin: false, sebep: `adreste "${kelime}" var` };
  return { izin: true, sebep: '' };
}

/**
 * May this element be clicked? Takes what `hedefBilgisi()` read off the page.
 * A table cell, a form field, a draggable thing or a submit button is refused
 * whatever it is called; anything else is refused if its name writes.
 */
export function tiklanabilir(hedef) {
  if (hedef.hucrede) return { izin: false, sebep: 'bir tablo hücresi' };
  if (hedef.formAlani) return { izin: false, sebep: 'bir form alanı' };
  if (hedef.suruklenebilir) return { izin: false, sebep: 'sürüklenebilir bir öğe' };
  if (hedef.gonderir) return { izin: false, sebep: 'formu gönderen bir düğme' };
  const kelime = yazanKelime(hedef.ad);
  if (kelime !== null) return { izin: false, sebep: `adında "${kelime}" var` };
  if (katla(hedef.ad).trim() === '') return { izin: false, sebep: 'adı yok, ne olduğu bilinmiyor' };
  return { izin: true, sebep: '' };
}

/** Reads what `tiklanabilir()` needs off a single element on the page. */
export async function hedefBilgisi(locator) {
  return locator.evaluate((el) => {
    const metin = el instanceof HTMLElement ? el.innerText : el.textContent;
    const deger = el instanceof HTMLInputElement ? el.value : '';
    const form = el.closest('form');
    const dugme = el instanceof HTMLButtonElement || el instanceof HTMLInputElement;
    const tip = (
      el.getAttribute('type') ?? (el instanceof HTMLButtonElement ? 'submit' : '')
    ).toLowerCase();
    return {
      ad: (
        el.getAttribute('aria-label') ||
        metin ||
        el.getAttribute('title') ||
        deger ||
        ''
      ).trim(),
      hucrede: el.closest('td, th, [role="gridcell"], [role="cell"]') !== null,
      formAlani:
        el.matches('input:not([type="submit"]):not([type="button"]), textarea, select') ||
        el.closest('[contenteditable=""], [contenteditable="true"]') !== null,
      suruklenebilir: el.closest('[draggable="true"]') !== null,
      gonderir: dugme && tip === 'submit' && form !== null,
    };
  });
}

/** A log writer: one JSON line per refusal, in KLASOR. */
export function gunlukYazici(
  dosya = join(KLASOR, `engellenen-${new Date().toISOString().slice(0, 10)}.jsonl`),
) {
  mkdirSync(resolve(dosya, '..'), { recursive: true, mode: 0o700 });
  return (kayit) => {
    appendFileSync(dosya, JSON.stringify({ zaman: new Date().toISOString(), ...kayit }) + '\n');
  };
}

/**
 * Layer zero, inside the page. MEASURED HOLE, not a supposition: a request a
 * page sends while it is being left -- `fetch(..., { keepalive: true })` or
 * `sendBeacon` from `pagehide`, `beforeunload` or `visibilitychange` --
 * reached our test server PAST `context.route`, on a plain navigation to
 * another page and on `page.close()`. Closing the whole context or browser
 * sent nothing. Every click on a link is a navigation, so the router alone
 * cannot keep a tour read-only.
 *
 * So this runs in every frame before the page's own scripts: a writing
 * fetch or XHR fails in the page, `sendBeacon` sends nothing, and the page
 * cannot listen for being left at all. Every refusal is reported through
 * `__saltOkunur`, the binding `koru()` exposes, so it reaches the same log as
 * the router's. It is a function because `addInitScript` sends its source
 * text to the page; it closes over nothing.
 */
function sayfaKorumasi() {
  const OKUR = new Set(['GET', 'HEAD']);
  const yontem = (m) => String(m ?? 'GET').toUpperCase();
  const bildir = (y, adres, sebep) => {
    try {
      void window.__saltOkunur?.({
        yontem: y,
        adres: new URL(String(adres), location.href).href,
        sebep,
      });
    } catch {
      // A page that broke the binding loses its log line, not its guard.
    }
  };
  const asilFetch = window.fetch;
  window.fetch = function (girdi, ayar) {
    const m = yontem(ayar?.method ?? (girdi instanceof Request ? girdi.method : 'GET'));
    if (!OKUR.has(m)) {
      bildir(m, girdi instanceof Request ? girdi.url : girdi, `sayfada ${m} fetch durduruldu`);
      return Promise.reject(new TypeError('salt okunur'));
    }
    if (girdi instanceof Request && girdi.keepalive)
      girdi = new Request(girdi, { keepalive: false });
    return asilFetch.call(this, girdi, ayar === undefined ? ayar : { ...ayar, keepalive: false });
  };
  Navigator.prototype.sendBeacon = (adres) => {
    bildir('POST', adres, 'sayfada sendBeacon durduruldu');
    return false;
  };
  const asilOpen = XMLHttpRequest.prototype.open;
  const asilSend = XMLHttpRequest.prototype.send;
  const yazar = new WeakMap();
  XMLHttpRequest.prototype.open = function (m, adres, ...kalan) {
    if (!OKUR.has(yontem(m))) yazar.set(this, [yontem(m), adres]);
    return asilOpen.call(this, m, adres, ...kalan);
  };
  XMLHttpRequest.prototype.send = function (...kalan) {
    const yazan = yazar.get(this);
    if (yazan !== undefined) {
      bildir(yazan[0], yazan[1], `sayfada ${yazan[0]} XHR durduruldu`);
      throw new DOMException('salt okunur', 'NetworkError');
    }
    return asilSend.apply(this, kalan);
  };
  const CIKIS = new Set(['pagehide', 'beforeunload', 'unload', 'visibilitychange', 'freeze']);
  const asilEkle = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (tur, ...kalan) {
    if (CIKIS.has(tur) && (this === window || this === document)) {
      bildir('DINLEYICI', location.href, `${tur} dinleyicisi kaydedilmedi`);
      return undefined;
    }
    return asilEkle.call(this, tur, ...kalan);
  };
  for (const [hedef, adlar] of [
    [window, ['onpagehide', 'onbeforeunload', 'onunload']],
    [document, ['onvisibilitychange', 'onfreeze']],
  ]) {
    for (const ad of adlar) {
      Object.defineProperty(hedef, ad, { configurable: false, get: () => null, set: () => {} });
    }
  }
}

/**
 * Puts the guard's layers on a context, before any page exists, and dismisses
 * every native dialog (`confirm` answers "İptal"). Returns nothing: after this
 * the context is guarded for its whole life. A tour ends by closing the
 * browser, never a page: closing a page is one of the measured holes.
 */
export async function koru(context, gunluk) {
  // Before the init script, so the binding is there when the page first calls it.
  await context.exposeBinding('__saltOkunur', (_kaynak, k) =>
    gunluk({
      yontem: String(k?.yontem ?? '?'),
      adres: kisalt(String(k?.adres ?? '')),
      tur: 'sayfa',
      sebep: String(k?.sebep ?? ''),
    }),
  );
  await context.addInitScript(sayfaKorumasi);
  await context.route('**/*', async (route) => {
    const istek = route.request();
    const karar = izinVerilir(istek.method(), istek.url());
    if (karar.izin) return route.continue();
    gunluk({
      yontem: istek.method(),
      adres: kisalt(istek.url()),
      tur: istek.resourceType(),
      sebep: karar.sebep,
    });
    return route.abort('blockedbyclient');
  });
  // Not connecting to the server is what keeps it closed: a routed socket only
  // reaches the server if the handler calls `connectToServer()`.
  await context.routeWebSocket(/.*/, (ws) => {
    gunluk({
      yontem: 'WEBSOCKET',
      adres: kisalt(ws.url()),
      tur: 'websocket',
      sebep: 'websocket açılmaz',
    });
    void ws.close({ code: 1008, reason: 'salt okunur' });
  });
  const diyalog = (sayfa) =>
    sayfa.on('dialog', (d) => {
      gunluk({
        yontem: 'DIYALOG',
        adres: kisalt(sayfa.url()),
        tur: d.type(),
        sebep: 'diyalog İptal ile kapandı',
      });
      void d.dismiss();
    });
  context.pages().forEach(diyalog);
  context.on('page', diyalog);
}

/** A guarded context: service workers and downloads off, then `koru()`. */
export async function guvenliBaglam(browser, { oturum, gunluk }) {
  const context = await browser.newContext({
    serviceWorkers: 'block',
    acceptDownloads: false,
    storageState: oturum,
    viewport: { width: 1920, height: 1080 },
    locale: 'tr-TR',
  });
  await koru(context, gunluk);
  return context;
}
