// Gercek tarayici testleri.
//
// Hedef, dev sunucusu DEGIL, `dist/index.html` dosyasinin file:// uzerinden
// acilmasi — yani babanin cift tiklayacagi seyin ta kendisi. Burada test
// edilenler jsdom'da anlamli test edilemeyen seyler:
//   - file:// altinda localStorage gercekten calisiyor mu (veri kaybi riski)
//   - fareyle surukle-birak, hayalet kart, yesil/kirmizi vurgu
//   - sabit sutunlarin 1366x768'de gercekten sabit kalmasi
//   - yazdirma duzeninin tasip tasmadigi

import { expect, test, type Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const DOSYA = pathToFileURL(resolve('dist/index.html')).href;

async function ac(page: Page) {
  await page.goto(DOSYA);
  await expect(page.getByRole('button', { name: 'Kurulum' })).toBeVisible();
}

/** Ornek veriyi yukleyip Program sekmesine gecer. */
async function ornekVeriyleAc(page: Page) {
  await ac(page);
  page.once('dialog', (d) => d.accept()); // "Örnek veri yüklenecek" onayı
  await page.getByRole('button', { name: /Örnek veriyle doldur/ }).click();
  await page.getByRole('button', { name: 'Program' }).click();
  await expect(page.locator('table.izgara')).toBeVisible();
}

test.describe('1. Kalıcılık — file:// altında', () => {
  test('otomatik kayıt çalışıyor ve uyarı çıkmıyor', async ({ page }) => {
    await ac(page);
    // Uyari cikiyorsa localStorage file:// altinda calismiyor demektir.
    await expect(page.locator('.kayit-uyarisi')).toHaveCount(0);
  });

  test('yerleştirilen ders sayfa kapatılıp açılınca duruyor', async ({ page }) => {
    await ornekVeriyleAc(page);
    await surukleVeBirak(page);
    await expect(page.locator('table.izgara .kart')).not.toHaveCount(0);
    const oncekiSayi = await page.locator('table.izgara .kart').count();

    // Otomatik kayit 400 ms geciktirmeli
    await page.waitForTimeout(700);
    await page.reload();
    await page.getByRole('button', { name: 'Program' }).click();

    await expect(page.locator('table.izgara .kart')).toHaveCount(oncekiSayi);
  });
});

/** Sürüklemeyi başlatır ve hedef satır görünür olana kadar bekler. */
async function suruklemeyeBasla(page: Page, sira = 0) {
  const kart = page.locator('.havuz-kart').nth(sira);
  const kutu = (await kart.boundingBox())!;
  await page.mouse.move(kutu.x + kutu.width / 2, kutu.y + kutu.height / 2);
  await page.mouse.down();
  await expect(page.locator('tr.hedef-satir')).toHaveCount(1);
  // Sürükleme başlarken hedef satır görünür alana kaydırılıyor; otursun.
  await page.waitForTimeout(150);
}

/**
 * Verilen seçiciye uyan, o an GERÇEKTEN görünür hücreleri döndürür.
 *
 * 84 sütunun ancak ~35'i ekrana sığıyor. Ekran dışındaki bir hücrenin
 * boundingBox'ı yine bir koordinat verir ama oraya fare götürmek anlamsızdır —
 * uygulamada oraya otomatik kaydırmayla ulaşılır, testte ışınlanarak değil.
 * Kenar boşlukları sabit sütunu (132px), sabit başlığı (~44px) ve otomatik
 * kaydırma bölgesini (56px) dışarıda bırakacak kadar geniş.
 */
async function gorunurHucreler(page: Page, secici: string) {
  // Hücre hücre boundingBox() sormak 84 tur gidiş-geliş demek ve saniyeler
  // sürüyor; sürükleme sırasında bu kadar beklemek testi kırılgan yapar.
  // Hepsini tek seferde tarayıcının içinde hesaplıyoruz.
  return page.evaluate((sec) => {
    const sarmal = document.querySelector('.izgara-sarmal');
    if (sarmal === null) return [];
    const r = sarmal.getBoundingClientRect();
    // Marjlar sabit sütunu (132px), sabit başlığı (~44px) ve otomatik kaydırma
    // bölgesini (56px) dışarıda bırakacak kadar geniş.
    const sinir = { sol: r.left + 140, sag: r.right - 70, ust: r.top + 70, alt: r.bottom - 70 };

    const sonuc: Array<{ x: number; y: number; sira: number }> = [];
    document.querySelectorAll(sec).forEach((el, sira) => {
      const h = el.getBoundingClientRect();
      const x = h.left + h.width / 2;
      const y = h.top + h.height / 2;
      if (x > sinir.sol && x < sinir.sag && y > sinir.ust && y < sinir.alt) {
        sonuc.push({ x, y, sira });
      }
    });
    return sonuc;
  }, secici);
}

/** Havuzdan bir karti izgaradaki ilk gecerli hucreye surukler. */
async function surukleVeBirak(page: Page): Promise<{ gun: string; saat: string; satir: string }> {
  await suruklemeyeBasla(page);

  const hucreler = page.locator('tr.hedef-satir td');
  for (const nokta of await gorunurHucreler(page, 'tr.hedef-satir td')) {
    await page.mouse.move(nokta.x, nokta.y, { steps: 3 });
    await page.waitForTimeout(40); // vurgu rAF döngüsünde uygulanıyor
    const hucre = hucreler.nth(nokta.sira);
    if ((await hucre.getAttribute('class'))?.includes('hedef-gecerli') === true) {
      const gun = (await hucre.getAttribute('data-gun'))!;
      const saat = (await hucre.getAttribute('data-saat'))!;
      const satir = (await hucre.getAttribute('data-satir'))!;
      await page.mouse.up();
      return { gun, saat, satir };
    }
  }
  await page.mouse.up();
  throw new Error('Hiçbir hücre geçerli görünmedi — sürükleme vurgusu çalışmıyor.');
}

test.describe('2. Sürükle-bırak', () => {
  test('hayalet kart oluşuyor ve imleci takip ediyor', async ({ page }) => {
    await ornekVeriyleAc(page);
    const kart = page.locator('.havuz-kart').first();
    const kutu = (await kart.boundingBox())!;

    await page.mouse.move(kutu.x + 10, kutu.y + 10);
    await page.mouse.down();
    await expect(page.locator('.hayalet')).toHaveCount(1);

    await page.mouse.move(600, 400, { steps: 5 });
    const ilk = (await page.locator('.hayalet').boundingBox())!;
    await page.mouse.move(800, 500, { steps: 5 });
    const ikinci = (await page.locator('.hayalet').boundingBox())!;
    expect(ikinci.x).toBeGreaterThan(ilk.x);
    expect(ikinci.y).toBeGreaterThan(ilk.y);

    // Hayalet imlecin altindaki hucreyi gizlememeli (pointer-events: none)
    await page.mouse.up();
    await expect(page.locator('.hayalet')).toHaveCount(0);
  });

  test('geçerli hücre yeşil, ders bırakılınca yerleşiyor', async ({ page }) => {
    await ornekVeriyleAc(page);
    await expect(page.locator('table.izgara .kart')).toHaveCount(0);

    const { gun, saat, satir } = await surukleVeBirak(page);

    // data-satir SART: her satirda ayni gun/saat hucresi var, satirsiz secici
    // yanlis satira bakar.
    const hucre = page.locator(
      `tbody td[data-satir="${satir}"][data-gun="${gun}"][data-saat="${saat}"]`,
    );
    await expect(hucre.locator('.kart')).toHaveCount(1);
  });

  test('hedef satır ekran dışındaysa sürükleme başlayınca görünür oluyor', async ({ page }) => {
    await ornekVeriyleAc(page);
    const sarmal = page.locator('.izgara-sarmal');
    const kutu = (await sarmal.boundingBox())!;

    // Bu, E2E testinin yakaladigi asil hataydi: hedef satir ekranin altinda
    // kalinca kullanici oraya hic ulasamiyordu.
    await suruklemeyeBasla(page);
    const satir = (await page.locator('tr.hedef-satir').boundingBox())!;

    expect(satir.y).toBeGreaterThanOrEqual(kutu.y - 1);
    expect(satir.y + satir.height).toBeLessThanOrEqual(kutu.y + kutu.height + 1);
    await page.mouse.up();
  });

  test('imleç sağ kenara gelince ızgara kendiliğinden kayıyor', async ({ page }) => {
    await ornekVeriyleAc(page);
    const sarmal = page.locator('.izgara-sarmal');
    const kutu = (await sarmal.boundingBox())!;
    expect(await sarmal.evaluate((el) => el.scrollLeft)).toBe(0);

    await suruklemeyeBasla(page);
    // Sag kenara yaklas ve bekle
    await page.mouse.move(kutu.x + kutu.width - 20, kutu.y + kutu.height / 2, { steps: 5 });
    await page.waitForTimeout(400);

    expect(await sarmal.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
    await page.keyboard.press('Escape');
    await page.mouse.up();
  });

  test('engelli hücre kırmızı olur ve üstte somut sebep yazar', async ({ page }) => {
    await ornekVeriyleAc(page);

    // Öğretmenler tüm bir gün kapalı olduğu için, kapalı gün ekranın sağında
    // kalabiliyor. Görünür kapalı hücresi olan bir kart bulana kadar deniyoruz.
    const kartSayisi = Math.min(await page.locator('.havuz-kart').count(), 10);
    let denendi = false;

    for (let i = 0; i < kartSayisi && !denendi; i++) {
      await suruklemeyeBasla(page, i);
      const noktalar = await gorunurHucreler(page, 'tr.hedef-satir td.musait-degil');

      if (noktalar.length === 0) {
        await page.keyboard.press('Escape');
        await page.mouse.up();
        continue;
      }

      const nokta = noktalar[0]!;
      await page.mouse.move(nokta.x, nokta.y, { steps: 3 });
      await page.waitForTimeout(80);

      const kapali = page.locator('tr.hedef-satir td.musait-degil').nth(nokta.sira);
      await expect(kapali).toHaveClass(/hedef-engel/);

      const sebep = await page.locator('.sebep-cubugu').textContent();
      expect(sebep).toContain('müsait değil');
      // Mesaj somut olmalı: "çakışma var" gibi boş bir cümle değil
      expect(sebep).not.toContain('Çakışma var');

      await page.mouse.up();
      await expect(page.locator('table.izgara .kart')).toHaveCount(0); // bırakılmadı
      denendi = true;
    }

    expect(denendi, 'görünür kapalı hücresi olan bir kart bulunamadı').toBe(true);
  });

  test('2 saatlik blok sürüklenirken iki hücre birden vurgulanır', async ({ page }) => {
    await ornekVeriyleAc(page);
    // Sayaci "0/N" olan ve blok=2 olan bir kart bulmak yerine, tum kartlari
    // deneyip iki hucre vurgulayan ilkini ariyoruz.
    const kartlar = page.locator('.havuz-kart');
    const adet = Math.min(await kartlar.count(), 12);
    let bulundu = false;

    for (let i = 0; i < adet && !bulundu; i++) {
      await suruklemeyeBasla(page, i);

      const bos = page.locator('tr.hedef-satir td:not(.musait-degil)').first();
      const h = await bos.boundingBox();
      if (h !== null) {
        await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2, { steps: 3 });
        await page.waitForTimeout(60);
        if ((await page.locator('td.hedef-gecerli').count()) === 2) bulundu = true;
      }
      await page.keyboard.press('Escape');
      await page.mouse.up();
    }
    expect(bulundu, 'blok=2 olan bir ders iki hücre vurgulamalı').toBe(true);
  });

  test('Escape sürüklemeyi iptal eder', async ({ page }) => {
    await ornekVeriyleAc(page);
    const kutu = (await page.locator('.havuz-kart').first().boundingBox())!;
    await page.mouse.move(kutu.x + 10, kutu.y + 10);
    await page.mouse.down();
    await expect(page.locator('.hayalet')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(page.locator('.hayalet')).toHaveCount(0);

    await page.mouse.up();
    await expect(page.locator('table.izgara .kart')).toHaveCount(0);
  });
});

test.describe('3. Izgara', () => {
  test('yerleşmiş derse tıklayınca kalkar, Ctrl+Z geri getirir', async ({ page }) => {
    await ornekVeriyleAc(page);
    await surukleVeBirak(page);

    const kartlar = page.locator('table.izgara .kart');
    const once = await kartlar.count();
    expect(once).toBeGreaterThan(0);

    await kartlar.first().click();
    await expect(kartlar).toHaveCount(0); // blok ise tamami kalkti

    await page.keyboard.press('Control+z');
    await expect(kartlar).toHaveCount(once);
  });

  test('sağa kaydırınca öğretmen sütunu sabit kalır', async ({ page }) => {
    await ornekVeriyleAc(page);
    const basik = page.locator('tbody .satir-basi').first();
    const once = (await basik.boundingBox())!;

    await page.locator('.izgara-sarmal').evaluate((el) => {
      el.scrollLeft = 1200;
    });
    await page.waitForTimeout(120);

    const sonra = (await basik.boundingBox())!;
    expect(Math.abs(sonra.x - once.x)).toBeLessThan(2); // yerinde kaldi
    expect(sonra.x).toBeGreaterThanOrEqual(0); // ekranda gorunuyor
  });

  test('sınıf görünümüne geçilir ve sürükleme orada da çalışır', async ({ page }) => {
    await ornekVeriyleAc(page);
    await page.getByRole('button', { name: 'Sınıf görünümüne geç' }).click();
    await expect(page.locator('table.izgara tbody tr')).toHaveCount(20);

    await surukleVeBirak(page);
    await expect(page.locator('table.izgara .kart')).not.toHaveCount(0);
  });

  test('1366x768 ekranda sayfa dikey taşmıyor', async ({ page }) => {
    await ornekVeriyleAc(page);
    const tasma = await page.evaluate(
      () => document.body.scrollHeight - document.body.clientHeight,
    );
    expect(tasma).toBeLessThanOrEqual(1);
  });
});

test.describe('4. Yazdırma', () => {
  test('her sınıf için bir sayfa ve yatay taşma yok', async ({ page }) => {
    await ornekVeriyleAc(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    await expect(page.locator('.yazdir-sayfa')).toHaveCount(20);

    await page.emulateMedia({ media: 'print' });
    // Baskida ust cubuk ve kontroller gizlenmeli
    await expect(page.locator('.ust')).toBeHidden();

    const yatayTasma = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(yatayTasma).toBeLessThanOrEqual(1);
  });

  test('PDF üretilebiliyor ve boş değil', async ({ page }) => {
    await ornekVeriyleAc(page);
    await page.getByRole('button', { name: 'Yazdır' }).click();
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    expect(pdf.length).toBeGreaterThan(20_000);
  });
});

test.describe('5. Kurulum ve yedek', () => {
  test('Excel yapıştırma önizleme gösterip ekliyor', async ({ page }) => {
    await ac(page);
    await page
      .locator('.panel', { hasText: 'Öğretmenler' })
      .getByRole('button', { name: "Excel'den yapıştır" })
      .click();

    await page.locator('textarea').fill('Ali Vural\tAV\tMatematik\nDeniz Ak\tDA\tFizik');
    await page.getByRole('button', { name: 'Önizle' }).click();
    await expect(page.getByText('2 satır okundu.')).toBeVisible();

    await page.getByRole('button', { name: /2 satırı ekle/ }).click();
    await expect(page.locator('.panel', { hasText: 'Öğretmenler (2)' })).toBeVisible();
  });

  test('yedek indirilebiliyor', async ({ page }) => {
    await ornekVeriyleAc(page);
    const indirme = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Yedek indir' }).click();
    const dosya = await indirme;
    expect(dosya.suggestedFilename()).toMatch(/^ders-programi-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);
  });

  test('günlük saat azaltılınca taşan dersler temizleniyor', async ({ page }) => {
    await ornekVeriyleAc(page);
    await surukleVeBirak(page);
    await page.getByRole('button', { name: 'Kurulum' }).click();

    const saatKutusu = page.getByLabel('Günlük saat');
    await saatKutusu.fill('4');
    await saatKutusu.blur();

    await page.getByRole('button', { name: 'Program' }).click();
    // 12 -> 4 saat: her gun 4 sutun kaldi
    await expect(page.locator('tbody tr').first().locator('td')).toHaveCount(28);
  });
});
