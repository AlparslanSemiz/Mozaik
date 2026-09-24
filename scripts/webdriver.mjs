// The real exe, driven from outside. Shared by scripts/exe-surucu.mjs (the
// command Claude runs from a shell) and e2e/gercek-exe.spec.ts (the suite).
//
// WHY NOT PLAYWRIGHT. On Linux the exe's window is a WebKitGTK webview, and
// Playwright can only drive the browsers it ships. What does drive it is the
// WebDriver protocol: `tauri-driver` (cargo install tauri-driver --locked)
// stands in front of `/usr/bin/WebKitWebDriver`, starts the program with
// TAURI_WEBVIEW_AUTOMATION=true -- the switch tauri-runtime-wry reads before it
// lets automation in -- and answers plain JSON over HTTP. So the client is
// `fetch` and nothing else: no new dependency for twenty endpoints.
//
// WHY A SANDBOX HOME. The program writes to Documents/Ders Programı, and on
// this machine that folder holds my father's real plan. Every run gets its own
// HOME and XDG directories, so neither that folder nor WebKit's real
// localStorage is ever touched by a test.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const KOK = resolve(import.meta.dirname, '..');

/** The binary `npm run exe:linux` leaves behind, else the raw cargo output. */
export function varsayilanIkili() {
  const kopya = join(KOK, 'dist-exe', 'Mozaik');
  return existsSync(kopya) ? kopya : join(KOK, 'src-tauri', 'target', 'release', 'ders-programi');
}

/**
 * A fresh HOME with a Documents folder the program can find. `document_dir()`
 * reads user-dirs.dirs; without it there is no Documents folder at all and the
 * save path fails, which is not what the real machine does.
 */
export function evHazirla(ev, { koru = false } = {}) {
  if (!koru) rmSync(ev, { recursive: true, force: true });
  const ayar = join(ev, '.config');
  mkdirSync(join(ev, 'Documents'), { recursive: true });
  mkdirSync(ayar, { recursive: true });
  writeFileSync(join(ayar, 'user-dirs.dirs'), 'XDG_DOCUMENTS_DIR="$HOME/Documents"\n');
  const yerel = join(ev, '.local');
  return {
    HOME: ev,
    XDG_CONFIG_HOME: ayar,
    XDG_DATA_HOME: join(yerel, 'share'),
    XDG_CACHE_HOME: join(ev, '.cache'),
  };
}

/** Is `xvfb-run` there? Then the window opens off-screen instead of on the desktop. */
export function basizMumkun() {
  return spawnSync('sh', ['-c', 'command -v xvfb-run'], { stdio: 'ignore' }).status === 0;
}

/**
 * Starts tauri-driver detached, so it outlives the shell command that started
 * it. Returns its pid; the caller keeps it to tear it down.
 */
export function suruculuBaslat({ port = 4444, ev, gorunur = false, gunluk, dil = 'tr_TR' }) {
  // The language is pinned for the same reason the browser suites pin
  // `locale: 'tr-TR'`: with nothing stored the interface follows the device,
  // WebKitGTK reads the device from LANG, and this machine is English.
  const yerel = `${dil}.UTF-8`;
  const env = {
    ...process.env,
    ...evHazirla(ev, { koru: true }),
    LANG: yerel,
    LC_ALL: yerel,
    LANGUAGE: dil,
  };
  const basiz = !gorunur && basizMumkun();
  const komut = basiz ? 'xvfb-run' : 'tauri-driver';
  const argumanlar = basiz
    ? ['-a', 'tauri-driver', '--port', String(port), '--native-port', String(port + 1)]
    : ['--port', String(port), '--native-port', String(port + 1)];
  const cikti = gunluk === undefined ? 'ignore' : openSync(gunluk, 'a');
  const surec = spawn(komut, argumanlar, {
    env,
    detached: true,
    stdio: ['ignore', cikti, cikti],
  });
  surec.unref();
  return { pid: surec.pid, basiz };
}

/** One WebDriver session. Everything is a method so a test reads like a script. */
export class Oturum {
  constructor(port, id) {
    this.port = port;
    this.id = id;
  }

  static async ac({ port = 4444, ikili, bekleMs = 20_000 }) {
    const son = Date.now() + bekleMs;
    let hata;
    // The driver needs a moment to listen, and the first session a moment
    // more to start WebKit. Retry until the deadline rather than guess a sleep.
    while (Date.now() < son) {
      try {
        const cevap = await istek(port, 'POST', '/session', {
          capabilities: {
            alwaysMatch: { 'tauri:options': { application: ikili } },
          },
        });
        return new Oturum(port, cevap.sessionId);
      } catch (e) {
        hata = e;
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    throw new Error(`Oturum açılamadı: ${hata?.message ?? hata}`);
  }

  yol(alt) {
    return `/session/${this.id}${alt}`;
  }

  async komut(yontem, alt, govde) {
    return istek(this.port, yontem, this.yol(alt), govde);
  }

  // INPUT IS MADE IN THE PAGE, NOT BY THE DRIVER. WebKitGTK 2.52.5 on this
  // machine answers "unsupported operation" to every synthesized click, key
  // and pointer action -- the same with WebKit's own MiniBrowser, so it is the
  // system's WebKit and not Tauri (measured 2026-09-24). What does work is
  // script, screenshots and the window. So a click is a pointerdown/up pair
  // plus `click()` dispatched on the element, a key is a KeyboardEvent on the
  // focused element, and a drag is pointer events along a path, which is all
  // platform/drag.ts listens to. The page cannot tell them from a hand except
  // by `isTrusted`, which nothing in src reads.

  /**
   * Finds one element. `@12` is a ref from `agac()`, `metin:Kaydet` is the
   * innermost VISIBLE element whose text contains it (buttons and links
   * first), anything else is CSS. Throws with the selector when nothing is
   * there.
   */
  async bul(secici) {
    const bulundu = await this.js(`${BUL} return !!bul(args[0]);`, secici);
    if (!bulundu) throw new Error(`Bulunamadı: ${secici}`);
    return secici;
  }

  /**
   * Clicks it. The click itself is queued rather than run inside the script,
   * so a click that opens a native confirm() does not hold the driver's answer
   * hostage until somebody closes the dialog.
   */
  async tikla(secici) {
    await this.bul(secici);
    await this.js(
      `${BUL}
      const el = bul(args[0]);
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect();
      const o = { bubbles: true, cancelable: true, composed: true, clientX: r.x + r.width / 2,
        clientY: r.y + r.height / 2, button: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true };
      el.dispatchEvent(new PointerEvent('pointerdown', { ...o, buttons: 1 }));
      el.dispatchEvent(new MouseEvent('mousedown', { ...o, buttons: 1 }));
      if (typeof el.focus === 'function') el.focus();
      el.dispatchEvent(new PointerEvent('pointerup', o));
      el.dispatchEvent(new MouseEvent('mouseup', o));
      // NOT el.click(): that is a click with detail 0, which the grid reads as
      // a keyboard press (Grid.tsx) and answers by sending the card back to
      // the pool. A mouse click says detail 1.
      setTimeout(() => el.dispatchEvent(new MouseEvent('click', { ...o, detail: 1 })), 0);
      await new Promise((r) => setTimeout(r, 30));`,
      secici,
    );
  }

  /**
   * Replaces the field's value, the way a person selecting all and typing
   * would. Through the prototype's setter, because React keeps its own copy of
   * the value and ignores an assignment it did not see.
   */
  async yaz(secici, metin) {
    await this.bul(secici);
    await this.js(
      `${BUL}
      const el = bul(args[0]);
      el.focus();
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
        : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, args[1]);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));`,
      secici,
      metin,
    );
  }

  async metin(secici) {
    await this.bul(secici);
    return this.js(`${BUL} return bul(args[0]).innerText;`, secici);
  }

  /** A key (`Enter`, `Escape`, `a`) or a chord (`Control+z`) to whatever has focus. */
  async tus(ad) {
    await this.js(
      `const parca = args[0].split('+');
      const key = parca[parca.length - 1];
      const mod = new Set(parca.slice(0, -1));
      const hedef = document.activeElement ?? document.body;
      const o = { key, code: key.length === 1 ? 'Key' + key.toUpperCase() : key, bubbles: true,
        cancelable: true, ctrlKey: mod.has('Control'), shiftKey: mod.has('Shift'),
        altKey: mod.has('Alt'), metaKey: mod.has('Meta') };
      hedef.dispatchEvent(new KeyboardEvent('keydown', o));
      hedef.dispatchEvent(new KeyboardEvent('keyup', o));
      await new Promise((r) => setTimeout(r, 30));`,
      ad,
    );
  }

  /**
   * Drags from one element's centre to another's, in `adim` pointer moves one
   * frame apart -- the drag in platform/drag.ts reads the cell under the
   * pointer once a frame, so a jump straight to the end would skip what a hand
   * shows on the way.
   */
  async surukle(kaynak, hedef, adim = 12) {
    await this.bul(kaynak);
    await this.bul(hedef);
    await this.js(
      `${BUL}
      const a = bul(args[0]);
      const b = bul(args[1]);
      a.scrollIntoView({ block: 'center' });
      const ra = a.getBoundingClientRect();
      const x0 = ra.x + ra.width / 2, y0 = ra.y + ra.height / 2;
      const kare = () => new Promise((r) => requestAnimationFrame(() => r()));
      const olay = (tur, x, y, buttons) => {
        const o = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y,
          button: 0, buttons, pointerId: 1, pointerType: 'mouse', isPrimary: true };
        (document.elementFromPoint(x, y) ?? document.body).dispatchEvent(new PointerEvent(tur, o));
      };
      // At the innermost element under the point, as a hand would press it: the
      // grid's listener sits on the card INSIDE the cell, and an event sent to
      // the cell bubbles up, never down to it.
      olay('pointerdown', x0, y0, 1);
      await kare();
      let rb = b.getBoundingClientRect();
      for (let i = 1; i <= args[2]; i++) {
        rb = b.getBoundingClientRect();
        const x1 = rb.x + rb.width / 2, y1 = rb.y + rb.height / 2;
        olay('pointermove', x0 + ((x1 - x0) * i) / args[2], y0 + ((y1 - y0) * i) / args[2], 1);
        await kare();
      }
      await kare();
      olay('pointerup', rb.x + rb.width / 2, rb.y + rb.height / 2, 0);
      await kare();`,
      kaynak,
      hedef,
      adim,
    );
  }

  /**
   * Runs `govde` as the body of an async function in the page and returns
   * what it returns. `window.__TAURI__.core.invoke` is there too, so this
   * reaches the Rust commands as well as the DOM.
   */
  async js(govde, ...argumanlar) {
    const script = `const done = arguments[arguments.length - 1];
      (async (...args) => { ${govde} })(...Array.prototype.slice.call(arguments, 0, -1))
        .then((v) => done({ ok: true, v }), (e) => done({ ok: false, e: String(e && e.stack || e) }));`;
    const cevap = await this.komut('POST', '/execute/async', { script, args: argumanlar });
    if (!cevap.value?.ok) throw new Error(`Sayfadaki betik düştü: ${cevap.value?.e}`);
    return cevap.value.v;
  }

  async bekle(secici, ms = 10_000) {
    const son = Date.now() + ms;
    for (;;) {
      try {
        return await this.bul(secici);
      } catch (e) {
        if (Date.now() > son) throw e;
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  /**
   * The native confirm/prompt the page opened (window.confirm), answered.
   * Returns its text so a test can say which question it said yes to.
   */
  async onayla(evet = true) {
    const metin = (await this.komut('GET', '/alert/text')).value;
    await this.komut('POST', evet ? '/alert/accept' : '/alert/dismiss', {});
    return metin;
  }

  /** PNG bytes of the webview. */
  async goruntu() {
    const cevap = await this.komut('GET', '/screenshot');
    return Buffer.from(cevap.value, 'base64');
  }

  async pencere(genislik, yukseklik) {
    if (genislik === undefined) return (await this.komut('GET', '/window/rect')).value;
    return (await this.komut('POST', '/window/rect', { width: genislik, height: yukseklik })).value;
  }

  /** A text outline of what is on screen, and a ref (`@N`) on every control. */
  async agac() {
    return this.js(AGAC);
  }

  async kapat() {
    try {
      await this.komut('DELETE', '');
    } catch {
      // Already gone: the window was closed by hand, or the program exited.
    }
  }
}

/**
 * Page-side lookup, shared by every input method: `bul(secici)` in the
 * page. Hidden elements (React's <Activity> keeps whole tabs in the DOM) do
 * not count, and neither does text inside <script>: the bundle is inline and
 * carries every sentence of the interface.
 */
const BUL = `
  const gorunur = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const bul = (s) => {
    if (/^@\\d+$/.test(s)) return document.querySelector('[data-surucu="' + s.slice(1) + '"]');
    if (s.startsWith('metin:')) {
      const aranan = s.slice(6);
      const tut = (el) => gorunur(el) && (el.innerText ?? '').includes(aranan);
      const oncelik = [...document.querySelectorAll('button, a[href], [role=button], [role=tab], [role=menuitem], label, summary')].filter(tut);
      if (oncelik.length) return oncelik.sort((x, y) => x.innerText.length - y.innerText.length)[0];
      const hepsi = [...document.body.querySelectorAll('*')].filter((el) => !['SCRIPT', 'STYLE'].includes(el.tagName) && tut(el));
      return hepsi.find((el) => ![...el.children].some(tut)) ?? null;
    }
    const el = document.querySelector(s);
    return el && gorunur(el) ? el : null;
  };
`;

async function istek(port, yontem, yol, govde) {
  const cevap = await fetch(`http://127.0.0.1:${port}${yol}`, {
    method: yontem,
    headers: { 'content-type': 'application/json' },
    body: govde === undefined ? undefined : JSON.stringify(govde),
  });
  const json = await cevap.json().catch(() => ({}));
  if (!cevap.ok) {
    const ne = [json.value?.error, json.value?.message].filter(Boolean).join(': ');
    throw new Error(`${yontem} ${yol}: ${ne || cevap.status}`);
  }
  return json.value?.sessionId !== undefined ? json.value : json;
}

/**
 * Runs in the page. Numbers every visible control and heading with
 * `data-surucu`, so `@N` can be clicked, and returns one line per element:
 * ref, role, accessible name, state. Hidden tabs (React's <Activity>) are
 * skipped because a hidden element has no client rects.
 */
const AGAC = `
  const secici = 'button, a[href], input, select, textarea, summary, [role], [tabindex]:not([tabindex="-1"]), h1, h2, h3, h4';
  document.querySelectorAll('[data-surucu]').forEach((el) => el.removeAttribute('data-surucu'));
  const satirlar = [];
  let n = 0;
  const ad = (el) => {
    const etiket = el.getAttribute('aria-label');
    if (etiket) return etiket;
    const by = el.getAttribute('aria-labelledby');
    if (by) return by.split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
    if (el.labels && el.labels[0]) return el.labels[0].textContent;
    return el.innerText || el.getAttribute('title') || el.getAttribute('placeholder') || el.value || '';
  };
  for (const el of document.querySelectorAll(secici)) {
    if (el.getClientRects().length === 0) continue;
    const stil = getComputedStyle(el);
    if (stil.visibility === 'hidden' || stil.display === 'none') continue;
    n++;
    el.setAttribute('data-surucu', String(n));
    const rol = el.getAttribute('role') || el.tagName.toLowerCase();
    const durum = [];
    for (const a of ['aria-selected', 'aria-pressed', 'aria-checked', 'aria-expanded', 'aria-current']) {
      const v = el.getAttribute(a);
      if (v !== null && v !== 'false') durum.push(a.slice(5) + (v === 'true' ? '' : '=' + v));
    }
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') durum.push('disabled');
    if (el === document.activeElement) durum.push('focused');
    const metin = String(ad(el)).replace(/\\s+/g, ' ').trim().slice(0, 80);
    satirlar.push('@' + n + ' ' + rol + (metin ? ' "' + metin + '"' : '') + (durum.length ? ' [' + durum.join(', ') + ']' : ''));
  }
  return satirlar.join('\\n');
`;
