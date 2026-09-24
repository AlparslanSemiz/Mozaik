// The real exe, one shell command at a time.
//
//   node scripts/exe-surucu.mjs ac [--ikili yol] [--ev dizin] [--koru] [--gorunur] [--dil en_US]
//   node scripts/exe-surucu.mjs agac               # what is on screen, with @refs
//   node scripts/exe-surucu.mjs goruntu [png]      # screenshot (default son.png)
//   node scripts/exe-surucu.mjs tikla <@N|css|metin:...>
//   node scripts/exe-surucu.mjs yaz <secici> <metin>
//   node scripts/exe-surucu.mjs tus <Enter|Escape|Control+z|...>
//   node scripts/exe-surucu.mjs surukle <kaynak> <hedef>
//   node scripts/exe-surucu.mjs metin <secici>
//   node scripts/exe-surucu.mjs onayla | reddet    # the page's confirm() dialog
//   node scripts/exe-surucu.mjs bekle <secici> [ms]
//   node scripts/exe-surucu.mjs js '<async function body>'
//   node scripts/exe-surucu.mjs pencere [genislik yukseklik]
//   node scripts/exe-surucu.mjs durum | kapat
//
// Each call is its own process, so `ac` leaves the driver running and writes
// where it is to test-results/exe-surucu/oturum.json; every later call reads
// it back. `kapat` ends the session and the driver. The program runs with a
// sandbox HOME (test-results/exe-surucu/ev) unless `--ev` says otherwise, so
// the real Documents/Ders Programı is never written to. Why WebDriver and not
// Playwright, and why the sandbox: scripts/webdriver.mjs.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Oturum, suruculuBaslat, varsayilanIkili } from './webdriver.mjs';

const KOK = resolve(import.meta.dirname, '..');
const DIZIN = join(KOK, 'test-results', 'exe-surucu');
const KAYIT = join(DIZIN, 'oturum.json');

function dur(mesaj) {
  console.error(mesaj);
  process.exit(1);
}

function secenek(argumanlar, ad) {
  const i = argumanlar.indexOf(ad);
  return i === -1 ? undefined : argumanlar[i + 1];
}

function kayitli() {
  if (!existsSync(KAYIT)) dur('Açık oturum yok. Önce: node scripts/exe-surucu.mjs ac');
  const k = JSON.parse(readFileSync(KAYIT, 'utf8'));
  return { kayit: k, oturum: new Oturum(k.port, k.sessionId) };
}

function surucuyuOldur(pid) {
  try {
    // Negative pid: the whole process group -- tauri-driver, WebKitWebDriver,
    // the program itself, and xvfb-run's X server when there is one.
    process.kill(-pid, 'SIGTERM');
  } catch {
    // Already gone.
  }
}

const [komut, ...argumanlar] = process.argv.slice(2);

switch (komut) {
  case 'ac': {
    if (existsSync(KAYIT)) {
      dur('Zaten açık bir oturum var. Önce: node scripts/exe-surucu.mjs kapat');
    }
    const ikili = resolve(secenek(argumanlar, '--ikili') ?? varsayilanIkili());
    if (!existsSync(ikili)) dur(`İkili yok: ${ikili}\nÖnce: npm run exe:linux`);
    const ev = resolve(secenek(argumanlar, '--ev') ?? join(DIZIN, 'ev'));
    const koru = argumanlar.includes('--koru');
    if (!koru) rmSync(ev, { recursive: true, force: true });
    mkdirSync(DIZIN, { recursive: true });
    const port = Number(secenek(argumanlar, '--port') ?? 4444);
    const { pid, basiz } = suruculuBaslat({
      port,
      ev,
      gorunur: argumanlar.includes('--gorunur'),
      gunluk: join(DIZIN, 'surucu.log'),
      dil: secenek(argumanlar, '--dil'),
    });
    let oturum;
    try {
      oturum = await Oturum.ac({ port, ikili });
    } catch (e) {
      surucuyuOldur(pid);
      dur(`${e.message}\nGünlük: ${join(DIZIN, 'surucu.log')}`);
    }
    writeFileSync(
      KAYIT,
      JSON.stringify({ port, pid, sessionId: oturum.id, ev, ikili, basiz }, null, 2),
    );
    // The shell's title: the page is up and React has drawn the first screen.
    await oturum.bekle('h1', 20_000);
    console.log(`Açıldı (${basiz ? 'başsız' : 'masaüstünde'}). Ev: ${ev}\nİkili: ${ikili}`);
    break;
  }

  case 'agac': {
    console.log(await kayitli().oturum.agac());
    break;
  }

  case 'goruntu': {
    const dosya = resolve(argumanlar[0] ?? join(DIZIN, 'son.png'));
    writeFileSync(dosya, await kayitli().oturum.goruntu());
    console.log(dosya);
    break;
  }

  case 'tikla': {
    if (argumanlar[0] === undefined) dur('Seçici gerekli.');
    await kayitli().oturum.tikla(argumanlar[0]);
    console.log('tıklandı');
    break;
  }

  case 'yaz': {
    if (argumanlar.length < 2) dur('Seçici ve metin gerekli.');
    await kayitli().oturum.yaz(argumanlar[0], argumanlar.slice(1).join(' '));
    console.log('yazıldı');
    break;
  }

  case 'tus': {
    if (argumanlar[0] === undefined) dur('Tuş gerekli.');
    await kayitli().oturum.tus(argumanlar[0]);
    console.log('basıldı');
    break;
  }

  case 'surukle': {
    if (argumanlar.length < 2) dur('Kaynak ve hedef gerekli.');
    await kayitli().oturum.surukle(argumanlar[0], argumanlar[1]);
    console.log('sürüklendi');
    break;
  }

  case 'onayla':
  case 'reddet': {
    console.log(await kayitli().oturum.onayla(komut === 'onayla'));
    break;
  }

  case 'metin': {
    console.log(await kayitli().oturum.metin(argumanlar[0] ?? 'body'));
    break;
  }

  case 'bekle': {
    await kayitli().oturum.bekle(argumanlar[0], Number(argumanlar[1] ?? 10_000));
    console.log('bulundu');
    break;
  }

  case 'js': {
    if (argumanlar[0] === undefined) dur('Betik gerekli.');
    const sonuc = await kayitli().oturum.js(argumanlar.join(' '));
    console.log(typeof sonuc === 'string' ? sonuc : JSON.stringify(sonuc, null, 2));
    break;
  }

  case 'pencere': {
    const { oturum } = kayitli();
    const [g, y] = argumanlar.map(Number);
    console.log(JSON.stringify(await oturum.pencere(g, y)));
    break;
  }

  case 'durum': {
    if (!existsSync(KAYIT)) {
      console.log('kapalı');
      break;
    }
    const { kayit, oturum } = kayitli();
    try {
      await oturum.pencere();
      console.log(JSON.stringify({ ...kayit, durum: 'açık' }, null, 2));
    } catch (e) {
      console.log(`kayıt var ama oturum cevap vermiyor: ${e.message}`);
    }
    break;
  }

  case 'kapat': {
    if (!existsSync(KAYIT)) {
      console.log('zaten kapalı');
      break;
    }
    const { kayit, oturum } = kayitli();
    await oturum.kapat();
    surucuyuOldur(kayit.pid);
    rmSync(KAYIT, { force: true });
    console.log('kapandı');
    break;
  }

  default:
    dur(
      'Komutlar: ac · agac · goruntu · tikla · yaz · tus · surukle · onayla · reddet · metin · bekle · js · pencere · durum · kapat\n' +
        'Ayrıntı: scripts/exe-surucu.mjs dosyasının başı.',
    );
}
