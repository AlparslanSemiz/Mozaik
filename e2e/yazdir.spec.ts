// Printing. Never tested at the end, always in the middle: "it does not
// overflow" is not enough — the columns must be equal and the page landscape.

import { expect, test, type Page } from '@playwright/test';
import { openWithSample, openSetup, openSettings } from './helpers';

test.describe('4. Yazdırma', () => {
  test('her sınıf için bir sayfa ve yatay taşma yok', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page')).toHaveCount(20);

    await page.emulateMedia({ media: 'print' });
    // The top bar and its controls must be hidden in print
    await expect(page.locator('.topbar')).toBeHidden();

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBeLessThanOrEqual(1);
  });

  test('PDF üretilebiliyor ve boş değil', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    expect(pdf.length).toBeGreaterThan(20_000);
  });

  test('sayfa A4 YATAY basılıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });

    // 12 lesson columns do not fit portrait; the page must come out landscape.
    const box = /MediaBox\s*\[\s*0(?:\.\d+)?\s+0(?:\.\d+)?\s+([\d.]+)\s+([\d.]+)/.exec(
      pdf.toString('latin1'),
    );
    expect(box, 'PDF MediaBox okunamadı').not.toBeNull();
    const [width, height] = [Number(box![1]), Number(box![2])];
    expect(width).toBeGreaterThan(height);
    // A4 landscape is 841.89 x 595.28 pt
    expect(Math.round(width)).toBe(842);
    expect(Math.round(height)).toBe(595);
  });

  test('baskı sütunları eşit ve eksen dönmüş', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    const table = page.locator('table.print').first();
    // Row = day (full name), column = lesson
    await expect(table.locator('tbody tr')).toHaveCount(6);
    await expect(table.locator('tbody tr').first().locator('th')).toHaveText('Salı');
    await expect(table.locator('tbody tr').first().locator('td')).toHaveCount(12);

    // Equal columns: a filled cell used to widen its own column
    const widths = await table.locator('tbody tr').first().locator('td').evaluateAll((cells) =>
      cells.map((c) => c.getBoundingClientRect().width),
    );
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);

    // The long break marks each row at its own lesson
    const marks = await table.locator('tbody tr').evaluateAll((rows) =>
      rows.map((r) => [...r.querySelectorAll('td')].findIndex((c) => c.classList.contains('p-break'))),
    );
    expect(marks).toEqual([4, 4, 4, 4, 5, 5]);

    await page.emulateMedia({ media: 'screen' });
  });
});

// ---------------------------------------------------------------------------
// 35. The sheet itself: what my father saw in the real print preview.
//
// Four complaints, all about the paper and none about the data: the date sat
// top left, the file path bottom left, the title was small and stuck to the
// left edge, and the table hugged the top with ~5 cm of white under it.
//
// The browser's header and footer cannot be measured from here — they are
// drawn by the print system, not by the page — so they are proved with a real
// PDF instead (docs/STATUS.md, and scratchpad/baski-kanit.mjs). What CAN be
// measured is what makes them impossible: an @page with no margin box, and a
// page box that pads and centres the timetable itself.

test.describe('35. Basılan sayfanın düzeni', () => {
  test('başlık ORTALI, iki satır ve ana satır daha büyük', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    const head = page.locator('.print-page').first().locator('h3');
    await expect(head).toHaveCSS('text-align', 'center');

    const main = head.locator('.p-title-main');
    const sub = head.locator('.p-title-sub');
    await expect(main).toContainText('Haftalık ders programı');
    // The small line carries the school and the room, not the title.
    await expect(sub).toContainText('Örnek Kurs');

    const size = async (l: typeof main) =>
      Number((await l.evaluate((e) => getComputedStyle(e).fontSize)).replace('px', ''));
    const [big, small] = [await size(main), await size(sub)];
    expect(big).toBeGreaterThan(small);
    // "biraz daha büyük": bigger than the 15px it used to be, measured.
    expect(big).toBeGreaterThanOrEqual(18);

    await page.emulateMedia({ media: 'screen' });
  });

  test('kenar boşluğu sayfanın KENDİSİNDE, üst/alt bilgiye yer yok', async ({ page }) => {
    // @page has no margin any more, so the paper margin has to come from the
    // page box. If this padding is ever lost the timetable prints into the
    // unprintable edge of the sheet.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    const box = page.locator('.print-page').first();
    const pad = await box.evaluate((e) => {
      const cs = getComputedStyle(e);
      return {
        top: parseFloat(cs.paddingTop),
        left: parseFloat(cs.paddingLeft),
        justify: cs.justifyContent,
        height: parseFloat(cs.height),
      };
    });
    expect(pad.top).toBeGreaterThan(20); // 8mm ~= 30px
    expect(pad.left).toBeGreaterThan(30); // 10mm ~= 38px
    expect(pad.justify).toContain('center'); // `safe center` must not be dropped
    // 205mm ~= 775px: shorter than the 210mm sheet on purpose (no blank pages).
    expect(pad.height).toBeGreaterThan(740);
    expect(pad.height).toBeLessThan(795);

    await page.emulateMedia({ media: 'screen' });
  });

  test('plan sayfada DİKEY ortalanıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    const gaps = await page.locator('.print-page').first().evaluate((el) => {
      const page_ = el.getBoundingClientRect();
      const title = el.querySelector('h3')!.getBoundingClientRect();
      const table = el.querySelector('table.print')!.getBoundingClientRect();
      return { above: title.top - page_.top, below: page_.bottom - table.bottom };
    });
    // Within 2mm (~7.6px). Before this change the gap below was ~5cm.
    expect(Math.abs(gaps.above - gaps.below)).toBeLessThanOrEqual(8);
    expect(gaps.above).toBeGreaterThan(20);

    await page.emulateMedia({ media: 'screen' });
  });

  test('3 sınıf = 3 sayfa, arada BOŞ sayfa yok', async ({ page }) => {
    // The page box has a fixed height now: one fractional pixel of overflow
    // plus `break-after: page` would put a blank sheet after every timetable,
    // and nothing else in the suite would notice.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();

    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    for (const n of [0, 1, 2]) await list.locator('.pick-item').nth(n).locator('input').check();
    await expect(page.locator('.print-page')).toHaveCount(3);

    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    const pageCount = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pageCount).toBe(3);
  });

  test('7 günlük haftada da sayfadan taşmıyor', async ({ page }) => {
    // The worst case for a fixed-height page box: 23mm rows x 7 days plus the
    // header row and the title. `safe center` keeps the top from being cut off
    // if it ever does not fit; this measures that it still fits.
    await openWithSample(page);
    await openSettings(page, 'Okul ve zil');
    await page.getByLabel('Pazartesi', { exact: true }).check();

    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    const first = page.locator('.print-page').first();
    await expect(first.locator('table.print tbody tr')).toHaveCount(7);
    const overflow = await first.evaluate((e) => e.scrollHeight - e.clientHeight);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.emulateMedia({ media: 'screen' });
  });
});

// ---------------------------------------------------------------------------
// 21. Choosing what to print
//
// "Print 510 and 511 only" is a normal request and used to mean printing all 45
// pages and throwing 43 away: the only choice was classes / teachers / both.

test.describe('21. Yazdırmada seçim', () => {
  test('yalnız seçilen sınıflar basılıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();

    const pages = page.locator('.print-page');
    await expect(pages).toHaveCount(20); // everything is on by default

    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    await expect(pages).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Yazdır \(/ })).toBeDisabled();
    await expect(page.locator('.warn-box')).toContainText('Hiçbir sayfa seçili değil');

    await list.locator('.pick-item', { hasText: '510' }).first().locator('input').check();
    await list.locator('.pick-item', { hasText: '511' }).first().locator('input').check();
    await expect(pages).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Yazdır (2 sayfa)' })).toBeEnabled();
    await expect(pages.first().locator('h3')).toContainText('510');
    await expect(pages.nth(1).locator('h3')).toContainText('511');
  });

  test('öğretmen sayfaları ayrı seçiliyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.getByLabel('Ne basılsın').selectOption('teachers');

    const list = page.locator('.pick-list', { hasText: 'Öğretmenler' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    await list.locator('.pick-item').first().locator('input').check();
    await expect(page.locator('.print-page')).toHaveCount(1);

    await list.getByRole('button', { name: 'Tümü' }).click();
    await expect(page.locator('.print-page')).toHaveCount(25);
  });

  test('sonradan eklenen sınıf kendiliğinden basılıyor', async ({ page }) => {
    // The selection stores what is LEFT OUT: a class added after the last
    // printout must not go silently missing on the next one.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    await list.locator('.pick-item', { hasText: '510' }).first().locator('input').check();
    await expect(page.locator('.print-page')).toHaveCount(1);

    await openSetup(page, 'Sınıflar');
    await page.getByPlaceholder('Sınıf adı, örn. 510').fill('999');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page')).toHaveCount(2);
    await expect(page.locator('.print-page').nth(1).locator('h3')).toContainText('999');
  });

  test('seçim yazdırma çıktısına da yansıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    await list.locator('.pick-item', { hasText: '510' }).first().locator('input').check();

    const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true });
    expect(pdf.byteLength).toBeGreaterThan(1000);
    // One class = one page. 20 classes would be 20.
    const pageCount = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pageCount).toBe(1);
  });
});
