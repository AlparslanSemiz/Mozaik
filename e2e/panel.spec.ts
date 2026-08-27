// 48. The entity sheet.
//
// The reader asked for it in one sentence: "her derslik, sınıf ya da
// öğretmenin üzerine tıklandığında bilgileri ve programının gözükmesi".
//
// What is worth testing here is NOT that a panel opens — that is one Radix
// call. It is that the panel is TRUE: the week it draws has to be the same
// week the grid drew, the numbers have to be counted rather than estimated,
// and a lesson left on an hour that was closed afterwards has to show up here
// too (pitfall 16 has cost this program a placed lesson once already).

import { expect, test } from './kapan';
import { openWithSample, openSetup, chooseEntity, mainList } from './helpers';

test.describe('48. Varlık paneli', () => {
  test('ızgarada satır başına tıklamak o öğretmenin haftasını açıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });

    // The row head IS the entity.
    const head = page.locator('table.grid tbody tr').first().locator('.row-head .inspect');
    const who = (await head.innerText()).trim();
    await head.click();

    const sheet = page.locator('.sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('.sheet-mark')).toHaveText(who);
    await expect(sheet.locator('.sheet-kind')).toHaveText('Öğretmen');

    // Row = day, column = lesson — the Müsaitlik axis, not the Program one.
    const rows = sheet.locator('.sheet-week tbody tr');
    await expect(rows).toHaveCount(6);
    await expect(rows.first().locator('td')).toHaveCount(12);

    // The SAME week the grid drew. This is the assertion that matters: a panel
    // that renders a plausible-looking week from its own walk of `placements`
    // would pass every other check in this file.
    const fromGrid = await page.evaluate(() => {
      const row = document.querySelector('table.grid tbody tr')!;
      return [...row.querySelectorAll('td[data-day]')]
        .map((td) => td.querySelector('.card-top')?.textContent ?? '')
        .filter((t) => t !== '');
    });
    const fromSheet = await sheet
      .locator('.sheet-week tbody .sheet-cell-top')
      .allInnerTexts();
    expect(fromSheet.length).toBeGreaterThan(0);
    expect(fromSheet).toEqual(fromGrid);

    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });

  test('sayılar SAYILIYOR: yerleşmemiş saat kalınca uyarı çıkıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    // Nothing laid out yet, so every teacher's load is entirely in the pool.
    await page.locator('table.grid tbody tr').first().locator('.row-head .inspect').click();

    const sheet = page.locator('.sheet');
    const placed = sheet.locator('.sheet-facts > div', { hasText: 'Programa yerleşmiş' });
    await expect(placed).toHaveClass(/tight/);
    await expect(placed.locator('dd')).toHaveText(/^0 \/ \d+ saat$/);

    // ...and the load itself is not flagged, because the week is open enough
    // to hold it. A panel that painted everything amber would say nothing.
    await expect(
      sheet.locator('.sheet-facts > div', { hasText: 'Haftalık ders yükü' }),
    ).not.toHaveClass(/tight/);
  });

  test('derslikten açılınca hangi sınıfların paylaştığını ADLARIYLA söylüyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');
    await mainList(page)
      .locator('tbody tr')
      .first()
      .getByRole('button', { name: /bilgileri$/ })
      .click();

    const sheet = page.locator('.sheet');
    await expect(sheet.locator('.sheet-kind')).toHaveText('Derslik');
    await expect(sheet.locator('.sheet-links')).toContainText('sınıf paylaşıyor');
    // A room has no colour of its own, so the mark carries the kind's icon.
    await expect(sheet.locator('.sheet-mark svg')).toBeVisible();
  });

  test('kapatılan saatte kalmış ders panelde de KIRMIZI (tuzak 16)', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });

    // Find a teacher who really has something placed, then close their week.
    const id = await page.evaluate(() => {
      const row = [...document.querySelectorAll('table.grid tbody tr')].find(
        (tr) => tr.querySelector('.card') !== null,
      );
      return row?.querySelector('td[data-row]')?.getAttribute('data-row') ?? '';
    });
    expect(id).not.toBe('');

    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await chooseEntity(page, id);
    await page.getByRole('button', { name: 'Tümünü kapat' }).click();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page
      .locator(`table.grid tbody tr:has(td[data-row="${id}"]) .row-head .inspect`)
      .click();

    // The lesson is NOT removed (principle 6) — it is marked, here as well as
    // on the grid, because this is now the easiest place to notice it.
    const sheet = page.locator('.sheet');
    expect(await sheet.locator('.sheet-week td.conflict').count()).toBeGreaterThan(0);
  });
});
