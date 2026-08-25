// 47. The grid as an instrument: the day band, the crosshair and the dock.
//
// All three are the B round's one deliberate risk, and all three are the kind
// of thing a suite passes over in silence — they change no text, no count and
// no attribute anybody was already asserting. So each is measured:
//
//   the band  must GROUP without ever reading as a state (its distance from
//             the paper has to stay far below the 14 that separates the
//             functional colours from each other)
//   the cross must light the row, the column and the two labels — and must
//             switch OFF during a drag, where the grid has its own three
//             colours and a fourth would say less
//   the dock  must not take back what "Sığdır" bought: the whole week in the
//             box, with nothing clipped

import { expect, test } from '@playwright/test';
import { openWithSample, startDrag, deltaE, tokens, chooseDensity } from './helpers';

test.describe('47. Izgara enstrümanı', () => {
  test('gün bandı grupluyor ama bir DURUM gibi okunmuyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    const grounds = await page.evaluate(() => {
      const plain = document.querySelector(
        'table.grid tbody td[data-day="0"]:not(.unavailable)',
      );
      const banded = document.querySelector('table.grid tbody td.band:not(.unavailable)');
      return {
        plain: plain === null ? '' : getComputedStyle(plain).backgroundColor,
        banded: banded === null ? '' : getComputedStyle(banded).backgroundColor,
        bandedCells: document.querySelectorAll('table.grid tbody td.band').length,
        bandedHeads: document.querySelectorAll('table.grid thead th.band').length,
      };
    });

    // Odd days really are banded, headings included — otherwise the band would
    // stop at the top of the table and read as a stripe rather than a day.
    expect(grounds.bandedCells).toBeGreaterThan(0);
    expect(grounds.bandedHeads).toBeGreaterThan(0);
    expect(grounds.banded).not.toBe(grounds.plain);

    const t = await tokens(page, ['--ok-bg', '--warn-bg', '--bad-bg']);
    const separation = deltaE(grounds.plain, grounds.banded);

    // Visible at all...
    expect(separation, `bant kâğıttan ayrılmıyor (ΔE ${separation.toFixed(2)})`).toBeGreaterThan(1);
    // ...but nowhere near loud enough to be mistaken for a state. The three
    // functional grounds are 14 apart from each other by contract; the band is
    // an order of magnitude quieter than that.
    expect(separation, `bant bir durum rengi kadar yüksek sesli (ΔE ${separation.toFixed(2)})`)
      .toBeLessThan(5);
    for (const key of ['--ok-bg', '--warn-bg', '--bad-bg'] as const) {
      expect(deltaE(grounds.banded, t[key]!)).toBeGreaterThan(10);
    }
  });

  test('imleç haçı satırı, sütunu ve iki başlığı birden aydınlatıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    const rows = await page.locator('table.grid tbody tr').count();
    const cell = page.locator('table.grid tbody tr').nth(6).locator('td[data-day]').nth(20);
    await cell.hover();

    // Every body cell of that column, plus its hour heading.
    await expect(page.locator('table.grid .col-hot')).toHaveCount(rows + 1);
    await expect(page.locator('table.grid thead .col-hot')).toHaveCount(1);

    // The lit heading is the RIGHT one: the cell and its heading have to sit in
    // the same column, or the crosshair is pointing somewhere else.
    const aligned = await page.evaluate(() => {
      const hot = document.querySelector('table.grid thead .col-hot');
      const lit = document.querySelector('table.grid tbody td.col-hot');
      if (hot === null || lit === null) return null;
      return Math.abs(hot.getBoundingClientRect().left - lit.getBoundingClientRect().left);
    });
    expect(aligned).not.toBeNull();
    expect(aligned!).toBeLessThanOrEqual(1);

    // The teacher's own name lights with the row — that is the pair the
    // crosshair exists to connect.
    const head = await page
      .locator('table.grid tbody tr')
      .nth(6)
      .locator('.row-head')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const t = await tokens(page, ['--accent-bg']);
    expect(deltaE(head, t['--accent-bg']!)).toBeLessThan(2);
  });

  test('kapalı saat haçın altında kaybolmuyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    // A closed hour keeps its hatch even when the crosshair runs over it: the
    // highlight says WHERE you are, never why a cell cannot be used.
    const closed = page.locator('table.grid td.unavailable').first();
    await expect(closed).toBeVisible();
    const before = await closed.evaluate((el) => getComputedStyle(el).backgroundImage);
    await closed.hover();
    await expect(page.locator('table.grid .col-hot').first()).toBeAttached();
    const after = await closed.evaluate((el) => getComputedStyle(el).backgroundImage);

    expect(before).toContain('gradient');
    expect(after).toBe(before);
  });

  test('sürükleme başlayınca haç sönüyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    await page.locator('table.grid tbody tr').nth(3).locator('td[data-day]').nth(4).hover();
    await expect(page.locator('table.grid .col-hot').first()).toBeAttached();

    await startDrag(page);
    // The grid speaks in green/yellow/red from here on; a fourth highlight
    // competing with them would say less, not more.
    await expect(page.locator('table.grid .col-hot')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test("Sığdır'a geçmek havuzu kapatıyor — ikisi aynı anda sığmıyor", async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    // A FULL grid, or this measures nothing: with an empty week the cards set
    // no floor at all and both configurations "fit" (pitfall 33, and the first
    // measurement taken during this rework fell into exactly that hole).
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('table.grid .card').first()).toBeVisible();

    const dock = page.getByRole('button', { name: 'Havuz' });
    await expect(dock).toHaveAttribute('aria-expanded', 'true');

    const scroll = () =>
      page.evaluate(() => {
        const wrap = document.querySelector('.grid-wrap')!;
        return {
          over: Math.round(wrap.scrollWidth - wrap.clientWidth),
          clipped: [...document.querySelectorAll('table.grid .card-top')].filter(
            (el) => el.scrollWidth > el.clientWidth + 0.5,
          ).length,
        };
      });

    await chooseDensity(page, 'Sığdır');

    // Choosing the mode closed the dock, because the two do not fit together.
    await expect(dock).toHaveAttribute('aria-expanded', 'false');
    const fitted = await scroll();
    expect(fitted.over, `havuz kapalıyken ${fitted.over}px yatay kaydırma kaldı`).toBe(0);
    expect(fitted.clipped, `${fitted.clipped} kartın yazısı kırpıldı`).toBe(0);

    // Opening it again is allowed and costs exactly what it costs — the reader
    // chooses. What must NOT happen is a card losing its text to make room.
    await dock.click();
    await expect(dock).toHaveAttribute('aria-expanded', 'true');
    // The dock slides open over --dur; reading the grid's box in the same tick
    // measures it mid-slide.
    await page.waitForFunction(
      () => document.querySelector('.pool')!.getBoundingClientRect().width > 200,
    );
    const paid = await scroll();
    expect(paid.over).toBeGreaterThan(0);
    expect(paid.clipped, 'havuz açılınca kart yazısı kırpıldı').toBe(0);

    await chooseDensity(page, 'Rahat');
  });

  test('çekmece tercihi yenilemede duruyor ve programın kendisine girmiyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    await page.getByRole('button', { name: 'Havuz' }).click();
    await expect(page.getByRole('button', { name: 'Havuz' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    await page.reload();
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Havuz' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    // A machine setting, never timetable data: the saved plan must not carry it.
    const saved = await page.evaluate(() => localStorage.getItem('ders-programi'));
    expect(saved).not.toBeNull();
    expect(saved!.includes('havuz')).toBe(false);
    expect(await page.evaluate(() => localStorage.getItem('ders-programi-havuz'))).toBe('kapali');

    await page.getByRole('button', { name: 'Havuz' }).click();
  });
});
