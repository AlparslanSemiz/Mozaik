// `npm run yayinla`'s git commands: when one fails, what the reader is told.
//
// 2026-09-26, releasing 2.2.0: the push failed (no credentials for HTTPS in
// that environment) and the script printed the failure as a raw byte dump,
// `stderr: <Buffer 66 61 74 61 6c ...>`, with no sentence in it. A release is
// the one moment somebody reads this output under pressure.

import { mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { git, stabiliIlerlet, yayinYeriSorunu } from '../scripts/git-komut.mjs';

describe('yayınlama betiğinin git komutları', () => {
  // A command that is certain to fail and touches nothing: listing the refs of
  // a repository that does not exist.
  const olmayan = '/yok/mozaik-uzak-deposu';

  it('düşen bir komut okunur bir cümle ve git’in kendi satırıyla bildiriliyor', () => {
    let hata: unknown;
    try {
      git('.', 'ls-remote', olmayan);
    } catch (e) {
      hata = e;
    }
    expect(hata, 'komut düşmedi, iddia bedava geçerdi').toBeInstanceOf(Error);
    const mesaj = (hata as Error).message;
    expect(mesaj.split('\n')[0]).toBe(`git ls-remote ${olmayan} olmadı (çıkış kodu 128).`);
    // git's own words, as text: they are what says WHY.
    expect(mesaj).toContain('does not appear to be a git repository');
    // ...and nothing that prints as bytes when the error is shown whole.
    expect(Object.values(hata as object).some((x) => x instanceof Uint8Array)).toBe(false);
    expect(mesaj).not.toContain('Command failed');
  });

  it('çalışan bir komutun çıktısı olduğu gibi dönüyor', () => {
    expect(git('.', 'rev-parse', '--is-inside-work-tree')).toBe('true');
  });
});

describe('yayınlama betiğinin yeri: ana klasör ve main', () => {
  // Work happens on branches, in the main checkout or a temporary worktree, and
  // only the main checkout on `main` may release. A release from anywhere else tags a
  // commit the site does not publish. Measured in a throwaway repository, so
  // the answer does not depend on where this test happens to run.
  const kok = realpathSync(mkdtempSync(join(tmpdir(), 'mozaik-yayin-yeri-')));
  const ana = join(kok, 'ana');
  const kimlik = ['-c', 'user.name=t', '-c', 'user.email=t@t'];
  git(kok, 'init', '-q', '-b', 'main', ana);
  git(ana, ...kimlik, 'commit', '-q', '--allow-empty', '-m', 'ilk');
  afterAll(() => rmSync(kok, { recursive: true, force: true }));

  it('ana klasörde ve main’de sorun yok', () => {
    expect(yayinYeriSorunu(ana)).toBeNull();
  });

  it('ana klasör başka daldayken tek cümleyle duruyor', () => {
    git(ana, 'switch', '-q', '-c', 'ozellik/x');
    try {
      expect(yayinYeriSorunu(ana)).toBe(
        `Sürüm yalnız main'den çıkar; bu klasör "ozellik/x" dalında.`,
      );
    } finally {
      git(ana, 'switch', '-q', 'main');
    }
  });

  it('bir worktree, dalı ne olursa olsun, tek cümleyle duruyor', () => {
    const dalda = join(kok, 'dalda');
    const ayrik = join(kok, 'ayrik');
    git(ana, 'worktree', 'add', '-q', '-b', 'bakim/y', dalda);
    // main's own commit, detached: the case git does not refuse by itself.
    git(ana, 'worktree', 'add', '-q', '--detach', ayrik, 'main');
    for (const yer of [dalda, ayrik]) {
      expect(yayinYeriSorunu(yer)).toBe(
        `Sürüm yalnız ana klasörden ve main'den çıkar; burası bir worktree (${yer}).`,
      );
    }
    // The main checkout is still fine with worktrees beside it.
    expect(yayinYeriSorunu(ana)).toBeNull();
  });
});

describe('stabil: son sürüm, yalnız ileri', () => {
  // `npm run yayinla` moves stabil to the tag it has just pushed. Measured
  // against a throwaway bare remote: the remote's refusal is what keeps a
  // non-fast-forward from happening, so it has to be a real remote.
  const kok = realpathSync(mkdtempSync(join(tmpdir(), 'mozaik-stabil-')));
  const uzak = join(kok, 'uzak.git');
  const ana = join(kok, 'ana');
  const kimlik = ['-c', 'user.name=t', '-c', 'user.email=t@t'];
  git(kok, 'init', '-q', '--bare', uzak);
  git(kok, 'init', '-q', '-b', 'main', ana);
  git(ana, 'remote', 'add', 'origin', uzak);
  const commit = (m: string) => git(ana, ...kimlik, 'commit', '-q', '--allow-empty', '-m', m);
  const uc = (ref: string) => git(ana, 'rev-parse', ref);
  const uzaktaki = () => git(ana, 'ls-remote', 'origin', 'refs/heads/stabil').split('\t')[0];
  afterAll(() => rmSync(kok, { recursive: true, force: true }));

  it('ilk sürümde stabil yerelde ve uzakta etiketin commit’inde açılıyor', () => {
    commit('1');
    git(ana, ...kimlik, 'tag', '-a', 'v1.0.0', '-m', 'v1.0.0');
    expect(stabiliIlerlet(ana, 'v1.0.0')).toBeNull();
    // The commit, not the annotated tag object.
    expect(uc('stabil')).toBe(uc('v1.0.0^{commit}'));
    expect(uzaktaki()).toBe(uc('v1.0.0^{commit}'));
  });

  it('sonraki sürümde ileri alınıyor', () => {
    commit('2');
    git(ana, 'tag', 'v1.1.0');
    expect(stabiliIlerlet(ana, 'v1.1.0')).toBeNull();
    expect(uc('stabil')).toBe(uc('v1.1.0'));
    expect(uzaktaki()).toBe(uc('v1.1.0'));
  });

  it('geriye gitmiyor ve yerinden oynamıyor', () => {
    const once = uc('stabil');
    expect(stabiliIlerlet(ana, 'v1.0.0')).toMatch(/^Yerel stabil v1\.0\.0'in atası değil/);
    expect(uc('stabil')).toBe(once);
    expect(uzaktaki()).toBe(once);
  });

  it('uzaktaki stabil başka yöne gittiyse zorlamıyor', () => {
    // Somebody moved the remote stabil off the line; the local one is behind.
    git(ana, 'switch', '-q', '-c', 'yan', 'v1.0.0');
    commit('yan');
    git(ana, 'push', '-q', '--force', 'origin', 'HEAD:refs/heads/stabil');
    const yan = uc('HEAD');
    git(ana, 'switch', '-q', 'main');
    git(ana, 'update-ref', 'refs/heads/stabil', uc('v1.0.0^{commit}'));
    commit('3');
    git(ana, 'tag', 'v1.2.0');
    expect(stabiliIlerlet(ana, 'v1.2.0')).toMatch(/^Uzaktaki stabil v1\.2\.0'e ileri alınamadı/);
    expect(uzaktaki()).toBe(yan);
    expect(uc('stabil')).toBe(uc('v1.0.0^{commit}'));
  });
});
