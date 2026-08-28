// The main grid: row = teacher (or class), column = 7 days x 12 hours.
//
// There are ~2100 cells. Every ROW is memoised separately: one placement
// redraws 1-2 rows, not the whole table. During a drag nothing re-renders at
// all (see drag.ts).

import { memo, useEffect, useMemo, useRef } from 'react';
import { useInspect } from './Inspector';
import type React from 'react';
import { dayPeriods } from '../bell';
import { attachGridChrome } from '../gridChrome';
import { paletteColor } from '../palette';
import type { Settings, Id } from '../types';
import { useT } from './T';

export interface GridCell {
  lessonId: Id;
  top: string; // class name ("510") or teacher short form
  bottom: string; // room letter ("A") or subject
  color: number;
  /** Does the block continue into the next hour — then no separator is drawn. */
  continues: boolean;
  /** The hour has since been closed for this teacher, class or room. */
  conflict: string | null;
}

export interface GridRow {
  id: string;
  /** Which list the row's id belongs to — the inspector needs to know. */
  kind: 'teacher' | 'class';
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
  /** Right click, or Delete on a focused card: send the block back to the pool. */
  onCellRemove: (rowId: string, day: number, hour: number) => void;
  /** Left button down on a placed card: start moving the block. */
  onCellMoveStart: (e: React.PointerEvent, rowId: string, day: number, hour: number) => void;
}

const Row = memo(function Row({
  row,
  dayCount,
  hourCount,
  breakAt,
  dim,
  onCellRemove,
  onCellMoveStart,
}: RowProps) {
  // Read from context INSIDE the memoised row rather than passed as a prop:
  // the provider's `open` is a `useCallback([])`, i.e. stable for the life of
  // the app, so this cannot be what re-renders 25 rows of 84 cells (pitfall 10).
  const inspect = useInspect();
  const t = useT();
  const cells = [];
  for (let g = 0; g < dayCount; g++) {
    for (let s = 0; s < hourCount; s++) {
      // The lunch break is its own narrow column. It carries NO data-day /
      // data-hour: drag.ts finds its target with closest('[data-day]') and
      // would otherwise treat the separator as a droppable cell.
      // Alternate days get a faint ground so the eye reads SIX DAYS instead of
      // 78 columns. It is a class rather than a `data-day` parity selector in
      // the stylesheet because the headings need the same band and they must
      // NOT carry data-day — drag.ts finds its target with
      // closest('[data-day]') and a heading would answer (pitfall 13).
      const band = g % 2 === 1 ? ' band' : '';

      if (breakAt[g] === s) {
        cells.push(
          <td key={`break-${g}`} className={`break-col${band}`} title={t('Öğle arası')} />,
        );
      }
      const i = g * hourCount + s;
      const cell = row.cells[i] ?? null;
      const closed = row.closed[i] === true;
      // The SECOND half of a block, i.e. the cell whose neighbour to the left
      // said it continues. A day boundary resets it: `continues` never crosses
      // one.
      const previous = s === 0 ? null : (row.cells[i - 1] ?? null);
      const inBlock = previous !== null && previous.continues;

      // "blok 2 saatlik olarak duruyorsa o iki farklı kart değil TEK kart
      // olarak gözükmeli, büyükçe kart olarak." So the two halves become one
      // <td> with colSpan 2 and one label, instead of two cards whose corners
      // were squared off to suggest they were one thing.
      //
      // EXCEPT across the lunch break, and that is not a nicety: the separator
      // is its own column and it deliberately carries no data-day, because
      // drag.ts finds its target with closest('[data-day]') and a droppable
      // lunch break is pitfall 13. Swallowing it inside a colSpan would give it
      // one. A block whose two hours straddle the break therefore keeps the old
      // two-card drawing, which is also honest: on screen there really is
      // something between them.
      const breakBefore = breakAt[g] === s;
      const breakAfter = breakAt[g] === s + 1;
      if (inBlock && !breakBefore) continue; // absorbed by the cell to its left
      const spans = cell !== null && cell.continues && !breakAfter;

      const className = [
        s === 0 ? 'day-first' : '',
        spans ? 'block-wide' : '',
        !spans && cell !== null && cell.continues ? 'block-cont' : '',
        inBlock ? 'block-in' : '',
        cell === null && closed ? 'unavailable' : '',
        band.trim(),
      ]
        .filter(Boolean)
        .join(' ');

      cells.push(
        <td
          key={i}
          data-row={row.id}
          data-day={g}
          data-hour={s}
          // WHICH COLUMN OF THE WEEK this cell stands at, counted in hours and
          // ignoring the lunch separators. gridChrome.ts lights a column with
          // it, and it has to be an attribute rather than a position: a merged
          // block is ONE <td> with colSpan 2, so from the day that landed the
          // n-th <td> of one row and the n-th of the next were different hours
          // and the crosshair drifted left of the pointer (pitfall 85).
          data-col={i}
          // How many hours this one <td> stands for. drag.ts needs it: it looks
          // a cell up BY HOUR, and without this the second hour of a merged
          // block resolves to nothing and its highlight silently never paints.
          data-span={spans ? 2 : undefined}
          colSpan={spans ? 2 : undefined}
          className={className}
          title={cell !== null && cell.conflict === null ? `${cell.top} ${cell.bottom}` : undefined}
        >
          {cell !== null ? (
            // A left click used to REMOVE the block, which made moving a lesson
            // mean deleting it and dragging it out of the pool again. Now:
            //   left button + drag  -> move it
            //   right click         -> send it back to the pool
            //   Delete / Backspace  -> the same, from the keyboard
            // `e.detail === 0` is how a keyboard-generated click is told from a
            // real one, which keeps Enter and Space working on a focused card.
            <button
              type="button"
              className={cell.conflict === null ? 'card' : 'card conflict'}
              style={{ background: paletteColor(cell.color) }}
              draggable={false}
              onPointerDown={(e) => onCellMoveStart(e, row.id, g, s)}
              onContextMenu={(e) => {
                e.preventDefault();
                onCellRemove(row.id, g, s);
              }}
              onClick={(e) => {
                if (e.detail === 0) onCellRemove(row.id, g, s);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                  e.preventDefault();
                  onCellRemove(row.id, g, s);
                }
              }}
              aria-label={t('{ust} {alt}, kaldırmak için Delete', {
                ust: cell.top,
                alt: cell.bottom,
              })}
              title={
                cell.conflict === null
                  ? t('Sürükleyerek taşıyın · sağ tık: havuza geri gönderir')
                  : t('{sorun}. Sürükleyerek taşıyın, sağ tıkla havuza gönderin', {
                      sorun: cell.conflict,
                    })
              }
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
        {/* The row head IS the entity, so it is what opens its sheet: from the
            grid, "what does MÇ's whole week look like" used to mean reading a
            row 78 columns long by eye. */}
        <button
          className="inspect"
          onClick={() => inspect(row.kind, row.id)}
          title={t('{ad}: bilgileri ve haftalık programı', { ad: row.name })}
        >
          {row.name}
        </button>
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
  onCellRemove: (rowId: string, day: number, hour: number) => void;
  onCellMoveStart: (e: React.PointerEvent, rowId: string, day: number, hour: number) => void;
}

function GridInner({
  settings,
  rows,
  firstColumnTitle,
  draggedRowId,
  onCellRemove,
  onCellMoveStart,
}: Props) {
  const t = useT();
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

  // Attached once to the scroll container, never re-run: the chrome reads the
  // DOM it is pointing at, so it does not care how many times the rows redraw.
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    return wrap === null ? undefined : attachGridChrome(wrap);
  }, []);

  // Counts, not widths: the "Sığdır" density derives --cell-w from the box it
  // is in, and the week is not always 6x12 — a seven-day week is 84 columns
  // and a hard-coded 72 in the stylesheet would be wrong the day somebody adds
  // Pazartesi. The design rule bans a MEASUREMENT written in the JSX; these are
  // how many columns there are, which is data the stylesheet cannot know.
  const columns = {
    '--lesson-cols': dayCount * hourCount,
    '--break-cols': breakAt.filter((at) => at >= 0).length,
  } as React.CSSProperties;

  return (
    <div className="grid-wrap" ref={wrapRef}>
      <table className={`grid${draggedRowId !== null ? ' dragging' : ''}`} style={columns}>
        <thead>
          <tr>
            <th className="corner" rowSpan={2}>
              {firstColumnTitle}
            </th>
            {settings.days.map((day, g) => (
              <th
                key={g}
                colSpan={hourCount + ((breakAt[g] ?? -1) >= 0 ? 1 : 0)}
                className={g % 2 === 1 ? 'day-head band' : 'day-head'}
              >
                {day.name}
              </th>
            ))}
          </tr>
          <tr>
            {settings.days.map((_, g) =>
              settings.hours.flatMap((hour, s) => [
                ...(breakAt[g] === s
                  ? [
                      <th
                        key={`break-${g}`}
                        className={g % 2 === 1 ? 'break-col band' : 'break-col'}
                        title={t('Öğle arası')}
                      />,
                    ]
                  : []),
                <th
                  key={`${g}-${s}`}
                  // The same column number as the body cell under it, so the
                  // crosshair can light both. Deliberately NOT data-day/
                  // data-hour: drag.ts finds its target with
                  // closest('[data-day]') and a heading answering that is
                  // pitfall 13.
                  data-col={g * hourCount + s}
                  className={
                    [s === 0 ? 'day-first' : '', g % 2 === 1 ? 'band' : '']
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
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
              onCellRemove={onCellRemove}
              onCellMoveStart={onCellMoveStart}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(GridInner);
