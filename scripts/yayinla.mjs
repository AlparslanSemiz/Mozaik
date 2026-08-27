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

// ------------------------------------------------------------------ yaz
const yol = resolve(KOK, 'package.json');
const metin = readFileSync(yol, 'utf8');
const pkg = JSON.parse(metin);
const onceki = pkg.version;

// package.json ALREADY at this version is not an error, and refusing was
// wrong. It is the normal state after a round that bumped it by hand — and
// refusing then puts the TAG out of this script's reach, which is the one
// step it exists to stop anybody forgetting.
if (onceki === surum) {
  console.log(`\n  package.json zaten ${surum}; yalnız etiket atılıyor.\n`);
} else {
  // Rewritten as TEXT rather than JSON.stringify(pkg): re-serialising would
  // reformat a file nobody asked to reformat, and the diff of a release
  // should be one line.
  const yeni = metin.replace(`"version": "${onceki}"`, `"version": "${surum}"`);
  if (yeni === metin) dur('package.json içindeki "version" satırı bulunamadı.');
  writeFileSync(yol, yeni, 'utf8');

  console.log(`\n  ${onceki} → ${surum}\n`);
  git('add', 'package.json');
  git('commit', '-m', `Sürüm ${etiket}`);
}

git('tag', etiket);

// One push, both refs: two pushes is two chances to do half of it.
git('push', '--follow-tags', 'origin', 'main');

console.log(`  ${etiket} itildi. İki iş akışı da koşuyor:\n`);
console.log('      site   → https://alparslansemiz.github.io/ders-programi/');
console.log('      sürüm  → https://github.com/AlparslanSemiz/ders-programi/releases/latest');
console.log('');
console.log('  Bitince üç indirme bağlantısının 200 verdiğini görün:\n');
console.log('      Ders-Programi.html · Ders-Programi-Windows-kurulum.zip · Ders-Programi.exe');
console.log('');
