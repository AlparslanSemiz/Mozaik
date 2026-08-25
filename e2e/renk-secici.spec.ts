// The colour picker in Kurulum → Öğretmenler and → Sınıflar.
//
// Pitfall 33 asked for this file, and it asked for it because the suite was
// 228/228 green while the control was visibly broken: the box was
// `style={{ width: 44 }}` in the JSX, the body font went 14px → 16px in Y0, and
// from the eleventh teacher on the index read "1" instead of "11". Every test
// that touched the control asserted that it EXISTED and what its VALUE was —
// neither of which changes when the text no longer fits.
//
// The control has since become a swatch and a dialog rather than a dropdown of
// the numbers 1..36, because choosing a colour by its INDEX meant guessing and
// then looking at the result. The requirement did not change with it, so
// neither did this file's subject: what a person does with the control is
//
//   READ it   — the index has to fit its box and be legible on the palette
//               colour that box is painted with, in both themes;
//   CHOOSE    — and the thirty-six they are choosing between have to be
//               visible AS colours, distinguishable, and actually applied.
//
// The palette's own contrast is not re-measured here — `palette.test.ts`
// already proves all 36 clear 4.5:1 against --on-color on every run. What that
// unit test cannot know is whether the token reaches the element.

import { expect, test } from '@playwright/test';
import { openSetup, openWithSampleTheme, contrast, deltaE, tokens } from './helpers';

const STEPS = ['Öğretmenler', 'Sınıflar'] as const;

for (const theme of ['light', 'dark'] as const) {
  test.describe(`renk seçici — ${theme}`, () => {
    for (const step of STEPS) {
      test(`${step}: seçili renk okunuyor`, async ({ page }) => {
        await openWithSampleTheme(page, theme);
        await openSetup(page, step);

        const picks = page.locator('table.list tbody tr .color-pick');
        await expect(picks.first()).toBeVisible();
        // Two digits only start at the tenth row: a list that stops at nine
        // would pass this test with the old bug still in place.
        expect(await picks.count()).toBeGreaterThan(10);

        const ink = (await tokens(page, ['--on-color']))['--on-color'];
        const measured = await picks.evaluateAll((nodes) =>
          nodes.map((node) => {
            const button = node as HTMLElement;
            const style = getComputedStyle(button);

            // What the browser would give the box if we asked for nothing —
            // and asked for the WIDEST index it could ever hold, not the one
            // that happens to be in it. That is the requirement: any of the
            // thirty-six must be showable. Measuring the current text would
            // let a box that fits "1" and clips "36" pass.
            const clone = button.cloneNode(true) as HTMLElement;
            clone.textContent = '36';
            clone.style.width = 'auto';
            clone.style.position = 'absolute';
            clone.style.visibility = 'hidden';
            button.parentElement!.appendChild(clone);
            const natural = clone.getBoundingClientRect().width;
            clone.remove();

            return {
              label: button.textContent ?? '',
              width: button.getBoundingClientRect().width,
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

      test(`${step}: otuz altı rengin hepsi GÖRÜNÜYOR ve seçilebiliyor`, async ({ page }) => {
        await openWithSampleTheme(page, theme);
        await openSetup(page, step);

        const first = page.locator('table.list tbody tr .color-pick').first();
        const before = await first.evaluate((el) => getComputedStyle(el).backgroundColor);
        await first.click();

        const dialog = page.locator('dialog.color-dialog');
        await expect(dialog).toBeVisible();

        const swatches = dialog.locator('.swatch');
        await expect(swatches).toHaveCount(36);

        const grid = await swatches.evaluateAll((nodes) =>
          nodes.map((node) => ({
            label: node.getAttribute('aria-label') ?? '',
            colour: getComputedStyle(node).backgroundColor,
            ink: getComputedStyle(node).color,
            pressed: node.getAttribute('aria-pressed') === 'true',
          })),
        );

        // A colour, not a number: every square is painted, no two the same, and
        // the index on it stays readable because the palette does not flip with
        // the theme and its ink must not either (pitfall 15 and 35).
        expect(new Set(grid.map((s) => s.colour)).size).toBe(36);
        const ink = (await tokens(page, ['--on-color']))['--on-color'];
        for (const s of grid) {
          expect(s.colour).not.toBe('rgba(0, 0, 0, 0)');
          expect(s.ink, `${s.label} mürekkebi --on-color değil`).toBe(ink);
          expect(contrast(s.ink, s.colour), `${s.label} okunmuyor`).toBeGreaterThanOrEqual(4.5);
        }
        // Exactly one is marked as the current choice — a grid that marks none
        // cannot tell you what you already have.
        expect(grid.filter((s) => s.pressed)).toHaveLength(1);

        // And choosing really applies. The 30th is far enough from whatever the
        // first row started on that the change cannot be a rounding artefact.
        await dialog.getByRole('button', { name: 'Renk 30', exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect(first).toHaveText('30');

        const after = await first.evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(deltaE(before, after), 'renk değişmedi').toBeGreaterThan(10);
      });
    }
  });
}
