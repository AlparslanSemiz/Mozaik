// The room list's search, filter chips and sorts (Okul → Derslikler).

import type { Vars } from '../../leaf/i18n';
import type { Room, State } from '../../leaf/model';
import { roomClasses, weeklyLoad } from '../entities';
import { buildCapacity } from '../feasibility';
import { loadStatusFacet } from './loadStatusFacet';
import { byNumberThen, compareTr, type ListConfig } from '../listview';

/** The `t()` the screen hands down, so a language switch rebuilds the list. */
type Translate = (key: string, vars?: Vars) => string;

/** Moved out of the screen's `useMemo` unchanged (2026-10-24); the screen still memoises it on [state, t]. */
export function roomListConfig(state: State, t: Translate): ListConfig<Room> {
  const capacity = buildCapacity(state);
  return {
    haystack: (r) =>
      `${r.name} ${roomClasses(state, r.id)
        .map((c) => c.name)
        .join(' ')}`,
    facets: [loadStatusFacet<Room>(capacity.rooms, t)],
    sorts: [
      {
        id: 'ad',
        label: t('Ada göre'),
        cmp: (a, b) => compareTr(a.name, b.name),
      },
      {
        id: 'yuk',
        label: t('Ders yüküne göre'),
        cmp: byNumberThen(
          (r) => weeklyLoad(state, 'room', r.id),
          (r) => r.name,
        ),
      },
      {
        id: 'sinif',
        label: t('Sınıf sayısına göre'),
        cmp: byNumberThen(
          (r) => roomClasses(state, r.id).length,
          (r) => r.name,
        ),
      },
    ],
  };
}
