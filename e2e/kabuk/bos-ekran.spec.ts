// Empty screens and keyboard navigation.
//
// "Boş ekranlar yönlendirir" is a rule in CLAUDE.md and not one of these
// screens was tested: they are the first thing a new project shows, and the
// only place that answers "what do I do first".

import { expect, test } from '../kapan';
import {
  reopen,
  answerDialog,
  open,
  onScreen,
  openSetup,
  openSettings,
  savedText,
} from '../helpers';

test.describe('35. Boş ekranlar yönlendiriyor', () => {
  test('veri yokken Kurulum sekmesiyle açılıyor', async ({ page }) => {
    await open(page);
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Okul',
    );
    await expect(page.locator('.panel', { hasText: 'Başlarken' })).toContainText('derslikler');
  });

  // The sample school is offered ONCE here and lives in Ayarlar → Hakkında. Before
  // this it was a permanent button on the Kurulum screen — reachable only by an
  // empty project, so anybody who had started their own work could never look
  // at it again.
  test.describe('örnek veri satırı', () => {
    test('ilk açılışta duruyor, "Bir daha gösterme"den sonra yenilense de gitmiyor', async ({
      page,
    }) => {
      await open(page);
      const line = page.locator('.intro-line');
      await expect(line).toContainText('Aracın ne yaptığını görmek');
      await expect(line.getByRole('button', { name: 'Örnek veriyle doldur' })).toBeVisible();

      await line.getByRole('button', { name: 'Bir daha gösterme' }).click();
      await expect(page.locator('.intro-line')).toHaveCount(0);
      // The panel around it stays: it is the "what do I do first" answer.
      await expect(page.locator('.panel', { hasText: 'Başlarken' })).toContainText('derslikler');

      await reopen(page);
      await expect(page.locator('.panel', { hasText: 'Başlarken' })).toBeVisible();
      await expect(page.locator('.intro-line')).toHaveCount(0);
    });

    test('örnek veri yüklendikten sonra Kurulum’a dönünce satır yok', async ({ page }) => {
      await open(page);
      await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
      await answerDialog(page);
      await expect.poll(() => savedText(page)).toContain('Örnek Kurs');

      await openSetup(page, 'Derslikler');
      await expect(page.locator('.intro-line')).toHaveCount(0);
      await reopen(page);
      await expect(page.locator('.intro-line')).toHaveCount(0);
    });

    test('kendi verisini girmeye başlayan da bir daha görmüyor', async ({ page }) => {
      await open(page);
      await expect(page.locator('.intro-line')).toBeVisible();

      await page.getByPlaceholder('Derslik adı, örn. A').fill('A');
      await page.getByRole('button', { name: 'Ekle', exact: true }).first().click();
      await expect(page.locator('.intro-line')).toHaveCount(0);

      await reopen(page);
      await expect(page.locator('.intro-line')).toHaveCount(0);
    });

    test('asıl evi Ayarlar → Hakkında ve oradan her zaman yüklenebiliyor', async ({ page }) => {
      await open(page);
      // Dismiss it on Kurulum first, so this really is the other way in.
      await page.getByRole('button', { name: 'Bir daha gösterme' }).click();

      await openSettings(page, 'Hakkında');
      const button = page.getByRole('button', { name: 'Örnek okulu yükle' });
      await expect(button).toBeVisible();
      await button.click();
      await answerDialog(page);
      await expect.poll(() => savedText(page)).toContain('Örnek Kurs');

      // And a second time, over a project that now holds a term's work: the
      // question has to count what it is about to replace.
      await button.click();
      await expect(page.locator('.dlg')).toContainText('25 öğretmen, 20 sınıf ve 99 ders');
      await answerDialog(page, 'cancel');
    });
  });

  test('Program: ne yapılacağını sırayla söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    const screen = page.locator('.empty-screen');
    await expect(screen).toContainText('Henüz dizilecek ders yok');
    await expect(screen).toContainText('Okul');
    await expect(screen).toContainText('Müsaitlik');
    // Not clipped: the empty screen must never live inside the grid's
    // overflow:hidden shell.
    await expect(page.locator('main.main.no-overflow')).toHaveCount(0);
  });

  test('Yazdır: basılacak bir şey olmadığını söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
    // `onScreen`, not a bare locator: the Program tab is mounted-but-hidden and
    // carries an empty state of its own ("Henüz dizilecek ders yok").
    await expect(onScreen(page, '.empty-screen')).toBeVisible();
  });

  test('Müsaitlik: üç türün üçü de ne eksik olduğunu söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    await expect(onScreen(page, '.empty-screen')).toContainText('öğretmen ekleyin');

    await page.getByRole('button', { name: 'Sınıf', exact: true }).click();
    await expect(onScreen(page, '.empty-screen')).toContainText('sınıf ekleyin');

    await page.getByRole('button', { name: 'Derslik', exact: true }).click();
    await expect(onScreen(page, '.empty-screen')).toContainText('derslik ekleyin');
  });

  test('Okul adım sayaçları boşken soluk', async ({ page }) => {
    await open(page);
    // Four steps, and on a brand-new project every one of them is empty —
    // Branşlar included, since a new project no longer arrives with the 21
    // built-in subjects already on its list.
    await expect(page.locator('.step[data-empty="true"]')).toHaveCount(4);

    await openSetup(page, 'Derslikler');
    await page.getByPlaceholder('Derslik adı, örn. A').fill('A');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.locator('.step[data-empty="true"]')).toHaveCount(3);
  });

  test('boş projede bile Ayarlar açılıyor ve dolu', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Zil ve günler');
    await expect(page.locator('.cols aside')).toContainText('Zil saatleri');
    await expect(page.locator('table.bell-preview')).toBeVisible();
  });
});

test.describe('36. Klavye', () => {
  test('Tab ile yedi sekmeye de ulaşılıyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');

    // The rail is first in the DOM, so the first stop is the first section.
    const names: string[] = [];
    for (let i = 0; i < 7; i++) {
      names.push(
        await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? ''),
      );
      await page.keyboard.press('Tab');
    }
    expect(names).toEqual([
      'Okul',
      'Müsaitlik',
      'Dersler',
      'Program',
      'Kontrol',
      'Çıktı',
      'Ayarlar',
    ]);
  });

  test('Enter ile sekme değiştirilebiliyor ve aria-current takip ediyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    // Four stops in: Kurulum, Müsaitlik, Dersler, Program.
    for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Program',
    );
  });

  test('odaklanılan düğmenin nerede olduğu görünüyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (el === null) return null;
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle };
    });
    expect(outline?.style).toBe('solid');
    expect(parseFloat(outline?.width ?? '0')).toBeGreaterThanOrEqual(2);
  });

  test('adım şeridinde Enter çalışıyor', async ({ page }) => {
    await open(page);
    await openSetup(page, 'Derslikler');
    await page.locator('.step', { hasText: 'Sınıflar' }).focus();
    await page.keyboard.press('Enter');
    // The steps are `.btn`s in the tool strip now, so "you are here" is the
    // button state, not a navigation link's `aria-current`.
    await expect(page.locator('.step[aria-pressed="true"]')).toContainText('Sınıflar');
  });
});
