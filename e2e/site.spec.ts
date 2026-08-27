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

import { expect, test } from './kapan';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cacheAdi } from '../scripts/surum.mjs';

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

  test('cache adı SÜRÜMÜ taşıyor — yoksa güncelleme bir açılış geriden gelir', async ({
    page,
    request,
  }) => {
    // The bug this closes was invisible and lasted two versions. A browser
    // byte-compares sw.js; the name was the literal 'ders-programi-v1', so the
    // file never changed, `install` never ran again, `addAll(SHELL)` never
    // re-fetched the app — and a deploy therefore reached my father on his
    // SECOND opening, with nothing on screen to say a first one had missed.
    //
    // Two halves, and both are needed. The served file has to be stamped (the
    // placeholder must not survive the build), and the cache the browser
    // actually opens has to be the stamped one.
    const beklenen = cacheAdi();
    const sw = await request.get('/sw.js');
    expect(sw.status()).toBe(200);
    const src = await sw.text();
    expect(src, 'damga basılmamış — vite.site.config.ts stampServiceWorker').not.toContain(
      '__SURUM__',
    );
    expect(src).toContain(beklenen);

    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(async () => page.evaluate(() => caches.keys())).toContain(beklenen);
  });

  test('ÇEVRİMDIŞI: fiş çekilince site yine açılıyor', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    // The shell is cached during install, but `addAll` finishing is not the
    // same moment as `ready`; wait for the copy to actually be on disk.
    //
    // The cache NAME is no longer written here. It carries the build now
    // (scripts/surum.mjs), which is the whole point - a name that held still
    // was why a new deploy arrived one load late. A test that hard-codes it
    // would have to be edited on every release, and the release it was
    // forgotten on is the one where it stops measuring anything.
    await expect
      .poll(async () =>
        page.evaluate(async () => {
          for (const name of await caches.keys()) {
            const c = await caches.open(name);
            if ((await c.match('./index.html')) !== undefined) return true;
          }
          return false;
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

  test('YENİ SÜRÜM GELİNCE ŞERİT ÇIKIYOR — ve ilk açılışta çıkmıyor', async ({ page }) => {
    // This is the whole round in one test. The loop it protects is: my father
    // says something is wrong, I fix it and deploy, and he finds out. Before
    // today the last step did not exist — the new build arrived on his SECOND
    // opening, quietly, so "düzelttim, dener misin" had no answer either way.
    //
    // A real deploy is simulated the only honest way: the served sw.js is
    // rewritten on disk, exactly what a release does to it, and the page is
    // left open across it.
    const swPath = resolve('dist-site/sw.js');
    const original = readFileSync(swPath, 'utf8');

    try {
      // First visit: the worker installs and claims, so `controllerchange`
      // DOES fire — and the strip must stay away. Announcing a new version to
      // somebody opening the site for the first time is simply false, and the
      // guard against it is the one line in useUpdate() worth testing.
      await page.goto('/');
      await page.evaluate(() => navigator.serviceWorker.ready);
      await expect(page.locator('.update-bar')).toHaveCount(0);

      // Second visit: now a worker is in charge, which is the state every
      // visit after the first one is in.
      await page.goto('/');
      await expect
        .poll(async () => page.evaluate(() => navigator.serviceWorker.controller !== null))
        .toBe(true);
      await expect(page.locator('.update-bar')).toHaveCount(0);

      // Asking when NOTHING has changed must stay silent. This is the half
      // that can actually go wrong by accident: announce on every update()
      // call rather than on a worker actually taking over, and my father gets
      // a "new version" strip every half hour forever.
      await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update();
      });
      await page.waitForTimeout(1_000);
      await expect(page.locator('.update-bar')).toHaveCount(0);

      // ...and now a release happens while that page is open.
      writeFileSync(swPath, original.replace(cacheAdi(), `${cacheAdi()}-yeni`), 'utf8');
      await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update();
      });

      const bar = page.locator('.update-bar');
      await expect(bar).toBeVisible({ timeout: 10_000 });
      await expect(bar).toContainText('Yeni sürüm hazır');
      // It ANNOUNCES, it does not act: principle 1's promise is that nothing
      // changes out from under him, and a timetable half-dragged is exactly
      // when a silent reload would land.
      await expect(bar.getByRole('button', { name: 'Yenile' })).toBeVisible();

      // "Sonra" means this session, and it has to actually mean it.
      await bar.getByRole('button', { name: 'Sonra' }).click();
      await expect(page.locator('.update-bar')).toHaveCount(0);
    } finally {
      writeFileSync(swPath, original, 'utf8');
    }
  });

  test('site derlemesi file:// derlemesine SIZMADI', async ({}) => {
    // "internet gerekmez" has to stay something anyone can check with grep,
    // and this is where that check lives.
    //
    // THE ASSERTION CHANGED SHAPE ON 2026-08-27, and the reason is worth
    // writing down. It used to be `not.toContain('serviceWorker')` — the word.
    // Then `src/update.ts` arrived: the app asks whether a newer build has
    // taken over, and that question is asked with the same word. It is shared
    // application code on purpose (`isDesktop()`'s doctrine: a feature test,
    // never a build flag), so the word is now in all four routes and the old
    // assertion was measuring the wrong thing.
    //
    // What it measures instead is what actually costs a byte. Measured on this
    // build: `serviceWorker.register` 0 - `fetch(` 0 - `XMLHttpRequest` 0 -
    // `sw.js` 0 - `manifest` 0, and the only serviceWorker call that survives
    // is `getRegistration`, which asks the browser a question and touches no
    // network. That is a STRONGER claim than the word ever was.
    const single = readFileSync(resolve('dist/index.html'), 'utf8');
    expect(single).not.toContain('serviceWorker.register');
    expect(single).not.toContain('manifest');
    expect(single).not.toContain('sw.js');
    expect(single).not.toContain('fetch(');
    expect(single).not.toContain('XMLHttpRequest');
    // The site's own address IS in there - as text, in Ayarlar -> Veri, so the
    // two routes that cannot update themselves can say where the newest one
    // is. A string is not a request; the five lines above are what say so.
    expect(single).toContain('https://alparslansemiz.github.io/ders-programi/');
    // ...and it is still ONE file.
    const site = readFileSync(resolve('dist-site/index.html'), 'utf8');
    expect(site).toContain('serviceWorker');
    expect(site).toContain('manifest.webmanifest');
  });
});
