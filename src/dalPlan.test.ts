// `npm run dal-temizle`'s rules: which branch is deleted, which is kept, and
// why. Measured on made-up git output, so the answer does not depend on which
// branches this repository happens to have today.

import { mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import {
  arsivEtiketleri,
  bundleAdi,
  geriAlmaKomutlari,
  onbellekMi,
  planKur,
  workflowDallari,
  worktreeleriOku,
  type Dal,
  type WorktreeDurumu,
} from '../scripts/dal-plan.mjs';
import { git } from '../scripts/git-komut.mjs';

const dal = (ad: string, birlesti: boolean, ileri = birlesti ? 0 : 3): Dal => ({
  ad,
  sha: `${ad}-sha`,
  tarih: '2026-10-24',
  ileri,
  birlesti,
});

const wt = (yol: string, dal: string | null, ek: Partial<WorktreeDurumu> = {}): WorktreeDurumu => ({
  yol,
  dal,
  ayrik: dal === null,
  bare: false,
  ana: false,
  kirli: false,
  kullanimda: false,
  buradaki: false,
  ...ek,
});

const bos = {
  yerel: [],
  uzak: [],
  worktreeler: [],
  acikPr: new Set<string>(),
  workflow: new Set<string>(),
};

describe('git worktree list --porcelain', () => {
  const cikti = [
    'worktree /depo/Mozaik',
    'HEAD c41223cc38826d345ebfdc0fe055bc8357c4a449',
    'branch refs/heads/main',
    '',
    'worktree /depo/Mozaik-analiz',
    'HEAD c41223cc38826d345ebfdc0fe055bc8357c4a449',
    'detached',
    '',
    'worktree /depo/Mozaik-tb7',
    'HEAD 1f9995f0000000000000000000000000000000000',
    'branch refs/heads/ozellik/tb7',
    '',
  ].join('\n');

  it('ilk kayıt ana checkout, dalın adı refs/heads/ olmadan, ayrık HEAD dalsız', () => {
    const w = worktreeleriOku(cikti);
    expect(w.map((x) => [x.yol, x.dal, x.ana, x.ayrik])).toEqual([
      ['/depo/Mozaik', 'main', true, false],
      ['/depo/Mozaik-analiz', null, false, true],
      ['/depo/Mozaik-tb7', 'ozellik/tb7', false, false],
    ]);
  });
});

describe("workflow'larda adı geçen dallar", () => {
  it('satır içi liste, blok liste ve refs/heads/ okunuyor; desen dal sayılmıyor', () => {
    const ci =
      "on:\n  push:\n    branches: ['**']\njobs:\n  site:\n    if: github.ref == 'refs/heads/main'\n";
    const win = 'on:\n  push:\n    branches: [main, yayin]\n';
    const blok =
      'on:\n  pull_request:\n    branches:\n      - gelistirme # yorum\n      - "surum/*"\n    paths:\n      - src/**\n';
    const { adlar, desenler } = workflowDallari([ci, win, blok]);
    expect([...adlar].sort()).toEqual(['gelistirme', 'main', 'yayin']);
    expect([...desenler].sort()).toEqual(['**', 'surum/*']);
  });
});

describe('koruma', () => {
  it('main ve gh-pages birleşmiş olsalar da silinmiyor, yerelde de uzakta da', () => {
    const p = planKur({
      ...bos,
      yerel: [dal('main', true), dal('gh-pages', true)],
      uzak: [dal('main', true), dal('gh-pages', true)],
    });
    expect(p.silinecekYerel).toEqual([]);
    expect(p.silinecekUzak).toEqual([]);
    expect(p.korunan.map((k) => k.sebep)).toEqual(Array(4).fill('sabit korunan'));
  });

  it("workflow'da adı geçen ve açık PR'ı olan dal korunuyor", () => {
    const p = planKur({
      ...bos,
      uzak: [dal('yayin', true), dal('dependabot/vite', true)],
      acikPr: new Set(['dependabot/vite']),
      workflow: new Set(['yayin']),
    });
    expect(p.silinecekUzak).toEqual([]);
    expect(p.korunan.map((k) => [k.ad, k.sebep])).toEqual([
      ['yayin', "workflow'da adı geçiyor"],
      ['dependabot/vite', 'açık PR var'],
    ]);
  });

  it("kirli worktree'deki birleşmiş dal yerelde de uzakta da duruyor, worktree'si de", () => {
    const p = planKur({
      ...bos,
      yerel: [dal('zebra', true)],
      uzak: [dal('zebra', true)],
      worktreeler: [wt('/depo/zebra', 'zebra', { kirli: true })],
    });
    expect(p.silinecekYerel).toEqual([]);
    expect(p.silinecekUzak).toEqual([]);
    expect(p.kaldirilacakWorktree).toEqual([]);
    expect(p.korunan.map((k) => k.yer)).toEqual(['yerel', 'uzak']);
    expect(p.korunan[0]?.sebep).toMatch(/^kirli worktree/);
  });

  it("içinde bir süreç olan, komutun koştuğu ve ana checkout'taki worktree'ye dokunulmuyor", () => {
    const p = planKur({
      ...bos,
      yerel: [dal('acik', true), dal('burasi', true), dal('anadaki', true)],
      worktreeler: [
        wt('/depo/acik', 'acik', { kullanimda: true }),
        wt('/depo/burasi', 'burasi', { buradaki: true }),
        wt('/depo/ana', 'anadaki', { ana: true }),
      ],
    });
    expect(p.silinecekYerel).toEqual([]);
    expect(p.kaldirilacakWorktree).toEqual([]);
    expect(p.korunan.map((k) => k.sebep.split(' (')[0])).toEqual([
      'worktree kullanımda, bir süreç içinde',
      'bu komutun koştuğu worktree',
      "ana checkout'ta açık",
    ]);
  });

  it("ayrık HEAD'li worktree yalnız listeleniyor", () => {
    const p = planKur({
      ...bos,
      worktreeler: [wt('/depo/ana', 'main', { ana: true }), wt('/depo/analiz', null)],
    });
    expect(p.dokunulmayanWorktree).toEqual([
      { yol: '/depo/analiz', sebep: 'ayrık HEAD, dalı yok' },
    ]);
    expect(p.kaldirilacakWorktree).toEqual([]);
  });
});

describe('aday', () => {
  it("yalnız origin/main'e birleşmiş dal siliniyor; birleşmemiş tarih ve ileri sayısıyla listeleniyor", () => {
    const p = planKur({
      ...bos,
      yerel: [dal('eski', true), dal('yarim', false, 19)],
      uzak: [dal('eski', true), dal('HEAD', true), dal('klasorleme', false, 29)],
    });
    expect(p.silinecekYerel.map((d) => d.ad)).toEqual(['eski']);
    expect(p.silinecekUzak.map((d) => d.ad)).toEqual(['eski']);
    expect(p.birlesmemis).toEqual([
      { ad: 'yarim', yer: 'yerel', tarih: '2026-10-24', ileri: 19 },
      { ad: 'klasorleme', yer: 'uzak', tarih: '2026-10-24', ileri: 29 },
    ]);
  });

  it("birleşmiş dalın temiz ve boştaki worktree'si kaldırılacaklarda", () => {
    const p = planKur({
      ...bos,
      yerel: [dal('bitti', true)],
      worktreeler: [wt('/depo/bitti', 'bitti')],
    });
    expect(p.kaldirilacakWorktree).toEqual([{ yol: '/depo/bitti', dal: 'bitti' }]);
    expect(p.silinecekYerel.map((d) => d.ad)).toEqual(['bitti']);
  });

  it("birleşmemiş dalın temiz worktree'si de kalıyor", () => {
    const p = planKur({
      ...bos,
      yerel: [dal('yarim', false)],
      worktreeler: [wt('/depo/yarim', 'yarim')],
    });
    expect(p.kaldirilacakWorktree).toEqual([]);
  });
});

describe('arşiv', () => {
  it('her uç bir arsiv/ etiketi alıyor; yerelden farklı uzak uç ayrı adla', () => {
    const p = planKur({
      ...bos,
      yerel: [dal('a', true), dal('b', true)],
      uzak: [dal('a', true), { ...dal('b', true), sha: 'b-uzak' }, dal('c', true)],
    });
    expect(arsivEtiketleri(p)).toEqual([
      { ad: 'arsiv/a', sha: 'a-sha' },
      { ad: 'arsiv/b', sha: 'b-sha' },
      { ad: 'arsiv/origin/b', sha: 'b-uzak' },
      { ad: 'arsiv/c', sha: 'c-sha' },
    ]);
  });

  it('aynı günün bundle’ının üstüne yazılmıyor', () => {
    const var_ = new Set(['dallar-2026-10-24.bundle', 'dallar-2026-10-24-2.bundle']);
    expect(bundleAdi('2026-10-24', (ad) => var_.has(ad))).toBe('dallar-2026-10-24-3.bundle');
    expect(bundleAdi('2026-10-25', (ad) => var_.has(ad))).toBe('dallar-2026-10-25.bundle');
  });

  it('scratch/ önbellek değil, taşınıyor; node_modules ve derleme çıktısı taşınmıyor', () => {
    expect(onbellekMi('scratch/')).toBe(false);
    expect(onbellekMi('docs/asc/ekran/asc.zip')).toBe(false);
    expect(onbellekMi('node_modules/')).toBe(true);
    expect(onbellekMi('src-tauri/target/')).toBe(true);
    expect(onbellekMi('dist-site/')).toBe(true);
    expect(onbellekMi('distler/')).toBe(false);
    expect(onbellekMi('tsconfig.tsbuildinfo')).toBe(true);
  });
});

describe('özetin geri alma satırları', () => {
  // 2026-10-24: a restore line for a remote-only branch named `refs/heads/...`,
  // and the bundle held it as `refs/remotes/origin/...`: "couldn't find remote
  // ref". Each line now names the ref the bundle was written from.
  it('her silinen uç için gerçek bundle yolu ve gerçek ref adı', () => {
    const satirlar = geriAlmaKomutlari(
      '/arsiv/dallar-2026-10-24.bundle',
      [
        { ad: 'eski', sha: 'e1' },
        { ad: 'iki', sha: 'i1' },
      ],
      [
        { ad: 'eski', sha: 'e1' },
        { ad: 'iki', sha: 'i2' },
        { ad: 'klasorleme', sha: 'k1' },
      ],
    );
    expect(satirlar).toEqual([
      'git fetch /arsiv/dallar-2026-10-24.bundle refs/heads/eski:refs/heads/eski',
      'git fetch /arsiv/dallar-2026-10-24.bundle refs/heads/iki:refs/heads/iki',
      'git fetch /arsiv/dallar-2026-10-24.bundle refs/remotes/origin/iki:refs/heads/iki-origin',
      'git fetch /arsiv/dallar-2026-10-24.bundle refs/remotes/origin/klasorleme:refs/heads/klasorleme',
    ]);
  });

  describe('satırlar gerçek bir bundle’da çalışıyor', () => {
    const kok = realpathSync(mkdtempSync(join(tmpdir(), 'mozaik-geri-al-')));
    const kimlik = ['-c', 'user.name=t', '-c', 'user.email=t@t'];
    afterAll(() => rmSync(kok, { recursive: true, force: true }));

    it('yerel ve yalnız uzakta olan dal boş bir depoya geri geliyor', () => {
      const ana = join(kok, 'ana');
      git(kok, 'init', '-q', '-b', 'main', ana);
      git(ana, ...kimlik, 'commit', '-q', '--allow-empty', '-m', 'ilk');
      git(ana, 'branch', 'eski');
      git(ana, 'update-ref', 'refs/remotes/origin/klasorleme', 'HEAD');
      const bundle = join(kok, 'dallar.bundle');
      git(ana, 'bundle', 'create', bundle, 'refs/heads/eski', 'refs/remotes/origin/klasorleme');
      const sha = git(ana, 'rev-parse', 'HEAD');

      const bos = join(kok, 'bos');
      git(kok, 'init', '-q', bos);
      const satirlar = geriAlmaKomutlari(
        bundle,
        [{ ad: 'eski', sha }],
        [{ ad: 'klasorleme', sha }],
      );
      for (const satir of satirlar) git(bos, ...satir.split(' ').slice(1));
      expect(git(bos, 'rev-parse', 'refs/heads/eski', 'refs/heads/klasorleme')).toBe(
        `${sha}\n${sha}`,
      );
    });
  });
});
