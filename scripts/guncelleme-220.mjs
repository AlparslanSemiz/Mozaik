// The upgrade gate, the father's own path: the PUBLISHED v2.2.0's updater,
// its own code, against the manifest this commit will publish.
//
// v2.2.0 cannot be pointed at a test server: its manifest address
// (`https://github.com/AlparslanSemiz/Mozaik/releases/latest/download/surum.json`)
// is compiled in, and it has no test root (`MOZAIK_TEST_GUNCELLEME_KOKU` came
// later). So on the runner, and only there, github.com is made to be this
// machine for the length of the run:
//
//   1. a self-signed certificate for github.com, trusted by the machine
//      (LocalMachine\Root: the exe's TLS is Windows' own, schannel);
//   2. `127.0.0.1 github.com` in the hosts file;
//   3. an HTTPS server on 443 that answers the two addresses 2.2.0 asks for:
//      the manifest, and the standalone exe it names (the old repository
//      name, as surum.yml writes it). The manifest carries the installer
//      fields too, so 2.2.0 is seen to read a manifest it does not know all of.
//
// Then, with Windows UI Automation (scripts/uia.mjs, 2.2.0 has no debugging
// port): 2.2.0 under the father's file name (`Ders-Programi.exe`) finds the
// update, downloads it, swaps it in and starts it -- 2.2.0's code, every
// step. The program that comes up is this commit's (`--yeni`, its update
// roots the real ones): it must show the installer suggestion strip (the
// `.eski` 2.2.0 left beside it), and its own check must offer the installer
// of its own version (`gecis`). Pressing "Kurulumu indir" asks the server for
// `Mozaik-Kurulum.exe`, which is where this stops: the installer is unsigned
// here, and kurulum-windows.yml runs the installer path itself.
//
// Everything is put back in `finally`: hosts file, both certificates.
//
//   node scripts/guncelleme-220.mjs --eski <v2.2.0 Mozaik.exe> --yeni <bu commit'in exe'si> --kur <klasör>

import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:https';
import { join, resolve } from 'node:path';
import { pencereyiKapat } from './pencere-kapat.mjs';
import { uiaBas } from './uia.mjs';
import { windowsTemizle, windowsYerleri } from './webdriver.mjs';

const arguman = (ad) => {
  const i = process.argv.indexOf(ad);
  const deger = i < 0 ? undefined : process.argv[i + 1];
  if (deger === undefined) throw new Error(`${ad} verilmedi`);
  return resolve(deger);
};
const eski = arguman('--eski');
const yeni = arguman('--yeni');
const kur = arguman('--kur');
const bekle = (ms) => new Promise((tamam) => setTimeout(tamam, ms));
const ozet = (dosya) => createHash('sha256').update(readFileSync(dosya)).digest('hex');

/** v2.2.0's own file, as the Release published it (src/fixtures/release-v2.2.0). */
const ESKI_OZET = '2e26aca67ed3466dfa7b2e3e9d53bf34ea5f1042ad9b505e016ef2c6b0513533';

const ADLAR = {
  ayarlar: ['Settings', 'Ayarlar'],
  hakkinda: ['About', 'Hakkında'],
  denetle: ['Check for updates', 'Güncellemeleri denetle'],
  indir: ['Download the new version', 'Yeni sürümü indir'],
  baslat: ['Restart now', 'Şimdi yeniden başlat'],
  oneri: ['See the installer', 'Kuruluma bak'],
  kurulum: ['Download the installer', 'Kurulumu indir'],
};

function ps(betik) {
  return execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', betik], {
    encoding: 'utf8',
  }).trim();
}

async function bekleKi(ne, kosul, ms) {
  const son = Date.now() + ms;
  while (Date.now() < son) {
    if (kosul()) return;
    await bekle(500);
  }
  throw new Error(`${ne} ${Math.round(ms / 1000)} s içinde olmadı`);
}

if (ozet(eski) !== ESKI_OZET) throw new Error(`v2.2.0'ın exe'si değil: ${ozet(eski)}`);
const yerler = windowsYerleri();
windowsTemizle(yerler);

// The version the new exe answers with, and the one the manifest names. While
// package.json still says 2.2.0 (every commit before the release commit), 2.2.0
// would see nothing newer: the first answer then names 2.2.1, which only
// 2.2.0 compares. After the swap the manifest names the new exe's own number,
// which is exactly what it will find on the day.
const surum = JSON.parse(readFileSync('package.json', 'utf8')).version;
const ilkSurum = surum === '2.2.0' ? '2.2.1' : surum;
const yeniBayt = readFileSync(yeni);
const KOK = 'https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/';
let takasEdildi = false;
const manifest = () => ({
  version: takasEdildi ? surum : ilkSurum,
  date: '2026-11-16',
  exe: `${KOK}Mozaik.exe`,
  boyut: yeniBayt.length,
  sha256: createHash('sha256').update(yeniBayt).digest('hex'),
  kurulum: `${KOK}Mozaik-Kurulum.exe`,
  kurulum_boyut: 1,
  kurulum_sha256: '0'.repeat(64),
  imza: 'untrusted comment: deneme\n',
  kurulum_imza: 'untrusted comment: deneme\n',
});

const gelen = [];
const pfx = join(process.env.RUNNER_TEMP ?? kur, 'github-test.pfx');
const HOSTS = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
const hostsOnce = readFileSync(HOSTS, 'utf8');
let parmakIzi = '';
let sunucu;
let program;

try {
  parmakIzi = ps(
    "$c = New-SelfSignedCertificate -DnsName 'github.com' -Type SSLServerAuthentication " +
      '-CertStoreLocation Cert:\\LocalMachine\\My -KeyExportPolicy Exportable -NotAfter (Get-Date).AddDays(1); ' +
      `$p = ConvertTo-SecureString -String 'mozaik' -Force -AsPlainText; ` +
      `Export-PfxCertificate -Cert $c -FilePath '${pfx}' -Password $p | Out-Null; ` +
      `$cer = '${pfx}.cer'; Export-Certificate -Cert $c -FilePath $cer | Out-Null; ` +
      'Import-Certificate -FilePath $cer -CertStoreLocation Cert:\\LocalMachine\\Root | Out-Null; ' +
      '$c.Thumbprint',
  );
  writeFileSync(HOSTS, `${hostsOnce.trimEnd()}\r\n127.0.0.1 github.com\r\n`);
  ps('ipconfig /flushdns | Out-Null');

  sunucu = createServer({ pfx: readFileSync(pfx), passphrase: 'mozaik' }, (istek, cevap) => {
    gelen.push(istek.url);
    console.log(`istek: ${istek.method} ${istek.url} (${istek.headers['user-agent'] ?? ''})`);
    if (istek.url === '/AlparslanSemiz/Mozaik/releases/latest/download/surum.json') {
      cevap.writeHead(200, { 'content-type': 'application/json' });
      cevap.end(JSON.stringify(manifest()));
    } else if (istek.url === '/AlparslanSemiz/ders-programi/releases/latest/download/Mozaik.exe') {
      cevap.writeHead(200, { 'content-type': 'application/octet-stream' });
      cevap.end(yeniBayt);
    } else {
      cevap.writeHead(404);
      cevap.end();
    }
  });
  await new Promise((tamam) => sunucu.listen(443, '127.0.0.1', tamam));

  // The father's file name: the exe he downloaded before the rename.
  mkdirSync(kur, { recursive: true });
  const babanin = join(kur, 'Ders-Programi.exe');
  copyFileSync(eski, babanin);
  program = spawn(babanin, [], { stdio: 'ignore' });

  // 2.2.0, its own three buttons.
  console.log(uiaBas(ADLAR.ayarlar, { tam: true, sureMs: 120_000 }));
  console.log(uiaBas(ADLAR.hakkinda, { tam: true }));
  console.log(uiaBas(ADLAR.denetle, { tam: true }));
  console.log(uiaBas(ADLAR.indir, { tam: true, sureMs: 60_000 }));
  console.log(uiaBas(ADLAR.baslat, { tam: true, sureMs: 120_000 }));
  await bekleKi(
    "Yeni exe'nin 2.2.0'ın dosyasına geçmesi",
    () => existsSync(babanin) && statSync(babanin).size === yeniBayt.length,
    60_000,
  );
  if (ozet(babanin) !== createHash('sha256').update(yeniBayt).digest('hex')) {
    throw new Error('Ders-Programi.exe yeni exe değil');
  }
  takasEdildi = true;
  console.log("2.2.0 takas etti: Ders-Programi.exe artık bu commit'in exe'si");

  // The new exe, started by 2.2.0 with no flag: the strip, then its own check.
  console.log(uiaBas(ADLAR.oneri, { tam: true, sureMs: 120_000 }));
  console.log(uiaBas(ADLAR.kurulum, { tam: true, sureMs: 60_000 }));
  await bekleKi(
    'Kurulumun istenmesi',
    () => gelen.some((u) => u.endsWith('/Mozaik-Kurulum.exe')),
    30_000,
  );
  console.log('yeni exe aynı sürümün kurulumunu önerdi ve istedi');
} finally {
  try {
    pencereyiKapat('Mozaik');
  } catch {
    // nothing open
  }
  program?.kill();
  sunucu?.close();
  writeFileSync(HOSTS, hostsOnce);
  if (parmakIzi !== '') {
    ps(
      `Remove-Item Cert:\\LocalMachine\\Root\\${parmakIzi} -ErrorAction SilentlyContinue; ` +
        `Remove-Item Cert:\\LocalMachine\\My\\${parmakIzi} -ErrorAction SilentlyContinue`,
    );
  }
  ps('ipconfig /flushdns | Out-Null');
}
