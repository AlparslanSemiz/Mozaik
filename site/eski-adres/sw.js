// The OLD address's service worker: it exists only to remove itself.
//
// alparslansemiz.github.io/ders-programi/ was the site until the repository
// was renamed (pitfall 106). Since then the address is a 404, and a 404 is
// exactly what keeps an installed worker alive: the browser's update check
// for sw.js fails, the old worker stays, and it serves the last month's app
// from its cache forever. This file, published at the old address from its
// own repository (BUILD.md, "Eski adres"), is the update that check finally
// finds. It installs, takes the open pages, reloads them onto the stub page
// from the network (which decides where to go: index.html beside this), and
// unregisters.
//
// It deletes only caches whose every entry is under /ders-programi/. The
// origin is shared with /Mozaik/ and its worker names its cache the same way
// (`ders-programi-<version>`), so a name alone cannot tell them apart.
//
// localStorage is per origin, not per path: the plans the old app kept are
// the same ones /Mozaik/ reads. Nothing here touches them.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        if (keys.length > 0 && keys.every((r) => new URL(r.url).pathname.startsWith('/ders-programi/'))) {
          await caches.delete(name);
        }
      }
      await self.clients.claim();
      for (const client of await self.clients.matchAll({ type: 'window' })) {
        client.navigate(client.url).catch(() => undefined);
      }
      await self.registration.unregister();
    })(),
  );
});

// No fetch handler: every request goes to the network, which is the stub page.
