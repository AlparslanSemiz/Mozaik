// @vitest-environment jsdom

// Two library writes before React renders again must both land (review,
// 2026-11-17). Each operation used to rebuild the directory from the render's
// `library`, so the second of two calls made in one tick rebuilt it from
// before the first and dropped its row. No click reached it (every UI event
// renders in between), and the dropped plan's data stayed and came back as
// "Geri gelen plan" on the next start; the hook reads the library from a ref
// that `commit` updates at once, and these pin that down. The shape is the
// reviewer's proof (scratchpad `stale.test.tsx`), moved here.

import { act, useReducer } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LIBRARY_KEY } from '../../pure/io';
import { emptyState } from '../../pure/entities';
import { usePlans } from './usePlans';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let api: ReturnType<typeof usePlans>;

function Harness() {
  const [planId, setPlanId] = useReducer((_: string, next: string) => next, '1');
  api = usePlans({ planId, park: () => {}, openPlan: (id) => setPlanId(id) });
  return null;
}

interface Row {
  id: string;
  name: string;
}
const rows = (): Row[] =>
  (JSON.parse(localStorage.getItem(LIBRARY_KEY)!) as { plans: Row[] }).plans;

let root: Root;
beforeEach(() => {
  localStorage.clear();
  root = createRoot(document.createElement('div'));
  act(() => root.render(<Harness />));
});
afterEach(() => act(() => root.unmount()));

describe('usePlans: two writes in one tick', () => {
  it('create, then rename: both the new plan and the new name stay', () => {
    let id = '';
    act(() => {
      id = api.createPlan('A', emptyState());
      api.renamePlan('1', 'Yeni ad');
    });
    expect(rows().map((p) => p.id)).toContain(id);
    expect(rows().find((p) => p.id === '1')?.name).toBe('Yeni ad');
  });

  it('create twice: three plans', () => {
    act(() => {
      api.createPlan('A', emptyState());
      api.createPlan('B', emptyState());
    });
    expect(rows()).toHaveLength(3);
  });

  it('create, then mark it a draft: the row stays and is a draft', () => {
    let id = '';
    act(() => {
      id = api.createPlan('A', emptyState());
      api.markDraft(id, true);
    });
    expect(rows().map((p) => p.id)).toContain(id);
  });

  it('create two, then delete the first: the second stays', () => {
    let a = '';
    let b = '';
    act(() => {
      a = api.createPlan('A', emptyState());
      b = api.createPlan('B', emptyState());
      api.deletePlan(a);
    });
    const ids = rows().map((p) => p.id);
    expect(ids).not.toContain(a);
    expect(ids).toContain(b);
  });

  it('control: the same two calls in separate ticks', () => {
    act(() => {
      api.createPlan('A', emptyState());
    });
    act(() => {
      api.renamePlan('1', 'Yeni ad');
    });
    expect(rows()).toHaveLength(2);
  });
});
