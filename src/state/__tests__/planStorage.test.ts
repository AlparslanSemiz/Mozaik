// Which key a plan lands in, and what comes back out of it.
//
// The rule under test is the one a wrong answer loses a term over: each plan
// owns its own key, the first plan keeps the historical one, and a plan with
// nothing written stays tellable apart from a plan that is empty.

import { emptyState } from '../../entities';
import { BASE_KEY, FIRST_PLAN_ID, planKey } from '../../plans/library';
import { collectStates, loadPlan, savePlan } from '../planStorage';
import { activeProgram } from '../programs';
import { sampleState } from '../sample';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
  } as Storage;
}

/** Vitest runs this file under `node`, which has no localStorage of its own. */
beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
    writable: true,
  });
});

describe('planların ayrı anahtarları', () => {
  it('ilk plan tarihsel anahtara yazılıyor, ikincisi kendi anahtarına', () => {
    savePlan(FIRST_PLAN_ID, sampleState());
    savePlan('abcd', emptyState());
    expect(localStorage.getItem(BASE_KEY)).not.toBeNull();
    expect(localStorage.getItem(planKey('abcd'))).not.toBeNull();
    expect(localStorage.getItem(BASE_KEY)).not.toBe(localStorage.getItem(planKey('abcd')));
  });

  it('yazılan plan parseState üzerinden birebir geri okunuyor', () => {
    const original = sampleState();
    savePlan('abcd', original);
    expect(JSON.stringify(loadPlan('abcd'))).toBe(JSON.stringify(original));
  });

  it('hiç yazılmamış plan null dönüyor — boş duruma DÜŞMÜYOR', () => {
    // null and "an empty school" must stay tellable apart: the caller decides.
    expect(loadPlan('yokboyle')).toBeNull();
  });

  it('devralma: eski tek anahtar 1. plan olarak okunuyor', () => {
    localStorage.setItem(BASE_KEY, JSON.stringify(sampleState()));
    const adopted = loadPlan(FIRST_PLAN_ID)!;
    expect(adopted.teachers).toHaveLength(sampleState().teachers.length);
    expect(activeProgram(adopted).placements).toEqual(activeProgram(sampleState()).placements);
  });
});

describe('collectStates — paket için toplanan durumlar', () => {
  const lib = {
    activeId: FIRST_PLAN_ID,
    plans: [
      { id: FIRST_PLAN_ID, name: '1. plan', draft: false },
      { id: 'abcd', name: 'İkinci', draft: false },
    ],
  };

  it('AÇIK plan bellekten geliyor, anahtarındaki eski hâlinden değil', () => {
    // The autosave is debounced by 400 ms, so the key can be behind the screen.
    // A backup that quietly drops the last edit is worse than no backup.
    savePlan(FIRST_PLAN_ID, emptyState());
    const onScreen = { ...emptyState(), settings: { ...emptyState().settings, schoolName: 'Yeni' } };
    expect(collectStates(lib, FIRST_PLAN_ID, onScreen)[FIRST_PLAN_ID]!.settings.schoolName).toBe(
      'Yeni',
    );
  });

  it('diğer planlar anahtarlarından okunuyor', () => {
    savePlan('abcd', sampleState());
    const states = collectStates(lib, FIRST_PLAN_ID, emptyState());
    expect(states['abcd']!.teachers).toHaveLength(sampleState().teachers.length);
  });

  it('verisi bulunamayan plan ATLANIYOR — boş bir plan olarak yazılmıyor', () => {
    const states = collectStates(lib, FIRST_PLAN_ID, emptyState());
    expect(Object.keys(states)).toEqual([FIRST_PLAN_ID]);
  });
});

describe('savePlan kota hatasını bildiriyor', () => {
  it('yazılamayınca false dönüyor', () => {
    expect(savePlan('abcd', emptyState())).toBe(true);
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        setItem: () => {
          throw new Error('kota dolu');
        },
      },
      configurable: true,
      writable: true,
    });
    expect(savePlan('abcd', emptyState())).toBe(false);
  });
});
