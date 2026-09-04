// @vitest-environment jsdom
//
// jsdom rather than node, and for exactly one function: `applyDil` writes
// <html lang>, which is what a screen reader picks a voice from. Testing it
// without a document would mean testing something else.

// The language machine, and the one thing a dictionary cannot be trusted about
// on its own: whether it still matches the source.
//
// Using Turkish sentences as keys buys readable JSX and a fallback that is
// correct rather than cryptic. What it costs is drift — edit the Turkish copy
// and its translation is silently orphaned. That cost is paid HERE: the last
// test in this file reads `src/` and fails on any English entry nothing asks
// for any more.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  aktifDil,
  applyDil,
  DILLER,
  DIL_ADI,
  LANG_KEY,
  normalizeDil,
  pluralSlotsOf,
  setAktifDil,
  slotsOf,
  sozlukOf,
  systemDil,
  t,
  translate,
} from './i18n';
import { dayLabel, shortDay, subjectLabel, subjectShort } from './entities';
import type { Settings } from './types';
import './i18n/lang/en';
import './i18n/lang/de';
import './i18n/lang/es';
import './i18n/lang/fr';

describe('normalizeDil', () => {
  it('bildiği dili aynen alıyor', () => {
    for (const d of DILLER) expect(normalizeDil(d, 'tr')).toBe(d);
  });

  // The same shape as pitfall 43: "nothing stored" and "somebody typed junk
  // into localStorage" are different questions, and both of them mean "ask the
  // device" rather than "pick a language for them".
  it('tanımadığı her şey CİHAZIN diline düşüyor — boş, null ve saçma dahil', () => {
    for (const junk of [null, undefined, '', 'ru', 'tr-TR', 42, {}]) {
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

  it('beş dilin beşini de tanıyor', () => {
    for (const d of DILLER) {
      pretend(`${d}-XX`);
      expect(systemDil(), d).toBe(d);
    }
  });

  // The decision recorded in TASKS and taken now that all five dictionaries
  // are complete: a reader whose device speaks none of them is better served
  // by the one the most people have a second chance with.
  it('konuşamadığı dilde İNGİLİZCEYE düşüyor', () => {
    pretend('ru-RU');
    expect(systemDil()).toBe('en');
    pretend(undefined);
    expect(systemDil()).toBe('en');
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
    expect(translate('en', 'Okul')).toBe('School');
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
    expect(DIL_ADI.de).toBe('Deutsch');
    expect(DIL_ADI.es).toBe('Español');
    expect(DIL_ADI.fr).toBe('Français');
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

/**
 * The source with its COMMENTS taken out — pitfall 87, and the reason this
 * function exists rather than a `join('\n')`.
 *
 * The dead-key scanner asks `source.includes(key)`, and the comments in this
 * project are long, English, and full of quoted Turkish interface text. So
 * renaming `Kurulum` to `Okul` left `'Kurulum': 'Setup'` in the dictionary and
 * the scanner found the word — in fifteen comments explaining what the tab used
 * to be called. It stayed green over a genuinely dead key. Strings survive,
 * comments do not.
 */
function stripComments(text: string): string {
  let out = '';
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i]!;
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
    } else if (c === '/' && text[i + 1] === '/') {
      const end = text.indexOf('\n', i);
      i = end === -1 ? n : end;
    } else if (c === "'" || c === '"' || c === '`') {
      // A quote runs to its own unescaped twin. Template literals may hold a
      // `${...}` with anything in it, which is fine: everything inside a
      // string is KEPT anyway, comments included, so no nesting is needed.
      out += c;
      i += 1;
      while (i < n && text[i] !== c) {
        if (text[i] === '\\') {
          out += text[i]! + (text[i + 1] ?? '');
          i += 2;
          continue;
        }
        out += text[i];
        i += 1;
      }
      out += text[i] ?? '';
      i += 1;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

describe('sözlükler kaynakla aynı şeyi konuşuyor', () => {
  // The paths that survive the filter, held as their own value so the FILTER
  // can be measured. Until now it could not be, and that gap had teeth: the
  // dictionaries are excluded by a path PREFIX, so when `lang/` moved under
  // `i18n/` the prefix stopped matching and every dictionary counted as
  // "source". Every key is then trivially "found in the source", and the dead
  // key scanner below goes green forever over real rot.
  //
  // Measured, not argued (2026-09-05): with the stale prefix a deliberately
  // dead key passed 40/40; with the prefix corrected the same key failed by
  // name. The guard below is what keeps the filter from silently widening
  // again, because a path filter with nothing measuring it is a wish.
  const TARANAN = Object.keys(SOURCE).filter(
    (p) => !p.includes('.test.') && !p.startsWith('./i18n/lang/') && !p.endsWith('worlds.ts'),
  );

  const source = TARANAN.map((p) => stripComments(SOURCE[p] as string)).join(String.fromCharCode(10));

  it('taranan kaynak SÖZLÜKLERİ dışarıda bırakıyor, ekranları bırakmıyor', () => {
    // A dictionary in here means every key finds itself.
    expect(TARANAN.filter((p) => p.includes('/lang/'))).toEqual([]);
    // ...and an empty-ish set would do the same thing from the other side.
    expect(TARANAN.length).toBeGreaterThan(100);
    expect(TARANAN.some((p) => p.endsWith('/setup/Teachers.tsx'))).toBe(true);
  });

  const CEVIRILER = DILLER.filter((d) => d !== 'tr').map(
    (d) => [d, sozlukOf(d) ?? {}] as const,
  );

  it('yorum ayıklayıcı DİZGEYİ bırakıyor, YORUMU alıyor', () => {
    // The scanner is what judges every dictionary below it, so it is judged
    // first — pitfall 23. Without this, a broken stripper would make every
    // dead-key test below pass for free.
    const stripped = stripComments(
      ["// 'Kurulum' bir yorumda", "const a = 'Okul';", '/* Kurulum */', 'const b = `Çıktı`;'].join(
        '\n',
      ),
    );
    expect(stripped).toContain('Okul');
    expect(stripped).toContain('Çıktı');
    expect(stripped).not.toContain('Kurulum');
  });

  it.each(CEVIRILER)('%s sözlüğünde ÖLÜ anahtar yok', (_dil, sozluk) => {
    // The price of using sentences as keys: editing the Turkish copy orphans
    // its translation, and nothing else would ever say so.
    const dead = Object.keys(sozluk).filter((key) => !source.includes(key));
    expect(dead, `kaynakta bulunmayan anahtar:\n${dead.join('\n')}`).toEqual([]);
  });

  it.each(CEVIRILER)('%s: her çevirinin yuvaları anahtarınkilerle AYNI', (_dil, sozluk) => {
    // Order may change between languages; the SET may not. A translation that
    // drops {n} silently prints a sentence with a number missing from it.
    const wrong: string[] = [];
    for (const [key, phrase] of Object.entries(sozluk)) {
      const a = [...new Set(slotsOf(key))].sort();
      const b = [...new Set(slotsOf(phrase))].sort();
      if (a.join(',') !== b.join(',')) wrong.push(`${key}\n  → ${phrase}`);
    }
    expect(wrong, wrong.join('\n')).toEqual([]);
  });

  it.each(CEVIRILER)('%s: her çeviride ** dengeli', (_dil, sozluk) => {
    // Otherwise <T> swallows half the sentence.
    const odd = Object.entries(sozluk)
      .filter(([, phrase]) => (phrase.split('**').length - 1) % 2 !== 0)
      .map(([key]) => key);
    expect(odd, odd.join('\n')).toEqual([]);
  });

  it.each(CEVIRILER)('%s: her çoğulun İKİ biçimi var ve yuvası SAYI', (_dil, sozluk) => {
    // `{n:one|other}` with one alternative reads fine and is always wrong for
    // half the numbers; with three, the third is silently dropped.
    const wrong: string[] = [];
    for (const [key, phrase] of Object.entries(sozluk)) {
      for (const m of phrase.matchAll(/\{(\w+):([^{}]*)\}/g)) {
        if (m[2]!.split('|').length !== 2) wrong.push(`${key}\n  → ${m[0]}`);
      }
      // A plural whose slot the KEY does not carry can never be filled: the
      // Turkish sentence is what the call site passes vars for.
      for (const slot of pluralSlotsOf(phrase)) {
        if (!slotsOf(key).includes(slot)) wrong.push(`${key}\n  → {${slot}:…} anahtarda yok`);
      }
    }
    expect(wrong, wrong.join('\n')).toEqual([]);
  });

  it.each(CEVIRILER)('%s: uzun çizgi (—) YOK', (_dil, sozluk) => {
    // The Turkish screen is measured for this in `e2e/metin.spec.ts`, which
    // reads document.body.innerText — and the whole E2E suite is pinned to
    // Turkish in kapan.ts, so it never sees any of these. The rule is the same
    // rule; only the place it can be measured is different.
    const bad = Object.entries(sozluk)
      .filter(([, phrase]) => phrase.includes('—'))
      .map(([key]) => key);
    expect(bad, bad.join('\n')).toEqual([]);
  });
});

// ------------------------------------------------------------ the plurals

describe('çoğul', () => {
  it('kategoriyi Intl.PluralRules soruyor, n === 1 DEĞİL', () => {
    // The reason the rule is asked rather than guessed: French puts 0 in the
    // "one" category and Spanish does not. Both of those are reachable here —
    // "0 sınıf" is what an empty project says.
    expect(translate('fr', '{n} {n:classe|classes}', { n: 0 })).toBe('0 classe');
    expect(translate('es', '{n} {n:clase|clases}', { n: 0 })).toBe('0 clases');
    expect(translate('en', '{n} {n:class|classes}', { n: 0 })).toBe('0 classes');
    expect(translate('en', '{n} {n:class|classes}', { n: 1 })).toBe('1 class');
    expect(translate('de', '{n} {n:Klasse|Klassen}', { n: 2 })).toBe('2 Klassen');
  });

  it('bir cümle İKİ çoğul taşıyabilir, her biri KENDİ sayısını soruyor', () => {
    // The deletion summaries in entities.ts do exactly this: "2 lessons and 1
    // placed hour". "The first number in vars" would get the second one wrong.
    expect(
      translate('en', '{a} {a:lesson|lessons} and {b} {b:hour|hours}', { a: 2, b: 1 }),
    ).toBe('2 lessons and 1 hour');
  });

  it('Türkçe anahtarda çoğul YOK — sayıdan sonra ek almaz', () => {
    // The whole reason `plural()` in entities.ts was `${n} ${word}` for two
    // years, and the reason the syntax lives in the VALUE and not the key.
    expect(translate('tr', '{n} sınıf', { n: 1 })).toBe('1 sınıf');
    expect(translate('tr', '{n} sınıf', { n: 4 })).toBe('4 sınıf');
  });
});

// -------------------------------------------------------- the pure modules

describe('aktif dil', () => {
  const geriAl = aktifDil();
  afterEach(() => setAktifDil(geriAl));

  it('applyDil onu KURUYOR — saf modüller başka yerden okumuyor', () => {
    // constraints.ts, entities.ts and feasibility.ts write sentences and can
    // never call useT(). If applyDil stopped setting this, the interface would
    // change language and every blocker message would stay Turkish.
    applyDil('en');
    expect(aktifDil()).toBe('en');
    expect(t('Okul')).toBe('School');
    applyDil('tr');
    expect(aktifDil()).toBe('tr');
    expect(t('Okul')).toBe('Okul');
  });

  it('varsayılan Türkçe — 600 birim testi bunun üstünde duruyor', () => {
    setAktifDil('tr');
    expect(t('herhangi bir cümle')).toBe('herhangi bir cümle');
  });
});

// ------------------------------------------------------------- the DATA text

describe('veri metinleri: depoda Türkçe, ekranda çevrili', () => {
  const geriAl = aktifDil();
  afterEach(() => setAktifDil(geriAl));

  const bos = { subjectShorts: {} } as Settings;

  it('gömülü gün ve branş adları çevriliyor', () => {
    setAktifDil('en');
    expect(dayLabel('Salı')).toBe('Tuesday');
    expect(shortDay('Salı')).toBe('Tue');
    expect(subjectLabel('Matematik')).toBe('Mathematics');
    expect(subjectShort(bos, 'Matematik')).toBe('Mth');
  });

  it('babanın kendi yazdığı ad OLDUĞU GİBİ kalıyor', () => {
    setAktifDil('en');
    // A renamed day and a subject nobody built in: translating either would be
    // a guess about somebody else's word, and `remapDays()` builds its mapping
    // from this string (pitfall 11).
    expect(dayLabel('Hafta içi')).toBe('Hafta içi');
    expect(shortDay('Hafta içi')).toBe('Haf');
    expect(subjectLabel('Astronomi')).toBe('Astronomi');
    expect(subjectShort(bos, 'Astronomi')).toBe('Ast');
  });

  it('Türkçede hiçbiri kıpırdamıyor', () => {
    setAktifDil('tr');
    expect(dayLabel('Salı')).toBe('Salı');
    expect(shortDay('Salı')).toBe('Sal');
    expect(subjectLabel('Matematik')).toBe('Matematik');
    expect(subjectShort(bos, 'Matematik')).toBe('Mat');
  });
});
