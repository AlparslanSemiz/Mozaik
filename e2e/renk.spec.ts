// Colour, contrast and theme. Nothing here is claimed; everything is measured
// with real getComputedStyle values, WCAG contrast and CIE Lab ΔE.

import { expect, test, type Page } from '@playwright/test';
import { open, openWithSample, openSetup, openSettings, dragAndDrop, rgb, relativeLuminance, contrast, deltaE, tokens } from './helpers';

// 8. Theme
//
// The app used to have NO dark theme, yet the screenshots came out dark: the
// browser darkens a light page with its own algorithm. For this tool that is
// not cosmetic — colour is the only feedback channel (green = droppable,
// yellow = warning, red = blocked), and the browser's darkening flattens the
// three into each other. These tests measure what is actually painted.

test.describe('8. Tema', () => {
  test('tema düğmesi çalışıyor ve tercih sayfa yenilenince duruyor', async ({ page }) => {
    await open(page);
    const toggle = page.getByRole('button', { name: 'Koyu tema' });

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  // Both themes, because the light one regressed too: --ok was 4.19:1 on its own
  // background and the "x" on a closed cell was 4.20:1.
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} temada durum renkleri ayırt edilebiliyor ve metin AA geçiyor`, async ({
      page,
    }) => {
      await open(page);
      if (theme === 'dark') await page.getByRole('button', { name: 'Koyu tema' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const t = await tokens(page, [
        '--ok',
        '--ok-bg',
        '--warn',
        '--warn-bg',
        '--bad',
        '--bad-bg',
        '--text',
        '--paper',
        '--muted',
        '--closed',
        '--accent',
        '--accent-bg',
      ]);

      // The page must really be the theme it claims, not a browser-darkened one
      const paperLuminance = relativeLuminance(rgb(t['--paper']!));
      if (theme === 'dark') expect(paperLuminance).toBeLessThan(0.1);
      else expect(paperLuminance).toBeGreaterThan(0.9);

      // Tellable apart from each other, and from a closed cell
      expect(deltaE(t['--ok-bg']!, t['--warn-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--warn-bg']!, t['--bad-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--ok-bg']!, t['--bad-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--closed']!, t['--paper']!)).toBeGreaterThan(12);

      // Readable (WCAG AA)
      for (const [fg, bg] of [
        ['--ok', '--ok-bg'],
        ['--warn', '--warn-bg'],
        ['--bad', '--bad-bg'],
        ['--text', '--paper'],
        ['--muted', '--paper'],
        ['--muted', '--closed'],
        ['--accent', '--accent-bg'],
      ] as const) {
        expect(contrast(t[fg]!, t[bg]!), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test('koyu temada sürükleme geri bildirimi hâlâ üç ayrı renk', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    // The card text sits on the teacher palette, which does NOT flip with the
    // theme — so its ink must not flip either, or the cell becomes unreadable.
    const card = page.locator('.pool-card').first();
    const ink = await card.evaluate((el) => {
      const own = getComputedStyle(el);
      const sub = el.querySelector('.card-bottom');
      return {
        background: own.backgroundColor,
        color: own.color,
        subColor: sub === null ? own.color : getComputedStyle(sub).color,
      };
    });
    expect(contrast(ink.color, ink.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink.subColor, ink.background)).toBeGreaterThanOrEqual(4.5);

    const t = await tokens(page, ['--ok-bg', '--bad-bg', '--closed']);
    expect(deltaE(t['--ok-bg']!, t['--closed']!)).toBeGreaterThan(15);
    expect(deltaE(t['--bad-bg']!, t['--closed']!)).toBeGreaterThan(15);
  });

  test('koyu temada bile kâğıda açık basılıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Yazdır' }).click();

    await page.emulateMedia({ media: 'print' });
    const printed = await tokens(page, ['--paper', '--text']);
    // White paper, dark ink — regardless of what the screen is set to
    expect(relativeLuminance(rgb(printed['--paper']!))).toBeGreaterThan(0.9);
    expect(relativeLuminance(rgb(printed['--text']!))).toBeLessThan(0.1);

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(relativeLuminance(rgb(bodyBg))).toBeGreaterThan(0.9);
    await page.emulateMedia({ media: 'screen' });
  });
});

// ---------------------------------------------------------------------------
// 14. Colour palette
//
// The palette used to be twelve CSS variables and colours repeated: with 25
// teachers, three of them shared a colour with someone else and the pool card
// no longer pointed at one row. It is now 36 hex values in src/palette.ts and
// every teacher gets one nobody else has. That claim is measured HERE, on the
// real thing, because a unit test can only prove the array is fine — not that
// the array is what the browser paints.

test.describe('14. Renk paleti', () => {
  test('25 öğretmenin hiçbiri bir başkasıyla aynı renkte değil', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    // The colour select in the teacher list paints itself with that teacher's
    // colour, so it is the one per-teacher swatch on screen.
    const colors = await page
      .locator('table.list tbody tr select[title="Renk"]')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));

    expect(colors.length).toBeGreaterThanOrEqual(25);
    expect(new Set(colors).size, `${colors.length} öğretmen, tekrar eden renk var`).toBe(
      colors.length,
    );
  });

  test('paletteki her renk kartın iki yazısını da AA taşıyor', async ({ page }) => {
    await openWithSample(page);

    const samples = await page.locator('.pool-card').evaluateAll((cards) =>
      cards.map((el) => {
        const own = getComputedStyle(el);
        const sub = el.querySelector('.card-bottom');
        return {
          background: own.backgroundColor,
          color: own.color,
          subColor: sub === null ? own.color : getComputedStyle(sub).color,
        };
      }),
    );

    expect(samples.length).toBeGreaterThan(5);
    for (const s of samples) {
      expect(contrast(s.color, s.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(s.subColor, s.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('renkler birbirinden gerçekten ayırt ediliyor', async ({ page }) => {
    await openWithSample(page);
    const colors = await page
      .locator('.pool-card')
      .evaluateAll((cards) => cards.map((el) => getComputedStyle(el).backgroundColor));

    const unique = [...new Set(colors)];
    expect(unique.length).toBeGreaterThan(12); // the old palette's whole range

    let worst = Infinity;
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        worst = Math.min(worst, deltaE(unique[i]!, unique[j]!));
      }
    }
    expect(worst).toBeGreaterThanOrEqual(15);
  });

  test('her sınıfın da kendi rengi var ve satır başında görünüyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    const swatches = await page
      .locator('table.list tbody tr select[title="Renk"]')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(swatches.length).toBeGreaterThanOrEqual(15);
    expect(new Set(swatches).size, 'iki sınıf aynı renkte').toBe(swatches.length);

    // The class colour is a MARK, not the cell fill: it shows on the row head.
    await page.getByRole('button', { name: 'Program' }).click();
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    const dots = await page
      .locator('tbody .row-head .row-dot')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(dots.length).toBe(swatches.length);
    expect(new Set(dots).size).toBe(dots.length);
  });

  test('hücreler her iki görünümde de ÖĞRETMEN renginde kalıyor', async ({ page }) => {
    // The decision behind the class colour: it marks the row, it never repaints
    // the grid. A cell keeps saying which teacher is in it.
    await openWithSample(page);
    await dragAndDrop(page);

    const teacherViewCell = await page
      .locator('table.grid .card')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    const classViewCell = await page
      .locator('table.grid .card')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(classViewCell).toBe(teacherViewCell);
  });

  test('palet iki temada ve kâğıtta AYNI', async ({ page }) => {
    await openWithSample(page);
    const read = () =>
      page
        .locator('.pool-card')
        .evaluateAll((cards) => cards.map((el) => getComputedStyle(el).backgroundColor));

    const light = await read();
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await read()).toEqual(light);

    // Still dark on screen; the paper must show the very same pastels.
    await page.emulateMedia({ media: 'print' });
    expect(await read()).toEqual(light);
    await page.emulateMedia({ media: 'screen' });
  });
});

// ---------------------------------------------------------------------------
// 19. Icons, the lunch separator and the closed-hour mark
//
// Three things that only exist as pixels. jsdom has no layout and no computed
// font size, so none of this can be checked anywhere but here.

test.describe('19. Simgeler, ayraç ve çarpı', () => {
  test('iki görünüm simgesi birbirine benzemiyor', async ({ page }) => {
    await openWithSample(page);

    const shapes = async (name: string) =>
      page
        .getByRole('button', { name })
        .locator('svg *')
        .evaluateAll((list) =>
          list.map((el) =>
            [
              el.tagName,
              el.getAttribute('d') ?? '',
              el.getAttribute('cx') ?? '',
              el.getAttribute('cy') ?? '',
              el.getAttribute('r') ?? '',
            ].join(':'),
          ),
        );

    const teacher = await shapes('Öğretmen görünümü');
    const student = await shapes('Sınıf görünümü');

    expect(teacher.length).toBeGreaterThan(0);
    expect(student.length).toBeGreaterThan(0);
    // Not one variation on the other: no shape is shared between them.
    expect(teacher.filter((x) => student.includes(x))).toEqual([]);

    // Both are drawn big enough to be recognised at all.
    for (const name of ['Öğretmen görünümü', 'Sınıf görünümü']) {
      const box = (await page.getByRole('button', { name }).locator('svg').boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(16);
    }
  });

  test('seçili simge basılı, diğeri soluk', async ({ page }) => {
    await openWithSample(page);
    const teacher = page.getByRole('button', { name: 'Öğretmen görünümü' });
    const klass = page.getByRole('button', { name: 'Sınıf görünümü' });

    await expect(teacher).toHaveAttribute('aria-pressed', 'true');
    await expect(klass).toHaveAttribute('aria-pressed', 'false');

    const dim = async (l: typeof teacher) => Number(await l.evaluate((el) => getComputedStyle(el).opacity));
    expect(await dim(teacher)).toBeGreaterThan(await dim(klass));
  });

  test('öğle arası ayracı hücreden belirgin biçimde ince', async ({ page }) => {
    await openWithSample(page);

    const separator = (await page.locator('table.grid tbody .break-col').first().boundingBox())!;
    const cell = (await page.locator('table.grid td[data-day="0"]').first().boundingBox())!;

    expect(separator.width).toBeLessThanOrEqual(8);
    expect(separator.width).toBeLessThan(cell.width / 3);
    // Still a real column with its own edges, not a hairline that goes unseen.
    expect(separator.width).toBeGreaterThanOrEqual(4);
  });

  test('kapalı saatin çarpısı büyüdü ve hâlâ okunuyor', async ({ page }) => {
    await openWithSample(page);

    const mark = page.locator('table.grid td.unavailable').first();
    await expect(mark).toContainText('×');
    const style = await mark.evaluate((el) => {
      const own = getComputedStyle(el);
      return { size: parseFloat(own.fontSize), color: own.color, background: own.backgroundColor };
    });
    expect(style.size).toBeGreaterThanOrEqual(15);

    // Bigger must not mean fainter: the hatch sits on --closed.
    const t = await tokens(page, ['--closed']);
    expect(contrast(style.color, t['--closed']!)).toBeGreaterThanOrEqual(4.5);

    // The same mark on the availability grid grew too.
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    const availSize = await page
      .locator('table.availability td.closed')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(availSize).toBeGreaterThanOrEqual(15);
  });
});

test.describe('11. Görsel cila', () => {
  test('başlık altındaki sütunla aynı hizada', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul ve zil');

    // The bell preview centres its cells; its headings used to be left-aligned,
    // so the day names sat visibly off their own column.
    const head = page.locator('table.bell-preview thead th').nth(1);
    const cell = page.locator('table.bell-preview tbody tr').first().locator('td').first();
    const [a, b] = [await head.boundingBox(), await cell.boundingBox()];
    const centre = (box: { x: number; width: number }) => box.x + box.width / 2;
    expect(Math.abs(centre(a!) - centre(b!))).toBeLessThanOrEqual(1);
  });

  test('klavyeyle gezerken nerede olduğun belli', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');

    const focus = await page.evaluate(() => {
      const el = document.activeElement;
      if (el === null) return null;
      const s = getComputedStyle(el);
      return { tag: el.tagName, style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(focus).not.toBeNull();
    expect(focus!.tag).toBe('BUTTON');
    expect(focus!.style).not.toBe('none');
    expect(parseFloat(focus!.width)).toBeGreaterThan(0);
  });

  test('tehlikeli düğme beklemeden tehlikeli görünüyor', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Veri');
    const [danger, plain] = await Promise.all([
      page
        .getByRole('button', { name: 'Her şeyi sil' })
        .evaluate((el) => getComputedStyle(el).color),
      page.getByRole('button', { name: 'Dosyadan aç' }).evaluate((el) => getComputedStyle(el).color),
    ]);
    // Not identical to a plain button until the pointer is already on it
    expect(danger).not.toBe(plain);
    const bad = await tokens(page, ['--bad']);
    expect(danger).toBe(bad['--bad']);
  });
});
