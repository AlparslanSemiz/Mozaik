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

import { git, yayinYeriSorunu } from '../scripts/git-komut.mjs';

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
  // Since 2026-10-09 every piece of work has its own branch and worktree, and
  // only the main checkout holds `main`. A release from anywhere else tags a
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
