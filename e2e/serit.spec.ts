// 57. The tool strip, as a CONTRACT rather than a row hand-made per tab.
//
// Before 2026-08-27 the five strips were five different objects — Kurulum had
// symbols but no caption, Yazdır and Ayarlar were bare rows of words, and
// Kontrol had no strip at all, so arriving there moved everything under it up
// by the strip's whole height and leaving moved it back down. Nothing was
// wrong; there was simply no shape, and no test could have said there was one.
//
// Every assertion here is a measurement off the real dist/index.html, and every
// one of them would have been red the day before it was written.

import { type Page } from '@playwright/test';
import { expect, test } from './kapan';
import { chooseScale, loadWorld, open, openSettings, openWithSample } from './helpers';
import { makeWorld } from '../src/worlds';

// Seven since Dersler left Kurulum. The contract is the point: a new tab has
// to bring a strip with it, at the same height, opening with a caption, with a
// symbol and a word on every button — otherwise arriving there moves
// everything underneath.
const TABS = [
  'Okul', 'Müsaitlik', 'Dersler', 'Program', 'Kontrol', 'Çıktı', 'Ayarlar',
] as const;

/** What the strip IS right now, read in one round trip. */
async function strip(page: Page) {
  return page.evaluate(() => {
    const bar = document.querySelector('.ribbon');
    if (bar === null) return null;
    const buttons = [...bar.querySelectorAll<HTMLElement>('.btn')];
    return {
      height: bar.getBoundingClientRect().height,
      section: bar.getAttribute('data-section'),
      role: bar.getAttribute('role'),
      name: bar.getAttribute('aria-label'),
      // Rule 2: the first thing on the strip says what the buttons answer.
      opensWithCaption: bar.firstElementChild?.classList.contains('ribbon-label') === true,
      captions: [...bar.querySelectorAll('.ribbon-label')].length,
      buttons: buttons.length,
      // Rule 4: a symbol AND a word, never one alone.
      wordless: buttons.filter((b) => (b.textContent ?? '').trim() === '').length,
      symbolless: buttons
        .filter((b) => b.querySelector('svg') === null)
        .map((b) => (b.textContent ?? '').trim()),
      // Rule 5, as a set: one entry means they all agree.
      buttonHeights: [...new Set(buttons.map((b) => b.getBoundingClientRect().height.toFixed(1)))],
    };
  });
}

async function go(page: Page, tab: string) {
  await page.getByRole('button', { name: tab, exact: true }).click();
  // The strip is remounted with the tab; give the cross-fade a frame to land
  // before measuring a height.
  await expect(page.locator('.ribbon')).toBeVisible();
  await page.waitForTimeout(120);
}

test.describe('57. Araç şeridi — yedi sekme, tek iskelet', () => {
  // THE ORDER OF THE PROGRAM STRIP, asked for by name: "öğretmen ve sınıftan
  // seçimleri en solda eski yerinde olmalı". The program library arrived at the
  // head of the strip in the round before this one and pushed the view switch a
  // group to the right; it is a menu now and it stands third.
  //
  // Read as CAPTIONS rather than as buttons, because that is the level the
  // request was about — which question the strip asks first.
  test('Program şeridi Görünüm ile başlıyor, kitaplık üçüncü grup', async ({ page }) => {
    await openWithSample(page);
    await go(page, 'Program');

    // Upper case because the stylesheet says so, and read as RENDERED: the
    // screen is what the request was about.
    const captions = await page.locator('.ribbon .ribbon-label').allInnerTexts();
    expect(captions).toEqual(['GÖRÜNÜM', 'DİZ', 'PROGRAM', 'YOĞUNLUK', 'IZGARA']);

    // ...and the first control on it is the teacher view, before the class one
    // (the strip's own teacher-before-class rule).
    const first = page.locator('.ribbon .btn').first();
    await expect(first).toHaveAccessibleName('Öğretmen görünümü');
  });

  test('yedi sekmenin YEDİSİNDE şerit var ve hepsi aynı yükseklikte', async ({ page }) => {
    await openWithSample(page);

    const heights: number[] = [];
    for (const tab of TABS) {
      await go(page, tab);
      const bar = await strip(page);
      expect(bar, `${tab} sekmesinde şerit yok`).not.toBeNull();
      expect(bar!.role).toBe('toolbar');
      expect(bar!.name, `${tab} şeridinin adı yok`).toBeTruthy();
      heights.push(bar!.height);
    }

    // The reason this matters is not tidiness: the strip's height came and went
    // with Kontrol, so the grid, the pool and every panel under it jumped by
    // that much on the way in and again on the way out.
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    expect(
      max - min,
      `şerit yükseklikleri ayrışıyor: ${TABS.map((t, i) => `${t} ${heights[i]!.toFixed(1)}`).join(' · ')}`,
    ).toBeLessThanOrEqual(1);
  });

  test('her şerit bir başlıkla açılıyor ve her düğmede simge de kelime de var', async ({ page }) => {
    await openWithSample(page);

    for (const tab of TABS) {
      await go(page, tab);
      const bar = (await strip(page))!;
      expect(bar.opensWithCaption, `${tab} şeridi başlıkla açılmıyor`).toBe(true);
      expect(bar.buttons, `${tab} şeridinde hiç düğme yok`).toBeGreaterThan(0);
      // A symbol alone is unreadable the first time and unnameable in both test
      // layers (pitfall 56); a word alone gives the eye nothing to find at 150%.
      expect(bar.symbolless, `${tab}: simgesiz düğme(ler)`).toEqual([]);
      expect(bar.wordless, `${tab}: yazısız düğme(ler)`).toBe(0);
      expect(
        bar.buttonHeights,
        `${tab}: düğme yükseklikleri ayrışıyor (${bar.buttonHeights.join(', ')})`,
      ).toHaveLength(1);
    }
  });

  // RULE 6, MEASURED PROPERLY THIS TIME.
  //
  // "İkinci barın en başındaki yazıdan sonra gelen çizgi her sectionda aynı
  //  yerde olsun ve yazı ortalansın."
  //
  // The caption box was already padded to one width, so the first BUTTON did
  // land at one x — and that is all the old contract said, which is why nothing
  // caught the other half. The rule after the caption is an `::after` with no
  // `left`, so it was drawn at its STATIC position: right after the TEXT. Seven
  // captions of seven lengths put it at seven different places on a strip whose
  // whole claim was that it does not shift.
  //
  // Read at two scales, because a box in `em` and a word in `em` do not have to
  // grow together (pitfall 39) and this is exactly the pair that has to.
  for (const pct of [100, 150]) {
    test(`%${pct}: başlıktan sonraki çizgi yedi şeritte de AYNI yerde`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);

      const seen: Record<string, { rule: number; slack: number }> = {};
      for (const tab of TABS) {
        await go(page, tab);
        const m = await page.evaluate(() => {
          const bar = document.querySelector('.ribbon')!;
          const cap = bar.firstElementChild as HTMLElement;
          const after = getComputedStyle(cap, '::after');
          const box = cap.getBoundingClientRect();
          // Where the rule is painted, in the strip's own coordinates.
          const rule = parseFloat(after.left);
          // The word is centred when the ink left of it matches the ink right
          // of it. Measured with a Range, since the caption's box is wider than
          // its text by design.
          const range = document.createRange();
          range.selectNodeContents(cap);
          const text = range.getBoundingClientRect();
          return {
            rule,
            left: text.left - box.left,
            right: box.right - text.right,
            width: box.width,
          };
        });
        expect(m.width, `${tab}: başlık kutusu yok`).toBeGreaterThan(0);
        // Centred: the two margins agree. One pixel of tolerance is the
        // sub-pixel rounding of half an odd number.
        expect(
          Math.abs(m.left - m.right),
          `${tab}: başlık ortalanmamış (sol ${m.left.toFixed(1)}, sağ ${m.right.toFixed(1)})`,
        ).toBeLessThanOrEqual(1);
        // ...and it fits the box it is centred in, or the box is a lie.
        expect(m.left, `${tab}: başlık kutusundan taşıyor`).toBeGreaterThanOrEqual(-0.5);
        seen[tab] = { rule: m.rule, slack: m.left };
      }

      const rules = Object.values(seen).map((x) => x.rule);
      expect(
        Math.max(...rules) - Math.min(...rules),
        `çizgi sekmeden sekmeye kayıyor: ${JSON.stringify(seen)}`,
      ).toBeLessThanOrEqual(0.5);

      if (pct !== 100) await chooseScale(page, 100);
    });
  }

  test('%150 ölçekte de yedisi aynı yükseklikte ve hiçbiri taşmıyor', async ({ page }) => {
    // Pitfall 48: a bar whose contents do not shrink pushes them out of itself,
    // and what spills is not hidden, it is UNCLICKABLE. 150% is the scale this
    // tool's reader actually uses, so it is the scale the contract is measured
    // at — the strip has more in it than it did before this round.
    await openWithSample(page);
    await chooseScale(page, 150);

    const heights: number[] = [];
    for (const tab of TABS) {
      await go(page, tab);
      const bar = (await strip(page))!;
      heights.push(bar.height);
      expect(
        bar.buttonHeights,
        `${tab} %150'de düğme yükseklikleri ayrışıyor`,
      ).toHaveLength(1);

      // Every control on the strip has to still be reachable by the pointer.
      const spill = await page.evaluate(() => {
        const bar = document.querySelector('.ribbon')!;
        const box = bar.getBoundingClientRect();
        return [...bar.querySelectorAll<HTMLElement>('.btn')].filter((b) => {
          const r = b.getBoundingClientRect();
          return r.right > box.right + 1 || r.left < box.left - 1;
        }).length;
      });
      expect(spill, `${tab} %150'de ${spill} düğme şeridin dışına taştı`).toBe(0);
    }

    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
    await chooseScale(page, 100);
  });

  test('şerit katlanınca yedi sekmede de gidiyor, geri gelince duruyor', async ({ page }) => {
    await openWithSample(page);
    // The fold button's accessible name is its `aria-label` — the title
    // changes with the state and a name that moves is not a name (pitfall 49).
    const fold = page.getByRole('button', { name: 'Araç şeridi', exact: true });
    await fold.click();

    for (const tab of TABS) {
      await page.getByRole('button', { name: tab, exact: true }).click();
      await expect(page.locator('.ribbon')).toHaveCount(0);
    }

    await fold.click();
    await expect(page.locator('.ribbon')).toBeVisible();
  });
});

test.describe('58. Kontrol şeridi — sayfayı SEÇİYOR', () => {
  // For one round this strip held a three-way filter (Hepsi · Sorunlar ·
  // Kapasite) and the reader's verdict was that the three read the same. They
  // largely did: the panel everyone comes for was in all three, so two of the
  // buttons only ever removed things. The report is one page now, every table
  // is bounded and scrolls in place, and the strip does what a strip over a
  // long report is for — it goes somewhere, and says how much is there.

  async function openCheck(page: Page) {
    await openWithSample(page);
    await page.getByRole('button', { name: 'Kontrol', exact: true }).click();
    await expect(page.locator('.ribbon')).toBeVisible();
  }

  test('dört kapı: Sorunlar · Öğretmenler · Sınıflar · Derslikler', async ({ page }) => {
    await openCheck(page);
    const bar = page.locator('.ribbon');
    await expect(bar.getByRole('button', { name: /^Sorunlar \(\d+\)$/ })).toBeVisible();
    for (const name of ['Öğretmenler', 'Sınıflar', 'Derslikler']) {
      await expect(bar.getByRole('button', { name, exact: true })).toBeVisible();
    }
  });

  test('şerit sayfayı DEĞİŞTİRİYOR — ve basılı kalıyor', async ({ page }) => {
    await openCheck(page);
    const bar = page.locator('.ribbon');

    // "Programın durumu" is the one panel every view keeps: it is the question
    // a reader arrives with, not one of the answers.
    const durum = page.locator('.panel', {
      has: page.getByRole('heading', { name: 'Programın durumu', exact: true }),
    });

    for (const name of ['Öğretmenler', 'Sınıflar', 'Derslikler']) {
      const button = bar.getByRole('button', { name, exact: true });
      await button.click();
      // The click is VISIBLE in two ways: the button latches...
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      // ...and the page holds that panel and no other capacity panel.
      await expect(durum).toHaveCount(1);
      await expect(
        page.locator('.panel', { has: page.getByRole('heading', { name, exact: true }) }),
      ).toHaveCount(1);
      for (const other of ['Öğretmenler', 'Sınıflar', 'Derslikler'].filter((x) => x !== name)) {
        await expect(
          page.locator('.panel', { has: page.getByRole('heading', { name: other, exact: true }) }),
        ).toHaveCount(0);
      }
    }
  });

  test('HER görünüm ekrana sığıyor — kayıt maratonu yok', async ({ page }) => {
    // "Çok aşağı doğru gidiyor". One panel at a time is the answer, and each
    // capacity table is still bounded inside itself.
    await openCheck(page);
    const bar = page.locator('.ribbon');

    for (const name of ['Sorunlar (0)', 'Öğretmenler', 'Sınıflar', 'Derslikler']) {
      await bar.getByRole('button', { name, exact: true }).click();
      const box = await page.evaluate(() => {
        const m = document.querySelector('.main')!;
        return {
          page: m.scrollHeight,
          view: m.clientHeight,
          bounded: document.querySelectorAll('.main .stat-scroll').length,
        };
      });
      expect(box.bounded, name).toBeLessThanOrEqual(1);
      expect(box.page / box.view, name).toBeLessThan(1.6);
    }
  });

  test('"Sorunlar" sorun yokken de bir CEVAP veriyor', async ({ page }) => {
    await openCheck(page);
    // It used to be `disabled` — a door with nowhere to go. As a VIEW it is
    // never disabled: "there are none" is an answer worth landing on, and a
    // chosen view that drew nothing would read as a broken screen.
    const button = page
      .locator('.ribbon')
      .getByRole('button', { name: 'Sorunlar (0)', exact: true });
    await expect(button).toBeEnabled();
    await button.click();
    await expect(page.locator('.main')).toContainText('yerleşemeyen ders yok');
  });

  test('şeritteki sayılar raporun kendisiyle aynı şeyi söylüyor', async ({ page }) => {
    // The strip states rather than asks here, and a reading that disagrees with
    // the panels under it is worse than no reading.
    await openCheck(page);
    const value = page.locator('.ribbon .ribbon-value');
    await expect(value).toContainText(/\d+ engel/);
    await expect(value).toContainText(/\d+ uyarı/);

    const blocked = Number((await value.innerText()).match(/(\d+) engel/)![1]);
    const inPanels = await page.locator('table.stat .badge.impossible').count();
    // Not equality — the panels also badge closed-hour leftovers and capacity
    // rows, which the chip counts separately. What must hold is the direction:
    // a strip saying "0 engel" over a page full of red is the bug.
    if (blocked > 0) expect(inPanels).toBeGreaterThan(0);
    else await expect(page.locator('.panel', { hasText: 'Kural ihlalleri' })).toHaveCount(0);
  });

  test('"Sorunlar (N)" gerçek sorunlu okulda AÇIK ve doğru sayıyor', async ({ page }) => {
    // A hand-built school with TWO real problem rows, so the assertion cannot
    // pass by both sides being zero (pitfall 23 — the first version of this
    // test did exactly that on the healthy sample and looked green).
    //   - a lesson left on an hour closed afterwards (principle 6 keeps it)
    //   - a lesson with more hours than the week can hold
    await loadWorld(
      page,
      makeWorld({
        unavailable: { 'oMC|0|0': 1 },
        lessons: [
          { id: 'x1', classId: 's510', teacherId: 'oMC', weeklyHours: 1 },
          { id: 'x2', classId: 's510', teacherId: 'oMC', weeklyHours: 8 },
        ],
        placements: { 's510|0|0': 'x1' },
      }),
      'Kontrol',
    );

    const btn = page.locator('.ribbon').getByRole('button', { name: /^Sorunlar \(\d+\)$/ });
    const n = Number((await btn.innerText()).match(/\((\d+)\)/)![1]);
    await btn.click();
    const rows = await page.locator('.kontrol-sorun table.list tbody tr').count();

    // The guard: this school really is broken, so the equality below is worth
    // something.
    expect(n).toBeGreaterThan(0);
    expect(n).toBe(rows);
    await expect(btn).toBeEnabled();
  });
});

// Ayarlar was the one strip with an empty right-hand end: a single `Bölüm`
// group and nothing past it, on all five sections. ("Ayarlardaki özel
// sectionlara özgü ayarlar o sectionun alt şeridinde sağ üstte gözüksün.")
//
// The assertion is deliberately about the SHAPE rather than the wording: every
// section has something at the right end, it sits past the spacer, and no two
// sections say the same thing — a strip that reads the same wherever you stand
// is a strip that is not about where you are.
test.describe('60. Ayarlar şeridinin SAĞ ucu', () => {
  const SECTIONS = ['Zil ve günler', 'Kurallar', 'Görünüm', 'Planlar ve yedek', 'Hakkında'];

  test('beş bölümün beşinde de sağda bir grup var, ve beşi ayrı şeyler söylüyor', async ({
    page,
  }) => {
    await openWithSample(page);

    const seen: string[] = [];
    for (const s of SECTIONS) {
      await openSettings(page, s);
      const right = await page.evaluate(() => {
        const bar = document.querySelector('.ribbon')!;
        const kids = [...bar.children];
        const at = kids.findIndex((k) => k.classList.contains('spacer'));
        if (at < 0) return null;
        const after = kids.slice(at + 1) as HTMLElement[];
        if (after.length === 0) return null;
        const box = bar.getBoundingClientRect();
        return {
          text: after.map((k) => k.textContent ?? '').join(' ').split(/\s+/).join(' ').trim(),
          // Past the middle of the strip: "sağ üstte" is the request itself.
          rightOfCentre: after[0]!.getBoundingClientRect().left > box.left + box.width / 2,
          spill: after.some((k) => k.getBoundingClientRect().right > box.right + 1),
        };
      });
      expect(right, `${s}: şeridin sağ ucu boş`).not.toBeNull();
      expect(right!.text, `${s}: sağ grup boş`).not.toBe('');
      expect(right!.rightOfCentre, `${s}: sağ grup sağda değil`).toBe(true);
      expect(right!.spill, `${s}: sağ grup şeridin dışına taştı`).toBe(false);
      seen.push(right!.text);
    }

    // Five sections, five different readings — not one sentence repeated.
    expect(new Set(seen).size, seen.join(' | ')).toBe(SECTIONS.length);
  });

  // The one section whose right-hand group ASKS instead of stating, and the
  // reason it earns that is scrolling: Görünüm is long enough that the theme
  // panel — its first — is off the top of the screen by the time you are at
  // Hareket or Dil. The strip does not move.
  test('Görünümün sağ ucu temayı GERÇEKTEN çeviriyor', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Görünüm');

    const ground = () => page.evaluate(() => document.documentElement.dataset.theme ?? '');
    const rightEnd = page.locator('.ribbon .ribbon-group').last();

    await rightEnd.getByRole('button', { name: 'Koyu', exact: true }).click();
    expect(await ground()).toBe('dark');
    await rightEnd.getByRole('button', { name: 'Açık', exact: true }).click();
    expect(await ground()).toBe('light');
  });
});

test.describe('59. Şeritteki simgeler', () => {
  test('bir şeyin simgesi her ekranda AYNI', async ({ page }) => {
    // steps.tsx: "a symbol that means something different in each room is not a
    // symbol, it is decoration". Yazdır names classes and teachers too, and
    // before this round it named them with no symbol at all — the easiest place
    // for a second drawing of the same door to appear.
    await openWithSample(page);

    const shapeOf = async (tab: string, button: string) => {
      await go(page, tab);
      return page
        .locator('.ribbon')
        .getByRole('button', { name: button })
        .locator('svg')
        .first()
        .evaluate((n) => n.innerHTML.replace(/\s+/g, ''));
    };

    const setupTeacher = await shapeOf('Okul', 'Öğretmenler');
    const availTeacher = await shapeOf('Müsaitlik', 'Öğretmen');
    const printTeacher = await shapeOf('Çıktı', 'Öğretmenler');
    expect(availTeacher).toBe(setupTeacher);
    expect(printTeacher).toBe(setupTeacher);

    const setupClass = await shapeOf('Okul', 'Sınıflar');
    const printClass = await shapeOf('Çıktı', 'Sınıflar');
    expect(printClass).toBe(setupClass);
    // ...and a teacher does not look like a class.
    expect(setupClass).not.toBe(setupTeacher);
  });

  test('şeritteki simgeler çizgi rengini alıyor — iki temada da görünür', async ({ page }) => {
    // The hand-drawn four are on `currentColor` by construction; the lucide ones
    // arrived in this round and a stroke pinned to a colour would vanish on one
    // of the two planes. Read off the real page rather than off the source.
    await open(page);
    await openSettings(page, 'Görünüm');

    const inkMatches = async () =>
      page.locator('.ribbon .btn').first().evaluate((b) => {
        const svg = b.querySelector('svg')!;
        return getComputedStyle(svg).color === getComputedStyle(b).color;
      });

    expect(await inkMatches()).toBe(true);
    await page.getByRole('button', { name: 'Koyu tema', exact: true }).click();
    expect(await inkMatches()).toBe(true);
  });
});
