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

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { readFileSync } from 'node:fs';
import { chooseScale, open, openSetup, openWithSample } from './helpers';

const TABS = ['Okul', 'Müsaitlik', 'Program', 'Kontrol', 'Çıktı', 'Ayarlar'] as const;

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

  test('yedi simge birbirine benzemiyor', async ({ page }) => {
    await open(page);
    const paths = await page
      .locator('.tabstrip .tab svg')
      .evaluateAll((nodes) => nodes.map((n) => n.innerHTML.replace(/\s+/g, '')));
    expect(paths).toHaveLength(7);
    expect(new Set(paths).size).toBe(7);
  });
});

test.describe('25. Kabuk kâğıda basılmıyor', () => {
  test('üst çubuk ve şerit basılmıyor, iki sütun tek sütuna iniyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
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
  // The mark is drawn three times: site/icon.svg (the detailed source, and
  // where the 192/512 PWA icons come from), the data: URI in index.html (the
  // tab, always small), and the inline SVG in the top bar. The last two both
  // read site/icon-small.svg — the URI is compared in temel.spec.ts section
  // 72, the top bar here.
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

  test('üst çubuktaki işaret site/icon-small.svg ile AYNI şeyi çiziyor', async ({ page }) => {
    await open(page);
    const drawn = await page.locator('.brand-mark').evaluate((el) => el.outerHTML);

    // The DOM writes attributes back unquoted-safe and lowercases nothing we
    // read, but it does drop the shorthand: normalise the ground's fill the
    // same way both sides spell it.
    //
    // The SIMPLE variant since 2026-08-28, asked for in one line ("sol üstteki
    // logonun küçüğü kullanılsın"). It is the honest reading of the size: the
    // mark is 1.75rem, i.e. 24.5 px at 100 %, and this project's own icon
    // comparison puts 20-32 px in the band where the six columns are blurry
    // but separable. The tab already read from this file, so what used to be
    // three drawings of one mark is now two.
    const source = readFileSync('site/icon-small.svg', 'utf8').replace(/#ffffff/g, '#fff');

    expect(rects(drawn).length, 'üst çubuktaki işaret sade varyant değil').toBe(4);
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
          width: mark.width,
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
      // speck beside them. 1.75rem, and the numbers moved on 2026-08-27 with
      // the root — 16px became 14, so 28/42 became 24.5/36.75. They are still
      // written out rather than computed, because what this line guards is
      // that the mark is in `rem` AT ALL: a px width would sit on 28 at both
      // ends and the assertion would say so.
      expect(facts.width, `%${scale}: işaret ölçeği izlemiyor`)
        .toBeCloseTo(scale === 100 ? 24.5 : 36.75, 0);
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

// ---------------------------------------------------------------------------

test.describe('83. Yan sütun sayfanın boyunu belirlemiyor', () => {
  // "Öğretmenler kısmında ve yazdırma kısmında ve başka diğer yerlerde de yan
  //  bloklar çok uzun ve sırf onlardan dolayı tüm sayfanın uzunluğu artıyor."
  //
  // `.cols` is a grid, so its row is as tall as the taller of its two children.
  // `align-items: start` only moves the content inside the track — it does not
  // shorten the track — so a side column with no ceiling handed its height
  // straight to `.main`'s scrollHeight. Measured before the change: on Kurulum
  // → Derslikler the left column was 636 px and the page scrolled 1092, all of
  // it the summary beside it; on Yazdır the four stacked panels came to 1491.
  //
  // Both halves are asserted, because only the pair is the fix: the side column
  // fits the screen, AND the page is no longer longer than what is being read.
  const SCREENS = ['Derslikler', 'Öğretmenler', 'Sınıflar'] as const;

  async function boxes(page: Page) {
    return page.evaluate(() => {
      const main = document.querySelector('.main') as HTMLElement;
      const left = document.querySelector('.cols > div') as HTMLElement | null;
      const aside = document.querySelector('.cols > aside') as HTMLElement | null;
      const cs = getComputedStyle(main);
      return {
        scroll: main.scrollHeight,
        client: main.clientHeight,
        pad: parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom),
        left: left === null ? 0 : Math.round(left.getBoundingClientRect().height),
        aside: aside === null ? 0 : Math.round(aside.getBoundingClientRect().height),
        asideNeeds: aside === null ? 0 : aside.scrollHeight,
      };
    });
  }

  test('Kurulum: sayfa SOL sütun kadar uzun, yan sütun kadar değil', async ({ page }) => {
    await openWithSample(page);
    for (const step of SCREENS) {
      await openSetup(page, step);
      const m = await boxes(page);
      expect(m.aside, `${step}: yan sütun yok`).toBeGreaterThan(0);
      // It fits the box it is in...
      expect(
        m.aside,
        `${step}: yan sütun ${m.aside}px, ekranda ${m.client}px yer var`,
      ).toBeLessThanOrEqual(m.client);
      // ...and the page is as long as the thing being read, not as long as the
      // thing beside it. One row of slack for sub-pixel rounding.
      expect(
        m.scroll,
        `${step}: sayfa ${m.scroll}px, sol sütun ${m.left}px (yan sütun ${m.asideNeeds}px istiyordu)`,
      ).toBeLessThanOrEqual(Math.max(m.client, m.left + m.pad) + 2);
    }
  });

  test('Yazdır: yan sütun ekranda kalıyor, kâğıtlar akıp gidiyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await page.locator('.print-page').first().waitFor();

    const m = await boxes(page);
    expect(m.asideNeeds, 'Yazdır yan sütunu zaten kısa — test bir şey ölçmüyor').toBeGreaterThan(
      m.client,
    );
    expect(m.aside, `yan sütun ${m.aside}px, ekranda ${m.client}px yer var`).toBeLessThanOrEqual(
      m.client,
    );

    // ...and it is STILL THERE after scrolling down a sheet or two: the print
    // button and the tick lists are what this screen is for.
    await page.locator('.main').evaluate((el) => el.scrollTo(0, 2000));
    const top = await page
      .locator('.cols > aside .panel')
      .first()
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(top, `kaydırdıktan sonra yan sütun ${Math.round(top)}px'te`).toBeLessThan(m.client);
  });

  // "Özetler içlerindeki bilgilerin uzunluklarına göre uzunlukları değişebilir
  //  ama en fazla tam ekranın uzunluğu kadar olsun ... eğer liste çok uzunsa
  //  işte kaydırma o özetin içinde olsun."
  //
  // The ceiling above was already there; what was NOT was where the scrollbar
  // sits. The rail scrolled and the boxes inside it carried fixed ceilings of
  // their own (22rem on the capacity table, 62vh on the availability list), so
  // a panel's height came from a number in the stylesheet rather than from what
  // was in it — a ten-row table scrolling in its own little window on a screen
  // with room for thirty.
  //
  // Measured on a SHORT viewport with the sample loaded, because a summary that
  // fits measures nothing (pitfall 41): the precondition is asserted first.
  test('uzun özet PANELİN içinde kayıyor, sütunun değil', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 700 });
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    const m = await page.locator('.cols > aside > .panel').evaluate((el) => ({
      scroll: el.scrollHeight,
      client: el.clientHeight,
      overflowY: getComputedStyle(el).overflowY,
    }));
    expect(m.scroll, 'bu ekranda özet zaten sığıyor — ölçülecek bir şey yok').toBeGreaterThan(
      m.client + 20,
    );
    expect(m.overflowY, 'kaydıran kutu panel değil').toBe('auto');

    // ...and the column it sits in is not the one scrolling.
    const rail = await page
      .locator('.cols > aside')
      .evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(rail, `yan sütun ${rail}px kaydırıyor — kaydırma özetin içinde olmalı`).toBeLessThan(4);

    // The heading stays put while the panel scrolls under it: the word saying
    // WHICH summary this is should not be the first thing to leave.
    const before = await page.locator('.cols > aside > .panel h2').boundingBox();
    await page.locator('.cols > aside > .panel').evaluate((el) => el.scrollTo(0, 400));
    const after = await page.locator('.cols > aside > .panel h2').boundingBox();
    expect(Math.abs(after!.y - before!.y), 'özetin başlığı kayıp gitti').toBeLessThan(2);
  });
});
