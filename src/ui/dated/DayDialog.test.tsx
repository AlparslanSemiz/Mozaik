// @vitest-environment jsdom

// The sentence under "Yok olanlar" when nothing changes. It said "… için bu gün
// ders yok" for a class too, and a class that is away does not lack lessons: its
// lessons are not held (audit 4, finding 5).

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { State } from '../../leaf/model/types';
import { makeWorld } from '../../pure/worlds';
import { LangProvider } from '../common/T';
import { ToastProvider } from '../common/Toasts';
import { DayDialog } from './DayDialog';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= NoopResizeObserver as unknown as typeof ResizeObserver;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.setItem('ders-programi-dil', 'tr');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function draw(state: State, person: string) {
  act(() =>
    root.render(
      <LangProvider>
        <ToastProvider>
          <DayDialog
            state={state}
            change={() => undefined}
            date="2026-11-17"
            setDate={() => undefined}
            person={person}
            onClose={() => undefined}
          />
        </ToastProvider>
      </LangProvider>,
    ),
  );
}

function world(): State {
  const d = makeWorld({
    days: 5,
    hours: 4,
    teachers: [{ id: 'oMC', short: 'MÇ' }],
    classes: [{ id: 's510', name: '510', roomId: null }],
    lessons: [],
    placements: {},
  });
  return { ...d, dated: { ...d.dated, absent: [] } };
}

describe('DayDialog boş cümlesi', () => {
  it('yok olan SINIF için dersleri yapılmayacağını söylüyor, "ders yok" demiyor', () => {
    const d = world();
    draw(
      {
        ...d,
        dated: { ...d.dated, absent: [{ id: 's510', from: '2026-11-17', to: '2026-11-17' }] },
      },
      's510',
    );
    const text = document.body.textContent ?? '';
    expect(text).toContain('510 sınıfı bu gün yok; o günün dersleri yapılmayacak.');
    expect(text).not.toContain('ders yok');
  });

  it('yok olan ÖĞRETMEN için derse girmediğini söylüyor', () => {
    const d = world();
    draw(
      {
        ...d,
        dated: { ...d.dated, absent: [{ id: 'oMC', from: '2026-11-17', to: '2026-11-17' }] },
      },
      'oMC',
    );
    expect(document.body.textContent ?? '').toContain(
      `${d.teachers[0]!.name} bu gün derse girmiyor; değişecek bir şey yok.`,
    );
  });
});
