// `npm run yayinla`'s git commands: when one fails, what the reader is told.
//
// 2026-09-26, releasing 2.2.0: the push failed (no credentials for HTTPS in
// that environment) and the script printed the failure as a raw byte dump,
// `stderr: <Buffer 66 61 74 61 6c ...>`, with no sentence in it. A release is
// the one moment somebody reads this output under pressure.

import { describe, expect, it } from 'vitest';

import { git } from '../scripts/git-komut.mjs';

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
