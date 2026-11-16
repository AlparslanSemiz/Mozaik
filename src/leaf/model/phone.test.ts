import { describe, expect, it } from 'vitest';
import { cleanPhone, whatsappNumber, whatsappUrl } from './phone';

describe('öğretmenin telefonu', () => {
  it('cleanPhone metin olmayanı boşaltıyor, numara karakteri olmayanı atıyor', () => {
    expect(cleanPhone(undefined)).toBe('');
    expect(cleanPhone(5321234567)).toBe('');
    expect(cleanPhone(' 0532 123 45 67\r\n')).toBe('0532 123 45 67');
    expect(cleanPhone('+90 (532) 123-45.67')).toBe('+90 (532) 123-45.67');
    expect(cleanPhone('0532&text=x')).toBe('0532');
    expect(cleanPhone('1'.repeat(40))).toHaveLength(32);
  });

  it('whatsappNumber Türkiye’de yazıldığı her biçimi aynı numaraya çeviriyor', () => {
    for (const typed of [
      '0532 123 45 67',
      '532 123 45 67',
      '+90 532 123 45 67',
      '0090 532 123 45 67',
      '(0532) 123-45-67',
      '905321234567',
    ]) {
      expect(whatsappNumber(typed), typed).toBe('905321234567');
    }
    // Another country, typed with its own code.
    expect(whatsappNumber('+49 151 2345 6789')).toBe('4915123456789');
    expect(whatsappNumber('0049 151 2345 6789')).toBe('4915123456789');
    // A landline without its 0 is still Istanbul, not Morocco (+212).
    expect(whatsappNumber('212 555 12 34')).toBe('902125551234');
  });

  it('whatsappNumber numaraya benzemeyeni geri çeviriyor', () => {
    for (const bad of [
      '',
      '123',
      '0532',
      '0000000000000',
      '+0 532 123 45 67',
      '1'.repeat(16),
      // No + or 00, and not a Turkish length: another country, guessed.
      '4915123456789',
    ]) {
      expect(whatsappNumber(bad), bad).toBeNull();
    }
  });

  it('whatsappUrl numarayı ve metni kodluyor', () => {
    expect(whatsappUrl('905321234567', 'Ali Hoca · Program & saat')).toBe(
      'https://wa.me/905321234567?text=Ali%20Hoca%20%C2%B7%20Program%20%26%20saat',
    );
  });
});
