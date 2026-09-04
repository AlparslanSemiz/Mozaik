import { describe, expect, it } from 'vitest';
import { GELISTIRME, SURUM, surumEtiketi, tarihYazisi } from '../version';

describe('tarihYazisi', () => {
  it('ISO tarihi Türkçe yazar', () => {
    expect(tarihYazisi('2026-08-27')).toBe('27 Ağustos 2026');
    expect(tarihYazisi('2026-01-01')).toBe('1 Ocak 2026');
    expect(tarihYazisi('2026-12-31')).toBe('31 Aralık 2026');
  });

  it('gün başındaki sıfırı yutar — "01 Ocak" yazan bir kâğıt yok', () => {
    expect(tarihYazisi('2026-03-05')).toBe('5 Mart 2026');
  });

  // Whatever comes out of a build define is a string we did not write, and
  // this function ends up in a panel: a throw here would take out the one
  // screen that explains where the data is.
  it('tanımadığı her girdiye boş döner, atmaz', () => {
    expect(tarihYazisi('')).toBe('');
    expect(tarihYazisi('27.08.2026')).toBe('');
    expect(tarihYazisi('2026-13-01')).toBe(''); // no thirteenth month
    expect(tarihYazisi('2026-00-01')).toBe('');
  });
});

describe('surumEtiketi', () => {
  it('sürüm ve tarihi birlikte yazar', () => {
    expect(surumEtiketi({ version: '1.1.0', commit: 'abc1234', date: '2026-08-27' })).toBe(
      'v1.1.0 · 27 Ağustos 2026',
    );
  });

  it('tarih yoksa yalnız sürümü yazar', () => {
    expect(surumEtiketi({ version: '1.1.0', commit: '', date: '' })).toBe('v1.1.0');
  });
});

describe('SURUM', () => {
  // The point of the fallback is that importing this module can never throw,
  // whether or not a define reached it. Under vitest the define DOES reach it
  // (same vite.config.ts), so this asserts the shape rather than the value.
  it('her zaman üç alanlı bir kayıttır', () => {
    expect(typeof SURUM.version).toBe('string');
    expect(typeof SURUM.commit).toBe('string');
    expect(typeof SURUM.date).toBe('string');
    expect(SURUM.version).not.toBe('');
  });

  it('geliştirme kaydı bir sürüm gibi okunur', () => {
    expect(surumEtiketi(GELISTIRME)).toBe('v0.0.0-dev');
  });
});
