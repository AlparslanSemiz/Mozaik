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

  it('a pointer resting on one does not keep it for ever', () => {
    draw();
    act(() => void say('held'));
    const toast = host.querySelector('.toast');
    act(() => {
      toast?.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
      toast?.dispatchEvent(new PointerEvent('pointerenter'));
    });
    act(() => void vi.advanceTimersByTime(15_000));
    // Whether jsdom delivered the enter or not, nothing may outlive the cap.
    act(() => void vi.advanceTimersByTime(20_000));
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
});
