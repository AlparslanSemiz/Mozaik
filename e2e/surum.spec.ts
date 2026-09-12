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

import { expect, test } from './kapan';
import type { Page } from '@playwright/test';
import { open, openSettings, reopen } from './helpers';
import { surumBilgisi } from '../scripts/surum.mjs';
import { SURUM_NOTLARI } from '../src/platform/changelog';

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
  test('Ayarlar → Hakkında hangi SÜRÜM olduğunu söylüyor', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Hakkında');

    const panel = buildPanel(page);
    await expect(panel).toBeVisible();
    // The real number, not a placeholder: a version that says 0.0.0-dev on a
    // built file means the define never reached the build.
    await expect(panel).toContainText(`v${surumBilgisi().version}`);
  });

  test('hangi KOPYA olduğunu söylüyor — çünkü üçünün deposu ayrı', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Hakkında');

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
    await openSettings(page, 'Hakkında');

    const panel = buildPanel(page);
    await expect(panel).toContainText('kendini güncellemez');
    await expect(panel).toContainText('https://alparslansemiz.github.io/Mozaik/');
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
    await openSettings(page, 'Hakkında');
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

/** Scoped by heading, the same discipline `buildPanel()` documents above —
    a `.panel` beside this one is not this panel (pitfall 49/74). */
function changelogPanel(page: Page) {
  return page.locator('.panel', { has: page.getByRole('heading', { name: 'Yenilikler' }) }).last();
}

test.describe('79. Yenilikler', () => {
  test('Ayarlar → Hakkında güncel sürümün maddelerini gösteriyor, eskiler kapalı arşivde', async ({
    page,
  }) => {
    await open(page);
    await openSettings(page, 'Hakkında');

    const panel = changelogPanel(page);
    await expect(panel).toBeVisible();

    // The promise, not today's count: the NEWEST release is open on the page
    // and every older one waits in ONE closed archive. This used to name the
    // number of releases (0 archives) and one line from 2.1.0. The second
    // release turned the count red, and the line kept passing from inside the
    // closed archive, because text matching reads hidden text too (pitfall 97).
    const [newest, ...older] = SURUM_NOTLARI;
    for (const line of newest!.items) {
      await expect(panel.getByText(line, { exact: true })).toBeVisible();
    }

    const archive = panel.locator('details');
    await expect(archive).toHaveCount(older.length > 0 ? 1 : 0);
    if (older.length > 0) {
      await expect(archive).not.toHaveAttribute('open');
      for (const old of older) {
        const line = archive.getByText(old.items[0]!, { exact: true });
        await expect(line).toHaveCount(1);
        await expect(line).toBeHidden();
      }
    }
  });

  test('Ayarlar sekmesindeki nokta, panel açılınca kayboluyor ve kalıcı', async ({ page }) => {
    await open(page);
    const dot = page.locator('.tab[data-section="settings"] .tab-dot');
    // A fresh profile has never seen any version, so the dot starts lit.
    await expect(dot).toBeVisible();

    await openSettings(page, 'Hakkında');
    await expect(dot).toBeHidden();

    // ...and the mark is written, not merely the in-memory state: it survives
    // the reload the way the sample-data hint does (theme.ts's INTRO_KEY).
    await reopen(page);
    await expect(page.getByRole('button', { name: 'Okul', exact: true })).toBeVisible();
    await expect(dot).toBeHidden();
  });
});
