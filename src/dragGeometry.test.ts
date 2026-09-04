// Where a dragged block lands. These three used to live inside `useDrag`'s
// closure, so the only way to ask them anything was to open a browser and move
// a mouse; the rule they encode — "2 derslik bir blok kesinlikle 1 ders değil
// 2 derstir" — is arithmetic, and now it is asked directly.

import { blockStart, cellKey, clampToDay } from './dragGeometry';

describe('clampToDay', () => {
  it('güne sığan saat olduğu gibi kalıyor', () => {
    expect(clampToDay(0, 1, 12)).toBe(0);
    expect(clampToDay(5, 2, 12)).toBe(5);
    expect(clampToDay(10, 2, 12)).toBe(10);
  });

  it('günün SON saatine bırakılan 2 saatlik blok bir saat geri oturuyor', () => {
    // The whole point: hovering the last hour with a double used to be refused
    // on a boundary technicality, even though the block plainly fits in the
    // day's last two hours.
    expect(clampToDay(11, 2, 12)).toBe(10);
    expect(clampToDay(11, 3, 12)).toBe(9);
  });

  it('güne hiç sığmayan blok 0’a düşüyor, eksiye değil', () => {
    expect(clampToDay(3, 20, 12)).toBe(0);
    expect(clampToDay(0, 13, 12)).toBe(0);
  });
});

describe('blockStart', () => {
  it('hücre yoksa hedef de yok', () => {
    expect(blockStart(null, 2, 12)).toBeNull();
  });

  it('günü korur, yalnız saati kırpar', () => {
    expect(blockStart({ day: 3, hour: 11 }, 2, 12)).toEqual({ day: 3, hour: 10 });
    expect(blockStart({ day: 0, hour: 4 }, 1, 12)).toEqual({ day: 0, hour: 4 });
  });
});

describe('cellKey', () => {
  it('verdict haritasının anahtarıyla aynı biçimde yazıyor', () => {
    expect(cellKey({ day: 2, hour: 7 })).toBe('2|7');
  });

  it('hedef yokken BOŞ dize — "hiçbir hücre" ile "0|0" karışamaz', () => {
    expect(cellKey(null)).toBe('');
    expect(cellKey({ day: 0, hour: 0 })).toBe('0|0');
  });
});
