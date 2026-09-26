// Two lessons that may not share a day (TODO B5.3), on screen: the lesson
// sheet adds and takes back the relation, a drag onto the related lesson's
// day is refused with its reason, and one added after the lessons were placed
// shows in Kontrol.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { makeWorld } from '../src/worlds';
import { hover, loadWorld } from './helpers';

/** 510 · MÇ Matematik on Salı 1; 511 · AV Fizik waiting in the tray. */
function world(placeB = false) {
  return makeWorld({
    days: 2,
    hours: 3,
    teachers: [
      { id: 'oMC', short: 'MÇ' },
      { id: 'oAV', short: 'AV', subject: 'Fizik' },
    ],
    classes: [
      { id: 's510', name: '510', roomId: 'dA' },
      { id: 's511', name: '511', roomId: 'dB' },
    ],
    rooms: [
      { id: 'dA', name: 'A' },
      { id: 'dB', name: 'B' },
    ],
    lessons: [
      { id: 'a', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
      { id: 'b', classId: 's511', teacherId: 'oAV', weeklyHours: 1 },
    ],
    placements: placeB ? { 's510|0|0': 'a', 's511|0|1': 'b' } : { 's510|0|0': 'a' },
  });
}

async function openSheet(page: Page) {
  await page.locator('td[data-row="oMC"][data-day="0"][data-hour="0"] .card').click({
    button: 'right',
  });
  await page.locator('.menu').getByRole('menuitem', { name: 'Dersi düzenle' }).click();
  const sheet = page.locator('.sheet');
  await expect(sheet).toBeVisible();
  return sheet;
}

test.describe('İlişki · aynı gün olmasın', () => {
  test('dersin sayfasından eklenince ilişkili dersin günü reddediliyor', async ({ page }) => {
    await loadWorld(page, world());
    const sheet = await openSheet(page);
    await sheet.getByLabel('Aynı gün olmasın: ders ekle').selectOption({ label: 'AV Fizik' });
    const chip = sheet.getByRole('button', { name: 'Kaldır: 511 · AV Fizik' });
    await expect(chip).toBeVisible();
    await page.keyboard.press('Escape');

    const card = page.locator('.pool-card', { hasText: 'AV' }).first();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(page.locator('.ghost')).toHaveCount(1);
    await page.waitForTimeout(150);
    await hover(page, 0, 2);
    await expect(page.locator('.reason-bar')).toContainText(
      '510 · MÇ Matematik Salı günü var, bu dersle aynı güne konmamalı',
    );
    await hover(page, 1, 2);
    await expect(page.locator('.reason-bar')).not.toContainText('aynı güne konmamalı');
    await page.mouse.up();
    await expect(page.locator('td[data-row="oAV"][data-day="1"][data-hour="2"]')).toContainText(
      '511',
    );

    // Taken back from the sheet, the relation is gone.
    const again = await openSheet(page);
    await again.getByRole('button', { name: 'Kaldır: 511 · AV Fizik' }).click();
    await expect(again.getByRole('button', { name: /^Kaldır:/ })).toHaveCount(0);
  });

  test('dersler yerleştikten sonra eklenen ilişki Kontrol’de ihlal', async ({ page }) => {
    await loadWorld(page, world(true));
    const sheet = await openSheet(page);
    await sheet.getByLabel('Aynı gün olmasın: ders ekle').selectOption({ label: 'AV Fizik' });
    await page.keyboard.press('Escape');
    // Nothing moves: both stay on Salı.
    await expect(page.locator('td[data-row="oAV"][data-day="0"][data-hour="1"]')).toContainText(
      '511',
    );

    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    const main = page.locator('.check-page');
    await expect(main).toContainText(
      '510 · MÇ Matematik ile 511 · AV Fizik Salı günü ikisi de var, aynı gün olmamalı.',
    );
    await expect(main).toContainText('Aynı gün olmasın');
  });
});
