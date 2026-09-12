// The key FORMAT is stored data: every backup file and every localStorage
// value holds it. Reading it back has one rule, the one `sanitize` enforces:
// exactly three `|`-separated parts, or the key is not a key.

import { describe, expect, it } from 'vitest';
import { cellKey, closedKey, keyOnDay, parseCellKey, parseKey, placementKey } from './leaf/keys';

describe('placementKey ve closedKey', () => {
  it('biçim yedek dosyasındakiyle aynı', () => {
    expect(placementKey('s510', 2, 7)).toBe('s510|2|7');
    expect(closedKey('oMC', 0, 11)).toBe('oMC|0|11');
  });
});

describe('parseKey', () => {
  it('kurduğu anahtarı geri okuyor', () => {
    expect(parseKey(placementKey('s510', 2, 7))).toEqual({ id: 's510', day: 2, hour: 7 });
    expect(parseKey(closedKey('oMÇ', 0, 11))).toEqual({ id: 'oMÇ', day: 0, hour: 11 });
  });

  it('üç parça değilse anahtar değil', () => {
    for (const bad of ['', 's510', 's510|2', 's510|2|7|1', 'a|b|2|7']) {
      expect(parseKey(bad)).toBeNull();
    }
  });

  // Range and number checks stay with the caller, as they were: `sanitize`
  // drops a day past the week, `remapDays` asks a map. This function only
  // cuts, so it cannot quietly agree with one reader and not another.
  it('sayı olmayan parça NaN olarak geçiyor, aralığı çağıran denetliyor', () => {
    const parts = parseKey('s510|x|7');
    expect(parts).not.toBeNull();
    expect(parts!.day).toBeNaN();
    expect(parts!.hour).toBe(7);
  });
});

describe('keyOnDay', () => {
  it('yalnız günü değiştiriyor', () => {
    expect(keyOnDay(placementKey('s510', 0, 7), 3)).toBe('s510|3|7');
  });

  // `sanitize` keeps "07" because Number("07") is an integer. Moving the key to
  // another day must not rename it to "7" on the way.
  it('öteki iki parçayı saklandığı gibi koruyor', () => {
    expect(keyOnDay('s510|0|07', 3)).toBe('s510|3|07');
  });

  it('parseKey neyi reddediyorsa onu da reddediyor', () => {
    for (const bad of ['', 's510|2', 's510|2|7|1']) {
      expect(keyOnDay(bad, 1)).toBeNull();
    }
  });
});

describe('cellKey ve parseCellKey', () => {
  it('gün ve saat, ikisi de geri okunuyor', () => {
    expect(cellKey(3, 10)).toBe('3|10');
    expect(parseCellKey(cellKey(3, 10))).toEqual({ day: 3, hour: 10 });
    expect(parseCellKey(cellKey(0, 0))).toEqual({ day: 0, hour: 0 });
  });
});
