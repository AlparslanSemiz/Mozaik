# Ders Programı

Bir dershanenin haftalık ders programını dizmek için yazılmış tek dosyalık bir
araç. aSc Timetables'ın yerini alır — onun yaptığı işin bu kursla ilgili
yarısını yapar, o yarıyı ondan iyi yapmayı hedefler.

**Kurulum yok. Sunucu yok. İnternet gerekmez.** `dist/index.html` dosyasına çift
tıklarsınız, program açılır. Hesap, şifre, güncelleme, kayıt yok.

---

## Nasıl çalıştırılır

İki yol var, ikisi de aynı programı verir.

**1. Dosya (asıl teslim yolu).** `dist/index.html`'i indirin, çift tıklayın.
Tarayıcıda açılır ve çalışır — fiş çekiliyken de. Programınız o tarayıcının bu
bilgisayardaki deposunda saklanır.

**2. Site.** `npm run build:site` ile üretilen `dist-site/` klasörü statik bir
sayfadır (GitHub Pages'e konabilir). İlk açılıştan sonra bir service worker
sayesinde **çevrimdışı** da açılır. Orada da backend, veritabanı, hesap ya da
API yoktur.

> **Verileriniz bu bilgisayarda ve bu tarayıcıda durur.** Başka bir tarayıcı
> onu görmez, ve tarayıcıda "tarama verilerini temizle" derseniz **silinir**.
> Öğrenilecek tek alışkanlık: *değişiklik yaptın, yedek indir.* Üst çubuktaki
> **Dosyaya kaydet** bunun içindir. Ayarlar → Veri bölümü verinin tam olarak
> hangi anahtarda, ne kadar yer kapladığını söyler.

---

## Ne yapar

Altı sekme: **Kurulum · Müsaitlik · Program · Kontrol · Yazdır · Ayarlar**.

- **Kurulum** — derslikler, öğretmenler, sınıflar, dersler. Excel'den yapıştırma
  kutusu var.
- **Müsaitlik** — kimin hangi saatte müsait olmadığı. Öğretmen, sınıf ve derslik
  için ayrı ayrı.
- **Program** — asıl ekran: satır = öğretmen (ya da sınıf), sütun = 6 gün × 12
  saat. Havuzdan sürükleyip bırakırsınız; **Otomatik diz** haftayı kendi dizer.
  Bir bırakma yasaksa sebebi somut yazar: *"MÇ o saatte 433 sınıfında"*.
- **Kontrol** — program dizilebilir mi, dizilemiyorsa neden. Kapasiteler, kural
  ihlalleri, yerleşemeyen dersler.
- **Yazdır** — her sınıf ve her öğretmen için bir program, **A4 yatay**. Hangi
  sayfaların basılacağı tek tek seçilir; bir kâğıda **1, 2 ya da 4** program
  sığdırılabilir ve kâğıttaki yazı boyutu ayrıca ayarlanır. Önizleme kâğıdın
  kendisidir — aynı ölçüler, aynı satır boyu.
- **Ayarlar** — okul ve zil düzeni, kurallar, branş listesi, görünüm (yazı
  büyüklüğü, ızgara yoğunluğu, hareket) ve veri.

Açık ve koyu tema var. Yazı büyüklüğü %100–%150 arasında ayarlanır — bu araç
gözü iyi görmeyen biri için yazıldı.

---

## Geliştirme

```bash
npm install && npx playwright install chromium   # yeni bilgisayarda bir kez

npm run dev          # geliştirme sunucusu
npm test             # Vitest — saf mantık testleri (508)
npm run build        # dist/index.html tek dosya (ASIL TESLİM)
npm run build:site   # dist-site/ — PWA: tek dosya + manifest + sw.js + simgeler
npm run test:e2e     # Playwright — derler, sonra file:// üzerinde koşar
npm run test:site    # site testleri, http üzerinde (çevrimdışı açılış dahil)
npm run kontrol      # hepsi: tsc + birim + derleme + E2E + site + çözücü
npm run ekran        # iki temada ekran görüntüsü -> test-results/ekran/
npm run cozucu       # gerçek ölçekli çözücü stresi (34,8 sn — kontrol'ün parçası)
```

E2E, dev sunucusunu değil **`dist/index.html`'i `file://` üzerinden** açar —
yani gerçekten çift tıklanacak dosyayı. Sürükle-bırak, yapışkan sütun, yazdırma
taşması ve renk kontrastı yalnız orada görünür.

**Arayüzde görünen bir şeyi değiştirdiyseniz `npm run test:e2e` çalıştırmadan
"bitti" demeyin.**

Mimari, veri modeli, kısıtlar ve bilinen tuzaklar: [CLAUDE.md](CLAUDE.md).
Durum ve ölçümler: [docs/STATUS.md](docs/STATUS.md) · Görevler:
[docs/TASKS.md](docs/TASKS.md) · Tasarım: [docs/DESIGN.md](docs/DESIGN.md).

---

## Teknoloji

Vite + React + TypeScript, `vite-plugin-singlefile` ile tek bir
`dist/index.html`'e gömülür (JS, CSS ve font dahil). Çalışma anında ağdan tek
bayt indirilmez; bu iddia `temel.spec.ts` ve `site.spec.ts` tarafından
**mekanik olarak** doğrulanır.
