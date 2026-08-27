// The theme is the only setting stored outside `State`. If a stored value is
// junk the page must still get a theme — an unthemed page shows unstyled
// colours, which for this tool means the drag feedback is unreadable.

import { describe, expect, it } from 'vitest';
import {
  normalizeAvailClock,
  normalizeRibbonAuto,
  normalizeDensity,
  normalizeMotion,
  normalizeScale,
  normalizeDockHeight,
  DOCK_H_MIN,
  DOCK_H_MAX,
  DOCK_H_DEFAULT,
  DOCK_H_STEP,
  normalizeSidebar,
  normalizeTheme,
  SCALE_MAX,
  SCALE_MIN,
  SCALE_DEFAULT,
  SCALE_STEP,
} from './theme';

describe('normalizeTheme', () => {
  it('kayıtlı geçerli tercih olduğu gibi kullanılır', () => {
    expect(normalizeTheme('dark')).toBe('dark');
    expect(normalizeTheme('light')).toBe('light');
  });

  it('kayıt yoksa AÇIK — sistem tercihine bakılmaz', () => {
    expect(normalizeTheme(null)).toBe('light');
    expect(normalizeTheme(undefined)).toBe('light');
  });

  it('bozuk değer açığa düşer, çökmez', () => {
    for (const junk of ['', 'DARK', 'koyu', '{}', 0, undefined, {}, []]) {
      expect(normalizeTheme(junk)).toBe('light');
    }
  });
});

// The rail width is stored like the theme: a property of the machine, never of
// the timetable. Anything unrecognised must leave the rail OPEN — a collapsed
// rail on a first run would hide the names of all six sections.
describe('normalizeSidebar', () => {
  it("yalnız 'dar' daraltıyor", () => {
    expect(normalizeSidebar('dar')).toBe(true);
    expect(normalizeSidebar('genis')).toBe(false);
  });

  it('bozuk veya eksik değer geniş bırakıyor', () => {
    for (const junk of [null, '', 'DAR', 'true', 1, undefined, {}, []]) {
      expect(normalizeSidebar(junk)).toBe(false);
    }
  });
});

describe('normalizeScale', () => {
  it('yasal değerleri aynen geçirir', () => {
    for (const value of [1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5]) {
      expect(normalizeScale(String(value))).toBe(value);
    }
  });

  it('aralık dışını sınıra çeker', () => {
    expect(normalizeScale('0.2')).toBe(SCALE_MIN);
    expect(normalizeScale('3')).toBe(SCALE_MAX);
    expect(normalizeScale('-4')).toBe(SCALE_MIN);
  });

  it('basamak dışı bir değeri en yakın basamağa oturtur', () => {
    expect(normalizeScale('1.07')).toBe(1.05);
    expect(normalizeScale('1.13')).toBe(1.15);
  });

  it('okunamayan her şey VARSAYILAN olur, taban değil', () => {
    // "Tercih yok" ile "biri depoya saçma bir şey yazmış" aynı cevabı verir ve
    // o cevap tabana değil varsayılana oturur — ikisi ancak varsayılan tabana
    // eşitken aynı görünüyordu (tuzak 43'ün akrabası).
    for (const junk of [null, undefined, '', 'büyük', {}, NaN, [], true]) {
      expect(normalizeScale(junk)).toBe(SCALE_DEFAULT);
    }
    // Ama okunabilen bir sayı hâlâ SINIRA çekilir, varsayılana değil.
    expect(normalizeScale('0.2')).toBe(SCALE_MIN);
    expect(normalizeScale('0')).toBe(SCALE_MIN);
  });

  // Binary floating point: 1 + 0.05 * 3 is 1.1500000000000001, and a value that
  // does not survive String() -> normalizeScale() would be written back to
  // localStorage differently on every reload.
  it('gidiş dönüşte kaymaz', () => {
    let value = SCALE_MIN;
    // Derived from the constants, not written out: the ladder's length is a
    // consequence of the floor, the ceiling and the step, and a hard-coded 6
    // silently stopped walking the ladder the day the ceiling moved to 1.5.
    const rungs = Math.round((SCALE_MAX - SCALE_MIN) / SCALE_STEP);
    for (let i = 0; i < rungs; i += 1) {
      expect(normalizeScale(String(value))).toBe(value);
      value = normalizeScale(String(value + SCALE_STEP));
    }
    expect(value).toBe(SCALE_MAX);
  });
});

describe('normalizeDensity', () => {
  it('üç basamağın üçü de tanınıyor', () => {
    expect(normalizeDensity('sigdir')).toBe('sigdir');
    expect(normalizeDensity('ferah')).toBe('ferah');
    expect(normalizeDensity('rahat')).toBe('rahat');
  });

  // The default has to be the grid my father already knows. A junk value that
  // fell through to "sigdir" would hide the bell times on his screen with no
  // visible cause and no obvious way back.
  it('okunamayan her şey rahat ızgaradır', () => {
    for (const junk of [null, undefined, '', 'rahat', 'Sığdır', 'SIGDIR', 'Ferah', {}, 1, [], true]) {
      expect(normalizeDensity(junk)).toBe('rahat');
    }
  });
});

describe('normalizeDockHeight', () => {
  it('bir değeri olduğu gibi geri verir', () => {
    expect(normalizeDockHeight('11')).toBe(11);
    expect(normalizeDockHeight('7.5')).toBe(7.5);
  });

  it('aralığın dışını kırpar', () => {
    expect(normalizeDockHeight('0')).toBe(DOCK_H_MIN);
    expect(normalizeDockHeight('-9')).toBe(DOCK_H_MIN);
    expect(normalizeDockHeight('999')).toBe(DOCK_H_MAX);
  });

  it('adıma yuvarlar', () => {
    expect(normalizeDockHeight('11.1')).toBe(11);
    expect(normalizeDockHeight('11.2')).toBe(11.25);
  });

  // The splitter commits a NUMBER and localStorage returns a STRING. The first
  // version of this guard only admitted strings, so every drag was written back
  // as the default and the drawer forgot its height on reload.
  it('sayıyı da kabul eder, dizeyi de', () => {
    expect(normalizeDockHeight(17.5)).toBe(17.5);
    expect(normalizeDockHeight(99)).toBe(DOCK_H_MAX);
    expect(normalizeDockHeight(0)).toBe(DOCK_H_MIN);
    expect(normalizeDockHeight(Number.NaN)).toBe(DOCK_H_DEFAULT);
  });

  it('okunamayan her şeye varsayılanı verir', () => {
    for (const junk of ['', 'orta', 'NaN', null, undefined, {}]) {
      expect(normalizeDockHeight(junk)).toBe(DOCK_H_DEFAULT);
    }
  });

  // The same round-trip guard the scale has: a value that does not survive
  // String() -> normalizeDockHeight() would drift a step on every reload.
  it('depoya yazılıp geri okunduğunda kaymaz', () => {
    let value = DOCK_H_MIN;
    while (value < DOCK_H_MAX) {
      expect(normalizeDockHeight(String(value))).toBe(value);
      value = normalizeDockHeight(String(value + DOCK_H_STEP));
    }
    expect(value).toBe(DOCK_H_MAX);
  });
});

describe('normalizeRibbonAuto', () => {
  // The OPPOSITE default to normalizeAvailClock, and on purpose: this gesture
  // already existed before it had a key, so a reader who has never opened the
  // setting must keep what they have. That makes "absent" mean ON, which is
  // the case worth pinning — `null` must not fall through the same door as
  // `'kapali'` (pitfall 43: "not stored" and "stored as off" are two facts).
  it('kaydı olmayan makinede AÇIK', () => {
    expect(normalizeRibbonAuto(null)).toBe(true);
    expect(normalizeRibbonAuto(undefined)).toBe(true);
    expect(normalizeRibbonAuto('')).toBe(true);
  });

  it('yalnız "kapali" kapatır', () => {
    expect(normalizeRibbonAuto('kapali')).toBe(false);
    expect(normalizeRibbonAuto('acik')).toBe(true);
    expect(normalizeRibbonAuto('saçma')).toBe(true);
  });

  // Called from two directions — a string out of localStorage and a boolean
  // out of the settings button — so it has to be tried with BOTH types
  // (pitfall 44: a guard written for one caller silently rejects the other).
  it('boolean de kabul ediyor', () => {
    expect(normalizeRibbonAuto(true)).toBe(true);
    expect(normalizeRibbonAuto(false)).toBe(false);
  });
});

describe('normalizeAvailClock', () => {
  // The reader asked for this one to default OFF, so "absent" and "anything
  // unreadable" both have to mean off — and only the exact stored string may
  // turn it on.
  it('yalnız "acik" açık demektir', () => {
    expect(normalizeAvailClock('acik')).toBe(true);
  });

  it('okunamayan her şey KAPALI', () => {
    for (const junk of [null, undefined, '', 'kapali', 'Acik', 'ACIK', true, 1, {}, []]) {
      expect(normalizeAvailClock(junk)).toBe(false);
    }
  });
});

describe('normalizeMotion', () => {
  it('kayıtlı geçerli tercih olduğu gibi kullanılır', () => {
    expect(normalizeMotion('tam', true)).toBe('tam');
    expect(normalizeMotion('az', false)).toBe('az');
    expect(normalizeMotion('kapali', false)).toBe('kapali');
  });

  it('kayıt yoksa sistem tercihine düşer', () => {
    // A button reading "Tam" on a machine where nothing moves would be a lie,
    // so the FIRST read follows the machine — exactly like the theme.
    expect(normalizeMotion(null, true)).toBe('kapali');
    expect(normalizeMotion(null, false)).toBe('tam');
  });

  it('bozuk değer sistem tercihine düşer, çökmez', () => {
    // Pitfall 43/44: `Number('')` is 0 and `null` is a value too. This
    // normalizer is string-only, but the junk list is the same one every other
    // reader in this file is tested against.
    for (const junk of ['', 'TAM', 'KAPALI', 'off', 'reduce', '{}', 0, 1, undefined, {}, []]) {
      expect(normalizeMotion(junk, true)).toBe('kapali');
      expect(normalizeMotion(junk, false)).toBe('tam');
    }
  });
});
