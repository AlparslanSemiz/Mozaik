// Automatic accessibility scan: axe-core over every screen, step and section.
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
import {
  open,
  openPerson,
  openSettings,
  openSetup,
  openWithSample,
  goTab,
  openProblems,
  openLessons,
} from './helpers';

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
 * Nothing is left on the list: the Program grid's lunch-break column headers
 * (`Grid.tsx`) now carry a hidden "Öğle arası", the last empty headers.
 */
const BILINEN: Record<string, Record<string, number>> = {};

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
  //
  // Even one screen is heavy: axe walks every node of a full grid or a full
  // print sheet, and that is the measurement, not a wait. 8-25 s each on a
  // loaded machine on 2026-11-16, and Program, Çıktı, Öğretmenler and Ayarlar
  // went over 30 s in the full suite while passing alone. `test.slow()`
  // triples the limit for the scans only (pitfall 171).
  test.beforeEach(() => test.slow());
  test('Program, dolu veriyle', async ({ page }) => {
    await openWithSample(page);
    karsilastir('Program', await tara(page));
  });

  test('Yazdır ve gönder, dolu veriyle', async ({ page }) => {
    await openWithSample(page);
    await goTab(page, 'Yazdır ve gönder');
    await expect(page.locator('.main')).toBeVisible();
    karsilastir('Yazdır ve gönder', await tara(page));
  });

  // The Kontrol tab became the status chip's list (K3, 2026-11-16): every
  // part of it, the load tables included.
  test('Sorun listesi, dolu veriyle', async ({ page }) => {
    await openWithSample(page);
    const list = await openProblems(page);
    karsilastir('Sorun listesi', await tara(page));
    await list.getByRole('button', { name: /^İpuçları/ }).click();
    karsilastir('Sorun listesi · İpuçları', await tara(page));
    await list.locator('.more-menu').click();
    await page.getByRole('menuitemradio', { name: 'Öğretmen yükleri' }).click();
    karsilastir('Sorun listesi · Öğretmen yükleri', await tara(page));
  });

  // Every Okul step, not only the one the tab opens on: the teacher and class
  // rows, where most of the unnamed boxes were, are two steps away from the
  // default and a scan of the default step never saw them. One test per step,
  // like the screens above (TP22): four scans in one test took 36 s on an idle
  // Mac and went over the budget on a loaded one.
  for (const adim of ['Derslikler', 'Branşlar', 'Öğretmenler', 'Sınıflar']) {
    test(`Okul · ${adim}, dolu veriyle`, async ({ page }) => {
      await openWithSample(page);
      await openSetup(page, adim);
      karsilastir(`Okul · ${adim}`, await tara(page));
    });
  }

  // The person page (Sadeleşme, K5): every control that left the Okul rows
  // is here now, so it is scanned like a screen, with the week unfolded.
  for (const adim of ['Öğretmenler', 'Sınıflar']) {
    test(`Kişi sayfası · ${adim}, dolu veriyle`, async ({ page }) => {
      await openWithSample(page);
      await openSetup(page, adim);
      const sheet = await openPerson(page, 0);
      await sheet.getByText('Haftalık programı', { exact: true }).click();
      karsilastir(`Kişi sayfası · ${adim}`, await tara(page));
      await page.keyboard.press('Escape');
      await page
        .getByRole('button', { name: adim === 'Öğretmenler' ? '+ Yeni öğretmen' : '+ Yeni sınıf' })
        .last()
        .click();
      karsilastir(`Yeni kişi · ${adim}`, await tara(page));
    });
  }

  test('Dersler, üç yoldan da dolu veriyle', async ({ page }) => {
    await openWithSample(page);

    for (const mode of ['class', 'teacher', 'all'] as const) {
      await openLessons(page, mode);
      karsilastir(`Dersler · ${mode}`, await tara(page));
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
  test('boş proje: Program, Yazdır ve gönder, sorun listesi', async ({ page }) => {
    await open(page);
    for (const sekme of ['Program', 'Yazdır ve gönder']) {
      await goTab(page, sekme);
      await expect(page.locator('.main')).toBeVisible();
      karsilastir(`Boş ${sekme}`, await tara(page));
    }
    await openProblems(page);
    karsilastir('Boş sorun listesi', await tara(page));
  });
});

// What a scanner cannot see: where the keyboard IS. Every dialog used to drop
// focus on <body> when it closed (Radix returns it to a Dialog.Trigger, and
// none of ours has one), so the next Tab started from the top of the page.
test.describe('91. Odak: diyalog kapanınca ve içeriğe geçerken', () => {
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

  // Both are behind the top bar's "?" menu since 2026-11-16 (Sadeleşme): the
  // keyboard opens the menu, picks the item, and Esc on the window brings
  // focus back to the "?" it all started from.
  for (const ad of ['Klavye kısayolları', 'Ara ve yap']) {
    test(`"${ad}" Esc ile kapanınca odak "?" düğmesine döner`, async ({ page }) => {
      await open(page);
      const button = page.locator('.topbar .topbar-help');
      await button.focus();
      await page.keyboard.press('Enter');
      await page.getByRole('menuitem', { name: new RegExp(ad) }).focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(button).toBeFocused();
    });
  }

  test('Daha fazla menüsü klavyeyle açılıyor, Esc ile kapanınca odak düğmeye dönüyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    const more = page.locator('.ribbon .more-menu');
    await more.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Yeniden yap' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(more).toBeFocused();
  });

  test('"?" açıklaması klavyeyle açılıp kapanıyor, odak geri dönüyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Kurallar');
    const help = page.getByRole('button', { name: 'Açıklama: Kurallar' });
    await help.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.help-pop')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.help-pop')).toHaveCount(0);
    await expect(help).toBeFocused();
  });

  test('kart menüsünden açılan ders penceresi kapanınca odak karta döner', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
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
