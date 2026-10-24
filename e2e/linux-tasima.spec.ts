// Moving to the Linux app (TODO B7.28): the plans leave the site's origin and
// arrive in a copy of dist/index.html under file://, in a Chrome profile of
// its own. Nothing carries them across but the one-file bundle, and the steps
// README.md gives are exactly the ones below:
//
//   old copy (the site, over http)   Ayarlar → Planlar ve yedek → Tümünü dosyaya kaydet
//   new copy (file://, empty store)  Ayarlar → Planlar ve yedek → Tümünü dosyadan aç
//
// The new copy is a second browser context: its own storage, like the new
// profile, and file:// like the launcher opens it. It runs under the site
// config because the old copy has to be the site build, served over http.

import { readFile } from 'node:fs/promises';
import { type Browser } from '@playwright/test';
import { expect, test, type Page } from './kapan';
import { FILE, answerDialog, openSettings, openSetup, savedText } from './helpers';

const picker = (page: Page) => page.getByLabel('Plan', { exact: true });

async function openPlans(page: Page) {
  await openSettings(page, 'Planlar ve yedek');
  await expect(page.getByRole('heading', { name: /^Planlar/ })).toBeVisible();
}

interface PaketPlan {
  name: string;
  draft?: boolean;
  state: { settings: { subjects: string[] } } & Record<string, unknown>;
}

async function tumunuKaydet(page: Page): Promise<{ plans: PaketPlan[] }> {
  await openPlans(page);
  const wait = page.waitForEvent('download');
  await page.getByRole('button', { name: /Tümünü dosyaya kaydet/ }).click();
  const path = (await (await wait).path())!;
  return JSON.parse(await readFile(path, 'utf8')) as { plans: PaketPlan[] };
}

/** The new copy: an empty store at file://, and no request leaves it. */
async function yeniKopya(browser: Browser) {
  const context = await browser.newContext({
    locale: 'tr-TR',
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  const istekler: string[] = [];
  page.on('request', (r) => {
    if (!/^(file|data|blob|about):/.test(r.url())) istekler.push(r.url());
  });
  await page.goto(FILE);
  await expect(page.getByRole('button', { name: 'Okul', exact: true })).toBeVisible();
  return { context, page, istekler };
}

test.describe('Linux uygulamasına taşıma: siteden file://’a (B7.28)', () => {
  test('bütün planlar içerikleriyle geçiyor, yeni kopya ağa çıkmıyor', async ({
    page,
    browser,
  }) => {
    // The old copy: the sample school, and a second plan with a name of its own.
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Okul', exact: true })).toBeVisible();
    expect(new URL(page.url()).protocol).toBe('http:');
    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await answerDialog(page);
    await expect.poll(() => savedText(page), { timeout: 5_000 }).toContain('Örnek Kurs');
    await openPlans(page);
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click();
    await expect(picker(page).locator('option')).toHaveCount(2);
    await openSettings(page, 'Zil ve günler');
    await page.getByLabel('Okul adı').fill('İkinci Okul');
    await page.getByLabel('Okul adı').blur();
    const eski = await tumunuKaydet(page);
    expect(eski.plans.map((p) => p.name)).toEqual(['1. plan', 'Boş plan']);

    const yeni = await yeniKopya(browser);
    const p2 = yeni.page;
    // The reason the move is needed at all: the new copy sees nothing of the old one.
    expect(await savedText(p2)).not.toContain('Örnek Kurs');
    await expect(picker(p2).locator('option')).toHaveCount(1);

    await openPlans(p2);
    await p2.getByLabel('Bütün planları içeren dosya').setInputFiles({
      name: 'ders-programi-tumu-2026-10-10-2300.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(eski)),
    });
    await answerDialog(p2);
    await expect(
      p2
        .locator('.panel', { hasText: 'Bütün planlar tek dosyada' })
        .locator('.hint[role="status"]'),
    ).toHaveText('2 plan açıldı.');

    // What arrived is what left: the same plans, read back out of the new store.
    const gelen = await tumunuKaydet(p2);
    expect(gelen.plans.map((p) => p.name)).toEqual(eski.plans.map((p) => p.name));
    // One known difference, and it is not the move's: a plan saved with an
    // EMPTY subject list is read back with the built-in one (`parseState`), on
    // any origin (TODO B7.27, side finding). So an empty list is compared as
    // "filled", everything else exactly; the sample plan's list is not empty
    // and is compared whole.
    expect(eski.plans[0]!.state.settings.subjects.length).toBeGreaterThan(0);
    for (const [i, plan] of eski.plans.entries()) {
      const geldi = gelen.plans[i]!.state;
      if (plan.state.settings.subjects.length === 0) {
        expect(geldi.settings.subjects.length, plan.name).toBeGreaterThan(0);
        geldi.settings.subjects = [];
      }
      expect(geldi, plan.name).toEqual(plan.state);
    }

    // ...and on screen: the second plan's own school, the first plan's teachers.
    await picker(p2).selectOption({ label: 'Boş plan' });
    await expect(p2.locator('.app-title')).toHaveText('İkinci Okul');
    await picker(p2).selectOption({ label: '1. plan' });
    await openSetup(p2, 'Öğretmenler');
    expect(await p2.locator('table.list tbody tr').count()).toBeGreaterThan(0);

    expect(yeni.istekler).toEqual([]);
    await yeni.context.close();
  });
});
