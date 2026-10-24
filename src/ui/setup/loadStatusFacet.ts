import { type ReportRow, type LoadStatus, loadStatus } from '../../pure/feasibility';
import type { Facet } from '../../pure/listview';
import type { Id } from '../../leaf/model';
import type { Translate } from '../common';

const STATUS_KEYS: Record<LoadStatus, string> = {
  empty: 'Boş',
  ok: 'Uygun',
  tight: 'Sıkışık',
  impossible: 'İmkânsız',
};

const STATUS_ORDER: LoadStatus[] = ['empty', 'ok', 'tight', 'impossible'];

/** A shared facet so the three setup lists cannot drift from Kontrol's math. */
export function loadStatusFacet<T extends { id: Id }>(rows: ReportRow[], t: Translate): Facet<T> {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const labels = STATUS_ORDER.map((status) => t(STATUS_KEYS[status]));

  return {
    id: 'yuk-durumu',
    label: t('Yük durumu'),
    of: (item) => {
      const row = byId.get(item.id);
      return row === undefined ? '' : t(STATUS_KEYS[loadStatus(row.capacity, row.load)]);
    },
    order: (label) => {
      const rank = labels.indexOf(label);
      return rank < 0 ? Number.MAX_SAFE_INTEGER : rank;
    },
  };
}
