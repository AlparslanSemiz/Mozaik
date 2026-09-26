// The GitHub Release page of one version: what is new in it, and how to
// install. `surum.yml` runs this when a tag is pushed and hands the output to
// `gh release create --notes-file`.
//
//   node scripts/surum-notu.mjs 2.2.0 [kök] > notlar.md
//
// Three parts, all read from files already kept by hand for each release:
//   - the Turkish lines of `src/platform/changelog.ts`, the ones Ayarlar →
//     Hakkında shows, because the Release page is read by the father too;
//   - the version's section of CHANGELOG.md, the full English history;
//   - `.github/surum-notu.md`, the install and download text every release
//     shares.
// The page used to be the third part alone, so no release said what it
// brought (the user's request, 2026-09-26). A version with neither lines nor
// a section stops the run: an empty "what is new" is the silent half-release
// `yayinla.mjs` exists to prevent.

import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The body under `## [version] - date` in CHANGELOG.md, trimmed; null if the version has no section. */
export function changelogSection(changelogMd, version) {
  const escaped = version.replace(/\./g, '\\.');
  const head = new RegExp(`^## \\[${escaped}\\] - \\d{4}-\\d{2}-\\d{2}[ \\t]*$`, 'm');
  const m = head.exec(changelogMd);
  if (m === null) return null;
  const rest = changelogMd.slice(m.index + m[0].length);
  const next = rest.search(/^## /m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

/** The Turkish lines of one version in src/platform/changelog.ts, read as text (no TS loader here). */
export function inAppLines(changelogTs, version) {
  const at = changelogTs.indexOf(`version: '${version}'`);
  if (at === -1) return [];
  const open = changelogTs.indexOf('items: [', at);
  const close = changelogTs.indexOf('],', open);
  if (open === -1 || close === -1) return [];
  const block = changelogTs.slice(open + 'items: ['.length, close);
  const lines = [];
  for (const m of block.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)) {
    lines.push((m[1] ?? m[2]).replace(/\\(['"\\])/g, '$1'));
  }
  return lines;
}

/** The whole page. Throws when the version has nothing to say. */
export function releaseNotes(version, { changelogMd, changelogTs, install }) {
  const lines = inAppLines(changelogTs, version);
  const section = changelogSection(changelogMd, version);
  if (lines.length === 0 || section === null || section === '') {
    throw new Error(
      `${version} için yenilik yok: changelog.ts'te ${lines.length} satır, CHANGELOG.md'de ${section === null ? 'bölüm yok' : 'bölüm boş'}.`,
    );
  }
  return [
    `## Yenilikler (${version})`,
    '',
    ...lines.map((x) => `- ${x}`),
    '',
    `## What's new in ${version}`,
    '',
    section.replace(/^### /gm, '#### '),
    '',
    '---',
    '',
    install.trim(),
    '',
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const version = process.argv[2];
  if (version === undefined || !/^\d+\.\d+\.\d+$/.test(version)) {
    console.error('Sürüm numarası gerekiyor: node scripts/surum-notu.mjs 2.2.0 [kök]');
    process.exit(1);
  }
  const kok = resolve(process.argv[3] ?? join(dirname(fileURLToPath(import.meta.url)), '..'));
  const read = (p) => readFileSync(join(kok, p), 'utf8');
  try {
    process.stdout.write(
      releaseNotes(version, {
        changelogMd: read('CHANGELOG.md'),
        changelogTs: read('src/platform/changelog.ts'),
        install: read('.github/surum-notu.md'),
      }),
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
