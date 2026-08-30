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
      return [...row.querySelectorAll('td[data-day]')].flatMap((td) => {
        const label = td.querySelector('.card-top')?.textContent ?? '';
        if (label === '') return [];
        // A two-hour block is ONE cell spanning two columns on the grid but
        // still two hours in the sheet, so the label is repeated as many times
        // as the cell stands for. Comparing the raw cells would have compared
        // blocks against hours and called the panel wrong for being right.
        return new Array<string>(Number(td.getAttribute('colspan')) || 1).fill(label);
      });
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

// "Öğretmenin bilgisine girip bir sınıfı başka bir hocaya aktarma olsun.
// Aynı şekilde öğretmenin bilgilendirmesine girip de yapılabilir olsun bu."
//
// The panel was read-only, so this is the first thing it can DO. What is worth
// testing is not the dropdown but the safety: a plain teacherId write would
// leave every cell where it is, and `buildIndex` puts teacher occupancy in a
// Map — two lessons on one teacher at one hour overwrite instead of clashing,
// with every count still adding up.
test.describe('83. Panelden ders aktarma', () => {
  const sheet = (page: import('@playwright/test').Page) => page.locator('.sheet');

  test('öğretmenin dersi BAŞKA hocaya geçiyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    // The row's own "bilgileri" button: an icon-only control, so its
    // aria-label is its only name.
    await mainList(page)
      .locator('tbody tr')
      .first()
      .getByRole('button', { name: /bilgileri$/ })
      .click();

    await expect(sheet(page)).toBeVisible();
    const rows = sheet(page).locator('.sheet-lessons tbody tr');
    await expect(rows.first()).toBeVisible();
    const which = (await rows.first().locator('td').first().innerText()).trim();
    const before = await rows.count();

    const pick = rows.first().getByRole('combobox');
    const to = (await pick.locator('option').nth(1).innerText()).trim();
    await pick.selectOption({ index: 1 });

    await expect(page.getByRole('alertdialog').or(page.getByRole('dialog')).last()).toContainText(
      'öğretmenine geçecek',
    );
    await page.getByRole('button', { name: 'Aktar' }).click();

    // Gone from THIS teacher's list…
    await expect(rows).toHaveCount(before - 1);
    // …and the toast names where it went.
    // `.last()`: the sample-data toast may still be on screen, and two toasts
    // are a strict-mode violation rather than a failure of the thing measured.
    await expect(page.locator('.toast').last()).toContainText(which);
    expect(to.length).toBeGreaterThan(0);
  });

  // The mirror the reader asked for in the second sentence.
  test('sınıfın panelinde de aynı aktarma var', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    await mainList(page)
      .locator('tbody tr')
      .first()
      .getByRole('button', { name: /bilgileri$/ })
      .click();

    await expect(sheet(page)).toBeVisible();
    await expect(sheet(page).getByRole('heading', { name: 'Aldığı dersler' })).toBeVisible();
    await expect(
      sheet(page).locator('.sheet-lessons tbody tr').first().getByRole('combobox'),
    ).toBeVisible();
  });

  // The whole reason this is not a one-line teacherId write.
  test('aktarma yeni hocayı ÇİFT REZERVE ETMİYOR', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 60_000 });

    await openSetup(page, 'Öğretmenler');
    await mainList(page)
      .locator('tbody tr')
      .first()
      .getByRole('button', { name: /bilgileri$/ })
      .click();
    const pick = sheet(page).locator('.sheet-lessons tbody tr').first().getByRole('combobox');
    await pick.selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Aktar' }).click();
    await expect(page.locator('.toast').last()).toContainText('geçti');

    // Read the whole grid out of the store and ask the only question that
    // matters: is any teacher in two classes at one hour?
    const clashes = await page.evaluate(() => {
      const raw = localStorage.getItem('ders-programi');
      // `placements` moved INSIDE the active program variant. Read from the
      // old place this came back `undefined`, the loop below ran zero times
      // and the assertion passed against anything — the exact shape of a
      // vacuous test (pitfall 23), on the one test whose whole job is to catch
      // a double-booked teacher.
      const s = JSON.parse(raw ?? '{}') as {
        lessons?: Array<{ id: string; teacherId: string }>;
        activeProgramId?: string;
        programs?: Array<{ id: string; placements: Record<string, string> }>;
      };
      const grid = (s.programs ?? []).find((p) => p.id === s.activeProgramId);
      if (grid === undefined) return ['aktif program bulunamadı'];
      const teacherOf = new Map((s.lessons ?? []).map((x) => [x.id, x.teacherId]));
      const seen = new Set<string>();
      const bad: string[] = [];
      for (const [key, lessonId] of Object.entries(grid.placements)) {
        const [, day, hour] = key.split('|');
        const who = teacherOf.get(lessonId);
        if (who === undefined) continue;
        const slot = `${who}|${day}|${hour}`;
        if (seen.has(slot)) bad.push(slot);
        seen.add(slot);
      }
      return bad;
    });
    expect(clashes).toEqual([]);
  });
});

// 87. THE SHEET EDITS NOW. "öğretmeni düzenleme ve sınıfı düzenlemede her şeyi
// düzenleyebilelim."
//
// The controls themselves are the Okul list's, bound to the same mutators, so
// what is worth asking is not "does the box exist" but whether the road works
// end to end: from a card on the grid, to the entity behind it, to a change
// the GRID then shows.
test.describe('87. Panelden düzenleme', () => {
  const sheet = (page: import('@playwright/test').Page) => page.locator('.sheet');

  async function laidOut(page: import('@playwright/test').Page) {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
  }

  test('karttan "Öğretmeni düzenle" o hocayı açıyor, kısaltma ızgarayı DEĞİŞTİRİYOR', async ({ page }) => {
    await laidOut(page);

    const head = page.locator('table.grid .row-head .inspect').first();
    const before = (await head.innerText()).trim();

    await page.locator('table.grid .card').first().click({ button: 'right' });
    await page.locator('.menu').getByRole('menuitem', { name: 'Öğretmeni düzenle' }).click();
    await expect(sheet(page)).toBeVisible();
    await expect(sheet(page).locator('.sheet-kind')).toHaveText('Öğretmen');

    // The row head of the grid IS the short form, so changing it here is the
    // shortest end-to-end this sheet has.
    const short = sheet(page).getByRole('textbox', { name: 'Kısaltma' });
    await short.fill('ZZ');
    await short.blur();
    await page.keyboard.press('Escape');

    await expect(page.locator('table.grid .row-head .inspect', { hasText: 'ZZ' })).toHaveCount(1);
    expect(before).not.toBe('ZZ');
  });

  test('karttan "Sınıfı düzenle" SINIFI açıyor — ızgaranın çizilmediği eksen', async ({ page }) => {
    await laidOut(page);
    await page.locator('table.grid .card').first().click({ button: 'right' });
    await page.locator('.menu').getByRole('menuitem', { name: 'Sınıfı düzenle' }).click();
    await expect(sheet(page).locator('.sheet-kind')).toHaveText('Sınıf');
    // A class has a room and the school's per-day ceiling; a teacher has
    // neither, so this is also how the two sheets are told apart.
    await expect(sheet(page).getByRole('combobox', { name: 'Derslik' })).toBeVisible();
  });

  test('dersin SINIFI ders penceresinden değişiyor, ve önce ne kaybedileceği soruluyor', async ({ page }) => {
    await laidOut(page);

    await page.locator('table.grid .card').first().click({ button: 'right' });
    await page.locator('.menu').getByRole('menuitem', { name: 'Dersi düzenle' }).click();
    const pick = sheet(page).getByRole('combobox', { name: 'Sınıf' });
    const from = await pick.inputValue();

    await pick.selectOption({ index: 1 });
    // The question comes BEFORE the move, and it counts what it costs: a class
    // change lifts every hour off the old row and offers it to the new one.
    const dialog = page.locator('[role="dialog"], [role="alertdialog"]').last();
    await expect(dialog).toContainText('sınıfına taşınsın mı?');
    await dialog.getByRole('button', { name: 'Taşı' }).click();

    await expect(page.locator('.toast').last()).toContainText('taşındı');
    await expect(pick).not.toHaveValue(from);
  });
});
