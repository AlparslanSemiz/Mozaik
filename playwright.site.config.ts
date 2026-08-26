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

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/{site,sunucu,klasor}.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx vite preview --config vite.site.config.ts --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
