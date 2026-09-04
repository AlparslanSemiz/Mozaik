// The card that follows the hand. Plain DOM: it is deliberately NOT a React
// element, because nothing may re-render the 2100-cell grid mid-drag
// (pitfall 1).

import { paletteColor } from '../palette';

export interface GhostContent {
  top: string;
  bottom: string;
  color: number;
}

export interface Ghost {
  moveTo(x: number, y: number): void;
  remove(): void;
}

export function mountGhost(
  content: GhostContent,
  blockSize: number,
  x: number,
  y: number,
): Ghost {
  const el = document.createElement('div');
  el.className = 'ghost';
  el.style.background = paletteColor(content.color);
  // AS WIDE AS WHAT IT WILL COVER. The ghost was one cell wide whatever the
  // block was, while the highlight below it ran `blockSize` cells to the
  // RIGHT — so on a double the card sat half a cell left of the pair it was
  // about to fill, and the card lifted off the tray (twice as wide there,
  // `[data-size='2']`) shrank in the hand. The offset does not change: the
  // ghost's LEFT edge stays half a cell left of the pointer, which is the
  // left edge of the target cell.
  el.style.setProperty('--ghost-span', String(Math.max(1, blockSize)));

  const top = document.createElement('span');
  top.className = 'card-top';
  top.textContent = content.top;
  const bottom = document.createElement('span');
  bottom.className = 'card-bottom';
  bottom.textContent = content.bottom;
  el.append(top, bottom);

  el.style.transform = `translate(${x}px, ${y}px)`;
  document.body.appendChild(el);

  return {
    moveTo(nx, ny) {
      el.style.transform = `translate(${nx}px, ${ny}px)`;
    },
    remove() {
      el.remove();
    },
  };
}
