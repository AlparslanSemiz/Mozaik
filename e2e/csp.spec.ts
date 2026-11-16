// The exe's Content-Security-Policy, measured on the page it guards.
//
// `tauri.conf.json` carries the policy (güvenlik denetimi 2026-11-16) and Tauri
// adds a `sha256-` source for every inline <script> of `dist/index.html` to
// `script-src` when it embeds the page; `style-src` it leaves alone, because
// `dangerousDisableAssetCspModification` says so (a nonce there would switch
// `'unsafe-inline'` off, and Radix writes <style> elements at run time). This
// file does the same arithmetic, serves the built page under that header from
// a made-up origin, and walks the paths that need something of the policy:
// the sample (storage), Otomatik diz (blob: workers), the print preview and a
// PDF (fonts and images as data:), and a saved file (a blob: download). Any
// violation is a console error, which `kapan.ts` already fails the test on;
// the `securitypolicyviolation` listener says which directive.
//
// Red measured: without `worker-src blob:` the search falls back to the main
// thread (`data-oneri-isci` 0); with a hash added to `style-src` the page
// reports a refused inline style.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from './kapan';
import { answerDialog, fileOpened, PDF_YALNIZ_CHROMIUM } from './helpers';
import { SMALL_WORLDS } from '../src/pure/worlds';

const KOK = 'http://mozaik-csp.test/';

interface TauriConf {
  app: { security: { csp: string; dangerousDisableAssetCspModification?: boolean | string[] } };
}

/** The policy as Tauri serves it: the configured one plus the inline-script hashes. */
function tauriPolitikasi(conf: TauriConf, html: string): string {
  const { csp, dangerousDisableAssetCspModification: kapali = false } = conf.app.security;
  const degismez = (yonerge: string) =>
    kapali === true || (Array.isArray(kapali) && kapali.includes(yonerge));
  const ozet = (metin: string) =>
    `'sha256-${createHash('sha256').update(metin.replace(/\r\n?/g, '\n')).digest('base64')}'`;
  const icerik = (etiket: string) =>
    [...html.matchAll(new RegExp(`<${etiket}\\b[^>]*>([\\s\\S]*?)</${etiket}>`, 'g'))]
      .map((m) => m[1]!)
      .filter((t) => t.length > 0);
  const ekler: Record<string, string[]> = {
    'script-src': degismez('script-src') ? [] : icerik('script').map(ozet),
    'style-src': degismez('style-src') ? [] : icerik('style').map(ozet),
  };
  return csp
    .split(';')
    .map((y) => y.trim())
    .filter(Boolean)
    .map((y) => {
      const ad = y.split(/\s+/)[0]!;
      return [y, ...(ekler[ad] ?? [])].join(' ');
    })
    .join('; ');
}

const conf = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8')) as TauriConf;
const html = readFileSync('dist/index.html', 'utf8');
const POLITIKA = tauriPolitikasi(conf, html);

async function politikaAltinda(page: Page): Promise<string[]> {
  const ihlaller: string[] = [];
  await page.exposeFunction('__cspIhlal', (s: string) => ihlaller.push(s));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __cspIhlal: (s: string) => void }).__cspIhlal(
        `${e.effectiveDirective} ${e.blockedURI}`,
      );
    });
  });
  await page.route(`${KOK}**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      headers: { 'Content-Security-Policy': POLITIKA },
      body: html,
    }),
  );
  await page.goto(KOK);
  await expect(
    page.locator('.tabstrip').getByRole('button', { name: 'Okul bilgileri', exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return ihlaller;
}

test.describe('exe’nin CSP’si', () => {
  test('politika katı: uzak köken yok, eval yok, worker yalnız blob:', () => {
    const csp = conf.app.security.csp;
    expect(csp).toMatch(/default-src 'none'/);
    expect(csp).not.toMatch(/unsafe-eval|https?:\/\/(?!ipc\.localhost)|\*/);
    expect(csp).toMatch(/worker-src blob:/);
    expect(csp).toMatch(/script-src 'self'(;|$)/);
    expect(POLITIKA.split('script-src')[1]).toMatch(/'sha256-/);
  });

  test('örnek, Otomatik diz (worker), Çıktı, PDF ve kaydetme politikayı çiğnemiyor', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', PDF_YALNIZ_CHROMIUM);
    const ihlaller = await politikaAltinda(page);

    await page.getByRole('button', { name: /Örnek okulu yükle/ }).click();
    await answerDialog(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 60_000 });

    await page
      .locator('.tabstrip')
      .getByRole('button', { name: 'Yazdır ve gönder', exact: true })
      .click();
    await expect(page.locator('.print-page').first()).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    expect((await page.pdf()).byteLength).toBeGreaterThan(10_000);
    await page.emulateMedia({ media: 'screen' });

    const indirme = page.waitForEvent('download');
    await page.locator('.topbar').getByRole('button', { name: 'Kaydet', exact: true }).click();
    const dosya = await indirme;
    expect(dosya.suggestedFilename()).toMatch(/\.json$/);

    expect(ihlaller).toEqual([]);
  });

  test('öneri araması politika altında da worker’larda koşuyor', async ({ page }) => {
    const ihlaller = await politikaAltinda(page);
    const world = SMALL_WORLDS.find((w) => w.name === 'ogretmen-hafta-kapali')!;
    await page.locator('input[type=file]').setInputFiles({
      name: 'ders-programi-2026-08-25-1200.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(world.state)),
    });
    await fileOpened(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: 'Kalanı diz', exact: true }).click();
    await expect(page.locator('.panel.suggestions .btn.primary').first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByRole('button', { name: 'Durdur' })).toHaveCount(0, { timeout: 60_000 });
    const isci = await page.evaluate(() => document.documentElement.dataset['oneriIsci'] ?? '');
    expect(Number(isci), 'arama ana iş parçacığında koştu').toBeGreaterThan(0);
    expect(ihlaller).toEqual([]);
  });
});
