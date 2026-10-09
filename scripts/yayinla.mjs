// `npm run yayinla -- 1.2.0`  —  one command per feedback round.
// `npm run yayinla -- --kuru`  —  the same wait, changing nothing (below).
//
// This exists because the round it serves REPEATS: my father says something is
// wrong, I fix it, and it has to reach him. That is four steps done in the
// same order every time (bump, commit, tag, push), and the one that gets
// forgotten is the tag — which is exactly the one the three download links
// depend on. A forgotten tag looks like a successful release: the site updates
// (push -> site.yml -> Pages) and the .html/.zip/.exe silently stay old.
//
// It does NOT build anything and does not upload anything. Two workflows do
// that, and they are triggered by what this pushes:
//
//   push main   -> ci.yml (green) -> site.yml -> GitHub Pages  (the site route)
//               -> windows.yml (Windows E2E; the site does not wait for it)
//   push vX.Y.Z -> surum.yml                  -> Release       (the three files)
//
// So the order is: commit, push main ALONE, wait for that commit's ci.yml run
// AND its windows.yml run, and only when both are green tag it and push the
// tag. The tag used to go in the same push as the commit, i.e. before any test
// had looked at it (2026-10-08); the Windows run joined on 2026-10-09, because
// the tag is what reaches my father's exe and his machine is Windows. A red
// run stops here with the commit pushed and no tag. The site may already have
// changed then (it waits for ci.yml alone), the exe has not. Fix, push, and
// give the same command again; package.json already at the version means "tag
// only".
//
// `--kuru` (dry run) changes nothing: it takes HEAD, which must already be
// pushed, finds and waits for its ci.yml and windows.yml runs, says the
// result, and stops where the tag would be cut.
//
// Refuses outside the main checkout or off `main`, on a dirty tree, on a tag
// that exists, and without a logged-in `gh`. Every one of those has a right
// answer that is not "guess".

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { closeUnreleased, releasedVersions, unreleasedBody } from './changelog-md.mjs';
import { git as gitKomut, yayinYeriSorunu } from './git-komut.mjs';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// A command that fails stops the release with a sentence, never a stack.
function git(...args) {
  try {
    return gitKomut(KOK, ...args);
  } catch (e) {
    dur(e.message.split('\n')[0], ...girintili(e.gitCevabi));
  }
}

function girintili(metin) {
  return metin === '' ? [] : ["git'in cevabı:", ...metin.split('\n').map((x) => `  ${x}`)];
}

function dur(mesaj, ...cozum) {
  console.error(`\n  ${mesaj}\n`);
  for (const satir of cozum) console.error(`      ${satir}`);
  console.error('');
  process.exit(1);
}

// `gh`, read as text; `miras` hands the terminal to it (the live run view).
function gh(args, miras = false) {
  return spawnSync('gh', args, {
    cwd: KOK,
    encoding: 'utf8',
    stdio: miras ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });
}

// Asked BEFORE anything is written: without gh the wait below cannot happen,
// and finding that out after the version commit is pushed leaves half a release.
function ghHazir() {
  const r = gh(['auth', 'status']);
  if (r.error) dur('gh bulunamadı; CI beklenemez.', 'https://cli.github.com', 'gh auth login');
  if (r.status !== 0) dur('gh oturumu açık değil; CI beklenemez.', 'gh auth login');
}

const bekle = (ms) => new Promise((tamam) => setTimeout(tamam, ms));

// The `is` run (ci.yml, windows.yml) of exactly this commit, waited for to the
// end. Returns only on green; anything else (red, cancelled by a newer push,
// never appeared) stops.
async function kosuYesilMi(is, sha, kirmizidaNe) {
  const kisa = sha.slice(0, 7);
  let kosu;
  // A push needs a few seconds to become a run. Six minutes is generous.
  for (let i = 0; i < 36 && kosu === undefined; i++) {
    if (i > 0) await bekle(10_000);
    const r = gh([
      'run',
      'list',
      '--workflow',
      is,
      '--commit',
      sha,
      '--limit',
      '5',
      '--json',
      'databaseId,status,conclusion,url',
    ]);
    if (r.status !== 0) dur('gh run list olmadı.', ...girintili(r.stderr.trim()));
    kosu = JSON.parse(r.stdout)[0];
  }
  if (kosu === undefined) {
    dur(`${kisa} için ${is} koşusu altı dakikada görünmedi.`, ...kirmizidaNe);
  }
  console.log(`\n  ${kisa} · ${is} koşusu ${kosu.databaseId}: ${kosu.url}\n`);
  if (kosu.status !== 'completed') {
    gh(['run', 'watch', String(kosu.databaseId), '--compact', '--interval', '20'], true);
  }
  const son = gh(['run', 'view', String(kosu.databaseId), '--json', 'conclusion,url']);
  if (son.status !== 0) dur('gh run view olmadı.', ...girintili(son.stderr.trim()));
  const { conclusion } = JSON.parse(son.stdout);
  if (conclusion !== 'success') {
    dur(`${kisa}'in ${is} koşusu yeşil değil: ${conclusion || 'bilinmiyor'}.`, ...kirmizidaNe);
  }
  console.log(`  ${kisa}'in ${is} koşusu yeşil.\n`);
}

// The two runs a tag waits for. ci.yml first: it is the shorter one, and the
// Windows run is started by the same push, so it is already under way.
async function ciYesilMi(sha, kirmizidaNe) {
  await kosuYesilMi('ci.yml', sha, kirmizidaNe);
  await kosuYesilMi('windows.yml', sha, kirmizidaNe);
}

// The first gate, before the arguments are even read: a release run from a
// branch or a worktree stops with one sentence, whatever else it was given.
// Pages publishes from main, so a release cut anywhere else would ship a
// Release my father's site route never sees. Two different programs.
let yerSorunu;
try {
  yerSorunu = yayinYeriSorunu(KOK);
} catch (e) {
  dur(e.message.split('\n')[0], ...girintili(e.gitCevabi));
}
if (yerSorunu !== null) dur(yerSorunu);

const argumanlar = process.argv.slice(2);
const kuru = argumanlar.includes('--kuru');
const surum = argumanlar.find((a) => a !== '--kuru');

// ------------------------------------------------------------------ kuru
if (kuru) {
  if (surum !== undefined && !/^\d+\.\d+\.\d+$/.test(surum)) {
    dur(
      `"${surum}" bir sürüm numarası değil.`,
      'npm run yayinla -- --kuru',
      'npm run yayinla -- --kuru 1.2.0',
    );
  }
  ghHazir();
  if (git('status', '--porcelain') !== '') {
    dur('Çalışma ağacı temiz değil.', 'git status', 'git add -A && git commit');
  }
  git('fetch', '--quiet', 'origin', 'main');
  const bas = git('rev-parse', 'HEAD');
  if (bas !== git('rev-parse', 'origin/main')) {
    dur(
      "HEAD origin/main'de değil; kuru koşu yalnız itilmiş bir commit'in CI'ını bekler.",
      'git status -sb',
    );
  }
  await ciYesilMi(bas, ['Gerçek koşu burada dururdu: etiket atılmazdı.']);
  const ad = surum === undefined ? 'etiket' : `v${surum} etiketi`;
  console.log(`  Kuru koşu: gerçek koşu burada ${ad} atar ve iterdi. Hiçbir şey atılmadı.\n`);
  process.exit(0);
}

if (surum === undefined || !/^\d+\.\d+\.\d+$/.test(surum)) {
  dur(
    'Sürüm numarası gerekiyor.',
    'npm run yayinla -- 1.2.0',
    '',
    'Kırık bir şey düzeldiyse son basamak, yeni bir şey geldiyse ortadaki.',
  );
}
const etiket = `v${surum}`;

// ---------------------------------------------------------------- kapılar
if (git('status', '--porcelain') !== '') {
  dur('Çalışma ağacı temiz değil.', 'git status', 'git add -A && git commit');
}

ghHazir();

const etiketler = git('tag', '--list', etiket);
if (etiketler !== '') {
  dur(
    `${etiket} etiketi zaten var.`,
    'Yayınlanmış bir sürümün üstüne yazılmaz — bir sonraki numarayı verin.',
  );
}

// The FOURTH gate, and the newest: `src/platform/changelog.ts` (Ayarlar → Hakkında'nın
// "Yenilikler" paneli) is hand-edited once per release, same as this file's
// own bump. Nothing here reads it at build time to check itself, so a
// forgotten entry ships silently — the exact failure this whole script exists
// to stop, applied to a fourth step nobody used to check. Not built (no TS
// loader here), so the top entry's version is read out with a regex, the same
// way `cargoSurumuYaz` edits Cargo.toml as text rather than as TOML.
const changelogYol = resolve(KOK, 'src', 'platform', 'changelog.ts');
const changelogMetin = readFileSync(changelogYol, 'utf8');
const changelogEslesme = /SURUM_NOTLARI[\s\S]*?version:\s*'([^']+)'/.exec(changelogMetin);
if (changelogEslesme === null) {
  dur("src/platform/changelog.ts içinde SURUM_NOTLARI'nin ilk sürümü bulunamadı.");
}
const changelogSurumu = changelogEslesme[1];
if (changelogSurumu !== surum) {
  dur(
    `src/platform/changelog.ts'in en üstündeki sürüm "${changelogSurumu}", yayınlanan "${surum}" değil.`,
    'Yenilikler panelinin bu sürümden hiç haberi olmaz.',
    `SURUM_NOTLARI[0].version'ı "${surum}" yapın, o girdinin items[]'ını doldurun, sonra yayınlayın.`,
  );
}

// The FIFTH gate: CHANGELOG.md, the history people outside the repository
// read. This script closes its Unreleased block under the version it
// publishes, so an empty block would publish an empty entry. Already closed
// under this version is fine: that is a release whose bump was done by hand.
const changelogMdYol = resolve(KOK, 'CHANGELOG.md');
const changelogMdMetin = readFileSync(changelogMdYol, 'utf8');
const changelogMdKapali = releasedVersions(changelogMdMetin)[0]?.version === surum;
const unreleased = unreleasedBody(changelogMdMetin);
if (unreleased === null) {
  dur('CHANGELOG.md içinde "## [Unreleased]" başlığı yok.');
}
if (!changelogMdKapali && unreleased === '') {
  dur(
    "CHANGELOG.md'nin Unreleased bloğu boş.",
    'Bu sürümde kullanıcının göreceği ne değiştiyse Added / Changed / Fixed / Removed altına yazın, sonra yayınlayın.',
  );
}

// Closes Unreleased under this version, once. Local date, not UTC: the release
// is dated by the day it happened where it happened.
function changelogKapat() {
  if (changelogMdKapali) return;
  const simdi = new Date();
  const iki = (n) => String(n).padStart(2, '0');
  const tarih = `${simdi.getFullYear()}-${iki(simdi.getMonth() + 1)}-${iki(simdi.getDate())}`;
  writeFileSync(changelogMdYol, closeUnreleased(changelogMdMetin, surum, tarih), 'utf8');
}

// ------------------------------------------------------------------ yaz
const yol = resolve(KOK, 'package.json');
const metin = readFileSync(yol, 'utf8');
const pkg = JSON.parse(metin);
const onceki = pkg.version;

// The SECOND copy of the number, and the only one left.
//
// tauri.conf.json used to hold a third; it now reads `../package.json`, which
// Tauri resolves itself. Cargo.toml cannot do that — cargo will not read a
// version out of another file — so it is written here instead of being left
// to drift. Drifting mattered the day the exe learned to update itself: the
// number it compares against a release is the number it was built with, and a
// stale one means the program either never offers an update or offers one
// forever. `surum.test.ts` fails if the two ever disagree.
const cargoYol = resolve(KOK, 'src-tauri', 'Cargo.toml');

function cargoSurumuYaz(hedef) {
  const eski = readFileSync(cargoYol, 'utf8');
  // Anchored to the line: `Cargo.toml` also carries `rust-version` and a
  // `version` under every `[dependencies]` entry, and a loose replace would
  // pick whichever came first.
  const satir = /^version = "\d+\.\d+\.\d+"$/m;
  // "The line is missing" and "the line already says this" are DIFFERENT
  // answers, and collapsing them into one `yeni === eski` stopped a release
  // dead on the very path this branch exists to serve: package.json bumped by
  // hand, so Cargo.toml is usually already in step, so the replace changes
  // nothing — which is CORRECT, not a missing line.
  if (!satir.test(eski)) dur('src-tauri/Cargo.toml içindeki "version" satırı bulunamadı.');
  const yeni = eski.replace(satir, `version = "${hedef}"`);
  // Written only when something changed: a no-op write dirties the tree, and
  // the gate at the top of this file refuses a dirty tree.
  if (yeni !== eski) writeFileSync(cargoYol, yeni, 'utf8');
}

// package.json ALREADY at this version is not an error, and refusing was
// wrong. It is the normal state after a round that bumped it by hand, and
// refusing then puts the TAG out of this script's reach, which is the one
// step it exists to stop anybody forgetting.
if (onceki === surum) {
  console.log(`\n  package.json zaten ${surum}; yalnız etiket atılıyor.\n`);
  // ...but Cargo.toml may still be behind, because bumping package.json by
  // hand is exactly the path that leaves it behind.
  cargoSurumuYaz(surum);
  changelogKapat();
  if (git('status', '--porcelain') !== '') {
    console.log('  src-tauri/Cargo.toml ya da CHANGELOG.md geride kalmıştı, eşitlendi.\n');
    git('add', 'src-tauri/Cargo.toml', 'CHANGELOG.md');
    git('commit', '-m', `Sürüm ${etiket}`);
  }
} else {
  // Rewritten as TEXT rather than JSON.stringify(pkg): re-serialising would
  // reformat a file nobody asked to reformat, and the diff of a release
  // should be one line.
  const yeni = metin.replace(`"version": "${onceki}"`, `"version": "${surum}"`);
  if (yeni === metin) dur('package.json içindeki "version" satırı bulunamadı.');
  writeFileSync(yol, yeni, 'utf8');
  cargoSurumuYaz(surum);
  changelogKapat();

  console.log(`\n  ${onceki} → ${surum}\n`);
  git('add', 'package.json', 'src-tauri/Cargo.toml', 'CHANGELOG.md');
  git('commit', '-m', `Sürüm ${etiket}`);
}

// Main ALONE first, and its CI waited for: the tag is cut only on a commit
// the tests have passed.
//
// Its failure gets its own words, because by now the commit exists and only
// this step is missing: 2.2.0's push fell over on HTTPS with no credentials,
// and what the script printed was a byte dump.
try {
  gitKomut(KOK, 'push', 'origin', 'main');
} catch (e) {
  dur(
    "Push olmadı: sürüm commit'i yerelde duruyor, uzağa gitmedi.",
    ...girintili(e.gitCevabi),
    '',
    'Sebebi giderip (ör. kimlik bilgisi) aynı komutu yeniden verin.',
  );
}

const sha = git('rev-parse', 'HEAD');
await ciYesilMi(sha, [
  `${etiket} etiketi ATILMADI. Site ci.yml yeşilse güncellendi, exe güncellenmedi.`,
  'Düzeltip itin ve aynı komutu yeniden verin; package.json zaten bu sürümde',
  'olduğu için yalnız etiket atılır.',
]);

// ANNOTATED, and that is not a style preference — it is a bug this script
// already had once. `--follow-tags` pushed annotated tags only; a lightweight
// one was skipped WITHOUT A WORD, exit code 0, "Everything up-to-date". The
// first release went out with main pushed, the tag left at home, and surum.yml
// never triggered: exactly the silent half-release this file exists to stop.
// The tag is now pushed by name, and an annotated one still says who and when.
git('tag', '-a', etiket, '-m', `Sürüm ${etiket}`);

try {
  gitKomut(KOK, 'push', 'origin', etiket);
} catch (e) {
  dur(
    `Push olmadı: ${etiket} etiketi yerelde duruyor, uzağa gitmedi.`,
    ...girintili(e.gitCevabi),
    '',
    'Sebebi giderip elle verin:',
    `git push origin ${etiket}`,
  );
}

// ...and then LOOK. The whole point of this script is the step that is easy to
// forget, so believing a push rather than checking it would give the failure
// back its silence.
const uzakta = git('ls-remote', '--tags', 'origin', etiket);
if (uzakta === '') {
  dur(
    `${etiket} uzağa GİTMEDİ — sürüm çıkmayacak; site CI'dan sonra zaten güncellendi.`,
    `git push origin ${etiket}`,
  );
}

console.log(`  ${etiket} itildi ve uzakta görüldü. Site yayında, sürüm koşuyor:\n`);
// The repository was renamed `ders-programi` -> `Mozaik` and these two lines
// were not. The Releases one redirects; the Pages one does NOT — Pages
// publishes a repository by its NAME, so the old address is a plain 404 and
// this script was printing it at the end of every release (B7.11, pitfall 106).
console.log('      site   → https://alparslansemiz.github.io/Mozaik/');
console.log('      sürüm  → https://github.com/AlparslanSemiz/Mozaik/releases/latest');
console.log('');
console.log('  Bitince üç indirme bağlantısının 200 verdiğini görün:\n');
console.log('      Mozaik.html · Mozaik-Windows-kurulum.zip · Mozaik.exe');
console.log('');
