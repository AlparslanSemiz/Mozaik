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
import {
  answerDialog,
  mainList,
  open,
  openSettings,
  openSetup,
  openWithSample,
  reopen,
} from './helpers';
import { SCHEMA_VERSION } from '../src/leaf/model';

const DOLU = JSON.parse(readFileSync(resolve('src/fixtures/tam-dolu-kurs-dizili.json'), 'utf8'));
// One past whatever this build writes: a fixed 17 stopped being newer on schema v17.
const YENI = JSON.stringify({ ...DOLU, schemaVersion: SCHEMA_VERSION + 1 });

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
    await expect(panel).toContainText('bir önceki açılış');
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

// The audit of 2026-11-16: a wiped WebView2 profile opened empty, and the first
// change went over the whole school in the live file and in today's backup.
// Two copies of the full fixture: a plan of 192 rows each, and the sample
// school's 152 rows are under half of the two together (folder.ts, `shrinks`).
const TWO_PLANS = JSON.stringify({
  bundleVersion: 1,
  savedAt: '2026-10-23T18:00:00.000Z',
  activeId: '1',
  plans: [
    { id: '1', name: '1. plan', draft: false, state: DOLU },
    { id: 'ikinci', name: '2. plan', draft: false, state: DOLU },
  ],
});
const found = (page: Page) =>
  page.locator('.save-warning', { hasText: 'daha dolu bir plan dosyası var' });
const shrunk = (page: Page) => page.locator('.save-warning', { hasText: 'Plan çok küçüldü' });
const writesOf = (d: { calls: string[] }) => d.calls.filter((c) => /^(write|remove)_file/.test(c));

test.describe('94. Exe: silinmiş profil Belgelerim’deki kaydı öneriyor (denetim 2026-11-16)', () => {
  test('boş açılış: şerit dolu dosyayı söylüyor, “son kaydı aç” iki planı da getiriyor', async ({
    page,
  }) => {
    await fakeExe(page, { 'ders-programi-tumu.json': TWO_PLANS });
    await open(page);
    await expect(found(page)).toContainText('ders-programi-tumu.json');
    await expect(found(page)).toContainText(`${DOLU.teachers.length * 2} öğretmen`);
    await page.waitForTimeout(3000);
    expect(writesOf(await disk(page))).toEqual([]);
    await page.getByRole('button', { name: "Belgelerim'deki son kaydı aç" }).click();
    await expect(found(page)).toHaveCount(0);
    await expect
      .poll(async () => JSON.parse((await stored(page, 'ders-programi')) ?? '{}').teachers?.length)
      .toBe(DOLU.teachers.length);
    expect(await stored(page, 'ders-programi-plan-ikinci')).not.toBeNull();
    // Written back only now, and it is the same school.
    await expect
      .poll(async () => (await disk(page)).calls.includes('write_file:ders-programi-tumu.json'))
      .toBe(true);
    const main = JSON.parse((await disk(page)).files['ders-programi-tumu.json']!) as {
      plans: unknown[];
    };
    expect(main.plans).toHaveLength(2);
  });

  test('“Boş başla” ve örnek okul: ana dosya korunuyor, yeni hâl kurtarma dosyasında, yenilemede de', async ({
    page,
  }) => {
    await fakeExe(page, { 'ders-programi-tumu.json': TWO_PLANS });
    await open(page);
    await page.getByRole('button', { name: 'Boş başla' }).click();
    await page.getByRole('button', { name: /Örnek okulu yükle/ }).click();
    await answerDialog(page);
    await expect(shrunk(page)).toBeVisible({ timeout: 8000 });
    let d = await disk(page);
    expect(d.files['ders-programi-tumu.json']).toBe(TWO_PLANS);
    const rescue = Object.keys(d.files).filter((n) => /^ders-programi-kurtarma-/.test(n));
    expect(rescue).toHaveLength(1);
    expect(teachersIn(d.files[rescue[0]!])).toBe(25);
    // The reload: the storage holds the sample now, read and full. The live
    // file still holds the school, and the line is back after the first write.
    await page.reload();
    await expect(shrunk(page)).toBeVisible({ timeout: 8000 });
    await expect(found(page)).toHaveCount(0);
    d = await disk(page);
    expect(d.files['ders-programi-tumu.json']).toBe(TWO_PLANS);
    // The user says the sample is the one to keep, and is asked once more.
    await shrunk(page).getByRole('button', { name: 'Yeni hâlini asıl dosya yap' }).click();
    await answerDialog(page);
    await expect(shrunk(page)).toHaveCount(0);
    await expect
      .poll(async () => teachersIn((await disk(page)).files['ders-programi-tumu.json']))
      .toBe(25);
  });

  test('küçülme şeridinden “son kaydı aç” klasördeki okulu geri getiriyor', async ({ page }) => {
    await fakeExe(page, { 'ders-programi-tumu.json': TWO_PLANS });
    await open(page);
    await page.getByRole('button', { name: 'Boş başla' }).click();
    await page.getByRole('button', { name: /Örnek okulu yükle/ }).click();
    await answerDialog(page);
    await expect(shrunk(page)).toBeVisible({ timeout: 8000 });
    await shrunk(page).getByRole('button', { name: "Belgelerim'deki son kaydı aç" }).click();
    await expect
      .poll(async () => JSON.parse((await stored(page, 'ders-programi')) ?? '{}').teachers?.length)
      .toBe(DOLU.teachers.length);
    await expect(shrunk(page)).toHaveCount(0, { timeout: 8000 });
    expect(teachersIn((await disk(page)).files['ders-programi-tumu.json'])).toBe(
      DOLU.teachers.length,
    );
  });

  test('silme günün silmeden-önce dosyasına önceki hâli yazıyor', async ({ page }) => {
    await fakeExe(page, {});
    await open(page);
    await page.getByRole('button', { name: /Örnek okulu yükle/ }).click();
    await answerDialog(page);
    await page.waitForTimeout(2500);
    await openSetup(page, 'Sınıflar');
    await mainList(page).locator('tbody tr').first().getByRole('button', { name: 'Sil' }).click();
    await expect
      .poll(async () =>
        Object.keys((await disk(page)).files).filter((n) =>
          /^ders-programi-silmeden-once-/.test(n),
        ),
      )
      .toHaveLength(1);
    const d = await disk(page);
    const name = Object.keys(d.files).find((n) => /^ders-programi-silmeden-once-/.test(n))!;
    expect((JSON.parse(d.files[name]!) as { classes: unknown[] }).classes).toHaveLength(20);
  });
});

// TODO SD1's deletions ask no question and keep their undo in memory. After a
// reload the state from before them was nowhere (the audit of 2026-11-16).
test.describe('94. Son silme yenilemeden sonra geri getiriliyor (SD1)', () => {
  const lastDelete = (page: Page) =>
    page.locator('.save-warning', { hasText: 'Son silmeyi geri almak için' });
  const classesStored = async (page: Page) =>
    (JSON.parse((await stored(page, 'ders-programi')) ?? '{}') as { classes?: unknown[] }).classes
      ?.length;

  test('sınıf silinip sayfa yenilenince bir kez “Geri getir” çıkıyor ve sınıfı getiriyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    await mainList(page).locator('tbody tr').first().getByRole('button', { name: 'Sil' }).click();
    await expect.poll(() => classesStored(page)).toBe(19);
    await reopen(page);
    await expect(lastDelete(page)).toContainText('silindi');
    await lastDelete(page).getByRole('button', { name: 'Geri getir' }).click();
    await expect(lastDelete(page)).toHaveCount(0);
    await expect.poll(() => classesStored(page)).toBe(20);
    // Once: the next reload does not offer it again.
    await reopen(page);
    await page.waitForTimeout(500);
    await expect(lastDelete(page)).toHaveCount(0);
  });

  test('“Her şeyi sil”den sonra yenileme: plan geri geliyor', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Hakkında');
    await page.getByRole('button', { name: 'Her şeyi sil' }).click();
    await answerDialog(page);
    await expect.poll(() => classesStored(page)).toBe(0);
    await reopen(page);
    await lastDelete(page).getByRole('button', { name: 'Geri getir' }).click();
    await expect.poll(() => classesStored(page)).toBe(20);
  });

  test('geri alınmış silme yenilemede önerilmiyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    await mainList(page).locator('tbody tr').first().getByRole('button', { name: 'Sil' }).click();
    await page.locator('.toast').getByRole('button', { name: 'Geri al' }).click();
    await expect.poll(() => classesStored(page)).toBe(20);
    await reopen(page);
    await page.waitForTimeout(500);
    await expect(lastDelete(page)).toHaveCount(0);
  });
});
