// Shared E2E helpers.
//
// The target is NOT the dev server but `dist/index.html` opened over file://
// — the very thing my father will double-click. What is tested here cannot be
// tested meaningfully in jsdom:
//   - does localStorage really work under file:// (risk of data loss)
//   - mouse drag and drop, the ghost card, the green/red highlight
//   - do the sticky columns really stay put at 1920x1080
//   - whether the print layout overflows

import { expect, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import type { State } from '../src/types';

export const FILE = pathToFileURL(resolve('dist/index.html')).href;

export async function open(page: Page) {
  await page.goto(FILE);
  await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();
  // The embedded face decides `ch`, and `ch` decides every column on the
  // width ladder. `font-display: block` means nothing is painted with the
  // fallback's metrics, so this wait is the moment the first glyph appears —
  // measuring before it would measure a layout no user ever sees.
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** Loads the sample data and switches to the Program tab. */
export async function openWithSample(page: Page) {
  await open(page);
  await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
  await answerDialog(page); // "örnek okul verisi yüklenecek"
  await page.getByRole('button', { name: 'Program', exact: true }).click();
  await expect(page.locator('table.grid')).toBeVisible();

  // ...and wait until the sample has actually been WRITTEN, not just drawn.
  //
  // Pitfall 24, one level up. The store debounces by 400 ms, so between "the
  // grid is on screen" and "localStorage holds the sample" there is a window
  // in which the page's own empty-state write is still the newest thing in
  // storage. `settledText()` cannot see the difference — its guard is
  // "something was written", and the empty state is something.
  // Tests that capture a baseline right after this helper were reading that
  // empty state and then comparing it against the sample.
  await expect
    .poll(async () => await savedText(page), { timeout: 5_000 })
    .toContain('Örnek Kurs');
}

/**
 * Setup is a strip of steps now, so reaching a field means naming its step.
 * Every test that used to just click "Kurulum" goes through here.
 */
export async function openSetup(page: Page, step: string) {
  await page.getByRole('button', { name: 'Kurulum' }).click();
  // The four steps live in the tool strip now, and they are `.btn`s there, so
  // "you are here" is `aria-pressed` — the button state — rather than
  // `aria-current`, which marked a navigation link.
  await page.locator('.ribbon .step', { hasText: step }).click();
  await expect(page.locator('.step[aria-pressed="true"]')).toContainText(step);
}

/**
 * The same for Ayarlar. School days, the bell, the four rules and the subject
 * list all live there now, not in Kurulum.
 */
export async function openSettings(page: Page, section: string) {
  await page.getByRole('button', { name: 'Ayarlar' }).click();
  // Sections are plain `.btn`s in the strip; they never had step numbers.
  await page
    .locator('.ribbon .btn', { hasText: section })
    .first()
    .click();
  await expect(page.locator('.ribbon .btn[aria-pressed="true"]')).toContainText(section);
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

/**
 * Loads any hand-built world through the REAL "Dosyadan aç" dialog.
 *
 * Writing straight into localStorage would be shorter and wrong: this path also
 * runs parseState() and sanitize(), which is what a backup file goes through in
 * the father's hands, and it does not race the 400 ms debounced auto-save.
 */
export async function loadWorld(page: Page, state: unknown, tab = 'Program') {
  await open(page);
  await page.locator('input[type=file]').setInputFiles({
    name: 'ders-programi-2026-08-25-1200.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(state)),
  });
  await answerDialog(page); // "şu anki programın yerine geçecek"
  await page.getByRole('button', { name: tab, exact: true }).click();
}

/** The raw string the page has in localStorage right now, or '' if nothing. */
export async function savedText(page: Page): Promise<string> {
  return (await page.evaluate(() => localStorage.getItem('ders-programi'))) ?? '';
}

/**
 * The saved string once the page has actually written one.
 *
 * Loading a world writes to localStorage 400 ms later, so reading the "before"
 * value straight after the load can catch an EMPTY box — and then the first
 * change `savedState` sees is the load's own save, not the run's. The audit
 * would then be judging the grid from before the button was ever pressed.
 */
export async function settledText(page: Page): Promise<string> {
  await expect
    .poll(async () => (await savedText(page)).length, {
      timeout: 5_000,
      message: 'sayfa açılışta hiçbir şey kaydetmedi',
    })
    .toBeGreaterThan(0);
  return savedText(page);
}

/**
 * The state the page saved AFTER something changed it.
 *
 * `previous` is the string read before the action, and it is not optional on
 * purpose: the store debounces by 400 ms, so "read once when the bar appears"
 * reliably returns the state from BEFORE the run, and "poll until it stops
 * changing" is satisfied by that same stale value. Waiting for the string to
 * differ is the only version that cannot pass by accident.
 */
export async function savedState(page: Page, previous: string): Promise<State> {
  await expect
    .poll(async () => await savedText(page), {
      timeout: 10_000,
      message: 'sayfa dizim sonrasında hiçbir şey kaydetmedi',
    })
    .not.toBe(previous);
  return JSON.parse(await savedText(page)) as State;
}

export async function openFixture(page: Page) {
  await open(page);
  await page.locator('input[type=file]').setInputFiles({
    name: 'ders-programi-2026-08-24-1200.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(FIXTURE)),
  });
  await answerDialog(page);
  await expect(page.getByRole('button', { name: 'Program', exact: true })).toBeVisible();
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
/**
 * The editable list on the left of a Kurulum step.
 *
 * Scoped on purpose. The C round put a SECOND `table.list` in the right-hand
 * column ("Kurulum durumu", `setup/Progress.tsx`), so a bare
 * `table.list tbody tr` counts both and every count in the suite came out four
 * rows high. One definition here rather than the same `.cols > div` prefix
 * written out in nine places.
 */
/**
 * The program's own dialog — every question it asks now goes through one.
 *
 * There used to be seventeen `window.confirm`/`window.alert` calls and the
 * suite answered them with `page.once('dialog', ...)`, which had to be armed
 * BEFORE the click. The in-page dialog is the other way round: click, then
 * read what it asked and answer it. That ordering is also the more honest
 * test, because it can assert the text while the dialog is on screen.
 *
 * Returns what the dialog said, so a test that cares can check the counting.
 */
export async function answerDialog(page: Page, answer: 'ok' | 'cancel' = 'ok'): Promise<string> {
  const dlg = page.locator('.dlg');
  await expect(dlg).toBeVisible();
  const said = (await dlg.innerText()).replace(/\s+/g, ' ').trim();
  // Cancel is FIRST in the DOM so focus lands on the safe side; the button
  // that does the thing is last. An alert has only one, and it is both.
  const buttons = dlg.locator('.dlg-actions .btn');
  await (answer === 'cancel' ? buttons.first() : buttons.last()).click();
  // Gone — OR replaced by the NEXT question. "Her şeyi sil" asks twice, and
  // the second dialog opens in the same tick the first one closes, so waiting
  // for `.dlg` to be hidden would wait for something that never happens.
  await expect(async () => {
    if ((await dlg.count()) === 0) return;
    const now = (await dlg.innerText()).replace(/\s+/g, ' ').trim();
    expect(now, 'diyalog kapanmadı ve metni de değişmedi').not.toBe(said);
  }).toPass({ timeout: 5000 });
  return said;
}

/** What the dialog is asking, without answering it. */
export async function dialogText(page: Page): Promise<string> {
  const dlg = page.locator('.dlg');
  await expect(dlg).toBeVisible();
  return (await dlg.innerText()).replace(/\s+/g, ' ').trim();
}

export function mainList(page: Page) {
  return page.locator('.cols > div table.list');
}

export async function chooseEntity(page: Page, id: string) {
  await page.locator(`.entity[data-id="${id}"]`).click();
  await expect(page.locator('.entity[aria-current="true"]')).toHaveAttribute('data-id', id);
}

// --------------------------------------------------------------- scenes
//
// ONE list of what the app looks like. `npm run ekran` writes them to PNGs for
// a human to look at.
//
// It used to have a second consumer, `e2e/gorsel.spec.ts`, which compared them
// against 24 checked-in references. That went on 2026-08-26 with the rest of
// the layout tests: a reference resolved against the machine's own font is
// right on one machine, and it turned every step of a redesign red for reasons
// that were never the redesign's fault.

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
  {
    // The whole week laid out by the tool itself: the one picture that shows
    // whether the automatic run produced something a person would keep.
    name: '6-otomatik',
    go: async (page) => {
      await page.getByRole('button', { name: 'Program', exact: true }).click();
      const run = page.getByRole('button', { name: /^Otomatik diz/ });
      if (await run.isEnabled()) {
        await run.click();
        await page.locator('.reason-bar.ok, .reason-bar.bad').waitFor({ timeout: 30_000 });
      }
    },
  },
  {
    // One teacher, on their own: the panel the reader asked for in a sentence.
    name: '6b-varlik-paneli',
    go: async (page) => {
      await page.getByRole('button', { name: 'Program', exact: true }).click();
      await page.locator('table.grid').waitFor();
      await page.locator('table.grid tbody tr').first().locator('.row-head .inspect').click();
      await page.locator('.sheet').waitFor();
      // The sheet slides in over --dur-slow; a shot taken in the same tick is
      // a shot of the transition, not of the panel.
      await page.waitForTimeout(400);
    },
    after: async (page) => {
      await page.keyboard.press('Escape');
      await page.locator('.sheet').waitFor({ state: 'hidden' });
    },
  },
  { name: '7-kontrol', go: tab('Kontrol') },
  {
    // The program's own question, with the cascade summary counted out. There
    // used to be seventeen of these and every one was the operating system's.
    name: '7b-diyalog',
    go: async (page) => {
      await openSetup(page, 'Derslikler');
      await mainList(page).locator('tbody tr').first().getByRole('button', { name: 'Sil' }).click();
      await page.locator('.dlg').waitFor();
    },
    after: async (page) => {
      await answerDialog(page, 'cancel');
    },
  },
  {
    name: '8-yazdir',
    go: async (page) => {
      await page.getByRole('button', { name: 'Yazdır', exact: true }).click();
      await page.emulateMedia({ media: 'print' });
    },
    after: async (page) => {
      await page.emulateMedia({ media: 'screen' });
    },
  },
  {
    name: '9-ayarlar-okul',
    go: async (page) => {
      await openSettings(page, 'Okul');
    },
  },
  {
    name: '10-ayarlar-kurallar',
    go: async (page) => {
      await openSettings(page, 'Kurallar');
    },
  },
  {
    // The plan library and the backup chain: the screen that answers "where is
    // my data" — and the one place a click can destroy a whole timetable.
    name: '11-ayarlar-veri',
    go: async (page) => {
      await openSettings(page, 'Veri');
    },
  },
  {
    // The scale setting, at the size it sets: the one screen whose own drawing
    // is the thing it controls.
    name: '12-ayarlar-gorunum',
    go: async (page) => {
      await openSettings(page, 'Görünüm');
    },
  },
];

/** Loads the sample data in the chosen theme, for the scene list above. */
export async function openWithSampleTheme(page: Page, theme: 'light' | 'dark') {
  await page.goto(FILE);
  await page.evaluate((t) => localStorage.setItem('ders-programi-tema', t), theme);
  await page.reload();
  await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
  await answerDialog(page);
}

/**
 * Picks a size in Ayarlar → Görünüm and waits until the button says it took.
 *
 * Two files need it now (44 and 45), and a scale change that is only half
 * applied when the next measurement runs is exactly the kind of flake that
 * makes people loosen a threshold instead of fixing a width.
 */
export async function chooseScale(page: Page, percent: number) {
  await openSettings(page, 'Görünüm');
  await page.getByRole('button', { name: `%${percent}`, exact: true }).click();
  await expect(page.getByRole('button', { name: `%${percent}`, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
}

/** Ayarlar → Görünüm'den ızgara yoğunluğunu seçer ve Program'a döner. */
export async function chooseDensity(page: Page, name: 'Ferah' | 'Rahat' | 'Sığdır') {
  await openSettings(page, 'Görünüm');
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Program', exact: true }).click();
  await expect(page.locator('table.grid')).toBeVisible();
}
