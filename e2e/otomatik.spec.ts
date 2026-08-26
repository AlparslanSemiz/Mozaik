// Automatic timetabling, in the real browser.
//
// The unit tests prove the search is legal by the same blocker() the drag uses.
// What only shows up here: that the button reaches the reducer, that the whole
// run is ONE undo step, that the page does not freeze, and that what the bar
// says afterwards is a sentence a person can act on.

import { expect, test, type Page } from '@playwright/test';
import { answerDialog, chooseEntity, openSettings, openWithSample } from './helpers';

/** Runs it and waits for the verdict line. */
async function autoFill(page: Page) {
  await page.getByRole('button', { name: /^Otomatik diz/ }).click();
  await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
}

test.describe('22. Otomatik dizme', () => {
  test('havuzdaki dersleri yerleştiriyor ve ne yaptığını söylüyor', async ({ page }) => {
    await openWithSample(page);
    await expect(page.locator('table.grid .card')).toHaveCount(0);
    const poolBefore = await page.locator('.pool-card').count();
    expect(poolBefore).toBeGreaterThan(0);

    await autoFill(page);

    await expect(page.locator('.reason-bar')).toContainText('Program dizildi');
    await expect(page.locator('.pool-card')).toHaveCount(0);
    expect(await page.locator('table.grid .card').count()).toBeGreaterThan(400);
  });

  test('bütün dizim TEK Ctrl+Z ile geri alınıyor', async ({ page }) => {
    await openWithSample(page);
    await autoFill(page);
    const placed = await page.locator('table.grid .card').count();
    expect(placed).toBeGreaterThan(0);

    await page.keyboard.press('Control+z');
    await expect(page.locator('table.grid .card')).toHaveCount(0);

    await page.keyboard.press('Control+y');
    await expect(page.locator('table.grid .card')).toHaveCount(placed);
  });

  test('elle konmuş ders yerinde kalıyor', async ({ page }) => {
    await openWithSample(page);

    // Put one lesson down by hand, remember where.
    const { dragAndDrop } = await import('./helpers');
    const spot = await dragAndDrop(page);
    const cell = page.locator(
      `td[data-row="${spot.row}"][data-day="${spot.day}"][data-hour="${spot.hour}"] .card`,
    );
    const before = await cell.textContent();
    expect(before).not.toBeNull();

    await autoFill(page);
    await expect(cell).toHaveText(before!);
  });

  test('"Baştan diz" önce soruyor, sonra baştan diziyor', async ({ page }) => {
    await openWithSample(page);
    await autoFill(page);
    const first = await page.locator('table.grid .card').count();

    await page.getByRole('button', { name: 'Baştan diz' }).click();
    const asked = await answerDialog(page);
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });

    // The question counts what is about to go — "426 saatin tamamı", not
    // "the timetable". That number is the whole reason it is asked.
    expect(asked).toMatch(/Dizilmiş \d+ saatin tamamı silinecek/);
    expect(asked).toContain('sıfırdan dizilecek');
    expect(asked).toContain('Ctrl+Z ile geri alınabilir');
    expect(await page.locator('table.grid .card').count()).toBe(first);
  });

  test('havuz boşken "Otomatik diz" kapalı', async ({ page }) => {
    await openWithSample(page);
    await autoFill(page);
    await expect(page.getByRole('button', { name: /^Otomatik diz/ })).toBeDisabled();
  });

  test('yerleşemeyen dersin sebebini blocker cümlesiyle söylüyor', async ({ page }) => {
    await openWithSample(page);

    // Close one teacher's whole week: their lessons have nowhere to go.
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    const first = page.locator('.entity').first();
    const id = (await first.getAttribute('data-id'))!;
    await chooseEntity(page, id);
    await page.getByRole('button', { name: 'Tümünü kapat' }).click();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await autoFill(page);

    const bar = page.locator('.reason-bar');
    await expect(bar).toContainText('yerleşemedi');
    await expect(bar).toContainText('müsait değil');
    await expect(bar).toContainText('Ayrıntı: Kontrol sekmesi.');
  });

  test('Engelle seviyesindeki kuralı çiğnemiyor', async ({ page }) => {
    // "No rule was broken" is a claim an EMPTY grid also satisfies, and until
    // 2026-08-25 that is exactly how this test passed: tightening a rule at this
    // scale collapsed the search. So the grid is counted first, and only then
    // asked whether it is clean.
    test.setTimeout(90_000);
    await openWithSample(page);
    await openSettings(page, 'Kurallar');

    const rule = page.locator('table.list tr', { hasText: 'Öğretmen art arda en fazla' });
    await rule.locator('input[type=number]').fill('2');
    await rule.locator('input[type=number]').blur();
    await rule.locator('select').selectOption('block');

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await autoFill(page);

    // The grid really is laid out: 424 of 426 hours, measured. An empty grid
    // cannot make this assertion pass, which is the whole point of it.
    const placed = await page.locator('table.grid td:has(.card)').count();
    expect(placed).toBeGreaterThan(400);

    // Kontrol lists every breach of a rule; at "Engelle" there must be none.
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.badge', { hasText: 'Kural dışı' })).toHaveCount(0);
  });

  test('sonuç çubuğu "Tamam" ile kapanıyor', async ({ page }) => {
    await openWithSample(page);
    await autoFill(page);
    await page.getByRole('button', { name: 'Tamam' }).click();
    // The bar does not go BLANK: it falls back to what it says at rest, which
    // is how to read the grid. What must go is the verdict and its button.
    await expect(page.getByRole('button', { name: 'Tamam' })).toHaveCount(0);
    await expect(page.locator('.reason-bar')).toContainText('Satırlar öğretmen');
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toHaveCount(0);
  });

  test('dizilen program yazdırılabiliyor', async ({ page }) => {
    await openWithSample(page);
    await autoFill(page);

    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();
    expect(await page.locator('.print-page .p-top').count()).toBeGreaterThan(0);
  });

  test('sayfa donmuyor — dizim sırasında da sonrasında da tıklanabiliyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    // If the main thread were blocked this would time out rather than answer.
    await expect(page.getByRole('button', { name: 'Kontrol', exact: true })).toBeEnabled();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Program', exact: true })).toBeVisible();
  });
});
