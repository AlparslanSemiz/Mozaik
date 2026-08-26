// 52. Ctrl+K, the status chip, and the keyboard.
//
// All three exist for the same reason and it is not novelty: the reader has
// trouble seeing. Typing three letters of a name is easier than scanning a
// column of twenty-five, a status that is always on screen is one that gets
// read, and a shortcut is a target you cannot miss.

import { expect, test } from '@playwright/test';
import { openWithSample, open, chooseScale } from './helpers';

test.describe('52. Komut paleti', () => {
  test('Ctrl+K açıyor, Escape kapatıyor, üst çubuktaki düğme de açıyor', async ({ page }) => {
    await openWithSample(page);
    const palette = page.locator('.palette');
    await expect(palette).toBeHidden();

    await page.keyboard.press('Control+k');
    await expect(palette).toBeVisible();
    // It opens FOCUSED: a palette you have to click into is a palette that
    // costs a click more than the button it replaced.
    await expect(page.getByLabel('Ara veya komut yaz')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();

    // ...and there is a way in that nobody has to be told about.
    await page.getByRole('button', { name: 'Ara ve git' }).click();
    await expect(palette).toBeVisible();
  });

  test('sekmeye gidiyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('yazdır');
    await page.keyboard.press('Enter');

    await expect(page.locator('.palette')).toBeHidden();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Yazdır',
    );
  });

  test('öğretmeni adıyla bulup PANELİNİ açıyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    // Turkish folding, the same as the lists: 'İlknur'.toLowerCase() is an `i`
    // plus a combining dot, so this is the search that used to find nothing.
    await page.getByLabel('Ara veya komut yaz').fill('ilknur');

    const rows = page.locator('.palette-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('İlknur Aydın');
    await page.keyboard.press('Enter');

    await expect(page.locator('.palette')).toBeHidden();
    const sheet = page.locator('.sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('.sheet-title')).toHaveText('İlknur Aydın');
  });

  test('ok tuşlarıyla geziliyor ve imleç listenin İÇİNDE kalıyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    const rows = page.locator('.palette-row');
    await expect(rows.first()).toHaveAttribute('data-active', 'true');

    await page.keyboard.press('ArrowDown');
    await expect(rows.nth(1)).toHaveAttribute('data-active', 'true');

    // Walk past the end: the cursor stops, it does not wrap into nothing.
    await page.keyboard.press('End');
    const count = await rows.count();
    await expect(rows.nth(count - 1)).toHaveAttribute('data-active', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(rows.nth(count - 1)).toHaveAttribute('data-active', 'true');

    // ...and typing something shorter must not leave it pointing past the end.
    await page.getByLabel('Ara veya komut yaz').fill('ilknur');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute('data-active', 'true');
  });

  test('eşleşme yoksa bunu söylüyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('böyle bir şey yok');
    await expect(page.locator('.palette-row')).toHaveCount(0);
    await expect(page.locator('.palette-empty')).toContainText('Eşleşen bir şey yok');
  });
});

test.describe('53. Durum çipi', () => {
  test('sorun yokken yeşil, kapalı saatte ders kalınca kırmızı ve SAYIYOR', async ({ page }) => {
    await openWithSample(page);
    const chip = page.locator('.health');
    await expect(chip).toBeVisible();
    // Nothing laid out yet: not a problem, but it says what is waiting.
    await expect(chip).toHaveClass(/ok/);
    await expect(chip).toContainText('saat havuzda');

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    await expect(chip).toContainText('Sorun yok');

    // Close a teacher's whole week AFTER the timetable is laid out: the lesson
    // stays (principle 6) and the chip has to be the thing that says so.
    const id = await page.evaluate(() => {
      const row = [...document.querySelectorAll('table.grid tbody tr')].find(
        (tr) => tr.querySelector('.card') !== null,
      );
      return row?.querySelector('td[data-row]')?.getAttribute('data-row') ?? '';
    });
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await page.locator(`.entity[data-id="${id}"]`).click();
    await page.getByRole('button', { name: 'Tümünü kapat' }).click();

    await expect(chip).toHaveClass(/impossible/);
    await expect(chip).toContainText('kapalı saatte');
  });

  test('her sekmede duruyor ve Kontrol\'e götürüyor', async ({ page }) => {
    await openWithSample(page);
    for (const tab of ['Kurulum', 'Müsaitlik', 'Program', 'Yazdır', 'Ayarlar']) {
      await page.getByRole('button', { name: tab, exact: true }).click();
      await expect(page.locator('.health')).toBeVisible();
    }
    await page.locator('.health').click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Kontrol',
    );
  });
});

test.describe('54. Klavye kısayolları', () => {
  test('Alt+1..6 sekmelere gidiyor', async ({ page }) => {
    await openWithSample(page);
    const names = ['Kurulum', 'Müsaitlik', 'Program', 'Kontrol', 'Yazdır', 'Ayarlar'];
    for (const [i, name] of names.entries()) {
      await page.keyboard.press(`Alt+${i + 1}`);
      await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute('aria-label', name);
    }
  });

  test('ÇIPLAK rakam sekme değiştirmiyor — ızgaradaki her kart bir düğme', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.keyboard.press('5');
    // Still on Program. A bare "5" while a lesson card had focus would have
    // jumped to Yazdır, and every card on the grid is a focusable button.
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Program',
    );
  });

  test('%150 ölçekte üst çubuk taşmıyor, son sekme tıklanabiliyor', async ({ page }) => {
    // Measured before the fix: the strip shrank while the tabs inside it did
    // not, so Ayarlar sat at x=823 inside a box ending at 711 — under the
    // status chip, clickable by nothing.
    await openWithSample(page);
    await chooseScale(page, 150);

    const fits = await page.evaluate(() => {
      const bar = document.querySelector('header.topbar')!;
      const strip = bar.querySelector('.tabstrip')!.getBoundingClientRect();
      const tabs = [...bar.querySelectorAll('.tab')];
      const last = tabs[tabs.length - 1]!.getBoundingClientRect();
      return { over: Math.round(last.right - strip.right), barOver: bar.scrollWidth - bar.clientWidth };
    });
    expect(fits.over, 'sekmeler kendi kutusundan taşıyor').toBeLessThanOrEqual(0);
    expect(fits.barOver, 'üst çubuk yatay taşıyor').toBeLessThanOrEqual(0);

    await page.getByRole('button', { name: 'Ayarlar', exact: true }).click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Ayarlar',
    );
    await chooseScale(page, 100);
  });

  test('boş projede de palet açılıyor ve çökmüyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Control+k');
    await expect(page.locator('.palette')).toBeVisible();
    // Six sections and the actions are there even with nothing entered.
    expect(await page.locator('.palette-row').count()).toBeGreaterThan(6);
  });
});

test.describe('55. Durum çipi — boş proje', () => {
  test('yeni açılışta "Sorun yok" değil, "Henüz ders girilmedi" diyor', async ({ page }) => {
    await open(page);
    const chip = page.locator('.health');
    await expect(chip).toHaveClass(/ok/);
    await expect(chip).toHaveText('Henüz ders girilmedi');
  });
});
