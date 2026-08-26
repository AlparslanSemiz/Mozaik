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
    // "Ne basılsın" moved into the tool strip and became three buttons: the
    // strip carries what you are looking at, and a scope you switch while
    // reading the preview should not need a dropdown opened first.
    await page.getByRole('button', { name: 'Öğretmenler', exact: true }).click();

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

test.describe('60. Yazdır — önizleme kâğıda benziyor', () => {
  // "Yazdır kısmında önizlemedeki tablo biraz daha büyük ve görünür olabilir.
  // Satırlar biraz daha uzun olabilir." — and the answer had to be SCREEN ONLY:
  // the paper is a fixed physical size and the 205 mm page of pitfall 31 is
  // what keeps a blank sheet from landing behind every timetable.
  //
  // So this file gains two assertions that pull against each other, and both
  // have to hold: the preview got bigger, AND nothing reached the printer.

  /** Everything about the sheet, on whichever medium is being emulated. */
  async function sheet(page: Page) {
    return page.evaluate(() => {
      const box = document.querySelector('.print-page')!;
      const cell = document.querySelector('table.print tbody td')!;
      const cs = getComputedStyle(box);
      const r = box.getBoundingClientRect();
      return {
        width: r.width,
        height: r.height,
        row: cell.getBoundingClientRect().height,
        shadow: cs.boxShadow,
        radius: cs.borderTopLeftRadius,
        maxWidth: cs.maxWidth,
        overflow: box.scrollHeight - box.clientHeight,
      };
    });
  }

  test('ekranda bir SAYFA gibi duruyor ve satırları uzadı', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();

    const screen = await sheet(page);

    // The row was 30px — about half of what 23 mm is on this screen, so the
    // preview's rows were squat next to the sheet they stand for.
    expect(screen.row, `önizleme satırı ${screen.row}px`).toBeGreaterThan(45);

    // A4 landscape is 297 x 210. The sheet is allowed to be TALLER than that
    // (a seven-day week has to be able to grow rather than be squeezed), never
    // narrower or shorter.
    const ratio = screen.width / screen.height;
    expect(ratio, `en/boy ${ratio.toFixed(3)} — A4 yatay 1.414`).toBeLessThanOrEqual(1.415);
    expect(ratio).toBeGreaterThan(1.0);

    // ...and it reads as a sheet lying on a desk, not as a table on a panel.
    expect(screen.shadow).not.toBe('none');
    expect(Number.parseFloat(screen.radius)).toBeGreaterThan(0);
  });

  test('EKRAN süsünün hiçbiri kâğıda geçmiyor', async ({ page }) => {
    // Pitfall 32 in CSS: two targets means one leaks into the other. The shadow,
    // the rounded corner and the 62rem cap exist so the preview looks like
    // paper; printing them would put a grey halo and a narrow column on the
    // actual paper, and nobody would find out until after printing.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();
    const screen = await sheet(page);

    await page.emulateMedia({ media: 'print' });
    const paper = await sheet(page);

    expect(paper.shadow).toBe('none');
    expect(Number.parseFloat(paper.radius)).toBe(0);
    expect(paper.maxWidth).toBe('none');
    expect(screen.maxWidth).not.toBe('none');

    // 23 mm at 96 dpi is 86.93 px, and that number must not have moved.
    expect(paper.row, `kâğıt satırı ${paper.row}px, 23mm = 86.9px`).toBeCloseTo(86.93, 0);
    expect(paper.row).toBeGreaterThan(screen.row);
    // The page box is still the 205 mm one, and still fits what is in it.
    expect(paper.overflow).toBeLessThanOrEqual(1);

    await page.emulateMedia({ media: 'screen' });
  });

  test('büyüyen önizleme sayfa SAYISINI değiştirmedi', async ({ page }) => {
    // The guard, and the reason the two assertions above are safe to make: a
    // taller preview row that had leaked into the page box would push every
    // timetable onto a second sheet, and "3 classes = 3 pages" is the cheapest
    // way to see it.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();

    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    for (const n of [0, 1, 2]) await list.locator('.pick-item').nth(n).locator('input').check();
    await expect(page.locator('.print-page')).toHaveCount(3);

    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pages, 'üç sınıf üç sayfa olmalı — arkalarında boş sayfa var').toBe(3);
  });

  test('önizleme koyu temada da OKUNUYOR', async ({ page }) => {
    // The sheet takes --paper, so on a dark screen it is a dark sheet — that is
    // deliberate (the --print-line/--print-head-bg dark overrides exist for it)
    // and `@media print` pins the paper values back so it cannot reach the
    // printer. What must hold is that the grid line is still VISIBLE on it:
    // a table rule is non-text, so 3:1 is its floor. Measured 2.02 before the
    // theme was darkened, 3.01 after.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Koyu tema', exact: true }).click();
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();

    const ratio = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const rgb = (v: string) =>
        (v.trim().startsWith('#')
          ? [1, 3, 5].map((i) => parseInt(v.trim().slice(i, i + 2), 16))
          : v.match(/\d+/g)!.slice(0, 3).map(Number)) as number[];
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
      const [a, b] = [
        lum(rgb(cs.getPropertyValue('--print-line'))),
        lum(rgb(cs.getPropertyValue('--paper'))),
      ].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    });
    expect(ratio, `çizgi/kâğıt kontrastı ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3);
  });
});
