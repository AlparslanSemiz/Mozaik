// The built file does not carry the four dictionaries as they are written: the
// build packs them (scripts/sozluk-paket.mjs) so the Turkish keys are stored
// once, and `sozlukOf` unpacks a language the first time it is asked for.
// Every other test, and the dev server, sees the source objects — so this is
// the one place that says the two are the same dictionary, key for key.

import { describe, expect, it } from 'vitest';
import {
  PAKET_AYIRAC as BUILD_AYIRAC,
  PAKET_DILLER,
  packSozlukler,
  readSozluk,
} from '../../../scripts/sozluk-paket.mjs';
import { DILLER, PAKET_AYIRAC, registerPaket, sozlukOf, translate, unpackSozluk } from '../i18n/i18n';
import type { Dil } from '../i18n/i18n';
import './index';

const NON_TR = DILLER.filter((d) => d !== 'tr');

describe('packed dictionaries', () => {
  it('pack every language that has a dictionary, with the separator the reader splits on', () => {
    expect([...PAKET_DILLER].sort()).toEqual([...NON_TR].sort());
    expect(BUILD_AYIRAC).toBe(PAKET_AYIRAC);
  });

  it('read each file into exactly the object its module registers', () => {
    for (const dil of NON_TR) expect(readSozluk(dil)).toEqual(sozlukOf(dil));
  });

  it('unpack into the same dictionary, in all four languages', () => {
    const source = Object.fromEntries(NON_TR.map((d) => [d, sozlukOf(d)!]));
    const { keys, values } = packSozlukler(source);
    for (const dil of NON_TR) expect(unpackSozluk(keys, values[dil]!)).toEqual(source[dil]);
  });

  it('leave a key one language lacks in Turkish for that language only', () => {
    const { keys, values } = packSozlukler({ en: { Bir: 'One', İki: 'Two' }, de: { Bir: 'Eins' } });
    expect(unpackSozluk(keys, values.de!)).toEqual({ Bir: 'Eins' });
    expect(unpackSozluk(keys, values.en!)).toEqual({ Bir: 'One', İki: 'Two' });
  });

  it('refuse a sentence that would split in two, and an empty translation', () => {
    expect(() => packSozlukler({ en: { [`a${PAKET_AYIRAC}b`]: 'x' } })).toThrow();
    expect(() => packSozlukler({ en: { a: `x${PAKET_AYIRAC}y` } })).toThrow();
    expect(() => packSozlukler({ en: { a: '' } })).toThrow();
  });

  it('translate from a registered package, which replaces the source object', () => {
    const dil: Dil = 'en';
    const before = sozlukOf(dil)!;
    try {
      const { keys, values } = packSozlukler({ en: { Öğretmenler: 'Packed teachers' } });
      registerPaket(dil, keys, values.en!);
      expect(translate(dil, 'Öğretmenler')).toBe('Packed teachers');
      expect(translate(dil, 'Dersler')).toBe('Dersler');
    } finally {
      const { keys, values } = packSozlukler({ en: before });
      registerPaket(dil, keys, values.en!);
    }
    expect(sozlukOf(dil)).toEqual(before);
  });
});
