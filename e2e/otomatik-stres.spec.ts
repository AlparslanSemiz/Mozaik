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
      if (world.want.reasonLike !== undefined) {
        await expect(page.locator('.reason-bar')).toContainText(world.want.reasonLike);
      }

      // The page never froze: a tab click still answers.
      await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Program', exact: true })).toBeVisible();
    });
  }

  test('sayfa dizim SÜRESİNCE de tıklanabiliyor', async ({ page }) => {
    const world = HEAVY_WORLDS[0]!;
    await loadWorld(page, world.state);
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    // If the search held the main thread this would time out instead of answering.
    await expect(page.getByRole('button', { name: 'Kontrol', exact: true })).toBeEnabled();
    // `exact: true`, and the name is the WORD: the button carried a literal "■"
    // in its label until the strip was standardised on symbol-plus-word, and a
    // test naming the glyph was naming a drawing (pitfall 49).
    await expect(page.getByRole('button', { name: 'Durdur', exact: true })).toBeVisible();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 60_000 });
  });

  /**
   * The collapse of 2026-08-25, now the other way round.
   *
   * The sample school lays out completely: 359/359 blocks in 78 ms. Change
   * nothing but the three adjustable limits (art arda 4->2, günde 8->5, aynı
   * ders 2->1), set them to Engelle, and it used to fall to 3 blocks of 359 and
   * spend the whole 15-second budget getting there — 30 seconds bought 58 705
   * nodes and still 3 blocks.
   *
   * The cause was not the data. 32 of the 99 lessons are 2-hour blocks, and a
   * 2-hour block cannot obey "aynı ders günde en fazla 1 saat" anywhere, so
   * those are genuinely impossible; but the search kept re-discovering them (and
   * lessons like the one that wants 8 hours of a week that can hold 4) instead
   * of settling for what they CAN hold. Now every lesson's ceiling is worked out
   * before the search starts. MEASURED after the fix: 241 blocks, 241 nodes,
   * 43 ms — one node per block, no backtracking at all.
   */
  test('kural sıkılaşınca gerçek ölçekte de dizebiliyor', async ({ page }) => {
    const world = HEAVY_WORLDS.find((w) => w.name === 'gercek-olcek-kurali')!;
    await loadWorld(page, world.state);
    const before = await autoFill(page);
    const saved = await savedState(page, before);

    const asked = world.state.lessons.reduce((sum, l) => sum + l.weeklyHours, 0);
    const placed = Object.keys(saved.placements).length;
    console.log(`[ölçüm] ${world.name}: ${placed}/${asked} saat yerleşti`);

    // Half the school is the promise; 241 of 426 hours is what it measures at.
    // The number is a floor, not a target: it may only go up.
    expect(placed).toBeGreaterThan(asked / 2);
    expect(placed).toBeGreaterThanOrEqual(241);
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
