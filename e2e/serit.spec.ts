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
import {
  chooseScale,
  loadWorld,
  open,
  openSettings,
  openWithSample,
  revealRibbon,
  settledMotion,
  darkTheme,
  openProblems,
} from './helpers';
import { makeWorld } from '../src/pure/worlds';

// Five since K1 (2026-11-16). The contract is the point: a new tab has
// to bring a strip with it, at the same height, opening with a caption, with a
// symbol and a word on every button — otherwise arriving there moves
// everything underneath.
const TABS = ['Program', 'Öğretmenler', 'Sınıflar', 'Yazdır ve gönder', 'Okul bilgileri'] as const;

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
  await page.locator('.tabstrip').getByRole('button', { name: tab, exact: true }).click();
  await expect(page.locator('.ribbon')).toBeVisible();
  // UNFOLD IT FIRST, and wait for the motion instead of guessing at it.
  //
  // The strip hides itself while you read down a page (`ribbonScroll.ts`), and
  // at 150% the Ayarlar → Görünüm panel that `chooseScale` leaves you on is
  // long enough to scroll — so the first `go()` after a scale change measured a
  // strip that was still folding. Read height 2.38px against 54.63px on the
  // other six, i.e. the 52.25px spread this file reported as "yedisi aynı
  // yükseklikte değil". All seven ARE the same height; the ruler was moving
  // (pitfalls 59 and 92).
  await revealRibbon(page);
  await settledMotion(page);
}

test.describe('57. Araç şeridi — yedi sekme, tek iskelet', () => {
  // THE ORDER OF THE PROGRAM STRIP, asked for by name: "öğretmen ve sınıftan
  // seçimleri en solda eski yerinde olmalı". The program library arrived at the
  // head of the strip in the round before this one and pushed the view switch a
  // group to the right; it is a menu now and it stands third.
  //
  // Read as CAPTIONS rather than as buttons, because that is the level the
  // request was about — which question the strip asks first.
  test('Program şeridi Görünüm ile başlıyor, sağ ucu yalnız Daha fazla', async ({ page }) => {
    await openWithSample(page);
    await go(page, 'Program');

    // Upper case because the stylesheet says so, and read as RENDERED: the
    // screen is what the request was about.
    //
    // The request was about the LEFT end, so that is what is pinned exactly:
    // the captions before the spacer. The right end is read against LAYOUT.md
    // (Renk, Izgara) rather than folded into one list, because a list
    // of the whole strip went red on 2026-09-01 when Renk was added on the right
    // and said nothing about the promise on the left.
    const [left, right] = await page.locator('.ribbon').evaluate((bar) => {
      const sides: string[][] = [[], []];
      let side = 0;
      for (const el of bar.querySelectorAll('.ribbon-label, .spacer')) {
        if (el.classList.contains('spacer')) side = 1;
        else sides[side]!.push((el as HTMLElement).innerText);
      }
      return sides;
    });
    // Since 2026-11-16 (Sadeleşme): the seçenek's name shows only once there
    // are two, and Renk and the grid's operations are behind the
    // one Daha fazla at the right end.
    expect(left).toEqual(['GÖRÜNÜM', 'DİZ']);
    expect(right).toEqual([]);
    await expect(page.locator('.ribbon > .more-menu')).toHaveCount(1);

    // ...and the first control on it is the teacher view, before the class one
    // (the strip's own teacher-before-class rule).
    const first = page.locator('.ribbon .btn').first();
    await expect(first).toHaveAccessibleName('Öğretmen görünümü');
  });

  test('beş sekmenin BEŞİNDE şerit var ve hepsi aynı yükseklikte', async ({ page }) => {
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

  test('her şerit bir başlıkla açılıyor ve her düğmede simge de kelime de var', async ({
    page,
  }) => {
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

  // Pitfall 48: a bar whose contents do not shrink pushes them out of itself,
  // and what spills is not hidden, it is UNCLICKABLE.
  //
  // Read at BOTH ends of the ladder, and that is the correction this test
  // needed. It used to run only at 150% and say that was "the scale this
  // tool's reader actually uses" — the reader uses 100%, and a defect that
  // shows there is a different kind of defect from one that shows only at the
  // far end of the range. 150% stays because it is where the strip is under
  // the most pressure; 100% is here because it is the screen the program
  // arrives on.
  //
  // Measured at a81c79a, Program strip, 1920px: at 100% the flexible space was
  // 391.4px and nothing spilled; at 150% it was 0 and "İşlemler" sat 80.7px
  // outside the box. At 125% it was 78.5px, less than one button.
  for (const pct of [100, 150]) {
    test(`%${pct} ölçekte yedisi aynı yükseklikte ve hiçbiri taşmıyor`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);

      const heights: number[] = [];
      for (const tab of TABS) {
        await go(page, tab);
        const bar = (await strip(page))!;
        heights.push(bar.height);
        expect(bar.buttonHeights, `${tab} %${pct}'de düğme yükseklikleri ayrışıyor`).toHaveLength(
          1,
        );

        // Every control on the strip has to still be reachable by the pointer.
        const spill = await page.evaluate(() => {
          const bar = document.querySelector('.ribbon')!;
          const box = bar.getBoundingClientRect();
          return [...bar.querySelectorAll<HTMLElement>('.btn')].filter((b) => {
            const r = b.getBoundingClientRect();
            return r.right > box.right + 1 || r.left < box.left - 1;
          }).length;
        });
        expect(spill, `${tab} %${pct}'de ${spill} düğme şeridin dışına taştı`).toBe(0);
      }

      expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
      if (pct !== 100) await chooseScale(page, 100);
    });
  }

  // THE ORDER THE STRIP GIVES THINGS UP, measured rather than described.
  //
  // The rule is in LAYOUT.md and in styles.css: the space between groups
  // closes, then the inner captions go, then the words on the buttons go, and
  // buttons never go. Each step buys room at a different width, so a single
  // measurement at 1920px would pin only one of them and the other two would be
  // wishes — the shape pitfall 48 is about in the first place.
  //
  // Narrow boxes and not narrow scales, because the trigger is the strip's own
  // inline size: 150% at 1920px and 100% in a small window are the same
  // question asked twice.
  for (const width of [1920, 1440, 1280, 1024]) {
    test(`%150'de ${width}px kutuda da hiçbir düğme taşmıyor`, async ({ page }) => {
      await openWithSample(page);
      await chooseScale(page, 150);
      await page.setViewportSize({ width, height: 1080 });

      for (const tab of TABS) {
        await go(page, tab);
        const m = await page.evaluate(() => {
          const bar = document.querySelector('.ribbon')!;
          const box = bar.getBoundingClientRect();
          const buttons = [...bar.querySelectorAll<HTMLElement>('.btn')];
          return {
            spill: buttons.filter((b) => {
              const r = b.getBoundingClientRect();
              return r.right > box.right + 1 || r.left < box.left - 1;
            }).length,
            // Rule 4 of the strip contract survives every step: a button that
            // has given up its word still answers to its name.
            //
            // `innerText` and NOT `textContent`, and the difference is the
            // whole assertion: textContent never looks at CSS, so it reads a
            // `display: none` label exactly like a visible one and this check
            // would pass while the accessible name was gone (pitfall 56 with a
            // free green on top). innerText reports what is actually rendered.
            nameless: buttons.filter((b) => {
              const label = b.getAttribute('aria-label');
              return ((label ?? '').trim() || b.innerText.trim()) === '';
            }).length,
            buttons: buttons.length,
          };
        });
        expect(m.buttons, `${tab}: ${width}px kutuda şeritte hiç düğme yok`).toBeGreaterThan(0);
        expect(m.spill, `${tab}: ${width}px kutuda ${m.spill} düğme taştı`).toBe(0);
        expect(m.nameless, `${tab}: ${width}px kutuda ${m.nameless} düğme adını kaybetti`).toBe(0);
      }

      // ...and asked the way the suite asks everywhere else, because reading
      // the DOM and computing an accessible name are two different questions
      // and this test is about the second one.
      await go(page, 'Program');
      await expect(page.getByRole('button', { name: 'Sınıf görünümü', exact: true })).toBeVisible();

      await page.setViewportSize({ width: 1920, height: 1080 });
      await chooseScale(page, 100);
    });
  }

  // THE ORDER ITSELF, step by step.
  //
  // The spill tests above prove the strip fits. They do not prove it gives
  // things up in the declared order, and two of the three steps could be
  // deleted with every one of them still green — measured: removing step 1
  // changed nothing anywhere. A rule nothing measures is a wish (pitfall 48 is
  // in this repo because of exactly that), so this reads the four states the
  // rule describes and asserts each one is the state the rule names.
  //
  // Widths chosen from the strip's own inline size at a81c79a: %100/1920px is
  // 127.7em, %125/1920px is 102.2em, %150/1920px is 85.1em, and %150/1024px is
  // below 78em.
  const DURUMLAR = [
    { ad: '%100, 1920px', pct: 100, width: 1920, dar: false, icBaslik: true, kelime: true },
    { ad: '%125, 1920px', pct: 125, width: 1920, dar: true, icBaslik: true, kelime: true },
    { ad: '%150, 1920px', pct: 150, width: 1920, dar: true, icBaslik: false, kelime: true },
    { ad: '%150, 1024px', pct: 150, width: 1024, dar: true, icBaslik: false, kelime: false },
  ];

  for (const d of DURUMLAR) {
    test(`feda sırası · ${d.ad}`, async ({ page }) => {
      await openWithSample(page);
      if (d.pct !== 100) await chooseScale(page, d.pct);
      if (d.width !== 1920) await page.setViewportSize({ width: d.width, height: 1080 });
      await go(page, 'Program');

      const m = await page.evaluate(() => {
        const bar = document.querySelector('.ribbon')!;
        const kids = [...bar.children] as HTMLElement[];
        const ikinci = kids[1]!;
        const basliklar = [...bar.querySelectorAll<HTMLElement>('.ribbon-label')];
        const btn = bar.querySelector<HTMLElement>('.btn')!;
        const tokenPx = (name: string) => {
          const probe = document.createElement('div');
          // Out of the flow: as a flex item of a full strip the probe was
          // SHRUNK, and read 3.125px for a 4.875px token at %150 once the
          // narrowest step kept its words (2026-11-15).
          probe.style.position = 'absolute';
          probe.style.width = `var(${name})`;
          bar.appendChild(probe);
          const w = probe.getBoundingClientRect().width;
          probe.remove();
          return w;
        };
        return {
          // Step 1: the space between groups. Read off the element that
          // carries it, not off the token, so the rule is what is measured.
          aralik: parseFloat(getComputedStyle(ikinci).marginLeft),
          genis: tokenPx('--space-3'),
          dar: tokenPx('--space-2'),
          // Step 2: the opening caption always stays, the inner ones go.
          acilisBasligi: basliklar[0] !== undefined && basliklar[0].offsetParent !== null,
          icBaslikSayisi: basliklar.filter((b, i) => i > 0 && b.offsetParent !== null).length,
          // Step 3, read off the rule itself. NOT off innerText: the word is
          // given up by collapsing the type, not by removing the node, so the
          // text is still there to be read — which is the entire point, since
          // that node is the button's accessible name. innerText staying
          // non-empty here is the assertion, not the bug.
          yaziBoyu: parseFloat(getComputedStyle(btn).fontSize),
          // The strip's own size for a button word, read off the token.
          normal: (() => {
            const probe = document.createElement('span');
            probe.style.fontSize = 'var(--fs-sm)';
            bar.appendChild(probe);
            const px = parseFloat(getComputedStyle(probe).fontSize);
            probe.remove();
            return px;
          })(),
          metin: btn.innerText.trim(),
          ad: (btn.getAttribute('aria-label') ?? '').trim() || btn.innerText.trim(),
        };
      });

      // Step 1 fires first and never un-fires.
      expect(m.aralik, `${d.ad}: gruplar arası boşluk yanlış adımda`).toBeCloseTo(
        d.dar ? m.dar : m.genis,
        1,
      );
      // Step 2, and the opening caption survives every step: it is the box the
      // whole strip contract aligns to.
      expect(m.acilisBasligi, `${d.ad}: açılış başlığı gitti`).toBe(true);
      if (d.icBaslik) {
        expect(m.icBaslikSayisi, `${d.ad}: iç başlıklar erken feda edildi`).toBeGreaterThan(0);
      } else {
        expect(m.icBaslikSayisi, `${d.ad}: iç başlıklar hâlâ duruyor`).toBe(0);
      }
      // Step 3, and rule 4 of the contract underneath it: the name may never
      // go (pitfall 56). Since 2026-11-15 the last step no longer takes the word away: it takes
      // it one step down the ladder. So the word is drawn in every state, and
      // in the narrowest it is smaller than the strip's own size.
      expect(m.yaziBoyu, `${d.ad}: düğme kelimesi çizilmiyor`).toBeGreaterThan(0);
      if (d.kelime) {
        expect(m.yaziBoyu, `${d.ad}: düğme kelimesi erken küçüldü`).toBeCloseTo(m.normal, 1);
      } else {
        expect(m.yaziBoyu, `${d.ad}: son adım kelimeyi küçültmedi`).toBeLessThan(m.normal);
      }
      // In every state the text node is still in the tree and the button
      // still answers to a name.
      expect(m.metin, `${d.ad}: düğmenin metin düğümü gitti`).not.toBe('');
      expect(m.ad, `${d.ad}: düğme adını kaybetti`).not.toBe('');

      if (d.width !== 1920) await page.setViewportSize({ width: 1920, height: 1080 });
      if (d.pct !== 100) await chooseScale(page, 100);
    });
  }

  // The fold lives in Ayarlar → Görünüm since 2026-11-16 (Sadeleşme); Ayarlar
  // keeps its strip even folded, because its sections and the way back are
  // there.
  test("şerit katlanınca dört sekmede gidiyor, Okul bilgileri'nde kalıyor, geri gelince duruyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSettings(page, 'Görünüm');
    const group = page.getByRole('group', { name: 'Araç şeridi', exact: true });
    await group.getByRole('button', { name: 'Gizlensin', exact: true }).click();

    for (const tab of TABS) {
      await page.locator('.tabstrip').getByRole('button', { name: tab, exact: true }).click();
      await expect(page.locator('.ribbon')).toHaveCount(tab === 'Okul bilgileri' ? 1 : 0);
    }

    await openSettings(page, 'Görünüm');
    await group.getByRole('button', { name: 'Görünsün', exact: true }).click();
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await expect(page.locator('.ribbon')).toBeVisible();
  });
});

test.describe('58. Sorun listesinin bölümleri — sayfayı SEÇİYOR', () => {
  // The Kontrol strip's views moved to the head of the problem list with K3
  // (2026-11-16); the contract is the same.
  // For one round this strip held a three-way filter (Hepsi · Sorunlar ·
  // Kapasite) and the reader's verdict was that the three read the same. They
  // largely did: the panel everyone comes for was in all three, so two of the
  // buttons only ever removed things. The report is one page now, every table
  // is bounded and scrolls in place, and the strip does what a strip over a
  // long report is for — it goes somewhere, and says how much is there.

  async function openCheck(page: Page) {
    await openWithSample(page);
    await openProblems(page);
    await expect(page.locator('.sheet-views')).toBeVisible();
  }

  // Two doors on the strip and three behind Daha fazla since 2026-11-16: the
  // load tables are the same drawing Okul's Özet shows.
  const LOADS = [
    ['Öğretmen yükleri', 'Öğretmenler'],
    ['Sınıf yükleri', 'Sınıflar'],
    ['Derslik yükleri', 'Derslikler'],
  ] as const;
  async function load(page: Page, item: string) {
    await page.locator('.sheet-views .more-menu').click();
    await page.getByRole('menuitemradio', { name: item }).click();
  }

  test("beş kapı: Sorunlar · İpuçları, ve Daha fazla'da üç yük", async ({ page }) => {
    await openCheck(page);
    const bar = page.locator('.sheet-views');
    await expect(bar.getByRole('button', { name: /^Sorunlar \(\d+\)$/ })).toBeVisible();
    await expect(bar.getByRole('button', { name: /^İpuçları \(\d+\)$/ })).toBeVisible();
    await bar.locator('.more-menu').click();
    for (const [item] of LOADS) {
      await expect(page.getByRole('menuitemradio', { name: item })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(bar.locator('.more-menu')).toBeFocused();
  });

  test('şerit sayfayı DEĞİŞTİRİYOR — ve seçili kalıyor', async ({ page }) => {
    await openCheck(page);

    // "Programın durumu" is the one panel every view keeps: it is the question
    // a reader arrives with, not one of the answers.
    const durum = page
      .getByRole('dialog', { name: 'Programın durumu' })
      .locator('table.stat')
      .first();

    for (const [item, name] of LOADS) {
      await load(page, item);
      // The click is VISIBLE in two ways: the item is ticked...
      await page.locator('.sheet-views .more-menu').click();
      await expect(page.getByRole('menuitemradio', { name: item })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await page.keyboard.press('Escape');
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
    const bar = page.locator('.sheet-views');

    // Danışman's label carries a live count, like Sorunlar's — matched by
    // pattern rather than a guessed number (the real count comes from the
    // sample school and is not predicted here, pitfall 101).
    const views: Array<() => Promise<string>> = [
      async () => {
        await bar.getByRole('button', { name: 'Sorunlar (0)', exact: true }).click();
        return 'Sorunlar';
      },
      async () => {
        await bar.getByRole('button', { name: /^İpuçları \(\d+\)$/ }).click();
        return 'İpuçları';
      },
      ...LOADS.map(([item]) => async () => {
        await load(page, item);
        return item;
      }),
    ];
    for (const view of views) {
      const label = await view();
      const box = await page.evaluate(() => {
        const m = document.querySelector('.sheet.problem-list')!;
        return {
          page: m.scrollHeight,
          view: m.clientHeight,
          bounded: m.querySelectorAll('.stat-scroll').length,
        };
      });
      expect(box.bounded, label).toBeLessThanOrEqual(1);
      expect(box.page / box.view, label).toBeLessThan(1.6);
    }
  });

  test('"Sorunlar" sorun yokken de bir CEVAP veriyor', async ({ page }) => {
    await openCheck(page);
    // It used to be `disabled` — a door with nowhere to go. As a VIEW it is
    // never disabled: "there are none" is an answer worth landing on, and a
    // chosen view that drew nothing would read as a broken screen.
    const button = page
      .locator('.sheet-views')
      .getByRole('button', { name: 'Sorunlar (0)', exact: true });
    await expect(button).toBeEnabled();
    await button.click();
    await expect(page.getByRole('dialog')).toContainText('yerleşemeyen ders yok');
  });

  // The strip's "N engel · N uyarı" reading left on 2026-11-16: it said the
  // chip's number a third time. One count per screen.
  test('şerit sayıyı bir kez söylüyor: Sorunlar (N), engel/uyarı okuması yok', async ({ page }) => {
    await openCheck(page);
    await expect(page.locator('.sheet-views .ribbon-value')).toHaveCount(0);
    await expect(page.locator('.sheet-views')).not.toContainText(/\d+ (engel|uyarı)/);
  });

  test('"Sorunlar (N)" gerçek sorunlu okulda AÇIK ve doğru sayıyor', async ({ page }) => {
    // A hand-built school with TWO real problem rows, so the assertion cannot
    // pass by both sides being zero (pitfall 23 — the first version of this
    // test did exactly that on the healthy sample and looked green).
    //   - a lesson left on an hour closed afterwards (the no-data-loss principle keeps it)
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
    );
    await openProblems(page);

    const btn = page.locator('.sheet-views').getByRole('button', { name: /^Sorunlar \(\d+\)$/ });
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
  // Since 2026-11-16 (Sadeleşme): a reading only where the section has one of
  // its own (Kurallar's levels, the open plan, the version), and on every
  // section the same Daha fazla at the very end. The theme's copy that stood
  // here is gone: the theme is in Görünüm's panel alone.
  const READS: Array<[string, RegExp]> = [
    ['Kurallar', /kesin.*tercih.*kapalı/i],
    ['Planlar ve yedek', /Açık plan/i],
    ['Hakkında', /Sürüm/i],
  ];

  test('okuması olan bölümde sağda okuması var, her bölümde sonda Daha fazla', async ({ page }) => {
    await openWithSample(page);
    for (const [s, read] of READS) {
      await openSettings(page, s);
      await expect(page.locator('.ribbon')).toContainText(read);
    }
    for (const s of ['Zil ve günler', 'Kurallar', 'Görünüm', 'Planlar ve yedek', 'Hakkında']) {
      await openSettings(page, s);
      const last = await page.evaluate(
        () => document.querySelector('.ribbon')!.lastElementChild!.className,
      );
      expect(last, s).toContain('more-menu');
    }
  });

  test('tema şeritte değil, yalnız Görünüm panelinde', async ({ page }) => {
    await open(page);
    await openSettings(page, 'Görünüm');
    await expect(page.locator('.ribbon').getByRole('button', { name: 'Koyu' })).toHaveCount(0);
    await page
      .getByRole('group', { name: 'Tema', exact: true })
      .getByRole('button', { name: 'Koyu', exact: true })
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
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

    const setupTeacher = await shapeOf('Öğretmenler', 'Liste');
    const viewTeacher = await shapeOf('Program', 'Öğretmen görünümü');
    const printTeacher = await shapeOf('Yazdır ve gönder', 'Öğretmenler');
    expect(viewTeacher).toBe(setupTeacher);
    expect(printTeacher).toBe(setupTeacher);

    const setupClass = await shapeOf('Sınıflar', 'Liste');
    const printClass = await shapeOf('Yazdır ve gönder', 'Sınıflar');
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
      page
        .locator('.ribbon .btn')
        .first()
        .evaluate((b) => {
          const svg = b.querySelector('svg')!;
          return getComputedStyle(svg).color === getComputedStyle(b).color;
        });

    expect(await inkMatches()).toBe(true);
    await darkTheme(page);
    expect(await inkMatches()).toBe(true);
  });
});
