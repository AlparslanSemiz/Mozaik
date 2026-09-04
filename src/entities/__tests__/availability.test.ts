import { openHours, setAvailability, setWholeWeek } from '../availability';
import { build } from '../../entityFixture';

describe('openHours', () => {
  // 3 days x 4 hours = 12 cells; build() already closes one for MÇ.
  it('kapalı saat sayısı düşülmüş hâlde döner', () => {
    const d = build();
    expect(openHours(d, 'oMC')).toBe(11);
  });

  it('her kapatılan saat bir düşürür ve yalnız o varlığı etkiler', () => {
    const d = setAvailability(build(), 'oMC', [{ day: 0, hour: 0 }, { day: 1, hour: 3 }], true);
    expect(openHours(d, 'oMC')).toBe(9);
    expect(openHours(d, 's510')).toBe(12); // the class was never touched
  });

  it('sınıf ve derslik de aynı sözlüğü paylaşıyor', () => {
    const d = setWholeWeek(build(), 's510', true);
    expect(openHours(d, 's510')).toBe(0);
    expect(openHours(d, 'oMC')).toBe(11);
  });

  it('tanınmayan id için haftanın tamamı açık görünür', () => {
    expect(openHours(build(), 'yok')).toBe(12);
  });
});

