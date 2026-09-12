// @vitest-environment jsdom

// The contract of `store.ts`, written the day before it was split.
//
// The file answers five different questions at once — the undo stack, reading
// a saved file, where a plan lives, how a file reaches the disk, and the React
// wiring — and the split moves each of them to its own module. A move that
// changes behaviour is not a move, so this pins the behaviour FIRST, through
// the names the program itself calls.
//
// Deliberately not a rewrite of `store.test.ts`: that file measures what each
// migration does to the DATA, one version at a time. This one measures the
// SHAPE of the thing being taken apart — the accept list as a set, the order
// of writes, what a hook flushes and when — because those are what a split can
// quietly lose. The hook in particular had no unit test at all before this
// file: `useStore` was covered by the browser suite and by nothing here.
//
// jsdom rather than node, for the same reason `App.test.tsx` says: the two
// halves that write a file and read a keyboard need a document.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';

import {
  collectStates,
  downloadBackup,
  downloadBundle,
  isTextInput,
  listBackups,
  loadPlan,
  parseState,
  reduce,
  savePlan,
  storageWorks,
  useStore,
} from './platform/store';
import { emptyState } from './pure/entities';
import { BACKUP_COUNT, backupKey, BASE_KEY, LIBRARY_KEY, planKey } from './pure/library';
import { SCHEMA_VERSION, type Id, type State } from './leaf/types';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// ------------------------------------------------------------------ harness

/** Every write, in order. The ORDER is the safety argument in three places. */
let writes: string[] = [];

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
      writes.push(`rm ${k}`);
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      writes.push(`set ${k}`);
      map.set(k, String(v));
    },
  } as Storage;
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  writes = [];
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
    writable: true,
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

/** A school with one recognisable difference from the blank one. */
function named(name: string): State {
  const d = emptyState();
  return { ...d, settings: { ...d.settings, schoolName: name } };
}

// --------------------------------------------------------------- undo stack

describe('sözleşme · geri al yığını', () => {
  const box = (present: State) => ({
    present,
    past: [] as State[],
    future: [] as State[],
    planId: '1',
  });

  it('gerçek bir değişiklik geçmişe yazılır, aynı nesneyi döndüren değişiklik yazılmaz', () => {
    const start = box(emptyState());
    const changed = reduce(start, { type: 'change', apply: () => named('Okul') });
    expect(changed.past.length).toBe(1);
    expect(changed.present.settings.schoolName).toBe('Okul');

    const same = reduce(changed, { type: 'change', apply: (d) => d });
    expect(same).toBe(changed);
  });

  it('geri al ve ileri al aynı durumu geri getiriyor', () => {
    const one = reduce(box(emptyState()), { type: 'change', apply: () => named('A') });
    const two = reduce(one, { type: 'change', apply: () => named('B') });
    const back = reduce(two, { type: 'undo' });
    expect(back.present.settings.schoolName).toBe('A');
    expect(back.future.length).toBe(1);
    expect(reduce(back, { type: 'redo' }).present.settings.schoolName).toBe('B');
  });

  it('boş yığında geri al ve ileri al kutuyu değiştirmiyor', () => {
    const start = box(emptyState());
    expect(reduce(start, { type: 'undo' })).toBe(start);
    expect(reduce(start, { type: 'redo' })).toBe(start);
  });

  it('geçmiş bir tavanda duruyor ve en eskisi düşüyor', () => {
    let cur = box(named('0'));
    for (let i = 1; i <= 60; i++)
      cur = reduce(cur, { type: 'change', apply: () => named(String(i)) });
    const cap = cur.past.length;
    expect(cap).toBeGreaterThan(0);
    expect(cap).toBeLessThan(60);
    // The oldest survivor is `cap` steps behind the present, not the first edit.
    expect(cur.past[0]?.settings.schoolName).toBe(String(60 - cap));
  });

  it('program değişikliği, yükleme ve plan geçişi geçmişi TEMİZLİYOR', () => {
    const one = reduce(box(emptyState()), { type: 'change', apply: () => named('A') });
    expect(reduce(one, { type: 'program-change', apply: () => named('B') }).past).toEqual([]);
    expect(reduce(one, { type: 'load', state: named('C') }).past).toEqual([]);
    const switched = reduce(one, { type: 'switch', id: 'p2', state: named('D') });
    expect(switched.past).toEqual([]);
    expect(switched.future).toEqual([]);
    expect(switched.planId).toBe('p2');
  });
});

// ------------------------------------------------------------ the accept list

describe('sözleşme · şema kabul listesi', () => {
  // Pitfall 97 lives exactly here: the list is a chain of `version === N`, and
  // the split carries it from one file to another. Nothing below names a
  // number, so a version that falls out of the list on the way turns this red
  // rather than turning some backup unreadable months later.
  const stamped = (version: number): string =>
    JSON.stringify({ ...emptyState(), schemaVersion: version });

  it('bugünün biçimindeki her sürüm damgası kabul ediliyor, v3’ten bugüne', () => {
    // v1 and v2 are a different SHAPE, not just a different stamp, and their
    // own migrations are measured file by file in `store.test.ts` and
    // `fixtures.test.ts`. From v3 on there is one reader, and this is its list.
    const versions = Array.from({ length: SCHEMA_VERSION - 2 }, (_, i) => i + 3);
    const rejected = versions.filter((v) => parseState(stamped(v)) === null);
    expect(rejected, 'kabul listesinden düşen sürüm').toEqual([]);
    expect(versions.length).toBeGreaterThan(5);
  });

  it('her okunan dosya bugünkü sürümle damgalanıp geri veriliyor', () => {
    const state = parseState(stamped(SCHEMA_VERSION - 1));
    expect(state?.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('yarının sürümü ve okunamayan gövde null dönüyor', () => {
    expect(parseState(stamped(SCHEMA_VERSION + 1))).toBeNull();
    expect(parseState('{ bozuk')).toBeNull();
    expect(parseState('[]')).toBeNull();
    expect(parseState('null')).toBeNull();
  });
});

// ------------------------------------------------------------- where a plan lives

describe('sözleşme · planın deposu', () => {
  it('yazılan plan aynen geri okunuyor, olmayan plan null', () => {
    expect(savePlan('p9', named('Depo'))).toBe(true);
    expect(loadPlan('p9')?.settings.schoolName).toBe('Depo');
    expect(loadPlan('yok')).toBeNull();
  });

  it('ilk planın anahtarı tarihsel anahtar', () => {
    // Pitfall 29: plan "1" IS `ders-programi`. Renaming it orphans every
    // timetable that was saved before the library existed.
    savePlan(planKey('1') === BASE_KEY ? '1' : '1', named('Tarihsel'));
    expect(localStorage.getItem(BASE_KEY)).not.toBeNull();
  });

  it('depo yazamıyorsa yazma false dönüyor ve çökmüyor', () => {
    const broken = { ...memoryStorage() } as Storage;
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        ...broken,
        setItem: () => {
          throw new Error('quota');
        },
      },
      configurable: true,
      writable: true,
    });
    expect(savePlan('p1', emptyState())).toBe(false);
    expect(storageWorks()).toBe(false);
  });

  it('çalışan depoda depo denemesi geçiyor ve arkasında iz bırakmıyor', () => {
    expect(storageWorks()).toBe(true);
    expect(localStorage.getItem(`${BASE_KEY}-deneme`)).toBeNull();
  });

  it('yedek zinciri okunuyor, bozuk kayıt atlanıyor', () => {
    localStorage.setItem(backupKey(0), JSON.stringify(named('Dün')));
    localStorage.setItem(backupKey(1), 'bozuk');
    const list = listBackups();
    expect(list.map((b) => b.index)).toEqual([0]);
    expect(list[0]?.state.settings.schoolName).toBe('Dün');
    expect(BACKUP_COUNT).toBeGreaterThan(1);
  });
});

// ------------------------------------------------------------------- files

describe('sözleşme · diske inen dosya', () => {
  function captureDownload(): () => { name: string; text: string } {
    const clicked: { name: string; text: string }[] = [];
    const blobs = new Map<string, string>();
    const realCreate = URL.createObjectURL;
    URL.createObjectURL = (blob: Blob) => {
      const url = `blob:${blobs.size}`;
      // jsdom's Blob has no synchronous text(); the constructor argument is
      // what the code passed, and that is what this test is about.
      blobs.set(url, (blob as unknown as { _text?: string })._text ?? '');
      return url;
    };
    URL.revokeObjectURL = () => {};
    const realBlob = globalThis.Blob;
    globalThis.Blob = class extends realBlob {
      _text: string;
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        this._text = String(parts[0]);
      }
    } as unknown as typeof Blob;
    const realClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
      clicked.push({ name: this.download, text: blobs.get(this.href) ?? '' });
    };
    return () => {
      URL.createObjectURL = realCreate;
      globalThis.Blob = realBlob;
      HTMLAnchorElement.prototype.click = realClick;
      const last = clicked[clicked.length - 1];
      expect(last, 'hiç dosya indirilmedi').toBeDefined();
      return last!;
    };
  }

  it('yedek dosyası bugünün adıyla ve durumun kendisiyle iniyor', () => {
    const done = captureDownload();
    downloadBackup(named('Yedek'));
    const file = done();
    expect(file.name).toMatch(/\.json$/);
    expect(parseState(file.text)?.settings.schoolName).toBe('Yedek');
    expect(document.querySelector('a[download]'), 'bağlantı temizlenmedi').toBeNull();
  });

  it('açık planın durumu BELLEKTEN, ötekiler depodan toplanıyor', () => {
    savePlan('p2', named('Depodaki'));
    const library = {
      plans: [
        { id: '1', name: 'Bir', draft: false },
        { id: 'p2', name: 'İki', draft: false },
      ],
      activeId: '1',
    };
    const states = collectStates(library, '1', named('Ekrandaki'));
    expect(states['1']?.settings.schoolName).toBe('Ekrandaki');
    expect(states['p2']?.settings.schoolName).toBe('Depodaki');
  });

  it('anahtarı olmayan plan zarfa boş girmiyor, atlanıyor', () => {
    const library = {
      plans: [
        { id: '1', name: 'Bir', draft: false },
        { id: 'yok', name: 'Yok', draft: false },
      ],
      activeId: '1',
    };
    const states = collectStates(library, '1', named('Ekrandaki'));
    expect(Object.keys(states)).toEqual(['1']);
  });

  it('zarf kaç plan taşıdığını söylüyor ve dosya iniyor', () => {
    savePlan('p2', named('İki'));
    const library = {
      plans: [
        { id: '1', name: 'Bir', draft: false },
        { id: 'p2', name: 'İki', draft: false },
      ],
      activeId: '1',
    };
    const done = captureDownload();
    const count = downloadBundle(library, '1', named('Bir'));
    const file = done();
    expect(count).toBe(2);
    expect(file.name).toMatch(/\.json$/);
    expect(file.text).toContain('İki');
  });
});

// -------------------------------------------------------------- the keyboard

describe('sözleşme · metin kutusu koruması', () => {
  it('metin kutuları ve düzenlenebilir alan true, ötekiler false', () => {
    const input = document.createElement('input');
    const area = document.createElement('textarea');
    const div = document.createElement('div');
    // jsdom leaves `isContentEditable` undefined; a browser answers false, and
    // the assertion below is about the answer rather than about jsdom.
    Object.defineProperty(div, 'isContentEditable', { value: false });
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    // jsdom does not compute isContentEditable from the attribute.
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    expect(isTextInput(input)).toBe(true);
    expect(isTextInput(area)).toBe(true);
    expect(isTextInput(editable)).toBe(true);
    expect(isTextInput(div)).toBe(false);
    expect(isTextInput(null)).toBe(false);
  });
});

// ---------------------------------------------------------------- the hook

type Store = ReturnType<typeof useStore>;

describe('sözleşme · React kancası', () => {
  let store: Store;

  function Probe(): null {
    store = useStore();
    return null;
  }

  function mount(): void {
    act(() => root.render(createElement(Probe)));
  }

  /** Let the debounce fire. */
  function settle(): void {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('açılışta kitaplık ve açık plan kuruluyor, ilk planın anahtarı tarihsel', () => {
    mount();
    expect(store.plans.planId).toBe('1');
    expect(planKey(store.plans.planId)).toBe(BASE_KEY);
    expect(store.plans.library.plans.length).toBe(1);
  });

  it('değişiklik gecikmeli yazılıyor: hemen değil, bekleyince', () => {
    mount();
    writes = [];
    act(() => store.change(() => named('Gecikme')));
    expect(writes.filter((w) => w.includes(BASE_KEY))).toEqual([]);
    settle();
    expect(loadPlan('1')?.settings.schoolName).toBe('Gecikme');
  });

  it('park() bekleyen kaydı EŞZAMANLI boşaltıyor', () => {
    // Pitfall 28: the exe restarts itself without unloading the page, so the
    // 400 ms debounce would eat the last edit. `park()` is the only thing
    // standing between that edit and the disk.
    mount();
    act(() => store.change(() => named('Park')));
    act(() => store.park());
    expect(loadPlan('1')?.settings.schoolName).toBe('Park');
  });

  it('plan geçişi ÖNCE ayrılan planı yazıyor', () => {
    mount();
    let second: Id = '';
    act(() => {
      second = store.plans.createPlan('İkinci', emptyState());
    });
    act(() => store.change(() => named('Son düzenleme')));
    act(() => store.plans.switchPlan('1'));
    expect(loadPlan(second)?.settings.schoolName).toBe('Son düzenleme');
    expect(store.plans.planId).toBe('1');
  });

  it('yeni plan önce VERİSİNİ sonra dizin kaydını yazıyor', () => {
    mount();
    settle();
    writes = [];
    let id: Id = '';
    act(() => {
      id = store.plans.createPlan('Üçüncü', named('Tohum'));
    });
    const dataAt = writes.findIndex((w) => w === `set ${planKey(id)}`);
    const dirAt = writes.findIndex((w) => w === `set ${LIBRARY_KEY}`);
    expect(dataAt, 'planın verisi yazılmadı').toBeGreaterThanOrEqual(0);
    expect(dirAt, 'dizin yazılmadı').toBeGreaterThanOrEqual(0);
    expect(dataAt).toBeLessThan(dirAt);
  });

  it('plan silinince anahtarı düşüyor ve açık plan başka bir plana geçiyor', () => {
    mount();
    let id: Id = '';
    act(() => {
      id = store.plans.createPlan('Silinecek', named('Gider'));
    });
    expect(loadPlan(id)).not.toBeNull();
    act(() => store.plans.deletePlan(id));
    settle();
    expect(loadPlan(id)).toBeNull();
    expect(store.plans.planId).not.toBe(id);
  });

  it('tek plan silinemiyor', () => {
    mount();
    act(() => store.plans.deletePlan('1'));
    expect(store.plans.library.plans.length).toBe(1);
  });

  it('zarf yüklemesi hiçbir planı okuyamazsa HİÇBİR ŞEY değişmiyor', () => {
    mount();
    settle();
    const before = store.plans.library;
    let result = { ok: -1, failed: -1 };
    act(() => {
      result = store.plans.replaceLibrary({
        library: { plans: [{ id: 'x', name: 'Bozuk', draft: false }], activeId: 'x' },
        states: { x: 'bu bir State değil' as unknown as State },
      });
    });
    expect(result).toEqual({ ok: 0, failed: 1 });
    expect(store.plans.library).toBe(before);
  });

  it('zarf yüklemesi kitaplığın TAMAMINI değiştiriyor ve eskiyi siliyor', () => {
    mount();
    let eski: Id = '';
    act(() => {
      eski = store.plans.createPlan('Eski', named('Eski'));
    });
    settle();
    act(() => {
      store.plans.replaceLibrary({
        library: { plans: [{ id: 'y', name: 'Gelen', draft: false }], activeId: 'y' },
        states: { y: named('Gelen') as unknown as State },
      });
    });
    expect(store.plans.library.plans.map((p) => p.id)).toEqual(['y']);
    expect(store.plans.planId).toBe('y');
    expect(loadPlan(eski)).toBeNull();
    expect(store.state.settings.schoolName).toBe('Gelen');
  });

  it('Ctrl+Z geri alıyor, metin kutusundayken almıyor', () => {
    mount();
    act(() => store.change(() => named('Yazıldı')));
    expect(store.canUndo).toBe(true);

    const input = document.createElement('input');
    document.body.appendChild(input);
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    });
    expect(store.state.settings.schoolName).toBe('Yazıldı');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
    });
    expect(store.state.settings.schoolName).not.toBe('Yazıldı');
    input.remove();
  });
});
