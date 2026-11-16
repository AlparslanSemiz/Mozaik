// The two PURE halves of folder.ts. Everything else in that file is browser
// plumbing and is judged by e2e/klasor.spec.ts instead.
//
// These two are here because they are the two that can lose someone's work:
// a name that files a backup under the wrong day, and a prune that deletes a
// file this program did not write.

import { describe, expect, it, vi } from 'vitest';
import {
  beforeDeleteName,
  dailyName,
  holdsWork,
  KEEP_DAILY,
  largest,
  MAIN_NAME,
  prunable,
  shrinkName,
  shrinks,
  sparePrunable,
  workOf,
} from './folder';

describe('dailyName', () => {
  it('ay ve gün iki basamak', () => {
    expect(dailyName(new Date(2026, 0, 5, 14, 30))).toBe('ders-programi-2026-01-05.json');
    expect(dailyName(new Date(2026, 11, 31, 23, 59))).toBe('ders-programi-2026-12-31.json');
  });

  it('YEREL günü kullanıyor, UTC gününü değil', () => {
    // Türkiye UTC+3. Gecenin 01:00'ında ISO tarihi HÂLÂ dün, ve yanlış güne
    // dosyalanmış bir yedek kimsenin bulamadığı yedektir.
    //
    // The zone is set here, not taken from the machine: on a UTC runner the
    // two days are the same day and the test below has nothing to tell apart.
    vi.stubEnv('TZ', 'Europe/Istanbul');
    try {
      const gece = new Date(2026, 7, 26, 1, 0); // 26 Ağustos 01:00, yerel
      expect(dailyName(gece)).toBe('ders-programi-2026-08-26.json');
      expect(gece.toISOString().slice(0, 10)).not.toBe('2026-08-26'); // hatanın kendisi
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('ana dosyanın adıyla çakışmıyor', () => {
    expect(dailyName(new Date())).not.toBe(MAIN_NAME);
  });

  it('ÖNEK `ders-programi` — program Mozaik olsa da dosyalar öyle kalıyor', () => {
    // A DATA DECISION, and the one test that says so. The program is called
    // Mozaik; the keys, the backup names and the Documents folder kept their
    // old names on purpose, because renaming them makes what my father
    // already has invisible (docs/TRAPS.md, pitfall 95).
    //
    // Here it costs more than a name: `prunable` decides what to delete by
    // MATCHING this pattern, and the folder it runs in is Belgelerim, next to
    // his own files. A renamed prefix means the old generation stops matching
    // — it is never pruned, it piles up, and the previous main file is left
    // orphaned in there with nothing pointing at it.
    //
    // It was almost lost the cheap way: a round renamed the string in
    // e2e/exe.spec.ts alone, and three tests went red against code that was
    // right. Nothing in the unit suite would have caught the reverse.
    expect(MAIN_NAME).toBe('ders-programi-tumu.json');
    expect(dailyName(new Date(2026, 7, 31))).toBe('ders-programi-2026-08-31.json');
  });
});

describe('prunable', () => {
  const gunler = (n: number) =>
    Array.from({ length: n }, (_, i) => dailyName(new Date(2026, 7, i + 1)));

  it('tam sınırda hiçbir şey silinmiyor', () => {
    expect(prunable(gunler(KEEP_DAILY))).toEqual([]);
  });

  it('bir fazlada EN ESKİSİ gidiyor', () => {
    const hepsi = gunler(KEEP_DAILY + 1);
    expect(prunable(hepsi)).toEqual(['ders-programi-2026-08-01.json']);
  });

  it('sırası karışık gelse de tarihe göre siliyor', () => {
    const karisik = [...gunler(13)].reverse();
    expect(prunable(karisik)).toEqual([
      'ders-programi-2026-08-01.json',
      'ders-programi-2026-08-02.json',
      'ders-programi-2026-08-03.json',
    ]);
  });

  it('BAŞKASININ dosyalarına dokunmuyor — bu fonksiyonun asıl işi', () => {
    // Seçilecek klasör Belgelerim olacak, yani babamın kendi dosyalarının
    // yanı. "En yenisi hariç hepsini sil" onun işini silerdi, sessizce.
    const yabanci = [
      'vergi-2019.pdf',
      'Yeni Microsoft Word Belgesi.docx',
      'ders-programi.json', // eski elle indirilmiş yedek — tarih YOK
      'ders-programi-tumu.json', // ana dosyanın kendisi
      'ders-programi-2026-08-26-1430.json', // üst çubuğun saatli yedeği
      'ders-programi-2026-8-1.json', // iki basamaksız — bizim yazdığımız değil
    ];
    expect(prunable([...yabanci, ...gunler(20)])).toHaveLength(10);
    expect(
      prunable([...yabanci, ...gunler(20)]).every((n) => n.startsWith('ders-programi-2026-08-')),
    ).toBe(true);
    expect(prunable(yabanci)).toEqual([]);
  });

  it('ana dosya asla silinmiyor', () => {
    expect(prunable([MAIN_NAME, ...gunler(30)])).not.toContain(MAIN_NAME);
  });

  it('keep=0 hepsini siler ama yalnız bizimkileri', () => {
    expect(prunable(['a.txt', ...gunler(3)], 0)).toEqual(gunler(3));
  });
});

// A2 (the audit of 2026-10-24): the prune counted every daily, and an empty
// start put an empty backup among the ten, so one full backup went each day.
describe('prunable · yalnız dolu günlükler sayılıyor', () => {
  const ad = (gun: number) => `ders-programi-2026-08-${String(gun).padStart(2, '0')}.json`;

  it('boş günlükler ona sayılmıyor: en yeni on DOLU kalıyor', () => {
    // 1..12 full, 13..17 empty and newer.
    const names = Array.from({ length: 17 }, (_, i) => ad(i + 1));
    const full = (n: string) => n < ad(13);
    expect(prunable(names, KEEP_DAILY, full)).toEqual([ad(1), ad(2)]);
  });

  it('on dolu yoksa hiçbir şey silinmiyor', () => {
    const names = Array.from({ length: 20 }, (_, i) => ad(i + 1));
    expect(prunable(names, KEEP_DAILY, (n) => n === ad(20))).toEqual([]);
  });

  it('ölçüt verilmezse eskisi gibi: her günlük dolu sayılıyor', () => {
    const names = Array.from({ length: 12 }, (_, i) => ad(i + 1));
    expect(prunable(names)).toEqual([ad(1), ad(2)]);
  });
});

describe('holdsWork', () => {
  const bundle = (state: unknown) =>
    JSON.stringify({ bundleVersion: 1, plans: [{ id: '1', name: 'x', draft: false, state }] });

  it('bir öğretmen, sınıf, ders ya da derslik varsa dolu', () => {
    for (const list of ['teachers', 'classes', 'lessons', 'rooms', 'ogretmenler']) {
      expect(holdsWork(bundle({ [list]: [{}] })), list).toBe(true);
    }
  });

  it('dört liste de boşsa boş, paket değilse ya da okunamıyorsa null', () => {
    expect(holdsWork(bundle({ teachers: [], classes: [], lessons: [], rooms: [] }))).toBe(false);
    expect(holdsWork('{"bundleVersion":1}')).toBeNull();
    expect(holdsWork('eski')).toBeNull();
    expect(holdsWork('null')).toBeNull();
  });
});

// The audit of 2026-11-16: one-teacher backups counted as full and pushed out
// every real one. The fullest daily is spared, and a sharp shrink is told.
describe('largest · prunable(spare)', () => {
  const ad = (d: number) => dailyName(new Date(2026, 9, d));

  it('en dolu günlüğü, eşitlerde en yenisini seçiyor; boşları değil', () => {
    const sizes = new Map([
      [ad(1), 400],
      [ad(2), 400],
      [ad(3), 1],
      [ad(4), 0],
    ]);
    expect(largest(sizes)).toBe(ad(2));
    expect(largest(new Map([[ad(1), 0]]))).toBeNull();
  });

  it('on küçük günlükten sonra bile en dolu günlük silinmiyor', () => {
    const names = Array.from({ length: 21 }, (_, i) => ad(i + 1));
    const old = prunable(names, KEEP_DAILY, () => true, ad(10));
    expect(old).not.toContain(ad(10));
    expect(old).toEqual(
      Array.from({ length: 11 }, (_, i) => ad(i + 1)).filter((n) => n !== ad(10)),
    );
  });
});

describe('workOf · shrinks', () => {
  const bundle = (...states: unknown[]) =>
    JSON.stringify({
      bundleVersion: 1,
      plans: states.map((state, i) => ({ id: String(i), name: 'x', draft: false, state })),
    });

  it('dört listeyi, öğretmeni, dersi ve her seçeneğin yerleşimini sayıyor', () => {
    const today = {
      teachers: [{}, {}],
      classes: [{}],
      lessons: [{}, {}, {}],
      rooms: [],
      programs: [{ placements: { a: 1, b: 1 } }, { placements: { c: 1 } }],
    };
    const v1 = { ogretmenler: [{}], dersler: [{}], yerlesim: { x: 1 } };
    expect(workOf(bundle(today, v1))).toEqual({ lists: 8, teachers: 3, lessons: 4, placed: 4 });
    expect(workOf('eski')).toBeNull();
  });

  it('yarının altı keskin küçülme; yerleşimin gitmesi değil', () => {
    const w = (lists: number, placed = 0) => ({ lists, teachers: 0, lessons: 0, placed });
    expect(shrinks(w(152), w(1))).toBe(true);
    expect(shrinks(w(152), w(76))).toBe(false);
    expect(shrinks(w(152, 600), w(152, 0))).toBe(false); // Programı boşalt
    expect(shrinks(null, w(1))).toBe(false);
  });
});

describe('yeni dosya adları', () => {
  it('kurtarma ve silmeden-önce dosyaları budama kalıbına uymuyor', () => {
    const now = new Date(2026, 10, 16, 14, 30, 5);
    expect(shrinkName(now)).toBe('ders-programi-kurtarma-2026-11-16.json');
    expect(beforeDeleteName(now)).toBe('ders-programi-silmeden-once-2026-11-16.json');
    expect(prunable([shrinkName(now), beforeDeleteName(now)], 0)).toEqual([]);
  });
});

describe('sparePrunable', () => {
  const gun = (d: number) => `2026-10-${String(d).padStart(2, '0')}`;
  const kurtarma = (d: number) => `ders-programi-kurtarma-${gun(d)}.json`;
  const oturum = (d: number) => `ders-programi-kurtarma-${gun(d)}-101010.json`;
  const once = (d: number) => `ders-programi-silmeden-once-${gun(d)}.json`;

  it('her türün en yeni onu kalıyor, gerisi en eskiden', () => {
    const names = [12, 3, 5, 1, 7, 9, 2, 11, 4, 8, 6, 10].map(once);
    expect(sparePrunable(names)).toEqual([once(1), once(2)]);
    // Session copies and the day's shrink file are counted apart: eleven
    // sessions push out one session copy, never a shrink file.
    const k = [...[1, 2, 3].map(kurtarma), ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(oturum)];
    expect(sparePrunable(k)).toEqual([oturum(1)]);
    expect(sparePrunable([...names, ...k]).length).toBe(3);
  });

  it('en yenisi hiç silinmiyor, sınırın altında hiçbir şey', () => {
    expect(sparePrunable([once(1), once(2)], 0)).toEqual([once(1)]);
    expect(sparePrunable([1, 2, 3].map(kurtarma))).toEqual([]);
  });

  it('başkasının dosyalarına, günlüğe ve canlı dosyaya dokunmuyor', () => {
    const names = [
      MAIN_NAME,
      'ders-programi-2026-10-01.json',
      'ders-programi-kurtarma-2026-10-01-1010.json',
      'ders-programi-silmeden-once-2026-10-01.json.tmp',
      'babamin-kurtarma-2026-10-01.json',
      'ders-programi-kurtarma-notlar.json',
    ];
    expect(sparePrunable(names, 0)).toEqual([]);
  });
});
