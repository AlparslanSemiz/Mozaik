// 78. Which build is this, and can it update itself.
//
// My father gives feedback, I fix it, I deploy. Until this existed neither of
// us could check the middle step: there was no version number anywhere in the
// program, so "düzelttim, dener misin" had nothing to compare against and a
// deploy that never reached him looked exactly like a deploy that did.
//
// This file measures the file:// route, which is the one that CANNOT update
// itself — and must therefore say so, and must still say where the newest one
// is. The site's half (the cache name carrying the build, the strip that
// appears when a newer worker takes over) is measured in site.spec.ts, over
// http, because none of it exists here.

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { open, openSettings } from './helpers';
import { surumBilgisi } from '../scripts/surum.mjs';

/**
 * Scoped by its HEADING, not by its text. `hasText` matches a substring and
 * ignores case, and the panel beside this one says "Tarayıcının bu program
 * için ayırdığı yer" — which is how the first version of this file kept
 * measuring the wrong panel (pitfall 49).
 */
function buildPanel(page: Page) {
  return page
    .locator('.panel', { has: page.getByRole('heading', { name: 'Sürüm ve güncelleme' }) })
    .last();
}

test.describe('78. Sürüm ve güncelleme', () => {
  test('Ayarlar → Veri hangi SÜRÜM olduğunu söylüyor', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Veri');

    const panel = buildPanel(page);
    await expect(panel).toBeVisible();
    // The real number, not a placeholder: a version that says 0.0.0-dev on a
    // built file means the define never reached the build.
    await expect(panel).toContainText(`v${surumBilgisi().version}`);
  });

  test('hangi KOPYA olduğunu söylüyor — çünkü üçünün deposu ayrı', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Veri');

    const panel = buildPanel(page);
    // This IS the double-clicked file. Calling it "Site" here would send
    // somebody looking for an address, and calling all three the same thing
    // is how a term's work ends up split across two stores.
    await expect(panel).toContainText('Dosya');
    await expect(panel).not.toContainText('Windows kurulumu');

    const nerede = page.locator('.panel', { hasText: 'Veriler nerede' }).last();
    await expect(nerede).toContainText('file://');
    await expect(nerede).toContainText('ayrıdır');
  });

  test('kendini güncellemediğini SÖYLÜYOR ve nereye bakılacağını yazıyor', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Veri');

    const panel = buildPanel(page);
    await expect(panel).toContainText('kendini güncellemez');
    await expect(panel).toContainText('https://alparslansemiz.github.io/ders-programi/');
    // No "check for updates" button here: there is nothing it could ask.
    await expect(panel.getByRole('button', { name: /Güncellemeleri denetle/ })).toHaveCount(0);
  });

  test('İLKE 3: sürümü göstermek için hiçbir yere BAĞLANMIYOR', async ({ page }) => {
    // The address above is a string on screen, and this is what says so. The
    // whole point of the file:// route is that it fetches nothing at runtime,
    // and a version check is exactly the kind of feature that quietly breaks
    // that — so the claim is measured rather than promised.
    const disari: string[] = [];
    page.on('request', (req) => {
      if (!req.url().startsWith('file://')) disari.push(req.url());
    });

    await open(page);
    await openSettings(page, 'Veri');
    await expect(page.locator('.panel', { hasText: 'Bu program' }).last()).toBeVisible();
    // Give anything asynchronous a chance to misbehave before we believe it.
    await page.waitForTimeout(500);

    expect(disari, `ağa çıkıldı: ${disari.join(', ')}`).toEqual([]);
  });

  test('güncelleme şeridi ORTADA YOK — söylenecek bir şey olmadan', async ({ page }) => {
    // The strip is the one thing that must never appear uninvited: it pushes
    // every screen down a row, and it would be lying — this copy has no
    // service worker and therefore no newer build to announce.
    await open(page);
    await expect(page.locator('.update-bar')).toHaveCount(0);
  });
});
