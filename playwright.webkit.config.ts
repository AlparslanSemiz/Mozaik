// The main E2E suite in Playwright's WebKit: `npm run test:webkit`.
//
// Not part of `npm run kontrol` (that is the user's call, after the first
// measurement). Playwright's WebKit is officially built for Ubuntu and Debian;
// on this Fedora machine it runs in Playwright's own container, see
// docs/TESTPLAN.md. Tests that only Chromium can run skip themselves
// (`PDF_YALNIZ_CHROMIUM` in e2e/helpers.ts).
import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  projects: [{ name: 'webkit', use: { browserName: 'webkit' } }],
});
