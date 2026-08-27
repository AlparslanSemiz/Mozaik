// @vitest-environment jsdom

// The plan directory decides WHICH KEY a timetable is read from and written to.
// A wrong answer here does not throw — it opens the wrong plan, or an empty
// one, and the work of an afternoon looks deleted. So every branch is pinned.

import { newId } from './entities';
import {
  activePlan,
  addPlan,
  backupFileName,
  BASE_KEY,
  bundleFileName,
  defaultLibrary,
  dropPlanText,
  drafts,
  FIRST_PLAN_ID,
  findPlan,
  LIBRARY_KEY,
  type Library,
  nextPlanName,
  normalizeLibrary,
  parseLibrary,
  planKey,
  readLibrary,
  readPlanText,
  removePlan,
  renamePlan,
  setActive,
  setDraft,
  storageKind,
  storageReport,
  uniquePlanName,
  writeLibrary,
  writePlanText,
} from './library';

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

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
    writable: true,
  });
});

const two = (): Library => ({
  activeId: FIRST_PLAN_ID,
  plans: [
    { id: FIRST_PLAN_ID, name: '1. plan', draft: false },
    { id: 'abcd', name: 'Deneme', draft: true },
  ],
});

describe('planKey', () => {
  it('ilk plan TARİHSEL anahtarda kalıyor', () => {
    // This is the whole migration: the timetable that already exists is adopted
    // where it lies, so adoption copies nothing and can lose nothing.
    expect(planKey(FIRST_PLAN_ID)).toBe(BASE_KEY);
    expect(planKey(FIRST_PLAN_ID)).toBe('ders-programi');
  });

  it('diğer planlar kendi anahtarında', () => {
    expect(planKey('abcd')).toBe('ders-programi-plan-abcd');
  });

  it('üretilen hiçbir kimlik ilk planın kimliğiyle çakışamaz', () => {
    // newId() draws from an alphabet with no `1` in it (entities.ts). If that
    // ever changes, a new plan could silently overwrite plan "1".
    for (let i = 0; i < 500; i++) {
      const id = newId();
      expect(id).not.toBe(FIRST_PLAN_ID);
      expect(planKey(id)).not.toBe(BASE_KEY);
    }
  });
});

describe('parseLibrary — bozuk veri hiçbir zaman boş ekran üretmiyor', () => {
  it('kayıt yoksa tek planlık varsayılan geliyor', () => {
    expect(parseLibrary(null)).toEqual(defaultLibrary());
    expect(defaultLibrary().activeId).toBe(FIRST_PLAN_ID);
  });

  it('bozuk JSON, dizi olmayan gövde ve boş liste varsayılana düşüyor', () => {
    for (const junk of ['{bu json değil', '"metin"', '42', 'null', '[]', '{"plans":[]}']) {
      expect(parseLibrary(junk)).toEqual(defaultLibrary());
    }
  });

  it('kimliksiz girdi atılıyor ama ADSIZ girdi KORUNUYOR', () => {
    // The name is decoration; the id is the pointer to the data. Dropping a row
    // because its name is junk would orphan a whole timetable.
    const lib = normalizeLibrary({
      activeId: 'abcd',
      plans: [
        { id: 'abcd', name: 42 },
        { name: 'kimliksiz' },
        { id: '', name: 'boş kimlik' },
      ],
    });
    expect(lib.plans).toEqual([{ id: 'abcd', name: 'Adsız plan', draft: false }]);
    expect(lib.activeId).toBe('abcd');
  });

  it('tekrarlanan kimlik bir kez alınıyor', () => {
    const lib = normalizeLibrary({
      plans: [
        { id: 'a', name: 'bir' },
        { id: 'a', name: 'iki' },
      ],
    });
    expect(lib.plans).toHaveLength(1);
    expect(lib.plans[0]!.name).toBe('bir');
  });

  it('hiçbir plana bakmayan activeId ilk plana çekiliyor', () => {
    const lib = normalizeLibrary({ activeId: 'yok', plans: [{ id: 'a', name: 'bir' }] });
    expect(lib.activeId).toBe('a');
  });

  it('taslak işareti yalnız gerçek true ile geliyor', () => {
    const lib = normalizeLibrary({
      plans: [
        { id: 'a', name: 'bir', draft: 'evet' },
        { id: 'b', name: 'iki', draft: true },
      ],
    });
    expect(lib.plans.map((p) => p.draft)).toEqual([false, true]);
  });
});

describe('kitaplık işlemleri', () => {
  it('addPlan ekliyor, aynı kimliği iki kez eklemiyor', () => {
    const lib = addPlan(defaultLibrary(), { id: 'abcd', name: 'Deneme', draft: false });
    expect(lib.plans).toHaveLength(2);
    expect(addPlan(lib, { id: 'abcd', name: 'Başka', draft: true })).toBe(lib);
  });

  it('renamePlan boş adı reddediyor — plan adsız kalmıyor', () => {
    const lib = renamePlan(two(), 'abcd', '  Yaz dönemi ');
    expect(findPlan(lib, 'abcd')!.name).toBe('Yaz dönemi');
    expect(renamePlan(lib, 'abcd', '   ')).toBe(lib);
  });

  it('setDraft ve drafts', () => {
    expect(drafts(two()).map((p) => p.id)).toEqual(['abcd']);
    expect(drafts(setDraft(two(), 'abcd', false))).toEqual([]);
    expect(drafts(setDraft(two(), FIRST_PLAN_ID, true))).toHaveLength(2);
  });

  it('setActive yalnız var olan plana geçiyor', () => {
    expect(setActive(two(), 'abcd').activeId).toBe('abcd');
    expect(setActive(two(), 'yok')).toEqual(two());
  });

  it('activePlan bozuk activeId ile bile bir plan döndürüyor', () => {
    expect(activePlan(two()).id).toBe(FIRST_PLAN_ID);
    expect(activePlan({ activeId: 'yok', plans: two().plans }).id).toBe(FIRST_PLAN_ID);
  });

  it('removePlan: son plan silinemiyor', () => {
    const one = defaultLibrary();
    expect(removePlan(one, FIRST_PLAN_ID)).toBe(one);
    expect(removePlan(two(), 'bilinmeyen')).toEqual(two());
  });

  it('removePlan: açık plan silinince activeId kalan plana taşınıyor', () => {
    const lib = removePlan(setActive(two(), 'abcd'), 'abcd');
    expect(lib.plans).toHaveLength(1);
    expect(lib.activeId).toBe(FIRST_PLAN_ID);
  });

  it('removePlan: açık olmayan plan silinince açık plan değişmiyor', () => {
    const lib = removePlan(two(), 'abcd');
    expect(lib.activeId).toBe(FIRST_PLAN_ID);
  });
});

describe('ad çakışması', () => {
  it('uniquePlanName aynı adı iki kez vermiyor', () => {
    // Two identical options in the top bar's picker means picking the wrong one.
    expect(uniquePlanName(two(), 'Yeni')).toBe('Yeni');
    expect(uniquePlanName(two(), '1. plan')).toBe('1. plan 2');
    expect(uniquePlanName(two(), 'deneme')).toBe('deneme 2'); // Turkish case-fold
    expect(uniquePlanName(two(), '   ')).toBe('Plan');
  });

  it('üçüncü kez de çakışmıyor', () => {
    let lib = two();
    for (let i = 0; i < 3; i++) {
      const name = uniquePlanName(lib, 'Kopya');
      lib = addPlan(lib, { id: `id${i}`, name, draft: false });
    }
    expect(lib.plans.map((p) => p.name)).toContain('Kopya');
    expect(lib.plans.map((p) => p.name)).toContain('Kopya 2');
    expect(lib.plans.map((p) => p.name)).toContain('Kopya 3');
  });

  it('nextPlanName sıradaki numarayı öneriyor', () => {
    expect(nextPlanName(defaultLibrary())).toBe('2. plan');
    expect(nextPlanName(two())).toBe('3. plan');
  });
});

describe('depo katmanı', () => {
  it('devralma: dizin yokken varsayılan geliyor ve MEVCUT anahtara dokunulmuyor', () => {
    localStorage.setItem(BASE_KEY, '{"schemaVersion":5}');
    const lib = readLibrary();
    expect(lib).toEqual(defaultLibrary());
    // The whole point: nothing was copied, nothing was rewritten.
    expect(localStorage.getItem(BASE_KEY)).toBe('{"schemaVersion":5}');
    expect(readPlanText(lib.activeId)).toBe('{"schemaVersion":5}');
  });

  it('yazılan kitaplık geri okunuyor', () => {
    writeLibrary(two());
    expect(readLibrary()).toEqual(two());
    expect(localStorage.getItem(LIBRARY_KEY)).not.toBeNull();
  });

  it('elle bozulmuş dizin okunurken çökmüyor', () => {
    localStorage.setItem(LIBRARY_KEY, 'yarım {');
    expect(readLibrary()).toEqual(defaultLibrary());
  });

  it('yazım başarısını bildiriyor — kota hatası sessiz kalmıyor', () => {
    expect(writePlanText('abcd', 'içerik')).toBe(true);
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        setItem: () => {
          throw new Error('kota dolu');
        },
      },
      configurable: true,
      writable: true,
    });
    expect(writePlanText('abcd', 'içerik')).toBe(false);
  });

  it('plan metni kendi anahtarına yazılıyor ve siliniyor', () => {
    writePlanText('abcd', 'içerik');
    expect(localStorage.getItem('ders-programi-plan-abcd')).toBe('içerik');
    expect(readPlanText('abcd')).toBe('içerik');
    dropPlanText('abcd');
    expect(readPlanText('abcd')).toBeNull();
  });

  it('localStorage tamamen bozuksa çökmüyor', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('kapalı');
        },
        setItem: () => {
          throw new Error('kapalı');
        },
        removeItem: () => {
          throw new Error('kapalı');
        },
      },
      configurable: true,
      writable: true,
    });
    expect(readLibrary()).toEqual(defaultLibrary());
    expect(readPlanText('abcd')).toBeNull();
    expect(() => writeLibrary(two())).not.toThrow();
    expect(() => writePlanText('abcd', 'x')).not.toThrow();
    expect(() => dropPlanText('abcd')).not.toThrow();
  });
});

describe('indirilen dosya adları', () => {
  const t = new Date(2026, 7, 25, 18, 5); // 25 Ağustos 2026, 18:05

  it('tek plan adı DEĞİŞMİYOR — babanın elindeki dosyalarla aynı biçim', () => {
    expect(backupFileName(t)).toBe('ders-programi-2026-08-25-1805.json');
  });

  it('paket adında -tumu- işareti var', () => {
    // The only thing that tells the two file kinds apart in Explorer.
    expect(bundleFileName(t)).toBe('ders-programi-tumu-2026-08-25-1805.json');
  });

  it('tek haneli ay, gün ve saat sıfırla dolduruluyor', () => {
    expect(backupFileName(new Date(2026, 0, 2, 3, 4))).toBe('ders-programi-2026-01-02-0304.json');
  });
});

describe('veriler nerede — depo raporu', () => {
  it('her planı kendi anahtarıyla ve BOYUTUYLA sayıyor', () => {
    writePlanText(FIRST_PLAN_ID, 'abcde'); // 5 karakter
    writePlanText('abcd', 'xy');
    const { rows, totalChars } = storageReport(two());

    expect(rows[0]).toEqual({ key: BASE_KEY, what: '1. plan', chars: 5 });
    // The draft flag is part of the answer to "which key is which plan".
    expect(rows[1]).toEqual({
      key: 'ders-programi-plan-abcd',
      what: 'Deneme (taslak)',
      chars: 2,
    });
    expect(totalChars).toBe(7);
  });

  it('plan olmayan anahtarların hepsi listede — eksik olan 0 ile', () => {
    const keys = storageReport(two()).rows.map((r) => r.key);
    expect(keys).toContain(LIBRARY_KEY);
    expect(keys).toContain('ders-programi-yedek-0');
    expect(keys).toContain('ders-programi-yedek-2');
    expect(keys).toContain('ders-programi-tema');
    expect(keys).toContain('ders-programi-kenar');
    expect(keys).toContain('ders-programi-olcek');
    expect(keys).toContain('ders-programi-yogunluk');
    expect(keys).toContain('ders-programi-havuz');
    expect(keys).toContain('ders-programi-havuz-boy');
    expect(keys).toContain('ders-programi-serit');
    // An absent backup chain is information too, so the row stays with 0.
    expect(storageReport(two()).rows.find((r) => r.key === 'ders-programi-yedek-0')!.chars).toBe(0);
  });

  it('gerçekten YAZILMIŞ hiçbir anahtar listeden düşmüyor', () => {
    // The list above is kept by hand, so it falls behind by hand: -havuz-boy
    // and -serit were written for weeks before anybody noticed the panel did
    // not name them. This asks the storage itself instead of asking the list.
    localStorage.setItem('ders-programi-tema', 'dark');
    localStorage.setItem('ders-programi-olcek', '1.25');
    localStorage.setItem('ders-programi-yogunluk', 'sigdir');
    localStorage.setItem('ders-programi-havuz', 'kapali');
    localStorage.setItem('ders-programi-havuz-boy', '17.5');
    localStorage.setItem('ders-programi-serit', 'kapali');
    writePlanText(FIRST_PLAN_ID, 'abcde');

    const keys = storageReport(two()).rows.map((r) => r.key);
    const written = Object.keys(localStorage).filter((k) => k.startsWith(BASE_KEY));
    for (const key of written) expect(keys, `${key} raporda yok`).toContain(key);
  });

  it('localStorage kapalıysa rapor boş çıkıyor, çökmüyor', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('kapalı');
        },
      },
      configurable: true,
      writable: true,
    });
    expect(storageReport(two()).totalChars).toBe(0);
  });

  it('http altında "site" diyor', () => {
    // jsdom serves http://localhost, which IS the site case. The file:// branch
    // cannot be faked honestly here, so it is asserted where it is real: the
    // E2E suite opens dist/index.html over file:// and reads the sentence.
    expect(storageKind()).toBe('site');
  });

  it('exe içinde "exe" diyor — köken hâlâ http olsa BİLE', () => {
    // The exe is served over a normal origin, so the protocol question keeps
    // answering "site" about it: true, and useless. What the panel has to get
    // right is whether "tarama verilerini temizle" can take the work away,
    // and in the exe it cannot — a copy is on disk after every change.
    const w = window as unknown as { __TAURI__?: unknown };
    expect(storageKind()).toBe('site');
    w.__TAURI__ = { core: { invoke: async () => undefined } };
    try {
      expect(storageKind()).toBe('exe');
    } finally {
      delete w.__TAURI__;
    }
    expect(storageKind()).toBe('site');
  });
});
