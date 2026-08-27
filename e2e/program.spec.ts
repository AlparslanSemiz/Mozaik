// The Program tab: the grid, the pool, dragging, moving and removing.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { openWithSample, openSettings, startDrag, visibleCells, dragAndDrop, loadWorld, hover } from './helpers';

test.describe('2. Sürükle-bırak', () => {

  // "kartların üzerine hover edince biraz daha yukarı çıkmaları güzel fakat
  //  çekmecenin altına kaçıyorlar."
  //
  // The lift was right and the box was wrong: `.pool-list` scrolls, its top
  // padding was 0, and the first row of cards therefore sat flush against the
  // edge that clips. Measured before the fix: the hovered card's painted top —
  // its own box, minus the 2px outline drawn 1px outside it, minus the
  // --slide/4 lift — was 5.2px ABOVE the scroll box and simply cut off.
  //
  // The card is measured with its OUTLINE, not by its bounding box: the box was
  // never the part that disappeared.
  test('havuzda hover eden kart çekmecenin dışına taşmıyor', async ({ page }) => {
    await openWithSample(page);
    const card = page.locator('.pool-card').first();
    await expect(card).toBeVisible();
    await card.hover();

    const m = await page.evaluate(() => {
      const c = document.querySelector('.pool-card') as HTMLElement;
      const list = document.querySelector('.pool-list') as HTMLElement;
      const style = getComputedStyle(c);
      const paintedTop =
        c.getBoundingClientRect().top -
        (parseFloat(style.outlineWidth) || 0) -
        (parseFloat(style.outlineOffset) || 0);
      return {
        outside: list.getBoundingClientRect().top - paintedTop,
        lifted: style.transform !== 'none',
      };
    });

    // The lift itself has to still be happening, or this would pass on a card
    // that simply stopped moving — the reader liked the movement.
    expect(m.lifted, 'kart artık hiç kalkmıyor').toBe(true);
    // 0.5px of tolerance and no more: that is sub-pixel rounding, not a gap.
    expect(m.outside, `${m.outside.toFixed(2)}px dışarıda`).toBeLessThanOrEqual(0.5);
  });
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
    // A SHORT screen, deliberately. 25 teachers now fit the 1080px monitor with
    // the pool docked to the right, so on the real viewport there is no row
    // below the fold to scroll to — and the condition this test exists for
    // would never occur. It is not a hypothetical one: a school with forty
    // teachers, or a laptop, produces it on any screen.
    await page.setViewportSize({ width: 1920, height: 560 });
    await openWithSample(page);
    const wrap = page.locator('.grid-wrap');

    // The condition this test is about has to be FORCED, not hoped for.
    // It used to rely on the pool costing the grid 215px at the bottom of the
    // screen, which left six of the twenty-five rows below the fold by
    // accident. The pool is a dock down the right now and all 25 rows fit, so
    // the same test would have gone on passing while measuring nothing —
    // exactly the free green of pitfalls 23 and 33. So: scroll the grid to the
    // bottom, then check that the row this card is aimed at really is out of
    // sight BEFORE the drag starts.
    const aimedAt = (await page.locator('.pool-card').first().locator('.card-bottom').innerText())
      .trim();
    const targetRow = page
      .locator('table.grid tbody tr')
      .filter({ has: page.locator('.row-head', { hasText: aimedAt }) })
      .first();

    // Scroll AWAY from the row, whichever way that is: the first card in the
    // pool is aimed at whichever teacher sorts first by row label, which can be
    // anywhere in the list. Scrolling to a fixed end left the row on screen
    // half the time — and a precondition that only sometimes holds is a test
    // that only sometimes tests.
    await targetRow.evaluate((tr) => {
      const scroller = tr.closest('.grid-wrap')!;
      const middle = tr.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      scroller.scrollTo({ top: middle > scroller.clientHeight / 2 ? 0 : scroller.scrollHeight });
    });
    await page.waitForTimeout(100);

    const box = (await wrap.boundingBox())!;
    const before = (await targetRow.boundingBox())!;
    expect(
      before.y + before.height < box.y || before.y > box.y + box.height,
      `"${aimedAt}" satırı sürüklemeden ÖNCE de görünüyordu — test bir şey ölçmüyor`,
    ).toBe(true);

    // This was the real bug the E2E suite caught: when the target row stayed
    // outside the fold the user could never reach it.
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

  // A card no longer stands for a whole lesson: since v7 the tray holds ONE
  // CARD PER BLOCK, so a 2+1 lesson leaves a double and a single side by side
  // and the card itself says which it is. That makes the double findable
  // instead of hunted for — and the test can now also assert the other half,
  // that a single highlights exactly one cell.
  test('2 saatlik blok sürüklenirken iki hücre birden vurgulanır', async ({ page }) => {
    await openWithSample(page);
    const doubles = page.locator('.pool-card[data-size="2"]');
    const singles = page.locator('.pool-card[data-size="1"]');
    expect(await doubles.count(), 'örnek okulda ikili blok yok').toBeGreaterThan(0);
    expect(await singles.count(), 'örnek okulda tek saatlik blok yok').toBeGreaterThan(0);
    // Not in the card's TEXT since 2026-08-27 — "Programda 1 saat x5 veeya
    // 2 saat x3 gibi gözükmesin kartlarda güzel değil." What answers "which
    // block is this" on screen is now the width (`[data-size='2']` is twice
    // `[data-size='1']`, asserted below) and the tooltip, which is where a
    // number the eye does not need but a reader might still lives.
    await expect(doubles.first()).toHaveAttribute('title', /2 saatlik blok/);
    await expect(singles.first()).toHaveAttribute('title', /1 saatlik blok/);
    const widths = await page.evaluate(() => {
      const one = document.querySelector('.pool-card[data-size="1"]');
      const two = document.querySelector('.pool-card[data-size="2"]');
      return { one: one.getBoundingClientRect().width, two: two.getBoundingClientRect().width };
    });
    expect(widths.two, 'ikili blok tekliden geniş çizilmiyor').toBeGreaterThan(widths.one * 1.5);

    // `startDrag` takes a position in the whole tray, so the double and the
    // single are found by their position among ALL the cards.
    const indexOf = (size: number) =>
      page.evaluate(
        (n) => [...document.querySelectorAll('.pool-card')]
          .findIndex((el) => el.getAttribute('data-size') === String(n)),
        size,
      );

    const litCells = async (size: number) => {
      await startDrag(page, await indexOf(size));
      // A cell the drag map already says yes to: hovering a refused one would
      // measure the refusal, not the block's length.
      const ok = await visibleCells(page, 'tr.target-row td.can-ok');
      const spot = ok[0]!;
      await page.mouse.move(spot.x, spot.y, { steps: 3 });
      await page.waitForTimeout(60);
      const n = await page.locator('td.drop-ok').count();
      await page.keyboard.press('Escape');
      await page.mouse.up();
      return n;
    };

    expect(await litCells(2), 'ikili blok iki hücre yakmalı').toBe(2);
    expect(await litCells(1), 'tek saatlik blok bir hücre yakmalı').toBe(1);
  });

  // THE ROW'S ANSWER. Until this existed, the only cell the grid ever painted
  // during a drag was the one under the cursor: which HOURS a lesson could go
  // to was a question you answered by sweeping the mouse across 78 columns,
  // and everything else on screen said only which ROW. The verdicts were
  // already computed — all 84 of them, before the hand had moved a pixel.
  test('sürükleme başlar başlamaz hedef satırın TAMAMI cevaplanıyor', async ({ page }) => {
    await openWithSample(page);
    await startDrag(page);

    const cells = page.locator('tr.target-row td[data-day]');
    const total = await cells.count();
    expect(total, 'hedef satırda hücre yok') .toBeGreaterThan(40);

    const ok = await page.locator('tr.target-row td.can-ok').count();
    const warn = await page.locator('tr.target-row td.can-warn').count();
    const no = await page.locator('tr.target-row td.can-no').count();

    // Every cell is answered, and both answers actually occur — a preview that
    // painted the row one single colour would pass a count check and say
    // nothing (the vacuous-audit trap, pitfall 23).
    expect(ok + warn + no, 'cevaplanmayan hücre var').toBe(total);
    expect(ok, 'hiçbir hücre bırakılabilir değil').toBeGreaterThan(0);
    expect(no, 'hiçbir hücre engelli değil').toBeGreaterThan(0);

    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test('sürükleme bitince önizleme ızgarada kalmıyor', async ({ page }) => {
    await openWithSample(page);
    await startDrag(page);
    expect(await page.locator('td.can-ok').count()).toBeGreaterThan(0);

    await page.keyboard.press('Escape');
    await page.mouse.up();

    // React will not clean these up: the rows do re-render when the drag ends,
    // but their className PROP is unchanged, so the attribute is never touched.
    await expect(page.locator('td.can-ok, td.can-warn, td.can-no')).toHaveCount(0);
  });

  test('imlecin altındaki hücre satırın zemininden AYRILIYOR', async ({ page }) => {
    await openWithSample(page);
    await startDrag(page);

    const free = page.locator('tr.target-row td.can-ok').first();
    const box = await free.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2, { steps: 3 });
    await page.waitForTimeout(80);

    const strong = await page
      .locator('td.drop-ok')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const weak = await page
      .locator('td.can-ok:not(.drop-ok)')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    // Two strengths of one colour: the row says where you MAY drop, the cursor
    // says where you ARE. If they painted the same the second layer would be
    // invisible and the first would be a lie about precision.
    expect(strong).not.toBe(weak);

    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test('kapalı saat önizlemenin altında kaybolmuyor', async ({ page }) => {
    await openWithSample(page);

    // Pitfall 16 and 40, one layer up: a closed hour already says it cannot be
    // used, and a ground painted over it would erase the hatch that says so.
    // The `background` shorthand would have done exactly that — it resets
    // background-image — which is why the preview sets background-color only.
    // Measured on the PAINT, not on the class list: drag.ts marks every cell of
    // the row with its verdict, and the stylesheet is the single place that
    // decides a closed hour keeps its own ground — the same `:not(.unavailable)`
    // the crosshair uses two rules further down. Asserting the absence of the
    // class would pin the wrong half of that pair.
    const closed = page.locator('tr.target-row td.unavailable').first();
    const untouched = page.locator('tbody tr:not(.target-row) td.unavailable').first();
    await startDrag(page);
    if ((await closed.count()) > 0 && (await untouched.count()) > 0) {
      const paint = (l: typeof closed) =>
        l.evaluate((el) => {
          const cs = getComputedStyle(el);
          return { image: cs.backgroundImage, color: cs.backgroundColor };
        });
      const inRow = await paint(closed);
      const outside = await paint(untouched);
      expect(inRow.image, 'kapalı saatin taraması gitti').toContain('gradient');
      expect(inRow.color, 'kapalı saat önizleme zemini aldı').toBe(outside.color);
    }
    await page.keyboard.press('Escape');
    await page.mouse.up();
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

// ---------------------------------------------------------------------------
// Moving and removing a placed lesson
//
// A left click used to remove the block, so the only way to move a lesson was
// to delete it and drag it out of the pool again — and Kontrol's own advice
// ("either reopen the hour or MOVE the lesson") had no move to point at. Now
// the left button drags and the right button sends the block back to the pool.

/** The <td> holding the first placed card. */
function placedCell(page: Page) {
  return page.locator('table.grid td:has(.card)').first();
}

test.describe('3. Izgara — taşıma ve kaldırma', () => {
  test('sağ tık dersi havuza geri gönderir, Ctrl+Z geri getirir', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const cards = page.locator('table.grid .card');
    const before = await cards.count();
    expect(before).toBeGreaterThan(0);

    await cards.first().click({ button: 'right' });
    await expect(cards).toHaveCount(0); // if it was a block, all of it went

    await page.keyboard.press('Control+z');
    await expect(cards).toHaveCount(before);
  });

  test('sağ tıkta tarayıcı menüsü açılmıyor, sayfa çalışır kalıyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    // A context menu would be a native window Playwright cannot see; what CAN
    // be measured is that the event was cancelled and the app kept working.
    const cancelled = await page.evaluate(async () => {
      const card = document.querySelector('table.grid .card');
      if (card === null) return null;
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      card.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(cancelled).toBe(true);

    await expect(page.locator('table.grid .card')).toHaveCount(0);
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Program', exact: true })).toBeVisible();
  });

  test('SOL tık silmiyor — ders yerinde kalıyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const cards = page.locator('table.grid .card');
    const before = await cards.count();

    await cards.first().click(); // a plain left click, no movement
    await expect(cards).toHaveCount(before);
  });

  test('odaklı kartta Delete kaldırıyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const cards = page.locator('table.grid .card');
    const before = await cards.count();

    await cards.first().focus();
    await page.keyboard.press('Delete');
    await expect(cards).toHaveCount(0);

    await page.keyboard.press('Control+z');
    await expect(cards).toHaveCount(before);
  });

  test('yerleşmiş ders sürüklenerek taşınıyor; havuz sayacı değişmiyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const poolBefore = await page.locator('.pool-card').count();
    const cards = page.locator('table.grid .card');
    const blockSize = await cards.count();

    const from = placedCell(page);
    const fromDay = await from.getAttribute('data-day');
    const fromHour = await from.getAttribute('data-hour');
    const box = (await from.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(page.locator('tr.target-row')).toHaveCount(1);

    // Find a green cell in the same row that is NOT where it already is.
    const rowCells = page.locator('tr.target-row td');
    let landed: { day: string; hour: string } | null = null;
    for (const point of await visibleCells(page, 'tr.target-row td')) {
      const cell = rowCells.nth(point.index);
      const day = await cell.getAttribute('data-day');
      const hour = await cell.getAttribute('data-hour');
      if (day === fromDay && hour === fromHour) continue;
      await page.mouse.move(point.x, point.y, { steps: 3 });
      await page.waitForTimeout(40);
      if ((await cell.getAttribute('class'))?.includes('drop-ok') === true) {
        landed = { day: day!, hour: hour! };
        break;
      }
    }
    expect(landed).not.toBeNull();
    await page.mouse.up();

    // It moved: same number of cards, at a different hour, and the pool is
    // untouched — a move must not look like a removal plus a placement.
    await expect(cards).toHaveCount(blockSize);
    await expect(page.locator('.pool-card')).toHaveCount(poolBefore);
    const now = placedCell(page);
    expect(await now.getAttribute('data-hour')).toBe(landed!.hour);

    // ONE undo step puts it back where it was, not into the pool.
    await page.keyboard.press('Control+z');
    await expect(cards).toHaveCount(blockSize);
    await expect(placedCell(page)).toHaveAttribute('data-hour', fromHour!);
  });

  test('kaynak hücrenin KENDİSİ yeşil — ders kendini engellemiyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const from = placedCell(page);
    const day = await from.getAttribute('data-day');
    const hour = await from.getAttribute('data-hour');
    const box = (await from.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 2, box.y + box.height / 2, { steps: 2 });
    await page.waitForTimeout(120);

    // Its own cells are still occupied by itself; without lifting the source
    // block first, hard constraints 2 and 5 would paint this red.
    const self = page.locator(`tr.target-row td[data-day="${day}"][data-hour="${hour}"]`);
    await expect(self).toHaveClass(/drop-ok/);

    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test('ızgaradan kart alınınca ızgara zıplamıyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const wrap = page.locator('.grid-wrap');
    const before = await wrap.evaluate((el) => ({ x: el.scrollLeft, y: el.scrollTop }));

    const box = (await placedCell(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(200); // long enough for scrollIntoView to have run

    // The pool card path centres the target row on purpose. A block already on
    // the grid is already on that row, so centring would yank the grid out from
    // under the hand that just pressed it.
    expect(await wrap.evaluate((el) => ({ x: el.scrollLeft, y: el.scrollTop }))).toEqual(before);

    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test('Escape ile taşıma iptal edilince ders yerinde kalıyor', async ({ page }) => {
    await openWithSample(page);
    await dragAndDrop(page);

    const cards = page.locator('table.grid .card');
    const count = await cards.count();
    const hour = await placedCell(page).getAttribute('data-hour');

    const box = (await placedCell(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y, { steps: 4 });
    await page.keyboard.press('Escape');
    await page.mouse.up();

    await expect(cards).toHaveCount(count);
    await expect(placedCell(page)).toHaveAttribute('data-hour', hour!);
  });

  test('sağa kaydırınca öğretmen sütunu sabit kalır', async ({ page }) => {
    await openWithSample(page);
    const head = page.locator('tbody .row-head').first();
    const before = (await head.boundingBox())!;

    // All the way, not a fixed number of pixels: how far the grid CAN scroll
    // depends on the screen (788px at 1920x1080, 1342px at the old 1366x768),
    // and a constant larger than that silently becomes "scroll to the end"
    // anyway — it just stops saying so.
    const room = await page.locator('.grid-wrap').evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
      return el.scrollWidth - el.clientWidth;
    });
    expect(room, 'ızgara yatay kaymıyor, test bir şey ölçmüyor').toBeGreaterThan(200);
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

  test('1920x1080 ekranda sayfa dikey taşmıyor', async ({ page }) => {
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

    // The sentence stays — an icon alone is a guess the first time — but it
    // moved into the reason bar when the view switch went up into the ribbon.
    await expect(page.locator('.reason-bar')).toContainText('Satırlar sınıf');
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

  // "aynı dersten aynı şeyden birden fazlaysa ... kartlar stacklenmiş gibi
  // altta da olsun ve alttaki stacklenenler de gözüksün."
  //
  // A lesson wanting six single hours laid six identical rectangles side by
  // side and said `0/6` on every one of them. What this locks is the pair of
  // facts that made it safe to draw them as a deck: the pile is one FLOW item,
  // and a `.pool-card` still means one waiting block — to the head count, to
  // `pendingBlocks()` and to the forty locators that ask how much is left.
  test('aynı dersin aynı boydaki blokları TEK deste, sayı rozette', async ({ page }) => {
    await openWithSample(page);

    const cards = await page.locator('.pool-card').count();
    const stacks = await page.locator('.pool-stack').count();
    expect(cards, 'örnek okulda bekleyen blok yok').toBeGreaterThan(0);
    expect(stacks, 'hiçbir kart yığılmamış').toBeLessThan(cards);
    await expect(page.locator('.pool-count strong')).toContainText(`${cards} blok`);

    // Every card lives in exactly one pile, and a pile is one lesson at one
    // block length — the two things that make its cards interchangeable.
    const piles = await page.locator('.pool-stack').evaluateAll((nodes) =>
      nodes.map((el) => ({
        count: Number(el.getAttribute('data-count')),
        cards: el.querySelectorAll('.pool-card').length,
        sizes: new Set([...el.querySelectorAll('.pool-card')].map((c) => c.getAttribute('data-size'))).size,
        tops: new Set([...el.querySelectorAll('.card-top')].map((c) => c.textContent)).size,
        badge: el.querySelector('.stack-badge')?.textContent ?? null,
        counters: el.querySelectorAll('.pool-card:not([aria-hidden]) .counter').length,
      })),
    );
    expect(piles.reduce((n, p) => n + p.cards, 0)).toBe(cards);
    for (const p of piles) {
      expect(p.cards).toBe(p.count);
      expect(p.sizes).toBe(1);
      expect(p.tops).toBe(1);
      // The counter the reader asked to keep, said once instead of six times.
      expect(p.counters).toBe(1);
      // The count alone, in the corner. It read "×6" on the line that also
      // said "1 saat", and that whole line is gone.
      expect(p.badge).toBe(p.count > 1 ? String(p.count) : null);
    }

    // Placing one block takes one card off the pile rather than emptying it.
    const deep = page.locator('.pool-stack[data-count="5"]').first();
    const before = await deep.locator('.card-top').first().innerText();
    await dragAndDrop(page);
    await expect(page.locator('table.grid .card')).toHaveCount(1);
    await expect(page.locator('.pool-card')).toHaveCount(cards - 1);
    expect(before).not.toBe('');
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
    await expect(rows.first()).toContainText('Öğle arası, 30 dk');

    // The weekday column breaks after the 5th, the weekend column does not
    const first = rows.first().locator('td');
    await expect(first.nth(0)).toContainText('Öğle arası');
    await expect(first.nth(1)).toHaveText('');
  });
});

// DROPPING ONTO AN OCCUPIED CELL (2026-08-26, asked for by name: "farklı bir
// kart başka bir kartın üzerine gelirse o üzerine gelinen aşağı düşsün ve
// koyduğum olsun").
//
// The world is built here rather than taken from the sample: eviction needs
// ONE class with TWO lessons from DIFFERENT teachers, which the sample has
// buried somewhere among 99 of them.
const EVICT_WORLD = {
  schemaVersion: 7,
  settings: {
    schoolName: 'Tahliye Kursu',
    days: [
      { name: 'Salı', longBreakAfter: 0 },
      { name: 'Çarşamba', longBreakAfter: 0 },
    ],
    hours: ['1', '2', '3', '4'],
    bell: { start: '09:00', lessonMinutes: 40, breakMinutes: 10, longBreakMinutes: 30 },
    limits: { maxConsecutive: 0, maxPerDay: 0, minPerDay: 0, maxSameLessonPerDay: 0 },
    rules: { maxConsecutive: 'block', maxPerDay: 'block', minPerDay: 'warn', maxSameLessonPerDay: 'block' },
    subjects: ['Matematik', 'Fizik'],
    subjectShorts: {},
  },
  rooms: [{ id: 'dA', name: 'A' }],
  teachers: [
    { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', gender: '', color: 0,
      limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null } },
    { id: 'oAV', name: 'Ayşe Var', short: 'AV', subject: 'Fizik', gender: '', color: 1,
      limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null } },
  ],
  classes: [{ id: 's510', name: '510', roomId: 'dA', color: 0 }],
  lessons: [
    { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, pairs: 0, maxPerDay: null },
    { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 2, pairs: 0, maxPerDay: null },
  ],
  unavailable: {},
  // MÇ is sitting on Salı 1. AV has the whole grid free.
  placements: { 's510|0|0': 'x1' },
};

test.describe('66. Dolu hücrenin üstüne bırakmak', () => {
  /** Grabs the pool card whose top or bottom line says `text`. */
  async function grabCard(page: Page, text: string) {
    const card = page.locator('.pool-card', { hasText: text }).first();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(page.locator('.ghost')).toHaveCount(1);
    await page.waitForTimeout(150);
  }

  test('dolu hücre artık kırmızı değil SARI — bir şey kaybedeceğini söylüyor', async ({ page }) => {
    await loadWorld(page, EVICT_WORLD);
    await grabCard(page, 'AV');
    const cell = await hover(page, 0, 0);
    // Yellow, not green: the drop is allowed but it costs a lesson. No fourth
    // colour was invented for this — the functional channel already had one.
    await expect(cell).toHaveClass(/drop-warn/);
    await expect(cell).not.toHaveClass(/drop-blocked/);
    // ...and the bar says WHAT it costs, by name.
    await expect(page.locator('.reason-bar')).toContainText('havuza dönecek');
    await expect(page.locator('.reason-bar')).toContainText('MÇ');
    await page.mouse.up();
  });

  test('bırakınca eski ders havuza döner, yeni ders yerini alır', async ({ page }) => {
    await loadWorld(page, EVICT_WORLD);
    // The grid is in TEACHER view, so a cell is named by its row as well: the
    // same day and hour exist once per teacher.
    const mc = page.locator('td[data-row="oMC"][data-day="0"][data-hour="0"]');
    const av = page.locator('td[data-row="oAV"][data-day="0"][data-hour="0"]');
    // In teacher view a cell says which CLASS the teacher is with, so both
    // rows would read "510" — which row it is on is the whole assertion.
    await expect(mc).toContainText('510');
    await expect(av).toHaveText('');

    await grabCard(page, 'AV');
    await hover(page, 0, 0);
    await page.mouse.up();

    // The lesson moved rows: AV now has that hour and MÇ does not.
    await expect(av).toContainText('510');
    await expect(mc).toHaveText('');
    // ...and the old one is back in the tray, not deleted (principle 6). Two
    // cards, not one: MÇ's lesson is 2 hours of singles, so what came back is
    // its second single beside the one that was already waiting.
    await expect(page.locator('.pool-card', { hasText: 'MÇ' })).toHaveCount(2);
    // .last(): "Yedek yüklendi" from loadWorld is still on screen.
    await expect(page.locator('.toast').last()).toContainText('510 · MÇ dersi havuza döndü');
  });

  test('bütün hamle TEK geri-al adımı', async ({ page }) => {
    await loadWorld(page, EVICT_WORLD);
    await grabCard(page, 'AV');
    await hover(page, 0, 0);
    await page.mouse.up();
    await expect(page.locator('td[data-row="oAV"][data-day="0"][data-hour="0"]')).toContainText('510');

    // One Ctrl+Z puts BOTH halves back: the evicted lesson returns to the grid
    // and the dropped one goes back to the pool. An eviction that cost two
    // undos would leave the grid in a state the reader never made.
    await page.keyboard.press('Control+z');
    await expect(page.locator('td[data-row="oMC"][data-day="0"][data-hour="0"]')).toContainText('510');
    await expect(page.locator('td[data-row="oAV"][data-day="0"][data-hour="0"]')).toHaveText('');
  });

  test('BAŞKA bir sebeple kapalı hücre tahliyeyle açılmıyor', async ({ page }) => {
    // AV is unavailable at Salı 1. The class is busy there too, so the first
    // refusal is "class busy" — but evicting it does not make AV available.
    await loadWorld(page, { ...EVICT_WORLD, unavailable: { 'oAV|0|0': 1 } });
    await grabCard(page, 'AV');
    const cell = await hover(page, 0, 0);
    await expect(cell).toHaveClass(/drop-blocked/);
    await expect(page.locator('.reason-bar')).toContainText('müsait değil');
    await page.mouse.up();
  });
});

// 68. Where a block ENDS, when a lesson holds blocks of two lengths.
//
// `placements` stores one lessonId per hour and no boundary. Three adjacent
// cells of one lesson are readable as [2,1] or as [1,2] and the grid cannot
// tell them apart, so one rule decides — doubles first, in day/hour order —
// and the line the eye sees has to be the line a right-click cuts along.
const SPLIT_WORLD = {
  schemaVersion: 7,
  settings: {
    schoolName: 'Bölünmüş',
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
    subjects: ['Matematik'],
    subjectShorts: {},
  },
  rooms: [{ id: 'dA', name: 'A' }],
  teachers: [
    { id: 'oMC', name: 'Mehmet Çelik', short: 'MÇ', subject: 'Matematik', gender: '', color: 0,
      limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null } },
  ],
  classes: [{ id: 's510', name: '510', roomId: 'dA', color: 0 }],
  // 3 hours as 2+1, all three sitting side by side on one day.
  lessons: [
    { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3, pairs: 1, maxPerDay: null },
  ],
  unavailable: {},
  placements: { 's510|0|0': 'x1', 's510|0|1': 'x1', 's510|0|2': 'x1' },
};

test.describe('68. 2+1 bitişikken', () => {
  const cell = (page: Page, hour: number) =>
    page.locator(`td[data-row="oMC"][data-day="0"][data-hour="${hour}"]`);

  test('üç bitişik hücre TEK blok gibi çizilmiyor — sınır 2. saatten sonra', async ({ page }) => {
    await loadWorld(page, SPLIT_WORLD);

    // Since 2026-08-27 a two-hour block is ONE cell spanning two columns, so
    // the boundary this test is about is now visible in the DOM itself: the
    // double is one <td> that stands for hours 0-1, and the single is its own
    // <td> at hour 2. Hour 1 has no cell of its own — it is inside the wide one.
    await expect(cell(page, 0)).toHaveAttribute('colspan', '2');
    await expect(cell(page, 0)).toHaveClass(/block-wide/);
    await expect(cell(page, 0)).toContainText('510');
    await expect(cell(page, 1)).toHaveCount(0);
    await expect(cell(page, 2)).toContainText('510');
    await expect(cell(page, 2)).not.toHaveAttribute('colspan', '2');
    await expect(cell(page, 2)).not.toHaveClass(/block-wide/);

    // TWO cards for three adjacent hours, which is the whole claim: plain
    // adjacency would have drawn one card three hours wide.
    await expect(page.locator('tr:has(td[data-row="oMC"]) .card')).toHaveCount(2);
    // …and the label is written ONCE per block, not once per hour.
    expect((await cell(page, 0).innerText()).match(/510/g) ?? []).toHaveLength(1);
  });

  test('sağ tık tek saatlik bloğu alıyor, koşunun tamamını değil', async ({ page }) => {
    await loadWorld(page, SPLIT_WORLD);
    await cell(page, 2).click({ button: 'right' });

    await expect(cell(page, 0)).toContainText('510');
    await expect(cell(page, 0)).toHaveAttribute('colspan', '2');
    await expect(cell(page, 2)).toHaveText('');
    // …and what came back is a ONE-hour card, not the whole lesson.
    const back = page.locator('.pool-card');
    await expect(back).toHaveCount(1);
    expect(await back.getAttribute('data-size')).toBe('1');
  });

  test('sağ tık ikili bloğun İKİNCİ saatine denk gelse de İKİ hücre alıyor', async ({ page }) => {
    await loadWorld(page, SPLIT_WORLD);

    // Hour 1 no longer has a cell of its own, so the click is aimed at WHERE IT
    // IS ON SCREEN: the right-hand half of the wide cell. That is the gesture
    // this test was always about — the reader points at the second hour of a
    // double — and the merge must not have turned it into a miss.
    const box = (await cell(page, 0).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2, {
      button: 'right',
    });

    await expect(cell(page, 0)).toHaveText('');
    await expect(cell(page, 2)).toContainText('510');
    const back = page.locator('.pool-card');
    await expect(back).toHaveCount(1);
    expect(await back.getAttribute('data-size')).toBe('2');
  });
});
