// site/icon.svg vs site/icon-small.svg -> scratch/ikon-boylar.png
//
// Not a test: a picture to LOOK at, and the recipe for a decision. `ikon.mjs`
// has a threshold in it (`SADE_ALTINDA`) and that number is not arguable from
// the code — it is arguable from the pixels. This renders both drawings at
// every size Windows actually asks for on a taskbar (32 at 100 %, 40 at 125 %,
// 48 at 150 %, 24 for small buttons) on a light and a dark strip, at true size
// and blown up.
//
// It lives in scripts/ rather than scratch/ for pitfall 69's reason: the .ico
// is committed, so what decides its contents has to be committed too, or the
// threshold freezes the day somebody redraws the mark.
//
//   node scripts/ikon-karsilastir.mjs   -> scratch/ikon-boylar.png
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SIZES = [16, 20, 24, 32, 40, 48];
const detay = readFileSync(resolve('site/icon.svg'), 'utf8');
const sade = readFileSync(resolve('site/icon-small.svg'), 'utf8');

const browser = await chromium.launch();
const cells = [];
for (const [ad, svg] of [['ayrıntılı', detay], ['sade', sade]]) {
  for (const size of SIZES) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(
      `<style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
    );
    const png = await page.locator('svg').screenshot({ omitBackground: true });
    cells.push({ ad, size, uri: `data:image/png;base64,${png.toString('base64')}` });
    await page.close();
  }
}

// One sheet: true size on top, 6x blown up underneath, on both a light and a
// dark strip because a taskbar is dark and the tab bar is not.
const row = (ad, zoom, bg, ink) =>
  `<tr style="background:${bg};color:${ink}"><th>${ad}</th>` +
  SIZES.map((s) => {
    const c = cells.find((x) => x.ad === ad.split(' ')[0] && x.size === s);
    return `<td><img src="${c.uri}" style="width:${s * zoom}px;height:${s * zoom}px;image-rendering:pixelated"></td>`;
  }).join('') +
  '</tr>';

const html = `<style>
 body{font:13px system-ui;background:#fff;margin:24px}
 table{border-collapse:collapse} td{padding:10px;text-align:center;vertical-align:bottom}
 th{padding:10px;text-align:right;font-weight:600;white-space:nowrap}
 caption{text-align:left;padding:6px 0 12px;font-weight:700}
</style>
<table>
 <caption>Gerçek boyut, sonra 6 kat büyütülmüş. Sütunlar: ${SIZES.join(' · ')} px</caption>
 <tr><th></th>${SIZES.map((s) => `<td>${s}</td>`).join('')}</tr>
 ${row('ayrıntılı', 1, '#fff', '#111')}
 ${row('sade', 1, '#fff', '#111')}
 ${row('ayrıntılı', 1, '#1f2430', '#eee')}
 ${row('sade', 1, '#1f2430', '#eee')}
 ${row('ayrıntılı', 6, '#fff', '#111')}
 ${row('sade', 6, '#fff', '#111')}
</table>`;
mkdirSync('scratch', { recursive: true });
writeFileSync('scratch/ikon-boylar.html', html);

const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });
await page.setContent(html);
await page.locator('table').screenshot({ path: 'scratch/ikon-boylar.png' });
await browser.close();
console.log('yazıldı: scratch/ikon-boylar.png');
