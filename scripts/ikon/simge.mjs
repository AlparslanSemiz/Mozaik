// site/icon.svg -> icon-192.png and icon-512.png.
//
// No image library: Chromium is already installed for Playwright and renders
// the SVG better than anything we could add as a dependency. The PNGs are
// COMMITTED, so `npm run build:site` never needs a browser.
//
//   node scripts/ikon/simge.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const svg = readFileSync(resolve('site/icon.svg'), 'utf8');
const browser = await chromium.launch();

for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  const out = `site/icon-${size}.png`;
  await page.locator('svg').screenshot({ path: out, omitBackground: true });
  console.log('yazıldı:', out);
  await page.close();
}

await browser.close();
