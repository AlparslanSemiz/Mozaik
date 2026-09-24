// Automatic timetabling, in the real browser.
//
// The unit tests prove the search is legal by the same blocker() the drag uses.
// What only shows up here: that the button reaches the reducer, that the whole
// run is ONE undo step, that the page does not freeze, and that what the bar
// says afterwards is a sentence a person can act on.

import { type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expect, test } from './kapan';
import {
  answerDialog,
  chooseEntity,
  loadWorld,
  openSettings,
  openWithSample,
  placedHours,
  savedState,
  settledText,
} from './helpers';
import type { State } from '../src/leaf/types';

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
    expect(await placedHours(page)).toBeGreaterThan(400);
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
    const placed = await placedHours(page);
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

    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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

  // TODO B5.9, on the father's week (anonymised): it cannot be built as it
  // stands, and the program says what would have to change, with the week it
  // found, and puts it in with one click that one Ctrl+Z takes back.
  test('kurulamayan haftada neyin değişmesi gerektiğini söylüyor ve uyguluyor', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const kurs = JSON.parse(readFileSync('src/fixtures/tam-dolu-kurs.json', 'utf8')) as State;
    await loadWorld(page, kurs);
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();

    // The bar still says what happened; the panel says what to do about it.
    const bar = page.locator('.reason-bar.bad');
    await expect(bar).toContainText('yerleşemedi', { timeout: 60_000 });
    await expect(bar).not.toContainText('sınıfı Salı 1 saatinde kapalı');
    const panel = page.locator('.panel.suggestions');
    await expect(panel).toContainText('Nasıl kurulacağı aranıyor');
    await expect(panel).toContainText('4 öğretmen saatini açın', { timeout: 150_000 });
    await expect(panel).toContainText('6 sınırı yükseltin', { timeout: 150_000 });
    await expect(page.getByRole('button', { name: 'Durdur' })).toHaveCount(0, { timeout: 150_000 });

    const details = panel.getByRole('button', { name: 'Ayrıntı', exact: true }).first();
    await details.click();
    await expect(panel.getByRole('button', { name: 'Ayrıntıyı gizle' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(panel).toContainText('Cumartesi');

    const before = await settledText(page);
    const was = JSON.parse(before) as State;
    await panel.getByRole('button', { name: 'Saatleri aç ve programı yerleştir' }).click();
    await expect(page.locator('.reason-bar.ok')).toContainText('Öneri uygulandı');
    await expect(page.locator('.pool-card')).toHaveCount(0);

    const after = await savedState(page, before);
    const opened = Object.keys(was.unavailable).filter((k) => after.unavailable[k] === undefined);
    expect(opened).toHaveLength(4);
    const teachers = new Set(was.teachers.map((x) => x.id));
    for (const key of opened) expect(teachers.has(key.split('|')[0]!)).toBe(true);
    const hours = was.lessons.reduce((sum, x) => sum + x.weeklyHours, 0);
    expect(await placedHours(page)).toBe(hours);

    // One step back: the four hours closed again and the stuck week on the grid.
    const applied = await settledText(page);
    await page.keyboard.press('Control+z');
    const undone = await savedState(page, applied);
    expect(undone.unavailable).toEqual(was.unavailable);
    expect(undone.programs).toEqual(was.programs);
  });
});
