// The exe's folder, judged by running the REAL saveInto() over it.
//
// The temptation was to test the adapter's four methods one by one. That
// would pass forever and prove nothing: what can actually break here is the
// seam — `folder.ts` reaching for a member this object does not have, or the
// two of them disagreeing about a file name. So the thing under test is
// `saveInto`, and the adapter is merely what it is handed.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { desktopFolder, onDesktopClose } from './platform/desktop';
import { MAIN_NAME, dailyName, rescueName, saveInto } from './platform/folder';

/** An in-memory stand-in for src-tauri/src/lib.rs. */
function fakeDisk(seed: string[] = []) {
  const files = new Map<string, string>(seed.map((n) => [n, 'eski']));
  const calls: string[] = [];
  const invoke = (async (cmd: string, args?: Record<string, unknown>) => {
    calls.push(cmd);
    if (cmd === 'write_file') {
      files.set(args!.name as string, args!.text as string);
      return undefined;
    }
    if (cmd === 'list_files') return [...files.keys()];
    if (cmd === 'remove_file') {
      files.delete(args!.name as string);
      return undefined;
    }
    if (cmd === 'data_dir_path') return 'C:\\Users\\baba\\Belgeler\\Ders Programı';
    throw new Error(`bilinmeyen komut: ${cmd}`);
  }) as <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
  return { files, calls, invoke };
}

describe('exe klasörü — folder.ts’in kuralları TEK evde kalıyor', () => {
  it('saftaki saveInto exe adaptörü üstünde olduğu gibi çalışıyor', async () => {
    const disk = fakeDisk();
    const dir = desktopFolder(disk.invoke, 'Ders Programı');
    const when = new Date(2026, 7, 27, 14, 30);

    const result = await saveInto(dir, '{"bundleVersion":1}', when, false);

    // The names come from folder.ts, not from the exe. If the Rust side ever
    // grew its own idea of a file name this would be the test that noticed.
    expect(result.written).toEqual([MAIN_NAME, 'ders-programi-2026-08-27.json']);
    expect(disk.files.get(MAIN_NAME)).toBe('{"bundleVersion":1}');
    expect(disk.files.get(dailyName(when))).toBe('{"bundleVersion":1}');
  });

  it('budama yalnız BU programın yazdığı adlara dokunuyor', async () => {
    // Belgelerim is my father's own folder. A prune that goes by "keep the
    // newest ten" rather than by the name pattern would delete his work, and
    // it would do it silently — folder.ts's rule, measured here through the
    // exe's own listing.
    const older = Array.from(
      { length: 12 },
      (_, i) => `ders-programi-2026-08-${String(i + 1).padStart(2, '0')}.json`,
    );
    const disk = fakeDisk([...older, 'vergi-beyanı.json', 'ders-programi-2026-08-26-1430.json']);
    const dir = desktopFolder(disk.invoke, 'Ders Programı');

    const result = await saveInto(dir, '{}', new Date(2026, 7, 27), true);

    // Twelve seeded plus today's own = thirteen, so the three oldest go.
    expect(result.pruned).toEqual([
      'ders-programi-2026-08-01.json',
      'ders-programi-2026-08-02.json',
      'ders-programi-2026-08-03.json',
    ]);
    expect(disk.files.has('vergi-beyanı.json'), 'babanın kendi dosyası silindi').toBe(true);
    // The top bar's own hourly backup does not match the daily pattern either.
    expect(disk.files.has('ders-programi-2026-08-26-1430.json')).toBe(true);
  });

  it('kurtarma kopyası yazılıyor, sonraki oturum ve budama ona dokunmuyor (VK2)', async () => {
    // Session one: the browser's storage refuses the save, so the folder is
    // the only place the work is. Session two starts from the older storage
    // and writes the live file and today's copy over it, measured by the test
    // session in the exe; the rescue copy has to be out of that path.
    const once = Array.from(
      { length: 12 },
      (_, i) => `ders-programi-2026-08-${String(i + 1).padStart(2, '0')}.json`,
    );
    const disk = fakeDisk(once);
    const dir = desktopFolder(disk.invoke, 'Ders Programı');
    const ilk = new Date(2026, 7, 27, 14, 30, 5);
    const kurtarma = rescueName(ilk);
    expect(kurtarma).toBe('ders-programi-kurtarma-2026-08-27-143005.json');

    const yazilan = await saveInto(dir, 'yeni iş', ilk, false, kurtarma);
    expect(yazilan.written).toEqual([MAIN_NAME, dailyName(ilk), kurtarma]);

    // The next session, an hour later, with the old state and a prune.
    await saveInto(dir, 'eski durum', new Date(2026, 7, 27, 15, 30), true);
    expect(disk.files.get(MAIN_NAME)).toBe('eski durum');
    expect(disk.files.get(kurtarma)).toBe('yeni iş');
  });

  it('adaptör saveInto’nun çağırdığı DÖRT üyeden fazlasını uydurmuyor', async () => {
    // Seeded past the keep limit on purpose: with nothing to prune the
    // delete path never runs and this test would pass while blind to it.
    const disk = fakeDisk(
      Array.from(
        { length: 12 },
        (_, i) => `ders-programi-2020-01-${String(i + 1).padStart(2, '0')}.json`,
      ),
    );
    await saveInto(desktopFolder(disk.invoke, 'X'), '{}', new Date(2026, 7, 27), true);

    // A fifth command appearing here means lib.rs grew an API the page did
    // not need, or folder.ts started reaching past the seam.
    expect([...new Set(disk.calls)].sort()).toEqual(['list_files', 'remove_file', 'write_file']);
  });
});

// TB7. The window is held when it is asked to close, and the page is told; the
// page writes, then says the window may go (src-tauri/src/lib.rs). What can
// break on this side: the answer not sent, sent before the write, or never
// sent because the write failed.
describe('exe penceresi kapanırken sayfayı bekliyor (TB7)', () => {
  afterEach(() => vi.unstubAllGlobals());

  function fakeTauri() {
    const calls: string[] = [];
    let handler: (() => void) | undefined;
    let unlistened = 0;
    vi.stubGlobal('window', {
      __TAURI__: {
        core: {
          invoke: async (cmd: string) => {
            calls.push(cmd);
          },
        },
        event: {
          listen: async (name: string, h: () => void) => {
            calls.push(`listen ${name}`);
            handler = h;
            return () => {
              unlistened++;
            };
          },
        },
      },
    });
    return { calls, fire: () => handler?.(), unlistened: () => unlistened };
  }

  it('önce yazıyor, sonra pencereye kapanabileceğini söylüyor', async () => {
    const tauri = fakeTauri();
    onDesktopClose(async () => {
      await new Promise((r) => setTimeout(r, 20));
      tauri.calls.push('yazıldı');
    });
    await vi.waitFor(() => expect(tauri.calls).toContain('listen kapaniyor'));
    expect(tauri.calls).not.toContain('kapanabilir');
    tauri.fire();
    await vi.waitFor(() => expect(tauri.calls).toContain('kapanabilir'));
    expect(tauri.calls).toEqual(['listen kapaniyor', 'yazıldı', 'kapanabilir']);
  });

  it('yazım hata verse de pencere kapanabiliyor', async () => {
    const tauri = fakeTauri();
    onDesktopClose(() => Promise.reject(new Error('disk dolu')));
    await vi.waitFor(() => expect(tauri.calls).toContain('listen kapaniyor'));
    tauri.fire();
    await vi.waitFor(() => expect(tauri.calls).toContain('kapanabilir'));
  });

  it('abonelik, dinleyici geç kurulsa bile kalkıyor', async () => {
    const tauri = fakeTauri();
    const off = onDesktopClose(() => Promise.resolve());
    off(); // before `listen` has answered
    await vi.waitFor(() => expect(tauri.unlistened()).toBe(1));
  });

  it('exe dışında hiçbir şey yapmıyor', () => {
    vi.stubGlobal('window', {});
    expect(() => onDesktopClose(() => Promise.resolve())()).not.toThrow();
  });

  it('olayın ve komutun adı Rust tarafıyla aynı', () => {
    const rust = readFileSync(
      join(import.meta.dirname, '..', 'src-tauri', 'src', 'lib.rs'),
      'utf8',
    );
    expect(rust).toContain('const KAPANIYOR: &str = "kapaniyor";');
    expect(rust).toMatch(/generate_handler!\[\s*kapanabilir,/);
  });
});
