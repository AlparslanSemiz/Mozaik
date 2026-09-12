import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { visualizer } from 'rollup-plugin-visualizer';
import { surumBilgisi } from './scripts/surum.mjs';

// The size report, and it is OFF unless asked for (`npm run analiz`). A plugin
// that runs in every build is a plugin that can change what every build
// produces, and this one has one job: answer "what is the megabyte made of"
// without anybody counting by hand again. The hand count exists — WORKLOG,
// 2026-09-11 — and it took a sourcemap script and an afternoon.
//
// What it does NOT answer, measured the day it was installed: its numbers are
// PRE-MINIFY (`renderedLength`), so they total 1,8 MB against a shipped file of
// just over one. They are shares, not bytes on disk, and they cannot be
// compared with the hand count without lying. Read that way they still say
// something the hand count needed a script for: react-dom is the largest single
// package, the four dictionaries are the largest block of ours, and a
// dependency that arrives tomorrow shows up in one run. For exact bytes in the
// shipped file the sourcemap method is still the only honest one.
const ANALIZ = process.env.ANALIZ === '1';

// Cikti TEK bir dist/index.html olmali: babama giden sey o dosya, baska hicbir sey degil.
// Cift tiklayinca, internet olmadan, sunucu olmadan calisir.
export default defineConfig({
  base: './',
  // The site target keeps its extra files (manifest, service worker, icons)
  // in site/. Not one byte of them may land next to dist/index.html: that
  // build is ONE file and the claim has to stay checkable with ls.
  publicDir: false,
  plugins: [
    react(),
    viteSingleFile(),
    ...(ANALIZ
      ? [
          visualizer({
            filename: 'test-results/demet/analiz.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            // The numbers that matter here are the ones in the file my father
            // double-clicks, so the report is built from the emitted chunk
            // rather than from the module graph.
            emitFile: false,
          }),
        ]
      : []),
  ],
  // Which build this is, pressed in at build time. BOTH configs define it:
  // a number that only one of the four routes carries is worse than no
  // number, because the route without it looks like an old one.
  define: { __SURUM__: JSON.stringify(surumBilgisi()) },
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
    // Vitest hands every stylesheet over as an empty string, `?raw` included,
    // unless it is named here. `preferences.test.ts` reads the order of the
    // motion rules out of this one (pitfall 58), and read empty it would have
    // passed or failed on nothing. Only main.tsx imports it, and no unit test
    // loads main.tsx.
    css: { include: [/src\/styles\.css/] },
  },
});
