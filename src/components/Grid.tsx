// The main grid: row = teacher (or class), column = 7 days x 12 hours.
//
// There are ~2100 cells. Every ROW is memoised separately: one placement
// redraws 1-2 rows, not the whole table. During a drag nothing re-renders at
// all (see drag.ts).

import { memo, useEffect, useMemo, useRef } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Pin } from 'lucide-react';
import { useInspect } from './Inspector';
import type React from 'react';
import { dayLabel } from '../names';
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
  /**
   * The reader has locked this block in place: it survives "Baştan diz", it
   * cannot be dragged, removed or dropped on. Drawn with a mark and not only
   * with a colour — colour alone never carries state here.
   */
  pinned: boolean;
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
  /** Delete on a focused card, or the menu's own item: back to the pool. */
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
      // A LATER hour of a block, i.e. the cell whose neighbour to the left said
      // it continues. A day boundary resets it: `continues` never crosses one.
      const previous = s === 0 ? null : (row.cells[i - 1] ?? null);
      const inBlock = previous !== null && previous.continues;

      // "blok 2 saatlik olarak duruyorsa o iki farklı kart değil TEK kart
      // olarak gözükmeli, büyükçe kart olarak." So the hours of one block
      // become one <td> with one label, instead of several cards whose corners
      // were squared off to suggest they were one thing.
      //
      // EXCEPT across the lunch break, and that is not a nicety: the separator
      // is its own column and it deliberately carries no data-day, because
      // drag.ts finds its target with closest('[data-day]') and a droppable
      // lunch break is pitfall 13. Swallowing it inside a colSpan would give it
      // one. A block that straddles the break is therefore CUT at it and drawn
      // as two, which is also honest: on screen there really is something
      // between them. For a two-hour block that is the old drawing exactly;
      // a four-hour block split 2+2 by the break keeps both halves merged.
      const breakBefore = breakAt[g] === s;
      if (inBlock && !breakBefore) continue; // absorbed by the cell to its left

      // How many hours this ONE cell stands for. Walked rather than read off a
      // number, because the walk is what the break can interrupt: `continues`
      // says the block goes on, the break says this cell does not.
      let span = 1;
      if (cell !== null) {
        let k = s;
        while (
          k + 1 < hourCount &&
          breakAt[g] !== k + 1 &&
          row.cells[g * hourCount + k]?.continues === true
        ) {
          span++;
          k++;
        }
      }
      const spans = span > 1;

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
          // a cell up BY HOUR, and without this the later hours of a merged
          // block resolve to nothing and their highlight silently never paints.
          data-span={spans ? span : undefined}
          colSpan={spans ? span : undefined}
          className={className}
          title={cell !== null && cell.conflict === null ? `${cell.top} ${cell.bottom}` : undefined}
        >
          {cell !== null ? (
            // A left click used to REMOVE the block, which made moving a lesson
            // mean deleting it and dragging it out of the pool again. Now:
            //   left button + drag  -> move it
            //   right click         -> a menu (remove · edit · pin)
            //   Delete / Backspace  -> back to the pool, from the keyboard
            // `e.detail === 0` is how a keyboard-generated click is told from a
            // real one, which keeps Enter and Space working on a focused card.
            //
            // A PINNED card starts no drag at all. The refusal is also in
            // `removeBlock`, so nothing gets through by another road; stopping
            // here as well is what keeps the card from following the pointer
            // and then snapping back, which reads as a bug rather than a lock.
            <button
              type="button"
              className={
                (cell.conflict === null ? 'card' : 'card conflict') + (cell.pinned ? ' pinned' : '')
              }
              style={{ background: paletteColor(cell.color) }}
              draggable={false}
              onPointerDown={(e) => {
                if (!cell.pinned) onCellMoveStart(e, row.id, g, s);
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
              aria-label={
                cell.pinned
                  ? t('{ust} {alt}, sabitlenmiş', { ust: cell.top, alt: cell.bottom })
                  : t('{ust} {alt}, kaldırmak için Delete', { ust: cell.top, alt: cell.bottom })
              }
              title={
                cell.pinned
                  ? t('Sabitlenmiş. Sağ tıkla sabitlemeyi kaldırabilirsiniz')
                  : cell.conflict === null
                    ? t('Sürükleyerek taşıyın · sağ tık: seçenekler')
                    : t('{sorun}. Sürükleyerek taşıyın, sağ tıkla seçenekleri açın', {
                        sorun: cell.conflict,
                      })
              }
            >
              <span className="card-top">{cell.top}</span>
              {cell.bottom !== '' && <span className="card-bottom">{cell.bottom}</span>}
              {cell.pinned && <Pin className="card-pin" aria-hidden="true" />}
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
  /**
   * A right click landed on a placed card: which one. Called BEFORE the menu
   * opens, so whatever `menu` draws can be about this block.
   */
  onCellMenu: (rowId: string, day: number, hour: number) => void;
  /**
   * The menu's own content, drawn by the caller. Grid knows where the click
   * landed and nothing about what may be done there — removing a block, editing
   * a lesson and pinning a cell all need `change`, dialogs and the teacher →
   * class translation, none of which belong in a table that draws 2100 cells.
   */
  menu: React.ReactNode;
}

function GridInner({
  settings,
  rows,
  firstColumnTitle,
  draggedRowId,
  onCellRemove,
  onCellMoveStart,
  onCellMenu,
  menu,
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

  /**
   * ONE trigger for the whole table, not one per cell.
   *
   * 2100 cells, every row memoised (`Row` above): a trigger per card would put
   * a new element and a new handler into each of them and undo the one thing
   * this file is careful about. The event already says where it landed —
   * `data-row`, `data-day` and `data-hour` are on the <td> because drag.ts
   * needs them — so the menu reads the click the same way the drag does.
   *
   * A right click on anything that is NOT a card opens nothing: preventDefault
   * here runs before Radix's own handler (it composes ours first and checks
   * `defaultPrevented`), so an empty cell keeps behaving as it always did.
   */
  const openMenu = (e: React.MouseEvent) => {
    const card = (e.target as Element).closest?.('.card');
    const td = card?.closest('td[data-row]') as HTMLElement | null | undefined;
    if (card == null || td == null) {
      e.preventDefault();
      return;
    }
    onCellMenu(td.dataset.row ?? '', Number(td.dataset.day), Number(td.dataset.hour));
  };

  return (
    <div className="grid-wrap" ref={wrapRef}>
      <ContextMenu.Root>
      <ContextMenu.Trigger asChild onContextMenu={openMenu}>
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
                {dayLabel(day.name)}
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
      </ContextMenu.Trigger>
      {menu}
      </ContextMenu.Root>
    </div>
  );
}

export default memo(GridInner);
