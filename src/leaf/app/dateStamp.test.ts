import { describe, expect, it } from 'vitest';
import { printStamp } from './dateStamp';

describe('printStamp', () => {
  it('tr-TR toLocaleString ile birebir aynı, Intl olmadan', () => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    let x = 12345;
    for (let i = 0; i < 2000; i++) {
      x = (x * 1103515245 + 12345) % 2147483648;
      const d = new Date(2000 + (x % 40), x % 12, 1 + (x % 28), x % 24, x % 60);
      expect(printStamp(d)).toBe(d.toLocaleString('tr-TR', options));
    }
  });
  it('gece yarısı ve tek haneli değerler sıfırla dolduruluyor', () => {
    expect(printStamp(new Date(2026, 0, 5, 0, 7))).toBe('05.01.2026 00:07');
  });
});
