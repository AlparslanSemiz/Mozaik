import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Cikti TEK bir dist/index.html olmali: babama giden sey o dosya, baska hicbir sey degil.
// Cift tiklayinca, internet olmadan, sunucu olmadan calisir.
export default defineConfig({
  base: './',
  // The site target keeps its extra files (manifest, service worker, icons)
  // in site/. Not one byte of them may land next to dist/index.html: that
  // build is ONE file and the claim has to stay checkable with ls.
  publicDir: false,
  plugins: [react(), viteSingleFile()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    // Tek dosyada modulepreload linki yok; polyfill'i birakmak dosyaya
    // hic calismayacak bir fetch() cagrisi koyuyor. "Internet gerekmez"
    // iddiasi grep ile dogrulanabilir kalsin.
    modulePreload: { polyfill: false },
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000_000,
    reportCompressedSize: false,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
