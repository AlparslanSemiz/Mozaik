// The REAL program: the binary `npm run exe:linux` builds, opened by
// tauri-driver and driven over WebDriver (scripts/webdriver.mjs says why not
// Playwright, and why input is made inside the page). e2e/exe.spec.ts tests
// the same page against a fake `__TAURI__`; this file is what that fake stands
// in for -- the Rust commands, a real disk, a WebKitGTK window.
//
// Every test starts its own program in its own sandbox HOME, so the real
// Documents/Ders Programı on this machine is never written to.
//
// AND ON WINDOWS (TP7, `.github/workflows/exe-windows.yml`): the same tests
// against Mozaik.exe in WebView2, which is my father's program. There the
// folders are the runner's real ones, emptied before each test, and the suite
// refuses to run off a GitHub runner (`windowsYerleri`). Where the two
// platforms answer differently the test says which answer it expects and why.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test as base } from '@playwright/test';
import {
  Oturum,
  WINDOWS,
  evHazirla,
  surucuyuKapat,
  suruculuBaslat,
  varsayilanIkili,
  windowsTemizle,
  windowsYerleri,
} from '../scripts/webdriver.mjs';

const KOK = resolve(import.meta.dirname, '..');

/** WebView2's first start on a fresh runner is slower than WebKitGTK's here. */
const ACILIS_MS = WINDOWS ? 60_000 : 20_000;

// The program sets this itself on Linux (tuzak 130). Taken out of what the
// driver inherits, so a test measures the binary and not the shell it ran in.
delete process.env.WEBKIT_DISABLE_DMABUF_RENDERER;

interface Exe {
  oturum: Oturum;
  /** Documents/Ders Programı: the sandbox's on Linux, the runner's on Windows. */
  klasor: string;
  /** The sandbox HOME itself (on Windows only the driver's working folder). */
  ev: string;
  /** Where a download lands. */
  indirilenler: string;
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
    const yerler = WINDOWS ? windowsYerleri() : undefined;
    if (yerler !== undefined) windowsTemizle(yerler);
    const { pid } = suruculuBaslat({ port, ev, gunluk: testInfo.outputPath('surucu.log') });
    let oturum: Oturum | undefined;
    try {
      oturum = await Oturum.ac({ port, ikili, bekleMs: ACILIS_MS });
      await oturum.bekle('h1', ACILIS_MS);
      await use({
        oturum,
        klasor: yerler?.klasor ?? join(ev, 'Documents', 'Ders Programı'),
        ev,
        indirilenler: yerler?.indirilenler ?? join(ev, 'Downloads'),
      });
    } finally {
      if (oturum !== undefined && testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('ekran', { body: await oturum.goruntu(), contentType: 'image/png' });
      }
      // A page that crashed takes its session with it, and then closing the
      // session throws. The process group is killed whatever it said, or the
      // program lives on, holds the port and the binary (ETXTBSY on the next
      // build), and the next test fails for the wrong reason.
      await oturum?.kapat().catch(() => undefined);
      surucuyuKapat(pid);
    }
  },
});

/** The saved bundle's text, or '' while it has not been written yet. */
function tumu(klasor: string): string {
  const dosya = join(klasor, 'ders-programi-tumu.json');
  return existsSync(dosya) ? readFileSync(dosya, 'utf8') : '';
}

test.describe(`Gerçek exe (${WINDOWS ? 'Windows' : 'Linux'})`, () => {
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
    // Windows serves the page from http://tauri.localhost: that origin is
    // where localStorage, i.e. every plan, lives (`useHttpsScheme: false`).
    expect(sayfa.adres).toMatch(WINDOWS ? /^http:\/\/tauri\.localhost\// : /^tauri:\/\/localhost/);
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
    test.skip(WINDOWS, "Windows'taki kopya güncelleyebilir; onun kapısı bir sonraki test");
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

  test('Windows’taki kopya yalnız kendi Release’inden indiriyor', async ({ exe }) => {
    test.skip(!WINDOWS, 'Linux kopyası hiç indirmiyor, bir önceki test');
    // The Windows exe DOES download, so the real Release address would fetch
    // a real program. A foreign address has to be refused before the network:
    // `safe_url` is the gate that keeps a bug in the page from fetching
    // anything else.
    const cevap = await exe.oturum.js<string>(
      `try {
        await window.__TAURI__.core.invoke('download_update', {
          url: 'https://example.com/releases/latest/download/Mozaik.exe',
          boyut: 1,
        });
        return 'indirdi';
      } catch (e) {
        return String(e);
      }`,
    );
    expect(cevap).toContain('Beklenmeyen adres');
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
    const indirilen = exe.indirilenler;
    await expect
      .poll(() => readdirSync(indirilen).filter((n) => n.endsWith('.json')), { timeout: 10_000 })
      .toHaveLength(1);
    const kokte = readdirSync(KOK).filter(
      (n) => /^ders-programi-.*\.json$/.test(n) && statSync(join(KOK, n)).mtimeMs >= once,
    );
    expect(kokte).toEqual([]);
  });

  test('Hakkında, kopyanın kendini güncelleyip güncellemediğini doğru söylüyor', async ({
    exe,
  }) => {
    // The page asks the program (self_update_supported) rather than guessing
    // from the platform: the fake bridge in e2e/exe.spec.ts runs on Linux too.
    // Linux says no, Windows says yes.
    const [var_, yok] = WINDOWS
      ? ['kendini güncelleyebilir', 'kendini güncellemez']
      : ['kendini güncellemez', 'kendini güncelleyebilir'];
    await exe.oturum.tikla('metin:Ayarlar');
    await exe.oturum.tikla('metin:Hakkında');
    await expect
      .poll(() => exe.oturum.js<string>(`return document.querySelector('main').innerText;`), {
        timeout: 5_000,
      })
      .toContain(var_);
    expect(
      await exe.oturum.js<string>(`return document.querySelector('main').innerText;`),
    ).not.toContain(yok);
  });

  test("kurulamayan haftada yol öneriyor, worker'larda arıyor, önizliyor, Olur'u dinliyor, uyguluyor ve Ctrl+Z geri alıyor", async ({
    exe,
  }) => {
    // TODO B5.10, B5.11: the father's week (anonymised) in the real WebKitGTK.
    // The search runs on the page's own script as workers (relaxPool.ts),
    // which the browser suite measures in Chromium and this measures here.
    test.setTimeout(540_000);
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

    // The preview: the way's week on the grid, its opened hours marked.
    await exe.oturum.tikla('.suggestion-list li[data-family] .btn[aria-pressed]');
    await exe.oturum.bekle('.preview-bar');
    expect(
      await exe.oturum.js<number>(
        `return document.querySelectorAll('.program-body .card.mark-opened').length;`,
      ),
    ).toBeGreaterThan(0);
    await exe.oturum.tikla('metin:Önizlemeyi kapat');

    // "Olur" on the first question: the search runs again from it.
    await exe.oturum.tikla('.suggestion-list li[data-family] .btn[aria-expanded]');
    await exe.oturum.tikla('.question .question-answers .btn');
    const panel = () =>
      exe.oturum.js<string>(
        `return document.querySelector('.panel.suggestions')?.innerText ?? '';`,
      );
    await expect
      .poll(() => exe.oturum.js<number>(`return document.querySelectorAll('.chip-yes').length;`), {
        timeout: 10_000,
      })
      .toBe(1);
    await expect
      .poll(panel, { timeout: 240_000, intervals: [2_000] })
      .toMatch(/Olur dediklerinize ek olarak|Olur dedikleriniz yetiyor/);
    await expect
      .poll(
        () =>
          exe.oturum.js<number>(
            `return document.querySelectorAll('.suggestion-pending, .suggestion-title .hint').length;`,
          ),
        { timeout: 240_000, intervals: [2_000] },
      )
      .toBe(0);

    const ust = () => exe.oturum.js<string>(`return document.querySelector('.topbar').innerText;`);
    expect(await ust()).toContain('havuzda');
    await exe.oturum.tikla('.panel.suggestions .btn.primary');
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

    // The search left its line in Hakkında (relaxLog.ts): with workers.
    await exe.oturum.tikla('metin:Ayarlar');
    await exe.oturum.tikla('metin:Hakkında');
    await expect
      .poll(() => exe.oturum.js<string>(`return document.querySelector('main').innerText;`), {
        timeout: 5_000,
      })
      .toMatch(/\d+ iş parçacığında · ilk öneri \d+ sn · arama \d+ sn/);
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

  // Dragging a card along its row juddered here: 16% of frames dropped in
  // either density, and none without a drag (2026-09-26). Of seven things
  // switched off one at a time only the reason bar's text mattered — a drag
  // writes it up to ten times a second (REASON_GAP), and in WebKitGTK every
  // write dropped a frame, the page being redrawn from the top (pitfall 117).
  // `contain: size layout` on the bar keeps the write inside it. Asked here
  // without a drag, which WebDriver cannot give in this engine (pitfall 127):
  // the bar written every sixth frame for three seconds, as a drag does.
  test("gerekçe çubuğuna yazmak Sığdır'da kare düşürmüyor", async ({ exe }) => {
    // WebKitGTK's pitfall, and a frame count on a runner without a GPU would
    // measure the runner.
    test.skip(WINDOWS, "WebKitGTK'nin kusuru (tuzak 117); GPU'suz runner'da kare ölçümü anlamsız");
    const metin = readFileSync(join(KOK, 'src', 'fixtures', 'tam-dolu-kurs-dizili.json'), 'utf8');
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
    await exe.oturum.tikla('metin:Ayarlar');
    await exe.oturum.tikla('metin:Görünüm');
    await exe.oturum.js(
      `const g = [...document.querySelectorAll('[role=group]')].find((x) => x.getAttribute('aria-label') === 'Izgara yoğunluğu');
      [...g.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Sığdır').click();`,
    );
    await exe.oturum.tikla('metin:Program');
    const olcum = await exe.oturum.js<{ yazma: number; dusen: number; kare: number }>(
      `await new Promise((r) => setTimeout(r, 1000));
      const bar = document.querySelector('.reason-bar span');
      const kareler = [];
      let i = 0, yazma = 0;
      const t0 = performance.now();
      await new Promise((bitti) => {
        const f = (t) => {
          kareler.push(t);
          if (i % 6 === 0) { bar.textContent = 'ölçüm ' + i; yazma++; }
          i++;
          if (t - t0 < 3000) requestAnimationFrame(f); else bitti();
        };
        requestAnimationFrame(f);
      });
      let dusen = 0;
      for (let j = 1; j < kareler.length; j++) if (kareler[j] - kareler[j - 1] > 25) dusen++;
      return { yazma, dusen, kare: kareler.length };`,
    );
    expect(olcum.yazma, 'çubuğa yeterince yazılmadı, iddia bedava geçerdi').toBeGreaterThan(15);
    // Before: every write dropped one (26 of 26). A third is room for a slow
    // machine, and still nowhere near what it was.
    expect(olcum.dusen, `${olcum.yazma} yazmada ${olcum.dusen} kare düştü`).toBeLessThan(
      olcum.yazma / 3,
    );
  });
  test('ikinci açılış yeni pencere açmıyor, açık olan program yerinde kalıyor (VK1)', async ({
    exe,
  }) => {
    // Two copies each held the plan in memory, and the one closed last wrote
    // its old copy over the other's work, in localStorage and in both files
    // under Documents (the test session, exe-vk1b.mjs, 2026-10-09). The second
    // launch now hands the focus to the first and exits.
    const ikinci = spawn(varsayilanIkili(), [], {
      env: { ...process.env, ...evHazirla(exe.ev, { koru: true }), LANG: 'tr_TR.UTF-8' },
      cwd: exe.ev,
      stdio: 'ignore',
    });
    const kod = await new Promise<number | null | 'sürüyor'>((tamam) => {
      const sure = setTimeout(() => tamam('sürüyor'), 15_000);
      ikinci.on('exit', (k) => {
        clearTimeout(sure);
        tamam(k);
      });
    });
    if (kod === 'sürüyor') ikinci.kill('SIGKILL');
    expect(kod, 'ikinci kopya kapanmadı: ikinci bir pencere açık').toBe(0);
    // ...and the first one is still the program, answering.
    expect(await exe.oturum.js('return document.querySelectorAll("h1").length > 0;')).toBe(true);
  });

  test('depo doluyken kurtarma kopyası yazılıyor ve sonraki açılış onu ezmiyor (VK2)', async ({
    exe,
  }) => {
    await expect.poll(() => tumu(exe.klasor), { timeout: 15_000 }).not.toBe('');
    const dolgu = await exe.oturum.js(`
      let n = 0;
      for (const boy of [512 * 1024, 64 * 1024, 4 * 1024, 256]) {
        const parca = 'x'.repeat(boy);
        for (;;) {
          try { localStorage.setItem('zz-dolgu-' + n, parca); n += 1; } catch { break; }
        }
      }
      return n;`);
    expect(dolgu).toBeGreaterThan(0);

    await exe.oturum.tikla('metin:Örnek veriyle doldur');
    await exe.oturum.bekle('[role="dialog"]');
    await exe.oturum.tikla('metin:Yükle');
    await exe.oturum.bekle('.save-warning', 10_000);
    expect(await exe.oturum.metin('.save-warning')).toContain('kaydedilemedi');

    const kurtarma = () =>
      readdirSync(exe.klasor).filter((n) => n.startsWith('ders-programi-kurtarma-'));
    await expect.poll(() => kurtarma().length, { timeout: 15_000 }).toBe(1);
    const ad = kurtarma()[0]!;
    const yol = join(exe.klasor, ad);
    await expect.poll(() => readFileSync(yol, 'utf8'), { timeout: 10_000 }).toContain('Örnek Kurs');

    // The next start, from the storage that never took the sample.
    await exe.oturum.kapat();
    const yeni = await Oturum.ac({ port: 4444, ikili: varsayilanIkili(), bekleMs: ACILIS_MS });
    try {
      await yeni.bekle('h1', ACILIS_MS);
      // The live file is rewritten from the old state: the very case the
      // rescue copy is for. Then the rescue copy is untouched.
      await expect.poll(() => tumu(exe.klasor), { timeout: 15_000 }).not.toContain('Örnek Kurs');
      expect(readFileSync(yol, 'utf8')).toContain('Örnek Kurs');
      expect(kurtarma()).toEqual([ad]);
    } finally {
      await yeni.kapat().catch(() => undefined);
    }
  });
});
