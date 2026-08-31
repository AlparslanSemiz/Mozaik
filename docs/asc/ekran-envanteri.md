# aSc ekran envanteri — her ekran, ne var içinde, hangi kovaya kanıt

> **Bu dosya turun kendisi tarafından yazılıyor** (2026-08-31, R1–R2).
> [ASC.md](../ASC.md) kararları tutuyor; burası **ekranın ne söylediğini**.
> Görüntüler `docs/asc/ekran/` altında, adları buradaki `Dosya` sütunu.
>
> Tur `scripts/asc-tur.ps1` + `scripts/asc-adim.ps1` ile koşuldu, Demo1.roz
> üstünde, 2560×1440, arayüz Türkçe.

## Türkçe harfler — DÜZELDİ (2026-08-31)

Önceki 18 görüntü bozuk harf taşıyordu (`Tanıml� Dersler` · `K�s�tlamalar` ·
`G�ncelle`). Sebebi Windows'un *"Unicode UTF-8 kullan (Beta)"* seçeneğiydi;
`scripts/asc-utf8-duzelt.ps1` kod sayfalarını çekti ve **yeniden başlatmadan
sonra** geçerli oldu.

Ölçülen, yeniden başlatmadan önce ve sonra:

```
                  once            sonra
GetACP()          1254            1254        <- YANILTAN: ikisinde de ayni
WinSystemLocale   en-US           tr-TR       <- GERCEK fark burada
diyalog metni     Tanıml� Dersler Tanımlı Dersler
```

**Ders (tuzak 101'in bir örneği daha):** kayıt defterindeki `ACP` değeri
"düzeldi" diyordu ve yanlış söylüyordu. Kapıyı açan ölçüm bir kayıt değeri
değil, **ekrana bakmak** oldu.

---

## 1 · Şerit sekmeleri (7)

| Dosya | Ne var içinde |
|---|---|
| `10-serit-ana-menu` | Yeni · Aç · Kaydet · Yazdır · Ön İzleme · Dersler · Sınıflar · Derslikler · Öğretmenler · Seçmeli Dersler · Planlama İlişkileri · **Planlama Öncesi Kontrol** · **Otomatik Planlamayı Başlat** · Bulut Tabanlı Planlama Başlat · **Planlama Sonrası Kontrol** · Temel Bilgiler · İnternet Hesabı |
| `11-serit-dosya-islemleri` | Yeni · Aç▾ · Kapat · Demo Dosyaları Göster · Kaydet · **Yazdır▾** · **Ön İzleme** · Bilgi Al▾ · **Aktar▾** · **Karşılaştırma▾** · **E-Mail Gönder▾** · İnternet Hesabı |
| `12-serit-tanimlama-islemleri` | Sihirbaz · Temel Bilgiler · **Dersler** (=bizim branşlar) · Sınıflar · Derslikler · Öğretmenler · Seçmeli Dersler · Planlama İlişkileri · Tanımlanan Kısıtlamaların Listesi · Değiştir |
| `13-serit-gorunum` | Geri (Ctrl+Z) · Tekrarla (Ctrl+Y) · **Görünüm** · **Yakınlaştır▾** · **Hafta▾** · Sekmeleri Göster · **Ders Programı İle İlgili▾** |
| `14-serit-planlama-yerlestirme` | Planlama Öncesi Kontrol · Otomatik Planlamayı Başlat · Bulut Tabanlı · **İyileştirme Uygula** · **Analiz▾** · **Parametreler** · Kısıtlama Listesi · Planlama Sonrası Kontrol · **Danışman** · **İstatistik** · **Dersliklere Atama** · Kart Kilitle · Kilit Aç · Tabloyu Temizle |
| `15-serit-arayuz-ayarlari` | Temel Bilgiler · **Yazılımı Özelleştir** · **Gelişmiş** · Uygulama Renk Teması▾ · Yazı▾ · Menü Dil Güncelle · üç onay kutusu (Durum Çubukları · Ana Menü Tuşları · Hızlı Başlat Tuşları Göster/Gizle) |
| `16-serit-yardim` | Dil · eğitim · demo dosyaları |

**Not:** `Otomatik Planlamayı Başlat` ve `Tabloyu Temizle` demonun ızgarasını
değiştirir. Bu turda ikisi de **en sona** bırakıldı ve hiçbir şey kaydedilmedi.

---

## 2 · Görünüm — kova 1a'nın tam kanıtı

Bizim `B4.2` maddemiz (*"kartta ne yazsın, neye göre boyansın seçilebilsin"*)
şimdiye kadar bir tahmindi. Ekran görüldü.

| Dosya | Ne var içinde |
|---|---|
| `40-gorunum-tanimla` | **Görünümleri Tanımla**: `Master · Sınıflar · Öğretmenler · Derslikler · Dersler · Öğrenciler · Beklemedeki Öğrenciler · Nöbet/Gözetim · Ders Çizelgesi`. Düğmeler: Yeni · Güncelle · Sil · Sırala |
| `41-gorunum-sinif-tanim` | **Kartların Üzerindeki Yazıyı Özelleştir**: `Mesajınız` **üç** açılır liste · `Renk` **iki** açılır liste |
| `42-kart-yazisi-secenekler` | Kartta ne yazabilir: `Ders · Öğretmen · Sınıf · Grup · Derslik · Bina · Öğrenci Sayısı · Grup Numarası · Öğrenci Sayısı / Kapasite` |
| `43-kart-rengi-secenekler` | Neye göre boyanır: `Ders · Öğretmen · Sınıf · Grup · Derslik · Bina · **Hafta** · Grup Numarası` |
| `44-yakinlastir` | `50% · 100% · 200%` · **Yakınlaştırma Değeri Belirterek** · **Ekrana Sığdır (Num /)** |
| `45-hafta` | (aşağıda) |
| `46-ders-programi-ile-ilgili` | `Göster (Ctrl+R)` + 1–13 arası numaralı yuvalar + `Derslikler` |
| `47-sekmeleri-goster` | (aşağıda) |

**Bize ne söylüyor:**

- **Kart metni ÜÇ satır, renk İKİ eksen.** Bizde kart metni sabit ve renk hep
  öğretmen (ekranda). aSc üç yuva veriyor ve renk için ikinci bir eksen daha.
- **`Nöbet/Gözetim` bir GÖRÜNÜM.** Kova 5'in *"babaya sorulacak"* maddesi
  aSc'de birinci sınıf bir eksen — ayrı bir varlık değil, ızgaranın başka bir
  okunuşu.
- **Zoom üç hazır kademe + serbest değer + ekrana sığdır.** Bizim
  `--ui-scale`'imiz altı düğme ve **Ayarlar → Görünüm**'de; aSc'ninki ızgaraya
  bakarken, şeritte, artı sağ altta bir kaydırıcı. Kova 1a'nın istediği tam bu.
- **`Bina` ve `Grup` her iki listede de var.** İkisi de bizde yok: bina
  *"tek bina"* diye düştü (kullanıcı kararı), grup kova 2'de **yapılacak**.

---

## 3 · Tanımlama İşlemleri — liste pencerelerinin İÇİ

Ana liste pencereleri (`20`–`27`) zaten turda vardı. Yeni olan, her birinin sağ
düğme sütununun açtıkları.

| Dosya | Ne var içinde |
|---|---|
| `50-ders-atama` | **Seçili Dersi Atandığı Sınıf ve Öğretmenler** — aSc'nin bizim `Lesson`'ımıza karşılık gelen yeri |
| `51-brans-zaman-tablosu` | Bir branşın haftalık tablosu |
| `52-brans-guncelle` | Branş formu |
| `53-ogretmen-guncelle` | Öğretmen formu |
| `54-ogretmen-kisitlamalar` | **Öğretmen / Detaylar** — kısıt ailesinin en kalabalık ekranı |
| `55-sinif-guncelle` | Sınıf formu |
| `56-sinif-kisitlamalar` | **Sınıf Detayları** |
| `57-derslik-guncelle` | Derslik formu |
| `58-iliski-turleri` | **Dersleri Seç** — kartlar arası ilişkilerin TAM listesi |
| `59-kisit-onem-dereceleri` | Bir kısıtın **ağırlığı**: `Düşük · Normal · Yüksek · Sıkı(%100) · En Uygun` |

### 3a · `Ders Atama` — aSc'nin `Lesson`'ı

Sütunlar: `Ders · Öğretmen · Sınıf · Toplam · Uzunluk · Derslikler · Hafta ·
Dönem`. Düğmeler: `Yeni Ders · Dersi Güncelle · Sil · Kopyala · İlave Olarak`.

Satırlarda görülen: `5.A Group 1` · `5.A Group 2` · **`5.E, 5.F Group 1`**.

- **Gruplar birinci sınıf** (kova 2, şema v12): bir sınıfın yarısı ayrı bir
  satır.
- **Bir ders birden çok sınıfı kapsayabiliyor** (`5.E, 5.F`). Bizde bir
  `Lesson`'ın tek bir `classId`'si var; bu ayrı bir eksik.
- `Toplam` + `Uzunluk` = bizim `weeklyHours` + `blocks` ikilisi. ✔
- **`Hafta`** ve **`Dönem`** sütunları: A/B haftası (kova 2, *"olabilir"*) ve
  **dönem** — dönem bizde hiç yok.
- **`Kopyala`** = kova 4'ün *"ders kopyalama"* maddesi, ekranda doğrulandı.

### 3b · Öğretmen — form ve kısıtlar

**Form** (`53`): `Soyadı` · `Adı` · `Kısa Kodu` · ☐`Erkek` ·
`Toplam Ders Saati (isteğe bağlı)` · **`E-Posta`** · **`Telefonu`** ·
`Başlık` · `Sınıf Öğretmenliği` · `Derslikler` · `Renk Kodu` ·
**`Özel Alanlar`**.

> **`B3.4` bir tahmin DEĞİLMİŞ.** E-posta/WhatsApp'tan gönderme maddemiz
> öğretmene **telefon ve e-posta** alanı istiyor ve bunu `schemaVersion` 12
> borcu olarak yazmıştık. aSc ikisini de tutuyor. Roboders de e-posta
> dağıtımı yapıyor (R5). Üç kaynak aynı yeri gösteriyor.

**Mimari fark:** aSc'de öğretmen formunda **branş yok** — branş `Ders
Atama`'dan geliyor. Bizde `Teacher.subject` + `subject2` var. Bizimki
öğretmenin *alanını* tarif ediyor, aSc'ninki dersin kendisini.

**Kısıtlar** (`54`), ve kova 1c'nin çekirdeği burası:

| aSc'de | Bizde |
|---|---|
| **Bir haftadaki toplam boş ders sayısını sınırla** (*"2. ve 6. ders arası boş ise boşluk 3'tür"*) | **YOK** |
| **Bir günde 3 saatten fazla boş ders olamaz** · aynısının 2'lisi | **YOK** |
| **Ders günlerinin sayısını sınırla** (haftada en fazla N gün gelsin) | **YOK** |
| Günde alması gereken **min./max** ders sayısı, + *"hafta sonunda uygulama"* istisnası | `minPerDay` var ama **yalnız Kontrol'de** |
| **Ardışık** derslerin maksimumu, + *"hafta sonu kontrol edilmesin"* | `maxConsecutive` ✔ |
| Binalar arası günlük transit sayısı | tek bina, düştü |
| `Max. Soru İşaretleri` | karşılığı yok |
| Her kutunun yanında **`Tümüne Uygula`** | bizde **miras** (`null` = okul varsayılanı) |

> **`Tümüne Uygula` ile bizim katmanlı `limits`'imiz aynı şey DEĞİL.**
> aSc'ninki bir **eylem**: bu sayıyı bütün öğretmenlere yaz. Bizimki bir
> **ilişki**: `null` bırakılan kutu okulun sayısını okur, ve okul sayısı
> değişince hepsi birden değişir. Bizimki daha güçlü, ve bu not düşülmeli
> çünkü ekranda aSc'ninki daha zengin görünüyor.

### 3c · Sınıf — kısıtlar (`56`)

`Eğitim Bloğu` (☐ *2. derste gelmesine izin ver* + `Gelişmiş`) ·
`Max. Soru İşaretleri` · ☑ **`Hazırlık`** (*Max. günde hazırlanabilecek ders
sayısı*) · ☐ **`Öğrenci Grupları Aynı Saatte Bitirmeli`** · ☐ **`Öğle Arası`**
· `Sınıf Öğretmeni`.

> **ÖĞLE ARASI BİZDE BİR KONUM, aSc'DE BİR ARALIK.** Bizde
> `Day.longBreakAfter` tek bir sayı: *"5. dersten sonra"*. aSc'de
> *"Öğle Arası İçin Gereken Zaman Aralığı: 5–7"* — yani öğle arasının nereye
> düşeceğine **çözücü** karar veriyor, sınıf sınıf değişebiliyor. Yanında bir
> de istisna: *"öğle arası son saatteyse, yemekten sonra ders koyma."*
> Bu gerçek bir yetenek farkı ve bizim zil modelimize dokunuyor.

### 3d · Kartlar arası ilişkiler (`58`) — kova 1c'nin ikinci yarısı

`Ekle` üç adımlı bir pencere açıyor: **1.** Dersleri Seç · **2.** Sınıflar
(Tümü / Seçim) · **3.** Durum. Üçüncü adımdaki **on dört** ilişki türü:

```
Dersler Aynı Gün Yerleştirilemez
Dersler Aynı Gün Ardarda Yerleştirilemez
Ders Kartlarının Günlere Dağılımı            (+ Ayarlar)
Dersler Bir Güne Yerleştirilmelidir
Dersler Ardarda Yerleştirilmelidir           (Belirtilen Sırayla / Rastgele Sırada)
Ders Grup Arasında Ayrılma/Bozulma Olamaz
Farklı Sınıflardaki Kart Grupları Bir Güne Yerleştirilmelidir
Bir Dersin Bölünmüş Kartları Aynı Günde Yer Almalıdır
Grup Olarak Tanımlanan Dersler Aynı Zamanda Başlasın
Seçilen Derslerin Seçilmiş Her Sınıfa Aynı Zamanda Olması Gerekir
Bu Ders Her Gün Aynı Periyotta Olmalıdır
Seçilen Dersler İçin Rezerv Alanı
Dersler İlk Saatte Başlasın veya Son Saatte Bitsin
Seçilen Dersler (Eğitim Binasının Dışında) Öğleden Sonra Olabilir
```

Artı sağ üstte **gün gün açıp kapatılan** küçük bir hafta ızgarası, ve altta
`Planlamadaki Önemi` · `Devre Dışı Bırakın` · `Not`.

### 3e · Kısıtların AĞIRLIĞI var (`59`)

```
Düşük · Normal · Yüksek · Sıkı(%100) · En Uygun
```

Bizde üç kademe var (`Kapalı · Uyar · Engelle`) ve ikisi eşleşiyor:
`Sıkı(%100)` ≈ `Engelle`, `Kapalı` ≈ kuralı hiç kurmamak. Eşleşmeyen şey
ortadaki üç kademe: bizim `Uyar`ımız tek bir ses, aSc'de **derecelendirilmiş**
ve çözücünün amaç fonksiyonuna farklı ağırlıklarla giriyor. `En Uygun` ise bir
kısıt değil bir **hedef**.

> Bu, `rules.ts`'e dokunan bir fark ve bugün bizde karşılığı yok. Kova 1c'ye
> yazılacak, ama **ölçülmeden** değil: bizim çözücümüzün kalite ölçümü bugün
> yok, ağırlıklı bir kısıt onsuz anlamsız.

---

## 4 · Planlama / Yerleştirme — çözücünün ekranları

| Dosya | Ne var içinde |
|---|---|
| `60-parametreler` | Çözücü ayarlarının **tamamı**: dört onay kutusu |
| `61-danisman` | Danışman — Demo1 kusursuz olduğu için *"kritik sorun görmüyor"* |
| `62-analiz` | `Planlama Analizi · Planlama Renkleri · Detaylı Veri Kontrolü` |
| `63-istatistik` | Sayılar ve öğretmen başına günlük dağılım |
| `64-planlama-analizi` · `65-detayli-veri-kontrolu` | Analiz menüsünün açtıkları |
| `66-planlama-oncesi-kontrol` | **Yıkıcı**: yerleşimi silmeyi teklif ediyor. `Hayır` denildi |
| `67-planlama-sonrasi-kontrol` | **Puanlı** ihlal raporu |

### 4a · `Parametreler` — çözücünün AYARI YOK denecek kadar az

```
☐ Planlama Öncesi Yerleşim Temizlensin
☑ Ardışık Ders Sayısı Sınırı            [6]   (kısıt tanımlanmamışsa varsayılan)
☑ Haftalık Boş Ders Sayısı Kontrol Edilsin [6]
☐ 0. Saate Ders Ver
```

> **CLAUDE.md'de bir ölçüm borcu kapandı.** Orada *"Ayar yok — 'sabaha yay'
> gibi tercihler henüz ÖLÇÜLMEDİ; aSc'nin karşılığı `u58`'de duruyor ve
> bakılmadı"* yazıyordu. Bakıldı: **aSc'de de yok.** Çözücü tercihleri dört
> kutu, ve ilki bizim `Otomatik diz` ↔ `Baştan diz` ikilimizin ta kendisi.
> `0. Saate Ders Ver` de kova 4'ün *"0. ders"* maddesini doğruluyor.

### 4b · `Planlama Sonrası Kontrol` — PUANLI ihlal raporu

```
Kayıt                     Puanlar   Tanımlama
Genel                       365
2x                          200     15) *** Günlük Boş Ders Sayısı Seçilen Değerden Fazla Olamaz.: 2
(6.G:Ru) 6.G: Russian la…    10     Ders Kartlarının Günlere Dağılımı: 17) * En Fazla Ardışık Ders Günü … 3>2
5x                           50     Haftalık En Fazla Şartlı Periyotlar: 1
```

Dört şey birden yapıyor ve dördü de bizde eksik: ihlali **numaralıyor**
(`15)`, `17)`), **ölçüyü yazıyor** (`3>2`), **kaç kez olduğunu sayıyor**
(`2x`), ve **puanlıyor**. Toplam tek bir sayı (`365`) — yani bir programın
kalitesi tek bir rakamla karşılaştırılabiliyor.

Bizim `Kontrol`'ümüz ihlalleri listeliyor ama saymıyor, ölçmüyor, puanlamıyor.
`59`'daki ağırlık kademeleriyle birlikte okununca ikisi tek bir sistem:
**ağırlık girdide, puan çıktıda.**

### 4c · `İstatistik` — "pencere" birinci sınıf bir ölçü

```
Öğretmenler 45 · Tamamlanmamış 26 · Sınıflar 27 · Kartlar 809
Yerleştirilmemiş Ders Bloğu 65 · Yanlış Yerleştirilen Kartlar 0
Pencerelerin Toplam Sayısı   147
Ortalama Pencere Sayısı      3,266667
Öğretmenin Maksimumu         8
En Çok Pencere Sayısı        3
Sıkışık Öğretmenler          1  /  2
```

Sağdaki tabloda her öğretmen: `Tam Adı · Ders · Şartlı · En Fazla · Bir
Gündeki Dağılım (4/5/6/5/2) · Nöbet/Gözetim ×2`.

**"Pencere" = boşluk**, ve aSc onu bir kalite ölçüsü olarak sayıyor. CLAUDE.md
kova 1c'de *"çözücünün kalite ölçümü zaten bunu bekliyor"* yazılıydı —
rakipte ölçünün kendisi var.

---

## 5 · Baskı — kova 1b'nin tamamı

Ön izleme **kendi şerit sekmesini** açıyor (`Yazdır Önizleme`):

```
Önceki/Sonraki Sayfa · Yazdır▾ · [Raporunuzu Seçin] · Sayfa: 1/27 · Filtre
Genel Ayarlar · Tablo Yapısını Değiştir · Ekstra Satır/Sütun · Bilgi
Sayfa Yapısı · Design: Standard · Renkler · Ön İzlemeyi Kapat
```

| Dosya | Ne var içinde |
|---|---|
| `70-yazdir-menu` | `Yazdır (Ctrl+P) · Yazıcı Ayarları · Ön İzleme` |
| `74-baski-onizleme` | Bir sınıfın sayfası. Gruplar **bölünmüş hücre** olarak (`Group 1`/`Group 2`, kesikli ayraç, `Boys`/`Girls`) |
| `75-rapor-listesi` | Rapor ailesi |
| `77-tablo-yapisi` | **Rapor Özelliklerini Yazdır** — satırda/sütunda/sayfada ne olacağı |
| `78-rapor-eksen-secenekleri` | Eksene konabilecek dokuz şey |
| `79-baski-design` | **Dizayn** penceresi |
| `80-toplu-carsaf-ogretmenler` | Özet çarşaf liste, öğretmenler |
| `81-genel-program-poster` | Duvar posteri, sınıflar |

### 5a · Rapor ailesi — `sozluk.tsv`'den çözüldü

Açılır liste kaydırılamadı; kesin liste sözlükten alındı (id'ler yazılı):

| id | EN | TR |
|---|---|---|
| 1006 | Timetable for each class | `Tablo Olarak : Sınıflar` |
| 1005 | Timetable for each teacher | `Tablo Olarak : Öğretmenler` |
| 1295 | Timetable for each classroom | **`Tablo Olarak : Derslikler`** |
| 2849 | Timetable for each subject | **`Tablo Olarak : Dersler`** |
| 1004 | Summary timetable of classes | `Toplu Çarşaf Liste : Sınıflar` |
| 1002 | Summary timetable of teachers | `Toplu Çarşaf Liste : Öğretmenler` |
| 1294 | Summary timetable of classrooms | `Toplu Çarşaf Liste : Derslikler` |
| 1311 | **Wall poster** | `Genel Program` |
| 1312 | Wall poster of classes | `Sınıfların Genel Programı` |
| 1313 | Wall poster of teachers | `Öğretmenlerin Genel Programı` |
| 1314 | Wall poster of classrooms | `Dersliklerin Genel Programı` |

> **İKİ AÇIK ROBODERS SORUSU BURADA KAPANDI.**
> [ROBODERS.md](../ROBODERS.md) *"derslik programı raporu — bizde YOK, yeni
> aday"* ve *"ders bazlı rapor — ne olduğu belirsiz, ekran görülmeden
> yazılmaz"* diyordu. aSc'de ikisi de var ve ikisi de adlandırılmış:
> `Tablo Olarak : Derslikler` ve `Tablo Olarak : Dersler` (branş başına
> program). **İki rakip, aynı iki rapor.**

> **`Genel Program`'ın İngilizcesi `Wall poster`.** CLAUDE.md kova 1'de
> *"Babanın duvara asacağı şey muhtemelen bu"* diye yazılmıştı; rakip ona
> harfiyen "duvar posteri" demiş.

**İki özet biçimi var ve farkları amaç:**

| | `Toplu Çarşaf Liste` | `Genel Program` (poster) |
|---|---|---|
| Hücre | tek kod (`7.D`) | branş + derslik + öğretmen + grup |
| Sayfa | 5 | 12, döşenerek tek poster |
| İşi | elde tutulan özet | duvara asılan |

> **Bizim ana ızgaramız zaten `Toplu Çarşaf Liste`nin kendisi** — satır =
> öğretmen, sütun = gün × saat, hücre = sınıf. Eksik olan bir özellik değil,
> onu **kâğıda basmak**: bugün yalnız sınıf/öğretmen başına ayrı sayfa
> basıyoruz. `B3.5` bu yüzden düşündüğümüzden ucuz.

### 5b · `Rapor Özelliklerini Yazdır` — kova 1a'nın "baskıda çeşit"i

Üç eksen, her biri **üç kademeye kadar**:

```
Sayfa   : [Sınıf]  [ ]  [ ]
Sütunlar: [Saat ]  [ ]  [ ]     ☑ Sayfa Genişliğinde Sığdır   ☐ Boş Sütunları Gizle
Satırlar: [Gün  ]  [ ]  [ ]     ☑ Sayfa Yüksekliğinde Sığdır  ☐ Boş Satırları Gizle
Hücreler: [Kartları Blok Olarak Yazdır]
```

Eksene konabilecekler: **`Gün · Saat · Haftalar · Dönemler · Sınıf ·
Öğretmen · Ders · Derslik · Öğrenci`**.

Pencerenin kendi metni baskı tasarımının düzenleme yolunu da söylüyor:
*"Rapor Üzerinde Program Tablosundaki Hücreye **Sağ Tıklayarak** Açılan
Menüden Hücre İçindeki Değerleri de Ayarlayabilirsiniz."*

### 5c · `Dizayn` penceresi

`Tasarımı Seç` — *"5.A için mevcut tasarım"*, yani **varlık başına** tasarım ·
☐`Yazdırma Logosu` · `Başlık ve Dipnot` (başlık + *"ders programının altındaki
yazı, oluşturulma gününü yazdırmak için boş bırak"*) · `Tasarım Yönetimi: yeni`.

Diskteki hazır tasarımlar (`C:\TimeTables\designs\`): `Sample Blue` ·
`Sample Blue 2` · `… with Legends` · `… with Lessons table` · `Sample Green` ·
`Sample Grey` · `Sample Handwritten` · `general` · `internal_table` ·
`internal_table_sk` · `internal_table_teacher`.

ASC.md'de `def.xml`'in **biçimi** zaten çözülmüştü; bu turda **arayüzü** de
eşleşti. Kova 1b artık hem model hem ekran olarak haritalı.

---

## 6 · Baskı — bir HÜCRENİN içi (turun en değerli ekranı)

`Rapor Özelliklerini Yazdır` penceresi kendi metninde yolu söylüyordu:
*"Rapor Üzerinde Program Tablosundaki Hücreye **Sağ Tıklayarak** Açılan Menüden
Hücre İçindeki Değerleri de Ayarlayabilirsiniz."* Sağ tıklandı.

| Dosya | Ne var içinde |
|---|---|
| `86-baski-hucre-sag-tik` | **Yazıcı Ayarları** — tek saatlik bir hücrenin biçimi (`Uzunluk: Tekli`) |
| `87-baski-hucre-yazi` | O parçanın **yazı tipi** penceresi |
| `88-baski-hucre-blok` | Aynı pencere, **iki saatlik** bir hücrede (`Uzunluk: İkili`) |
| `89-ekstra-satir-sutun` | Tabloya fazladan satır/sütun |
| `90-genel-ayarlar` | Rapor geneli |
| `91-sayfa-yapisi` | Kâğıt yönü ve sayfaya kaç program |
| `92-renkler` | Rapor başına renk ve çizgi ayarları |

### 6a · Hücre modeli — YEDİ parça, her biri dört ayarlı

Pencerede canlı bir **önizleme kutusu** var: gerçek hücre (`Et`, sağ altında
`Ol / Ch`) orada çiziliyor ve ayar değiştikçe değişiyor. Yani WYSIWYG.

Yedi içerik parçası, her biri açılıp kapanabiliyor:

```
☑ Ders          ☐ Tam Adını Yazdır      Pozisyon 3×3     [Yazı]
☑ Öğretmen      ☐ Tam Adını Yazdır      Pozisyon 3×3     [Yazı]
☐ Sınıf                                 Pozisyon 3×3     [Yazı]
☑ Grup          ☑ Bütün Sınıf İse Yazdırma        Pozisyon 3×3   [Yazı]
☑ Derslik       ☑ Sınıfın Dersliğiyse Yazdırma    Pozisyon 3×3   [Yazı]
☐ Toplam Saat
☐ Zil
```

Her parçanın dört ayarı var:

1. **Görünür mü** (onay kutusu)
2. **Kısa mı tam mı** (`Tam Adını Yazdır`)
3. **Hücrenin neresinde** — 3×3'lük bir ızgara, yani **dokuz konumdan biri**
4. **Kendi yazı tipi** — `Yazı` düğmesi: font ailesi (`Arial`), `Bold` ·
   `Italic` · `Underline`, ve **`Yazı Boyutu` bir YÜZDE** (ölçülen: `%26,1`),
   punto değil. Yani hücre büyüyünce yazı da büyüyor.

Altta `Tümüne Uygula` · `Yazıyı Güncelle` · `Varsayılan` · `Varsayılan: Tümü`.

### 6b · İki akıllı bastırma kuralı — ve ikisi de bizde YOK

```
☑ Grup    : "Bütün Sınıf İse Yazdırma"
☑ Derslik : "Sınıfın Dersliğiyse Yazdırma"
```

Yani grup adı yalnız **bölünme varsa**, derslik yalnız **sınıfın kendi
dersliği değilse** basılıyor. Gürültüyü kaynağında kesen iki kural, ve
ikincisinin bizde doğrudan karşılığı var: `ClassGroup.roomId` sınıfın sabit
alanı, yani bizim kâğıdımızda derslik **her hücrede tekrarlanabilir** bir
bilgi. Bu iki satır, "kâğıtta ne yazsın" sorusunun en ucuz cevabı.

### 6c · BİÇİM BLOK UZUNLUĞU BAŞINA AYRI

Aynı pencere tek saatlik hücrede `Uzunluk: Tekli`, iki saatlik hücrede
**`Uzunluk: İkili`** yazıyor. Yani bir saatlik kart ile iki saatlik kartın
kâğıttaki biçimi **ayrı ayrı** ayarlanıyor — geniş bir hücreye daha çok şey
sığdığı için mantıklı, ve `Tümüne Uygula`'nın neyi kapsadığını da açıklıyor.

Model bir bütün olarak:

```
(blok uzunluğu) × 7 parça × (görünür · kısa/tam · 9 konumdan biri · kendi yazısı)
```

### 6d · Rapor geneli, kâğıt ve renk

**`Genel Ayarlar`** — ☐`Günler Sütunlar İle Temsil Edilir` (**eksen çevirme**,
tek onay kutusu) · `Başlık Yazısı` · ☐**`Renkli Baskı`** · `Nöbet/Gözetim`
baskısı üç seçenek · alt yazı (*"oluşturulma gününü yazdırmak için boş bırak"*).

**`Sayfa Yapısı`** (`Çıktı Boyutlarını Tanımlayın`) — **yatay / dikey**, ve
`Normal · 4'ü 1 Sayfada · **Sayfa Başına Sayıları Belirtin** (genişliğe göre N
× yüksekliğe göre M)`. Bizim *"bir A4'e 1, 2 ya da 4 program"*umuzun
genelleştirilmiş hâli.

**`Ekstra Satır/Sütun`** — dörde kadar fazladan sütun ve dörde kadar fazladan
satır; her birinin etiketi, üst bilgi metni ve genişliği. Bir okul formuna
"Notlar" sütunu ya da bir imza satırı eklemenin yolu.

**`Renkler`** (ve başlığı *"…raporu için renkleri düzenle"*, yani **rapor
başına**):

- ☐`Renkli Baskı` · `Font Rengi` · dört kenar boşluğu kutusu
- ☐**`Rengi Sadece Sol Üst Köşeye Yazdır`** — rengi hücreyi doldurarak değil,
  köşede küçük bir işaret olarak basmak
- ☐`Baskı Rengi Sadece Sol Kısımda`
- `Çizgi Genişliği`: `Dış Hatlar` · `İç Hatlar` · **`Günler Arasında Hatlar`**
  (*"özet ders programlarında kullanılmış"*)
- ☐`Satır Başlığını Renkli Yazdır` · ☐`Sütun başlığını renkli yazdır`
- ☐`Arka planı renkli yazdır` + `Gözat` → bir **arka plan resmi**
- ☐`Tüm tasarım için bir font kullan`

> **`Rengi Sadece Sol Üst Köşeye Yazdır` bizim için ölçülmeye değer.** Bizim
> kâğıdımız hücreyi renkle **dolduruyor** ve palet iki temada da aynı,
> yazdırma hep açık palet (CLAUDE.md). Köşe işareti hem mürekkep hem okunurluk
> tarafında bir seçenek, ve rakip onu bir ayar olarak sunmuş.

---

## 7 · Bu turda GÖRÜLMEYEN — ve tahmin edilmeyecek

Dürüstlük şartı (CLAUDE.md): çekilmemiş ya da bakılmamış hiçbir ekran
"belgelendi" sayılmaz.

| Ne | Neden |
|---|---|
| `Danışman`'ın **uyarı metinleri** | Demo1 kusursuz, danışman *"kritik sorun görmüyor"* dedi. Uyarılar `u60-verification`'da yazılı ama **ekranda görülmedi** |
| `Planlama Analizi`'nin **çıktısı** | Kendi metni *"bu işlem şu anki planlamayı değiştirecektir"* diyor. Çalıştırılmadı |
| `Otomatik Planlamayı Başlat` · `İyileştirme Uygula` · `Tabloyu Temizle` | Üçü de ızgarayı değiştirir; ızgara tur boyunca lazımdı |
| `Planlama Öncesi Kontrol`'ün **sonucu** | Yerleşimi silmeyi teklif etti, `Hayır` denildi |
| `Seçmeli Dersler`'in **içi** | Kapıdan geçmek demoyu moda sokardı |
| `Bulut Tabanlı Planlama` · `İnternet Hesabı` | Ağa çıkar, ve ikisi de kova 6 |
| `Dersliklere Atama` · `Kart Kilitle` · `Kilit Aç` | Izgarayı değiştirir |
| Sağ tık menüsünün **alt menüleri** | `Görünüm ▸` · `Bul ▸` · `Zaman Tablosu ▸` · `Hızlı Değişiklik Yap ▸` açılmadı |
| `Sihirbaz`'ın **adımları** | İlk ekranı çekildi (`85`), adımlar gezilmedi — veri değiştirir |
| `Temel Bilgiler`'in `Ülke` ve `Program Türü` sekmeleri | Açılmadı |
| `Karşılaştırma` menüsünün **açtığı pencere** | Menü çekildi (`72`), içine girilmedi |
| `Dizayn` → `Tasarım Yönetimi: yeni` | Yeni tasarım oluşturmak demoya yazar |

---

## 8 · Turu yeniden koşmak

```powershell
.\scripts\asc-tur.ps1                    # 18 ekranlik taban tur
.\scripts\asc-adim.ps1 -Yol '401,36; 185,82' -Ad 40-gorunum-tanimla -TumEkran
.\scripts\asc-adim.ps1 -Sag '989,339' -Ad 86-baski-hucre-sag-tik -TumEkran
```

`asc-adim.ps1` bu turda yazıldı ve derin envanterin aracı: bir tıklama
dizisini sürer, sonra yakalar. Koordinatlar **ekran** koordinatı, 2560×1440'ta
ölçüldü (pencere büyütülmüş, köşesi `-8,-8`).

**Yöntem kör tıklama DEĞİL:** her adımda görüntü alınıp **okundu**, ve
sıradaki tıklamanın yeri o görüntüden ölçüldü. UI Automation aSc'de sıfır
kontrol görüyor (ölçüldü), yani başka yol yoktu. Bu turda iki kez işe yaradı:
`Planlama Öncesi Kontrol`'ün yıkıcı onayı ancak görüntüye bakılarak yakalandı
(`Hayır` denildi), ve bir açılır listenin kaydırılamadığı görülünce cevap
`sozluk.tsv`'den alındı.
