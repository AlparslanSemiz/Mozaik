// 49. Search, sort and group chips on the Kurulum lists.
//
// Asked for twice, in the reader's own words: "listeleri kaydırabilelim ya da
// grupça filtreleyebilelim" and "öğretmenler listesinde sıralama ... branşa
// göre, isme göre vesaire".
//
// The ordering and the folding are unit-tested in `src/listview.test.ts`, so
// what is worth an E2E is the wiring: that the controls really drive the table
// under them, that the count tells the truth, and that Turkish text survives
// the round trip through a real input.

import { expect, test } from "../kapan";
import {
  openSetup,
  openLessons,
  openWithSample,
  mainList,
  settledMotion,
} from "../helpers";

const rows = (page: import("@playwright/test").Page) =>
  mainList(page).locator("tbody tr");

test.describe("49. Liste araçları", () => {
  async function checkLoadFacet(
    page: import("@playwright/test").Page,
    total: number,
  ) {
    const group = page.getByRole("group", { name: "Yük durumu" });
    await expect(group).toBeVisible();
    const chips = group.locator(".chip");
    const labels = await chips.evaluateAll((nodes) =>
      nodes.map((node) => node.childNodes[0]?.textContent?.trim() ?? ""),
    );
    const order = ["Boş", "Uygun", "Sıkışık", "İmkânsız"];
    expect(labels).toEqual(
      [...labels].sort((a, b) => order.indexOf(a) - order.indexOf(b)),
    );
    const counts = await group.locator(".chip-count").allInnerTexts();
    expect(counts.reduce((sum, count) => sum + Number(count), 0)).toBe(total);

    for (let i = 0; i < labels.length; i++) {
      await chips.nth(i).click();
      await expect(rows(page)).toHaveCount(Number(counts[i]));
    }
  }

  test("arama tabloyu daraltıyor ve sayaç doğruyu söylüyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    await expect(rows(page)).toHaveCount(25);
    await expect(page.locator(".list-count")).toContainText("25 öğretmen");

    await page.getByLabel("öğretmen ara").fill("matematik");
    await expect(rows(page)).toHaveCount(3);
    await expect(page.locator(".list-count")).toContainText("3 / 25 öğretmen");

    await page.getByRole("button", { name: "Süzmeyi kaldır" }).click();
    await expect(rows(page)).toHaveCount(25);
  });

  test("arama kutusunun tek sınırı dış kabında", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    const input = page.getByLabel("öğretmen ara");
    const style = await input.evaluate((el) => {
      const s = getComputedStyle(el);
      const outer = getComputedStyle(el.closest(".search")!);
      return {
        borders: [
          s.borderTopWidth,
          s.borderRightWidth,
          s.borderBottomWidth,
          s.borderLeftWidth,
        ],
        shadow: s.boxShadow,
        outerBorder: outer.borderTopWidth,
      };
    });
    expect(style.borders).toEqual(["0px", "0px", "0px", "0px"]);
    expect(style.shadow).toBe("none");
    expect(style.outerBorder).toBe("1px");
  });

  test("Türkçe: aksansız yazınca da buluyor, İ ile başlayan adı da", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    const box = page.getByLabel("öğretmen ara");

    // 'İlknur'.toLowerCase() is an `i` plus a COMBINING DOT in the default
    // locale, so this is the search that silently found nothing.
    await box.fill("ilknur");
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first().locator("input").first()).toHaveValue(
      "İlknur Aydın",
    );

    // ...and somebody typing quickly leaves the accents off.
    await box.fill("gokhan");
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first().locator("input").first()).toHaveValue(
      "Gökhan Çetin",
    );
  });

  test("branş çipi süzüyor ve ÖTEKİ çiplerin sayıları duruyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");

    const maths = page.locator(".chip", { hasText: "Matematik" });
    const physics = page.locator(".chip", { hasText: "Fizik" });
    await expect(maths).toContainText("3");
    await maths.click();

    await expect(maths).toHaveAttribute("aria-pressed", "true");
    await expect(rows(page)).toHaveCount(3);
    // The one that would break if the counts were taken after the facet: the
    // row of chips has to stay a way BACK, not a dead end.
    await expect(physics).toContainText("2");

    await maths.click();
    await expect(rows(page)).toHaveCount(25);
  });

  test("öğretmen, sınıf ve derslik yük durumunu aynı kapasite hesabıyla süzüyor", async ({
    page,
  }) => {
    await openWithSample(page);

    // Bir öğretmeni bütünüyle kapatmak örnekteki uygun öğretmenlerin yanına
    // kesin bir “İmkânsız” sınır örneği koyar.
    await page.getByRole("button", { name: "Müsaitlik", exact: true }).click();
    await page
      .getByRole("button", { name: "Tümünü kapat", exact: true })
      .click();
    await openSetup(page, "Öğretmenler");
    await checkLoadFacet(page, await rows(page).count());

    // Yüksüz yeni kayıtlar “Boş” sınıfını görünür yapar. Diğer kayıtların
    // yükü ve sayaçları aynı Kontrol raporundan gelir.
    await openSetup(page, "Derslikler");
    await page.getByPlaceholder("Derslik adı, örn. A").fill("Z boş derslik");
    await page
      .locator(".add-panel")
      .getByRole("button", { name: "Ekle", exact: true })
      .click();
    await checkLoadFacet(page, await rows(page).count());

    await openSetup(page, "Sınıflar");
    await page.getByPlaceholder("Sınıf adı, örn. 510").fill("Z boş sınıf");
    await page
      .locator(".add-panel")
      .getByRole("button", { name: "Ekle", exact: true })
      .click();
    await checkLoadFacet(page, await rows(page).count());
  });

  test("sıralama gerçekten sıralıyor, ve varsayılan GİRİLDİĞİ sıra", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    // NOT `td:nth-child(n)`: the name column has moved twice now (a drag
    // handle went in front of it, a gender box behind it) and each time this
    // line failed with "undefined" rather than with anything about columns.
    // The name box is the one plain text input in the row — the short form
    // carries `.text-sm` and the limits are number boxes.
    const names = () =>
      rows(page).locator('td > input[type="text"]:not(.text-sm)').all();

    const entered = await Promise.all(
      (await names()).map((i) => i.inputValue()),
    );
    expect(entered[0]).toBe("Mehmet Çelik"); // sample order, not alphabetical

    await page.locator("select.sort-pick").selectOption({ label: "Ada göre" });
    const alpha = await Promise.all((await names()).map((i) => i.inputValue()));
    expect(alpha).not.toEqual(entered);
    // Turkish collation, done by the browser: Ç sorts after C, not after Z.
    expect([...alpha].sort((a, b) => a.localeCompare(b, "tr"))).toEqual(alpha);

    const sort = page.locator("select.sort-pick");
    expect(await sort.locator("option").allInnerTexts()).not.toContainEqual(
      expect.stringContaining("→"),
    );
    await sort.selectOption({ label: "Ders yüküne göre" });
    // Counted from the END for the same reason: "Ders saati" is always the
    // cell before the buttons, whatever gets inserted ahead of it.
    const loads = await rows(page)
      .locator("td:nth-last-child(2)")
      .allInnerTexts();
    const numbers = loads.map((t) => Number(t.trim()));
    expect([...numbers].sort((a, b) => b - a)).toEqual(numbers);
  });

  test("dersler listesi de aranıyor — 99 satırın olduğu tek yer", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page);
    await expect(rows(page)).toHaveCount(99);

    // The teacher's SHORT form is what the grid says, so it is what gets
    // remembered and therefore what gets typed.
    await page.getByLabel("ders ara").fill("MÇ");
    const found = await rows(page).count();
    expect(found).toBeGreaterThan(0);
    expect(found).toBeLessThan(99);
    await expect(rows(page).first()).toContainText("MÇ");
  });

  test("hiçbir şey bulunamayınca söylüyor, boş tablo bırakmıyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Sınıflar");
    await page.getByLabel("sınıf ara").fill("böyle bir sınıf yok");
    await expect(rows(page)).toHaveCount(0);
    await expect(
      page.locator(".hint", { hasText: "Bu aramaya uyan sınıf yok" }),
    ).toBeVisible();
  });
});

// "Sıralamada aşağı yukarı işareti düzgün olsun."
//
// The arrow used to show the OTHER direction — a list running Z→A drew an
// ascending arrow — on the reasoning that a button's name says what pressing it
// will do. True of the name; backwards for the picture, because the picture is
// the only thing on screen that claims to describe the rows underneath it.
test.describe("84. Sıralama yönü işareti", () => {
  const dirButton = (page: import("@playwright/test").Page) =>
    page.getByRole("button", { name: /sıralı\. /i });

  test("ok ŞU ANKİ yönü gösteriyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");

    // Nothing to reverse until a sort is chosen, so there is nothing to see:
    // it used to be a drawn-but-disabled white box past the end of the sort
    // menu, which is the "saçma sapan çizgi" the reader reported.
    await expect(dirButton(page)).toBeHidden();
    await page.locator("select.sort-pick").first().selectOption({ index: 1 });

    const button = dirButton(page);
    await expect(button).toBeEnabled();
    await expect(button).toHaveAccessibleName(/^artan sıralı/i);
    const up = await button.locator("svg").getAttribute("class");

    await button.click();
    await expect(button).toHaveAccessibleName(/^azalan sıralı/i);
    const down = await button.locator("svg").getAttribute("class");

    // Two different icons, and each one names its own direction.
    expect(up).not.toBe(down);
    expect(up).toContain("arrow-up");
    expect(down).toContain("arrow-down");
  });

  // The other half of hiding it, and the half that decides HOW it is hidden.
  //
  // Not rendering the button at all was measured first and rejected: the strip
  // is 37.5px tall with it and 31px without, so choosing a sort would move
  // every row of the table underneath by 6.5px. That is the same complaint
  // this project already answered once about the ribbon (pitfall 94), and the
  // answer is the same — a state's mark must not be a measure.
  //
  // `visibility: hidden` keeps the box, so the two states are the same height
  // by construction rather than by a number anybody re-derives.
  test("yön düğmesi gizliyken de yerini tutuyor: şerit KIPIRDAMIYOR", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");

    const strip = page.locator(".list-tools-row").first();
    const select = page.locator("select.sort-pick").first();
    await expect(strip).toBeVisible();
    // The panel fades in from `translateY(var(--slide))`, so a rect read before
    // that lands is a rect off the rail by a couple of pixels — measured here
    // as a 1.54px "move" that was the fade, not the button (pitfall 59).
    await settledMotion(page);
    const stripBefore = (await strip.boundingBox())!;
    const selectBefore = (await select.boundingBox())!;

    await select.selectOption({ index: 1 });
    await expect(dirButton(page)).toBeVisible();

    const stripAfter = (await strip.boundingBox())!;
    const selectAfter = (await select.boundingBox())!;
    // Measured: 37.5px in both states. Without the reserved box it is 37.5 and
    // 31.0, i.e. every row of the table below would step 6.5px.
    expect(stripAfter.height).toBeCloseTo(stripBefore.height, 1);
    // ...and the menu it sits beside does not move either, which is the claim
    // the old "disabled, not hidden" note made and got backwards: the button
    // is AFTER the menu and `.spacer` absorbs its width.
    expect(selectAfter.x).toBeCloseTo(selectBefore.x, 1);
    expect(selectAfter.y).toBeCloseTo(selectBefore.y, 1);

    // What DOES move here is the table, by a measured 26px (438.8 -> 464.8),
    // and that is a different thing on purpose: choosing a sort switches the
    // drag handles off, and `.list-note` says so. Reserving a line for it was
    // tried and removed once already — empty almost always, and most of the
    // 44px that used to sit between the strip and the table.
    await expect(page.locator(".list-tools .list-note")).toBeVisible();
  });

  // The arrow keys move a row, and they were only ever named in the accessible
  // name — so a reader who can see the handle was never told.
  test("tutamak ok tuşlarını da SÖYLÜYOR", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    await expect(mainList(page).locator(".row-grip").first()).toHaveAttribute(
      "title",
      /ok tuşlar/,
    );
  });
});
