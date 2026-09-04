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
// then looking at the result.
//
// 2026-08-26: the FIT half of this file went with the rest of the layout tests
// (user decision — accessibility measurements stay, layout measurements go).
// What is left is the half that is accessibility and not taste:
//
//   NAME it   — the swatch has no text on it any more ("Renklerin üzerinde
//               sayılar olmasın", 2026-08-27), so the index has to be in its
//               ACCESSIBLE NAME instead. That is not a downgrade of the old
//               requirement, it is the same requirement asked of the thing that
//               still answers it: something has to be able to say WHICH colour
//               a row has, and now that something is the name.
//   CHOOSE    — and the thirty-six have to be visible AS colours,
//               distinguishable, and actually applied.
//   INK       — pitfall 15 and 35 have not gone anywhere: wherever text still
//               sits on a palette ground it must be --on-color ink, or the pale
//               half of the palette goes unreadable in dark mode. The swatches
//               stopped being such a place, so that measurement MOVED rather
//               than died — to the cards on the grid and in the tray, which are
//               where palette-coloured text actually lives now.
//
// The palette's own contrast is not re-measured here — `palette.test.ts`
// already proves all 36 clear 4.5:1 against --on-color on every run. What that
// unit test cannot know is whether the token reaches the element.

import { expect, test } from '../kapan';
import {
  openSetup,
  openWithSampleTheme,
  contrast,
  deltaE,
  dragAndDrop,
  tokens,
} from '../helpers';

const STEPS = ['Öğretmenler', 'Sınıflar'] as const;

for (const theme of ['light', 'dark'] as const) {
  test.describe(`renk seçici — ${theme}`, () => {

  // Where palette-coloured TEXT actually lives now that the swatches carry
  // none: the card on the grid and the card in the tray. This is pitfall 15 and
  // 35's guard, moved rather than dropped — `.card` and `.pool-card` paint
  // their ground from PALETTE (the same 36 in both themes) and their ink from
  // --on-color, and the day somebody writes `color: inherit` on either of them
  // the pale half of the palette goes unreadable in dark mode with nothing to
  // show for it. `palette.test.ts` proves the 36 clear 4.5:1 against the token;
  // only a real page can say whether the token reaches the element.
  test(`kart mürekkebi palet zemininde okunuyor — ${theme}`, async ({ page }) => {
    await openWithSampleTheme(page, theme);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();
    // The sample school arrives UNPLACED — 367 model blocks in 114 tray
    // stacks, 0 on the grid — so one has to be put down before there is a grid
    // card to measure.
    // Measuring only the tray would leave `.card`'s own rule unguarded, and
    // `.card` and `.pool-card` are two different rules that have to agree.
    await dragAndDrop(page);
    await expect(page.locator('table.grid .card').first()).toBeVisible();

    const ink = (await tokens(page, ['--on-color']))['--on-color'];

    // Every pile has one real card; CSS draws the decorative depth.
    for (const sel of ['table.grid .card', '.pool-card']) {
      const cards = page.locator(sel);
      expect(await cards.count(), `${sel} hiç çizilmemiş`).toBeGreaterThan(0);
      const measured = await cards.evaluateAll((nodes) =>
        nodes.slice(0, 40).map((node) => {
          const style = getComputedStyle(node as HTMLElement);
          return { text: (node.textContent ?? '').trim(), ink: style.color, bg: style.backgroundColor };
        }),
      );
      for (const c of measured) {
        expect(c.text, `${sel} boş çizilmiş`).not.toBe('');
        expect(c.ink, `${sel} "${c.text}" mürekkebi --on-color değil`).toBe(ink);
        expect(
          contrast(c.ink, c.bg),
          `${sel} "${c.text}" okunmuyor`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
    for (const step of STEPS) {
      test(`${step}: swatch üstünde YAZI YOK ama hangi renk olduğunu SÖYLÜYOR`, async ({
        page,
      }) => {
        await openWithSampleTheme(page, theme);
        await openSetup(page, step);

        const picks = page.locator('table.list tbody tr .color-pick');
        await expect(picks.first()).toBeVisible();
        expect(await picks.count()).toBeGreaterThan(10);

        const measured = await picks.evaluateAll((nodes) =>
          nodes.map((node) => ({
            text: (node.textContent ?? '').trim(),
            name: node.getAttribute('aria-label') ?? '',
            swatch: getComputedStyle(node as HTMLElement).backgroundColor,
          })),
        );

        for (const cell of measured) {
          // What the reader asked for: the number is off the colour.
          expect(cell.text, 'swatch üstünde hâlâ yazı var').toBe('');
          // ...and what must not have gone with it. The index is what `State`
          // stores and what "iki öğretmen aynı renkte mi" is asked in, so a
          // swatch that cannot say which one it is would leave that question
          // with no answer at all for anyone not looking at the pixels.
          expect(cell.name, 'swatch hangi renk olduğunu söylemiyor').toMatch(/rengi: \d+$/);
          // The swatch is a palette colour and must not have been flattened to
          // a theme surface by some later rule.
          expect(cell.swatch).not.toBe('rgba(0, 0, 0, 0)');
        }

        // Twenty-five rows, twenty-five different names: the colour is an
        // IDENTITY, and a name that repeats would hide two teachers sharing one.
        const names = measured.map((c) => c.name);
        expect(new Set(names).size, 'iki satırın adı aynı').toBe(names.length);
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

        // A colour, not a number: every square is painted and no two the same.
        // Each still SAYS which index it is — that is how it is chosen from the
        // keyboard and how the click below finds one.
        expect(new Set(grid.map((s) => s.colour)).size).toBe(36);
        for (const s of grid) {
          expect(s.colour).not.toBe('rgba(0, 0, 0, 0)');
          expect(s.label, 'swatch adsız').toMatch(/^Renk \d+$/);
        }
        // Exactly one is marked as the current choice — a grid that marks none
        // cannot tell you what you already have.
        expect(grid.filter((s) => s.pressed)).toHaveLength(1);

        // And choosing really applies. The 30th is far enough from whatever the
        // first row started on that the change cannot be a rounding artefact.
        await dialog.getByRole('button', { name: 'Renk 30', exact: true }).click();
        await expect(dialog).toBeHidden();
        // The trigger carries no text now, so what is checked is what it SAYS.
        await expect(first).toHaveAttribute('aria-label', /rengi: 30$/);

        const after = await first.evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(deltaE(before, after), 'renk değişmedi').toBeGreaterThan(10);
      });
    }
  });
}
