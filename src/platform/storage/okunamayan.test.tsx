// @vitest-environment jsdom

// A saved plan this copy cannot read is never written over (A1, the audit of
// 2026-10-24). The audit measured it three ways: a plan stamped with a newer
// schema, a plan cut short, and a body that makes `parseState` throw; each
// time the opening read handed back an empty plan and the autosave wrote it
// over the key 400 ms later, with no strip. The same happened on a switch to
// such a plan and on the switch a delete makes. The first two cases are the
// audit's own reproduction (scratch/analiz/T1/probe), moved here.
//
// Every test gets fresh modules: the marks live in `libraryStore.ts` and
// `planStore.ts`, and a mark left over from the test before would pass the
// next one for free. React is imported fresh with them, or two copies of it
// would meet in one tree.

import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_KEY, backupKey, LIBRARY_KEY, planKey } from '../../pure/io';
import { SCHEMA_VERSION } from '../../leaf/model';
import type { useStore as UseStore } from './useStore';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

type Store = ReturnType<typeof UseStore>;

function memoryStorage(): Storage {
  const map = new Map<string, string>();
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
      map.set(k, String(v));
    },
  };
}

const FULL = readFileSync('src/fixtures/tam-dolu-kurs.json', 'utf8');
const NEWER = JSON.stringify({ ...JSON.parse(FULL), schemaVersion: SCHEMA_VERSION + 1 });
const CUT = FULL.slice(0, Math.floor(FULL.length / 2));
const THROWS = JSON.stringify({ ...JSON.parse(FULL), lessons: [null] });

let unmount: () => void = () => undefined;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
    writable: true,
  });
  vi.useFakeTimers();
  vi.resetModules();
});

afterEach(() => {
  unmount();
  vi.useRealTimers();
});

/** Mounts the real hook over whatever the storage holds now. */
async function mount() {
  const { act, createElement } = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { useStore } = await import('./useStore');
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const box: { store?: Store } = {};
  function Probe(): null {
    box.store = useStore();
    return null;
  }
  act(() => root.render(createElement(Probe)));
  unmount = () => {
    act(() => root.unmount());
    container.remove();
  };
  const settle = () =>
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  return { get: () => box.store!, act, settle };
}

function twoPlans(second: string) {
  localStorage.setItem(BASE_KEY, FULL);
  localStorage.setItem(planKey('zz'), second);
  localStorage.setItem(
    LIBRARY_KEY,
    JSON.stringify({
      activeId: '1',
      plans: [
        { id: '1', name: '1. plan', draft: false },
        { id: 'zz', name: 'İkinci', draft: false },
      ],
    }),
  );
}

describe('okunamayan plan · açılış', () => {
  it('daha yeni şemayla kayıtlı plan açılışta ezilmiyor, şerit "yeni" diyor', async () => {
    localStorage.setItem(BASE_KEY, NEWER);
    const { get, settle } = await mount();
    settle();
    expect(localStorage.getItem(BASE_KEY)).toBe(NEWER);
    expect(get().unreadable).toBe('yeni');
  });

  it('yarıda kesilmiş JSON açılışta ezilmiyor, şerit "okunamadı" diyor', async () => {
    localStorage.setItem(BASE_KEY, CUT);
    const { get, settle } = await mount();
    settle();
    expect(localStorage.getItem(BASE_KEY)).toBe(CUT);
    expect(get().unreadable).toBe('okunamadi');
  });

  it('parseState’i attıran gövde açılışı düşürmüyor, okunamayan sayılıyor', async () => {
    localStorage.setItem(BASE_KEY, THROWS);
    const { get, settle } = await mount();
    settle();
    expect(localStorage.getItem(BASE_KEY)).toBe(THROWS);
    expect(get().unreadable).toBe('okunamadi');
  });

  it('okunamayan plan açıkken yapılan değişiklik de, park da yazılmıyor', async () => {
    localStorage.setItem(BASE_KEY, NEWER);
    const { get, act, settle } = await mount();
    act(() => get().change((d) => ({ ...d, settings: { ...d.settings, schoolName: 'Yeni' } })));
    settle();
    act(() => get().park());
    expect(localStorage.getItem(BASE_KEY)).toBe(NEWER);
    expect(get().unreadable).toBe('yeni');
  });

  it('kontrol: okunan plan şeritsiz açılıyor ve olağan yazılıyor', async () => {
    localStorage.setItem(BASE_KEY, FULL);
    const { get, act, settle } = await mount();
    expect(get().unreadable).toBeNull();
    act(() => get().change((d) => ({ ...d, settings: { ...d.settings, schoolName: 'Yeni' } })));
    settle();
    expect(JSON.parse(localStorage.getItem(BASE_KEY)!).settings.schoolName).toBe('Yeni');
  });

  it('kontrol: hiç kaydı olmayan ilk açılış şeritsiz, ilk kullanım yazılıyor', async () => {
    const { get, settle } = await mount();
    settle();
    expect(get().unreadable).toBeNull();
    expect(localStorage.getItem(BASE_KEY)).not.toBeNull();
  });
});

describe('okunamayan plan · plan geçişi ve silme', () => {
  it('okunamayan plana geçmek onu ezmiyor', async () => {
    twoPlans(NEWER);
    const { get, act, settle } = await mount();
    act(() => get().plans.switchPlan('zz'));
    settle();
    expect(localStorage.getItem(planKey('zz'))).toBe(NEWER);
    expect(get().unreadable).toBe('yeni');
    // Leaving it parks the empty stand-in, and that is refused too.
    act(() => get().plans.switchPlan('1'));
    settle();
    expect(localStorage.getItem(planKey('zz'))).toBe(NEWER);
    expect(get().unreadable).toBeNull();
  });

  it('açık plan silinip açılan sonraki plan okunamıyorsa o da ezilmiyor', async () => {
    twoPlans(CUT);
    const { get, act, settle } = await mount();
    act(() => get().plans.deletePlan('1'));
    settle();
    expect(get().plans.planId).toBe('zz');
    expect(localStorage.getItem(planKey('zz'))).toBe(CUT);
    expect(get().unreadable).toBe('okunamadi');
  });
});

describe('okunamayan plan · kullanıcının açık eylemi', () => {
  it('"Dosyadan aç" (yükleme) açık planın yerine geçiyor ve yazılıyor', async () => {
    localStorage.setItem(BASE_KEY, CUT);
    const { get, act, settle } = await mount();
    const { parseState } = await import('../../pure/io');
    act(() => get().loadState(parseState(FULL)!));
    settle();
    expect(get().unreadable).toBeNull();
    expect(JSON.parse(localStorage.getItem(BASE_KEY)!).teachers.length).toBe(
      JSON.parse(FULL).teachers.length,
    );
  });

  it('okunamayan planı Planlar’dan silmek onu siliyor', async () => {
    twoPlans(NEWER);
    const { get, act } = await mount();
    act(() => get().plans.deletePlan('zz'));
    expect(localStorage.getItem(planKey('zz'))).toBeNull();
    expect(get().plans.library.plans.map((p) => p.id)).toEqual(['1']);
  });

  it('okunamayan plan açıkken BAŞKA bir planı silmek açık planı ezmiyor', async () => {
    // The delete runs as the user's decision (`explicitly`), and it parks the
    // open plan first: the stand-in must not ride that decision over the key.
    localStorage.setItem(BASE_KEY, NEWER);
    localStorage.setItem(planKey('zz'), FULL);
    localStorage.setItem(
      LIBRARY_KEY,
      JSON.stringify({
        activeId: '1',
        plans: [
          { id: '1', name: '1. plan', draft: false },
          { id: 'zz', name: 'İkinci', draft: false },
        ],
      }),
    );
    const { get, act, settle } = await mount();
    act(() => get().plans.deletePlan('zz'));
    settle();
    expect(localStorage.getItem(planKey('zz'))).toBeNull();
    expect(localStorage.getItem(BASE_KEY)).toBe(NEWER);
  });

  it('"Tümünü dosyadan aç" okunamayan planın yerine dosyadakini yazıyor', async () => {
    localStorage.setItem(BASE_KEY, NEWER);
    const { get, act, settle } = await mount();
    const { parseBundle } = await import('../../pure/io');
    const bundle = parseBundle(
      JSON.stringify({
        bundleVersion: 1,
        activeId: '1',
        plans: [{ id: '1', name: '1. plan', draft: false, state: JSON.parse(FULL) }],
      }),
    )!;
    act(() => {
      get().plans.replaceLibrary(bundle);
    });
    settle();
    expect(get().unreadable).toBeNull();
    expect(JSON.parse(localStorage.getItem(BASE_KEY)!).schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('örnek veri (sıradan bir değişiklik) okunamayan planı ezmiyor', async () => {
    localStorage.setItem(BASE_KEY, NEWER);
    const { get, act, settle } = await mount();
    const { sampleState } = await import('../../pure/io');
    act(() => get().change(() => sampleState()));
    settle();
    expect(localStorage.getItem(BASE_KEY)).toBe(NEWER);
  });
});

describe('okunamayan plan · deponun kendi kapısı', () => {
  // Under the hook's own refusal: whatever reaches libraryStore with a frozen
  // key is refused there too, unless it runs as the user's decision.
  it('dondurulmuş anahtar yazılmıyor, silinmiyor; açık eylem çözüp yazıyor', async () => {
    localStorage.setItem(BASE_KEY, NEWER);
    const depo = await import('./libraryStore');
    depo.freezePlan('1', 'yeni');
    expect(depo.writePlanText('1', '{}')).toBe(false);
    depo.dropPlanText('1');
    expect(localStorage.getItem(BASE_KEY)).toBe(NEWER);
    expect(depo.explicitly(() => depo.writePlanText('1', '{"a":1}'))).toBe(true);
    expect(depo.frozenPlan('1')).toBeNull();
    expect(localStorage.getItem(BASE_KEY)).toBe('{"a":1}');
  });
});

describe('oturum yedekleri (madde 7)', () => {
  it('içerik değişmediyse açılış zinciri kaydırmıyor', async () => {
    // T2's measurement: a bad session, then three reloads, and all three
    // backups held the bad session.
    const good = FULL;
    const bad = JSON.stringify({ ...JSON.parse(FULL), teachers: [], lessons: [] });
    localStorage.setItem(BASE_KEY, good);
    const { rotateBackups } = await import('./planStore');
    rotateBackups(BASE_KEY); // the end of a good session
    localStorage.setItem(BASE_KEY, bad); // a bad session
    for (let i = 0; i < 3; i++) rotateBackups(BASE_KEY); // three reloads
    expect(localStorage.getItem(backupKey(0))).toBe(bad);
    expect(localStorage.getItem(backupKey(1))).toBe(good);
  });

  it('aynı plan bugünün şemasıyla yeniden yazıldıysa da kaydırmıyor', async () => {
    // The first save after a load re-stamps the plan; the bytes differ, the
    // plan does not (the e2e half of this caught it).
    const { rotateBackups } = await import('./planStore');
    const { parseState } = await import('../../pure/io');
    localStorage.setItem(BASE_KEY, FULL);
    rotateBackups(BASE_KEY);
    localStorage.setItem(BASE_KEY, JSON.stringify(parseState(FULL)));
    rotateBackups(BASE_KEY);
    expect(localStorage.getItem(backupKey(0))).toBe(FULL);
    expect(localStorage.getItem(backupKey(1))).toBeNull();
  });

  it('içerik değiştiyse kaydırıyor', async () => {
    const { rotateBackups } = await import('./planStore');
    localStorage.setItem(BASE_KEY, '{"a":1}');
    rotateBackups(BASE_KEY);
    localStorage.setItem(BASE_KEY, '{"a":2}');
    rotateBackups(BASE_KEY);
    expect(localStorage.getItem(backupKey(0))).toBe('{"a":2}');
    expect(localStorage.getItem(backupKey(1))).toBe('{"a":1}');
  });

  it('okunamayan yedek-0 listede görünüyor, atlanmıyor', async () => {
    localStorage.setItem(backupKey(0), NEWER);
    localStorage.setItem(backupKey(1), CUT);
    localStorage.setItem(backupKey(2), FULL);
    const { listBackups } = await import('./planStore');
    const list = listBackups();
    expect(list.map((b) => [b.index, 'problem' in b ? b.problem : 'ok'])).toEqual([
      [0, 'yeni'],
      [1, 'okunamadi'],
      [2, 'ok'],
    ]);
  });
});

// TB1's opening half, on A1's design (the user's decision, 2026-10-24): the
// plan open at startup cannot be read, another one can. The other one opens
// instead of an empty stand-in, the unreadable one stays frozen byte for byte
// in its key and in the directory, and one line names it for the session.
describe('okunamayan plan · açılışta okunabilen ilk plan', () => {
  function brokenFirst(broken: string) {
    twoPlans(FULL);
    localStorage.setItem(BASE_KEY, broken);
  }

  for (const [ad, broken] of [
    ['yarıda kesilmiş', CUT],
    ['parseState’i attıran', THROWS],
    ['daha yeni şemalı', NEWER],
  ] as const) {
    it(`açık plan ${ad} ise okunabilen ilk plan açılıyor, okunamayan bayt bayt yerinde`, async () => {
      brokenFirst(broken);
      const { get, act, settle } = await mount();
      expect(get().plans.planId).toBe('zz');
      expect(get().state.teachers.length).toBe(JSON.parse(FULL).teachers.length);
      expect(get().unreadable).toBeNull();
      expect(get().setAside).toEqual(['1. plan']);
      // Not saved: the directory still points at the unreadable plan.
      const lib = JSON.parse(localStorage.getItem(LIBRARY_KEY)!);
      expect(lib.activeId).toBe('1');
      expect(lib.plans.map((p: { id: string }) => p.id)).toEqual(['1', 'zz']);
      act(() => get().change((d) => ({ ...d, settings: { ...d.settings, schoolName: 'Yeni' } })));
      settle();
      expect(JSON.parse(localStorage.getItem(planKey('zz'))!).settings.schoolName).toBe('Yeni');
      expect(localStorage.getItem(BASE_KEY)).toBe(broken);
    });
  }

  it('geri dönülen açılış zinciri döndürmüyor: ne açılan plan ne okunamayanın metni', async () => {
    brokenFirst(CUT);
    await mount();
    expect(localStorage.getItem(backupKey(0))).toBeNull();
  });

  it('okunabilen plan yoksa boş yerine-geçen açılıyor, şerit söylüyor, kenara konan yok', async () => {
    twoPlans(CUT);
    localStorage.setItem(BASE_KEY, NEWER);
    const { get, settle } = await mount();
    settle();
    expect(get().plans.planId).toBe('1');
    expect(get().unreadable).toBe('yeni');
    expect(get().setAside).toEqual([]);
    expect(localStorage.getItem(BASE_KEY)).toBe(NEWER);
    expect(localStorage.getItem(planKey('zz'))).toBe(CUT);
  });

  // The review finding of tb1-acilis: a backup or a plan whose body makes
  // parseState throw took Ayarlar → Planlar ve yedek down with it. Those two
  // reads are what the screen makes (Data.tsx, Plans.tsx).
  it('parseState’i attıran yedek ve plan Planlar ve yedek’in iki okumasını düşürmüyor', async () => {
    twoPlans(THROWS);
    localStorage.setItem(backupKey(0), THROWS);
    const { listBackups, loadPlan } = await import('./planStore');
    expect(() => listBackups()).not.toThrow();
    expect(listBackups()[0]).toEqual({ index: 0, problem: 'okunamadi' });
    expect(() => loadPlan('zz')).not.toThrow();
    expect(loadPlan('zz')).toBeNull();
    expect(localStorage.getItem(planKey('zz'))).toBe(THROWS);
  });

  // The Planlar list asked only `loadPlan`, and an unreadable plan read as
  // "verisi yok" with 0 lessons: a row that invites deleting real text.
  it('Planlar listesi okunamayan planı boş değil okunamadı diye tanıyor', async () => {
    twoPlans(CUT);
    const { loadPlan, unreadablePlan } = await import('./planStore');
    expect(loadPlan('zz')).toBeNull();
    expect(unreadablePlan('zz')).toBe('okunamadi');
    expect(loadPlan('1')).not.toBeNull();
    expect(unreadablePlan('1')).toBeNull();
  });

  // The review's finding (2026-10-24): the switch used to be saved, so every
  // later session rotated the readable plan into the session chain, and the
  // unreadable plan's last good copy (yedek-0 from before it broke) was gone
  // by the third start, with no line saying anything after the first. Not
  // saved, the directory keeps pointing at the unreadable plan: every start
  // falls back again, says so again, and leaves the chain alone.
  it('dört oturum boyunca okunamayan planın sağlam yedeği zincirde kalıyor, satır her açılışta', async () => {
    const IYI = JSON.stringify({
      ...JSON.parse(FULL),
      settings: { ...JSON.parse(FULL).settings, schoolName: 'İyi' },
    });
    brokenFirst(CUT);
    localStorage.setItem(backupKey(0), IYI);
    for (let oturum = 0; oturum < 4; oturum++) {
      vi.resetModules();
      const { get, act, settle } = await mount();
      expect(get().plans.planId).toBe('zz');
      expect(get().setAside).toEqual(['1. plan']);
      act(() =>
        get().change((d) => ({
          ...d,
          settings: { ...d.settings, schoolName: `Oturum ${oturum}` },
        })),
      );
      settle();
      unmount();
      unmount = () => undefined;
    }
    expect(localStorage.getItem(backupKey(0))).toBe(IYI);
    expect(JSON.parse(localStorage.getItem(LIBRARY_KEY)!).activeId).toBe('1');
    expect(localStorage.getItem(BASE_KEY)).toBe(CUT);
    expect(JSON.parse(localStorage.getItem(planKey('zz'))!).settings.schoolName).toBe('Oturum 3');
  });
});
