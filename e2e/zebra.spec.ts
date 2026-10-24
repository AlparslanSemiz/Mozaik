// Zebra: every list, in the order it is SEEN, without lowering contrast.
//
// The reader asked for rows one after another on slightly different grounds,
// the same in every list (TODO §0). The rule is CSS (`:nth-child` on the DOM),
// so what it can get wrong is which rows it counts: a row that is not a record
// (the bell preview's lunch row) or a second <tbody> that starts counting again
// (Branşlar's subjects that are not on the list). Both happened.
//
// Contrast is read from what is PAINTED: each text node's colour, through
// every ancestor's opacity, against the grounds stacked under it. A list row
// holds 7:1 on both stripes and in every state (DESIGN, Erişilebilirlik). Two
// inks do not yet, and are named here rather than hidden in a lower threshold:
// the functional badges and the red "Sil" in the light theme (TODO E1).

import { type Locator, type Page } from '@playwright/test';
import { expect, test } from './kapan';
import {
  answerDialog,
  contrast,
  listWorld,
  loadWorld,
  openLessons,
  openSettings,
  openSetup,
  openWithSample,
  openWithSampleTheme,
  savedText,
  settledMotion,
  tokens,
} from './helpers';

/** The ground a row is painted on: its own, or the panel's when it has none. */
const ground = (row: Locator) =>
  row.evaluate((el) => {
    for (let e: Element | null = el; e; e = e.parentElement) {
      const bg = getComputedStyle(e).backgroundColor;
      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    }
    return 'rgb(255, 255, 255)';
  });

async function grounds(rows: Locator): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < (await rows.count()); i++) out.push(await ground(rows.nth(i)));
  return out;
}

/** Two neighbours never share a ground, and every second row does. */
function expectAlternating(seq: string[], what: string) {
  expect(seq.length, `${what}: satır yok`).toBeGreaterThanOrEqual(3);
  expect(new Set(seq).size, `${what}: iki zemin`).toBe(2);
  for (let i = 1; i < seq.length; i++) {
    expect(seq[i], `${what}: ${i}. ve ${i + 1}. satır aynı zeminde`).not.toBe(seq[i - 1]);
  }
}

/**
 * Pointer away, and every transition finished: a tab cross-fades and a new
 * row fades in, and a colour read during either is a convincing lie
 * (pitfall 99).
 */
async function park(page: Page) {
  await page.mouse.move(1919, 1079);
  await settledMotion(page);
}

/**
 * The lowest painted contrast of any ink in these rows, with who it was.
 * Skipped, by name: what TODO E1 has yet to raise, and what WCAG exempts
 * (a disabled control).
 */
const lowestInk = (rows: Locator) =>
  rows.evaluateAll((list) => {
    type C = [number, number, number, number];
    const parse = (c: string): C => {
      const p = c.match(/[\d.]+/g)!.map(Number);
      return [p[0]!, p[1]!, p[2]!, p.length > 3 ? p[3]! : 1];
    };
    const over = (t: C, b: C): C => [
      t[0] * t[3] + b[0] * (1 - t[3]),
      t[1] * t[3] + b[1] * (1 - t[3]),
      t[2] * t[3] + b[2] * (1 - t[3]),
      1,
    ];
    const lin = (v: number) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: C) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const ratio = (a: C, b: C) => {
      const [x, y] = [lum(a), lum(b)];
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const groundOf = (el: Element): C => {
      const layers: C[] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) {
          layers.push(c);
          if (c[3] >= 1) break;
        }
      }
      let base: C = [255, 255, 255, 1];
      for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i]!, base);
      return base;
    };
    const opacity = (el: Element) => {
      let o = 1;
      for (let e: Element | null = el; e; e = e.parentElement)
        o *= parseFloat(getComputedStyle(e).opacity);
      return o;
    };
    const skipped = (el: Element) =>
      el.closest('.badge, .btn.danger, :disabled, [aria-disabled="true"]') !== null;
    let worst = { ratio: 99, who: '' };
    for (const row of list) {
      const inks: Element[] = [];
      const walk = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const el = walk.currentNode.parentElement;
        if (el && walk.currentNode.textContent!.trim() !== '' && !el.closest('select'))
          inks.push(el);
      }
      row.querySelectorAll('input[type=text], input[type=number], select').forEach((el) => {
        if ((el as HTMLInputElement).value !== '') inks.push(el);
      });
      for (const el of inks) {
        if (el.getClientRects().length === 0 || skipped(el)) continue;
        const bg = groundOf(el);
        const c = parse(getComputedStyle(el).color);
        const r = ratio(over([c[0], c[1], c[2], c[3] * opacity(el)], bg), bg);
        if (r < worst.ratio) {
          worst = {
            ratio: Math.round(r * 100) / 100,
            who: `${el.tagName} "${el.textContent?.trim().slice(0, 30)}"`,
          };
        }
      }
    }
    return worst;
  });

/** Every list this test holds to the rule, and how to reach it. */
interface Liste {
  ad: string;
  git: (page: Page) => Promise<void>;
  /** The rows, in the order they are on screen. */
  satir: string;
  /** A selected row carries its own ground and is left out of the stripe. */
  secili?: string;
  /** One row is a list too, but there is nothing to alternate. */
  tek?: boolean;
}

const ORNEK: Liste[] = [
  {
    ad: 'Öğretmenler',
    git: (p) => openSetup(p, 'Öğretmenler'),
    satir: '.cols > div table.list > tbody > tr',
  },
  {
    ad: 'Sınıflar',
    git: (p) => openSetup(p, 'Sınıflar'),
    satir: '.cols > div table.list > tbody > tr',
  },
  {
    ad: 'Derslikler',
    git: (p) => openSetup(p, 'Derslikler'),
    satir: '.cols > div table.list > tbody > tr',
  },
  {
    ad: 'Branşlar',
    git: (p) => openSetup(p, 'Branşlar'),
    satir: '.cols > div table.list > tbody > tr',
  },
  {
    ad: 'Özet',
    git: (p) => openSetup(p, 'Öğretmenler'),
    satir: '.cols aside table.stat > tbody > tr',
  },
  {
    ad: 'Dersler',
    git: (p) => openLessons(p, 'all'),
    satir: '.panel:has(.list-tools) table.list > tbody > tr',
  },
  {
    ad: "Dersler'in sol listesi",
    git: (p) => openLessons(p, 'class'),
    satir: '.entity-list > .entity',
    secili: '[aria-current="true"]',
  },
  {
    ad: "Müsaitlik'in listesi",
    git: (p) => p.getByRole('button', { name: 'Müsaitlik', exact: true }).click(),
    satir: '.entity-list > .entity',
    secili: '[aria-current="true"]',
  },
  {
    ad: 'Varlık panelinin dersleri',
    git: async (p) => {
      await p.getByRole('button', { name: 'Program', exact: true }).click();
      await p.locator('table.grid tbody tr').first().locator('.row-head .inspect').click();
      await p.locator('.sheet').waitFor();
    },
    satir: 'table.sheet-lessons > tbody > tr',
  },
  {
    ad: 'Yapıştırma önizlemesi',
    git: async (p) => {
      await openSetup(p, 'Öğretmenler');
      await p.getByRole('button', { name: "Excel'den yapıştır" }).first().click();
      await p
        .locator('.panel.inset textarea')
        .fill(
          [
            'Ayşe Kaya\tMatematik',
            'Mehmet Demir\tFizik',
            'Zeynep Çelik\tKimya',
            'Ali Şahin\tBiyoloji',
          ].join('\n'),
        );
      await p.locator('.panel.inset').getByRole('button', { name: 'Önizle' }).click();
    },
    satir: 'ul.paste-preview > li',
  },
  {
    ad: 'Günler',
    git: (p) => openSettings(p, 'Zil ve günler'),
    satir: '.main table.list:not(.bell-preview) > tbody > tr',
  },
  {
    ad: 'Zil saatleri',
    git: (p) => openSettings(p, 'Zil ve günler'),
    satir: 'table.bell-preview > tbody > tr:not(.break-row)',
  },
  {
    ad: 'Kurallar',
    git: (p) => openSettings(p, 'Kurallar'),
    satir: '.main .panel:first-child table.list > tbody > tr',
  },
  {
    ad: 'Görünüm örneği',
    git: (p) => openSettings(p, 'Görünüm'),
    satir: '.main table.list > tbody > tr',
  },
  {
    ad: 'Planlar',
    git: (p) => openSettings(p, 'Planlar ve yedek'),
    satir: '.main table.list > tbody > tr',
    tek: true,
  },
  {
    ad: 'Veriler nerede',
    git: (p) => openSettings(p, 'Hakkında'),
    satir: '.panel:has(h2:text-is("Veriler nerede")) table.stat > tbody > tr',
  },
  {
    ad: 'Çıktı özeti',
    git: (p) => p.getByRole('button', { name: 'Çıktı', exact: true }).click(),
    satir: '.panel:has(h2:text-is("Çıktı özeti")) table.stat > tbody > tr',
  },
];

const kontrol = (adi: RegExp) => async (p: Page) => {
  await p.getByRole('button', { name: 'Kontrol', exact: true }).click();
  await p.locator('.ribbon').getByRole('button', { name: adi }).click();
};
const panelRows = (h2: string, table = 'table') =>
  `.panel:has(h2:text-matches("^${h2}")) ${table} > tbody > tr`;

const DUNYA: Liste[] = [
  { ad: 'Programın durumu', git: kontrol(/^Sorunlar/), satir: panelRows('Programın durumu') },
  { ad: 'Kapalı saatte ders', git: kontrol(/^Sorunlar/), satir: panelRows('Kapalı saatte ders') },
  { ad: 'Kural ihlalleri', git: kontrol(/^Sorunlar/), satir: panelRows('Kural ihlalleri') },
  {
    ad: 'Yerleşemeyen dersler',
    git: kontrol(/^Sorunlar/),
    satir: panelRows('Yerleşemeyen dersler'),
  },
  { ad: 'Danışman uyarıları', git: kontrol(/^Danışman/), satir: panelRows('Danışman uyarıları') },
  {
    ad: 'Öğretmenlerin kapasitesi',
    git: kontrol(/^Öğretmenler$/),
    satir: '#kontrol-ogretmenler table.stat > tbody > tr',
  },
  {
    ad: 'Sınıfların kapasitesi',
    git: kontrol(/^Sınıflar$/),
    satir: '#kontrol-siniflar table.stat > tbody > tr',
  },
  {
    ad: 'Dersliklerin kapasitesi',
    git: kontrol(/^Derslikler$/),
    satir: '#kontrol-derslikler table.stat > tbody > tr',
  },
  {
    ad: 'Kendi sınırı olan öğretmenler',
    git: (p) => openSettings(p, 'Kurallar'),
    satir: panelRows('Kendi sınırı olan öğretmenler'),
  },
  {
    ad: 'Kendi sınırı olan sınıflar',
    git: (p) => openSettings(p, 'Kurallar'),
    satir: panelRows('Kendi sınırı olan sınıflar'),
  },
  {
    ad: 'Şu anki ihlaller',
    git: (p) => openSettings(p, 'Kurallar'),
    satir: panelRows('Şu anki ihlaller'),
  },
];

async function olc(page: Page, l: Liste, theme: string) {
  await l.git(page);
  await park(page);
  const rows = page.locator(l.satir);
  await expect(rows.first(), `${l.ad}: liste ekranda`).toBeVisible();
  if (!l.tek) {
    const seq = await grounds(rows);
    if (l.secili) {
      // By position: the selected row keeps its own ground and the rest of the
      // stripe does not move because of it.
      const sel = await rows.evaluateAll((els, s) => els.map((e) => e.matches(s)), l.secili);
      const odd = seq.filter((_, i) => !sel[i] && i % 2 === 0);
      const even = seq.filter((_, i) => !sel[i] && i % 2 === 1);
      expect(new Set(odd).size, `${l.ad}: tek satırlar tek zeminde`).toBe(1);
      expect(new Set(even).size, `${l.ad}: çift satırlar tek zeminde`).toBe(1);
      expect(odd[0], `${l.ad}: tek ile çift ayrı`).not.toBe(even[0]);
    } else expectAlternating(seq, l.ad);
  }
  const worst = await lowestInk(rows);
  expect(worst.ratio, `${theme} · ${l.ad}: en düşük mürekkep ${worst.who}`).toBeGreaterThanOrEqual(
    7,
  );
}

test.describe('94. Zebra: her listede, görünen sırayla', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: örnek okulun her listesi dönüşümlü ve satırda her yazı 7:1`, async ({
      page,
    }) => {
      await openWithSampleTheme(page, theme);
      for (const l of ORNEK) {
        await olc(page, l, theme);
        await page.keyboard.press('Escape');
      }
    });

    test(`${theme}: Kontrol ve Kurallar'ın sorun listeleri de`, async ({ page }) => {
      await loadWorld(page, listWorld(), 'Kontrol');
      if (theme === 'dark') await page.getByRole('button', { name: 'Koyu tema' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      for (const l of DUNYA) await olc(page, l, theme);
    });
  }

  // The four lists with a search, a sort and group chips. Each operation
  // changes which rows are in the DOM and in what order; the stripe has to
  // follow what is seen, not where a row stood before.
  const ARACLI: Array<{ ad: string; git: (p: Page) => Promise<void> }> = [
    { ad: 'Öğretmenler', git: (p) => openSetup(p, 'Öğretmenler') },
    { ad: 'Sınıflar', git: (p) => openSetup(p, 'Sınıflar') },
    { ad: 'Derslikler', git: (p) => openSetup(p, 'Derslikler') },
    { ad: 'Dersler', git: (p) => openLessons(p, 'all') },
  ];
  for (const l of ARACLI) {
    test(`${l.ad}: ara, sırala, grupla, sil ve geri al sonrası şerit görünen sırayı izliyor`, async ({
      page,
    }) => {
      await openWithSample(page);
      await l.git(page);
      const panel = page.locator('.panel:has(.list-tools)');
      const rows = panel.locator('table.list > tbody > tr');
      const total = await rows.count();
      const check = async (what: string) => {
        await park(page);
        expectAlternating(await grounds(rows), `${l.ad}, ${what}`);
      };

      // A search that leaves more than two rows and fewer than all.
      const search = panel.locator('.list-tools input[type="text"]').first();
      let searched = false;
      for (const letter of ['e', 'a', 'i', 'r', '1', '0']) {
        await search.fill(letter);
        const n = await rows.count();
        if (n >= 3 && n < total) {
          searched = true;
          break;
        }
      }
      expect(searched, `${l.ad}: süzen bir arama bulunamadı`).toBe(true);
      await check('aramadan sonra');
      await search.fill('');

      const sort = panel.locator('.list-tools select').first();
      await sort.selectOption({ index: 1 });
      await check('sıralamadan sonra');
      await sort.selectOption({ index: 0 });

      // A group chip that leaves at least three rows and fewer than all. In
      // the sample every room sits in one load group, and a strip with one
      // group draws no chips at all: there is nothing to group, and the test
      // says so in its annotations rather than passing quietly.
      const chips = panel.locator('.list-tools .chip');
      if ((await chips.count()) === 0) {
        test.info().annotations.push({ type: 'grup çipi yok', description: l.ad });
      } else {
        let grouped = false;
        for (let i = 0; i < (await chips.count()) && !grouped; i++) {
          await chips.nth(i).click();
          const n = await rows.count();
          if (n >= 3 && n < total) grouped = true;
          else await chips.nth(i).click();
        }
        expect(grouped, `${l.ad}: süzen bir grup çipi bulunamadı`).toBe(true);
        await check('grup çipinden sonra');
        await panel.locator('.list-tools .chip[aria-pressed="true"]').first().click();
        await expect(rows).toHaveCount(total);
      }

      // A row goes from the middle, and comes back to the same place.
      await rows.nth(2).getByRole('button', { name: 'Sil', exact: true }).click();
      await answerDialog(page);
      await expect(rows).toHaveCount(total - 1);
      await check('silmeden sonra');
      await page.locator('body').press('Control+z');
      await expect(rows).toHaveCount(total);
      await check('geri almadan sonra');
    });
  }

  for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: üstüne gelme bir halka, zemini değiştirmiyor, odak halkasından ayrı`, async ({
      page,
    }) => {
      await openWithSampleTheme(page, theme);
      const t = await tokens(page, ['--muted', '--accent', '--zebra', '--paper']);
      await openSetup(page, 'Öğretmenler');
      const rows = page.locator('.cols > div table.list > tbody > tr');
      for (const i of [0, 1]) {
        await park(page);
        const before = await ground(rows.nth(i));
        await rows.nth(i).locator('td.row-no').hover();
        await settledMotion(page);
        const ring = await rows.nth(i).evaluate((tr) => {
          const s = getComputedStyle(tr);
          return {
            style: s.outlineStyle,
            width: parseFloat(s.outlineWidth),
            color: s.outlineColor,
          };
        });
        expect(await ground(rows.nth(i)), 'üstüne gelince zemin aynı').toBe(before);
        expect(ring.style).toBe('solid');
        expect(ring.width).toBe(2);
        expect(ring.color).toBe(t['--muted']);
        for (const g of [t['--zebra']!, t['--paper']!]) {
          expect(contrast(ring.color, g), 'halka iki şeritten de seçiliyor').toBeGreaterThanOrEqual(
            3,
          );
        }
        expect((await lowestInk(rows.nth(i))).ratio, 'üstüne gelinen satır').toBeGreaterThanOrEqual(
          7,
        );
      }
      await park(page);

      // Every control in an even row, reached with Tab, carries the program's
      // own ring: the accent, outside the control, never the hover's grey.
      await rows.nth(1).locator('.row-grip').focus();
      await page.keyboard.press('Shift+Tab');
      const seen: string[] = [];
      for (let k = 0; k < 12; k++) {
        await page.keyboard.press('Tab');
        const f = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const s = getComputedStyle(el);
          return {
            inRow:
              el.closest('tr') ===
              document.querySelectorAll('.cols > div table.list > tbody > tr')[1],
            who: `${el.tagName}.${el.className}`,
            style: s.outlineStyle,
            width: parseFloat(s.outlineWidth),
            color: s.outlineColor,
          };
        });
        if (!f.inRow) break;
        seen.push(f.who);
        expect(f.style, `${f.who} odak halkası`).toBe('solid');
        expect(f.width).toBe(2);
        expect(f.color, `${f.who} odak rengi accent`).toBe(t['--accent']);
        expect(f.color).not.toBe(t['--muted']);
      }
      expect(seen.length, 'satırda Tab ile gezildi').toBeGreaterThanOrEqual(5);

      // The selected entity: its own ground, --text on it, and the hover ring
      // does not land on it.
      await page.getByRole('button', { name: 'Müsaitlik', exact: true }).click();
      await park(page);
      const sel = page.locator('.entity[aria-current="true"]');
      expect((await lowestInk(sel)).ratio, 'seçili satır').toBeGreaterThanOrEqual(7);
      const other = page.locator('.entity-list > .entity:not([aria-current="true"])').nth(2);
      await other.hover();
      await settledMotion(page);
      expect(await other.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe('solid');
      expect((await lowestInk(other)).ratio, 'üstüne gelinen varlık').toBeGreaterThanOrEqual(7);

      // The lunch row of the bell preview: its own ground, and --text on it.
      await openSettings(page, 'Zil ve günler');
      await park(page);
      expect(
        (await lowestInk(page.locator('table.bell-preview tr.break-row'))).ratio,
        'ara satırı',
      ).toBeGreaterThanOrEqual(7);

      // The open plan says so on the row, not only in a hint.
      await openSettings(page, 'Planlar ve yedek');
      await park(page);
      const current = page
        .locator('.main table.list > tbody > tr[aria-current="true"] > td')
        .first();
      expect(await current.evaluate((td) => getComputedStyle(td).boxShadow)).toContain(
        t['--accent']!,
      );
    });
  }

  test('forced-colors: şerit Canvas olur, halka kalır', async ({ page }) => {
    await openWithSample(page);
    await page.emulateMedia({ forcedColors: 'active' });
    await openSetup(page, 'Öğretmenler');
    const rows = page.locator('.cols > div table.list > tbody > tr');
    await park(page);
    await rows.nth(1).locator('td.row-no').hover();
    const ring = await rows.nth(1).evaluate((tr) => getComputedStyle(tr).outlineStyle);
    expect(ring, "forced-colors'ta üstüne gelme halkası").toBe('solid');
  });

  test('zil önizlemesinde öğle arası satırı sayılmıyor, ders satırları dönüşümlü', async ({
    page,
  }) => {
    await openWithSample(page);
    await openSettings(page, 'Zil ve günler');
    await park(page);
    const preview = page.locator('table.bell-preview');
    // The sample has two patterns with the lunch after the 5th and the 6th
    // lesson, so two lunch rows sit between lessons 5, 6 and 7.
    await expect(preview.locator('tbody tr.break-row')).toHaveCount(2);
    expectAlternating(
      await grounds(preview.locator('tbody tr:not(.break-row)')),
      'zil önizlemesinin ders satırları',
    );
  });

  test('Branşlar: listede olmayan branşların gövdesi yeni bir grup olarak başlıyor', async ({
    page,
  }) => {
    // Two subjects leave the list while teachers still hold them: 19 listed
    // rows (odd, so the last is paper) and two "listede değil" rows in their
    // own <tbody>, whose count starts again on paper. Paper followed paper.
    await openWithSample(page);
    const state = JSON.parse(await savedText(page)) as { settings: { subjects: string[] } };
    state.settings.subjects = state.settings.subjects.filter(
      (x) => x !== 'Felsefe' && x !== 'Din Kültürü',
    );
    await loadWorld(page, state, 'Okul');
    await openSetup(page, 'Branşlar');
    await park(page);

    const bodies = page.locator('.cols > div table.list > tbody');
    await expect(bodies).toHaveCount(2);
    expectAlternating(await grounds(bodies.nth(0).locator('tr')), 'listedeki branşlar');
    // Where the groups meet, a rule says a new group starts rather than two
    // rows silently sharing a ground.
    const first = bodies.nth(1).locator('tr').first();
    const edge = await first
      .locator('td')
      .first()
      .evaluate((td) => {
        const s = getComputedStyle(td);
        return {
          width: parseFloat(s.borderTopWidth),
          style: s.borderTopStyle,
          color: s.borderTopColor,
        };
      });
    const t = await tokens(page, ['--line-dark']);
    expect(edge.style, 'ikinci gövdenin üst çizgisi').toBe('solid');
    expect(edge.width).toBeGreaterThanOrEqual(2);
    expect(edge.color).toBe(t['--line-dark']);
  });

  test('varlık panelinin aktarma seçicisi zebra satırında kutusunu koruyor', async ({ page }) => {
    // The sheet's lesson rows took the stripe, and the transfer picker kept the
    // input recess (--paper-sunk) and a hairline edge: on a zebra row, a hair
    // from that recess, the box vanished. In a list a field is paper with a
    // --line edge, like its neighbours in table.list (found by mozaik-70's review).
    await openWithSample(page);
    await page.getByRole('button', { name: 'Program', exact: true }).click();
    await page.locator('table.grid tbody tr').first().locator('.row-head .inspect').click();
    const pick = page.locator('table.sheet-lessons > tbody > tr:nth-child(2) select.transfer-pick');
    await expect(pick).toBeVisible();
    const t = await tokens(page, ['--paper', '--line']);
    const box = await pick.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, edge: s.borderTopColor };
    });
    expect(box.bg, 'aktarma seçicisi kâğıt zeminli').toBe(t['--paper']);
    expect(box.edge, 'aktarma seçicisinin kenarı').toBe(t['--line']);
  });

  test('Branşlar: liste boşken yabancı branşların üstünde grup çizgisi yok', async ({ page }) => {
    // Every subject off the list while teachers still hold them: the first
    // <tbody> is empty, and a group-start rule there would sit right under the
    // heading with no group above it (found by mozaik-70's review). A file
    // with an empty list falls back to the defaults on load, so the state is
    // reached the way a reader reaches it: one unused subject on the list,
    // and then that one removed.
    await openWithSample(page);
    const state = JSON.parse(await savedText(page)) as { settings: { subjects: string[] } };
    state.settings.subjects = ['Hiç kimsenin'];
    await loadWorld(page, state, 'Okul');
    await openSetup(page, 'Branşlar');
    const bodies = page.locator('.cols > div table.list > tbody');
    await bodies
      .nth(0)
      .locator('tr')
      .first()
      .getByRole('button', { name: 'Sil', exact: true })
      .click();
    await answerDialog(page);
    await park(page);
    await expect(bodies).toHaveCount(2);
    await expect(bodies.nth(0).locator('tr')).toHaveCount(0);
    const style = await bodies
      .nth(1)
      .locator('tr')
      .first()
      .locator('td')
      .first()
      .evaluate((td) => getComputedStyle(td).borderTopWidth);
    expect(parseFloat(style), 'boş grubun altında çizgi').toBeLessThan(2);
  });
});
