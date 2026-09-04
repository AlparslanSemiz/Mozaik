import { defaultDays, emptyState } from '../defaults';
import { WEEK, shortDay } from '../../schedule/names';

describe('varsayılan hafta', () => {
  it('Pazartesi hariç 6 gün, hafta sonu öğle arası 6. dersten sonra', () => {
    const days = defaultDays();
    expect(days.map((x) => x.name)).toEqual([
      'Salı',
      'Çarşamba',
      'Perşembe',
      'Cuma',
      'Cumartesi',
      'Pazar',
    ]);
    expect(days.find((x) => x.name === 'Cuma')!.longBreakAfter).toBe(5);
    expect(days.find((x) => x.name === 'Pazar')!.longBreakAfter).toBe(6);
  });

  it('boş durum 6 gün x 12 saat ile başlar', () => {
    const d = emptyState();
    expect(d.settings.days).toHaveLength(6);
    expect(d.settings.hours).toHaveLength(12);
    expect(d.settings.bell.start).toBe('09:00');
  });
});

describe('shortDay', () => {
  it('yedi günün kısaltması benzersiz', () => {
    const shorts = WEEK.map(shortDay);
    expect(shorts).toEqual(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pzr']);
    expect(new Set(shorts).size).toBe(7);
  });

  it('Cuma ile Cumartesi ayrışır, Pazartesi ile Pazar ayrışır', () => {
    expect(shortDay('Cuma')).not.toBe(shortDay('Cumartesi'));
    expect(shortDay('Pazartesi')).not.toBe(shortDay('Pazar'));
  });

  it('bilinmeyen gün adı ilk üç harfe düşer, çökmez', () => {
    expect(shortDay('Bayram')).toBe('Bay');
    expect(shortDay('')).toBe('');
  });
});

