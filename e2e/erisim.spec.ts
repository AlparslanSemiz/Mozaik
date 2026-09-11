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
import { open, openSettings, openWithSample } from './helpers';

/** Rules switched off, each with the reason it is off. */
const KAPALI = [
  // Measured better elsewhere, see the head of this file.
  'color-contrast',
];

/**
 * Known violations, by screen and rule. Counted on 2026-09-12 against the build
 * of `a81c79a` — the commit matters, because a number with no commit beside it
 * cannot be compared to anything later. A number here means "this many nodes,
 * already seen".
 *
 * Reading the list: an entry is not an excuse. It is a finding waiting for a
 * decision, and the decision goes in docs/TODO.md before the entry leaves.
 */
const BILINEN: Record<string, Record<string, number>> = {
  // `region` is on every one of the eleven screens and it is ONE node every
  // time, always `.ribbon`: the toolbar sits outside `<main>`, `<nav>` and
  // `<header>`. One decision closes all eleven.
  'Boş proje': { region: 1 },
  Okul: { region: 1, label: 8, 'empty-table-header': 2 },
  Müsaitlik: { region: 1, 'empty-table-header': 2 },
  Dersler: { region: 1, label: 6, 'label-title-only': 6, 'empty-table-header': 2 },
  Program: {
    region: 1,
    'empty-table-header': 6,
    'heading-order': 1,
    'scrollable-region-focusable': 1,
  },
  Kontrol: { region: 1 },
  Çıktı: { region: 1, 'heading-order': 1 },
  'Ayarlar · Görünüm': { region: 1 },
  'Ayarlar · Zil ve günler': { region: 1, 'empty-table-header': 1 },
  'Ayarlar · Kurallar': { region: 1, label: 6 },
  'Ayarlar · Planlar ve yedek': { region: 1, 'empty-table-header': 1 },
  'Ayarlar · Hakkında': { region: 1, 'scrollable-region-focusable': 1 },
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
  test('Program, Kontrol ve Çıktı, dolu veriyle', async ({ page }) => {
    await openWithSample(page);
    karsilastir('Program', await tara(page));

    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.main')).toBeVisible();
    karsilastir('Kontrol', await tara(page));

    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    await expect(page.locator('.main')).toBeVisible();
    karsilastir('Çıktı', await tara(page));
  });

  test('Okul, Müsaitlik ve Dersler, dolu veriyle', async ({ page }) => {
    await openWithSample(page);

    for (const sekme of ['Okul', 'Müsaitlik', 'Dersler']) {
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
});
