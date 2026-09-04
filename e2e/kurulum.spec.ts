// The Kurulum tab: four countable steps, the paste box, and the subject list
// they feed.

import { type Locator, type Page } from "@playwright/test";
import { expect, test } from "./kapan";
import {
  reopen,
  open,
  openWithSample,
  openSetup,
  openLessons,
  openSettings,
  addSubjects,
  dragAndDrop,
  mainList,
  answerDialog,
  chooseScale,
} from "./helpers";

test.describe("5. Kurulum ve yedek", () => {
  test("Excel yapıştırma önizleme gösterip ekliyor", async ({ page }) => {
    await open(page);
    await openSetup(page, "Öğretmenler");
    await page.getByRole("button", { name: "Excel'den yapıştır" }).click();

    await page
      .locator("textarea")
      .fill("Ali Vural\tAV\tMatematik\nDeniz Ak\tDA\tFizik");
    await page.getByRole("button", { name: "Önizle" }).click();
    await expect(page.getByText("2 satır okundu.")).toBeVisible();

    await page.getByRole("button", { name: /2 satırı ekle/ }).click();
    await expect(
      page.locator(".step", { hasText: "Öğretmenler" }),
    ).toContainText("2");
  });

  test("Kurulum adımlar hâlinde: sayaçlar doğru, geçiş serbest", async ({
    page,
  }) => {
    await open(page);
    // An empty step is dimmed — that is the whole point of the counter
    await expect(
      page.locator(".step", { hasText: "Derslikler" }),
    ).toHaveAttribute("data-empty", "true");

    await page.getByRole("button", { name: /Örnek veriyle doldur/ }).click();
    await answerDialog(page);

    await expect(
      page.locator(".step", { hasText: "Derslikler" }),
    ).toContainText("8");
    await expect(
      page.locator(".step", { hasText: "Öğretmenler" }),
    ).toContainText("25");
    await expect(page.locator(".step", { hasText: "Sınıflar" })).toContainText(
      "20",
    );

    // FOUR steps: Dersler left for a tab of its own, and Branşlar came IN from
    // Ayarlar — the list a teacher picks from belongs beside the teacher.
    await expect(page.locator(".ribbon .step")).toHaveCount(4);
    await expect(
      page.getByRole("heading", { name: "Zil ve günler" }),
    ).toHaveCount(0);

    // Only the current step is on screen; the 1132-line scroll is gone
    await expect(
      page.getByRole("heading", { name: /^Derslikler/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^Öğretmenler/ }),
    ).toHaveCount(0);

    await openSetup(page, "Öğretmenler");
    await expect(
      page.getByRole("heading", { name: /^Öğretmenler/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^Derslikler/ }),
    ).toHaveCount(0);

    // Not a locked wizard: jumping straight to the last step works.
    await openSetup(page, "Sınıflar");
    await expect(page.locator('.step[aria-pressed="true"]')).toContainText(
      "Sınıflar",
    );

    // The strip is the ONLY way between steps now. "Kurulum durumu" used to be
    // a second one, and it repeated the four counters three pixels below the
    // ones that are already in the strip.
    await expect(
      page.locator(".panel", { hasText: "Kurulum durumu" }),
    ).toHaveCount(0);
  });

  test("kısaltma addan üretiliyor, çakışma uyarısı çıkıyor", async ({
    page,
  }) => {
    await open(page);
    await addSubjects(page, "Matematik", "Fizik");
    await openSetup(page, "Öğretmenler");

    const name = page.getByPlaceholder("Ad Soyad");
    const short = page.getByLabel("Kısaltma");
    const branch = page.getByLabel("Branş", { exact: true });

    // The placeholder shows what will be derived, live
    await name.fill("Ahmet Sarı");
    await expect(short).toHaveAttribute("placeholder", "AS");
    await branch.selectOption("Matematik");
    await page.getByRole("button", { name: "Ekle", exact: true }).click();

    // "Ayşe Solmaz" derives AS as well — in a real 25-person list this happens
    await name.fill("Ayşe Solmaz");
    await expect(short).toHaveAttribute("placeholder", "AS");
    await branch.selectOption("Fizik");
    await page.getByRole("button", { name: "Ekle", exact: true }).click();

    const warning = page.locator(".warn-box", { hasText: "Aynı kısaltma" });
    await expect(warning).toBeVisible();
    await expect(warning).toContainText("Ahmet Sarı, Ayşe Solmaz");

    // Fixing one of them clears the warning
    const secondShort = page
      .locator("table.list tbody tr")
      .nth(1)
      .locator("input")
      .nth(1);
    await secondShort.fill("AYS");
    await secondShort.blur();
    await expect(
      page.locator(".warn-box", { hasText: "Aynı kısaltma" }),
    ).toHaveCount(0);
  });

  test("silmeden önce her zaman soruyor ve ne gideceğini sayıyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Derslikler");

    // Deleting a room used to ask NOTHING at all
    const rows = mainList(page).locator("tbody tr");
    const before = await rows.count();
    await rows.first().getByRole("button", { name: "Sil" }).click();
    // Cancelled -> nothing may change, and the sentence has to have COUNTED.
    const asked = await answerDialog(page, "cancel");
    expect(asked).toContain("dersliği silinecek");
    expect(asked).toContain("sınıfın dersliği boşalacak");
    expect(asked).toContain("çakışması artık kontrol edilmeyecek");
    await expect(rows).toHaveCount(before);

    // Confirmed, it goes
    await rows.first().getByRole("button", { name: "Sil" }).click();
    await answerDialog(page);
    await expect(rows).toHaveCount(before - 1);
  });
});

test.describe("12. Branş kısaltmaları", () => {
  test("kısaltma hücrede DE satır başında DA, ve ikisi aynı", async ({
    page,
  }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    await page.getByRole("button", { name: "Sınıf görünümü" }).click();

    // "Matematik" does not fit a 34px cell; the short form does.
    const card = page.locator("table.grid .card").first();
    const teacher = (await card.locator(".card-top").textContent())!.trim();
    const subject = (await card.locator(".card-bottom").textContent())!.trim();
    expect(subject.length).toBeLessThanOrEqual(4);

    // And the row head says the SAME thing, which until 2026-08-29 it did not:
    // it carried the full name and cut it off with an ellipsis, so one grid
    // spoke two vocabularies about one subject. Asked for in one line:
    // "program kısmında branşlar kısaltmalar olsun sol tarafta".
    await page.getByRole("button", { name: "Öğretmen görünümü" }).click();
    const head = page
      .locator("tbody tr", {
        has: page.locator(".row-head .inspect", {
          hasText: new RegExp(`^${teacher}$`),
        }),
      })
      .locator(".row-head .secondary");
    await expect(head).toContainText(subject);
  });

  test("Branşlar adımından değiştirilince ızgara ve baskı birlikte değişiyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await dragAndDrop(page);
    await page.getByRole("button", { name: "Sınıf görünümü" }).click();
    const before = (await page
      .locator("table.grid .card-bottom")
      .first()
      .textContent())!;

    await openSetup(page, "Branşlar");
    // The row is found by its NAME attribute, not by its text: since the name
    // became editable it lives in an input's value, and a row's text no longer
    // contains it. The short-form box is asked for by its own label, because
    // the row now holds two text inputs.
    const target = page.locator(`table.list tr[data-row-name]`, {
      has: page.locator(`input.text-sm[value="${before}"]`),
    });
    await expect(target).toHaveCount(1);
    const input = target.getByRole("textbox", { name: /kısaltması$/ });
    // The box comes FILLED with the default, not with a faint placeholder
    await expect(input).toHaveValue(before);

    await input.fill("Zzz");
    await input.blur();

    await page.getByRole("button", { name: "Program", exact: true }).click();
    await page.getByRole("button", { name: "Sınıf görünümü" }).click();
    await expect(page.locator("table.grid .card-bottom").first()).toHaveText(
      "Zzz",
    );

    // ...and the printed page uses the same short form
    await page.getByRole("button", { name: "Çıktı", exact: true }).click();
    await expect(page.locator(".print-area")).toContainText("Zzz");
  });

  test("varsayılana geri yazılınca override kayboluyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Branşlar");

    const row = page.locator("table.list tr[data-row-name]").first();
    // The SHORT form box by its own label: the row carries two text inputs
    // since the name became editable.
    const input = row.getByRole("textbox", { name: /kısaltması$/ });
    const original = (await input.inputValue())!;

    // The built-in short is a COLUMN now, not a sentence repeated on every
    // row: the word "varsayılan" is the heading and the cell holds the value
    // alone, or the empty-cell dash where the box already carries it.
    const note = row.locator("td.hint");
    await input.fill("Zzz");
    await input.blur();
    await expect(note).toHaveText(original);
    await expect(
      page.getByRole("columnheader", { name: "Varsayılan" }),
    ).toBeVisible();

    await input.fill(original);
    await input.blur();
    await expect(note).toHaveText("–");
    await expect(row).not.toContainText("varsayılan");
  });
});

// ---------------------------------------------------------------------------
// 16. Branş: yazılmaz, seçilir
//
// Free text let "Matemtik" become a second subject that still abbreviated to
// "Mat", so on paper the two were indistinguishable and nothing warned about
// it. The branch is now picked from the school's own list.

test.describe("16. Branş seçimi", () => {
  test("öğretmenin branşı açılır listeden seçiliyor, metin kutusu yok", async ({
    page,
  }) => {
    await open(page);
    await addSubjects(page, "Matematik");
    await openSetup(page, "Öğretmenler");

    const branch = page.getByLabel("Branş", { exact: true });
    await expect(branch).toHaveJSProperty("tagName", "SELECT");
    await expect(page.getByPlaceholder("Branş")).toHaveCount(0);

    // Branch is required: half a teacher record is not worth storing
    await page.getByPlaceholder("Ad Soyad").fill("Mehmet Çelik");
    await expect(
      page.getByRole("button", { name: "Ekle", exact: true }),
    ).toBeDisabled();

    await branch.selectOption("Matematik");
    await page.getByRole("button", { name: "Ekle", exact: true }).click();
    await expect(mainList(page).locator("tbody tr")).toHaveCount(1);
    await expect(page.getByLabel("MÇ branşı")).toHaveValue("Matematik");
  });

  test("“+ Yeni branş” hem öğretmene atanıyor hem listeye giriyor", async ({
    page,
  }) => {
    await open(page);
    await openSetup(page, "Öğretmenler");

    await page.getByPlaceholder("Ad Soyad").fill("Ayşe Yıldız");
    await page
      .getByLabel("Branş", { exact: true })
      .selectOption({ label: "+ Yeni branş…" });
    await page.getByLabel("Yeni branşın adı").fill("Robotik");
    await page.getByRole("button", { name: "Ekle", exact: true }).click();

    await expect(page.getByLabel("AY branşı")).toHaveValue("Robotik");

    // ...and it is in the school's list from now on, with a short form
    await openSetup(page, "Branşlar");
    const row = page.locator(`table.list tr[data-row-name="Robotik"]`);
    await expect(row).toHaveCount(1);
    await expect(row.getByRole("textbox", { name: /kısaltması$/ })).toHaveValue(
      "Rob",
    );
  });

  test("kullanılan branş silinemiyor ve kimin kullandığı yazıyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Branşlar");

    await page
      .locator(`table.list tr[data-row-name="Matematik"]`)
      .getByRole("button", { name: "Sil" })
      .click();

    const said = await answerDialog(page);
    expect(said).toContain("öğretmen bu branşta");
    expect(said).toContain("Önce onların branşını değiştirin");
    await expect(
      page.locator(`table.list tr[data-row-name="Matematik"]`),
    ).toHaveCount(1);
  });

  test("kullanılmayan branş listeden çıkarılıyor ve açılır listede kalmıyor", async ({
    page,
  }) => {
    await open(page);
    // Put them on the list first — through the offer panel, which is what a
    // new project's Branşlar step actually looks like.
    await addSubjects(page, "Matematik", "Fransızca");

    await page
      .locator(`table.list tr[data-row-name="Fransızca"]`)
      .getByRole("button", { name: "Sil" })
      .click();
    await answerDialog(page);
    await expect(
      page.locator(`table.list tr[data-row-name="Fransızca"]`),
    ).toHaveCount(0);

    await openSetup(page, "Öğretmenler");
    // By VALUE: an option reads "Mat · Matematik" now, and what this test asks
    // is which subjects the dropdown still OFFERS.
    const options = await page
      .getByLabel("Branş", { exact: true })
      .locator("option")
      .evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
    expect(options).not.toContain("Fransızca");
    expect(options).toContain("Matematik");
  });

  test("yapıştırılan listedeki yeni branş okul listesine giriyor", async ({
    page,
  }) => {
    await open(page);
    await openSetup(page, "Öğretmenler");

    await page.getByRole("button", { name: "Excel'den yapıştır" }).click();
    await page
      .locator("textarea")
      .fill("Kerem Aslan\tKA\tRobotik\nSelin Demir\tSD\tAstronomi");
    await page.getByRole("button", { name: "Önizle" }).click();
    await page.getByRole("button", { name: /2 satırı ekle/ }).click();

    await expect(page.getByLabel("KA branşı")).toHaveValue("Robotik");
    await openSetup(page, "Branşlar");
    await expect(
      page.locator(`table.list tr[data-row-name="Robotik"]`),
    ).toHaveCount(1);
    await expect(
      page.locator(`table.list tr[data-row-name="Astronomi"]`),
    ).toHaveCount(1);
  });
});

// ---------------------------------------------------------------------------
// The editing paths. Adding and deleting were covered; CHANGING something was
// not — and every box here is `defaultValue` + `onBlur`, a deliberate choice
// (pitfall 3) whose wiring nothing was checking.

test.describe("30. Kurulum — düzenleme", () => {
  test("derslik adı değiştirilebiliyor ve sınıflarda görünüyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Derslikler");

    const first = page.locator("table.list tbody tr").first();
    await first.locator("input").fill("Z");
    await first.locator("input").blur();
    await expect(first.locator("input")).toHaveValue("Z");

    await openSetup(page, "Sınıflar");
    await expect(page.getByLabel("410 dersliği")).toContainText("Z");
  });

  test("öğretmenin adı, kısaltması ve branşı değiştirilebiliyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    const row = page.locator("table.list tbody tr").first();

    await row.locator("input[type=text]").first().fill("Yeni Ad");
    await row.locator("input[type=text]").first().blur();
    await row.locator("input[type=text]").nth(1).fill("YA");
    await row.locator("input[type=text]").nth(1).blur();
    // The label follows the short form, which the line above just changed.
    await row.getByLabel("YA branşı").selectOption("Fizik");

    await page.getByRole("button", { name: "Program", exact: true }).click();
    // "Fzk", not "Fizik": the row head reads the subject SHORT, the same string
    // the cells of its own row carry.
    await expect(page.getByRole("rowheader", { name: "YA Fzk" })).toBeVisible();
  });

  test("öğretmen sınırı: boş kutu okul varsayılanını kullanıyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSettings(page, "Kurallar");
    const rule = page.locator("table.list tr", {
      hasText: "Öğretmen art arda en fazla",
    });
    await rule.locator("input[type=number]").fill("3");
    await rule.locator("input[type=number]").blur();

    await openSetup(page, "Öğretmenler");
    // Row 1, not row 0: the sample gives every third teacher a limit of their
    // own, and an overridden box would not show the default at all.
    const box = page
      .locator("table.list tbody tr")
      .nth(1)
      .locator("input[type=number]")
      .first();
    // Empty means "use the school default", and the default is shown as the
    // placeholder so an empty box still says what it will do.
    await expect(box).toHaveValue("");
    await expect(box).toHaveAttribute("placeholder", "3");

    await box.fill("1");
    await box.blur();
    await expect(box).toHaveValue("1");

    await box.fill("");
    await box.blur();
    await expect(box).toHaveValue("");
    await expect(box).toHaveAttribute("placeholder", "3");
  });

  test("sınıfın adı ve dersliği değiştirilebiliyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Sınıflar");
    const row = page.locator("table.list tbody tr").first();

    await row.locator("input[type=text]").fill("999");
    await row.locator("input[type=text]").blur();
    await page.getByLabel("999 dersliği").selectOption({ label: "B" });

    await page.getByRole("button", { name: "Program", exact: true }).click();
    await page.getByRole("button", { name: "Sınıf görünümü" }).click();
    await expect(
      page.locator("tbody .row-head", { hasText: "999" }),
    ).toContainText("B dersliği");
  });

  test("dersin haftalık saati ve blok boyu değiştirilebiliyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page);
    const row = page.locator("table.list tbody tr").first();
    const hours = row.locator("input[type=number].num").first();

    await hours.fill("6");
    await hours.blur();
    const split = row.locator(".split-pick");
    await split.click();
    await page
      .locator(".split-popover:visible")
      .getByRole("option", { name: "2+2+2", exact: true })
      .click();

    await expect(hours).toHaveValue("6");
    await expect(split).toHaveText("2+2+2");

    // The pool counter reads off the same numbers.
    await page.getByRole("button", { name: "Program", exact: true }).click();
    await expect(page.locator(".pool-card .counter").first()).toContainText(
      "/",
    );
  });

  test("boş adla ekleme yapılamıyor", async ({ page }) => {
    await open(page);
    await openSetup(page, "Derslikler");
    const add = page.getByRole("button", { name: "Ekle", exact: true });
    await expect(add).toBeDisabled();

    await page.getByPlaceholder("Derslik adı, örn. A").fill("   ");
    await expect(add).toBeDisabled();
  });

  test("Enter ile ekleniyor", async ({ page }) => {
    await open(page);
    await openSetup(page, "Derslikler");
    await page.getByPlaceholder("Derslik adı, örn. A").fill("Q");
    await page.getByPlaceholder("Derslik adı, örn. A").press("Enter");
    await expect(mainList(page).locator("tbody tr")).toHaveCount(1);
  });

  test("yerleşimi olan dersi silmek ne kaybedileceğini sayıyor", async ({
    page,
  }) => {
    await openWithSample(page);
    const { dragAndDrop } = await import("./helpers");
    await dragAndDrop(page);

    await openLessons(page);
    await mainList(page)
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "Sil" })
      .click();
    expect(await answerDialog(page, "cancel")).toContain("silinecek");
  });
});

test.describe("31. Kurulum — sağ sütun", () => {
  test("derslik adımında derslik yükü ve hangi sınıflar yazıyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Derslikler");

    const side = page.locator(".cols aside");
    await expect(side).toContainText("Derslik yükü");
    await expect(side).toContainText("Hangi sınıflar");
    await expect(side.locator("table.stat tbody tr")).toHaveCount(8);
  });

  test("öğretmen adımında yük ve branş dağılımı yazıyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");

    const side = page.locator(".cols aside");
    await expect(side).toContainText("Öğretmen yükü");
    await expect(side).toContainText("Branşlar");
    await expect(side.locator("table.stat tbody tr")).toHaveCount(25);
  });

  test("dersliksiz sınıf sağ sütunda uyarı çıkarıyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Sınıflar");
    await page
      .getByLabel("410 dersliği")
      .selectOption({ label: "Derslik yok" });

    await openSetup(page, "Derslikler");
    await expect(page.locator(".cols aside .warn-box")).toContainText(
      "dersliği yok",
    );
  });

  // This sentence outlived the panel it used to live in. It is the only warning
  // that a class was created and then forgotten, and nobody would go looking
  // for it — so when "Kurulum durumu" was deleted it moved into Özet rather
  // than going with it.
  test("dersi olmayan sınıf Özet’te sayılıyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Sınıflar");
    await page.getByPlaceholder(/Sınıf adı/).fill("700");
    await page.getByRole("button", { name: "Ekle", exact: true }).click();

    await expect(page.locator(".cols aside .warn-box")).toContainText(
      "1 sınıfın hiç dersi yok",
    );
    // ...and so did the one number that decides whether the week fits at all.
    await expect(page.locator(".cols aside")).toContainText("Sınıf başına");
  });

  // "Özetteki hatalar özetin en üstüne gelsin. Hata gidince yok olsun."
  //
  // Both boxes above used to be written AFTER the capacity table and after the
  // list under it — i.e. below the fold on the one panel whose job is to say
  // something is missing. Position, not existence, is what this measures, so it
  // asks the DOM which came first rather than reading the sentence again.
  test("uyarı kapasite tablosunun ÜSTÜNDE, ve sorun gidince kayboluyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Sınıflar");
    await page.getByPlaceholder(/Sınıf adı/).fill("700");
    await page.getByRole("button", { name: "Ekle", exact: true }).click();

    const panel = page.locator(".cols > aside > .panel");
    const order = await panel.evaluate((el) => {
      const kids = [...el.children];
      return {
        warn: kids.findIndex((c) => c.classList.contains("warn-box")),
        table: kids.findIndex((c) => c.querySelector("table.stat") !== null),
      };
    });
    expect(order.warn, "uyarı kutusu yok").toBeGreaterThan(-1);
    expect(order.table, "kapasite tablosu yok").toBeGreaterThan(-1);
    expect(order.warn, "uyarı tablonun altında kalmış").toBeLessThan(
      order.table,
    );

    // Give it a lesson and the warning is simply not drawn any more — no empty
    // heading, no gap where it used to be.
    await openLessons(page, "class");
    await expect(panel.locator(".warn-box")).toHaveCount(0);
  });

  // The rows that are wrong come first inside the table too. `problemsFirst` was
  // written for Kontrol and never passed here, so an "İmkânsız" teacher sat
  // wherever the list happened to put them.
  test("kapasite tablosunda sorunlu satır EN ÜSTTE", async ({ page }) => {
    await openWithSample(page);
    // The LAST teacher in the list, closed for the whole week: capacity 0
    // against whatever they carry, so the row cannot be anything but
    // "İmkânsız". The last one on purpose — closing the first would put the
    // problem at the top whether anything sorted or not, and a test that passes
    // with the sort removed is measuring nothing (pitfall 23).
    await page.getByRole("button", { name: "Müsaitlik", exact: true }).click();
    await page.locator(".entity").last().click();
    const label = (
      await page
        .locator('.entity[aria-current="true"] .entity-name')
        .innerText()
    ).trim();
    // "CA · Cem Aslan (Mat)" on the availability row; the summary carries the
    // plain name. Split rather than strip — no regex to get subtly wrong.
    const who = label.split(" · ")[1]!.split(" (")[0]!;
    await page
      .getByRole("button", { name: "Tümünü kapat", exact: true })
      .click();

    await openSetup(page, "Öğretmenler");
    const first = page.locator(".cols > aside table.stat tbody tr").first();
    await expect(first, "sorunlu satır listenin sonunda kalmış").toContainText(
      who,
    );
    await expect(first.locator(".badge")).toHaveText("İmkânsız");
  });
});

// THE SHAPE OF A PANEL, asked for by name: "başlık, açıklama, ekleme ve
// sonrasında liste. bu mantığı her yer için uygula."
//
// Four steps that hold the same kind of thing should not be laid out three
// different ways. Before this, `Sınıflar` was the only one of the four with no
// description at all, `Okul ve günler` was the only panel in the app that put
// its form ABOVE its explanation, and `Planlar` was the only "list + add" that
// put the form BELOW the list.
//
// This measures ORDER, not geometry: it is a rule about what a reader meets
// first, and it survives any amount of restyling. The layout measurements
// deleted in the D round were the other kind.
//
// THE SHAPE NOW SPANS TWO PANELS. "Listelerde ekleme kısmı ayrı blok olsun.
// aynı özetin ayrı blok olduğu gibi, yani sadece çizgi olmasın." — the order a
// reader meets things in did not change, so neither did this test's point; what
// it has to say now is that the two halves are two BOXES. That the second one
// is separate is the request itself, so it is asserted rather than assumed.
test.describe("44. Panel simetrisi", () => {
  /** The tag/class sequence one panel actually renders, top to bottom. */
  async function shapeOf(page: Page, panel: string) {
    return page
      .locator(panel)
      .first()
      .evaluate((el) =>
        [...el.children]
          .map((c) => {
            if (c.tagName === "H2") return "baslik";
            // The heading grew a button beside it ("Excel'den yapıştır" moved out
            // of the form row), so it is wrapped. It is still the heading, and it
            // is still first — which is the only thing this test is about.
            if (c.classList.contains("panel-head")) return "baslik";
            // The paste box opens BELOW the form now instead of inside it. It is
            // not part of the shape: it is closed on every one of these screens.
            if (c.classList.contains("panel") && c.classList.contains("inset"))
              return "";
            if (c.tagName === "P" && c.classList.contains("hint"))
              return "aciklama";
            if (c.classList.contains("warn-box")) return "uyari";
            if (c.classList.contains("form-row")) return "ekleme";
            // The add block is a GRID now (`AddPanel.tsx`), so each of its three
            // parts is wrapped in a track of its own — that is what gives the
            // five screens one geometry, and it is also what let this test start
            // reading the whole block as nothing but a heading.
            if (c.classList.contains("add-panel-description"))
              return "aciklama";
            if (c.classList.contains("add-panel-notice")) return "uyari";
            if (c.classList.contains("add-panel-body")) return "ekleme";
            // The list lives in a scroll box now (eleven columns do not fit a
            // 100%-wide table at 150%), so "the list" is either shape.
            if (c.tagName === "TABLE") return "liste";
            if (c.classList.contains("table-scroll")) return "liste";
            return "";
          })
          .filter(Boolean),
      );
  }

  test("beş yeni-ekleme panelinin başlık, açıklama ve form rayları eşit", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openWithSample(page);
    const screens = [
      "Derslikler",
      "Branşlar",
      "Öğretmenler",
      "Sınıflar",
      "Dersler",
    ];
    const measured: Array<{
      name: string;
      height: number;
      head: number;
      desc: number;
      body: number;
    }> = [];
    for (const name of screens) {
      if (name === "Dersler") await openLessons(page);
      else await openSetup(page, name);
      const value = await page
        .locator(".add-panel")
        .first()
        .evaluate((panel) => {
          const p = panel.getBoundingClientRect();
          const rel = (selector: string) =>
            Math.round(
              panel.querySelector(selector)!.getBoundingClientRect().top -
                p.top,
            );
          return {
            height: Math.round(p.height),
            head: rel(".add-panel-head"),
            desc: rel(".add-panel-description"),
            body: rel(".add-panel-body"),
          };
        });
      measured.push({ name, ...value });
      await expect(page.locator(".add-panel-notice")).toHaveCount(0);
    }
    const reference = measured[0]!;
    for (const panel of measured.slice(1)) {
      expect(panel, panel.name).toEqual({
        name: panel.name,
        ...{
          height: reference.height,
          head: reference.head,
          desc: reference.desc,
          body: reference.body,
        },
      });
    }
  });

  // Dersler is in the list because it is the SAME kind of panel, even though it
  // is a tab of its own now: the shape is a rule about what a reader meets
  // first, and it does not stop applying when a screen changes address.
  for (const step of ["Derslikler", "Öğretmenler", "Sınıflar", "Dersler"]) {
    test(`${step}: başlık, açıklama, ekleme, liste`, async ({ page }) => {
      await openWithSample(page);
      if (step === "Dersler") await openLessons(page);
      else await openSetup(page, step);
      // Two boxes, in this order, and the add one is FIRST: "ama yerleri
      // değişmesin".
      const panels = page.locator(".cols > div > .panel");
      await expect(
        panels,
        `${step}: ekleme ve liste iki ayrı blok değil`,
      ).toHaveCount(2);
      await expect(panels.nth(0)).toHaveClass(/add-panel/);
      await expect(panels.nth(1)).toHaveClass(/step-panel/);

      const add = await shapeOf(page, ".panel.add-panel");
      const list = await shapeOf(page, ".panel.step-panel");

      // The add block names the work, explains it, then asks for it. Warnings
      // are dropped rather than placed: Dersler grows one between the two when
      // there is nothing to add a lesson TO, and where it appears is that
      // screen's business, not this rule's.
      expect(
        add.filter((x) => x !== "uyari"),
        `${step} ekleme bloğu`,
      ).toEqual(["baslik", "aciklama", "ekleme"]);
      // The list block names what it holds. What follows (search strip, "no
      // match" line, the table) is the list, and only its ORDER is fixed.
      expect(list[0], `${step} liste bloğu başlıkla açmıyor`).toBe("baslik");
      expect(
        list.indexOf("liste"),
        `${step}: listede tablo yok`,
      ).toBeGreaterThan(0);
    });
  }

  test("Ayarlar → Zil ve günler: açıklama formdan ÖNCE", async ({ page }) => {
    await openWithSample(page);
    await openSettings(page, "Zil ve günler");
    const shape = await shapeOf(page, ".cols > div > .panel");
    expect(shape.slice(0, 3)).toEqual(["baslik", "aciklama", "ekleme"]);
  });

  test("Ayarlar → Planlar: yeni plan formu listenin ÜSTÜNDE", async ({
    page,
  }) => {
    await openWithSample(page);
    // Its own section since 2026-08-28; the panel and its shape did not move.
    await openSettings(page, "Planlar ve yedek");
    const plans = page.locator(".panel", { hasText: "Yeni plan" }).first();
    const order = await plans.evaluate((el) => {
      const kids = [...el.children];
      return {
        form: kids.findIndex((c) => c.classList.contains("form-row")),
        table: kids.findIndex((c) => c.tagName === "TABLE"),
      };
    });
    expect(order.form).toBeGreaterThan(-1);
    expect(order.table).toBeGreaterThan(-1);
    expect(order.form, "ekleme formu listenin altında kalmış").toBeLessThan(
      order.table,
    );
  });
});

// 63. Gender on a teacher.
//
// Asked for in one line: "Öğretmende cinsiyet". Stored as `gender: '' | 'k' |
// 'e'` and bumped the schema to 6 — the migration itself is unit-tested in
// `src/parseState.test.ts`, so what belongs here is the round trip through a real
// control and the two places the reader was promised it would be useful:
// the sort menu and the chip row.
//
// It deliberately does NOT reach the paper. Nobody asked for a form of address
// on a timetable, and a printed sheet is the last place to guess at one.
test.describe("63. Öğretmende cinsiyet", () => {
  const row = (page: Page, n: number) =>
    mainList(page).locator("tbody tr").nth(n);

  test("seçilen cinsiyet YENİLEMEDEN sonra da duruyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");

    // Mehmet Çelik ships as "Erkek"; İlknur Aydın as "Kadın".
    const first = row(page, 0).locator("select").nth(1);
    await expect(first).toHaveValue("e");

    await first.selectOption("k");
    await reopen(page);
    await openSetup(page, "Öğretmenler");
    await expect(row(page, 0).locator("select").nth(1)).toHaveValue("k");
  });

  test("belirtilmemiş de bir DEĞER — boş bırakılabiliyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    const box = row(page, 0).locator("select").nth(1);
    await box.selectOption("");
    await expect(box).toHaveValue("");

    // And it is not only reachable, it is SHIPPED: "Deniz" is genuinely both,
    // so the sample carries the blank the real staff list will carry.
    await page.getByLabel("öğretmen ara").fill("Deniz Erdem");
    await expect(mainList(page).locator("tbody tr")).toHaveCount(1);
    await expect(
      row(page, 0).locator('select[aria-label*="cinsiyeti"]'),
    ).toHaveValue("");
  });

  test("çip satırı süzüyor — Branş’ın YANINDA, yerine değil", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    const rows = mainList(page).locator("tbody tr");
    await expect(rows).toHaveCount(25);

    const women = page.getByRole("button", { name: /^Kadın/ });
    await expect(women).toBeVisible();
    await women.click();
    await expect(rows).toHaveCount(11);

    // Both chip rows exist and NARROW together rather than replacing each other.
    await page
      .getByRole("button", { name: /^Matematik/ })
      .first()
      .click();
    const both = await rows.count();
    expect(both).toBeGreaterThan(0);
    expect(both).toBeLessThan(11);

    await page.getByRole("button", { name: "Süzmeyi kaldır" }).click();
    await expect(rows).toHaveCount(25);
  });

  test("cinsiyete göre sıralama gerçekten sıralıyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    await page
      .locator("select.sort-pick")
      .selectOption({ label: "Cinsiyete göre" });

    const values = await mainList(page)
      .locator('tbody tr td select[aria-label*="cinsiyeti"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLSelectElement).value));
    // Turkish order of the LABELS: Belirtilmemiş, Erkek, Kadın.
    expect(values).toEqual(
      [...values].sort((a, b) => {
        const label = (v: string) =>
          v === "" ? "Belirtilmemiş" : v === "e" ? "Erkek" : "Kadın";
        return label(a).localeCompare(label(b), "tr");
      }),
    );
  });

  test("Kurulum özeti dağılımı SAYIYOR", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    const summary = page.locator(".panel", { hasText: "Öğretmen yükü" });
    await expect(summary).toContainText("Kadın");
    await expect(summary).toContainText("Erkek");
    await expect(summary).toContainText("Belirtilmemiş");
  });

  test("yapıştırma kutusu dördüncü sütunu okuyor, üç sütunluyu da kabul ediyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    await page.getByRole("button", { name: "Excel'den yapıştır" }).click();
    await expect(
      page.getByText("Ad Soyad · Kısaltma · Branş · Cinsiyet"),
    ).toBeVisible();

    await page
      .locator("textarea")
      .fill("Nazlı Er\tNE\tFizik\tKadın\nOkan Su\tOS\tKimya");
    await page.getByRole("button", { name: "Önizle" }).click();
    await expect(page.getByText("2 satır okundu.")).toBeVisible();
    // Scoped to the preview: the textarea still holds the pasted text and
    // would match the same words.
    const preview = page.locator(".paste-preview li");
    await expect(preview.first()).toHaveText("Nazlı Er (NE) · Fizik · Kadın");
    // The three-column row is not an error, and says nothing it does not know.
    await expect(preview.nth(1)).toHaveText("Okan Su (OS) · Kimya");
  });

  // Pitfall 33's shape, and it happened again while this column was being
  // added: the box showed "Belirtilm" in the add form and "Erke" in the row.
  // The assertion does not invent a number — it clones the control at
  // `width: auto` and asks the browser what IT wants (renk-secici.spec.ts).
  for (const pct of [100, 125, 150]) {
    test(`cinsiyet kutusu %${pct} ölçekte kendi metnini SIĞDIRIYOR`, async ({
      page,
    }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, "Öğretmenler");

      for (const box of [
        mainList(page).locator('select[aria-label*="cinsiyeti"]').first(),
        // Scoped to the add form: the chip row is a `role="group"` with the
        // same name, and both are things you can address by that label.
        page.locator('.form-row select[aria-label="Cinsiyet"]'),
      ]) {
        const fit = await box.evaluate((el) => {
          const s = el as HTMLSelectElement;
          const clone = s.cloneNode(true) as HTMLSelectElement;
          clone.style.width = "auto";
          clone.style.position = "absolute";
          clone.style.visibility = "hidden";
          s.parentElement!.appendChild(clone);
          const want = clone.getBoundingClientRect().width;
          clone.remove();
          return { have: s.getBoundingClientRect().width, want };
        });
        expect(
          fit.have,
          `%${pct}: kutu ${fit.have} < istenen ${fit.want}`,
        ).toBeGreaterThanOrEqual(fit.want - 1);
      }
    });
  }

  // The regression this column caused and the scroll box fixed: at 150% the
  // name input went from 232 px to 26 px, because a `width: 100%` table takes
  // the room it needs from whichever column can still shrink.
  for (const pct of [100, 150]) {
    test(`%${pct} ölçekte AD kutusu okunur kalıyor, sayfa yatay taşmıyor`, async ({
      page,
    }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, "Öğretmenler");

      const ad = await mainList(page)
        .locator('tbody tr td > input[type="text"]:not(.text-sm)')
        .first()
        .evaluate((el) => el.getBoundingClientRect().width);
      expect(ad, `%${pct}: ad kutusu ${ad}px`).toBeGreaterThan(120);

      // The width goes somewhere: the TABLE scrolls, the page does not.
      const spill = await page.evaluate(
        () => document.body.scrollWidth - document.body.clientWidth,
      );
      expect(spill).toBeLessThanOrEqual(1);
    });
  }

  test("cinsiyet KÂĞIDA çıkmıyor", async ({ page }) => {
    await openWithSample(page);
    await page.getByRole("button", { name: "Çıktı", exact: true }).click();
    await page
      .getByRole("button", { name: "Öğretmenler", exact: true })
      .click();
    await expect(page.locator(".print-page").first()).toBeVisible();
    const paper = await page.locator(".print-area").innerText();
    expect(paper).not.toMatch(/Kadın|Erkek|Belirtilmemiş/);
  });
});

// THE FOUR LISTS, MEASURED — three complaints, three numbers.
//
// All three were reported by the reader looking at the screen, and all three
// turned out to be measurable to the pixel. They are here rather than in a
// styling note because none of them can be seen by jsdom and none of them
// changes a single word, attribute or count: the suite was green through all
// of it (pitfall 33's family).
test.describe("65. Kurulum listelerinin ölçüleri", () => {
  const STEPS = ["Derslikler", "Öğretmenler", "Sınıflar", "Dersler"];

  // Still four lists, at two addresses: Dersler became a tab this round. The
  // measurements below are about the four reading as ONE program, and that
  // claim does not weaken because one of them moved — if anything it is the
  // claim most worth keeping after a move.
  const goList = async (page: Page, step: string) =>
    step === "Dersler" ? openLessons(page, "all") : openSetup(page, step);

  /** How far the row's delete button ends from the table's right edge. */
  async function deleteInset(page: Page) {
    return mainList(page)
      .locator("tbody tr")
      .first()
      .evaluate((tr) => {
        const table = tr.closest("table")!;
        const btn = tr.querySelector("td:last-child .btn.danger")!;
        return Math.round(
          table.getBoundingClientRect().right -
            btn.getBoundingClientRect().right,
        );
      });
  }

  // Dersler holds ONE button in its action cell; the other three hold two
  // (inspect + Sil). The column was left-aligned, so in the other three the
  // pair filled it and Sil landed on the edge, while in Dersler the single
  // button sat with dead space after it: measured 42 px at 100 % and 73 px at
  // 150 %, against 6 to 19 px elsewhere. Same markup, different answer,
  // because the alignment came from a neighbour instead of from a rule.
  test("Sil dört listede de aynı yerde — en sağda", async ({ page }) => {
    await openWithSample(page);
    const inset: Record<string, number> = {};
    for (const step of STEPS) {
      await goList(page, step);
      inset[step] = await deleteInset(page);
    }
    const values = Object.values(inset);
    for (const step of STEPS) {
      expect(
        inset[step],
        `${step}: Sil sağ kenardan ${inset[step]}px içeride`,
      ).toBeLessThanOrEqual(14);
    }
    // ...and the same distance in all four, which is the part that reads as
    // "one program" rather than four screens that happen to look alike.
    expect(
      Math.max(...values) - Math.min(...values),
      JSON.stringify(inset),
    ).toBeLessThanOrEqual(4);
  });

  // THE NAME COLUMN IS ONE COLUMN, IN ALL FOUR LISTS.
  //
  // "Sınıflar listesinde ad niye o kadar kaymış ve ayrıca o kadar uzun.
  //  Derslikte de çok uzun." Both halves were `width: 100%` on the table: a
  // table that must fill its panel hands the slack to whichever columns have
  // no width written down, so Ad ran the width of the panel in Derslikler, and
  // in Sınıflar the slack was split with Renk — whose swatch is a fixed 5ch, so
  // that column grew while its content did not and pushed the name sideways.
  //
  // What is asserted is the SAME width in all four, because that is the part a
  // reader feels: stepping between the lists no longer moves the column under
  // the cursor. A number is deliberately not written down — the ladder decides,
  // and the test only says the four agree with each other.
  test("ad sütunu dört listede de aynı genişlikte", async ({ page }) => {
    await openWithSample(page);

    /** The width of the column headed `label`, in the list on screen. */
    const nameColumn = async (label: string) =>
      mainList(page)
        .locator("thead th")
        .filter({ hasText: label })
        .first()
        .evaluate((el) => Math.round(el.getBoundingClientRect().width));

    const width: Record<string, number> = {};
    for (const step of ["Derslikler", "Öğretmenler", "Sınıflar"]) {
      await openSetup(page, step);
      width[step] = await nameColumn("Ad");
    }
    await openSetup(page, "Branşlar");
    width["Branşlar"] = await nameColumn("Branş");

    const values = Object.values(width);
    expect(Math.min(...values), JSON.stringify(width)).toBeGreaterThan(0);
    expect(
      Math.max(...values) - Math.min(...values),
      `ad sütunu listeden listeye değişiyor: ${JSON.stringify(width)}`,
    ).toBeLessThanOrEqual(1);

    // ...and it is a COLUMN, not the rest of the panel. The panel is ~1400 px
    // at this window; a name box that takes half of it is the bug, whatever
    // its neighbours do.
    const panel = await page
      .locator(".cols > div .panel")
      .first()
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(
      Math.max(...values) / panel,
      `ad sütunu panelin ${((Math.max(...values) / panel) * 100).toFixed(0)}%'i`,
    ).toBeLessThan(0.35);
  });

  // The other half of the same rule, and the thing the reader actually asked
  // for: "Listelerdeki satırlar en sona kadar gitsin. Böyle cücük kadar oldular
  // güzel de gözükmüyor." Nothing measured this before — the table could end a
  // thousand pixels short of its panel and every assertion above stayed green.
  // Measured before the fix, at 100 %: Derslikler -1094 px, Sınıflar -965,
  // Öğretmenler -496.
  for (const pct of [100, 125]) {
    test(`%${pct} ölçekte tablo panelin SONUNA kadar gidiyor`, async ({
      page,
    }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      for (const step of STEPS) {
        await goList(page, step);
        const gap = await page
          .locator(".panel.step-panel")
          .evaluate((panel) => {
            const table = panel.querySelector(".table-scroll > table.list")!;
            const pad = parseFloat(getComputedStyle(panel).paddingRight);
            const inner = panel.getBoundingClientRect().right - pad;
            return table.getBoundingClientRect().right - inner;
          });
        expect(
          gap,
          `%${pct} ${step}: tablo panelin ${Math.round(-gap)}px gerisinde bitiyor`,
        ).toBeGreaterThan(-2);
      }
    });
  }

  // The teacher list is eleven columns wide and it did not fit: 106 px of
  // sideways scroll at the DEFAULT scale, in a panel that had 200 px of white
  // space three centimetres to its right, because Kurulum gave its sidebar
  // `1fr` of 1920. The sidebar is now bounded and four columns were trimmed to
  // what the browser says they need.
  for (const pct of [100, 110, 125]) {
    test(`%${pct} ölçekte hiçbir liste YANA kaymıyor`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 110) await chooseScale(page, pct);
      for (const step of STEPS) {
        await goList(page, step);
        const spill = await page
          .locator(".cols > div .table-scroll")
          .evaluate((el) => Math.round(el.scrollWidth - el.clientWidth));
        expect(spill, `%${pct} ${step}: ${spill}px taşma`).toBe(0);
      }
    });
  }

  // 110 % is the default the reader actually uses; 150 % is the case the
  // scroll box exists for, and the rule there is unchanged — the TABLE
  // scrolls, the page never does.
  test("%150’de taşma tabloda kalıyor, sayfada değil", async ({ page }) => {
    await openWithSample(page);
    await chooseScale(page, 150);
    await openSetup(page, "Öğretmenler");
    const m = await page.evaluate(() => ({
      box: (() => {
        const el = document.querySelector(
          ".cols > div .table-scroll",
        ) as HTMLElement;
        return Math.round(el.scrollWidth - el.clientWidth);
      })(),
      page: Math.round(document.body.scrollWidth - document.body.clientWidth),
    }));
    expect(m.box, "kaydırma kutusu bu ölçekte iş görmeli").toBeGreaterThan(0);
    expect(m.page).toBeLessThanOrEqual(1);
  });

  // The strip and the table were 44 px apart at the default scale, and almost
  // all of it was an EMPTY announcement line holding `min-height: 1.2em` open
  // for a sentence that is there for about a second after a keypress.
  for (const pct of [100, 150]) {
    test(`%${pct}: arama şeridiyle liste arasında boşluk kalmıyor`, async ({
      page,
    }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, "Öğretmenler");
      const gap = await page.evaluate(() => {
        const tools = document.querySelector(
          ".cols > div .list-tools",
        ) as HTMLElement;
        const table = document.querySelector(
          ".cols > div table.list",
        ) as HTMLElement;
        // The last child of the strip that actually PAINTS something. An empty
        // box between the chips and the table is exactly what this measures.
        const seen = ([...tools.children] as HTMLElement[]).filter(
          (k) =>
            k.getBoundingClientRect().height > 0 &&
            (k.textContent ?? "").trim() !== "",
        );
        const last = seen[seen.length - 1]!;
        return Math.round(
          table.getBoundingClientRect().top -
            last.getBoundingClientRect().bottom,
        );
      });
      // 44 px before, at 100 %. A strip and the table it belongs to are one
      // thing; the gap should read as a gutter, not as a missing paragraph.
      expect(gap, `%${pct}: ${gap}px`).toBeLessThanOrEqual(16);
    });
  }

  // ...and it still SAYS what happened. The announcement did not go quiet, it
  // moved onto the strip's own row, where an empty one costs no height.
  test("duyuru satırı boşken yer kaplamıyor, doluyken okunuyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Derslikler");
    const said = page.locator(".list-tools .list-said");
    expect(
      await said.evaluate((el) =>
        Math.round(el.getBoundingClientRect().height),
      ),
    ).toBe(0);

    await mainList(page).locator("tbody .row-grip").first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(said).toHaveText(/2\. sıraya taşındı/);
    expect(await said.evaluate((el) => el.getAttribute("role"))).toBe("status");
  });

  // THE GUARD ON THE TRIM. Four widths came down and every one of them was set
  // from what the browser asked for, not from taste — so the assertion asks
  // the browser the same question: clone the control at `width: auto` and
  // compare. Written the day the widths changed, and run at the two scales
  // where a `ch` count and a font's quantisation disagree most (pitfall 39).
  for (const pct of [100, 150]) {
    test(`%${pct}: kırpılan kutuların hiçbiri metnini kesmiyor`, async ({
      page,
    }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openSetup(page, "Öğretmenler");

      const boxes = await mainList(page)
        .locator("tbody tr")
        .first()
        .evaluate((tr) => {
          function want(el: HTMLElement) {
            const c = el.cloneNode(true) as HTMLElement;
            c.style.width = "auto";
            c.style.minWidth = "0";
            c.style.position = "absolute";
            c.style.visibility = "hidden";
            el.parentElement!.appendChild(c);
            const w = c.getBoundingClientRect().width;
            c.remove();
            return w;
          }
          const out: Array<{ ad: string; var: number; istenen: number }> = [];
          for (const [ad, sel] of [
            ["renk", ".color-pick"],
            ["sayı kutusu", "input.num"],
            ["cinsiyet", 'select[aria-label*="cinsiyeti"]'],
            ["eylemler", "td:last-child > .form-row"],
          ] as const) {
            const el = tr.querySelector(sel) as HTMLElement | null;
            if (el !== null)
              out.push({
                ad,
                var: el.getBoundingClientRect().width,
                istenen: want(el),
              });
          }
          return out;
        });

      expect(boxes.length, "ölçülecek kutu bulunamadı").toBe(4);
      for (const b of boxes) {
        expect(
          b.var,
          `%${pct} ${b.ad}: kutu ${Math.round(b.var)} < istenen ${Math.round(b.istenen)}`,
        ).toBeGreaterThanOrEqual(b.istenen - 1);
      }
    });
  }

  // The short-form box is the one that got narrowest, and it is narrowed ONLY
  // inside a row: the add form's box carries the placeholder "Kısaltma", a
  // whole word, and shrinking that one would be pitfall 33 with a new coat on.
  test("kısaltma kutusu satırda dar, ekleme formunda geniş", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Öğretmenler");
    const inRow = await mainList(page)
      .locator("tbody tr input.text-sm")
      .first()
      .evaluate((el) => el.getBoundingClientRect().width);
    // A descendant and not a child: the form sits inside `.add-panel-body`,
    // one of the three grid tracks `AddPanel.tsx` draws.
    const inForm = await page
      .locator(".panel.add-panel .form-row input.text-sm")
      .first()
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(inRow).toBeLessThan(inForm);
    // The add box has to hold its own placeholder, whatever it happens to be.
    const fits = await page
      .locator(".panel.add-panel .form-row input.text-sm")
      .first()
      .evaluate((el) => {
        const s = el as HTMLInputElement;
        const probe = document.createElement("span");
        probe.style.cssText =
          "position:absolute;visibility:hidden;white-space:pre";
        probe.style.font = getComputedStyle(s).font;
        probe.textContent = s.placeholder;
        document.body.appendChild(probe);
        const need = probe.getBoundingClientRect().width;
        probe.remove();
        return { have: s.clientWidth, need };
      });
    expect(
      fits.have,
      `ekleme kutusu ${Math.round(fits.have)} < "${"Kısaltma"}" ${Math.round(fits.need)}`,
    ).toBeGreaterThanOrEqual(fits.need);
  });
});

// 67. The split: how a week's hours fall into blocks.
//
// Asked for by name, with aSc's own screen as the reference: the box for
// "Lessons/week" and a dropdown beside it saying how those hours are shaped.
// Before v7 there was one block LENGTH per lesson, so "3 saat" could only be
// 1+1+1 or a single 3-hour block — never 2+1 — and a 5-hour lesson in doubles
// lost its fifth hour for good.
test.describe("67. Ders dağılımı", () => {
  const rowPicker = (page: Page) =>
    page
      .locator(".cols > div table.list tbody tr")
      .first()
      .locator(".split-pick");

  /** The new-lesson row's own boxes. */
  const newHours = (page: Page) =>
    page.locator('.form-row input[type="number"].num').first();
  const newPicker = (page: Page) => page.locator(".form-row .split-pick").first();

  const pick = async (page: Page, trigger: Locator, label: string) => {
    await trigger.click();
    await page
      .locator(".split-popover:visible")
      .getByRole("option", { name: label, exact: true })
      .click();
  };

  const setRowHours = async (page: Page, value: string) => {
    const hours = page
      .locator(".cols > div table.list tbody tr")
      .first()
      .locator('input[type="number"].num')
      .first();
    await hours.fill(value);
    await hours.blur();
  };

  test("tıklanınca bütün 3/2/1 kombinasyonlarını büyükten küçüğe gösteriyor", async ({ page }) => {
    await openWithSample(page);
    await openLessons(page);

    await newHours(page).fill("6");
    await newPicker(page).click();
    const options = page.locator(".split-popover:visible").getByRole("option");
    await expect(options).toHaveCount(7);
    await expect(options.locator('.split-option-label')).toHaveText([
      "3+3",
      "3+2+1",
      "3+1+1+1",
      "2+2+2",
      "2+2+1+1",
      "1×2 + 4×1",
      "6×1",
    ]);
    await expect(page.locator('.split-popover:visible')).not.toContainText('4 saat');
  });

  test("seçilen dağılım kaydediliyor ve saat düşünce kırpılıyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page);

    await setRowHours(page, "6");
    await pick(page, rowPicker(page), "2+2+2");
    await expect(rowPicker(page)).toHaveText("2+2+2");

    // Lower the total and the shape has to come with it — only one pair fits.
    await setRowHours(page, "3");
    await expect(rowPicker(page)).toHaveText("2+1");

    await reopen(page);
    await openLessons(page);
    await expect(rowPicker(page)).toHaveText("2+1");
  });

  test("havuzda her farklı blok boyu ayrı kart ve kaç saat olduğunu söylüyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page);

    const row = page.locator("table.list tbody tr").first();
    const name = (await row.locator("td").nth(2).innerText()).trim();
    await setRowHours(page, "3");
    await pick(page, rowPicker(page), "2+1");
    await expect(rowPicker(page)).toHaveText("2+1");

    await page.getByRole("button", { name: "Program", exact: true }).click();
    const mine = page.locator(".pool-card", {
      hasText: name.split("·")[0]!.trim(),
    });
    // Two distinct stacks for one lesson: a double and a single, and each has
    // one real card that says which size it represents.
    const own = mine.filter({ hasText: "0/3" });
    await expect(own).toHaveCount(2);
    expect(await own.first().getAttribute("data-size")).toBe("2");
    expect(await own.last().getAttribute("data-size")).toBe("1");
    // The block length left the card's TEXT on 2026-08-27 ("Programda 1 saat x5
    // veeya 2 saat x3 gibi gözükmesin kartlarda güzel değil"). It is still in
    // the tooltip, and on screen it is the WIDTH — which is what the reader is
    // choosing between when two cards of one lesson sit side by side.
    await expect(own.first()).toHaveAttribute("title", /2 saatlik blok/);
    await expect(own.last()).toHaveAttribute("title", /1 saatlik blok/);
  });

  // A THREE-hour block, which the model could not express between v7 and v9.
  // Measured on the grid rather than in the store: the point of a long block is
  // that it is drawn as ONE cell, and the cell is what the reader sees.
  test("üç saatlik blok ızgarada TEK hücre olarak çiziliyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page);

    const row = page.locator("table.list tbody tr").first();
    const name = (await row.locator("td").nth(2).innerText())
      .trim()
      .split("·")[0]!
      .trim();
    await setRowHours(page, "3");

    // A block can never be longer than "this class may see this lesson N hours
    // a day" — the sample school says 2, so without raising this lesson's own
    // ceiling the three-hour block has no legal cell anywhere and the solver is
    // right to leave it in the tray.
    await row.locator('input[type="number"]').last().fill("3");
    await row.locator('input[type="number"]').last().blur();
    await pick(page, rowPicker(page), "3");
    await expect(rowPicker(page)).toHaveText("3");

    await page.getByRole("button", { name: "Program", exact: true }).click();
    const card = page.locator(".pool-card", { hasText: name }).first();
    await expect(card).toHaveAttribute("data-size", "3");

    await page.getByRole("button", { name: /^Otomatik diz/ }).click();
    await expect(page.locator(".reason-bar.ok, .reason-bar.bad")).toBeVisible({
      timeout: 60_000,
    });

    // One <td> standing for three hours — not three cells that happen to match.
    await expect(
      page.locator('table.grid td[data-span="3"]').first(),
    ).toBeVisible();
  });

  test("günlük sınırı aşan kombinasyonu gösteriyor fakat kilitliyor", async ({ page }) => {
    await openWithSample(page);
    await openLessons(page);

    const row = page.locator(".cols > div table.list tbody tr").first();
    await setRowHours(page, "3");
    await rowPicker(page).click();
    const triple = page
      .locator(".split-popover:visible")
      .getByRole("option")
      .filter({ has: page.locator('.split-option-label:text-is("3")') });
    await expect(triple).toHaveAttribute("aria-disabled", "true");
    await expect(triple).toContainText("3 saat > günde 2");

    await page.keyboard.press("Escape");
    const perDay = row.locator('input[type="number"]').last();
    await perDay.fill("3");
    await perDay.blur();
    await rowPicker(page).click();
    await expect(
      page
        .locator(".split-popover:visible")
        .getByRole("option")
        .filter({ has: page.locator('.split-option-label:text-is("3")') }),
    ).toHaveAttribute("aria-disabled", "false");
  });

  // THE MIDDLE LAYER — "Sınıfların özel olarak bir günde aynı dersten kaç saat
  // girme opsiyonu olsun." One number on the class, and every lesson that class
  // has obeys it; the lesson's own box still wins over it. Schema v11.
  test("sınıfın kendi günlük sınırı derslerine geçiyor ve yenilemeden sonra duruyor", async ({
    page,
  }) => {
    await openWithSample(page);
    await openSetup(page, "Sınıflar");

    // The first class, tightened to one hour of any one lesson a day. The
    // sample school's own number is 2.
    const first = mainList(page).locator("tbody tr").first();
    const className = (await first.getAttribute("data-row-name"))!;
    const box = first.getByRole("spinbutton", {
      name: /aynı dersten en fazla/,
    });
    await expect(box, "boş kutu okulun sayısını gösteriyor").toHaveAttribute(
      "placeholder",
      "2",
    );
    await box.fill("1");
    await box.blur();

    // Dersler reads it: that class's lessons now warn at two hours a day, and
    // the placeholder in their own box names the CLASS's number, not the
    // school's — a placeholder that names a number the empty box would not use
    // would be a lie.
    await openLessons(page, "all");
    const lesson = page
      .locator(".panel.step-panel table.list tbody tr")
      .filter({ has: page.locator(`td:text-is("${className}")`) })
      .first();
    await expect(lesson.locator('input[type="number"]').last()).toHaveAttribute(
      "placeholder",
      "1",
    );

    // ...and it survives a reload, which is the half a schema bump can break.
    await reopen(page);
    await openSetup(page, "Sınıflar");
    await expect(
      mainList(page)
        .locator("tbody tr")
        .first()
        .getByRole("spinbutton", { name: /aynı dersten en fazla/ }),
    ).toHaveValue("1");

    // Ayarlar → Kurallar counts it, the way it already counts teachers who
    // carry their own numbers.
    await openSettings(page, "Kurallar");
    const panel = page.locator(".panel", {
      has: page.getByRole("heading", { name: /Kendi sınırı olan sınıflar/ }),
    });
    await expect(panel).toContainText(className);
  });

  for (const pct of [100, 125, 150]) {
    test(`dağılım seçicisi %${pct} ölçekte KIRPILMIYOR`, async ({ page }) => {
      await openWithSample(page);
      if (pct !== 100) await chooseScale(page, pct);
      await openLessons(page);

      await setRowHours(page, "11");
      await rowPicker(page).click();
      const popover = page.locator(".split-popover:visible");
      await expect(popover).toBeVisible();
      const box = await popover.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(1920);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(1080);
      await expect(popover.locator(".split-option-label").first()).not.toBeEmpty();
    });
  }

  // The hour that used to be lost. One block length meant 3 hours in doubles
  // was floor(3 / 2) = 1 block and the third hour could never be placed;
  // "2+1" asks for all three and the solver has to place blocks of two
  // different lengths for one lesson to give them.
  test("2+1 dersin ÜÇ saati de diziliyor — kaybolan saat yok", async ({
    page,
  }) => {
    await openWithSample(page);
    await openLessons(page);

    const row = page.locator("table.list tbody tr").first();
    await setRowHours(page, "3");
    await pick(page, rowPicker(page), "2+1");
    const name = (await row.locator("td").nth(2).innerText())
      .trim()
      .split("·")[0]!
      .trim();

    await page.getByRole("button", { name: "Program", exact: true }).click();
    await expect(
      page.locator(".pool-card", { hasText: name }).first(),
    ).toBeVisible();

    await page.getByRole("button", { name: /^Otomatik diz/ }).click();
    await expect(page.locator(".reason-bar.ok, .reason-bar.bad")).toBeVisible({
      timeout: 60_000,
    });

    // Nothing of this lesson is left in the tray: both its blocks went down.
    await expect(page.locator(".pool-card", { hasText: "/3" })).toHaveCount(0);
  });
});

// "Branş isimleri değiştirme de olsun." The cascade is the whole difficulty:
// `Teacher.subject` stores the NAME, not an id, so a rename that stopped at the
// list would leave every teacher holding a branch nobody offers.
test.describe("82. Branş yeniden adlandırma", () => {
  const nameBox = (page: Page, subject: string) =>
    page.getByRole("textbox", { name: `${subject} branşının adı` });

  test("ad değişince ÖĞRETMENİN branşı da değişiyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Branşlar");

    await nameBox(page, "Coğrafya").fill("Coğrafya ve Jeoloji");
    await nameBox(page, "Coğrafya").blur();
    // Somebody teaches it, so the change is confirmed and says how many.
    await expect(
      page.getByRole("alertdialog").or(page.getByRole("dialog")),
    ).toContainText("öğretmenin branşı da bu adla değişecek");
    await page.getByRole("button", { name: "Değiştir" }).click();

    await expect(nameBox(page, "Coğrafya ve Jeoloji")).toBeVisible();

    // The teachers' dropdown is the proof: it reads the same list.
    await openSetup(page, "Öğretmenler");
    await expect(
      page
        .locator("table.list select")
        .filter({ hasText: "Coğrafya ve Jeoloji" })
        .first(),
    ).toBeVisible();
  });

  // Merging two subjects would rewrite every teacher on one of them, and no
  // undo can say which of the two a given teacher actually held.
  test("BAŞKA bir branşın adına çevirmeye izin vermiyor", async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Branşlar");

    await nameBox(page, "Fizik").fill("Kimya");
    await nameBox(page, "Fizik").blur();
    await expect(
      page.getByRole("alertdialog").or(page.getByRole("dialog")),
    ).toContainText("zaten kullanılıyor");
    await page.getByRole("button", { name: "Tamam" }).click();

    await expect(nameBox(page, "Fizik")).toBeVisible();
  });

  // A name only a teacher carries is not the school's to edit from this row.
  test('"listede değil" satırı salt okunur', async ({ page }) => {
    await openWithSample(page);
    await openSetup(page, "Branşlar");
    const strays = page
      .locator("table.list tbody")
      .nth(1)
      .locator('input[type="text"]');
    // Whatever the sample leaves stray, none of those rows offers a NAME box:
    // the only text input on them is the short form.
    for (const box of await strays.all()) {
      await expect(box).toHaveAttribute("aria-label", /kısaltması$/);
    }
  });
});
