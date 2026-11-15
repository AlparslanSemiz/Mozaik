// Whether the week runs off the side of the grid — so the bar under the strip
// can say that Sığdır shows all of it.
//
// At 1366 x 768 a six-day week of twelve hours is wider than the grid's box,
// and the grid scrolling sideways inside itself is fine (LAYOUT, "Ekran"); not
// knowing that Sunday is out there is not. Measured on the box itself, the way
// gridFit.ts sizes Sığdır, and quiet in Sığdır, where nothing is cut.

import { useEffect, useState } from 'react';

export function useWeekCut(watching: boolean): boolean {
  const [cut, setCut] = useState(false);
  useEffect(() => {
    if (!watching || typeof ResizeObserver === 'undefined') return;
    const wrap = document.querySelector<HTMLElement>('.grid-wrap');
    if (wrap === null) return;
    const measure = () =>
      setCut(
        document.documentElement.getAttribute('data-density') !== 'sigdir' &&
          wrap.scrollWidth > wrap.clientWidth + 1,
      );
    const size = new ResizeObserver(measure);
    size.observe(wrap);
    const table = wrap.querySelector('table');
    if (table !== null) size.observe(table);
    const density = new MutationObserver(measure);
    density.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-density'],
    });
    measure();
    return () => {
      size.disconnect();
      density.disconnect();
    };
  }, [watching]);
  return watching && cut;
}
