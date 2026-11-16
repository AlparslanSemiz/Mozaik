// 44. Ayarlar → Görünüm: how big the interface is drawn, and the grid that
// fits its box by itself (the densities went on 2026-11-16, Sadeleşme K6).
//
// One setting, six steps, and one claim that has to be MEASURED rather than
// asserted, because getting it wrong is invisible until my father is standing
// at the printer: enlarging the screen must not change what fits on an A4
// sheet. Everything on paper is sized from --fs-p-* in pt and in mm, and
// @media print pins --ui-scale back to 1 — this file is what makes that a fact
// instead of a comment.

import { readFileSync } from 'node:fs';
import type { State } from '../src/leaf/model/types';
import { expect, test } from './kapan';
import {
  PDF_YALNIZ_CHROMIUM,
  chooseScale,
  loadWorld,
  open,
  openGridMenu,
  openSettings,
  openSetup,
  openWithSample,
  reopen,
  savedText,
  settledText,
  openPerson,
  openPrintClasses,
} from './helpers';

/** What the grid actually is right now: the numbers A5 is a claim about. */
async function gridMetrics(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const overflows = (el: Element) => {
      const text = document.createRange();
      text.selectNodeContents(el);
      return (
        text.getBoundingClientRect().width > el.getBoundingClientRect().width + 0.01 ||
        el.scrollWidth - el.clientWidth > 0.5
      );
    };
    const wrap = document.querySelector('.grid-wrap')!;
    const cell = document.querySelector('table.grid tbody td:not(.break-col)')!;
    const clock = document.querySelector('table.grid .hour-clock');
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
      // In its own row, not in <body>: the clock's air (`table.grid
      // .hour-clock`, 2026-11-15) is scoped to the grid, and a clone outside
      // the table measured the heading 1.75px narrower than it is drawn.
      head.parentElement!.appendChild(klon);
      headWants = klon.getBoundingClientRect().width;
      klon.remove();
    }

    return {
      cell: cell.getBoundingClientRect().width,
      headWants,
      table: document.querySelector('table.grid')!.getBoundingClientRect().width,
      overflow: wrap.scrollWidth - wrap.clientWidth,
      clock: clock === null ? 'yok' : getComputedStyle(clock).display,
      // Lesson HOURS, not cards: a two-hour block is one card spanning two
      // columns since 2026-08-27, so counting cards would count blocks — and
      // "the grid has to be FULL" is a claim about hours. It would give the
      // same answer if the drawing changed back.
      cards: cards.reduce(
        (sum, c) => sum + (Number(c.closest('td')?.getAttribute('colspan')) || 1),
        0,
      ),
      // A cell narrow enough to clip the class name would make the whole mode
      // pointless, so the cards are measured, not assumed.
      //
      // The LINE, not the card. This asked `.card` for two versions and got 0
      // every time, including in the box the exe actually runs in, where 315
      // of 374 cards were reading "4…" instead of "411" — the whole of the
      // complaint this metric exists to catch. `.card` is the flex container
      // and the ellipsis lives on `.card-top`, which is `width: 100%` inside
      // it: the child clips, the parent never overflows. Pitfall 64, in the
      // one place that was supposed to be the guard against it — measuring
      // the right screen with the wrong box answers a question nobody asked.
      //
      // And BOTH lines. The bottom one is the room letter or the subject short,
      // and on the father's week it is "Mat1" in a 24px card: counting only the
      // top line said 1 of 211 in the class view where 26 were clipped.
      //
      // And by the text's own width against the line's own box, both
      // fractional. `clientWidth` ROUNDS (a 24.53px box reads 25), so a
      // `scrollWidth` check passed 25px of text that the browser drew as
      // "41…" — on 67 of the father's cards (pitfall 140).
      clipped: cards.filter((c) =>
        [c.querySelector('.card-top'), c.querySelector('.card-bottom')].some(
          (line) => line !== null && overflows(line),
        ),
      ).length,
      // The line box of a one-hour card's two lines. Sığdır may change the
      // size of a line; this is what it must leave alone.
      lineBox: (() => {
        const td = [...document.querySelectorAll('table.grid tbody td')].find(
          (x) => (x as HTMLTableCellElement).colSpan === 1 && x.querySelector('.card-bottom'),
        );
        return ['.card-top', '.card-bottom'].map((sel) => {
          const line = td?.querySelector(sel);
          return line == null ? 0 : parseFloat(getComputedStyle(line).lineHeight);
        });
      })(),
      // The smallest type any card line was drawn at. Sığdır may shrink a line
      // that does not fit, and this is the floor that shrinking promised.
      smallestText: Math.min(
        ...[...document.querySelectorAll('table.grid .card-top, table.grid .card-bottom')].map(
          (line) => parseFloat(getComputedStyle(line).fontSize),
        ),
      ),
      // The row head and the corner are the OTHER half of the same trade:
      // every pixel handed to a lesson column is taken from them, so a fix
      // that stops the cards clipping can start the heads clipping instead
      // and no card-only metric would say so.
      headsClipped: [...document.querySelectorAll('table.grid tbody th')].filter(
        (th) =>
          th.scrollWidth - th.clientWidth > 0.5 ||
          [...th.querySelectorAll('.secondary, .inspect')].some(overflows),
      ).length,
      heads: document.querySelectorAll('table.grid tbody th').length,
      // The hour numbers: "10", "11", "12" read "1." once (2026-11-16).
      hoursClipped: [...document.querySelectorAll('table.grid thead th[data-col]')].filter(
        overflows,
      ).length,
      cornerClipped: (() => {
        const c = document.querySelector('table.grid .corner');
        return c !== null && c.scrollWidth - c.clientWidth > 0.5;
      })(),
      // Sığdır's whole subject is WIDTH. If a row got taller the mode paid for
      // its fit in the one currency it was never allowed to spend.
      rowH: document.querySelector('table.grid tbody tr')!.getBoundingClientRect().height,
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
const SCALE_DEFAULT = 1;

/**
 * ...and the root it multiplies. 16px until 2026-08-27, 14 until 2026-08-30,
 * 13 since. The same request twice — the screen is too big — answered the same
 * way twice: move the anchor, re-pin the type ladder against it, leave the
 * default at 100%.
 */
const ROOT_PX = 13;

test.describe('44. Görünüm — yazı büyüklüğü', () => {
  test('ölçek kökün yazı boyunu değiştiriyor ve yenilemede duruyor', async ({ page }) => {
    await open(page);
    // The default is the floor again since 2026-08-27 — what got smaller is
    // what 100% MEANS (a 14px root, not 16), which is what the reader asked
    // for: "yüzde yüzü biraz daha küçült ... default yüzde 100 olsun".
    expect(await rootFontSize(page)).toBeCloseTo(ROOT_PX * SCALE_DEFAULT, 1);

    await chooseScale(page, 130);
    expect(await rootFontSize(page)).toBeCloseTo(ROOT_PX * 1.3, 1);

    // The preference is a machine preference, so it lives in localStorage and
    // has to survive the reload that proves it is not React state.
    await reopen(page);
    expect(await rootFontSize(page)).toBeCloseTo(ROOT_PX * 1.3, 1);
    await openSettings(page, 'Görünüm');
    await expect(page.getByRole('button', { name: 'Daha büyük', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await chooseScale(page, 100);
    await reopen(page);
    expect(await rootFontSize(page)).toBeCloseTo(ROOT_PX, 1);
  });

  test('tavan %150 — merdivenin son basamağı gerçekten çiziliyor', async ({ page }) => {
    // The ceiling moved from %125 to %150 because a ceiling is only worth
    // having above what somebody can actually reach for, and the reader has
    // trouble seeing. It is headroom, not where he sits: he works at 100%.
    // That is exactly why the rung needs a test — nobody arrives here by
    // default, so a ceiling nobody measures is a ceiling that quietly does
    // nothing. This checks that the last rung exists, applies, and does not
    // tear the layout, on the two screens with the most furniture per pixel.
    await openWithSample(page);
    await openSettings(page, 'Görünüm');

    const steps = await page
      .getByRole('group', { name: 'Yazı büyüklüğü' })
      .getByRole('button')
      .allInnerTexts();
    // Four named steps since 2026-11-16: fifteen "%" buttons were hard to
    // find and to choose from (walkthrough). An older stored %80 still draws.
    expect(steps).toEqual(['Normal', 'Büyük', 'Daha büyük', 'Çok büyük']);

    await chooseScale(page, 150);
    expect(await rootFontSize(page)).toBeCloseTo(ROOT_PX * 1.5, 1);

    for (const [name, go] of [
      ['Okul → Öğretmenler', () => openSetup(page, 'Öğretmenler')],
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

  // THE FLOOR IS THE HALF NOBODY HAD MEASURED. A ceiling gets measured because
  // things SPILL; a floor has to be measured because things stop shrinking —
  // every length still written in raw px keeps its pixels while everything
  // around it comes down, so it grows in relative terms and takes the room from
  // whatever CAN shrink. That is pitfall 33 read backwards, and the suite goes
  // green either way.
  test('taban %80 — gerçekten uygulanıyor ve hiçbir şey kırpılmıyor', async ({ page }) => {
    await openWithSample(page);
    await chooseScale(page, 80);
    expect(await rootFontSize(page)).toBeCloseTo(ROOT_PX * 0.8, 1);

    for (const [name, go] of [
      ['Okul → Öğretmenler', () => openSetup(page, 'Öğretmenler')],
      ['Ayarlar → Kurallar', () => openSettings(page, 'Kurallar')],
      ['Ayarlar → Görünüm', () => openSettings(page, 'Görünüm')],
    ] as const) {
      await go();
      const spill = await page.evaluate(() => ({
        x: document.body.scrollWidth - document.body.clientWidth,
        clipped: [...document.querySelectorAll('table.list th, .btn')].filter(
          (el) => el.scrollWidth > el.clientWidth + 0.5,
        ).length,
      }));
      expect(spill.x, `${name} %80'de yatay taşıyor`).toBeLessThanOrEqual(1);
      expect(spill.clipped, `${name} %80'de ${spill.clipped} kutu kırpıldı`).toBe(0);
    }

    await chooseScale(page, 100);
  });

  // "Ekran hareketleri ve Dil solda olmalı." Both were in the right rail, which on this
  // screen is the one column that is NOT about the screen: the rail holds the
  // sample rows you judge the size by, and two settings had been parked beside
  // it. Now the rail holds one panel and the settings are all in one column, in
  // the order they are read.
  //
  // The test asks WHICH COLUMN, not which pixel: a panel's x is a layout
  // detail, its parent is the decision.
  test('Ekran hareketleri ve Dil SOL sütunda, rayda yalnız örnek var', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Görünüm');

    const where = await page.evaluate(() => {
      const cols = document.querySelector('.cols')!;
      const left = cols.firstElementChild!;
      const rail = cols.querySelector('aside')!;
      const titles = (root: Element) =>
        // A heading with its "?" sits in a `.panel-head` since 2026-11-16.
        [...root.querySelectorAll(':scope > .panel > h2, :scope > .panel > .panel-head > h2')].map(
          (h) => h.textContent?.trim() ?? '',
        );
      return { left: titles(left), rail: titles(rail) };
    });

    expect(where.left, JSON.stringify(where)).toContain('Ekran hareketleri');
    expect(where.left, JSON.stringify(where)).toContain('Dil');
    expect(where.rail, JSON.stringify(where)).not.toContain('Ekran hareketleri');
    expect(where.rail, JSON.stringify(where)).not.toContain('Dil');
    // ...and the rail is down to one panel, which is the shape
    // `.cols > aside > .panel:only-child` is written for: what gives ground
    // inside it is the LIST, never the panel. Without the scroll box the
    // sample table would take the panel's own last-resort scrollbar and the
    // two sentences above it would travel with the rows.
    expect(where.rail).toEqual(['Örnek']);
    const scroller = await page.evaluate(() => {
      const panel = document.querySelector('.cols > aside > .panel')!;
      return {
        onlyChild: panel.matches(':only-child'),
        list: panel.querySelector(':scope > .stat-scroll') !== null,
      };
    });
    expect(scroller.onlyChild).toBe(true);
    expect(scroller.list, 'örnek tablosu kendi kutusunda değil').toBe(true);
  });

  test('ızgara ölçekle birlikte büyüyor', async ({ page }) => {
    // The grid is on the same axis as the shell: a scale setting that leaves
    // the one screen my father spends the day in untouched would miss the
    // point of the setting. Since 2026-11-16 (K6) the grid's WIDTH is the
    // box's, so what the scale moves is the height of a row and the type in
    // it; the week stays in the box.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    const measure = () =>
      page.locator('table.grid').evaluate((e) => ({
        row: e.querySelector('tbody tr')!.getBoundingClientRect().height,
        head: parseFloat(getComputedStyle(e.querySelector('tbody .row-head')!).fontSize),
        over: e.parentElement!.scrollWidth - e.parentElement!.clientWidth,
      }));
    await chooseScale(page, 100);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
    const before = await measure();

    await chooseScale(page, 125);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
    const after = await measure();

    expect(after.head).toBeCloseTo(before.head * 1.25, 0);
    expect(after.row, `%100'de ${before.row}px, %125'te ${after.row}px`).toBeGreaterThan(
      before.row * 1.15,
    );
    expect(before.over).toBe(0);
  });

  test('YAZDIRMA ölçekten etkilenmiyor — punto da, sayfa sayısı da', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', PDF_YALNIZ_CHROMIUM);
    await openWithSample(page);
    await openPrintClasses(page);

    const list = page.locator('.pick-list', { hasText: 'Sınıflar' });
    await list.getByRole('button', { name: 'Hiçbirini seçme' }).click();
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
    await page
      .locator('.tabstrip')
      .getByRole('button', { name: 'Yazdır ve gönder', exact: true })
      .click();
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

  test('Ayarlar → Hakkında ölçek anahtarını da sayıyor', async ({ page }) => {
    // The "where is my data" table must name every key the program owns; a new
    // preference that is not listed makes the panel a liar.
    await openWithSample(page);
    await chooseScale(page, 110);
    await openSettings(page, 'Hakkında');
    const panel = page.locator('.panel', { hasText: 'Veriler nerede' });
    await expect(panel.locator('tbody code', { hasText: 'ders-programi-olcek' })).toHaveCount(1);
  });
});

test.describe('45. Görünüm — ızgara kutuya kendiliğinden sığıyor (A5, K6)', () => {
  // Since 2026-11-16 the grid has ONE layout, what was "Sığdır": the whole
  // week in the box, no switch. What made it fit is a measurement (pitfall 37):
  // the bell time under the hour number set the column's min-content, so the
  // grid draws no clock at all now; the heading's title still says it.
  test('haftanın tamamı kutuda, kart yazısı kırpılmadan', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    // The grid has to be FULL. An empty sample would let both the fit and the
    // "nothing is clipped" assertion pass on a grid with nothing in it
    // (pitfall 33): the cards are what set the column's floor.
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('table.grid .card').first()).toBeVisible();

    const fit = await gridMetrics(page);
    expect(fit.cards).toBeGreaterThan(400);
    expect(fit.clock, 'ızgarada saat çizilmemeli').toBe('yok');
    expect(fit.overflow, `${fit.overflow}px yatay kaydırma kaldı`).toBe(0);
    expect(fit.clipped, `${fit.clipped} kartın yazısı kırpıldı`).toBe(0);
    await expect(page.locator('table.grid thead th[data-col]').first()).toHaveAttribute(
      'title',
      /^\d{2}:\d{2}–\d{2}:\d{2}$/,
    );
  });

  // The app's own scale (Ayarlar → Yazı büyüklüğü), and the boxes a 1366 and
  // a 1920 screen give at Windows %100, %125 and %150 (CSS px = screen /
  // zoom). Every lesson is read whole at 11px or more; where 72 such columns
  // do not go in, the grid scrolls sideways (2026-11-16) and its last hour,
  // and the row heads, are reachable.
  for (const target of [
    { width: 1920, height: 1080, scale: 100, fits: true },
    { width: 1536, height: 864, scale: 100, fits: false },
    { width: 1280, height: 720, scale: 100, fits: false },
    { width: 1366, height: 768, scale: 100, fits: false },
    { width: 1093, height: 614, scale: 100, fits: false },
    { width: 911, height: 512, scale: 100, fits: false },
    { width: 1366, height: 768, scale: 125, fits: false },
    { width: 1920, height: 1080, scale: 150, fits: false },
  ]) {
    test(`${target.width}×${target.height} ve %${target.scale}: hiçbir ders kırpılmıyor`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: target.width, height: target.height });
      await openWithSample(page);
      if (target.scale !== 100) await chooseScale(page, target.scale);
      await page.getByRole('button', { name: 'Program', exact: true }).click();
      await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
      await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({
        timeout: 30_000,
      });

      const fit = await gridMetrics(page);
      expect(fit.cards).toBeGreaterThan(300);
      expect(fit.clipped, `${fit.clipped}/${fit.cards} ders kırpıldı`).toBe(0);
      expect(fit.hoursClipped, `${fit.hoursClipped} saat numarası kırpıldı`).toBe(0);
      expect(fit.smallestText, 'ders yazısı 11 px altına indi').toBeGreaterThanOrEqual(11);
      if (target.fits) {
        expect(fit.overflow, `${fit.overflow}px yatay kaydırma kaldı`).toBe(0);
        return;
      }
      expect(fit.overflow, 'sığmayan hafta kaymıyor').toBeGreaterThan(0);
      // Scrolled all the way: the last day's last hour is in the box, and the
      // row heads stayed where they were.
      const head = page.locator('tbody .row-head').first();
      const before = (await head.boundingBox())!;
      const seen = await page.locator('.grid-wrap').evaluate((wrap) => {
        wrap.scrollLeft = wrap.scrollWidth;
        const last = [...wrap.querySelectorAll('thead th[data-col]')].at(-1)!;
        const box = wrap.getBoundingClientRect();
        const r = last.getBoundingClientRect();
        return r.left >= box.left - 0.5 && r.right <= box.right + 0.5;
      });
      expect(seen, 'son saat görünmüyor').toBe(true);
      await page.waitForTimeout(120);
      expect(Math.abs((await head.boundingBox())!.x - before.x)).toBeLessThan(2);
    });
  }

  /**
   * The box the EXE actually runs in (1920x1032, the fixed window maximised),
   * in BOTH views: the teacher row's second line is a subject short ("Mat"),
   * the class row's is "G dersliği", and a row-head width that suits one
   * clipped all twenty heads of the other.
   */
  for (const view of ['Öğretmen görünümü', 'Sınıf görünümü']) {
    test(`exe'nin kutusunda da kırpmıyor · ${view}`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1032 });
      await openWithSample(page);
      await page.getByRole('button', { name: 'Program', exact: true }).click();
      await page.getByRole('button', { name: view }).click();
      await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
      await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator('table.grid .card').first()).toBeVisible();

      const fit = await gridMetrics(page);
      expect(fit.cards, 'ızgara dolu değil, iddia bedava geçerdi').toBeGreaterThan(300);
      expect(fit.overflow, `${fit.overflow}px yatay kaydırma kaldı`).toBe(0);
      expect(fit.clipped, `${fit.clipped}/${fit.cards} kartın yazısı kırpıldı`).toBe(0);
      expect(fit.headsClipped, `${fit.headsClipped}/${fit.heads} satır başı kırpıldı`).toBe(0);
      expect(fit.cornerClipped, 'köşedeki eksen adı kırpıldı').toBe(false);
    });
  }

  test('maximize edilmemiş 1600px kutuda ders kırpılmıyor, satır başı da', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 968 });
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });

    const fit = await gridMetrics(page);
    // 72 columns at the 12px reading size need more than 1600 CSS px, so the
    // grid scrolls here rather than cut a lesson (2026-11-16).
    expect(fit.clipped, `${fit.clipped} ders kırpıldı`).toBe(0);
    expect(fit.headsClipped, `${fit.headsClipped} satır başı kırpıldı`).toBe(0);
  });

  // An older copy saved a density. It is never read again: the page draws the
  // one layout, nothing on <html> says otherwise, and "Veriler nerede" still
  // names the key it once wrote (preferenceKeys.ts).
  test('eski yoğunluk kaydı okunmuyor ve hiçbir şeyi bozmuyor', async ({ page }) => {
    await openWithSample(page);
    await page.evaluate(() => {
      localStorage.setItem('ders-programi-yogunluk', 'rahat');
      localStorage.setItem('ders-programi-arayuz-yogunluk', 'ferah');
    });
    await reopen(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    expect(
      await page.evaluate(() => [
        document.documentElement.getAttribute('data-density'),
        document.documentElement.getAttribute('data-ui-density'),
      ]),
    ).toEqual([null, null]);
    expect((await gridMetrics(page)).overflow).toBe(0);
    await openSettings(page, 'Hakkında');
    const panel = page.locator('.panel', { hasText: 'Veriler nerede' });
    await expect(panel.locator('tbody code', { hasText: 'ders-programi-yogunluk' })).toHaveCount(1);
  });
});

/**
 * The fitted grid on the father's own SHAPE of data, and in the box Windows at %125
 * gives (2026-09-26).
 *
 * Everything above measures the sample school, whose class names are three
 * digits. The father's are "411A SAY": 61px of text for a 24.5px card. On his
 * (anonymised) week 204 of 211 cards read "41…" at 1920 and not one test saw
 * it, and the class rows' own heads were clipped 20 of 20 ("derslik yok").
 * At 1536 CSS px — a 1920 screen at Windows %125 — the sample school's "310"
 * needs 21px where the card has 19.2, and 315 of 374 cards were clipped.
 *
 * The fix the user chose on 2026-09-26 had two halves: a card shows the class
 * name's first word ("411A"), and a line that still did not fit was drawn
 * smaller, down to 9px. The second half went on 2026-11-16: nothing under
 * 11px, and a week that does not fit at that size scrolls sideways.
 *
 * The numbers below are what is left AFTER the fix, measured, not a hope.
 * A one-hour card was 24.5px at 1920 and 21.5 in the first hour of a day,
 * because the 3px day rule is drawn inside that cell: "411A" at 9px fitted the
 * one and not always the other. That cost 2 cards here and 5 on Windows, whose
 * glyph advances are fractional where this machine's hinting rounds them
 * ("410A" at 9px: 22.38px there, 21 here). Since 2026-10-09 the first hour's
 * column gets the rule's width back (B7.22, pitfall 146) and both are 0; the
 * ceilings below were lowered to what was measured then, with Linux's hinting
 * and without it (`--font-render-hinting=none`, which reproduced Windows's
 * 210 line ratios exactly). At %125 a one-hour card is 19.2px and "411A" does
 * not fit even at 9px, so the father's one-hour cards keep their ellipsis
 * there; %80 is still the way out. They are ceilings; the day this gets
 * better, lower them.
 */
test.describe('45b. Izgara babanın şeklindeki veride ve Windows %125 kutusunda', () => {
  const dizili = () =>
    JSON.parse(readFileSync('src/fixtures/tam-dolu-kurs-dizili.json', 'utf8')) as State;

  const boxes = [
    { name: '1920', viewport: { width: 1920, height: 1080 }, dpr: 1 },
    { name: 'Windows %125', viewport: { width: 1536, height: 816 }, dpr: 1.25 },
  ] as const;

  // Zero everywhere since 2026-11-16: a lesson that does not fit makes the
  // grid scroll. Before, the %125 box left 75 and 24 of the father's cards
  // reading "41…" even at 9px.

  for (const box of boxes) {
    test.describe(box.name, () => {
      test.use({ viewport: box.viewport, deviceScaleFactor: box.dpr });

      for (const view of ['Öğretmen görünümü', 'Sınıf görünümü']) {
        test(`babanın verisinde kırpılma iniyor · ${view}`, async ({ page }) => {
          await loadWorld(page, dizili());
          await page.getByRole('button', { name: view }).click();
          await expect(page.locator('table.grid .card').first()).toBeVisible();
          const fit = await gridMetrics(page);
          expect(fit.cards, 'ızgara dolu değil, iddia bedava geçerdi').toBeGreaterThan(300);
          expect(fit.clipped, `${fit.clipped} kartın yazısı kırpıldı`).toBe(0);
          expect(fit.hoursClipped).toBe(0);
          expect(fit.headsClipped, `${fit.headsClipped}/${fit.heads} satır başı kırpıldı`).toBe(0);
          expect(fit.smallestText, 'yazı 11 px altına indi').toBeGreaterThanOrEqual(11);
        });
      }

      if (box.dpr !== 1) {
        for (const view of ['Öğretmen görünümü', 'Sınıf görünümü']) {
          test(`örnek okulda da · ${view}`, async ({ page }) => {
            await openWithSample(page);
            await page.getByRole('button', { name: 'Program', exact: true }).click();
            await page.getByRole('button', { name: view }).click();
            await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
            await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({
              timeout: 30_000,
            });
            const fit = await gridMetrics(page);

            expect(fit.clipped, `${fit.clipped}/374 kartın yazısı kırpıldı`).toBe(0);
            expect(fit.smallestText).toBeGreaterThanOrEqual(11);
          });
        }
      }
    });
  }

  // The full name is not lost: it is what the card SAYS to a screen reader,
  // and the markup still holds it. Since erisim/anlam the name opens with the
  // day and hour ("Çarşamba 10–11. saat, Ö1, 411A SAY, A").
  test('kart sınıfın tam adını söylüyor, ilk kelimesini çiziyor', async ({ page }) => {
    await loadWorld(page, dizili());
    const card = page.locator('table.grid .card', { hasText: '411A' }).first();
    await expect(card).toHaveAttribute('aria-label', /^411A SAY, /);
    await expect(card.locator('.card-top')).toHaveText('411A SAY');
    await expect(card.locator('.card-top')).toHaveJSProperty('innerText', '411A');
  });
});

test.describe('50. Kapalı saatlerde saat gösterimi', () => {
  // The Müsaitlik tab and its "Saatler" switch went with K1 (2026-11-16): the
  // grid lives on the person's page, which always shows the bell, because
  // "Ayşe Hoca salı 10:10'da gelemiyor" is said in clock times. The stored
  // switch (`ders-programi-musaitlik-saat`) is gone; an old value is never read, and
  // the grid's own clockless layout (K6) does not reach this heading.
  test('kişi sayfasının ızgarası saati hep gösteriyor, ızgara göstermiyor', async ({ page }) => {
    await openWithSample(page);
    await expect(page.locator('table.grid thead .hour-clock')).toHaveCount(0);
    await openSetup(page, 'Öğretmenler');
    const sheet = await openPerson(page, 0);
    const clock = sheet.locator('table.availability thead .hour-clock').first();
    await expect(clock).toBeVisible();
    await expect(clock).toHaveText(/^\d{2}:\d{2}$/);
  });

  test('Ayarlar → Hakkında bu anahtarı da sayıyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Hakkında');
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
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    const placed = await page.locator('table.grid .card').count();
    expect(placed).toBeGreaterThan(0);

    await openGridMenu(page);
    await page.getByRole('menuitem', { name: 'Programı boşalt' }).click();
    // Not the same thing as "Yeniden yap": that one refills the grid. This one
    // clears it, which is what the reader asked for by name. No question since
    // SD1: it happens, and the notice says so and offers "Geri al".
    await expect(page.locator('.dlg')).toHaveCount(0);
    await expect(page.locator('.toast', { hasText: 'havuza döndü' })).toBeVisible();
    await expect(page.locator('table.grid .card')).toHaveCount(0);

    // The lessons themselves are untouched — they are back in the pool.
    expect(await page.locator('.pool-card').count()).toBeGreaterThan(0);

    // And it is one undo step.
    await page.locator('.topbar').getByRole('button', { name: 'Geri al', exact: true }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(placed);
  });

  test('boş ızgarada kapalı', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await openGridMenu(page);
    await expect(page.getByRole('menuitem', { name: 'Programı boşalt' })).toHaveAttribute(
      'data-disabled',
      '',
    );
  });
});
