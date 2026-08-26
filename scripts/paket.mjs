// dist-kurulum/ — the ONE folder that goes to my father.
//
// Everything in kurulum/ plus the built site under site\. Nothing is
// generated here that is not already generated somewhere else: this script
// only decides what travels together, so that "which files do I send" is not
// a thing anyone has to remember correctly.
//
// Line endings are forced to CRLF on the way out. .gitattributes already pins
// them in the repository, but the zip may be assembled on this Linux machine
// by someone whose git says otherwise, and Notepad showing OKU.txt as one
// long line is exactly the kind of first impression this folder cannot have.
//
//   npm run paket
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const OUT = resolve('dist-kurulum');
const SITE = resolve('dist-site');
const KURULUM = resolve('kurulum');

if (!existsSync(join(SITE, 'index.html'))) {
  console.error('dist-site/ yok. Önce: npm run build:site');
  process.exit(1);
}
if (!existsSync(join(KURULUM, 'icon.ico'))) {
  console.error('kurulum/icon.ico yok. Önce: node scripts/ikon.mjs');
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// The app, under the name sunucu.ps1 expects.
cpSync(SITE, join(OUT, 'site'), { recursive: true });
for (const name of readdirSync(KURULUM)) {
  cpSync(join(KURULUM, name), join(OUT, name));
}

// CRLF for the three kinds Windows tools read. Byte files (.ico) are not
// touched — rewriting a binary as text is how an icon becomes a broken icon.
for (const name of readdirSync(OUT)) {
  if (!/\.(cmd|ps1|txt)$/i.test(name)) continue;
  const path = join(OUT, name);
  const text = readFileSync(path, 'utf8');
  writeFileSync(path, text.replace(/\r?\n/g, '\r\n'), 'utf8');
}

function total(dir) {
  let sum = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const info = statSync(path);
    sum += info.isDirectory() ? total(path) : info.size;
  }
  return sum;
}

console.log(`${OUT}`);
for (const name of readdirSync(OUT).sort()) {
  const path = join(OUT, name);
  const info = statSync(path);
  const size = info.isDirectory() ? total(path) : info.size;
  console.log(`  ${(info.isDirectory() ? name + '/' : name).padEnd(16)} ${String(size).padStart(8)} bayt`);
}
console.log(`  ${'TOPLAM'.padEnd(16)} ${String(total(OUT)).padStart(8)} bayt`);
