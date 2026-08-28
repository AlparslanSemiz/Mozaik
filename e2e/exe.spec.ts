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

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { open, answerDialog } from './helpers';

/**
 * What the far side answers when the update is asked about.
 *
 * A parameter rather than three fakes: the three answers are the three
 * sentences the panel has to be able to write, and the shape of the reply is
 * the contract with src-tauri/src/update.rs.
 */
type Senaryo =
  | { cevap: 'guncel' }
  | { cevap: 'var'; version: string; date: string; boyut: number }
  | { cevap: 'hata'; mesaj: string };

/** Puts an in-page stand-in for src-tauri/src/lib.rs on the window. */
async function fakeExe(page: Page, senaryo: Senaryo = { cevap: 'guncel' }) {
  await page.addInitScript((s: Senaryo) => {
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
          if (cmd === 'check_update') {
            // No internet is an ERROR here, not an empty answer, and that is
            // the case worth being able to reproduce: the sentence on screen
            // is the whole offline story.
            if (s.cevap === 'hata') throw new Error(s.mesaj);
            if (s.cevap === 'guncel') {
              return {
                yeni_var: false,
                version: '1.0.0',
                date: '2026-01-01',
                exe: 'https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi.exe',
                boyut: 3_742_584,
              };
            }
            return {
              yeni_var: true,
              version: s.version,
              date: s.date,
              exe: 'https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi.exe',
              boyut: s.boyut,
            };
          }
          if (cmd === 'download_update') return 3_742_584;
          if (cmd === 'apply_update') return undefined;
          throw new Error(`bilinmeyen komut: ${cmd}`);
        },
      },
    };
  }, senaryo);
}

/** Which commands the page has sent, in order. */
function calls(page: Page): Promise<string[]> {
  return page.evaluate(
    () => (window as unknown as { __disk: { calls: string[] } }).__disk.calls,
  );
}

function disk(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const { files } = (window as unknown as { __disk: { files: Map<string, string> } }).__disk;
    return Object.fromEntries(files);
  });
}

// Two sections since the Ayarlar round: the folder lives with the plans and
// the backups, the version lives with what this copy IS.
async function openFolder(page: Page) {
  await page.getByRole('button', { name: 'Ayarlar' }).click();
  await page.locator('.ribbon .btn', { hasText: 'Planlar ve yedek' }).first().click();
  await expect(page.getByRole('heading', { name: 'Nereye kaydedilsin' })).toBeVisible();
}

async function openAbout(page: Page) {
  await page.getByRole('button', { name: 'Ayarlar' }).click();
  await page.locator('.ribbon .btn', { hasText: 'Hakkında' }).first().click();
  await expect(page.getByRole('heading', { name: 'Sürüm ve güncelleme' })).toBeVisible();
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
    // `?? '{}'` is unreachable — the poll above proved the key is there. It is
    // written that way so a broken run fails on the assertion below rather
    // than inside JSON.parse, where the message names no expectation.
    const bundle = JSON.parse(written['ders-programi-tumu.json'] ?? '{}');
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
    await openFolder(page);

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
    await openAbout(page);

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
    await openFolder(page);

    const panel = page.locator('.panel', { has: page.getByRole('heading', { name: 'Nereye kaydedilsin' }) });
    await expect(panel.getByRole('button', { name: /Klasör seç/ })).toHaveCount(1);

    await openAbout(page);
    const where = page.locator('.panel', { has: page.getByRole('heading', { name: 'Veriler nerede' }) });
    await expect(where.getByText(/tarama verilerini temizle/)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------

test.describe('78. Exe yolu — kendini güncellemek', () => {
  const surumPaneli = (page: Page) =>
    page.locator('.panel', { has: page.getByRole('heading', { name: 'Sürüm ve güncelleme' }) });

  test('HİÇBİR ŞEY sorulmadan ağa çıkılmıyor', async ({ page }) => {
    // The contract of the whole feature, and the reason it can be shipped to
    // a machine with no internet: the network is entered from a button and
    // from nowhere else. Not at startup, not on a timer, not when the panel
    // is merely drawn.
    await fakeExe(page, { cevap: 'var', version: '9.9.9', date: '2026-09-02', boyut: 4_000_000 });
    await open(page);
    await openAbout(page);
    await expect(surumPaneli(page).getByRole('button', { name: 'Güncellemeleri denetle' }))
      .toBeVisible();

    // The panel has been on screen; the disk has been written to several
    // times by now. `check_update` is still not among the calls.
    expect(await calls(page)).not.toContain('check_update');
  });

  test('güncelse "en son sürümü kullanıyorsunuz" diyor', async ({ page }) => {
    await fakeExe(page, { cevap: 'guncel' });
    await open(page);
    await openAbout(page);

    await surumPaneli(page).getByRole('button', { name: 'Güncellemeleri denetle' }).click();
    await expect(surumPaneli(page).getByText(/En son sürümü kullanıyorsunuz/)).toBeVisible();
    await expect(surumPaneli(page).getByRole('button', { name: /indir/i })).toHaveCount(0);
  });

  test('yeni sürüm varsa ÜÇ ADIM, ve hiçbiri ötekini kendiliğinden yapmıyor', async ({ page }) => {
    // Look, download, restart. Three buttons because principle 1's promise is
    // that nothing changes without being asked for, and a single button that
    // fetched four megabytes and closed the window would be a wizard with one
    // step.
    await fakeExe(page, { cevap: 'var', version: '1.9.0', date: '2026-09-02', boyut: 4_194_304 });
    await open(page);
    await openAbout(page);
    const panel = surumPaneli(page);

    await panel.getByRole('button', { name: 'Güncellemeleri denetle' }).click();
    await expect(panel.getByText(/v1\.9\.0 çıktı/)).toBeVisible();
    await expect(panel.getByText(/2 Eylül 2026/)).toBeVisible();
    // Looking does not download.
    expect(await calls(page)).not.toContain('download_update');

    await panel.getByRole('button', { name: 'Yeni sürümü indir' }).click();
    await expect(panel.getByText(/v1\.9\.0 indi/)).toBeVisible();
    // ...and downloading does not restart. This is the one that would cost my
    // father a half-dragged timetable if it were wrong.
    expect(await calls(page)).toContain('download_update');
    expect(await calls(page)).not.toContain('apply_update');

    await panel.getByRole('button', { name: 'Şimdi yeniden başlat' }).click();
    await expect.poll(async () => await calls(page)).toContain('apply_update');
  });

  test('İNTERNET YOKSA tek sonuç bir cümle, program çalışmaya devam ediyor', async ({ page }) => {
    await fakeExe(page, {
      cevap: 'hata',
      mesaj: 'İnternete bağlanılamadı. Program çalışmaya devam ediyor, sonra tekrar deneyebilirsiniz.',
    });
    await open(page);
    await openAbout(page);
    const panel = surumPaneli(page);

    await panel.getByRole('button', { name: 'Güncellemeleri denetle' }).click();
    await expect(panel.getByText(/İnternete bağlanılamadı/)).toBeVisible();

    // The point is the second half of that sentence: the tool is still a
    // tool. Nothing is blocked, nothing is modal, and the program still does
    // the thing it is for. Loading the sample and reaching the grid is a
    // heavier check than "the tab switched" on purpose: what has to survive a
    // failed update check is the WORK, not the chrome.
    await page.getByRole('button', { name: 'Örnek okulu yükle' }).click();
    await answerDialog(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    // ...and the folder is still being written to, which is the other half of
    // "çalışmaya devam ediyor".
    await expect
      .poll(async () => (await disk(page))['ders-programi-tumu.json'] ?? '', { timeout: 10_000 })
      .toContain('Örnek Kurs');
  });

  test('TARAYICIDA o düğme hiç yok', async ({ page }) => {
    // Same dist/index.html, no bridge: the route is chosen by feature
    // detection, so the browser copy has to keep saying it cannot update
    // itself and pointing at the address instead.
    await open(page);
    await openAbout(page);
    const panel = surumPaneli(page);

    await expect(panel.getByRole('button', { name: 'Güncellemeleri denetle' })).toHaveCount(0);
    await expect(panel.getByText(/kendini güncellemez/)).toBeVisible();
  });
});
