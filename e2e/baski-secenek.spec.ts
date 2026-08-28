// 62. What goes on the printed sheet.
//
// Asked for in the reader's own words: "Yazdır kısmında açıp kapatma
// opsiyonları her yazılan şey için — kurs yazılsın mı, saat yazılsın mı, çıktı
// saati yazılsın mı".
//
// `normalizePrintOptions` is unit-tested, so what only exists here is the
// wiring and the two things jsdom cannot see: that each switch removes exactly
// one thing from the paper, and that the one NEW element — the date stamp —
// does not push a fixed 205 mm page over the edge (pitfall 31).

import { expect, test } from './kapan';
import type { Page } from '@playwright/test';
import { dragAndDrop, openWithSample } from './helpers';

async function openPrint(page: Page) {
  await openWithSample(page);
  await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
  await expect(page.locator('.print-page').first()).toBeVisible();
}

/**
 * The sample ships with an EMPTY timetable, so a page with no lesson on it has
 * no cells to hide — the switch would pass over nothing. One placed block is
 * all it takes, and it goes in through a real drag.
 */
async function openPrintWithALesson(page: Page) {
  await openWithSample(page);
  await dragAndDrop(page);
  await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
  await expect(page.locator('.print-page').first()).toBeVisible();
}

const box = (page: Page, label: string) =>
  page.getByRole('checkbox', { name: new RegExp(`^${label}`) });

test.describe('62. Sayfada ne olsun', () => {
  test('beş anahtarın beşi de panelde ve varsayılanları doğru', async ({ page }) => {
    await openPrint(page);
    const panel = page.locator('.panel', { hasText: 'Sayfada ne olsun' });
    await expect(panel.locator('input[type=checkbox]')).toHaveCount(5);

    // Everything that was already on paper stays on it; the stamp is the one
    // thing that never existed, so it starts off.
    for (const on of ['Kurs adı', 'Derslik ve branş', 'Ders saatleri', 'Hücrenin alt satırı']) {
      await expect(box(page, on), on).toBeChecked();
    }
    await expect(box(page, 'Çıktı tarihi')).not.toBeChecked();
  });

  test('kurs adı kapanınca künye satırından ÇIKIYOR, derslik kalıyor', async ({ page }) => {
    await openPrint(page);
    const sub = page.locator('.print-page').first().locator('.p-title-sub');
    await expect(sub).toContainText('Örnek Kurs');

    await box(page, 'Kurs adı').uncheck();
    await expect(sub).not.toContainText('Örnek Kurs');
    // The room is still there, and so is no stray separator in front of it.
    await expect(sub).toContainText('dersliği');
    expect((await sub.innerText()).trim().startsWith('·')).toBe(false);
  });

  test('ikisi de kapanınca künye SATIRI hiç çizilmiyor', async ({ page }) => {
    await openPrint(page);
    await box(page, 'Kurs adı').uncheck();
    await box(page, 'Derslik ve branş').uncheck();
    await expect(page.locator('.print-page').first().locator('.p-title-sub')).toHaveCount(0);
    // The big line is untouched: this switch is about the credits, not the title.
    await expect(page.locator('.print-page').first().locator('.p-title-main')).toContainText(
      'Haftalık ders programı',
    );
  });

  test('ders saatleri kapanınca sütun başlığında saat kalmıyor', async ({ page }) => {
    await openPrint(page);
    const first = page.locator('.print-page').first();
    await expect(first.locator('.p-clock').first()).toBeVisible();
    await expect(first.locator('thead th').nth(1)).toContainText(':');

    await box(page, 'Ders saatleri').uncheck();
    await expect(first.locator('.p-clock')).toHaveCount(0);
    // The lesson NUMBER stays: that is the column's name, not its clock.
    await expect(first.locator('thead th').nth(1)).toHaveText('1');
  });

  test('hücrenin alt satırı kapanınca üst satır duruyor', async ({ page }) => {
    await openPrintWithALesson(page);
    const area = page.locator('.print-area');
    const tops = await area.locator('.p-top').count();
    // The precondition, asserted rather than assumed: with an empty timetable
    // this switch would be hiding nothing and the test would pass for free.
    expect(tops).toBeGreaterThan(0);
    expect(await area.locator('.p-bottom').count()).toBe(tops);

    await box(page, 'Hücrenin alt satırı').uncheck();
    await expect(area.locator('.p-bottom')).toHaveCount(0);
    await expect(area.locator('.p-top')).toHaveCount(tops);
  });

  test('çıktı tarihi açılınca sayfaya bir tarih satırı geliyor', async ({ page }) => {
    await openPrint(page);
    await expect(page.locator('.p-stamp')).toHaveCount(0);

    await box(page, 'Çıktı tarihi').check();
    const stamp = page.locator('.print-page').first().locator('.p-stamp');
    await expect(stamp).toBeVisible();
    // A real date, not a placeholder: gg.aa.yyyy ss:dd.
    await expect(stamp).toHaveText(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2} tarihinde yazdırıldı/);

    // Every page carries it, not only the first.
    const pages = await page.locator('.print-page').count();
    await expect(page.locator('.p-stamp')).toHaveCount(pages);
  });

  test('öğretmen sayfasında da branş kapanabiliyor', async ({ page }) => {
    await openPrint(page);
    await page.getByRole('button', { name: 'Öğretmenler', exact: true }).click();
    const sub = page.locator('.print-page').first().locator('.p-title-sub');
    await expect(sub).toContainText('Örnek Kurs');

    await box(page, 'Derslik ve branş').uncheck();
    await expect(sub).toHaveText('Örnek Kurs');
  });

  // The one that could quietly cost a sheet of paper per teacher. The page box
  // is a fixed 205 mm and the plan is centred in it; a stamp is a new last
  // child of that box.
  test('ÇIKTI TARİHİ kâğıdı taşırmıyor ve fazladan sayfa üretmiyor', async ({ page }) => {
    await openPrint(page);
    await box(page, 'Çıktı tarihi').check();

    // Only the busiest class, so the count below is about the stamp and not
    // about how many sheets the sample makes.
    await page.getByRole('button', { name: 'Hiçbiri' }).first().click();
    await page.locator('.pick-item').first().locator('input').check();

    await page.emulateMedia({ media: 'print' });
    const overflow = await page.locator('.print-page').first().evaluate((el) => ({
      y: el.scrollHeight - el.clientHeight,
      x: el.scrollWidth - el.clientWidth,
    }));
    expect(overflow.y).toBeLessThanOrEqual(1);
    expect(overflow.x).toBeLessThanOrEqual(1);

    // And the sheet count did not grow: a fractional pixel plus `break-after`
    // is what puts a BLANK page behind every timetable.
    const pdf = await page.pdf({ landscape: true, format: 'A4' });
    expect(pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length).toBe(1);
  });

  test('seçim YENİLEMEDEN sonra da duruyor', async ({ page }) => {
    await openPrint(page);
    await box(page, 'Ders saatleri').uncheck();
    await box(page, 'Çıktı tarihi').check();

    await page.reload();
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();

    await expect(box(page, 'Ders saatleri')).not.toBeChecked();
    await expect(box(page, 'Çıktı tarihi')).toBeChecked();
    await expect(page.locator('.p-clock')).toHaveCount(0);
    await expect(page.locator('.p-stamp').first()).toBeVisible();
  });

  test('seçenekler EKRANDA kalıyor, kâğıda geçmiyor', async ({ page }) => {
    await openPrint(page);
    const panel = page.locator('.panel', { hasText: 'Sayfada ne olsun' });
    await expect(panel).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(panel).toBeHidden();
  });
});
