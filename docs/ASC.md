# ASC — aSc Timetables'ta ne var, bizde ne var, ve neden

Bu dosya projenin **özellik pusulası**: aSc'nin ne yaptığı, bizim ne yaptığımız,
ve aradaki farkın her biri için verilmiş karar.

**2026-08-30'da bu dosyanın çerçevesi İKİ KEZ değişti**, ve ikisi de kullanıcı
kararı. Önce bir *karar kaydı*ydı; gerekçesi o gün geçerli olan 5. ilkeydi
(*"bir dönem kullanılmadan özellik eklenmez"*). O ilke kaldırıldı ve hedef
%10'dan **%50'ye** çıktı. Sonra aynı gün **kurulum** ve **paylaşma** yasakları
da kalktı. Yani bu dosya artık "neyden kaçındık"ı değil **"%50 neresi"**yi
anlatıyor, ve asıl içeriği aşağıdaki **altı kova**.

Geriye üç şey kaldı ve bir özelliği ancak bunlar reddedebilir:

1. **Sunucu yok** (ilke 2) — hesap, şifre, oturum, yüklenen veri yok.
2. **Çalışırken internet gerekmez** (ilke 3) — ağa **yalnız tıklanınca** çıkılır.
3. **Yasak liste** — kullanıcı hesapları · bulut senkronizasyonu · mobil
   uygulama · yoklama · not girişi · öğrenci kaydı · takvim entegrasyonu.

Ve bir de yöntem kuralı: bir satırın `alındı` olması için **ölçülmüş** olması
lazım. Tuzak 65 ve 101 bunun için yazıldı — ölçülmemiş bir iddia kendini
doğrulayacak bir iş planı üretiyor.

**Bu dosya elle yazılır.** Altındaki `docs/asc/` üretilir; oraya elle bir şey
eklenmez (tuzak 93).

---

## Kaynaklar — üçü de bu makinede ölçüldü

aSc bu bilgisayarda kurulu: `C:\TimeTables\roz.exe`, **aSc Timetables 2027**,
Haziran 2026 derlemesi, **kayıtsız deneme sürümü** (her açılışta bir
"Continue" penceresi çıkıyor). Emülatör gerekmedi.

| Kaynak | Ne veriyor | Üreten |
|---|---|---|
| `docs/asc/sozluk.tsv` | **2940 arayüz metni**, EN ↔ TR. aSc'nin bir şeye ne DEDİĞİ | `node scripts/asc-sozluk.mjs` |
| `docs/asc/yardim/*.md` | **528 yardım konusu**, 19 bölüm. Bir şeyin ne YAPTIĞI | `node scripts/asc-yardim.mjs` |
| `docs/asc/ekran/*.png` | Ekranların ŞEKLİ | `scripts/asc-ekran.ps1` |

**Sözlük neden bu kadar ucuz geldi:** aSc bütün arayüzünü `C:\TimeTables\lang.asc`
adlı düz metin bir dosyada tutuyor ve dosyanın kendi başlığı *"You can edit this
file with any text editor"* diyor. 165 512 satır, ~50 dil, her kayıt numaralı.
Yani rakibin bütün özellik yüzeyi tek bir diyalog açmadan okunabiliyor.

**TR sütunu ayrıca değerli:** babanın ekranda okuduğu kelimeler onlar. Bizim
uyduracağımız bir çeviriden daha ağır basar — `Toplu Çarşaf Liste`, `Kartlar`,
`Kısıtlama` onun sözcükleri.

**Ekran görüntüleri neden yarı elle:** ölçüldü, aSc bir MFC uygulaması
(`Afx:00400000:…`) ve **UI Automation sıfır kontrol görüyor** — bulunabilen
buton sayısı 0. Menü ağacını körlemesine süren bir robot kendi başına bir proje
ve kırılgan bir proje olurdu. `asc-ekran.ps1` bir betiğin iyi yaptığı yarıyı
yapıyor (adlandırılmış demoyu aç, pencereyi öne al, yakala); tıklamayı, hangi
ekranın ilginç olduğunu bilen insan yapıyor.

**Türkçe demolar var ama BU DERLEMEDE AÇILMIYOR.**
`C:\TimeTables\demos\International\Turkey\` altında dokuz dosya duruyor ve
senaryolar tam bu ülkenin sorunları — `Genel Ders Programi` · `İkili Egitim` ·
`Meslek Lisesi` · `Secmeli Ders` · **`Yetersiz Derslik`** · `Cok Haftali` ·
`Cok Alanli` · `Aylik` · `Ozel Okul`. İkisi denendi, ikisi de aynı kutuyu
verdi: *"This file can be opened by a version that can be downloaded from
`http://www.ascturkiye.com/`"* — yani bu dosyalar **Türkiye sürümünü** istiyor,
kurulu olan uluslararası derlemeyi değil.

Açılan demolar: `demos/Demo1..4.roz` ve `demos/Tutorial/Training_01..10.roz`.
Ekran görüntüleri onlardan geliyor.

**TÜRKİYE SÜRÜMÜ — BOŞ VERİLDİ (2026-08-30, kullanıcı kararı).**
`ascturkiye.com`'da indirme bağlantısı yok; deneme bir **forma** bağlı
(`Call_DemoForm()`) ve form **ad-soyad, telefon ve e-posta** istiyor, yani bir
indirme değil bir satış temasının başlatılması. Bedeli karşılığına değmedi:
kaybedilen tek şey dokuz Türk demo dosyası, ve arayüz zaten Türkçeleşti.

**ARAYÜZ ARTIK TÜRKÇE, ve uluslararası derleme bunu kendi başına yapıyor.**
Yardım şeridi → `Language` → `Turkish`. Ölçüldü:

```
HKCU\Software\aSc\aSc Rozvrhy\Language   Lang0 :  e  ->  t
pencere başlığı   "aSc Timetables 2027" -> "aSc k12 Bilişim Ders Planlama 2027"
```

Yani program Türkçeye geçince **kendi adını da** değiştiriyor. Sekmeler:
`Ana Menü · Dosya İşlemleri · Tanımlama İşlemleri · Görünüm · Planlama /
Yerleştirme · Arayüz Ayarları · Yardım`.

> **Ama Türkçe demolar hâlâ açılmıyor.** Dil değişikliğinden sonra yeniden
> denendi: aynı kutu, aynı adres. Demek ki o dosyaları kilitleyen şey arayüz
> dili değil, **derlemenin kendisi**.

> **EKRAN GÖRÜNTÜLERİNDE TÜRKÇE HARFLER BOZUK, ve suçlu aSc değil Windows.**
> Diyaloglarda `Kısıtlamalar` → `K�s�tlamalar`, `Öğretmenler` → `��retmenler`.
> Ölçüldü:
>
> ```
> HKLM\SYSTEM\CurrentControlSet\Control\Nls\CodePage   ACP = 65001
> Get-WinSystemLocale                                  en-US
> Get-Culture                                          tr-TR
> ```
>
> `ACP = 65001` demek, bu makinede Windows'un **"Unicode UTF-8 kullan (Beta)"**
> seçeneği açık. aSc Unicode olmayan eski bir MFC uygulaması: cp1254 bayt
> yazıyor, sistem UTF-8 bekliyor, Türkçe harfler düşüyor. Şerit düzgün çiziliyor
> çünkü orası başka bir yoldan geçiyor.
>
> **DÜZELTİLDİ — yeniden başlatma bekliyor (2026-08-30).**
> `scripts/asc-utf8-duzelt.ps1` yönetici olarak çalıştırıldı ve kod sayfaları
> Türkçeye çekildi:
>
> ```
> ACP    65001 -> 1254      OEMCP  65001 -> 857
> MACCP  65001 -> 10081     sistem yereli -> tr-TR (yeniden başlatmada geçerli)
> ```
>
> Yalnız beta'yı kapatmak yetmezdi: `en-US` altında ACP 1252 olur ve orada
> `ı ğ ş İ` yoktur — o yüzden sistem yereli de değişti. Geri alma:
> `scripts/asc-utf8-geri-al.ps1` (betik kendi yazdı, eski değerlerle).
>
> **AÇIK İŞ:** `docs/asc/ekran/` altındaki 18 görüntü **yeniden başlatmadan
> önce** çekildi, yani hâlâ bozuk harf taşıyor. Yeniden başlattıktan sonra
> `scripts/asc-tur.ps1` bir kez koşturulmalı.

---

## Karar tablosu — altı kova

Kısıtlamalar 2026-08-30'da **kullanıcı tarafından kaldırıldı** ve hedef %50'ye
çıktı, yani bu tablo artık "neyi reddettik"i değil **"%50 neresi"**yi anlatıyor.
Kaynak: 528 yardım konusu + 2940 arayüz metni + 18 ekran.

Kovalar:

| Kova | Ne demek |
|---|---|
| **1 · Kesin ekleyelim** | Karar verilmiş. Kısıtlama yok, tartışma yok |
| **2 · Eklenmeli, ama kısıtlama var** | İstiyoruz ve gerekli. Bedeli şema ya da mimari |
| **3 · Eklenebilir, ama kısıtlama var** | Faydası açık değil, bedeli belli |
| **4 · Eklenebilir** | Ucuz. Sıra gelince yapılır |
| **5 · Karar verelim** | Cevabı bende değil: babaya sorulacak ya da sizin kararınız |
| **6 · Kesin eklemeyelim** | Kalan üç ilkeyi ya da yasak listeyi bozuyor |

---

> **KARARLAR VERİLDİ (2026-08-30, kullanıcı).** Kova 1 · 2 · 3 · 4 **evet**,
> kova 6 **hayır**. Kova 5'in cevapları geldi: **seçmeli ders yok** · A/B
> haftası **olabilir** · **tek bina**. Türkiye sürümü **boş verildi**.
> Baskı tasarımları kova 3'ten **kova 1'e taşındı**: *"kesinlikle olması
> lazım."* Artı yeni bir başlık: **tuval davranışı** (aşağıda).

### 1 · Kesin ekleyelim

| Ne | Neden | aSc'de nerede |
|---|---|---|
| **Tuval davranışı — "Word gibi"** | Kullanıcı isteği, aşağıda ayrı başlık | ekranın sağ altındaki ölçek · `u65` |
| **Baskı tasarımları** | *"kesinlikle olması lazım"*. Modeli çözüldü, aşağıda ayrı başlık | `u61/u102` |
| **Kısıt motoru genişlesin** | *"gerekli constraintler olsun programda"*. Liste aşağıda | `u57` (97 konu) |
| **Paylaşma: e-posta · WhatsApp** | Baba istedi. **PDF ya da görsel**, hocalara **tek tıkla**. Bizim sunucumuz yok | bizde yeni |
| **Kurulum** | İlke 1'in yasağı kalktı; yarısı zaten var | `u56` |
| **Kontrol'e "Danışman" uyarıları** | Beşi de "neden dizilemedi"ye cevap: gün sayısından çok ders · kapasitesi aşılmış varlık · çok kapalı günü olan öğretmen · farklı boyda bloklar · özel derslik tanımsız | `u60` |
| **Özet çarşaf liste** | Bütün öğretmenler (ya da sınıflar) **tek sayfada**. Babanın duvara asacağı şey muhtemelen bu | `u61` |

#### 1a · Tuval davranışı — istenen şey ne

Kullanıcının kendi cümlesi: *"Programda ve baskı önizleme tarafında Word gibi
olması: sağa sola aşağı yukarı kaydırabilme, sağ aşağıda ölçeğin olması,
kendimizin zoom in zoom out yapabiliyor olmamız, neredeyse her şeyi
değiştirebiliyor olmamız."*

Beş parça, ve **ikisi bizde zaten yarım var**:

| Parça | Bizde şu an | Ne gerekiyor |
|---|---|---|
| **Serbest kaydırma** (yatay + dikey) | `.grid-wrap` yatayda kayıyor, öğretmen sütunu `sticky` | Dikey de aynı rahatlıkta, ve **sürükleyerek** kaydırma (orta tuş / boşluk+sürükle) |
| **Sağ altta ölçek göstergesi ve kaydırıcısı** | `--ui-scale` **Ayarlar → Görünüm**'de, altı düğme | Ölçek ızgaraya bakarken değişmeli. aSc'de sağ altta yüzde + kaydırıcı |
| **Zoom in / zoom out** | yok | `Ctrl` + tekerlek, `Ctrl +` / `Ctrl -`, ve `%100'e dön` |
| **"Neredeyse her şeyi değiştirebilme"** | kart metni sabit | aSc'nin `Görünüm → Tanımla`sı: **kartta ne yazsın** ve **hangi renge göre boyansın** seçilebiliyor (öğretmen / sınıf / derslik / branş) |
| **Baskıda çeşit** | sınıf sayfası · öğretmen sayfası · 1/2/4 kâğıt | Rapor **yapısı** seçilebilmeli: satırda ne, sütunda ne, sayfa başına ne |

**Ve bir kısıt burada geçerli, silinmedi:** `--ui-scale` **kâğıda geçmez**.
Ekranın ölçeği bir okuma tercihi, kâğıdın ölçeği ayrı bir ayar (`--p-zoom`),
ve ikisi karışırsa yazıcıdan çıkan şey ekrana bakan kişinin gözüne göre
değişir. aSc'de de öyle: ekran ölçeği ayrı, baskı ölçeği ayrı.

**Bir ölçüm borcu:** ızgara 2100 hücre ve satırlar `React.memo` ile sarılı
(tuzak 10). Sürekli bir zoom, her adımda yeniden düzen demek. Ölçülmeden
yazılmaz — `transform: scale()` ile mi yoksa `--cell-w` değiştirerek mi
yapılacağı **ölçülerek** seçilir; ikincisi metni yeniden sarar, birincisi
bulanıklaştırır.

#### 1b · Baskı tasarımı — modeli ÇÖZÜLDÜ

aSc'nin tasarımları `C:\TimeTables\designs\<ad>\def.xml`, ve biçim okunabilir
XML. Sayfa **binde bir** koordinatlarla bölünüyor (0–1 000 000), her kutu bir
`<PrintObject>`:

```
m_rect.left/top/right/bottom   binde bir cinsinden yer
m_text                         metin, DEĞİŞKEN içerebilir
m_strBmp                       resim (logo)
m_align                        9 konumdan biri
m_bgColor · m_fontColor · m_lineColor
m_lineTop/Bottom/Left/Right/Middle    kenarlıklar
font · fontheader · fontfooter
m_bAutoFont · m_bOnTop
```

**Değişkenler `lang.asc` kayıt numarası taşıyor**, ve sözlüğümüz onları
çözüyor — yani aSc'nin yer tutucu dağarcığının tamamı elimizde:

| aSc'de | Anlamı |
|---|---|
| `{#1035:#1635}` | **Sınıf : Tam Adı** |
| `{#1035:#1067}` | **Sınıf : Sınıfın Dersliği** |
| `{#1035:#1532}` | **Sınıf : Sınıf Öğretmeni** |
| `{#1048:#1635}` | **Öğretmen : Tam Adı** |
| `{#3148:#1166}` | **Okul : Okulun Adı** |
| `{#3148:#1167}` | **Okul : Öğretim Yılı** |
| `{#3148:#4055}` | **Okul : Okul Logosu** |
| `{sum}` | toplam |

Yani bizim yapacağımız şey uydurulacak bir şey değil: **okul adı · öğretim
yılı · logo · sınıf adı · sınıfın dersliği · sınıf öğretmeni · öğretmen adı**.
Bu liste `docs/asc/sozluk.tsv`'den çözüldü, tahmin edilmedi.

**Nasıl düzenleniyor (aSc'de):** baskı önizlemede **sağ tık** → o parçanın
kendi ayar penceresi; **sol tuşla sürükleyerek** parçaları yeniden boyutlama.
Tasarımın kendisi ayrı: `Edit design`. Bizim için doğru yer aynı — önizleme
zaten **kâğıdın kendisi** (2026-08-26'da ölçülerek öyle yapıldı), yani
üstünde düzenlemek kâğıdı düzenlemek demek.

**Ve kâğıt sözleşmesi burada da duruyor:** A4 yatay · `@page { margin: 0 }` ·
205 mm sabit sayfa · `table-layout: fixed` (tuzak 31). Serbest tasarım o
sözleşmenin **içinde** yaşar: logo, başlık, künye, kenarlık ve ekstra sütun
serbest; sayfanın fiziksel kutusu değil.

#### 1c · Kısıt listesi — programa girecekler

Bizde şu an 7 sert + 3 ayarlanabilir kural var. aSc'nin 97 konusunda tekrar
tekrar çıkan ve bizde karşılığı olmayanlar:

| Kısıt | Not |
|---|---|
| **Boşluk (pencere) kuralları** | En büyük aile. Öğretmenin arada boş saati, sınıfın boş saati, "günde en fazla N boşluk", "2 uzunluğunda boşluk olmasın". Kontrol'ün `sınıfta boşluk var` uyarısı da buradan. **Çözücünün kalite ölçümü zaten bunu bekliyor**: bir öğretmen geldiği günlerin %87'sinde boş saat bekliyor |
| **Kartlar arası ilişki** | "Şu iki ders peş peşe olmasın" · "aynı gün olmasın" · "Biyoloji, Kimya'nın ertesi günü olmasın" · "çift dersler tek derslerden önce" · "iki sınıfta aynı saatte olsun" |
| **Sınıf için günlük min/max** | Bizde `minPerDay` var ama **yalnız raporda**; yerleştirmede yok |
| **Aynı dersten günde iki tane: ardışık olsun / olmasın** | Bizde "günde en fazla N" var, ardışıklık yok |
| **Belirli ders belirli konumda** | "Coğrafya son ders olsun" · "sınıf en fazla bir tane 7. ders görsün" · "beden sabah olmasın" |
| **Öğretmen: günde en fazla N farklı sınıf** | |
| **Çift ders belirli günde ya da belirli molada olmasın** | |

---

### 2 · Eklenmeli — ama kısıtlama var

| Ne | Kısıtlama | Karar |
|---|---|---|
| **Gruplar / bölünmeler** | **`State` şeması değişir.** `placements` anahtarı `sınıf\|gün\|saat` → bir hücreye **tek** ders; bölünme aynı hücrede iki ders demek. Anahtarın şekli, `sanitize()`, cascade silme, `blocker()`'ın altı kuralı ve çözücünün tamamı etkilenir. `schemaVersion` 12 + göç kodu | **YAPILACAK.** Kullanıcı: *"seçmeli ders vesaire yok ama olsun."* Yani gerekçesi seçmeli değil: bölünme kendi başına isteniyor (beden kız/erkek, yabancı dil grubu) |
| **aSc'den içe aktarma (XML)** | aSc'nin XML şeması geniş, ama **yalnız okumak** yetiyor. `.roz` ikili — yol aSc'nin kendi dışa aktarması | **YAPILACAK.** Karşılığı büyük: babanın gerçek verisi |
| **Excel'e / HTML'e dışa aktarma** | Excel gerçek bir dosya biçimi ister; HTML ucuz | **YAPILACAK**, HTML önce |
| **Çok haftalı (A/B haftası)** | Şema + ızgaranın ekseni + baskı. Büyük | **BELKİ** — kullanıcı: *"olabilir"*. Gruplardan sonraya |

---

### 3 · Eklenebilir — ama kısıtlama var

Baskı tasarımları buradan **kova 1'e taşındı**.

| Ne | Kısıtlama | Karar |
|---|---|---|
| **Ders başına derslik** (önceliklendirme, paylaşılan derslik, kapasite) | Bizde derslik **sınıfın sabit alanı**, ders seçmiyor. Değiştirmek `Lesson`'a alan ekler ve kısıt 6–7'yi yeniden yazar | **evet** (kova 4'ün ardından) |
| **Nöbet** | Yeni varlık, ve kâğıda da çıkması gerekir | **babaya sorulacak** |
| **Öğrenci bazlı program** | Yasak listede **öğrenci kaydı** var; seçmeli ders yönetimi öğrenci listesi ister | **hayır** — seçmeli ders zaten yok |
| ~~Binalar~~ | — | **HAYIR.** Kullanıcı: *"tek bina"* |

---

### 4 · Eklenebilir

Hiçbirinin şema ya da mimari bedeli yok. **Onaylandı**, sıra gelince yapılır.

- **Özel alanlar** (öğretmene/sınıfa serbest not alanı) — baskı tasarımının
  değişkenleri de buradan besleniyor
- **Sınıf öğretmeni** alanı — tasarım yer tutucusu `{Sınıf : Sınıf Öğretmeni}`
  bunu istiyor
- **Okul adı ve öğretim yılı** — `{Okul : Öğretim Yılı}` için gerekli
- **Okul logosu** — tasarımın `m_strBmp`'i
- **Ders kopyalama** ve **toplu ders ekleme**
- **Öğretmen ad biçimi** (Ad Soyad / Soyad Ad)
- **Kısayol tuşları** listesi ve bir yardım ekranı
- **İki programı karşılaştırma** (plan kitaplığı zaten var)
- **Ders ızgarası**: sınıf × branş matrisini tek ekranda doldurma
- **0. ders** — bizde saat etiketleri zaten serbest metin
- **Geçen yılın verisini yeniden kullanma** — kitaplık + kopyala bunu yapıyor

---

### 5 · Karar verelim — CEVAPLAR GELDİ

| Soru | Cevap |
|---|---|
| Seçmeli ders var mı | **YOK.** Ama gruplar yine de yapılacak (kova 2) |
| A/B haftası | **Olabilir** — gruplardan sonra |
| Kaç bina | **Tek bina** — binalar özelliği düştü |
| Türkiye sürümü | **Boş verildi** |
| Windows UTF-8 beta | **Düzeltilecek** — `scripts/asc-utf8-duzelt.ps1` |
| Paylaşmanın sınırı | **PDF ya da görsel**, e-posta ve WhatsApp, hocalara **tek tıkla**. Bağlantı yok, yani ilke 2 geri gelmiyor |
| **Vekil öğretmen (Substitution)** | **HÂLÂ AÇIK** — babaya sorulacak. aSc'de 62 konu |
| **Nöbet** | **HÂLÂ AÇIK** — babaya sorulacak |

---

### 6 · Kesin eklemeyelim

| Ne | Neden |
|---|---|
| **aSc'nin "Sharing"i / TimeTables Online** | Veriyi bulut hesabına yükler, öğretmene ve veliye **hesap ve şifre** açar. İlke 2 + yasak listedeki "kullanıcı hesapları". Bizim paylaşmamız bambaşka: bir dosya, tek tıkla, sunucusuz |
| **Bulut jeneratörü** | Programı sunucuda çözer. İlke 2 ve 3 |
| **Mobil uygulama** | Yasak listede |
| **Yoklama · not girişi · öğrenci kaydı** | Yasak listede. Ayrı bir program |
| **AI modülü** | Ağa çıkan bir hizmet. İlke 3 |
| **EduPage · Smartschool · iSAMs entegrasyonları** | Başkasının okul yönetim sistemi |
| **Veritabanı senkronizasyonu** | İlke 2 |

---

### Bir adlandırma tuzağı — tabloyu okurken

aSc'de **`Dersler` = branş** (Matematik, Tarih…). Bizim `Dersler`imiz sınıf +
öğretmen + haftalık saat; aSc'de onun karşılığı listelerin içindeki
**`Ders Atama`** düğmesi. Aynı kelime iki programda iki şey — karşılaştırma
yazarken karışırsa tablo sessizce yanlış olur.

---

### Bölüm haritası — nereden geldi

Sayılar hasat edilen konu sayısı; `Kova` yukarıdaki tabloya işaret eder.

| Konu | Bölüm | Kova |
|---|---|---|
| 137 | Data input | 1 · 2 · 4 — dört listemiz var; gruplar, seçmeli ve çok haftalı eksik |
| 97 | Constraints | **1** — genişleyecek |
| 62 | Substitutions / cover | **5** — babaya |
| 48 | Printing | 1 · 3 — özet çarşaf alınacak, serbest tasarım kısıtlı |
| 24 | Working with timetable | büyük ölçüde **var** |
| 23 | Timetables online | **6** |
| 21 | What's new | ilgisiz |
| 18 | Student based timetable | **3** |
| 14 | Verification | **1** — Danışman uyarıları |
| 14 | Exporting / Importing | **2** |
| 13 | Timetable Generation | kısmen var; kısıt gevşetme **2** |
| 12 | Sharing | **6** (aSc'ninki) · **1** (bizimki) |
| 9 | Testing | **var** |
| 9 | Supervisions | **5** |
| 8 | First steps | **1** — kurulum |
| 8 | Other | ilgisiz |
| 6 | Cloud generator | **6** |
| 3 | Mobile application | **6** |
| 2 | AI modul | **6** |

---

## Kısıtlar — bizde ne var

Şu anki motor: 7 sert kural + 3 ayarlanabilir. Genişleme listesi kova 1'de.

| aSc'de | Bizde | Not |
|---|---|---|
| Time-off (öğretmen/sınıf/derslik) | `unavailable` sözlüğü | Üç varlık tek sözlüğü paylaşıyor |
| Max consecutive periods | `limits.maxConsecutive` | Kapalı / Uyar / Engelle |
| Max periods per day | `limits.maxPerDay` | Öğretmen kutusu okulu ezer |
| Min periods per day | `limits.minPerDay` | **Yalnız Kontrol'de**, yerleştirmede değil |
| Max same subject per day | `maxSameLessonPerDay` | Bizde **üç katmanlı**: ders → sınıf → okul |
| Distribution over the week | `Lesson.blocks` | aSc'nin kaydırıcısı yerine blok listesi |
| Card locking | `State.pinned` | Bizde hücreye bağlı |


## Ekran envanteri — 18 görüntü, hepsi Türkçe arayüzde

`scripts/asc-tur.ps1` tam turu koşar ve `docs/asc/ekran/` altına yazar. Tur
bittiğinde **kendini denetler**: iki görüntünün MD5'i aynıysa bir tıklama
kaçmıştır ve uyarı basar — hiçbir şeyi sorgulayamayan bir gezginin tek
güvenlik ağı bu.

| Dosya | Ne var içinde |
|---|---|
| `10-serit-ana-menu` | Ana ızgara + alttaki kart tepsisi. aSc'nin ana ekranı |
| `11-serit-dosya-islemleri` | Aç · kaydet · içe/dışa aktarma |
| `12-serit-tanimlama-islemleri` | Sihirbaz · Temel Bilgiler · **Dersler · Sınıflar · Derslikler · Öğretmenler** · Seçmeli Dersler · Planlama İlişkileri · Tanımlanan Kısıtlamaların Listesi |
| `13-serit-gorunum` | Görünüm seçenekleri |
| `14-serit-planlama-yerlestirme` | Çözücü: Test · Otomatik Planlamayı Başlat · Bulut · İyileştir · Analiz · Parametreler · Doğrulama · Danışman · İstatistikler · Kilitle/Kilit Aç |
| `15-serit-arayuz-ayarlari` | Arayüz ayarları |
| `16-serit-yardim` | Dil · eğitim · demo dosyaları |
| `20-temel-bilgiler` | Okul geneli tanımlar |
| `21-branslar` | aSc'nin **"Dersler"i = bizim BRANŞLAR'ımız.** Ad · kısaltma · toplam saat · dağılım |
| `22-siniflar` · `23-derslikler` · `24-ogretmenler` | Üç varlık listesi. **Her öğretmenin bir rengi var** — bizdeki gibi |
| `25-secmeli-dersler` | Seçmeli ders grupları. Bizde karşılığı yok |
| `26-planlama-iliskileri` | Kartlar arası ilişkiler. Bizde karşılığı yok |
| `27-kisitlama-listesi` | Girilmiş bütün kısıtlamaların tek listesi |
| `28-brans-ekle` | Branş ekleme formu |
| `29-brans-kisitlamalar` | **Branş kısıtlamaları** — içinde `t934`'ün anlattığı *"Ders Kartlarının Günlere Dağılımı"* kaydırıcısı |
| `30-ogretmen-ekle` | Öğretmen ekleme formu |

**Adlandırmada bir tuzak var ve çeviriden değil:** aSc'de **`Dersler` = branş**
(Matematik, Tarih…). Bizim `Dersler`imiz başka bir şey — sınıf + öğretmen +
haftalık saat. aSc'de onun karşılığı bir listenin içindeki **`Ders Atama`**
düğmesi. İki program aynı kelimeyi iki şey için kullanıyor; karşılaştırma
yazarken bu karıştırılırsa tablo sessizce yanlış olur.

---

## Ekranın kendisi ne söyledi

[10-serit-ana-menu.png](asc/ekran/10-serit-ana-menu.png) — aSc'nin ana ekranı,
Demo1 yüklü. Dört gözlem, ve üçü bizim mimarimizi **doğruluyor**:

- **Izgara + altta kart tepsisi.** Yerleşmemiş kartlar ekranın altında bir
  şeritte duruyor ve oradan sürükleniyor. Bizim havuzumuzun aynısı, aynı yerde.
  Havuzu alta koyma kararı (CLAUDE.md'de "sağda durdu, sonra alta alındı" diye
  yazılı) burada bağımsız olarak doğrulanmış oluyor.
- **Kart = renk + branş kısaltması.** Bizdeki gibi. Renk kimliğin taşıyıcısı.
- **Satır = sınıf, sütun = gün × ders.** Bu görünümde satır sınıf; bizde
  varsayılan satır öğretmen ve ikisi arasında geçiliyor. aSc de geçiyor
  (şeritteki `Whole` açılır listesi).
- **Çapraz bölünmüş kartlar = GRUPLAR.** Bir hücrede iki üçgen: aynı saatte
  sınıfın iki yarısı iki ayrı ders görüyor. Bizde bunun karşılığı **yok**, ve
  ekranda en görünür fark bu. Kursta karşılığı var mı — babaya sorulacak soru.

---

## Bu turda ölçülen ama kullanılmayan

- **`.roz` ikili bir format** (ZIP değil, `3a 01 00 00` ile başlıyor). Doğrudan
  ayrıştırılamaz. Ama `backup/*.ziptt` yedekleri **ZIP içinde** bir `.roz`
  taşıyor, ve aSc'nin kendi **XML dışa aktarması** var (14 konu). Babanın
  gerçek verisine giden yol muhtemelen orası; bu tur bilerek kapsam dışı
  bırakıldı.
- **UI Automation aSc'de çalışmıyor** (0 kontrol). Ölçüldü, yukarıda.

---

## Yeniden üretmek

```bash
node scripts/asc-sozluk.mjs                    # docs/asc/sozluk.tsv
node scripts/asc-yardim.mjs                    # docs/asc/yardim/*.md  (528 istek, önbellekli)
```

```powershell
.\scripts\asc-tur.ps1                     # tam tur: 18 ekran
.\scripts\asc-tur.ps1 -Sadece serit       # yalnız şerit sekmeleri
.\scripts\asc-tur.ps1 -Sadece diyalog     # yalnız veri pencereleri

.\scripts\asc-ekran.ps1 -Listele                      # demoları say
.\scripts\asc-ekran.ps1 -Demo Demo1 -Gec -Ad acilis   # aç, nag'i geç, yakala
.\scripts\asc-ekran.ps1 -Ad su-an                     # açık pencereyi yakala
```

`asc-tur.ps1`'in bütün koordinatları **2560×1440'ta ölçüldü**, pencere
büyütülmüş ve köşesi `(-8,-8)`. Ekran boyu değişirse yeniden ölçülmeleri
gerekir; belirtisi de yazılı — turun sonundaki *"aynı görüntüden birden fazla
var"* uyarısı.

**Nag penceresi İKİ kez çıkıyor** (komut satırından dosya verilince) ve
`Devam` düğmesi birkaç saniye geri sayımla kilitli. `-Gec` bu yüzden bir
sayaca değil **hedefe** bağlı: başlıkta belge görünene kadar düğmeye tıklar.
Enter kullanılmıyor — Türkçe kutu onu almıyor, ve kör Enter bir keresinde
"Türkiye sürümünü indir" kutusunun **bağlantısını** tetikleyip tarayıcı açtı.

Üçü de `npm run kontrol`'ün **parçası değil** ve bilerek öyle: `font`, `exe` ve
`patrol` gibi, bu depoda olmayan bir şeye bağlılar — biri aSc kurulumuna, biri
ağa. `kontrol`'ün sözleşmesi "her makinede koşar"dı.
