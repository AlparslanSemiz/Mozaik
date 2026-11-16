// "Eski hâline dön" (Sadeleşme K8): the plan as each of its last days left it,
// kept by itself, bounded, and never in the way of the plan's own save.

import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DAILY_COUNT,
  DAILY_MARK_KEY,
  dailyKey,
  defaultLibrary,
  parseState,
  planKey,
} from '../../pure/io';
import type { State } from '../../leaf/model';

function memoryStorage(limit = Infinity): Storage {
  const map = new Map<string, string>();
  const size = () => [...map.values()].reduce((n, v) => n + v.length, 0);
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
      if (size() - (map.get(k)?.length ?? 0) + v.length > limit) {
        throw new DOMException('dolu', 'QuotaExceededError');
      }
      map.set(k, String(v));
    },
  };
}

function useStorage(limit = Infinity) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage(limit),
    configurable: true,
    writable: true,
  });
}

const FULL = parseState(readFileSync('src/fixtures/tam-dolu-kurs-dizili.json', 'utf8'))!;
const LESS: State = { ...FULL, classes: FULL.classes.slice(1) };
const EMPTY: State = { ...FULL, teachers: [], classes: [], lessons: [], rooms: [] };

/** Noon of 2026-11-`d`, this machine's calendar. */
const day = (d: number) => new Date(2026, 10, d, 12).getTime();
const iso = (d: number) => `2026-11-${String(d).padStart(2, '0')}`;

/** What `useStore`'s write does: keep the day first, then save. */
async function save(id: string, state: State, at: number) {
  const m = await import('./dailyCopies');
  m.keepDay(id, at);
  localStorage.setItem(planKey(id), JSON.stringify(state));
}

beforeEach(() => {
  vi.resetModules();
  useStorage();
});

describe('günlük kopyalar', () => {
  it('yeni günün ilk kaydı, önceki günün planını o günün kopyası yapıyor', async () => {
    await save('1', FULL, day(10));
    await save('1', LESS, day(10));
    expect(localStorage.getItem(dailyKey(iso(10), '1'))).toBeNull();
    expect(JSON.parse(localStorage.getItem(DAILY_MARK_KEY)!)).toEqual({ '1': iso(10) });

    // Two days later: the copy carries the day the plan was last saved on.
    await save('1', FULL, day(12));
    const m = await import('./dailyCopies');
    const copies = m.dailyCopies('1');
    expect(copies.map((c) => c.day)).toEqual([iso(10)]);
    expect(copies[0]!.state.classes.length).toBe(LESS.classes.length);
    expect(JSON.parse(localStorage.getItem(DAILY_MARK_KEY)!)).toEqual({ '1': iso(12) });
  });

  it('boş plan kopyalanmıyor, ilk sürümde hiç gün yokken de kopya yok', async () => {
    localStorage.setItem(planKey('1'), JSON.stringify(FULL));
    await save('1', FULL, day(10)); // no mark yet: the day this text is from is not known
    expect((await import('./dailyCopies')).dailyCopies('1')).toEqual([]);
    await save('1', EMPTY, day(10));
    await save('1', FULL, day(11));
    expect((await import('./dailyCopies')).dailyCopies('1')).toEqual([]);
  });

  it(`her plan için son ${DAILY_COUNT} gün kalıyor, planlar birbirini saymıyor`, async () => {
    for (let d = 1; d <= DAILY_COUNT + 3; d++) {
      await save('1', FULL, day(d));
      await save('b', LESS, day(d));
    }
    const m = await import('./dailyCopies');
    const mine = m.dailyCopies('1').map((c) => c.day);
    expect(mine).toHaveLength(DAILY_COUNT);
    expect(mine[0]).toBe(iso(DAILY_COUNT + 2));
    expect(mine[mine.length - 1]).toBe(iso(3));
    expect(m.dailyCopies('b')).toHaveLength(DAILY_COUNT);
  });

  it('geri dönmeden önce şimdiki hâl bugünün kopyası oluyor ve günün sonu onun üstüne yazmıyor', async () => {
    await save('1', FULL, day(10));
    await save('1', FULL, day(11)); // 10th kept
    const m = await import('./dailyCopies');
    expect(m.keepToday('1', LESS, day(11))).toBe(true);
    expect(m.keepToday('1', FULL, day(11))).toBe(false); // today has one
    await save('1', FULL, day(12)); // the 11th's end would be FULL
    const copies = (await import('./dailyCopies')).dailyCopies('1');
    expect(copies.map((c) => c.day)).toEqual([iso(11), iso(10)]);
    expect(copies[0]!.state.classes.length).toBe(LESS.classes.length);
  });

  it('okunamayan kopya listelenmiyor', async () => {
    localStorage.setItem(dailyKey(iso(9), '1'), '{bozuk');
    await save('1', FULL, day(10));
    await save('1', FULL, day(11));
    expect((await import('./dailyCopies')).dailyCopies('1').map((c) => c.day)).toEqual([iso(10)]);
  });
});

describe('dolu depo: plan önce gelir', () => {
  it('sığmayan kopya yalnız eski kopyaları siler, başka hiçbir anahtarı', async () => {
    const one = JSON.stringify(FULL).length;
    useStorage(one * 3.5);
    localStorage.setItem('ders-programi-tema', 'koyu');
    localStorage.setItem(dailyKey(iso(1), 'b'), JSON.stringify(FULL));
    localStorage.setItem(dailyKey(iso(2), '1'), JSON.stringify(FULL));
    await save('1', FULL, day(3));
    await save('1', FULL, day(4)); // the 3rd's copy needs a plan's room
    const m = await import('./dailyCopies');
    expect(m.dailyCopies('1').map((c) => c.day)).toContain(iso(3));
    expect(localStorage.getItem(dailyKey(iso(1), 'b'))).toBeNull(); // the oldest went
    expect(localStorage.getItem('ders-programi-tema')).toBe('koyu');
    expect(localStorage.getItem(planKey('1'))).not.toBeNull();
  });

  it('planın reddedilen kaydı kopyaları en eskiden başlayarak siliyor ve yazılıyor', async () => {
    const one = JSON.stringify(FULL).length;
    useStorage(one * 3.5);
    localStorage.setItem(dailyKey(iso(1), '1'), JSON.stringify(FULL));
    localStorage.setItem(dailyKey(iso(2), '1'), JSON.stringify(FULL));
    localStorage.setItem(dailyKey(iso(3), '1'), JSON.stringify(LESS));
    const store = await import('./libraryStore');
    // A fresh key: the plan is new, so nothing stands in its way but room.
    expect(store.writePlanText('1', JSON.stringify(FULL))).toBe(true);
    expect(localStorage.getItem(dailyKey(iso(1), '1'))).toBeNull();
    expect(localStorage.getItem(dailyKey(iso(3), '1'))).not.toBeNull();
  });
});

describe('Veriler nerede', () => {
  it('her kopyayı ve gün kaydını sayıyor', async () => {
    await save('1', FULL, day(10));
    await save('1', FULL, day(11));
    const { storageReport } = await import('./storageReport');
    const keys = storageReport(defaultLibrary()).rows.map((r) => r.key);
    expect(keys).toContain(dailyKey(iso(10), '1'));
    expect(keys).toContain(DAILY_MARK_KEY);
  });
});
