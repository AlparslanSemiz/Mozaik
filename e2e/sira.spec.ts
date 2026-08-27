// 61. Putting a list into an order of your own.
//
// Asked for in the reader's own words: "listelerde kendimiz sürükleyerek
// sıralama". There is no order field — the array IS the order — so the payoff
// is not the list itself but everything downstream of it: the Program grid
// builds its rows by mapping `state.teachers`, and the printer builds its
// pages the same way. The test that matters most is therefore the one at the
// bottom of this file, where a row dragged in Kurulum has moved in Program.
//
// The move itself is unit-tested (`reorderList` in entities.test.ts). What
// only exists here is the wiring: a real pointer over a real table, the
// preference actually landing in localStorage, and the handles going quiet
// when the visible rows stop being the underlying list.

import { expect, test } from './kapan';
import type { Page } from '@playwright/test';
import { mainList, openSettings, openSetup, openWithSample, savedState, settledText } from './helpers';

const rows = (page: Page) => mainList(page).locator('tbody tr');
const grips = (page: Page) => mainList(page).locator('tbody .row-grip');

/** The name boxes, top to bottom. Column-position free (see liste.spec.ts). */
async function names(page: Page): Promise<string[]> {
  const boxes = await rows(page).locator('td > input[type="text"]:not(.text-sm)').all();
  return Promise.all(boxes.map((b) => b.inputValue()));
}

/** Drags row `from` onto row `to` with a real pointer. */
async function dragRow(page: Page, from: number, to: number) {
  const grip = grips(page).nth(from);
  const target = rows(page).nth(to);
  const a = (await grip.boundingBox())!;
  const b = (await target.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  // More than one step: the gesture only arms after SLOP pixels, and the
  // ghost is moved on requestAnimationFrame.
  await page.mouse.move(a.x + a.width / 2, b.y + b.height / 2, { steps: 8 });
  await page.waitForTimeout(60);
  await page.mouse.up();
}

test.describe('61. Elle sıralama', () => {
  test('sürükleyince sıra değişiyor ve DEPOYA yazılıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    const before = await names(page);
    expect(before[0]).toBe('Mehmet Çelik');
    expect(before[2]).toBe('Murat Bilge');

    const saved = await settledText(page);
    await dragRow(page, 0, 2);

    const after = await names(page);
    expect(after.slice(0, 3)).toEqual(['Ayşe Varol', 'Murat Bilge', 'Mehmet Çelik']);

    // Not just on screen: the array itself, as the page wrote it down.
    const state = await savedState(page, saved);
    expect(state.teachers.slice(0, 3).map((t) => t.name)).toEqual([
      'Ayşe Varol',
      'Murat Bilge',
      'Mehmet Çelik',
    ]);
    // Nobody was lost or duplicated on the way.
    expect(state.teachers).toHaveLength(25);
    expect(new Set(state.teachers.map((t) => t.id)).size).toBe(25);
  });

  test('yukarı doğru da sürüklüyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    await dragRow(page, 3, 0);
    expect((await names(page))[0]).toBe('Yasemin Mutlu');
  });

  test('klavyeyle de taşınıyor — ok, Home ve End', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');

    const first = () => names(page).then((x) => x[0]);
    expect(await first()).toBe('A');

    await grips(page).first().focus();
    await page.keyboard.press('ArrowDown');
    expect(await first()).toBe('B');

    // The row moved, so the handle under the finger is a different one now:
    // focus follows the POSITION, which is what a list reorder means.
    await grips(page).nth(1).focus();
    await page.keyboard.press('ArrowUp');
    expect(await first()).toBe('A');

    await grips(page).first().focus();
    await page.keyboard.press('End');
    const all = await names(page);
    expect(all[all.length - 1]).toBe('A');

    await grips(page).last().focus();
    await page.keyboard.press('Home');
    expect(await first()).toBe('A');
  });

  test('taşıma sesli söyleniyor — ekrana bakmayan da duyuyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');
    await grips(page).first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.list-tools [role="status"]')).toHaveText(/A 2\. sıraya taşındı/);
  });

  test('yerinde bırakılan satır GERİ ALINACAK bir şey bırakmıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    const undo = page.getByRole('button', { name: 'Geri al' });
    const wasDisabled = await undo.isDisabled();

    await dragRow(page, 1, 1);

    expect(await names(page)).toEqual(await names(page));
    // No change means no history entry: a nudge that moved nothing must not
    // cost a Ctrl+Z, or the undo stack fills with things that never happened.
    expect(await undo.isDisabled()).toBe(wasDisabled);
  });

  test('sıralama ya da süzgeç açıkken tutamak PASİF ve sebebi yazıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    // Count, not text. This used to read `.first()` and assert
    // `not.toContainText`, and it passed for the wrong reason: the strip also
    // held an always-drawn EMPTY announcement paragraph wearing the same
    // class, so `.first()` matched that one and "does not contain" was true of
    // something that was never the note. The announcement has moved onto the
    // strip's own row and carries `.list-said` now (pitfall 49), so the note
    // is either drawn or it is not — which is what the rule actually says.
    const note = page.locator('.list-tools .list-note');
    await expect(grips(page).first()).toBeEnabled();
    await expect(note).toHaveCount(0);

    await page.getByLabel('Sırala').selectOption({ label: 'Ada göre' });
    await expect(grips(page).first()).toBeDisabled();
    await expect(note).toContainText('Girildiği sıra');

    await page.getByLabel('Sırala').selectOption('');
    await expect(grips(page).first()).toBeEnabled();

    // A search narrows the rows too, so it locks for the same reason.
    await page.getByLabel('öğretmen ara').fill('mat');
    await expect(grips(page).first()).toBeDisabled();
    await page.getByLabel('öğretmen ara').fill('');
    await expect(grips(page).first()).toBeEnabled();

    // ...and so does a chip.
    await page.getByRole('button', { name: /^Matematik/ }).first().click();
    await expect(grips(page).first()).toBeDisabled();
  });

  test('pasif tutamak sürüklenmiyor — sıra kıpırdamıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    await page.getByLabel('Sırala').selectOption({ label: 'Ada göre' });

    const before = await names(page);
    await dragRow(page, 0, 3);
    expect(await names(page)).toEqual(before);
  });

  test('Escape sürüklemeyi iptal ediyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    const before = await names(page);

    const grip = grips(page).first();
    const a = (await grip.boundingBox())!;
    const b = (await rows(page).nth(4).boundingBox())!;
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(a.x + a.width / 2, b.y, { steps: 8 });
    await page.waitForTimeout(60);
    await page.keyboard.press('Escape');
    await page.mouse.up();

    expect(await names(page)).toEqual(before);
  });

  test('beş listenin beşinde de tutamak var', async ({ page }) => {
    await openWithSample(page);
    for (const step of ['Derslikler', 'Öğretmenler', 'Sınıflar', 'Dersler']) {
      await openSetup(page, step);
      expect(await grips(page).count(), step).toBeGreaterThan(1);
    }
    // The fifth is not a Kurulum step: it is Ayarlar → Branşlar.
    await openSettings(page, 'Branşlar');
    expect(await grips(page).count(), 'Branşlar').toBeGreaterThan(1);
  });

  // Branşlar has its own reader: the name cell is plain text, not a box, so
  // `names()` above finds nothing here.
  test('branşlar taşınıyor ve Öğretmenler’deki açılır liste O SIRAYA geçiyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await openSettings(page, 'Branşlar');

    // Only the school's OWN list can be dragged, and it is the first tbody.
    const listedRows = mainList(page).locator('tbody').first().locator('tr');
    // `td:nth-child(2)` and not `.locator('td').nth(1)`: the second one picks
    // the second cell of the whole table, not the second cell of each row.
    const subjects = async () =>
      (await listedRows.locator('td:nth-child(2)').allInnerTexts()).map((x) => x.trim());

    const before = await subjects();
    expect(before.length).toBeGreaterThan(3);

    await dragRow(page, 0, 3);
    const after = await subjects();
    expect(after).not.toEqual(before);
    expect(after[3]).toBe(before[0]);
    expect(after.slice().sort()).toEqual(before.slice().sort());

    await expect(page.locator('.panel .list-said')).toHaveText(
      new RegExp(`${before[0]} 4\\. sıraya taşındı`),
    );

    // THE point: the dropdown the reader picks a branch from is in this order.
    await openSetup(page, 'Öğretmenler');
    const options = await mainList(page)
      .locator('tbody tr')
      .first()
      .locator('select')
      .first()
      .locator('option')
      .allInnerTexts();
    expect(options.filter((o) => after.includes(o.trim())).slice(0, 4).map((o) => o.trim()))
      .toEqual(after.slice(0, 4));
  });

  test('branşlarda klavyeyle de taşınıyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Branşlar');
    const listedRows = mainList(page).locator('tbody').first().locator('tr');
    const first = (await listedRows.locator('td:nth-child(2)').allInnerTexts())[0]!.trim();

    await grips(page).first().focus();
    await page.keyboard.press('ArrowDown');

    const after = (await listedRows.locator('td:nth-child(2)').allInnerTexts()).map((x) => x.trim());
    expect(after[1]).toBe(first);
  });

  // THE point of the feature. The list is not the destination; the grid is.
  test('Kurulum’da taşınan öğretmen PROGRAM ızgarasında da taşınıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    const rowHead = () =>
      page.locator('table.grid tbody tr th').first().innerText();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    expect((await rowHead()).trim()).toContain('MÇ');

    await openSetup(page, 'Öğretmenler');
    await dragRow(page, 0, 4);

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    expect((await rowHead()).trim()).toContain('AV');
  });
});
