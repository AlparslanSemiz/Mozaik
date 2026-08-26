// The Kurulum tab: four countable steps, the paste box, and the subject list
// they feed.

import { expect, test, type Page } from '@playwright/test';
import { open, openWithSample, openSetup, openSettings, dragAndDrop, mainList, answerDialog } from './helpers';

test.describe('5. Kurulum ve yedek', () => {
  test('Excel yapıştırma önizleme gösterip ekliyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Öğretmenler');
    await page.getByRole('button', { name: "Excel'den yapıştır" }).click();

    await page.locator('textarea').fill('Ali Vural\tAV\tMatematik\nDeniz Ak\tDA\tFizik');
    await page.getByRole('button', { name: 'Önizle' }).click();
    await expect(page.getByText('2 satır okundu.')).toBeVisible();

    await page.getByRole('button', { name: /2 satırı ekle/ }).click();
    await expect(page.locator('.step', { hasText: 'Öğretmenler' })).toContainText('2');
  });

  test('Kurulum adımlar hâlinde: sayaçlar doğru, geçiş serbest', async ({ page }) => {
    await open(page);
    // An empty step is dimmed — that is the whole point of the counter
    await expect(page.locator('.step', { hasText: 'Derslikler' })).toHaveAttribute(
      'data-empty',
      'true',
    );

    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await answerDialog(page);

    await expect(page.locator('.step', { hasText: 'Derslikler' })).toContainText('8');
    await expect(page.locator('.step', { hasText: 'Öğretmenler' })).toContainText('25');
    await expect(page.locator('.step', { hasText: 'Sınıflar' })).toContainText('20');
    await expect(page.locator('.step', { hasText: 'Dersler' })).toContainText('99');

    // Kurulum is now FOUR steps: the school's own settings moved to Ayarlar
    await expect(page.locator('.ribbon .step')).toHaveCount(4);
    await expect(page.getByRole('heading', { name: 'Okul ve günler' })).toHaveCount(0);

    // Only the current step is on screen; the 1132-line scroll is gone
    await expect(page.getByRole('heading', { name: /^Derslikler/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Öğretmenler/ })).toHaveCount(0);

    await openSetup(page, 'Öğretmenler');
    await expect(page.getByRole('heading', { name: /^Öğretmenler/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Derslikler/ })).toHaveCount(0);

    // Not a locked wizard: jumping straight to the last step works
    await openSetup(page, 'Dersler');
    await expect(page.getByRole('heading', { name: /^Dersler/ })).toBeVisible();
    // ...and the "Kurulum durumu" table is the second way to move between
    // steps. The "Sonraki adım" button that used to be here went in C9: moving
    // already had two homes (the four ribbon buttons and these rows) and a
    // third that could only ever go FORWARDS was the weakest of them.
    await openSetup(page, 'Sınıflar');
    await page
      .locator('.panel', { hasText: 'Kurulum durumu' })
      .getByRole('button', { name: /Dersler/ })
      .click();
    await expect(page.locator('.step[aria-pressed="true"]')).toContainText('Dersler');
  });

  test('kısaltma addan üretiliyor, çakışma uyarısı çıkıyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Öğretmenler');

    const name = page.getByPlaceholder('Ad Soyad');
    const short = page.getByLabel('Kısaltma');
    const branch = page.getByLabel('Branş', { exact: true });

    // The placeholder shows what will be derived, live
    await name.fill('Ahmet Sarı');
    await expect(short).toHaveAttribute('placeholder', 'AS');
    await branch.selectOption('Matematik');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    // "Ayşe Solmaz" derives AS as well — in a real 25-person list this happens
    await name.fill('Ayşe Solmaz');
    await expect(short).toHaveAttribute('placeholder', 'AS');
    await branch.selectOption('Fizik');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    const warning = page.locator('.warn-box', { hasText: 'Aynı kısaltma' });
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('Ahmet Sarı, Ayşe Solmaz');

    // Fixing one of them clears the warning
    const secondShort = page.locator('table.list tbody tr').nth(1).locator('input').nth(1);
    await secondShort.fill('AYS');
    await secondShort.blur();
    await expect(page.locator('.warn-box', { hasText: 'Aynı kısaltma' })).toHaveCount(0);
  });

  test('silmeden önce her zaman soruyor ve ne gideceğini sayıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');

    // Deleting a room used to ask NOTHING at all
    const rows = mainList(page).locator('tbody tr');
    const before = await rows.count();
    await rows.first().getByRole('button', { name: 'Sil' }).click();
    // Cancelled -> nothing may change, and the sentence has to have COUNTED.
    const asked = await answerDialog(page, 'cancel');
    expect(asked).toContain('dersliği silinecek');
    expect(asked).toContain('sınıfın dersliği boşalacak');
    expect(asked).toContain('çakışması artık kontrol edilmeyecek');
    await expect(rows).toHaveCount(before);

    // Confirmed, it goes
    await rows.first().getByRole('button', { name: 'Sil' }).click();
    await answerDialog(page);
    await expect(rows).toHaveCount(before - 1);
  });

});

test.describe('12. Branş kısaltmaları', () => {
  test('ızgarada kısaltma yazıyor, tam ad yer olan yerde kalıyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();

    // "Matematik" does not fit a 34px cell; the short form does.
    const shortText = (await page.locator('table.grid .card-bottom').first().textContent())!;
    expect(shortText.length).toBeLessThanOrEqual(4);

    // The teacher row heading has room, so it keeps the FULL subject
    await page.getByRole('button', { name: 'Öğretmen görünümü' }).click();
    const full = (await page.locator('tbody .row-head .secondary').first().textContent())!;
    expect(full.length).toBeGreaterThan(4);
  });

  test('Branşlar adımından değiştirilince ızgara ve baskı birlikte değişiyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    const before = (await page.locator('table.grid .card-bottom').first().textContent())!;

    await openSettings(page, 'Branşlar');
    // The box comes FILLED with the default, not with a faint placeholder
    const target = page.locator('table.list tbody tr', {
      has: page.locator(`input[value="${before}"]`),
    });
    await expect(target).toHaveCount(1);
    const input = target.locator('input');
    await expect(input).toHaveValue(before);

    await input.fill('Zzz');
    await input.blur();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    await expect(page.locator('table.grid .card-bottom').first()).toHaveText('Zzz');

    // ...and the printed page uses the same short form
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-area')).toContainText('Zzz');
  });

  test('varsayılana geri yazılınca override kayboluyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Branşlar');

    const row = page.locator('table.list tbody tr').first();
    const input = row.locator('input');
    const original = (await input.inputValue())!;

    await input.fill('Zzz');
    await input.blur();
    await expect(row).toContainText(`varsayılanı: ${original}`);

    await row.locator('input').fill(original);
    await row.locator('input').blur();
    await expect(row).toContainText('varsayılan');
    await expect(row).not.toContainText('varsayılanı:');
  });
});

// ---------------------------------------------------------------------------
// 16. Branş: yazılmaz, seçilir
//
// Free text let "Matemtik" become a second subject that still abbreviated to
// "Mat", so on paper the two were indistinguishable and nothing warned about
// it. The branch is now picked from the school's own list.

test.describe('16. Branş seçimi', () => {
  test('öğretmenin branşı açılır listeden seçiliyor, metin kutusu yok', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Öğretmenler');

    const branch = page.getByLabel('Branş', { exact: true });
    await expect(branch).toHaveJSProperty('tagName', 'SELECT');
    await expect(page.getByPlaceholder('Branş')).toHaveCount(0);

    // Branch is required: half a teacher record is not worth storing
    await page.getByPlaceholder('Ad Soyad').fill('Mehmet Çelik');
    await expect(page.getByRole('button', { name: 'Ekle', exact: true })).toBeDisabled();

    await branch.selectOption('Matematik');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(mainList(page).locator('tbody tr')).toHaveCount(1);
    await expect(page.getByLabel('MÇ branşı')).toHaveValue('Matematik');
  });

  test('“+ Yeni branş” hem öğretmene atanıyor hem listeye giriyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Öğretmenler');

    await page.getByPlaceholder('Ad Soyad').fill('Ayşe Yıldız');
    await page.getByLabel('Branş', { exact: true }).selectOption({ label: '+ Yeni branş…' });
    await page.getByLabel('Yeni branşın adı').fill('Robotik');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    await expect(page.getByLabel('AY branşı')).toHaveValue('Robotik');

    // ...and it is in the school's list from now on, with a short form
    await openSettings(page, 'Branşlar');
    const row = page.locator('table.list tbody tr', { hasText: 'Robotik' });
    await expect(row).toHaveCount(1);
    await expect(row.locator('input')).toHaveValue('Rob');
  });

  test('kullanılan branş silinemiyor ve kimin kullandığı yazıyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Branşlar');

    await page
      .locator('table.list tbody tr', { hasText: 'Matematik' })
      .getByRole('button', { name: 'Sil' })
      .click();

    const said = await answerDialog(page);
    expect(said).toContain('öğretmen bu branşta');
    expect(said).toContain('Önce onların branşını değiştirin');
    await expect(page.locator('table.list tbody tr', { hasText: 'Matematik' })).toHaveCount(1);
  });

  test('kullanılmayan branş listeden çıkarılıyor ve açılır listede kalmıyor', async ({
    page,
  }) => {
    await open(page);
    await openSettings(page, 'Branşlar');

    await page
      .locator('table.list tbody tr', { hasText: 'Fransızca' })
      .getByRole('button', { name: 'Sil' })
      .click();
    await answerDialog(page);
    await expect(page.locator('table.list tbody tr', { hasText: 'Fransızca' })).toHaveCount(0);

    await openSetup(page, 'Öğretmenler');
    const options = await page
      .getByLabel('Branş', { exact: true })
      .locator('option')
      .allInnerTexts();
    expect(options).not.toContain('Fransızca');
    expect(options).toContain('Matematik');
  });

  test('yapıştırılan listedeki yeni branş okul listesine giriyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Öğretmenler');

    await page.getByRole('button', { name: "Excel'den yapıştır" }).click();
    await page
      .locator('textarea')
      .fill('Kerem Aslan\tKA\tRobotik\nSelin Demir\tSD\tAstronomi');
    await page.getByRole('button', { name: 'Önizle' }).click();
    await page.getByRole('button', { name: /2 satırı ekle/ }).click();

    await expect(page.getByLabel('KA branşı')).toHaveValue('Robotik');
    await openSettings(page, 'Branşlar');
    await expect(page.locator('table.list tbody tr', { hasText: 'Robotik' })).toHaveCount(1);
    await expect(page.locator('table.list tbody tr', { hasText: 'Astronomi' })).toHaveCount(1);
  });
});

// ---------------------------------------------------------------------------
// The editing paths. Adding and deleting were covered; CHANGING something was
// not — and every box here is `defaultValue` + `onBlur`, a deliberate choice
// (pitfall 3) whose wiring nothing was checking.

test.describe('30. Kurulum — düzenleme', () => {
  test('derslik adı değiştirilebiliyor ve sınıflarda görünüyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');

    const first = page.locator('table.list tbody tr').first();
    await first.locator('input').fill('Z');
    await first.locator('input').blur();
    await expect(first.locator('input')).toHaveValue('Z');

    await openSetup(page, 'Sınıflar');
    await expect(page.getByLabel('410 dersliği')).toContainText('Z');
  });

  test('öğretmenin adı, kısaltması ve branşı değiştirilebiliyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    const row = page.locator('table.list tbody tr').first();

    await row.locator('input[type=text]').first().fill('Yeni Ad');
    await row.locator('input[type=text]').first().blur();
    await row.locator('input[type=text]').nth(1).fill('YA');
    await row.locator('input[type=text]').nth(1).blur();
    // The label follows the short form, which the line above just changed.
    await row.getByLabel('YA branşı').selectOption('Fizik');

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.getByRole('rowheader', { name: 'YA Fizik' })).toBeVisible();
  });

  test('öğretmen sınırı: boş kutu okul varsayılanını kullanıyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Kurallar');
    const rule = page.locator('table.list tr', { hasText: 'Öğretmen art arda en fazla' });
    await rule.locator('input[type=number]').fill('3');
    await rule.locator('input[type=number]').blur();

    await openSetup(page, 'Öğretmenler');
    // Row 1, not row 0: the sample gives every third teacher a limit of their
    // own, and an overridden box would not show the default at all.
    const box = page.locator('table.list tbody tr').nth(1).locator('input[type=number]').first();
    // Empty means "use the school default", and the default is shown as the
    // placeholder so an empty box still says what it will do.
    await expect(box).toHaveValue('');
    await expect(box).toHaveAttribute('placeholder', '3');

    await box.fill('1');
    await box.blur();
    await expect(box).toHaveValue('1');

    await box.fill('');
    await box.blur();
    await expect(box).toHaveValue('');
    await expect(box).toHaveAttribute('placeholder', '3');
  });

  test('sınıfın adı ve dersliği değiştirilebiliyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    const row = page.locator('table.list tbody tr').first();

    await row.locator('input[type=text]').fill('999');
    await row.locator('input[type=text]').blur();
    await page.getByLabel('999 dersliği').selectOption({ label: 'B' });

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    await expect(page.locator('tbody .row-head', { hasText: '999' })).toContainText('B dersliği');
  });

  test('dersin haftalık saati ve blok boyu değiştirilebiliyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Dersler');
    const row = page.locator('table.list tbody tr').first();
    const numbers = row.locator('input[type=number]');

    await numbers.nth(0).fill('6');
    await numbers.nth(0).blur();
    await numbers.nth(1).fill('3');
    await numbers.nth(1).blur();

    await expect(numbers.nth(0)).toHaveValue('6');
    await expect(numbers.nth(1)).toHaveValue('3');

    // The pool counter reads off the same numbers.
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('.pool-card .counter').first()).toContainText('/');
  });

  test('boş adla ekleme yapılamıyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    const add = page.getByRole('button', { name: 'Ekle', exact: true });
    await expect(add).toBeDisabled();

    await page.getByPlaceholder('Derslik adı, örn. A').fill('   ');
    await expect(add).toBeDisabled();
  });

  test('Enter ile ekleniyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    await page.getByPlaceholder('Derslik adı, örn. A').fill('Q');
    await page.getByPlaceholder('Derslik adı, örn. A').press('Enter');
    await expect(mainList(page).locator('tbody tr')).toHaveCount(1);
  });

  test('yerleşimi olan dersi silmek ne kaybedileceğini sayıyor', async ({ page }) => {
    await openWithSample(page);
    const { dragAndDrop } = await import('./helpers');
    await dragAndDrop(page);

    await openSetup(page, 'Dersler');
    await mainList(page).locator('tbody tr').first().getByRole('button', { name: 'Sil' }).click();
    expect(await answerDialog(page, 'cancel')).toContain('silinecek');
  });
});

test.describe('31. Kurulum — sağ sütun', () => {
  test('derslik adımında derslik yükü ve hangi sınıflar yazıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');

    const side = page.locator('.cols aside');
    await expect(side).toContainText('Derslik yükü');
    await expect(side).toContainText('Hangi sınıflar');
    await expect(side.locator('table.stat tbody tr')).toHaveCount(8);
  });

  test('öğretmen adımında yük ve branş dağılımı yazıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    const side = page.locator('.cols aside');
    await expect(side).toContainText('Öğretmen yükü');
    await expect(side).toContainText('Branşlar');
    await expect(side.locator('table.stat tbody tr')).toHaveCount(25);
  });

  test('dersliksiz sınıf sağ sütunda uyarı çıkarıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    await page.getByLabel('410 dersliği').selectOption({ label: 'Derslik yok' });

    await openSetup(page, 'Derslikler');
    await expect(page.locator('.cols aside .warn-box')).toContainText('dersliği yok');
  });

  test('dersi olmayan sınıf ders adımında sayılıyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Sınıflar');
    await page.getByPlaceholder(/Sınıf adı/).fill('700');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    await openSetup(page, 'Dersler');
    await expect(page.locator('.cols aside .warn-box')).toContainText('hiç dersi yok');
  });
});

// THE SHAPE OF A PANEL, asked for by name: "başlık, açıklama, ekleme ve
// sonrasında liste. bu mantığı her yer için uygula."
//
// Four steps that hold the same kind of thing should not be laid out three
// different ways. Before this, `Sınıflar` was the only one of the four with no
// description at all, `Okul ve günler` was the only panel in the app that put
// its form ABOVE its explanation, and `Planlar` was the only "list + add" that
// put the form BELOW the list.
//
// This measures ORDER, not geometry: it is a rule about what a reader meets
// first, and it survives any amount of restyling. The layout measurements
// deleted in the D round were the other kind.
test.describe('44. Panel simetrisi', () => {
  /** The tag/class sequence a panel actually renders, top to bottom. */
  async function shapeOf(page: Page, panel: string) {
    return page.locator(panel).first().evaluate((el) =>
      [...el.children]
        .map((c) => {
          if (c.tagName === 'H2') return 'baslik';
          if (c.tagName === 'P' && c.classList.contains('hint')) return 'aciklama';
          if (c.classList.contains('warn-box')) return 'uyari';
          if (c.classList.contains('form-row')) return 'ekleme';
          if (c.tagName === 'TABLE') return 'liste';
          return '';
        })
        .filter(Boolean),
    );
  }

  for (const step of ['Derslikler', 'Öğretmenler', 'Sınıflar', 'Dersler']) {
    test(`Kurulum → ${step}: başlık, açıklama, ekleme, liste`, async ({ page }) => {
      await openWithSample(page);
      await openSetup(page, step);
      const shape = await shapeOf(page, '.panel.step-panel');

      // The first three are the contract. What follows them (search strip,
      // "no match" line, the table) is the list, and only its ORDER is fixed.
      expect(shape.slice(0, 3), `${step} sırası`).toEqual(['baslik', 'aciklama', 'ekleme']);
      expect(shape.indexOf('liste'), `${step}: liste eklemeden önce`).toBeGreaterThan(
        shape.indexOf('ekleme'),
      );
    });
  }

  test('Ayarlar → Okul: açıklama formdan ÖNCE', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul');
    const shape = await shapeOf(page, '.cols > div > .panel');
    expect(shape.slice(0, 3)).toEqual(['baslik', 'aciklama', 'ekleme']);
  });

  test('Ayarlar → Veri: yeni plan formu listenin ÜSTÜNDE', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Veri');
    const plans = page.locator('.panel', { hasText: 'Yeni plan' }).first();
    const order = await plans.evaluate((el) => {
      const kids = [...el.children];
      return {
        form: kids.findIndex((c) => c.classList.contains('form-row')),
        table: kids.findIndex((c) => c.tagName === 'TABLE'),
      };
    });
    expect(order.form).toBeGreaterThan(-1);
    expect(order.table).toBeGreaterThan(-1);
    expect(order.form, 'ekleme formu listenin altında kalmış').toBeLessThan(order.table);
  });
});
