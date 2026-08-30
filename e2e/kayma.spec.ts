// 76. NOTHING MOVES WHEN YOU MOVE ALONG THE SECOND BAR.
//
//   "ikinci sectionda yani alt bardaki seçeneklerin arasında geçerken bazen
//    böyle kayıyor gibi oluyor onu hallet."
//
// Two independent causes, both measured, both "sometimes" for the same reason:
// each one fires on some pairs of options and not others, so the strip looked
// unstable rather than broken.
//
//   1. THE STRIP MOVED ITSELF. `.ribbon-group` is a grid of equal columns, so
//      the column width is the WIDEST button's max-content — and a pressed
//      button was drawn at `font-weight: 600`, which is a metric, not a
//      colour. On Kurulum's four lists "Öğretmenler 25" asks for 128.19px at
//      400 and 130.59px at 600: pressing it widened all four boxes and slid
//      the last one 7.3px sideways, and pressing any of the other three slid
//      it back. `.tab[aria-current]` in the bar above uses the same grid and
//      has never moved, because it says where you are in colour alone.
//
//   2. THE PAGE UNDER IT STEPPED 10PX SIDEWAYS. `.main` had no reserved
//      scrollbar gutter, so a section that overflows and one that does not
//      gave the page two different widths — 1528.5px and 1538.5px, every
//      panel, table and heading between them. The line beside the scrollbar
//      tokens in styles.css claimed the gutter was already reserved "on the
//      scrolling panes"; it was true of the command palette and nothing else.
//
// WHY THE SUITE COULD NOT SEE THE SECOND ONE, and why this file has its own
// browser: Playwright launches Chromium with `--hide-scrollbars`, so every
// scrollbar in every other spec is zero pixels wide. A scrollbar that takes no
// room can never take room away, so the 10px step did not exist for any test
// that has ever run here. The gutter has to be measured with the furniture the
// reader actually has.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { openWithSample } from './helpers';

test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

/** Where every control on the strip is, and how wide the page under it is.
 *
 * KEYED BY NAME rather than listed in order, and that is the whole difference
 * between measuring a shift and measuring a different strip. Since 2026-08-30
 * the right-hand end of Ayarlar belongs to the SECTION you are in — the theme
 * on Görünüm, a reading on the other four — so the strip legitimately holds a
 * different number of controls before and after a press. Two lists compared
 * position by position would call that a shift, which is exactly the word this
 * file exists to use precisely.
 *
 * What still has to hold, and what the assertion below says: a control that is
 * on BOTH strips has not moved. */
async function geometry(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector('.main')!;
    const buttons: Record<string, string> = {};
    for (const b of document.querySelectorAll<HTMLElement>('.ribbon .btn')) {
      const r = b.getBoundingClientRect();
      const name = (b.innerText || b.getAttribute('aria-label') || '')
        .split(/\s+/)
        .join(' ')
        .trim();
      buttons[name] = `${r.x.toFixed(2)}|${r.width.toFixed(2)}`;
    }
    return {
      buttons,
      page: main.clientWidth,
      gutter: (main as HTMLElement).offsetWidth - main.clientWidth,
      overflowing: main.scrollHeight > main.clientHeight,
    };
  });
}

async function go(page: Page, tab: string) {
  await page.getByRole('button', { name: tab, exact: true }).click();
  await expect(page.locator('.ribbon')).toBeVisible();
  await page.waitForTimeout(150);
}

/** Presses one option and waits for the strip to have finished answering. */
async function press(page: Page, index: number) {
  const button = page.locator('.ribbon .btn[aria-pressed]').nth(index);
  const name = (await button.innerText()).replace(/\s+/g, ' ').trim();
  await button.click();
  await page.waitForTimeout(200);
  return name;
}

// Kontrol is not here and cannot be: its four buttons go somewhere, they do
// not hold a position, so there is no `aria-pressed` on that strip at all.
const TABS = ['Okul', 'Müsaitlik', 'Dersler', 'Program', 'Çıktı', 'Ayarlar'] as const;

test.describe('76. Şeritte gezinmek hiçbir şeyi kaydırmıyor', () => {
  test('altı şeritte de seçenekler arasında geçmek düğmeleri OYNATMIYOR', async ({ page }) => {
    await openWithSample(page);

    for (const tab of TABS) {
      await go(page, tab);
      const options = await page.locator('.ribbon .btn[aria-pressed]').count();
      // The guard: a strip with one option cannot prove anything, and a strip
      // with none would make this test free (pitfall 23).
      expect(options, `${tab} şeridinde basılabilir seçenek yok`).toBeGreaterThan(1);

      await press(page, 0);
      const first = await geometry(page);

      for (let i = 1; i < options; i += 1) {
        const name = await press(page, i);
        const now = await geometry(page);
        // The controls the two strips have in common, and there have to BE some:
        // an empty intersection would make this test free (pitfall 23).
        const ortak = Object.keys(first.buttons).filter((k) => k in now.buttons);
        expect(ortak.length, `${tab} · "${name}" ortak düğme yok`).toBeGreaterThan(1);
        for (const k of ortak) {
          expect(now.buttons[k], `${tab} · "${name}" bastıktan sonra "${k}" oynadı`).toBe(
            first.buttons[k],
          );
        }
        expect(now.page, `${tab} · "${name}" sayfayı kaydırdı`).toBe(first.page);
      }
    }
  });

  test('taşan bölümle taşmayan bölüm AYNI genişlikte', async ({ page }) => {
    await openWithSample(page);

    await go(page, 'Ayarlar');

    const section = async (name: string) => {
      await page.locator('.ribbon .btn', { hasText: name }).first().click();
      // The FIRST group: Görünüm's strip carries a pressed theme button at its
      // right-hand end too, and the whole-strip selector became two elements.
      await expect(
        page.locator('.ribbon .ribbon-group').first().locator('.btn[aria-pressed="true"]'),
      ).toContainText(name);
      await page.waitForTimeout(200);
      return geometry(page);
    };

    const fits = await section('Zil ve günler');
    const overflows = await section('Görünüm');

    // TWO GUARDS BEFORE THE ASSERTION, and neither is optional.
    //
    // The scrolling section has to be really scrolling and the other one has to
    // really fit, or the two are on the same side of the overflow line and the
    // equality below is about nothing (pitfall 41). And the scrollbar has to
    // take room: with `--hide-scrollbars` — the default every other spec in
    // this suite runs under — it takes none, and a bar of zero pixels can never
    // take any away.
    expect(fits.overflowing, '"Zil ve günler" taşıyor — çift seçilmeli').toBe(false);
    expect(overflows.overflowing, '"Görünüm" taşmıyor — çift seçilmeli').toBe(true);
    expect(
      overflows.gutter,
      'kaydırma çubuğu yer kaplamıyor — bu test hiçbir şey ölçmüyor',
    ).toBeGreaterThan(0);

    expect(overflows.page).toBe(fits.page);
  });

  test('Program ızgarası kaydırma çubuğuna YER AYIRMIYOR', async ({ page }) => {
    // The other half of the same fix. `.main.no-overflow` is `overflow: hidden`
    // and Chromium reserves a gutter for that too, so a blanket `stable` cost
    // the grid 10px it can never get back — measured, `.grid-wrap` 1910 where
    // the window gives 1920. Program's overflow belongs to `.grid-wrap`, which
    // has its own bar and is never on either side of a section change.
    await openWithSample(page);
    await go(page, 'Program');

    const room = await page.evaluate(() => {
      const main = document.querySelector('.main') as HTMLElement;
      const wrap = document.querySelector('.grid-wrap') as HTMLElement;
      return {
        gutter: main.offsetWidth - main.clientWidth,
        wrap: wrap.getBoundingClientRect().width,
        window: window.innerWidth,
      };
    });

    expect(room.gutter).toBe(0);
    expect(room.wrap).toBe(room.window);
  });
});
