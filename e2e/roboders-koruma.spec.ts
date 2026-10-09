// The Roboders guard, proven against a server we own before it is ever pointed
// at my father's account (scripts/roboders/koruma.mjs says what it guards).
//
// THE JUDGE IS THE SERVER, not the page. A page can be told a request failed
// while the bytes still left; what matters is what arrived. So a local
// server counts every request by method and path, and every WebSocket upgrade,
// and the assertions read its counts. A control GET that SHOULD arrive is part
// of it, because a guard that blocks everything would pass every other line
// here for nothing.
//
// Every way a page can write is tried once: fetch with four methods, XHR,
// sendBeacon, a form posting into an iframe, a cross-origin iframe, a popup,
// a keepalive request as the page closes, a WebSocket, a service worker, a
// GET whose address deletes, and a native confirm().
//
// Plain @playwright/test rather than ./kapan: the error trap there treats any
// http request as a breach of the offline rule, and this file is nothing but
// http requests.

import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import {
  HEDEFLER,
  guvenliBaglam,
  hedefBilgisi,
  izinVerilir,
  tiklanabilir,
  type Kayit,
} from '../scripts/roboders/koruma.mjs';
import { otomatikGez, otomatikKarar, type Aday } from '../scripts/roboders/otomatik.mjs';

/** What reached the server: `METHOD /path`, in order, and upgrade attempts. */
const gelen: string[] = [];
let yukseltme = 0;
let sunucu: Server;
let kok = '';
let oteki = '';

const SAYFA = (oteki: string) => `<!doctype html><meta charset="utf-8">
<form id="f" method="post" action="/form-yaz" target="cerceve"><input name="a" value="1"></form>
<iframe name="cerceve"></iframe>
<iframe src="${oteki}/cerceve"></iframe>
<button id="acilir" onclick="window.open('/acilir')">aç</button>
<script>
addEventListener('pagehide', () => fetch('/keepalive-yaz', { method: 'POST', body: 'x', keepalive: true }));
const sonuc = {};
// A ceiling on each attempt, so one that hangs says which one it was.
const sinir = (is) => Promise.race([is(), new Promise((_, no) => setTimeout(() => no(new Error('süre')), 3000))]);
const dene = async (ad, is) => { try { await sinir(is); sonuc[ad] = 'gitti'; } catch (e) { sonuc[ad] = e.message === 'süre' ? 'takıldı' : 'durdu'; } };
(async () => {
  for (const m of ['POST', 'PUT', 'PATCH', 'DELETE']) await dene(m, () => fetch('/yaz', { method: m, body: 'x' }));
  await dene('xhr', () => new Promise((ok, no) => {
    const x = new XMLHttpRequest(); x.open('POST', '/xhr-yaz'); x.onload = ok; x.onerror = no; x.send('x');
  }));
  sonuc.beacon = navigator.sendBeacon('/beacon-yaz', 'x');
  await dene('ws', () => new Promise((ok, no) => {
    const w = new WebSocket('ws://' + location.host + '/ws');
    w.onopen = () => { w.send('x'); ok(); }; w.onerror = no; w.onclose = no;
  }));
  await dene('sil', () => fetch('/api/sil?id=1'));
  await dene('delete', () => fetch('/api/TeacherDelete?id=1'));
  await dene('serbest', () => fetch('/api/raporlar?hafta=1'));
  await dene('sw', () => navigator.serviceWorker.register('/sw.js'));
  sonuc.onay = confirm('Silinsin mi?');
  document.getElementById('f').submit();
  window.bitti = sonuc;
})();
</script>`;

/** A page that tries to write on every way out of it. */
const CIKIS = `<!doctype html><meta charset="utf-8">
<body onpagehide="fetch('/cikis-oznitelik', { method: 'POST', body: 'x', keepalive: true })">
<iframe srcdoc="<script>addEventListener('pagehide', () => fetch('/cikis-srcdoc', { method: 'POST', body: 'x', keepalive: true }))</script>"></iframe>
<iframe id="bos"></iframe>
<a id="bag" href="/serbest">öteki sayfa</a>
<script>
addEventListener('pagehide', () => fetch('/cikis-pagehide', { method: 'POST', body: 'x', keepalive: true }));
addEventListener('beforeunload', () => navigator.sendBeacon('/cikis-beacon', 'x'));
document.addEventListener('visibilitychange', () => fetch('/cikis-gizli', { method: 'POST', body: 'x', keepalive: true }));
window.onunload = () => navigator.sendBeacon('/cikis-onunload', 'x');
const temiz = document.getElementById('bos').contentWindow;
temiz.addEventListener('pagehide', () => temiz.fetch('/cikis-bos-cerceve', { method: 'POST', body: 'x', keepalive: true }));
window.hazir = true;
</script></body>`;

// The automatic tour's test page. Every element that must NOT be clicked sends
// `GET /tiklandi/y-...` when clicked (a GET, so the guard lets it through and
// the server sees it); every one that must be clicked sends `/tiklandi/izin-...`
// or navigates. The judge is again the server's list. A marker must say nothing
// the guard refuses, or the network stops it whether it was clicked or not:
// three of them did (`y-kaydet`, `y-menu-sil`, `y-kaldir`, found 2026-10-09),
// and 'işaretler korumadan geçiyor' below now asks.
const iz = (ad: string) => `onclick="fetch('/tiklandi/${ad}')"`;
const OTO = (oteki: string) => `<!doctype html><meta charset="utf-8">
<nav>
  <a href="/oto/a">Raporlar</a>
  <button role="tab" ${iz('izin-sekme')}>Haftalık</button>
  <button aria-haspopup="menu" aria-expanded="false" ${iz('izin-menu')}
    onmouseup="document.getElementById('menu').hidden = false; this.setAttribute('aria-expanded', 'true')">Menü ▾</button>
  <div id="menu" role="menu" hidden>
    <a role="menuitem" href="/oto/b">Liste</a>
    <button role="menuitem" ${iz('y-menu-1')}>Sil</button>
    <button role="menuitem" ${iz('y-menu-yazdir')}>Yazdır</button>
  </div>
  <button ${iz('y-dugme-1')}>Kaydet</button>
  <button ${iz('y-hesapla')}>Hesapla</button>
  <button aria-haspopup="dialog" ${iz('y-pencere')}>Öğretmen</button>
  <a href="/oto/x" ${iz('y-bag-1')}>Programı kaldır</a>
  <a href="/oto/sil?id=1" ${iz('y-adres')}>Ayrıntı</a>
  <a href="/oto/yeni-pencere" target="_blank" ${iz('y-blank')}>Yardım</a>
  <a href="/oto/dosya" download ${iz('y-indir')}>Dışa ver</a>
  <a href="${oteki}/oto/disari" ${iz('y-disari')}>Öteki site</a>
  <a href="javascript:void 0" ${iz('y-js')}>Betik</a>
</nav>
<table><tr><td><a href="/oto/hucre" ${iz('y-hucre')}>Ma 6.B</a></td></tr></table>
<form action="/oto/form"><button ${iz('y-form')}>Bak</button></form>
<a href="/oto/surukle" draggable="true" ${iz('y-surukle')}>Fi 7.A</a>`;
const OTO_A = `<!doctype html><meta charset="utf-8"><a href="/oto">Ana sayfa</a>
<script>fetch('/oto-a-yaz', { method: 'POST', body: 'x' }).catch(() => {})</script>`;
const OTO_B = `<!doctype html><meta charset="utf-8"><p>Liste</p>`;
const DIYALOG = `<!doctype html><meta charset="utf-8"><a href="/oto-onay">Devam</a>`;

// Eyotek's test page: the area is /ders, and what a school management system
// writes with sits next to what a tour may read. Same judge, same convention:
// a `y-` click must never reach the server. The markers say nothing Eyotek
// refuses: a marker with "not" in it would be stopped by the address rule
// whether it was clicked or not, and the assertion would pass for nothing.
const EYO = (oteki: string) => `<!doctype html><meta charset="utf-8">
<nav>
  <a href="/ders/program">Haftalık program</a>
  <a href="/ders/notlar" ${iz('y-e1')}>Not girişi</a>
  <a href="/ders/kayitlar" ${iz('y-e2')}>Öğrenci kaydı</a>
  <a href="/ders/OgrenciNotGir" ${iz('y-e3')}>Ayrıntı</a>
  <a href="/muhasebe/liste" ${iz('y-e4')}>Muhasebe</a>
  <a href="${oteki}/ders/disari" ${iz('y-e5')}>Öteki site</a>
  <button ${iz('y-e6')}>SMS gönder</button>
  <button ${iz('y-e7')}>Yoklama al</button>
  <button ${iz('y-e8')}>İptal</button>
  <button role="tab" ${iz('e-sekme')}>Öğretmenler</button>
</nav>
<button id="kacak" onclick="location.href = '/muhasebe/kacak'">bir betik</button>
<script>fetch('/api/veri').then(() => { window.hazir = true; })</script>`;
const EYO_PROGRAM = `<!doctype html><meta charset="utf-8"><p>Program</p>`;
const ONAY = `<!doctype html><meta charset="utf-8">
<script>confirm('Silinsin mi?')</script><a href="/oto-sonraki">Sonraki</a>`;

test.beforeAll(async () => {
  sunucu = createServer((req, res) => {
    const yol = new URL(req.url ?? '/', 'http://x').pathname;
    gelen.push(`${req.method} ${yol}`);
    const html = (govde: string) => {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(govde);
    };
    if (yol === '/deneme') return html(SAYFA(oteki));
    if (yol === '/cikis') return html(CIKIS);
    if (yol === '/oto') return html(OTO(oteki));
    if (yol === '/oto/a') return html(OTO_A);
    if (yol === '/oto/b') return html(OTO_B);
    if (yol === '/oto-diyalog') return html(DIYALOG);
    if (yol === '/oto-onay') return html(ONAY);
    if (yol === '/ders') return html(EYO(oteki));
    if (yol === '/ders/program') return html(EYO_PROGRAM);
    if (yol === '/cerceve')
      return html(`<script>fetch('/cerceve-yaz', { method: 'POST', body: 'x' })</script>`);
    if (yol === '/acilir') {
      return html(
        `<script>fetch('/acilir-yaz', { method: 'POST', body: 'x' }).catch(() => {}).finally(() => { window.bitti = true; })</script>`,
      );
    }
    if (yol === '/sw.js') {
      res.setHeader('content-type', 'text/javascript');
      return res.end(
        `self.addEventListener('install', (e) => e.waitUntil(fetch('/sw-yaz', { method: 'POST' })));`,
      );
    }
    res.end('ok');
  });
  sunucu.on('upgrade', (_req, soket) => {
    yukseltme++;
    soket.destroy();
  });
  await new Promise<void>((ok) => sunucu.listen(0, '127.0.0.1', ok));
  const { port } = sunucu.address() as AddressInfo;
  kok = `http://127.0.0.1:${port}`;
  // `localhost` and `127.0.0.1` are two origins, so the second iframe is
  // cross-origin without a second server.
  oteki = `http://localhost:${port}`;
});

test.afterAll(async () => {
  await new Promise((ok) => sunucu.close(ok));
});

test.describe('Roboders koruması', () => {
  test('GET dışında hiçbir istek sunucuya ulaşmıyor, ve her deneme günlükte', async ({
    browser,
  }) => {
    const gunluk: Kayit[] = [];
    const context = await guvenliBaglam(browser, { gunluk: (k) => gunluk.push(k) });
    const page = await context.newPage();
    await page.goto(`${kok}/deneme`);
    await page.waitForFunction(() => 'bitti' in window);
    const sonuc = await page.evaluate(
      () => (window as unknown as { bitti: Record<string, unknown> }).bitti,
    );

    const acilir = context.waitForEvent('page');
    await page.locator('#acilir').click();
    const ikinci = await acilir;
    await ikinci.waitForFunction(() => 'bitti' in window);
    // The keepalive request is sent as the page goes away, i.e. after the
    // last thing a test usually waits for.
    await page.close({ runBeforeUnload: true });
    await ikinci.close();
    await new Promise((ok) => setTimeout(ok, 1000));
    await context.close();

    // What arrived: GET and HEAD only, and nothing whose address deletes.
    expect(
      gelen.filter((r) => !/^(GET|HEAD) /.test(r)),
      'sunucuya yazan istek ulaştı',
    ).toEqual([]);
    expect(yukseltme, 'websocket sunucuya ulaştı').toBe(0);
    expect(
      gelen.filter((r) => /\/api\/(sil|TeacherDelete)/.test(r)),
      'yazan GET ulaştı',
    ).toEqual([]);
    // The control: an innocent GET does get through.
    expect(gelen).toContain('GET /api/raporlar');
    expect(sonuc['serbest']).toBe('gitti');
    // confirm() was answered "İptal".
    expect(sonuc['onay']).toBe(false);

    // Every attempt that could have written is in the log, by path.
    const kayitli = (yol: string) => gunluk.some((k) => k.adres.endsWith(yol));
    for (const yol of [
      '/yaz',
      '/xhr-yaz',
      '/beacon-yaz',
      '/form-yaz',
      '/cerceve-yaz',
      '/acilir-yaz',
      '/api/sil',
      '/api/TeacherDelete',
      '/ws',
    ]) {
      expect(kayitli(yol), `${yol} günlükte yok`).toBe(true);
    }
    const yontemler = new Set(gunluk.filter((k) => k.adres.endsWith('/yaz')).map((k) => k.yontem));
    expect([...yontemler].sort()).toEqual(['DELETE', 'PATCH', 'POST', 'PUT']);
    expect(gunluk.some((k) => k.yontem === 'DIYALOG')).toBe(true);
    // The keepalive request is never even made: the page could not listen
    // for being left, and that refusal is logged in its place.
    expect(gunluk.some((k) => k.yontem === 'DINLEYICI' && k.sebep.startsWith('pagehide'))).toBe(
      true,
    );
  });

  // The hole this file found on its first run: a request sent while a page is
  // being LEFT goes past `context.route`. Measured on 2026-10-08 without the
  // in-page layer: leaving by navigation, by a link and by page.close() all
  // delivered keepalive POSTs and beacons to this server; closing the context
  // or the browser delivered nothing. Every source below delivered at least
  // once on one of these exits, including the ones a page could use to dodge a
  // listener wrapper: an `onpagehide` attribute, a srcdoc frame, and a blank
  // frame's own fresh `fetch`.
  for (const [cikis, cik] of [
    ['başka sayfaya gitmek', (p: Page) => p.goto(`${kok}/serbest`)],
    ['bağlantıya tıklamak', (p: Page) => p.click('#bag')],
    ['sayfayı kapatmak', (p: Page) => p.close({ runBeforeUnload: true })],
  ] as const) {
    test(`sayfadan çıkarken giden istek sunucuya ulaşmıyor: ${cikis}`, async ({ browser }) => {
      const context = await guvenliBaglam(browser, { gunluk: () => {} });
      const page = await context.newPage();
      await page.goto(`${kok}/cikis`);
      await page.waitForFunction(() => 'hazir' in window);
      const once = gelen.length;
      await cik(page);
      await new Promise((ok) => setTimeout(ok, 800));
      await context.close();
      expect(
        gelen.slice(once).filter((r) => !/^(GET|HEAD) /.test(r)),
        `${cikis}: çıkışta yazan istek ulaştı`,
      ).toEqual([]);
    });
  }

  test('tıklanmayacak olan, adından ve yerinden tanınıyor', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setContent(`<!doctype html><meta charset="utf-8">
      <nav>
        <a href="#r">Raporlar</a>
        <button>İptal</button>
        <button>Basılı rapor</button>
        <button>KAYDET</button>
        <button>Kaydet</button>
        <button>Gönder ▾</button>
        <button aria-label="Programı sil">x</button>
        <button>E-Mail Gönder</button>
        <button>Eyotek'e aktar</button>
        <button>Oluştur</button>
        <button></button>
      </nav>
      <form><input type="submit" value="Bak"><button>Önizle</button></form>
      <table><tr><td><span>Ma 6.B</span></td></tr></table>
      <input value="x"><div draggable="true">Fi 7.A</div>`);
    const karar = async (secici: string) => tiklanabilir(await hedefBilgisi(page.locator(secici)));

    for (const ad of ['Raporlar', 'İptal', 'Basılı rapor']) {
      const k = await karar(`nav >> text="${ad}"`);
      expect(k.izin, `${ad}: ${k.sebep}`).toBe(true);
    }
    for (const ad of [
      'KAYDET',
      'Kaydet',
      'Gönder ▾',
      'E-Mail Gönder',
      "Eyotek'e aktar",
      'Oluştur',
    ]) {
      expect((await karar(`nav >> text="${ad}"`)).izin, ad).toBe(false);
    }
    expect((await karar('[aria-label="Programı sil"]')).izin).toBe(false);
    expect((await karar('nav button:last-child')).sebep).toContain('adı yok');
    expect((await karar('input[type=submit]')).sebep).toContain('gönderen');
    expect((await karar('form button')).sebep).toContain('gönderen');
    expect((await karar('td span')).sebep).toContain('hücre');
    expect((await karar('body > input')).sebep).toContain('form alanı');
    expect((await karar('[draggable]')).sebep).toContain('sürüklenebilir');
    await context.close();
  });

  test('işaretler korumadan geçiyor, yani "tıklanmadı" bir şey ölçüyor', () => {
    for (const [sayfa, ayar] of [
      [OTO(''), HEDEFLER.roboders],
      [EYO(''), HEDEFLER.eyotek],
    ] as const) {
      const isaretler = [...sayfa.matchAll(/fetch\('(\/tiklandi\/[^']+)'\)/g)].map((m) => m[1]!);
      expect(isaretler.length).toBeGreaterThan(5);
      for (const yol of isaretler) {
        expect(izinVerilir('GET', `http://127.0.0.1${yol}`, ayar).sebep, yol).toBe('');
      }
    }
  });

  test('istek kuralı: yalnız GET ve HEAD, adresinde yazan kelime yoksa', () => {
    expect(izinVerilir('GET', 'https://ornek.com/raporlar?hafta=2').izin).toBe(true);
    expect(izinVerilir('HEAD', 'https://ornek.com/').izin).toBe(true);
    expect(izinVerilir('GET', 'https://ornek.com/basili-rapor').izin).toBe(true);
    for (const y of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      expect(izinVerilir(y, 'https://ornek.com/raporlar').izin, y).toBe(false);
    }
    for (const adres of [
      'https://ornek.com/api/Teacher/Delete?id=3',
      'https://ornek.com/api/TeacherDelete',
      'https://ornek.com/ogretmen/sil/3',
      'https://ornek.com/%C3%B6%C4%9Fretmen/g%C3%BCncelle',
      'https://ornek.com/program?islem=yayinla',
    ]) {
      expect(izinVerilir('GET', adres).izin, adres).toBe(false);
    }
  });

  test.describe('otomatik mod', () => {
    const SITE = /^127\.0\.0\.1$/;

    test('yalnız gezinmeye tıklıyor, gerisini atlayıp listeliyor', async ({ browser }, bilgi) => {
      const context = await guvenliBaglam(browser, { gunluk: () => {} });
      const page = await context.newPage();
      const once = gelen.length;
      const ekran = bilgi.outputPath('ekran');
      const sonuc = await otomatikGez(page, `${kok}/oto`, { site: SITE, ekran, bekleMs: 100 });
      await context.close();
      const yeni = gelen.slice(once);

      expect(
        yeni.filter((r) => !/^(GET|HEAD) /.test(r)),
        'yazan istek ulaştı',
      ).toEqual([]);
      expect(
        yeni.filter((r) => r.startsWith('GET /tiklandi/y-')),
        'yasak öğeye tıklandı',
      ).toEqual([]);
      for (const yol of ['/oto/x', '/oto/hucre', '/oto/form', '/oto/surukle', '/oto/disari']) {
        expect(yeni, `${yol} açıldı`).not.toContain(`GET ${yol}`);
      }
      // The control: what is allowed was clicked, through to the server.
      for (const r of [
        'GET /oto/a',
        'GET /oto/b',
        'GET /tiklandi/izin-sekme',
        'GET /tiklandi/izin-menu',
      ]) {
        expect(yeni, `${r} gelmedi`).toContain(r);
      }
      expect(sonuc.durdu).toBe('gezilecek yer kalmadı');
      expect(sonuc.tiklanan.map((t) => t.ad).sort()).toEqual(
        ['Ana sayfa', 'Haftalık', 'Liste', 'Menü ▾', 'Raporlar'].sort(),
      );

      const sebep = (ad: string) => sonuc.atlanan.find((a) => a.ad === ad)?.sebep ?? 'YOK';
      expect(sebep('Kaydet')).toContain('kaydet');
      expect(sebep('Sil')).toContain('sil');
      expect(sebep('Hesapla')).toContain('izin listesinde değil');
      expect(sebep('Yazdır')).toContain('izin listesinde değil');
      expect(sebep('Öğretmen')).toContain('izin listesinde değil');
      expect(sebep('Programı kaldır')).toContain('kaldir');
      expect(sebep('Ayrıntı')).toContain('adreste');
      expect(sebep('Yardım')).toContain('yeni pencere');
      expect(sebep('Dışa ver')).toContain('indirir');
      expect(sebep('Öteki site')).toContain('site dışı');
      expect(sebep('Betik')).toContain('javascript');
      expect(sebep('Ma 6.B')).toContain('hücre');
      expect(sebep('Bak')).toContain('gönderen');
      expect(sebep('Fi 7.A')).toContain('sürüklenebilir');

      // Before and after every click.
      for (let i = 1; i <= sonuc.tiklanan.length; i++) {
        const no = String(i).padStart(3, '0');
        expect(existsSync(`${ekran}/${no}-once.png`), `${no}-once`).toBe(true);
        expect(existsSync(`${ekran}/${no}-sonra.png`), `${no}-sonra`).toBe(true);
      }
    });

    test('diyalog çıkınca tur duruyor', async ({ browser }) => {
      const context = await guvenliBaglam(browser, { gunluk: () => {} });
      const page = await context.newPage();
      const once = gelen.length;
      const sonuc = await otomatikGez(page, `${kok}/oto-diyalog`, { site: SITE, bekleMs: 100 });
      await context.close();
      expect(sonuc.durdu).toBe('bir diyalog açıldı');
      expect(gelen.slice(once)).not.toContain('GET /oto-sonraki');
    });

    test('tıklama sınırında duruyor', async ({ browser }) => {
      const context = await guvenliBaglam(browser, { gunluk: () => {} });
      const page = await context.newPage();
      const sonuc = await otomatikGez(page, `${kok}/oto`, {
        site: SITE,
        tiklamaSiniri: 2,
        bekleMs: 100,
      });
      await context.close();
      expect(sonuc.durdu).toBe('tıklama sınırı (2)');
      expect(sonuc.tiklama).toBe(2);
    });

    test('süre sınırında duruyor', async ({ browser }) => {
      const context = await guvenliBaglam(browser, { gunluk: () => {} });
      const page = await context.newPage();
      const sonuc = await otomatikGez(page, `${kok}/oto`, {
        site: SITE,
        sureSiniriMs: 1,
        bekleMs: 100,
      });
      await context.close();
      expect(sonuc.durdu).toMatch(/^süre sınırı/);
      expect(sonuc.tiklanan).toEqual([]);
    });

    test('gezinti alanının dışındaki bağlantı atlanıyor', () => {
      const aday: Aday = {
        ad: 'Muhasebe',
        rol: 'link',
        href: 'https://ornek.com/muhasebe/liste',
        yeniPencere: false,
        indirir: false,
        acar: false,
        acik: false,
        hucrede: false,
        formAlani: false,
        suruklenebilir: false,
        gonderir: false,
      };
      const sinir = { site: /ornek\.com$/, alanlar: ['/ders'], sayfa: 'https://ornek.com/' };
      expect(otomatikKarar(aday, sinir).sebep).toContain('alanının dışında');
      expect(otomatikKarar({ ...aday, href: 'https://ornek.com/ders/program' }, sinir).izin).toBe(
        true,
      );
      expect(otomatikKarar({ ...aday, rol: 'button', href: '' }, sinir).izin).toBe(false);
      expect(otomatikKarar({ ...aday, rol: 'button', href: '', acar: true }, sinir).tur).toBe(
        'açılır menü',
      );
    });
  });
});

// The same guard, set to Eyotek (koruma.mjs, `HEDEFLER.eyotek`): its own
// writing words and a tour that must stay inside its --alan. The site is this
// server's; everything else is Eyotek's setting as a tour would get it.
test.describe('Eyotek ayarı', () => {
  const EYOTEK = { ...HEDEFLER.eyotek, site: /^127\.0\.0\.1$/ };
  const ALAN = ['/ders'];

  test('Eyotek kendi yazan kelimelerini ekliyor, Roboders onlardan etkilenmiyor', () => {
    const eyo = (ad: string) => tiklanabilir(oge(ad), EYOTEK).izin;
    const rob = (ad: string) => tiklanabilir(oge(ad)).izin;
    for (const ad of ['Not girişi', 'Öğrenci kaydı', 'SMS gönder', 'Yoklama al', 'İptal']) {
      expect(eyo(ad), `Eyotek: ${ad}`).toBe(false);
    }
    // The control: Roboders reads the same names the way it did before.
    for (const ad of ['Not girişi', 'Öğrenci kaydı', 'Yoklama al', 'İptal']) {
      expect(rob(ad), `Roboders: ${ad}`).toBe(true);
    }
    expect(eyo('Haftalık program')).toBe(true);
    // The shared list still holds for Eyotek.
    expect(eyo('Kaydet')).toBe(false);
    // An address names its action in camelCase as often as with a dash.
    expect(
      izinVerilir('GET', 'https://okul.eyotek.com.tr/Ogrenci/OgrenciNotGir', EYOTEK).sebep,
    ).toBe('adreste "not" var');
    expect(izinVerilir('GET', 'https://okul.eyotek.com.tr/Ders/HaftalikProgram', EYOTEK).izin).toBe(
      true,
    );
  });

  test('alansız bir Eyotek turu başlamıyor', async ({ browser }) => {
    const once = browser.contexts().length;
    await expect(guvenliBaglam(browser, { gunluk: () => {}, ayar: EYOTEK })).rejects.toThrow(
      '--alan',
    );
    // ...and leaves no open context behind.
    expect(browser.contexts().length).toBe(once);
    const context = await guvenliBaglam(browser, { gunluk: () => {} });
    const page = await context.newPage();
    await expect(
      otomatikGez(page, `${kok}/ders`, { site: EYOTEK.site, ayar: EYOTEK }),
    ).rejects.toThrow('--alan');
    await context.close();
  });

  test('alanın dışındaki sayfa hiçbir yoldan açılmıyor, alanın içi açılıyor', async ({
    browser,
  }) => {
    const gunluk: Kayit[] = [];
    const context = await guvenliBaglam(browser, {
      gunluk: (k) => gunluk.push(k),
      ayar: EYOTEK,
      alanlar: ALAN,
    });
    const page = await context.newPage();
    const once = gelen.length;
    await page.goto(`${kok}/ders`);
    await page.waitForFunction(() => 'hazir' in window);
    // A typed address, and (in a fresh tab, the first one is on Chromium's
    // error page now) a script that leaves on its own.
    await expect(page.goto(`${kok}/muhasebe/yazilan`)).rejects.toThrow();
    const ikinci = await context.newPage();
    await ikinci.goto(`${kok}/ders`);
    await ikinci.locator('#kacak').click();
    await ikinci.waitForTimeout(500);
    await context.close();
    const yeni = gelen.slice(once);

    expect(
      yeni.filter((r) => r.startsWith('GET /muhasebe')),
      'alanın dışı açıldı',
    ).toEqual([]);
    // The controls: the area itself, and a page's own data request outside it.
    expect(yeni).toContain('GET /ders');
    expect(yeni).toContain('GET /api/veri');
    expect(
      gunluk.filter((k) => k.sebep === 'gezinti alanının dışında').map((k) => k.adres),
    ).toEqual([`${kok}/muhasebe/yazilan`, `${kok}/muhasebe/kacak`]);
  });

  test('otomatik tur yalnız alanın içindeki gezinmeye tıklıyor', async ({ browser }) => {
    const context = await guvenliBaglam(browser, { gunluk: () => {}, ayar: EYOTEK, alanlar: ALAN });
    const page = await context.newPage();
    const once = gelen.length;
    const sonuc = await otomatikGez(page, `${kok}/ders`, {
      site: EYOTEK.site,
      alanlar: ALAN,
      ayar: EYOTEK,
      bekleMs: 100,
    });
    await context.close();
    const yeni = gelen.slice(once);

    expect(
      yeni.filter((r) => r.startsWith('GET /tiklandi/y-')),
      'yasak öğeye tıklandı',
    ).toEqual([]);
    for (const yol of [
      '/ders/notlar',
      '/ders/kayitlar',
      '/ders/OgrenciNotGir',
      '/muhasebe/liste',
    ]) {
      expect(yeni, `${yol} açıldı`).not.toContain(`GET ${yol}`);
    }
    expect(yeni).toContain('GET /ders/program');
    expect(yeni).toContain('GET /tiklandi/e-sekme');
    expect(sonuc.tiklanan.map((t) => t.ad).sort()).toEqual(['Haftalık program', 'Öğretmenler']);

    const sebep = (ad: string) => sonuc.atlanan.find((a) => a.ad === ad)?.sebep ?? 'YOK';
    expect(sebep('Not girişi')).toContain('"not"');
    expect(sebep('Öğrenci kaydı')).toContain('"kayd"');
    expect(sebep('Ayrıntı')).toContain('adreste "not"');
    expect(sebep('Muhasebe')).toContain('alanının dışında');
    expect(sebep('Öteki site')).toContain('site dışı');
    expect(sebep('SMS gönder')).toMatch(/"(sms|gonder)"/);
    expect(sebep('Yoklama al')).toContain('"yoklama"');
    expect(sebep('İptal')).toContain('"iptal"');
  });
});

/** A plain named link, for the name rules alone. */
function oge(ad: string) {
  return { ad, hucrede: false, formAlani: false, suruklenebilir: false, gonderir: false };
}
