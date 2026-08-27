// 69. Dersler — its own tab, and a form that keeps the axis you are walking.
//
// This screen was step four of Kurulum until this round. The reader said why
// that was wrong: "Ders ekleme tarafı çok daha pratik hale getirilmeli, neden?
// Çünkü hocaları onu bunu ayarlıyorsun ama DERS EN ÖNEMLİ KISIM." Rooms,
// teachers and classes are filled in once a term; this is the screen that gets
// used, and as a step it could only be reached through a wizard.
//
// Two things are measured here and neither could be measured in jsdom: that the
// form DROPS the axis the ribbon is holding, and that adding a lesson keeps the
// entity you are working through instead of clearing it — which is the exact
// opposite of what the old form did.

import { expect, test } from './kapan';
import { openLessons, openSetup, openWithSample, mainList, open } from './helpers';

test.describe('69. Dersler sekmesi', () => {
  test('yedinci sekme, Müsaitlik ile Program arasında', async ({ page }) => {
    await open(page);
    const names = await page.locator('.tabstrip .tab').evaluateAll((tabs) =>
      tabs.map((t) => t.getAttribute('aria-label')),
    );
    expect(names).toEqual([
      'Kurulum',
      'Müsaitlik',
      'Dersler',
      'Program',
      'Kontrol',
      'Yazdır',
      'Ayarlar',
    ]);
  });

  test('Kurulum durumundaki kapı Dersler sekmesini açıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');
    await page.locator('.lesson-jump').getByRole('button').click();
    await expect(page.locator('.ribbon')).toHaveAttribute('data-section', 'lessons');
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Dersler',
    );
  });

  // The shortening the reader asked for by name: "tek bir sınıf için ders
  // eklemeyi çok daha kısa hale ya da pratik hale getirelim."
  test('Sınıftan modunda form sınıf SORMUYOR, şerit hangisi olduğunu söylüyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, 'class');

    // The class picker is gone from the form and the teacher one is still there.
    await expect(page.locator('.form-row').getByLabel('Sınıf', { exact: true })).toHaveCount(0);
    await expect(page.locator('.form-row').getByLabel('Öğretmen', { exact: true })).toBeVisible();

    // Which one is open is said in the strip and in the heading, and the list
    // underneath holds only that class's lessons.
    await page.locator('.entity-list .entity', { hasText: '411' }).click();
    await expect(page.locator('.ribbon-value').first()).toContainText('411');
    await expect(page.getByRole('heading', { name: /^411 dersleri/ })).toBeVisible();

    // `data-row-name` ("411 · MÇ") and not a column index: the class cell has
    // a row number and a drag handle in front of it, and a positional selector
    // reads whichever of those happens to be second today.
    const named = await mainList(page)
      .locator('tbody tr')
      .evaluateAll((rows) => rows.map((r) => r.getAttribute('data-row-name') ?? ''));
    expect(named.length).toBeGreaterThan(0);
    expect([...new Set(named.map((x) => x.split('·')[0]!.trim()))]).toEqual(['411']);
  });

  // THE bug this round was asked to fix: "Ders eklenirken en sonki seçilen
  // sınıfa ders eklendikten sonra sınıf seçeneği hatırlansın varsayılana
  // dönülmesin." The old form cleared exactly the field worth keeping, so eight
  // lessons for one class meant choosing that class eight times.
  test('Genel modda Ekle SINIFI koruyor, öğretmeni sıfırlıyor', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'all');

    const classPick = page.locator('.form-row').getByLabel('Sınıf', { exact: true });
    const teacherPick = page.locator('.form-row').getByLabel('Öğretmen', { exact: true });
    await classPick.selectOption({ label: '411' });
    const teacherValue = await teacherPick.locator('option').nth(1).getAttribute('value');
    await teacherPick.selectOption(teacherValue!);

    const before = Number(await page.locator('.ribbon-value').innerText().then((t) => t.split(' ')[0]));
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.locator('.ribbon-value')).toContainText(`${before + 1} ders`);

    // The class is still 411; the teacher is back to "choose one".
    expect(await classPick.inputValue()).not.toBe('');
    await expect(classPick).toHaveValue(await classPick.locator('option', { hasText: '411' }).getAttribute('value') ?? '');
    expect(await teacherPick.inputValue()).toBe('');
  });

  test('Öğretmenden modunda ayna: öğretmen kalır, sınıf sıfırlanır', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'teacher');

    await expect(page.locator('.form-row').getByLabel('Öğretmen', { exact: true })).toHaveCount(0);
    const classPick = page.locator('.form-row').getByLabel('Sınıf', { exact: true });
    await classPick.selectOption({ label: '411' });

    const open = await page.locator('.ribbon-value').first().innerText();
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    // The teacher the strip names has not moved, and the class box has.
    await expect(page.locator('.ribbon-value').first()).toHaveText(open);
    expect(await classPick.inputValue()).toBe('');
  });

  test('Enter da ekliyor', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'class');

    const teacherPick = page.locator('.form-row').getByLabel('Öğretmen', { exact: true });
    const value = await teacherPick.locator('option').nth(1).getAttribute('value');
    await teacherPick.selectOption(value!);

    const before = await mainList(page).locator('tbody tr').count();
    await page.locator('.form-row input.num').first().press('Enter');
    await expect(mainList(page).locator('tbody tr')).toHaveCount(before + 1);
  });

  test('mod değişince açık olan varlık sıfırlanıyor', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'class');
    await page.locator('.entity-list .entity', { hasText: '411' }).click();
    await expect(page.locator('.ribbon-value').first()).toContainText('411');

    // '411' is a class id; carried into the teacher list it would name nobody.
    await page.getByRole('button', { name: 'Öğretmenden', exact: true }).click();
    const named = await page.locator('.ribbon-value').first().innerText();
    expect(named).not.toContain('411');
    await expect(page.locator('.entity-list .entity[aria-current="true"]')).toHaveCount(1);
  });

  test('Genel modda seçilecek bir şey yok, sağ sütun da yok', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'all');
    await expect(page.locator('.entity-list')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /^Dersler \(/ })).toBeVisible();
  });
});
