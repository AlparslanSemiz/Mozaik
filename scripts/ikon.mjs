// site/icon.svg -> kurulum/icon.ico
//
// The .lnk on my father's desktop needs an .ico; nothing else in this project
// does, which is why this is a separate script from simge.mjs rather than a
// flag on it. Same trick as that one: Chromium is already installed for
// Playwright and renders the SVG better than any library we could add, so
// there is no new dependency — and the .ico is COMMITTED, so building the
// installation folder never needs a browser.
//
// The container is written by hand because it is 6 + 16*N bytes of header and
// then the PNGs unchanged. Windows Vista and later accept PNG inside ICO, and
// the target is Windows 10/11.
//
//   node scripts/ikon.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// 16 is the tab and the tree; 32 the desktop; 48 the taskbar; 256 the "extra
// large icons" view. 64 and 128 are in between and cost 20 KB together.
//
// TWO SOURCES, and the threshold was measured rather than picked. The detailed
// mark was rendered at 16/32/48/256 and looked at: at 48 and up it is clean,
// at 32 it is busy, and at 16 its six columns merge into a blue smear that
// cannot be told apart from its neighbours in a row of tabs. So below 48 the
// simplified variant is used — same idea, three columns instead of six, no
// ghost columns. This is what real icon sets do.
const SIZES = [16, 32, 48, 64, 128, 256];
const SADE_ALTINDA = 48;

const detay = readFileSync(resolve('site/icon.svg'), 'utf8');
const sade = readFileSync(resolve('site/icon-small.svg'), 'utf8');
const browser = await chromium.launch();
const images = [];

for (const size of SIZES) {
  const svg = size < SADE_ALTINDA ? sade : detay;
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  images.push({ size, png: await page.locator('svg').screenshot({ omitBackground: true }) });
  await page.close();
}
await browser.close();

const HEADER = 6;
const ENTRY = 16;
const dir = Buffer.alloc(HEADER + ENTRY * images.length);
dir.writeUInt16LE(0, 0); // reserved
dir.writeUInt16LE(1, 2); // 1 = icon (2 would be a cursor)
dir.writeUInt16LE(images.length, 4);

let offset = dir.length;
for (const [i, { size, png }] of images.entries()) {
  const at = HEADER + ENTRY * i;
  // 256 does not fit in a byte and the format says so: 0 MEANS 256.
  dir.writeUInt8(size === 256 ? 0 : size, at + 0);
  dir.writeUInt8(size === 256 ? 0 : size, at + 1);
  dir.writeUInt8(0, at + 2); // palette size — 0 for true colour
  dir.writeUInt8(0, at + 3); // reserved
  dir.writeUInt16LE(1, at + 4); // colour planes
  dir.writeUInt16LE(32, at + 6); // bits per pixel
  dir.writeUInt32LE(png.length, at + 8);
  dir.writeUInt32LE(offset, at + 12);
  offset += png.length;
}

const out = resolve('kurulum/icon.ico');
writeFileSync(out, Buffer.concat([dir, ...images.map((i) => i.png)]));
const hangi = SIZES.map((n) => `${n}${n < SADE_ALTINDA ? '·sade' : ''}`).join(', ');
console.log(`yazıldı: ${out} — ${hangi} px, ${offset} bayt`);
