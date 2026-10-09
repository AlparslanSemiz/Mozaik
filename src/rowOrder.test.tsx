// @vitest-environment jsdom

// The row handle's words follow the language while the list stays on screen.
//
// `grip` is memoized and is called on every render of the list, so whatever
// translator it closed over is what the handle says. Its dependency list once
// left `t` out (the one `exhaustive-deps` warning left on 2026-10-09): the list
// re-rendered in English and its handles kept the Turkish tooltip and name.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import './leaf/lang/en';
import { applyDil, setAktifDil, type Dil } from './leaf/i18n';
import { EMPTY_QUERY } from './pure/listview';
import { LangProvider, useLang } from './ui/T';
import { useRowOrder } from './ui/useRowOrder';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const ITEMS = ['MÇ', 'KY'];
let switchTo: (dil: Dil) => void = () => undefined;

function Liste() {
  switchTo = useLang().setDil;
  const order = useRowOrder({
    kind: 'teachers',
    count: ITEMS.length,
    items: ITEMS,
    query: EMPTY_QUERY,
    change: () => undefined,
  });
  return (
    <table>
      <thead>
        <tr>{order.head}</tr>
      </thead>
      <tbody ref={order.bodyRef}>
        {ITEMS.map((ad, i) => (
          <tr key={ad}>{order.grip(i, ad)}</tr>
        ))}
      </tbody>
    </table>
  );
}

describe('useRowOrder · dil değişince tutamak yeni dilde', () => {
  let root: Root | null = null;
  let host: HTMLElement | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    localStorage.clear();
    setAktifDil('tr');
  });

  it('liste ekrandayken Türkçe’den İngilizce’ye geçince ipucu ve ad İngilizce', () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    // jsdom's system language is English; the stored choice decides instead.
    applyDil('tr');
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    act(() =>
      root!.render(
        <LangProvider>
          <Liste />
        </LangProvider>,
      ),
    );
    const tutamak = () => host!.querySelector<HTMLButtonElement>('.row-grip')!;
    // Turkish first, so the switch below is a real change.
    expect(tutamak().title).toBe('Sürükleyerek ya da ok tuşlarıyla sırala');

    act(() => switchTo('en'));

    expect(tutamak().title).toBe('Drag or use the arrow keys to reorder');
    expect(tutamak().getAttribute('aria-label')).toBe('MÇ, position 1, up and down arrows to move');
    // The head is not memoized and was never stale; it is here so the
    // assertion above is about the handle, not about the switch.
    expect(host.querySelector('.row-no-col')?.getAttribute('title')).toBe('Order');
  });
});
