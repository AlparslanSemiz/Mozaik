// 74. "Nereye kaydedilsin" — the folder my father picks (task B4).
//
// In the SITE config because that is where the feature has a real origin —
// OPFS, which this file's fake folder is built on, is refused under file://
// with a SecurityError. NOT because the feature is missing there: Chromium
// exposes showDirectoryPicker under file:// too, which is measured and pinned
// in temel.spec.ts section 75.
//
// HOW THE FOLDER IS FAKED, and why the obvious way was wrong. The first
// version handed back a plain object with getFileHandle/keys/removeEntry on
// it. Two tests failed and the reason was the point: a directory handle is
// kept in IndexedDB, and structured clone CANNOT clone functions — so the
// fake was never stored, and "the folder is remembered after a reload" was
// being tested against something that could not be remembered.
//
// What is used instead is a REAL FileSystemDirectoryHandle, from the origin
// private file system (navigator.storage.getDirectory()). Only the picker is
// faked — the one thing Playwright genuinely cannot drive. Everything else is
// the browser's own: real writes, real keys(), real removeEntry, real
// structured clone into real IndexedDB. The permission gate is patched on the
// PROTOTYPE, which leaves the instance cloneable.
//
// The native dialog itself is still tried by hand; that is written down in
// docs/STATUS.md rather than implied here.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { reopen } from './helpers';

const KLASOR = 'Belgelerim';

/**
 * Points showDirectoryPicker at a real OPFS directory.
 *
 * `permission` is read from localStorage on every call, so a test can change
 * it and reload — which is exactly what a browser restart does to a handle.
 */
async function fakePicker(page: Page, permission: PermissionState = 'granted') {
  await page.addInitScript(
    ([name, perm]) => {
      // Only the FIRST load seeds it. Writing it on every load would undo
      // what a test sets before a reload — which is the whole point of the
      // permission test, and is exactly how that test first failed.
      try {
        if (localStorage.getItem('__izin') === null) localStorage.setItem('__izin', perm as string);
      } catch {
        /* ignore */
      }
      (window as unknown as { __asks: number }).__asks = 0;

      // On the prototype, not the instance: an own property would still be
      // uncloneable and we would be back where we started.
      const proto = (window as unknown as { FileSystemHandle: { prototype: object } })
        .FileSystemHandle.prototype as Record<string, unknown>;
      proto['queryPermission'] = async () =>
        (localStorage.getItem('__izin') ?? 'granted') as PermissionState;
      proto['requestPermission'] = async () => {
        (window as unknown as { __asks: number }).__asks++;
        return (localStorage.getItem('__izin') ?? 'granted') as PermissionState;
      };

      (window as unknown as { showDirectoryPicker: unknown }).showDirectoryPicker = async () => {
        const root = await navigator.storage.getDirectory();
        return root.getDirectoryHandle(name as string, { create: true });
      };
    },
    [KLASOR, permission] as const,
  );
}

/** Everything really on disk in the fake folder, name -> contents. */
function disk(page: Page): Promise<Record<string, string>> {
  return page.evaluate(async (name) => {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(name, { create: true });
    const out: Record<string, string> = {};
    for await (const key of (dir as unknown as { keys(): AsyncIterableIterator<string> }).keys()) {
      out[key] = await (await (await dir.getFileHandle(key)).getFile()).text();
    }
    return out;
  }, KLASOR);
}

async function seed(page: Page, names: string[]) {
  await page.evaluate(
    async ([folder, list]) => {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(folder as string, { create: true });
      for (const name of list as string[]) {
        const out = await (await dir.getFileHandle(name, { create: true })).createWritable();
        await out.write('eski');
        await out.close();
      }
    },
    [KLASOR, names] as const,
  );
}

async function openData(page: Page) {
  await page.getByRole('button', { name: 'Ayarlar' }).click();
  await page.locator('.ribbon .btn', { hasText: 'Planlar ve yedek' }).first().click();
  await expect(page.getByRole('heading', { name: 'Nereye kaydedilsin' })).toBeVisible();
}

const DAILY = /^ders-programi-\d{4}-\d{2}-\d{2}\.json$/;

test.describe('74. Nereye kaydedilsin', () => {
  test('klasör seçilince ANA dosya ve GÜNÜN yedeği yazılıyor', async ({ page }) => {
    await fakePicker(page);
    await page.goto('/');
    await openData(page);

    await expect(page.getByText('yalnızca bu bilgisayarın tarayıcısında')).toBeVisible();
    await page.getByRole('button', { name: 'Klasör seç…' }).click();
    await expect(page.getByText(/Belgelerim klasörüne yazıldı/)).toBeVisible();

    const files = await disk(page);
    const names = Object.keys(files);
    expect(names).toContain('ders-programi-tumu.json');
    expect(names.filter((n) => DAILY.test(n))).toHaveLength(1);

    // What landed is a BUNDLE — every plan — not the open plan on its own.
    // A folder holding one of three plans is the kind of backup that is
    // wrong in the way nobody checks.
    const written = JSON.parse(files['ders-programi-tumu.json']!);
    expect(written.bundleVersion).toBe(1);
    expect(written.plans.length).toBeGreaterThan(0);

    const daily = names.find((n) => DAILY.test(n))!;
    expect(files[daily]).toBe(files['ders-programi-tumu.json']);
  });

  test('sonraki DÜZENLEME kendiliğinden klasöre iniyor', async ({ page }) => {
    await fakePicker(page);
    await page.goto('/');
    await openData(page);
    await page.getByRole('button', { name: 'Klasör seç…' }).click();
    await expect(page.getByText(/klasörüne yazıldı/)).toBeVisible();

    await page.getByRole('button', { name: 'Okul', exact: true }).click();
    await page.locator('.step', { hasText: 'Derslikler' }).click();
    await page.getByPlaceholder('Derslik adı, örn. A').fill('Zk1');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();

    // Two seconds, not the store's four hundred milliseconds: writing every
    // plan through a real file handle on every drag frame is what that delay
    // exists to prevent.
    await expect
      .poll(async () => (await disk(page))['ders-programi-tumu.json'] ?? '', { timeout: 10_000 })
      .toContain('Zk1');
  });

  test('ONBİRİNCİ gün en eskisini siliyor, YABANCI dosyalara dokunmuyor', async ({ page }) => {
    await fakePicker(page);
    await page.goto('/');
    // Ten days of ours plus four of my father's own files — which is what
    // Belgelerim actually looks like, and the reason prunable() matches on a
    // name pattern instead of counting.
    const bizim = Array.from(
      { length: 10 },
      (_, i) => `ders-programi-2020-01-${String(i + 1).padStart(2, '0')}.json`,
    );
    const yabanci = ['vergi-2019.pdf', 'Yeni Microsoft Word Belgesi.docx', 'ders-programi.json', 'notlar.txt'];
    await seed(page, [...bizim, ...yabanci]);

    await openData(page);
    await page.getByRole('button', { name: 'Klasör seç…' }).click();
    await expect(page.getByText(/klasörüne yazıldı/)).toBeVisible();

    const names = Object.keys(await disk(page));
    // Ten old + today = eleven, so exactly one goes, and it is the oldest.
    expect(names).not.toContain('ders-programi-2020-01-01.json');
    expect(names).toContain('ders-programi-2020-01-02.json');
    expect(names.filter((n) => DAILY.test(n))).toHaveLength(10);
    for (const name of yabanci) expect(names, `${name} silindi`).toContain(name);
  });

  test('YENİDEN AÇILINCA klasör hatırlanıyor — soru sorulmadan', async ({ page }) => {
    await fakePicker(page);
    await page.goto('/');
    await openData(page);
    await page.getByRole('button', { name: 'Klasör seç…' }).click();
    await expect(page.getByText(/klasörüne yazıldı/)).toBeVisible();

    await reopen(page);
    await openData(page);
    await expect(page.getByText(/Belgelerim klasörüne yazıldı/)).toBeVisible();

    // The handle came back from IndexedDB and the permission was LOOKED at,
    // not asked for. A prompt nobody asked for spends the one gesture the
    // browser gives us, on a screen opened for something else.
    expect(await page.evaluate(() => (window as unknown as { __asks: number }).__asks)).toBe(0);
  });

  test('izin geri alınmışsa SORUYOR, sessizce yazmayı bırakmıyor', async ({ page }) => {
    await fakePicker(page, 'granted');
    await page.goto('/');
    await openData(page);
    await page.getByRole('button', { name: 'Klasör seç…' }).click();
    await expect(page.getByText(/klasörüne yazıldı/)).toBeVisible();

    // Same handle in IndexedDB, but the browser now says "prompt" — which is
    // exactly what a restart does.
    await page.evaluate(() => localStorage.setItem('__izin', 'prompt'));
    await reopen(page);
    await openData(page);

    await expect(page.getByText(/tarayıcı izni her açılışta yeniden soruyor/)).toBeVisible();
    const ver = page.getByRole('button', { name: 'İzin ver' });
    await expect(ver).toBeVisible();

    await page.evaluate(() => localStorage.setItem('__izin', 'granted'));
    await ver.click();
    await expect(page.getByText(/Belgelerim klasörüne yazıldı/)).toBeVisible();
  });

  test('Vazgeç klasörü unutuyor, ve unutmuş olarak AÇILIYOR', async ({ page }) => {
    await fakePicker(page);
    await page.goto('/');
    await openData(page);
    await page.getByRole('button', { name: 'Klasör seç…' }).click();
    await expect(page.getByText(/klasörüne yazıldı/)).toBeVisible();

    await page.getByRole('button', { name: 'Vazgeç' }).click();
    await expect(page.getByText('yalnızca bu bilgisayarın tarayıcısında')).toBeVisible();

    await reopen(page);
    await openData(page);
    await expect(page.getByText('yalnızca bu bilgisayarın tarayıcısında')).toBeVisible();
  });

  test('yazma BAŞARISIZ olursa kırmızı satır çıkıyor — sessiz kalmıyor', async ({ page }) => {
    await fakePicker(page);
    await page.goto('/');
    await openData(page);
    await page.getByRole('button', { name: 'Klasör seç…' }).click();
    await expect(page.getByText(/klasörüne yazıldı/)).toBeVisible();

    // The folder was deleted, or the disk filled, or the permission was
    // pulled from the address bar. Pitfall 7's rule: a save that stopped
    // working is the one thing that may never be quiet.
    await page.evaluate(() => {
      const proto = (window as unknown as { FileSystemDirectoryHandle: { prototype: object } })
        .FileSystemDirectoryHandle.prototype as Record<string, unknown>;
      proto['getFileHandle'] = async () => {
        const err = new Error('izin yok');
        err.name = 'NotAllowedError';
        throw err;
      };
    });
    await page.getByRole('button', { name: 'Başka klasör seç…' }).click();

    const line = page.locator('.hint.bad[role="status"]');
    await expect(line).toBeVisible();
    await expect(line).toContainText('Klasöre yazma izni geri alınmış');
  });
});

test.describe('74b. Desteklemeyen tarayıcıda — özellik yok ve bunu SÖYLÜYOR', () => {
  test('panel neden olmadığını yazıyor ve tek çareyi gösteriyor', async ({ page }) => {
    // Firefox and Safari, simulated: the API is simply not there. This is NOT
    // "what the double-clicked file sees" — an earlier version of this test
    // said that and it was wrong (temel.spec.ts section 75).
    await page.addInitScript(() => {
      delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker;
    });
    await page.goto('/');
    await openData(page);

    // Scoped to the panel: Ayarlar → Planlar ve yedek has several panels and two of them
    // talk about saving (pitfall 49).
    const panel = page.locator('.panel', { hasText: 'Nereye kaydedilsin' });
    await expect(panel.getByText(/tarayıcınız klasöre yazmayı desteklemiyor/i)).toBeVisible();
    await expect(panel.getByText(/Dosyaya kaydet<\/b> tek çare|tek çare/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Klasör seç/ })).toHaveCount(0);
  });
});
