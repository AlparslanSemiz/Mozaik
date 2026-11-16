// İkame and the dated layer (schema v18, 2026-11-16).
//
// A teacher is not coming on a date: their page's "Bugün yok…" opens that
// date, their hours are listed with the teachers free then, and the one
// chosen lands in the saved plan without touching the base week. The Program
// strip's chip says the week has a change; the substitute's page counts it;
// the list prints; and a plan carrying it opens again with it.

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './kapan';
import { loadWorld, openSetup, savedState, savedText, settledText } from './helpers';
import { makeWorld } from '../src/pure/worlds';
import type { State } from '../src/leaf/model';

// A Tuesday. The school below teaches Tuesday and Wednesday.
const TODAY = new Date('2026-11-17T10:00:00');

function world(): State {
  const w = makeWorld({
    days: [
      { name: 'Salı', longBreakAfter: 0 },
      { name: 'Çarşamba', longBreakAfter: 0 },
    ],
    hours: 3,
    teachers: [
      { id: 'tAY', short: 'AY', subject: 'Fizik' },
      { id: 'tBK', short: 'BK', subject: 'Fizik' },
      { id: 'tCD', short: 'CD', subject: 'Kimya' },
    ],
    classes: [{ id: 'c510', name: '510', roomId: null }],
    lessons: [{ id: 'l1', classId: 'c510', teacherId: 'tAY', weeklyHours: 2 }],
    placements: { 'c510|0|0': 'l1', 'c510|1|1': 'l1' },
  });
  const names: Record<string, string> = {
    tAY: 'Ayşe Yılmaz',
    tBK: 'Bekir Kaya',
    tCD: 'Cem Doğan',
  };
  return { ...w, teachers: w.teachers.map((t) => ({ ...t, name: names[t.id]! })) };
}

test.describe('İkame', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
    await page.addInitScript(() => {
      window.print = () => {
        (window as unknown as { basildi: boolean }).basildi = true;
      };
    });
  });

  test('Bugün yok… o günü açıyor, seçilen ikame kayda giriyor, taban hafta değişmiyor', async ({
    page,
  }) => {
    await loadWorld(page, world(), 'Öğretmenler');
    await openSetup(page, 'Öğretmenler');
    const before = await settledText(page);
    await page.getByRole('button', { name: 'Ayşe Yılmaz', exact: true }).click();
    await page.getByRole('button', { name: 'Bugün yok…' }).click();

    const day = page.getByRole('dialog', { name: 'Salı 17 Kasım' });
    await expect(day).toBeVisible();
    // Another date moves the one-day absence with it, and back.
    await day.getByLabel('Tarih').fill('2026-11-18');
    await expect(page.getByRole('dialog', { name: 'Çarşamba 18 Kasım' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Yerine: 2 · 510' })).toBeVisible();
    await page.getByLabel('Tarih').fill('2026-11-17');
    await expect(day).toBeVisible();
    const pick = day.getByRole('combobox', { name: 'Yerine: 1 · 510' });
    // Same subject first; Cem teaches another one.
    await expect(pick.locator('option')).toHaveText([
      'Seçilmedi',
      'Boş geçsin',
      'Bekir Kaya · Fizik',
      'Cem Doğan · Kimya',
    ]);
    const scan = await new AxeBuilder({ page })
      .include('[role=dialog]')
      .disableRules(['color-contrast'])
      .analyze();
    expect(scan.violations.map((v) => v.id)).toEqual([]);

    await pick.selectOption({ label: 'Bekir Kaya · Fizik' });
    // The absence and the cover are two saves; the second is the one asked about.
    await expect
      .poll(async () => (JSON.parse(await savedText(page)) as State).dated)
      .toEqual({
        absent: [{ id: 'tAY', from: '2026-11-17', to: '2026-11-17' }],
        covers: [{ date: '2026-11-17', classId: 'c510', hour: 0, teacherId: 'tBK' }],
      });
    const saved = await savedState(page, before);
    expect(saved.programs[0]!.placements).toEqual(world().programs[0]!.placements);

    // The list on paper: the one table, and nothing else.
    await day.getByRole('button', { name: 'Yazdır' }).click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { basildi?: boolean }).basildi))
      .toBe(true);
    const paper = page.locator('.print-one-box');
    await expect(paper.locator('h1')).toHaveText('İkame listesi · Salı 17 Kasım');
    await expect(paper.locator('tr').nth(1)).toHaveText(/1510Ayşe YılmazBekir Kaya/);
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await expect(paper).toHaveCount(0);

    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');

    // The substitute's page counts it.
    await page.getByRole('button', { name: 'Bekir Kaya', exact: true }).click();
    await expect(page.getByText('İkame: bu hafta 1, toplam 1 saat')).toBeVisible();
    await page.keyboard.press('Escape');

    // The Program strip says this week has a change.
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Bu hafta: 17–18 Kasım, 1 değişiklik' }),
    ).toBeVisible();
  });

  test('tarihli değişiklikleri taşıyan plan dosyası yeniden açılıyor, hafta geri alınıyor', async ({
    page,
  }) => {
    const w = {
      ...world(),
      dated: {
        absent: [{ id: 'tAY', from: '2026-11-17', to: '2026-11-17' }],
        covers: [{ date: '2026-11-17', classId: 'c510', hour: 0, teacherId: null }],
      },
    };
    await loadWorld(page, w);
    const before = await settledText(page);
    expect((JSON.parse(before) as State).dated).toEqual(w.dated);

    const chip = page.getByRole('button', { name: 'Bu hafta: 17–18 Kasım, 1 değişiklik' });
    await chip.click();
    const day = page.getByRole('dialog', { name: 'Salı 17 Kasım' });
    await expect(day.getByRole('combobox', { name: 'Yerine: 1 · 510' })).toHaveValue('-');
    await day.getByRole('button', { name: 'Bu haftanın değişikliklerini sil' }).click();
    await expect(day.getByText('Bu gün değişen ders yok.')).toBeVisible();
    expect((await savedState(page, before)).dated).toEqual({ absent: [], covers: [] });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Bugün kim yok?' })).toBeFocused();
  });

  test('bir ders yalnız bu hafta başka saate taşınıyor, ızgara o haftayı işaretli gösteriyor', async ({
    page,
  }) => {
    await loadWorld(page, world());
    const before = await settledText(page);
    await page.getByRole('button', { name: 'Bugün kim yok?' }).click();
    const day = page.getByRole('dialog', { name: 'Salı 17 Kasım' });
    await day.getByRole('combobox', { name: 'Bir dersi değiştir…' }).selectOption({ index: 1 });
    const pick = day.getByRole('combobox', { name: 'Yerine: 1 · 510' });
    await expect(pick).toHaveValue('-');
    await pick.selectOption({ label: '3. saate' });
    await expect
      .poll(async () => (JSON.parse(await savedText(page)) as State).dated.covers)
      .toEqual([{ date: '2026-11-17', classId: 'c510', hour: 0, teacherId: null, to: 2 }]);
    expect((await savedState(page, before)).programs[0]!.placements).toEqual(
      world().programs[0]!.placements,
    );

    await day.getByRole('button', { name: 'Programda göster' }).click();
    const bar = page.getByRole('region', { name: '17–18 Kasım' });
    await expect(
      page.getByRole('button', { name: 'Bu hafta: 17–18 Kasım, 1 değişiklik' }),
    ).toBeVisible();
    await expect(bar).toContainText('Değişen');
    await expect(page.locator('.program-body.previewing .card.mark-moved')).toHaveCount(1);
    await bar.getByRole('button', { name: 'Temel haftaya dön' }).click();
    await expect(bar).toBeHidden();
    await expect(page.locator('.card.mark-moved')).toHaveCount(0);
  });
});
