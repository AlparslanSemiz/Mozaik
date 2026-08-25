// Visual regression: the same SCENES `npm run ekran` photographs, compared
// against a local reference instead of a pair of human eyes.
//
// It runs on its own (`npm run gorsel`), NOT as part of `npm run kontrol`.
// Reason: `body` uses the system font (styles.css — no web font, principle 3),
// which resolves to Cantarell here and to Segoe UI on my father's Windows. A
// reference is therefore true for ONE machine, and wiring it into the gate
// every commit passes through would turn a font substitution into a red build
// with no bug behind it.
//
// The references ARE committed: with no CI they are the only record of what the
// tool looked like before a change, and a diff of them is worth reading. On a
// new machine, take them again once:
//   npx playwright test --config playwright.gorsel.config.ts --update-snapshots

import { expect, test } from '@playwright/test';
import { openWithSampleTheme, SCENES } from './helpers';

for (const theme of ['light', 'dark'] as const) {
  test.describe(`görsel — ${theme}`, () => {
    for (const scene of SCENES) {
      test(scene.name, async ({ page }) => {
        await openWithSampleTheme(page, theme);
        await scene.go(page);
        await expect(page).toHaveScreenshot(`${theme}-${scene.name}.png`);
        await scene.after?.(page);
      });
    }
  });
}
