// One git command, run for a release script (yayinla.mjs).
//
// A failed command used to escape as `execFileSync`'s own error, and Node
// printed it whole: the stack, then `stderr: <Buffer 66 61 74 61 6c ...>`. That
// is how the 2.2.0 push failure read (TESTFINDINGS 2026-09-26). What fails is
// now said in a sentence, with git's own words under it as text.

import { execFileSync } from 'node:child_process';

/** Runs `git` in `kok` and returns its trimmed output; throws a readable Error. */
export function git(kok, ...args) {
  try {
    return execFileSync('git', args, { cwd: kok, stdio: ['ignore', 'pipe', 'pipe'] })
      .toString()
      .trim();
  } catch (e) {
    const komut = `git ${args.join(' ')}`;
    // No exit code means git itself did not run (not installed, not on PATH).
    const mesaj =
      typeof e?.status === 'number'
        ? `${komut} olmadı (çıkış kodu ${e.status}).`
        : `${komut} çalıştırılamadı: ${e?.message ?? e}`;
    const cevap = String(e?.stderr ?? '').trim();
    const hata = new Error(cevap === '' ? mesaj : `${mesaj}\n${cevap}`);
    hata.gitCevabi = cevap;
    throw hata;
  }
}
