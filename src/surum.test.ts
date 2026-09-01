// The version number has to be ONE number, and this is the only thing that
// can say so.
//
// It used to live in three files by hand: package.json, src-tauri/Cargo.toml
// and src-tauri/tauri.conf.json. Nothing compared them, and `npm run yayinla`
// only ever wrote the first, so after every release the other two were a
// version behind and nothing anywhere went red.
//
// That was cosmetic until the exe learned to check for updates. The number it
// sends to the release manifest is the number it was BUILT with; a stale one
// means the program either never offers an update that exists, or offers one
// forever after installing it. Both look like the update feature is broken,
// and neither points at a version string in a build file.
//
// Read through Vite rather than `node:fs`: `src/` compiles without Node's
// types on purpose (see raw.d.ts), and the files themselves are what will be
// on the machine that builds either way.

import { describe, expect, it } from 'vitest';

import pkg from '../package.json';
import tauriConf from '../src-tauri/tauri.conf.json';
import cargoToml from '../src-tauri/Cargo.toml?raw';
import updateRs from '../src-tauri/src/update.rs?raw';
import surumYml from '../.github/workflows/surum.yml?raw';

const SEMVER = /^\d+\.\d+\.\d+$/;

describe('sürüm numarasının tek kaynağı', () => {
  it('package.json semver taşıyor', () => {
    expect(pkg.version).toMatch(SEMVER);
  });

  it('src-tauri/Cargo.toml aynı numarayı söylüyor', () => {
    // Line-anchored: Cargo.toml also carries `rust-version`, and every
    // dependency below carries its own `version`.
    const m = /^version = "(\d+\.\d+\.\d+)"$/m.exec(cargoToml);
    expect(m, 'Cargo.toml içinde version satırı yok').not.toBeNull();
    expect(m![1]).toBe(pkg.version);
  });

  it('tauri.conf.json numarayı KOPYALAMIYOR, package.json’u gösteriyor', () => {
    // Tauri resolves a path here itself. A literal number would be a third
    // copy, and the third copy is the one nobody remembers to bump.
    expect(tauriConf.version).toBe('../package.json');
  });
});

describe('kimlik — verinin ADRESİ', () => {
  it('identifier DEĞİŞMİYOR: com.dersprogrami.arac', () => {
    // THIS STRING IS WHERE MY FATHER'S TIMETABLES LIVE, and it is the one part
    // of the rename to Mozaik that could not follow the name (pitfall 95).
    //
    // Measured on a Windows machine that had actually run the exe:
    //
    //   %LOCALAPPDATA%\com.dersprogrami.arac\EBWebView\Default\
    //     Local Storage\leveldb\000003.log   ->  ders-programi,
    //     ders-programi-planlar, ders-programi-yedek-0, ... at the
    //     http://tauri.localhost origin
    //
    // Tauri hands WebView2 `%LOCALAPPDATA%\<identifier>` as its profile, so
    // the identifier is not a label — it is the path localStorage sits under.
    // v2.0.0 changed it to `me.mozaik.arac` alongside `productName`, and an
    // exe built that way opens a BRAND NEW empty profile: every plan still on
    // the disk, none of them visible, and no error anywhere to say why.
    //
    // The rest of the rename was decided the other way round and stays that
    // way — the keys, the backup file names and `Belgelerim\Ders Programı`
    // kept their old names because they are data. This is the same rule; it
    // was simply missed, because a reverse-DNS id looks like a name and is an
    // address. (The repository itself was on that list until it was renamed
    // anyway, and the bill arrived: see the describe below.)
    expect(tauriConf.identifier).toBe('com.dersprogrami.arac');
  });

  it('ekrandaki ad Mozaik — kimlik onunla birlikte kıpırdamıyor', () => {
    // The guard that keeps the test above from being read as "the rename was
    // reverted". It was not: the name is Mozaik everywhere a person sees one.
    expect(tauriConf.productName).toBe('Mozaik');
    expect(tauriConf.app.windows.map((w) => w.title)).toContain('Mozaik');
  });

  it('pencere BÜYÜTÜLMÜŞ açılıyor, ve en az yüksekliği %150 ekrana sığıyor', () => {
    // WHY THIS TEST EXISTS. The window asked for 1600x1000 and never
    // maximised, so the exe ran the page in 1600 CSS px while every layout
    // number in this repo — playwright.config.ts, `npm run ekran`, the whole
    // Sığdır ladder — was measured at 1920. Nothing compared the two, because
    // one of them is a Rust build config and the other is a test runner's
    // option, and they never meet. Measured in the smaller box on a full grid
    // in Sığdır: the cell fell to 20.83px and 315 of 374 cards read "4…"
    // instead of "411". My father's words were "derslerin hepsi gözükmüyor
    // sığdır olmasına rağmen", and he was describing exactly this.
    //
    // The heights are logical pixels, which is the other half of it. Windows
    // display scaling divides the desktop: at %150 a 1920x1080 screen is
    // 1280x720 logical and the work area about 672. A minHeight of 700 made
    // the window IMPOSSIBLE to fit on that screen — and the first thing off
    // the bottom edge is `.grid-wrap`'s own scrollbar, so the rows you cannot
    // see are also the rows you cannot scroll to.
    const win = tauriConf.app.windows[0]!;
    expect(win.maximized, 'exe ölçülmemiş bir kutuda koşar').toBe(true);
    expect(win.minHeight, '%150 ölçekte çalışma alanı 672 mantıksal px').toBeLessThanOrEqual(672);
    expect(win.minWidth).toBeLessThanOrEqual(1280);
  });
});

describe('güncelleme adresi — manifest ile exe aynı şeyi tanıyor', () => {
  // WHY THIS TEST EXISTS. The repository was renamed `ders-programi` ->
  // `Mozaik`. The prefixes `update.rs` accepts are COMPILED INTO every copy
  // already on somebody's machine, so the published v2.0.2 knows only the old
  // name — and the manifest written after the rename carried the new one. What
  // my father saw when he pressed "Güncellemeleri denetle":
  //
  //     Beklenmeyen adres: https://github.com/AlparslanSemiz/Mozaik/...
  //
  // Nothing in the repository went red, because the two halves of that
  // sentence live in two files that never met: a shell line in a workflow and
  // a Rust constant. They meet here.

  const KOK = /const RELEASE_KOKLERI: \[&str; \d+\] = \[([^\]]*)\]/;
  const ADRES = /^\s*adres="([^"]+)"/m;

  function kokler(): string[] {
    const blok = KOK.exec(updateRs);
    expect(blok, 'update.rs içinde RELEASE_KOKLERI yok').not.toBeNull();
    return [...(blok?.[1] ?? '').matchAll(/"([^"]+)"/g)].flatMap((m) => m[1] ?? []);
  }

  it('surum.yml’in yazdığı adresi update.rs kabul ediyor', () => {
    const m = ADRES.exec(surumYml);
    expect(m, 'surum.yml içinde adres satırı yok').not.toBeNull();
    const adres = m?.[1] ?? '';
    expect(
      kokler().some((kok) => adres.startsWith(kok)),
      `manifest ${adres} diyor, update.rs ${kokler().join(' · ')} tanıyor`,
    ).toBe(true);
  });

  it('ESKİ depo adı listede duruyor — dağıtılmış v2.0.2 yalnız onu tanıyor', () => {
    // Removing it would strand that copy for good: it cannot be taught a new
    // prefix, and there is no screen anywhere that would say why.
    expect(kokler()).toContain('https://github.com/AlparslanSemiz/ders-programi/releases/');
  });

  it('manifest adresi ESKİ adı taşıyor — eski kopya da indirebilsin', () => {
    // GitHub 301s the old name to the new one (measured 2026-08-31), so one
    // address serves both sides. Flipping this to the new name is only safe
    // once every copy in use is >= 2.0.4.
    const m = ADRES.exec(surumYml);
    expect(m?.[1]).toBe(
      'https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Mozaik.exe',
    );
  });
});
