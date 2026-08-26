// Screenshots, not tests. "Show the output, do not claim it" — a layout,
// alignment or colour change is only believable when you can look at it.
//
// Runs OUTSIDE the normal suite (`npm run ekran`), because it asserts nothing;
// counting it among the E2E tests would inflate the number with pictures.
// It walks SCENES from helpers.ts, which is the one list of what the app looks
// like.

import { test, type Page } from '@playwright/test';
import { openWithSampleTheme, SCENES } from './helpers';

const OUT = 'test-results/ekran';

/**
 * Waits until nothing on the page is still moving.
 *
 * Without this the pictures are worthless and they LOOK fine, which is worse:
 * every tab and every section fades in from `@starting-style`, so a screenshot
 * taken the moment a destination is reachable catches the panels part way
 * through the fade. Caught by looking — `dark-12-ayarlar-gorunum.png` came out
 * completely blank while its light twin came out at about half opacity, and no
 * assertion anywhere would ever have said so, because this file asserts
 * nothing. That is the point of it.
 *
 * `a.finished` and not a fixed sleep: the durations are a setting now
 * (Ayarlar → Görünüm → Hareket), so a number here would be wrong for two of the
 * three steps. Animations that never finish are filtered out rather than
 * waited on, and the whole wait is capped — a picture is not worth a hang.
 */
async function settled(page: Page) {
  await page.evaluate(async () => {
    await Promise.race([
      Promise.allSettled(
        document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.finished),
      ),
      new Promise((r) => setTimeout(r, 2_000)),
    ]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`ekran görüntüleri — ${theme}`, async ({ page }) => {
    await openWithSampleTheme(page, theme);

    for (const scene of SCENES) {
      await scene.go(page);
      await settled(page);
      await page.screenshot({ path: `${OUT}/${theme}-${scene.name}.png` });
      await scene.after?.(page);
    }
  });
}
