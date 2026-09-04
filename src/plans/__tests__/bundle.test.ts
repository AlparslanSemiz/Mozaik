// The bundle is the only file that can carry EVERY plan off this machine. If it
// reads back wrong the loss is total and silent: my father exports, wipes a
// machine, imports, and finds two of three timetables gone. So the rules are
// pinned one by one — especially the ones about broken input, because a file
// that has been e-mailed around is exactly the file that arrives damaged.

import {
  BUNDLE_VERSION,
  buildBundle,
  bundleVersionOf,
  parseBundle,
} from '../bundle';
import { FIRST_PLAN_ID, type Library } from '../library';

const two = (): Library => ({
  activeId: 'abcd',
  plans: [
    { id: FIRST_PLAN_ID, name: '1. plan', draft: false },
    { id: 'abcd', name: 'Gelecek dönem', draft: true },
  ],
});

/** Stands in for a State: this module never looks inside one. */
const fakeState = (mark: string) => ({ schemaVersion: 5, mark });

describe('buildBundle → parseBundle gidiş-dönüş', () => {
  it('planlar, adlar, taslak işareti ve açık plan korunuyor', () => {
    const text = buildBundle(two(), {
      [FIRST_PLAN_ID]: fakeState('bir'),
      abcd: fakeState('iki'),
    });

    const bundle = parseBundle(text)!;
    expect(bundle.library).toEqual(two());
    expect(bundle.states[FIRST_PLAN_ID]).toEqual(fakeState('bir'));
    expect(bundle.states['abcd']).toEqual(fakeState('iki'));
  });

  it('zarf sürümü ve tarih yazılıyor', () => {
    const raw = JSON.parse(buildBundle(two(), { [FIRST_PLAN_ID]: fakeState('bir') })) as {
      bundleVersion: number;
      savedAt: string;
      plans: unknown[];
    };
    expect(raw.bundleVersion).toBe(BUNDLE_VERSION);
    expect(Number.isNaN(Date.parse(raw.savedAt))).toBe(false);
    // The plan whose state was not handed over is not written at all: a row
    // pointing at nothing invites deleting the wrong one.
    expect(raw.plans).toHaveLength(1);
  });

  it('verisi olmayan plan dosyaya hiç girmiyor', () => {
    const bundle = parseBundle(buildBundle(two(), { abcd: fakeState('iki') }))!;
    expect(bundle.library.plans.map((p) => p.id)).toEqual(['abcd']);
    expect(bundle.library.activeId).toBe('abcd');
  });
});

describe('bundleVersionOf — üç dosya türünü ayırıyor', () => {
  it('paketin sürümünü söylüyor', () => {
    expect(bundleVersionOf(buildBundle(two(), { abcd: fakeState('x') }))).toBe(1);
  });

  it('tek plan dosyası paket DEĞİL', () => {
    // The exact shape the top bar writes. It must keep opening unchanged.
    expect(bundleVersionOf(JSON.stringify({ schemaVersion: 5, teachers: [] }))).toBeNull();
  });

  it('daha yeni bir paket tanınıyor ama okunmuyor', () => {
    const text = JSON.stringify({
      bundleVersion: 2,
      activeId: 'abcd',
      plans: [{ id: 'abcd', name: 'x', draft: false, state: fakeState('x') }],
    });
    expect(bundleVersionOf(text)).toBe(2); // so the user gets the right sentence
    expect(parseBundle(text)).toBeNull(); // ...but nothing is guessed at
  });

  it('JSON olmayan metinde null, hiç atmıyor', () => {
    expect(bundleVersionOf('yarım {')).toBeNull();
    expect(bundleVersionOf('')).toBeNull();
    expect(bundleVersionOf('42')).toBeNull();
  });
});

describe('parseBundle — bozuk dosya asla çökmüyor', () => {
  it('JSON olmayan, dizi olmayan, boş girdiler null veriyor', () => {
    expect(parseBundle('yarım {')).toBeNull();
    expect(parseBundle('null')).toBeNull();
    expect(parseBundle('[]')).toBeNull();
    expect(parseBundle(JSON.stringify({ bundleVersion: 1 }))).toBeNull();
    expect(parseBundle(JSON.stringify({ bundleVersion: 1, plans: [] }))).toBeNull();
    expect(parseBundle(JSON.stringify({ bundleVersion: 1, plans: 'iki' }))).toBeNull();
  });

  it('state alanı olmayan girdi ATILIYOR — verisiz dizin satırı üretilmiyor', () => {
    const bundle = parseBundle(
      JSON.stringify({
        bundleVersion: 1,
        activeId: 'yok',
        plans: [
          { id: 'yok', name: 'Verisiz' },
          { id: 'abcd', name: 'Sağlam', draft: false, state: fakeState('x') },
        ],
      }),
    )!;
    expect(bundle.library.plans.map((p) => p.id)).toEqual(['abcd']);
    // activeId pointed at the dropped entry, so it falls back to what is left.
    expect(bundle.library.activeId).toBe('abcd');
    expect(bundle.states['yok']).toBeUndefined();
  });

  it('kimliksiz girdi atılıyor, adsız girdi YENİDEN ADLANDIRILIYOR', () => {
    // The rule comes from library.ts and is not written twice: the name is
    // decoration, the id is the pointer to a whole timetable.
    const bundle = parseBundle(
      JSON.stringify({
        bundleVersion: 1,
        plans: [
          { name: 'kimliksiz', state: fakeState('x') },
          { id: 'abcd', name: '   ', state: fakeState('y') },
        ],
      }),
    )!;
    expect(bundle.library.plans).toEqual([{ id: 'abcd', name: 'Adsız plan', draft: false }]);
    expect(bundle.states['abcd']).toEqual(fakeState('y'));
  });

  it('aynı kimlik iki kez varsa ilki kazanıyor, ikinci state sızmıyor', () => {
    const bundle = parseBundle(
      JSON.stringify({
        bundleVersion: 1,
        plans: [
          { id: 'abcd', name: 'İlk', state: fakeState('ilk') },
          { id: 'abcd', name: 'İkinci', state: fakeState('ikinci') },
        ],
      }),
    )!;
    expect(bundle.library.plans).toHaveLength(1);
    expect(bundle.states['abcd']).toEqual(fakeState('ilk'));
  });
});
