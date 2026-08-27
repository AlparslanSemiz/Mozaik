// The error trap every E2E test runs inside.
//
// WHAT IT CLOSES. Until this file existed, a test could pass while the page
// underneath it was throwing on every render. 415 tests, and not one of them
// looked at the console: they asked whether a button was there and what it
// said, and a React error boundary, an unhandled rejection or a failed
// `invoke` said nothing to any of them. The one thing a browser tells you for
// free was the one thing nobody read.
//
// It also closes principle 3 mechanically, and in more than one place. The
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

      // THE LANGUAGE, pinned before anything loads.
      //
      // Every locator in this suite is a Turkish sentence, and since the
      // language round the interface follows `navigator.language` when nothing
      // is stored. On a machine set to English that moves roughly five hundred
      // locators at once, and it looks like five hundred separate bugs.
      //
      // Here rather than in `helpers.open()` for the same reason the error trap
      // is here: `auto: true` cannot be forgotten, and three of these spec
      // files navigate with `page.goto('/')` against the local server without
      // going through any helper at all.
      //
      // It SEEDS rather than dictates (pitfall 68): a test that deliberately
      // chooses another language and reloads keeps its choice.
      await page.addInitScript(() => {
        try {
          if (localStorage.getItem('ders-programi-dil') === null) {
            localStorage.setItem('ders-programi-dil', 'tr');
          }
        } catch {
          // A language that cannot be stored still defaults sensibly.
        }
      });

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
