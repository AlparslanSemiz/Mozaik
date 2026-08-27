import { defineConfig } from '@playwright/test';

// Devriye: yazilmis bir iddiayi degil, YAZILMAMIS olani arar.
//
// Oteki suitler "su dugmeye basinca su olmali" der ve olmayan yerde susarlar.
// Bu suit hicbir sey iddia etmez; programin icinde dolasir ve sayfanin kendi
// sikayetlerini dinler — konsol hatasi, yakalanmamis promise reddi, ve
// file:// altinda hicbir zaman olmamasi gereken bir ag istegi (e2e/kapan.ts).
//
// `kontrol`un parcasi DEGIL, ve sebebi hiz degil huy: rastgele gezinme
// tohumlu, yani belirlenimci, ama bir kusur bulundugunda okunacak sey bir
// iddia degil bir IZ olur. Iz, video ve ekran gorüntusu o yuzden acik.
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/patrol.spec.ts'],
  fullyParallel: true,
  workers: 2,
  // OLCULEN 2026-08-27, bu makinede: tur 5,7 sn (33 durak), gezinmeler
  // 17,5 · 21,9 · 24,1 sn, toplam 41,9 sn. Yani bu tavan bir butce degil bir
  // KAPI: takilan tek bir kontrol, hicbir sey basmadan butun kosuyu yemesin
  // (tuzak 79 — ilk hali uc dakikada hicbir sekmeye ugramadan dustu).
  timeout: 420_000,
  reporter: [['list']],
  outputDir: './test-results/patrol',
  use: {
    // HICBIR TIKLAMA SINIRSIZ BEKLEYEMEZ, ve bu ayarin varsayilani sinirsiz.
    // Modal bir <dialog> arkasindaki her sey `inert` oluyor, yani sekmeye
    // tiklamak "eylenebilir" olmayi hic beklemiyor: ilk turda bir tab tiklamasi
    // 7 dakika asili kaldi ve testin kendi zaman asimi onu kesti (tuzak 79).
    // Bir devriyede beklenmesi gereken hicbir sey yok.
    actionTimeout: 3000,
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
