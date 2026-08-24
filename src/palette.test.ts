// The palette is generated, so what must be tested is not "is this hex right"
// but the two properties the generator claims: every colour carries dark ink at
// AA, and no two colours look the same. Both are measured, never asserted by
// eye — the same rule the e2e colour tests follow (CLAUDE.md).

import { describe, expect, it } from 'vitest';
import { PALETTE, PALETTE_SIZE, firstFreeColor, paletteColor } from './palette';

/** The two inks printed on top of the palette: --on-color, --on-color-sub. */
const ON_COLOR = '#1b1f24';
const ON_COLOR_SUB = '#3a3f46';

function rgb(value: string): [number, number, number] {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value);
  if (m === null) throw new Error(`renk okunamadı: ${value}`);
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

function linear(value: string): [number, number, number] {
  return rgb(value).map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
}

function relativeLuminance(value: string): number {
  const [r, g, b] = linear(value);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * CIE Lab distance. A contrast ratio cannot answer "are these two backgrounds
 * tellable apart": this palette is built so a whole band shares one luminance,
 * which makes every pair in it contrast 1:1 while looking nothing alike.
 */
function deltaE(a: string, b: string): number {
  const toLab = (value: string): [number, number, number] => {
    const [r, g, bl] = linear(value);
    const x = (0.4124 * r + 0.3576 * g + 0.1805 * bl) / 0.95047;
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    const z = (0.0193 * r + 0.1192 * g + 0.9505 * bl) / 1.08883;
    const f = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  };
  const la = toLab(a);
  const lb = toLab(b);
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]);
}

describe('palet', () => {
  it('36 renk üretiyor, hepsi geçerli hex', () => {
    expect(PALETTE_SIZE).toBe(36);
    expect(PALETTE).toHaveLength(36);
    for (const color of PALETTE) expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('12 renkten fazla — eski paletin iki katından çok', () => {
    expect(PALETTE_SIZE).toBeGreaterThan(12);
  });

  it('her renk iki mürekkebi de AA taşıyor', () => {
    for (const color of PALETTE) {
      expect(contrast(color, ON_COLOR)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(color, ON_COLOR_SUB)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('hiçbir iki renk aynı değil ve gözle ayırt edilebiliyor', () => {
    expect(new Set(PALETTE).size).toBe(PALETTE_SIZE);

    let worst = Infinity;
    let pair = '';
    for (let i = 0; i < PALETTE.length; i++) {
      for (let j = i + 1; j < PALETTE.length; j++) {
        const d = deltaE(PALETTE[i]!, PALETTE[j]!);
        if (d < worst) {
          worst = d;
          pair = `${PALETTE[i]} / ${PALETTE[j]}`;
        }
      }
    }
    // Measured 17.5 today. The old twelve-colour palette managed 13.4, so
    // the floor is set above it: more colours must not mean muddier ones.
    expect(worst, `en yakın çift ${pair}`).toBeGreaterThanOrEqual(15);
  });

  it('art arda dağıtılan renkler birbirine yakın düşmüyor', () => {
    // Teachers are given colours in creation order, so it is the NEIGHBOURING
    // indexes that end up side by side in the grid.
    for (let i = 0; i + 1 < PALETTE.length; i++) {
      expect(deltaE(PALETTE[i]!, PALETTE[i + 1]!)).toBeGreaterThanOrEqual(20);
    }
  });

  it('paletteColor kararlı ve sarıyor', () => {
    expect(paletteColor(0)).toBe(PALETTE[0]);
    expect(paletteColor(PALETTE_SIZE)).toBe(PALETTE[0]);
    expect(paletteColor(PALETTE_SIZE + 3)).toBe(PALETTE[3]);
    expect(paletteColor(-1)).toBe(PALETTE[1]);
    expect(paletteColor(Number.NaN)).toBe(PALETTE[0]);
  });

  it('bir okul dolusu öğretmen birbirinden ayırt edilebiliyor', () => {
    // 25 teachers is this school's real scale; they get indexes 0..24.
    let worst = Infinity;
    for (let i = 0; i < 25; i++) {
      for (let j = i + 1; j < 25; j++) worst = Math.min(worst, deltaE(PALETTE[i]!, PALETTE[j]!));
    }
    expect(worst).toBeGreaterThanOrEqual(15);
  });
});

describe('firstFreeColor', () => {
  it('boş listede ilk rengi verir', () => {
    expect(firstFreeColor([])).toBe(0);
  });

  it('kullanılmayan en küçük indeksi verir', () => {
    expect(firstFreeColor([0, 1, 2])).toBe(3);
    expect(firstFreeColor([0, 2, 3])).toBe(1); // a deleted teacher leaves a hole
  });

  it('palet dolunca en az kullanılana döner', () => {
    const all = Array.from({ length: PALETTE_SIZE }, (_, i) => i);
    expect(firstFreeColor([...all, 0, 0, 1])).toBe(2);
  });

  it('bozuk indeksleri saymaya çalışırken çökmüyor', () => {
    expect(firstFreeColor([Number.NaN, -1, PALETTE_SIZE])).toBe(2);
  });
});
