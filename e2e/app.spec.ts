// Real browser tests.
//
// The target is NOT the dev server but `dist/index.html` opened over file://
// — the very thing my father will double-click. What is tested here cannot be
// tested meaningfully in jsdom:
//   - does localStorage really work under file:// (risk of data loss)
//   - mouse drag and drop, the ghost card, the green/red highlight
//   - do the sticky columns really stay put at 1366x768
//   - whether the print layout overflows

import { expect, test, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const FILE = pathToFileURL(resolve('dist/index.html')).href;

async function open(page: Page) {
  await page.goto(FILE);
  await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();
}

/** Loads the sample data and switches to the Program tab. */
async function openWithSample(page: Page) {
  await open(page);
  page.once('dialog', (d) => d.accept()); // the "sample data will be loaded" confirm
  await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
  await page.getByRole('button', { name: 'Program' }).click();
  await expect(page.locator('table.grid')).toBeVisible();
}

/**
 * Setup is a strip of steps now, so reaching a field means naming its step.
 * Every test that used to just click "Kurulum" goes through here.
 */
async function openSetup(page: Page, step: string) {
  await page.getByRole('button', { name: 'Kurulum' }).click();
  await page.locator('.step', { hasText: step }).click();
  await expect(page.locator('.step[aria-current="true"]')).toContainText(step);
}

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

/** Starts a drag and waits until the target row is visible. */
async function startDrag(page: Page, index = 0) {
  const card = page.locator('.pool-card').nth(index);
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.locator('tr.target-row')).toHaveCount(1);
  // The target row is scrolled into view when the drag starts; let it settle.
  await page.waitForTimeout(150);
}

/**
 * Returns the cells matching the selector that are REALLY visible right now.
 *
 * Only ~35 of the 72 columns fit the screen. An off-screen cell still has a
 * boundingBox, but moving the mouse there is meaningless — in the app you reach
 * it by auto-scrolling, not by teleporting. The margins are wide enough to keep
 * out the sticky column (132px), the sticky header (~44px) and the auto-scroll
 * band (56px).
 */
async function visibleCells(page: Page, selector: string) {
  // Asking boundingBox() cell by cell means 72 round trips and takes seconds;
  // waiting that long mid-drag makes the test flaky. Compute it all inside the
  // browser in one go.
  return page.evaluate((sel) => {
    const wrap = document.querySelector('.grid-wrap');
    if (wrap === null) return [];
    const r = wrap.getBoundingClientRect();
    // Margins wide enough to exclude the sticky column (132px), the sticky
    // header (~44px) and the auto-scroll band (56px).
    const bounds = { left: r.left + 140, right: r.right - 70, top: r.top + 70, bottom: r.bottom - 70 };

    const result: Array<{ x: number; y: number; index: number }> = [];
    document.querySelectorAll(sel).forEach((el, index) => {
      const b = el.getBoundingClientRect();
      const x = b.left + b.width / 2;
      const y = b.top + b.height / 2;
      if (x > bounds.left && x < bounds.right && y > bounds.top && y < bounds.bottom) {
        result.push({ x, y, index });
      }
    });
    return result;
  }, selector);
}

/** Drags a card from the pool into the first valid cell of the grid. */
async function dragAndDrop(page: Page): Promise<{ day: string; hour: string; row: string }> {
  await startDrag(page);

  const cells = page.locator('tr.target-row td');
  for (const point of await visibleCells(page, 'tr.target-row td')) {
    await page.mouse.move(point.x, point.y, { steps: 3 });
    await page.waitForTimeout(40); // the highlight is applied in the rAF loop
    const cell = cells.nth(point.index);
    if ((await cell.getAttribute('class'))?.includes('drop-ok') === true) {
      const day = (await cell.getAttribute('data-day'))!;
      const hour = (await cell.getAttribute('data-hour'))!;
      const row = (await cell.getAttribute('data-row'))!;
      await page.mouse.up();
      return { day, hour, row };
    }
  }
  await page.mouse.up();
  throw new Error('Hiçbir hücre geçerli görünmedi — sürükleme vurgusu çalışmıyor.');
}

test.describe('2. Sürükle-bırak', () => {
  test('hayalet kart oluşuyor ve imleci takip ediyor', async ({ page }) => {
    await openWithSample(page);
    const card = page.locator('.pool-card').first();
    const box = (await card.boundingBox())!;

    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await expect(page.locator('.ghost')).toHaveCount(1);

    await page.mouse.move(600, 400, { steps: 5 });
    const first = (await page.locator('.ghost').boundingBox())!;
    await page.mouse.move(800, 500, { steps: 5 });
    const second = (await page.locator('.ghost').boundingBox())!;
    expect(second.x).toBeGreaterThan(first.x);
    expect(second.y).toBeGreaterThan(first.y);

    // The ghost must not hide the cell under the cursor (pointer-events: none)
    await page.mouse.up();
    await expect(page.locator('.ghost')).toHaveCount(0);
  });

  test('geçerli hücre yeşil, ders bırakılınca yerleşiyor', async ({ page }) => {
    await openWithSample(page);
    await expect(page.locator('table.grid .card')).toHaveCount(0);

    const { day, hour, row } = await dragAndDrop(page);

    // data-row is ESSENTIAL: every row has the same day/hour cell, a selector
    // without the row would look at the wrong one.
    const cell = page.locator(
      `tbody td[data-row="${row}"][data-day="${day}"][data-hour="${hour}"]`,
    );
    await expect(cell.locator('.card')).toHaveCount(1);
  });

  test('hedef satır ekran dışındaysa sürükleme başlayınca görünür oluyor', async ({ page }) => {
    await openWithSample(page);
    const wrap = page.locator('.grid-wrap');
    const box = (await wrap.boundingBox())!;

    // This was the real bug the E2E suite caught: when the target row stayed
    // below the fold the user could never reach it.
    await startDrag(page);
    const row = (await page.locator('tr.target-row').boundingBox())!;

    expect(row.y).toBeGreaterThanOrEqual(box.y - 1);
    expect(row.y + row.height).toBeLessThanOrEqual(box.y + box.height + 1);
    await page.mouse.up();
  });

  test('imleç sağ kenara gelince ızgara kendiliğinden kayıyor', async ({ page }) => {
    await openWithSample(page);
    const wrap = page.locator('.grid-wrap');
    const box = (await wrap.boundingBox())!;
    expect(await wrap.evaluate((el) => el.scrollLeft)).toBe(0);

    await startDrag(page);
    // Approach the right edge and wait
    await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2, { steps: 5 });
    await page.waitForTimeout(400);

    expect(await wrap.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test('engelli hücre kırmızı olur ve üstte somut sebep yazar', async ({ page }) => {
    await openWithSample(page);

    // Teachers are closed for a whole day, and that day may sit off the right
    // edge. Keep trying cards until one has a visible closed cell.
    const cardCount = Math.min(await page.locator('.pool-card').count(), 10);
    let tried = false;

    for (let i = 0; i < cardCount && !tried; i++) {
      await startDrag(page, i);
      const points = await visibleCells(page, 'tr.target-row td.unavailable');

      if (points.length === 0) {
        await page.keyboard.press('Escape');
        await page.mouse.up();
        continue;
      }

      const point = points[0]!;
      await page.mouse.move(point.x, point.y, { steps: 3 });
      await page.waitForTimeout(80);

      const closed = page.locator('tr.target-row td.unavailable').nth(point.index);
      await expect(closed).toHaveClass(/drop-blocked/);

      const reason = await page.locator('.reason-bar').textContent();
      expect(reason).toContain('müsait değil');
      // The message must be concrete, not an empty "there is a clash"
      expect(reason).not.toContain('Çakışma var');

      await page.mouse.up();
      await expect(page.locator('table.grid .card')).toHaveCount(0); // not dropped
      tried = true;
    }

    expect(tried, 'görünür kapalı hücresi olan bir kart bulunamadı').toBe(true);
  });

  test('2 saatlik blok sürüklenirken iki hücre birden vurgulanır', async ({ page }) => {
    await openWithSample(page);
    // Rather than hunting for a card with counter "0/N" and blockSize=2, try all
    // cards and take the first one that highlights two cells.
    const cards = page.locator('.pool-card');
    const count = Math.min(await cards.count(), 12);
    let found = false;

    for (let i = 0; i < count && !found; i++) {
      await startDrag(page, i);

      const free = page.locator('tr.target-row td:not(.unavailable)').first();
      const box = await free.boundingBox();
      if (box !== null) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 });
        await page.waitForTimeout(60);
        if ((await page.locator('td.drop-ok').count()) === 2) found = true;
      }
      await page.keyboard.press('Escape');
      await page.mouse.up();
    }
    expect(found, 'blok=2 olan bir ders iki hücre vurgulamalı').toBe(true);
  });

  test('Escape sürüklemeyi iptal eder', async ({ page }) => {
    await openWithSample(page);
    const box = (await page.locator('.pool-card').first().boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await expect(page.locator('.ghost')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(page.locator('.ghost')).toHaveCount(0);

    await page.mouse.up();
    await expect(page.locator('table.grid .card')).toHaveCount(0);
  });
});

test.describe('3. Izgara', () => {
  test('yerleşmiş derse tıklayınca kalkar, Ctrl+Z geri getirir', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const cards = page.locator('table.grid .card');
    const before = await cards.count();
    expect(before).toBeGreaterThan(0);

    await cards.first().click();
    await expect(cards).toHaveCount(0); // if it was a block, all of it went

    await page.keyboard.press('Control+z');
    await expect(cards).toHaveCount(before);
  });

  test('sağa kaydırınca öğretmen sütunu sabit kalır', async ({ page }) => {
    await openWithSample(page);
    const head = page.locator('tbody .row-head').first();
    const before = (await head.boundingBox())!;

    await page.locator('.grid-wrap').evaluate((el) => {
      el.scrollLeft = 1200;
    });
    await page.waitForTimeout(120);

    const after = (await head.boundingBox())!;
    expect(Math.abs(after.x - before.x)).toBeLessThan(2); // stayed put
    expect(after.x).toBeGreaterThanOrEqual(0); // still on screen
  });

  test('sınıf görünümüne geçilir ve sürükleme orada da çalışır', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Sınıf görünümüne geç' }).click();
    await expect(page.locator('table.grid tbody tr')).toHaveCount(20);

    await dragAndDrop(page);
    await expect(page.locator('table.grid .card')).not.toHaveCount(0);
  });

  test('1366x768 ekranda sayfa dikey taşmıyor', async ({ page }) => {
    await openWithSample(page);
    const overflow = await page.evaluate(
      () => document.body.scrollHeight - document.body.clientHeight,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('4. Yazdırma', () => {
  test('her sınıf için bir sayfa ve yatay taşma yok', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.print-page')).toHaveCount(20);

    await page.emulateMedia({ media: 'print' });
    // The top bar and its controls must be hidden in print
    await expect(page.locator('.topbar')).toBeHidden();

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBeLessThanOrEqual(1);
  });

  test('PDF üretilebiliyor ve boş değil', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    expect(pdf.length).toBeGreaterThan(20_000);
  });
});

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

    // Only the current step is on screen; the 1132-line scroll is gone
    await expect(page.getByRole('heading', { name: 'Okul ve günler' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Öğretmenler/ })).toHaveCount(0);

    await openSetup(page, 'Öğretmenler');
    await expect(page.getByRole('heading', { name: /^Öğretmenler/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Okul ve günler' })).toHaveCount(0);

    // Not a locked wizard: jumping straight to the last step works
    await openSetup(page, 'Kurallar');
    await expect(page.getByRole('heading', { name: 'Kurallar' })).toBeVisible();
    // ...and "next step" is only a shortcut
    await openSetup(page, 'Sınıflar');
    await page.getByRole('button', { name: /Sonraki adım: Dersler/ }).click();
    await expect(page.locator('.step[aria-current="true"]')).toContainText('Dersler');
  });

  test('yedek indirilebiliyor', async ({ page }) => {
    await openWithSample(page);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Yedek indir' }).click();
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
    await openSetup(page, 'Okul');

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
});

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

    await openSetup(page, 'Okul');
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

    await openSetup(page, 'Okul');
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

/**
 * A hand-built world loaded through the real "Yedek yükle" dialog: 2 days x 4
 * hours, one teacher, one class. Everything fits on screen, so the rule tests
 * below do not depend on where the sample data happens to leave a free cell.
 */
const FIXTURE = {
  schemaVersion: 3,
  settings: {
    schoolName: '',
    days: [
      { name: 'Salı', longBreakAfter: 0 },
      { name: 'Çarşamba', longBreakAfter: 0 },
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
    { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blockSize: 1, maxPerDay: null },
  ],
  unavailable: {},
  placements: {},
};

async function openFixture(page: Page) {
  await open(page);
  page.once('dialog', (d) => d.accept());
  await page.locator('input[type=file]').setInputFiles({
    name: 'ders-programi-2026-08-24-1200.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(FIXTURE)),
  });
  await expect(page.getByRole('button', { name: 'Program' })).toBeVisible();
}

/** Moves the mouse over one grid cell mid-drag and waits for the highlight. */
async function hover(page: Page, day: number, hour: number) {
  const cell = page.locator(`tr.target-row td[data-day="${day}"][data-hour="${hour}"]`);
  const box = (await cell.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 });
  await page.waitForTimeout(80); // the highlight is applied in the rAF loop
  return cell;
}

test.describe('9. Öğle arası ayracı', () => {
  test('ayraç hafta içi 5., hafta sonu 6. dersten sonra duruyor', async ({ page }) => {
    await openWithSample(page);

    // One separator per day, 6 days
    await expect(page.locator('table.grid tbody tr').first().locator('td.break-col')).toHaveCount(6);

    // Its position IS the break: count the real cells before it in each day.
    const positions = await page.evaluate(() => {
      const row = document.querySelector('table.grid tbody tr')!;
      const out: number[] = [];
      let seen = 0;
      for (const cell of row.querySelectorAll('td')) {
        if (cell.classList.contains('break-col')) {
          out.push(seen);
          continue;
        }
        if (cell.dataset['hour'] === '0') seen = 0; // a new day starts
        seen++;
      }
      return out;
    });
    // Tuesday..Friday break after the 5th, Saturday and Sunday after the 6th
    expect(positions).toEqual([5, 5, 5, 5, 6, 6]);
  });

  test('ayraca ders bırakılamaz — sürükleme onu hedef saymıyor', async ({ page }) => {
    await openWithSample(page);
    const separator = page.locator('tr.target-row td.break-col').first();

    await startDrag(page);
    const box = await separator.boundingBox();
    expect(box, 'ayraç görünür olmalı').not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2, { steps: 3 });
    await page.waitForTimeout(80);

    // Nothing is highlighted: the separator is not a cell
    await expect(separator).not.toHaveClass(/drop-/);
    await page.mouse.up();
    await expect(page.locator('table.grid .card')).toHaveCount(0);
  });

  test('zil önizlemesinde öğle arası satırı var ve iki desende ayrı yerde', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Okul');

    const rows = page.locator('table.bell-preview tr.break-row');
    await expect(rows).toHaveCount(2); // after the 5th and after the 6th
    await expect(rows.first()).toContainText('Öğle arası — 30 dk');

    // The weekday column breaks after the 5th, the weekend column does not
    const first = rows.first().locator('td');
    await expect(first.nth(0)).toContainText('Öğle arası');
    await expect(first.nth(1)).toHaveText('');
  });
});

test.describe('7. Sınıf müsaitliği ve kurallar', () => {
  test('sınıfın kapalı saatine ders bırakılamıyor ve sebebi yazıyor', async ({ page }) => {
    await openFixture(page);

    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await page.getByRole('button', { name: 'Sınıf', exact: true }).click();
    await expect(page.getByLabel('Müsaitlik listesi')).toHaveValue('s510');
    // row = 1st hour, column = 1st day
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
    await openSetup(page, 'Kurallar');

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
    await openSetup(page, 'Kurallar');
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
// 8. Theme
//
// The app used to have NO dark theme, yet the screenshots came out dark: the
// browser darkens a light page with its own algorithm. For this tool that is
// not cosmetic — colour is the only feedback channel (green = droppable,
// yellow = warning, red = blocked), and the browser's darkening flattens the
// three into each other. These tests measure what is actually painted.

/** "rgb(18, 53, 33)" -> [18, 53, 33] */
function rgb(value: string): [number, number, number] {
  const parts = value.match(/\d+(\.\d+)?/g);
  if (parts === null || parts.length < 3) throw new Error(`renk okunamadı: ${value}`);
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

function relativeLuminance(color: [number, number, number]): number {
  const [r, g, b] = color.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = relativeLuminance(rgb(a));
  const lb = relativeLuminance(rgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * CIE Lab distance. Contrast ratio is the WRONG measure for "are these two
 * backgrounds tellable apart": two colours can differ wildly in hue and still
 * have the same luminance, which is exactly the case for a dark green and a
 * dark olive.
 */
function deltaE(a: string, b: string): number {
  const toLab = (value: string) => {
    const [r, g, bl] = rgb(value).map((v) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    const x = (0.4124 * r + 0.3576 * g + 0.1805 * bl) / 0.95047;
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    const z = (0.0193 * r + 0.1192 * g + 0.9505 * bl) / 1.08883;
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  };
  const la = toLab(a);
  const lb = toLab(b);
  return Math.hypot(la[0]! - lb[0]!, la[1]! - lb[1]!, la[2]! - lb[2]!);
}

/** Resolves the theme tokens to real rgb() values, the way the page paints them. */
async function tokens(page: Page, names: string[]): Promise<Record<string, string>> {
  return page.evaluate((list) => {
    const probe = document.createElement('span');
    document.body.appendChild(probe);
    const out: Record<string, string> = {};
    for (const name of list) {
      probe.style.color = `var(${name})`;
      out[name] = getComputedStyle(probe).color;
    }
    probe.remove();
    return out;
  }, names);
}

test.describe('8. Tema', () => {
  test('tema düğmesi çalışıyor ve tercih sayfa yenilenince duruyor', async ({ page }) => {
    await open(page);
    const toggle = page.getByRole('button', { name: 'Koyu tema' });

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  // Both themes, because the light one regressed too: --ok was 4.19:1 on its own
  // background and the "x" on a closed cell was 4.20:1.
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} temada durum renkleri ayırt edilebiliyor ve metin AA geçiyor`, async ({
      page,
    }) => {
      await open(page);
      if (theme === 'dark') await page.getByRole('button', { name: 'Koyu tema' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const t = await tokens(page, [
        '--ok',
        '--ok-bg',
        '--warn',
        '--warn-bg',
        '--bad',
        '--bad-bg',
        '--text',
        '--paper',
        '--muted',
        '--closed',
        '--accent',
        '--accent-bg',
      ]);

      // The page must really be the theme it claims, not a browser-darkened one
      const paperLuminance = relativeLuminance(rgb(t['--paper']!));
      if (theme === 'dark') expect(paperLuminance).toBeLessThan(0.1);
      else expect(paperLuminance).toBeGreaterThan(0.9);

      // Tellable apart from each other, and from a closed cell
      expect(deltaE(t['--ok-bg']!, t['--warn-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--warn-bg']!, t['--bad-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--ok-bg']!, t['--bad-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--closed']!, t['--paper']!)).toBeGreaterThan(12);

      // Readable (WCAG AA)
      for (const [fg, bg] of [
        ['--ok', '--ok-bg'],
        ['--warn', '--warn-bg'],
        ['--bad', '--bad-bg'],
        ['--text', '--paper'],
        ['--muted', '--paper'],
        ['--muted', '--closed'],
        ['--accent', '--accent-bg'],
      ] as const) {
        expect(contrast(t[fg]!, t[bg]!), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test('koyu temada sürükleme geri bildirimi hâlâ üç ayrı renk', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    // The card text sits on the teacher palette, which does NOT flip with the
    // theme — so its ink must not flip either, or the cell becomes unreadable.
    const card = page.locator('.pool-card').first();
    const ink = await card.evaluate((el) => {
      const own = getComputedStyle(el);
      const sub = el.querySelector('.card-bottom');
      return {
        background: own.backgroundColor,
        color: own.color,
        subColor: sub === null ? own.color : getComputedStyle(sub).color,
      };
    });
    expect(contrast(ink.color, ink.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink.subColor, ink.background)).toBeGreaterThanOrEqual(4.5);

    const t = await tokens(page, ['--ok-bg', '--bad-bg', '--closed']);
    expect(deltaE(t['--ok-bg']!, t['--closed']!)).toBeGreaterThan(15);
    expect(deltaE(t['--bad-bg']!, t['--closed']!)).toBeGreaterThan(15);
  });

  test('koyu temada bile kâğıda açık basılıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Yazdır' }).click();

    await page.emulateMedia({ media: 'print' });
    const printed = await tokens(page, ['--paper', '--text']);
    // White paper, dark ink — regardless of what the screen is set to
    expect(relativeLuminance(rgb(printed['--paper']!))).toBeGreaterThan(0.9);
    expect(relativeLuminance(rgb(printed['--text']!))).toBeLessThan(0.1);

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(relativeLuminance(rgb(bodyBg))).toBeGreaterThan(0.9);
    await page.emulateMedia({ media: 'screen' });
  });
});
