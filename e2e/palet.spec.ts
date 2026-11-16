// 52. Ctrl+K, the status chip, and the keyboard.
//
// All three exist for the same reason and it is not novelty: the reader has
// trouble seeing. Typing three letters of a name is easier than scanning a
// column of twenty-five, a status that is always on screen is one that gets
// read, and a shortcut is a target you cannot miss.

import { expect, test } from './kapan';
import { openWithSample, open, chooseScale, chooseEntity } from './helpers';

test.describe('52. Komut paleti', () => {
  test('Ctrl+K açıyor, Escape kapatıyor, üst çubuktaki düğme de açıyor', async ({ page }) => {
    await openWithSample(page);
    const palette = page.locator('.palette');
    await expect(palette).toBeHidden();

    await page.keyboard.press('Control+k');
    await expect(palette).toBeVisible();
    // It opens FOCUSED: a palette you have to click into is a palette that
    // costs a click more than the button it replaced.
    await expect(page.getByLabel('Ara veya komut yaz')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(palette).toBeHidden();

    // ...and there is a way in that nobody has to be told about: the top
    // bar's "?" menu (since 2026-11-16; it was a magnifier icon alone).
    await page.locator('.topbar .topbar-help').click();
    await page.getByRole('menuitem', { name: /Ara ve yap/ }).click();
    await expect(palette).toBeVisible();
  });

  // It finds JOBS, not only places (Sadeleşme, 2026-11-16): he types what he
  // wants done, not the name of the screen it is on.
  test('işleri de buluyor: "yazdır" Çıktı\'yı, "tema" Görünüm\'ü açıyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('baskı');
    await expect(page.locator('.palette')).toContainText('Yazdır');
    await page.keyboard.press('Enter');
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Yazdır ve gönder',
    );

    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('koyu');
    await page.keyboard.press('Enter');
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Okul bilgileri',
    );
    await expect(page.getByRole('group', { name: 'Tema', exact: true })).toBeVisible();

    // Hakkında is behind a Daha fazla; "güncelleme" finds it.
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('güncelleme');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Sürüm ve güncelleme' })).toBeVisible();
  });

  // Windows UI Automation's Invoke and a screen reader's default action are a
  // click with no pointer before it; Radix opens on pointerdown and keys only,
  // so that click used to open nothing (kurulum-windows, 2026-11-16).
  test('Daha fazla, işaretçisiz bir tıklamayla da açılıyor ve kalemi seçiliyor', async ({
    page,
  }) => {
    await openWithSample(page);
    await page
      .locator('.tabstrip')
      .getByRole('button', { name: 'Okul bilgileri', exact: true })
      .click();
    await page.locator('.ribbon .more-menu').evaluate((b) => (b as HTMLButtonElement).click());
    const item = page.getByRole('menuitem', { name: 'Hakkında' });
    await expect(item).toBeVisible();
    await item.evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByRole('heading', { name: 'Sürüm ve güncelleme' })).toBeVisible();
  });

  test('sekmeye gidiyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('çıktı');
    await page.keyboard.press('Enter');

    await expect(page.locator('.palette')).toBeHidden();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Yazdır ve gönder',
    );
  });

  test('öğretmeni adıyla bulup PANELİNİ açıyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    // Turkish folding, the same as the lists: 'İlknur'.toLowerCase() is an `i`
    // plus a combining dot, so this is the search that used to find nothing.
    await page.getByLabel('Ara veya komut yaz').fill('ilknur');

    const rows = page.locator('.palette-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('İlknur Aydın');
    await page.keyboard.press('Enter');

    await expect(page.locator('.palette')).toBeHidden();
    const sheet = page.locator('.sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('.sheet-title')).toHaveText('İlknur Aydın');
  });

  test('ok tuşlarıyla geziliyor ve imleç listenin İÇİNDE kalıyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    const rows = page.locator('.palette-row');
    await expect(rows.first()).toHaveAttribute('data-active', 'true');

    await page.keyboard.press('ArrowDown');
    await expect(rows.nth(1)).toHaveAttribute('data-active', 'true');

    // Walk past the end: the cursor stops, it does not wrap into nothing.
    await page.keyboard.press('End');
    const count = await rows.count();
    await expect(rows.nth(count - 1)).toHaveAttribute('data-active', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(rows.nth(count - 1)).toHaveAttribute('data-active', 'true');

    // ...and typing something shorter must not leave it pointing past the end.
    await page.getByLabel('Ara veya komut yaz').fill('ilknur');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute('data-active', 'true');
  });

  test('eşleşme yoksa bunu söylüyor', async ({ page }) => {
    await openWithSample(page);
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('böyle bir şey yok');
    await expect(page.locator('.palette-row')).toHaveCount(0);
    await expect(page.locator('.palette-empty')).toContainText('Eşleşen bir şey yok');
  });
});

test.describe('53. Durum çipi', () => {
  test('sorun yokken yeşil, kapalı saatte ders kalınca kırmızı ve SAYIYOR', async ({ page }) => {
    await openWithSample(page);
    const chip = page.locator('.health');
    await expect(chip).toBeVisible();
    // Nothing laid out yet: not a problem, but it says what is waiting.
    await expect(chip).toHaveClass(/ok/);
    await expect(chip).toContainText('saat yerleşmedi');

    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: 'Programı yap', exact: true }).click();
    await expect(page.locator('.reason-bar.ok, .reason-bar.bad')).toBeVisible({ timeout: 30_000 });
    await expect(chip).toContainText('Sorun yok');

    // Close a teacher's whole week AFTER the timetable is laid out: the lesson
    // stays (no-data-loss principle) and the chip has to be the thing that says so.
    const id = await page.evaluate(() => {
      const row = [...document.querySelectorAll('table.grid tbody tr')].find(
        (tr) => tr.querySelector('.card') !== null,
      );
      return row?.querySelector('td[data-row]')?.getAttribute('data-row') ?? '';
    });
    const sheet = await chooseEntity(page, id);
    await sheet.getByRole('button', { name: 'Bütün haftayı kapat' }).click();
    await page.keyboard.press('Escape');

    await expect(chip).toHaveClass(/impossible/);
    await expect(chip).toContainText('kapalı saatte');
  });

  // The Kontrol tab became the list the chip opens (K3, 2026-11-16).
  test('her sekmede duruyor ve sorun listesini açıyor', async ({ page }) => {
    await openWithSample(page);
    for (const tab of [
      'Öğretmenler',
      'Sınıflar',
      'Program',
      'Yazdır ve gönder',
      'Okul bilgileri',
    ]) {
      await page.locator('.tabstrip').getByRole('button', { name: tab, exact: true }).click();
      await expect(page.locator('.health')).toBeVisible();
    }
    await page.locator('.health').click();
    await expect(page.getByRole('dialog', { name: 'Programın durumu' })).toBeVisible();
    // ...over the tab it was asked from.
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Okul bilgileri',
    );
  });
});

test.describe('54. Klavye kısayolları', () => {
  test('Alt+1..5 sekmelere gidiyor', async ({ page }) => {
    await openWithSample(page);
    const names = ['Program', 'Öğretmenler', 'Sınıflar', 'Yazdır ve gönder', 'Okul bilgileri'];
    for (const [i, name] of names.entries()) {
      await page.keyboard.press(`Alt+${i + 1}`);
      await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute('aria-label', name);
    }
  });

  test('ÇIPLAK rakam sekme değiştirmiyor — ızgaradaki her kart bir düğme', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.keyboard.press('5');
    // Still on Program. A bare "5" while a lesson card had focus would have
    // jumped to Yazdır, and every card on the grid is a focusable button.
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Program',
    );
  });

  test('%150 ölçekte üst çubuk taşmıyor, son sekme tıklanabiliyor', async ({ page }) => {
    // Measured before the fix: the strip shrank while the tabs inside it did
    // not, so Ayarlar sat at x=823 inside a box ending at 711 — under the
    // status chip, clickable by nothing.
    await openWithSample(page);
    await chooseScale(page, 150);

    const fits = await page.evaluate(() => {
      const bar = document.querySelector('header.topbar')!;
      const strip = bar.querySelector('.tabstrip')!.getBoundingClientRect();
      const tabs = [...bar.querySelectorAll('.tab')];
      const last = tabs[tabs.length - 1]!.getBoundingClientRect();
      return {
        over: Math.round(last.right - strip.right),
        barOver: bar.scrollWidth - bar.clientWidth,
      };
    });
    expect(fits.over, 'sekmeler kendi kutusundan taşıyor').toBeLessThanOrEqual(0);
    expect(fits.barOver, 'üst çubuk yatay taşıyor').toBeLessThanOrEqual(0);

    await page
      .locator('.tabstrip')
      .getByRole('button', { name: 'Okul bilgileri', exact: true })
      .click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Okul bilgileri',
    );
    await chooseScale(page, 100);
  });

  test('boş projede de palet açılıyor ve çökmüyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Control+k');
    await expect(page.locator('.palette')).toBeVisible();
    // Six sections and the actions are there even with nothing entered.
    expect(await page.locator('.palette-row').count()).toBeGreaterThan(6);
  });

  test('kısayol yardımı: üst çubuktaki düğme açıyor, gerçek kısayolları listeliyor, Escape kapatıyor', async ({
    page,
  }) => {
    await open(page);
    const dlg = page.locator('.sheet', { hasText: 'Klavye kısayolları' });
    await expect(dlg).toBeHidden();

    await page.locator('.topbar .topbar-help').click();
    await page.getByRole('menuitem', { name: /Klavye kısayolları/ }).click();
    await expect(dlg).toBeVisible();
    await expect(dlg).toContainText('Ctrl+K');
    await expect(dlg).toContainText('Alt+1..5');

    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();
  });

  test("kısayol yardımı: '?' tuşu açıyor, metin kutusu odaktayken açmıyor", async ({ page }) => {
    await open(page);
    const dlg = page.locator('.sheet', { hasText: 'Klavye kısayolları' });

    await page.keyboard.press('Shift+?');
    await expect(dlg).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();

    // A text box in focus owns its own '?' — the search box is the
    // simplest one already on screen, via the palette.
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('?');
    await expect(dlg).toBeHidden();
  });

  test('kısayol yardımı: Ctrl+K paletinden de açılıyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Control+k');
    await page.getByLabel('Ara veya komut yaz').fill('kısayol');
    await page.keyboard.press('Enter');

    await expect(page.locator('.palette')).toBeHidden();
    await expect(page.locator('.sheet', { hasText: 'Klavye kısayolları' })).toBeVisible();
  });
});

test.describe('55. Durum çipi — boş proje', () => {
  test('yeni açılışta "Sorun yok" değil, "Henüz ders girilmedi" diyor', async ({ page }) => {
    await open(page);
    const chip = page.locator('.health');
    await expect(chip).toHaveClass(/ok/);
    // The chip also carries its narrow-bar words (`.health-short`, hidden here).
    await expect(chip.locator('.health-text')).toHaveText('Henüz ders girilmedi');
  });
});
