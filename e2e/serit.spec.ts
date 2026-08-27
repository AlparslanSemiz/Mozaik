// 57. The tool strip, as a CONTRACT rather than five hand-made rows.
//
// Before 2026-08-27 the five strips were five different objects — Kurulum had
// symbols but no caption, Yazdır and Ayarlar were bare rows of words, and
// Kontrol had no strip at all, so arriving there moved everything under it up
// by the strip's whole height and leaving moved it back down. Nothing was
// wrong; there was simply no shape, and no test could have said there was one.
//
// Every assertion here is a measurement off the real dist/index.html, and every
// one of them would have been red the day before it was written.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { chooseScale, open, openSettings, openWithSample } from './helpers';

const TABS = ['Kurulum', 'Müsaitlik', 'Program', 'Kontrol', 'Yazdır', 'Ayarlar'] as const;

/** What the strip IS right now, read in one round trip. */
async function strip(page: Page) {
  return page.evaluate(() => {
    const bar = document.querySelector('.ribbon');
    if (bar === null) return null;
    const buttons = [...bar.querySelectorAll<HTMLElement>('.btn')];
    return {
      height: bar.getBoundingClientRect().height,
      section: bar.getAttribute('data-section'),
      role: bar.getAttribute('role'),
      name: bar.getAttribute('aria-label'),
      // Rule 2: the first thing on the strip says what the buttons answer.
      opensWithCaption: bar.firstElementChild?.classList.contains('ribbon-label') === true,
      captions: [...bar.querySelectorAll('.ribbon-label')].length,
      buttons: buttons.length,
      // Rule 4: a symbol AND a word, never one alone.
      wordless: buttons.filter((b) => (b.textContent ?? '').trim() === '').length,
      symbolless: buttons
        .filter((b) => b.querySelector('svg') === null)
        .map((b) => (b.textContent ?? '').trim()),
      // Rule 5, as a set: one entry means they all agree.
      buttonHeights: [...new Set(buttons.map((b) => b.getBoundingClientRect().height.toFixed(1)))],
    };
  });
}

async function go(page: Page, tab: string) {
  await page.getByRole('button', { name: tab, exact: true }).click();
  // The strip is remounted with the tab; give the cross-fade a frame to land
  // before measuring a height.
  await expect(page.locator('.ribbon')).toBeVisible();
  await page.waitForTimeout(120);
}

test.describe('57. Araç şeridi — altı sekme, tek iskelet', () => {
  test('altı sekmenin ALTISINDA şerit var ve hepsi aynı yükseklikte', async ({ page }) => {
    await openWithSample(page);

    const heights: number[] = [];
    for (const tab of TABS) {
      await go(page, tab);
      const bar = await strip(page);
      expect(bar, `${tab} sekmesinde şerit yok`).not.toBeNull();
      expect(bar!.role).toBe('toolbar');
      expect(bar!.name, `${tab} şeridinin adı yok`).toBeTruthy();
      heights.push(bar!.height);
    }

    // The reason this matters is not tidiness: the strip's height came and went
    // with Kontrol, so the grid, the pool and every panel under it jumped by
    // that much on the way in and again on the way out.
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    expect(
      max - min,
      `şerit yükseklikleri ayrışıyor: ${TABS.map((t, i) => `${t} ${heights[i].toFixed(1)}`).join(' · ')}`,
    ).toBeLessThanOrEqual(1);
  });

  test('her şerit bir başlıkla açılıyor ve her düğmede simge de kelime de var', async ({ page }) => {
    await openWithSample(page);

    for (const tab of TABS) {
      await go(page, tab);
      const bar = (await strip(page))!;
      expect(bar.opensWithCaption, `${tab} şeridi başlıkla açılmıyor`).toBe(true);
      expect(bar.buttons, `${tab} şeridinde hiç düğme yok`).toBeGreaterThan(0);
      // A symbol alone is unreadable the first time and unnameable in both test
      // layers (pitfall 56); a word alone gives the eye nothing to find at 150%.
      expect(bar.symbolless, `${tab}: simgesiz düğme(ler)`).toEqual([]);
      expect(bar.wordless, `${tab}: yazısız düğme(ler)`).toBe(0);
      expect(
        bar.buttonHeights,
        `${tab}: düğme yükseklikleri ayrışıyor (${bar.buttonHeights.join(', ')})`,
      ).toHaveLength(1);
    }
  });

  test('%150 ölçekte de altısı aynı yükseklikte ve hiçbiri taşmıyor', async ({ page }) => {
    // Pitfall 48: a bar whose contents do not shrink pushes them out of itself,
    // and what spills is not hidden, it is UNCLICKABLE. 150% is the scale this
    // tool's reader actually uses, so it is the scale the contract is measured
    // at — the strip has more in it than it did before this round.
    await openWithSample(page);
    await chooseScale(page, 150);

    const heights: number[] = [];
    for (const tab of TABS) {
      await go(page, tab);
      const bar = (await strip(page))!;
      heights.push(bar.height);
      expect(
        bar.buttonHeights,
        `${tab} %150'de düğme yükseklikleri ayrışıyor`,
      ).toHaveLength(1);

      // Every control on the strip has to still be reachable by the pointer.
      const spill = await page.evaluate(() => {
        const bar = document.querySelector('.ribbon')!;
        const box = bar.getBoundingClientRect();
        return [...bar.querySelectorAll<HTMLElement>('.btn')].filter((b) => {
          const r = b.getBoundingClientRect();
          return r.right > box.right + 1 || r.left < box.left - 1;
        }).length;
      });
      expect(spill, `${tab} %150'de ${spill} düğme şeridin dışına taştı`).toBe(0);
    }

    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
    await chooseScale(page, 100);
  });

  test('şerit katlanınca altı sekmede de gidiyor, geri gelince duruyor', async ({ page }) => {
    await openWithSample(page);
    // The fold button's accessible name is its `aria-label` — the title
    // changes with the state and a name that moves is not a name (pitfall 49).
    const fold = page.getByRole('button', { name: 'Araç şeridi', exact: true });
    await fold.click();

    for (const tab of TABS) {
      await page.getByRole('button', { name: tab, exact: true }).click();
      await expect(page.locator('.ribbon')).toHaveCount(0);
    }

    await fold.click();
    await expect(page.locator('.ribbon')).toBeVisible();
  });
});

test.describe('58. Kontrol şeridi — raporu süzüyor', () => {
  /**
   * The sample school on Kontrol. Its capacity tables always exist (every
   * teacher, class and room gets a row whatever the news is), which is what
   * makes them the half a filter can be measured against.
   */
  async function openCheck(page: Page) {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.ribbon')).toBeVisible();
  }

  test('üç basamak: Hepsi · Sorunlar · Kapasite', async ({ page }) => {
    await openCheck(page);
    const bar = page.locator('.ribbon');
    for (const name of ['Hepsi', 'Sorunlar', 'Kapasite']) {
      await expect(bar.getByRole('button', { name, exact: true })).toBeVisible();
    }
    // 'hepsi' is the report as it always was: nothing hidden until asked.
    await expect(bar.getByRole('button', { name: 'Hepsi', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('Kapasite sorun panellerini, Sorunlar kapasite tablolarını kaldırıyor', async ({ page }) => {
    await openCheck(page);
    const bar = page.locator('.ribbon');
    const loads = page.locator('.panel', { hasText: 'Derslikler' });
    const status = page.locator('.panel', { hasText: 'Programın durumu' });

    await expect(loads).toHaveCount(1);
    await expect(status).toHaveCount(1);

    await bar.getByRole('button', { name: 'Sorunlar', exact: true }).click();
    await expect(loads).toHaveCount(0);
    // The one panel that is in all three: it is the question you arrive with.
    await expect(status).toHaveCount(1);

    await bar.getByRole('button', { name: 'Kapasite', exact: true }).click();
    await expect(loads).toHaveCount(1);
    await expect(status).toHaveCount(1);

    await bar.getByRole('button', { name: 'Hepsi', exact: true }).click();
    await expect(loads).toHaveCount(1);
  });

  test('süzgeç bir POZİSYON — başka sekmeye bakıp dönünce duruyor', async ({ page }) => {
    // Pitfall 18: switching tabs unmounts the component, so anything held in
    // its own useState is lost by a glance at the grid.
    await openCheck(page);
    const bar = page.locator('.ribbon');
    await bar.getByRole('button', { name: 'Kapasite', exact: true }).click();

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();

    await expect(bar.getByRole('button', { name: 'Kapasite', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('.panel', { hasText: 'Kural ihlalleri' })).toHaveCount(0);
  });

  test('şeritteki sayılar raporun kendisiyle aynı şeyi söylüyor', async ({ page }) => {
    // The strip states rather than asks here, and a reading that disagrees with
    // the panels under it is worse than no reading: `buildReport` runs in full
    // whatever the filter says, which is what makes them the same numbers.
    await openCheck(page);
    const value = page.locator('.ribbon .ribbon-value');
    await expect(value).toContainText(/\d+ engel/);
    await expect(value).toContainText(/\d+ uyarı/);

    const blocked = Number((await value.innerText()).match(/(\d+) engel/)![1]);
    const inPanels = await page.locator('table.list .badge.impossible').count();
    // Not equality — the panels also badge closed-hour leftovers and capacity
    // rows, which the chip counts separately. What must hold is the direction:
    // a strip saying "0 engel" over a page full of red is the bug.
    if (blocked > 0) expect(inPanels).toBeGreaterThan(0);
    else await expect(page.locator('.panel', { hasText: 'Kural ihlalleri' })).toHaveCount(0);
  });
});

test.describe('59. Şeritteki simgeler', () => {
  test('bir şeyin simgesi her ekranda AYNI', async ({ page }) => {
    // steps.tsx: "a symbol that means something different in each room is not a
    // symbol, it is decoration". Yazdır names classes and teachers too, and
    // before this round it named them with no symbol at all — the easiest place
    // for a second drawing of the same door to appear.
    await openWithSample(page);

    const shapeOf = async (tab: string, button: string) => {
      await go(page, tab);
      return page
        .locator('.ribbon')
        .getByRole('button', { name: button })
        .locator('svg')
        .first()
        .evaluate((n) => n.innerHTML.replace(/\s+/g, ''));
    };

    const setupTeacher = await shapeOf('Kurulum', 'Öğretmenler');
    const availTeacher = await shapeOf('Müsaitlik', 'Öğretmen');
    const printTeacher = await shapeOf('Yazdır', 'Öğretmenler');
    expect(availTeacher).toBe(setupTeacher);
    expect(printTeacher).toBe(setupTeacher);

    const setupClass = await shapeOf('Kurulum', 'Sınıflar');
    const printClass = await shapeOf('Yazdır', 'Sınıflar');
    expect(printClass).toBe(setupClass);
    // ...and a teacher does not look like a class.
    expect(setupClass).not.toBe(setupTeacher);
  });

  test('şeritteki simgeler çizgi rengini alıyor — iki temada da görünür', async ({ page }) => {
    // The hand-drawn four are on `currentColor` by construction; the lucide ones
    // arrived in this round and a stroke pinned to a colour would vanish on one
    // of the two planes. Read off the real page rather than off the source.
    await open(page);
    await openSettings(page, 'Görünüm');

    const inkMatches = async () =>
      page.locator('.ribbon .btn').first().evaluate((b) => {
        const svg = b.querySelector('svg')!;
        return getComputedStyle(svg).color === getComputedStyle(b).color;
      });

    expect(await inkMatches()).toBe(true);
    await page.getByRole('button', { name: 'Koyu tema', exact: true }).click();
    expect(await inkMatches()).toBe(true);
  });
});
