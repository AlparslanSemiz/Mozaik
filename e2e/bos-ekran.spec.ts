// Empty screens and keyboard navigation.
//
// "Boş ekranlar yönlendirir" is a rule in CLAUDE.md and not one of these
// screens was tested: they are the first thing a new project shows, and the
// only place that answers "what do I do first".

import { expect, test } from '@playwright/test';
import { open, openSetup, openSettings } from './helpers';

test.describe('35. Boş ekranlar yönlendiriyor', () => {
  test('veri yokken Kurulum sekmesiyle açılıyor', async ({ page }) => {
    await open(page);
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Kurulum',
    );
    await expect(page.locator('.panel', { hasText: 'Başlarken' })).toContainText('derslikler');
  });

  test('Program: ne yapılacağını sırayla söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    const screen = page.locator('.empty-screen');
    await expect(screen).toContainText('Henüz dizilecek ders yok');
    await expect(screen).toContainText('Kurulum');
    await expect(screen).toContainText('Müsaitlik');
    // Not clipped: the empty screen must never live inside the grid's
    // overflow:hidden shell.
    await expect(page.locator('main.main.no-overflow')).toHaveCount(0);
  });

  test('Yazdır: basılacak bir şey olmadığını söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.empty-screen')).toBeVisible();
  });

  test('Müsaitlik: üç türün üçü de ne eksik olduğunu söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await expect(page.locator('.empty-screen')).toContainText('öğretmen ekleyin');

    await page.getByRole('button', { name: 'Sınıf', exact: true }).click();
    await expect(page.locator('.empty-screen')).toContainText('sınıf ekleyin');

    await page.getByRole('button', { name: 'Derslik', exact: true }).click();
    await expect(page.locator('.empty-screen')).toContainText('derslik ekleyin');
  });

  test('Kurulum adım sayaçları boşken soluk', async ({ page }) => {
    await open(page);
    await expect(page.locator('.step[data-empty="true"]')).toHaveCount(4);

    await openSetup(page, 'Derslikler');
    await page.getByPlaceholder('Derslik adı, örn. A').fill('A');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.locator('.step[data-empty="true"]')).toHaveCount(3);
  });

  test('boş projede bile Ayarlar açılıyor ve dolu', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Okul');
    await expect(page.locator('.cols aside')).toContainText('Zil saatleri');
    await expect(page.locator('table.bell-preview')).toBeVisible();
  });
});

test.describe('36. Klavye', () => {
  test('Tab ile altı sekmeye de ulaşılıyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');

    // The rail is first in the DOM, so the first stop is the first section.
    const names: string[] = [];
    for (let i = 0; i < 6; i++) {
      names.push(
        await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? ''),
      );
      await page.keyboard.press('Tab');
    }
    expect(names).toEqual([
      'Kurulum',
      'Müsaitlik',
      'Program',
      'Kontrol',
      'Yazdır',
      'Ayarlar',
    ]);
  });

  test('Enter ile sekme değiştirilebiliyor ve aria-current takip ediyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Kontrol',
    );
  });

  test('odaklanılan düğmenin nerede olduğu görünüyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (el === null) return null;
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle };
    });
    expect(outline?.style).toBe('solid');
    expect(parseFloat(outline?.width ?? '0')).toBeGreaterThanOrEqual(2);
  });

  test('adım şeridinde Enter çalışıyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    await page.locator('.step', { hasText: 'Sınıflar' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.step[aria-current="true"]')).toContainText('Sınıflar');
  });
});
