// Moving the plans from the old address to the new one, between two REAL
// origins (DECISIONS 2026-11-16, platform/storage/move.ts).
//
// Both addresses are served by Playwright's router out of dist-site/, so the
// browser sees https://alparslansemiz.github.io and
// https://mozaik.alparslansemiz.com as the two different origins they will
// be, with two different localStorages, and nothing leaves the machine. The
// handshake's checks one by one are in move.test.ts; this file asks what the
// reader sees and what each store holds afterwards.
//
// Service workers are blocked: the move does not go through one, and a worker
// registered on a routed origin would only add a second cache to reason about.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BrowserContext, Page } from '@playwright/test';
import { beklenenHata, expect, test } from './kapan';
import { answerDialog } from './helpers';
import adres from '../src/leaf/app/adres.json' with { type: 'json' };

test.use({ serviceWorkers: 'block' });

const ESKI = adres.eski;
const YENI = adres.yeni;
const TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  webmanifest: 'application/manifest+json',
  js: 'text/javascript',
  png: 'image/png',
  svg: 'image/svg+xml',
};

/** Serves dist-site/ at `base`, the way Pages does (CORS header included). */
async function serve(context: BrowserContext, base: string) {
  await context.route(`${base}**`, async (route) => {
    const path = new URL(route.request().url()).pathname.slice(new URL(base).pathname.length);
    const file = path === '' ? 'index.html' : path;
    let body: Buffer;
    try {
      body = readFileSync(resolve('dist-site', file));
    } catch {
      await route.fulfill({ status: 404, body: '' });
      return;
    }
    await route.fulfill({
      status: 200,
      body,
      headers: {
        'content-type': TYPES[file.split('.').pop() ?? ''] ?? 'application/octet-stream',
        'access-control-allow-origin': '*',
      },
    });
  });
}

/** The old address's stub, as its own repository will publish it. */
const STUB = new URL('/ders-programi/', ESKI).toString();
async function serveStub(context: BrowserContext) {
  await context.route(`${STUB}**`, async (route) => {
    const path = new URL(route.request().url()).pathname.slice('/ders-programi/'.length);
    const file = path === '' ? 'index.html' : path;
    await route.fulfill({
      status: 200,
      body: readFileSync(resolve('site/eski-adres', file)),
      headers: {
        'content-type': file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8',
      },
    });
  });
}

async function openSample(page: Page, url: string) {
  await page.goto(url);
  await page.getByRole('button', { name: /Örnek okulu yükle/ }).click();
  await answerDialog(page);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('ders-programi') ?? ''))
    .toContain('Örnek Kurs');
}

const strip = (page: Page) => page.locator('.update-bar', { hasText: /taşın/ });

test.describe('Yeni adrese taşıma', () => {
  test('eski adresteki planlar, sorulup evet denince yeni adrese geçiyor; eskisi yerinde kalıyor', async ({
    context,
    page,
  }) => {
    await serve(context, ESKI);
    await serve(context, YENI);
    await openSample(page, ESKI);
    const eskiOnce = await page.evaluate(() => localStorage.getItem('ders-programi'));

    await expect(strip(page)).toContainText('Mozaik yeni adresine taşındı');
    const popup = context.waitForEvent('page');
    await strip(page).getByRole('button', { name: 'Planları taşı' }).click();
    const yeni = await popup;
    await expect(yeni.locator('.dlg')).toContainText('Eski adresteki planlar buraya gelsin mi?');
    await answerDialog(yeni);
    await expect(yeni.locator('.dlg')).toContainText('1 plan açıldı.');
    await answerDialog(yeni);

    await expect
      .poll(() => yeni.evaluate(() => localStorage.getItem('ders-programi') ?? ''))
      .toContain('Örnek Kurs');
    // The address no longer asks: a reload of that window is an ordinary one.
    expect(new URL(yeni.url()).searchParams.has('tasima')).toBe(false);
    await expect(strip(page)).toContainText('Planlar yeni adrese taşındı');
    // A copy, not a move: the old store is exactly as it was.
    expect(await page.evaluate(() => localStorage.getItem('ders-programi'))).toBe(eskiOnce);
  });

  test('yeni adreste VAZGEÇ denince oradaki plan olduğu gibi kalıyor', async ({
    context,
    page,
  }) => {
    await serve(context, ESKI);
    await serve(context, YENI);
    // Work already at the new address: the sample school.
    const orada = await context.newPage();
    await openSample(orada, YENI);
    await orada.close();

    // A different school at the old one, so an overwrite would show.
    await openSample(page, ESKI);
    await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem('ders-programi')!) as {
        settings: { schoolName: string };
      };
      st.settings.schoolName = 'Eski Adresteki Okul';
      localStorage.setItem('ders-programi', JSON.stringify(st));
    });
    await page.reload();
    await expect(page.locator('.app-title')).toHaveText('Eski Adresteki Okul');

    const popup = context.waitForEvent('page');
    await strip(page).getByRole('button', { name: 'Planları taşı' }).click();
    const yeni = await popup;
    await expect(yeni.locator('.dlg')).toContainText('Eski adresteki planlar buraya gelsin mi?');
    // The question counts what would go: the one plan there.
    await expect(yeni.locator('.dlg')).toContainText('Buradaki 1 plan silinip');
    await answerDialog(yeni, 'cancel');
    await expect(strip(page)).toContainText('Hiçbir plan taşınmadı.');
    const sonra = await yeni.evaluate(() => localStorage.getItem('ders-programi') ?? '');
    expect(sonra).toContain('Örnek Kurs');
    expect(sonra).not.toContain('Eski Adresteki Okul');
  });

  test('başka bir kökenden gelen paket SORULMUYOR bile', async ({ context, page }) => {
    await serve(context, YENI);
    const KOTU = 'https://kotu.example/';
    await context.route(`${KOTU}**`, (route) =>
      route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/html' },
        body: '<!doctype html><title>x</title><p>x</p>',
      }),
    );
    await page.goto(KOTU);
    const popup = context.waitForEvent('page');
    await page.evaluate((yeni) => {
      const w = window.open(yeni + '?tasima=1', '_blank')!;
      const paket = JSON.stringify({ bundleVersion: 1, activeId: '1', plans: [] });
      // Every way a stranger could say it: to the right origin, and to any.
      const say = () => {
        w.postMessage({ tur: 'mozaik-tasima', v: 1, adim: 'paket', paket }, '*');
      };
      addEventListener('message', say);
      setInterval(say, 200);
    }, YENI);
    const yeni = await popup;
    await expect(
      yeni.locator('.tabstrip').getByRole('button', { name: 'Okul bilgileri', exact: true }),
    ).toBeVisible();
    await yeni.waitForTimeout(1500);
    await expect(yeni.locator('.dlg')).toHaveCount(0);
  });

  test('yeni adres cevap vermeyince eski adreste görünen bir şey yok', async ({
    context,
    page,
  }) => {
    // Before the move the new name has no certificate and the probe fails:
    // the strip must not appear, or it would send people to nothing.
    await serve(context, ESKI);
    await context.route(`${YENI}**`, (route) => route.abort('connectionrefused'));
    beklenenHata(page, /ERR_CONNECTION_REFUSED|Failed to load resource/);
    await page.goto(ESKI);
    await expect(
      page.locator('.tabstrip').getByRole('button', { name: 'Okul bilgileri', exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(strip(page)).toHaveCount(0);
  });

  test('eski /ders-programi/ sayfası: yeni adres cevap verince planları kendisi taşıyor', async ({
    context,
    page,
  }) => {
    // A reader from the ders-programi days: plans on the old origin, and
    // /Mozaik/ already redirected away, so following it would leave them behind.
    await serve(context, ESKI);
    await serve(context, YENI);
    await serveStub(context);
    await openSample(page, ESKI);
    await page.goto(STUB);
    await expect(page.getByText('Mozaik yeni adresine taşındı')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/ders-programi/');

    const popup = context.waitForEvent('page');
    await page.getByRole('button', { name: 'Planları taşı' }).click();
    const yeni = await popup;
    await expect(yeni.locator('.dlg')).toContainText('Eski adresteki planlar buraya gelsin mi?');
    await answerDialog(yeni);
    await expect(yeni.locator('.dlg')).toContainText('1 plan açıldı.');
    await expect
      .poll(() => yeni.evaluate(() => localStorage.getItem('ders-programi') ?? ''))
      .toContain('Örnek Kurs');
    await expect(page.getByRole('status')).toContainText('Planlar yeni adrese taşındı');
  });

  test('eski /ders-programi/ sayfası: yeni adres yokken aynı kökendeki /Mozaik/e gidiyor', async ({
    context,
    page,
  }) => {
    await serve(context, ESKI);
    await serveStub(context);
    await context.route(`${YENI}**`, (route) => route.abort('connectionrefused'));
    beklenenHata(page, /ERR_CONNECTION_REFUSED|Failed to load resource/);
    await openSample(page, ESKI);
    await page.goto(STUB);
    await page.waitForURL(ESKI);
    await expect(
      page.locator('.tabstrip').getByRole('button', { name: 'Okul bilgileri', exact: true }),
    ).toBeVisible();
  });
});
