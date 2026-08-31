// 69. Dersler — its own tab, and a form that keeps the axis you are walking.
//
// This screen was step four of Kurulum until this round. The reader said why
// that was wrong: "Ders ekleme tarafı çok daha pratik hale getirilmeli, neden?
// Çünkü hocaları onu bunu ayarlıyorsun ama DERS EN ÖNEMLİ KISIM." Rooms,
// teachers and classes are filled in once a term; this is the screen that gets
// used, and as a step it could only be reached through a wizard.
//
// Two things are measured here and neither could be measured in jsdom: that the
// form DROPS the axis the ribbon is holding, and that adding a lesson keeps the
// entity you are working through instead of clearing it — which is the exact
// opposite of what the old form did.

import { expect, test } from "./kapan";
import {
  openLessons,
  openSetup,
  openWithSample,
  mainList,
  open,
} from "./helpers";

test.describe("69. Dersler sekmesi", () => {
  test("yedinci sekme, Müsaitlik ile Program arasında", async ({ page }) => {
    await open(page);
    const names = await page
      .locator(".tabstrip .tab")
      .evaluateAll((tabs) => tabs.map((t) => t.getAttribute("aria-label")));
    expect(names).toEqual([
      "Okul",
      "Müsaitlik",
      "Dersler",
      "Program",
      "Kontrol",
      "Çıktı",
      "Ayarlar",
    ]);
  });

  // The shortening the reader asked for by name: "tek bir sınıf için ders
  // eklemeyi çok daha kısa hale ya da pratik hale getirelim."
  test("Sınıftan modunda form sınıf SORMUYOR, şerit hangisi olduğunu söylüyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, "class");

    // The class picker is gone from the form and the teacher one is still there.
    await expect(
      page.locator(".form-row").getByLabel("Sınıf", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.locator(".form-row").getByLabel("Öğretmen", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(".form-row").getByLabel("Branş", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(".form-row .field-label", { hasText: /^Branş$/ }),
      "Sınıftan formunda seçicinin önünde ayrıca Branş yazmamalı",
    ).toHaveCount(0);
    await expect(
      page
        .locator(".form-row")
        .getByLabel("Branş", { exact: true })
        .locator('option[value=""]'),
    ).toHaveText("Tüm branşlar");

    // Which one is open is said in the strip and in the heading, and the list
    // underneath holds only that class's lessons.
    await page.locator(".entity-list .entity", { hasText: "411" }).click();
    await expect(page.locator(".ribbon-value").first()).toContainText("411");
    await expect(
      page.getByRole("heading", { name: /^411 dersleri/ }),
    ).toBeVisible();

    // `data-row-name` ("411 · MÇ") and not a column index: the class cell has
    // a row number and a drag handle in front of it, and a positional selector
    // reads whichever of those happens to be second today.
    const named = await mainList(page)
      .locator("tbody tr")
      .evaluateAll((rows) =>
        rows.map((r) => r.getAttribute("data-row-name") ?? ""),
      );
    expect(named.length).toBeGreaterThan(0);
    expect([...new Set(named.map((x) => x.split("·")[0]!.trim()))]).toEqual([
      "411",
    ]);
  });

  // THE bug this round was asked to fix: "Ders eklenirken en sonki seçilen
  // sınıfa ders eklendikten sonra sınıf seçeneği hatırlansın varsayılana
  // dönülmesin." The old form cleared exactly the field worth keeping, so eight
  // lessons for one class meant choosing that class eight times.
  test("Genel modda Ekle SINIFI koruyor, öğretmeni sıfırlıyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, "all");

    await expect(
      page.locator(".form-row .field-label", { hasText: /^Branş$/ }),
      "Genel formun görünür Branş etiketi korunmalı",
    ).toBeVisible();

    const classPick = page
      .locator(".form-row")
      .getByLabel("Sınıf", { exact: true });
    const teacherPick = page
      .locator(".form-row")
      .getByLabel("Öğretmen", { exact: true });
    await classPick.selectOption({ label: "411" });
    const teacherValue = await teacherPick
      .locator("option")
      .nth(1)
      .getAttribute("value");
    await teacherPick.selectOption(teacherValue!);

    const before = Number(
      await page
        .locator(".ribbon-value")
        .innerText()
        .then((t) => t.split(" ")[0]),
    );
    await page.getByRole("button", { name: "Ekle", exact: true }).click();
    await expect(page.locator(".ribbon-value")).toContainText(
      `${before + 1} ders`,
    );

    // The class is still 411; the teacher is back to "choose one".
    expect(await classPick.inputValue()).not.toBe("");
    await expect(classPick).toHaveValue(
      (await classPick
        .locator("option", { hasText: "411" })
        .getAttribute("value")) ?? "",
    );
    expect(await teacherPick.inputValue()).toBe("");
  });

  test("Öğretmenden modunda ayna: öğretmen kalır, sınıf sıfırlanır", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, "teacher");

    await expect(
      page.locator(".form-row").getByLabel("Öğretmen", { exact: true }),
    ).toHaveCount(0);
    const classPick = page
      .locator(".form-row")
      .getByLabel("Sınıf", { exact: true });
    await classPick.selectOption({ label: "411" });

    const open = await page.locator(".ribbon-value").first().innerText();
    await page.getByRole("button", { name: "Ekle", exact: true }).click();

    // The teacher the strip names has not moved, and the class box has.
    await expect(page.locator(".ribbon-value").first()).toHaveText(open);
    expect(await classPick.inputValue()).toBe("");
  });

  // A CONTROL WITH ONE ANSWER IS NOT A QUESTION.
  //
  // "Öğretmenin tek bir branşı varsa seçme tuşu açılmasın dersler sectionu
  //  öğretmenden seçeneğinde, varsa tabii ki açılsın. Başlıkta branşı da
  //  yazsın."
  //
  // In Öğretmenden the branch pool is already that one teacher's own branches,
  // so for the twenty-three of twenty-five who hold one, the box was a dropdown
  // with a single option: it could not be answered wrongly and it could not be
  // answered differently. Nothing about the lesson changes when it goes —
  // `subjectValue` falls to the pool's first entry either way, and the flag
  // written into the lesson is derived from that.
  test("Öğretmenden: tek branşlı hocada branş kutusu YOK, iki branşlıda VAR", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, "teacher");

    const box = page.locator(".form-row").getByLabel("Branş", { exact: true });
    const open = page.locator(".ribbon-value").first();
    const who = (await open.innerText()).trim();
    await expect(
      box,
      "tek branşlı hocada branş kutusu hâlâ çiziliyor",
    ).toHaveCount(0);

    // ...and the branch is not lost, it moved to the heading — the LIST's one,
    // which is where the counted heading went when adding became its own panel.
    const heading = await page
      .locator(".panel.step-panel h2")
      .first()
      .innerText();
    expect(heading, `başlık branşı söylemiyor: "${heading}"`).toMatch(
      / · .+ dersleri/,
    );

    // Now give that same teacher a second branch and the question becomes real.
    await openSetup(page, "Öğretmenler");
    // By `data-row-name` and not by text: the name lives in an <input>'s value,
    // which `hasText` cannot see.
    const row = mainList(page).locator(`tbody tr[data-row-name="${who}"]`);
    await row.getByRole("button", { name: /ikinci branş ekle/ }).click();
    const second = row.getByLabel(/ikinci branşı/);
    const other = await second.locator("option").nth(1).getAttribute("value");
    await second.selectOption(other!);

    await openLessons(page, "teacher");
    await expect(box, "iki branşlı hocada branş kutusu açılmıyor").toHaveCount(
      1,
    );
    // Both branches are offered, and only that teacher's two.
    await expect(box.locator("option")).toHaveCount(2);
  });

  test("liste facetleri moda göre yalnız anlamlı eksenleri gösteriyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, "all");

    const labels = () =>
      page
        .locator('.list-tools [role="group"]')
        .evaluateAll((groups) =>
          groups.map((group) => group.getAttribute("aria-label")),
        );
    expect(await labels()).toEqual(["Branş", "Öğretmen", "Sınıf"]);

    // Görünmez hale gelecek bir facet'i seç: mod dönüşünde eski seçim listeyi
    // arkadan daraltmamalı.
    const teacher = page.getByRole("group", { name: "Öğretmen" });
    await teacher.locator(".chip").first().click();
    await expect(teacher.locator('.chip[aria-pressed="true"]')).toHaveCount(1);

    await openLessons(page, "teacher");
    expect(await labels()).toEqual(["Branş", "Sınıf"]);
    await openLessons(page, "class");
    expect(await labels()).toEqual(["Branş", "Öğretmen"]);
    await openLessons(page, "all");
    expect(await labels()).toEqual(["Branş", "Öğretmen", "Sınıf"]);
    await expect(
      page
        .getByRole("group", { name: "Öğretmen" })
        .locator('.chip[aria-pressed="true"]'),
    ).toHaveCount(0);
    await expect(mainList(page).locator("tbody tr")).toHaveCount(99);
  });

  test("Enter da ekliyor", async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, "class");

    const teacherPick = page
      .locator(".form-row")
      .getByLabel("Öğretmen", { exact: true });
    const value = await teacherPick
      .locator("option")
      .nth(1)
      .getAttribute("value");
    await teacherPick.selectOption(value!);

    const before = await mainList(page).locator("tbody tr").count();
    await page.locator(".form-row input.num").first().press("Enter");
    await expect(mainList(page).locator("tbody tr")).toHaveCount(before + 1);
  });

  test("mod değişince açık olan varlık sıfırlanıyor", async ({ page }) => {
    await openWithSample(page);
    await openLessons(page, "class");
    await page.locator(".entity-list .entity", { hasText: "411" }).click();
    await expect(page.locator(".ribbon-value").first()).toContainText("411");

    // '411' is a class id; carried into the teacher list it would name nobody.
    await page
      .getByRole("button", { name: "Öğretmenden", exact: true })
      .click();
    const named = await page.locator(".ribbon-value").first().innerText();
    expect(named).not.toContain("411");
    await expect(
      page.locator('.entity-list .entity[aria-current="true"]'),
    ).toHaveCount(1);
  });

  test("Genel modda seçilecek bir şey yok — ama sağ sütun DURUYOR", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, "all");
    // Nothing to pick between: Genel is the whole list.
    await expect(page.locator(".entity-list")).toHaveCount(0);

    // The rail stays, and it stays the same width. It used to vanish here, so
    // switching modes moved the list's right edge by several hundred pixels —
    // on a button whose only job is to change which lessons are listed.
    const rail = page.locator(".cols > aside");
    await expect(rail).toHaveCount(1);
    await expect(rail).toContainText("Ders yükü");
    const wide = (await rail.boundingBox())!.width;

    await page.getByRole("button", { name: "Sınıftan", exact: true }).click();
    await expect(page.locator(".entity-list")).toHaveCount(1);
    expect((await rail.boundingBox())!.width).toBeCloseTo(wide, 0);
  });

  // Rows and hours, and the same two numbers the strip states. One screen
  // reading one number two ways is the drift this program keeps catching.
  test("başlık ders sayısını da saati de söylüyor, şeritle AYNI", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page, "all");
    const heading = await page
      .locator(".panel.step-panel h2")
      .first()
      .innerText();
    expect(heading).toMatch(/^Dersler · \d+ ders · \d+ saat$/);
    const strip = await page
      .locator(".ribbon .ribbon-value")
      .last()
      .innerText();
    expect(heading.replace("Dersler · ", "")).toBe(strip.trim());
  });
});
