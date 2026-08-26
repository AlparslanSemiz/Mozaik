// The Müsaitlik tab: row = day, column = lesson (aSc's Time off layout).
//
// `table.availability` is no longer unique: C9 put a second one in the right
// column — the "haftanın darlığı" heat map, which reuses the same shape to say
// how many people are closed at each hour. The paintable one is
// `table.availability:not(.heat)` and every locator here says so.

import { expect, test, type Page } from '@playwright/test';
import { chooseEntity, open, openWithSample, dragAndDrop, tokens, rgb, contrast } from './helpers';

test.describe('10. Müsaitlik çizelgesi', () => {
  test('satır = gün, sütun = ders; gün satırına tıklayınca o gün kapanıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();

    const table = page.locator('table.availability:not(.heat)');
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
    const table = page.locator('table.availability:not(.heat)');

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
      [...document.querySelectorAll('table.availability:not(.heat) tbody tr')].map((row) =>
        [...row.querySelectorAll('td')].findIndex((td) => td.classList.contains('break-after')),
      ),
    );
    // 0-based index of the cell the break follows: 5th lesson / 6th lesson
    expect(positions).toEqual([4, 4, 4, 4, 5, 5]);
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
    await chooseEntity(page, entityId);
    await page
      .locator('table.availability:not(.heat) tbody tr')
      .nth(day)
      .locator('td')
      .nth(hour)
      .click();
  }

  test('kapatınca ders SİLİNMİYOR, kırmızı işaretleniyor', async ({ page }) => {
    const { before } = await conflict(page);

    await page.getByRole('button', { name: 'Program', exact: true }).click();
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
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();

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
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid .card.conflict').first()).toBeVisible();

    await closeHour(page, row, day, hour); // toggles it back open
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid .card.conflict')).toHaveCount(0);
  });
});

// THE CROSS (2026-08-26, asked for: "müsaitlikte çarpılar büyük ve kırmızı
// olabilir"). The reader has trouble seeing, and --muted at --fs-lg on a
// hatched grey was the faintest mark in the program.
//
// The reason this is measured rather than eyeballed: red is a FUNCTIONAL
// colour in this tool — it means "this drop is refused" — and grey hatching
// means "this hour is closed". Letting the second borrow the first's colour is
// only safe because the two can never be on screen together here. What the
// test holds is the part that could rot: the mark is red, it is bigger than
// the body text, it reads against its own ground, and the hatch is still there
// so the state does not depend on the colour alone.
test.describe('67. Kapalı saatin işareti', () => {
  test('çarpı KIRMIZI, büyük, ve kendi zemininde okunuyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    // Clean slate: the sample's first teacher already has a whole day shut, so
    // clicking a cell blind would OPEN one rather than close one.
    await page.getByRole('button', { name: 'Tümünü aç' }).click();
    const cell = page.locator('table.availability:not(.heat) tbody td').first();
    await cell.click();
    await expect(cell).toHaveClass(/closed/);

    const seen = await cell.evaluate((el) => {
      const cs = getComputedStyle(el);
      const root = getComputedStyle(document.documentElement);
      return {
        color: cs.color,
        bad: root.getPropertyValue('--bad').trim(),
        size: Number.parseFloat(cs.fontSize),
        body: Number.parseFloat(getComputedStyle(document.body).fontSize),
        // The hatch: colour is never the only carrier of a state.
        hatched: cs.backgroundImage.includes('gradient'),
        text: (el.textContent ?? '').trim(),
      };
    });

    expect(seen.text).toBe('×');
    expect(seen.hatched, 'tarama kalkmış — renk tek başına durum taşıyamaz').toBe(true);
    expect(seen.size, `çarpı ${seen.size}px, gövde ${seen.body}px`).toBeGreaterThan(seen.body);

    // Red, and it is the app's own red rather than a second one.
    const [r, g, b] = rgb(seen.color);
    const [br, bg, bb] = rgb(
      await page.evaluate((hex) => {
        const p = document.createElement('span');
        p.style.color = hex;
        document.body.appendChild(p);
        const out = getComputedStyle(p).color;
        p.remove();
        return out;
      }, seen.bad),
    );
    expect([r, g, b]).toEqual([br, bg, bb]);

    // ...and it is readable on the hatch it sits on. The hatch alternates two
    // greys, so the darker one is the honest ground to measure against.
    const ground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--closed').trim(),
    );
    const asRgb = await page.evaluate((hex) => {
      const p = document.createElement('span');
      p.style.color = hex;
      document.body.appendChild(p);
      const out = getComputedStyle(p).color;
      p.remove();
      return out;
    }, ground);
    const ratio = contrast(seen.color, asRgb);
    expect(ratio, `çarpı/zemin kontrastı ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
  });

  test('ISI haritasındaki sayılar kırmızıya dönmedi', async ({ page }) => {
    // The heat table wears the same `td.closed` class for a completely
    // different thing — how many people are shut at that hour — and a count of
    // six out of twenty-five is not a refusal.
    await openWithSample(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    const heat = page.locator('table.availability.heat td.closed').first();
    if ((await heat.count()) === 0) return;
    const color = await heat.evaluate((el) => getComputedStyle(el).color);
    const text = await page.evaluate(
      () => getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
    );
    const asRgb = await page.evaluate((hex) => {
      const p = document.createElement('span');
      p.style.color = hex;
      document.body.appendChild(p);
      const out = getComputedStyle(p).color;
      p.remove();
      return out;
    }, text);
    expect(rgb(color)).toEqual(rgb(asRgb));
  });
});
