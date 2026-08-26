// 73. The local server (task B1) — over http, on the address it really uses.
//
// What this server buys, stated as the difference it actually makes. The
// first version of this file asserted `isSecureContext` and called that the
// whole reason for the round — which was WRONG, and temel.spec.ts section 75
// now pins the correction: file:// is a secure context in Chromium too.
//
// The real difference is a real ORIGIN, and it has three measured halves:
// a service worker can register, OPFS is not refused, and the origin is this
// app's rather than the one every local .html on the machine shares.
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
  test('GERÇEK BİR KÖKEN — turun gerekçesi, ölçülmüş hâliyle', async ({ page }) => {
    await page.goto(AD);
    await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();

    const facts = await page.evaluate(async () => {
      const out: Record<string, unknown> = {
        origin: location.origin,
        secure: window.isSecureContext,
        folder: 'showDirectoryPicker' in window,
      };
      // The two that file:// refuses. These are the difference; the secure
      // context is NOT (file:// has one too — temel.spec.ts section 75).
      try {
        await navigator.storage.getDirectory();
        out['opfs'] = true;
      } catch (err) {
        out['opfs'] = (err as Error).name;
      }
      try {
        const reg = await navigator.serviceWorker.register('./sw.js');
        out['sw'] = typeof reg.scope === 'string';
      } catch (err) {
        out['sw'] = (err as Error).name;
      }
      return out;
    });

    // A real origin, with a host in it — not the one shared by every local
    // file on the machine.
    expect(facts['origin']).toBe(AD);
    expect(facts['secure']).toBe(true);
    expect(facts['folder']).toBe(true);
    // ...and the two things that only a real origin gets.
    expect(facts['opfs'], 'OPFS reddedildi').toBe(true);
    expect(facts['sw'], 'service worker kaydolmadı').toBe(true);
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
