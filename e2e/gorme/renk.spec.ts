// Colour, contrast and theme. Nothing here is claimed; everything is measured
// with real getComputedStyle values, WCAG contrast and CIE Lab ΔE.

import { expect, test } from '../kapan';
import { reopen, answerDialog, open, openWithSample, openSetup, openSettings, dragAndDrop, rgb, relativeLuminance, contrast, deltaE, tokens } from '../helpers';

// 8. Theme
//
// The app used to have NO dark theme, yet the screenshots came out dark: the
// browser darkens a light page with its own algorithm. For this tool that is
// not cosmetic — colour is the only feedback channel (green = droppable,
// yellow = warning, red = blocked), and the browser's darkening flattens the
// three into each other. These tests measure what is actually painted.

test.describe('8. Tema', () => {
  test('tema düğmesi çalışıyor ve tercih sayfa yenilenince duruyor', async ({ page }) => {
    await open(page);
    const toggle = page.getByRole('button', { name: 'Koyu tema' });

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await reopen(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await reopen(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  // The default is LIGHT and it does not follow the machine. Measured against a
  // machine that says otherwise, because a preference the code no longer reads
  // is exactly the kind of thing that disappears without a test noticing.
  test.describe('sistem koyu isterken', () => {
    test.use({ colorScheme: 'dark' });

    test('kayıt yokken sayfa yine de AÇIK açılıyor', async ({ page }) => {
      await open(page);
      expect(
        await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches),
      ).toBe(true);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

      // …and a deliberate choice still sticks, so "ignore the machine" has not
      // become "ignore the reader".
      await page.getByRole('button', { name: 'Koyu tema' }).click();
      await reopen(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });

  // Both themes, because the light one regressed too: --ok was 4.19:1 on its own
  // background and the "x" on a closed cell was 4.20:1.
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} temada durum renkleri ayırt edilebiliyor ve metin AA geçiyor`, async ({
      page,
    }) => {
      await open(page);
      if (theme === 'dark') await page.getByRole('button', { name: 'Koyu tema' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const t = await tokens(page, [
        '--ok',
        '--ok-bg',
        '--warn',
        '--warn-bg',
        '--bad',
        '--bad-bg',
        '--text',
        '--paper',
        '--muted',
        '--closed',
        '--accent',
        '--accent-bg',
      ]);

      // The page must really be the theme it claims, not a browser-darkened one.
      // The dark ceiling came down from 0.1 to 0.02 on 2026-08-27: the reader
      // asked for blacker blacks, every plane moved a full step, and a
      // threshold left at 0.1 would have let the whole change be undone
      // without a word. Measured .0174 before, .0096 after.
      const paperLuminance = relativeLuminance(rgb(t['--paper']!));
      if (theme === 'dark') {
        expect(paperLuminance, `koyu kâğıt parlaklığı ${paperLuminance}`).toBeLessThan(0.02);
      } else {
        expect(paperLuminance).toBeGreaterThan(0.9);
      }

      // Tellable apart from each other, and from a closed cell
      expect(deltaE(t['--ok-bg']!, t['--warn-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--warn-bg']!, t['--bad-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--ok-bg']!, t['--bad-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--closed']!, t['--paper']!)).toBeGreaterThan(12);

      // Readable (WCAG AA)
      for (const [fg, bg] of [
        ['--ok', '--ok-bg'],
        ['--warn', '--warn-bg'],
        ['--bad', '--bad-bg'],
        ['--text', '--paper'],
        ['--muted', '--paper'],
        ['--muted', '--closed'],
        ['--accent', '--accent-bg'],
      ] as const) {
        expect(contrast(t[fg]!, t[bg]!), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }

      // A HIGHER FLOOR for the one pair that was quietly the worst, added
      // 2026-08-27 and red in the dark theme the day before it was written.
      //
      // The muted ink on a closed hour is the small print of the grid: it is
      // where "why can this not be used" is written, in the smallest type on
      // screen, for a reader who has trouble seeing. The light theme has held
      // 5.09 since the palette was searched; the dark theme was at 4.69 and
      // passed because the shared floor is 4.5. It is 5.71 now.
      expect(
        contrast(t['--muted']!, t['--closed']!),
        'kapalı saatteki soluk yazı — ızgaranın en küçük puntosu',
      ).toBeGreaterThanOrEqual(5);

    });
  }

  // The seven section colours. They are the newest thing on screen that is a
  // COLOUR and not a state, so they are the likeliest to muddy the one channel
  // this tool cannot afford to lose: green = droppable, yellow = warning,
  // red = blocked. Nothing here is asserted about how they look; all three
  // constraints are measured off the real computed values.
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} temada sekme renkleri işlevsel renklere karışmıyor`, async ({ page }) => {
      await open(page);
      if (theme === 'dark') await page.getByRole('button', { name: 'Koyu tema' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const SECTIONS = [
        '--sec-setup',
        '--sec-availability',
        '--sec-lessons',
        '--sec-program',
        '--sec-check',
        '--sec-print',
        '--sec-settings',
      ];
      const t = await tokens(page, [...SECTIONS, '--ok', '--warn', '--bad', '--paper']);

      for (const name of SECTIONS) {
        // Readable where it is drawn: the lit tab's label is this colour on --paper.
        expect(contrast(t[name]!, t['--paper']!), `${name} on --paper`).toBeGreaterThanOrEqual(4.5);

        // And never mistakable for a state. The threshold is 32: below it two
        // colours of the same lightness start reading as the same hue family,
        // which is exactly the failure this test exists to catch.
        for (const fn of ['--ok', '--warn', '--bad'] as const) {
          expect(deltaE(t[name]!, t[fn]!), `${name} vs ${fn}`).toBeGreaterThan(32);
        }
      }

      // The section colour is a GROUND now, not only a rule: it fills the lit
      // tab, and since `data-section` moved to the app root it fills a pressed
      // filter chip too. Whatever --on-accent is, it has to survive on all seven.
      const ink = await tokens(page, ['--on-accent']);
      for (const name of SECTIONS) {
        expect(
          contrast(ink['--on-accent']!, t[name]!),
          `--on-accent on ${name}`,
        ).toBeGreaterThanOrEqual(4.5);
      }

      // Seven sections have to be seven identities, or the colour says nothing.
      // The seventh was the hard one: the wheel was already full (see the note
      // beside the tokens in styles.css), and every free arc but one landed in
      // a functional colour's family or in a neighbouring section's.
      for (let i = 0; i < SECTIONS.length; i++) {
        for (let j = i + 1; j < SECTIONS.length; j++) {
          expect(
            deltaE(t[SECTIONS[i]!]!, t[SECTIONS[j]!]!),
            `${SECTIONS[i]} vs ${SECTIONS[j]}`,
          ).toBeGreaterThan(12);
        }
      }
    });

    // The drop highlight used to share --ok-bg/--warn-bg/--bad-bg with the
    // reason bar and with a warned cell. Those are RESTING colours and were
    // tinted accordingly: measured at dE 16.1 from --paper in the light theme,
    // which across 78 columns is not a highlight, it is a rumour. Their own
    // three tokens are stronger, and this test is what keeps them so.
    test(`${theme} temada bırakma vurgusu kâğıttan gerçekten ayrılıyor`, async ({ page }) => {
      await open(page);
      if (theme === 'dark') await page.getByRole('button', { name: 'Koyu tema' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const t = await tokens(page, [
        '--drop-ok-bg',
        '--drop-warn-bg',
        '--drop-bad-bg',
        '--ok-bg',
        '--warn-bg',
        '--bad-bg',
        '--ok',
        '--warn',
        '--bad',
        '--paper',
      ]);

      for (const [drop, resting, edge] of [
        ['--drop-ok-bg', '--ok-bg', '--ok'],
        ['--drop-warn-bg', '--warn-bg', '--warn'],
        ['--drop-bad-bg', '--bad-bg', '--bad'],
      ] as const) {
        // Visible at a glance against the paper it sits on...
        expect(deltaE(t[drop]!, t['--paper']!), `${drop} vs --paper`).toBeGreaterThan(28);
        // ...and louder than the resting colour it replaced, which is the
        // whole reason the extra token exists.
        expect(
          deltaE(t[drop]!, t['--paper']!),
          `${drop} louder than ${resting}`,
        ).toBeGreaterThan(deltaE(t[resting]!, t['--paper']!));
        // The 3px outline is the second half of the signal, and it has to
        // survive on the ground it is drawn on. WCAG 1.4.11 asks 3:1 of a
        // non-text indicator; measured here 4.1 light / 5.0 dark.
        //
        // This assertion used to read `contrast(--on-color, drop)` on the
        // grounds that "the cell may hold a lesson card, and a card writes in
        // --on-color". That was wrong about the DOM and went red the moment
        // the dark drop grounds were darkened in the C round: a `.card` is a
        // button that fills its cell and carries its OWN palette background,
        // so --on-color never lands on --drop-*-bg. What is actually drawn on
        // that ground is the outline, so that is what is measured. The card's
        // own legibility is proved where it really happens — palette.test.ts,
        // and the card test further down this file.
        expect(contrast(t[edge]!, t[drop]!), `${edge} on ${drop}`).toBeGreaterThanOrEqual(3);
      }

      // Three states, three colours — still.
      expect(deltaE(t['--drop-ok-bg']!, t['--drop-warn-bg']!)).toBeGreaterThan(20);
      expect(deltaE(t['--drop-warn-bg']!, t['--drop-bad-bg']!)).toBeGreaterThan(20);
      expect(deltaE(t['--drop-ok-bg']!, t['--drop-bad-bg']!)).toBeGreaterThan(20);
    });

    test(`${theme} temada satır önizlemesi okunuyor ama imleci bastırmıyor`, async ({ page }) => {
      await open(page);
      if (theme === 'dark') await page.getByRole('button', { name: 'Koyu tema' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const t = await tokens(page, [
        '--can-ok-bg',
        '--can-warn-bg',
        '--can-no-bg',
        '--drop-ok-bg',
        '--drop-warn-bg',
        '--drop-bad-bg',
        '--paper',
        '--band',
      ]);

      const pairs = [
        ['--can-ok-bg', '--drop-ok-bg'],
        ['--can-warn-bg', '--drop-warn-bg'],
        ['--can-no-bg', '--drop-bad-bg'],
      ] as const;

      for (const [weak, strong] of pairs) {
        // Readable as a state rather than as a grouping: the day band sits at
        // dE ~2.5 from the paper and must never be confused with this.
        expect(deltaE(t[weak]!, t['--paper']!), `${weak} vs --paper`).toBeGreaterThan(9);
        expect(deltaE(t[weak]!, t['--band']!), `${weak} vs --band`).toBeGreaterThan(9);
        // ...and quieter than the cell under the cursor, or the second layer
        // would be shouting over the first.
        expect(
          deltaE(t[weak]!, t['--paper']!),
          `${weak} ${strong} kadar yüksek sesli`,
        ).toBeLessThan(deltaE(t[strong]!, t['--paper']!));
        // The two layers of one colour still have to be told apart.
        expect(deltaE(t[weak]!, t[strong]!), `${weak} vs ${strong}`).toBeGreaterThan(10);
      }

      // And the row's three answers are three answers. This is the number that
      // matters most: "buraya olur" against "buraya olmaz", read across 78
      // columns at a glance, is the whole point of painting the row at all.
      expect(deltaE(t['--can-ok-bg']!, t['--can-no-bg']!), 'olur/olmaz ayrımı').toBeGreaterThan(18);
      expect(deltaE(t['--can-ok-bg']!, t['--can-warn-bg']!)).toBeGreaterThan(14);
      expect(deltaE(t['--can-warn-bg']!, t['--can-no-bg']!)).toBeGreaterThan(14);
    });
  }

  test('koyu temada sürükleme geri bildirimi hâlâ üç ayrı renk', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
    await answerDialog(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('table.grid')).toBeVisible();

    // The card text sits on the teacher palette, which does NOT flip with the
    // theme — so its ink must not flip either, or the cell becomes unreadable.
    const card = page.locator('.pool-card').first();
    const ink = await card.evaluate((el) => {
      const own = getComputedStyle(el);
      const sub = el.querySelector('.card-bottom');
      return {
        background: own.backgroundColor,
        color: own.color,
        subColor: sub === null ? own.color : getComputedStyle(sub).color,
      };
    });
    expect(contrast(ink.color, ink.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink.subColor, ink.background)).toBeGreaterThanOrEqual(4.5);

    const t = await tokens(page, ['--ok-bg', '--bad-bg', '--closed']);
    expect(deltaE(t['--ok-bg']!, t['--closed']!)).toBeGreaterThan(15);
    expect(deltaE(t['--bad-bg']!, t['--closed']!)).toBeGreaterThan(15);
  });

  test('koyu temada bile kâğıda açık basılıyor', async ({ page }) => {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Çıktı', exact: true }).click();

    await page.emulateMedia({ media: 'print' });
    const printed = await tokens(page, ['--paper', '--text']);
    // White paper, dark ink — regardless of what the screen is set to
    expect(relativeLuminance(rgb(printed['--paper']!))).toBeGreaterThan(0.9);
    expect(relativeLuminance(rgb(printed['--text']!))).toBeLessThan(0.1);

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(relativeLuminance(rgb(bodyBg))).toBeGreaterThan(0.9);
    await page.emulateMedia({ media: 'screen' });
  });
});

// ---------------------------------------------------------------------------
// 14. Colour palette
//
// The palette used to be twelve CSS variables and colours repeated: with 25
// teachers, three of them shared a colour with someone else and the pool card
// no longer pointed at one row. It is now 36 hex values in src/palette.ts and
// every teacher gets one nobody else has. That claim is measured HERE, on the
// real thing, because a unit test can only prove the array is fine — not that
// the array is what the browser paints.

test.describe('14. Renk paleti', () => {
  test('25 öğretmenin hiçbiri bir başkasıyla aynı renkte değil', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Öğretmenler');

    // The colour select in the teacher list paints itself with that teacher's
    // colour, so it is the one per-teacher swatch on screen.
    const colors = await page
      .locator('table.list tbody tr .color-pick')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));

    expect(colors.length).toBeGreaterThanOrEqual(25);
    expect(new Set(colors).size, `${colors.length} öğretmen, tekrar eden renk var`).toBe(
      colors.length,
    );
  });

  test('paletteki her renk kartın iki yazısını da AA taşıyor', async ({ page }) => {
    await openWithSample(page);

    const samples = await page.locator('.pool-card').evaluateAll((cards) =>
      cards.map((el) => {
        const own = getComputedStyle(el);
        const sub = el.querySelector('.card-bottom');
        return {
          background: own.backgroundColor,
          color: own.color,
          subColor: sub === null ? own.color : getComputedStyle(sub).color,
        };
      }),
    );

    expect(samples.length).toBeGreaterThan(5);
    for (const s of samples) {
      expect(contrast(s.color, s.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(s.subColor, s.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('renkler birbirinden gerçekten ayırt ediliyor', async ({ page }) => {
    await openWithSample(page);
    const colors = await page
      .locator('.pool-card')
      .evaluateAll((cards) => cards.map((el) => getComputedStyle(el).backgroundColor));

    const unique = [...new Set(colors)];
    expect(unique.length).toBeGreaterThan(12); // the old palette's whole range

    let worst = Infinity;
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        worst = Math.min(worst, deltaE(unique[i]!, unique[j]!));
      }
    }
    expect(worst).toBeGreaterThanOrEqual(15);
  });

  test('her sınıfın da kendi rengi var ve satır başında görünüyor', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, 'Sınıflar');
    const swatches = await page
      .locator('table.list tbody tr .color-pick')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(swatches.length).toBeGreaterThanOrEqual(15);
    expect(new Set(swatches).size, 'iki sınıf aynı renkte').toBe(swatches.length);

    // The class colour is a MARK, not the cell fill: it shows on the row head.
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    const dots = await page
      .locator('tbody .row-head .row-dot')
      .evaluateAll((list) => list.map((el) => getComputedStyle(el).backgroundColor));
    expect(dots.length).toBe(swatches.length);
    expect(new Set(dots).size).toBe(dots.length);
  });

  test('hücreler her iki görünümde de ÖĞRETMEN renginde kalıyor', async ({ page }) => {
    // The decision behind the class colour: it marks the row, it never repaints
    // the grid. A cell keeps saying which teacher is in it.
    await openWithSample(page);
    await dragAndDrop(page);

    const teacherViewCell = await page
      .locator('table.grid .card')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole('button', { name: 'Sınıf görünümü' }).click();
    const classViewCell = await page
      .locator('table.grid .card')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(classViewCell).toBe(teacherViewCell);
  });

  test('palet iki temada ve kâğıtta AYNI', async ({ page }) => {
    await openWithSample(page);
    const read = () =>
      page
        .locator('.pool-card')
        .evaluateAll((cards) => cards.map((el) => getComputedStyle(el).backgroundColor));

    const light = await read();
    await page.getByRole('button', { name: 'Koyu tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await read()).toEqual(light);

    // Still dark on screen; the paper must show the very same pastels.
    await page.emulateMedia({ media: 'print' });
    expect(await read()).toEqual(light);
    await page.emulateMedia({ media: 'screen' });
  });
});

// ---------------------------------------------------------------------------
// 19. Icons, the lunch separator and the closed-hour mark
//
// Three things that only exist as pixels. jsdom has no layout and no computed
// font size, so none of this can be checked anywhere but here.

test.describe('19. Simgeler, ayraç ve çarpı', () => {
  test('iki görünüm simgesi birbirine benzemiyor', async ({ page }) => {
    await openWithSample(page);

    const shapes = async (name: string) =>
      page
        .getByRole('button', { name })
        .locator('svg *')
        .evaluateAll((list) =>
          list.map((el) =>
            [
              el.tagName,
              el.getAttribute('d') ?? '',
              el.getAttribute('cx') ?? '',
              el.getAttribute('cy') ?? '',
              el.getAttribute('r') ?? '',
            ].join(':'),
          ),
        );

    const teacher = await shapes('Öğretmen görünümü');
    const student = await shapes('Sınıf görünümü');

    expect(teacher.length).toBeGreaterThan(0);
    expect(student.length).toBeGreaterThan(0);
    // Not one variation on the other: no shape is shared between them.
    expect(teacher.filter((x) => student.includes(x))).toEqual([]);

    // Both are drawn big enough to be recognised at all.
    for (const name of ['Öğretmen görünümü', 'Sınıf görünümü']) {
      const box = (await page.getByRole('button', { name }).locator('svg').boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(16);
    }
  });

  test('seçili görünüm bölüm rengiyle DOLU, diğeri değil', async ({ page }) => {
    await openWithSample(page);
    const teacher = page.getByRole('button', { name: 'Öğretmen görünümü' });
    const klass = page.getByRole('button', { name: 'Sınıf görünümü' });

    await expect(teacher).toHaveAttribute('aria-pressed', 'true');
    await expect(klass).toHaveAttribute('aria-pressed', 'false');

    // It was an OPACITY difference until 2026-08-27: `.view-switch` faded the
    // position you were not in to 0.7. That box is gone — every group on every
    // strip is a `.ribbon-group` now, and one pair of buttons carrying a second
    // signal that no other pair has is a thing to learn rather than a thing to
    // read. What says which one you are on is what says it on all seven strips:
    // the pressed control wears the section's colour.
    const ink = async (l: typeof teacher) =>
      l.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, fg: cs.color, opacity: cs.opacity };
      });
    const on = await ink(teacher);
    const off = await ink(klass);
    expect(on.bg).not.toBe(off.bg);
    expect(on.bg).not.toBe('rgba(0, 0, 0, 0)');
    // ...and neither of them is dimmed, which is the part that changed.
    expect(on.opacity).toBe('1');
    expect(off.opacity).toBe('1');
  });

  test('öğle arası ayracı hücreden belirgin biçimde ince', async ({ page }) => {
    await openWithSample(page);

    const separator = (await page.locator('table.grid tbody .break-col').first().boundingBox())!;
    const cell = (await page.locator('table.grid td[data-day="0"]').first().boundingBox())!;

    expect(separator.width).toBeLessThanOrEqual(8);
    expect(separator.width).toBeLessThan(cell.width / 3);
    // Still a real column with its own edges, not a hairline that goes unseen.
    expect(separator.width).toBeGreaterThanOrEqual(4);
  });

  test('kapalı saatin çarpısı büyüdü ve hâlâ okunuyor', async ({ page }) => {
    await openWithSample(page);

    const mark = page.locator('table.grid td.unavailable').first();
    await expect(mark).toContainText('×');
    const style = await mark.evaluate((el) => {
      const own = getComputedStyle(el);
      // What "as big as the text beside it" measures to right now. Asked of a
      // probe and not of a `.card`, because the grid is EMPTY here — the
      // sample loads a school, not a timetable — and a comparison against a
      // card that does not exist is a test that passes by accident when it
      // does.
      const probe = document.createElement('span');
      probe.style.fontSize = 'var(--fs-base)';
      el.appendChild(probe);
      const beside = parseFloat(getComputedStyle(probe).fontSize);
      probe.remove();
      return {
        size: parseFloat(own.fontSize),
        color: own.color,
        background: own.backgroundColor,
        backgroundImage: own.backgroundImage,
        weight: own.fontWeight,
        beside,
      };
    });
    // 15 was the number when the root was 16px; it is 15.0 on a 14px root and
    // was failing on the third decimal. The contract was never a px value — it
    // is "the mark is the size of the text in the cell next to it, not dirt on
    // the hatch at 11px" — so that is what is asserted, and it survives the
    // next time the root moves.
    expect(style.beside, 'gövde puntosu ölçülemedi').toBeGreaterThan(0);
    expect(style.size).toBeGreaterThanOrEqual(style.beside);
    expect(style.size, `çarpı ${style.size}px — 11px "kirlilik" eşiğine geri dönmüş`)
      .toBeGreaterThan(13);

    // Bigger must not mean fainter: the hatch sits on --closed.
    const t = await tokens(page, ['--closed']);
    expect(contrast(style.color, t['--closed']!)).toBeGreaterThanOrEqual(4.5);
    expect(style.backgroundImage).toContain('repeating-linear-gradient');

    // Program now uses the exact same red, size and weight as Availability;
    // the hatch remains the non-colour channel on both tables.
    await page.getByRole('button', { name: 'Müsaitlik' }).click();
    const avail = await page
      .locator('table.availability td.closed')
      .first()
      .evaluate((el) => {
        const own = getComputedStyle(el);
        return {
          size: parseFloat(own.fontSize),
          color: own.color,
          weight: own.fontWeight,
          backgroundImage: own.backgroundImage,
        };
      });
    expect(avail.size).toBeGreaterThanOrEqual(15);
    expect(style.size).toBeCloseTo(avail.size, 1);
    expect(style.color).toBe(avail.color);
    expect(style.weight).toBe(avail.weight);
    expect(avail.backgroundImage).toContain('repeating-linear-gradient');
  });
});

test.describe('11. Görsel cila', () => {
  test('başlık altındaki sütunla aynı hizada', async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, 'Zil ve günler');

    // The bell preview centres its cells; its headings used to be left-aligned,
    // so the day names sat visibly off their own column.
    const head = page.locator('table.bell-preview thead th').nth(1);
    const cell = page.locator('table.bell-preview tbody tr').first().locator('td').first();
    const [a, b] = [await head.boundingBox(), await cell.boundingBox()];
    const centre = (box: { x: number; width: number }) => box.x + box.width / 2;
    expect(Math.abs(centre(a!) - centre(b!))).toBeLessThanOrEqual(1);
  });

  test('klavyeyle gezerken nerede olduğun belli', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab');

    const focus = await page.evaluate(() => {
      const el = document.activeElement;
      if (el === null) return null;
      const s = getComputedStyle(el);
      return { tag: el.tagName, style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(focus).not.toBeNull();
    expect(focus!.tag).toBe('BUTTON');
    expect(focus!.style).not.toBe('none');
    expect(parseFloat(focus!.width)).toBeGreaterThan(0);
  });

  test('tehlikeli düğme beklemeden tehlikeli görünüyor', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Hakkında');
    const [danger, plain] = await Promise.all([
      page
        .getByRole('button', { name: 'Her şeyi sil' })
        .evaluate((el) => getComputedStyle(el).color),
      page.getByRole('button', { name: 'Dosyadan aç', exact: true }).evaluate((el) => getComputedStyle(el).color),
    ]);
    // Not identical to a plain button until the pointer is already on it
    expect(danger).not.toBe(plain);
    const bad = await tokens(page, ['--bad']);
    expect(danger).toBe(bad['--bad']);
  });
});

// The 4px rule of section colour along the very top of the bar.
//
// The reader asked whether it is weaker in the light theme — "en üstteki
// şeridin üstündeki renk şeridi açık temada biraz daha az gözüküyor gibi …
// eğer bana öyle geldiyse boş verebilirsin" — so it was MEASURED rather than
// adjusted by eye, and the measurement said no. Against the top stop of the
// bar's own gradient, on 2026-08-27:
//
//   light   Kurulum 6.92 · Müsaitlik 7.26 · Program 7.31 ·
//           Kontrol 5.53 · Yazdır 7.05 · Ayarlar 7.26
//   dark    Kurulum 4.66 · Müsaitlik 4.65 · Program 4.28 ·
//           Kontrol 5.84 · Yazdır 5.28 · Ayarlar 4.49
//
// So it is the stronger of the two in five sections out of six, and nothing was
// changed. What is worth keeping is the FLOOR: this rule is how the bar says
// which room you are in before any label does, and WCAG 1.4.11 asks 3:1 of a
// non-text element that carries meaning. 3.5 leaves a little room under the
// weakest measured value without leaving room for a regression.
//
// The mix is PAINTED and the pixel read back: Chromium keeps
// `color-mix(in oklab, …)` in oklab, and reading it as a string gave numbers
// that looked plausible and were wrong by a factor of three — the parser took
// the lightness for a red channel and called every backdrop black.
test.describe('80. Bölüm şeridi', () => {
  const SECTIONS = ['Okul', 'Müsaitlik', 'Program', 'Kontrol', 'Çıktı', 'Ayarlar'] as const;

  for (const theme of ['light', 'dark'] as const) {
    test(`üst çubuğun renk şeridi ${theme} temada da görünüyor`, async ({ page }) => {
      await open(page);
      await page.evaluate((t) => localStorage.setItem('ders-programi-tema', t), theme);
      await reopen(page);

      for (const section of SECTIONS) {
        await page.getByRole('button', { name: section, exact: true }).click();
        const m = await page.evaluate(() => {
          const bar = document.querySelector('.topbar') as HTMLElement;
          const probe = document.createElement('div');
          // The TOP stop of the bar's own wash, read from the token the
          // stylesheet paints with. It was written out as 14%/16% here, and on
          // the day the wash was quieted this test went on measuring against a
          // mix nothing was painting any more — a measurement of a colour that
          // had stopped existing (pitfall 42's shape, in a test).
          probe.style.background =
            'color-mix(in oklab, var(--sec, var(--accent)) var(--wash-top), var(--chrome-lit))';
          bar.appendChild(probe);
          const mixed = getComputedStyle(probe).backgroundColor;
          probe.remove();

          const cv = document.createElement('canvas');
          cv.width = 1;
          cv.height = 1;
          const ctx = cv.getContext('2d')!;
          ctx.fillStyle = mixed;
          ctx.fillRect(0, 0, 1, 1);
          const px = ctx.getImageData(0, 0, 1, 1).data;

          const before = getComputedStyle(bar, '::before');
          return {
            strip: before.backgroundColor,
            height: parseFloat(before.height),
            under: `rgb(${px[0]}, ${px[1]}, ${px[2]})`,
          };
        });

        // It has to BE there before it can be visible.
        expect(m.height, `${section}: şerit çizilmiyor`).toBeGreaterThanOrEqual(3);
        expect(
          contrast(m.strip, m.under),
          `${theme} ${section}: ${contrast(m.strip, m.under).toFixed(2)}`,
        ).toBeGreaterThanOrEqual(3.5);
      }
    });
  }
});
