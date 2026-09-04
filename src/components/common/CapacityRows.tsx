// The capacity table, drawn once and read in two places.
//
// Okul → Özet and Kontrol were showing the SAME `ReportRow[]` in two different
// shapes: a compact `Ad | Açık | Yük | Durum` in the side column, and a
// `Durum | full sentence` two-column list on the Kontrol tab. The second one
// was 110px of badge beside a 1200px sentence, which is well past the length a
// line can still be read at, and it could not go in a side rail at all.
//
// They are one table now. `buildReport` literally returns `buildCapacity`'s
// rows (feasibility.ts), so this is one drawing of one fact rather than two
// that can drift.
//
// The sentence is not lost: it is the row's `title`, which is where it was in
// Özet already.

import { paletteColor } from '../../palette';
import type { ReportRow } from '../../feasibility';
import type { Id } from '../../types';
import { useT } from '../T';

const BADGE: Record<ReportRow['level'], string> = {
  ok: 'ok',
  tight: 'tight',
  impossible: 'impossible',
};

const BADGE_TEXT: Record<ReportRow['level'], string> = {
  ok: 'Uygun',
  tight: 'Sıkışık',
  impossible: 'İmkânsız',
};

const RANK: Record<ReportRow['level'], number> = { impossible: 0, tight: 1, ok: 2 };

export default function CapacityRows({
  rows,
  empty,
  problemsFirst = false,
  colorOf,
}: {
  rows: ReportRow[];
  empty: string;
  /**
   * Kontrol sorts, Özet does not. On the setup screen the order is the order
   * of the list you are looking at three centimetres to the left; on Kontrol
   * nothing else is on screen and the eye should land on what needs attention.
   */
  problemsFirst?: boolean;
  /** Palette index for a row, or null where the kind has none (rooms). */
  colorOf?: ((id: Id) => number | null) | undefined;
}) {
  const t = useT();
  if (rows.length === 0) return <p className="hint">{empty}</p>;
  const shown = problemsFirst
    ? [...rows].sort((a, b) => RANK[a.level] - RANK[b.level] || a.name.localeCompare(b.name, 'tr'))
    : rows;

  return (
    // A ROW PER TEACHER, so this is the one table on either screen that grows
    // with the school. Twenty-five of them make a column taller than the thing
    // it is summarising, and a summary you have to scroll past to reach the
    // next summary is not one. Bounded and scrolled in place, the pattern
    // `.entity-list` already uses for the same reason.
    <div className="stat-scroll">
      <table className="stat">
        <thead>
          <tr>
            <th>{t('Ad')}</th>
            <th className="num">{t('Açık')}</th>
            <th className="num">{t('Yük')}</th>
            <th>{t('Durum')}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id}>
              <td title={r.message}>
                {colorOf !== undefined && colorOf(r.id) !== null && (
                  <span className="row-dot" style={{ background: paletteColor(colorOf(r.id)!) }} />
                )}
                {r.name}
              </td>
              <td>{r.capacity}</td>
              <td>{r.load}</td>
              <td>
                <span className={`badge ${BADGE[r.level]}`}>{t(BADGE_TEXT[r.level])}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
