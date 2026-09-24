// The REAL program, on Linux: the binary `npm run exe:linux` builds, opened by
// tauri-driver and driven over WebDriver (scripts/webdriver.mjs says why not
// Playwright, and why input is made inside the page). e2e/exe.spec.ts tests
// the same page against a fake `__TAURI__`; this file is what that fake stands
// in for -- the Rust commands, a real disk, a WebKitGTK window.
//
// Every test starts its own program in its own sandbox HOME, so the real
// Documents/Ders Programı on this machine is never written to.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test as base } from '@playwright/test';
import { Oturum, suruculuBaslat, varsayilanIkili } from '../scripts/webdriver.mjs';

const KOK = resolve(import.meta.dirname, '..');

interface Exe {
  oturum: Oturum;
  /** The sandbox's Documents/Ders Programı. */
  klasor: string;
}

const test = base.extend<{ exe: Exe }>({
  exe: async ({}, use, testInfo) => {
    const ikili = varsayilanIkili();
    if (!existsSync(ikili)) throw new Error(`İkili yok: ${ikili} — önce npm run exe:linux`);
    const ev = join(
      KOK,
      'test-results',
      'gercek-exe',
      `ev-${testInfo.workerIndex}-${testInfo.testId}`,
    );
    const port = 4444;
    const { pid } = suruculuBaslat({ port, ev, gunluk: testInfo.outputPath('surucu.log') });
    let oturum: Oturum | undefined;
    try {
      oturum = await Oturum.ac({ port, ikili });
      await oturum.bekle('h1', 20_000);
      await use({ oturum, klasor: join(ev, 'Documents', 'Ders Programı') });
    } finally {
      if (oturum !== undefined && testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('ekran', { body: await oturum.goruntu(), contentType: 'image/png' });
      }
      await oturum?.kapat();
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        // Already gone.
      }
    }
  },
});

/** The saved bundle's text, or '' while it has not been written yet. */
function tumu(klasor: string): string {
  const dosya = join(klasor, 'ders-programi-tumu.json');
  return existsSync(dosya) ? readFileSync(dosya, 'utf8') : '';
}

test.describe('Gerçek exe (Linux)', () => {
  test('açılıyor: pencere, yedi sekme ve Rust köprüsü', async ({ exe }) => {
    const sayfa = await exe.oturum.js<{
      baslik: string;
      adres: string;
      kopru: boolean;
      sekmeler: string[];
    }>(
      `return {
        baslik: document.title,
        adres: location.href,
        kopru: typeof window.__TAURI__?.core?.invoke === 'function',
        sekmeler: [...document.querySelectorAll('header button')].map((b) => b.innerText.trim()),
      };`,
    );
    expect(sayfa.baslik).toBe('Mozaik');
    expect(sayfa.adres).toMatch(/^tauri:\/\/localhost/);
    expect(sayfa.kopru).toBe(true);
    for (const ad of ['Okul', 'Müsaitlik', 'Dersler', 'Program', 'Kontrol', 'Çıktı', 'Ayarlar']) {
      expect(sayfa.sekmeler).toContain(ad);
    }
  });

  test('Rust verinin yerini sahte evin Belgeler klasörü diye söylüyor', async ({ exe }) => {
    const yer = await exe.oturum.js<string>(
      `return await window.__TAURI__.core.invoke('data_dir_path');`,
    );
    expect(yer).toBe(exe.klasor);
  });

  test('hiç sorulmadan diske yazıyor, ve değişiklik de diske düşüyor', async ({ exe }) => {
    // The same promise e2e/exe.spec.ts checks against a Map, here against a
    // real folder the Rust side created.
    await expect.poll(() => tumu(exe.klasor), { timeout: 15_000 }).not.toBe('');
    expect(
      readdirSync(exe.klasor).filter((n) => /^ders-programi-\d{4}-\d{2}-\d{2}\.json$/.test(n)),
    ).toHaveLength(1);

    await exe.oturum.tikla('metin:Örnek veriyle doldur');
    await exe.oturum.bekle('[role="dialog"]');
    await exe.oturum.tikla('metin:Yükle');

    await expect.poll(() => tumu(exe.klasor), { timeout: 15_000 }).toContain('Örnek Kurs');
  });

  test('örnek okulu otomatik diziyor', async ({ exe }) => {
    await exe.oturum.tikla('metin:Örnek veriyle doldur');
    await exe.oturum.bekle('[role="dialog"]');
    await exe.oturum.tikla('metin:Yükle');
    await exe.oturum.tikla('metin:Program');
    await exe.oturum.tikla('metin:Otomatik diz');

    await expect
      .poll(
        () =>
          exe.oturum.js<string>(`return document.querySelector('.reason-bar')?.innerText ?? '';`),
        {
          timeout: 20_000,
        },
      )
      .toContain('Program dizildi');
  });

  test('Linux’taki kopya kendini güncellemiyor', async ({ exe }) => {
    // The download the manifest names is the WINDOWS exe; a Linux build that
    // swapped it over itself would not start again. The refusal must come
    // before any network, so the answer is immediate even offline.
    const cevap = await exe.oturum.js<string>(
      `try {
        await window.__TAURI__.core.invoke('download_update', {
          url: 'https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/Mozaik.exe',
          boyut: 1,
        });
        return 'indirdi';
      } catch (e) {
        return String(e);
      }`,
    );
    expect(cevap).toContain('yalnız Windows');
  });
});
