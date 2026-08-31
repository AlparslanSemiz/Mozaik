# Roboders — rakip incelemesi

İkinci rakip. Birincisi [ASC.md](ASC.md).

**Ürünün adı `Roboders`**, `Robodersi` değil — ikincisi Türkçenin belirtme
hâli. Bu dosyanın adı da o yüzden `ROBODERS.md`.

> **DURUM: R5 bitti, R6 ve R7 BAŞLAMADI.** Aşağıdakilerin tamamı ürünün
> **kendi tanıtım sayfasından** okundu. Programın **içi görülmedi** — ve
> görülemez de, sebebi aşağıda. Yani bu dosya bir **özellik envanteri
> değil**, envanterin önündeki kapının tarifi.
>
> Son güncelleme: 2026-08-31 · Kaynak: <https://roboders.com/>

---

## Ne olduğu — ölçülen

| Soru | Cevap |
|---|---|
| Ne tür bir şey | **Web uygulaması**, bulut tabanlı. İndirilen bir program yok |
| Erişim | Tarayıcı, her cihazdan |
| Hesap | **Zorunlu.** Demo bile kayıt istiyor |
| Deneme | **5 gün ücretsiz**, kredi kartı istemiyor (`Ücretsiz Dene`) |
| Fiyat | MİNİ ₺1.499,99 · MİDİ ₺2.999,99 · MAXİ ₺4.649,99 **aylık**, KDV dahil |
| Sınırlar | MİNİ 5 proje / 20 öğretmen · MİDİ 10 / 40 · MAXİ 30 / 100 |
| Yıllık | %75 indirim iddiası |

**Konumlanması bizim tam tersimiz, ve bu bir gözlem, bir eleştiri değil:**
onların ilk satırı `Kurulum Gerektirmez` + `Bulut Tabanlı Altyapı` + `Her
Yerden ve Her Cihazdan Erişim`. Bizim 1–3. ilkelerimiz tam olarak bunun
karşıtı: çift tıkla çalışır · sunucu yok · internet gerekmez. Yani Roboders'ten
alınabilecek şey **mimarisi değil, özellik fikirleri**.

## Tanıtım sayfasının saydığı yetenekler

Sayfanın kendi kelimeleriyle:

- `Bulut Tabanlı Altyapı` · `Mobil ve Ekran Duyarlı Tasarım` ·
  `Kullanıcı Dostu Arayüz` · `Kurulum Gerektirmez` ·
  `Her Yerden ve Her Cihazdan Erişim` · `Eyotek ile Tam Uyumlu Entegrasyon`
- Otomatik ders programı oluşturma ve yönetme
- **Birden çok proje**, her biri ayrı çalışma alanı
- Eyotek'ten öğretmen/sınıf/ders/derslik **içe aktarma**, biten programı
  Eyotek'e **geri gönderme**
- **Ayrı ayrı raporlar: ders · sınıf · öğretmen · derslik programı**
- **Öğretmenlere e-posta ile dağıtım**
- Bütün programlar için yazdırma
- Kullanıcı yönetimi: 1 ana kullanıcı + 3 sınırlı kullanıcı
- Uzak masaüstü desteği ve canlı eğitim

## Uygulamanın İÇİ — fotoğraftan görüldü (2026-08-31)

Kullanıcı `docs/Örnek Fotolar/` altına **33 telefon fotoğrafı** koydu
(2026-08-27 09:53–10:06) ve bir kısmı Roboders'in **çalışan hâli**, babanın
kendi verisiyle. Yani aşağıdakiler tanıtım metni değil, **ekran**.

**Canlı hesaba dokunmadan görüldü** — güvenlik sözleşmesinin en iyi hâli.

### Kabuk

```
roboders        · Projeler · Hesabım        [TR] [koyu tema] [çalıştır] [çıkış]
────────────────────────────────────────────────────────────────────────────
(i)  • Oluştur   • Yayınla   • Yazdır      [5 yuvarlak simge]  [X] [🔗] [✨] [⧉]
                                                        [ Oluştur ] [ ✓ Kaydet ]
```

- **Üç fazlı akış:** `Oluştur → Yayınla → Yazdır`. Bizde böyle bir faz yok;
  program hep canlı. Onlarda **yayınlama** ayrı bir adım, ve raporlar/e-posta
  ondan sonra geliyor.
- **`Kaydet` AÇIK bir düğme.** Bizde kayıt otomatik (400 ms). Bu, ilke 5'in
  bizim lehimize olan tarafı.
- Sağdaki pembe `Oluştur` = otomatik dizme (robot simgesi).
- **Koyu tema var**, dil seçici var.

### Izgara

- **Satır = SINIF** (`410A` · `411A` · `412B` · `413B` · `414D` · `415D` ·
  `430E` · `431E` · `432F` · `450C` · `451C` · `510A` · `511A` · `530D` ·
  `531D` · `310G` · `311G` · `320H` · `433F` · `453H`), sütun = gün × saat.
  **Bizde satır = öğretmen** (sınıfa geçilebiliyor). Sınıf adı **kod + derslik
  harfi** birleşik — bizim `ClassGroup.roomId`'mizin ta kendisi.
- **Kart = ders kısaltması + öğretmen kısaltması** (`MAT1 AV` · `Türkç DE` ·
  `Kimya İSAY` · `GEO KY`). Bizim kart biçimimizle **aynı fikir**.
- **Renk BRANŞA göre**, öğretmene göre değil. Bizde tersi (ekranda hep
  öğretmen rengi). Bu, `B4.2`'nin *"neye göre boyanacağı seçilebilsin"*
  maddesini doğruluyor: rakip başka bir eksen seçmiş.
- **Kapalı saatler pembe `x`** ile, ve **çok fazlalar** — babanın okulunda
  kapalılık kuralın kendisi. Bizim gri taramamızın karşılığı.
- **Altta havuz** var: `410A Kim` · `412B Tür` · `415D Kimya` · `432F Tür`…
  Yani bekleyen kartlar tepsisi **onlarda da alta konmuş** — bizim
  2026-08-27'de ölçerek verdiğimiz kararla aynı yer.

### Raporlar

- **`Sınıf Çarşaf Liste`** görüldü: bütün sınıflar tek sayfada, her hücrede
  **saat + ders + öğretmenin TAM adı**, branşa göre renkli. Bu tam olarak
  `B3.5`, ve artık neye benzemesi gerektiği de belli.

### Görülmeyen — ve tahmin edilmeyecek

Kısıt tanımlama ekranları · öğretmen/sınıf/ders giriş formları · ayarlar ·
`Yayınla` fazının ne yaptığı · e-posta dağıtım ekranı · Eyotek aktarımı.
Bunlar `R6`'nın işi ve **boş bırakılıyorlar** (tuzak 65 · 101).

## Bize ne söylüyor — ilk okuma

Bunlar **karar değil**, R8'e girecek adaylar.

| Onlarda | Bizde | Not |
|---|---|---|
| Birden çok proje | **var** — plan kitaplığı | Aynı fikir |
| Öğretmenlere e-posta ile dağıtım | **yok** → `B3.4` | Rakip de yapıyor: madde güçlendi. Onlar sunucudan, biz `mailto:`'dan |
| Yazdırma | **var** | |
| Ders · sınıf · öğretmen raporu | **var** (sınıf + öğretmen) | |
| **Derslik programı raporu** | **YOK** | **Yeni aday.** Kâğıda "G dersliğinde bu hafta ne var" diye bakan bir sayfa bizde hiç yok |
| **Ders bazlı rapor** | **YOK** | Ne olduğu belirsiz — ekran görülmeden yazılmaz |
| Eyotek içe/dışa aktarma | yok, olmayacak | Ama "okul sisteminden veri çek" talebini doğruluyor → `B6.2` (aSc XML) |
| Çok kullanıcı / yetki | **yasak liste** (kullanıcı hesapları) | |
| Bulut / mobil | **ilke 1–3** | Alınmaz |

## ⛔ R6 GÜVENLİK SÖZLEŞMESİ — SALT OKUNUR, İSTİSNASIZ

> **Hesaptaki veri babanın GERÇEK verisi ve ASLA değiştirilmeyecek.**
> Kullanıcı, 2026-08-31: *"sakın bir şeyleri değiştirme roboderste onlar
> babamın ve değiştirilmemesi gerekiyor asla. Yanlışlık bile yapma."*

Bu bir tercih değil bir **kapı**. Roboders bir bulut uygulaması: orada yapılan
bir değişikliğin `Ctrl+Z`'si yok, yerel bir yedeği yok, ve bizim elimizde
geri alma yolu yok. Bir tıklama bir dönemi götürebilir.

**Turun tek izni: BAKMAK.**

| Serbest | Yasak |
|---|---|
| Sayfa/sekme arası **gezinme** | `Kaydet` · `Sil` · `Ekle` · `Yeni` · `Oluştur` |
| Menü **açmak** (yazmayan) | `Dağıt` · `Dağıtımı başlat` · otomatik dizme |
| **Ekran görüntüsü** almak | `Gönder` · e-posta dağıtımı |
| DOM **anlık görüntüsü** okumak | `Eyotek'e aktar` · içe/dışa aktarma |
| Salt okunur raporlara bakmak | **Herhangi bir forma yazmak** |
| | Sürükle-bırak · hücreye tıklama |

**Üç ek kural:**

1. **Şüphe varsa tıklanmaz, sorulur.** Bir düğmenin yazıp yazmadığı belirsizse
   o düğme basılmaz. Envanterin bir satırı eksik kalması, babanın programının
   bir satırının değişmesinden **ucuzdur**.
2. **Bir diyalog açıldıysa `İptal`/`Kapat` ile çıkılır**, asla `Tamam` ile.
3. **Yazma yolu olan bir ekranda oyalanılmaz.** Görüntü alınır, çıkılır.

**Bu yüzden Roboders envanteri aSc'ninki kadar derin OLMAYACAK, ve bu kabul
edilmiş bir bedel.** aSc'de kendi kurduğumuz sahte bir okulda her düğmeye
basabiliyorduk; burada gerçek bir okulun canlı verisi var. Eksik kalan her
şey `R7`'de **"görülmedi"** diye işaretlenir — tahmin edilerek doldurulmaz
(tuzak 65 · 101).

## R6'nın önündeki engeller

**HESAP VAR** (kullanıcı, 2026-08-31). Yani ilk yazdığım engel — hesap
açılması ve 5 günlük sayacın hemen başlaması — **düştü**. `R6` artık bir
kayıt işi değil, bir **oturum** işi.

Kalan iki engel, ikisi de erişimle ilgili değil **yöntemle**:

1. **Playwright bu depoda görünür kuruluyor.** `.mcp.json`:
   `@playwright/mcp --browser chromium`, `--headless` **yok**. Yani R6 ekranda
   bir Chromium penceresi açar ve odağı alır — kullanıcı başka bir iş
   yaparken koşturulamaz. Bu bir zamanlama kararı.
2. **Oturum nasıl açılacak?** Şifrenin sohbete yazılmasına gerek yok ve
   yazılmamalı: pencere açıldığında kullanıcı kendi giriyor, sonra gezinme
   devralınıyor. Alternatifi, hâlihazırda açık bir oturumun kullanılması.

**Karşılaştırma hâlâ geçerli:** aSc bu makinede kuruluydu (`C:\TimeTables`),
süresizdi ve 19 bölümün 528 yardım konusu **dosya olarak** elimizdeydi.
Roboders'te bunların hiçbiri yok — ne yerel kurulum, ne yardım dökümü. Yani
Roboders'in envanteri **yalnız ekrana bakarak** çıkacak, ve turun eksiksiz
olması aSc'dekinden daha önemli: geri dönüp "dosyaya bakayım" diyeceğimiz bir
yer yok.

**Bilinmeyen ve R6'dan önce sorulacak:** hesap **ücretli bir plan mı, yoksa
sürmekte olan bir deneme mi**. İkincisiyse turun kaç günü kaldığı turun
kapsamını belirler.

## Doğrulanmamış — R7b'de DÜŞTÜ (2026-08-31)

Aramada `nöbet`, `kulüp` ve *"bir derse bir ana öğretmen ve birden çok yardımcı
öğretmen"* satırları çıkmıştı, kaynağı **büyük ihtimalle Eyotek'in kendi modül
sayfaları** sanılıyordu — Roboders'in değil, Eyotek Roboders'in entegre olduğu
okul yönetim sistemi.

**Ölçüldü, hipotez doğrulandı.** `site:roboders.com` ile kısıtlanmış arama
(`nöbet kulüp yardımcı öğretmen`) **sıfır sonuç** verdi — bu üç kavramdan
hiçbiri `roboders.com`'un kendi sayfalarında geçmiyor. Sınırsız aramada çıkan
sonuçların **hiçbiri** `roboders.com` değildi; hepsi `eyotek.com.tr`'nin kendi
modül sayfalarıydı (`Ders ve Nöbet Programı Modülü`, `Sorum Var`, `Öğrenci`,
`Kullanıcı Yetkilendirme` gibi) ve web aramasının kendi özet cümleleri bu
sayfaların içeriğini Roboders'e ait gibi **birbirine karıştırıyordu** —
hiçbirinin doğrudan alıntısı ya da `roboders.com` kaynağı yoktu.

**Sonuç: üçü de Roboders envanterinden düşer.** `roboders.com`'un tek gerçek
sayfasında (`R5`'te ölçüldü, `/ozellikler` 404) bu üç özellik hiç
geçmiyor — bu, aracın kendisinde olmadığı anlamına gelmez, yalnızca **tanıtım
sayfasından çıkarılamayacağı** anlamına gelir. `R6` (canlı hesap turu)
bunları yine de görebilir, ama tahmin edilerek buraya yazılmayacaklar
(tuzak 65 · 101).

> **Nöbet ayrıca babaya sorulacak bir soru** (§8b) ve cevabı Eyotek'in bir
> modülü olmasından çıkmaz — babanın okulunda nöbet varsa, o ihtiyaç
> Roboders'in sunup sunmadığından bağımsız olarak Mozaik'e girebilir.

## Yeniden üretmek

R5 tamamen web'den, sessizce yapıldı — açılan bir tarayıcı penceresi yok:

```
WebSearch  "Robodersi ders programı hazırlama"   -> roboders.com bulundu
WebFetch   https://roboders.com/                 -> özellik ve fiyat dökümü
WebFetch   https://roboders.com/ozellikler       -> 404, ayrı özellik sayfası YOK
```
