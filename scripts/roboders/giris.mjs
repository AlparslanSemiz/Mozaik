// `node scripts/roboders/giris.mjs [--hedef eyotek]`: the user logs in to
// Roboders (or Eyotek), by hand, and the session is kept for the guarded tour.
//
// The ONE unguarded window, and that is unavoidable: logging in is a POST, and
// koruma.mjs aborts every POST. So this script does as little as it can. It
// opens the start page, waits for the user to log in and press Enter, saves
// the session and closes. It clicks nothing and types nothing; the password
// goes from the user's keyboard into Roboders' own form and never passes
// through this code, a file or the chat.
//
// The session lands in scratch/<hedef>/oturum.json, outside git, readable by
// this user alone. It is not a password but it opens the account, so
// `--sil` deletes it, and every tour ends with that.
//
//   node scripts/roboders/giris.mjs [--hedef eyotek]         log in, save the session
//   node scripts/roboders/giris.mjs [--hedef eyotek] --sil   delete the saved session

import { chmodSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';
import { hedefSec } from './koruma.mjs';

const { values: argv } = parseArgs({
  options: {
    sil: { type: 'boolean', default: false },
    hedef: { type: 'string', default: 'roboders' },
  },
});
let hedef;
try {
  hedef = hedefSec(argv.hedef);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const OTURUM = hedef.oturum;
const ADI = hedef.ad === 'eyotek' ? 'Eyotek' : 'Roboders';

if (argv.sil) {
  rmSync(OTURUM, { force: true });
  console.log(existsSync(OTURUM) ? `Silinemedi: ${OTURUM}` : 'Oturum dosyası yok.');
  process.exit(0);
}

mkdirSync(hedef.klasor, { recursive: true, mode: 0o700 });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  serviceWorkers: 'block',
  acceptDownloads: false,
  viewport: { width: 1920, height: 1080 },
  locale: 'tr-TR',
});
const page = await context.newPage();
await page.goto(hedef.baslangic);

const soru = createInterface({ input: process.stdin, output: process.stdout });
await soru.question(
  [
    '',
    `  Tarayıcıda ${ADI} hesabına kendin gir.`,
    "  Girdikten sonra hiçbir şeye tıklama; buraya dön ve Enter'a bas.",
    '  (Vazgeçmek için Ctrl+C: hiçbir şey kaydedilmez.)',
    '',
  ].join('\n'),
);
soru.close();

await context.storageState({ path: OTURUM, indexedDB: true });
chmodSync(OTURUM, 0o600);
await browser.close();
console.log(
  `Oturum kaydedildi: ${OTURUM}\nTur bitince: node scripts/roboders/giris.mjs --hedef ${hedef.ad} --sil`,
);
