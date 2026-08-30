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

// The language is pinned in `kapan.ts`, for every test in every config at
// once — see the note there.
/**
 * A reload, and then the SAME two waits `open()` makes.
 *
 * This exists because a bare `page.reload()` had none of them, and about
 * twenty tests read the screen straight after one. `font-display: block` means
 * nothing is painted until the embedded face resolves, so a click issued right
 * after `reload()` can land before the first paint — under four parallel
 * workers that window is wide enough to lose, which is exactly the shape of
 * the "flake after a reload" recorded in STATUS for `dil` and `hareket`. It
 * got wider when the four dictionaries were embedded (+242 KB).
 *
 * It waits for `.topbar` and `.main` rather than for a tab NAME: the same
 * helper has to work after the language has been switched, and a Turkish name
 * is not on screen then. Both, not just the chrome: `.topbar` is drawn before
 * the tab's own content, and every one of these tests reads that content.
 */
/**
 * A locator that ignores the tab that is not on screen.
 *
 * The Program tab is wrapped in React's `<Activity mode="hidden">` since
 * `fb052f4`, which keeps its whole subtree — 1950 cells, the pool, its two
 * selects and its own empty state — MOUNTED and merely hidden. That is the
 * right call for the app (the grid does not have to be rebuilt to come back)
 * and it changes what a test means: a bare `.empty-screen` or a
 * `getByLabel('Sırala')` now resolves on every tab, because the hidden tab is
 * still in the document.
 *
 * This is pitfall 49's family with a new cause: there the collision came from
 * naming two controls alike, here it comes from two TABS being in the DOM at
 * once. A test that asks "what does this screen say" has to say which screen.
 */
export function onScreen(page: Page, selector: string) {
  return page.locator(`${selector}:visible`);
}

export async function reopen(page: Page) {
  await page.reload();
  await expect(page.locator('.topbar')).toBeVisible();
  await expect(page.locator('.main')).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

export async function open(page: Page) {
  await page.goto(FILE);
  await expect(page.getByRole('button', { name: 'Okul', exact: true })).toBeVisible();
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
  await page.getByRole('button', { name: 'Okul', exact: true }).click();
  await revealRibbon(page);
  // The four steps live in the tool strip now, and they are `.btn`s there, so
  // "you are here" is `aria-pressed` — the button state — rather than
  // `aria-current`, which marked a navigation link.
  await page.locator('.ribbon .step', { hasText: step }).click();
  await expect(page.locator('.step[aria-pressed="true"]')).toContainText(step);
}

/**
 * Dersler, which is a TAB now rather than step four of Kurulum.
 *
 * `exact: true` is not optional here: `getByRole(name:)` matches on substring
 * and ignores case (pitfalls 49 and 74), and "Dersler" appears inside
 * "Dersleri yapıştır", "Ders araçları" and Kurulum's own "Dersler sekmesi"
 * button. `mode` picks which way round the entry runs; 'all' is the general
 * list, which is the shape this screen had before it moved.
 */
/**
 * Puts subjects on the school's list, through the offer panel that is the
 * reason the list starts empty.
 *
 * A new project has NO subjects (`emptyState`), so any test that reaches for
 * the Branş dropdown has to say which subjects this school teaches first —
 * exactly as the reader does. "Listeye ekle" and not "Ekle": the add form on
 * the left of the same screen owns that name (pitfall 49).
 */
export async function addSubjects(page: Page, ...names: string[]) {
  await openSetup(page, 'Branşlar');
  for (const name of names) {
    await page
      .locator('.cols aside table.stat tr', { hasText: name })
      .getByRole('button', { name: 'Listeye ekle', exact: true })
      .click();
  }
}

export async function openLessons(page: Page, mode: 'class' | 'teacher' | 'all' = 'all') {
  await page.getByRole('button', { name: 'Dersler', exact: true }).click();
  await revealRibbon(page);
  const label = mode === 'class' ? 'Sınıftan' : mode === 'teacher' ? 'Öğretmenden' : 'Genel';
  await page.getByRole('button', { name: label, exact: true }).click();
  await expect(page.locator('.ribbon .btn[aria-pressed="true"]')).toContainText(label);
}

/**
 * The same for Ayarlar. School days, the bell, the four rules and the subject
 * list all live there now, not in Kurulum.
 */
/**
 * Brings the tool strip back before reaching for something in it.
 *
 * The strip hides itself while you read down the page (`src/ribbonScroll.ts`)
 * and comes back when you scroll up — so a test that has scrolled, or that is
 * on a long panel, has to look up first, exactly as a person would. Switching
 * TABS restores it on its own (the effect re-attaches), which is why this is
 * only needed for the strips that also navigate WITHIN a tab.
 */
export async function revealRibbon(page: Page) {
  // WAIT for the box first. `page.evaluate` runs whenever it is asked to, and
  // this helper used to answer "no `.main` yet" by returning silently — so on a
  // page that had not finished painting, nothing was nudged, the strip stayed
  // folded, and the assertion below timed out five seconds later. That is the
  // "flake after a reload" STATUS recorded against `revealRibbon`, and it was
  // never load SENSITIVITY: it was a helper with a silent no-op in it.
  await expect(page.locator('.main')).toBeVisible();
  await page.evaluate(() => {
    const box = document.querySelector('.main');
    if (box === null) throw new Error('.main yok — revealRibbon boşa çalışırdı');
    // A nudge and then the top, because `scrollTop = 0` on a box already at 0
    // fires nothing at all and the strip would stay folded on a page that has
    // no room to scroll.
    box.scrollTop = 1;
    box.scrollTop = 0;
  });
  await expect(page.locator('.app')).not.toHaveAttribute('data-ribbon', 'gizli');
  await expect(page.locator('.ribbon')).toBeVisible();
}

export async function openSettings(page: Page, section: string) {
  await page.getByRole('button', { name: 'Ayarlar' }).click();
  await revealRibbon(page);
  // Sections are plain `.btn`s in the strip; they never had step numbers.
  await page
    .locator('.ribbon .btn', { hasText: section })
    .first()
    .click();
  // THE FIRST GROUP, not the whole strip. Since 2026-08-30 the right-hand end
  // of Ayarlar → Görünüm carries the theme, and a pressed button there made
  // `.ribbon .btn[aria-pressed="true"]` two elements — a strict-mode violation
  // in a helper twenty files call. The section buttons are the FIRST
  // `.ribbon-group`, which is what this was always asking about.
  await expect(
    page.locator('.ribbon .ribbon-group').first().locator('.btn[aria-pressed="true"]'),
  ).toContainText(section);
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
 * it by auto-scrolling, not by teleporting.
 *
 * The margins are MEASURED, not written down. They used to be 140/70/70 with a
 * comment saying "the sticky column (132px), the sticky header (~44px)". Both
 * numbers came from a 16px root at 110%; at a 14px root the header is 49px and
 * the column 84, and the top margin was then excluding 21px of real grid. The
 * first teacher's row centre landed at y 175.5 against a bound of 179, so on a
 * drag whose target row was the first one EVERY cell was filtered out and the
 * suite reported "no cell went green" — an app failure that was not one, in
 * fourteen tests at once. Pitfall 42: a constant that came from a measurement
 * is only true until the thing it measured moves.
 */
export async function visibleCells(page: Page, selector: string) {
  // Asking boundingBox() cell by cell means 72 round trips and takes seconds;
  // waiting that long mid-drag makes the test flaky. Compute it all inside the
  // browser in one go.
  return page.evaluate((sel) => {
    const wrap = document.querySelector('.grid-wrap');
    if (wrap === null) return [];
    const r = wrap.getBoundingClientRect();
    // What the sticky column and the sticky heading ACTUALLY take right now,
    // plus the 56px band along each edge that drag.ts auto-scrolls in — that
    // one is a constant in the app, so it is a constant here.
    const BAND = 56;
    const head = document.querySelector('table.grid thead');
    const rowHead = document.querySelector('table.grid .row-head');
    const headH = head === null ? 0 : head.getBoundingClientRect().height;
    const colW = rowHead === null ? 0 : rowHead.getBoundingClientRect().width;
    const bounds = {
      left: r.left + colW + BAND,
      right: r.right - BAND,
      top: r.top + headH + 2,
      bottom: r.bottom - BAND,
    };

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
  schemaVersion: 7,
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
    { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 4, pairs: 0, maxPerDay: null },
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

  // ...and wait until the WORLD is in storage, not merely until something is.
  //
  // Pitfall 51, in the helper it was never fixed in. `settledText` guards
  // "the page has written something", and the page's own opening write of an
  // EMPTY project is something. When `open()` takes longer than the store's
  // 400 ms debounce that empty write lands first, every test that later calls
  // `savedState(page, before)` gets `before` = the empty project, and the first
  // change it sees is THIS LOAD rather than whatever the test went on to do.
  // It then audits the grid as it was before the button was ever pressed —
  // which is the vacuous-audit failure the world matrix has a guard against,
  // and that guard is exactly what caught it.
  //
  // Counting teachers AND lessons rather than either alone: `bos-dunya` has
  // teachers and no lessons, an empty project has neither, and one number
  // cannot tell those two apart.
  const world = state as { teachers?: unknown[]; lessons?: unknown[] };
  const shape = [world.teachers?.length ?? 0, world.lessons?.length ?? 0];
  await expect
    .poll(
      async () => {
        const raw = await savedText(page);
        if (raw === '') return [-1, -1];
        try {
          const d = JSON.parse(raw) as { teachers?: unknown[]; lessons?: unknown[] };
          return [d.teachers?.length ?? 0, d.lessons?.length ?? 0];
        } catch {
          return [-1, -1];
        }
      },
      { timeout: 5_000, message: 'yüklenen dünya depoya yazılmadı' },
    )
    .toEqual(shape);

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
 * column (Özet, `setup/Summary.tsx`), so a bare
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
  { name: '1-okul', go: tab('Okul') },
  {
    name: '2-okul-ogretmenler',
    go: async (page) => {
      await openSetup(page, 'Öğretmenler');
    },
  },
  { name: '3-musaitlik', go: tab('Müsaitlik') },
  {
    // The tab this round created, in the mode it opens in. The picture worth
    // having is the shortening: the form has no class box, and the strip and
    // the right-hand column together say which class it is filling in.
    name: '3b-dersler-siniftan',
    go: async (page) => {
      await openLessons(page, 'class');
    },
  },
  {
    // ...and the tray with its decks, which is the other thing that changed.
    name: '3c-dersler-genel',
    go: async (page) => {
      await openLessons(page, 'all');
    },
  },
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
  {
    // Ctrl+K. Six destinations, the frequent actions, and every teacher, class
    // and room by name.
    name: '6c-palet',
    go: async (page) => {
      await page.keyboard.press('Control+k');
      await page.locator('.palette').waitFor();
      await page.getByLabel('Ara veya komut yaz').fill('ma');
      await page.waitForTimeout(250);
    },
    after: async (page) => {
      await page.keyboard.press('Escape');
      await page.locator('.palette').waitFor({ state: 'hidden' });
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
    name: '8-cikti',
    go: async (page) => {
      await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
      await page.emulateMedia({ media: 'print' });
    },
    after: async (page) => {
      await page.emulateMedia({ media: 'screen' });
    },
  },
  {
    // The preview as the READER sees it, which is a different picture from the
    // one above: 8-yazdir emulates print media, so it shows the paper. This is
    // the sheet lying on the desk with the tick lists beside it — what somebody
    // actually looks at while deciding what to print.
    name: '8b-cikti-onizleme',
    go: async (page) => {
      await page.getByRole('button', { name: 'Çıktı', exact: true }).click();
      await page.locator('.print-page').first().waitFor();
    },
  },
  {
    // Kontrol, which had no tool strip at all until 2026-08-27.
    name: '8c-kontrol',
    go: async (page) => {
      await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
      await page.locator('.ribbon').waitFor();
    },
  },
  {
    name: '9-ayarlar-zil',
    go: async (page) => {
      await openSettings(page, 'Zil ve günler');
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
    name: '11-ayarlar-hakkinda',
    go: async (page) => {
      await openSettings(page, 'Hakkında');
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

/**
 * Ayarlar → Görünüm'den hareket basamağını seçer.
 *
 * The three names are short and generic, so `exact: true` — "Az" is inside
 * "Azalt" and every other word in the section (pitfall 49).
 */
export async function chooseMotion(page: Page, name: 'Tam' | 'Az' | 'Kapalı') {
  await openSettings(page, 'Görünüm');
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
}

/**
 * Ayarlar → Görünüm'den bir yoğunluk basamağı seçer.
 *
 * SCOPED TO ITS GROUP since 2026-08-27, when the one density split into two
 * ("Izgara yoğunluğu" and "Arayüz yoğunluğu"). Both offer Ferah / Rahat /
 * Sığdır, so an unscoped `getByRole` matches two buttons and dies of a
 * strict-mode violation — pitfall 74, from the direction where nothing was
 * renamed at all: a name only has to become AMBIGUOUS, and a second control
 * is enough.
 *
 * The GROUP and not the panel, since 2026-08-28: the two questions share one
 * panel now, so a `.panel` scoped by its heading would find the same box
 * twice and be ambiguous again. `role="group"` with an `aria-label` is what
 * actually separates them on the screen, for a screen reader as much as for
 * this helper — so it is the honest thing to ask.
 */
async function chooseDensityIn(
  page: Page,
  panel: 'Izgara yoğunluğu' | 'Arayüz yoğunluğu',
  name: 'Ferah' | 'Rahat' | 'Sığdır',
) {
  await openSettings(page, 'Görünüm');
  const box = page.getByRole('group', { name: panel, exact: true });
  await box.getByRole('button', { name, exact: true }).click();
  await expect(box.getByRole('button', { name, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
}

/** Ayarlar → Görünüm'den ızgara yoğunluğunu seçer ve Program'a döner. */
export async function chooseDensity(page: Page, name: 'Ferah' | 'Rahat' | 'Sığdır') {
  await chooseDensityIn(page, 'Izgara yoğunluğu', name);
  await page.getByRole('button', { name: 'Program', exact: true }).click();
  await expect(page.locator('table.grid')).toBeVisible();
}

/** ...and its twin, which moves the lists and leaves the grid alone. */
export async function chooseUiDensity(page: Page, name: 'Ferah' | 'Rahat' | 'Sığdır') {
  await chooseDensityIn(page, 'Arayüz yoğunluğu', name);
}

/**
 * How many lesson HOURS are on the grid.
 *
 * Not `.card` count, and the difference is the point: since 2026-08-27 a
 * two-hour block is drawn as ONE card spanning two columns, so counting cards
 * counts blocks and counting blocks is not what "the school got placed" means.
 * Every claim about how full the week is asks this instead, and it would give
 * the same answer if the drawing changed again.
 */
export async function placedHours(page: Page): Promise<number> {
  return page
    .locator('table.grid td:has(.card)')
    .evaluateAll((tds) =>
      tds.reduce((sum, td) => sum + (Number(td.getAttribute('colspan')) || 1), 0),
    );
}

/**
 * Wait until nothing on the page is still moving.
 *
 * A measurement taken mid-transition measures nothing. The pin on a card fades
 * over `--dur-fast` when the pointer leaves its cell, and an opacity read one
 * frame later came back **0.64** on a build whose rule says `0` — so a test
 * written to catch "the pin only appears on hover" passed against exactly that
 * build. Pitfall 59 is the same thing in its screenshot form, and the round
 * that wrote it also wrote the rule: a test that measures a LAYOUT or a
 * PAINTED value waits for this first.
 *
 * `a.finished` and not a fixed sleep: the durations are a setting (Ayarlar →
 * Görünüm → Hareket), so a number here would be wrong at two of the three
 * steps. Animations that never finish are filtered out rather than waited on,
 * and the whole wait is capped.
 */
export async function settledMotion(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await Promise.race([
      Promise.allSettled(
        document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.finished),
      ),
      new Promise((r) => setTimeout(r, 2_000)),
    ]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

/**
 * Open the Program strip's "Izgara → İşlemler" menu.
 *
 * The three controls at the right-hand end went behind one button on
 * 2026-08-30, because three equal columns of long words asked for 639 px of a
 * 1920 px strip at 150% and two of them came out past the edge (pitfall 48).
 * Everything they used to do is a `menuitem` now.
 */
export async function openGridMenu(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'İşlemler', exact: true }).click();
  await expect(page.locator('.menu')).toBeVisible();
}
