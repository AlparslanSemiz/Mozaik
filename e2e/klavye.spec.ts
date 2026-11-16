// 95. The Program grid and the Müsaitlik sheet from the keyboard alone
// (DENETIM KS8, KS9, KS19; SD5's "havuz kartına klavye yolu").
//
// Everything here is done with keys only, the way somebody who cannot use a
// mouse would do it: a pool card is placed, a placed card is moved, a move is
// cancelled, a card is removed and focus stays on the grid, an hour of
// availability is closed. The tab-stop count is what KS8 was about: 414 stops
// on a full grid, one per card and one per pin.

import { expect, test } from './kapan';
import { dragAndDrop, dragAndDropLoose, openWithSample, openPerson, openSetup } from './helpers';

const grid = 'table.grid';

/** What has focus, in the words a screen reader would use. */
async function focused(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return {
      tag: el?.tagName ?? '',
      inGrid: el?.closest('.grid-wrap') !== null,
      label: el?.getAttribute('aria-label') ?? '',
      day: el?.closest('td')?.dataset.day ?? '',
      hour: el?.closest('td')?.dataset.hour ?? '',
    };
  });
}

test.describe('95. Klavyeyle ızgara', () => {
  test('havuz kartı klavyeyle alınıp ızgaraya konuyor', async ({ page }) => {
    await openWithSample(page);
    const cards = page.locator(`${grid} .card`);
    await expect(cards).toHaveCount(0);

    const pool = page.locator('.pool-card[tabindex]').first();
    await pool.focus();
    await page.keyboard.press('Enter');
    // Picked up: the bar says what and how, and the target is painted.
    const bar = page.locator('.reason-bar');
    await expect(bar).toContainText('alındı');
    await expect(bar).toContainText('Enter bırakır');
    await expect(page.locator(`${grid} td.drop-ok`)).toHaveCount(1);
    await expect(page.locator(`${grid} tr.target-row`)).toHaveCount(1);

    await page.keyboard.press('ArrowRight');
    await expect(bar).toContainText('2. saat');
    await page.keyboard.press('Enter');

    await expect(cards).toHaveCount(1);
    await expect(page.locator('.toast').last()).toContainText('yerleşti');
    await expect(page.locator(`${grid} td.drop-ok`)).toHaveCount(0);
    // Focus stays on the tray, where the next card of the pile waits.
    await expect(page.locator('.pool-card[tabindex]').first()).toBeFocused();
  });

  test('ızgaradaki kart T ile alınıp oklarla taşınıyor', async ({ page }) => {
    await openWithSample(page);
    const { day, hour } = await dragAndDropLoose(page);
    const card = page.locator(`${grid} .card`).first();
    await card.focus();

    await page.keyboard.press('t');
    await expect(page.locator('.reason-bar')).toContainText('alındı');
    // The next hour that takes it, wherever that is.
    await page.keyboard.press('Control+ArrowRight');
    await expect(page.locator(`${grid} td.drop-ok`)).toHaveCount(1);
    await page.keyboard.press('Enter');

    const moved = page.locator(`${grid} td:has(.card)`);
    await expect(moved).toHaveCount(1);
    const at = await moved.evaluate((td) => `${td.dataset.day}|${td.dataset.hour}`);
    expect(at).not.toBe(`${day}|${hour}`);
    // The pool is untouched: a move is not a remove.
    await expect(page.locator('.toast').last()).toContainText('yerleşti');
    // Focus followed the card.
    await expect(page.locator(`${grid} .card`).first()).toBeFocused();
  });

  test('menüdeki "Taşı" aynı taşımayı başlatıyor, Esc vazgeçip odağı karta veriyor', async ({
    page,
  }) => {
    await openWithSample(page);
    const { day, hour } = await dragAndDropLoose(page);
    const card = page.locator(`${grid} .card`).first();
    await card.focus();

    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    // The pin leads since 2026-11-16; "Taşı" is the second item.
    await expect(menu.getByRole('menuitem').nth(1)).toHaveText(/^Taşı/);
    await menu.getByRole('menuitem').nth(1).focus();
    await page.keyboard.press('Enter');
    await expect(menu).toHaveCount(0);
    await expect(page.locator('.reason-bar')).toContainText('alındı');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');

    await expect(page.locator('.toast').last()).toContainText('vazgeçildi');
    await expect(page.locator(`${grid} td.drop-ok, ${grid} td.can-ok`)).toHaveCount(0);
    const still = page.locator(`${grid} td:has(.card)`);
    expect(await still.evaluate((td) => `${td.dataset.day}|${td.dataset.hour}`)).toBe(
      `${day}|${hour}`,
    );
    await expect(page.locator(`${grid} .card`).first()).toBeFocused();
  });

  test('ızgara tek Tab durağı; oklar hücreden hücreye gidiyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const stops = await page.evaluate(
      () =>
        [...document.querySelectorAll('.grid-wrap, .grid-wrap *')].filter(
          (el) =>
            (el as HTMLElement).tabIndex >= 0 &&
            !(el as HTMLButtonElement).disabled &&
            el.getClientRects().length > 0,
        ).length,
    );
    expect(stops).toBe(1);

    // Tab lands on the first cell; arrows walk; Tab leaves.
    await page.locator('.grid-wrap').focus();
    const first = await focused(page);
    expect(first.inGrid).toBe(true);
    expect(first.label).toMatch(/1\. saat/);
    await page.keyboard.press('ArrowRight');
    expect((await focused(page)).label).toMatch(/2\. saat/);
    await page.keyboard.press('ArrowDown');
    const down = await focused(page);
    expect(down.inGrid).toBe(true);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    // Before the first hour is the row's own name.
    expect((await focused(page)).tag).toBe('BUTTON');
    await page.keyboard.press('Tab');
    expect((await focused(page)).inGrid).toBe(false);
    // ...and back in, to where it was.
    await page.keyboard.press('Shift+Tab');
    expect((await focused(page)).inGrid).toBe(true);
  });

  test('Delete sonrası odak aynı hücrede kalıyor ve söyleniyor', async ({ page }) => {
    await openWithSample(page);
    const { day, hour } = await dragAndDropLoose(page);
    await page.locator(`${grid} .card`).first().focus();
    await page.keyboard.press('Delete');

    await expect(page.locator(`${grid} .card`)).toHaveCount(0);
    await expect(page.locator('.toast').last()).toContainText('havuza kaldırıldı');
    await expect
      .poll(async () => {
        const f = await focused(page);
        return f.inGrid ? `${f.day}|${f.hour}` : 'body';
      })
      .toBe(`${day}|${hour}`);
    expect((await focused(page)).label).toMatch(/boş/);
  });

  test('P odaklı kartı sabitliyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDropLoose(page);
    const card = page.locator(`${grid} .card`).first();
    await card.focus();
    await page.keyboard.press('p');
    await expect(page.locator(`${grid} .card-pin`).first()).toHaveAttribute('aria-pressed', 'true');
    await expect(card).toHaveAttribute('aria-label', /sabitlenmiş/);
  });
});

test.describe('96. Klavyeyle müsaitlik', () => {
  test('oklar, Space ve başlık düğmeleri', async ({ page }) => {
    await openWithSample(page);
    // The grid is on the person's page since K1 (2026-11-16).
    await openSetup(page, 'Öğretmenler');
    const page2 = await openPerson(page, 0);
    await page2.getByRole('button', { name: 'Bütün haftayı aç' }).click();
    const sheet = page2.locator('table.availability');
    const closed = sheet.locator('td.closed');
    await expect(closed).toHaveCount(0);

    // One Tab stop for the grid: the box hands focus to the first hour.
    await page2.locator('.scroll-x:has(table.availability)').focus();
    const first = sheet.locator('tbody td button').first();
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute('aria-pressed', 'false');

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    const second = sheet.locator('tbody tr').first().locator('td button').nth(1);
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await expect(second).toHaveAttribute('aria-label', /2\. saat, kapalı/);
    await expect(closed).toHaveCount(1);

    // Up to the hour's heading: Enter closes that hour across the week.
    await page.keyboard.press('ArrowUp');
    await expect(page.locator(':focus')).toHaveAttribute('title', /Haftanın bu saatini/);
    await page.keyboard.press('Enter');
    await expect(closed).toHaveCount(6);

    // Ctrl+Z still takes a keyboard toggle back.
    await page.keyboard.press('Control+z');
    await expect(closed).toHaveCount(1);
  });
});
