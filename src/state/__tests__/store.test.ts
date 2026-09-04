// The undo stack.
//
// `reduce` is pure, so the rule that matters most — undo must never carry one
// plan's move into another plan's file — can be pinned without mounting React.
// What a file turns into lives in parseState.test.ts, where the keys are lives
// in planStorage.test.ts.

import { emptyState } from '../../entities';
import { FIRST_PLAN_ID } from '../../plans/library';
import { sampleState } from '../sample';
import { reduce } from '../store';
import type { State } from '../../types';

const box = (present: State, planId = FIRST_PLAN_ID) => ({
  present,
  past: [emptyState()],
  future: [emptyState()],
  planId,
});

describe('reduce — plan kimliği', () => {
  it('plan değişince geri-al yığını SIFIRLANIYOR', () => {
    const next = reduce(box(sampleState()), {
      type: 'switch',
      id: 'abcd',
      state: emptyState(),
    });
    expect(next.planId).toBe('abcd');
    expect(next.past).toEqual([]);
    expect(next.future).toEqual([]);
  });

  it('düzenleme, geri al ve ileri al plan kimliğini taşıyor', () => {
    const start = box(sampleState(), 'abcd');
    const changed = reduce(start, { type: 'change', apply: (d) => ({ ...d, rooms: [] }) });
    expect(changed.planId).toBe('abcd');
    expect(reduce(changed, { type: 'undo' }).planId).toBe('abcd');
    expect(reduce(reduce(changed, { type: 'undo' }), { type: 'redo' }).planId).toBe('abcd');
    // A file opened with "Dosyadan aç" replaces the OPEN plan, it does not move.
    expect(reduce(start, { type: 'load', state: emptyState() }).planId).toBe('abcd');
  });

  it('gerçek bir değişiklik yoksa geçmiş kirletilmiyor', () => {
    const start = box(sampleState());
    expect(reduce(start, { type: 'change', apply: (d) => d })).toBe(start);
  });
});
