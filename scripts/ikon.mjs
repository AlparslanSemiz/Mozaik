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

// EVERY size Windows actually asks for, and that list is longer than it looks.
// 16 is the tree and the small tab; 20 and 24 are small taskbar buttons and
// list views; 32 is the taskbar at 100%, 40 at 125%, 48 at 150%; 256 is the
// "extra large icons" view, with 64 and 128 in between.
//
// 20, 24 and 40 were MISSING, and that was the visible bug: an .ico that does
// not carry the size being asked for gets one scaled from the nearest, so a
// taskbar at 125% was blowing 32 px up to 40 and my father saw a soft, mushy
// mark. Nothing in the code was wrong; the file just did not have the picture.
//
// TWO SOURCES, and the threshold is measured, not picked. Both drawings were
// rendered at 16/20/24/32/40/48 on light and dark strips and looked at
// (scripts/ikon-karsilastir.mjs, scratch/ikon-boylar.png).
//
// The line moved TWICE, and the second move is the interesting one.
//
//   48 -> 32  because the taskbar is a 32 px slot at normal scaling and it was
//             being handed the simplified three-column mark, which next to the
//             real logo reads as a placeholder rather than as the program.
//   32 -> 20  because that was still wrong, and the report came back a second
//             time: "windowsta alttaki barda uygulamanın logosu küçük çizim,
//             onun büyük çizim olması lazım."
//
// The mistake in the 32 was an ASSUMPTION about Windows, not about pixels:
// Windows 11 asks for 24 at 100 % scaling, not 32, so 24 was the size actually
// reaching the taskbar and 24 sat just under the line. Reading the sheet again
// with that in mind:
//
//   16        detailed collapses into a blue smear; its six columns merge
//   20 · 24   detailed is mushy but the columns are TELLABLE, and it is the
//             real mark rather than a stand-in
//   32 +      detailed reads cleanly
//
// So 16 keeps the simplified drawing, because there the detailed one is not a
// worse logo but no logo at all. Everything a taskbar can ask for is detailed
// at every scaling — which is what the complaint asked for, and this time it
// does not depend on guessing which size Windows picks.
const SIZES = [16, 20, 24, 32, 40, 48, 64, 128, 256];
const SADE_ALTINDA = 20;

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
