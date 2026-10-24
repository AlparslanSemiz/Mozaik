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

// A release is cut from one place: the main checkout, on `main`. Branches and
// temporary worktrees are where work happens (CLAUDE.md, "Çalışma düzeni"),
// and a release run from one of them would tag a commit that is not the
// `main` the site publishes. Git already refuses to check `main` out twice,
// but a worktree can still sit on `main`'s commit detached, or be forced.

/** Null in the main checkout on `main`; otherwise the one sentence that says why not. */
export function yayinYeriSorunu(kok) {
  const gitDizini = git(kok, 'rev-parse', '--path-format=absolute', '--git-dir');
  const ortakDizin = git(kok, 'rev-parse', '--path-format=absolute', '--git-common-dir');
  if (gitDizini !== ortakDizin) {
    return `Sürüm yalnız ana klasörden ve main'den çıkar; burası bir worktree (${kok}).`;
  }
  const dal = git(kok, 'rev-parse', '--abbrev-ref', 'HEAD');
  if (dal !== 'main') return `Sürüm yalnız main'den çıkar; bu klasör "${dal}" dalında.`;
  return null;
}

// `stabil` is the commit my father's exe runs: the last release, and only
// ever moved forward (DECISIONS 2026-10-24). A branch, so that "what is he
// running" is `git switch stabil` rather than a lookup of the newest tag.

function atasiMi(kok, ata, torun) {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', ata, torun], { cwd: kok, stdio: 'ignore' });
    return true;
  } catch (e) {
    if (e?.status === 1) return false;
    throw e;
  }
}

/**
 * Fast-forwards `stabil` to `etiket`, on the remote and here. Null when done;
 * otherwise the sentence that says why not. Never forced: the remote refuses a
 * push that is not a fast-forward, and the local branch moves only from the
 * commit it was read at (`update-ref <ref> <new> <old>`).
 */
export function stabiliIlerlet(kok, etiket) {
  const hedef = git(kok, 'rev-parse', `${etiket}^{commit}`);
  let yerel = null;
  try {
    yerel = git(kok, 'rev-parse', '-q', '--verify', 'refs/heads/stabil');
  } catch {
    // No local stabil yet: created below.
  }
  if (yerel !== null && !atasiMi(kok, yerel, hedef)) {
    return `Yerel stabil ${etiket}'in atası değil; ileri alınamaz, elle bakılmalı (git log stabil ${etiket}).`;
  }
  try {
    git(kok, 'push', 'origin', `${hedef}:refs/heads/stabil`);
  } catch (e) {
    return `Uzaktaki stabil ${etiket}'e ileri alınamadı: fast-forward değil ya da push olmadı.\n${e.gitCevabi ?? ''}`.trim();
  }
  git(kok, 'update-ref', 'refs/heads/stabil', hedef, yerel ?? '');
  return null;
}
