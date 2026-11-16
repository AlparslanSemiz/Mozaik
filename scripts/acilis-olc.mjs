// `file://` açılışını iki derlemede karşılaştırır: Chromium, CDP ile işlemci 4×
// yavaş, 1920×1080, her koşu taze bağlam, koşular dönüşümlü (taban, dal, dal,
// taban, ...), babanın haftası depoda. WORKLOG'daki elle ölçümlerin (scratch'te
// kalan `ac.cjs`, `olc-tepki.mjs`) depodaki ve CI'daki hâli: `acilis.yml`.
//
//   node scripts/acilis-olc.mjs --taban a/index.html --dal b/index.html \
//     [--veri src/fixtures/tam-dolu-kurs-dizili.json] [--kosu 9] [--hiz 4] \
//     [--ozet $GITHUB_STEP_SUMMARY] [--json sonuc.json] [--butce-ms 0] [--pay 15]
//
// Ölçülenler (ms, gezinmenin başından):
//   load     `loadEventEnd` (WORKLOG'un açılış sayısı)
//   fcp      first-contentful-paint
//   hazir       kabuğun `Okul` düğmesi DOM'a girip bir rAF geçti
//   izgara      `table.grid` DOM'a girip bir rAF geçti (veriyle Program'da açılır)
//   uzunIzgara  ızgaraya kadarki uzun görevlerin (ana iş parçacığında ≥50 ms) toplamı
//   uzun        aynısı, iş durulana kadar (1 s uzun görev gelmeyene, en çok 15 s)
//   tbt         `uzun`un 50 ms üstü kısımları (Total Blocking Time)
//   enUzun      en uzun tek görev
// Eşik: dalın medyanı tabandan %pay'dan fazla yüksekse ya da `--butce-ms`
// verilip dalın `hazir` medyanı onu aşıyorsa `::warning::` yazar. Çıkış kodu
// hep 0 (ölçüm kapı değil); koşu düşerse 1.
import { chromium } from '@playwright/test';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values: a } = parseArgs({
  options: {
    taban: { type: 'string' },
    dal: { type: 'string' },
    veri: { type: 'string', default: 'src/fixtures/tam-dolu-kurs-dizili.json' },
    kosu: { type: 'string', default: '9' },
    hiz: { type: 'string', default: '4' },
    ozet: { type: 'string' },
    json: { type: 'string' },
    'butce-ms': { type: 'string', default: '0' },
    pay: { type: 'string', default: '15' },
  },
});
if (!a.taban || !a.dal) {
  console.error('kullanım: --taban <index.html> --dal <index.html>');
  process.exit(2);
}
const N = Number(a.kosu);
const HIZ = Number(a.hiz);
const BUTCE = Number(a['butce-ms']);
const PAY = Number(a.pay);
const veri = readFileSync(resolve(a.veri), 'utf8');
const derlemeler = {
  taban: pathToFileURL(resolve(a.taban)).href,
  dal: pathToFileURL(resolve(a.dal)).href,
};
const OLCULER = ['load', 'fcp', 'hazir', 'izgara', 'uzunIzgara', 'uzun', 'tbt', 'enUzun'];

// Sayfaya, uygulamanın kodundan önce: veriyi depoya koyar, uzun görevleri toplar.
function hazirlik(v) {
  if (location.protocol !== 'file:') return;
  if (localStorage.getItem('ders-programi') === null) localStorage.setItem('ders-programi', v);
  const uzun = [];
  window.__uzun = uzun;
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) uzun.push([e.startTime, e.duration]);
    }).observe({ type: 'longtask', buffered: true });
  } catch {
    /* longtask yoksa toplam 0 görünür */
  }
  // İlk kez DOM'a girdikleri anın bir rAF sonrası, sayfanın içinden: Playwright'ın
  // yoklama aralığı ölçüye girmesin. Babanın verisiyle program Program sekmesinde
  // açılıyor, `table.grid` tıklamasız gelir.
  const gozcu = new MutationObserver(() => {
    if (window.__hazir === undefined && !gozcu.okul) {
      const okul = [...document.querySelectorAll('button')].some(
        (b) => b.textContent?.trim() === 'Okul',
      );
      if (okul) {
        gozcu.okul = true;
        requestAnimationFrame(() => (window.__hazir = performance.now()));
      }
    }
    if (!gozcu.izgara && document.querySelector('table.grid')) {
      gozcu.izgara = true;
      requestAnimationFrame(() => (window.__izgara = performance.now()));
    }
    if (gozcu.okul && gozcu.izgara) gozcu.disconnect();
  });
  gozcu.observe(document, { childList: true, subtree: true });
}

async function birKosu(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'tr-TR',
  });
  try {
    await context.addInitScript(hazirlik, veri);
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: HIZ });
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForFunction(
      () => window.__hazir !== undefined && window.__izgara !== undefined,
      null,
      {
        timeout: 60_000,
      },
    );
    // Izgaradan sonra işin durulması: 1 s yeni uzun görev gelmeyene kadar (en çok 15 s).
    await page.evaluate(
      () =>
        new Promise((res) => {
          const bitis = performance.now() + 15_000;
          const bak = () => {
            const u = window.__uzun ?? [];
            const sonUzun = u.length ? Math.max(...u.map(([s, d]) => s + d)) : 0;
            const sakin = Math.max(sonUzun, window.__izgara) + 1000;
            if (performance.now() >= sakin || performance.now() >= bitis) res();
            else setTimeout(bak, 100);
          };
          bak();
        }),
    );
    return await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const uzun = window.__uzun ?? [];
      const izgara = window.__izgara;
      const toplam = (l) => l.reduce((t, [, d]) => t + d, 0);
      const engel = (l) => l.reduce((t, [, d]) => t + Math.max(0, d - 50), 0);
      const once = uzun.filter(([s]) => s < izgara);
      return {
        load: nav.loadEventEnd,
        fcp: fcp ? fcp.startTime : NaN,
        hazir: window.__hazir,
        izgara,
        uzunIzgara: toplam(once),
        uzun: toplam(uzun),
        tbt: engel(uzun),
        enUzun: uzun.length ? Math.max(...uzun.map(([, d]) => d)) : 0,
      };
    });
  } finally {
    await context.close();
  }
}

const medyan = (x) => {
  const s = [...x].sort((p, q) => p - q);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const ms = (x) => (Number.isFinite(x) ? Math.round(x).toString() : '—');

const browser = await chromium.launch();
const sonuc = { taban: [], dal: [] };
try {
  // Isınma: ilk açılış diskten okur, ikisinde de bir kez atılır.
  for (const ad of ['taban', 'dal']) await birKosu(browser, derlemeler[ad]);
  for (let i = 0; i < N; i++) {
    const sira = i % 2 === 0 ? ['taban', 'dal'] : ['dal', 'taban'];
    for (const ad of sira) {
      const r = await birKosu(browser, derlemeler[ad]);
      sonuc[ad].push(r);
      console.log(
        `${i + 1}/${N} ${ad.padEnd(5)} ${OLCULER.map((k) => `${k}=${ms(r[k])}`).join(' ')}`,
      );
    }
  }
} finally {
  await browser.close();
}

const satirlar = [];
const uyarilar = [];
for (const k of OLCULER) {
  const t = sonuc.taban.map((r) => r[k]);
  const d = sonuc.dal.map((r) => r[k]);
  const mt = medyan(t);
  const md = medyan(d);
  const fark = md - mt;
  const yuzde = mt > 0 ? (fark / mt) * 100 : NaN;
  satirlar.push(
    `| ${k} | ${ms(mt)} | ${ms(Math.min(...t))}–${ms(Math.max(...t))} | ${ms(md)} | ${ms(Math.min(...d))}–${ms(Math.max(...d))} | ${fark >= 0 ? '+' : ''}${ms(fark)} | ${Number.isFinite(yuzde) ? `${yuzde >= 0 ? '+' : ''}${yuzde.toFixed(1)} %` : '—'} |`,
  );
  // Küçük sayılarda (tbt 0 → 3 ms) yüzde anlamsız: 10 ms'nin altındaki farka uyarı yok.
  if (yuzde > PAY && fark >= 10)
    uyarilar.push(`${k}: dal ${ms(md)} ms, taban ${ms(mt)} ms (+${yuzde.toFixed(1)} %)`);
}
if (BUTCE > 0 && medyan(sonuc.dal.map((r) => r.hazir)) > BUTCE)
  uyarilar.push(
    `hazir: dalın medyanı ${ms(medyan(sonuc.dal.map((r) => r.hazir)))} ms, bütçe ${BUTCE} ms`,
  );

const tablo = [
  `### \`file://\` açılışı, CPU ${HIZ}× yavaş, ${N} dönüşümlü koşu (ms, medyan ve en az–en çok)`,
  '',
  '| ölçü | taban | taban aralık | dal | dal aralık | fark | fark % |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...satirlar,
  '',
  "load = `loadEventEnd`; hazir = `Okul` düğmesi DOM'da + bir rAF; izgara = `table.grid` DOM'da + bir rAF;",
  'uzunIzgara = ızgaraya kadarki uzun görevlerin toplamı; uzun / tbt / enUzun = iş durulana kadar (1 s sessizlik).',
  'Veri: `' + a.veri + '`; her koşu taze bağlam, 1920×1080, tr-TR; ısınma koşusu sayılmadı.',
  '',
  uyarilar.length
    ? `**Uyarı (eşik %${PAY}${BUTCE ? `, bütçe ${BUTCE} ms` : ''}):** ${uyarilar.join('; ')}`
    : `Eşik %${PAY} aşılmadı.`,
  '',
].join('\n');
console.log(`\n${tablo}`);
if (a.ozet) appendFileSync(a.ozet, tablo);
if (a.json) writeFileSync(a.json, JSON.stringify({ hiz: HIZ, kosu: N, sonuc }, null, 2));
if (process.env.GITHUB_ACTIONS)
  for (const u of uyarilar) console.log(`::warning title=Açılış yavaşladı::${u}`);
