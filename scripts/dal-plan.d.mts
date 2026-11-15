// Types for scripts/dal-plan.mjs, which stays plain .mjs so `npm run
// dal-temizle` runs it with `node` alone (the same reason as git-komut.d.mts).

export interface Dal {
  ad: string;
  sha: string;
  tarih: string;
  /** Commits on the branch that origin/main does not have. */
  ileri: number;
  /** The tip is an ancestor of origin/main. */
  birlesti: boolean;
}

export interface Worktree {
  yol: string;
  dal: string | null;
  ayrik: boolean;
  bare: boolean;
  /** The main checkout, `git worktree list`'s first line. */
  ana: boolean;
}

export interface WorktreeDurumu extends Worktree {
  kirli: boolean;
  /** Some process has its working directory inside it. */
  kullanimda: boolean;
  /** The worktree this command runs from. */
  buradaki: boolean;
}

export interface Plan {
  silinecekYerel: { ad: string; sha: string; tarih: string }[];
  silinecekUzak: { ad: string; sha: string; tarih: string }[];
  kaldirilacakWorktree: { yol: string; dal: string }[];
  dokunulmayanWorktree: { yol: string; sebep: string }[];
  korunan: { ad: string; yer: 'yerel' | 'uzak'; sebep: string }[];
  birlesmemis: { ad: string; yer: 'yerel' | 'uzak'; tarih: string; ileri: number }[];
}

export const SABIT_KORUNAN: string[];
export const ONBELLEK: string[];
export function onbellekMi(yol: string): boolean;
export function worktreeleriOku(porcelain: string): Worktree[];
export function workflowDallari(metinler: string[]): { adlar: Set<string>; desenler: Set<string> };
export function planKur(girdi: {
  yerel: Dal[];
  uzak: Dal[];
  worktreeler: WorktreeDurumu[];
  acikPr: Set<string>;
  workflow: Set<string>;
}): Plan;
export function arsivEtiketleri(plan: Plan): { ad: string; sha: string }[];
/** One `git fetch <bundle> <ref>:refs/heads/<branch>` per deleted tip, with the ref the bundle holds. */
export function geriAlmaKomutlari(
  bundle: string,
  yerel: { ad: string; sha: string }[],
  uzak: { ad: string; sha: string }[],
): string[];
export function bundleAdi(tarih: string, varMi: (ad: string) => boolean): string;
