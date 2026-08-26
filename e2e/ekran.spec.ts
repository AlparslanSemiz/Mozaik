// Screenshots, not tests. "Show the output, do not claim it" — a layout,
// alignment or colour change is only believable when you can look at it.
//
// Runs OUTSIDE the normal suite (`npm run ekran`), because it asserts nothing;
// counting it among the E2E tests would inflate the number with pictures.
// It walks SCENES from helpers.ts, which is the one list of what the app looks
// like.

import { test } from '@playwright/test';
import { openWithSampleTheme, SCENES } from './helpers';

const OUT = 'test-results/ekran';

for (const theme of ['light', 'dark'] as const) {
  test(`ekran görüntüleri — ${theme}`, async ({ page }) => {
    await openWithSampleTheme(page, theme);

    for (const scene of SCENES) {
      await scene.go(page);
      await page.screenshot({ path: `${OUT}/${theme}-${scene.name}.png` });
      await scene.after?.(page);
    }
  });
}
