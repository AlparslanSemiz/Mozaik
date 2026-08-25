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
      ['Veri', /^Veri$/], // 'Veri' alone now also matches 'Veriler nerede'
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
      .locator('table.list tbody tr .color-pick')
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
    await expect(page.locator('.entity[aria-current="true"]')).toHaveAttribute(
      'data-id',
      's510',
    );
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

// ---------------------------------------------------------------------------
// Every field in Ayarlar. The most important one by far is removing a day:
// placement keys hold the day INDEX, so unticking a day in the middle of the
// week could quietly move a finished timetable — the worst bug this tool can
// have (pitfall 11). remapDays has unit tests; this is the browser proving it.

test.describe('32. Ayarlar — okul ve günler', () => {
  test('okul adı basılan sayfaya geçiyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul');
    const name = page.getByLabel(/Okul adı/);
    await name.fill('Semiz Kurs');
    await name.blur();

    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page h3').first()).toContainText('Semiz Kurs');
    // ...and into the top bar, which is where you see which file you are in.
    await expect(page.locator('.app-title')).toHaveText('Semiz Kurs');
  });

  test('ORTADAN gün çıkarılınca kalan günlerin dersleri KAYMIYOR', async ({ page }) => {
    await openWithSample(page);
    const spot = await dragAndDrop(page);
    // Only a lesson on a day AFTER the removed one can shift; pick accordingly.
    const dayName = await page
      .locator('table.grid thead .day-head')
      .nth(Number(spot.day))
      .textContent();

    await openSettings(page, 'Okul');
    // Çarşamba is the second teaching day: removing it re-indexes everything
    // after it.
    const row = page.locator('table.list tr', { hasText: 'Çarşamba' });
    await row.locator('input[type=checkbox]').uncheck();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    if (dayName === 'Çarşamba') {
      // Its own day went, so the lesson went with it. That is the honest result.
      await expect(page.locator('table.grid .card')).toHaveCount(0);
    } else {
      const cell = page.locator('table.grid td:has(.card)').first();
      const nowDay = await page
        .locator('table.grid thead .day-head')
        .nth(Number(await cell.getAttribute('data-day')))
        .textContent();
      expect(nowDay).toBe(dayName);
    }
  });

  test('gün eklenince ızgaraya bir sütun grubu ekleniyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul');
    await page
      .locator('table.list tr', { hasText: 'Pazartesi' })
      .locator('input[type=checkbox]')
      .check();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid thead .day-head')).toHaveCount(7);
    await expect(page.locator('table.grid thead .day-head').first()).toHaveText('Pazartesi');
  });

  test('günlük ders sayısı artırılınca ızgara büyüyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul');
    const count = page.getByLabel('Günlük ders sayısı');
    await count.fill('14');
    await count.blur();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    const perDay = await page.locator('table.grid thead tr').nth(1).locator('th:not(.break-col)').count();
    expect(perDay).toBe(14 * 6);
  });

  test('ders adları verilebiliyor ve ızgarada görünüyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul');
    const count = page.getByLabel('Günlük ders sayısı');
    await count.fill('3');
    await count.blur();

    const names = page.getByLabel(/Ders adları/);
    await names.fill('Sabah, Öğle, Akşam');
    await names.blur();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid thead tr').nth(1)).toContainText('Sabah');
    await expect(page.locator('table.grid thead tr').nth(1)).toContainText('Akşam');
  });

  test('öğle arasının yeri gün gün seçilebiliyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul');
    await page
      .locator('table.list tr', { hasText: 'Salı' })
      .locator('select')
      .selectOption({ label: '3. dersten sonra' });

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    // The separator sits on the LEFT edge of the period that follows it.
    const before = page.locator('table.grid tbody tr').first().locator('td, th');
    const html = await page.locator('table.grid thead tr').nth(1).innerHTML();
    expect(html.indexOf('break-col')).toBeGreaterThan(0);
    expect(await before.count()).toBeGreaterThan(0);
  });
});

test.describe('33. Ayarlar — kurallar', () => {
  test('dört kural da var ve seviyeleri seçilebiliyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Kurallar');
    await expect(page.locator('table.list tbody tr')).toHaveCount(4);

    for (const label of [
      'Öğretmen art arda en fazla',
      'Öğretmen günde en fazla',
      'Öğretmen günde en az',
      'Bir sınıf aynı dersten günde en fazla',
    ]) {
      await expect(page.locator('table.list tr', { hasText: label })).toBeVisible();
    }
  });

  test('"günde en az" kuralında Engelle seçeneği HİÇ yok', async ({ page }) => {
    // Deliberate: the first lesson of a day always breaches a minimum, so a
    // hard version of this rule could never let a day start.
    await openWithSample(page);
    await openSettings(page, 'Kurallar');

    const min = page.locator('table.list tr', { hasText: 'Öğretmen günde en az' });
    await expect(min.locator('select option')).toHaveCount(2);
    await expect(min.locator('select')).not.toContainText('Engelle');

    const max = page.locator('table.list tr', { hasText: 'Öğretmen günde en fazla' });
    await expect(max.locator('select option')).toHaveCount(3);
  });

  test('sağ sütun ihlalleri canlı sayıyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Kurallar');
    await expect(page.locator('.cols aside')).toContainText('Şu anki ihlaller');
    await expect(page.locator('.cols aside .ok-box')).toBeVisible();
  });

  test('günde en fazla kuralı sürüklemeyi engelliyor', async ({ page }) => {
    await openFixture(page);
    await openSettings(page, 'Kurallar');
    const rule = page.locator('table.list tr', { hasText: 'Öğretmen günde en fazla' });
    await rule.locator('input[type=number]').fill('1');
    await rule.locator('input[type=number]').blur();
    await rule.locator('select').selectOption('block');

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await startDrag(page);
    await hover(page, 0, 0);
    await page.mouse.up();
    await expect(page.locator('table.grid .card')).toHaveCount(1);

    await startDrag(page);
    const second = await hover(page, 0, 2);
    await expect(second).toHaveClass(/drop-blocked/);
    await expect(page.locator('.reason-bar')).toContainText('en fazla 1 saat girmeli');
    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test('bir sınıfın aynı dersten günlük sınırı sürüklemeyi engelliyor', async ({ page }) => {
    await openFixture(page);
    await openSettings(page, 'Kurallar');
    const rule = page.locator('table.list tr', { hasText: 'Bir sınıf aynı dersten' });
    await rule.locator('input[type=number]').fill('1');
    await rule.locator('input[type=number]').blur();
    await rule.locator('select').selectOption('block');

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await startDrag(page);
    await hover(page, 0, 0);
    await page.mouse.up();

    await startDrag(page);
    const second = await hover(page, 0, 2);
    await expect(second).toHaveClass(/drop-blocked/);
    await expect(page.locator('.reason-bar')).toContainText('en fazla 1 saat görmeli');
    await page.keyboard.press('Escape');
    await page.mouse.up();
  });
});

test.describe('34. Ayarlar — veri', () => {
  test('renkleri yeniden dağıt sağ sütunu ve ızgarayı bozmuyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    const before = await page.locator('table.grid .card').count();

    await openSettings(page, 'Veri');
    await page.getByRole('button', { name: /Öğretmen renklerini yeniden dağıt/ }).click();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(before);
  });

  test('yedek zinciri sağ sütunda listeleniyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Veri');
    const side = page.locator('.cols aside');
    await expect(side).toContainText('otomatik yedekler');
  });

  test('"Her şeyi sil" önce soruyor, reddedilince hiçbir şey gitmiyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Veri');

    page.once('dialog', (d) => d.dismiss());
    await page.getByRole('button', { name: 'Her şeyi sil' }).click();
    await openSetup(page, 'Öğretmenler');
    await expect(page.locator('table.list tbody tr')).toHaveCount(25);
  });

  test('"Her şeyi sil" onaylanınca gerçekten siliyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Veri');

    // It asks TWICE. The second question is the point: this is the one button
    // in the app that cannot be undone.
    const asked: string[] = [];
    page.on('dialog', (d) => {
      asked.push(d.message());
      void d.accept();
    });
    await page.getByRole('button', { name: 'Her şeyi sil' }).click();

    await openSetup(page, 'Öğretmenler');
    await expect(page.locator('table.list tbody tr')).toHaveCount(0);
    expect(asked).toHaveLength(2);
    expect(asked[1]).toContain('geri alınamaz');
  });
});
