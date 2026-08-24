// The main grid: row = teacher (or class), column = 7 days x 12 hours.
//
// There are ~2100 cells. Every ROW is memoised separately: one placement
// redraws 1-2 rows, not the whole table. During a drag nothing re-renders at
// all (see drag.ts).

import { memo, useMemo } from 'react';
import { dayPeriods } from '../bell';
import { paletteColor } from '../palette';
import type { Settings, Id } from '../types';

export interface GridCell {
  lessonId: Id;
  top: string; // class name ("510") or teacher short form
  bottom: string; // room letter ("A") or subject
  color: number;
  /** Does the block continue into the next hour — then no separator is drawn. */
  continues: boolean;
}

export interface GridRow {
  id: string;
  name: string;
  secondary: string;
  /** Palette index of the row's OWN entity: the teacher, or the class. */
  color: number;
  /** Length = days x hours. Index = day * hourCount + hour. */
  cells: Array<GridCell | null>;
  /** Hours the teacher cannot come. Always false in the class view. */
  closed: boolean[];
}

interface RowProps {
  row: GridRow;
  dayCount: number;
  hourCount: number;
  /** Per day: the hour index the long break falls BEFORE. -1 = no long break. */
  breakAt: number[];
  dim: boolean;
  onCellClick: (rowId: string, day: number, hour: number) => void;
}

const Row = memo(function Row({ row, dayCount, hourCount, breakAt, dim, onCellClick }: RowProps) {
  const cells = [];
  for (let g = 0; g < dayCount; g++) {
    for (let s = 0; s < hourCount; s++) {
      // The lunch break is its own narrow column. It carries NO data-day /
      // data-hour: drag.ts finds its target with closest('[data-day]') and
      // would otherwise treat the separator as a droppable cell.
      if (breakAt[g] === s) {
        cells.push(<td key={`break-${g}`} className="break-col" title="Öğle arası" />);
      }
      const i = g * hourCount + s;
      const cell = row.cells[i] ?? null;
      const closed = row.closed[i] === true;

      const className = [
        s === 0 ? 'day-first' : '',
        cell !== null && cell.continues ? 'block-cont' : '',
        cell === null && closed ? 'unavailable' : '',
      ]
        .filter(Boolean)
        .join(' ');

      cells.push(
        <td
          key={i}
          data-row={row.id}
          data-day={g}
          data-hour={s}
          className={className}
          title={cell !== null ? `${cell.top} ${cell.bottom}` : undefined}
        >
          {cell !== null ? (
            <button
              type="button"
              className="card"
              style={{ background: paletteColor(cell.color) }}
              onClick={() => onCellClick(row.id, g, s)}
              title="Kaldırmak için tıklayın"
            >
              <span className="card-top">{cell.top}</span>
              {cell.bottom !== '' && <span className="card-bottom">{cell.bottom}</span>}
            </button>
          ) : closed ? (
            '×'
          ) : null}
        </td>,
      );
    }
  }

  return (
    <tr className={dim ? '' : 'target-row'}>
      <th className="row-head" scope="row">
        {/* The row's own colour. In the teacher view it repeats the colour of
            the cards in that row, which is what makes a pool card findable; in
            the class view it is the only place a class colour appears at all. */}
        <span className="row-dot" style={{ background: paletteColor(row.color) }} />
        {row.name}
        <span className="secondary">{row.secondary}</span>
      </th>
      {cells}
    </tr>
  );
});

interface Props {
  settings: Settings;
  rows: GridRow[];
  firstColumnTitle: string;
  /** Id of the target row while dragging; the other rows dim. */
  draggedRowId: string | null;
  onCellClick: (rowId: string, day: number, hour: number) => void;
}

function GridInner({ settings, rows, firstColumnTitle, draggedRowId, onCellClick }: Props) {
  const hourCount = settings.hours.length;
  const dayCount = settings.days.length;

  // Bell times per day: the long break sits at a different period on weekdays
  // and at the weekend, so each day gets its own clock.
  const clocks = useMemo(
    () =>
      settings.days.map((day) => ({
        periods: dayPeriods(settings.bell, settings.hours, day.longBreakAfter),
        // The break is drawn on the LEFT edge of the period that follows it.
        breakAt: day.longBreakAfter > 0 && day.longBreakAfter < hourCount ? day.longBreakAfter : -1,
      })),
    [settings.days, settings.bell, settings.hours, hourCount],
  );
  const breakAt = useMemo(() => clocks.map((x) => x.breakAt), [clocks]);

  return (
    <div className="grid-wrap">
      <table className={`grid${draggedRowId !== null ? ' dragging' : ''}`}>
        <thead>
          <tr>
            <th className="corner" rowSpan={2}>
              {firstColumnTitle}
            </th>
            {settings.days.map((day, g) => (
              <th
                key={g}
                colSpan={hourCount + ((breakAt[g] ?? -1) >= 0 ? 1 : 0)}
                className="day-head"
              >
                {day.name}
              </th>
            ))}
          </tr>
          <tr>
            {settings.days.map((_, g) =>
              settings.hours.flatMap((hour, s) => [
                ...(breakAt[g] === s
                  ? [<th key={`break-${g}`} className="break-col" title="Öğle arası" />]
                  : []),
                <th
                  key={`${g}-${s}`}
                  className={s === 0 ? 'day-first' : undefined}
                  title={
                    clocks[g] === undefined
                      ? undefined
                      : `${clocks[g]?.periods[s]?.start ?? ''}–${clocks[g]?.periods[s]?.end ?? ''}`
                  }
                >
                  {hour}
                  <span className="hour-clock">{clocks[g]?.periods[s]?.start ?? ''}</span>
                </th>,
              ]),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Row
              key={row.id}
              row={row}
              dayCount={dayCount}
              hourCount={hourCount}
              breakAt={breakAt}
              dim={draggedRowId !== null && draggedRowId !== row.id}
              onCellClick={onCellClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(GridInner);
