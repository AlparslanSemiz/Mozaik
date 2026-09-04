import { describe, expect, it } from 'vitest';
import {
  normalizePrintOptions,
  PRINT_DEFAULTS,
  PRINT_OPTION_LABELS,
  PER_SHEET_LABELS,
  PER_SHEET_VALUES,
  PRINT_SIZE_LABELS,
} from '../printOptions';

describe('normalizePrintOptions', () => {
  // "Not stored" and "stored as off" are different facts, and every one of
  // these carries neither. Anything that cannot say `false` gets the default —
  // the same trap `Number('') === 0` set for the scale and the dock height.
  it('yokluk, boşluk ve çöp — hepsi VARSAYILANA düşüyor', () => {
    for (const junk of [
      null,
      undefined,
      '',
      '   ',
      'kapali',
      '{',
      '[]',
      '[1,2]',
      'null',
      '"acik"',
      '42',
      0,
      false,
      [],
      { school: 'evet' },
      { clock: 1 },
      { stamp: null },
    ]) {
      expect(normalizePrintOptions(junk), String(JSON.stringify(junk))).toEqual(
        PRINT_DEFAULTS,
      );
    }
  });

  it('YALNIZCA açık bir false kapatıyor', () => {
    expect(normalizePrintOptions({ clock: false })).toEqual({
      ...PRINT_DEFAULTS,
      clock: false,
    });
    expect(normalizePrintOptions('{"clock":false}')).toEqual({
      ...PRINT_DEFAULTS,
      clock: false,
    });
  });

  // A record written before a switch existed has no key for it — which is the
  // shape every stored record takes the day a sixth switch is added.
  it('eksik alan taşıyan eski kayıt, kalanını kaybetmiyor', () => {
    expect(normalizePrintOptions({ school: false })).toEqual({
      ...PRINT_DEFAULTS,
      school: false,
    });
  });

  it('gidiş-dönüş: yazılan JSON aynen geri okunuyor', () => {
    const chosen = {
      school: false, credits: true, clock: false, stamp: true, cellBottom: false,
      perSheet: 4 as const, size: 'kucuk' as const,
    };
    expect(normalizePrintOptions(JSON.stringify(chosen))).toEqual(chosen);
  });

  // The two that are not switches. `Number('')` and `Number(null)` are both 0
  // and 0 is not a legal sheet count, so membership is the guard rather than
  // `Number.isFinite` (pitfall 43) — and a value from a FUTURE version must
  // fall back rather than reach the layout.
  it('sayfa başına program: yalnız 1, 2 ve 4 geçiyor', () => {
    expect(normalizePrintOptions({ perSheet: 2 }).perSheet).toBe(2);
    for (const junk of [0, 3, -1, '2', null, undefined, NaN, {}]) {
      expect(normalizePrintOptions({ perSheet: junk }).perSheet, `${String(junk)}`).toBe(1);
    }
  });

  it('yazı boyutu: yalnız üç adı geçiyor', () => {
    expect(normalizePrintOptions({ size: 'buyuk' }).size).toBe('buyuk');
    for (const junk of [0, 'büyük', 'BUYUK', null, undefined, {}]) {
      expect(normalizePrintOptions({ size: junk }).size, `${String(junk)}`).toBe('normal');
    }
  });

  it('varsayılan düzen: bir A4’e BİR program, normal punto', () => {
    // What came out of the printer before these two existed.
    expect(PRINT_DEFAULTS.perSheet).toBe(1);
    expect(PRINT_DEFAULTS.size).toBe('normal');
  });

  // The one that never existed before. On by default would change what comes
  // out of the printer for somebody who never opened the panel.
  it('çıktı tarihi KAPALI başlıyor, kalan dördü açık', () => {
    expect(PRINT_DEFAULTS.stamp).toBe(false);
    expect(PRINT_DEFAULTS.school).toBe(true);
    expect(PRINT_DEFAULTS.credits).toBe(true);
    expect(PRINT_DEFAULTS.clock).toBe(true);
    expect(PRINT_DEFAULTS.cellBottom).toBe(true);
  });
});

describe('PRINT_OPTION_LABELS', () => {
  // A switch with no row in the panel is a switch nobody can reach; a row
  // with no switch behind it is a checkbox that does nothing.
  it('panelin her satırı bir ayara, her ayar bir satıra karşılık geliyor', () => {
    // Three label lists now, one record: the five switches, the sheet counts
    // and the three type sizes. The rule is unchanged — a setting with no row
    // is a setting nobody can reach — so the union has to be the whole record.
    const ids = PRINT_OPTION_LABELS.map((x) => x.id).sort();
    expect(ids).toEqual(['cellBottom', 'clock', 'credits', 'school', 'stamp']);
    expect(new Set(ids).size).toBe(ids.length);

    const shown = [...ids, 'perSheet', 'size'].sort();
    expect(shown).toEqual(Object.keys(PRINT_DEFAULTS).sort());
    expect(PER_SHEET_LABELS.map((x) => x.value)).toEqual(PER_SHEET_VALUES);
    expect(PRINT_SIZE_LABELS.map((x) => x.value)).toEqual(['kucuk', 'normal', 'buyuk']);
  });

  it('her satırın adı ve açıklaması var', () => {
    for (const x of PRINT_OPTION_LABELS) {
      expect(x.label.trim()).not.toBe('');
      expect(x.hint.trim()).not.toBe('');
    }
  });
});
