import { describe, expect, it } from 'vitest';
import { reduce, type Box } from './undo';
import { sampleState } from '../io/sample';
import type { State } from '../../leaf/model';

const rename = (name: string) => (d: State) => ({
  ...d,
  settings: { ...d.settings, schoolName: name },
});

function start(): Box {
  return { present: sampleState(), past: [], future: [], planId: '1' };
}

describe('undo-if: bildirimin "Geri al"ı yalnız kendi adımını geri alıyor (SD1)', () => {
  it('silmenin hemen ardından basılınca o adımı geri alıyor', () => {
    const before = start();
    const after = reduce(before, { type: 'change', apply: rename('Silindi') });
    const undone = reduce(after, { type: 'undo-if', expected: after.present });
    expect(undone.present).toBe(before.present);
    expect(undone.future[0]).toBe(after.present);
  });

  it('araya başka bir düzenleme girdiyse hiçbir şeyi geri almıyor', () => {
    const after = reduce(start(), { type: 'change', apply: rename('Silindi') });
    const later = reduce(after, { type: 'change', apply: rename('Başka') });
    expect(reduce(later, { type: 'undo-if', expected: after.present })).toBe(later);
  });

  it('kendisi zaten geri alınmışsa ikinci kez basılınca bir şey yapmıyor', () => {
    const after = reduce(start(), { type: 'change', apply: rename('Silindi') });
    const once = reduce(after, { type: 'undo-if', expected: after.present });
    expect(reduce(once, { type: 'undo-if', expected: after.present })).toBe(once);
  });
});
