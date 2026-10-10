// Two copies of the program at once, and a storage that is full: the two
// data-loss defects the test session measured on 2026-10-09 (VK1 and VK2,
// TESTFINDINGS). Both used to lose work without a word on screen.
//
// VK1: two tabs share one localStorage and each holds the plan in memory. The
// stale one wrote its old copy over the other's work when it closed. Now a
// window that sees another write our data stops writing and says so
// (otherWindow.ts), and a closing tab flushes only a write that is pending.
//
// VK2: with the storage full the autosave failed and the page said "Örnek veri
// yüklendi." over it. Now the failure is a red strip.

import { expect, test, type Page } from '@playwright/test';
import { FILE, answerDialog, mainList, open, openSetup, savedText, settledText } from './helpers';

const BASKA = '.save-warning:has-text("başka bir pencerede")';
const DOLU = '.save-warning:has-text("kaydedilemedi")';

async function ornekYukle(page: Page) {
  await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
  await answerDialog(page);
  await expect.poll(() => savedText(page), { timeout: 5_000 }).toContain('Örnek Kurs');
}

/**
 * Both tabs open and settled: their opening writes are behind them.
 *
 * B opens AFTER A's opening write, the usual order in life and the one CI
 * produced: B then reads A's plan through `parseState`, which fills the empty
 * subject list, and writes back a longer text that means the same plan. That
 * must not lock A (it did, in CI run 37976328335, when the text was compared).
 */
async function ikiSekme(page: Page) {
  const a = page;
  await open(a);
  await settledText(a);
  const b = await a.context().newPage();
  await open(b);
  // B writes what it read 400 ms after opening; past that, nothing of either
  // tab is pending.
  await a.waitForTimeout(800);
  await expect(a.locator(BASKA)).toHaveCount(0);
  await expect(b.locator(BASKA)).toHaveCount(0);
  return { a, b };
}

test.describe('iki kopya · bayat pencere ötekinin işini silmiyor (VK1)', () => {
  test('A örneği yükler ve kapanır, eski B kapanır: iş duruyor', async ({ page }) => {
    // The test session's exact sequence (faz1.mjs, b1-sira.mjs). Before the
    // fix the reopened page was empty and no key held the sample.
    const { a, b } = await ikiSekme(page);
    await ornekYukle(a);
    await expect(b.locator(BASKA)).toBeVisible();

    await a.close({ runBeforeUnload: true });
    await b.close({ runBeforeUnload: true });

    const c = await page.context().newPage();
    await c.goto(FILE);
    expect(await savedText(c)).toContain('Örnek Kurs');
    await expect(c.getByText('Örnek Kurs').first()).toBeVisible();
    await expect(c.locator(BASKA)).toHaveCount(0);
  });

  test('bayat pencerede yapılan değişiklik ötekinin üstüne yazılmıyor', async ({ page }) => {
    const { a, b } = await ikiSekme(page);
    await ornekYukle(a);
    // A changes the sample, so the stored copy is no longer what B could
    // produce by loading the sample itself: 7 rooms, not 8.
    await openSetup(a, 'Derslikler');
    const once = await savedText(a);
    await mainList(a).locator('tbody tr').first().getByRole('button', { name: 'Sil' }).click();
    await answerDialog(a);
    await expect.poll(() => savedText(a), { timeout: 5_000 }).not.toBe(once);
    const aninKaydi = await savedText(a);

    // B is stale. It loads the sample over its own empty plan...
    await expect(b.locator(BASKA)).toBeVisible();
    await b.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await answerDialog(b);
    // ...waits past its own autosave, and closes.
    await b.waitForTimeout(1_000);
    await b.close({ runBeforeUnload: true });

    expect(await savedText(a)).toBe(aninKaydi);
  });

  test('tek pencerede şerit yok, ve kapanırken bekleyen değişiklik de kaydediliyor', async ({
    page,
  }) => {
    // The other side of "flush only what is pending": the last edit made
    // inside the 400 ms window still reaches the storage when the tab closes.
    await open(page);
    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await answerDialog(page);
    await page.close({ runBeforeUnload: true });
    const c = await page.context().newPage();
    await c.goto(FILE);
    expect(await savedText(c)).toContain('Örnek Kurs');
    await expect(c.locator(BASKA)).toHaveCount(0);
  });
});

test.describe('kota · kaydedilemeyen değişiklik ekranda söyleniyor (VK2)', () => {
  test('depo doluyken örnek yüklenince kırmızı şerit, yer açılınca kalkıyor', async ({ page }) => {
    await open(page);
    // Filled AFTER the start: the one-byte probe at startup must pass, as it
    // did in the measurement, or the old warning would answer instead.
    const dolgu = await page.evaluate(() => {
      let n = 0;
      for (const boy of [512 * 1024, 64 * 1024, 4 * 1024, 256]) {
        const parca = 'x'.repeat(boy);
        for (;;) {
          try {
            localStorage.setItem(`zz-dolgu-${n}`, parca);
            n += 1;
          } catch {
            break;
          }
        }
      }
      return n;
    });
    expect(dolgu).toBeGreaterThan(0);

    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await answerDialog(page);
    await expect(page.locator(DOLU)).toBeVisible();
    expect(await savedText(page)).not.toContain('Örnek Kurs');

    // Room again: the next save lands and the strip goes.
    await page.evaluate((n) => {
      for (let i = 0; i < n; i++) localStorage.removeItem(`zz-dolgu-${i}`);
    }, dolgu);
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Control+z');
    await page.keyboard.press('Control+y');
    await expect.poll(() => savedText(page), { timeout: 5_000 }).toContain('Örnek Kurs');
    await expect(page.locator(DOLU)).toHaveCount(0);
  });
});
