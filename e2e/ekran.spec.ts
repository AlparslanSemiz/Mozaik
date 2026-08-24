// Screenshots, not tests. "Show the output, do not claim it" — a layout,
// alignment or colour change is only believable when you can look at it.
//
// Runs OUTSIDE the normal suite (`npm run ekran`), because it asserts nothing;
// counting it among the E2E tests would inflate the number with pictures.

import { test, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const FILE = pathToFileURL(resolve('dist/index.html')).href;
const OUT = 'test-results/ekran';

type Theme = 'light' | 'dark';

async function openWithSample(page: Page, theme: Theme) {
  await page.goto(FILE);
  await page.evaluate((t) => localStorage.setItem('ders-programi-tema', t), theme);
  await page.reload();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
}

async function shot(page: Page, theme: Theme, name: string) {
  await page.screenshot({ path: `${OUT}/${theme}-${name}.png` });
}

for (const theme of ['light', 'dark'] as Theme[]) {
  test(`ekran görüntüleri — ${theme}`, async ({ page }) => {
    await openWithSample(page, theme);

    await page.getByRole('button', { name: 'Kurulum' }).click();
    await shot(page, theme, '1-kurulum');

    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await shot(page, theme, '2-musaitlik');

    await page.getByRole('button', { name: 'Program' }).click();
    await page.locator('table.grid').waitFor();
    await shot(page, theme, '3-program');

    // Mid-drag: the whole point of the colour work is what this frame shows.
    const card = await page.locator('.pool-card').first().boundingBox();
    if (card !== null) {
      await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2);
      await page.mouse.down();
      const cell = await page.locator('tr.target-row td').nth(3).boundingBox();
      if (cell !== null) {
        await page.mouse.move(cell.x + cell.width / 2, cell.y + cell.height / 2, { steps: 4 });
        await page.waitForTimeout(120);
        await shot(page, theme, '4-suruklerken');
      }
      await page.keyboard.press('Escape');
      await page.mouse.up();
    }

    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });
    await shot(page, theme, '5-yazdir');
    await page.emulateMedia({ media: 'screen' });
  });
}
