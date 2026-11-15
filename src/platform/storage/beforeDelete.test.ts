// The one slot a reload can still reach after a deletion (TODO SD1). The
// audit of 2026-11-16: a class deleted and the page reloaded left the class in
// no key, because the undo lived only in memory.

import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_KEY, BEFORE_DELETE_KEY, parseState } from '../../pure/io';
import type { State } from '../../leaf/model';

function memoryStorage(limit = Infinity): Storage {
  const map = new Map<string, string>();
  const size = () => [...map.values()].reduce((n, v) => n + v.length, 0);
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      if (size() - (map.get(k)?.length ?? 0) + v.length > limit) {
        throw new DOMException('dolu', 'QuotaExceededError');
      }
      map.set(k, String(v));
    },
  };
}

function useStorage(limit = Infinity) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(limit),
    configurable: true,
    writable: true,
  });
}

const FULL = parseState(readFileSync('src/fixtures/tam-dolu-kurs-dizili.json', 'utf8'))!;
const LESS: State = { ...FULL, classes: FULL.classes.slice(1) };

beforeEach(() => {
  vi.resetModules();
  useStorage();
});

describe('silmeden önceki hâl', () => {
  it('yeniden açılışta bir kez öneriliyor, ikinci açılışta değil', async () => {
    const first = await import('./beforeDelete');
    expect(first.keepBeforeDelete('1', FULL, '7A sınıfı silindi.')).toBe(true);
    vi.resetModules();
    const second = await import('./beforeDelete');
    const offer = second.offerAtStart('1', LESS);
    expect(offer?.label).toBe('7A sınıfı silindi.');
    expect(offer?.state.classes.length).toBe(FULL.classes.length);
    // StrictMode: the same start asks twice and gets the same answer.
    expect(second.offerAtStart('1', LESS)).toBe(offer);
    vi.resetModules();
    const third = await import('./beforeDelete');
    expect(third.offerAtStart('1', LESS)).toBeNull();
  });

  it('geri alınmış silme (aynı hâl), başka plan ya da boş plan önerilmiyor', async () => {
    const m = await import('./beforeDelete');
    expect(
      m.keepBeforeDelete('1', { ...FULL, teachers: [], classes: [], lessons: [], rooms: [] }, 'x'),
    ).toBe(false);
    m.keepBeforeDelete('1', FULL, 'x');
    vi.resetModules();
    expect((await import('./beforeDelete')).offerAtStart('1', FULL)).toBeNull();
    m.keepBeforeDelete('zz', FULL, 'x');
    vi.resetModules();
    expect((await import('./beforeDelete')).offerAtStart('1', LESS)).toBeNull();
  });

  it('okunamayan (dondurulmuş) planın yerine-geçeni saklanmıyor', async () => {
    const { freezePlan } = await import('./libraryStore');
    const m = await import('./beforeDelete');
    freezePlan('1', 'okunamadi');
    expect(m.keepBeforeDelete('1', FULL, 'x')).toBe(false);
    expect(localStorage.getItem(BEFORE_DELETE_KEY)).toBeNull();
  });

  // A plan F and a far smaller one S: room for F and S, not for F twice.
  const SMALL: State = {
    ...FULL,
    lessons: [],
    programs: FULL.programs.map((p) => ({ ...p, placements: {} })),
  };
  const F = JSON.stringify(FULL).length;
  const S = JSON.stringify(SMALL).length;
  const ROOM = F + (F + S) / 2 + 200;

  it('depo doluysa yuva yazılmıyor ve eskisi de kalmıyor', async () => {
    useStorage(ROOM);
    localStorage.setItem(BASE_KEY, JSON.stringify(FULL));
    const m = await import('./beforeDelete');
    expect(m.keepBeforeDelete('1', SMALL, 'eski')).toBe(true);
    expect(m.keepBeforeDelete('1', FULL, 'yeni')).toBe(false);
    expect(localStorage.getItem(BEFORE_DELETE_KEY)).toBeNull();
  });

  it('planın kendi kaydı yer bulamazsa yuva ona yer açıyor', async () => {
    useStorage(ROOM);
    const { writePlanText } = await import('./libraryStore');
    const m = await import('./beforeDelete');
    expect(writePlanText('1', JSON.stringify(SMALL))).toBe(true);
    expect(m.keepBeforeDelete('1', FULL, 'x')).toBe(true);
    expect(writePlanText('1', JSON.stringify(FULL))).toBe(true);
    expect(localStorage.getItem(BASE_KEY)).toBe(JSON.stringify(FULL));
    expect(localStorage.getItem(BEFORE_DELETE_KEY)).toBeNull();
  });
});
