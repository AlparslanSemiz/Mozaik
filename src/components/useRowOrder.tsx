/**
 * Putting a list into an order of your own — the part all four lists share.
 *
 * The order IS the array (see `reorderList`), so everything downstream follows
 * for free: the Program grid maps `state.teachers` to build its rows, the
 * printer maps it to build its pages, and the Müsaitlik picker maps it to build
 * its list. Dragging a row here is the only place any of them is decided.
 *
 * Two ways in, both required. The pointer is the one that will be used; the
 * keyboard is the one that makes the feature exist for someone who cannot use
 * a pointer, and it is also the precise one — Home/End beat dragging a row
 * past twenty others.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import type { ReactElement } from 'react';
import { reorderList } from '../entities';
import type { ListKind } from '../entities';
import { canReorder } from '../listview';
import type { ListQuery } from '../listview';
import { attachRowDrag, clampIndex } from '../rowDrag';
import type { State } from '../types';

interface Options {
  kind: ListKind;
  /** How many rows there are in total — a one-row list cannot be reordered. */
  count: number;
  /** The strip's current question. A sort or a filter locks the handles. */
  query: ListQuery;
  change: (apply: (d: State) => State) => void;
}

export interface RowOrder {
  /** Goes on the <tbody> holding the draggable rows. */
  bodyRef: (node: HTMLTableSectionElement | null) => void;
  /** For ListTools, so a keyboard move is spoken rather than only seen. */
  notice: string;
  /** The handle cell. `name` is what the row is called out loud. */
  grip: (index: number, name: string) => ReactElement;
}

export function useRowOrder({ kind, count, query, change }: Options): RowOrder {
  const [notice, setNotice] = useState('');
  const locked = !canReorder(query) || count < 2;

  // Read inside the gesture's callback rather than captured by it: the listeners
  // are attached once, and a stale `change` would write into an old State.
  const latest = useRef({ kind, count, change });
  latest.current = { kind, count, change };

  const move = useCallback((from: number, to: number, name: string) => {
    const { kind: k, count: n, change: apply } = latest.current;
    const target = clampIndex(to, n);
    if (target === from) return;
    apply((d) => reorderList(d, k, from, target));
    setNotice(`${name} ${target + 1}. sıraya taşındı.`);
  }, []);

  const detach = useRef<(() => void) | null>(null);
  const bodyRef = useCallback((node: HTMLTableSectionElement | null) => {
    detach.current?.();
    detach.current = null;
    if (node === null) return;
    detach.current = attachRowDrag({
      body: node,
      commit: (from, to) => {
        const row = node.children[from];
        const name = row?.getAttribute('data-row-name') ?? 'Satır';
        move(from, to, name);
      },
    });
  }, [move]);

  // The tbody can go away with the tab (pitfall 18) without the ref callback
  // being told, so the teardown also lives here.
  useEffect(() => () => detach.current?.(), []);

  const grip = useCallback(
    (index: number, name: string) => (
      <td className="grip-col">
        <button
          type="button"
          className="row-grip"
          disabled={locked}
          // The position is IN the name: a handle that says only "taşı" gives
          // no way to tell whether the last keypress did anything.
          aria-label={`${name}, ${index + 1}. sıra, taşımak için yukarı ve aşağı ok`}
          title={locked ? 'Elle sıralama için süzmeyi ve sıralamayı kaldırın' : 'Sürükleyerek sırala'}
          onKeyDown={(e) => {
            let next: number | null = null;
            if (e.key === 'ArrowUp') next = index - 1;
            else if (e.key === 'ArrowDown') next = index + 1;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = latest.current.count - 1;
            if (next === null) return;
            e.preventDefault();
            move(index, next, name);
          }}
        >
          <GripVertical size={16} aria-hidden="true" focusable="false" />
        </button>
      </td>
    ),
    [locked, move],
  );

  return { bodyRef, notice, grip };
}
