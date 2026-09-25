// The REAL program, on Linux: the binary `npm run exe:linux` builds, opened by
// tauri-driver and driven over WebDriver (scripts/webdriver.mjs says why not
// Playwright, and why input is made inside the page). e2e/exe.spec.ts tests
// the same page against a fake `__TAURI__`; this file is what that fake stands
// in for -- the Rust commands, a real disk, a WebKitGTK window.
//
// Every test starts its own program in its own sandbox HOME, so the real
// Documents/Ders Programı on this machine is never written to.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test as base } from '@playwright/test';
import { Oturum, suruculuBaslat, varsayilanIkili } from '../scripts/webdriver.mjs';

const KOK = resolve(import.meta.dirname, '..');

// The program sets this itself on Linux (tuzak 130). Taken out of what the
// driver inherits, so a test measures the binary and not the shell it ran in.
delete process.env.WEBKIT_DISABLE_DMABUF_RENDERER;

interface Exe {
  oturum: Oturum;
  /** The sandbox's Documents/Ders Programı. */
  klasor: string;
  /** The sandbox HOME itself. */
  ev: string;
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
      await use({ oturum, klasor: join(ev, 'Documents', 'Ders Programı'), ev });
    } finally {
      if (oturum !== undefined && testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('ekran', { body: await oturum.goruntu(), contentType: 'image/png' });
      }
      // A page that crashed takes its session with it, and then closing the
      // session throws. The process group is killed whatever it said, or the
      // program lives on, holds the port and the binary (ETXTBSY on the next
      // build), and the next test fails for the wrong reason.
      await oturum?.kapat().catch(() => undefined);
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
    // Polled, not read once: the day's copy is a second write that lands a few
    // milliseconds after the bundle, and a single read after the first raced it
    // (it failed one run in three once the suite grew, 2026-09-24).
    await expect
      .poll(
        () =>
          readdirSync(exe.klasor).filter((n) => /^ders-programi-\d{4}-\d{2}-\d{2}\.json$/.test(n)),
        { timeout: 5_000 },
      )
      .toHaveLength(1);

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

  test('bir dersi sabitlemek sayfayı çökertmiyor', async ({ exe }) => {
    // It did, every time, on this machine's Intel GPU: WebKitGTK's DMA-BUF
    // renderer aborted inside Mesa (iris) while drawing the pinned card, and
    // WebDriver answered "session deleted because of page crash" (tuzak 130).
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

    await exe.oturum.js(
      `const card = document.querySelector('table.grid td .card');
      const r = card.getBoundingClientRect();
      card.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: r.x + 5, clientY: r.y + 5, button: 2 }));`,
    );
    await exe.oturum.tikla('metin:Dersi buraya sabitle');

    await expect
      .poll(
        () =>
          exe.oturum.js<number>(
            `return document.querySelectorAll('table.grid .card.pinned').length;`,
          ),
        { timeout: 5_000 },
      )
      .toBe(1);
    // Still answering a second later: the crash came a frame or two after the click.
    await new Promise((r) => setTimeout(r, 1_000));
    expect(await exe.oturum.js<string>(`return document.title;`)).toBe('Mozaik');
  });

  test('"Dosyaya kaydet" İndirilenler’e yazıyor, programın durduğu yere değil', async ({ exe }) => {
    // WebKitGTK puts a download in the folder user-dirs.dirs names; with none
    // named it wrote into the working directory, the repository (tuzak 132).
    const once = Date.now();
    await exe.oturum.tikla('metin:Dosyaya kaydet');
    const indirilen = join(exe.ev, 'Downloads');
    await expect
      .poll(() => readdirSync(indirilen).filter((n) => n.endsWith('.json')), { timeout: 10_000 })
      .toHaveLength(1);
    const kokte = readdirSync(KOK).filter(
      (n) => /^ders-programi-.*\.json$/.test(n) && statSync(join(KOK, n)).mtimeMs >= once,
    );
    expect(kokte).toEqual([]);
  });

  test('Hakkında, Linux kopyasının kendini güncellemediğini söylüyor', async ({ exe }) => {
    // The page asks the program (self_update_supported) rather than guessing
    // from the platform: the fake bridge in e2e/exe.spec.ts runs on Linux too.
    await exe.oturum.tikla('metin:Ayarlar');
    await exe.oturum.tikla('metin:Hakkında');
    await expect
      .poll(() => exe.oturum.js<string>(`return document.querySelector('main').innerText;`), {
        timeout: 5_000,
      })
      .toContain('kendini güncellemez');
    expect(
      await exe.oturum.js<string>(`return document.querySelector('main').innerText;`),
    ).not.toContain('kendini güncelleyebilir');
  });

  test("kurulamayan haftada yol öneriyor, worker'larda arıyor, uyguluyor ve Ctrl+Z geri alıyor", async ({
    exe,
  }) => {
    // TODO B5.10: the father's week (anonymised) in the real WebKitGTK. The
    // search runs on the page's own script as workers (relaxPool.ts), which
    // the browser suite measures in Chromium and this measures here.
    test.setTimeout(300_000);
    const metin = readFileSync(join(KOK, 'src', 'fixtures', 'tam-dolu-kurs.json'), 'utf8');
    await exe.oturum.js(
      `const f = new File([${JSON.stringify(metin)}], 'yedek.json', { type: 'application/json' });
      const dt = new DataTransfer();
      dt.items.add(f);
      const girdi = document.querySelector('input[type=file]');
      girdi.files = dt.files;
      girdi.dispatchEvent(new Event('change', { bubbles: true }));`,
    );
    await exe.oturum.bekle('.dlg');
    await exe.oturum.tikla('.dlg-actions .btn:last-child');
    await exe.oturum.tikla('metin:Program');
    await exe.oturum.tikla('metin:Otomatik diz');

    const satirlar = () =>
      exe.oturum.js<string[]>(
        `return [...document.querySelectorAll('.suggestion-list li[data-family] .suggestion-title')].map((x) => x.innerText);`,
      );
    await expect
      .poll(async () => (await satirlar()).join('\n'), { timeout: 240_000, intervals: [2_000] })
      .toContain('de gelebilirse hafta kuruluyor');
    expect(
      Number(
        await exe.oturum.js<string>(`return document.documentElement.dataset.oneriIsci ?? '';`),
      ),
    ).toBeGreaterThan(0);

    const ust = () => exe.oturum.js<string>(`return document.querySelector('.topbar').innerText;`);
    expect(await ust()).toContain('havuzda');
    await exe.oturum.tikla('.suggestion-list li[data-family] .btn.primary');
    await expect
      .poll(
        () =>
          exe.oturum.js<string>(`return document.querySelector('.reason-bar')?.innerText ?? '';`),
        { timeout: 10_000 },
      )
      .toContain('Öneri uygulandı');
    await expect.poll(ust, { timeout: 10_000 }).not.toContain('havuzda');

    await exe.oturum.tus('Control+z');
    await expect.poll(ust, { timeout: 10_000 }).toContain('havuzda');
  });

  test('"Dosyadan aç" bir yedeği okuyor', async ({ exe }) => {
    // The GTK file chooser does not open inside a WebDriver session (the
    // automation takes it; tuzak 133), so the file is handed to the input the
    // way the chooser would: what is measured is WebKitGTK reading it and the
    // program loading it.
    const yedek = JSON.parse(
      readFileSync(join(KOK, 'src', 'fixtures', 'tam-dolu-kurs.json'), 'utf8'),
    ) as unknown;
    const metin = JSON.stringify(yedek);
    await exe.oturum.js(
      `const f = new File([${JSON.stringify(metin)}], 'yedek.json', { type: 'application/json' });
      const dt = new DataTransfer();
      dt.items.add(f);
      const girdi = document.querySelector('input[type=file]');
      girdi.files = dt.files;
      girdi.dispatchEvent(new Event('change', { bubbles: true }));`,
    );
    await exe.oturum.bekle('.dlg');
    await exe.oturum.tikla('.dlg-actions .btn:last-child');
    await expect
      .poll(() => exe.oturum.js<string>(`return document.querySelector('.topbar').innerText;`), {
        timeout: 5_000,
      })
      .toContain('havuzda');
    await expect.poll(() => tumu(exe.klasor), { timeout: 15_000 }).toContain('Öğretmen 18');
  });
});
