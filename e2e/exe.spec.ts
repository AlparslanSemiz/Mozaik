// 76. Exe yolu — Belgelerim'e kendiliğinden yazmak (görev 4h).
//
// The exe serves the SAME dist/index.html the other three routes serve, and
// the only thing it adds is that "nereye kaydedilsin" already has an answer.
// So what is worth measuring is not Tauri — it is the SEAM: does the folder
// feature run with no picker, no permission and no click, and do the file
// names still come from folder.ts rather than from a second copy of the rules
// living in Rust.
//
// The Tauri bridge is faked in the page, which is honest here in a way it was
// not in klasor.spec.ts: there the thing being faked was a browser API with
// real behaviour behind it (pitfall 67 — take a real OPFS handle and fake
// only the picker). Here `window.__TAURI__.core.invoke` is a POSTBOX. It has
// no behaviour of its own to get wrong; what is on the far side is
// src-tauri/src/lib.rs, which `cargo test` judges and no browser can.
//
// So this file measures everything between the click that does not happen and
// the message that is put in the postbox, and stops there.

import { expect, test, type Page } from '@playwright/test';
import { open, answerDialog } from './helpers';

/** Puts an in-page stand-in for src-tauri/src/lib.rs on the window. */
async function fakeExe(page: Page) {
  await page.addInitScript(() => {
    const files = new Map<string, string>();
    const calls: string[] = [];
    (window as unknown as { __disk: unknown }).__disk = { files, calls };

    (window as unknown as { __TAURI__: unknown }).__TAURI__ = {
      core: {
        invoke: async (cmd: string, args?: Record<string, unknown>) => {
          calls.push(cmd);
          if (cmd === 'data_dir_path') return 'C:\\Users\\baba\\Belgeler\\Ders Programı';
          if (cmd === 'write_file') {
            files.set(args!.name as string, args!.text as string);
            return undefined;
          }
          if (cmd === 'list_files') return [...files.keys()];
          if (cmd === 'remove_file') {
            files.delete(args!.name as string);
            return undefined;
          }
          throw new Error(`bilinmeyen komut: ${cmd}`);
        },
      },
    };
  });
}

function disk(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const { files } = (window as unknown as { __disk: { files: Map<string, string> } }).__disk;
    return Object.fromEntries(files);
  });
}

async function openData(page: Page) {
  await page.getByRole('button', { name: 'Ayarlar' }).click();
  await page.locator('.ribbon .btn', { hasText: 'Veri' }).first().click();
  await expect(page.getByRole('heading', { name: 'Nereye kaydedilsin' })).toBeVisible();
}

const DAILY = /^ders-programi-\d{4}-\d{2}-\d{2}\.json$/;

test.describe('76. Exe yolu — hiç sorulmadan Belgelerim’e', () => {
  test('tek bir tıklama olmadan ANA dosya ve GÜNÜN yedeği yazılıyor', async ({ page }) => {
    await fakeExe(page);
    await open(page);

    // Nothing is clicked. In the browser this same feature needs a button, a
    // native dialog and a permission before a single byte moves.
    // NOT toHaveProperty: it reads a dot as a nested path, and every name
    // here ends in ".json".
    await expect
      .poll(async () => Object.keys(await disk(page)), { timeout: 10_000 })
      .toContain('ders-programi-tumu.json');

    const written = await disk(page);
    const names = Object.keys(written);
    expect(names.filter((n) => DAILY.test(n)), `yazılanlar: ${names.join(', ')}`).toHaveLength(1);

    // The bytes are the bundle, not the open plan — a folder holding one of
    // three plans is the kind of backup that is wrong where nobody looks.
    const bundle = JSON.parse(written['ders-programi-tumu.json']);
    expect(bundle.bundleVersion).toBe(1);
  });

  test('değişiklik kendiliğinden diske düşüyor', async ({ page }) => {
    await fakeExe(page);
    await open(page);
    await expect
      .poll(async () => Object.keys(await disk(page)), { timeout: 10_000 })
      .toContain('ders-programi-tumu.json');

    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await answerDialog(page);

    await expect
      .poll(async () => (await disk(page))['ders-programi-tumu.json'] ?? '', { timeout: 10_000 })
      .toContain('Örnek Kurs');
  });

  test('exe’de SEÇİLECEK bir klasör yok — üç düğme de çizilmiyor', async ({ page }) => {
    await fakeExe(page);
    await open(page);
    await openData(page);

    const panel = page.locator('.panel', { has: page.getByRole('heading', { name: 'Nereye kaydedilsin' }) });
    await expect(panel.getByRole('button', { name: /Klasör seç/ })).toHaveCount(0);
    await expect(panel.getByRole('button', { name: 'İzin ver' })).toHaveCount(0);
    await expect(panel.getByRole('button', { name: 'Vazgeç' })).toHaveCount(0);
    await expect(panel.getByText(/Belgelerim/)).toBeVisible();

    // And it says where, with the path the exe itself reported — a person
    // told where their data is should be told the actual place.
    await expect(panel.getByText(/Belgeler\\Ders Programı/)).toBeVisible();
  });

  test('“Veriler nerede” exe’de BAŞKA bir şey söylüyor', async ({ page }) => {
    // Not wording: truth. On the browser routes the storage below really is
    // the only copy until someone saves a file, and clearing browsing data
    // really can take it. In the exe a copy is already on disk, so the
    // sentence a person acts on has to change with the route.
    await fakeExe(page);
    await open(page);
    await openData(page);

    const panel = page.locator('.panel', { has: page.getByRole('heading', { name: 'Veriler nerede' }) });
    await expect(panel.getByText(/tek kopya/)).toBeVisible();
    await expect(panel.getByText(/tarama verilerini temizle/)).toHaveCount(0);
  });

  test('AYNI dosya tarayıcıda bunların hiçbirini yapmıyor', async ({ page }) => {
    // The guard on the whole round: the exe path is chosen by feature
    // detection, not by a build flag, so the very same dist/index.html must
    // keep behaving like a browser page when the bridge is absent. Without
    // this, a stray `__TAURI__` shim would be invisible.
    await open(page);
    await openData(page);

    const panel = page.locator('.panel', { has: page.getByRole('heading', { name: 'Nereye kaydedilsin' }) });
    await expect(panel.getByRole('button', { name: /Klasör seç/ })).toHaveCount(1);

    const where = page.locator('.panel', { has: page.getByRole('heading', { name: 'Veriler nerede' }) });
    await expect(where.getByText(/tarama verilerini temizle/)).toBeVisible();
  });
});
