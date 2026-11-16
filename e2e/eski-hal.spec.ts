// Dosya ▾ → Eski hâline dön (Sadeleşme K8, 2026-11-16): the plan as its last
// days left it, kept by itself. A day is made by writing yesterday into the
// day mark, as an older session would have left it, and opening the page
// again: its first save keeps what the storage holds as yesterday's copy.

import { expect, test } from './kapan';
import {
  dragAndDropLoose,
  openFileMenu,
  openGridMenu,
  openWithSample,
  placedHours,
  reopen,
} from './helpers';

const iso = (ms: number) => {
  const d = new Date(ms);
  const two = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
};

test.describe('Eski hâline dön', () => {
  test('dünkü hâle dönülüyor, şimdiki hâl bugünün kopyası oluyor ve Geri al onu getiriyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await dragAndDropLoose(page);
    const placed = await placedHours(page);
    expect(placed).toBeGreaterThan(0);
    await page.waitForTimeout(700); // the 400 ms autosave

    const yesterday = iso(Date.now() - 86_400_000);
    const today = iso(Date.now());
    await page.evaluate((day) => {
      localStorage.setItem('ders-programi-gunluk', JSON.stringify({ '1': day }));
    }, yesterday);
    await reopen(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          (k) => localStorage.getItem(k) !== null,
          `ders-programi-gunluk-${yesterday}-1`,
        ),
      )
      .toBe(true);

    // Today: the week is emptied.
    await openGridMenu(page);
    await page.getByRole('menuitem', { name: 'Programı boşalt' }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(0);

    await openFileMenu(page);
    await page.getByRole('menuitem', { name: 'Eski hâline dön' }).click();
    const dialog = page.getByRole('dialog', { name: 'Eski hâline dön' });
    await expect(dialog).toBeVisible();
    // A day the way he says it: "Salı 12 Kasım".
    await expect(dialog.locator('tbody th')).toHaveText(
      /^(Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar) \d{1,2} \p{L}+$/u,
    );
    await dialog.getByRole('button', { name: 'Dünkü hâline dön' }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(() => placedHours(page)).toBe(placed);
    const toast = page.locator('.toast', { hasText: 'Plan eski hâline döndü' });
    await expect(toast).toBeVisible();
    // What was on screen before is kept first, under today.
    expect(
      await page.evaluate(
        (k) => localStorage.getItem(k) !== null,
        `ders-programi-gunluk-${today}-1`,
      ),
    ).toBe(true);

    await toast.getByRole('button', { name: 'Geri al' }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(0);
  });

  test('kopya yokken söylüyor ve bir şey değiştirmiyor', async ({ page }) => {
    await openWithSample(page);
    await openFileMenu(page);
    await page.getByRole('menuitem', { name: 'Eski hâline dön' }).click();
    const dialog = page.getByRole('dialog', { name: 'Eski hâline dön' });
    await expect(dialog).toContainText('Henüz eski bir kopya yok');
    await expect(dialog.getByRole('button', { name: /hâline dön/ })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('Ctrl+K "dün" ile buluyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    await page.keyboard.type('dün');
    await page.getByRole('option', { name: /Eski hâline dön/ }).click();
    await expect(page.getByRole('dialog', { name: 'Eski hâline dön' })).toBeVisible();
  });
});
