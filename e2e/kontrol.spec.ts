// The Kontrol tab, which had almost no coverage: the thing aSc does not do and
// that hurts most at the school is saying WHY a timetable cannot be built, and
// until now only "does the page render" was checked.
//
// Every case is built from a hand-made backup loaded through the real
// "Dosyadan aç" dialog, so the numbers in the assertions can be worked out on
// paper: 1 day x 4 hours, one room, one class.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { makeWorld, type WorldSpec } from '../src/worlds';
import { loadWorld, open, openWithSample } from './helpers';

/**
 * Loads a tiny hand-built world through the real backup dialog.
 *
 * The world itself is built by src/worlds.ts, which the solver tests use too —
 * one description of "a small school", type-checked by `tsc` because it lives
 * under src/ where the e2e folder is not checked at all.
 */
async function load(page: Page, world: WorldSpec) {
  await loadWorld(page, makeWorld(world), 'Kontrol');
}

test.describe('26. Kontrol — kapasite', () => {
  test('veri yokken ne yapılacağını söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.empty-screen')).toContainText('Kontrol edilecek bir şey yok');
    await expect(page.locator('.empty-screen')).toContainText('Kurulum');
  });

  test('her şey sığıyorsa net biçimde "Sorun görünmüyor" diyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.ok-box')).toContainText('Sorun görünmüyor');
    await expect(page.locator('table.list .badge.impossible')).toHaveCount(0);
  });

  test('öğretmene müsait olduğundan fazla ders yüklenince İmkânsız', async ({ page }) => {
    // 4 hours in the week, 2 of them closed, 3 hours of lessons loaded.
    await load(page, {
      unavailable: { 'oMC|0|0': 1, 'oMC|0|1': 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3 }],
    });

    const row = page.locator('table.list tr', { hasText: 'MÇ 2 saat müsait' });
    await expect(row).toContainText('3 saat ders yüklenmiş');
    await expect(row).toContainText('1 saat fazla');
    await expect(row.locator('.badge.impossible')).toBeVisible();
  });

  test('sınıfa haftasından fazla ders yüklenince İmkânsız', async ({ page }) => {
    await load(page, {
      teachers: [{ id: 'oMC', short: 'MÇ' }, { id: 'oAV', short: 'AV', subject: 'Fizik' }],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3 },
        { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 3 },
      ],
    });

    const row = page.locator('table.list tr', { hasText: '510 sınıfına 6 saat' });
    await expect(row).toContainText('2 saat fazla');
    await expect(row.locator('.badge.impossible')).toBeVisible();
  });

  test('dersliği paylaşan sınıfların TOPLAMI da sayılıyor', async ({ page }) => {
    // Two classes, one room, 4 hours in the week, 3 + 3 hours of lessons.
    await load(page, {
      teachers: [{ id: 'oMC', short: 'MÇ' }, { id: 'oAV', short: 'AV', subject: 'Fizik' }],
      classes: [
        { id: 's510', name: '510', roomId: 'dA' },
        { id: 's511', name: '511', roomId: 'dA' },
      ],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3 },
        { id: 'x2', classId: 's511', teacherId: 'oAV', weeklyHours: 3 },
      ],
    });

    const row = page.locator('table.list tr', { hasText: 'A dersliğini 2 sınıf paylaşıyor' });
    await expect(row).toContainText('toplam 6 saat');
    await expect(row).toContainText('2 saat fazla');
    await expect(row.locator('.badge.impossible')).toBeVisible();
  });

  test('sıkışık ama mümkün olan yük uyarı veriyor, engel değil', async ({ page }) => {
    // 4 hours open, 4 loaded: above the 85% "this will be hard" line.
    await load(page, {
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4 }],
    });
    await expect(page.locator('table.list .badge.tight').first()).toBeVisible();
    // Scoped to the tables: the intro paragraph SHOWS an "İmkânsız" badge to
    // explain what one looks like.
    await expect(page.locator('table.list .badge.impossible')).toHaveCount(0);
  });
});

test.describe('27. Kontrol — yerleşemeyenler ve kural ihlalleri', () => {
  test('koyacak yeri kalmamış dersi ve sebebini listeliyor', async ({ page }) => {
    // MÇ cannot come at all: the lesson has nowhere to go.
    await load(page, {
      unavailable: { 'oMC|0|0': 1, 'oMC|0|1': 1, 'oMC|0|2': 1, 'oMC|0|3': 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 }],
    });

    const panel = page.locator('.panel', { hasText: 'Yerleşemeyen dersler' });
    await expect(panel).toContainText('510 · MÇ Matematik');
    await expect(panel).toContainText('Örnek sebep: MÇ Salı 1 saatinde müsait değil');
  });

  test('art arda sınırı aşan program ihlal olarak sayılıyor', async ({ page }) => {
    await load(page, {
      limits: { maxConsecutive: 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x1' },
    });

    const panel = page.locator('.panel', { hasText: 'Kural ihlalleri' });
    await expect(panel).toContainText('art arda');
    await expect(panel.locator('.badge.impossible')).toBeVisible();
  });

  test('günde en fazla sınırı sayılıyor', async ({ page }) => {
    await load(page, {
      limits: { maxPerDay: 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2, blockSize: 1 }],
      placements: { 's510|0|0': 'x1', 's510|0|2': 'x1' },
    });
    await expect(page.locator('.panel', { hasText: 'Kural ihlalleri' })).toContainText(
      'Salı günü',
    );
  });

  test('günde en az kuralı yalnız burada yakalanıyor ve Uyarı olarak', async ({ page }) => {
    // minPerDay can never block a placement — the first lesson of a day always
    // breaches it — so this tab is the only place it can surface at all.
    await load(page, {
      limits: { minPerDay: 2 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 }],
      placements: { 's510|0|0': 'x1' },
    });

    const panel = page.locator('.panel', { hasText: 'Kural ihlalleri' });
    await expect(panel).toContainText('en az');
    await expect(panel.locator('.badge.tight')).toBeVisible();
  });

  test('bir sınıfın aynı dersten günlük sınırı sayılıyor', async ({ page }) => {
    await load(page, {
      limits: { maxSameLessonPerDay: 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
      placements: { 's510|0|0': 'x1', 's510|0|1': 'x1' },
    });
    await expect(page.locator('.panel', { hasText: 'Kural ihlalleri' })).toContainText(
      '510 sınıfı',
    );
  });

  test('kapalı saatte kalan ders sayılıyor ve sebebi yazıyor', async ({ page }) => {
    await load(page, {
      unavailable: { 'oMC|0|0': 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 }],
      placements: { 's510|0|0': 'x1' },
    });

    const panel = page.locator('.panel', { hasText: 'Kapalı saatte ders' });
    await expect(panel).toContainText('MÇ Salı 1 saatinde müsait değil');
    await expect(panel).toContainText('Hiçbiri silinmedi');
  });
});
