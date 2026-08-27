// 44. Ayarlar → Görünüm: how big the interface is drawn, and how much of the
// week the grid shows at once.
//
// One setting, six steps, and one claim that has to be MEASURED rather than
// asserted, because getting it wrong is invisible until my father is standing
// at the printer: enlarging the screen must not change what fits on an A4
// sheet. Everything on paper is sized from --fs-p-* in pt and in mm, and
// @media print pins --ui-scale back to 1 — this file is what makes that a fact
// instead of a comment.

import { expect, test } from './kapan';
import {
  openSetup,
  chooseDensity,
  open,
  openWithSample,
  openSettings,
  chooseScale,
  savedText,
  settledText,
  answerDialog,
} from './helpers';


/** What the grid actually is right now: the numbers A5 is a claim about. */
async function gridMetrics(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const wrap = document.querySelector('.grid-wrap')!;
    const cell = document.querySelector('table.grid tbody td:not(.break-col)')!;
    const clock = document.querySelector('.hour-clock');
    const cards = [...document.querySelectorAll('table.grid .card')];

    // What the hour heading asks for when nothing constrains it.
    //
    // This is the column's FLOOR (pitfall 37): `width` on a table cell is a
    // request, and no column is ever drawn narrower than its own min-content.
    // Measured rather than assumed, the way renk-secici.spec.ts measures a
    // select: clone it, let it size itself, read what the browser wanted.
    // A hard-coded margin here would be a number about the embedded font,
    // and the font is a thing this project changes.
    const head = clock?.closest('th') ?? null;
    let headWants = 0;
    if (head !== null) {
      const klon = head.cloneNode(true) as HTMLElement;
      klon.style.cssText = 'position:absolute;left:-9999px;top:0;width:max-content';
      document.body.appendChild(klon);
      headWants = klon.getBoundingClientRect().width;
      klon.remove();
    }

    return {
      cell: cell.getBoundingClientRect().width,
      headWants,
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

/**
 * What NO stored preference means. Not 1.0 and not the floor of the range:
 * those were the same number until 2026-08-26 and the tests below were quietly
 * written against the coincidence rather than against the constant.
 *
 * Duplicated here rather than imported because `tsconfig.json` covers `src`
 * only, so an import from `../src/theme` never sees the type checker — the
 * same reason `worlds.ts` lives under `src`. It is asserted against the real
 * page below, so a drift shows up as a failure and not as a stale comment.
 */
const SCALE_DEFAULT = 1.1;

test.describe('44. Görünüm — yazı büyüklüğü', () => {
  test('ölçek kökün yazı boyunu değiştiriyor ve yenilemede duruyor', async ({ page }) => {
    await open(page);
    // The first screen is already a little larger than a browser default: the
    // reader has trouble seeing, and 1.0 was never a measurement.
    expect(await rootFontSize(page)).toBeCloseTo(16 * SCALE_DEFAULT, 1);

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
    // Start from a KNOWN rung rather than from whatever the default happens to
    // be: the ratio below is the whole assertion, and reading it off an
    // unstated starting point is how this test came to claim 1.25 while
    // actually walking 1.10 -> 1.25.
    await chooseScale(page, 100);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
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

test.describe('46. Görünüm — Ferah', () => {
  // The third step, and the one that goes the other way: 'sigdir' trades
  // information for the whole week, 'ferah' trades days on screen for a cell
  // you can read without leaning in. The reader has trouble seeing, so the
  // grid needed a direction that was not "smaller".
  test('Ferah hücreyi büyütüyor ve kartın alt satırını geri veriyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });

    const roomy = await gridMetrics(page);

    await chooseDensity(page, 'Ferah');
    const airy = await gridMetrics(page);

    // Bigger, and bigger in BOTH directions — a wider cell with the same
    // height would just be a stretched slab.
    expect(airy.cell).toBeGreaterThan(roomy.cell);
    expect(airy.clock).toBe('block');
    // The trade is stated out loud: more scrolling, not less.
    expect(airy.overflow).toBeGreaterThan(roomy.overflow);
    // And it is paid for in DAYS, never in legibility.
    expect(airy.cards).toBe(roomy.cards);
    expect(airy.clipped, `${airy.clipped} kartın yazısı kırpıldı`).toBe(0);

    // A real way back, like Sığdır.
    await chooseDensity(page, 'Rahat');
    expect((await gridMetrics(page)).cell).toBeCloseTo(roomy.cell, 0);
  });

  test('üç basamak da şeritten seçilebiliyor ve tercih yenilemede duruyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    // The strip is where this decision is actually taken: you are looking at
    // the grid when you take it.
    const strip = page.locator('.ribbon');
    await strip.getByRole('button', { name: 'Ferah', exact: true }).click();
    await expect(strip.getByRole('button', { name: 'Ferah', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.reload();
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-density', 'ferah');

    // A machine setting, never timetable data.
    const saved = await page.evaluate(() => localStorage.getItem('ders-programi'));
    expect(saved).not.toBeNull();
    expect(saved!.includes('ferah')).toBe(false);
    expect(await page.evaluate(() => localStorage.getItem('ders-programi-yogunluk'))).toBe('ferah');
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
    // --cell-w is 2.125rem and the root is 16px * the scale, so the cell is a
    // CONSEQUENCE of the scale, not a number of its own. Written out as 34 it
    // was really asserting "the default scale is 1.0".
    //
    // It is a FLOOR, not an equality, and pitfall 37 is why: `width` on a table
    // cell is a request, and the column cannot be drawn narrower than its
    // min-content — which here is "09:00" in the heading. At 1.0 the request
    // (34.0) happened to sit above the floor and the two matched exactly; at
    // 1.1 the request is 37.4 and the floor rounds it to 38. Asserting equality
    // was asserting the coincidence.
    //
    // The ceiling used to be `wanted + 2`, and 2 was a number nobody had
    // measured. It was down to 0.4 px of headroom, which is how a test starts
    // failing for a reason that has nothing to do with what it is testing.
    // MEASURED 2026-08-27: the column comes out 39.0 px, the request is
    // 37.4 px, and the heading's own min-content is 41.0 px. So the honest
    // ceiling is the floor itself: the column may be pushed up to what the
    // heading needs and no further. When the embedded face changes, the
    // heading moves and this moves with it (pitfall 42).
    const wanted = 2.125 * 16 * SCALE_DEFAULT;
    expect(roomy.cell).toBeGreaterThanOrEqual(wanted - 0.5);
    expect(roomy.headWants, 'saat başlığı ölçülemedi').toBeGreaterThan(0);
    expect(
      roomy.cell,
      `hücre ${roomy.cell}px, istenen ${wanted.toFixed(1)}px, başlığın istediği ` +
        `${roomy.headWants.toFixed(1)}px — sütun bu ikisinin arasında kalmalı`,
    ).toBeLessThanOrEqual(Math.max(wanted, roomy.headWants) + 0.5);
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

test.describe('50. Müsaitlikte saat gösterimi', () => {
  // "Ayarlarda müsaitlikteki programda derslerin altında saatleri olsun olmasın
  // diye ayar olsun ve default olarak kapalı olsun." — the reader's own words,
  // including the default. The default is the half worth testing: an option
  // that ships turned on is not the option that was asked for.
  test('varsayılan KAPALI, açılınca gerçek saat yazıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();

    const grid = page.locator('table.availability:not(.heat)');
    await expect(grid).toBeVisible();
    const clock = grid.locator('thead .hour-clock').first();
    await expect(clock).toBeHidden();
    const before = (await grid.boundingBox())!;

    await openSettings(page, 'Görünüm');
    await page.getByRole('button', { name: 'Saatler gizli' }).click();
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await expect(clock).toBeVisible();
    await expect(clock).toHaveText(/^\d{2}:\d{2}$/);

    // ...and it costs the table NOTHING, which is the opposite of what I first
    // claimed and the reason this assertion exists rather than a width one.
    // `table-layout: fixed` at `width: 100%` makes the columns equal whatever
    // is in them, and the 2.125rem heading already holds two lines of --fs-xs.
    // Measured: 1341.7 x 354.2 in both states, to the pixel. So this is a
    // choice about NOISE, not about room, and the setting says so.
    const after = (await grid.boundingBox())!;
    expect(after.width).toBeCloseTo(before.width, 0);
    expect(after.height).toBeCloseTo(before.height, 0);
  });

  test('tercih yenilemede duruyor ve programın kendisine girmiyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Görünüm');
    await page.getByRole('button', { name: 'Saatler gizli' }).click();
    await expect(page.getByRole('button', { name: 'Saatler görünüyor' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-avail-clock', 'acik');

    const saved = await page.evaluate(() => localStorage.getItem('ders-programi'));
    expect(saved!.includes('musaitlik-saat')).toBe(false);
    expect(
      await page.evaluate(() => localStorage.getItem('ders-programi-musaitlik-saat')),
    ).toBe('acik');
  });

  test('Ayarlar → Veri bu anahtarı da sayıyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Veri');
    const panel = page.locator('.panel', { hasText: 'Veriler nerede' });
    await expect(
      panel.locator('tbody code', { hasText: 'ders-programi-musaitlik-saat' }),
    ).toHaveCount(1);
  });
});

test.describe('51. Program: programı boşalt', () => {
  test('dizilmiş programı havuza geri gönderiyor, geri alınabiliyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    const placed = await page.locator('table.grid .card').count();
    expect(placed).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Programı boşalt' }).click();
    // Not the same button as "Baştan diz": that one refills the grid. This one
    // clears it, which is what the reader asked for by name.
    const asked = await answerDialog(page);
    expect(asked).toContain('havuza dönecek');
    await expect(page.locator('table.grid .card')).toHaveCount(0);

    // The lessons themselves are untouched — they are back in the pool.
    expect(await page.locator('.pool-card').count()).toBeGreaterThan(0);

    // And it is one undo step.
    await page.getByRole('button', { name: 'Geri al', exact: true }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(placed);
  });

  test('boş ızgarada kapalı', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Programı boşalt' })).toBeDisabled();
  });
});
