// @vitest-environment jsdom

// A plan read empty at startup is not written over (libraryStore.ts,
// `mayWritePlan`). Under file:// a reloaded page once started from an empty
// localStorage while the plan sat in its key (CI 38085275289, TRAPS 108), and
// the autosave wrote the empty plan over it. The screen half, the strip and a
// reload that finds the plan, is e2e/iki-kopya.spec.ts.

import { beforeEach, describe, expect, it, vi } from 'vitest';

// The mark lives in the module, so every test gets a fresh one.
async function taze() {
  vi.resetModules();
  return await import('./platform/storage/libraryStore');
}

beforeEach(() => localStorage.clear());

describe('boş açılış · açılışta boş okunan plan', () => {
  it('ilk kullanım: anahtar yazarken de boş, yazım iniyor ve işaret kalkıyor', async () => {
    const depo = await taze();
    expect(depo.readPlanTextAtStart('1')).toBeNull();
    expect(depo.writePlanText('1', '{"a":1}')).toBe(true);
    // The mark is gone: the window's own write does not lock the next one.
    expect(depo.writePlanText('1', '{"a":2}')).toBe(true);
    expect(localStorage.getItem('ders-programi')).toBe('{"a":2}');
    expect(depo.writeRefused()).toBe(false);
  });

  it('anahtar şimdi doluysa yazılmıyor, silinmiyor; her yazımda yeniden okunuyor', async () => {
    const depo = await taze();
    expect(depo.readPlanTextAtStart('1')).toBeNull();
    // What the empty start did not see.
    localStorage.setItem('ders-programi', '{"kayitli":true}');

    expect(depo.writePlanText('1', '{}')).toBe(false);
    expect(depo.writeRefused()).toBe(true);
    depo.dropPlanText('1');
    expect(depo.mayWritePlan('1')).toBe(false);
    expect(localStorage.getItem('ders-programi')).toBe('{"kayitli":true}');

    // Read again on every write: a key emptied since is a write that may land.
    localStorage.removeItem('ders-programi');
    expect(depo.writePlanText('1', '{"a":1}')).toBe(true);
    expect(localStorage.getItem('ders-programi')).toBe('{"a":1}');
  });

  it('açılışta dolu okunan plan işaretlenmiyor, yazım olağan', async () => {
    localStorage.setItem('ders-programi', '{"a":1}');
    const depo = await taze();
    expect(depo.readPlanTextAtStart('1')).toBe('{"a":1}');
    expect(depo.writePlanText('1', '{"a":2}')).toBe(true);
    expect(localStorage.getItem('ders-programi')).toBe('{"a":2}');
    expect(depo.writeRefused()).toBe(false);
  });

  it('işaret yalnız açılıştaki planda: başka bir plan olağan yazılıyor', async () => {
    const depo = await taze();
    expect(depo.readPlanTextAtStart('1')).toBeNull();
    localStorage.setItem('ders-programi', '{"kayitli":true}');
    expect(depo.writePlanText('abc', '{"b":1}')).toBe(true);
    expect(localStorage.getItem('ders-programi-plan-abc')).toBe('{"b":1}');
    expect(depo.writeRefused()).toBe(false);
  });

  it('açılıştan sonraki bir okuma işaret koymuyor', async () => {
    const depo = await taze();
    // A plan opened later reads its own empty key: a new plan, not a lost one.
    expect(depo.readPlanText('1')).toBeNull();
    localStorage.setItem('ders-programi', '{"kayitli":true}');
    expect(depo.writePlanText('1', '{"a":1}')).toBe(true);
  });
});
