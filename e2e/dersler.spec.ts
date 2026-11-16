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
    const names = await page
      .locator('.tabstrip .tab')
      .evaluateAll((tabs) => tabs.map((t) => t.getAttribute('aria-label')));
    expect(names).toEqual([
      'Okul',
      'Müsaitlik',
      'Dersler',
      'Program',
      'Kontrol',
      'Çıktı',
      'Ayarlar',
    ]);
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
    await expect(page.locator('.form-row').getByLabel('Branş', { exact: true })).toBeVisible();
    await expect(
      page.locator('.form-row .field-label', { hasText: /^Branş$/ }),
      'Sınıftan formunda seçicinin önünde ayrıca Branş yazmamalı',
    ).toHaveCount(0);
    await expect(
      page.locator('.form-row').getByLabel('Branş', { exact: true }).locator('option[value=""]'),
    ).toHaveText('Tüm branşlar');

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

    await expect(
      page.locator('.form-row .field-label', { hasText: /^Branş$/ }),
      'Genel formun görünür Branş etiketi korunmalı',
    ).toBeVisible();

    const classPick = page.locator('.form-row').getByLabel('Sınıf', { exact: true });
    const teacherPick = page.locator('.form-row').getByLabel('Öğretmen', { exact: true });
    await classPick.selectOption({ label: '411' });
    const teacherValue = await teacherPick.locator('option').nth(1).getAttribute('value');
    await teacherPick.selectOption(teacherValue!);

    // The total is the list heading's since 2026-11-16 (one count per screen).
    const heading = page.locator('.panel.step-panel h2').first();
    const before = Number(
      await heading.innerText().then((t) => t.replace('Dersler · ', '').split(' ')[0]),
    );
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(heading).toContainText(`${before + 1} ders`);

    // The class is still 411; the teacher is back to "choose one".
    expect(await classPick.inputValue()).not.toBe('');
    await expect(classPick).toHaveValue(
      (await classPick.locator('option', { hasText: '411' }).getAttribute('value')) ?? '',
    );
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

  // A CONTROL WITH ONE ANSWER IS NOT A QUESTION.
  //
  // "Öğretmenin tek bir branşı varsa seçme tuşu açılmasın dersler sectionu
  //  öğretmenden seçeneğinde, varsa tabii ki açılsın. Başlıkta branşı da
  //  yazsın."
  //
  // In Öğretmenden the branch pool is already that one teacher's own branches,
  // so for the twenty-three of twenty-five who hold one, the box was a dropdown
  // with a single option: it could not be answered wrongly and it could not be
  // answered differently. Nothing about the lesson changes when it goes —
  // `subjectValue` falls to the pool's first entry either way, and the flag
  // written into the lesson is derived from that.
  test('Öğretmenden: tek branşlı hocada branş kutusu YOK, iki branşlıda VAR', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'teacher');

    const box = page.locator('.form-row').getByLabel('Branş', { exact: true });
    const open = page.locator('.ribbon-value').first();
    const who = (await open.innerText()).trim();
    await expect(box, 'tek branşlı hocada branş kutusu hâlâ çiziliyor').toHaveCount(0);

    // ...and the branch is not lost, it moved to the heading — the LIST's one,
    // which is where the counted heading went when adding became its own panel.
    const heading = await page.locator('.panel.step-panel h2').first().innerText();
    expect(heading, `başlık branşı söylemiyor: "${heading}"`).toMatch(/ · .+ dersleri/);

    // Now give that same teacher a second branch and the question becomes real.
    await openSetup(page, 'Öğretmenler');
    // On the teacher's page since 2026-11-16 (K5): the row is text.
    const row = mainList(page).locator(`tbody tr[data-row-name="${who}"]`);
    await row.locator('.person-open').click();
    const second = page.getByRole('dialog').getByRole('combobox', { name: '2. branş' });
    const other = await second.locator('option').nth(1).getAttribute('value');
    await second.selectOption(other!);
    await page.keyboard.press('Escape');

    await openLessons(page, 'teacher');
    await expect(box, 'iki branşlı hocada branş kutusu açılmıyor').toHaveCount(1);
    // Both branches are offered, and only that teacher's two.
    await expect(box.locator('option')).toHaveCount(2);
  });

  test('liste facetleri moda göre yalnız anlamlı eksenleri gösteriyor', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'all');

    const labels = () =>
      page
        .locator('.list-tools [role="group"]')
        .evaluateAll((groups) => groups.map((group) => group.getAttribute('aria-label')));
    expect(await labels()).toEqual(['Branş', 'Öğretmen', 'Sınıf']);

    // Görünmez hale gelecek bir facet'i seç: mod dönüşünde eski seçim listeyi
    // arkadan daraltmamalı.
    const teacher = page.getByRole('group', { name: 'Öğretmen' });
    await teacher.locator('.chip').first().click();
    await expect(teacher.locator('.chip[aria-pressed="true"]')).toHaveCount(1);

    await openLessons(page, 'teacher');
    expect(await labels()).toEqual(['Branş', 'Sınıf']);
    await openLessons(page, 'class');
    expect(await labels()).toEqual(['Branş', 'Öğretmen']);
    await openLessons(page, 'all');
    expect(await labels()).toEqual(['Branş', 'Öğretmen', 'Sınıf']);
    await expect(
      page.getByRole('group', { name: 'Öğretmen' }).locator('.chip[aria-pressed="true"]'),
    ).toHaveCount(0);
    await expect(mainList(page).locator('tbody tr')).toHaveCount(99);
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

  // ...but not on a control whose own Enter means something else. The row's
  // Enter-adds reached the Dağılım button and its list too (the list is in a
  // portal, and React events bubble through portals to the row): Enter on the
  // button added the lesson instead of opening the list, and Enter on "2+1"
  // added it with the split it had BEFORE (TODO §8d, 2026-09-26).
  test('Dağılım düğmesinde ve listesinde Enter eklemiyor, açıyor ve seçiyor', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'class');

    const teacherPick = page.locator('.form-row').getByLabel('Öğretmen', { exact: true });
    const value = await teacherPick.locator('option').nth(1).getAttribute('value');
    await teacherPick.selectOption(value!);
    await page.locator('.form-row input.num').first().fill('3');

    const before = await mainList(page).locator('tbody tr').count();
    const split = page.locator('.form-row .split-pick');
    await split.focus();
    await page.keyboard.press('Enter');
    const list = page.getByRole('listbox', { name: 'Dağılım' });
    await expect(list, 'Enter listeyi açmadı').toBeVisible();
    await expect(mainList(page).locator('tbody tr')).toHaveCount(before);

    await list.getByRole('option', { name: /2\+1/ }).focus();
    await page.keyboard.press('Enter');
    await expect(list).toHaveCount(0);
    await expect(split).toHaveAccessibleName('Dağılım: 2+1');
    await expect(mainList(page).locator('tbody tr')).toHaveCount(before);

    // And Enter in the row still adds, with the split just picked.
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

  test('Genel modda seçilecek bir şey yok — ama sağ sütun DURUYOR', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'all');
    // Nothing to pick between: Genel is the whole list.
    await expect(page.locator('.entity-list')).toHaveCount(0);

    // The rail stays, and it stays the same width. It used to vanish here, so
    // switching modes moved the list's right edge by several hundred pixels —
    // on a button whose only job is to change which lessons are listed.
    const rail = page.locator('.cols > aside');
    await expect(rail).toHaveCount(1);
    await expect(rail).toContainText('Ders yükü');
    const wide = (await rail.boundingBox())!.width;

    await page.getByRole('button', { name: 'Sınıftan', exact: true }).click();
    await expect(page.locator('.entity-list')).toHaveCount(1);
    expect((await rail.boundingBox())!.width).toBeCloseTo(wide, 0);
  });

  // Rows and hours, said ONCE: the strip's copy of the total left on
  // 2026-11-16 (Sadeleşme, one count per screen).
  test('başlık ders sayısını da saati de söylüyor, şerit tekrar etmiyor', async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, 'all');
    const heading = await page.locator('.panel.step-panel h2').first().innerText();
    expect(heading).toMatch(/^Dersler · \d+ ders · \d+ saat$/);
    await expect(page.locator('.ribbon')).not.toContainText(heading.replace('Dersler · ', ''));
  });
  // A 6 left in the box from the last lesson went silently into the next one
  // (2026-11-15). After Ekle the box is back at the default, and the split
  // with it.
  test('Ekle’den sonra haftalık saat varsayılana, dağılım tek saatlere dönüyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, 'class');

    const teacherPick = page.locator('.form-row').getByLabel('Öğretmen', { exact: true });
    const value = await teacherPick.locator('option').nth(1).getAttribute('value');
    await teacherPick.selectOption(value!);
    const hours = page.locator('.form-row input.num').first();
    await hours.fill('6');
    const before = await mainList(page).locator('tbody tr').count();
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(mainList(page).locator('tbody tr')).toHaveCount(before + 1);

    await expect(hours).toHaveValue('4');
    await expect(page.locator('.form-row .split-pick')).toHaveAccessibleName('Dağılım: 1+1+1+1');
  });

  // 9A with 54 lesson hours and 48 open ones was accepted without a word: the
  // reader found out on Kontrol, or when Otomatik diz left cards in the pool.
  test('sınıfın açık saatini aşan ders girerken söyleniyor, sınıf satırı kırmızı', async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, 'class');
    await page.locator('.entity-list .entity', { hasText: '310' }).click();
    const teacherPick = page.locator('.form-row').getByLabel('Öğretmen', { exact: true });
    const hours = page.locator('.form-row input.num').first();
    const warning = page.locator('.error-box.over-capacity');

    // 29 + 40 = 69 of 72 open hours: still fits, nothing said.
    await teacherPick.selectOption({ index: 1 });
    await hours.fill('40');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.locator('.entity.over', { hasText: '310' })).toHaveCount(0);
    await expect(warning).not.toContainText('310:');

    // + 40 = 109: said at once, with the numbers, and the row turns red.
    await teacherPick.selectOption({ index: 2 });
    await hours.fill('40');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(warning).toContainText(
      '310: 109 saat ders, 72 açık saat. 37 saat haftaya sığmaz.',
    );
    await expect(page.locator('.entity.over', { hasText: '310' })).toHaveCount(1);
  });
});
