// @vitest-environment jsdom

// The folder, driven the way App drives it: the real useStore feeding the real
// useFolder, over the exe's bridge with an in-memory disk behind it (A2, the
// audit of 2026-10-24). The exe writes Belgelerim\Ders Programı on its own at
// startup, and the audit measured that write turning a full folder empty: an
// empty or unreadable storage put an empty bundle over the live file and over
// today's backup, and the prune counted that empty backup among the ten it
// keeps, so one full backup went on every new day. B1, B2, G1 and G2 below are
// its reproductions (scratch/analiz/T2/e2e), at the hook.
//
// Before this file `useFolder` had no unit test, and breaking B7.30's folder
// gate left the suite green (TODO B7.30, "Kalan").

import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_KEY, LIBRARY_KEY, planKey } from './pure/library';
import { SCHEMA_VERSION } from './leaf/types';
import type { FolderRun } from './platform/useFolder';
import type { useStore as UseStore } from './platform/useStore';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

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

const FULL_STATE = JSON.parse(readFileSync('src/fixtures/tam-dolu-kurs-dizili.json', 'utf8'));
const FULL = JSON.stringify(FULL_STATE);
const NEWER = JSON.stringify({ ...FULL_STATE, schemaVersion: SCHEMA_VERSION + 1 });
const EMPTY_STATE = { ...FULL_STATE, teachers: [], classes: [], lessons: [], rooms: [] };

function bundle(state: unknown): string {
  return JSON.stringify({
    bundleVersion: 1,
    savedAt: '2026-10-23T18:00:00.000Z',
    activeId: '1',
    plans: [{ id: '1', name: '1. plan', draft: false, state }],
  });
}
const FULL_BUNDLE = bundle(FULL_STATE);
const EMPTY_BUNDLE = bundle(EMPTY_STATE);

const TODAY = new Date(2026, 9, 24, 10, 0, 0);
function day(back: number, from = TODAY): string {
  const d = new Date(from);
  d.setDate(d.getDate() - back);
  const p = (n: number) => String(n).padStart(2, '0');
  return `ders-programi-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

/** The far side of the bridge: src-tauri/src/lib.rs, in memory. */
function fakeDisk(seed: Record<string, string>) {
  const files = new Map(Object.entries(seed));
  const calls: string[] = [];
  const invoke = async (cmd: string, args?: Record<string, unknown>) => {
    const name = args?.name as string | undefined;
    calls.push(name === undefined ? cmd : `${cmd}:${name}`);
    if (cmd === 'data_dir_path') return 'C:\\Users\\baba\\Belgeler\\Ders Programı';
    if (cmd === 'write_file') {
      files.set(name!, args!.text as string);
      return undefined;
    }
    if (cmd === 'read_file') return files.get(name!) ?? null;
    if (cmd === 'list_files') return [...files.keys()];
    if (cmd === 'remove_file') {
      files.delete(name!);
      return undefined;
    }
    throw new Error(`bilinmeyen komut: ${cmd}`);
  };
  return { files, calls, invoke };
}

function teachersIn(text: string | undefined): number | 'YOK' {
  if (text === undefined) return 'YOK';
  const b = JSON.parse(text) as { plans: Array<{ state: { teachers: unknown[] } }> };
  return b.plans.reduce((n, p) => n + p.state.teachers.length, 0);
}

let unmount: () => void = () => undefined;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(),
    configurable: true,
    writable: true,
  });
  vi.useFakeTimers();
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  unmount();
  delete (window as { __TAURI__?: unknown }).__TAURI__;
  vi.useRealTimers();
});

/** Opens the exe: fresh modules over the storage and the disk as they are. */
async function launch(disk: ReturnType<typeof fakeDisk>, firstPaint: () => void = () => undefined) {
  vi.resetModules();
  (window as { __TAURI__?: unknown }).__TAURI__ = { core: { invoke: disk.invoke } };
  const { act, createElement } = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { useStore } = await import('./platform/useStore');
  const { useFolder } = await import('./platform/useFolder');
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const box: { store?: ReturnType<typeof UseStore>; folder?: FolderRun } = {};
  function Probe(): null {
    const store = useStore();
    box.store = store;
    box.folder = useFolder(
      store.plans.library,
      store.plans.planId,
      store.state,
      store.saveTrouble === 'dolu',
    );
    return null;
  }
  act(() => root.render(createElement(Probe)));
  firstPaint();
  unmount = () => {
    act(() => root.unmount());
    container.remove();
    unmount = () => undefined;
  };
  const wait = (ms: number) =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  await wait(3500);
  return { box, act, wait };
}

const writes = (disk: ReturnType<typeof fakeDisk>) =>
  disk.calls.filter((c) => c.startsWith('write_file') || c.startsWith('remove_file'));

describe('exe klasörü · boş ya da okunamayan depo dolu klasörün üstüne yazmıyor', () => {
  it('B1/G1: depo boş, klasörde dolu ana dosya ve 12 dolu günlük: hiçbir şey yazılmıyor, silinmiyor', async () => {
    const seed: Record<string, string> = {
      'ders-programi-tumu.json': FULL_BUNDLE,
      'babanin-kendi-dosyasi.json': '{"x":1}',
    };
    for (let b = 1; b <= 12; b++) seed[day(b)] = FULL_BUNDLE;
    const disk = fakeDisk(seed);
    await launch(disk);
    expect(writes(disk)).toEqual([]);
    expect(disk.files.get('ders-programi-tumu.json')).toBe(FULL_BUNDLE);
    expect(disk.files.size).toBe(14);
  });

  it('B2: depoda daha yeni şema, klasörde dolu yedek: ne depo ne klasör eziliyor', async () => {
    localStorage.setItem(BASE_KEY, NEWER);
    const disk = fakeDisk({ 'ders-programi-tumu.json': FULL_BUNDLE, [day(0)]: FULL_BUNDLE });
    await launch(disk);
    expect(writes(disk)).toEqual([]);
    expect(teachersIn(disk.files.get(day(0)))).toBe(FULL_STATE.teachers.length);
    expect(localStorage.getItem(BASE_KEY)).toBe(NEWER);
  });

  it('G2: on gün art arda boş açılış, dolu günlüklerden hiçbiri düşmüyor', async () => {
    const seed: Record<string, string> = { 'ders-programi-tumu.json': FULL_BUNDLE };
    for (let b = 1; b <= 10; b++) seed[day(b)] = FULL_BUNDLE;
    const disk = fakeDisk(seed);
    const full = () =>
      [...disk.files.entries()].filter(
        ([n, t]) => /\d{4}-\d{2}-\d{2}\.json$/.test(n) && teachersIn(t) !== 0,
      ).length;
    for (let k = 0; k <= 10; k++) {
      vi.setSystemTime(new Date(TODAY.getTime() + k * 86_400_000));
      await launch(disk);
      unmount();
      expect(full(), `gün+${k}`).toBe(10);
    }
    expect(teachersIn(disk.files.get('ders-programi-tumu.json'))).toBe(FULL_STATE.teachers.length);
  });

  function secondPlan(text: string) {
    localStorage.setItem(BASE_KEY, FULL);
    localStorage.setItem(planKey('zz'), text);
    localStorage.setItem(
      LIBRARY_KEY,
      JSON.stringify({
        activeId: '1',
        plans: [
          { id: '1', name: '1. plan', draft: false },
          { id: 'zz', name: 'Yeni', draft: false },
        ],
      }),
    );
  }

  it('daha yeni sürümün planı klasöre OLDUĞU GİBİ giriyor, düşmüyor', async () => {
    secondPlan(NEWER);
    const disk = fakeDisk({});
    await launch(disk);
    const main = JSON.parse(disk.files.get('ders-programi-tumu.json')!) as {
      plans: Array<{ id: string; state: { schemaVersion: number } }>;
    };
    expect(main.plans.map((p) => p.id)).toEqual(['1', 'zz']);
    expect(main.plans[1]!.state).toEqual(JSON.parse(NEWER));
    expect(localStorage.getItem(planKey('zz'))).toBe(NEWER);
  });

  it('JSON bile olmayan bir plan varken klasöre hiç yazılmıyor', async () => {
    secondPlan(FULL.slice(0, 5000));
    const disk = fakeDisk({ 'ders-programi-tumu.json': FULL_BUNDLE });
    await launch(disk);
    expect(writes(disk)).toEqual([]);
  });
});

describe('exe klasörü · açılış yazısı yalnız okunmuş bir plandan', () => {
  it('kontrol: okunan dolu plan açılışta tıklamasız yazılıyor', async () => {
    localStorage.setItem(BASE_KEY, FULL);
    const disk = fakeDisk({});
    const { box } = await launch(disk);
    expect(teachersIn(disk.files.get('ders-programi-tumu.json'))).toBe(FULL_STATE.teachers.length);
    expect(teachersIn(disk.files.get(day(0)))).toBe(FULL_STATE.teachers.length);
    expect(box.folder!.status.kind).toBe('yazildi');
  });

  it('boş açılan depo ilk gerçek değişiklikte yazılıyor', async () => {
    const disk = fakeDisk({ 'ders-programi-tumu.json': FULL_BUNDLE });
    const { box, act, wait } = await launch(disk);
    expect(writes(disk)).toEqual([]);
    act(() => box.store!.change(() => FULL_STATE));
    await wait(3000);
    expect(disk.calls).toContain('write_file:ders-programi-tumu.json');
    expect(disk.calls).toContain(`write_file:${day(0)}`);
  });

  it('okunan ama BOŞ plan dolu ana dosyanın üstüne yazmıyor; olmayan günlüğü yazıyor, budamıyor', async () => {
    localStorage.setItem(BASE_KEY, JSON.stringify(EMPTY_STATE));
    const seed: Record<string, string> = { 'ders-programi-tumu.json': FULL_BUNDLE };
    for (let b = 1; b <= 12; b++) seed[day(b)] = FULL_BUNDLE;
    const disk = fakeDisk(seed);
    await launch(disk);
    expect(disk.files.get('ders-programi-tumu.json')).toBe(FULL_BUNDLE);
    expect(teachersIn(disk.files.get(day(0)))).toBe(0);
    expect(disk.calls.filter((c) => c.startsWith('remove_file'))).toEqual([]);
  });

  it('klasör okunamıyorsa boş plan sessizce atlanmıyor, satır kırmızı', async () => {
    // A folder that refuses a read refuses the write too; skipping the empty
    // bundle quietly would hide that the folder stopped working (pitfall 7).
    localStorage.setItem(BASE_KEY, JSON.stringify(EMPTY_STATE));
    const disk = fakeDisk({ 'ders-programi-tumu.json': FULL_BUNDLE });
    const invoke = disk.invoke;
    disk.invoke = async (cmd, args) => {
      if (cmd === 'read_file') throw new Error('erişim yok');
      return invoke(cmd, args);
    };
    const { box } = await launch(disk);
    expect(box.folder!.status.kind).toBe('hata');
    expect(disk.files.get('ders-programi-tumu.json')).toBe(FULL_BUNDLE);
  });

  it('boş klasöre boş plan yazılabiliyor: kaybedilecek bir şey yok', async () => {
    localStorage.setItem(BASE_KEY, JSON.stringify(EMPTY_STATE));
    const disk = fakeDisk({});
    await launch(disk);
    expect(teachersIn(disk.files.get('ders-programi-tumu.json'))).toBe(0);
  });
});

describe('exe klasörü · B7.30 kapısı', () => {
  it('boş açılan planın anahtarı sonradan doluysa klasöre de yazılmıyor', async () => {
    // TODO B7.30's "Kalan": the folder half of the gate had no test, and
    // breaking it stayed green. The stale empty start: the key fills behind
    // the window's back, then an edit; neither the key nor the folder takes it.
    const disk = fakeDisk({ 'ders-programi-tumu.json': FULL_BUNDLE });
    // Inside the first 400 ms, before the window's own first save.
    const { box, act, wait } = await launch(disk, () => localStorage.setItem(BASE_KEY, FULL));
    act(() => box.store!.change(() => FULL_STATE));
    await wait(3000);
    expect(writes(disk)).toEqual([]);
    expect(localStorage.getItem(BASE_KEY)).toBe(FULL);
  });
});

describe('exe klasörü · budama yalnız dolu günlükleri sayıyor', () => {
  it('dolu bir yazıdan sonra en yeni on DOLU günlük kalıyor, boşlar sayılmıyor', async () => {
    localStorage.setItem(BASE_KEY, FULL);
    const seed: Record<string, string> = {};
    // The five newest are empty (what the old prune counted), then twelve full.
    for (let b = 1; b <= 5; b++) seed[day(b)] = EMPTY_BUNDLE;
    for (let b = 6; b <= 17; b++) seed[day(b)] = FULL_BUNDLE;
    const disk = fakeDisk(seed);
    await launch(disk);
    const removed = disk.calls.filter((c) => c.startsWith('remove_file')).map((c) => c.slice(12));
    // Today + twelve full = thirteen full: the three oldest full ones go.
    expect(removed.sort()).toEqual([day(17), day(16), day(15)].sort());
    for (let b = 1; b <= 5; b++) expect(disk.files.has(day(b))).toBe(true);
  });

  it('okunamayan günlük sayılmıyor ve silinmiyor', async () => {
    localStorage.setItem(BASE_KEY, FULL);
    const seed: Record<string, string> = { [day(1)]: 'eski' };
    for (let b = 2; b <= 12; b++) seed[day(b)] = FULL_BUNDLE;
    const disk = fakeDisk(seed);
    await launch(disk);
    // Today + eleven full = twelve: two go, both full, the unreadable one stays.
    const removed = disk.calls.filter((c) => c.startsWith('remove_file')).map((c) => c.slice(12));
    expect(removed.sort()).toEqual([day(12), day(11)].sort());
    expect(disk.files.get(day(1))).toBe('eski');
  });
});
