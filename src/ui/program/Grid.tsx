// The main grid: row = teacher (or class), column = 7 days x 12 hours.
//
// There are ~2100 cells. Every ROW is memoised separately: one placement
// redraws 1-2 rows, not the whole table. During a drag nothing re-renders at
// all (see drag.ts).

import { dayLabel } from '../../leaf/lang';
import type { Settings } from '../../leaf/model';
import { attachGridChrome, attachGridFit } from '../../platform/dom';
import { dayPeriods } from '../../pure/entities';
import type { GridRow, MaskMode, MenuTarget } from '../../pure/program';
import { useT } from '../common';
import { memo, useEffect, useMemo, useRef } from 'react';
import type React from 'react';
import { Row } from './GridRow';
import * as ContextMenu from '@radix-ui/react-context-menu';

/** What a right-click was about; its shape lives with the menu's reading (`describeMenu`). */
export type GridMenuTarget = MenuTarget;

interface Props {
  settings: Settings;
  rows: GridRow[];
  dayIndices: number[];
  dayModes: Record<string, MaskMode>;
  firstColumnTitle: string;
  onCellRemove: (rowId: string, day: number, hour: number) => void;
  onCellMoveStart: (e: React.PointerEvent, rowId: string, day: number, hour: number) => void;
  onCellPin: (rowId: string, day: number, hour: number) => void;
  /**
   * A right click landed on a placed card: which one. Called BEFORE the menu
   * opens, so whatever `menu` draws can be about this block.
   */
  onMenu: (target: GridMenuTarget) => void;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
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
  dayIndices,
  dayModes,
  firstColumnTitle,
  onCellRemove,
  onCellMoveStart,
  onCellPin,
  onMenu,
  menuOpen,
  onMenuOpenChange,
  menu,
}: Props) {
  const t = useT();
  const hourCount = settings.hours.length;
  const dayCount = dayIndices.length;

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
    if (wrap === null) return undefined;
    const detachChrome = attachGridChrome(wrap);
    const detachFit = attachGridFit(wrap);
    return () => {
      detachChrome();
      detachFit();
    };
  }, []);

  // Counts, not widths: the "Sığdır" density derives --cell-w from the box it
  // is in, and the week is not always 6x12 — a seven-day week is 84 columns
  // and a hard-coded 72 in the stylesheet would be wrong the day somebody adds
  // Pazartesi. The design rule bans a MEASUREMENT written in the JSX; these are
  // how many columns there are, which is data the stylesheet cannot know.
  const columns = {
    '--lesson-cols': dayCount * hourCount,
    '--break-cols': dayIndices.filter((day) => (breakAt[day] ?? -1) >= 0).length,
    // One day rule per day, drawn inside that day's first hour (styles.css).
    '--day-cols': dayCount,
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
    const element = e.target as Element;
    // Through the CELL and not through `.card`, because the card is no longer
    // the only thing in it: a right click that landed on the pin used to find
    // no `.card` above it, fall through every other branch and open nothing.
    const td = element.closest?.('td[data-row]') as HTMLElement | null | undefined;
    const card = td?.querySelector('.card') ?? null;
    if (card != null && td != null) {
      onMenu({
        kind: 'card',
        rowId: td.dataset.row ?? '',
        day: Number(td.dataset.day),
        hour: Number(td.dataset.hour),
      });
      return;
    }
    const row = element.closest<HTMLElement>('[data-menu-row]');
    if (row !== null) {
      onMenu({ kind: 'row', rowId: row.dataset.menuRow ?? '' });
      return;
    }
    const hour = element.closest<HTMLElement>('[data-menu-hour]');
    if (hour !== null) {
      onMenu({
        kind: 'column',
        day: Number(hour.dataset.menuDay),
        hour: Number(hour.dataset.menuHour),
      });
      return;
    }
    const day = element.closest<HTMLElement>('[data-menu-day]');
    if (day !== null) {
      onMenu({ kind: 'day', day: Number(day.dataset.menuDay) });
      return;
    }
    e.preventDefault();
  };

  return (
    <div className="grid-wrap" ref={wrapRef}>
      <ContextMenu.Root open={menuOpen} onOpenChange={onMenuOpenChange}>
        <ContextMenu.Trigger asChild onContextMenu={openMenu}>
          <table className="grid" style={columns}>
            {/* Explicit columns make `table-layout: fixed` an actual contract.
                In Sığdır the table owns exactly the container width; card text
                may ellipsize, but it cannot impose a min-content floor. */}
            <colgroup>
              <col className="grid-row-col" />
              {dayIndices.flatMap((g) =>
                settings.hours.flatMap((_, s) => [
                  ...(breakAt[g] === s
                    ? [<col key={`break-${g}`} className="grid-break-col" />]
                    : []),
                  <col
                    key={`${g}-${s}`}
                    className={s === 0 ? 'grid-hour-col day-first-col' : 'grid-hour-col'}
                  />,
                ]),
              )}
            </colgroup>
            <thead>
              <tr>
                <th className="corner" rowSpan={2}>
                  {firstColumnTitle}
                </th>
                {dayIndices.map((g, visibleDay) => {
                  const day = settings.days[g]!;
                  return (
                    <th
                      key={g}
                      data-menu-day={g}
                      colSpan={hourCount + ((breakAt[g] ?? -1) >= 0 ? 1 : 0)}
                      className={`${visibleDay % 2 === 1 ? 'day-head band' : 'day-head'}${dayModes[day.name] === 'ghost' ? ' masked-scope' : ''}`}
                    >
                      {dayLabel(day.name)}
                    </th>
                  );
                })}
              </tr>
              <tr>
                {dayIndices.map((g, visibleDay) =>
                  settings.hours.flatMap((hour, s) => [
                    ...(breakAt[g] === s
                      ? [
                          <th
                            key={`break-${g}`}
                            className={visibleDay % 2 === 1 ? 'break-col band' : 'break-col'}
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
                      data-menu-day={g}
                      data-menu-hour={s}
                      className={
                        [
                          s === 0 ? 'day-first' : '',
                          visibleDay % 2 === 1 ? 'band' : '',
                          dayModes[settings.days[g]?.name ?? ''] === 'ghost' ? 'masked-scope' : '',
                        ]
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
                  dayIndices={dayIndices}
                  hourCount={hourCount}
                  breakAt={breakAt}
                  dayModes={dayModes}
                  settings={settings}
                  onCellRemove={onCellRemove}
                  onCellMoveStart={onCellMoveStart}
                  onCellPin={onCellPin}
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

/**
 * The closed context menu is intentionally ignored. Program creates its portal
 * JSX while rendering the reason bar; treating that fresh ReactNode as grid
 * data would redraw the table on drag start and on every reason change. The
 * moment the menu opens, `menuOpen` changes and the current portal is rendered.
 */
function sameGridProps(a: Props, b: Props): boolean {
  return (
    a.settings === b.settings &&
    a.rows === b.rows &&
    a.dayIndices === b.dayIndices &&
    a.dayModes === b.dayModes &&
    a.firstColumnTitle === b.firstColumnTitle &&
    a.onCellRemove === b.onCellRemove &&
    a.onCellMoveStart === b.onCellMoveStart &&
    a.onCellPin === b.onCellPin &&
    a.onMenu === b.onMenu &&
    a.menuOpen === b.menuOpen &&
    a.onMenuOpenChange === b.onMenuOpenChange &&
    (!a.menuOpen || a.menu === b.menu)
  );
}

export default memo(GridInner, sameGridProps);
