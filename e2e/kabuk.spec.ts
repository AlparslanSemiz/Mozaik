// The shell: the six destinations along the top, and what happens to them when
// the screen narrows or the page is printed.
//
// This file used to be `duzen.spec.ts` and used to measure LAYOUT — rail width,
// body overflow per tab, whether the second column was doing anything, how many
// grid rows fit. All of that went on 2026-08-26 with the rest of the layout
// contract (user decision: accessibility measurements stay, layout measurements
// go). Half of it was already lying anyway: it still asserted `nav.sidebar` was
// 92px wide down the left, and the rail had been gone since the C round.
//
// What is left is the part that is not taste:
//   - navigating actually navigates, and says where you are;
//   - the accessible name survives when the label is hidden;
//   - the six icons differ in SILHOUETTE, because under 1280px they are the
//     only thing left to tell the destinations apart;
//   - the shell does not print.

import { expect, test } from './kapan';
import { readFileSync } from 'node:fs';
import { chooseScale, open, openWithSample } from './helpers';

const TABS = ['Kurulum', 'Müsaitlik', 'Program', 'Kontrol', 'Yazdır', 'Ayarlar'] as const;

test.describe('23. Sekmeler', () => {
  test('seçili sekme belli, tıklayınca değişiyor', async ({ page }) => {
    await openWithSample(page);
    for (const name of TABS) {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute('aria-label', name);
      await expect(page.locator('.tab[aria-current="true"]')).toHaveCount(1);
    }
  });

  test('dar ekranda etiketler gizleniyor ama isimle bulunabiliyor', async ({ page }) => {
    await openWithSample(page);
    await expect(page.locator('.tabstrip .tab-label').first()).toBeVisible();

    // Under 1280px the labels go and the icons carry it.
    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(page.locator('.tabstrip .tab-label').first()).toBeHidden();

    // The accessible name survives, so a screen reader — and a test — can still
    // find a destination by what it is called.
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Kontrol',
    );
  });

  test('altı simge birbirine benzemiyor', async ({ page }) => {
    await open(page);
    const paths = await page
      .locator('.tabstrip .tab svg')
      .evaluateAll((nodes) => nodes.map((n) => n.innerHTML.replace(/\s+/g, '')));
    expect(paths).toHaveLength(6);
    expect(new Set(paths).size).toBe(6);
  });
});

test.describe('25. Kabuk kâğıda basılmıyor', () => {
  test('üst çubuk ve şerit basılmıyor, iki sütun tek sütuna iniyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('header.topbar')).toBeHidden();
    // Two of them since C9 (the tick lists and the output summary); both go.
    const controls = page.locator('.panel.no-print');
    expect(await controls.count()).toBeGreaterThan(0);
    for (let i = 0; i < (await controls.count()); i++) {
      await expect(controls.nth(i)).toBeHidden();
    }

    const display = await page.locator('.cols').evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe('block');

    // Paper is one of the four surviving contracts: A4 landscape, and nothing
    // may push the sheet sideways.
    const wide = await page.evaluate(() => document.body.scrollWidth - document.body.clientWidth);
    expect(wide).toBeLessThanOrEqual(1);
    await page.emulateMedia({ media: 'screen' });
  });
});

// ---------------------------------------------------------------------------

test.describe('76. Marka işareti — üst çubuğun sol ucu', () => {
  // The mark is drawn THREE times now: site/icon.svg (the source, and where
  // the 192/512 PWA icons come from), the simplified data: URI in index.html
  // (the tab, always small), and the inline SVG in the top bar. The first and
  // second are compared in temel.spec.ts section 72; this is the third.
  //
  // Three copies of one drawing is two too many to hold in a head, and a mark
  // that has quietly drifted in one of three places is not something anyone
  // notices — which is the whole argument for writing it down as a test.

  /** Every <rect>, as a sorted list of "x,y,w,h,rx,fill". */
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

  test('üst çubuktaki işaret site/icon.svg ile AYNI şeyi çiziyor', async ({ page }) => {
    await open(page);
    const drawn = await page.locator('.brand-mark').evaluate((el) => el.outerHTML);

    // The DOM writes attributes back unquoted-safe and lowercases nothing we
    // read, but it does drop the shorthand: normalise the ground's fill the
    // same way both sides spell it.
    const source = readFileSync('site/icon.svg', 'utf8').replace(/#ffffff/g, '#fff');

    expect(rects(drawn).length, 'üst çubuktaki işaret ayrıntılı varyant değil').toBe(13);
    expect(rects(drawn)).toEqual(rects(source));
  });

  test('sol uçta, ölçekle büyüyor ve şeridi taşırmıyor', async ({ page }) => {
    // Pitfall 41: measured with a school and a plan in the bar, not empty —
    // the width this competes for is decided by the chip and the plan name.
    await openWithSample(page);

    for (const scale of [100, 150]) {
      await chooseScale(page, scale);
      const facts = await page.evaluate(() => {
        const bar = document.querySelector('header.topbar')!;
        const mark = document.querySelector('.brand-mark')!.getBoundingClientRect();
        const strip = bar.querySelector('.tabstrip')!.getBoundingClientRect();
        const tabs = [...bar.querySelectorAll('.tab')];
        const last = tabs[tabs.length - 1]!.getBoundingClientRect();
        return {
          width: Math.round(mark.width),
          left: Math.round(mark.left),
          beforeTabs: mark.right <= strip.left,
          tabOver: Math.round(last.right - strip.right),
          barOver: bar.scrollWidth - bar.clientWidth,
        };
      });

      // It is the leftmost thing on the row — that is what was asked for.
      expect(facts.beforeTabs, `%${scale}: işaret sekmelerin solunda değil`).toBe(true);
      expect(facts.left, `%${scale}: işaret sol uçta değil`).toBeLessThan(40);
      // rem, not px: at 150% it grows with the tabs instead of becoming a
      // speck beside them.
      expect(facts.width, `%${scale}: işaret ölçeği izlemiyor`).toBe(scale === 100 ? 28 : 42);
      // Pitfall 48: a seventh thing on this row must not push the tabs out of
      // their own box. Nothing gives way for it — it has to fit.
      expect(facts.tabOver, `%${scale}: sekmeler kutusundan taştı`).toBeLessThanOrEqual(0);
      expect(facts.barOver, `%${scale}: üst çubuk taştı`).toBeLessThanOrEqual(0);
    }
    await chooseScale(page, 100);
  });

  // A PROTECTION test, and the sabotage said so: `.brand` has no print rule
  // of its own, because `.topbar` is already display:none there and a second
  // rule saying the same thing changes nothing (it was written, measured to
  // be dead, and deleted). What this guards is the day the mark moves out of
  // the top bar and quietly starts printing.
  test('kâğıda çıkmıyor', async ({ page }) => {
    await openWithSample(page);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.brand-mark')).toBeHidden();
    await page.emulateMedia({ media: 'screen' });
  });
});
