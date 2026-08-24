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

/**
 * The same for Ayarlar. School days, the bell, the four rules and the subject
 * list all live there now, not in Kurulum.
 */
async function openSettings(page: Page, section: string) {
  await page.getByRole('button', { name: 'Ayarlar' }).click();
  await page.locator('.step', { hasText: section }).click();
  await expect(page.locator('.step[aria-current="true"]')).toContainText(section);
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

/**
 * Drags a card from the pool into the first valid cell of the grid.
 *
 * Tries the next card when a whole row has no droppable cell ON SCREEN: with
 * real-scale data a teacher can be closed on every visible day, and which card
 * sits first in the pool depends on the current view. That is a property of the
 * sample data, not a bug, so it must not decide whether a test passes.
 */
async function dragAndDrop(page: Page): Promise<{ day: string; hour: string; row: string }> {
  const cardCount = await page.locator('.pool-card').count();

  for (let index = 0; index < Math.min(cardCount, 8); index++) {
    await startDrag(page, index);

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
    await page.keyboard.press('Escape');
    await page.mouse.up();
  }
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
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
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

  test('sayfa A4 YATAY basılıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });

    // 12 lesson columns do not fit portrait; the page must come out landscape.
    const box = /MediaBox\s*\[\s*0(?:\.\d+)?\s+0(?:\.\d+)?\s+([\d.]+)\s+([\d.]+)/.exec(
      pdf.toString('latin1'),
    );
    expect(box, 'PDF MediaBox okunamadı').not.toBeNull();
    const [width, height] = [Number(box![1]), Number(box![2])];
    expect(width).toBeGreaterThan(height);
    // A4 landscape is 841.89 x 595.28 pt
    expect(Math.round(width)).toBe(842);
    expect(Math.round(height)).toBe(595);
  });

  test('baskı sütunları eşit ve eksen dönmüş', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    const table = page.locator('table.print').first();
    // Row = day (full name), column = lesson
    await expect(table.locator('tbody tr')).toHaveCount(6);
    await expect(table.locator('tbody tr').first().locator('th')).toHaveText('Salı');
    await expect(table.locator('tbody tr').first().locator('td')).toHaveCount(12);

    // Equal columns: a filled cell used to widen its own column
    const widths = await table.locator('tbody tr').first().locator('td').evaluateAll((cells) =>
      cells.map((c) => c.getBoundingClientRect().width),
    );
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);

    // The long break marks each row at its own lesson
    const marks = await table.locator('tbody tr').evaluateAll((rows) =>
      rows.map((r) => [...r.querySelectorAll('td')].findIndex((c) => c.classList.contains('p-break'))),
    );
    expect(marks).toEqual([4, 4, 4, 4, 5, 5]);

    await page.emulateMedia({ media: 'screen' });
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

test.describe('13. Görünüm simgeleri', () => {
  test('seçili olan basılı, diğeri değil; tıklayınca satırlar dönüyor', async ({ page }) => {
    await openWithSample(page);

    const teacher = page.getByRole('button', { name: 'Öğretmen görünümü' });
    const group = page.getByRole('button', { name: 'Sınıf görünümü' });

    // The old single button said what the next click does, never where you are
    await expect(teacher).toHaveAttribute('aria-pressed', 'true');
    await expect(group).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('table.grid .corner')).toHaveText('Öğretmen');
    await expect(page.locator('table.grid tbody tr')).toHaveCount(25);

    await group.click();
    await expect(group).toHaveAttribute('aria-pressed', 'true');
    await expect(teacher).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('table.grid .corner')).toHaveText('Sınıf');
    await expect(page.locator('table.grid tbody tr')).toHaveCount(20);

    // The sentence beside the icons stays: an icon alone is a guess the first time
    await expect(page.locator('.hint.inline')).toContainText('Satırlar sınıf');
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

test.describe('11. Görsel cila', () => {
  test('başlık altındaki sütunla aynı hizada', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Okul ve zil');

    // The bell preview centres its cells; its headings used to be left-aligned,
    // so the day names sat visibly off their own column.
    const head = page.locator('table.bell-preview thead th').nth(1);
    const cell = page.locator('table.bell-preview tbody tr').first().locator('td').first();
    const [a, b] = [await head.boundingBox(), await cell.boundingBox()];
    const centre = (box: { x: number; width: number }) => box.x + box.width / 2;
    expect(Math.abs(centre(a!) - centre(b!))).toBeLessThanOrEqual(1);
  });

  test('klavyeyle gezerken nerede olduğun belli', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');

    const focus = await page.evaluate(() => {
      const el = document.activeElement;
      if (el === null) return null;
      const s = getComputedStyle(el);
      return { tag: el.tagName, style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(focus).not.toBeNull();
    expect(focus!.tag).toBe('BUTTON');
    expect(focus!.style).not.toBe('none');
    expect(parseFloat(focus!.width)).toBeGreaterThan(0);
  });

  test('tehlikeli düğme beklemeden tehlikeli görünüyor', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Veri');
    const [danger, plain] = await Promise.all([
      page
        .getByRole('button', { name: 'Her şeyi sil' })
        .evaluate((el) => getComputedStyle(el).color),
      page.getByRole('button', { name: 'Dosyadan aç' }).evaluate((el) => getComputedStyle(el).color),
    ]);
    // Not identical to a plain button until the pointer is already on it
    expect(danger).not.toBe(plain);
    const bad = await tokens(page, ['--bad']);
    expect(danger).toBe(bad['--bad']);
  });
});

test.describe('10. Müsaitlik çizelgesi', () => {
  test('satır = gün, sütun = ders; gün satırına tıklayınca o gün kapanıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();

    const table = page.locator('table.availability');
    // The sample teacher already has a whole day closed; start from a clean slate
    await page.getByRole('button', { name: 'Tümünü aç' }).click();
    // 6 day rows, 12 lesson columns
    await expect(table.locator('tbody tr')).toHaveCount(6);
    await expect(table.locator('tbody tr').first().locator('td')).toHaveCount(12);
    await expect(table.locator('tbody tr').first().locator('th')).toHaveText('Sal');
    // "Cuma" and "Cumartesi" must not both read "Cum", and Pazar is Pzr
    const heads = await table.locator('tbody tr th').allTextContents();
    expect(heads).toEqual(['Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pzr']);

    // Clicking the day header closes that whole day, and only that day
    const wednesday = table.locator('tbody tr').nth(1);
    await wednesday.locator('th').click();
    await expect(wednesday.locator('td.closed')).toHaveCount(12);
    await expect(table.locator('tbody tr').first().locator('td.closed')).toHaveCount(0);
    // ...and clicking again reopens it
    await wednesday.locator('th').click();
    await expect(wednesday.locator('td.closed')).toHaveCount(0);
  });

  test('sütun başlığı haftanın o saatini değiştiriyor, saat uyuşmayınca boş kalıyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await page.getByRole('button', { name: 'Tümünü aç' }).click();
    const table = page.locator('table.availability');

    // Lessons 1-5 are the same on every day, so they carry a clock...
    await expect(table.locator('thead th').nth(1)).toContainText('09:00');
    // ...but the 6th starts at 13:30 on weekdays and 13:10 at the weekend
    await expect(table.locator('thead th').nth(6)).not.toContainText(':');

    await table.locator('thead th').nth(3).click();
    await expect(table.locator('tbody td.closed')).toHaveCount(6); // one per day
  });

  test('öğle arası her satırda kendi yerinde işaretli', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();

    const positions = await page.evaluate(() =>
      [...document.querySelectorAll('table.availability tbody tr')].map((row) =>
        [...row.querySelectorAll('td')].findIndex((td) => td.classList.contains('break-after')),
      ),
    );
    // 0-based index of the cell the break follows: 5th lesson / 6th lesson
    expect(positions).toEqual([4, 4, 4, 4, 5, 5]);
  });
});

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
    await openSettings(page, 'Okul ve zil');

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

// ---------------------------------------------------------------------------
// 14. Colour palette
//
// The palette used to be twelve CSS variables and colours repeated: with 25
// teachers, three of them shared a colour with someone else and the pool card
// no longer pointed at one row. It is now 36 hex values in src/palette.ts and
// every teacher gets one nobody else has. That claim is measured HERE, on the
// real thing, because a unit test can only prove the array is fine — not that
// the array is what the browser paints.

test.describe('14. Renk paleti', () => {
  test('25 öğretmenin hiçbiri bir başkasıyla aynı renkte değil', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    // The colour select in the teacher list paints itself with that teacher's
    // colour, so it is the one per-teacher swatch on screen.
    const colors = await page
      .locator('table.list tbody tr select[title="Renk"]')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));

    expect(colors.length).toBeGreaterThanOrEqual(25);
    expect(new Set(colors).size, `${colors.length} öğretmen, tekrar eden renk var`).toBe(
      colors.length,
    );
  });

  test('paletteki her renk kartın iki yazısını da AA taşıyor', async ({ page }) => {
    await openWithSample(page);

    const samples = await page.locator('.pool-card').evaluateAll((cards) =>
      cards.map((el) => {
        const own = getComputedStyle(el);
        const sub = el.querySelector('.card-bottom');
        return {
          background: own.backgroundColor,
          color: own.color,
          subColor: sub === null ? own.color : getComputedStyle(sub).color,
        };
      }),
    );

    expect(samples.length).toBeGreaterThan(5);
    for (const s of samples) {
      expect(contrast(s.color, s.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(s.subColor, s.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('renkler birbirinden gerçekten ayırt ediliyor', async ({ page }) => {
    await openWithSample(page);
    const colors = await page
      .locator('.pool-card')
      .evaluateAll((cards) => cards.map((el) => getComputedStyle(el).backgroundColor));

    const unique = [...new Set(colors)];
    expect(unique.length).toBeGreaterThan(12); // the old palette's whole range

    let worst = Infinity;
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        worst = Math.min(worst, deltaE(unique[i]!, unique[j]!));
      }
    }
    expect(worst).toBeGreaterThanOrEqual(15);
  });

  test('her sınıfın da kendi rengi var ve satır başında görünüyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    const swatches = await page
      .locator('table.list tbody tr select[title="Renk"]')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(swatches.length).toBeGreaterThanOrEqual(15);
    expect(new Set(swatches).size, 'iki sınıf aynı renkte').toBe(swatches.length);

    // The class colour is a MARK, not the cell fill: it shows on the row head.
    await page.getByRole('button', { name: 'Program' }).click();
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    const dots = await page
      .locator('tbody .row-head .row-dot')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(dots.length).toBe(swatches.length);
    expect(new Set(dots).size).toBe(dots.length);
  });

  test('hücreler her iki görünümde de ÖĞRETMEN renginde kalıyor', async ({ page }) => {
    // The decision behind the class colour: it marks the row, it never repaints
    // the grid. A cell keeps saying which teacher is in it.
    await openWithSample(page);
    await dragAndDrop(page);

    const teacherViewCell = await page
      .locator('table.grid .card')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    const classViewCell = await page
      .locator('table.grid .card')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(classViewCell).toBe(teacherViewCell);
  });

  test('palet iki temada ve kâğıtta AYNI', async ({ page }) => {
    await openWithSample(page);
    const read = () =>
      page
        .locator('.pool-card')
        .evaluateAll((cards) => cards.map((el) => getComputedStyle(el).backgroundColor));

    const light = await read();
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await read()).toEqual(light);

    // Still dark on screen; the paper must show the very same pastels.
    await page.emulateMedia({ media: 'print' });
    expect(await read()).toEqual(light);
    await page.emulateMedia({ media: 'screen' });
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

// ---------------------------------------------------------------------------
// 18. The pool follows the view
//
// A reported bug: switching to the class view turned the grid around but left
// the pool exactly as it was — class on top, sorted by teacher — so the cards
// belonging to one visible row were scattered, and the ghost that lifted off a
// card said something the card did not.

test.describe('18. Havuz görünümü takip ediyor', () => {
  test('sınıf görünümünde kartın üst satırı öğretmen oluyor', async ({ page }) => {
    await openWithSample(page);

    const first = page.locator('.pool-card').first();
    const teacherViewTop = await first.locator('.card-top').innerText();
    const teacherViewBottom = await first.locator('.card-bottom').innerText();

    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();

    const cards = page.locator('.pool-card');
    const tops = await cards.locator('.card-top').allInnerTexts();
    const bottoms = await cards.locator('.card-bottom').allInnerTexts();

    // Class names in the sample are numbers ("510"); teacher short forms are not.
    expect(teacherViewTop).toMatch(/^\d+$/);
    expect(teacherViewBottom).not.toMatch(/^\d+$/);
    expect(tops.every((x) => !/^\d+$/.test(x))).toBe(true);
    expect(bottoms.every((x) => /^\d+$/.test(x))).toBe(true);
  });

  test('kartlar gidecekleri satıra göre gruplanıyor', async ({ page }) => {
    await openWithSample(page);

    const bottoms = async () =>
      page.locator('.pool-card .card-bottom').allInnerTexts();

    // The bottom line names the target row, and equal values must be adjacent:
    // otherwise one row's cards are spread across the whole pool.
    for (const view of ['Öğretmen görünümü', 'Sınıf görünümü']) {
      await page.getByRole('button', { name: view }).click();
      const list = await bottoms();
      expect(list.length).toBeGreaterThan(10);
      const seen = new Set<string>();
      let previous = '';
      for (const value of list) {
        if (value !== previous) {
          expect(seen.has(value), `${value} havuzda dağılmış`).toBe(false);
          seen.add(value);
          previous = value;
        }
      }
    }
  });

  test('kart ile hayalet aynı şeyi söylüyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();

    const card = page.locator('.pool-card').first();
    const cardTop = await card.locator('.card-top').innerText();

    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 60, box.y - 40, { steps: 4 });

    const ghostTop = await page.locator('.ghost .card-top').innerText();
    expect(ghostTop).toBe(cardTop);
    await page.keyboard.press('Escape');
  });

  test('kart rengi iki görünümde de öğretmen rengi', async ({ page }) => {
    await openWithSample(page);
    const read = () =>
      page
        .locator('.pool-card')
        .evaluateAll((cards) => cards.map((el) => getComputedStyle(el).backgroundColor));

    const inTeacherView = await read();
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    const inClassView = await read();
    // Same set of colours; only the order and the labels change.
    expect(new Set(inClassView)).toEqual(new Set(inTeacherView));
  });
});

// ---------------------------------------------------------------------------
// 19. Icons, the lunch separator and the closed-hour mark
//
// Three things that only exist as pixels. jsdom has no layout and no computed
// font size, so none of this can be checked anywhere but here.

test.describe('19. Simgeler, ayraç ve çarpı', () => {
  test('iki görünüm simgesi birbirine benzemiyor', async ({ page }) => {
    await openWithSample(page);

    const shapes = async (name: string) =>
      page
        .getByRole('button', { name })
        .locator('svg *')
        .evaluateAll((list) =>
          list.map((el) =>
            [
              el.tagName,
              el.getAttribute('d') ?? '',
              el.getAttribute('cx') ?? '',
              el.getAttribute('cy') ?? '',
              el.getAttribute('r') ?? '',
            ].join(':'),
          ),
        );

    const teacher = await shapes('Öğretmen görünümü');
    const student = await shapes('Sınıf görünümü');

    expect(teacher.length).toBeGreaterThan(0);
    expect(student.length).toBeGreaterThan(0);
    // Not one variation on the other: no shape is shared between them.
    expect(teacher.filter((x) => student.includes(x))).toEqual([]);

    // Both are drawn big enough to be recognised at all.
    for (const name of ['Öğretmen görünümü', 'Sınıf görünümü']) {
      const box = (await page.getByRole('button', { name }).locator('svg').boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(16);
    }
  });

  test('seçili simge basılı, diğeri soluk', async ({ page }) => {
    await openWithSample(page);
    const teacher = page.getByRole('button', { name: 'Öğretmen görünümü' });
    const klass = page.getByRole('button', { name: 'Sınıf görünümü' });

    await expect(teacher).toHaveAttribute('aria-pressed', 'true');
    await expect(klass).toHaveAttribute('aria-pressed', 'false');

    const dim = async (l: typeof teacher) => Number(await l.evaluate((el) => getComputedStyle(el).opacity));
    expect(await dim(teacher)).toBeGreaterThan(await dim(klass));
  });

  test('öğle arası ayracı hücreden belirgin biçimde ince', async ({ page }) => {
    await openWithSample(page);

    const separator = (await page.locator('table.grid tbody .break-col').first().boundingBox())!;
    const cell = (await page.locator('table.grid td[data-day="0"]').first().boundingBox())!;

    expect(separator.width).toBeLessThanOrEqual(8);
    expect(separator.width).toBeLessThan(cell.width / 3);
    // Still a real column with its own edges, not a hairline that goes unseen.
    expect(separator.width).toBeGreaterThanOrEqual(4);
  });

  test('kapalı saatin çarpısı büyüdü ve hâlâ okunuyor', async ({ page }) => {
    await openWithSample(page);

    const mark = page.locator('table.grid td.unavailable').first();
    await expect(mark).toContainText('×');
    const style = await mark.evaluate((el) => {
      const own = getComputedStyle(el);
      return { size: parseFloat(own.fontSize), color: own.color, background: own.backgroundColor };
    });
    expect(style.size).toBeGreaterThanOrEqual(15);

    // Bigger must not mean fainter: the hatch sits on --closed.
    const t = await tokens(page, ['--closed']);
    expect(contrast(style.color, t['--closed']!)).toBeGreaterThanOrEqual(4.5);

    // The same mark on the availability grid grew too.
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    const availSize = await page
      .locator('table.availability td.closed')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(availSize).toBeGreaterThanOrEqual(15);
  });
});

// ---------------------------------------------------------------------------
// 20. A lesson on an hour that has since been closed
//
// Availability is edited AFTER a timetable is laid out. Closing an hour that
// already held a lesson used to do nothing at all — and worse, it was
// invisible: the hatch is drawn only on EMPTY cells, so the card covered the
// closed hour and neither the grid nor Kontrol ever said a word.
//
// The lesson is NOT removed (principle 6). It is marked instead.

test.describe('20. Kapalı saatte ders', () => {
  /** Lays a lesson down, then closes exactly that hour for its teacher. */
  async function conflict(page: Page) {
    await openWithSample(page);
    const { day, hour, row } = await dragAndDrop(page);
    const before = await page.locator('table.grid .card').count();
    expect(before).toBeGreaterThan(0);

    await closeHour(page, row, Number(day), Number(hour));
    return { day: Number(day), hour: Number(hour), row, before };
  }

  /** Toggles one cell of the availability grid for one entity. */
  async function closeHour(page: Page, entityId: string, day: number, hour: number) {
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    // The row the card landed on IS the teacher: the grid row id is the id.
    await page.getByLabel('Müsaitlik listesi').selectOption(entityId);
    await page
      .locator('table.availability tbody tr')
      .nth(day)
      .locator('td')
      .nth(hour)
      .click();
  }

  test('kapatınca ders SİLİNMİYOR, kırmızı işaretleniyor', async ({ page }) => {
    const { before } = await conflict(page);

    await page.getByRole('button', { name: 'Program' }).click();
    // Nothing was removed.
    await expect(page.locator('table.grid .card')).toHaveCount(before);
    // ...and the clash is visible instead of hidden under the card.
    const marked = page.locator('table.grid .card.conflict');
    await expect(marked.first()).toBeVisible();

    const outline = await marked
      .first()
      .evaluate((el) => getComputedStyle(el).outlineColor);
    const bad = await tokens(page, ['--bad']);
    expect(outline).toBe(bad['--bad']);
    await expect(marked.first()).toHaveAttribute('title', /müsait değil|kapalı/);
  });

  test('Kontrol sekmesi tek tek sayıyor ve sebebini yazıyor', async ({ page }) => {
    await conflict(page);
    await page.getByRole('button', { name: 'Kontrol' }).click();

    const panel = page.locator('.panel', { hasText: 'Kapalı saatte ders' });
    await expect(panel.getByRole('heading', { name: /Kapalı saatte ders/ })).toBeVisible();
    await expect(panel.locator('tbody tr')).not.toHaveCount(0);
    await expect(panel.locator('tbody tr').first()).toContainText(/müsait değil|kapalı/);
  });

  test('Müsaitlik ekranı olan biteni söylüyor', async ({ page }) => {
    await conflict(page);
    await expect(page.locator('.warn-box', { hasText: 'yerleşmiş' })).toContainText(
      'Hiçbiri silinmedi',
    );
  });

  test('saat yeniden açılınca işaret kalkıyor', async ({ page }) => {
    const { day, hour, row } = await conflict(page);
    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid .card.conflict').first()).toBeVisible();

    await closeHour(page, row, day, hour); // toggles it back open
    await page.getByRole('button', { name: 'Program' }).click();
    await expect(page.locator('table.grid .card.conflict')).toHaveCount(0);
  });
});
