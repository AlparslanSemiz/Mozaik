// `npm run yayinla -- 1.2.0`  —  one command per feedback round.
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
//   push main   -> site.yml   -> GitHub Pages  (my father's site route)
//   push vX.Y.Z -> surum.yml  -> Release       (the three downloadable files)
//
// Refuses on a dirty tree, on a non-main branch, and on a tag that exists.
// Every one of those has a right answer that is not "guess".

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function git(...args) {
  return execFileSync('git', args, { cwd: KOK, stdio: ['ignore', 'pipe', 'pipe'] })
    .toString()
    .trim();
}

function dur(mesaj, ...cozum) {
  console.error(`\n  ${mesaj}\n`);
  for (const satir of cozum) console.error(`      ${satir}`);
  console.error('');
  process.exit(1);
}

const surum = process.argv[2];
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

const dal = git('rev-parse', '--abbrev-ref', 'HEAD');
if (dal !== 'main') {
  // Pages publishes from main, so a release cut anywhere else would ship a
  // Release my father's site route never sees. Two different programs.
  dur(`Dal "${dal}", "main" değil.`, 'git switch main');
}

const etiketler = git('tag', '--list', etiket);
if (etiketler !== '') {
  dur(
    `${etiket} etiketi zaten var.`,
    'Yayınlanmış bir sürümün üstüne yazılmaz — bir sonraki numarayı verin.',
  );
}

// The FOURTH gate, and the newest: `src/changelog.ts` (Ayarlar → Hakkında'nın
// "Yenilikler" paneli) is hand-edited once per release, same as this file's
// own bump. Nothing here reads it at build time to check itself, so a
// forgotten entry ships silently — the exact failure this whole script exists
// to stop, applied to a fourth step nobody used to check. Not built (no TS
// loader here), so the top entry's version is read out with a regex, the same
// way `cargoSurumuYaz` edits Cargo.toml as text rather than as TOML.
const changelogYol = resolve(KOK, 'src', 'changelog.ts');
const changelogMetin = readFileSync(changelogYol, 'utf8');
const changelogEslesme = /SURUM_NOTLARI[\s\S]*?version:\s*'([^']+)'/.exec(changelogMetin);
if (changelogEslesme === null) {
  dur('src/changelog.ts içinde SURUM_NOTLARI\'nin ilk sürümü bulunamadı.');
}
const changelogSurumu = changelogEslesme[1];
if (changelogSurumu !== surum) {
  dur(
    `src/changelog.ts'in en üstündeki sürüm "${changelogSurumu}", yayınlanan "${surum}" değil.`,
    'Yenilikler panelinin bu sürümden hiç haberi olmaz.',
    `SURUM_NOTLARI[0].version'ı "${surum}" yapın, o girdinin items[]'ını doldurun, sonra yayınlayın.`,
  );
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
  if (git('status', '--porcelain') !== '') {
    console.log('  src-tauri/Cargo.toml geride kalmıştı, eşitlendi.\n');
    git('add', 'src-tauri/Cargo.toml');
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

  console.log(`\n  ${onceki} → ${surum}\n`);
  git('add', 'package.json', 'src-tauri/Cargo.toml');
  git('commit', '-m', `Sürüm ${etiket}`);
}

// ANNOTATED, and that is not a style preference — it is a bug this script
// already had once. `--follow-tags` pushes annotated tags only; a lightweight
// one is skipped WITHOUT A WORD, exit code 0, "Everything up-to-date". The
// first release went out with main pushed, the tag left at home, and surum.yml
// never triggered: exactly the silent half-release this file exists to stop.
git('tag', '-a', etiket, '-m', `Sürüm ${etiket}`);

// One push, both refs: two pushes is two chances to do half of it.
git('push', '--follow-tags', 'origin', 'main');

// ...and then LOOK. The whole point of this script is the step that is easy to
// forget, so believing a push rather than checking it would give the failure
// back its silence.
const uzakta = git('ls-remote', '--tags', 'origin', etiket);
if (uzakta === '') {
  dur(
    `${etiket} uzağa GİTMEDİ — sürüm çıkmayacak, yalnız site güncellenecek.`,
    `git push origin ${etiket}`,
  );
}

console.log(`  ${etiket} itildi ve uzakta görüldü. İki iş akışı da koşuyor:\n`);
console.log('      site   → https://alparslansemiz.github.io/ders-programi/');
console.log('      sürüm  → https://github.com/AlparslanSemiz/ders-programi/releases/latest');
console.log('');
console.log('  Bitince üç indirme bağlantısının 200 verdiğini görün:\n');
console.log('      Mozaik.html · Mozaik-Windows-kurulum.zip · Mozaik.exe');
console.log('');
