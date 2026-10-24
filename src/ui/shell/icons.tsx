// The top bar's own drawings: the four glyphs and the brand mark.

/**
 * The four glyphs that used to sit in top-bar buttons as TEXT.
 *
 * They had to go for two reasons and either one alone would have been enough.
 * A subset embedded face carries the 225 glyphs this tool draws and no more, so
 * every one of these fell back to a different family — four buttons in four
 * typefaces, at four optical sizes, on one bar. And "Geri al" spelled out cost
 * the row about 120px, which is exactly why the bar wrapped its buttons onto a
 * second line on a 1920px screen.
 *
 * Drawn on currentColor, like the rail's, so both themes are right for free.
 */
export const ICON = {
  undo: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M4 9h9.5a5 5 0 0 1 0 10H8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7.5 5 4 9l3.5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M20 9h-9.5a5 5 0 0 0 0 10H16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 5 20 9l-3.5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

/**
 * The mark, drawn out. Kept beside App rather than in components/ because it
 * is not a component anybody reuses — there is exactly one place in the
 * program that draws it, and that is three lines below.
 *
 * THE SIMPLE VARIANT, since 2026-08-28 ("sol üstteki logonun küçüğü
 * kullanılsın"). It used to be the detailed one, and the reason it changed is
 * the reason the two drawings exist at all: the mark is `1.75rem` here, which
 * is 24.5 px at 100 % — and the icon comparison this project already ran
 * (`scripts/ikon-karsilastir.mjs`) put 20-32 px in the band where the six
 * columns are "blurry but still separable", i.e. the band where it is a
 * judgement call. The reader made the call. The calendar mark of 2026-10-23
 * kept it: at 24 px its hooks are a blur.
 *
 * The SOURCE of truth is site/icon-small.svg; e2e/kabuk.spec.ts checks this
 * draws the same rectangles, the way temel.spec.ts already does for the
 * favicon — which reads from the same file, so the tab and the top bar now
 * carry one drawing instead of two.
 */
export function BrandMark() {
  return (
    <svg viewBox="0 0 1024 1024" className="brand-mark">
      <rect width="1024" height="1024" rx="180" fill="#2e3ba8" />
      <rect x="128" y="128" width="768" height="768" rx="64" fill="#fff" />
      <rect x="256" y="256" width="128" height="256" rx="32" fill="#c576f3" />
      <rect x="448" y="256" width="128" height="512" rx="32" fill="#fd6454" />
      <rect x="640" y="512" width="128" height="256" rx="32" fill="#3f9fe3" />
    </svg>
  );
}
