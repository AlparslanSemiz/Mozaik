// Zebra: every list, in the order it is SEEN, without lowering contrast.
//
// The reader asked for rows one after another on slightly different grounds,
// the same in every list (TODO §0). The rule is CSS (`:nth-child` on the DOM),
// so what it can get wrong is which rows it counts: a row that is not a record
// (the bell preview's lunch row) or a second <tbody> that starts counting again
// (Branşlar's subjects that are not on the list). Both happened.

import { type Locator, type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { loadWorld, openSettings, openSetup, openWithSample, savedText, tokens } from './helpers';

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

  test('Branşlar: listede olmayan branşların gövdesi yeni bir grup olarak başlıyor', async ({
    page,
  }) => {
    // Two subjects leave the list while teachers still hold them: 19 listed
    // rows (odd, so the last is paper) and two "listede değil" rows in their
    // own <tbody>, whose count starts again on paper. Paper followed paper.
    await openWithSample(page);
    const state = JSON.parse(await savedText(page)) as { settings: { subjects: string[] } };
    state.settings.subjects = state.settings.subjects.filter(
      (x) => x !== 'Felsefe' && x !== 'Din Kültürü',
    );
    await loadWorld(page, state, 'Okul');
    await openSetup(page, 'Branşlar');
    await park(page);

    const bodies = page.locator('.cols > div table.list > tbody');
    await expect(bodies).toHaveCount(2);
    expectAlternating(await grounds(bodies.nth(0).locator('tr')), 'listedeki branşlar');
    // Where the groups meet, a rule says a new group starts rather than two
    // rows silently sharing a ground.
    const first = bodies.nth(1).locator('tr').first();
    const edge = await first
      .locator('td')
      .first()
      .evaluate((td) => {
        const s = getComputedStyle(td);
        return {
          width: parseFloat(s.borderTopWidth),
          style: s.borderTopStyle,
          color: s.borderTopColor,
        };
      });
    const t = await tokens(page, ['--line-dark']);
    expect(edge.style, 'ikinci gövdenin üst çizgisi').toBe('solid');
    expect(edge.width).toBeGreaterThanOrEqual(2);
    expect(edge.color).toBe(t['--line-dark']);
  });
});
