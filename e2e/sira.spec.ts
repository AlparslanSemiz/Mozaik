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
import { mainList, openSetup, openLessons, openWithSample, savedState, settledText } from './helpers';

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
    for (const step of ['Derslikler', 'Öğretmenler', 'Sınıflar']) {
      await openSetup(page, step);
      expect(await grips(page).count(), step).toBeGreaterThan(1);
    }
    // The fourth is a tab of its own now, and only in its GENERAL mode: the
    // focused modes show a subset, and dragging row 3 of a subset would move
    // row 3 of the array (see `useRowOrder`'s lock).
    await openLessons(page, 'all');
    expect(await grips(page).count(), 'Dersler').toBeGreaterThan(1);
    // The fifth IS an Okul step now — Branşlar moved in from Ayarlar.
    await openSetup(page, 'Branşlar');
    expect(await grips(page).count(), 'Branşlar').toBeGreaterThan(1);
  });

  // The other half of the lock, and the reason it is not a bug: a focused mode
  // shows a SUBSET, and `reorderList` moves rows of the ARRAY — row 3 on screen
  // is not row 3 in `state.lessons`.
  //
  // DISABLED and not removed, which is the same answer the other four lists
  // give while a search is on: a column that comes and goes would move every
  // other column sideways as you switch modes, and the reader would be looking
  // at a different table each time. The title says why it is off.
  test('sınıfa daralmış listede tutamak KİLİTLİ', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'class');
    const handles = grips(page);
    expect(await handles.count()).toBeGreaterThan(1);
    for (let i = 0; i < (await handles.count()); i++) {
      await expect(handles.nth(i)).toBeDisabled();
    }

    // ...and unlocked again in the general list, which is the one whose rows
    // ARE the array.
    await openLessons(page, 'all');
    await expect(grips(page).first()).toBeEnabled();
  });

  // Branşlar has its own reader: the name cell is plain text, not a box, so
  // `names()` above finds nothing here.
  test('branşlar taşınıyor ve Öğretmenler’deki açılır liste O SIRAYA geçiyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, 'Branşlar');

    // Only the school's OWN list can be dragged, and it is the first tbody.
    const listedRows = mainList(page).locator('tbody').first().locator('tr');
    // Read from `data-row-name` and NOT from a column position. The name cell
    // has moved twice now — a drag handle went in front of it, then a row
    // number in front of that — and each time a positional selector went on
    // reading a DIFFERENT, empty cell and the test compared "" with "" and
    // passed the wrong thing. The attribute is what the drag itself uses to
    // announce a row, so it cannot drift away from the row it names.
    const subjects = async () =>
      (await listedRows.evaluateAll((rows) =>
        rows.map((r) => r.getAttribute('data-row-name') ?? ''),
      )).map((x) => x.trim());

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
    // Read the VALUE, not the text. Each option reads "Mat · Matematik" now —
    // the short first, because that is the string the grid and the paper carry
    // — and the subject's identity was never the label anyway.
    const options = await mainList(page)
      .locator('tbody tr')
      .first()
      .locator('select')
      .first()
      .locator('option')
      .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    expect(options.filter((o) => after.includes(o)).slice(0, 4)).toEqual(after.slice(0, 4));
  });

  // "Branşa göre sıralandığında ayarlardaki branş sırasına göre olması gerek.
  // alfabetik olarak değil."
  //
  // Until this round the school's hand-sorted subject list reached exactly one
  // place, the Branş dropdown. Sorting teachers by subject answered in the
  // Turkish alphabet — an order nobody chose and nobody can change — and so did
  // the row of subject chips above the list.
  test('Öğretmenler branşa göre AYARLARDAKİ sıraya diziliyor, alfabetik değil', async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, 'Branşlar');
    const listedRows = mainList(page).locator('tbody').first().locator('tr');
    const subjects = async () =>
      (await listedRows.evaluateAll((rows) =>
        rows.map((r) => r.getAttribute('data-row-name') ?? ''),
      )).map((x) => x.trim());

    // Take a subject that is LATE in the alphabet and put it first. If the sort
    // were still alphabetical the teachers holding it would stay at the bottom.
    const all = await subjects();
    const late = all.indexOf([...all].sort((a, b) => b.localeCompare(a, 'tr'))[0]!);
    await dragRow(page, late, 0);
    const order = await subjects();

    await openSetup(page, 'Öğretmenler');
    await page.getByLabel('Sırala').selectOption({ label: 'Branşa göre' });

    // The chips read the same order, and they are the other half of the ask.
    const chips = (await page.locator('.chips').first().locator('.chip').allInnerTexts())
      .map((t) => t.replace(/\s*\d+$/, '').trim())
      .filter((t) => order.includes(t));
    expect(chips, 'çip satırı ayarlardaki sırada değil').toEqual(
      order.filter((s) => chips.includes(s)),
    );

    // ...and so do the rows. Read the subject from the CONTROL that holds it
    // (`aria-label="<kısaltma> branşı"`), not from a column position: that cell
    // has moved twice already and a positional selector went on reading an
    // empty neighbour and passing.
    const rowSubjects = await mainList(page)
      .locator('tbody tr')
      .evaluateAll((rows) =>
        rows.map((r) => {
          const box = r.querySelector('select[aria-label$="branşı"]') as HTMLSelectElement | null;
          // The value, not the option's text: the text carries the short form
          // in front of the name ("Mat · Matematik") and the subject's identity
          // is the name.
          return box === null ? '' : box.value;
        }),
      );
    const ranks = rowSubjects.map((x) => order.indexOf(x)).filter((n) => n >= 0);
    expect(ranks.length).toBeGreaterThan(3);
    expect([...ranks].sort((a, b) => a - b), rowSubjects.join(' | ')).toEqual(ranks);
    // The proof it is not the alphabet: the moved subject is now first, and it
    // is not the alphabetically first one.
    expect(rowSubjects.filter(Boolean)[0]).toBe(order[0]);
  });

  test('branşlarda klavyeyle de taşınıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Branşlar');
    const listedRows = mainList(page).locator('tbody').first().locator('tr');
    // `data-row-name`, not a column position — see the test above.
    const names = async () =>
      (await listedRows.evaluateAll((rows) =>
        rows.map((r) => r.getAttribute('data-row-name') ?? ''),
      )).map((x) => x.trim());
    const first = (await names())[0]!;

    await grips(page).first().focus();
    await page.keyboard.press('ArrowDown');

    const after = await names();
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
