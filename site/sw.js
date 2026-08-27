// The service worker exists for ONE reason: principle 3 says the tool works
// without the internet, and a web page does not — unless it keeps its own copy.
// After the first visit the site opens with the network unplugged, which is
// what makes it a fair second delivery route beside the double-clicked file.
//
// It is written by hand and stays under fifty lines. A build-time precache
// plugin would be a dependency (default answer: no) and it would need the
// hashed file names — which do not exist here, because the site is built with
// vite-plugin-singlefile exactly like dist/index.html. The shell below is the
// WHOLE app plus its icons.
//
// __SURUM__ IS REPLACED AT BUILD TIME (vite.site.config.ts, stampServiceWorker).
// Do not write a number here by hand. The name held still at 'ders-programi-v1'
// for two versions and that was a real bug rather than an untidy one: a browser
// byte-compares sw.js, an unchanged file never runs `install` again, `addAll`
// never re-fetches the shell, and a new deploy therefore arrived ONE LOAD LATE
// with nothing on screen to say so. A name that moves with the build makes
// `install` run, the shell refresh, and `activate` drop what came before.

const CACHE = 'ders-programi-__SURUM__';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  // One cache, one version. An old version left behind would serve last
  // month's app to someone who just reloaded to get the new one.
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Cache first, refresh behind: the target machine is slow (principle 7), so
  // the copy on disk wins the race every time and the network only updates it.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const fresh = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit ?? caches.match('./index.html'));
      return hit ?? fresh;
    }),
  );
});
