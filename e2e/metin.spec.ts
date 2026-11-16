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
import {
  goTab,
  openLessons,
  openProblems,
  openSettings,
  openSetup,
  openWithSample,
} from './helpers';

// The five tasks of K1 (2026-11-16), every list and section in them, the
// three ways round the lessons, and the problem list the chip opens.
const SEKMELER = ['Program', 'Öğretmenler', 'Sınıflar', 'Yazdır ve gönder', 'Okul bilgileri'];
const ADIMLAR = ['Derslikler', 'Branşlar', 'Öğretmenler', 'Sınıflar'];
const DERS_MODLARI = ['class', 'teacher', 'all'] as const;
const BOLUMLER = ['Zil ve günler', 'Kurallar', 'Görünüm', 'Planlar ve yedek', 'Hakkında'];

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
      await goTab(page, sekme);
      await bak(sekme);
    }
    for (const adim of ADIMLAR) {
      await openSetup(page, adim);
      await bak(`Liste → ${adim}`);
    }
    for (const mod of DERS_MODLARI) {
      await openLessons(page, mod);
      await bak(`Dersler → ${mod}`);
    }
    for (const bolum of BOLUMLER) {
      await openSettings(page, bolum);
      await bak(`Okul bilgileri → ${bolum}`);
    }
    await openProblems(page);
    await bak('Sorun listesi');
    await page.keyboard.press('Escape');

    const tekil = [...new Set(bulunan)];
    expect(tekil, `uzun çizgi taşıyan ${tekil.length} satır:\n${tekil.join('\n')}`).toEqual([]);
  });

  // 2026-08-30: "çok fazla info var ve çok uzunlar her yerde, infoları
  // olabildiğince anlaşılır kısa ve öz yap."
  //
  // The rule that came out of it is one sentence, and a rule with no test is a
  // wish (pitfall 77): a `.hint` says ONE thing, and what does not fit goes to
  // the element's `title`, where it is looked for instead of read past.
  //
  // The ceiling is MEASURED, not chosen. After the pass the longest static
  // hint on any screen was 126 characters — the line carrying the site's
  // address, which cannot be shortened without dropping the address — and the
  // next was 122. 140 leaves both of them room to be reworded and still turns
  // red at the paragraph this replaced: five of them were over 260, and the
  // teacher form's ran to 438.
  //
  // `.data-hint` is excluded and marked at the source, because what makes
  // those long is the SCHOOL rather than the prose: they name every unused
  // subject, every teacher with no lessons. A ceiling that counted them would
  // be a ceiling on how many subjects a school may leave unused.
  test('hiçbir açıklama satırı bir paragrafa dönüşmüyor', async ({ page }) => {
    await openWithSample(page);

    const TAVAN = 140;
    const uzun: string[] = [];
    const bak = async (nerede: string) => {
      const satirlar = await page.evaluate(() =>
        [...document.querySelectorAll('p.hint:not(.data-hint)')]
          .map((p) => (p as HTMLElement).innerText.split(/\s+/).join(' ').trim())
          .filter((s) => s.length > 0),
      );
      for (const s of satirlar) {
        if (s.length > TAVAN) uzun.push(`${nerede} [${s.length}]: ${s}`);
      }
    };

    for (const sekme of SEKMELER) {
      await goTab(page, sekme);
      await bak(sekme);
    }
    for (const adim of ADIMLAR) {
      await openSetup(page, adim);
      await bak(`Liste → ${adim}`);
    }
    for (const mod of DERS_MODLARI) {
      await openLessons(page, mod);
      await bak(`Dersler → ${mod}`);
    }
    for (const bolum of BOLUMLER) {
      await openSettings(page, bolum);
      await bak(`Okul bilgileri → ${bolum}`);
    }
    await openProblems(page);
    await bak('Sorun listesi');
    await page.keyboard.press('Escape');

    const tekil = [...new Set(uzun)];
    expect(
      tekil,
      `${TAVAN} karakteri geçen ${tekil.length} açıklama:\n${tekil.join('\n')}`,
    ).toEqual([]);
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
    // Müsaitlik's list went with K1 (2026-11-16); Ctrl+K names a teacher the
    // same way. What this test defends is the dot, not the length of what
    // stands either side of it.
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('Mehmet');
    await expect(page.locator('.palette').getByText('MÇ · Mehmet Çelik').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // And the empty cell still says "there is nothing here" rather than
    // looking like a rendering fault.
    await page
      .locator('.tabstrip')
      .getByRole('button', { name: 'Okul bilgileri', exact: true })
      .click();
    await page.locator('.ribbon .btn', { hasText: 'Kurallar' }).first().click();
    await expect(page.locator('table td.num', { hasText: /^–$/ }).first()).toBeVisible();
  });
});
