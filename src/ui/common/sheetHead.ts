/**
 * A person's page and a date's page keep their head fixed while the body
 * scrolls, and the body needs to know how tall the head is (it wraps onto a
 * second row at a large text size, and shows a third line for the teacher's
 * buttons). The height is MEASURED, never guessed: `ref={sheetHead}` on the
 * `.sheet-head` writes it to the enclosing `.sheet` as `--sheet-head-h` and
 * keeps it current when the head reflows.
 */
export function sheetHead(head: HTMLElement | null): (() => void) | undefined {
  const sheet = head?.closest<HTMLElement>('.sheet') ?? null;
  if (head === null || sheet === null) return undefined;
  const write = () =>
    sheet.style.setProperty(
      '--sheet-head-h',
      `${Math.ceil(head.getBoundingClientRect().height)}px`,
    );
  write();
  if (typeof ResizeObserver === 'undefined')
    return () => sheet.style.removeProperty('--sheet-head-h');
  const watch = new ResizeObserver(write);
  watch.observe(head);
  return () => {
    watch.disconnect();
    sheet.style.removeProperty('--sheet-head-h');
  };
}
