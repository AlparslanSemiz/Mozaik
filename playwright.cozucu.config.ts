import { defineConfig } from '@playwright/test';

// Cozucu stres suiti: her dunya cozucunun 15 saniyelik butcesini sonuna kadar
// harcar. `npm run kontrol` icinde kosarsa gunluk dongu yavaslar, o yuzden
// `npm run ekran` gibi kendi komutunda durur.
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/otomatik-stres.spec.ts'],
  fullyParallel: true,
  workers: 2,
  // Bir dunya butcesini doldurabilir; varsayilan 30 sn yetmez.
  timeout: 180_000,
  reporter: [['list']],
  use: {
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
