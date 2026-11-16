// Notices close by themselves (audit, 2026-11-17).
//
// "Örnek okul yüklendi · Geri al" stayed over the grid for more than a minute in
// a real session and three of them stacked. The clock is read in a real browser
// here, and not in jsdom: whether a resting pointer or a stale `:hover` holds a
// notice is exactly what a unit test cannot see (`Toasts.test.tsx` pins the
// rest). Real seconds, so each test is `slow`.

import { expect, test } from './kapan';
import { answerDialog, open } from './helpers';

async function sampleNotice(page: import('@playwright/test').Page) {
  await open(page);
  await page.getByRole('button', { name: /Örnek okulu yükle/ }).click();
  await answerDialog(page);
  const notice = page.locator('.toast', { hasText: 'Örnek okul yüklendi' });
  await expect(notice).toBeVisible();
  return notice;
}

test.describe('Bildirimler', () => {
  test.beforeEach(() => test.slow());

  test('"Geri al"lı bildirim 20 sn içinde kendiliğinden kapanıyor', async ({ page }) => {
    const notice = await sampleNotice(page);
    await page.mouse.move(5, 5);
    await expect(notice).toHaveCount(0, { timeout: 24_000 });
  });

  test('fare üstünde dururken de en geç 30 sn sonra kapanıyor', async ({ page }) => {
    const notice = await sampleNotice(page);
    const box = (await notice.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    // Held past its 20 s, so it is still there...
    await page.waitForTimeout(22_000);
    await expect(notice).toBeVisible();
    // ...and the cap lets it go.
    await expect(notice).toHaveCount(0, { timeout: 15_000 });
  });
});
