// `npm run dal-temizle`            —  prints the plan, changes nothing.
// `npm run dal-temizle -- --uygula` —  carries it out.
//
// Branches and worktrees pile up: every job is a short-lived branch, every
// parallel session a temporary worktree (CLAUDE.md, "Çalışma düzeni"), and
// nobody deletes them by hand. This deletes what is provably finished and
// lists the rest. What counts as finished, and what is never touched, is
// decided in dal-plan.mjs; this file only gathers the inputs and acts.
//
// Nothing is deleted before it is kept somewhere else, in this order:
//   1. one `git bundle` with every tip about to go, in ~/GitHub/Mozaikler/_arsiv/,
//      and `git bundle verify` on it; a failed verify stops everything;
//   2. a LOCAL tag `arsiv/<branch>` per tip. Lightweight on purpose:
//      `--follow-tags` pushes annotated tags only, so these stay home even then;
//   3. each worktree's ignored files that are not a cache (scratch/ above all)
//      moved to ~/GitHub/Mozaikler/_arsiv/<branch>/, because `git worktree
//      remove` deletes ignored files without a word;
//   4. only then `git worktree remove` (never --force), the local branch, and
//      `git push origin --delete` for the remote one.

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  arsivEtiketleri,
  bundleAdi,
  onbellekMi,
  planKur,
  workflowDallari,
  worktreeleriOku,
} from './dal-plan.mjs';
import { git as gitKomut } from './git-komut.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ARSIV = join(homedir(), 'GitHub', 'Mozaikler', '_arsiv');
const uygula = process.argv.slice(2).includes('--uygula');

function dur(mesaj, ...cozum) {
  console.error(`\n  ${mesaj}\n`);
  for (const satir of cozum) console.error(`      ${satir}`);
  console.error('');
  process.exit(1);
}

function git(...args) {
  try {
    return gitKomut(KOK, ...args);
  } catch (e) {
    dur(
      e.message.split('\n')[0],
      ...String(e.gitCevabi ?? '')
        .split('\n')
        .filter(Boolean),
    );
  }
}

// A yes/no question to git: the exit code is the answer, not a failure.
function gitEvetMi(...args) {
  const r = spawnSync('git', args, { cwd: KOK, stdio: 'ignore' });
  if (r.status === 0) return true;
  if (r.status === 1) return false;
  dur(`git ${args.join(' ')} olmadı (çıkış kodu ${r.status}).`);
}

// ---------------------------------------------------------------- girdiler

git('fetch', '--quiet', 'origin');

const merkez = 'refs/remotes/origin/main';
function dallar(onek) {
  const satirlar = git(
    'for-each-ref',
    '--format=%(refname)%09%(objectname)%09%(committerdate:short)',
    onek,
  );
  return satirlar
    .split('\n')
    .filter(Boolean)
    .map((s) => s.split('\t'))
    .filter(([ref]) => ref !== 'refs/remotes/origin/HEAD')
    .map(([ref, sha, tarih]) => ({
      ad: ref.slice(onek.length),
      sha,
      tarih,
      ileri: Number(git('rev-list', '--count', `${merkez}..${sha}`)),
      birlesti: gitEvetMi('merge-base', '--is-ancestor', sha, merkez),
    }));
}
const yerel = dallar('refs/heads/');
const uzak = dallar('refs/remotes/origin/');

// Open PRs come from GitHub. Without them a branch with an open PR would look
// like any merged one, so no answer from gh means no plan.
const pr = spawnSync(
  'gh',
  ['pr', 'list', '--state', 'open', '--limit', '200', '--json', 'headRefName'],
  {
    cwd: KOK,
    encoding: 'utf8',
  },
);
if (pr.error || pr.status !== 0) {
  dur(
    'Açık PR listesi alınamadı; hangi dalın korunacağı bilinmeden plan kurulmaz.',
    'gh auth status',
  );
}
const acikPr = new Set(JSON.parse(pr.stdout).map((p) => p.headRefName));

const workflowKlasoru = join(KOK, '.github', 'workflows');
const { adlar: workflow, desenler } = workflowDallari(
  readdirSync(workflowKlasoru)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => readFileSync(join(workflowKlasoru, f), 'utf8')),
);

// Which worktrees some process is sitting in: an open session, an editor, a
// running test. Linux only (/proc). Where it cannot be read, every worktree
// counts as in use and none is removed.
function kullanilanYollar() {
  try {
    const yollar = [];
    for (const p of readdirSync('/proc')) {
      if (!/^\d+$/.test(p)) continue;
      try {
        yollar.push(readlinkSync(`/proc/${p}/cwd`));
      } catch {
        // Another user's process, or one that just ended.
      }
    }
    return yollar;
  } catch {
    return null;
  }
}
const cwdler = kullanilanYollar();
const buradaki = git('rev-parse', '--show-toplevel');
const icinde = (yol) => cwdler === null || cwdler.some((c) => c === yol || c.startsWith(yol + sep));

// A worktree git cannot read counts as dirty: unknown is not clean.
function kirliMi(yol) {
  try {
    return gitKomut(yol, 'status', '--porcelain') !== '';
  } catch {
    return true;
  }
}

const worktreeler = worktreeleriOku(git('worktree', 'list', '--porcelain')).map((w) => ({
  ...w,
  kirli: !w.bare && kirliMi(w.yol),
  buradaki: w.yol === buradaki,
  // This command's own process sits in its own worktree; that one is
  // `buradaki` already and must not make every other check say "in use".
  kullanimda: w.yol !== buradaki && icinde(w.yol),
}));

const plan = planKur({ yerel, uzak, worktreeler, acikPr, workflow });
const etiketler = arsivEtiketleri(plan);

// ------------------------------------------------------------------ plan

function yaz(baslik, satirlar) {
  console.log(`\n  ${baslik} (${satirlar.length})`);
  for (const s of satirlar) console.log(`      ${s}`);
}

console.log(
  `\n  ${uygula ? 'UYGULANIYOR' : 'KURU KOŞU: hiçbir şey değişmez'} · ölçü: origin/main ${git('rev-parse', '--short', merkez)}`,
);
if (cwdler === null) console.log('  /proc okunamadı: hiçbir worktree kaldırılmaz.');
if (desenler.size > 0)
  console.log(`  Workflow desenleri (dal adı sayılmadı): ${[...desenler].join(', ')}`);
yaz(
  'Silinecek yerel dallar',
  plan.silinecekYerel.map((d) => `${d.ad}  ${d.tarih}  ${d.sha.slice(0, 7)}`),
);
yaz(
  'Silinecek uzak dallar',
  plan.silinecekUzak.map((d) => `origin/${d.ad}  ${d.tarih}  ${d.sha.slice(0, 7)}`),
);
yaz(
  "Kaldırılacak worktree'ler",
  plan.kaldirilacakWorktree.map((w) => `${w.yol}  [${w.dal}]`),
);
yaz(
  'Korunanlar',
  plan.korunan.map((k) => `${k.yer === 'uzak' ? 'origin/' : ''}${k.ad}: ${k.sebep}`),
);
yaz(
  'Birleşmemiş dallar (silinmez, karar sizin)',
  plan.birlesmemis.map(
    (b) =>
      `${b.yer === 'uzak' ? 'origin/' : ''}${b.ad}  ${b.tarih}  main'in ${b.ileri} commit önünde`,
  ),
);
yaz(
  "Dokunulmayan worktree'ler",
  plan.dokunulmayanWorktree.map((w) => `${w.yol}: ${w.sebep}`),
);

const hicIs = plan.silinecekYerel.length === 0 && plan.silinecekUzak.length === 0;
if (!uygula || hicIs) {
  console.log(
    hicIs
      ? '\n  Silinecek bir şey yok.\n'
      : '\n  Uygulamak için: npm run dal-temizle -- --uygula\n',
  );
  process.exit(0);
}

// ------------------------------------------------------------------ bundle

mkdirSync(ARSIV, { recursive: true });
const simdi = new Date();
const iki = (n) => String(n).padStart(2, '0');
const tarih = `${simdi.getFullYear()}-${iki(simdi.getMonth() + 1)}-${iki(simdi.getDate())}`;
const bundle = join(
  ARSIV,
  bundleAdi(tarih, (ad) => existsSync(join(ARSIV, ad))),
);

// Each tip by its own ref, so `git bundle list-heads` names what it holds.
const bundleRefleri = [
  ...plan.silinecekYerel.map((d) => `refs/heads/${d.ad}`),
  ...plan.silinecekUzak.map((d) => `refs/remotes/origin/${d.ad}`),
];
git('bundle', 'create', bundle, ...bundleRefleri);
const dogrula = spawnSync('git', ['bundle', 'verify', bundle], { cwd: KOK, encoding: 'utf8' });
if (dogrula.status !== 0) {
  dur(`Bundle doğrulanmadı, hiçbir şey silinmedi: ${bundle}`, ...dogrula.stderr.trim().split('\n'));
}
console.log(`\n  Bundle yazıldı ve doğrulandı: ${bundle}`);

// ---------------------------------------------------------------- etiketler

// A tag already there on another commit stops the run before anything goes:
// overwriting it would lose the tip it kept.
for (const e of etiketler) {
  const var_ = spawnSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${e.ad}^{commit}`], {
    cwd: KOK,
    encoding: 'utf8',
  });
  if (var_.status === 0 && var_.stdout.trim() !== e.sha) {
    dur(`${e.ad} etiketi başka bir commit'te; hiçbir şey silinmedi.`, `git show ${e.ad}`);
  }
}
for (const e of etiketler) {
  if (gitEvetMi('rev-parse', '-q', '--verify', `refs/tags/${e.ad}`)) continue;
  git('tag', e.ad, e.sha);
}
console.log(`  ${etiketler.length} yerel arsiv/ etiketi (itilmez).`);

// --------------------------------------------------------------- worktree'ler

const silinen = [];
const kalan = [];
const kaldirilamayanDal = new Set();

for (const w of plan.kaldirilacakWorktree) {
  const hedef = join(ARSIV, w.dal);
  let tasinacak = [];
  try {
    tasinacak = gitKomut(
      w.yol,
      'ls-files',
      '--others',
      '--ignored',
      '--exclude-standard',
      '--directory',
    )
      .split('\n')
      .filter(Boolean)
      .filter((y) => !onbellekMi(y));
    for (const y of tasinacak) {
      const kaynak = join(w.yol, y.replace(/\/$/, ''));
      const varis = join(hedef, y.replace(/\/$/, ''));
      if (existsSync(varis)) throw new Error(`${varis} zaten var`);
      mkdirSync(dirname(varis), { recursive: true });
      try {
        renameSync(kaynak, varis);
      } catch (e) {
        if (e.code !== 'EXDEV') throw e;
        cpSync(kaynak, varis, { recursive: true });
        rmSync(kaynak, { recursive: true });
      }
    }
    gitKomut(KOK, 'worktree', 'remove', w.yol);
    silinen.push(`worktree ${w.yol}${tasinacak.length > 0 ? ` (yoksayılanlar → ${hedef})` : ''}`);
  } catch (e) {
    kaldirilamayanDal.add(w.dal);
    kalan.push(`worktree ${w.yol}: kaldırılamadı, dalı da kaldı (${e.message.split('\n')[0]})`);
  }
}

// ------------------------------------------------------------------ dallar

// `update-ref -d <ref> <sha>` deletes only if the branch still points where
// it pointed when it was bundled: a commit added in between keeps it.
for (const d of plan.silinecekYerel) {
  if (kaldirilamayanDal.has(d.ad)) continue;
  try {
    gitKomut(KOK, 'update-ref', '-d', `refs/heads/${d.ad}`, d.sha);
    spawnSync('git', ['config', '--remove-section', `branch.${d.ad}`], {
      cwd: KOK,
      stdio: 'ignore',
    });
    silinen.push(`yerel ${d.ad}`);
  } catch (e) {
    kalan.push(`yerel ${d.ad}: silinemedi (${e.message.split('\n')[0]})`);
  }
}

// The remote is asked again right before each delete: a push since the fetch
// above would put a tip on it that no bundle holds.
for (const d of plan.silinecekUzak) {
  const simdiki = git('ls-remote', 'origin', `refs/heads/${d.ad}`).split('\t')[0];
  if (simdiki !== d.sha) {
    kalan.push(`origin/${d.ad}: uzakta ${simdiki === '' ? 'artık yok' : 'ilerlemiş'}, dokunulmadı`);
    continue;
  }
  try {
    gitKomut(KOK, 'push', 'origin', '--delete', d.ad);
    silinen.push(`uzak origin/${d.ad}`);
  } catch (e) {
    kalan.push(`origin/${d.ad}: silinemedi (${e.message.split('\n')[0]})`);
  }
}

git('worktree', 'prune');
git('fetch', '--quiet', '--prune', 'origin');

// ------------------------------------------------------------------ özet

yaz('Silinenler', silinen);
yaz('Kalanlar ve sebebi', [
  ...kalan,
  ...plan.korunan.map((k) => `${k.yer === 'uzak' ? 'origin/' : ''}${k.ad}: ${k.sebep}`),
  ...plan.birlesmemis.map((b) => `${b.yer === 'uzak' ? 'origin/' : ''}${b.ad}: birleşmemiş`),
]);
console.log(`\n  Bundle: ${bundle}`);
console.log('  Bir dalı geri almak için: git branch <dal> arsiv/<dal>');
console.log(`  ya da bundle'dan: git bundle list-heads ${bundle}\n`);
if (kalan.length > 0) process.exit(1);
