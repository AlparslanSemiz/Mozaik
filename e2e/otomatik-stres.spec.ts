// Real-scale worlds. NOT part of `npm run kontrol` — each run spends the whole
// 15-second solver budget, and the daily loop must stay fast on a slow machine.
// Run it with `npm run cozucu`.
//
// What it is for: docs/STATUS.md carried an open question for months — "what
// does the solver do when the data is hard?" — because the sample school goes
// through in a straight line (359 blocks, 359 nodes, no backtracking at all).
// These worlds are the answer, and the numbers they print are meant to be read,
// not just to go green.

import { expect, test, type Page } from '@playwright/test';
import { solve } from '../src/solver';
import { HEAVY_WORLDS, hoursOf, illegalBlocks } from '../src/worlds';
import { loadWorld, savedState, settledText } from './helpers';

/** The budget the app itself uses (solver.ts DEFAULTS). */
const APP_BUDGET_MS = 15_000;

async function autoFill(page: Page): Promise<string> {
  const before = await settledText(page);
  await page.getByRole('button', { name: /^Otomatik diz/ }).click();
  await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 60_000 });
  return before;
}

test.describe('39. Otomatik dizme — gerçek ölçekte stres', () => {
  for (const world of HEAVY_WORLDS) {
    test(`${world.name}: ${world.note}`, async ({ page }) => {
      await loadWorld(page, world.state);
      await expect(page.locator('table.grid')).toBeVisible();

      const before = await autoFill(page);
      const saved = await savedState(page, before);
      const bar = (await page.locator('.reason-bar').textContent()) ?? '';

      console.log(`[ölçüm] ${world.name}: ${bar.replace(/\s+/g, ' ').trim()}`);

      // Whatever it managed, it is a timetable somebody can keep.
      expect(illegalBlocks(saved)).toEqual([]);
      for (const lesson of world.state.lessons) {
        expect(hoursOf(saved, lesson.id)).toBeLessThanOrEqual(lesson.weeklyHours);
      }

      // And it said something concrete rather than "olmadı".
      expect(bar.length).toBeGreaterThan(20);
      if (!world.want.solved) {
        await expect(page.locator('.reason-bar')).toContainText('yerleşemedi');
        await expect(page.locator('.reason-bar')).toContainText('Ayrıntı: Kontrol sekmesi.');
      }

      // The page never froze: a tab click still answers.
      await page.getByRole('button', { name: 'Kontrol' }).click();
      await expect(page.getByRole('button', { name: 'Program', exact: true })).toBeVisible();
    });
  }

  test('sayfa dizim SÜRESİNCE de tıklanabiliyor', async ({ page }) => {
    const world = HEAVY_WORLDS[0]!;
    await loadWorld(page, world.state);
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    // If the search held the main thread this would time out instead of answering.
    await expect(page.getByRole('button', { name: 'Kontrol' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '■ Durdur' })).toBeVisible();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 60_000 });
  });

  /**
   * BİLİNEN HATA (2026-08-25). Marked `test.fail`, so the suite stays green
   * while the bug is open AND goes red the day somebody fixes it.
   *
   * The sample school lays out completely — 359/359 blocks in 78 ms. Change
   * nothing but the three adjustable limits (art arda 4->2, günde 8->5, aynı
   * ders 2->1) and set them to Engelle, and the same school collapses to 3
   * blocks out of 359. It does not recover with more time: 30 s gets 58 705
   * nodes and still 3 blocks. Kontrol reports NO capacity problem for this
   * world, so it is not the data being impossible — the search is.
   *
   * Why it matters here and not in theory: docs/TASKS.md has "öğretmen
   * sınırları sorulsun" open. The moment a real number is entered for those
   * limits, automatic timetabling stops working.
   */
  test.fail('kural sıkılaşınca gerçek ölçekte de dizebiliyor — BİLİNEN HATA', async ({ page }) => {
    const world = HEAVY_WORLDS.find((w) => w.name === 'gercek-olcek-kurali')!;
    await loadWorld(page, world.state);
    const before = await autoFill(page);
    const saved = await savedState(page, before);

    const asked = world.state.lessons.reduce((sum, l) => sum + l.weeklyHours, 0);
    const placed = Object.keys(saved.placements).length;
    console.log(`[ölçüm] ${world.name}: ${placed}/${asked} saat yerleşti`);
    // Half the school would already be a usable answer. It places about 1%.
    expect(placed).toBeGreaterThan(asked / 2);
  });

  test('çözücünün kendi sayıları — ölçüm, iddia değil', async () => {
    // Playwright's worker is Node, so the pure solver can be run here without a
    // browser. These are the numbers that go into docs/STATUS.md.
    for (const world of HEAVY_WORLDS) {
      const r = solve(world.state, { budgetMs: APP_BUDGET_MS });
      console.log(
        `[ölçüm] ${world.name}: ${r.placedBlocks}/${r.totalBlocks} blok, ${r.nodes} düğüm, ` +
          `${Math.round(r.elapsedMs)} ms, faz=${r.phase}, yerleşemeyen ders=${r.stuck.length}`,
      );
      expect(illegalBlocks(r.state)).toEqual([]);
      // The budget is a promise to the user: it may be spent, never overrun by
      // more than a slice.
      expect(r.elapsedMs).toBeLessThan(APP_BUDGET_MS + 1_000);
    }
  });
});
