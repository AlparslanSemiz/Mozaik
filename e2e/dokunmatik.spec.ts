// A finger, not a mouse (iPad). Two gestures that only a mouse could make:
// painting hours by dragging across Müsaitlik, and opening a card's menu,
// which was a right click and nothing else.
//
// Playwright moves a finger only by tapping (`page.touchscreen.tap`), so the
// strokes are dispatched as pointer events with `pointerType: 'touch'`, and
// dispatched the way a touch screen delivers them: every move and the lift go
// to the element the finger went DOWN on (implicit pointer capture). That is
// the whole bug in item 1 — no other cell hears `pointerenter` — and a mouse's
// stroke through `page.mouse` would pass without the fix. Runs in every
// engine; the one that matters is `npm run test:webkit`.

import { type Locator } from '@playwright/test';
import { expect, test } from './kapan';
import { dragAndDrop, openPerson, openSetup, openWithSample } from './helpers';

test.use({ hasTouch: true });

/** A finger down on `from`, held still or drawn through `through`, then lifted. */
async function stroke(from: Locator, through: Locator[], holdMs = 0) {
  const points = [];
  for (const l of [from, ...through]) {
    const box = (await l.boundingBox())!;
    points.push({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  }
  await from.evaluate(
    async (el, { points, holdMs }) => {
      const at = (type: string, p: { x: number; y: number }) =>
        el.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            pointerId: 7,
            pointerType: 'touch',
            isPrimary: true,
            button: type === 'pointermove' ? -1 : 0,
            buttons: type === 'pointerup' ? 0 : 1,
            clientX: p.x,
            clientY: p.y,
          }),
        );
      const frame = () => new Promise((r) => requestAnimationFrame(r));
      at('pointerdown', points[0]!);
      await frame();
      for (const p of points.slice(1)) {
        at('pointermove', p);
        await frame();
      }
      if (holdMs > 0) await new Promise((r) => setTimeout(r, holdMs));
      at('pointerup', points[points.length - 1]!);
    },
    { points, holdMs },
  );
}

test.describe('Dokunmatik: Müsaitlik parmakla boyanıyor', () => {
  test('parmak dört hücreden geçince DÖRDÜ de kapanıyor', async ({ page }) => {
    await openWithSample(page);
    // The grid is on the person's page since K1 (2026-11-16).
    await openSetup(page, 'Öğretmenler');
    const sheet = await openPerson(page, 0);
    await sheet.getByRole('button', { name: 'Bütün haftayı aç' }).click();
    const row = sheet.locator('table.availability tbody tr').first();
    await expect(row.locator('td.closed')).toHaveCount(0);

    const cell = (s: number) => row.locator('td').nth(s).locator('button');
    await stroke(cell(0), [cell(1), cell(2), cell(3)]);

    await expect(row.locator('td.closed')).toHaveCount(4);
    await expect(sheet.locator('table.availability td.closed')).toHaveCount(4);
  });
});

test.describe('Dokunmatik: basılı tutmak kartın menüsünü açıyor', () => {
  test('ızgaradaki karta basılı tutunca menü açılıyor, "Havuza kaldır" kaldırıyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    const cards = page.locator('table.grid .card');
    const before = await cards.count();
    expect(before).toBeGreaterThan(0);

    await stroke(cards.first(), [], 700);
    const menu = page.locator('.menu');
    await expect(menu.getByRole('menuitem', { name: 'Havuza kaldır' })).toBeVisible();
    // The press started a drag; the menu ended it, and nothing moved.
    await expect(page.locator('.ghost')).toHaveCount(0);
    await expect(cards).toHaveCount(before);

    await menu.getByRole('menuitem', { name: 'Havuza kaldır' }).click();
    await expect(cards).toHaveCount(0);
  });

  test('parmak kayınca menü açılmıyor: o bir sürükleme', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    const card = page.locator('table.grid td:has(.card)').first();
    const next = card.locator('xpath=following-sibling::td[1]');

    await stroke(card.locator('.card'), [next], 700);
    await expect(page.locator('.menu')).toHaveCount(0);
  });

  // Radix's own 700 ms press would open the menu here, on no card, for
  // whatever card was asked for last (pitfall 176).
  test('BOŞ hücrede basılı tutmak hiçbir menü açmıyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    const empty = page.locator('table.grid tbody td[data-day]:not(:has(.card))').first();

    await stroke(empty, [], 1000);
    await expect(page.locator('.menu')).toHaveCount(0);
  });

  test('havuzdaki karta basılı tutunca da aynı menü', async ({ page }) => {
    await openWithSample(page);
    const card = page.locator('.pool-card:not([aria-hidden="true"])').first();

    await stroke(card, [], 700);
    await expect(
      page.locator('.menu').getByRole('menuitem', { name: 'Dersi düzenle' }),
    ).toBeVisible();
    await expect(page.locator('.ghost')).toHaveCount(0);
  });
});
