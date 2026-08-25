// 45. Table columns: the widths A2 moved out of the JSX.
//
// Pitfall 33 is the reason this file exists, and it is worth restating because
// the suite was 228/228 green while the bug was on the screen: a column width
// written as a raw pixel number does not follow the type inside it. The body
// went 14px → 16px in Y0 and a `style={{ width: 44 }}` box stopped holding two
// digits — from the eleventh teacher on, the colour index read "1". Nothing
// broke; a number simply became unreadable, and no test in the suite was
// looking at whether text FITS.
//
// A1 then added --ui-scale, which turns that one-off into a permanent hazard:
// every raw px width in a table is a promise that quietly breaks at %125.
//
// So the four assertions here are the rule in CLAUDE.md, measured
// ("Tablo sütun genişliği ch cinsinden, CSS'te. JSX'te style={{width}} YASAK"):
//
//   1. no `style={{ width }}` survives in the components. Grepping the source
//      is the only check that stays true for a table nobody wrote a scene for.
//      It is deliberately literal — a COMMENT carrying the pattern fails too,
//      so the ban cannot be documented into existence next to the code that
//      breaks it. Say "inline width" in prose instead.
//   2. the six --w-col-* steps and the sized boxes grow by EXACTLY the scale
//      factor between %100 and %125. A px value fails here — it is the one
//      measurement a pixel cannot fake.
//   3. nothing is clipped at either size: a box always holds the text in it,
//      and a heading never gains a line on the way from %100 to %125.
//
// Why the LADDER is probed instead of the drawn column: `table.list` is
// `width: 100%` with auto layout, so a column's used width is a share of the
// panel, not the declared one — the Öğretmenler columns came out 1.215x, not
// 1.25x, with nothing wrong. The declared step is the thing the rule is about;
// what the column does with it is caught by the heading's line count instead.
//
// (2) is what makes (3) meaningful. Checking only that things fit would pass
// on a table whose every column is 400px; checking only that they scale would
// pass on a table that is uniformly too narrow at both sizes.

import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openSetup, openSettings, openWithSample, chooseScale } from './helpers';

/** Every .tsx under src/components, nested folders included. */
function componentFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return componentFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });
}

type Column = { label: string; klass: string; width: number; lines: number };
type Box = { label: string; width: number; has: number; natural: number };

/**
 * Measures every table column and every sized control on the screen as it is
 * drawn right now.
 *
 * `lines` comes from a Range over the heading's own text, not from
 * scrollHeight: a heading that wraps is not overflowing, so scrollHeight tells
 * you nothing — the line boxes do.
 */
async function measure(page: Page): Promise<{ columns: Column[]; boxes: Box[] }> {
  return page.evaluate(() => {
    const columns = [...document.querySelectorAll('table.list th, table.stat th')]
      .filter((th) => th.className.includes('w-col-') || th.className.includes('num'))
      .map((th, index) => {
        const range = document.createRange();
        range.selectNodeContents(th);
        return {
          label: `${th.textContent?.trim() ?? ''}#${index}`,
          klass: th.className,
          width: th.getBoundingClientRect().width,
          lines: range.getClientRects().length,
        };
      });

    // What a control needs is asked of the browser, never guessed — but the
    // question is a different one for the two kinds of control:
    //
    //   <select> sizes itself to its WIDEST option, so cloning it at
    //     `width: auto` gives the real answer, arrow included. (This is the
    //     measurement renk-secici.spec.ts already relies on.)
    //   <input> at `width: auto` falls back to the UA's `size` attribute — 20
    //     characters, ~250px — which is a default, not a need. What it must
    //     hold is the text in it, so the text is what gets measured, against
    //     the CONTENT box: padding is not room for digits.
    const need = (el: HTMLElement) => {
      if (el instanceof HTMLSelectElement) {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.width = 'auto';
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        el.parentElement!.appendChild(clone);
        const width = clone.getBoundingClientRect().width;
        clone.remove();
        return { has: el.getBoundingClientRect().width, wants: width };
      }
      const input = el as HTMLInputElement;
      const style = getComputedStyle(input);
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
      probe.style.font = style.font;
      probe.style.letterSpacing = style.letterSpacing;
      // An empty limit box still has to show its placeholder — that is where
      // the school-wide default is read from.
      probe.textContent = input.value === '' ? input.placeholder : input.value;
      document.body.appendChild(probe);
      const text = probe.getBoundingClientRect().width;
      probe.remove();
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      return { has: input.clientWidth - padding, wants: text };
    };

    const boxes = [...document.querySelectorAll<HTMLElement>('.num, .text-sm, .color-pick')]
      .filter((el) => el.tagName === 'INPUT' || el.tagName === 'SELECT')
      .map((el, index) => {
        const { has, wants } = need(el);
        return {
          label: `${el.tagName.toLowerCase()}.${el.className}#${index}`,
          width: el.getBoundingClientRect().width,
          has,
          natural: wants,
        };
      });

    return { columns, boxes };
  });
}

/** The screens that own a width class. Named so a failure says where. */
const SCREENS: Array<{ name: string; go: (page: Page) => Promise<void> }> = [
  { name: 'Kurulum → Derslikler', go: (p) => openSetup(p, 'Derslikler') },
  { name: 'Kurulum → Öğretmenler', go: (p) => openSetup(p, 'Öğretmenler') },
  { name: 'Kurulum → Sınıflar', go: (p) => openSetup(p, 'Sınıflar') },
  { name: 'Kurulum → Dersler', go: (p) => openSetup(p, 'Dersler') },
  { name: 'Ayarlar → Okul', go: (p) => openSettings(p, 'Okul') },
  { name: 'Ayarlar → Kurallar', go: (p) => openSettings(p, 'Kurallar') },
  { name: 'Ayarlar → Branşlar', go: (p) => openSettings(p, 'Branşlar') },
  { name: 'Ayarlar → Veri', go: (p) => openSettings(p, 'Veri') },
  {
    name: 'Kontrol',
    go: async (p) => {
      await p.getByRole('button', { name: 'Kontrol', exact: true }).click();
      await expect(p.locator('table.list, table.stat').first()).toBeVisible();
    },
  },
];

test.describe('45. Tablo sütunları', () => {
  test('JSX içinde tek bir style={{ width }} kalmadı', async () => {
    const offenders = componentFiles('src/components')
      .flatMap((path) =>
        readFileSync(path, 'utf8')
          .split('\n')
          .map((line, index) => ({ path, line, no: index + 1 }))
          .filter(({ line }) => /style=\{\{[^}]*\bwidth\b/.test(line)),
      )
      .map(({ path, line, no }) => `${path}:${no} ${line.trim()}`);

    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  test('merdivenin altı basamağı da ch cinsinden', async ({ page }) => {
    await openWithSample(page);

    // The probe copies the context the classes actually live in: a table
    // heading, whose type is --fs-xs. `ch` is resolved against the element's
    // own font, so measuring it anywhere else would measure a different unit.
    const probe = (p: Page) =>
      p.evaluate(() => {
        const steps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
        const box = document.createElement('div');
        box.style.cssText = 'position:absolute;visibility:hidden;font-size:var(--fs-xs)';
        document.body.appendChild(box);
        const out: Record<string, number> = {};
        for (const step of steps) {
          const cell = document.createElement('div');
          cell.style.width = `var(--w-col-${step})`;
          box.appendChild(cell);
          out[step] = cell.getBoundingClientRect().width;
        }
        box.remove();
        return out;
      });

    const small = await probe(page);
    await chooseScale(page, 125);
    const large = await probe(page);

    for (const [step, width] of Object.entries(small)) {
      expect(width, `--w-col-${step} tanımsız`).toBeGreaterThan(0);
      expect(
        large[step]!,
        `--w-col-${step}: %100'de ${width.toFixed(1)}px, %125'te ${large[step]!.toFixed(1)}px`,
      ).toBeCloseTo(width * 1.25, 1);
    }

    // The steps have to be six DIFFERENT widths — a ladder whose rungs collapse
    // onto each other is a ladder in name only.
    expect(new Set(Object.values(small)).size).toBe(6);
  });

  for (const screen of SCREENS) {
    test(`${screen.name}: sütunlar ölçekle büyüyor ve hiçbir şey kırpılmıyor`, async ({
      page,
    }) => {
      await openWithSample(page);
      await screen.go(page);
      const small = await measure(page);

      // A screen with no sized column would pass every assertion below by
      // having nothing to assert. Say so instead.
      expect(small.columns.length + small.boxes.length).toBeGreaterThan(0);

      await chooseScale(page, 125);
      await screen.go(page);
      const large = await measure(page);

      expect(large.columns.map((c) => c.label)).toEqual(small.columns.map((c) => c.label));
      expect(large.boxes.map((b) => b.label)).toEqual(small.boxes.map((b) => b.label));

      for (const [index, before] of small.columns.entries()) {
        const after = large.columns[index]!;
        // A column that follows the type does not let its heading wrap onto a
        // new line on the way up; a px column does, because the words grew and
        // the box did not. This is pitfall 33 with the heading as the witness.
        expect(
          after.lines,
          `${screen.name} · "${before.label}" (${before.klass}) başlığı ` +
            `%100'de ${before.lines} satır / ${before.width.toFixed(1)}px, ` +
            `%125'te ${after.lines} satır / ${after.width.toFixed(1)}px`,
        ).toBe(before.lines);
      }

      for (const [size, measured] of [
        ['%100', small],
        ['%125', large],
      ] as const) {
        for (const box of measured.boxes) {
          expect(
            box.has,
            `${screen.name} · ${size} · ${box.label} içine ${box.has.toFixed(1)}px sığıyor, ` +
              `gereken ${box.natural.toFixed(1)}px`,
          ).toBeGreaterThanOrEqual(box.natural - 0.5);
        }
      }

      for (const [index, before] of small.boxes.entries()) {
        const after = large.boxes[index]!;
        expect(
          after.width,
          `${screen.name} · ${before.label} ölçekle büyümedi: ` +
            `${before.width.toFixed(1)} → ${after.width.toFixed(1)}`,
        ).toBeCloseTo(before.width * 1.25, 0);
      }
    });
  }
});
