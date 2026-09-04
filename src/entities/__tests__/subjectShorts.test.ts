import { emptyState } from '../defaults';
import { DEFAULT_SUBJECT_SHORTS } from '../../names';
import { defaultSubjects } from '../subjectList';
import { defaultSubjectShort, setSubjectShort, subjectShort } from '../subjectShorts';

describe('subjectShort', () => {
  const blank = emptyState();

  it('gömülü tablodan gelir', () => {
    expect(subjectShort(blank.settings, 'Matematik')).toBe('Mat');
    expect(subjectShort(blank.settings, 'İngilizce')).toBe('İng');
    expect(subjectShort(blank.settings, 'Beden Eğitimi')).toBe('Bed');
  });

  it('büyük/küçük harf ve boşluk fark etmez', () => {
    expect(subjectShort(blank.settings, '  matematik ')).toBe('Mat');
    expect(subjectShort(blank.settings, 'MATEMATİK')).toBe('Mat');
  });

  it('bilinmeyen branş ilk üç harfe düşer, Türkçe büyük harfle', () => {
    expect(subjectShort(blank.settings, 'Astronomi')).toBe('Ast');
    expect(subjectShort(blank.settings, 'ispanyolca')).toBe('İsp');
    expect(subjectShort(blank.settings, 'Şu')).toBe('Şu');
    expect(subjectShort(blank.settings, '')).toBe('');
  });

  it('override gömülü tabloyu ezer', () => {
    const d = setSubjectShort(blank, 'Matematik', 'Mtk');
    expect(subjectShort(d.settings, 'Matematik')).toBe('Mtk');
    expect(subjectShort(d.settings, 'matematik')).toBe('Mtk');
  });
});

describe('setSubjectShort', () => {
  it('YALNIZCA değiştirileni saklar — yedek dosyası şişmesin', () => {
    let d = emptyState();
    d = setSubjectShort(d, 'Matematik', 'Mat'); // the default: nothing to store
    expect(d.settings.subjectShorts).toEqual({});

    d = setSubjectShort(d, 'Matematik', 'Mtk');
    expect(d.settings.subjectShorts).toEqual({ matematik: 'Mtk' });
  });

  it('varsayılana geri yazılınca override silinir', () => {
    let d = setSubjectShort(emptyState(), 'Fizik', 'Fiz');
    expect(d.settings.subjectShorts).toEqual({ fizik: 'Fiz' });
    d = setSubjectShort(d, 'Fizik', 'Fzk');
    expect(d.settings.subjectShorts).toEqual({});
  });

  it('boş bırakmak override siler, varsayılana döner', () => {
    let d = setSubjectShort(emptyState(), 'Kimya', 'KMY');
    d = setSubjectShort(d, 'Kimya', '   ');
    expect(d.settings.subjectShorts).toEqual({});
    expect(subjectShort(d.settings, 'Kimya')).toBe('Kim');
  });


  // Two different facts that used to be one. `defaultSubjects()` is the
  // BUILT-IN table — what a pre-v5 backup falls back to, and what the Branşlar
  // step offers on the side. `emptyState()` is what a NEW project starts with,
  // and it starts with nothing, so that offer is not empty on the one screen
  // it matters. Asserting both here so neither can quietly become the other.
  it('yeni proje BOŞ branş listesiyle doğuyor, gömülü tablo ise duruyor', () => {
    expect(emptyState().settings.subjects).toEqual([]);
    expect(defaultSubjects()).toHaveLength(21);
    expect(defaultSubjects()).toContain('Matematik');
  });

  it('gömülü tablodaki her kısaltma kendi varsayılanıdır', () => {
    for (const [subject, short] of Object.entries(DEFAULT_SUBJECT_SHORTS)) {
      expect(defaultSubjectShort(subject)).toBe(short);
    }
  });
});

