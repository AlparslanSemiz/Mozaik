// The class list's search, filter chips and sorts (Okul → Sınıflar).

import type { Vars } from '../../leaf/i18n';
import type { ClassGroup, State } from '../../leaf/model';
import { roomName, weeklyLoad } from '../entities';
import { buildCapacity } from '../feasibility';
import { loadStatusFacet } from './loadStatusFacet';
import { byNumberThen, compareTr, type ListConfig } from '../listview';

/** The `t()` the screen hands down, so a language switch rebuilds the list. */
type Translate = (key: string, vars?: Vars) => string;

/** Moved out of the screen's `useMemo` unchanged (2026-10-24); the screen still memoises it on [state, t]. */
export function classListConfig(state: State, t: Translate): ListConfig<ClassGroup> {
  const capacity = buildCapacity(state);
  return {
    haystack: (c) => `${c.name} ${roomName(state, c.roomId)}`,
    // Grouping classes by the room they share is the one grouping this
    // screen can offer that Kontrol cannot: it is what makes a room's load
    // legible before it becomes a clash.
    facets: [
      {
        id: 'derslik',
        label: t('Derslik'),
        of: (c) => (c.roomId === null ? '' : roomName(state, c.roomId)),
      },
      loadStatusFacet<ClassGroup>(capacity.classes, t),
    ],
    sorts: [
      {
        id: 'ad',
        label: t('Ada göre'),
        cmp: (a, b) => compareTr(a.name, b.name),
      },
      {
        id: 'derslik',
        label: t('Dersliğe göre'),
        cmp: (a, b) =>
          compareTr(roomName(state, a.roomId), roomName(state, b.roomId)) ||
          compareTr(a.name, b.name),
      },
      {
        id: 'yuk',
        label: t('Ders yüküne göre'),
        cmp: byNumberThen(
          (c) => weeklyLoad(state, 'class', c.id),
          (c) => c.name,
        ),
      },
    ],
  };
}
