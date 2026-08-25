// The Kurulum tab: four countable steps, the paste box, and the subject list
// they feed.

import { expect, test, type Page } from '@playwright/test';
import { open, openWithSample, openSetup, openSettings, dragAndDrop } from './helpers';

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

    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();

    await expect(page.locator('.step', { hasText: 'Derslikler' })).toContainText('8');
    await expect(page.locator('.step', { hasText: 'Öğretmenler' })).toContainText('25');
    await expect(page.locator('.step', { hasText: 'Sınıflar' })).toContainText('20');
    await expect(page.locator('.step', { hasText: 'Dersler' })).toContainText('99');

    // Kurulum is now FOUR steps: the school's own settings moved to Ayarlar
    await expect(page.locator('.steps .step')).toHaveCount(4);
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
    // ...and "next step" is only a shortcut
    await openSetup(page, 'Sınıflar');
    await page.getByRole('button', { name: /Sonraki adım: Dersler/ }).click();
    await expect(page.locator('.step[aria-current="true"]')).toContainText('Dersler');
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
    const before = await page.locator('table.list tbody tr').count();
    let asked = '';
    page.once('dialog', (d) => {
      asked = d.message();
      return d.dismiss(); // cancelled -> nothing may change
    });
    await page.locator('table.list tbody tr').first().getByRole('button', { name: 'Sil' }).click();
    await expect.poll(() => asked).toContain('dersliği silinecek');
    expect(asked).toContain('sınıfın dersliği boşalacak');
    expect(asked).toContain('çakışması artık kontrol edilmeyecek');
    await expect(page.locator('table.list tbody tr')).toHaveCount(before);

    // Confirmed, it goes
    page.once('dialog', (d) => d.accept());
    await page.locator('table.list tbody tr').first().getByRole('button', { name: 'Sil' }).click();
    await expect(page.locator('table.list tbody tr')).toHaveCount(before - 1);
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

    await page.getByRole('button', { name: 'Program' }).click();
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
    await expect(page.locator('table.list tbody tr')).toHaveCount(1);
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

    let said = '';
    page.once('dialog', (d) => {
      said = d.message();
      void d.dismiss();
    });
    await page
      .locator('table.list tbody tr', { hasText: 'Matematik' })
      .getByRole('button', { name: 'Sil' })
      .click();

    expect(said).toContain('öğretmen bu branşta');
    expect(said).toContain('Önce onların branşını değiştirin');
    await expect(page.locator('table.list tbody tr', { hasText: 'Matematik' })).toHaveCount(1);
  });

  test('kullanılmayan branş listeden çıkarılıyor ve açılır listede kalmıyor', async ({
    page,
  }) => {
    await open(page);
    await openSettings(page, 'Branşlar');

    page.once('dialog', (d) => d.accept());
    await page
      .locator('table.list tbody tr', { hasText: 'Fransızca' })
      .getByRole('button', { name: 'Sil' })
      .click();
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
