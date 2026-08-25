// The SECOND build target: dist-site/, a PWA.
//
// dist/index.html — the file my father double-clicks — is built by
// vite.config.ts and is NOT touched by anything here. Two targets, one source
// tree, and the difference between them is this file.
//
// Why the site is ALSO a single file: the service worker has to know what to
// keep a copy of. With hashed chunks that list has to be generated after every
// build and kept in step; with one file the shell is a constant and can be
// read by a human. It also keeps the two targets byte-comparable — the site is
// the same app, not a variant of it.
//
// base: './' so it works both at the root and under a repository path
// (kullanici.github.io/ders-programi/), which is where GitHub Pages puts it.

import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/** Registration is guarded twice: no service worker API, or not http(s). */
const REGISTER = `
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  });
}`;

/**
 * The manifest link, the icon and the registration script exist ONLY here.
 * index.html stays as it is, so the file:// build cannot pick up a service
 * worker or a fetch of any kind — "internet gerekmez" has to stay something
 * you can prove with grep. `order: 'post'` puts these after singlefile has
 * inlined everything, so it cannot take them for assets to inline.
 */
function siteShell(): Plugin {
  return {
    name: 'ders-programi-site-shell',
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        { tag: 'link', attrs: { rel: 'manifest', href: './manifest.webmanifest' }, injectTo: 'head' as const },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: './icon.svg' }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#2e4ba8' }, injectTo: 'head' as const },
        { tag: 'script', children: REGISTER, injectTo: 'body' as const },
      ],
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: 'site',
  plugins: [react(), viteSingleFile(), siteShell()],
  build: {
    outDir: 'dist-site',
    emptyOutDir: true,
    target: 'es2020',
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000_000,
    reportCompressedSize: false,
  },
});
