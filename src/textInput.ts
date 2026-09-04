/**
 * Is the keyboard event aimed at a text box?
 *
 * While typing, the browser's own Ctrl+Z and the plain '?' key belong to the
 * field, not to us. Two callers need the same answer — useStore.ts's undo/redo
 * and App.tsx's global shortcuts — and a second copy of a four-line rule is
 * still a second copy that can drift.
 */
export function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}
