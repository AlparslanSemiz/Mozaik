// @vitest-environment jsdom
//
// jsdom rather than node: half of these preferences write <html>, and that
// write is the behaviour being pinned.
//
// What each machine preference does, pinned through the names the rest of the
// program calls (`applyTheme`, `readDock`, ...), so that moving its copy onto
// the factory in preference.ts is measured rather than assumed. For every one:
// the key, the string it stores, the attribute or property it puts on <html>
// (or that it puts nothing there), and what an absent, a junk, a zero and an
// unreadable record read as.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Preference } from './preference';
import * as changelog from './changelog';
import * as i18n from './i18n';
import * as print from './printOptions';
import * as color from './programColor';
import * as theme from './theme';
import styles from './styles.css?raw';

function fakeStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  return values;
}

function brokenStorage() {
  const fail = () => {
    throw new Error('kapalı');
  };
  vi.stubGlobal('localStorage', { getItem: fail, setItem: fail, removeItem: fail });
}

const root = () => document.documentElement;
const attribute = (name: string) => () => root().getAttribute(name);

interface Case {
  ad: string;
  key: string;
  pref: Preference<any>;
  // The program calls a one-value wrapper around write rather than write itself.
  wraps?: boolean;
  read: () => unknown;
  // The call the program makes to change it, whichever verb that is.
  save: (value: never) => void;
  absent: unknown;
  // Stored strings that are not a value this preference can hold.
  junk: string[];
  // Stored strings that ARE records and read as something other than `absent`.
  stored?: Array<[string, unknown]>;
  // [value passed in, string that lands in storage]
  values: Array<[unknown, string]>;
  // What <html> carries afterwards. Absent: the preference paints nothing.
  painted?: () => string | null;
}

const CASES: Case[] = [
  {
    ad: 'tema',
    key: 'ders-programi-tema',
    pref: theme.themePreference,
    read: theme.readTheme,
    save: theme.applyTheme,
    absent: 'light',
    junk: ['', 'DARK', 'koyu'],
    values: [
      ['dark', 'dark'],
      ['light', 'light'],
    ],
    painted: attribute('data-theme'),
  },
  {
    ad: 'havuz çekmecesi',
    key: 'ders-programi-havuz',
    pref: theme.dockPreference,
    read: theme.readDock,
    save: theme.writeDock,
    absent: true,
    junk: ['', 'acik', 'hayır'],
    stored: [['kapali', false]],
    values: [
      [false, 'kapali'],
      [true, 'acik'],
    ],
  },
  {
    ad: 'araç şeridi',
    key: 'ders-programi-serit',
    pref: theme.ribbonPreference,
    read: theme.readRibbon,
    save: theme.applyRibbon,
    absent: true,
    junk: ['', 'saçma'],
    stored: [['kapali', false]],
    values: [
      [false, 'kapali'],
      [true, 'acik'],
    ],
    painted: attribute('data-ribbon'),
  },
  {
    ad: 'şeridin kendiliğinden gizlenmesi',
    key: 'ders-programi-serit-gizle',
    pref: theme.ribbonAutoPreference,
    read: theme.readRibbonAuto,
    save: theme.applyRibbonAuto,
    absent: true,
    junk: ['', 'saçma'],
    stored: [['kapali', false]],
    values: [
      [false, 'kapali'],
      [true, 'acik'],
    ],
  },
  {
    ad: 'havuz çekmecesinin boyu',
    key: 'ders-programi-havuz-boy',
    pref: theme.dockHeightPreference,
    read: theme.readDockHeight,
    save: theme.writeDockHeight,
    absent: theme.DOCK_H_DEFAULT,
    junk: ['', '   ', 'abc'],
    stored: [
      ['0', theme.DOCK_H_MIN],
      ['999', theme.DOCK_H_MAX],
      ['11.1', 11],
    ],
    values: [
      [7.5, '7.5'],
      [theme.DOCK_H_MAX, String(theme.DOCK_H_MAX)],
    ],
  },
  {
    ad: 'yazı büyüklüğü',
    key: 'ders-programi-olcek',
    pref: theme.scalePreference,
    read: theme.readScale,
    save: theme.applyScale,
    absent: theme.SCALE_DEFAULT,
    junk: ['', 'büyük'],
    stored: [
      ['0', theme.SCALE_MIN],
      ['3', theme.SCALE_MAX],
    ],
    values: [
      [1.5, '1.5'],
      [0.8, '0.8'],
      [1.15, '1.15'],
    ],
    painted: () => root().style.getPropertyValue('--ui-scale'),
  },
  {
    ad: 'ızgara yoğunluğu',
    key: 'ders-programi-yogunluk',
    pref: theme.densityPreference,
    read: theme.readDensity,
    save: theme.applyDensity,
    absent: 'rahat',
    junk: ['', 'SIGDIR', 'sıkı'],
    values: [
      ['sigdir', 'sigdir'],
      ['ferah', 'ferah'],
      ['rahat', 'rahat'],
    ],
    painted: attribute('data-density'),
  },
  {
    ad: 'arayüz yoğunluğu',
    key: 'ders-programi-arayuz-yogunluk',
    pref: theme.uiDensityPreference,
    read: theme.readUiDensity,
    save: theme.applyUiDensity,
    absent: 'rahat',
    junk: ['', 'Ferah'],
    values: [
      ['ferah', 'ferah'],
      ['sigdir', 'sigdir'],
      ['rahat', 'rahat'],
    ],
    painted: attribute('data-ui-density'),
  },
  {
    ad: 'müsaitlikte saat',
    key: 'ders-programi-musaitlik-saat',
    pref: theme.availClockPreference,
    read: theme.readAvailClock,
    save: theme.applyAvailClock,
    absent: false,
    junk: ['', 'evet', 'true'],
    stored: [['acik', true]],
    values: [
      [true, 'acik'],
      [false, 'kapali'],
    ],
    painted: attribute('data-avail-clock'),
  },
  {
    ad: 'dil',
    key: 'ders-programi-dil',
    pref: i18n.dilPreference,
    read: i18n.readDil,
    save: i18n.applyDil,
    // jsdom's navigator says en-US, so the device's own answer here is English.
    absent: 'en',
    junk: ['', 'TR', 'el'],
    values: [
      ['tr', 'tr'],
      ['de', 'de'],
      ['fr', 'fr'],
    ],
    painted: attribute('lang'),
  },
  {
    ad: 'kâğıt seçenekleri',
    key: 'ders-programi-baski',
    pref: print.printOptionsPreference,
    read: print.readPrintOptions,
    save: print.writePrintOptions,
    absent: print.PRINT_DEFAULTS,
    junk: ['', '{bozuk', '[]', '42', 'null'],
    stored: [['{"clock":false}', { ...print.PRINT_DEFAULTS, clock: false }]],
    values: [
      [
        { ...print.PRINT_DEFAULTS, stamp: true, perSheet: 4, size: 'buyuk' },
        JSON.stringify({ ...print.PRINT_DEFAULTS, stamp: true, perSheet: 4, size: 'buyuk' }),
      ],
      [print.PRINT_DEFAULTS, JSON.stringify(print.PRINT_DEFAULTS)],
    ],
  },
  {
    ad: 'program kart rengi',
    key: 'ders-programi-program-rengi',
    pref: color.programColorPreference,
    read: color.readProgramColor,
    save: color.writeProgramColor,
    absent: 'teacher',
    junk: ['', 'ROOM', 'öğretmen'],
    values: [
      ['room', 'room'],
      ['subject', 'subject'],
      ['teacher', 'teacher'],
    ],
  },
  {
    ad: 'örnek veri satırı',
    key: 'ders-programi-tanitim',
    pref: theme.introPreference,
    wraps: true,
    read: theme.readIntroSeen,
    save: theme.markIntroSeen,
    absent: false,
    junk: ['', 'evet', 'true'],
    values: [[true, 'gorundu']],
  },
  {
    ad: 'hareket',
    key: 'ders-programi-hareket',
    pref: theme.motionPreference,
    read: theme.readMotion,
    save: theme.applyMotion,
    // jsdom has no matchMedia, so the machine here asks for nothing; the
    // machine that does is the describe block at the end of this file.
    absent: 'tam',
    junk: ['', 'TAM', 'reduce', 'off'],
    values: [
      ['kapali', 'kapali'],
      ['az', 'az'],
      ['tam', 'tam'],
    ],
    painted: attribute('data-motion'),
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
  for (const name of root().getAttributeNames()) {
    if (name.startsWith('data-')) root().removeAttribute(name);
  }
  root().style.removeProperty('--ui-scale');
  root().removeAttribute('lang');
  i18n.setAktifDil('tr');
});

describe.each(CASES)('$ad', (c) => {
  const save = c.save as (value: unknown) => void;

  it('kayıt yoksa varsayılanı okur', () => {
    fakeStorage();
    expect(c.read()).toEqual(c.absent);
  });

  it('okunamayan bir kayıt varsayılanı okur', () => {
    for (const junk of c.junk) {
      fakeStorage({ [c.key]: junk });
      expect(c.read(), JSON.stringify(junk)).toEqual(c.absent);
    }
  });

  it('bir kayıt, sıfır da olsa, kendi anlamını okur', () => {
    for (const [text, value] of c.stored ?? []) {
      fakeStorage({ [c.key]: text });
      expect(c.read(), text).toEqual(value);
    }
  });

  it('depo kullanılamıyorsa varsayılanı okur ve kaydederken çökmez', () => {
    brokenStorage();
    expect(c.read()).toEqual(c.absent);
    expect(() => save(c.values[0]![0])).not.toThrow();
  });

  it('kendi anahtarına kendi dizesini yazar ve geri aynı değeri okur', () => {
    for (const [value, text] of c.values) {
      const values = fakeStorage();
      save(value);
      expect(values.get(c.key), String(value)).toBe(text);
      expect(c.read(), String(value)).toEqual(value);
    }
  });

  it('programın çağırdığı ad fabrikanın kendi fonksiyonu', () => {
    expect(c.pref.key).toBe(c.key);
    expect(c.read).toBe(c.pref.read);
    if (!c.wraps) expect([c.pref.apply, c.pref.write]).toContain(c.save);
  });

  it('normalize denetimin verdiği değeri de depodaki dizeyi de tanır', () => {
    for (const [value, text] of c.values) {
      expect(c.pref.normalize(value), String(value)).toEqual(value);
      expect(c.pref.normalize(text), text).toEqual(value);
    }
  });

  if (c.painted !== undefined) {
    const painted = c.painted;
    it("<html>'e saklanan dizeyi yazar, depo kullanılamasa da", () => {
      for (const [value, text] of c.values) {
        fakeStorage();
        save(value);
        expect(painted(), String(value)).toBe(text);
        brokenStorage();
        save(c.values[c.values.length - 1]![0]);
        save(value);
        expect(painted(), `${String(value)}, depo kapalı`).toBe(text);
      }
    });
  } else {
    it("<html>'e hiçbir şey yazmaz", () => {
      fakeStorage();
      const before = root().outerHTML;
      for (const [value] of c.values) save(value);
      expect(root().outerHTML).toBe(before);
    });
  }
});

describe('görülen sürüm notu', () => {
  const latest = changelog.SURUM_NOTLARI[0]!.version;
  const KEY = 'ders-programi-yenilik-gorulen';

  it('kayıt yoksa en yeni not görülmemiş sayılır', () => {
    fakeStorage();
    expect(changelog.hasUnseenChangelog()).toBe(true);
  });

  it('eski bir sürümün işareti de boş kayıt da en yeni notu görülmemiş bırakır', () => {
    for (const text of ['2.0.0', '']) {
      fakeStorage({ [KEY]: text });
      expect(changelog.hasUnseenChangelog(), JSON.stringify(text)).toBe(true);
    }
  });

  it('işaret kendi anahtarına sürümü yazar ve not görülmüş sayılır', () => {
    const values = fakeStorage();
    changelog.markChangelogSeen(latest);
    expect(values.get(KEY)).toBe(latest);
    expect(changelog.hasUnseenChangelog()).toBe(false);
  });

  it('programın çağırdığı ad fabrikanın kendi fonksiyonu', () => {
    expect(changelog.changelogSeenPreference.key).toBe(KEY);
    expect(changelog.markChangelogSeen).toBe(changelog.changelogSeenPreference.write);
  });

  it("depo kullanılamıyorsa görülmemiş sayılır, işaret çökmez, <html>'e bir şey yazılmaz", () => {
    brokenStorage();
    const before = root().outerHTML;
    expect(changelog.hasUnseenChangelog()).toBe(true);
    expect(() => changelog.markChangelogSeen(latest)).not.toThrow();
    expect(root().outerHTML).toBe(before);
  });
});

// Pitfall 58: a preference both the machine and the reader give. The machine
// is a floor. With no record it is what the preference reads, it is asked
// again on every read, and in the stylesheet its block comes after the
// setting's rules at equal specificity, so the cascade lets it win.
describe('hareket · makinenin tercihi bir taban', () => {
  let reduced = false;
  const matchMedia = (query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' && reduced,
  });

  beforeEach(() => {
    reduced = true;
    Object.defineProperty(window, 'matchMedia', { value: matchMedia, configurable: true });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('kayıt yoksa azaltılmış hareket isteyen makinede kapalı okunur', () => {
    fakeStorage();
    expect(theme.readMotion()).toBe('kapali');
  });

  it('bozuk bir kayıt da makinenin cevabına düşer', () => {
    for (const junk of ['', 'TAM', 'reduce']) {
      fakeStorage({ 'ders-programi-hareket': junk });
      expect(theme.readMotion(), JSON.stringify(junk)).toBe('kapali');
    }
  });

  it('depo kullanılamıyorsa da makinenin cevabı okunur', () => {
    brokenStorage();
    expect(theme.readMotion()).toBe('kapali');
  });

  it('kayıtlı bir tercih kendi değerini okur, tabanı stil sayfası tutar', () => {
    fakeStorage({ 'ders-programi-hareket': 'tam' });
    expect(theme.readMotion()).toBe('tam');
  });

  it('makine her okumada yeniden sorulur', () => {
    fakeStorage();
    reduced = false;
    expect(theme.readMotion()).toBe('tam');
    reduced = true;
    expect(theme.readMotion()).toBe('kapali');
  });

  it("styles.css'te makinenin bloğu ayarın kurallarından SONRA ve aynı seçicilerle duruyor", () => {
    // Read empty, every assertion below would be about nothing: Vitest turns a
    // stylesheet into '' unless vite.config.ts names it.
    expect(styles.length, 'styles.css okunamadı').toBeGreaterThan(10_000);
    const media = styles.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(media, 'makinenin bloğu yok').toBeGreaterThan(-1);
    let depth = 0;
    let end = styles.indexOf('{', media);
    do {
      if (styles[end] === '{') depth++;
      else if (styles[end] === '}') depth--;
      end++;
    } while (depth > 0 && end < styles.length);
    const before = styles.slice(0, media);
    const block = styles.slice(media, end);
    const after = styles.slice(end);
    expect(before, 'ayarın kuralları bloktan önce değil').toMatch(
      /:root\[data-motion="(az|kapali)"\]/,
    );
    expect(after, 'bloktan sonra bir ayar kuralı var, o kural makineyi ezer').not.toMatch(
      /:root\[data-motion=/,
    );
    expect(block).toContain(':root[data-motion="tam"]');
    expect(block).toContain(':root[data-motion="az"]');
  });
});
