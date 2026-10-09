// @vitest-environment jsdom

// VK1's gate, below the screen: what another window may write before this one
// stops writing, and that "stops writing" holds for every writer in
// libraryStore.ts. The two-tab sequence itself is e2e/iki-kopya.spec.ts.

import { describe, expect, it } from 'vitest';

import { watchOtherWindows, writesClosed } from './platform/otherWindow';
import { dropPlanText, writeLibrary, writePlanText } from './platform/libraryStore';
import { LIBRARY_KEY, defaultLibrary } from './pure/library';

function baskaPencere(key: string | null, newValue: string | null = 'yeni') {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
}

describe('başka pencere · yalnız bu pencerenin tuttuğundan FARKLI veri kilitliyor', () => {
  it('yedek, tercih, açık olmayan plan ve aynı değer kilitlemiyor; açık planın yeni değeri kilitliyor', () => {
    // This window holds plan "1" as '{"a":1}' and the plan list as 'liste'.
    const held = (key: string) =>
      key === 'ders-programi' ? '{"a":1}' : key === LIBRARY_KEY ? 'liste' : undefined;
    let haber = 0;
    const birak = watchOtherWindows(held, () => (haber += 1));

    baskaPencere('ders-programi-yedek-0');
    baskaPencere('ders-programi-tema');
    baskaPencere('ders-programi-plan-2');
    // A second tab on a fresh profile writes the same plan this one holds.
    baskaPencere('ders-programi', '{"a":1}');
    baskaPencere(LIBRARY_KEY, 'liste');
    expect(writesClosed()).toBe(false);
    expect(writePlanText('1', '{"a":1}')).toBe(true);

    baskaPencere('ders-programi', '{"a":2}');
    expect(writesClosed()).toBe(true);
    expect(haber).toBe(1);

    // Every writer in libraryStore is silent now.
    expect(writePlanText('1', '{"a":3}')).toBe(false);
    expect(localStorage.getItem('ders-programi')).toBe('{"a":1}');
    writeLibrary(defaultLibrary());
    expect(localStorage.getItem(LIBRARY_KEY)).toBeNull();
    dropPlanText('1');
    expect(localStorage.getItem('ders-programi')).toBe('{"a":1}');

    // Once is enough: the strip is up already.
    baskaPencere(LIBRARY_KEY, 'başka liste');
    expect(haber).toBe(1);
    birak();
  });
});

describe('başka pencere · temizlik', () => {
  it('öteki pencerede localStorage.clear() da kilitliyor', async () => {
    // A fresh module: the gate above is closed for the rest of that file.
    const { vi } = await import('vitest');
    vi.resetModules();
    const taze = await import('./platform/otherWindow');
    let haber = 0;
    const birak = taze.watchOtherWindows(
      () => undefined,
      () => (haber += 1),
    );
    baskaPencere(null, null);
    expect(taze.writesClosed()).toBe(true);
    expect(haber).toBe(1);
    birak();
  });
});
