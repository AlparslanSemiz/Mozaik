// The installer path, on the runner (kurulum-windows.yml): a standalone exe
// moves to the installed program through its own buttons, the way the
// standalone copy 2.2.0 swaps in will on the father's machine.
//
//   1. empties the program's folder and profile (`windowsTemizle`), and
//      leaves one marker in each: they must outlive everything below;
//   2. serves a manifest on the test root (127.0.0.1:8765, `TEST_KOKU`) of the
//      SAME version as the standalone exe, with the installer built in this
//      run beside it (no signature: the test copy accepts none);
//   3. starts the standalone test exe (`--tek`) and presses, through Windows
//      UI Automation, Okul bilgileri -> Daha fazla -> Hakkında -> Denetle -> "Kurulumu indir" ->
//      "Şimdi kur": update.rs's waiter runs the installer `/P /R`;
//   4. waits for the installed program to start and leave its note
//      (`kurulu-yol.txt`), and checks the files the installer put in place,
//      CP-SAT's libraries among them, and that the standalone file is still
//      there;
//   5. closes it, starts the standalone file again and checks that it opens
//      the installed program instead of itself (update.rs, `kurulu_hedef`).
//
// Uninstalling, and CP-SAT against the installed libraries, are the
// workflow's next steps.
//
//   node scripts/kurulum-gecisi.mjs --tek <Mozaik.exe> --kurulum <Mozaik-Kurulum.exe>

import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pencereyiKapat } from './pencere-kapat.mjs';
import { uiaBas } from './uia.mjs';
import { windowsTemizle, windowsYerleri } from './webdriver.mjs';
import { sunucuBaslat } from './yerel-sunucu.mjs';

const arguman = (ad) => {
  const i = process.argv.indexOf(ad);
  const deger = i < 0 ? undefined : process.argv[i + 1];
  if (deger === undefined) throw new Error(`${ad} verilmedi`);
  return resolve(deger);
};
const tek = arguman('--tek');
const kurulum = arguman('--kurulum');
const bekle = (ms) => new Promise((tamam) => setTimeout(tamam, ms));

const ADLAR = {
  // Okul bilgileri since 2026-11-16 (Sadeleşme K1); Hakkında is in its
  // strip's Daha fazla.
  ayarlar: ['School details', 'Okul bilgileri'],
  dahaFazla: ['More', 'Daha fazla'],
  hakkinda: ['About', 'Hakkında'],
  denetle: ['Check for updates', 'Güncellemeleri denetle'],
  kurulum: ['Download the installer', 'Kurulumu indir'],
  kur: ['Install now', 'Şimdi kur'],
};

/** The installer's files that CP-SAT needs (surum.yml, "OR-Tools CP-SAT for the installer"). */
const DOSYALAR = [
  'Mozaik.exe',
  'uninstall.exe',
  'ortools.dll',
  'abseil_dll.dll',
  'bz2.dll',
  'highs.dll',
  'libprotobuf.dll',
  'libscip.dll',
  'libutf8_validity.dll',
  're2.dll',
  'zlib1.dll',
  'msvcp140.dll',
  'vcruntime140.dll',
  'vcruntime140_1.dll',
];

function ps(betik) {
  return execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', betik], {
    encoding: 'utf8',
  }).trim();
}

/** The paths of every running Mozaik.exe. */
function calisanlar() {
  const cikti = ps(
    // `exit 0`: with no Mozaik running, Get-Process leaves $? false even under
    // SilentlyContinue and PowerShell exits 1; "none running" is an answer, not an error.
    'Get-Process -Name Mozaik -ErrorAction SilentlyContinue | ForEach-Object { $_.Path }; exit 0',
  );
  return cikti === '' ? [] : cikti.split(/\r?\n/).map((s) => s.trim().toLowerCase());
}

/** What the machine looks like when the install did not come up: the waiter's
    own log, the folders, the processes, and the installer's events. */
function teshis() {
  const bak = (ne, betik) => {
    try {
      console.log(`--- ${ne}\n${ps(betik)}`);
    } catch (e) {
      console.log(`--- ${ne}: okunamadı (${e.message})`);
    }
  };
  bak(
    'bekleyicinin günlüğü',
    "Get-Content (Join-Path $env:TEMP 'Mozaik-kurulum.log') -ErrorAction SilentlyContinue",
  );
  bak(
    'kurulum klasörü',
    "Get-ChildItem (Join-Path $env:LOCALAPPDATA 'Programs') -Recurse -Depth 2 -ErrorAction SilentlyContinue | Select-Object FullName, Length | Format-Table -AutoSize | Out-String -Width 200",
  );
  bak(
    'profil',
    "Get-ChildItem (Join-Path $env:LOCALAPPDATA 'com.dersprogrami.arac') -ErrorAction SilentlyContinue | Select-Object Name, LastWriteTime | Out-String -Width 200",
  );
  bak(
    'süreçler',
    "Get-Process | Where-Object { $_.Name -like '*Mozaik*' -or $_.Name -like 'ders-programi*' -or $_.Name -like '*kurulum*' -or $_.Name -like '*setup*' } | Select-Object Id, Name, Path, StartTime | Out-String -Width 250",
  );
  bak(
    'kayıt defteri',
    "Get-ChildItem 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall' -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '*Mozaik*' } | ForEach-Object { Get-ItemProperty $_.PSPath } | Out-String -Width 250",
  );
  bak(
    'uygulama olayları',
    'Get-WinEvent -LogName Application -MaxEvents 30 -ErrorAction SilentlyContinue | Where-Object { $_.TimeCreated -gt (Get-Date).AddMinutes(-10) } | Select-Object TimeCreated, ProviderName, Id, Message | Format-List | Out-String -Width 250',
  );
}

async function bekleKi(ne, kosul, ms) {
  const son = Date.now() + ms;
  while (Date.now() < son) {
    if (kosul()) return;
    await bekle(500);
  }
  throw new Error(`${ne} ${Math.round(ms / 1000)} s içinde olmadı`);
}

const yerler = windowsYerleri();
windowsTemizle(yerler);
// The installer's default folder (nsis/kancalar.nsh), written as Windows writes it.
const klasor = join(process.env.LOCALAPPDATA, 'Programs\\Mozaik');
if (existsSync(join(klasor, 'uninstall.exe'))) throw new Error(`zaten kurulu: ${klasor}`);
const kurulu = join(klasor, 'Mozaik.exe');

// What must survive the install and the uninstall: a backup under Belgeler and
// the profile, where the plans live.
mkdirSync(yerler.klasor, { recursive: true });
mkdirSync(yerler.profil, { recursive: true });
const yedek = join(yerler.klasor, 'ders-programi-2026-01-01.json');
const profilIsareti = join(yerler.profil, 'kurulum-deneme.txt');
writeFileSync(yedek, '{"deneme":true}');
writeFileSync(profilIsareti, 'kalmalı');

const surum = JSON.parse(readFileSync('package.json', 'utf8')).version;
const tekBayt = readFileSync(tek);
const kurBayt = readFileSync(kurulum);
const ozet = (b) => createHash('sha256').update(b).digest('hex');
const KOK = 'http://127.0.0.1:8765/';
// On a thread of its own: `uiaBas` blocks this one (scripts/yerel-sunucu.mjs).
const sunucu = await sunucuBaslat({
  port: 8765,
  yollar: {
    '/surum.json': {
      json: {
        version: surum,
        date: '2026-11-16',
        exe: `${KOK}Mozaik.exe`,
        boyut: tekBayt.length,
        sha256: ozet(tekBayt),
        kurulum: `${KOK}Mozaik-Kurulum.exe`,
        kurulum_boyut: kurBayt.length,
        kurulum_sha256: ozet(kurBayt),
      },
    },
    '/Mozaik-Kurulum.exe': { dosya: kurulum },
  },
});

try {
  spawn(tek, [], { stdio: 'ignore' });
  console.log(uiaBas(ADLAR.ayarlar, { tam: true, sureMs: 120_000 }));
  console.log(uiaBas(ADLAR.dahaFazla, { tam: true }));
  console.log(uiaBas(ADLAR.hakkinda, { tam: true }));
  console.log(uiaBas(ADLAR.denetle, { tam: true }));
  console.log(uiaBas(ADLAR.kurulum, { tam: true, sureMs: 60_000 }));
  console.log(uiaBas(ADLAR.kur, { tam: true, sureMs: 120_000 }));

  const not = join(yerler.profil, 'kurulu-yol.txt');
  try {
    await bekleKi(
      'Kurulan programın açılıp notunu yazması',
      () =>
        existsSync(not) &&
        readFileSync(not, 'utf8').split(/\r?\n/)[0].trim().toLowerCase() === kurulu.toLowerCase(),
      300_000,
    );
  } catch (e) {
    teshis();
    throw e;
  }
  console.log(`kuruldu ve açıldı: ${kurulu}`);
  const eksik = DOSYALAR.filter((d) => !existsSync(join(klasor, d)));
  if (eksik.length > 0) throw new Error(`kurulumda yok: ${eksik.join(', ')}`);
  if (!existsSync(tek)) throw new Error('tek başına dosya silinmiş');
  if (!calisanlar().includes(kurulu.toLowerCase())) {
    throw new Error(`kurulan program çalışmıyor: ${calisanlar().join(', ')}`);
  }

  // The old file now opens the installed program.
  pencereyiKapat('Mozaik');
  await bekleKi('Kurulan programın kapanması', () => calisanlar().length === 0, 30_000);
  const eskiDosya = spawn(tek, [], { stdio: 'ignore' });
  let cikti = null;
  eskiDosya.on('exit', (kod) => (cikti = kod));
  await bekleKi('Tek başına dosyanın devredip çıkması', () => cikti !== null, 30_000);
  await bekleKi(
    'Kurulan programın açılması',
    () => calisanlar().includes(kurulu.toLowerCase()),
    30_000,
  );
  console.log('eski dosya kurulan programı açtı');
  pencereyiKapat('Mozaik');
  await bekleKi('Kapanması', () => calisanlar().length === 0, 30_000);
} finally {
  await sunucu.kapat();
  // Best effort: a Mozaik that is already closing makes Stop-Process fail
  // ("process has exited"), and an error thrown in `finally` would hide the
  // real result of the steps above (first run on main, 2026-11-16).
  try {
    ps(
      'Get-Process -Name Mozaik -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; exit 0',
    );
  } catch {
    // nothing left to stop
  }
}

if (!existsSync(yedek) || !existsSync(profilIsareti)) throw new Error('veri gitti');
console.log('veri yerinde');
