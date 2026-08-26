// 73. The local server (task B1) — over http, on the address it really uses.
//
// This file exists for ONE assertion, and the rest of it is there to make that
// assertion mean something: `window.isSecureContext` is true at
// http://dersprogrami.localhost. That single boolean is the whole reason this
// round happened. Under file:// it is false, and false means no service
// worker and no File System Access API — so the strongest answer to principle
// 6, the program writing every change into a folder my father picked, cannot
// exist on the double-clicked route at all.
//
// It runs in the SITE config, not the file:// one: a server is not something
// you can test by opening a file.

import { expect, test, type APIRequestContext } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Not 7654: the real port may well be taken by the program itself while these
// run, and a test that fails because the tool is open is a bad test.
const PORT = 7699;
const IP = `http://127.0.0.1:${PORT}`;
const AD = `http://dersprogrami.localhost:${PORT}`;

let server: ChildProcess;

test.beforeAll(async () => {
  server = spawn('node', ['scripts/sunucu.mjs', '--port', String(PORT)], {
    cwd: resolve('.'),
    stdio: 'pipe',
  });
  await new Promise<void>((done, fail) => {
    const timer = setTimeout(() => fail(new Error('sunucu açılmadı')), 10_000);
    server.stdout?.on('data', (chunk: Buffer) => {
      if (chunk.toString().includes('çalışıyor')) {
        clearTimeout(timer);
        done();
      }
    });
  });
});

test.afterAll(() => {
  server?.kill();
});

test.describe('73. Yerel sunucu', () => {
  test('GÜVENLİ BAĞLAM — turun bütün gerekçesi', async ({ page }) => {
    await page.goto(AD);
    await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();

    const facts = await page.evaluate(() => ({
      secure: window.isSecureContext,
      origin: location.origin,
      // The two things file:// cannot have. Neither is used by this test;
      // they are what the secure context is FOR.
      sw: 'serviceWorker' in navigator,
      folder: 'showDirectoryPicker' in window,
    }));

    expect(facts.origin).toBe(AD);
    expect(facts.secure, '*.localhost güvenli bağlam değil').toBe(true);
    expect(facts.sw).toBe(true);
    expect(facts.folder).toBe(true);
  });

  test('doğru türlerle servis ediyor, PNG baytı baytına', async ({ request }) => {
    const html = await request.get(`${IP}/`);
    expect(html.status()).toBe(200);
    expect(html.headers()['content-type']).toContain('text/html');

    const manifest = await request.get(`${IP}/manifest.webmanifest`);
    expect(manifest.headers()['content-type']).toContain('application/manifest+json');

    // A PNG served as text is a PNG that does not draw. Compared byte for
    // byte rather than by length: a transcoding bug keeps the length.
    const png = await request.get(`${IP}/icon-192.png`);
    expect(png.headers()['content-type']).toBe('image/png');
    expect(Buffer.compare(await png.body(), readFileSync('dist-site/icon-192.png'))).toBe(0);
  });

  test('kökün DIŞINA çıkılamıyor', async ({ request }) => {
    // package.json sits one level above the folder being served, and it is
    // the file an attempt like this would land on first.
    for (const yol of ['/../package.json', '/%2e%2e/package.json', '/..%2fpackage.json']) {
      const res = await request.get(IP + yol);
      const text = await res.text();
      expect(text, `${yol} kökün dışını verdi`).not.toContain('"devDependencies"');
    }
  });

  test('bilinmeyen yol uygulamaya düşüyor, ölü bir sayfaya değil', async ({ page }) => {
    await page.goto(`${AD}/bilinmeyen/yol`);
    await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();
  });

  async function head(request: APIRequestContext, url: string) {
    return request.fetch(url, { method: 'HEAD' });
  }

  test('HEAD gövdesiz ama uzunluğu doğru söylüyor', async ({ request }) => {
    const res = await head(request, `${IP}/`);
    expect(res.status()).toBe(200);
    expect((await res.body()).length).toBe(0);
    expect(Number(res.headers()['content-length'])).toBe(
      readFileSync('dist-site/index.html').length,
    );
  });
});
