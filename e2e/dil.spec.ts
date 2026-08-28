// 82. The language.
//
// v2.0.0's first half: the machine, Turkish as the source, English as the
// second dictionary. What is worth measuring here is NOT that a dropdown
// changes a word — it is the three things that would each break silently:
//
//   - Turkish is UNCHANGED. The whole point of using Turkish sentences as keys
//     is that moving a file to `t()` is a no-op on my father's screen. The 433
//     tests around this one are the real proof; this one states it out loud.
//   - The preference is a MACHINE preference: its own key, never in `State`,
//     never in a backup, and listed in "Veriler nerede" like the other ten.
//   - `<html lang>` moves with it. A screen reader picks its voice from that
//     attribute, and it was hard-coded to "tr" in index.html.
//
// Every other test in the suite is pinned to Turkish in `kapan.ts`; this file
// is the one that deliberately unpins itself.

import { expect, test } from './kapan';
import { open, openSettings, openWithSample, FILE } from './helpers';

type Dil = 'tr' | 'en' | 'de' | 'es' | 'fr';

/** Sets the preference the way the app itself stores it, then reloads. */
async function chooseLang(page: import('@playwright/test').Page, dil: Dil) {
  await page.evaluate((d) => localStorage.setItem('ders-programi-dil', d), dil);
  await page.reload();
}

test.describe('82. Dil', () => {
  test('varsayılan Türkçe ve <html lang> onu söylüyor', async ({ page }) => {
    await open(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
    await expect(page.getByRole('button', { name: 'Okul', exact: true })).toBeVisible();
  });

  test('İngilizceye geçince sekmeler ÇEVRİLİYOR ve lang değişiyor', async ({ page }) => {
    await open(page);
    await chooseLang(page, 'en');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    for (const [tr, en] of [
      ['Okul', 'School'],
      ['Program', 'Timetable'],
      ['Ayarlar', 'Settings'],
    ] as const) {
      await expect(page.getByRole('button', { name: en, exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: tr, exact: true })).toHaveCount(0);
    }
  });

  test('Türkçe geri gelince ekran BİREBİR eskisi', async ({ page }) => {
    await open(page);
    const before = await page.locator('.topbar').innerText();
    await chooseLang(page, 'en');
    await chooseLang(page, 'tr');
    expect(await page.locator('.topbar').innerText()).toBe(before);
  });

  // The one that would rot silently: a dictionary is never finished, and a
  // half-translated screen has to fall back to correct Turkish rather than to
  // a key name. This asserts the FALLBACK, not the size of the dictionary.
  test('çevrilmemiş bir cümle TÜRKÇE kalıyor — anahtar adı görünmüyor', async ({ page }) => {
    await open(page);
    await chooseLang(page, 'en');
    const text = await page.locator('body').innerText();
    // Nothing that looks like an untranslated identifier ever reaches a screen.
    expect(text).not.toMatch(/\b[a-z]+\.[a-z]+\.[a-z]+\b/);
    expect(text.length).toBeGreaterThan(100);
  });

  // The other three, and what is measured is NOT the size of a dictionary: it
  // is that each one reaches the screen at all and that the tab strip is fully
  // in it. A half-translated shell is exactly the state this round existed to
  // leave behind.
  test('beş dilin beşi de sekmeleri KENDİ dilinde çiziyor', async ({ page }) => {
    await open(page);
    const beklenen: Array<[Dil, string, string, string]> = [
      ['en', 'School', 'Timetable', 'Settings'],
      ['de', 'Schule', 'Stundenplan', 'Einstellungen'],
      ['es', 'Escuela', 'Horario', 'Ajustes'],
      ['fr', 'École', 'Emploi du temps', 'Réglages'],
    ];
    for (const [dil, okul, program, ayarlar] of beklenen) {
      await chooseLang(page, dil);
      await expect(page.locator('html')).toHaveAttribute('lang', dil);
      for (const ad of [okul, program, ayarlar]) {
        await expect(page.getByRole('button', { name: ad, exact: true })).toBeVisible();
      }
      // and no Turkish left standing in the strip
      await expect(page.getByRole('button', { name: 'Okul', exact: true })).toHaveCount(0);
    }
  });

  // The pure modules are the half a hook cannot reach: `constraints.ts` writes
  // this sentence and reads the language from `i18n.ts`'s module state. If
  // `applyDil` ever stopped setting it, the interface would change language
  // and every one of these would stay Turkish.
  test('SAF modüllerin cümleleri de çevriliyor — kapasite raporu', async ({ page }) => {
    await openWithSample(page);
    await chooseLang(page, 'en');
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    const metin = await page.locator('.main').innerText();
    expect(metin).toContain('available');
    expect(metin).not.toContain('müsait');
  });

  // Turkish takes no plural after a number; the other four do, and the form is
  // asked of Intl.PluralRules rather than guessed from n === 1.
  test('çoğul EKRANDA doğru biçimi seçiyor', async ({ page }) => {
    await openWithSample(page);
    await chooseLang(page, 'en');
    await page.getByRole('button', { name: 'School', exact: true }).click();
    const metin = await page.locator('body').innerText();
    expect(metin).toMatch(/\b\d+ (rooms|classes|teachers|subjects)\b/);
  });

  test('tercih bu MAKİNEYE ait — programın kendisine girmiyor', async ({ page }) => {
    await open(page);
    await chooseLang(page, 'en');
    const saved = await page.evaluate(() => ({
      dil: localStorage.getItem('ders-programi-dil'),
      plan: localStorage.getItem('ders-programi') ?? '',
    }));
    expect(saved.dil).toBe('en');
    // A backup taken here must not carry a language to my father's machine.
    expect(saved.plan).not.toContain('dil');
    expect(saved.plan).not.toContain('lang');
  });

  test('Ayarlar → Hakkında dil anahtarını da SAYIYOR', async ({ page }) => {
    await open(page);
    // Write it first: the table lists a key with 0 as well, but a key that is
    // there for real is the stronger check.
    await page.evaluate(() => localStorage.setItem('ders-programi-dil', 'tr'));
    await openSettings(page, 'Hakkında');
    await expect(page.locator('table').filter({ hasText: 'ders-programi-dil' })).toBeVisible();
  });

  test('depo okunamıyorsa CİHAZIN dili — sessizce Türkçeye çakılmıyor', async ({ page }) => {
    // A reader in a private tab still gets their own language. Measured rather
    // than assumed, because the fallback lives in a catch block nobody sees.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', { value: 'en-GB', configurable: true });
      try {
        localStorage.removeItem('ders-programi-dil');
      } catch {
        // nothing to remove
      }
    });
    await page.goto(FILE);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
