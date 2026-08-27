// 80. Ekranda uzun çizgi yok.
//
// A style rule that had to become a measurement. The em dash was everywhere:
// in prose as a parenthetical aside, and as the separator in "MÇ — Mehmet
// Çelik", "A: 4 sınıf — 410, 411" and "310 sınıfı — Haftalık ders programı".
// 265 lines of screen text carried one.
//
// It went for a reason a stylistic preference cannot carry on its own: this
// program is read by ONE person, quickly, while dragging cards, and an aside
// hung off a dash is a sentence he has to hold open. What replaced it is not
// a shorter dash. Prose became separate sentences, label/value pairs took a
// colon, and code/name pairs took the middle dot the print subtitle was
// already using.
//
// WHAT IS STILL ALLOWED, and both are deliberate:
//   –  (kısa çizgi, U+2013)  a table cell with no value, and hour ranges
//   ·  (orta nokta, U+00B7)  a separator between two things of equal weight
//
// Only what the eye actually receives is measured: `innerText`, not the
// source. Comments in the code are English, they are read by me, and they
// keep their dashes.

import { expect, test } from './kapan';
import { openWithSample } from './helpers';

const SEKMELER = [
  'Kurulum', 'Müsaitlik', 'Dersler', 'Program', 'Kontrol', 'Yazdır', 'Ayarlar',
];
const ADIMLAR = ['Derslikler', 'Öğretmenler', 'Sınıflar'];
// Dersler is a tab now, and its three modes draw three different screens.
const DERS_MODLARI = ['Sınıftan', 'Öğretmenden', 'Genel'];
const BOLUMLER = ['Okul', 'Kurallar', 'Branşlar', 'Görünüm', 'Veri'];

test.describe('80. Ekranda okunan metin', () => {
  test('hiçbir ekranda uzun çizgi (—) yok', async ({ page }) => {
    // With the sample loaded, because most of the dashes were in DATA rows
    // and an empty program draws none of them (pitfall 41).
    await openWithSample(page);

    const bulunan: string[] = [];
    const bak = async (nerede: string) => {
      const metin = await page.evaluate(() => document.body.innerText);
      for (const satir of metin.split('\n')) {
        if (satir.includes('—')) bulunan.push(`${nerede}: ${satir.trim()}`);
      }
    };

    for (const sekme of SEKMELER) {
      await page.getByRole('button', { name: sekme, exact: true }).click();
      await bak(sekme);

      if (sekme === 'Kurulum') {
        for (const adim of ADIMLAR) {
          await page.locator('.ribbon .step', { hasText: adim }).click();
          await bak(`Kurulum → ${adim}`);
        }
      }
      if (sekme === 'Dersler') {
        for (const mod of DERS_MODLARI) {
          await page.getByRole('button', { name: mod, exact: true }).click();
          await bak(`Dersler → ${mod}`);
        }
      }
      if (sekme === 'Ayarlar') {
        for (const bolum of BOLUMLER) {
          await page.locator('.ribbon .btn', { hasText: bolum }).first().click();
          await bak(`Ayarlar → ${bolum}`);
        }
      }
    }

    const tekil = [...new Set(bulunan)];
    expect(tekil, `uzun çizgi taşıyan ${tekil.length} satır:\n${tekil.join('\n')}`).toEqual([]);
  });

  test('ayraç ve boş değer İŞARETLERİ hâlâ yerinde', async ({ page }) => {
    // The other half, and it is the half that keeps this from being satisfied
    // by deleting text. "MÇ · Mehmet Çelik" still says two things; "MÇ Mehmet
    // Çelik" says one, and a rule that quietly costs a separator is worse than
    // the dash it replaced.
    await openWithSample(page);
    // Müsaitlik's list and not Kurulum's "Öğretmen yükü" table, which is where
    // this witness used to stand: that table dropped the short on 2026-08-27
    // ("Öğretmen yükü tarafında her öğretmen için çok uzun satır. kısaltmayı
    // gösterme orada"). The separator is unaffected by that and still has to
    // be defended, so it is asserted where it still belongs — a row that says
    // BOTH things needs the dot between them.
    await page.getByRole('button', { name: 'Müsaitlik', exact: true }).click();
    await expect(page.getByText('MÇ · Mehmet Çelik (Matematik)').first()).toBeVisible();

    // And the empty cell still says "there is nothing here" rather than
    // looking like a rendering fault.
    await page.getByRole('button', { name: 'Ayarlar', exact: true }).click();
    await page.locator('.ribbon .btn', { hasText: 'Kurallar' }).first().click();
    await expect(page.locator('table td.num', { hasText: /^–$/ }).first()).toBeVisible();
  });
});
