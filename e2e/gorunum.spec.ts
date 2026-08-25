// 44. Ayarlar → Görünüm: how big the interface is drawn, and how much of the
// week the grid shows at once.
//
// One setting, six steps, and one claim that has to be MEASURED rather than
// asserted, because getting it wrong is invisible until my father is standing
// at the printer: enlarging the screen must not change what fits on an A4
// sheet. Everything on paper is sized from --fs-p-* in pt and in mm, and
// @media print pins --ui-scale back to 1 — this file is what makes that a fact
// instead of a comment.

import { expect, test } from '@playwright/test';
import {
  openSetup,
  chooseDensity,
  open,
  openWithSample,
  openSettings,
  chooseScale,
  savedText,
  settledText,
} from './helpers';


/** What the grid actually is right now: the numbers A5 is a claim about. */
async function gridMetrics(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const wrap = document.querySelector('.grid-wrap')!;
    const cell = document.querySelector('table.grid tbody td:not(.break-col)')!;
    const clock = document.querySelector('.hour-clock');
    const cards = [...document.querySelectorAll('table.grid .card')];
    return {
      cell: cell.getBoundingClientRect().width,
      table: document.querySelector('table.grid')!.getBoundingClientRect().width,
      overflow: wrap.scrollWidth - wrap.clientWidth,
      clock: clock === null ? 'yok' : getComputedStyle(clock).display,
      cards: cards.length,
      // A cell narrow enough to clip the class name would make the whole mode
      // pointless, so the cards are measured, not assumed.
      clipped: cards.filter((c) => c.scrollWidth - c.clientWidth > 0.5).length,
    };
  });
}

const rootFontSize = (page: import('@playwright/test').Page) =>
  page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));

test.describe('44. Görünüm — yazı büyüklüğü', () => {
  test('ölçek kökün yazı boyunu değiştiriyor ve yenilemede duruyor', async ({ page }) => {
    await open(page);
    expect(await rootFontSize(page)).toBeCloseTo(16, 1);

    await chooseScale(page, 125);
    expect(await rootFontSize(page)).toBeCloseTo(20, 1);

    // The preference is a machine preference, so it lives in localStorage and
    // has to survive the reload that proves it is not React state.
    await page.reload();
    expect(await rootFontSize(page)).toBeCloseTo(20, 1);
    await openSettings(page, 'Görünüm');
    await expect(page.getByRole('button', { name: '%125', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await chooseScale(page, 100);
    await page.reload();
    expect(await rootFontSize(page)).toBeCloseTo(16, 1);
  });

  test('tavan %150 — merdivenin son basamağı gerçekten çiziliyor', async ({ page }) => {
    // The ceiling moved from %125 to %150 for the reader this tool is built
    // for. A ceiling nobody measures is a ceiling that quietly does nothing:
    // this checks that the last rung exists, applies, and does not tear the
    // layout — on the two screens with the most furniture per pixel.
    await openWithSample(page);
    await openSettings(page, 'Görünüm');

    const steps = await page
      .getByRole('group', { name: 'Yazı büyüklüğü' })
      .getByRole('button')
      .allInnerTexts();
    expect(steps[0]).toBe('%100');
    expect(steps[steps.length - 1]).toBe('%150');
    // 1.00 to 1.50 in steps of 0.05: eleven rungs, and they are buttons rather
    // than a slider because the ladder has exactly eleven legal values.
    expect(steps).toHaveLength(11);

    await chooseScale(page, 150);
    expect(await rootFontSize(page)).toBeCloseTo(24, 1);

    for (const [name, go] of [
      ['Kurulum → Öğretmenler', () => openSetup(page, 'Öğretmenler')],
      ['Ayarlar → Kurallar', () => openSettings(page, 'Kurallar')],
    ] as const) {
      await go();
      const spill = await page.evaluate(() => ({
        x: document.body.scrollWidth - document.body.clientWidth,
        clipped: [...document.querySelectorAll('table.list th')].filter(
          (el) => el.scrollWidth > el.clientWidth + 0.5,
        ).length,
      }));
      expect(spill.x, `${name} %150'de yatay taşıyor`).toBeLessThanOrEqual(1);
      expect(spill.clipped, `${name} %150'de ${spill.clipped} başlık kırpıldı`).toBe(0);
    }

    await chooseScale(page, 100);
  });

  test('ızgara ölçekle birlikte büyüyor', async ({ page }) => {
    // The grid is on the same axis as the shell: A5 (a separate --grid-zoom)
    // was removed, and a scale setting that leaves the one screen my father
    // spends the day in untouched would miss the point of the setting.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    const measure = () =>
      page.locator('table.grid').evaluate((e) => ({
        width: e.getBoundingClientRect().width,
        columns: e.querySelectorAll('thead tr:nth-child(2) th').length,
      }));
    const before = await measure();

    await chooseScale(page, 125);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
    const after = await measure();

    // The tolerance is DERIVED, not chosen: --cell-w is 2.125rem, so at %125 a
    // cell wants 42.5px, and the embedded face's min-content ("09:00" in the
    // heading — the same thing that sets the floor in pitfall 37) rounds it up
    // to the next whole pixel. Half a pixel per column, and the grid has 78 of
    // them: measured 3273px against an ideal 3270px. A cell written in px
    // would land on 2616px and miss by six hundred, not by three.
    const slack = before.columns * 0.5 + 1;
    expect(after.columns).toBe(before.columns);
    expect(
      after.width,
      `%100'de ${before.width}px, %125'te ${after.width}px — ` +
        `beklenen ${(before.width * 1.25).toFixed(0)}px ±${slack}`,
    ).toBeGreaterThanOrEqual(before.width * 1.25 - slack);
    expect(after.width).toBeLessThanOrEqual(before.width * 1.25 + slack);
  });

  test('YAZDIRMA ölçekten etkilenmiyor — punto da, sayfa sayısı da', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();

    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbiri' }).click();
    for (const n of [0, 1, 2]) await list.locator('.pick-item').nth(n).locator('input').check();

    // Every size that lands on paper, read the way the page paints it.
    const paperSizes = async () => {
      await page.emulateMedia({ media: 'print' });
      const sizes = await page.evaluate(() => {
        const pick = (sel: string) => {
          const node = document.querySelector(sel);
          return node === null ? null : getComputedStyle(node).fontSize;
        };
        return {
          title: pick('.p-title-main'),
          sub: pick('.p-title-sub'),
          cell: pick('table.print tbody td'),
          day: pick('table.print .p-daycol'),
          head: pick('table.print thead th'),
        };
      });
      const overflow = await page
        .locator('.print-page')
        .first()
        .evaluate((e) => e.scrollHeight - e.clientHeight);
      const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
      await page.emulateMedia({ media: 'screen' });
      return {
        sizes,
        overflow,
        pages: (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length,
      };
    };

    const at100 = await paperSizes();
    expect(at100.pages).toBe(3);

    await chooseScale(page, 125);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page')).toHaveCount(3);
    const at125 = await paperSizes();

    // Not "close to": identical. A paper size that moves at all with the
    // slider is the bug.
    expect(at125.sizes).toEqual(at100.sizes);
    expect(at125.pages).toBe(at100.pages);
    // And it still fits, which is the thing the sizes are a proxy for.
    expect(at125.overflow).toBeLessThanOrEqual(1);
  });

  test('ölçek tercihi programın kendisine girmiyor', async ({ page }) => {
    // Principle: a machine preference must never reach `State`, or a backup
    // taken here would resize my father's screen and a cosmetic setting would
    // cost a schema migration.
    await openWithSample(page);
    // Pitfall 24: the store debounces by 400 ms, and the page's OWN load write
    // lands inside that window. Reading before it has written anything would
    // compare an empty box against a full one and pass for the wrong reason.
    const before = await settledText(page);
    await chooseScale(page, 120);
    // Give the debounce more than its 400 ms to prove it stays quiet.
    await page.waitForTimeout(700);
    expect(await savedText(page)).toBe(before);

    const stored = await page.evaluate(() => localStorage.getItem('ders-programi-olcek'));
    expect(stored).toBe('1.2');
  });

  test('Ayarlar → Veri ölçek anahtarını da sayıyor', async ({ page }) => {
    // The "where is my data" table must name every key the program owns; a new
    // preference that is not listed makes the panel a liar.
    await openWithSample(page);
    await chooseScale(page, 110);
    await openSettings(page, 'Veri');
    const panel = page.locator('.panel', { hasText: 'Veriler nerede' });
    await expect(panel.locator('tbody code', { hasText: 'ders-programi-olcek' })).toHaveCount(1);
  });
});

test.describe('45. Görünüm — ızgara yoğunluğu (A5)', () => {
  // The claim this mode is built on is a measurement, not a preference:
  // --cell-w was set to 28, 23 and 18px in turn and the cell came out 33.69px
  // every time, because "10:40" under the lesson number — not the card — was
  // setting the column's min-content (pitfall 37). So the test asserts the
  // measurement: hiding the clock is what makes the week fit.
  test('Sığdır haftanın tamamını kutuya sokuyor, kart yazısını kırpmadan', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    // The grid has to be FULL. An empty sample would let both the fit and the
    // "nothing is clipped" assertion pass on a grid with nothing in it, which
    // is exactly the free green pitfall 33 warned about — the cards are what
    // set the column's floor once the clock is gone.
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('table.grid .card').first()).toBeVisible();

    const roomy = await gridMetrics(page);
    expect(roomy.cards).toBeGreaterThan(400);
    expect(roomy.clock).toBe('block');
    expect(roomy.cell).toBeCloseTo(34, 0);
    // The default is the grid my father already knows: it scrolls sideways.
    expect(roomy.overflow).toBeGreaterThan(500);

    await chooseDensity(page, 'Sığdır');
    const fit = await gridMetrics(page);

    expect(fit.clock).toBe('none');
    expect(fit.cell).toBeLessThan(roomy.cell);
    // The point of the whole mode, in one number.
    expect(fit.overflow, `Sığdır'da ${fit.overflow}px yatay kaydırma kaldı`).toBe(0);
    // ...and it must not have been bought by clipping the cells.
    expect(fit.cards).toBe(roomy.cards);
    expect(fit.clipped, `${fit.clipped} kartın yazısı kırpıldı`).toBe(0);

    // Rahat is a real way back, not a one-way door.
    await chooseDensity(page, 'Rahat');
    const back = await gridMetrics(page);
    expect(back.clock).toBe('block');
    expect(back.cell).toBeCloseTo(roomy.cell, 0);
    expect(back.table).toBeCloseTo(roomy.table, 0);
  });

  test('yoğunluk tercihi yenilemede duruyor ve programın kendisine girmiyor', async ({ page }) => {
    await openWithSample(page);
    // Pitfall 24: the store debounces by 400 ms and the page's own load write
    // lands inside that window.
    const before = await settledText(page);

    await chooseDensity(page, 'Sığdır');
    await page.waitForTimeout(700);
    expect(await savedText(page)).toBe(before);
    expect(await page.evaluate(() => localStorage.getItem('ders-programi-yogunluk'))).toBe('sigdir');

    await page.reload();
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
    expect((await gridMetrics(page)).clock).toBe('none');
  });

  test('Ayarlar → Veri yoğunluk anahtarını da sayıyor', async ({ page }) => {
    await openWithSample(page);
    await chooseDensity(page, 'Sığdır');
    await openSettings(page, 'Veri');
    const panel = page.locator('.panel', { hasText: 'Veriler nerede' });
    await expect(panel.locator('tbody code', { hasText: 'ders-programi-yogunluk' })).toHaveCount(1);
  });
});
