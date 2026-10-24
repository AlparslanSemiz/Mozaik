// The upgrade gate, second half (`.github/workflows/guncelleme-windows.yml`):
// the new exe is swapped into the file the LAST RELEASED exe was installed as,
// the way that exe's own update swaps it (update.rs: the new file next to the
// old as `.yeni`, the old renamed to `.eski`, the new renamed into its place),
// and it opens the data the old version wrote with its own hands
// (scripts/guncelleme-eski.mjs, the first half, which leaves the bundle it saw
// in MOZAIK_GUNCELLEME_ANLIK).
//
// What "nothing lost" means here: every value of every plan the old version
// had is still there, at the same place, in what the new one stores in
// localStorage and in what it writes to Documents\Ders Programı; and the plan
// opens in the schema this commit declares. New fields may appear (v17's
// teacher address); nothing may go, and no list may change length.
//
// Windows only, and only with the first half's data: on any other machine
// the old version never ran.

import { copyFileSync, existsSync, readFileSync, readdirSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  Oturum,
  WINDOWS,
  surucuyuKapat,
  suruculuBaslat,
  varsayilanIkili,
  windowsYerleri,
} from '../scripts/webdriver.mjs';
import { LIBRARY_KEY, planKey } from '../src/pure/library';
import { SCHEMA_VERSION } from '../src/leaf/types';

const KOK = resolve(import.meta.dirname, '..');
const ANLIK = process.env.MOZAIK_GUNCELLEME_ANLIK;
const KURULU = process.env.MOZAIK_KURULU;

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

test.describe('Güncelleme: yayınlanmış son exe → bu commit’in exe’si (Windows)', () => {
  test.skip(!WINDOWS, 'Yalnız guncelleme-windows.yml’de, Windows runner’ında');

  test('eski sürümün yazdığı her şey yeni exe’de, şimdiki şemada', async ({}, testInfo) => {
    // Not a skip: on the runner a missing first half is a broken workflow,
    // and a skipped gate reads as a green one.
    expect(ANLIK, 'MOZAIK_GUNCELLEME_ANLIK (scripts/guncelleme-eski.mjs)').toBeDefined();
    expect(KURULU, 'MOZAIK_KURULU').toBeDefined();
    const anlik = JSON.parse(readFileSync(ANLIK!, 'utf8')) as { paket: string; dosyalar: string[] };
    const eski = JSON.parse(anlik.paket) as { activeId: string; plans: Plan[] };
    const eskiAcik = eski.plans.find((p) => p.id === eski.activeId)!;
    expect(eskiAcik, 'eski paketin açık planı').toBeDefined();
    expect(Number(eskiAcik.state.schemaVersion)).toBeLessThanOrEqual(SCHEMA_VERSION);
    const yerler = windowsYerleri();

    // The swap, as update.rs does it after a download.
    const kurulu = resolve(KURULU!);
    copyFileSync(varsayilanIkili(), `${kurulu}.yeni`);
    renameSync(kurulu, `${kurulu}.eski`);
    renameSync(`${kurulu}.yeni`, kurulu);

    const port = 4444;
    const ev = join(KOK, 'test-results', 'guncelleme-exe', 'ev');
    const { pid } = suruculuBaslat({ port, ev, gunluk: testInfo.outputPath('surucu.log') });
    let oturum: Oturum | undefined;
    try {
      oturum = await Oturum.ac({ port, ikili: kurulu, bekleMs: 120_000 });
      await oturum.bekle('h1', 90_000);

      // The new version cleans up after the swap (update.rs `sweep_old`).
      expect(existsSync(`${kurulu}.eski`), 'eski sürümün dosyası açılışta silindi').toBe(false);

      // The interface shows the old school before anything is touched.
      await oturum.tikla('metin:Okul');
      const seritte = await oturum.metin('.ribbon');
      const ogretmen = (eskiAcik.state.teachers as unknown[]).length;
      expect(seritte.replace(/\s+/g, ' ')).toContain(`Öğretmenler ${ogretmen}`);

      // The old data with this test's own edit in it. From the first release
      // that stores the address (v17), the old teacher already holds an
      // `email` and the edit changes it; a migration that rewrites any OTHER
      // value is still a loss here, on purpose, until the test says it is meant.
      const YAZILAN = 'guncelleme@example.com';
      const beklenen = (plan: Plan): Record<string, unknown> => {
        if (plan.id !== eski.activeId) return plan.state;
        const kopya = structuredClone(plan.state) as { teachers: Record<string, unknown>[] };
        const ilk = kopya.teachers[0];
        if (ilk !== undefined && 'email' in ilk) ilk.email = YAZILAN;
        return kopya as unknown as Record<string, unknown>;
      };

      // One change, so the plan is written by the new version: the v17 field,
      // through the box a person would use.
      await oturum.tikla('metin:Öğretmenler');
      const kutu = 'table.list tbody tr:first-child input[inputmode="email"]';
      await oturum.bekle(kutu, 15_000);
      await oturum.yaz(kutu, YAZILAN);
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
        .toContain(YAZILAN);

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
      const acikYeni = JSON.parse(planlar[eski.activeId]!) as {
        schemaVersion: number;
        teachers: { email?: unknown }[];
      };
      expect(acikYeni.schemaVersion).toBe(SCHEMA_VERSION);
      expect(acikYeni.teachers[0]!.email).toBe(YAZILAN);

      // And the folder: the new version's own write, every plan in it.
      const dosya = join(yerler.klasor, 'ders-programi-tumu.json');
      await expect
        .poll(() => (existsSync(dosya) ? readFileSync(dosya, 'utf8') : ''), { timeout: 15_000 })
        .toContain(YAZILAN);
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
      surucuyuKapat(pid);
    }
  });
});
