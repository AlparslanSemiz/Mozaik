// Kapanırken bekleyen kayıt (test programı TP3).
//
// The store writes 400 ms after the last change (`SAVE_DELAY`, useStore.ts) so a
// drag does not write on every frame, and a tab that closes inside that window
// takes the change with it unless something writes on the way out. That
// something is the `beforeunload` flush, and nothing measured it: a close was
// only ever asked about in the Roboders guard.
//
// The window is closed by stopping the page's clock, not by racing it. Racing
// it was measured (2026-10-09): clicking "Ekle" alone took 250 ms here, so on a
// slower runner the debounce would fire first and the test would pass without
// ever reaching the flush. With the clock paused the debounce cannot fire, the
// test asserts that, and only then closes the tab.
//
// What it does not measure: a process that dies without `beforeunload` (a
// crash, a killed exe) loses up to 400 ms of work, and that is the contract,
// not a defect. Closing the exe's window is not here either: the WebDriver
// session cannot close the window from the page (`plugin:window|close` is not
// in the capability), so the exe's side is checked by hand (TODO §8l, TP3).

import { expect, test } from './kapan';
import { open, savedText } from './helpers';

test.describe('93. Kapanırken bekleyen kayıt', () => {
  test('400 ms dolmadan kapanan sekmenin son değişikliği depoda kalıyor', async ({ page }) => {
    await page.clock.install();
    await open(page);
    // The opening write has landed, so whatever is stored next is ours.
    await expect.poll(async () => (await savedText(page)).length).toBeGreaterThan(0);

    const now = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(now + 1);

    await page.getByRole('button', { name: 'Okul', exact: true }).click();
    await page.locator('.step', { hasText: 'Derslikler' }).click();
    await page.getByPlaceholder('Derslik adı, örn. A').fill('Kapanış1');
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    // The name lands in the row's own edit box, not as text.
    await expect(page.locator('table.list input').first()).toHaveValue('Kapanış1');

    // The debounce is still pending: without this the close below proves nothing.
    expect(await savedText(page), 'erteleme zamanlayıcısı durdurulamadı').not.toContain('Kapanış1');

    const context = page.context();
    await page.close({ runBeforeUnload: true });

    const again = await context.newPage();
    await open(again);
    expect(await savedText(again)).toContain('Kapanış1');
  });
});
