#!/usr/bin/env node
/**
 * Regenerates src/fonts/IBMPlexSans-subset.woff2 — the face embedded in
 * dist/index.html as a data: URI.
 *
 * Until now that file was an artefact with no recipe: 23 KB of woff2 that
 * nobody could rebuild, so the weight axis could not be touched. The whole
 * cost of "the axis is clipped at 600" was that.
 *
 * Two steps, both fontTools:
 *   1. varLib.instancer   clip wght to WEIGHT_RANGE, pin wdth to 100
 *   2. subset             keep CHARSET, drop hinting, keep kerning
 *
 * The source face is committed next to this script (OFL 1.1, see its
 * OFL.txt), so this runs OFFLINE and reproduces byte-for-byte. Nothing here
 * touches the app: it is a workshop tool, run by hand when the axis or the
 * charset changes, and its output is committed.
 *
 * Needs a python3 with `fonttools` and `brotli`:
 *     python3 -m venv .venv && .venv/bin/pip install fonttools brotli
 *     npm run font                       (finds .venv automatically)
 *     npm run font -- --python /path/to/python3
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, statSync, copyFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'scripts/font-source/IBMPlexSansVar-Roman.woff2');
const OUTPUT = join(root, 'src/fonts/IBMPlexSans-subset.woff2');

/* The axis this tool actually asks for.
 *
 * MEASURED, 2026-08-27, from the same source face and the same charset:
 *
 *     wght 400:600   23 728 bayt     (what shipped until today)
 *     wght 400:700   24 416 bayt     +1 084
 *     wght 350:700   31 212 bayt     +7 880
 *     wght 300:700   31 932 bayt     +8 600
 *
 * The step down to 350 costs eight times what the step up to 700 costs,
 * because everything below 400 needs a second set of deltas. styles.css
 * asks for 700 in five rules and for 300 in none, so the range stops at
 * 400: principle 5, do not buy a weight nothing uses.
 *
 * The five rules asking for 700 were silently getting 600 — a variable font
 * CLAMPS, it does not fail. Measured on the digit "0": outline delta between
 * wght 600 and wght 700 was 0.0 with the old face, 406.5 with this one. */
const WEIGHT_RANGE = '400:700';

/* The 225 codepoints this tool can draw. Written out rather than derived
 * from the previous output, so the subset has a stated reason to be this
 * size and a new glyph is a visible edit here. */
const CHARSET = [
  ...range(0x20, 0x7e), //  ASCII printable
  ...range(0xa0, 0xff), //  Latin-1 supplement: nbsp, °, ½, accented Latin
  ...'ĐđĞğİıŒœŞşŠšŸŽž', // Latin Extended-A: Turkish Ğ İ ı Ş, and the rest
  //                       of what a pasted name can carry
  ...'–—‘’“”•…‹›⁄€₺',  // punctuation and currency the interface prints
  ...'←↑→↓−≈',           // arrows for reordering, real minus, approx in reports
].map((c) => (typeof c === 'number' ? c : c.codePointAt(0)));

function range(a, b) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

function findPython() {
  const flag = process.argv.indexOf('--python');
  if (flag !== -1 && process.argv[flag + 1]) return process.argv[flag + 1];
  for (const p of [join(root, '.venv/bin/python3'), 'python3']) {
    try {
      execFileSync(p, ['-c', 'import fontTools, brotli'], { stdio: 'ignore' });
      return p;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

const python = findPython();
if (!python) {
  console.error(
    'fontTools bulunamadı. Bir kez şunu çalıştır:\n' +
      '    python3 -m venv .venv && .venv/bin/pip install fonttools brotli\n' +
      'ya da: npm run font -- --python /başka/python3',
  );
  process.exit(1);
}
if (!existsSync(SOURCE)) {
  console.error(`Kaynak yüz yok: ${SOURCE}`);
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), 'plex-'));
const instanced = join(work, 'instanced.ttf');
const unicodes = join(work, 'unicodes.txt');
writeFileSync(unicodes, CHARSET.map((c) => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')).join(','));

const before = existsSync(OUTPUT) ? statSync(OUTPUT).size : 0;

execFileSync(python, ['-m', 'fontTools.varLib.instancer', '-q', '-o', instanced, SOURCE,
  `wght=${WEIGHT_RANGE}`, 'wdth=100'], { stdio: 'inherit' });

execFileSync(python, ['-m', 'fontTools.subset', instanced,
  `--unicodes-file=${unicodes}`,
  '--flavor=woff2',
  `--output-file=${OUTPUT}`,
  /* No hinting: the grid is read at 12-16px on a 1920x1080 desktop where
     Chromium ignores TrueType instructions anyway, and they were 4 KB. */
  '--no-hinting',
  /* Kerning is the one layout feature this tool can see: names sit next to
     each other in a 9ch column. ccmp/locl keep Turkish composition right,
     mark/mkmk keep accents attached. liga is dropped on purpose — nothing
     here reads better as "fi". */
  '--layout-features=kern,ccmp,locl,mark,mkmk',
  '--desubroutinize',
], { stdio: 'inherit' });

const after = statSync(OUTPUT).size;
const delta = after - before;
console.log(
  `\n${OUTPUT.replace(root + '/', '')}\n` +
    `  eksen     wght ${WEIGHT_RANGE}\n` +
    `  karakter  ${CHARSET.length}\n` +
    `  boyut     ${after} bayt` +
    (before ? `  (${delta >= 0 ? '+' : ''}${delta}, dist'te base64 ~${delta >= 0 ? '+' : ''}${Math.round((delta * 4) / 3)})` : '') +
    `\n\nBoyut değiştiyse docs/STATUS.md'ye yaz — bağımlılık politikasının tek şartı ölçmek.`,
);
copyFileSync(join(root, 'scripts/font-source/OFL.txt'), join(root, 'src/fonts/OFL.txt'));
