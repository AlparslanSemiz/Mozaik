// The language machine, and the one thing a dictionary cannot be trusted about
// on its own: whether it still matches the source.
//
// Using Turkish sentences as keys buys readable JSX and a fallback that is
// correct rather than cryptic. What it costs is drift — edit the Turkish copy
// and its translation is silently orphaned. That cost is paid HERE: the last
// test in this file reads `src/` and fails on any English entry nothing asks
// for any more.

import { describe, expect, it, beforeEach } from 'vitest';
import {
  DILLER,
  DIL_ADI,
  LANG_KEY,
  normalizeDil,
  slotsOf,
  sozlukOf,
  systemDil,
  translate,
} from './i18n';
import './lang/en';

describe('normalizeDil', () => {
  it('bildiği dili aynen alıyor', () => {
    expect(normalizeDil('tr', 'en')).toBe('tr');
    expect(normalizeDil('en', 'tr')).toBe('en');
  });

  // The same shape as pitfall 43: "nothing stored" and "somebody typed junk
  // into localStorage" are different questions, and both of them mean "ask the
  // device" rather than "pick a language for them".
  it('tanımadığı her şey CİHAZIN diline düşüyor — boş, null ve saçma dahil', () => {
    for (const junk of [null, undefined, '', 'de', 'tr-TR', 42, {}]) {
      expect(normalizeDil(junk, 'en'), String(junk)).toBe('en');
    }
  });
});

describe('systemDil', () => {
  const gerçek = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  function pretend(language: string | undefined) {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language },
      configurable: true,
      writable: true,
    });
  }

  beforeEach(() => {
    if (gerçek !== undefined) Object.defineProperty(globalThis, 'navigator', gerçek);
  });

  it('BCP 47 etiketinin yalnız ilk parçasına bakıyor', () => {
    pretend('tr-TR');
    expect(systemDil()).toBe('tr');
    pretend('en-GB');
    expect(systemDil()).toBe('en');
    pretend('EN-us');
    expect(systemDil()).toBe('en');
  });

  it('konuşamadığı dilde Türkçeye düşüyor — tam sözlüğü olan tek dil o', () => {
    pretend('fr-FR');
    expect(systemDil()).toBe('tr');
    pretend(undefined);
    expect(systemDil()).toBe('tr');
  });
});

describe('translate', () => {
  it('Türkçede anahtarın KENDİSİNİ döndürüyor — kaynak dil çevrilmez', () => {
    // This is what makes converting a file a no-op on the Turkish screen: the
    // whole suite stays byte-identical while the code moves to t().
    expect(translate('tr', 'Öğretmenler')).toBe('Öğretmenler');
    expect(translate('tr', 'hiç var olmamış bir cümle')).toBe('hiç var olmamış bir cümle');
  });

  it('İngilizcede sözlüğü kullanıyor, bilmediğinde ANAHTARA düşüyor', () => {
    expect(translate('en', 'Kurulum')).toBe('Setup');
    // The failure mode of an unfinished dictionary: this line is still in
    // Turkish. Not a key name printed on my father's screen.
    expect(translate('en', 'çevrilmemiş bir cümle')).toBe('çevrilmemiş bir cümle');
  });

  it('yuvaları çeviriden SONRA dolduruyor — sıra dile göre değişir', () => {
    expect(translate('tr', '{n} öğretmen', { n: 25 })).toBe('25 öğretmen');
    expect(translate('tr', '{a} ve {b}', { a: 'x', b: 'y' })).toBe('x ve y');
  });

  // A visible {room} on screen is a bug report; an empty gap is a sentence that
  // reads fine and says the wrong thing.
  it('tanımadığı yuvayı BOŞALTMIYOR, olduğu gibi bırakıyor', () => {
    expect(translate('tr', '{a} ve {b}', { a: 'x' })).toBe('x ve {b}');
  });
});

describe('diller', () => {
  it('her dil kendi adını KENDİ dilinde söylüyor', () => {
    // A language menu is read by somebody who does not yet speak the language
    // the app is currently in.
    for (const d of DILLER) expect(DIL_ADI[d]).toBeTruthy();
    expect(DIL_ADI.tr).toBe('Türkçe');
    expect(DIL_ADI.en).toBe('English');
  });

  it('anahtar TÜRKÇE — kullanıcı verisidir, koda çevrilmez', () => {
    expect(LANG_KEY).toBe('ders-programi-dil');
  });
});

// ---------------------------------------------------------------- the drift

// Read through VITE, not through node:fs, and that is not a style choice.
// `tsconfig.json` deliberately keeps Node's globals out of `src/` (see
// `raw.d.ts`): a stray `process` compiling silently in a file that ships to a
// browser is exactly what that setting exists to prevent, and a test file is
// still inside `src/`. `import.meta.glob` is Vite's own reader and needs
// nothing added to the type surface.
const SOURCE = import.meta.glob('./**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('sözlük kaynakla aynı şeyi konuşuyor', () => {
  const source = Object.entries(SOURCE)
    .filter(
      ([p]) => !p.includes('.test.') && !p.startsWith('./lang/') && !p.endsWith('worlds.ts'),
    )
    .map(([, text]) => text as string)
    .join('\n');

  const en = sozlukOf('en') ?? {};

  it('İngilizce sözlükte ÖLÜ anahtar yok', () => {
    // The price of using sentences as keys: editing the Turkish copy orphans
    // its translation, and nothing else would ever say so.
    const dead = Object.keys(en).filter((key) => !source.includes(key));
    expect(dead, `kaynakta bulunmayan anahtar:\n${dead.join('\n')}`).toEqual([]);
  });

  it('her çevirinin yuvaları anahtarınkilerle AYNI', () => {
    // Order may change between languages; the SET may not. A translation that
    // drops {n} silently prints a sentence with a number missing from it.
    const wrong: string[] = [];
    for (const [key, phrase] of Object.entries(en)) {
      const a = [...new Set(slotsOf(key))].sort();
      const b = [...new Set(slotsOf(phrase))].sort();
      if (a.join(',') !== b.join(',')) wrong.push(`${key}\n  → ${phrase}`);
    }
    expect(wrong, wrong.join('\n')).toEqual([]);
  });

  it('her çeviride ** dengeli — yoksa <T> cümlenin yarısını yutar', () => {
    const odd = Object.entries(en)
      .filter(([, phrase]) => (phrase.split('**').length - 1) % 2 !== 0)
      .map(([key]) => key);
    expect(odd, odd.join('\n')).toEqual([]);
  });
});
