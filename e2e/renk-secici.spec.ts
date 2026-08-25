// The colour picker in Kurulum → Öğretmenler and → Sınıflar.
//
// Pitfall 33 asked for exactly this test, and it asked for it because the
// existing 228 went green while the control was visibly broken: the box was
// `style={{ width: 44 }}` in the JSX, the body font went 14px → 16px in Y0,
// and from the eleventh teacher on the index read "1" instead of "11". Every
// test that touched the control asserted that a <select> EXISTED and what its
// VALUE was — neither of which changes when the text no longer fits.
//
// So both assertions here are about the thing a person actually does with the
// control, which is READ it:
//
//   1. the box is at least as wide as the browser itself says it needs to show
//      any of its 36 options. Cloning the select with `width: auto` and
//      measuring is what makes this free of a magic arrow-width constant —
//      and it fails at 44px, which is the regression.
//   2. the digit is painted in --on-color. The palette does not flip with the
//      theme (pitfall 15), so ink that DOES flip disappears: on `color:
//      inherit` the index was near-white on a pale pastel in dark mode and
//      rows 5, 7, 12, 16 and 17 were unreadable.
//
// The palette's own contrast is not re-measured here — `palette.test.ts`
// already proves all 36 clear 4.5:1 against --on-color on every run. What that
// unit test cannot know is whether the token reaches the element.

import { expect, test } from '@playwright/test';
import { openSetup, openWithSampleTheme, contrast, tokens } from './helpers';

const STEPS = ['Öğretmenler', 'Sınıflar'] as const;

for (const theme of ['light', 'dark'] as const) {
  test.describe(`renk seçici — ${theme}`, () => {
    for (const step of STEPS) {
      test(`${step}: seçili renk okunuyor`, async ({ page }) => {
        await openWithSampleTheme(page, theme);
        await openSetup(page, step);

        const picks = page.locator('select.color-pick');
        await expect(picks.first()).toBeVisible();
        // Two digits only start at the tenth row: a list that stops at nine
        // would pass this test with the bug still in place.
        expect(await picks.count()).toBeGreaterThan(10);

        const ink = (await tokens(page, ['--on-color']))['--on-color'];
        const measured = await picks.evaluateAll((nodes) =>
          nodes.map((node) => {
            const select = node as HTMLSelectElement;
            const style = getComputedStyle(select);

            // What the browser would give the box if we asked for nothing: it
            // sizes to the WIDEST option, which is the requirement — any index
            // must be showable, not just the one selected right now.
            const clone = select.cloneNode(true) as HTMLSelectElement;
            clone.style.width = 'auto';
            clone.style.position = 'absolute';
            clone.style.visibility = 'hidden';
            select.parentElement!.appendChild(clone);
            const natural = clone.getBoundingClientRect().width;
            clone.remove();

            return {
              label: select.options[select.selectedIndex]!.text,
              width: select.getBoundingClientRect().width,
              natural,
              ink: style.color,
              swatch: style.backgroundColor,
            };
          }),
        );

        for (const cell of measured) {
          expect(
            cell.width,
            `"${cell.label}" kutusu ${cell.width.toFixed(0)}px, gereken ${cell.natural.toFixed(0)}px`,
          ).toBeGreaterThanOrEqual(cell.natural);
          expect(cell.ink, `"${cell.label}" mürekkebi --on-color değil`).toBe(ink);
          // The swatch is a palette colour and must not have been flattened to
          // a theme surface by some later rule.
          expect(contrast(cell.ink, cell.swatch)).toBeGreaterThanOrEqual(4.5);
        }

        // The two-digit rows are the ones the regression hit; name one so a
        // failure report says which.
        expect(measured.map((c) => c.label)).toContain('11');
      });
    }
  });
}
