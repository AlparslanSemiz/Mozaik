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
//   the dock  is a machine setting and must stay out of the saved plan
//
// The dock's LAYOUT assertion ("Sığdır closes it, the two do not fit") went on
// 2026-08-26. It had already been disproved by measurement (pitfall 42: once
// .grid-wrap became a container the overflow was 0px with the dock open), and
// layout measurements went with the rest of the layout contract.

import { expect, test } from '@playwright/test';
import { openWithSample, startDrag, deltaE, tokens } from './helpers';

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
    // ...and far from all three functional grounds. THIS is the contract, not
    // the band's own strength: how loud a grouping ground may be is taste and
    // no longer asserted, but it must never be mistaken for "droppable",
    // "warning" or "blocked".
    for (const key of ['--ok-bg', '--warn-bg', '--bad-bg'] as const) {
      expect(
        deltaE(grounds.banded, t[key]!),
        `bant ${key} ile karışıyor`,
      ).toBeGreaterThan(10);
    }

    // A CEILING, added 2026-08-27 and red the day before it was written.
    //
    // "far from the functional grounds" was the whole contract, and the dark
    // theme passed it while being twice as loud as the light one — dE(band,
    // paper) was 4.67 against light's 2.45. That is the pitfall-40 family from
    // the other side: not a new ground burying a state, but a GROUPING drawn
    // hard enough to be read as one. Both themes sit at 2.45 now, and 3.5 is
    // where a reasonable person would start calling it a stripe.
    expect(
      separation,
      `gün bandı bir DURUM gibi okunacak kadar güçlü (ΔE ${separation.toFixed(2)})`,
    ).toBeLessThan(3.5);
  });

  test('gün bandı İKİ TEMADA da aynı yükte', async ({ page }) => {
    // The measurement above runs in whatever theme the page opened in, so on
    // its own it can only ever police one of the two. This is the pair.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    const measure = async () =>
      page.evaluate(() => {
        const plain = document.querySelector(
          'table.grid tbody td[data-day="0"]:not(.unavailable)',
        )!;
        const banded = document.querySelector('table.grid tbody td.band:not(.unavailable)')!;
        return {
          plain: getComputedStyle(plain).backgroundColor,
          banded: getComputedStyle(banded).backgroundColor,
        };
      });

    const light = await measure();
    await page.getByRole('button', { name: 'Koyu tema', exact: true }).click();
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
    const dark = await measure();

    const a = deltaE(light.plain, light.banded);
    const b = deltaE(dark.plain, dark.banded);
    expect(
      Math.abs(a - b),
      `açık ΔE ${a.toFixed(2)}, koyu ΔE ${b.toFixed(2)} — aynı gruplama iki güçte çiziliyor`,
    ).toBeLessThan(0.75);
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

  test('çekmece tercihi yenilemede duruyor ve programın kendisine girmiyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    await page.getByRole('button', { name: 'Havuz', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Havuz', exact: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    await page.reload();
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Havuz', exact: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    // A machine setting, never timetable data: the saved plan must not carry it.
    const saved = await page.evaluate(() => localStorage.getItem('ders-programi'));
    expect(saved).not.toBeNull();
    expect(saved!.includes('havuz')).toBe(false);
    expect(await page.evaluate(() => localStorage.getItem('ders-programi-havuz'))).toBe('kapali');

    await page.getByRole('button', { name: 'Havuz', exact: true }).click();
  });
});

// THE ROW HEAD AND THE DAY EDGE — two asks from 2026-08-26, both about a grid
// 78 columns wide: "sol taraftaki öğretmen ya da sınıf tarafının genişliği
// biraz daha kısaltılabilir" and "günlerin arasındaki boşluk veya fark biraz
// daha belli olmalı".
//
// Both are the kind of change a suite passes over in silence — no text, no
// count, no attribute moves — so both get a number.
test.describe('68. Satır başı ve gün sınırı', () => {
  test('satır başı, tuttuğu en uzun şeyden fazlasını almıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    const m = await page.locator('table.grid tbody th.row-head').first().evaluate((th) => {
      // What the column would have to be for the longest built-in subject —
      // the widest thing this cell ever holds, since the line above it is a
      // short form. Asked of the browser, not guessed (pitfall 34).
      const probe = th.cloneNode(true) as HTMLElement;
      probe.style.cssText = 'position:absolute;visibility:hidden;width:max-content;min-width:0';
      const sub = probe.querySelector('.secondary') as HTMLElement;
      sub.textContent = 'Sosyal Bilgiler';
      sub.style.overflow = 'visible';
      sub.style.textOverflow = 'clip';
      th.parentElement!.appendChild(probe);
      const need = probe.getBoundingClientRect().width;
      probe.remove();
      return { have: th.getBoundingClientRect().width, need };
    });

    // Wide enough for the longest subject...
    expect(m.have, `satır başı ${Math.round(m.have)} < gereken ${Math.round(m.need)}`)
      .toBeGreaterThanOrEqual(m.need);
    // ...and not half again as wide, which is what 8.25rem was. Every pixel
    // here is a pixel the 72 lesson columns do not get.
    expect(m.have, `satır başı ${Math.round(m.have)}px, gereken ${Math.round(m.need)}px`)
      .toBeLessThan(m.need * 1.2);
  });

  test('gün sınırı ızgaradaki EN KALIN çizgi', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    const w = await page.evaluate(() => {
      const px = (el: Element, side: 'Left' | 'Right' | 'Bottom') =>
        Number.parseFloat(getComputedStyle(el)[`border${side}Width` as 'borderLeftWidth']);
      const dayFirst = document.querySelector('table.grid tbody td.day-first')!;
      const plain = document.querySelector('table.grid tbody td[data-day]:not(.day-first)')!;
      return {
        day: px(dayFirst, 'Left'),
        hour: px(plain, 'Right'),
        row: px(plain, 'Bottom'),
      };
    });

    expect(w.day, `gün ${w.day}px, saat ${w.hour}px`).toBeGreaterThan(w.hour);
    expect(w.day, `gün ${w.day}px, satır ${w.row}px`).toBeGreaterThan(w.row);
    expect(w.day).toBeGreaterThanOrEqual(3);
  });

  test('gün sınırının rengi iki temada da zeminden UZAKLAŞIYOR', async ({ page }) => {
    // A boundary is strong when it moves away from the paper, which means the
    // light theme wants a darker line and the dark theme a lighter one. One
    // hard-coded grey cannot do both, which is why it has its own token.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      const seen = await tokens(page, ['--day-edge', '--line-dark', '--paper']);
      const near = deltaE(seen['--line-dark']!, seen['--paper']!);
      const far = deltaE(seen['--day-edge']!, seen['--paper']!);
      expect(far, `${theme}: gün sınırı ΔE ${far.toFixed(1)}, --line-dark ΔE ${near.toFixed(1)}`)
        .toBeGreaterThan(near);
    }
  });
});
