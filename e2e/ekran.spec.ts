// Screenshots, not tests. "Show the output, do not claim it" — a layout,
// alignment or colour change is only believable when you can look at it.
//
// Runs OUTSIDE the normal suite (`npm run ekran`), because it judges no
// design; counting it among the E2E tests would inflate the number with
// pictures. It walks SCENES from helpers.ts, which is the one list of what the
// app looks like.
//
// It makes exactly ONE assertion, and it is not about design: that a picture
// was taken OF SOMETHING. Visual regression is not coming back — the 24
// baselines were deleted on purpose and what replaced them measures MEANING
// (contrast, ΔE, accessible names) rather than pixels. But this layer had a
// hole of its own: on 2026-08-27 it wrote a completely blank PNG and a half
// transparent one, and the only thing that noticed was a person looking at
// them. A layer whose failure mode is "produces evidence of nothing, quietly"
// is worth exactly as much as the attention it gets. So the fade is now
// asserted to be OVER at the shutter, which is the cause of that bug rather
// than a picture of it.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { openWithSampleTheme, SCENES, settledMotion } from './helpers';

const OUT = 'test-results/ekran';

/**
 * Waits until nothing on the page is still moving.
 *
 * Without this the pictures are worthless and they LOOK fine, which is worse:
 * every tab and every section fades in from `@starting-style`, so a screenshot
 * taken the moment a destination is reachable catches the panels part way
 * through the fade. Caught by looking — `dark-12-ayarlar-gorunum.png` came out
 * completely blank while its light twin came out at about half opacity, and no
 * assertion anywhere would ever have said so, because this file asserts
 * nothing. That is the point of it.
 *
 * `a.finished` and not a fixed sleep: the durations are a setting now
 * (Ayarlar → Görünüm → Hareket), so a number here would be wrong for two of the
 * three steps. Animations that never finish are filtered out rather than
 * waited on, and the whole wait is capped — a picture is not worth a hang.
 */
const settled = settledMotion;

/**
 * The shutter check: everything the camera is pointed at is fully opaque.
 *
 * `.main` and every `.panel` fade in from `opacity: 0` via `@starting-style`,
 * so a capture taken early catches them part way — and "part way" includes
 * ZERO. This reads the value the compositor would use, so a 2 000 ms cap that
 * expired, a scene that navigates during `after`, or a future surface that
 * fades on some other property all show up here rather than in a PNG nobody
 * opens.
 */
async function painted(page: Page, label: string) {
  const faded = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll('.main, .main .panel')) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const o = Number(getComputedStyle(el).opacity);
      if (o < 0.99) out.push(`${el.className.split(' ')[0]} opacity=${o.toFixed(2)}`);
    }
    return out;
  });

  expect(faded, `${label}: perde inmeden çekilmiş — ${faded.join(', ')}`).toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test(`ekran görüntüleri — ${theme}`, async ({ page }) => {
    await openWithSampleTheme(page, theme);

    for (const scene of SCENES) {
      await scene.go(page);
      await settled(page);
      await painted(page, `${theme}-${scene.name}`);
      await page.screenshot({ path: `${OUT}/${theme}-${scene.name}.png` });
      await scene.after?.(page);
    }
  });
}
