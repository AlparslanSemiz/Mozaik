// The Kontrol tab, which had almost no coverage: the thing aSc does not do and
// that hurts most at the school is saying WHY a timetable cannot be built, and
// until now only "does the page render" was checked.
//
// Every case is built from a hand-made backup loaded through the real
// "Dosyadan aç" dialog, so the numbers in the assertions can be worked out on
// paper: 1 day x 4 hours, one room, one class.

import { type Page } from '@playwright/test';
import { expect, test } from '../kapan';
import { makeWorld, type WorldSpec } from '../../src/testing/worlds';
import {
  loadWorld,
  onScreen,
  open,
  openWithSample,
  openWithSampleTheme,
  chooseScale,
  settledMotion,
} from '../helpers';

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

/**
 * Puts one capacity panel on screen.
 *
 * The report is one panel at a time since the strip became a view switcher —
 * the three used to be stacked in a sticky rail, reached by buttons that called
 * `scrollIntoView` at a rail that never moves.
 */
async function showCapacity(page: Page, which: string) {
  await page.locator('.ribbon').getByRole('button', { name: which, exact: true }).click();
}

test.describe('26. Kontrol — kapasite', () => {
  test('veri yokken ne yapılacağını söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    // The hidden Program tab has an empty state too — see `onScreen`.
    await expect(onScreen(page, '.empty-screen')).toContainText('Kontrol edilecek bir şey yok');
    await expect(onScreen(page, '.empty-screen')).toContainText('Okul');
  });

  test('her şey sığıyorsa net biçimde "Sorun görünmüyor" diyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.ok-box')).toContainText('Sorun görünmüyor');
    await expect(page.locator('table.stat .badge.impossible')).toHaveCount(0);
  });

  test('öğretmene müsait olduğundan fazla ders yüklenince İmkânsız', async ({ page }) => {
    // 4 hours in the week, 2 of them closed, 3 hours of lessons loaded.
    await load(page, {
      unavailable: { 'oMC|0|0': 1, 'oMC|0|1': 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3 }],
    });

    // The row is compact now — Ad | Açık | Yük | Durum — and the sentence it
    // used to spell out is its tooltip. Both are asserted: the numbers are what
    // the eye reads, the sentence is what the reader acts on.
    await showCapacity(page, 'Öğretmenler');
    const row = page.locator('#kontrol-ogretmenler tbody tr', { hasText: 'MÇ' });
    await expect(row.locator('td').nth(1)).toHaveText('2');
    await expect(row.locator('td').nth(2)).toHaveText('3');
    await expect(row.locator('.badge.impossible')).toBeVisible();
    await expect(row.locator('td').first()).toHaveAttribute('title', /3 saat ders yüklenmiş/);
    await expect(row.locator('td').first()).toHaveAttribute('title', /1 saat fazla/);
  });

  test('sınıfa haftasından fazla ders yüklenince İmkânsız', async ({ page }) => {
    await load(page, {
      teachers: [{ id: 'oMC', short: 'MÇ' }, { id: 'oAV', short: 'AV', subject: 'Fizik' }],
      lessons: [
        { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 3 },
        { id: 'x2', classId: 's510', teacherId: 'oAV', weeklyHours: 3 },
      ],
    });

    await showCapacity(page, 'Sınıflar');
    const row = page.locator('#kontrol-siniflar tbody tr', { hasText: '510' });
    await expect(row.locator('td').nth(2)).toHaveText('6');
    await expect(row.locator('.badge.impossible')).toBeVisible();
    await expect(row.locator('td').first()).toHaveAttribute('title', /2 saat fazla/);
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

    await showCapacity(page, 'Derslikler');
    const row = page.locator('#kontrol-derslikler tbody tr', { hasText: 'A' });
    await expect(row.locator('td').nth(2)).toHaveText('6');
    await expect(row.locator('.badge.impossible')).toBeVisible();
    await expect(row.locator('td').first()).toHaveAttribute('title', /2 sınıf paylaşıyor/);
    await expect(row.locator('td').first()).toHaveAttribute('title', /2 saat fazla/);
  });

  test('sıkışık ama mümkün olan yük uyarı veriyor, engel değil', async ({ page }) => {
    // 4 hours open, 4 loaded: above the 85% "this will be hard" line.
    await load(page, {
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4 }],
    });
    await showCapacity(page, 'Öğretmenler');
    await expect(page.locator('table.stat .badge.tight').first()).toBeVisible();
    // Scoped to the tables: the intro paragraph SHOWS an "İmkânsız" badge to
    // explain what one looks like. Every capacity view is checked, because
    // "tight somewhere, impossible nowhere" is the claim.
    for (const which of ['Öğretmenler', 'Sınıflar', 'Derslikler']) {
      await showCapacity(page, which);
      await expect(page.locator('table.stat .badge.impossible'), which).toHaveCount(0);
    }
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
    await expect(panel).toContainText('hiçbiri silinmedi');
  });
});

test.describe('89. Kontrol — Danışman uyarıları (B5.4)', () => {
  test('haftadan çok gün isteyen dersi Danışman\'da listeler, engel saymaz', async ({ page }) => {
    // 1-day world (load()'s default): a 2-hour lesson needs 2 separate days.
    await load(page, {
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
    });

    // Advice does not touch "Sorunlar" — it stays "Sorun görünmüyor".
    await expect(page.locator('.ok-box')).toContainText('Sorun görünmüyor');

    await page.locator('.ribbon').getByRole('button', { name: /^Danışman/ }).click();
    const panel = page.locator('.panel', { hasText: 'Danışman uyarıları' });
    await expect(panel).toContainText('yalnızca 1 gün var');
    await expect(panel).toContainText('en az bir günde iki kez görülecek');
    // A single-day world with a 2-block lesson trips BOTH heuristics — the
    // lesson needs more days than exist, and the teacher's one open day is
    // fewer than that lesson needs — so more than one row is expected here.
    await expect(panel.locator('.badge.tight').first()).toBeVisible();
  });

  test('açık günü yetmeyen öğretmeni Danışman\'da listeler', async ({ page }) => {
    // makeWorld's default world is 1 day; this needs 2, so the teacher has one
    // day left open after day 0 is closed entirely — the 2-block lesson needs 2.
    const world = makeWorld({
      days: 2,
      hours: 4,
      unavailable: { 'oMC|0|0': 1, 'oMC|0|1': 1, 'oMC|0|2': 1, 'oMC|0|3': 1 },
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
    });
    await loadWorld(page, world, 'Kontrol');

    await expect(page.locator('.ok-box')).toContainText('Sorun görünmüyor');
    await page.locator('.ribbon').getByRole('button', { name: /^Danışman/ }).click();
    const panel = page.locator('.panel', { hasText: 'Danışman uyarıları' });
    await expect(panel).toContainText('MÇ yalnızca 1 günde müsait');
    await expect(panel).toContainText('bir güne iki kez düşebilir');
  });

  test('hiç tekli saat bırakmayan çok bloklu dersi Danışman\'da listeler', async ({ page }) => {
    const world = makeWorld({
      days: 2,
      hours: 4,
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 6, blockSize: 3 }],
    });
    await loadWorld(page, world, 'Kontrol');

    await expect(page.locator('.ok-box')).toContainText('Sorun görünmüyor');
    await page.locator('.ribbon').getByRole('button', { name: /^Danışman/ }).click();
    const panel = page.locator('.panel', { hasText: 'Danışman uyarıları' });
    await expect(panel).toContainText('2 ayrı bloğa bölünmüş');
    await expect(panel).toContainText('çözücünün deneyebileceği tek şekil bu');
  });

  test('şeritteki Danışman düğmesi sayıyı taşıyor', async ({ page }) => {
    await load(page, {
      lessons: [{ id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 2 }],
    });
    await expect(
      page.locator('.ribbon').getByRole('button', { name: /^Danışman \(\d+\)$/ }),
    ).toBeVisible();
  });

});

// ---------------------------------------------------------------------------

/**
 * 28. B5.5 — "Kontrol kısmı çok saçma olmuş" ün kalan yarısı: does the report
 * still scroll past the screen?
 *
 * MEASURED, not assumed. The strip stopped being a filter on 2026-08-28 —
 * it CHOOSES which one panel exists, so the four views can no longer stack
 * on top of each other the way the old three-panel rail did. The prediction
 * is "no more scrolling", but a prediction is not a measurement (pitfall
 * 101) — hence this test reads `.main`'s own box rather than asserting from
 * memory.
 */
test.describe('88. Kontrol — sayfa boyu (B5.5)', () => {
  const VIEWS = ['Sorunlar', 'Danışman', 'Öğretmenler', 'Sınıflar', 'Derslikler'] as const;

  async function box(page: Page) {
    return page.evaluate(() => {
      const main = document.querySelector('.main') as HTMLElement;
      return {
        vertical: main.scrollHeight - main.clientHeight,
        horizontal: document.body.scrollWidth - document.body.clientWidth,
      };
    });
  }

  async function measureAllViews(
    page: Page,
    label: string,
    ceiling: number,
  ): Promise<Array<{ view: string; vertical: number; horizontal: number }>> {
    const rows: Array<{ view: string; vertical: number; horizontal: number }> = [];
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    for (const view of VIEWS) {
      // 'Sorunlar' carries a live count in its name ("Sorunlar (3)"), the
      // other three do not — a prefix match covers both without risking a
      // collision with another button (pitfall 49): this locator is already
      // scoped to the Kontrol strip alone.
      await page.locator('.ribbon').getByRole('button', { name: new RegExp('^' + view) }).click();
      await settledMotion(page);
      const m = await box(page);
      rows.push({ view, ...m });
      expect(m.vertical, `${label} · ${view}: dikey ${m.vertical}px taşıyor`).toBeLessThanOrEqual(
        ceiling,
      );
      expect(
        m.horizontal,
        `${label} · ${view}: yatay ${m.horizontal}px taşıyor`,
      ).toBeLessThanOrEqual(1);
    }
    console.log(`[ölçüm] ${label}: ${rows.map((r) => `${r.view}=${r.vertical}↕/${r.horizontal}↔`).join(' · ')}`);
    return rows;
  }

  // %80 and %100 are the claim worth locking down: nothing scrolls past the
  // screen at the scale this program actually ships at. MEASURED at 0px on
  // every one of the four views, both themes.
  for (const percent of [80, 100] as const) {
    test(`%${percent} ölçekte hiçbir görünüm taşmıyor`, async ({ page }) => {
      await openWithSample(page);
      await chooseScale(page, percent);
      await measureAllViews(page, `%${percent}`, 1);
    });
  }

  /**
   * %150 is a DIFFERENT claim, and it took a comparison to find it.
   *
   * The first version of this test asserted zero scroll at every scale,
   * copying the %80/%100 bar onto %150 without measuring it there first
   * (pitfall 101's own shape). MEASURED instead: Kontrol's capacity views
   * (Öğretmenler · Sınıflar · Derslikler) overflow `.main` by 141–174px at
   * %150 — but so does every other list-heavy screen at that scale, because
   * `.main` is `overflow: auto` on purpose and %150 does not grow the
   * viewport. The SAME comparison, same sample school, same run: Okul →
   * Öğretmenler overflowed 1355px, Ayarlar → Kurallar 450px. Kontrol's own
   * number is the SMALLEST of the three, not the outlier the original
   * "çok saçma" complaint was about — that complaint was about the
   * three-panel sticky rail (2026-08-27/28's fix), and it is gone.
   *
   * The ceiling below is not zero and not arbitrary: it is a generous margin
   * over the measured 174px, wide enough that ordinary scale behaviour never
   * trips it and tight enough that a REAL regression — the `.stat-scroll`
   * cap breaking, say — still would.
   */
  test('%150 ölçekte hiçbir görünüm ölçülenden orantısız taşmıyor', async ({ page }) => {
    await openWithSample(page);
    await chooseScale(page, 150);
    await measureAllViews(page, '%150', 300);
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} temada hiçbir görünüm taşmıyor`, async ({ page }) => {
      await openWithSampleTheme(page, theme);
      await measureAllViews(page, theme, 1);
    });
  }
});
