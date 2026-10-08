// After a red E2E step in CI: runs the failed tests ONCE more and writes which
// of them passed the second time ("kararsız") and which failed again ("kırmızı")
// to the job summary. It never changes the verdict. The step that calls it is
// `continue-on-error` and the job is already red; a retry that turned the job
// green would hide exactly the test this is here to name.
//
// Reads Playwright's `test-results/.last-run.json`, reruns into a separate
// output folder so the first run's traces are kept, and exits 0 unless it could
// not run at all.

import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sonKosu = resolve('test-results', '.last-run.json');
const json = resolve('test-results', 'tekrar', 'sonuc.json');
const ozet = process.env.GITHUB_STEP_SUMMARY;
const argv = process.argv.slice(2); // e.g. --config playwright.cozucu.config.ts

function yaz(satirlar) {
  const metin = satirlar.join('\n') + '\n';
  process.stdout.write(metin);
  if (ozet) appendFileSync(ozet, metin);
}

if (!existsSync(sonKosu)) {
  yaz([
    '### Kararsız mı',
    '',
    `\`${sonKosu}\` yok: E2E hiç koşmadan düştü, tekrar edilecek test yok.`,
  ]);
  process.exit(0);
}
const once = JSON.parse(readFileSync(sonKosu, 'utf8'));
if (!Array.isArray(once.failedTests) || once.failedTests.length === 0) {
  yaz(['### Kararsız mı', '', 'Düşen test kaydı yok (düşen şey testin dışında bir adım).']);
  process.exit(0);
}

const kosu = spawnSync(
  'npx',
  [
    'playwright',
    'test',
    ...argv,
    '--last-failed',
    '--last-failed-file',
    sonKosu,
    '--output',
    'test-results/tekrar',
    '--reporter=json',
    '--retries=0',
  ],
  {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: json },
    // `npx` is `npx.cmd` on Windows, which only a shell finds.
    shell: process.platform === 'win32',
  },
);
if (!existsSync(json)) {
  yaz(['### Kararsız mı', '', `Tekrar koşusu rapor üretmedi (çıkış ${kosu.status}).`]);
  process.exit(1);
}

const kararsiz = [];
const kirmizi = [];
function gez(suite, yol) {
  const ad = suite.title ? [...yol, suite.title] : yol;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      const son = test.results.at(-1)?.status;
      const satir = `- \`${spec.file}:${spec.line}\` ${[...ad.slice(1), spec.title].join(' › ')}`;
      (son === 'passed' ? kararsiz : kirmizi).push(satir);
    }
  }
  for (const alt of suite.suites ?? []) gez(alt, ad);
}
for (const suite of JSON.parse(readFileSync(json, 'utf8')).suites) gez(suite, []);

yaz([
  '### Kararsız mı',
  '',
  `Düşen ${once.failedTests.length} test bir kez daha koşuldu. İş her durumda kırmızı kalır.`,
  '',
  `**Tekrarda geçen, kararsız (${kararsiz.length}):**`,
  ...(kararsiz.length ? kararsiz : ['- yok']),
  '',
  `**Tekrarda da düşen, kırmızı (${kirmizi.length}):**`,
  ...(kirmizi.length ? kirmizi : ['- yok']),
]);
