// The shell: the six destinations along the top, and what happens to them when
// the screen narrows or the page is printed.
//
// This file used to be `duzen.spec.ts` and used to measure LAYOUT — rail width,
// body overflow per tab, whether the second column was doing anything, how many
// grid rows fit. All of that went on 2026-08-26 with the rest of the layout
// contract (user decision: accessibility measurements stay, layout measurements
// go). Half of it was already lying anyway: it still asserted `nav.sidebar` was
// 92px wide down the left, and the rail had been gone since the C round.
//
// What is left is the part that is not taste:
//   - navigating actually navigates, and says where you are;
//   - the accessible name survives when the label is hidden;
//   - the six icons differ in SILHOUETTE, because under 1280px they are the
//     only thing left to tell the destinations apart;
//   - the shell does not print.

import { expect, test } from '@playwright/test';
import { open, openWithSample } from './helpers';

const TABS = ['Kurulum', 'Müsaitlik', 'Program', 'Kontrol', 'Yazdır', 'Ayarlar'] as const;

test.describe('23. Sekmeler', () => {
  test('seçili sekme belli, tıklayınca değişiyor', async ({ page }) => {
    await openWithSample(page);
    for (const name of TABS) {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute('aria-label', name);
      await expect(page.locator('.tab[aria-current="true"]')).toHaveCount(1);
    }
  });

  test('dar ekranda etiketler gizleniyor ama isimle bulunabiliyor', async ({ page }) => {
    await openWithSample(page);
    await expect(page.locator('.tabstrip .tab-label').first()).toBeVisible();

    // Under 1280px the labels go and the icons carry it.
    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(page.locator('.tabstrip .tab-label').first()).toBeHidden();

    // The accessible name survives, so a screen reader — and a test — can still
    // find a destination by what it is called.
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Kontrol',
    );
  });

  test('altı simge birbirine benzemiyor', async ({ page }) => {
    await open(page);
    const paths = await page
      .locator('.tabstrip .tab svg')
      .evaluateAll((nodes) => nodes.map((n) => n.innerHTML.replace(/\s+/g, '')));
    expect(paths).toHaveLength(6);
    expect(new Set(paths).size).toBe(6);
  });
});

test.describe('25. Kabuk kâğıda basılmıyor', () => {
  test('üst çubuk ve şerit basılmıyor, iki sütun tek sütuna iniyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('header.topbar')).toBeHidden();
    // Two of them since C9 (the tick lists and the output summary); both go.
    const controls = page.locator('.panel.no-print');
    expect(await controls.count()).toBeGreaterThan(0);
    for (let i = 0; i < (await controls.count()); i++) {
      await expect(controls.nth(i)).toBeHidden();
    }

    const display = await page.locator('.cols').evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('block');

    // Paper is one of the four surviving contracts: A4 landscape, and nothing
    // may push the sheet sideways.
    const wide = await page.evaluate(() => document.body.scrollWidth - document.body.clientWidth);
    expect(wide).toBeLessThanOrEqual(1);
    await page.emulateMedia({ media: 'screen' });
  });
});
