import { defineConfig } from '@playwright/test';

// The REAL exe, not the browser build with a fake `__TAURI__` (that is
// e2e/exe.spec.ts). Playwright is only the runner here: no browser is opened,
// every test drives the Linux program through tauri-driver and WebDriver
// (scripts/webdriver.mjs says why). One worker, because every test starts its
// own program and the driver port is one port. `npm run exe:e2e` builds the
// program first; it is outside `npm run kontrol` like `exe` and `exe:test`,
// because a Rust release build takes minutes.
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/gercek-exe.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  reporter: [['list']],
});
