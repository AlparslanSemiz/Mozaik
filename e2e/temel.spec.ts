// Persistence, backups and schema migration: the layer where a mistake costs
// my father his saved timetable, not just a wrong pixel.

import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import {
  FIXTURE,
  open,
  openSettings,
  openSetup,
  openWithSample,
  dragAndDrop,
  mainList,
  answerDialog,
} from './helpers';

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
    await page.getByRole('button', { name: 'Program', exact: true }).click();

    await expect(page.locator('table.grid .card')).toHaveCount(before);
  });
});

test.describe('5. Yedek ve şema göçü', () => {
  test('yedek düğmeleri: adlar açık, Sıfırla ayrı, not ızgaradan yer çalmıyor', async ({
    page,
  }) => {
    await openWithSample(page);

    // The old names said what the file format was, not what the button does
    await expect(page.getByRole('button', { name: 'Dosyaya kaydet', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dosyadan aç', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yedek indir' })).toHaveCount(0);

    // Where the teaching went. The sentence used to be 400px of explanation on
    // the top bar; C9 moved it to Ayarlar → Veri, beside the report that says
    // where the data actually IS, and left a short version on the save
    // button's own tooltip — which is where somebody about to click it looks.
    await expect(
      page.getByRole('button', { name: 'Dosyaya kaydet', exact: true }),
    ).toHaveAttribute('title', /kendiliğinden saklanıyor/);

    await openSettings(page, 'Veri');
    // `.panel` nests (a panel inside the Veri panel), so two match — take the
    // innermost, which is the one that actually holds the sentence.
    await expect(
      page.locator('.panel', { hasText: 'kendiliğinden saklanıyor' }).last(),
    ).toBeVisible();

    // "Sıfırla" is not in the top bar at all any more: it was one careless
    // click from "Dosyadan aç" and it cannot be undone. It is in Ayarlar > Veri.
    await expect(page.getByRole('button', { name: 'Sıfırla' })).toHaveCount(0);
    await openSettings(page, 'Veri');
    await expect(page.getByRole('button', { name: 'Her şeyi sil' })).toBeVisible();
  });

  test('yedek indirilebiliyor', async ({ page }) => {
    await openWithSample(page);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Dosyaya kaydet', exact: true }).click();
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

    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-01-0900.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v1)),
    });
    await answerDialog(page); // "şu anki programın yerine geçecek"

    // The teacher, the class and the placed 2-hour block all survived.
    await page.getByRole('button', { name: 'Program', exact: true }).click();
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

    await page.getByRole('button', { name: 'Program', exact: true }).click();
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

    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-20-1200.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v2)),
    });
    await answerDialog(page); // "şu anki programın yerine geçecek"

    await page.getByRole('button', { name: 'Program', exact: true }).click();
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

    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-24-1500.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v3)),
    });
    await answerDialog(page); // "şu anki programın yerine geçecek"

    await page.getByRole('button', { name: 'Program', exact: true }).click();
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

    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-24-1900.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v4)),
    });
    await answerDialog(page); // "şu anki programın yerine geçecek"

    // The laid-out block survived the migration untouched.
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid .card')).toHaveCount(2);
    await expect(page.locator('table.grid .card').first()).toContainText('510');

    // The two teachers no longer share a colour...
    await openSetup(page, 'Öğretmenler');
    const teacherColors = await page
      .locator('table.list tbody tr .color-pick')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(teacherColors).toHaveLength(2);
    expect(new Set(teacherColors).size).toBe(2);

    // ...and the classes were given colours of their own.
    await openSetup(page, 'Sınıflar');
    const classColors = await page
      .locator('table.list tbody tr .color-pick')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(classColors).toHaveLength(2);
    expect(new Set(classColors).size).toBe(2);

    // The hand-written override still wins over the built-in table.
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    await expect(page.locator('table.grid .card').first()).toContainText('Mtk');
  });
});

// ---------------------------------------------------------------------------
// Undo / redo
//
// Dropping a card in the wrong place happens constantly, so this is a basic
// function rather than a nicety — and until now exactly one Ctrl+Z was tested.

test.describe('28. Geri al / ileri al', () => {
  test('açılışta ikisi de kapalı', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('button', { name: 'Geri al', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'İleri al', exact: true })).toBeDisabled();
  });

  test('düğmelerle üç adım geri, üç adım ileri', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    const box = page.getByPlaceholder('Derslik adı, örn. A');
    for (const name of ['A', 'B', 'C']) {
      await box.fill(name);
      await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    }
    await expect(mainList(page).locator('tbody tr')).toHaveCount(3);

    const back = page.getByRole('button', { name: 'Geri al', exact: true });
    const forward = page.getByRole('button', { name: 'İleri al', exact: true });
    for (const expected of [2, 1, 0]) {
      await back.click();
      await expect(mainList(page).locator('tbody tr')).toHaveCount(expected);
    }
    await expect(back).toBeDisabled();

    for (const expected of [1, 2, 3]) {
      await forward.click();
      await expect(mainList(page).locator('tbody tr')).toHaveCount(expected);
    }
    await expect(forward).toBeDisabled();
  });

  test('geri aldıktan sonra yeni bir değişiklik ileriyi siliyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    const box = page.getByPlaceholder('Derslik adı, örn. A');
    await box.fill('A');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await box.fill('B');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    await page.getByRole('button', { name: 'Geri al', exact: true }).click();
    await expect(page.getByRole('button', { name: 'İleri al', exact: true })).toBeEnabled();

    await box.fill('C');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.getByRole('button', { name: 'İleri al', exact: true })).toBeDisabled();
    await expect(mainList(page).locator('tbody tr')).toHaveCount(2);
  });

  test('metin kutusundayken Ctrl+Z programı geri almıyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    const box = page.getByPlaceholder('Derslik adı, örn. A');
    await box.fill('A');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(mainList(page).locator('tbody tr')).toHaveCount(1);

    // Inside a text box Ctrl+Z belongs to the box, not to the timetable.
    await box.click();
    await box.fill('yanlış');
    await page.keyboard.press('Control+z');
    await expect(mainList(page).locator('tbody tr')).toHaveCount(1);
  });

  test('yedek yüklemek geçmişi sıfırlıyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    await page.getByPlaceholder('Derslik adı, örn. A').fill('A');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Geri al', exact: true })).toBeEnabled();

    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-25-1200.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(FIXTURE)),
    });
    await answerDialog(page);

    await expect(page.getByRole('button', { name: 'Geri al', exact: true })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Failure paths. Every one of these ends in data loss if it goes wrong quietly.

test.describe('29. Hata yolları', () => {
  test('bozuk dosya açıkça reddediliyor, program bozulmuyor', async ({ page }) => {
    await openWithSample(page);
    const before = await page.locator('table.grid tbody tr').count();

    await page.locator('input[type=file]').setInputFiles({
      name: 'bozuk.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ bu json değil'),
    });

    // Read while it is on screen, then dismiss it: the dialog is the program's
    // own now, so the text is in the DOM rather than in a browser event.
    expect(await answerDialog(page)).toContain('Bu dosya okunamadı');
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid tbody tr')).toHaveCount(before);
  });

  test('bilinmeyen (ileri) şema sürümü tahmin edilmiyor', async ({ page }) => {
    await openWithSample(page);

    await page.locator('input[type=file]').setInputFiles({
      name: 'gelecek.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ ...FIXTURE, schemaVersion: 99 })),
    });

    expect(await answerDialog(page)).toContain('Bu dosya okunamadı');
  });

  test('yükleme onayı reddedilince hiçbir şey değişmiyor', async ({ page }) => {
    await openWithSample(page);
    const before = await page.locator('table.grid tbody tr').count();

    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-25-1200.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(FIXTURE)),
    });
    await answerDialog(page, 'cancel');

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid tbody tr')).toHaveCount(before);
  });

  test('aynı dosya arka arkaya iki kez seçilebiliyor', async ({ page }) => {
    await open(page);
    const file = {
      name: 'ders-programi-2026-08-25-1200.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(FIXTURE)),
    };

    await page.locator('input[type=file]').setInputFiles(file);
    await answerDialog(page);
    await expect(page.getByRole('button', { name: 'Program', exact: true })).toBeVisible();

    // The input clears its own value, so picking the same path fires again.
    await page.locator('input[type=file]').setInputFiles(file);
    expect(await answerDialog(page)).toContain('Şu anki programın yerine geçecek');
  });

  test('kayıt çalışmıyorsa kalıcı kırmızı uyarı çıkıyor', async ({ page }) => {
    // The loudest safety net in the app, and its presence was never tested —
    // only its absence.
    await page.addInitScript(() => {
      const blow = () => {
        throw new Error('kapalı');
      };
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: { getItem: blow, setItem: blow, removeItem: blow, clear: blow, key: blow, length: 0 },
      });
    });
    await open(page);

    const warning = page.locator('.save-warning');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('otomatik kayıt çalışmıyor');
    await expect(warning).toContainText('Dosyaya kaydet');
  });
});

// ---------------------------------------------------------------------------

test.describe('46. Gömülü yazı tipi', () => {
  // Principle 3 says the tool fetches nothing. A web font is the single most
  // common way that promise breaks, and it breaks SILENTLY: on this machine
  // the face is cached, so the page looks right while my father's copy falls
  // back to Segoe. So the claim is checked in the built file, not in the CSS
  // source, and the face is also checked to actually be in use — a font that
  // is embedded but never applied is a wasted 31 KB.

  test('dist/index.html içinde tek bir font ADRESİ yok, font gömülü', async () => {
    const html = readFileSync('dist/index.html', 'utf8');

    for (const needle of ['fonts.googleapis', 'fonts.gstatic', '.woff2)', ".woff2'", '.woff2"']) {
      expect(html.includes(needle), `dist/index.html içinde "${needle}" geçiyor`).toBe(false);
    }
    expect(html).toContain('data:font/woff2;base64,');
    expect(html).toContain('font-display:block');
  });

  test('IBM Plex Sans gerçekten çiziliyor, yedek fonta düşmüyor', async ({ page }) => {
    await open(page);

    const drawn = await page.evaluate(() => ({
      ready: document.fonts.check('12px "IBM Plex Sans"'),
      loaded: [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`),
      // The advance of "0" is the whole reason the ch ladder works. Plex draws
      // it at 0.6em by construction; the fallback does not.
      zero: (() => {
        const probe = document.createElement('span');
        probe.style.cssText = 'position:absolute;visibility:hidden;font-size:100px;white-space:pre';
        probe.style.fontFamily = getComputedStyle(document.body).fontFamily;
        probe.textContent = '0';
        document.body.appendChild(probe);
        const width = probe.getBoundingClientRect().width;
        probe.remove();
        return width;
      })(),
    }));

    expect(drawn.ready, `yüklü yüzler: ${drawn.loaded.join(' · ')}`).toBe(true);
    expect(drawn.loaded).toEqual(['IBM Plex Sans 400 600 loaded']);
    expect(drawn.zero, 'gövde Plex ile çizilmiyor').toBeCloseTo(60, 0);
  });

  test('rakamlar tablo hizalı — ızgara sayılardan ibaret', async ({ page }) => {
    await openWithSample(page);

    // Not asserted from the CSS: `font-variant-numeric` is a request, and a
    // face without the feature ignores it. Plex needs no feature because its
    // lining figures are already one width; this measures the RESULT.
    const widths = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;font-size:100px;white-space:pre';
      probe.style.fontFamily = getComputedStyle(document.body).fontFamily;
      document.body.appendChild(probe);
      const out = [...'0123456789'].map((digit) => {
        probe.textContent = digit;
        return Math.round(probe.getBoundingClientRect().width * 100) / 100;
      });
      probe.remove();
      return out;
    });

    expect(new Set(widths).size, `rakam genişlikleri: ${widths.join(', ')}`).toBe(1);
  });
});

// ---------------------------------------------------------------------------

test.describe('72. Sekmedeki işaret — gömülü favicon', () => {
  // Task B3b. Without it the double-clicked file gets the browser's blank
  // page icon, which is what every other saved .html on the machine gets too.
  //
  // The mark now exists in two places: site/icon.svg, which the site build and
  // the PNGs come from, and a data: URI inside index.html. Two copies of a
  // drawing drift, and nobody notices a favicon drifting — so the second test
  // below decodes the URI and compares the rectangles it draws with the ones
  // in the file. That is the whole reason it is written as a test rather than
  // as a comment saying "keep these in step".

  /** Every <rect> in an SVG, as a sorted list of "x,y,w,h,rx,fill". */
  function rects(svg: string): string[] {
    const attr = (tag: string, name: string) =>
      new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1] ?? '';
    return (svg.match(/<rect[^>]*>/g) ?? [])
      .map((tag) =>
        ['x', 'y', 'width', 'height', 'rx', 'fill']
          .map((name) => `${name}=${attr(tag, name)}`)
          .join(' '),
      )
      .sort();
  }

  test('tek dosyada favicon var ve hiçbir ağ isteği DEĞİL', async ({ page }) => {
    const html = readFileSync('dist/index.html', 'utf8');
    const href = /<link[^>]*rel="icon"[^>]*href="([^"]*)"/.exec(html)?.[1];

    expect(href, 'dist/index.html içinde <link rel=icon> yok').toBeDefined();
    expect(href!.startsWith('data:image/svg+xml,')).toBe(true);

    // Pitfall 32's other half, said once more from this side and said about
    // the right thing: not "the word icon.svg does not appear" — a comment may
    // well name it — but "no attribute in this file addresses anything the
    // browser would have to go and get".
    const urls = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]!);
    expect(urls.length, 'hiç href/src yok — regex bozulmuş olabilir').toBeGreaterThan(0);
    for (const url of urls) {
      expect(url.startsWith('data:'), `dist/index.html dışarı bakıyor: ${url}`).toBe(true);
    }

    await open(page);
    const rel = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(rel!.startsWith('data:')).toBe(true);
  });

  test('gömülü işaret site/icon.svg ile AYNI şeyi çiziyor', async () => {
    const html = readFileSync('index.html', 'utf8');
    const href = /<link[^>]*rel="icon"[^>]*href="([^"]*)"/.exec(html)![1]!;
    // Single quotes inside the URI, double quotes in the file it came from.
    const embedded = decodeURIComponent(href.slice('data:image/svg+xml,'.length)).replace(
      /'/g,
      '"',
    );
    const source = readFileSync('site/icon.svg', 'utf8').replace(/#ffffff/g, '#fff');

    expect(rects(embedded).length, 'gömülü işaret boş').toBe(13);
    expect(rects(embedded)).toEqual(rects(source));
  });
});

// ---------------------------------------------------------------------------

test.describe('75. file:// gerçekte ne veriyor — ÖLÇÜM, iddia değil', () => {
  // This section exists because I got it wrong, and wrote the wrong thing into
  // four files before a screenshot caught it.
  //
  // I claimed file:// is not a secure context and therefore cannot have the
  // File System Access API, and built task B1's justification on that. It is
  // false in Chromium. The screenshot that caught it was of the panel's "the
  // API is not here" state — which rendered the "choose a folder" button
  // instead, because the API IS here.
  //
  // So the record is a test rather than a sentence: anyone who re-writes the
  // old claim has to make these go red first. The numbers are Chromium's, and
  // a change in them is worth knowing about either way.

  test('GÜVENLİ BAĞLAM ve klasör API’si file:// altında VAR', async ({ page }) => {
    await open(page);
    const facts = await page.evaluate(() => ({
      secure: window.isSecureContext,
      picker: typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker,
      idb: typeof indexedDB,
    }));

    expect(facts.secure, 'file:// güvenli bağlam DEĞİL — iddia değişti').toBe(true);
    expect(facts.picker, 'showDirectoryPicker file:// altında yok — iddia değişti').toBe(
      'function',
    );
    expect(facts.idb).toBe('object');
  });

  test('...ama gerçek bir KÖKEN yok, ve fark bu', async ({ page }) => {
    await open(page);
    const facts = await page.evaluate(async () => {
      const out: Record<string, unknown> = { origin: location.origin };
      try {
        await navigator.storage.getDirectory();
        out['opfs'] = 'açıldı';
      } catch (err) {
        out['opfs'] = (err as Error).name;
      }
      try {
        await navigator.serviceWorker.register('./sw.js');
        out['sw'] = 'kaydoldu';
      } catch (err) {
        out['sw'] = (err as Error).name;
      }
      return out;
    });

    // No host: every local .html file on the machine shares this one origin,
    // and therefore the same storage namespace.
    expect(facts['origin']).toBe('file://');
    expect(facts['opfs'], 'OPFS artık file:// altında açılıyor — iddia değişti').toBe(
      'SecurityError',
    );
    expect(facts['sw'], 'service worker artık file:// altında kaydoluyor').toBe('TypeError');
  });
});
