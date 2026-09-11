// The error trap every E2E test runs inside.
//
// WHAT IT CLOSES. Until this file existed, a test could pass while the page
// underneath it was throwing on every render. 415 tests, and not one of them
// looked at the console: they asked whether a button was there and what it
// said, and a React error boundary, an unhandled rejection or a failed
// `invoke` said nothing to any of them. The one thing a browser tells you for
// free was the one thing nobody read.
//
// It also closes the offline principle mechanically, and in more than one place. The
// claim "çalışma anında ağdan tek bayt çekilmez" had exactly one test
// (temel.spec.ts) watching exactly one page load. Now every test on the
// file:// build watches, so a stray font, a CDN script or a version check
// added anywhere turns the whole suite red instead of one specific test.
//
// WHY A FIXTURE AND NOT A HELPER. A helper has to be called, and the tests
// that would forget to call it are exactly the ones being written when
// something is going wrong. `auto: true` means it cannot be forgotten.
//
// The escape hatch is deliberate and narrow: `beklenenHata` names a message a
// test EXPECTS, because "29. Hata yolları" is a real describe block and a page
// that prints nothing when a file fails to parse would be the actual bug.

import { test as base, expect, type Page } from '@playwright/test';

/** Schemes that are not network: the page itself, and what it inlines. */
const YEREL = ['file:', 'data:', 'blob:', 'about:', 'chrome-error:'];

interface Kapan {
  /** Console messages this test is expected to produce. */
  beklenen: RegExp[];
  hatalar: string[];
  istekler: string[];
}

const kapanlar = new WeakMap<Page, Kapan>();

/**
 * Says that this test expects a console error matching `desen`.
 *
 * Use it where the page printing something IS the behaviour under test. Never
 * to quiet a message nobody understands: an unexplained error in the console
 * is a bug that has not been found yet, and silencing it here is how it stays
 * unfound.
 */
export function beklenenHata(page: Page, desen: RegExp) {
  kapanlar.get(page)?.beklenen.push(desen);
}

export const test = base.extend<{ kapan: void }>({
  kapan: [
    async ({ page }, use) => {
      const kapan: Kapan = { beklenen: [], hatalar: [], istekler: [] };
      kapanlar.set(page, kapan);

      // THE LANGUAGE is pinned by `locale: 'tr-TR'` in the Playwright configs,
      // and deliberately NOT here.
      //
      // Every locator in this suite is a Turkish sentence, and the interface
      // follows `navigator.language` when nothing is stored. On a machine set
      // to English that would move roughly five hundred locators at once.
      //
      // This fixture used to seed `ders-programi-dil` from `addInitScript`,
      // and that seed was the "flaky under load" of the suite (pitfall 108).
      // On file://, Chromium now and then starts the NEXT document (a reload)
      // from an old or even empty localStorage when a script touched storage
      // at the very start of the current one, even only to read it. Measured
      // on 2026-09-11 with the app itself and fast reloads: no init script, 0
      // stale starts in 400; an init script that only reads, 5 in 200. Every
      // test that wrote a preference and reloaded could read it back stale.
      // A locale sets `navigator.language` without touching storage at all.

      page.on('console', (m) => {
        if (m.type() === 'error') kapan.hatalar.push(`console.error: ${m.text()}`);
      });
      // Anything that reached `window.onerror`, including an unhandled
      // promise rejection: a `.then` without a `.catch` on the update path
      // would show up here and nowhere else.
      page.on('pageerror', (e) => kapan.hatalar.push(`pageerror: ${e.message}`));
      page.on('request', (r) => {
        if (!YEREL.some((s) => r.url().startsWith(s))) kapan.istekler.push(r.url());
      });

      await use();

      const kalan = kapan.hatalar.filter((h) => !kapan.beklenen.some((d) => d.test(h)));
      const sorunlar: string[] = [];
      if (kalan.length > 0) {
        sorunlar.push(`Sayfa ${kalan.length} hata bastı:\n  ${kalan.join('\n  ')}`);
      }
      // Only on the double-clicked file. The site and the local server are
      // served over http on purpose, and asking their own origin for their own
      // bytes is the whole point of them.
      if (page.url().startsWith('file:') && kapan.istekler.length > 0) {
        sorunlar.push(
          `İLKE 3: file:// altında ağa çıkıldı:\n  ${[...new Set(kapan.istekler)].join('\n  ')}`,
        );
      }
      if (sorunlar.length > 0) throw new Error(sorunlar.join('\n\n'));
    },
    { auto: true },
  ],
});

export { expect };

// The trap is the entry point for the whole suite, so `Page` comes through it
// too: a spec that imported `test` from here and `Page` from @playwright/test
// would be naming two things that must stay the same type.
export type { Page };
