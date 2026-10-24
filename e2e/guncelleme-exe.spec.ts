// The upgrade gate, second half (`.github/workflows/guncelleme-windows.yml`).
// The first half (scripts/guncelleme-eski.mjs) had the LAST RELEASED exe make
// its data with its own hands and left that data's bundle in
// MOZAIK_GUNCELLEME_ANLIK. Here:
//
//   1. The released exe's file becomes the OLD TEST exe (this commit, built
//      as version 0.0.1 with its update roots on a local server, update.rs
//      `TEST_KOKU`), swapped the way update.rs swaps (`.yeni`, `.eski`).
//      The released exe cannot be made to fetch from anywhere but GitHub;
//      the old test exe runs the same update.rs, pointed here.
//   2. A local server publishes the NEW exe as a release does: `surum.json`
//      with the version, the address, the size and the digest, and the file.
//   3. The old copy is driven through Ayarlar → Hakkında as my father would:
//      Güncellemeleri denetle, Yeni sürümü indir, Şimdi yeniden başlat. It
//      finds the release, downloads it, checks size, shape and digest,
//      replaces its own file and starts the new version.
//   4. The suite attaches to the new version and asks: the installed file is
//      the published one, the old one was swept away, the new number is on
//      screen, and every value of every plan the released exe wrote is still
//      there, at the same place, in localStorage and in Documents\Ders
//      Programı, in the schema this commit declares. New fields may appear;
//      nothing may go, and no list may change length.
//
// Windows only: everywhere else the released exe never ran.

import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, readdirSync, renameSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import {
  Oturum,
  WINDOWS,
  surucuyuKapat,
  suruculuBaslat,
  windowsYerleri,
} from '../scripts/webdriver.mjs';
import { LIBRARY_KEY, planKey } from '../src/pure/io';
import { SCHEMA_VERSION } from '../src/leaf/model';

const KOK = resolve(import.meta.dirname, '..');
const ORTAM = {
  anlik: process.env.MOZAIK_GUNCELLEME_ANLIK,
  kurulu: process.env.MOZAIK_KURULU,
  eskiTest: process.env.MOZAIK_ESKI_TEST_EXE,
  yeni: process.env.MOZAIK_YENI_EXE,
  yeniSurum: process.env.MOZAIK_YENI_SURUM,
};
/** Where the old test exe looks for its next version (the workflow builds it with this). */
const SUNUCU_PORTU = 8765;

interface Plan {
  id: string;
  name: string;
  draft: boolean;
  state: Record<string, unknown>;
}

/**
 * Where `yeni` differs from `eski` by LOSING something: a value gone or
 * changed, a list grown or shrunk. Keys only `yeni` has are not losses. The
 * top-level `schemaVersion` is the one value expected to move.
 */
function kayiplar(eski: unknown, yeni: unknown, yol = '$'): string[] {
  if (eski === null || typeof eski !== 'object') {
    return Object.is(eski, yeni)
      ? []
      : [`${yol}: ${JSON.stringify(eski)} → ${JSON.stringify(yeni)}`];
  }
  if (Array.isArray(eski)) {
    if (!Array.isArray(yeni)) return [`${yol}: dizi değil artık`];
    if (eski.length !== yeni.length) return [`${yol}: ${eski.length} öğe → ${yeni.length}`];
    return eski.flatMap((x, i) => kayiplar(x, yeni[i], `${yol}[${i}]`));
  }
  if (yeni === null || typeof yeni !== 'object' || Array.isArray(yeni)) {
    return [`${yol}: nesne değil artık`];
  }
  const y = yeni as Record<string, unknown>;
  return Object.entries(eski).flatMap(([k, v]) =>
    yol === '$' && k === 'schemaVersion' ? [] : kayiplar(v, y[k], `${yol}.${k}`),
  );
}

const sha256 = (dosya: string) => createHash('sha256').update(readFileSync(dosya)).digest('hex');

/** The release, on loopback: the manifest surum.yml would write, and the file. */
async function yayinla(exe: string, surum: string) {
  const govde = readFileSync(exe);
  const kok = `http://127.0.0.1:${SUNUCU_PORTU}/`;
  const manifest = JSON.stringify({
    version: surum,
    date: new Date().toISOString().slice(0, 10),
    exe: `${kok}Mozaik.exe`,
    boyut: govde.length,
    sha256: createHash('sha256').update(govde).digest('hex'),
  });
  const istenen: string[] = [];
  const sunucu = createServer((istek, cevap) => {
    istenen.push(istek.url ?? '');
    if (istek.url === '/surum.json') {
      cevap.writeHead(200, { 'content-type': 'application/json' }).end(manifest);
    } else if (istek.url === '/Mozaik.exe') {
      cevap.writeHead(200, { 'content-type': 'application/octet-stream' }).end(govde);
    } else {
      cevap.writeHead(404).end();
    }
  });
  await new Promise<void>((tamam) => sunucu.listen(SUNUCU_PORTU, '127.0.0.1', tamam));
  return { istenen, kapat: () => new Promise((tamam) => sunucu.close(tamam)) };
}

test.describe('Güncelleme: yayınlanmış son exe → update.rs → bu commit’in exe’si (Windows)', () => {
  test.skip(!WINDOWS, 'Yalnız guncelleme-windows.yml’de, Windows runner’ında');

  test('eski kopya yeni sürümü bulup indiriyor, kendini değiştiriyor; veri eksiksiz', async ({}, testInfo) => {
    // Not a skip: on the runner a missing piece is a broken workflow, and a
    // skipped gate reads as a green one.
    for (const [ad, deger] of Object.entries(ORTAM)) expect(deger, `ortam: ${ad}`).toBeDefined();
    const anlik = JSON.parse(readFileSync(ORTAM.anlik!, 'utf8')) as {
      paket: string;
      dosyalar: string[];
    };
    const eski = JSON.parse(anlik.paket) as { activeId: string; plans: Plan[] };
    const eskiAcik = eski.plans.find((p) => p.id === eski.activeId)!;
    expect(eskiAcik, 'eski paketin açık planı').toBeDefined();
    expect(Number(eskiAcik.state.schemaVersion)).toBeLessThanOrEqual(SCHEMA_VERSION);
    const yerler = windowsYerleri();
    const kurulu = resolve(ORTAM.kurulu!);

    // 1. The released exe's place goes to the old test exe.
    copyFileSync(resolve(ORTAM.eskiTest!), `${kurulu}.yeni`);
    renameSync(kurulu, `${kurulu}.eski`);
    renameSync(`${kurulu}.yeni`, kurulu);

    // 2. The release, on loopback.
    const sunucu = await yayinla(resolve(ORTAM.yeni!), ORTAM.yeniSurum!);

    const port = 4444;
    const ev = join(KOK, 'test-results', 'guncelleme-exe', 'ev');
    const { pid } = suruculuBaslat({ port, ev, gunluk: testInfo.outputPath('surucu.log') });
    let oturum: Oturum | undefined;
    try {
      // 3. The old copy, through its own three buttons.
      oturum = await Oturum.ac({ port, ikili: kurulu, bekleMs: 120_000 });
      await oturum.bekle('h1', 90_000);
      await oturum.tikla('metin:Ayarlar');
      await oturum.tikla('metin:Hakkında');
      await oturum.bekle('metin:0.0.1', 15_000);
      await oturum.tikla('metin:Güncellemeleri denetle');
      await oturum.bekle('metin:Yeni sürümü indir', 30_000);
      await oturum.tikla('metin:Yeni sürümü indir');
      await oturum.bekle('metin:Şimdi yeniden başlat', 120_000);
      expect(existsSync(`${kurulu}.yeni`), 'indirilen dosya programın yanında').toBe(true);
      await oturum.js(`window.__mozaikEski = true;`);
      await oturum.tikla('metin:Şimdi yeniden başlat');
      // The old program ends itself; nothing of it is the suite's to kill.
      oturum.program = undefined;
      await oturum.kapat();

      // 4. The new version, started by the old one.
      oturum = await Oturum.windowsBaglan({ port, bekleMs: 120_000 });
      await oturum.bekle('h1', 90_000);
      expect(sunucu.istenen, 'eski kopya manifesti ve dosyayı istedi').toEqual([
        '/surum.json',
        '/Mozaik.exe',
      ]);
      expect(sha256(kurulu), 'kurulu dosya yayımlanan dosya').toBe(sha256(resolve(ORTAM.yeni!)));
      await expect.poll(() => existsSync(`${kurulu}.eski`), { timeout: 15_000 }).toBe(false);
      await oturum.tikla('metin:Ayarlar');
      await oturum.tikla('metin:Hakkında');
      await oturum.bekle(`metin:${ORTAM.yeniSurum!}`, 15_000);

      // The interface shows the old school before anything is touched.
      await oturum.tikla('metin:Okul');
      const seritte = await oturum.metin('.ribbon');
      const ogretmen = (eskiAcik.state.teachers as unknown[]).length;
      expect(seritte.replace(/\s+/g, ' ')).toContain(`Öğretmenler ${ogretmen}`);

      // One change, so the plan is written by the new version: the first
      // room's name, through its box in Okul → Derslikler. The old data with
      // that edit in it is what has to come back; a migration that rewrites
      // any OTHER value is a loss here, on purpose, until this test says so.
      const odalar = eskiAcik.state.rooms as { name: string }[];
      const yeniAd = `${odalar[0]!.name} güncellendi`;
      const beklenen = (plan: Plan): Record<string, unknown> => {
        if (plan.id !== eski.activeId) return plan.state;
        const kopya = structuredClone(plan.state) as { rooms: { name: string }[] };
        kopya.rooms[0]!.name = yeniAd;
        return kopya as unknown as Record<string, unknown>;
      };
      await oturum.tikla('metin:Derslikler');
      const bulundu = await oturum.js<boolean>(
        `const kutu = [...document.querySelectorAll('table.list tbody input[type="text"]')]
          .find((el) => el.value === args[0]);
        if (kutu) kutu.setAttribute('data-surucu', '9001');
        return !!kutu;`,
        odalar[0]!.name,
      );
      expect(bulundu, 'ilk dersliğin kutusu').toBe(true);
      await oturum.yaz('@9001', yeniAd);
      await oturum.js(`document.activeElement?.blur();`);

      const anahtarlar = Object.fromEntries(eski.plans.map((p) => [p.id, planKey(p.id)]));
      const depo = async () =>
        oturum!.js<{ kitaplik: string | null; planlar: Record<string, string | null> }>(
          `const a = args[0];
          return {
            kitaplik: localStorage.getItem(args[1]),
            planlar: Object.fromEntries(Object.entries(a).map(([id, k]) => [id, localStorage.getItem(k)])),
          };`,
          anahtarlar,
          LIBRARY_KEY,
        );
      await expect
        .poll(async () => (await depo()).planlar[eski.activeId] ?? '', { timeout: 15_000 })
        .toContain(yeniAd);

      const { kitaplik, planlar } = await depo();
      const lib = JSON.parse(kitaplik ?? 'null') as {
        activeId: string;
        plans: { id: string; name: string; draft: boolean }[];
      };
      expect(lib.activeId).toBe(eski.activeId);
      expect(lib.plans.map((p) => [p.id, p.name, p.draft])).toEqual(
        eski.plans.map((p) => [p.id, p.name, p.draft]),
      );
      for (const plan of eski.plans) {
        const yeni = JSON.parse(planlar[plan.id] ?? 'null') as Record<string, unknown> | null;
        expect(yeni, `${plan.name} depoda`).not.toBeNull();
        expect(kayiplar(beklenen(plan), yeni), `${plan.name}: depoda kaybolan`).toEqual([]);
      }
      const acikYeni = JSON.parse(planlar[eski.activeId]!) as { schemaVersion: number };
      expect(acikYeni.schemaVersion).toBe(SCHEMA_VERSION);

      // And the folder: the new version's own write, every plan in it.
      const dosya = join(yerler.klasor, 'ders-programi-tumu.json');
      await expect
        .poll(() => (existsSync(dosya) ? readFileSync(dosya, 'utf8') : ''), { timeout: 15_000 })
        .toContain(yeniAd);
      const klasorde = JSON.parse(readFileSync(dosya, 'utf8')) as { plans: Plan[] };
      expect(klasorde.plans.map((p) => p.id)).toEqual(eski.plans.map((p) => p.id));
      for (const plan of eski.plans) {
        const yeni = klasorde.plans.find((p) => p.id === plan.id)!.state;
        expect(kayiplar(beklenen(plan), yeni), `${plan.name}: klasörde kaybolan`).toEqual([]);
      }
      expect(klasorde.plans.find((p) => p.id === eski.activeId)!.state.schemaVersion).toBe(
        SCHEMA_VERSION,
      );
      // The old version's daily copies are still there: an upgrade deletes nothing.
      const simdi = readdirSync(yerler.klasor);
      for (const ad of anlik.dosyalar) expect(simdi, `klasörde ${ad}`).toContain(ad);
    } finally {
      if (oturum !== undefined && testInfo.status !== testInfo.expectedStatus) {
        const ekran = await oturum.goruntu().catch(() => undefined);
        if (ekran !== undefined) {
          await testInfo.attach('ekran', { body: ekran, contentType: 'image/png' });
        }
      }
      await oturum?.kapat().catch(() => undefined);
      // The new version was started by the old one, not by the suite.
      spawnSync('taskkill', ['/IM', 'Mozaik.exe', '/T', '/F'], { stdio: 'ignore' });
      surucuyuKapat(pid);
      await sunucu.kapat();
    }
  });
});
