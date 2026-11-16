// One entity's week of closed hours as a paintable grid: drag to paint, a day
// name for the whole day, an hour number for that hour across the week, and
// one Tab stop with the arrows inside (DENETIM KS19).
//
// Drawn in two places since 2026-11-16 (Sadeleşme, K5): the Müsaitlik screen
// and the person page (`InspectorSheet.tsx`). One component, so the two cannot
// mean different things by a cross, and the keyboard and touch behaviour the
// Müsaitlik grid was measured with comes along to the page unchanged. It lives
// in `common/` because both callers are in packages that import each other's
// index (program ↔ availability), and a shared leaf breaks the circle.

import { useEffect, useMemo, useRef, useState } from 'react';
import { cellKey, parseCellKey, type Id, type State } from '../../leaf/model';
import { dayLabel, setAvailability, sharedPeriods, shortDay } from '../../pure/entities';
import { closedKey } from '../../pure/constraints';
import { attachRoving } from '../../platform/dom';
import { useT } from './T';

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
  /** Teacher, class or room: ids are unique across all three. */
  entityId: Id;
  /** "müsait" for a teacher, "açık" for a class or a room. */
  teacher: boolean;
  /** The table's accessible name. */
  label: string;
  /** Always show the bell times, whatever Müsaitlik's own switch says. */
  clock?: boolean;
}

export function AvailGrid({ state, change, entityId, teacher, label, clock = false }: Props) {
  const t = useT();
  // Nothing is applied until the drag ends: painting 40 cells must not create
  // 40 separate undo steps.
  const [pending, setPending] = useState<Set<string> | null>(null);
  const paintMode = useRef(false);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = sheet.current;
    if (box === null) return undefined;
    const buttonIn = (cell: HTMLTableCellElement | undefined) =>
      cell?.querySelector<HTMLElement>('button') ?? null;
    return attachRoving(box, {
      item: (from) => from.closest<HTMLElement>('table.availability button'),
      first: () => box.querySelector<HTMLElement>('tbody td button'),
      move: (from, e) => {
        const cell = from.closest<HTMLTableCellElement>('th, td');
        const table = from.closest('table');
        const row = cell?.parentElement as HTMLTableRowElement | null;
        if (cell == null || table === null || row == null) return null;
        let r = row.rowIndex;
        let c = cell.cellIndex;
        if (e.key === 'ArrowRight') c++;
        else if (e.key === 'ArrowLeft') c--;
        else if (e.key === 'ArrowDown') r++;
        else if (e.key === 'ArrowUp') r--;
        else if (e.key === 'Home') c = 1;
        else if (e.key === 'End') c = row.cells.length - 1;
        else return null;
        return buttonIn(table.rows[r]?.cells[c]) ?? from;
      },
    });
  }, []);

  // A column header carries one time; where the days disagree it stays empty.
  const clocks = useMemo(
    () => sharedPeriods(state.settings.bell, state.settings.hours, state.settings.days),
    [state.settings],
  );

  const isClosed = (g: number, s: number): boolean =>
    state.unavailable[closedKey(entityId, g, s)] !== undefined;

  const shownClosed = (g: number, s: number): boolean => {
    if (pending !== null && pending.has(cellKey(g, s))) return paintMode.current;
    return isClosed(g, s);
  };

  function startPaint(g: number, s: number) {
    paintMode.current = !isClosed(g, s); // invert the first cell, apply that to the rest
    setPending(new Set([cellKey(g, s)]));
  }

  function continuePaint(g: number, s: number) {
    setPending((previous) => {
      if (previous === null || previous.has(cellKey(g, s))) return previous;
      return new Set(previous).add(cellKey(g, s));
    });
  }

  function endPaint() {
    const set = pending;
    setPending(null);
    if (set === null || set.size === 0) return;
    const cells = [...set].map((k) => parseCellKey(k));
    change((d) => setAvailability(d, entityId, cells, paintMode.current));
  }

  /** A whole day (row header) or a whole hour (column header), or one cell. */
  function flip(cells: { day: number; hour: number }[]) {
    const allClosed = cells.every((c) => isClosed(c.day, c.hour));
    change((d) => setAvailability(d, entityId, cells, !allClosed));
  }

  /** What a cell is called: the hour, and the state in this kind's own word. */
  const cellName = (day: string, hour: number, closed: boolean) =>
    t('{gun} {n}. saat', { gun: dayLabel(day), n: hour + 1 }) +
    ', ' +
    (teacher ? (closed ? t('müsait değil') : t('müsait')) : closed ? t('kapalı') : t('açık'));

  return (
    <div className="scroll-x" ref={sheet}>
      <table
        className={clock ? 'availability with-clock' : 'availability'}
        role="grid"
        aria-label={label}
        onPointerUp={endPaint}
        onPointerLeave={endPaint}
      >
        <thead>
          <tr>
            {/* Named for a screen reader: an empty header cell names nothing (axe). */}
            <th className="corner-head">
              <span className="visually-hidden">{t('Gün')}</span>
            </th>
            {state.settings.hours.map((hour, s) => (
              <th key={s}>
                <button
                  type="button"
                  tabIndex={-1}
                  className="av-head"
                  onClick={() => flip(state.settings.days.map((_, g) => ({ day: g, hour: s })))}
                  // Named by its own number (label in name, WCAG 2.5.3), the
                  // sentence is the description, as on the day headings.
                  title={t('Haftanın bu saatini değiştir')}
                >
                  {hour}
                  <span className="hour-clock">{clocks[s]?.start ?? ''}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.settings.days.map((day, g) => (
            <tr key={g}>
              <th scope="row">
                <button
                  type="button"
                  tabIndex={-1}
                  className="av-head"
                  onClick={() => flip(state.settings.hours.map((_, s) => ({ day: g, hour: s })))}
                  // Named "Sal", as it reads; the sentence is the description
                  // (label in name, WCAG 2.5.3).
                  title={t('{gun}: bütün günü değiştir', { gun: dayLabel(day.name) })}
                >
                  {shortDay(day.name)}
                </button>
              </th>
              {state.settings.hours.map((_, s) => (
                <td
                  key={s}
                  className={[
                    shownClosed(g, s) ? 'closed' : '',
                    // The break sits at a different lesson on each row, so it
                    // cannot be a column: it is a thick edge on THIS cell.
                    day.longBreakAfter === s + 1 ? 'break-after' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    startPaint(g, s);
                  }}
                  onPointerEnter={() => {
                    if (pending !== null) continuePaint(g, s);
                  }}
                >
                  {/* A real control: aria-pressed is the state, the name says
                      it in words. The pointer still paints through the cell's
                      own handlers; a mouse click (detail > 0) is that paint,
                      so only the keyboard's click toggles here, or one click
                      would flip the hour twice. */}
                  <button
                    type="button"
                    tabIndex={-1}
                    className="av-cell"
                    aria-pressed={shownClosed(g, s)}
                    aria-label={cellName(day.name, s, shownClosed(g, s))}
                    onClick={(e) => {
                      if (e.detail === 0) flip([{ day: g, hour: s }]);
                    }}
                  >
                    {shownClosed(g, s) ? '×' : ''}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
