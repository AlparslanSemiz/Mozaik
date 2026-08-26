// 49. Search, sort and group chips on the Kurulum lists.
//
// Asked for twice, in the reader's own words: "listeleri kaydırabilelim ya da
// grupça filtreleyebilelim" and "öğretmenler listesinde sıralama ... branşa
// göre, isme göre vesaire".
//
// The ordering and the folding are unit-tested in `src/listview.test.ts`, so
// what is worth an E2E is the wiring: that the controls really drive the table
// under them, that the count tells the truth, and that Turkish text survives
// the round trip through a real input.

import { expect, test } from '@playwright/test';
import { openSetup, openWithSample, mainList } from './helpers';

const rows = (page: import('@playwright/test').Page) => mainList(page).locator('tbody tr');

test.describe('49. Liste araçları', () => {
  test('arama tabloyu daraltıyor ve sayaç doğruyu söylüyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    await expect(rows(page)).toHaveCount(25);
    await expect(page.locator('.list-count')).toContainText('25 öğretmen');

    await page.getByLabel('öğretmen ara').fill('matematik');
    await expect(rows(page)).toHaveCount(3);
    await expect(page.locator('.list-count')).toContainText('3 / 25 öğretmen');

    await page.getByRole('button', { name: 'Süzmeyi kaldır' }).click();
    await expect(rows(page)).toHaveCount(25);
  });

  test('Türkçe: aksansız yazınca da buluyor, İ ile başlayan adı da', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    const box = page.getByLabel('öğretmen ara');

    // 'İlknur'.toLowerCase() is an `i` plus a COMBINING DOT in the default
    // locale, so this is the search that silently found nothing.
    await box.fill('ilknur');
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first().locator('input').first()).toHaveValue('İlknur Aydın');

    // ...and somebody typing quickly leaves the accents off.
    await box.fill('gokhan');
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first().locator('input').first()).toHaveValue('Gökhan Çetin');
  });

  test('branş çipi süzüyor ve ÖTEKİ çiplerin sayıları duruyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    const maths = page.locator('.chip', { hasText: 'Matematik' });
    const physics = page.locator('.chip', { hasText: 'Fizik' });
    await expect(maths).toContainText('3');
    await maths.click();

    await expect(maths).toHaveAttribute('aria-pressed', 'true');
    await expect(rows(page)).toHaveCount(3);
    // The one that would break if the counts were taken after the facet: the
    // row of chips has to stay a way BACK, not a dead end.
    await expect(physics).toContainText('2');

    await maths.click();
    await expect(rows(page)).toHaveCount(25);
  });

  test('sıralama gerçekten sıralıyor, ve varsayılan GİRİLDİĞİ sıra', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    // NOT `td:nth-child(n)`: the name column has moved twice now (a drag
    // handle went in front of it, a gender box behind it) and each time this
    // line failed with "undefined" rather than with anything about columns.
    // The name box is the one plain text input in the row — the short form
    // carries `.text-sm` and the limits are number boxes.
    const names = () =>
      rows(page).locator('td > input[type="text"]:not(.text-sm)').all();

    const entered = await Promise.all((await names()).map((i) => i.inputValue()));
    expect(entered[0]).toBe('Mehmet Çelik'); // sample order, not alphabetical

    await page.getByLabel('Sırala').selectOption({ label: 'Ada göre' });
    const alpha = await Promise.all((await names()).map((i) => i.inputValue()));
    expect(alpha).not.toEqual(entered);
    // Turkish collation, done by the browser: Ç sorts after C, not after Z.
    expect([...alpha].sort((a, b) => a.localeCompare(b, 'tr'))).toEqual(alpha);

    await page.getByLabel('Sırala').selectOption({ label: 'Ders yüküne göre (çok → az)' });
    // Counted from the END for the same reason: "Ders saati" is always the
    // cell before the buttons, whatever gets inserted ahead of it.
    const loads = await rows(page).locator('td:nth-last-child(2)').allInnerTexts();
    const numbers = loads.map((t) => Number(t.trim()));
    expect([...numbers].sort((a, b) => b - a)).toEqual(numbers);
  });

  test('dersler listesi de aranıyor — 99 satırın olduğu tek yer', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Dersler');
    await expect(rows(page)).toHaveCount(99);

    // The teacher's SHORT form is what the grid says, so it is what gets
    // remembered and therefore what gets typed.
    await page.getByLabel('ders ara').fill('MÇ');
    const found = await rows(page).count();
    expect(found).toBeGreaterThan(0);
    expect(found).toBeLessThan(99);
    await expect(rows(page).first()).toContainText('MÇ');
  });

  test('hiçbir şey bulunamayınca söylüyor, boş tablo bırakmıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    await page.getByLabel('sınıf ara').fill('böyle bir sınıf yok');
    await expect(rows(page)).toHaveCount(0);
    await expect(page.locator('.hint', { hasText: 'Bu aramaya uyan sınıf yok' })).toBeVisible();
  });
});
