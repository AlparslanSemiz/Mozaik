/**
 * The one way into this folder from outside it: the interactions that write
 * to the DOM directly rather than through React state. Dragging a card, a row
 * or the pool's handle, the grid's crosshair and fit, and the two scroll
 * effects. All seven bind their listeners once and report only the result
 * (ARCHITECTURE, "Doğrudan DOM'a yazma deseni"; pitfall 1).
 */
export { useDrag, type DragData } from './drag';
export { attachRowDrag, clampIndex } from './rowDrag';
export { attachGridChrome } from './gridChrome';
export { attachGridFit } from './gridFit';
export { attachScrollFade } from './scrollFade';
export { attachRibbonScroll } from './ribbonScroll';
export { attachSplitter, dockHeightForRoom, maxDockHeight } from './poolSplit';
