// 36. The site build (task 4e).
//
// The tool has two delivery routes now: the file my father double-clicks, and
// a page on the web for when he is not at that computer. The second one is
// only allowed to exist if it keeps principle 3 — works without the internet —
// which for a web page means a service worker and a copy of itself on disk.
//
// So the test that matters here is not "the page opens". It is: pull the plug,
// reload, and the app is still there. Everything else in this file guards the
// two ways that can quietly stop being true — the shell not being cached, and
// the site build leaking into the file:// build.

import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test.describe('36. Site sürümü', () => {
  test('site http üzerinden açılıyor ve uygulama çiziliyor', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();
    // Same single file as the double-clicked one: no second request for code.
    await expect(page.locator('script[src]')).toHaveCount(0);
  });

  test('manifest bağlı, okunabiliyor ve simgeleri gerçekten iniyor', async ({ page, request }) => {
    await page.goto('/');
    const href = await page.locator('link[rel=manifest]').getAttribute('href');
    expect(href).toBe('./manifest.webmanifest');

    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const manifest = JSON.parse(await res.text());
    expect(manifest.name).toBe('Ders Programı');
    expect(manifest.display).toBe('standalone');
    // Installability needs a 192 and a 512; a maskable one keeps Android from
    // drawing our square inside its own circle with white corners.
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(manifest.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true);

    for (const icon of manifest.icons as { src: string }[]) {
      const img = await request.get(`/${icon.src.replace('./', '')}`);
      expect(img.status(), `${icon.src} inmiyor`).toBe(200);
      expect(Number(img.headers()['content-length'] ?? '1')).toBeGreaterThan(0);
    }
  });

  test('service worker kaydoluyor', async ({ page }) => {
    await page.goto('/');
    const scope = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return reg.scope;
    });
    expect(scope).toContain('localhost:4173');
  });

  test('ÇEVRİMDIŞI: fiş çekilince site yine açılıyor', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    // The shell is cached during install, but `addAll` finishing is not the
    // same moment as `ready`; wait for the copy to actually be on disk.
    await expect
      .poll(async () =>
        page.evaluate(async () => {
          const c = await caches.open('ders-programi-v1');
          return (await c.match('./index.html')) !== undefined;
        }),
      )
      .toBe(true);

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Program', exact: true })).toBeVisible();
    await context.setOffline(false);
  });

  test('çevrimdışıyken girilen veri duruyor', async ({ page, context }) => {
    // Offline is not a read-only mode: everything the app does is local
    // anyway. This is the principle-6 half of the same question.
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.getByRole('button', { name: 'Kurulum' }).click();
    await page.locator('.step', { hasText: 'Derslikler' }).click();
    await page.getByPlaceholder('Derslik adı, örn. A').fill('Ç1');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.locator('table.list tbody input').first()).toHaveValue('Ç1');

    await context.setOffline(true);
    await page.reload();
    await page.getByRole('button', { name: 'Kurulum' }).click();
    await page.locator('.step', { hasText: 'Derslikler' }).click();
    await expect(page.locator('table.list tbody input').first()).toHaveValue('Ç1');
    await context.setOffline(false);
  });

  test('site derlemesi file:// derlemesine SIZMADI', async ({}) => {
    // The one-file build must not learn about service workers: under file://
    // registering one throws, and more to the point "internet gerekmez" has to
    // stay something anyone can check with grep.
    const single = readFileSync(resolve('dist/index.html'), 'utf8');
    expect(single).not.toContain('serviceWorker');
    expect(single).not.toContain('manifest');
    expect(single).not.toContain('sw.js');
    // ...and it is still ONE file.
    const site = readFileSync(resolve('dist-site/index.html'), 'utf8');
    expect(site).toContain('serviceWorker');
    expect(site).toContain('manifest.webmanifest');
  });
});
