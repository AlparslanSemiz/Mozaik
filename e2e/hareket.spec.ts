// Motion. The rule "prefers-reduced-motion: reduce switches ALL of it off" has
// been written in CLAUDE.md since the animation ban was lifted, and until now
// nothing measured it — the single @media block in styles.css was load-bearing
// and unguarded. A new transition that hard-codes 180ms instead of reading
// --dur would have shipped silently.
//
// Since 2026-08-27 there is a SECOND switch and it is the reader's: Ayarlar →
// Görünüm → Hareket, three steps. The two are not the same thing and the
// relationship between them is the contract worth testing — the machine
// preference is a FLOOR, so the setting can go further than the machine asked
// but never less far.
//
// Everything here reads the real computed values off the real dist/index.html.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { chooseMotion, open, openSettings, openWithSample, savedText, settledText } from './helpers';

/** The four levers, straight off the root element. */
const levers = (page: Page) =>
  page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const read = (n: string) => cs.getPropertyValue(n).trim();
    return {
      durs: ['--dur', '--dur-fast', '--dur-slow'].map(read),
      slide: read('--slide'),
      sweep: read('--sweep'),
      press: read('--press'),
      pop: read('--pop'),
    };
  });

/** A distance token that is zero, however the browser chose to serialise it. */
const isZero = (value: string) => Number.parseFloat(value) === 0;

/**
 * A duration in milliseconds, whatever unit came back.
 *
 * Chromium does not round-trip these: `--dur: 180ms` is serialised as "0.18s"
 * and `--dur: 90ms` as "90ms", in the same object. A `parseFloat` comparison
 * across the two therefore reads 90 against 0.18 and calls the shorter one
 * longer — which is exactly what this test claimed the first time it ran.
 */
function ms(value: string): number {
  const n = Number.parseFloat(value);
  return value.trim().endsWith('ms') ? n : n * 1000;
}

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
    expect(durations.map(ms)).toEqual([0, 0, 0]);
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

  test('KAPALI seçilince süreler de mesafeler de sıfırlanıyor', async ({ page }) => {
    await openWithSample(page);
    await chooseMotion(page, 'Kapalı');

    const off = await levers(page);
    expect(off.durs.map(ms)).toEqual([0, 0, 0]);
    // Durations alone are not enough and that is the whole reason these four
    // tokens exist: every distance in the stylesheet used to be written out in
    // the rule that used it, so "no movement" could not be asked for from one
    // place. A 0ms transition to a translated position still TELEPORTS.
    expect(isZero(off.slide), `--slide ${off.slide}`).toBe(true);
    expect(isZero(off.sweep), `--sweep ${off.sweep}`).toBe(true);
    expect(isZero(off.press), `--press ${off.press}`).toBe(true);
    expect(off.pop).toBe('1');

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running').length,
    );
    expect(running).toBe(0);
  });

  test('AZ süreleri kısaltıyor, mesafeleri sıfırlıyor — ve hâlâ bir şey oluyor', async ({
    page,
  }) => {
    await openWithSample(page);
    const full = await levers(page);
    await chooseMotion(page, 'Az');
    const some = await levers(page);

    // Shorter, but not nothing: this step exists because "kapat YA DA azalt"
    // is two asks, and a middle step that quietly equalled "off" would be one.
    for (let i = 0; i < 3; i++) {
      const az = some.durs[i]!;
      const tam = full.durs[i]!;
      const a = ms(az);
      const b = ms(tam);
      expect(a, `${az} < ${tam} olmalı`).toBeLessThan(b);
      expect(a, `${az} sıfır olmamalı — bu "Kapalı" olurdu`).toBeGreaterThan(0);
    }
    // What "az" drops is MOVEMENT: a panel fades in where it will sit.
    expect(isZero(some.slide)).toBe(true);
    expect(isZero(some.sweep)).toBe(true);
    expect(isZero(some.press)).toBe(true);
    expect(some.pop).toBe('1');

    // ...and the colour transitions survive, which is the point of the step:
    // a control still answers the pointer. Measured by asking whether anything
    // is animating at all on a tab change, exactly like the 'tam' test above.
    const moving = await page.evaluate(async () => {
      const strip = [...document.querySelectorAll('.tab')];
      strip.find((b) => (b.textContent ?? '').includes('Program'))?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
      await new Promise((r) => requestAnimationFrame(r));
      return document.getAnimations().some((a) => a.playState === 'running');
    });
    expect(moving).toBe(true);
  });

  test('MAKİNE tercihi bir TABAN — "Tam" seçili olsa bile ezemiyor', async ({ page }) => {
    // The contract, and the one assertion here that is about an ordering rather
    // than a value: [data-motion] is written BEFORE the @media block, at equal
    // specificity, so the machine wins. A reader who has asked their computer
    // for less motion must not have it handed back by a setting inside one
    // program — the setting may only go FURTHER than the machine asked.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openWithSample(page);
    await chooseMotion(page, 'Tam');

    const still = await levers(page);
    expect(still.durs.map(ms)).toEqual([0, 0, 0]);
    expect(isZero(still.slide)).toBe(true);
    expect(isZero(still.sweep)).toBe(true);
    expect(isZero(still.press)).toBe(true);
    expect(still.pop).toBe('1');

    // ...and the button still tells the truth about what was chosen.
    await expect(page.getByRole('button', { name: 'Tam', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('makine hareket istemiyorsa varsayılan KAPALI — düğme yalan söylemiyor', async ({
    page,
  }) => {
    // First read follows the system, like the theme does. A button reading
    // "Tam" on a machine where nothing moves would be a lie, and the reader
    // would go looking for a broken program instead of a system setting.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'kapali');
    await openSettings(page, 'Görünüm');
    await expect(page.getByRole('button', { name: 'Kapalı', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('tercih yenilemede duruyor ve programın kendisine GİRMİYOR', async ({ page }) => {
    await openWithSample(page);
    // Pitfall 24/51: the store debounces by 400 ms and the page's own load
    // write lands inside that window, so the baseline has to be a settled one.
    const before = await settledText(page);

    await chooseMotion(page, 'Az');
    await page.waitForTimeout(700);
    expect(await savedText(page)).toBe(before);
    expect(await page.evaluate(() => localStorage.getItem('ders-programi-hareket'))).toBe('az');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'az');
    const saved = await page.evaluate(() => localStorage.getItem('ders-programi'));
    expect(saved!.includes('hareket')).toBe(false);
  });

  test('Ayarlar → Veri hareket anahtarını da sayıyor', async ({ page }) => {
    // A report that leaves a key out is worse than no report: the one thing it
    // is for is being trusted when somebody asks "is all of it in here?".
    await openWithSample(page);
    await chooseMotion(page, 'Kapalı');
    await openSettings(page, 'Veri');
    const panel = page.locator('.panel', { hasText: 'Veriler nerede' });
    await expect(panel.locator('tbody code', { hasText: 'ders-programi-hareket' })).toHaveCount(1);
  });

  test('komut paletinden de kapatılıp açılabiliyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    await page.locator('.palette').waitFor();
    await page.getByText('Animasyonları kapat', { exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'kapali');

    await page.keyboard.press('Control+k');
    await page.locator('.palette').waitFor();
    await page.getByText('Animasyonları aç', { exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'tam');
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

    // HALFWAY, computed rather than written. It was a flat 200px, which was a
    // middle only while Kurulum's page was long — and it was long because the
    // summary column beside it had no ceiling. With the side column bounded
    // (section 83) the page is as long as the list, and 200px was already the
    // bottom of it: the test would have started asserting that a fade at the
    // foot of the box is missing, which is true and not what it is here for.
    await main.evaluate((el) => el.scrollTo(0, Math.round((el.scrollHeight - el.clientHeight) / 2)));
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
