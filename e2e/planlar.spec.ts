// The plan library: several timetables side by side, and drafts.
//
// Everything here is about WHICH KEY a timetable lands in, and that is a
// question only the real browser can answer: jsdom has no `file://`, no page
// reload, and no 400 ms debounce racing a click.

import { expect, test, type Page } from '@playwright/test';
import { dragAndDrop, openSettings, openWithSample, savedText, settledText } from './helpers';

const picker = (page: Page) => page.getByLabel('Plan', { exact: true });

/** Opens Ayarlar > Veri, where every plan command lives. */
async function openPlans(page: Page) {
  await openSettings(page, 'Veri');
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

/** The row of the plan that is currently open, in Ayarlar > Veri. */
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
    await page.reload();
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
    await openSettings(page, 'Okul ve zil');
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
    await openSettings(page, 'Okul ve zil');
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
    await page.reload();
    await expect(picker(page).locator('option')).toHaveText(['Güz dönemi']);
  });

  test('silme onay soruyor ve ne kaybedileceğini SAYIYOR', async ({ page }) => {
    const before = await openWithOneLesson(page);
    await openPlans(page);
    await page.getByRole('button', { name: 'Bu planın kopyası', exact: true }).click();
    await expect(picker(page).locator('option')).toHaveCount(2);

    const message = await new Promise<string>((resolve) => {
      page.once('dialog', (d) => {
        resolve(d.message());
        void d.dismiss();
      });
      void openRow(page).getByRole('button', { name: 'Sil', exact: true }).click();
    });
    expect(message).toContain('öğretmen');
    expect(message).toContain('sınıf');
    expect(message).toContain('geri alınamaz');
    // Dismissed: still two plans.
    await expect(picker(page).locator('option')).toHaveCount(2);

    page.once('dialog', (d) => d.accept());
    await openRow(page).getByRole('button', { name: 'Sil', exact: true }).click();
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

  test('dört planla üst çubuk 1366px’te taşmıyor', async ({ page }) => {
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
    await expect(page.getByRole('button', { name: 'Dosyaya kaydet' })).toBeVisible();
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
    await page.getByRole('button', { name: 'Kurulum' }).click();
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
    await page.getByRole('button', { name: /taslağından yeni plan$/ }).click();

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
    await page.getByRole('button', { name: 'Kurulum' }).click();

    const start = page.getByRole('button', { name: /taslağından başla$/ });
    await expect(start).toBeVisible();
    await start.click();

    await expect(picker(page).locator('option')).toHaveCount(4);
    await page.getByRole('button', { name: 'Kurulum' }).click();
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
    await page.reload();
    await expect(picker(page).locator('option').nth(1)).not.toContainText('(taslak)');
  });
});
