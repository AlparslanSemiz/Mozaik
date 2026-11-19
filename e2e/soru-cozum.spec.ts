// Question-solving hours (plan B, schema v20), in the real browser: the
// father's flow. Lay the week out, open a teacher's row, click an empty hour
// and choose "Soru çözüm saati", lay the rest out again, and the hour is
// still there with no lesson on it, in no class's grid.

import { expect, test } from './kapan';
import { openWithSample, savedState, settledText } from './helpers';
import type { State } from '../src/leaf/model/types';

test.describe('Soru çözüm saatleri', () => {
  test('diz, öğretmen görünümünde soru çözümü ekle, Kalanı diz: yerinde, ders konmamış, sınıfta görünmüyor', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Tamam', exact: true }).click();

    // An empty hour of a teacher who also has a lesson: the row says whose.
    const free = page.locator('table.grid td[data-slot="free"]');
    const cell = free.first();
    await expect(cell).toBeVisible();
    const teacherId = (await cell.getAttribute('data-row'))!;
    const day = (await cell.getAttribute('data-day'))!;
    const hour = (await cell.getAttribute('data-hour'))!;
    const at = page.locator(`td[data-row="${teacherId}"][data-day="${day}"][data-hour="${hour}"]`);

    // A click opens ONE item; nothing is added until it is chosen.
    const before = await settledText(page);
    await at.click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem')).toHaveCount(1);
    await expect(menu.getByRole('menuitem')).toHaveText('Soru çözüm saati');
    await expect(at).not.toHaveClass(/study/);
    await menu.getByRole('menuitem', { name: 'Soru çözüm saati' }).click();

    await expect(at).toHaveClass(/study/);
    await expect(at).toHaveText('SÇ');
    await expect(page.locator('.toast').last()).toContainText('Soru çözüm saati eklendi');
    await expect(
      page.locator('.toast').last().getByRole('button', { name: 'Geri al' }),
    ).toBeVisible();
    const key = `${teacherId}|${day}|${hour}`;
    await expect.poll(async () => studyKeys(await savedState(page, before))).toEqual([key]);

    // The teacher's lesson goes back to the pool, then the rest is laid out again.
    const row = page.locator(`tr[data-row-id="${teacherId}"]`);
    const card = row.locator('.card').first();
    await card.focus();
    await page.keyboard.press('Delete');
    await expect(page.locator('.pool-card').first()).toBeVisible();
    const beforeRun = await settledText(page);
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });

    // Still there, still no card on it.
    await expect(at).toHaveClass(/study/);
    await expect(at.locator('.card')).toHaveCount(0);
    await expect(page.locator('.pool-card')).toHaveCount(0);
    await expect.poll(async () => studyKeys(await savedState(page, beforeRun))).toEqual([key]);
    const after = await savedState(page, beforeRun);
    expect(taught(after, teacherId, Number(day), Number(hour))).toBe(false);

    // The class grid does not draw it, and offers no click on an empty hour.
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    await expect(page.locator('table.grid .corner')).toHaveText('Sınıf');
    await expect(page.locator('table.grid .study')).toHaveCount(0);
    await expect(page.locator('table.grid [data-slot]')).toHaveCount(0);
    await expect(page.locator('table.grid')).not.toContainText('SÇ');

    // Back in the teacher's row: click it, "Kaldır", and ONE undo brings it back.
    await page.getByRole('button', { name: 'Öğretmen görünümü' }).click();
    await at.click();
    await page.getByRole('menuitem', { name: 'Kaldır', exact: true }).click();
    await expect(at).not.toHaveClass(/study/);
    await expect(page.locator('.toast').last()).toContainText('Soru çözüm saati kaldırıldı');
    await page.locator('.toast').last().getByRole('button', { name: 'Geri al' }).click();
    await expect(at).toHaveClass(/study/);
  });

  test('dersi olan saate tık menü açmıyor, boş hücreye sağ tık da', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Tamam', exact: true }).click();

    // A lesson's hour: the card's own menu is a right click, and a left click opens nothing.
    const card = page.locator('table.grid .card').first();
    await card.locator('xpath=..').click({ position: { x: 1, y: 1 } });
    await expect(page.getByRole('menu')).toHaveCount(0);

    // A right click on an empty hour still opens nothing (LAYOUT).
    await page.locator('table.grid td[data-slot="free"]').first().click({ button: 'right' });
    await expect(page.getByRole('menu')).toHaveCount(0);
  });
});

const studyKeys = (d: State): string[] => Object.keys(d.programs[0]!.study);

/** Whether `teacherId` has a lesson placed at that day and hour in the active program. */
function taught(d: State, teacherId: string, day: number, hour: number): boolean {
  const program = d.programs.find((p) => p.id === d.activeProgramId) ?? d.programs[0]!;
  return Object.entries(program.placements).some(([key, lessonId]) => {
    const [, g, s] = key.split('|');
    const lesson = d.lessons.find((l) => l.id === lessonId);
    return lesson?.teacherId === teacherId && Number(g) === day && Number(s) === hour;
  });
}
