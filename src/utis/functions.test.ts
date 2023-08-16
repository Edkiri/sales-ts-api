import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isAlmostCero } from './functions';

describe('functions helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  describe('isAlmostCero', () => {
    it('should return true when 0 is passed', () => {
      const result = isAlmostCero(0);
      expect(result).toBe(true);
    });

    it('should return true when 0.009 is passed', () => {
      const result = isAlmostCero(0.009);
      expect(result).toBe(true);
    });

    it('should return true when -0.009 is passed', () => {
      const result = isAlmostCero(-0.009);
      expect(result).toBe(true);
    });

    it('should return false when 0.01 is passed', () => {
      const result = isAlmostCero(0.01);
      expect(result).toBe(false);
    });

    it('should return false when -0.01 is passed', () => {
      const result = isAlmostCero(-0.01);
      expect(result).toBe(false);
    });
  });
});
