// site/sw.js, run with a fake `self` and `caches`: every request it makes for
// itself goes PAST the browser's HTTP cache (web audit, 2026-11-16).
//
// Pages sends `cache-control: max-age=600`. A worker that installed within ten
// minutes of the last visit and fetched its shell the ordinary way could take
// the OLD index.html out of the HTTP cache and store it under the NEW
// version's cache name, and the update would arrive one load late again
// (pitfall 73's symptom by another road). The site suite cannot see a
// request's cache mode, so the file itself is executed here.
//
// The old address's stub (site/eski-adres/sw.js) is run the same way: it must
// delete only the caches that belong to /ders-programi/, never Mozaik's, which
// shares the origin and the cache name's prefix.

import { describe, expect, it } from 'vitest';
import swSource from '../site/sw.js?raw';
import stubSource from '../site/eski-adres/sw.js?raw';

type Handler = (e: {
  waitUntil: (p: Promise<unknown>) => void;
  request?: unknown;
  respondWith?: (r: unknown) => void;
}) => void;

class FakeRequest {
  url: string;
  cache: string;
  method = 'GET';
  constructor(input: string | FakeRequest, init?: { cache?: string }) {
    this.url =
      typeof input === 'string'
        ? new URL(input, 'https://ornek.test/Mozaik/').toString()
        : input.url;
    this.cache = init?.cache ?? (typeof input === 'string' ? 'default' : input.cache);
  }
}

function load(
  source: string,
  caches: unknown,
  fetch: unknown,
  extra: Record<string, unknown> = {},
) {
  const handlers: Record<string, Handler> = {};
  const self = {
    location: { origin: 'https://ornek.test' },
    addEventListener: (type: string, h: Handler) => (handlers[type] = h),
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve(), matchAll: () => Promise.resolve([]) },
    registration: { unregister: () => Promise.resolve(true) },
    ...extra,
  };
  // The file's own text, from this repository: nothing is interpolated into it.
  new Function('self', 'caches', 'fetch', 'Request', source)(self, caches, fetch, FakeRequest);
  return handlers;
}

describe('site/sw.js · HTTP önbelleğinin arkasından', () => {
  it('kurulum kabuğu cache: reload ile istiyor', async () => {
    const added: FakeRequest[] = [];
    const caches = {
      open: () =>
        Promise.resolve({
          addAll: (list: FakeRequest[]) => (added.push(...list), Promise.resolve()),
        }),
    };
    const h = load(swSource, caches, () => Promise.reject(new Error('ağ yok')));
    let wait: Promise<unknown> = Promise.resolve();
    h.install!({
      waitUntil: (p) => {
        wait = p;
      },
    });
    await wait;
    expect(added.length).toBeGreaterThan(0);
    expect(added.map((r) => r.cache)).toEqual(added.map(() => 'reload'));
  });

  it('arkadaki tazeleme cache: no-cache ile soruyor', async () => {
    const asked: { cache: string | undefined }[] = [];
    const caches = {
      match: () => Promise.resolve({ hit: true }),
      open: () => Promise.resolve({ put: () => Promise.resolve() }),
    };
    const fetch = (_req: unknown, init?: { cache?: string }) => {
      asked.push({ cache: init?.cache });
      return Promise.resolve({ ok: true, clone: () => ({}) });
    };
    const h = load(swSource, caches, fetch);
    let answer: unknown;
    h.fetch!({
      waitUntil: () => undefined,
      request: { method: 'GET', url: 'https://ornek.test/Mozaik/' },
      respondWith: (r) => (answer = r),
    });
    await answer;
    expect(asked).toEqual([{ cache: 'no-cache' }]);
  });
});

describe('site/eski-adres/sw.js · eski adresin kendini silen işçisi', () => {
  it('yalnız /ders-programi/ önbelleğini siliyor, Mozaik’inkine dokunmuyor, ve kaydını siliyor', async () => {
    const stores: Record<string, string[]> = {
      'ders-programi-v1': [
        'https://ornek.test/ders-programi/',
        'https://ornek.test/ders-programi/index.html',
      ],
      'ders-programi-2.2.0': ['https://ornek.test/Mozaik/', 'https://ornek.test/Mozaik/index.html'],
      'baska-proje': ['https://ornek.test/baska/'],
    };
    const deleted: string[] = [];
    const caches = {
      keys: () => Promise.resolve(Object.keys(stores)),
      open: (name: string) =>
        Promise.resolve({ keys: () => Promise.resolve(stores[name]!.map((url) => ({ url }))) }),
      delete: (name: string) => (deleted.push(name), Promise.resolve(true)),
    };
    let unregistered = false;
    const navigated: string[] = [];
    const h = load(stubSource, caches, undefined, {
      registration: { unregister: () => ((unregistered = true), Promise.resolve(true)) },
      clients: {
        claim: () => Promise.resolve(),
        matchAll: () =>
          Promise.resolve([
            {
              url: 'https://ornek.test/ders-programi/',
              navigate: (u: string) => (navigated.push(u), Promise.resolve()),
            },
          ]),
      },
    });
    let wait: Promise<unknown> = Promise.resolve();
    h.activate!({
      waitUntil: (p) => {
        wait = p;
      },
    });
    await wait;
    expect(deleted).toEqual(['ders-programi-v1']);
    // Reloaded onto the stub page, which decides where to go (index.html).
    expect(navigated).toEqual(['https://ornek.test/ders-programi/']);
    expect(unregistered).toBe(true);
    expect(h.fetch).toBeUndefined();
  });
});
