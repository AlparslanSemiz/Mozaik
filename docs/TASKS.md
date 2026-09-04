# TASKS — Yapılacaklar

İşaretler: `[ ]` bekliyor · `[~]` devam ediyor · `[x]` bitti ·
`[→]` arşivde duran ama **canlı hâli yukarıda** olan madde (numarası yazılı)

Yeni bir bilgisayarda başlıyorsan önce [STATUS.md](STATUS.md) sonundaki
**"Başka bir bilgisayarda devam etmek için"** bölümünü uygula.

**Bu dosya nasıl okunur:** üstte **açık işler**, altta **arşiv**. Arşiv
silinmez ve geriye dönük düzeltilmez — o bir günlük, kararların o gün geçerli
kuralla alındığını gösteriyor. Yeni iş hep §0'dan doğar, §1–§7'de numaralanır,
bitince §10'a taşınır.

---

## §0. NOT DEFTERİ — buraya yaz ✍️

> **Bu bölüm senin.** Aklına geleni buraya, olduğu gibi, düzeltmeden yaz.
> Sıraya, biçime, numaraya gerek yok. Her oturumun başında buradaki satırlar
> okunup **§1–§7'ye numaralı madde** olarak taşınır, ham hâlleri §9'a
> (Ham notlar) geçer — hiçbir satır silinmez.

<!-- ▼▼▼ BURADAN İTİBAREN YAZ ▼▼▼ -->

Babamın hata fotolarına bak, orada roboderste çalışan ama bizim programda çalışmayan bir program var. babam aynı hocaları aynı dersleri aynı müsaitlikleri girmiş ama bizim ders programı otomatik şekilde hiçbir ders kalmayacak şekilde oluşturamıyor. Bir programı otomatik dizmeye bastığımız vakit. Ne yapıp ne edip o programı ders kalmayacak şekilde dizmeli. Hiç mi hiç dizemiyorsa o zaman ders kalmalı ve uyarı vermeli. Bunu optimize etmeliyiz. Bir sıkıntı var gibi.

Ayrıca babam kendi bilgisayarındaki program section'unu da attı, oradan bak. Sığdır'da derslerin isimleri sığmıyor ve ... oluyor. Sınıftan kısmında da Sınıfların isimleri aynı şekil ... gözüküyor. Bunları düzeltelim.

Babamın windows'unda uygulamanın belgelerde ders programında değişiklik yapması yani o belirlediğmiz yerde değişiklik yapması windows güvenlik duvarı tarafından engellenmiş. Bu olmaması lazım bunu çözmeliyiz.

Ayarlarda nereye kaydedileceği vesaire klasörü bizim seçme imkanımız da olsun.






<!-- ▲▲▲ BURAYA KADAR ▲▲▲ -->
 
---

## İÇİNDEKİLER — hangi kısımda ne var

| Kısım | Ne var | Durum |
|---|---|---|
| **§0** | **Not defteri** — senin ham satırların | ✍️ boş, senin |
| **§1** | **HER ŞEYDEN ÖNCE** — aSc ve Roboders'in TAM incelenmesi | 🔜 4 açık (R6·R7·R8·R9), R1-R5·R7b bitti, R10 isteğe bağlı |
| **§2** | **Bölüm 2 — Ayarlar'ın kendi tasarımı** | 10 + 1 madde |
| **§3** | **Bölüm 3 — Çıktı ailesi**: görsel · PDF · Excel · e-posta/WhatsApp | 7 madde |
| **§4** | **Bölüm 4 — Tuval ve baskı tasarımı** (aSc kova 1) | 6 madde |
| **§5** | **Bölüm 5 — Kısıt motoru, çözücü ve Kontrol** | 6 madde, 5 bitti (B5.1·B5.2·B5.4·B5.5·B5.6) |
| **§6** | **Bölüm 6 — Veri modelini büyüten işler** (aSc kova 2–4) | 6 madde |
| **§7** | **Bölüm 7 — Dağıtım, Windows ve depo** | 7 madde |
| **§8** | **Karar bekleyenler** — sende, babada, ve babanın gerçek verisi | 6 + 4 + 11 |
| **§9** | **Ham notlar** — bütün satırların, nereye gittikleriyle | kayıt |
| **§10** | **ARŞİV** — biten turlar, tarih sırasıyla | kayıt |

**Bağımlılık zinciri — hangi bölüm hangisini bekliyor:**

```
§2  Bölüm 2 (Ayarlar tasarımı)     envanterden BAĞIMSIZ, paralel gidebilir


§1  aSc + Roboders TAM ENVANTER   <-- HER ŞEYDEN ÖNCE
        |
        |  R9: §3 · §4 · §5 · §6 · §7'yi bu tablodan YENİDEN türet
        v
§4  Bölüm 4 ──> B4.1 ÖLÇÜM (zoom: transform mü --cell-w mi)
                   |
                   +──> B4.2 tuval: PROGRAM ızgarası Word gibi
                   |
            B4.3 (okul adı · yıl · logo · sınıf öğretmeni · özel alanlar)
                   |   baskı tasarımının DEĞİŞKENLERİ
                   v
            B4.4 baskı tasarımları ──> §3 Bölüm 3 (çıktı aileleri)
                                              |
                                        B3.4 e-posta/WhatsApp
                                        (öğretmende tel + e-posta = ŞEMA v14)

§6  Bölüm 6 ──> B6.1 gruplar/bölünmeler (ŞEMA v14) ──> B6.3 A/B haftası
```

**§2 neden §1'i beklemiyor:** Ayarlar'ın kendi düzeni bir **tasarım** kararı ve
kaynağı senin kendi cümlen, rakip değil. Öteki her bölüm §1'den besleniyor.

---

## §1. HER ŞEYDEN ÖNCE — aSc ve Roboders'in TAM incelenmesi

> Senin satırın: *"her şeyden önce. tasklara ASC ve Robodersin tekrardan her
> inciği cıncığının feature'nın incelenmesi lazım."*
>
> **Bu bölüm öteki her bölümün önünde**, ve sebebi CLAUDE.md'de yazılı: 5.
> ilke (*"bir dönem kullanılmadan özellik eklenmez"*) 2026-08-30'da kaldırıldı
> ve yerine geçen şey **rakibin gerçekten yaptığı iş** oldu. Yani §3–§7'deki
> her madde bir yerden geliyor olmak zorunda; bu bölüm o "yer"in kendisi.
> Eksik bir envanterden türetilen bir yol haritası, tuzak 101'in ta kendisidir.

**Neyin eksik olduğu:** aSc tarafında bir **hat kuruldu** ama tam envanter
çıkmadı — 2940 arayüz metni ve 528 yardım konusu **dökümlendi**, 19 bölüm
tablolandı, ama özellikler tek tek *"bizde var / yok / almayacağız"* diye
işaretlenmedi. Roboders tarafında ise **hiç başlanmadı**.

### 1a · aSc — ikinci ve TAM tur

- [x] **R1 `scripts/asc-tur.ps1` yeniden koşturulsun. — BİTTİ (2026-08-31).**
      UTF-8 düzeltmesi uygulandı ve **yeniden başlatmadan sonra** doğrulandı
      (`WinSystemLocale en-US → tr-TR`, diyalog metni `Tanımlı Dersler`
      düzgün okunuyor — `docs/asc/ekran-envanteri.md` başındaki ölçüm).
      *(Eskiden B7.8'di.)*
- [x] **R2 18 ekranın ÖTESİNE geçilsin. — BİTTİ (2026-08-31).**
      `docs/asc/ekran-envanteri.md`: 79 ekran görüntüsü, altı bölüm derin
      analiz (Görünüm/kart tanımlama · liste pencerelerinin içi · kısıt
      ağırlıkları · çözücü ekranları · baskı ailesi · bir hücrenin baskı
      modeli). **Kalan bilerek görülmeyenler** o dosyanın *"7 · Bu turda
      GÖRÜLMEYEN"* bölümünde adlı adına yazılı (Danışman'ın uyarı metinleri,
      sihirbaz adımları, sağ tık alt menüleri, vb — hepsi demo verisini
      değiştirdiği için bilerek atlandı). Bu kalan liste küçük ve isteğe
      bağlı bir R2b turu olarak kalabilir, R3/R4'ün önkoşulu değil.
- [x] **R3 528 yardım konusu tek tek okunsun ve İŞARETLENSİN — BİTTİ
      (2026-08-31).** 5 paralel ajan (data input · kısıt motoru+çözücü ·
      baskı+kurulum+doğrulama+günlük kullanım · vekil+nöbet · kalan
      bölümler+sanity-check), 19 dosyanın **hepsi** baştan sona okundu.
      [ASC.md](ASC.md)'nin kova 1–6 tabloları ~30 yeni satırla genişledi;
      Vekil öğretmen ve Nöbet için ayrıca "evet denirse ne inşa edilir"
      spesifikasyonu yazıldı (§5a) — kova kararı hâlâ babada, ama cevap
      gelince iş beklemeyecek. Sanity-check turu "kova 6/ilgisiz" altı
      bölümde de iki gerçek eksik buldu (`u103`'ün dört toplu-düzenleme
      komutu, `u104`'ün "asistanlı ders" 2026 eklentisi) — "ilgisiz" etiketi
      tek yerde (u103) hatalı çıktı, düzeltildi.
- [x] **R4 2940 arayüz metni bir ÖZELLİK LİSTESİNE çevrilsin — BİTTİ
      (2026-08-31).** R3 ile birlikte yürüdü: her ajan kendi bölümüyle
      ilgili sözlük satırlarını da taradı (dictionary konu bazlı
      gruplanmadığı için ayrı bir tur yerine R3'e gömüldü). Yardım
      metninde geçmeyen ama sözlükte duran birkaç satır bulundu (`Substitutes
      → Yedekler` çakışması gibi), ayrı bir "kaçan özellik" listesi çıkmadı —
      2940 satırın ezici çoğunluğu zaten yardım metninde açıklanan
      özelliklerin arayüz karşılığıydı.

### 1b · Roboders — sıfırdan

**Adı `Roboders`**, `Robodersi` onun belirtme hâli. Bulgular:
[ROBODERS.md](ROBODERS.md).

- [x] **R5 Roboders NE, ve nasıl erişiliyor? — ÖLÇÜLDÜ (2026-08-31).**
      `roboders.com`: **web uygulaması**, bulut tabanlı, indirilen program yok,
      **hesap zorunlu** (demo bile), **5 gün ücretsiz deneme** (kredi kartı
      istemiyor), ücretli — aylık ₺1.499,99 / ₺2.999,99 / ₺4.649,99.
      Tanıtım sayfasının saydığı yetenekler ve bizimkilerle karşılaştırması
      [ROBODERS.md](ROBODERS.md)'de. **Tarayıcı açılmadan, yalnız web'den
      yapıldı.**
      **İlk gerçek bulgu:** onlarda **derslik programı raporu** var, bizde yok
      (→ R8'e aday). Ve **öğretmenlere e-posta ile dağıtım** onlarda da var,
      yani `B3.4` bir tahmin değil.

> ### ⛔ R6 SALT OKUNUR — İSTİSNASIZ
>
> **Hesaptaki veri babanın GERÇEK verisi.** Kullanıcı, 2026-08-31:
> *"sakın bir şeyleri değiştirme roboderste onlar babamın ve değiştirilmemesi
> gerekiyor asla. Yanlışlık bile yapma."*
> Bulut uygulaması: geri alma yok, yedek yok. **Serbest:** gezinme · menü
> açma · ekran görüntüsü · DOM okuma. **Yasak:** kaydet · sil · ekle · yeni ·
> dağıt · gönder · aktar · forma yazma · hücreye tıklama.
> Şüphe varsa **tıklanmaz, sorulur**. Tam sözleşme:
> [ROBODERS.md](ROBODERS.md) → *R6 güvenlik sözleşmesi*.

- [ ] **R6 Playwright ile gezilsin ve ekranları alınsın. HESAP VAR**
      (kullanıcı, 2026-08-31) — yani kayıt engeli ve 5 günlük sayaç **düştü**.
      Kalan iki şey erişim değil **yöntem**: (a) Playwright bu depoda
      `--headless` olmadan kurulu, yani **görünür bir pencere** açıp odağı
      alıyor — kullanıcı meşgulken koşturulamaz, zamanlaması sorulacak;
      (b) oturumu **kullanıcı kendi açar**, şifre sohbete yazılmaz.
      Çıktı `docs/roboders/ekran/`.
      **Turun eksiksiz olması aSc'dekinden önemli:** orada 528 yardım konusu
      dosya olarak elimizdeydi, burada geri dönüp bakılacak bir döküm **yok**.
- [ ] **R7 Özellik envanteri çıkarılsın** → [ROBODERS.md](ROBODERS.md)
      genişletilsin, [ASC.md](ASC.md)'nin deseninde: bölümler, ekranlar,
      kısıt karşılaştırması. R6'yı bekliyor.
- [x] **R7b Aramada çıkan üç satır DOĞRULANSIN ya da DÜŞSÜN — DÜŞTÜ
      (2026-08-31).** `nöbet`, `kulüp`, *"bir ana + birden çok yardımcı
      öğretmen"*: `site:roboders.com` kısıtlı arama üçü için de **sıfır**
      sonuç verdi, sınırsız aramadaki hiçbir kaynak `roboders.com` değildi
      (hepsi `eyotek.com.tr`'nin modül sayfaları). Ölçüldü ve doğrulandı:
      kaynakları **Eyotek**, Roboders'in kendi tanıtım sayfasında geçmiyor.
      Ayrıntı [ROBODERS.md](ROBODERS.md) → *Doğrulanmamış*.

### 1c · Birleştirme ve karar

- [ ] **R8 İki envanter TEK karar tablosunda birleşsin.** Her özellik için üç
      cevaptan biri: **bizde var** · **alınacak** (hangi bölüme, hangi madde
      numarasıyla) · **alınmayacak** (gerekçesiyle — ilke 1–3 mü, yasak liste
      mi, ölçülmemiş mi).
- [ ] **R9 §3–§7 bu tablodan YENİDEN türetilsin.** Bugünkü maddeler yalnız
      aSc'nin ilk turundan geliyor; tam envanter çıkınca sıra da, kapsam da
      değişebilir. Bu bölümün asıl çıktısı bir özellik değil, **öteki
      bölümlerin kendisi**.

### 1d · Diğer ilham kaynakları

- [ ] **R10 Word · Paint · Excel · PowerPoint · Adobe programlarından
      kullanılabilirlik ilhamı.** Senin satırın: *"Kullanım kolaylığı ve
      kullanım tarzı bakımından ASC'den, Robodersten, Word, Paint, Excel,
      Powerpoint, Adobe programları gibi yerlerden ilham alıp ona göre
      design'imizi ve kullanım kolaylığımızı en yukarı taşımalıyız."* Bu,
      §1'in aSc/Roboders envanterinden **ayrı bir soru**: oradaki envanter
      "hangi özellik" diye soruyor, bu ise "en tanıdık programlar bir işi
      nasıl kolay yapıyor" diye soruyor — bir özellik listesi değil bir
      **kullanılabilirlik dili** turu. Çıktısı [DESIGN.md](DESIGN.md)'ye
      yazılacak notlar (tasarım serbest, 2026-08-26 — burada da buyrulmaz,
      anlatılır). **§1'in çıkma şartını etkilemiyor** — paralel, isteğe
      bağlı bir tur.

> **Bu bölüm `npm run kontrol`'ün parçası değil ve olmayacak** — `font`, `exe`
> ve `asc-*` betikleri gibi, bu depoda olmayan bir şeye bağlı (aSc kurulumu,
> Roboders erişimi, ağ).

**Çıkma şartı:** `docs/ROBODERS.md` **tamamlanmış** · [ASC.md](ASC.md)'nin karar tablosu
her satırında bir karar taşıyor · §3–§7 o tablodan yeniden yazılmış.

---

## §2. Bölüm 2 — Ayarlar'ın kendi tasarımı

> Senin satırın: *"Ayarlar sectionunun kendine has kendi içinde simetrik olma
> koşuluyla designi olabilir. diğer yerlere uymasına gerek yok dizayn
> bakımından."*

Beş bölüm (`Zil ve günler · Kurallar · Görünüm · Planlar ve yedek · Hakkında`)
kendi düzenini alabilir. **Tek şart kendi içinde simetrik olması** — öteki
sekmelere benzemesi gerekmiyor, ve bu açık bir izin.

- [ ] **B2.1 Beş bölümün ortak iskeleti kararlaştırılsın.** Şu an her bölüm
      `.cols`'un genel kuralına uyuyor. Ayarlar'a özgü bir iskelet seçilecek:
      panel genişliği, başlık hizası, etiket/alan ekseni. Karar
      [DESIGN.md](DESIGN.md)'e **anlatılarak** yazılır, CLAUDE.md'ye
      buyrulmaz (tasarım serbest, 2026-08-26).
- [ ] **B2.2 Simetri ÖLÇÜLSÜN, iddia edilmesin.** Beş bölümün panel kutuları
      aynı sol kenardan başlamalı ve aynı genişlikte bitmeli; ölçüm
      `getBoundingClientRect` ile ve **hareket bittikten sonra**
      (tuzak 59 · 99).
- [ ] **B2.3 Üç ölçekte ve iki temada taşma sıfır olmalı.** %80 · %100 · %150,
      açık ve koyu. Yatay taşma 0, kırpılan kutu 0 (AB4'ün deseni).
- [ ] **B2.4 `.color-dot`'un sağında boşluk yok.** Ayarlar → Görünüm'ün
      `Örnek` tablosunda renk noktası ada yapışık duruyor (`●Mehmet Çelik`).
      Sınıf altı yerde kullanılıyor ve ikisi boşluğunu flex `gap`'ten alıyor,
      yani **çare çağrı yerinde**, paylaşılan sınıfta değil.
      *(AB turundan devreden tek madde.)*
- [ ] **B2.5 "Ayarlar → Hakkında'da sağa sola kaydırma olmasın" — ÖNCE ÖLÇÜL.**
      Senin satırın. AA2 ve AB3'ten sonra hâlâ var mı bilinmiyor; ölçülmeden
      kod yazılmaz (tuzak 101: ölçülmemiş bir iddia kendine bir iş planı
      üretir).
- [ ] **B2.6 Ekran görüntüsü kanıtı.** `npm run ekran`, iki temada beş bölüm,
      ve **bakılacak** — iddia edilmeyecek (tuzak 82).
- [ ] **B2.7 'Zil ve günler' ve 'Kurallar' Okul sekmesine mi taşınmalı? — §1
      BİTMEDEN KARAR VERİLMEYECEK.** Senin satırın: *"Ayarlardaki zil ve
      günler okul ile alakalı bir şey olduğuından okul sekmesine koymak daha
      mı mantıklı olur bunu düşünmek lazım. Kurallar sekmesi de aynı şekilde
      hem okul hem de daha çok öğretmenlerle ilgili onları da oraya
      alabiliriz belki. Bu düşünceler ASC ve Roboders'i tamtakır
      inceledikten sonra karar verilsin."* Kendi satırınla kilitli: §1'in
      (R1–R9) çıkma şartı sağlanmadan bu maddeye dokunulmayacak.
- [ ] **B2.8 Üç ek ekranda ölçek yeniden ölçülsün.** Senin satırın: *"Babamın
      ekranı 27 in. 1920x1080 60hz MSI MAG271C... Benimkisi ise 27 inç 2k.
      macbook m1 13 inç. thinkpad 16 inç. o sebeple her şeye uygun ama en
      çok da babama uygun olsun ölçeklemeler."* `--ui-scale` merdiveni
      (%80–%150) ve `SCALE_DEFAULT=1` babanın 1920×1080'ine göre zaten
      ölçüldü (CLAUDE.md "İlke 7"); eksik olan geri kalan üç ekranda (27"
      2K, MacBook M1 13", ThinkPad 16") aynı ölçümün **tekrarlanması** —
      `npm run ekran` + gerçek pikselde bakmak, tahmin değil.
- [x] **B2.9 Hakkında bölümüne "what's new" — YAPILDI (2026-08-31, kırk
      beşinci oturum).** Senin satırın: *"Ayrıca hakkında kısmında what's new
      gibi olmalı. babam her güncelleme alındığında neyin değiştiğini
      soruyor ben de pek hatırlamıyorum. orada nelerin değiştiği nelerin
      eklendiği yazmalı ve arşiv de olabilir."*
      **`.github/surum-notu.md` kaynak DEĞİL çıktı** — ölçüldü: tek seferlik
      statik metin (indirme/kurulum talimatları), birikimli değil, ve
      `dist/`'e hiç girmiyor, yani `file://` altında zaten okunamaz (ilke 3).
      Gerçek kaynak `src/changelog.ts` — `lang/*.ts` deseninde gömülü, elle
      düzenlenen tek bir veri dosyası. `Data.tsx`'e `Build`'in **yanına**
      ayrı bir panel eklendi (içine değil — `Build`'in başlığı dört E2E
      dosyasının locator'ı, tuzak 49/74). Güncel sürüm açık, eskiler
      `<details>` ile kapalı arşivde. Ayarlar sekmesinde görülmemiş-yenilik
      noktası (`hasUnseenChangelog()`, `ders-programi-yenilik-gorulen`),
      panel açılınca kalıcı olarak siliniyor. `scripts/yayinla.mjs`'e
      dördüncü bir kapı eklendi: `SURUM_NOTLARI[0].version` yayınlanan
      sürümle eşleşmiyorsa yayın durur. `e2e/surum.spec.ts` 79, dört dilde
      çeviri.
- [ ] **B2.10 Her Ayarlar bölümünün kendi alan/seçenek görünürlüğü —
      KALICI, KULLANICIYA AÇIK ÖZELLİK.** Senin satırın: *"Ayarlarda her
      sectionun görüntüsü değişebiliyor olsun. Seçenekler olsun açma kapama
      değiştirme gibi. Önizleme şeklinde görelim onları."* Netleştirmenle
      (2026-08-31) bu B2.1-B2.6'nın tasarım turu bağlamından farklı: geçici
      bir görüntüleme denemesi değil, babanın kendisinin her bölümde hangi
      alan/seçeneği göreceğini açıp kapatabildiği kalıcı bir özellik, ve
      seçim **önizlemeyle** yapılacak — renk seçicinin `<dialog>`'u ya da
      B4.4'ün "düzenleme yeri önizlemenin kendisi" deseni örnek alınabilir.
      **Netleşmesi gereken üç soru, kod yazılmadan önce:** (a) hangi
      bölümler/hangi alanlar kapsamda — beşinin de mi, yoksa hangileri; (b)
      tercih `State`'e mi girecek yoksa `theme.ts`'in dokuz bağımsız
      skaleri gibi bir MAKİNE tercihi mi (kapatılan bir alan başka bir
      bilgisayarda da kapalı mı kalmalı); (c) kapatılan bir alanın
      altındaki kural/veri hâlâ uygulanıyor mu, yoksa görünmeyen bir kural
      sessizce `Kapalı`ya mı düşüyor — bir görünüm tercihi verinin kendisini
      değiştirmemeli (tuzak 96'nın ailesi).

**Çıkma şartı:** `npm run kontrol` yeşil · beş bölümün iki temada görüntüsü
alınmış · ölçümler [STATUS.md](STATUS.md)'ye yazılmış.

### Yanında gidecek tek küçük madde — Ayarlar dışı

- [ ] **B1.6 Arama kutusu yazınca genişliyor.** Senin satırın: *"Arama kısmına
      bir şey yazınca arama bloğu genişliyor genişlemesin."* Bölüm 1'in
      artakalanı ve **B1.2 ile aynı şeride** dokunuyor (`ListTools.tsx`), o
      yüzden buraya alındı. Kutunun genişliği içeriğinden geliyor olmalı;
      sabitlemenin şeridi kısaltıp kısaltmadığı **ölçülecek** — B1.2'de tam o
      olmuştu (6,5 px, tuzak 94).

---

## §3. Bölüm 3 — Çıktı ailesi

> Senin satırların: *"Çıktıda eposta ve whatsapptan atma opsiyonu.
> Öğretmenlerin teli ve epostanın."* · *"Çıktıda ayrı ayrı birden fazla pdf
> oluşturma."* · *"Excele çıkartma."* · *"Görsel çıkartma"*

İlke 2 bozulmuyor ve sebebi yazılı (CLAUDE.md, 2026-08-30): paylaşılan şey bir
**dosya**, taşıyan şey işletim sisteminin kendi paylaşım yolu. Sunucu yok,
hesap yok, yüklenen veri yok. Ağ kuralı güncellemeninkiyle aynı: **yalnız
tıklanınca**.

- [ ] **B3.1 Görsel (PNG) çıkarma.** Bir programın kâğıt kutusunun resmi.
      **Ölçüm borcu:** `html2canvas` gibi bir bağımlılık mı, `<canvas>`'a elle
      çizim mi, `SVG → blob` mü. Üçü de `dist/index.html`'e gömülebilir olmak
      zorunda ve seçim **ölçülerek** yapılır (bağımlılık politikası,
      2026-08-26: eklendikten sonra dosya boyutu ve açılış süresi STATUS'e
      yazılır).
- [ ] **B3.2 Ayrı ayrı birden fazla PDF.** Şu an tek yazdırma işi çıkıyor;
      istenen her sınıf/öğretmen için **ayrı dosya**. Tarayıcı yolunda
      `window.print()` tek iş verir, yani bu madde exe yolunu da düşünmek
      zorunda — hangi teslim yolunun neyi verebildiği ölçülecek.
- [ ] **B3.3 Excel ve HTML'e çıkarma.** aSc karar tablosunda **HTML önce**,
      Excel sonra. HTML zaten elimizdeki DOM. Excel için `.xlsx` bir zip'tir,
      `.csv` düz metin — hangisinin istendiği sorulacak (§8).
- [ ] **B3.4 E-posta ve WhatsApp'tan gönderme — ŞEMA v14 İSTİYOR.**
      Öğretmene **telefon** ve **e-posta** alanı gerekiyor: `schemaVersion` 12
      + göç kodu + `sanitize()` dalı + hem birim hem E2E testi (CLAUDE.md'nin
      şema kuralı, tuzak 97). Gönderme yolu `mailto:` ve
      `https://wa.me/<numara>?text=` — ikisi de **tıklanınca** açılır, program
      kendiliğinden hiçbir şey göndermez.
      **Not:** bu aSc'nin "Sharing"i DEĞİL (o EduPage'e yüklüyor, hesap açıyor,
      şifre veriyor) ve o hâlâ yasak listede.
- [ ] **B3.5 Özet çarşaf liste** — bütün öğretmenler tek sayfada.
      aSc kova 1, *"kesin"* işaretli.
- [ ] **B3.6 Çıktıda simetri DOĞRULANSIN.** Senin satırın: *"Çıktıda her ama
      her zaman simetri çok önemli. Satırların uzunluğu genişliği vesaire hep
      aynı olmalı."* `table-layout: fixed` bunu iddia ediyor ama **ölçülmedi**.
      Dokuz baskı birleşiminde sütun genişlikleri ve satır yükseklikleri
      okunacak — ve pencere kâğıdın boyuna getirilecek (tuzak 86).
- [ ] **B3.7 Çıktı ekranının sağ panelindeki bazı seçenekler şeride
      taşınsın.** Senin satırın: *"Çıktı alanında sağdaki seçeneklerin
      bazıları alttaki şeride gidebilir, sağ tarafta yerden tasarruf etmiş
      oluruz."* Hangi seçeneklerin taşınacağı (sayfa seçimi mi, yazı boyu
      zoom'u mu) ölçülerek karar verilecek — sağ panelin ne kadarının
      boşaldığı `npm run ekran` ile kanıtlanacak (tuzak 82: bir kutudan
      içerik çıkarmadan önce ne taşıdığı sorulur).

> **Senden istenen:** çıktı ekranları için **örnek fotoğraf** — hangi çıktı
> biçimini istediğini gösteren bir görüntü, `docs/Örnek Fotolar/` altına.
> Senin kendi satırın bunu istememi söylüyordu.

---

## §4. Bölüm 4 — Tuval ve baskı tasarımı (aSc kova 1)

Tam tablo [ASC.md](ASC.md) → *Karar tablosu*, ayrıntı [PLAN.md](PLAN.md) → **v4**.
**Sıra önemli: B4.1 ve B4.3, ötekilerin önkoşulu.**

- [ ] **B4.1 ÖLÇÜM BORCU — ve turun İLK işi bu.** 2100 hücrede zoom
      `transform: scale()` ile mi `--cell-w` ile mi yapılacak. Ölçülmeden
      yazılırsa yanlış olan seçilir (tuzak 10 · 42 · 101).
- [ ] **B4.2 Tuval davranışı ("Word gibi") — ve bu ÖNCE PROGRAM ızgarası
      demek.** Senin satırın: *"Program tarafı da tuval gibi word gibi olsun
      hareket ettirme vesaire eğer olabiliyorsa."* Yani tuval bir baskı
      önizleme özelliği değil, **Program sekmesinin kendi davranışı**: serbest
      kaydırma (boşluğu tutup sürükleme) · **sağ altta ölçek kaydırıcısı** ·
      `Ctrl`+tekerlek zoom · kartta ne yazacağı ve neye göre boyanacağı
      seçilebilsin.
      **"Eğer olabiliyorsa" bir ölçüm kapısı, bir çekince değil** — B4.1'in
      cevabını bekliyor, ve orada ölçülecek olan tam da bu: 1950 hücre +
      367 kart zoom'lanırken kare bütçesi tutuyor mu (B1.4 Program'ın açılışını
      zaten 32,6 ms / 144,8 ms / 302 ms diye ölçtü, tuzak 105).
      **Çakışacağı üç yer şimdiden belli, üçü de ölçülmeden dokunulmaz:**
      `drag.ts` hedefini `closest('[data-day]')` ile buluyor (tuzak 13) ve
      dönüşmüş bir tuvalde koordinat başka bir şey demek; `gridChrome.ts`
      imleç haçını `data-col` üstünden yakıyor (tuzak 85); ve öğretmen sütunu
      `position: sticky` — `transform` bir sticky bağlamını kırar.
      **Renk ölçütü tamamlandı (2026-09-01, B4.7):** Program ızgarası, havuz
      ve sürükleme hayaleti öğretmen / sınıf / derslik / branş rengine göre
      birlikte boyanabiliyor. Tuval yakınlaştırma, serbest kaydırma ve kart
      içeriği seçimi bu maddede açık kalıyor.
- [ ] **B4.3b Sınıfın TÜRÜ** (`SAY` · `EA` · `SÖZ` …). Babanın kâğıdında
      başlık `310 G SAY` — kod, derslik ve **tür** yan yana. Bizde böyle bir
      alan yok. aSc'nin `Özel Alanlar`'ının karşılığı; `ClassGroup`'a bir alan
      mı, yoksa genel bir "özel alan" mekanizması mı — **B4.3 ile birlikte**
      kararlaştırılacak, ayrı bir şema turu açılmayacak.
- [ ] **B4.3 Okul adı · öğretim yılı · okul logosu · sınıf öğretmeni · özel
      alanlar.** Bunlar baskı tasarımının **değişkenleri**; onlar olmadan B4.4
      yazılamaz. Logo bir **dosya**, yani `State`'e ne şekilde gireceği
      (data URI mi, ayrı depolama mı) ölçülerek seçilecek — ilke 5 gereği yedek
      dosyası onu taşıyabilmeli.
- [ ] **B4.4 Baskı tasarımları** — *"kesinlikle olması lazım"*. Model aSc'den
      **çözüldü**: logo · künye · kenarlık · ekstra sütun, ve yer tutucular
      `{Okul:Okulun Adı}` `{Okul:Öğretim Yılı}` `{Okul:Okul Logosu}`
      `{Sınıf:Tam Adı}` `{Sınıf:Sınıfın Dersliği}` `{Sınıf:Sınıf Öğretmeni}`
      `{Öğretmen:Tam Adı}`. Düzenleme yeri **önizlemenin kendisi**.
- [ ] **B4.5 Farklı baskı çeşitleri** — rapor yapısı seçilebilsin: satırda ne,
      sütunda ne, sayfa başına ne.
- [ ] **B4.6 Program ızgarasında sınıfın altındaki "derslik yok" ibaresi
      kalksın.** Senin satırın: *"program tarafında sınıf tarafında
      dersliği yok ibaresi kalkması lazım."* Kaynak `Program.tsx:321-327`:
      `roomLetter(...) === "" ? t("derslik yok") : t("{ad} dersliği", ...)`
      — sınıf görünümünde satır başlığının ikinci satırı. Derslik
      atanmamış her sınıfta bu metin tekrar ediyor; kaldırılınca o satırın
      **boş mu kalacağı yoksa kutunun tamamen mi küçüleceği** sorusu var
      (tuzak 82: bir metni kaldırmadan önce o metnin ne taşıdığı sorulur —
      burada bir satır yüksekliği).

---

## §5. Bölüm 5 — Kısıt motoru, çözücü ve Kontrol

- [x] **B5.1 Çözücüde Deney B uygulandı (2026-08-31, kırk üçüncü oturum).**
      Önce **ölçüm aleti** yazıldı — `src/worlds.ts`'teki `gridQuality()` —
      çünkü "bedeli yok" cümlesi tek bir dünyada (örnek okul) ölçülmüştü ve
      depoda kaliteyi tekrar ölçen hiçbir şey yoktu (tuzak 42). `order()`'a
      **beşinci** bir anahtar eklendi: sınıfın o gün dolu olan saatine yaslanan
      hücre önce dener. Dört ağır dünyanın **hepsinde** önce/sonra alındı:
      `gercek-olcek-sikisik` 410→**413** blok (sınıf deliği 339→273),
      `gercek-olcek-kurali` 253=253 blok (delik 145→118), `parcalanmis-gunler`
      22=22 (delik zaten 0), `gercek-olcek-imkansiz` 163→**217** blok. Hiçbir
      dünyada blok düşmedi — kabul kapısı geçti. 21 dünyalık matris
      değişmeden yeşil.
- [x] **Deney A uygulanMAYACAK — karar verildi.** Öğretmeni günlere sıkıştırmak
      deliği 274 → 227 indiriyor ama programı **eksik** bırakıyor (363/367) ve
      süreyi 69 ms → **9 856 ms**'ye çıkarıyor. Tuzak 21'in ta kendisi.
- [x] **B5.2 Boşluk (pencere) kuralları girdi (2026-08-31, şema v14).**
      `maxGapsTeacher` · `maxGapsClass`, `minPerDay`'in deseninde: yalnız
      **Kapalı / Uyar** (bir bırakmayı engelleyemez — gün yarı dizilmişken
      her açık saat bir "boşluk"). **0, öteki dört kuraldan farklı olarak
      birebir kullanılır** (`gapRuleActive()`), çünkü okuyucunun isteyeceği
      sayı büyük ihtimalle tam 0. Delik tanımı tek yerde
      (`rules.ts`'teki `gapsBetween()`) ve `gridQuality()` ile aynı cümleyi
      paylaşıyor. Öğretmene özel kutu **yok** bu turda — okul geneli tek
      katman.
- [ ] **B5.3 Kısıt motorunun kalan genişlemesi:** kartlar arası ilişki · sınıf
      için günlük min/max · ardışıklık · "belirli ders belirli konumda" ·
      öğretmen günde en fazla N sınıf.
- [x] **B5.4 Kontrol'e Danışman uyarıları — YAPILDI (2026-08-31).** aSc kova 1
      (`docs/asc/yardim/u60-verification.md`, beş madde). Üç madde **yeni
      kod** oldu: `feasibility.ts`'teki `buildAdvice()` — haftadan çok gün
      isteyen ders (`lessonNeedsMoreDays`), açık günü yetmeyen öğretmen
      (`teacherManyBlockedDays`), hiç tekli saat bırakmayan çok bloklu ders
      (`lessonManyBlocks`). **Overbooked** maddesi zaten `buildCapacity()`ta
      vardı, yeni kod istemedi. **Bölünmüş gruba özel derslik** maddesi
      kapsam dışı bırakıldı — `ClassGroup`'ta grup/bölünme alanı yok, **B6.1**
      bekliyor. `Report.advice` / `Health.advice`, `hasProblem`'ı **etkilemiyor**
      — aSc'nin kendi şeridi de Doğrulama/Danışman'ı iki ayrı düğme tutuyor.
      Kontrol'e beşinci görünüm (`Danışman`) eklendi, panel `.stat-scroll` ile
      **sınırlı**: örnek okulda 43 satır çıktı ve sınırsız bırakılsaydı %100'de
      1201px taşardı — ölçülüp (`e2e/kontrol.spec.ts` 88, `e2e/serit.spec.ts`
      58) düzeltildi. Dört dile de çevrildi. Testler: `feasibility.test.ts`
      (17 yeni), `e2e/kontrol.spec.ts` 89 (4 yeni), `e2e/serit.spec.ts`
      güncellendi.
- [x] **B5.5 Kontrol ekranının kendisi — ÖLÇÜLDÜ, kusur yok (2026-08-31).**
      Senin satırın: *"Kontrol kısmı çok saçma olmuş... Alt sekmede bir şeyler
      seçiyoruz ama değişmiyor."* İlk yarısı zaten kapanmıştı (şerit artık
      sayfayı seçiyor). Kalan yarı — "rapor hâlâ aşağı doğru uzuyor mu" —
      ölçüldü (`e2e/kontrol.spec.ts` 88): %80 ve %100'de, **iki temada**,
      dört görünümün dördü de `.main`'i **0px** taşırıyor. %150'de 141–174px
      taşıyor ama bu Kontrol'e özgü değil — **aynı ölçekte karşılaştırıldı**:
      Okul → Öğretmenler 1355px, Ayarlar → Kurallar 450px taşıyor. Kontrol
      üçünün **en azı**. Kod yazılmadı; iddia ölçüldü ve doğrulandı.
- [x] **B5.6 Bloklu ders sürüklerken/işaretlenirken "tek ders" gibi
      davranıyordu — DÜZELTİLDİ (2026-08-31).** Senin satırın: *"Eğer hata
      varsa düzelt. 2 derslik bir blok kesinlikle 1 ders değil 2 derstir. Bu
      önemli. Programda bloklu bir şey alındığında ya da üzerine
      gelindiğinde o blok kartının çift sütun seçili olmalı veya mesela
      sürüklerken son ders kapalı gözüküyor kırmızı. bu böyle olmamalı son
      saate koyuluyorsa son saat ve ondan bir önceki saate yani son 2
      saate konulabilmeli."* Kod okunarak KÖK SEBEP ikisi için de bulundu —
      "worlds.ts'te yeniden üret" ihtiyatı gereksiz çıktı: ikisi de
      `constraints.ts`'in kısıt mantığında değil, **etkileşim katmanında**
      yaşıyordu, `dropMap()`/`blockerDetail()` hiç değişmedi.
      **(a) Görsel — `src/gridChrome.ts`.** İmleç haçı bir hücrenin
      `data-col`'unu okuyordu ama hücrenin KENDİ `data-span`'ine hiç
      bakmıyordu, yani 2 (ya da 3) saatlik bir bloğun üzerine gelince yalnız
      bloğun BAŞLADIĞI sütun (+ başlığı + o sütunu solundan kapsayan başka
      satırlar) yanıyordu — ikinci (ve varsa üçüncü) sütun hiç. `move()`
      artık hovered hücrenin span'inden kapladığı bütün sütunları çıkarıp
      her birini (başlık dahil, her satırda o sütunu örten hücre neyse)
      aydınlatıyor; sabit `"2"` yerine `blocks.ts`'teki `MAX_BLOCK`'tan
      türeyen bir döngü var (tuzak 78'in dersi: eşiği elle sabit yazma).
      **(b) Bug — `src/drag.ts` + `src/components/Program.tsx`.**
      `blockerDetail()` `hour`'u her zaman bloğun mutlak başlangıcı sayıyor
      (doğru davranış — o hâlâ değişmedi), ama sürükleme imlecin bulunduğu
      hücreyi olduğu gibi bu "başlangıç" olarak geçiriyordu. Günün son
      saatine gelince blok oradan başlamaya çalışıp sığmıyor, kırmızı
      oluyordu. `dropMap()` zaten HER (gün, saat) çifti için bir kayıt
      üretiyor, yani "son N saatin başlangıcı" için doğru cevap `d.map`'te
      hazırdı — yeni `clampToDay()` yardımcısı imlecin ham hücresini, blok
      tam sığana kadar geriye kaydırıp o anahtarla arıyor. Üç yerde
      kullanıldı: zayıf satır önizlemesi, güçlü vurgu + sebep çubuğu, ve
      `onUp()`'ın kendisi — üçü de aynı "hangi hücreye bakılacak" sorusunu
      soruyordu.
      `constraints.ts` hiç değişmediği için `constraints.test.ts`'in
      `dayEnd` testleri aynen yeşil kaldı. Yeni testler: `e2e/izgara.spec.ts`
      ("imleç haçı 2 saatlik bir bloğun İKİNCİ sütununu da aydınlatıyor") ve
      `e2e/program.spec.ts` ("89. Gün sonunda blok geriye kaydırılır") —
      ikisi de `loadWorld()` ile kurulmuş belirli bir dünyada, tahmine değil
      ölçüme dayanıyor.

---

## §6. Bölüm 6 — Veri modelini büyüten işler (aSc kova 2–4)

Bunların hepsi ya `schemaVersion`'ı artırıyor ya kısıt motorunun tamamına
dokunuyor. **Şema her değiştiğinde: sürümü artır, göç kodunu yaz, hem birim
hem E2E testini ekle** — eski yedek açılmıyorsa veri kayıptır (tuzak 97).

- [ ] **B6.1 Gruplar / bölünmeler — ŞEMA v14.** Senin satırın: *"seçmeli ders
      yok ama olsun."* `placements` bir hücreye **tek** ders tutuyor; bu madde
      tam olarak onu değiştiriyor, yani göç kodu, `sanitize()`, cascade ve
      **kısıt motorunun tamamı** etkileniyor. Listenin en pahalı maddesi.
- [ ] **B6.2 aSc'den içe aktarma (XML) — ve artık DOSYANIN ADI BELLİ.**
      Babanın aSc dosyası `15 EYLÜL.roz`
      (`C:\Users\BİREY ÜMRANİYE\Documents\...`, fotoğraftan okundu). §8c'nin
      kalan tek maddesi olan **ders listesi** tek adımda buradan gelir —
      dosyanın kendisi istenirse. **`.roz` bir zip mi, ikili mi: ölçülecek.**
      aSc'nin `Dosya İşlemleri`'nde dışa aktarma da var (menüde görüldü).
- [ ] **B6.3 A/B haftası** — sen *"olabilir"* dedin; **B6.1'den sonra**.
- [ ] **B6.4 Ders başına derslik** — önceliklendirme, paylaşılan derslik,
      kapasite. (aSc kova 3.)
- [ ] **B6.5 Ders kopyalama · toplu ders ekleme · ad biçimi · ~~kısayol
      listesi~~ · iki programı karşılaştırma · ders ızgarası toplu giriş.**
      (aSc kova 4; altısı da küçük ve birbirinden bağımsız — bir "boş vakit"
      turu.) **Kısayol listesi bitti (2026-08-31, kırk beşinci oturum):**
      `src/components/ShortcutsHelp.tsx`, üst çubukta düğme + `?` tuşu + Ctrl+K
      paleti, dört dilde çeviri, `e2e/palet.spec.ts` 54. Kalan beşi açık.
- [ ] **B6.6 Kapanırken kaydedilmemiş değişiklik uyarısı — muhtemelen
      GEREKMİYOR.** Her değişiklik 400 ms gecikmeyle kaydediliyor ve sekme
      kapanışında anında yazılıyor, yani "kaydedilmemiş" durum pratikte
      oluşmuyor. Yine de babanın içi rahat etsin diye görünür bir
      "kaydedildi" işareti düşünülebilir. **Ölçülmeden yazılmaz.**

---

## §7. Bölüm 7 — Dağıtım, Windows ve depo

> **Bu oturum Windows 11 üstünde koşuyor** — aşağıdaki maddelerin birçoğu
> *"başka bir makinede ölçülecek"* diye bekliyordu ve **artık burada
> ölçülebilir**.

- [x] **v2.0.1 yayınlandı.** `54403b6` + `v2.0.1` etiketi. Taşıdıkları:
      v2.0.0'ın **veri kaybı düzeltmesi** (doğru `identifier`, tuzak 95),
      AA turunun beş maddesi (şema v11), AC turunun altısı, AB turunun yedisi.
- [x] **B7.10 Exe'nin "Güncellemeleri denetle"si onarıldı** (2026-08-31).
      Depo `ders-programi` → `Mozaik` olunca yayınlanmış v2.0.2 manifestteki
      yeni adresi reddetti: `Beklenmeyen adres: https://…`. `update.rs` artık
      **iki** kök tanıyor, manifest **eski** adresi yazıyor (GitHub 301'liyor),
      adres kapısı yalnız **indirilecek bir şey varken** çalışıyor, ve
      `src/surum.test.ts` iki dosyanın anlaştığını her koşuda ölçüyor.
      Bkz. tuzak 106.
- [x] **B7.11 `SITE_ADRESI` 404'tü, düzeltildi** (2026-08-31). Pages bir depoyu
      **adıyla** yayınlıyor: `…github.io/ders-programi/` → 404,
      `…github.io/Mozaik/` → 200. Programın "en son sürüm şurada" dediği tek
      adres bu.
- [ ] **B7.12 Yeni sürüm yayınlanınca babanın v2.0.2'si DENENSİN.** Düzeltmenin
      o kopyaya ulaşan yarısı **manifest**; ikilinin içindeki önek
      değiştirilemez. Yayından sonra "Güncellemeleri denetle" yeni sürümü
      görmeli ve indirebilmeli. Görülene kadar bu bir varsayım (tuzak 65).
- [ ] **B7.14 v2.0.3 YAYINI DÜŞTÜ ve `latest` 2.0.2'de kaldı.** `exe` işinin
      "Name it and MEASURE its size" adımı başarısız (`tauri build` başarılı).
      Adım iki ada da bakacak şekilde sağlamlaştırıldı, ama **asıl sebep
      ölçülmedi**: job log'u admin hakkı istiyor (403). Kullanıcı log'a bakıp
      etiketi yeniden koştursun — düzeltmenin babanın kopyasına ulaşması bu
      yayına bağlı.
- [x] **B7.13 `e2e/exe.spec.ts`'in `Mozaik-tumu.json` beklentisi geri alındı**
      (2026-08-31, kullanıcı kararı: *ad `ders-programi-*` kalsın*). `658c019`
      yalnız testi değiştirmişti; kod haklıydı. Ad artık bir **birim testinde
      çivili** (`folder.test.ts`) — mutasyonla sınandı, çünkü tersi hiçbir
      yerde yakalanmıyordu: adı değiştiren biri `prunable`'ın kalıbını da
      değiştirir ve baba klasöründe iki nesil yedek yan yana kalır.
- [ ] **B7.1 Exe babanın makinesinde bir kez denensin.** Bu makinede
      ölçülemeyen şeyler orada görülür: exe'nin kendini gerçekten
      değiştirmesi, planların yerinde kalması, **görev çubuğundaki yeni simge**
      (eşik 32'ye çıktı), SmartScreen'in ne dediği, ve `Kur.cmd`'nin yeni
      `RemoteSigned` yolu.
- [ ] **B7.2 GitHub Pages hâlâ başkasına gidiyor.** `AlparslanSemiz.github.io`
      deposunda Settings → Pages → Custom domain temizlenecek **ve** kökteki
      `CNAME` silinecek. Kaldırmanın GameMetrix'i kırmayacağı **ölçülmüştü**
      (o alan adı tamamen Cloudflare'da, Pages'ten bağımsız).
- [ ] **B7.3 SmartScreen ekranı GÖRÜLSÜN.** İmzasız exe'de Windows
      "bilinmeyen yayıncı" der; README'ye tek cümlelik yol yazıldı
      (*"Daha fazla bilgi" → "Yine de çalıştır"*) ama **ekranın gerçekte ne
      dediği görülmedi**. Görülünce cümle düzeltilecek.
- [ ] **B7.4 Yazdırma Tauri penceresinde çalışıyor mu** (WebView2 yazdırma
      diyaloğu). Linux'ta denenmedi, çünkü ölçülecek olan WebKitGTK'nın
      diyaloğu olurdu — babanın göreceği şey değil. A4 yatay ve
      `@page { margin: 0 }` orada da tutuyor mu.
- [ ] **B7.5 `.exe` boyutu ve açılışı Windows'ta ölçülsün.**
      Linux/WebKitGTK'da: 3,64 MB, derleme 1 dk 38 sn, açılıştan diske ilk
      yazıma 986 · 1053 · 1149 ms. **Windows/WebView2 başka bir sayı verecek.**
- [ ] **B7.6 `strip = false`'un boyut maliyeti** — Rust olan bir makinede
      ölçülecek. Ölçmeden bir entropi iddiası yazmak tuzak 65 olur.
- [ ] **B7.7 `kayma.spec.ts`'in "aynı genişlikte" testi macOS'ta düşüyor** ve
      kusur kodda değil: bindirmeli kaydırma çubuğu 0 px, yani testin ölçmek
      istediği oluk orada yok — testin **kendi koruması** bunu söylüyor.
      Regresyon değil, platform farkı. Karar: oluk yoksa `skip` mi etsin,
      yoksa yazıldığı makineye özel mi kalsın.
- [x] **B7.13 Exe'nin penceresi ekranı KULLANIYOR, ve Sığdır dersleri
      kırpmıyor** (2026-09-01). Senin satırın: *"Uygulama'da exe'de babamın
      ekranında program kısmında derslerin hepsi gözükmüyor sığdır olmasına
      rağmen."* Sebep tahmin edilmedi, ölçüldü (tuzak 101) ve **iki** taneydi.
      (a) `tauri.conf.json` `1600×1000` mantıksal px istiyor ve `maximized`
      yoktu — deponun bütün düzen ölçümleri 1920'de yapılmışken exe 1600 CSS
      px'te koşuyordu. Dolu ızgarada Sığdır'da: 1920'de 374 kartın 25'i,
      **1600'de 315'i** `411` yerine `4…` yazıyor. (b) Sığdır satır başına
      5,25rem ve altı ayraca .375rem, yani 1920'lik kutunun 97 px'ini ders
      sütunlarına hiç vermiyordu. Yapılanlar: `"maximized": true`,
      `minHeight` 700 → 640 (%150'de çalışma alanı 672), satır başı **5rem**,
      ayraç **.1875rem** (artık `--break-w` tokeni, iki yerde birden), satır
      başına `nowrap` + ellipsis ve daha dar dolgu, köşedeki eksen adı bir
      basamak küçük, ve kart yazı tabanı `--ui-scale`'i **yalnız 1'in altında**
      izliyor. Ölçülen: 1920×1032'de kırpılan kart **25 → 0**, iki eksende de,
      ve satır yüksekliği ile tablo boyu **kıpırdamadan**. Bkz. tuzak 107.
      Kalan ve kapanmayan: Windows %125'te ölçek 1,0 bırakılırsa kırpılma
      sürüyor (72 sütun × ~21,6 px 1536 px'e girmiyor); çaresi Ayarlar →
      Görünüm'den %80, ya da `Geçici görünüm`den gün gizlemek.
- [→] **B7.8 `scripts/asc-tur.ps1` yeniden koşturulsun** → **R1**'e taşındı.
      Artık bir dağıtım işi değil, envanterin **önkoşulu**.
- [→] **B7.9 Roboders incelensin** → **§1b** (R5 · R6 · R7). Senin
      *"her şeyden önce"* satırın onu bir maddelik iş olmaktan çıkardı.

---

## §8. Karar bekleyenler

### 8a · Sende — kullanıcı kararı

- [x] **Roboders hesabı — VAR** (2026-08-31). Kayıt engeli düştü.
- [ ] **Roboders hesabı ücretli bir plan mı, süren bir deneme mi?** Deneme ise
      kaç gün kaldığı R6'nın kapsamını belirler.
- [ ] **R6 ne zaman koşsun?** Görünür bir Chromium penceresi açılacak ve odağı
      alacak; oturumu sen açacaksın. Müsait olduğun bir zaman gerekiyor.
- [x] **Çözücüde Deney B uygulansın mı? — UYGULANDI** (2026-08-31, B5.1).
      "Uygula — önce ölç" dedin; dört ağır dünyada önce/sonra ölçüldü, hiçbir
      dünyada blok düşmedi.
- [ ] **`kayma.spec.ts` macOS'ta `skip` mi etsin?** (B7.7.)
- [ ] **Yedek dosya adı `ders-programi-*` mı kalsın, `Mozaik-*` mi olsun?**
      (B7.13.) Ad değişirse `folder.ts`'in budama kalıbı eski dosyaları
      tanımaz: birikirler, ve eski ana dosya klasörde öksüz kalır.
- [ ] **Excel mi, `.csv` mi?** (B3.3 — `.xlsx` bir zip, `.csv` düz metin;
      ikisi çok farklı iş.)
- [ ] **Çıktı ekranları için örnek fotoğraf.** Senin satırın: *"Benden çıktılar
      için ... foto iste eğer örnek fotolarda atmadıysam."* → **isteniyor**.
- [ ] **Bulut senkronizasyonu / backend isteği — KURAL ÇELİŞKİSİ, önce
      CLAUDE.md kararı gerekiyor.** Senin satırın: *"Sanırım cloud tabanlı
      bir şey kuracağız babam öyle istedi. Bende 1gb ramli 8gb depolama
      alanlı VM var bedava... onun yanına dockerda falan küçük yer kaplayan
      bir cloud sistemi kuralım."* Netleştirmen üzerine (2026-08-31): bu
      **programın backend'i / veri senkronizasyonu** için — yani ilke 2'nin
      ("Sunucu yok") tam karşısında ve yasak listedeki **"bulut
      senkronizasyonu"** maddesiyle birebir çakışıyor. Yasak liste "bunlar
      bu projeye ASLA girmeyecek" diyor; bu satır o cümleyle duruyor.
      **İlerlemeden önce gereken, bir TASKS.md maddesi değil bir CLAUDE.md
      kararı**: ilke 2'nin 2026-08-30'daki "KURULUM YASAĞI KALKTI" ve
      "PAYLAŞMA YASAK DEĞİL" örneklerindeki gibi açıkça **kullanıcı
      kararıyla** gevşetilmesi, ve yasak listeden "bulut senkronizasyonu"nun
      (gerekirse "kullanıcı hesapları"nın da) çıkarılması. Netleşmesi
      gereken sorular: hangi veri senkronize edilecek (bütün plan kitaplığı
      mı, yalnız son hâl mi) · kaç cihaz arasında · aynı planın iki yerde
      değişmesi nasıl çözülecek (çakışma) · hesap/kimlik gerekip
      gerekmediği · 1 GB RAM / 8 GB disk'lik VM'in bunu kaldırıp
      kaldırmayacağı · eski (bozuk) sitenin ne olacağı. **Statik site zaten
      ücretsiz yayınlanabiliyor** (`dist-site` + GitHub Pages, B7.2) — VM
      fikri onun ötesinde bir şey mi istiyor, bu da netleşecek. Bu sorular
      cevaplanmadan bir görev numarası (B7.x) açılmayacak.

### 8b · Babada

- [ ] **Vekil öğretmen (Substitution) var mı?** aSc'de 62 yardım konusu, yani
      küçük bir özellik değil.
- [ ] **Nöbet var mı?**
- [ ] **Otomatik dizmenin çıktısı KULLANILIR mı?** Yasal olduğu ölçülüyor
      (21 dünyada, her blok `blocker()`'dan geçiyor); *iyi* olduğu ölçülmüyor.
      Sorular: sınıfın günü içinde boşluk (pencere) kalıyor mu, öğretmen okula
      gereksiz gün geliyor mu, günler dengeli mi. Cevaba göre §5 şekillenir.
- [ ] **"Bu programı kullanır mıydın?"** — asıl soru hâlâ bu.

### 8c · Babanın gerçek verisi — **v0'ın çıkma şartı**

> ### 🎯 BÜYÜK KISMI 2026-08-31'DE GELDİ — fotoğraftan
>
> Kullanıcının `docs/Örnek Fotolar/`'a koyduğu 33 telefon fotoğrafı babanın
> **aSc'sinin ve Roboders'inin çalışan hâli**, gerçek verisiyle:
> `aSc k12 … 2027 — [15 EYLÜL.roz]`, `C:\Users\BİREY ÜMRANİYE\...`.
> **İki yıldır beklenen şey buydu**, ve iki yıllık varsayımların hepsi
> tutuyor. Ayrıntı [ROBODERS.md](ROBODERS.md) ve aşağısı.

**ÖLÇÜLEN — varsayımlarımız DOĞRU çıktı:**

| Varsaydığımız | Gerçek | |
|---|---|---|
| 6 gün, Salı–Pazar (Pazartesi yok) | aSc Ayarlar: **Gün Sayısı 6**, hafta sonu Cmt–Pzr; ızgarada Salı→Pazar | ✅ |
| Günde 12 ders | aSc Ayarlar: **Günlük Ders Saati 12** | ✅ |
| 09:00 · 40 dk ders · 10 dk teneffüs | Kâğıtta: `9:00–9:40 · 9:50–10:30 · 10:40–11:20 …` | ✅ |
| 5. dersten sonra 30 dk öğle arası | `12:20–13:00` sonra `13:30–14:10` | ✅ |
| **12. ders 19:10'da biter** | Kâğıtta `18:30–19:10` | ✅ `bell.test.ts` haklı |
| ~25 öğretmen | Izgarada **18 satır** (MÇ AV MB YM KY YG AS İA YK HE ED DE SD RY GÇ NU AÖ AG) | ✅ mertebe doğru |
| ~20 sınıf, 8 derslik | **20 sınıf** · derslik harfleri **A–H = 8** | ✅ |
| Sınıf adı 3 haneli kod | `310 311 320 410 411 412 413 414 415 430 431 432 433 450 451 453 510 511 530 531` | ✅ |
| Öğretmen kısaltması 2 harf | Çoğu 2 (`MÇ`=Çetin Melek, `AV`=Vergili Ayşe), biri **`İSAY`** 4 harf | ✅ `makeShort` yalnız VARSAYILAN üretir, `Teacher.short` düzenlenebilir — kusur değil, okundu ve doğrulandı |

**Yeni öğrenilenler:**

- **Sınıf adı ile derslik BİRLEŞİK yazılıyor:** `310 G`, `451C`, `530D`. Bizim
  `ClassGroup.roomId`'miz bunu zaten modelliyor; **kâğıtta yan yana yazmak**
  babanın alışkanlığı.
- **Sınıfın bir de TÜRÜ var:** başlıkta `310 G SAY` — `SAY` (sayısal). Bizde
  böyle bir alan **yok**; `B4.3`'ün "özel alanlar"ına aday.
- **Branş adları numaralı:** `MAT1` · `Mat2` · `Türkç` · `TürkD`/`TDED`
  (Türk Dili ve Edebiyatı) · `Kimya` · `Fizik` · `Biyo` · `Geome` · `Coğ` ·
  `Tarih` · `FLSF`. **`MAT1`/`Mat2` çift branş kararımızı doğruluyor.**
- **Babanın aSc'si LİSANSSIZ:** çıktılarda `Please register` ve
  *"EVALUATION version … distributing this printout is ILLEGAL"* damgası var.
  Yani duvara asılan kâğıtta kırmızı uyarı yazıyor — **bizim çıktımızda
  yazmayacak**, ve bu tek başına bir taşınma sebebi.
- **Bir projede 5 gün × 8 ders** düzeni de var (Roboders ekranı,
  Pazartesi–Cuma). Yani tek bir zil düzeni yetmiyor — **plan kitaplığımız
  bunu zaten karşılıyor.**

**KALAN — hâlâ babada:**

- [ ] **Ders listesi**: fotoğraflarda program var ama "hangi sınıf hangi
      dersten kaç saat" tablosu yok. `B6.2` (aSc XML) bunu tek adımda getirir —
      `15 EYLÜL.roz` dosyasının kendisi istenebilir.
- [x] **Gerçek gün ve zil düzeni — DOĞRULANDI** (yukarıdaki tablo).
- [x] **Öğretmen/sınıf/derslik listesi — GÖRÜLDÜ** (18 · 20 · 8). Makineye
      girilmesi ayrı iş; `B6.2` ya da yapıştırma kutusu.
- [ ] **Öğretmen sınırları sorulsun**: art arda en fazla kaç saat, günde en
      fazla/en az kaç saat. Şu an hepsi 0 (sınır yok) ile geliyor ve **öyle
      kalacak** (2026-08-24 kararı): branş kısaltmasının aksine bunun "doğru
      cevabı" okuldan okula değişir, ve yanlış bir varsayılan hücreleri
      sessizce kırmızıya boyar
- [ ] **Bir haftalık program baştan sona dizilsin** → v0'ın çıkma şartı
- [ ] Babanın bilgisayarında hız kontrolü
- [ ] Baskı gerçek kâğıda alınsın (E2E taşma olmadığını gösteriyor ama fiziksel
      çıktıya bakılmadı)
- [ ] Derslik varsayımı teyit ettirilsin: odalar gerçekten paylaşılıyor mu?
- [ ] **Branş listesi teyit ettirilsin**: okulun gerçekten verdiği branşlar
      hangileri, listeden ne çıkarılacak
- [ ] **36 rengi gözle sor**: dizerken iki satırı karıştırdığın oldu mu?
      ΔE eşiği sayıyı garanti eder, gözü değil
- [ ] **Kenar çubuğu dar mı geniş mi kullanılıyor?**
- [ ] **Brave'de açık tema** — tuzak 14 çözülmüş sayılıyor ama **babanın
      Brave'inde GÖRÜLMEDİ**; hâlâ doğrulanmayı bekleyen bir varsayım

---
## §9. Ham notlar — senin kendi satırların

Bütün turların kaynağı. **Hiçbir satır silinmedi**; her satırın yanında nereye
gittiği yazıyor. Kapalı olanların çoğu kod yazılarak değil **ölçülerek**
kapandı — o yüzden nerede kapandığı da yazılı.

### 9a · Hâlâ AÇIK olan satırlar → numaralı maddeye dönüştüler

| Senin satırın | Nereye gitti |
|---|---|
| her şeyden önce. tasklara ASC ve Robodersin tekrardan her inciği cıncığının feature'nın incelenmesi lazım. | **§1'in tamamı** (R1–R9) — her şeyin önüne alındı |
| Program tarafı da tuval gibi word gibi olsun hareket ettirme vesaire eğer olabiliyorsa. | **B4.2** — tuval artık Program ızgarasının kendisi |
| Ayarlar sectionunun kendine has kendi içinde simetrik olma koşuluyla designi olabilir. | **B2.1–B2.3** (§2) |
| Arama kısmına bir şey yazınca arama bloğu genişliyor genişlemesin. | **B1.6** — dosyanın son satırıydı, hiçbir tura girmemişti |
| Uygulama'da exe'de babamın ekranında program kısmında derslerin hepsi gözükmüyor sığdır olmasına rağmen. | **B7.13** — kapandı: pencere maximize + Sığdır'ın genişlik iadesi (tuzak 107) |
| Ayarlar hakkında kısmında sağa sola kaydırma olmasın. | **B2.5** — önce ölçülecek |
| Görsel çıkartma | **B3.1** |
| Çıktıda ayrı ayrı birden fazla pdf oluşturma. | **B3.2** |
| Excele çıkartma. | **B3.3** |
| Çıktıda eposta ve whatsapptan atma opsiyonu. Öğretmenlerin teli ve epostanın. | **B3.4** — şema v12 |
| Çıktıda her ama her zaman simetri çok önemli. | **B3.6** — ölçülmedi |
| Benden çıktılar için foto iste eğer örnek fotolarda atmadıysam. | **§8a** — senden isteniyor |
| Kontrol kısmı çok saçma olmuş. biraz daha düzgün olmalı. | **B5.5** — yarısı kapandı |
| Program otomatik dizmeye bakmak lazım. | **B5.1** — ölçüldü, karar sende |
| ASC ve Robodersi playwright ile inceleyip oradaki güzel featureları bize ekleyelim. | **§1** — ilk turu yetersiz bulundu, tam envanter isteniyor |
| Babama indirdim exeyi zip virüs algılandı. .exeyi açarken de window engelledi. | AB6 azalttı; ekranın kendisi → **B7.3** |
| Sanırım cloud tabanlı bir şey kuracağız babam öyle istedi... dockerda falan küçük yer kaplayan bir cloud sistemi kuralım. | **§8a** — kural çelişkisi (ilke 2 · yasak liste "bulut senkronizasyonu"), CLAUDE.md kararı bekliyor |
| Kullanım kolaylığı ve kullanım tarzı bakımından ASC'den, Robodersten, Word, Paint, Excel, Powerpoint, Adobe programları gibi yerlerden ilham... | **R10** (§1d) |
| Statik bir site olduğundan kolayca aslında ücretsiz bir şekilde internete de yükleyebiliriz, deploylayabiliriz. | zaten var — `dist-site` + GitHub Pages (**B7.2**); §8a'daki bulut maddesine not düşüldü |
| Çıktı alanında sağdaki seçeneklerin bazıları alttaki şeride gidebilir, sağ tarafta yerden tasarruf etmiş oluruz. | **B3.7** |
| Ayarlardaki zil ve günler okul ile alakalı bir şey olduğuından okul sekmesine... Kurallar sekmesi de aynı şekilde... | **B2.7** — §1 bitmeden karara bağlanmayacak |
| Babamın ekranı 27 in. 1920x1080... dersliği yok ibaresi kalkması lazım... Sınıfların türü olmalı... o sebeple her şeye uygun ama en çok da babama uygun olsun ölçeklemeler. | ölçekleme → **B2.8** · "derslik yok" ibaresi → **B4.6** · sınıf türü zaten **B4.3b**'de var |
| Ayrıca hakkında kısmında what's new gibi olmalı. babam her güncelleme alındığında neyin değiştiğini soruyor... | **B2.9** |
| Eğer hata varsa düzelt. 2 derslik bir blok kesinlikle 1 ders değil 2 derstir... son 2 saate konulabilmeli. | **B5.6** |
| Ayarlarda her sectionun görüntüsü değişebiliyor olsun... Önizleme şeklinde görelim onları. | **B2.10** |

### 9b · Kapanmış satırlar — ve nerede kapandıkları

```
Program kısmının açılışı daha hızlanmalı.                           -> [x] B4.7, 4× CPU sıcak medyan 169 -> 123,3 ms
Gerekirse web stacki ile uygulama stacki ayrılmalı bu çok büyük bir şey ama gerekiyorsa yapılacak. -> [x] B4.7, ölçümle gerekmedi; web/exe aynı dist'te kaldı
Programda bir kartı kırmızı sarı veya yeşil blokların üzerinden gezdirirken çok kasma oluyor. -> [x] B4.7, 300 hareket p95 15,8 ms; >50 ms kare yok
  (GERİ GELDİ 09-01: "satır üzerinde gezdirirken kasma" -> [x] B4.8, karenin kendisi ölçüldü: rAF 1,8 -> 0,4 ms)
Öğretmenin kendi dersleri arasında değişim muhtemel olmalı eğer sınıfsal ya da başka bir şeysel bir sıkıntı yoksa. -> [x] B5.7, iki görünümde atomik ve yeniden doğrulanan takas
Yenilik olduğu vakit ayarların üzerinde nokta var ama hakkında kısmında yok. -> [x] B2.11, iki nokta birlikte temizleniyor
Program kısmında sağ üstteki işlemlerde programı boşalt kırmızı olmalı ya da işte önemli bir işlem. -> [x] B2.11, tehlikeli menü rengi
Program kısmında renkleri ayarlama olmalı sınıfa göre öğretmene göre ona göre buna göre. -> [x] B4.7, dört renk modu + cihaz tercihi
kartları kaydırırken başka bir kartın üzerine gelip koyma yani değiştirme var ya işte o kartların arkasından ya da başka bir şekilde de o kartın oraya gelip gelemyeceğini bilmek lazım yani kırmızı mı turuncu mu falan. -> [x] B5.7, hüküm çerçevesi dolu kartın üstünde
kartları mesela öğretmenin bir kartını öğretmenin kendi satırında gezdirirken kasma oluyor renderda onu düzeltelim. -> [x] 2026-09-01, İKİ bulgu: (1) dropMap() takas dalı buildIndex()'i satır başına iki kez çağırıyordu (B5.7'nin kendisi profillenmemişti); work/workIx üstünde vacate/occupy'a çevrildi, sample okulun en yoğun satırında 10,3 -> 2,7 ms/çağrı (Node, throttle'sız). (2) "hâlâ çok yavaş" — gerçek tarayıcıda 4× CPU ile ölçülünce activate.current()'ın gölge dikdörtgenlerini konumlayan getBoundingClientRect() okuması .dragging sınıfı ve iki <div> eklendiKTEN SONRA geliyordu, bütün 84×25 tabloyu yeniden dizdiriyordu; okuma en başa, hiçbir yazımdan önce taşındı — pointerdown'ın senkron süresi 42,9 -> 23,1 ms (gerçek tarayıcı, 4× CPU)
Websitesinde programda kartları kaydırırken çok kasma oluyor.             -> [x] 2026-09-01, drag başlangıcı 125 -> 46,2 ms
aynı şey daha da az olsa da uygulamada da oluyor. uygulamada daha çok koyulabilir yerlerin üzerine gelince hesaplama olunca oluyor. -> [x] 2026-09-01, dropMap + boya yolu
uygulamanın logosunun aşağıda nasıl gözüktüğünün fotosonu attım onun düzelmesi lazım. ayrıntılı logo kullanılmalı. -> [x] 2026-09-01, yalnız 16 sade; 20+ ayrıntılı
Dersler sınıftan kısmında branş seçmenin önünde branş yazıyor onu düzelt. -> [x] 2026-09-01, görünür etiket kalktı; aria-label kaldı
Derslerin blok saatleri 2 3 ve 4 de olabilsin.                    -> [x] şema v9, Lesson.blocks
Branş isimleri değiştirme de olsun.                               -> [x] renameSubject() (cascade'li)
Sıralamada aşağı yukarı işareti düzgün olsun.                     -> [x] B1.2 (2026-08-31)
Öğretmenin bilgisine girip bir sınıfı başka bir hocaya aktarma.    -> [x] AC5, transferLesson()
Aynı şekilde öğretmenin bilgilendirmesine girip de yapılabilsin.   -> [x] AC5, Inspector düzenler oldu
ASC derslerinde ekleme ya da değiştirme kısmına bak.               -> [x] AB8, docs/asc/ekran/
Uygulamanın windows çubuğundaki simgesi büyük simge olsun.         -> [x] AB5, eşik 20 -> 32
Babamın windowsu çok büyük, ölçeklendirmeyi azaltmamız lazım.      -> [x] AB4, kök 13px + %80 basamağı
Dosyadan aç biraz sıkıntılı gibi ya da yavaş.                      -> [x] ÖLÇÜLDÜ: parseState 0,65 ms.
                                                                        Yavaş değil; sürtünme onay diyaloğu (bilerek)
Çıktıda blok dersler programdaki gibi birleşik görünsün.           -> [x] Print.tsx colSpan (415 · 495)
Readmenin ingilizce olması ve githubtaki her şeyin ingilizce.       -> [x] AB7
Ayarlarda görünüm kısmı düzenlensin, infolar çok uzun.             -> [x] AB2, en uzun .hint 438 -> 126
Hareket ve Dil solda olmalı.                                       -> [x] AB1
Hiçbir yerde sağdaki bloklar sağa sola hareket etmesin.            -> [x] AA2 + AB3
Listelerde ekleme kısmı ayrı blok olsun, sadece çizgi olmasın.      -> [x] AA1
Müsaitlikteki programların satırlarının uzunluğu artsın.            -> [x] AC2, 42 -> 54,3 px
Ayarlardaki bölüme özgü ayarlar o bölümün şeridinde sağ üstte.      -> [x] AB1
Çıktıdaki sağ blokların aşağı yukarı gitmesi babam için zor.        -> [x] AB3, üç kaydırıcı -> bir
Öğretmenler listelerde branşlarda kısaltmalar.                     -> [x] otuz dördüncü oturum
Program kısmında branşlar kısaltmalar olsun sol tarafta.            -> [x] otuz dördüncü oturum
Programda derslere sağ tıklayınca seçenekler gelsin.                -> [x] program.spec.ts 86, yedi kalem
Okul tarafında yeni ekleme bloğu simetrik olmalı.                   -> [x] AC1, beş ekranda eşit
Dersler öğretmenden tarafında branş ayrıca yazıyor, gereksiz.       -> [x] ÖLÇÜLDÜ: zaten kapalıydı
Programda satır/sütun/gün sabitleme sağ tıkla açılsın.              -> [x] AC5, "Toplu sabitle"
Programda satır ghostlama / anlık kapatma, günler için de.          -> [x] AC5, "Geçici görünüm"
Tüm programı sabitleme, programlar arası değiştirme.                -> [x] AC4, Izgara + kitaplık menüleri
Program sectionu açılırken bi' yavaşlama oluyor.                    -> [x] B1.4 ÖLÇÜLDÜ, teori çürütüldü
Listelerdeki açıklamaların hizaları da aynı olsun.                  -> [x] B1.3 ölçüldü, sapma YOK
Müsaitlikteki alttaki programla üstteki benzer olsun.               -> [x] AC2
Arama kısmını düzelt, en sağda saçma sapan bir çizgi var.           -> [x] B1.2, visibility: hidden
Filtrelere başka filtreler de getir, çoktan aza ifadelerini kaldır. -> [x] loadStatusFacet (fb052f4)
Dersi düzenlemede dersi başka bir hocaya verme de olmalı.           -> [x] AC5
O raptiye işareti hover edildiğinde gelsin şeffaf olmasın.          -> [x] AC3 (karar: hep görünür, sönük)
Sağ tıkta da sabitleme özelliği olsun.                              -> [x] AC5
Derslerde öğretmene/sınıfa göre filtre olması saçma.                -> [x] ÖLÇÜLDÜ: zaten kapalıydı
Saat açma kapama çalışmıyor müsaitlikte.                            -> [x] B1.1 (2026-08-31), tuzak 102 · 103
```

### 9c · X turu (2026-08-28) · on iki satır, on ikisi de bitti

> Kurulumda Derslikler Öğretmenler ve SInıfların yanında 1 2 3'ü kaldır. → X1
> Tüm Listeleri de olabildiğince birbiriyle simetrik ve uyumlu yap. → X2
> Sınıflar listesinde ad niye o kadar kaymış ve ayrıca o kadar uzun. Derslikte de çok uzun. Uzun olması daha iyiyse beni ikna et ve öyle kalsın. → X2
> Sol üstteki logonun küçüğü kullanılsın. → X3
> İkinci barın açılıp kapanması ayarlarda bir ayar olsun. → X10
> İkinci barın en başındaki yazıdan sonra gelen çizgi her sectionda aynı yerde olsun ve yazı ortalansın gerekirse ona uygun bir yazı seçilsin. → X4
> Öğretmenin tek bir branşı varsa seçme tuşu açılmasın dersler sectionu öğretmenden seçeneğinde, varsa tabii ki açılsın. Başlıkta branşı da yazsın. → X5
> Programda blok saatlerinin yeni mantığından dolayı önizleme artısı kaymış durumda. Foto örnek fotolarda. → X6
> Programda kartların üzerinde gözüken kaç tane olduğunu gösteren rozet kalksın. → X7
> Yazdırmada yazıları büyük yapınca yazdırma bozuluyor. Önizleme doğru olmasına rağmen. → X8
> Öğretmenler kısmında ve yazdırma kısmında ve başka diğer yerlerde de yan bloklar çok uzun ve sırf onlardan dolayı tüm sayfanın uzunluğu artıyor buna bir çözüm bul. → X9
> Ayarların altındaki sectionları da düzenle. Cesur ve fazla değişiklik yapabilirsin. Sectionları artırabilir azaltabilir düzeni değiştirebilir her şeyi yapabilirsin. → X11, sonra Y6

### 9d · Y turu (2026-08-28) · on satır, onu da bitti

> Branşlar kuruluma gelsin. → Y2
> Branşlarda yanda hazır eklenebilirleri ekleyelim. → Y3
> Kurulum müsaitlik falan işte üst taraftaki sectionların da isimleri daha güzel hale getirilebilir. → Y1
> Kurulum öğretmenlerde kurulum durumu dersler sekmesine gidinize gerek yok. Hatta direkt onu da silebilirsin çok fazla kaydırma olmuş gereksiz. → Y4
> Kurulum özeti ya da özet vebenziren çevrilebilir o. ya da artık ileride nasıl adlandıracaksak. → Y4
> Öğretmenler Sınıfflar dersliklerde yazdığı gibi derslerin içinde genelin yanında da toplam dersler yazsın. → Y10
> Kontrol tarafında hepsi sorunlar kapasite biraz fazla gereksizler gibi ya düzgün şekilde onları doldur ya da öyle gereksiz yapma. ayrıca çok aşağı doğru gidiyor daha mantıklı bir çözüm bulunabilir mi? → Y7
> Listelerdeki satırlar en sona kadar gitsin. Böyle cücük kadar oldular güzel de gözükmüyor. → Y9
> Listelerin yanındaki bloklar kesinlikle sağ sol oynatma olmasın adamakıllı ortalansın ve sığdırılsın. → Y8
> Ayarların altındaki sectionları da düzenle. Cesur ve fazla değişiklik yapabilirsin. → Y6
> Tüm sectionları cesurca her şeyi değiştirebilsirsin. → Y1–Y10'un tamamının izni

### 9e · AA turu (2026-08-29) · beş satır, beşi de bitti — şema v10 → v11

> Listelerde ekleme kısmı ayrı blok olsun. aynı özetin ayrı blok olduğu gibi, yani sadece çizgi olmasın. → AA1
> Özetler içlerindeki bilgilerin uzunluklarına göre uzunlukları değişebilir ama en fazla tam ekranın uzunluğu kadar olsun ondan fazla uzun olmasın eğer liste çok uzunsa işte kaydırma o özetin içinde olsun. → AA2
> Özetteki hatalar özetin en üstüne gelsin. Hata gidince yok olsun. → AA3
> Sınıfların özel olarak bir günde aynı dersten kaç saat girme opsiyonu olsun. → AA4
> Branşların kısaltma varsayılanı varsayılan ismi en üste liste katgeorisine gitsin. → AA5

---
## §10. ARŞİV — biten turlar, tarih sırasıyla

> **Bu bölüm bir GÜNLÜK, bir izin listesi değil.** Buradaki maddeler o gün
> geçerli olan kuralla alınmış kararları anlatıyor ve **geriye dönük
> düzeltilmiyorlar** — düzeltilirlerse kayıt yalan söyler. Eski `(ilke 5)`
> atıfları, sonradan kaldırılmış yasaklar ve o gün doğru olan ölçümler
> **olduğu gibi** duruyor.
>
> Ölçülen sayılar [STATUS.md](STATUS.md)'de oturum oturum; buradaki maddeler
> oraya işaret ediyor.

**Arşiv haritası — YENİDEN ESKİYE:**

| Tarih | Tur | Ne yapıldı |
|---|---|---|
| 09-04 | **Tek sorumluluk turu** | yedi modül bölündü (store · entities · drag · constraints · App · Program · Ribbon), 47 test dosyası, her tur `kontrol` yeşili |
| 09-01 | **Sürüklerken hover'ın maliyeti** | B4.8; kare 1,8 -> 0,4 ms, hover süsleri sürüklemede kapalı |
| 09-01 | **Program performansı, renk ve güvenli takas** | B2.11 · B4.7 · B5.7; açılış ve sürükleme bütçesi geçti |
| 09-01 | **Son not defteri turu** | sürükleme %63 hızlandı, ayrıntılı görev çubuğu simgesi, Sınıftan Branş etiketi |
| 08-31 | **Program ve blok dağılımı · şema v13** | gerçek Sığdır, havuz sağ tık, kombinasyon seçici, kırmızı kapalı saat |
| 08-31 | **Bölüm 1** | müsaitlikteki saat düğmesi, arama şeridi, Program'ın hızı, yedi kırmızı |
| 08-30 | **aSc araştırma hattı** · **AB turu** · **AC turu** | 2940 metin + 528 konu, yedi + altı madde |
| 08-29 | **otuz dördüncü oturum** · **v2.0.0 YENİ AD** · **AA turu** | dört madde, Mozaik, şema v11 |
| 08-28 | **Y turu (arayüzün şekli)** · **X turu** | yirmi iki ham not |
| 08-27 | **v2.0.0 DİL** · **W · U · E · V turları** | beş dil, güncelleme, hareket ayarı, dokuz madde |
| 08-26 | **D · F · B · Y turları** | tasarım kısıtları kalktı, elle sıralama, `dersprogrami.localhost`, A4 |
| 08-25 → 08-27 | **v1.0 teslim turu** · **Tauri** | `.exe` · site · planlar · klasör |
| 08-25 | **Tasarım sistemi (A0–A6 + B)** · araçlar | o günkü tasarım sistemi |
| 08-23 → 08-25 | **BİTENLER 0–15** | v0 → v0.9: çekirdek, ızgara, sürükle-bırak, baskı, otomatik dizme |

---

### 2026-09-04 · Tek sorumluluk turu — **BİTTİ ✅**

İstek: *"her bir classı teker teker refactor edelim. Single responsibility ...
Her bir fonksiyonun tek bir görevi olsun. Classlar ve fonksiyonlar kısa
olsun."* Depoda OOP class yok (tek `class` bir test taklidi), o yüzden önce
soruldu: kapsam **`src/` altındaki her modül** oldu, mimari değişmedi.

- [x] **`store.ts` (922) → dokuz dosya.** Saf reducer · parseState · coerce ·
      stateFields · migrateLegacy · planStorage · backupFile · textInput ·
      useStore. Fan-out dar olduğu için çağrı yerleri doğrudan güncellendi.
- [x] **`entities.ts` (1454) → barrel + 18 dosya.** Kırk dosya bu yolu
      söylüyor, o yüzden ad `export *` barrel olarak kaldı ve **tek bir çağrı
      yeri değişmedi**. `lessonMove.ts` düz CRUD'dan ayrı: o ikisi yerleşmiş
      her bloğu kaldırıp `blocker()`'a yeniden soruyor.
- [x] **`drag.ts` (645) → 331 + altı dosya.** Ölçüt fiil değil **ref**:
      dragGeometry (saf) · dragHitTest · dragPaint · dragShades · dragGhost ·
      reasonBar. Yaşam çevrimi hook'ta kaldı. `dragGeometry` artık
      tarayıcısız test ediliyor (7 yeni test).
- [x] **`constraints.ts` (1443) → barrel + yedi dosya.** placement ·
      blockerRules · pinning · swap · dropMapping · closedConflicts ·
      sanitize; sıra bağımlılık sırası. `occupy`/`vacate` bilerek
      `place()`+`buildIndex()` ile aynı dosyada.
- [x] **`App.tsx` (1341 → 1109) → beş kanca.** useMachinePrefs ·
      useMainChrome · useOpenBackup · useAppShortcuts · useProgramMasks —
      hepsi hâlâ `App()` içinden çağrılıyor (tuzak 18).
- [x] **`Program.tsx` (1355 → 954) → üç saf oluşturucu.** programGrid ·
      programPool · programBar. Üçü de zaten JSX'e dokunmuyordu; ayrıldıkları
      için artık jsdom'suz test edilebilirler.
- [x] **`Ribbon.tsx` (1134 → 78) → sekme başına bir dosya.** `ribbon/parts.tsx`
      şeridin ŞEKLİNİ taşıyor (beş maddelik standart orada, çünkü hepsi şekil
      hakkında), `ribbon/props.ts` tek arayüz ve her sekme `Pick`'liyor — yani
      bir dosyanın import satırı o sekmenin hangi kontrollere dokunabildiğini
      söylüyor.
- [x] **Testler aynı sınırlarla bölündü:** 29 → 47 dosya, 765 → 772 test.
      Paylaşılan fixture'lar `entityFixture.ts` ve `constraintFixture.ts`'e.
- [ ] **Ölçülmedi:** açılış süresi ve `dist/index.html` boyutu. Kod aynı kod
      ama bu bir varsayım; bir sonraki turda ölçülmeli (tuzak 42).

Ayrıntı: [STATUS.md](STATUS.md) elli ikinci oturum.

---

### 2026-09-01 · Sürüklerken hover'ın maliyeti — **BİTTİ ✅**

- [x] **B4.8 Sürükleme karesi.** Şikayet üçüncü kez geldi (*"kartı satır
      üzerinde ... gezdirirken kasma"*) ve ilk kez **kare** ölçüldü: gerçek
      `dist/index.html`, Chromium izi, en yoğun öğretmenin satırında ~200 kare.
      Üç sebep: sürüklerken hover'ın durmaması (raptiye ve kart çerçevesi,
      izde 444 `Animation` stil hesabı), karenin kendi yazdığından sonra
      `getBoundingClientRect()` okuması, ve her karede `elementFromPoint`.
      Üçü de kapandı; ana iş parçacığı kalemleri (10× CPU) **9475,7 →
      7133,7 ms**, sürükleme karesinin betiği (4×) **1,8 → 0,4 ms**, uzun
      görev 12 → 1–5. Neden çubuğunu kısmak denendi, ölçüldü ve **geri
      alındı** (aynı boyama bir kare öteye taşınıyor); kalan koruma eşitlik
      kapısı. `.ghost` / `table.grid` katmana alma ve `.reason-bar` içerme de
      ölçülüp reddedildi. `State` ve `schemaVersion` değişmedi.
      Ayrıntı: [STATUS.md](STATUS.md) elli birinci oturum, tuzak 108.

---

### 2026-09-01 · Program performansı, renk ve güvenli takas — **BİTTİ ✅**

- [x] **B4.7 Program açılışı ve sürükleme.** Aynı `dist/index.html` web ve
      masaüstünde korundu. Özdeş bekleyen blokların destesi DOM'da tek gerçek
      `.pool-card`, model sayısı `.pool-stack[data-count]`; neden çubuğu
      sürükleme boyunca saf DOM. Havuz boyası ilk iki kareden sonraya alındı,
      işaretçi havuza erken girerse anında açılıyor. Örnek okul, 1920×1080,
      Chromium 4× CPU: sıcak açılış medyanı **169 → 123,3 ms**, p95
      **183,5 → 139,6 ms**; 300 harekette p95 **15,8 ms**, en kötü **18,9 ms**,
      50 ms üstü kare **0**. İkinci aşamadaki satır başına tek zaman yüzeyine
      gerek kalmadı.
- [x] **B5.7 Güvenli kart takası.** Sürükleme kararı `place` / `evict` /
      `swap` ve tam kaynak-hedef bloklarını taşıyor. Öğretmen ve sınıf
      görünümünde iki blok, uzunluklarını koruyarak tek saf yardımcıyla yeniden
      doğrulanıyor; sabit, değişmiş ya da sert kurala aykırı hedef işlem
      yapmıyor. Geçerli takas tek reducer ve tek geri-al adımı. Dolu hedefteki
      sarı/kırmızı hüküm artık kartın kendi üstünde de görünüyor.
- [x] **B4.2'nin renk ölçütü.** `Öğretmen · Sınıf · Derslik · Branş` modu
      ızgara, havuz ve hayaleti aynı çözümleyiciyle boyuyor; seçim
      `ders-programi-program-rengi` altında cihazda kalıyor. `State`, yedek ve
      `schemaVersion` değişmedi. Zoom ve serbest kaydırma açık.
- [x] **B2.11 Küçük arayüz işaretleri.** Okunmamış yenilik noktası Ayarlar ve
      Hakkında düğmesinde birlikte; Hakkında açılınca ikisi de temizleniyor.
      `.menu-item.danger` kırmızı metin ve kırmızı hover/odak zemini taşıyor;
      mevcut onaylar korunuyor. Yeni metinler beş dilde.

---

### 2026-09-01 · Son not defteri turu — **BİTTİ ✅**

- [x] Program kartı sürükleme başlangıcında `Grid`/satırlar React ile yeniden
      çizilmiyor; hedef satır ve önizleme doğrudan, sürükleme başına bir kez
      işaretleniyor. Sürekli rAF döngüsü yalnız hareket veya kenar kaydırma
      varken çalışıyor.
- [x] `dropMap()` hedef sınıfın yerleşmiş bloklarını bir kez indeksliyor ve her
      hücrede aynı engel hesabını iki kez yapmıyor.
- [x] Geniş satırlardaki pahalı `opacity` katmanları yerine hedef satırın üstü
      ve altında iki düz gölgeleme kullanılıyor. Yoğun program + 4× CPU:
      file `125 → 46,2 ms`, HTTP `47,1 ms`; ölçülen uzun görev yok.
- [x] Görev çubuğu ICO'sunda yalnız 16 px sade; 20/24/32/40/48 ve üstü
      ayrıntılı logo. Dokuz Windows boyutunun tamamı dosyada.
- [x] Dersler → Sınıftan formunda görünen `Branş` etiketi kalktı; erişilebilir
      adı ve `Tüm branşlar` seçeneği korundu. Genel modun etiketi değişmedi.

---

### 2026-08-31 · Program ve blok dağılımı — **BİTTİ ✅**

- [x] Sığdır, 1280/1366/1920 genişliklerinde ve büyütülmüş arayüz ölçeklerinde
      yatay kaydırmayı sıfırlıyor; kart yazısı 12 px altına inmiyor.
- [x] Alt havuz kartlarının sağ tık menüsünde üç düzenleme yolu ve geçici satır
      görünümü çalışıyor; konum isteyen maddeler görünür fakat kilitli.
- [x] Dağılım sayaçları yerine bütün 3/2/1 kombinasyonlarını gösteren ortak
      seçici geldi; sert günlük sınıra uymayan seçenekler gerekçesiyle kilitli.
- [x] Şema v13 ile 4 saatlik blok desteği kalktı; v9–v12 `4 → 3+1` göçü
      alternatif programların yerleşimlerini ve sabitlemelerini koruyor.
- [x] Program'ın müsait olmayan çarpısı Müsaitlik tablosuyla aynı büyük kırmızı
      görünümü kullanıyor; taralı zemin iki tabloda da duruyor.

---

### 2026-08-31 · Bölüm 1 — kullanıcının kalan küçük maddeleri — **BİTTİ ✅**

> Kullanıcı *"tasklarda kalanları yapalım kısım kısım"* dedi ve kapsam
> **Bölüm 1** seçildi. Beşi de kapandı; ölçümler
> [STATUS.md](STATUS.md) → *Otuz dokuzuncu oturum*.

- [x] **B1.1 Müsaitlikte "Saatler" düğmesi ölüydü.**
      `:root[data-density='sigdir'] .hour-clock` seçicisinde `table.grid`
      yoktu, yani Sığdır yoğunluğunda müsaitlik başlığının saatini de
      kapatıyordu — ve `display: none`, düğmenin çevirdiği `visibility`'yi
      yeniyordu. Ölçüldü (üç yoğunluk × iki durum), daraltıldı, yanına
      Sığdır'da koşan bir test yazıldı ve **kırmızıya döndürüldü**.
      Tuzak 102 · 103.
- [x] **B1.2 Aramanın sağındaki "saçma sapan çizgi".** Pasif sıralama yönü
      düğmesiymiş: etiketsiz, `--paper` zeminli, tıklanmayan bir kutu.
      Kaldırmak ölçüldü ve **şeridi 6,5 px kısaltıyordu** (tuzak 94), o
      yüzden `visibility: hidden` — kutu kalıyor, işaret gidiyor.
      İki yıllık gerekçe (*"menüyü oynatır"*) ölçülerek çürütüldü.
- [x] **B1.3 Liste açıklamalarının hizası — ÖLÇÜLDÜ, sapma YOK.** Beş
      ekranda `descTop` 147,8 / `hintTop` 151,0 (%150'de 219,1 / 224,0).
      AA1 ve AC1 kapatmış, `kurulum.spec.ts` 44 çiviliyor. Kod yazılmadı.
- [x] **B1.4 "Program açılırken yavaşlama" — ÖLÇÜLDÜ.** Şikayet gerçek:
      Program 32,6 ms (x1) · 144,8 (x4) · 302 (x8), öteki sekmeler 6–50 ms.
      Profil `gridChrome.scrolled()`'ü gösterdi (bir çağrı, 119,7 ms, CPU'nun
      %35,3'ü) ama **erteleme toplamı değiştirmedi** (105 ↔ 104,5 ms), yani o
      düzen israf değil. Değişiklik geri alındı, ölçüm koda yazıldı
      (tuzak 105). Kalan maliyet 1950 hücrenin boyaması.
- [x] **B1.5 Devralınan YEDİ kırmızı kapandı.** Hepsi `fb052f4`'ten:
      Program `<Activity mode="hidden">`'a sarılınca DOM'da kalmaya başladı
      ve gizli sekmenin adları her sekmeden bulunur oldu. Yeni yardımcı
      `onScreen()`; artı `serit.spec.ts`'in `go()`'su şeridi açıp hareketi
      bekliyor. Tuzak 104.

**Zaten kapalı bulunan üç satır** (kod yazılmadı, ölçülerek kapandı):
ders formundaki fazladan "Branş" etiketi · *"filtrelere başka filtreler"*
(`loadStatusFacet`) · Dersler'de gereksiz eksen süzgeci.

`npm run kontrol` YEŞİL: **725 birim · 528 E2E · 22 site · 7 çözücü.**
`dist/index.html` **962 434 bayt**.

---

### 2026-08-30 · aSc karar kaydı — **KARARLAR VERİLDİ**

**Kova 1 · 2 · 3 · 4 evet, kova 6 hayır.** Tam ve yetkili tablo
[ASC.md](ASC.md) → *Karar tablosu*; oradan çıkan **açık işler bu dosyanın
§3 · §4 · §5 · §6 bölümlerinde** numaralanmış hâlde duruyor.

**O gün kapanan sorular:** seçmeli ders **yok** (ama B6.1 yine de yapılacak,
kullanıcı *"olsun"* dedi) · **tek bina** (binalar özelliği düştü) · Türkiye
sürümü **boş verildi**.

**Bu makinede yapılan:**

- [x] **UTF-8 düzeltmesi uygulandı** — `ACP 65001 -> 1254`, `OEMCP -> 857`,
      `MACCP -> 10081`, sistem yereli `tr-TR`. *(Yeniden başlatma ve turun
      tekrarı → **R1**.)*

---

### 2026-08-30 · v2.0.1 öncesi devir listesi — **İKİSİ AÇIK KALDI**

- [x] **`npm run yayinla -- 2.0.1`** — yapıldı (`54403b6`, `v2.0.1`).
- [→] Yayından sonra Windows'ta denensin → **B7.1**
- [→] GitHub Pages custom domain temizlensin → **B7.2**

Ve hâlâ bekleyen tek büyük şey: **babanın gerçek listesi** — v0'ın çıkma
şartı (§8c).

---
### 2026-08-30 · devir notu (otuz sekizinci oturumun sonu)

> Bu oturumda **kod yazılmadı**; yazılan şey bir **araştırma hattı** ve bir
> **karar tablosu**. Aşağısı o günkü devir notunun kendisi. Üç işinden ikisi
> §3–§6'ya, biri **R1**'e taşındı.

> ### DEVİR (2026-08-30, otuz sekizinci oturumun sonu)
>
> Bu oturumda **kod yazılmadı**; yazılan şey bir **araştırma hattı** ve bir
> **karar tablosu**. Yeni sohbetin ilk okuyacağı yer [ASC.md](ASC.md) →
> *Karar tablosu*, ikinci yer [PLAN.md](PLAN.md) → **v4**.
>
> **İlk üç iş, sırayla:**
>
> 1. **Windows'u yeniden başlat, sonra `scripts/asc-tur.ps1`'i bir kez
>    koştur.** UTF-8 düzeltmesi uygulandı (`ACP 65001 -> 1254`) ama yeniden
>    başlatmadan geçerli olmuyor. Şu anki 18 ekran görüntüsü hâlâ bozuk Türkçe
>    harf taşıyor ve yeniden başlatmadan çekilen her yenisi de bozuk olur.
> 2. **Kova 4'ün önkoşul maddeleri**: okul adı · öğretim yılı · okul logosu ·
>    sınıf öğretmeni · özel alanlar. Bunlar baskı tasarımının **değişkenleri**
>    ve olmadan kova 1'in baskı yarısı yazılamaz.
> 3. **Tuval ölçümü**: 2100 hücrede zoom `transform: scale()` mi `--cell-w` mi.
>    Ölçülmeden yazılırsa yanlış olan seçilir (tuzak 10 · tuzak 42).
>
> **Değişen ilkeler** — CLAUDE.md güncel, ama yeni sohbet bunları bilmeli:
> 5. ilke (*"bir dönem kullanılmadan özellik eklenmez"*) **kaldırıldı**,
> kurulum ve paylaşma yasakları **kalktı**, hedef **%50**. Geriye üç engel
> kaldı: ilke 2 (sunucu yok) · ilke 3 (çalışırken ağ yok) · yasak liste.
>
> **Babaya sorulacak iki soru:** vekil öğretmen (Substitution) ve nöbet.


---

### aSc araştırma hattı — **KURULDU ✅** (2026-08-30, otuz sekizinci oturum)

aSc bu makinede kurulu çıktı (`C:\TimeTables`), emülatör gerekmedi. Üç kaynak
da yeniden üretilebilir; karar haritası [ASC.md](ASC.md), ölçümler
[STATUS.md](STATUS.md) → *Otuz sekizinci oturum*.

- [x] `scripts/asc-sozluk.mjs` → **2940 arayüz metni**, EN ↔ TR (%98 Türkçe)
- [x] `scripts/asc-yardim.mjs` → **528 yardım konusu**, 19 bölüm, 0 hata
- [x] `scripts/asc-ekran.ps1` → pencere yakalama (UI Automation çalışmıyor,
      ölçüldü: 0 kontrol)
- [x] `scripts/asc-tur.ps1` → **18 ekranlık tam tur**, Türkçe arayüzde; sonunda
      MD5 karşılaştırıp kaçan tıklamayı haber veriyor
- [x] **Arayüz Türkçeye alındı** (`Lang0: e → t`); program kendi adını da
      değiştiriyor: *aSc k12 Bilişim Ders Planlama 2027*
- [x] `docs/ASC.md` → 19 bölümün tablosu + kısıt karşılaştırması + ekran envanteri

**Bunlar `npm run kontrol`'ün parçası DEĞİL** — `font`/`exe`/`patrol` gibi, bu
depoda olmayan bir şeye bağlılar (aSc kurulumu, ağ).


---

### AB turu — Z planından devreden maddeler — **BİTTİ ✅** (2026-08-30)

Sekiz maddenin **yedisi** yapıldı. AB8 hâlâ fotoğraf bekliyor. Ölçümlerin
hepsi [STATUS.md](STATUS.md) → *Otuz yedinci oturum*.

> **BU TURUN EN PAHALI BULGUSU BİR KOD DEĞİL: İKİ MADDENİN PLANI YANLIŞTI.**
> AB5 "ikon exe'ye gömülmüyor olabilir" diyordu, AB6 "VERSIONINFO yok"
> diyordu. İkisi de yayınlanmış ikiliye bakılarak sınandı; ikisi de **yanlış**.
> Kayıt burada dursun ki bir daha aynı yere bakılmasın — ve yeni **tuzak 101**
> bunun genel hâlini yazıyor.

- [x] **AB1 Hareket ve Dil SOLA, bölüme özgü ayar ŞERİDE.** İki panel sağ
      raydan sol sütunun sonuna taşındı; rayda tek panel kalınca `Örnek`
      tablosu `.stat-scroll`'a girdi (otuz beşinci oturumun sözleşmesi: kayan
      şey liste, panel değil). Ayarlar şeridinin **boş olan sağ ucu** doldu:
      Görünüm'de `Tema` (tek kontrol; o bölüm kayacak kadar uzun ve tema onun
      ilk paneli), öteki dörtte bir `.ribbon-value` okuması. **Yoğunluk
      konmadı, ve önce ölçüldü**: %150'de pay 574 px, maliyet 400 px — yani
      sığıyordu; engel yer değil belirsizlik (o ekranda iki yoğunluk ekseni
      var). Yeni `serit.spec.ts` 60, mutasyonla sınandı.
- [x] **AB2 İnfolar kısaldı — her ekranda.** Ekrandaki en uzun `.hint`
      **438 → 126 karakter**. Kural: tek cümle, ~90 karakter, uzayan gerekçe
      `title`'a (bunun için `AddPanel`'e `more` prop'u). Dört sözlük **elle**:
      66 ölü anahtar silindi, 75 yeni anahtar yazıldı (300 çeviri). Almanca
      tarama (tuzak 89) arayüzden **sıfır** Türkçe satır buldu; çıkan 15
      satırın on beşi de örnek okulun öğretmen adları. Yeni tavan testi
      `metin.spec.ts`'te (140), `.data-hint` hariç ve sebebi yazılı.
- [x] **AB3 Çıktının sağ bloğu: üç kaydırıcı BİRE indi.** `.pick-items`'ın
      168 px'lik tavanı kalktı (ham piksel: ölçek büyüdükçe oransal olarak
      daha az ad tutuyordu), `min-width` 240px → **16rem** (ölçülen min-content
      206 px @%100 · 305 px @%150), `.pickers` `auto-fit` grid oldu ve Çıktı'nın
      rayı `min(37rem, 32cqw)`. %100'de iki liste **yan yana**. Yeni
      `yazdir.spec.ts` 84, mutasyonla sınandı.
- [x] **AB4 Kök 13px VE %100'ün altı.** Tipografi merdiveni 13'e yeniden
      sabitlendi (px karşılıkları korundu), `SCALE_MIN` 0.80, `SCALE_DEFAULT`
      **1 kaldı** — kimsenin ekranı kendiliğinden küçülmez. Küçülen şey rem
      cinsinden yazı olmayan her şey: **%7,1**. %80 · %100 · %150'de iki temada
      ölçüldü **ve bakıldı**: yatay taşma 0, kırpılan kutu 0. Yeni test
      `gorunum.spec.ts` 44 (taban %80).
      **Kullanıcı kararı:** 12 px tabanı **%100'de** geçerli; %80 gidilen bir
      yer, açılan değil.
- [x] **AB5 Windows simgesi — ÖLÇÜLDÜ, ve plan yanlıştı.** Yeni
      `scripts/exe-ikon.mjs` PE kaynak tablosunu ayrıştırıyor; yayınlanmış
      2.0.0 ikilisinde **dokuz ikon boyunun dokuzu da var** ve `icon.ico` ile
      birebir tutuyor. Yani hiçbir şey eksik değildi. Sebep çizimdi: 24 px'te
      ayrıntılı çizimin altı çubuğu 2,25 cihaz pikseli, araları 0,56 px.
      **Kullanıcı kararı: eşik 20 → 32**, yani 16 · 20 · 24 sade çizim.
      `icon.ico` yeniden üretildi, `temel.spec.ts` 79 güncellendi, ve
      `surum.yml`'e bir **kapı** eklendi ki varsayım geri gelmesin.
- [x] **AB6 Virüs / SmartScreen — sertifikasız hafifletme.**
      `-ExecutionPolicy Bypass` **dört yerden de** kalktı; yerine `RemoteSigned`
      + `Unblock-File`. `kur.ps1` kopyaladığı `.ps1`'leri de unblock ediyor.
      `SHA256SUMS.txt` yayına eklendi. README Windows'un ne diyeceğini ve
      yanlış-pozitif bildirim adreslerini yazıyor.
      **VERSIONINFO zaten VARDI** (5 alan) — madde ölçümle kapandı.
      **`strip = false` ÖLÇÜLEMEDİ**: bu makinede Rust yok, `Cargo.toml`'a
      dokunulmadı, ve ölçmeden bir entropi iddiası yazmak tuzak 65 olurdu.
- [x] **AB7 Vitrin İngilizce + LICENSE.** `README.md` kısa ve İngilizce;
      `CLAUDE.md`, `docs/`, `.claude/` **Türkçe kaldı** ve README sebebini
      yazıyor. `surum-notu.md` İngilizce **ama sonunda üç satır Türkçe kurulum
      özeti var** — o sayfa babanın indirirken gördüğü sayfa. İş akışlarının
      adları, işleri, girdileri ve adımları İngilizce. **`LICENSE` eklendi**
      (MIT + gömülü IBM Plex için OFL 1.1), `package.json`'a `license` alanı,
      iki `description` İngilizce.
- [x] **AB8 aSc ders ekranı — KAPANDI (otuz sekizinci oturum).** Fotoğrafı
      beklemeye gerek kalmadı: aSc bu makinede kurulu çıktı, arayüzü Türkçeye
      alındı ve `scripts/asc-tur.ps1` ekleme pencerelerini de çekti
      (`28-brans-ekle`, `30-ogretmen-ekle`).

`npm run kontrol` yeşil: **719 birim · 514 E2E · 22 site · 7 çözücü.**

> **Devralınan ölçüm borcu da kapandı** (AC turu bunu "bir sonraki turun ilk
> işi" diye bırakmıştı): `dist/index.html`'in sıçraması **atfedildi**. Dört
> sözlük 356 533 bayt (%34,6), `@radix-ui/react-context-menu` yalnız **7 107
> bayt** (%0,7), geri kalan 667 885. Yani sıçramanın kaynağı bir bağımlılık
> değil **veri**. Bu turdan sonra dosya **961 584 bayt** — AB2'nin sildiği 66
> ölü anahtar yüzünden 69 941 bayt **düştü**.

#### Bu turdan çıkan, yapılmayan tek şey

- [→] **`.color-dot`'un sağında boşluk yok.** Ayarlar → Görünüm'ün `Örnek`
      tablosunda renk noktası ada yapışık duruyor (`●Mehmet Çelik`). Bu turun
      eseri **değil** ve bu turda düzeltilmedi: sınıf altı yerde kullanılıyor
      ve ikisi kendi boşluğunu flex `gap`'ten alıyor, yani paylaşılan sınıfa
      `margin` eklemek ötekileri çift boşluklu yapar. Çare çağrı yerinde.

---

#### AB turu — ÖLÇÜLDÜ, iddia edilmedi

Bu iki madde plana "yapılacak" diye yazılmıştı; ölçüldüler ve **plan yanlış
çıktı**. Kayıt burada dursun ki bir daha aynı yere bakılmasın.

- **"Dosyadan aç yavaş" — parse YAVAŞ DEĞİL.** Dolu bir haftada (426
  yerleşim, sampleState) ölçüldü:

  | Ne | Süre |
  |---|---|
  | `JSON.parse` | 0,17 ms |
  | `sanitize` | 0,33 ms |
  | `parseState` (hepsi) | **0,65 ms** |
  | `health()` | 5,8 ms |

  Plan `sanitize`'ın iki kez koşmasını kaldırmayı öngörüyordu; maliyeti
  **0,33 ms**, yani hissedilen yavaşlığın sebebi o değil. Yapılan tek gerçek
  düzeltme: **hata yolu dosyayı iki kez okuyup iki kez ayrıştırıyordu**, artık
  bir kez okuyor (`readBackupFile` tek çağıranıydı, silindi).
  **Geriye kalan sürtünme onay diyaloğu**: dosya seçiliyor ve açılmak yerine
  bir daha soruluyor. Bilerek öyle — üst çubuk, hiçbir tıklamanın bir
  öğleden sonrayı götüremeyeceği yer.

- **`kayma.spec.ts` "taşan bölümle taşmayan bölüm AYNI genişlikte" macOS'ta
  DÜŞÜYOR, ve kusur kodda değil.** Testin kendi koruması söylüyor:
  *"kaydırma çubuğu yer kaplamıyor — bu test hiçbir şey ölçmüyor"*. macOS'un
  bindirmeli kaydırma çubuğu 0 px, yani ölçmek istediği oluk orada yok.
  Regresyon değil, **platform farkı**; koruma işini yapıyor. Karar gerekiyor:
  oluk yoksa test `skip` mi etsin, yoksa yazıldığı makineye özel mi kalsın.

#### AB turu — yedi maddenin özeti

Yedisi de yapıldı; **AB8 otuz sekizinci oturumda kapandı** (aSc'nin ekleme
pencereleri artık `docs/asc/ekran/` altında). Maddelerin tamamı ve gerekçeleri
bu dosyanın altındaki *AB turu* bölümünde, ölçümler
[STATUS.md](STATUS.md) → *Otuz yedinci oturum*.

- [x] **AB1** Hareket ve Dil sola · Ayarlar şeridinin boş sağ ucu doldu
- [x] **AB2** İnfolar kısaldı: en uzunu **438 → 126** karakter · 4 sözlük elle
- [x] **AB3** Çıktının sağ bloğu: **üç kaydırıcı bire** indi
- [x] **AB4** Kök **13px** ve **%80** basamağı · %80/%100/%150'de bakıldı
- [x] **AB5** Exe ikonu **ÖLÇÜLDÜ** — gömülüymüş; eşik 20 → **32**
- [x] **AB6** `-ExecutionPolicy Bypass` kalktı · `SHA256SUMS.txt` · VERSIONINFO
      zaten varmış
- [x] **AB7** İngilizce README + `LICENSE` (MIT + OFL) + İngilizce iş akışları
- [x] **Devralınan ölçüm borcu:** `dist` sıçraması atfedildi — sebep bir
      bağımlılık değil **veri** (dört sözlük %34,6, sağ tık menüsü %0,7)

`npm run kontrol` yeşil: **719 birim · 514 E2E · 22 site · 7 çözücü.**
`dist/index.html` **961 584 bayt** (öncesi 1 031 525 — AB2 sayesinde düştü).

---


---

### AC turu — kullanıcının altı satırı — **BİTTİ ✅** (2026-08-30)

Tur bir **düzeltme turu**ydu: altı madde de çalışma ağacındaki bitmemiş turun
üstüne geldi. Ölçümlerin hepsi [STATUS.md](STATUS.md) → *Otuz altıncı oturum*.

- [x] **AC1 Ekleme bloğu kısaldı, simetri kalarak.** Kullanıcı kararı: yalnız
      kutu. `18.5rem → 13rem`, açıklama rayı `5.5 → 3.25rem`. Ölçüldü:
      %100'de **259 → 182 px**, beş ekranın beşi de eşit. Dersler %150'de
      316'da kalıyor çünkü kendi paragrafı raydan uzun — oradaki tek kol metin.
      *(O paragraf **AB2'de kısaldı**, yani bu madde de kapandı.)*
- [x] **AC2 Müsaitlik satırı 42 → 54,3 px** (%150'de 63 → 81,4). Sayfa dikey
      taşması iki ölçekte de **0**. "Haftanın darlığı" kendi kuralıyla eski
      boyunda kaldı: o bir müsaitlik programı değil, iskeleti ödünç alıyor.
- [x] **AC3 Raptiye kartın ÜSTÜNDE** — babanın en çok kullanacağı iş, artık tek
      tık. Kartın **kardeşi** (düğme içinde düğme olmaz), hep görünür, sönük,
      hover/odak/basılıyken tam. Sağ tıktaki kalem de duruyor.
      **Testi iki mutasyonu birden yuttu ve iki kez yazıldı** — bkz. tuzak 99.
- [x] **AC4 Program şeridi yeniden dizildi.** `Görünüm` en solda (eski yeri),
      kitaplık tek menüde, `Izgara`'nın üç düğmesi tek menüde. Sebep ölçüm:
      %150'de şerit **2061 px** istiyordu ve **iki düğme taşıyordu**; şimdi
      1717 px, taşma 0.
- [x] **AC5 Her şey düzenlenebilir, sınıf değişimi dahil.** Yeni saf fonksiyon
      `moveLessonToClass()` (`transferLesson`'ın aynası; pinler düşer ve
      **sayılır**), `LessonEdit` üç alandan altıya, `Inspector` okunan panelden
      düzenlenen panele. Sağ tık menüsü yedi kaleme indi, ikisi kapı.
      `ghostla` → `soluklaştır`.
- [x] **AC6 Havuzda sıra, süzgeç ve görünür ayrım.** Beş sıra + branş süzgeci
      (`toolState`, yeni depolama anahtarı YOK), başlıklı gruplar. İki ölçüm
      turu iki gerçek kusur buldu: kırpılan kartlar (%150'de **4123 px**
      erişilemez) ve kısa ekranda kaybolan kart satırı — bkz. tuzak 100.
- [x] **AC7 Devralınan DÖRT kırmızı kapandı** — `tipler`'in 8 hatası,
      `program.spec.ts` 86'nın üç testi, `kurulum.spec.ts` 44+65'in beş testi,
      ve `panel.spec.ts` 83'ün **bedava yeşili** (çift rezervasyonu ölçen test
      `s.placements`'i okuyup boş dönüyordu).
- [x] **AC8 Dört sözlük, 71 anahtar, elle.** Yarısı geçen turdan devrediyordu.
      Almanca ekranda Türkçe harf taraması **sıfır satır**.

`npm run kontrol` o turda yeşildi: **718 birim · 507 E2E · 22 site · 7 çözücü.**

> **O turun bıraktığı tek açık madde — ÖLÇÜM — AB turunda KAPANDI.**
> `dist/index.html` 1 031 525 bayttı ve sıçramanın kaynağı ölçülmemişti.
> Ölçüldü: dört sözlük **356 533 bayt** (%34,6),
> `@radix-ui/react-context-menu` yalnız **7 107 bayt** (%0,7), geri kalan
> 667 885. Yani sıçrama bir bağımlılıktan değil **veriden** geliyordu.

---


---

### Otuz dördüncü oturum — kullanıcının dört maddesi — **BİTTİ ✅**

- [x] **Öğretmen listelerinde branş KISALTMASI.** Üç yer: Kurulum →
      Öğretmenler'in iki açılır listesi (`Mat · Matematik`), Müsaitlik listesi
      (`MÇ · Mehmet Çelik (Mat)`, artık **ikinci branşı da**), ve ızgaranın sol
      sütunu. Çip süzgeci bilerek DEĞİŞMEDİ: `Matematik 1` ile `Matematik 2`
      aynı kısaltmaya düşüyor ve iki branşı tek süzgeçte birleştirirdi.
- [x] **Sol sütun daraldı: `--rowhead-w` 6.75rem → 5.25rem.** Uydurulmadı —
      `izgara.spec.ts` 68 tarayıcıya soruyor: var 94,5 px, **gereken 66 px**,
      yani test kendi 1,2× tavanında kırmızıya döndü. 21 px ders sütunlarına.
- [x] **Otomatik dizme ÖLÇÜLDÜ.** Yukarıdaki karara bakın.
- [x] **Sağ tık menüsü**: `Havuza kaldır · Dersi düzenle · Dersi buraya
      sabitle`. Tek `ContextMenu.Root` bütün tabloyu sarıyor, 2100 hücreye
      tetikleyici konmuyor.
- [x] **SABİTLEME — şema v9 → v10** (`State.pinned`). Tam kilit: sürüklenmez,
      sağ tıkla/Delete ile kaldırılmaz, üstüne bırakılmaz, `Baştan diz` ve
      `Programı boşalt` yerinde bırakır. Kilidi `removeBlock`'a koymak
      denetçiyi bozdu ve denetçi bunu yakaladı → `liftBlock()` ayrıldı,
      tuzak 98.
- [x] **Yerinde ders düzenleme** (`LessonEdit.tsx`): haftalık saat · dağılım ·
      günde en fazla. `BlockCounts` paylaşıma çıkarıldı, mantık kopyalanmadı.
      Sabitleme işaretinin yeri **ekran görüntüsüne bakılarak** düzeltildi:
      sağ üstte sınıf numarasının üstüne biniyordu, sol alta taşındı.

---

> **v2.0.0 YAYINLANDI ve BİR VERİ KAYBI TAŞIYOR — ilk iş bunu kapatmak.**
>
> Ad turunun tek gözden kaçan satırı `tauri.conf.json`'ın `identifier`'ıydı:
> `productName`'le birlikte `com.dersprogrami.arac` → `me.mozaik.arac`
> yapılmıştı. Tauri WebView2'ye profil olarak `%LOCALAPPDATA%\<identifier>`
> veriyor, yani o dize bir ad değil **adres** — babanın bütün planlarının
> durduğu yol. Ölçüldü, geri alındı, `src/surum.test.ts` çiviledi
> (bkz. [STATUS.md](STATUS.md) → *Otuz üçüncü oturum*, ve tuzak 95).
>
> - [ ] **`npm run yayinla -- 2.0.1`.** Kod hazır ve `npm run kontrol` yeşil
>       olmalı. Bu sürümün taşıdığı şeyler: doğru kimlik, şeridin
>       kaymaması, ve AA turunun beş maddesi (şema v11 dahil).
> - [ ] **Yayınlanana kadar babanın exe'sinde güncelleme düğmelerine
>       BASILMASIN.** `surum.json` şu anda 2.0.0'ı gösteriyor, ve ≥ v1.3.0
>       her kopya onu görüyor.
> - [ ] Yayından sonra **Windows'ta bir kez denensin**: eski kopya
>       güncellendikten sonra planlar yerinde mi. Bu, bu makinede
>       ölçülemeyen tek şey.
>
> **AA turu BİTTİ (2026-08-29)**, ve **AA2 aynı gün bir kez daha düzeltildi**:
> *"özet kutusu değil içindeki liste yukarı aşağı scrollanabilsin"* — tavan
> doğruydu, kaydıran kutu değildi. Beş satır: ekleme kendi bloğu, özet kendi
> içinde kayıyor, hatalar en üstte, sınıfın kendi günlük sınırı (**şema v11**),
> kısaltma varsayılanı sütun başlığı. `npm run kontrol` yeşil —
> 698 birim · 490 E2E · 22 site · 7 çözücü. Ayrıntı aşağıda, ölçümler
> [STATUS.md](STATUS.md) → *Otuz dördüncü* ve *Otuz beşinci oturum*.
>
> **Kayma turu BİTTİ (2026-08-29).** *"Alt bardaki seçenekler arasında
> geçerken bazen kayıyor"* — iki bağımsız sebep, ikisi de ölçüldü, ikisi de
> `e2e/kayma.spec.ts`'te (üçü de mutasyonla sınandı): basılı düğmenin
> **kalınlığı** eşit sütunlu ızgarada bir ölçüydü (7,3 px), ve `.main`'de
> ayrılmış kaydırma çubuğu oluğu yoktu (10 px). Süit bunu göremezdi:
> Playwright `--hide-scrollbars` ile açıyor, o yüzden yeni dosya kendi
> tarayıcısını açıyor.
>
> **Bu turun bıraktığı açık madde:**
> - [ ] **Bir testlik artık: "reload'dan sonra düşme".** Sebebin BİRİ bulundu
>       ve kod çıktı (`revealRibbon` `.main` yoksa sessizce dönüyordu), ama
>       beş tam koşunun ikisinde hâlâ **bir** test düşüyor — her seferinde
>       başkası, hep bir `reload`'dan sonra, tek başına koşunca geçiyor. İki
>       worker'la da düştü, yani salt aşırı yüklenme değil. **Bu oturumun iki
>       tam koşusunda düşmedi** (472/472, iki kez).
>
> **Sende kalanlar — kodda değil, ve üçü de geçen turdan devrediyor:**
> 1. **Windows'ta denensin.** `releases/latest/download/Mozaik.exe`. Bu
>    makinede ölçülemeyen dört şey aynı koşuda görülür: exe'nin kendini
>    gerçekten değiştirmesi, görev çubuğundaki ikon, SmartScreen'in ne
>    dediği, ve WebView2'nin yazdırma diyaloğu. **Yeni:** ilk kurulumda
>    `kur.ps1` eski adla duran kısayolu siliyor — o da orada görülecek.
> 2. **GitHub Pages hâlâ başkasına gidiyor.** `AlparslanSemiz.github.io`
>    deposunda Settings → Pages → Custom domain temizlenecek **ve** kökteki
>    `CNAME` silinecek. Kaldırmanın GameMetrix'i kırmayacağı ölçülmüştü.
> 3. **Babanın gerçek listesi** — hâlâ v0'ın çıkma şartı, ve hâlâ tek
>    bekleyen büyük şey.
>
> **DEPONUN ADI DA KİMLİĞİ DE DEĞİŞMEYECEK.** `ders-programi` ve
> `com.dersprogrami.arac` kalıyor, ve ikisi de kozmetik değil:
> `update.rs`'in `RELEASE_KOK`'u v1.4.0 kopyalarına **derlenmiş** (depo
> yeniden adlandırılırsa o kopyalar bir daha hiç güncellenemez), ve kimlik
> verinin durduğu yol.


---

### 2026-08-29 · devralınan üç ESKİ kırmızı — **KAPANDI ✅**

> **Bu turda kapanan üç ESKİ kırmızı** — üçü de `8341b98`/`5fc0316`'dan
> devrediyordu ve üçü de `main`'de duruyordu:
>
> - [x] **`store.ts` v8 dosyalarını okumuyordu.** Yayınlanmış v2.0.0'ın yazdığı
>       her yedek `parseState`'ten `null` dönüyordu. Kabul listesine `8` ve `9`
>       eklendi; yanına **sayı adlandırmayan** bir test yazıldı
>       (`SCHEMA_VERSION - 1`), mutasyonla sınandı. Tuzak 97.
> - [x] **`npm run tipler` 5 hata veriyordu** (`availClock` Ayarlar →
>       Görünüm'den çıkmış, App hâlâ ona veriyordu) ve `@types/node` kurulu
>       değildi. Kontrol Müsaitlik'in kendi şeridine bağlandı,
>       `gorunum.spec.ts` 50 onu yeni evinde arıyor.
> - [x] **`i18n.test.ts` 4 kırmızı veriyordu**: kaldırılan ekranın 5 anahtarı
>       dört sözlükte duruyordu.


---

### v2.0.0 turu — YENİ AD — **BİTTİ ✅** (2026-08-29)

- [x] **Dil seçeneği: TR · EN · DE · ES · FR.** Varsayılan `navigator.language`
      üstünden; cihaz dili bu beşten biri değilse **İngilizce**. Türkçe kaynak
      dil kalır. Tercih `ders-programi-dil`'de, `State`'e **girmez**
      (`schemaVersion` artmaz). `theme.ts`'in on birinci makine tercihi, ve
      `library.ts`'teki `storageReport`'a satırı yazılacak.
      **İLKE 4 YENİDEN YAZILACAK** — bugünkü hâli "Tek dil. i18n altyapısı
      yok, string dosyası yok".
      E2E'nin dili `open()` değil **`kapan.ts`**'te `tr`'ye sabitlendi
      (`auto: true` unutulamaz, ve üç spec hiçbir yardımcıdan geçmiyor).
- [x] **Yeni ad: Mozaik — YAPILDI (2026-08-29).** Beş dilde de aynı kelime (Mozaik · Mosaic · Mosaik ·
      Mosaico · Mosaïque) ve ekrandaki şeyi tarif ediyor.
      **DEĞİŞMEYECEK olanlar, ve bu bir veri kararı:** `localStorage`
      anahtarları (`ders-programi*`), yedek dosya adları
      (`ders-programi-YYYY-AA-GG.json`) ve `Belgelerim\Ders Programı`
      klasörü. Kimliği değişen bir anahtar, silinmiş veri demektir.
      Değişecekler: pencere başlığı, belge başlığı, marka, exe adı, site,
      README, `identifier`. Exe adı değişince `surum.json`'daki adres de
      değişir — güncelleyici bunu zaten **manifestten okuyor**, yani v1.3.0
      taşıyan bir kopya v2.0.0'a geçebilir.





> **Bu dokuz satırın ham hâli buradaydı; V turu olarak numaralanıp yukarı
> taşındı (2026-08-27). Dokuzu da bitti.**


---

### AA turu — beş satır — **BİTTİ ✅** (2026-08-29)

Kullanıcının yazdığı beş satır. **Şema v10 → v11'e çıktı.** Ayrıntı ve
ölçülen her sayı [STATUS.md](STATUS.md) → *Otuz dördüncü oturum*.

> Listelerde ekleme kısmı ayrı blok olsun. aynı özetin ayrı blok olduğu gibi, yani sadece çizgi olmasın. → AA1
> Özetler içlerindeki bilgilerin uzunluklarına göre uzunlukları değişebilir ama en fazla tam ekranın uzunluğu kadar olsun ondan fazla uzun olmasın eğer liste çok uzunsa işte kaydırma o özetin içinde olsun. → AA2
> Özetteki hatalar özetin en üstüne gelsin. Hata gidince yok olsun. → AA3
> Sınıfların özel olarak bir günde aynı dersten kaç saat girme opsiyonu olsun. → AA4
> Branşların kısaltma varsayılanı varsayılan ismi en üste liste katgeorisine gitsin. → AA5

- [x] **AA1 Ekleme kendi paneli.** Beş liste ekranının (Derslikler · Branşlar ·
      Öğretmenler · Sınıflar · Dersler) tek paneli **iki kardeş panele**
      bölündü. Geçen turun cevabı bir **çizgi**ydi (`.form-row.panel-add`'in
      `border-bottom`'ı) ve yetmedi; o kural silindi. Ekleme paneli işi
      adlandırıyor (`Yeni derslik`…), sayılı başlık (`Derslikler (8)`) saydığı
      **listeyle** kaldı, `Excel'den yapıştır` ekleme bloğunun köşesinde.
      Sıra değişmedi: *"ama yerleri değişmesin."* Test 44 iki panele yayıldı
      ve artık ikisinin **ayrı blok olduğunu** da iddia ediyor.
- [x] **AA2 Kaydıran kutu SÜTUN değil PANEL.** Sağ ray zaten ekran boyunda
      sınırlıydı; sınırlı olmayan şey panelin **kendisi**ydi, ve içindeki
      kutular sabit tavan taşıyordu (`.stat-scroll` 22rem, `.entity-list`
      62vh) — yani boy bu dosyadaki bir sayıdan geliyordu, içindekinden değil.
      Artık: panel içeriği kadar uzun, en fazla `100cqh`, fazlası panelin
      içinde kayıyor, ve başlık yapışkan. `18rem` **tabanı da kalktı**: tavanı
      aşabilen bir taban tavan değildir. Ölçüldü — Müsaitlik'te 25 öğretmenin
      hepsi artık tek ekranda, altındaki iki düğmeyle birlikte.
- [x] **AA2b Kaydıran kutu PANEL değil LİSTE.** AA2'nin ikinci yarısı, aynı
      gün: scrollbar panelin kendisindeydi, yani başlığın altındaki cümle ve
      tablonun altındaki liste satırlarla birlikte gidiyordu. Panel artık bir
      **flex sütunu**, yer verebilen tek kutu liste, ve tabanı `6rem` (rem,
      yani `--ui-scale`'i izliyor). Panelin `overflow-y`'si **son çare** olarak
      duruyor: küçülemeyen yarı tek başına ekrandan uzunsa oraya düşülür,
      yoksa ulaşılamayan içerik olurdu. İki tabloya kutu verildi (Ayarlar →
      Kurallar'ın ihlal listesi, Zil önizlemesi: 1080'de 25 px, %150'de 478 px
      taşıyordu) ve kayan tablonun **başlığı yapışkan** oldu. İki test, ikisi
      de mutasyonla sınandı.
- [x] **AA3 Hata Özet'in en üstünde.** Uyarı kutuları kapasite tablosundan
      **öncesine** taşındı, ve `CapacityRows` Özet'te de `problemsFirst`
      alıyor — o bayrak Kontrol için yazılmış ve buraya hiç geçilmemişti.
      Sorun yoksa hiçbir şey çizilmiyor. İkisi de mutasyonla sınandı.
- [x] **AA4 Sınıfın kendi günlük sınırı — şema v11.**
      `ClassGroup.maxSameLessonPerDay`, ve kural artık **üç katmanlı**: dersin
      kutusu → sınıfın kutusu → okul varsayılanı. Tek çözen yer hâlâ
      `lessonLimit()`; `group` sondan ve isteğe bağlı (tuzak 76). Kutu
      Okul → Sınıflar tablosunda, Ayarlar → Kurallar onu **sayıyor**, ve
      Dersler'deki kutunun placeholder'ı artık **sınıfın** sayısını gösteriyor.
      `parseState`'e `version === 10` eklendi — "IT HAPPENED" satırının
      hatırlattığı şey tam buydu.
- [x] **AA5 Kısaltma varsayılanı sütun BAŞLIĞI oldu.** Her satırda
      "varsayılan" / "varsayılanı: Mat" yazan adsız sütun, başlığı
      **Varsayılan** olan bir sütuna dönüştü; hücre yalnız değeri, aynıysa
      boş hücrenin kısa çizgisini taşıyor. İki ölü anahtar dört sözlükten
      silindi. Yol üstünde bir kusur da kapandı: sağdaki "Hazır branşlar"
      tablosu `defaultSubjectShort` (Türkçe, karşılaştırma biçimi) çağırıyordu,
      yani İngilizce ekran "Mathematics / **Mat**" yazıp listeye eklenince
      kutuya "Mth" koyuyordu.


---


---

### Y turu — arayüzün şekli — **BİTTİ ✅** (2026-08-28)

Kullanıcının on maddesi. Hepsi tek bir aileden: **ekranın şekli tutarsızdı.**
Branş listesi onu okuyan açılır listeden bir sekme uzaktaydı, Kurulum'un sağ
sütununda gereksiz bir ikinci panel vardı, Kontrol'ün üç süzgeci birbirinin
aynıydı ve sayfa üç ekran sürüyordu, liste tabloları panellerinin yarısını
kaplıyordu, ve sağdaki blok her ekranda başka bir x'te başlıyordu.

**Adım 1 hiç ürün kodu yazmadı: ölçtü.** İki sayı bu turun bütün düzen
kararlarını belirledi ve ikisi de [STATUS.md](STATUS.md)'de duruyor.

- [x] **Y1 Sekme adları.** `Kurulum → Okul` (ilke 1 "kurulum yok" diyor ve ilk
      sekmenin adı Kurulum'du; üstelik artık branşları da tutuyor),
      `Yazdır → Çıktı` (isimler arasındaki tek fiildi). Ad çakışması yüzünden
      zorunlu ikinci yeniden adlandırma: Ayarlar'ın `Okul ve zil` bölümü
      **`Zil ve günler`** oldu — tuzak 49/74, bir düğme üç piksel ötedeki
      sekmenin adını taşıyamaz.
- [x] **Y2 Branşlar Okul'un 2. adımı.** Sıra artık bağımlılık zinciri:
      `Derslikler · Branşlar · Öğretmenler · Sınıflar`. Sınıf bir dersliği
      gösterir, öğretmen listeden bir branş seçer. `Subjects.tsx` kendi
      `.cols`'unu ve `<aside>`'ını bıraktı (iç içe `.cols` `mainList()`'i
      kırardı); yan paneli `setup/Summary.tsx`'in bir dalı oldu.
- [x] **Y3 Yeni proje BOŞ branş listesiyle doğuyor.** "Hazır branşlar" paneli
      21 gömülü branşın hepsi zaten listede olduğu için her yeni projede
      `(0)` yazıyordu — yani işe yaradığı tek ekranda boştu.
      **Ve bu, kayda değer bir kusuru ortaya çıkardı:** `migrateV2toV3`
      `emptyState().settings`'i yayıyordu, yani v1/v2 yedeklerinin branş
      listesi sessizce boşalacak ve her öğretmenin branşı "listede değil"e
      düşecekti. Düzeltildi, testi yazıldı, **mutasyonla denendi.**
- [x] **Y4 "Kurulum durumu" silindi.** Şeritte zaten duran dört sayacı üç
      piksel altında tekrarlıyor, sekme çubuğunda zaten duran bir kapıyı
      gösteriyordu ("çok fazla kaydırma olmuş, gereksiz"). Söylediği tek iki
      şey — "N sınıfın hiç dersi yok" ve haftalık saat cümlesi — Özet'e taşındı.
      Sağdaki panelin adı artık her adımda **Özet**.
- [x] **Y5 Renkler paneli Ayarlar'dan Özet'e.** Renk burada bir kimlik ve
      swatch'lar zaten o ekranda. Yalnız yeniden dağıtmanın gerçekten bir şey
      **değiştireceği** zaman çiziliyor: sağlıklı bir projede panel hiç yok.
- [x] **Y6 Ayarlar beş bölüm.** `Zil ve günler · Kurallar · Görünüm ·
      Planlar ve yedek · Hakkında`. 762 satırlık `Data.tsx` bölündü: dosya,
      klasör, paket ve yedekler plan kitaplığının yanına; sürüm, güncelleme,
      "veriler nerede", örnek veri ve sıfırla `Hakkında`'ya. **`Hakkında`,
      `Program hakkında` değil** — ikincisi `name: 'Program'` sorgusuna cevap
      verirdi (tuzak 49).
- [x] **Y7 Kontrol tek sayfa.** Üç süzgeç (Hepsi · Sorunlar · Kapasite) kalktı;
      okuyanın hükmü "üçü de aynı" idi ve büyük ölçüde doğruydu, çünkü herkesin
      geldiği panel üçünde de vardı. `.panel-grid` satır sıralı yerleştiriyordu,
      yani her satır en uzun paneli kadar uzundu — 25 öğretmenlik okulda sayfa
      üç ekrandı, çoğu boşluk. Artık iki sabit sütun, her tablo kendi içinde
      kayıyor, **ölçülen: 1,09 ekran.** Şerit süzmüyor, **götürüyor**:
      `Sorunlar (N) · Öğretmenler · Sınıflar · Derslikler`.
- [x] **Y8 Tek `.cols`, tek kenar genişliği.** `.wide-left`, `.narrow-right` ve
      `.solo` silindi. Sağ ray **her ekranda** var, içi boş olsa bile — bir
      bazen yok olan ray, oynayan bir raydır. Dersler'de mod değiştirmek
      listenin sağ kenarını yüzlerce piksel oynatıyordu; Genel artık `Ders
      yükü` özetini alıyor. Ölçülen: **on dört ekranın on dördünde ray tam
      olarak aynı x'te (1568 px).**
- [x] **Y9 Liste satırları panelin sonuna kadar.** Dört aday ölçüldü;
      `width: 100%` ve `min-width: 100%` paneli dolduruyor **ama fazlalığı
      doğrudan Ad'a veriyor** (Derslikler'de 187 → 640,8 px), yani bir önceki
      turun şikayetini geri getiriyor. Çalışan şey kutuyu doldurmak **ve son
      sütunu serbest bırakmak** — o sütun zaten boş ve `Sil`'i sağa yaslı
      tutuyor. Ad üç listede de **değişmedi**.
- [x] **Y10 Dersler başlığı saati de söylüyor.** `Dersler (99)` →
      `Dersler · 99 ders · 433 saat`; odaklanmış modda da aynı ikili. Şeridin
      `Toplam`'ıyla aynı olduğu teste bağlandı.

#### Bu turda ölçülen, iddia edilmeyen

| Ne | Değer |
|---|---|
| Tablonun panel kenarına uzaklığı (önce) | Derslikler **-1094 px** · Sınıflar -965 · Öğretmenler -496 |
| Tablonun panel kenarına uzaklığı (sonra) | **-1 px**, üç listede de, %100/110/125'te |
| `Ad` sütunu | 187 / 205,8 / 233,8 / 280,6 — üç listede de aynı, **değişmedi** |
| `--aside-w` | **23,5rem** — bağlayıcı olan Müsaitlik'in `.entity-list`'i |
| Rayın x'i | on dört ekranın on dördünde **1568 px** |
| Kontrol sayfası | 3 ekran → **1,09 ekran** |

#### Bu turda çıkan yeni tuzak

- **87. `i18n.test.ts`'in ölü anahtar tarayıcısı YORUMLARA da bakıyor.** Bir
  arayüz metnini yeniden adlandırmak sözlük girdisini öksüz bırakır ve
  **hiçbir şey söylemez**. Mutasyonla doğrulandı: `'Kurulum': 'Setup'` ve
  `'Yazdır': 'Print'` gerçekten ölü anahtarlar olarak geri kondu ve süit
  **yeşil geçti**, çünkü o kelimeler hâlâ on beş kadar İngilizce yorumda
  duruyor. Tuzak 80'in ailesi: bir karakter üstünden yapılan tarama, o
  karakterin **rolünü** değil kendisini görüyor.

#### Bu turun kapanış notu

Bu turun kendi bıraktığı borç yok; on maddenin onu da bitti, her biri ölçüldü,
ve **`npm run kontrol` çıkış kodu 0** (612 birim · 466 E2E · 22 site · 7
çözücü). İki not:

1. **Tur boyunca görülen tek tük düşmelerin sebebi bulundu ve kod değildi.**
   Ölçüm betiklerim `npm run build` çağırıyordu, yani süit `dist/index.html`'i
   okurken dosya altından yeniden yazılıyordu. İlk teşhis "paralel yükte
   kararsızlık" idi ve yanlıştı. **Bir süit koşarken derleme yapılmaz.**
2. **Görsel kanıt alındı.** `npm run ekran` iki temada on dokuz görüntü
   üretti ve **bakıldı** — Y8/Y9/Y10'u yargılayabilecek hiçbir iddia yok
   (tuzak 82). Sahne adları da güncellendi (`1-okul`, `8-cikti`,
   `11-ayarlar-hakkinda`).


---


---

### X turu — on iki ham not (2026-08-28)

Kullanıcının bıraktığı on iki satır. Üçü ölçülebilir kusur çıktı ve üçü de
**yeşil bir süitin altında** duruyordu; her birinin yanına onu gören bir test
yazıldı ve üçü de mutasyonla denendi.

- [x] **X1 Kurulum adım numaraları kalktı.** `.step-no` iki yerde `i + 1`'den
      türüyordu (`Ribbon.tsx`, `setup/Progress.tsx`) ve gerekçesi şeridin kendi
      savıyla çelişiyordu: bu bir sihirbaz değil, her liste her an açık. Sayaç
      kaldı — 0 gösteren liste, eksik olanın nerede olduğunu söyleyen tek şey.
- [x] **X2 Dört liste simetrik.** Kök neden ölçüldü, tahmin edilmedi:
      `table.list { width: 100% }` artan alanı **genişliği yazılmamış** sütuna
      veriyordu. Derslikler'de o sütun Ad'dı (bir harf tutan kutu panel kadar);
      Sınıflar'da Renk **ve** Ad'dı, ve swatch sabit 5ch olduğu için Renk
      büyüyüp içi büyümüyor, adı sağa itiyordu — bildirilen "kayma" buydu.
      Artık `width: max-content`: her sütun ya merdivende ya kendi kontrolü
      kadar. **Ad dördünde de 187 px**, ve listeler arasında geçerken sütunlar
      yerinde duruyor. Branşlar da aileye katıldı (`step-panel`, `panel-head`,
      `table-scroll`, `.form-row` eylem hücresi), Enter dört listede de ekliyor.
- [x] **X3 Sol üstteki işaret SADE varyant.** Karar ölçümle çelişmiyor, ölçümün
      belirsiz bandında: `.brand-mark` %100'de 24,5 px, ve `ikon-karsilastir`
      20–32 px'i "bulanık ama ayırt edilebilir" diye kaydetmişti. Yan kazanç:
      sekme ile üst çubuk artık aynı dosyadan besleniyor, üç kopya ikiye indi.
- [x] **X4 Şerit başlığı ortalandı, çizgi çivilendi.** Kutu zaten
      `min-width` ile pediliydi ama çizgi `::after`'ın **statik konumundan**
      çiziliyordu, yani metnin bittiği yerden: yedi başlık yedi farklı x. Artık
      sabit `width` + `text-align: center` + tokenlardan hesaplanan bir `left`.
      Yedi başlık tek kelimeye indi (Liste · Yöntem · Kim · Görünüm · Süzgeç ·
      İçerik · Bölüm), kutu 9.8em'den **6.2em**'e düştü.
- [x] **X5 Tek branşlı hocada branş kutusu açılmıyor.** Öğretmenden modunda
      havuz zaten o kişinin branşları, yani tek seçenekli bir açılır liste
      hiçbir şey sormuyordu. Mantık değişmedi (`subjectValue` zaten havuzun
      ilkine düşüyor); branş **başlığa** taşındı: `MÇ · Matematik dersleri (12)`.
- [x] **X6 KAYAN ARTI — kusur (tuzak 85).** `cell.cellIndex` + `:nth-child(N)`
      her satırda saat başına bir `<td>` olduğu sürece kesindi; iki saatlik blok
      tek `colSpan=2` hücre olunca sayım kısa kaldı ve beam imlecin **soluna**
      düştü — solundaki her ikili için bir sütun. Çare bir sayı değil bir
      kimlik: `data-col`, hem gövdede hem saat başlığında, ve birleşmiş hücre
      **kapsadığı** sütundan yakılıyor. Başlığa `data-day` konmadı (tuzak 13).
      Yanında hayalet kart da düzeldi: `--ghost-span` ile blok kaç hücre
      kaplayacaksa o kadar geniş.
- [x] **X7 Havuz kartındaki sayı rozeti kalktı.** Sayı kaybolmadı:
      `data-count`, kartın `title`'ı ve "N blok bekliyor".
- [x] **X8 YAZDIRMA — kusur (tuzak 86).** Aleti önce düzeltmek gerekti: dokuz
      birleşimi gezen test `scrollHeight` okuyordu ve `safe center` ile
      hizalanan bir flex sütunu taşmasını o yoldan bildirmiyor — dokuzunda da 0
      diyordu, oysa "Büyük"te 714 px yerde **739 px** içerik vardı. Kök neden
      `--p-row: 23mm`: `--p-zoom` yalnız yazıyı çarpıyor, satır yüksekliği bir
      **taban** olduğu için hiçbir şey esnemiyordu. Sayı kaldırıldı — başlık
      ihtiyacını alır, tablo **kalanı** (`flex: 1`), satırlar bölüşür. Yanında
      iki sessiz ekran↔kâğıt ayrışması kapandı (`3.25rem`'lik satır, `6px`↔`4mm`
      pay). Ölçüm: 9 birleşim × 2 ortam, taşma **0**, sayfa **tam dolu**.
- [x] **X9 Yan sütun sayfanın boyunu belirlemiyor.** `.cols` bir grid, satırı
      `max(sol, sağ)`, ve `aside` için stylesheet'te **hiçbir kural yoktu**.
      Artık yapışkan, `100cqh` ile tavanlı ve kendi içinde kayıyor; `.main`
      bunun için bir `container-type: size` konteyneri oldu (ve ikisi de
      `@media print`'te geri alınıyor — tuzak 32). Kapasite özeti de tavanlandı.
      Ölçüm: Derslikler 1092 → 994, Yazdır 1491 → 966, Öğretmenler 2310 → 1189.
- [x] **X10 Şeridin kendiliğinden gizlenmesi artık bir ayar.**
      `ders-programi-serit-gizle`, Ayarlar → Görünüm. Katlama tercihinden ayrı
      bir anahtar ve sebebi yazılı: biri "şeridi istemiyorum", öteki "okurken
      kıpırdamasın". Varsayılan açık (bugünkü davranış), `storageReport`'a
      satırı yazıldı, `normalize` hem string hem boolean alıyor (tuzak 44).
- [x] **X11 Ayarlar ALTI bölüm.** `Planlar` Veri'den ayrıldı — orası yedi panel
      ve dört ayrı soruydu. Görünüm'de iki yoğunluk tek panelde iki soru oldu,
      **tema** oraya geldi, "Yazdırma bundan etkilenmez" paneli bir ipucu satırı
      oldu. Ayrıca **"Taslaktan başla" iki yerde kopyalanmıştı** (birebir aynı
      hata cümlesiyle); `components/DraftStart.tsx` oldu.
- [x] **X12 Bir kaç yol boyu temizlik.** `npm run tipler` iki tip hatasıyla
      kırmızıydı (`program.spec.ts`), düzeltildi. `hareket.spec.ts`'in sabit
      200px'lik kaydırması **hesaplanan** orta noktaya çevrildi: o sabit yalnız
      Kurulum'un sayfası yan sütun yüzünden uzunken bir ortaydı.


---

### v2.0.0 turu — DİL — **makine bitti, sözlük başladı** (2026-08-27)

Kullanıcının kalan iki maddesinden birincisi. Karar: **altyapı + TR + EN
önce**, DE · ES · FR sonraki turda, **yeni ad ayrı bir tur**.

- [x] **D1 Makine.** `src/i18n.ts` (yaprak, `keys.ts` deseni) ·
      `components/T.tsx` (`useT()` + `<T>`) · `src/lang/en.ts` ·
      `i18n.test.ts` (13 test) · `e2e/dil.spec.ts` (7 test).
      **Anahtar Türkçe cümlenin KENDİSİ**, uydurulmuş bir ad değil: eksik
      çeviri doğru Türkçeye düşer, JSX okunur kalır, ve altı yüz isim
      uydurulmaz. Bedeli `i18n.test.ts` ödüyor — ölü anahtarı o yakalıyor.
- [x] **D2 Tercih on birinci makine tercihi.** `ders-programi-dil`,
      `State`'e girmez, `schemaVersion` artmaz, "Veriler nerede" tablosunda
      satırı var. `<html lang>` onunla kıpırdıyor.
- [x] **D3 E2E'nin dili `kapan.ts`'te sabitlendi.** `auto: true` unutulamaz,
      ve üç spec dosyası hiçbir yardımcıdan geçmeden `page.goto('/')` yapıyor.
      Tohumluyor, dayatmıyor (tuzak 68).
- [x] **D4 Ayarlar → Görünüm'de dil seçici.** Her dil **kendi adını kendi
      dilinde** söylüyor — bir dil menüsünü, uygulamanın o an konuştuğu dili
      henüz bilmeyen biri okur.
- [x] **D5 SÖZLÜK — BİTTİ (2026-08-29). 9 → 814 anahtar.** Arayüzün tamamı
      `t()`'den geçiyor. Makinenin eksik üç parçası da bu turda kondu: saf
      modüller için **aktif dil + çıplak `t()`** (bkz. tuzak 76 — alternatifi
      `t`'yi parametre geçirmekti), **çoğul** (`{n:tekil|çoğul}`, kategoriyi
      `Intl.PluralRules` seçiyor), ve **veri metinlerinin sınırı**
      (`src/names.ts`: depoda Türkçe, ekranda çevrili).
      **Asıl ölçüm bir test değil:** hiçbir test çevrilmemiş metni göremez,
      çünkü süit Türkçeye sabitli ve Türkçede `t()` anahtarın kendisini
      döndürüyor. İngilizce ekranın gövdesi tarandı ve Almanca ekran
      görüntülerine **bakıldı**; on dört yerde Türkçe duruyordu, ikisi gerçek
      kusurdu (listelerde çoğul yoktu; kısaltma ipucu yanlış varsayılanı
      okuyordu). Ayrıntı [STATUS.md](STATUS.md) → *Otuz ikinci oturum*.
- [x] **D6 DE · ES · FR — BİTTİ (2026-08-29).** Aynı 814 anahtar, dört sözlük.
      `systemDil()`'in geri düşme dili Türkçeden **İngilizceye** çevrildi.
      Sözlüğün beş denetçisi de **mutasyonla** sınandı (ölü anahtar · yuva
      kümesi · dengeli `**` · çoğulun iki biçimi · uzun çizgi), beşi de
      kırmızıya döndü.
      **Ölçülen maliyet:** üç sözlük daha **+242 KB** ve açılışa **0 ms**
      (82 → 83 ms medyan). Gömülü metin ayrıştırılmıyor, taşınıyor.
- [x] **D7 İLKE 4 yeniden yazıldı (2026-08-29).** Yerine geçen şey hâlâ bir
      **kısıt**: Türkçe kaynak dildir, anahtar Türkçe cümlenin kendisidir,
      eksik çeviri doğru Türkçeye düşer, ve `State`'e giren hiçbir metin
      çevrilmez.


---

### W turu — yedi madde — **BİTTİ ✅** (2026-08-27)

Kullanıcının TASKS'in en altına yazdığı yedi satır. **Şema DEĞİŞMEDİ** (v8
kaldı) ve **hiçbir depolama anahtarı açılmadı** — yedi maddenin hiçbiri
program verisine dokunmadı.

**İkisinin karşılığı sıfır satır kod oldu, ve bu bir sonuçtur:** ikisi de
ölçüldü ve zaten çözülmüş çıktı. Ölçmeden "yapıldı" demek ile ölçmeden
yeniden yapmak aynı hatanın iki yüzü.

- [x] **W1 Görev çubuğundaki işaret — ZATEN ÇÖZÜLMÜŞ.** `scripts/ikon.mjs`'in
      eşiği `SADE_ALTINDA = 20`, yani yalnız 16 px sade. Commit'lenmiş
      `kurulum/icon.ico` çözülüp doğrulandı: dokuz giriş, ve 24 px girişinde
      ayrıntılı çizimin hayalet sütunları ile mor bloğu **var**.
      `tauri.conf.json`'ın `bundle.icon`'u aynı dosyayı gösteriyor, yani exe
      de onu taşıyor. Şikayet aynı gün `dc47a62`'de düzeltilmiş, notu
      silinmemişti.
      **Kalan gerçek boşluk kodda değil, teslimdeydi ve kapatıldı:**
      `kurulum/kur.ps1` kısayolu yalnız ilk kurulumda yazıyordu, yani
      `Guncelle.cmd` yeni `icon.ico`'yu kopyalasa da `.lnk`'nin
      `IconLocation`'ına dokunmuyor ve Windows eski işareti göstermeye devam
      ediyordu — **düzeltilmiş bir ikonun düzeltilmiş olduğu hâlde
      görünmemesi**. Artık güncellemede DURAN kısayol tazeleniyor; olmayan
      **yaratılmıyor** (babanın onu silmiş ya da taşımış olma ihtimali).
      Babanın makinesindeki v1.3.0 exe'si hâlâ eski `.ico`'yu taşıyor: bu
      madde ancak bir **sürümle** ulaşır.
- [x] **W2 Izgarada blok çizimi — ZATEN ÇÖZÜLMÜŞ, foto eski derlemeden.**
      `docs/Örnek Fotolar/Programda da eğer bloksa blok olarak gözükmeli.png`
      piksel piksel ölçüldü: iki kart arasında **3 px zemin** var, yani ne
      `block-wide` ne `block-cont` — düpedüz iki bağımsız kart. İki bağımsız
      sebep: (a) `dist/index.html` diskte 14:55'ten, "tek kart blok"u getiren
      `5c84f49` ise 18:37'den, ve `grep -c block-wide dist/index.html` → **0**;
      (b) fotodaki kartlar zaten **iki ayrı 1 saatlik blok** (`sample.ts:144`
      derslerin %65'ini `pairs = 0` üretiyor), yani bugünkü kodda da iki kart
      çizilirdi ve doğru olan bu. Kullanıcı onayladı: *"her şey yolundaymış
      orada bunun için bir şey yapmana gerek yok"*.
- [x] **W3 Havuzda DESTE + adet rozeti.** W2'nin yerine gelen istek:
      *"aynı dersten aynı şeyden birden fazlaysa 0/4 1/7 gibi gözüküyor ya o
      kalsın ama onun yanında kartlar stacklenmiş gibi altta da olsun."*
      Altı saatlik bir ders tepsiye altı özdeş kart ve altı kez aynı `0/6`
      bırakıyordu. Ölçülen: örnek okulda **367 kart → 114 deste**, en
      kalabalığı 8. Rozet `1 saat ×6` biçiminde, blok boyunun yanında —
      köşeye iliştirilen bir işaret kartın ortalanmış üç satırını yana
      itiyordu.
      **`.pool-card` hâlâ "bekleyen BİR blok" demek**, ve bu bir sözleşme:
      sekiz dosyada ~40 test onu sayıyor, "N blok bekliyor" ondan geliyor.
      Deste bir **düzen**, bir gruplama değil.
      **Bir saat bir z-index'e gitti ve dersi CLAUDE.md'ye yazıldı (tuzak
      84):** üstteki kartın `z-index: 3`'ü *statik konumlu bir kutuda hiçbir
      şey yapmıyordu*, gömülü kopyalar onun üstüne boyanıyordu, ve rozetin
      kutusu · hesaplanmış rengi · `elementFromPoint` cevabı **vardı** ama
      kendisi görünmüyordu.
- [x] **W4 Ders girişi KENDİ SEKMESİNE çıktı.** *"Ders ekleme tarafı çok daha
      pratik hale getirilmeli, neden? Çünkü hocaları onu bunu ayarlıyorsun ama
      DERS EN ÖNEMLİ KISIM."* Yedinci sekme, **Müsaitlik ile Program
      arasında** (kullanıcı seçimi). Kurulum dört adımdan **üçe** indi;
      "Kurulum durumu" panelinin ayağında ders sayısı, eksik uyarısı ve
      sekmeye giden kapı duruyor — o cümleyi kaybetmek taşımanın tek gerçek
      riskiydi. `Alt+1..7`. Şerit standardının beş maddesi yedi sekmede de
      ölçülüyor.
- [x] **W5 Şeritte üç mod: `Sınıftan · Öğretmenden · Genel`.** Kullanıcının
      kendi cümlesi. İskelet **Müsaitlik şeridinin birebir aynısı** — soruyu
      soran bir grup, hangisinin açık olduğunu *söyleyen* bir grup — ve seçici
      sağ sütunda, çünkü iki sekme aynı iki soruyu iki ayrı şekille sormamalı.
      Odaklanmış modda form o ekseni **hiç sormuyor**: asıl kısalma bu.
      Elle sıralama orada kilitli ve sebebi yazılı (alt küme ≠ dizi).
- [x] **W6 Sınıf artık HATIRLANIYOR.** Eski form tam olarak korunması gereken
      alanı sıfırlıyordu (`setNewLesson({ ...newLesson, classId: '' })`), yani
      bir sınıfa sekiz ders girmek sınıfı sekiz kez seçmek demekti. Artık
      yürünen eksen kalıyor, değişen eksen sıfırlanıyor; `second` bayrağı
      öğretmeniyle birlikte gidiyor, çünkü onun iki branşından birini
      gösteriyor. **Enter da ekliyor** (`Rooms.tsx`'in deseni).
- [x] **W7 "Excel'den yapıştır" panelin SAĞ ÜSTÜNDE.** Dört panelde birden,
      aynı köşede (`.panel-head`). Form satırında altı kontrolün altıncısıydı
      ve açılınca o satırı ikiye bölüyordu; artık kutu formun **altında**
      açılıyor. `Paste` kontrollü hâle geldi (`open`/`close`), yani düğme
      panelin, kutu bileşenin.
- [x] **W8 Branş sırası AYARLARDAKİ sıra, alfabe değil.** Dört yerde birden
      istendi, dördü de yapıldı: Öğretmenler'in "Branşa göre" sıralaması,
      **branş çipleri**, çift branşlı hocanın **ikinci** branşı, ve Kurulum
      özetindeki "Branşlar" listesi. Tek ev `entities.ts`'teki
      `subjectRank()`; `listview.ts` `State`'i bilmemeye devam ediyor —
      `Facet`'e isteğe bağlı bir `order` alanı geldi, sırayı **çağıran**
      veriyor. Alfabe eşitlikte hâlâ karar veriyor, yani `order` yazmayan her
      çip satırı bugünkü davranışında kaldı. 
      

---

### U turu — güncelleme · ikon · devriye · metinler — **BİTTİ ✅** (2026-08-27)

Kullanıcının bu dosyanın sonuna yazdığı **beş satır**, artı aynı mesajdaki iki
istek: *"yeni sürüm oluşsun"* ve *".exe'de de ayarlarda güncellemeye basınca
güncellemeye baksın ve güncelleme varsa güncellensin, tabii ki exe internetsiz
de sorunsuz çalışabiliyor olsun."*

**İş ikiye bölündü (kullanıcı kararı, 2026-08-27).** Bu tur **v1.3.0**; dil
desteği ve yeni ad kendi turunda, **v2.0.0**'da. Gerekçe: o ikisi kimlik
değişikliği (ilke 4 yeniden yazılıyor, 529 E2E locator'ı Türkçe adlara asılı)
ve babanın bekleyen düzeltmeleri onların arkasında beklememeli.

- [x] **U1 `.exe` kendini güncelliyor.** `src-tauri/src/update.rs` + üç köprü
      fonksiyonu (`desktop.ts`) + `update.ts`'in üç yollu hâli (`sw` · `exe` ·
      `yok`) + Ayarlar → Veri'de üç düğme.
      **Sözleşme:** ağa **yalnız tıklanınca** çıkılır. Açılışta yok, arka
      planda yok, zamanlayıcı yok. İnternet yoksa tek sonuç bir cümledir ve
      program çalışmaya devam eder — E2E bunu örnek okulu yükleyip ızgaraya
      ulaşarak **ölçüyor**, "sekme değişti" diyerek değil.
      **İlke 1 korundu:** üç ayrı düğme, üç ayrı karar (`Denetle` → `İndir` →
      `Şimdi yeniden başlat`). İkisi de sabotajla kırmızıya döndürüldü.
      Yeniden başlatmadan önce `park()` çağrılıyor (tuzak 28).
      `.github/workflows/surum.yml` dördüncü bir varlık üretiyor: `surum.json`,
      ve numarası **etiketle package.json'ın aynı olduğu doğrulanmadan**
      yazılmıyor.
      **Tauri'nin kendi updater'ı alınmadı** ve gerekçe ilke 1: Windows'ta bir
      `.msi`/`.nsis` kurulumu çalıştırıyor, yani tam da `--no-bundle`'ın
      reddettiği şey.
      **Bu makinede ölçülemeyen:** Windows'ta gerçek takas. `cargo test`
      mantığı Linux'ta yargılıyor (rename semantiği aynı); exe'nin kendini
      Windows'ta gerçekten değiştirdiği babanın makinesinde görülecek.
- [x] **U2 Görev çubuğundaki işaret büyük çizim.** İki kusur birden vardı ve
      ikisi de dosyanın içindeydi: `.ico` 20 · 24 · **40** px taşımıyordu
      (Windows %125'te 40 istiyor ve yoksa 32'yi büyütüyor — "eksik pxl"in
      kaynağı), ve eşik `< 48 sade` olduğu için görev çubuğunun yuvasına
      **sade** çizim düşüyordu. Eşik uydurulmadı, **bakılarak** bulundu.
      Karar bir testte (`temel.spec.ts` 79, piksel piksel), ve sabotajla
      kırmızıya döndü.
      **EŞİK AYNI GÜN İKİNCİ KEZ İNDİ: 32 → 20**, çünkü şikayet geri geldi.
      İlk düzeltme pikselleri doğru okumuştu ama yanında ölçülmemiş bir cümle
      taşıyordu — *"görev çubuğu 32 px'lik bir yuvadır"*. Windows 11 %100'de
      **24** istiyor, yani düzeltmenin kendisi düzeltmeye çalıştığı boyu
      eşiğin bir basamak altında bırakmıştı. Artık yalnız **16** sade;
      20/24/32/40/48+ ayrıntılı, yani bir görev çubuğunun isteyebileceği
      hiçbir boy sade tarafta değil ve cevap "Windows hangi boyu seçiyor"
      tahminine dayanmıyor. `.ico` 11 858 → 14 483 → **14 859 bayt**.
      Bkz. tuzak 78'in ikinci yarısı.
- [x] **U3 Devriye + hata kapanı.** İki parça, ve asıl kazanç birincisi:
      `e2e/kapan.ts` **bütün** E2E süitini sarıyor (`auto: true`) ve konsol
      hatasını, `pageerror`'ı, yakalanmamış promise reddini ve `file://`
      altında **herhangi bir ağ isteğini** kırmızıya döndürüyor. Bugüne kadar
      415 testin **hiçbiri** bunlara bakmıyordu. İkisi de kasıtlı hatayla
      sınandı. `npm run patrol` ise iddia etmiyor, **geziyor**: altı sekme,
      dört adım, beş bölüm, şeritteki her düğme, artı üç tohumla rastgele
      gezinme. `kontrol`'ün parçası değil (tuzak 79'a bakınız: ilk hâli üç
      dakikada hiçbir sekmeye uğramadan düştü).
      **Süit kapanla YEŞİL geçti** — yani bugün sayfa gerçekten hiçbir yerde
      hata basmıyor.
- [x] **U4 Metinler yenilendi, uzun çizgi kalktı.** Ekranda **265 satır** uzun
      çizgi taşıyordu; şimdi **sıfır**. Çoğu düzyazı değil ayraçtı
      (`MÇ — Mehmet Çelik`, `A: 4 sınıf — 410, 411`,
      `310 sınıfı — Haftalık ders programı`). Yerine geçen kural:
      düzyazıda **ayrı cümle**, etiket/değer çiftinde **iki nokta**,
      eşit ağırlıkta iki şey arasında **orta nokta (`·`)**, boş tablo
      hücresinde **kısa çizgi (`–`)**. Karar `metin.spec.ts`'te ölçülüyor ve
      ölçtüğü şey kaynak değil `document.body.innerText`.
      **Kod yorumlarına dokunulmadı**: onlar İngilizce ve kimseye görünmüyor.
- [x] **U5 Sürüm numarasının tek kaynağı GERÇEKTEN tek.** CLAUDE.md iki sürüm
      boyunca öyle diyordu ve yanlıştı: numara üç dosyadaydı ve `yayinla.mjs`
      yalnız birini yazıyordu. Exe'nin karşılaştırdığı sayı tam da o.
      `tauri.conf.json` → `"../package.json"`, `Cargo.toml`'u `yayinla.mjs`
      yazıyor, ve `src/surum.test.ts` her koşuda ölçüyor (tuzak 77).
- [x] **U6 `gorunum.spec.ts`'in payı ölçüldü.** Uydurma `+2` kalktı.
      **Ölçülen:** sütun **39,0 px**, CSS'in istediği **37,4 px**, saat
      başlığının kendi istediği **41,0 px**. Tavan artık ölçülen zemin:
      sütun bu ikisinin arasında kalmalı, yani gömülü yüz değişince tavan da
      onunla birlikte oynuyor (tuzak 42).


---

### E turu — hareket ayarı · şerit standardı · koyu tema · baskı — **BİTTİ ✅** (2026-08-27)

Kullanıcının listesi: *"Animasyonları kapatma ya da azaltma seçeneği olsun
ayarlarda. Yazdır kısmında da alt şeritte simgeler olsun. Ayarlardaki alt şeritte
de semboller olsun. Kalan taskları yap. E2E testlerini ayarla. playwright
testlerini ayarla. Küçük düzeltmeler varsa yap. Koyu temada sıkıntı var mı bak
varsa düzelt ve koyu temayı daha da koyulaştır siyahları. Sectionların Alt
şeritlerini de bir standarta uygun hale getir simetrik olsun. Yazdır kısmında
önizlemedeki tablo biraz daha büyük ve görünür olabilir. Satırlar biraz daha
uzun olabilir."*

Dört karar soruldu ve cevaplandı: hareket **üç basamak** · koyulaştırma
**belirgin** · **Kontrol'e de şerit** · baskıda **yalnız ekran** değişsin.

- [x] **E1 Hareket ayarı (`tam · az · kapalı`).** Ayarlar → Görünüm'de dördüncü
      panel + komut paletinde bir komut. Dokuzuncu makine tercihi
      (`ders-programi-hareket`, `data-motion`), `State`'e girmez.
      **Asıl iş CSS'teydi:** süreler tek yerden kısılıyordu ama **mesafeler**
      her kuralda elle yazılıydı, ve 0 ms'lik bir geçiş hareketi durdurmaz —
      **ışınlar**. Dört yeni token: `--slide` · `--sweep` · `--press` · `--pop`
      (tuzak 57). **Makine tercihi bir TABAN, ayar onu ezemez** (tuzak 58);
      kayıt yoksa tercih sistemden türetilir. 3 birim + 7 E2E.
- [x] **E2 Şerit standardı — beş kural, altı sekme.** Beş şerit beş ayrı
      nesneydi. Şimdi: hepsi başlıkla açılır · `Sep`/`Spacer` ile bölünür · her
      düğmede **simge VE kelime** · hepsi `--ribbon-h` yüksekliğinde. **Yazdır
      ve Ayarlar ilk kez simge aldı**; üç varlık türü istisnasız `KIND_ICON`'dan
      (Yazdır dahil), gerisi lucide (14 yeni simge, +11,6 KB). Yeni dosya
      `e2e/serit.spec.ts` — 10 test, beş kuralı da ölçüyor, %100 ve %150'de.
- [x] **E3 Kontrol'ün şeridi ve süzgeci.** Karar değişti: Kontrol'de şerit
      **yoktu** ve o yüzden o sekmeye her girişte altındaki her şey **45px
      zıplıyordu**. Şerit raporu süzüyor (`Hepsi · Sorunlar · Kapasite`) ve
      sağ ucunda `N engel · N uyarı` diyor. Süzgeç `toolState`'te (tuzak 18);
      `buildReport` tam koşuyor, yani şeritteki sayı panellerle ayrışamaz.
- [x] **E4 Koyu tema koyulaştırıldı — ölçülerek.** Bütün düzlemler bir tam
      basamak indi. Yanında iki gerçek onarım: `--band` ΔE 4.67 → **2.45**
      (açık temayla aynı yük; gün bandı bir DURUM gibi okunuyordu — tuzak 40'ın
      diğer yüzü) ve `--muted`/`--closed` kontrastı 4.69 → **5.71**. `--shadow`
      ikiye ayrıldı (`--shadow-shell`): yapışkan başlığın gölgesi kabuk
      düzlemindedir ve koyu zeminde %35 siyah hiçbir şeydir. Eşikler
      `renk.spec.ts` ve `izgara.spec.ts`'te **sıkılaştırıldı**, ikisi de dün
      kırmızı olurdu.
- [x] **E5 Baskı önizlemesi — yalnız ekran.** Kâğıda tek bayt dokunulmadı.
      Ekranda `.print-page` bir **sayfa**: A4 yatay oranında taban, gölge,
      yuvarlak köşe, 62rem tavan; satır 30px → **3.25rem** (%110'da 57px).
      `@media print` süslerin hepsini geri alır ve `yazdir.spec.ts` ikisini
      birden ölçer.
- [x] **E6 Küçük düzeltmeler.** `.reason-bar`'a `role="status"` +
      `aria-live="polite"` — erişilebilirlik sözleşmesi bu satırı adıyla anıyordu
      ve satırda **yoktu**. `README.md` yazıldı (iki satırdı). `npm run gorsel`
      referansları belgelerde tarih olarak işaretlendi. Bayat yorumlar
      düzeltildi (`theme.ts` "beş skaler" → dokuz, `Appearance.tsx` "altı düğme"
      → on bir, `styles.css`'in `startViewTransition` öneren yorumu).
- [x] **E7 Doğrulama.** 453 birim + 318 E2E + 6 site = **777, hepsi yeşil**;
      `npm run cozucu` 7/7 (bir gerileme **yakaladı**: `'■ Durdur'` adı).
      `npm run ekran` iki temada 17 görüntü — ve **bakıldı**, bir görüntü bomboş
      çıkıyordu (tuzak 59). Ölçüm: `dist` **501 685 bayt**, açılış **65 ms**
      medyan / 84 ms en kötü.


---

### V turu — dokuz madde — **BİTTİ ✅** (2026-08-27)

Kullanıcının TASKS'in en altına yazdığı dokuz satır. **Şema v7 → v8'e çıktı.**

- [x] **V0 `v1.3.0` yayınlandı.** TASKS "tek kalan adım push" diyordu ve
      yanlıştı: `main` çoktan itilmişti, gitmeyen şey **etiketti**. Sebep
      `yayinla.mjs` içinde bir kusurdu — bir `replace` çağrısının hiçbir şeyi
      değiştirmemesini "satır bulunamadı" diye okuyordu, ki bu tam da o
      dalın hizmet ettiği normal durumdur. Düzeltildi, dört durum ölçüldü.
      Release'in **dört** varlığı da 200: HTML · ZIP · **exe 3 664 896 bayt
      (Windows/WebView2)** · **`surum.json`, ilk kez**.
- [x] **V1 Çift branş — `schemaVersion` 8.** `Teacher.subject2` +
      `Lesson.second`. **Alt branş değil çift branş**, ve gerekçe kullanıcının
      kendi ikinci örneği: "Matematik 1/2" bir ağaçla anlatılabilir, "Türkçe
      ve Edebiyat" anlatılamaz. Yeni yaprak modül `src/subjects.ts`
      (`keys.ts` deseni). Ders branşın **adını değil bayrağını** tutuyor;
      `sanitize()` yetim bayrağı temizliyor. Göç koşulu kaldırılarak
      **kırmızıya döndürüldü**.
- [x] **V2 İki saatlik blok TEK kart.** `colSpan={2}`, etiket bir kez ve bir
      basamak büyük. **Öğle arasını aşan blok birleşmiyor** — ayraç sütunu
      `data-day` taşımaz (tuzak 13). `drag.ts` `data-span` okuyor, yoksa
      vurgunun geri kalanı sessizce boyanmıyordu.
- [x] **V3 Renklerin üstündeki sayılar kalktı.** İndeks **erişilebilir ada**
      taşındı; `--on-color` güvencesi metnin hâlâ olduğu yere (`.card`,
      `.pool-card`) taşındı ve sabotajla sınandı. Yan kusur ekran
      görüntüsüne **bakarak** bulundu: kutu yüksekliğini yazıdan alıyormuş.
- [x] **V4 Listelerde sıra numarası.** `#` sütunu, dört listede de tek
      kancadan (`useRowOrder`). **Görünen** sıra, dizinin indeksi değil.
- [x] **V5 Havuz kartının kırpılması.** Ölçüldü: **5,2px** dışarıda
      (2,2 kalkma + 2 outline + 1 offset), üst dolgu 0. Dolgu `--slide`
      üstünden türetildi.
- [x] **V6 Yoğunluk her yerde.** Liste satırı **57 → 34px**, katlanın
      üstünde **10 → 19**, Sınıflar 20/20. **Hiçbir yazı küçülmedi** — 12px
      sınırı duruyor ve test onu ölçüyor.
- [x] **V7 Açık ↔ koyu tema renk şeridi — ÖLÇÜLDÜ, kusur YOK.** Açık tema
      altı bölümün beşinde **daha güçlü** (5,53–7,31 ↔ 4,28–5,84). Koda
      dokunulmadı; zemin `renk.spec.ts` 80'de sabitlendi.
      *(İlk ölçüm yanlıştı: `contrast()` `oklab()` ayrıştıramıyor ve zemini
      siyah okuyordu — boyayıp piksel okununca tablo tersine döndü.)*
- [x] **V8 Sıralama yönü tuşu.** `ListQuery.desc`; karşılaştırıcı
      **negatifleniyor**, `reverse()` değil — kararlı sıralamada `reverse()`
      eşitleri de çevirirdi.
- [x] **V9 Dersler'de öğretmen ve sınıf süzgeci + dağılım katlanıyor.**
      `Facet.of` artık çok değerli. `patternLabel` 4 terimden sonra `10×1` /
      `3×2 + 4×1` yazıyor.
      *(Aynı turda ölçülerek reddedilen fikir: "çok değerli süzgeç açılır
      liste olsun" — 25 çip %110'da tek satır, uçurum yok, dal silindi.)*

> **Z turu bitti (2026-08-27): ders dağılımı, açık tema, örnek verinin yeri,
> branşlarda sıralama.** Kullanıcının dört maddesinin dördü de yapıldı ve
> **şema v6 → v7'ye çıktı** — `Lesson.blockSize` yerine `Lesson.pairs`.
> Ayrıntı ve **ölçülen her sayı** [STATUS.md](STATUS.md) → *Yirmi altıncı
> oturum*.
>
> - [x] **Ders dağılımı.** Haftalık saat girilir, sonra `1+1+1` / `2+1` gibi
>       bir dağılım **seçilir** (aSc'nin `Lessons/week` + yanındaki liste
>       ikilisi). Üç saatlik blok kalktı. Havuzda artık **blok başına kart**.
>       Yeni `src/blocks.ts`, yeni sözleşme `placedBlocks()`, çözücüde ders
>       başına **iki iş kalemi**, v6 → v7 göçü ve testleri.
>       **Ölçülen kazanç:** örnek okul artık **eksiksiz** diziliyor
>       (367/367 blok, havuzda 0) — eskiden blok boyuna bölünemeyen saatler
>       kalıcı olarak havuzda kalıyordu.
> - [x] **Varsayılan tema açık**, ve sistemi izlemiyor. Gerekçe ve hareket
>       ayarından neden farklı olduğu CLAUDE.md'de.
> - [x] **Örnek verinin evi Ayarlar → Veri.** Kurulum'da yalnız ilk kullanımda
>       tek satır; işlem yapılınca bir daha çıkmıyor
>       (`ders-programi-tanitim`, onuncu makine tercihi).
> - [x] **Ayarlar → Branşlar'da elle sıralama.** Beşinci liste; sıra
>       Öğretmenler adımındaki Branş listesine yansıyor.
>
> *(O turun bıraktığı açık madde — `e2e/gorunum.spec.ts:309`'un payı —
> **U6'da kapandı**: uydurma `+2` yerine ölçülen zemin kondu.)*

> **Y turu bitti (2026-08-26).** Kullanıcının on bir maddesi + üç liste kusuru
> karşılandı: `Sil` hizası, Öğretmenler listesinin yatay kayması, şerit-liste
> boşluğu, Müsaitlik'in çarpıları, kartın üstüne kart bırakma, bir A4'e 1/2/4
> program, kâğıttaki yazı boyutu, 6. saatin saatleri, sol sütun, gün sınırı,
> "Sayfada ne olsun"un kırpılan satırı, önizleme = çıktı, kâğıtta çarpı yok,
> ve öğretmen sayfasında sınıf renkleri. **Şema değişmedi.**
> Sayılar: 508 birim + 381 E2E + 6 site testi yeşil. Ayrıntı ve **ölçülen her
> sayı** aşağıda, **Y turu** bölümünde.

> **B turu bitti (2026-08-26).** Beş maddenin beşi de yapıldı, artı kalan
> tasklardan **4f**. Dal: `v1.1-kurulum`. Ayrıntı ve **ölçülen her sayı**
> [STATUS.md](STATUS.md) → *Yirmi ikinci oturum*.

> **G turu bitti (2026-08-27): kalan üçlü + `.exe`.** Ayrıntı
> [STATUS.md](STATUS.md) → *Yirmi üçüncü oturum*.
>
> Kalan üç kod maddesinin üçü de kapandı: **fontun ağırlık ekseni**
> (asıl engel eksen değil reçetenin yokluğuydu — `npm run font` yazıldı,
> `400:700` ölçülerek alındı, `300` ölçülerek reddedildi, ve beş kuralın
> sessizce 600 çizdiği gerçek hata kapandı), **görsel regresyon sorusu**
> (cevap: geri gelmiyor, ama `ekran`ın kendi deliği bir iddiayla kapandı) ve
> **4j belgeler**. Yanında A4 ile MCP satırları da `[x]` oldu.
>
> `.exe` **ayağa kalktı ve gerçekten çalıştı**: 4g ve 4h bitti, 4i'nin iş
> akışı yazıldı ama henüz koşmadı. Exe hiçbir kuralı kopyalamıyor —
> `src/desktop.ts` üç Tauri komutunu bir klasör tutamağı kılığına sokuyor,
> `saveInto()` olduğu gibi koşuyor. Kanıt: exe açıldı, **hiçbir şeye
> tıklanmadan** `~/Documents/Ders Programı/` altına iki dosya düştü.
> Sayılar: **521 birim + 394 E2E + 19 site + 7 çözücü + 6 Rust**, hepsi yeşil.
>
> **SIRADAKİ İŞ — üçü de KULLANICIDA, ve ikisi artık aynı gün yapılabilir:**
> 1. **`surum.yml` bir kez koşturulsun** (Actions → sürüm → Run workflow,
>    `yayinla` **işaretsiz**). Tek koşuda üç teslim dosyası da çıkar:
>    `Ders-Programi.html`, `Ders-Programi-Windows-kurulum.zip`,
>    `Ders-Programi.exe`. Üçü de babanın makinesinde denensin — bu makinede
>    ölçülemeyen her şey orada görülecek: WebView2, gerçek açılış süresi,
>    SmartScreen'in ne dediği, `Kur.cmd`, `.lnk` üretimi, PowerShell 5.1, ve
>    Belgelerim'e gerçekten yazıp yazmadığı.
> 2. **Tutuyorsa bir sürüm yayınlansın** (`git tag v1.1.0 && git push origin
>    v1.1.0`). O andan itibaren README'deki üç indirme bağlantısı çalışır ve
>    babaya `npm` anlatmak gerekmez. Bugün o bağlantılar 404 veriyor.
>    Kurulum klasörü yolu **kalıyor** (kullanıcı kararı, 2026-08-27):
>    hangisinin tuttuğuna baba kullandıktan sonra bakılır, ilke 5.
> 3. **GitHub Pages — açıldı, ama adres BAŞKASINA gidiyor.** Depo
>    `ders-programi` olarak yeniden adlandırıldı ve Pages kaynağı
>    "GitHub Actions" seçildi; `site #5` uçtan uca **geçti**. Kalan sorun
>    kodda değil: `AlparslanSemiz.github.io` deposunda commit'li bir `CNAME`
>    (`gamemetrix.me`) var ve GitHub Pages'te **kullanıcı sitesinin alan adı
>    bütün proje sayfalarını kapsıyor**, o yüzden
>    `alparslansemiz.github.io/ders-programi/` Cloudflare'daki GameMetrix'e
>    yönleniyor ve 404 veriyor.
>    **Kaldırmanın GameMetrix'i kırmayacağı ölçüldü** (o site `server:
>    cloudflare`, `x-github-request-id` yok — Pages'ten bağımsız).
>    **Kullanıcıda kalan:** `AlparslanSemiz.github.io` deposunda Settings →
>    Pages → Custom domain'i temizle **ve** kökteki `CNAME` dosyasını sil
>    (dosya commit'li olduğu için yalnız ayarı temizlemek geri gelmesine
>    açık). Sonra adres `https://alparslansemiz.github.io/ders-programi/`.
>
> Ondan sonra hâlâ bekleyen tek büyük şey: **gerçek veriyle deneme**
> (babanın listesi) — v0'ın çıkma şartı.


---

### D turu — tasarım kısıtları kaldırıldı, arayüz baştan kuruldu — **BİTTİ ✅**

Kullanıcı kararı (2026-08-26, üç kez tekrarlandı): *"Claude.md ya da Design.md ya
da Plan.md ya da bambaşka design noktasındaki kısıtlamaları kaldır ve sil onları.
ardından uygulamamızı/sitemizi en güzel UX'li en güzel UI'lı hale getir."*

Sorulan üç sınır ve cevapları: **estetik + bağımlılık yasağı** kalksın ·
**kontrast/erişilebilirlik testleri kalsın, düzen testleri gitsin** · kapsam
**her şey (akış ve gezinme dahil)**. Sonra Faz 3'ten sonra durulup gösterildi ve
kullanıcı **"daha cesur olsun"** dedi.

- [x] **D0 Belgelerden kısıtlar silindi.** CLAUDE.md'nin ~290 satırlık "Tasarım
      sistemi" bölümü → 68 satırlık **"Tasarım — serbest"**. Geriye dört
      sözleşme kaldı (işlevsel renk kanalı · erişilebilirlik · kâğıt fiziksel ·
      ilke 1–3). `docs/DESIGN.md` boşaltıldı, `docs/PLAN.md`'nin tasarım
      ifadeleri bağlayıcı olmaktan çıkarıldı. Bağımlılık yasağı da kalktı.
- [x] **D1 Test sözleşmesi yeniden çizildi.** Silinen: `gorsel.spec.ts` + 24 PNG
      + `npm run gorsel`, `sutun.spec.ts`, `duzen.spec.ts`'in geometri yarısı
      (→ `kabuk.spec.ts`), `renk-secici.spec.ts`'in sığma yarısı,
      `izgara.spec.ts`'in Sığdır↔havuz takası. C10'un bıraktığı **24 kırmızı**
      da kapandı; ikisi gerçek hataydı (`library.ts` iki anahtarı saymıyordu;
      `renk.spec.ts` koyu temada DOM hakkında yanılıyordu).
- [x] **D2 Bağımlılıklar — ölçülerek.** Alınan: `lucide-react` (+3,4 KB),
      `@radix-ui/react-{dialog,dropdown-menu,tooltip,popover}` (+123,3 KB).
      **Alınmayan: `motion` (+127,2 KB)** — CSS'in yapamadığı tek getirisi
      tarayıcının `startViewTransition()`'ında bedava. **Tailwind da alınmadı.**
- [x] **D3 Görsel dil.** OKLCH'ten türetilmiş nötr rampa (tek hue 258), kot 2→5,
      yarıçap 3→5, tipografi 6→9 basamak, hareket 110/180/280 ms + üç eğri,
      **üçüncü yoğunluk "Ferah"**, ölçek varsayılanı **%100 → %110**.
      Yol boyunca bir regresyon ölçümle bulundu: %110'da Sığdır haftayı
      sığdıramaz oldu, tabanı **kartın üst satırı** koyuyordu (tuzak 37'nin
      yöntemiyle tek tek kapatılarak bulundu).
- [x] **D4 Cesur tur** (kullanıcı kararı). Seçili sekme bölüm rengiyle **dolu**,
      accent elektrik indigo (#373bdb), masa derinleşti, başlıklar büyüdü.
      Renk sözleşmesinin tek eşiği gevşetilmedi.
- [x] **D5 Diyaloglar.** 12 `window.confirm` + 5 `window.alert` → tek
      `useDialogs()`. `deletionSummary` ikiye bölündü (`deletionQuestion`),
      tek-string hâli ve testleri **aynen** duruyor. `Toasts` elde yazıldı
      (Radix Toast 19,6 KB ve eylem taşımayan toast'a gerekmiyor).
      `src/Root.tsx`: duman testi artık **gerçek** ağacı çiziyor.
- [x] **D6 Varlık paneli** — kullanıcının doğrudan istediği şey. `entityWeek` +
      `entityFacts` (saf, testli), `Inspector.tsx` çizer. Izgarada satır
      başından ve üç listeden açılıyor. Asıl test: panelin çizdiği hafta
      **ızgaranın çizdiği haftanın aynısı**.
- [x] **D7 Listelerde ara · sırala · süz** — iki kez istenmişti. `listview.ts`
      saf: `fold()` Türkçe katlama (`'İ'.toLowerCase()` bir birleşik nokta
      üretiyor — testte önce **bug'ın kendisi** gösteriliyor), `compareTr()`,
      `applyList()`, `facetCounts()`. Dört listenin de üstünde aynı şerit.
- [x] **D8 Müsaitlikte saat ayarı** (varsayılan **kapalı**, istendiği gibi) +
      **Program'da "Programı boşalt"** (adıyla istenmişti).
- [x] **D9 Komut paleti (Ctrl+K), durum çipi ve klavye.** Palet 6 destinasyon +
      eylemler + her varlık; bir varlığı seçmek panelini açıyor.
      Çip her sekmede ve sorunu **adlandırıyor**. `Alt+1..6`.
      Ölçümle bulunan hata: çip eklenince %150'de son sekmeler kendi kutusundan
      taşıyordu (tuzak 48).
- [x] **D10 Doğrulama ve ölçüm.** `npm run kontrol` yeşil: **450 birim +
      277 E2E + 6 site**. Ve **ilke 7 artık varsayım değil**:
      `dist/index.html` 489 815 bayt, `file://` açılışı **73 ms medyan**
      (7 koşu), imleç haçı 0,391 ms/sütun.
- [x] **D11 Belgeler.** `docs/DESIGN.md` yeni CSS'ten yeniden yazıldı (envanter,
      kural değil). CLAUDE.md'ye dört yeni tuzak (**48–51**).

#### Kalanlar — bu turdan çıkan, henüz yapılmamış

- [x] **Öğretmende cinsiyet alanı ve elle sürükleyerek sıralama.** **F turunda
      yapıldı** (2026-08-26). Cinsiyet `schemaVersion` 6 istedi ve aldı; elle
      sıralama **istemedi** — dizinin kendisi zaten sıra, ayrı bir indeks
      ikinci bir gerçek olurdu.
- [x] **Fontun ağırlık ekseni — 400–700, ve 300 ÖLÇÜLEREK reddedildi (2026-08-27).**
      Asıl engel eksen değil **reçetenin yokluğu**ydu: 23 KB'lik woff2 kimsenin
      yeniden üretemediği bir eserdi, o yüzden içindeki karar donmuştu (tuzak
      69). `scripts/font.mjs` + `scripts/font-source/` (kaynak yüz depoda, OFL
      1.1) → `npm run font`.
      **Kaynak değişti ama METRİK değişmedi:** 225 karakterin 225'inde de
      ilerleme birebir aynı (`'0'` = 600/600), yani `ch` merdiveni kıpırdamadı
      (tuzak 39 güvende).
      **Ölçülen eksen maliyeti:** `400:700` **+1 060 bayt** · `350:700` +7 880 ·
      `300:700` +8 600. Aşağı yarısı sekiz katı ve `styles.css` 300'ü **hiç**
      istemiyor → ilke 5, alınmadı.
      **Kapatılan gerçek hata:** beş kural `font-weight: 700` istiyordu ve yüz
      600'de kırpılı olduğu için beşi de sessizce 600 çiziyordu — **üçü kâğıtta**
      (tuzak 70). Ölçüm: `'0'` glifinde 600↔700 nokta farkı **0.0 → 406.5**;
      tarayıcıda eski yüzde `600=1042 700=1042`. `temel.spec.ts` 46'ya yeni test,
      eski yüz geri konularak **kırmızıya döndürüldü**.
- [x] **Görsel regresyon yerine ne konacak? — CEVAPLANDI (2026-08-27).**
      Cevap iki parçalı ve ikincisi yazıldı.
      (a) **Geri gelmiyor.** 24 referans kullanıcı kararıyla silindi ve yerine
      geçen şey zaten var: erişilebilirlik ölçümleri **anlam** ölçüyor (WCAG
      kontrastı, CIE Lab ΔE, erişilebilir ad), piksel değil. Bir ΔE eşiği
      yeniden düzenlenen bir panelden etkilenmez; bir PNG referansı etkilenir.
      (b) **Ama `ekran`ın kendi deliği kapatıldı.** "Bakan kimse yoksa ne
      yakalar" sorusunun dürüst cevabı *hiçbir şey*di, ve katmanın kendi
      arızası tam olarak buydu: bomboş bir PNG üretip sessiz kalmak.
      `ekran.spec.ts` artık **tek bir iddia** taşıyor — deklanşör anında
      `.main` ve her `.panel` tam opak. Tasarım hakkında hiçbir şey söylemiyor,
      "bir şeyin resmi çekildi" diyor. `settled()` çıkarılarak kırmızıya
      döndürüldü: `panel opacity=0.00`, yani yaşanan hatanın ta kendisi.
- [x] **`npm run cozucu` `kontrol`'e ALINDI (2026-08-26).** Ölçüldü: **34,8 sn**,
      7/7 yeşil. `kontrol` zaten ~3 dakika, yani maliyet **%19**; karşılığında
      "hepsi" diyen komut gerçekten hepsini koşuyor. Gerekçe bu turda tazelendi:
      Yazdır'ın düğmesi `"Yazdır (N sayfa)"` → `"N kâğıt"` oldu, ve tam olarak
      bu tür bir ad değişikliği `cozucu`'nun daha önce yakaladığı gerilemeydi.
      Ayrı komut olarak da duruyor (elle koşmak için).

---


---

### F turu — elle sıralama · baskı seçenekleri · cinsiyet — **BİTTİ ✅** (2026-08-26)

Kullanıcının listesi: *"Listelerde kendimiz sürükleyerek sıralama özelliği.
Yazdır kısmında açıp kapatma opsiyonları her yazılan şey için kurs yazılsın mı
saat yazılsın mı çıktı saati yazılsın mı vb. Öğretmende cinsiyet + elle
sıralamayı da yapalım."*

Dört karar soruldu ve cevaplandı: sıralama/süzgeç açıkken tutamak **pasif** ·
baskı seçenekleri **sağdaki panelde ve kalıcı** · cinsiyet **listede + sıralama
ve süzme + Kurulum özetinde**, kâğıda çıkmaz.

- [x] **F1 Elle sürükleyerek sıralama — dört listede de.** `src/rowDrag.ts`
      (saf DOM pointer jesti, `poolSplit.ts` deseninin **dördüncüsü**) +
      `reorderList()` (`entities.ts`, saf) + `useRowOrder()` (dört listenin
      ortak kancası). Tutamak **kendi sütununu** alır (tuzak 47) ve klavyeyle
      de çalışır (ok · Home · End), taşıma `role="status"` ile söylenir.
      **Şema değişmedi:** dizinin kendisi sıra; `parseState` onu koruyor,
      `sanitize` ona dokunmuyor. Payoff liste değil ızgara: Program'ın satır
      sırası, Yazdır'ın sayfa sırası ve Müsaitlik'in seçicisi hepsi aynı diziyi
      `map`'liyor.
- [x] **F2 Havuz sırası ızgarayı takip ediyor.** `buildPool` kartları satır
      etiketine göre **alfabetik** diziyordu; elle sıralanmış bir ızgarada bu
      "kartını bulmak için yukarı doğru avlanmak" demekti. Artık satır
      **indisine** göre. Yorumun kendi niyeti ("bir satırın kartları yan yana
      dursun") korundu.
- [x] **F3 Yazdır — "Sayfada ne olsun".** `src/printOptions.ts`, beş anahtar
      (`school · credits · clock · stamp · cellBottom`), **tek** localStorage
      anahtarı `ders-programi-baski`. `theme.ts`'e girmedi ve gerekçesi yazıldı:
      oradaki dokuz skaler ilk boyamadan önce `<html>`'e öznitelik yazan düzen
      değerleri; bunlar render anında React prop'u olan **tek bir karar**.
      **Çıktı tarihi yeni bir öge** (`.p-stamp`) ve **kapalı başlıyor** — açık
      gelseydi paneli hiç açmamış birinin çıktısı değişirdi.
- [x] **F4 Öğretmende cinsiyet — `schemaVersion` 6.** `Gender = '' | 'k' | 'e'`,
      alan adı **İngilizce** (`gender`). Göç: `version === 5` okuyucunun
      koşuluna **açıkça** eklendi — eklenmeseydi bugünkü sürümün yazdığı her
      yedek `null`'a düşerdi. Beş test bunu koruyor ve koşul kaldırılarak
      **kırmızıya döndürüldü**, bedava yeşil değil. Yapıştırma kutusu dördüncü
      sütunu okuyor, üç sütunlu eski yapıştırma bozulmuyor.
- [x] **F5 `listview.ts` facet'i ÇOĞULLAŞTI.** Liste başına tek çip satırı
      vardı; cinsiyet ikincisini gerektirdi. `facets: Facet[]` +
      `query.facets: Record<id, value>`; iki çip satırı **birlikte daraltıyor**,
      ve bir satırın sayıları **öteki uygulanmışken** alınıyor.
- [x] **F6 Liste tablosu artık KENDİ kutusunda kayıyor.** F4'ün açığa
      çıkardığı, ondan eski bir hata: `width: 100%` bir tabloda on bir sütun
      %150 ölçekte sığmıyor ve tarayıcı odayı **küçülebilen** sütundan alıyor.
      Ölçülen: ad kutusu 232px → **26px**, branş kutusu okunmaz. `.table-scroll`
      + `min-width: max-content` + kontrollere `ch` cinsinden taban.
      Ölçülen sonuç: %150'de ad **283px**, sayfa yatay taşması **0**.
      Üç yeni E2E ölçüyor ve kaydırma kutusu kapatılarak kırmızıya döndürüldü.


---

### B turu — yerel kurulum — **BİTTİ ✅** (2026-08-26)

Onaylanan planın park edilmiş yarısı. Dal `v1.1-kurulum`, madde başına bir
commit. Logo parçası Y turunda yapılmıştı (üç aday, kullanıcı **A — Şerit**'i
seçti; adaylar `site/logo-adaylari/` altında duruyor ama artık yayınlanan
siteye **girmiyor**).

Turun gerekçesini **bir kez yanlış yazdım ve ölçümle düzelttim**: "`file://`
güvenli bağlam değildir" dedim, Chromium'da değil — orada da güvenli bağlam ve
`showDirectoryPicker` da var. Eksik olan bir **köken** (OPFS `SecurityError`,
service worker `TypeError`, `origin` makinedeki her yerel sayfayla ortak).
Yerel sunucu klasör özelliğinin tek evi değil, **daha iyi** evi. Ayrıntı:
[STATUS.md](STATUS.md) → *Turun gerekçesini düzeltmek zorunda kaldım*.

- [x] **B1 Yerel sunucu.** `scripts/sunucu.mjs` (Node) + `kurulum/sunucu.ps1`
      (Windows ikizi, babanın makinesinde **asıl koşacak** olan — Node
      gerekmiyor). `HttpListener` değil ham `TcpListener`: `localhost` dışı
      bir önek `netsh http add urlacl`, yani yönetici ister.
      **İki geri döngüye birden** bağlanıyor (tuzak 66).
      ÖLÇÜLDÜ: OPFS ve service worker burada çalışıyor, `file://`'ta
      `SecurityError`/`TypeError`; iki sunucu da `127.0.0.1`, `[::1]`
      ve `dersprogrami.localhost` üzerinden **baytı baytına aynı** yanıtı
      veriyor; açılış `file://` 76 ms ↔ sunucu 82 ms (9 koşu).
      `pwsh` 7.6.5 kuruldu ve betik burada koşturuldu.
      `e2e/sunucu.spec.ts` — 5 test.
- [x] **B2 Kurulum betikleri ve paket.** `Kur.cmd` · `Guncelle.cmd` ·
      `kur.ps1` · `OKU.txt` · `icon.ico` + `scripts/{ikon,paket}.mjs`.
      `dist-kurulum/` = **569 034 bayt**, elden ele giden tek klasör.
      `.cmd`'ler **yalnız ASCII** (cmd.exe kod sayfası), `.ps1`'ler **UTF-8
      BOM + CRLF** (5.1 BOM'suzu ANSI okur), `.gitattributes`'ta `eol=crlf`.
      Pencere **gizlenmiyor** (plandan sapma, gerekçesi: gizli pencere =
      kapatılamayan program). Güncelleme `site\`'ı **silip** yazıyor, yoksa
      kaldırılan bir dosya orada kalır.
      ÖLÇÜLDÜ: kopyalama yolu gerçekten koşturuldu — 9 dosya yerine gitti,
      bilerek bırakılan eski dosya silindi, kopyalama kısayol adımından
      **önce** bitti, kısayol argümanında boşluklu yol tırnak içinde.
      **DENENMEDİ:** `Kur.cmd`, `.lnk` üretimi, Windows PowerShell 5.1.
- [x] **B3b Gömülü favicon.** `index.html`'e `data:` URI. İşaret artık iki
      yerde ve **ayrışmasını bir test yakalıyor**: URI çözülüp
      `site/icon.svg` ile aynı 13 dikdörtgeni çizdiği karşılaştırılıyor.
      Ölçüm: +1 451 bayt (işaretin kendisi 1 205).
      Kendi hatam düzeltildi: ilk testim "dosyada `icon.svg` metni geçmesin"
      diyordu ve **yorumu** yakalıyordu; doğru iddia "hiçbir href/src `data:`
      dışına bakmıyor".
- [x] **B4 "Nereye kaydedilsin" (eski 4l).** `src/folder.ts` (yaprak modül;
      `dailyName` ve `prunable` **saf ve testli**, 9 birim testi) +
      `src/useFolder.ts` (App'te, tuzak 18) + Ayarlar → Veri'de panel.
      Yazılan şey **bütün planlar** (paket), açık plan değil. Günlük yedek
      son 10 gün, ve **ad kalıbıyla** budanıyor — Belgelerim'de babanın kendi
      dosyaları var, "en yeni ondan gerisini sil" onun işini silerdi.
      Yazma hatası **sessiz kalmıyor** (tuzak 7).
      **Şema değişmedi, yeni localStorage anahtarı yok:** tutamak
      `IndexedDB['ders-programi-klasor']`'da, çünkü localStorage bir tutamağı
      saklayamaz — ama hâlâ `State`'e girmiyor.
      `e2e/klasor.spec.ts` — 8 test, **gerçek** bir `FileSystemDirectoryHandle`
      ile (OPFS); yalnız sürülemeyen parça sahtelendi (tuzak 67).
      Dört ayrı sabotajla kırmızıya döndürüldü.
      **DENENMEDİ:** gerçek klasör diyaloğu — Playwright'la sürülemez.
- [x] **B5 Belgeler.** İlke 2'nin **ikinci daraltması** (yerel statik sunucu
      var; backend, veritabanı, hesap, oturum, API yok), üç derleme hedefi,
      `folder.ts`/`useFolder.ts` mimari şemaya, IndexedDB'nin gerekçesi,
      README'de üç teslim yolu, ve **tuzak 65–68**.

#### Bu turda çıkan yeni tuzaklar

- **Tuzak 65** — "güvenli bağlam" ile "gerçek köken" aynı şey değildir, ve
  bu tuzağın kaydı **benim ona düşmem**: bir turun bütün gerekçesini
  ölçmeden yazdım, yanlıştı, ve yakalayan şey bir test değil bir **ekran
  görüntüsü** oldu.
- **Tuzak 66** — tek geri döngüye bağlanan sunucu bazı makinelerde sessizce
  bulunamaz.
- **Tuzak 67** — structured clone fonksiyon klonlayamaz; elle yazılmış sahte
  tutamak IndexedDB'ye hiç girmez ve "hatırlanıyor mu" testi hiçbir şey
  ölçmez. Çare sahteyi **küçültmek**.
- **Tuzak 68** — `addInitScript` her yüklemede koşar; oraya konan bir
  "varsayılanı yaz" satırı testin reload'dan önce kurduğu durumu geri alır.
- **Tuzak 62 üçüncü kez**: sabotaj koşusunda yama `tsc`'yi kırdı, derleme
  düştü, test **bir önceki** `dist-site`'ı ölçüp yeşil geçti.
- **Tuzak 49 yeniden yaşandı** ve bu kez bir gerilemeydi: yeni panelin
  `role="status"` satırı `planlar.spec.ts`'in `.panel .hint[role="status"]`
  sorgusunu ikiye çıkardı. Sorgu paneline daraltıldı.

#### B6 İşaretin iki çizimi + üst çubuktaki marka — **BİTTİ ✅**

Kullanıcının iki isteği: *"evet logoyu öyle yap. ayrıntılı olanı da güzel bir
şekilde websitenin üst barında en sol üste koy."*

- [x] **B6a Küçük boy için sade varyant.** `site/icon-small.svg` — aynı fikir,
      üç sütun, hayalet sütun yok, çubuklar iki kat geniş. **İkinci bir logo
      değil**; gerçek ikon setleri bunu yapar. Eşik (`< 48 px`) uydurulmadı:
      iki çizim 16/32/48/256'da yan yana render edilip **bakıldı**
      (`scratch/ikon-karsilastirma.png`, `scratch/ikon-sekme.png`).
      Sade: sekme favicon'u + `.ico` 16/32. Ayrıntılı: `.ico` 48–256, PWA
      192/512, üst çubuk. Favicon `data:` URI'si **1 205 → 467 bayt**.
      `scripts/favicon.mjs` URI'yi yeniden üretiyor — elle düzenlenmiyor.
      **Site derlemesinin `<link rel="icon">`i kaldırıldı**: `<head>` sırasında
      kazanıp sekmeye ayrıntılı işareti geri koyuyordu.
- [x] **B6b Marka işareti üst çubukta, en sol üstte.** `.brand-mark`,
      `1.75rem` → **ölçülen 28 px @%100, 42 px @%150** (`--ui-scale`'i
      izliyor), sol kenardan 14/21 px. İnline SVG (ilke 3), düğme değil,
      `aria-hidden`. Tuzak 48'in sorusu ölçülerek cevaplandı: işaret feda
      edilmiyor, **sığıyor** — örnek okul yüklüyken (tuzak 41) iki ölçekte de
      sekme taşması 0, çubuk taşması 0.
      Çizim artık üç yerde; ayrışmayı iki test yakalıyor (`temel.spec.ts` 72,
      `kabuk.spec.ts` 76). Dördü de sabotajla kırmızıya döndürüldü.

**Sabotaj iki şey daha buldu:** `.brand`'in `@media print` kuralı **ölüydü**
(`.topbar` baskıda zaten gizli) — silindi, test koruma testi olarak
işaretlendi; ve `scripts/favicon.mjs`'i belgelerken gövdesini iki kez
yazmışım, betik hiç koşmuyordu ve bunu ancak sabotaj gösterdi.

---

### PARK EDİLEN: yerel kurulum turu (B)

**Kapandı 2026-08-26.** Beş maddenin beşi de yapıldı — bkz. yukarıdaki
*"B turu — yerel kurulum — BİTTİ"*. Park notunun öngördüğü dürüst sınır
(`pwsh` bu makinede yok, betik "gözden geçirildi, ölçülmedi" diye
işaretlenecek) **gerçekleşmedi**: kullanıcı kurulmasını istedi, `pwsh` 7.6.5
kuruldu ve `sunucu.ps1` burada gerçekten koşturuldu. Ölçülemeyen üç şey
kaldı ve adlarıyla yazıldı: `Kur.cmd`, `.lnk` üretimi, Windows PowerShell 5.1.




---


---

### Y turu — listeler + kâğıt — **BİTTİ ✅** (2026-08-26)

Kullanıcının bu dosyanın sonuna elle yazdığı on bir satır, artı aynı mesajda
gelen üç liste kusuru. **Her maddenin yanındaki sayı ölçülmüş bir sayıdır**;
hiçbiri "düzeltildi" diye işaretlenmedi, hepsi önce ölçüldü, sonra düzeltildi,
sonra testi yazıldı ve **test kaynak bozularak kırmızıya döndürüldü** (12 yeni
E2E'nin 10'u kırmızıya döndü; kalan ikisi bilerek koruma testi).

#### Listeler — Kurulum'un dört adımı

- [x] **A1 `Sil` dört listede de en sağda.** Teşhis ölçüldü: Dersler'in eylem
      sütununda **tek** düğme var, öteki üçünde iki (bilgi + Sil), o yüzden
      13ch'lik sütun tek düğmeyle içeriğinden geniş kalıyordu. Ölçülen boşluk
      Dersler'de **42 px (%100) / 73 px (%150)**, ötekilerde 6–19 px. Çare
      hizalama kuralı (`table.list td > .form-row { justify-content: flex-end }`),
      ve yanında ikinci bir kaza kapandı: `.form-row`'un `margin-bottom`'u her
      eylem hücresinde de geçerliydi — **satır boyu 70 → 57 px**.
      Sonuç: dördünde de **6 px**.
- [x] **A2 Öğretmenler listesi yatay kaymıyor.** Ölçülen taşma varsayılan
      ölçekte **106 px**, %125'te 267, %150'de 548 — ve sağda 620 px'lik bir
      kenar sütunu boş duruyordu. İki adım, ikisi de ölçülerek:
      (a) `.cols.wide-left` `2fr 1fr` → `1fr minmax(19rem,24rem)`, sol sütun
      **1185 → 1381 px**; (b) dört sütun tarayıcının istediği genişliğe
      kırpıldı (`Kısaltma` 16ch → 10ch, `.color-pick` 7ch → 5ch, satırdaki
      `.num` 8ch → 7ch, `th.num` `--w-col-sm` → `--w-col-xs`).
      Sonuç: **%100, %110 ve %125'te taşma 0**. %150'de `.table-scroll`
      duruyor — on bir sütun oraya hiçbir düzenle sığmaz ve mevcut test
      "sayfa değil TABLO kayar" iddiasını orada tutuyor.
- [x] **A3 Arama şeridiyle liste arasındaki boşluk.** Ölçülen **44 px**, ve
      çoğu **her zaman çizilen boş bir duyuru satırı**ydı (`min-height: 1.2em`).
      Duyuru şeridin kendi satırına taşındı (`.list-said`, `.list-note` DEĞİL —
      tuzak 49) ve `.list-tools` alt boşluğu `--space-5` → `--space-3`.
      Sonuç: **9 px**.

#### Kâğıt ve ızgara — kullanıcının on bir maddesi

- [x] **Y1 Müsaitlikte çarpılar büyük ve kırmızı.** `--muted`/`--fs-lg` →
      `--bad`/`--fs-2xl`. Renk kanalını bozmuyor çünkü **kapsam** dar: o
      ekranda bırakma da reddetme de yok, tek söylenen açık/kapalı. Tarama
      duruyor (renk tek başına durum taşımaz) ve kontrast ölçülüyor.
- [x] **Y2 Kartın üstüne kart bırakılabiliyor, eski ders havuza dönüyor.**
      `dropMap()` (`constraints.ts`) — `check()` artı **tek** bir reddin
      geçersiz kılınması: sınıfın kendi başka dersi. Öteki bütün retler
      *başkasıyla* ilgili (öğretmen başka sınıfta, derslik dolu, saat kapalı)
      ve önündeki bloğu havuza atmak onları doğru yapmaz. Hücre **yeşil değil
      sarı**: izin var ama bir şey kaybediyorsunuz — dördüncü bir renk
      uydurulmadı. Bütün hamle **tek geri-al adımı**, ve ne kaybedildiği
      toast'ta adıyla yazıyor.
- [x] **Y3 Bir A4'e 1, 2 ya da 4 program.** `.print-sheet` = kâğıt (297×205 mm,
      `break-after` onda), `.print-page` = **bir program** — ad değişmedi çünkü
      onu sayan yarım düzine test var. PDF ile doğrulandı: 4 program per=4'te
      **1 PDF sayfası**, per=2'de 2, per=1'de 4.
- [x] **Y4 6. sütunda saat var artık.** Boş değildi çünkü bozuktu: 6. ders
      hafta içi 13:30, hafta sonu 13:10 başlıyor ve başlık ikisini de
      söyleyemiyordu. `periodGroups()` (`bell.ts`) ikisini de veriyor, başlık
      ikisini de gün aralığıyla yazıyor (`Sal–Cum 13:30–14:10` /
      `Cmt–Pzr 13:10–13:50`). Uyuşan on bir sütunda gün adı **yazılmıyor**.
      Ölçüldü: sütunlar üç düzende de eşit kalıyor (≤1 px).
- [x] **Y5 Sol sütun daraldı.** `--rowhead-w` 8.25rem → **6rem**. Sayı
      ölçüldü: en uzun gömülü branş ("Sosyal Bilgiler") **5.51rem** istiyor.
- [x] **Y6 Kâğıttaki yazı boyutu.** Küçük / Normal / Büyük, ve **düzenden
      bağımsız**. İlk deneme hiç çalışmadı ve bunu ancak ölçüm gösterdi:
      `--fs-p-*` `:root`'ta tanımlıyken çarpanı aşağıda ezmek hiçbir şey
      yapmıyor (tuzak 52'nin ailesi) — dokuz birleşimde de başlık **22,7 px**
      çıkıyordu. Merdiven `.print-area`'ya taşındı.
- [x] **Y7 Günler arası fark belli.** Kendi tokeni: `--day-edge`, 3 px, ve
      ızgaradaki **en kalın** çizgi. Gün bandı güçlendirilmedi — o band ΔE 2,7'de
      bilerek duruyor (tuzak 40).
- [x] **Y8 "Sayfada ne olsun" satırları kırpılmıyor.** `.pick-item`'ın
      `white-space: nowrap`'i çipler için doğru, cümle taşıyan yığılmış satır
      için yanlıştı. **İlk testim yanlış şeyi ölçtü** (satırın sağ kenarını
      panelinkiyle karşılaştırdı) ve bozuk derlemede yeşil geçti; gerçek kusur
      satırın **kendi metnini kırpması**ydı — ölçülen: `"Derslik ve branş —
      Ayn…"`, %150'de iki satır.
- [x] **Y9 Önizleme ile çıktı aynı sayfa.** Değillerdi: önizleme satırı **~30 px**,
      kâğıt satırı **86,93 px**, çünkü `height: 23mm` yalnız `@media print`
      içindeydi. Kutu artık ikisinde de mm cinsinden aynı kutu; ekrana özel
      kalan tek şey kâğıdın **üstünde olmayan** şeyler (gölge, köşe, tepsi).
- [x] **Y10 Kâğıtta çarpı yok.** Öğretmen sayfasındaki kapalı saat işareti
      (× + gri tarama) kalktı; bilgi kaybolmadı, Müsaitlik'te düzenleniyor ve
      Kontrol'de sayılıyor.
- [x] **Y11 Öğretmen sayfasının renkleri SINIFIN rengi.** Ekrandaki kural
      ("hücreyi daima öğretmen rengi boyar") öğretmenin kendi kâğıdında
      dejenere: on iki hücre aynı pastel. **Sınıf sayfası değişmedi.**

#### Bu turda çıkan yeni tuzaklar

- **Tuzak 63** — `:root`'ta tanımlanan bir custom property'nin içindeki
  `var()` **orada** çözülür; aşağıda çarpanı ezmek hiçbir şey yapmaz.
- **Tuzak 64** — bir düzen kusurunu ölçerken **hangi kutunun** taştığına
  bakılır: taşan şey kapsayıcı değil, öğenin kendi metni olabilir.
- **Tuzak 62 yeniden yaşandı**: `npm run build | tail` zincirinde çıkış kodu
  `tail`'inki olur. Derleme kırıldı, testler **bir önceki** `dist`'i ölçtü ve
  hepsi yeşil geçti. `set -o pipefail` şart.

---


---

### 2026-08-27 · Tauri `.exe` — o turun ayrıntı listesi

> **Bu listenin açık maddeleri §7'ye taşındı** (B7.3 SmartScreen · B7.4 Tauri
> yazdırma · B7.5 Windows'ta boyut ve açılış). Aşağısı o günkü kayıt.
>
> **Bir maddesi sonradan ÖLÇÜLDÜ ve plan yanlış çıktı:** son satırdaki
> *"`bundle.icon` `--no-bundle` ile ikonu gömüyor mu"* AB5'te ölçüldü —
> **gömüyordu**, dokuz boyun dokuzu da ikilinin içindeydi. Kayıt burada
> dursun ki bir daha aynı yere bakılmasın (tuzak 101).

#### 2. Tauri ile `.exe` — ayrıntılar (madde 4g–4i)

Babanın makinesi **Windows 10** → Tauri v2 destekliyor, yol açık.
WebView2 bu makinede kurulu (151.0.4129.101). **4g ve 4h 2026-08-27'de bitti;
aşağıdaki liste artık yalnız Windows'ta görülecek olanları sayıyor.**

- [x] **Rust toolchain kuruldu (2026-08-27)** — rustup, `rustc 1.98.0`.
      Yanında Fedora paketleri: `webkit2gtk4.1-devel` (2.52.5) ·
      `libsoup3-devel` (3.6.6) · `gtk3-devel` (3.24.52). Bunlar **Linux**
      derlemesi için; Windows'ta hiçbirine gerek yok (WebView2 işletim
      sistemiyle geliyor)
- [x] **Otomatik günlük yedek — YAPILDI (4h).** Ad `ders-programi-YYYY-AA-GG.json`
      (tahmin edilen `program-…` değil: `folder.ts`'in zaten kullandığı kalıp,
      çünkü budama o kalıba göre yapılıyor ve ikinci bir kalıp ikinci bir kural
      olurdu). Son 10 gün. Tarayıcı yolunda da aynı kod koşuyor
- [x] **Web sürümü bozulmadan derleniyor** — `npm run kontrol` çıkış kodu 0
      (2026-08-27). Exe hiçbir şey eklemedi: `dist/index.html`'e giren tek
      yeni şey `desktop.ts` ve `isDesktop()` köprü yokken `false` dönüyor
- [x] **E2E web sürümünde koşmaya devam ediyor** — 394 test yeşil. Üstüne
      `exe.spec.ts`'in son testi bunu **açıkça** koruyor: köprü yokken aynı
      dosya hâlâ bir tarayıcı sayfası (Klasör seç düğmesi yerinde, "Veriler
      nerede" tarayıcı cümlesini söylüyor)
- [→] **`.exe` boyutu ve açılışı — LINUX'ta ölçüldü, Windows'ta değil.**
      Sürüm ikilisi 3 742 584 bayt (3,64 MB), derleme 1 dk 38 sn, açılıştan
      diske ilk yazıma 986 · 1053 · 1149 ms. **Windows/WebView2 başka bir sayı
      verecek** — orada yeniden ölçülecek
- [→] **Yazdırma Tauri penceresinde çalışıyor mu** (WebView2 yazdırma
      diyaloğu). Linux'ta denenmedi çünkü ölçülecek olan WebKitGTK'nın
      diyaloğu olurdu, babanın göreceği şey değil. A4 yatay ve `@page
      { margin: 0 }` orada da tutuyor mu — Windows koşusunda bakılacak
- [→] **SmartScreen**: imzasız exe'de Windows "bilinmeyen yayıncı" der. README'ye
      tek cümlelik yol yazıldı (*"Daha fazla bilgi" → "Yine de çalıştır"*), ama
      **ekranın gerçekte ne dediği görülmedi** — görülünce cümle düzeltilecek
- [x] **`bundle.icon` `--no-bundle` ile ikonu gömüyor mu**, ölçülmedi. Windows
      koşusunda exe'nin ikonuna bakılacak: sade değil **ayrıntılı** çizim
      görünmeli (48 px ve üstü)

---


---

> **Bu turun tek `[~]` maddesi (4i) sonradan KAPANDI:** iş akışı koşturuldu ve
> üç teslim dosyası bir GitHub Release'e çıktı — v1.4.0, v2.0.0 ve
> **v2.0.1** (`54403b6`). Kalan tek şey exe'nin babanın makinesinde
> denenmesi → **B7.1**.

### 0. v1.0 — teslim turu (`.exe` · site · planlar) — YENİ

Kullanıcının bu dosyanın sonuna yazdığı altı satır, sırayla numaralanmış hâli.
Dal: `v1.0-teslim`, madde başına bir commit, her commit `npm run kontrol` yeşilken.
*(4b ve 4c tek commit'te: taslak ayrı bir varlık değil, aynı veri şeklindeki bir
bayrak — ayırmak bir sonraki commit'te sökülecek geçici bir şekil yazmak olurdu.)*

**SIRADAKİ İŞ: 4f — GitHub Pages yayını.** Tasarım turu (A0–A6 + B) bitti;
`npm run kontrol` yeşil ve 24 görsel referans yenilendi. Teslim turunda
4f–4i (Pages · Tauri · exe) ve 4l (Dosya Sistemi Erişimi) duruyor.
**Kullanıcıdan bekleniyor:** depo `ders-programi` olarak yeniden adlandırılacak,
Pages kaynağı "GitHub Actions" seçilecek, Rust toolchain onayı.

Tasarım turundan devreden **iki** iş, ikisi de bilerek ertelendi:
`<dialog>`'a geçmemiş 12 `confirm` + 5 `alert` (A4'ün yarısı). README
2026-08-27'de yazıldı.

*(Aşağıdaki v1.0 turu notu olduğu gibi duruyor.)* Kullanıcının bu dosyanın
sonuna yazdığı liste o tura dönüştü; listenin *sıralama ve süzme* maddeleri
henüz numaralanmadı ve **en az biri şema değişikliği istiyor** (öğretmende
cinsiyet alanı yok), en az biri yasak listeye bakmayı gerektiriyor (elle
sürükleyerek sıralama). Tasarım turundan sonra
**4f**: GitHub Pages yayını (`.github/workflows/site.yml`). Site derlemesi
hazır ve çevrimdışı çalıştığı ölçüldü; eksik olan yalnız yayınlama adımı.
**Kullanıcıdan iki şey bekleniyor:** depo `ders-programi` olarak yeniden
adlandırılacak ve Pages kaynağı "GitHub Actions" seçilecek.

4e ile birlikte gerçek bir http kaynağı doğdu, yani **4l** (Dosya Sistemi
Erişimi API'si) artık yazılabilir — 4d'de bilerek ertelenmişti, çünkü `file://`
altında o API hiç yok ve sitesiz hâlde E2E'de tek satır kanıt üretilemezdi.

Verilen kararlar (2026-08-25): planlar **depo katmanında** tutulur (`State`
şeması değişmez, göç yok) · exe ile site **ortak bir `.json` dosyası** üzerinden
aynı veriyi gösterir, sitede Dosya Sistemi Erişimi API'siyle otomatik yazma ·
site GitHub Pages'te yayınlanır, **depo `ders-programi` olarak yeniden
adlandırılacak** (kullanıcı yapacak).

- [x] **4a Çözücü kurallar sıkılaşınca çökmüyor.** Turun önüne alındı: babanız
      kural kutularına bir sayı girdiği gün otomatik dizme çalışmaz hâle
      geliyordu. 3/359 blok → **241/359, 241 düğüm, 43 ms**. Ayrıntı:
      [STATUS.md](STATUS.md) → *Sekizinci oturum*
- [x] **4b Plan kitaplığı** — yapıldı. `src/library.ts` (yaprak modül: `State`'i
      bilmez, ham string alıp verir). **Devralma tek bayt kopyalamıyor**:
      `planKey('1') === 'ders-programi'`, yani mevcut program yerinde kalıyor ve
      `ders-programi` okuyan yedek zinciri + E2E yardımcıları değişmedi.
      Üst çubukta seçici, Ayarlar → Veri'de yönetim, geçişte geri-al sıfırlanıyor.
      Ayrıntı: [STATUS.md](STATUS.md) → *Dokuzuncu oturum*
- [x] **4c Taslaklar** — yapıldı. Taslak = `PlanInfo.draft` bayrağı, ayrı varlık
      değil. "Taslak olarak kaydet" yerleşimleri atarak kopyalıyor; yeni plan
      üç yoldan açılıyor (Boş · Bu planın kopyası · Taslaktan); Kurulum'un boş
      ekranı taslakları listeliyor
- [x] **4d Veriler nerede + toplu dosya** — yapıldı. Ayarlar → Veri artık
      **gerçek anahtar adlarını ve gerçek boyutları** yazıyor (`storageReport`),
      ve `src/bundle.ts` ile **bütün planlar tek dosyaya** giriyor
      (`bundleVersion: 1`, `ders-programi-tumu-…json`). Eski tek plan dosyaları
      (v1–v5) aynen okunuyor; üst çubuğa paket verilirse **reddedilip yol
      gösteriliyor** — bir paketi açmak bütün kitaplığın yerine geçmek demek.
      Yeni depolama anahtarı yok, şema değişmedi. Ayrıntı:
      [STATUS.md](STATUS.md) → *Onuncu oturum*
- [x] **4e Site derlemesi + PWA** — yapıldı. `npm run build:site` →
      `dist-site/` (364 KB: tek dosya + manifest + `sw.js` + simgeler).
      `dist/index.html`'e tek bayt dokunulmadı ve **dokunulamaz**:
      `vite.config.ts`'e `publicDir: false` kondu. Site de tek dosya —
      service worker'ın kabuğu böylece bir **sabit**, üretilen bir liste değil.
      Manifest/simge/kayıt betiği yalnız site derlemesinde, bir
      `transformIndexHtml` eklentisiyle ekleniyor. Ölçülen: fiş çekilince site
      yine açılıyor, çevrimdışı girilen veri yeniden yüklemeden sonra duruyor;
      SW kaydı silinince aynı yükleme `ERR_INTERNET_DISCONNECTED` ile düşüyor
      (yani test boş değil). Ayrıntı: [STATUS.md](STATUS.md) → *On birinci oturum*
- [x] **4f GitHub Pages yayını — YAPILDI (2026-08-26).**
      `.github/workflows/site.yml`: `npm ci` → `build:site` →
      `upload-pages-artifact` → `deploy-pages`. Ayrı bir tip adımı yok
      (`build:site` zaten `tsc --noEmit` ile başlıyor). İş akışının kendi
      kontrolü — `dist-site/index.html` ikinci bir betik istemiyor — yerelde
      de koşturuldu. **İş akışının kendisi burada koşturulamaz.**
      Yan ürün, listeleyerek bulundu: `publicDir` `site/`'ın tamamını
      kopyaladığı için üç logo adayı yayınlanan siteye giriyordu;
      `dropStudio()` çıkarıyor.
      **Kullanıcıda kalan iki adım:** depo `ders-programi` olarak yeniden
      adlandırılacak, Pages kaynağı "GitHub Actions" seçilecek
- [x] **4g Tauri kabuğu — YAPILDI (2026-08-27).** `src-tauri/` (Cargo.toml ·
      build.rs · tauri.conf.json · capabilities/default.json · main.rs ·
      lib.rs). Pencere "Ders Programı", 1600×1000, ikon `kurulum/icon.ico`'dan
      (iki çizimli .ico yeniden kullanıldı, ikinci bir kopya yok).
      `frontendDist: ../dist` — yani exe'nin içindeki sayfa **babanın çift
      tıklayacağı dosyanın ta kendisi**, dört teslim yolunda tek arayüz.
      **Yeni runtime bağımlılığı yok**: `withGlobalTauri` + `window.__TAURI__`,
      `@tauri-apps/*` npm paketi **yok** (tuzak 19). Rust tarafında da plugin
      yok — `tauri` ve `std::fs`, o kadar.
      **`--no-bundle`, ve bu bir ilke kararı:** NSIS hedefi kurulum sihirbazı
      üretir, ilke 1 tam olarak onu reddediyor. Teslim tek bir `.exe`.
      Rust yerelde kuruldu (1.98.0) ve **gerçekten derlendi**.
- [x] **4h exe kendiliğinden yazıyor — YAPILDI (2026-08-27).**
      `Belgelerim/Ders Programı/`, `ders-programi-tumu.json` + günün yedeği,
      son 10 gün. Hiçbir tıklama, hiçbir izin, hiçbir seçici yok.
      **Kural kopyalanmadı, ADAPTÖR takıldı:** `folder.ts` hâlâ dosya
      adlarının, günlük yedeğin ve budamanın tek evi; `src/desktop.ts` üç
      Tauri komutunu bir `FileSystemDirectoryHandle` kılığına sokuyor ve
      `saveInto()` exe'de **olduğu gibi** koşuyor. Rust'ta yalnız tarayıcıda
      karşılığı olmayan şey var: hangi klasör + `safe_name` kapısı.
      Yazım **atomik** (tmp + rename): ilke 6, yarım JSON olamaz.
      `storageKind()` üçüncü branch'ini aldı (`'exe'`) — `library.ts`'in
      kendi yorumu bu anı öngörmüştü — ve "Veriler nerede" artık exe'de
      **başka bir şey** söylüyor, çünkü orada "taşınan tek şey dosyaya
      kaydettiğinizdir" yalan olurdu.
      **UÇTAN UCA KANITLANDI:** exe çalıştırıldı, hiçbir şeye tıklanmadan
      `~/Documents/Ders Programı/` altında iki dosya belirdi (`bundleVersion 1`,
      `schemaVersion 6`). Açılıştan ilk yazıma **986 · 1053 · 1149 ms**.
      Testler: 3 birim (`desktop.test.ts` — gerçek `saveInto()` adaptör
      üstünde) + 5 E2E (`exe.spec.ts`) + 6 Rust (`cargo test`).
- [x] **4i Windows `.exe` — iş akışı yazıldı, HENÜZ KOŞMADI.**
      `.github/workflows/surum.yml` (eski adı `exe.yml`; **üç** teslim
      dosyasını birden üretecek şekilde genişletildi, çünkü `npm run …`
      çalıştırmadan indirilebilecek hiçbir şey yoktu). Üç iş:
      `paket` (ubuntu — HTML + kurulum zip'i, artı BOM/CRLF/ASCII denetimi),
      `exe` (windows — `cargo test` + `tauri build --no-bundle`),
      `yayinla` (üçünü bir GitHub Release'e ekler).
      Elle tetiklenince varsayılan olarak **yalnız derler**; `v*` etiketiyle
      yayınlar. **Kabuk denetimleri yerelde koşturuldu** ve ilk hâli yanlıştı:
      `grep` UTF-8 bir yerelde BOM'u eşleştiremiyor, `od`'a çevrildi ve bozuk
      dosyalarla kırmızıya döndürüldü.
      **Bu makinede ölçülen (Linux/WebKitGTK, Windows/WebView2 DEĞİL):** sürüm
      ikilisi **3,64 MB**, derleme 1 dk 38 sn.
      **Kalan:** iş akışı bir kez koşturulmalı ve çıkan exe babanın
      makinesinde denenmeli. SmartScreen notu da o zaman yazılacak — imzasız
      exe'de Windows "bilinmeyen yayıncı" der
- [x] **4k Baskı turu** — babanın gerçek yazdırma önizlemesinde gördükleri.
      Tarayıcının üst/alt bilgisi (sol üstte tarih, sol altta dosya yolu)
      `@page { margin: 0 }` ile kalktı — kenar boşluğu 10 mm padding olarak
      `.print-page`'e taşındı, sütun genişlikleri değişmedi. Başlık iki satır
      oldu: büyük ortalı ana satır + küçük künye satırı. Satırlar 20 → 23 mm ve
      sayfa sabit yükseklikli bir flex kutusu (`safe center`), yani plan dikey
      ortalanıyor. E2E 223 → 228; kanıt olarak `displayHeaderFooter: true` ile
      PDF üretilip **gözle okundu**. *Kullanıcı "baskıdaki program daha da
      büyüsün" dedi — yeni listeye girdi, aşağıya bakınız*
- [x] **4l Dosya Sistemi Erişimi API'si — B4 olarak YAPILDI (2026-08-26).**
      Dosya değil **klasör** seçiliyor (`showDirectoryPicker`): bütün planlar
      + her gün için bir yedek, tek bir soruyla. Ayrıntı aşağıda, B4
- [x] **4j Belgeler — KAPANDI (2026-08-27).** 4b+4c ve 4d ile birlikte ilerledi: yasak liste daraltıldı
      ("birden çok program sürümü" → **aynı planın** sürüm ağacı, gerekçesiyle),
      `library.ts` ve `bundle.ts` mimari şemaya girdi, depolama anahtarı tablosu
      ile **dosya biçimleri** bölümü yazıldı, tuzak 28–30 eklendi (ve iki kez 27
      numaralanmış tuzaklar düzeltildi), test sayıları güncellendi. 4e ile
      **ilke 2'nin yeni hâli** de yazıldı (statik yayın var; backend, veritabanı,
      hesap yok) ve tuzak 31–32 eklendi.
      **Son parça 2026-08-27'de yazıldı:** "Üç derleme hedefi" → **DÖRT**;
      exe'nin `frontendDist`'inin `../dist` olduğu, `--no-bundle`'ın bir ilke
      kararı olduğu ve exe'nin kural kopyalamayıp adaptör taktığı anlatıldı.
      `desktop.ts` ve `scripts/font.mjs` mimari haritaya girdi, komut listesine
      `font`/`exe`/`exe:test` eklendi (ve **neden `kontrol`'ün parçası
      olmadıkları** yazıldı), tuzak 69–71 eklendi


---

### 2026-08-25 · babanın gerçek verisi — o günkü kayıt

> **Bu listenin açık maddeleri §8c'ye taşındı.** Aşağısı o günün kaydı ve
> aradan kapanan tek ölçüm.

#### 1. Babanın gerçek verisiyle deneme

**v0'ın çıkma şartı tek bir şeye bağlı: gerçek veri.** Araç artık kendi tarafında
hazır — 407 birim + 237 E2E + 6 site testi yeşil, üç arayüz turu (v0.7, v0.8, v0.9) bitti ve
program kendi kendini dizebiliyor. Elde veri olmadan yazılacak her yeni özellik
tahmin olur (ilke 5).

- [x] **Sıkışık veride çözücü ne yapıyor?** 2026-08-25'te ölçüldü. Geri sarma artık
      dört dünyada gerçekten çalışıyor (`erken-saat-tuzagi` 201 düğüm / 9 blok,
      `derin-geri-sarma` 8362 / 12, `derslik-darbogazi` 57 929 / 8). Cevap iyi değil:
      gerçek ölçekte tıkanınca bütçeyi doldurup neredeyse hiçbir şey dizemiyor

---

### Kullanıcının yeni yazdığı liste (2026-08-25) — HENÜZ NUMARALANMADI

Aşağısı kullanıcının elle yazdığı hâliyle duruyor. Numaralı maddelere
dönüştürülmeden önce kararları sorulacak — en az biri **şema değişikliği**
istiyor (öğretmende cinsiyet alanı yok) ve en az biri yasak listeye bakmayı
gerektiriyor (elle sürükleyerek sıralama).

Listeleri kaydırabililelim ya da grupça filteleyebilelim. Öğretmenler, Branşlar onlar bunlar
    → **KARŞILANDI** (D7): dört listenin de üstünde ara + sırala + branş/derslik
    çipleri. `src/listview.ts`, Türkçe katlama ve sıralama ile.
Ölçeklendirme büyütme küçültme            → **KARŞILANDI** (A1 + B turu):
Babam biraz zor görüyor o sebeple biraz daha büyütülmeli her şey.
    Ayarlar → Görünüm'de %100–**%150**, 11 basamak. Varsayılan %100 kaldı
    (kullanıcı kararı, 2026-08-25): yanlış bir varsayılan tahmindir.
Öğretmenler listesinde sıralama erkek kadın, branşa göre, isme göre vesaire sıralamalar olsun. ayrıca biz kendimiz sıralayabilelim. drag ve koy gibi. Aynı şekilde tüm listeler öyle özelliklere sahip olsun.
    → **TAMAMEN KARŞILANDI** (D7 + F turu): ada, branşa, yüke, açık saate ve
    **cinsiyete** göre sıralama — dört listede de — artı **elle sürükleyerek
    sıralama** (tutamak + klavye), yine dört listede de. Cinsiyet
    `schemaVersion` 6 istedi; elle sıralama istemedi, çünkü dizinin kendisi
    zaten sıradır.
Ayrıca renk seçmede renkleri seçerken renkleri görebilelim sadece sayı olmasın.
    → **KARŞILANDI** (B turu): 6×6 swatch `<dialog>`'u, 36 rengin hepsi görünür,
    seçili olan çerçeveli. `src/components/ColorPick.tsx`.
Ayrıca programramda sıfırla olmalı ki programı en baştan yapabilelim ama uyarı gelsin ona basınca.
    → **ZATEN VAR**: Ayarlar → Veri'de "Sıfırla", onaylı. Program sekmesinde
    ayrıca "Baştan diz" (o da onaylı) dizilmiş programı silip yeniden dizer.
ayrıca ayarlarda ölçeklendirme de olsun. nasıl olması gerekiyorsa ya da.
    → **KARŞILANDI**: Ayarlar → Görünüm.
Ayarlarda müsatilikteki programda derslerin altında saatleri olsun olmasın diye ayar olsun ve default olarak kapalı olsun.
    → **KARŞILANDI** (D8): Ayarlar → Görünüm, varsayılan kapalı.
Yazdır kısmındaki program da büyümesi lazım.
    → **KARŞILANDI** (D3): `--fs-p-*` merdiveni yükseltildi (başlık 14→17pt,
    gövde 8,5→10pt). 205 mm sayfa ve "3 sınıf = 3 sayfa" testi korundu.
Program kısmında programı sıfırla opsiyonu gelmeli.
    → **KARŞILANDI** (D8): şeritte "Programı boşalt", onaylı, tek geri-al adımı.



UI düzenlemeleri, simetri            → **KARŞILANDI** (D3 + D4)
frontend skills
UI ve desing kısıtlamaları kaldırma  → **KARŞILANDI** (D0)
programda öğretmen ya da sınıf toggle edip programına bakma.
    → **ZATEN VARDI**: Program şeridindeki iki görünüm düğmesi.
her derslik, sınıf ya da öğretmenin üzerine tıklandığında bilgileri ve programının gözükmesi
    → **KARŞILANDI** (D6): varlık paneli. Izgarada satır başından, Kurulum'un üç
    listesinden ve Ctrl+K'dan açılıyor.
normal testler                       → **KARŞILANDI**: 453 birim testi yeşil
E2E testleri en sonda.               → **KARŞILANDI**: 318 E2E + 6 site yeşil
koyu modu düzeltme
    → **KARŞILANDI** (E4): koyulaştırıldı ve iki ölçülmüş kusur onarıldı — gün
    bandı bir DURUM gibi okunuyordu (ΔE 4.67 → 2.45) ve kapalı saatteki soluk
    yazı 4.69 kontrastındaydı (→ 5.71). Yapışkan başlığın gölgesi koyu düzlemde
    hiç görünmüyordu (`--shadow-shell`).
brave'de açık modu açma
    → **ZATEN ÇÖZÜLMÜŞTÜ, gerekçesiyle:** tuzak 14 — `color-scheme` iki temada
    da doğru kurulu, o yüzden Brave açık temalı sayfayı kendi algoritmasıyla
    karartmıyor. **Ama babanın Brave'inde GÖRÜLMEDİ**; hâlâ doğrulanmayı
    bekleyen bir varsayım.
E2E'nin yeni fotolar çekmesini sağlama.
    → **KARŞILANDI** (E7): `npm run ekran` iki temada 17 görüntü çekiyor (üç
    yeni sahne: baskı önizlemesi, Kontrol'ün şeridi, Görünüm'ün hareket
    paneli) ve artık görüntüyü almadan **hareketin bitmesini bekliyor** —
    tuzak 59, bakılarak bulundu.
.exe
    → **BEKLİYOR** (4g–4i): Rust toolchain onayı kullanıcıdan.



---

### Sonraki sürümler — şimdi YAPILMAYACAK

v0 + v0.5 bir dönem kullanılmadan başlanmaz. Öncelik **babanın geri dönütü**.

- **Boşluk (pencere) kuralları** — sınıf ve öğretmen için ayrı ayrı,
  Kapalı / Uyar / Engelle. v0.6'da bilerek yapılmadı (istenen o değildi)
- ~~**v1 Otomatik doldurma**~~ → **v0.9'da yapıldı** (BİTENLER 15). Plandan iki
  sapma: **Web Worker kullanılmadı** (tuzak 19) ve bütçe 500 ms değil, ilerlemesi
  görünen ve durdurulabilen 15 sn — çünkü UI donmuyor ve kullanıcı her an durdurabiliyor
- **v2 Kalite** — yumuşak kısıtlar, hill-climbing ikili takas. **Artık somut bir
  başlangıcı var**: v0.9'un çözücüsü yasal bir program üretiyor ama kalitesi
  ölçülmedi (boşluk, öğretmenin geldiği gün sayısı, gün dengesi). Önce babanın
  "bunu kullanır mıydın" cevabı
- **v3 Dönem içi değişiklik** — "bu hafta MÇ yok" → etkilenenleri işaretle,
  alternatif öner
- ~~koyu tema olsun~~ → **v0.7'de yapıldı** (BİTENLER 13)
- Kapanırken kaydedilmemiş değişiklik uyarısı. *Not: şu an her değişiklik 400 ms
  gecikmeyle otomatik kaydediliyor ve sekme kapanışında anında yazılıyor
  (`store.ts`), yani "kaydedilmemiş" durum pratikte oluşmuyor. Yine de babanın
  içi rahat etsin diye görünür bir "kaydedildi" işareti düşünülebilir.*

> **Bu bölümün altına elle yazılan altı satır** (`.exe` · web sitesi · güzel
> simge ve ad · verilerin nerede durduğu · taslaklar · birden fazla ders planı)
> **ŞİMDİ SIRADA → 0. v1.0 turuna** taşındı ve 4b–4j maddelerine dönüştü.

---


---

### Tasarım araçları kuruldu + tasarım dili yeniden açıldı — 2026-08-25

Kullanıcının "olması gereken her şey" listesi. Listenin bir kısmı projenin
kendi kurallarıyla çatışıyordu; **çatışma bildirildi, kullanıcı tasarım dilini
yeniden açmayı seçti.** Karar `CLAUDE.md` → *"Tasarım dili yeniden AÇILDI"*.

- [x] **`typescript-language-server` 6.0.0** global kuruldu, `$PATH`'te
- [x] **`.mcp.json`** — `playwright` · `chrome-devtools` · `context7`.
      Üçü de npm'de doğrulandı (0.0.79 / 1.8.0 / 4.0.3). Hiçbiri
      `dist/index.html`'e girmez; bütçe daralırsa ilk kapatılacak `context7`
- [x] **`.claude/settings.json`** — `enabledPlugins`:
      `frontend-design` + `typescript-lsp` (`@claude-plugins-official`)
- [x] **`docs/DESIGN.md`** — primitif envanteri: 70+ sınıf, hangi ekranda,
      hangi token merdiveninden. Amaç var olan `.panel`'i yeniden icat etmemek
- [x] **`CLAUDE.md`** — üç blok: primitif envanteri + dış araç, görsel iş akışı
      (iki aşamalı prompt + ekran görüntüsü döngüsü), ve tasarım dili kararı.
      "Karakter" paragrafı **silinmedi**, bağlayıcı olmadığı işaretlendi
- [x] **Eklentiler kuruldu — 7 tane, `project` kapsamı, hepsi `enabled`.**
      `anthropics/skills` marketplace'inin **tamamı** (kullanıcı isteği):
      `document-skills` · `example-skills` · `claude-api` · `academy-guide` ·
      `discernment-nudge`, artı resmi `frontend-design` + `typescript-lsp`.
      Toplam 19 skill, `~/.claude/plugins/` altında 81 MB. VSCode eklentisinin
      **gömülü `claude` ikilisi** kullanıldı (`$PATH`'te yok ama
      `resources/native-binary/claude` var)
- [x] **MCP sunucuları onaylandı** — `playwright` · `chrome-devtools` ·
      `context7` üçü de oturumda kullanılabilir durumda (2026-08-27'de
      doğrulandı)
- [x] **Budama bitti — 7 → 3, kalan ~2.249 tok/oturum.** Kalanlar:
      `example-skills` (12 skill) · `document-skills` (4 skill) ·
      `typescript-lsp` (~0 tok). Kaldırılanlar ve gerekçeleri
      [STATUS.md](STATUS.md) → *On beşinci oturum*; hepsi `claude plugin
      details`in verdiği **ölçülen** maliyetle karara bağlandı,
      `discernment-nudge` ise skill dosyası okunarak (kendi "when not to"
      listesi bu projeyi dışlıyor + kapanış satırı İngilizce sabit)

- [x] **B turu — yeniden tasarım. YAPILDI (2026-08-25).** Ayrıntı:
      [STATUS.md](STATUS.md) → *On altıncı oturum*. Kullanıcının dört kararı:
      kapsam **C** (düzen de değişti), yazı tipi **IBM Plex Sans**, ölçek
      varsayılanı %100 kaldı / tavan **%150**, UX maddelerinden yalnız **renk
      seçici**. Yapılanlar: üç düzlem token seti · gömülü değişken font ·
      üç bölgeli üst çubuk + tema raya indi · **ızgara enstrümanı** (kafes
      kalktı, gün bandı, imleç haçı, nesne olan kartlar) · **havuz sağa
      çekmece** (25/25 satır görünüyor) · 6×6 renk seçici · ölçek tavanı %150.
      Bilerek geri alınanlar: "üçüncü radius yok" (→ üç), "yüzüyorsa yanlıştır"
      (→ iki kot). Yeni tuzaklar **38–41**.
      *(Aşağıdaki asıl madde tarih olarak duruyor.)*

- [x] **B turu — yeniden tasarım. (asıl madde)** Tasarım dilinin
      açılması yeniden tasarımın *yapıldığı* anlamına gelmez. Bu tur
      başlamadan önce `CLAUDE.md` → *"Görsel iş akışı"*ndaki iki aşama
      **zorunlu**: plan → öz eleştiri → onay → kod. Kapsamı kullanıcı
      belirleyecek. Bilinen etkiler:
      - A0–A5'te yazılan sistemin bir kısmı geri alınacak
      - 24 görsel referans yenilenecek (`--update-snapshots=all`, tuzak 25)
      - `renk.spec.ts` WCAG/ΔE ölçümleri yeni değerlere göre geçecek —
        **sınır gevşetilmeyecek, tasarım düzeltilecek** (A6'daki kural aynen)
      - Açılmayanlar: ilke 1–3, yeni runtime bağımlılığı ("önce sor",
        Tailwind/shadcn dahil), ölçülen testler, işlevsel renk kanalı, kâğıt

**A3 (gömülü font) bu kararla genişledi:** artık yalnız IBM Plex Sans değil,
tipografi karakteri de tartışmaya açık. 420 KB durma sınırı **duruyor** —
o bir ilke 1 kısıtı, zevk kısıtı değil.


---

### Tasarım sistemi turu (A0–A6 + B) — BİTTİ ✅

Kullanıcının aşağıdaki numaralanmamış listesi bu tura dönüştü. Çerçeve
`CLAUDE.md` → **"Tasarım sistemi"**; iki yasak kalktı, gerekçeleri
`CLAUDE.md` → **"Değişmez ilkeler — güncelleme"**. Her aşamadan sonra durulup
onay alınıyor. **Görsel referansların hepsi bu turda kırılacak; en sonda tek
seferde yenilenecek — ara aşamalarda `npm run gorsel` çalıştırılmıyor.**
Sayı 22 değil **24**: A1'de `12-ayarlar-gorunum` sahnesi eklendi.

- [x] **A0 Hedef ekran 1366×768 → 1920×1080.** Baba 27" monitör kullanıyor.
      Üç Playwright config; `ekran`/`gorsel` `...base` yaydığı için kendiliğinden
      miras aldı. Viewport değişince 228/228 geçti — asıl risk kırmızı değil,
      **bedava yeşil**di; ölçüldü ve üç iddiadaki yalan sayı düzeltildi
      (`visibleRows 9→18`, `scrollLeft 1200` → sona kaydırma + `room > 200`).
      Hiçbir test silinmedi: 1920×1080'de 6 satır hâlâ katlanın altında.
      `STATUS.md`/`TASKS.md`'deki tarihsel rakamlara dokunulmadı.
      Ayrıntı: [STATUS.md](STATUS.md) → *On ikinci oturum*
- [x] **Y0 Yüzey ve çizgi ayrımı.** Yeni token seti + `--hairline` / `--line`
      ayrımı: kabuk çizgisi 10 kuralda kıl çizgiye indi, veri çizgisi 5 yerde
      kaldı, `table.list/stat`'ın `th`+`td` ortak kuralı ikiye bölündü. Girdiler
      kenarlık yerine **gömük yüzey** (`--paper-sunk`). `.panel.inset`
      kenarlıksız. Gövde `--fs-base`, ızgara `--lh-tight`.
      **Verilen setten üç sapma** (korunan `--shadow`, koyu/baskı bloklarına iki
      token, `--muted` AA düzeltmesi) — gerekçeleri STATUS'te
- [x] **A1 Tipografi merdiveni.** 44 ham px `font-size` → **0** (kalan tek px
      merdivenin çapası, `:root`). `--space-*`/`--cell-*`/`--rail-w` rem'e,
      radius 19 bildirimden 2 değere (`3/6px` — CLAUDE.md'nin yazdığı değerler;
      Y0 sehven 4/8 yazmıştı), ve **Ayarlar → Görünüm** açıldı: %100–%125, altı
      düğme, `localStorage['ders-programi-olcek']`, `State`'e girmiyor.
      Izgara `--ui-scale`'e bağlandı (A5 silindiği için ikinci eksen yok);
      **baskı bağlanmadı** — kâğıt kendi merdivenini aldı (`--fs-p-*`, pt).
      Ölçülen: ızgara %100'de 2616 px, yani rem'e geçiş **piksel kaymasi
      üretmedi**. Ayrıntı: [STATUS.md](STATUS.md) → *On üçüncü oturum*
- [x] **A2 `ch` birimi + inline genişliklerin kaldırılması.** 29 tane
      `style={{ width: N }}` → **0**, ve CSS'teki son iki ham px genişlik
      (`.num` 70, `.text-sm` 90) de `ch`'ye geçti. Altı basamaklı **sütun
      merdiveni** (`--w-col-xs … --w-col-2xl`, `8/10/13/16/26/32ch`).
      `paletteColor()` dönen dinamik `background`'a dokunulmadı.
      **Kural netleşti:** kutu genişliği kutunun kendisine verilir (gövde ch'si),
      sütun genişliği `<th>`'ye (başlığın ch'si) — aynı 70px için 8ch ve 10ch.
      `e2e/sutun.spec.ts`: kaynakta inline genişlik kalmadığı, altı basamağın da
      ölçekle **tam 1.25** büyüdüğü ve dokuz ekranda hiçbir metnin kırpılmadığı.
      Eski px değerleri geri konup **kırmızıya döndürüldü** (6 test).
      Ayrıntı: [STATUS.md](STATUS.md) → *On dördüncü oturum*
- [x] **A5 GERİ GELDİ + A2b birlikte yapıldı** (kullanıcı kararı: "önce A5'i
      geri getir"). Ayarlar → Görünüm'e ikinci bir ayar: **Rahat / Sığdır**.
      Sığdır tam olarak **bir** şeyi düşürüyor ve hangisi olduğu **ölçülerek**
      bulundu: ders numarasının altındaki başlangıç saati. İlk teşhis (kartın
      alt satırı) **yanlıştı** — onu gizlemek tabloyu 1 px oynatmadı; saati
      gizlemek 2461 → **1728 px** yaptı. Sonuç: 1920×1080'de yatay kaydırma
      788 px → **0**, hiçbir kart kırpılmadan. `--cell-w` artık kutudan
      türetiliyor (`clamp` + `100cqw`), sütun sayısı markup'tan geliyor
      (`--lesson-cols`/`--break-cols`) çünkü hafta her zaman 6×12 değil.
      Tercih `localStorage['ders-programi-yogunluk']`, `State`'e girmiyor,
      "Veriler nerede" tablosuna eklendi. Tuzak 37 düzeltildi.
- [x] **A3 Font ve görsel karakter — B turunda yapıldı.** IBM Plex Sans,
      **değişken** yüz (wght 400–600'e kırpılmış), 225 glife alt kümelenmiş,
      **23 KB ham → base64 gömülü**. Ölçülen boyut: `dist/index.html`
      **347 → 379 KB**, sınır 420 KB. `<link>` yok, derlemede ağ yok, yeni npm
      bağımlılığı yok. `font-display: block` (tuzak 38)
- [x] **A4 Dialog ve renk seçici — TAMAMI yapıldı (B turu + 2026-08-27).** Renk seçici
      **6×6 swatch `<dialog>`'u oldu**: 36 rengin hepsi görünüyor, seçili olan
      çerçeveli, indeks swatch'ın üstünde `--on-color` ile duruyor.
      `e2e/renk-secici.spec.ts` **yeniden yazıldı, silinmedi** — gereksinim
      aynı ("seçili renk okunuyor"), kontrol değişti; üstüne "36 renk GÖRÜNÜYOR
      ve seçilebiliyor" testi eklendi (iki tema × iki ekran).
      **Kalan:** 12 `confirm` + 5 `alert`'ün `<dialog>`'a geçmesi ve
      `.reason-bar`'a `aria-live` — B turu dışında bırakılmıştı.
      **`aria-live` 2026-08-27'de yapıldı** (E6): `role="status"` +
      `aria-live="polite"`.
      **KAPANDI (2026-08-27):** `src/` grep'lendi — `window.confirm` /
      `window.alert` çağrısı **sıfır**; her biri `useDialogs()`'un
      `await confirm/alert`'i. Madde artık `[x]` ve yalnız tarih.
- [x] **A6 Doğrulama — B turunda yapıldı.** `npm run kontrol` yeşil
      (409 birim + 265 E2E + 6 site). `renk.spec.ts`'in WCAG/ΔE eşikleri
      **gevşetilmedi**; yeni token seti onları geçmek zorunda kaldı ve geçti.
      24 baseline `--update-snapshots=all` ile tek seferde yenilendi (tuzak 25).
      ~~**Kalan:** README~~ → **yazıldı 2026-08-27** (E6).
- [x] **Kullanıcıya sorulan iki soru — ikisi de cevaplandı (on üçüncü oturum).**
      (a) `.btn` → `--line`, **`--hairline` değil**: düğmenin kendi yüzeyi yok
      (`--paper` üstünde `--paper`), kenarlık tek sınırı. Asıl gürültü
      `.btn.danger`'ın kırmızı kenarlığıydı; o kalktı, kırmızı **mürekkep**
      kaldı. (b) baskı `--ui-scale`'den **etkilenmiyor** — kâğıt sabit fiziksel
      boyut; ölçüldü (%100 ve %125'te punto birebir eşit, PDF 3 ↔ 3 sayfa)
- [x] **A5 ızgara anlamsal zoom** — bir kez silinip **geri getirildi**
      (2026-08-25). Yukarıdaki maddede yapıldı. Numara aynı kaldı çünkü aynı
      özellik: STATUS ve commit mesajlarındaki "A5 silindi" atıfları o günün
      kaydı olarak duruyor, yanıltıcı değil.


---

### BİTENLER

#### 0. Belgeler ✅

- [x] `Claude.md` (yanlışlıkla konmuş boş Access veritabanı) silindi
- [x] `CLAUDE.md` · `docs/STATUS.md` · `docs/TASKS.md`
- [x] `docs/PLAN.md` kararlara göre güncellendi; tuzak 11–13 eklendi

#### 1. İskele ✅

- [x] `package.json` — runtime yalnızca react + react-dom
- [x] `vite.config.ts` — singlefile, `base: './'`, modulePreload polyfill kapalı
- [x] `tsconfig.json` — strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- [x] Komutlar: `dev` · `test` · `test:e2e` · `build` · `kontrol`
- [x] **Çıkma şartı:** tek dosya `dist/index.html` (253 KB), **sıfır ağ çağrısı**

#### 2. Çekirdek mantık ✅ — 26 test

- [x] `src/types.ts`, `src/constraints.ts` (`buildIndex`, `blocker`, `validHours`,
      `blockStart`, `place`, `removeBlock`, `countPlacedHours`, `sanitize`)
- [x] Beş sert kısıt, hepsi somut Türkçe mesaj veriyor
- [x] Bitişik blok ayrımı ve cascade silme dahil test edildi

#### 3. Durum yönetimi ✅

- [x] `useReducer`, geri al/ileri al (30 adım), **Ctrl+Z / Ctrl+Y**
- [x] Metin kutusundayken Ctrl+Z kapılmıyor
- [x] localStorage otomatik kayıt (400 ms gecikmeli) + kapanışta anında yazma
- [x] Açılışta yedek zinciri kaydırma (son 3 oturum)
- [x] Yedek indir / yükle / Sıfırla; bozuk JSON'da çökmüyor
- [x] **Kayıt çalışmıyorsa kalıcı kırmızı uyarı** (sessiz veri kaybı olmasın)
- [x] `src/sample.ts` — gerçek ölçekte deterministik örnek veri

#### 4. Kurulum sekmesi ✅ — 17 test

- [x] Gün/saat düzeni, derslik/öğretmen/sınıf/ders listeleri
- [x] `src/import.ts` — Excel yapıştırma, **önizlemeli**
- [x] Metin kutuları `defaultValue` + `onBlur`
- [x] Silme cascade + ne kadar şeyin gideceğini söyleyen onay

#### 5. Müsaitlik sekmesi ✅

- [x] 7 × 12 ızgara, sürükleyerek toplu boyama (tek geri-al adımı)
- [x] Gün/saat başlığından toplu değiştirme, tümünü aç/kapat
- [x] Yük > müsaitlik ise anında uyarı

#### 6. Program ızgarası ✅

- [x] Satır = öğretmen, sütun = 7 gün × 12 saat, sabit başlıklar
- [x] Blok gösterimi (`rowspan` yok), tıkla → blok tamamen kalkar
- [x] Kart havuzu, öğretmen renginde, `yerleşen/toplam` sayaçlı
- [x] Satırlar `React.memo`

#### 7. Sürükle-bırak ✅ — gerçek tarayıcıda doğrulandı

- [x] Pointer Events; geçerli hücreler sürükleme başında bir kez (0,18 ms)
- [x] `pointermove` sırasında React state güncellenmiyor
- [x] Blok kadar hücre birden vurgulanıyor, Esc iptal, `pointercancel` temizliği
- [x] **Hedef satır sürükleme başlarken görünür alana kaydırılıyor** *(E2E hatası)*
- [x] **Kenar otomatik kaydırma, yalnızca imleç ızgaranın içindeyken** *(E2E hatası)*

#### 8. Yazdırma ✅

- [x] Sayfa başına bir sınıf / bir öğretmen, 7 sütun × 12 satır, A4 dikey
      *(v0.7'de eksen döndü ve sayfa A4 yatay oldu — BİTENLER 13, madde 1j)*
- [x] `print-color-adjust: exact`, üst çubuk gizleniyor, yatay taşma yok

#### 9. Kontrol sekmesi (v0.5) ✅ — 8 test

- [x] Öğretmen / sınıf / derslik kapasitesi, sıkışıklık uyarısı
- [x] Yerleşemeyenler, en sık sebebiyle
- [x] Sorun yoksa net "Sorun görünmüyor"

#### 11. Kod dili İngilizceye çevrildi ✅ — 2026-08-24

Arayüz Türkçe kaldı, tek bir kullanıcı metni değişmedi. Güvenlik ağı: değişiklikten
önce 83 test yeşildi, sonra 90 test yeşil.

- [x] Tipler: `Durum`→`State`, `Ogretmen`→`Teacher`, `Sinif`→`ClassGroup`,
      `Derslik`→`Room`, `Ders`→`Lesson`, `yerlesim`→`placements`,
      `musaitDegil`→`unavailable`, `ayar`→`settings`, `blok`→`blockSize`
- [x] Dosyalar: `constraints.ts` · `feasibility.ts` · `import.ts` · `entities.ts` ·
      `store.ts` · `drag.ts` · `sample.ts` · `types.ts` · `components/` (`Grid`,
      `Setup`, `Availability`, `LessonPool`, `Check`, `Print`, `Program`)
- [x] Yorumlar İngilizceye
- [x] Kullanıcıya görünen metinler Türkçe kaldı; metne göre eleman bulan E2E
      satırları değişmedi
- [x] CSS sınıfları ve değişkenleri İngilizceye (`.grid`, `.drop-ok`, `.target-row`,
      `--color-N`…); `data-gun/saat/satir` → `data-day/hour/row`; `#kok` → `#root`.
      `drag.ts` ve E2E seçicileri birlikte güncellendi
- [x] **`schemaVersion` 2**, `parseState` içinde v1 göç kodu. `id`'ler değişmediği
      için `unavailable`/`placements` anahtarları olduğu gibi taşınıyor
- [x] Göç iki yerde test edildi: birim (`store.test.ts`) **ve** gerçek tarayıcıda
      "Yedek yükle" yolundan (E2E) — babanın elindeki her yedek v1
- [x] **İstisna:** `localStorage` anahtarı ve indirilen yedeğin dosya adı Türkçe
      bırakıldı; onlar kod değil, kullanıcı verisinin kimliği

#### 10. Testler ✅ — 159 test *(v0.7 sonunda 228)*

- [x] 133 birim testi (`constraints`, `feasibility`, `import`, `sample`, `store`,
      `bell`, `rules`, `entities`, `App` duman testi)
- [x] **26 E2E testi** (Playwright, gerçek Chromium, `file://`, 1366×768)
- [x] `file://` altında `localStorage` çalıştığı doğrulandı
- [x] Gerçek ölçekte hız ölçüldü (sürükleme başlangıcı 0,212 ms)

#### 12. v0.6 — zil saatleri, gün seçimi, müsaitlik, kurallar ✅ — 2026-08-24

Babanın aSc ekran görüntülerinden (`docs/Örnek Fotolar/`) çıkarıldı. Şema **v2 → v3**.

- [x] `src/bell.ts` — zil saatleri hesaplanır (başlangıç + ders/teneffüs/öğle arası dk).
      Varsayılan 09:00 · 40 · 10 · 30; hafta içi 5., hafta sonu 6. dersten sonra ara;
      **iki desende de 12. ders 19:10'da biter** (testte açıkça iddia ediliyor)
- [x] Gün seçimi checkbox'a döndü; varsayılan hafta **Pazartesisiz 6 gün** (Salı–Pazar).
      Her günün öğle arası ayrı seçilebilir
- [x] `remapDays()` — gün listesi değişince anahtarlar **isimden** eşlenip taşınır.
      Pazartesi kaldırılınca programın bir gün öne kayması engellendi (PLAN tuzak 14)
- [x] Sınıf ve derslik müsaitliği; üçü de tek `unavailable` sözlüğünü paylaşıyor
- [x] `src/rules.ts` — art arda en fazla · günde en fazla · günde en az ·
      bir dersin günlük sınırı. Her biri Kapalı / Uyar / Engelle
- [x] Okul geneli varsayılan + öğretmen/ders bazında istisna (`null` = varsayılan)
- [x] `check()` → `{ blocked, warning }`; sürüklemede üçüncü renk (sarı) ve
      `.reason-bar.warn`. Bırakmayı yalnızca `blocked` durdurur
- [x] Kontrol sekmesine **Kural ihlalleri** bölümü (`findViolations`), `minPerDay`
      yalnızca burada yakalanır
- [x] Sınıf/derslik kapasitesi artık kapalı saatler düşülerek hesaplanıyor
- [x] Izgara başlığında ders saati, öğle arasında kesikli ayraç; yazdırmada
      `09:00–09:40` sütunu ve okul adı
- [x] `keys.ts` ayrıldı — `constraints.ts` ↔ `rules.ts` çalışma zamanı döngüsü yok
- [x] **v3 göçü** `parseState` içinde (v1 → v2 → v3 zinciri), birim **ve** gerçek
      tarayıcıda "Yedek yükle" yolundan test edildi
- [x] `shortDay()` — `Cuma`/`Cumartesi` ikisi de "Cum" olmuyor (PLAN tuzak 15)

---

#### 13. v0.7 — Arayüz turu ✅ — 2026-08-24

localhost'ta gerçek gözle ilk denemede çıkan liste. Mantık ve veri modeli zaten
sağlamdı; kusurların hepsi görünüş ve kullanım tarafındaydı. Dal:
`v0.7-arayuz-turu`, madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **1a Koyu tema + tema düğmesi.** 16 ham renk kaçağı CSS değişkenine çekildi;
      `:root[data-theme='dark']` yalnızca anlamsal değişkenleri yeniden tanımlıyor;
      `color-scheme` iki temada da doğru kuruluyor. Öğretmen paleti ve üstündeki
      mürekkep dönmüyor; `@media print` her şeyi açık palete sabitliyor. Tercih
      `localStorage['ders-programi-tema']`'da, `State`'e girmiyor
      → *Ölçüm sırasında AÇIK temada iki AA kusuru bulundu ve düzeltildi:
      `--ok` kendi zemininde 4,19:1, kapalı hücredeki "×" 4,20:1 idi.*
- [x] **1b Kurulum yedi adıma bölündü.** `Setup.tsx` 1132 satırdı →
      `components/setup/` altında kabuk + adımlar. Sayaçlı, numaralı şerit; kilitli
      sihirbaz değil. Aynı geçişte testsiz iş mantığı `entities.ts`'e taşındı
      (`addClassesFromRows`, `addLessonsFromRows`, `weeklyLoad`, `hourLabels`)
- [x] **1c Öğle arası ızgarada ayraç sütunu oldu**, zil önizlemesine ara satırı
      eklendi (her desen kendi yerinde). Ayraç `data-day` taşımıyor
- [x] **1d Müsaitlik döndürüldü**: satır = gün, sütun = ders. `shortDay` Pazar →
      `Pzr`. `bell.ts` → `sharedPeriods()` (uyuşmayan saat yazılmaz)
- [x] **1e Kısaltma otomatik**: `makeShort()` tek eve taşındı, `addTeacher` boş
      kısaltmayı addan üretiyor, çakışma uyarısı adları sayıyor
- [x] **1f Yedek düğmeleri** "Dosyaya kaydet / Dosyadan aç"; "Sıfırla" ayrıldı;
      açıklama satırı Program sekmesinde gizli (ızgaradan bir satır götürüyordu)
- [x] **1g Görsel cila**: hizalama, `:focus-visible`, dört düğme durumu, satır içi
      stiller sınıflara, `--space-1..5` ölçeği, `Field` bileşeni
- [x] **1h Silme onayı dört varlıkta da her zaman**, metin ne gideceğini sayıyor
      (`deletionSummary`, 7 testli)
- [x] **1i Branş kısaltmaları — şema v3 → v4.** Yalnızca değiştirilen saklanıyor;
      göç birim **ve** gerçek tarayıcıda "Dosyadan aç" yolundan doğrulandı
- [x] **1j Baskı A4 yatay, eşit sütunlu, eksen dönmüş.** PDF'in MediaBox'ı
      ölçülüyor (842×595 pt)
- [x] **1k Görünüm iki simge düğmesi**, seçili basılı (`aria-pressed`/`aria-label`)
- [x] **1l Testler**: 133 → **177 birim**, 26 → **51 E2E**. Renk kontrastı ve renk
      ayrımı hesaplanarak ölçülüyor (WCAG + CIE Lab ΔE). `npm run ekran` iki temada
      beş ekran görüntüsü üretiyor
- [x] **1m Belgeler**: `CLAUDE.md` (şema v4, arayüz, mimari, tuzak 13–15),
      `docs/PLAN.md`, `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:** kural sayılarına varsayılan konmadı (0 = sınır yok kaldı) —
doğru cevabı okuldan okula değişir, yanlış varsayılan hücreleri sessizce kırmızıya
boyar (2026-08-24 kararı).

---

#### 14. v0.8 — ikinci arayüz turu ✅ — 2026-08-25

localhost'ta gerçek gözle **ikinci** denemede çıkan liste. Dal: `v0.8-arayuz-turu-2`,
madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **2a Palet 12 → 36 renk, CSS'ten TS'e.** Her öğretmen kendi renginde;
      `firstFreeColor()` kullanılmayan en küçük indeksi verir, silinen rengi yeniden
      kullanır. Renkler elle seçilmedi, **arandı** (en uzak nokta / CIE Lab, kontrast
      kısıtı altında). Ölçülen: en yakın çift ΔE **17,5** (eski 12'lik palette 13,4),
      art arda indeksler 23,8, kontrast 7,3:1 ve 4,7:1
- [x] **2b Şema v4 → v5**: `ClassGroup.color` + `settings.subjects`. `spreadColors()`
      her yüklemede çalışıyor — v4 dosyaları 12 renkle yazıldığı için çakışma kesin;
      renkleri zaten tekil olan dosya dokunulmadan geçiyor
- [x] **2c Ayarlar sekmesi.** Kurulum 7 → **4** adım (Derslikler · Öğretmenler ·
      Sınıflar · Dersler); Ayarlar 4 bölüm (Okul ve zil · Kurallar · Branşlar · Veri).
      `School`/`Rules`/`Subjects` taşındı, yeniden yazılmadı; `Field`/`LimitBox`/
      `props` bir üst klasöre çıktı, `SetupProps` → `PanelProps`.
      **`Sıfırla` üst çubuktan Ayarlar → Veri'ye taşındı**
- [x] **2d Branş listeden seçiliyor.** "+ Yeni branş…" oracıkta ekliyor; yapıştırılan
      listedeki tanınmayan branş da listeye giriyor (`addTeachersFromRows`).
      Kullanılan branş silinemiyor, mesaj kimin kullandığını sayıyor
- [x] **2e Başlangıç saati iki açılır liste** (00–23, beşer dakika). Yan fayda: kutuyu
      boşaltıp günü sessizce 00:00'a alma tuzağı ortadan kalktı
- [x] **2f Havuz görünümü takip ediyor** *(bildirilen hata)*. `buildPool` `view` almıyordu
- [x] **2g Simgeler**: öğretmen = mezuniyet kepi, sınıf = öğrenci grubu (aSc'nin sözlüğü)
- [x] **2h Öğle arası 10 → 6 px, çarpı 11 → 16 px.** Asıl hata boyut değildi: `.break-col`
      genişliği `table.grid tbody td` tarafından **eziliyordu**, ayraç bir ders kadar
      genişti. Baskıdaki `table.print th td.p-closed` seçicisi de hiç eşleşmiyordu
- [x] **2i Kapalı saatte kalan ders kırmızı işaretleniyor, SİLİNMİYOR** (ilke 6).
      `closedConflicts()`; Kontrol'de tek tek listeleniyor, Müsaitlik'te sayılıyor
- [x] **2j Yazdırmada sayfa seçimi.** Dışarıda bırakılanlar tutuluyor, ki sonradan
      eklenen sınıf kendiliğinden bassın. Seçim `App`'te — sekme değişince silinmesin
- [x] **2k Testler**: 177 → **219 birim**, 51 → **87 E2E**. Her madde için en az bir
      gerçek-tarayıcı iddiası; renk ayrımı, ayraç genişliği ve yazı boyu **ölçülüyor**
- [x] **2l Belgeler**: `CLAUDE.md` (altı sekme, `palette.ts`, şema v5, tuzak 16–18),
      `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:** kapalı saatteki dersleri toplu kaldıran düğme konmadı —
kullanıcı "kaldırma, kırmızı işaretle" dedi; kararı baba veriyor (2026-08-25 kararı).

---

#### 15. v0.9 — otomatik dizme, sol kenar çubuğu, sağ tık, tam E2E ✅ — 2026-08-25

Kullanıcının TASKS sonuna yazdığı dört madde. Dal: `v0.9-otomatik-dizme`,
madde başına bir commit, her commit `npm run kontrol` yeşilken.

- [x] **3a E2E tek dosyadan yedi dosyaya.** `e2e/app.spec.ts` 2151 satırdı; ortak
      yardımcılar `e2e/helpers.ts`'e, testler konularına dağıldı. Tek test silinmedi.
      `fullyParallel` + `workers: 4` — `file://` altında context başına ayrı
      `localStorage` olduğu **ölçüldü**: 66 sn → 16 sn
- [x] **3b Sekmeler üstten sola.** 92px kenar çubuğu (daraltılınca 52px), tercih
      `localStorage['ders-programi-kenar']`'da. Gerekçe ölçüye dayanıyor: yatay şerit
      768px'lik ekranda ızgaradan bir öğretmen satırı götürüyordu. `.main`
      sarmalayıcısı altı bileşenden `App`'e alındı; `.topbar-note` satır içi oldu ve
      "Program'da gizle" özel durumu kalktı
- [x] **3c Her sekmenin sağ tarafı dolduruldu.** `.list.narrow/mid/wide` (520/640/720px)
      silindi, Müsaitlik hücresi 46px **sabit**ken **minimum** oldu. Tek düzen kuralı
      `.cols`. Sağa konan hiçbir bilgi yeni değil: Kurulum'da kapasite özeti (yeni
      `Summary.tsx`, `buildCapacity` ile — `buildReport`'un pahalı yarısı her tuş
      vuruşunda çalışamaz, tuzak 3), Ayarlar → Okul'da zil önizlemesi, Kurallar'da
      canlı ihlal listesi, Müsaitlik'te 25 öğretmeni birden gösteren liste,
      Yazdır'da sayfa seçimi. Kontrol'de akan kart ızgarası (`.panel-grid`)
- [x] **3d Basılı düğmenin iki çelişen tanımı** birleşti (özgüllük hatası:
      `:hover:not(:disabled)` (0,3,0), `[aria-pressed]` (0,2,0)'ı yeniyordu).
      `Field` `wide` prop'u aldı
- [x] **3e Sol tık taşır, sağ tık siler**, Delete klavye eşdeğeri. İki tuzak kapatıldı:
      ders kendini engelliyordu (harita artık kaynağı kaldırılmış durum üstünde) ve
      ızgaradan kart alınınca ızgara zıplıyordu (`scrollIntoView` yalnız havuz için)
- [x] **3f `src/solver.ts`** — MRV + forward checking + iz tabanlı geri sarma, ana iş
      parçacığında dilimli. Kısıt mantığı **yeniden yazılmadı**: her soru `blocker()`'a
      gidiyor. `constraints.ts`'e `occupy`/`vacate` eklendi (7 eşdeğerlik testi).
      **Ölçülen: 359/359 blok, 359 düğüm, 87 ms, hiç geri sarma yok**
- [x] **3g Arayüz**: iki düğme, `.reason-bar`'da ilerleme ve sonuç, tek geri-al adımı.
      Koşu `App`'te yaşıyor (tuzak 18). Sonucun sessizce atıldığı gerçek hata
      bulundu ve düzeltildi (tuzak 20)
- [x] **3h Kapsam boşlukları**: 87 → **176 E2E**. Yeni `duzen.spec.ts`,
      `kontrol.spec.ts`, `bos-ekran.spec.ts`, `otomatik.spec.ts`; Kurulum'un düzenleme
      yolları, Ayarlar'ın her alanı (ortadan gün çıkarma dahil — tuzak 11'in ilk
      tarayıcı kanıtı), geri-al zinciri, hata yolları, kayıt uyarısının GÖRÜNMESİ,
      klavye gezinme
- [x] **3i Görsel regresyon**: 20 referans, `ekran.spec.ts` ile **aynı** `SCENES`
      listesi. Ayrı komut (`npm run gorsel`), `kontrol`'e bağlı değil — gerekçe
      sistem fontu. Testin kendisi test edildi: 92px → 120px, 20'den 18'i kırmızı
- [x] **3j Belgeler**: `CLAUDE.md` (tuzak 19–22, kenar çubuğu, `solver.ts`, test
      tablosuna beşinci satır), `docs/STATUS.md`, `docs/TASKS.md`

**Yapılmadı, bilerek:**
- **Çözücüye ayar konmadı** — iki düğme, kutucuk yok. "Sabaha yay", "günleri dengele"
  gibi tercihlerin doğru cevabı bir dönem kullanılmadan bilinemez (ilke 5)
- **Web Worker kullanılmadı** — tek dosya + `file://` ile çalışmıyor (tuzak 19)
- **Görsel regresyon `kontrol`'e konmadı** — referans tek makine için doğru
- **Simetri kırma kaldırıldı** — teoride doğru, ölçüldüğünde felaket (tuzak 21)

---
