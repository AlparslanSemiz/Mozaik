// Types for scripts/git-komut.mjs, which stays plain .mjs so `npm run yayinla`
// runs it with `node` alone (the same reason as surum.d.mts).

/**
 * Runs `git` in `kok` and returns its trimmed output. A failure throws an
 * Error whose first line says which command failed and how, and whose
 * `gitCevabi` is git's own stderr as text.
 */
export function git(kok: string, ...args: string[]): string;

/**
 * Null in the repository's main checkout on `main`, where a release may be
 * cut; otherwise the one sentence that says why not (a linked worktree, or
 * another branch).
 */
export function yayinYeriSorunu(kok: string): string | null;
