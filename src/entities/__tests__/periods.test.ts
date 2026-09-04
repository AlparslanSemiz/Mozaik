import { hourLabels } from '../periods';

describe('hourLabels', () => {
  it('liste verilmezse 1..n üretir ve 1-16 aralığına sıkıştırır', () => {
    expect(hourLabels(3)).toEqual(['1', '2', '3']);
    expect(hourLabels(0)).toEqual(['1']);
    expect(hourLabels(40)).toHaveLength(16);
  });

  it('virgüllü liste verilirse onu kullanır, boşlukları temizler', () => {
    expect(hourLabels(2, ' Sabah , Öğle ,, Akşam ')).toEqual(['Sabah', 'Öğle', 'Akşam']);
  });

  it('liste tamamen boşsa sayıya düşer', () => {
    expect(hourLabels(2, '   ')).toEqual(['1', '2']);
    expect(hourLabels(2, ' , , ')).toEqual(['1', '2']);
  });
});

// docs/PLAN.md pitfall 15: slice(0,3) turns both "Cuma" and "Cumartesi" into
// "Cum" and the day rows become indistinguishable. There was no test for this.
