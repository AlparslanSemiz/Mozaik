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
      // ~10 000 px of a 1366x768 screen. A whole row shifting is ~11 000, so a
      // real layout fault still fails while sub-pixel text rendering passes.
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: 'disabled', // free: this tool has none (forbidden list)
      caret: 'hide',
      scale: 'css',
    },
  },
});
