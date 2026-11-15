// The directory write: it keeps the fields this copy does not know and does
// not write when nothing changed. The audit of 2026-11-16: every start
// rewrote `ders-programi-planlar` and stripped what a newer copy had put there.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LIBRARY_KEY } from '../../pure/io';

beforeEach(() => {
  vi.resetModules();
  const map = new Map<string, string>();
  const storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
});

describe('writeLibrary', () => {
  it('bilmediği alanları koruyor ve değişiklik yoksa yazmıyor', async () => {
    const stored = JSON.stringify({
      activeId: '1',
      plans: [{ id: '1', name: 'Plan 1', draft: false, renk: 'mavi' }],
      yeniAlan: 3,
    });
    localStorage.setItem(LIBRARY_KEY, stored);
    const setItem = vi.spyOn(localStorage, 'setItem');
    const { readLibrary, writeLibrary } = await import('./libraryStore');
    writeLibrary(readLibrary());
    expect(setItem).not.toHaveBeenCalled();
    writeLibrary({ activeId: '1', plans: [{ id: '1', name: 'Yeni ad', draft: true }] });
    expect(JSON.parse(localStorage.getItem(LIBRARY_KEY)!)).toEqual({
      activeId: '1',
      plans: [{ id: '1', name: 'Yeni ad', draft: true, renk: 'mavi' }],
      yeniAlan: 3,
    });
  });
});
