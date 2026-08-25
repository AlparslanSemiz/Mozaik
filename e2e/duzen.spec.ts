// Layout. Nothing here can be checked in jsdom: it has no box model, so "does
// the page overflow", "is the rail really 92px" and "is the second column doing
// anything" are all unanswerable there.
//
// The complaint this file exists for: "the right-hand side of every section is
// empty". That is now measured, section by section, rather than looked at.

import { expect, test, type Page } from '@playwright/test';
import { open, openSettings, openSetup, openWithSample } from './helpers';

const TABS = ['Kurulum', 'Müsaitlik', 'Program', 'Kontrol', 'Yazdır', 'Ayarlar'] as const;

async function overflow(page: Page) {
  return page.evaluate(() => ({
    vertical: document.body.scrollHeight - document.body.clientHeight,
    horizontal: document.body.scrollWidth - document.body.clientWidth,
  }));
}

test.describe('23. Kenar çubuğu', () => {
  test('altı sekme solda dikey duruyor', async ({ page }) => {
    await openWithSample(page);
    const rail = page.locator('nav.sidebar');
    await expect(rail).toBeVisible();
    await expect(rail.locator('.tab')).toHaveCount(6);

    const box = (await rail.boundingBox())!;
    expect(box.x).toBe(0);
    expect(box.width).toBeGreaterThan(70);
    expect(box.width).toBeLessThan(110);

    // Vertical, not a row: each tab starts below the previous one.
    const first = (await rail.locator('.tab').first().boundingBox())!;
    const second = (await rail.locator('.tab').nth(1).boundingBox())!;
    expect(second.y).toBeGreaterThan(first.y + first.height - 2);
    expect(Math.abs(second.x - first.x)).toBeLessThan(2);
  });

  test('daraltılınca etiketler gizleniyor ama isimle bulunabiliyor', async ({ page }) => {
    await openWithSample(page);
    const rail = page.locator('nav.sidebar');
    const wide = (await rail.boundingBox())!.width;

    await page.getByRole('button', { name: 'Kenar çubuğunu daralt' }).click();
    const narrow = (await rail.boundingBox())!.width;
    expect(narrow).toBeLessThan(wide - 25);
    await expect(rail.locator('.tab-label').first()).toBeHidden();

    // The accessible name survives, so a screen reader and a test can still
    // find the section by what it is called.
    await page.getByRole('button', { name: 'Kontrol' }).click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Kontrol',
    );
  });

  test('daraltma tercihi sayfa yenilenince duruyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kenar çubuğunu daralt' }).click();
    const narrow = (await page.locator('nav.sidebar').boundingBox())!.width;

    await page.reload();
    expect((await page.locator('nav.sidebar').boundingBox())!.width).toBe(narrow);

    // ...and the value lives outside State, like the theme.
    expect(await page.evaluate(() => localStorage.getItem('ders-programi-kenar'))).toBe('dar');
    const saved = await page.evaluate(() => localStorage.getItem('ders-programi'));
    expect(saved).not.toContain('kenar');
  });

  test('seçili sekme belli, tıklayınca değişiyor', async ({ page }) => {
    await openWithSample(page);
    for (const name of TABS) {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute('aria-label', name);
      await expect(page.locator('.tab[aria-current="true"]')).toHaveCount(1);
    }
  });

  test('altı simge birbirine benzemiyor', async ({ page }) => {
    await open(page);
    const paths = await page.locator('nav.sidebar .tab svg').evaluateAll((nodes) =>
      nodes.map((n) => n.innerHTML.replace(/\s+/g, '')),
    );
    expect(paths).toHaveLength(6);
    expect(new Set(paths).size).toBe(6);
  });
});

test.describe('24. Ekranın tamamı kullanılıyor', () => {
  test('hiçbir sekmede dikey ya da yatay taşma yok', async ({ page }) => {
    await openWithSample(page);
    for (const name of TABS) {
      await page.getByRole('button', { name, exact: true }).click();
      const o = await overflow(page);
      expect(o.vertical, `${name} dikey taşıyor`).toBeLessThanOrEqual(1);
      expect(o.horizontal, `${name} yatay taşıyor`).toBeLessThanOrEqual(1);
    }
  });

  test('içerik ekranın sağına kadar uzanıyor', async ({ page }) => {
    await openWithSample(page);
    const width = page.viewportSize()!.width;

    for (const name of TABS) {
      await page.getByRole('button', { name, exact: true }).click();
      const main = (await page.locator('main.main').boundingBox())!;
      // The rail takes ~92px; everything to the right of it belongs to the tab.
      expect(main.x + main.width, `${name} sağa kadar gelmiyor`).toBeGreaterThan(width - 4);
    }
  });

  test('ikinci sütun gerçekten dolu — Kurulum, Müsaitlik, Ayarlar, Yazdır', async ({ page }) => {
    await openWithSample(page);
    const width = page.viewportSize()!.width;

    const rightHalfHasContent = async () => {
      const cols = page.locator('.cols').first();
      await expect(cols).toBeVisible();
      const side = cols.locator('> :nth-child(2)');
      const box = (await side.boundingBox())!;
      // Starts past the middle of the screen and is wide enough to read.
      expect(box.x).toBeGreaterThan(width / 2 - 100);
      expect(box.width).toBeGreaterThan(240);
      expect(box.height).toBeGreaterThan(60);
      expect((await side.textContent())?.trim().length ?? 0).toBeGreaterThan(20);
    };

    await page.getByRole('button', { name: 'Kurulum' }).click();
    await rightHalfHasContent();

    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await rightHalfHasContent();

    await openSettings(page, 'Okul');
    await rightHalfHasContent();

    await page.getByRole('button', { name: 'Yazdır' }).click();
    await rightHalfHasContent();
  });

  test('müsaitlik ızgarası sütununu dolduruyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();

    const table = (await page.locator('table.availability').boundingBox())!;
    // It used to be 13 x 46px = ~620px whatever the screen was.
    expect(table.width).toBeGreaterThan(700);

    // The drag-paint target never shrinks below the size it was measured at.
    // 34px made a ~67px-wide cell a 2:1 slab and ended the screen at 238px.
    const cell = (await page.locator('table.availability tbody td').first().boundingBox())!;
    expect(cell.width).toBeGreaterThanOrEqual(46);
    expect(Math.round(cell.height)).toBe(48);
  });

  test('Kontrol iki sütuna akıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kontrol' }).click();

    const panels = page.locator('.panel-grid > .panel');
    expect(await panels.count()).toBeGreaterThanOrEqual(2);
    const first = (await panels.nth(0).boundingBox())!;
    const second = (await panels.nth(1).boundingBox())!;
    expect(second.x).toBeGreaterThan(first.x + first.width - 4); // side by side
  });

  test('kurulum tablosundaki metin kutusu hücresini dolduruyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    await page.getByPlaceholder('Derslik adı, örn. A').fill('A');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    const cell = page.locator('table.list tbody td').first();
    const box = (await cell.boundingBox())!;
    const input = (await cell.locator('input').boundingBox())!;
    // The browser default is ~170px whatever the cell is; it now follows it.
    expect(input.width).toBeGreaterThan(box.width - 20);
  });

  test('ızgara üst şeritten kurtulunca daha çok satır gösteriyor', async ({ page }) => {
    await openWithSample(page);
    const visibleRows = await page.evaluate(() => {
      const wrap = document.querySelector('.grid-wrap')!;
      const box = wrap.getBoundingClientRect();
      return [...document.querySelectorAll('table.grid tbody tr')].filter((tr) => {
        const r = tr.getBoundingClientRect();
        return r.top >= box.top && r.bottom <= box.bottom;
      }).length;
    });
    // The floor is now the WHOLE list, and that is the point of moving the pool
    // from a band across the bottom to a dock down the right: it used to cost
    // the grid 215px of a 1080px screen, i.e. six of the twenty-five teachers.
    // Measured after the move: 25 of 25, in both densities and with the dock
    // open or closed.
    //
    // The "drag target is off-screen" test in program.spec.ts used to lean on
    // those six missing rows. It does not any more — it forces the condition
    // itself and says so.
    expect(visibleRows).toBe(25);
  });
});

test.describe('25. Baskı düzeni yeni kabukla bozulmadı', () => {
  test('kenar çubuğu ve üst çubuk basılmıyor, iki sütun tek sütuna iniyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('nav.sidebar')).toBeHidden();
    await expect(page.locator('header.topbar')).toBeHidden();
    await expect(page.locator('.panel.no-print')).toBeHidden();

    const display = await page.locator('.cols').evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('block');

    const wide = await page.evaluate(
      () => document.body.scrollWidth - document.body.clientWidth,
    );
    expect(wide).toBeLessThanOrEqual(1);
    await page.emulateMedia({ media: 'screen' });
  });
});
