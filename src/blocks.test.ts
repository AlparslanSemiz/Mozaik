// How a week is split. Pure arithmetic, and the choices a dropdown offers.

import { describe, expect, it } from 'vitest';
import { blockPlan, clampPairs, patternLabel, patternOptions } from './blocks';
import type { Lesson } from './types';

const lesson = (weeklyHours: number, pairs: number): Lesson => ({
  id: 'x1',
  classId: 's510',
  teacherId: 'oMC',
  weeklyHours,
  pairs,
  second: false,
  maxPerDay: null,
});

describe('blockPlan', () => {
  it('ikililer önce, sonra tek saatler', () => {
    expect(blockPlan(lesson(3, 1))).toEqual([2, 1]);
    expect(blockPlan(lesson(3, 0))).toEqual([1, 1, 1]);
    expect(blockPlan(lesson(5, 2))).toEqual([2, 2, 1]);
    expect(blockPlan(lesson(6, 3))).toEqual([2, 2, 2]);
    expect(blockPlan(lesson(1, 0))).toEqual([1]);
  });

  // The whole reason `pairs` is one number next to `weeklyHours` and not a
  // second list: the two can never disagree about the total.
  it('blokların toplamı HER ZAMAN haftalık saate eşit', () => {
    for (let hours = 0; hours <= 40; hours++) {
      for (let pairs = 0; pairs <= 25; pairs++) {
        const sum = blockPlan(lesson(hours, pairs)).reduce((a, b) => a + b, 0);
        expect(sum, `${hours} saat / ${pairs} ikili`).toBe(hours);
      }
    }
  });

  it('sığmayan ikili sayısı kırpılıyor, saat sayısı bozulmuyor', () => {
    expect(blockPlan(lesson(3, 9))).toEqual([2, 1]);
    expect(blockPlan(lesson(4, -2))).toEqual([1, 1, 1, 1]);
  });

  it('yalnız 1 ve 2 üretiyor — üçlü blok v7 ile kalktı', () => {
    for (let hours = 1; hours <= 20; hours++) {
      for (const size of blockPlan(lesson(hours, Math.floor(hours / 3)))) {
        expect([1, 2]).toContain(size);
      }
    }
  });
});

describe('patternLabel', () => {
  it('artı ile yazıyor', () => {
    expect(patternLabel([2, 1])).toBe('2+1');
    expect(patternLabel([2, 2, 1])).toBe('2+2+1');
    expect(patternLabel([1])).toBe('1');
  });

  // A lesson with no hours has no split, and an empty string in a dropdown
  // reads as a broken row rather than as an answer.
  it('boş liste için tire', () => {
    expect(patternLabel([])).toBe('–');
  });

  // "adamın 10 saat dersi varsa 1+1+1+1+1… diye gözükmesi biraz kötü"
  it('dört terime kadar açık yazıyor — hafta bir RESİM', () => {
    expect(patternLabel([1, 1, 1, 1])).toBe('1+1+1+1');
    expect(patternLabel([2, 2, 1, 1])).toBe('2+2+1+1');
  });

  it('dört terimden sonra katlıyor', () => {
    expect(patternLabel([1, 1, 1, 1, 1])).toBe('5×1');
    expect(patternLabel(new Array<number>(10).fill(1))).toBe('10×1');
    expect(patternLabel([2, 2, 2, 2, 2])).toBe('5×2');
    expect(patternLabel([2, 2, 2, 1, 1, 1, 1])).toBe('3×2 + 4×1');
  });

  // The fold is a way of WRITING the split, never a change to it: whatever the
  // label says, the hours it stands for are the same hours.
  it('katlanmış etiket aynı toplamı anlatıyor', () => {
    for (let hours = 1; hours <= 14; hours++) {
      for (let pairs = 0; pairs <= Math.floor(hours / 2); pairs++) {
        const blocks = blockPlan(lesson(hours, pairs));
        const etiket = patternLabel(blocks);
        const toplam = [...etiket.matchAll(/(\d+)×(\d)/g)].reduce(
          (a, m) => a + Number(m[1]) * Number(m[2]),
          0,
        );
        // Either it folded (and the arithmetic in it adds up to the week) or it
        // did not (and the plus signs already do).
        const beklenen = etiket.includes('×')
          ? toplam
          : etiket.split('+').reduce((a, b) => a + Number(b), 0);
        expect(beklenen).toBe(hours);
      }
    }
  });
});

describe('patternOptions', () => {
  it('3 saat için iki seçenek: 1+1+1 ve 2+1', () => {
    expect(patternOptions(3)).toEqual([
      { pairs: 0, label: '1+1+1' },
      { pairs: 1, label: '2+1' },
    ]);
  });

  it('5 saat için üç seçenek, en az ikiliden en çoğa', () => {
    // The first one folds and the other two do not, which is the fold doing its
    // job inside the dropdown itself: five terms is where "1+1+1+1+1" stopped
    // being a picture of the week and became a row of ones.
    expect(patternOptions(5).map((x) => x.label)).toEqual([
      '5×1',
      '2+1+1+1',
      '2+2+1',
    ]);
  });

  it('seçenek sayısı floor(saat/2) + 1', () => {
    for (let hours = 0; hours <= 24; hours++) {
      expect(patternOptions(hours), `${hours} saat`).toHaveLength(Math.floor(hours / 2) + 1);
    }
  });

  it('her seçeneğin etiketi kendi pairs değerinden üretiliyor', () => {
    for (const option of patternOptions(7)) {
      expect(option.label).toBe(patternLabel(blockPlan(lesson(7, option.pairs))));
    }
  });
});

describe('clampPairs', () => {
  it('tavan floor(saat / 2)', () => {
    expect(clampPairs(4, 9)).toBe(2);
    expect(clampPairs(5, 9)).toBe(2);
    expect(clampPairs(6, 9)).toBe(3);
  });

  it('sıfırın altına inmiyor', () => {
    expect(clampPairs(4, -1)).toBe(0);
    expect(clampPairs(0, 3)).toBe(0);
  });

  // Pitfall 43: `Number('')` and `Number(null)` are both 0, and 0 is a LEGAL
  // answer here — so telling "missing" from "none" is the caller's job, and
  // this one only refuses what is not a number at all.
  it('sayı olmayan girdi sıfıra düşüyor, çökmüyor', () => {
    expect(clampPairs(6, NaN)).toBe(0);
    expect(clampPairs(6, Infinity)).toBe(0);
    expect(clampPairs(6, 0)).toBe(0);
  });

  it('zaten geçerli olan değere dokunmuyor', () => {
    expect(clampPairs(6, 2)).toBe(2);
    expect(clampPairs(6, 3)).toBe(3);
  });
});
