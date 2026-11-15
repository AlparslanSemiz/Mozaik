import { describe, expect, it } from 'vitest';
import { reduce, undoLabel, type Box } from './undo';
import { sampleState } from '../io/sample';
import { activePlacements, addProgram, blankProgram, removeProgram, switchProgram } from '../grid';
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

describe('seçenek değişikliği geçmişi silmiyor', () => {
  // Two seçenek: "a" holds one placed hour, "b" is empty and active.
  function twoOptions(): Box {
    const box = start();
    const withB = addProgram(box.present, blankProgram('b', 'Seçenek 2'));
    return { ...box, present: withB };
  }
  const onA = (d: State): State => switchProgram(d, d.programs[0]!.id);

  it('geçişten önceki düzenleme geçişten sonra da geri alınıyor', () => {
    const edited = reduce(start(), { type: 'change', apply: rename('Önce') });
    const switched = reduce(edited, {
      type: 'program-change',
      apply: (d) => addProgram(d, blankProgram('b', 'Seçenek 2')),
    });
    expect(switched.past).toHaveLength(2);
    const back = reduce(reduce(switched, { type: 'undo' }), { type: 'undo' });
    expect(back.present.settings.schoolName).not.toBe('Önce');
  });

  it('başka seçenekte yapılan düzenlemeyi geri almak o seçeneği geri getiriyor', () => {
    const box = twoOptions();
    // On "a", place one hour; then switch to "b"; then undo twice.
    const a = reduce(box, { type: 'program-change', apply: onA });
    const aId = a.present.activeProgramId;
    const lesson = a.present.lessons[0]!;
    const hour = { [`${lesson.classId}|0|0`]: lesson.id };
    const emptied = reduce(a, {
      type: 'change',
      apply: (d) => ({
        ...d,
        programs: d.programs.map((p) => (p.id === aId ? { ...p, placements: hour } : p)),
      }),
    });
    const onB = reduce(emptied, {
      type: 'program-change',
      apply: (d) => switchProgram(d, 'b'),
    });
    expect(onB.present.activeProgramId).toBe('b');
    const once = reduce(onB, { type: 'undo' });
    expect(once.present.activeProgramId).toBe(aId);
    expect(activePlacements(once.present)).toEqual(hour);
    const twice = reduce(once, { type: 'undo' });
    expect(twice.present.activeProgramId).toBe(aId);
    expect(activePlacements(twice.present)).toEqual({});
  });

  it('silinen seçenek geri alınınca yerleşimiyle geri geliyor', () => {
    const box = reduce(twoOptions(), { type: 'program-change', apply: onA });
    const aId = box.present.activeProgramId;
    const removed = reduce(box, {
      type: 'program-change',
      apply: (d) => removeProgram(d, aId),
    });
    expect(removed.present.programs.some((p) => p.id === aId)).toBe(false);
    const undone = reduce(removed, { type: 'undo-if', expected: removed.present });
    expect(undone.present).toBe(box.present);
  });

  it('plan değiştirmek geçmişi hâlâ siliyor', () => {
    const edited = reduce(start(), { type: 'change', apply: rename('X') });
    const other = reduce(edited, { type: 'switch', id: '2', state: sampleState() });
    expect(other.past).toEqual([]);
  });
});

describe('undoLabel: Ctrl+Z neyi geri aldığını söyleyebiliyor', () => {
  it('etiketli değişikliğin etiketini veriyor, geri alınınca öncekinin', () => {
    const one = reduce(start(), { type: 'change', apply: rename('A'), label: 'birinci' });
    const two = reduce(one, { type: 'change', apply: rename('B'), label: 'ikinci' });
    expect(undoLabel(two)).toBe('ikinci');
    expect(undoLabel(reduce(two, { type: 'undo' }))).toBe('birinci');
  });

  it('etiketsiz değişiklikte ve boş geçmişte bir şey söylemiyor', () => {
    expect(undoLabel(start())).toBeUndefined();
    expect(undoLabel(reduce(start(), { type: 'change', apply: rename('A') }))).toBeUndefined();
  });
});
