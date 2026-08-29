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
    // way — the keys, the backup file names, `Belgelerim\Ders Programı` and
    // the GitHub repo all kept their old names because they are data. This is
    // the same rule; it was simply missed, because a reverse-DNS id looks like
    // a name and is an address.
    expect(tauriConf.identifier).toBe('com.dersprogrami.arac');
  });

  it('ekrandaki ad Mozaik — kimlik onunla birlikte kıpırdamıyor', () => {
    // The guard that keeps the test above from being read as "the rename was
    // reverted". It was not: the name is Mozaik everywhere a person sees one.
    expect(tauriConf.productName).toBe('Mozaik');
    expect(tauriConf.app.windows.map((w) => w.title)).toContain('Mozaik');
  });
});
