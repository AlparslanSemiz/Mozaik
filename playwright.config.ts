import { defineConfig } from '@playwright/test';

// E2E testleri DERLENMIS dosyayi file:// uzerinden acar — yani babanin cift
// tiklayacagi seyin ta kendisini. Dev sunucusunu test etmek yaniltici olurdu:
// localStorage, yazdirma ve dosya indirme file:// altinda farkli davranabilir.
export default defineConfig({
  testDir: './e2e',
  // None of these belong in the daily loop: `npm run ekran` writes pictures for
  // a human, `npm run gorsel` compares pixels against a machine-local reference,
  // and `npm run cozucu` spends the solver's whole budget on every world. Each
  // has its own config.
  // site.spec.ts is here too: it needs an http server and dist-site/, so it
  // runs under playwright.site.config.ts (npm run test:site).
  testIgnore: [
    '**/ekran.spec.ts',
    '**/gorsel.spec.ts',
    '**/otomatik-stres.spec.ts',
    '**/site.spec.ts',
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
