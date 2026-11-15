/**
 * Where the keyboard goes after a row's `Sil` (keyboard review, 2026-11-15).
 *
 * The row and its button leave the page with the deletion, and the browser
 * puts a focus that has nowhere to be on <body>: the next Tab started again at
 * the top of the page, and the notice's "Geri al" at its end was 301 presses
 * away. So the focus moves BEFORE the row goes, to the `Sil` of the row that
 * takes its place (the next one, or the one before it when it was the last),
 * and to the step's first add field when the list is left empty. The other
 * rows keep their DOM nodes (they are keyed by id), so the button focused here
 * is the one still on screen afterwards.
 *
 * Only the four Kurulum lists, the subject list and Dersler call it. The
 * Program grid's own delete keeps its own rule.
 */
const DELETE = 'button.btn.danger:not(:disabled)';

export function moveFocusFromDeleted(button: HTMLElement): void {
  const row = button.closest('tr');
  const table = row?.closest('table');
  if (row === null || row === undefined || table === null || table === undefined) return;
  const rows = [...table.querySelectorAll<HTMLTableRowElement>('tbody tr')];
  const at = rows.indexOf(row);
  const pick = (r: HTMLTableRowElement | undefined) =>
    r === undefined ? null : r.querySelector<HTMLElement>(DELETE);
  const after = rows
    .slice(at + 1)
    .map(pick)
    .find((b) => b !== null);
  const before = rows
    .slice(0, Math.max(at, 0))
    .reverse()
    .map(pick)
    .find((b) => b !== null);
  const target =
    after ??
    before ??
    (button.closest('.cols') ?? document).querySelector<HTMLElement>(
      '.add-panel-body input, .add-panel-body select',
    );
  target?.focus();
}
