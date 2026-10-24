// 94. Okunamayan kayıt ve boş açılış — üzerine yazılmıyor (A1, A2, madde 7).
//
// The audit of 2026-10-24 measured these on the real page, over file://, and
// every one of them is a copy of its reproduction (scratch/analiz/T2/e2e).
// A plan this copy cannot read (a newer schema, a body cut short) was read as
// "nothing" and the autosave wrote an empty plan over it 400 ms later, with no
// strip; the same on a switch to such a plan. In the exe that empty start then
// wrote an empty bundle over Belgelerim\Ders Programı, and the prune counted
// the empty backup among its ten, so a full one went on every new day. And the
// session backup chain rotated on every reload, so three reloads after a bad
// session left three copies of the bad session.
//
// The exe half fakes the Tauri bridge in the page, like exe.spec.ts; the disk
// lives in `window.name` so a reload keeps it. The page, useFolder and
// folder.ts are real; src-tauri/src/lib.rs is not (`cargo test` judges it).

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { open } from './helpers';

const DOLU = JSON.parse(readFileSync(resolve('src/fixtures/tam-dolu-kurs-dizili.json'), 'utf8'));
const YENI = JSON.stringify({ ...DOLU, schemaVersion: 17 });

const strip = (page: Page) => page.locator('.save-warning[role=alert]');

async function seedAndReload(page: Page, entries: Record<string, string>) {
  await open(page);
  await page.waitForTimeout(1200); // the opening autosave is behind us
  await page.evaluate((e) => {
    for (const [k, v] of Object.entries(e)) localStorage.setItem(k, v);
  }, entries);
  await page.reload();
  await expect(page.locator('.topbar')).toBeVisible();
  await page.waitForTimeout(2500); // well past the 400 ms autosave
}

const stored = (page: Page, key: string) => page.evaluate((k) => localStorage.getItem(k), key);

test.describe('94. Okunamayan kayıt üzerine yazılmıyor', () => {
  test('A2: daha yeni şemalı plan açılışta ezilmiyor, şerit söylüyor', async ({ page }) => {
    await seedAndReload(page, { 'ders-programi': YENI });
    expect(await stored(page, 'ders-programi')).toBe(YENI);
    await expect(strip(page)).toContainText('daha yeni bir sürümle');
  });

  test('A3: yarıda kesilmiş plan açılışta ezilmiyor, şerit söylüyor', async ({ page }) => {
    const cut = JSON.stringify(DOLU).slice(0, 20_000);
    await seedAndReload(page, { 'ders-programi': cut });
    expect(await stored(page, 'ders-programi')).toBe(cut);
    await expect(strip(page)).toContainText('Kayıtlı plan okunamadı');
  });

  test('F2: daha yeni şemalı plana geçmek onu ezmiyor', async ({ page }) => {
    const lib = {
      activeId: '1',
      plans: [
        { id: '1', name: '1. plan', draft: false },
        { id: 'zz', name: 'Yeni şema', draft: false },
      ],
    };
    await seedAndReload(page, {
      'ders-programi-planlar': JSON.stringify(lib),
      'ders-programi-plan-zz': YENI,
    });
    await page
      .locator('.topbar select')
      .filter({ has: page.locator('option[value="zz"]') })
      .selectOption('zz');
    await page.waitForTimeout(2000);
    expect(await stored(page, 'ders-programi-plan-zz')).toBe(YENI);
    await expect(strip(page)).toContainText('daha yeni bir sürümle');
  });

  test('madde 7: kötü bir oturumdan sonra üç yenileme iyi yedeği zincirden atmıyor', async ({
    page,
  }) => {
    const good = JSON.stringify(DOLU);
    await seedAndReload(page, { 'ders-programi': good }); // the end of a good session
    const bad = JSON.stringify({ ...DOLU, teachers: [], lessons: [] });
    await page.evaluate((t) => localStorage.setItem('ders-programi', t), bad);
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await expect(page.locator('.topbar')).toBeVisible();
      await page.waitForTimeout(800);
    }
    const chain = await page.evaluate(() =>
      [0, 1, 2].map((i) => {
        const t = localStorage.getItem(`ders-programi-yedek-${i}`);
        return t === null ? 'YOK' : `${(JSON.parse(t) as { teachers: unknown[] }).teachers.length}`;
      }),
    );
    expect(chain.slice(0, 2)).toEqual(['0', String(DOLU.teachers.length)]);
  });

  test('madde 7: okunamayan yedek Ayarlar → Planlar ve yedek’te görünüyor', async ({ page }) => {
    await seedAndReload(page, { 'ders-programi-yedek-0': YENI });
    await page.getByRole('button', { name: 'Ayarlar' }).click();
    await page.locator('.ribbon .btn', { hasText: 'Planlar ve yedek' }).first().click();
    const panel = page.locator('.panel', { hasText: 'Bu bilgisayardaki otomatik yedekler' });
    await expect(panel).toContainText('bir önceki');
    await expect(panel).toContainText('daha yeni bir sürümle yazılmış');
  });
});

// --------------------------------------------------------------- the exe

function day(back: number): string {
  const d = new Date();
  d.setDate(d.getDate() - back);
  const p = (n: number) => String(n).padStart(2, '0');
  return `ders-programi-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

const FULL_BUNDLE = JSON.stringify({
  bundleVersion: 1,
  savedAt: '2026-10-23T18:00:00.000Z',
  activeId: '1',
  plans: [{ id: '1', name: '1. plan', draft: false, state: DOLU }],
});

const teachersIn = (text: string | undefined) =>
  text === undefined
    ? 'YOK'
    : (JSON.parse(text) as { plans: Array<{ state: { teachers: unknown[] } }> }).plans[0]!.state
        .teachers.length;

async function fakeExe(page: Page, seeded: Record<string, string>) {
  await page.addInitScript((files0: Record<string, string>) => {
    let files: Record<string, string>;
    try {
      files = (JSON.parse(window.name || 'null') as Record<string, string> | null) ?? files0;
    } catch {
      files = files0;
    }
    const save = () => {
      window.name = JSON.stringify(files);
    };
    save();
    const calls: string[] = [];
    (window as unknown as { __disk: unknown }).__disk = { files, calls };
    (window as unknown as { __TAURI__: unknown }).__TAURI__ = {
      core: {
        invoke: async (cmd: string, a?: Record<string, unknown>) => {
          const name = a?.name as string | undefined;
          calls.push(name === undefined ? cmd : `${cmd}:${name}`);
          if (cmd === 'data_dir_path') return 'C:\\Users\\baba\\Belgeler\\Ders Programı';
          if (cmd === 'write_file') {
            files[name!] = a!.text as string;
            save();
            return undefined;
          }
          if (cmd === 'read_file') return files[name!] ?? null;
          if (cmd === 'list_files') return Object.keys(files);
          if (cmd === 'remove_file') {
            delete files[name!];
            save();
            return undefined;
          }
          if (cmd === 'self_update_supported') return true;
          throw new Error(`bilinmeyen komut: ${cmd}`);
        },
      },
    };
  }, seeded);
}

const disk = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __disk: { files: Record<string, string>; calls: string[] } }).__disk,
  );

test.describe('94. Exe: boş ya da okunamayan depo klasörü ezmiyor', () => {
  test('B1/G1: depo boş, klasörde dolu ana dosya ve 12 dolu günlük: tek açılış hiçbirine dokunmuyor', async ({
    page,
  }) => {
    const seeded: Record<string, string> = {
      'ders-programi-tumu.json': FULL_BUNDLE,
      'babanin-kendi-dosyasi.json': '{"x":1}',
    };
    for (let b = 1; b <= 12; b++) seeded[day(b)] = FULL_BUNDLE;
    await fakeExe(page, seeded);
    await open(page);
    await page.waitForTimeout(3500);
    const d = await disk(page);
    expect(d.calls.filter((c) => /^(write|remove)_file/.test(c))).toEqual([]);
    expect(teachersIn(d.files['ders-programi-tumu.json'])).toBe(DOLU.teachers.length);
    expect(Object.keys(d.files)).toHaveLength(14);
  });

  test('B2: depoda daha yeni şema: ne depo ne klasör eziliyor', async ({ page }) => {
    const seeded = { 'ders-programi-tumu.json': FULL_BUNDLE, [day(0)]: FULL_BUNDLE };
    await fakeExe(page, seeded);
    await open(page);
    await page.waitForTimeout(1500);
    await page.evaluate((t) => localStorage.setItem('ders-programi', t), YENI);
    await page.evaluate((s) => {
      window.name = JSON.stringify(s);
    }, seeded);
    await page.reload();
    await page.waitForTimeout(3500);
    const d = await disk(page);
    expect(teachersIn(d.files['ders-programi-tumu.json'])).toBe(DOLU.teachers.length);
    expect(teachersIn(d.files[day(0)])).toBe(DOLU.teachers.length);
    expect(await stored(page, 'ders-programi')).toBe(YENI);
    await expect(strip(page)).toContainText('daha yeni bir sürümle');
  });

  test('G2: on gün art arda boş açılış, dolu günlüklerin hiçbiri düşmüyor', async ({ page }) => {
    test.setTimeout(90_000); // eleven opens, three seconds each
    const seeded: Record<string, string> = { 'ders-programi-tumu.json': FULL_BUNDLE };
    for (let b = 1; b <= 10; b++) seeded[day(b)] = FULL_BUNDLE;
    await fakeExe(page, seeded);
    for (let k = 0; k <= 10; k++) {
      await page.clock.setSystemTime(new Date(Date.now() + k * 86_400_000 + 3_600_000));
      if (k === 0) await open(page);
      else await page.reload();
      await page.waitForTimeout(3000);
      const d = await disk(page);
      const full = Object.keys(d.files).filter(
        (n) => /\d{4}-\d{2}-\d{2}\.json$/.test(n) && teachersIn(d.files[n]) !== 0,
      ).length;
      expect(full, `gün+${k}`).toBe(10);
    }
  });
});
