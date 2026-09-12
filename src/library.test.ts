// @vitest-environment jsdom

// The plan directory decides WHICH KEY a timetable is read from and written to.
// A wrong answer here does not throw — it opens the wrong plan, or an empty
// one, and the work of an afternoon looks deleted. So every branch is pinned.

import { newId } from './pure/entities';
import {
  addPlan,
  BACKUP_COUNT,
  backupFileName,
  backupKey,
  BASE_KEY,
  bundleFileName,
  defaultLibrary,
  drafts,
  FIRST_PLAN_ID,
  findPlan,
  LIBRARY_KEY,
  type Library,
  normalizeLibrary,
  parseLibrary,
  planKey,
  removePlan,
  renamePlan,
  setActive,
  setDraft,
  uniquePlanName,
} from './pure/library';
import { routeName, storageAddress, storageKind, storageReport } from './platform/storageReport';
import {
  dropPlanText,
  readLibrary,
  readPlanText,
  writeLibrary,
  writePlanText,
} from './platform/libraryStore';

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
  };
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

// The backup chain is user data like the plan keys. The count is read from
// BACKUP_COUNT rather than named, so a longer chain cannot leave this green.
describe('backupKey', () => {
  it('oturum yedeklerinin anahtarı tarihsel biçimde', () => {
    expect(backupKey(0)).toBe('ders-programi-yedek-0');
    expect(backupKey(BACKUP_COUNT - 1)).toBe(`ders-programi-yedek-${BACKUP_COUNT - 1}`);
  });

  it('"Veriler nerede" zincirin her halkasını tam bir kez listeliyor', () => {
    const listed = storageReport(two())
      .rows.map((r) => r.key)
      .filter((key) => key.startsWith('ders-programi-yedek-'));
    expect(listed).toEqual(Array.from({ length: BACKUP_COUNT }, (_, i) => backupKey(i)));
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
      plans: [{ id: 'abcd', name: 42 }, { name: 'kimliksiz' }, { id: '', name: 'boş kimlik' }],
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
    expect(keys).toContain('ders-programi-baski');
    expect(keys).toContain('ders-programi-tanitim');
    // An absent backup chain is information too, so the row stays with 0.
    expect(storageReport(two()).rows.find((r) => r.key === 'ders-programi-yedek-0')!.chars).toBe(0);
  });

  it('satırlar bugünkü sırada, tercihler bugünkü adlarıyla', () => {
    // Pinned before the preference keys moved into one list, so the move is
    // measured: the order a reader scans and the name each row goes by.
    const rows = storageReport(two()).rows;
    expect(rows.slice(0, 6).map((r) => r.key)).toEqual([
      BASE_KEY,
      'ders-programi-plan-abcd',
      LIBRARY_KEY,
      backupKey(0),
      backupKey(1),
      backupKey(2),
    ]);
    expect(rows.slice(6).map((r) => [r.key, r.what])).toEqual([
      ['ders-programi-tema', 'tema tercihi'],
      ['ders-programi-dil', 'dil tercihi'],
      ['ders-programi-kenar', 'kenar çubuğu tercihi'],
      ['ders-programi-olcek', 'yazı büyüklüğü tercihi'],
      ['ders-programi-yogunluk', 'ızgara yoğunluğu tercihi'],
      ['ders-programi-program-rengi', 'program kart rengi tercihi'],
      ['ders-programi-arayuz-yogunluk', 'arayüz yoğunluğu tercihi'],
      ['ders-programi-havuz', 'havuz çekmecesi tercihi'],
      ['ders-programi-havuz-boy', 'havuz çekmecesinin boyu'],
      ['ders-programi-serit', 'araç şeridi tercihi'],
      ['ders-programi-serit-gizle', 'şerit kaydırınca gizlensin mi'],
      ['ders-programi-musaitlik-saat', 'müsaitlikte saat gösterimi'],
      ['ders-programi-hareket', 'hareket (animasyon) tercihi'],
      ['ders-programi-tanitim', 'örnek veri satırı görüldü mü'],
      ['ders-programi-baski', 'kâğıt seçenekleri'],
      ['ders-programi-yenilik-gorulen', 'görülen sürüm notu'],
    ]);
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
    // The one that was actually missing when this was written. It only gets
    // written when somebody changes a print option, which is why a fresh
    // profile never caught it.
    localStorage.setItem('ders-programi-baski', '{"clock":false}');
    localStorage.setItem('ders-programi-tanitim', 'gorundu');
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

  it('kâğıt seçenekleri raporda — YAZILMADAN önce de', () => {
    // Written or not, the row is there with 0: the table's contract is "every
    // key this program owns", and a key that appears only after you touch a
    // feature is exactly the one a reader would not know to look for.
    const row = storageReport(two()).rows.find((r) => r.key === 'ders-programi-baski');
    expect(row).toBeDefined();
    expect(row!.what).toBe('kâğıt seçenekleri');
    expect(row!.chars).toBe(0);
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

// ---------------------------------------------------------- hangi kopya bu

/** jsdom's location is read-only, so the branch under test gets its own. */
function withLocation(fake: Partial<Location>, job: () => void) {
  const real = Object.getOwnPropertyDescriptor(window, 'location');
  Object.defineProperty(window, 'location', { value: fake, configurable: true, writable: true });
  try {
    job();
  } finally {
    if (real === undefined) delete (window as unknown as Record<string, unknown>).location;
    else Object.defineProperty(window, 'location', real);
  }
}

describe('routeName — hangi kopya bu', () => {
  it('çift tıklanan dosyayı ADIYLA söylüyor', () => {
    withLocation(
      { protocol: 'file:', hostname: '', origin: 'file://', pathname: '/C:/a.html' },
      () => {
        expect(routeName()).toBe('Dosya (çift tıklanan .html)');
      },
    );
  });

  it('yerel kurulumu "Site" demiyor', () => {
    // It IS an http origin, so StorageKind answers 'site' about it and that is
    // correct. But telling my father he is on a "site" would send him looking
    // for an internet address that does not exist on his machine.
    withLocation(
      {
        protocol: 'http:',
        hostname: 'dersprogrami.localhost',
        origin: 'http://dersprogrami.localhost:7654',
        pathname: '/',
      },
      () => {
        expect(routeName()).toBe('Windows kurulumu');
        expect(storageKind()).toBe('site');
      },
    );
  });

  it('gerçek site "Site"', () => {
    withLocation(
      {
        protocol: 'https:',
        hostname: 'alparslansemiz.github.io',
        origin: 'https://alparslansemiz.github.io',
        pathname: '/Mozaik/',
      },
      () => expect(routeName()).toBe('Site'),
    );
  });

  it('exe her şeyin önünde', () => {
    const w = window as unknown as { __TAURI__?: unknown };
    w.__TAURI__ = { core: { invoke: async () => undefined } };
    try {
      withLocation({ protocol: 'file:', hostname: '', origin: 'file://', pathname: '/x' }, () =>
        expect(routeName()).toBe('Uygulama (.exe)'),
      );
    } finally {
      delete w.__TAURI__;
    }
  });
});

describe('storageAddress — hangi depo', () => {
  it('adresi yol dahil veriyor', () => {
    withLocation(
      {
        protocol: 'https:',
        hostname: 'alparslansemiz.github.io',
        origin: 'https://alparslansemiz.github.io',
        pathname: '/Mozaik/',
      },
      () => expect(storageAddress()).toBe('https://alparslansemiz.github.io/Mozaik/'),
    );
  });

  it('file:// tek başına — çünkü orada makinedeki HER yerel sayfa aynı kökende', () => {
    withLocation(
      { protocol: 'file:', hostname: '', origin: 'file://', pathname: '/C:/a.html' },
      () => expect(storageAddress()).toBe('file://'),
    );
  });

  it("bazı tarayıcılarda file:// kökeni 'null' yazar", () => {
    withLocation({ protocol: 'file:', hostname: '', origin: 'null', pathname: '/C:/a.html' }, () =>
      expect(storageAddress()).toBe('file://'),
    );
  });

  it('exe bir adres göstermiyor — gidilecek bir yer değil', () => {
    const w = window as unknown as { __TAURI__?: unknown };
    w.__TAURI__ = { core: { invoke: async () => undefined } };
    try {
      expect(storageAddress()).toBe('');
    } finally {
      delete w.__TAURI__;
    }
  });
});

// ------------------------------------------------------- KATMAN SINIRLARI
//
// Written BEFORE the module was split into model, storage and report, and
// deliberately not about behaviour: these are the four things the split could
// quietly break, and none of them had a test. Each one is read off the source,
// because each one is a fact about which file may say what — a runtime
// assertion cannot see a file boundary.
//
// Read through Vite rather than `node:fs` for the reason `i18n.test.ts` gives:
// `src/` compiles without Node's globals on purpose (raw.d.ts).
const KAYNAK = import.meta.glob('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** One module by its file name, wherever in `src/` it now lives: the layer
    folders moved these files once and a hard-coded `./library.ts` would go
    undefined rather than red, which reads as a passing `not.toMatch`. */
function modul(ad: string): string | undefined {
  return KAYNAK[Object.keys(KAYNAK).find((p) => p.endsWith('/' + ad)) ?? ''];
}

/** The modules the plan library is made of, whatever they end up being called. */
function libraryModules(): Array<[string, string]> {
  return Object.entries(KAYNAK).filter(
    ([path]) =>
      /\/(library|libraryStore|storageReport)\.ts$/.test(path) && !path.includes('.test.'),
  );
}

/** Source with comments removed: every rule below is about CODE, and the
    comments in this project quote the very strings being searched for
    (pitfall 87). */
const kodu = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('katman sınırları', () => {
  it('modüller okunabildi — boş bir okuma her iddiayı bedavaya yeşil yapardı', () => {
    // Pitfall 109: Vitest hands back an empty string for anything it is not
    // told to read, and every assertion below is a `not.toMatch`.
    const mods = libraryModules();
    expect(mods.length, 'kitaplık modülü bulunamadı').toBeGreaterThan(0);
    for (const [path, src] of mods) {
      expect(src.length, `${path} boş okundu`).toBeGreaterThan(500);
    }
  });

  it('hiçbiri store.ts’i çağırmıyor — çalışma zamanı döngüsünü kıran şey bu', () => {
    // library hands out and takes back RAW STRINGS and store.ts is the only
    // place that parses them. The day this module learns what a State is, the
    // two import each other and the cycle is back (ARCHITECTURE, and the same
    // arrangement keys.ts has between constraints and rules).
    for (const [path, src] of libraryModules()) {
      expect(kodu(src), `${path} store.ts’i import ediyor`).not.toMatch(
        /import[^;]*from '\.\/store'/,
      );
      expect(kodu(src), `${path} State tipini tanıyor`).not.toMatch(/\bState\b/);
    }
  });

  it('saf model depoya dokunmuyor', () => {
    // The whole point of splitting storage out: the model can be reasoned
    // about, and tested, without a browser. One getItem back in here and that
    // is gone again, and nothing else would say so.
    const model = modul('library.ts');
    expect(model, 'library.ts okunamadı').toBeTruthy();
    expect(kodu(model!), 'library.ts localStorage’a dokunuyor').not.toMatch(/localStorage/);
  });

  it('bağımlılık tek yönlü — model kendi üstündekileri çağırmıyor', () => {
    // Storage and the report both read the model; the model reads neither. The
    // day it does, the three files are one file again with extra steps, and
    // the cycle this split exists to prevent is back in a new shape.
    const model = modul('library.ts');
    expect(kodu(model!), 'library.ts libraryStore’u çağırıyor').not.toMatch(
      /from '\.\/libraryStore'/,
    );
    expect(kodu(model!), 'library.ts storageReport’u çağırıyor').not.toMatch(
      /from '\.\/storageReport'/,
    );
  });

  it('rapor anahtarları TÜRETİYOR, elle yazmıyor', () => {
    // The debt this table records is "every ders-programi* key that gets
    // written shows up here". It stays true only while the report asks the
    // modules that own the keys; the moment a key is typed into the report by
    // hand, the next key nobody types is invisible — which already happened
    // twice (the drawer height and the strip, then the print options).
    for (const [path, src] of libraryModules()) {
      const literals = [...kodu(src).matchAll(/'ders-programi[^']*'/g)].map((m) => m[0]);
      const allowed = new Set(["'ders-programi'"]); // BASE_KEY itself, defined once
      const strays = literals.filter((l) => !allowed.has(l));
      expect(strays, `${path} anahtarı elle yazıyor: ${strays.join(', ')}`).toEqual([]);
    }
  });

  it('bozuk girdi kuralları tek evde — bundle.ts kendi kuralını yazmıyor', () => {
    // bundle.ts carries every plan as raw `unknown` and hands the directory to
    // normalizeLibrary. Two homes for "what is a legal plan list" is two
    // answers, and the file format is the one place that cannot afford that.
    const bundle = modul('bundle.ts');
    expect(bundle, 'bundle.ts okunamadı').toBeTruthy();
    // The raw values go straight in. Anything bundle.ts checked ITSELF first
    // would be a second answer to "what is a legal plan list", and a file
    // format is the one place that cannot afford two.
    expect(kodu(bundle!), 'bundle.ts dizini normalizeLibrary’ye vermiyor').toMatch(
      /normalizeLibrary\(\{\s*activeId:\s*g\.activeId/,
    );
  });
});
