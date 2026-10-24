// @vitest-environment jsdom
//
// jsdom rather than node: `apply` writes <html>, and a contract about the
// document is not tested without one.
//
// The contract every machine preference keeps, tested once on the factory
// rather than fifteen times on its copies:
//
//   - A value that moves the layout is written onto <html> first and in the
//     same call, and a storage that fails cannot stop it. That is what lets
//     main.tsx paint every preference before the first frame.
//   - NO record is not a record of zero. An absent record asks
//     `fallback`, and asks at read time, because the machine may be the one
//     answering (pitfall 58). A stored "0" or "" is a record and `normalize`
//     decides what it means.
//   - `normalize` takes what its caller holds: the string storage hands back
//     and the value a control passes in.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { preference } from './preference';

function fakeStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const log: string[] = [];
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      log.push(`depo ${key}=${value}`);
      values.set(key, value);
    },
    removeItem: (key: string) => values.delete(key),
  });
  return { values, log };
}

function brokenStorage() {
  const fail = () => {
    throw new Error('kapalı');
  };
  vi.stubGlobal('localStorage', { getItem: fail, setItem: fail, removeItem: fail });
}

// Shaped like the scale: a range whose floor is NOT the default.
const MIN = 0.8;
const MAX = 1.5;
const DEFAULT = 1;

function scaleLike() {
  return preference<number>({
    key: 'deneme-olcek',
    fallback: () => DEFAULT,
    normalize: (raw) => {
      const n =
        typeof raw === 'number'
          ? raw
          : typeof raw === 'string' && raw.trim() !== ''
            ? Number(raw)
            : Number.NaN;
      return Number.isFinite(n) ? Math.min(MAX, Math.max(MIN, n)) : DEFAULT;
    },
    paint: (value, root) => root.style.setProperty('--deneme', String(value)),
  });
}

// Shaped like the strip and the clock: a switch stored as words.
function switchLike(log?: string[]) {
  return preference<boolean>({
    key: 'deneme-anahtar',
    fallback: () => false,
    normalize: (raw) => (typeof raw === 'boolean' ? raw : raw === 'acik'),
    encode: (on) => (on ? 'acik' : 'kapali'),
    paint: (on, root) => {
      log?.push(`html ${on ? 'acik' : 'kapali'}`);
      root.setAttribute('data-deneme', on ? 'acik' : 'kapali');
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-deneme');
  document.documentElement.style.removeProperty('--deneme');
});

describe('tercih fabrikası · kayıt yoksa', () => {
  it('okuma yedeğe düşer', () => {
    fakeStorage();
    expect(scaleLike().read()).toBe(DEFAULT);
    expect(switchLike().read()).toBe(false);
  });

  it("yedeğe normalize'dan geçmeden gider, normalize yokluğa başka bir cevap verse bile", () => {
    const seen: unknown[] = [];
    const system = preference<string>({
      key: 'deneme-sistem',
      fallback: () => 'makinenin cevabı',
      normalize: (raw) => {
        seen.push(raw);
        return typeof raw === 'string' ? raw : 'bozuk kaydın cevabı';
      },
    });
    fakeStorage();
    expect(system.read()).toBe('makinenin cevabı');
    expect(seen).toEqual([]);
  });

  it('yedeği her okumada yeniden sorar, çünkü cevabı makine verebilir', () => {
    let reduced = false;
    const system = () => (reduced ? 'kapali' : 'tam');
    const motionLike = preference<'tam' | 'kapali'>({
      key: 'deneme-hareket',
      fallback: system,
      normalize: (raw) => (raw === 'tam' || raw === 'kapali' ? raw : system()),
    });
    fakeStorage();
    expect(motionLike.read()).toBe('tam');
    reduced = true;
    expect(motionLike.read()).toBe('kapali');
  });

  it('yokluk ile sıfır ayrı: kayıtlı "0" tabana, kaydın yokluğu varsayılana gider', () => {
    fakeStorage({ 'deneme-olcek': '0' });
    expect(scaleLike().read()).toBe(MIN);
    fakeStorage();
    expect(scaleLike().read()).toBe(DEFAULT);
  });

  it('boş dize de bir kayıttır: yokluk sayılmaz, anlamını normalize verir', () => {
    const seen: unknown[] = [];
    const text = preference<string>({
      key: 'deneme-metin',
      fallback: () => 'yedek',
      normalize: (raw) => {
        seen.push(raw);
        return typeof raw === 'string' ? raw : 'yedek';
      },
    });
    fakeStorage({ 'deneme-metin': '' });
    expect(text.read()).toBe('');
    expect(seen).toEqual(['']);
  });

  it('depo kullanılamıyorsa okuma yedeğe düşer, yazma ve uygulama çökmez', () => {
    brokenStorage();
    const scale = scaleLike();
    expect(scale.read()).toBe(DEFAULT);
    expect(() => scale.write(1.2)).not.toThrow();
    expect(() => scale.apply(1.2)).not.toThrow();
  });
});

describe('tercih fabrikası · normalize her çağıranın tipini kabul eder', () => {
  it('denetimin verdiği değer de depodan gelen dize de aynı değere varır', () => {
    const toggle = switchLike();
    expect(toggle.normalize(true)).toBe(true);
    expect(toggle.normalize('acik')).toBe(true);
    expect(toggle.normalize(false)).toBe(false);
    expect(toggle.normalize('kapali')).toBe(false);
    expect(scaleLike().normalize(1.2)).toBe(1.2);
    expect(scaleLike().normalize('1.2')).toBe(1.2);
  });

  it('yazılan değer kodlanarak saklanır ve geri okununca aynı değerdir', () => {
    const { values } = fakeStorage();
    const toggle = switchLike();
    toggle.write(true);
    expect(values.get('deneme-anahtar')).toBe('acik');
    expect(toggle.read()).toBe(true);
    toggle.write(false);
    expect(values.get('deneme-anahtar')).toBe('kapali');
    expect(toggle.read()).toBe(false);
  });

  it('kodlayıcı verilmemişse değer String ile saklanır', () => {
    const { values } = fakeStorage();
    scaleLike().write(1.25);
    expect(values.get('deneme-olcek')).toBe('1.25');
    expect(scaleLike().read()).toBe(1.25);
  });

  it('yazmadan önce normalize eder: aralık dışı bir sayı depoya sınırında girer', () => {
    const { values } = fakeStorage();
    scaleLike().write(9);
    expect(values.get('deneme-olcek')).toBe(String(MAX));
  });
});

describe('tercih fabrikası · ilk boyamadan önce <html>', () => {
  it("apply değeri <html>'e depodan ÖNCE ve aynı çağrıda yazar", () => {
    const { log } = fakeStorage();
    switchLike(log).apply(true);
    expect(log).toEqual(['html acik', 'depo deneme-anahtar=acik']);
    expect(document.documentElement.getAttribute('data-deneme')).toBe('acik');
  });

  it("depo kullanılamıyorsa da <html>'e yazar", () => {
    brokenStorage();
    switchLike().apply(true);
    expect(document.documentElement.getAttribute('data-deneme')).toBe('acik');
  });

  it("<html>'e normalize edilmiş değeri yazar", () => {
    fakeStorage();
    scaleLike().apply(9);
    expect(document.documentElement.style.getPropertyValue('--deneme')).toBe(String(MAX));
  });

  it("boyası olmayan bir tercihte apply yalnız depoya yazar, <html>'e dokunmaz", () => {
    const { values } = fakeStorage();
    const before = document.documentElement.outerHTML;
    const plain = preference<string>({
      key: 'deneme-duz',
      fallback: () => '',
      normalize: (raw) => (typeof raw === 'string' ? raw : ''),
    });
    plain.apply('2.1.1');
    expect(values.get('deneme-duz')).toBe('2.1.1');
    expect(document.documentElement.outerHTML).toBe(before);
  });

  it('anahtarını söyler', () => {
    expect(scaleLike().key).toBe('deneme-olcek');
  });
});
