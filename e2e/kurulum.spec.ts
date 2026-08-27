// The Kurulum tab: four countable steps, the paste box, and the subject list
// they feed.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { open, openWithSample, openSetup, openSettings, dragAndDrop, mainList, answerDialog, chooseScale } from './helpers';

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
          // The list lives in a scroll box now (eleven columns do not fit a
          // 100%-wide table at 150%), so "the list" is either shape.
          if (c.tagName === 'TABLE') return 'liste';
          if (c.classList.contains('table-scroll')) return 'liste';
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

// 63. Gender on a teacher.
//
// Asked for in one line: "Öğretmende cinsiyet". Stored as `gender: '' | 'k' |
// 'e'` and bumped the schema to 6 — the migration itself is unit-tested in
// `src/store.test.ts`, so what belongs here is the round trip through a real
// control and the two places the reader was promised it would be useful:
// the sort menu and the chip row.
//
// It deliberately does NOT reach the paper. Nobody asked for a form of address
// on a timetable, and a printed sheet is the last place to guess at one.
test.describe('63. Öğretmende cinsiyet', () => {
  const row = (page: Page, n: number) =>
    mainList(page).locator('tbody tr').nth(n);

  test('seçilen cinsiyet YENİLEMEDEN sonra da duruyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    // Mehmet Çelik ships as "Erkek"; İlknur Aydın as "Kadın".
    const first = row(page, 0).locator('select').nth(1);
    await expect(first).toHaveValue('e');

    await first.selectOption('k');
    await page.reload();
    await openSetup(page, 'Öğretmenler');
    await expect(row(page, 0).locator('select').nth(1)).toHaveValue('k');
  });

  test('belirtilmemiş de bir DEĞER — boş bırakılabiliyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    const box = row(page, 0).locator('select').nth(1);
    await box.selectOption('');
    await expect(box).toHaveValue('');

    // And it is not only reachable, it is SHIPPED: "Deniz" is genuinely both,
    // so the sample carries the blank the real staff list will carry.
    await page.getByLabel('öğretmen ara').fill('Deniz Erdem');
    await expect(mainList(page).locator('tbody tr')).toHaveCount(1);
    await expect(row(page, 0).locator('select[aria-label*="cinsiyeti"]')).toHaveValue('');
  });

  test('çip satırı süzüyor — Branş’ın YANINDA, yerine değil', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    const rows = mainList(page).locator('tbody tr');
    await expect(rows).toHaveCount(25);

    const women = page.getByRole('button', { name: /^Kadın/ });
    await expect(women).toBeVisible();
    await women.click();
    await expect(rows).toHaveCount(11);

    // Both chip rows exist and NARROW together rather than replacing each other.
    await page.getByRole('button', { name: /^Matematik/ }).first().click();
    const both = await rows.count();
    expect(both).toBeGreaterThan(0);
    expect(both).toBeLessThan(11);

    await page.getByRole('button', { name: 'Süzmeyi kaldır' }).click();
    await expect(rows).toHaveCount(25);
  });

  test('cinsiyete göre sıralama gerçekten sıralıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    await page.getByLabel('Sırala').selectOption({ label: 'Cinsiyete göre' });

    const values = await mainList(page)
      .locator('tbody tr td select[aria-label*="cinsiyeti"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLSelectElement).value));
    // Turkish order of the LABELS: Belirtilmemiş, Erkek, Kadın.
    expect(values).toEqual([...values].sort((a, b) => {
      const label = (v: string) =>
        v === '' ? 'Belirtilmemiş' : v === 'e' ? 'Erkek' : 'Kadın';
      return label(a).localeCompare(label(b), 'tr');
    }));
  });

  test('Kurulum özeti dağılımı SAYIYOR', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    const summary = page.locator('.panel', { hasText: 'Öğretmen yükü' });
    await expect(summary).toContainText('Kadın');
    await expect(summary).toContainText('Erkek');
    await expect(summary).toContainText('Belirtilmemiş');
  });

  test('yapıştırma kutusu dördüncü sütunu okuyor, üç sütunluyu da kabul ediyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    await page.getByRole('button', { name: "Excel'den yapıştır" }).click();
    await expect(page.getByText('Ad Soyad · Kısaltma · Branş · Cinsiyet')).toBeVisible();

    await page.locator('textarea').fill('Nazlı Er\tNE\tFizik\tKadın\nOkan Su\tOS\tKimya');
    await page.getByRole('button', { name: 'Önizle' }).click();
    await expect(page.getByText('2 satır okundu.')).toBeVisible();
    // Scoped to the preview: the textarea still holds the pasted text and
    // would match the same words.
    const preview = page.locator('.paste-preview li');
    await expect(preview.first()).toHaveText('Nazlı Er (NE) · Fizik · Kadın');
    // The three-column row is not an error, and says nothing it does not know.
    await expect(preview.nth(1)).toHaveText('Okan Su (OS) · Kimya');
  });

  // Pitfall 33's shape, and it happened again while this column was being
  // added: the box showed "Belirtilm" in the add form and "Erke" in the row.
  // The assertion does not invent a number — it clones the control at
  // `width: auto` and asks the browser what IT wants (renk-secici.spec.ts).
  for (const pct of [100, 125, 150]) {
    test(`cinsiyet kutusu %${pct} ölçekte kendi metnini SIĞDIRIYOR`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, 'Öğretmenler');

      for (const box of [
        mainList(page).locator('select[aria-label*="cinsiyeti"]').first(),
        // Scoped to the add form: the chip row is a `role="group"` with the
        // same name, and both are things you can address by that label.
        page.locator('.form-row select[aria-label="Cinsiyet"]'),
      ]) {
        const fit = await box.evaluate((el) => {
          const s = el as HTMLSelectElement;
          const clone = s.cloneNode(true) as HTMLSelectElement;
          clone.style.width = 'auto';
          clone.style.position = 'absolute';
          clone.style.visibility = 'hidden';
          s.parentElement!.appendChild(clone);
          const want = clone.getBoundingClientRect().width;
          clone.remove();
          return { have: s.getBoundingClientRect().width, want };
        });
        expect(fit.have, `%${pct}: kutu ${fit.have} < istenen ${fit.want}`).toBeGreaterThanOrEqual(
          fit.want - 1,
        );
      }
    });
  }

  // The regression this column caused and the scroll box fixed: at 150% the
  // name input went from 232 px to 26 px, because a `width: 100%` table takes
  // the room it needs from whichever column can still shrink.
  for (const pct of [100, 150]) {
    test(`%${pct} ölçekte AD kutusu okunur kalıyor, sayfa yatay taşmıyor`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, 'Öğretmenler');

      const ad = await mainList(page)
        .locator('tbody tr td > input[type="text"]:not(.text-sm)')
        .first()
        .evaluate((el) => el.getBoundingClientRect().width);
      expect(ad, `%${pct}: ad kutusu ${ad}px`).toBeGreaterThan(120);

      // The width goes somewhere: the TABLE scrolls, the page does not.
      const spill = await page.evaluate(
        () => document.body.scrollWidth - document.body.clientWidth,
      );
      expect(spill).toBeLessThanOrEqual(1);
    });
  }

  test('cinsiyet KÂĞIDA çıkmıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır', exact: true }).click();
    await page.getByRole('button', { name: 'Öğretmenler', exact: true }).click();
    await expect(page.locator('.print-page').first()).toBeVisible();
    const paper = await page.locator('.print-area').innerText();
    expect(paper).not.toMatch(/Kadın|Erkek|Belirtilmemiş/);
  });
});

// THE FOUR LISTS, MEASURED — three complaints, three numbers.
//
// All three were reported by the reader looking at the screen, and all three
// turned out to be measurable to the pixel. They are here rather than in a
// styling note because none of them can be seen by jsdom and none of them
// changes a single word, attribute or count: the suite was green through all
// of it (pitfall 33's family).
test.describe('65. Kurulum listelerinin ölçüleri', () => {
  const STEPS = ['Derslikler', 'Öğretmenler', 'Sınıflar', 'Dersler'];

  /** How far the row's delete button ends from the table's right edge. */
  async function deleteInset(page: Page) {
    return mainList(page)
      .locator('tbody tr')
      .first()
      .evaluate((tr) => {
        const table = tr.closest('table')!;
        const btn = tr.querySelector('td:last-child .btn.danger')!;
        return Math.round(
          table.getBoundingClientRect().right - btn.getBoundingClientRect().right,
        );
      });
  }

  // Dersler holds ONE button in its action cell; the other three hold two
  // (inspect + Sil). The column was left-aligned, so in the other three the
  // pair filled it and Sil landed on the edge, while in Dersler the single
  // button sat with dead space after it: measured 42 px at 100 % and 73 px at
  // 150 %, against 6 to 19 px elsewhere. Same markup, different answer,
  // because the alignment came from a neighbour instead of from a rule.
  test('Sil dört listede de aynı yerde — en sağda', async ({ page }) => {
    await openWithSample(page);
    const inset: Record<string, number> = {};
    for (const step of STEPS) {
      await openSetup(page, step);
      inset[step] = await deleteInset(page);
    }
    const values = Object.values(inset);
    for (const step of STEPS) {
      expect(inset[step], `${step}: Sil sağ kenardan ${inset[step]}px içeride`).toBeLessThanOrEqual(
        14,
      );
    }
    // ...and the same distance in all four, which is the part that reads as
    // "one program" rather than four screens that happen to look alike.
    expect(Math.max(...values) - Math.min(...values), JSON.stringify(inset)).toBeLessThanOrEqual(4);
  });

  // The teacher list is eleven columns wide and it did not fit: 106 px of
  // sideways scroll at the DEFAULT scale, in a panel that had 200 px of white
  // space three centimetres to its right, because Kurulum gave its sidebar
  // `1fr` of 1920. The sidebar is now bounded and four columns were trimmed to
  // what the browser says they need.
  for (const pct of [100, 110, 125]) {
    test(`%${pct} ölçekte hiçbir liste YANA kaymıyor`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 110) await chooseScale(page, pct);
      for (const step of STEPS) {
        await openSetup(page, step);
        const spill = await page
          .locator('.cols > div .table-scroll')
          .evaluate((el) => Math.round(el.scrollWidth - el.clientWidth));
        expect(spill, `%${pct} ${step}: ${spill}px taşma`).toBe(0);
      }
    });
  }

  // 110 % is the default the reader actually uses; 150 % is the case the
  // scroll box exists for, and the rule there is unchanged — the TABLE
  // scrolls, the page never does.
  test('%150’de taşma tabloda kalıyor, sayfada değil', async ({ page }) => {
    await openWithSample(page);
    await chooseScale(page, 150);
    await openSetup(page, 'Öğretmenler');
    const m = await page.evaluate(() => ({
      box: (() => {
        const el = document.querySelector('.cols > div .table-scroll') as HTMLElement;
        return Math.round(el.scrollWidth - el.clientWidth);
      })(),
      page: Math.round(document.body.scrollWidth - document.body.clientWidth),
    }));
    expect(m.box, 'kaydırma kutusu bu ölçekte iş görmeli').toBeGreaterThan(0);
    expect(m.page).toBeLessThanOrEqual(1);
  });

  // The strip and the table were 44 px apart at the default scale, and almost
  // all of it was an EMPTY announcement line holding `min-height: 1.2em` open
  // for a sentence that is there for about a second after a keypress.
  for (const pct of [100, 150]) {
    test(`%${pct}: arama şeridiyle liste arasında boşluk kalmıyor`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, 'Öğretmenler');
      const gap = await page.evaluate(() => {
        const tools = document.querySelector('.cols > div .list-tools') as HTMLElement;
        const table = document.querySelector('.cols > div table.list') as HTMLElement;
        // The last child of the strip that actually PAINTS something. An empty
        // box between the chips and the table is exactly what this measures.
        const seen = ([...tools.children] as HTMLElement[]).filter(
          (k) => k.getBoundingClientRect().height > 0 && (k.textContent ?? '').trim() !== '',
        );
        const last = seen[seen.length - 1]!;
        return Math.round(
          table.getBoundingClientRect().top - last.getBoundingClientRect().bottom,
        );
      });
      // 44 px before, at 100 %. A strip and the table it belongs to are one
      // thing; the gap should read as a gutter, not as a missing paragraph.
      expect(gap, `%${pct}: ${gap}px`).toBeLessThanOrEqual(16);
    });
  }

  // ...and it still SAYS what happened. The announcement did not go quiet, it
  // moved onto the strip's own row, where an empty one costs no height.
  test('duyuru satırı boşken yer kaplamıyor, doluyken okunuyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');
    const said = page.locator('.list-tools .list-said');
    expect(
      await said.evaluate((el) => Math.round(el.getBoundingClientRect().height)),
    ).toBe(0);

    await mainList(page).locator('tbody .row-grip').first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(said).toHaveText(/2\. sıraya taşındı/);
    expect(await said.evaluate((el) => el.getAttribute('role'))).toBe('status');
  });

  // THE GUARD ON THE TRIM. Four widths came down and every one of them was set
  // from what the browser asked for, not from taste — so the assertion asks
  // the browser the same question: clone the control at `width: auto` and
  // compare. Written the day the widths changed, and run at the two scales
  // where a `ch` count and a font's quantisation disagree most (pitfall 39).
  for (const pct of [100, 150]) {
    test(`%${pct}: kırpılan kutuların hiçbiri metnini kesmiyor`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, 'Öğretmenler');

      const boxes = await mainList(page)
        .locator('tbody tr')
        .first()
        .evaluate((tr) => {
          function want(el: HTMLElement) {
            const c = el.cloneNode(true) as HTMLElement;
            c.style.width = 'auto';
            c.style.minWidth = '0';
            c.style.position = 'absolute';
            c.style.visibility = 'hidden';
            el.parentElement!.appendChild(c);
            const w = c.getBoundingClientRect().width;
            c.remove();
            return w;
          }
          const out: Array<{ ad: string; var: number; istenen: number }> = [];
          for (const [ad, sel] of [
            ['renk', '.color-pick'],
            ['sayı kutusu', 'input.num'],
            ['cinsiyet', 'select[aria-label*="cinsiyeti"]'],
            ['eylemler', 'td:last-child > .form-row'],
          ] as const) {
            const el = tr.querySelector(sel) as HTMLElement | null;
            if (el !== null)
              out.push({ ad, var: el.getBoundingClientRect().width, istenen: want(el) });
          }
          return out;
        });

      expect(boxes.length, 'ölçülecek kutu bulunamadı').toBe(4);
      for (const b of boxes) {
        expect(
          b.var,
          `%${pct} ${b.ad}: kutu ${Math.round(b.var)} < istenen ${Math.round(b.istenen)}`,
        ).toBeGreaterThanOrEqual(b.istenen - 1);
      }
    });
  }

  // The short-form box is the one that got narrowest, and it is narrowed ONLY
  // inside a row: the add form's box carries the placeholder "Kısaltma", a
  // whole word, and shrinking that one would be pitfall 33 with a new coat on.
  test('kısaltma kutusu satırda dar, ekleme formunda geniş', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');
    const inRow = await mainList(page)
      .locator('tbody tr input.text-sm')
      .first()
      .evaluate((el) => el.getBoundingClientRect().width);
    const inForm = await page
      .locator('.panel.step-panel > .form-row input.text-sm')
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(inRow).toBeLessThan(inForm);
    // The add box has to hold its own placeholder, whatever it happens to be.
    const fits = await page
      .locator('.panel.step-panel > .form-row input.text-sm')
      .evaluate((el) => {
        const s = el as HTMLInputElement;
        const probe = document.createElement('span');
        probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
        probe.style.font = getComputedStyle(s).font;
        probe.textContent = s.placeholder;
        document.body.appendChild(probe);
        const need = probe.getBoundingClientRect().width;
        probe.remove();
        return { have: s.clientWidth, need };
      });
    expect(
      fits.have,
      `ekleme kutusu ${Math.round(fits.have)} < "${'Kısaltma'}" ${Math.round(fits.need)}`,
    ).toBeGreaterThanOrEqual(fits.need);
  });
});

// 67. The split: how a week's hours fall into blocks.
//
// Asked for by name, with aSc's own screen as the reference: the box for
// "Lessons/week" and a dropdown beside it saying how those hours are shaped.
// Before v7 there was one block LENGTH per lesson, so "3 saat" could only be
// 1+1+1 or a single 3-hour block — never 2+1 — and a 5-hour lesson in doubles
// lost its fifth hour for good.
test.describe('67. Ders dağılımı', () => {
  const splitPick = (page: Page) =>
    page.locator('.cols > div table.list tbody tr').first().locator('select.split-pick');

  /** The new-lesson row's own two boxes. */
  const newHours = (page: Page) => page.locator('.form-row input[type="number"].num').first();
  const newSplit = (page: Page) => page.locator('.form-row select.split-pick').first();

  test('haftalık saat ne ise dağılım seçenekleri odur', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Dersler');

    await newHours(page).fill('3');
    await expect(newSplit(page).locator('option')).toHaveText(['1+1+1', '2+1']);

    await newHours(page).fill('5');
    await expect(newSplit(page).locator('option')).toHaveText([
      '1+1+1+1+1',
      '2+1+1+1',
      '2+2+1',
    ]);

    // Three-hour blocks left with v7: every part is a 1 or a 2.
    await newHours(page).fill('6');
    for (const label of await newSplit(page).locator('option').allInnerTexts()) {
      expect(label.split('+').every((x) => x === '1' || x === '2'), label).toBe(true);
    }
  });

  test('seçilen dağılım kaydediliyor ve saat düşünce kırpılıyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Dersler');

    const row = page.locator('table.list tbody tr').first();
    const hours = row.locator('input[type="number"].num').first();
    await hours.fill('6');
    await hours.blur();
    await splitPick(page).selectOption({ label: '2+2+2' });
    await expect(splitPick(page)).toHaveValue('3');

    // Lower the total and the shape has to come with it — there is no room for
    // three doubles in three hours.
    await hours.fill('3');
    await hours.blur();
    await expect(splitPick(page)).toHaveValue('1');
    await expect(splitPick(page).locator('option:checked')).toHaveText('2+1');

    await page.reload();
    await openSetup(page, 'Dersler');
    await expect(splitPick(page).locator('option:checked')).toHaveText('2+1');
  });

  test('havuzda her blok AYRI kart ve kaç saat olduğunu söylüyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Dersler');

    const row = page.locator('table.list tbody tr').first();
    const name = (await row.locator('td').nth(2).innerText()).trim();
    const hours = row.locator('input[type="number"].num').first();
    await hours.fill('3');
    await hours.blur();
    await splitPick(page).selectOption({ label: '2+1' });

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    const mine = page.locator('.pool-card', { hasText: name.split('·')[0]!.trim() });
    // Two cards for one lesson: a double and a single, and they say which.
    const own = mine.filter({ hasText: '0/3' });
    await expect(own).toHaveCount(2);
    await expect(own.filter({ has: page.locator('[data-size="2"]') }).or(own)).not.toHaveCount(0);
    expect(await own.first().getAttribute('data-size')).toBe('2');
    expect(await own.last().getAttribute('data-size')).toBe('1');
    await expect(own.first()).toContainText('2 saat');
    await expect(own.last()).toContainText('1 saat');
  });

  // Pitfall 33 again, and it DID happen while this box was being added: at 150 %
  // a fixed-width picker drew "1+1+1+1+" and the rest was simply gone — the
  // value was right, every test was green, and it could not be read. The
  // labels grow with the hours, so the box carries a character COUNT taken from
  // the longest one it holds. The assertion invents no number: it clones the
  // control at `width: auto` and asks the browser what IT wants.
  for (const pct of [100, 125, 150]) {
    test(`dağılım kutusu %${pct} ölçekte kendi metnini SIĞDIRIYOR`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, 'Dersler');

      // A long week, so the longest label this box can ever hold is on screen.
      const hours = mainList(page)
        .locator('tbody tr')
        .first()
        .locator('input[type="number"].num')
        .first();
      await hours.fill('11');
      await hours.blur();

      for (const box of [splitPick(page), page.locator('.form-row select.split-pick')]) {
        const fit = await box.evaluate((el) => {
          const s = el as HTMLSelectElement;
          const clone = s.cloneNode(true) as HTMLSelectElement;
          clone.style.width = 'auto';
          clone.style.position = 'absolute';
          clone.style.visibility = 'hidden';
          s.parentElement!.appendChild(clone);
          const want = clone.getBoundingClientRect().width;
          clone.remove();
          return { have: s.getBoundingClientRect().width, want };
        });
        expect(fit.have, `%${pct}: kutu ${fit.have} < istenen ${fit.want}`).toBeGreaterThanOrEqual(
          fit.want - 1,
        );
      }
    });
  }

  // The hour that used to be lost. One block length meant 3 hours in doubles
  // was floor(3 / 2) = 1 block and the third hour could never be placed;
  // "2+1" asks for all three and the solver has to place blocks of two
  // different lengths for one lesson to give them.
  test('2+1 dersin ÜÇ saati de diziliyor — kaybolan saat yok', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Dersler');

    const row = page.locator('table.list tbody tr').first();
    const hours = row.locator('input[type="number"].num').first();
    await hours.fill('3');
    await hours.blur();
    await splitPick(page).selectOption({ label: '2+1' });
    const name = (await row.locator('td').nth(2).innerText()).trim().split('·')[0]!.trim();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('.pool-card', { hasText: name }).first()).toBeVisible();

    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 60_000 });

    // Nothing of this lesson is left in the tray: both its blocks went down.
    await expect(page.locator('.pool-card', { hasText: '/3' })).toHaveCount(0);
  });
});
