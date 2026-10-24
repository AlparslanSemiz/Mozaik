// One row of the grid, memoised on its own: a placement redraws one or two
// rows of ~2100 cells, not all of them (pitfall 10).

import { type Settings, paletteColor } from '../../leaf/model';
import type { GridRow, MaskMode } from '../../pure/program';
import { useT } from '../common';
import { Pin } from 'lucide-react';
import { memo } from 'react';
import type React from 'react';
import { useInspect } from './Inspector';

interface RowProps {
  row: GridRow;
  dayIndices: number[];
  hourCount: number;
  /** Per day: the hour index the long break falls BEFORE. -1 = no long break. */
  breakAt: number[];
  dayModes: Record<string, MaskMode>;
  settings: Settings;
  /** Delete on a focused card, or the menu's own item: back to the pool. */
  onCellRemove: (rowId: string, day: number, hour: number) => void;
  /** Left button down on a placed card: start moving the block. */
  onCellMoveStart: (e: React.PointerEvent, rowId: string, day: number, hour: number) => void;
  /**
   * The pin ON the card. It has to be stable (`useCallback`) or every row of
   * 84 cells redraws on each render and the memo above stops meaning anything.
   */
  onCellPin: (rowId: string, day: number, hour: number) => void;
}

/**
 * A class name on a card or a row head: all of it, with everything after the
 * first word in its own span, which Sığdır hides (styles.css). The father's
 * classes are "411A SAY" — number, room letter, track — and a one-hour card
 * in Sığdır has room for about three characters; "411A" says which class,
 * "41…" did not. The user chose this over a new short-name field
 * (2026-09-26): the data does not change, and the labels read the whole name.
 */
function ClassName({ name }: { name: string }) {
  const space = name.indexOf(' ');
  if (space <= 0) return name;
  return (
    <>
      {name.slice(0, space)}
      <span className="name-rest">{name.slice(space)}</span>
    </>
  );
}

export const Row = memo(function Row({
  row,
  dayIndices,
  hourCount,
  breakAt,
  dayModes,
  settings,
  onCellRemove,
  onCellMoveStart,
  onCellPin,
}: RowProps) {
  // Read from context INSIDE the memoised row rather than passed as a prop:
  // the provider's `open` is a `useCallback([])`, i.e. stable for the life of
  // the app, so this cannot be what re-renders 25 rows of 84 cells (pitfall 10).
  const inspect = useInspect();
  const t = useT();
  const cells = [];
  for (const [visibleDay, g] of dayIndices.entries()) {
    const dayMasked = dayModes[settings.days[g]?.name ?? ''] === 'ghost';
    for (let s = 0; s < hourCount; s++) {
      // The lunch break is its own narrow column. It carries NO data-day /
      // data-hour: drag.ts finds its target with closest('[data-day]') and
      // would otherwise treat the separator as a droppable cell.
      // Alternate days get a faint ground so the eye reads SIX DAYS instead of
      // 78 columns. It is a class rather than a `data-day` parity selector in
      // the stylesheet because the headings need the same band and they must
      // NOT carry data-day — drag.ts finds its target with
      // closest('[data-day]') and a heading would answer (pitfall 13).
      const band = visibleDay % 2 === 1 ? ' band' : '';

      if (breakAt[g] === s) {
        cells.push(
          <td key={`break-${g}`} className={`break-col${band}`} title={t('Öğle arası')} />,
        );
      }
      const i = g * hourCount + s;
      const cell = row.cells[i] ?? null;
      const closed = row.closed[i] === true;
      const cellMasked = row.mask !== undefined || dayMasked || cell?.mask !== undefined;
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
      // a three-hour block split 1+2 by the break keeps each side merged.
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
        dayMasked ? 'masked-scope' : '',
        cell?.mask !== undefined ? 'masked-scope' : '',
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
            //   Enter / Space       -> the same menu, from the keyboard
            // `e.detail === 0` is how a keyboard-generated click is told from a
            // real one.
            //
            // A PINNED card starts no drag at all. The refusal is also in
            // `removeBlock`, so nothing gets through by another road; stopping
            // here as well is what keeps the card from following the pointer
            // and then snapping back, which reads as a bug rather than a lock.
            <button
              type="button"
              className={
                (cell.conflict === null ? 'card' : 'card conflict') +
                (cell.pinned ? ' pinned' : '') +
                (cell.mark === undefined ? '' : ` mark-${cell.mark}`)
              }
              style={{ background: paletteColor(cell.color) }}
              draggable={false}
              disabled={cellMasked}
              onPointerDown={(e) => {
                if (!cell.pinned && !cellMasked) onCellMoveStart(e, row.id, g, s);
              }}
              // A keyboard click (Enter, Space) opens the card's menu, as the
              // shortcuts screen says; it used to send the lesson back to the
              // pool without a word (TODO §8d, 2026-09-26, the user's choice).
              // The menu is opened the way Shift+F10 opens it: a `contextmenu`
              // at the card, which the table's one trigger reads (openMenu).
              onClick={(e) => {
                if (e.detail !== 0) return;
                const box = e.currentTarget.getBoundingClientRect();
                e.currentTarget.dispatchEvent(
                  new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                    clientX: box.left + box.width / 2,
                    clientY: box.top + box.height / 2,
                  }),
                );
              }}
              onKeyDown={(e) => {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                  e.preventDefault();
                  onCellRemove(row.id, g, s);
                }
              }}
              aria-label={
                cell.mark === 'opened'
                  ? t('{ust} {alt}, açılan öğretmen saatinde', { ust: cell.top, alt: cell.bottom })
                  : cell.mark === 'moved'
                    ? t('{ust} {alt}, yeri değişiyor', { ust: cell.top, alt: cell.bottom })
                    : cell.pinned
                      ? t('{ust} {alt}, sabitlenmiş', {
                          ust: cell.top,
                          alt: cell.bottom,
                        })
                      : t('{ust} {alt}, kaldırmak için Delete', {
                          ust: cell.top,
                          alt: cell.bottom,
                        })
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
              <span className="card-top">
                {row.kind === 'teacher' ? <ClassName name={cell.top} /> : cell.top}
              </span>
              {cell.bottom !== '' && <span className="card-bottom">{cell.bottom}</span>}
              {cell.mark === 'opened' && (
                <span className="card-mark" aria-hidden="true">
                  +
                </span>
              )}
            </button>
          ) : closed ? (
            '×'
          ) : null}
          {/* THE PIN IS A CONTROL NOW, and a SIBLING of the card.
              ("Program kısmında kartların üzerinde sabitleye basınca dersi
               sabitlesin babamın en çok kullanacağı bu.")

              A sibling and not a child because `.card` is a <button>: a button
              inside a button is invalid HTML, the parser closes the outer one,
              and which of the two a click belongs to stops being anybody's
              guess. The <td> is the positioning context (styles.css), which is
              also why this sits outside the `cell !== null` branch above --
              the mark used to be the last child of the card.

              It is drawn on EVERY placed card but stays transparent until the
              card is hovered/focused. Once pinned it remains fully opaque,
              because at that point it is a status as well as a control. */}
          {cell !== null && (
            <button
              type="button"
              className="card-pin"
              aria-pressed={cell.pinned}
              disabled={cellMasked}
              // NO `stopPropagation` on pointerdown, and that is a measurement
              // rather than an oversight. The card starts a drag on its own
              // `onPointerDown`, so the obvious worry is that pressing the pin
              // picks the block up instead — but the pin is the card's SIBLING,
              // not its child, so the event never passes through it. Tried with
              // the guard deleted: no ghost, nothing moved. It would stop being
              // true the day this button moves inside the card, which is what
              // the press-and-drag in program.spec.ts 86 is there to catch.
              onClick={() => onCellPin(row.id, g, s)}
              aria-label={
                cell.pinned
                  ? t('{ust} {alt}: sabitlemeyi kaldır', {
                      ust: cell.top,
                      alt: cell.bottom,
                    })
                  : t('{ust} {alt}: buraya sabitle', {
                      ust: cell.top,
                      alt: cell.bottom,
                    })
              }
              title={
                cell.pinned ? t('Sabitlenmiş. Kaldırmak için tıklayın') : t('Dersi buraya sabitle')
              }
            >
              <Pin aria-hidden="true" />
            </button>
          )}
        </td>,
      );
    }
  }

  return (
    <tr data-row-id={row.id} className={row.mask === 'ghost' ? 'masked-scope' : undefined}>
      <th className="row-head" scope="row" data-menu-row={row.id}>
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
          {row.kind === 'class' ? <ClassName name={row.name} /> : row.name}
        </button>
        <span className="secondary">{row.secondary}</span>
      </th>
      {cells}
    </tr>
  );
});
