import { defineConfig } from '@playwright/test';

// The upgrade gate's second half (e2e/guncelleme-exe.spec.ts): the new exe
// opening what the last released exe wrote. Only meaningful on the runner
// `.github/workflows/guncelleme-windows.yml` prepares; anywhere else the one
// test skips itself. Its own config because it must not run with the real exe
// suite: that suite empties the program's folder and profile before every
// test, and this test exists to open what is in them.
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/guncelleme-exe.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 300_000,
  reporter: [['list']],
});
