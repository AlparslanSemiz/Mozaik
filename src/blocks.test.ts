import { describe, expect, it } from 'vitest';
import {
  BLOCK_SIZES,
  MAX_BLOCK,
  blockCounts,
  blockPlan,
  clampBlocks,
  maxCount,
  patternLabel,
  withCount,
} from './blocks';
import type { Lesson } from './types';

const lesson = (weeklyHours: number, blocks: number[]): Lesson => ({
  id: 'x1',
  classId: 's1',
  teacherId: 'o1',
  weeklyHours,
  blocks,
  second: false,
  maxPerDay: null,
});

describe('clampBlocks', () => {
  it('sıralar: her zaman büyükten küçüğe', () => {
    expect(clampBlocks(9, [2, 4, 3])).toEqual([4, 3, 2]);
  });

  it('2 ile 4 dışındaki her boyu atar', () => {
    expect(clampBlocks(20, [1, 0, -2, 5, 9, NaN, Infinity])).toEqual([]);
  });

  // Rounded and then judged, the same way every other count out of a file is
  // read: a hand-edited 2.5 is a 3, not a reason to throw the lesson away.
  it('kesirli boyu yuvarlar', () => {
    expect(clampBlocks(20, [2.5, 1.4])).toEqual([3]);
  });

  // A block list is not a second truth next to `weeklyHours` — it is the shape
  // of it, and a shape that outran the total would make `blockPlan` and
  // `placedBlocks` disagree about how many blocks exist (sanitize's job).
  it('haftalık saati AŞAMAZ, sondan düşürür', () => {
    expect(clampBlocks(5, [4, 3, 2])).toEqual([4]);
    expect(clampBlocks(7, [4, 3, 2])).toEqual([4, 3]);
    expect(clampBlocks(9, [4, 3, 2])).toEqual([4, 3, 2]);
  });

  // Cutting from the tail keeps the BIG blocks the reader asked for. Dropping
  // an hour from 4+2 has to leave 4, not 2.
  it('kırparken büyük bloğu korur', () => {
    expect(clampBlocks(5, [4, 2])).toEqual([4]);
  });

  it('dizi olmayan girdide boş liste', () => {
    expect(clampBlocks(6, undefined as unknown as number[])).toEqual([]);
    expect(clampBlocks(6, null as unknown as number[])).toEqual([]);
  });

  it('sıfır saatte hiçbir blok yok', () => {
    expect(clampBlocks(0, [4, 3, 2])).toEqual([]);
  });
});

describe('blockPlan', () => {
  // The whole reason the split is a list next to `weeklyHours` and not a second
  // total: whatever the list says, the hours have to add up.
  it('toplamı HER ZAMAN haftalık saate eşit', () => {
    for (let hours = 0; hours <= 24; hours++) {
      for (const blocks of [[], [2], [3], [4], [4, 4], [4, 3, 2], [2, 2, 2, 2], [3, 3, 3]]) {
        const sum = blockPlan(lesson(hours, blocks)).reduce((a, b) => a + b, 0);
        expect(sum, `${hours} saat / [${blocks.join(',')}]`).toBe(hours);
      }
    }
  });

  it('büyükten küçüğe: adlandırılan bloklar, sonra tek saatler', () => {
    expect(blockPlan(lesson(9, [3, 2]))).toEqual([3, 2, 1, 1, 1, 1]);
    expect(blockPlan(lesson(4, [4]))).toEqual([4]);
    expect(blockPlan(lesson(5, []))).toEqual([1, 1, 1, 1, 1]);
  });

  it('hiçbir parça 1 ile MAX_BLOCK dışına çıkmaz', () => {
    for (let hours = 1; hours <= 24; hours++) {
      for (const b of blockPlan(lesson(hours, [4, 3, 2, 2]))) {
        expect(b).toBeGreaterThanOrEqual(1);
        expect(b).toBeLessThanOrEqual(MAX_BLOCK);
      }
    }
  });
});

describe('patternLabel', () => {
  it('kısa olanı açık yazar', () => {
    expect(patternLabel([2, 1])).toBe('2+1');
    expect(patternLabel([4, 3, 2, 1])).toBe('4+3+2+1');
    expect(patternLabel([1])).toBe('1');
  });

  it('boş liste için kısa çizgi', () => {
    expect(patternLabel([])).toBe('–');
  });

  it('dörtten uzun olanı katlar', () => {
    expect(patternLabel([1, 1, 1, 1, 1])).toBe('5×1');
    expect(patternLabel([2, 2, 2, 1, 1])).toBe('3×2 + 2×1');
  });

  // The fold used to count twos and call EVERYTHING else a single, which was
  // the same thing while a block could only be 1 or 2. It is not the same thing
  // now: this list would have read "5×1".
  it('katlarken her boyu AYRI sayar', () => {
    expect(patternLabel([3, 3, 3, 1, 1])).toBe('3×3 + 2×1');
    expect(patternLabel([4, 3, 2, 1, 1])).toBe('1×4 + 1×3 + 1×2 + 2×1');
  });
});

describe('blockCounts', () => {
  it('her boyu sayar, tek saatleri saymaz', () => {
    expect(blockCounts([4, 3, 3, 2])).toEqual({ 4: 1, 3: 2, 2: 1 });
    expect(blockCounts([])).toEqual({ 4: 0, 3: 0, 2: 0 });
    expect(blockCounts([1, 1, 1])).toEqual({ 4: 0, 3: 0, 2: 0 });
  });
});

describe('maxCount', () => {
  // The ceiling a stepper stops at, asked with the OTHER counters standing:
  // "how many threes fit in 9 hours" is the wrong question when two of those
  // hours are already spoken for.
  it('ÖTEKİ blokları hesaba katar', () => {
    expect(maxCount(9, [], 3)).toBe(3);
    expect(maxCount(9, [2], 3)).toBe(2);
    expect(maxCount(9, [4], 3)).toBe(1);
  });

  it('kendi boyunu iki kez saymaz', () => {
    expect(maxCount(9, [3, 3], 3)).toBe(3);
  });

  it('sığmıyorsa sıfır', () => {
    expect(maxCount(3, [], 4)).toBe(0);
    expect(maxCount(5, [4], 3)).toBe(0);
  });
});

describe('withCount', () => {
  it('yalnız o boyu değiştirir', () => {
    expect(withCount(9, [3, 2], 3, 2)).toEqual([3, 3, 2]);
    expect(withCount(9, [3, 2], 3, 0)).toEqual([2]);
  });

  it('tavanı aşamaz', () => {
    expect(withCount(9, [], 4, 99)).toEqual([4, 4]);
    expect(withCount(9, [2], 4, 99)).toEqual([4, 2]);
  });

  it('okunamayan sayıyı sıfır sayar', () => {
    expect(withCount(9, [3], 3, NaN)).toEqual([]);
  });

  // Every reachable split is still a legal one — the steppers cannot be driven
  // into a shape `clampBlocks` would have to repair afterwards.
  it('her çıktı zaten kelepçeli', () => {
    for (let hours = 0; hours <= 14; hours++) {
      let blocks: number[] = [];
      for (const size of BLOCK_SIZES) {
        for (let n = 0; n <= 6; n++) {
          blocks = withCount(hours, blocks, size, n);
          expect(clampBlocks(hours, blocks), `${hours}h ${size}×${n}`).toEqual(blocks);
        }
      }
    }
  });
});
