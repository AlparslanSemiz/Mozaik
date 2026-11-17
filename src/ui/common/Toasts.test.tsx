// @vitest-environment jsdom

// The notices close by themselves. They did not in a real session (2026-11-17:
// "Örnek okul yüklendi" stayed over the grid for minutes and three stacked), so
// the clock is pinned here: the lifetime, the cap on a held notice, the three
// at most, and the "Geri al" that goes when another state is open.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { LangProvider } from './T';
import { ToastProvider, useToast, useToastFollow, ACTION_LIFETIME } from './Toasts';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

let root: Root;
let host: HTMLElement;
let say: ReturnType<typeof useToast>;

function Probe({ present }: { present: unknown }) {
  say = useToast();
  useToastFollow(present);
  return null;
}

function draw(present: unknown = 0) {
  act(() =>
    root.render(
      <LangProvider>
        <ToastProvider>
          <Probe present={present} />
        </ToastProvider>
      </LangProvider>,
    ),
  );
}

const shown = () => [...host.querySelectorAll('.toast-text')].map((n) => n.textContent);

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

describe('notices', () => {
  it('close after ten seconds, twenty with a button', () => {
    draw();
    act(() => void say('plain'));
    act(() => void say('with button', 'info', { label: 'Geri al', run: () => true }));
    expect(shown()).toHaveLength(2);
    act(() => void vi.advanceTimersByTime(10_001));
    expect(shown().join()).toContain('with button');
    expect(shown().join()).not.toContain('plain');
    act(() => void vi.advanceTimersByTime(ACTION_LIFETIME - 10_000));
    expect(shown()).toHaveLength(0);
  });

  it('a pointer resting on one holds it, but not for ever', () => {
    draw();
    act(() => void say('held'));
    const toast = host.querySelector('.toast');
    act(() => {
      toast?.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    });
    // Past its ten seconds, and still there: the pointer holds it.
    act(() => void vi.advanceTimersByTime(15_000));
    expect(shown()).toEqual(['held']);
    // ...but the cap ends it, pointer or not.
    act(() => void vi.advanceTimersByTime(16_000));
    expect(shown()).toHaveLength(0);
  });

  it('keeps three at most, the oldest falls', () => {
    draw();
    act(() => {
      say('one');
      say('two');
      say('three');
      say('four');
    });
    expect(shown().join()).toBe('two,three,four');
  });

  it('loses its button when another state is open', () => {
    const was = {};
    draw(was);
    act(() => void say('undoable', 'info', { label: 'Geri al', run: () => true, expected: was }));
    expect(host.querySelector('.toast-action')).not.toBeNull();
    draw({});
    expect(host.querySelector('.toast-action')).toBeNull();
    expect(shown()).toEqual(['undoable']);
  });

  it('Escape closes the newest from the grid, but not under an open dialog', () => {
    draw();
    const grid = document.createElement('div');
    grid.className = 'grid-wrap';
    const cell = document.createElement('button');
    grid.append(cell);
    document.body.append(grid);
    cell.focus();
    act(() => {
      say('older');
      say('newer');
    });
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    document.body.append(dialog);
    act(
      () => void cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    );
    expect(shown()).toEqual(['older', 'newer']);
    dialog.remove();
    act(
      () => void cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    );
    expect(shown()).toEqual(['older']);
    grid.remove();
  });

  it('the focus goes back where it came from when its notice closes', () => {
    draw();
    const before = document.createElement('button');
    document.body.append(before);
    before.focus();
    act(() => void say('note'));
    const close = host.querySelector<HTMLElement>('.toast-close')!;
    act(() => close.focus());
    expect(document.activeElement).toBe(close);
    act(() => void close.click());
    expect(shown()).toHaveLength(0);
    expect(document.activeElement).toBe(before);
    before.remove();
  });

  it('says nothing of Ctrl+Z when the button is not a history step', () => {
    draw();
    act(() => void say('a', 'info', { label: 'Geri al', run: () => true }));
    expect(host.querySelector('.sr-only')?.textContent).toContain('Ctrl+Z');
    act(() => void say('b', 'info', { label: 'Geri al', run: () => true, apart: true }));
    const texts = [...host.querySelectorAll('.toast-text')].map((n) => n.textContent);
    expect(texts[1]).not.toContain('Ctrl+Z');
  });
});
