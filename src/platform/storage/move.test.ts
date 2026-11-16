// The move to the new address, below the screen: who is believed, who is
// told, and what happens when the other side never answers. Every message is
// checked by origin AND source AND shape; each check is broken on its own
// here, because a test that breaks two at once proves neither.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_PAKET,
  moveRequested,
  readMoveMessage,
  receivePlans,
  sendPlans,
  type SendState,
} from './move';
import { ESKI_KOKEN, YENI_KOKEN } from '../../leaf/app';

const TAG = 'mozaik-tasima';
type Listener = (e: MessageEvent) => void;

/** A window with a message bus the test drives by hand. */
function fakeWindow() {
  const listeners = new Set<Listener>();
  return {
    listeners,
    addEventListener: (type: string, l: Listener) => {
      if (type === 'message') listeners.add(l);
    },
    removeEventListener: (type: string, l: Listener) => {
      if (type === 'message') listeners.delete(l);
    },
    deliver(origin: string, source: unknown, data: unknown) {
      for (const l of [...listeners]) l({ origin, source, data } as MessageEvent);
    },
  };
}

/** The DOM's overloads, which a hand-made bus does not spell out. */
const asWin = (w: ReturnType<typeof fakeWindow>) =>
  w as unknown as Pick<Window, 'addEventListener' | 'removeEventListener'>;

/** The other window: records what it is sent, and to which origin. */
function fakeOther() {
  const posted: { data: unknown; origin: string }[] = [];
  return {
    posted,
    closed: false,
    postMessage: (data: unknown, origin: string) => posted.push({ data, origin }),
  };
}

describe('readMoveMessage · üç denetim, her biri kendi başına', () => {
  const src = {};
  const hazir = { tur: TAG, v: 1, adim: 'hazir' };

  it('doğru köken, doğru kaynak, doğru şekil: kabul', () => {
    expect(
      readMoveMessage({ origin: YENI_KOKEN, source: src, data: hazir }, YENI_KOKEN, src),
    ).toEqual(hazir);
  });

  it('başka bir köken: ret, kaynak ve şekil doğru olsa da', () => {
    expect(
      readMoveMessage(
        { origin: 'https://kotu.example', source: src, data: hazir },
        YENI_KOKEN,
        src,
      ),
    ).toBeNull();
    // A lookalike: same host name inside another one, or http instead of https.
    expect(
      readMoveMessage(
        { origin: 'https://mozaik.alparslansemiz.com.kotu.example', source: src, data: hazir },
        YENI_KOKEN,
        src,
      ),
    ).toBeNull();
    expect(
      readMoveMessage(
        { origin: YENI_KOKEN.replace('https', 'http'), source: src, data: hazir },
        YENI_KOKEN,
        src,
      ),
    ).toBeNull();
  });

  it('başka bir kaynak: ret, köken doğru olsa da', () => {
    expect(
      readMoveMessage({ origin: YENI_KOKEN, source: {}, data: hazir }, YENI_KOKEN, src),
    ).toBeNull();
    // No window to compare with is never a match, even against a null source.
    expect(
      readMoveMessage({ origin: YENI_KOKEN, source: null, data: hazir }, YENI_KOKEN, null),
    ).toBeNull();
  });

  it('yanlış şekil: ret', () => {
    const bad = [
      null,
      'hazir',
      { ...hazir, tur: 'baska' },
      { ...hazir, v: 2 },
      { tur: TAG, v: 1, adim: 'sil' },
      { tur: TAG, v: 1, adim: 'paket' },
      { tur: TAG, v: 1, adim: 'paket', paket: '' },
      { tur: TAG, v: 1, adim: 'paket', paket: 42 },
      { tur: TAG, v: 1, adim: 'paket', paket: 'x'.repeat(MAX_PAKET + 1) },
      { tur: TAG, v: 1, adim: 'sonuc', durum: 'hepsini-sil', acilan: 1 },
    ];
    for (const data of bad) {
      expect(
        readMoveMessage({ origin: YENI_KOKEN, source: src, data }, YENI_KOKEN, src),
        JSON.stringify(data)?.slice(0, 80),
      ).toBeNull();
    }
  });
});

describe('sonuc · eksik kalan taşıma kendi cevabını taşıyor', () => {
  it('eksik kabul ediliyor, sayı tam sayıya ve sıfırın üstüne çekiliyor', () => {
    const src = {};
    expect(
      readMoveMessage(
        {
          origin: YENI_KOKEN,
          source: src,
          data: { tur: TAG, v: 1, adim: 'sonuc', durum: 'eksik', acilan: -3 },
        },
        YENI_KOKEN,
        src,
      ),
    ).toEqual({ tur: TAG, v: 1, adim: 'sonuc', durum: 'eksik', acilan: 0 });
  });
});

describe('sendPlans · eski adresin ucu', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function start(opened: ReturnType<typeof fakeOther> | null) {
    const win = fakeWindow();
    const states: SendState[] = [];
    const urls: string[] = [];
    const stop = sendPlans({
      paket: '{"bundleVersion":1}',
      onState: (s) => states.push(s),
      win: {
        ...asWin(win),
        open: ((url: string) => {
          urls.push(url);
          return opened;
        }) as unknown as Window['open'],
      },
    });
    return { win, states, urls, stop };
  }

  it('yeni adresi ?tasima=1 ile açıyor, paketi YALNIZ hazır diyen o pencereye ve YALNIZ yeni kökene yolluyor', () => {
    const other = fakeOther();
    const { win, states, urls } = start(other);
    expect(urls).toEqual([new URL('?tasima=1', YENI_KOKEN + '/').toString()]);
    expect(states).toEqual([{ ad: 'bekliyor' }]);

    // Another window with the right origin, and the right window from the wrong one: nothing.
    win.deliver(YENI_KOKEN, {}, { tur: TAG, v: 1, adim: 'hazir' });
    win.deliver(ESKI_KOKEN, other, { tur: TAG, v: 1, adim: 'hazir' });
    expect(other.posted).toEqual([]);

    win.deliver(YENI_KOKEN, other, { tur: TAG, v: 1, adim: 'hazir' });
    expect(other.posted).toEqual([
      { data: { tur: TAG, v: 1, adim: 'paket', paket: '{"bundleVersion":1}' }, origin: YENI_KOKEN },
    ]);
    expect(other.posted.every((p) => p.origin !== '*')).toBe(true);
    // A second 'hazir' does not send the plans twice.
    win.deliver(YENI_KOKEN, other, { tur: TAG, v: 1, adim: 'hazir' });
    expect(other.posted).toHaveLength(1);
    expect(states[states.length - 1]).toEqual({ ad: 'soruldu' });

    win.deliver(YENI_KOKEN, other, { tur: TAG, v: 1, adim: 'sonuc', durum: 'acildi', acilan: 3 });
    expect(states[states.length - 1]).toEqual({ ad: 'bitti', durum: 'acildi', acilan: 3 });
    expect(win.listeners.size).toBe(0);
  });

  it('paket gitmeden gelen bir sonuç sayılmıyor', () => {
    const other = fakeOther();
    const { win, states } = start(other);
    win.deliver(YENI_KOKEN, other, { tur: TAG, v: 1, adim: 'sonuc', durum: 'acildi', acilan: 9 });
    expect(states).toEqual([{ ad: 'bekliyor' }]);
  });

  it('açılamayan pencere: hemen acilamadi (dosyaya düşülür)', () => {
    const { states, win } = start(null);
    expect(states).toEqual([{ ad: 'acilamadi' }]);
    expect(win.listeners.size).toBe(0);
  });

  it('hiç cevap vermeyen pencere: süre dolunca acilamadi', () => {
    const { states } = start(fakeOther());
    vi.advanceTimersByTime(59_000);
    expect(states).toEqual([{ ad: 'bekliyor' }]);
    vi.advanceTimersByTime(2_000);
    expect(states[states.length - 1]).toEqual({ ad: 'acilamadi' });
  });

  it('cevap vermeden kapanan pencere: kapandi, dosya yok', () => {
    const other = fakeOther();
    const { states } = start(other);
    other.closed = true;
    vi.advanceTimersByTime(1_500);
    expect(states[states.length - 1]).toEqual({ ad: 'kapandi' });
    vi.advanceTimersByTime(120_000);
    expect(states.filter((s) => s.ad === 'acilamadi')).toEqual([]);
  });
});

describe('receivePlans · yeni adresin ucu', () => {
  it('hazırı YALNIZ eski kökene söylüyor, paketi yalnız açan pencereden ve eski kökenden alıyor, bir kez', async () => {
    const win = fakeWindow();
    const opener = fakeOther();
    const got: string[] = [];
    receivePlans({
      win: asWin(win),
      opener,
      onPaket: (paket) => {
        got.push(paket);
        return Promise.resolve({ durum: 'acildi', acilan: 2 });
      },
    });
    expect(opener.posted).toEqual([
      { data: { tur: TAG, v: 1, adim: 'hazir' }, origin: ESKI_KOKEN },
    ]);

    const paket = { tur: TAG, v: 1, adim: 'paket', paket: '{"bundleVersion":1}' };
    win.deliver('https://kotu.example', opener, paket); // wrong origin
    win.deliver(ESKI_KOKEN, {}, paket); // wrong window
    win.deliver(YENI_KOKEN, opener, paket); // its own origin is not the old one
    expect(got).toEqual([]);

    win.deliver(ESKI_KOKEN, opener, paket);
    win.deliver(ESKI_KOKEN, opener, { ...paket, paket: '{"ikinci":1}' });
    expect(got).toEqual(['{"bundleVersion":1}']);
    await Promise.resolve();
    await Promise.resolve();
    expect(opener.posted[opener.posted.length - 1]).toEqual({
      data: { tur: TAG, v: 1, adim: 'sonuc', durum: 'acildi', acilan: 2 },
      origin: ESKI_KOKEN,
    });
  });

  it('açan pencere yoksa hiçbir şey dinlemiyor', () => {
    const win = fakeWindow();
    receivePlans({
      win: asWin(win),
      opener: null,
      onPaket: () => Promise.reject(new Error('çağrılmamalı')),
    });
    expect(win.listeners.size).toBe(0);
  });

  it('soru patlarsa okunamadi diyor, sessiz kalmıyor', async () => {
    const win = fakeWindow();
    const opener = fakeOther();
    receivePlans({ win: asWin(win), opener, onPaket: () => Promise.reject(new Error('x')) });
    win.deliver(ESKI_KOKEN, opener, { tur: TAG, v: 1, adim: 'paket', paket: '{}' });
    await Promise.resolve();
    await Promise.resolve();
    expect(opener.posted[opener.posted.length - 1]?.data).toMatchObject({
      adim: 'sonuc',
      durum: 'okunamadi',
    });
  });

  it('yalnız ?tasima=1 bir taşıma isteği', () => {
    expect(moveRequested('?tasima=1')).toBe(true);
    expect(moveRequested('?x=2&tasima=1')).toBe(true);
    expect(moveRequested('')).toBe(false);
    expect(moveRequested('?tasima=0')).toBe(false);
  });
});

describe('adresler', () => {
  it('eski ve yeni köken farklı ve ikisi de https', () => {
    expect(ESKI_KOKEN).toBe('https://alparslansemiz.github.io');
    expect(YENI_KOKEN).toBe('https://mozaik.alparslansemiz.com');
  });
});
