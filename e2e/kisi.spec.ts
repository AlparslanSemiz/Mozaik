// The person page (Sadeleşme, K5, 2026-11-16).
//
// Everything about one teacher or one class in one place, opened from the
// Okul list. What is tested is that each thing the father does with a person
// is reachable on that page and lands in the saved plan: a name, the hours
// they cannot come (with clock times), a lesson's hours, printing their sheet
// in two clicks, sending it, and deleting them with Geri al.

import { expect, test } from './kapan';
import { loadWorld, openSetup, savedState, savedText, settledText } from './helpers';
import { makeWorld } from '../src/pure/worlds';
import type { State } from '../src/leaf/model';

function world(): State {
  const w = makeWorld({
    days: 3,
    hours: 4,
    teachers: [
      { id: 'tAY', short: 'AY', subject: 'Fizik' },
      {
        id: 'tMC',
        short: 'MÇ',
        subject: 'Kimya',
        limits: { maxConsecutive: null, maxPerDay: 3, minPerDay: null },
      },
    ],
    classes: [
      { id: 'c510', name: '510', roomId: null },
      { id: 'c511', name: '511', roomId: null },
    ],
    lessons: [
      { id: 'l1', classId: 'c510', teacherId: 'tAY', weeklyHours: 2 },
      { id: 'l2', classId: 'c511', teacherId: 'tMC', weeklyHours: 2 },
    ],
    placements: { 'c510|0|0': 'l1', 'c510|0|1': 'l1' },
    limits: { maxPerDay: 6 },
  });
  return {
    ...w,
    teachers: w.teachers.map((t) =>
      t.id === 'tAY'
        ? { ...t, name: 'Ayşe Yılmaz', email: 'ayse@ornek.com' }
        : { ...t, name: 'Mehmet Çelik' },
    ),
  };
}

async function openTeachers(page: import('@playwright/test').Page) {
  await loadWorld(page, world(), 'Öğretmenler');
  await openSetup(page, 'Öğretmenler');
}

test.describe('Kişi sayfası', () => {
  test('satırdaki ad sayfayı açıyor; odak içeri giriyor, Esc kapatıp geri veriyor', async ({
    page,
  }) => {
    await openTeachers(page);
    // The list is text: no box on a row.
    await expect(page.locator('table.person-list tbody input')).toHaveCount(0);
    const name = page.getByRole('button', { name: 'Ayşe Yılmaz', exact: true });
    await name.focus();
    await page.keyboard.press('Enter');
    const sheet = page.getByRole('dialog', { name: 'Ayşe Yılmaz' });
    await expect(sheet).toBeVisible();
    await expect.poll(() => sheet.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    // Everything about the person, in the order the work is done.
    for (const h of ['Bilgiler', 'Gelemediği saatler', 'Verdiği dersler', 'Sınırları']) {
      await expect(sheet.getByRole('heading', { name: h })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(name).toBeFocused();
  });

  test('adı sayfada değişiyor ve listeye yazılıyor', async ({ page }) => {
    await openTeachers(page);
    const before = await settledText(page);
    await page.getByRole('button', { name: 'Ayşe Yılmaz', exact: true }).click();
    const sheet = page.getByRole('dialog');
    const box = sheet.getByRole('textbox', { name: 'Ad', exact: true });
    await box.fill('Ayşe Kaya');
    await box.press('Tab');
    const saved = await savedState(page, before);
    expect(saved.teachers.find((t) => t.id === 'tAY')?.name).toBe('Ayşe Kaya');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Ayşe Kaya', exact: true })).toBeVisible();
  });

  test('gelemediği saatler saatleriyle görünüyor, fareyle ve klavyeyle değişiyor', async ({
    page,
  }) => {
    await openTeachers(page);
    await page.getByRole('button', { name: 'Mehmet Çelik', exact: true }).click();
    const grid = page.getByRole('grid', { name: /Mehmet Çelik · müsait olmayan saatler/ });
    // The bell times are on, whatever Müsaitlik's own switch says.
    const clock = grid.locator('thead .hour-clock').first();
    await expect(clock).toBeVisible();
    await expect(clock).toHaveText(/^\d{2}:\d{2}$/);

    let before = await settledText(page);
    await grid
      .getByRole('button', { name: /1\. saat, müsait$/ })
      .first()
      .click();
    let saved = await savedState(page, before);
    expect(saved.unavailable['tMC|0|0']).toBe(1);

    // One Tab stop, the arrows inside, Space flips.
    before = await savedText(page);
    await grid
      .getByRole('button', { name: /1\. saat, müsait değil$/ })
      .first()
      .focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    saved = await savedState(page, before);
    expect(saved.unavailable['tMC|0|1']).toBe(1);
    // The list's status says it too.
    await page.keyboard.press('Escape');
    await expect(page.locator('tr[data-person-id="tMC"] .person-status')).toHaveText(
      '2 saat kapalı',
    );
  });

  test('bir dersin haftalık saati sayfada değişiyor', async ({ page }) => {
    await openTeachers(page);
    const before = await settledText(page);
    await page.getByRole('button', { name: 'Ayşe Yılmaz', exact: true }).click();
    const hours = page.getByRole('spinbutton', { name: '510 · Haftalık saat' });
    await hours.fill('3');
    await hours.press('Tab');
    const saved = await savedState(page, before);
    expect(saved.lessons.find((x) => x.id === 'l1')?.weeklyHours).toBe(3);
  });

  test('sınırlar okul ayarını mı kendi sayısını mı kullandığını söylüyor', async ({ page }) => {
    await openTeachers(page);
    await page.getByRole('button', { name: 'Mehmet Çelik', exact: true }).click();
    const sheet = page.getByRole('dialog');
    await expect(sheet.getByText('Kendi sayısı; okul ayarı: 6')).toBeVisible();
    await expect(sheet.getByText(/^Okul ayarı geçerli:/)).toHaveCount(2);
  });

  test('Yazdır iki tıklamada yalnız o kişinin sayfasını basıyor', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { basildi: number }).basildi = 0;
      window.print = () => {
        (window as unknown as { basildi: number }).basildi++;
      };
    });
    await openTeachers(page);
    await page.getByRole('button', { name: 'Ayşe Yılmaz', exact: true }).click(); // 1
    await page.getByRole('dialog').getByRole('button', { name: 'Yazdır', exact: true }).click(); // 2
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { basildi: number }).basildi))
      .toBe(1);
    const box = page.locator('.print-one-box .print-page');
    await expect(box).toHaveCount(1);
    await expect(box.locator('h2')).toContainText('Ayşe Yılmaz');
    // On paper it is the only thing there.
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#root')).toBeHidden();
    await expect(box).toBeVisible();
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await expect(page.locator('.print-one-box')).toHaveCount(0);
  });

  test('Gönder adresi olana e-postayı açıyor, olmayana nereye yazılacağını söylüyor', async ({
    page,
  }) => {
    await openTeachers(page);
    await page.getByRole('button', { name: 'Ayşe Yılmaz', exact: true }).click();
    const send = page.getByRole('dialog').getByRole('link', { name: 'Gönder', exact: true });
    await expect(send).toHaveAttribute('href', /^mailto:ayse@ornek\.com/);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Mehmet Çelik', exact: true }).click();
    const sheet = page.getByRole('dialog');
    await sheet.getByRole('button', { name: 'Gönder', exact: true }).click();
    await expect(sheet.getByRole('status')).toContainText('e-posta adresini yazın');
    await expect(sheet.getByRole('textbox', { name: 'E-posta' })).toBeFocused();
  });

  test('Sil sorusuz siliyor, bildirimdeki Geri al geri getiriyor', async ({ page }) => {
    await openTeachers(page);
    await page.getByRole('button', { name: 'Mehmet Çelik', exact: true }).click();
    await page.getByRole('button', { name: 'Öğretmeni sil' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.locator('tr[data-person-id="tMC"]')).toHaveCount(0);
    // The keyboard is on the name that took its place, not on <body>.
    await expect(page.getByRole('button', { name: 'Ayşe Yılmaz', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Geri al', exact: true }).last().click();
    await expect(page.locator('tr[data-person-id="tMC"]')).toHaveCount(1);
  });

  test('+ Yeni öğretmen boş bir sayfa açıyor, Ekle onu kişinin sayfası yapıyor', async ({
    page,
  }) => {
    await openTeachers(page);
    await page.getByRole('button', { name: '+ Yeni öğretmen' }).click();
    const sheet = page.getByRole('dialog', { name: 'Yeni öğretmen' });
    await expect(sheet.getByPlaceholder('Ad Soyad')).toBeFocused();
    await page.keyboard.type('Zeynep Ak');
    await sheet.getByRole('combobox', { name: 'Branş', exact: true }).selectOption('Fizik');
    await sheet.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Zeynep Ak' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gelemediği saatler' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Zeynep Ak', exact: true })).toBeVisible();
  });

  test('sınıfın sayfası: kapalı saatler, aldığı dersler tam adla, Yazdır; Gönder yok', async ({
    page,
  }) => {
    await loadWorld(page, world(), 'Öğretmenler');
    await openSetup(page, 'Sınıflar');
    await page.getByRole('button', { name: '510', exact: true }).click();
    const sheet = page.getByRole('dialog', { name: '510 sınıfı' });
    await expect(sheet.getByRole('heading', { name: 'Kapalı saatler' })).toBeVisible();
    await expect(sheet.locator('table.sheet-lessons')).toContainText('Ayşe Yılmaz');
    await expect(sheet.getByRole('button', { name: 'Yazdır', exact: true })).toBeVisible();
    await expect(sheet.getByRole('button', { name: 'Gönder' })).toHaveCount(0);
  });
});
