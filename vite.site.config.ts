// The SECOND build target: dist-site/, a PWA.
//
// dist/index.html — the file my father double-clicks — is built by
// vite.config.ts and is NOT touched by anything here. Two targets, one source
// tree, and the difference between them is this file.
//
// Why the site is ALSO a single file: the service worker has to know what to
// keep a copy of. With hashed chunks that list has to be generated after every
// build and kept in step; with one file the shell is a constant and can be
// read by a human. It also keeps the two targets byte-comparable — the site is
// the same app, not a variant of it.
//
// base: './' so it works both at the root and under a repository path
// (kullanici.github.io/Mozaik/), which is where GitHub Pages puts it.

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { surumBilgisi, surumEki } from './scripts/surum.mjs';
import { sozlukPaketi } from './scripts/sozluk-paket.mjs';

/** Registration is guarded twice: no service worker API, or not http(s). */
const REGISTER = `
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  });
}`;

/** The old and the new address, from the one file that holds them. */
const ADRES = JSON.parse(readFileSync(resolve('src/leaf/app/adres.json'), 'utf8')) as {
  eski: string;
  yeni: string;
};

/**
 * DOES THE NEW ADDRESS ANSWER? Asked only by a page at the OLD origin, once
 * per load, and only in the site build (DECISIONS 2026-11-16).
 *
 * Why here and not in the app. The answer cannot be a build-time switch: once
 * Pages redirects the old address, the copy there can never be updated again
 * (its service worker's update check gets a redirect), so the copy already
 * there has to find out by itself. And the double-clicked file must not carry
 * a fetch at all (site.spec.ts reads it for one); this script exists only in
 * dist-site, beside the registration above. Before the move the request fails
 * (no certificate for the new name yet) and nothing is said. Pages answers
 * every file with `access-control-allow-origin: *` (measured 2026-11-16), so
 * the manifest can be read and checked to be Mozaik's own.
 *
 * The answer reaches the app as a flag and an event (platform/storage/move.ts).
 */
const yeniAdresYoklamasi = `
if (location.origin === ${JSON.stringify(new URL(ADRES.eski).origin)} && typeof fetch === 'function') {
  fetch(${JSON.stringify(new URL('manifest.webmanifest', ADRES.yeni).toString())}, { cache: 'no-store', credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (m) {
      if (m && m.name === 'Mozaik') {
        window.__mozaikYeniAdres = true;
        dispatchEvent(new Event('mozaik-yeni-adres'));
      }
    })
    .catch(function () {});
}`;

/**
 * VISIT COUNTS for the web address only (Alp, 2026-11-16: "mozaike de kur").
 *
 * Cloudflare Web Analytics: cookieless, stores nothing on the device, sends the
 * page address, referrer, browser and country, never anything from the
 * schedule (which never leaves the device anyway). Loaded by an inline script
 * rather than a <script src> so the page is still ONE file (site.yml's grep):
 * the beacon is optional, and offline or blocked it simply does not load. Only
 * at the new origin, so localhost, the tests and the old address count nothing;
 * the double-clicked dist/index.html never has it (this file builds dist-site).
 * Automated browsers (navigator.webdriver: tests, audits, CI) are counted in a
 * separate "testler" site, so real visits stay clean and test traffic is still
 * measured. The owner's own browsers (?notrack=1 sets localStorage notrack=1,
 * ?notrack=0 clears it) load nothing.
 * The service worker only handles its own origin, so it never caches the beacon.
 */
const ziyaretSayaci = `
(function () {
  if (location.origin !== ${JSON.stringify(new URL(ADRES.yeni).origin)}) return;
  try {
    var n = new URLSearchParams(location.search).get('notrack');
    if (n === '1') localStorage.setItem('notrack', '1');
    else if (n === '0') localStorage.removeItem('notrack');
  } catch (e) {}
  try { if (localStorage.getItem('notrack') === '1') return; } catch (e) {}
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', navigator.webdriver ? '{"token": "0ead9632eeb34bfdbca243e769478158"}' : '{"token": "e166682d551741608b0cfce5d186f123"}');
  document.head.appendChild(s);
})();`;

/**
 * The manifest link and the registration script exist ONLY here.
 *
 * There is deliberately no <link rel="icon"> among them any more. index.html
 * carries the favicon as a data: URI for BOTH builds, and a second link here
 * would win in <head> order and put the DETAILED mark back in the tab — which
 * is measured to be unreadable at 16 px. One favicon, defined in one place.
 * index.html stays as it is, so the file:// build cannot pick up a service
 * worker or a fetch of any kind — "internet gerekmez" has to stay something
 * you can prove with grep. `order: 'post'` puts these after singlefile has
 * inlined everything, so it cannot take them for assets to inline.
 */
function siteShell(): Plugin {
  return {
    name: 'ders-programi-site-shell',
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        {
          tag: 'link',
          attrs: { rel: 'manifest', href: './manifest.webmanifest' },
          injectTo: 'head' as const,
        },
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#2e4ba8' },
          injectTo: 'head' as const,
        },
        {
          tag: 'script',
          children: REGISTER + yeniAdresYoklamasi + ziyaretSayaci,
          injectTo: 'body' as const,
        },
      ],
    },
  };
}

/**
 * publicDir copies EVERYTHING in site/, and some of what is in site/ is a
 * SOURCE rather than something the site serves:
 *
 *   logo-adaylari/   the two marks the chosen one beat, kept on purpose
 *   icon-small.svg   where the favicon data: URI and the .ico's 16/32 px
 *                    entries are generated FROM — nothing fetches it
 *   eski-adres/      the stub for the OLD address /ders-programi/, which is
 *                    published from its own repository, not from here
 *                    (BUILD.md, "Eski adres")
 *
 * The service worker's origin should not carry files nothing ever asks for.
 * Found by listing dist-site/ rather than by assuming.
 */
const SERVIS_EDILMEYEN = ['logo-adaylari', 'icon-small.svg', 'eski-adres'];

/** The placeholder site/sw.js carries where its cache name goes. */
const ISARET = '__SURUM__';

/**
 * The service worker's cache name is stamped with the build, here, and the
 * source file keeps a placeholder instead of a number.
 *
 * MEASURED, and it was the whole update bug: with a fixed name the browser
 * byte-compares sw.js, finds it unchanged, and never runs `install` again —
 * so `addAll(SHELL)` never re-fetches the app and a new deploy arrives one
 * load late, quietly. A name that moves with the build makes `install` run,
 * the shell refresh, and `activate` delete what came before.
 *
 * publicDir copies sw.js verbatim, so the rewrite happens in closeBundle on
 * the OUTPUT — site/sw.js is never edited by hand or by a build.
 */
function stampServiceWorker(): Plugin {
  return {
    name: 'ders-programi-site-sw-damgasi',
    closeBundle() {
      const out = resolve('dist-site', 'sw.js');
      const src = readFileSync(out, 'utf8');
      if (!src.includes(ISARET)) {
        // Loud, because a silent miss here is invisible until my father is a
        // version behind and neither of us can tell.
        throw new Error(`site/sw.js icinde ${ISARET} yok — cache adi damgalanamaz`);
      }
      writeFileSync(out, src.replaceAll(ISARET, surumEki()), 'utf8');
    },
  };
}

function dropUnserved(): Plugin {
  return {
    name: 'ders-programi-site-servis-edilmeyeni-atla',
    closeBundle() {
      for (const name of SERVIS_EDILMEYEN) {
        rmSync(resolve('dist-site', name), { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: 'site',
  plugins: [
    sozlukPaketi(),
    react(),
    viteSingleFile(),
    siteShell(),
    dropUnserved(),
    stampServiceWorker(),
  ],
  // Same record as vite.config.ts: the site and the double-clicked file are
  // the same app and have to say the same thing about which build they are.
  define: { __SURUM__: JSON.stringify(surumBilgisi()) },
  build: {
    outDir: 'dist-site',
    emptyOutDir: true,
    target: 'es2020',
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000_000,
    reportCompressedSize: false,
  },
});
