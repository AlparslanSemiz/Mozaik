// Printing. Never tested at the end, always in the middle: "it does not
// overflow" is not enough — the columns must be equal and the page landscape.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import {
  openWithSample,
  openSetup,
  openSettings,
  loadWorld,
  chooseScale,
  revealRibbon,
  settledMotion as settled,
} from './helpers';

// The request: "Çıktıda da blok dersler birlikte gözükmeli programdaki gibi
// birleşik görünsünler." Paper drew one <td> per hour, so a two-hour block
// printed as two identical cells that happened to match — which is exactly the
// asymmetry the same note complains about two lines later.
test.describe('81. Kâğıtta blok birleşmesi', () => {
  /** Every printed row, as the widths its cells claim. */
  const rowSpans = (page: Page) =>
    page.locator('.print-page').first().locator('table.print tbody tr').evaluateAll((rows) =>
      rows.map((tr) =>
        [...tr.querySelectorAll('td')].map((td) => (td as HTMLTableCellElement).colSpan),
      ),
    );

  test('blok kâğıtta TEK hücre — ve satır hâlâ tam hafta', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 60_000 });

    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    const spans = await rowSpans(page);

    // At least one cell really is wider than an hour...
    expect(spans.flat().some((n) => n > 1), 'kâğıtta hiç birleşmiş hücre yok').toBe(true);

    // ...and no row lost or gained an hour doing it. This is the half that a
    // colSpan gets wrong: `table-layout: fixed` will happily draw a short row,
    // and a short row is a week with an hour missing.
    for (const row of spans) {
      expect(row.reduce((a, b) => a + b, 0)).toBe(12);
    }
  });

  // A merged cell must never swallow the long break. On screen the break is a
  // column of its own and a colSpan over it would make it a drop target
  // (pitfall 13); on paper it is a thick right edge, and a block straddling it
  // would put that edge through its own middle. Both drawings cut at the break.
  test('birleşmiş hücre ÖĞLE ARASINI yutmuyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 60_000 });

    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

    // Where the break falls on each day, out of the project itself rather than
    // out of the drawing being judged.
    const breaks: number[] = await page.evaluate(() => {
      const raw = localStorage.getItem('ders-programi');
      const state = JSON.parse(raw ?? '{}') as {
        settings?: { days?: Array<{ longBreakAfter?: number }> };
      };
      return (state.settings?.days ?? []).map((d) => d.longBreakAfter ?? 0);
    });
    expect(breaks.length).toBeGreaterThan(0);
    expect(breaks.some((b) => b > 0), 'örnek okulda öğle arası yok').toBe(true);

    // EVERY sheet, not the first one: whether a block happens to straddle the
    // break depends on which class it is, and a scan of one page was green
    // against a build that had the cut removed altogether.
    const straddling = await page.locator('.print-page').evaluateAll((sheets, breakAt: number[]) => {
        const bad: string[] = [];
        const rows = sheets.flatMap((sheet) => [
          ...sheet.querySelectorAll('table.print tbody tr'),
        ]);
        rows.forEach((tr, i) => {
          const day = i % breakAt.length;
          const stop = breakAt[day] ?? 0;
          let hour = 0;
          for (const td of tr.querySelectorAll('td')) {
            const span = (td as HTMLTableCellElement).colSpan;
            // The break sits between hour stop-1 and hour stop. A cell covering
            // [hour, hour + span) crosses it when it starts before and ends
            // after.
            if (stop > 0 && hour < stop && hour + span > stop) {
              bad.push(`${day}. gün: ${hour}. saatten ${span} saat, ara ${stop}. saatte`);
            }
            hour += span;
          }
          if (hour !== 12) bad.push(`${day}. gün ${hour} saat çizdi`);
        });
        return bad;
      }, breaks);

    expect(straddling).toEqual([]);
  });

});

test.describe('4. Yazdırma', () => {
  test('her sınıf için bir sayfa ve yatay taşma yok', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    expect(pdf.length).toBeGreaterThan(20_000);
  });

  test('sayfa A4 YATAY basılıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

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
    await openSettings(page, 'Zil ve günler');
    await page.getByLabel('Pazartesi', { exact: true }).check();

    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

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
    // "kâğıt", not "sayfa": once a sheet can hold four timetables the two
    // words stop meaning the same thing, and the number beside the button is
    // the number of pieces of paper the printer will produce.
    await expect(page.getByRole('button', { name: 'Yazdır (2 kâğıt)' })).toBeEnabled();
    await expect(pages.first().locator('h3')).toContainText('510');
    await expect(pages.nth(1).locator('h3')).toContainText('511');
  });

  test('öğretmen sayfaları ayrı seçiliyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    await list.locator('.pick-item', { hasText: '510' }).first().locator('input').check();
    await expect(page.locator('.print-page')).toHaveCount(1);

    await openSetup(page, 'Sınıflar');
    await page.getByPlaceholder('Sınıf adı, örn. 510').fill('999');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await expect(page.locator('.print-page')).toHaveCount(2);
    await expect(page.locator('.print-page').nth(1).locator('h3')).toContainText('999');
  });

  test('seçim yazdırma çıktısına da yansıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
      const paper = document.querySelector('.print-sheet')!;
      const box = document.querySelector('.print-page')!;
      const cell = document.querySelector('table.print tbody td')!;
      const title = document.querySelector('.p-title-main')!;
      const cs = getComputedStyle(paper);
      const r = paper.getBoundingClientRect();
      return {
        width: r.width,
        height: r.height,
        row: cell.getBoundingClientRect().height,
        title: Number.parseFloat(getComputedStyle(title).fontSize),
        pad: getComputedStyle(box).padding,
        shadow: cs.boxShadow,
        radius: cs.borderTopLeftRadius,
        overflow: box.scrollHeight - box.clientHeight,
      };
    });
  }

  test('ekranda bir SAYFA gibi duruyor — A4 yatayın kendisi', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();

    const screen = await sheet(page);

    // 297 x 205 mm, in the units a screen has: 96 dpi puts them at 1122.5 and
    // 774.8 px. Not a MODEL of the sheet at some ratio — the sheet.
    expect(screen.width, `${screen.width}px, 297mm = 1122.5px`).toBeCloseTo(1122.5, 0);
    expect(screen.height, `${screen.height}px, 205mm = 774.8px`).toBeCloseTo(774.8, 0);

    // ...and it reads as a sheet lying on a desk, not as a table on a panel.
    expect(screen.shadow).not.toBe('none');
    expect(Number.parseFloat(screen.radius)).toBeGreaterThan(0);
  });

  test('ÖNİZLEME ile KÂĞIT aynı sayfa — ölçüsü ölçüsüne', async ({ page }) => {
    // "Yazdır kısmında önizlemeyle yazdırılan aynı olsun" (2026-08-26).
    //
    // They were not. Measured before the change: the preview's row was ~30 px
    // and the printed one 86.93, because `height: 23mm` lived inside
    // `@media print` alone. Anyone choosing what to print was choosing from a
    // drawing of the sheet rather than from the sheet.
    //
    // What is still allowed to differ is what is not ON the paper: the shadow,
    // the corner, and the width, which goes to `auto` in print so the sheet
    // takes the page box instead of insisting on 297 mm inside an already
    // 297 mm page (a tenth of a millimetre there is a blank sheet behind every
    // timetable — pitfall 31).
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();
    const screen = await sheet(page);

    // IN A WINDOW THE SIZE OF THE PAPER, and that is a fix to the instrument
    // rather than a concession. `emulateMedia` switches the media query and
    // nothing else — the viewport stays 1920 — while in print the sheet is
    // `width: auto` and takes the page box. So the emulated sheet came out
    // 1920px wide, the hour headings stopped wrapping in it, and the rows
    // that share what is left came out taller than the ones on a real 297mm
    // page. Measuring the paper in a window the width of the paper is the
    // only way the two numbers mean the same thing (pitfall 41's shape: a
    // measurement is made under the conditions it is a measurement of).
    await page.setViewportSize({ width: 1123, height: 900 });
    await page.emulateMedia({ media: 'print' });
    const paper = await sheet(page);

    // The SAME sheet: same row height, same type, same margin, same height.
    //
    // The row is no longer a written 23mm — it is the sheet's leftover divided
    // between the days, so that a bigger type takes its room from the rows
    // rather than from the bottom of the paper. Which is why this asserts the
    // two media AGREE and no longer asserts a constant: the constant was the
    // thing that could not give.
    expect(paper.row, `kâğıt ${paper.row}px, ekran ${screen.row}px`).toBeCloseTo(screen.row, 1);
    expect(paper.row, `${paper.row}px — bir gün satırı yok`).toBeGreaterThan(40);
    expect(paper.title).toBeCloseTo(screen.title, 1);
    expect(paper.pad).toBe(screen.pad);
    expect(paper.height).toBeCloseTo(screen.height, 1);

    // ...and the screen ornaments do not follow it into the tray (pitfall 32).
    expect(paper.shadow).toBe('none');
    expect(Number.parseFloat(paper.radius)).toBe(0);
    expect(paper.overflow).toBeLessThanOrEqual(1);

    await page.emulateMedia({ media: 'screen' });
  });

  test('büyüyen önizleme sayfa SAYISINI değiştirmedi', async ({ page }) => {
    // The guard, and the reason the two assertions above are safe to make: a
    // taller preview row that had leaked into the page box would push every
    // timetable onto a second sheet, and "3 classes = 3 pages" is the cheapest
    // way to see it.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

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
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
      const lum = ([r, g, b]: number[]) =>
        0.2126 * lin(r ?? 0) + 0.7152 * lin(g ?? 0) + 0.0722 * lin(b ?? 0);
      const [a = 0, b = 0] = [
        lum(rgb(cs.getPropertyValue('--print-line'))),
        lum(rgb(cs.getPropertyValue('--paper'))),
      ].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    });
    expect(ratio, `çizgi/kâğıt kontrastı ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3);
  });
});

// WHAT THE 2026-08-26 LIST CHANGED ON PAPER.
//
// Three asks, three measurements. All three are about the sheet a father pins
// to a wall, and none of them can be seen in jsdom.

/** Two classes with different colours, one teacher, one placed lesson, and a
 *  day of closed hours — the four things the assertions below need to exist. */
const PAPER_WORLD = {
  schemaVersion: 7,
  settings: {
    schoolName: 'Kâğıt Kursu',
    days: [
      { name: 'Salı', longBreakAfter: 0 },
      { name: 'Çarşamba', longBreakAfter: 0 },
    ],
    hours: ['1', '2', '3', '4'],
    bell: { start: '09:00', lessonMinutes: 40, breakMinutes: 10, longBreakMinutes: 30 },
    limits: { maxConsecutive: 0, maxPerDay: 0, minPerDay: 0, maxSameLessonPerDay: 0 },
    rules: { maxConsecutive: 'block', maxPerDay: 'block', minPerDay: 'warn', maxSameLessonPerDay: 'block' },
    subjects: ['Matematik'],
    subjectShorts: {},
  },
  rooms: [{ id: 'dA', name: 'A' }],
  teachers: [
    { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', gender: '', color: 0,
      limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null } },
  ],
  classes: [
    { id: 's510', name: '510', roomId: 'dA', color: 3 },
    { id: 's511', name: '511', roomId: null, color: 9 },
  ],
  lessons: [
    { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, pairs: 0, maxPerDay: null },
    { id: 'x2', classId: 's511', teacherId: 'oMC', weeklyHours: 2, pairs: 0, maxPerDay: null },
  ],
  // A whole day shut, so the sheet has closed hours to NOT draw.
  unavailable: { 'oMC|1|0': 1, 'oMC|1|1': 1, 'oMC|1|2': 1, 'oMC|1|3': 1 },
  placements: { 's510|0|0': 'x1', 's511|0|1': 'x2' },
};

test.describe('69. Kâğıdın 2026-08-26 turu', () => {
  test('öğretmen sayfasında ÇARPI yok — kapalı saat kâğıda çıkmıyor', async ({ page }) => {
    // MÇ is shut all of Çarşamba in this world, so the page HAS closed hours
    // to draw: before the change they came out as a cross and a grey hatch.
    await loadWorld(page, PAPER_WORLD);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await page.getByRole('button', { name: 'Öğretmenler', exact: true }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();

    const paper = await page.locator('.print-area').innerText();
    expect(paper).not.toContain('×');
    expect(await page.locator('.print-area td.p-closed').count()).toBe(0);
  });

  test('öğretmen sayfasının renkleri SINIFIN rengi', async ({ page }) => {
    // On a teacher's own sheet every filled cell is that same teacher, so the
    // teacher's colour paints twelve identical pastels and says nothing. The
    // class is what varies — and it is what the reader is looking for.
    //
    // A hand-built world, because the sample ships with an EMPTY grid: with no
    // placements there is no coloured cell and the test would pass on nothing.
    // Both kinds of page are left on screen, because the class sheet's own
    // title dot is the honest thing to compare against — no palette index is
    // written down twice.
    await loadWorld(page, PAPER_WORLD);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    // The strip opens on class sheets only; this comparison needs both kinds.
    await page.getByRole('button', { name: 'İkisi de', exact: true }).click();
    await expect(page.locator('.print-page')).toHaveCount(3);

    const seen = await page.evaluate(() => {
      // The class sheet says what 510's colour IS (its title dot)...
      let want = '';
      for (const sheet of document.querySelectorAll('.print-page')) {
        const title = (sheet.querySelector('.p-title-main')?.textContent ?? '').trim();
        if (!title.startsWith('510 sınıfı')) continue;
        const dot = sheet.querySelector('.p-dot');
        if (dot !== null) want = getComputedStyle(dot).backgroundColor;
      }
      // ...and the teacher sheet's cell for 510 has to be painted with it.
      let got = '';
      let teacherDot = '';
      for (const sheet of document.querySelectorAll('.print-page')) {
        const title = (sheet.querySelector('.p-title-main')?.textContent ?? '').trim();
        if (!title.includes('(MÇ)')) continue;
        const dot = sheet.querySelector('.p-dot');
        if (dot !== null) teacherDot = getComputedStyle(dot).backgroundColor;
        for (const cell of sheet.querySelectorAll('table.print tbody td')) {
          if ((cell.querySelector('.p-top')?.textContent ?? '').trim() === '510') {
            got = getComputedStyle(cell).backgroundColor;
          }
        }
      }
      return { want, got, teacherDot };
    });

    expect(seen.want, '510 sınıfının sayfası bulunamadı').not.toBe('');
    expect(seen.got, 'öğretmen sayfasında 510 hücresi bulunamadı').not.toBe('');
    expect(seen.got, 'hücre sınıfın rengiyle boyanmalı').toBe(seen.want);
    // ...and the discriminating half: it is NOT the teacher's own colour, which
    // is what it used to be and what the title dot still is.
    expect(seen.got).not.toBe(seen.teacherDot);
  });

  test('“Sayfada ne olsun” satırları metnini KIRPMIYOR', async ({ page }) => {
    // `.pick-item` was `white-space: nowrap` — right for the class chips that
    // wrap in a row, wrong for a stacked row carrying a whole sentence in a
    // 20-26rem sidebar.
    //
    // The first version of this test measured the row's right edge against the
    // panel's and passed on the broken build: the flex item does not push the
    // panel open, the text is simply cut off inside it. Measured on the broken
    // build, the clipped row was "Derslik ve branş — Ayn…" at 100 % and two
    // rows at 150 % — which is exactly what was reported. So the assertion is
    // the one the reader would make: no row hides its own words.
    await openWithSample(page);
    for (const pct of [100, 150]) {
      if (pct !== 100) {
        await openSettings(page, 'Görünüm');
        await page.getByRole('button', { name: `%${pct}`, exact: true }).click();
      }
      await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

      const clipped = await page
        .locator('.panel', { hasText: 'Sayfada ne olsun' })
        .evaluate((panel) => {
          const rows = [...panel.querySelectorAll('.pick-item')] as HTMLElement[];
          return rows
            .filter((r) => r.scrollWidth - r.clientWidth > 1)
            .map((r) => (r.textContent ?? '').trim().slice(0, 30));
        });
      expect(clipped, `%${pct}: kırpılan satır(lar)`).toEqual([]);
    }
  });
});

// SAYFA DÜZENİ — the 2026-08-26 asks about the shape of the paper itself:
// "bir A4 kağıdına 4 tane program yazılabilir olsun", "Yazdır kısmında
// yazıların boyutunu ayarlama seçeneği", and the blank 6th column.
test.describe('70. Sayfa düzeni ve kâğıttaki saat', () => {
  const layout = (page: Page) => page.locator('.panel', { hasText: 'Sayfa düzeni' });

  async function choose(page: Page, name: string) {
    await layout(page).getByRole('button', { name, exact: true }).click();
  }

  test('bir A4’e 1, 2 ya da 4 program — ve kâğıt sayısı ona göre', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await expect(page.locator('.print-page')).toHaveCount(20);

    for (const [per, sheets] of [
      ['1', 20],
      ['2', 10],
      ['4', 5],
    ] as const) {
      await choose(page, per);
      // A timetable is still a timetable at every setting — what changes is
      // how many of them share a piece of paper.
      await expect(page.locator('.print-page')).toHaveCount(20);
      await expect(page.locator('.print-sheet')).toHaveCount(sheets);
      // ...and the button counts PAPER, which is what comes out of the printer.
      await expect(page.getByRole('button', { name: `Yazdır (${sheets} kâğıt)` })).toBeEnabled();
    }
  });

  test('kâğıt 297x205mm KALIYOR — dörde bölünen sayfa değil, içindekiler', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    for (const per of ['1', '2', '4']) {
      await choose(page, per);
      const m = await page.locator('.print-sheet').first().evaluate((el) => {
        const r = el.getBoundingClientRect();
        const plans = el.querySelectorAll('.print-page').length;
        return { w: r.width, h: r.height, plans };
      });
      expect(m.w, `per=${per} genişlik`).toBeCloseTo(1122.5, 0);
      expect(m.h, `per=${per} yükseklik`).toBeCloseTo(774.8, 0);
      expect(m.plans, `per=${per} kâğıttaki program`).toBe(Number(per));
    }
  });

  test('hiçbir düzen-boyut birleşiminde program kâğıttan TAŞMIYOR', async ({ page }) => {
    // Nine combinations, and the reason each one is measured: the type ladder
    // is a chain of two multipliers, and a wrong scope on it makes every one
    // of them silently identical — which is exactly what happened the first
    // time (measured: the title was 22.7px at all nine).
    //
    // MEASURED AGAINST THE CONTENT BOX, not with `scrollHeight`. The first
    // version of this test asked `.print-page` for `scrollHeight -
    // clientHeight` and got 0 at all nine — including at "Büyük", where the
    // title and the table together needed 739 px of the 714 the sheet has.
    // A flex column that is centred with `safe center` does not report its
    // overflow that way, so the instrument said "fits" about a page that did
    // not. Pitfall 64, exactly: a layout fault is measured on the box that
    // actually overflows, and the neighbouring box knows nothing about it.
    //
    // The reader's report was "yazdırmada yazıları büyük yapınca yazdırma
    // bozuluyor" — one setting, one number, and no test could see it.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    const spill: Record<string, string> = {};
    for (const per of ['1', '2', '4']) {
      await choose(page, per);
      for (const size of ['Küçük', 'Normal', 'Büyük']) {
        await choose(page, size);
        const m = await page.locator('.print-page').first().evaluate((el) => {
          const cs = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          const top = box.top + parseFloat(cs.paddingTop);
          const bottom = box.bottom - parseFloat(cs.paddingBottom);
          let lo = Infinity;
          let hi = -Infinity;
          for (const kid of el.children) {
            const r = kid.getBoundingClientRect();
            lo = Math.min(lo, r.top);
            hi = Math.max(hi, r.bottom);
          }
          return {
            over: Math.round(Math.max(0, top - lo) + Math.max(0, hi - bottom)),
            avail: Math.round(bottom - top),
            used: Math.round(hi - lo),
          };
        });
        if (m.over > 1) spill[`per=${per} ${size}`] = `${m.over}px (yer ${m.avail}, gereken ${m.used})`;
      }
    }
    expect(spill, `kâğıttan taşan birleşimler: ${JSON.stringify(spill)}`).toEqual({});
  });

  // THE SAME NINE, ON PAPER.
  //
  // "Yazdırmada yazıları büyük yapınca yazdırma bozuluyor. Önizleme doğru
  //  olmasına rağmen."
  //
  // The test above measures `.print-page` on SCREEN, and that is why it never
  // saw this. Three things are only true in `@media print`:
  //
  //   - the row that carries the hour headings was sized in `rem`, the one rem
  //     that reached the paper, and print pins --ui-scale to 1 — so preview and
  //     paper did not compute the same height at ANY zoom;
  //   - `.print-area` is `overflow-x: auto`, which forces `overflow-y` to auto
  //     as well, and a scroll container in paged media does not fragment, it
  //     CLIPS;
  //   - the sheet's own margin under the title is 6px on screen and 4mm here.
  //
  // And the sheet is what has to hold: `.print-page` is one timetable inside a
  // 205mm box (pitfall 31) and it is the SHEET that meets the paper's edge.
  // Measured in both axes, because "büyük" grows the type in both and only the
  // vertical was ever looked at.
  test('kâğıt ortamında da dokuz birleşimin dokuzu SIĞIYOR', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

    const spill: Record<string, string> = {};
    for (const per of ['1', '2', '4']) {
      for (const size of ['Küçük', 'Normal', 'Büyük']) {
        // Chosen on SCREEN and measured on PAPER: the two panels that hold
        // these buttons are `.no-print`, so in print media there is nothing to
        // click — which is correct, and is why the switch is inside the loop.
        await choose(page, per);
        await choose(page, size);
        await page.emulateMedia({ media: 'print' });
        const m = await page
          .locator('.print-sheet')
          .first()
          .evaluate((el) => ({
            y: Math.round(el.scrollHeight - el.clientHeight),
            x: Math.round(el.scrollWidth - el.clientWidth),
          }));
        await page.emulateMedia({ media: null });
        if (m.y > 1 || m.x > 1) spill[`per=${per} ${size}`] = `${m.x}x${m.y}px`;
      }
    }
    expect(spill, `kâğıttan taşan birleşimler: ${JSON.stringify(spill)}`).toEqual({});
  });

  test('yazı boyutu GERÇEKTEN değişiyor, üç basamak da ayrı', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    const seen: number[] = [];
    for (const size of ['Küçük', 'Normal', 'Büyük']) {
      await choose(page, size);
      seen.push(
        await page
          .locator('.p-title-main')
          .first()
          .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
      );
    }
    expect(seen[0]!, `küçük ${seen[0]} < normal ${seen[1]}`).toBeLessThan(seen[1]!);
    expect(seen[1]!, `normal ${seen[1]} < büyük ${seen[2]}`).toBeLessThan(seen[2]!);
  });

  test('düzen ve boyut BAĞIMSIZ — 4’lüde de büyütülebiliyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await choose(page, '4');
    const read = () =>
      page.locator('.p-title-main').first().evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    await choose(page, 'Küçük');
    const small = await read();
    await choose(page, 'Büyük');
    const big = await read();
    expect(big).toBeGreaterThan(small);
  });

  test('6. sütunda artık saat VAR — iki tane, hangi günler olduğu yazılı', async ({ page }) => {
    // The blank column was reported as a fault. It was not one: the 6th lesson
    // starts at 13:30 on a weekday and 13:10 at the weekend, and the header
    // refused to say either. Now it says both, each with its own days.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

    const heads = await page
      .locator('.print-page')
      .first()
      .evaluate((el) =>
        [...el.querySelectorAll('thead th')]
          .slice(1)
          .map((th) => (th.textContent ?? '').replace(/\s+/g, ' ').trim()),
      );

    // Every lesson number carries a clock. None is blank any more.
    for (const [i, text] of heads.entries()) {
      expect(text, `${i + 1}. sütun`).toMatch(/\d{2}:\d{2}–\d{2}:\d{2}/);
    }

    // ...and the one where the week disagrees carries both, named.
    const sixth = heads[5]!;
    expect(sixth).toContain('13:30–14:10');
    expect(sixth).toContain('13:10–13:50');
    expect(sixth).toContain('Sal–Cum');
    expect(sixth).toContain('Cmt–Pzr');

    // The eleven that agree say nothing about days: naming them on every
    // column would say nothing eleven times to explain one.
    expect(heads[0]).not.toMatch(/Sal|Cmt/);
  });

  test('iki saatli başlık sütunu GENİŞLETMİYOR', async ({ page }) => {
    // `table-layout: fixed` is what keeps the columns equal, and a header that
    // grew its own column would break the one thing paper has to get right.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    for (const per of ['1', '2', '4']) {
      await choose(page, per);
      const w = await page
        .locator('.print-page')
        .first()
        .evaluate((el) =>
          [...el.querySelectorAll('thead th')].slice(1).map((t) => t.getBoundingClientRect().width),
        );
      const spread = Math.max(...w) - Math.min(...w);
      expect(spread, `per=${per}: sütunlar ${spread.toFixed(2)}px ayrışıyor`).toBeLessThanOrEqual(1);
    }
  });

  test('4’lüde 4 program = 1 KÂĞIT — PDF sayarak', async ({ page }) => {
    // The one assertion that goes all the way to the printer. Everything else
    // in this file measures the DOM; this counts the pages a PDF actually has,
    // which is the only place a stray `break-after` or a fractional pixel of
    // overflow shows up (pitfall 31 cost a blank sheet behind every timetable
    // and no DOM measurement saw it).
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    for (const n of [0, 1, 2, 3]) await list.locator('.pick-item').nth(n).locator('input').check();
    await expect(page.locator('.print-page')).toHaveCount(4);

    for (const [per, sheets] of [
      ['1', 4],
      ['2', 2],
      ['4', 1],
    ] as const) {
      await layout(page).getByRole('button', { name: per, exact: true }).click();
      const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
      const count = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
      expect(count, `per=${per}: PDF ${count} sayfa, beklenen ${sheets}`).toBe(sheets);
    }
  });
});// 84. Çıktının sağ rayı — ÜÇ kaydırıcı BİRE indi.
//
// "Çıktıdaki sağ blokların da aşağı yukarı gitme özelliği babam için biraz zor
//  o sebeple ya yatay şekilde ya sağa sola ya da biraz daha geniş şekilde
//  yapabiliriz aslında çünkü çıktı kısmında bayağı boşluk var."
//
// Measured before the change, sample school, "İkisi de" selected:
//
//   %100  kaydırıcı 3 (ray 728px + iki `.pick-items` 22/74px) · ray 310px
//         kâğıdın yanındaki boş yer 433px
//   %150  kaydırıcı 3 (ray 1373px + iki 117px)                · ray 462px
//         boş yer 256px
//
// The room really was there, and the two tick lists were reading twenty-five
// names through a 168px window inside a column that also scrolled. The 168 was
// a raw pixel as well, so the larger the reader set the scale the FEWER names
// that window held.
test.describe('84. Çıktının sağ rayı', () => {
  const scope = (page: import('@playwright/test').Page, name: string) =>
    page.getByRole('button', { name, exact: true }).click();

  for (const pct of [100, 150]) {
    test(`%${pct}: rayda TEK kaydırıcı var ve kâğıt hâlâ sığıyor`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
      await revealRibbon(page);
      // Both lists: one scope draws one list, and the complaint was about two.
      await scope(page, 'İkisi de');
      await settled(page);

      const m = await page.evaluate(() => {
        const aside = document.querySelector('.cols > aside') as HTMLElement;
        const boxes = [aside, ...aside.querySelectorAll<HTMLElement>('*')];
        const area = document.querySelector('.print-area') as HTMLElement;
        const sheet = document.querySelector('.print-sheet') as HTMLElement;
        const lists = [...aside.querySelectorAll<HTMLElement>('.pick-list')];
        return {
          scrollers: boxes
            .filter((e) => e.scrollHeight > e.clientHeight + 1)
            .map((e) => `${e.className || e.tagName}+${e.scrollHeight - e.clientHeight}`),
          listCount: lists.length,
          tops: lists.map((e) => Math.round(e.getBoundingClientRect().top)),
          margin: Math.round(
            area.getBoundingClientRect().width - sheet.getBoundingClientRect().width,
          ),
          bodyOver: document.body.scrollWidth - document.body.clientWidth,
        };
      });

      // The guard: two lists, or there is nothing here to have been hard.
      expect(m.listCount, 'iki liste yok, ölçülecek bir şey yok').toBe(2);
      // ONE box gives ground, and it is the rail — the box `100cqh` already
      // bounds. Not the lists inside it, and not both at once.
      expect(m.scrollers, `rayda ${m.scrollers.length} kaydırıcı`).toHaveLength(1);
      expect(m.scrollers[0]).toBe('ASIDE+' + m.scrollers[0]!.split('+')[1]);
      // The room came from beside the paper, and the paper has to keep some.
      // The sheet is 297mm fixed; the preview column must stay wider than it.
      expect(m.margin, `kâğıdın yanında ${m.margin}px kaldı`).toBeGreaterThan(60);
      expect(m.bodyOver, 'sayfa yatay taşıyor').toBeLessThanOrEqual(1);

      // AND THE TWO LISTS STAND SIDE BY SIDE AT 100%, which is what the wider
      // rail bought. At 150% they do not fit beside each other and `auto-fit`
      // stacks them — that is a measurement, not a fallback nobody looked at:
      // two 16rem columns and a 19.5px gap want 643px of a 532px box.
      if (pct === 100) {
        expect(m.tops[0], `yan yana değiller: ${JSON.stringify(m.tops)}`).toBe(m.tops[1]);
      } else {
        expect(m.tops[0]).not.toBe(m.tops[1]);
      }
    });
  }
});

