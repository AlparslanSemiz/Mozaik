// Automatic accessibility scan: axe-core over all seven screens.
//
// WHAT THIS IS NOT. Colour contrast and colour separation are already measured
// by hand in renk.spec.ts, computing the WCAG ratio and the CIE Lab ΔE, and
// that measurement is better than a generic scanner's: ΔE answers "can these
// two be told apart", which a contrast ratio cannot (docs/TESTPLAN.md). The
// contrast rule is therefore switched OFF below rather than run twice.
//
// WHAT IT IS FOR. The defects a person does not see by looking: a control with
// no accessible name, a role that contradicts its element, an id used twice, a
// list that is not a list, a heading level that skips. None of those change a
// single pixel, so no screenshot and no human pass can catch them.
//
// WHY A BASELINE AND NOT ZERO. The first run found real violations, and some
// of them may turn out to be deliberate. Until each has been read and decided,
// this file records what is known and fails on anything NEW: a scan that goes
// red on the day it is written teaches the reader to ignore it. The known list
// below is a debt with a date, not a permission.

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './kapan';
import { open, openSettings, openSetup, openWithSample } from './helpers';

/** Rules switched off, each with the reason it is off. */
const KAPALI = [
  // Measured better elsewhere, see the head of this file.
  'color-contrast',
];

/**
 * Known violations, by screen and rule. First counted on 2026-09-12 against the
 * build of `a81c79a`, recounted on 2026-11-15 on `erisim/anlam` once every Okul
 * step and the empty Program, Kontrol and Çıktı were scanned too — the commit
 * matters, because a number with no commit beside it cannot be compared to
 * anything later. A number here means "this many nodes, already seen".
 *
 * Reading the list: an entry is not an excuse. It is a finding waiting for a
 * decision, and the decision goes in docs/TODO.md before the entry leaves.
 *
 * What is left is the empty corner and divider headers of two grids whose
 * markup belongs to other work (TODO §8e): the Program grid (`Grid.tsx`, the
 * corner and the five day bands' dividers) and Müsaitlik's two corners.
 */
const BILINEN: Record<string, Record<string, number>> = {
  Müsaitlik: { 'empty-table-header': 2 },
  Program: { 'empty-table-header': 6 },
};

interface Bulgu {
  id: string;
  impact: string;
  nodes: number;
  help: string;
  first: string;
}

async function tara(page: import('@playwright/test').Page): Promise<Bulgu[]> {
  const sonuc = await new AxeBuilder({ page }).disableRules(KAPALI).analyze();
  return sonuc.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? 'bilinmiyor',
    nodes: v.nodes.length,
    help: v.help,
    first: v.nodes[0]?.target.join(' ') ?? '',
  }));
}

/** Prints the findings into the run's output, then compares against BILINEN. */
function karsilastir(ekran: string, bulgular: Bulgu[]) {
  if (bulgular.length > 0) {
    console.log(
      `\n[erişim] ${ekran}\n` +
        bulgular
          .map((b) => `  ${b.id} · ${b.impact} · ${b.nodes} düğüm · ${b.help}\n    ${b.first}`)
          .join('\n'),
    );
  }
  // `expect.soft`, so that ONE screen going red does not stop the scan before
  // the next six are looked at. A scan that reports the first problem and
  // stops is how a list like this stays half written.
  const beklenen = BILINEN[ekran] ?? {};
  for (const b of bulgular) {
    expect
      .soft(
        b.nodes,
        `${ekran}: "${b.id}" (${b.help}) bu ekranda ${b.nodes} düğümde, listede ${beklenen[b.id] ?? 0}`,
      )
      .toBeLessThanOrEqual(beklenen[b.id] ?? 0);
  }
  // And the other direction: a fixed violation has to leave the list, or the
  // list slowly becomes a description of a page nobody has.
  for (const [id, count] of Object.entries(beklenen)) {
    const found = bulgular.find((b) => b.id === id)?.nodes ?? 0;
    expect
      .soft(found, `${ekran}: "${id}" listede ${count} yazıyor ama ekranda ${found}`)
      .toBe(count);
  }
}

test.describe('90. Erişilebilirlik taraması', () => {
  // Data first: an empty screen has almost no controls on it, and the rows,
  // the grid and the pool are where the defects would be.
  // One screen per test (TODO TP22): on Windows the three scans together took
  // ~25 s of the 30 s budget, Çıktı the heaviest, and the test fell over the
  // ceiling now and then.
  test('Program, dolu veriyle', async ({ page }) => {
    await openWithSample(page);
    karsilastir('Program', await tara(page));
  });

  for (const sekme of ['Kontrol', 'Çıktı']) {
    test(`${sekme}, dolu veriyle`, async ({ page }) => {
      await openWithSample(page);
      await page.getByRole('button', { name: sekme, exact: true }).click();
      await expect(page.locator('.main')).toBeVisible();
      karsilastir(sekme, await tara(page));
    });
  }

  // Every Okul step, not only the one the tab opens on: the teacher and class
  // rows, where most of the unnamed boxes were, are two steps away from the
  // default and a scan of the default step never saw them.
  test('Okul, her adımı ayrı, dolu veriyle', async ({ page }) => {
    await openWithSample(page);

    for (const adim of ['Derslikler', 'Branşlar', 'Öğretmenler', 'Sınıflar']) {
      await openSetup(page, adim);
      karsilastir(`Okul · ${adim}`, await tara(page));
    }
  });

  test('Müsaitlik ve Dersler, dolu veriyle', async ({ page }) => {
    await openWithSample(page);

    for (const sekme of ['Müsaitlik', 'Dersler']) {
      await page.getByRole('button', { name: sekme, exact: true }).click();
      await expect(page.locator('.main')).toBeVisible();
      karsilastir(sekme, await tara(page));
    }
  });

  test('Ayarlar, her bölümü ayrı', async ({ page }) => {
    await openWithSample(page);

    for (const bolum of ['Görünüm', 'Zil ve günler', 'Kurallar', 'Planlar ve yedek', 'Hakkında']) {
      await openSettings(page, bolum);
      karsilastir(`Ayarlar · ${bolum}`, await tara(page));
    }
  });

  test('boş proje: ilk açılan ekran', async ({ page }) => {
    // The screen my father sees first, and the one screen with no data to
    // hide a missing label behind.
    await open(page);
    karsilastir('Boş proje', await tara(page));
  });

  // The three screens that have nothing to show on a new project still owe
  // the reader a heading for what will be there.
  test('boş proje: Program, Kontrol ve Çıktı', async ({ page }) => {
    await open(page);
    for (const sekme of ['Program', 'Kontrol', 'Çıktı']) {
      await page.getByRole('button', { name: sekme, exact: true }).click();
      await expect(page.locator('.main')).toBeVisible();
      karsilastir(`Boş ${sekme}`, await tara(page));
    }
  });
});

// What a scanner cannot see: where the keyboard IS. Every dialog used to drop
// focus on <body> when it closed (Radix returns it to a Dialog.Trigger, and
// none of ours has one), so the next Tab started from the top of the page.
test.describe('91. Odak: diyalog kapanınca ve içeriğe geçerken', () => {
  /** Says which element has focus, by its accessible-ish name. */
  const odakta = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const el = document.activeElement;
      if (el === null || el === document.body) return 'BODY';
      return `${el.tagName}:${el.getAttribute('aria-label') ?? el.id ?? ''}`;
    });

  test('ilk Tab "İçeriğe geç", Enter içerik alanına götürür', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'İçeriğe geç' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    // And the next Tab is IN the content, not back in the top bar.
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => document.querySelector('main')!.contains(document.activeElement)),
    ).toBe(true);
  });

  for (const ad of ['Klavye kısayolları', 'Ara ve git']) {
    test(`"${ad}" Esc ile kapanınca odak düğmesine döner`, async ({ page }) => {
      await open(page);
      const button = page.getByRole('button', { name: ad, exact: true });
      await button.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect.poll(() => odakta(page)).toBe(`BUTTON:${ad}`);
    });
  }

  test('kart menüsünden açılan ders penceresi kapanınca odak karta döner', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: /^Otomatik diz/ }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });

    const card = page.locator('table.grid .card').first();
    await card.focus();
    await page.keyboard.press('Enter');
    // The menu item is gone a moment after it is chosen: the opener is the
    // card the menu was opened on, not the item.
    await page.locator('.menu').getByRole('menuitem', { name: 'Dersi düzenle' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(card).toBeFocused();
  });

  test('sorulan soru kapanınca odak soran düğmeye döner', async ({ page }) => {
    await open(page);
    const button = page.getByRole('button', { name: /Örnek okulu yükle/ });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.dlg')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.dlg')).toHaveCount(0);
    await expect(button).toBeFocused();
  });
});
