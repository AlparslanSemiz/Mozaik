import { describe, expect, it } from 'vitest';
import {
  BLOCK_SIZES,
  MAX_BLOCK,
  blockPlan,
  clampBlocks,
  patternLabel,
  patternOptions,
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
  it('yalnız 2 ve 3 saatlik blokları büyükten küçüğe tutar', () => {
    expect(MAX_BLOCK).toBe(3);
    expect(BLOCK_SIZES).toEqual([3, 2]);
    expect(clampBlocks(9, [2, 4, 3])).toEqual([3, 2]);
    expect(clampBlocks(20, [1, 0, -2, 4, 5, 9, NaN, Infinity])).toEqual([]);
  });

  it('kesirli boyu yuvarlar', () => {
    expect(clampBlocks(20, [2.5, 1.4])).toEqual([3]);
  });

  it('haftalık saati aşmaz ve büyük blokları önce korur', () => {
    expect(clampBlocks(4, [3, 2])).toEqual([3]);
    expect(clampBlocks(5, [3, 2])).toEqual([3, 2]);
    expect(clampBlocks(7, [3, 3, 2])).toEqual([3, 3]);
  });

  it('dizi olmayan girdide boş liste verir', () => {
    expect(clampBlocks(6, undefined as unknown as number[])).toEqual([]);
    expect(clampBlocks(6, null as unknown as number[])).toEqual([]);
  });
});

describe('blockPlan', () => {
  it('toplamı her zaman haftalık saate eşittir', () => {
    for (let hours = 0; hours <= 40; hours++) {
      for (const blocks of [[], [2], [3], [3, 3], [3, 2], [2, 2, 2, 2]]) {
        const plan = blockPlan(lesson(hours, blocks));
        expect(plan.reduce((sum, size) => sum + size, 0), `${hours} / ${blocks}`).toBe(hours);
        expect(plan.every((size) => size >= 1 && size <= MAX_BLOCK)).toBe(true);
      }
    }
  });

  it('adlandırılan blokları, ardından tek saatleri yazar', () => {
    expect(blockPlan(lesson(9, [3, 2]))).toEqual([3, 2, 1, 1, 1, 1]);
    expect(blockPlan(lesson(4, [3]))).toEqual([3, 1]);
    expect(blockPlan(lesson(5, []))).toEqual([1, 1, 1, 1, 1]);
  });
});

describe('patternLabel', () => {
  it('kısa dağılımı açık, uzun dağılımı katlanmış yazar', () => {
    expect(patternLabel([2, 1])).toBe('2+1');
    expect(patternLabel([3, 2, 1])).toBe('3+2+1');
    expect(patternLabel([1, 1, 1, 1, 1])).toBe('5×1');
    expect(patternLabel([3, 3, 3, 1, 1])).toBe('3×3 + 2×1');
    expect(patternLabel([])).toBe('–');
  });
});

describe('patternOptions', () => {
  it('büyük bloklardan tek saatlere doğru kararlı sıradadır', () => {
    expect(patternOptions(6).map((option) => option.plan)).toEqual([
      [3, 3],
      [3, 2, 1],
      [3, 1, 1, 1],
      [2, 2, 2],
      [2, 2, 1, 1],
      [2, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
    ]);
  });

  it('1–40 saat için bütün benzersiz 3/2/1 kombinasyonlarını üretir', () => {
    for (let hours = 1; hours <= 40; hours++) {
      const options = patternOptions(hours);
      const keys = new Set(options.map((option) => option.plan.join(',')));
      expect(keys.size, `${hours} saatte tekrar var`).toBe(options.length);

      for (const option of options) {
        expect(option.plan.reduce((sum, size) => sum + size, 0)).toBe(hours);
        expect(option.plan.every((size) => size >= 1 && size <= 3)).toBe(true);
        expect(option.blocks.every((size) => size === 2 || size === 3)).toBe(true);
        expect(option.label).toBe(patternLabel(option.plan));
      }

      const expectedCount = Array.from(
        { length: Math.floor(hours / 3) + 1 },
        (_, threes) => Math.floor((hours - threes * 3) / 2) + 1,
      ).reduce((sum, count) => sum + count, 0);
      expect(options).toHaveLength(expectedCount);
    }
  });
});
