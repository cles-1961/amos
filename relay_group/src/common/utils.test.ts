import { describe, expect, it } from 'vitest';
import { getNearestNumber, removeItem } from './utils'

describe('utils', () => {
  describe('getNearestNumber', () => {
    it('[1, 4, 5] 最接近 3 的數值為 4', () => {
      const result = getNearestNumber([1, 4, 5], 3);
      expect(result).eq(4);
    });

    it('[1, 4, 5] 最接近 1 的數值為 1', () => {
      const result = getNearestNumber([1, 4, 5], 1);
      expect(result).eq(1);
    });

    it('[1, 4, 5] 最接近 6 的數值為 5', () => {
      const result = getNearestNumber([1, 4, 5], 6);
      expect(result).eq(5);
    });
  })

  describe('removeItem', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8];

    it(`刪除 [0]`, () => {
      const result = removeItem(data, [1]);
      expect(result).toEqual([1, 3, 4, 5, 6, 7, 8]);
    });

    it(`刪除 [0, 2]`, () => {
      const result = removeItem(data, [0, 2]);
      expect(result).toEqual([2, 4, 5, 6, 7, 8]);
    });

    it(`刪除 [4, 5]`, () => {
      const result = removeItem(data, [4, 5]);
      expect(result).toEqual([1, 2, 3, 4, 7, 8]);
    });
  })
})