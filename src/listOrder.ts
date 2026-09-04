// A list as a LIST: the order its rows sit in, and the colours handed out along
// that order. Both are operations on the array itself, not on any one entity.

import { PALETTE_SIZE } from './palette';
import type { State } from './types';

/**
 * Hands out a fresh colour to every teacher (or class) in list order. Only ever
 * called from the button in Ayarlar: after a few deletions the used indexes are
 * full of holes and two neighbouring rows can end up looking alike.
 */
export function respreadColors(d: State, kind: 'teacher' | 'class'): State {
  if (kind === 'teacher') {
    return { ...d, teachers: d.teachers.map((t, i) => ({ ...t, color: i % PALETTE_SIZE })) };
  }
  return { ...d, classes: d.classes.map((c, i) => ({ ...c, color: i % PALETTE_SIZE })) };
}

/** The lists the reader can put into an order of their own. */
export type ListKind = 'rooms' | 'teachers' | 'classes' | 'lessons' | 'subjects';

/**
 * Moves one row of one list to another position.
 *
 * There is NO order field and there will not be one: the array IS the order.
 * It survives `parseState` (asArray -> map -> spreadColors and asNames all
 * preserve it), `sanitize` never rebuilds `rooms` or `teachers` at all, and the
 * grid, the printer and every picker already read the list by mapping it — so
 * writing the array is the whole feature. A second `order: number` alongside it
 * would be a second truth to keep in step.
 *
 * `subjects` is the odd one and only in WHERE it lives — `settings.subjects`
 * rather than the top level — so it gets a branch here rather than its own
 * function. What it orders is the Branş dropdown on the Öğretmenler step.
 *
 * Returns `d` ITSELF when nothing moves. The reducer compares by identity to
 * decide whether a change is worth an undo step, so a drag that lands where it
 * started must be indistinguishable from no drag at all.
 */
export function reorderList(d: State, kind: ListKind, from: number, to: number): State {
  const list: readonly unknown[] = kind === 'subjects' ? d.settings.subjects : d[kind];
  if (from === to) return d;
  if (from < 0 || from >= list.length) return d;
  if (to < 0 || to >= list.length) return d;

  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return d;
  next.splice(to, 0, moved);
  // No sanitize(): an order change cannot orphan a placement or a closed hour.
  // Every key in those maps is built from ids, never from a position.
  return kind === 'subjects'
    ? { ...d, settings: { ...d.settings, subjects: next as string[] } }
    : ({ ...d, [kind]: next } as State);
}
