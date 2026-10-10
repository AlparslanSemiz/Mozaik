// The SITE tests, over http — the only place a service worker exists.
//
// Separate config because the target is different: playwright.config.ts opens
// dist/index.html over file://, which is what my father double-clicks. These
// open http://localhost, which is what GitHub Pages will serve. Both are real
// delivery routes and both are tested; neither substitutes for the other.
//
// One worker: a service worker is per browser context and going offline is
// too, so parallelism would buy nothing on five tests and could hide a
// registration race behind a retry.
//
// Three files now, and they are here for the same reason rather than by
// convenience: every one of them tests something that DOES NOT EXIST under
// file:// — a service worker (site), a secure context (sunucu), the File
// System Access API (klasor).

import { defineConfig } from '@playwright/test';
import { sitePort } from './e2e/sitePort';

// The port is this folder's, never shared, and the server is never reused:
// why, and the check that the answer is this folder's build, in sitePort.ts
// and siteIdentity.ts.
const port = sitePort();
const url = `http://localhost:${port}/`;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/{site,sunucu,klasor,linux-tasima}.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  globalSetup: './e2e/siteIdentity.ts',
  use: {
    // Turkish locators; why this is a locale and not a stored seed is in
    // playwright.config.ts.
    locale: 'tr-TR',
    baseURL: url,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npx vite preview --config vite.site.config.ts --port ${port} --strictPort`,
    url,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
