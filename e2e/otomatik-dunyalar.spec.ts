// Automatic timetabling across many shapes of school, in the real browser.
//
// e2e/otomatik.spec.ts asks whether the BUTTON works, and asks it once, on the
// sample data. This file asks whether the ANSWER is right, and asks it of every
// world in src/worlds.ts: a room bottleneck, nothing but blocks, a single day,
// a week full of holes, a greedy first choice that turns out to be wrong.
//
// The audit is the point. `illegalBlocks` is imported from src/, so what judges
// the built page's own localStorage is the very same blocker() that judges a
// dragged card — and src/worlds.test.ts proves that auditor is not a rubber
// stamp by feeding it a knowingly illegal grid.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { hoursOf, illegalBlocks, SMALL_WORLDS } from '../src/worlds';
import { activePlacements } from '../src/programs';
import { loadWorld, savedState, settledText } from './helpers';

/** Runs it and waits for the verdict line. */
async function autoFill(page: Page): Promise<string> {
  const before = await settledText(page);
  await page.getByRole('button', { name: /^Otomatik diz/ }).click();
  await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 25_000 });
  return before;
}

/** Worlds with lessons to place; `bos-dunya` has none and is checked apart. */
const WITH_LESSONS = SMALL_WORLDS.filter((w) => w.state.lessons.length > 0);

function key(x: { classId: string; day: number; hour: number }): string {
  return `${x.classId}|${x.day}|${x.hour}`;
}

test.describe('37. Otomatik dizme — dünya dünya', () => {
  for (const world of WITH_LESSONS) {
    test(`${world.name}: ${world.note}`, async ({ page }) => {
      await loadWorld(page, world.state);
      await expect(page.locator('table.grid')).toBeVisible();

      const before = await autoFill(page);
      const saved = await savedState(page, before);

      // 0. Guard against a vacuous audit: everything below would also "pass"
      //    against the grid as it was BEFORE the button was pressed, so the
      //    first thing checked is that the run really reached localStorage.
      expect(
        Object.keys(activePlacements(saved)).length,
        `${world.name}: kaydedilen durum dizimden önceki hâli`,
      ).toBeGreaterThan(Object.keys(activePlacements(world.state)).length);

      // 1. Every block the page saved is legal by the same blocker() the drag
      //    is judged by. A lesson left in an hour that was closed afterwards is
      //    kept ON PURPOSE (principle 6), so the baseline is what came in.
      const inherited = illegalBlocks(world.state).map(key);
      for (const bad of illegalBlocks(saved)) {
        expect(inherited, `${world.name}: ${bad.reason}`).toContain(key(bad));
      }

      // 2. Never more hours than were asked for.
      for (const lesson of world.state.lessons) {
        expect(hoursOf(saved, lesson.id)).toBeLessThanOrEqual(lesson.weeklyHours);
      }

      // 3. Nothing that was placed by hand moved.
      for (const [cell, lessonId] of Object.entries(activePlacements(world.state))) {
        expect(activePlacements(saved)[cell], `${world.name}: ${cell}`).toBe(lessonId);
      }

      // 4. The bar says something a person can act on.
      const bar = page.locator('.reason-bar');
      if (world.want.solved) {
        await expect(bar).toContainText('Program dizildi');
        await expect(page.locator('.pool-card')).toHaveCount(0);
        for (const lesson of world.state.lessons) {
          expect(hoursOf(saved, lesson.id), `${world.name}: ${lesson.id}`).toBe(
            lesson.weeklyHours,
          );
        }
      } else {
        await expect(bar).toContainText('yerleşemedi');
        await expect(bar).toContainText('Ayrıntı: Kontrol sekmesi.');
        expect(await page.locator('.pool-card').count()).toBeGreaterThan(0);
      }
    });
  }

  test('bos-dunya: ders yokken dizilecek bir şey teklif edilmiyor', async ({ page }) => {
    // The button lives in the tool strip now, so it is drawn even when the tab
    // itself is an empty screen. The requirement did not change with it: with
    // no lessons there is nothing to offer, and the button says (0) and is
    // disabled rather than starting a search that has nothing to search.
    const world = SMALL_WORLDS.find((w) => w.name === 'bos-dunya')!;
    await loadWorld(page, world.state);
    await expect(page.locator('.empty-screen')).toContainText('Henüz dizilecek ders yok');
    const auto = page.getByRole('button', { name: /^Otomatik diz/ });
    await expect(auto).toContainText('(0)');
    await expect(auto).toBeDisabled();
  });
});

test.describe('38. Otomatik dizme — dünyalar arası davranış', () => {
  test('geri sarmayı gerektiren dünyada da tam çözüm çıkıyor', async ({ page }) => {
    // 201 nodes for 9 blocks in Node; the point here is that the sliced rAF
    // driver reaches the same answer as the one-shot solve() does.
    const world = SMALL_WORLDS.find((w) => w.name === 'erken-saat-tuzagi')!;
    await loadWorld(page, world.state);
    const before = await autoFill(page);
    const saved = await savedState(page, before);

    expect(illegalBlocks(saved)).toEqual([]);
    expect(Object.keys(activePlacements(saved))).toHaveLength(12);
    await expect(page.locator('.pool-card')).toHaveCount(0);
  });

  test('bütün dizim TEK Ctrl+Z ile geri alınıyor', async ({ page }) => {
    const world = SMALL_WORLDS.find((w) => w.name === 'delik-desik')!;
    await loadWorld(page, world.state);
    await autoFill(page);

    const placed = await page.locator('table.grid .card').count();
    expect(placed).toBeGreaterThan(0);

    await page.keyboard.press('Control+z');
    await expect(page.locator('table.grid .card')).toHaveCount(0);
    await page.keyboard.press('Control+y');
    await expect(page.locator('table.grid .card')).toHaveCount(placed);
  });

  test('elle konmuş bloklar yerinde kalıyor, kapalı saatteki bile (ilke 6)', async ({ page }) => {
    const world = SMALL_WORLDS.find((w) => w.name === 'elle-konmus')!;
    await loadWorld(page, world.state);
    const before = await autoFill(page);
    const saved = await savedState(page, before);

    for (const [cell, lessonId] of Object.entries(activePlacements(world.state))) {
      expect(activePlacements(saved)[cell]).toBe(lessonId);
    }
    // The one in the closed hour is still there and Kontrol counts it.
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.panel', { hasText: 'Kapalı saatte' }).first()).toBeVisible();
  });

  test('Engelle seviyesindeki kural dizimden sonra hiç çiğnenmemiş', async ({ page }) => {
    for (const name of ['kurallar-engelle', 'kural-baskisi']) {
      const world = SMALL_WORLDS.find((w) => w.name === name)!;
      await loadWorld(page, world.state);
      await autoFill(page);
      await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
      await expect(page.locator('.badge', { hasText: 'Kural dışı' })).toHaveCount(0);
    }
  });

  test('tıkanan dünyada yerleşemeyenler Kontrol sekmesinde sayılıyor', async ({ page }) => {
    const world = SMALL_WORLDS.find((w) => w.name === 'ogretmen-hafta-kapali')!;
    await loadWorld(page, world.state);
    await autoFill(page);

    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.panel', { hasText: 'Yerleşemeyen' }).first()).toContainText('511');
  });

  test('dizilen program yazdırılabiliyor', async ({ page }) => {
    const world = SMALL_WORLDS.find((w) => w.name === 'tek-gun')!;
    await loadWorld(page, world.state);
    await autoFill(page);

    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();
    expect(await page.locator('.print-page .p-top').count()).toBeGreaterThan(0);
  });
});
