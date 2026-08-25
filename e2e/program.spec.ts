// The Program tab: the grid, the pool, dragging, moving and removing.

import { expect, test, type Page } from '@playwright/test';
import { openWithSample, openSettings, startDrag, visibleCells, dragAndDrop } from './helpers';

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
