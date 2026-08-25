// Shared E2E helpers.
//
// The target is NOT the dev server but `dist/index.html` opened over file://
// — the very thing my father will double-click. What is tested here cannot be
// tested meaningfully in jsdom:
//   - does localStorage really work under file:// (risk of data loss)
//   - mouse drag and drop, the ghost card, the green/red highlight
//   - do the sticky columns really stay put at 1366x768
//   - whether the print layout overflows

import { expect, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const FILE = pathToFileURL(resolve('dist/index.html')).href;

export async function open(page: Page) {
  await page.goto(FILE);
  await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();
}

/** Loads the sample data and switches to the Program tab. */
export async function openWithSample(page: Page) {
  await open(page);
  page.once('dialog', (d) => d.accept()); // the "sample data will be loaded" confirm
  await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
  await page.getByRole('button', { name: 'Program' }).click();
  await expect(page.locator('table.grid')).toBeVisible();
}

/**
 * Setup is a strip of steps now, so reaching a field means naming its step.
 * Every test that used to just click "Kurulum" goes through here.
 */
export async function openSetup(page: Page, step: string) {
  await page.getByRole('button', { name: 'Kurulum' }).click();
  await page.locator('.step', { hasText: step }).click();
  await expect(page.locator('.step[aria-current="true"]')).toContainText(step);
}

/**
 * The same for Ayarlar. School days, the bell, the four rules and the subject
 * list all live there now, not in Kurulum.
 */
export async function openSettings(page: Page, section: string) {
  await page.getByRole('button', { name: 'Ayarlar' }).click();
  await page.locator('.step', { hasText: section }).click();
  await expect(page.locator('.step[aria-current="true"]')).toContainText(section);
}

export async function startDrag(page: Page, index = 0) {
  const card = page.locator('.pool-card').nth(index);
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.locator('tr.target-row')).toHaveCount(1);
  // The target row is scrolled into view when the drag starts; let it settle.
  await page.waitForTimeout(150);
}

/**
 * Returns the cells matching the selector that are REALLY visible right now.
 *
 * Only ~35 of the 72 columns fit the screen. An off-screen cell still has a
 * boundingBox, but moving the mouse there is meaningless — in the app you reach
 * it by auto-scrolling, not by teleporting. The margins are wide enough to keep
 * out the sticky column (132px), the sticky header (~44px) and the auto-scroll
 * band (56px).
 */
export async function visibleCells(page: Page, selector: string) {
  // Asking boundingBox() cell by cell means 72 round trips and takes seconds;
  // waiting that long mid-drag makes the test flaky. Compute it all inside the
  // browser in one go.
  return page.evaluate((sel) => {
    const wrap = document.querySelector('.grid-wrap');
    if (wrap === null) return [];
    const r = wrap.getBoundingClientRect();
    // Margins wide enough to exclude the sticky column (132px), the sticky
    // header (~44px) and the auto-scroll band (56px).
    const bounds = { left: r.left + 140, right: r.right - 70, top: r.top + 70, bottom: r.bottom - 70 };

    const result: Array<{ x: number; y: number; index: number }> = [];
    document.querySelectorAll(sel).forEach((el, index) => {
      const b = el.getBoundingClientRect();
      const x = b.left + b.width / 2;
      const y = b.top + b.height / 2;
      if (x > bounds.left && x < bounds.right && y > bounds.top && y < bounds.bottom) {
        result.push({ x, y, index });
      }
    });
    return result;
  }, selector);
}

/**
 * Drags a card from the pool into the first valid cell of the grid.
 *
 * Tries the next card when a whole row has no droppable cell ON SCREEN: with
 * real-scale data a teacher can be closed on every visible day, and which card
 * sits first in the pool depends on the current view. That is a property of the
 * sample data, not a bug, so it must not decide whether a test passes.
 */
export async function dragAndDrop(page: Page): Promise<{ day: string; hour: string; row: string }> {
  const cardCount = await page.locator('.pool-card').count();

  for (let index = 0; index < Math.min(cardCount, 8); index++) {
    await startDrag(page, index);

    const cells = page.locator('tr.target-row td');
    for (const point of await visibleCells(page, 'tr.target-row td')) {
      await page.mouse.move(point.x, point.y, { steps: 3 });
      await page.waitForTimeout(40); // the highlight is applied in the rAF loop
      const cell = cells.nth(point.index);
      if ((await cell.getAttribute('class'))?.includes('drop-ok') === true) {
        const day = (await cell.getAttribute('data-day'))!;
        const hour = (await cell.getAttribute('data-hour'))!;
        const row = (await cell.getAttribute('data-row'))!;
        await page.mouse.up();
        return { day, hour, row };
      }
    }
    await page.keyboard.press('Escape');
    await page.mouse.up();
  }
  throw new Error('Hiçbir hücre geçerli görünmedi — sürükleme vurgusu çalışmıyor.');
}


/**
 * A hand-built world loaded through the real "Yedek yükle" dialog: 2 days x 4
 * hours, one teacher, one class. Everything fits on screen, so the rule tests
 * below do not depend on where the sample data happens to leave a free cell.
 */
export const FIXTURE = {
  schemaVersion: 3,
  settings: {
    schoolName: '',
    days: [
      { name: 'Salı', longBreakAfter: 0 },
      { name: 'Çarşamba', longBreakAfter: 0 },
    ],
    hours: ['1', '2', '3', '4'],
    bell: { start: '09:00', lessonMinutes: 40, breakMinutes: 10, longBreakMinutes: 30 },
    limits: { maxConsecutive: 0, maxPerDay: 0, minPerDay: 0, maxSameLessonPerDay: 0 },
    rules: {
      maxConsecutive: 'block',
      maxPerDay: 'block',
      minPerDay: 'warn',
      maxSameLessonPerDay: 'block',
    },
  },
  rooms: [{ id: 'dA', name: 'A' }],
  teachers: [
    {
      id: 'oMC',
      name: 'Mehmet Çelik',
      short: 'MÇ',
      subject: 'Matematik',
      color: 0,
      limits: { maxConsecutive: null, maxPerDay: null, minPerDay: null },
    },
  ],
  classes: [{ id: 's510', name: '510', roomId: 'dA' }],
  lessons: [
    { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, blockSize: 1, maxPerDay: null },
  ],
  unavailable: {},
  placements: {},
};

export async function openFixture(page: Page) {
  await open(page);
  page.once('dialog', (d) => d.accept());
  await page.locator('input[type=file]').setInputFiles({
    name: 'ders-programi-2026-08-24-1200.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(FIXTURE)),
  });
  await expect(page.getByRole('button', { name: 'Program' })).toBeVisible();
}

/** Moves the mouse over one grid cell mid-drag and waits for the highlight. */
export async function hover(page: Page, day: number, hour: number) {
  const cell = page.locator(`tr.target-row td[data-day="${day}"][data-hour="${hour}"]`);
  const box = (await cell.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 });
  await page.waitForTimeout(80); // the highlight is applied in the rAF loop
  return cell;
}

// ---------------------------------------------------------------------------
// Colour measurement. Contrast is asserted by COMPUTING it, never by eye.

/** "rgb(18, 53, 33)" -> [18, 53, 33] */
export function rgb(value: string): [number, number, number] {
  const parts = value.match(/\d+(\.\d+)?/g);
  if (parts === null || parts.length < 3) throw new Error(`renk okunamadı: ${value}`);
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

export function relativeLuminance(color: [number, number, number]): number {
  const [r, g, b] = color.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = relativeLuminance(rgb(a));
  const lb = relativeLuminance(rgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * CIE Lab distance. Contrast ratio is the WRONG measure for "are these two
 * backgrounds tellable apart": two colours can differ wildly in hue and still
 * have the same luminance, which is exactly the case for a dark green and a
 * dark olive.
 */
export function deltaE(a: string, b: string): number {
  const toLab = (value: string) => {
    const [r, g, bl] = rgb(value).map((v) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    const x = (0.4124 * r + 0.3576 * g + 0.1805 * bl) / 0.95047;
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    const z = (0.0193 * r + 0.1192 * g + 0.9505 * bl) / 1.08883;
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  };
  const la = toLab(a);
  const lb = toLab(b);
  return Math.hypot(la[0]! - lb[0]!, la[1]! - lb[1]!, la[2]! - lb[2]!);
}

/** Resolves the theme tokens to real rgb() values, the way the page paints them. */
export async function tokens(page: Page, names: string[]): Promise<Record<string, string>> {
  return page.evaluate((list) => {
    const probe = document.createElement('span');
    document.body.appendChild(probe);
    const out: Record<string, string> = {};
    for (const name of list) {
      probe.style.color = `var(${name})`;
      out[name] = getComputedStyle(probe).color;
    }
    probe.remove();
    return out;
  }, names);
}

/**
 * Picks a teacher, class or room in the availability panel.
 *
 * It used to be a <select> and one `selectOption` call; the list shows all of
 * them at once now, with the open/loaded hours on every row. Every test goes
 * through here so the next change to that panel is one edit, not five.
 */
export async function chooseEntity(page: Page, id: string) {
  await page.locator(`.entity[data-id="${id}"]`).click();
  await expect(page.locator('.entity[aria-current="true"]')).toHaveAttribute('data-id', id);
}

// --------------------------------------------------------------- scenes
//
// ONE list of what the app looks like, with two consumers: `npm run ekran`
// writes them to PNGs for a human to look at, and `e2e/gorsel.spec.ts` asserts
// them against a local reference. A scene added here shows up in both.

export interface Scene {
  /** File name stem; also the snapshot name. */
  name: string;
  /** Navigate and settle. */
  go: (page: Page) => Promise<void>;
  /** Undo anything the scene left running (a drag, a print media emulation). */
  after?: (page: Page) => Promise<void>;
}

const tab = (name: string) => async (page: Page) => {
  await page.getByRole('button', { name, exact: true }).click();
};

export const SCENES: Scene[] = [
  { name: '1-kurulum', go: tab('Kurulum') },
  {
    name: '2-kurulum-ogretmenler',
    go: async (page) => {
      await openSetup(page, 'Öğretmenler');
    },
  },
  { name: '3-musaitlik', go: tab('Müsaitlik') },
  {
    name: '4-program',
    go: async (page) => {
      await page.getByRole('button', { name: 'Program', exact: true }).click();
      await page.locator('table.grid').waitFor();
    },
  },
  {
    // Mid-drag: the whole point of the colour work is what this one frame shows.
    name: '5-suruklerken',
    go: async (page) => {
      await page.getByRole('button', { name: 'Program', exact: true }).click();
      await page.locator('table.grid').waitFor();
      const card = (await page.locator('.pool-card').first().boundingBox())!;
      await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2);
      await page.mouse.down();
      const cell = (await page.locator('tr.target-row td').nth(3).boundingBox())!;
      await page.mouse.move(cell.x + cell.width / 2, cell.y + cell.height / 2, { steps: 4 });
      await page.waitForTimeout(150); // the highlight lands in the rAF loop
    },
    after: async (page) => {
      await page.keyboard.press('Escape');
      await page.mouse.up();
    },
  },
  { name: '6-kontrol', go: tab('Kontrol') },
  {
    name: '7-yazdir',
    go: async (page) => {
      await page.getByRole('button', { name: 'Yazdır', exact: true }).click();
      await page.emulateMedia({ media: 'print' });
    },
    after: async (page) => {
      await page.emulateMedia({ media: 'screen' });
    },
  },
  {
    name: '8-ayarlar-okul',
    go: async (page) => {
      await openSettings(page, 'Okul');
    },
  },
  {
    name: '9-ayarlar-kurallar',
    go: async (page) => {
      await openSettings(page, 'Kurallar');
    },
  },
];

/** Loads the sample data in the chosen theme, for the scene list above. */
export async function openWithSampleTheme(page: Page, theme: 'light' | 'dark') {
  await page.goto(FILE);
  await page.evaluate((t) => localStorage.setItem('ders-programi-tema', t), theme);
  await page.reload();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
}
