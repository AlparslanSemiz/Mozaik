// The Ayarlar tab: days, the bell, the four rules, subjects and data.

import { expect, test, type Page } from '@playwright/test';
import { open, openWithSample, openSetup, openSettings, startDrag, dragAndDrop, openFixture, hover } from './helpers';

test.describe('6. Gün ve ders saatleri', () => {
  test('varsayılan hafta Pazartesisiz 6 gün ve Salı ile başlıyor', async ({ page }) => {
    await openWithSample(page);
    await expect(page.locator('.day-head')).toHaveCount(6);
    await expect(page.locator('.day-head').first()).toHaveText('Salı');
    await expect(page.locator('.day-head')).not.toContainText(['Pazartesi']);
  });

  test('gün eklenince yerleşmiş ders KAYMAZ, sadece bir sağa taşınır', async ({ page }) => {
    // The trap this guards against: placement keys hold the day INDEX, so
    // adding Monday at the front would leave every lesson looking a day early.
    await openWithSample(page);
    const placed = await dragAndDrop(page);
    const day = Number(placed.day);
    const hour = Number(placed.hour);

    await openSettings(page, 'Okul ve zil');
    await page.getByLabel('Pazartesi', { exact: true }).check();

    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('.day-head')).toHaveCount(7);
    await expect(page.locator('.day-head').first()).toHaveText('Pazartesi');

    // Same lesson, same hour, one day further right — not on Monday.
    const moved = page.locator(
      `tr[class] td[data-row="${placed.row}"][data-day="${day + 1}"][data-hour="${hour}"] .card`,
    );
    await expect(moved).toHaveCount(1);
    await expect(
      page.locator(`td[data-row="${placed.row}"][data-day="0"] .card`),
    ).toHaveCount(0);
  });

  test('zil saatleri ızgarada ve önizlemede görünüyor, ayar değişince ikisi de değişiyor', async ({
    page,
  }) => {
    await openWithSample(page);
    // 09:00 start, 40 min lessons, 10 min breaks -> the 2nd lesson is at 09:50.
    const header = page.locator('table.grid thead tr').nth(1);
    await expect(header).toContainText('09:00');
    await expect(header).toContainText('09:50');

    await openSettings(page, 'Okul ve zil');
    const preview = page.locator('table.bell-preview');
    await expect(preview).toContainText('09:00–09:40');
    // Weekdays break after the 5th, the weekend after the 6th: 13:30 vs 13:10.
    await expect(preview).toContainText('13:30–14:10');
    await expect(preview).toContainText('13:10–13:50');
    // Both patterns still end at 19:10 — there is exactly one long break.
    await expect(preview.locator('tbody tr').last()).toContainText('19:10');

    const lengthBox = page.getByLabel('Ders (dk)');
    await lengthBox.fill('45');
    await lengthBox.blur();
    await expect(preview).toContainText('09:00–09:45');

    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid thead tr').nth(1)).toContainText('09:55');
  });
});

// ---------------------------------------------------------------------------
// 15. The Ayarlar tab
//
// Kurulum used to hold two different kinds of thing: the four lists you build
// up while entering a term, and the school's own settings you touch once a
// year. Those settings now have their own tab. What is tested here is not that
// the panels render — jsdom would do — but that the move did not break the
// wiring: a setting changed in Ayarlar must still reach the grid, and the one
// button that cannot be undone must no longer sit next to a button used daily.

test.describe('15. Ayarlar sekmesi', () => {
  test('altıncı sekme var ve dört bölümü açılıyor', async ({ page }) => {
    await open(page);
    await expect(page.locator('.tabs .tab')).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Ayarlar' })).toBeVisible();

    for (const [section, heading] of [
      ['Okul ve zil', 'Okul ve günler'],
      ['Kurallar', 'Kurallar'],
      ['Branşlar', /^Branşlar/],
      ['Veri', 'Veri'],
    ] as const) {
      await openSettings(page, section);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
  });

  test('Kurulum dört adıma indi, okul ayarları orada değil', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kurulum' }).click();

    const steps = await page.locator('.steps .step').allInnerTexts();
    expect(steps).toHaveLength(4);
    expect(steps.join(' ')).toContain('Derslikler');
    expect(steps.join(' ')).toContain('Dersler');
    expect(steps.join(' ')).not.toContain('Okul');
    expect(steps.join(' ')).not.toContain('Kurallar');
    expect(steps.join(' ')).not.toContain('Branşlar');
  });

  test('Ayarlar\'dan değişen zil saati ızgaraya geçiyor', async ({ page }) => {
    await openWithSample(page);
    const firstHour = page.locator('table.grid thead .hour-clock').first();
    await expect(firstHour).toHaveText('09:00');

    await openSettings(page, 'Okul ve zil');
    const lessonMinutes = page.getByLabel('Ders (dk)');
    await lessonMinutes.fill('45');
    await lessonMinutes.blur();

    await page.getByRole('button', { name: 'Program' }).click();
    // The second lesson moves: 09:00 + 45 + 10
    await expect(page.locator('table.grid thead .hour-clock').nth(1)).toHaveText('09:55');
  });

  test('Ayarlar\'dan değişen kural sürüklemeyi hemen etkiliyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Kurallar');
    await page
      .locator('table.list tr', { hasText: 'Öğretmen art arda en fazla' })
      .locator('input[type=number]')
      .fill('1');
    await page.getByRole('button', { name: 'Program' }).click();

    await startDrag(page);
    await hover(page, 0, 0);
    await page.mouse.up();
    await startDrag(page);
    const neighbour = await hover(page, 0, 1);
    await expect(neighbour).toHaveClass(/drop-blocked/);
    await page.keyboard.press('Escape');
  });

  test('renkleri yeniden dağıt düğmesi programı bozmadan renkleri düzeltiyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    const placed = await page.locator('table.grid .card').count();
    expect(placed).toBeGreaterThan(0);

    await openSettings(page, 'Veri');
    await page.getByRole('button', { name: /Öğretmen renklerini yeniden dağıt/ }).click();

    // The colours are still one per teacher, and the timetable is untouched.
    await openSetup(page, 'Öğretmenler');
    const colors = await page
      .locator('table.list tbody tr select[title="Renk"]')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(new Set(colors).size).toBe(colors.length);

    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(placed);
  });
});

// ---------------------------------------------------------------------------
// 17. The start-time picker
//
// <input type="time"> renders AM/PM or 24-hour according to the BROWSER's
// locale, which is not ours to decide, and it accepts any minute. It also had a
// trap: emptying the box blurred to "" and the whole school day silently began
// at 00:00.

test.describe('17. Başlangıç saati', () => {
  test('saat 24 saatlik ve dakika beşer beşer', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Okul ve zil');

    const hour = page.getByLabel('Başlangıç saati');
    const minute = page.getByLabel('Başlangıç dakikası');
    await expect(hour).toHaveJSProperty('tagName', 'SELECT');
    await expect(page.locator('input[type=time]')).toHaveCount(0);

    const hours = await hour.locator('option').allInnerTexts();
    expect(hours).toHaveLength(24);
    expect(hours[0]).toBe('00');
    expect(hours[9]).toBe('09');
    expect(hours[23]).toBe('23');
    expect(hours.join(' ')).not.toContain('AM');
    expect(hours.join(' ')).not.toContain('PM');

    const minutes = await minute.locator('option').allInnerTexts();
    expect(minutes).toEqual(['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']);
  });

  test('seçilen saat ızgaraya ve zil önizlemesine geçiyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul ve zil');

    await page.getByLabel('Başlangıç saati').selectOption('14');
    await page.getByLabel('Başlangıç dakikası').selectOption('35');
    await expect(page.locator('table.bell-preview')).toContainText('14:35–15:15');

    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid thead .hour-clock').first()).toHaveText('14:35');
  });

  test('boş bırakılıp 00:00\'a düşme tuzağı kalmadı', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul ve zil');
    // There is no empty option to choose, in either dropdown.
    for (const label of ['Başlangıç saati', 'Başlangıç dakikası']) {
      const values = await page.getByLabel(label).locator('option').evaluateAll((list) =>
        list.map((el) => (el as HTMLOptionElement).value),
      );
      expect(values).not.toContain('');
    }
    await expect(page.locator('table.bell-preview')).toContainText('09:00–09:40');
  });
});

test.describe('7. Sınıf müsaitliği ve kurallar', () => {
  test('sınıfın kapalı saatine ders bırakılamıyor ve sebebi yazıyor', async ({ page }) => {
    await openFixture(page);

    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await page.getByRole('button', { name: 'Sınıf', exact: true }).click();
    await expect(page.getByLabel('Müsaitlik listesi')).toHaveValue('s510');
    // row = 1st day, column = 1st hour (the axis was turned in v0.7)
    await page.locator('table.availability tbody tr').first().locator('td').first().click();
    await page.mouse.up();

    await page.getByRole('button', { name: 'Program' }).click();
    await startDrag(page);

    const closed = await hover(page, 0, 0);
    await expect(closed).toHaveClass(/drop-blocked/);
    await expect(page.locator('.reason-bar')).toContainText('510 sınıfı Salı 1 saatinde kapalı');

    const free = await hover(page, 0, 1);
    await expect(free).toHaveClass(/drop-ok/);
    await page.mouse.up();
  });

  test('derslik kapatılınca o dersliği kullanan sınıf da ders yapamıyor', async ({ page }) => {
    await openFixture(page);

    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await page.getByRole('button', { name: 'Derslik', exact: true }).click();
    await page.locator('table.availability tbody tr').first().locator('td').first().click();
    await page.mouse.up();

    await page.getByRole('button', { name: 'Program' }).click();
    await startDrag(page);
    await expect(await hover(page, 0, 0)).toHaveClass(/drop-blocked/);
    await expect(page.locator('.reason-bar')).toContainText('A dersliği Salı 1 saatinde kapalı');
    await page.mouse.up();
  });

  test('art arda sınırı: Engelle iken kırmızı, Uyar iken sarı ama bırakılabilir', async ({
    page,
  }) => {
    await openFixture(page);
    await openSettings(page, 'Kurallar');

    // "at most 1 in a row": the hour beside a placed lesson breaches it.
    const rule = page.locator('table.list tr', { hasText: 'Öğretmen art arda en fazla' });
    await rule.locator('input[type=number]').fill('1');
    await rule.locator('input[type=number]').blur();
    await rule.locator('select').selectOption('block');

    await page.getByRole('button', { name: 'Program' }).click();
    await startDrag(page);
    const first = await hover(page, 0, 0);
    await expect(first).toHaveClass(/drop-ok/);
    await page.mouse.up();
    await expect(page.locator('table.grid .card')).toHaveCount(1);

    await startDrag(page);
    const neighbour = await hover(page, 0, 1);
    await expect(neighbour).toHaveClass(/drop-blocked/);
    await expect(page.locator('.reason-bar')).toContainText(
      'MÇ art arda 1 saatten fazla girmemeli — burada 2 saat olur',
    );
    await page.keyboard.press('Escape');

    // The same situation at "Uyar": yellow, a reason, but it can still be dropped.
    await openSettings(page, 'Kurallar');
    await page
      .locator('table.list tr', { hasText: 'Öğretmen art arda en fazla' })
      .locator('select')
      .selectOption('warn');
    await page.getByRole('button', { name: 'Program' }).click();

    await startDrag(page);
    const again = await hover(page, 0, 1);
    await expect(again).toHaveClass(/drop-warn/);
    await expect(page.locator('.reason-bar.warn')).toContainText('art arda');
    await page.mouse.up();
    await expect(page.locator('table.grid .card')).toHaveCount(2);

    // What was allowed through is listed in Kontrol.
    await page.getByRole('button', { name: 'Kontrol' }).click();
    await expect(page.getByRole('heading', { name: /Kural ihlalleri/ })).toBeVisible();
    await expect(
      page.locator('.panel', { hasText: 'Kural ihlalleri' }),
    ).toContainText('MÇ Salı günü art arda 2 saat ders veriyor — en fazla 1 saat isteniyor.');
  });
});
