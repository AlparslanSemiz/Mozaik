import { describe, expect, it } from 'vitest';
import styles from './styles.css?raw';

/**
 * Every custom property the stylesheet reads without a fallback has an owner.
 *
 * `var(--ink)` was read by four rules (the split picker, its popover, its
 * options and the row handle's hover) and declared nowhere. An undefined
 * property does not fail: the declaration becomes `unset`, `color` inherits,
 * and the rule quietly paints whatever its parent paints. It happened to be
 * --text, which is why nobody saw it, and it would have gone on being right
 * only for as long as every parent stayed --text.
 */
describe('styles.css custom property', () => {
  // Written from TypeScript as inline styles, so the stylesheet cannot declare
  // them: the grid's column counts (Grid.tsx) and the stacked card's colour.
  const SET_BY_SCRIPT = new Set(['--break-cols', '--day-cols', '--lesson-cols', '--stack-color']);

  it("fallback'siz okunan her değişken ya dosyada tanımlı ya betikten yazılıyor", () => {
    // Read empty, the assertion below would be about nothing (pitfall 109).
    expect(styles.length, 'styles.css okunamadı').toBeGreaterThan(10_000);
    const code = styles.replace(/\/\*[\s\S]*?\*\//g, '');
    const read = new Set([...code.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map((m) => m[1]!));
    const declared = new Set([...code.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]!));
    const orphans = [...read].filter((name) => !declared.has(name) && !SET_BY_SCRIPT.has(name));
    expect(orphans).toEqual([]);
  });
});
