// The two flat overlays that dim everything except the row being dragged onto.
//
// CSS opacity on every non-target row made Chromium raster ~24 wide layers at
// drag start; two viewport-sized rectangles paint the same guidance once. They
// own themselves — mounted here, removed here — so the drag hook does not carry
// a ref for them.

export interface Shades {
  /** Re-lays both rectangles around the target row. Boxes come from the caller,
      which is what keeps the reads where they can be reasoned about. */
  place(wrapBox: DOMRect, rowBox: DOMRect, headingBottom: number): void;
  remove(): void;
}

export function mountShades(): Shades {
  const above = document.createElement('div');
  const below = document.createElement('div');
  for (const shade of [above, below]) {
    shade.className = 'drag-shade';
    document.body.appendChild(shade);
  }

  return {
    place(wrapBox, rowBox, headingBottom) {
      const top = Math.max(wrapBox.top, headingBottom);
      const splitTop = Math.max(top, Math.min(rowBox.top, wrapBox.bottom));
      const splitBottom = Math.max(top, Math.min(rowBox.bottom, wrapBox.bottom));
      for (const shade of [above, below]) {
        shade.style.left = `${wrapBox.left}px`;
        shade.style.width = `${wrapBox.width}px`;
      }
      above.style.top = `${top}px`;
      above.style.height = `${Math.max(0, splitTop - top)}px`;
      below.style.top = `${splitBottom}px`;
      below.style.height = `${Math.max(0, wrapBox.bottom - splitBottom)}px`;
    },
    remove() {
      above.remove();
      below.remove();
    },
  };
}
