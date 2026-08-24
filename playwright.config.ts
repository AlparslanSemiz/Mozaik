import { defineConfig } from '@playwright/test';

// E2E testleri DERLENMIS dosyayi file:// uzerinden acar — yani babanin cift
// tiklayacagi seyin ta kendisini. Dev sunucusunu test etmek yaniltici olurdu:
// localStorage, yazdirma ve dosya indirme file:// altinda farkli davranabilir.
export default defineConfig({
  testDir: './e2e',
  // Screenshots, not tests: `npm run ekran` runs them with their own config.
  testIgnore: '**/ekran.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    // Babanin ekrani. Sigma ve yatay kaydirma bu boyutta test edilmeli.
    viewport: { width: 1366, height: 768 },
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
