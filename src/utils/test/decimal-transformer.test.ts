import { decimalTransformer } from '../decimal-transformer';

describe('decimalTransformer', () => {
  describe('to()', () => {
    it('should convert a number to a string with two decimal places', () => {
      expect(decimalTransformer.to(123.456)).toBe('123.46');
      expect(decimalTransformer.to(0)).toBe('0.00');
      expect(decimalTransformer.to(1.5)).toBe('1.50');
    });
  });

  describe('from()', () => {
    it('should convert a string to a number', () => {
      expect(decimalTransformer.from('123.45')).toBe(123.45);
      expect(decimalTransformer.from('0.00')).toBe(0);
      expect(decimalTransformer.from('1.50')).toBe(1.5);
    });

    it('should return NaN for invalid string values', () => {
      expect(decimalTransformer.from('invalid')).toBeNaN();
      expect(decimalTransformer.from('')).toBeNaN();
    });
  });
});
