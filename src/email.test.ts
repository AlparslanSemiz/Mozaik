import { describe, expect, it } from 'vitest';
import { cleanEmail, looksLikeEmail, mailtoUrl } from './leaf/email';

describe('öğretmenin e-postası', () => {
  it('cleanEmail metin olmayanı boşaltıyor, satır sonunu ve denetim karakterini atıyor', () => {
    expect(cleanEmail(undefined)).toBe('');
    expect(cleanEmail(42)).toBe('');
    expect(cleanEmail('  ali@example.com\r\n')).toBe('ali@example.com');
    expect(cleanEmail('a\u0000b\u007fc@example.com')).toBe('abc@example.com');
    // Turkish and non-ASCII letters are the user's own typing: kept.
    expect(cleanEmail('öğretmen@örnek.com')).toBe('öğretmen@örnek.com');
  });

  it('looksLikeEmail tek bir adresi kabul ediyor, liste, boşluk ve yarım adresi değil', () => {
    expect(looksLikeEmail('ali.veli@example.com')).toBe(true);
    expect(looksLikeEmail('a@b.co')).toBe(true);
    for (const kotu of [
      '',
      'ali',
      'ali@',
      '@example.com',
      'ali@example',
      'a b@example.com',
      'a@example.com, b@example.com',
      'a@example.com;b@example.com',
      'a@@example.com',
      'a@example.com.',
    ]) {
      expect(looksLikeEmail(kotu), kotu).toBe(false);
    }
  });

  it('mailtoUrl adresin @’ını tutuyor, konu ve gövdeyi kodluyor, satır sonu CRLF', () => {
    const url = mailtoUrl(
      'ali@example.com',
      'Program & saat',
      'Pazartesi\n  1. ders 510A\r\nSalı ğüşı',
    );
    expect(url).toBe(
      'mailto:ali@example.com?subject=Program%20%26%20saat&body=Pazartesi%0D%0A%20%201.%20ders%20510A%0D%0ASal%C4%B1%20%C4%9F%C3%BC%C5%9F%C4%B1',
    );
    // A "?" or "&" in the address cannot open a second header.
    expect(mailtoUrl('a?cc=b@example.com', '', '')).toBe(
      'mailto:a%3Fcc%3Db@example.com?subject=&body=',
    );
  });
});
