// Persistence, backups and schema migration: the layer where a mistake costs
// my father his saved timetable, not just a wrong pixel.

import { expect, test, type Page } from '@playwright/test';
import { open, openWithSample, openSetup, openSettings, dragAndDrop } from './helpers';

test.describe('1. Kalıcılık — file:// altında', () => {
  test('otomatik kayıt çalışıyor ve uyarı çıkmıyor', async ({ page }) => {
    await open(page);
    // If the warning shows, localStorage does not work under file://.
    await expect(page.locator('.save-warning')).toHaveCount(0);
  });

  test('yerleştirilen ders sayfa kapatılıp açılınca duruyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    await expect(page.locator('table.grid .card')).not.toHaveCount(0);
    const before = await page.locator('table.grid .card').count();

    // Auto-save is debounced by 400 ms
    await page.waitForTimeout(700);
    await page.reload();
    await page.getByRole('button', { name: 'Program' }).click();

    await expect(page.locator('table.grid .card')).toHaveCount(before);
  });
});

test.describe('5. Yedek ve şema göçü', () => {
  test('yedek düğmeleri: adlar açık, Sıfırla ayrı, not ızgaradan yer çalmıyor', async ({
    page,
  }) => {
    await openWithSample(page);

    // The old names said what the file format was, not what the button does
    await expect(page.getByRole('button', { name: 'Dosyaya kaydet' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dosyadan aç' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yedek indir' })).toHaveCount(0);

    // On the grid the note is hidden: it would cost a whole teacher row
    await expect(page.locator('.topbar-note')).toHaveCount(0);
    const gridTop = (await page.locator('table.grid').boundingBox())!.y;

    await page.getByRole('button', { name: 'Kurulum' }).click();
    await expect(page.locator('.topbar-note')).toContainText('kendiliğinden saklanıyor');

    await page.getByRole('button', { name: 'Program' }).click();
    expect((await page.locator('table.grid').boundingBox())!.y).toBe(gridTop);

    // "Sıfırla" is not in the top bar at all any more: it was one careless
    // click from "Dosyadan aç" and it cannot be undone. It is in Ayarlar > Veri.
    await expect(page.getByRole('button', { name: 'Sıfırla' })).toHaveCount(0);
    await openSettings(page, 'Veri');
    await expect(page.getByRole('button', { name: 'Her şeyi sil' })).toBeVisible();
  });

  test('yedek indirilebiliyor', async ({ page }) => {
    await openWithSample(page);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Dosyaya kaydet' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^ders-programi-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);
  });

  test('rename öncesi indirilmiş (v1) yedek hâlâ açılıyor', async ({ page }) => {
    // The one test that proves the schemaVersion 1 -> 2 migration works on the
    // real path: a backup file downloaded before the rename, picked through the
    // actual file dialog. Every backup my father already has is v1.
    await open(page);

    const v1 = {
      semaSurumu: 1,
      ayar: { gunler: ['Pazartesi', 'Salı'], saatler: ['1', '2', '3', '4'] },
      derslikler: [{ id: 'dA', ad: 'A' }],
      ogretmenler: [
        { id: 'oMC', ad: 'Mehmet Çelik', kisaltma: 'MÇ', brans: 'Matematik', renk: 0 },
      ],
      siniflar: [{ id: 's510', ad: '510', derslikId: 'dA' }],
      dersler: [{ id: 'x1', sinifId: 's510', ogretmenId: 'oMC', haftalikSaat: 2, blok: 2 }],
      musaitDegil: { 'oMC|1|0': 1 },
      yerlesim: { 's510|0|0': 'x1', 's510|0|1': 'x1' },
    };

    page.once('dialog', (d) => d.accept()); // "the backup will replace the current plan"
    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-01-0900.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v1)),
    });

    // The teacher, the class and the placed 2-hour block all survived.
    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(2);
    await expect(page.locator('tbody .row-head').first()).toContainText('MÇ');
    await expect(page.locator('table.grid .card').first()).toContainText('510');
  });

  test('günlük saat azaltılınca taşan dersler temizleniyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    await openSettings(page, 'Okul ve zil');

    const hourBox = page.getByLabel('Günlük ders sayısı');
    await hourBox.fill('4');
    await hourBox.blur();

    await page.getByRole('button', { name: 'Program' }).click();
    // 12 -> 4 hours: 4 columns left per day, 6 days
    await expect(page.locator('tbody tr').first().locator('td')).toHaveCount(24);
  });

  test('v2 biçimli yedek (düz metin günler) açılıyor, blok yerinde kalıyor', async ({ page }) => {
    // The v2 -> v3 migration on the REAL path. Every backup downloaded between
    // the English rename and this version has plain string days and no rules.
    await open(page);

    const v2 = {
      schemaVersion: 2,
      settings: { days: ['Cuma', 'Cumartesi'], hours: ['1', '2', '3', '4'] },
      rooms: [{ id: 'dA', name: 'A' }],
      teachers: [
        { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', color: 0 },
      ],
      classes: [{ id: 's510', name: '510', roomId: 'dA' }],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 2 },
      ],
      unavailable: { 'oMC|1|0': 1 },
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x1' },
    };

    page.once('dialog', (d) => d.accept());
    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-20-1200.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v2)),
    });

    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(2);
    await expect(page.locator('.day-head').first()).toHaveText('Cuma');
    // The bell times the migration filled in are visible in the header.
    await expect(page.locator('table.grid thead').first()).toContainText('09:00');
  });

  test('v3 biçimli yedek (branş kısaltması yokken) açılıyor, blok yerinde kalıyor', async ({
    page,
  }) => {
    // The v3 -> v4 migration on the REAL path. Every backup downloaded between
    // v0.6 and v0.7 has no settings.subjectShorts at all. If this file does not
    // open, that is data loss, not a bug.
    await open(page);

    const v3 = {
      schemaVersion: 3,
      settings: {
        schoolName: 'Semiz Kurs',
        days: [
          { name: 'Salı', longBreakAfter: 5 },
          { name: 'Çarşamba', longBreakAfter: 5 },
        ],
        hours: ['1', '2', '3', '4'],
        bell: { start: '09:00', lessonMinutes: 40, breakMinutes: 10, longBreakMinutes: 30 },
        limits: { maxConsecutive: 0, maxPerDay: 0, minPerDay: 0, maxSameLessonPerDay: 0 },
        rules: {
          maxConsecutive: 'block',
          maxPerDay: 'block',
          minPerDay: 'warn',
          maxSameLessonPerDay: 'block',
        },
        // no subjectShorts here — that is the whole point
      },
      rooms: [{ id: 'dA', name: 'A' }],
      teachers: [
        {
          id: 'oMC',
          name: 'Mehmet Çelik',
          short: 'MÇ',
          subject: 'Matematik',
          color: 0,
          limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
        },
      ],
      classes: [{ id: 's510', name: '510', roomId: 'dA' }],
      lessons: [
        {
          id: 'x1',
          classId: 's510',
          teacherId: 'oMC',
          weeklyHours: 2,
          blockSize: 2,
          maxPerDay: null,
        },
      ],
      unavailable: { 'oMC|1|0': 1 },
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x1' },
    };

    page.once('dialog', (d) => d.accept());
    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-24-1500.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v3)),
    });

    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(2);
    await expect(page.locator('.day-head').first()).toHaveText('Salı');
    await expect(page.locator('tbody .row-head').first()).toContainText('MÇ');

    // The built-in table applies straight away: the class view says "Mat"
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    await expect(page.locator('table.grid .card').first()).toContainText('Mat');
  });

  test('v4 biçimli yedek (sınıf rengi ve branş listesi yokken) açılıyor', async ({ page }) => {
    // The v4 -> v5 migration on the REAL path. A v4 file has no ClassGroup.color
    // and no settings.subjects, and its teacher colours come from a palette that
    // only had twelve entries — so two of these three teachers share one.
    await open(page);

    const v4 = {
      schemaVersion: 4,
      settings: {
        schoolName: 'Semiz Kurs',
        days: [
          { name: 'Salı', longBreakAfter: 5 },
          { name: 'Çarşamba', longBreakAfter: 5 },
        ],
        hours: ['1', '2', '3', '4'],
        bell: { start: '09:00', lessonMinutes: 40, breakMinutes: 10, longBreakMinutes: 30 },
        limits: { maxConsecutive: 0, maxPerDay: 0, minPerDay: 0, maxSameLessonPerDay: 0 },
        rules: {
          maxConsecutive: 'block',
          maxPerDay: 'block',
          minPerDay: 'warn',
          maxSameLessonPerDay: 'block',
        },
        subjectShorts: { matematik: 'Mtk' },
        // no `subjects` here — that is the whole point
      },
      rooms: [{ id: 'dA', name: 'A' }],
      teachers: [
        {
          id: 'oMC',
          name: 'Mehmet Çelik',
          short: 'MÇ',
          subject: 'Matematik',
          color: 3,
          limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
        },
        {
          id: 'oAY',
          name: 'Ayşe Yıldız',
          short: 'AY',
          subject: 'Fizik',
          color: 3, // the collision an old twelve-colour file is full of
          limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
        },
      ],
      // no `color` on either class
      classes: [
        { id: 's510', name: '510', roomId: 'dA' },
        { id: 's511', name: '511', roomId: null },
      ],
      lessons: [
        {
          id: 'x1',
          classId: 's510',
          teacherId: 'oMC',
          weeklyHours: 2,
          blockSize: 2,
          maxPerDay: null,
        },
      ],
      unavailable: { 'oMC|1|0': 1 },
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x1' },
    };

    page.once('dialog', (d) => d.accept());
    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-24-1900.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v4)),
    });

    // The laid-out block survived the migration untouched.
    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(2);
    await expect(page.locator('table.grid .card').first()).toContainText('510');

    // The two teachers no longer share a colour...
    await openSetup(page, 'Öğretmenler');
    const teacherColors = await page
      .locator('table.list tbody tr select[title="Renk"]')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(teacherColors).toHaveLength(2);
    expect(new Set(teacherColors).size).toBe(2);

    // ...and the classes were given colours of their own.
    await openSetup(page, 'Sınıflar');
    const classColors = await page
      .locator('table.list tbody tr select[title="Renk"]')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(classColors).toHaveLength(2);
    expect(new Set(classColors).size).toBe(2);

    // The hand-written override still wins over the built-in table.
    await page.getByRole('button', { name: 'Program' }).click();
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    await expect(page.locator('table.grid .card').first()).toContainText('Mtk');
  });
});
