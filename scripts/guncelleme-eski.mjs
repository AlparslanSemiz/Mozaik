// The upgrade gate, first half: the LAST RELEASED exe makes the data a
// father's machine holds today. `.github/workflows/guncelleme-windows.yml`
// downloads that exe from the latest Release (its checksum checked there),
// and this script, on the runner:
//
//   1. empties the program's folder and profile (`windowsTemizle`), so the
//      only data is what the old version writes;
//   2. "installs" it: copies it to `--kur`/Mozaik.exe, the one-file delivery;
//   3. starts it and, through Windows UI Automation (scripts/uia.mjs: the
//      released exe has no debugging port), loads the sample school and has
//      it filled automatically, as a person would;
//   4. waits for the old version's own write to Documents\Ders Programı
//      (`ders-programi-tumu.json`) to hold the school and the placed week,
//      and to stop changing;
//   5. closes it with the title bar's X (scripts/pencere-kapat.mjs) and waits
//      for the process to end;
//   6. writes `--cikti`: that bundle as the old version wrote it, and the
//      folder's file names.
//
// e2e/guncelleme-exe.spec.ts is the second half: the new exe swapped into the
// same file, opening this data. Runs only on a GitHub-hosted runner, because
// step 1 deletes the real folder and profile (`windowsYerleri`).
//
//   node scripts/guncelleme-eski.mjs --eski <Mozaik.exe> --kur <klasör> --cikti <anlık.json>

import { spawn } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
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
const kur = arguman('--kur');
const cikti = arguman('--cikti');
const bekle = (ms) => new Promise((tamam) => setTimeout(tamam, ms));

// The runner's Windows is English and WebView2 takes its language from there,
// so the old version speaks English; the Turkish names are there for a runner
// that does not.
const ADLAR = {
  ornek: ['Fill with sample data', 'Örnek veriyle doldur'],
  yukle: ['Load', 'Yükle'],
  program: ['Timetable', 'Program'],
  diz: ['Fill automatically', 'Otomatik diz'],
};

/** The bundle the program last wrote, parsed, or null while there is none. */
function paket(klasor) {
  const dosya = join(klasor, 'ders-programi-tumu.json');
  if (!existsSync(dosya)) return null;
  try {
    return { metin: readFileSync(dosya, 'utf8'), json: JSON.parse(readFileSync(dosya, 'utf8')) };
  } catch {
    return null; // caught halfway through a write
  }
}

/** The open plan's state in a bundle. */
function acik(p) {
  return p?.json.plans?.find((x) => x.id === p.json.activeId)?.state;
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

mkdirSync(kur, { recursive: true });
const kurulu = join(kur, 'Mozaik.exe');
copyFileSync(eski, kurulu);
console.log(`kuruldu: ${kurulu}`);

const program = spawn(kurulu, [], { stdio: 'ignore' });
let bitti = false;
program.on('exit', () => (bitti = true));

try {
  // WebView2's first start on a fresh runner is slow (90 s in the exe suite).
  console.log(uiaBas(ADLAR.ornek, { sureMs: 120_000 }));
  console.log(uiaBas(ADLAR.yukle, { tam: true }));
  await bekleKi(
    'Örnek okulun klasöre yazılması',
    () => (acik(paket(yerler.klasor))?.teachers?.length ?? 0) > 0,
    30_000,
  );

  console.log(uiaBas(ADLAR.program, { tam: true }));
  console.log(uiaBas(ADLAR.diz));
  const yerlesen = () => {
    const s = acik(paket(yerler.klasor));
    const p = s?.programs?.find((x) => x.id === s.activeProgramId);
    return Object.keys(p?.placements ?? {}).length;
  };
  await bekleKi('Dizilmiş haftanın klasöre yazılması', () => yerlesen() > 0, 180_000);

  // Still now: the solver may place more after the first write, and each
  // change is written a moment later. Five seconds with no new text.
  let onceki = '';
  let ayni = 0;
  await bekleKi(
    'Klasördeki dosyanın durulması',
    () => {
      const simdi = JSON.stringify(acik(paket(yerler.klasor)) ?? null);
      ayni = simdi === onceki ? ayni + 1 : 0;
      onceki = simdi;
      return ayni >= 10;
    },
    120_000,
  );
} catch (e) {
  program.kill();
  throw e;
}

const kapanan = pencereyiKapat('Mozaik');
console.log(`X gönderilen pencere: ${kapanan}`);
await bekleKi('Eski sürümün kapanması', () => bitti, 30_000);

const son = paket(yerler.klasor);
const durum = acik(son);
if (son === null || durum === undefined) throw new Error('Kapandıktan sonra klasörde paket yok');
writeFileSync(
  cikti,
  JSON.stringify({ paket: son.metin, dosyalar: readdirSync(yerler.klasor).sort() }, null, 2),
);
const prog = durum.programs?.find((x) => x.id === durum.activeProgramId);
console.log(
  `eski sürümün verisi: şema ${durum.schemaVersion}, ${son.json.plans.length} plan, ` +
    `${durum.teachers.length} öğretmen, ${durum.classes.length} sınıf, ${durum.rooms.length} derslik, ` +
    `${durum.lessons.length} ders, ${Object.keys(prog?.placements ?? {}).length} yerleşmiş saat → ${cikti}`,
);
