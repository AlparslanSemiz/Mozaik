// The teacher / class colour palette.
//
// A leaf module: it imports NOTHING, so pure logic, components and tests can
// all reach it without a cycle.
//
// WHY 36 AND WHY THESE 36
//
// Twelve hand-tuned pastels were enough while colours could repeat. They cannot
// any more: every teacher needs a colour no other teacher has, and so does
// every class (~25 and ~20 of them). Hand-picking 36 shades that all stay
// readable under the same dark ink is guesswork, so these were SEARCHED for,
// once, offline:
//
//   candidates = HSL(hue 0..358 step 2, sat .30..78, light .52..88)
//                filtered to contrast >= 4.5 against --on-color (#1b1f24)
//                and >= 4.7 against --on-color-sub (#3a3f46),
//                sRGB luminance <= 0.80 and CIE Lab chroma <= 58
//                (i.e. pastel, never neon, and never near-white)
//   order      = farthest-point: each entry is the candidate whose smallest
//                CIE Lab distance to everything already chosen is largest
//
// That ordering matters at runtime, not just on paper: teachers are handed
// colours in creation order, so it is neighbouring INDEXES that end up next to
// each other in the grid, and farthest-point puts the biggest gaps there.
//
// Measured, not claimed (palette.test.ts re-checks all of it on every run):
//   closest pair overall  dE 17.5   (the old 12-colour palette managed 13.4)
//   closest pair adjacent dE 23.8
//   first 25 entries      dE 20.0   — a real school's worth of teachers
//   contrast              7.3:1 against the ink, 4.7:1 against the sub-ink
//
// The palette is identical in both themes and on paper, so it lives here as
// plain hex rather than in CSS variables — see CLAUDE.md.

export const PALETTE: readonly string[] = [
  '#c3a2cd', '#9ff292', '#e99c4e', '#2ed9e5', '#f1e7c5', '#f29592',
  '#ede06e', '#65b6ec', '#81bb91', '#f089df', '#2ae5b3', '#c4e8f8',
  '#bdaf6b', '#d2afac', '#9dbe50', '#d8efa4', '#a4f4e1', '#f292bb',
  '#f2bb92', '#7ab8b8', '#c49bf3', '#5bc27a', '#9cafc9', '#a0aef3',
  '#9bf3bb', '#43c7b1', '#d3ad45', '#ead1e9', '#f5b2f3', '#9cc379',
  '#f3de9b', '#7bd4ef', '#c4b592', '#d2ef80', '#c2e6bc', '#ee9772',
];

export const PALETTE_SIZE = PALETTE.length;

/** '#rrggbb' for a palette index. Wraps, so a stale index can never blank a cell. */
export function paletteColor(index: number): string {
  const safe = Number.isFinite(index) ? Math.abs(Math.round(index)) % PALETTE_SIZE : 0;
  return PALETTE[safe] ?? '#ffffff';
}

/**
 * The lowest-numbered colour nobody is using yet. Falls back to the least
 * crowded one once all 36 are taken — a 37th teacher must still get a colour,
 * just not a unique one.
 */
export function firstFreeColor(used: Iterable<number>): number {
  const count = new Array<number>(PALETTE_SIZE).fill(0);
  for (const value of used) {
    const i = Number.isFinite(value) ? Math.abs(Math.round(value)) % PALETTE_SIZE : 0;
    count[i] = (count[i] ?? 0) + 1;
  }
  let best = 0;
  for (let i = 1; i < PALETTE_SIZE; i++) {
    if ((count[i] ?? 0) < (count[best] ?? 0)) best = i;
  }
  return best;
}
