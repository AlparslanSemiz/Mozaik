import { genderLabel, parseGender } from './gender';

describe('parseGender', () => {
  it('kadını dört yazımdan da tanıyor', () => {
    for (const raw of ['K', 'k', 'Kadın', 'kadın', 'KADIN', 'kadin', ' Kadın ', 'Bayan']) {
      expect(parseGender(raw), raw).toBe('k');
    }
  });

  it('erkeği de', () => {
    for (const raw of ['E', 'e', 'Erkek', 'ERKEK', ' erkek', 'Bay']) {
      expect(parseGender(raw), raw).toBe('e');
    }
  });

  // Anything unrecognised is "not stated" rather than an error: a paste that
  // half-fills the column is still a good paste, and the reader can finish it
  // in the list. An error here would reject 25 rows over one typo.
  it('tanımadığı her şey BELİRTİLMEMİŞ, hata değil', () => {
    for (const raw of ['', '   ', 'x', 'kadn', 'male', '1', 'Kadın Erkek']) {
      expect(parseGender(raw), raw).toBe('');
    }
  });

  it('her değerin okunacak bir adı var', () => {
    expect(genderLabel('')).toBe('Belirtilmemiş');
    expect(genderLabel('k')).toBe('Kadın');
    expect(genderLabel('e')).toBe('Erkek');
  });
});

