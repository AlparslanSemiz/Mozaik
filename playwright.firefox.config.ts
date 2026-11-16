// The main E2E suite in Playwright's Firefox: `npm run test:firefox`.
//
// Not part of `npm run kontrol` or CI, like playwright.webkit.config.ts: it is
// run by hand, on the files a change touches. Tests that only Chromium can run
// skip themselves (`PDF_YALNIZ_CHROMIUM`, `KLASOR_YALNIZ_CHROMIUM`,
// `SAYDAM_GORUNTU_FIREFOX_YOK` in e2e/helpers.ts).
import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  projects: [{ name: 'firefox', use: { browserName: 'firefox' } }],
});
