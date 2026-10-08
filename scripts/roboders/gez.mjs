// `node scripts/roboders/gez.mjs`: walk Roboders one step at a time, guarded.
//
// The tour's only way in. It opens a context through `guvenliBaglam()`, so the
// guard is on before the first request, and then waits for one command at a
// time. There is no loop, no batch and no command that types, fills, drags or
// presses a key: what is not here cannot be done by mistake. Every click names
// its target and waits for "e" first, and `tiklanabilir()` refuses some targets
// before the question is even asked.
//
//   git <adres>    go to an address on roboders.com
//   tikla <ad>     click the ONE visible link, button, tab or menu item with
//                  this name (asks first)
//   foto <ad>      screenshot  -> scratch/roboders/ekran/<ad>.png
//   oku <ad>       the page's accessibility tree -> scratch/roboders/notlar/<ad>.yml
//   geri           browser back
//   kapat          close (the session file stays; giris.mjs --sil deletes it)
//
// `--oto` walks on its own instead (otomatik.mjs says what it will and will
// not click), headless, and stops at a ceiling:
//
//   node scripts/roboders/gez.mjs --oto [--tiklama 40] [--dakika 10]
//        [--alan /yol]... [--baslangic <adres>]
//
// It writes screenshots before and after every click under
// scratch/roboders/ekran/oto-<zaman>/ and the list of what it clicked and
// skipped to scratch/roboders/notlar/oto-<zaman>.md. Login stays manual,
// at the start of every tour (giris.mjs); no password is stored anywhere.
//
// Everything it writes is under scratch/roboders/, outside git: the
// screenshots show my father's real data and the repository is public.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';
import {
  BASLANGIC,
  IZINLI_SITE,
  KLASOR,
  OTURUM,
  guvenliBaglam,
  gunlukYazici,
  hedefBilgisi,
  tiklanabilir,
} from './koruma.mjs';
import { otomatikGez, rapor } from './otomatik.mjs';

const { values: argv } = parseArgs({
  options: {
    oto: { type: 'boolean', default: false },
    tiklama: { type: 'string', default: '40' },
    dakika: { type: 'string', default: '10' },
    alan: { type: 'string', multiple: true, default: [] },
    baslangic: { type: 'string', default: BASLANGIC },
  },
});

if (!existsSync(OTURUM)) {
  console.error('Oturum yok. Önce: node scripts/roboders/giris.mjs');
  process.exit(1);
}

const EKRAN = join(KLASOR, 'ekran');
const NOTLAR = join(KLASOR, 'notlar');
mkdirSync(EKRAN, { recursive: true, mode: 0o700 });
mkdirSync(NOTLAR, { recursive: true, mode: 0o700 });

let engellenen = 0;
const yaz = gunlukYazici();
const gunluk = (kayit) => {
  engellenen++;
  yaz(kayit);
  console.log(`  ⛔ ${kayit.yontem} ${kayit.adres} — ${kayit.sebep}`);
};

// The automatic tour runs headless: nobody is watching it, and a visible window
// takes the focus from whoever is at the machine (pitfall 145).
const browser = await chromium.launch({ headless: argv.oto });
const context = await guvenliBaglam(browser, { oturum: OTURUM, gunluk });
const page = await context.newPage();

if (argv.oto) {
  const tiklamaSiniri = Number(argv.tiklama);
  const dakika = Number(argv.dakika);
  if (!(tiklamaSiniri > 0 && dakika > 0)) {
    console.error('--tiklama ve --dakika birer pozitif sayı olmalı.');
    process.exit(1);
  }
  const zaman = new Date().toISOString().replace(/[:.]/g, '-');
  const baslangic = new URL(argv.baslangic);
  if (!IZINLI_SITE.test(baslangic.hostname)) {
    console.error(`Yalnız roboders.com: ${baslangic.hostname}`);
    process.exit(1);
  }
  console.log(`Otomatik tur: en çok ${tiklamaSiniri} tıklama, ${dakika} dakika.`);
  const sonuc = await otomatikGez(page, baslangic.href, {
    site: IZINLI_SITE,
    alanlar: argv.alan,
    tiklamaSiniri,
    sureSiniriMs: dakika * 60_000,
    ekran: join(EKRAN, `oto-${zaman}`),
  });
  await browser.close();
  const metin = rapor(sonuc, { engellenen });
  const yol = join(NOTLAR, `oto-${zaman}.md`);
  writeFileSync(yol, metin, { mode: 0o600 });
  console.log(metin);
  console.log(yol);
  process.exit(0);
}
const soru = createInterface({ input: process.stdin, output: process.stdout });

/** A file name a person can read: lower case letters, digits and dashes. */
function dosyaAdi(ad) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(ad ?? ''))
    throw new Error('Ad yalnız küçük harf, rakam ve tire: T1-03-yayinla');
  return ad;
}

async function git(adres) {
  const u = new URL(adres ?? BASLANGIC);
  if (!IZINLI_SITE.test(u.hostname)) throw new Error(`Yalnız roboders.com: ${u.hostname}`);
  await page.goto(u.href);
}

const ROLLER = ['link', 'button', 'tab', 'menuitem', 'treeitem', 'option'];

async function tikla(ad) {
  if (!ad) throw new Error('Hangi ad? tikla Raporlar');
  const adaylar = [];
  for (const rol of ROLLER) {
    const bulunan = page.getByRole(rol, { name: ad, exact: true });
    for (const l of await bulunan.all()) if (await l.isVisible()) adaylar.push(l);
  }
  if (adaylar.length !== 1) {
    throw new Error(`"${ad}" adında görünen ${adaylar.length} hedef var, tam bir tane olmalı.`);
  }
  const hedef = adaylar[0];
  const bilgi = await hedefBilgisi(hedef);
  const karar = tiklanabilir(bilgi);
  if (!karar.izin) throw new Error(`Tıklanmaz: ${karar.sebep}.`);
  const cevap = await soru.question(`  Tıklanacak: "${bilgi.ad}". Emin misin? (e/h) `);
  if (cevap.trim().toLocaleLowerCase('tr') !== 'e') {
    console.log('  Tıklanmadı.');
    return;
  }
  await hedef.click();
}

async function foto(ad) {
  const yol = join(EKRAN, `${dosyaAdi(ad)}.png`);
  if (existsSync(yol)) throw new Error(`Var: ${yol}`);
  await page.screenshot({ path: yol });
  console.log(`  ${yol}`);
}

async function oku(ad) {
  const yol = join(NOTLAR, `${dosyaAdi(ad)}.yml`);
  if (existsSync(yol)) throw new Error(`Var: ${yol}`);
  writeFileSync(yol, await page.locator('body').ariaSnapshot(), { mode: 0o600 });
  console.log(`  ${yol}`);
}

await git(BASLANGIC);
console.log('Komutlar: git <adres> · tikla <ad> · foto <ad> · oku <ad> · geri · kapat');

for (;;) {
  const satir = (await soru.question(`[${engellenen} engellendi] ${page.url()}\n> `)).trim();
  const [komut, ...kalan] = satir.split(/\s+/);
  const arg = kalan.join(' ');
  try {
    if (komut === 'kapat') break;
    else if (komut === 'git') await git(arg);
    else if (komut === 'tikla') await tikla(arg);
    else if (komut === 'foto') await foto(arg);
    else if (komut === 'oku') await oku(arg);
    else if (komut === 'geri') await page.goBack();
    else if (komut !== '') console.log('  Bilinmeyen komut.');
  } catch (e) {
    console.log(`  ${e instanceof Error ? e.message : e}`);
  }
}

soru.close();
await browser.close();
console.log(
  `${engellenen} istek engellendi. Oturumu silmek için: node scripts/roboders/giris.mjs --sil`,
);
