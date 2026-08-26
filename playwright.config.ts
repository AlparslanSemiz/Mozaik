import { defineConfig } from '@playwright/test';

// E2E testleri DERLENMIS dosyayi file:// uzerinden acar — yani babanin cift
// tiklayacagi seyin ta kendisini. Dev sunucusunu test etmek yaniltici olurdu:
// localStorage, yazdirma ve dosya indirme file:// altinda farkli davranabilir.
export default defineConfig({
  testDir: './e2e',
  // None of these belong in the daily loop: `npm run ekran` writes pictures for
  // a human, and `npm run cozucu` spends the solver's whole budget on every
  // world. Each has its own config.
  // Three more are here for ONE reason, and it is the same reason: they test
  // something that does not exist under file:// — a service worker (site), a
  // secure context (sunucu), the File System Access API (klasor). They run
  // under playwright.site.config.ts (npm run test:site), over http.
  testIgnore: [
    '**/ekran.spec.ts',
    '**/otomatik-stres.spec.ts',
    '**/site.spec.ts',
    '**/sunucu.spec.ts',
    '**/klasor.spec.ts',
  ],
  // Her Playwright context'inin kendi depolamasi var; file:// altinda da
  // gecerli oldugu olculdu (bkz. docs/STATUS.md).
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  use: {
    // Babanin 27 inclik ekrani (1920x1080 CSS pikseli). Sigma ve yatay
    // kaydirma bu boyutta test edilmeli.
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
