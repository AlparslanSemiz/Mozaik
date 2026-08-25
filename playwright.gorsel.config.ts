import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Pixel comparison. Separate from the main suite on purpose — see the comment
// at the top of e2e/gorsel.spec.ts.
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: '**/gorsel.spec.ts',
  snapshotPathTemplate: '{testDir}/__gorsel__/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      // ~20 700 px of a 1920x1080 screen. A whole grid row shifting is ~62 000
      // (34px tall across an 1828px box), so a real layout fault still fails
      // while sub-pixel text rendering passes. The ratio did not need changing
      // when the screen grew: both sides of the comparison scaled with it.
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: 'disabled', // free: this tool has none (forbidden list)
      caret: 'hide',
      scale: 'css',
    },
  },
});
