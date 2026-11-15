// site/icon.svg -> src-tauri/icons/Mozaik.icns, for the Mac .app.
//
// The same trick as ikon.mjs (Chromium renders the SVG, the result is
// committed, building never needs a browser), and one difference that is the
// reason this is a second script: a Mac icon is NOT full bleed. Since macOS 11
// the Dock, Finder and Launchpad expect the rounded square drawn at 824 of
// 1024 pixels with the rest transparent; a full-bleed mark sits visibly larger
// than every other icon beside it. So each picture is the same drawing, scaled
// to 824/1024 and centred.
//
// The small/detailed threshold is ikon.mjs's own (`SADE_ALTINDA`): only the
// 16 px entry comes from the simplified mark.
//
// `iconutil` is the macOS tool that turns an .iconset folder into .icns, so
// this runs on a Mac only.
//
//   node scripts/ikon-mac.mjs
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

if (process.platform !== 'darwin') {
  console.error('ikon-mac yalnız macOS’te çalışır (iconutil).');
  process.exit(1);
}

const SADE_ALTINDA = 32;
const ORAN = 824 / 1024;
// The .iconset names Apple's tool reads, and the pixel size of each.
const GIRDILER = [
  ['icon_16x16.png', 16],
  ['icon_16x16@2x.png', 32],
  ['icon_32x32.png', 32],
  ['icon_32x32@2x.png', 64],
  ['icon_128x128.png', 128],
  ['icon_128x128@2x.png', 256],
  ['icon_256x256.png', 256],
  ['icon_256x256@2x.png', 512],
  ['icon_512x512.png', 512],
  ['icon_512x512@2x.png', 1024],
];

const detay = readFileSync(resolve('site/icon.svg'), 'utf8');
const sade = readFileSync(resolve('site/icon-small.svg'), 'utf8');
const set = join(mkdtempSync(join(tmpdir(), 'mozaik-ikon-')), 'Mozaik.iconset');
mkdirSync(set);

const browser = await chromium.launch();
for (const [ad, size] of GIRDILER) {
  const svg = size < SADE_ALTINDA ? sade : detay;
  const ic = Math.round(size * ORAN);
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}
      #k{width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center}
      svg{display:block;width:${ic}px;height:${ic}px}</style><div id="k">${svg}</div>`,
  );
  writeFileSync(join(set, ad), await page.locator('#k').screenshot({ omitBackground: true }));
  await page.close();
}
await browser.close();

const out = resolve('src-tauri/icons/Mozaik.icns');
mkdirSync(resolve('src-tauri/icons'), { recursive: true });
execFileSync('iconutil', ['-c', 'icns', set, '-o', out]);
rmSync(join(set, '..'), { recursive: true, force: true });
console.log(`yazıldı: ${out} — ${statSync(out).size} bayt`);
