// Empty screens and keyboard navigation.
//
// "Boş ekranlar yönlendirir" is a rule in docs/LAYOUT.md and not one of these
// screens was tested: they are the first thing a new project shows, and the
// only place that answers "what do I do first".

import { expect, test } from './kapan';
import {
  reopen,
  answerDialog,
  open,
  onScreen,
  openLessons,
  openProblems,
  openSetup,
  openSettings,
  openWithSample,
  savedText,
} from './helpers';

test.describe('35. Boş ekranlar yönlendiriyor', () => {
  test('veri yokken Okul bilgileri sekmesiyle açılıyor', async ({ page }) => {
    await open(page);
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Okul bilgileri',
    );
    await expect(page.locator('.panel', { hasText: 'Başlarken' })).toContainText('Okulu tanıt');
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
      await expect(line).toContainText("Mozaik'in ne yaptığını görmek");
      await expect(line.getByRole('button', { name: 'Örnek okulu yükle' })).toBeVisible();

      await line.getByRole('button', { name: 'Bir daha gösterme' }).click();
      await expect(page.locator('.intro-line')).toHaveCount(0);
      // The panel around it stays: it is the "what do I do first" answer.
      await expect(page.locator('.panel', { hasText: 'Başlarken' })).toContainText('Okulu tanıt');

      await reopen(page);
      await expect(page.locator('.panel', { hasText: 'Başlarken' })).toBeVisible();
      await expect(page.locator('.intro-line')).toHaveCount(0);
    });

    test('örnek veri yüklendikten sonra Kurulum’a dönünce satır yok', async ({ page }) => {
      await open(page);
      await page.getByRole('button', { name: /Örnek okulu yükle/ }).click();
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

      // The offer stands over Okul bilgileri's Derslikler too (K1).
      await openSetup(page, 'Derslikler');
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

  // BAŞLARKEN TICKS ITSELF. It used to be one sentence that skipped the
  // school's name, days and bell (the last tab) and vanished with the first
  // teacher. Now: five tasks read from the plan (nine steps until Sadeleşme,
  // 2026-11-16), each with its way there, folded or closed only when the
  // reader says so.
  test('Başlarken beş iş, plandan işaretleniyor, her işin düğmesi ilk eksiğe götürüyor', async ({
    page,
  }) => {
    await open(page);
    const list = page.locator('section.checklist');
    await expect(list.locator('li[data-step]')).toHaveCount(5);
    await expect(list.locator('li.done')).toHaveCount(0);
    await expect(list).toContainText('0 / 5 adım');
    // The first step names the default week, so a wrong one is seen.
    await expect(list.locator('li[data-step="school"]')).toContainText('Salı–Pazar, günde 12 saat');

    await list.getByRole('button', { name: 'Okul adını ve zili gir' }).click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Okul bilgileri',
    );
    await expect(
      page.locator('.ribbon .ribbon-group').first().locator('.btn[aria-pressed="true"]'),
    ).toContainText('Zil ve günler');
    await page.getByPlaceholder('örn. Semiz Kurs').fill('Deneme Kurs');

    // The school task is not done until its lists are: its button goes on to
    // the first empty one.
    await page
      .locator('.tabstrip')
      .getByRole('button', { name: 'Okul bilgileri', exact: true })
      .click();
    await expect(list.locator('li[data-step="school"]')).not.toHaveClass(/done/);
    await expect(list).toContainText('0 / 5 adım');

    // People next, not rooms: a course may have none (walkthrough, 2026-11-16).
    await expect(list.getByRole('button', { name: 'Öğretmen ekle' })).toBeVisible();
    await expect(list.getByRole('button', { name: 'Derslik ekle' })).toHaveCount(0);

    // A teacher does not make it go away.
    await expect(list).toBeVisible();
  });

  test('Başlarken daraltılınca sıradaki iş kalıyor, kapatılınca tek bağlantıya iniyor', async ({
    page,
  }) => {
    await open(page);
    const list = page.locator('section.checklist');
    await list.getByRole('button', { name: 'Listeyi daralt' }).click();
    await expect(list.locator('li[data-step]')).toHaveCount(0);
    await expect(list).toContainText('Sıradaki: Okulu tanıt');
    await expect(list.getByRole('button', { name: 'Okul adını ve zili gir' })).toBeVisible();

    await reopen(page);
    await expect(list.locator('li[data-step]')).toHaveCount(0);
    await list.getByRole('button', { name: 'Listeyi göster' }).click();
    await expect(list.locator('li[data-step]')).toHaveCount(5);

    await list.getByRole('button', { name: 'Listeyi kapat' }).click();
    await expect(list).toHaveCount(0);
    // The sample-school offer outlives the list: closing it declined nothing.
    await expect(page.locator('.intro-line')).toBeVisible();
    await reopen(page);
    await expect(page.locator('section.checklist')).toHaveCount(0);
    // Closed is one link with the way back (it had none, TODO SD7).
    await page.getByRole('button', { name: 'Başlarken listesini göster' }).click();
    await expect(page.locator('section.checklist li[data-step]')).toHaveCount(5);
  });

  test('dersleri olan bir planda Başlarken tek satır', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Derslikler');
    const list = page.locator('section.checklist');
    // The sample has everything up to the timetable itself.
    await expect(list).toContainText('3 / 5 adım');
    await expect(list).toContainText('Sıradaki: Kalanı diz');
    await expect(list.locator('li[data-step]')).toHaveCount(0);
  });

  test('boş ekranların düğmesi eksik adıma götürüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await onScreen(page, '.empty-screen').getByRole('button', { name: 'Öğretmen ekle' }).click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Öğretmenler',
    );
    await expect(page.locator('.ribbon .step[aria-pressed="true"]')).toContainText('Liste');

    // The lesson form's picker says what is missing on the other side.
    await openLessons(page, 'class');
    await page.locator('.cols aside').getByRole('button', { name: 'Sınıf ekle' }).click();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Sınıflar',
    );
    await expect(page.locator('.ribbon .step[aria-pressed="true"]')).toContainText('Liste');

    // And the school's name and bell, which no empty screen used to mention:
    // the problem list (the Kontrol tab until K3) says it too.
    const problems = await openProblems(page);
    await problems.getByRole('button', { name: 'Okul adını ve zili gir' }).click();
    await expect(problems).toBeHidden();
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Okul bilgileri',
    );
  });

  test('Program: ne yapılacağını sırayla söylüyor', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    const screen = page.locator('.empty-screen');
    await expect(screen).toContainText('Henüz dizilecek ders yok');
    // The tabs it names are the five of K1 (2026-11-16).
    await expect(screen).toContainText('Öğretmenler ve Sınıflar sekmelerinde');
    // Not clipped: the empty screen must never live inside the grid's
    // overflow:hidden shell.
    await expect(page.locator('main.main.no-overflow')).toHaveCount(0);
  });

  test('Yazdır: basılacak bir şey olmadığını söylüyor', async ({ page }) => {
    await open(page);
    await page
      .locator('.tabstrip')
      .getByRole('button', { name: 'Yazdır ve gönder', exact: true })
      .click();
    // `onScreen`, not a bare locator: the Program tab is mounted-but-hidden and
    // carries an empty state of its own ("Henüz dizilecek ders yok").
    await expect(onScreen(page, '.empty-screen')).toBeVisible();
    await expect(onScreen(page, '.empty-screen')).toContainText('Önce dersleri girip');
  });

  test('sorun listesi: boş planda ilk eksik adıma götürüyor', async ({ page }) => {
    await open(page);
    const problems = await openProblems(page);
    await expect(problems.locator('.empty-screen')).toContainText('Kontrol edilecek bir şey yok');
    await expect(problems.getByRole('button', { name: 'Öğretmen ekle' })).toBeVisible();
  });

  test('liste sayaçları boşken soluk', async ({ page }) => {
    await open(page);
    // Okul bilgileri's two lists, and on a brand-new project both are empty —
    // Branşlar included, since a new project no longer arrives with the 21
    // built-in subjects already on its list.
    await expect(page.locator('.ribbon .step[data-empty="true"]')).toHaveCount(2);

    await openSetup(page, 'Derslikler');
    await page.getByPlaceholder('Derslik adı, örn. A').fill('A');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await expect(page.locator('.ribbon .step[data-empty="true"]')).toHaveCount(1);
  });

  test('boş projede bile Ayarlar açılıyor ve dolu', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Zil ve günler');
    await expect(page.locator('.cols aside')).toContainText('Zil saatleri');
    await expect(page.locator('table.bell-preview')).toBeVisible();
  });
});

test.describe('36. Klavye', () => {
  test('Tab ile beş sekmeye de ulaşılıyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    // The first stop is "İçeriğe geç" (KS27), the way past the top bar.
    await expect(page.locator(':focus')).toHaveText('İçeriğe geç');
    await page.keyboard.press('Tab');
    // Then "Dosya ▾" (2026-11-16), the file's menu at the bar's left end.
    await expect(page.locator(':focus')).toContainText('Dosya');
    await page.keyboard.press('Tab');

    // Then the sections, in the order they are drawn.
    const names: string[] = [];
    for (let i = 0; i < 5; i++) {
      names.push(
        await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? ''),
      );
      await page.keyboard.press('Tab');
    }
    expect(names).toEqual([
      'Program',
      'Öğretmenler',
      'Sınıflar',
      'Yazdır ve gönder',
      'Okul bilgileri',
    ]);
  });

  test('Enter ile sekme değiştirilebiliyor ve aria-current takip ediyor', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');
    // The first stop is "İçeriğe geç" (KS27), the way past the top bar.
    await expect(page.locator(':focus')).toHaveText('İçeriğe geç');
    await page.keyboard.press('Tab');
    // Dosya ▾ first (2026-11-16), then two stops in: Program, Öğretmenler.
    for (let i = 0; i < 2; i++) await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('.tab[aria-current="true"]')).toHaveAttribute(
      'aria-label',
      'Öğretmenler',
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
    await page.locator('.step', { hasText: 'Branşlar' }).focus();
    await page.keyboard.press('Enter');
    // The steps are `.btn`s in the tool strip now, so "you are here" is the
    // button state, not a navigation link's `aria-current`.
    await expect(page.locator('.step[aria-pressed="true"]')).toContainText('Branşlar');
  });
});
