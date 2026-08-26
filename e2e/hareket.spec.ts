// Motion. The rule "prefers-reduced-motion: reduce switches ALL of it off" has
// been written in CLAUDE.md since the animation ban was lifted, and until now
// nothing measured it — the single @media block in styles.css was load-bearing
// and unguarded. A new transition that hard-codes 180ms instead of reading
// --dur would have shipped silently.
//
// Everything here reads the real computed values off the real dist/index.html.

import { expect, test } from '@playwright/test';
import { open, openWithSample } from './helpers';

test.describe('14. Hareket', () => {
  test('azaltılmış hareket isteyen makinede bütün süreler sıfırlanıyor', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);

    const durations = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return ['--dur', '--dur-fast', '--dur-slow'].map((n) => cs.getPropertyValue(n).trim());
    });
    // Every transition in the stylesheet reads one of these three, so zeroing
    // them is what makes the kill switch total rather than partial.
    expect(durations).toEqual(['0ms', '0ms', '0ms']);
  });

  test('azaltılmış hareketle sekme değişince çalışan animasyon kalmıyor', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openWithSample(page);

    await page.getByRole('button', { name: 'Ayarlar', exact: true }).click();
    // No wait: the point is that there is nothing to wait FOR. If a view
    // transition were running this is exactly when it would be running.
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running').length,
    );
    expect(running).toBe(0);
  });

  test('hareket açıkken sekme geçişi gerçekten animasyonlu', async ({ page }) => {
    await openWithSample(page);

    // The counterpart of the test above, and the reason it means something: a
    // suite that only ever asserts "nothing moves" passes just as well on an
    // app that cannot move at all.
    const moving = await page.evaluate(async () => {
      const strip = [...document.querySelectorAll('.tab')];
      strip.find((b) => (b.textContent ?? '').includes('Ayarlar'))?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
      await new Promise((r) => requestAnimationFrame(r));
      return document.getAnimations().some((a) => a.playState === 'running');
    });
    expect(moving).toBe(true);
  });

  test('sekme değişince ızgara ANINDA tıklanabilir — hayalet kare yok', async ({ page }) => {
    await openWithSample(page);

    // The regression this test exists for, measured rather than described:
    // `document.startViewTransition` swaps the captured element for a snapshot,
    // and a snapshot is not hit-testable. `elementFromPoint` over the grid
    // answered `<html>` for 553 ms after every tab change — and drag.ts finds
    // its drop target with exactly that call, so a card grabbed in that window
    // landed nowhere, silently. The tab change is a CSS cross-fade now and the
    // page stays live through it (pitfall 55).
    const point = await page.evaluate(() => {
      const r = document.querySelector('tbody td[data-day]')!.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    });

    const misses = await page.evaluate(async (pt) => {
      const click = (name: string) =>
        [...document.querySelectorAll('.tab')]
          .find((b) => (b.textContent ?? '').includes(name))
          ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      click('Kontrol');
      await new Promise((r) => setTimeout(r, 500));
      click('Program');

      // Ten frames is well inside the old dead window and well past the new one.
      let dead = 0;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        if (document.elementFromPoint(pt.x, pt.y)?.closest('[data-day]') == null) dead++;
      }
      return dead;
    }, point);

    // One or two frames while React commits is the grid not existing yet. A
    // whole animation's worth of them is the bug.
    expect(misses).toBeLessThanOrEqual(3);
  });

  test('kayan alan üstünde ve altında ne olduğunu söylüyor', async ({ page }) => {
    // Short on purpose: a fade means nothing in a box that does not overflow,
    // and measuring one that does not is measuring nothing (pitfall 41).
    await page.setViewportSize({ width: 1280, height: 620 });
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kurulum' }).click();

    const main = page.locator('main');
    await expect(main).toHaveClass(/scroll-fade/);
    const overflow = await main.evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow, 'içerik taşmıyor, ölçülecek bir şey yok').toBeGreaterThan(50);

    // At the top there is nothing above and something below.
    await expect(main).not.toHaveClass(/faded-top/);
    await expect(main).toHaveClass(/faded-bot/);

    await main.evaluate((el) => el.scrollTo(0, 200));
    await expect(main).toHaveClass(/faded-top/);
    await expect(main).toHaveClass(/faded-bot/);

    await main.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await expect(main).toHaveClass(/faded-top/);
    await expect(main).not.toHaveClass(/faded-bot/);
  });

  test('taşmayan bir kutu kenarını hiç yakmıyor', async ({ page }) => {
    // An empty project on a tall screen: the one combination that genuinely
    // fits. With the sample loaded even Kontrol overflows at 1400px, and
    // measuring a box that overflows would be measuring the wrong thing.
    await page.setViewportSize({ width: 1600, height: 1400 });
    await open(page);

    const main = page.locator('main');
    const overflow = await main.evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow, 'bu ölçüde taşıyor, test yanlış kutuyu ölçüyor').toBeLessThan(4);
    // A box fading at the bottom with nothing under it lies about having more.
    await expect(main).not.toHaveClass(/faded-top/);
    await expect(main).not.toHaveClass(/faded-bot/);
  });

  test('ızgara sündürülmüyor — yapışkan başlık kırpılırdı', async ({ page }) => {
    await openWithSample(page);

    // A mask on a scroll container clips its own position: sticky children, so
    // the hour heading and the teacher column would dissolve at exactly the
    // edges they exist to hold (pitfall 54). The grid keeps its shadow instead.
    const wrap = page.locator('.grid-wrap');
    await expect(wrap).not.toHaveClass(/scroll-fade/);
    const mask = await wrap.evaluate((el) => getComputedStyle(el).maskImage);
    expect(mask === 'none' || mask === '').toBe(true);
  });
});
