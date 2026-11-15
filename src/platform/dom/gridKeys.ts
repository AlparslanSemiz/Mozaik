// The Program grid from the keyboard: one Tab stop, arrows between cells
// (DENETIM KS8). Rows are the teachers or classes, columns the hours of the
// week; the row head is the column before the first hour.
//
// Pure DOM over attributes the grid already draws for drag.ts and the
// crosshair (`data-row`, `data-day`, `data-hour`, `data-col`, `data-span`),
// so moving focus re-renders nothing (pitfall 10). A column is found by the
// `data-col` a cell COVERS, never by counting cells: a merged block is one
// <td> for two or three hours (pitfall 85).

import { t } from '../../leaf/i18n';
import { attachRoving, focusItem } from './roving';

type Cell = HTMLTableCellElement;

const CELL = 'td[data-col], th.row-head';

/** What takes focus in a cell: its card, the row head's button, or the cell itself. */
function target(cell: Cell): HTMLElement | null {
  if (cell.tagName === 'TH') return cell.querySelector<HTMLElement>('button.inspect');
  const card = cell.querySelector<HTMLButtonElement>('button.card');
  return card !== null && !card.disabled ? card : cell;
}

function cellOf(el: Element): Cell | null {
  return el.closest<Cell>(CELL);
}

/** The hour columns a body cell covers, `[first, last]`. */
function columns(cell: Cell): [number, number] {
  const first = Number(cell.dataset.col);
  return [first, first + Math.max(1, Number(cell.dataset.span) || 1) - 1];
}

function rowCells(row: HTMLTableRowElement): Cell[] {
  return [...row.querySelectorAll<Cell>('td[data-col]')];
}

/** The cell of `row` that covers column `col`, or the nearest one before it. */
function cellAtColumn(row: HTMLTableRowElement, col: number): Cell | null {
  if (col < 0) return row.querySelector<Cell>('th.row-head');
  let best: Cell | null = null;
  for (const cell of rowCells(row)) {
    const [first, last] = columns(cell);
    if (first <= col && col <= last) return cell;
    if (first <= col) best = cell;
  }
  return best ?? rowCells(row)[0] ?? null;
}

/** "Salı 3. saat" for a body cell, read off the heading it stands under. */
export function cellPlace(wrap: HTMLElement, day: number, hour: number): string {
  const head = wrap.querySelector(`thead th[data-menu-day="${day}"]:not([data-menu-hour])`);
  return t('{gun} {n}. saat', { gun: head?.textContent ?? '', n: hour + 1 });
}

/** Focus the cell at (row, day, hour) once React has drawn it, card or empty. */
export function focusCellSoon(rowId: string, day: number, hour: number): void {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const wrap = document.querySelector<HTMLElement>('.grid-wrap');
      const row = [...(wrap?.querySelectorAll<HTMLTableRowElement>('tbody tr') ?? [])].find(
        (r) => r.dataset.rowId === rowId,
      );
      // By containment: the hour may now sit inside a merged block (pitfall 85).
      const cell =
        row === undefined
          ? null
          : (rowCells(row).find((c) => {
              const first = Number(c.dataset.hour);
              const span = Math.max(1, Number(c.dataset.span) || 1);
              return Number(c.dataset.day) === day && first <= hour && hour < first + span;
            }) ?? null);
      const covering = cell ?? (row === undefined ? null : cellAtColumn(row, -1));
      const to = covering === null ? null : target(covering);
      if (wrap === null || to === null) return;
      labelEmpty(wrap, to);
      focusItem(to);
    }),
  );
}

/**
 * An empty cell has nothing to say, so a screen reader landing on it would
 * hear only "blank". It gets a name while it holds focus, and only then:
 * 2100 labels written in every row render would be paid on every placement
 * for the one cell somebody is on.
 */
function labelEmpty(wrap: HTMLElement, el: HTMLElement) {
  if (el.tagName !== 'TD') return;
  // Focusable on demand: 2100 tabindex attributes in every row render would
  // be paid for the one cell somebody is on (the same reason as the name).
  if (!el.hasAttribute('tabindex')) el.tabIndex = -1;
  // A closed cell already carries its word ("kapalı"); it is kept and given back.
  const own = el.dataset.kbdLabel ?? el.getAttribute('aria-label') ?? '';
  const place = cellPlace(wrap, Number(el.dataset.day), Number(el.dataset.hour));
  // The row's name too, the way a card's name carries it: up and down change
  // the row and nothing else in the sentence would say so.
  const who = el.closest('tr')?.querySelector('.row-head .inspect')?.textContent ?? '';
  const parts = [place, who, own === '' ? t('boş') : own].filter((x) => x !== '');
  const said = parts.join(', ');
  el.setAttribute('aria-label', said);
  el.dataset.kbdLabel = own;
  el.dataset.kbdSaid = said;
}

export function attachGridKeys(wrap: HTMLElement): () => void {
  // The column a vertical walk aims for. Kept across ↑ ↓ so passing through a
  // three-hour block does not pull the walk to the block's first hour.
  let aim = -1;

  const rows = () => [...wrap.querySelectorAll<HTMLTableRowElement>('table.grid tbody tr')];

  const detach = attachRoving(wrap, {
    item: (from) => {
      const cell = cellOf(from);
      return cell === null ? null : target(cell);
    },
    first: () => {
      const row = rows()[0];
      const cell = row === undefined ? null : (rowCells(row)[0] ?? null);
      return cell === null ? null : target(cell);
    },
    prepare: (item) => labelEmpty(wrap, item),
    move: (from, e) => {
      const cell = cellOf(from);
      const row = cell?.closest('tr');
      if (cell == null || row == null) return null;
      const head = cell.tagName === 'TH';
      const [first, last] = head ? [-1, -1] : columns(cell);
      const all = rows();
      const at = all.indexOf(row);
      let to: Cell | null = null;
      const vertical =
        e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown';
      if (!vertical) aim = -1;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowLeft': {
          // Siblings, not columns: the lunch separator has no data-col and is
          // stepped over, a merged block is one step, and the row head is the
          // step before the first hour whichever day that is.
          const forward = e.key === 'ArrowRight';
          let el = forward ? cell.nextElementSibling : cell.previousElementSibling;
          while (el !== null && !el.matches(CELL)) {
            el = forward ? el.nextElementSibling : el.previousElementSibling;
          }
          to = el as Cell | null;
          break;
        }
        case 'ArrowDown':
        case 'ArrowUp':
        case 'PageDown':
        case 'PageUp': {
          if (aim < 0 || aim < first || aim > last) aim = first;
          const step =
            e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : e.key === 'PageDown' ? 10 : -10;
          const next = all[Math.max(0, Math.min(all.length - 1, at + step))];
          to = next === undefined ? null : cellAtColumn(next, head ? -1 : aim);
          break;
        }
        case 'Home': {
          const r = e.ctrlKey ? all[0] : row;
          to = r === undefined ? null : (rowCells(r)[0] ?? null);
          break;
        }
        case 'End': {
          const r = e.ctrlKey ? all[all.length - 1] : row;
          const list = r === undefined ? [] : rowCells(r);
          to = list[list.length - 1] ?? null;
          break;
        }
        default:
          return null;
      }
      return to === null ? from : target(to);
    },
  });

  // The borrowed name goes when focus does: React may draw a card into this
  // cell next, and a cell still called "boş" would be read over it.
  function focusout(e: FocusEvent) {
    const el = e.target as HTMLElement;
    const own = el.dataset.kbdLabel;
    if (el.tagName !== 'TD' || own === undefined) return;
    // Only if the name is still ours: React may have written its own while the
    // cell had focus (an hour opened by Ctrl+Z), and that one stays.
    if (el.getAttribute('aria-label') === el.dataset.kbdSaid) {
      if (own === '') el.removeAttribute('aria-label');
      else el.setAttribute('aria-label', own);
    }
    delete el.dataset.kbdLabel;
    delete el.dataset.kbdSaid;
  }
  wrap.addEventListener('focusout', focusout);

  return () => {
    detach();
    wrap.removeEventListener('focusout', focusout);
  };
}
