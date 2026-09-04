// Devriye — yazilmis bir iddiayi degil, YAZILMAMIS olani arar.
//
// The other 31 spec files ask specific questions and are silent about
// everything else. This one asks nothing: it walks through the program and
// listens to what the page itself complains about. The listening is in
// `e2e/kapan.ts` and it is automatic, so what is left here is only the
// walking.
//
// TWO WALKS, and they find different things:
//
//   1. The systematic tour goes everywhere on purpose — every tab, every
//      setup step, every settings section, every button on every strip. It
//      finds the screen nobody visits: the one that throws on mount because a
//      prop was renamed in a round that never opened it.
//   2. The seeded random walk goes somewhere nobody planned. It finds the
//      ORDER nobody tried: open the inspector, switch plans, undo, print.
//      Seeded, so a failure is reproducible from the number in its name.
//
// It is NOT part of `npm run kontrol`, and that is not about speed. A patrol
// failure is read as a TRACE, not as an assertion, so this config keeps video
// and traces on; the daily loop should stay a list of yes/no answers.

import { expect, test, type Page } from '../kapan';
import { answerDialog, open } from '../helpers';

/** Deterministic PRNG. The seed is in the test name, so a red run repeats. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Everything a click could open that is not part of the program.
 *
 * None of these is a failure; all of them would HANG the walk. A native file
 * chooser blocks the click that opened it, a download waits for a path, and a
 * target="_blank" link leaves the walk looking at somebody else's page.
 */
async function kapilariKapat(page: Page) {
  page.on('filechooser', (fc) => void fc.setFiles([]).catch(() => undefined));
  page.on('download', (d) => void d.cancel().catch(() => undefined));
  page.on('popup', (p) => void p.close().catch(() => undefined));
  // `window.print()` blocks the click that called it until a print dialog is
  // dismissed, and there is nobody here to dismiss one. What printing does is
  // measured by yazdir.spec.ts, on paper geometry; here it would only be a
  // way to hang.
  await page.addInitScript(() => {
    window.print = () => undefined;
  });
}

/**
 * How long a click is given before the walk moves on.
 *
 * Short on purpose. A patrol is not waiting for anything: if a control is not
 * ready within a second and a half it is either disabled or behind something,
 * and both are answers. The first version used Playwright's 5 and 10 second
 * defaults and 60 steps of them added up to a suite that timed out at three
 * minutes without visiting anything (measured 2026-08-27).
 */
const TIK = 2500;

/** The program is still a program: the shell is up and the tabs are there. */
async function ayaktaMi(page: Page, nerede: string) {
  // Short: this runs after every single click, and a five second default on a
  // check that is true in one millisecond is what turns a patrol into a
  // timeout rather than a finding.
  await expect(page.locator('.topbar'), `${nerede}: üst çubuk gitti`).toBeVisible({
    timeout: 3000,
  });
  await expect(page.locator('main'), `${nerede}: gövde gitti`).toBeVisible({ timeout: 3000 });
}

/**
 * Closes whatever is open, preferring the way out that changes least.
 *
 * THERE ARE TWO KINDS and the first version only knew about one. Radix draws
 * `.dlg` under a `.dlg-overlay` that swallows pointer events; ColorPick uses a
 * real `<dialog>` with `showModal()`, which makes the whole page `inert`.
 * Either way the next click is not on anything, and Playwright's answer to
 * "not actionable" is to wait — which is how the first tour spent its entire
 * timeout in front of a colour picker.
 *
 * Escape rather than a button: both kinds close on it, and it is the answer
 * that changes the least.
 */
async function diyalogKapat(page: Page): Promise<boolean> {
  const acik = page.locator('dialog[open], .dlg-overlay, .dlg');
  if ((await acik.count()) === 0) return false;

  await page.keyboard.press('Escape');
  if ((await acik.count()) === 0) return true;

  // A confirm that will not take Escape. Cancel is FIRST in the DOM so focus
  // lands on the safe side (see helpers.answerDialog), and that is the one
  // this wants.
  const iptal = page.locator('.dlg-actions .btn').first();
  if ((await iptal.count()) > 0) await iptal.click({ timeout: TIK }).catch(() => undefined);
  await expect(acik).toHaveCount(0, { timeout: 2000 }).catch(() => undefined);
  return true;
}

const SEKMELER = [
  'Okul', 'Müsaitlik', 'Dersler', 'Program', 'Kontrol', 'Çıktı', 'Ayarlar',
];

test.describe('Devriye', () => {
  test('sistematik tur — her sekme, her adım, her bölüm, her şerit düğmesi', async ({ page }) => {
    await kapilariKapat(page);
    await open(page);

    // With data, not without. An empty program draws empty screens, and an
    // empty screen is the one place a rendering bug cannot happen (pitfall
    // 41: a layout measured on nothing measures nothing).
    await page.getByRole('button', { name: 'Ayarlar' }).click();
    await page.locator('.ribbon .btn', { hasText: 'Hakkında' }).first().click();
    await page.getByRole('button', { name: 'Örnek okulu yükle' }).click();
    await answerDialog(page);
    await expect(page.locator('.dlg')).toHaveCount(0);

    const gezilen: string[] = [];
    // A ceiling, not a plan: the tour is meant to finish. It is here so that
    // one control that hangs costs a readable failure rather than the whole
    // suite's timeout with nothing printed (measured: the first version got
    // through zero tabs in three minutes).
    const bitis = Date.now() + 300_000;

    for (const sekme of SEKMELER) {
      if (Date.now() > bitis) break;
      // A modal <dialog> makes everything behind it `inert`, so the tab is not
      // clickable until whatever the last button opened is closed.
      await diyalogKapat(page);
      await page.getByRole('button', { name: sekme, exact: true }).click({ timeout: TIK });
      await ayaktaMi(page, sekme);
      gezilen.push(sekme);

      // Every control on this tab's strip, by index rather than by handle:
      // clicking one can redraw the strip, and a stale handle would be a
      // flake rather than a finding.
      const sayi = await page.locator('.ribbon button').count();
      for (let i = 0; i < sayi && Date.now() < bitis; i++) {
        const btn = page.locator('.ribbon button').nth(i);
        if ((await btn.count()) === 0) break;
        const ad = ((await btn.getAttribute('aria-label')) ?? (await btn.textContent()) ?? '').trim();
        if (!(await btn.isVisible()) || !(await btn.isEnabled())) continue;
        // The two that end the tour rather than continue it.
        if (/Sıfırla|dosyadan aç/i.test(ad)) continue;

        await btn.click({ timeout: TIK }).catch(() => undefined);
        await diyalogKapat(page);
        await ayaktaMi(page, `${sekme} → ${ad}`);
        gezilen.push(`${sekme} → ${ad}`);
      }
    }

    // Not an assertion about a number: a line to read when this goes red, so
    // the reader knows how far the walk got.
    console.log(`devriye ${gezilen.length} durak gezdi:\n  ${gezilen.join('\n  ')}`);
    expect(gezilen.length, 'tur hiçbir yere uğramadı').toBeGreaterThan(SEKMELER.length);
  });

  for (const tohum of [1, 42, 1337]) {
    test(`rastgele gezinme — tohum ${tohum}`, async ({ page }) => {
      await kapilariKapat(page);
      await open(page);
      const rnd = mulberry32(tohum);
      const iz: string[] = [];
      const bitis = Date.now() + 120_000;

      for (let adim = 0; adim < 60 && Date.now() < bitis; adim++) {
        if (await diyalogKapat(page)) {
          iz.push('diyalog kapatıldı');
          continue;
        }
        // Whatever is on screen and can be pressed. Not a curated list: a
        // patrol that only presses the buttons somebody thought about is the
        // same patrol as the suite it is supposed to complement.
        const hedefler = page.locator(
          'main button:visible, .topbar button:visible, .ribbon button:visible, ' +
            'main select:visible, main [role="button"]:visible',
        );
        const n = await hedefler.count();
        if (n === 0) break;

        const secim = hedefler.nth(Math.floor(rnd() * n));
        const ad = ((await secim.getAttribute('aria-label')) ?? (await secim.textContent()) ?? '')
          .trim()
          .slice(0, 40);
        iz.push(ad === '' ? '(adsız)' : ad);
        await secim.click({ timeout: TIK }).catch(() => undefined);
        await ayaktaMi(page, `adım ${adim} (${ad}) · iz: ${iz.join(' → ')}`);
      }

      console.log(`tohum ${tohum} izi:\n  ${iz.join('\n  ')}`);
      expect(iz.length, 'gezinme hiç adım atmadı').toBeGreaterThan(10);
    });
  }
});
