// The plan library: several timetables side by side, and drafts.
//
// Everything here is about WHICH KEY a timetable lands in, and that is a
// question only the real browser can answer: jsdom has no `file://`, no page
// reload, and no 400 ms debounce racing a click.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { readFile } from 'node:fs/promises';
import { reopen,
  dragAndDrop,
  openSettings,
  openSetup,
  openWithSample,
  savedText,
  settledText,
  answerDialog,
} from './helpers';

const picker = (page: Page) => page.getByLabel('Plan', { exact: true });

/**
 * Opens Ayarlar > Planlar, where every plan command lives.
 *
 * Its own section since 2026-08-28. It was one of seven panels under "Veri",
 * which also held a folder, a key table, a backup list, a reset and a version
 * — four questions under one name. The bundle file came with it, because "all
 * of the plans, in one file" is the library's own noun.
 */
async function openPlans(page: Page) {
  await openSettings(page, 'Planlar ve yedek');
  await expect(page.getByRole('heading', { name: /^Planlar/ })).toBeVisible();
}

/** How many cells the grid has filled right now. */
async function placedCards(page: Page) {
  await page.getByRole('button', { name: 'Program', exact: true }).click();
  return page.locator('table.grid .card').count();
}

/**
 * The sample school arrives with an EMPTY grid — it is a set of lessons waiting
 * to be laid out. So a test about "the timetable survived" has to put something
 * on the grid first; one real drag is cheaper than a whole solver run.
 */
async function openWithOneLesson(page: Page) {
  await openWithSample(page);
  await dragAndDrop(page);
  return placedCards(page);
}

/** The row of the plan that is currently open, in Ayarlar > Planlar ve yedek. */
const openRow = (page: Page) => page.locator('table.list tr[aria-current="true"]');

test.describe('40. Plan kitaplığı', () => {
  test('üst çubukta plan seçici var ve tek plan "1. plan" adıyla geliyor', async ({ page }) => {
    await openWithSample(page);
    await expect(picker(page)).toBeVisible();
    await expect(picker(page).locator('option')).toHaveCount(1);
    await expect(picker(page)).toHaveValue('1');
    await expect(picker(page).locator('option')).toHaveText(['1. plan']);
  });

  test('devralma: kitaplık kurulsa da program ESKİ anahtarda duruyor', async ({ page }) => {
    // The migration's whole claim: adopting the existing timetable copies
    // nothing. If this breaks, every backup taken by an older build is orphaned.
    await openWithSample(page);
    const text = await settledText(page);
    expect(text.length).toBeGreaterThan(1000);

    const directory = await page.evaluate(() => localStorage.getItem('ders-programi-planlar'));
    expect(directory).not.toBeNull();
    expect(JSON.parse(directory!)).toEqual({
      activeId: '1',
      plans: [{ id: '1', name: '1. plan', draft: false }],
    });
    // ...and nothing was written to a second key for plan 1.
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).not.toContain('ders-programi-plan-1');
  });

  test('yeni boş plan açılıyor, geri dönünce eski program YERİNDE', async ({ page }) => {
    const before = await openWithOneLesson(page);
    expect(before).toBeGreaterThan(0);

    await openPlans(page);
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click();

    await expect(picker(page).locator('option')).toHaveCount(2);
    expect(await placedCards(page)).toBe(0);

    // Back to the first plan: the whole sample timetable is still there.
    await picker(page).selectOption('1');
    expect(await placedCards(page)).toBe(before);
  });

  test('açık plan sayfa yenilenince korunuyor', async ({ page }) => {
    await openWithSample(page);
    await openPlans(page);
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click();
    const id = await picker(page).inputValue();
    expect(id).not.toBe('1');

    await settledText(page);
    await reopen(page);
    await expect(picker(page)).toHaveValue(id);
    expect(await placedCards(page)).toBe(0);
  });

  test('her plan KENDİ anahtarında; 1. plan tarihsel anahtarda kalıyor', async ({ page }) => {
    await openWithSample(page);
    const first = await settledText(page);

    await openPlans(page);
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click();
    const id = await picker(page).inputValue();

    await expect
      .poll(async () =>
        page.evaluate((k) => localStorage.getItem(k) !== null, `ders-programi-plan-${id}`),
      )
      .toBe(true);

    // The sample timetable never moved out of `ders-programi`.
    expect(await savedText(page)).toBe(first);
  });

  test('plan geçişi geri-al yığınını sıfırlıyor', async ({ page }) => {
    await openWithSample(page);
    // Make something undoable first, so a disabled button means the switch did it.
    await openSettings(page, 'Zil ve günler');
    await page.getByLabel('Okul adı').fill('Deneme Kursu');
    await page.getByLabel('Okul adı').blur();
    await expect(page.getByRole('button', { name: /Geri al/ })).toBeEnabled();

    await openPlans(page);
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click();
    await expect(page.getByRole('button', { name: /Geri al/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /İleri al/ })).toBeDisabled();
  });

  test('değişiklikten hemen sonra geçmek o değişikliği GİDEN planda bırakıyor', async ({
    page,
  }) => {
    // The auto-save is debounced by 400 ms and the effect cancels a pending
    // write whenever the plan changes. Without an explicit flush the last edit
    // before a switch is dropped silently — the only kind of loss that matters.
    await openWithSample(page);
    await openSettings(page, 'Zil ve günler');
    await page.getByLabel('Okul adı').fill('Son Saniye Kursu');
    await page.getByLabel('Okul adı').blur();

    await openPlans(page);
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click(); // < 400 ms later

    await expect
      .poll(async () => (await savedText(page)).includes('Son Saniye Kursu'), {
        message: 'giden planın son düzenlemesi kaydedilmedi',
      })
      .toBe(true);

    await picker(page).selectOption('1');
    await expect(page.locator('.app-title')).toHaveText('Son Saniye Kursu');
  });

  test('ad değiştirme kalıcı ve seçicide görünüyor', async ({ page }) => {
    await openWithSample(page);
    await openPlans(page);
    const box = page.getByLabel('1. plan adı');
    await box.fill('Güz dönemi');
    await box.blur();

    await expect(picker(page).locator('option')).toHaveText(['Güz dönemi']);
    await reopen(page);
    await expect(picker(page).locator('option')).toHaveText(['Güz dönemi']);
  });

  test('silme onay soruyor ve ne kaybedileceğini SAYIYOR', async ({ page }) => {
    const before = await openWithOneLesson(page);
    await openPlans(page);
    await page.getByRole('button', { name: 'Bu planın kopyası', exact: true }).click();
    await expect(picker(page).locator('option')).toHaveCount(2);

    await openRow(page).getByRole('button', { name: 'Sil', exact: true }).click();
    const message = await answerDialog(page, 'cancel');
    expect(message).toContain('öğretmen');
    expect(message).toContain('sınıf');
    expect(message).toContain('geri alınamaz');
    // Dismissed: still two plans.
    await expect(picker(page).locator('option')).toHaveCount(2);

    await openRow(page).getByRole('button', { name: 'Sil', exact: true }).click();
    await answerDialog(page);
    await expect(picker(page).locator('option')).toHaveCount(1);
    // Deleting the OPEN plan lands on the survivor, not on an empty screen.
    await expect(picker(page)).toHaveValue('1');
    expect(await placedCards(page)).toBe(before);
  });

  test('tek plan silinemiyor', async ({ page }) => {
    await openWithSample(page);
    await openPlans(page);
    await expect(page.getByRole('button', { name: 'Sil', exact: true })).toBeDisabled();
  });

  test('dört planla üst çubuk taşmıyor', async ({ page }) => {
    await openWithSample(page);
    await openPlans(page);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Boş plan', exact: true }).click();
    }
    await expect(picker(page).locator('option')).toHaveCount(4);

    const overflow = await page.evaluate(
      () => document.body.scrollWidth - document.body.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    // The picker is still inside the bar, and the save button still reachable.
    const bar = (await page.locator('header.topbar').boundingBox())!;
    const box = (await page.getByLabel('Plan', { exact: true }).boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(bar.x + bar.width + 1);
    await expect(page.getByRole('button', { name: 'Dosyaya kaydet', exact: true })).toBeVisible();
  });
});

test.describe('41. Taslaklar', () => {
  test('"Taslak olarak kaydet" kurulumu kopyalıyor, ızgarayı boşaltıyor', async ({ page }) => {
    const before = await openWithOneLesson(page);
    expect(before).toBeGreaterThan(0);

    await openPlans(page);
    await page.getByRole('button', { name: 'Taslak olarak kaydet' }).click();

    // Same school, empty grid.
    await expect(openRow(page).locator('td.num')).toHaveText('0');
    expect(await placedCards(page)).toBe(0);

    await openPlans(page);
    await expect(openRow(page).getByRole('checkbox')).toBeChecked();
    await expect(picker(page).locator('option').nth(1)).toContainText('(taslak)');

    // The teachers came with it.
    await page.getByRole('button', { name: 'Okul', exact: true }).click();
    await page.locator('.step', { hasText: 'Öğretmenler' }).click();
    await expect(page.locator('table.list tbody tr').first()).toBeVisible();
  });

  test('taslaktan yeni plan açılıyor, taslağın kendisi değişmiyor', async ({ page }) => {
    await openWithSample(page);
    await openPlans(page);
    await page.getByRole('button', { name: 'Taslak olarak kaydet' }).click();
    const draftId = await picker(page).inputValue();

    // Back to plan 1, then start a fresh plan from the draft.
    await picker(page).selectOption('1');
    await openPlans(page);
    await page.getByRole('heading', { name: 'Taslaktan başla' }).waitFor();
    await page.getByRole('button', { name: /→ yeni plan$/ }).click();

    expect(await picker(page).inputValue()).not.toBe(draftId);
    await expect(picker(page).locator('option')).toHaveCount(3);
    expect(await placedCards(page)).toBe(0);

    // The draft is still a draft, and the new plan is NOT one.
    await openPlans(page);
    await expect(openRow(page).getByRole('checkbox')).not.toBeChecked();
    await expect(page.locator('table.list tbody tr').nth(1).getByRole('checkbox')).toBeChecked();
  });

  test('Kurulum’un boş ekranı taslakları gösteriyor ve ondan plan başlatıyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await openPlans(page);
    await page.getByRole('button', { name: 'Taslak olarak kaydet' }).click();

    // A brand new empty plan: this is the screen a new term starts on.
    await openPlans(page);
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click();
    await page.getByRole('button', { name: 'Okul', exact: true }).click();

    const start = page.getByRole('button', { name: /taslağı ile başla$/ });
    await expect(start).toBeVisible();
    await start.click();

    await expect(picker(page).locator('option')).toHaveCount(4);
    await page.getByRole('button', { name: 'Okul', exact: true }).click();
    await page.locator('.step', { hasText: 'Öğretmenler' }).click();
    await expect(page.locator('table.list tbody tr').first()).toBeVisible();
  });

  test('taslak işareti kaldırılabiliyor', async ({ page }) => {
    await openWithSample(page);
    await openPlans(page);
    await page.getByRole('button', { name: 'Taslak olarak kaydet' }).click();
    await openPlans(page);

    await openRow(page).getByRole('checkbox').uncheck();
    await expect(picker(page).locator('option').nth(1)).not.toContainText('(taslak)');
    await reopen(page);
    await expect(picker(page).locator('option').nth(1)).not.toContainText('(taslak)');
  });
});

test.describe('42. Bütün planlar tek dosyada', () => {
  /** Reads a downloaded file back off disk. */
  async function grab(page: Page, click: () => Promise<void>) {
    const wait = page.waitForEvent('download');
    await click();
    const file = await wait;
    const path = (await file.path())!;
    return { name: file.suggestedFilename(), text: await readFile(path, 'utf8') };
  }

  /** The sample school in one plan, plus a second, empty plan called "Boş plan". */
  async function twoPlans(page: Page) {
    await openWithSample(page);
    await openPlans(page);
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click();
    await expect(picker(page).locator('option')).toHaveCount(2);
    await openPlans(page);
  }

  test('indirilen dosya GERÇEKTEN bütün planları içeriyor', async ({ page }) => {
    await twoPlans(page);

    const { name, text } = await grab(page, () =>
      page.getByRole('button', { name: /Tümünü dosyaya kaydet/ }).click(),
    );
    // The -tumu- marker is the only thing separating the two file kinds in
    // Explorer, so it is asserted, not assumed.
    expect(name).toMatch(/^ders-programi-tumu-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);

    const bundle = JSON.parse(text) as {
      bundleVersion: number;
      activeId: string;
      plans: Array<{ id: string; name: string; state: { teachers: unknown[] } }>;
    };
    expect(bundle.bundleVersion).toBe(1);
    expect(bundle.plans.map((p) => p.name)).toEqual(['1. plan', 'Boş plan']);
    // Each plan carries its OWN school, not a shared one.
    expect(bundle.plans[0]!.state.teachers.length).toBeGreaterThan(0);
    expect(bundle.plans[1]!.state.teachers).toHaveLength(0);
    expect(bundle.activeId).toBe(bundle.plans[1]!.id); // the new plan was opened
  });

  test('gidiş-dönüş: silinen plan dosyadan içeriğiyle geri geliyor', async ({ page }) => {
    await twoPlans(page);

    // Give the second plan something of its own, so "it came back" means the
    // DATA came back and not just a row in the directory.
    await openSettings(page, 'Zil ve günler');
    await page.getByLabel('Okul adı').fill('İkinci Okul');
    await page.getByLabel('Okul adı').blur();
    await openPlans(page);

    const { text } = await grab(page, () =>
      page.getByRole('button', { name: /Tümünü dosyaya kaydet/ }).click(),
    );

    // Now destroy it: switch away and delete the plan entirely.
    await picker(page).selectOption({ label: '1. plan' });
    await openPlans(page);
    await page.getByRole('button', { name: 'Sil', exact: true }).nth(1).click();
    await answerDialog(page);
    await expect(picker(page).locator('option')).toHaveCount(1);

    await page.getByLabel('Bütün planları içeren dosya').setInputFiles({
      name: 'ders-programi-tumu-2026-08-25-1200.json',
      mimeType: 'application/json',
      buffer: Buffer.from(text),
    });
    await answerDialog(page);

    // Scoped to the panel that says it. Pitfall 49's shape: `.panel .hint`
    // was unique until the section grew a second panel with a live line in
    // it ("Nereye kaydedilsin"), and then this query stopped naming one thing.
    await expect(
      page.locator('.panel', { hasText: 'Bütün planlar tek dosyada' }).locator('.hint[role="status"]'),
    ).toHaveText('2 plan açıldı.');
    await expect(picker(page).locator('option')).toHaveCount(2);

    // The second plan's own school name survived the round trip.
    await picker(page).selectOption({ label: 'Boş plan' });
    await expect(page.locator('.app-title')).toHaveText('İkinci Okul');
    // ...and so did the first plan's teachers.
    await picker(page).selectOption({ label: '1. plan' });
    await openSetup(page, 'Öğretmenler');
    expect(await page.locator('table.list tbody tr').count()).toBeGreaterThan(0);
  });

  test('üst çubuğa paket verilince UYARIYOR ve hiçbir şey değişmiyor', async ({ page }) => {
    await twoPlans(page);
    const { text } = await grab(page, () =>
      page.getByRole('button', { name: /Tümünü dosyaya kaydet/ }).click(),
    );

    // The top bar's own file input — the one next to "Dosyadan aç".
    await page.locator('header.topbar input[type=file]').setInputFiles({
      name: 'ders-programi-tumu-2026-08-25-1200.json',
      mimeType: 'application/json',
      buffer: Buffer.from(text),
    });
    const said = await answerDialog(page);

    await expect.poll(() => said).toContain('Tümünü dosyadan aç');
    // Nothing was replaced: both plans still there, still on the same one.
    await expect(picker(page).locator('option')).toHaveCount(2);
    await expect(picker(page)).toHaveValue(await picker(page).inputValue());
    await openPlans(page);
    await expect(page.locator('table.list tbody tr')).toHaveCount(2);
  });

  test('tek plan dosyası "Tümünü dosyadan aç"a verilince reddediliyor', async ({ page }) => {
    await openWithSample(page);
    const single = await grab(page, () =>
      page.getByRole('button', { name: 'Dosyaya kaydet', exact: true }).click(),
    );

    await openPlans(page);
    await page.getByLabel('Bütün planları içeren dosya').setInputFiles({
      name: single.name,
      mimeType: 'application/json',
      buffer: Buffer.from(single.text),
    });
    await expect(page.locator('.panel .hint.bad[role="status"]')).toContainText('Dosyadan aç');
    await expect(picker(page).locator('option')).toHaveCount(1);
  });
});

test.describe('43. Veriler nerede', () => {
  test('tablodaki anahtarlar sayfanın GERÇEK anahtarlarıyla aynı', async ({ page }) => {
    await openWithSample(page);
    // A second plan first, so the table has more than one plan row to be
    // right about — and that button is in Ayarlar → Planlar now, while the
    // table it is checked against stayed in Veri.
    await openSettings(page, 'Planlar ve yedek');
    await page.getByRole('button', { name: 'Boş plan', exact: true }).click();
    await openSettings(page, 'Hakkında');

    const panel = page.locator('.panel', { hasText: 'Veriler nerede' });
    const shown = await panel.locator('tbody code').allInnerTexts();

    // Every plan key the page really uses must be named in the table. Anything
    // the panel invents, or leaves out, makes the panel a liar — and the whole
    // point of it is that it can be trusted.
    const real = await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith('ders-programi')),
    );
    for (const key of real) expect(shown).toContain(key);
    expect(shown).toContain('ders-programi');
    expect(shown).toContain('ders-programi-planlar');

    // The open plan's row carries a real size, not a dash.
    const row = panel.locator('tbody tr', { hasText: '1. plan' });
    await expect(row.locator('td.num')).toHaveText(/KB|B$/);
  });

  test('file:// altında deponun TARAYICIDA olduğunu söylüyor', async ({ page }) => {
    // The E2E suite is the only place this branch is real: jsdom serves http.
    await openWithSample(page);
    await openSettings(page, 'Hakkında');
    const panel = page.locator('.panel', { hasText: 'Veriler nerede' });
    await expect(panel).toContainText('tarayıcının bu bilgisayardaki deposunda');
    await expect(panel).toContainText('tarama verilerini temizle');
    await expect(panel).toContainText('5 MB');
  });
});
