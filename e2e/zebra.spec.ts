// Zebra: every list, in the order it is SEEN, without lowering contrast.
//
// The reader asked for rows one after another on slightly different grounds,
// the same in every list (TODO §0). The rule is CSS (`:nth-child` on the DOM),
// so what it can get wrong is which rows it counts: a row that is not a record
// (the bell preview's lunch row) or a second <tbody> that starts counting again
// (Branşlar's subjects that are not on the list). Both happened.

import { type Locator, type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { openSettings, openWithSample } from './helpers';

/** The ground a row is painted on: its own, or the panel's when it has none. */
const ground = (row: Locator) =>
  row.evaluate((el) => {
    for (let e: Element | null = el; e; e = e.parentElement) {
      const bg = getComputedStyle(e).backgroundColor;
      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    }
    return 'rgb(255, 255, 255)';
  });

async function grounds(rows: Locator): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < (await rows.count()); i++) out.push(await ground(rows.nth(i)));
  return out;
}

/** Two neighbours never share a ground, and every second row does. */
function expectAlternating(seq: string[], what: string) {
  expect(seq.length, `${what}: satır yok`).toBeGreaterThanOrEqual(3);
  expect(new Set(seq).size, `${what}: iki zemin`).toBe(2);
  for (let i = 1; i < seq.length; i++) {
    expect(seq[i], `${what}: ${i}. ve ${i + 1}. satır aynı zeminde`).not.toBe(seq[i - 1]);
  }
}

async function park(page: Page) {
  await page.mouse.move(1919, 1079);
}

test.describe('94. Zebra: her listede, görünen sırayla', () => {
  test('zil önizlemesinde öğle arası satırı sayılmıyor, ders satırları dönüşümlü', async ({
    page,
  }) => {
    await openWithSample(page);
    await openSettings(page, 'Zil ve günler');
    await park(page);
    const preview = page.locator('table.bell-preview');
    // The sample has two patterns with the lunch after the 5th and the 6th
    // lesson, so two lunch rows sit between lessons 5, 6 and 7.
    await expect(preview.locator('tbody tr.break-row')).toHaveCount(2);
    expectAlternating(
      await grounds(preview.locator('tbody tr:not(.break-row)')),
      'zil önizlemesinin ders satırları',
    );
  });
});
