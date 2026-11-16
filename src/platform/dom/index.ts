/**
 * The one way into this folder from outside it: the interactions that write
 * to the DOM directly rather than through React state. Dragging a card, a row
 * or the pool's handle, the grid's crosshair and fit, the two scroll effects,
 * and walking a grid with the keyboard. All of them bind their listeners once and report only the result
 * (ARCHITECTURE, "Doğrudan DOM'a yazma deseni"; pitfall 1).
 */
export { useDrag, type DragData, type KeyMove } from './drag';
export { startLongPress } from './longPress';
export { attachRoving, focusItem } from './roving';
export { attachGridKeys, cellPlace, focusCellSoon } from './gridKeys';
export { attachRowDrag, clampIndex } from './rowDrag';
export { attachGridChrome } from './gridChrome';
export { attachGridFit } from './gridFit';
export { attachScrollFade } from './scrollFade';
export { attachRibbonScroll } from './ribbonScroll';
export { attachSplitter, dockHeightForRoom, maxDockHeight } from './poolSplit';
