// Notices close by themselves (audit, 2026-11-17).
//
// "Örnek okul yüklendi · Geri al" stayed over the grid for more than a minute in
// a real session and three of them stacked. The clock is read in a real browser
// here, and not in jsdom: whether a resting pointer or a stale `:hover` holds a
// notice is exactly what a unit test cannot see (`Toasts.test.tsx` pins the
// rest). Real seconds, so each test is `slow`.

import { expect, test } from './kapan';
import { answerDialog, dragAndDropLoose, open, openWithSample } from './helpers';

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
    // The page's clock is played forward instead of waited for: a fixed 22 s
    // of real time failed once in CI, and nothing said whether the pointer had
    // ever been on the notice.
    await page.clock.install();
    const notice = await sampleNotice(page);
    // The notice slides in: aim at it once it has stopped, and prove the
    // pointer is on it (`:hover`) before any time is played.
    await expect(async () => {
      const box = (await notice.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      expect(await notice.evaluate((el) => el.matches(':hover'))).toBe(true);
    }).toPass({ timeout: 5_000 });
    // Held past its 20 s, so it is still there...
    await page.clock.runFor(22_000);
    await expect(notice).toBeVisible();
    // ...and the cap lets it go.
    await page.clock.runFor(10_000);
    await expect(notice).toHaveCount(0);
  });

  test('Esc, odak ızgaradayken en yeni bildirimi kapatıyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDropLoose(page);
    const newest = page.locator('.toast').last();
    await expect(newest).toBeVisible();
    const count = await page.locator('.toast').count();
    await page.locator('table.grid .card').first().focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('.toast')).toHaveCount(count - 1);
  });

  test('sabit kartı fareyle çekmeye çalışınca nedenini söylüyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDropLoose(page);
    await page.locator('table.grid .card-pin').first().click();
    const card = page.locator('table.grid .card.pinned').first();
    await expect(card).toBeVisible();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 30, { steps: 6 });
    await page.mouse.up();
    await expect(
      page.locator('.toast.warn', { hasText: 'sağ tıklayıp Sabitlemeyi kaldır' }),
    ).toBeVisible();
  });
});
